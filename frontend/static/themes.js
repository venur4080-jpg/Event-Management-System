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
  function buildNatureModal() {
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

  // ─── 6. Inject Navbar Nature Switcher Button ──────────────────────────────
  function injectNavbarNatureButton() {
    const navContainers = document.querySelectorAll('.navbar .nav-links, .navbar .nav-container');
    if (!navContainers.length || document.getElementById('natureThemeBtn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'natureThemeBtn';
    btn.className = 'nature-theme-btn';
    btn.title = 'Change Nature Background';
    btn.innerHTML = `🌿 Nature BG`;
    btn.onclick = window.openNatureModal;

    // Prefer inserting before the themeToggle or logout button
    const targetNav = document.querySelector('.navbar .nav-links') || navContainers[0];
    const themeToggle = targetNav.querySelector('#themeToggle') || targetNav.querySelector('.logout-btn');
    if (themeToggle) {
      targetNav.insertBefore(btn, themeToggle);
    } else {
      targetNav.appendChild(btn);
    }
  }

  // ─── 7. Global Window Handlers ────────────────────────────────────────────
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

  // ─── 8. Initialization ────────────────────────────────────────────────────
  function init() {
    const savedWallpaper = localStorage.getItem('natureWallpaperTheme') || 'dynamic';
    applyNatureWallpaper(savedWallpaper);

    const savedColor = localStorage.getItem('selectedColorTheme') || 'ocean';
    applyColorTheme(savedColor);

    injectNavbarNatureButton();
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
