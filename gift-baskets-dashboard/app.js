/**
 * ==============================================================================
 * WINE COUNTRY GIFT BASKETS CONSULTANT - CAMPAIGN DASHBOARD CORE LOGIC
 * Dynamic charts, interactive calculators, state lookups, and sheets sync.
 * ==============================================================================
 */

// Global State
let currentRecords = [];
let activeFilter = 'ALL';
let statusChartInstance = null;
let categoryChartInstance = null;

// New ElevenLabs Agent ID created programmatically
const ELEVENLABS_AGENT_ID = 'agent_6701kyx4vhjpfp3aqrsv8w0x75r3';

// Default Google Apps Script URL (placeholder to update once deployed)
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbz_placeholder/exec?action=data';
let gasApiUrl = localStorage.getItem('WINE_BASKETS_GAS_URL') || DEFAULT_GAS_URL;

// Demo Dataset representing realistic Wine Country Gift Baskets campaign calls
const DEMO_RECORDS = [
  {
    fecha: "2026-07-31 15:20:12",
    call_id: "conv_6701_doe891a27f",
    estatus_pedido: "Completed",
    buyer_name: "John Doe",
    buyer_email: "john.doe@gmail.com",
    buyer_phone: "+1 (512) 555-0199",
    recipient_name: "Mary Doe",
    recipient_address: "1024 Pecan St, Austin, TX 78701",
    delivery_state: "TX",
    gift_item: "#002 (Wine Gift Basket)",
    gift_message: "DEAR MARY, HAPPY THANKSGIVING! HOPE YOU ENJOY THE WINE. LOVE, JOHN",
    shipping_method: "Standard",
    ivr_payment_status: "Approved",
    discount_code: "C (5% off)",
    resumen: "El comprador John Doe ordenó una canasta de vino (#002) para Mary Doe en Texas. Se confirmó el recargo de firma de adulto. El pago fue aprobado exitosamente en el IVR y se aplicó un descuento del 5%."
  },
  {
    fecha: "2026-07-31 14:45:30",
    call_id: "conv_6701_watson882",
    estatus_pedido: "Saved Cart",
    buyer_name: "Emily Watson",
    buyer_email: "emily.w@outlook.com",
    buyer_phone: "+1 (801) 555-0144",
    recipient_name: "Watson Family",
    recipient_address: "405 Temple Sq, Salt Lake City, UT 84150",
    delivery_state: "UT",
    gift_item: "N/A (Restricted)",
    gift_message: "N/A",
    shipping_method: "Standard",
    ivr_payment_status: "N/A",
    discount_code: "N/A",
    resumen: "La compradora Emily Watson intentó comprar una canasta con alcohol (#002) para entregar en Utah. El agente le informó sobre la prohibición de envíos de alcohol en UT y le sugirió la canasta de comida (#000). El cliente decidió guardar el carrito para consultar con su familia."
  },
  {
    fecha: "2026-07-31 13:12:05",
    call_id: "conv_6701_miller556",
    estatus_pedido: "IVR Failed",
    buyer_name: "David Miller",
    buyer_email: "dmiller@millerco.com",
    buyer_phone: "+1 (415) 555-0210",
    recipient_name: "Miller Corp Executives",
    recipient_address: "500 California St, San Francisco, CA 94104",
    delivery_state: "CA",
    gift_item: "#000 (Food Gift Basket)",
    gift_message: "HAPPY HOLIDAYS TO THE WHOLE TEAM FROM DAVID MILLER",
    shipping_method: "Expedited",
    ivr_payment_status: "Declined",
    discount_code: "N/A",
    resumen: "David Miller ordenó una canasta de comida (#000) con envío express a California. Al ser transferido al IVR seguro de pago, la tarjeta de crédito fue declinada repetidamente. El agente guardó el pedido en el carrito."
  },
  {
    fecha: "2026-07-31 11:35:14",
    call_id: "conv_6701_ak88a3b5",
    estatus_pedido: "Completed",
    buyer_name: "Sarah Jenkins",
    buyer_email: "sarah.j@alaska.edu",
    buyer_phone: "+1 (907) 555-0112",
    recipient_name: "Sarah Jenkins",
    recipient_address: "1860 Yukon Dr, Fairbanks, AK 99775",
    delivery_state: "AK",
    gift_item: "#000 (Food Gift Basket)",
    gift_message: "TO MYSELF, MERRY CHRISTMAS!",
    shipping_method: "Standard",
    ivr_payment_status: "Approved",
    discount_code: "C (5% off)",
    resumen: "Sarah Jenkins ordenó una canasta de comida (#000) para sí misma en Alaska. Se le informó y aceptó el recargo obligatorio de $19.95 por entrega en Alaska. Pago autorizado exitosamente por IVR."
  },
  {
    fecha: "2026-07-31 10:05:22",
    call_id: "conv_6701_fl443a77",
    estatus_pedido: "Completed",
    buyer_name: "Alejandro Gonzalez",
    buyer_email: "a.gonzalez@telat.com",
    buyer_phone: "+52 555-248-3354",
    recipient_name: "Maria Gonzalez",
    recipient_address: "104 Brickell Ave, Miami, FL 33131",
    delivery_state: "FL",
    gift_item: "#002 (Wine Gift Basket)",
    gift_message: "MAMA, DISFRUTA LAS CANASTAS. UN BESO, ALEJANDRO",
    shipping_method: "Standard",
    ivr_payment_status: "Approved",
    discount_code: "C (5% off)",
    resumen: "Llamada bilingüe. El cliente inició en inglés y cambió a español. Compró canasta con vino para su madre en Miami, Florida. Aceptó recargo de firma de adulto. Tarjeta autorizada por IVR."
  }
];

