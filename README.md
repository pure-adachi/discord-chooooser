# Discord Chooooser

自分が入室しているボイスチャンネルのメンバーをランダムで選ぶ Bot です。

## Bot をサーバーに招待

- 次の URL にアクセスして、追加したいサーバーを選択してください。

https://discord.com/api/oauth2/authorize?client_id=1046364323951431700&permissions=0&scope=bot%20applications.commands

## TODO

- [x] ボタン押下で選ぶ
- [x] リアクションされる度に、embed を更新
- [x] 後からの参加者を考慮
- [x] 途中退出者を考慮
- [x] ハンドリングの削除（全員退出時）
- [x] ハンドリングの削除（古い抽選）
  - [x] チャンネル別で管理（client インスタンスで guild -> voice チャンネル毎に情報をもつ）
- [ ] リファクタリング
- [ ] 15 分程度の放置に対応？
