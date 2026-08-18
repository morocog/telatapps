/**
 * Generador de Expedientes y CVs - Telat Mexico S.A. de C.V. / INFONAVIT
 * Licitación 033/CA/2026-109474
 * 
 * Backend en Google Apps Script
 */

// Encabezados canónicos inmutables de la base de datos de recursos (17 columnas estándar)
const ENCABEZADOS_RECURSOS = [
  "ID", "Numeral", "PerfilRomano", "Puesto", "Nombre", "RFC", "Telefono", "Correo", "Estudios", "Cedula", "ITIL", "Empresa1", "Empresa2", "Empresa3", "ReqText", "AplicaPropuesta", "Foto_URL"
];

// Encabezados de la base de datos de configuración
const ENCABEZADOS_CONFIG = [
  "Clave", "Valor", "Descripcion"
];

/**
 * Menú contextual en Google Sheets para control y mantenimiento de la base de datos.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🚀 Telat CVs Infonavit")
    .addItem("🔄 Reparar y Alinear Base de Datos (17 Columnas)", "forzarReparacionBaseDeDatos")
    .addToUi();
}

/**
 * Función manual ejecutable desde Google Sheets para forzar la reparación y alineación.
 */
function forzarReparacionBaseDeDatos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Recursos");
  const cat = obtenerCatalogoInicial();
  sanearYMigrarBaseDeDatos(sheet, cat);
  SpreadsheetApp.getUi().alert("✅ Base de datos alineada y reparada con éxito en las 17 columnas canónicas.");
}

