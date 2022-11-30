const { Collection } = require("discord.js");
const { Embed } = require("./embed");

exports.Client = class Client {
  constructor(client) {
    this.client = client;
    this.events = [];
    this.channel = null;
    this.embedMessage = null;
  }

  login() {
    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  newCommands() {
    this.client.commands = new Collection();
  }

  setChannel(channel) {
    this.channel = channel;
  }

  setEmbedMessage(message) {
    this.embedMessage = message;
  }

  on(event, callback, isAdd = true) {
    if (isAdd) this.events.push({ event, callback });
    this.client.on(event, callback);
  }

  reset() {
    this.updateFinishedEmbed();
    this.removeAllEvents();
    this.channel = null;
    this.embedMessage = null;
  }

  updateFinishedEmbed() {
    if (!this.channel) return;
    if (!this.embedMessage) return;

    this.embedMessage.edit({
      embeds: [new Embed(this.channel).getFinishedEmbed()],
      components: [],
    });
  }

  removeAllEvents() {
    this.events.forEach(({ event, callback }) => {
      this.client.off(event, callback);
    });
    this.events = [];
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