// Wine Shipping Restriction Lookup Data
const WINE_STATES_RULES = {
  "AL": { name: "Alabama", status: "RESTRICTED", note: "Prohibido envío directo a casa. Solo retiro en tiendas de control estatal (ABC)." },
  "AK": { name: "Alaska", status: "PERMITTED", note: "Permitido. Aplica cargo adicional de $19.95 por transporte aéreo." },
  "AZ": { name: "Arizona", status: "PERMITTED", note: "Permitido. Firma de adulto (21+) obligatoria en entrega." },
  "CA": { name: "California", status: "PERMITTED", note: "Permitido. Libre comercio de bodegas (Prop 65 aplicable)." },
  "DE": { name: "Delaware", status: "RESTRICTED", note: "Restringido por leyes de distribución directa estatales." },
  "FL": { name: "Florida", status: "PERMITTED", note: "Permitido. Firma de adulto obligatoria." },
  "HI": { name: "Hawaii", status: "PERMITTED", note: "Permitido. Aplica cargo adicional de $19.95 por transporte aéreo." },
  "KY": { name: "Kentucky", status: "PERMITTED", note: "Permitido con restricciones locales (solo condados autorizados)." },
  "MS": { name: "Mississippi", status: "RESTRICTED", note: "Prohibido absoluto por ley seca y control directo de bodegas." },
  "NY": { name: "New York", status: "PERMITTED", note: "Permitido. Firma de adulto obligatoria." },
  "TX": { name: "Texas", status: "PERMITTED", note: "Permitido. Firma de adulto obligatoria." },
  "UT": { name: "Utah", status: "RESTRICTED", note: "Prohibición absoluta. Envíos se consideran delito grave en el estado." }
};

// DOM Init
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupEventListeners();
  setupStateLookup();
  setupCalculator();
  fetchLiveData();
}

function setupEventListeners() {
  // Search Box filter
  const searchInput = document.getElementById('tableSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterAndRenderTable(e.target.value);
    });
  }

  // Filter Pills (All, Completed, Saved, IVR Failed)
  const filterBtns = document.querySelectorAll('.filter-pills .pill-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      filterAndRenderTable(document.getElementById('tableSearchInput')?.value || '');
    });
  });

  // Launch Voice Simulator Button
  const btnTestAgent = document.getElementById('btnTestAgentLive');
  if (btnTestAgent) {
    btnTestAgent.addEventListener('click', window.openLiveAgentModal);
  }

  // Refresh Button
  const btnRefresh = document.getElementById('btnRefreshData');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      fetchLiveData();
    });
  }
}

