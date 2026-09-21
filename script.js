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

// ─── Scroll Progress Bar ─────────────────────────────────────
(function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

// ─── Interactive Mouse Spotlight Glow ─────────────────────────
(function initSpotlight() {
  const cards = $$('.spotlight-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    }, { passive: true });
  });
})();

// ─── Hero 3D Perspective Tilt ────────────────────────────────
(function initHeroTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const visual = $('.hero-visual-wrapper');
  const mockup = $('.hero-mockup');
  if (!visual || !mockup) return;

  let ticking = false;
  let targetRotX = 0;
  let targetRotY = 0;

  visual.addEventListener('pointermove', e => {
    const rect = mockup.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    targetRotX = Math.max(-6, Math.min(6, -dy * 5));
    targetRotY = Math.max(-6, Math.min(6, dx * 5));

    if (!ticking) {
      requestAnimationFrame(() => {
        mockup.style.transform = `perspective(1200px) rotateX(${targetRotX.toFixed(2)}deg) rotateY(${targetRotY.toFixed(2)}deg)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  visual.addEventListener('pointerleave', () => {
    mockup.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  }, { passive: true });
})();

// ─── Hero Dashboard Number Counters & Chart ─────────────────
(function initDashboardCounters() {
  const dashboard = $('.mockup-dashboard');
  if (!dashboard) return;

  const counters = $$('.counter-num', dashboard);
  const bars = $$('.chart-bar', dashboard);

  const animateValue = (el, target, duration = 1400) => {
    const prefix = el.dataset.prefix || '';
    const isCurrency = el.dataset.format === 'currency';
    const start = 0;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * ease);

      if (isCurrency) {
        el.textContent = `${prefix}${current.toLocaleString('en-IN')}`;
      } else {
        el.textContent = `${prefix}${current}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(c => {
          const target = parseInt(c.dataset.target, 10);
          if (!isNaN(target)) animateValue(c, target);
        });

        bars.forEach((bar, idx) => {
          setTimeout(() => {
            bar.classList.add('animated');
          }, idx * 90 + 200);
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(dashboard);
})();

// ─── Hero Particle Constellation ─────────────────────────────
(function initHeroParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas || !canvas.parentElement) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 26), 48);
  const colors = ['#3b82f6', '#60a5fa', '#818cf8', '#38bdf8'];

  let mouse = { x: -9999, y: -9999, active: false };

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.35 + 0.12);
      this.radius = Math.random() * 1.5 + 0.8;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.45 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let isVisible = true;
  const obs = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.05 });
  obs.observe(canvas.parentElement);

  const onResize = () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };
  window.addEventListener('resize', onResize, { passive: true });

  const heroSection = canvas.parentElement;
  heroSection.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }, { passive: true });

  heroSection.addEventListener('pointerleave', () => {
    mouse.active = false;
  }, { passive: true });

  const animate = () => {
    if (isVisible) {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#60a5fa';
            ctx.globalAlpha = (1 - dist / 95) * 0.16;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Connect with mouse cursor
        if (mouse.active) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 135) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#38bdf8';
            ctx.globalAlpha = (1 - mdist / 135) * 0.35;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(animate);
  };

  animate();
})();

// ─── Kinetic Word Rotator ─────────────────────────────────────
(function initWordRotator() {
  const rotator = document.getElementById('headline-rotator');
  if (!rotator) return;

  const words = [...rotator.querySelectorAll('.rotator-word')];
  if (words.length <= 1) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let currentIndex = 0;
  let timer = null;

  const rotate = () => {
    const currentWord = words[currentIndex];
    const nextIndex = (currentIndex + 1) % words.length;
    const nextWord = words[nextIndex];

    currentWord.classList.remove('active');
    currentWord.classList.add('exit');

    setTimeout(() => {
      currentWord.classList.remove('exit');
    }, 600);

    nextWord.classList.add('active');
    currentIndex = nextIndex;
  };

  const startTimer = () => {
    if (!timer) timer = setInterval(rotate, 3100);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  startTimer();

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopTimer() : startTimer();
  });
})();

