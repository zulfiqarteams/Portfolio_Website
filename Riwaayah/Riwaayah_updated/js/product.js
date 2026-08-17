import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { addToCart, addToWishlist, isInWishlist, removeFromWishlist, showToast, getCartCount } from "./cart_Helper.js";

const container = document.getElementById("product-detail");
const id = new URLSearchParams(window.location.search).get("id");

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function loadImage(imgElement, src) {
  const wrapper = imgElement.closest('.image-wrapper');
  
  const tempImg = new Image();
  
  tempImg.onload = () => {
    imgElement.src = src;
    imgElement.style.opacity = '1';
    if (wrapper) wrapper.classList.add('loaded');
  };
  
  tempImg.onerror = () => {
    imgElement.src = 'https://via.placeholder.com/600x600?text=No+Image';
    imgElement.style.opacity = '1';
    if (wrapper) wrapper.classList.add('loaded');
  };
  
  tempImg.src = src;
}

async function loadProduct() {
  if (!id) {
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom: 24px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2 style="margin-bottom: 12px; color: #374151;">Product Not Found</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">The product you are looking for does not exist.</p>
        <a href="index.html" class="btn" style="text-decoration: none;">Browse Products</a>
      </div>
    `;
    return;
  }

  // Show skeleton while loading
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;">
      <div class="image-wrapper" style="border-radius: 16px; overflow: hidden; background: #f3f4f6; min-height: 400px;">
        <div class="skeleton fast-skeleton" style="height: 500px;"></div>
      </div>
      <div>
        <div class="skeleton fast-skeleton" style="height: 20px; width: 30%; margin-bottom: 16px;"></div>
        <div class="skeleton fast-skeleton" style="height: 40px; width: 80%; margin-bottom: 24px;"></div>
        <div class="skeleton fast-skeleton" style="height: 32px; width: 40%; margin-bottom: 24px;"></div>
        <div class="skeleton fast-skeleton" style="height: 80px; width: 100%; margin-bottom: 24px;"></div>
        <div class="skeleton fast-skeleton" style="height: 48px; width: 60%;"></div>
      </div>
    </div>
  `;

  try {
    const snap = await getDoc(doc(db, "products", id));

    if (!snap.exists()) {
      container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom: 24px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 style="margin-bottom: 12px; color: #374151;">Product Not Found</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">This product may have been removed or is no longer available.</p>
          <a href="index.html" class="btn" style="text-decoration: none;">Browse Products</a>
        </div>
      `;
      return;
    }

    const product = { id: snap.id, ...snap.data() };
    const inWishlist = isInWishlist(product.id);

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;">
        
        <div class="image-wrapper" style="position: relative; border-radius: 16px; overflow: hidden; background: #f9fafb; min-height: 400px;">
          <img id="product-image" 
               alt="${product.name}"
               style="width: 100%; height: auto; display: block; opacity: 0; transition: opacity 0.4s ease;"
               src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
          
          ${product.sizes && product.sizes.length > 0 ? `
            <div style="position: absolute; bottom: 20px; left: 20px; display: flex; gap: 8px;">
              ${product.sizes.map(size => `
                <span style="background: rgba(255,255,255,0.95); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">${size}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div style="padding-top: 8px;">
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${product.category || 'Uncategorized'}</span>
          </div>
          
          <h1 style="font-size: 36px; font-weight: 700; margin-bottom: 20px; color: #111827; line-height: 1.2;">${product.name}</h1>
          
          <div style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 24px;">
            Rs ${product.price?.toLocaleString() || product.price}
          </div>
          
          ${product.stock !== undefined ? `
            <div style="margin-bottom: 28px; padding: 14px 18px; background: ${product.stock > 0 ? '#d1fae5' : '#fee2e2'}; 
                        border-radius: 10px; border-left: 4px solid ${product.stock > 0 ? '#10b981' : '#ef4444'}; display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${product.stock > 0 ? '#059669' : '#dc2626'}" stroke-width="2">
                ${product.stock > 0 
                  ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                  : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'}
              </svg>
              <div>
                <strong style="color: ${product.stock > 0 ? '#065f46' : '#991b1b'}; font-size: 15px;">
                  ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </strong>
                <span style="font-size: 14px; color: #6b7280; margin-left: 8px;">${product.stock} units available</span>
              </div>
            </div>
          ` : ''}
          
          ${product.description ? `
            <div style="margin-bottom: 28px; color: #4b5563; line-height: 1.7; font-size: 15px;">
              ${product.description}
            </div>
          ` : ''}
          
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <button id="addBtn" class="btn" style="flex: 1; padding: 16px 24px; font-size: 16px; ${product.stock === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button id="wishlistBtn" class="btn" style="width: 56px; height: 56px; padding: 0; background: ${inWishlist ? '#ef4444' : 'var(--bg-dark)'}; color: ${inWishlist ? 'white' : 'var(--text-secondary)'}; border-radius: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" 
                   stroke="currentColor" stroke-width="2" style="margin: 0 auto; display: block;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
          
          <a href="cart.html" class="btn" style="background: transparent; color: #111827; border: 2px solid #e5e7eb; text-decoration: none; text-align: center; width: 100%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            View Cart
          </a>
        </div>
        
      </div>
    `;

    // Load image
    const productImage = document.getElementById('product-image');
    if (productImage) {
      loadImage(productImage, product.image || 'https://via.placeholder.com/600x600?text=No+Image');
    }

    // Add to cart
    document.getElementById("addBtn").addEventListener("click", () => {
      if (product.stock === 0) {
        showToast("Sorry, this item is out of stock", "error");
        return;
      }
      addToCart(product);
      updateCartBadge();
    });

    // Wishlist toggle
    document.getElementById("wishlistBtn").addEventListener("click", function() {
      const btn = this;
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        btn.style.background = 'var(--bg-dark)';
        btn.style.color = 'var(--text-secondary)';
        btn.querySelector('svg').setAttribute('fill', 'none');
      } else {
        addToWishlist(product);
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
      }
    });

  } catch (err) {
    console.error("Load product error:", err);
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin-bottom: 24px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2 style="margin-bottom: 12px; color: #374151;">Something Went Wrong</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Failed to load product details. Please try again.</p>
        <button onclick="location.reload()" class="btn">Retry</button>
        <a href="index.html" class="btn" style="background: #f3f4f6; color: #374151; margin-left: 12px; text-decoration: none;">Go Home</a>
      </div>
    `;
  }
}

// Initialize
updateCartBadge();
loadProduct();