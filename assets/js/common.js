(() => {
  if (document.body.classList.contains('inner')) {
    const script = document.currentScript;
    const href = script
      ? new URL('../css/inner-editorial.css', script.src).href
      : 'assets/css/inner-editorial.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const theme = document.createElement('link');
      theme.rel = 'stylesheet';
      theme.href = href;
      document.head.appendChild(theme);
    }
  }

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
