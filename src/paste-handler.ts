import { Editor, Vault } from "obsidian";
import { ImagePasteSettings } from "./settings";
import {
	generateFilename,
	getUniqueFilename,
	expandFolderPath,
	expandInsertPattern,
	FileContext,
} from "./utils";


// -- クリップボードから画像を取得 --------------
function getImageFromClipboard(): { buffer: Buffer; extension: string } | null {
	try {
		// Electron clipboard を使用
		const { clipboard, nativeImage } = require("electron");
		const image = clipboard.readImage();

		if (image.isEmpty()) {
			return null;
		}

		// PNG形式でバッファを取得
		const buffer = image.toPNG();
		const extension = ".png";

		return { buffer, extension };
	} catch (error) {
		console.error("Failed to get image from clipboard:", error);
		return null;
	}
}


// -- 画像を保存 --------------
async function saveImage(
	vault: Vault,
	folderPath: string,
	filename: string,
	imageBuffer: Buffer
): Promise<string> {
	// フォルダがなければ作成
	if (!(await vault.adapter.exists(folderPath))) {
		await vault.adapter.mkdir(folderPath);
	}

	// 重複チェック（連番付与）
	const finalPath = await getUniqueFilename(vault, folderPath, filename);

	// 保存
	await vault.adapter.writeBinary(finalPath, imageBuffer);

	return finalPath;
}


// -- エディタに挿入 --------------
function insertToEditor(
	editor: Editor,
	insertPattern: string,
	imageFileName: string,
	context: FileContext
): void {
	const text = expandInsertPattern(insertPattern, imageFileName, context);
	editor.replaceSelection(text);
}


// -- メイン処理: 画像を貼り付け --------------
export async function handleImagePaste(
	editor: Editor,
	vault: Vault,
	settings: ImagePasteSettings,
	context: FileContext | null
): Promise<void> {
	// コンテキストが取得できない場合は処理しない
	if (!context) {
		console.error("No active file context");
		return;
	}

	// クリップボードから画像を取得
	const imageData = getImageFromClipboard();
	if (!imageData) {
		console.log("No image in clipboard");
		return;
	}

	const { buffer, extension } = imageData;

	// ファイル名を生成
	const filename = generateFilename(
		settings.namePrefix,
		settings.defaultName,
		context,
		extension
	);

	// フォルダパスを展開
	const folderPath = expandFolderPath(settings.imageFolderPath, context);

	try {
		// 画像を保存
		const savedPath = await saveImage(vault, folderPath, filename, buffer);

		// ファイル名のみを取得（パスから）
		const imageFileName = savedPath.split("/").pop() || filename;

		// エディタに挿入
		insertToEditor(editor, settings.insertPattern, imageFileName, context);
	} catch (error) {
		console.error("Failed to save image:", error);
	}
}
