exports.messages = {
  name: "Chooooser",
  gitHubUrl: "https://github.com/pure-adachi/discord-chooooser",
  chooseMember: (name) => `選ばれたのは ${name} さんです。`,
  joinTheVoiceChannel: "ボイスチャンネルに入室しましょう",
  commands: {
    chooooser: {
      name: "chooooser",
      description: "Chooooserで抽選",
      excludeReaction: "❌",
      startSimpleLottery: "抽選開始",
      startFairLottery: "抽選開始（当選率考慮）",
      embedTitle: (name) => `${name} チャンネルで抽選を行います。`,
      embedFinishedTitle: (name) =>
        `${name} チャンネルでの抽選は終了しました。`,
      channelId: "ChannelID",
      targetCount: "抽選対象数",
      targetCountValue: (mol, den) => `${mol} / ${den}`,
      embedFooter:
        "抽選対象から外して欲しい場合は、 ❌ のリアクションを押してください。\n※名前の横にある確率は当選率を考慮して抽選を行う場合の当選確率です。"
    },
  },
};
