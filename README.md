# じょし れんしゅう アプリ

## はじめてのセットアップ

### 1. Node.js をインストール
https://nodejs.org/ja/ にアクセスして「LTS版」をダウンロード・インストール

### 2. このフォルダをパソコンに展開
ZIPを解凍して、好きな場所に置く（例：デスクトップ）

### 3. ターミナル（コマンドプロンプト）を開く
- Windowsの場合：「スタートメニュー」→「cmd」と検索
- Macの場合：「アプリケーション」→「ユーティリティ」→「ターミナル」

### 4. フォルダに移動
```
cd デスクトップ/joshi-app
```

### 5. パッケージをインストール
```
npm install
```

### 6. 動作確認（ローカルで起動）
```
npm run dev
```
ブラウザで http://localhost:5173 を開くと動きます

---

## Vercel で無料公開する方法

### 1. GitHub アカウントを作る
https://github.com にアクセスして無料登録

### 2. 新しいリポジトリを作る
- GitHubにログイン
- 右上「＋」→「New repository」
- 名前を「joshi-app」にして「Create repository」

### 3. ファイルをアップロード
リポジトリのページで「uploading an existing file」をクリックして、
joshi-appフォルダの中身をすべてドラッグ＆ドロップ

### 4. Vercel アカウントを作る
https://vercel.com にアクセスして「GitHubでログイン」

### 5. デプロイ
- 「New Project」をクリック
- GitHubのjoshi-appを選択
- 「Deploy」ボタンを押す
- 1〜2分でURLが発行される！

### 完成！
`https://joshi-app-xxxx.vercel.app` のようなURLが発行されます。
このURLを保護者さんに共有すればOKです。

---

## アプリの機能
- 助詞（は・が・を・に・で）各50問、計250問
- 助詞ごとの個別練習
- 250問ランダム混合練習
- 苦手問題集中モード
- 音声読み上げ（日本語）
- 学習履歴・進捗・苦手問題の確認
