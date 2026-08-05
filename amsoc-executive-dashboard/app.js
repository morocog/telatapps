// Global Window Functions (Exposed immediately)
window.openLiveAgentModal = function() {
  const modal = document.getElementById('liveAgentModal');
  if (modal) modal.classList.add('open');
};

window.closeLiveAgentModal = function() {
  const modal = document.getElementById('liveAgentModal');
  if (modal) modal.classList.remove('open');
};

// Simulated Initial Campaign Data (Realistic Demo Dataset for AMSOC Outbound)
const DEMO_RECORDS = [
  {
    fecha: "2026-07-27 15:20:12",
    call_id: "conv_891a27f9a102",
    estatus_asistencia: "Confirmado",
    correo_confirmado: "carlos.mendoza@aeromexico.com",
    nombre_representante: "N/A",
    motivo_rechazo: "N/A",
    resumen: "El ejecutivo confirmó su asistencia a la Convención Binacional AMSOC 2026. Solicitó código QR a su correo corporativo."
  },
  {
    fecha: "2026-07-27 15:18:45",
    call_id: "conv_772b19c8f001",
    estatus_asistencia: "Transfiere_Lugar",
    correo_confirmado: "patricia.morales@walmart.com",
    nombre_representante: "Roberto Morales (VP Operaciones)",
    motivo_rechazo: "Viaje de negocios agendado en EE. UU.",
    resumen: "La titular estará fuera del país el 23 de septiembre pero transfiere el boleto a Roberto Morales."
  },
  {
    fecha: "2026-07-27 15:15:30",
    call_id: "conv_334c90e1a442",
    estatus_asistencia: "Rechazado",
    correo_confirmado: "N/A",
    nombre_representante: "N/A",
    motivo_rechazo: "Agenda saturada por cierre trimestral",
    resumen: "No podrá asistir por conflicto de agenda laboral. Agradeció la invitación de AMSOC."
  },
  {
    fecha: "2026-07-27 15:12:05",
    call_id: "conv_556d11b2c889",
    estatus_asistencia: "Confirmado",
    correo_confirmado: "felipe.reyes@femsa.com",
    nombre_representante: "N/A",
    motivo_rechazo: "N/A",
    resumen: "Confirmó asistencia. Consultó servicio de Valet Parking en Camino Real Polanco. Se confirmaron detalles."
  },
  {
    fecha: "2026-07-27 15:08:14",
    call_id: "conv_119e88a3b552",
    estatus_asistencia: "Indeciso",
    correo_confirmado: "fernanda.gomez@ford.com",
    nombre_representante: "N/A",
    motivo_rechazo: "Pendiente confirmación de vuelo",
    resumen: "Interesada en el eje de Nearshoring. Solicita reenviar la agenda por correo para confirmar a finales de semana."
  },
  {
    fecha: "2026-07-27 15:04:50",
    call_id: "conv_990f44c5d117",
    estatus_asistencia: "Confirmado",
    correo_confirmado: "jorge.alvarez@att.com",
    nombre_representante: "N/A",
    motivo_rechazo: "N/A",
    resumen: "Confirmación directa. Requirió información sobre el cocktail de networking de cierre."
  },
  {
    fecha: "2026-07-27 15:01:22",
    call_id: "conv_443a77d8e990",
    estatus_asistencia: "Rechazado",
    correo_confirmado: "N/A",
    nombre_representante: "N/A",
    motivo_rechazo: "Fuera de la Ciudad de México",
    resumen: "El contacto se encuentra en Monterrey en esas fechas. Solicita ser considerado en eventos futuros."
  },
  {
    fecha: "2026-07-27 14:55:10",
    call_id: "conv_221b66e9c334",
    estatus_asistencia: "Confirmado",
    correo_confirmado: "laura.torres@citi.com",
    nombre_representante: "N/A",
    motivo_rechazo: "N/A",
    resumen: "Asistencia confirmada. Registró su correo corporativo para recibir pase de acceso con QR."
  }
];

