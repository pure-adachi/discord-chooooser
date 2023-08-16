const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const {
  messages: {
    name,
    gitHubUrl,
    iconURL,
    commands: { chooooser: chooooserMessages },
  },
} = require("../../../messages");

exports.Embed = class {
  constructor(channel, ignoreUsers = []) {
    this.channel = channel;
    this.ignoreUsers = [...ignoreUsers];
  }

  getReplyOptions() {
    return {
      embeds: [this.#getEmbed()],
      components: [this.#getBtnComponent()],
      fetchReply: true,
    };
  }

  getTargetMembers() {
    return this.#getChannelMembers().filter(
      (member) =>
        this.ignoreUsers.map(({ id }) => id).indexOf(member.user.id) < 0
    );
  }

  getFinishedReplyOptions() {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(chooooserMessages.embedFinishedTitle(this.channel.name))
      .setURL(gitHubUrl)
      .setAuthor({
        name,
        iconURL,
        url: gitHubUrl,
      });

    return {
      embeds: [embed],
      components: [],
    };
  }

  #getEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(chooooserMessages.embedTitle(this.channel.name))
      .setURL(gitHubUrl)
      .setAuthor({
        name,
        iconURL,
        url: gitHubUrl,
      })
      .addFields({
        name: chooooserMessages.channelId,
        value: this.channel.id,
      })
      .addFields({
        name: chooooserMessages.targetCount,
        value: chooooserMessages.targetCountValue(
          this.getTargetMembers().size,
          this.#getChannelMembers().size
        ),
      })
      .setFooter({
        text: chooooserMessages.embedFooter,
      });

    this.#getChannelMembers().each((member) => {
      const isTarget =
        this.ignoreUsers.map(({ id }) => id).indexOf(member.user.id) < 0;

      embed.addFields({
        name: member.displayName,
        value: isTarget ? ":o:" : ":x:",
        inline: true,
      });
    });

    return embed;
  }

  #getBtnComponent() {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${this.channel.id}-${chooooserMessages.name}-button`)
        .setLabel(chooooserMessages.start)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.getTargetMembers().size === 0)
    );
  }

  #getChannelMembers() {
    return this.channel.members;
  }
};
