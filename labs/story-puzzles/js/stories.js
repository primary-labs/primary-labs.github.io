/* Primary Labs · Story Puzzles: the stories.
   Each story has six short lines, mostly short-vowel words a child can sound out, plus a few
   high-frequency words (SIGHT). Four picture pieces show details from the story, in story order.
   Two more pieces are not in the story. Each one differs by one sound from a story word (map for
   mat, pot for pit), so a child has to read every letter to tell them apart.
   No page code here: the tests and tools/list-phrases.js read this file in Node. */
(function (root) {
  'use strict';
  var SP = (root.SP = root.SP || {});

  /* High-frequency words the stories use that a child can't sound out with short vowels yet. */
  SP.SIGHT = ['a', 'the', 'is', 'has', 'to', 'they', 'have', 'see', 'go', 'was', 'puts'];

  SP.GROUPS = [
    { id: 'a', name: 'Short a' },
    { id: 'i', name: 'Short i' },
    { id: 'o', name: 'Short o' },
    { id: 'u', name: 'Short u' },
    { id: 'e', name: 'Short e' },
    { id: 'mix', name: 'Mixed' }
  ];

  /* pieces: { pic, line (0-5), word (as written in that line), alt }, in story order.
     others: { pic, word, near (the story word it is one sound away from), alt }. */
  SP.STORIES = [
    {
      id: 'fat-cat', title: 'The Fat Cat', group: 'a',
      lines: ['Pam has a cat.', 'The cat is fat.', 'The cat naps on a mat.', 'The cat naps in a bag.',
        'The cat naps in a pan.', 'Then the cat naps on Dad!'],
      pieces: [
        { pic: 'cat-mat', line: 2, word: 'mat', alt: 'a cat on a mat' },
        { pic: 'cat-bag', line: 3, word: 'bag', alt: 'a cat in a bag' },
        { pic: 'cat-pan', line: 4, word: 'pan', alt: 'a cat in a pan' },
        { pic: 'cat-dad', line: 5, word: 'Dad', alt: 'a cat on Dad' }
      ],
      others: [
        { pic: 'cat-map', word: 'map', near: 'mat', alt: 'a cat on a map' },
        { pic: 'cat-can', word: 'can', near: 'pan', alt: 'a cat in a can' }
      ]
    },
    {
      id: 'camp', title: 'Camp', group: 'a',
      lines: ['Max and Dad pack the van.', 'They get to camp.', 'Dad sets up a tent.',
        'Max and Dad have hot dogs.', 'Max can see a bat!', 'Then Max and Dad nap in the tent.'],
      pieces: [
        { pic: 'van', line: 0, word: 'van', alt: 'a van' },
        { pic: 'tent', line: 2, word: 'tent', alt: 'a tent' },
        { pic: 'hot-dogs', line: 3, word: 'hot dogs', alt: 'hot dogs' },
        { pic: 'bat', line: 4, word: 'bat', alt: 'a bat at night' }
      ],
      others: [
        { pic: 'fan', word: 'fan', near: 'van', alt: 'a fan' },
        { pic: 'cat', word: 'cat', near: 'bat', alt: 'a cat' }
      ]
    },
    {
      id: 'big-pig', title: 'The Big Pig', group: 'i',
      lines: ['Tim has a pig.', 'It is a big pig.', 'The pig has a wig.', 'The pig has a bib.',
        'The pig sits in a bin.', 'Then the pig digs a pit.'],
      pieces: [
        { pic: 'pig-wig', line: 2, word: 'wig', alt: 'a pig with a wig' },
        { pic: 'pig-bib', line: 3, word: 'bib', alt: 'a pig with a bib' },
        { pic: 'pig-bin', line: 4, word: 'bin', alt: 'a pig in a bin' },
        { pic: 'pig-pit', line: 5, word: 'pit', alt: 'a pig digging a pit' }
      ],
      others: [
        { pic: 'pig-pot', word: 'pot', near: 'pit', alt: 'a pig in a pot' },
        { pic: 'pig-bun', word: 'bun', near: 'bin', alt: 'a pig with a bun' }
      ]
    },
    {
      id: 'sid-digs', title: 'Sid Can Dig', group: 'i',
      lines: ['Sid can dig.', 'Sid digs and digs.', 'Sid digs up a lid.', 'Sid digs up a pin.',
        'Sid digs up a mitt.', 'Then Sid digs up a gift!'],
      pieces: [
        { pic: 'lid', line: 2, word: 'lid', alt: 'a lid' },
        { pic: 'pin', line: 3, word: 'pin', alt: 'a pin' },
        { pic: 'mitt', line: 4, word: 'mitt', alt: 'a mitt' },
        { pic: 'gift', line: 5, word: 'gift', alt: 'a gift' }
      ],
      others: [
        { pic: 'pan', word: 'pan', near: 'pin', alt: 'a pan' },
        { pic: 'mat', word: 'mat', near: 'mitt', alt: 'a mat' }
      ]
    },
    {
      id: 'dot-dog', title: 'Dot the Dog', group: 'o',
      lines: ['Dot is a dog.', 'Dot can hop.', 'Dot hops on a log.', 'Dot hops on a box.',
        'Dot hops on a rock.', 'Then Dot naps on a cot.'],
      pieces: [
        { pic: 'dog-log', line: 2, word: 'log', alt: 'a dog on a log' },
        { pic: 'dog-box', line: 3, word: 'box', alt: 'a dog on a box' },
        { pic: 'dog-rock', line: 4, word: 'rock', alt: 'a dog on a rock' },
        { pic: 'dog-cot', line: 5, word: 'cot', alt: 'a dog asleep on a cot' }
      ],
      others: [
        { pic: 'dog-sock', word: 'sock', near: 'rock', alt: 'a dog on a sock' },
        { pic: 'dog-pot', word: 'pot', near: 'cot', alt: 'a dog in a pot' }
      ]
    },
    {
      id: 'bob-box', title: "Bob's Box", group: 'o',
      lines: ['Bob has a big box.', 'A sock is in the box.', 'A mop is in the box.', 'A pot is in the box.',
        'A frog is in the box!', 'Hop, frog, hop!'],
      pieces: [
        { pic: 'sock', line: 1, word: 'sock', alt: 'a sock' },
        { pic: 'mop', line: 2, word: 'mop', alt: 'a mop' },
        { pic: 'pot', line: 3, word: 'pot', alt: 'a pot' },
        { pic: 'frog', line: 4, word: 'frog', alt: 'a frog' }
      ],
      others: [
        { pic: 'rock', word: 'rock', near: 'sock', alt: 'a rock' },
        { pic: 'map', word: 'map', near: 'mop', alt: 'a map' }
      ]
    },
    {
      id: 'the-bug', title: 'The Bug', group: 'u',
      lines: ['A bug is on a rug.', 'The bug can run.', 'The bug runs to a cup.', 'The bug runs to a bun.',
        'The bug runs and runs.', 'Then the bug sits on a duck!'],
      pieces: [
        { pic: 'bug-rug', line: 0, word: 'rug', alt: 'a bug on a rug' },
        { pic: 'bug-cup', line: 2, word: 'cup', alt: 'a bug on a cup' },
        { pic: 'bug-bun', line: 3, word: 'bun', alt: 'a bug on a bun' },
        { pic: 'bug-duck', line: 5, word: 'duck', alt: 'a bug on a duck' }
      ],
      others: [
        { pic: 'bug-bus', word: 'bus', near: 'bun', alt: 'a bug on a bus' },
        { pic: 'bug-cap', word: 'cap', near: 'cup', alt: 'a bug on a cap' }
      ]
    },
    {
      id: 'gus-pup', title: 'Gus the Pup', group: 'u',
      lines: ['Gus is a pup.', 'Gus runs in the sun.', 'Gus digs in the mud.', 'Mom puts Gus in the tub.',
        'Then the pup naps on a rug.', 'Gus is snug.'],
      pieces: [
        { pic: 'pup-sun', line: 1, word: 'sun', alt: 'a pup in the sun' },
        { pic: 'pup-mud', line: 2, word: 'mud', alt: 'a pup in mud' },
        { pic: 'pup-tub', line: 3, word: 'tub', alt: 'a pup in a tub' },
        { pic: 'pup-rug', line: 4, word: 'rug', alt: 'a pup asleep on a rug' }
      ],
      others: [
        { pic: 'pup-bug', word: 'bug', near: 'rug', alt: 'a pup and a bug' },
        { pic: 'pup-mug', word: 'mug', near: 'mud', alt: 'a pup and a mug' }
      ]
    },
    {
      id: 'red-hen', title: 'The Red Hen', group: 'e',
      lines: ['Meg has a red hen.', 'The hen sits in a pen.', 'The hen sits on an egg.', 'The hen sits on a bed.',
        'Then the hen sits on a jet!', 'Get off, hen!'],
      pieces: [
        { pic: 'hen-pen', line: 1, word: 'pen', alt: 'a hen in a pen' },
        { pic: 'hen-egg', line: 2, word: 'egg', alt: 'a hen on an egg' },
        { pic: 'hen-bed', line: 3, word: 'bed', alt: 'a hen on a bed' },
        { pic: 'hen-jet', line: 4, word: 'jet', alt: 'a hen on a jet' }
      ],
      others: [
        { pic: 'hen-pan', word: 'pan', near: 'pen', alt: 'a hen in a pan' },
        { pic: 'hen-net', word: 'net', near: 'jet', alt: 'a hen in a net' }
      ]
    },
    {
      id: 'pond', title: 'At the Pond', group: 'mix',
      lines: ['Kim and Dad go to the pond.', 'A duck is in the pond.', 'A frog sits on a log.',
        'Kim gets a fish in the net.', 'Then the sun sets.', 'It was fun!'],
      pieces: [
        { pic: 'duck-pond', line: 1, word: 'duck', alt: 'a duck in a pond' },
        { pic: 'frog-log', line: 2, word: 'frog', alt: 'a frog on a log' },
        { pic: 'fish-net', line: 3, word: 'fish', alt: 'a fish in a net' },
        { pic: 'sunset', line: 4, word: 'sun sets', alt: 'the sun setting' }
      ],
      others: [
        { pic: 'jet-pond', word: 'jet', near: 'net', alt: 'a jet over a pond' },
        { pic: 'bun-pond', word: 'bun', near: 'sun', alt: 'a bun by a pond' }
      ]
    }
  ];

  /* The words of a line, as written, without punctuation: "Hop, frog, hop!" → ["Hop", "frog", "hop"]. */
  SP.words = function (line) { return line.match(/[A-Za-z']+/g) || []; };

  /* Where a piece's word sits in its line: [first word index, word count], or null. */
  SP.findWord = function (line, word) {
    var ws = SP.words(line), want = SP.words(word);
    for (var i = 0; i + want.length <= ws.length; i++) {
      var ok = true;
      for (var k = 0; k < want.length; k++) if (ws[i + k] !== want[k]) { ok = false; break; }
      if (ok) return [i, want.length];
    }
    return null;
  };

  SP.story = function (id) {
    for (var i = 0; i < SP.STORIES.length; i++) if (SP.STORIES[i].id === id) return SP.STORIES[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : this);
