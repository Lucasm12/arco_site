/* ==========================================================================
   Arco · Site institucional — Interações
   Sem dependências. Cada módulo é independente e só roda se o seu
   elemento existir na página. Respeita "reduzir movimento".
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var config = window.ARCO_CONFIG || {};
  var isLocal = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  /* Medição: não faz nada até initAnalytics ligar um provedor com o consentimento do visitante */
  var track = function () {};

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
     Sem JS, com "reduzir movimento", com economia de dados ou em conexão lenta (2G/3G), fica o poster;
     o botão continua oferecendo "Reproduzir". */
  function initMedia() {
    var boxes = $$('[data-media]');
    if (!boxes.length) return;
    var mobile = window.matchMedia('(max-width: 767.98px)');
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(connection && connection.saveData);
    var slow = !!(connection && /2g|3g/.test(connection.effectiveType || ''));
    var autoplay = !reduceMotion.matches && !saveData && !slow;
    var items = [];

    function sourceFor(item) {
      return (mobile.matches && item.video.getAttribute('data-src-mobile')) || item.video.getAttribute('data-src');
    }

    function load(item) {
      var base = sourceFor(item);
      if (!base || item.src === base) return;
      var video = item.video;
      var version = video.getAttribute('data-v'); // injetado pelo build: muda quando o arquivo muda (cache longo)
      item.src = base;
      while (video.firstChild) video.removeChild(video.firstChild);
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (format) {
        var source = document.createElement('source');
        source.src = base + '.' + format[0] + (version ? '?v=' + version : '');
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
        if (tab.getAttribute('aria-selected') !== 'true') track('tab_open', { aba: tab.id.replace(/^tab-/, '') });
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

  /* ---- Origem da visita (UTM): vai junto com o pedido para medir de onde vêm as demonstrações ---- */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function readUtm() {
    var found = {};
    var params = new URLSearchParams(location.search);
    UTM_KEYS.forEach(function (key) { if (params.get(key)) found[key] = params.get(key).slice(0, 120); });
    try {
      if (Object.keys(found).length) sessionStorage.setItem('arco-utm', JSON.stringify(found));
      else found = JSON.parse(sessionStorage.getItem('arco-utm') || '{}');
    } catch (e) { /* armazenamento indisponível */ }
    return found;
  }

  /* ---- Formulários de demonstração: validação acessível, envio, antispam e estados ----
     Envia para ARCO_CONFIG.formEndpoint (Formspree, Basin ou endpoint próprio): POST com
     FormData e "Accept: application/json". Sem endpoint, simula só em ambiente local. */
  var FORM_ERRORS = {
    rede: 'Não foi possível enviar agora. Confira sua conexão e tente de novo.',
    tempo: 'O envio demorou mais que o esperado. Confira sua conexão e tente de novo.',
    limite: 'Recebemos muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.',
    servidor: 'Não foi possível enviar agora. Tente de novo em alguns minutos.'
  };

  function initLeadForms() {
    var forms = $$('[data-lead-form]');
    if (!forms.length) return;
    var endpoint = String(config.formEndpoint || '').trim();
    var utm = readUtm();

    if (!endpoint) {
      console.warn('[Arco] formEndpoint vazio em assets/js/config.js: ' +
        (isLocal ? 'envio simulado (ambiente local).' : 'os envios vão falhar até ele ser preenchido.'));
    }

    function failure(kind) { var error = new Error(kind); error.kind = kind; return error; }

    function send(data) {
      if (!endpoint) {
        return isLocal ? new Promise(function (resolve) { window.setTimeout(resolve, 700); }) : Promise.reject(failure('servidor'));
      }
      var controller = 'AbortController' in window ? new AbortController() : null;
      var timer = controller ? window.setTimeout(function () { controller.abort(); }, 15000) : null;
      return fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      }).then(function (response) {
        window.clearTimeout(timer);
        if (!response.ok) throw failure(response.status === 429 ? 'limite' : 'servidor');
      }, function (error) {
        window.clearTimeout(timer);
        throw failure(error && error.name === 'AbortError' ? 'tempo' : 'rede');
      });
    }

    forms.forEach(function (form) {
      var name = form.getAttribute('data-lead-form') || 'demonstracao';
      var success = $('[data-form-success]', form.parentNode);
      var fail = $('[data-form-fail]', form);
      var failText = fail && $('[data-fail-text]', fail);
      var status = $('[data-form-status]', form);
      var submit = $('[type="submit"]', form);
      var label = $('.btn__label', submit) || submit;
      var idleLabel = label.textContent;
      var fields = $$('.field', form);
      var honeypot = $('[data-hp] input', form);
      var attempted = false;
      var started = false;
      var sending = false;

      function validate(field) {
        var control = $('input, select, textarea', field);
        var error = $('.field__error', field);
        var validity = control.validity;
        var message = '';
        if (validity.valueMissing) message = control.getAttribute('data-msg-required');
        else if (validity.typeMismatch) message = control.getAttribute('data-msg-type');
        else if (control.getAttribute('data-validate') === 'telefone' && control.value.trim()) {
          var digits = control.value.replace(/\D/g, '').length;
          if (digits < 10 || digits > 13) message = control.getAttribute('data-msg-type');
        }
        field.classList.toggle('is-invalid', !!message);
        control.setAttribute('aria-invalid', String(!!message));
        $('span', error).textContent = message;
        error.hidden = !message;
        return !message;
      }

      function setBusy(busy) {
        sending = busy;
        // aria-disabled (e não disabled) para o foco continuar no botão durante o envio
        submit.setAttribute('aria-disabled', String(busy));
        submit.classList.toggle('is-busy', busy);
        label.textContent = busy ? 'Enviando…' : idleLabel;
        if (status) status.textContent = busy ? 'Enviando seu pedido…' : '';
      }

      function showFail(kind) {
        var message = FORM_ERRORS[kind] || FORM_ERRORS.servidor;
        if (failText) failText.textContent = message;
        if (fail) fail.hidden = false;
        if (status) status.textContent = message; // a região de status já existe na página: o leitor de tela anuncia
      }

      // Depois do envio, os outros formulários da página já chegam preenchidos com o que foi informado
      function shareValues() {
        forms.forEach(function (other) {
          if (other === form) return;
          $$('input[name], select[name]', form).forEach(function (control) {
            var target = other.elements[control.name];
            if (target && target.type !== 'hidden' && target.type !== 'checkbox' && !target.value && control.value) target.value = control.value;
          });
        });
      }

      function done() {
        shareValues();
        form.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      }

      fields.forEach(function (field) {
        var control = $('input, select, textarea', field);
        var event = control.tagName === 'SELECT' || control.type === 'checkbox' ? 'change' : 'input';
        control.addEventListener(event, function () {
          if (attempted || field.classList.contains('is-invalid')) validate(field);
        });
        control.addEventListener('blur', function () { if (attempted) validate(field); });
      });

      form.addEventListener('input', function () {
        if (started) return;
        started = true;
        track('form_start', { formulario: name });
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (sending) return;
        attempted = true;
        if (fail) fail.hidden = true;

        var invalid = fields.filter(function (field) { return !validate(field); });
        if (invalid.length) {
          $('input, select, textarea', invalid[0]).focus();
          track('form_error', { formulario: name, motivo: 'validacao' });
          return;
        }

        // Robôs preenchem o campo invisível: mostramos sucesso e não enviamos nada
        if (honeypot && honeypot.value) { done(); return; }

        var data = new FormData(form);
        data.set('pagina', location.origin + location.pathname);
        if (form.elements.consentimento && form.elements.consentimento.checked) data.set('consentimento_em', new Date().toISOString());
        Object.keys(utm).forEach(function (key) { data.set(key, utm[key]); });

        setBusy(true);
        send(data).then(function () {
          setBusy(false);
          track('form_submit', {
            formulario: name,
            perfil: data.get('perfil') || '',
            alunos: data.get('alunos') || ''
          });
          done();
        }, function (error) {
          setBusy(false);
          showFail(error.kind);
          track('form_error', { formulario: name, motivo: error.kind || 'servidor' });
        });
      });
    });
  }

  /* ---- Medição de audiência com consentimento (LGPD) ----
     Provedor em config.js: 'plausible' ou 'ga4'. Nenhum script de terceiros carrega antes do "Aceitar".
     A escolha vale 12 meses e pode ser revista em "Preferências de privacidade" (rodapé e política).
     Em localhost ou com ?debug-analytics na URL, cada evento aparece no console (enviado ou não). */
  var CONSENT_KEY = 'arco-consent';
  var CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  function initAnalytics() {
    var settings = config.analytics || {};
    var provider = String(settings.provedor || '').toLowerCase();
    var id = String(settings.id || '').trim();
    var enabled = (provider === 'plausible' || provider === 'ga4') && !!id;
    var debug = isLocal || /[?&]debug-analytics\b/.test(location.search);
    var active = false;
    var banner = null;
    var opener = null;

    $$('[data-analytics-on]').forEach(function (el) { el.hidden = !enabled; });
    $$('[data-analytics-off]').forEach(function (el) { el.hidden = enabled; });

    track = function (name, props) {
      props = props || {};
      if (debug) console.info('[Arco · medição] ' + name, props, active ? '' : '(não enviado: ' + (enabled ? 'sem consentimento' : 'sem provedor') + ')');
      if (!active) return;
      if (provider === 'ga4') window.gtag('event', name, props);
      else window.plausible(name, { props: props });
    };

    if (!enabled) return;

    function readChoice() {
      try {
        var saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
        if (saved && (saved.escolha === 'aceito' || saved.escolha === 'recusado') && Date.now() - saved.em < CONSENT_MAX_AGE) return saved.escolha;
      } catch (e) { /* armazenamento indisponível: pergunta de novo */ }
      return null;
    }

    function saveChoice(choice) {
      try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ escolha: choice, em: Date.now() })); } catch (e) { /* segue sem lembrar */ }
    }

    function addScript(src, attrs) {
      var script = document.createElement('script');
      script.async = true;
      script.src = src;
      Object.keys(attrs || {}).forEach(function (key) { script.setAttribute(key, attrs[key]); });
      document.head.appendChild(script);
    }

    function start() {
      if (active) return;
      active = true;
      if (provider === 'ga4') {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
        window.gtag('js', new Date());
        window.gtag('config', id);
        addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id));
      } else {
        window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
        addScript(settings.src || 'https://plausible.io/js/script.js', { 'data-domain': id });
      }
    }

    function stop() {
      if (!active) return;
      active = false;
      if (provider === 'ga4' && window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
        // Apaga os cookies do Google Analytics no domínio atual e no domínio pai
        document.cookie.split(';').forEach(function (cookie) {
          var name = cookie.split('=')[0].trim();
          if (!/^_ga/.test(name)) return;
          var host = location.hostname;
          [host, host.replace(/^[^.]+/, '')].forEach(function (domain) {
            document.cookie = name + '=; Max-Age=0; path=/; domain=' + domain;
          });
          document.cookie = name + '=; Max-Age=0; path=/';
        });
      }
    }

    function closeBanner() {
      if (!banner) return;
      banner.hidden = true;
      root.style.removeProperty('scroll-padding-bottom');
      if (opener) { opener.focus(); opener = null; }
    }

    function choose(choice) {
      saveChoice(choice);
      if (choice === 'aceito') start(); else stop();
      closeBanner();
    }

    function openBanner(fromButton) {
      if (!banner) {
        banner = document.createElement('section');
        banner.className = 'consent surface-dark';
        banner.setAttribute('aria-label', 'Privacidade');
        banner.innerHTML =
          '<p class="consent__text"><strong>Podemos medir como você usa o site?</strong> ' +
          'Contamos visitas e cliques de forma agregada, sem anúncios, para melhorar a página. ' +
          '<a href="politica-de-privacidade.html#cookies">Saiba mais</a></p>' +
          '<div class="consent__actions">' +
          '<button class="btn btn--secondary btn--sm" type="button" data-choice="recusado">Recusar</button>' +
          '<button class="btn btn--secondary btn--sm" type="button" data-choice="aceito">Aceitar</button>' +
          '</div>';
        banner.addEventListener('click', function (event) {
          var button = event.target.closest('[data-choice]');
          if (button) choose(button.getAttribute('data-choice'));
        });
        document.body.appendChild(banner);
      }
      banner.hidden = false;
      // O aviso fixo não pode cobrir o campo em foco (WCAG 2.4.11)
      root.style.setProperty('scroll-padding-bottom', (banner.offsetHeight + 24) + 'px');
      if (fromButton) { opener = fromButton; $('[data-choice]', banner).focus(); }
    }

    $$('[data-consent-open]').forEach(function (button) {
      (button.closest('[data-consent-item]') || button).hidden = false;
      button.addEventListener('click', function () { openBanner(button); });
    });

    var choice = readChoice();
    if (choice === 'aceito') start();
    else if (!choice && !navigator.globalPrivacyControl) afterLoad(function () { openBanner(null); });
    // Com o sinal Global Privacy Control ligado e sem escolha salva, nada é medido nem perguntado
  }

  /* ---- Eventos de interação: CTAs, contato, abas e perguntas frequentes ---- */
  function initTracking() {
    function where(el) {
      if (el.getAttribute('data-track-local')) return el.getAttribute('data-track-local');
      if (el.closest('[data-header]')) return el.closest('.site-nav') ? 'menu' : 'cabecalho';
      if (el.closest('.site-footer')) return 'rodape';
      var section = el.closest('section[id]');
      return section ? section.id : 'pagina';
    }

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      var contact = link.getAttribute('data-contact');
      if (href === '#demonstracao') track('cta_click', { local: where(link), texto: link.textContent.trim().slice(0, 60) });
      else if (contact === 'whatsapp') track('whatsapp_click', { local: where(link) });
      else if (contact) track('contact_click', { canal: contact, local: where(link) });
    });

    $$('details.accordion__item').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) track('faq_open', { pergunta: $('summary', item).textContent.trim().slice(0, 100) });
      });
    });
  }

  /* ---- Rascunhos (ex.: prova social sem dados ainda): aparecem só com ?rascunho na URL ---- */
  function initDrafts() {
    if (!/[?&]rascunho\b/.test(location.search)) return;
    $$('[data-draft]').forEach(function (el) {
      el.hidden = false;
      el.classList.add('is-draft');
    });
  }

  /* ---- Aluno indica o Arco ao treinador: compartilhamento nativo no celular, WhatsApp no resto ---- */
  function initShare() {
    var links = $$('[data-share]');
    if (!links.length) return;
    var canonical = $('link[rel="canonical"]');
    var origin = canonical ? new URL(canonical.href).origin : location.origin;
    var text = 'Conheci o Arco, uma plataforma de treino em que a IA propõe e o treinador decide. Acho que pode ajudar no nosso acompanhamento:';

    links.forEach(function (link) {
      var local = link.getAttribute('data-share-local') || 'site';
      var url = origin + '/?utm_source=indicacao&utm_medium=aluno&utm_campaign=' + encodeURIComponent(local);
      link.href = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);
      link.addEventListener('click', function (event) {
        track('share_click', { local: local, metodo: navigator.share ? 'nativo' : 'whatsapp' });
        if (!navigator.share) return;
        event.preventDefault();
        navigator.share({ title: 'Arco', text: text, url: url }).catch(function () { /* o aluno fechou a janela */ });
      });
    });
  }

  /* ---- Links que levam a um campo: rolam até a seção e já deixam o cursor no campo ---- */
  function initFocusLinks() {
    $$('[data-focus-target]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var field = $(link.getAttribute('data-focus-target'));
        var section = field && $(link.getAttribute('href'));
        if (!field || !section || field.offsetParent === null) return;
        event.preventDefault();
        section.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        field.focus({ preventScroll: true });
      });
    });
  }

  /* ---- Contatos e redes (config.js): cada item só aparece quando estiver preenchido ---- */
  function initContacts() {
    var c = config.contato || {};
    var digits = String(c.whatsapp || '').replace(/\D/g, '');
    var hrefs = {
      email: c.email ? 'mailto:' + c.email : '',
      whatsapp: digits ? 'https://wa.me/' + digits + (c.whatsappMensagem ? '?text=' + encodeURIComponent(c.whatsappMensagem) : '') : '',
      instagram: c.instagram || '',
      linkedin: c.linkedin || '',
      youtube: c.youtube || ''
    };

    $$('[data-contact]').forEach(function (link) {
      var key = link.getAttribute('data-contact');
      if (!hrefs[key]) return;
      link.href = hrefs[key];
      if (key === 'email' && link.hasAttribute('data-contact-text')) link.textContent = c.email;
      (link.closest('[data-contact-item]') || link).hidden = false;
      link.hidden = false;
    });

    $$('[data-contact-group]').forEach(function (group) {
      group.hidden = !$$('[data-contact]', group).some(function (link) { return !(link.closest('[data-contact-item]') || link).hidden; });
    });
  }

  function initYear() {
    var el = $('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  initAnalytics();
  initTracking();
  initDrafts();
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
  initContacts();
  initLeadForms();
  initFocusLinks();
  initShare();
  initYear();
})();
