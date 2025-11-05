# Obsidian Image Paste Plugin

クリップボードの画像を `Cmd+Option+V` (Mac) / `Ctrl+Alt+V` (Win) で即座に保存・挿入する Obsidian プラグインです。

## 機能

- クリップボードから画像を取得して自動保存
- カスタマイズ可能なファイル名パターン
- カスタマイズ可能な保存先フォルダ
- カスタマイズ可能な挿入 HTML/Markdown

## 使い方

1. 画像をクリップボードにコピー
2. Obsidian のエディタで `Cmd+Option+V` (Mac) / `Ctrl+Alt+V` (Win) を押す
3. 画像が保存され、エディタに挿入される

## 設定

プラグイン設定画面から以下の項目をカスタマイズできます:

### 画像保存フォルダ

- デフォルト: `${currentFileDir}/images`
- 変数: `${currentFileDir}` - 現在のファイルのディレクトリ

### ファイル名接頭辞

- デフォルト: `${currentFileNameWithoutExt}-`
- 変数: `${currentFileNameWithoutExt}` - 現在のファイル名（拡張子なし）

### ファイル名本体

- デフォルト: `image-YYMMDD-HHmmss`
- `YYMMDD-HHmmss` が日時に置換されます
- 例: `image-241105-143020`

### 挿入パターン

- デフォルト: `<img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>`
- 変数: `${imageFileName}` - 保存された画像のファイル名

## ファイル名の例

設定:

- 接頭辞: `${currentFileNameWithoutExt}-`
- 本体: `image-YYMMDD-HHmmss`

結果:

- `meeting-notes_image-241105-143020.png`

## 開発

```bash
# 依存関係のインストール
npm install

# 開発モード（ファイル監視）
npm run dev

# ビルド
npm run build
```

## インストール

1. リポジトリをクローン
2. `npm install` で依存関係をインストール
3. `npm run build` でビルド
4. プラグインフォルダを Obsidian の `.obsidian/plugins/` にコピー
5. Obsidian でプラグインを有効化

## ライセンス

MIT
