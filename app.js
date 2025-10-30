// app.js - Lógica principal de la app
document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    const sections = ['Civil', 'Iglesia / Ceremonia', 'Salón / Recepción', 'Vestido de la novia', 'Traje del novio', 'Invitados', 'Fotografía / Video', 'Catering / Menú', 'Música / DJ / Animación', 'Decoración', 'Flores', 'Transporte', 'Luna de miel', 'Cotillón', 'Pagos y Presupuesto'];
    let customSections = JSON.parse(localStorage.getItem('customSections')) || [];
    let data = JSON.parse(localStorage.getItem('weddingData')) || {}; // Almacena checklists, invitados, presupuesto

    // Inicializar secciones
    renderSections();
    updateProgress();
    updateBudgetSummary();

    // Event listeners
    document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
    document.getElementById('add-custom-section').addEventListener('click', addCustomSection);
    document.getElementById('search-input').addEventListener('input', search);
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('change', importData);

    // Modales
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
    });

    // Función para renderizar botones de secciones
    function renderSections() {
        const container = document.getElementById('section-buttons');
        container.innerHTML = '';
        [...sections, ...customSections].forEach(section => {
            const btn = document.createElement('div');
            btn.className = 'section-btn';
            btn.textContent = section;
            btn.addEventListener('click', () => openSectionModal(section));
            container.appendChild(btn);
        });
    }

    // Abrir modal de sección
    function openSectionModal(section) {
        if (section === 'Invitados') {
            openGuestsModal();
        } else if (section === 'Pagos y Presupuesto') {
            openBudgetModal();
        } else {
            document.getElementById('modal-title').textContent = section;
            renderChecklist(section);
            document.getElementById('section-modal').style.display = 'block';
            document.getElementById('add-item').onclick = () => addItem(section);
        }
    }

    // Renderizar checklist
    function renderChecklist(section) {
        const list = document.getElementById('checklist');
        list.innerHTML = '';
        (data[section] || []).forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleComplete('${section}', ${index})"> ${item.text}`;
            if (item.completed) li.classList.add('completed');
            list.appendChild(li);
        });
    }

    // Agregar ítem a checklist
    function addItem(section) {
        const input = document.getElementById('new-item-input');
        if (input.value) {
            if (!data[section]) data[section] = [];
            data[section].push({ text: input.value, completed: false });
            saveData();
            renderChecklist(section);
            input.value = '';
            updateProgress();
        }
    }

    // Marcar como completo
    window.toggleComplete = (section, index) => {
        data[section][index].completed = !data[section][index].completed;
        saveData();
        renderChecklist(section);
        updateProgress();
    };

    // Agregar sección personalizada
    function addCustomSection() {
        const name = prompt('Nombre de la nueva sección:');
        if (name && !sections.includes(name) && !customSections.includes(name)) {
            customSections.push(name);
            localStorage.setItem('customSections', JSON.stringify(customSections));
            renderSections();
        }
    }

    // Gestión de invitados
    function openGuestsModal() {
        renderGuests();
        document.getElementById('guests-modal').style.display = 'block';
        document.getElementById('add-guest').onclick = addGuest;
        document.getElementById('filter-guests').onchange = renderGuests;
    }

    function renderGuests() {
        const list = document.getElementById('guest-list');
        list.innerHTML = '';
        const filter = document.getElementById('filter-guests').value;
        (data.guests || []).forEach((guest, index) => {
            if (filter === 'all' || 
                (filter === 'confirmed' && guest.confirmed) ||
                (filter === 'paid' && guest.paid >= guest.amount) ||
                (filter === 'owed' && guest.paid < guest.amount)) {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>${guest.name} (${guest.companions || 0} acompañantes)</p>
                    <p>Confirmado: <input type="checkbox" ${guest.confirmed ? 'checked' : ''} onchange="toggleGuestConfirmed(${index})"></p>
                    <p>Monto: $<input type="number" value="${guest.amount || 0}" onchange="updateGuestAmount(${index}, this.value)"> Pagado: $<input type="number" value="${guest.paid || 0}" onchange="updateGuestPaid(${index}, this.value)"></p>
                    <p>Estado: ${getGuestStatus(guest)}</p>
                `;
                list.appendChild(div);
            }
        });
    }

    function addGuest() {
        const name = document.getElementById('guest-name').value;
        const companions = document.getElementById('guest-companions').value;
        if (name) {
            if (!data.guests) data.guests = [];
            data.guests.push({ name, companions: parseInt(companions) || 0, confirmed: false, amount: 0, paid: 0 });
            saveData();
            renderGuests();
            updateBudgetSummary();
        }
    }

    window.toggleGuestConfirmed = (index) => {
        data.guests[index].confirmed = !data.guests[index].confirmed;
        saveData();
        renderGuests();
    };

    window.updateGuestAmount = (index, value) => {
        data.guests[index].amount = parseFloat(value) || 0;
        saveData();
        updateBudgetSummary();
    };

    window.updateGuestPaid = (index, value) => {
        data.guests[index].paid = parseFloat(value) || 0;
        saveData();
        updateBudgetSummary();
    };

    function getGuestStatus(guest) {
        if (!guest.confirmed) return 'No confirmado';
        if (guest.paid >= guest.amount) return 'Pagado';
        return 'Debe';
    }

    // Gestión de presupuesto
    function openBudgetModal() {
        renderBudget();
        document.getElementById('budget-modal').style.display = 'block';
        document.getElementById('add-budget-item').onclick = addBudgetItem;
    }

    function renderBudget() {
        const list = document.getElementById('budget-list');
        list.innerHTML = '';
        (data.budget || []).forEach((item, index) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p>${item.provider}: Total $${item.total}, Seña $${item.deposit}, Pendiente $${item.total - item.deposit}</p>
            `;
            list.appendChild(div);
        });
    }

    function addBudgetItem() {
        const provider = document.getElementById('provider-name').value;
        const total = parseFloat(document.getElementById('total-cost').value) || 0;
        const deposit = parseFloat(document.getElementById('deposit').value) || 0;
        if (provider) {
            if (!data.budget) data.budget = [];
            data.budget.push({ provider, total, deposit });
            saveData();
            renderBudget();
            updateBudgetSummary();
        }
    }

    // Actualizar progreso (gráfico circular)
    function updateProgress() {
        let totalTasks = 0;
        let completedTasks = 0;
        Object.values(data).forEach(section => {
            if (Array.isArray(section)) {
                section.forEach(item => {
                    totalTasks++;
                    if (item.completed) completedTasks++;
                });
            }
        });
        const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        document.getElementById('progress-text').textContent = `${percentage}% completado`;
        renderProgressChart(percentage);
    }

    function renderProgressChart(percentage) {
        const chart = document.getElementById('progress-chart');
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        chart.innerHTML = `
            <svg width="150" height="150">
                <circle cx="75" cy="75" r="${radius}" stroke="#e0e0e0" stroke-width="10" fill="none"></circle>
                <circle cx="75" cy="75" r="${radius}" stroke="#8FAF9E" stroke-width="10" fill
