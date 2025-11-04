import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TextAreaComponent,
  TextComponent,
} from "obsidian";
import { ImagePasteSettings } from "./types";
import { validateRelativePath } from "./utils/path";

export const DEFAULT_SETTINGS: ImagePasteSettings = {
  imageFolderPath: "${currentFileDir}/images",
  defaultName: "image${timestamp}",
  namePrefix: "${currentFileNameWithoutExt}_",
  insertPattern:
    "<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>",
  supportedFormats: ["png", "jpg", "gif"],
};

export interface SettingsHost extends Plugin {
  settings: ImagePasteSettings;
  updateSettings: (value: Partial<ImagePasteSettings>) => Promise<void>;
}

interface FieldContext {
  textComponent: TextComponent | TextAreaComponent;
  errorEl: HTMLElement;
}

export function sanitizeSettings(
  settings: ImagePasteSettings
): ImagePasteSettings {
  return {
    imageFolderPath:
      settings.imageFolderPath?.trim() ?? DEFAULT_SETTINGS.imageFolderPath,
    defaultName: sanitizeTemplate(
      settings.defaultName,
      DEFAULT_SETTINGS.defaultName
    ),
    namePrefix: sanitizeTemplate(
      settings.namePrefix,
      DEFAULT_SETTINGS.namePrefix
    ).slice(0, 64),
    insertPattern: sanitizeTemplate(
      settings.insertPattern,
      DEFAULT_SETTINGS.insertPattern
    ),
    supportedFormats: sanitizeFormats(settings.supportedFormats),
  };
}

export class ImagePasteSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly host: SettingsHost) {
    super(app, host);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Image Paste 設定" });
    const usage = containerEl.createEl("div", {
      cls: "imagepaste-setting-usage",
    });
    usage.createEl("p", { text: "ショートカット: Cmd + Alt + V" });
    usage.createEl("p", { text: "貼り付け時に設定値が即時反映されます。" });
    usage.createEl("p", {
      text: "画像は指定フォルダに保存され、`${imageFileName}` で挿入先へ展開されます。",
    });

    console.log("ImagePaste: Rendering settings tab");
    console.log("ImagePaste: Current settings:", this.host.settings);

    try {
      this.renderFolderPathSetting(containerEl);
      console.log("ImagePaste: Rendered folder path setting");
    } catch (error) {
      console.error("ImagePaste: Error rendering folder path setting:", error);
    }

    try {
      this.renderNamePrefixSetting(containerEl);
      console.log("ImagePaste: Rendered name prefix setting");
    } catch (error) {
      console.error("ImagePaste: Error rendering name prefix setting:", error);
    }

    try {
      this.renderDefaultNameSetting(containerEl);
      console.log("ImagePaste: Rendered default name setting");
    } catch (error) {
      console.error("ImagePaste: Error rendering default name setting:", error);
    }

    try {
      this.renderInsertPatternSetting(containerEl);
      console.log("ImagePaste: Rendered insert pattern setting");
    } catch (error) {
      console.error(
        "ImagePaste: Error rendering insert pattern setting:",
        error
      );
    }

