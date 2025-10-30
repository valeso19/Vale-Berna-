// Berna & Vale - Web App (client-side only, localStorage persistence)
// Simple data model and UI rendering without frameworks to keep it easy to deploy to GitHub Pages.

// --- Storage layer (using localStorage for simplicity) ---
const STORAGE_KEY = 'berna-vale-wedding-v1';

function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return defaultData();
  try { return JSON.parse(raw); } catch(e){ console.error('parse err', e); return defaultData(); }
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function defaultData(){
  return {
    meta:{title:'Berna & Vale – Nuestra Boda', created:Date.now()},
    sections:[
      {id:id(), name:'Salón / Recepción', items:[]},
      {id:id(), name:'Invitados', items:[]},
      {id:id(), name:'Vestimenta', items:[]},
      {id:id(), name:'Proveedores', items:[]}
    ],
    guests:[],
  };
}

// --- Utilities ---
function id(){ return 'id-'+Math.random().toString(36).slice(2,9); }
function currency(n){ return '$' + Number(n||0).toLocaleString('es-AR'); }

// --- App state ---
let state = loadData();
let currentSectionId = null;

// --- DOM refs ---
const sectionsButtons = document.getElementById('sectionsButtons');
const viewArea = document.getElementById('viewArea');
const totalEstimatedEl = document.getElementById('totalEstimated');
const totalPaidEl = document.getElementById('totalPaid');
const totalDueEl = document.getElementById('totalDue');
const progressBar = document.getElementById('progressBar');
const progressPct = document.getElementById('progressPct');

