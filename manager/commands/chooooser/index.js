const { Events } = require("discord.js");
const { Embed } = require("./embed");
const {
  messages: {
    chooseMember,
    joinTheVoiceChannel,
    commands: { chooooser: chooooserMessages },
  },
} = require("../../messages");

exports.Chooooser = class {
  static data = [
    {
      name: chooooserMessages.name,
      description: chooooserMessages.description,
    },
  ];

  constructor(client) {
    this.client = client;
    this.guilds = {};
  }

  setHandlers() {
    this.client.on(Events.InteractionCreate, (interaction) => {
      if (!interaction.isCommand()) return;
      if (interaction.commandName !== chooooserMessages.name) return;

      const voiceChannel = interaction.member.voice.channel;

      if (voiceChannel) {
        const guildId = interaction.guildId;
        const channelId = voiceChannel.id;

        this.#resetHandlers(guildId, channelId);
        this.#setChannel(guildId, voiceChannel);

        this.#replayStartMessage(interaction, guildId, channelId);
      } else {
        interaction.reply(joinTheVoiceChannel);
      }
    });
  }

  #resetHandlers(guildId, channelId) {
    const guild = this.#findOrInitGuild(guildId, channelId);

    if (!guild.channel) return;
    if (!guild.embedMessage) return;

    this.#updateFinishedEmbed(guild);
    this.#removeEvents(guild);

    this.guilds[guildId][channelId].channel = null;
    this.guilds[guildId][channelId].embedMessage = null;
  }

  #setChannel(guildId, channel) {
    this.#findOrInitGuild(guildId, channel.id);

    this.guilds[guildId][channel.id].channel = channel;
  }

  #setEmbedMessage(guildId, channelId, message) {
    this.#findOrInitGuild(guildId, channelId);

    this.guilds[guildId][channelId].embedMessage = message;
  }

  async #replayStartMessage(ins, guildId, channelId) {
    const channel = this.#findOrInitGuild(guildId, channelId).channel;

    const embed = new Embed(this.client.user.avatarURL(), channel);
    const message = await ins.reply(embed.getReplyOptions());
    await message.react(chooooserMessages.excludeReaction);

    this.#setEmbedMessage(guildId, channelId, message);

    this.#handleInstanceEvents(guildId, channelId, message);

    ins.channel.messages.fetch({ limit: 100 }).then(messages => {
      this.guilds[guildId][channelId].electedUsers = {};

      messages.forEach(message => {
        if (!message.member) return
        if (message.member.user.id !== this.client.user.id) return
        if (!message.content) return
        if (!new RegExp(`^${chooseMember("(.+)")}$`).test(message.content)) return

        message.mentions.members.forEach(member => {
          if (this.guilds[guildId][channelId].electedUsers[member.user.id]) {
            this.guilds[guildId][channelId].electedUsers[member.user.id]++
          } else {
            this.guilds[guildId][channelId].electedUsers[member.user.id] = 1
          }
        })
      })
    }).then(() => {
      this.#updateEmbed(channel, message);
    })
  }

  #handleInstanceEvents(guildId, channelId, message) {
    this.#handleJoinOrLeaveFromVoiceChannelEvent(guildId, channelId, message);
    this.#handleClickChooooserSimpleButtonEvent(guildId, channelId);
    this.#handleClickChooooserFairButtonEvent(guildId, channelId);
    this.#handleAddExcludeReactionEvent(guildId, channelId);
    this.#handleRemoveExcludeReactionEvent(guildId, channelId);
  }

  #handleJoinOrLeaveFromVoiceChannelEvent(guildId, channelId, message) {
    const callback = (oldState, newState) => {
      const channel = this.#findOrInitGuild(guildId, channelId).channel;

      switch (channel.id) {
        case newState.channelId:
          this.#updateEmbed(channel, message);
          break;
        case oldState.channelId:
          if (channel.members.size) {
            this.#updateEmbed(channel, message);
          } else {
            this.#resetHandlers(guildId, channelId);
          }
          break;
      }
    };

    this.client.on(Events.VoiceStateUpdate, callback);

    this.guilds[guildId][channelId].events.push({
      event: Events.VoiceStateUpdate,
      callback,
    });
  }

  #handleClickChooooserSimpleButtonEvent(guildId, channelId) {
    const callback = (interaction) => {
      if (!interaction.isButton()) return;
      if (
        interaction.customId !== `${channelId}-${chooooserMessages.name}-simple-button`
      )
        return;

      const excludeReaction = this.#getExcludeReaction(interaction.message);
      const channel = this.#findOrInitGuild(guildId, channelId).channel;
      const embed = new Embed(this.client.user.avatarURL(), channel, excludeReaction.users.cache.values());

      const member = embed.getTargetMembers().random();

      this.#replyChooseMember(interaction, member);
    };

    this.client.on(Events.InteractionCreate, callback);

    this.guilds[guildId][channelId].events.push({
      event: Events.InteractionCreate,
      callback,
    });
  }

  #handleClickChooooserFairButtonEvent(guildId, channelId) {
    const callback = (interaction) => {
      if (!interaction.isButton()) return;
      if (
        interaction.customId !== `${channelId}-${chooooserMessages.name}-fair-button`
      )
        return;

      const excludeReaction = this.#getExcludeReaction(interaction.message);
      const channel = this.#findOrInitGuild(guildId, channelId).channel;
      const embed = new Embed(this.client.user.avatarURL(), channel, excludeReaction.users.cache.values());

      embed.setElectedUsers(this.guilds[guildId][channelId].electedUsers)
      const rates = embed.getElectoralQuota()

      const targetMembers = []

      embed.getTargetMembers().forEach(member => {
        targetMembers.push(...Array(rates[member.user.id]).fill({ ...member }));
      })

      const member = targetMembers[Math.floor(Math.random() * targetMembers.length)];

      this.#replyChooseMember(interaction, member);
    };

    this.client.on(Events.InteractionCreate, callback);

    this.guilds[guildId][channelId].events.push({
      event: Events.InteractionCreate,
      callback,
    });
  }

  #handleAddExcludeReactionEvent(guildId, channelId) {
    const callback = (reaction, user) => {
      const guild = this.#findOrInitGuild(guildId, channelId);
      if (reaction.message.id !== guild.embedMessage.id) return;
      if (user.bot) return;
      if (reaction.emoji.name !== chooooserMessages.excludeReaction) return;

      this.#updateEmbed(guild.channel, reaction.message);
    };

    this.client.on(Events.MessageReactionAdd, callback);

    this.guilds[guildId][channelId].events.push({
      event: Events.MessageReactionAdd,
      callback,
    });
  }

  #handleRemoveExcludeReactionEvent(guildId, channelId) {
    const callback = (reaction) => {
      const guild = this.#findOrInitGuild(guildId, channelId);
      if (reaction.message.id !== guild.embedMessage.id) return;

      if (reaction.emoji.name !== chooooserMessages.excludeReaction) return;

      this.#updateEmbed(guild.channel, reaction.message);
    };

    this.client.on(Events.MessageReactionRemove, callback);

    this.guilds[guildId][channelId].events.push({
      event: Events.MessageReactionRemove,
      callback,
    });
  }

  #updateEmbed(channel, message) {
    const excludeReaction = this.#getExcludeReaction(message);
    const embed = new Embed(this.client.user.avatarURL(), channel, excludeReaction.users.cache.values());
    embed.setElectedUsers(this.guilds[channel.guildId][channel.id].electedUsers)
    message.edit(embed.getReplyOptions());
  }

  #getExcludeReaction(message) {
    return message.reactions.cache.find(
      (react) => react.emoji.name === chooooserMessages.excludeReaction
    );
  }

  #updateFinishedEmbed(guild) {
    guild.embedMessage.edit(new Embed(this.client.user.avatarURL(), guild.channel).getFinishedReplyOptions());
  }

  #removeEvents(guild) {
    guild.events.forEach(({ event, callback }) => {
      this.client.off(event, callback);
    });

    this.guilds[guild.guildId][guild.channel.id].events = [];
  }

  #findOrInitGuild(guildId, channelId) {
    if (!this.guilds[guildId]) {
      this.guilds[guildId] = {};
    }
    if (!this.guilds[guildId][channelId]) {
      this.guilds[guildId][channelId] = {
        guildId,
        channel: null,
        events: [],
        embedMessage: null,
        electedUsers: {},
      };
    }

    return this.guilds[guildId][channelId];
  }

  #replyChooseMember(r, member) {
    return r.reply(chooseMember(`<@${member.user.id}>`));
  }
};
