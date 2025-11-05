export interface TemplateVariables {
  currentFileDir: string;
  currentFileName: string;
  currentFileNameWithoutExt: string;
  timestamp: string;
  clipboardImageType: string;
  vaultPath: string;
  imageFileName?: string;
}

export interface ImagePasteSettings {
  imageFolderPath: string;
  defaultName: string;
  namePrefix: string;
  insertPattern: string;
  supportedFormats: string[];
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface ClipboardImage {
  arrayBuffer: ArrayBuffer;
  format: string;
}

export interface FileNameParts {
  baseName: string;
  extension: string;
}
