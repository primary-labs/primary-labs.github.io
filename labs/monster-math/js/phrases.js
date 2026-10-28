/* Primary Labs · Monster Math: everything the page says out loud.
   Each phrase has an id (also its clip's file name, assets/audio/phrases/<id>.wav) and the text to
   say. Some also have "show", the same line written with digits for the screen.
   No page code here: tools/list-phrases.js and the tests read this file in Node. */
(function (root) {
  'use strict';
  var MM = (root.MM = root.MM || {});

  var NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  var KINDS = ['monster', 'robot'];
  var OPS = { '+': 'add', '-': 'sub' };

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function noun(kind, n) { return kind + (n === 1 ? '' : 's'); }
  function opWord(op) { return op === '+' ? 'plus' : 'minus'; }

  var table = {};
  function add(id, say, show) {
    if (table[id]) throw new Error('Duplicate phrase id ' + id);
    table[id] = { id: id, say: say, show: show || say };
    return id;
  }

  /* Ids for each kind of line. The app only ever asks for these. */
  var ids = {
    number: function (n) { return 'n-' + n; },
    not: function (n) { return 'not-' + n; },
    problem: function (op, a, b) { return 'problem-' + OPS[op] + '-' + a + '-' + b; },
    yes: function (op, a, b) { return 'yes-' + OPS[op] + '-' + a + '-' + b; },
    solved: function (op, a, b) { return 'solved-' + OPS[op] + '-' + a + '-' + b; },
    countAll: function (kind) { return 'count-all-' + kind; },
    takeAway: function (kind, b) { return 'take-away-' + kind + '-' + b; },
    howMany: function (kind) { return 'how-many-' + kind; },
    gone: function (b) { return 'gone-' + b; },
    again: function (kind, sub) { return 'again-' + kind + (sub ? '-no-x' : ''); },
    skip: function () { return 'skip'; }
  };

  var n;
  for (n = 0; n <= 10; n++) {
    add(ids.number(n), NUM[n], String(n));
    add(ids.not(n), 'Not ' + NUM[n] + '.', 'Not ' + n + '.');
  }

  function addProblem(op, a, b) {
    var ans = op === '+' ? a + b : a - b;
    add(ids.problem(op, a, b), NUM[a] + ' ' + opWord(op) + ' ' + NUM[b], a + ' ' + opWord(op) + ' ' + b);
    add(ids.yes(op, a, b),
      'Yes! ' + cap(NUM[a]) + ' ' + opWord(op) + ' ' + NUM[b] + ' is ' + NUM[ans] + '!',
      'Yes! ' + a + ' ' + opWord(op) + ' ' + b + ' is ' + ans + '!');
    add(ids.solved(op, a, b),
      op === '+' ? cap(NUM[a]) + ' and ' + NUM[b] + ' make ' + NUM[ans] + '!'
        : cap(NUM[a]) + ' minus ' + NUM[b] + ' equals ' + NUM[ans] + '!',
      op === '+' ? a + ' and ' + b + ' make ' + ans + '!' : a + ' minus ' + b + ' equals ' + ans + '!');
  }
  // Every problem MM.Problems can make: sums up to 10, differences of at least 1.
  var a, b;
  for (a = 1; a <= 9; a++) for (b = 1; b <= 10 - a; b++) addProblem('+', a, b);
  for (a = 2; a <= 10; a++) for (b = 1; b < a; b++) addProblem('-', a, b);

  KINDS.forEach(function (kind) {
    add(ids.countAll(kind), 'Tap each ' + kind + ' to count them all.');
    add(ids.howMany(kind), 'How many are left? Count the ' + noun(kind, 2) + ' with no X.');
    add(ids.again(kind, false), "Let's count again. Tap each " + kind + '.');
    add(ids.again(kind, true), "Let's count again. Tap each " + kind + ' with no X.');
    for (var t = 1; t <= 9; t++) {
      add(ids.takeAway(kind, t),
        'Tap ' + NUM[t] + ' ' + noun(kind, t) + ' to take ' + (t === 1 ? 'it' : 'them') + ' away.');
    }
  });
  for (b = 1; b <= 9; b++) add(ids.gone(b), cap(NUM[b]) + ' gone! How many are left?', b + ' gone! How many are left?');
  add(ids.skip(), 'That one has an X. Skip it.');

  MM.Phrases = {
    ids: ids,
    get: function (id) { return table[id] || null; },
    all: function () { return Object.keys(table).map(function (k) { return table[k]; }); }
  };
})(typeof window !== 'undefined' ? window : this);
