(() => {
  const COUNTER_ENDPOINT = 'https://api.counterapi.dev/v1/ryanhallguitar-com/site-visitors';
  const COUNTED_KEY = 'ryanHallVisitorCounted';
  const LAST_VALUE_KEY = 'ryanHallVisitorCounterLastValue';
  const productionHosts = new Set(['ryanhallguitar.com', 'www.ryanhallguitar.com']);

  const digitSegments = {
    0: ['a', 'b', 'c', 'd', 'e', 'f'],
    1: ['b', 'c'],
    2: ['a', 'b', 'g', 'e', 'd'],
    3: ['a', 'b', 'c', 'd', 'g'],
    4: ['f', 'g', 'b', 'c'],
    5: ['a', 'f', 'g', 'c', 'd'],
    6: ['a', 'f', 'g', 'e', 'c', 'd'],
    7: ['a', 'b', 'c'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'c', 'd', 'f', 'g']
  };

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        try {
          return window.sessionStorage.getItem(key);
        } catch {
          return null;
        }
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {}
      try {
        window.sessionStorage.setItem(key, value);
      } catch {}
    }
  };

  const addStyles = () => {
    if (document.querySelector('style[data-visitor-counter-style]')) return;

    const style = document.createElement('style');
    style.dataset.visitorCounterStyle = 'alarm-clock';
    style.textContent = `
      .visitor-counter {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 450;
        display: grid;
        grid-template-columns: auto auto;
        grid-template-areas: "label lamp" "display display";
        align-items: center;
        gap: 5px 10px;
        min-width: 166px;
        padding: 8px 10px 10px;
        border: 2px solid #080808;
        border-top-color: #4b4b4b;
        border-left-color: #393939;
        border-radius: 7px;
        color: #b9b1a0;
        background:
          linear-gradient(180deg, rgba(255,255,255,.08), transparent 18%),
          linear-gradient(145deg, #292929, #080808 68%, #181818);
        box-shadow:
          0 5px 13px rgba(0,0,0,.48),
          inset 1px 1px 0 rgba(255,255,255,.12),
          inset -2px -2px 0 rgba(0,0,0,.82);
        font-family: Tahoma, "MS Sans Serif", sans-serif;
        pointer-events: none;
        user-select: none;
      }

      .visitor-counter::before {
        content: "";
        position: absolute;
        inset: 3px;
        border: 1px solid rgba(255,255,255,.04);
        border-radius: 4px;
        pointer-events: none;
      }

      .visitor-counter__label {
        grid-area: label;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: .18em;
        line-height: 1;
        text-shadow: 0 1px 0 #000;
      }

      .visitor-counter__lamp {
        grid-area: lamp;
        justify-self: end;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #f13b23;
        box-shadow: 0 0 6px rgba(255,62,35,.9), inset 0 1px 0 rgba(255,255,255,.55);
      }

      .visitor-counter[data-state="loading"] .visitor-counter__lamp {
        animation: visitorCounterBlink 1.1s steps(1, end) infinite;
      }

      .visitor-counter[data-state="offline"] .visitor-counter__lamp {
        background: #42130e;
        box-shadow: none;
      }

      .visitor-counter__display {
        grid-area: display;
        display: flex;
        justify-content: center;
        gap: 3px;
        min-height: 40px;
        padding: 4px 6px;
        overflow: hidden;
        border: 2px solid;
        border-color: #030303 #3a2825 #382522 #020202;
        border-radius: 3px;
        background:
          linear-gradient(180deg, rgba(255,70,45,.035), transparent 45%),
          #170403;
        box-shadow:
          inset 0 3px 10px rgba(0,0,0,.92),
          0 1px 0 rgba(255,255,255,.08);
      }

      .visitor-counter__digit {
        position: relative;
        flex: 0 0 18px;
        width: 18px;
        height: 32px;
      }

      .visitor-counter__segment {
        position: absolute;
        opacity: .17;
        background: #7a170e;
        transition: opacity .12s ease, background-color .12s ease;
      }

      .visitor-counter__segment.is-on {
        opacity: 1;
        background: #ff3b22;
        box-shadow: 0 0 4px #ff2a13, 0 0 9px rgba(255,43,19,.62);
      }

      .visitor-counter__segment--a,
      .visitor-counter__segment--d,
      .visitor-counter__segment--g {
        left: 3px;
        width: 12px;
        height: 3px;
        clip-path: polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%);
      }

      .visitor-counter__segment--a { top: 1px; }
      .visitor-counter__segment--g { top: 14px; }
      .visitor-counter__segment--d { bottom: 1px; }

      .visitor-counter__segment--b,
      .visitor-counter__segment--c,
      .visitor-counter__segment--e,
      .visitor-counter__segment--f {
        width: 3px;
        height: 12px;
        clip-path: polygon(50% 0, 100% 14%, 100% 86%, 50% 100%, 0 86%, 0 14%);
      }

      .visitor-counter__segment--b { top: 3px; right: 1px; }
      .visitor-counter__segment--c { bottom: 3px; right: 1px; }
      .visitor-counter__segment--e { bottom: 3px; left: 1px; }
      .visitor-counter__segment--f { top: 3px; left: 1px; }

      @keyframes visitorCounterBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: .22; }
      }

      @media (max-width: 650px) {
        .visitor-counter {
          right: 8px;
          bottom: 8px;
          min-width: 142px;
          padding: 7px 8px 8px;
          transform: scale(.88);
          transform-origin: right bottom;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .visitor-counter[data-state="loading"] .visitor-counter__lamp {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const createCounter = () => {
    const counter = document.createElement('aside');
    counter.className = 'visitor-counter';
    counter.dataset.state = 'loading';
    counter.setAttribute('aria-label', 'Site visitor counter loading');
    counter.setAttribute('role', 'status');
    counter.setAttribute('aria-live', 'polite');

    const label = document.createElement('span');
    label.className = 'visitor-counter__label';
    label.textContent = 'VISITORS';

    const lamp = document.createElement('span');
    lamp.className = 'visitor-counter__lamp';
    lamp.setAttribute('aria-hidden', 'true');

    const display = document.createElement('span');
    display.className = 'visitor-counter__display';
    display.setAttribute('aria-hidden', 'true');

    counter.append(label, lamp, display);
    document.body.appendChild(counter);
    return { counter, display };
  };

  const renderDigits = (display, value) => {
    const numericValue = Math.max(0, Math.floor(Number(value) || 0));
    const text = String(numericValue).padStart(7, '0');
    display.replaceChildren();

    for (const character of text) {
      const digit = document.createElement('span');
      digit.className = 'visitor-counter__digit';
      const active = new Set(digitSegments[character] || []);

      for (const segmentName of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        const segment = document.createElement('span');
        segment.className = `visitor-counter__segment visitor-counter__segment--${segmentName}`;
        if (active.has(segmentName)) segment.classList.add('is-on');
        digit.appendChild(segment);
      }

      display.appendChild(digit);
    }
  };

  const renderBlank = (display) => {
    display.replaceChildren();
    for (let index = 0; index < 7; index += 1) {
      const digit = document.createElement('span');
      digit.className = 'visitor-counter__digit';
      for (const segmentName of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        const segment = document.createElement('span');
        segment.className = `visitor-counter__segment visitor-counter__segment--${segmentName}`;
        digit.appendChild(segment);
      }
      display.appendChild(digit);
    }
  };

  const extractCount = (payload) => {
    const candidates = [
      payload?.value,
      payload?.count,
      payload?.data,
      payload?.data?.value,
      payload?.data?.count,
      payload?.result?.value,
      payload?.result?.count
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
    }

    throw new Error('Counter response did not include a numeric value.');
  };

  const requestCount = async (increment) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(`${COUNTER_ENDPOINT}${increment ? '/up' : ''}`, {
        method: 'GET',
        cache: 'no-store',
        mode: 'cors',
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Counter request failed with ${response.status}.`);
      return extractCount(await response.json());
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const initialize = async () => {
    if (document.querySelector('.visitor-counter')) return;

    addStyles();
    const { counter, display } = createCounter();
    const cachedValue = Number(safeStorage.get(LAST_VALUE_KEY));

    if (Number.isFinite(cachedValue) && cachedValue >= 0) {
      renderDigits(display, cachedValue);
    } else {
      renderBlank(display);
    }

    const alreadyCounted = safeStorage.get(COUNTED_KEY) === 'yes';
    const shouldIncrement = productionHosts.has(window.location.hostname) && !alreadyCounted;

    try {
      const count = await requestCount(shouldIncrement);
      if (shouldIncrement) safeStorage.set(COUNTED_KEY, 'yes');
      safeStorage.set(LAST_VALUE_KEY, String(count));
      renderDigits(display, count);
      counter.dataset.state = 'online';
      counter.setAttribute('aria-label', `${count.toLocaleString()} site visitors`);
      counter.title = `${count.toLocaleString()} approximate unique browsers since the counter was installed`;
    } catch (error) {
      counter.dataset.state = 'offline';
      counter.setAttribute('aria-label', 'Site visitor counter temporarily offline');
      counter.title = 'Visitor counter temporarily offline';
      console.warn('Visitor counter unavailable:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
