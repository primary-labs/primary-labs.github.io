'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const SP = load('js/stories.js');
const STORIES = SP.STORIES;
const lower = (w) => w.toLowerCase();

// A word a first grader can sound out with short vowels: consonants (or sh, ch, th, wh, qu), one
// short vowel, then at least one consonant (or ck, ng, nk). Plurals and -s verbs fit too.
const C = '(?:sh|ch|th|wh|qu|[bcdfghjklmnpqrstvwxyz])';
const DECODABLE = new RegExp(`^${C}*[aeiou](?:ck|ng|nk|${C})+$`);

test('story ids are unique, safe names', () => {
  assert.equal(new Set(STORIES.map((s) => s.id)).size, STORIES.length);
  for (const s of STORIES) assert.match(s.id, /^[a-z]+(-[a-z]+)*$/, s.id);
});

test('every story is in a group, and every group has a story', () => {
  const groups = SP.GROUPS.map((g) => g.id);
  for (const s of STORIES) assert.ok(groups.includes(s.group), `${s.id}: ${s.group}`);
  for (const g of groups) assert.ok(STORIES.some((s) => s.group === g), `group ${g} has no story`);
});

test('every story has six lines, four pieces and two that are not in it', () => {
  for (const s of STORIES) {
    assert.equal(s.lines.length, 6, s.id);
    assert.equal(s.pieces.length, 4, s.id);
    assert.equal(s.others.length, 2, s.id);
    for (const line of s.lines) assert.match(line, /^[A-Z].*[.!?]$/, `${s.id}: "${line}" is a sentence`);
  }
});

test('pieces go in story order, and each word is in its line', () => {
  for (const s of STORIES) {
    let last = -1;
    for (const p of s.pieces) {
      assert.ok(p.line > last, `${s.id}: ${p.pic} comes after the piece before it`);
      last = p.line;
      assert.ok(SP.findWord(s.lines[p.line], p.word), `${s.id}: "${p.word}" is in "${s.lines[p.line]}"`);
      assert.ok(p.alt && p.alt.length > 2, `${s.id}: ${p.pic} has alt text`);
    }
  }
});

// Spelling as sounds, near enough for short-vowel words: ck is one sound, and so is a doubled letter.
const sounds = (w) => lower(w).replace(/ck/g, 'k').replace(/sh/g, 'S').replace(/(.)\1/g, '$1');

test('the pieces that do not belong are not in the story, and are one sound from a story word', () => {
  for (const s of STORIES) {
    const words = new Set(s.lines.flatMap((l) => SP.words(l).map(lower)));
    for (const o of s.others) {
      assert.ok(!words.has(lower(o.word)), `${s.id}: "${o.word}" (${o.pic}) appears in the story`);
      assert.ok(words.has(lower(o.near)), `${s.id}: "${o.near}" (near ${o.word}) is in the story`);
      const a = sounds(o.word), b = sounds(o.near);
      const diff = [...a].filter((c, i) => c !== b[i]).length;
      assert.ok(a.length === b.length && diff === 1, `${s.id}: "${o.word}" is one sound from "${o.near}"`);
      assert.ok(o.alt && o.alt.length > 2, `${s.id}: ${o.pic} has alt text`);
    }
  }
});

test('each picture appears once per story', () => {
  for (const s of STORIES) {
    const pics = [...s.pieces, ...s.others].map((p) => p.pic);
    assert.equal(new Set(pics).size, pics.length, s.id);
  }
});

test('the stories are decodable: short-vowel words plus the listed sight words', () => {
  const sight = new Set(SP.SIGHT);
  for (const s of STORIES) {
    for (const line of [s.title.replace(/'s\b/, ''), ...s.lines]) {
      for (const w of SP.words(line)) {
        const word = lower(w);
        assert.ok(sight.has(word) || DECODABLE.test(word), `${s.id}: "${w}" in "${line}"`);
      }
    }
  }
});

test('findWord finds one- and two-word matches', () => {
  assert.deepEqual([...SP.findWord('Max and Dad have hot dogs.', 'hot dogs')], [4, 2]);
  assert.deepEqual([...SP.findWord('Then the cat naps on Dad!', 'Dad')], [5, 1]);
  assert.equal(SP.findWord('The cat naps on a mat.', 'map'), null);
  assert.deepEqual([...SP.words('Hop, frog, hop!')], ['Hop', 'frog', 'hop']);
});
