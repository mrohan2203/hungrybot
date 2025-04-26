require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const query = message.content.trim();

  // OPTIONAL: Only respond if question includes common food words
  const isCookingQuery = /(how to make|recipe|cook|prepare|ingredients|dish|food|meal|serve)/i.test(query);

  if (isCookingQuery) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Give a short cooking recipe for: ${query}` }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiReply = response.data.choices[0]?.message?.content || "I couldn't come up with a recipe!";

      message.reply(`🍽️ Here's a recipe idea:\n${aiReply}`);
    } catch (error) {
      console.error('AI error:', error);
      message.reply('❌ I had trouble finding a recipe. Try again later.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);