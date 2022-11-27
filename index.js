const { Client, GatewayIntentBits } = require("discord.js");
const { handleReady } = require("./handlers/ready");
const { handleMessage } = require("./handlers/message");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

handleReady(client);
handleMessage(client);

client.login(process.env.DISCORD_BOT_TOKEN);
