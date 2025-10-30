// budget.js - Gestión de presupuesto

function calculateBudgetSummary() {
  const budgetItems = getBudgetItems();
  const guestStats = calculateGuestStats();
  
  const budgetTotal = budgetItems.reduce((sum, item) => sum + item.total, 0);
  const budgetPaid = budgetItems.reduce((sum, item) => sum + item.deposit, 0);
  
  return {
    total: budgetTotal + guestStats.totalAmount,
    paid: budgetPaid + guestStats.totalPaid,
    remaining: (budgetTotal - budgetPaid) + (guestStats.totalAmount - guestStats.totalPaid)
  };
}

function renderBudgetView() {
  const items = getBudgetItems();
  const summary = calculateBudgetSummary();
  
  return `
    <div class="budget-section fade-in">
      <h2 class="mb-lg">Gestión de Pagos y Presupuesto</h2>
      
      <div class="budget-summary mb-xl">
        <div class="budget-cards">
          <div class="budget-card">
            <h3>Total Presupuestado</h3>
            <div class="amount">${formatCurrency(summary.total)}</div>
          </div>
          <div class="budget-card">
            <h3>Total Pagado</h3>
            <div class="amount">${formatCurrency(summary.paid)}</div>
          </div>
          <div class="budget-card">
            <h3>Saldo Pendiente</h3>
            <div class="amount">${formatCurrency(summary.remaining)}</div>
          </div>
        </div>
      </div>
      
      <div class="guests-form mb-lg">
        <h3 class="mb-md">Agregar Proveedor</h3>
        <div class="form-row">
          <input type="text" id="providerName" class="input" placeholder="Nombre del proveedor" required>
          <input type="number" id="providerTotal" class="input" placeholder="Costo total" min="0" required>
          <input type="number" id="providerDeposit" class="input" placeholder="Seña realizada" min="0" value="0">
        </div>
        <button class="btn btn-primary" onclick="addNewProvider()">Agregar Proveedor</button>
      </div>
      
      <div class="providers-list">
        ${items.length === 0 
          ? '<p style="text-align: center; color: var(--blue-gray); padding: 2rem;">No hay proveedores registrados todavía.</p>'
          : items.map(item => renderProviderCard(item)).join('')
        }
      </div>
    </div>
  `;
}

function renderProviderCard(item) {
  const statusColor = item.status === 'paid' ? 'var(--success)' : 
                     item.status === 'partial' ? 'var(--warning)' : 
                     'var(--danger)';
  
  const statusText = item.status === 'paid' ? 'Pagado' :
                    item.status === 'partial' ? 'Pago Parcial' :
                    'Pendiente';
  
  return `
    <div class="provider-card">
      <div class="provider-header">
        <h4 class="provider-name">${item.provider}</h4>
        <span class="status-badge" style="background-color: ${statusColor}; color: white;">
          ${statusText}
        </span>
      </div>
      <div class="provider-details">
        <div class="provider-detail">
          <label>Costo Total</label>
          <div class="value">${formatCurrency(item.total)}</div>
        </div>
        <div class="provider-detail">
          <label>Seña Realizada</label>
          <div class="value">${formatCurrency(item.deposit)}</div>
        </div>
        <div class="provider-detail">
          <label>Saldo Pendiente</label>
          <div class="value">${formatCurrency(item.balance)}</div>
        </div>
      </div>
      <div class="flex gap-sm mt-md">
        <button class="btn-small btn-outline" onclick="editProvider('${item.id}')">
          Editar
        </button>
        <button class="btn-small btn-danger" onclick="removeProvider('${item.id}')">
          Eliminar
        </button>
      </div>
    </div>
  `;
}

function addNewProvider() {
  const provider = document.getElementById('providerName').value.trim();
  const total = parseFloat(document.getElementById('providerTotal').value) || 0;
  const deposit = parseFloat(document.getElementById('providerDeposit').value) || 0;
  
  if (!provider) {
    alert('Por favor ingresa el nombre del proveedor');
    return;
  }
  
  if (total <= 0) {
    alert('Por favor ingresa un costo total válido');
    return;
  }
  
  addBudgetItem({ provider, total, deposit });
  
  document.getElementById('providerName').value = '';
  document.getElementById('providerTotal').value = '';
  document.getElementById('providerDeposit').value = '0';
  
  render();
  showToast('Proveedor agregado');
}

function editProvider(itemId) {
  const items = getBudgetItems();
  const item = items.find(i => i.id === itemId);
  
  if (!item) return;
  
  const provider = prompt('Proveedor:', item.provider);
  if (!provider) return;
  
  const total = parseFloat(prompt('Costo total:', item.total)) || 0;
  const deposit = parseFloat(prompt('Seña realizada:', item.deposit)) || 0;
  
  updateBudgetItem(itemId, {
    provider: provider.trim(),
    total,
    deposit
  });
  
  render();
  showToast('Proveedor actualizado');
}

function removeProvider(itemId) {
  if (window.confirm('¿Eliminar este proveedor?')) {
    deleteBudgetItem(itemId);
    render();
    showToast('Proveedor eliminado');
  }
}
