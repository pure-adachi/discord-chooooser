// const wait = require("node:timers/promises").setTimeout;
const {
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} = require("discord.js");

exports.handleMessage = (client) => {
  client.on("messageCreate", async (message) => {
    const memtion = message.mentions.members.first();

    if (!memtion) return;
    if (memtion.user.id !== client.user.id) return;
    if (message.author.id === client.user.id) return;

    const channels = message.guild.channels;
    const voiceChannel = channels.cache.find((ch) => {
      if (ch.type !== ChannelType.GuildVoice) {
        return false;
      }

      return ch.members.some((member) => member.user.id === message.author.id);
    });

    if (voiceChannel) {
      const members = voiceChannel.members.map(
        (member) => member.nickname || member.user.username
      );
      const length = members.length;
      console.log("message", message.content);
      // const rand = Math.floor(Math.random() * length);

      // message.channel.send(`選ばれたのは ${members[rand]} さんです。`);

      let fields = [
        {
          name: "対象者数",
          value: `${length} / ${length}`,
          inline: false,
        },
      ];

      voiceChannel.members.forEach((member) => {
        const name = member.nickname || member.user.username;

        fields = [
          ...fields,
          {
            name,
            value: ":o:",
            inline: true,
          },
        ];
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("primary")
          .setLabel("抽選スタート")
          .setStyle(ButtonStyle.Primary)
      );

      const msg = await message.reply({
        embeds: [
          {
            color: 0x0099ff,
            title: "抽選します。",
            url: "https://github.com/pure-adachi/discord-chooooser",
            author: {
              name: "Chooooser",
              icon_url:
                "https://res.cloudinary.com/dbqa4qhvd/image/upload/v1669553905/chooooser_kdpyyw.png",
              url: "https://github.com/pure-adachi/discord-chooooser",
            },
            thumbnail: {
              url: "https://res.cloudinary.com/dbqa4qhvd/image/upload/v1669553905/chooooser_kdpyyw.png",
            },
            fields,
            timestamp: new Date().toISOString(),
            footer: {
              text: `除外して欲しい人は、 ❌ のリアクションを押してください。`,
            },
          },
        ],
        components: [row],
      });
      await msg.react("❌");

      const filter = (reaction) => {
        return ["❌"].includes(reaction.emoji.name);
      };

      msg
        .awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] })
        .then((collected) => {
          console.log("❌のリアクションされました", collected);
        });
    } else {
      message.reply("ボイスチャンネルに入室しましょう");
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.reply({
      content: "I think you should,",
    });
  });
};
