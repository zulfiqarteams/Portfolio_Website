import { db } from "./firebase.js";
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCart, getCartTotal, clearCart, getCartCount, showToast } from "./cart_Helper.js";

const form = document.getElementById("checkout-form");
const orderItemsContainer = document.getElementById("order-items");
const subtotalDisplay = document.getElementById("subtotal");
const totalDisplay = document.getElementById("total-price");
const successModal = document.getElementById("success-modal");

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function renderOrderSummary() {
  const cart = getCart();
  updateCartBadge();

  if (cart.length === 0) {
    orderItemsContainer.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">Your cart is empty</p>';
    subtotalDisplay.textContent = "Rs 0";
    totalDisplay.textContent = "Rs 0";
    return;
  }

  orderItemsContainer.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    subtotal += itemTotal;

    orderItemsContainer.innerHTML += `
      <div style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
        <img src="${item.image || 'https://via.placeholder.com/50?text=No+Image'}" 
             style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: 500;">${item.name}</div>
          <div style="font-size: 13px; color: #6b7280;">Rs ${item.price?.toLocaleString()} × ${item.qty}</div>
        </div>
        <div style="font-weight: 600; font-size: 14px;">Rs ${itemTotal.toLocaleString()}</div>
      </div>
    `;
  });

  subtotalDisplay.textContent = `Rs ${subtotal.toLocaleString()}`;
  totalDisplay.textContent = `Rs ${subtotal.toLocaleString()}`;
}

function validateForm() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const postal = document.getElementById("postal").value.trim();

  if (!name || !phone || !address || !city || !postal) {
    showToast("Please fill in all required fields", "error");
    return false;
  }

  // Phone validation (Pakistani format)
  const phoneRegex = /^03\d{2}-?\d{7}$/;
  if (!phoneRegex.test(phone.replace(/-/g, ""))) {
    showToast("Please enter a valid phone number", "error");
    return false;
  }

  return true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const cart = getCart();
  if (cart.length === 0) {
    showToast("Your cart is empty", "error");
    return;
  }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  const order = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    userEmail: currentUser ? currentUser.email : document.getElementById("email").value.trim(),
    address: `${document.getElementById("address").value.trim()}, ${document.getElementById("city").value.trim()}, ${document.getElementById("postal").value.trim()}`,
    payment: document.getElementById("payment").value,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty || 1,
      image: item.image
    })),
    totalPrice: getCartTotal(),
    status: "pending",
    createdAt: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "orders"), order);
    
    clearCart();
    updateCartBadge();
    
    // Show success modal
    successModal.style.display = "flex";

  } catch (err) {
    console.error("Checkout error:", err);
    showToast("Failed to place order. Please try again.", "error");
  }
});

// Close modal on outside click
successModal.addEventListener("click", (e) => {
  if (e.target === successModal) {
    successModal.style.display = "none";
  }
});

renderOrderSummary();