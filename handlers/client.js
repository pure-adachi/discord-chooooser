const { Collection } = require("discord.js");

exports.Client = class Client {
  constructor(client) {
    this.client = client;
    this.events = [];
  }

  login() {
    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  newCommands() {
    this.client.commands = new Collection();
  }

  on(event, callback) {
    this.events.push({ event, callback });
    this.client.on(event, callback);
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
