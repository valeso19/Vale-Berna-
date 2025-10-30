// storage.js - Gestión de almacenamiento local

const initialData = {
  sections: [
    { id: 'civil', name: 'Civil', tasks: [], isCustom: false },
    { id: 'iglesia', name: 'Iglesia / Ceremonia', tasks: [], isCustom: false },
    { id: 'salon', name: 'Salón / Recepción', tasks: [], isCustom: false },
    { id: 'vestido', name: 'Vestido de la novia', tasks: [], isCustom: false },
    { id: 'traje', name: 'Traje del novio', tasks: [], isCustom: false },
    { id: 'invitados', name: 'Invitados', tasks: [], isCustom: false },
    { id: 'fotografia', name: 'Fotografía / Video', tasks: [], isCustom: false },
    { id: 'catering', name: 'Catering / Menú', tasks: [], isCustom: false },
    { id: 'musica', name: 'Música / DJ / Animación', tasks: [], isCustom: false },
    { id: 'decoracion', name: 'Decoración', tasks: [], isCustom: false },
    { id: 'flores', name: 'Flores', tasks: [], isCustom: false },
    { id: 'transporte', name: 'Transporte', tasks: [], isCustom: false },
    { id: 'luna-miel', name: 'Luna de miel', tasks: [], isCustom: false },
    { id: 'cotillon', name: 'Cotillón', tasks: [], isCustom: false }
  ],
  guests: [],
  budget: [],
  settings: {
    darkMode: false
  }
};

function getAllData() {
  const data = localStorage.getItem('weddingData');
  if (!data) {
    localStorage.setItem('weddingData', JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
}

function saveAllData(data) {
  localStorage.setItem('weddingData', JSON.stringify(data));
}

function getSections() {
  const data = getAllData();
  return data.sections;
}

function saveSections(sections) {
  const data = getAllData();
  data.sections = sections;
  saveAllData(data);
}

function addCustomSection(name) {
  const sections = getSections();
  const newSection = {
    id: generateId(),
    name: name,
    tasks: [],
    isCustom: true
  };
  sections.push(newSection);
  saveSections(sections);
  return newSection;
}

function deleteCustomSection(sectionId) {
  const sections = getSections();
  const filtered = sections.filter(s => s.id !== sectionId);
  saveSections(filtered);
}

function getSectionById(id) {
  const sections = getSections();
  return sections.find(s => s.id === id);
}

function updateSection(sectionId, updates) {
  const sections = getSections();
  const index = sections.findIndex(s => s.id === sectionId);
  if (index !== -1) {
    sections[index] = { ...sections[index], ...updates };
    saveSections(sections);
  }
}

function addTaskToSection(sectionId, taskText) {
  const sections = getSections();
  const section = sections.find(s => s.id === sectionId);
  if (section) {
    const newTask = {
      id: generateId(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };
    section.tasks.push(newTask);
    saveSections(sections);
    return newTask;
  }
}

function updateTask(sectionId, taskId, updates) {
  const sections = getSections();
  const section = sections.find(s => s.id === sectionId);
  if (section) {
    const task = section.tasks.find(t => t.id === taskId);
    if (task) {
      Object.assign(task, updates);
      saveSections(sections);
    }
  }
}

function deleteTask(sectionId, taskId) {
  const sections = getSections();
  const section = sections.find(s => s.id === sectionId);
  if (section) {
    section.tasks = section.tasks.filter(t => t.id !== taskId);
    saveSections(sections);
  }
}

function toggleTaskComplete(sectionId, taskId) {
  const sections = getSections();
  const section = sections.find(s => s.id === sectionId);
  if (section) {
    const task = section.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveSections(sections);
    }
  }
}

function getGuests() {
  const data = getAllData();
  return data.guests;
}

function saveGuests(guests) {
  const data = getAllData();
  data.guests = guests;
  saveAllData(data);
}

function addGuest(guestData) {
  const guests = getGuests();
  const newGuest = {
    id: generateId(),
    name: guestData.name,
    companions: guestData.companions || 0,
    confirmed: guestData.confirmed || false,
    paid: guestData.paid || false,
    amount: guestData.amount || 0,
    paidAmount: guestData.paidAmount || 0,
    createdAt: new Date().toISOString()
  };
  guests.push(newGuest);
  saveGuests(guests);
  return newGuest;
}

function updateGuest(guestId, updates) {
  const guests = getGuests();
  const index = guests.findIndex(g => g.id === guestId);
  if (index !== -1) {
    guests[index] = { ...guests[index], ...updates };
    saveGuests(guests);
  }
}

function deleteGuest(guestId) {
  const guests = getGuests();
  const filtered = guests.filter(g => g.id !== guestId);
  saveGuests(filtered);
}

function getBudgetItems() {
  const data = getAllData();
  return data.budget;
}

function saveBudgetItems(items) {
  const data = getAllData();
  data.budget = items;
  saveAllData(data);
}

function addBudgetItem(itemData) {
  const items = getBudgetItems();
  const newItem = {
    id: generateId(),
    provider: itemData.provider,
    total: itemData.total,
    deposit: itemData.deposit || 0,
    balance: itemData.total - (itemData.deposit || 0),
    status: calculatePaymentStatus(itemData.total, itemData.deposit || 0),
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  saveBudgetItems(items);
  return newItem;
}

function updateBudgetItem(itemId, updates) {
  const items = getBudgetItems();
  const index = items.findIndex(i => i.id === itemId);
  if (index !== -1) {
    const item = items[index];
    items[index] = { 
      ...item, 
      ...updates,
      balance: (updates.total || item.total) - (updates.deposit || item.deposit),
      status: calculatePaymentStatus(
        updates.total || item.total,
        updates.deposit || item.deposit
      )
    };
    saveBudgetItems(items);
  }
}

function deleteBudgetItem(itemId) {
  const items = getBudgetItems();
  const filtered = items.filter(i => i.id !== itemId);
  saveBudgetItems(filtered);
}

function calculatePaymentStatus(total, paid) {
  if (paid === 0) return 'pending';
  if (paid >= total) return 'paid';
  return 'partial';
}

function getSettings() {
  const data = getAllData();
  return data.settings;
}

function saveSettings(settings) {
  const data = getAllData();
  data.settings = settings;
  saveAllData(data);
}

function clearAllData() {
  if (window.confirm('¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('weddingData');
    window.location.reload();
  }
      }
