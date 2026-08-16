# 🤖 REGLAS PERMANENTES DE AGENTE & MEMORIA PERSISTENTE DE TELAT GROUP

Este archivo contiene el contexto persistente, reglas de gobernanza, estándares tipográficos y políticas de desarrollo para todas las aplicaciones y repositorios dentro del workspace `c:\Users\SDVP\Documents\GitHub\`.

---

## 🏛️ 1. GOBERNANZA Y REGLAS FUNDAMENTALES DE TELAT

- **Modo Consultoría Obligatorio:** Antes de recibir autorización explícita para generar código o modificar archivos, actúa como consultor técnico: analiza, diagnostica, identifica riesgos y formula preguntas aclaratorias.
- **Prohibición Absoluta de Placeholders:** NUNCA uses `TODO`, `pendiente`, `tu código aquí`, ni referencias incompletas. Proporciona bloques de función completos y exactos.
- **Prohibición de "Telat Capsule" en Nombres:** NUNCA uses palabras como "Telat Capsule", "Capsule vX.Y" o prefijos genéricos en títulos de Apps Script, títulos de Google Sheets, `<title>` HTML o UI. Usa única y exclusivamente el nombre funcional propio y real del proyecto (Ej: `Time Zones`, `Smart Time Blocks`, `El Panóptico`, `Presentacion-Digitalizacion`).
- **Seguridad en Producción (Google Apps Script):** JAMÁS crees nuevos despliegues (`clasp deploy`) ni cambies la URL pública en producción. Instruye siempre la creación de una "Nueva Versión" sobre el despliegue existente.

---

## 🎨 2. ESTÁNDARES ESTRICTOS DE TIPOGRAFÍA Y UI/UX EXEC

- **Uso Restringido de `font-momo` (Impact / Arial Black):**
  - Permitida **únicamente para números, métricas o cifras aisladas** de 2 a 4 caracteres (`-65%`, `24/7`, `99.6%`, `+1,000`).
  - **PROHIBICIÓN ABSOLUTA:** NUNCA apliques `font-momo` con `font-bold` a frases o textos explicativos de más de 2 palabras. Al hacerlo, las letras se empastan en un manchón negro ilegible.
- **Tipografías Obligatorias para Textos (`font-subheadings` / `font-body`):**
  - Utiliza siempre *DM Sans* (`font-subheadings`) o *Montserrat* (`font-body`) en peso `font-semibold` / `font-bold` para frases explicativas, títulos de tarjetas y descripciones (Ej: `+200 Agentes (Saturación Operativa)`).
- **Branding Oficial Telat:**
  - Celeste: `#3284C6`
  - Naranja: `#EB5B27`
  - Amarillo: `#FECA66`
  - Oscuro: `#222221`
  - Claro: `#FBFBFD`

---

## 🔁 3. AUTO-MANTENIMIENTO DE DOCUMENTACIÓN Y CONOCIMIENTO (CRÍTICO)

