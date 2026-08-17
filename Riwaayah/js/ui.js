/* =========================================================
   SHARED UI: theme toggle + mobile nav
   Loaded (deferred) on every page. Works with the inline
   anti-flash snippet in <head> that sets data-theme early.
========================================================= */

(function () {
  const SUN = `<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const MOON = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const MENU = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function makeThemeBtn() {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'theme-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML = SUN + MOON;
    btn.addEventListener('click', () => {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
    return btn;
  }

  function init() {
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if (navbar && navLinks) {
      // Standard storefront navbar
      if (!document.getElementById('theme-toggle-btn')) {
        navbar.appendChild(makeThemeBtn());
      }

      let navBtn = document.getElementById('mobile-nav-toggle');
      if (!navBtn) {
        navBtn = document.createElement('button');
        navBtn.id = 'mobile-nav-toggle';
        navBtn.className = 'mobile-nav-toggle';
        navBtn.type = 'button';
        navBtn.setAttribute('aria-label', 'Toggle menu');
        navBtn.innerHTML = MENU;
        navbar.appendChild(navBtn);
      }
      navBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });

      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('open'));
      });
    } else if (!document.body.hasAttribute('data-skip-float-toggle')) {
      // Pages without a standard navbar (e.g. Login):
      // float a theme toggle in the corner instead.
      const btn = makeThemeBtn();
      btn.style.position = 'fixed';
      btn.style.top = '16px';
      btn.style.right = '16px';
      btn.style.zIndex = '2000';
      btn.style.background = 'var(--surface)';
      btn.style.boxShadow = 'var(--shadow)';
      document.body.appendChild(btn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
