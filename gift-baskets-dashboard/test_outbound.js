/**
 * ==============================================================================
 * SCRIPT DE LLAMADA SALIENTE REAL (ELEVENLABS CONVAI + TWILIO US)
 * Proyecto: Wine Country Gift Consultant (Order Entry Campaign)
 * Uso: node test_outbound.js +5255XXXXXXXX "Nombre del Cliente"
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
    }
}
loadEnv();

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID; 

// Teléfono de salida registrado en el dashboard de ElevenLabs (Twilio US Number)
const PHONE_NUMBER_ID = "phnum_8401kyk397s3e58rqh7rykh38hpm"; // Reutiliza el número de Telat

async function triggerOutboundCall(targetPhone, targetName = "Cliente Demo") {
    if (!API_KEY) {
        console.error("\n[ERROR CRÍTICO]: No se encontró ELEVENLABS_API_KEY en las variables de entorno o archivo .env.");
        return;
    }
    
    if (!AGENT_ID) {
        console.error("\n[ERROR]: No se encontró ELEVENLABS_AGENT_ID. Asegúrate de ejecutar primero 'node setup_agent.js'.");
        return;
    }

    if (!targetPhone) {
        console.log("\n[USO]: node test_outbound.js +5255XXXXXXXX \"Nombre del Comprador\"");
        return;
    }

    // Asegurar formato internacional +52 o prefijo indicado
    let formattedPhone = targetPhone.trim();
    if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+52" + formattedPhone.replace(/\D/g, "");
    }

    console.log("==================================================");
    console.log("DISPARANDO LLAMADA SALIENTE REAL (WINE COUNTRY IA)");
    console.log("Remitente (Twilio US): +1 662 374 7937");
    console.log("Teléfono Destino:", formattedPhone);
    console.log("Nombre del Comprador:", targetName);
    console.log("ElevenLabs Agent ID:", AGENT_ID);
    console.log("==================================================");

    const url = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call";

    const payload = {
        agent_id: AGENT_ID,
        agent_phone_number_id: PHONE_NUMBER_ID,
        to_number: formattedPhone,
        conversation_initiation_client_data: {
            dynamic_variables: {
                buyer_name: targetName
            }
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (data.success) {
            console.log("\n[¡ÉXITO TOTAL!] La llamada saliente está sonando en tu teléfono celular.");
            console.log("Conversation ID:", data.conversation_id);
            console.log("Twilio Call SID:", data.callSid);
            console.log("\nInstrucciones para la Demo:");
            console.log("1. Contesta la llamada en tu celular.");
            console.log("2. Interactúa con el consultor de regalos de Wine Country (ej. haz preguntas, deletrea tu correo).");
            console.log("3. Al colgar, revisa tu Google Sheet y tu Dashboard interactivo.");
        } else {
            console.log("\n[RESPUESTA ELEVENLABS / TWILIO]:");
            console.log("Status Code:", res.status);
            console.log("Mensaje:", data.message || data);
        }
    } catch (err) {
        console.error("Error de conexión:", err.message);
    }
}

const phone = process.argv[2];
const name = process.argv[3] || "Luis Cortina";

triggerOutboundCall(phone, name);