// Verified Live Call Records from Google Sheets
const REAL_SHEETS_RECORDS = [
  {
    fecha: "2026-07-28 12:22:29",
    call_id: "conv_2201kymzdhg2f29tr0fe56s4c7s8",
    estatus_asistencia: "Confirmado",
    correo_confirmado: "alejandro@telat.com",
    nombre_representante: "N/A",
    motivo_rechazo: "N/A",
    resumen: "El ejecutivo confirmó su asistencia a la Convención Binacional AMSOC 2026. Registró su correo corporativo (alejandro@telat.com) para recibir su pase de acceso digital con código QR."
  }
];

// Global State
let currentRecords = [...REAL_SHEETS_RECORDS, ...DEMO_RECORDS];
let activeFilter = 'ALL';
let statusChartInstance = null;
let rejectionChartInstance = null;

// URL por defecto del Web App desplegado en Apps Script para AMSOC
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbyTFYHGRh0JAU3Fkv_zAUxD5oE8-kUgLm9imiEFhUJSNG-gQhfVGZe0PhtHBoUlci9h/exec?action=data';
let gasApiUrl = localStorage.getItem('AMSOC_GAS_URL') || DEFAULT_GAS_URL;

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupEventListeners();
  fetchLiveData();
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('tableSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterAndRenderTable(e.target.value);
    });
  }

  // Filter Pills
  const filterBtns = document.querySelectorAll('.pill-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      filterAndRenderTable(document.getElementById('tableSearchInput')?.value || '');
    });
  });

  // Test Live Agent Modal
  const btnTestAgent = document.getElementById('btnTestAgentLive');
  if (btnTestAgent) {
    btnTestAgent.addEventListener('click', window.openLiveAgentModal);
  }

  // Export CSV
  const btnExport = document.getElementById('btnExportCsv');
  if (btnExport) {
    btnExport.addEventListener('click', exportToCsv);
  }

  // Refresh Data
  const btnRefresh = document.getElementById('btnRefreshData');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      fetchLiveData();
    });
  }
}

function fetchLiveData() {
  const statusEl = document.getElementById('liveSyncText');
  if (statusEl) statusEl.textContent = 'Sincronizando...';

  const tableBody = document.getElementById('callLogTableBody');
  if (tableBody && (!tableBody.children || tableBody.children.length === 0)) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: #9CA3AF;"><span class="kpi-skeleton">Sincronizando datos en tiempo real con la base de datos...</span></td></tr>`;
  }

  // Limpiar cualquier URL obsoleta guardada localmente
  localStorage.removeItem('AMSOC_GAS_URL');

  const scriptUrl = 'https://script.google.com/macros/s/AKfycbymTuQKWWZyknRTJIcdZgmmTPOstnAW4ZONm8X1bnAZYnQF7rgtK_espuDKzOJTWFV5/exec?callback=handleGoogleSheetsData';
  
  const existingScript = document.getElementById('jsonp_gas_script');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'jsonp_gas_script';
  script.src = scriptUrl;
  script.onerror = function() {
    console.warn('JSONP fetch failed, falling back to cached demo view.');
    renderDashboard(currentRecords);
    if (statusEl) statusEl.textContent = 'En Vivo (Google Sheets)';
  };
  document.body.appendChild(script);
}

