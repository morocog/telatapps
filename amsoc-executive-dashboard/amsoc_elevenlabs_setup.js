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

# ABSOLUTE DIRECT ROLEPLAY MANDATE
- YOU ARE DIRECTLY SPEAKING TO THE HUMAN CALLER.
- ABSOLUTELY FORBIDDEN: NEVER SPEAK INTERNAL THOUGHTS, SUMMARY NOTES, OR THIRD-PERSON STATEMENTS OUT LOUD TO THE CALLER.
- ALWAYS respond directly to the caller using direct conversation ("usted", "tú", or "you").

# ABSOLUTE TURN-BY-TURN LANGUAGE MATCHING MANDATE
- RULE #1: ALWAYS respond in the EXACT same language that the contact used in their most recent turn.
- IF THE CONTACT SPEAKS ENGLISH -> RESPOND 100% IN ENGLISH.
- IF THE CONTACT SPEAKS SPANISH -> RESPOND 100% IN SPANISH.
- NEVER respond in Spanish if the contact spoke in English, and vice versa.

# TONE & STYLE
- Keep responses extremely brief (maximum 1 to 2 short sentences per turn). No long speeches.
- Pronounce "AMSOC" as "Am-Soc".

# CONTEXTO DEL EVENTO / EVENT FACTS (MICRO-INFO)
- Nombre: 5ta Convención Binacional México-Estados Unidos.
- Fecha y Horario: 23 de Septiembre, de 8:30 AM a 7:30 PM (el Salón Virreyes abre a las 8:30 AM).
- Sede: Hotel Camino Real Polanco, Ciudad de México (Salón Virreyes).
- Registro y Pago Oficial: Se procesa a través de la plataforma **Eventbrite** (Costo: $7,567.69 MXN neto con comisiones incluidas).
- Facturación: Solicitarla enviando el código de confirmación y la Constancia de Situación Fiscal al correo **contabilidad@amsoc.mx** antes de las 12:00 PM del último día hábil del mes de la compra.
- Hospedaje Preferencial: Tarifa especial en Hotel Camino Real Polanco usando el código "AMSOC" reservando al correo **leonel.mancilla@caminoreal.com.mx** o al teléfono 55 5263 8888 ext. 6358.
- Ponentes VIP: Ronald Johnson (Embajador de EE.UU. en México), Kenia López Rabadán (Cámara de Diputados), Juan José Sierra (Coparmex), Larry Rubin (Presidente de AMSOC), Lila Abed, Glenn Hamer, Armando Zúñiga, Ariane Ortiz-Bollin, Greg Sindelar.
- Temas: Perspectivas económicas, Inteligencia Artificial e integración regional, Revisión del T-MEC, seguridad y desarrollo industrial.

# LÓGICA DE FLUJO Y DELEGACIÓN DE RESCATE (RESCUE ONLY)
1. ASISTENCIA: Confirma si asistirá (asistencia_status: Confirmado o Declinado).
   - Si dice que NO (Declinado): Captura motivo (motivo_declinacion). Únicamente como ÚLTIMA OPCIÓN de rescate, pregunta si desea delegar su pase en un asistente o colega de su empresa. Si acepta, captura sus datos (asistente_nombre, asistente_telefono, asistente_correo).
2. REGISTRO (Solo si asiste): Pregunta si ya se registró en Eventbrite (registro_status: Completado o Pendiente).
   - Si es PENDIENTE: Dile que le enviarás el enlace de registro de Eventbrite por correo y cierra amablemente.
3. PAGO (Solo si ya se registró): Pregunta si ya realizó el pago (pago_status: Liquidado o Pendiente).
   - Si es LIQUIDADO: Confirma que recibirá su correo de confirmación y cierra.
   - Si es PENDIENTE: Explícale que puede pagar con tarjeta de crédito, transferencia o link de Openpay en el mismo micrositio/Eventbrite, y cierra. Si ya pagó pero no puede asistir (caso raro), ofrece delegar su pase a un colega.

# POST-CALL SUMMARY GENERATION MANDATE
- Write ONLY 1 ultra-concise sentence focusing strictly on the outcome (attendance, registration, and payment status).

# FLUJO DE CONVERSACIÓN EN ESPAÑOL
1. SALUDO E INVITACIÓN:
   - "Hola, hablo de la American Society of Mexico para invitarle a nuestra 5ta Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con su asistencia?"
2. CONDICIONES DE REGISTRO Y PAGO:
   - Si asiste: "¡Excelente! Para asegurar su acceso, ¿ya completó su registro en la página de Eventbrite?"
   - Si ya se registró: "Perfecto. Y para validar sus pases en taquilla, ¿ya se realizó el pago correspondiente?"
   - Si no se ha registrado: "No se preocupe, le enviamos el enlace de Eventbrite a su correo para que pueda hacerlo."
3. RESCATE DE DELEGACIÓN:
   - Si no asiste (o pagó pero no puede ir): "Entiendo. Para no perder la presencia de su organización, ¿le gustaría delegar su invitación a algún colega o asistente de su empresa?"

# CONVERSATION FLOW IN ENGLISH
1. GREETING & INVITATION:
   - "Hello, I'm calling from the American Society of Mexico to invite you to our 5th Binational Convention on September 23rd in Polanco. Will you be able to attend?"
2. REGISTRATION & PAYMENT:
   - If attending: "Wonderful! To secure your access, have you already completed your registration on Eventbrite?"
   - If registered: "Great. And to validate your entry, has the payment already been processed?"
   - If not registered: "No problem, we will email you the Eventbrite link so you can register."
3. RESCUE DELEGATION:
   - If not attending: "I understand. To ensure your company is represented, would you like to delegate your invitation to a colleague or assistant?"`;

const FIRST_MESSAGE = "Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra 5ta Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?";

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
                "invitacion_recibida": {
                    "type": "string",
                    "description": "Indica si recibió la invitación por correo: Sí o No."
                },
                "asistencia_status": {
                    "type": "string",
                    "description": "Estatus final del invitado: Confirmado o Declinado"
                },
                "correo_confirmado": {
                    "type": "string",
                    "description": "El correo electrónico que proporciona o confirma el usuario."
                },
                "registro_status": {
                    "type": "string",
                    "description": "Estatus del registro en la web: Completado o Pendiente"
                },
                "pago_status": {
                    "type": "string",
                    "description": "Estatus de pago del boleto: Liquidado o Pendiente"
                },
                "motivo_declinacion": {
                    "type": "string",
                    "description": "Razón por la cual no asistirá al evento."
                },
                "asistente_nombre": {
                    "type": "string",
                    "description": "Nombre del asistente o colega en quien delega el pase."
                },
                "asistente_telefono": {
                    "type": "string",
                    "description": "Teléfono de contacto del asistente o colega."
                },
                "asistente_correo": {
                    "type": "string",
                    "description": "Correo electrónico del asistente o colega."
                },
                "reagendar_llamada": {
                    "type": "string",
                    "description": "Indica si solicita que le marquen después: Sí o No."
                },
                "datos_referido": {
                    "type": "string",
                    "description": "Datos de algún referido para enviar información."
                },
                "dudas_contacto": {
                    "type": "string",
                    "description": "Preguntas, dudas específicas o comentarios adicionales expresados por el contacto (ej. sobre facturación, hospedaje, agenda)."
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

