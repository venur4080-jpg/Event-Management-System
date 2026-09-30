/**
 * animations.js – Universal Scroll Reveal & Micro-Interaction Suite
 * Event Management System
 */

(function () {
  'use strict';

  // ─── 1. Ripple Effect for Buttons ──────────────────────────────────────────
  function createRipple(event) {
    const button = event.currentTarget;
    if (!button) return;
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

  // Inject ripple animation keyframe once
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `@keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }`;
    document.head.appendChild(style);
  }

  function attachRipples() {
    document.querySelectorAll('button, .register-btn, .register-btn-sm, .carousel-btn, .btn-primary, .btn-secondary, .filter-tab-btn').forEach(btn => {
      btn.removeEventListener('click', createRipple);
      btn.addEventListener('click', createRipple);
    });
  }

  // ─── 2. Universal Scroll-Reveal Intersection Observer ─────────────────────
  let scrollObserver = null;

  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      document.querySelectorAll('.reveal-on-scroll, .event-card, .booking-card, .summary-stat-box, .metric-card, .chart-card').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Once revealed, unobserve to free resources
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    scanAndObserveElements();
  }

  function scanAndObserveElements() {
    const targets = document.querySelectorAll(`
      .event-card, 
      .booking-card, 
      .summary-stat-box, 
      .login-card, 
      .verify-card, 
      .scanner-card, 
      .detail-card, 
      .metric-card, 
      .chart-card, 
      .events-table-card, 
      .feed-item, 
      .hero-section, 
      .filter-search-bar, 
      .form-container, 
      .profile-card,
      .reveal-on-scroll
    `);

    // Group elements by parent container for elegant staggered cascade
    const containers = new Set();
    targets.forEach(el => {
      if (!el.classList.contains('reveal-on-scroll')) {
        el.classList.add('reveal-on-scroll');
      }
      if (el.parentElement) {
        containers.add(el.parentElement);
      }
      if (scrollObserver && !el.classList.contains('is-revealed')) {
        scrollObserver.observe(el);
      }
    });

    // Apply staggered delays to siblings within grid containers
    containers.forEach(parent => {
      const children = parent.querySelectorAll(':scope > .reveal-on-scroll:not(.is-revealed)');
      children.forEach((child, index) => {
        const staggerIdx = Math.min((index % 8) + 1, 8);
        child.classList.add(`stagger-${staggerIdx}`);
      });
    });
  }

  // ─── 3. Navbar Dynamic Scroll Elevation ───────────────────────────────────
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 15) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    if (window.scrollY > 15) {
      navbar.classList.add('scrolled');
    }
  }

  // ─── 4. Parallax 3D Tilt on Hover (Cards) ─────────────────────────────────
  function attachTiltEffect() {
    document.querySelectorAll('.event-card, .booking-card').forEach(card => {
      if (card.__hasTilt) return;
      card.__hasTilt = true;

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotX = -(y / rect.height) * 6;
        const rotY = (x / rect.width) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-6px) scale(1.012)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease-out';
      });
    });
  }

  // ─── 5. Animated Number Counters ──────────────────────────────────────────
  function initCounters() {
    document.querySelectorAll('[data-counter], #totalCount, #activeCount, #cancelledCount, #upcomingCount, #pastCount').forEach(el => {
      const textVal = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
      if (isNaN(textVal) || textVal <= 0 || el.__animatedCounter) return;

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.__animatedCounter = true;
            animateCounter(el, textVal, 900);
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(el);
    });
  }

  function animateCounter(el, target, duration = 900) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  // ─── 6. Mutation Observer for Dynamic Filtering & AJAX ────────────────────
  function initDOMWatcher() {
    const observer = new MutationObserver(() => {
      scanAndObserveElements();
      attachRipples();
      attachTiltEffect();
    });

    const root = document.querySelector('main') || document.body;
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  // ─── 7. Global Lifecycle Hooks ────────────────────────────────────────────
  function initAll() {
    initScrollReveal();
    initNavbarScroll();
    attachRipples();
    attachTiltEffect();
    initCounters();
    initDOMWatcher();
  }

  // Expose global re-init function for dynamic page scripts
  window.reInitAnimations = function () {
    scanAndObserveElements();
    attachRipples();
    attachTiltEffect();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