/**
 * Punto de entrada para la Web App. Sirve el archivo index.html.
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
 * Auto-detecta y repara cualquier desfase de columnas existente en Google Sheets.
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
      ["TITULO_MEMBRETE", "TELAT MEXICO", "Título principal en mayúsculas que aparece junto al logo en el membrete"],
      ["RAZON_SOCIAL", "Telat Mexico S.A. de C.V.", "Razón social oficial que aparece en el membrete"],
      ["LICITACION", "Licitación Abierta 033/CA/2026-109474", "Identificador del proceso del Infonavit"],
      ["CORREO_CORPORATIVO_DOMINIO", "@telat-group.com", "Dominio predeterminado de correos"],
      ["LOGO_URL", "https://telat.mx/assets/img/logo.png", "URL pública del logotipo oficial de Telat"]
    ];
    sheetConfig.getRange(2, 1, configPredeterminada.length, ENCABEZADOS_CONFIG.length).setValues(configPredeterminada);
    debloatSpreadsheet(sheetConfig, ENCABEZADOS_CONFIG.length);
  } else {
    // Si la pestaña Config ya existe pero no tiene TITULO_MEMBRETE, insertarlo automáticamente
    const configRows = sheetConfig.getDataRange().getValues();
    const existingKeys = configRows.slice(1).map(r => r[0]);
    if (!existingKeys.includes("TITULO_MEMBRETE")) {
      sheetConfig.appendRow(["TITULO_MEMBRETE", "TELAT MEXICO", "Título principal en mayúsculas que aparece junto al logo en el membrete"]);
    }
  }

  // 2. Obtener o crear pestaña Recursos
  let sheetRecursos = ss.getSheetByName("Recursos");
  const catalogoMaestro = obtenerCatalogoInicial();

  if (!sheetRecursos) {
    sheetRecursos = ss.insertSheet("Recursos");
    sheetRecursos.getRange(1, 1, 1, ENCABEZADOS_RECURSOS.length).setValues([ENCABEZADOS_RECURSOS]);
    
    // Inicializar los 56 recursos de la estructura canónica
    const filasParaInsertar = catalogoMaestro.map((r, idx) => {
      const itilReq = r.itilReq;
      const cedulaReq = r.cedulaReq;
      return [
        r.id,
        r.numeral,
        r.perfilRomano,
        r.puesto,
        `CANDIDATO RECURSO #${r.id}`,
        `TEL${900101 + idx}HQ1`,
        `55 ${5000 + idx} 1234`,
        `recurso${r.id}@telat-group.com`,
        cedulaReq ? "Lic. en Sistemas Computacionales (Titulado)" : (itilReq ? "Lic. en Administración / Ingeniería (Pasante)" : "Bachillerato Tecnológico"),
        cedulaReq ? `${8120000 + idx}` : "No requerida",
        itilReq ? `GR750${1000 + idx}XX` : "N/A",
        "Atento Servicios S.A. de C.V. (Site Sevilla, CDMX - 2023 a 2026)",
        "Teleperformance México (Site Amores, CDMX - 2021 a 2023)",
        idx % 2 === 0 ? "Konecta México (Site Tlalnepantla, Edo. Méx. - 2019 a 2021)" : "",
        r.reqText,
        r.aplicaPropuesta ? "TRUE" : "FALSE",
        "" // Foto_URL
      ];
    });
    
    sheetRecursos.getRange(2, 1, filasParaInsertar.length, ENCABEZADOS_RECURSOS.length).setValues(filasParaInsertar);
    debloatSpreadsheet(sheetRecursos, ENCABEZADOS_RECURSOS.length);
  } else {
    // Auto-sanear y migrar columnas si la base de datos tenía el formato de 15 columnas o desfase
    sanearYMigrarBaseDeDatos(sheetRecursos, catalogoMaestro);
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

  // 4. Lectura atómica de Recursos mapeada dinámicamente por nombres de encabezado
  const lastRow = sheetRecursos.getLastRow();
  const lastCol = sheetRecursos.getLastColumn();
  const colAbarcar = Math.max(ENCABEZADOS_RECURSOS.length, lastCol);
  
  const rawRecursos = sheetRecursos.getRange(1, 1, Math.max(lastRow, 1), colAbarcar).getValues();
  const listaRecursos = [];
  
  const headers = rawRecursos[0];
  const getColVal = (fila, headerName) => {
    const idx = headers.indexOf(headerName);
    return (idx !== -1 && fila[idx] !== undefined) ? fila[idx] : "";
  };

  const mapCatalogo = {};
  catalogoMaestro.forEach(c => { mapCatalogo[c.id] = c; });

  for (let i = 1; i < rawRecursos.length; i++) {
    const fila = rawRecursos[i];
    const id = parseInt(getColVal(fila, "ID"));
    if (!isNaN(id)) {
      const defCat = mapCatalogo[id] || {};
      const aplicaVal = getColVal(fila, "AplicaPropuesta");
      const aplicaBool = aplicaVal === true || String(aplicaVal).toUpperCase() === "TRUE" || (aplicaVal === "" && defCat.aplicaPropuesta);

      const rawItil = String(getColVal(fila, "ITIL") || "");
      let tipoCert = "";
      let itilId = "";
      if (rawItil.includes("|")) {
        const parts = rawItil.split("|");
        tipoCert = parts[0].trim();
        itilId = parts.slice(1).join("|").trim();
      } else {
        itilId = rawItil || (defCat.itilReq ? `GR750${1000 + id}XX` : "N/A");
        if (id === 1) tipoCert = "ITIL 4 Managing Professional (MP)";
        else if (id === 7) tipoCert = "Certificación Profesional en IA / Machine Learning";
        else if (defCat.itilReq) tipoCert = "ITIL 4 Foundation";
        else tipoCert = "No requerida";
      }

      listaRecursos.push({
        id: id,
        numeral: String(getColVal(fila, "Numeral") || defCat.numeral || ""),
        perfilRomano: String(getColVal(fila, "PerfilRomano") || defCat.perfilRomano || ""),
        puesto: String(getColVal(fila, "Puesto") || defCat.puesto || ""),
        nombre: String(getColVal(fila, "Nombre") || `CANDIDATO RECURSO #${id}`),
        rfc: String(getColVal(fila, "RFC") || `TEL${900101 + id}HQ1`),
        telefono: String(getColVal(fila, "Telefono") || `55 ${5000 + id} 1234`),
        correo: String(getColVal(fila, "Correo") || `recurso${id}@telat-group.com`),
        estudios: String(getColVal(fila, "Estudios") || (defCat.cedulaReq ? "Lic. en Sistemas Computacionales (Titulado)" : "Bachillerato Tecnológico")),
        cedula: String(getColVal(fila, "Cedula") || (defCat.cedulaReq ? `${8120000 + id}` : "No requerida")),
        itil: itilId,
        tipoCertificacion: tipoCert,
        empresa1: String(getColVal(fila, "Empresa1")),
        empresa2: String(getColVal(fila, "Empresa2")),
        empresa3: String(getColVal(fila, "Empresa3")),
        reqText: String(getColVal(fila, "ReqText") || defCat.reqText || ""),
        aplicaPropuesta: aplicaBool,
        itilReq: defCat.itilReq !== undefined ? defCat.itilReq : false,
        cedulaReq: defCat.cedulaReq !== undefined ? defCat.cedulaReq : false,
        plantilla: defCat.plantilla || "OPERATIVO",
        foto: String(getColVal(fila, "Foto_URL"))
      });
    }
  }

  // Si por alguna razón la lista de la hoja quedó incompleta, completar con el catálogo
  if (listaRecursos.length < 56) {
    const idsPresentes = new Set(listaRecursos.map(r => r.id));
    catalogoMaestro.forEach((c, idx) => {
      if (!idsPresentes.has(c.id)) {
        listaRecursos.push({
          id: c.id,
          numeral: c.numeral,
          perfilRomano: c.perfilRomano,
          puesto: c.puesto,
          nombre: `CANDIDATO RECURSO #${c.id}`,
          rfc: `TEL${900101 + idx}HQ1`,
          telefono: `55 ${5000 + idx} 1234`,
          correo: `recurso${c.id}@telat-group.com`,
          estudios: c.cedulaReq ? "Lic. en Sistemas Computacionales (Titulado)" : (c.itilReq ? "Lic. en Administración / Ingeniería (Pasante)" : "Bachillerato Tecnológico"),
          cedula: c.cedulaReq ? `${8120000 + idx}` : "No requerida",
          itil: c.itilReq ? `GR750${1000 + idx}XX` : "N/A",
          empresa1: "Atento Servicios S.A. de C.V. (Site Sevilla, CDMX - 2023 a 2026)",
          empresa2: "Teleperformance México (Site Amores, CDMX - 2021 a 2023)",
          empresa3: idx % 2 === 0 ? "Konecta México (Site Tlalnepantla, Edo. Méx. - 2019 a 2021)" : "",
          reqText: c.reqText,
          aplicaPropuesta: c.aplicaPropuesta,
          itilReq: c.itilReq,
          cedulaReq: c.cedulaReq,
          plantilla: c.plantilla,
          foto: ""
        });
      }
    });
    listaRecursos.sort((a, b) => a.id - b.id);
  }

  return {
    config: cfgMap,
    recursos: listaRecursos
  };
}

/**
 * Auto-sanea y migra la base de datos de Google Sheets reparando cualquier desfase
 * de columnas previo (15 columnas históricas vs 17 canónicas actuales).
 * Preserva nombres, RFCs, fotos de Google Drive y datos ingresados por el usuario.
 */
