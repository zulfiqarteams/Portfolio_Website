/* =========================
   CART HELPER FUNCTIONS
   Core utilities for cart, wishlist, and UI
========================= */

/* ================= CART ================= */

export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  // Sync across tabs
  window.dispatchEvent(new StorageEvent("storage", { key: "cart" }));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      qty: 1
    });
  }

  saveCart(cart);
  showToast("Added to cart");
}

export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

export function updateQuantity(productId, qty) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      item.qty = qty;
      saveCart(cart);
    }
  }
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);
}

export function clearCart() {
  localStorage.removeItem("cart");
  window.dispatchEvent(new StorageEvent("storage", { key: "cart" }));
}

/* ================= WISHLIST ================= */

export function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

export function saveWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

export function addToWishlist(product) {
  const wishlist = getWishlist();
  
  if (!wishlist.find(item => item.id === product.id)) {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
    saveWishlist(wishlist);
    showToast("Added to wishlist");
  }
}

export function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(item => item.id !== productId);
  saveWishlist(wishlist);
}

export function isInWishlist(productId) {
  return getWishlist().some(item => item.id === productId);
}

/* ================= TOAST NOTIFICATIONS ================= */

export function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  const icon = type === 'success' 
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

  toast.innerHTML = `
    ${icon}
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px; padding: 0; margin-left: 8px;">×</button>
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
    fontWeight: '500',
    maxWidth: '400px',
    lineHeight: '1.4'
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

/* ================= ANIMATIONS ================= */

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
`;
document.head.appendChild(style);