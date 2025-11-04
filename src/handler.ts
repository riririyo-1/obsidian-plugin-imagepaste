import { App, MarkdownView, Notice } from "obsidian";
import { ClipboardImage, ImagePasteSettings, TemplateVariables } from "./types";
import { sanitizeBaseName, clampNameLength } from "./utils/sanitize";
import { buildTemplateVariables, combinePath, ensureFolderExists, expandFolderPath, expandTemplate, formatTimestamp } from "./utils/path";

const MAX_DUPLICATE_ATTEMPTS = 100;

export class PasteImageHandler {
  private processing = false;

  constructor(private readonly app: App, private readonly getSettings: () => ImagePasteSettings) {}

  async handlePaste(): Promise<void> {
    if (this.processing) {
      new Notice("画像を処理中です。少し待ってから再度お試しください。");
      return;
    }

    const editor = this.getEditor();
    if (!editor) {
      new Notice("アクティブなエディタが見つかりません。ノートを開いてから実行してください。");
      return;
    }

    const file = this.app.workspace.getActiveFile();
    const settings = this.getSettings();

    if (!settings.supportedFormats.length) {
      new Notice("貼り付け可能な画像形式が設定されていません。設定画面を確認してください。");
      return;
    }

    this.processing = true;
    try {
      const clipboardImage = await this.readClipboard(settings.supportedFormats);
      if (!clipboardImage) {
        new Notice("クリップボードに画像が見つかりません。");
        return;
      }

      const normalizedFormat = normalizeFormat(clipboardImage.format);
      if (!isFormatAllowed(normalizedFormat, settings.supportedFormats)) {
        new Notice(`サポート外の画像形式です（${normalizedFormat}）。許可されている形式: ${settings.supportedFormats.join(", ")}`);
        return;
      }

      const timestamp = formatTimestamp();
      const variables = buildTemplateVariables(this.app, file, normalizedFormat, { timestamp });
      const folderPath = this.resolveFolderPath(settings.imageFolderPath, variables);
      const baseName = this.buildBaseName(settings.namePrefix, settings.defaultName, variables);
      const fileName = await this.generateUniqueFileName(folderPath, baseName, normalizedFormat);
      const targetPath = combinePath(folderPath, fileName);

      await ensureFolderExists(this.app, folderPath);
      await this.app.vault.adapter.writeBinary(targetPath, clipboardImage.arrayBuffer);

      const finalVariables = buildTemplateVariables(this.app, file, normalizedFormat, {
        imageFileName: fileName,
        timestamp,
      });
      const insertText = this.buildInsertText(settings.insertPattern, finalVariables, fileName);
      editor.replaceSelection(insertText);
    } catch (error) {
      console.error("画像貼り付けに失敗しました:", error);
      new Notice("画像の貼り付けに失敗しました。詳細は Console を確認してください。");
    } finally {
      this.processing = false;
    }
  }

  private getEditor() {
    return this.app.workspace.activeEditor?.editor ?? this.app.workspace.getActiveViewOfType(MarkdownView)?.editor ?? null;
  }

  private async readClipboard(supportedFormats: string[]): Promise<ClipboardImage | null> {
    const electronResult = await this.readFromElectronClipboard(supportedFormats);
    if (electronResult) {
      return electronResult;
    }

    return this.readFromNavigatorClipboard(supportedFormats);
  }

  private async readFromElectronClipboard(supportedFormats: string[]): Promise<ClipboardImage | null> {
    try {
      const electron = (window as unknown as { require?: (module: string) => any }).require?.("electron");
      if (!electron) {
        return null;
      }
      const nativeImage = electron.clipboard.readImage();
      if (!nativeImage || nativeImage.isEmpty()) {
        return null;
      }
      const pngBuffer: Uint8Array = nativeImage.toPNG();
      if (!pngBuffer || pngBuffer.byteLength === 0) {
        return null;
      }
      if (!isFormatAllowed("png", supportedFormats)) {
        return null;
      }
      const arrayBuffer = pngBuffer.buffer.slice(pngBuffer.byteOffset, pngBuffer.byteOffset + pngBuffer.byteLength);
      return { arrayBuffer, format: "png" };
    } catch (error) {
      console.error("Electron クリップボードの取得に失敗しました:", error);
      return null;
    }
  }

  private async readFromNavigatorClipboard(supportedFormats: string[]): Promise<ClipboardImage | null> {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      return null;
    }

    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (!type.startsWith("image/")) {
            continue;
          }
          const format = normalizeFormat(type.split("/")[1] ?? "");
          if (!isFormatAllowed(format, supportedFormats)) {
            continue;
          }
          const blob = await item.getType(type);
          const arrayBuffer = await blob.arrayBuffer();
          return { arrayBuffer, format };
        }
      }
      return null;
    } catch (error) {
      console.error("Navigator クリップボードの取得に失敗しました:", error);
      return null;
    }
  }

  private resolveFolderPath(template: string, variables: TemplateVariables): string {
    try {
      return expandFolderPath(this.app, template, variables);
    } catch (error) {
      new Notice(error instanceof Error ? error.message : "保存先フォルダの解決に失敗しました。");
      throw error;
    }
  }

  private buildBaseName(prefixTemplate: string, defaultTemplate: string, variables: TemplateVariables): string {
    const prefix = expandTemplate(prefixTemplate, variables);
    const main = expandTemplate(defaultTemplate, variables);
    const raw = `${prefix}${main}`;
    return sanitizeBaseName(raw);
  }

  private async generateUniqueFileName(folderPath: string, baseName: string, format: string): Promise<string> {
    const adapter = this.app.vault.adapter;
    const extension = format || "png";
    for (let attempt = 0; attempt <= MAX_DUPLICATE_ATTEMPTS; attempt += 1) {
      const suffix = attempt === 0 ? "" : ` (${attempt})`;
      const candidateBase = sanitizeBaseName(`${baseName}${suffix}`);
      const fileName = clampNameLength(candidateBase, extension);
      const candidatePath = combinePath(folderPath, fileName);
      const exists = await adapter.exists(candidatePath);
      if (!exists) {
        return fileName;
      }
    }
    throw new Error(`ファイル名の重複回避に失敗しました（試行回数: ${MAX_DUPLICATE_ATTEMPTS}）。`);
  }

  private buildInsertText(pattern: string, variables: TemplateVariables, fileName: string): string {
    let template = pattern;
    if (!template.includes("${imageFileName}")) {
      new Notice("挿入テンプレートに ${imageFileName} が含まれていないため、デフォルトの形式で挿入します。");
      template = "![[${imageFileName}]]";
    }
    const expanded = expandTemplate(template, { ...variables, imageFileName: fileName });
    return expanded.replace(/\\n/g, "\n");
  }
}

function normalizeFormat(format: string): string {
  const lowered = format.toLowerCase();
  if (lowered === "jpeg") {
    return "jpg";
  }
  return lowered;
}

function isFormatAllowed(format: string, supportedFormats: string[]): boolean {
  const normalizedFormats = supportedFormats.map((entry) => normalizeFormat(entry));
  return normalizedFormats.includes(format);
}
