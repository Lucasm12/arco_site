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
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function onChange(mq, handler) {
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  /* Executa depois do carregamento da página (para não competir com o poster e as fontes) */
  function afterLoad(fn) {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn, { once: true });
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

  /* ---- Vídeos: carregam perto da tela, tocam só quando visíveis, sempre com pausa ----
     Sem JS, com "reduzir movimento" ou com economia de dados, fica o poster. */
  function initMedia() {
    var boxes = $$('[data-media]');
    if (!boxes.length) return;
    var mobile = window.matchMedia('(max-width: 767.98px)');
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(connection && connection.saveData);
    var autoplay = !reduceMotion.matches && !saveData;
    var items = [];

    function sourceFor(item) {
      return (mobile.matches && item.video.getAttribute('data-src-mobile')) || item.video.getAttribute('data-src');
    }

    function load(item) {
      var base = sourceFor(item);
      if (!base || item.src === base) return;
      var video = item.video;
      item.src = base;
      while (video.firstChild) video.removeChild(video.firstChild);
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (format) {
        var source = document.createElement('source');
        source.src = base + '.' + format[0];
        source.type = format[1];
        video.appendChild(source);
      });
      video.preload = 'auto';
      video.load();
    }

    function render(item) {
      if (!item.toggle) return;
      var playing = !item.paused;
      item.toggle.setAttribute('data-state', playing ? 'playing' : 'paused');
      item.toggle.setAttribute('aria-label', playing ? 'Pausar vídeo' : 'Reproduzir vídeo');
    }

    function play(item) {
      var attempt = item.video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function (error) {
          // AbortError = play() interrompido por pause() ou nova carga (rolagem rápida).
          // Não é bloqueio do navegador: o vídeo volta a tocar quando reaparecer.
          if (error && error.name === 'AbortError') return;
          // Autoplay bloqueado (ex.: modo de economia de energia): o botão passa a oferecer "Reproduzir"
          item.paused = true;
          render(item);
        });
      }
    }

    function sync(item) {
      if (item.visible && !item.paused && !document.hidden) { load(item); play(item); }
      else if (!item.video.paused) item.video.pause();
    }

    boxes.forEach(function (box) {
      var video = $('video', box);
      if (!video) return;
      var toggle = $('[data-media-toggle]', box) ||
        (video.id ? document.querySelector('[data-media-toggle][aria-controls="' + video.id + '"]') : null);
      var item = { box: box, video: video, toggle: toggle, src: null, visible: false, paused: !autoplay };
      items.push(item);

      video.muted = true; // o autoplay em linha exige vídeo mudo (iOS)
      video.addEventListener('playing', function () { box.classList.add('is-ready'); });

      if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', function () {
          item.paused = !item.paused;
          if (item.paused) video.pause();
          else { item.visible = true; load(item); play(item); }
          render(item);
        });
      }
      render(item);
    });

    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.visible = true; sync(item); });
      return;
    }

    afterLoad(function () {
      // Perto da tela: começa a baixar para já estar pronto quando aparecer
      var near = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var item = items.filter(function (i) { return i.box === entry.target; })[0];
          if (entry.isIntersecting && item && !item.paused) { load(item); near.unobserve(entry.target); }
        });
      }, { rootMargin: '400px 0px' });

      // Visível: toca; fora da tela: pausa (economiza bateria e processamento)
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var item = items.filter(function (i) { return i.box === entry.target; })[0];
          if (!item) return;
          item.visible = entry.isIntersecting;
          sync(item);
        });
      }, { threshold: 0.2 });

      items.forEach(function (item) { near.observe(item.box); seen.observe(item.box); });
    });

    document.addEventListener('visibilitychange', function () { items.forEach(sync); });

    onChange(mobile, function () {
      items.forEach(function (item) {
        if (!item.src || !item.video.getAttribute('data-src-mobile')) return;
        item.src = null;
        load(item);
        sync(item);
      });
    });

    onChange(reduceMotion, function () {
      if (!reduceMotion.matches) return;
      items.forEach(function (item) { item.paused = true; item.video.pause(); render(item); });
    });
  }

  /* ---- Números que contam até o valor final ao aparecer ---- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    function format(el, value) {
      var decimals = Number(el.getAttribute('data-decimals')) || 0;
      var text = decimals ? value.toFixed(decimals).replace('.', ',') : String(Math.round(value));
      return (el.getAttribute('data-prefix') || '') + text + (el.getAttribute('data-suffix') || '');
    }

    function animate(el) {
      var target = Number(el.getAttribute('data-count')) || 0;
      var duration = 900;
      var start = null;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        el.textContent = format(el, target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target);
      });
    }, { threshold: 0.6 });

    els.forEach(function (el) {
      el.textContent = format(el, 0);
      observer.observe(el);
    });
  }

  /* ---- Indicadores ao vivo: descanso em contagem regressiva e frequência cardíaca ----
     Só mudam enquanto visíveis; com "reduzir movimento", ficam parados. */
  function initTickers() {
    var countdowns = $$('[data-countdown]').map(function (el) {
      var start = Number(el.getAttribute('data-countdown')) || 45;
      return { el: el, start: start, value: start, visible: false };
    });
    var rates = $$('[data-bpm]').map(function (el) {
      var base = Number(el.getAttribute('data-bpm')) || 160;
      return { el: el, base: base, value: base, visible: false };
    });
    var all = countdowns.concat(rates);
    if (!all.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        all.forEach(function (item) { if (item.el === entry.target) item.visible = entry.isIntersecting; });
      });
    });
    all.forEach(function (item) { observer.observe(item.el); });

    // O dígito sobe 8 px em 150 ms ao mudar (manual §8.1): nada pisca
    function tick(el, text) {
      el.textContent = text;
      el.classList.remove('is-tick');
      void el.offsetWidth;
      el.classList.add('is-tick');
    }

    window.setInterval(function () {
      countdowns.forEach(function (item) {
        if (!item.visible || document.hidden) return;
        item.value = item.value > 0 ? item.value - 1 : item.start;
        tick(item.el, Math.floor(item.value / 60) + ':' + pad(item.value % 60));
      });
    }, 1000);

    window.setInterval(function () {
      rates.forEach(function (item) {
        if (!item.visible || document.hidden) return;
        var step = (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.6 ? 1 : 2);
        item.value = Math.max(item.base - 3, Math.min(item.base + 3, item.value + step));
        tick(item.el, String(item.value));
      });
    }, 1400);
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

  /* ---- Como funciona: a trilha se preenche com a rolagem e marca o passo em foco ---- */
  function initSteps() {
    var section = $('[data-steps]');
    if (!section) return;
    var steps = $$('[data-step]', section);
    var nums = steps.map(function (step) { return $('.step__num', step); });
    if (!nums.length || nums.indexOf(null) !== -1) return;
    var railTop = 0;
    var railHeight = 1;
    var offsets = [];
    var ticking = false;

    function measure() {
      var box = section.getBoundingClientRect();
      var first = nums[0].getBoundingClientRect();
      var last = nums[nums.length - 1].getBoundingClientRect();
      railTop = first.top + first.height / 2 - box.top;
      var railBottom = box.bottom - (last.top + last.height / 2);
      railHeight = Math.max(1, box.height - railTop - railBottom);
      section.style.setProperty('--rail-top', railTop.toFixed(1) + 'px');
      section.style.setProperty('--rail-bottom', railBottom.toFixed(1) + 'px');
      offsets = nums.map(function (num) {
        var r = num.getBoundingClientRect();
        return (r.top + r.height / 2 - box.top - railTop) / railHeight;
      });
    }

    function update() {
      ticking = false;
      var box = section.getBoundingClientRect();
      var line = window.innerHeight * 0.55;
      var progress = Math.max(0, Math.min(1, (line - (box.top + railTop)) / railHeight));
      var complete = progress >= 0.999;
      var active = 0;
      offsets.forEach(function (offset, i) { if (progress >= offset - 0.001) active = i; });

      section.style.setProperty('--rail-progress', progress.toFixed(4));
      section.classList.toggle('is-complete', complete);
      steps.forEach(function (step, i) {
        step.classList.toggle('is-active', i === active && !complete);
        step.classList.toggle('is-done', i < active || complete);
      });
    }

    function refresh() { measure(); update(); }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', refresh);
    afterLoad(refresh);
    if ('ResizeObserver' in window) new ResizeObserver(refresh).observe(section);
    refresh();
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

  /* ---- Abas (padrão WAI-ARIA, setas/Home/End) + links que abrem uma aba ---- */
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

    // Ex.: "Alunos" no rodapé abre a aba "Para alunos" antes de rolar até a seção
    $$('[data-open-tab]').forEach(function (link) {
      link.addEventListener('click', function () {
        var tab = document.getElementById(link.getAttribute('data-open-tab'));
        if (tab) tab.click();
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
  initMedia();
  initCounters();
  initTickers();
  initRestTimer();
  initSteps();
  initAiDemo();
  initTabs();
  initLeadForm();
  initYear();
})();