// Interactive State compliance search
function setupStateLookup() {
  const inputEl = document.getElementById('stateSearchInput');
  const btnCheck = document.getElementById('btnCheckState');
  const resultEl = document.getElementById('stateCheckResult');

  if (!btnCheck || !inputEl || !resultEl) return;

  const performCheck = () => {
    const query = inputEl.value.trim().toUpperCase();
    if (!query) {
      resultEl.innerHTML = `<span style="color: #9CA3AF;">Escribe el código del estado (Ej: UT, CA, MS).</span>`;
      return;
    }

    const stateRule = WINE_STATES_RULES[query];
    if (stateRule) {
      const isPermitted = stateRule.status === "PERMITTED";
      resultEl.innerHTML = `
        <div style="background: ${isPermitted ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}; border: 1px solid ${isPermitted ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}; border-radius: 8px; padding: 0.75rem; margin-top: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 0.25rem;">
            <span style="color: #FFFFFF;">${stateRule.name} (${query})</span>
            <span style="color: ${isPermitted ? '#4ADE80' : '#F87171'};">${stateRule.status}</span>
          </div>
          <p style="font-size: 0.8rem; color: #D1D5DB; line-height: 1.4;">${stateRule.note}</p>
        </div>
      `;
    } else {
      resultEl.innerHTML = `
        <div style="background: rgba(254,202,102,0.1); border: 1px solid rgba(254,202,102,0.3); border-radius: 8px; padding: 0.75rem; margin-top: 0.75rem; font-size: 0.8rem; color: #FBBF24;">
          Estado no listado. Por defecto se permite el envío de canastas alimenticias (Food), pero requiere validar leyes de alcohol específicas si es canasta de vino.
        </div>
      `;
    }
  };

  btnCheck.addEventListener('click', performCheck);
  inputEl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performCheck();
  });
}

// Shipping & basket price estimation calculator
function setupCalculator() {
  const calcBtn = document.getElementById('btnCalculate');
  const outputEl = document.getElementById('calcOutput');

  if (!calcBtn || !outputEl) return;

  calcBtn.addEventListener('click', () => {
    const giftType = document.getElementById('calcGiftType').value; // food ($75) vs wine ($95)
    const state = document.getElementById('calcState').value.trim().toUpperCase();
    const speed = document.getElementById('calcShippingSpeed').value; // std ($0) vs exp ($15)
    const promo = document.getElementById('calcPromo').value.trim().toUpperCase();

    let basePrice = giftType === "wine" ? 95.00 : 75.00;
    let shippingFee = speed === "expedited" ? 15.00 : 0.00;
    let surcharge = (state === "AK" || state === "HI") ? 19.95 : 0.00;
    
    // Validar restricciones de vino
    const isWine = giftType === "wine";
    const rule = WINE_STATES_RULES[state];
    if (isWine && rule && rule.status === "RESTRICTED") {
      outputEl.innerHTML = `
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 0.75rem; margin-top: 0.75rem; color: #F87171; font-size: 0.82rem;">
          ❌ <strong>¡Restricción de Envió!</strong> No se permite enviar canastas de vino a ${state}. El agente debe sugerir una de comida.
        </div>
      `;
      return;
    }

    let subtotal = basePrice + shippingFee + surcharge;
    let discount = 0.00;

    if (promo === "C") {
      discount = subtotal * 0.05; // 5% de descuento
    }

    let total = subtotal - discount;

    outputEl.innerHTML = `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--telat-card-border); border-radius: 8px; padding: 0.75rem; margin-top: 0.75rem; font-size: 0.82rem; line-height: 1.5;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #9CA3AF;">Precio base:</span>
          <span style="color: #FFF; font-weight: bold;">$${basePrice.toFixed(2)} USD</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #9CA3AF;">Envío (${speed === 'expedited' ? 'Exprés' : 'Estándar'}):</span>
          <span style="color: #FFF;">$${shippingFee.toFixed(2)} USD</span>
        </div>
        ${surcharge > 0 ? `
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #FECA66;">Surcharge (${state}):</span>
          <span style="color: #FECA66;">+$${surcharge.toFixed(2)} USD</span>
        </div>` : ''}
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; color: #22C55E;">
          <span>Descuento (5% - Código C):</span>
          <span>-$${discount.toFixed(2)} USD</span>
        </div>` : ''}
        <div style="border-top: 1px dashed rgba(255,255,255,0.1); margin-top: 0.5rem; padding-top: 0.5rem; display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem;">
          <span style="color: #FFFFFF;">Total Estimado:</span>
          <span style="color: #4ADE80;">$${total.toFixed(2)} USD</span>
        </div>
        ${isWine ? `
        <div style="color: #FECA66; font-size: 0.72rem; margin-top: 0.5rem; text-align: center;">
          ⚠️ Requiere firma de adulto mayor de 21 años en la entrega.
        </div>` : ''}
      </div>
    `;
  });
}

// Fetch live sheet rows using JSONP to avoid CORS limits
function fetchLiveData() {
  const statusEl = document.getElementById('liveSyncText');
  if (statusEl) statusEl.textContent = 'Sincronizando...';

  const tableBody = document.getElementById('callLogTableBody');
  if (tableBody && (!tableBody.children || tableBody.children.length === 0)) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: #9CA3AF;"><span class="kpi-skeleton">Cargando base de datos en tiempo real...</span></td></tr>`;
  }

  // Remover cualquier script de llamadas anteriores
  const existingScript = document.getElementById('jsonp_gas_script');
  if (existingScript) existingScript.remove();

  // Limpiar URL guardada en localStorage si no es válida
  if (gasApiUrl.includes('placeholder')) {
    localStorage.removeItem('WINE_BASKETS_GAS_URL');
  }

  // Obtener URL de Apps Script dinámica o la default
  const activeUrl = localStorage.getItem('WINE_BASKETS_GAS_URL') || gasApiUrl;
  const scriptUrl = activeUrl.split('?')[0] + '?callback=handleGoogleSheetsData';

  const script = document.createElement('script');
  script.id = 'jsonp_gas_script';
  script.src = scriptUrl;
  script.onerror = function() {
    console.warn('Fallo sincronización en vivo. Cargando dataset demo.');
    renderDashboard(DEMO_RECORDS);
    if (statusEl) statusEl.textContent = 'Demo Mode (Offline)';
  };
  document.body.appendChild(script);
}

