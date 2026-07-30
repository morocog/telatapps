# 🤖 REGLAS PERMANENTES DE AGENTE & MEMORIA PERSISTENTE DE TELAT GROUP

## 🎙️ ESTÁNDAR OBLIGATORIO DE ELEVENLABS CONVAI
1. **Primer Mensaje Sin Variables Dinámicas Incompletas (`first_message`):**
   - El mensaje inicial (`first_message`) de cualquier Agente Conversacional de ElevenLabs DEBE contener un saludo limpio en texto plano sin variables encerradas en corchetes dobles desatendidas (ej: `{{nombre_contacto}}`).
   - **Razón Técnica:** Si la llamada se inicia desde la web pública (`/app/talk-to` o Widget Web) sin pasar parámetros en la URL, el cliente Web Audio de ElevenLabs colapsa al intentar parsear la plantilla vacía, ocultando los controles de chat y cerrando la conexión del micrófono.
   - **Solución Estándar:** Usar saludos neutros completos (ej: *"Hola, habla un ejecutivo de la American Society of Mexico..."*). Para llamadas telefónicas salientes (Twilio), las variables dinámicas se inyectan en el prompt del sistema o en la carga útil del payload sin romper la vista web.

2. **Acceso Público & Permisos de Rama (`branch_id`):**
   - Asegurar que la rama principal tenga `anonymous_access` habilitado en la API y esté debidamente publicada (`Publish`) para prevenir el error `401 Unauthorized` en sesiones deslogueadas.
