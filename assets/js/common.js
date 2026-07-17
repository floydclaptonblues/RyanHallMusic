(() => {
  const script = document.currentScript;

  if (document.body.classList.contains('inner')) {
    const themeHref = script
      ? new URL('../css/inner-win95-clear.css?v=20260713-6', script.src).href
      : 'assets/css/inner-win95-clear.css?v=20260713-6';
    const contrastHref = script
      ? new URL('../css/inner-text-contrast.css?v=20260713-6', script.src).href
      : 'assets/css/inner-text-contrast.css?v=20260713-6';
    const chicagoHref = script
      ? new URL('../css/inner-chicago-subtext.css?v=20260713-7', script.src).href
      : 'assets/css/inner-chicago-subtext.css?v=20260713-7';
    const desktopHref = script
      ? new URL('../css/inner-win98-desktop.css?v=20260713-8', script.src).href
      : 'assets/css/inner-win98-desktop.css?v=20260713-8';
    const clearWindowsHref = script
      ? new URL('../css/inner-clear-windows.css?v=20260713-9', script.src).href
      : 'assets/css/inner-clear-windows.css?v=20260713-9';
    const mobileNavHref = script
      ? new URL('../css/inner-mobile-nav.css?v=20260715-1', script.src).href
      : 'assets/css/inner-mobile-nav.css?v=20260715-1';

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

    if (!document.querySelector('link[data-inner-subtext="chicago"]')) {
      const chicago = document.createElement('link');
      chicago.rel = 'stylesheet';
      chicago.href = chicagoHref;
      chicago.dataset.innerSubtext = 'chicago';
      document.head.appendChild(chicago);
    }

    if (!document.querySelector('link[data-inner-layout="win98-desktop"]')) {
      const desktop = document.createElement('link');
      desktop.rel = 'stylesheet';
      desktop.href = desktopHref;
      desktop.dataset.innerLayout = 'win98-desktop';
      document.head.appendChild(desktop);
    }

    if (!document.querySelector('link[data-inner-windows="clear"]')) {
      const clearWindows = document.createElement('link');
      clearWindows.rel = 'stylesheet';
      clearWindows.href = clearWindowsHref;
      clearWindows.dataset.innerWindows = 'clear';
      document.head.appendChild(clearWindows);
    }

    if (!document.querySelector('link[data-inner-mobile-nav]')) {
      const mobileNav = document.createElement('link');
      mobileNav.rel = 'stylesheet';
      mobileNav.href = mobileNavHref;
      mobileNav.dataset.innerMobileNav = 'homepage-row';
      document.head.appendChild(mobileNav);
    }

    const header = document.querySelector('.site-header');
    const headerMark = document.querySelector('.header-mark');
    if (headerMark) headerMark.remove();

    if (header) {
      const syncHeaderColumns = () => {
        header.style.gridTemplateColumns = window.matchMedia('(max-width: 850px)').matches
          ? '1fr auto'
          : 'auto 1fr';
      };
      syncHeaderColumns();
      window.addEventListener('resize', syncHeaderColumns, { passive: true });
    }
  }

  /* Every individual song page contains .song-shell. */
  if (document.querySelector('.song-shell')) {
    document.body.classList.add('page-song');

    const songStyleHref = script
      ? new URL('../css/song-film-background.css?v=20260713-6', script.src).href
      : '../assets/css/song-film-background.css?v=20260713-6';

    if (!document.querySelector('link[data-song-film-style]')) {
      const songStyle = document.createElement('link');
      songStyle.rel = 'stylesheet';
      songStyle.href = songStyleHref;
      songStyle.dataset.songFilmStyle = 'deep-end-of-time';
      document.head.appendChild(songStyle);
    }

    if (!document.querySelector('.song-film-wrap')) {
      const wrap = document.createElement('div');
      wrap.className = 'song-film-wrap';
      wrap.setAttribute('aria-hidden', 'true');

      const video = document.createElement('video');
      video.className = 'song-film';
      video.autoplay = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.tabIndex = -1;
      video.disablePictureInPicture = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');

      if (script) {
        video.poster = new URL('../images/home/deep-end-poster.jpg', script.src).href;

        const mobileSource = document.createElement('source');
        mobileSource.src = new URL('../video/home-deep-end-background-mobile.mp4', script.src).href;
        mobileSource.type = 'video/mp4';
        mobileSource.media = '(max-width: 650px)';
        video.appendChild(mobileSource);

        const desktopSource = document.createElement('source');
        desktopSource.src = new URL('../video/home-deep-end-background.mp4', script.src).href;
        desktopSource.type = 'video/mp4';
        video.appendChild(desktopSource);
      } else {
        video.poster = '../assets/images/home/deep-end-poster.jpg';
        video.src = '../assets/video/home-deep-end-background.mp4';
      }

      const overlay = document.createElement('div');
      overlay.className = 'song-film-overlay';

      wrap.append(video, overlay);
      document.body.prepend(wrap);
      video.play().catch(() => {});
    }
  }

  if (document.body.classList.contains('page-404-ever') && !document.getElementById('local-on-the-8s-section')) {
    const main = document.querySelector('main.inner-main');
    if (main) {
      const section = document.createElement('section');
      section.className = 'forever-section';
      section.id = 'local-on-the-8s-section';
      section.setAttribute('aria-labelledby', 'local-on-the-8s-heading');

      const heading = document.createElement('h2');
      heading.id = 'local-on-the-8s-heading';
      heading.textContent = "Local On the 8's";

      const grid = document.createElement('div');
      grid.className = 'forever-grid';

      const card = document.createElement('article');
      card.className = 'forever-card forever-card--wide';

      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-label', "Local On the 8's");

      const source = document.createElement('source');
      source.src = script
        ? new URL("../video/Local On the 8's.mp4", script.src).href
        : "assets/video/Local On the 8's.mp4";
      source.type = 'video/mp4';

      video.appendChild(source);
      card.appendChild(video);
      grid.appendChild(card);
      section.append(heading, grid);
      main.appendChild(section);
    }
  }

  const nav = document.querySelector('.main-nav');
  if (nav) {
    const links = Array.from(nav.querySelectorAll('a'));
    const showsLink = links.find((link) => {
      try {
        return new URL(link.href, window.location.href).pathname.endsWith('/pictures.html');
      } catch {
        return false;
      }
    });

    if (showsLink) showsLink.textContent = 'Shows';

    const hasForever = links.some((link) => {
      try {
        return new URL(link.href, window.location.href).pathname.endsWith('/404-ever.html');
      } catch {
        return false;
      }
    });

    if (!hasForever) {
      const forever = document.createElement('a');
      const siteRoot = script ? new URL('../../', script.src) : new URL('.', window.location.href);
      forever.href = new URL('404-ever.html', siteRoot).href;
      forever.textContent = '404-EVER';
      if (window.location.pathname.endsWith('/404-ever.html')) forever.setAttribute('aria-current', 'page');

      const contactLink = links.find((link) => {
        try {
          return new URL(link.href, window.location.href).pathname.endsWith('/contact.html');
        } catch {
          return false;
        }
      });
      nav.insertBefore(forever, contactLink || null);
    }
  }

  const toggle = document.querySelector('.nav-toggle');
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

  if (!document.querySelector('script[data-visitor-counter-script]')) {
    const visitorCounterScript = document.createElement('script');
    visitorCounterScript.src = script
      ? new URL('visitor-counter.js?v=20260714-2', script.src).href
      : 'assets/js/visitor-counter.js?v=20260714-2';
    visitorCounterScript.async = true;
    visitorCounterScript.dataset.visitorCounterScript = 'silent';
    document.body.appendChild(visitorCounterScript);
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();