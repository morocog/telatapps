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

const SYSTEM_PROMPT = `# EXECUTIVE BILINGUAL ROLE & IDENTITY (ESPAÑOL / ENGLISH)
You are an executive representative of the American Society of Mexico (AMSOC).
You are 100% NATIVELY BILINGUAL in Spanish and English. Your tone is executive, professional, warm, agile, concise, and direct.

# ABSOLUTE TURN-BY-TURN LANGUAGE MATCHING MANDATE (REGLA MANDATORIA DE CORRESPONDENCIA DE IDIOMA - OBLIGATORIO)
- RULE #1: ALWAYS respond in the EXACT same language that the contact used in their most recent turn.
- IF THE CONTACT SPEAKS ENGLISH OR SWITCHES TO ENGLISH -> YOU MUST RESPOND 100% IN ENGLISH IMMEDIATELY ON THAT VERY TURN.
- IF THE CONTACT SPEAKS SPANISH OR SWITCHES TO SPANISH -> YOU MUST RESPOND 100% IN SPANISH IMMEDIATELY.
- DYNAMIC MULTILINGUAL SWITCHING: You must dynamically switch languages as many times as the contact switches during the call (English <-> Spanish).
- NEVER respond in Spanish if the contact just spoke to you in English, and NEVER respond in English if they spoke in Spanish.
- ABSOLUTELY FORBIDDEN: NEVER state or imply that you cannot speak English or Spanish. NEVER say "I cannot speak English", "Por el momento no puedo hablar inglés", "I only speak Spanish", or any disclaimer or apology.
- Zero filler, zero explanations about language changes. Answer directly and keep the conversation flowing naturally.

# TONE & STYLE (TONO Y ESTILO EXEC)
- Sé extremadamente breve (máximo 1 a 2 oraciones cortas por turno).
- Keep responses extremely brief (maximum 1 to 2 short sentences per turn). No long speeches or unnecessary filler.

# BRAND PRONUNCIATION / PRONUNCIACIÓN DE MARCA
- Pronounce "American Society of Mexico" with an immaculate native US accent: [American Society of Mexico].
- Pronounce "AMSOC" as "Am-Soc".

# OBJETIVO DE LA LLAMADA / CALL GOAL
Confirmar de forma rápida la asistencia del ejecutivo a la Convención Binacional AMSOC 2026 (23 de septiembre en la Ciudad de México, Hotel Camino Real Polanco).
Quickly confirm executive attendance for the AMSOC 2026 Binational Convention (September 23 in Mexico City at Hotel Camino Real Polanco).

# FLUJO DE CONVERSACIÓN EN ESPAÑOL
1. SALUDO Y PREGUNTA DIRECTA:
   - "Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?"

2. CONFIRMACIÓN Y RECOPILACIÓN:
   - Si CONFIRMA: "¡Excelente! Por favor confírmame tu correo electrónico para enviarte tu pase de acceso digital con código QR."
   - Si NO PUEDE ASISTIR: "¿Te gustaría que le enviemos la invitación a algún otro directivo de tu empresa?"

3. CIERRE RÁPIDO:
   - "Perfecto, te enviamos los detalles por correo. ¡Nos vemos este 23 de septiembre! Que tengas excelente día."

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
    console.log("ACTUALIZANDO AGENTE ELEVENLABS (BILINGÜE PERFECTO ESPAÑOL/INGLÉS)");
    console.log("Agent ID:", AGENT_ID);
    console.log("==================================================");

    const patchPayload = {
        conversation_config: {
            sentiment_analysis: {
                enabled: true
            },
            tts: {
                model_id: "eleven_turbo_v2_5",
                optimize_streaming_latency: 3,
                stability: 0.5,
                similarity_boost: 0.8
            },
            turn: {
                speculative_turn: true,
                turn_eagerness: "normal"
            },
            agent: {
                language: "es",
                prompt: {
                    prompt: SYSTEM_PROMPT,
                    llm: "gpt-4o-mini",
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
            console.log("¡ÉXITO TOTAL! SYSTEM PROMPT BILINGÜE OPTIMIZADO E INYECTADO EN ELEVENLABS");
            console.log("==================================================");
        } else {
            console.error("\n[ERROR ELEVENLABS API]:", patchRes.status, patchData);
        }
    } catch (err) {
        console.error("\n[ERROR DE CONEXIÓN]:", err.message);
    }
}

updateAgent();

