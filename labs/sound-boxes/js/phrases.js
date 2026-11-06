/* Primary Labs · Sound Boxes: the spoken directions.
   Each has an id (also its clip's file name, assets/audio/phrases/<id>.mp3) and the text to say.
   Letter sounds and words aren't here: their clips come from Letter Chains.
   No page code here: tools/list-phrases.js and the tests read this file in Node. */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});

  var LIST = [
    ['which', 'Which picture?'],
    ['again', 'Listen again.'],
    ['boxes', 'Tap a box for each sound.'],
    ['letters', 'Put the letters in the boxes.']
  ];

  var table = {};
  LIST.forEach(function (p) { table[p[0]] = { id: p[0], say: p[1] }; });

  SB.Phrases = {
    get: function (id) { return table[id] || null; },
    all: function () { return LIST.map(function (p) { return table[p[0]]; }); }
  };
})(typeof window !== 'undefined' ? window : this);
