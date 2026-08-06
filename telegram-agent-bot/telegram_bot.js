require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.ALLOWED_CHAT_ID;

if (!token || !allowedChatId) {
  console.error('❌ ERROR: Falta TELEGRAM_BOT_TOKEN o ALLOWED_CHAT_ID en el archivo .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const WORKSPACE_DIR = path.resolve(__dirname, '..');

console.log('🚀 Telegram Agent Bot iniciado correctamente...');
console.log(`🔒 Modo seguro activo. Permitido solo para Chat ID: ${allowedChatId}`);

// Middleware de autorización
function isAuthorized(msg) {
  const chatId = msg.chat.id.toString();
  if (chatId !== allowedChatId.toString()) {
    console.warn(`⚠️ Intento no autorizado desde Chat ID: ${chatId}`);
    bot.sendMessage(chatId, '⛔ *Acceso Denegado*. Este bot está configurado en modo privado de seguridad.', { parse_mode: 'Markdown' });
    return false;
  }
  return true;
}

// Menú principal con teclado
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '📊 Estado Proyectos' }, { text: '🔄 Git Status' }],
      [{ text: '⚡ Ejecutar Git Push' }, { text: '❓ Ayuda' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// Comando /start o /help
bot.onText(/\/(start|help)/, (msg) => {
  if (!isAuthorized(msg)) return;

  const welcomeText = `🤖 *Bienvenido a tu Antigravity Agent Bot*\n\n` +
    `Estoy conectado con tu entorno de desarrollo en \`${WORKSPACE_DIR}\`.\n\n` +
    `*Comandos disponibles:*\n` +
    `• /status - Ver estado general de los proyectos\n` +
    `• /git - Ver estado de repositorios Git\n` +
    `• /cmd <comando> - Ejecutar comando de consola (ej. \`/cmd git status\`)\n` +
    `• /push - Hacer git push en proyectos activos\n\n` +
    `O usa los botones del menú desplegable abajo 👇`;

  bot.sendMessage(msg.chat.id, welcomeText, { parse_mode: 'Markdown', ...mainKeyboard });
});

// Manejo de mensajes de texto / botones
bot.on('message', (msg) => {
  if (!isAuthorized(msg)) return;
  if (!msg.text || msg.text.startsWith('/')) return;

  const text = msg.text.trim();

  if (text === '📊 Estado Proyectos') {
    getProjectsStatus(msg.chat.id);
  } else if (text === '🔄 Git Status') {
    getGitStatus(msg.chat.id);
  } else if (text === '⚡ Ejecutar Git Push') {
    executeGitPush(msg.chat.id);
  } else if (text === '❓ Ayuda') {
    bot.sendMessage(msg.chat.id, 'Puedes escribirme comandos directamente o seleccionar una de las opciones del menú.', mainKeyboard);
  } else {
    // Respuesta por defecto para texto libre
    bot.sendMessage(
      msg.chat.id,
      `📩 *Mensaje recibido:* "${text}"\n\nSi deseas ejecutar una orden en la consola, usa: \`/cmd ${text}\``,
      { parse_mode: 'Markdown', ...mainKeyboard }
    );
  }
});

// Comando /status
bot.onText(/\/status/, (msg) => {
  if (!isAuthorized(msg)) return;
  getProjectsStatus(msg.chat.id);
});

// Comando /git
bot.onText(/\/git/, (msg) => {
  if (!isAuthorized(msg)) return;
  getGitStatus(msg.chat.id);
});

// Comando /push
bot.onText(/\/push/, (msg) => {
  if (!isAuthorized(msg)) return;
  executeGitPush(msg.chat.id);
});

// Comando /cmd <comando>
bot.onText(/\/cmd (.+)/, (msg, match) => {
  if (!isAuthorized(msg)) return;
  const command = match[1];

  bot.sendMessage(msg.chat.id, `⏳ *Ejecutando:* \`${command}\`...`, { parse_mode: 'Markdown' });

  exec(command, { cwd: WORKSPACE_DIR }, (error, stdout, stderr) => {
    let output = '';
    if (stdout) output += stdout;
    if (stderr) output += `\n[STDERR]\n` + stderr;
    if (error) output += `\n[ERROR]\n` + error.message;

    if (!output.trim()) output = '✅ Comando ejecutado sin salida.';

    // Truncar si excede límite de Telegram (4000 chars)
    if (output.length > 3500) {
      output = output.substring(0, 3500) + '\n... (salida truncada)';
    }

    bot.sendMessage(msg.chat.id, `💻 *Resultado:* \n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  });
});

// Función auxiliar: Estado de proyectos
function getProjectsStatus(chatId) {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR, { withFileTypes: true });
    const dirs = files.filter(f => f.isDirectory() && !f.name.startsWith('.')).map(f => f.name);

    let report = `📂 *Proyectos en Workspace:* (${dirs.length})\n\n`;
    dirs.forEach(d => {
      report += `• \`${d}\`\n`;
    });

    bot.sendMessage(chatId, report, { parse_mode: 'Markdown' });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error al leer proyectos: ${err.message}`);
  }
}

// Función auxiliar: Git status
function getGitStatus(chatId) {
  const targetRepos = ['telatapps', 'Smart-Time-Blocks'];
  let statusReport = `🔄 *Estado Git de Repositorios:* \n\n`;

  let completed = 0;
  targetRepos.forEach(repo => {
    const repoPath = path.join(WORKSPACE_DIR, repo);
    if (fs.existsSync(repoPath)) {
      exec('git status --short', { cwd: repoPath }, (error, stdout) => {
        statusReport += `📁 *${repo}*:\n`;
        if (stdout.trim()) {
          statusReport += `\`\`\`\n${stdout.trim()}\n\`\`\`\n`;
        } else {
          statusReport += `✅ Limpio (sin cambios pendientes)\n\n`;
        }

        completed++;
        if (completed === targetRepos.length) {
          bot.sendMessage(chatId, statusReport, { parse_mode: 'Markdown' });
        }
      });
    } else {
      completed++;
      if (completed === targetRepos.length) {
        bot.sendMessage(chatId, statusReport, { parse_mode: 'Markdown' });
      }
    }
  });
}

// Función auxiliar: Git push
function executeGitPush(chatId) {
  bot.sendMessage(chatId, `⏳ *Haciendo backup y Git Push a GitHub...*`, { parse_mode: 'Markdown' });
  
  const targetRepo = path.join(WORKSPACE_DIR, 'telatapps');
  exec('git add . && git commit -m "update: automated commit via telegram bot" && git push', { cwd: targetRepo }, (error, stdout, stderr) => {
    let result = stdout || stderr || 'Sin cambios para subir.';
    bot.sendMessage(chatId, `🚀 *Resultado Push (telatapps):*\n\`\`\`\n${result}\n\`\`\``, { parse_mode: 'Markdown' });
  });
}
