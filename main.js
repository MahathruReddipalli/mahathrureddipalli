/**
 * MAHATHRU REDDIPALLI // PERSONAL ENGINEERING PORTFOLIO
 * Vanilla JavaScript: Canvas Particles, Animated Counters, Scroll Spy, Mobile Menu, Scroll Reveal
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. HERO CANVAS PARTICLE SYSTEM (Constellation + Mouse Repulse)
  // --------------------------------------------------------------------------
  const heroSection = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');

  if (canvas && heroSection) {
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let isHeroVisible = true;
    let particles = [];
    const maxConnectionDistance = 120;
    const mouse = { x: null, y: null, radius: 100 };

    function getDotCount() {
      return window.innerWidth < 768 ? 24 : 52;
    }

    function resizeCanvas() {
      const rect = heroSection.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    }

    class Particle {
      constructor(width, height) {
        this.w = width;
        this.h = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.5 + 1.2;
        this.baseVx = (Math.random() - 0.5) * 0.45;
        this.baseVy = (Math.random() - 0.5) * 0.45;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.alpha = Math.random() * 0.12 + 0.14; // 0.14 - 0.26 opacity
      }

      update() {
        // Mouse repulse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2.5;
            this.y += Math.sin(angle) * force * 2.5;
          }
        }

        // Standard drift
        this.x += this.vx;
        this.y += this.vy;

        // Bounce gently at boundaries
        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        else if (this.x > this.w) { this.x = this.w; this.vx *= -1; }

        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        else if (this.y > this.h) { this.y = this.h; this.vy *= -1; }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(46, 75, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      const rect = heroSection.getBoundingClientRect();
      const count = getDotCount();
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(rect.width, rect.height));
      }
    }

    function drawConnections() {
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectionDistance) {
            const lineAlpha = (1 - dist / maxConnectionDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(46, 75, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }
    }

    function renderFrame() {
      const rect = heroSection.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();
    }

    let lastFrameTime = 0;
    const targetFpsInterval = 1000 / 60; // 60fps cap

    function loop(currentTime) {
      animationFrameId = requestAnimationFrame(loop);

      if (!isHeroVisible) return;

      const elapsed = currentTime - lastFrameTime;
      if (elapsed > targetFpsInterval) {
        lastFrameTime = currentTime - (elapsed % targetFpsInterval);
        renderFrame();
      }
    }

    // Mouse tracking over hero for repulse
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Debounced window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        if (prefersReducedMotion) {
          renderFrame();
        }
      }, 150);
    });

    // Pause particle loop when hero scrolls out of view
    const heroVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    heroVisibilityObserver.observe(heroSection);

    // Initial setup
    resizeCanvas();

    if (prefersReducedMotion) {
      // Under reduced motion: render single static constellation frame, do not loop
      renderFrame();
    } else {
      animationFrameId = requestAnimationFrame(loop);
    }
  }

  // --------------------------------------------------------------------------
  // 2. STICKY NAV & SCROLL SPY
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function updateHeaderState() {
    if (!siteHeader || !heroSection) return;
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    if (heroBottom <= 70) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  // Scroll Spy with IntersectionObserver
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach((link) => {
          const match = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', match);
          if (match) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });

        mobileNavLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-25% 0px -65% 0px',
    threshold: 0
  });

  sections.forEach((s) => spyObserver.observe(s));

  // --------------------------------------------------------------------------
  // 3. ACCESSIBLE MOBILE MENU (HAMBURGER + FULLSCREEN OVERLAY)
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openMenu() {
    if (!mobileOverlay || !menuToggle) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const firstLink = mobileOverlay.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    if (!mobileOverlay || !menuToggle) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    menuToggle.focus();
  }

  if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu();
      else openMenu();
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. ANIMATED NUMBER COUNTERS (CGPA, Internships, Certifications)
  // --------------------------------------------------------------------------
  const counterElements = document.querySelectorAll('.stat-number[data-counter]');

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    const isFloat = el.getAttribute('data-float') === 'true';
    const duration = 1200; // ms
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;

      if (isFloat) {
        el.textContent = current.toFixed(2);
      } else {
        el.textContent = Math.floor(current).toString();
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isFloat ? target.toFixed(2) : target.toString();
      }
    }

    requestAnimationFrame(step);
  }

  if (counterElements.length > 0) {
    if (prefersReducedMotion) {
      counterElements.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-counter'));
        const isFloat = el.getAttribute('data-float') === 'true';
        el.textContent = isFloat ? target.toFixed(2) : target.toString();
      });
    } else {
      const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            counterElements.forEach((el) => animateCounter(el));
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });

      const statsGrid = document.querySelector('.stats-grid');
      if (statsGrid) statsObserver.observe(statsGrid);
    }
  }

  // --------------------------------------------------------------------------
  // 5. SCROLL REVEAL (IntersectionObserver 500ms ease-out, staggered 60ms)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  }
});
