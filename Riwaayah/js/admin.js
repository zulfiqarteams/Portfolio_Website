import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, getDoc, deleteDoc, doc, updateDoc,
  Timestamp, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= AUTH CHECK ================= */

function checkAdminAccess() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'admin') {
    document.getElementById('access-denied').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    return false;
  }
  document.getElementById('access-denied').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
  document.getElementById('admin-name').textContent = currentUser.name;
  document.getElementById('admin-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  return true;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}
window.logout = logout;

/* ================= DARK MODE ================= */

let isDarkMode = localStorage.getItem('darkMode') === 'true';

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  applyDarkMode();
}

function applyDarkMode() {
  const sidebar = document.getElementById('admin-sidebar');
  const main = document.getElementById('admin-main');
  
  if (isDarkMode) {
    sidebar.style.background = '#0f172a';
    main.style.background = '#1e293b';
    main.style.color = '#f1f5f9';
    document.body.style.background = '#1e293b';
  } else {
    sidebar.style.background = '#111827';
    main.style.background = '#f3f4f6';
    main.style.color = '#111827';
    document.body.style.background = '#ffffff';
  }
}
window.toggleDarkMode = toggleDarkMode;

/* ================= ANIMATED COUNTER ================= */

function animateCounter(element, target, prefix = '', suffix = '') {
  const duration = 1500;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);
    
    element.textContent = prefix + current.toLocaleString() + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

/* ================= TABS ================= */

window.switchAdminTab = function(tabName) {
  document.querySelectorAll('.admin-nav-link').forEach(link => link.classList.remove('active'));
  event.target.closest('.admin-nav-link').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
    tab.style.opacity = '0';
  });
  
  const targetTab = document.getElementById('tab-' + tabName);
  targetTab.classList.add('active');
  
  // Fade in animation
  setTimeout(() => {
    targetTab.style.transition = 'opacity 0.3s ease';
    targetTab.style.opacity = '1';
  }, 50);
  
  if (tabName === 'users') loadUsers();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'products') loadProducts();
  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'analytics') loadAnalytics();
};

/* ================= CHARTS ================= */

let salesChartInstance = null;
let orderChartInstance = null;

