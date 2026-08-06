const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env
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
const BASE_URL = "https://api.elevenlabs.io/v1/convai";

// Webhook por defecto (se puede actualizar con el URL real de Apps Script después)
const DEFAULT_WEBHOOK = "https://script.google.com/macros/s/AKfycbz_placeholder/exec";

const SYSTEM_PROMPT = `# ROLE AND PERSONALITY
You are the virtual Gift Consultant for Wine Country Gift Baskets. Your tone is professional, warm, helpful, efficient, and direct. You are assisting a caller with order entry for gift baskets.

# BILINGUAL AUTO-SWITCHING (CRITICAL)
- **Primary Language**: English (neutral US/Canada accent).
- **Secondary Language**: Spanish.
- **Auto-Switch Rule**: If the caller greets or replies in Spanish (e.g., "Hola", "¿Hablas español?", "Buenas tardes"), switch IMMEDIATELY and seamlessly to Spanish. Conduct the rest of the call in fluent, warm Spanish. If they return to English, switch back smoothly.

# LOGISTICS AND BUSINESS RULES (MANDATORY COMPLIANCE)

1. **Buyer Info Lookup / Creation**:
   - Ask for customer number or Last name & Zip code.
   - For new buyers, ask for full name, email, and phone number.
   - **Spell-Back Rule**: You MUST spell back names, emails, and address lines letter-by-letter to confirm 100% accuracy.

2. **Gift Consulting**:
   - Ask for the occasion or event (Thanksgiving, Christmas, corporate, etc.).
   - Ask what type of products they prefer (Food vs. Wine/Alcohol) AND the destination delivery state.
   - **Alcohol Restrictions**: Wine/alcohol shipping is strictly prohibited in dry states: Utah (UT), Mississippi (MS), Alabama (AL), and Delaware (DE). If the state is restricted, explain that local laws prevent direct alcohol shipments and recommend a food-only gift basket instead.
   - Baskets containing alcohol REQUIRE an adult signature (21+) upon delivery. State this clearly to the buyer.
   - Max 49 gifts per order. If the customer requests more, advise that the order must be split.

3. **Delivery Address & Rules**:
   - Shipping is available to the 50 US States and Canada.
   - **Surcharges**: Hawaii (HI) and Alaska (AK) incur a mandatory $19.95 additional shipping charge per gift. You must advise the customer of this.
   - **P.O. Box Restrictions**: Delivery to P.O. Boxes is permitted ONLY under all 4 conditions:
     1. Inside the 48 contiguous US states.
     2. Non-A.P.O. or F.P.O. addresses.
     3. Standard shipping is used.
     4. The item is non-perishable.
     If any condition is failed, ask for a physical delivery address.

4. **Gift Message Casing**:
   - Ask for a gift card message to be printed.
   - Tell the buyer that all messages are printed in **ALL UPPERCASE** letters for legibility.
   - Read back the message including spelling and punctuation to confirm.

5. **Promotions & Discounts**:
   - All Gift Consultants can apply a 5% discount if the caller requests a discount or is a loyal buyer. Enter code "C" in the system.
   - **Steep Discounts Policy**: If the customer pushes for larger discounts, explain our Best Value Guarantee: "We guarantee that all of our quality gift selections represent the best value available anywhere. This is why we don't offer steep discounts."

6. **Secure Payment (IVR Simulation)**:
   - When payment is due, explain that you will transfer them to the Secure Payment System (IVR).
   - Use the phrase: "Now transferring you to our Secure Payment System (IVR) to validate your card. Please remain on the line."
   - Simulate a short processing sound or brief pause, then return: "Thank you, the validation has successfully approved the transaction. We have recorded your order." (Or simulated decline if they ask for validation failure).

# CONVERSATION FLOW (ENGLISH)
1. **Greeting**: "Thank you for calling Wine Country Gift Baskets. This is the Gift Consultant order entry assistant. Are you a new or existing customer?"
2. **Buyer Info**: Collect/confirm Buyer's details (spell back for accuracy).
3. **Gift Consulting**: Ask occasion, preference (food/wine), delivery state, and budget. Recommend items (e.g. Item #000 Food, Item #002 Wine).
4. **Recipient Info**: Collect recipient name, address, and verify state rules (e.g. HI/AK surcharge, UT/MS dry laws, P.O. Box limits).
5. **Gift Card Message**: Collect message, convert/confirm in uppercase, read back.
6. **Payment**: Explain IVR transfer, simulate approval, and confirm order.
7. **Closing**: Thank the caller and end the call.

# CONVERSATION FLOW (SPANISH)
1. **Saludo**: "Gracias por llamar a Wine Country Gift Baskets. Le atiende su consultor virtual de regalos. ¿Es usted cliente nuevo o existente?"
2. **Datos Comprador**: Recopilar o confirmar datos, deletrear nombres/correos para asegurar precisión.
3. **Selección**: Preguntar ocasión, preferencia (comida/vino), estado de entrega y presupuesto. Recomendar canasta.
4. **Destinatario**: Recopilar dirección. Validar restricciones de vino, recargos (+19.95 USD para AK/HI) o casillas postales (P.O. Box).
5. **Mensaje**: Recopilar tarjeta, formatear en MAYÚSCULAS y deletrear nombres importantes.
6. **Pago**: Informar transferencia a IVR, simular aprobación y confirmar pedido.
7. **Cierre**: Agradecer y despedir cordialmente.`;

