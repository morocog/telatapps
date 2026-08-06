require('dotenv').config({ path: __dirname + '/.env' });
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.ALLOWED_CHAT_ID;

if (!token || !allowedChatId) {
  console.error('❌ Falta TELEGRAM_BOT_TOKEN o ALLOWED_CHAT_ID en .env');
  process.exit(1);
}

const args = process.argv.slice(2);
let message = '';
let buttonType = 'decision'; // default: decision buttons

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' && args[i + 1]) {
    buttonType = args[i + 1];
    i++;
  } else {
    message += (message ? ' ' : '') + args[i];
  }
}

if (!message) {
  console.log('Uso: node send_telegram.js "Mensaje a enviar" [--type decision|push|info]');
  process.exit(0);
}

const bot = new TelegramBot(token);

let replyOptions = { parse_mode: 'Markdown' };

if (buttonType === 'decision') {
  replyOptions.reply_markup = {
    inline_keyboard: [
      [
        { text: '✅ Aprobar y Continuar', callback_data: 'act_approve' },
        { text: '❌ Cancelar / Pausar', callback_data: 'act_reject' }
      ],
      [
        { text: '🚀 Ejecutar Git Push', callback_data: 'act_push' },
        { text: '🔄 Ver Git Status', callback_data: 'act_status' }
      ]
    ]
  };
} else if (buttonType === 'push') {
  replyOptions.reply_markup = {
    inline_keyboard: [
      [
        { text: '🚀 Hacer Git Push Ahora', callback_data: 'act_push' },
        { text: '📊 Ver Proyectos', callback_data: 'act_projects' }
      ]
    ]
  };
}

bot.sendMessage(allowedChatId, message, replyOptions)
  .then(() => {
    console.log('✅ Notificación con botones enviada a Telegram con éxito.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error al enviar notificación:', err.message);
    process.exit(1);
  });
