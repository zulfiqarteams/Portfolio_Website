/* =========================================================
   RIWAYAT CHATBOT — floating widget, loaded on every page.
   Rule-based only (no external AI API). Reads live product
   data from Firestore (same "products" collection/cache key
   used by app.js) to answer product questions, and answers
   "who made this website" with a fixed developer credit.
========================================================= */
import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const PRODUCTS_CACHE_KEY = "riwayat_products_cache_v1";
const PRODUCTS_CACHE_TTL_MS = 3 * 60 * 1000;

const DEVELOPER_INFO = {
  name: "Zulfiqar",
  title: "Full Stack Developer | MERN Stack Specialist",
  location: "Jalapur Road, Hafizabad",
  email: "zulfiqarteams@gmail.com",
  whatsapp: "+92 313 6473895",
  whatsappLink: "https://wa.me/+923136473895",
  linkedin: "https://www.linkedin.com/in/zulfiqarteams",
  github: "https://github.com/zulfiqarteams",
  portfolio: "https://zulfiqarteams.github.io/Portfolio_Website/"
};

let allProducts = [];
let productsLoaded = false;

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

async function loadProductsForBot() {
  const cached = readProductsCache();
  if (cached) {
    allProducts = cached;
    productsLoaded = true;
    return;
  }
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const products = [];
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    allProducts = products;
    productsLoaded = true;
  } catch (e) {
    productsLoaded = false;
  }
}

function money(n) {
  const num = Number(n);
  return isNaN(num) ? n : `Rs. ${num.toLocaleString()}`;
}

function findProductsByName(text) {
  const t = text.toLowerCase();
  return allProducts.filter(p => p.name && t.includes(p.name.toLowerCase()));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function developerReply() {
  return `
    <div class="chatbot-dev-card">
      <strong>${DEVELOPER_INFO.name}</strong> — ${DEVELOPER_INFO.title}<br>
      📍 ${DEVELOPER_INFO.location}<br>
      📧 <a href="mailto:${DEVELOPER_INFO.email}" target="_blank" rel="noopener">${DEVELOPER_INFO.email}</a><br>
      💬 <a href="${DEVELOPER_INFO.whatsappLink}" target="_blank" rel="noopener">${DEVELOPER_INFO.whatsapp}</a><br>
      🔗 <a href="${DEVELOPER_INFO.linkedin}" target="_blank" rel="noopener">LinkedIn</a> ·
      <a href="${DEVELOPER_INFO.github}" target="_blank" rel="noopener">GitHub</a> ·
      <a href="${DEVELOPER_INFO.portfolio}" target="_blank" rel="noopener">Portfolio</a>
    </div>`;
}

function productListReply(products, question) {
  const lower = question.toLowerCase();
  const wantsPrice = /price|qeemat|keemat|kitne|cost/.test(lower);
  const wantsStock = /stock|available|mojood|kitna bacha/.test(lower);
  const wantsSizes = /size/.test(lower);

  return products.slice(0, 5).map(p => {
    let line = `<strong>${escapeHtml(p.name)}</strong>`;
    if (wantsPrice || (!wantsStock && !wantsSizes)) line += ` — ${money(p.price)}`;
    if (wantsStock) line += ` · Stock: ${p.stock ?? "N/A"}`;
    if (wantsSizes && p.sizes) line += ` · Sizes: ${Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes}`;
    if (p.category) line += ` · <em>${escapeHtml(p.category)}</em>`;
    return `<div class="chatbot-product-line">${line}</div>`;
  }).join("");
}

function categoryListReply() {
  const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  if (!cats.length) return "Abhi tak koi category mojood nahi hai.";
  return "Available categories: " + cats.map(c => `<strong>${escapeHtml(c)}</strong>`).join(", ");
}

function helpReply() {
  return `Main in cheezon mein madad kar sakta hoon:
    <ul class="chatbot-help-list">
      <li>Kisi product ka price, stock ya sizes puchein (naam ke saath)</li>
      <li>Available categories dekhein</li>
      <li>"Yeh website kisne banayi?" puchein</li>
    </ul>`;
}

function getReply(rawText) {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  if (!text) return "Kuch likh kar poochein, main madad karne ki koshish karunga.";

  // Developer / who made this site
  if (/kisne\s*bana|kis\s*ne\s*bana|who\s*(made|built|created|developed)|developer|made\s*(this\s*)?(website|site)|site\s*kisne/.test(lower)) {
    return developerReply();
  }

  // Greeting
  if (/^(hi|hello|hey|salam|assalam|asalam|aoa)\b/.test(lower)) {
    return "Assalam-o-Alaikum! Riwayat Collections mein khush aamdeed. Aap product ka naam, price, stock ya sizes puch sakte hain.";
  }

  // Help
  if (/help|madad|kya kar sakte/.test(lower)) {
    return helpReply();
  }

  // Categories
  if (/categor/.test(lower)) {
    return categoryListReply();
  }

  // Product-specific match by name
  if (productsLoaded) {
    const matches = findProductsByName(text);
    if (matches.length) return productListReply(matches, text);

    // General price/stock question without a specific product name
    if (/price|qeemat|keemat/.test(lower)) {
      return "Kis product ka price janna chahte hain? Product ka naam bhi likh dein.";
    }
    if (/stock|available|mojood/.test(lower)) {
      return "Kis product ka stock check karna hai? Product ka naam bhi likh dein.";
    }
  } else {
    return "Product data load ho raha hai, thori dair mein dobara try karein.";
  }

  return "Maazrat, yeh samajh nahi aaya. Aap product ka naam, price, stock, sizes ya categories puch sakte hain — ya 'help' likhein.";
}

/* ---------------- UI ---------------- */

function buildWidget() {
  const wrap = document.createElement("div");
  wrap.id = "riwayat-chatbot";
  wrap.innerHTML = `
    <button id="chatbot-toggle-btn" type="button" aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chatbot-icon-chat"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chatbot-icon-close"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
    <div id="chatbot-panel" class="chatbot-panel" hidden>
      <div class="chatbot-header">
        <span>Riwayat Assistant</span>
      </div>
      <div id="chatbot-messages" class="chatbot-messages"></div>
      <form id="chatbot-form" class="chatbot-form">
        <input id="chatbot-input" type="text" placeholder="Apna sawal likhein..." autocomplete="off">
        <button type="submit" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>`;
  document.body.appendChild(wrap);

  const toggleBtn = wrap.querySelector("#chatbot-toggle-btn");
  const panel = wrap.querySelector("#chatbot-panel");
  const messages = wrap.querySelector("#chatbot-messages");
  const form = wrap.querySelector("#chatbot-form");
  const input = wrap.querySelector("#chatbot-input");

  function addMessage(html, from) {
    const bubble = document.createElement("div");
    bubble.className = `chatbot-bubble chatbot-${from}`;
    bubble.innerHTML = html;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  let greeted = false;
  toggleBtn.addEventListener("click", () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    wrap.classList.toggle("chatbot-open", !isOpen);
    if (!isOpen && !greeted) {
      greeted = true;
      addMessage("Assalam-o-Alaikum! Main aapki kis tarah madad kar sakta hoon? (product, price, stock, ya 'yeh website kisne banayi' puch sakte hain)", "bot");
      loadProductsForBot();
    }
    if (!isOpen) input.focus();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value;
    if (!val.trim()) return;
    addMessage(escapeHtml(val), "user");
    input.value = "";
    setTimeout(() => addMessage(getReply(val), "bot"), 200);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildWidget);
} else {
  buildWidget();
}
