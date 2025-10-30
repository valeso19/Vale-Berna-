// utils.js - Funciones auxiliares y utilidades

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount);
}

function calculatePercentage(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  
  const icon = document.querySelector('#darkModeBtn svg');
  if (isDark) {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  } else {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}

function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1001;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function performSearch(query) {
  const results = [];
  const data = getAllData();
  
  query = query.toLowerCase();
  
  data.sections.forEach(section => {
    if (section.name.toLowerCase().includes(query)) {
      results.push({
        type: 'section',
        title: section.name,
        category: 'Sección',
        id: section.id
      });
    }
    
    section.tasks.forEach(task => {
      if (task.text.toLowerCase().includes(query)) {
        results.push({
          type: 'task',
          title: task.text,
          category: `Tarea en ${section.name}`,
          sectionId: section.id
        });
      }
    });
  });
  
  data.guests.forEach(guest => {
    if (guest.name.toLowerCase().includes(query)) {
      results.push({
        type: 'guest',
        title: guest.name,
        category: 'Invitado',
        id: guest.id
      });
    }
  });
  
  data.budget.forEach(item => {
    if (item.provider.toLowerCase().includes(query)) {
      results.push({
        type: 'budget',
        title: item.provider,
        category: 'Proveedor',
        id: item.id
      });
    }
  });
  
  return results;
}

function displaySearchResults(results) {
  const container = document.getElementById('searchResults');
  
  if (results.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--blue-gray); padding: 2rem;">No se encontraron resultados</p>';
    return;
  }
  
  container.innerHTML = results.map(result => `
    <div class="search-result-item" onclick="navigateToResult('${result.type}', '${result.id || result.sectionId}')">
      <div class="search-result-title">${result.title}</div>
      <div class="search-result-category">${result.category}</div>
    </div>
  `).join('');
}

function navigateToResult(type, id) {
  closeSearch();
  
  switch(type) {
    case 'section':
    case 'task':
      window.location.hash = `#section/${id}`;
      break;
    case 'guest':
      window.location.hash = '#guests';
      break;
    case 'budget':
      window.location.hash = '#budget';
      break;
  }
}

function openSearch() {
  document.getElementById('searchModal').style.display = 'flex';
  document.getElementById('searchInput').focus();
}

function closeSearch() {
  document.getElementById('searchModal').style.display = 'none';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearch);
  }
  
  if (searchInput) {
    const debouncedSearch = debounce((e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        const results = performSearch(query);
        displaySearchResults(results);
      } else {
        document.getElementById('searchResults').innerHTML = '';
      }
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
  });
});

function exportData() {
  const data = getAllData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `berna-vale-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('Datos exportados correctamente');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (!data.sections || !data.guests || !data.budget) {
          throw new Error('Formato de archivo inválido');
        }
        
        localStorage.setItem('weddingData', JSON.stringify(data));
        showToast('Datos importados correctamente');
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        showToast('Error al importar datos: ' + error.message, 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
