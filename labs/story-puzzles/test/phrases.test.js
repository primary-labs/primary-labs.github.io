'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const SP = load('js/stories.js', 'js/phrases.js');
const ids = SP.Phrases.ids;

test('ids are unique, safe file names', () => {
  const all = SP.Phrases.all();
  assert.equal(new Set(all.map((p) => p.id)).size, all.length);
  for (const p of all) assert.match(p.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.id);
});

test('every line the app can ask for exists', () => {
  for (const id of [ids.intro(), ids.notIn(), ids.done()]) assert.ok(SP.Phrases.get(id), id);
  for (const s of SP.STORIES) {
    assert.equal(SP.Phrases.get(ids.start(s)).say, 'Let\'s read ' + s.title + '.');
    s.lines.forEach((line, n) => assert.equal(SP.Phrases.get(ids.line(s, n)).say, line));
  }
});

test('spoken text has no digits', () => {
  for (const p of SP.Phrases.all()) assert.doesNotMatch(p.say, /\d/, `${p.id}: ${p.say}`);
});

test('sample ids', () => {
  assert.equal(ids.line(SP.story('fat-cat'), 0), 'fat-cat-1');
  assert.equal(ids.start(SP.story('pond')), 'pond-start');
  assert.equal(SP.Phrases.get('fat-cat-start').say, 'Let\'s read The Fat Cat.');
  assert.equal(SP.Phrases.get('fat-cat-3').say, 'The cat naps on a mat.');
});
