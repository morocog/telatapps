const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec';

async function rebuildSheet() {
    console.log("==================================================");
    console.log("INICIANDO RECONSTRUCCIÓN Y SANEAMIENTO DE HOJA");
    console.log("Google Apps Script URL:", GAS_WEB_APP_URL);
    console.log("==================================================");

    try {
        const rebuildUrl = `${GAS_WEB_APP_URL}?action=rebuild`;
        console.log("Enviando petición de rebuild (acción nativa)...");
        
        const response = await fetch(rebuildUrl);
        console.log("Status de conexión:", response.status);
        
        if (response.ok) {
            const resultText = await response.text();
            console.log("\nRespuesta del servidor:");
            console.log(resultText);
            console.log("\n==================================================");
            console.log("¡SANEAMIENTO HISTÓRICO COMPLETADO EXITOSAMENTE!");
            console.log("==================================================");
        } else {
            console.error("Error al procesar la respuesta:", response.statusText);
        }
    } catch (error) {
        console.error("Error en la conexión con Apps Script:", error.message);
    }
}

rebuildSheet();
