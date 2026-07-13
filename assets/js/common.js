(() => {
  if (document.body.classList.contains('inner')) {
    const script = document.currentScript;
    const themeHref = script
      ? new URL('../css/inner-win95-clear.css?v=20260713-3', script.src).href
      : 'assets/css/inner-win95-clear.css?v=20260713-3';
    const contrastHref = script
      ? new URL('../css/inner-text-contrast.css?v=20260713-3', script.src).href
      : 'assets/css/inner-text-contrast.css?v=20260713-3';

    if (!document.querySelector('link[data-inner-theme="win95-clear"]')) {
      const theme = document.createElement('link');
      theme.rel = 'stylesheet';
      theme.href = themeHref;
      theme.dataset.innerTheme = 'win95-clear';
      document.head.appendChild(theme);
    }

    if (!document.querySelector('link[data-inner-contrast="high"]')) {
      const contrast = document.createElement('link');
      contrast.rel = 'stylesheet';
      contrast.href = contrastHref;
      contrast.dataset.innerContrast = 'high';
      document.head.appendChild(contrast);
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
