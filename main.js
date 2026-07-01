(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Sticky header state ---------------- */
  const header = document.getElementById('siteHeader');
  const onScrollHeader = () => {
    if (window.scrollY > 30) header.style.background = 'rgba(10,20,40,.92)';
    else header.style.background = 'rgba(10,20,40,.72)';
  };
  document.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Mobile nav toggle ---------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Scroll reveal (motion-style staggered fade/rise) ---------------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblingsInGroup = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
          const idx = siblingsInGroup.indexOf(el);
          el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------- Count-up numbers ---------------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    if (prefersReducedMotion) { el.textContent = target; return; }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('fr-FR');
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => countObserver.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------------- Portfolio progress bars fill on view ---------------- */
  const progressBars = document.querySelectorAll('.progress-bar span');
  if ('IntersectionObserver' in window) {
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const span = entry.target;
          const pct = span.getAttribute('data-progress');
          span.style.width = '0%';
          requestAnimationFrame(() => { span.style.width = pct + '%'; });
          progressObserver.unobserve(span);
        }
      });
    }, { threshold: 0.4 });
    progressBars.forEach(el => progressObserver.observe(el));
  }

  /* ---------------- Portfolio filters ---------------- */
  const filterChips = document.querySelectorAll('.filter-chip');
  const projectCards = document.querySelectorAll('.project-card');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      const filter = chip.getAttribute('data-filter');
      projectCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------------- Quote form ---------------- */
  const quoteForm = document.getElementById('quoteForm');
  const formSuccess = document.getElementById('formSuccess');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';

      // NOTE: front-end ready. Wire this fetch() to your backend / form
      // endpoint (e.g. EmailJS, Formspree, or a custom API) before
      // deploying to production.
      setTimeout(() => {
        quoteForm.hidden = true;
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }, 700);
    });
  }

})();
