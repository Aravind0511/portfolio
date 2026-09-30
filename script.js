/* ============================================================
   script.js — Portfolio Interactive Behaviours
   TechNest Studio | Digital Engineering Team
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

// ─── Brand Logo Interactive 3D Perspective Tilt ───────────────
(function initBrandLogo3D() {
  const logoWrapper = $('#nav-brand-logo-3d');
  const navLogo = $('.nav-logo');
  if (!logoWrapper || !navLogo) return;

  const inner = logoWrapper.querySelector('.logo-3d-inner');
  if (!inner) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let rafId = null;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isHovered = false;

  const update = () => {
    currentRotX += (targetRotX - currentRotX) * 0.18;
    currentRotY += (targetRotY - currentRotY) * 0.18;

    if (isHovered) {
      inner.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale(1.04) translateZ(3px)`;
      rafId = requestAnimationFrame(update);
    } else {
      if (Math.abs(currentRotX) > 0.08 || Math.abs(currentRotY) > 0.08) {
        inner.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
        rafId = requestAnimationFrame(update);
      } else {
        inner.style.transform = '';
        rafId = null;
      }
    }
  };

  navLogo.addEventListener('pointermove', e => {
    const rect = logoWrapper.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    // Ultra-subtle tilt within ±3deg (prevents distortion)
    targetRotY = Math.max(-3, Math.min(3, (x / 24) * 3));
    targetRotX = Math.max(-3, Math.min(3, (-y / 24) * 3));

    if (!isHovered) {
      isHovered = true;
      if (!rafId) rafId = requestAnimationFrame(update);
    }
  }, { passive: true });

  navLogo.addEventListener('pointerleave', () => {
    isHovered = false;
    targetRotX = 0;
    targetRotY = 0;
    if (!rafId) rafId = requestAnimationFrame(update);
  }, { passive: true });
})();

// ─── Mobile Menu & Navigation Drawer ──────────────────────────
(function initMobileMenu() {
  const btn = $('#mobile-menu-btn') || $('.mobile-menu-btn');
  const backdrop = $('#mobile-menu-backdrop');
  const drawer = $('#mobile-menu');
  const closeBtn = $('#mobile-drawer-close');
  const links = $$('.mobile-nav-link');
  const drawerLogo = $('.mobile-drawer-logo');
  const main = $('main');
  if (!btn || !drawer) return;

  const open = () => {
    btn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) {
      backdrop.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('active');
    }
    drawer.classList.add('open');
    document.body.classList.add('mobile-nav-open');
    document.body.style.overflow = 'hidden';
    if (main) main.inert = true;
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }
  };

  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) {
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('active');
    }
    drawer.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    document.body.style.overflow = '';
    if (main) main.inert = false;
  };

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      close();
      btn.focus();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', close);
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      close();
    });
  });

  if (drawerLogo) {
    drawerLogo.addEventListener('click', close);
  }

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      close();
      btn.focus();
    }
  });

  // Close when resized to desktop viewport
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && drawer.classList.contains('open')) {
      close();
    }
  }, { passive: true });
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

// ─── Signature Visual Moment: ✨ IMAGINE • 🛠️ BUILD • 🚀 TRANSFORM ──
(function initMagicalWordsSequence() {
  const stage = document.getElementById('signature-magical-stage');
  if (!stage) return;

  const card = document.getElementById('magical-stage-card');
  const wordImagine = document.getElementById('word-imagine');
  const wordBuild = document.getElementById('word-build');
  const wordTransform = document.getElementById('word-transform');
  const fullPhrase = document.getElementById('magical-full-phrase');
  const taglineReveal = document.getElementById('hero-tagline-reveal');
  const canvas = document.getElementById('magical-canvas');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    if (wordImagine) wordImagine.style.display = 'none';
    if (wordBuild) wordBuild.style.display = 'none';
    if (wordTransform) wordTransform.style.display = 'none';
    if (fullPhrase) fullPhrase.classList.add('active');
    if (taglineReveal) taglineReveal.classList.add('active');
    return;
  }

  // --- Canvas Particle System for Stage (Micro-Particles, Calm & Elegant) ---
  let ctx = null;
  let particles = [];
  let isCanvasActive = true;
  let animFrameId = null;

  if (canvas && canvas.getContext) {
    ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (rect.width + 60) * dpr;
      canvas.height = (rect.height + 48) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    class MagicalSparkle {
      constructor(cx, cy, color, speedScale = 0.8) {
        this.x = cx + (Math.random() - 0.5) * 50;
        this.y = cy + (Math.random() - 0.5) * 16;
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.6 + 0.2) * speedScale;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.15;
        this.size = Math.random() * 1.6 + 0.8;
        this.color = color;
        this.alpha = 0.85;
        this.decay = Math.random() * 0.02 + 0.016;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw(c) {
        if (this.alpha <= 0) return;
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 4;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    const emitSparkles = (color, count = 7, speedScale = 0.8) => {
      if (!ctx || !stage) return;
      const rect = stage.getBoundingClientRect();
      const cx = (rect.width + 60) / 2;
      const cy = (rect.height + 48) / 2;
      for (let i = 0; i < count; i++) {
        particles.push(new MagicalSparkle(cx, cy, color, speedScale));
      }
    };

    const renderLoop = () => {
      if (!ctx) return;
      const rect = stage.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width + 60, rect.height + 48);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      if (isCanvasActive || particles.length > 0) {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    };

    animFrameId = requestAnimationFrame(renderLoop);

    // --- Sequential Word Timeline ---
    // Sequence: ✨ IMAGINE → 🛠️ BUILD → 🚀 TRANSFORM
    setTimeout(() => {
      // Step 1: ✨ IMAGINE
      if (wordImagine) {
        wordImagine.classList.add('active');
        emitSparkles('#c084fc', 8, 0.9);
        emitSparkles('#facc15', 4, 0.7);
      }
    }, 250);

    setTimeout(() => {
      // Step 2: 🛠️ BUILD
      if (wordImagine) {
        wordImagine.classList.remove('active');
        wordImagine.classList.add('exit');
      }
      setTimeout(() => {
        if (wordImagine) wordImagine.classList.remove('exit');
      }, 400);

      if (wordBuild) {
        wordBuild.classList.add('active');
        emitSparkles('#38bdf8', 8, 0.9);
        emitSparkles('#60a5fa', 4, 0.8);
      }
    }, 1450);

    setTimeout(() => {
      // Step 3: 🚀 TRANSFORM
      if (wordBuild) {
        wordBuild.classList.remove('active');
        wordBuild.classList.add('exit');
      }
      setTimeout(() => {
        if (wordBuild) wordBuild.classList.remove('exit');
      }, 400);

      if (wordTransform) {
        wordTransform.classList.add('active');
        emitSparkles('#a855f7', 8, 0.9);
        emitSparkles('#38bdf8', 5, 0.8);
      }
    }, 2650);

    setTimeout(() => {
      // Step 4: Settle into Full Unified Phrase
      if (wordTransform) {
        wordTransform.classList.remove('active');
        wordTransform.classList.add('exit');
      }
      setTimeout(() => {
        if (wordTransform) wordTransform.classList.remove('exit');
      }, 400);

      if (fullPhrase) {
        fullPhrase.classList.add('active');
        emitSparkles('#c084fc', 6, 0.7);
        emitSparkles('#38bdf8', 6, 0.7);

        // Subtle sequential soft glow across the unified phrase words
        const itemImagine = fullPhrase.querySelector('.phrase-item-imagine');
        const itemBuild = fullPhrase.querySelector('.phrase-item-build');
        const itemTransform = fullPhrase.querySelector('.phrase-item-transform');

        setTimeout(() => {
          if (itemImagine) itemImagine.classList.add('soft-glow-imagine');
        }, 150);

        setTimeout(() => {
          if (itemImagine) itemImagine.classList.remove('soft-glow-imagine');
          if (itemBuild) itemBuild.classList.add('soft-glow-build');
        }, 550);

        setTimeout(() => {
          if (itemBuild) itemBuild.classList.remove('soft-glow-build');
          if (itemTransform) itemTransform.classList.add('soft-glow-transform');
        }, 950);

        setTimeout(() => {
          if (itemTransform) itemTransform.classList.remove('soft-glow-transform');
          // Complete phrase settles into its normal state
        }, 1400);
      }

      setTimeout(() => {
        isCanvasActive = false;
      }, 2500);
    }, 3850);

    setTimeout(() => {
      // Step 5: Reveal Tagline with gentle shimmer sweep
      if (taglineReveal) {
        taglineReveal.classList.add('active');
      }
    }, 4300);
  }

  // --- Interactive 3D Depth / Parallax on hover (Calm & Subtle) ---
  if (card) {
    let cardTicking = false;
    let cardRotX = 0;
    let cardRotY = 0;

    const handlePointerMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Soft tilt: max 4 degrees
      cardRotX = -((y - centerY) / centerY) * 4;
      cardRotY = ((x - centerX) / centerX) * 5;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (!cardTicking) {
        requestAnimationFrame(() => {
          card.style.transform = `perspective(800px) rotateX(${cardRotX.toFixed(2)}deg) rotateY(${cardRotY.toFixed(2)}deg) translateZ(4px)`;
          cardTicking = false;
        });
        cardTicking = true;
      }
    };

    const handlePointerLeave = () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    };

    stage.addEventListener('pointermove', handlePointerMove, { passive: true });
    stage.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  }
})();

// ─── Interactive 3D Logo Parallax & Tilt (Gentle Specular) ───
(function init3DLogoInteractions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const logos = $$('.nav-logo');
  if (!logos.length) return;

  logos.forEach(navLogo => {
    const logo3D = navLogo.querySelector('.brand-logo-3d');
    const inner = navLogo.querySelector('.logo-3d-inner');
    const glare = navLogo.querySelector('.logo-3d-glare');
    if (!logo3D || !inner) return;

    let ticking = false;

    navLogo.addEventListener('pointermove', e => {
      const rect = logo3D.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Subtle tilt: max 7 degrees
      const rotX = -((y - cy) / cy) * 7;
      const rotY = ((x - cx) / cx) * 8;

      if (glare) {
        const px = Math.max(15, Math.min(85, (x / rect.width) * 100));
        const py = Math.max(15, Math.min(85, (y / rect.height) * 100));
        glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.45) 0%, rgba(192, 132, 252, 0.18) 40%, transparent 70%)`;
      }

      if (!ticking) {
        requestAnimationFrame(() => {
          inner.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.05)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    navLogo.addEventListener('pointerleave', () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }, { passive: true });
  });
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

  const nameInput = form.querySelector('[name="name"]');
  const emailInput = form.querySelector('[name="email"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const typeSelect = form.querySelector('[name="project_type"]');
  const descInput = form.querySelector('[name="description"]');

  const warningSvg = `<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;

  const setFieldError = (field, message) => {
    if (!field) return;
    field.classList.add('input-error');
    field.classList.remove('input-valid');
    field.setAttribute('aria-invalid', 'true');
    field.setCustomValidity(message || 'Invalid value');

    const errorId = field.getAttribute('aria-describedby');
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) {
      errorEl.innerHTML = `${warningSvg}<span>${message}</span>`;
      errorEl.classList.add('visible');
    }
  };

  const setFieldValid = (field) => {
    if (!field) return;
    field.classList.remove('input-error');
    field.classList.add('input-valid');
    field.removeAttribute('aria-invalid');
    field.setCustomValidity('');

    const errorId = field.getAttribute('aria-describedby');
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  const clearFieldStatus = (field) => {
    if (!field) return;
    field.classList.remove('input-error');
    field.classList.remove('input-valid');
    field.removeAttribute('aria-invalid');
    field.setCustomValidity('');

    const errorId = field.getAttribute('aria-describedby');
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  const resetAllFieldStatuses = () => {
    [nameInput, emailInput, phoneInput, typeSelect, descInput].forEach(f => {
      if (f) clearFieldStatus(f);
    });
  };

  const validateEmail = (field, isLive = true) => {
    if (!field) return true;
    const value = field.value.trim();

    if (!value) {
      if (!isLive) {
        setFieldError(field, 'Please enter your email address.');
        return false;
      }
      clearFieldStatus(field);
      return false;
    }

    if (!value.includes('@')) {
      setFieldError(field, "Email must contain an '@' (e.g. name@domain.com).");
      return false;
    }

    const atIndex = value.indexOf('@');
    const localPart = value.slice(0, atIndex);
    const domainPart = value.slice(atIndex + 1);

    if (!localPart) {
      setFieldError(field, "Enter username before '@' (e.g. name@domain.com).");
      return false;
    }

    if (!domainPart) {
      setFieldError(field, "Enter domain after '@' (e.g. domain.com).");
      return false;
    }

    if (!domainPart.includes('.')) {
      setFieldError(field, "Email domain must contain a dot (e.g. domain.com).");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(value)) {
      setFieldError(field, 'Please enter a valid email address (e.g. name@example.com).');
      return false;
    }

    setFieldValid(field);
    return true;
  };

  const validatePhone = (field, isLive = true) => {
    if (!field) return true;
    const rawValue = field.value.trim();

    if (!rawValue) {
      clearFieldStatus(field);
      return true;
    }

    // Letters check (e.g. fbvdwc342)
    if (/[a-zA-Z]/.test(rawValue)) {
      setFieldError(field, 'Mobile number cannot contain letters. Numbers only.');
      return false;
    }

    const invalidSymbols = rawValue.replace(/[0-9+\-()\s]/g, '');
    if (invalidSymbols.length > 0) {
      setFieldError(field, 'Invalid characters in phone number. Use digits, + or spaces.');
      return false;
    }

    const digits = rawValue.replace(/\D/g, '');

    if (digits.length === 0) {
      setFieldError(field, 'Please enter a valid mobile number with digits.');
      return false;
    }

    // 9 digits check: explicit rule
    if (digits.length === 9) {
      setFieldError(field, 'Mobile number must be at least 10 digits (9 of 10 entered).');
      return false;
    }

    if (digits.length < 9) {
      setFieldError(field, `Mobile number must be at least 10 digits (${digits.length} of 10 entered).`);
      return false;
    }

    if (digits.length > 15) {
      setFieldError(field, 'Mobile number is too long (maximum 15 digits).');
      return false;
    }

    setFieldValid(field);
    return true;
  };

  const validateName = (field, isLive = true) => {
    if (!field) return true;
    const value = field.value.trim();
    if (!value) {
      if (!isLive) {
        setFieldError(field, 'Please enter your name.');
        return false;
      }
      clearFieldStatus(field);
      return false;
    }
    if (value.length < 2) {
      setFieldError(field, 'Name must be at least 2 characters.');
      return false;
    }
    setFieldValid(field);
    return true;
  };

  const validateType = (field, isLive = true) => {
    if (!field) return true;
    const value = field.value;
    if (!value) {
      if (!isLive) {
        setFieldError(field, 'Please select a project type.');
        return false;
      }
      clearFieldStatus(field);
      return false;
    }
    setFieldValid(field);
    return true;
  };

  const validateDescription = (field, isLive = true) => {
    if (!field) return true;
    const value = field.value.trim();
    if (!value) {
      if (!isLive) {
        setFieldError(field, 'Please describe your project requirements.');
        return false;
      }
      clearFieldStatus(field);
      return false;
    }
    if (value.length < 10) {
      setFieldError(field, 'Please provide a little more detail (at least 10 characters).');
      return false;
    }
    setFieldValid(field);
    return true;
  };

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (emailInput.value.length > 0) {
        validateEmail(emailInput, true);
      } else {
        clearFieldStatus(emailInput);
      }
    });
    emailInput.addEventListener('blur', () => {
      validateEmail(emailInput, false);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      if (phoneInput.value.length > 0) {
        validatePhone(phoneInput, true);
      } else {
        clearFieldStatus(phoneInput);
      }
    });
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.length > 0) {
        validatePhone(phoneInput, false);
      } else {
        clearFieldStatus(phoneInput);
      }
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.classList.contains('input-error') || nameInput.classList.contains('input-valid')) {
        validateName(nameInput, true);
      }
    });
    nameInput.addEventListener('blur', () => {
      validateName(nameInput, false);
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      validateType(typeSelect, false);
    });
  }

  if (descInput) {
    descInput.addEventListener('input', () => {
      if (descInput.classList.contains('input-error') || descInput.classList.contains('input-valid')) {
        validateDescription(descInput, true);
      }
    });
    descInput.addEventListener('blur', () => {
      validateDescription(descInput, false);
    });
  }

  form.addEventListener('reset', () => {
    resetAllFieldStatuses();
  });

  const getFormDataFormatted = () => {
    const name = (form.name && form.name.value || '').trim();
    const business = (form.business && form.business.value || '').trim();
    const email = (form.email && form.email.value || '').trim();
    const phone = (form.phone && form.phone.value || '').trim();
    const type = (form.project_type && form.project_type.value) || 'Not selected';
    const desc = (form.description && form.description.value || '').trim();
    const timeline = (form.timeline && form.timeline.value) || 'Not specified';

    return {
      name: name || 'Interested Client',
      business: business || 'N/A',
      email: email || 'Not provided',
      phone: phone || 'Not provided',
      project_type: type,
      description: desc || 'Project enquiry',
      timeline: timeline
    };
  };

  // Direct mailto link generator
  const openMailto = () => {
    const data = getFormDataFormatted();
    const subject = encodeURIComponent(`Project Enquiry: ${data.project_type} — ${data.name}`);
    const body = encodeURIComponent(
      `Hello TechNest Studio Team,\n\n` +
      `I would like to discuss a project with your team.\n\n` +
      `--- CLIENT DETAILS ---\n` +
      `Name: ${data.name}\n` +
      `Business: ${data.business}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Requirement: ${data.project_type}\n` +
      `Preferred Timeline: ${data.timeline}\n\n` +
      `--- PROJECT DESCRIPTION ---\n` +
      `${data.description}\n\n` +
      `Sent via TechNest Studio Website`
    );
    window.location.href = `mailto:studiotechnest@gmail.com?subject=${subject}&body=${body}`;
  };

  // Direct WhatsApp link generator
  const openWhatsApp = () => {
    const data = getFormDataFormatted();
    const text = encodeURIComponent(
      `*New Project Enquiry — TechNest Studio*\n\n` +
      `*Name:* ${data.name}\n` +
      `*Business:* ${data.business}\n` +
      `*Email:* ${data.email}\n` +
      `*Phone:* ${data.phone}\n` +
      `*Requirement:* ${data.project_type}\n` +
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

    const isNameValid = validateName(nameInput, false);
    const isEmailValid = validateEmail(emailInput, false);
    const isPhoneValid = validatePhone(phoneInput, false);
    const isTypeValid = validateType(typeSelect, false);
    const isDescValid = validateDescription(descInput, false);

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isTypeValid || !isDescValid) {
      const allFields = [nameInput, emailInput, phoneInput, typeSelect, descInput];
      const firstInvalid = allFields.find(f => f && f.classList.contains('input-error'));
      if (firstInvalid) {
        const wrapper = firstInvalid.closest('.form-field');
        if (wrapper) {
          wrapper.classList.remove('field-shake');
          void wrapper.offsetWidth;
          wrapper.classList.add('field-shake');
          setTimeout(() => wrapper.classList.remove('field-shake'), 450);
        }
        firstInvalid.focus();
      }
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
      timeline: data.timeline,
      _subject: `New Project Enquiry from ${data.name} (${data.business}) — TechNest Studio`,
      _replyto: data.email,
      _autoresponse: 'Thank you for reaching out to TechNest Studio! We have received your project enquiry and our team will review your requirement and get back to you within 24 hours.',
      _template: 'table',
      _captcha: 'false'
    };

    const cleanupButton = () => {
      btn.classList.remove('btn-submitting');
      const sp = btn.querySelector('.btn-spinner');
      if (sp) sp.remove();
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/studiotechnest@gmail.com', {
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

        // Trigger celebratory confetti burst
        fireConfetti();

        const successContainer = document.getElementById('form-success-container');
        if (successContainer) {
          form.classList.add('form-hidden');
          const safeName = (data.name || 'Interested Client').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeType = (data.project_type || 'Custom Software').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeTimeline = (data.timeline || 'Flexible').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const waPrefill = encodeURIComponent(`Hello TechNest Studio! I just submitted an enquiry for ${safeType}. Name: ${safeName}`);

          successContainer.innerHTML = `
            <div class="form-success-overlay" role="alert">
              <div class="success-glow-halo" aria-hidden="true"></div>
              <div class="success-icon-wrap">
                <span class="success-ring-ripple" aria-hidden="true"></span>
                <span class="success-ring-ripple delay" aria-hidden="true"></span>
                <svg class="success-checkmark-svg" viewBox="0 0 52 52" aria-hidden="true">
                  <circle class="checkmark-circle" cx="26" cy="26" r="24"/>
                  <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <div class="success-badge-pill">
                <span class="badge-dot-live" aria-hidden="true"></span>
                <span class="badge-pill-text">
                  Sent to <strong class="success-target-email">studiotechnest@gmail.com</strong> successfully!
                </span>
              </div>
              <h3 class="success-heading">Enquiry Received!</h3>
              <p class="success-message">
                Thank you, <strong>${safeName}</strong>! We have received your project details. Our engineering team will analyze your requirements and get back to you within <strong>24 hours</strong>.
              </p>
              <div class="success-client-summary">
                <div class="summary-chip">Requirement: <strong>${safeType}</strong></div>
                <div class="summary-chip">Timeline: <strong>${safeTimeline}</strong></div>
              </div>
              <div class="success-actions">
                <a href="https://wa.me/918807006909?text=${waPrefill}" target="_blank" rel="noopener noreferrer" class="btn btn-success-wa">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
                <button type="button" class="btn btn-reset-form" id="btn-reset-form">
                  Send Another Enquiry
                </button>
              </div>
            </div>
          `;

          // Handle "Send Another Enquiry" button
          const btnReset = successContainer.querySelector('#btn-reset-form');
          if (btnReset) {
            btnReset.addEventListener('click', () => {
              successContainer.innerHTML = '';
              form.reset();
              resetAllFieldStatuses();
              form.classList.remove('form-hidden');
              btn.disabled = false;
              btn.style.opacity = '';
              btn.style.background = '';
              if (btnText) btnText.textContent = original;
            });
          }
        }
      } else if (resJson.message && resJson.message.toLowerCase().includes('activation')) {
        // Needs 1-time activation by email owner
        cleanupButton();
        if (btnText) btnText.textContent = '✓ Activation Sent!';
        btn.style.background = 'var(--color-accent)';

        showFormStatus(form, 'info', {
          title: 'One-Time Activation Link Sent!',
          message: 'FormSubmit has sent a 1-time confirmation email to <strong>studiotechnest@gmail.com</strong>. Open your Gmail and click <strong>"Activate Form"</strong> once to finalize auto-delivery. Your current enquiry can also be sent directly below:',
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

    const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
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
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
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
