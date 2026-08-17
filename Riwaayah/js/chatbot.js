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

const CONTACT_INFO = {
  whatsapp: "+92 317 0701404",
  whatsappLink: "https://wa.me/923170701404",
  instagram: "https://www.instagram.com/riwaayat_collections",
  tiktok: "https://www.tiktok.com/@riwaayat_collections"
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

function newArrivalsReply() {
  if (!allProducts.length) return "Abhi tak koi naya product available nahi hai.";
  // allProducts is already fetched newest-first (same Firestore order used
  // for the homepage's "Newest First" sort), so no re-sorting needed here.
  return "Yeh hain hamare naye arrivals:" + productListReply(allProducts, "new arrival");
}

function reviewsReply() {
  return "Hamare customers ko premium quality aur perfect fitting bohat pasand aati hai — humein consistently 5-star reviews milte hain! Neeche 'Customer Reviews' section mein aap unki asli feedback parh sakte hain.";
}

function contactReply() {
  return `
    <div class="chatbot-dev-card">
      Hum se contact karein:<br>
      💬 <a href="${CONTACT_INFO.whatsappLink}" target="_blank" rel="noopener">WhatsApp: ${CONTACT_INFO.whatsapp}</a><br>
      📷 <a href="${CONTACT_INFO.instagram}" target="_blank" rel="noopener">Instagram</a> ·
      <a href="${CONTACT_INFO.tiktok}" target="_blank" rel="noopener">TikTok</a>
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

  // New Arrivals (e.g. clicking the "New Arrivals" heading)
  if (/new\s*arrival/.test(lower)) {
    return newArrivalsReply();
  }

  // Reviews (e.g. clicking the "Customer Reviews" heading)
  if (/^reviews?$/.test(lower) || /customer\s*review/.test(lower)) {
    return reviewsReply();
  }

  // Contact (e.g. clicking the "Contact Us" heading)
  if (/^contact(\s*us)?$/.test(lower)) {
    return contactReply();
  }

  // Categories
  if (/categor/.test(lower)) {
    return categoryListReply();
  }

  // Product-specific match by name
  if (productsLoaded) {
    // Exact category match (e.g. clicking a category badge on a product card)
    const categoryMatch = allProducts.find(p => p.category && p.category.toLowerCase() === lower);
    if (categoryMatch) {
      const inCategory = allProducts.filter(p => p.category && p.category.toLowerCase() === lower);
      return `<strong>${escapeHtml(categoryMatch.category)}</strong> mein yeh products hain:` + productListReply(inCategory, text);
    }

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

// Widget DOM refs, filled in by buildWidget() once the panel exists.
// Kept at module scope (rather than inside buildWidget) so askChatbot()
// and the global API below can reach them.
let wrapEl, panelEl, messagesEl, inputEl, toggleBtnEl;
let greeted = false;

function addMessage(html, from) {
  const bubble = document.createElement("div");
  bubble.className = `chatbot-bubble chatbot-${from}`;
  bubble.innerHTML = html;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function openChatbot() {
  if (!panelEl.hidden) return; // already open
  panelEl.hidden = false;
  wrapEl.classList.add("chatbot-open");
  if (!greeted) {
    greeted = true;
    addMessage("Assalam-o-Alaikum! Main aapki kis tarah madad kar sakta hoon? (product, price, stock, ya 'yeh website kisne banayi' puch sakte hain)", "bot");
    loadProductsForBot();
  }
  inputEl.focus();
}

function closeChatbot() {
  panelEl.hidden = true;
  wrapEl.classList.remove("chatbot-open");
}

// Sends text to the bot as if the user typed and submitted it, opening
// the panel first if needed. This is the single entry point used by both
// the chat input form and any clickable page content (see the
// [data-chat-ask] delegation below), so there is only one chatbot pipeline.
function askChatbot(text) {
  const val = String(text || "").trim();
  if (!val) return;
  openChatbot();
  addMessage(escapeHtml(val), "user");
  setTimeout(() => addMessage(getReply(val), "bot"), 200);
}

// Public API so other scripts / inline handlers on any page can turn
// meaningful content (headings, cards, category badges, buttons, etc.)
// into chatbot prompts without duplicating chatbot logic.
window.riwayatChatbotAsk = askChatbot;

// Delegated click handler: any element marked data-chat-ask="..." becomes
// a chatbot prompt trigger. If the attribute value is empty, the element's
// own text is used instead (e.g. data-chat-ask="" on a heading).
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-chat-ask]");
  if (!trigger) return;
  const prompt = trigger.getAttribute("data-chat-ask") || trigger.textContent;
  askChatbot(prompt);
});

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

  wrapEl = wrap;
  toggleBtnEl = wrap.querySelector("#chatbot-toggle-btn");
  panelEl = wrap.querySelector("#chatbot-panel");
  messagesEl = wrap.querySelector("#chatbot-messages");
  inputEl = wrap.querySelector("#chatbot-input");
  const form = wrap.querySelector("#chatbot-form");

  toggleBtnEl.addEventListener("click", () => {
    if (panelEl.hidden) {
      openChatbot();
    } else {
      closeChatbot();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = inputEl.value;
    inputEl.value = "";
    askChatbot(val);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildWidget);
} else {
  buildWidget();
}
