const API = 'api';
let currentYear = 2026;
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const fmt = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

// ---- Navegacion (sidebar desktop + barra mobile, sincronizadas) ----
function goToTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tabName));
  loadTab(tabName);
}
document.getElementById('tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (btn) goToTab(btn.dataset.tab);
});
document.getElementById('tabsMobile').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (btn) goToTab(btn.dataset.tab);
});

document.getElementById('yearSwitch').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  currentYear = Number(btn.dataset.year);
  document.querySelectorAll('.year-switch button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadTab(document.querySelector('.tab.active').dataset.tab);
});

function loadTab(tab) {
  if (tab === 'resumen') loadResumen();
  if (tab === 'ingresos') loadIngresos();
  if (tab === 'gastos') loadGastos();
  if (tab === 'tarjetas') loadTarjetas();
  if (tab === 'prestamos') loadPrestamos();
  if (tab === 'rapipago') loadRapipago();
  if (tab === 'impuestos') loadImpuestos();
  if (tab === 'babypas') { loadBabypas(); loadBabypasMov(); }
  if (tab === 'ahorros') loadAhorros();
}

// ---- Personas y propiedades (para selects) ----
async function cargarPersonasEnSelects() {
  const personas = await fetch(`${API}/personas.php`).then(r => r.json());
  ['personaSelectGasto', 'personaSelectTarjeta', 'personaSelectPrestamo'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = personas.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  });
}
async function cargarPropiedadesEnSelects() {
  const props = await fetch(`${API}/propiedades.php`).then(r => r.json());
  const opts = props.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  document.getElementById('propiedadSelectIngreso').innerHTML += opts;
  document.getElementById('propiedadSelectImpuesto').innerHTML += opts;
}

// ---- Resumen ----
async function loadResumen() {
  const mesActual = new Date().getMonth() + 1;
  const data = await fetch(`${API}/resumen.php?anio=${currentYear}&mes=${mesActual}`).then(r => r.json());
  document.getElementById('resumenCards').innerHTML = `
    <div class="card"><p class="label">Ingresos del mes</p><p class="value">${fmt(data.ingresos_mes)}</p></div>
    <div class="card"><p class="label">Gastos del mes</p><p class="value">${fmt(data.gastos_mes)}</p></div>
    <div class="card"><p class="label">Tarjetas del mes</p><p class="value">${fmt(data.tarjetas_mes)}</p></div>
    <div class="card"><p class="label">Prestamos del mes</p><p class="value">${fmt(data.prestamos_mes)}</p></div>
    <div class="card"><p class="label">Rapipago del mes</p><p class="value">${fmt(data.rapipago_mes)}</p></div>
    <div class="card"><p class="label">Ahorro acumulado</p><p class="value">${fmt(data.ahorro_total)}</p></div>
  `;
  const max = Math.max(1, ...data.gastos_por_persona.map(p => Number(p.total)));
  document.getElementById('gastosPorPersona').innerHTML = data.gastos_por_persona.map(p => `
    <div class="bar-row">
      <div class="bar-top"><span>${p.nombre}</span><span>${fmt(p.total)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(p.total / max) * 100}%"></div></div>
    </div>`).join('');
}

// ---- Ingresos ----
document.getElementById('formIngresos').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/ingresos.php`, { method: 'POST', body: JSON.stringify({
    descripcion: f.get('descripcion'), tipo: f.get('tipo'), propiedad_id: f.get('propiedad_id') || null,
    monto: f.get('monto'), anio: currentYear, mes: f.get('mes')
  })});
  e.target.reset();
  loadIngresos();
});
async function loadIngresos() {
  const rows = await fetch(`${API}/ingresos.php?anio=${currentYear}`).then(r => r.json());
  document.getElementById('tblIngresos').innerHTML = `
    <tr><th>Mes</th><th>Descripcion</th><th>Tipo</th><th>Propiedad</th><th class="num">Monto</th></tr>
    ${rows.map(r => `<tr><td>${MESES[r.mes-1]}</td><td>${r.descripcion}</td><td>${r.tipo}</td><td>${r.propiedad_nombre || '-'}</td><td class="num">${fmt(r.monto)}</td></tr>`).join('')}
  `;
}

// ---- Gastos ----
document.getElementById('formGastos').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/movimientos.php`, { method: 'POST', body: JSON.stringify({
    categoria: 'gasto', persona_id: f.get('persona_id'), descripcion: f.get('descripcion'),
    monto: f.get('monto'), anio: currentYear, mes: f.get('mes')
  })});
  e.target.reset();
  loadGastos();
});
async function loadGastos() {
  const rows = await fetch(`${API}/movimientos.php?anio=${currentYear}&categoria=gasto`).then(r => r.json());
  document.getElementById('tblGastos').innerHTML = `
    <tr><th>Mes</th><th>Persona</th><th>Descripcion</th><th class="num">Monto</th></tr>
    ${rows.map(r => `<tr><td>${MESES[r.mes-1]}</td><td>${r.persona_nombre || '-'}</td><td>${r.descripcion}</td><td class="num">${fmt(r.monto)}</td></tr>`).join('')}
  `;
}

