/* Primary Labs · Sound Boxes: the words and levels.
   Every word has three sounds and three letters: consonant, short vowel, consonant.
   near: the two wrong pictures in Blend. Each is one sound away from the word (cat: hat, can),
   so a child has to listen to every sound. They are drawn, but they have no clips of their own.
   extra: the letters added to the word's letters in Segment's tray, two or three, with a vowel
   among them so the vowel is a real choice.
   Every word's clip and every letter's sound clip are copied from Letter Chains
   (tools/copy-clips.js). No page code here: the tests and tools read this file in Node. */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});

  SB.WORDS = {
    // short a
    cat: { near: ['hat', 'can'], extra: 'hni' },
    map: { near: ['mop', 'cap'], extra: 'oc' },
    bag: { near: ['bug', 'bat'], extra: 'ut' },
    pan: { near: ['can', 'pen'], extra: 'ce' },
    bat: { near: ['hat', 'bag'], extra: 'hgi' },
    can: { near: ['fan', 'cat'], extra: 'fto' },
    // short i
    pig: { near: ['wig', 'pin'], extra: 'wna' },
    wig: { near: ['pig', 'dig'], extra: 'pda' },
    lid: { near: ['kid', 'lip'], extra: 'kpa' },
    pin: { near: ['pig', 'pan'], extra: 'ga' },
    lip: { near: ['zip', 'lid'], extra: 'zdo' },
    // short o (the "ah" of dot)
    dog: { near: ['log', 'dig'], extra: 'li' },
    log: { near: ['dog', 'leg'], extra: 'de' },
    mop: { near: ['top', 'map'], extra: 'ta' },
    top: { near: ['mop', 'tap'], extra: 'ma' },
    // short u
    sun: { near: ['bun', 'sub'], extra: 'ba' },
    bug: { near: ['rug', 'bag'], extra: 'ra' },
    cup: { near: ['pup', 'cap'], extra: 'ta' },
    bus: { near: ['bug', 'bun'], extra: 'gna' },
    rug: { near: ['bug', 'mug'], extra: 'bmi' },
    // short e
    pen: { near: ['hen', 'pan'], extra: 'ha' },
    net: { near: ['jet', 'nut'], extra: 'ju' },
    leg: { near: ['log', 'peg'], extra: 'op' },
    hen: { near: ['pen', 'ten'], extra: 'pta' }
  };

  /* Levels go in this order, and each level's words always come in this order. */
  SB.LEVELS = [
    { id: 'short-a', name: 'Short a', words: ['cat', 'map', 'bag', 'pan', 'bat', 'can'] },
    { id: 'short-i', name: 'Short i', words: ['pig', 'lid', 'pin', 'wig', 'lip'] },
    { id: 'short-o', name: 'Short o', words: ['dog', 'mop', 'log', 'top'] },
    { id: 'short-u', name: 'Short u', words: ['sun', 'bug', 'cup', 'bus', 'rug'] },
    { id: 'short-e', name: 'Short e', words: ['pen', 'net', 'leg', 'hen'] },
    { id: 'mixed', name: 'Mixed', words: ['bug', 'pig', 'mop', 'net', 'cat', 'lip', 'sun', 'pen', 'dog', 'bag'] }
  ];

  /* Letter Chains names each sound clip after its tile; k shares c's clip, as there. */
  SB.SOUND_CLIP = { k: 'c' };
})(typeof window !== 'undefined' ? window : this);