function sanearYMigrarBaseDeDatos(sheet, catalogoMaestro) {
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  const lastCol = sheet.getLastColumn();
  const rawData = sheet.getRange(1, 1, lastRow, Math.max(lastCol, ENCABEZADOS_RECURSOS.length)).getValues();
  const headers = rawData[0];

  const romanosValidos = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  let necesitaMigracion = false;

  // Detectar si las filas están desfasadas por la inserción histórica de PerfilRomano o AplicaPropuesta
  for (let i = 1; i < rawData.length; i++) {
    const valColC = String(rawData[i][2] || "").trim();
    const valColE = String(rawData[i][4] || "").trim();
    const valColF = String(rawData[i][5] || "").trim();

    if (valColC !== "" && !romanosValidos.includes(valColC)) {
      necesitaMigracion = true;
      break;
    }
    if (/^[A-Z]{3,4}\d{6}/.test(valColE) && /^\d{2}[\s\d]{8,12}/.test(valColF)) {
      necesitaMigracion = true;
      break;
    }
  }

  // Si los encabezados están incompletos, forzar alineación
  if (headers.length < ENCABEZADOS_RECURSOS.length || headers.indexOf("AplicaPropuesta") === -1 || headers.indexOf("PerfilRomano") === -1) {
    necesitaMigracion = true;
  }

  if (!necesitaMigracion) return;

  const mapCat = {};
  catalogoMaestro.forEach(c => { mapCat[c.id] = c; });

  const filasReparadas = [];
  for (let i = 1; i < rawData.length; i++) {
    const r = rawData[i];
    const id = parseInt(r[0]);
    if (isNaN(id)) continue;

    const cat = mapCat[id] || {};
    
    // Evaluar si la fila actual está en formato desfasado de 15 columnas o ya en 17
    const valC = String(r[2] || "").trim();
    const estaDesfasada = valC !== "" && !romanosValidos.includes(valC);

    let nombre = "";
    let rfc = "";
    let telefono = "";
    let correo = "";
    let estudios = "";
    let cedula = "";
    let itil = "";
    let empresa1 = "";
    let empresa2 = "";
    let empresa3 = "";
    let fotoUrl = "";

    if (estaDesfasada) {
      // Mapeo desde formato desfasado de 15 columnas:
      // r[0]: ID
      // r[1]: Numeral viejo
      // r[2]: Puesto viejo ("Gerente de Proyecto", etc.)
      // r[3]: Nombre ("Carlos Cadena", etc.)
      // r[4]: RFC ("CADC54221545", etc.)
      // r[5]: Telefono ("5525445555", etc.)
      // r[6]: Correo ("operaciones.casia1@telat-group.com", etc.)
      // r[7]: Estudios ("Lic. en Sistemas Computacionales", etc.)
      // r[8]: Cedula ("8120000", etc.)
      // r[9]: ITIL ("GR7501000XX", etc.)
      // r[10]: Empresa1 ("Atento Servicios S.A. de C.V. ...")
      // r[11]: Empresa2 ("Konecta México ...")
      // r[12]: Empresa3 ("Atento México ...")
      nombre = r[3] || `CANDIDATO RECURSO #${id}`;
      rfc = r[4] || `TEL${900101 + id}HQ1`;
      telefono = r[5] || `55 ${5000 + id} 1234`;
      correo = r[6] || `recurso${id}@telat-group.com`;
      estudios = r[7] || (cat.cedulaReq ? "Lic. en Sistemas Computacionales (Titulado)" : "Bachillerato Tecnológico");
      cedula = r[8] || (cat.cedulaReq ? `${8120000 + id}` : "No requerida");
      itil = r[9] || (cat.itilReq ? `GR750${1000 + id}XX` : "N/A");
      empresa1 = r[10] || "";
      empresa2 = r[11] || "";
      empresa3 = (r[12] && !["GERENTE", "SUPERVISOR", "IA", "GESTOR", "STAFF", "AGENTE_MS", "AGENTE_CAL", "AGENTE_TEC", "AGENTE_CONM"].includes(String(r[12]).trim())) ? r[12] : "";
      
      // Buscar foto en cualquier columna a la derecha
      for (let colIdx = 12; colIdx < r.length; colIdx++) {
        const celdaStr = String(r[colIdx] || "").trim();
        if (celdaStr.includes("drive.google.com") || celdaStr.startsWith("http://") || celdaStr.startsWith("https://")) {
          fotoUrl = celdaStr;
          break;
        }
      }
    } else {
      // Fila normal
      nombre = r[4] || `CANDIDATO RECURSO #${id}`;
      rfc = r[5] || `TEL${900101 + id}HQ1`;
      telefono = r[6] || `55 ${5000 + id} 1234`;
      correo = r[7] || `recurso${id}@telat-group.com`;
      estudios = r[8] || (cat.cedulaReq ? "Lic. en Sistemas Computacionales (Titulado)" : "Bachillerato Tecnológico");
      cedula = r[9] || (cat.cedulaReq ? `${8120000 + id}` : "No requerida");
      itil = r[10] || (cat.itilReq ? `GR750${1000 + id}XX` : "N/A");
      empresa1 = r[11] || "";
      empresa2 = r[12] || "";
      empresa3 = r[13] || "";
      fotoUrl = r[16] || "";
    }

    filasReparadas.push([
      id,
      cat.numeral || r[1] || "",
      cat.perfilRomano || "",
      cat.puesto || "",
      nombre,
      rfc,
      telefono,
      correo,
      estudios,
      cedula,
      itil,
      empresa1,
      empresa2,
      empresa3,
      cat.reqText || "",
      cat.aplicaPropuesta ? "TRUE" : "FALSE",
      fotoUrl
    ]);
  }

  // Escribir encabezados canónicos y filas reparadas de forma atómica en Google Sheets
  sheet.getRange(1, 1, 1, ENCABEZADOS_RECURSOS.length).setValues([ENCABEZADOS_RECURSOS]);
  if (filasReparadas.length > 0) {
    sheet.getRange(2, 1, filasReparadas.length, ENCABEZADOS_RECURSOS.length).setValues(filasReparadas);
  }
  debloatSpreadsheet(sheet, ENCABEZADOS_RECURSOS.length);
}

