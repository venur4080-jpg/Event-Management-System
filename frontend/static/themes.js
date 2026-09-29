// themes.js
// Defines color palettes for customizable themes and applies CSS variables

const themes = {
  ocean: {
    '--primary': '#0ea5e9', // cyan-500
    '--secondary': '#0284c7', // cyan-600
    '--accent': '#22d3ee', // cyan-300
    '--bg-light': '#f0f9ff',
    '--bg-dark': '#0f172a',
    '--text-light': '#1e293b',
    '--text-dark': '#e2e8f0',
  },
  sunset: {
    '--primary': '#fb923c', // orange-400
    '--secondary': '#f97316', // orange-500
    '--accent': '#fdba74', // orange-300
    '--bg-light': '#fff7ed',
    '--bg-dark': '#1e293b',
    '--text-light': '#1c1917',
    '--text-dark': '#f3f4f6',
  },
  neon: {
    '--primary': '#a78bfa', // violet-400
    '--secondary': '#7c3aed', // violet-600
    '--accent': '#c4b5fd', // violet-300
    '--bg-light': '#f5f3ff',
    '--bg-dark': '#111827',
    '--text-light': '#1f2937',
    '--text-dark': '#e5e7eb',
  },
};

// Apply a theme by setting CSS variables on :root
function applyTheme(themeName) {
  const theme = themes[themeName] || themes['ocean'];
  const root = document.documentElement;
  Object.entries(theme).forEach(([varName, value]) => {
    root.style.setProperty(varName, value);
  });
  // Persist selection
  localStorage.setItem('selectedTheme', themeName);
}

// Load persisted theme on page load
function loadPersistedTheme() {
  const saved = localStorage.getItem('selectedTheme') || 'ocean';
  applyTheme(saved);
  const selector = document.getElementById('themeSelect');
  if (selector) selector.value = saved;
}

// Expose functions globally
window.themes = themes;
window.applyTheme = applyTheme;
window.loadPersistedTheme = loadPersistedTheme;
