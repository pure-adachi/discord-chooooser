const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

exports.Embed = class Embed {
  constructor(channel, ignoreUsers = []) {
    this.channel = channel;
    this.ignoreUsers = [...ignoreUsers];
  }

  getReply() {
    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("customId")
        .setLabel("抽選開始！")
        .setStyle(ButtonStyle.Primary)
    );

    return {
      embeds: [this.generateEmbed()],
      components: [btn],
      fetchReply: true,
    };
  }

  generateEmbed() {
    const members = this.channel.members;
    const targetMembers = members.filter(
      (member) =>
        this.ignoreUsers.map(({ id }) => id).indexOf(member.user.id) < 0
    );

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${this.channel.name} チャンネルで抽選を行います。`)
      .setURL("https://github.com/pure-adachi/discord-chooooser")
      .setAuthor({
        name: "Chooooser",
        iconURL:
          "https://res.cloudinary.com/dbqa4qhvd/image/upload/v1669553905/chooooser_kdpyyw.png",
        url: "https://github.com/pure-adachi/discord-chooooser",
      })
      .addFields({
        name: "ChannelID",
        value: this.channel.id,
      })
      .addFields({
        name: "抽選対象数",
        value: `${targetMembers.size} / ${members.size}`,
      })
      .setFooter({
        text: "抽選対象から外して欲しい場合は、 ❌ のリアクションを押してください。",
      });

    members.each((member) => {
      const memberName = member.nickname || member.user.username;
      const isTarget =
        this.ignoreUsers.map(({ id }) => id).indexOf(member.user.id) < 0;

      embed.addFields({
        name: memberName,
        value: isTarget ? ":o:" : ":x:",
        inline: true,
      });
    });

    return embed;
  }
};