/**
 * Guarda o actualiza un recurso específico en la hoja 'Recursos' en base a su ID.
 * Se realiza una escritura batch mapeada por nombre de encabezado.
 */
function guardarRecursoEnSheet(id, datosRecurso) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Recursos");
  if (!sheet) throw new Error("Pestaña 'Recursos' no encontrada.");

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const colAbarcar = Math.max(ENCABEZADOS_RECURSOS.length, lastCol);

  // Leer toda la columna de IDs para ubicar la fila
  const idsCol = sheet.getRange(1, 1, Math.max(lastRow, 1), 1).getValues();
  let targetRow = -1;
  for (let i = 1; i < idsCol.length; i++) {
    if (parseInt(idsCol[i][0]) === parseInt(id)) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    targetRow = lastRow + 1;
  }

  const headers = sheet.getRange(1, 1, 1, colAbarcar).getValues()[0];
  const rawRow = new Array(colAbarcar).fill("");
  
  const setVal = (headerName, val) => {
    const idx = headers.indexOf(headerName);
    if (idx !== -1) {
      rawRow[idx] = (val !== undefined && val !== null) ? val : "";
    }
  };

  setVal("ID", id);
  setVal("Numeral", datosRecurso.numeral);
  setVal("PerfilRomano", datosRecurso.perfilRomano);
  setVal("Puesto", datosRecurso.puesto);
  setVal("Nombre", datosRecurso.nombre);
  setVal("RFC", datosRecurso.rfc);
  setVal("Telefono", datosRecurso.telefono);
  setVal("Correo", datosRecurso.correo);
  setVal("Estudios", datosRecurso.estudios);
  setVal("Cedula", datosRecurso.cedula);
  
  let valItilParaSheet = datosRecurso.itil || "";
  if (datosRecurso.tipoCertificacion && datosRecurso.tipoCertificacion !== "No requerida") {
    valItilParaSheet = `${datosRecurso.tipoCertificacion} | ${datosRecurso.itil || 'N/A'}`;
  }
  setVal("ITIL", valItilParaSheet);
  
  setVal("Empresa1", datosRecurso.empresa1);
  setVal("Empresa2", datosRecurso.empresa2);
  setVal("Empresa3", datosRecurso.empresa3);
  setVal("ReqText", datosRecurso.reqText);
  setVal("AplicaPropuesta", datosRecurso.aplicaPropuesta ? "TRUE" : "FALSE");
  setVal("Foto_URL", datosRecurso.foto);

  sheet.getRange(targetRow, 1, 1, colAbarcar).setValues([rawRow]);
  debloatSpreadsheet(sheet, ENCABEZADOS_RECURSOS.length);
  return true;
}

