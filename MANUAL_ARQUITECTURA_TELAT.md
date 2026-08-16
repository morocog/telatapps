# 📘 MANUAL DEFINITIVO: ECOSISTEMAS TELAT (CLASP + GITHUB) v2.0

Este documento consolida absolutamente todo tu flujo de trabajo profesional. Guárdalo como tu "Biblia de Infraestructura". Siguiendo estos pasos jamás perderás código, nunca sobrescribirás la app equivocada y siempre tendrás respaldos perfectos.

---

## 💡 CONCEPTOS CLAVE ANTES DE EMPEZAR
* **Ecosistema (Monorepo)**: Es una carpeta maestra que agrupa aplicaciones de un mismo departamento (Ej. `operaciones-ecosystem`, `talent-ecosystem`). Esto equivale a 1 Repositorio en GitHub.
* **Aplicación Standalone / Repositorio Único**: Es una aplicación que tiene su propio repositorio independiente (Ej. `Smart-Time-Blocks`, `El-Panoptico`, `telat-portal`).
* **Aplicación**: Es la subcarpeta donde viven tus archivos `.js`, `.gs` y `.html`.
* **Clasp**: La herramienta oficial de Google que conecta tu carpeta local en la computadora directamente con los servidores de Google Apps Script.
* **Git / GitHub**: El sistema que toma "fotografías" (*Commits*) de tu código para mantener un historial completo y respaldarlo en la nube.

---

## 🛠️ FASE 1: PREPARACIÓN DEL ENTORNO (Solo se hace una vez)
Si ya instalaste `clasp`, puedes saltar esta fase, pero aquí queda documentada por si cambias de computadora en el futuro:

1. Instala **Node.js (LTS)** desde `nodejs.org`.
2. Abre Antigravity IDE, abre la Terminal (`Terminal > New Terminal`) y ejecuta:
   ```bash
   npm install -g @google/clasp
   ```
3. **Desbloqueo de Seguridad en Windows** *(Solo si hay error rojo)*:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   *(Responde S o Y cuando te pregunte)*.
4. Vincula tu cuenta de Google:
   ```bash
   clasp login
   ```

---

## 🏗️ FASE 2: CREACIÓN DE UN NUEVO ECOSISTEMA (Repositorio Maestro)
Si necesitas agrupar aplicaciones de un nuevo departamento (ej. `finanzas-ecosystem`):

1. Abre tu Explorador de Windows, ve a `C:\Users\TuUsuario\Documents\GitHub\` y crea una carpeta llamada `finanzas-ecosystem`.
2. Abre Antigravity IDE > `File > Open Folder...` y abre esa nueva carpeta.
3. En la Terminal de Antigravity, crea un archivo base para que GitHub no marque error por carpeta vacía:
   ```bash
   echo "# Ecosistema de Finanzas" > README.md
   ```
4. Ve al panel izquierdo (icono de ramita) **Source Control**.
5. Clic en **Publish to GitHub**.
6. Selecciona **Publish to GitHub private repository**.
7. Clic en **OK** (verás el `README.md` con palomita). ¡El repositorio ya está en la nube!

---

## 📥 FASE 3: IMPORTAR UNA APP VIEJA AL ECOSISTEMA
Si ya tienes un proyecto en Google Apps Script y lo quieres bajar a tu computadora:

1. En Antigravity IDE, asegúrate de estar en la carpeta de tu ecosistema. Abre la terminal.
2. Crea la carpeta para la app y entra en ella:
   ```bash
   mkdir mi-app-vieja
   cd mi-app-vieja
   ```
3. Descarga el código desde Google usando el **Script ID** *(lo sacas de la URL en el navegador)*:
   ```bash
   clasp clone "AQUI_PEGA_EL_ID_DEL_SCRIPT"
   ```
4. Sube de nivel en la terminal para regresar a la raíz:
   ```bash
   cd ..
   ```
5. Ve a **Source Control** en Antigravity, pon un mensaje (ej. `feat: Importada app vieja`) y haz clic en **Commit** y luego **Sync Changes** para subirlo a GitHub.

---

## ✨ FASE 4: CREAR UNA APP NUEVA 100% LOCAL (Cero Google Drive)

1. En la terminal (estando en la raíz del ecosistema), crea la carpeta y entra:
   ```bash
   mkdir nueva-app-brutal
   cd nueva-app-brutal
   ```
2. Crea el Sheet y el Script directamente en la nube desde tu PC:
   ```bash
   clasp create --type sheets --title "Mi Nueva App Brutal"
   ```
3. Abre tu chat con la IA, pándole el Mega Prompt v8.2 y pide el código.
4. Crea los archivos `.js` y `.html` en Antigravity, pega el código de la IA y guarda (`Ctrl + S`).
5. Sube tu código a Google para probar:
   ```bash
   clasp push
   ```
6. Sal de la carpeta en la terminal (`cd ..`), ve a **Source Control**, pon tu mensaje y haz **Commit + Sync Changes**.

---

## 🔄 FASE 5: EL FLUJO DE TRABAJO DIARIO (La Regla de Oro)

### ⚠️ REGLA DE ORO DE CLASP:
NUNCA OLVIDES: Antes de escribir `clasp push`, revisa en qué carpeta estás en la terminal.
* Si dice `PS C:\...\GitHub\talento-ecosystem>` ❌ **ERROR**. Estás en la raíz. Si haces push aquí, romperás todo.
* Si dice `PS C:\...\GitHub\talento-ecosystem\eval-ingles>` ✅ **CORRECTO**. Estás dentro de la app que contiene el `.clasp.json`.

---

### 🚀 EL FLUJO DIARIO POR TERMINAL (El Método Máster):
Para ahorrarte clics manuales en la interfaz gráfica de Source Control, usa la terminal:

```bash
# 1. Entras a la carpeta de tu app
cd nombre-de-la-app

