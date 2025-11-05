import { Plugin, MarkdownView } from "obsidian";
import { ImagePasteSettings, DEFAULT_SETTINGS, ImagePasteSettingTab } from "./settings";
import { handleImagePaste } from "./paste-handler";
import { getFileContext } from "./utils";


// -- プラグインのメインクラス --------------
export default class ImagePastePlugin extends Plugin {
	settings: ImagePasteSettings;


	// -- プラグインのロード --------------
	async onload() {
		await this.loadSettings();

		// コマンドを追加: Cmd+Option+V (Mac) / Ctrl+Alt+V (Win)
		this.addCommand({
			id: "paste-image",
			name: "Paste image from clipboard",
			editorCallback: async (editor, view) => {
				// 現在のファイルのコンテキストを取得
				const file = view.file;
				const context = getFileContext(file);

				// 画像貼り付け処理を実行
				await handleImagePaste(editor, this.app.vault, this.settings, context);
			},
			hotkeys: [
				{
					modifiers: ["Mod", "Alt"],
					key: "v",
				},
			],
		});

		// 設定タブを追加
		this.addSettingTab(new ImagePasteSettingTab(this.app, this));
	}


	// -- プラグインのアンロード --------------
	onunload() {
		// 特に処理なし
	}


	// -- 設定を読み込み --------------
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}


	// -- 設定を保存 --------------
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