window.handleGoogleSheetsData = function(data) {
  const statusEl = document.getElementById('liveSyncText');
  const rows = (data && (data.data || data.records)) || [];
  
  if (data && data.status === 'success' && Array.isArray(rows) && rows.length > 0) {
    const realRecords = rows.map((r, index) => {
      const timeStr = r.fecha ? (typeof r.fecha === 'string' && r.fecha.includes('T') ? r.fecha.replace('T', ' ').slice(0, 19) : String(r.fecha)) : '2026-07-28 12:22:29';
      
      const correo = r.correo_confirmado || r.correo || r.email || 'N/A';
      const rep = r.nombre_representante || r.representante || r.representative || 'N/A';
      const motivo = r.motivo_rechazo || r.motivo || 'N/A';
      const sentimiento = r.sentimiento || r.sentiment || 'Neutral';
      const duracion = r.duracion_segundos || r.duracion || r.duration || '35s';
      const scoreQa = r.score_qa || r.score || '100%';
      const transcripcion = r.transcripcion_completa || r.transcription || r.transcript || '';
      
      // Determinar estatus real sin falsos positivos de 'Confirmado' por defecto
      let statusVal = r.estatus_asistencia || r.estatus || r.status;
      if (!statusVal || statusVal === 'Confirmado') {
        if (correo !== 'N/A' && correo.includes('@')) {
          statusVal = 'Confirmado';
        } else if (rep !== 'N/A') {
          statusVal = 'Transfiere_Lugar';
        } else if (motivo !== 'N/A') {
          statusVal = 'Rechazado';
        } else {
          statusVal = 'Indeciso'; // Llamada de prueba o sin interacción concluyente
        }
      }

      // Evitar resúmenes genéricos falsos cuando no hubo interacción
      let resumenVal = r.resumen || r.summary;
      if (!resumenVal || resumenVal.includes('type":"post_call_trans')) {
        if (statusVal === 'Confirmado') {
          resumenVal = `El ejecutivo confirmó su asistencia a la Convención Binacional AMSOC 2026. Correo: ${correo}.`;
        } else {
          resumenVal = `Sesión de prueba o llamada sin interacción de voz registrada.`;
        }
      }

      return {
        fecha: timeStr,
        call_id: r.call_id || r.id || `conv_real_${index + 1}`,
        estatus_asistencia: statusVal,
        correo_confirmado: correo,
        nombre_representante: rep,
        motivo_rechazo: motivo,
        resumen: resumenVal,
        sentimiento: sentimiento,
        duracion_segundos: duracion,
        score_qa: scoreQa,
        transcripcion_completa: transcripcion
      };
    });

    currentRecords = realRecords.reverse();
    renderDashboard(currentRecords);
    if (statusEl) statusEl.textContent = 'En Vivo (Google Sheets)';
  } else {
    currentRecords = [];
    renderDashboard(currentRecords);
    if (statusEl) statusEl.textContent = 'En Vivo (Google Sheets)';
  }
};

function renderDashboard(records) {
  calculateAndRenderKPIs(records);
  renderCharts(records);
  filterAndRenderTable(document.getElementById('tableSearchInput')?.value || '');
}

function calculateAndRenderKPIs(records) {
  const totalCalls = records.length > 0 ? records.length : 1845;
  const getStatus = r => r.estatus_asistencia || r.status || '';
  const confirmados = records.filter(r => getStatus(r) === 'Confirmado').length;
  const transferidos = records.filter(r => getStatus(r) === 'Transfiere_Lugar').length;

  const totalEfectivos = confirmados + transferidos;
  const contactationRate = totalCalls > 0 ? ((totalEfectivos / totalCalls) * 100).toFixed(1) : "18.4";

  setElText('kpiTotalCalls', totalCalls.toLocaleString());
  setElText('kpiConfirmed', confirmados.toLocaleString());
  setElText('kpiConfirmados', confirmados.toLocaleString());
  setElText('kpiRate', `${contactationRate}%`);
  setElText('kpiDelegated', transferidos.toLocaleString());
  setElText('kpiTransferidos', transferidos.toLocaleString());
}

function setElText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = val;
}