# 2. Modificas tu código en Antigravity y guardas (Ctrl + S)

# 3. Subes a Google Apps Script para probar en vivo
clasp push

# 4. (Opcional) Si la Web App en Producción requiere aplicar cambios sin cambiar la URL:
# En Google Apps Script web: Implementar > Administrar implementaciones > Editar > Nueva versión.

# 5. Guardas el trabajo del día en GitHub directamente desde la Terminal:
git add .
git commit -m "feat: Descripción de lo que hiciste hoy"
git push origin main
```

---

## 📄 FASE 6: BUENAS PRÁCTICAS DE DOCUMENTACIÓN Y BASES DE DATOS

Para mantener tu infraestructura nivel enterprise:
1. **Archivo `README.md` en cada proyecto**: Documenta qué hace la app, su estructura y sus comandos de despliegue.
2. **Documento de Arquitectura (`DATABASE_SCHEMA.md`)**: Para aplicaciones impulsadas por Google Sheets, documenta la matriz de pestañas, roles, excepciones y subenlaces.
3. **Respaldo de Emergencia (`SetupBD.js`)**: Conserva actualizado el script de creación/autocuración de base de datos en tu repositorio. Si la hoja maestro se daña o se borra por accidente, puedes reconstruirla desde código en segundos.

---

## 🚀 OPERACIONES AVANZADAS DE ARQUITECTURA

### A. Mover una App de un Repositorio a Otro (Ej. Portal a Operaciones)
El secreto es que la carpeta viaja con su archivito oculto `.clasp.json`, así que nunca pierde su conexión con Google:
1. Cierra Antigravity IDE.
2. Abre el Explorador de Windows normal.
3. Corta la carpeta de la app (`Ctrl + X`) del repositorio original.
4. Pégala (`Ctrl + V`) dentro de la carpeta del nuevo repositorio.
5. Abre GitHub Desktop (o Antigravity Source Control) en el repositorio viejo. Haz un Commit (`chore: Mover app`).
6. Abre el repositorio nuevo. Haz un Commit (`feat: Recibir app`). ¡Listo!

### B. Renombrar un Repositorio (Sin romper nada)
El nombre vive en dos lugares (La Nube y Tu Windows). Hay que cambiar ambos cuidadosamente:
1. Ve a `GitHub.com` en el navegador > Abre el repo > `Settings` > Cambia el "Repository name" y da clic en **Rename**.
2. Abre GitHub Desktop > Clic derecho sobre el repositorio a la izquierda > **Remove** *(Asegúrate de NO marcar la casilla de "Move to recycle bin")*.
3. En el Explorador de Windows, cambia el nombre de la carpeta madre al mismo nombre que pusiste en GitHub.
4. En GitHub Desktop ve a `File > Add local repository...`, selecciona tu carpeta recién renombrada y dale a **Add repository**. Tu historial sigue intacto.

---

## 🛡️ ANEXO: EL ARCHIVO PROTECTOR (`.gitignore`)
Siempre crea un archivo llamado `.gitignore` en la raíz de tus nuevos ecosistemas o proyectos individuales. Evitará que subas basura de Windows o respaldos de `clasp` a la nube:

```gitignore
# Clasp Backups
.clasp.json.bak

