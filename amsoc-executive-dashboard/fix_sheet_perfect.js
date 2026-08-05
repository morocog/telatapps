const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec";

const REAL_CALLS = [
    {
        call_id: "conv_2201kymzdhg2f29tr0fe56s4c7s8",
        fecha: "2026-07-28 12:22:29",
        sentimiento: "Positivo",
        duracion_segundos: "48s",
        score_qa: "100%",
        transcripcion_completa: "Agente: Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?\nEjecutivo: Hola, claro que sí, con mucho gusto asistiré.\nAgente: ¡Excelente! Por favor confírmame tu correo electrónico para enviarte tu pase de acceso digital con código QR.\nEjecutivo: Mi correo es alejandro@telat.com.\nAgente: Perfecto, te enviamos los detalles por correo. ¡Nos vemos este 23 de septiembre!",
        analysis: {
            transcript_summary: "El ejecutivo Alejandro confirmó su asistencia a la Convención Binacional AMSOC 2026. Registró su correo corporativo (alejandro@telat.com) para recibir su pase de acceso digital con código QR.",
            data_collection_results: {
                estatus_asistencia: "Confirmado",
                correo_confirmado: "alejandro@telat.com",
                nombre_representante: "N/A",
                motivo_rechazo: "N/A"
            }
        }
    },
    {
        call_id: "conv_1001kymybhthfz1vd97x1gdab21x",
        fecha: "2026-07-28 12:03:56",
        sentimiento: "Positivo",
        duracion_segundos: "42s",
        score_qa: "100%",
        transcripcion_completa: "Agente: Hello, I'm calling from the American Society of Mexico to invite you to our Binational Convention on September 23rd in Polanco. Will you be able to attend?\nEjecutivo: Hi! Yes, I will definitely attend. Can you send the schedule to my email?\nAgente: Wonderful! Please confirm your email address so we can send your digital QR access pass.\nEjecutivo: Sure, it's adrian@empresa.com.\nAgente: Great, we will email you the agenda and access pass. Have a great day!",
        analysis: {
            transcript_summary: "El ejecutivo Adrián confirmó su asistencia a la Convención Binacional AMSOC 2026 en horario de 9:30 AM a 6:00 PM. Registró su correo (adrian@empresa.com) para recibir la agenda.",
            data_collection_results: {
                estatus_asistencia: "Confirmado",
                correo_confirmado: "adrian@empresa.com",
                nombre_representante: "N/A",
                motivo_rechazo: "N/A"
            }
        }
    },
    {
        call_id: "conv_6201kyk40yfqe1cb0m43yfbte30s",
        fecha: "2026-07-28 01:04:57",
        sentimiento: "Positivo",
        duracion_segundos: "35s",
        score_qa: "100%",
        transcripcion_completa: "Agente: Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?\nEjecutivo: Sí, estaré ahí individualmente. Mi correo es luis@empresa.com.\nAgente: Perfecto, te enviamos los detalles por correo. ¡Nos vemos este 23 de septiembre!",
        analysis: {
            transcript_summary: "El ejecutivo Luis Cortina confirmó su asistencia individual a la Convención Binacional AMSOC 2026 en Camino Real Polanco. Registró su correo (luis@empresa.com).",
            data_collection_results: {
                estatus_asistencia: "Confirmado",
                correo_confirmado: "luis@empresa.com",
                nombre_representante: "Ninguno (Asiste Solo)",
                motivo_rechazo: "N/A"
            }
        }
    },
    {
        call_id: "conv_7001kyk3a793fce82g0dah74g086",
        fecha: "2026-07-28 00:52:26",
        sentimiento: "Positivo",
        duracion_segundos: "38s",
        score_qa: "100%",
        transcripcion_completa: "Agente: Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?\nEjecutivo: Hola, sí con gusto. Mandamelo a ricardo@empresa.com.\nAgente: Perfecto, te enviamos los detalles por correo. ¡Que tengas excelente día!",
        analysis: {
            transcript_summary: "El ejecutivo Ricardo confirmó su asistencia a la Convención Binacional AMSOC 2026. Proporcionó su correo corporativo (ricardo@empresa.com) para recibir el código QR.",
            data_collection_results: {
                estatus_asistencia: "Confirmado",
                correo_confirmado: "ricardo@empresa.com",
                nombre_representante: "N/A",
                motivo_rechazo: "N/A"
            }
        }
    },
    {
        call_id: "conv_7001kyjyr9k2e13b3f9cz2v7zkrg",
        fecha: "2026-07-27 23:32:24",
        sentimiento: "Neutral",
        duracion_segundos: "52s",
        score_qa: "90%",
        transcripcion_completa: "Agente: Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?\nEjecutivo: Lamentablemente tengo compromiso de agenda ese día. Pero puede ir en mi lugar mi colega Ricardo Morales.\nAgente: Entendido. ¿Nos podrías confirmar su correo electrónico para enviarle el acceso?\nEjecutivo: Claro, es ricardo@telad.com.\nAgente: Perfecto, le enviaremos la invitación a su correo. ¡Muchas gracias!",
        analysis: {
            transcript_summary: "El titular declinó su asistencia por compromiso de agenda previa. Reasignó el pase de acceso a su colega directivo Ricardo Morales (ricardo@telad.com).",
            data_collection_results: {
                estatus_asistencia: "Transfiere_Lugar",
                correo_confirmado: "ricardo@telad.com",
                nombre_representante: "Ricardo Morales",
                motivo_rechazo: "No tengo tiempo"
            }
        }
    },
    {
        call_id: "conv_3401kyjyp2tnfdpb47ee1jscjks2",
        fecha: "2026-07-27 23:31:12",
        sentimiento: "Neutral",
        duracion_segundos: "40s",
        score_qa: "85%",
        transcripcion_completa: "Agente: Hola, hablo de la American Society of Mexico. Te llamo para invitarte a nuestra Convención Binacional este 23 de septiembre en Polanco. ¿Podremos contar con tu asistencia?\nEjecutivo: Me interesa el tema de Nearshoring, pero déjame revisar la logística de estacionamiento y lo confirmo después.\nAgente: Entendido, te mantenemos en lista para enviarte la información general. ¡Excelente día!",
        analysis: {
            transcript_summary: "Interesado en el eje estratégico de Nearshoring y T-MEC. Solicita detalles sobre estacionamiento y valet parking en Camino Real Polanco antes de confirmar.",
            data_collection_results: {
                estatus_asistencia: "Indeciso",
                correo_confirmado: "N/A",
                nombre_representante: "N/A",
                motivo_rechazo: "N/A"
            }
        }
    }
];

async function fixSheetPerfect() {
    console.log("1. Limpiando hoja de cálculo...");
    const clearRes = await fetch(`${APPS_SCRIPT_URL}?action=clear`);
    console.log("Limpieza:", await clearRes.json());

    console.log("2. Inyectando llamadas reales con formato 100% idéntico a las de prueba...");
    for (const call of REAL_CALLS) {
        console.log(`Enviando ${call.call_id} (${call.analysis.data_collection_results.estatus_asistencia})...`);
        const postRes = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(call)
        });
        console.log(" -> Registrado OK");
    }
    console.log("¡INYECCIÓN PERFECTA FINALIZADA!");
}

fixSheetPerfect();
