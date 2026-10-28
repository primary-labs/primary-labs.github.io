/* Primary Labs · Letter Chains — lesson content
   Letters in this set: short a, short i, short o, t, d, c, g, n */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  PL.LETTERS = [
    { id: 'a', kind: 'vowel', label: 'short a', keyword: 'apple', art: 'apple',
      tip: 'Say /ă/ as in apple. Open your mouth wide and keep it short.' },
    { id: 'i', kind: 'vowel', label: 'short i', keyword: 'igloo', art: 'igloo',
      tip: 'Say /ĭ/ as in igloo. Smile a little and keep it short.' },
    { id: 'o', kind: 'vowel', label: 'short o', keyword: 'octopus', art: 'octopus',
      tip: 'Say /ŏ/ as in octopus. Make a round "O" with your mouth.' },
    { id: 't', kind: 'consonant', label: 't', keyword: 'top', art: 'top',
      tip: 'Say a quick, crisp /t/. Try not to add "uh" (not "tuh").' },
    { id: 'd', kind: 'consonant', label: 'd', keyword: 'duck', art: 'duck',
      tip: 'Say a quick /d/. Try not to add "uh" (not "duh").' },
    { id: 'c', kind: 'consonant', label: 'c', keyword: 'cup', art: 'cup',
      tip: 'Say the hard /k/ sound, as in cup. Keep it short and clipped.' },
    { id: 'g', kind: 'consonant', label: 'g', keyword: 'goat', art: 'goat',
      tip: 'Say the hard /g/ sound, as in goat. Keep it short and clipped.' },
    { id: 'n', kind: 'consonant', label: 'n', keyword: 'nest', art: 'nest',
      tip: 'Hum /nnn/ through your nose for about one second.' }
  ];

  PL.LETTER_IDS = PL.LETTERS.map(function (l) { return l.id; });
  PL.VOWELS = ['a', 'i', 'o'];             // the vowels this lesson teaches
  PL.ALL_VOWELS = ['a', 'e', 'i', 'o', 'u']; // tile colors for teacher-made words
  PL.ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

  /* Every word a child can meet. `art` is optional; abstract words have none. */
  PL.WORDS = {
    cat: { art: 'cat', sentence: 'The cat naps in the sun.' },
    cot: { art: 'cot', sentence: 'I can nap on a cot.' },
    dot: { art: 'dot', sentence: 'Draw a big red dot.' },
    dog: { art: 'dog', sentence: 'The dog wags its tail.' },
    dig: { art: 'dig', sentence: 'We dig in the sand.' },
    did: { sentence: 'I did it!' },
    dad: { art: 'dad', sentence: 'Dad gives me a hug.' },
    can: { art: 'can', sentence: 'The soup is in a can.' },
    tan: { art: 'tan', sentence: 'The sand is tan.' },
    tin: { art: 'tin', sentence: 'The cookies are in a tin.' },
    ton: { art: 'ton', sentence: 'A ton is very, very heavy!' },
    tot: { art: 'tot', sentence: 'A tot is a little kid.' },
    not: { sentence: 'The soup is not hot.' },
    nod: { art: 'nod', sentence: 'Nod your head to say yes.' },
    tag: { art: 'tag', sentence: 'The tag is on the gift.' },
    tad: { sentence: 'Add a tad of salt. (A tad means a little bit.)' },
    gig: { art: 'gig', sentence: 'The band plays a gig.' },
    cod: { art: 'cod', sentence: 'A cod is a fish.' },
    cog: { art: 'cog', sentence: 'A cog is a wheel with teeth.' },
    got: { sentence: 'I got a new hat.' }
  };

  /* Each step changes exactly ONE sound: beginning, middle, or end. */
  PL.CHAINS = [
    { id: 'c1', name: 'Cat to Dad', words: ['cat', 'cot', 'dot', 'dog', 'dig', 'did', 'dad'] },
    { id: 'c2', name: 'Can to Nod', words: ['can', 'tan', 'tin', 'ton', 'tot', 'not', 'nod'] },
    { id: 'c3', name: 'Tag to Gig', words: ['tag', 'tad', 'dad', 'did', 'dig', 'gig'] },
    { id: 'c4', name: 'Short o Trail', words: ['dog', 'dot', 'cot', 'cod', 'nod', 'not', 'tot'] },
    { id: 'c5', name: 'Mix It Up', words: ['tin', 'tan', 'can', 'cat', 'cot', 'cog', 'dog'] }
  ];

  /* Letter combos that should never be shown to kids, from teachers or from tiles kids tap. */
  PL.BLOCKED = [
    'tit', 'git', 'cig', 'gin', 'nit', 'dic', 'nig', 'coc',
    'ass', 'azz', 'cum', 'kum', 'cok', 'dik', 'dix', 'fag', 'fap', 'fuc', 'fuk', 'fux', 'fu',
    'gyp', 'ho', 'jap', 'jiz', 'kkk', 'kys', 'pis', 'sex', 'sux', 'vag', 'wop', 'wtf', 'xxx'
  ];

  PL.POSITIONS = [
    { key: 'beginning', light: 'go' },
    { key: 'middle', light: 'slow' },
    { key: 'end', light: 'stop' }
  ];

  PL.letter = function (id) {
    for (var i = 0; i < PL.LETTERS.length; i++) if (PL.LETTERS[i].id === id) return PL.LETTERS[i];
    return null;
  };

  PL.isVowel = function (ch) { return PL.ALL_VOWELS.indexOf(ch) !== -1; };

  /* Which of PL.POSITIONS each tile of a word sits in. Two-letter words have a beginning and an end. */
  PL.positionsFor = function (len) { return len === 2 ? [0, 2] : [0, 1, 2]; };
  PL.positionAt = function (i, len) { return PL.positionsFor(len)[i]; };

  /* Returns the index that changed between two same-length words, or -1 if not exactly one. */
  PL.changedIndex = function (from, to) {
    if (!from || !to || from.length !== to.length) return -1;
    var idx = -1;
    for (var i = 0; i < from.length; i++) {
      if (from[i] !== to[i]) {
        if (idx !== -1) return -1;
        idx = i;
      }
    }
    return idx;
  };

  /* Words with a bundled clip: consonant, vowel, consonant from this letter set, minus blocked
     words. Each one has a clip in assets/audio/words/. Teacher-made words outside this set use
     the teacher's recording, or the device voice if there isn't one. */
  PL.isWord = function (w) {
    return /^[a-z]{3}$/.test(w) &&
      PL.LETTER_IDS.indexOf(w[0]) !== -1 && PL.LETTER_IDS.indexOf(w[2]) !== -1 &&
      !PL.isVowel(w[0]) && PL.isVowel(w[1]) && !PL.isVowel(w[2]) &&
      PL.BLOCKED.indexOf(w) === -1;
  };
  PL.cvcWords = function () {
    var out = [];
    var cons = PL.LETTER_IDS.filter(function (l) { return !PL.isVowel(l); });
    cons.forEach(function (a) {
      PL.VOWELS.forEach(function (v) {
        cons.forEach(function (b) { if (PL.isWord(a + v + b)) out.push(a + v + b); });
      });
    });
    return out;
  };

  /* Validates a teacher-made chain. Returns { ok, words, error }.
     Words are 2 or 3 letters, any letters. Each step changes exactly one letter. */
  PL.validateChain = function (raw) {
    var words = String(raw || '')
      .toLowerCase()
      .split(/[\s,>→\-–—]+/)
      .filter(Boolean);
    if (words.length < 2) return { ok: false, error: 'Type at least two words, like: cat, cot, dot' };
    if (words.length > 12) return { ok: false, error: 'Keep chains to 12 words or fewer.' };
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!/^[a-z]+$/.test(w)) return { ok: false, error: '"' + w + '" should use only the letters a to z.' };
      if (w.length < 2 || w.length > 3) return { ok: false, error: '"' + w + '" needs to be 2 or 3 letters.' };
      if (PL.BLOCKED.indexOf(w) !== -1) return { ok: false, error: '"' + w + '" is not a good fit for kids. Try another word.' };
      if (i > 0 && words[i - 1].length !== w.length) {
        return { ok: false, error: 'Keep every word in a chain the same length. "' + words[i - 1] + '" and "' + w + '" are not.' };
      }
      if (i > 0 && PL.changedIndex(words[i - 1], w) === -1) {
        return { ok: false, error: '"' + words[i - 1] + '" → "' + w + '" should change exactly one letter.' };
      }
    }
    return { ok: true, words: words };
  };
})();
