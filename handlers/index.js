const { Events } = require("discord.js");
const { Client } = require("./client");
const { Embed } = require("./embed");

exports.Handler = class Handler {
  constructor(client) {
    this.client = new Client(client);
  }

  start() {
    this.setup();
    this.client.login();
  }

  setup() {
    this.handleReady();
    this.handleMessageCreate();
  }

  handleReady() {
    this.client.on(
      Events.ClientReady,
      () => {
        this.client.user().setPresence({ game: { name: "chooooser" } });

        this.handleChooooserCommand();
      },
      false
    );
  }

  handleChooooserCommand() {
    this.client.newCommands();

    const data = [
      {
        name: "chooooser",
        description: "Chooooserで抽選",
      },
    ];

    this.client.application().commands.set(data);

    this.client.on(
      Events.InteractionCreate,
      async (interaction) => {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === "chooooser") {
          const joinedVoiceChannel = this.getVoiceChannel(interaction);

          if (joinedVoiceChannel) {
            this.client.reset();
            this.client.setChannel(joinedVoiceChannel);

            const reply = new Embed(joinedVoiceChannel).getReply();
            const message = await interaction.reply(reply);
            message.react("❌");

            this.client.setEmbedMessage(message);
            this.handleChooooserCommandEvents(message);
          } else {
            await this.replyJoiningVoiceChannel(interaction);
          }
        }
      },
      false
    );
  }

  handleChooooserCommandEvents(message) {
    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      switch (this.client.channel.id) {
        case newState.channelId:
          this.updateEmbedByChangeVoiceState(this.client.channel, message);
          break;
        case oldState.channelId:
          if (this.client.channel.members.size) {
            this.updateEmbedByChangeVoiceState(this.client.channel, message);
          } else {
            this.client.reset();
          }
          break;
      }
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.customId !== "chooooser-button") return;

      const xReaction = this.getXReaction(interaction.message);

      const embed = new Embed(
        this.client.channel,
        xReaction.users.cache.values()
      );

      await this.replyChooseMember(interaction, embed.getTargetMembers());
    });

    this.client.on(Events.MessageReactionAdd, (reaction, user) => {
      if (reaction.message.id !== this.client.embedMessage.id) return;
      if (user.bot) return;
      if (reaction.emoji.name !== "❌") return;

      this.updateEmbedByReaction(reaction);
    });

    this.client.on(Events.MessageReactionRemove, (reaction) => {
      if (reaction.message.id !== this.client.embedMessage.id) return;
      if (reaction.emoji.name !== "❌") return;

      this.updateEmbedByReaction(reaction);
    });
  }

  updateEmbedByChangeVoiceState(channel, message) {
    const xReaction = this.getXReaction(message);
    message.edit(new Embed(channel, xReaction.users.cache.values()).getReply());
  }

  updateEmbedByReaction(r) {
    const channel = this.getVoiceChannelByEmbed(r);
    const xReaction = this.getXReaction(r.message);
    const reply = new Embed(channel, xReaction.users.cache.values()).getReply();

    r.message.edit(reply);
  }

  getXReaction(message) {
    return message.reactions.cache.find((react) => react.emoji.name === "❌");
  }

  getVoiceChannelByEmbed(r) {
    const channelIdField = this.getEmbedChannelIdField(r.message.embeds[0]);

    return this.client.channels().cache.get(channelIdField.value);
  }

  getEmbedChannelIdField(embed) {
    return embed.fields.find(({ name }) => name === "ChannelID");
  }

  handleMessageCreate() {
    this.client.on(
      Events.MessageCreate,
      (message) => {
        if (!message.mentions.users.has(this.client.user().id)) return;
        if (message.author.id === this.client.user().id) return;

        const joinedVoiceChannel = this.getVoiceChannel(message);

        if (joinedVoiceChannel) {
          return this.replyChooseMember(message, joinedVoiceChannel.members);
        } else {
          return this.replyJoiningVoiceChannel(message);
        }
      },
      false
    );
  }

  replyChooseMember(r, members) {
    const member = members.random();
    const memberName = member.nickname || member.user.username;

    return r.reply(`選ばれたのは ${memberName} さんです。`);
  }

  getVoiceChannel(r) {
    return r.member.voice.channel;
  }

  replyJoiningVoiceChannel(r) {
    return r.reply("ボイスチャンネルに入室しましょう");
  }
};
