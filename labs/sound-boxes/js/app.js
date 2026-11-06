/* Primary Labs · Sound Boxes: the page.
   Holds the level, the word and the activity (Blend or Segment), and gives both activities the same
   round: the picture card, the hear button, the boxes, the tray and the Next button stay in the same
   places every round. */
(function () {
  'use strict';
  var SB = window.SB;
  var Sound = SB.Sound, Art = SB.Art, ui = SB.ui;
  var $ = function (id) { return document.getElementById(id); };

  /* The Next button and the tray sit close together, so a second tap could land on what just
     appeared. Taps wait a little over a second after a word is done or a new word opens. */
  var SETTLE = 1200;

  var S = {
    level: SB.LEVELS[0],
    n: 0,             // the word's place in the level
    mode: 'blend',
    lockUntil: 0,
    timer: null,      // speech waiting for a sound effect or a pause
    reveal: null      // shows the Next button once taps count again
  };

  function word() { return S.level.words[S.n]; }
  function lock(ms) { S.lockUntil = Date.now() + ms; }
  function locked() { return Date.now() < S.lockUntil; }

  /* Everything both activities share. */
  var round = {
    tray: $('tray'),
    locked: locked,
    /* Stops speech, including speech that was about to start. Every new action begins with this. */
    quiet: function () { clearTimeout(S.timer); Sound.stop(); SB.Boxes.clearLit(); },
    after: function (ms, fn) { clearTimeout(S.timer); S.timer = setTimeout(fn, ms); },
    prompt: function (id) { $('prompt').textContent = SB.Phrases.get(id).say; },
    feedback: function (text, kind) {
      var f = $('feedback');
      f.className = 'feedback' + (kind ? ' feedback--' + kind : '');
      f.textContent = text;
    },
    setHear: function (label) { $('hearLabel').textContent = label; },
    /* The picture card: the word's picture, or an empty outline until Blend is solved. */
    showPicture: function (w) {
      var card = $('card');
      card.classList.toggle('is-empty', !w);
      card.innerHTML = w ? Art.picture(w) : '';
      card.dataset.word = w || '';
    },
    finish: finish
  };

  var modes = { blend: SB.Blend(round), segment: SB.Segment(round) };
  function mode() { return modes[S.mode]; }

  /* The word is done: Next shows once taps count again, and gets the keyboard if the child was
     using keys. */
  function finish(keys) {
    lock(SETTLE);
    clearTimeout(S.reveal);
    S.reveal = setTimeout(function () {
      $('nextRow').classList.remove('is-waiting');
      if (keys) ui.focusOn($('nextBtn'));
    }, SETTLE);
  }

  /* Opens the nth word of the level. speak: a tap opened it, so audio may play. intro: also say
     the directions first (a new level or activity, not the next word). */
  function open(n, speak, intro) {
    round.quiet();
    // Segment's move from counters to letters has its own timers (quiet() clears the rest).
    modes.segment.stop();
    clearTimeout(S.reveal);
    S.n = n;
    if (speak) lock(SETTLE / 2);
    var last = S.n === S.level.words.length - 1;
    $('nextLabel').textContent = last ? 'Start again' : 'Next word';
    $('nextRow').classList.add('is-waiting');
    round.feedback('');
    mode().start(word(), S.n, { speak: speak, intro: intro });
  }

  function setLevel(id, speak) {
    S.level = SB.level(id) || SB.LEVELS[0];
    SB.Levels.setCurrent(S.level.id);
    if (window.history && history.replaceState) history.replaceState(null, '', '#' + S.level.id);
    open(0, speak, true);
  }

  function setMode(m) {
    if (m === S.mode) return;
    S.mode = m;
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mode === m));
    });
    $('game').dataset.mode = m;
    open(S.n, true, true);
  }

  /* ---------- controls ---------- */

  document.querySelectorAll('[data-icon]').forEach(function (e) { e.innerHTML = Art.icons[e.dataset.icon] || ''; });
  $('promptBtn').innerHTML = Art.icons.speaker;

  document.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { Sound.sfx.click(); setMode(b.dataset.mode); });
  });
  $('hearBtn').addEventListener('click', function () { if (!locked()) mode().hear(); });
  $('card').addEventListener('click', function () { if (!locked()) mode().card(); });
  $('promptBtn').addEventListener('click', function () {
    var id = mode().directions();
    round.quiet();
    if (id) Sound.say('phrases/' + id); else Sound.say(SB.wordClip(word()));
  });
  $('nextBtn').addEventListener('click', function () {
    if (locked() || $('nextRow').classList.contains('is-waiting')) return;
    Sound.sfx.click();
    var keys = ui.byKeys($('nextBtn'));
    open((S.n + 1) % S.level.words.length, true, false);
    if (keys) ui.focusOn($('hearBtn'));
  });

  // A held-down Enter or Space would press one button after another, because focus moves on to the
  // next item each time. Only the first press of a key counts.
  document.addEventListener('keydown', function (e) {
    if (e.repeat && (e.key === 'Enter' || e.key === ' ')) e.preventDefault();
  }, true);

  // Sound effects toggle: a solid bell when on, an outline bell with a slash when off. Speech stays on.
  function showSfx(on) {
    var b = $('sfx');
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-muted', !on);
    b.innerHTML = on ? Art.icons.bell : Art.icons.bellOff;
  }
  $('sfx').addEventListener('click', function () {
    var on = !Sound.sfxOn();
    Sound.setSfx(on);
    showSfx(on);
    if (on) Sound.sfx.click();
  });
  showSfx(Sound.sfxOn());

  // A level's id in the address (#short-a) opens that level, so teachers can link to one. Other
  // addresses, like the skip link's #game, leave the level alone and are put back to its id.
  function fromHash() {
    var id;
    try { id = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { return null; }
    return SB.level(id) ? id : null;
  }
  window.addEventListener('hashchange', function () {
    var id = fromHash();
    if (id && id !== S.level.id) setLevel(id, false);
    else if (!id && window.history && history.replaceState) history.replaceState(null, '', '#' + S.level.id);
  });

  SB.Levels.init(function (id) { setLevel(id, true); });
  $('game').dataset.mode = S.mode;
  setLevel(fromHash() || SB.LEVELS[0].id, false);
  // Then every clip, quietly in the background, so a dropped connection later (school Wi-Fi) never
  // switches the lab to the computer voice.
  setTimeout(function () { Sound.preloadAll(); }, 1500);
})();
