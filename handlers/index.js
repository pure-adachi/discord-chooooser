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

      if (interaction.customId === "chooooser-button") {
        const channel = this.getVoiceChannelByEmbed(interaction);
        const xReaction = this.getXReaction(interaction);

        const embed = new Embed(channel, xReaction.users.cache.values());

        await this.replyChooseMember(interaction, embed.getTargetMembers());
      }
    });

    this.client.on(Events.MessageReactionAdd, (reaction, user) => {
      if (user.bot) return;

      this.updateEmbedByReaction(reaction);
    });

    this.client.on(Events.MessageReactionRemove, (reaction) => {
      this.updateEmbedByReaction(reaction);
    });
  }

  updateEmbedByReaction(reaction) {
    if (reaction.emoji.name !== "❌") return;

    const channel = this.getVoiceChannelByEmbed(reaction);
    const xReaction = this.getXReaction(reaction);
    const reply = new Embed(channel, xReaction.users.cache.values()).getReply();

    reaction.message.edit(reply);
  }

  getXReaction(r) {
    return r.message.reactions.cache.find((react) => react.emoji.name === "❌");
  }

  getVoiceChannelByEmbed(r) {
    const channelIdField = r.message.embeds[0].fields.find(
      ({ name }) => name === "ChannelID"
    );

    return this.client.channels.cache.get(channelIdField.value);
  }

  handleMessageCreate() {
    this.client.on(Events.MessageCreate, (message) => {
      if (!message.mentions.users.has(this.client.user.id)) return;
      if (message.author.id === this.client.user.id) return;

      const joinedVoiceChannel = this.getVoiceChannel(message);

      if (joinedVoiceChannel) {
        return this.replyChooseMember(message, joinedVoiceChannel.members);
      } else {
        return this.replyJoiningVoiceChannel(joinedVoiceChannel);
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
