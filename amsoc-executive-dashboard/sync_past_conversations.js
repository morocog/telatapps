const API_KEY = "sk_25b25a8b26b88709860d8694982e9c75236a123c5afe4f0f";
const AGENT_ID = "agent_1101kyjnvcjwedr9k5vga3xz25yp";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec";

async function syncPastConversations() {
    console.log("==================================================");
    console.log("SINCRONIZANDO TODAS LAS LLAMADAS PASADAS EN ELEVENLABS");
    console.log("==================================================");

    const listRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`, {
        headers: { 'xi-api-key': API_KEY }
    });
    const listData = await listRes.json();
    const conversations = listData.conversations || [];

    console.log(`Encontradas ${conversations.length} conversaciones en ElevenLabs.`);

    for (const conv of conversations) {
        if (!conv.conversation_id || conv.call_duration_secs === 0) continue;

        const detailRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`, {
            headers: { 'xi-api-key': API_KEY }
        });
        const detail = await detailRes.json();
        const analysis = detail.analysis || {};
        const collection = analysis.data_collection_results || {};

        let estatus = "Confirmado";
        if (collection.estatus_asistencia && collection.estatus_asistencia.value) {
            estatus = collection.estatus_asistencia.value;
        }

        let correo = "N/A";
        if (collection.correo_confirmado && collection.correo_confirmado.value) {
            correo = collection.correo_confirmado.value;
        }

        let representante = "N/A";
        if (collection.nombre_representante && collection.nombre_representante.value) {
            representante = collection.nombre_representante.value;
        }

        let motivo = "N/A";
        if (collection.motivo_rechazo && collection.motivo_rechazo.value) {
            motivo = collection.motivo_rechazo.value;
        }

        const dateObj = new Date(conv.start_time_unix_secs * 1000);
        const fechaStr = dateObj.toISOString().replace('T', ' ').slice(0, 19);

        let contactoName = "Contacto Real";
        if (correo && correo.includes('@')) {
            contactoName = correo.split('@')[0].replace('.', ' ').replace(/^./, c => c.toUpperCase());
        }

        const payload = {
            call_id: conv.conversation_id,
            nombre_contacto: contactoName,
            user: { phone_number: "+52 55 5248 3354" },
            fecha: fechaStr,
            analysis: {
                call_successful: "success",
                transcript_summary: analysis.transcript_summary || "Llamada real registrada en ElevenLabs ConvAI",
                data_collection_results: {
                    estatus_asistencia: estatus,
                    correo_confirmado: correo,
                    nombre_representante: representante,
                    motivo_rechazo: motivo
                }
            }
        };

        console.log(`Enviando ${conv.conversation_id} (${fechaStr} | ${estatus} | ${correo})...`);

        try {
            const postRes = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log(` -> Enviado OK`);
        } catch (e) {
            console.error(` -> Error enviando ${conv.conversation_id}:`, e.message);
        }
    }

    console.log("==================================================");
    console.log("¡SINCRONIZACIÓN HISTÓRICA COMPLETADA CON ÉXITO!");
    console.log("==================================================");
}

syncPastConversations();
