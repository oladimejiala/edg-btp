(() => {
  'use strict';

  const WHATSAPP_NUMBER = '2290190212876';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const inputArea = document.getElementById('chatInputArea');
  const teaser = document.getElementById('chatTeaser');
  const teaserClose = document.getElementById('chatTeaserClose');

  let hasConversationStarted = false;
  let hasBeenManuallyClosed = false;

  const answers = { name: '', company: '', types: [], whatsapp: '' };

  /* ---------------- low-level render helpers ---------------- */
  function scrollToEnd() {
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'msg-typing';
    t.id = 'typingIndicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    scrollToEnd();
  }

  function hideTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  function botSay(text, opts = {}) {
    return new Promise((resolve) => {
      const delay = prefersReducedMotion ? 0 : (opts.delay ?? 550);
      showTyping();
      setTimeout(() => {
        hideTyping();
        const m = document.createElement('div');
        m.className = 'msg msg-bot';
        m.innerHTML = text;
        body.appendChild(m);
        scrollToEnd();
        resolve();
      }, delay);
    });
  }

  function userSay(text) {
    const m = document.createElement('div');
    m.className = 'msg msg-user';
    m.textContent = text;
    body.appendChild(m);
    scrollToEnd();
  }

  function clearInputArea() {
    inputArea.innerHTML = '';
  }

  function renderQuickReplies(options) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-quick-replies msg';
    wrap.style.background = 'transparent';
    wrap.style.padding = '0';
    wrap.style.maxWidth = '100%';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-chip';
      btn.type = 'button';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        wrap.remove();
        userSay(opt.label);
        opt.onClick();
      });
      wrap.appendChild(btn);
    });
    body.appendChild(wrap);
    scrollToEnd();
  }

  function renderTextInput({ placeholder, onSubmit, type = 'text' }) {
    clearInputArea();
    const field = document.createElement('div');
    field.className = 'chat-form-field';
    field.innerHTML = `
      <div class="chat-text-row">
        <input type="${type}" placeholder="${placeholder}" autocomplete="off" />
        <button class="chat-send" type="button" aria-label="Envoyer">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>`;
    inputArea.appendChild(field);
    const input = field.querySelector('input');
    const send = field.querySelector('.chat-send');
    input.focus();
    const submit = () => {
      const val = input.value.trim();
      if (!val) { input.focus(); return; }
      clearInputArea();
      userSay(val);
      onSubmit(val);
    };
    send.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  }

  function renderCheckboxStep({ options, onSubmit }) {
    clearInputArea();
    const wrap = document.createElement('div');
    const list = document.createElement('div');
    list.className = 'chat-checkbox-list';
    const selected = new Set();
    options.forEach(opt => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="${opt}"><span>${opt}</span>`;
      const cb = label.querySelector('input');
      cb.addEventListener('change', () => {
        if (cb.checked) selected.add(opt); else selected.delete(opt);
      });
      list.appendChild(label);
    });
    const btnRow = document.createElement('div');
    btnRow.className = 'chat-text-row';
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary btn-block';
    continueBtn.type = 'button';
    continueBtn.style.borderRadius = '100px';
    continueBtn.style.padding = '11px 16px';
    continueBtn.textContent = 'Continuer';
    continueBtn.addEventListener('click', () => {
      if (selected.size === 0) return;
      clearInputArea();
      userSay([...selected].join(', '));
      onSubmit([...selected]);
    });
    btnRow.appendChild(continueBtn);
    wrap.appendChild(list);
    wrap.appendChild(btnRow);
    inputArea.appendChild(wrap);
  }

  function renderHandoffButton() {
    clearInputArea();
    const a = document.createElement('a');
    a.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn btn-whatsapp btn-block';
    a.style.borderRadius = '100px';
    a.textContent = 'Continuer sur WhatsApp avec un conseiller';
    inputArea.appendChild(a);
  }

  function buildWhatsappSummaryLink() {
    const msg = `Bonjour EDG BTP, je souhaite un devis.%0A- Nom et fonction: ${encodeURIComponent(answers.name)}%0A- Entreprise/Projet: ${encodeURIComponent(answers.company)}%0A- Type de travaux: ${encodeURIComponent(answers.types.join(', '))}%0A- WhatsApp: ${encodeURIComponent(answers.whatsapp)}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  /* ---------------- conversation flow ---------------- */
  async function startConversation() {
    if (hasConversationStarted) return;
    hasConversationStarted = true;
    body.innerHTML = '';
    clearInputArea();
    await botSay('👷 Bonjour, bienvenue chez <strong>EDG BTP &amp; SERVICES</strong> ! Je suis l\'assistant virtuel de l\'entreprise.');
    await botSay('Je peux réaliser un premier diagnostic de votre projet en moins d\'une minute. On commence ?', { delay: 500 });
    renderQuickReplies([
      { label: 'Démarrer le diagnostic', onClick: stepName },
      { label: 'Poser une question', onClick: freeQuestionStep },
      { label: 'Parler à un humain', onClick: handoffToHuman },
    ]);
  }

  async function stepName() {
    await botSay('Parfait 👍 Quel est votre <strong>nom et votre fonction</strong> ? <span style="opacity:.7">(ex : Fondateur, Maître d\'ouvrage…)</span>');
    renderTextInput({
      placeholder: 'Nom et fonction',
      onSubmit: (val) => { answers.name = val; stepCompany(); },
    });
  }

  async function stepCompany() {
    await botSay(`Merci ${escapeHtml(answers.name.split(' ')[0] || '')} ! Quel est le <strong>nom de votre entreprise ou de votre projet</strong> ?`);
    renderTextInput({
      placeholder: "Entreprise / Nom du projet",
      onSubmit: (val) => { answers.company = val; stepTypes(); },
    });
  }

  async function stepTypes() {
    await botSay('Quel <strong>type de travaux</strong> vous intéresse ? <span style="opacity:.7">(plusieurs choix possibles)</span>');
    renderCheckboxStep({
      options: ['Gros Œuvre', 'Plans Architecturaux', 'Rénovation Complexe', 'Charpente Métallique'],
      onSubmit: (vals) => { answers.types = vals; stepWhatsapp(); },
    });
  }

  async function stepWhatsapp() {
    await botSay('Presque terminé ! Sur quel <strong>numéro WhatsApp</strong> pouvons-nous vous recontacter ?');
    renderTextInput({
      placeholder: '+229 XX XX XX XX',
      type: 'tel',
      onSubmit: (val) => { answers.whatsapp = val; stepSuccess(); },
    });
  }

  async function stepSuccess() {
    await botSay('Analyse de votre diagnostic en cours…', { delay: 400 });
    await botSay(
      `<div style="text-align:center;padding:6px 0 2px;">
        <div style="width:46px;height:46px;border-radius:50%;background:var(--gold-dim,rgba(212,169,74,.15));color:var(--gold,#D4A94A);display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 10px;">✓</div>
        <strong style="display:block;font-size:15px;margin-bottom:6px;">Diagnostic validé !</strong>
        <span style="font-size:13.5px;">Monsieur le Fondateur ou un ingénieur de permanence vous recontactera sous peu.</span>
      </div>`,
      { delay: 700 }
    );
    clearInputArea();
    const a = document.createElement('a');
    a.href = buildWhatsappSummaryLink();
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn btn-whatsapp btn-block';
    a.style.borderRadius = '100px';
    a.textContent = 'Continuer sur WhatsApp';
    inputArea.appendChild(a);
  }

  async function freeQuestionStep() {
    await botSay('Bien sûr, posez votre question — je ferai de mon mieux pour y répondre 🙂');
    renderTextInput({
      placeholder: 'Votre question…',
      onSubmit: async () => {
        await botSay('Cette question dépasse ce que je peux traiter automatiquement. Je vous mets en relation avec un conseiller EDG BTP sur WhatsApp pour une réponse précise.');
        renderHandoffButton();
      },
    });
  }

  async function handoffToHuman() {
    await botSay('Bien sûr. Je vous transfère vers un conseiller EDG BTP sur WhatsApp — il pourra vous répondre directement.');
    renderHandoffButton();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- panel open / close ---------------- */
  function openPanel() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if (teaser) teaser.hidden = true;
    startConversation();
  }

  function closePanel() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    hasBeenManuallyClosed = true;
  }

  fab.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  if (teaserClose) {
    teaserClose.addEventListener('click', () => {
      teaser.hidden = true;
      hasBeenManuallyClosed = true;
    });
  }

  /* ---------------- scroll-triggered auto engagement ----------------
     After the visitor performs two distinct "scroll gestures" (scrolls,
     pauses, scrolls again), the assistant proactively opens and starts
     the conversation to capture attention — as specified in the brief. */
  let scrollGestures = 0;
  let gestureTimer = null;
  let autoTriggered = false;

  window.addEventListener('scroll', () => {
    if (autoTriggered || hasBeenManuallyClosed || window.scrollY < 60) return;
    if (!gestureTimer) {
      scrollGestures += 1;
      if (scrollGestures >= 2) {
        autoTriggered = true;
        if (teaser) {
          teaser.hidden = false;
          setTimeout(() => { if (panel.hidden && !hasBeenManuallyClosed) openPanel(); }, 1400);
        } else {
          openPanel();
        }
      }
    }
    clearTimeout(gestureTimer);
    gestureTimer = setTimeout(() => { gestureTimer = null; }, 550);
  }, { passive: true });

})();
