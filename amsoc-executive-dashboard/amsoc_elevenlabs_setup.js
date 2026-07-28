const API_KEY = "sk_25b25a8b26b88709860d8694982e9c75236a123c5afe4f0f";
const AGENT_ID = "agent_1101kyjnvcjwedr9k5vga3xz25yp";
const BASE_URL = "https://api.elevenlabs.io/v1/convai";
const DEFAULT_WEBHOOK = "https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec";

const SYSTEM_PROMPT = `# ROL Y PERSONALIDAD
Eres un representante ejecutivo de la American Society of Mexico (AMSOC). Tu tono es profesional, cálido, ágil y muy directo. Hablas un español neutro y fluido.

# GUÍA DE PRONUNCIACIÓN DE MARCA
- Pronuncia "American Society of Mexico" siempre con acento nativo estadounidense impecable: [American Society of Mexico].
- Pronuncia la sigla "AMSOC" como "Am-Soc".

# OBJETIVO DE LA LLAMADA
Confirmar de forma rápida la asistencia del ejecutivo a la Convención Binacional AMSOC 2026 (23 de septiembre en la Ciudad de México).

# INSTRUCCIÓN DE AGILIDAD EXTREMA
- Sé extremadamente breve (máximo 1 a 2 oraciones cortas por turno).
- No des discursos ni introducciones largas. Ve directo al propósito y haz la pregunta de confirmación de inmediato.

# FLUJO DE CONVERSACIÓN
1. SALUDO Y PREGUNTA DIRECTA:
   - "Hola {{nombre_contacto}}, habla un ejecutivo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?"

2. CONFIRMACIÓN Y RECOPILACIÓN:
   - Si CONFIRMA: "¡Excelente! Por favor confírmame tu correo electrónico para enviarte el código QR de acceso."
   - Si NO PUEDE ASISTIR: "¿Te gustaría que le enviemos la invitación a algún otro directivo de tu empresa?"

3. CIERRE RÁPIDO:
   - "Perfecto, te enviamos la agenda por correo. ¡Nos vemos este 23 de septiembre! Que tengas excelente día."`;

const FIRST_MESSAGE = "Hola {{nombre_contacto}}, habla un ejecutivo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?";

async function updateAgent(webhookUrl = DEFAULT_WEBHOOK) {
    console.log("==================================================");
    console.log("ACTUALIZANDO AGENTE ELEVENLABS (ULTRA DIRECTO & AGIL)");
    console.log("Agent ID:", AGENT_ID);
    console.log("==================================================");

    const patchPayload = {
        conversation_config: {
            agent: {
                prompt: {
                    prompt: SYSTEM_PROMPT
                },
                first_message: FIRST_MESSAGE,
                language: "es"
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
        console.log("¡ÉXITO! SYSTEM PROMPT ULTRA DIRECTO INYECTADO");
        console.log("==================================================");
    } else {
        console.error("\n[ERROR]:", patchRes.status, patchData);
    }
}

updateAgent();
