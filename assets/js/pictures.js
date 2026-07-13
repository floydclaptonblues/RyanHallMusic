(() => {
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-image');
  const title = document.getElementById('lightbox-title');
  const close = document.getElementById('lightbox-close');
  function shut() { dialog.close(); image.removeAttribute('src'); }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lightbox]');
    if (!button) return;
    image.src = button.dataset.lightbox;
    image.alt = button.querySelector('img')?.alt || '';
    title.textContent = button.dataset.title || 'Picture';
    dialog.showModal();
  });
  close.addEventListener('click', shut);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) shut(); });
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); shut(); });
})();
