(() => {
  const catalog = window.RYAN_CATALOG.videos;
  const grid = document.getElementById('video-grid');
  const dialog = document.getElementById('video-dialog');
  const video = document.getElementById('dialog-video');
  const dialogTitle = document.getElementById('dialog-title');
  const close = document.getElementById('dialog-close');

  const posterMarkup = (item) => item.poster
    ? `<img src="${item.poster}" alt="" loading="lazy">`
    : `<video class="video-thumb" src="${item.file}#t=1" muted playsinline preload="metadata" aria-hidden="true"></video>`;

  const detailsMarkup = (item) => {
    const lines = [item.personnel, item.production, item.thanks].filter(Boolean);
    if (!lines.length) return '';
    return `<div class="video-details">${lines.map((line) => `<p>${line}</p>`).join('')}</div>`;
  };

  grid.innerHTML = catalog.map((item, index) => `
    <article class="video-card glass-panel${item.featured ? ' video-card--wide' : ''}">
      <button type="button" data-video="${index}" aria-label="Play ${item.title}">
        <div class="video-poster">${posterMarkup(item)}</div>
        <div class="video-copy">
          <h2>${item.title}</h2>
          <p class="subtitle">${item.subtitle || '&nbsp;'}</p>
          <p class="meta">${item.duration}</p>
          ${detailsMarkup(item)}
        </div>
      </button>
    </article>`).join('');

  function shut() {
    video.pause();
    video.removeAttribute('src');
    video.load();
    dialog.close();
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-video]');
    if (!button) return;
    const item = catalog[Number(button.dataset.video)];
    dialogTitle.textContent = item.title;
    video.src = item.file;
    dialog.showModal();
    video.play().catch(() => {});
  });

  close.addEventListener('click', shut);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) shut(); });
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); shut(); });
})();
