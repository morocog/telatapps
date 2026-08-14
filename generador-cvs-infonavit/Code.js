/**
 * Generador de Expedientes y CVs - Telat Mexico S.A. de C.V. / INFONAVIT
 * Licitación 033/CA/2026-109474
 * 
 * Backend en Google Apps Script
 */

// Encabezados canónicos inmutables de la base de datos de recursos
const ENCABEZADOS_RECURSOS = [
  "ID", "Numeral", "Puesto", "Nombre", "RFC", "Telefono", "Correo", "Estudios", "Cedula", "ITIL", "Empresa1", "Empresa2", "ReqText", "Plantilla"
];

// Encabezados de la base de datos de configuración
const ENCABEZADOS_CONFIG = [
  "Clave", "Valor", "Descripcion"
];

/**
 * Punto de entrada para la Web App. sirve el archivo index.html.
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle("Generador de Expedientes - Telat Mexico")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Carga de forma resiliente la configuración y la lista de los 56 recursos.
 * Si las hojas no existen en el documento activo, las crea e inicializa con datos por defecto.
 */
function cargarDatosSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Obtener o crear pestaña Config
  let sheetConfig = ss.getSheetByName("Config");
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet("Config");
    sheetConfig.getRange(1, 1, 1, ENCABEZADOS_CONFIG.length).setValues([ENCABEZADOS_CONFIG]);
    
    // Valores predeterminados de configuración
    const configPredeterminada = [
      ["RAZON_SOCIAL", "Telat Mexico S.A. de C.V.", "Razón social oficial que aparece en el membrete"],
      ["LICITACION", "Licitación Abierta 033/CA/2026-109474", "Identificador del proceso del Infonavit"],
      ["CORREO_CORPORATIVO_DOMINIO", "@telat-group.com", "Dominio predeterminado de correos"],
      ["LOGO_URL", "https://telat.mx/assets/img/logo.png", "URL pública del logotipo oficial de Telat"]
    ];
    sheetConfig.getRange(2, 1, configPredeterminada.length, ENCABEZADOS_CONFIG.length).setValues(configPredeterminada);
    debloatSpreadsheet(sheetConfig, ENCABEZADOS_CONFIG.length);
  }

  // 2. Obtener o crear pestaña Recursos
  let sheetRecursos = ss.getSheetByName("Recursos");
  if (!sheetRecursos) {
    sheetRecursos = ss.insertSheet("Recursos");
    sheetRecursos.getRange(1, 1, 1, ENCABEZADOS_RECURSOS.length).setValues([ENCABEZADOS_RECURSOS]);
    
    // Inicializar los 56 recursos de la estructura del Anexo Técnico
    const recursosPredeterminados = obtenerCatalogoInicial();
    const filasParaInsertar = recursosPredeterminados.map((r, idx) => {
      const itilReq = r.itilReq;
      const cedulaReq = r.cedulaReq;
      return [
        r.id,
        r.numeral,
        r.puesto,
        `CANDIDATO RECURSO #${r.id}`,
        `TEL${900101 + idx}HQ1`,
        `55 ${5000 + idx} 1234`,
        `recurso${r.id}@telat-group.com`,
        cedulaReq ? "Lic. en Sistemas Computacionales (Titulado)" : (itilReq ? "Lic. en Administración / Ingeniería (Pasante)" : "Bachillerato Tecnológico"),
        cedulaReq ? `${8120000 + idx}` : "No requerida",
        itilReq ? `GR750${1000 + idx}XX` : "N/A",
        "Atento Servicios S.A. de C.V. (2022 - 2025)",
        "Teleperformance México (2020 - 2022)",
        r.reqText,
        r.plantilla
      ];
    });
    
    sheetRecursos.getRange(2, 1, filasParaInsertar.length, ENCABEZADOS_RECURSOS.length).setValues(filasParaInsertar);
    debloatSpreadsheet(sheetRecursos, ENCABEZADOS_RECURSOS.length);
  }

  // 3. Lectura resiliente de Configuración (clave-valor)
  const dataConfig = sheetConfig.getDataRange().getValues();
  const cfgMap = {};
  for (let i = 1; i < dataConfig.length; i++) {
    const key = dataConfig[i][0];
    const value = dataConfig[i][1];
    if (key) {
      cfgMap[key] = value;
    }
  }

  // 4. Lectura atómica de Recursos de ancho completo
  const lastRow = sheetRecursos.getLastRow();
  const lastCol = sheetRecursos.getLastColumn();
  const colAbarcar = Math.max(ENCABEZADOS_RECURSOS.length, lastCol);
  
  const rawRecursos = sheetRecursos.getRange(1, 1, lastRow, colAbarcar).getValues();
  const listaRecursos = [];
  
  // Mapeo dinámico basado en encabezados
  const headers = rawRecursos[0];
  const idxMap = {};
  ENCABEZADOS_RECURSOS.forEach(h => {
    idxMap[h] = headers.indexOf(h);
  });

  for (let i = 1; i < rawRecursos.length; i++) {
    const fila = rawRecursos[i];
    const id = parseInt(fila[idxMap["ID"]]);
    if (!isNaN(id)) {
      listaRecursos.push({
        id: id,
        numeral: fila[idxMap["Numeral"]],
        puesto: fila[idxMap["Puesto"]],
        nombre: fila[idxMap["Nombre"]],
        rfc: fila[idxMap["RFC"]],
        telefono: fila[idxMap["Telefono"]],
        correo: fila[idxMap["Correo"]],
        estudios: fila[idxMap["Estudios"]],
        cedula: fila[idxMap["Cedula"]],
        itil: fila[idxMap["ITIL"]],
        empresa1: fila[idxMap["Empresa1"]],
        empresa2: fila[idxMap["Empresa2"]],
        reqText: fila[idxMap["ReqText"]],
        plantilla: fila[idxMap["Plantilla"]]
      });
    }
  }

  return {
    config: cfgMap,
    recursos: listaRecursos
  };
}