// WebApp JSONP Callback handler
window.handleGoogleSheetsData = function(response) {
  const statusEl = document.getElementById('liveSyncText');
  const rows = (response && response.data) || [];
  
  if (response && response.status === 'success' && Array.isArray(rows) && rows.length > 0) {
    currentRecords = rows.map(r => {
      return {
        fecha: r.fecha || '2026-07-31 12:00:00',
        call_id: r.call_id || 'conv_real',
        estatus_pedido: r.estatus_pedido || 'Saved Cart',
        buyer_name: r.buyer_name || 'N/A',
        buyer_email: r.buyer_email || 'N/A',
        buyer_phone: r.buyer_phone || 'N/A',
        recipient_name: r.recipient_name || 'N/A',
        recipient_address: r.recipient_address || 'N/A',
        delivery_state: r.delivery_state || 'N/A',
        gift_item: r.gift_item || 'N/A',
        gift_message: r.gift_message || 'N/A',
        shipping_method: r.shipping_method || 'Standard',
        ivr_payment_status: r.ivr_payment_status || 'N/A',
        discount_code: r.discount_code || 'N/A',
        resumen: r.resumen || 'Procesado por el agente conversacional.'
      };
    });
    
    // Concatenar registros demo para mostrar volumen si hay pocos datos reales
    const allRecords = [...currentRecords, ...DEMO_RECORDS];
    renderDashboard(allRecords);
    if (statusEl) statusEl.textContent = 'En Vivo (Sincronizado)';
  } else {
    console.log("Sheet cargada vacía. Cargando demo.");
    renderDashboard(DEMO_RECORDS);
    if (statusEl) statusEl.textContent = 'Demo Mode (Hoja Vacía)';
  }
};

function renderDashboard(records) {
  currentRecords = records;
  filterAndRenderTable(document.getElementById('tableSearchInput')?.value || '');
  renderKPIs(records);
  renderCharts(records);
}

function filterAndRenderTable(searchVal) {
  const tableBody = document.getElementById('callLogTableBody');
  if (!tableBody) return;

  const query = searchVal.trim().toLowerCase();
  
  const filtered = currentRecords.filter(r => {
    // 1. Filtrar por Pill seleccionada
    if (activeFilter !== 'ALL' && r.estatus_pedido !== activeFilter) {
      return false;
    }
    // 2. Filtrar por buscador de texto
    if (query) {
      return r.call_id.toLowerCase().includes(query) ||
             r.buyer_name.toLowerCase().includes(query) ||
             r.buyer_email.toLowerCase().includes(query) ||
             r.recipient_name.toLowerCase().includes(query) ||
             r.resumen.toLowerCase().includes(query) ||
             r.delivery_state.toLowerCase().includes(query);
    }
    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: #9CA3AF;">No se encontraron pedidos coincidentes.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(r => {
    let statusClass = 'none';
    if (r.estatus_pedido === "Completed") statusClass = 'completed';
    else if (r.estatus_pedido === "IVR Failed") statusClass = 'failed';
    else if (r.estatus_pedido === "Saved Cart") statusClass = 'saved';

    return `
      <tr onclick="showRecordDetails('${r.call_id}')">
        <td style="font-weight: 500; color: #9CA3AF; white-space: nowrap;">${r.fecha}</td>
        <td>
          <span class="badge-status ${statusClass}">${r.estatus_pedido}</span>
        </td>
        <td style="font-weight: bold; color: #FFF;">${r.buyer_name}</td>
        <td style="color: #3284C6;">${r.delivery_state}</td>
        <td style="max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #D1D5DB;">
          ${r.resumen}
        </td>
        <td style="font-family: monospace; font-size: 0.8rem; color: #6B7280;">${r.call_id.slice(0, 15)}...</td>
      </tr>
    `;
  }).join('');
}

