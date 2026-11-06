/* Primary Labs · Sound Boxes: the three sound boxes, one for each sound of the word.
   Both activities use them. A box can be empty, hold a counter, or hold a letter. Yellow lights the
   box whose sound is playing, a yellow dashed edge marks the box to fill next, and green means the
   word is done. Every box is a button: what a tap does is up to the activity. */
(function () {
  'use strict';
  var SB = window.SB;
  var ui = SB.ui, Sound = SB.Sound;

  var list = document.getElementById('boxes');
  var word = '';
  var onTap = null;

  function box(i) { return list.querySelector('.box[data-i="' + i + '"]'); }

  function label(i) {
    var b = box(i), what = b.classList.contains('has-letter') ? 'letter ' + b.dataset.letter
      : b.classList.contains('has-counter') ? 'counter' : 'empty';
    b.setAttribute('aria-label', 'Sound ' + (i + 1) + ' of 3, ' + what);
  }

  /* Draws three empty boxes for w. tap(i) runs when box i is tapped. */
  function render(w, tap) {
    word = w;
    onTap = tap;
    list.textContent = '';
    for (var i = 0; i < w.length; i++) {
      var li = ui.el('li', 'box-cell');
      var b = ui.button('box');
      b.dataset.i = String(i);
      b.addEventListener('click', function (e) { if (onTap) onTap(+e.currentTarget.dataset.i); });
      li.appendChild(b);
      list.appendChild(li);
      label(i);
    }
    list.classList.remove('is-done');
  }

  /* While a box is lit, the dashed "fill next" edge rests (is-playing), so only one box says
     "look here" at a time. */
  function clearLit() {
    list.querySelectorAll('.is-lit').forEach(function (b) { b.classList.remove('is-lit'); });
    list.classList.remove('is-playing');
  }
  function light(i) {
    clearLit();
    box(i).classList.add('is-lit');
    list.classList.add('is-playing');
  }

  function setNext(i) {
    list.querySelectorAll('.is-next').forEach(function (b) { b.classList.remove('is-next'); });
    if (i >= 0 && box(i)) box(i).classList.add('is-next');
  }

  function empty(i) {
    var b = box(i);
    b.textContent = '';
    b.classList.remove('has-counter', 'has-letter', 'is-vowel', 'is-consonant');
    delete b.dataset.letter;
    label(i);
  }

  function putCounter(i) {
    var b = box(i);
    empty(i);
    b.classList.add('has-counter');
    b.appendChild(ui.el('span', 'counter-dot'));
    label(i);
    return b.firstChild;
  }

  function putLetter(i, letter) {
    var b = box(i);
    empty(i);
    b.classList.add('has-letter', SB.isVowel(letter) ? 'is-vowel' : 'is-consonant');
    b.dataset.letter = letter;
    b.appendChild(ui.el('span', 'box-letter', letter));
    label(i);
    return b.firstChild;
  }

  function filled(i) { var b = box(i); return b.classList.contains('has-counter') || b.classList.contains('has-letter'); }
  function firstEmpty() {
    for (var i = 0; i < word.length; i++) if (!filled(i)) return i;
    return -1;
  }

  /* The word's sounds, one after another, each box lighting as its sound plays. */
  function sayAll() {
    var ids = word.split('').map(SB.soundClip);
    return Sound.sayAll(ids, function (id, i) { light(i); }).then(function (ok) {
      if (ok) clearLit();
      return ok;
    });
  }

  /* One box's sound, with the box lit while it plays. */
  function sayOne(i) {
    light(i);
    return Sound.say(SB.soundClip(word[i])).then(function (ok) {
      if (ok) clearLit();
      return ok;
    });
  }

  function done() { setNext(-1); clearLit(); list.classList.add('is-done'); }

  /* The box under a point, or -1. */
  function at(x, y) {
    for (var i = 0; i < word.length; i++) {
      var r = box(i).getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return -1;
  }

  SB.Boxes = {
    render: render, box: box, clearLit: clearLit, setNext: setNext, empty: empty,
    putCounter: putCounter, putLetter: putLetter, filled: filled, firstEmpty: firstEmpty,
    sayAll: sayAll, sayOne: sayOne, done: done, at: at
  };
})();