/**
 * Obtiene o crea la carpeta designada para fotos en Google Drive con permisos de lectura.
 */
function obtenerOCrearCarpetaFotos() {
  const nombreCarpeta = "Expedientes_Fotos_CVs_Infonavit";
  const carpetas = DriveApp.getFoldersByName(nombreCarpeta);
  if (carpetas.hasNext()) {
    return carpetas.next();
  }
  const nuevaCarpeta = DriveApp.createFolder(nombreCarpeta);
  try {
    nuevaCarpeta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    console.warn("Permiso de carpeta compartido no permitido por política del dominio:", e.message);
  }
  return nuevaCarpeta;
}

/**
 * Guarda o actualiza la foto de un candidato en Google Drive y actualiza la celda en Google Sheets.
 */
function subirFotoRecurso(id, base64Data, mimeType) {
  try {
    id = parseInt(id);
    if (isNaN(id)) throw new Error("ID de recurso no válido.");

    const carpeta = obtenerOCrearCarpetaFotos();
    const nombreArchivo = `Foto_Recurso_${id}.jpg`;
    
    // Limpiar archivo previo si existe en la carpeta
    const archivosExistentes = carpeta.getFilesByName(nombreArchivo);
    while (archivosExistentes.hasNext()) {
      const arch = archivosExistentes.next();
      arch.setTrashed(true);
    }

    // Extraer datos base64 puros
    let cleanBase64 = base64Data;
    if (cleanBase64.indexOf(',') !== -1) {
      cleanBase64 = cleanBase64.split(',')[1];
    }
    
    const bytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", nombreArchivo);
    const nuevoArchivo = carpeta.createFile(blob);
    try {
      nuevoArchivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      console.warn("No se pudo establecer permiso público directo:", e.message);
    }
    
    const fileId = nuevoArchivo.getId();
    const fotoUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w500";

    // Actualizar directamente en la base de datos de Sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Recursos");
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const lastCol = Math.max(ENCABEZADOS_RECURSOS.length, sheet.getLastColumn());
      const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("ID");
      let colFotoIdx = headers.indexOf("Foto_URL");

      if (colFotoIdx === -1) {
        sheet.getRange(1, 1, 1, ENCABEZADOS_RECURSOS.length).setValues([ENCABEZADOS_RECURSOS]);
        colFotoIdx = ENCABEZADOS_RECURSOS.indexOf("Foto_URL");
      }

      for (let i = 1; i < data.length; i++) {
        if (parseInt(data[i][idIdx]) === id) {
          sheet.getRange(i + 1, colFotoIdx + 1).setValue(fotoUrl);
          break;
        }
      }
    }

    return {
      success: true,
      id: id,
      fotoUrl: fotoUrl,
      fileId: fileId
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Elimina la foto de un candidato de Google Drive y limpia la celda en Sheets.
 */
function eliminarFotoRecurso(id) {
  try {
    id = parseInt(id);
    const carpeta = obtenerOCrearCarpetaFotos();
    const nombreArchivo = `Foto_Recurso_${id}.jpg`;
    
    const archivosExistentes = carpeta.getFilesByName(nombreArchivo);
    while (archivosExistentes.hasNext()) {
      archivosExistentes.next().setTrashed(true);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Recursos");
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const lastCol = Math.max(ENCABEZADOS_RECURSOS.length, sheet.getLastColumn());
      const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("ID");
      const colFotoIdx = headers.indexOf("Foto_URL");

      if (idIdx !== -1 && colFotoIdx !== -1) {
        for (let i = 1; i < data.length; i++) {
          if (parseInt(data[i][idIdx]) === id) {
            sheet.getRange(i + 1, colFotoIdx + 1).setValue("");
            break;
          }
        }
      }
    }

    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.message };
  }
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
 * Retorna el catálogo estructurado de los 56 perfiles con su clasificación canónica de Infonavit:
 * - 24 Recursos para Sobre 1 (Propuesta Técnica - Anexo 1.1 + Aclaraciones), con exactamente 12 ITIL.
 * - 56 Recursos para la Operación Total (Numeral 3.10 Anexo 1), con exactamente 17 ITIL.
 */
function obtenerCatalogoInicial() {
  const catalogo = [
    // 1. Perfil VIII - Gerente de Proyecto (ID 1) -> 1 Recurso (Req. 31) - ITIL SÍ
    {
      id: 1,
      numeral: "3.10.8 Dirección y Gobierno",
      perfilRomano: "VIII",
      puesto: "Gerente de Proyecto",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "GERENTE",
      reqText: "Req. 31 (Título/Cédula + ITIL Obligatorio)"
    },

    // 2. Perfil III - Supervisores de Mesa de Ayuda e Incidentes (IDs 2, 3, 4, 5) -> 4 Recursos - ITIL SÍ
    // IDs 2, 3, 4: Aplica Propuesta (Req. 25 - 3 recursos)
    {
      id: 2,
      numeral: "3.10.3 Supervisión Operativa",
      perfilRomano: "III",
      puesto: "Supervisor de Mesa de Ayuda e Incidentes",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "SUPERVISOR",
      reqText: "Req. 25 (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 3,
      numeral: "3.10.3 Supervisión Operativa",
      perfilRomano: "III",
      puesto: "Supervisor de Mesa de Ayuda e Incidentes",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "SUPERVISOR",
      reqText: "Req. 25 (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 4,
      numeral: "3.10.3 Supervisión Operativa",
      perfilRomano: "III",
      puesto: "Supervisor de Mesa de Ayuda e Incidentes",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "SUPERVISOR",
      reqText: "Req. 25 (Licenciatura + ITIL Obligatorio)"
    },
    // ID 5: Operación adicional
    {
      id: 5,
      numeral: "3.10.3 Supervisión Operativa",
      perfilRomano: "III",
      puesto: "Supervisor de Mesa de Ayuda e Incidentes",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: false,
      plantilla: "SUPERVISOR",
      reqText: "Operación (Licenciatura + ITIL Obligatorio)"
    },

    // 3. Perfil III - Supervisor de Conmutador (ID 6) -> 1 Recurso (Req. 26) - ITIL NO
    {
      id: 6,
      numeral: "3.10.3 Supervisión de Conmutador",
      perfilRomano: "III",
      puesto: "Supervisor de Conmutador",
      itilReq: false,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "SUPERVISOR",
      reqText: "Req. 26 (Licenciatura / ITIL No Requerido)"
    },

    // 4. Perfil VI - Especialista en IA Mesa de Ayuda (ID 7) -> 1 Recurso (Req. 29) - Cert IA/ML
    {
      id: 7,
      numeral: "3.10.6 Especialidad e Inteligencia Artificial",
      perfilRomano: "VI",
      puesto: "Especialista en IA Mesa de Ayuda",
      itilReq: false,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "NIVEL_IV_IA",
      reqText: "Req. 29 (Certificación IA / Machine Learning)"
    },

    // 5. Perfil IV - Gestores de Incidentes Mayores y Problemas (IDs 8 al 14) -> 7 Recursos - ITIL SÍ
    // IDs 8, 9, 10: Aplica Propuesta (Req. 27 - 3 recursos)
    {
      id: 8,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "NIVEL_IV_IA",
      reqText: "Req. 27 (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 9,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "NIVEL_IV_IA",
      reqText: "Req. 27 (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 10,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "NIVEL_IV_IA",
      reqText: "Req. 27 (Licenciatura + ITIL Obligatorio)"
    },
    // IDs 11 al 14: Operación adicional
    {
      id: 11,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: false,
      plantilla: "NIVEL_IV_IA",
      reqText: "Operación (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 12,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: false,
      plantilla: "NIVEL_IV_IA",
      reqText: "Operación (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 13,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: false,
      plantilla: "NIVEL_IV_IA",
      reqText: "Operación (Licenciatura + ITIL Obligatorio)"
    },
    {
      id: 14,
      numeral: "3.10.4 Gestión de Incidentes Mayores y Problemas",
      perfilRomano: "IV",
      puesto: "Gestor de Incidentes Mayores y Problemas",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: false,
      plantilla: "NIVEL_IV_IA",
      reqText: "Operación (Licenciatura + ITIL Obligatorio)"
    },

    // 6. Perfil VII - Gestor Documental (ID 15) -> 1 Recurso (Req. 30) - ITIL SÍ
    {
      id: 15,
      numeral: "3.10.7 Gestión Documental",
      perfilRomano: "VII",
      puesto: "Gestor Documental",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "STAFF",
      reqText: "Req. 30 (Licenciatura + ITIL Obligatorio)"
    },

    // 7. Perfil IX - Capacitador (ID 16) -> 1 Recurso (Req. 32) - ITIL SÍ
    {
      id: 16,
      numeral: "3.10.9 Capacitación y Formación",
      perfilRomano: "IX",
      puesto: "Capacitador",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "STAFF",
      reqText: "Req. 32 (Licenciatura + ITIL Obligatorio)"
    },

    // 8. Perfil X - Analistas de Calidad (IDs 17, 18) -> 2 Recursos (Req. 33 + Acl. 87) - ITIL SÍ
    {
      id: 17,
      numeral: "3.10.10 Aseguramiento de Calidad",
      perfilRomano: "X",
      puesto: "Analista de Calidad",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "STAFF",
      reqText: "Req. 33 / Acl. 87 (Licenciatura + ITIL)"
    },
    {
      id: 18,
      numeral: "3.10.10 Aseguramiento de Calidad",
      perfilRomano: "X",
      puesto: "Analista de Calidad",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "STAFF",
      reqText: "Req. 33 / Acl. 87 (Licenciatura + ITIL)"
    },

    // 9. Perfil XI - Analista de Información (ID 19) -> 1 Recurso (Req. 34) - ITIL SÍ
    {
      id: 19,
      numeral: "3.10.11 Analítica de Información y BI",
      perfilRomano: "XI",
      puesto: "Analista de Información",
      itilReq: true,
      cedulaReq: true,
      aplicaPropuesta: true,
      plantilla: "STAFF",
      reqText: "Req. 34 (Licenciatura + ITIL Obligatorio)"
    }
  ];

  // 10. Perfil I - Agentes de Mesa de Servicio (IDs 20 al 38) -> 19 Recursos - ITIL NO
  // IDs 20 al 24: Aplica Propuesta (Req. 23 - 5 recursos)
  // IDs 25 al 38: Operación adicional (14 recursos)
  for (let i = 20; i <= 38; i++) {
    const esPropuesta = i <= 24;
    catalogo.push({
      id: i,
      numeral: "3.10.1 Operación - Mesa de Servicio",
      perfilRomano: "I",
      puesto: `Agente de Mesa de Servicio (Posición #${i - 19})`,
      itilReq: false,
      cedulaReq: false,
      aplicaPropuesta: esPropuesta,
      plantilla: "OPERATIVO",
      reqText: esPropuesta ? "Req. 23 (Bachillerato Técnico Terminado)" : "Operación (Bachillerato Técnico)"
    });
  }

  // 11. Perfil I - Agentes de Mesa de Soporte Técnico (IDs 39 al 43) -> 5 Recursos - ITIL NO
  // Cubiertos operativamente (AplicaPropuesta = FALSE)
  for (let i = 39; i <= 43; i++) {
    catalogo.push({
      id: i,
      numeral: "3.10.1 Operación - Soporte Técnico",
      perfilRomano: "I",
      puesto: `Agente de Soporte Técnico (Posición #${i - 38})`,
      itilReq: false,
      cedulaReq: false,
      aplicaPropuesta: false,
      plantilla: "OPERATIVO",
      reqText: "Operación (Bachillerato Técnico)"
    });
  }

  // 12. Perfil II - Agentes de Control de Acceso Lógico (IDs 44 al 53) -> 10 Recursos - ITIL NO
  // IDs 44, 45, 46: Aplica Propuesta (Req. 24 - 3 recursos)
  // IDs 47 al 53: Operación adicional (7 recursos)
  for (let i = 44; i <= 53; i++) {
    const esPropuesta = i <= 46;
    catalogo.push({
      id: i,
      numeral: "3.10.2 Control de Acceso Lógico (CAL)",
      perfilRomano: "II",
      puesto: `Agente de Control de Acceso Lógico (Posición #${i - 43})`,
      itilReq: false,
      cedulaReq: false,
      aplicaPropuesta: esPropuesta,
      plantilla: "OPERATIVO",
      reqText: esPropuesta ? "Req. 24 (Bachillerato Técnico Terminado)" : "Operación (Bachillerato Técnico)"
    });
  }

  // 13. Perfil V - Agentes Telefónicos de Conmutador (IDs 54, 55, 56) -> 3 Recursos - ITIL NO
  // IDs 54, 55: Aplica Propuesta (Req. 28 - 2 recursos)
  // ID 56: Operación adicional (1 recurso)
  for (let i = 54; i <= 56; i++) {
    const esPropuesta = i <= 55;
    catalogo.push({
      id: i,
      numeral: "3.10.5 Operación - Conmutador Telefónico",
      perfilRomano: "V",
      puesto: `Agente Telefónico de Conmutador (Posición #${i - 53})`,
      itilReq: false,
      cedulaReq: false,
      aplicaPropuesta: esPropuesta,
      plantilla: "OPERATIVO",
      reqText: esPropuesta ? "Req. 28 (Bachillerato Técnico Terminado)" : "Operación (Bachillerato Técnico)"
    });
  }

  return catalogo;
}
