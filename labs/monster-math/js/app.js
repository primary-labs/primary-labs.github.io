/* Primary Labs · Monster Math: the activity.
   One problem at a time. Adding: tap every friend to count them all, then pick the answer.
   Minus: tap friends to cross them out, then count the ones left and pick the answer. */
(function () {
  'use strict';
  var MM = window.MM;
  var Sound = MM.Sound, ids = MM.Phrases.ids;
  var $ = function (s) { return document.querySelector(s); };

  var CHEERS = ['Great job!', 'You got it!', 'Super counting!', 'Hooray!', 'Awesome!'];

  var M = { op: '+', kind: 'monster', max: 5, p: null, crossed: new Set(), counts: new Map(), solved: false, wrong: new Set() };
  var stars = 0;

  function show(id) { return MM.Phrases.get(id).show; }
  function noun(n) { return M.kind + (n === 1 ? '' : 's'); }
  function crossDone() { return M.op === '-' && M.crossed.size === M.p.b; }
  function problemId() { return ids.problem(M.op, M.p.a, M.p.b); }
  function instructionId() {
    if (M.solved) return ids.solved(M.op, M.p.a, M.p.b);
    if (M.op === '+') return ids.countAll(M.kind);
    if (!crossDone()) return ids.takeAway(M.kind, M.p.b);
    return ids.howMany(M.kind);
  }

  function newProblem() {
    M.p = MM.Problems.make(M.op, M.max, M.p ? M.p.key : '');
    M.crossed = new Set(); M.counts = new Map(); M.solved = false; M.wrong = new Set();
    var a = M.p.a, b = M.p.b;
    var lines = [problemId(), ids.yes(M.op, a, b), ids.solved(M.op, a, b), instructionId()];
    for (var n = 1; n <= a + (M.op === '+' ? b : 0); n++) lines.push(ids.number(n));
    Sound.preload(lines);
    render(true);
  }

  /* ---------- drawing ---------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function renderProblem() {
    var prob = $('#problem');
    prob.className = 'problem ' + M.kind;
    prob.textContent = '';
    prob.appendChild(el('span', 'nA', String(M.p.a)));
    prob.appendChild(el('span', 'op', M.op === '+' ? '+' : '−'));
    prob.appendChild(el('span', M.op === '+' ? 'nB' : 'nA', String(M.p.b)));
    prob.appendChild(el('span', 'op', '='));
    prob.appendChild(el('span', 'q' + (M.solved ? ' done' : ''), M.solved ? String(M.p.ans) : '?'));
    var hear = el('button', 'iconbtn say', '🔊');
    hear.type = 'button';
    hear.setAttribute('aria-label', 'Hear the problem');
    hear.onclick = function () { Sound.sfx.click(); Sound.sayAll([problemId(), instructionId()]); };
    prob.appendChild(hear);
    prob.setAttribute('aria-label', MM.Phrases.get(problemId()).show + (M.solved ? ' equals ' + M.p.ans : ' equals what?'));
    $('#instr').textContent = show(instructionId());
  }

  function group(cls, start, n, label) {
    var g = el('div', 'group ' + cls);
    var chars = el('div', 'chars');
    chars.style.setProperty('--cols', String(Math.min(n, 5)));
    for (var i = 0; i < n; i++) {
      var b = el('button', 'char');
      b.type = 'button';
      b.dataset.i = String(start + i);
      b.setAttribute('aria-label', M.kind + ' ' + (i + 1));
      b.innerHTML = MM.Art.friend(M.kind, start + i);
      chars.appendChild(b);
    }
    g.appendChild(chars);
    var count = el('div', 'gcount', String(n));
    count.setAttribute('aria-label', label);
    g.appendChild(count);
    return g;
  }

  function renderStage() {
    var stage = $('#stage');
    stage.className = 'stage ' + M.kind;
    stage.textContent = '';
    var a = M.p.a, b = M.p.b;
    stage.appendChild(group('A', 0, a, a + ' ' + noun(a)));
    if (M.op === '+') {
      var op = el('div', 'bigop', '+');
      op.setAttribute('aria-hidden', 'true');
      stage.appendChild(op);
      stage.appendChild(group('B', a, b, b + ' more'));
    }
    stage.querySelectorAll('.char').forEach(function (c) {
      c.onclick = function () { tapChar(+c.dataset.i, c); };
    });
    $('#cheerRow').hidden = true;
    $('#nextRow').hidden = true;
  }

  function updateChars() {
    var stage = $('#stage');
    stage.classList.toggle('party', M.solved);
    stage.querySelectorAll('.char').forEach(function (c) {
      var i = +c.dataset.i;
      var crossed = M.crossed.has(i);
      c.classList.toggle('crossed', crossed);
      var x = c.querySelector('.x');
      if (crossed && !x) c.insertAdjacentHTML('beforeend', MM.Art.X);
      if (!crossed && x) x.remove();
      var badge = c.querySelector('.badge');
      var n = M.counts.get(i);
      if (n && !badge) c.appendChild(el('span', 'badge', String(n)));
      if (!n && badge) badge.remove();
      var label = M.kind + ' ' + (i + 1 - (M.op === '+' && i >= M.p.a ? M.p.a : 0));
      if (crossed) label += ', crossed out';
      if (n) label += ', counted ' + n;
      c.setAttribute('aria-label', label);
    });
  }

  function renderAnswers() {
    var locked = M.op === '-' && !crossDone() && !M.solved;
    var box = $('#answers');
    box.textContent = '';
    M.p.choices.forEach(function (n) {
      var b = el('button', 'ans', String(n));
      b.type = 'button';
      if (locked) b.classList.add('locked');
      if (M.wrong.has(n)) b.classList.add('wrong');
      if (M.solved && n === M.p.ans) b.classList.add('right');
      b.disabled = locked || M.solved || M.wrong.has(n);
      b.onclick = function () { pickAnswer(n); };
      box.appendChild(b);
    });
    $('#hint').textContent = locked ? 'Cross out ' + M.p.b + ' first, then pick a number.' : (M.solved ? '' : 'Pick the answer.');
  }

  function render(fresh) {
    renderProblem();
    if (fresh) renderStage();
    updateChars();
    renderAnswers();
  }

  /* ---------- play ---------- */

  function hop(c) { c.classList.remove('hop'); void c.offsetWidth; c.classList.add('hop'); }
  function friendSound() { if (M.kind === 'monster') Sound.sfx.boing(); else Sound.sfx.beep(); }

  function tapChar(i, c) {
    hop(c);
    if (M.solved) { friendSound(); return; }
    if (M.op === '-' && !crossDone()) {
      if (M.crossed.has(i)) { M.crossed.delete(i); Sound.sfx.click(); }
      else { M.crossed.add(i); if (M.kind === 'monster') Sound.sfx.chomp(); else Sound.sfx.zap(); }
      updateChars();
      if (crossDone()) { renderProblem(); Sound.say(ids.gone(M.p.b)); }
      else { $('#instr').textContent = show(instructionId()); Sound.say(ids.number(M.crossed.size)); }
      renderAnswers();
      return;
    }
    if (M.crossed.has(i)) { Sound.sfx.oops(); Sound.say(ids.skip()); return; }
    if (M.counts.has(i)) { friendSound(); Sound.say(ids.number(M.counts.get(i))); return; }
    var n = M.counts.size + 1;
    M.counts.set(i, n);
    Sound.sfx.count(n);
    Sound.say(ids.number(n));
    updateChars();
  }

  function pickAnswer(n) {
    if (M.solved) return;
    if (n === M.p.ans) {
      M.solved = true;
      stars++;
      $('#stars').textContent = '⭐ ' + stars;
      $('#stars').setAttribute('aria-label', stars + (stars === 1 ? ' star' : ' stars'));
      Sound.sfx.yay();
      render(false);
      $('#cheer').textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
      $('#cheerRow').hidden = false;
      $('#nextRow').hidden = false;
      Sound.say(ids.yes(M.op, M.p.a, M.p.b));
      $('#next').focus({ preventScroll: true });
    } else {
      M.wrong.add(n);
      Sound.sfx.oops();
      M.counts.clear();
      updateChars();
      renderAnswers();
      Sound.sayAll([ids.not(n), ids.again(M.kind, M.op === '-')]);
    }
  }

  /* ---------- settings ---------- */

  function wireSeg(sel, key, parse, onChange) {
    var seg = $(sel);
    seg.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        Sound.sfx.click();
        seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onChange(parse(b.dataset[key]));
      };
    });
  }
  wireSeg('#opSeg', 'op', String, function (v) { M.op = v; Sound.stop(); newProblem(); });
  wireSeg('#kindSeg', 'kind', String, function (v) { M.kind = v; Sound.stop(); render(true); });
  wireSeg('#maxSeg', 'max', Number, function (v) { M.max = v; Sound.stop(); newProblem(); });

  $('#next').onclick = function () {
    Sound.sfx.click();
    newProblem();
    setTimeout(function () { Sound.say(problemId()); }, 150);
  };

  $('#sfx').onclick = function () {
    var on = !Sound.sfxOn();
    Sound.setSfx(on);
    this.setAttribute('aria-pressed', String(on));
    this.textContent = on ? '🔔' : '🔕';
    if (on) Sound.sfx.click();
  };

  newProblem();
})();
