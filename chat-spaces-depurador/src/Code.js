/**
 * Depurador de Espacios de Google Chat - Backend
 * Desarrollado para Telat Group
 * 
 * Este script administra la búsqueda, análisis de miembros, registro en bitácora
 * y eliminación masiva de espacios de Google Chat en base a la OU de los managers.
 */

// Branding Oficial Telat
var TELAT_BRANDING = {
  celeste: '#3284C6',
  naranja: '#EB5B27',
  amarillo: '#FECA66',
  oscuro: '#222221',
  claro: '#FBFBFD'
};

/**
 * Agrega el menú personalizado al abrir la hoja de cálculo.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🛠️ Depurador de Chat')
    .addItem('Abrir Consola de Depuración', 'abrirPanel')
    .addItem('Inicializar Hojas y Dashboard', 'initSheets')
    .addToUi();
}

/**
 * Abre el diálogo de la consola de depuración.
 */
function abrirPanel() {
  initSheets(); // Asegurar que las hojas están preparadas
  
  var html = HtmlService.createTemplateFromFile('UI')
    .evaluate()
    .setWidth(1050)
    .setHeight(700)
    .setTitle('Consola de Depuración de Google Chat');
  
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

/**
 * Incluye archivos HTML (CSS/JS) en la plantilla principal.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Inicializa las pestañas de la hoja de cálculo y diseña el Dashboard.
 */
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Bitácora de Depuración
  var bitacoraSheet = ss.getSheetByName('Bitacora_Depuracion');
  var headers = [
    'Fecha Eliminación',
    'ID Espacio',
    'Nombre del Espacio',
    'Tipo de Espacio',
    'Fecha Creación',
    'Última Actividad',
    'Managers (Email)',
    'Managers (OU)',
    'Cantidad de Miembros',
    'Integrantes (Detalle)',
    'Eliminado Por'
  ];
  
  if (!bitacoraSheet) {
    bitacoraSheet = ss.insertSheet('Bitacora_Depuracion');
    // Escribir cabecera de forma inmutable
    bitacoraSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    bitacoraSheet.getRange(1, 1, 1, headers.length)
      .setBackground(TELAT_BRANDING.oscuro)
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    bitacoraSheet.setFrozenRows(1);
    bitacoraSheet.autoResizeColumns();
  } else {
    // Escribir cabecera de forma inmutable para evitar desajustes
    bitacoraSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // 2. Dashboard
  var dashboardSheet = ss.getSheetByName('Dashboard');
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet('Dashboard', 0);
    disenarDashboard(dashboardSheet);
  }
  
  // Ocultar pestañas innecesarias si existieran
  var defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (defaultSheet) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(e) {}
  }
}

/**
 * Diseña el Dashboard interactivo dentro de la hoja de cálculo.
 */
function disenarDashboard(sheet) {
  sheet.clear();
  sheet.showSheet();
  
  // Desactivar cuadrícula para diseño limpio
  sheet.setHiddenGridlines(true);
  
  // Título Principal
  sheet.getRange('B2').setValue('CONSOLA DE DEPURACIÓN').setFontSize(16).setFontWeight('bold').setFontColor(TELAT_BRANDING.celeste);
  sheet.getRange('B3').setValue('Google Chat - Limpieza Organizativa (OU Operadores PCI)').setFontSize(11).setFontColor('#666666');
  
  // Tarjetas de Métricas
  sheet.getRange('B5:C5').merge().setValue('Métricas de Depuración').setFontWeight('bold').setBackground('#EAEAEA');
  sheet.getRange('B6').setValue('Total Espacios Eliminados');
  sheet.getRange('C6').setFormula('=COUNTA(Bitacora_Depuracion!A:A)-1');
  sheet.getRange('B7').setValue('Última Actualización');
  sheet.getRange('C7').setValue(new Date()).setNumberFormat('dd/MM/yyyy HH:mm');
  
  // Estilizar bloque métricas
  sheet.getRange('B5:C7').setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('C6:C7').setHorizontalAlignment('center');
  
  // Instrucciones de Uso
  sheet.getRange('B9').setValue('Instrucciones de Uso:').setFontWeight('bold').setFontSize(12);
  var instrucciones = [
    ['1. Abre el menú superior "🛠️ Depurador de Chat" y da clic en "Abrir Consola de Depuración".'],
    ['2. La aplicación cargará la lista completa de espacios y chats grupales de la organización.'],
    ['3. Se analizarán los "Managers" actuales de cada espacio para determinar si pertenecen a la OU "Operadores PCI".'],
    ['4. Podrás previsualizar toda la información y seleccionar en lote los espacios a eliminar.'],
    ['5. Al confirmar la depuración, se guardará la metadata completa de los integrantes en la pestaña "Bitacora_Depuracion" antes del borrado físico.']
  ];
  sheet.getRange('B10:B14').setValues(instrucciones).setFontColor('#444444');
  
  // Ajustar anchos
  sheet.setColumnWidth(1, 40);
  sheet.setColumnWidth(2, 350);
  sheet.setColumnWidth(3, 200);
}