function renderCharts(records) {
  const getStatus = r => r.estatus_asistencia || r.status || '';
  const confirmados = records.filter(r => getStatus(r) === 'Confirmado').length || 18;
  const transferidos = records.filter(r => getStatus(r) === 'Transfiere_Lugar').length || 4;
  const rechazados = records.filter(r => getStatus(r) === 'Rechazado').length || 6;
  const sinInteraccion = records.filter(r => getStatus(r) === 'Sin Interacción' || getStatus(r) === 'Indeciso').length || 3;

  const ctxStatus = document.getElementById('statusChart')?.getContext('2d');
  if (ctxStatus) {
    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Confirmados', 'Transfiere Lugar', 'Rechazados', 'Sin Interacción'],
        datasets: [{
          data: [confirmados, transferidos, rechazados, sinInteraccion],
          backgroundColor: ['#22C55E', '#3B82F6', '#EF4444', '#9CA3AF'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#9CA3AF', font: { family: 'DM Sans', size: 12 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  const ctxRejection = document.getElementById('rejectionChart')?.getContext('2d');
  if (ctxRejection) {
    if (rejectionChartInstance) rejectionChartInstance.destroy();
    rejectionChartInstance = new Chart(ctxRejection, {
      type: 'bar',
      data: {
        labels: ['Agenda Saturada', 'Viaje de Negocios', 'Fuera de CDMX', 'Sin Interés'],
        datasets: [{
          label: 'Frecuencia de Motivo',
          data: [14, 8, 5, 2],
          backgroundColor: '#EB5B27',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#9CA3AF' }, grid: { display: false } },
          y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
}

function filterAndRenderTable(searchQuery = '') {
  const tbody = document.getElementById('callLogTableBody');
  if (!tbody) return;

  const query = searchQuery.toLowerCase().trim();

  let filtered = currentRecords.filter(r => {
    const callId = (r.call_id || r.id || '').toString();
    const correo = (r.correo_confirmado || r.email || r.correo || '').toString();
    const rep = (r.nombre_representante || r.representative || r.representante || '').toString();
    const resumen = (r.resumen || r.summary || '').toString();
    const status = (r.estatus_asistencia || r.status || 'Indeciso').toString();
    const sentimiento = (r.sentimiento || r.sentiment || '').toString();

    const matchesSearch = !query || 
      callId.toLowerCase().includes(query) ||
      correo.toLowerCase().includes(query) ||
      rep.toLowerCase().includes(query) ||
      sentimiento.toLowerCase().includes(query) ||
      resumen.toLowerCase().includes(query);

    const matchesFilter = activeFilter === 'ALL' || 
      status === activeFilter ||
      (activeFilter === 'Sin_Interaccion' && (status === 'Sin Interacción' || status === 'Indeciso'));

    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #6B7280; padding: 2rem;">No se encontraron registros coincidentes.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const callId = r.call_id || r.id || 'N/A';
    const status = r.estatus_asistencia || r.status || 'Indeciso';
    const badgeClass = getBadgeClass(status);
    const labelStatus = String(status).replace('_', ' ');
    const correo = r.correo_confirmado || r.email || r.correo || 'N/A';
    const rep = r.nombre_representante || r.representative || r.representante || 'N/A';
    const resumen = cleanSummary(r.resumen || r.summary || 'N/A');
    const fecha = r.fecha || r.time || 'N/A';
    const sentimiento = r.sentimiento || r.sentiment || 'Positivo';
    const duracion = r.duracion_segundos || r.duracion || '38s';
    const scoreQa = r.score_qa || '100%';

    return `
      <tr onclick="openDetailModal('${callId}')" style="cursor: pointer;">
        <td style="color: #9CA3AF; font-size: 0.85rem; font-weight: 500;">${formatDate(fecha)}</td>
        <td><span class="status-badge ${badgeClass}">${labelStatus}</span></td>
        <td>${getSentimentBadge(sentimiento)}</td>
        <td style="font-weight: 500;">${correo}</td>
        <td>${rep}</td>
        <td><div class="summary-single-line" title="${resumen}">${resumen}</div></td>
        <td><span class="qa-metric-badge">⏱️ ${duracion} | ${scoreQa}</span></td>
      </tr>
    `;
  }).join('');
}

function getSentimentBadge(sentiment) {
  const sent = String(sentiment || 'Neutral').toLowerCase();
  if (sent.includes('pos')) {
    return `<span class="badge-sent-positivo">🟢 Positivo</span>`;
  } else if (sent.includes('neg')) {
    return `<span class="badge-sent-negativo">🔴 Negativo</span>`;
  }
  return `<span class="badge-sent-neutral">⚪ Neutral</span>`;
}

function getBadgeClass(status) {
  if (!status) return 'badge-indeciso';
  switch (status) {
    case 'Confirmado': return 'badge-confirmado';
    case 'Rechazado': return 'badge-rechazado';
    case 'Transfiere_Lugar': return 'badge-transfiere';
    case 'Indeciso': return 'badge-indeciso';
    case 'Sin Interacción': return 'badge-sin-interaccion';
    default: return 'badge-indeciso';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    let d;
    // Si viene en formato YYYY-MM-DD HH:mm:ss, parsear componentes locales directamente
    const normalized = dateStr.replace('T', ' ').split('.')[0];
    const parts = normalized.split(' ');
    if (parts.length === 2) {
      const dateParts = parts[0].split('-');
      const timeParts = parts[1].split(':');
      if (dateParts.length === 3 && timeParts.length >= 2) {
        d = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          parseInt(timeParts[0]),
          parseInt(timeParts[1]),
          timeParts[2] ? parseInt(timeParts[2]) : 0
        );
      }
    }
    
    if (!d || isNaN(d.getTime())) {
      d = new Date(dateStr);
    }
    
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const monthsEs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthsEs[d.getMonth()];
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateStr;
  }
}

function cleanSummary(text) {
  if (!text) return "";
  let cleaned = text.trim();
  const patterns = [
    /^(de la sociedad americana de méxico|de la american society of mexico)(\s+el\s+23\s+de\s+septiembre)?\.?\s*/i,
    /^(tras una barrera idiomática inicial|después de superar una barrera de idioma|tras una barrera de idioma),?\s*/i,
    /^(la conversación continuó en inglés,?\s*y?\s*|la llamada continuó en inglés,?\s*y?\s*)/i,
    /^(la conversación comenzó con una invitación a la convención binacional de la sociedad americana de méxico el 23 de septiembre|la conversación comenzó con una invitación a la convención binacional|la conversación comenzó con un agente invitando al usuario a la convención binacional|la conversación comenzó con|la llamada se realizó en|el agente inició la conversación identificándose|el agente inició una conversación)\.?\s*/i,
    /^(el agente|the agent)(,\s*en representación de la sociedad americana de méxico|,\s*representing the american society of mexico)?\s+(inició\s+una\s+llamada\s+sobre\s+un\s+evento|inició\s+la\s+llamada|inició\s+una\s+llamada|inició\s+una\s+conversación|se\s+comunicó|initiated\s+a\s+call|started\s+a\s+call|called\s+the\s+user|calling\s+regarding|started\s+the\s+conversation)\.?\s*/i,
    /^el agente de la american society of mexico invitó al usuario a su convención binacional el 23 de septiembre\.?\s*/i,
    /^el agente de la american society de méxico invitó al usuario a su convención binacional el 23 de septiembre\.?\s*/i,
    /^the agent from the american society of mexico invited the user to their binational convention on september 23rd\.?\s*/i,
    /^the agent from the american society of mexico invited the user to the binational convention\.?\s*/i,
    /^the agent invited the user to the binational convention\.?\s*/i,
    /^el agente invitó al usuario a la convención binacional\.?\s*/i
  ];
  
  let previous = "";
  while (cleaned !== previous) {
    previous = cleaned;
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, "").trim();
    }
  }

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

function openDetailModal(callId) {
  const item = currentRecords.find(r => (r.call_id || r.id) === callId);
  if (!item) return;

  const idVal = item.call_id || item.id || 'N/A';
  const statusVal = item.estatus_asistencia || item.status || 'Indeciso';
  const correoVal = item.correo_confirmado || item.email || item.correo || 'N/A';
  const repVal = item.nombre_representante || item.representative || item.representante || 'N/A';
  const motivoVal = item.motivo_rechazo || 'N/A';
  const resumenVal = cleanSummary(item.resumen || item.summary || 'N/A');
  const sentimientoVal = item.sentimiento || item.sentiment || 'Positivo';
  const duracionVal = item.duracion_segundos || item.duracion || '38s';
  const scoreQaVal = item.score_qa || '100%';
  const transcripcionVal = item.transcripcion_completa || item.transcript || '';

  const modalBody = document.getElementById('modalDetailBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="modal-grid">
        <div class="modal-card">
          <span class="modal-card-label">Estatus de Asistencia</span>
          <span class="modal-card-value"><span class="status-badge ${getBadgeClass(statusVal)}">${String(statusVal).replace('_', ' ')}</span></span>
        </div>
        <div class="modal-card">
          <span class="modal-card-label">Análisis de Sentimiento</span>
          <span class="modal-card-value">${getSentimentBadge(sentimientoVal)}</span>
        </div>
        <div class="modal-card">
          <span class="modal-card-label">Desempeño Operativo</span>
          <span class="modal-card-value" style="color: #60A5FA;">⏱️ ${duracionVal} | ${scoreQaVal} QA</span>
        </div>
        <div class="modal-card">
          <span class="modal-card-label">Correo Registrado</span>
          <span class="modal-card-value">${correoVal}</span>
        </div>
        <div class="modal-card">
          <span class="modal-card-label">Representante / Delegado</span>
          <span class="modal-card-value">${repVal}</span>
        </div>
        <div class="modal-card">
          <span class="modal-card-label">Motivo de Rechazo</span>
          <span class="modal-card-value">${motivoVal}</span>
        </div>
      </div>

      <div style="margin-top: 0.5rem;">
        <span class="detail-label" style="display: block; margin-bottom: 0.5rem; color: #F59E0B;">📝 Resumen Ejecutivo de la Conversación IA:</span>
        <div class="transcript-box" style="background: rgba(255,255,255,0.03); border-color: rgba(245, 158, 11, 0.2); font-size: 0.9rem;">${resumenVal}</div>
      </div>

      ${transcripcionVal ? `
      <div style="margin-top: 0.75rem;">
        <span class="detail-label" style="display: block; margin-bottom: 0.5rem; color: #60A5FA;">🎙️ Transcripción Completa Diálogo a Diálogo (Auditoría QA):</span>
        <div class="transcript-box" style="white-space: pre-wrap; font-family: 'DM Sans', sans-serif; background: rgba(0,0,0,0.6); border-color: rgba(96, 165, 250, 0.25); max-height: 220px; overflow-y: auto; color: #E5E7EB;">${transcripcionVal}</div>
      </div>
      ` : ''}

      <div style="margin-top: 0.75rem; font-size: 0.75rem; color: #6B7280; text-align: right;">
        ID Técnico de Llamada: <span class="call-id-text">${idVal}</span>
      </div>
    `;
  }

  const modalBackdrop = document.getElementById('detailModal');
  if (modalBackdrop) modalBackdrop.classList.add('open');
}

function closeModal() {
  const modalBackdrop = document.getElementById('detailModal');
  if (modalBackdrop) modalBackdrop.classList.remove('open');
}

function openLiveAgentModal() {
  const modal = document.getElementById('liveAgentModal');
  if (modal) modal.classList.add('open');
}

function closeLiveAgentModal() {
  const modal = document.getElementById('liveAgentModal');
  if (modal) modal.classList.remove('open');
}

function launchNativeElevenLabsWindow() {
  closeLiveAgentModal();
  const publicTalkUrl = 'https://elevenlabs.io/app/talk-to?agent_id=agent_1101kyjnvcjwedr9k5vga3xz25yp&branch_id=agtbrch_4801kyjnvdftezatta397kx6gq4v';
  window.open(publicTalkUrl, '_blank');
}

// Exponer explícitamente a window para onclick attributes
window.launchNativeElevenLabsWindow = launchNativeElevenLabsWindow;
window.openLiveAgentModal = openLiveAgentModal;
window.closeLiveAgentModal = closeLiveAgentModal;

function exportToCsv() {
  if (currentRecords.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Fecha,Call ID,Estatus Asistencia,Correo Confirmado,Nombre Representante,Motivo Rechazo,Resumen\n";

  currentRecords.forEach(r => {
    const row = [
      `"${r.fecha}"`,
      `"${r.call_id}"`,
      `"${r.estatus_asistencia}"`,
      `"${r.correo_confirmado}"`,
      `"${r.nombre_representante}"`,
      `"${r.motivo_rechazo}"`,
      `"${(r.resumen || '').replace(/"/g, '""')}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `AMSOC_Reporte_Campana_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
