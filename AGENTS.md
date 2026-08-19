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

---

## 🔄 11. PROTOCOLO DE CONCIENCIA MULTI-ENTORNO (PERSONAL 'moroc' VS. TRABAJO 'SDVP')

- **Dualidad de Entornos:** El usuario alterna su desarrollo entre dos computadoras principales:
  - **Entorno Personal (Laptop/Casa):** `c:\Users\moroc\Documents\GitHub\`
  - **Entorno de Trabajo (Oficina/SDVP):** `c:\Users\SDVP\Documents\GitHub\`
- **Detección Automática y Rutas Dinámicas:**
  - El asistente debe identificar en qué máquina se encuentra mediante las rutas del workspace o metadatos de usuario (`moroc` vs `SDVP`).
  - Al generar scripts, paths o notificaciones de Telegram, debe utilizar la ruta absoluta correspondiente a la máquina activa (`c:\Users\moroc\...` o `c:\Users\SDVP\...`).
- **Comando Proactivo de Sincronización al Cerrar Sesión:**
  - Siempre que el usuario mencione cambio de computadora, fin de jornada o respaldo, el asistente debe generar de forma proactiva el comando de 1 sola línea adaptado con la ruta de la máquina receptora (ej. si está en `moroc`, generar el comando para `SDVP`; si está en `SDVP`, generar el comando para `moroc`).
- **Gobernanza de Memoria Portátil & Auto-Sincronización Cero-Esfuerzo:**
  - Los archivos maestros (`.agents/AGENTS.md`, `MANUAL_ARQUITECTURA_TELAT.md`, `MEGA_PROMPT_TELAT_v10.md`, `Ecosistema-Telat-WFM.code-workspace`) deben viajar siempre respaldados dentro del repositorio `telatapps/` para garantizar portabilidad instantánea en la nube.
  - **RESPONSABILIDAD TOTAL DE LA IA:** El asistente se encarga AUTOMÁTICAMENTE de propagar `AGENTS.md` maestro a todos los sub-repositorios y hacer `git push` en `telatapps`. El usuario NO debe ejecutar comandos ni preocuparse por la sincronización manual.

---

## 🌐 12. POLÍTICA ESTRICTA DE USO DEL BROWSER_SUBAGENT (AHORRO DE TOKENS)

- **Regla de Oro:** El `browser_subagent` es la herramienta MÁS costosa en tokens y SOLO debe invocarse cuando el problema **no puede resolverse desde el código fuente**.
- **Casos PROHIBIDOS (resolver desde código):**
  - Verificar que una función existe o usa los campos correctos → usar `grep_search` o `view_file`.
  - Confirmar que un `clasp push` llegó → el output del comando es suficiente.
  - Revisar coherencia backend↔frontend (campos JSON, nombres de variables) → comparar `Code.js` vs `JavaScript.html` directamente.
  - Probar lógica de filtros, renders o cálculos → leer el código y razonar.
  - Navegar al editor de Apps Script (`script.google.com/u/0/home/...`) → NUNCA, no aporta nada.
- **Casos PERMITIDOS (únicamente estos):**
  - Un bug de renderizado CSS/visual que no puede inferirse del código y requiere ver el resultado real.
  - Un error de autenticación, redirección o permiso de GAS que solo se manifiesta en runtime.
  - Grabar una demostración en video del flujo completo para el usuario.
  - Un problema puntual que el usuario describe visualmente y no puede reproducirse leyendo el código.
- **Protocolo antes de invocar el browser_subagent:** Preguntarse explícitamente: *"¿Puedo resolver esto leyendo el código?"*. Si la respuesta es sí, NO invocar el subagente.

---

## 🧠 13. PROTOCOLO DE REFACTORIZACIÓN EN PROFUNDIDAD ("Vamos a ponernos reflexivos" / "MODO TRAZABILIDAD")

Cada vez que el usuario mencione la frase **"Vamos a ponernos reflexivos"** o use el comando **"MODO TRAZABILIDAD"**, debes pausar cualquier respuesta superficial y ejecutar un **Análisis Auditado en 4 Capas** para el proyecto actual, considerando la norma CICE del IMT de México y la usabilidad del equipo de entrenamiento.

> [!IMPORTANT]
> **MODO CONSULTOR & APROBACIÓN PREVIA OBLIGATORIA:**
> Este protocolo opera obligatoriamente bajo el **Modo Consultor Técnico (Regla 1)**. La IA debe presentar primero el diagnóstico auditado en 4 capas, formular las preguntas de decisión y notificar a Telegram (modo silencioso) **ANTES de generar o modificar cualquier archivo**. Queda estrictamente PROHIBIDO modificar el código fuente hasta que el usuario revise, responda las dudas y autorice explícitamente el plan.

Ejecuta el análisis en este orden exacto:

1. **CAPA 1: MARCO C4 (Arquitectura y Fronteras)**
   - **[Contexto]**: Muestra cómo interactúan el usuario (equipo de entrenamiento), el Dashboard y el IMT/CICE.
   - **[Componentes]**: Identifica los componentes clave del código/schema (módulo de trazabilidad, UI, motor de reportes).

2. **CAPA 2: AUDITORÍA FMEA (Matriz de Fallas e Integridad CICE)**
   - Detecta los 3 Modos de Falla más críticos (ej. pérdida de trazabilidad, datos huérfanos, faltas en auditoría CICE).
   - Diseña soluciones preventivas NO destructivas en la base de datos (migraciones de esquema limpias).

3. **CAPA 3: TRIÁNGULO DE USABILIDAD (Efectividad, Eficiencia, Satisfacción)**
   - Audita la UI/UX del equipo de entrenamiento.
   - Reduce clics, elimina campos redundantes y simplifica el registro de evidencias diarias.

4. **CAPA 4: LOS 6 SOMBREROS DE DE BONO (Refactorización y Acción)**
   - Pasa por los 6 sombreros (Blanco, Rojo, Negro, Amarillo, Verde y Azul).
   - Entrega la propuesta técnica de código refactorizado y/o los scripts de base de datos para aprobación antes de la implementación.



