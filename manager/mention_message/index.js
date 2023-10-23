const { Events } = require("discord.js");
const { messages } = require("../messages");

exports.MentionMessage = class {
  constructor(clientManager) {
    this.clientManager = clientManager;
  }

  setHandlers() {
    this.clientManager.on(Events.MessageCreate, (message) => {
      const clientUser = this.clientManager.user();

      if (!message.mentions.users.has(clientUser.id)) return;
      if (message.author.id === clientUser.id) return;

      const voiceChannel = message.member.voice.channel;

      if (voiceChannel) {
        const member = voiceChannel.members.random();

        message.reply(messages.chooseMember(`<@${member.user.id}>`));
      } else {
        message.reply(messages.joinTheVoiceChannel);
      }
    });
  }
};
