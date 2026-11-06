/* Primary Labs · Sound Boxes: what each round shows, worked out from js/words.js.
   The same word always gives the same pictures in the same places and the same letter tray, so a
   round looks the same every time a child meets it. No page code here: the tests read this file. */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});

  var VOWELS = 'aeiou';

  SB.isVowel = function (letter) { return VOWELS.indexOf(letter) !== -1; };

  /* The clip id for a letter's sound, and for a whole word (assets/audio/<group>/<name>). */
  SB.soundClip = function (letter) { return 'sounds/' + (SB.SOUND_CLIP[letter] || letter); };
  SB.wordClip = function (word) { return 'words/' + word; };

  SB.level = function (id) {
    for (var i = 0; i < SB.LEVELS.length; i++) if (SB.LEVELS[i].id === id) return SB.LEVELS[i];
    return null;
  };

  /* Where two words of the same length differ: the list of positions. */
  SB.differ = function (a, b) {
    var at = [];
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) at.push(i);
    return at;
  };

  /* Where the right picture goes (0 left, 1 middle, 2 right) for the 1st, 2nd, ... word of a level:
     never the same place twice in a row, also when a level of 4, 5, 6 or 10 words starts again, and
     each place about as often, so there is no side to learn. A level has at most this many words. */
  SB.PLACES = [1, 0, 2, 0, 2, 0, 1, 2, 1, 2];

  /* Blend's three pictures, in order, for the nth word of a level. */
  SB.choices = function (word, n) {
    var list = SB.WORDS[word].near.slice();
    list.splice(SB.PLACES[n % SB.PLACES.length], 0, word);
    return list;
  };

  /* Segment's letter tray: the word's letters and its extra letters, in a-to-z order, so each
     letter is always in the same place and easy to find. */
  SB.tiles = function (word) {
    var seen = {};
    return (word + SB.WORDS[word].extra).split('').filter(function (l) {
      if (seen[l]) return false;
      seen[l] = true;
      return true;
    }).sort();
  };
})(typeof window !== 'undefined' ? window : this);
