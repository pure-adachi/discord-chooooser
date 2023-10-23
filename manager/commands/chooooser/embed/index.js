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
    commands: { chooooser: chooooserMessages },
  },
} = require("../../../messages");

exports.Embed = class {
  constructor(iconURL, channel, ignoreUsers = []) {
    this.iconURL = iconURL;
    this.channel = channel;
    this.ignoreUsers = [...ignoreUsers];
    this.electedUsers = {};
  }

  setElectedUsers(electedUsers) {
    this.electedUsers = electedUsers
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

  getElectoralQuota() {
    let totalCount = 0;
    let totalUnElectedCount = 0;

    this.getTargetMembers().forEach(member => {
      if (this.electedUsers[member.user.id]) {
        totalCount += this.electedUsers[member.user.id]
      }
    })

    const unElected = {}

    this.getTargetMembers().forEach(member => {
      const count = this.electedUsers[member.user.id] || 0
      unElected[member.user.id] = 1 + (totalCount - count)
      totalUnElectedCount += unElected[member.user.id]
    })

    const resultRates = {}

    for (let [userId, count] of Object.entries(unElected)) {
      resultRates[userId] = Math.floor(count / totalUnElectedCount * 100);
    }

    return resultRates
  }

  getFinishedReplyOptions() {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(chooooserMessages.embedFinishedTitle(this.channel.name))
      .setURL(gitHubUrl)
      .setAuthor({
        name,
        iconURL: this.iconURL,
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
        iconURL: this.iconURL,
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
      })

    const rates = this.getElectoralQuota()

    this.#getChannelMembers().each((member) => {
      const rate = rates[member.user.id] || 0;
      const isTarget =
        this.ignoreUsers.map(({ id }) => id).indexOf(member.user.id) < 0;

      embed.addFields({
        name: `${member.displayName}(${rate}%)`,
        value: isTarget ? ":o:" : ":x:",
        inline: true,
      });
    });

    return embed;
  }

  #getBtnComponent() {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${this.channel.id}-${chooooserMessages.name}-simple-button`)
        .setLabel(chooooserMessages.startSimpleLottery)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.getTargetMembers().size === 0),
      new ButtonBuilder()
        .setCustomId(`${this.channel.id}-${chooooserMessages.name}-fair-button`)
        .setLabel(chooooserMessages.startFairLottery)
        .setStyle(ButtonStyle.Success)
        .setDisabled(this.getTargetMembers().size === 0)
    );
  }

  #getChannelMembers() {
    return this.channel.members;
  }
};