/**
 * Obtiene métricas agregadas del Dashboard para la UI.
 */
function obtenerMetricasDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bitacoraSheet = ss.getSheetByName('Bitacora_Depuracion');
  var totalBorrados = 0;
  
  if (bitacoraSheet) {
    var lastRow = bitacoraSheet.getLastRow();
    if (lastRow > 1) {
      totalBorrados = lastRow - 1;
    }
  }
  
  return {
    totalBorrados: totalBorrados
  };
}

/**
 * Busca de forma recursiva todas las Unidades Organizativas (OUs) que coincidan con "Operadores PCI".
 */
function findPCIOrgUnitPaths() {
  try {
    var response = AdminDirectory.Orgunits.list('my_customer', {
      type: 'all' // Búsqueda recursiva completa
    });
    var paths = [];
    if (response.organizationUnits) {
      for (var i = 0; i < response.organizationUnits.length; i++) {
        var ou = response.organizationUnits[i];
        // Coincide si el nombre de la OU es exactamente "Operadores PCI" o el path termina con ella
        if (ou.name === 'Operadores PCI' || ou.orgUnitPath.split('/').pop() === 'Operadores PCI') {
          paths.push(ou.orgUnitPath);
        }
      }
    }
    // Si no se encuentran OUs pero el usuario insiste, agregamos rutas probables
    if (paths.length === 0) {
      paths.push('/Operadores PCI');
    }
    return paths;
  } catch (e) {
    Logger.log('Error al listar OUs en Workspace: ' + e.toString());
    return ['/Operadores PCI']; // Fallback básico
  }
}

/**
 * Precarga todos los usuarios pertenecientes a la OU "Operadores PCI" para evitar peticiones redundantes.
 */
function getPCIOperatorsSet() {
  var pciPaths = findPCIOrgUnitPaths();
  var pciUsers = {}; // Mapeo ID -> true y Email -> true
  
  pciPaths.forEach(function(path) {
    var pageToken;
    try {
      do {
        var response = AdminDirectory.Users.list({
          customer: 'my_customer',
          query: "orgUnitPath='" + path + "'",
          maxResults: 500,
          pageToken: pageToken
        });
        if (response.users) {
          response.users.forEach(function(user) {
            pciUsers[user.primaryEmail.toLowerCase()] = true;
            pciUsers[user.id] = true;
          });
        }
        pageToken = response.nextPageToken;
      } while (pageToken);
    } catch (e) {
      Logger.log('Error al listar usuarios para la OU ' + path + ': ' + e.toString());
    }
  });
  
  return pciUsers;
}

/**
 * Precarga de forma masiva todos los usuarios del dominio en un caché temporal
 * para resolver nombres, correos y OUs rápidamente durante el log de bitácora.
 */
