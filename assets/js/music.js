(() => {
  const catalog = window.RYAN_CATALOG.music;
  const grid = document.getElementById('music-grid');
  const audio = document.getElementById('audio');
  const toggle = document.getElementById('dock-toggle');
  const title = document.getElementById('dock-title');
  const subtitle = document.getElementById('dock-subtitle');
  const progress = document.getElementById('dock-progress');
  const current = document.getElementById('dock-current');
  const duration = document.getElementById('dock-duration');
  const canvas = document.getElementById('visualizer');
  const ctx = canvas.getContext('2d');
  let activeIndex = -1;
  let audioContext, analyser, source, data;

  const format = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`;
  };
  const relativeFile = (path) => path;
  grid.innerHTML = catalog.map((track, index) => `
    <article class="track-card glass-panel">
      <div class="track-art" aria-hidden="true"></div>
      <div class="track-copy">
        <p class="meta">${track.duration}</p>
        <h2>${track.title}</h2>
        <p class="subtitle">${track.subtitle || '&nbsp;'}</p>
        <div class="track-controls">
          <button class="play-button" type="button" data-play="${index}">Play</button>
          <a class="text-button" href="songs/${track.slug}.html">Open</a>
        </div>
      </div>
    </article>`).join('');

  function setupAnalyser() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
    draw();
  }
  function draw() {
    requestAnimationFrame(draw);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    if (!analyser) return;
    analyser.getByteFrequencyData(data);
    const bar = w / data.length;
    for (let i=0;i<data.length;i++) {
      const value = data[i] / 255;
      const bh = Math.max(2, value * h * .9);
      const gradient = ctx.createLinearGradient(0,h-bh,0,h);
      gradient.addColorStop(0,'rgba(93,230,238,.95)');
      gradient.addColorStop(1,'rgba(19,113,205,.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(i*bar, h-bh, Math.max(2,bar-2), bh);
    }
  }
  async function load(index, autoplay = true) {
    const track = catalog[index];
    if (!track) return;
    activeIndex = index;
    audio.src = relativeFile(track.file);
    title.textContent = track.title;
    subtitle.textContent = track.subtitle || 'Ryan Hall';
    document.querySelectorAll('[data-play]').forEach((button, i) => button.textContent = i === index ? 'Pause' : 'Play');
    setupAnalyser();
    if (audioContext.state === 'suspended') await audioContext.resume();
    if (autoplay) {
      try { await audio.play(); } catch (_) {}
    }
  }
  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-play]');
    if (!button) return;
    const index = Number(button.dataset.play);
    if (index === activeIndex) {
      if (audio.paused) audio.play(); else audio.pause();
    } else load(index);
  });
  toggle.addEventListener('click', () => {
    if (activeIndex < 0) load(0);
    else if (audio.paused) audio.play(); else audio.pause();
  });
  audio.addEventListener('play', () => {
    toggle.textContent = '❚❚'; toggle.setAttribute('aria-label','Pause');
    document.querySelectorAll('[data-play]').forEach((button, i) => button.textContent = i === activeIndex ? 'Pause' : 'Play');
  });
  audio.addEventListener('pause', () => {
    toggle.textContent = '▶'; toggle.setAttribute('aria-label','Play');
    document.querySelectorAll('[data-play]').forEach((button, i) => button.textContent = i === activeIndex ? 'Play' : 'Play');
  });
  audio.addEventListener('loadedmetadata', () => duration.textContent = format(audio.duration));
  audio.addEventListener('timeupdate', () => {
    current.textContent = format(audio.currentTime);
    progress.value = audio.duration ? Math.round(audio.currentTime/audio.duration*1000) : 0;
  });
  progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = Number(progress.value)/1000*audio.duration;
  });
  audio.addEventListener('ended', () => load((activeIndex + 1) % catalog.length));
})();
