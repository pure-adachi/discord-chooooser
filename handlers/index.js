const { Collection, Events } = require("discord.js");
const { Embed } = require("./embed");

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

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;

      if (interaction.commandName === "chooooser") {
        const joinedVoiceChannel = this.getVoiceChannel(interaction);

        if (joinedVoiceChannel) {
          const reply = new Embed(joinedVoiceChannel).getReply();
          const message = await interaction.reply(reply);
          message.react("❌");
        } else {
          await this.replyJoiningVoiceChannel(interaction);
        }
      }
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === "customId") {
        await this.replyChooseMember(interaction);
      }
    });

    this.client.on(Events.MessageReactionAdd, (reaction, user) => {
      if (user.bot) return;
      if (reaction.emoji.name !== "❌") return;

      const receivedEmbed = reaction.message.embeds[0];

      const xReaction = reaction.message.reactions.cache.find(
        (react) => react.emoji.name === "❌"
      );

      const channelIdField = receivedEmbed.fields.find(
        ({ name }) => name === "ChannelID"
      );

      const channel = this.client.channels.cache.get(channelIdField.value);
      const reply = new Embed(
        channel,
        xReaction.users.cache.values()
      ).getReply();
      reaction.message.edit(reply);
    });
  }

  handleMessageCreate() {
    this.client.on(Events.MessageCreate, (message) => {
      if (!message.mentions.users.has(this.client.user.id)) return;
      if (message.author.id === this.client.user.id) return;

      this.replyChooseMember(message);
    });
  }

  replyChooseMember(r) {
    const joinedVoiceChannel = this.getVoiceChannel(r);

    if (joinedVoiceChannel) {
      const member = joinedVoiceChannel.members.random();
      const memberName = member.nickname || member.user.username;

      return r.reply(`選ばれたのは ${memberName} さんです。`);
    } else {
      return this.replyJoiningVoiceChannel(r);
    }
  }

  getVoiceChannel(r) {
    return r.member.voice.channel;
  }

  replyJoiningVoiceChannel(r) {
    return r.reply("ボイスチャンネルに入室しましょう");
  }
};
