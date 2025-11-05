import { Plugin } from "obsidian";
import { PasteImageHandler } from "./handler";
import { DEFAULT_SETTINGS, ImagePasteSettingTab, SettingsHost, sanitizeSettings } from "./settings";
import { ImagePasteSettings } from "./types";

export default class ImagePastePlugin extends Plugin implements SettingsHost {
  settings: ImagePasteSettings = DEFAULT_SETTINGS;
  private handler: PasteImageHandler | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.handler = new PasteImageHandler(this.app, () => this.settings);

    this.addCommand({
      id: "paste-image-from-clipboard",
      name: "クリップボードから画像を貼り付け",
      hotkeys: [
        {
          modifiers: ["Mod", "Alt"],
          key: "v",
        },
      ],
      editorCallback: () => {
        console.log("ImagePaste: Command triggered");
        this.handler?.handlePaste();
      },
    });

    this.addSettingTab(new ImagePasteSettingTab(this.app, this));
  }

  onunload(): void {
    this.handler = null;
  }

  async updateSettings(value: Partial<ImagePasteSettings>): Promise<void> {
    this.settings = sanitizeSettings({ ...this.settings, ...value });
    await this.saveSettings();
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = sanitizeSettings({ ...DEFAULT_SETTINGS, ...(data ?? {}) });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
