# 開発者向け実装ガイドライン

## 実装ルール

- 関数同士は 2 行空けること
- コメントは日本語で記載
- 関数やブロック毎のコメントは、その前に "# -- コメント --------------"のように可読性高く記載
- ''' を使ったコメントは記載しないこと
- ハードコーディングは禁止
- クリーンな実装を常に心がけること

## Next.js 開発ルール

- App Router を使用（Pages Router は使用しない）
- TypeScript 必須
- pnpm をパッケージマネージャーとして使用
- `frontend/src/app`にページ、`frontend/src/components`にコンポーネント配置
- Server Components と Client Components を適切に使い分け
- 環境変数は`.env`で管理

## パス表記

- Mac や Linux に合わせて、"/"を使用。
