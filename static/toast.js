/**
 * toast.js – Premium toast notification system
 */
(function () {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed; bottom: 1.5rem; right: 1.5rem;
        z-index: 999999; display: flex; flex-direction: column; gap: 0.75rem;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: 'rgba(16,185,129,0.15)',
    error:   'rgba(239,68,68,0.15)',
    info:    'rgba(0,242,254,0.12)',
    warning: 'rgba(251,191,36,0.15)',
  };
  const borders = {
    success: '#10b981', error: '#ef4444', info: '#00f2fe', warning: '#fbbf24',
  };

  window.showToast = function (message, type = 'info', duration = 3500) {
    const c = getContainer();
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${colors[type]}; backdrop-filter: blur(14px);
      border: 1px solid ${borders[type]}; border-radius: 14px;
      padding: 0.85rem 1.2rem; display: flex; align-items: center; gap: 0.75rem;
      font-size: 0.93rem; font-weight: 500; color: var(--text-main, #f1f5f9);
      min-width: 260px; max-width: 360px; pointer-events: all;
      box-shadow: 0 8px 30px rgba(0,0,0,0.35);
      transform: translateX(120%); transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease;
      opacity: 0; cursor: pointer; font-family: 'Inter', sans-serif;
    `;
    toast.innerHTML = `<span style="font-size:1.2rem;flex-shrink:0">${icons[type]}</span><span>${message}</span>`;
    toast.addEventListener('click', () => dismiss(toast));
    c.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;
  };

  function dismiss(toast) {
    clearTimeout(toast._timer);
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 380);
  }

  // Flash messages from Flask (server-rendered)
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-flash]').forEach(el => {
      const msg = el.getAttribute('data-flash');
      const type = el.getAttribute('data-flash-type') || 'info';
      if (msg) setTimeout(() => window.showToast(msg, type), 400);
      el.remove();
    });
  });
})();