// ─── Magnetic Button Micro-Interaction ────────────────────────
(function initMagneticButtons() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const buttons = $$('.magnetic-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      const y = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });

    btn.addEventListener('pointerleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    }, { passive: true });
  });
})();

// ─── Process Timeline Sequential Focus ────────────────────────
(function initProcessTimeline() {
  const processSteps = document.getElementById('process-steps');
  if (!processSteps) return;

  const stepDiscuss = document.getElementById('step-discuss');
  if (!stepDiscuss) return;

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      stepDiscuss.classList.add('active-focus');
      obs.unobserve(entry.target);
    }
  }, { threshold: 0.3 });

  obs.observe(processSteps);
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

    // Loading state with animated spinner
    btn.disabled = true;
    btn.classList.add('btn-submitting');
    let spinner = btn.querySelector('.btn-spinner');
    if (!spinner) {
      spinner = document.createElement('span');
      spinner.className = 'btn-spinner';
      spinner.setAttribute('aria-hidden', 'true');
      btn.prepend(spinner);
    }
    if (btnText) btnText.textContent = 'Delivering enquiry…';

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
      _autoresponse: 'Thank you for reaching out to NovaCraft Studio! We have received your project enquiry and our team will review your requirement and get back to you within 24 hours.',
      _template: 'table',
      _captcha: 'false'
    };

    const cleanupButton = () => {
      btn.classList.remove('btn-submitting');
      const sp = btn.querySelector('.btn-spinner');
      if (sp) sp.remove();
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
        cleanupButton();
        if (btnText) btnText.textContent = '✓ Enquiry Delivered!';
        btn.style.background = 'var(--color-green)';

        // Trigger celebratory confetti burst
        fireConfetti();

        showFormStatus(form, 'success', {
          title: 'Enquiry Delivered Successfully!',
          message: 'Your project details have been sent directly to our team at <strong>aravindvjm2004@gmail.com</strong>.<br/><small style="display:inline-block;margin-top:0.4rem;color:#94a3b8;">Tip: If checking Gmail, make sure to also check the <strong>Updates</strong> or <strong>Spam</strong> folder and mark as "Not Spam" so subsequent enquiries land in your Primary tab.</small>',
          showActions: true
        });

        setTimeout(() => {
          form.reset();
          btn.disabled = false;
          btn.style.opacity = '';
          btn.style.background = '';
          if (btnText) btnText.textContent = original;
        }, 8000);

      } else if (resJson.message && resJson.message.toLowerCase().includes('activation')) {
        // Needs 1-time activation by email owner
        cleanupButton();
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
      cleanupButton();
      if (btnText) btnText.textContent = original;
      btn.disabled = false;
      btn.style.opacity = '';

      showFormStatus(form, 'fallback', {
        title: 'Connection Notice — Send Directly via App',
        message: 'Direct submission was interrupted (often caused by an adblocker or network privacy filter). You can still send this enquiry immediately using your preferred app:',
        showActions: true
      });
    }
  });

  // Pure Canvas Confetti Explosion
  function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const particles = [];
    const colors = ['#3b82f6', '#60a5fa', '#818cf8', '#a78bfa', '#4ade80', '#34d399', '#fbbf24', '#f472b6'];
    const count = 75;
    const originX = canvas.width / 2;
    const originY = Math.max(canvas.height - 80, canvas.height * 0.75);

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.7;
      const speed = 6 + Math.random() * 9;
      particles.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: 0.009 + Math.random() * 0.009,
        gravity: 0.24,
        drag: 0.985
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = 0;

      for (let p of particles) {
        if (p.opacity <= 0) continue;
        active++;

        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (active > 0) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    };

    render();
  }

  function showFormStatus(form, type, info) {
    removeFormStatus(form);

    const msg = document.createElement('div');
    msg.className = `form-status-card form-${type}`;
    msg.setAttribute('role', 'alert');

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg class="success-checkmark-svg" viewBox="0 0 52 52" aria-hidden="true">
          <circle class="checkmark-circle" cx="26" cy="26" r="24"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      `;
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
