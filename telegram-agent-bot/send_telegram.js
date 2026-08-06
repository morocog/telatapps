require('dotenv').config({ path: __dirname + '/.env' });
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.ALLOWED_CHAT_ID;

const message = process.argv.slice(2).join(' ');

if (!message) {
  console.log('Uso: node send_telegram.js "Mensaje a enviar"');
  process.exit(0);
}

if (!token || !allowedChatId) {
  console.error('❌ Falta TELEGRAM_BOT_TOKEN o ALLOWED_CHAT_ID en .env');
  process.exit(1);
}

const bot = new TelegramBot(token);

bot.sendMessage(allowedChatId, message, { parse_mode: 'Markdown' })
  .then(() => {
    console.log('✅ Notificación enviada a Telegram con éxito.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error al enviar notificación:', err.message);
    process.exit(1);
  });