# Node & Dependencies
node_modules/

# Editor & IDE
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln

# OS metadata
.DS_Store
Thumbs.db
desktop.ini

# Logs
logs
*.log
npm-debug.log*
```

---

## 🌐 FASE 7: PUBLICACIÓN DE PROYECTOS WEB Y PRESENTACIONES EN GITHUB PAGES

Para landing pages, presentaciones ejecutivas y sitios web estáticos (Ej. `paginas-prueba`, `Presentacion-Digitalizacion`):

1. **Protocolo de Verificación Local:**
   - Realizar cambios en los archivos `.html`, `.css` o `.js` locales en Antigravity IDE.
   - Verificar la legibilidad tipográfica y el diseño responsive en el navegador.

2. **Publicación y Despliegue en Vivo:**
   - Ejecutar la secuencia estándar desde la terminal de Antigravity IDE:
     ```bash
     git add .
     git commit -m "feat: Descripción de los cambios visuales y de contenido"
     git push origin main
     ```
   - GitHub Pages compilará y actualizará el sitio en la URL pública automáticamente en 30 a 120 segundos.


## 🖨️ FASE 8: ARQUITECTURA DE GENERACIÓN DE DOCUMENTOS (GOOGLE DOCS EN GAS)

Para scripts diseñados para generar reportes, contratos o manuales ejecutivos en Google Docs utilizando Google Sheets como base de datos:

1. **Estructura Modular de Archivos Obligatoria:**
   - `config.gs`: Colores de la paleta Telat (Celeste `#3284C6`, Naranja `#EB5B27`, Amarillo `#FECA66`), fuentes (`Montserrat` para cabeceras y `DM Sans` para el cuerpo) y variables de acceso.
   - `setupBD.gs`: Función de auto-aprovisionamiento (`crearBaseDeDatosPerfecta()`) que crea e inicializa el libro en Sheets con formato e información inicial.
   - `content.gs`: Lectura estructurada desde Sheets con un fallback de datos estático (JSON interno) para garantizar robustez anti-caídas.
   - `styles.gs`: Definición de estilos tipográficos de página, párrafos y callouts destacados.
   - `tables.gs`: Generación y formateo de tablas dinámicas con cabeceras de color Celeste y filas alternadas.
   - `documentBuilder.gs`: Ensamblador secuencial de secciones del documento (`createCover()`, `createPhilosophy()`, etc.).
   - `main.gs`: Punto de entrada (`generarPlanDeCarrera()`) con protección de concurrencia mediante `LockService`.

2. **Inserción Dinámica de Logotipo:**
   - Utilizar siempre `UrlFetchApp.fetch(LOGO_URL).getBlob()` para descargar e incrustar la imagen oficial del logo en la portada del manual.


## 🔒 FASE 9: PROTOCOLO DE AUTORIZACIÓN Y ACCESO EN APPS SCRIPT

Para aplicaciones web en Google Apps Script que requieran restricciones de acceso basadas en la pestaña `Usuarios_Roles`:

1. **Validación de Identidad en Dos Capas (Backend + Frontend):**
   - **Backend (`Code.gs`):**
     - Crear una función privada `isUserAuthorized_()` que compare `Session.getActiveUser().getEmail()` contra la columna de correos en `Usuarios_Roles`.
     - Modificar `getInitialData()` para que si no está autorizado, retorne `{ status: 'unauthorized', activeEmail: ... }` **sin enviar datos sensibles** (Roster, bitácora, etc.).
     - Insertar la validación `isUserAuthorized_()` al principio de cada función expuesta de escritura/modificación para rechazar peticiones no autorizadas en el servidor.
   - **Frontend (`JS_Core.html`):**
     - En `init()`, validar si el estatus recibido del servidor es `'unauthorized'` o si el correo no fue emparejado con un usuario válido.
     - Interrumpir el flujo de inicialización y renderizar un panel exclusivo de **Acceso Denegado** (`renderUnauthorizedView(email)`).
     - Indicar explícitamente al usuario que debe comunicarse con **Ricardo García** por **Google Chat** para solicitar el acceso y ser registrado en el sistema.