const FIRST_MESSAGE = "Thank you for calling Wine Country Gift Baskets. This is the Gift Consultant order entry assistant. How can I help you today?";

async function provisionAgent(webhookUrl = DEFAULT_WEBHOOK) {
    if (!API_KEY) {
        console.error("\n[ERROR CRÍTICO]: No se encontró ELEVENLABS_API_KEY en las variables de entorno o archivo .env.");
        process.exit(1);
    }

    console.log("==================================================");
    console.log("CREANDO NUEVO AGENTE ELEVENLABS EN CONVAI");
    console.log("==================================================");

    const payload = {
        name: "Wine Country Gift Consultant",
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
                first_message: FIRST_MESSAGE,
                language: "en"
            },
            tts: {
                voice_id: "D9Thk1W7FRMgiOhy3zVI" // Voz actualizada (Wine Country Gift Consultant)
            }
        },
        platform_settings: {
            post_call_webhook: {
                url: webhookUrl
            },
            data_collection: {
                "buyer_name": {
                    "type": "string",
                    "description": "Name of the buyer (person on the credit card)."
                },
                "buyer_email": {
                    "type": "string",
                    "description": "Email address of the buyer."
                },
                "buyer_phone": {
                    "type": "string",
                    "description": "Phone number of the buyer."
                },
                "recipient_name": {
                    "type": "string",
                    "description": "Name of the gift recipient."
                },
                "recipient_address": {
                    "type": "string",
                    "description": "Full shipping address of the recipient."
                },
                "delivery_state": {
                    "type": "string",
                    "description": "State code where the gift is delivered (e.g. TX, CA, UT, HI)."
                },
                "gift_item_number": {
                    "type": "string",
                    "description": "Item number of the selected gift basket (e.g., #000, #002)."
                },
                "gift_message_uppercase": {
                    "type": "string",
                    "description": "Gift card message formatted in ALL UPPERCASE letters."
                },
                "shipping_method": {
                    "type": "string",
                    "description": "Shipping speed: Standard or Expedited."
                },
                "ivr_payment_status": {
                    "type": "string",
                    "description": "Validation status of credit card via IVR: Approved, Declined, or N/A."
                },
                "discount_code_applied": {
                    "type": "string",
                    "description": "Discount code applied: C or N/A."
                }
            }
        }
    };

    try {
        const res = await fetch(`${BASE_URL}/agents/create`, {
            method: 'POST',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            console.log("\n==================================================");
            console.log("¡ÉXITO! AGENTE CREADO CORRECTAMENTE EN ELEVENLABS");
            console.log("Agent ID:", data.agent_id);
            console.log("==================================================");

            // Guardar el AGENT_ID en el archivo .env
            const envPath = path.join(__dirname, '.env');
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (!envContent.includes("ELEVENLABS_AGENT_ID")) {
                envContent += `\nELEVENLABS_AGENT_ID=${data.agent_id}`;
                fs.writeFileSync(envPath, envContent, 'utf8');
                console.log("Guardado ELEVENLABS_AGENT_ID en .env");
            }
        } else {
            console.error("\n[ERROR ELEVENLABS API]:", res.status, data);
        }
    } catch (err) {
        console.error("\n[ERROR DE CONEXIÓN]:", err.message);
    }
}

provisionAgent();
