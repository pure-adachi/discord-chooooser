const { Events } = require("discord.js");
const { Client } = require("./client");

exports.Manager = class {
  constructor(client) {
    this.clientManager = new Client(client);
  }

  start() {
    this.#setHandlers();

    this.clientManager.login();
  }

  #setHandlers() {
    this.#handleReady();
    this.#handleMessageCreate();
  }

  #handleReady() {
    this.clientManager.on(Events.ClientReady, () => {
      this.clientManager.setPresence();

      this.clientManager.addChooooserCommand();
    });
  }

  #handleMessageCreate() {
    this.clientManager.handleMentionMessage();
  }
};
