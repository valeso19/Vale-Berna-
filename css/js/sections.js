// sections.js - Gestión de secciones y progreso

function calculateGlobalProgress() {
  const sections = getSections();
  let totalTasks = 0;
  let completedTasks = 0;
  
  sections.forEach(section => {
    totalTasks += section.tasks.length;
    completedTasks += section.tasks.filter(t => t.completed).length;
  });
  
  return {
    total: totalTasks,
    completed: completedTasks,
    percentage: calculatePercentage(completedTasks, totalTasks)
  };
}

function calculateSectionProgress(sectionId) {
  const section = getSectionById(sectionId);
  if (!section) return { total: 0, completed: 0, percentage: 0 };
  
  const total = section.tasks.length;
  const completed = section.tasks.filter(t => t.completed).length;
  
  return {
    total,
    completed,
    percentage: calculatePercentage(completed, total)
  };
}

function renderProgressChart(percentage) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return `
    <svg width="200" height="200" class="progress-chart">
      <circle 
        class="progress-bg"
        cx="100" 
        cy="100" 
        r="${radius}"
      />
      <circle 
        class="progress-fill"
        cx="100" 
        cy="100" 
        r="${radius}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
      />
    </svg>
    <div class="progress-text">${percentage}%</div>
  `;
}

function renderSectionCard(section) {
  const progress = calculateSectionProgress(section.id);
  const icon = getSectionIcon(section.id);
  
  return `
    <div class="section-card" onclick="navigateToSection('${section.id}')">
      <div class="section-card-header">
        <div class="section-icon">${icon}</div>
        <h3>${section.name}</h3>
      </div>
      <div class="section-progress">
        ${progress.completed} de ${progress.total} completadas
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
      </div>
    </div>
  `;
}

function getSectionIcon(sectionId) {
  const icons = {
    'civil': '📄',
    'iglesia': '⛪',
    'salon': '🏛️',
    'vestido': '👗',
    'traje': '🤵',
    'invitados': '👥',
    'fotografia': '📸',
    'catering': '🍽️',
    'musica': '🎵',
    'decoracion': '🎨',
    'flores': '💐',
    'transporte': '🚗',
    'luna-miel': '✈️',
    'cotillon': '🎉'
  };
  
  return icons[sectionId] || '📋';
}

function renderDashboard() {
  const sections = getSections();
  const progress = calculateGlobalProgress();
  const budgetSummary = calculateBudgetSummary();
  
  return `
    <div class="dashboard fade-in">
      <div class="progress-section">
        <h2>Progreso General</h2>
        <div class="progress-chart">
          ${renderProgressChart(progress.percentage)}
        </div>
        <p class="progress-label">
          ${progress.completed} de ${progress.total} tareas completadas
        </p>
      </div>
      
      <div class="budget-summary">
        <h2>Resumen Financiero</h2>
        <div class="budget-cards">
          <div class="budget-card">
            <h3>Total Presupuestado</h3>
            <div class="amount">${formatCurrency(budgetSummary.total)}</div>
          </div>
          <div class="budget-card">
            <h3>Total Pagado</h3>
            <div class="amount">${formatCurrency(budgetSummary.paid)}</div>
          </div>
          <div class="budget-card">
            <h3>Total Faltante</h3>
            <div class="amount">${formatCurrency(budgetSummary.remaining)}</div>
          </div>
        </div>
      </div>
      
      <div class="sections-grid">
        ${sections.map(section => renderSectionCard(section)).join('')}
        
        <div class="section-card add-section" onclick="showAddSectionModal()">
          <div class="section-icon">➕</div>
          <h3>Agregar Sección Personalizada</h3>
        </div>
      </div>
      
      <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="exportData()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar Datos
        </button>
        <button class="btn btn-secondary" onclick="importData()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Importar Datos
        </button>
      </div>
    </div>
  `;
}

function renderSectionDetail(sectionId) {
  const section = getSectionById(sectionId);
  if (!section) {
    return '<p>Sección no encontrada</p>';
  }
  
  const progress = calculateSectionProgress(sectionId);
  
  return `
    <div class="section-detail fade-in">
      <h2>
        <span>${getSectionIcon(sectionId)}</span>
        ${section.name}
      </h2>
      
      <div class="section-progress mb-lg">
        <strong>${progress.completed} de ${progress.total} completadas</strong> (${progress.percentage}%)
      </div>
      
      <div class="task-input-group">
        <input 
          type="text" 
          id="newTaskInput" 
          class="input" 
          placeholder="Nueva tarea..."
          onkeypress="if(event.key === 'Enter') addNewTask('${sectionId}')"
        >
        <button class="btn btn-primary" onclick="addNewTask('${sectionId}')">
          Agregar
        </button>
      </div>
      
      <ul class="task-list">
        ${section.tasks.map(task => `
          <li class="task-item ${task.completed ? 'completed' : ''}">
            <input 
              type="checkbox" 
              class="task-checkbox"
              ${task.completed ? 'checked' : ''}
              onchange="toggleTask('${sectionId}', '${task.id}')"
            >
            <span class="task-text">${task.text}</span>
            <button class="btn-delete" onclick="removeTask('${sectionId}', '${task.id}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </li>
        `).join('')}
      </ul>
      
      ${section.tasks.length === 0 ? '<p style="text-align: center; color: var(--blue-gray); padding: 2rem;">No hay tareas todavía. ¡Agrega la primera!</p>' : ''}
      
      ${section.isCustom ? `
        <button class="btn btn-danger mt-lg" onclick="removeCustomSection('${sectionId}')">
          Eliminar Sección
        </button>
      ` : ''}
    </div>
  `;
}

function addNewTask(sectionId) {
  const input = document.getElementById('newTaskInput');
  const text = input.value.trim();
  
  if (text) {
    addTaskToSection(sectionId, text);
    input.value = '';
    navigateToSection(sectionId);
    showToast('Tarea agregada');
  }
}

function toggleTask(sectionId, taskId) {
  toggleTaskComplete(sectionId, taskId);
  navigateToSection(sectionId);
}

function removeTask(sectionId, taskId) {
  if (window.confirm('¿Eliminar esta tarea?')) {
    deleteTask(sectionId, taskId);
    navigateToSection(sectionId);
    showToast('Tarea eliminada');
  }
}

function showAddSectionModal() {
  const name = prompt('Nombre de la nueva sección:');
  if (name && name.trim()) {
    addCustomSection(name.trim());
    render();
    showToast('Sección agregada');
  }
}

function removeCustomSection(sectionId) {
  if (window.confirm('¿Estás seguro de eliminar esta sección y todas sus tareas?')) {
    deleteCustomSection(sectionId);
    window.location.hash = '';
    showToast('Sección eliminada');
  }
}

function navigateToSection(sectionId) {
  window.location.hash = `#section/${sectionId}`;
}
