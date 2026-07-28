/**
 * ==============================================================================
 * SCRIPT DE LLAMADA SALIENTE REAL (ELEVENLABS CONVAI + TWILIO US TRIAL)
 * Número Emisor: +1 662 374 7937 (Greenwood, MS)
 * Uso: node amsoc_test_call.js +5255XXXXXXXX "Nombre del Contacto"
 * ==============================================================================
 */

const API_KEY = "sk_25b25a8b26b88709860d8694982e9c75236a123c5afe4f0f";
const AGENT_ID = "agent_1101kyjnvcjwedr9k5vga3xz25yp";
const PHONE_NUMBER_ID = "phnum_8401kyk397s3e58rqh7rykh38hpm"; // US Twilio Number: +1 662 374 7937

async function triggerOutboundCall(targetPhone, targetName = "Luis Cortina") {
    if (!targetPhone) {
        console.log("\n[USO]: node amsoc_test_call.js +5255XXXXXXXX \"Nombre del Director\"");
        return;
    }

    // Asegurar formato internacional +52
    let formattedPhone = targetPhone.trim();
    if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+52" + formattedPhone.replace(/\D/g, "");
    }

    console.log("==================================================");
    console.log("DISPARANDO LLAMADA SALIENTE REAL (TWILIO US NUMBER)");
    console.log("Remitente (Twilio US): +1 662 374 7937");
    console.log("Teléfono Destino:", formattedPhone);
    console.log("Nombre del Contacto:", targetName);
    console.log("==================================================");

    const url = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call";

    const payload = {
        agent_id: AGENT_ID,
        agent_phone_number_id: PHONE_NUMBER_ID,
        to_number: formattedPhone,
        conversation_initiation_client_data: {
            dynamic_variables: {
                nombre_contacto: targetName
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
            console.log("2. Habla con el agente (ej. 'Sí confirmo mi asistencia, mi correo es luis@empresa.com').");
            console.log("3. Al colgar, revisa tu Google Sheet y Dashboard en vivo.");
        } else {
            console.log("\n[RESPUESTA ELEVENLABS / TWILIO]:");
            console.log("Status Code:", res.status);
            console.log("Mensaje:", data.message || data);
        }
    } catch (err) {
        console.error("Error de conexión:", err.message);
    }
}

const phone = process.argv[2] || "+525552483354";
const name = process.argv[3] || "Luis Cortina";
triggerOutboundCall(phone, name);