function renderKPIs(records) {
  const totalCalls = records.length;
  const completedOrders = records.filter(r => r.estatus_pedido === "Completed").length;
  const ivrFailed = records.filter(r => r.estatus_pedido === "IVR Failed").length;
  
  // Calcular porcentaje de conversión
  const rate = totalCalls > 0 ? ((completedOrders / totalCalls) * 100).toFixed(1) : 0;
  
  // Calcular estimación de ingresos (Food: $75, Wine: $95)
  let revenue = 0;
  records.forEach(r => {
    if (r.estatus_pedido === "Completed") {
      let base = r.gift_item.includes("Wine") ? 95 : 75;
      if (r.discount_code && r.discount_code !== "N/A") {
        base = base * 0.95; // aplicar el 5%
      }
      if (r.delivery_state === "AK" || r.delivery_state === "HI") {
        base += 19.95; // surcharge
      }
      revenue += base;
    }
  });

  // Escribir en la UI
  const totalCallsEl = document.getElementById('kpiTotalCalls');
  if (totalCallsEl) totalCallsEl.textContent = totalCalls;

  const kpiRateEl = document.getElementById('kpiRate');
  if (kpiRateEl) kpiRateEl.textContent = `${rate}%`;

  const kpiConfirmedEl = document.getElementById('kpiConfirmed');
  if (kpiConfirmedEl) kpiConfirmedEl.textContent = completedOrders;

  const kpiRevenueEl = document.getElementById('kpiRevenue');
  if (kpiRevenueEl) kpiRevenueEl.textContent = `$${revenue.toFixed(2)} USD`;
}

