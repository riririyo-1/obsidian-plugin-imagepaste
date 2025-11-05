import { App, FileSystemAdapter, TFile, normalizePath } from "obsidian";
import * as nodePath from "path";
import { TemplateVariables } from "../types";

const VARIABLE_PATTERN = /\$\{([\w]+)\}/g;

export function formatTimestamp(date = new Date()): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  return `${year}${month}${day}_${hour}${minute}${second}`;
}

export function buildTemplateVariables(
  app: App,
  file: TFile | null,
  clipboardType: string,
  options?: { imageFileName?: string; timestamp?: string }
): TemplateVariables {
  const adapter = app.vault.adapter;
  let vaultPath = "";
  if (adapter instanceof FileSystemAdapter) {
    vaultPath = adapter.getBasePath();
  }

  const currentFileName = file?.name ?? "";
  const currentFileNameWithoutExt = file?.basename ?? "";
  const currentFileDir = file ? extractParentFolder(file.path) : "";

  return {
    currentFileDir,
    currentFileName,
    currentFileNameWithoutExt,
    timestamp: options?.timestamp ?? formatTimestamp(),
    clipboardImageType: clipboardType,
    vaultPath,
    imageFileName: options?.imageFileName,
  };
}

export function expandTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(VARIABLE_PATTERN, (match, key) => {
    const value = variables[key as keyof TemplateVariables];
    return value ?? match;
  });
}

export function expandFolderPath(app: App, template: string, variables: TemplateVariables): string {
  const expanded = expandTemplate(template, variables).trim();
  if (!expanded) {
    return "";
  }
  const normalized = normalizePath(expanded);
  validateRelativePath(normalized);
  ensureVaultBoundary(app, normalized);
  return normalized;
}

export function ensureVaultBoundary(app: App, relativePath: string): void {
  const adapter = app.vault.adapter;
  if (!(adapter instanceof FileSystemAdapter)) {
    return;
  }
  const vaultRoot = adapter.getBasePath();
  const resolved = nodePath.resolve(vaultRoot, relativePath);
  const isSafe = resolved.startsWith(nodePath.resolve(vaultRoot));
  if (!isSafe) {
    throw new Error("Vault 外へのパスは使用できません。");
  }
}

export async function ensureFolderExists(app: App, folderPath: string): Promise<void> {
  if (!folderPath) {
    return;
  }
  const adapter = app.vault.adapter;
  const segments = folderPath.split("/").filter((segment) => segment.length > 0);
  let current = "";
  for (const segment of segments) {
    current = current ? `${current}/${segment}` : segment;
    const exists = await adapter.exists(current);
    if (!exists) {
      await adapter.mkdir(current);
    }
  }
}

export function combinePath(folderPath: string, fileName: string): string {
  const joined = folderPath ? `${folderPath}/${fileName}` : fileName;
  const compacted = joined.replace(/\/{2,}/g, "/");
  return normalizePath(compacted);
}

export function extractParentFolder(filePath: string): string {
  if (!filePath.includes("/")) {
    return "";
  }
  const index = filePath.lastIndexOf("/");
  return filePath.slice(0, index);
}

export function validateRelativePath(pathValue: string): void {
  if (!pathValue) {
    return;
  }
  if (nodePath.isAbsolute(pathValue)) {
    throw new Error("絶対パスは指定できません。Vault 内の相対パスを使用してください。");
  }
  if (pathValue.includes("..")) {
    throw new Error(".. を含むパスは指定できません。");
  }
}
