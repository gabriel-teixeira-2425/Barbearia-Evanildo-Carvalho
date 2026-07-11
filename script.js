/* ============================================================
   BARBEARIA EVANILDO CARVALHO — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     0. TICKER — robusto: reconstrói após fontes carregarem + resize
     ============================================================ */
  const BASE_TEXT = 'CORTE\u00a0·\u00a0BARBA\u00a0·\u00a0DEGRADÊ\u00a0·\u00a0ESTILO\u00a0·\u00a0TRADIÇÃO\u00a0·\u00a0PACAJUS\u00a0·\u00a0NAVALHA\u00a0·\u00a0TESOURA\u00a0·\u00a0';
  const SPEED_PX  = 80; // pixels por segundo

  function buildTicker() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;

    // Para a animação durante a reconstrução para evitar flash
    track.style.animation = 'none';
    track.innerHTML = '';

    // Mede a largura real de uma unidade de texto com as fontes já carregadas
    const seed = document.createElement('span');
    seed.className        = 'ticker-group';
    seed.textContent      = BASE_TEXT;
    seed.style.visibility = 'hidden';
    seed.style.position   = 'absolute';
    seed.style.whiteSpace = 'nowrap';
    track.appendChild(seed);

    // Força reflow para obter a largura correta
    const unitW = seed.getBoundingClientRect().width || seed.offsetWidth || 400;
    track.removeChild(seed);

    // Quantas unidades precisam para preencher 200vw com folga
    const screenW     = window.innerWidth;
    const unitsNeeded = Math.ceil((screenW * 2) / unitW) + 4;
    const halfUnits   = Math.ceil(unitsNeeded / 2);

    // Cria exatamente dois grupos iguais (a animação vai de 0 → -50%)
    for (let g = 0; g < 2; g++) {
      const group = document.createElement('span');
      group.className   = 'ticker-group';
      group.textContent = BASE_TEXT.repeat(halfUnits);
      track.appendChild(group);
    }

    // Duração proporcional ao conteúdo para velocidade constante
    void track.offsetWidth; // força reflow antes de medir
    const totalW = track.scrollWidth / 2;
    const dur    = totalW / SPEED_PX;

    track.style.animation = `tickerScroll ${dur.toFixed(1)}s linear infinite`;
  }

  // Constrói imediatamente e depois de novo quando as fontes estiverem prontas
  buildTicker();
  document.fonts.ready.then(buildTicker);

  // Reconstrói se a janela for redimensionada (ex: rotação de tela, zoom do OS)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildTicker, 200);
  }, { passive: true });

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

  // ⚠️ CONFIGURAÇÃO: troque pela URL base do seu n8n (produção)
  // Exemplo: 'https://seu-n8n.dominio.com/webhook'
