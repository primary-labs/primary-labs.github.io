/* Primary Labs · Letter Chains — app */
(function () {
  'use strict';
  var PL = window.PL;
  var Sound = PL.Sound;
  var Voice = PL.Voice;

  /* ------------------------------------------------------------------ helpers */

  var ICONS = {
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.5 9h4l5-4.5v15l-5-4.5h-4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    muted: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.5 9h4l5-4.5v15l-5-4.5h-4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',
    record: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="7" fill="currentColor"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    blend: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 15c3-6 9-8 16-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M15 7.5l4.5 3.5-4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="19.5" r="1.6" fill="currentColor"/><circle cx="9" cy="19.5" r="1.6" fill="currentColor"/><circle cx="14" cy="19.5" r="1.6" fill="currentColor"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15.5" r="1.6" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v; // only ever trusted, static markup
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) el.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
      else el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }

  function icon(name) { return h('span', { class: 'btn-icon', html: ICONS[name] || '' }); }

  function fillStaticArt() {
    document.querySelectorAll('[data-art]').forEach(function (el) { el.innerHTML = PL.art(el.getAttribute('data-art')); });
    document.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = ICONS[el.getAttribute('data-icon')] || ''; });
  }

  function kindOf(ch) { return PL.isVowel(ch) ? 'vowel' : 'consonant'; }

  function tileEl(ch, extra) {
    return h('span', { class: 'tile tile--' + kindOf(ch) + (extra ? ' ' + extra : ''), 'aria-hidden': 'true' }, ch);
  }

  /* A tiny sideways traffic light: three lamps, with only the lamp for this position lit.
     The lit lamp sits where the sound sits, so position reads by place as well as by color. */
  function lightEl(posIndex) {
    var el = h('span', { class: 'light', 'aria-hidden': 'true' });
    PL.POSITIONS.forEach(function (p, j) {
      el.appendChild(h('span', { class: 'lamp' + (j === posIndex ? ' lamp--' + p.light : '') }));
    });
    return el;
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function restartAnim(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // reflow so the animation can replay
    el.classList.add(cls);
  }

  var toastTimer = 0;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3800);
  }

  function confetti(container) {
    container.innerHTML = '';
    if (reduceMotion()) return;
    var colors = ['#E4572E', '#2160B0', '#FFC93C', '#2BA84A', '#9B5DE5'];
    for (var i = 0; i < 40; i++) {
      var p = h('span', { class: 'confetti-bit' });
      p.style.setProperty('--x', Math.round(Math.random() * 100) + '%');
      p.style.setProperty('--d', (Math.random() * 0.6).toFixed(2) + 's');
      p.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
      p.style.setProperty('--c', colors[i % colors.length]);
      container.appendChild(p);
    }
  }

  function storeGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  /* Name of the position of tile i in a word of length len (two-letter words: beginning, end). */
  function positionName(i, len) {
    var p = PL.POSITIONS[PL.positionAt(i, len || 3)];
    return p ? p.key : '';
  }

  /* A picture for any word (see js/pictures.js). */
  function pictureEl(w, cls) { return h('span', { class: cls, html: PL.picture(w) }); }

  function timeLeft(ms) {
    if (ms <= 0) return 'soon';
    var hrs = ms / 3600000;
    if (hrs < 1) return Math.max(1, Math.round(ms / 60000)) + ' min';
    if (hrs < 36) return Math.round(hrs) + (Math.round(hrs) === 1 ? ' hour' : ' hours');
    var d = Math.round(hrs / 24);
    return d + (d === 1 ? ' day' : ' days');
  }

  /* ------------------------------------------------------------------ custom chains */

  var CUSTOM_KEY = 'pl-custom-chains';
  function customChains() {
    var list = storeGet(CUSTOM_KEY, []);
    if (!Array.isArray(list)) return [];
    // Re-validate anything read back from storage
    return list.filter(function (c) {
      return c && typeof c.id === 'string' && PL.validateChain((c.words || []).join(' ')).ok;
    }).map(function (c) {
      return { id: c.id, name: String(c.name || 'My chain').slice(0, 30), words: c.words, custom: true };
    });
  }
  function allChains() { return PL.CHAINS.concat(customChains()); }
  function findChain(id) {
    var list = allChains();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function allWords() {
    var set = {};
    Object.keys(PL.WORDS).forEach(function (w) { set[w] = true; });
    customChains().forEach(function (c) { c.words.forEach(function (w) { set[w] = true; }); });
    return Object.keys(set).sort();
  }

  /* ------------------------------------------------------------------ router */

  var VIEWS = ['home', 'sounds', 'chains', 'spy', 'teacher'];
  var currentView = null;
  var firstRoute = true;

  function route() {
    var v = (location.hash || '#home').slice(1);
    if (VIEWS.indexOf(v) === -1) v = 'home';
    if (v === currentView) return;
    Sound.stop();
    if (currentView === 'teacher') Teacher.onLeave();
    currentView = v;
    document.querySelectorAll('.view').forEach(function (el) { el.hidden = el.getAttribute('data-view') !== v; });
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === v) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var titles = { home: 'Letter Chains', sounds: 'Meet the Sounds', chains: 'Letter Chains', spy: 'Sound Spy', teacher: 'Teacher Corner' };
    document.title = titles[v] + ' | Primary Labs';
    if (v === 'sounds') Sounds.render();
    if (v === 'chains') Chains.onShow();
    if (v === 'spy') Spy.onShow();
    if (v === 'teacher') Teacher.onShow();
    if (!firstRoute) {
      window.scrollTo(0, 0);
      var heading = document.querySelector('#view-' + v + ' h1');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
    firstRoute = false;
  }

  /* ------------------------------------------------------------------ home */

  /* The hero is a real chain. On load, each link swaps its one letter in turn. */
  function renderHome() {
    var demo = ['cat', 'cot', 'dot', 'dog'];
    var wrap = $('heroChain');
    wrap.innerHTML = '';
    demo.forEach(function (w, i) {
      if (i > 0) wrap.appendChild(h('span', { class: 'hero-link' + (i === 2 ? ' hero-link--wrap' : ''), 'aria-hidden': 'true', html: PL.art('chainLink') }));
      var before = i > 0 ? demo[i - 1] : null;
      var changed = before ? PL.changedIndex(before, w) : -1;
      var word = h('span', { class: 'hero-word' });
      w.split('').forEach(function (ch, j) {
        if (j !== changed) { word.appendChild(tileEl(ch, 'hero-tile')); return; }
        var t = h('span', { class: 'tile tile--' + kindOf(ch) + ' hero-tile is-changed', 'aria-hidden': 'true' },
          h('span', { class: 'swap-old' }, before[j]),
          h('span', { class: 'swap-new' }, ch));
        t.style.setProperty('--d', (0.5 + (i - 1) * 0.8) + 's');
        word.appendChild(t);
      });
      var light = changed >= 0 ? lightEl(changed) : lightEl(-1);
      if (changed < 0) light.classList.add('is-blank');
      wrap.appendChild(h('span', { class: 'hero-card', 'aria-hidden': 'true' },
        h('span', { class: 'hero-card-art', html: PL.art(PL.WORDS[w].art) }),
        word,
        light));
    });
  }

  /* ------------------------------------------------------------------ sounds */

  var Sounds = {
    render: function () {
      var vg = $('vowelGrid'), cg = $('consonantGrid');
      vg.innerHTML = ''; cg.innerHTML = '';
      Sound.preloadKeywords();
      var missing = 0;
      PL.LETTERS.forEach(function (l) {
        var hasVoice = Voice.has('sound:' + l.id);
        if (!hasVoice) missing++;
        var card = h('button', {
          type: 'button',
          class: 'sound-card sound-card--' + l.kind,
          'aria-label': l.label + ', as in ' + l.keyword + '. Play the sound.'
        },
          h('span', { class: 'sound-card-art', html: PL.art(l.art) }),
          tileEl(l.id, 'tile--lg'),
          h('span', { class: 'sound-card-label' }, l.kind === 'vowel' ? l.label : 'the ' + l.id + ' sound'),
          h('span', { class: 'sound-card-key' }, l.id, h('span', { class: 'key-rest' }, ' as in '), h('strong', null, l.keyword)),
          hasVoice ? h('span', { class: 'badge' }, h('span', { class: 'badge-icon', html: PL.art('mic') }), 'Teacher voice') : null
        );
        card.addEventListener('click', function () {
          document.querySelectorAll('.sound-card.is-playing').forEach(function (c) { c.classList.remove('is-playing'); });
          card.classList.add('is-playing');
          Sound.letter(l.id).then(function (src) {
            card.classList.remove('is-playing');
            if (src === 'none') toast('This sound could not play. Reload the page, or record it in Teacher Corner.');
          });
        });
        (l.kind === 'vowel' ? vg : cg).appendChild(card);
      });
      var note = $('soundsNote');
      note.hidden = missing === 0;
      note.textContent = missing === PL.LETTERS.length
        ? 'You will hear the keyword for each sound. Teachers can record the real sounds in Teacher Corner.'
        : 'Cards without "Teacher voice" play the keyword. Teachers can record them in Teacher Corner.';
    }
  };

  /* ------------------------------------------------------------------ chains */

  var LAST_CHAIN_KEY = 'pl-last-chain';

  var Chains = (function () {
    var s = {
      chain: null,
      step: 0,           // index of the word being built
      tiles: [],
      selected: -1,
      solved: false,
      busy: false,       // ignore taps during check animations
      tries: 0,
      hintLevel: 0,
      done: []           // finished words
    };
    var revertTimer = 0;

    function target() { return s.chain.words[s.step]; }
    function prev() { return s.step > 0 ? s.chain.words[s.step - 1] : null; }
    function mode() { return s.step === 0 ? 'build' : 'change'; }

    function setFeedback(msg, tone) {
      var f = $('chainFeedback');
      f.textContent = msg || '';
      f.className = 'feedback' + (tone ? ' feedback--' + tone : '');
    }

    function renderPicker() {
      var p = $('chainPicker');
      p.innerHTML = '';
      allChains().forEach(function (c, i) {
        var b = h('button', {
          type: 'button',
          class: 'pill' + (c.custom ? ' pill--custom' : ''),
          'aria-pressed': s.chain && s.chain.id === c.id ? 'true' : 'false',
          title: c.words.join(' → ')
        },
          h('span', { class: 'pill-num' }, c.custom ? '★' : String(i + 1)),
          h('span', { class: 'pill-text' }, c.name));
        b.addEventListener('click', function () { start(c, true); });
        p.appendChild(b);
      });
    }

    function renderProgress() {
      var el = $('chainProgress');
      el.innerHTML = '';
      el.appendChild(h('span', { class: 'progress-text' }, 'Word ' + (s.step + 1) + ' of ' + s.chain.words.length));
      var dots = h('span', { class: 'progress-dots', 'aria-hidden': 'true' });
      s.chain.words.forEach(function (_, i) {
        var state = i < s.step || (i === s.step && s.solved) ? 'is-done' : i === s.step ? 'is-now' : '';
        dots.appendChild(h('span', { class: 'progress-dot ' + state }));
      });
      el.appendChild(dots);
    }

    function renderPrompt() {
      var p = $('chainPrompt');
      p.innerHTML = '';
      if (s.solved) {
        p.appendChild(document.createTextNode('You made '));
        p.appendChild(h('strong', { class: 'prompt-made' }, target()));
        p.appendChild(document.createTextNode('!'));
      } else if (mode() === 'build') {
        p.appendChild(document.createTextNode('Listen, then build the first word.'));
      } else {
        p.appendChild(document.createTextNode('Change one sound in '));
        p.appendChild(h('strong', { class: 'prompt-word' }, prev()));
        p.appendChild(document.createTextNode(' to make the new word.'));
      }
    }

    function renderBoard() {
      var b = $('board');
      b.classList.remove('is-win', 'is-sweep', 'is-nudge');
      b.innerHTML = '';
      // Once solved, keep the tile that changed marked, with the old letter crossed out beside it.
      var was = s.solved && s.step > 0 ? prev() : null;
      var changedAt = was ? PL.changedIndex(was, target()) : -1;
      var len = s.tiles.length;
      s.tiles.forEach(function (ch, i) {
        var pos = PL.POSITIONS[PL.positionAt(i, len)];
        var isChanged = i === changedAt;
        var label = pos.key + ' sound' + (ch ? ', ' + ch : ', empty') + (s.selected === i ? ', selected' : '') +
          (isChanged ? ', changed from ' + was[i] : '');
        var slot = h('button', {
          type: 'button',
          class: 'slot' + (ch ? ' slot--filled tile--' + kindOf(ch) : '') + (s.selected === i ? ' is-selected' : '') + (isChanged ? ' is-changed' : ''),
          'data-i': i,
          'aria-label': label,
          'aria-pressed': s.selected === i ? 'true' : 'false',
          disabled: s.solved ? true : null
        },
          ch ? h('span', { class: 'slot-letter' }, ch) : h('span', { class: 'slot-empty', 'aria-hidden': 'true' }, '?'));
        slot.addEventListener('click', function () { onSlot(i); });
        var col = h('div', { class: 'slot-col' },
          slot,
          h('span', { class: 'slot-label' }, lightEl(PL.positionAt(i, len)), pos.key),
          isChanged ? h('span', { class: 'slot-swap', 'aria-hidden': 'true' },
            h('span', { class: 'mini-letter mini-letter--' + kindOf(was[i]) + ' is-was' }, was[i]),
            h('span', { class: 'slot-swap-arrow', html: ICONS.next }),
            h('span', { class: 'mini-letter mini-letter--' + kindOf(ch) + ' is-changed' }, ch)) : null);
        b.appendChild(col);
      });
      b.appendChild(h('span', { class: 'sweep', 'aria-hidden': 'true', html: ICONS.next }));
    }

    /* The lesson's letters, plus any other letters this chain uses. */
    function bankLetters() {
      var out = PL.LETTER_IDS.slice();
      s.chain.words.join('').split('').forEach(function (ch) { if (out.indexOf(ch) === -1) out.push(ch); });
      return out;
    }

    function renderBank() {
      var bank = $('bank');
      var letters = bankLetters();
      if (bank.getAttribute('data-letters') !== letters.join('')) {
        bank.innerHTML = '';
        bank.setAttribute('data-letters', letters.join(''));
        letters.forEach(function (ch) {
          var btn = h('button', {
            type: 'button',
            class: 'tile tile--' + kindOf(ch) + ' bank-tile',
            'data-letter': ch,
            'aria-label': 'Letter ' + ch
          }, ch);
          btn.addEventListener('click', function () { onLetter(ch); });
          bank.appendChild(btn);
        });
      }
      bank.querySelectorAll('.bank-tile').forEach(function (btn) {
        btn.disabled = s.solved;
        btn.classList.remove('is-glow');
      });
      bank.classList.toggle('is-waiting', !s.solved && mode() === 'change' && s.selected === -1);
    }

    function renderStrip() {
      var strip = $('strip');
      strip.innerHTML = '';
      s.chain.words.forEach(function (w, i) {
        var finished = i < s.done.length;
        if (i > 0) strip.appendChild(h('li', { class: 'strip-join' + (finished ? ' is-on' : ''), 'aria-hidden': 'true', html: PL.art('chainLink') }));
        if (!finished) {
          strip.appendChild(h('li', { class: 'strip-card strip-card--empty' + (i === s.step ? ' is-now' : '') },
            h('span', { class: 'sr-only' }, 'Word ' + (i + 1) + ', not made yet'),
            h('span', { class: 'strip-q', 'aria-hidden': 'true' }, '?')));
          return;
        }
        var changed = i > 0 ? PL.changedIndex(s.chain.words[i - 1], w) : -1;
        var letters = h('span', { class: 'mini-word' });
        w.split('').forEach(function (ch, j) {
          letters.appendChild(h('span', { class: 'mini-letter mini-letter--' + kindOf(ch) + (j === changed ? ' is-changed' : '') }, ch));
        });
        var card = h('li', { class: 'strip-card', 'data-i': i },
          h('button', { type: 'button', class: 'strip-btn', 'aria-label': w + (changed >= 0 ? ', changed the ' + positionName(changed, w.length) + ' sound' : '') + '. Hear it.' },
            pictureEl(w, 'strip-art'),
            letters));
        card.querySelector('button').addEventListener('click', function () { Sound.word(w); });
        strip.appendChild(card);
      });
    }

    function renderReveal() {
      var r = $('reveal');
      r.hidden = !s.solved;
      if (!s.solved) return;
      var w = target();
      var info = PL.WORDS[w] || {};
      $('revealArt').innerHTML = PL.picture(w);
      $('revealSentence').textContent = info.sentence || (PL.isRealWord(w) ? '' : 'A made-up word! Meet the ' + w + '.');
      $('sentenceBtn').hidden = !info.sentence;
      var last = s.step === s.chain.words.length - 1;
      $('nextBtn').hidden = last;
    }

    function renderTools() {
      var full = s.tiles.every(Boolean);
      $('blendBtn').disabled = !full;
      $('hintBtn').disabled = s.solved;
    }

    function render() {
      renderPicker();
      renderProgress();
      renderPrompt();
      renderBoard();
      renderBank();
      renderTools();
      renderReveal();
      renderStrip();
    }

    function start(chain, userAction) {
      clearTimeout(revertTimer);
      Sound.stop();
      Sound.preloadWords(chain.words);
      s.chain = chain;
      s.step = 0;
      s.tiles = target().split('').map(function () { return ''; });
      s.selected = 0;
      s.solved = false;
      s.busy = false;
      s.blendId = 0;
      s.tries = 0;
      s.hintLevel = 0;
      s.done = [];
      $('celebrate').hidden = true;
      storeSet(LAST_CHAIN_KEY, chain.id);
      setFeedback('');
      render();
      if (userAction) setTimeout(function () { Sound.word(target()); }, 250);
    }

    function nextStep() {
      if (s.step >= s.chain.words.length - 1) return;
      clearTimeout(revertTimer);
      s.step++;
      s.tiles = s.chain.words[s.step - 1].split('');
      s.selected = -1;
      s.solved = false;
      s.busy = false;   // a blend still winding down must not swallow taps
      s.blendId = 0;
      $('board').classList.remove('is-blending');
      s.tries = 0;
      s.hintLevel = 0;
      setFeedback('');
      render();
      Sound.word(target());
      var first = document.querySelector('#board .slot');
      if (first) first.focus();
    }

    function onSlot(i) {
      if (s.solved || s.busy) return;
      if (mode() === 'build' && s.tiles[i]) {
        s.tiles[i] = '';
        s.selected = i;
      } else {
        s.selected = s.selected === i && mode() === 'change' ? -1 : i;
      }
      if (s.selected === i && s.tiles[i]) Sound.clip('sound:' + s.tiles[i]);
      setFeedback(s.selected === -1 ? '' : mode() === 'change' ? 'Now tap the new letter for the ' + positionName(i, s.tiles.length) + ' sound.' : '');
      renderBoard();
      renderBank();
      renderTools();
      focusSlot(i);
    }

    function focusSlot(i) {
      var el = document.querySelector('#board .slot[data-i="' + i + '"]');
      if (el) el.focus();
    }

    /* True when placing `ch` at `idx` would spell a word we never show kids. */
    function wouldBlock(idx, ch) {
      var t = s.tiles.slice();
      t[idx] = ch;
      return t.every(Boolean) && PL.BLOCKED.indexOf(t.join('')) !== -1;
    }

    function refuse(idx) {
      Sound.chime('oops');
      setFeedback('Try a different letter.', 'oops');
      var el = document.querySelector('#board .slot[data-i="' + idx + '"]');
      if (el) restartAnim(el, 'is-shake');
    }

    function onLetter(ch) {
      if (s.solved || s.busy) return;
      if (mode() === 'build') {
        var idx = s.selected >= 0 ? s.selected : s.tiles.indexOf('');
        if (idx === -1) { setFeedback('Tap a tile to change it.', 'info'); return; }
        if (wouldBlock(idx, ch)) return refuse(idx);
        s.tiles[idx] = ch;
        s.selected = s.tiles.indexOf('');
        Sound.clip('sound:' + ch);
        renderBoard();
        renderBank();
        renderTools();
        popSlot(idx);
        if (s.tiles.every(Boolean)) check(idx);
        return;
      }
      if (s.selected === -1) {
        setFeedback('First tap the sound that changes: ' + (s.tiles.length === 2 ? 'beginning or end.' : 'beginning, middle, or end.'), 'info');
        restartAnim($('board'), 'is-nudge');
        return;
      }
      var at = s.selected;
      if (wouldBlock(at, ch)) return refuse(at);
      if (s.tiles[at] === ch) {
        setFeedback('That letter is already there. Listen again. Which sound is new?', 'info');
        Sound.word(target());
        return;
      }
      s.tiles[at] = ch;
      s.selected = -1;
      renderBoard();
      renderBank();
      renderTools();
      popSlot(at);
      check(at);
    }

    function popSlot(i) {
      var el = document.querySelector('#board .slot[data-i="' + i + '"]');
      if (el) restartAnim(el, 'is-pop');
    }

    function check(changedAt) {
      var word = s.tiles.join('');
      var t = target();
      if (word === t) return success();

      s.tries++;
      Sound.chime('oops');
      var wrong = [];
      for (var i = 0; i < t.length; i++) if (s.tiles[i] !== t[i]) wrong.push(i);

      if (mode() === 'build') {
        setFeedback('Almost! Listen again and check each sound.', 'oops');
        wrong.forEach(function (i) {
          var el = document.querySelector('#board .slot[data-i="' + i + '"]');
          if (el) restartAnim(el, 'is-shake');
        });
        s.busy = true;
        revertTimer = setTimeout(function () {
          wrong.forEach(function (i) { s.tiles[i] = ''; });
          s.selected = wrong[0];
          s.busy = false;
          renderBoard(); renderBank(); renderTools();
          if (s.tries >= 2) showHint();
          Sound.word(t);
        }, 1300);
        return;
      }

      var targetAt = PL.changedIndex(prev(), t);
      var msg;
      if (changedAt !== targetAt) {
        msg = 'That makes "' + word + '". You changed the ' + positionName(changedAt, t.length) +
          ' sound. Listen again. Which sound is different?';
      } else {
        msg = 'Yes, the ' + positionName(changedAt, t.length) + ' sound changes! Listen again for the new sound.';
      }
      setFeedback(msg, 'oops');
      var el = document.querySelector('#board .slot[data-i="' + changedAt + '"]');
      if (el) restartAnim(el, 'is-shake');
      s.busy = true;
      revertTimer = setTimeout(function () {
        s.tiles = prev().split('');
        s.selected = changedAt === targetAt ? targetAt : -1;
        s.busy = false;
        renderBoard(); renderBank(); renderTools();
        if (s.tries >= 2) showHint();
        Sound.word(t);
      }, 1500);
    }

    function success() {
      s.solved = true;
      s.selected = -1;
      s.done.push(target());
      Sound.chime('yay');
      setFeedback('');
      render();
      var board = $('board');
      restartAnim(board, 'is-win');
      var last = s.step === s.chain.words.length - 1;
      var chainAt = s.chain, stepAt = s.step;
      function stillHere() { return s.chain === chainAt && s.step === stepAt && s.solved; }
      setTimeout(function () {
        if (!stillHere()) return;
        blend(target(), true).then(function () {
          if (!stillHere()) return;
          if (last) celebrate();
          else $('nextBtn').focus({ preventScroll: true });
        });
      }, 450);
    }

    function celebrate() {
      Sound.chime('done');
      $('celebrateTitle').textContent = 'You made a chain of ' + s.chain.words.length + ' words!';
      $('celebrate').hidden = false;
      confetti($('confetti'));
      var list = allChains();
      var idx = list.indexOf(list.filter(function (c) { return c.id === s.chain.id; })[0]);
      $('nextChainBtn').hidden = idx === -1 || idx >= list.length - 1;
      $('readChainBtn').focus({ preventScroll: true });
    }

    /* Light each sound in order (kids say it), then sweep while kids say the word fast. */
    function blend(word, knownWord) {
      var my = Sound.begin();
      var slots = Array.prototype.slice.call(document.querySelectorAll('#board .slot'));
      var board = $('board');
      var real = knownWord || !!PL.WORDS[word] || allWords().indexOf(word) !== -1;
      s.blendId = my;
      s.busy = true;
      $('blendBtn').disabled = true;
      board.classList.add('is-blending');
      setFeedback('Say each sound as it lights up…', 'info');
      var i = 0;
      function nextSound() {
        if (!Sound.alive(my)) return Promise.resolve(false);
        if (i >= slots.length) return Promise.resolve(true);
        var el = slots[i];
        var ch = word[i];
        slots.forEach(function (x) { x.classList.remove('is-lit'); });
        el.classList.add('is-lit');
        i++;
        return Sound.clip('sound:' + ch, my).then(function (played) {
          return Sound.wait(played ? 220 : 650, my);
        }).then(nextSound);
      }
      return nextSound().then(function (ok) {
        slots.forEach(function (x) { x.classList.remove('is-lit'); });
        if (!ok) return finish();
        setFeedback(real ? 'Now say it fast!' : 'Now say it fast! (Is it a real word?)', 'info');
        restartAnim(board, 'is-sweep');
        slots.forEach(function (x) { x.classList.add('is-lit'); });
        // Kids say the word themselves, so the page stays quiet and gives them a moment.
        return Sound.wait((reduceMotion() ? 200 : 700) + 1500, my).then(finish);
      });

      function finish() {
        slots.forEach(function (x) { x.classList.remove('is-lit'); });
        if (s.blendId !== my) return; // the lesson already moved on
        s.blendId = 0;
        s.busy = false;
        board.classList.remove('is-blending');
        if (s.solved) setFeedback('');
        else if ($('chainFeedback').textContent.indexOf('fast') !== -1 || $('chainFeedback').textContent.indexOf('lights up') !== -1) setFeedback('');
        renderTools();
      }
    }

    function showHint() {
      if (s.solved) return;
      var t = target();
      if (mode() === 'build') {
        var at = s.tiles.findIndex(function (ch, i) { return ch !== t[i]; });
        if (at === -1) return;
        s.selected = at;
        renderBoard(); renderBank();
        glowLetter(t[at]);
        setFeedback('Hint: listen for the ' + positionName(at, t.length) + ' sound. The glowing letter makes it.', 'info');
        Sound.word(t);
        return;
      }
      var pos = PL.changedIndex(prev(), t);
      s.hintLevel++;
      s.selected = pos;
      renderBoard(); renderBank();
      var slot = document.querySelector('#board .slot[data-i="' + pos + '"]');
      if (slot) restartAnim(slot, 'is-hint');
      if (s.hintLevel >= 2) {
        glowLetter(t[pos]);
        setFeedback('Hint: the ' + positionName(pos, t.length) + ' sound changes. Try the glowing letter.', 'info');
      } else {
        setFeedback('Hint: listen to the ' + positionName(pos, t.length) + ' sound. That is the one that changes.', 'info');
      }
      Sound.word(t);
    }

    function glowLetter(ch) {
      var b = document.querySelector('#bank .bank-tile[data-letter="' + ch + '"]');
      if (b) b.classList.add('is-glow');
    }

    function readWholeChain() {
      var my = Sound.begin();
      var cards = document.querySelectorAll('#strip .strip-card');
      var i = 0;
      function step() {
        cards.forEach(function (c) { c.classList.remove('is-reading'); });
        if (!Sound.alive(my) || i >= s.chain.words.length) return;
        var card = document.querySelector('#strip .strip-card[data-i="' + i + '"]');
        if (card) {
          card.classList.add('is-reading');
          if (card.scrollIntoView && !reduceMotion()) card.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        }
        var w = s.chain.words[i++];
        Sound.word(w, my).then(function () { return Sound.wait(350, my); }).then(function (alive) { if (alive) step(); else cards.forEach(function (c) { c.classList.remove('is-reading'); }); });
      }
      step();
    }

    function onKey(e) {
      if (currentView !== 'chains' || !s.chain) return;
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key.toLowerCase();
      if (k.length === 1 && bankLetters().indexOf(k) !== -1) {
        e.preventDefault();
        onLetter(k);
      } else if ((k === 'arrowleft' || k === 'arrowright') && !s.solved && document.activeElement && document.activeElement.classList.contains('slot')) {
        e.preventDefault();
        var cur = Number(document.activeElement.getAttribute('data-i'));
        var to = Math.max(0, Math.min(s.tiles.length - 1, cur + (k === 'arrowleft' ? -1 : 1)));
        focusSlot(to);
      }
    }

    function wire() {
      $('listenBtn').addEventListener('click', function () { Sound.word(target()); });
      $('blendBtn').addEventListener('click', function () {
        if (s.tiles.every(Boolean)) blend(s.tiles.join(''), false);
      });
      $('hintBtn').addEventListener('click', showHint);
      $('nextBtn').addEventListener('click', nextStep);
      $('sentenceBtn').addEventListener('click', function () {
        Sound.sentence(target());
      });
      $('readChainBtn').addEventListener('click', readWholeChain);
      $('againBtn').addEventListener('click', function () { start(s.chain, true); });
      $('nextChainBtn').addEventListener('click', function () {
        var list = allChains();
        var idx = list.map(function (c) { return c.id; }).indexOf(s.chain.id);
        start(list[Math.min(list.length - 1, idx + 1)], true);
      });
      document.addEventListener('keydown', onKey);
    }

    return {
      wire: wire,
      start: start,
      onShow: function () {
        if (!s.chain || !findChain(s.chain.id)) {
          var last = findChain(storeGet(LAST_CHAIN_KEY, ''));
          start(last || PL.CHAINS[0], false);
        } else {
          render();
        }
      },
      refresh: function () { if (s.chain) renderPicker(); }
    };
  })();

  /* ------------------------------------------------------------------ sound spy */

  var Spy = (function () {
    var ROUNDS = 9;
    var s = { questions: [], round: 0, score: 0, tries: 0, answered: false };

    function makeQuestions() {
      var byPos = [[], [], []];
      Object.keys(PL.WORDS).forEach(function (w) {
        if (!PL.WORDS[w].art) return;
        for (var i = 0; i < 3; i++) {
          var ch = w[i];
          if (w.split(ch).length - 1 === 1) byPos[i].push({ word: w, at: i, letter: ch });
        }
      });
      var picks = [];
      byPos.forEach(function (list) { picks = picks.concat(shuffle(list).slice(0, ROUNDS / 3)); });
      // Avoid the same word twice in a row
      var q = shuffle(picks);
      for (var k = 1; k < q.length; k++) {
        if (q[k].word === q[k - 1].word) {
          var swap = (k + 1) % q.length;
          var tmp = q[k]; q[k] = q[swap]; q[swap] = tmp;
        }
      }
      return q;
    }

    function q() { return s.questions[s.round]; }

    function renderStars() {
      var el = $('spyStars');
      el.innerHTML = '';
      el.setAttribute('aria-label', 'Score: ' + s.score + ' of ' + ROUNDS);
      for (var i = 0; i < ROUNDS; i++) {
        el.appendChild(h('span', { class: 'star' + (i < s.score ? ' is-on' : ''), html: ICONS.star, 'aria-hidden': 'true' }));
      }
    }

    function renderQuestion() {
      var cur = q();
      var info = PL.WORDS[cur.word];
      $('spyPicture').innerHTML = PL.art(info.art);
      $('spyPicture').setAttribute('aria-label', 'Picture. Hear the word.');
      var p = $('spyPrompt');
      p.innerHTML = '';
      p.appendChild(document.createTextNode('Where do you hear '));
      p.appendChild(tileEl(cur.letter, 'tile--md tile--inline'));
      p.appendChild(document.createTextNode('?'));
      p.appendChild(h('span', { class: 'sr-only' }, ' The letter ' + cur.letter + '.'));
      $('spySound').hidden = !Voice.has('sound:' + cur.letter);

      var boxes = $('spyBoxes');
      boxes.innerHTML = '';
      PL.POSITIONS.forEach(function (pos, i) {
        var b = h('button', { type: 'button', class: 'box', 'data-i': i, 'aria-label': pos.key },
          h('span', { class: 'box-face' }, s.answered ? tileEl(cur.word[i], i === cur.at ? 'is-target' : 'is-dim') : null),
          h('span', { class: 'slot-label' }, lightEl(i), pos.key));
        b.disabled = s.answered;
        b.addEventListener('click', function () { answer(i, b); });
        boxes.appendChild(b);
      });
      $('spyNext').hidden = !s.answered;
      $('spyFeedback').textContent = '';
      $('spyFeedback').className = 'feedback';
    }

    function answer(i, btn) {
      if (s.answered) return;
      var cur = q();
      if (i === cur.at) {
        s.answered = true;
        s.score++;
        Sound.chime('yay');
        renderStars();
        renderQuestion();
        var box = document.querySelector('#spyBoxes .box[data-i="' + i + '"]');
        if (box) { box.classList.add('is-right'); restartAnim(box, 'is-pop'); }
        $('spyFeedback').textContent = 'Yes! ' + cur.letter + ' is at the ' + PL.POSITIONS[i].key + ' of ' + cur.word + '.';
        $('spyFeedback').className = 'feedback feedback--yay';
        setTimeout(function () { Sound.word(cur.word); }, 400);
        $('spyNext').hidden = false;
        $('spyNext').textContent = '';
        $('spyNext').appendChild(document.createTextNode(s.round === ROUNDS - 1 ? 'Finish ' : 'Next '));
        $('spyNext').appendChild(icon('next'));
        $('spyNext').focus({ preventScroll: true });
      } else {
        s.tries++;
        Sound.chime('oops');
        restartAnim(btn, 'is-shake');
        $('spyFeedback').textContent = 'Not at the ' + PL.POSITIONS[i].key + '. Listen again!';
        $('spyFeedback').className = 'feedback feedback--oops';
        Sound.word(cur.word);
        if (s.tries >= 2) {
          var right = document.querySelector('#spyBoxes .box[data-i="' + cur.at + '"]');
          if (right) restartAnim(right, 'is-hint');
        }
      }
    }

    function next() {
      if (s.round >= ROUNDS - 1) return finish();
      s.round++;
      s.tries = 0;
      s.answered = false;
      renderQuestion();
      Sound.word(q().word);
    }

    function finish() {
      $('spyDoneTitle').textContent = 'You spied ' + ROUNDS + ' sounds!';
      $('spyDone').hidden = false;
      Sound.chime('done');
      confetti($('spyConfetti'));
      $('spyAgain').focus({ preventScroll: true });
    }

    function reset(userAction) {
      s.questions = makeQuestions();
      Sound.preloadWords(s.questions.map(function (x) { return x.word; }));
      s.round = 0; s.score = 0; s.tries = 0; s.answered = false;
      $('spyDone').hidden = true;
      renderStars();
      renderQuestion();
      if (userAction) Sound.word(q().word);
    }

    function wire() {
      $('spyListen').addEventListener('click', function () { Sound.word(q().word); });
      $('spyPicture').addEventListener('click', function () { Sound.word(q().word); });
      $('spySound').addEventListener('click', function () { Sound.clip('sound:' + q().letter); });
      $('spyNext').addEventListener('click', next);
      $('spyAgain').addEventListener('click', function () { reset(true); });
    }

    return {
      wire: wire,
      onShow: function () { if (!s.questions.length) reset(false); else renderQuestion(); }
    };
  })();

  /* ------------------------------------------------------------------ teacher corner */

  var UNLOCK_KEY = 'pl-teacher-open';

  var Teacher = (function () {
    var active = null; // { id, session } while recording
    var rows = {};      // id -> row api

    function isUnlocked() {
      try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
    }
    function setUnlocked(v) {
      try { if (v) sessionStorage.setItem(UNLOCK_KEY, '1'); else sessionStorage.removeItem(UNLOCK_KEY); } catch (e) { /* ignore */ }
      $('gate').hidden = v;
      $('teacherPanel').hidden = !v;
      if (v) renderPanel();
    }

    /* Press-and-hold gate: keeps little fingers out, not a password. */
    function wireGate() {
      var btn = $('gateBtn');
      var fill = $('gateFill');
      var timer = 0;
      var HOLD = 1200;
      function begin(e) {
        if (e && e.type === 'keydown') {
          if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault();
        }
        cancel();
        btn.classList.add('is-holding');
        fill.style.setProperty('--hold', HOLD + 'ms');
        timer = setTimeout(function () {
          btn.classList.remove('is-holding');
          setUnlocked(true);
          var first = document.querySelector('#teacherPanel h2');
          if (first) { first.setAttribute('tabindex', '-1'); first.focus(); }
        }, HOLD);
      }
      function cancel() {
        clearTimeout(timer);
        btn.classList.remove('is-holding');
      }
      btn.addEventListener('pointerdown', function (e) { e.preventDefault(); begin(); });
      btn.addEventListener('pointerup', cancel);
      btn.addEventListener('pointerleave', cancel);
      btn.addEventListener('pointercancel', cancel);
      btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      btn.addEventListener('keydown', begin);
      btn.addEventListener('keyup', cancel);
      btn.addEventListener('blur', cancel);
      $('lockBtn').addEventListener('click', function () {
        stopActive(true);
        setUnlocked(false);
        $('gateBtn').focus();
      });
    }

    function renderRetention() {
      var wrap = $('retention');
      wrap.innerHTML = '';
      var cur = Voice.getRetention();
      Object.keys(Voice.RETENTION).forEach(function (key) {
        var id = 'ret-' + key;
        var input = h('input', { type: 'radio', name: 'retention', id: id, value: key });
        input.checked = key === cur;
        input.addEventListener('change', function () {
          var n = Voice.countWouldExpire(key);
          if (n > 0 && !window.confirm('This will delete ' + n + (n === 1 ? ' recording' : ' recordings') + ' now. Continue?')) {
            renderRetention();
            return;
          }
          Voice.setRetention(key).then(function () {
            renderStorage();
            refreshRows();
            toast('Recordings will be kept: ' + Voice.RETENTION[key].label.toLowerCase() + '.');
          });
        });
        wrap.appendChild(h('label', { class: 'seg', for: id }, input, h('span', null, Voice.RETENTION[key].label)));
      });
    }

    function renderStorage() {
      var n = Voice.count();
      var line = n === 0
        ? 'No recordings saved yet.'
        : n + (n === 1 ? ' recording' : ' recordings') + ' saved on this computer.';
      if (!Voice.persistent) line += ' This web browser won’t keep them, so they will disappear when you close the page.';
      $('storageLine').textContent = line;
      $('deleteAllBtn').disabled = n === 0;
      var reason = PL.Recorder.unsupportedReason();
      $('recUnsupported').hidden = !reason;
      $('recUnsupported').textContent = reason || '';
    }

    function statusText(id, fallback) {
      if (active && active.id === id) return 'Recording… speak now.';
      var info = Voice.info(id);
      if (!info) return fallback;
      var exp = Voice.expiresAt(id);
      var len = info.duration ? ' (' + info.duration.toFixed(1) + ' seconds)' : '';
      if (exp === null) return 'Saved' + len + '. Deletes when this tab closes.';
      return 'Saved' + len + '. Deletes in ' + timeLeft(exp - Date.now()) + '.';
    }

    function recRow(id, opts) {
      var status = h('span', { class: 'rec-status' });
      var meter = h('span', { class: 'meter', 'aria-hidden': 'true' }, h('span', { class: 'meter-fill' }));
      var recBtn = h('button', { type: 'button', class: 'btn btn--rec' });
      var playBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Play recording of ' + opts.spoken, html: ICONS.play });
      var delBtn = h('button', { type: 'button', class: 'icon-btn icon-btn--danger', 'aria-label': 'Delete recording of ' + opts.spoken, html: ICONS.trash });
      var row = h('div', { class: 'rec-row' + (opts.compact ? ' rec-row--compact' : '') },
        h('div', { class: 'rec-what' }, opts.visual,
          h('div', { class: 'rec-text' },
            h('span', { class: 'rec-title' }, opts.title),
            opts.tip ? h('span', { class: 'rec-tip' }, opts.tip) : null,
            status)),
        h('div', { class: 'rec-controls' }, meter, recBtn, playBtn, delBtn));

      recBtn.addEventListener('click', function () {
        if (active && active.id === id) stopActive(false);
        else startRecording(id, opts.maxMs, api);
      });
      playBtn.addEventListener('click', function () {
        Sound.clip(id).then(function (ok) { if (!ok && Sound.isMuted()) toast('Sound is off. Turn it on with the speaker button at the top.'); });
      });
      delBtn.addEventListener('click', function () {
        Voice.remove(id).then(function () { toast('Recording deleted.'); });
      });

      var api = {
        el: row,
        meter: meter.firstChild,
        refresh: function () {
          var has = Voice.has(id);
          var recording = active && active.id === id;
          row.classList.toggle('is-recording', !!recording);
          row.classList.toggle('has-rec', has);
          status.textContent = recording ? (api.left != null ? 'Recording… ' + Math.ceil(api.left / 1000) + 's left' : 'Recording…') : statusText(id, opts.fallback);
          recBtn.innerHTML = '';
          recBtn.appendChild(icon(recording ? 'stop' : 'record'));
          recBtn.appendChild(document.createTextNode(recording ? 'Stop' : has ? 'Redo' : 'Record'));
          recBtn.setAttribute('aria-label', (recording ? 'Stop recording ' : has ? 'Record again: ' : 'Record ') + opts.spoken);
          recBtn.disabled = !!(active && !recording) || !!PL.Recorder.unsupportedReason();
          playBtn.disabled = !has || !!recording;
          delBtn.disabled = !has || !!recording;
          if (!recording) api.meter.style.setProperty('--level', '0');
        }
      };
      rows[id] = api;
      api.refresh();
      return row;
    }

    function refreshRows() { Object.keys(rows).forEach(function (k) { rows[k].refresh(); }); }

    function startRecording(id, maxMs, row) {
      if (active) return;
      Sound.stop();
      active = { id: id, session: null, starting: true };
      row.left = maxMs;
      refreshRows();
      PL.Recorder.start({
        maxMs: maxMs,
        onLevel: function (lv) { row.meter.style.setProperty('--level', lv.toFixed(2)); },
        onTick: function (left) { row.left = left; if (active && active.id === id) row.refresh(); }
      }).then(function (session) {
        if (!active || active.id !== id) { session.cancel(); return; }
        active.session = session;
        active.starting = false;
        if (active.stopRequested) session.stop();
        return session.finished.then(function (result) {
          active = null;
          if (!result) { refreshRows(); return; }
          return Voice.save(id, result.blob, result.duration).then(function () {
            toast('Saved on this computer only.');
            refreshRows();
          });
        });
      }).catch(function (err) {
        active = null;
        refreshRows();
        toast((err && err.message) || 'Recording didn’t work. Please try again.');
      });
    }

    function stopActive(discard) {
      if (!active) return;
      if (!active.session) { active.stopRequested = true; if (discard) active = null; refreshRows(); return; }
      if (discard) { active.session.cancel(); active = null; refreshRows(); }
      else active.session.stop();
    }

    function renderSoundRows() {
      var list = $('soundRecList');
      list.innerHTML = '';
      PL.LETTERS.forEach(function (l) {
        list.appendChild(recRow('sound:' + l.id, {
          visual: h('span', { class: 'rec-visual' }, tileEl(l.id), h('span', { class: 'rec-art', html: PL.art(l.art) })),
          title: (l.kind === 'vowel' ? l.label : '/' + (l.id === 'c' ? 'k' : l.id) + '/') + ' as in ' + l.keyword,
          spoken: l.label + ' sound',
          tip: l.tip,
          fallback: 'Not recorded yet. Kids hear "' + l.keyword + '".',
          maxMs: 4000
        }));
      });
      // Other letters from teacher-made chains
      var extra = [];
      customChains().forEach(function (c) {
        c.words.join('').split('').forEach(function (ch) {
          if (PL.LETTER_IDS.indexOf(ch) === -1 && extra.indexOf(ch) === -1) extra.push(ch);
        });
      });
      extra.sort().forEach(function (ch) {
        list.appendChild(recRow('sound:' + ch, {
          visual: h('span', { class: 'rec-visual' }, tileEl(ch)),
          title: PL.isVowel(ch) ? 'short ' + ch : '/' + ch + '/',
          spoken: ch + ' sound',
          tip: 'From your chains.',
          fallback: 'Not recorded yet. Kids hear a short pause for this sound.',
          maxMs: 4000
        }));
      });
    }

    function renderWordRows() {
      var list = $('wordRecList');
      list.innerHTML = '';
      allWords().forEach(function (w) {
        var visual = h('span', { class: 'rec-visual rec-visual--word' }, pictureEl(w, 'rec-art'));
        list.appendChild(recRow('word:' + w, {
          visual: visual,
          title: w,
          spoken: 'the word ' + w,
          fallback: PL.isWord(w) ? 'Uses the page’s voice' : 'Uses the computer’s voice',
          maxMs: 4000,
          compact: true
        }));
      });
    }

    function renderCustom() {
      var ul = $('customList');
      ul.innerHTML = '';
      customChains().forEach(function (c) {
        var words = h('span', { class: 'custom-words' });
        c.words.forEach(function (w, i) {
          if (i > 0) words.appendChild(h('span', { class: 'custom-arrow', 'aria-hidden': 'true' }, '→'));
          words.appendChild(h('span', { class: 'custom-word' }, w));
        });
        var play = h('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, icon('play'), 'Use');
        play.addEventListener('click', function () {
          location.hash = '#chains';
          setTimeout(function () { Chains.start(findChain(c.id), true); }, 0);
        });
        var del = h('button', { type: 'button', class: 'icon-btn icon-btn--danger', 'aria-label': 'Delete chain ' + c.name, html: ICONS.trash });
        del.addEventListener('click', function () {
          var list = storeGet(CUSTOM_KEY, []).filter(function (x) { return x && x.id !== c.id; });
          storeSet(CUSTOM_KEY, list);
          renderCustom();
          renderSoundRows();
          renderWordRows();
          Chains.refresh();
        });
        ul.appendChild(h('li', { class: 'custom-item' },
          h('span', { class: 'custom-name' }, c.name), words, h('span', { class: 'custom-actions' }, play, del)));
      });
    }

    function wireForm() {
      $('chainForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('chainFormMsg');
        var result = PL.validateChain($('chainWords').value);
        if (!result.ok) {
          msg.textContent = result.error;
          msg.className = 'form-msg form-msg--error';
          return;
        }
        var list = storeGet(CUSTOM_KEY, []);
        if (!Array.isArray(list)) list = [];
        if (list.length >= 20) {
          msg.textContent = 'You can save up to 20 chains. Delete one first.';
          msg.className = 'form-msg form-msg--error';
          return;
        }
        var name = $('chainName').value.trim().replace(/\s+/g, ' ').slice(0, 30) || 'My chain ' + (list.length + 1);
        list.push({ id: 'u' + Date.now().toString(36), name: name, words: result.words });
        if (!storeSet(CUSTOM_KEY, list)) {
          msg.textContent = 'This chain couldn’t be saved. Try again, or try another web browser.';
          msg.className = 'form-msg form-msg--error';
          return;
        }
        var steps = result.words.slice(1).map(function (w, i) {
          return positionName(PL.changedIndex(result.words[i], w), w.length);
        });
        msg.textContent = 'Saved "' + name + '". Changes: ' + steps.join(', ') + '.';
        msg.className = 'form-msg form-msg--ok';
        $('chainWords').value = '';
        $('chainName').value = '';
        renderCustom();
        renderSoundRows();
        renderWordRows();
        Chains.refresh();
      });
    }

    function renderPanel() {
      rows = {};
      renderRetention();
      renderStorage();
      renderSoundRows();
      renderWordRows();
      renderCustom();
    }

    function wire() {
      wireGate();
      wireForm();
      $('deleteAllBtn').addEventListener('click', function () {
        var n = Voice.count();
        if (!n) return;
        if (!window.confirm('Delete all ' + n + (n === 1 ? ' recording' : ' recordings') + ' from this computer? This can’t be undone.')) return;
        stopActive(true);
        Voice.removeAll().then(function () { toast('All recordings deleted.'); });
      });
      Voice.onChange(function () {
        if (!$('teacherPanel').hidden) { renderStorage(); refreshRows(); }
        if (currentView === 'sounds') Sounds.render();
      });
      // Keep "deletes in…" labels fresh while the panel is open
      setInterval(function () { if (currentView === 'teacher' && !$('teacherPanel').hidden && !active) refreshRows(); }, 60000);
    }

    return {
      wire: wire,
      onShow: function () { setUnlocked(isUnlocked()); },
      onLeave: function () { stopActive(true); }
    };
  })();

  /* ------------------------------------------------------------------ mute */

  function renderMute() {
    var b = $('muteBtn');
    var m = Sound.isMuted();
    b.innerHTML = m ? ICONS.muted : ICONS.speaker;
    b.setAttribute('aria-pressed', m ? 'true' : 'false');
    b.setAttribute('aria-label', m ? 'Sound is off. Turn sound on.' : 'Sound is on. Turn sound off.');
    b.classList.toggle('is-muted', m);
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    fillStaticArt();
    renderHome();
    renderMute();
    $('muteBtn').addEventListener('click', function () { Sound.setMuted(!Sound.isMuted()); renderMute(); });
    Chains.wire();
    Spy.wire();
    Teacher.wire();
    window.addEventListener('hashchange', route);
    route();
    // Show the page right away; voice badges and rows update once storage is ready.
    Voice.init().then(function () {
      if (currentView === 'sounds') Sounds.render();
      if (currentView === 'teacher') Teacher.onShow();
      if (currentView === 'spy') Spy.onShow();
    });
    // Leave nothing playing or recording if the tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { Sound.stop(); Teacher.onLeave(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
