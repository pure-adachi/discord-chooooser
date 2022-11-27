const { Collection, Events } = require("discord.js");

exports.Handler = class Handler {
  constructor(client) {
    this.client = client;
  }

  start() {
    this.setup();
    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  setup() {
    this.handleReady();
    this.handleMessageCreate();
  }

  handleReady() {
    this.client.on(Events.ClientReady, () => {
      this.client.user.setPresence({ game: { name: "chooooser" } });

      this.handleChooooserCommand();
    });
  }

  handleChooooserCommand() {
    this.client.commands = new Collection();

    const data = [
      {
        name: "chooooser",
        description: "Chooooserで抽選",
      },
    ];

    this.client.application.commands.set(data);

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;

      if (interaction.commandName === "chooooser") {
        await this.replyChooseMember(
          interaction,
          interaction.member.voice.channel
        );
      }
    });
  }

  handleMessageCreate() {
    this.client.on(Events.MessageCreate, (message) => {
      if (!message.mentions.users.has(this.client.user.id)) return;
      if (message.author.id === this.client.user.id) return;

      this.replyChooseMember(message, message.member.voice.channel);
    });
  }

  replyChooseMember(r, joinedVoiceChannel) {
    if (joinedVoiceChannel) {
      const member = joinedVoiceChannel.members.random();
      const memberName = member.nickname || member.user.username;

      return r.reply(`選ばれたのは ${memberName} さんです。`);
    } else {
      return r.reply("ボイスチャンネルに入室しましょう");
    }
  }
};
