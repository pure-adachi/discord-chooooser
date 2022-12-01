const { Collection } = require("discord.js");
const { MentionMessage } = require("../mention_message");
const { messages } = require("../messages");
const { Chooooser } = require("../commands/chooooser");

exports.Client = class {
  constructor(client) {
    this.client = client;
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

  login() {
    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  setPresence() {
    this.client.user.setPresence({ game: { name: messages.name } });
  }

  handleMentionMessage() {
    const mentionMessage = new MentionMessage(this);
    mentionMessage.setHandlers();
  }

  addChooooserCommand() {
    this.client.commands = new Collection();
    this.client.application.commands.set(Chooooser.data);

    const command = new Chooooser(this.client);

    command.setHandlers();
  }
};
