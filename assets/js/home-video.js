(() => {
  const film = document.querySelector('.home-film');
  const toggle = document.querySelector('.film-toggle');
  if (!film || !toggle) return;

  let manuallyPaused = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setState = () => {
    const paused = film.paused;
    toggle.textContent = paused ? 'Play film' : 'Pause film';
    toggle.setAttribute('aria-pressed', String(paused));
    document.documentElement.classList.toggle('film-paused', paused);
  };

  const requestPlay = () => {
    const result = film.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => setState());
    }
  };

  if (reduceMotion.matches) {
    manuallyPaused = true;
    film.pause();
  } else {
    requestPlay();
  }

  toggle.addEventListener('click', () => {
    if (film.paused) {
      manuallyPaused = false;
      requestPlay();
    } else {
      manuallyPaused = true;
      film.pause();
    }
    setState();
  });

  film.addEventListener('play', setState);
  film.addEventListener('pause', setState);
  film.addEventListener('error', () => {
    document.documentElement.classList.add('film-error');
    toggle.hidden = true;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      film.pause();
    } else if (!manuallyPaused && !reduceMotion.matches) {
      requestPlay();
    }
  });

  setState();
})();
