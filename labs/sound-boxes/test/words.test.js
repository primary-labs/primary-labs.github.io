'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const SB = load('js/words.js', 'js/rounds.js');
const VOWELS = 'aeiou';
const levelWords = SB.LEVELS.flatMap((lv) => [...lv.words]);

// One letter per sound: consonant, short vowel, consonant. No x (two sounds, /ks/), no q, and no
// y or w at the end, where they stop being consonant sounds.
const CVC = /^[bcdfghjklmnprstvwyz][aeiou][bcdfgklmnprstz]$/;

test('every word has three letters for three sounds: consonant, short vowel, consonant', () => {
  for (const w of Object.keys(SB.WORDS)) assert.match(w, CVC, w);
});

test('every word is in a level, and every level word is a word', () => {
  for (const w of levelWords) assert.ok(SB.WORDS[w], w);
  for (const w of Object.keys(SB.WORDS)) assert.ok(levelWords.includes(w), `${w} is in no level`);
});

test('levels: unique safe ids, no word twice, a vowel each, then mixed', () => {
  const ids = SB.LEVELS.map((lv) => lv.id);
  assert.deepEqual([...ids], ['short-a', 'short-i', 'short-o', 'short-u', 'short-e', 'mixed']);
  for (const lv of SB.LEVELS) {
    assert.equal(new Set(lv.words).size, lv.words.length, `${lv.id} repeats a word`);
    assert.ok(lv.words.length >= 4 && lv.words.length <= SB.PLACES.length, `${lv.id} has ${lv.words.length} words`);
    if (lv.id === 'mixed') continue;
    const v = lv.id.slice(-1);
    for (const w of lv.words) assert.equal(w[1], v, `${w} in ${lv.id}`);
  }
  const mixed = SB.level('mixed').words;
  for (const v of VOWELS) assert.ok(mixed.some((w) => w[1] === v), `mixed has short ${v}`);
  for (let i = 1; i < mixed.length; i++) assert.notEqual(mixed[i][1], mixed[i - 1][1], `mixed: ${mixed[i - 1]}, ${mixed[i]} share a vowel`);
});

// The same level always gives the same words in the same order (teachers plan around it).
test('level order is stable', () => {
  const order = Object.fromEntries(SB.LEVELS.map((lv) => [lv.id, lv.words.join(' ')]));
  assert.deepEqual(order, {
    'short-a': 'cat map bag pan bat can',
    'short-i': 'pig lid pin wig lip',
    'short-o': 'dog mop log top',
    'short-u': 'sun bug cup bus rug',
    'short-e': 'pen net leg hen',
    'mixed': 'bug pig mop net cat lip sun pen dog bag'
  });
});

test('every wrong picture is one sound from its word, and they differ from each other', () => {
  for (const [w, { near }] of Object.entries(SB.WORDS)) {
    assert.equal(near.length, 2, w);
    assert.notEqual(near[0], near[1], w);
    for (const n of near) {
      assert.match(n, CVC, `${w}: ${n}`);
      assert.equal(SB.differ(w, n).length, 1, `${w}: "${n}" is one sound away`);
    }
  }
});

// Pictures that children name the same way would make a round unfair (a cap reads as "hat").
test('no round shows two pictures with the same everyday name', () => {
  const sameName = [['cap', 'hat'], ['mug', 'cup'], ['pup', 'dog']];
  for (const [w, { near }] of Object.entries(SB.WORDS)) {
    const shown = [w, ...near];
    for (const [a, b] of sameName) assert.ok(!(shown.includes(a) && shown.includes(b)), `${w}: ${a} and ${b}`);
  }
});

test('extra letters: two or three, not in the word, with a vowel to choose', () => {
  for (const [w, { extra }] of Object.entries(SB.WORDS)) {
    assert.ok(extra.length >= 2 && extra.length <= 3, `${w}: ${extra}`);
    assert.equal(new Set(extra).size, extra.length, `${w}: ${extra} repeats a letter`);
    for (const l of extra) assert.ok(!w.includes(l) && /^[a-z]$/.test(l) && l !== 'x' && l !== 'q', `${w}: ${l}`);
    assert.ok([...extra].some((l) => VOWELS.includes(l)), `${w}: ${extra} has no vowel`);
  }
});

test('the letter tray is the word and its extras, a to z, the same every time', () => {
  assert.deepEqual([...SB.tiles('cat')], ['a', 'c', 'h', 'i', 'n', 't']);
  for (const w of Object.keys(SB.WORDS)) {
    const t = SB.tiles(w);
    assert.deepEqual([...t], [...t].sort(), w);
    for (const l of w) assert.ok(t.includes(l), `${w}: ${l}`);
    assert.equal(t.length, 3 + SB.WORDS[w].extra.length, w);
    assert.deepEqual([...SB.tiles(w)], [...t]);
  }
});

test('Blend: the right picture never sits in the same place twice in a row', () => {
  for (let i = 1; i < SB.PLACES.length; i++) assert.notEqual(SB.PLACES[i], SB.PLACES[i - 1]);
  for (const lv of SB.LEVELS) {
    let last = -1;
    lv.words.forEach((w, n) => {
      const c = SB.choices(w, n);
      assert.equal(c.length, 3);
      assert.deepEqual([...c].sort(), [w, ...SB.WORDS[w].near].sort(), `${lv.id} ${w}`);
      const at = c.indexOf(w);
      assert.notEqual(at, last, `${lv.id}: ${w} is where the last word was`);
      last = at;
      assert.deepEqual([...SB.choices(w, n)], [...c], 'stable');
    });
    // After the last word, Next starts the level again.
    const n = lv.words.length;
    assert.notEqual(SB.choices(lv.words[0], 0).indexOf(lv.words[0]), SB.choices(lv.words[n - 1], n - 1).indexOf(lv.words[n - 1]),
      `${lv.id}: starting again puts the right picture where the last word's was`);
  }
});

test('sound clips: k plays c, every other letter its own', () => {
  assert.equal(SB.soundClip('k'), 'sounds/c');
  assert.equal(SB.soundClip('t'), 'sounds/t');
  assert.equal(SB.wordClip('cat'), 'words/cat');
});