// ---- Tarjetas ----
document.getElementById('formTarjetas').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/movimientos.php`, { method: 'POST', body: JSON.stringify({
    categoria: 'tarjeta', persona_id: f.get('persona_id'), banco: f.get('banco'), descripcion: f.get('descripcion'),
    monto: f.get('monto'), anio: currentYear, mes: f.get('mes')
  })});
  e.target.reset();
  loadTarjetas();
});
async function loadTarjetas() {
  const rows = await fetch(`${API}/movimientos.php?anio=${currentYear}&categoria=tarjeta`).then(r => r.json());
  document.getElementById('tblTarjetas').innerHTML = `
    <tr><th>Mes</th><th>Persona</th><th>Banco</th><th>Descripcion</th><th class="num">Monto</th></tr>
    ${rows.map(r => `<tr><td>${MESES[r.mes-1]}</td><td>${r.persona_nombre || '-'}</td><td>${r.banco || '-'}</td><td>${r.descripcion}</td><td class="num">${fmt(r.monto)}</td></tr>`).join('')}
  `;
}

// ---- Prestamos ----
document.getElementById('formPrestamos').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/prestamos.php`, { method: 'POST', body: JSON.stringify({
    persona_id: f.get('persona_id'), descripcion: f.get('descripcion'), banco: f.get('banco'),
    cuota_monto: f.get('cuota_monto'), cuotas_totales: f.get('cuotas_totales'),
    cuotas_pagadas: f.get('cuotas_pagadas'), fecha_inicio: f.get('fecha_inicio')
  })});
  e.target.reset();
  loadPrestamos();
});
async function loadPrestamos() {
  const rows = await fetch(`${API}/prestamos.php`).then(r => r.json());
  document.getElementById('tblPrestamos').innerHTML = `
    <tr><th>Descripcion</th><th>Persona</th><th>Banco</th><th class="num">Cuota</th><th>Progreso</th></tr>
    ${rows.map(r => `<tr><td>${r.descripcion}</td><td>${r.persona_nombre || '-'}</td><td>${r.banco || '-'}</td><td class="num">${fmt(r.cuota_monto)}</td><td>${r.cuotas_pagadas} / ${r.cuotas_totales}</td></tr>`).join('')}
  `;
}

// ---- Rapipago ----
document.getElementById('formRapipago').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/movimientos.php`, { method: 'POST', body: JSON.stringify({
    categoria: 'rapipago', descripcion: f.get('descripcion'), monto: f.get('monto'), anio: currentYear, mes: f.get('mes')
  })});
  e.target.reset();
  loadRapipago();
});
async function loadRapipago() {
  const rows = await fetch(`${API}/movimientos.php?anio=${currentYear}&categoria=rapipago`).then(r => r.json());
  document.getElementById('tblRapipago').innerHTML = `
    <tr><th>Mes</th><th>Descripcion</th><th class="num">Monto</th></tr>
    ${rows.map(r => `<tr><td>${MESES[r.mes-1]}</td><td>${r.descripcion}</td><td class="num">${fmt(r.monto)}</td></tr>`).join('')}
  `;
}

// ---- Impuestos ----
document.getElementById('formImpuestos').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/movimientos.php`, { method: 'POST', body: JSON.stringify({
    categoria: 'impuesto', propiedad_id: f.get('propiedad_id') || null, descripcion: f.get('descripcion'),
    monto: f.get('monto'), anio: currentYear, mes: f.get('mes')
  })});
  e.target.reset();
  loadImpuestos();
});
async function loadImpuestos() {
  const rows = await fetch(`${API}/movimientos.php?anio=${currentYear}&categoria=impuesto`).then(r => r.json());
  document.getElementById('tblImpuestos').innerHTML = `
    <tr><th>Mes</th><th>Descripcion</th><th>Propiedad</th><th class="num">Monto</th></tr>
    ${rows.map(r => `<tr><td>${MESES[r.mes-1]}</td><td>${r.descripcion}</td><td>${r.propiedad_nombre || 'General'}</td><td class="num">${fmt(r.monto)}</td></tr>`).join('')}
  `;
}

