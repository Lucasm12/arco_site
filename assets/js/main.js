/* ==========================================================================
   Arco · Site institucional — Interações
   Sem dependências. Cada módulo é independente e só roda se o seu
   elemento existir na página. Respeita "reduzir movimento".
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* armazenamento indisponível */ } }
  };

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function onChange(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  /* ---- Tema claro/escuro (segue o sistema até o usuário escolher) ---- */
  function initTheme() {
    var button = $('[data-theme-toggle]');
    if (!button) return;
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function effective() { return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light'); }
    function sync() { button.setAttribute('aria-pressed', String(effective() === 'dark')); }

    button.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('arco-theme', next);
      sync();
    });

    onChange(systemDark, sync);
    sync();
  }

  /* ---- Cabeçalho: fundo ao rolar + barra fina de progresso ---- */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var bar = $('[data-progress]', header);
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var max = root.scrollHeight - window.innerHeight;
      header.classList.toggle('is-scrolled', y > 8);
      if (bar) bar.style.setProperty('--progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- Menu móvel ---- */
  function initNav() {
    var toggle = $('[data-nav-toggle]');
    var nav = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
    if (!nav) return;
    var desktop = window.matchMedia('(min-width: 1200px)');

    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });

    document.addEventListener('click', function (event) {
      if (isOpen() && !event.target.closest('[data-header]')) setOpen(false);
    });

    onChange(desktop, function () { setOpen(false); });
  }

  /* ---- Link ativo no menu conforme a seção visível ---- */
  function initScrollSpy() {
    var links = $$('.site-nav__link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (link) { byId[link.getAttribute('href').slice(1)] = link; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.removeAttribute('aria-current'); });
        var active = byId[entry.target.id];
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    $$('main section[id]').forEach(function (section) { observer.observe(section); });
  }

  /* ---- Revelação no scroll ---- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Cronômetro de descanso do hero (anel esvazia; 3 s finais crescem 4%/s) ---- */
  function initRestTimer() {
    var el = $('[data-rest-timer]');
    if (!el) return;
    var output = $('[data-rest-value]', el);
    var ring = $('[data-rest-ring]', el);
    var total = Number(el.getAttribute('data-total')) || 90;
    var remaining = Number(el.getAttribute('data-start')) || total;
    var timer = null;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function render() {
      output.textContent = pad(Math.floor(remaining / 60)) + ':' + pad(remaining % 60);
      ring.style.strokeDashoffset = String(100 - (remaining / total) * 100);
      var final = remaining > 0 && remaining <= 3 ? 1 + (4 - remaining) * 0.04 : 1;
      output.style.setProperty('--final-scale', String(final));
    }

    function tick() {
      remaining = remaining > 0 ? remaining - 1 : total;
      render();
    }

    render();
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !timer) timer = window.setInterval(tick, 1000);
      if (!visible && timer) { window.clearInterval(timer); timer = null; }
    }).observe(el);
  }

  /* ---- Como funciona: anel de séries acompanha o passo em foco ---- */
  function initSteps() {
    var section = $('[data-steps]');
    if (!section) return;
    var steps = $$('[data-step]', section);
    var segments = $$('[data-ring-seg]', section);
    var num = $('[data-ring-num]', section);
    var label = $('[data-ring-label]', section);
    var aside = $('.steps__aside', section);
    var active = -1;

    function setActive(index) {
      if (index === active || index < 0) return;
      active = index;
      var last = steps.length - 1;
      var complete = index === last;

      steps.forEach(function (step, i) {
        step.classList.toggle('is-active', i === index && !complete);
        step.classList.toggle('is-done', i < index || complete);
      });

      segments.forEach(function (seg, i) {
        var state = i < index || complete ? 'done' : (i === index ? 'current' : 'pending');
        seg.setAttribute('data-state', state);
      });

      num.textContent = (index + 1 < 10 ? '0' : '') + (index + 1);
      label.textContent = $('[data-step-title]', steps[index]).textContent;
      aside.classList.toggle('is-complete', complete);
    }

    if (!('IntersectionObserver' in window)) { setActive(0); return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(steps.indexOf(entry.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    steps.forEach(function (step) { observer.observe(step); });
    setActive(0);
  }

  /* ---- Demonstração da autoria: IA (tracejado) → revisão → aprovado (linha) ---- */
  function initAiDemo() {
    var demo = $('[data-ai-demo]');
    if (!demo) return;
    var status = $('[data-ai-status]', demo);
    var loads = $$('[data-ai-load]', demo);
    var stages = $$('[data-stage]', demo);
    var togglable = $$('[data-show]', demo);
    var BASE = 62.5, MIN = 50, MAX = 75, STEP = 2.5;
    var load = BASE;
    var stageFor = { ai: 'ai', edit: 'edit', approved: 'approved', discarded: null };
    var focusTarget = {
      ai: '[data-action="apply"]',
      edit: '[data-action="inc"]',
      approved: '[data-action="reset"]',
      discarded: '[data-action="reset"]'
    };

    function format(value) { return value.toFixed(1).replace('.0', '').replace('.', ','); }

    function renderLoad() {
      loads.forEach(function (el) { el.textContent = format(load); });
      $('[data-action="dec"]', demo).disabled = load <= MIN;
      $('[data-action="inc"]', demo).disabled = load >= MAX;
    }

    function setState(state, message, moveFocus) {
      demo.setAttribute('data-state', state);
      togglable.forEach(function (el) {
        // toggleAttribute (e não .hidden) para valer também em elementos SVG
        el.toggleAttribute('hidden', el.getAttribute('data-show').split(' ').indexOf(state) === -1);
      });
      stages.forEach(function (stage) {
        if (stage.getAttribute('data-stage') === stageFor[state]) stage.setAttribute('aria-current', 'step');
        else stage.removeAttribute('aria-current');
      });
      if (message) status.textContent = message;
      if (moveFocus) {
        var target = $(focusTarget[state], demo);
        if (target) target.focus();
      }
    }

    demo.addEventListener('click', function (event) {
      var button = event.target.closest('[data-action]');
      if (!button || button.disabled) return;

      switch (button.getAttribute('data-action')) {
        case 'apply':
          setState('approved', 'Sugestão aplicada. O treino do Rafael agora é assinado por Carla: 4×8 com ' + format(load) + ' kg.', true);
          break;
        case 'edit':
          setState('edit', 'Modo de edição. Ajuste a carga e publique o treino.', true);
          break;
        case 'dec':
          load = Math.max(MIN, load - STEP); renderLoad();
          status.textContent = 'Carga: ' + format(load) + ' kg.';
          break;
        case 'inc':
          load = Math.min(MAX, load + STEP); renderLoad();
          status.textContent = 'Carga: ' + format(load) + ' kg.';
          break;
        case 'publish':
          setState('approved', 'Treino publicado por Carla: 4×8 com ' + format(load) + ' kg.', true);
          break;
        case 'cancel':
          load = BASE; renderLoad();
          setState('ai', 'Edição cancelada. A sugestão da IA continua pendente.', true);
          break;
        case 'discard':
          setState('discarded', 'Sugestão descartada. Nada foi enviado ao aluno.', true);
          break;
        case 'reset':
          load = BASE; renderLoad();
          setState('ai', 'Demonstração reiniciada.', true);
          break;
      }
    });

    renderLoad();
    setState('ai');
  }

  /* ---- Abas (padrão WAI-ARIA, setas/Home/End) ---- */
  function initTabs() {
    $$('[data-tabs]').forEach(function (container) {
      var tabs = $$('[role="tab"]', container);

      function select(tab, focus) {
        tabs.forEach(function (t) {
          var selected = t === tab;
          t.setAttribute('aria-selected', String(selected));
          t.tabIndex = selected ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
        });
        if (focus) tab.focus();
      }

      container.addEventListener('click', function (event) {
        var tab = event.target.closest('[role="tab"]');
        if (tab) select(tab, false);
      });

      container.addEventListener('keydown', function (event) {
        var index = tabs.indexOf(document.activeElement);
        if (index === -1) return;
        var next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) { event.preventDefault(); select(tabs[next], true); }
      });
    });
  }

  /* ---- Formulário de demonstração (validação acessível) ---- */
  function initLeadForm() {
    var form = $('[data-lead-form]');
    if (!form) return;
    var success = $('[data-form-success]', form.parentNode);
    var fail = $('[data-form-fail]', form);
    var submit = $('[type="submit"]', form);
    var fields = $$('.field', form);
    var attempted = false;

    function validate(field) {
      var control = $('input, select, textarea', field);
      var error = $('.field__error', field);
      var message = '';
      if (control.validity.valueMissing) message = control.getAttribute('data-msg-required');
      else if (control.validity.typeMismatch) message = control.getAttribute('data-msg-type');
      field.classList.toggle('is-invalid', !!message);
      control.setAttribute('aria-invalid', String(!!message));
      $('span', error).textContent = message;
      error.hidden = !message;
      return !message;
    }

    fields.forEach(function (field) {
      var control = $('input, select, textarea', field);
      control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (attempted || field.classList.contains('is-invalid')) validate(field);
      });
      control.addEventListener('blur', function () { if (attempted) validate(field); });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      attempted = true;
      fail.hidden = true;

      var invalid = fields.filter(function (field) { return !validate(field); });
      if (invalid.length) { $('input, select, textarea', invalid[0]).focus(); return; }

      var endpoint = form.getAttribute('data-endpoint');
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');

      var request = endpoint
        ? fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
            .then(function (response) { if (!response.ok) throw new Error('HTTP ' + response.status); })
        : new Promise(function (resolve) { window.setTimeout(resolve, 600); });

      request.then(function () {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }).catch(function () {
        fail.hidden = false;
      }).then(function () {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
      });
    });
  }

  function initYear() {
    var el = $('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  initTheme();
  initHeader();
  initNav();
  initScrollSpy();
  initReveal();
  initRestTimer();
  initSteps();
  initAiDemo();
  initTabs();
  initLeadForm();
  initYear();
})();
