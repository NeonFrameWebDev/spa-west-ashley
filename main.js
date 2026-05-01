/* The Spa at West Ashley - main.js */

(function () {
  'use strict';

  // ── Loader ──────────────────────────────────────────────────
  const loader = document.getElementById('loader');
  if (loader) {
    // Bar animation is 1.0s, then fade out
    setTimeout(function () {
      loader.classList.add('done');
      setTimeout(function () {
        loader.style.display = 'none';
      }, 450);
    }, 1050);
  }

  // ── Nav: scroll state ────────────────────────────────────────
  const nav = document.getElementById('nav');
  function onScroll() {
    if ((window.scrollY || window.pageYOffset) > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Nav: mobile burger ───────────────────────────────────────
  const navLinks = document.getElementById('navLinks');
  const burger   = document.getElementById('navBurger');

  function closeMenu() {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    navLinks.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  burger.addEventListener('click', function () {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
  });

  // ── Smooth scroll (offset for fixed nav) ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav.offsetHeight;
      const y = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // ── Intersection-based scroll reveal ────────────────────────
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.rise').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.rise').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Active nav tracking ──────────────────────────────────────
  const sectionIds = ['hero', 'about', 'services', 'treatments', 'team', 'reviews', 'contact'];
  const sections   = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  const linkMap    = {};
  navLinks.querySelectorAll('a').forEach(function (a) {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) linkMap[href.slice(1)] = a;
  });

  function updateActive() {
    const mid = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    for (const s of sections) {
      if (s.offsetTop <= mid) current = s.id;
    }
    Object.values(linkMap).forEach(function (a) { a.classList.remove('active'); });
    if (current && linkMap[current]) linkMap[current].classList.add('active');
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // ── Services tab switcher ────────────────────────────────────
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = this.getAttribute('data-tab');

      tabBtns.forEach(function (b) {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(function (p) {
        p.classList.add('tab-panel--hidden');
      });

      this.classList.add('tab-btn--active');
      this.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab' + target.charAt(0).toUpperCase() + target.slice(1));
      if (panel) {
        panel.classList.remove('tab-panel--hidden');
        // Re-trigger rise animations in the newly shown panel
        panel.querySelectorAll('.rise').forEach(function (el) {
          el.classList.remove('visible');
          void el.offsetWidth; // reflow
          el.classList.add('visible');
        });
      }
    });
  });

  // ── Mobile: native select fallback for services ──────────────
  (function () {
    const wrapper = document.querySelector('.services__select-wrap');
    if (!wrapper) return;
    const sel = wrapper.querySelector('select');
    if (!sel) return;
    sel.addEventListener('change', function () {
      const target = this.value;
      tabPanels.forEach(function (p) { p.classList.add('tab-panel--hidden'); });
      const panel = document.getElementById('tab' + target.charAt(0).toUpperCase() + target.slice(1));
      if (panel) panel.classList.remove('tab-panel--hidden');
    });
  })();

  // ── Testimonial carousel ─────────────────────────────────────
  const slides  = document.querySelectorAll('.carousel__slide');
  const dots    = document.querySelectorAll('.dot');
  let current   = 0;
  let timer     = null;
  let paused    = false;

  function goTo(idx) {
    slides[current].classList.remove('carousel__slide--active');
    dots[current].classList.remove('dot--active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('carousel__slide--active');
    dots[current].classList.add('dot--active');
  }

  function advance() {
    if (!paused) goTo(current + 1);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(advance, 6000);
  }
  startTimer();

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(Number(this.getAttribute('data-idx')));
      startTimer();
    });
  });

  const carousel = document.getElementById('reviewCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', function () { paused = true; });
    carousel.addEventListener('mouseleave', function () { paused = false; });
    carousel.addEventListener('focusin',    function () { paused = true; });
    carousel.addEventListener('focusout',   function () { paused = false; });
  }

  // ── Contact form (fake endpoint) ─────────────────────────────
  const form = document.querySelector('.contact__form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.form__submit');
      btn.textContent = 'Message Sent';
      btn.disabled = true;
      btn.style.opacity = '0.65';
    });
  }

})();
