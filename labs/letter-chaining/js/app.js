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

  function kindOf(id) { return PL.isVowel(id) ? 'vowel' : 'consonant'; }

  /* Class for tiles with more than one letter, so they fit: tile--n2, tile--n3. */
  function sizeCls(id) { var n = String(id).replace('_', '').length; return n > 1 ? ' tile--n' + Math.min(n, 3) : ''; }

  function tileEl(id, extra) {
    return h('span', { class: 'tile tile--' + kindOf(id) + sizeCls(id) + (extra ? ' ' + extra : ''), 'aria-hidden': 'true' }, PL.tileText(id));
  }

  /* A word's letters as small tiles. A silent-e tile shows its vowel in place and its e at the end,
     both marked, so kids see "cake" and see that a and e work together. `mark` is a tile index. */
  function miniWord(tiles, mark) {
    var el = h('span', { class: 'mini-word' });
    var tail = null;
    tiles.forEach(function (t, j) {
      var cls = 'mini-letter mini-letter--' + kindOf(t) + (j === mark ? ' is-changed' : '');
      if (/^[aeiou]_e$/.test(t)) {
        el.appendChild(h('span', { class: cls + ' is-split' }, t[0]));
        tail = h('span', { class: cls + ' is-split' }, 'e');
      } else {
        el.appendChild(h('span', { class: cls }, t));
      }
    });
    if (tail) el.appendChild(tail);
    return el;
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
    var out = [];
    list.forEach(function (c) {
      if (!c || typeof c.id !== 'string') return;
      var v = PL.validateChain((c.words || []).join(' '));
      if (v.ok) out.push({ id: c.id, name: String(c.name || 'My chain').slice(0, 30), words: v.words, split: v.split, custom: true });
    });
    return out;
  }
  /* ------------------------------------------------------------------ the class's tiles */

  /* What a teacher picked: { tiles, madeUp, seed }. seed 0 means "never asked for new chains". With the
     start set and seed 0, kids get the built-in chains, the same as before tiles could be picked. */
  var SET_KEY = 'pl-tile-set';
  function tileSet() {
    var v = storeGet(SET_KEY, null) || {};
    var tiles = Array.isArray(v.tiles) ? PL.TILE_IDS.filter(function (id) { return v.tiles.indexOf(id) !== -1; }) : [];
    if (!tiles.length) tiles = PL.START_SET.slice();
    return { tiles: tiles, madeUp: !!v.madeUp, seed: Math.max(0, Math.floor(Number(v.seed) || 0)) };
  }
  function saveTileSet(set) {
    storeSet(SET_KEY, { tiles: set.tiles, madeUp: !!set.madeUp, seed: set.seed || 0 });
    builtCache = null;
  }
  function isStartSet(set) {
    var a = set.tiles.slice().sort().join(' '), b = PL.START_SET.slice().sort().join(' ');
    return a === b && !set.madeUp && !set.seed;
  }

  var builtCache = null;
  function builtChains() {
    var set = tileSet();
    if (isStartSet(set)) return PL.CHAINS;
    var key = set.tiles.join(' ') + '|' + set.madeUp + '|' + set.seed;
    if (!builtCache || builtCache.key !== key) {
      var list = PL.buildChains(set.tiles, { madeUp: set.madeUp, seed: set.seed || 1 });
      // Too few words for a chain: kids keep the built-in chains until the teacher turns on more tiles.
      builtCache = { key: key, list: list.length ? list : PL.CHAINS, empty: !list.length };
    }
    return builtCache.list;
  }
  function builtEmpty() { builtChains(); return !!(builtCache && builtCache.empty); }

  function allChains() { return builtChains().concat(customChains()); }

  /* A word's tiles in the chain it belongs to. Teacher chains saved before tiles could hold more than
     one letter keep reading letter by letter. */
  function tilesOf(w, chain) {
    return chain && chain.split === 'letters' ? PL.splitLetters(w) : PL.split(w);
  }
  function findChain(id) {
    var list = allChains();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* Words to record: the chains' words, and words with a sentence that use only the class's tiles. */
  function allWords() {
    var set = {};
    var tiles = tileSet().tiles;
    Object.keys(PL.WORDS).forEach(function (w) {
      if (PL.split(w).every(function (t) { return tiles.indexOf(t) !== -1; })) set[w] = true;
    });
    allChains().forEach(function (c) { c.words.forEach(function (w) { set[w] = true; }); });
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
      var was = before ? PL.split(before) : [];
      PL.split(w).forEach(function (ch, j) {
        if (j !== changed) { word.appendChild(tileEl(ch, 'hero-tile')); return; }
        var t = h('span', { class: 'tile tile--' + kindOf(ch) + ' hero-tile is-changed', 'aria-hidden': 'true' },
          h('span', { class: 'swap-old' }, was[j]),
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

  /* The name on a tile's card: "short a", "long a", "the b sound", "the sh sound". */
  function tileName(l) {
    return l.kind === 'vowel' ? (l.group === 'short' || l.group === 'team' || l.group === 'silent' ? l.label : 'the ' + l.label + ' sound')
      : 'the ' + l.label + ' sound';
  }

  var Sounds = {
    render: function () {
      var wrap = $('soundGroups');
      wrap.innerHTML = '';
      var ids = tileSet().tiles;
      Sound.preloadKeywords(ids);
      var missing = 0;
      PL.GROUPS.forEach(function (g) {
        var list = PL.TILES.filter(function (l) { return l.group === g.id && ids.indexOf(l.id) !== -1; });
        if (!list.length) return;
        var kind = list[0].kind;
        var grid = h('div', { class: 'sound-grid' });
        wrap.appendChild(h('h2', { class: 'group-title' }, h('span', { class: 'swatch swatch--' + kind }), g.name));
        wrap.appendChild(grid);
        list.forEach(function (l) { grid.appendChild(card(l)); });
      });
      function card(l) {
        var hasVoice = Voice.has('sound:' + l.id);
        if (!hasVoice) missing++;
        var card = h('button', {
          type: 'button',
          class: 'sound-card sound-card--' + l.kind,
          'aria-label': tileName(l) + ', ' + l.id.replace('_', ' ') + ' as in ' + l.keyword + '. Play the sound.'
        },
          h('span', { class: 'sound-card-art', html: PL.keywordPicture(l.keyword) }),
          tileEl(l.id, 'tile--lg'),
          h('span', { class: 'sound-card-label' }, tileName(l)),
          h('span', { class: 'sound-card-key' }, PL.tileText(l.id), h('span', { class: 'key-rest' }, ' as in '), h('strong', null, l.keyword)),
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
        return card;
      }
      var note = $('soundsNote');
      note.hidden = missing === 0;
      note.textContent = missing === ids.length
        ? 'The sounds use the page\'s computer-generated voice. Teachers can record their own in Teacher Corner.'
        : 'Cards without "Teacher voice" use the page\'s computer-generated voice. Teachers can record them in Teacher Corner.';
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
    function tgt() { return tilesOf(target(), s.chain); }
    function was() { return s.step > 0 ? tilesOf(prev(), s.chain) : null; }
    function isSplit(id) { return /^[aeiou]_e$/.test(id || ''); }
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
      // Once solved, keep the tile that changed marked, with the old tile crossed out beside it.
      var old = s.solved && s.step > 0 ? was() : null;
      var changedAt = old ? PL.changedIndex(old, tgt()) : -1;
      var len = s.tiles.length;
      var tail = false;
      s.tiles.forEach(function (ch, i) {
        var pos = PL.POSITIONS[PL.positionAt(i, len)];
        var isChanged = i === changedAt;
        if (isSplit(ch)) tail = true;
        var label = pos.key + ' sound' + (ch ? ', ' + spoken(ch) : ', empty') + (s.selected === i ? ', selected' : '') +
          (isChanged ? ', changed from ' + spoken(old[i]) : '');
        var slot = h('button', {
          type: 'button',
          class: 'slot' + (ch ? ' slot--filled tile--' + kindOf(ch) + sizeCls(isSplit(ch) ? 'a' : ch) : '') + (isSplit(ch) ? ' is-split' : '') +
            (s.selected === i ? ' is-selected' : '') + (isChanged ? ' is-changed' : ''),
          'data-i': i,
          'aria-label': label,
          'aria-pressed': s.selected === i ? 'true' : 'false',
          disabled: s.solved ? true : null
        },
          ch ? h('span', { class: 'slot-letter' }, isSplit(ch) ? ch[0] : ch) : h('span', { class: 'slot-empty', 'aria-hidden': 'true' }, '?'));
        slot.addEventListener('click', function () { onSlot(i); });
        var col = h('div', { class: 'slot-col' },
          slot,
          h('span', { class: 'slot-label' }, lightEl(PL.positionAt(i, len)), pos.key),
          isChanged ? h('span', { class: 'slot-swap', 'aria-hidden': 'true' },
            h('span', { class: 'mini-letter mini-letter--' + kindOf(old[i]) + ' is-was' }, PL.tileText(old[i])),
            h('span', { class: 'slot-swap-arrow', html: ICONS.next }),
            h('span', { class: 'mini-letter mini-letter--' + kindOf(ch) + ' is-changed' }, PL.tileText(ch))) : null);
        b.appendChild(col);
      });
      // A silent-e tile shows its vowel in the middle and its quiet e after the last tile.
      if (tail) {
        b.appendChild(h('div', { class: 'slot-col slot-col--tail', 'aria-hidden': 'true' },
          h('span', { class: 'slot-tail is-split' }, 'e'),
          h('span', { class: 'slot-label slot-label--tail' }, 'quiet e')));
      }
      b.appendChild(h('span', { class: 'sweep', 'aria-hidden': 'true', html: ICONS.next }));
    }

    /* How a tile is read out by a screen reader: "a", "s h", "a, silent e". */
    function spoken(id) {
      if (!id) return '';
      if (isSplit(id)) return id[0] + ', silent e';
      return id.split('').join(' ');
    }

    /* The class's tiles (vowels first), plus any other tiles this chain uses. */
    function bankTiles() {
      var set = tileSet().tiles.slice();
      s.chain.words.forEach(function (w) {
        tilesOf(w, s.chain).forEach(function (t) { if (set.indexOf(t) === -1) set.push(t); });
      });
      // Vowels first. The start set keeps its old order (a i o, t d c g n), so the tiles kids know stay put.
      var order = function (t) {
        var st = PL.START_SET.indexOf(t), i = PL.TILE_IDS.indexOf(t);
        return (PL.isVowel(t) ? 0 : 1000) + (st !== -1 ? st : 100 + (i === -1 ? 999 : i));
      };
      return set.sort(function (a, b) { return order(a) - order(b); });
    }

    function renderBank() {
      var bank = $('bank');
      var letters = bankTiles();
      if (bank.getAttribute('data-letters') !== letters.join(' ')) {
        bank.innerHTML = '';
        bank.setAttribute('data-letters', letters.join(' '));
        bank.classList.toggle('bank--many', letters.length > 16 && letters.length <= 30);
        bank.classList.toggle('bank--lots', letters.length > 30);
        letters.forEach(function (ch) {
          var btn = h('button', {
            type: 'button',
            class: 'tile tile--' + kindOf(ch) + sizeCls(ch) + ' bank-tile',
            'data-letter': ch,
            'aria-label': (ch.length > 1 ? 'Tile ' : 'Letter ') + spoken(ch)
          }, PL.tileText(ch));
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
        var tw = tilesOf(w, s.chain);
        var changed = i > 0 ? PL.changedIndex(tilesOf(s.chain.words[i - 1], s.chain), tw) : -1;
        var letters = miniWord(tw, changed);
        var card = h('li', { class: 'strip-card', 'data-i': i },
          h('button', { type: 'button', class: 'strip-btn', 'aria-label': w + (changed >= 0 ? ', changed the ' + positionName(changed, tw.length) + ' sound' : '') + '. Hear it.' },
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
      s.tiles = tgt().map(function () { return ''; });
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
      s.tiles = was().slice();
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
      if (s.selected === i && s.tiles[i]) Sound.letterSound(s.tiles[i]);
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
      return t.every(Boolean) && PL.isBlocked(t);
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
        // The last tile skips its sound: the chime and the blend that follow would play over it
        if (!s.tiles.every(Boolean)) Sound.letterSound(ch);
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
      var word = PL.spell(s.tiles);
      var t = tgt();
      if (s.tiles.join(' ') === t.join(' ')) return success();
      if (PL.phones(s.tiles).join(' ') === PL.phones(t).join(' ')) return otherSpelling();

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
          Sound.word(target());
        }, 1300);
        return;
      }

      var targetAt = PL.changedIndex(was(), t);
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
        s.tiles = was().slice();
        s.selected = changedAt === targetAt ? targetAt : -1;
        s.busy = false;
        renderBoard(); renderBank(); renderTools();
        if (s.tries >= 2) showHint();
        Sound.word(target());
      }, 1500);
    }

    /* The right sound with another spelling (ee for ea, k for c). The child heard it right, so this
       isn't a wrong try: show which tile this word uses and let them swap it in. */
    function otherSpelling() {
      var t = tgt();
      var at = s.tiles.findIndex(function (x, i) { return x !== t[i]; });
      setFeedback('Right sound! "' + target() + '" spells it ' + PL.tileText(t[at]).replace('_', '…') + '. Tap the glowing tile.', 'info');
      s.busy = true;
      revertTimer = setTimeout(function () {
        s.tiles[at] = mode() === 'build' ? '' : was()[at];
        s.selected = at;
        s.busy = false;
        renderBoard(); renderBank(); renderTools();
        glowLetter(t[at]);
      }, 1200);
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
        blend(tgt(), true).then(function () {
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
    function blend(tiles, knownWord) {
      var my = Sound.begin();
      var slots = Array.prototype.slice.call(document.querySelectorAll('#board .slot'));
      var board = $('board');
      var word = PL.spell(tiles);
      var real = knownWord || PL.isRealWord(word) ||
        customChains().some(function (c) { return c.words.indexOf(word) !== -1; });
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
        var ch = tiles[i];
        slots.forEach(function (x) { x.classList.remove('is-lit'); });
        el.classList.add('is-lit');
        litTail(isSplit(ch));
        i++;
        return Sound.letterSound(ch, my).then(function (played) {
          return Sound.wait(played ? 220 : 650, my);
        }).then(nextSound);
      }
      return nextSound().then(function (ok) {
        slots.forEach(function (x) { x.classList.remove('is-lit'); });
        litTail(false);
        if (!ok) return finish();
        setFeedback(real ? 'Now say it fast!' : 'Now say it fast! (Is it a real word?)', 'info');
        restartAnim(board, 'is-sweep');
        slots.forEach(function (x) { x.classList.add('is-lit'); });
        litTail(tiles.some(isSplit));
        // Kids say the word themselves, so the page stays quiet and gives them a moment.
        return Sound.wait((reduceMotion() ? 200 : 700) + 1500, my).then(finish);
      });

      function finish() {
        slots.forEach(function (x) { x.classList.remove('is-lit'); });
        litTail(false);
        if (s.blendId !== my) return; // the lesson already moved on
        s.blendId = 0;
        s.busy = false;
        board.classList.remove('is-blending');
        if (s.solved) setFeedback('');
        else if ($('chainFeedback').textContent.indexOf('fast') !== -1 || $('chainFeedback').textContent.indexOf('lights up') !== -1) setFeedback('');
        renderTools();
      }
    }

    /* The quiet e lights with its vowel. */
    function litTail(on) {
      var e = document.querySelector('#board .slot-tail');
      if (e) e.classList.toggle('is-lit', !!on);
    }

    function showHint() {
      if (s.solved) return;
      var t = tgt();
      if (mode() === 'build') {
        var at = s.tiles.findIndex(function (ch, i) { return ch !== t[i]; });
        if (at === -1) return;
        s.selected = at;
        renderBoard(); renderBank();
        glowLetter(t[at]);
        setFeedback('Hint: listen for the ' + positionName(at, t.length) + ' sound. The glowing letter makes it.', 'info');
        Sound.word(target());
        return;
      }
      var pos = PL.changedIndex(was(), t);
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
      Sound.word(target());
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
      if (k.length === 1 && bankTiles().indexOf(k) !== -1) {
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
        if (s.tiles.every(Boolean)) blend(s.tiles.slice(), false);
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
          start(last || allChains()[0] || PL.CHAINS[0], false);
        } else {
          render();
        }
      },
      refresh: function () { if (s.chain) renderPicker(); },
      /* The class's tiles changed: the next visit starts fresh. */
      reset: function () { clearTimeout(revertTimer); s.chain = null; }
    };
  })();

  /* ------------------------------------------------------------------ sound spy */

  var Spy = (function () {
    var ROUNDS = 9;
    var s = { questions: [], round: 0, score: 0, tries: 0, answered: false };

    /* Real 3-tile words with a picture, using only the class's tiles. Each round asks about one tile
       whose sound is in the word only once. Tiles past the basics come first, and each position gets
       a third of the rounds when there are enough words. */
    function makeQuestions() {
      var set = tileSet().tiles;
      var focus = set.filter(function (t) { var x = PL.tile(t); return x.group !== 'short' && x.group !== 'consonant'; });
      var byPos = [[], [], []];
      PL.wordsFor(set, false).real.forEach(function (w) {
        var tiles = PL.split(w);
        if (tiles.length !== 3) return;
        var kind = PL.pictureInfo(w).kind;
        if (kind !== 'art' && kind !== 'emoji') return;
        tiles.forEach(function (t, i) {
          if (PL.soundOnce(tiles, i)) byPos[i].push({ word: w, tiles: tiles, at: i, letter: t, focus: focus.indexOf(t) !== -1 });
        });
      });
      var picks = [], left = [], used = {};
      byPos.forEach(function (list) {
        var f = shuffle(list.filter(function (x) { return x.focus; }));
        var rest = shuffle(list.filter(function (x) { return !x.focus; }));
        // Each word once when there are enough words
        var mine = f.concat(rest).filter(function (x) { return !used[x.word]; }).slice(0, ROUNDS / 3);
        mine.forEach(function (x) { used[x.word] = true; });
        picks = picks.concat(mine);
        left = left.concat(f.concat(rest).filter(function (x) { return mine.indexOf(x) === -1; }));
      });
      // Too few for a third at each position: use more of the class's words, then ask some again.
      picks = picks.concat(shuffle(left).slice(0, ROUNDS - picks.length));
      // No pictured words with these tiles at all: use the built-in words.
      if (!picks.length) {
        Object.keys(PL.WORDS).forEach(function (w) {
          var tiles = PL.split(w);
          if (!PL.WORDS[w].art || tiles.length !== 3) return;
          var i = Math.floor(Math.random() * 3);
          if (PL.soundOnce(tiles, i)) picks.push({ word: w, tiles: tiles, at: i, letter: tiles[i] });
        });
        picks = shuffle(picks).slice(0, ROUNDS);
      }
      var some = picks.slice();
      while (some.length && picks.length < ROUNDS) picks.push(some[picks.length % some.length]);
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
      $('spyPicture').innerHTML = PL.picture(cur.word);
      $('spyPicture').setAttribute('aria-label', 'Picture. Hear the word.');
      var p = $('spyPrompt');
      p.innerHTML = '';
      p.appendChild(document.createTextNode('Where do you hear '));
      p.appendChild(tileEl(cur.letter, 'tile--md tile--inline'));
      p.appendChild(document.createTextNode('?'));
      p.appendChild(h('span', { class: 'sr-only' }, (cur.letter.length > 1 ? ' The tile ' : ' The letter ') + cur.letter.replace('_', ' ') + '.'));
      $('spySound').hidden = !Sound.hasLetterSound(cur.letter);

      var boxes = $('spyBoxes');
      boxes.innerHTML = '';
      PL.POSITIONS.forEach(function (pos, i) {
        var b = h('button', { type: 'button', class: 'box', 'data-i': i, 'aria-label': pos.key },
          h('span', { class: 'box-face' }, s.answered ? tileEl(cur.tiles[i], i === cur.at ? 'is-target' : 'is-dim') : null),
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
        $('spyFeedback').textContent = 'Yes! ' + PL.tileText(cur.letter) + ' is at the ' + PL.POSITIONS[i].key + ' of ' + cur.word + '.';
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
      $('spySound').addEventListener('click', function () { Sound.letterSound(q().letter); });
      $('spyNext').addEventListener('click', next);
      $('spyAgain').addEventListener('click', function () { reset(true); });
    }

    return {
      wire: wire,
      onShow: function () { if (!s.questions.length) reset(false); else renderQuestion(); },
      reset: function () { s.questions = []; }
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

    /* "/k/ as in cup", "long a (ai) as in rain", "/sh/ as in ship" */
    var SLASH = { c: 'k', k: 'k', ck: 'k', x: 'ks', qu: 'kw', wh: 'w', y: 'y', j: 'j' };
    function recTitle(l) {
      if (l.group === 'short') return l.label + ' as in ' + l.keyword;
      if (l.kind === 'vowel') return (l.label === l.id ? '/' + l.id + '/' : l.label + ' (' + PL.tileText(l.id) + ')') + ' as in ' + l.keyword;
      return '/' + (SLASH[l.id] || l.id) + '/ as in ' + l.keyword;
    }

    function renderSoundRows() {
      var list = $('soundRecList');
      list.innerHTML = '';
      var ids = tileSet().tiles.slice();
      // Other tiles from teacher-made chains
      var extra = [];
      customChains().forEach(function (c) {
        c.words.forEach(function (w) {
          tilesOf(w, c).forEach(function (t) { if (ids.indexOf(t) === -1 && extra.indexOf(t) === -1) extra.push(t); });
        });
      });
      ids.concat(extra.filter(function (t) { return PL.tile(t); })).forEach(function (id) {
        var l = PL.tile(id);
        list.appendChild(recRow('sound:' + l.id, {
          visual: h('span', { class: 'rec-visual' }, tileEl(l.id), h('span', { class: 'rec-art', html: PL.keywordPicture(l.keyword) })),
          title: recTitle(l),
          spoken: (l.kind === 'vowel' ? l.label : l.id.replace('_', ' ')) + ' sound',
          tip: extra.indexOf(id) !== -1 ? 'From your chains. ' + l.tip : l.tip,
          fallback: 'Not recorded yet. Kids hear the page\'s voice.',
          maxMs: 4000
        }));
      });
      extra.filter(function (t) { return !PL.tile(t); }).sort().forEach(function (ch) {
        list.appendChild(recRow('sound:' + ch, {
          visual: h('span', { class: 'rec-visual' }, tileEl(ch)),
          title: '/' + ch + '/',
          spoken: ch + ' sound',
          tip: 'From your chains.',
          fallback: 'Not recorded yet. Kids hear a short pause for this sound.',
          maxMs: 4000
        }));
      });
    }

    /* ---------- letters for this class ---------- */

    function renderTiles() {
      var set = tileSet();
      var wrap = $('tilePicker');
      wrap.innerHTML = '';
      PL.GROUPS.forEach(function (g) {
        var list = PL.TILES.filter(function (t) { return t.group === g.id; });
        var on = list.filter(function (t) { return set.tiles.indexOf(t.id) !== -1; }).length;
        var all = h('button', { type: 'button', class: 'btn btn--ghost btn--sm pick-all' }, on === list.length ? 'Turn all off' : 'Turn all on');
        all.addEventListener('click', function () {
          var cur = tileSet();
          var ids = list.map(function (t) { return t.id; });
          cur.tiles = on === list.length ? cur.tiles.filter(function (id) { return ids.indexOf(id) === -1; }) : cur.tiles.concat(ids);
          changeTiles(cur, g.id);
        });
        var row = h('div', { class: 'pick-row', role: 'group', 'aria-label': g.name });
        list.forEach(function (t) {
          var pressed = set.tiles.indexOf(t.id) !== -1;
          var b = h('button', {
            type: 'button',
            class: 'pick-tile tile tile--' + t.kind + sizeCls(t.id) + (pressed ? ' is-on' : ''),
            'aria-pressed': pressed ? 'true' : 'false',
            'aria-label': PL.tileText(t.id).replace('_', ' ') + ', ' + recTitle(t) + (t.where ? ', ' + t.where + ' of words only' : ''),
            title: recTitle(t) + (t.where ? ' (' + (t.where === 'end' ? 'end' : 'beginning') + ' of words only)' : ''),
            'data-tile': t.id
          }, PL.tileText(t.id));
          b.addEventListener('click', function () {
            var cur = tileSet();
            var i = cur.tiles.indexOf(t.id);
            if (i === -1) cur.tiles.push(t.id); else cur.tiles.splice(i, 1);
            changeTiles(cur, null, t.id);
          });
          row.appendChild(b);
        });
        wrap.appendChild(h('section', { class: 'pick-group', 'data-group': g.id },
          h('div', { class: 'pick-head' }, h('h3', null, g.name), all), row));
      });
      $('madeUpToggle').checked = set.madeUp;
      renderTileSummary();
    }

    function renderTileSummary() {
      var set = tileSet();
      var words = PL.wordsFor(set.tiles, set.madeUp);
      var chains = builtEmpty() ? [] : builtChains();
      var start = isStartSet(set);
      var vowels = set.tiles.filter(PL.isVowel).length;
      var parts = [set.tiles.length + (set.tiles.length === 1 ? ' tile' : ' tiles') + ' on',
        words.real.length + ' real words'];
      if (set.madeUp) parts.push(words.madeUp.length + ' made-up words');
      parts.push(chains.length + (chains.length === 1 ? ' chain' : ' chains') + (start ? ' (the built-in chains)' : ''));
      var msg = parts.join(' · ');
      var warn = '';
      if (!vowels) warn = 'Turn on at least one vowel.';
      else if (vowels === set.tiles.length) warn = 'Turn on some consonants too.';
      else if (!start && !chains.length) warn = 'There aren\'t enough words for a chain yet. Turn on more tiles. Until then, kids get the built-in chains.';
      $('tileSummary').textContent = msg;
      $('tileWarn').textContent = warn;
      $('tileWarn').hidden = !warn;
    }

    /* Saves the tiles and refreshes everything that uses them. Keeps focus on the button pressed. */
    function changeTiles(set, groupId, tileId) {
      if (!set.tiles.length) { toast('Keep at least one tile on.'); return; }
      saveTileSet(set);
      Chains.reset();
      Spy.reset();
      renderTiles();
      renderSoundRows();
      renderWordRows();
      var focus = tileId ? document.querySelector('#tilePicker [data-tile="' + tileId + '"]')
        : groupId ? document.querySelector('#tilePicker [data-group="' + groupId + '"] .pick-all') : null;
      if (focus) focus.focus();
    }

    function wireTiles() {
      $('madeUpToggle').addEventListener('change', function () {
        var cur = tileSet();
        cur.madeUp = $('madeUpToggle').checked;
        changeTiles(cur);
      });
      $('newChainsBtn').addEventListener('click', function () {
        var cur = tileSet();
        cur.seed = (cur.seed || 0) + 1;
        changeTiles(cur);
        var n = builtChains().length;
        toast(!builtEmpty() ? 'Made ' + n + (n === 1 ? ' new chain.' : ' new chains.') : 'There aren\'t enough words for a chain yet. Turn on more tiles.');
      });
      $('resetTilesBtn').addEventListener('click', function () {
        try { localStorage.removeItem(SET_KEY); } catch (e) { /* ignore */ }
        builtCache = null;
        changeTiles(tileSet());
        toast('Back to the start set: short a, i, o and t, d, c, g, n.');
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
          fallback: PL.isWord(w) ? 'Uses the page’s voice' : 'Uses the device’s voice',
          tip: PL.isWord(w) && !PL.isRealWord(w) && PL.split(w)[1] === 'o' ? 'Made-up word. Say o like the "ah" in dot.' : '',
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
        var split = result.split === 'letters' ? PL.splitLetters : PL.split;
        var steps = result.words.slice(1).map(function (w, i) {
          var tiles = split(w);
          return positionName(PL.changedIndex(split(result.words[i]), tiles), tiles.length);
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
      renderTiles();
      renderRetention();
      renderStorage();
      renderSoundRows();
      renderWordRows();
      renderCustom();
    }

    function wire() {
      wireGate();
      wireForm();
      wireTiles();
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
