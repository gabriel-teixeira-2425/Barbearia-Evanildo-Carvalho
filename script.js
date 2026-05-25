/* ============================================================
   BARBEARIA EVANILDO CARVALHO — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. NAVBAR — scroll effect + mobile toggle
     ============================================================ */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });

  // Close mobile menu on link click
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     2. SMOOTH SCROLL (fallback for older browsers)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     3. REVEAL ON SCROLL (IntersectionObserver)
     ============================================================ */
  const revealTargets = document.querySelectorAll(
    '.service-card, .feature-item, .review-card, .gallery-item, .promo-card, .section-header'
  );

  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    // stagger based on data-delay or index within parent
    const delay = el.dataset.delay ? parseInt(el.dataset.delay) * 55 : (i % 6) * 55;
    el.style.transitionDelay = delay + 'ms';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach(el => observer.observe(el));

  /* ============================================================
     4. LIGHTBOX
     ============================================================ */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose= document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let   currentIndex = 0;

  // Collect all image sources
  const gallerySrcs = galleryItems.map(item => {
    const img = item.querySelector('img');
    return img ? img.src : item.dataset.src;
  });

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = gallerySrcs[index];
    lightboxImg.alt = 'Foto ' + (index + 1);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after transition to avoid flash
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + gallerySrcs.length) % gallerySrcs.length;
    lightboxImg.src = gallerySrcs[currentIndex];
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % gallerySrcs.length;
    lightboxImg.src = gallerySrcs[currentIndex];
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // Click outside image = close
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
  });

  /* ============================================================
     5. WHATSAPP — CONTACT FORM
     ============================================================ */
  const btnWhatsapp = document.getElementById('btnWhatsapp');
  const obsField    = document.getElementById('obs');
  const contactAlert= document.getElementById('contactAlert');

  btnWhatsapp.addEventListener('click', () => {
    const checked = Array.from(
      document.querySelectorAll('input[name="servico"]:checked')
    ).map(cb => cb.value);

    if (checked.length === 0) {
      contactAlert.textContent = 'Por favor, selecione pelo menos um serviço antes de enviar.';
      contactAlert.style.display = 'block';
      // Shake animation
      btnWhatsapp.style.animation = 'none';
      setTimeout(() => {
        btnWhatsapp.style.animation = '';
        obsField.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 10);
      return;
    }

    contactAlert.textContent = '';

    const servicosList = checked.join(', ');
    const obs = obsField.value.trim();

    let message = `Olá Evanildo, tudo bem? Gostaria de saber se tem horário disponível para: ${servicosList}.`;
    if (obs) {
      message += ` Observação: ${obs}.`;
    }
    message += ' Aguardo sua resposta. Obrigado!';

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/558591954828?text=${encoded}`, '_blank', 'noopener,noreferrer');
  });

  // Clear alert on checkbox change
  document.querySelectorAll('input[name="servico"]').forEach(cb => {
    cb.addEventListener('change', () => {
      contactAlert.textContent = '';
    });
  });

  /* ============================================================
     6. FOOTER — OPEN/CLOSED STATUS
     ============================================================ */
  function updateStatus() {
    const statusEl = document.getElementById('footerStatus');
    if (!statusEl) return;

    // Uses local Brasília time (UTC-3)
    const now = new Date();
    const brtOffset = -3 * 60; // minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brt = new Date(utc + brtOffset * 60000);

    const day  = brt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const hour = brt.getHours();
    const min  = brt.getMinutes();
    const time = hour * 60 + min; // minutes since midnight

    const morningOpen  = 7 * 60;       // 07:00
    const morningClose = 11 * 60;      // 11:00
    const afternoonOpen  = 14 * 60;    // 14:00
    const afternoonClose = 18 * 60;    // 18:00

    let isOpen = false;

    if (day >= 1 && day <= 6) { // Mon–Sat
      const morning   = time >= morningOpen   && time < morningClose;
      const afternoon = time >= afternoonOpen && time < afternoonClose;
      isOpen = morning || afternoon;
    }

    statusEl.textContent = isOpen ? 'Aberto agora' : 'Fechado';
    statusEl.className   = 'footer-status ' + (isOpen ? 'open' : 'closed');
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000); // refresh every minute

  /* ============================================================
     7. ACTIVE NAV LINK (highlight on scroll)
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    let current = '';

    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.id;
    });

    allNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

})();
