const { Client, GatewayIntentBits } = require("discord.js");
const https = require("https");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const CHANNELS = {
  "1379039190024589472": "https://n8n.b-pro.uk/webhook/discord-live",
  "1428290261288489085": "https://n8n.b-pro.uk/webhook/discord-dev",
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const webhookUrl = CHANNELS[message.channelId];
  if (!webhookUrl) return;

  const payload = JSON.stringify({
    channel: { id: message.channelId, name: message.channel.name },
    author: {
      username: message.author.username,
      displayName: message.member?.displayName || message.author.username,
    },
    content: message.content,
    attachments: message.attachments.map((a) => ({ url: a.url, name: a.name })),
  });

  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const req = https.request(options, (res) => {
    console.log(`📤 Forwarded [${message.channelId}] from ${message.author.username} — status: ${res.statusCode}`);
  });

  req.on("error", (err) => console.error("❌ Webhook error:", err.message));
  req.write(payload);
  req.end();
});

client.login(BOT_TOKEN);
