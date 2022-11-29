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
      console.log("Events.ClientReady");
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
      console.log("Events.InteractionCreate chooooser command");

      if (!interaction.isCommand()) return;

      if (interaction.commandName === "chooooser") {
        const joinedVoiceChannel = this.getVoiceChannel(interaction);

        if (joinedVoiceChannel) {
          const reply = new Embed(joinedVoiceChannel).getReply();
          const message = await interaction.reply(reply);
          message.react("❌");

          this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
            console.log("Events.VoiceStateUpdate");
            switch (joinedVoiceChannel.id) {
              case newState.channelId:
                this.updateEmbedByChangeVoiceState(joinedVoiceChannel, message);
                break;
              case oldState.channelId:
                if (joinedVoiceChannel.members.size) {
                  this.updateEmbedByChangeVoiceState(
                    joinedVoiceChannel,
                    message
                  );
                } else {
                  message.edit({
                    embeds: [new Embed(joinedVoiceChannel).getFinishedEmbed()],
                    components: [],
                  });
                  this.client.removeAllEvents();
                  this.handleChooooserCommand();
                  this.handleMessageCreate();
                }
                break;
            }
          });

          this.client.on(Events.InteractionCreate, async (interaction) => {
            console.log("Events.InteractionCreate 抽選ボタン");
            if (!interaction.isButton()) return;

            if (interaction.customId === "chooooser-button") {
              const channel = this.getVoiceChannelByEmbed(interaction);
              const xReaction = this.getXReaction(interaction.message);

              const embed = new Embed(channel, xReaction.users.cache.values());

              await this.replyChooseMember(
                interaction,
                embed.getTargetMembers()
              );
            }
          });

          this.client.on(Events.MessageReactionAdd, (reaction, user) => {
            console.log("Events.MessageReactionAdd");

            if (user.bot) return;
            if (reaction.emoji.name !== "❌") return;

            this.updateEmbedByReaction(reaction);
          });

          this.client.on(Events.MessageReactionRemove, (reaction) => {
            console.log("Events.MessageReactionRemove");
            if (reaction.emoji.name !== "❌") return;

            this.updateEmbedByReaction(reaction);
          });
        } else {
          await this.replyJoiningVoiceChannel(interaction);
        }
      }
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
    this.client.on(Events.MessageCreate, (message) => {
      console.log("Events.MessageCreate");
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
