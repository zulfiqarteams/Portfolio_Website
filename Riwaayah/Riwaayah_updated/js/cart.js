import { getCart, removeFromCart, updateQuantity, showToast, getCartCount } from "./cart_Helper.js";
import { requireAuth } from "./auth.js";

// Re-verify against the live Firebase session (catches a stale
// 'logged in' flag left over in localStorage after a session expires).
requireAuth({ onReady: () => {} });

const container = document.getElementById("cart-items");
const emptyMessage = document.getElementById("cart-empty");
const totalSection = document.getElementById("cart-total-section");
const totalDisplay = document.getElementById("cart-total");

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function renderCart() {
  const cart = getCart();
  
  updateCartBadge();

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyMessage.classList.remove("hidden");
    totalSection.classList.add("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");
  totalSection.classList.remove("hidden");

  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/100?text=No+Image'}" 
           alt="${item.name}"
           onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
      
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
        <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
          Rs ${item.price?.toLocaleString()} each
        </div>
        
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="qty-control">
            <button class="qty-btn" data-id="${item.id}" data-action="decrease">−</button>
            <span class="qty-display">${item.qty || 1}</span>
            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
          </div>
          
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
      
      <div style="font-weight: 700; font-size: 16px; min-width: 100px; text-align: right;">
        Rs ${itemTotal.toLocaleString()}
      </div>
    `;

    container.appendChild(div);
  });

  totalDisplay.textContent = `Rs ${total.toLocaleString()}`;

  // Quantity buttons
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      const currentQty = getCart().find(item => item.id === id)?.qty || 1;
      
      if (action === "increase") {
        updateQuantity(id, currentQty + 1);
      } else {
        if (currentQty > 1) {
          updateQuantity(id, currentQty - 1);
        }
      }
      renderCart();
    });
  });

  // Remove buttons
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      removeFromCart(id);
      showToast("Item removed from cart");
      renderCart();
    });
  });
}

renderCart();