function buildGlobalUserCache() {
  var userCache = {}; // id -> {email, name, orgUnit}
  var pageToken;
  try {
    do {
      var response = AdminDirectory.Users.list({
        customer: 'my_customer',
        maxResults: 500,
        pageToken: pageToken
      });
      if (response.users) {
        response.users.forEach(function(user) {
          userCache[user.id] = {
            email: user.primaryEmail,
            name: user.name.fullName,
            orgUnit: user.orgUnitPath
          };
          userCache[user.primaryEmail.toLowerCase()] = {
            email: user.primaryEmail,
            name: user.name.fullName,
            orgUnit: user.orgUnitPath
          };
        });
      }
      pageToken = response.nextPageToken;
    } while (pageToken);
  } catch (e) {
    Logger.log('Error al precargar caché global de usuarios: ' + e.toString());
  }
  return userCache;
}

/**
 * Obtiene los detalles de un usuario consultando primero el caché global
 * y recurriendo a Directory API si no estuviera precargado.
 */
function getUserDetails(userIdOrEmail, globalCache) {
  var cleanKey = userIdOrEmail.replace('users/', '').toLowerCase();
  
  if (globalCache && globalCache[cleanKey]) {
    return globalCache[cleanKey];
  }
  
  // Intento de consulta en caliente (Fallback)
  try {
    var user = AdminDirectory.Users.get(cleanKey);
    if (user) {
      var details = {
        email: user.primaryEmail,
        name: user.name.fullName,
        orgUnit: user.orgUnitPath
      };
      if (globalCache) {
        globalCache[cleanKey] = details;
      }
      return details;
    }
  } catch (e) {
    // Si falla o es usuario externo
  }
  
  return {
    email: userIdOrEmail.indexOf('@') > -1 ? userIdOrEmail : 'N/A (Usuario Externo / Eliminado)',
    name: 'Usuario Externo',
    orgUnit: 'N/A (Externo)'
  };
}

/**
 * Lista todos los espacios del tenant (Spaces y Group Chats) mediante el API de Chat.
 */
