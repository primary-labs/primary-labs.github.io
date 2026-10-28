/* Primary Labs home page: the "change one sound" sample in the hero.
   Uses the "Cat to Dad" chain from Letter Chains. */
(function () {
  'use strict';

  var CHAIN = ['cat', 'cot', 'dot', 'dog', 'dig', 'did', 'dad'];
  var VOWELS = 'aeiou';
  var POSITION = ['beginning', 'middle', 'end'];

  var wordEl = document.getElementById('demoWord');
  var statusEl = document.getElementById('demoStatus');
  var trailEl = document.getElementById('demoTrail');
  var btn = document.getElementById('demoBtn');
  if (!wordEl || !statusEl || !trailEl || !btn) return;

  var i = 0;

  function changedIndex(a, b) {
    for (var k = 0; k < a.length; k++) if (a[k] !== b[k]) return k;
    return -1;
  }

  function renderWord(word, changed) {
    wordEl.textContent = '';
    for (var k = 0; k < word.length; k++) {
      var s = document.createElement('span');
      s.className = 'ch ' + (VOWELS.indexOf(word[k]) > -1 ? 'ch--v' : 'ch--c') + (k === changed ? ' is-changed' : '');
      s.textContent = word[k];
      wordEl.appendChild(s);
    }
  }

  function renderTrail() {
    trailEl.textContent = '';
    for (var k = 0; k <= i; k++) {
      var li = document.createElement('li');
      li.textContent = CHAIN[k];
      if (k === i) li.setAttribute('aria-current', 'step');
      trailEl.appendChild(li);
    }
  }

  function setStatus(html) { statusEl.innerHTML = html; }

  btn.addEventListener('click', function () {
    if (i === CHAIN.length - 1) {
      i = 0;
      renderWord(CHAIN[0], -1);
      renderTrail();
      setStatus('Change one sound to make a new word. This word is <strong>cat</strong>.');
      btn.textContent = 'Change one sound';
      return;
    }
    var prev = CHAIN[i];
    i += 1;
    var next = CHAIN[i];
    var k = changedIndex(prev, next);
    renderWord(next, k);
    renderTrail();
    setStatus('The ' + POSITION[k] + ' sound changed. <strong>' + prev + '</strong> became <strong>' + next + '</strong>.');
    if (i === CHAIN.length - 1) btn.textContent = 'Start again';
  });

  btn.hidden = false;
})();
