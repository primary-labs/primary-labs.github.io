'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const MM = load('js/phrases.js');
const ids = MM.Phrases.ids;

test('ids are unique, safe file names', () => {
  const all = MM.Phrases.all();
  assert.equal(new Set(all.map((p) => p.id)).size, all.length);
  for (const p of all) assert.match(p.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.id);
});

test('spoken text uses number words, not digits', () => {
  for (const p of MM.Phrases.all()) assert.doesNotMatch(p.say, /\d/, `${p.id}: ${p.say}`);
});

test('every line the app can ask for exists', () => {
  for (let n = 0; n <= 10; n++) { assert.ok(MM.Phrases.get(ids.number(n))); assert.ok(MM.Phrases.get(ids.not(n))); }
  for (const kind of ['monster', 'robot']) {
    for (const id of [ids.countAll(kind), ids.howMany(kind), ids.again(kind, false), ids.again(kind, true)]) assert.ok(MM.Phrases.get(id), id);
    for (let b = 1; b <= 9; b++) assert.ok(MM.Phrases.get(ids.takeAway(kind, b)));
  }
  for (let b = 1; b <= 9; b++) assert.ok(MM.Phrases.get(ids.gone(b)));
  assert.ok(MM.Phrases.get(ids.skip()));
});

test('sample lines read correctly', () => {
  assert.equal(MM.Phrases.get(ids.problem('+', 3, 2)).say, 'three plus two');
  assert.equal(MM.Phrases.get(ids.yes('-', 5, 2)).say, 'Yes! Five minus two is three!');
  assert.equal(MM.Phrases.get(ids.solved('+', 3, 2)).show, '3 and 2 make 5!');
  assert.equal(MM.Phrases.get(ids.takeAway('robot', 1)).say, 'Tap one robot to take it away.');
  assert.equal(MM.Phrases.get(ids.takeAway('monster', 3)).say, 'Tap three monsters to take them away.');
});