function listAllSpaces() {
  var spacesList = [];
  var pageToken;
  
  var url = 'https://chat.googleapis.com/v1/spaces:search';
  
  try {
    do {
      // Búsqueda administrativa de todos los espacios y chats grupales
      var queryParams = [
        'useAdminAccess=true',
        'query=' + encodeURIComponent('customer = "customers/my_customer" AND (spaceType = "SPACE" OR spaceType = "GROUP_CHAT")'),
        'pageSize=500'
      ];
      
      if (pageToken) {
        queryParams.push('pageToken=' + pageToken);
      }
      
      var fullUrl = url + '?' + queryParams.join('&');
      
      var options = {
        'method': 'GET',
        'muteHttpExceptions': true,
        'headers': {
          'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
        }
      };
      
      var response = UrlFetchApp.fetch(fullUrl, options);
      var code = response.getResponseCode();
      
      if (code !== 200) {
        throw new Error('Error al listar espacios (Chat API REST): ' + response.getContentText());
      }
      
      var result = JSON.parse(response.getContentText());
      if (result.spaces) {
        result.spaces.forEach(function(space) {
          spacesList.push({
            name: space.name, // spaces/XXXX
            displayName: space.displayName || 'Chat Grupal (Sin Nombre)',
            spaceType: space.spaceType,
            createTime: space.createTime || '',
            lastActiveTime: space.lastActiveTime || ''
          });
        });
      }
      pageToken = result.nextPageToken;
    } while (pageToken);
    
    return {
      success: true,
      spaces: spacesList
    };
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Analiza un lote de espacios para determinar sus miembros, managers y su elegibilidad.
 */
function analyzeSpacesBatch(spaces) {
  try {
    // 1. Cargar el mapa de operadores de la OU PCI
    var pciUsers = getPCIOperatorsSet();
    
    // 2. Cargar el caché global de usuarios
    var globalCache = buildGlobalUserCache();
    
    var results = [];
    
    spaces.forEach(function(space) {
      var spaceName = space.name;
      var managers = [];
      var memberCount = 0;
      var pciManagersCount = 0;
      var otherManagersCount = 0;
      
      // Obtener miembros del espacio mediante REST con AdminAccess
      var url = 'https://chat.googleapis.com/v1/' + spaceName + '/members';
      var queryParams = [
        'useAdminAccess=true',
        'pageSize=1000' // Límite razonable de lectura por espacio
      ];
      
      var fullUrl = url + '?' + queryParams.join('&');
      var options = {
        'method': 'GET',
        'muteHttpExceptions': true,
        'headers': {
          'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
        }
      };
      
      var response = UrlFetchApp.fetch(fullUrl, options);
      var code = response.getResponseCode();
      
      if (code === 200) {
        var membershipResult = JSON.parse(response.getContentText());
        if (membershipResult.memberships) {
          memberCount = membershipResult.memberships.length;
          
          membershipResult.memberships.forEach(function(membership) {
            if (membership.member && membership.member.type === 'HUMAN') {
              var userResourceName = membership.member.name; // users/XXXX
              var userId = userResourceName.replace('users/', '');
              var role = membership.role; // ROLE_MANAGER o ROLE_MEMBER
              
              if (role === 'ROLE_MANAGER') {
                var userDetails = getUserDetails(userId, globalCache);
                var isPCI = pciUsers[userId] === true || (userDetails.email && pciUsers[userDetails.email.toLowerCase()] === true);
                
                managers.push({
                  id: userId,
                  email: userDetails.email,
                  name: userDetails.name,
                  orgUnit: userDetails.orgUnit,
                  isPCI: isPCI
                });
                
                if (isPCI) {
                  pciManagersCount++;
                } else {
                  otherManagersCount++;
                }
              }
            }
          });
        }
      }
      
      // Clasificación de Elegibilidad
      var eligibility = 'No Elegible';
      var reason = 'Sin managers de la OU Operadores PCI';
      
      if (pciManagersCount > 0 && otherManagersCount === 0) {
        eligibility = 'Elegible';
        reason = 'Todos los managers pertenecen a la OU Operadores PCI';
      } else if (pciManagersCount > 0 && otherManagersCount > 0) {
        eligibility = 'Conservado (Supervisor presente)';
        reason = 'Tiene managers de la OU PCI, pero también cuenta con supervisores/managers de otras OUs';
      } else if (memberCount === 0) {
        // Espacio huérfano
        eligibility = 'Elegible';
        reason = 'Espacio huérfano (Sin integrantes ni managers)';
      }
      
      results.push({
        name: space.name,
        displayName: space.displayName,
        spaceType: space.spaceType,
        createTime: space.createTime,
        lastActiveTime: space.lastActiveTime,
        memberCount: memberCount,
        managers: managers,
        eligibility: eligibility,
        reason: reason
      });
    });
    
    return {
      success: true,
      results: results
    };
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Ejecuta la eliminación física de un lote de espacios, registrándolos previamente en la bitácora.
 */
function deleteSpacesBatch(spaceNames) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bitacoraSheet = ss.getSheetByName('Bitacora_Depuracion');
  
  if (!bitacoraSheet) {
    return { success: false, error: 'La hoja de bitácora no se encuentra inicializada.' };
  }
  
  var adminEmail = Session.getActiveUser().getEmail() || 'Admin Telat';
  var globalCache = buildGlobalUserCache();
  
  var deletedCount = 0;
  var errors = [];
  
  spaceNames.forEach(function(spaceName) {
    try {
      // 1. Obtener metadata de miembros completa para trazabilidad absoluta
      var membersDetails = [];
      var managersEmails = [];
      var managersOUs = [];
      var spaceDisplayName = '';
      var spaceType = '';
      var createTime = '';
      var lastActiveTime = '';
      var memberCount = 0;
      
      // A. Obtener datos del espacio
      var spaceUrl = 'https://chat.googleapis.com/v1/' + spaceName + '?useAdminAccess=true';
      var spaceOptions = {
        'method': 'GET',
        'muteHttpExceptions': true,
        'headers': {
          'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
        }
      };
      var spaceResponse = UrlFetchApp.fetch(spaceUrl, spaceOptions);
      if (spaceResponse.getResponseCode() === 200) {
        var spaceData = JSON.parse(spaceResponse.getContentText());
        spaceDisplayName = spaceData.displayName || 'Chat Grupal (Sin Nombre)';
        spaceType = spaceData.spaceType || '';
        createTime = spaceData.createTime || '';
        lastActiveTime = spaceData.lastActiveTime || '';
      }
      
      // B. Obtener listado completo de miembros
      var memberUrl = 'https://chat.googleapis.com/v1/' + spaceName + '/members?useAdminAccess=true&pageSize=1000';
      var memberResponse = UrlFetchApp.fetch(memberUrl, spaceOptions);
      
      if (memberResponse.getResponseCode() === 200) {
        var membershipResult = JSON.parse(memberResponse.getContentText());
        if (membershipResult.memberships) {
          memberCount = membershipResult.memberships.length;
          
          membershipResult.memberships.forEach(function(membership) {
            if (membership.member && membership.member.type === 'HUMAN') {
              var userResourceName = membership.member.name; // users/XXXX
              var userId = userResourceName.replace('users/', '');
              var role = membership.role;
              
              var userDetails = getUserDetails(userId, globalCache);
              
              // Escribir en la lista de detalles
              var detailString = userDetails.name + ' (' + userDetails.email + ') [' + role + '] [OU: ' + userDetails.orgUnit + ']';
              membersDetails.push(detailString);
              
              if (role === 'ROLE_MANAGER') {
                managersEmails.push(userDetails.email);
                managersOUs.push(userDetails.orgUnit);
              }
            } else if (membership.member && membership.member.type === 'BOT') {
              membersDetails.push('Bot: ' + (membership.member.displayName || 'App'));
            }
          });
        }
      }
      
      // 2. Registrar en Bitácora (Sheets)
      var logRow = [
        new Date(), // Fecha Eliminación
        spaceName, // ID Espacio
        spaceDisplayName, // Nombre del Espacio
        spaceType, // Tipo
        createTime ? new Date(createTime) : '', // Fecha Creación
        lastActiveTime ? new Date(lastActiveTime) : '', // Última Actividad
        managersEmails.join(', '), // Managers (Email)
        managersOUs.join(', '), // Managers (OU)
        memberCount, // Cantidad de Miembros
        membersDetails.join('\n'), // Integrantes (Detalle)
        adminEmail // Eliminado Por
      ];
      
      // Escritura atómica al final de la hoja
      bitacoraSheet.appendRow(logRow);
      
      // 3. Eliminar espacio físicamente
      var deleteUrl = 'https://chat.googleapis.com/v1/' + spaceName + '?useAdminAccess=true';
      var deleteOptions = {
        'method': 'delete',
        'muteHttpExceptions': true,
        'headers': {
          'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
        }
      };
      
      var deleteResponse = UrlFetchApp.fetch(deleteUrl, deleteOptions);
      var deleteCode = deleteResponse.getResponseCode();
      
      if (deleteCode === 200 || deleteCode === 204) {
        deletedCount++;
      } else {
        throw new Error('Código API: ' + deleteCode + ' - ' + deleteResponse.getContentText());
      }
      
    } catch (e) {
      errors.push({
        space: spaceName,
        error: e.toString()
      });
    }
  });
  
  // Actualizar Dashboard
  var dashboardSheet = ss.getSheetByName('Dashboard');
  if (dashboardSheet) {
    disenarDashboard(dashboardSheet);
  }
  
  return {
    success: errors.length === 0,
    deletedCount: deletedCount,
    errors: errors
  };
}
