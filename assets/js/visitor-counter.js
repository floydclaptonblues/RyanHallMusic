(() => {
  const COUNTER_ENDPOINT = 'https://api.counterapi.dev/v1/ryanhallguitar-com/site-visitors';
  const COUNTED_KEY = 'ryanHallVisitorCounted';
  const LAST_VALUE_KEY = 'ryanHallVisitorCounterLastValue';
  const productionHosts = new Set(['ryanhallguitar.com', 'www.ryanhallguitar.com']);

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
    const alreadyCounted = safeStorage.get(COUNTED_KEY) === 'yes';
    const shouldIncrement = productionHosts.has(window.location.hostname) && !alreadyCounted;

    try {
      const count = await requestCount(shouldIncrement);
      if (shouldIncrement) safeStorage.set(COUNTED_KEY, 'yes');
      safeStorage.set(LAST_VALUE_KEY, String(count));

      window.dispatchEvent(new CustomEvent('ryan-hall-visitor-count', {
        detail: { count }
      }));
    } catch (error) {
      console.warn('Silent visitor counter unavailable:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
