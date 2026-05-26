/* ============================================================
   BARBEARIA EVANILDO CARVALHO — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. NAVBAR — scroll effect + mobile toggle
     ============================================================ */
  const navbar     = document.getElementById('navbar');
  const navToggle  = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     2. SMOOTH SCROLL (fallback para browsers antigos)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     3. REVEAL ON SCROLL
     ============================================================ */
  const revealTargets = document.querySelectorAll(
    '.service-card, .feature-item, .review-card, .gallery-item, .promo-card, .section-header'
  );

  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
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
  const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  let   currentIndex  = 0;

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
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  /* ============================================================
     5. CONTATO — soma dinâmica + WhatsApp sem observações
     FIX 4: data-price nos checkboxes, total atualizado em tempo real
     ============================================================ */
  const checkboxes   = document.querySelectorAll('input[name="servico"]');
  const totalValue   = document.getElementById('totalValue');
  const totalHint    = document.getElementById('totalHint');
  const btnWhatsapp  = document.getElementById('btnWhatsapp');
  const contactAlert = document.getElementById('contactAlert');

  function calcTotal() {
    let sum = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) sum += parseFloat(cb.dataset.price) || 0;
    });
    return sum;
  }

  function updateTotal() {
    const total = calcTotal();
    totalValue.textContent = total > 0 ? 'R$ ' + total : 'R$ 0';

    // Atualiza hint conforme seleção
    const hint = document.querySelector('.total-hint');
    if (hint) {
      hint.textContent = total > 0
        ? 'Valor estimado dos serviços selecionados'
        : 'Selecione os serviços ao lado';
    }
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateTotal();
      contactAlert.textContent = '';
    });
  });

  // Inicializa o total
  updateTotal();

  btnWhatsapp.addEventListener('click', () => {
    const checked = Array.from(
      document.querySelectorAll('input[name="servico"]:checked')
    ).map(cb => cb.value);

    if (checked.length === 0) {
      contactAlert.textContent = 'Por favor, selecione pelo menos um serviço antes de enviar.';
      return;
    }

    contactAlert.textContent = '';

    // FIX 4: mensagem sem observações
    const servicosList = checked.join(', ');
    const message = `Olá Evanildo, tudo bem? Gostaria de saber se tem horário disponível para: ${servicosList}. Aguardo sua resposta. Obrigado!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/558591954828?text=${encoded}`, '_blank', 'noopener,noreferrer');
  });

  /* ============================================================
     6. FOOTER — status aberto/fechado em tempo real (BRT)
     ============================================================ */
  function updateStatus() {
    const statusEl = document.getElementById('footerStatus');
    if (!statusEl) return;

    const now = new Date();
    const brtOffset = -3 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brt = new Date(utc + brtOffset * 60000);

    const day  = brt.getDay();
    const time = brt.getHours() * 60 + brt.getMinutes();

    const morningOpen    = 7  * 60;
    const morningClose   = 11 * 60;
    const afternoonOpen  = 14 * 60;
    const afternoonClose = 18 * 60;

    let isOpen = false;
    if (day >= 1 && day <= 6) {
      isOpen = (time >= morningOpen && time < morningClose) ||
               (time >= afternoonOpen && time < afternoonClose);
    }

    statusEl.textContent = isOpen ? 'Aberto agora' : 'Fechado';
    statusEl.className   = 'footer-status ' + (isOpen ? 'open' : 'closed');
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ============================================================
     7. ACTIVE NAV LINK
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    let current = '';
    sections.forEach(sec => { if (scrollY >= sec.offsetTop) current = sec.id; });
    allNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

})();