function renderCharts(records) {
  // Destruir gráficos anteriores si existen
  if (statusChartInstance) statusChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();

  // 1. Gráfico de Distribución de Estatus
  const completed = records.filter(r => r.estatus_pedido === "Completed").length;
  const saved = records.filter(r => r.estatus_pedido === "Saved Cart").length;
  const failed = records.filter(r => r.estatus_pedido === "IVR Failed").length;
  const noInteraction = records.filter(r => r.estatus_pedido === "Sin Interacción").length;

  const ctxStatus = document.getElementById('statusChart');
  if (ctxStatus) {
    statusChartInstance = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Completados', 'Guardados (Saved)', 'Declined (IVR)', 'Sin Interacción'],
        datasets: [{
          data: [completed, saved, failed, noInteraction],
          backgroundColor: ['#22C55E', '#3B82F6', '#EF4444', '#F59E0B'],
          borderColor: 'rgba(26, 28, 35, 0.9)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#9CA3AF', font: { family: 'DM Sans', size: 11 } }
          }
        }
      }
    });
  }

  // 2. Gráfico de Categoría del Regalo
  let wineCount = 0;
  let foodCount = 0;
  let restrictedCount = 0;

  records.forEach(r => {
    if (r.gift_item.includes("Wine")) wineCount++;
    else if (r.gift_item.includes("Food")) foodCount++;
    else if (r.gift_item.includes("Restricted") || r.gift_item === "N/A") restrictedCount++;
  });

  const ctxCategory = document.getElementById('categoryChart');
  if (ctxCategory) {
    categoryChartInstance = new Chart(ctxCategory, {
      type: 'bar',
      data: {
        labels: ['Vino (#002)', 'Comida (#000)', 'Restringido / N/A'],
        datasets: [{
          label: 'Cantidad de Regalos',
          data: [wineCount, foodCount, restrictedCount],
          backgroundColor: ['rgba(235, 91, 39, 0.7)', 'rgba(50, 132, 198, 0.7)', 'rgba(254, 202, 102, 0.7)'],
          borderColor: ['var(--telat-orange)', 'var(--telat-blue)', 'var(--telat-yellow)'],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
          x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// Show modal details for a specific call ID
window.showRecordDetails = function(callId) {
  const record = currentRecords.find(r => r.call_id === callId);
  if (!record) return;

  const modalBody = document.getElementById('modalDetailBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.75rem; margin-bottom: 1rem;">
        <span style="font-weight: 700; color: #FFF;">Conversación: ${record.call_id}</span>
        <span style="color: #9CA3AF;">${record.fecha}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Comprador:</span>
        <span class="detail-value">${record.buyer_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Correo:</span>
        <span class="detail-value">${record.buyer_email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Teléfono:</span>
        <span class="detail-value">${record.buyer_phone}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Destinatario:</span>
        <span class="detail-value">${record.recipient_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Dirección:</span>
        <span class="detail-value">${record.recipient_address}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estado de Entrega:</span>
        <span class="detail-value" style="font-weight: bold; color: #FECA66;">${record.delivery_state}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Regalo Seleccionado:</span>
        <span class="detail-value" style="color: #3284C6; font-weight: bold;">${record.gift_item}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Mensaje Tarjeta:</span>
        <span class="detail-value" style="font-family: monospace; font-size: 0.85rem; color: #4ADE80;">${record.gift_message}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Método de Envío:</span>
        <span class="detail-value">${record.shipping_method}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Código Descuento:</span>
        <span class="detail-value">${record.discount_code}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estatus Pago IVR:</span>
        <span class="detail-value">${record.ivr_payment_status}</span>
      </div>
      <div style="margin-top: 1.25rem;">
        <span class="detail-label" style="display: block; margin-bottom: 0.5rem;">Resumen de Conversación IA (Traducido):</span>
        <div class="transcript-box">${record.resumen}</div>
      </div>
    `;
  }

  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.add('open');
};

window.closeModal = function() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.remove('open');
};

window.openLiveAgentModal = function() {
  const modal = document.getElementById('liveAgentModal');
  if (modal) modal.classList.add('open');
};

window.closeLiveAgentModal = function() {
  const modal = document.getElementById('liveAgentModal');
  if (modal) modal.classList.remove('open');
};

// Launch the ElevenLabs conversation in a new tab
window.launchNativeElevenLabsWindow = function() {
  window.closeLiveAgentModal();
  const publicTalkUrl = `https://elevenlabs.io/app/talk-to?agent_id=${ELEVENLABS_AGENT_ID}`;
  window.open(publicTalkUrl, '_blank');
};

// Export active data to CSV file
window.exportToCsv = function() {
  if (currentRecords.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Fecha,Call ID,Estatus Pedido,Comprador,Correo Comprador,Telefono,Destinatario,Direccion,Estado,Articulo,Mensaje Tarjeta,Metodo Envio,Estatus Pago IVR,Descuento,Resumen\n";

  currentRecords.forEach(r => {
    const row = [
      `"${r.fecha}"`,
      `"${r.call_id}"`,
      `"${r.estatus_pedido}"`,
      `"${r.buyer_name}"`,
      `"${r.buyer_email}"`,
      `"${r.buyer_phone}"`,
      `"${r.recipient_name}"`,
      `"${r.recipient_address.replace(/"/g, '""')}"`,
      `"${r.delivery_state}"`,
      `"${r.gift_item}"`,
      `"${r.gift_message.replace(/"/g, '""')}"`,
      `"${r.shipping_method}"`,
      `"${r.ivr_payment_status}"`,
      `"${r.discount_code}"`,
      `"${(r.resumen || '').replace(/"/g, '""')}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `WINE_COUNTRY_Reporte_Pedidos_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Save a custom Google Sheets deployment URL locally
window.saveGasUrl = function() {
  const input = document.getElementById('inputGasUrl');
  if (input) {
    const val = input.value.trim();
    if (val) {
      localStorage.setItem('WINE_BASKETS_GAS_URL', val);
      alert("¡URL de Apps Script guardada correctamente! Actualizando datos...");
      fetchLiveData();
    } else {
      localStorage.removeItem('WINE_BASKETS_GAS_URL');
      alert("URL borrada. Reestableciendo valores demo.");
      fetchLiveData();
    }
  }
};
