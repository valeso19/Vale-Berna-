// guests.js - Gestión de invitados

function renderGuestsView() {
  const guests = getGuests();
  const stats = calculateGuestStats();
  
  return `
    <div class="guests-section fade-in">
      <div class="guests-header">
        <h2>Gestión de Invitados</h2>
        <div class="guests-stats">
          <span><strong>${stats.total}</strong> Total</span>
          <span><strong>${stats.confirmed}</strong> Confirmados</span>
          <span><strong>${stats.paid}</strong> Pagados</span>
        </div>
      </div>
      
      <div class="filter-buttons">
        <button class="btn-filter active" onclick="filterGuests('all')">Todos</button>
        <button class="btn-filter" onclick="filterGuests('confirmed')">Confirmados</button>
        <button class="btn-filter" onclick="filterGuests('not-confirmed')">No Confirmados</button>
        <button class="btn-filter" onclick="filterGuests('paid')">Pagados</button>
        <button class="btn-filter" onclick="filterGuests('pending')">Deudores</button>
      </div>
      
      <div class="guests-form">
        <h3 class="mb-md">Agregar Invitado</h3>
        <div class="form-row">
          <input type="text" id="guestName" class="input" placeholder="Nombre completo" required>
          <input type="number" id="guestCompanions" class="input" placeholder="Acompañantes" min="0" value="0">
          <input type="number" id="guestAmount" class="input" placeholder="Monto a pagar" min="0" value="0">
        </div>
        <div class="form-row">
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="guestConfirmed"> Confirmado
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="guestPaid"> Pagado
          </label>
        </div>
        <button class="btn btn-primary" onclick="addNewGuest()">Agregar Invitado</button>
      </div>
      
      <div class="guests-table">
        ${renderGuestsTable(guests)}
      </div>
    </div>
  `;
}

function renderGuestsTable(guests) {
  if (guests.length === 0) {
    return '<p style="text-align: center; color: var(--blue-gray); padding: 2rem;">No hay invitados registrados todavía.</p>';
  }
  
  return `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Acompañantes</th>
          <th>Monto</th>
          <th>Pagado</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="guestsTableBody">
        ${guests.map(guest => renderGuestRow(guest)).join('')}
      </tbody>
    </table>
  `;
}

function renderGuestRow(guest) {
  const status = getGuestStatus(guest);
  
  return `
    <tr data-guest-id="${guest.id}">
      <td><strong>${guest.name}</strong></td>
      <td>${guest.companions}</td>
      <td>${formatCurrency(guest.amount)}</td>
      <td>${formatCurrency(guest.paidAmount)}</td>
      <td>
        <span class="status-badge ${status.class}">${status.text}</span>
      </td>
      <td>
        <button class="btn-small btn-outline" onclick="editGuest('${guest.id}')">
          Editar
        </button>
        <button class="btn-small btn-danger" onclick="removeGuest('${guest.id}')">
          Eliminar
        </button>
      </td>
    </tr>
  `;
}

function getGuestStatus(guest) {
  if (!guest.confirmed) {
    return { class: 'not-confirmed', text: 'No Confirmado' };
  }
  if (guest.paidAmount >= guest.amount) {
    return { class: 'paid', text: 'Pagado' };
  }
  return { class: 'pending', text: 'Debe' };
}

function calculateGuestStats() {
  const guests = getGuests();
  
  return {
    total: guests.length,
    confirmed: guests.filter(g => g.confirmed).length,
    paid: guests.filter(g => g.paidAmount >= g.amount).length,
    totalAmount: guests.reduce((sum, g) => sum + g.amount, 0),
    totalPaid: guests.reduce((sum, g) => sum + g.paidAmount, 0)
  };
}

function addNewGuest() {
  const name = document.getElementById('guestName').value.trim();
  const companions = parseInt(document.getElementById('guestCompanions').value) || 0;
  const amount = parseFloat(document.getElementById('guestAmount').value) || 0;
  const confirmed = document.getElementById('guestConfirmed').checked;
  const paid = document.getElementById('guestPaid').checked;
  
  if (!name) {
    alert('Por favor ingresa el nombre del invitado');
    return;
  }
  
  addGuest({
    name,
    companions,
    amount,
    confirmed,
    paid,
    paidAmount: paid ? amount : 0
  });
  
  document.getElementById('guestName').value = '';
  document.getElementById('guestCompanions').value = '0';
  document.getElementById('guestAmount').value = '0';
  document.getElementById('guestConfirmed').checked = false;
  document.getElementById('guestPaid').checked = false;
  
  render();
  showToast('Invitado agregado');
}

function editGuest(guestId) {
  const guests = getGuests();
  const guest = guests.find(g => g.id === guestId);
  
  if (!guest) return;
  
  const name = prompt('Nombre:', guest.name);
  if (!name) return;
  
  const companions = parseInt(prompt('Acompañantes:', guest.companions)) || 0;
  const amount = parseFloat(prompt('Monto a pagar:', guest.amount)) || 0;
  const paidAmount = parseFloat(prompt('Monto pagado:', guest.paidAmount)) || 0;
  
  const confirmed = window.confirm('¿Confirmado?');
  
  updateGuest(guestId, {
    name: name.trim(),
    companions,
    amount,
    paidAmount,
    confirmed,
    paid: paidAmount >= amount
  });
  
  render();
  showToast('Invitado actualizado');
}

function removeGuest(guestId) {
  if (window.confirm('¿Eliminar este invitado?')) {
    deleteGuest(guestId);
    render();
    showToast('Invitado eliminado');
  }
}

function filterGuests(filter) {
  const guests = getGuests();
  let filtered = guests;
  
  switch(filter) {
    case 'confirmed':
      filtered = guests.filter(g => g.confirmed);
      break;
    case 'not-confirmed':
      filtered = guests.filter(g => !g.confirmed);
      break;
    case 'paid':
      filtered = guests.filter(g => g.paidAmount >= g.amount);
      break;
    case 'pending':
      filtered = guests.filter(g => g.paidAmount < g.amount);
      break;
  }
  
  document.querySelector('#guestsTableBody').parentElement.parentElement.innerHTML = renderGuestsTable(filtered);
  
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}
