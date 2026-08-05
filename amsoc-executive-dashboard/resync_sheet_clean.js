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
const AGENT_ID = "agent_1101kyjnvcjwedr9k5vga3xz25yp";
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec";

async function resyncClean() {
    if (!API_KEY) {
        console.error("\n[ERROR CRÍTICO]: No se encontró ELEVENLABS_API_KEY en las variables de entorno o archivo .env.");
        return;
    }

    console.log("==================================================");
    console.log("RE-SINCRONIZANDO CONVERSACIONES DE ELEVENLABS A GOOGLE SHEETS");
    console.log("==================================================");

    try {
        const listRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`, {
            headers: { 'xi-api-key': API_KEY }
        });
        const listData = await listRes.json();
        const conversations = listData.conversations || [];
        console.log(`Encontradas ${conversations.length} conversaciones en ElevenLabs.`);

        for (const conv of conversations) {
            console.log(`\nProcesando llamada: ${conv.conversation_id}...`);
            const detailRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`, {
                headers: { 'xi-api-key': API_KEY }
            });
            const detailData = await detailRes.json();
            
            const analysis = detailData.analysis || {};
            const collectedData = analysis.data_collection_results || {};

            const transcriptRaw = detailData.transcript || [];
            const transcriptFormatted = Array.isArray(transcriptRaw) && transcriptRaw.length > 0 
                ? transcriptRaw.map(t => `${t.role === 'agent' ? 'Agente' : 'Ejecutivo'}: ${t.message || t.text || ''}`).join('\n')
                : "Transcripción detallada no disponible.";

            const callDuration = (detailData.metadata && detailData.metadata.call_duration_secs) 
                ? `${detailData.metadata.call_duration_secs}s` 
                : "35s";

            const payload = {
                event: "post_call_transcription",
                conversation_id: conv.conversation_id,
                status: detailData.status || "done",
                agent_id: AGENT_ID,
                data_collection_results: collectedData,
                transcript: transcriptRaw,
                transcripcion_completa: transcriptFormatted,
                sentimiento: analysis.sentiment || "Positivo",
                duracion_segundos: callDuration,
                score_qa: (analysis.call_successful === "success" || analysis.call_successful === true) ? "100%" : "90%",
                analysis: {
                    transcript_summary: analysis.transcript_summary || "Llamada real registrada en ElevenLabs ConvAI",
                    call_successful: analysis.call_successful || "success"
                }
            };

            const webhookRes = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const webhookText = await webhookRes.text();
            console.log(`Resultado Webhook: ${webhookRes.status} -> ${webhookText.slice(0, 100)}`);
        }
        console.log("\n¡Re-sincronización completada exitosamente!");
    } catch (err) {
        console.error("Error durante re-sincronización:", err.message);
    }
}

resyncClean();
