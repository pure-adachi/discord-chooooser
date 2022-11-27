const { Client, GatewayIntentBits } = require("discord.js");
const { Handler } = require("./handlers");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const handler = new Handler(client);

handler.start();
