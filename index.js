const { Client, GatewayIntentBits } = require("discord.js");
const { Manager } = require("./manager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const manager = new Manager(client);

manager.start();