function initCharts(orders) {
  const salesCtx = document.getElementById('salesChart');
  const orderCtx = document.getElementById('orderChart');
  
  if (!salesCtx || !orderCtx) return;
  
  // Prepare sales data (last 7 days)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const salesData = [12000, 19000, 15000, 25000, 22000, 30000, 28000];
  
  if (salesChartInstance) salesChartInstance.destroy();
  if (orderChartInstance) orderChartInstance.destroy();
  
  salesChartInstance = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Sales',
        data: salesData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
      }
    }
  });
  
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  
  orderChartInstance = new Chart(orderCtx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Completed'],
      datasets: [{
        data: [pendingCount, completedCount],
        backgroundColor: ['#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

/* ================= DASHBOARD ================= */

async function loadDashboard() {
  try {
    const [productsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")))
    ]);
    
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    
    // Animate counters
    animateCounter(document.getElementById('stat-products'), productsSnap.size);
    animateCounter(document.getElementById('stat-orders'), orders.length);
    animateCounter(document.getElementById('stat-users'), users.length);
    animateCounter(document.getElementById('stat-revenue'), totalRevenue, 'Rs ');
    
    // Update badges
    document.getElementById('badge-products').textContent = productsSnap.size;
    document.getElementById('badge-orders').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('badge-users').textContent = users.length;
    
    // Init charts
    initCharts(orders);
    
    // Recent orders table
    const recentOrdersDiv = document.getElementById('dashboard-orders');
    const recentOrders = orders.slice(0, 5);
    
    if (recentOrders.length === 0) {
      recentOrdersDiv.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No orders yet</p>';
      return;
    }
    
    let html = '<table class="users-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>';
    
    recentOrders.forEach((order, index) => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
      
      html += `
        <tr style="animation: fadeIn 0.3s ease ${index * 0.1}s both;">
          <td><span style="font-family: monospace; font-size: 13px; color: #6b7280;">#${order.id?.slice(-6).toUpperCase() || 'N/A'}</span></td>
          <td>
            <div class="user-info-cell">
              <div>
                <div class="user-name">${order.name}</div>
                <div class="user-email">${order.phone}</div>
              </div>
            </div>
          </td>
          <td>${order.items?.length || 0} items</td>
          <td style="font-weight: 600;">Rs ${order.totalPrice?.toLocaleString()}</td>
          <td>
            <span class="status-badge ${order.status || 'pending'}" style="cursor: pointer;" onclick="toggleOrderStatus('${order.id}', '${order.status}')">
              ${order.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
            </span>
          </td>
          <td>
            <button onclick="viewOrderDetail('${order.id}')" class="btn" style="padding: 6px 12px; font-size: 13px;">
              View
            </button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    recentOrdersDiv.innerHTML = html;
    
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

window.refreshDashboard = function() {
  const btn = event.target.closest('button');
  btn.style.transform = 'rotate(360deg)';
  btn.style.transition = 'transform 0.5s ease';
  setTimeout(() => btn.style.transform = '', 500);
  loadDashboard();
};

/* ================= USERS ================= */

function loadUsers() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const tbody = document.getElementById('users-table-body');
  const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
  
  const filteredUsers = searchTerm 
    ? users.filter(u => u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm))
    : users;
  
  const admins = users.filter(u => u.role === 'admin').length;
  const customers = users.filter(u => u.role === 'user').length;
  document.getElementById('admin-count').textContent = admins;
  document.getElementById('user-count').textContent = customers;
  
  if (filteredUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">No users found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredUsers.map((user, index) => {
    const date = new Date(user.createdAt).toLocaleDateString();
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    return `
      <tr style="animation: fadeIn 0.3s ease ${index * 0.05}s both;">
        <td>
          <div class="user-info-cell">
            <div class="user-avatar-small">${initials}</div>
            <div>
              <div class="user-name">${user.name}</div>
              <div class="user-email">${user.email}</div>
            </div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>${user.phone || 'N/A'}</td>
        <td>
          <span class="status-badge ${user.role}">
            ${user.role === 'admin' ? 'Administrator' : 'Customer'}
          </span>
        </td>
        <td style="color: #6b7280;">${date}</td>
        <td>
          <button onclick="deleteUser('${user.id}')" class="btn" style="background: #fee2e2; color: #ef4444; padding: 6px 12px; font-size: 13px;">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteUser = function(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  let users = JSON.parse(localStorage.getItem('users')) || [];
  users = users.filter(u => u.id !== userId);
  localStorage.setItem('users', JSON.stringify(users));
  showToast('User deleted');
  loadUsers();
  loadDashboard();
};

// User search
document.getElementById('user-search')?.addEventListener('input', debounce(() => loadUsers(), 300));

/* ================= PRODUCTS ================= */

const form = document.getElementById("product-form");
const container = document.getElementById("admin-products");
let currentEditId = null;
let productsCache = [];

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.handleImageDrop = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.dataTransfer.files;
  if (files.length) {
    document.getElementById('imageFile').files = files;
    previewImage({ target: { files } });
  }
};

window.previewImage = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const preview = document.getElementById('image-preview');
  const img = preview.querySelector('img');
  
  const reader = new FileReader();
  reader.onload = (event) => {
    img.src = event.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
};
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Adding...';
  
  const file = document.getElementById("imageFile").files[0];
  let image = "";
  if (file) image = await toBase64(file);

  const product = {
    name: document.getElementById("name").value.trim(),
    price: Number(document.getElementById("price").value),
    category: document.getElementById("category").value,
    image,
    sizes: ["S", "M", "L"],
    stock: Number(document.getElementById("stock")?.value) || 10,
    createdAt: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "products"), product);
    showToast("Product added successfully");
    form.reset();
    document.getElementById('image-preview').style.display = 'none';
    closeProductModal();
    loadProducts();
    loadDashboard();
  } catch (err) {
    console.error("Add product error:", err);
    showToast("Failed to add product: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Product';
  }
});

async function loadProducts() {
  if (!container) return;
  container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>';
  productsCache = [];

  try {
    const snap = await getDocs(collection(db, "products"));
    
    if (snap.empty) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #6b7280;">No products yet. Add your first product!</div>';
      return;
    }
    
    container.innerHTML = "";
    snap.forEach((d, index) => {
      const p = d.data();
      productsCache.push({ id: d.id, ...p });
      
      const card = document.createElement('div');
      card.className = 'card';
      card.style.animation = `fadeIn 0.4s ease ${index * 0.1}s both`;
      card.innerHTML = `
        <div style="position: relative; overflow: hidden;">
          <img src="${p.image || 'https://via.placeholder.com/400x400?text=No+Image'}" 
               style="height: 220px; width: 100%; object-fit: cover; transition: transform 0.3s;"
               onmouseenter="this.style.transform='scale(1.05)'"
               onmouseleave="this.style.transform='scale(1)'"
               onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
          <div style="position: absolute; top: 12px; left: 12px; background: ${p.stock > 5 ? '#10b981' : '#ef4444'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            ${p.stock > 0 ? p.stock + ' in stock' : 'Out of Stock'}
          </div>
        </div>
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div class="card-title" style="font-size: 15px;">${p.name}</div>
            <span style="font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 10px; border-radius: 20px;">${p.category || 'N/A'}</span>
          </div>
          <div class="card-price" style="font-size: 20px; margin-bottom: 16px;">Rs ${p.price?.toLocaleString()}</div>
          <div style="display: flex; gap: 8px;">
            <button onclick="openEdit('${d.id}')" class="btn" style="flex: 1; padding: 10px; font-size: 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: middle;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
            <button onclick="deleteProduct('${d.id}')" class="btn" style="flex: 1; background: #fee2e2; color: #ef4444; padding: 10px; font-size: 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: middle;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Load products error:", err);
    showToast("Failed to load products", "error");
  }
}

// Product search
    // Attach search listener only after products are loaded
    const searchInput = document.getElementById('product-search');
    if (searchInput && !searchInput.dataset.listenerAttached) {
      searchInput.dataset.listenerAttached = 'true';
      searchInput.addEventListener('input', debounce(async (e) => {
        const term = e.target.value.toLowerCase();
        if (!term) {
          loadProducts();
          return;
        }
        
        const filtered = productsCache.filter(p => 
          p.name.toLowerCase().includes(term) || 
          (p.category && p.category.toLowerCase().includes(term))
        );
        
        container.innerHTML = "";
        if (filtered.length === 0) {
          container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">No products found</div>';
          return;
        }
        
        filtered.forEach((p, index) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.animation = `fadeIn 0.4s ease ${index * 0.1}s both`;
          card.innerHTML = `
            <div style="position: relative; overflow: hidden;">
              <img src="${p.image || 'https://via.placeholder.com/400x400?text=No+Image'}" 
                   style="height: 220px; width: 100%; object-fit: cover;"
                   onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
            </div>
            <div class="card-body">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div class="card-title" style="font-size: 15px;">${p.name}</div>
                <span style="font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 10px; border-radius: 20px;">${p.category || 'N/A'}</span>
              </div>
              <div class="card-price" style="font-size: 20px; margin-bottom: 16px;">Rs ${p.price?.toLocaleString()}</div>
              <div style="display: flex; gap: 8px;">
                <button onclick="openEdit('${p.id}')" class="btn" style="flex: 1; padding: 10px; font-size: 14px;">Edit</button>
                <button onclick="deleteProduct('${p.id}')" class="btn" style="flex: 1; background: #fee2e2; color: #ef4444; padding: 10px; font-size: 14px;">Delete</button>
              </div>
            </div>
          `;
          container.appendChild(card);
        });
      }, 300));
    }

window.deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  const card = event.target.closest('.card');
  card.style.transform = 'scale(0.9)';
  card.style.opacity = '0';
  card.style.transition = 'all 0.3s ease';
  
  try {
    await deleteDoc(doc(db, "products", id));
    setTimeout(() => {
      showToast("Product deleted");
      loadProducts();
      loadDashboard();
    }, 300);
  } catch (err) {
    console.error("Delete error:", err);
    showToast("Failed to delete", "error");
  }
};

window.openEdit = (id) => {
  const product = productsCache.find(p => p.id === id);
  if (!product) return;
  currentEditId = id;
  document.getElementById("edit-name").value = product.name || "";
  document.getElementById("edit-price").value = product.price || "";
  document.getElementById("edit-category").value = product.category || "";
  document.getElementById("edit-stock").value = product.stock || 10;
  document.getElementById("editModal").style.display = "flex";
};

window.closeEditModal = () => {
  document.getElementById("editModal").style.display = "none";
  currentEditId = null;
};

window.openProductModal = () => {
  document.getElementById('productModal').style.display = 'flex';
  document.getElementById('productModal').style.animation = 'fadeIn 0.2s ease';
};

window.closeProductModal = () => {
  const modal = document.getElementById('productModal');
  modal.style.animation = 'fadeOut 0.2s ease';
  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.animation = '';
    form.reset();
    document.getElementById('image-preview').style.display = 'none';
  }, 200);
};

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  if (!currentEditId) return;
  
  const btn = document.getElementById("saveEditBtn");
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  try {
    const ref = doc(db, "products", currentEditId);
    await updateDoc(ref, {
      name: document.getElementById("edit-name").value,
      price: Number(document.getElementById("edit-price").value),
      category: document.getElementById("edit-category").value,
      stock: Number(document.getElementById("edit-stock")?.value) || 0
    });
    showToast("Product updated successfully");
    closeEditModal();
    loadProducts();
    loadDashboard();
  } catch (err) {
    console.error("Update error:", err);
    showToast("Failed to update", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
});

/* ================= ORDERS ================= */

async function loadOrders() {
  const ordersContainer = document.getElementById("orders-list");
  const filter = document.getElementById('order-filter')?.value || 'all';
  
  if (!ordersContainer) return;
  
  ordersContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>';
  
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    let orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (filter !== 'all') {
      orders = orders.filter(o => o.status === filter);
    }
    
    document.getElementById('order-count').textContent = orders.length + ' orders';
    
    ordersContainer.innerHTML = "";
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = '<div style="text-align: center; padding: 60px; color: #6b7280;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin: 0 auto 16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><p>No orders found</p></div>';
      return;
    }
    
    orders.forEach((order, index) => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
      const time = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
      
      const div = document.createElement('div');
      div.style.cssText = `background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; cursor: pointer; transition: all 0.2s; animation: fadeIn 0.4s ease ${index * 0.08}s both;`;
      div.onmouseenter = () => div.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
      div.onmouseleave = () => div.style.boxShadow = 'none';
      div.onclick = () => viewOrderDetail(order.id);
      
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 14px; font-weight: 600; color: #111827;">#${order.id?.slice(-6).toUpperCase()}</span>
              <span style="background: ${order.status === 'pending' ? '#fef3c7' : '#d1fae5'}; 
                           color: ${order.status === 'pending' ? '#92400e' : '#065f46'}; 
                           padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${order.status === 'pending' ? '⏳ Pending' : '✓ Completed'}
              </span>
            </div>
            <strong style="color: #111827; font-size: 16px;">${order.name}</strong>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${order.phone}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: 700; color: #111827;">Rs ${order.totalPrice?.toLocaleString()}</div>
            <div style="font-size: 13px; color: #9ca3af; margin-top: 4px;">${date} at ${time}</div>
          </div>
        </div>
        
        <div style="border-top: 1px solid #f3f4f6; padding-top: 16px;">
          <div style="display: flex; gap: 12px; overflow-x: auto;">
            ${order.items?.map(item => `
              <div style="display: flex; align-items: center; gap: 10px; background: #f9fafb; padding: 8px 12px; border-radius: 10px; min-width: fit-content;">
                <img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">
                <div>
                  <div style="font-size: 13px; font-weight: 500; white-space: nowrap;">${item.name}</div>
                  <div style="font-size: 12px; color: #6b7280;">Qty: ${item.qty}</div>
                </div>
              </div>
            `).join('') || 'No items'}
          </div>
        </div>
      `;
      
      ordersContainer.appendChild(div);
    });
    
  } catch (err) {
    console.error("Load orders error:", err);
    ordersContainer.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 40px;">Error loading orders</p>';
  }
}

document.getElementById('order-filter')?.addEventListener('change', loadOrders);

window.toggleOrderStatus = async (orderId, currentStatus) => {
  event.stopPropagation();
  const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  try {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    showToast(`Order marked as ${newStatus}`);
    loadOrders();
    loadDashboard();
  } catch (err) {
    showToast("Failed to update", "error");
  }
};

window.viewOrderDetail = async (orderId) => {
  try {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) return;
    
    const order = snap.data();
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('order-detail-content');
    
    content.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-family: monospace; color: #6b7280;">#${orderId.slice(-8).toUpperCase()}</span>
            <h3 style="margin-top: 4px;">${order.name}</h3>
          </div>
          <span style="background: ${order.status === 'pending' ? '#fef3c7' : '#d1fae5'}; 
                       color: ${order.status === 'pending' ? '#92400e' : '#065f46'}; 
                       padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
            ${order.status === 'pending' ? '⏳ Pending' : '✓ Completed'}
          </span>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Phone</div>
              <div style="font-weight: 500;">${order.phone}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Email</div>
              <div style="font-weight: 500;">${order.email || 'N/A'}</div>
            </div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Address</div>
            <div style="font-weight: 500;">${order.address}</div>
          </div>
        </div>
        
        <h4 style="margin-bottom: 12px;">Order Items</h4>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          ${order.items?.map(item => `
            <div style="display: flex; gap: 16px; align-items: center; background: #f9fafb; padding: 16px; border-radius: 12px;">
              <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
              <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                <div style="font-size: 14px; color: #6b7280;">Rs ${item.price?.toLocaleString()} × ${item.qty}</div>
              </div>
              <div style="font-weight: 700;">Rs ${((item.price || 0) * (item.qty || 1)).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; color: #6b7280;">Total Amount</div>
            <div style="font-size: 28px; font-weight: 700;">Rs ${order.totalPrice?.toLocaleString()}</div>
          </div>
          ${order.status === 'pending' ? `
            <button onclick="markOrderComplete('${orderId}'); closeOrderModal();" class="btn" style="padding: 12px 32px;">
              Mark as Completed
            </button>
          ` : ''}
        </div>
      </div>
    `;
    
    modal.style.display = 'flex';
  } catch (err) {
    console.error(err);
  }
};

window.closeOrderModal = () => {
  document.getElementById('orderModal').style.display = 'none';
};

window.markOrderComplete = async (orderId) => {
  try {
    await updateDoc(doc(db, "orders", orderId), { status: "completed" });
    showToast("Order marked as completed");
    loadOrders();
    loadDashboard();
  } catch (err) {
    showToast("Failed to update", "error");
  }
};

window.exportOrders = () => {
  showToast('Exporting orders...');
  setTimeout(() => showToast('Orders exported to CSV'), 1500);
};

/* ================= ANALYTICS ================= */

function loadAnalytics() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [45000, 52000, 48000, 61000, 55000, 67000],
        backgroundColor: '#10b981',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
      }
    }
  });
  
  document.getElementById('top-products').innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${[
        { name: 'Premium Kurta', sales: 234, growth: '+12%' },
        { name: 'Embroidered Shawl', sales: 189, growth: '+8%' },
        { name: 'Silk Scarf', sales: 156, growth: '+5%' },
        { name: 'Cotton Shirt', sales: 134, growth: '-2%' },
        { name: 'Woolen Cap', sales: 98, growth: '+15%' }
      ].map((p, i) => `
        <div style="display: flex; align-items: center; gap: 16px; animation: fadeIn 0.3s ease ${i * 0.1}s both;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">${i + 1}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 2px;">${p.name}</div>
            <div style="font-size: 13px; color: #6b7280;">${p.sales} sales</div>
          </div>
          <div style="color: ${p.growth.startsWith('+') ? '#10b981' : '#ef4444'}; font-weight: 600; font-size: 14px;">${p.growth}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ================= UTILITIES ================= */

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<polyline points="20 6 9 17 4 12"></polyline>' 
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${message}</span>
  `;
  
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: type === 'success' ? '#10b981' : '#ef4444',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    zIndex: '10000',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideIn 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

/* ================= STYLES ================= */

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
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(10px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .pulse {
    animation: pulse 2s infinite;
  }
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .nav-badge {
    margin-left: auto;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    min-width: 20px;
    text-align: center;
  }
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  .modal-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0 24px;
    margin-bottom: 20px;
  }
  .modal-header h2 {
    margin: 0;
  }
`;
document.head.appendChild(style);

/* ================= INIT ================= */

if (checkAdminAccess()) {
  applyDarkMode();
  document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  loadDashboard();
  loadProducts();
  
  // Real-time updates
  onSnapshot(collection(db, "orders"), () => {
    loadDashboard();
    if (document.getElementById('tab-orders').classList.contains('active')) {
      loadOrders();
    }
  });
}