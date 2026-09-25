# Mokomo Games

七宝もこもの公式サイトです。Astroで作成し、GitHub Pagesで公開しています。

## ローカルで確認する

初回だけ、プロジェクトのフォルダーで次を実行します。

```bat
npm install
```

確認用サーバーを起動します。

```bat
npm run dev
```

表示されたアドレス（通常は `http://localhost:4321/`）をブラウザで開きます。

## 公開前に確認する

```bat
npm run build
```

この操作では、最初に画像ファイル名と作者情報を自動確認し、問題がなければサイト全体を作成します。確認だけを行う場合は `npm run validate:media` を使います。

## 公開する

ローカル表示を確認してから、変更をコミットしてGitHubへプッシュします。`main` ブランチへのプッシュ後、GitHub Pagesが自動で公開します。

## スケジュール画像を追加する

保存場所：`public/images/schedule/`

ファイル名：`schedule_YYYYMMDD.webp`

例：`schedule_20260928.webp`

## イラストを追加する

保存場所：`public/images/illustrations/`

ファイル名：`作者ID_YYYYMMDD_連番_種類_キャラクター.拡張子`

例：`kikuri_20260928_01_fanart_mokomo.webp`

- 連番：`01`、`02` など
- 種類：`fanart` または `commission`
- キャラクター：`mokomo`、`mokoko`、`both`
- 対応形式：WebP、JPG、PNG、GIF、AVIF、MP4
- OBSスライドショーに表示されるのはWebPだけです

新しい作者IDを使う場合は、先に `src/data/artists.ts` へ作者名とアカウントURLを追加します。

## OBSスライドショー

基本URL：`https://www.mokomo.games/slideshow/`

表示時間と切替時間はURLで指定できます。

```text
https://www.mokomo.games/slideshow/?duration=6000&fade=1500
```

- `duration`：画像1枚の表示時間（ミリ秒）
- `fade`：切替にかける時間（ミリ秒）

## 短縮URLを追加する

`src/data/redirects.ts` の `shortLinks` に名前と転送先を追加します。

```ts
export const shortLinks = {
  contact: contactUrl,
  example: 'https://example.com/',
} as const;
```

この例では `https://www.mokomo.games/go/example/` が使えるようになります。

## ダウンロードファイルを追加する

ファイルを `public/downloads/` に保存し、`src/data/works.ts` の該当リンクを `/downloads/ファイル名` にします。

## ブラウザー操作の自動テスト

初回は `npx playwright install chromium` を実行し、`npm run test:e2e` で確認します。テスト用サーバーは自動起動します。
ライトボックスの開閉・前後移動・フォーカス復帰、絞り込み後の列幅、モバイル表示を検証します。GitHub Pagesへの公開前にも自動実行されます。
