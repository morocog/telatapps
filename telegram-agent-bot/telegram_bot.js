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

console.log('🚀 Telegram Agent Bot (con Botones Interactivos) iniciado...');
console.log(`🔒 Modo seguro activo. Permitido solo para Chat ID: ${allowedChatId}`);

// Middleware de autorización
function isAuthorized(chatId) {
  if (chatId.toString() !== allowedChatId.toString()) {
    console.warn(`⚠️ Intento no autorizado desde Chat ID: ${chatId}`);
    bot.sendMessage(chatId, '⛔ *Acceso Denegado*. Este bot está configurado en modo privado de seguridad.', { parse_mode: 'Markdown' });
    return false;
  }
  return true;
}

// Menú permanente
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
  if (!isAuthorized(msg.chat.id)) return;

  const welcomeText = `🤖 *Antigravity Agent Bot con Botones Interactivos*\n\n` +
    `Estoy listo para recibir tus decisiones sin que tengas que escribir comandos.\n\n` +
    `*Comandos y Botones Disponibles:*\n` +
    `• Toca los botones abajo para acciones rápidas\n` +
    `• Cada notificación vendrá con sus propios botones de **Aprobar / Cancelar / Push**\n` +
    `• También puedes usar \`/cmd <comando>\` si lo necesitas.`;

  bot.sendMessage(msg.chat.id, welcomeText, { parse_mode: 'Markdown', ...mainKeyboard });
});

// Manejo de clicks en Botones de Notificación (Inline Keyboards)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  if (!isAuthorized(chatId)) return;

  const action = query.data;
  bot.answerCallbackQuery(query.id, { text: '¡Procesando acción en tu equipo!' });

  if (action === 'act_approve') {
    bot.editMessageText(`✅ *APROBADO DESDE TELEGRAM*\n\nAcción autorizada exitosamente. El trabajo continúa en tu equipo.`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    });
  } else if (action === 'act_reject') {
    bot.editMessageText(`❌ *CANCELADO / PAUSADO DESDE TELEGRAM*\n\nSe ha recibido la orden de detener el proceso.`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    });
  } else if (action === 'act_push') {
    bot.editMessageText(`⏳ *EJECUTANDO GIT PUSH DESDE TELEGRAM...*`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    });
    executeGitPush(chatId);
  } else if (action === 'act_status') {
    getGitStatus(chatId);
  } else if (action === 'act_projects') {
    getProjectsStatus(chatId);
  }
});

// Manejo de mensajes de texto / botones del teclado principal
bot.on('message', (msg) => {
  if (!isAuthorized(msg.chat.id)) return;
  if (!msg.text || msg.text.startsWith('/')) return;

  const text = msg.text.trim();

  if (text === '📊 Estado Proyectos') {
    getProjectsStatus(msg.chat.id);
  } else if (text === '🔄 Git Status') {
    getGitStatus(msg.chat.id);
  } else if (text === '⚡ Ejecutar Git Push') {
    executeGitPush(msg.chat.id);
  } else if (text === '❓ Ayuda') {
    bot.sendMessage(msg.chat.id, 'Selecciona una de las opciones del menú o presiona los botones de la última notificación.', mainKeyboard);
  } else {
    // Si el usuario escribe texto libre, le ofrecemos botones interactivos en lugar de obligarlo a usar la sintaxis /cmd
    bot.sendMessage(
      msg.chat.id,
      `📩 *Instrucción recibida:* "${text}"\n\n¿Qué deseas hacer con esta indicación?`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '▶️ Ejecutar como comando', callback_data: `act_cmd_${text}` },
              { text: '📊 Ver Estado', callback_data: 'act_status' }
            ]
          ]
        }
      }
    );
  }
});

// Comando /status
bot.onText(/\/status/, (msg) => {
  if (!isAuthorized(msg.chat.id)) return;
  getProjectsStatus(msg.chat.id);
});

// Comando /git
bot.onText(/\/git/, (msg) => {
  if (!isAuthorized(msg.chat.id)) return;
  getGitStatus(msg.chat.id);
});

// Comando /push
bot.onText(/\/push/, (msg) => {
  if (!isAuthorized(msg.chat.id)) return;
  executeGitPush(msg.chat.id);
});

// Comando /cmd <comando>
bot.onText(/\/cmd (.+)/, (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return;
  runSystemCommand(msg.chat.id, match[1]);
});

function runSystemCommand(chatId, command) {
  bot.sendMessage(chatId, `⏳ *Ejecutando:* \`${command}\`...`, { parse_mode: 'Markdown' });

  exec(command, { cwd: WORKSPACE_DIR }, (error, stdout, stderr) => {
    let output = '';
    if (stdout) output += stdout;
    if (stderr) output += `\n[STDERR]\n` + stderr;
    if (error) output += `\n[ERROR]\n` + error.message;

    if (!output.trim()) output = '✅ Comando ejecutado sin salida.';

    if (output.length > 3500) {
      output = output.substring(0, 3500) + '\n... (salida truncada)';
    }

    bot.sendMessage(chatId, `💻 *Resultado:* \n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  });
}

// Función auxiliar: Estado de proyectos
function getProjectsStatus(chatId) {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR, { withFileTypes: true });
    const dirs = files.filter(f => f.isDirectory() && !f.name.startsWith('.')).map(f => f.name);

    let report = `📂 *Proyectos en Workspace:* (${dirs.length})\n\n`;
    dirs.forEach(d => {
      report += `• \`${d}\`\n`;
    });

    bot.sendMessage(chatId, report, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Ver Git Status', callback_data: 'act_status' }, { text: '🚀 Git Push', callback_data: 'act_push' }]
        ]
      }
    });
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
          bot.sendMessage(chatId, statusReport, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚀 Subir Cambios (Git Push)', callback_data: 'act_push' }]
              ]
            }
          });
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
    bot.sendMessage(chatId, `🚀 *Resultado Push (telatapps):*\n\`\`\`\n${result}\n\`\`\``, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Ver Proyectos', callback_data: 'act_projects' }]
        ]
      }
    });
  });
}
