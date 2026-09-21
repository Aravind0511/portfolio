/* ============================================================
   script.js — Portfolio Interactive Behaviours
   Aravind | Independent Freelance Developer
   ============================================================ */

'use strict';

// ─── Utilities ───────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Header: scroll shrink / blur effect ────────────────────
(function initHeader() {
  const header = $('#site-header');
  if (!header) return;

  const toggle = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();

// ─── Mobile Menu ─────────────────────────────────────────────
(function initMobileMenu() {
  const btn   = $('.mobile-menu-btn');
  const menu  = $('#mobile-menu');
  const links = $$('.mobile-nav-link');
  if (!btn || !menu) return;

  const open  = () => {
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  links.forEach(link => link.addEventListener('click', close));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
})();

// ─── Scroll-reveal animations ────────────────────────────────
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const cards = $$('.reveal-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings in same parent
          const siblings = $$('.reveal-card', entry.target.parentElement);
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 400);
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach(card => obs.observe(card));
})();

// ─── Active nav link on scroll ───────────────────────────────
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(sec => obs.observe(sec));
})();

// ─── Contact Form Handling ───────────────────────────────────
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn     = form.querySelector('[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    const original = btnText.textContent;

    // Loading state
    btn.disabled = true;
    btn.style.opacity = '0.75';
    btnText.textContent = 'Sending…';

    // Collect data
    const data = Object.fromEntries(new FormData(form));

    // ── Replace this block with your actual backend / Formspree / EmailJS ──
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network

    // Success state
    btnText.textContent = '✓ Enquiry Sent!';
    btn.style.background = 'var(--color-green)';

    // Show success message
    showFormSuccess(form);

    // Reset after delay
    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.background = '';
      btnText.textContent = original;
      removeFormSuccess(form);
    }, 5000);
  });

  function showFormSuccess(form) {
    const existing = form.parentElement.querySelector('.form-success');
    if (existing) return;

    const msg = document.createElement('div');
    msg.className = 'form-success';
    msg.setAttribute('role', 'alert');
    msg.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="#4ade80" stroke-width="1.5"/>
        <path d="M6.5 10l2.5 2.5 4-4" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div>
        <strong>Enquiry sent successfully!</strong><br/>
        <span>Our team will review your requirement and get back to you within 24 hours.</span>
      </div>
    `;
    form.insertAdjacentElement('afterend', msg);
    requestAnimationFrame(() => msg.classList.add('visible'));
  }

  function removeFormSuccess(form) {
    const msg = form.parentElement.querySelector('.form-success');
    if (msg) msg.remove();
  }
})();

// ─── Smooth scroll for anchor links ──────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ─── Footer year ─────────────────────────────────────────────
(function setYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ─── Form success styles (injected) ──────────────────────────
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .form-success {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
      background: rgba(74, 222, 128, .07);
      border: 1px solid rgba(74, 222, 128, .25);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-top: 1rem;
      font-size: .88rem;
      color: #e2e8f0;
      line-height: 1.55;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity .3s ease, transform .3s ease;
    }
    .form-success.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .form-success strong { color: #4ade80; }
    .form-success svg { flex-shrink: 0; margin-top: 2px; }

    .nav-link.active {
      color: var(--color-white);
      background: rgba(255,255,255,.06);
    }
  `;
  document.head.appendChild(style);
})();
