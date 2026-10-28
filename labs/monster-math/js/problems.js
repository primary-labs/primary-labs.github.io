/* Primary Labs · Monster Math: makes problems and answer choices. No page code. */
(function (root) {
  'use strict';
  var MM = (root.MM = root.MM || {});

  /* All problems for a mode. Adding: both numbers at least 1, sum up to max.
     Minus: start at 2 or more, take away at least 1, so at least 1 is always left. */
  function all(op, max) {
    var out = [], a, b;
    if (op === '+') { for (a = 1; a < max; a++) for (b = 1; a + b <= max; b++) out.push([a, b]); }
    else { for (a = 2; a <= max; a++) for (b = 1; b < a; b++) out.push([a, b]); }
    return out;
  }

  function key(op, a, b) { return op + a + ',' + b; }

  function shuffle(arr, rand) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* Three choices from 0 to 10: the answer plus two close numbers, smallest first. */
  function choices(ans, rand) {
    var near = shuffle([ans - 1, ans + 1, ans - 2, ans + 2, ans + 3].filter(function (n) { return n >= 0 && n <= 10; }), rand);
    var set = [ans].concat(near.slice(0, 2));
    return set.sort(function (x, y) { return x - y; });
  }

  /* A new problem, never the same as lastKey. rand is for tests; it defaults to Math.random. */
  function make(op, max, lastKey, rand) {
    rand = rand || Math.random;
    var pool = all(op, max).filter(function (p) { return key(op, p[0], p[1]) !== lastKey; });
    var p = pool[Math.floor(rand() * pool.length)];
    var a = p[0], b = p[1];
    var ans = op === '+' ? a + b : a - b;
    return { op: op, a: a, b: b, ans: ans, key: key(op, a, b), choices: choices(ans, rand) };
  }

  MM.Problems = { all: all, make: make, choices: choices };
})(typeof window !== 'undefined' ? window : this);
