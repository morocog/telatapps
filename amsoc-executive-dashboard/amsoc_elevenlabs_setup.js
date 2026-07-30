const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env de forma segura
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
const AGENT_ID = "agent_1101kyjnvcjwedr9k5vga3xz25yp";
const BASE_URL = "https://api.elevenlabs.io/v1/convai";
const DEFAULT_WEBHOOK = "https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec";

const SYSTEM_PROMPT = `# ROL Y PERSONALIDAD / ROLE & PERSONALITY
Eres un representante ejecutivo de la American Society of Mexico (AMSOC). Tu tono es profesional, cálido, ágil, pulcro y muy directo. Hablas español de forma nativa e inglés fluido nativo.
You are an executive representative of the American Society of Mexico (AMSOC). Your tone is professional, warm, agile, concise, and direct.

# ADAPTACIÓN MULTILINGÜE BILINGÜE (BILINGUAL AUTO-SWITCHING) - CRÍTICO
- IDIOMA PRINCIPAL: Español neutro profesional.
- CAMBIO DE IDIOMA AUTOMÁTICO (AUTO-SWITCHING): Si la persona con la que hablas responde en inglés, te saluda en inglés (ej: "Hello", "Hi", "Good morning") o te pide cambiar de idioma (ej: "Can we speak in English?", "Do you speak English?"), CAMBIA DE INMEDIATO Y SIN FRICCIÓN A INGLÉS NATIVO Y FLUIDO.
- NO pidas disculpas ni hagas comentarios innecesarios sobre el cambio de idioma. Simplemente responde de manera directa y ejecutiva en inglés.
- Si la persona regresa a hablar en español, regresa suavemente al español sin interrupciones.

# GUÍA DE PRONUNCIACIÓN DE MARCA / BRAND PRONUNCIATION
- Pronuncia "American Society of Mexico" siempre con acento nativo estadounidense impecable: [American Society of Mexico].
- Pronuncia la sigla "AMSOC" como "Am-Soc".

# OBJETIVO DE LA LLAMADA / CALL GOAL
Confirmar de forma rápida la asistencia del ejecutivo a la Convención Binacional AMSOC 2026 (23 de septiembre en la Ciudad de México, Hotel Camino Real Polanco).
Quickly confirm executive attendance for the AMSOC 2026 Binational Convention (September 23 in Mexico City at Camino Real Polanco).

# INSTRUCCIÓN DE AGILIDAD EXTREMA / BREVITY
- Sé extremadamente breve (máximo 1 a 2 oraciones cortas por turno).
- Keep responses extremely brief (maximum 1 to 2 short sentences per turn).
- No des discursos ni introducciones largas. Ve directo al propósito.

# FLUJO DE CONVERSACIÓN EN ESPAÑOL
1. SALUDO Y PREGUNTA DIRECTA:
   - "Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?"

2. CONFIRMACIÓN Y RECOPILACIÓN:
   - Si CONFIRMA: "¡Excelente! Por favor confírmame tu correo electrónico para enviarte el código QR de acceso."
   - Si NO PUEDE ASISTIR: "¿Te gustaría que le enviemos la invitación a algún otro directivo de tu empresa?"

3. CIERRE RÁPIDO:
   - "Perfecto, te enviamos la agenda por correo. ¡Nos vemos este 23 de septiembre! Que tengas excelente día."

# CONVERSATION FLOW IN ENGLISH
1. GREETING & DIRECT QUESTION:
   - "Hello, I'm calling from the American Society of Mexico to invite you to our Binational Convention on September 23rd in Polanco. Will you be able to attend?"

2. CONFIRMATION & DATA COLLECTION:
   - If CONFIRMED: "Wonderful! Please confirm your email address so we can send your digital QR access pass."
   - If UNABLE TO ATTEND: "Would you like us to send the invitation to another executive from your organization?"

3. QUICK CLOSING:
   - "Great, we will email you the agenda and access pass. We look forward to seeing you on September 23rd! Have a great day."`;

const FIRST_MESSAGE = "Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?";

async function updateAgent(webhookUrl = DEFAULT_WEBHOOK) {
    if (!API_KEY) {
        console.error("\n[ERROR CRÍTICO]: No se encontró ELEVENLABS_API_KEY en las variables de entorno o archivo .env.");
        process.exit(1);
    }

    console.log("==================================================");
    console.log("ACTUALIZANDO AGENTE ELEVENLABS (BILINGÜE ESPAÑOL/INGLÉS)");
    console.log("Agent ID:", AGENT_ID);
    console.log("==================================================");

    const patchPayload = {
        conversation_config: {
            agent: {
                prompt: {
                    prompt: SYSTEM_PROMPT,
                    built_in_tools: {
                        language_detection: {
                            name: "language_detection"
                        }
                    }
                },
                first_message: FIRST_MESSAGE
            }
        },
        platform_settings: {
            post_call_webhook: {
                url: webhookUrl
            },
            data_collection: {
                "estatus_asistencia": {
                    "type": "string",
                    "description": "Estatus final del invitado: Confirmado, Rechazado, Transfiere_Lugar o Indeciso"
                },
                "correo_confirmado": {
                    "type": "string",
                    "description": "El correo electrónico que proporciona o confirma el usuario para su acceso."
                },
                "nombre_representante": {
                    "type": "string",
                    "description": "Nombre del colega que asistirá en su lugar."
                },
                "motivo_rechazo": {
                    "type": "string",
                    "description": "Razón por la cual no asistirá al evento."
                }
            }
        }
    };

    try {
        const patchRes = await fetch(`${BASE_URL}/agents/${AGENT_ID}`, {
            method: 'PATCH',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchPayload)
        });

        const patchData = await patchRes.json();
        if (patchRes.ok) {
            console.log("\n==================================================");
            console.log("¡ÉXITO TOTAL! SYSTEM PROMPT BILINGÜE INYECTADO CORRECTAMENTE");
            console.log("==================================================");
        } else {
            console.error("\n[ERROR ELEVENLABS API]:", patchRes.status, patchData);
        }
    } catch (err) {
        console.error("\n[ERROR DE CONEXIÓN]:", err.message);
    }
}

updateAgent();
