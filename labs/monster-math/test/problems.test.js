'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const MM = load('js/problems.js', 'js/phrases.js');
const MODES = [['+', 5], ['+', 10], ['-', 5], ['-', 10]];

test('problems stay in range for every mode', () => {
  for (const [op, max] of MODES) {
    let last = '';
    for (let i = 0; i < 2000; i++) {
      const p = MM.Problems.make(op, max, last);
      assert.ok(p.a >= 1 && p.b >= 1, `${p.key}: both numbers are at least 1`);
      if (op === '+') assert.ok(p.a + p.b <= max, `${p.key}: sum is at most ${max}`);
      else assert.ok(p.a <= max && p.ans >= 1, `${p.key}: start at most ${max}, at least 1 left`);
      assert.equal(p.ans, op === '+' ? p.a + p.b : p.a - p.b);
      assert.notEqual(p.key, last, 'same problem twice in a row');
      last = p.key;
    }
  }
});

test('every problem can come up', () => {
  for (const [op, max] of MODES) {
    const seen = new Set();
    let last = '';
    for (let i = 0; i < 5000; i++) { const p = MM.Problems.make(op, max, last); seen.add(p.key); last = p.key; }
    assert.equal(seen.size, MM.Problems.all(op, max).length, `${op} up to ${max}`);
  }
});

test('three choices, all different, 0 to 10, including the answer', () => {
  for (let ans = 0; ans <= 10; ans++) {
    for (let i = 0; i < 200; i++) {
      const c = MM.Problems.choices(ans, Math.random);
      assert.equal(c.length, 3, `answer ${ans}: ${c}`);
      assert.equal(new Set(c).size, 3, `answer ${ans}: repeats in ${c}`);
      assert.ok(c.includes(ans));
      assert.ok(c.every((n) => n >= 0 && n <= 10), `answer ${ans}: ${c}`);
      assert.deepEqual([...c], [...c].sort((x, y) => x - y), 'smallest first');
    }
  }
});

test('every problem has its spoken lines', () => {
  for (const [op, max] of [['+', 10], ['-', 10]]) {
    for (const [a, b] of MM.Problems.all(op, max)) {
      for (const kind of ['problem', 'yes', 'solved']) {
        assert.ok(MM.Phrases.get(MM.Phrases.ids[kind](op, a, b)), `${kind} ${a}${op}${b}`);
      }
    }
  }
});
