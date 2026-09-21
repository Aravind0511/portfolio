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

// ─── Contact Form & Real Email Delivery ──────────────────────
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const btnEmailApp = $('#btn-prefill-email');
  const btnWhatsApp = $('#btn-prefill-whatsapp');

  const getFormDataFormatted = () => {
    const name = (form.name && form.name.value || '').trim();
    const business = (form.business && form.business.value || '').trim();
    const email = (form.email && form.email.value || '').trim();
    const phone = (form.phone && form.phone.value || '').trim();
    const type = (form.project_type && form.project_type.value) || 'Not selected';
    const desc = (form.description && form.description.value || '').trim();
    const budget = (form.budget && form.budget.value) || 'Not specified';
    const timeline = (form.timeline && form.timeline.value) || 'Not specified';

    return {
      name: name || 'Interested Client',
      business: business || 'N/A',
      email: email || 'Not provided',
      phone: phone || 'Not provided',
      project_type: type,
      description: desc || 'Project enquiry',
      budget: budget,
      timeline: timeline
    };
  };

  // Direct mailto link generator
  const openMailto = () => {
    const data = getFormDataFormatted();
    const subject = encodeURIComponent(`Project Enquiry: ${data.project_type} — ${data.name}`);
    const body = encodeURIComponent(
      `Hello NovaCraft Studio Team,\n\n` +
      `I would like to discuss a project with your team.\n\n` +
      `--- CLIENT DETAILS ---\n` +
      `Name: ${data.name}\n` +
      `Business: ${data.business}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Requirement: ${data.project_type}\n` +
      `Budget Range: ${data.budget}\n` +
      `Preferred Timeline: ${data.timeline}\n\n` +
      `--- PROJECT DESCRIPTION ---\n` +
      `${data.description}\n\n` +
      `Sent via NovaCraft Studio Website`
    );
    window.location.href = `mailto:aravindvjm2004@gmail.com?subject=${subject}&body=${body}`;
  };

  // Direct WhatsApp link generator
  const openWhatsApp = () => {
    const data = getFormDataFormatted();
    const text = encodeURIComponent(
      `*New Project Enquiry — NovaCraft Studio*\n\n` +
      `*Name:* ${data.name}\n` +
      `*Business:* ${data.business}\n` +
      `*Email:* ${data.email}\n` +
      `*Phone:* ${data.phone}\n` +
      `*Requirement:* ${data.project_type}\n` +
      `*Budget:* ${data.budget}\n` +
      `*Timeline:* ${data.timeline}\n\n` +
      `*Description:*\n${data.description}`
    );
    window.open(`https://wa.me/918807006909?text=${text}`, '_blank');
  };

  if (btnEmailApp) btnEmailApp.addEventListener('click', openMailto);
  if (btnWhatsApp) btnWhatsApp.addEventListener('click', openWhatsApp);

  // Form Submit Handler
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('#submit-btn') || form.querySelector('[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    const original = btnText ? btnText.textContent : 'Send Project Enquiry';

    // Loading state
    btn.disabled = true;
    btn.style.opacity = '0.75';
    if (btnText) btnText.textContent = 'Sending email…';

    removeFormStatus(form);

    const data = getFormDataFormatted();
    const payload = {
      name: data.name,
      business: data.business,
      email: data.email,
      phone: data.phone,
      project_type: data.project_type,
      description: data.description,
      budget: data.budget,
      timeline: data.timeline,
      _subject: `New Project Enquiry from ${data.name} (${data.business}) — NovaCraft Studio`,
      _replyto: data.email,
      _template: 'table',
      _captcha: 'false'
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/aravindvjm2004@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resJson = await response.json().catch(() => ({}));

      if (response.ok && (resJson.success === 'true' || resJson.success === true)) {
        // Successful live email delivery
        if (btnText) btnText.textContent = '✓ Enquiry Delivered!';
        btn.style.background = 'var(--color-green)';

        showFormStatus(form, 'success', {
          title: 'Enquiry Delivered Successfully!',
          message: 'Your project details have been sent directly to our team inbox at <strong>aravindvjm2004@gmail.com</strong>. We will review your requirement and reply within 24 hours.'
        });

        setTimeout(() => {
          form.reset();
          btn.disabled = false;
          btn.style.opacity = '';
          btn.style.background = '';
          if (btnText) btnText.textContent = original;
        }, 6000);

      } else if (resJson.message && resJson.message.toLowerCase().includes('activation')) {
        // Needs 1-time activation by email owner
        if (btnText) btnText.textContent = '✓ Activation Sent!';
        btn.style.background = 'var(--color-accent)';

        showFormStatus(form, 'info', {
          title: 'One-Time Activation Link Sent!',
          message: 'FormSubmit has sent a 1-time confirmation email to <strong>aravindvjm2004@gmail.com</strong>. Open your Gmail and click <strong>"Activate Form"</strong> once to finalize auto-delivery. Your current enquiry can also be sent directly below:',
          showActions: true
        });

        btn.disabled = false;
        btn.style.opacity = '';

      } else {
        throw new Error(resJson.message || 'Server did not acknowledge delivery');
      }
    } catch (err) {
      console.warn('Direct HTTP fetch delivery note:', err);
      if (btnText) btnText.textContent = original;
      btn.disabled = false;
      btn.style.opacity = '';

      showFormStatus(form, 'fallback', {
        title: 'Send via Your Email App',
        message: 'Click below to send this enquiry directly from your email app (Gmail / Outlook) or WhatsApp:',
        showActions: true
      });

      // Automatically trigger email client
      openMailto();
    }
  });

  function showFormStatus(form, type, info) {
    removeFormStatus(form);

    const msg = document.createElement('div');
    msg.className = `form-status-card form-${type}`;
    msg.setAttribute('role', 'alert');

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="#4ade80" stroke-width="1.5"/>
        <path d="M6.5 10l2.5 2.5 4-4" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    } else {
      iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`;
    }

    let extraButtons = '';
    if (info.showActions) {
      extraButtons = `
        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-primary" id="btn-status-mailto">
            Send via Gmail / Mail App
          </button>
          <button type="button" class="btn btn-sm btn-secondary" id="btn-status-wa">
            Send via WhatsApp
          </button>
        </div>
      `;
    }

    msg.innerHTML = `
      <div class="status-icon">${iconSvg}</div>
      <div class="status-content">
        <strong>${info.title}</strong><br/>
        <span>${info.message}</span>
        ${extraButtons}
      </div>
    `;

    form.insertAdjacentElement('afterend', msg);
    requestAnimationFrame(() => msg.classList.add('visible'));

    const btnStatusMail = msg.querySelector('#btn-status-mailto');
    if (btnStatusMail) btnStatusMail.addEventListener('click', openMailto);

    const btnStatusWa = msg.querySelector('#btn-status-wa');
    if (btnStatusWa) btnStatusWa.addEventListener('click', openWhatsApp);
  }

  function removeFormStatus(form) {
    const existing = form.parentElement.querySelector('.form-status-card') || form.parentElement.querySelector('.form-success');
    if (existing) existing.remove();
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
