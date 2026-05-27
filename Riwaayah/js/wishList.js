import { addToCart, removeFromWishlist, showToast, getCartCount, isInWishlist } from "./cart_Helper.js";

const container = document.getElementById("wishlist-items");
const emptyMessage = document.getElementById("empty-wishlist");

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function renderWishlist() {
  updateCartBadge();
  
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (wishlist.length === 0) {
    container.innerHTML = "";
    emptyMessage.classList.remove("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");
  container.innerHTML = "";

  wishlist.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animation = "fadeIn 0.5s ease";
    
    card.innerHTML = `
      <div style="position: relative; overflow: hidden;">
        <img src="${item.image || 'https://via.placeholder.com/400x400?text=No+Image'}" 
             alt="${item.name}"
             style="width: 100%; height: 280px; object-fit: cover; transition: transform 0.3s ease;"
             onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
      </div>
      
      <div class="card-body">
        <div class="card-title">${item.name}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div class="card-price">Rs ${item.price?.toLocaleString() || item.price}</div>
          ${item.category ? `<span style="font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 4px 10px; border-radius: 20px;">${item.category}</span>` : ''}
        </div>
        
        <div style="display: flex; gap: 8px;">
          <button class="btn add-to-cart-btn" data-id="${item.id}" style="flex: 1;">
            Add to Cart
          </button>
          <button class="btn remove-btn" data-id="${item.id}" style="flex: 1; background: #ef4444;">
            Remove
          </button>
        </div>
      </div>
    `;

    // Add to cart
    card.querySelector(".add-to-cart-btn").addEventListener("click", () => {
      addToCart(item);
      updateCartBadge();
      showToast("Added to cart");
    });

    // Remove from wishlist
    card.querySelector(".remove-btn").addEventListener("click", () => {
      removeFromWishlist(item.id);
      showToast("Removed from wishlist");
      renderWishlist();
    });

    container.appendChild(card);
  });
}

renderWishlist();