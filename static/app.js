// Sportbnb Frontend Application
let currentUser = null;
let authToken = null;
let equipmentData = [];
let currentCategory = '';
let map = null;
let markers = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initEventListeners();
  loadEquipment();
  initMap();
});

// ========== AUTH ==========

function initAuth() {
  authToken = localStorage.getItem('authToken');
  if (authToken) {
    fetchCurrentUser();
  }
}

async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      currentUser = await res.json();
      updateUI();
    } else {
      logout();
    }
  } catch (err) {
    console.error('Auth error:', err);
  }
}

function updateUI() {
  if (currentUser) {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'block';
    document.getElementById('becomeHostBtn').style.display = currentUser.is_host ? 'none' : 'inline-block';
    document.getElementById('userCircle').textContent = currentUser.full_name[0].toUpperCase();
    document.getElementById('adminLink').style.display = currentUser.is_admin ? 'block' : 'none';
  } else {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
  }
}

function logout() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('authToken');
  updateUI();
  showMainView();
}

// ========== EVENT LISTENERS ==========

function initEventListeners() {
  // Auth buttons
  document.getElementById('loginBtn').onclick = () => openModal('loginModal');
  document.getElementById('registerBtn').onclick = () => openModal('registerModal');
  document.getElementById('logoutLink').onclick = (e) => { e.preventDefault(); logout(); };
  
  // Modal switches
  document.getElementById('switchToRegister').onclick = (e) => {
    e.preventDefault();
    closeAllModals();
    openModal('registerModal');
  };
  document.getElementById('switchToLogin').onclick = (e) => {
    e.preventDefault();
    closeAllModals();
    openModal('loginModal');
  };
  
  // Forms
  document.getElementById('loginForm').onsubmit = handleLogin;
  document.getElementById('registerForm').onsubmit = handleRegister;
  document.getElementById('addEquipmentForm').onsubmit = handleAddEquipment;
  
  // Search
  document.getElementById('searchBtn').onclick = performSearch;
  document.getElementById('searchInput').onkeyup = (e) => {
    if (e.key === 'Enter') performSearch();
  };
  
  // Filters
  document.querySelectorAll('.filter-tag').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      loadEquipment();
    };
  });
  
  // User menu
  document.getElementById('userCircle').onclick = () => {
    document.getElementById('userDropdown').classList.toggle('show');
  };
  
  document.getElementById('myEquipmentLink').onclick = (e) => {
    e.preventDefault();
    showMyEquipment();
  };
  
  document.getElementById('adminLink').onclick = (e) => {
    e.preventDefault();
    showAdminPanel();
  };
  
  document.getElementById('becomeHostBtn').onclick = becomeHost;
  
  // View navigation
  document.getElementById('backFromMyEquipment').onclick = showMainView;
  document.getElementById('backFromAdmin').onclick = showMainView;
  document.getElementById('openAddEquipment').onclick = () => openModal('addEquipmentModal');
  
  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.onclick = closeAllModals;
  });
  
  window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  };
  
  // Logo
  document.querySelector('.logo').onclick = showMainView;
}

// ========== MODALS ==========

function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  document.getElementById('userDropdown').classList.remove('show');
}

// ========== AUTH HANDLERS ==========

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      authToken = data.access_token;
      localStorage.setItem('authToken', authToken);
      await fetchCurrentUser();
      closeAllModals();
      showNotification('Login effettuato!', 'success');
    } else {
      showNotification('Email o password errati', 'error');
    }
  } catch (err) {
    showNotification('Errore di connessione', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const data = {
    full_name: document.getElementById('regFullName').value,
    email: document.getElementById('regEmail').value,
    phone: document.getElementById('regPhone').value,
    password: document.getElementById('regPassword').value
  };
  
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      const result = await res.json();
      authToken = result.access_token;
      localStorage.setItem('authToken', authToken);
      await fetchCurrentUser();
      closeAllModals();
      showNotification('Registrazione completata!', 'success');
    } else {
      const err = await res.json();
      showNotification(err.detail || 'Errore nella registrazione', 'error');
    }
  } catch (err) {
    showNotification('Errore di connessione', 'error');
  }
}

