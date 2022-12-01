exports.messages = {
  name: "Chooooser",
  gitHubUrl: "https://github.com/pure-adachi/discord-chooooser",
  iconURL:
    "https://res.cloudinary.com/dbqa4qhvd/image/upload/v1669553905/chooooser_kdpyyw.png",
  chooseMember: (name) => `選ばれたのは ${name} さんです。`,
  joinTheVoiceChannel: "ボイスチャンネルに入室しましょう",
  commands: {
    chooooser: {
      name: "chooooser",
      description: "Chooooserで抽選",
      excludeReaction: "❌",
      start: "抽選開始！",
      embedTitle: (name) => `${name} チャンネルで抽選を行います。`,
      embedFinishedTitle: (name) =>
        `${name} チャンネルでの抽選は終了しました。`,
      channelId: "ChannelID",
      targetCount: "抽選対象数",
      targetCountValue: (mol, den) => `${mol} / ${den}`,
      embedFooter:
        "抽選対象から外して欲しい場合は、 ❌ のリアクションを押してください。",
    },
  },
};
