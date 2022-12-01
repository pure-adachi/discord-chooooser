const { Collection } = require("discord.js");
const { Embed } = require("./embed");

exports.Client = class Client {
  constructor(client) {
    this.client = client;
    this.guilds = {};
    // this.events = [];
    // this.channel = null;
    // this.embedMessage = null;
  }

  login() {
    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  newCommands() {
    this.client.commands = new Collection();
  }

  findOrInitGuild(guildId, channelId) {
    if (!this.guilds[guildId]) {
      this.guilds[guildId] = {};
    }
    if (!this.guilds[guildId][channelId]) {
      this.guilds[guildId][channelId] = {
        guildId,
        channel: null,
        events: [],
        embedMessage: null,
      };
    }

    return this.guilds[guildId][channelId];
  }

  setChannel(guildId, channel) {
    this.findOrInitGuild();

    this.guilds[guildId][channel.id].channel = channel;
  }

  setEmbedMessage(guildId, channelId, message) {
    this.findOrInitGuild();

    this.guilds[guildId][channelId].embedMessage = message;
  }

  handleOn(guildId, channelId, event, callback) {
    this.findOrInitGuild();

    this.guilds[guildId][channelId].events.push({ event, callback });
    this.on(event, callback);
  }

  reset(guildId, channelId) {
    const guild = this.findOrInitGuild(guildId, channelId);
    if (!guild.channel) return;
    if (!guild.embedMessage) return;

    this.updateFinishedEmbed(guild);
    this.removeEvents(guild);

    this.guilds[guildId][channelId].channel = null;
    this.guilds[guildId][channelId].embedMessage = null;
  }

  updateFinishedEmbed(guild) {
    guild.embedMessage.edit({
      embeds: [new Embed(guild.channel).getFinishedEmbed()],
      components: [],
    });
  }

  removeEvents(guild) {
    guild.events.forEach(({ event, callback }) => {
      this.client.off(event, callback);
    });
    this.guilds[guild.guildId][guild.channel.id].events = [];
  }

  // wrapper method
  on(event, callback) {
    this.client.on(event, callback);
  }

  // wrapper method
  user() {
    return this.client.user;
  }

  // wrapper method
  application() {
    return this.client.application;
  }

  // wrapper method
  channels() {
    return this.client.channels;
  }
};