async function becomeHost() {
  if (!authToken) {
    openModal('loginModal');
    return;
  }
  
  try {
    const res = await fetch('/api/auth/become-host', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (res.ok) {
      await fetchCurrentUser();
      showNotification('Ora sei un host!', 'success');
    }
  } catch (err) {
    showNotification('Errore', 'error');
  }
}

// ========== EQUIPMENT ==========

async function loadEquipment() {
  const search = document.getElementById('searchInput').value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (currentCategory) params.set('category', currentCategory);
  
  try {
    const res = await fetch(`/api/equipment?${params}`);
    equipmentData = await res.json();
    renderEquipment(equipmentData);
    updateMap(equipmentData);
  } catch (err) {
    console.error('Load error:', err);
  }
}

function renderEquipment(items) {
  const grid = document.getElementById('equipmentGrid');
  const noResults = document.getElementById('noResults');
  
  if (items.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  
  noResults.style.display = 'none';
  grid.innerHTML = items.map(item => createEquipmentCard(item)).join('');
  
  // Add click handlers
  document.querySelectorAll('.equipment-card').forEach((card, idx) => {
    card.onclick = () => showEquipmentDetail(items[idx]);
  });
}

function createEquipmentCard(item) {
  const images = item.images && item.images.length > 0 ? item.images : ['https://via.placeholder.com/400x300?text=No+Image'];
  const mainImage = images[0];
  
  return `
    <div class="equipment-card" data-id="${item.id}">
      <div class="card-image-container">
        <img class="card-image" src="${mainImage}" alt="${item.title}" />
        ${images.length > 1 ? `
          <button class="card-carousel-nav prev" onclick="event.stopPropagation(); prevImage(this)">‹</button>
          <button class="card-carousel-nav next" onclick="event.stopPropagation(); nextImage(this)">›</button>
          <div class="card-dots">
            ${images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="card-content">
        <div class="card-title">${item.title}</div>
        <div class="card-city">${item.city || 'Italia'}</div>
        <div class="card-price">
          <strong>€${item.price_per_day.toFixed(2)}</strong>
          <span class="per">/giorno</span>
        </div>
      </div>
    </div>
  `;
}

function prevImage(btn) {
  const card = btn.closest('.equipment-card');
  const id = card.dataset.id;
  const item = equipmentData.find(e => e.id === id);
  if (!item || !item.images) return;
  
  const img = card.querySelector('.card-image');
  const dots = card.querySelectorAll('.dot');
  const currentIdx = Array.from(dots).findIndex(d => d.classList.contains('active'));
  const newIdx = (currentIdx - 1 + item.images.length) % item.images.length;
  
  img.src = item.images[newIdx];
  dots.forEach((d, i) => d.classList.toggle('active', i === newIdx));
}

function nextImage(btn) {
  const card = btn.closest('.equipment-card');
  const id = card.dataset.id;
  const item = equipmentData.find(e => e.id === id);
  if (!item || !item.images) return;
  
  const img = card.querySelector('.card-image');
  const dots = card.querySelectorAll('.dot');
  const currentIdx = Array.from(dots).findIndex(d => d.classList.contains('active'));
  const newIdx = (currentIdx + 1) % item.images.length;
  
  img.src = item.images[newIdx];
  dots.forEach((d, i) => d.classList.toggle('active', i === newIdx));
}

function showEquipmentDetail(item) {
  const content = document.getElementById('detailContent');
  const images = item.images && item.images.length > 0 ? item.images : ['https://via.placeholder.com/800x600?text=No+Image'];
  
  content.innerHTML = `
    <h2>${item.title}</h2>
    <div style="margin: 20px 0;">
      <img src="${images[0]}" style="width: 100%; border-radius: 12px;" />
    </div>
    <p style="margin: 16px 0; color: var(--text-light);">${item.city || 'Italia'}</p>
    <p style="margin: 16px 0;">${item.description || 'Nessuna descrizione disponibile.'}</p>
    <div style="margin: 24px 0; padding: 20px; background: var(--bg-light); border-radius: 12px;">
      <div style="font-size: 24px; font-weight: 700; color: var(--primary);">
        €${item.price_per_day.toFixed(2)} <span style="font-size: 16px; font-weight: 400; color: var(--text-light);">/giorno</span>
      </div>
    </div>
    <button class="btn-primary btn-full" onclick="bookEquipment('${item.id}')">Prenota ora</button>
  `;
  
  openModal('detailModal');
}

function bookEquipment(id) {
  if (!authToken) {
    closeAllModals();
    openModal('loginModal');
    showNotification('Effettua il login per prenotare', 'info');
    return;
  }
  
  showNotification('Funzione prenotazione in sviluppo', 'info');
}

function performSearch() {
  loadEquipment();
}

// ========== MY EQUIPMENT ==========

async function showMyEquipment() {
  if (!authToken) {
    openModal('loginModal');
    return;
  }
  
  document.querySelector('.main-container').style.display = 'none';
  document.getElementById('myEquipmentView').style.display = 'block';
  document.getElementById('adminView').style.display = 'none';
  
  try {
    const res = await fetch('/api/equipment/my', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const items = await res.json();
    const list = document.getElementById('myEquipmentList');
    list.innerHTML = items.map(item => createEquipmentCard(item)).join('');
  } catch (err) {
    showNotification('Errore nel caricamento', 'error');
  }
}

async function handleAddEquipment(e) {
  e.preventDefault();
  
  const images = [];
  const img1 = document.getElementById('eqImage1').value;
  const img2 = document.getElementById('eqImage2').value;
  if (img1) images.push(img1);
  if (img2) images.push(img2);
  
  const data = {
    title: document.getElementById('eqTitle').value,
    description: document.getElementById('eqDescription').value,
    price_per_day: parseFloat(document.getElementById('eqPrice').value),
    city: document.getElementById('eqCity').value,
    category: document.getElementById('eqCategory').value,
    image_urls: images
  };
  
  try {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      closeAllModals();
      showNotification('Attrezzatura aggiunta!', 'success');
      showMyEquipment();
    } else {
      const err = await res.json();
      showNotification(err.detail || 'Errore', 'error');
    }
  } catch (err) {
    showNotification('Errore di connessione', 'error');
  }
}

// ========== ADMIN PANEL ==========

async function showAdminPanel() {
  if (!currentUser || !currentUser.is_admin) return;
  
  document.querySelector('.main-container').style.display = 'none';
  document.getElementById('myEquipmentView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';
  
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const stats = await res.json();
    
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card">
        <h3>Utenti</h3>
        <p>${stats.total_users}</p>
      </div>
      <div class="stat-card">
        <h3>Attrezzature</h3>
        <p>${stats.total_equipment}</p>
      </div>
      <div class="stat-card">
        <h3>Prenotazioni</h3>
        <p>${stats.total_bookings}</p>
      </div>
      <div class="stat-card">
        <h3>In attesa</h3>
        <p>${stats.pending_bookings}</p>
      </div>
    `;
    
    loadAdminTab('users');
  } catch (err) {
    showNotification('Errore nel caricamento', 'error');
  }
}

async function loadAdminTab(tab) {
  const content = document.getElementById('adminContent');
  
  try {
    const res = await fetch(`/api/admin/${tab}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    content.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (err) {
    content.innerHTML = '<p>Errore nel caricamento dei dati</p>';
  }
}

// ========== MAP ==========

function initMap() {
  map = L.map('map').setView([45.5, 10.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

function updateMap(items) {
  markers.forEach(m => m.remove());
  markers = [];
  
  const bounds = [];
  items.forEach(item => {
    if (item.lat && item.lon) {
      const marker = L.marker([item.lat, item.lon]).addTo(map);
      marker.bindPopup(`<b>${item.title}</b><br>€${item.price_per_day}/giorno`);
      marker.on('click', () => showEquipmentDetail(item));
      markers.push(marker);
      bounds.push([item.lat, item.lon]);
    }
  });
  
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

// ========== VIEW MANAGEMENT ==========

function showMainView() {
  document.querySelector('.main-container').style.display = 'block';
  document.getElementById('myEquipmentView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  closeAllModals();
  loadEquipment();
}

// ========== NOTIFICATIONS ==========

function showNotification(message, type = 'info') {
  const colors = {
    success: '#00A699',
    error: '#E31C5F',
    info: '#008489'
  };
  
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 16px 24px;
    background: ${colors[type]};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s;
    font-weight: 600;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}
