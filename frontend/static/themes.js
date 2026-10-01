/**
 * themes.js – Nature Wallpaper & Color Theme Engine
 * Event Management System
 */

(function () {
  'use strict';

  // ─── 1. Curated High-Definition Nature Wallpapers ──────────────────────────
  const natureWallpapers = {
    dynamic: {
      id: 'dynamic',
      name: 'Dynamic by Page',
      icon: '🔄',
      badge: 'Auto',
      desc: 'Automatically applies a tailored nature scene to each page',
      thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    },
    aurora: {
      id: 'aurora',
      name: 'Cosmic Aurora',
      icon: '🌌',
      desc: 'Northern lights dancing over starry mountain horizons',
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=80'
    },
    forest: {
      id: 'forest',
      name: 'Emerald Forest',
      icon: '🌲',
      desc: 'Misty redwoods, pine trees & morning sunbeams',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80'
    },
    mountains: {
      id: 'mountains',
      name: 'Alpine Mountain Peaks',
      icon: '🏔️',
      desc: 'Majestic snow-capped alpine peaks at golden dawn',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'
    },
    ocean: {
      id: 'ocean',
      name: 'Pacific Ocean Waves',
      icon: '🌊',
      desc: 'Deep turquoise ocean swells, sea foam & tide',
      url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80'
    },
    sunrise: {
      id: 'sunrise',
      name: 'Yosemite Sunrise',
      icon: '🌅',
      desc: 'Golden sunrise mist over granite valley & lake',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    },
    sakura: {
      id: 'sakura',
      name: 'Zen Garden Sakura',
      icon: '🌸',
      desc: 'Tranquil Japanese cherry blossoms & mountain lake',
      url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=400&q=80'
    },
    autumn: {
      id: 'autumn',
      name: 'Golden Autumn Sunset',
      icon: '🍂',
      desc: 'Warm golden maple foliage & twilight coastal glow',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'
    },
    starry: {
      id: 'starry',
      name: 'Starry Milky Way',
      icon: '✨',
      desc: 'Deep celestial starlight & night mountain ridges',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80'
    },
    valley: {
      id: 'valley',
      name: 'Misty Green Valley',
      icon: '🍃',
      desc: 'Lush rolling green hills, morning fog & sky',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80',
      thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80'
    }
  };

  // Default Nature Wallpaper mapped per page
  const pageNatureDefaults = {
    dashboard: 'aurora',
    history: 'forest',
    event: 'mountains',
    profile: 'ocean',
    settings: 'aurora',
    register: 'sunrise',
    scanner: 'starry',
    verify: 'valley',
    host: 'autumn',
    analytics: 'autumn',
    login: 'sakura',
    admin: 'forest'
  };

  // ─── 2. Page Detection Helper ─────────────────────────────────────────────
  function detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('dashboard') || path === '/' || path === '') return 'dashboard';
    if (path.includes('history') || path.includes('booking')) return 'history';
    if (path.includes('event/')) return 'event';
    if (path.includes('settings')) return 'settings';
    if (path.includes('profile')) return 'profile';
    if (path.includes('register/')) return 'register';
    if (path.includes('scan_ticket') || path.includes('scanner')) return 'scanner';
    if (path.includes('verify')) return 'verify';
    if (path.includes('analytics') || path.includes('host')) return 'analytics';
    if (path.includes('login') || path.includes('forgot')) return 'login';
    if (path.includes('admin')) return 'admin';
    return 'dashboard';
  }

  // ─── 3. Apply Nature Wallpaper ────────────────────────────────────────────
  function applyNatureWallpaper(themeId) {
    const root = document.documentElement;
    const body = document.body;
    const currentPage = detectCurrentPage();

    // Clear all explicit theme classes
    Object.keys(natureWallpapers).forEach(k => {
      body.classList.remove(`theme-nature-${k}`);
    });

    let effectiveTheme = themeId;
    if (!effectiveTheme || effectiveTheme === 'dynamic') {
      effectiveTheme = pageNatureDefaults[currentPage] || 'aurora';
      body.classList.add(`bg-${currentPage}`);
      const bgData = natureWallpapers[effectiveTheme];
      if (bgData && bgData.url) {
        root.style.setProperty('--page-bg-image', `url('${bgData.url}')`);
      }
    } else {
      const bgData = natureWallpapers[effectiveTheme];
      if (bgData && bgData.url) {
        root.style.setProperty('--page-bg-image', `url('${bgData.url}')`);
        body.classList.add(`theme-nature-${effectiveTheme}`);
      }
    }

    // Persist choice in storage
    localStorage.setItem('natureWallpaperTheme', themeId || 'dynamic');

    // Update Modal UI Active States if rendered
    updateNatureModalActiveState(themeId || 'dynamic');
  }

  // ─── 4. Color Accent Themes ───────────────────────────────────────────────
  const colorThemes = {
    ocean: {
      '--primary': '#00f2fe',
      '--primary-dark': '#4facfe',
      '--secondary': '#ff0080',
    },
    emerald: {
      '--primary': '#10b981',
      '--primary-dark': '#059669',
      '--secondary': '#06b6d4',
    },
    sunset: {
      '--primary': '#fb923c',
      '--primary-dark': '#f97316',
      '--secondary': '#f43f5e',
    },
    neon: {
      '--primary': '#a78bfa',
      '--primary-dark': '#7c3aed',
      '--secondary': '#ec4899',
    },
  };

  function applyColorTheme(themeName) {
    const theme = colorThemes[themeName] || colorThemes['ocean'];
    const root = document.documentElement;
    Object.entries(theme).forEach(([varName, value]) => {
      root.style.setProperty(varName, value);
    });
    localStorage.setItem('selectedColorTheme', themeName);
  }

  // ─── 5. Nature Wallpaper Modal Switcher UI ────────────────────────────────
  function injectThemeCoreStyles() {
    if (document.getElementById('themes-dynamic-style')) return;
    const style = document.createElement('style');
    style.id = 'themes-dynamic-style';
    style.textContent = `
      .nature-theme-btn {
        background: rgba(16, 185, 129, 0.15) !important;
        color: #10b981 !important;
        border: 1px solid rgba(16, 185, 129, 0.45) !important;
        padding: 0.42rem 0.9rem !important;
        border-radius: 50px !important;
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        backdrop-filter: blur(8px) !important;
        margin: 0 !important;
        outline: none !important;
        box-sizing: border-box !important;
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }
      .nature-theme-btn:hover {
        background: #10b981 !important;
        color: #0f172a !important;
        border-color: #10b981 !important;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.45) !important;
        transform: translateY(-1px) !important;
      }
      body.light-mode .nature-theme-btn {
        background: #ecfdf5 !important;
        color: #065f46 !important;
        border-color: #a7f3d0 !important;
      }
      body.light-mode .nature-theme-btn:hover {
        background: #10b981 !important;
        color: #ffffff !important;
        border-color: #10b981 !important;
      }
      .nature-modal-overlay {
        display: none;
        position: fixed !important;
        inset: 0 !important;
        background: rgba(0, 0, 0, 0.8) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        z-index: 999999 !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 1.5rem !important;
        box-sizing: border-box !important;
      }
      .nature-modal-content {
        background: #0f172a !important;
        backdrop-filter: blur(24px) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 20px !important;
        padding: 2rem !important;
        max-width: 760px !important;
        width: 100% !important;
        max-height: 85vh !important;
        overflow-y: auto !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
        box-sizing: border-box !important;
      }
      body.light-mode .nature-modal-content {
        background: #ffffff !important;
        border-color: rgba(0, 0, 0, 0.1) !important;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15) !important;
      }
      .nature-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
        gap: 1rem !important;
        margin-top: 1.4rem !important;
      }
      .nature-card {
        position: relative !important;
        border-radius: 14px !important;
        overflow: hidden !important;
        cursor: pointer !important;
        border: 2px solid rgba(255, 255, 255, 0.12) !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        background: rgba(0, 0, 0, 0.4) !important;
        height: 115px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-end !important;
        padding: 0.85rem !important;
        box-sizing: border-box !important;
      }
      .nature-card.active {
        border-color: #00f2fe !important;
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.5) !important;
      }
      .nature-card img.nature-card-bg {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        transition: transform 0.4s ease !important;
        z-index: 1 !important;
      }
      .nature-card:hover img.nature-card-bg {
        transform: scale(1.08) !important;
      }
      .nature-card::before {
        content: '' !important;
        position: absolute !important;
        inset: 0 !important;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.25) 60%, transparent 100%) !important;
        z-index: 2 !important;
      }
      .nature-card-info {
        position: relative !important;
        z-index: 3 !important;
      }
      .nature-card-title {
        color: white !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        margin-bottom: 2px !important;
      }
      .nature-card-desc {
        color: rgba(255, 255, 255, 0.7) !important;
        font-size: 0.72rem !important;
        line-height: 1.2 !important;
      }
      .nature-active-badge {
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        background: #00f2fe !important;
        color: #0f172a !important;
        font-size: 0.68rem !important;
        font-weight: 800 !important;
        padding: 2px 7px !important;
        border-radius: 6px !important;
        z-index: 4 !important;
        text-transform: uppercase !important;
      }
    `;
    document.head.appendChild(style);
  }

  function buildNatureModal() {
    injectThemeCoreStyles();
    if (document.getElementById('natureWallpaperModal')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'natureWallpaperModal';
    modalOverlay.className = 'nature-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="nature-modal-content">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <h2 style="font-family: var(--font-heading); color: white; font-size: 1.5rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              🌿 Nature Background Wallpapers
            </h2>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">
              Select a nature scene or let the system automatically switch backgrounds per page.
            </p>
          </div>
          <button type="button" id="closeNatureModalBtn" style="background: none; border: none; color: var(--text-muted); font-size: 1.8rem; cursor: pointer; line-height: 1; padding: 0 4px;">&times;</button>
        </div>

        <div class="nature-grid" id="natureCardsGrid">
          ${Object.values(natureWallpapers).map(wp => `
            <div class="nature-card" data-theme-id="${wp.id}" onclick="window.selectNatureTheme('${wp.id}')">
              <img src="${wp.thumb}" alt="${wp.name}" class="nature-card-bg" loading="lazy">
              ${wp.badge ? `<span class="nature-active-badge">${wp.badge}</span>` : ''}
              <div class="nature-card-info">
                <div class="nature-card-title">${wp.icon} ${wp.name}</div>
                <div class="nature-card-desc">${wp.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <span style="color: var(--text-muted); font-size: 0.8rem;">
            💡 Saved to your browser preferences.
          </span>
          <button type="button" onclick="window.closeNatureModal()" class="register-btn-sm" style="background: var(--primary); color: #0f172a; padding: 0.5rem 1.4rem; font-weight: 700; border-radius: 8px;">
            Done
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Event listeners
    const closeBtn = document.getElementById('closeNatureModalBtn');
    if (closeBtn) closeBtn.onclick = window.closeNatureModal;

    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) window.closeNatureModal();
    };
  }

  function updateNatureModalActiveState(activeId) {
    const grid = document.getElementById('natureCardsGrid');
    if (!grid) return;
    grid.querySelectorAll('.nature-card').forEach(card => {
      const cardId = card.getAttribute('data-theme-id');
      if (cardId === activeId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // ─── 6. Global Window Handlers ────────────────────────────────────────────
  window.openNatureModal = function () {
    buildNatureModal();
    const currentTheme = localStorage.getItem('natureWallpaperTheme') || 'dynamic';
    updateNatureModalActiveState(currentTheme);
    const modal = document.getElementById('natureWallpaperModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeNatureModal = function () {
    const modal = document.getElementById('natureWallpaperModal');
    if (modal) modal.style.display = 'none';
  };

  window.selectNatureTheme = function (themeId) {
    applyNatureWallpaper(themeId);
    if (window.showToast) {
      const name = (natureWallpapers[themeId] || {}).name || themeId;
      window.showToast(`🌿 Wallpaper updated: ${name}`, 'success', 2000);
    }
  };

  // ─── 7. Initialization ────────────────────────────────────────────────────
  function init() {
    injectThemeCoreStyles();

    const savedWallpaper = localStorage.getItem('natureWallpaperTheme') || 'dynamic';
    applyNatureWallpaper(savedWallpaper);

    const savedColor = localStorage.getItem('selectedColorTheme') || 'ocean';
    applyColorTheme(savedColor);
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.natureWallpapers = natureWallpapers;
  window.applyNatureWallpaper = applyNatureWallpaper;
  window.applyColorTheme = applyColorTheme;
})();
