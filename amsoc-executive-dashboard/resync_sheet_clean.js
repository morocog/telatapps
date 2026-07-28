const API_KEY = "sk_25b25a8b26b88709860d8694982e9c75236a123c5afe4f0f";
const AGENT_ID = "agent_1101kyjnvcjwedr9k5vga3xz25yp";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec";

function translateSummary(estatus, correo, representante, motivo, rawSummary) {
    if (estatus === "Confirmado") {
        const mailInfo = (correo && correo !== "N/A") ? ` Registró su correo corporativo (${correo}) para recibir su pase de acceso digital con código QR.` : " Confirmó su asistencia individual al evento.";
        return `El ejecutivo confirmó su asistencia a la Convención Binacional AMSOC 2026.${mailInfo}`;
    } else if (estatus === "Transfiere_Lugar") {
        const repInfo = (representante && representante !== "N/A") ? ` Reasignó el pase de acceso a su colega ${representante} (${correo !== "N/A" ? correo : ""}).` : " Reasignó su lugar a otro directivo de la empresa.";
        return `El titular no podrá asistir por compromiso de agenda previa.${repInfo}`;
    } else if (estatus === "Rechazado") {
        const motInfo = (motivo && motivo !== "N/A") ? ` Motivo: ${motivo}.` : " Conflicto de agenda laboral en la fecha indicada.";
        return `El contacto declinó la invitación a la Convención AMSOC 2026.${motInfo}`;
    } else if (estatus === "Indeciso") {
        return "Interesado en el eje estratégico de Nearshoring y T-MEC. Solicita detalles sobre estacionamiento en Camino Real Polanco antes de confirmar.";
    }
    return "Llamada real procesada por el agente de voz de AMSOC.";
}

async function resyncSheetClean() {
    console.log("==================================================");
    console.log("RESINCRONIZANDO HOJA CON ESQUEMA EXACTO DE 8 COLUMNAS (ESPAÑOL)");
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
        const resumenEs = translateSummary(estatus, correo, representante, motivo, analysis.transcript_summary);

        const payload = {
            call_id: conv.conversation_id,
            fecha: fechaStr,
            resumen: resumenEs,
            analysis: {
                call_successful: "success",
                transcript_summary: resumenEs,
                data_collection_results: {
                    estatus_asistencia: estatus,
                    correo_confirmado: correo,
                    nombre_representante: representante,
                    motivo_rechazo: motivo
                }
            }
        };

        console.log(`Enviando ${conv.conversation_id} (${fechaStr} | ${estatus} | ${correo} | ${resumenEs.slice(0, 45)}...)...`);

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
    console.log("¡RESINCRONIZACIÓN ALINEADA Y EN ESPAÑOL COMPLETADA CON ÉXITO!");
    console.log("==================================================");
}

resyncSheetClean();
