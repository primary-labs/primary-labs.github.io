/* Primary Labs · Sound Boxes: Segment.
   The child hears a word and sees its picture.
   Step 1, say it: they put a counter in each box (tap a counter or a box, or drag a counter onto a
   box) while saying each sound aloud. Each box plays its sound as the counter lands, so they can
   check themselves. When all three are in, the word is said again.
   Step 2, spell it: they put letter tiles in the boxes, from the word's letters and a few others.
   The letters are checked: a wrong tile plays its own sound and stays in its place, and the box
   replays the sound it needs. Nothing in the tray moves around: a used counter or tile leaves its
   outline behind. */
(function () {
  'use strict';
  var SB = window.SB;
  var ui = SB.ui, Boxes = SB.Boxes, Sound = SB.Sound;

  var STEP_PAUSE = 900; // ms after the last counter's sound before the word is said again

  SB.Segment = function (r) {
    var word = '', step = 0;
    var my = 0;      // bumps on every start and stop, so a late move to the letters is dropped
    var kbd = false; // the child is using the keyboard

    function wordNow() { r.quiet(); return Sound.say(SB.wordClip(word)); }

    /* ---------- tray ---------- */

    function gap(item) {
      var g = ui.el('span', 'tray-gap ' + (item.classList.contains('counter') ? 'tray-gap--counter' : 'tray-gap--tile'));
      item.replaceWith(g);
    }

    function counters() {
      r.tray.textContent = '';
      r.tray.className = 'tray tray--counters';
      r.tray.setAttribute('aria-label', 'Counters');
      for (var i = 0; i < word.length; i++) {
        var b = ui.button('counter', 'Counter');
        b.appendChild(ui.el('span', 'counter-dot'));
        b.addEventListener('click', function (e) { if (!SB.Drag.justDragged()) useCounter(e.currentTarget, -1); });
        r.tray.appendChild(b);
      }
    }

    function tiles() {
      r.tray.textContent = '';
      r.tray.className = 'tray tray--tiles';
      r.tray.setAttribute('aria-label', 'Letters');
      SB.tiles(word).forEach(function (l) {
        var b = ui.button('tile ' + (SB.isVowel(l) ? 'tile--vowel' : 'tile--consonant'), 'letter ' + l);
        b.dataset.letter = l;
        b.appendChild(ui.el('span', 'tile-letter', l));
        b.addEventListener('click', function (e) { if (!SB.Drag.justDragged()) useTile(e.currentTarget, -1); });
        r.tray.appendChild(b);
      });
    }

    /* Takes item out of the tray, leaving its outline. If it had the keyboard, the keyboard moves to
       the next item, or to box i once the tray is empty, so focus is never lost. */
    function take(item, i) {
      var had = document.activeElement === item;
      kbd = ui.byKeys(document.activeElement);
      gap(item);
      if (had) ui.focusOn(r.tray.querySelector('button') || Boxes.box(i));
    }

    /* ---------- step 1: counters ---------- */

    function useCounter(item, i) {
      if (r.locked() || step !== 1) return false;
      if (i < 0) i = Boxes.firstEmpty();
      if (i < 0 || Boxes.filled(i)) return false;
      var from = item.getBoundingClientRect();
      r.quiet();
      ui.fly(Boxes.putCounter(i), from);
      take(item, i);
      Sound.sfx.snap();
      Boxes.setNext(Boxes.firstEmpty());
      if (Boxes.firstEmpty() >= 0) {
        r.after(120, function () { Boxes.sayOne(i); });
        return true;
      }
      // The last counter. The move to the letters uses its own timers, so a tap on a box while
      // it waits can't cancel it and leave the child stuck with three counters.
      var mine = my;
      setTimeout(function () {
        if (mine !== my) return;
        Boxes.sayOne(i).then(function () {
          setTimeout(function () { if (mine === my) toLetters(); }, STEP_PAUSE);
        });
      }, 120);
      return true;
    }

    /* All three counters are in: the word again, then on to the letters. */
    function toLetters() {
      var mine = my;
      Boxes.clearLit();
      wordNow().then(function () {
        if (mine !== my || step !== 1) return;
        step = 2;
        for (var i = 0; i < word.length; i++) Boxes.empty(i);
        Boxes.setNext(0);
        tiles();
        if (kbd) ui.focusOn(r.tray.querySelector('button'));
        r.prompt('letters');
        r.feedback('');
        r.after(300, function () { Sound.say('phrases/letters'); });
      });
    }

    /* ---------- step 2: letters ---------- */

    function useTile(item, i) {
      if (r.locked() || step !== 2) return false;
      if (i < 0) i = Boxes.firstEmpty();
      if (i < 0 || Boxes.filled(i)) return false;
      var l = item.dataset.letter;
      r.quiet();
      if (l !== word[i]) { miss(item, i); return false; }
      var from = item.getBoundingClientRect();
      ui.fly(Boxes.putLetter(i, l), from);
      take(item, i);
      Sound.sfx.snap();
      var next = Boxes.firstEmpty();
      Boxes.setNext(next);
      if (next < 0) { spelled(); return true; }
      r.feedback('');
      r.after(120, function () { Boxes.sayOne(i); });
      return true;
    }

    /* A wrong letter says its own sound, then the box says the sound it needs. */
    function miss(item, i) {
      ui.replay(item, 'shake');
      Sound.sfx.soft();
      r.feedback(SB.Phrases.get('again').say);
      r.after(250, function () {
        Sound.say(SB.soundClip(item.dataset.letter)).then(function (ok) {
          if (ok) r.after(500, function () { Boxes.sayOne(i); });
        });
      });
    }

    function spelled() {
      step = 3;
      Boxes.done();
      r.feedback('Yes! ' + word + '.', 'yay');
      r.finish(kbd);
      r.after(250, function () {
        Boxes.sayAll().then(function (ok) { if (ok) r.after(300, function () { Sound.say(SB.wordClip(word)); }); });
      });
    }

    /* ---------- boxes ---------- */

    /* In step 1 an empty box takes the next counter (they fill from the left, as children move
       counters while saying the sounds in order). Any other box says its sound; an empty box in
       step 2 says the sound it needs. */
    function tapBox(i) {
      if (r.locked()) return;
      if (step === 1 && !Boxes.filled(i)) {
        var c = r.tray.querySelector('.counter');
        if (c) useCounter(c, -1);
        return;
      }
      r.quiet();
      Boxes.sayOne(i);
    }

    function drop(item, x, y) {
      var i = Boxes.at(x, y);
      if (i < 0) return false;
      return item.classList.contains('counter') ? useCounter(item, i) : useTile(item, i);
    }
    SB.Drag.attach(r.tray, '.counter, .tile', {
      can: function () { return !r.locked() && (step === 1 || step === 2); },
      drop: drop
    });

    function start(w, n, opts) {
      word = w;
      step = 1;
      my++;
      Boxes.render(w, tapBox);
      Boxes.setNext(0);
      r.showPicture(w);
      r.setHear('Hear the word');
      r.prompt('boxes');
      counters();
      Sound.preload(SB.tiles(w).map(SB.soundClip).concat([SB.wordClip(w), 'phrases/boxes', 'phrases/letters']));
      if (!opts.speak) return;
      r.after(300, function () {
        if (!opts.intro) return wordNow();
        Sound.say('phrases/boxes').then(function (ok) { if (ok) r.after(400, wordNow); });
      });
    }

    return {
      start: start,
      /* Drops a move to the letters still waiting, e.g. when the child switches to Blend. */
      stop: function () { my++; },
      hear: wordNow,
      directions: function () { return step === 1 ? 'boxes' : step === 2 ? 'letters' : null; },
      card: wordNow
    };
  };
})();
