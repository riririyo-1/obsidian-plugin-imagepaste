import { App, PluginSettingTab, Setting } from "obsidian";
import ImagePastePlugin from "./main";


// -- ヘルパー関数 --------------
function createFragment(
  callback: (frag: DocumentFragment) => void
): DocumentFragment {
  const frag = document.createDocumentFragment();
  callback(frag);
  return frag;
}

// -- 設定の型定義 --------------
export interface ImagePasteSettings {
  imageFolderPath: string;
  namePrefix: string;
  defaultName: string;
  insertPattern: string;
}

// -- デフォルト設定 --------------
export const DEFAULT_SETTINGS: ImagePasteSettings = {
  imageFolderPath: "${currentFileDir}/images",
  namePrefix: "${currentFileNameWithoutExt}-",
  defaultName: "image-YYMMDD-HHmmss",
  insertPattern:
    "<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>",
};

// -- 設定タブの実装 --------------
export class ImagePasteSettingTab extends PluginSettingTab {
  plugin: ImagePastePlugin;

  constructor(app: App, plugin: ImagePastePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.addClass("image-paste-settings");

    // タイトル
    containerEl.createEl("h2", { text: "Image Paste Settings" });

    // 画像保存フォルダ
    new Setting(containerEl)
      .setName("保存先フォルダ")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("画像を保存するフォルダパス。");
          frag.createEl("br");
          frag.appendText("例：${currentFileDir}/images");
        })
      )
      .addText((text) =>
        text
          .setPlaceholder("${currentFileDir}/images")
          .setValue(this.plugin.settings.imageFolderPath)
          .onChange(async (value) => {
            this.plugin.settings.imageFolderPath = value;
            await this.plugin.saveSettings();
          })
      );

    // ファイル名接頭辞
    new Setting(containerEl)
      .setName("接頭辞")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("画像ファイル名の接頭辞。");
          frag.createEl("br");
          frag.appendText("例：${currentFileNameWithoutExt}-");
        })
      )
      .addText((text) =>
        text
          .setPlaceholder("${currentFileNameWithoutExt}-")
          .setValue(this.plugin.settings.namePrefix)
          .onChange(async (value) => {
            this.plugin.settings.namePrefix = value;
            await this.plugin.saveSettings();
          })
      );

    // ファイル名本体
    new Setting(containerEl)
      .setName("命名ルール")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("画像ファイルの命名ルール。");
          frag.createEl("br");
          frag.appendText("例：image-YYMMDD-HHmmss");
        })
      )
      .addText((text) =>
        text
          .setPlaceholder("image-YYMMDD-HHmmss")
          .setValue(this.plugin.settings.defaultName)
          .onChange(async (value) => {
            this.plugin.settings.defaultName = value;
            await this.plugin.saveSettings();
          })
      );

    // 挿入パターン
    new Setting(containerEl)
      .setName("挿入パターン")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("エディタに画像をペーストする際に挿入するHTML/Markdown。");
          frag.createEl("br");
          frag.appendText(
            "例：<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>"
          );
        })
      )
      .addTextArea((text) => {
        text
          .setPlaceholder(
            "<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>"
          )
          .setValue(this.plugin.settings.insertPattern)
          .onChange(async (value) => {
            this.plugin.settings.insertPattern = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 1;
        text.inputEl.cols = 100;
      });

    // 例のセクション
    const exampleSection = containerEl.createDiv("example-section");
    exampleSection.createDiv("example-title").setText("使用例");

    const exampleContent = exampleSection.createDiv("example-content");
    exampleContent.appendText("接頭辞='${currentFileNameWithoutExt}-'");
    exampleContent.createEl("br");
    exampleContent.appendText("命名ルール='image-YYMMDD-HHmmss'");
    exampleContent.createEl("br");
    exampleContent.createEl("br");
    exampleContent.appendText("→ MarkDownName-image-241105-143020.png");
  }
}
