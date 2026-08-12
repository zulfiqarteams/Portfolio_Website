/* =========================================================================
   Zulfiqar Portfolio — Personal Chatbot Widget (Free / No API / Vanilla JS)
   =========================================================================
   HOW TO USE:
   1. Copy this file into your project, e.g. /js/chatbot-widget.js
   2. Add this ONE line right before </body> in your index.html:
        <script src="js/chatbot-widget.js"></script>
   3. That's it — no backend, no API key, works on GitHub Pages as-is.

   WHAT'S NEW IN THIS VERSION:
   - Every link-like piece of info (email, WhatsApp, GitHub, LinkedIn, URLs)
     is auto-converted into a real clickable <a> link inside bot replies.
   - Every "sub" piece of info (e.g. just the WhatsApp number, just the
     Python score) can be asked/clicked separately — it no longer only
     shows up bundled inside the full Skills/Contact block.
   - Quick-reply chips are now contextual: tapping "Skills" or "Contact"
     shows a follow-up row of chips for each individual item, with a
     "⬅ Menu" chip to go back.
   - Color theme swapped to the CSS variable palette you provided. The
     widget no longer has its own toggle — it automatically follows the
     host website's light/dark mode (by watching for a `.light-mode`
     class on <html>/<body>, with a `prefers-color-scheme` fallback if
     the site doesn't expose one), and light mode has been tuned for
     better contrast/readability.
   - Fully responsive on mobile: safe-area aware positioning, no iOS
     auto-zoom on the input, and a panel size that adapts to small
     screens.
   - Assistant is now introduced as "Zulfi" (Zulfiqar's portfolio bot).

   HOW TO CUSTOMIZE:
   - Edit the KB (knowledge base) object below to update your info.
   - Edit INTENTS to add more keyword -> answer mappings.
   - Edit CHIP_SETS / CATEGORY_OF to change which quick-reply chips show.
   - Edit the :root / .light-mode block inside the injected <style> to
     change colors (same variable names as your provided theme).
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------- 1. YOUR DATA (edit this) ---------------------- */
  const KB = {
    name: "Zulfiqar",
    assistantName: "Zulfi",
    role: "Full Stack Developer | MERN Stack Specialist",

    about:
      "Zulfiqar is a Full Stack Developer and Computer Science student, skilled in the MERN stack (MongoDB, Express, React, Node.js). He builds responsive, user-focused web apps and is passionate about clean code and continuous learning. He's currently open to remote client opportunities.",

    /* ----- Skills: combined summary + individually askable fields ----- */
    skills:
      "Zulfiqar's core skills: HTML5 (80%), CSS3 (95%), JavaScript (75%), C++ (75%), SQL (87%), Python (70%). He also works with React, Node.js, Git, and RESTful APIs.\n\nAsk me about any single one — e.g. \"python\" or \"css\" — for just that score.",
    skill_html:
      "HTML5 — 80% proficiency. Used to structure every one of Zulfiqar's web projects.",
    skill_css:
      "CSS3 — 95% proficiency. His strongest skill — used for responsive, modern UI design.",
    skill_js:
      "JavaScript — 75% proficiency. Powers interactivity across his apps, including this chatbot widget.",
    skill_cpp:
      "C++ — 75% proficiency. Used for core programming and DSA fundamentals.",
    skill_sql:
      "SQL — 87% proficiency. Used for database design and queries.",
    skill_python:
      "Python — 70% proficiency. Currently being used to learn Machine Learning and build chatbot integrations.",
    skill_react:
      "React — used as the frontend library in Zulfiqar's MERN stack projects (e.g. the E-Commerce Platform).",
    skill_node:
      "Node.js — used for backend/server-side logic in his MERN stack projects.",
    skill_git:
      "Git — used for version control across all of Zulfiqar's projects, hosted on GitHub (github.com/zulfiqarteams).",
    skill_api:
      "RESTful APIs — Zulfiqar designs and consumes REST APIs to connect frontend and backend in his full-stack apps.",

    experience:
      "Timeline:\n• 2025–present: Full Stack Developer, building a MERN business management platform with an admin dashboard.\n• 2025–present: Learning ML with Python, integrating chatbots into websites, and posting YouTube tutorials.\n• 2024: Joined Punjab University for Computer Science, and built this portfolio site.\n• 2023–2025: Website Developer at CISD College — HTML, CSS, JS, basic backend.\n• 2023: WordPress Diploma at Al-Syed Computer College.\n• 2022: Basic computer courses at Standard Computer College.",

    /* ----- Projects: combined summary + individually askable fields ----- */
    projects:
      "Some of Zulfiqar's projects:\n• Weather App — real-time weather via public API\n• Tree Structural Generator (Draughtsman)\n• To-Do List App with local persistence\n• Zulfiqar Restaurant — responsive landing page\n• Riwayaah Clothing — storefront UI\n• Business Management System (MERN, private client project)\n• E-Commerce Platform (MERN, JWT auth, Redux — in progress)\n• Urdu Typing WebApp — RTL keyboard practice\n\nAsk me about one by name (e.g. \"weather app\" or \"restaurant\") for details, or check them all live on GitHub: github.com/zulfiqarteams",
    restaurant_project:
      "Zulfiqar Restaurant is a clean, modern, fully interactive restaurant landing page. Key features: responsive navigation, dynamic menu displays, and sleek UI components designed to maximize engagement.",
    weather_project:
      "The Weather App is a real-time weather tracking app that queries external API data. Key features: dynamic city search, asynchronous data fetching (fetch / async-await), and conditional UI rendering based on current conditions.",
    todo_project:
      "The To-Do List App is a productivity app for robust task management. Key features: persistent data storage, live state updates, filtering options, and an intuitive interface.",
    treebuilder_project:
      "Tree Builder (and its sibling module Riwaayah) are specialized logical/structural mini-apps demonstrating algorithmic thinking, clean DOM manipulation, and structured JavaScript logic.",

    /* ----- Contact: combined summary + individually askable fields ----- */
    contact:
      "You can reach Zulfiqar here:\n• Email: zulfiqarteams@gmail.com\n• WhatsApp: +92 313 6473895\n• Location: Jalapur Road, Hafizabad, Pakistan\n• LinkedIn: linkedin.com/in/zulfiqarteams\n• GitHub: github.com/HamzaSajid-bro\n\nOr ask for just one — e.g. \"whatsapp number\" or \"email\".",
    contact_email: "Email: zulfiqarteams@gmail.com",
    contact_whatsapp: "WhatsApp: +92 313 6473895",
    contact_location: "Location: Jalapur Road, Hafizabad, Pakistan",
    contact_linkedin: "LinkedIn: linkedin.com/in/zulfiqarteams",
    contact_github: "GitHub: github.com/HamzaSajid-bro",

    education:
      "Zulfiqar studied at CISD College and is currently pursuing Computer Science at Punjab University. He also holds a WordPress Diploma from Al-Syed Computer College.",
    cv: "You can download Zulfiqar's CV from the 'Download CV' button at the top or bottom of this page.",
    techstack:
      "This portfolio itself is built with:\n• Frontend: HTML5, CSS3, JavaScript (ES6+)\n• Responsive Web Design using media queries\n• Deployment & CI/CD: GitHub Pages / GitHub Actions\n\nZulfiqar's broader stack also includes React, Node.js, Express, MongoDB (MERN), Git, and RESTful APIs.",
    architecture:
      "The portfolio repo is structured as a container for several sub-projects, not just a single page:\n\n.github/workflows/ — automated deployment configs\nZulfiqar_Restuarant/ — restaurant app codebase\nWeather_APP/ — weather API app codebase\nTo_Do_List_App/ — task management codebase\nTree Builder/ — structural/logical mini-app\nRiwaayah/ — tailored component module\nstyles/ — global stylesheets\nimg/ — asset and media files\nindex.html — main landing page entry point\n\nFull code: github.com/zulfiqarteams",
    deployment:
      "The site is deployed via GitHub Pages, with GitHub Actions handling the automated deployment workflow (CI/CD) whenever the repo is updated.",

    greeting:
      "Hi! 👋 I'm Zulfi, Zulfiqar's portfolio assistant. Ask me about his skills, projects, experience, education, or how to contact him — or tap a button below.",
    fallback:
      "I'm not sure about that one — I'm Zulfi, and I can only answer questions about Zulfiqar's skills, projects, experience, education, or contact info. Try one of the quick options below, or message him directly on WhatsApp!",
  };

  /* ------------------- 2. KEYWORD → INTENT MAPPING -------------------
     Order matters on ties: more specific (granular) intents are listed
     before their general/category counterpart so a specific question
     ("what's your whatsapp number?") wins over the generic one ("contact").
  --------------------------------------------------------------------- */
  const INTENTS = [
    // granular skills
    { key: "skill_html", words: ["html"] },
    { key: "skill_css", words: ["css"] },
    { key: "skill_js", words: ["javascript", "js"] },
    { key: "skill_cpp", words: ["c++", "cpp"] },
    { key: "skill_sql", words: ["sql"] },
    { key: "skill_python", words: ["python"] },
    { key: "skill_react", words: ["react"] },
    { key: "skill_node", words: ["node.js", "nodejs", "node"] },
    { key: "skill_git", words: ["git"] },
    { key: "skill_api", words: ["rest api", "restful", "api"] },

    // granular contact fields
    { key: "contact_email", words: ["email", "e-mail"] },
    { key: "contact_whatsapp", words: ["whatsapp", "whats app", "phone", "number", "call"] },
    { key: "contact_location", words: ["location", "address", "based in", "where are you", "city"] },
    { key: "contact_linkedin", words: ["linkedin"] },
    { key: "contact_github", words: ["github", "git hub"] },

    // granular projects
    { key: "restaurant_project", words: ["restaurant"] },
    { key: "weather_project", words: ["weather"] },
    { key: "todo_project", words: ["to-do", "todo", "task manager", "task management"] },
    { key: "treebuilder_project", words: ["tree builder", "draughtsman", "riwaayah", "riwayaah"] },

    // general / category intents
    { key: "about", words: ["about", "who are you", "who is zulfiqar", "intro", "yourself"] },
    { key: "skills", words: ["skill", "tech stack", "technologies", "language", "expertise", "stack"] },
    { key: "experience", words: ["experience", "timeline", "history", "work", "job", "career"] },
    { key: "projects", words: ["project", "work sample", "portfolio work", "app", "built", "made"] },
    { key: "contact", words: ["contact", "reach", "hire", "get in touch"] },
    { key: "education", words: ["education", "degree", "university", "college", "study", "diploma"] },
    { key: "cv", words: ["cv", "resume", "download"] },
    { key: "techstack", words: ["tech stack of this site", "how is this site built", "portfolio built with", "site tech stack", "what is this website built with"] },
    { key: "architecture", words: ["folder structure", "architecture", "repo structure", "repository", "codebase structure", "how is the code organized"] },
    { key: "deployment", words: ["deploy", "deployment", "ci/cd", "github actions", "github pages", "hosting", "hosted"] },
  ];

  // Maps a resolved intent key to a chip "category" so the widget can show
  // the right follow-up quick-reply chips after answering.
  const CATEGORY_OF = {
    skills: "skills", skill_html: "skills", skill_css: "skills", skill_js: "skills",
    skill_cpp: "skills", skill_sql: "skills", skill_python: "skills", skill_react: "skills",
    skill_node: "skills", skill_git: "skills", skill_api: "skills",

    contact: "contact", contact_email: "contact", contact_whatsapp: "contact",
    contact_location: "contact", contact_linkedin: "contact", contact_github: "contact",

    projects: "projects", restaurant_project: "projects", weather_project: "projects",
    todo_project: "projects", treebuilder_project: "projects",
  };

  const CHIP_SETS = {
    main: [
      { label: "Skills", q: "Tell me about your skills" },
      { label: "Projects", q: "Show me your projects" },
      { label: "Experience", q: "What is your experience?" },
      { label: "Contact", q: "How can I contact you?" },
      { label: "Education", q: "Tell me about your education" },
      { label: "CV", q: "Can I download your CV?" },
      { label: "Site Tech Stack", q: "What tech stack was this site built with?" },
    ],
    skills: [
      { label: "HTML", q: "html skill" },
      { label: "CSS", q: "css skill" },
      { label: "JavaScript", q: "javascript skill" },
      { label: "Python", q: "python skill" },
      { label: "SQL", q: "sql skill" },
      { label: "C++", q: "c++ skill" },
      { label: "React", q: "react skill" },
      { label: "Node.js", q: "node.js skill" },
      { label: "Git", q: "git skill" },
      { label: "REST API", q: "rest api skill" },
      { label: "⬅ Menu", q: "__menu__" },
    ],
    contact: [
      { label: "Email", q: "email" },
      { label: "WhatsApp", q: "whatsapp number" },
      { label: "Location", q: "location" },
      { label: "LinkedIn", q: "linkedin" },
      { label: "GitHub", q: "github" },
      { label: "⬅ Menu", q: "__menu__" },
    ],
    projects: [
      { label: "Restaurant", q: "restaurant project" },
      { label: "Weather App", q: "weather project" },
      { label: "To-Do App", q: "todo project" },
      { label: "Tree Builder", q: "tree builder project" },
      { label: "⬅ Menu", q: "__menu__" },
    ],
  };

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Whole-word match for plain alphanumeric keywords (so "git" doesn't
  // false-match inside "github", "js" doesn't false-match inside other
  // words, etc). Falls back to a plain substring check for phrases /
  // keywords that contain punctuation (e.g. "c++", "ci/cd", "e-mail").
  function matchWord(text, w) {
    const word = w.toLowerCase();
    if (/^[a-z0-9]+$/i.test(word)) {
      return new RegExp("\\b" + escapeRegex(word) + "\\b", "i").test(text);
    }
    return text.includes(word);
  }

  function detectIntent(msg) {
    const text = msg.toLowerCase();
    let best = null;
    let bestScore = 0;
    INTENTS.forEach((intent) => {
      let score = 0;
      intent.words.forEach((w) => {
        if (matchWord(text, w)) score += w.split(" ").length; // longer phrase match = stronger
      });
      if (score > bestScore) {
        bestScore = score;
        best = intent.key;
      }
    });
    return bestScore > 0 ? best : null;
  }

  function resolveAnswer(msg) {
    if (/^(hi|hello|hey|salam|assalam)/i.test(msg.trim())) {
      return { text: KB.greeting, intent: null };
    }
    const intent = detectIntent(msg);
    return { text: intent ? KB[intent] : KB.fallback, intent };
  }

  /* ------------------- 3. LINK-IFYING & HIGHLIGHTING BOT REPLIES -------------------
     Any email / WhatsApp number / URL / bare domain inside a KB answer is
     turned into a real clickable link when rendered, and genuinely
     important facts (skill %, contact labels, timeline dates, key status
     call-outs) get visually highlighted so they're easy to spot at a glance.
  --------------------------------------------------------------------- */
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Wraps genuinely important facts (skill scores, contact field labels,
  // timeline dates, key status call-outs) so they visually stand out from
  // the surrounding sentence — without touching anything that's about to
  // become a clickable link (that step runs after this one).
  function highlightImportant(text) {
    let out = text;

    // Contact field labels at the start of a (possibly bulleted) line,
    // e.g. "Email:", "• WhatsApp:"
    out = out.replace(
      /(^|\n)([•\-*]?\s*)(Email|WhatsApp|Phone|Location|LinkedIn|GitHub)(:)/g,
      (m, pre, bullet, label, colon) => pre + bullet + '<strong class="zc-hl">' + label + "</strong>" + colon
    );

    // Skill / proficiency percentages, e.g. "80%", "95%"
    out = out.replace(/\b(\d{1,3}%)/g, '<mark class="zc-hl">$1</mark>');

    // Timeline years and ranges, e.g. "2025–present", "2022–2025", "2024"
    out = out.replace(
      /\b(20\d{2}(?:\s?[–-]\s?(?:present|20\d{2}))?)\b/g,
      '<mark class="zc-hl">$1</mark>'
    );

    // Key status call-outs worth a glance at
    out = out.replace(
      /(open to remote client opportunities|in progress|private client project)/gi,
      '<mark class="zc-hl">$1</mark>'
    );

    return out;
  }

  function linkify(raw) {
    let text = escapeHtml(raw);
    text = highlightImportant(text);

    // Every generated <a> tag is stashed behind an opaque placeholder token
    // until the very end. Without this, a later regex pass (e.g. the plain
    // "https?://..." matcher) can re-match the href/text of a link that an
    // earlier pass just inserted (like the wa.me link below) and wrap it in
    // a second, broken, nested <a> tag.
    const tokens = [];
    function stash(html) {
      tokens.push(html);
      return "\u0000" + (tokens.length - 1) + "\u0000";
    }

    // emails
    text = text.replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, (m) =>
      stash('<a href="mailto:' + m + '" target="_blank" rel="noopener">' + m + "</a>")
    );

    // Pakistani-style phone / WhatsApp numbers, e.g. +92 313 6473895
    text = text.replace(/(\+92[\d \-]{8,})/g, (m) => {
      const digits = m.replace(/[^\d]/g, "");
      return stash('<a href="https://wa.me/' + digits + '" target="_blank" rel="noopener">' + m.trim() + "</a>");
    });

    // full URLs already containing a protocol
    text = text.replace(/(https?:\/\/[^\s<]+)/g, (m) =>
      stash('<a href="' + m + '" target="_blank" rel="noopener">' + m + "</a>")
    );

    // bare domains without protocol (github.com/..., linkedin.com/...)
    text = text.replace(/((?:github|linkedin)\.com\/[^\s<]+)/gi, (m) =>
      stash('<a href="https://' + m + '" target="_blank" rel="noopener">' + m + "</a>")
    );

    // restore stashed links now that no more regex passes will run
    text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);

    return text;
  }

  /* --------------------------- 4. STYLING ---------------------------
     Uses the CSS variable theme you provided, scoped to the widget root
     so it can't clash with the rest of the page. A light/dark toggle in
     the header switches the `.light-mode` class on/off (remembered via
     localStorage).
  ------------------------------------------------------------------- */
  const style = document.createElement("style");
  style.textContent = `
    .zc-widget-root {
      --color-primary: #191d2b;
      --color-secondary: #27AE60;
      --color-white: #FFFFFF;
      --color-black: #000;
      --color-grey0: #f8f8f8;
      --color-grey-1: #dbe1e8;
      --color-grey-2: #b2becd;
      --color-grey-3: #6c7983;
      --color-grey-4: #454e56;
      --color-grey-5: #2a2e35;
      --color-grey-6: #12181b;
      --br-sm-2: 14px;
      --box-shadow-1: 0 3px 15px rgba(0,0,0,.3);
    }
    .zc-widget-root.light-mode {
      --color-primary: #FFFFFF;
      --color-secondary: #e80d0d;
      --color-white: #454e56;
      --color-black: #000;
      --color-grey0: #f8f8f8;
      --color-grey-1: #6c7983;
      --color-grey-2: #6c7983;
      --color-grey-3: #6c7983;
      --color-grey-4: #454e56;
      --color-grey-5: #f8f8f8;
      --color-grey-6: #12181b;
    }

    .zc-launcher {
      position: fixed; bottom: 22px; right: 22px; z-index: 99999;
      width: 58px; height: 58px; border-radius: 50%;
      background: var(--color-secondary);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: var(--box-shadow-1);
      border: none; transition: transform .2s ease;
    }
    .zc-launcher:hover { transform: scale(1.07); }
    .zc-launcher svg { width: 26px; height: 26px; fill: var(--color-white); }

    .zc-panel {
      position: fixed; bottom: 92px; right: 22px; z-index: 99999;
      width: 340px; max-width: calc(100vw - 32px);
      height: 460px; max-height: calc(100vh - 140px);
      background: var(--color-primary); border: 1px solid var(--color-grey-4);
      border-radius: var(--br-sm-2); display: none; flex-direction: column;
      overflow: hidden; box-shadow: var(--box-shadow-1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .zc-panel.zc-open { display: flex; }

    .zc-header {
      background: var(--color-grey-6); padding: 14px 16px;
      border-bottom: 1px solid var(--color-grey-4);
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .zc-header-title { color: var(--color-white); font-weight: 600; font-size: 14px; }
    .zc-header-sub { color: var(--color-grey-2); font-size: 11px; margin-top: 2px; }
    .zc-header-actions { display: flex; align-items: center; gap: 6px; }
    .zc-close {
      background: none; border: none; color: var(--color-grey-2);
      cursor: pointer; font-size: 18px; line-height: 1;
    }

    .zc-messages {
      flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .zc-msg { max-width: 84%; padding: 9px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5; white-space: pre-line; }
    .zc-msg.bot { align-self: flex-start; background: var(--color-grey-5); color: var(--color-white); border-bottom-left-radius: 4px; }
    .zc-msg.user { align-self: flex-end; background: var(--color-secondary); color: var(--color-white); border-bottom-right-radius: 4px; }
    .zc-msg.bot a { color: var(--color-secondary); text-decoration: underline; word-break: break-word; }
    .zc-msg.bot mark.zc-hl, .zc-msg.bot strong.zc-hl {
      background: none; color: var(--color-secondary); font-weight: 700;
    }

    .zc-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; }
    .zc-chip {
      background: var(--color-grey-6); border: 1px solid var(--color-grey-4); color: var(--color-grey-2);
      font-size: 11px; padding: 5px 10px; border-radius: 999px; cursor: pointer; transition: all .15s;
    }
    .zc-chip:hover { border-color: var(--color-secondary); color: var(--color-white); }

    .zc-inputbar { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--color-grey-4); }
    .zc-input {
      flex: 1; background: var(--color-grey-6); border: 1px solid var(--color-grey-4); color: var(--color-white);
      border-radius: 10px; padding: 9px 12px; font-size: 13px; outline: none;
    }
    .zc-input:focus { border-color: var(--color-secondary); }
    .zc-send { background: var(--color-secondary); border: none; color: var(--color-white); border-radius: 10px; padding: 0 14px; cursor: pointer; font-size: 13px; }
    .zc-send:hover { filter: brightness(0.9); }

    /* ---- Light-mode readability overrides ----
       The base variables reuse --color-secondary/--color-white for lots of
       surfaces, which gives poor contrast in light mode (e.g. dark-grey
       text on a red bubble). These overrides keep the same palette but
       fix contrast on the specific surfaces that need it. */
    .zc-widget-root.light-mode .zc-panel { border-color: var(--color-grey-1); }
    .zc-widget-root.light-mode .zc-header { background: var(--color-grey0); border-bottom-color: var(--color-grey-1); }
    .zc-widget-root.light-mode .zc-header-title { color: var(--color-grey-6); }
    .zc-widget-root.light-mode .zc-header-sub { color: var(--color-grey-3); }
    .zc-widget-root.light-mode .zc-close { color: var(--color-grey-4); }
    .zc-widget-root.light-mode .zc-msg.bot { background: var(--color-grey0); color: var(--color-grey-6); border: 1px solid var(--color-grey-1); }
    .zc-widget-root.light-mode .zc-msg.user { background: var(--color-secondary); color: #FFFFFF; }
    .zc-widget-root.light-mode .zc-chip { background: var(--color-grey0); border-color: var(--color-grey-1); color: var(--color-grey-4); }
    .zc-widget-root.light-mode .zc-chip:hover { border-color: var(--color-secondary); color: var(--color-grey-6); }
    .zc-widget-root.light-mode .zc-inputbar { border-top-color: var(--color-grey-1); }
    .zc-widget-root.light-mode .zc-input { background: var(--color-grey0); border-color: var(--color-grey-1); color: var(--color-grey-6); }
    .zc-widget-root.light-mode .zc-input::placeholder { color: var(--color-grey-3); }
    .zc-widget-root.light-mode .zc-send { color: #FFFFFF; }
    .zc-widget-root.light-mode .zc-launcher svg { fill: #FFFFFF; }

    /* ---- Mobile responsiveness ---- */
    .zc-messages { -webkit-overflow-scrolling: touch; }

    @media (max-width: 480px) {
      .zc-launcher {
        width: 52px; height: 52px; right: 16px;
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      }
      .zc-panel {
        left: 12px; right: 12px; width: auto;
        bottom: calc(80px + env(safe-area-inset-bottom, 0px));
        height: min(68vh, 520px);
        max-height: calc(100vh - 110px);
      }
      .zc-header { padding: 12px 14px; }
      .zc-msg { font-size: 13.5px; max-width: 88%; }
      .zc-chip { padding: 7px 12px; font-size: 12px; }
      /* 16px+ font-size on inputs stops iOS Safari auto-zooming on focus */
      .zc-input { font-size: 16px; }
      .zc-inputbar { padding: 10px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)); }
    }
  `;
  document.head.appendChild(style);

  /* --------------------------- 5. MARKUP --------------------------- */
  const root = document.createElement("div");
  root.className = "zc-widget-root";

  const launcher = document.createElement("button");
  launcher.className = "zc-launcher";
  launcher.setAttribute("aria-label", "Open chat with Zulfi, Zulfiqar's assistant");
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4 1.02 4.57 2.7 6.18L4 22l5.06-2.06c.94.23 1.93.36 2.94.36 5.52 0 10-4.03 10-9S17.52 2 12 2z"/></svg>';

  const panel = document.createElement("div");
  panel.className = "zc-panel";
  panel.innerHTML = `
    <div class="zc-header">
      <div>
        <div class="zc-header-title">${KB.assistantName} · ${KB.name}'s Assistant</div>
        <div class="zc-header-sub">${KB.role}</div>
      </div>
      <div class="zc-header-actions">
        <button class="zc-close" aria-label="Close chat">✕</button>
      </div>
    </div>
    <div class="zc-messages" id="zc-messages"></div>
    <div class="zc-chips" id="zc-chips"></div>
    <div class="zc-inputbar">
      <input class="zc-input" id="zc-input" type="text" placeholder="Ask Zulfi about ${KB.name}..." />
      <button class="zc-send" id="zc-send">Send</button>
    </div>
  `;

  root.appendChild(launcher);
  root.appendChild(panel);
  document.body.appendChild(root);

  const messagesEl = panel.querySelector("#zc-messages");
  const chipsEl = panel.querySelector("#zc-chips");
  const inputEl = panel.querySelector("#zc-input");
  const sendBtn = panel.querySelector("#zc-send");
  const closeBtn = panel.querySelector(".zc-close");

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = "zc-msg " + sender;
    if (sender === "bot") {
      div.innerHTML = linkify(text); // KB content is developer-authored, safe to render as HTML
    } else {
      div.textContent = text; // user input stays plain text, never rendered as HTML
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderChips(list) {
    chipsEl.innerHTML = "";
    list.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "zc-chip";
      btn.textContent = c.label;
      btn.addEventListener("click", () => {
        if (c.q === "__menu__") {
          renderChips(CHIP_SETS.main);
          return;
        }
        handleSend(c.q);
      });
      chipsEl.appendChild(btn);
    });
  }

  function handleSend(text) {
    const msg = (text || inputEl.value).trim();
    if (!msg) return;
    addMessage(msg, "user");
    inputEl.value = "";
    setTimeout(() => {
      const { text: answer, intent } = resolveAnswer(msg);
      addMessage(answer, "bot");
      const category = intent ? CATEGORY_OF[intent] : null;
      renderChips(category ? CHIP_SETS[category] : CHIP_SETS.main);
    }, 350);
  }

  let opened = false;
  launcher.addEventListener("click", () => {
    opened = !opened;
    panel.classList.toggle("zc-open", opened);
    if (opened && messagesEl.children.length === 0) {
      addMessage(KB.greeting, "bot");
      renderChips(CHIP_SETS.main);
    }
  });
  closeBtn.addEventListener("click", () => {
    opened = false;
    panel.classList.remove("zc-open");
  });
  sendBtn.addEventListener("click", () => handleSend());
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  /* --------------------- 6. FOLLOW THE SITE'S THEME ---------------------
     No standalone toggle — the widget mirrors whatever light/dark mode
     the host website is currently in.
     1) If the site marks light mode with a `.light-mode` class on <html>
        or <body> (like the theme you shared), the widget copies that.
     2) If the site has no such class at all, it falls back to the OS/
        browser's `prefers-color-scheme`, and keeps listening for changes.
     3) A MutationObserver keeps the widget in sync live if the site's
        theme toggle changes classes after the widget has loaded.
  ------------------------------------------------------------------- */
  function siteHasThemeClass() {
    return (
      document.documentElement.classList.contains("light-mode") ||
      document.documentElement.classList.contains("dark-mode") ||
      document.body.classList.contains("light-mode") ||
      document.body.classList.contains("dark-mode")
    );
  }

  function siteIsLight() {
    if (siteHasThemeClass()) {
      return (
        document.documentElement.classList.contains("light-mode") ||
        document.body.classList.contains("light-mode")
      );
    }
    // No theme class on the site at all — fall back to OS/browser preference.
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  function syncTheme() {
    root.classList.toggle("light-mode", siteIsLight());
  }

  syncTheme();

  const themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onSchemeChange = () => {
      if (!siteHasThemeClass()) syncTheme();
    };
    if (mql.addEventListener) mql.addEventListener("change", onSchemeChange);
    else if (mql.addListener) mql.addListener(onSchemeChange); // older Safari
  }
})();
