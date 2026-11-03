/* Primary Labs · Story Puzzles: the activity.
   One story at a time. Kids read it, then tap the picture pieces that are in it. A piece that is
   in the story clicks into its spot under the story (spots go in story order), and its sentence
   lights up and is read aloud. A piece that isn't fades out. Nothing in the tray moves around:
   a placed piece leaves an empty outline behind, so the layout stays the same the whole time. */
(function () {
  'use strict';
  var SP = window.SP;
  var Sound = SP.Sound, Art = SP.Art, ids = SP.Phrases.ids;
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  var S = {
    i: 0,            // story index
    placed: [],      // placed[k]: piece k is in its spot
    wrong: {},       // pic → true once tapped and not in the story
    tray: [],        // [{ pic, alt, k }] in tray order; k is the piece index, or -1 if not in the story
    done: {},        // story id → true once finished in this visit
    kept: {},        // story id → { placed, wrong, tray } of a story left before it was finished
    lockUntil: 0,    // taps on pieces, sentences and the end buttons wait until this time (ms)
    timer: null,     // speech waiting for a sound effect to finish
    reveal: null,    // shows the end buttons once taps count again
    saying: null     // { id } of the one line playing now, so a repeat tap lets it finish
  };

  /* The tray and the end buttons sit in the same place, so a second tap could land on what just
     appeared there. Kids who tap again and again space their taps about 200ms apart, so taps wait
     a little over a second after the puzzle is finished or a new story opens. */
  var SETTLE = 1200;

  function story() { return SP.STORIES[S.i]; }
  function allPlaced() { return S.placed.every(Boolean); }

  function lock(ms) { S.lockUntil = Date.now() + ms; }
  function locked() { return Date.now() < S.lockUntil; }

  /* Stops speech, including speech that was about to start. Every new action begins with this. */
  function quiet() { clearTimeout(S.timer); S.saying = null; Sound.stop(); }
  /* Speaks after a sound effect, so the effect doesn't cover the first word. */
  function after(ms, fn) { clearTimeout(S.timer); S.timer = setTimeout(fn, ms); }
  /* Says one line and remembers it while it plays. */
  function speak(id) {
    var mine = S.saying = { id: id };
    return Sound.say(id).then(function (ok) { if (S.saying === mine) S.saying = null; return ok; });
  }
  function saying(id) { return !!S.saying && S.saying.id === id; }

  /* True when b has the keyboard's focus ring, i.e. the child is using keys, not taps. */
  function byKeys(b) {
    try { return !!b && b.matches(':focus-visible'); } catch (e) { return false; } // older browsers
  }
  /* Moves the keyboard to b. The page scrolls to it only for keyboard users, so a tap never makes
     the page jump. */
  function focusOn(b) {
    b.focus({ preventScroll: true });
    if (byKeys(b)) b.scrollIntoView({ block: 'nearest' });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var n = a.length - 1; n > 0; n--) {
      var j = Math.floor(Math.random() * (n + 1));
      var t = a[n]; a[n] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- picker ---------- */

  function renderPicker() {
    var box = $('picker');
    box.textContent = '';
    SP.GROUPS.forEach(function (g) {
      var group = el('div', 'picker-group');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', g.name);
      group.appendChild(el('span', 'picker-label', g.name));
      var row = el('div', 'picker-pills'); // its own column, so a story that wraps lines up
      group.appendChild(row);
      SP.STORIES.forEach(function (s, n) {
        if (s.group !== g.id) return;
        var b = el('button', 'pill');
        b.type = 'button';
        b.setAttribute('aria-pressed', String(n === S.i));
        b.appendChild(document.createTextNode(s.title));
        if (S.done[s.id]) {
          var check = el('span', 'pill-check');
          check.innerHTML = Art.icons.check;
          b.appendChild(check);
          b.appendChild(el('span', 'sr-only', ', done'));
        }
        // Picking closes the list. The story already open stays as it is, so a stray tap can't wipe
        // the pieces placed so far.
        b.addEventListener('click', function () {
          showStories(false);
          if (n === S.i) return;
          Sound.sfx.click();
          load(n, true);
        });
        row.appendChild(b);
      });
      if (row.firstChild) box.appendChild(group);
    });
  }

  /* ---------- story ---------- */

  /* Each line is its own row (a button: tap it to hear it), so kids can track it and the read-aloud
     can light it up. Words that match a piece are wrapped, so they can be marked once it's found. */
  function renderStory() {
    var s = story();
    $('storyTitle').textContent = s.title;
    var text = $('storyText');
    text.textContent = '';
    s.lines.forEach(function (line, n) {
      var row = el('button', 'sent');
      row.type = 'button';
      row.dataset.n = String(n);
      var marks = {};
      s.pieces.forEach(function (p, k) {
        if (p.line !== n) return;
        var at = SP.findWord(line, p.word);
        if (at) marks[at[0]] = { k: k, count: at[1] };
      });
      // Split into words and the bits between them, keeping punctuation and spaces as written.
      var parts = line.split(/([A-Za-z']+)/);
      var w = 0, open = null, left = 0;
      parts.forEach(function (part) {
        if (!part) return;
        var isWord = /^[A-Za-z']+$/.test(part);
        if (isWord && marks[w]) {
          open = el('span', 'key' + (S.placed[marks[w].k] ? ' is-found' : ''));
          open.dataset.k = String(marks[w].k);
          left = marks[w].count;
          row.appendChild(open);
        }
        (open || row).appendChild(document.createTextNode(part));
        if (isWord) {
          w++;
          if (open && --left === 0) open = null;
        }
      });
      row.addEventListener('click', function () { if (!locked()) readLine(n); });
      text.appendChild(row);
    });
  }

  function clearLit() {
    $('storyCard').querySelectorAll('.is-lit').forEach(function (e) { e.classList.remove('is-lit'); });
  }
  function lightLine(n, k) {
    clearLit();
    var row = $('storyText').querySelector('.sent[data-n="' + n + '"]');
    if (!row) return;
    row.classList.add('is-lit');
    if (k !== undefined) {
      var key = row.querySelector('.key[data-k="' + k + '"]');
      if (key) key.classList.add('is-lit');
    }
  }

  /* Reads one line. Tapping the same line again while it plays lets it finish instead of starting
     over, so quick repeat taps don't make the voice stutter. */
  function readLine(n, k) {
    var id = ids.line(story(), n);
    if (saying(id)) { lightLine(n, k); return; }
    quiet();
    lightLine(n, k);
    speak(id);
  }

  /* Says the directions, or "not in the story", again. A repeat tap while it plays lets it finish. */
  function hear(id) {
    if (saying(id)) return;
    quiet();
    clearLit();
    speak(id);
  }

  /* A new story says "Let's read …" when a child opens it, with the title lit, so the
     voice never starts with a bare title out of nowhere. */
  function readTitle() {
    var title = $('storyTitle');
    after(250, function () { // after the click
      clearLit();
      title.classList.add('is-lit');
      speak(ids.start(story())).then(function (ok) { if (ok) title.classList.remove('is-lit'); });
    });
  }

  /* Reads the whole story like a storyteller: the title in a sentence, a pause, then each line. */
  var AFTER_TITLE = 800; // ms
  function readStory() {
    quiet();
    var s = story();
    clearLit();
    $('storyTitle').classList.add('is-lit');
    speak(ids.start(s)).then(function (ok) {
      if (!ok) return; // something else was tapped
      after(AFTER_TITLE, function () {
        Sound.sayAll(s.lines.map(function (l, n) { return ids.line(s, n); }), function (id, n) { lightLine(n); })
          .then(function (done) { if (done) clearLit(); });
      });
    });
  }

  /* ---------- spots under the story ---------- */

  function slot(k) {
    var s = story(), p = s.pieces[k];
    var li = el('li', 'slot');
    li.dataset.k = String(k);
    if (S.placed[k]) {
      li.classList.add('is-filled');
      var b = el('button', 'slot-piece');
      b.type = 'button';
      b.innerHTML = Art.piece(p.pic);
      b.setAttribute('aria-label', (k + 1) + '. ' + p.alt + '. Hear: ' + s.lines[p.line]);
      b.addEventListener('click', function () { Sound.sfx.click(); readLine(p.line, k); });
      li.appendChild(b);
      var badge = el('span', 'slot-check');
      badge.innerHTML = Art.icons.check;
      li.appendChild(badge);
    } else {
      li.innerHTML = Art.piece(null);
      li.appendChild(el('span', 'slot-num', String(k + 1)));
      li.appendChild(el('span', 'sr-only', ', empty'));
      // An empty spot looks like a place to put a piece. Tapping it says the directions, so the tap
      // isn't met with silence. It isn't a button, so the keyboard doesn't stop on it.
      li.addEventListener('click', function () { Sound.sfx.click(); hear(ids.intro()); });
    }
    return li;
  }

  function renderSlots() {
    var box = $('slots');
    box.textContent = '';
    story().pieces.forEach(function (p, k) { box.appendChild(slot(k)); });
  }

  /* ---------- tray ---------- */

  function newTray() {
    var s = story();
    var items = s.pieces.map(function (p, k) { return { pic: p.pic, alt: p.alt, k: k }; })
      .concat(s.others.map(function (o) { return { pic: o.pic, alt: o.alt, k: -1 }; }));
    S.tray = shuffle(items);
  }

  function gap() {
    var g = el('span', 'tray-gap');
    g.innerHTML = Art.piece(null);
    return g;
  }

  function renderTray() {
    var box = $('tray');
    box.textContent = '';
    S.tray.forEach(function (it, idx) {
      if (it.k >= 0 && S.placed[it.k]) { box.appendChild(gap()); return; }
      var b = el('button', 'tray-piece');
      b.type = 'button';
      b.dataset.idx = String(idx);
      b.innerHTML = Art.piece(it.pic);
      if (S.wrong[it.pic]) markWrong(b, it);
      else b.setAttribute('aria-label', it.alt);
      b.addEventListener('click', function () { if (Date.now() - dragEnd > 400) tap(idx, b); });
      box.appendChild(b);
    });
  }

  /* A piece that isn't in the story stays in place, faded. Tapping it again says why. The keyboard
     skips it, like a disabled button. */
  function markWrong(b, it) {
    b.classList.add('is-wrong');
    b.setAttribute('aria-disabled', 'true');
    b.tabIndex = -1;
    b.setAttribute('aria-label', it.alt + ', not in the story');
  }

  /* Keeps the keyboard in the tray after a piece leaves or fades: the next piece that can still be tapped. */
  function focusNext(idx) {
    var buttons = Array.prototype.slice.call($('tray').querySelectorAll('.tray-piece:not(.is-wrong)'));
    if (!buttons.length) return;
    var next = buttons.filter(function (b) { return +b.dataset.idx > idx; })[0] || buttons[0];
    focusOn(next);
  }

  /* The status line. extra is read by screen readers only. */
  function setFeedback(text, kind, extra) {
    var f = $('feedback');
    f.className = 'feedback' + (kind ? ' feedback--' + kind : '');
    f.textContent = text;
    if (extra) f.appendChild(el('span', 'sr-only', ' ' + extra));
  }

  /* ---------- play ---------- */

  function tap(idx, btn) {
    if (locked()) return;
    var it = S.tray[idx];
    if (S.wrong[it.pic]) return again();
    if (it.k < 0) return miss(it, idx, btn);
    place(it.k, idx, btn);
  }

  function miss(it, idx, btn) {
    quiet();
    S.wrong[it.pic] = true;
    Sound.sfx.oops();
    clearLit();
    markWrong(btn, it);
    btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
    setFeedback(SP.Phrases.get(ids.notIn()).say, 'oops');
    after(350, function () { speak(ids.notIn()); });
    focusNext(idx);
  }

  /* ---------- dragging a piece ----------
     Kids who know jigsaw puzzles drag the pieces. A piece follows the finger. Letting go outside the
     tray, or back on its own place, counts as a tap on it. Letting go anywhere else in the tray puts
     it back. Only on tablets and wider, where the whole activity fits on the screen: on a phone a
     swipe has to scroll the page, so pieces there are tapped. */
  var canDrag = window.matchMedia ? window.matchMedia('(min-width: 721px)') : { matches: false };
  var drag = null;   // { btn, idx, id, x, y, home, moved, hold }
  var dragEnd = 0;   // when a drag ended, so the click that follows it doesn't count twice

  function within(r, x, y) { return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }

  function dragStart(e) {
    var btn = e.target.closest && e.target.closest('.tray-piece');
    if (!btn || drag || !e.isPrimary || e.button !== 0 || !canDrag.matches || locked()) return;
    drag = { btn: btn, idx: +btn.dataset.idx, id: e.pointerId, x: e.clientX, y: e.clientY,
      home: btn.getBoundingClientRect(), moved: false, hold: null };
    try { btn.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
  }

  function dragMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && dx * dx + dy * dy < 100) return; // a wobble under 10px is still a tap
    drag.moved = true;
    // Moved with an animation that holds its place, like the flight to a spot (no inline styles).
    var t = 'translate(' + dx + 'px, ' + dy + 'px)', frames = [{ transform: t }, { transform: t }];
    if (drag.hold) drag.hold.effect.setKeyframes(frames);
    else if (drag.btn.animate) {
      drag.btn.classList.add('is-dragging');
      drag.hold = drag.btn.animate(frames, { duration: 1, fill: 'forwards' });
    }
  }

  function dragStop(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.moved) return; // a tap: the click that follows handles it
    dragEnd = Date.now();
    var x = e.clientX, y = e.clientY;
    var pick = e.type === 'pointerup' && !locked() &&
      (within(d.home, x, y) || !within($('tray').getBoundingClientRect(), x, y));
    d.btn.classList.remove('is-dragging');
    if (pick && d.btn.isConnected) {
      tap(d.idx, d.btn); // a story piece flies to its spot from where it was let go
      if (!d.btn.isConnected) return;
    }
    // Back to its place in the tray, quickly.
    var at = getComputedStyle(d.btn).transform;
    if (d.hold) d.hold.cancel();
    if (!reduceMotion.matches && at && at !== 'none' && d.btn.animate) {
      d.btn.animate([{ transform: at }, { transform: 'none' }], { duration: 200, easing: 'ease-out' });
    }
  }

  $('tray').addEventListener('pointerdown', dragStart);
  $('tray').addEventListener('pointermove', dragMove);
  $('tray').addEventListener('pointerup', dragStop);
  $('tray').addEventListener('pointercancel', dragStop);

  /* A faded piece tapped again: a soft click and the same words, without the shake. */
  function again() {
    Sound.sfx.click();
    setFeedback(SP.Phrases.get(ids.notIn()).say, 'oops');
    hear(ids.notIn());
  }

  /* The piece flies from the tray to its spot: drawn in the spot, then animated from where it was.
     Returns the animation, or nothing when it doesn't move. */
  function fly(target, from) {
    if (reduceMotion.matches || !target.animate) return null;
    var to = target.getBoundingClientRect();
    if (!to.width) return null;
    var dx = from.left - to.left, dy = from.top - to.top, k = from.width / to.width;
    return target.animate([
      { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(' + k + ')' },
      { transform: 'none' }
    ], { duration: 450, easing: 'cubic-bezier(.2, .8, .3, 1)' });
  }

  function place(k, idx, btn) {
    var s = story(), p = s.pieces[k];
    showSlots();
    var from = btn.getBoundingClientRect(), keys = byKeys(btn);
    quiet();
    S.placed[k] = true;
    btn.replaceWith(gap());
    // Only this spot is drawn again, so a piece still flying to another spot keeps going.
    var old = $('slots').querySelector('.slot[data-k="' + k + '"]');
    var li = slot(k);
    old.replaceWith(li);
    // The green check shows once the piece has landed, not before.
    var flight = fly(li.querySelector('.slot-piece'), from), badge = li.querySelector('.slot-check');
    if (flight && badge) {
      badge.hidden = true;
      flight.onfinish = flight.oncancel = function () { badge.hidden = false; };
    }
    Sound.sfx.snap();
    var key = $('storyText').querySelector('.key[data-k="' + k + '"]');
    if (key) key.classList.add('is-found');
    lightLine(p.line, k);
    if (allPlaced()) return finish(k, keys);
    setFeedback('Yes! That is in the story.', 'yay', s.lines[p.line]);
    after(220, function () { speak(ids.line(s, p.line)); });
    focusNext(idx);
  }

  /* "Next story" and "Do it again" appear where the tray was. They show once taps count again, so
     a child still tapping where the last piece was can't skip the story or start it over. */
  function finish(k, keys) {
    var s = story(), p = s.pieces[k];
    var doneLine = SP.Phrases.get(ids.done()).say;
    lock(SETTLE);
    S.done[s.id] = true;
    Sound.sfx.yay();
    setFeedback('', null, 'All four pictures fit! ' + doneLine);
    $('prompt').textContent = doneLine;
    $('tray').hidden = true;
    $('done').hidden = false;
    $('done').classList.add('is-waiting');
    $('puzzle').classList.add('is-done');
    renderPicker();
    // Keyboard users wait on the end panel, so focus isn't lost while the buttons are hidden.
    $('done').focus({ preventScroll: true });
    clearTimeout(S.reveal);
    S.reveal = setTimeout(function () {
      $('done').classList.remove('is-waiting');
      if (document.activeElement !== $('done')) return;
      $('nextBtn').focus({ preventScroll: true });
      if (keys) $('nextBtn').scrollIntoView({ block: 'nearest' });
    }, SETTLE);
    // After the jingle: the last sentence, then "You did it!"
    after(700, function () {
      Sound.sayAll([ids.line(s, p.line), ids.done()], function (id, i) {
        if (i === 0) lightLine(p.line, k); else clearLit();
      });
    });
  }

  /* ---------- load a story ---------- */

  /* A story left before it's finished keeps its pieces and their order for the rest of the visit,
     so a stray tap on another story loses nothing. A finished story starts fresh next time, with
     the pieces shuffled, so kids read it again instead of remembering where pieces were. */
  function keep() {
    var id = story().id;
    if (S.placed.length && !allPlaced()) S.kept[id] = { placed: S.placed, wrong: S.wrong, tray: S.tray };
    else delete S.kept[id];
  }

  function load(n, fromTap) {
    // Where the keyboard was, so it can go back after the picker and tray are drawn again.
    var at = document.activeElement && document.activeElement.closest ? document.activeElement : null;
    var focusIn = at && at.closest('#picker') ? 'picker' : at && at.closest('#done') ? 'done' : null;
    quiet();
    clearLit();
    clearTimeout(S.reveal);
    if (fromTap) lock(SETTLE);
    keep();
    S.i = (n + SP.STORIES.length) % SP.STORIES.length;
    var s = story();
    var kept = S.kept[s.id];
    if (kept) {
      // Back to a story left half done: the same pieces in the same places.
      S.placed = kept.placed; S.wrong = kept.wrong; S.tray = kept.tray;
    } else {
      S.placed = s.pieces.map(function () { return false; });
      S.wrong = {};
      newTray();
    }
    $('prompt').textContent = SP.Phrases.get(ids.intro()).say;
    $('tray').hidden = false;
    $('done').hidden = true;
    $('done').classList.remove('is-waiting');
    $('puzzle').classList.remove('is-done');
    setFeedback('');
    renderPicker();
    renderStory();
    renderSlots();
    renderTray();
    if (window.history && history.replaceState) history.replaceState(null, '', '#' + s.id);
    Sound.preload([ids.start(s), ids.intro(), ids.notIn(), ids.done()]
      .concat(s.lines.map(function (l, i) { return ids.line(s, i); })));
    if (focusIn === 'picker') $('storiesBtn').focus({ preventScroll: true }); // the list has closed
    if (focusIn === 'done') $('tray').querySelector('.tray-piece:not(.is-wrong)').focus({ preventScroll: true });
    if (fromTap) { showTop(); readTitle(); }
  }

  /* How much of the top of the screen the sticky header covers (none on phones). */
  function covered() {
    var header = document.querySelector('.site-header');
    return header && getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().bottom : 0;
  }

  /* After "Next story" at the bottom of a phone screen, the new story's first line is out of
     sight, so the page scrolls up to it. Otherwise the page stays still. */
  function showTop() {
    if ($('puzzle').getBoundingClientRect().top >= covered()) return;
    $('puzzle').scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  /* On a phone the spots can be scrolled out of sight above the tray. They come into view before a
     piece flies there, so the child sees where it went. Tablets and boards show both already. */
  function showSlots() {
    var top = $('slots').getBoundingClientRect().top - covered();
    if (top < 0) window.scrollBy(0, top - 8);
  }

  /* ---------- the story list ----------
     The "Stories" button at the top opens the list over the page, so it never pushes the activity
     down. Picking a story, tapping outside it, Escape or the button again closes it. */
  function showStories(open) {
    $('storiesPanel').hidden = !open;
    $('storiesBtn').setAttribute('aria-expanded', String(open));
  }
  $('storiesBtn').addEventListener('click', function () {
    var open = $('storiesPanel').hidden;
    Sound.sfx.click();
    showStories(open);
    if (open) $('picker').querySelector('.pill[aria-pressed="true"]').focus({ preventScroll: true });
  });
  document.addEventListener('pointerdown', function (e) {
    if (!$('storiesPanel').hidden && !e.target.closest('.stories-menu')) showStories(false);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || $('storiesPanel').hidden) return;
    showStories(false);
    $('storiesBtn').focus();
  });

  /* ---------- controls ---------- */

  document.querySelectorAll('[data-icon]').forEach(function (e) { e.innerHTML = Art.icons[e.dataset.icon] || ''; });
  $('promptBtn').innerHTML = Art.icons.speaker;

  $('hearBtn').addEventListener('click', function () { Sound.sfx.click(); readStory(); });
  $('promptBtn').addEventListener('click', function () { Sound.sfx.click(); hear(allPlaced() ? ids.done() : ids.intro()); });
  $('nextBtn').addEventListener('click', function () { if (locked()) return; Sound.sfx.click(); load(S.i + 1, true); });
  $('againBtn').addEventListener('click', function () { if (locked()) return; Sound.sfx.click(); load(S.i, true); });

  // A held-down Enter or Space would press one button after another, because focus moves on to the
  // next piece each time. Only the first press of a key counts.
  document.addEventListener('keydown', function (e) {
    if (e.repeat && (e.key === 'Enter' || e.key === ' ')) e.preventDefault();
  }, true);

  // Sound effects toggle: a solid bell when on, an outline bell with a slash when off.
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

  // A story's id in the address (#fat-cat) opens that story, so teachers can link to one. Other
  // addresses, like the skip link's #puzzle, leave the story alone and are put back to the story's
  // id, so a reload still opens the same story.
  function fromHash() {
    var id;
    try { id = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { return -1; }
    for (var n = 0; n < SP.STORIES.length; n++) if (SP.STORIES[n].id === id) return n;
    return -1;
  }
  window.addEventListener('hashchange', function () {
    var n = fromHash();
    if (n >= 0 && n !== S.i) load(n, false);
    else if (n < 0 && window.history && history.replaceState) history.replaceState(null, '', '#' + story().id);
  });
  load(Math.max(0, fromHash()), false);
  // Then every story's clips, quietly in the background, so a dropped connection later (school
  // Wi-Fi) never switches a story to the computer voice.
  setTimeout(function () { Sound.preloadAll(); }, 1500);
})();