/**
 * Guarda o actualiza un recurso específico en la hoja 'Recursos' en base a su ID.
 * Se realiza una escritura batch del ancho total de la fila.
 */
function guardarRecursoEnSheet(id, datosRecurso) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Recursos");
  if (!sheet) throw new Error("Pestaña 'Recursos' no encontrada.");

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const colAbarcar = Math.max(ENCABEZADOS_RECURSOS.length, lastCol);

  // Leer toda la columna de IDs para ubicar la fila
  const idsCol = sheet.getRange(1, 1, lastRow, 1).getValues();
  let targetRow = -1;
  for (let i = 1; i < idsCol.length; i++) {
    if (parseInt(idsCol[i][0]) === parseInt(id)) {
      targetRow = i + 1; // Fila basada en índice 1
      break;
    }
  }

  // Si no se encuentra, agregar al final
  if (targetRow === -1) {
    targetRow = lastRow + 1;
  }

  // Preparar el arreglo de valores respetando los encabezados canónicos
  const rawRow = new Array(colAbarcar).fill("");
  rawRow[0] = id;
  rawRow[1] = datosRecurso.numeral || "";
  rawRow[2] = datosRecurso.puesto || "";
  rawRow[3] = datosRecurso.nombre || "";
  rawRow[4] = datosRecurso.rfc || "";
  rawRow[5] = datosRecurso.telefono || "";
  rawRow[6] = datosRecurso.correo || "";
  rawRow[7] = datosRecurso.estudios || "";
  rawRow[8] = datosRecurso.cedula || "";
  rawRow[9] = datosRecurso.itil || "";
  rawRow[10] = datosRecurso.empresa1 || "";
  rawRow[11] = datosRecurso.empresa2 || "";
  rawRow[12] = datosRecurso.reqText || "";
  rawRow[13] = datosRecurso.plantilla || "";

  // Guardar en la hoja
  sheet.getRange(targetRow, 1, 1, colAbarcar).setValues([rawRow]);
  
  // Saneamiento de la hoja
  debloatSpreadsheet(sheet, ENCABEZADOS_RECURSOS.length);
  return true;
}

