// app.js - Archivo principal de la aplicación

let currentView = 'home';

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado:', registration);
      })
      .catch(error => {
        console.log('Error al registrar Service Worker:', error);
      });
  }
  
  document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);
  document.getElementById('backBtn').addEventListener('click', goBack);
  
  window.addEventListener('hashchange', handleRoute);
  
  handleRoute();
});

function handleRoute() {
  const hash = window.location.hash.slice(1);
  const backBtn = document.getElementById('backBtn');
  
  if (!hash || hash === 'home') {
    currentView = 'home';
    backBtn.style.display = 'none';
    render();
  } else if (hash.startsWith('section/')) {
    const sectionId = hash.split('/')[1];
    currentView = 'section';
    backBtn.style.display = 'block';
    renderSection(sectionId);
  } else if (hash === 'guests') {
    currentView = 'guests';
    backBtn.style.display = 'block';
    renderGuests();
  } else if (hash === 'budget') {
    currentView = 'budget';
    backBtn.style.display = 'block';
    renderBudget();
  } else {
    window.location.hash = '';
  }
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = renderDashboard();
}

function renderSection(sectionId) {
  const app = document.getElementById('app');
  app.innerHTML = renderSectionDetail(sectionId);
}

function renderGuests() {
  const app = document.getElementById('app');
  app.innerHTML = renderGuestsView();
}

function renderBudget() {
  const app = document.getElementById('app');
  app.innerHTML = renderBudgetView();
}

function goBack() {
  window.history.back();
}

function navigateToGuests() {
  window.location.hash = '#guests';
}

function navigateToBudget() {
  window.location.hash = '#budget';
} 