    try {
      this.renderSupportedFormatsSetting(containerEl);
      console.log("ImagePaste: Rendered supported formats setting");
    } catch (error) {
      console.error(
        "ImagePaste: Error rendering supported formats setting:",
        error
      );
    }
  }

  private renderFolderPathSetting(containerEl: HTMLElement): void {
    const setting = new Setting(containerEl)
      .setName("画像保存先フォルダパス")
      .setDesc(
        "画像を保存するフォルダを指定します。Vault 内の相対パスを使用できます。"
      );

    const context = this.createFieldContext(setting);
    context.textComponent.setPlaceholder("${currentFileDir}/images");
    context.textComponent.setValue(this.host.settings.imageFolderPath);
    context.textComponent.onChange(async (value) => {
      const trimmedValue = value.trim();
      try {
        if (trimmedValue) {
          validateRelativePath(trimmedValue);
        }
        await this.host.updateSettings({ imageFolderPath: trimmedValue });
        this.setFieldError(context, "");
      } catch (error) {
        this.setFieldError(
          context,
          error instanceof Error
            ? error.message
            : "パスの形式が正しくありません。"
        );
      }
    });
  }

  private renderNamePrefixSetting(containerEl: HTMLElement): void {
    const setting = new Setting(containerEl)
      .setName("画像命名接頭辞")
      .setDesc(
        "ファイル名の先頭に付与する文字列です。空にすると接頭辞なしになります。"
      );
    const context = this.createFieldContext(setting);
    context.textComponent.setValue(this.host.settings.namePrefix);
    context.textComponent.onChange(async (value) => {
      const trimmedValue = value.trim().slice(0, 64);
      await this.host.updateSettings({ namePrefix: trimmedValue });
      this.setFieldError(context, "");
    });
  }

  private renderDefaultNameSetting(containerEl: HTMLElement): void {
    const setting = new Setting(containerEl)
      .setName("画像命名ルール")
      .setDesc(
        "ファイル名の本体部分です。`${timestamp}` などの変数を使用できます。"
      );
    const context = this.createFieldContext(setting);
    context.textComponent.setValue(this.host.settings.defaultName);
    context.textComponent.onChange(async (value) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        this.setFieldError(context, "空の値は設定できません。");
        context.textComponent.setValue(this.host.settings.defaultName);
        new Notice("画像命名ルールは空にできません。");
        return;
      }
      await this.host.updateSettings({ defaultName: trimmedValue });
      this.setFieldError(context, "");
    });
  }

  private renderInsertPatternSetting(containerEl: HTMLElement): void {
    const setting = new Setting(containerEl)
      .setName("画像挿入パターン")
      .setDesc(
        "ノートへ挿入する Markdown/HTML テンプレートを指定します。改行を含む場合は \\n を使用してください。"
      );
    const context = this.createFieldContext(setting, "textarea");
    (context.textComponent as TextAreaComponent).setValue(
      this.host.settings.insertPattern
    );
    context.textComponent.onChange(async (value) => {
      const trimmedValue = value.trim();
      if (!trimmedValue.includes("${imageFileName}")) {
        this.setFieldError(context, "必ず ${imageFileName} を含めてください。");
        new Notice("挿入パターンに ${imageFileName} を含める必要があります。");
        return;
      }
      await this.host.updateSettings({ insertPattern: trimmedValue });
      this.setFieldError(context, "");
    });
  }

  private renderSupportedFormatsSetting(containerEl: HTMLElement): void {
    const setting = new Setting(containerEl)
      .setName("画像形式")
      .setDesc(
        "貼り付けを許可する画像フォーマットの一覧です。JSON 配列で指定してください。"
      );

    const context = this.createFieldContext(setting, "textarea");
    const currentValue = JSON.stringify(this.host.settings.supportedFormats);
    (context.textComponent as TextAreaComponent).setValue(currentValue);
    context.textComponent.onChange(async (value) => {
      const trimmedValue = value.trim();
      try {
        const parsed = JSON.parse(trimmedValue);
        if (!Array.isArray(parsed)) {
          throw new Error("配列形式で指定してください。");
        }
        const sanitized = sanitizeFormats(parsed);
        if (!sanitized.length) {
          throw new Error("少なくとも 1 つ形式を指定してください。");
        }
        await this.host.updateSettings({ supportedFormats: sanitized });
        (context.textComponent as TextAreaComponent).setValue(
          JSON.stringify(sanitized)
        );
        this.setFieldError(context, "");
      } catch (error) {
        this.setFieldError(
          context,
          error instanceof Error
            ? error.message
            : "JSON の形式が正しくありません。"
        );
      }
    });
  }

  private createFieldContext(
    setting: Setting,
    type: "text" | "textarea" = "text"
  ): FieldContext {
    const errorEl = setting.settingEl.createDiv({
      cls: "imagepaste-setting-error",
    });
    let textComponent: TextComponent | TextAreaComponent;

    if (type === "textarea") {
      setting.addTextArea((text) => {
        text.inputEl.rows = 3;
        textComponent = text;
      });
    } else {
      setting.addText((text) => {
        textComponent = text;
      });
    }

    return { textComponent: textComponent!, errorEl };
  }

  private setFieldError(context: FieldContext, message: string): void {
    context.errorEl.setText(message);
    context.errorEl.toggleClass("is-visible", Boolean(message));
  }
}

function sanitizeTemplate(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeFormats(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return DEFAULT_SETTINGS.supportedFormats;
  }
  const unique = Array.from(
    new Set(
      input
        .map((entry) =>
          typeof entry === "string" ? entry.trim().toLowerCase() : ""
        )
        .filter((entry) => entry.length > 0)
    )
  );
  return unique.length ? unique : DEFAULT_SETTINGS.supportedFormats;
}
