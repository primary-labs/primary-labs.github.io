/* Primary Labs · Sound Boxes: Blend.
   The child hears the word's sounds one at a time, each box lighting as its sound plays, and can
   tap any box to hear its sound again. Then they tap the matching picture out of three. The two
   wrong pictures are one sound away from the word, so every sound matters. A right pick says the
   word, puts its letters in the boxes and shows its picture. A wrong pick fades that picture where
   it is and plays the sounds again, calmly. */
(function () {
  'use strict';
  var SB = window.SB;
  var ui = SB.ui, Boxes = SB.Boxes, Sound = SB.Sound, Art = SB.Art;

  SB.Blend = function (r) {
    var word = '', solved = false, wrong = {};

    /* The sounds, each box lit as it plays; once solved, then the whole word. */
    function sounds() {
      return Boxes.sayAll().then(function (ok) {
        if (ok && solved) r.after(300, function () { Sound.say(SB.wordClip(word)); });
        return ok;
      });
    }

    function hear() { r.quiet(); sounds(); }

    function tapBox(i) {
      if (r.locked()) return;
      r.quiet();
      Boxes.sayOne(i);
    }

    function pick(b) {
      if (r.locked() || solved || SB.Drag.justDragged()) return;
      var w = b.dataset.word;
      r.quiet();
      if (w === word) return right(b);
      if (!wrong[w]) {
        wrong[w] = true;
        b.classList.add('is-wrong');
        b.setAttribute('aria-disabled', 'true');
        b.tabIndex = -1;
        b.setAttribute('aria-label', w + ', not this one');
        ui.replay(b, 'shake');
        Sound.sfx.soft();
        focusFirstChoice();
      } else {
        Sound.sfx.click();
      }
      r.feedback(SB.Phrases.get('again').say);
      r.after(400, function () {
        Sound.say('phrases/again').then(function (ok) { if (ok) r.after(300, sounds); });
      });
    }

    function right(b) {
      solved = true;
      b.classList.add('is-right');
      word.split('').forEach(function (l, i) { ui.replay(Boxes.putLetter(i, l), 'pop'); });
      Boxes.done();
      r.showPicture(word);
      Sound.sfx.snap();
      r.feedback('Yes! ' + word + '.', 'yay');
      r.after(250, function () { Sound.say(SB.wordClip(word)); });
      r.finish(ui.byKeys(b));
    }

    function focusFirstChoice() {
      var next = r.tray.querySelector('.choice:not(.is-wrong)');
      if (next && r.tray.contains(document.activeElement)) ui.focusOn(next);
    }

    function start(w, n, opts) {
      word = w;
      solved = false;
      wrong = {};
      Boxes.render(w, tapBox);
      r.showPicture(null);
      r.setHear('Hear the sounds');
      r.prompt('which');
      var tray = r.tray;
      tray.textContent = '';
      tray.className = 'tray tray--choices';
      tray.setAttribute('aria-label', 'Pictures');
      SB.choices(w, n).forEach(function (c) {
        var b = ui.button('choice', c);
        b.dataset.word = c;
        b.innerHTML = Art.picture(c);
        b.addEventListener('click', function () { pick(b); });
        tray.appendChild(b);
      });
      Sound.preload(w.split('').map(SB.soundClip).concat([SB.wordClip(w), 'phrases/which', 'phrases/again']));
      if (!opts.speak) return;
      r.after(300, function () {
        if (!opts.intro) return sounds();
        Sound.say('phrases/which').then(function (ok) { if (ok) r.after(400, sounds); });
      });
    }

    return {
      start: start,
      hear: hear,
      directions: function () { return solved ? null : 'which'; },
      card: function () { if (solved) { r.quiet(); Sound.say(SB.wordClip(word)); } else hear(); }
    };
  };
})();