document.getElementById('btnAddSection').addEventListener('click', ()=> {
  const name = prompt('Nombre de la nueva sección:');
  if(!name) return;
  state.sections.push({id:id(), name, items:[]});
  saveAndRender();
});
document.getElementById('btnExport').addEventListener('click', exportJSON);
document.getElementById('btnImport').addEventListener('click', ()=>document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', importFile);

// --- Render functions ---
function render(){
  renderButtons();
  renderDashboardStats();
  renderView();
}

function renderButtons(){
  sectionsButtons.innerHTML = '';
  state.sections.forEach(sec=>{
    const btn = document.createElement('button');
    btn.className = 'section-btn';
    btn.textContent = sec.name;
    btn.addEventListener('click', ()=> { currentSectionId = sec.id; renderView(); });
    sectionsButtons.appendChild(btn);
  });
}

function renderDashboardStats(){
  const totals = computeTotals();
  totalEstimatedEl.textContent = currency(totals.estimated);
  totalPaidEl.textContent = currency(totals.paid);
  totalDueEl.textContent = currency(totals.due);
  const pct = Math.round(totals.progress);
  progressBar.style.width = pct + '%';
  progressPct.textContent = pct + '%';
}

function renderView(){
  viewArea.innerHTML = '';
  if(!currentSectionId){
    const hint = document.createElement('p');
    hint.className='hint';
    hint.textContent = 'Seleccioná o creá una sección para verla aquí.';
    viewArea.appendChild(hint);
    return;
  }
  const sec = state.sections.find(s=>s.id===currentSectionId);
  if(!sec) return;
  const header = document.createElement('div'); header.className='view-header';
  const h = document.createElement('h2'); h.textContent = sec.name;
  const controls = document.createElement('div');
  const addItemBtn = document.createElement('button'); addItemBtn.className='btn primary'; addItemBtn.textContent='+ Ítem';
  addItemBtn.addEventListener('click', ()=> openAddItemForm(sec.id));
  const delSec = document.createElement('button'); delSec.className='btn ghost'; delSec.textContent='Eliminar sección';
  delSec.addEventListener('click', ()=> { if(confirm('Eliminar sección y sus ítems?')){ state.sections=state.sections.filter(x=>x.id!==sec.id); currentSectionId=null; saveAndRender(); }});
  controls.appendChild(addItemBtn); controls.appendChild(delSec);
  header.appendChild(h); header.appendChild(controls);
  viewArea.appendChild(header);

  // If section is "Invitados" show guests UI
  if(sec.name.toLowerCase().includes('invit')){
    renderGuestsUI();
    return;
  }

  // Items list
  const list = document.createElement('div'); list.className='item-list';
  sec.items.forEach(it=>{
    const el = document.createElement('div'); el.className='item';
    const left = document.createElement('div'); left.className='left';
    const title = document.createElement('strong'); title.textContent = it.name;
    const subtitle = document.createElement('div'); subtitle.textContent = `Costo: ${currency(it.cost)} • Seña: ${currency(it.deposit)} • Pagado: ${currency(sumPayments(it.payments))} • Saldo: ${currency(itemDue(it))}`;
    left.appendChild(title); left.appendChild(subtitle);
    const right = document.createElement('div'); right.className='right';
    const done = document.createElement('button'); done.className='btn'; done.textContent = it.completed? '✅': 'Marcar';
    done.addEventListener('click', ()=>{ it.completed=!it.completed; saveAndRender(); });
    const pay = document.createElement('button'); pay.className='btn'; pay.textContent='Registrar pago';
    pay.addEventListener('click', ()=> registerPaymentForItem(sec.id, it.id));
    const edit = document.createElement('button'); edit.className='btn ghost'; edit.textContent='Editar';
    edit.addEventListener('click', ()=> openEditItemForm(sec.id, it.id));
    right.appendChild(done); right.appendChild(pay); right.appendChild(edit);
    el.appendChild(left); el.appendChild(right);
    list.appendChild(el);
  });
  viewArea.appendChild(list);
}

// --- Guests UI ---
function renderGuestsUI(){
  viewArea.innerHTML = '';
  const header = document.createElement('div'); header.className='view-header';
  const h = document.createElement('h2'); h.textContent = 'Invitados';
  const addGuest = document.createElement('button'); addGuest.className='btn primary'; addGuest.textContent='+ Invitado';
  addGuest.addEventListener('click', ()=> openAddGuestForm());
  header.appendChild(h); header.appendChild(addGuest);
  viewArea.appendChild(header);

  const summary = document.createElement('div'); summary.className='card';
  const total = state.guests.length;
  const confirmed = state.guests.filter(g=>g.confirmed).length;
  const recaudado = state.guests.reduce((s,g)=>s + (g.amount_paid||0),0);
  const pendiente = state.guests.reduce((s,g)=>s + ((g.amount_assigned||0)-(g.amount_paid||0)),0);
  summary.innerHTML = `<div><strong>Total:</strong> ${total} • <strong>Confirmados:</strong> ${confirmed}</div>
  <div><strong>Recaudado:</strong> ${currency(recaudado)} • <strong>Pendiente:</strong> ${currency(pendiente)}</div>`;
  viewArea.appendChild(summary);

  const list = document.createElement('div'); list.className='item-list';
  state.guests.forEach(g=>{
    const el = document.createElement('div'); el.className='item';
    const left = document.createElement('div'); left.className='left';
    const title = document.createElement('strong'); title.textContent = g.name;
    const sub = document.createElement('div'); sub.textContent = `Confirmado: ${g.confirmed? 'Sí':'No'} • Asignado: ${currency(g.amount_assigned)} • Pagado: ${currency(g.amount_paid)} • Saldo: ${currency((g.amount_assigned||0)-(g.amount_paid||0))}`;
    left.appendChild(title); left.appendChild(sub);
    const right = document.createElement('div'); right.className='right';
    const toggle = document.createElement('button'); toggle.className='btn'; toggle.textContent = g.confirmed? 'Cancelar' : 'Confirmar';
    toggle.addEventListener('click', ()=>{ g.confirmed=!g.confirmed; saveAndRender(); });
    const pay = document.createElement('button'); pay.className='btn'; pay.textContent='Registrar pago';
    pay.addEventListener('click', ()=> registerPaymentForGuest(g.id));
    const del = document.createElement('button'); del.className='btn ghost'; del.textContent='Eliminar';
    del.addEventListener('click', ()=>{ if(confirm('Eliminar invitado?')){ state.guests = state.guests.filter(x=>x.id!==g.id); saveAndRender(); }});
    right.appendChild(toggle); right.appendChild(pay); right.appendChild(del);
    el.appendChild(left); el.appendChild(right);
    list.appendChild(el);
  });
  viewArea.appendChild(list);
}

// --- Forms and modals (simple prompt-based UI for speed) ---
function openAddItemForm(sectionId){
  const name = prompt('Nombre del ítem:');
  if(!name) return;
  const cost = Number(prompt('Costo total (número):','0')) || 0;
  const deposit = Number(prompt('Seña pagada (número):','0')) || 0;
  const it = {id:id(), name, cost, deposit, payments:[], completed:false};
  const sec = state.sections.find(s=>s.id===sectionId);
  sec.items.push(it);
  saveAndRender();
}

function openEditItemForm(sectionId, itemId){
  const sec = state.sections.find(s=>s.id===sectionId);
  const it = sec.items.find(x=>x.id===itemId);
  const name = prompt('Nombre:', it.name);
  if(!name) return;
  const cost = Number(prompt('Costo total:', it.cost)) || it.cost;
  const deposit = Number(prompt('Seña:', it.deposit)) || it.deposit;
  it.name = name; it.cost = cost; it.deposit = deposit;
  saveAndRender();
}

function registerPaymentForItem(sectionId, itemId){
  const sec = state.sections.find(s=>s.id===sectionId);
  const it = sec.items.find(x=>x.id===itemId);
  const m = Number(prompt('Monto a registrar:','0')) || 0;
  if(m<=0) return;
  it.payments = it.payments || [];
  it.payments.push({id:id(), amount:m, date:Date.now()});
  saveAndRender();
}

function openAddGuestForm(){
  const name = prompt('Nombre del invitado:');
  if(!name) return;
  const assigned = Number(prompt('Monto asignado al invitado:','0'))||0;
  const g = {id:id(), name, confirmed:false, amount_assigned:assigned, amount_paid:0, payments:[]};
  state.guests.push(g);
  saveAndRender();
}

function registerPaymentForGuest(guestId){
  const g = state.guests.find(x=>x.id===guestId);
  const m = Number(prompt('Monto a registrar:','0')) || 0;
  if(m<=0) return;
  g.payments = g.payments || [];
  g.payments.push({id:id(), amount:m, date:Date.now()});
  g.amount_paid = (g.amount_paid||0) + m;
  saveAndRender();
}

// --- Computations ---
function sumPayments(payments){ return (payments||[]).reduce((s,p)=>s+(p.amount||0),0); }
function itemDue(it){ return (it.cost||0) - (it.deposit||0) - sumPayments(it.payments); }

function computeTotals(){
  const estimated = state.sections.reduce((s,sec)=> s + sec.items.reduce((ss,it)=> ss + (it.cost||0),0),0);
  const paidFromItems = state.sections.reduce((s,sec)=> s + sec.items.reduce((ss,it)=> ss + (it.deposit||0) + sumPayments(it.payments),0),0);
  const guestsPaid = state.guests.reduce((s,g)=> s + (g.amount_paid||0),0);
  const paid = paidFromItems + guestsPaid;
  const due = estimated - paid;
  // progress
  const allItems = state.sections.flatMap(s=>s.items);
  const completedCount = allItems.filter(i=>i.completed).length;
  const progress = allItems.length ? (completedCount / allItems.length) * 100 : 0;
  return {estimated, paid, due, progress};
}

// --- Export / Import ---
function exportJSON(){
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'berna-vale-backup.json'; a.click();
  URL.revokeObjectURL(url);
}

function importFile(e){
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = function(){ try{ const parsed = JSON.parse(reader.result); state = parsed; saveData(state); alert('Importado correctamente'); render(); }catch(err){ alert('Archivo inválido'); } };
  reader.readAsText(f);
  e.target.value=''; // reset
}

// --- Save and render ---
function saveAndRender(){ saveData(state); render(); }

// initial render
render();\n