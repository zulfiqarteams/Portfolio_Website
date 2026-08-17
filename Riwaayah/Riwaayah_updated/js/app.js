import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { addToCart, addToWishlist, isInWishlist, showToast, getCartCount } from "./cart_Helper.js";

const container = document.getElementById("product-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");

let allProducts = [];
let filteredProducts = [];

// Update cart badge
function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

// Initial badge update
updateCartBadge();

// Image loading helper
function createOptimizedImage(src, alt, className = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'image-wrapper';
  wrapper.style.cssText = 'position: relative; overflow: hidden; background: #f3f4f6;';
  
  const img = document.createElement('img');
  img.alt = alt;
  img.className = className;
  img.style.cssText = 'width: 100%; height: 280px; object-fit: cover; opacity: 0; transition: opacity 0.3s ease;';
  
  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(img, src, wrapper);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    imageObserver.observe(wrapper);
  } else {
    // Fallback for older browsers
    loadImage(img, src, wrapper);
  }
  
  wrapper.appendChild(img);
  return wrapper;
}

function loadImage(img, src, wrapper) {
  const tempImg = new Image();
  
  tempImg.onload = () => {
    img.src = src;
    img.style.opacity = '1';
    wrapper.classList.add('loaded');
    
    // Add hover effect after load
    img.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
    img.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
  };
  
  tempImg.onerror = () => {
    img.src = 'https://via.placeholder.com/400x400?text=No+Image';
    img.style.opacity = '1';
    wrapper.classList.add('loaded');
  };
  
  tempImg.src = src;
}

// Simple sessionStorage cache so repeat visits/back-navigation
// don't re-pay the full Firestore round trip. Short TTL keeps
// data fresh while making the common case feel instant.
const PRODUCTS_CACHE_KEY = "riwayat_products_cache_v1";
const PRODUCTS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

function readProductsCache() {
  try {
    const raw = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const { savedAt, products } = JSON.parse(raw);
    if (!products || Date.now() - savedAt > PRODUCTS_CACHE_TTL_MS) return null;
    return products;
  } catch (e) {
    return null;
  }
}

function writeProductsCache(products) {
  try {
    sessionStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), products }));
  } catch (e) {
    // sessionStorage full/unavailable - fail silently, caching is an optimization only
  }
}

async function fetchProductsFromFirestore() {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50));
  const snapshot = await getDocs(q);
  const products = [];
  snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
  return products;
}

async function loadProducts() {
  try {
    const cached = readProductsCache();

    if (cached) {
      // Instant paint from cache - no skeleton needed
      allProducts = cached;
      filteredProducts = [...allProducts];
      populateCategories();
      renderProducts();

      // Quietly refresh in the background; re-render only if data changed
      fetchProductsFromFirestore().then(fresh => {
        writeProductsCache(fresh);
        if (JSON.stringify(fresh) !== JSON.stringify(allProducts)) {
          allProducts = fresh;
          filterProducts();
        }
      }).catch(() => {});

      return;
    }

    // No cache - show skeleton while we fetch for the first time
    container.innerHTML = Array(6).fill(`
      <div class="skeleton fast-skeleton" style="height: 380px; border-radius: 16px;">
        <div style="height: 280px; background: linear-gradient(90deg, var(--skeleton-a) 25%, var(--skeleton-b) 50%, var(--skeleton-a) 75%); background-size: 200% 100%; animation: shimmer 0.8s infinite;"></div>
        <div style="padding: 20px;">
          <div style="height: 20px; width: 70%; background: linear-gradient(90deg, var(--skeleton-a) 25%, var(--skeleton-b) 50%, var(--skeleton-a) 75%); background-size: 200% 100%; animation: shimmer 0.8s infinite; margin-bottom: 12px;"></div>
          <div style="height: 20px; width: 40%; background: linear-gradient(90deg, var(--skeleton-a) 25%, var(--skeleton-b) 50%, var(--skeleton-a) 75%); background-size: 200% 100%; animation: shimmer 0.8s infinite;"></div>
        </div>
      </div>
    `).join('');

    allProducts = await fetchProductsFromFirestore();
    writeProductsCache(allProducts);

    filteredProducts = [...allProducts];
    
    // Populate category filter
    populateCategories();
    
    // Render immediately without waiting
    renderProducts();

  } catch (err) {
    console.error("Load products error:", err);
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" style="margin-bottom: 16px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="color: #6b7280; font-size: 18px; font-weight: 500;">Failed to load products</p>
        <p style="color: #9ca3af; margin-top: 8px; margin-bottom: 20px;">Please check your connection and try again</p>
        <button onclick="location.reload()" class="btn" style="width: auto; padding: 10px 32px;">
          Retry
        </button>
      </div>
    `;
  }
}

function populateCategories() {
  if (!categoryFilter) return;
  
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  
  categoryFilter.innerHTML = `
    <option value="">All Categories</option>
    ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
  `;
}

function renderProducts() {
  container.innerHTML = "";

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" style="margin-bottom: 16px;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p style="color: #6b7280; font-size: 18px; font-weight: 500;">No products found</p>
        <p style="color: #9ca3af; margin-top: 8px;">Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }

  filteredProducts.forEach(product => {
    const inWishlist = isInWishlist(product.id);
    
    const card = document.createElement("div");
    card.className = "card";
    card.style.animation = "fadeIn 0.5s ease";
    
    // Create optimized image
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = 'position: relative; overflow: hidden;';
    
    const imgWrapper = createOptimizedImage(
      product.image || 'https://via.placeholder.com/400x400?text=No+Image',
      product.name
    );
    
    imageContainer.appendChild(imgWrapper);

    // Wishlist button
    const wishlistBtn = document.createElement('button');
    wishlistBtn.className = `wishlist-btn ${inWishlist ? 'active' : ''}`;
    wishlistBtn.style.cssText = 'position: absolute; top: 12px; right: 12px; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s; z-index: 2;';
    wishlistBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${inWishlist ? '#ef4444' : 'none'}" 
           stroke="${inWishlist ? '#ef4444' : '#374151'}" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;
    
    wishlistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        wishlistBtn.classList.remove('active');
        wishlistBtn.querySelector('svg').setAttribute('fill', 'none');
        wishlistBtn.querySelector('svg').setAttribute('stroke', '#374151');
      } else {
        addToWishlist(product);
        wishlistBtn.classList.add('active');
        wishlistBtn.querySelector('svg').setAttribute('fill', '#ef4444');
        wishlistBtn.querySelector('svg').setAttribute('stroke', '#ef4444');
      }
    });
    
    imageContainer.appendChild(wishlistBtn);

    // Sizes indicator
    if (product.sizes) {
      const sizesDiv = document.createElement('div');
      sizesDiv.style.cssText = 'position: absolute; bottom: 12px; left: 12px; display: flex; gap: 4px;';
      sizesDiv.innerHTML = product.sizes.map(size => 
        `<span style="background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">${size}</span>`
      ).join('');
      imageContainer.appendChild(sizesDiv);
    }

    card.appendChild(imageContainer);

    // Card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
        <div class="card-title" style="font-size: 15px; line-height: 1.4;">${product.name}</div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="card-price" style="font-size: 18px; font-weight: 700; color: #111827;">
          Rs ${product.price?.toLocaleString() || product.price}
        </div>
        ${product.category ? `<span style="font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 4px 10px; border-radius: 20px; font-weight: 500;">${product.category}</span>` : ''}
      </div>

      <div style="display: flex; gap: 8px;">
        <a href="product.html?id=${product.id}" style="flex: 1; text-decoration: none;">
          <button class="btn" style="background: #f3f4f6; color: #374151; width: 100%;">
            View Details
          </button>
        </a>
        <button class="btn add-to-cart-btn" data-id="${product.id}" style="flex: 1;">
          Add to Cart
        </button>
      </div>
    `;

    // Add to cart functionality
    const addToCartBtn = cardBody.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => {
      addToCart(product);
      updateCartBadge();
    });

    card.appendChild(cardBody);
    container.appendChild(card);
  });
}

function removeFromWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter(item => item.id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  showToast("Removed from wishlist");
}

function filterProducts() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const category = categoryFilter ? categoryFilter.value : '';
  const sort = sortFilter ? sortFilter.value : 'newest';

  filteredProducts = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm);
    
    const matchesCategory = !category || product.category === category;
    
    return matchesSearch && matchesCategory;
  });

  // Sort products
  switch(sort) {
    case 'price-low':
      filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'name-asc':
      filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'newest':
    default:
      break;
  }

  renderProducts();
}

// Event listeners
if (searchInput) {
  searchInput.addEventListener('input', debounce(filterProducts, 300));
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', filterProducts);
}

if (sortFilter) {
  sortFilter.addEventListener('change', filterProducts);
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add fade-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Load products on page load
loadProducts();

// ===========================
// REVIEWS SECTION
// ===========================

const reviews = [
  {
    name: "Ayesha Khan",
    date: "March 2026",
    rating: 5,
    text: "The quality of the clothes is absolutely premium! Every piece I ordered fit perfectly and the traditional designs are exquisite. Highly recommended for anyone who loves authentic fashion.",
    initials: "AK"
  },
  {
    name: "Fatima Ahmed",
    date: "March 2026",
    rating: 5,
    text: "I was blown away by the craftsmanship and attention to detail. The fabric is so soft and comfortable. This is exactly what I was looking for in traditional clothing. Will definitely order again!",
    initials: "FA"
  },
  {
    name: "Hira Malik",
    date: "February 2026",
    rating: 5,
    text: "Best online shopping experience! The delivery was quick and packaging was so elegant. The pieces are even more beautiful in person than in the pictures. Customer service was amazing!",
    initials: "HM"
  },
  {
    name: "Zainab Hassan",
    date: "February 2026",
    rating: 5,
    text: "Riwayat Collections has the most stunning collection I've ever seen. Perfect for weddings and special occasions. The prices are fair for the quality you receive. Absolutely worth it!",
    initials: "ZH"
  },
  {
    name: "Saadia Rana",
    date: "January 2026",
    rating: 5,
    text: "I bought multiple pieces for my wedding season and everything was perfect. The colors are vibrant, the designs are elegant, and the fit is impeccable. This is my go-to store now!",
    initials: "SR"
  },
  {
    name: "Mahnoor Anwar",
    date: "January 2026",
    rating: 5,
    text: "Simply outstanding! The attention to detail in every garment is remarkable. I've recommended this brand to all my friends and family. They have excellent taste and premium quality.",
    initials: "MA"
  }
];

function loadReviews() {
  const reviewsGrid = document.getElementById('reviews-grid');
  
  if (!reviewsGrid) return;

  reviewsGrid.innerHTML = reviews.map((review, index) => `
    <div class="review-card" style="animation: fadeIn 0.5s ease ${index * 0.1}s both;">
      <div class="review-header">
        <div class="review-avatar">${review.initials}</div>
        <div class="review-meta">
          <div class="review-name">${review.name}</div>
          <div class="review-date">${review.date}</div>
        </div>
      </div>
      
      <div class="review-stars">
        ${Array(review.rating).fill(`<svg class="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`).join('')}
      </div>
      
      <p class="review-text">"${review.text}"</p>
      
      <span class="review-verified">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: #10b981;">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
        </svg>
        Verified Purchase
      </span>
    </div>
  `).join('');
}

// Load reviews when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadReviews();
});