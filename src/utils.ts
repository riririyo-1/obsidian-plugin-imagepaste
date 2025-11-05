import { TFile, Vault } from "obsidian";


// -- タイムスタンプのフォーマット --------------
export function formatTimestamp(date: Date): string {
	const year = date.getFullYear().toString().slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}


// -- ファイル名のサニタイズ --------------
export function sanitizeFilename(filename: string): string {
	return filename.replace(/[\\/:*?"<>|]/g, "_");
}


// -- コンテキスト情報の型定義 --------------
export interface FileContext {
	currentFileDir: string;
	currentFileNameWithoutExt: string;
}


// -- ファイル名の生成 --------------
export function generateFilename(
	prefix: string,
	namePattern: string,
	context: FileContext,
	extension: string
): string {
	const timestamp = formatTimestamp(new Date());

	// 変数を展開
	let expandedPrefix = prefix
		.replace(/\$\{currentFileDir\}/g, context.currentFileDir)
		.replace(/\$\{currentFileNameWithoutExt\}/g, context.currentFileNameWithoutExt);

	const expandedName = namePattern.replace(/YYMMDD-HHmmss/g, timestamp);

	// 連結してサニタイズ
	const filename = sanitizeFilename(expandedPrefix + expandedName + extension);

	return filename;
}


// -- 重複しないファイル名を取得 --------------
export async function getUniqueFilename(
	vault: Vault,
	folderPath: string,
	filename: string
): Promise<string> {
	let finalPath = `${folderPath}/${filename}`;
	let counter = 1;

	// 拡張子を分離
	const lastDotIndex = filename.lastIndexOf(".");
	const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
	const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";

	// ファイルが存在する場合は連番を付与
	while (await vault.adapter.exists(finalPath)) {
		const numberedFilename = `${nameWithoutExt}_${counter}${extension}`;
		finalPath = `${folderPath}/${numberedFilename}`;
		counter++;
	}

	return finalPath;
}


// -- フォルダパスの変数展開 --------------
export function expandFolderPath(
	folderPathPattern: string,
	context: FileContext
): string {
	return folderPathPattern
		.replace(/\$\{currentFileDir\}/g, context.currentFileDir)
		.replace(/\$\{currentFileNameWithoutExt\}/g, context.currentFileNameWithoutExt);
}


// -- 挿入パターンの変数展開 --------------
export function expandInsertPattern(
	insertPattern: string,
	imageFileName: string,
	context: FileContext
): string {
	return insertPattern
		.replace(/\$\{imageFileName\}/g, imageFileName)
		.replace(/\$\{currentFileDir\}/g, context.currentFileDir)
		.replace(/\$\{currentFileNameWithoutExt\}/g, context.currentFileNameWithoutExt);
}


// -- 現在のファイルのコンテキストを取得 --------------
export function getFileContext(file: TFile | null): FileContext | null {
	if (!file) {
		return null;
	}

	const currentFileDir = file.parent?.path || "";
	const currentFileNameWithoutExt = file.basename;

	return {
		currentFileDir,
		currentFileNameWithoutExt,
	};
}