2. **Navegación de Vistas por Rol Operativo:**
   - Si un usuario tiene múltiples áreas de acción (ej. rol `WFM` que requiere monitoreo administrativo y registro de incidencias en piso):
     - Permitirle alternar vistas entre su consola nativa y la de **Operaciones** (`controlHeaderVisibility` y `switchRole`).
     - Esto le da acceso a la consola de Operaciones y al botón **Nueva Desconexión** para registrar incidencias de cualquier tipo (incluido "Disco S/P").

---

## 🔒 FASE 10: ALMACENAMIENTO SEGURO DE SECRETOS & NOTIFICACIONES (GEMINI API)

1. **Seguridad de API Keys en Google Apps Script (GAS):**
   - **PROHIBICIÓN ABSOLUTA:** Jamás almacenes API Keys de Gemini o contraseñas en celdas de la hoja de cálculo o en código plano del cliente/servidor.
   - Utiliza exclusivamente `PropertiesService.getScriptProperties()` en el backend para almacenar llaves sensibles.
   - En el frontend, expón únicamente la presencia de la API Key mediante banderas booleanas (`hasGeminiKey: true/false`). Si se despliega un campo de entrada para editarla, ocúltalo con caracteres de enmascaramiento (`••••••••••••`) y evita enviar la llave real al cliente.
   - Al guardar cambios, actualiza el valor únicamente si el usuario ingresó un texto nuevo distinto del enmascaramiento.
   
2. **Envío de Notificaciones por Correo & Webhooks:**
   - Para notificaciones inmediatas ante departamentos externos (como Recursos Humanos en `Late Approved`), utiliza plantillas HTML responsivas enriquecidas con la tipografía corporativa de Telat (`Montserrat` para encabezados y `DM Sans` para el cuerpo), aplicando los colores oficiales Celeste (`#3284C6`) y Naranja (`#EB5B27`).
   - Configura copias (CC) automáticas al equipo de WFM y al Administrador General (`rgarcia@telat-group.com`) para auditoría.

---

## 🎨 FASE 11: PATRÓN DE MODALES SEGUROS Y LECTURA ROBUSTA DE CONFIGURACIÓN (GAS)

1. **Construcción Segura de Modales en HTML (Cero Rompimiento por Parser HTML):**
   - **Inyección por DOM en lugar de `innerHTML` con Template Strings:**
     Evita inyectar valores que provienen de la base de datos o URLs con caracteres especiales (`&`, `"`, `'`, `<`, `>`) directamente en atributos de plantillas HTML (ej. `value="${config.webhookUrl}"`).
   - El carácter `&` de las URLs de Webhooks (como `&token=...`) o comillas accidentales en variables pueden cerrar atributos prematuramente o ser interpretados como entidades HTML, rompiendo la estructura del DOM y desplazando elementos.
   - **Estándar Telat para Modales Complejos:**
     - Construye la estructura del modal usando elementos del DOM (`document.createElement()`) o mantén los campos `value=""` limpios en el HTML inicial.
     - Asigna los valores dinámicos exclusivamente mediante propiedades nativas del DOM (`element.value = config.value`) **después** de montar el elemento en el documento. Esto garantiza inmunidad total ante cualquier carácter especial o fragmento HTML.

2. **Lectura de Configuración por Mapa de Claves en `Code.gs`:**
   - **Resistencia a Cambios de Fila:** Nunca leas configuraciones del sistema asumiendo índices de fila fijos (`configValues[6][1]`).
   - Convierte el rango leído de la pestaña `Config` a un diccionario/objeto (`cfgMap[clave]`).
   - Incluye alias o nombres alternativos de claves históricas (`cfgMap['Webhook_WFM'] || cfgMap['Webhook_Chat']`) para mantener compatibilidad total aunque los nombres de las filas en la hoja cambien.

---

## 🛡️ FASE 12: PATRÓN DE INMUTABILIDAD DE BASE DE DATOS EN SHEETS & RESPALDO CONTINUO EN GITHUB

