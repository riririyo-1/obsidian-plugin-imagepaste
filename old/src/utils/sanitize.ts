const INVALID_CHAR_PATTERN = /[\\/:*?"<>|]/g;
const RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

const DEFAULT_FALLBACK_NAME = "untitled";

export function sanitizeBaseName(name: string, fallback = DEFAULT_FALLBACK_NAME): string {
  const replaced = name.replace(INVALID_CHAR_PATTERN, "_");
  const trimmed = replaced.trim().replace(/^\.+|\.+$/g, "");
  let sanitized = trimmed || fallback;
  if (RESERVED_NAMES.has(sanitized.toUpperCase())) {
    sanitized = `_${sanitized}`;
  }
  if (!sanitized) {
    sanitized = fallback;
  }
  return sanitized;
}

export function clampNameLength(baseName: string, extension: string, maxLength = 200): string {
  const suffix = extension ? `.${extension}` : "";
  const availableLength = maxLength - suffix.length;
  if (availableLength <= 0) {
    throw new Error("拡張子が長すぎるため、ファイル名を生成できません。");
  }
  const truncatedBase = baseName.length > availableLength ? baseName.slice(0, availableLength) : baseName;
  return `${truncatedBase}${suffix}`;
}