- **RESPONSABILIDAD DEL ASISTENTE:** El asistente de IA tiene la obligación activa de monitorear y registrar cualquier nuevo estándar técnico, corrección de legibilidad, arquitectura o flujo de trabajo descubierto en las sesiones.
- **ACTUALIZACIÓN CONTINUA:** Cada vez que se establezca un nuevo patrón o solución clave, el asistente sugerirá y aplicará de forma proactiva la actualización en:
  1. [MEGA_PROMPT_TELAT_v10.md](file:///c:/Users/SDVP/Documents/GitHub/MEGA_PROMPT_TELAT_v10.md) (para evolucionar el prompt maestro sin perder ninguna versión previa).
  2. [MANUAL_ARQUITECTURA_TELAT.md](file:///c:/Users/SDVP/Documents/GitHub/MANUAL_ARQUITECTURA_TELAT.md) (para registrar nuevos comandos, entornos o protocolos de despliegue).

---

## 🛠️ 4. FLUJO DE TRABAJO EN ANTIGRAVITY IDE

1. **Investigación & Diagnóstico:** Revisar código empírico y logs antes de proponer cambios.
2. **Implementation Plan (`implementation_plan.md`):** Presentar el plan técnico detallado con preguntas y alternativas.
3. **Ejecución Precisa:** Editar o crear archivos sin alterar firmas de métodos ni contratos existentes.
4. **Verificación & Walkthrough (`walkthrough.md`):** Ejecutar comandos de compilación/git y documentar resultados con evidencia.

---

## 🔒 5. ESTÁNDAR TÉCNICO DE MODALES Y CONFIGURACIÓN EN GAS

- **Construcción de Modales Complejos (`createElement` en lugar de `innerHTML`):**
  - Jamás inyectes variables del servidor o URLs con caracteres especiales (`&`, `"`, `'`, `<`) mediante expresiones de plantilla `${...}` dentro de strings de `innerHTML`.
  - Construye los modales usando `document.createElement()` o deja las cajas vacías e inserta los datos con `element.value = val` **después** de montar el elemento en el DOM.
- **Lectura Resiliente de Hojas `Config` en Backend:**
  - Lee la pestaña `Config` construyendo un mapa clave-valor (`cfgMap`) en lugar de depender de índices de fila fijos. Usa fallbacks para llaves históricas (ej. `cfgMap['Webhook_WFM'] || cfgMap['Webhook_Chat']`).

---

## ⚖️ 6. REGLAS DE FLUJO DE 2 PASOS Y AUDITORÍA DE LATE APPROVED
- **Secuencia de Aprobación Late Approved:** `SOLICITADO` (Esperando RH) ➔ `VALIDADO_RH` (RH Aprobó) ➔ `CERRADO` (WFM Autorizó).
- **Distintivos UI:** Asegurar que `VALIDADO_RH` esté registrado en todos los selectores de medallas UI (Consola Forense, Bitácora Digital, Vista Operaciones) para evitar que caigan en el bloque `else` de `PROCESANDO`.
- **Tiempo Planificado en Late Approved:** El tiempo se calcula dinámicamente entre `Hora_Inicio` y `Hora_Fin`. `Real en NICE` muestra `N/A (Llegada Tardía)` al no ser una desconexión off-phone telefónica.
- **Saneamiento de Correos:** Sanitizar siempre las listas de destinatarios (`.split(',').map(s=>s.trim()).filter(Boolean)`) para prevenir fallos silenciosos por comas sobrantes.
- **Autonomía del Registro del Supervisor vs. Auditoría Forense de NICE:** Las columnas R (`Hora_Inicio`) y S (`Hora_Fin`) representan exclusivamente la hora inicial y final **reportada originalmente por el supervisor**. Queda estrictamente PROHIBIDO sobrescribir o consultar El Panóptico/NICE para llenar las columnas R y S, ya que esto destruiría la capacidad del sistema para detectar discrepancias y variaciones (`DESFASE`, `VALIDADO`, `SIN_REGISTRO`) entre lo reportado vs. lo real. El motor de auditoría `auditTicketWithPanoptico` debe consultar El Panóptico únicamente para escribir las métricas reales en las columnas P (`NICE_Validation_Status`) y Q (`NICE_Actual_Minutes`).

---

## 🛡️ 7. ESTÁNDAR INMUTABLE DE ENCABEZADOS Y BASE DE DATOS EN SHEETS (GAS)

- **Inmutabilidad Canónica de Encabezados:** NUNCA uses bucles celda por celda ni condicionales frágiles (`if (!headers.includes(...))`) para verificar o agregar columnas en la Fila 1 de Google Sheets. Escribe siempre de forma atómica y completa el arreglo canónico de encabezados (`sheet.getRange(1, 1, 1, headers.length).setValues([headers]);`). Esto garantiza que los títulos de columna jamás se desplacen, dupliquen o sobreescriban.
- **Ancho Completo en Lecturas y Escrituras Batch:** Toda lectura masiva de datos (`getDataRange()` o `getRange(1, 1, lastRow, N)`) debe abarcar el total real de columnas activas de la pestaña. Jamás leas un número de columnas inferior al total real si vas a realizar re-escrituras de filas, previniendo borrados accidentales por truncamiento.
- **Protección Dinámica Anti-Truncamiento de Columnas (`debloatSpreadsheet`):** Queda estrictamente PROHIBIDO usar constantes numéricas fijas inferiores al número real de encabezados en rutinas de saneamiento de celdas (`deleteColumns`). Toda rutina de debloat o saneamiento DEBE calcular dinámicamente el límite seguro (`safeLimitCols = Math.max(limitCols, headerCols, sheet.getLastColumn())`), garantizando que si se agregan futuras columnas (ej. Columna 20, 21, etc.), NUNCA sean borradas ni truncadas por el sistema.

---

## ☁️ 8. PROTOCOLO OBLIGATORIO DE RESPALDO EN GITHUB

- **Consulta Proactiva de Git Push:** Al finalizar cualquier tarea, corrección o nueva funcionalidad, el asistente DEBE preguntar explícitamente al usuario si desea guardar y subir de inmediato los cambios a GitHub (`git add`, `git commit` y `git push`), garantizando que no quede código pendiente ni cambios sin respaldar en la nube.

---

## 📲 9. NOTIFICACIÓN PROACTIVA A TELEGRAM EN DECISIONES Y PUNTOS DE ESPERA (MODO SILENCIOSO SIN POPUPS)

- **Notificación Silenciosa a Telegram:** Cada vez que el asistente requiera confirmación, presente un plan de implementación o formule preguntas de decisión, DEBE escribir la notificación de forma atómica en `c:\Users\SDVP\Documents\GitHub\telegram-agent-bot\notify_queue.json` usando `write_to_file`.
- **Cero Popups en Pantalla:** NUNCA ejecuta comandos de terminal (`node send_telegram.js`) ni modales (`ask_question`) para pedir decisiones, ya que bloquean la pantalla de la PC. El bot lee el archivo en segundo plano (<500ms) y envía la alerta a Telegram con botones interactivos para autorizar todo desde el celular.

---

## 🖨️ 10. ESTÁNDAR TÉCNICO DE IMPRESIÓN, PDFS Y PROCESAMIENTO DE IMÁGENES EN GAS

- **Rasterización en Memoria para Impresión (Canvas DataURL):** Las imágenes servidas por Google Drive (`https://drive.google.com/thumbnail?...`) o URLs externas suelen ser bloqueadas o demoradas por el sandbox de impresión de Chromium (`window.print()`), provocando que el navegador imprima recuadros grises o el texto `alt`. Es OBLIGATORIO extraer los píxeles directamente del nodo visible en pantalla mediante un `<canvas>` en memoria (`canvas.toDataURL('image/jpeg', 0.95)`) e inyectarlos como `data:image/jpeg;base64,...` en el clon de impresión.
- **Ciclo de Vida de Impresión Asíncrono (`window.onafterprint`):** JAMÁS destruyas el contenedor de impresión (`printArea.innerHTML = ''`) de forma síncrona en la línea inmediata después de `window.print()`. En navegadores Chromium, la rasterización del PDF es asíncrona; destruirlo de inmediato borra las imágenes antes de ser procesadas por el spooler. Usa siempre el listener `window.onafterprint` con temporizador de respaldo diferido (>5000ms).
- **Candado Vertical Dinámico y Densidad de Página (100vh / Anti-Gap):** Para documentos oficiales de 1 sola página (CVs, acreditaciones, cartas membretadas), fija `.cv-page { height: 100vh; max-height: 100vh; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }` calibrando tipografías (10.5px a 11.5px), interlineados (1.4 a 1.5) y 3 bloques de trayectoria laboral para asegurar que el contenido cubra el 90-95% del espacio físico sin huecos vacíos ni saltos accidentales a una segunda página.
- **Mapeo Resiliente por Nombre de Encabezado (Anti-Desfase):** En todas las aplicaciones que interactúen con Google Sheets, el backend DEBE mapear columnas dinámicamente buscando el índice por nombre (`headers.indexOf("Foto_URL")`). Queda estrictamente PROHIBIDO asignar índices numéricos fijos (ej. `rawRow[15]`), garantizando que si se agregan, renombran o eliminan columnas intermedias (como `Plantilla`), las columnas críticas jamás se desplacen ni queden mal mapeadas.