/**
 * Guarda o actualiza un valor de configuración en la hoja 'Config'.
 */
function guardarConfigEnSheet(clave, valor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Config");
  if (!sheet) throw new Error("Pestaña 'Config' no encontrada.");

  const lastRow = sheet.getLastRow();
  const clavesCol = sheet.getRange(1, 1, lastRow, 1).getValues();
  let targetRow = -1;

  for (let i = 1; i < clavesCol.length; i++) {
    if (clavesCol[i][0] === clave) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    targetRow = lastRow + 1;
    sheet.getRange(targetRow, 1, 1, 3).setValues([[clave, valor, "Parámetro actualizado desde la Web App"]]);
  } else {
    sheet.getRange(targetRow, 2).setValue(valor);
  }

  debloatSpreadsheet(sheet, ENCABEZADOS_CONFIG.length);
  return true;
}

/**
 * Elimina de forma segura las filas vacías y las columnas sobrantes.
 * Implementa protección anti-truncamiento calculando el límite dinámicamente.
 */
function debloatSpreadsheet(sheet, headerCols) {
  const lastRow = sheet.getLastRow();
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();

  // 1. Limpieza de filas vacías sobrantes
  if (maxRows > lastRow + 5) {
    sheet.deleteRows(lastRow + 1, maxRows - lastRow - 5);
  }

  // 2. Limpieza de columnas sobrantes (Calculando límite seguro inmutable)
  const safeLimitCols = Math.max(headerCols, sheet.getLastColumn());
  if (maxCols > safeLimitCols) {
    sheet.deleteColumns(safeLimitCols + 1, maxCols - safeLimitCols);
  }
}

/**
 * Retorna el catálogo estructurado de los 56 perfiles con su clasificación de Infonavit.
 */