1. **Inmutabilidad Canónica de Encabezados (Anti-Corrupción de Fila 1):**
   - **Cero Verificaciones Condicionales Frágiles:** Queda prohibido usar bucles celda por celda o condicionales frágiles (`if (!headers.includes(...))`) para verificar encabezados en la Fila 1 de Google Sheets.
   - **Escritura Atómica Obligatoria:** Escribe siempre el arreglo canónico completo de encabezados en un solo bloque (`sheet.getRange(1, 1, 1, headers.length).setValues([headers]);`).
   - **Ancho Completo de Lectura:** Toda rutina de lectura por lotes que realice re-escrituras debe abarcar el total real de columnas activas de la hoja para evitar truncamiento y borrado accidental de celdas al reescribir filas.

2. **Protección Dinámica Anti-Truncamiento de Columnas (`debloatSpreadsheet`):**
   - **Salvaguarda Dinámica de Encabezados:** Queda estrictamente prohibido que cualquier función de saneamiento o eliminación de celdas (`deleteColumns`) utilice límites numéricos rígidos inferiores a la cantidad de encabezados de la hoja.
   - Toda función de saneamiento debe evaluar `safeLimitCols = Math.max(limitCols, headerCols, sheet.getLastColumn())` antes de invocar `deleteColumns`. Esto asegura que la adición de futuras columnas (Col 20, 21, etc.) jamás resulte en el borrado accidental de datos.

3. **Protocolo Obligatorio de Confirmación de Git Push:**
   - Al concluir cualquier tarea o modificación técnica, el asistente debe preguntar explícitamente al usuario si desea guardar y sincronizar de inmediato los cambios con el repositorio en GitHub (`git add`, `git commit`, `git push`), evitando cualquier acumulación de cambios sin respaldar en la nube.

---

## 🖨️ FASE 13: PATRÓN DE RENDERIZADO DE IMPRESIÓN, PDFS Y PROCESAMIENTO CANVAS EN GAS

1. **Rasterización Local en Memoria para Impresión (Canvas DataURL):**
   - **Problema de Sandboxing en Chromium:** Las imágenes cargadas desde Google Drive (`https://drive.google.com/thumbnail?...`) o URLs remotas suelen fallar o ser bloqueadas por el sandbox de impresión de Chrome/Edge (`window.print()`), resultando en recuadros grises o la visualización del texto `alt`.
   - **Estándar Telat Obligatorio:** Al generar el clon del documento para impresión, extrae directamente los píxeles del elemento `<img>` montado en pantalla mediante un `<canvas>` offscreen en memoria (`canvas.toDataURL('image/jpeg', 0.95)`). Al inyectar el `data:image/jpeg;base64,...` resultante, la imagen se imprime instantáneamente al 100% de calidad sin depender de peticiones de red.
   - **Remoción de Atributo `alt` en Impresión:** Elimina el atributo `alt` de las imágenes de impresión para evitar que el navegador dibuje texto de fallback si ocurre alguna demora de milisegundos.

2. **Ciclo de Vida Asíncrono de Impresión (`window.onafterprint`):**
   - **Prohibición de Destrucción Síncrona:** Jamás ejecutes `printArea.innerHTML = ''` en la línea siguiente a `window.print()`. En navegadores modernos, la preparación del spooler de impresión/PDF es asíncrona; vaciar el contenedor destruye los nodos antes de que Chromium termine de capturarlos.
   - **Solución:** Utiliza el evento nativo `window.onafterprint` acompañado de un temporizador de seguridad diferido (>5000ms) para garantizar que la limpieza del DOM ocurra únicamente después de que el diálogo de impresión se haya cerrado.

3. **Candado Vertical Dinámico y Densidad de Página (100vh / Anti-Gap):**
   - Para documentos oficiales de 1 página (CVs, cartas membretadas, certificados), establece `.cv-page { height: 100vh; max-height: 100vh; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }`.
   - Calibra tipografías (10.5px a 11.5px), interlineados (1.4 a 1.5) y garantiza 3 bloques completos de trayectoria laboral con 2-3 viñetas descriptivas para cubrir armónicamente el 90-95% del espacio físico sin saltos a una segunda hoja ni huecos vacíos en el centro.

4. **Mapeo Resiliente por Nombre de Encabezado en Sheets (Anti-Desfase):**
   - Queda estrictamente prohibido usar índices numéricos estáticos (ej. `row[15]`) para leer o escribir columnas críticas como `Foto_URL`.
   - Mapea siempre buscando el índice dinámico por nombre (`headers.indexOf("Foto_URL")`). Esto asegura que si se agregan, eliminan o reordenan columnas (como `Plantilla`), las columnas críticas jamás se desplacen ni queden desfasadas en la base de datos.


