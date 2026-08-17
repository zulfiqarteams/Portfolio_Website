import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCartCount } from "./cart_Helper.js";
import { requireAuth } from "./auth.js";

requireAuth({ onReady: () => {} });

const container = document.getElementById("orders-list");
const noOrders = document.getElementById("no-orders");

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

async function loadOrders() {
  updateCartBadge();
  
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.email) {
      noOrders.classList.remove("hidden");
      container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 40px;">Please log in to view your orders</p>';
      return;
    }
    
    // FIX: Query without orderBy first, then sort client-side
    // This avoids needing a composite index in Firebase
    const q = query(
      collection(db, "orders"),
      where("userEmail", "==", currentUser.email)
    );
    
    const snap = await getDocs(q);
    
    container.innerHTML = "";
    
    if (snap.empty) {
      noOrders.classList.remove("hidden");
      return;
    }
    
    noOrders.classList.add("hidden");
    
    // Convert to array and sort client-side by createdAt
    let orders = [];
    snap.forEach((d) => {
      orders.push({ id: d.id, ...d.data() });
    });
    
    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });
    
    orders.forEach((order) => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A';
      
      const div = document.createElement("div");
      div.style.cssText = "background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 16px;";
      
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Order Date</div>
            <div style="font-weight: 600;">${date}</div>
          </div>
          <span style="background: ${order.status === 'pending' ? '#fef3c7' : '#d1fae5'}; 
                       color: ${order.status === 'pending' ? '#92400e' : '#065f46'}; 
                       padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: capitalize;">
            ${order.status || 'Pending'}
          </span>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
          ${order.items ? order.items.map(item => `
            <div style="display: flex; gap: 16px; margin-bottom: 12px; align-items: center;">
              <img src="${item.image || 'https://via.placeholder.com/60?text=No+Image'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
              <div style="flex: 1;">
                <div style="font-weight: 500; margin-bottom: 2px;">${item.name}</div>
                <div style="font-size: 14px; color: #6b7280;">Rs ${item.price?.toLocaleString()} × ${item.qty}</div>
              </div>
              <div style="font-weight: 600;">Rs ${((item.price || 0) * (item.qty || 1)).toLocaleString()}</div>
            </div>
          `).join('') : '<p style="color: #6b7280;">No items in this order</p>'}
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; color: #6b7280;">Total Amount</div>
            <div style="font-size: 20px; font-weight: 700; color: #111827;">Rs ${order.totalPrice?.toLocaleString() || '0'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #6b7280;">${order.name || 'N/A'}</div>
            <div style="font-size: 13px; color: #9ca3af;">${order.phone || 'N/A'}</div>
          </div>
        </div>
      `;
      
      container.appendChild(div);
    });
    
  } catch (err) {
    console.error("Load orders error:", err);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="margin: 0 auto 16px; display: block;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="color: #ef4444; font-weight: 500; margin-bottom: 8px;">Error loading orders</p>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">${err.message || 'Please check your connection and try again.'}</p>
        <button onclick="location.reload()" class="btn" style="padding: 8px 24px; font-size: 14px;">Retry</button>
      </div>
    `;
  }
}

loadOrders();