function obtenerCatalogoInicial() {
  const catalogo = [
    // 4.1 Gerencia
    { id: 1, numeral: "4.1 Gerencia y Liderazgo", puesto: "Gerente de Proyecto", itilReq: true, cedulaReq: true, plantilla: "GERENTE", reqText: "Título + ITIL v4" },
    // 4.2 Supervisores
    { id: 2, numeral: "4.2 Supervisores de Operación", puesto: "Supervisor de Mesa de Servicio", itilReq: true, cedulaReq: false, plantilla: "SUPERVISOR", reqText: "ITIL v4 + Exp. 3a" },
    { id: 3, numeral: "4.2 Supervisores de Operación", puesto: "Supervisor de Control de Acceso Lógico", itilReq: true, cedulaReq: false, plantilla: "SUPERVISOR", reqText: "ITIL v4 + Exp. 3a" },
    { id: 4, numeral: "4.2 Supervisores de Operación", puesto: "Supervisor de Soporte Técnico (MTEC)", itilReq: true, cedulaReq: false, plantilla: "SUPERVISOR", reqText: "ITIL v4 + Exp. 3a" },
    { id: 5, numeral: "4.2 Supervisores de Operación", puesto: "Supervisor de Conmutador (Sede Rosario)", itilReq: true, cedulaReq: false, plantilla: "SUPERVISOR", reqText: "ITIL v4 + Exp. 3a" },
    { id: 6, numeral: "4.2 Supervisores de Operación", puesto: "Supervisor de Calidad y Procesos", itilReq: true, cedulaReq: false, plantilla: "SUPERVISOR", reqText: "ITIL v4 + Exp. 3a" },
    // 4.3 Gestores e IA
    { id: 7, numeral: "4.3 Especialista e Incidentes Nivel IV", puesto: "Especialista en Inteligencia Artificial y Prompts", itilReq: false, cedulaReq: false, plantilla: "IA", reqText: "Cert. IA / Cloud" },
    { id: 8, numeral: "4.3 Especialista e Incidentes Nivel IV", puesto: "Gestor de Incidentes Mayores y Problemas (Nivel IV)", itilReq: true, cedulaReq: false, plantilla: "GESTOR", reqText: "ITIL v4 + RCA" },
    { id: 9, numeral: "4.3 Especialista e Incidentes Nivel IV", puesto: "Gestor de Incidentes Mayores y Problemas (Nivel IV)", itilReq: true, cedulaReq: false, plantilla: "GESTOR", reqText: "ITIL v4 + RCA" },
    { id: 10, numeral: "4.3 Especialista e Incidentes Nivel IV", puesto: "Gestor de Incidentes Mayores y Problemas (Nivel IV)", itilReq: true, cedulaReq: false, plantilla: "GESTOR", reqText: "ITIL v4 + RCA" },
    { id: 11, numeral: "4.3 Especialista e Incidentes Nivel IV", puesto: "Gestor de Incidentes Mayores y Problemas (Nivel IV)", itilReq: true, cedulaReq: false, plantilla: "GESTOR", reqText: "ITIL v4 + RCA" },
    { id: 12, numeral: "4.3 Especialista e Incidentes Nivel IV", puesto: "Gestor de Incidentes Mayores y Problemas (Nivel IV)", itilReq: true, cedulaReq: false, plantilla: "GESTOR", reqText: "ITIL v4 + RCA" },
    // 4.4 Staff
    { id: 13, numeral: "4.4 Staff de Soporte Operativo", puesto: "Especialista de Monitoreo de Calidad", itilReq: false, cedulaReq: false, plantilla: "STAFF", reqText: "Monitoreo Calidad" },
    { id: 14, numeral: "4.4 Staff de Soporte Operativo", puesto: "Especialista de Capacitación y Formación", itilReq: false, cedulaReq: false, plantilla: "STAFF", reqText: "Formación BPO" },
    { id: 15, numeral: "4.4 Staff de Soporte Operativo", puesto: "Especialista de Información, Reportes y BI", itilReq: false, cedulaReq: false, plantilla: "STAFF", reqText: "Power BI / SQL" },
    { id: 16, numeral: "4.4 Staff de Soporte Operativo", puesto: "Gestor Documental de Mesa de Ayuda", itilReq: false, cedulaReq: false, plantilla: "STAFF", reqText: "Gestión Conocimiento" }
  ];

  // 4.5 Agentes Mesa de Servicio (19) - IDs 17 a 35
  for (let i = 1; i <= 19; i++) {
    catalogo.push({
      id: 16 + i,
      numeral: "4.5 Plantilla Operativa - Mesa de Servicio",
      puesto: `Agente de Mesa de Servicio (Posición #${i})`,
      itilReq: false, cedulaReq: false, plantilla: "AGENTE_MS",
      reqText: "Atención Telefónica"
    });
  }

  // 4.5 Agentes de Control de Acceso (11) - IDs 36 a 46
  for (let i = 1; i <= 11; i++) {
    catalogo.push({
      id: 35 + i,
      numeral: "4.5 Plantilla Operativa - Acceso Lógico",
      puesto: `Agente de Control de Acceso Lógico (Posición #${i})`,
      itilReq: false, cedulaReq: false, plantilla: "AGENTE_CAL",
      reqText: "Directorio Activo"
    });
  }

  // 4.5 Agentes de Soporte Técnico (8) - IDs 47 a 54
  for (let i = 1; i <= 8; i++) {
    catalogo.push({
      id: 46 + i,
      numeral: "4.5 Plantilla Operativa - Soporte Técnico",
      puesto: `Agente de Soporte Técnico MTEC (Posición #${i})`,
      itilReq: false, cedulaReq: false, plantilla: "AGENTE_TEC",
      reqText: "Soporte Microinformática"
    });
  }

  // 4.5 Agentes de Conmutador (2) - IDs 55 a 56
  for (let i = 1; i <= 2; i++) {
    catalogo.push({
      id: 54 + i,
      numeral: "4.5 Plantilla Operativa - Conmutador Rosario",
      puesto: `Agente Presencial Conmutador (Posición #${i})`,
      itilReq: false, cedulaReq: false, plantilla: "AGENTE_CONM",
      reqText: "Conmutador Sede Rosario"
    });
  }

  return catalogo;
}
