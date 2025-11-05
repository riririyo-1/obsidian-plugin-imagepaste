import { App, PluginSettingTab, Setting } from "obsidian";
import ImagePastePlugin from "./main";


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
	namePrefix: "${currentFileNameWithoutExt}_",
	defaultName: "image-YYMMDD-HHmmss",
	insertPattern: "<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>",
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

		// タイトル
		containerEl.createEl("h2", { text: "Image Paste Settings" });

		// 画像保存フォルダ
		new Setting(containerEl)
			.setName("画像保存フォルダ")
			.setDesc("画像を保存するフォルダパス。変数: ${currentFileDir}")
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
			.setName("ファイル名接頭辞")
			.setDesc("ファイル名の接頭辞。変数: ${currentFileNameWithoutExt}")
			.addText((text) =>
				text
					.setPlaceholder("${currentFileNameWithoutExt}_")
					.setValue(this.plugin.settings.namePrefix)
					.onChange(async (value) => {
						this.plugin.settings.namePrefix = value;
						await this.plugin.saveSettings();
					})
			);

		// ファイル名本体
		new Setting(containerEl)
			.setName("ファイル名本体")
			.setDesc("ファイル名の本体。YYMMDD-HHmmssが日時に置換されます")
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
			.setDesc("エディタに挿入するHTML/Markdown。変数: ${imageFileName}")
			.addTextArea((text) => {
				text
					.setPlaceholder("<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>")
					.setValue(this.plugin.settings.insertPattern)
					.onChange(async (value) => {
						this.plugin.settings.insertPattern = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 4;
				text.inputEl.cols = 50;
			});

		// 説明文
		containerEl.createEl("p", {
			text: "例: namePrefix='note_', defaultName='image-YYMMDD-HHmmss' → note_image-241105-143020.png",
			cls: "setting-item-description",
		});
	}
}
