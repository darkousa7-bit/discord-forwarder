const { Client, GatewayIntentBits } = require("discord.js");
const https = require("https");

// ─── CONFIG ───────────────────────────────────────────────
const BOT_TOKEN    = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID   = "1428290261288489085";
const N8N_WEBHOOK  = "https://n8n.b-pro.uk/webhook/discord-forward";
// ──────────────────────────────────────────────────────────

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
  // Only forward from the target channel, ignore bots
  if (message.channelId !== CHANNEL_ID) return;
  if (message.author.bot) return;

  const payload = JSON.stringify({
    channelId: message.channelId,
    username:  message.author.username,
    content:   message.content,
    attachments: message.attachments.map((a) => ({ url: a.url, name: a.name })),
  });

  const url = new URL(N8N_WEBHOOK);
  const options = {
    hostname: url.hostname,
    path:     url.pathname,
    method:   "POST",
    headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
  };

  const req = https.request(options, (res) => {
    console.log(`📤 Forwarded message from ${message.author.username} — status: ${res.statusCode}`);
  });

  req.on("error", (err) => console.error("❌ Webhook error:", err.message));
  req.write(payload);
  req.end();
});

client.login(BOT_TOKEN);