const N8N_BASE_URL = 'https://documentation-gonna-controlling-luggage.trycloudflare.com/webhook';
  // Precisa bater exatamente com os horários da planilha-modelo
  const HORARIOS_PADRAO = [
    '07:00 à 07:30', '07:30 à 08:00', '08:00 à 08:30', '08:30 à 09:00',
    '09:00 à 09:30', '09:30 à 10:00', '10:00 à 10:30', '10:30 à 11:00',
    '11:00 à 11:30', '14:00 à 14:30', '14:30 à 15:00', '15:00 à 15:30',
    '15:30 à 16:00', '16:00 à 16:30', '16:30 à 17:00', '17:00 à 17:30', '17:30 à 18:00'
  ];

  const checkboxes      = document.querySelectorAll('input[name="servico"]');
  const totalValue      = document.getElementById('totalValue');
  const totalHint       = document.getElementById('totalHint');
  const btnWhatsapp     = document.getElementById('btnWhatsapp');
  const clienteNome     = document.getElementById('clienteNome');
  const clienteTelefone = document.getElementById('clienteTelefone');
  const clienteData     = document.getElementById('clienteData');
  const clienteHorario  = document.getElementById('clienteHorario');
  const horarioStatus   = document.getElementById('horarioStatus');

  let dataSelecionadaBR = ''; // data no formato DD-MM-YYYY, usada no envio

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

    alignServicesForm();
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateTotal();
    });
  });

  // Limpa erro visual assim que o cliente começa a corrigir
  [clienteNome, clienteTelefone].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
    });
  });

  // Máscara automática de telefone: (99) 9999-9999 ou (99) 99999-9999
  function maskTelefone(value) {
    let v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d*)/, '($1');
    }
    return v;
  }

  if (clienteTelefone) {
    clienteTelefone.addEventListener('input', () => {
      const pos = clienteTelefone.value.length;
      clienteTelefone.value = maskTelefone(clienteTelefone.value);
      // Mantém o cursor no fim durante a digitação (evita saltos)
      if (pos <= clienteTelefone.value.length) {
        clienteTelefone.setSelectionRange(clienteTelefone.value.length, clienteTelefone.value.length);
      }
    });
  }

  /* ============================================================
     5a. DIA + HORÁRIO — consulta disponibilidade real no Drive
     ============================================================ */

  // Converte 'YYYY-MM-DD' (input date) para 'DD-MM-YYYY' (formato do workflow)
  function paraDataBR(valorInputDate) {
    const [ano, mes, dia] = valorInputDate.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  // Preenche o <select> de horários a partir da lista vinda do n8n
  function preencherHorarios(horarios) {
    clienteHorario.innerHTML = '';

    const optPlaceholder = document.createElement('option');
    optPlaceholder.value = '';
    optPlaceholder.textContent = 'Selecione um horário';
    clienteHorario.appendChild(optPlaceholder);

    horarios.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.horario;
      const ocupado = (item.status || '').toUpperCase() === 'OCUPADO';
      opt.textContent = ocupado ? `${item.horario} (ocupado)` : item.horario;
      opt.disabled = ocupado;
      clienteHorario.appendChild(opt);
    });

    clienteHorario.disabled = false;
  }

  // Busca disponibilidade no n8n; se falhar ou não configurado, cai no fallback (todos livres)
  async function carregarDisponibilidade(dataBR) {
    clienteHorario.disabled = true;
    clienteHorario.innerHTML = '<option value="">Carregando horários...</option>';
    horarioStatus.textContent = 'Verificando horários disponíveis...';
    horarioStatus.className = 'horario-status';

    try {
      if (!N8N_BASE_URL || N8N_BASE_URL.includes('SEU-N8N-AQUI')) {
        throw new Error('N8N_BASE_URL não configurada');
      }

      const resp = await fetch(`${N8N_BASE_URL}/disponibilidade?data=${encodeURIComponent(dataBR)}`);
      if (!resp.ok) throw new Error('Falha na consulta (' + resp.status + ')');

      const data = await resp.json();
      const horarios = Array.isArray(data) ? data : data.horarios;
      if (!Array.isArray(horarios) || horarios.length === 0) throw new Error('Resposta vazia');

      preencherHorarios(horarios);

      const livres = horarios.filter(h => (h.status || '').toUpperCase() !== 'OCUPADO').length;
      horarioStatus.textContent = livres > 0
        ? `${livres} horário(s) livre(s) neste dia`
        : 'Todos os horários deste dia já estão ocupados';
      horarioStatus.className = 'horario-status ' + (livres > 0 ? 'ok' : 'error');

    } catch (err) {
      // Fallback: mostra a grade padrão de horários (sem checar ocupação em tempo real)
      preencherHorarios(HORARIOS_PADRAO.map(h => ({ horario: h, status: 'LIVRE' })));
      horarioStatus.textContent = 'Não foi possível verificar horários ocupados agora — mostrando a grade padrão.';
      horarioStatus.className = 'horario-status error';
    }
  }

  if (clienteData) {
    // Não permite escolher datas passadas
    const hoje = new Date();
    const isoHoje = hoje.toISOString().slice(0, 10);
    clienteData.setAttribute('min', isoHoje);

    clienteData.addEventListener('change', () => {
      clienteData.classList.remove('input-error');

      if (!clienteData.value) return;

      const [ano, mes, dia] = clienteData.value.split('-').map(Number);
      const diaSemana = new Date(ano, mes - 1, dia).getDay(); // 0 = domingo

      if (diaSemana === 0) {
        horarioStatus.textContent = 'Fechamos aos domingos — escolha outro dia.';
        horarioStatus.className = 'horario-status error';
        clienteHorario.disabled = true;
        clienteHorario.innerHTML = '<option value="">Escolha o dia primeiro</option>';
        dataSelecionadaBR = '';
        return;
      }

      dataSelecionadaBR = paraDataBR(clienteData.value);
      carregarDisponibilidade(dataSelecionadaBR);
    });
  }

  // Inicializa o total
  updateTotal();

  btnWhatsapp.addEventListener('click', () => {
    const nome           = clienteNome ? clienteNome.value.trim() : '';
    const telefone       = clienteTelefone ? clienteTelefone.value.trim() : '';
    const telefoneDigits = telefone.replace(/\D/g, '');
    const horario        = clienteHorario ? clienteHorario.value : '';
    const checked        = Array.from(
      document.querySelectorAll('input[name="servico"]:checked')
    ).map(cb => cb.value);

    // Validação: nome, telefone (mín. 10 dígitos), dia, horário e ao menos 1 serviço
    let erro = '';
    if (!nome)                          erro = 'Por favor, informe seu nome.';
    else if (telefoneDigits.length < 10) erro = 'Por favor, informe um telefone válido com DDD.';
    else if (!dataSelecionadaBR)        erro = 'Por favor, escolha o dia do atendimento.';
    else if (!horario)                  erro = 'Por favor, escolha um horário disponível.';
    else if (checked.length === 0)       erro = 'Por favor, selecione pelo menos um serviço antes de enviar.';

    if (clienteNome)     clienteNome.classList.toggle('input-error', !nome);
    if (clienteTelefone) clienteTelefone.classList.toggle('input-error', !!nome && telefoneDigits.length < 10);
    if (clienteData)     clienteData.classList.toggle('input-error', !!nome && telefoneDigits.length >= 10 && !dataSelecionadaBR);

    if (erro) {
      mostrarToast({
        type: 'error',
        title: 'Não foi possível continuar',
        text: erro
      });
      return;
    }

    abrirConfirmacao({ nome, telefone, data: dataSelecionadaBR, horario, servicos: checked });
  });

  /* ============================================================
     5c. MODAL DE CONFIRMAÇÃO — revisão dos dados antes de enviar
     ============================================================ */
  const confirmOverlay        = document.getElementById('confirmOverlay');
  const confirmClose          = document.getElementById('confirmClose');
  const confirmCancel         = document.getElementById('confirmCancel');
  const confirmSubmitBtn      = document.getElementById('confirmSubmit');
  const confirmTermsCheckbox  = document.getElementById('confirmTermsCheckbox');
  const confirmNome           = document.getElementById('confirmNome');
  const confirmTelefone       = document.getElementById('confirmTelefone');
  const confirmData           = document.getElementById('confirmData');
  const confirmHorario        = document.getElementById('confirmHorario');
  const confirmServicos       = document.getElementById('confirmServicos');
  const confirmTotal          = document.getElementById('confirmTotal');

  let pedidoPendente = null; // guarda os dados enquanto o modal está aberto

  // Converte 'DD-MM-YYYY' em algo legível, ex: 13/07/2026
  function formatarDataExibicao(dataBR) {
    if (!dataBR) return '—';
    const [dia, mes, ano] = dataBR.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function abrirConfirmacao(pedido) {
    pedidoPendente = pedido;

    confirmNome.textContent     = pedido.nome;
    confirmTelefone.textContent = pedido.telefone;
    confirmData.textContent     = formatarDataExibicao(pedido.data);
    confirmHorario.textContent  = pedido.horario;
    confirmServicos.textContent = pedido.servicos.join(', ');
    confirmTotal.textContent    = totalValue.textContent;

    confirmTermsCheckbox.checked = false;
    confirmSubmitBtn.disabled    = true;
    confirmSubmitBtn.classList.remove('loading');
    confirmSubmitBtn.innerHTML   = '<i class="fas fa-check"></i> Confirmar agendamento';

    confirmOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function fecharConfirmacao() {
    confirmOverlay.classList.remove('open');
    document.body.style.overflow = '';
    pedidoPendente = null;
  }

  confirmClose.addEventListener('click', fecharConfirmacao);
  confirmCancel.addEventListener('click', fecharConfirmacao);
  confirmOverlay.addEventListener('click', e => {
    if (e.target === confirmOverlay) fecharConfirmacao();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && confirmOverlay.classList.contains('open')) fecharConfirmacao();
  });

  confirmTermsCheckbox.addEventListener('change', () => {
    confirmSubmitBtn.disabled = !confirmTermsCheckbox.checked;
  });

  confirmSubmitBtn.addEventListener('click', async () => {
    if (!pedidoPendente || confirmSubmitBtn.disabled) return;

    const pedido = pedidoPendente;
    confirmSubmitBtn.classList.add('loading');
    confirmSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const sucesso = await enviarAgendamento(pedido);

    fecharConfirmacao();

    if (sucesso) {
      mostrarToast({
        type: 'success',
        title: 'Horário marcado!',
        text: `Seu agendamento para ${formatarDataExibicao(pedido.data)} às ${pedido.horario} foi confirmado. Até breve na barbearia! ✂️`
      });
      // Reseta o formulário para um novo agendamento
      checkboxes.forEach(cb => { cb.checked = false; });
      updateTotal();
      if (clienteNome) clienteNome.value = '';
      if (clienteTelefone) clienteTelefone.value = '';
      if (clienteData) clienteData.value = '';
      if (clienteHorario) {
        clienteHorario.innerHTML = '<option value="">Escolha o dia primeiro</option>';
        clienteHorario.disabled = true;
      }
      if (horarioStatus) { horarioStatus.textContent = ''; horarioStatus.className = 'horario-status'; }
      dataSelecionadaBR = '';
    } else {
      mostrarToast({
        type: 'error',
        title: 'Não foi possível marcar o horário',
        text: 'Tivemos um problema para confirmar seu agendamento automaticamente. Entre em contato com o Evanildo pelo <a href="https://wa.me/558591954828" target="_blank" rel="noopener">WhatsApp</a>, marque seu horário por lá e, se puder, avise sobre esse erro.'
      });
    }
  });

  // Envia o pedido para o workflow (n8n), que grava na planilha do dia.
  // Retorna true/false indicando se a chamada foi bem-sucedida.
  async function enviarAgendamento(pedido) {
    if (!N8N_BASE_URL || N8N_BASE_URL.includes('SEU-N8N-AQUI')) {
      return false;
    }
    try {
      const resp = await fetch(`${N8N_BASE_URL}/consultar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: pedido.data,
          horario: pedido.horario,
          cliente: pedido.nome,
          telefone: pedido.telefone,
          servicos: pedido.servicos.join(', ')
        })
      });
      return resp.ok;
    } catch (err) {
      console.warn('Falha ao registrar agendamento no workflow:', err);
      return false;
    }
  }

  /* ============================================================
     5d. TOASTS — notificações de sucesso/erro
     ============================================================ */
  const toastContainer = document.getElementById('toastContainer');

  function mostrarToast({ type = 'success', title = '', text = '', duration = 9000 }) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.innerHTML = `
      <i class="fas ${icon} toast-icon"></i>
      <div class="toast-body">
        <p class="toast-title"></p>
        <p class="toast-text"></p>
      </div>
      <button type="button" class="toast-close" aria-label="Fechar"><i class="fas fa-times"></i></button>
      <span class="toast-timer"></span>
    `;
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-text').innerHTML = text; // texto controlado internamente (pode ter link)

    const timerBar = toast.querySelector('.toast-timer');
    timerBar.style.animationDuration = duration + 'ms';

    let fecharTimeout;

    const remover = () => {
      clearTimeout(fecharTimeout);
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    };

    const agendarFechamento = (ms) => {
      clearTimeout(fecharTimeout);
      fecharTimeout = setTimeout(remover, ms);
    };

    // Pausa o temporizador (visual + fechamento) enquanto o mouse está sobre o toast
    toast.addEventListener('mouseenter', () => {
      clearTimeout(fecharTimeout);
      timerBar.style.animationPlayState = 'paused';
    });
    toast.addEventListener('mouseleave', () => {
      const trackWidth = timerBar.parentElement.getBoundingClientRect().width;
      const restanteProporcional = trackWidth
        ? timerBar.getBoundingClientRect().width / trackWidth
        : 0;
      timerBar.style.animationPlayState = 'running';
      agendarFechamento(Math.max(restanteProporcional * duration, 600));
    });

    toast.querySelector('.toast-close').addEventListener('click', remover);
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    agendarFechamento(duration);
  }


  /* ============================================================
     5b. ALINHAMENTO — botão do WhatsApp termina junto com a lista
     Mede a altura real da lista de serviços e ajusta o box do
     total para que o fim do botão bata exatamente com o fim da
     lista, em qualquer resolução (só no layout de 2 colunas).
     ============================================================ */
  function alignServicesForm() {
    const checklist = document.querySelector('.checklist-cols');
    const totalBox  = document.getElementById('totalBox');
    const btn       = document.getElementById('btnWhatsapp');
    if (!checklist || !totalBox || !btn) return;

    // Abaixo de 900px o layout empilha em coluna única: sem alinhamento forçado
    if (window.innerWidth <= 900) {
      totalBox.style.height = '';
      return;
    }

    // Reseta para medir a altura natural do total-box antes de recalcular
    totalBox.style.height = '';

    const checklistBottom = checklist.getBoundingClientRect().bottom;
    const totalBoxRect    = totalBox.getBoundingClientRect();
    const btnRect         = btn.getBoundingClientRect();
    const btnMarginTop    = parseFloat(getComputedStyle(btn).marginTop) || 0;

    // Altura necessária para que o fim do botão alinhe com o fim da lista
    const target = checklistBottom - totalBoxRect.top - btnMarginTop - btnRect.height;

    if (target > totalBoxRect.height) {
      totalBox.style.height = target + 'px';
    }
  }

  alignServicesForm();
  window.addEventListener('load', alignServicesForm);
  document.fonts.ready.then(alignServicesForm);

  let alignResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(alignResizeTimer);
    alignResizeTimer = setTimeout(alignServicesForm, 150);
  }, { passive: true });

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