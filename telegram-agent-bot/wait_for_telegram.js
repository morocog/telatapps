const fs = require('fs');
const path = require('path');

const respFile = path.join(__dirname, 'telegram_response.json');

// Si el archivo ya existe, lo borramos para asegurar que esperamos una decisión NUEVA
if (fs.existsSync(respFile)) {
  fs.unlinkSync(respFile);
}

console.log('⏳ Esperando la decisión del usuario vía Telegram...');

const interval = setInterval(() => {
  if (fs.existsSync(respFile)) {
    try {
      const content = fs.readFileSync(respFile, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`✅ DECISIÓN RECIBIDA: ${data.action}`);
      fs.unlinkSync(respFile); // Limpiar para el futuro
      clearInterval(interval);
      
      // Salir con 0 para éxito (Approve), 1 para rechazo (Reject)
      if (data.action === 'act_approve') {
        process.exit(0);
      } else {
        console.error('❌ El usuario ha cancelado/rechazado la acción en Telegram.');
        process.exit(1);
      }
    } catch (err) {
      // Si el archivo se está escribiendo, ignorar hasta el próximo tick
    }
  }
}, 1000);
