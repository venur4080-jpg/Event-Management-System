/**
 * animations.js – Micro-interaction utilities for Event Management System
 */

// ─── Ripple Effect ───────────────────────────────────────────────────────────
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const rect = button.getBoundingClientRect();
  circle.style.cssText = `
    width: ${diameter}px; height: ${diameter}px;
    left: ${event.clientX - rect.left - radius}px;
    top: ${event.clientY - rect.top - radius}px;
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.25);
    transform: scale(0); animation: ripple-anim 0.55s linear;
    pointer-events: none;
  `;
  const existing = button.querySelector('.ripple-span');
  if (existing) existing.remove();
  circle.classList.add('ripple-span');
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

// Inject ripple keyframe once
(function injectRippleCSS() {
  if (document.getElementById('ripple-style')) return;
  const style = document.createElement('style');
  style.id = 'ripple-style';
  style.textContent = `
    @keyframes ripple-anim {
      to { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ─── Attach Ripples to All Buttons ───────────────────────────────────────────
function attachRipples() {
  document.querySelectorAll('button, .register-btn, .register-btn-sm, .carousel-btn, .calendar-nav-btn').forEach(btn => {
    btn.removeEventListener('click', createRipple);
    btn.addEventListener('click', createRipple);
  });
}

// ─── Staggered Fade-In for Cards ─────────────────────────────────────────────
function animateCardsIn() {
  const cards = document.querySelectorAll('.glass-panel.event-card, .info-card, .stat-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'none';
    setTimeout(() => {
      card.style.transition = `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 60);
  });
}

// ─── Parallax Tilt on Event Cards ────────────────────────────────────────────
function attachTiltEffect() {
  document.querySelectorAll('.glass-panel.event-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = -(y / rect.height) * 8;
      const rotY = (x / rect.width) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.4s ease';
    });
  });
}

// ─── Navbar Scroll Shadow ─────────────────────────────────────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.35)';
      navbar.style.backdropFilter = 'blur(20px)';
    } else {
      navbar.style.boxShadow = '';
      navbar.style.backdropFilter = '';
    }
  });
}

// ─── Smooth Counter for Stat Numbers ─────────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const startVal = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(startVal + (target - startVal) * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(el, target);
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

// ─── Page Transition Fade ──────────────────────────────────────────────────────
function initPageFade() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.35s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto"]):not([href^="tel"])').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });
}

// ─── Init All Animations ──────────────────────────────────────────────────────
function initAnimations() {
  attachRipples();
  animateCardsIn();
  attachTiltEffect();
  initNavbarScroll();
  initCounters();
}

// Re-run ripples after dynamic DOM changes
window.reInitAnimations = function() {
  attachRipples();
  attachTiltEffect();
  animateCardsIn();
};

document.addEventListener('DOMContentLoaded', () => {
  initPageFade();
  initAnimations();
});
