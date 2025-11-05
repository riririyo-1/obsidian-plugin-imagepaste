# Image Paste Plugin for Obsidian

Cmd + Alt + V でクリップボード画像を簡単に保存・挿入する Obsidian プラグインです。

## 機能

- **ショートカット**: Cmd + Alt + V でクリップボードの画像を瞬時に挿入
- **柔軟な保存先設定**: 画像の保存フォルダを自由に指定
- **カスタム命名**: ファイル名のプレフィックスとルールを設定可能
- **挿入パターン設定**: Markdown/HTML テンプレートで挿入形式をカスタマイズ
- **複数形式対応**: PNG、JPG、GIF などの画像形式をサポート

## インストール方法

### 手動インストール

1. **このリポジトリをクローンまたはダウンロード**:

   ```bash
   git clone https://github.com/riririyo-1/obsidian-plugin-imagepaste.git
   ```

2. **必要なファイルを特定**:
   プラグインに必要なファイルは以下の 3 つです：

   - `main.js` - プラグインのメインコード
   - `manifest.json` - プラグインの設定情報
   - `styles.css` - スタイルシート

3. **📁 重要：プラグインフォルダを作成**:

   **あなたの Obsidian Vault**の `.obsidian/plugins/` ディレクトリ内に **`obsidian-plugin-imagepaste`** フォルダを作成します：

   ```text
   あなたのVault/                           ← ここはあなたのVaultのルートフォルダ
   └── .obsidian/                          ← 隠しフォルダ（設定フォルダ）
       └── plugins/                        ← プラグインフォルダ
           └── obsidian-plugin-imagepaste/ ← 📌 このフォルダを作成してください
               ├── main.js                 ← ビルドされたプラグインファイル
               ├── manifest.json           ← プラグイン設定ファイル
               └── styles.css              ← スタイルシートファイル
   ```

   **フォルダ名は必ず `obsidian-plugin-imagepaste` にしてください！**

   **📋 実際の例：**

   ```text
   /Users/yourname/Documents/MyObsidianVault/.obsidian/plugins/obsidian-plugin-imagepaste/
   ```

4. **ファイルをコピー**:

   このプロジェクトのルートディレクトリにある以下の 3 つのファイルを、
   上記で作成した `obsidian-plugin-imagepaste` フォルダにコピーします：

   - `main.js` ← **これが最も重要なファイルです**
   - `manifest.json`
   - `styles.css`

5. **Obsidian でプラグインを有効化**:
   - Obsidian を再起動
   - 設定 → コミュニティプラグイン → インストール済みプラグイン
   - "Image Paste" を見つけて有効化

### 開発者向けインストール（開発・デバッグ用）

1. **依存関係のインストール**:

   ```bash
   cd obsidian-plugin-imagepaste
   npm install
   ```

2. **ビルド**:

   ```bash
   npm run build
   ```

3. **シンボリックリンクの作成** (推奨):

   ```bash
   # Obsidian Vaultのpluginsディレクトリに移動
   cd /path/to/your/vault/.obsidian/plugins/

   # シンボリックリンクを作成
   ln -s /Users/Ryo/Projects/obsidian-plugin-imagepaste obsidian-plugin-imagepaste
   ```

## 使用方法

1. **基本的な使用**:

   - 画像をクリップボードにコピー
   - Obsidian のエディタで `Cmd + Alt + V` を押下
   - 画像が自動的に保存され、ノートに挿入されます

2. **設定のカスタマイズ**:
   - 設定 → コミュニティプラグイン → Image Paste → ⚙️（設定アイコン）
   - 以下の項目を設定可能：
     - **画像保存先フォルダパス**: 画像を保存するフォルダ（例: `${currentFileDir}/images`）
     - **画像命名接頭辞**: ファイル名の前に付ける文字列
     - **画像命名ルール**: ファイル名の本体部分（例: `image${timestamp}`）
     - **画像挿入パターン**: ノートに挿入する Markdown/HTML テンプレート
     - **サポートする画像形式**: 許可する画像ファイル形式

## 設定例

### 基本設定

```text
画像保存先フォルダパス: ${currentFileDir}/images
画像命名接頭辞: ${currentFileNameWithoutExt}_
画像命名ルール: image${timestamp}
画像挿入パターン: <img src='./images/${imageFileName}' alt='image' style='width: 600px; border: 1px solid black;'>
```

### 変数の説明

- `${currentFileDir}`: 現在のファイルのディレクトリ
- `${currentFileName}`: 現在のファイル名（拡張子含む）
- `${currentFileNameWithoutExt}`: 現在のファイル名（拡張子なし）
- `${timestamp}`: タイムスタンプ
- `${imageFileName}`: 生成される画像ファイル名

## トラブルシューティング

### プラグインが表示されない

- Obsidian を再起動してください
- `.obsidian/plugins/obsidian-plugin-imagepaste/` フォルダに必要なファイルがすべて存在するか確認してください

### 設定画面に項目が一部しか表示されない

- プラグインを無効化 → 有効化してください
- 開発者ツール（Cmd + Option + I）でエラーがないか確認してください

### 画像が保存されない

- 保存先フォルダのパスが正しいか確認してください
- フォルダの書き込み権限があるか確認してください

## 開発

### ビルド

```bash
npm run build
```

### 開発モード（ファイル監視）

```bash
npm run dev
```

## ライセンス

MIT License

## 作者

Ryo