// ---- Babypas: items en cuotas ----
document.getElementById('formBabypas').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/babypas.php`, { method: 'POST', body: JSON.stringify({
    descripcion: f.get('descripcion'), monto_total: f.get('monto_total'),
    cuotas_totales: f.get('cuotas_totales'), fecha_inicio: f.get('fecha_inicio')
  })});
  e.target.reset();
  loadBabypas();
});
async function loadBabypas() {
  const items = await fetch(`${API}/babypas.php`).then(r => r.json());
  document.getElementById('babypasList').innerHTML = items.map(item => `
    <div class="panel babypas-item">
      <div class="header"><strong>${item.descripcion}</strong><span>${fmt(item.monto_total)}</span></div>
      <div>${item.cuotas.map(c => `
        <span class="cuota-chip ${c.pagada == 1 ? 'pagada' : ''}" data-cuota="${c.id}" data-pagada="${c.pagada}">
          #${c.numero} - ${fmt(c.monto)}
        </span>`).join('')}</div>
    </div>
  `).join('');

  document.querySelectorAll('.cuota-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const nuevoEstado = chip.dataset.pagada == '1' ? 0 : 1;
      await fetch(`${API}/babypas.php`, { method: 'PUT', body: JSON.stringify({
        cuota_id: chip.dataset.cuota, pagada: nuevoEstado
      })});
      loadBabypas();
    });
  });
}

// ---- Babypas: debe / haber diario ----
document.getElementById('formBabypasMov').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/babypas_mov.php`, { method: 'POST', body: JSON.stringify({
    fecha: f.get('fecha'), descripcion: f.get('descripcion'), debe: f.get('debe') || 0, haber: f.get('haber') || 0
  })});
  e.target.reset();
  loadBabypasMov();
});
async function loadBabypasMov() {
  const rows = await fetch(`${API}/babypas_mov.php`).then(r => r.json());
  const saldo = rows.reduce((acc, r) => acc + Number(r.debe) - Number(r.haber), 0);
  document.getElementById('babypasSaldo').innerHTML = `
    <span class="saldo-label">Saldo actual</span>
    <span class="saldo-value ${saldo >= 0 ? 'positivo' : 'negativo'}">${fmt(Math.abs(saldo))} ${saldo >= 0 ? '(te deben)' : '(debes)'}</span>
  `;
  document.getElementById('tblBabypasMov').innerHTML = `
    <tr><th>Fecha</th><th>Descripcion</th><th class="num">Debe</th><th class="num">Haber</th></tr>
    ${rows.map(r => `<tr><td>${r.fecha}</td><td>${r.descripcion}</td><td class="num">${Number(r.debe) ? fmt(r.debe) : '-'}</td><td class="num">${Number(r.haber) ? fmt(r.haber) : '-'}</td></tr>`).join('')}
  `;
}

// ---- Ahorros ----
document.getElementById('formAhorros').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch(`${API}/ahorros.php`, { method: 'POST', body: JSON.stringify({
    descripcion: f.get('descripcion'), moneda: f.get('moneda'), monto: f.get('monto'), fecha: f.get('fecha')
  })});
  e.target.reset();
  loadAhorros();
});
async function loadAhorros() {
  const rows = await fetch(`${API}/ahorros.php`).then(r => r.json());
  document.getElementById('tblAhorros').innerHTML = `
    <tr><th>Fecha</th><th>Descripcion</th><th>Moneda</th><th class="num">Monto</th></tr>
    ${rows.map(r => `<tr><td>${r.fecha}</td><td>${r.descripcion}</td><td>${r.moneda}</td><td class="num">${fmt(r.monto)}</td></tr>`).join('')}
  `;
}

// ---- Inicio ----
cargarPersonasEnSelects();
cargarPropiedadesEnSelects();
loadResumen();
