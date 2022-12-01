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
    this.client.on(Events.ClientReady, () => {
      this.client.user().setPresence({ game: { name: "chooooser" } });

      this.handleChooooserCommand();
    });
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

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;
      if (interaction.commandName !== "chooooser") return;

      const joinedVoiceChannel = this.getVoiceChannel(interaction);

      if (joinedVoiceChannel) {
        this.client.reset(interaction.guildId, joinedVoiceChannel.id);
        this.client.setChannel(interaction.guildId, joinedVoiceChannel);

        const reply = new Embed(joinedVoiceChannel).getReply();
        const message = await interaction.reply(reply);
        message.react("❌");

        this.client.setEmbedMessage(
          interaction.guildId,
          joinedVoiceChannel.id,
          message
        );
        this.handleChooooserCommandEvents(
          interaction.guildId,
          joinedVoiceChannel.id,
          message
        );
      } else {
        await this.replyJoiningVoiceChannel(interaction);
      }
    });
  }

  handleChooooserCommandEvents(guildId, channelId, message) {
    this.client.handleOn(
      guildId,
      channelId,
      Events.VoiceStateUpdate,
      (oldState, newState) => {
        const voiceChannel = this.client.findOrInitGuild(
          guildId,
          channelId
        ).channel;

        switch (voiceChannel.id) {
          case newState.channelId:
            this.updateEmbedByChangeVoiceState(voiceChannel, message);
            break;
          case oldState.channelId:
            if (voiceChannel.members.size) {
              this.updateEmbedByChangeVoiceState(voiceChannel, message);
            } else {
              this.client.reset(guildId, channelId);
            }
            break;
        }
      }
    );

    this.client.handleOn(
      guildId,
      channelId,
      Events.InteractionCreate,
      async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "chooooser-button") return;
        if (
          interaction.message.id !==
          this.client.findOrInitGuild(guildId, channelId).embedMessage.id
        )
          return;

        const xReaction = this.getXReaction(interaction.message);

        const embed = new Embed(
          this.client.findOrInitGuild(guildId, channelId).channel,
          xReaction.users.cache.values()
        );

        await this.replyChooseMember(interaction, embed.getTargetMembers());
      }
    );

    this.client.handleOn(
      guildId,
      channelId,
      Events.MessageReactionAdd,
      (reaction, user) => {
        if (
          reaction.message.id !==
          this.client.findOrInitGuild(guildId, channelId).embedMessage.id
        )
          return;
        if (user.bot) return;
        if (reaction.emoji.name !== "❌") return;

        this.updateEmbedByReaction(reaction);
      }
    );

    this.client.handleOn(
      guildId,
      channelId,
      Events.MessageReactionRemove,
      (reaction) => {
        if (
          reaction.message.id !==
          this.client.findOrInitGuild(guildId, channelId).embedMessage.id
        )
          return;
        if (reaction.emoji.name !== "❌") return;

        this.updateEmbedByReaction(reaction);
      }
    );
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
    this.client.on(Events.MessageCreate, (message) => {
      if (!message.mentions.users.has(this.client.user().id)) return;
      if (message.author.id === this.client.user().id) return;

      const joinedVoiceChannel = this.getVoiceChannel(message);

      if (joinedVoiceChannel) {
        return this.replyChooseMember(message, joinedVoiceChannel.members);
      } else {
        return this.replyJoiningVoiceChannel(message);
      }
    });
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
