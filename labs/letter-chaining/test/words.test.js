// The tiles and the word list: every word is built from real tiles, has the right shape, and is safe.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

// Arrays made inside the page's sandbox aren't deepEqual to arrays made here; copy them first.
const plain = (x) => JSON.parse(JSON.stringify(x));

const PL = load('js/data.js', 'js/words.js');

test('every tile has a group, sounds, a clip name and a keyword', () => {
  const groups = PL.GROUPS.map((g) => g.id);
  for (const t of PL.TILES) {
    assert.ok(groups.includes(t.group), t.id);
    assert.ok(t.ipa.length && t.ipa.every(Boolean), t.id);
    assert.match(t.sound, /^[a-z_]+$/, t.id);
    assert.match(t.keyword, /^[a-z]+$/, t.id);
  }
  assert.equal(new Set(PL.TILE_IDS).size, PL.TILE_IDS.length);
});

test('tiles that share a clip say the same sound', () => {
  const by = {};
  for (const t of PL.TILES) {
    if (by[t.sound]) assert.deepEqual(plain(t.ipa), plain(by[t.sound]), t.id + ' and its clip ' + t.sound);
    else by[t.sound] = t.ipa;
  }
});

test('every word is consonant-vowel-consonant (or two tiles), spelled the way its tiles say', () => {
  const words = PL.bankWords();
  assert.ok(words.length > 900);
  for (const w of words) {
    const tiles = PL.WORDBANK[w].tiles;
    for (const t of tiles) assert.ok(PL.tile(t), w + ': unknown tile ' + t);
    const kinds = tiles.map((t) => PL.tile(t).kind);
    if (tiles.length === 3) assert.deepEqual(plain(kinds), ['consonant', 'vowel', 'consonant'], w);
    else {
      assert.equal(tiles.length, 2, w);
      assert.deepEqual(plain(kinds.slice().sort()), ['consonant', 'vowel'], w);
    }
    assert.equal(PL.spell(tiles), w);
    assert.deepEqual(plain(PL.split(w)), plain(tiles), w);
  }
});

test('no word in the list is blocked', () => {
  for (const w of PL.bankWords()) assert.equal(PL.isBlocked(PL.WORDBANK[w].tiles), false, w);
});

test('made-up words use short vowels only', () => {
  for (const w of PL.bankWords()) {
    if (PL.WORDBANK[w].real) continue;
    assert.ok(PL.WORDBANK[w].tiles.some((t) => PL.tile(t).group === 'short'), w);
  }
});

test("made-up words don't sound like a real word", () => {
  const sound = (w) => PL.phones(PL.WORDBANK[w].tiles).join('');
  const real = new Set(PL.bankWords().filter((w) => PL.WORDBANK[w].real).map(sound));
  // Real words the pronouncing dictionary says another way: catch is also /kætʃ/.
  for (const s of PL.SOUNDS_LIKE_REAL) real.add(s);
  for (const w of PL.bankWords()) {
    if (!PL.WORDBANK[w].real) assert.ok(!real.has(sound(w)), w + ' sounds like a real word');
  }
});

test('the start set keeps the built-in chains and their words', () => {
  for (const c of PL.CHAINS) {
    for (const w of c.words) {
      assert.ok(PL.isWord(w), w);
      assert.ok(PL.split(w).every((t) => PL.START_SET.includes(t)), w);
    }
    for (let i = 1; i < c.words.length; i++) assert.notEqual(PL.changedIndex(c.words[i - 1], c.words[i]), -1, c.name);
  }
});

test('words with a sentence are in the list', () => {
  for (const w of Object.keys(PL.WORDS)) if (PL.WORDS[w].sentence) assert.ok(PL.isWord(w), w);
});

test('typed words split into tiles, with silent e', () => {
  assert.deepEqual(plain(PL.split('ship')), ['sh', 'i', 'p']);
  assert.deepEqual(plain(PL.split('cake')), ['c', 'a_e', 'k']);
  assert.deepEqual(plain(PL.split('night')), ['n', 'igh', 't']);
  assert.deepEqual(plain(PL.split('quiz')), ['qu', 'i', 'z']);
  assert.deepEqual(plain(PL.split('zog')), ['z', 'o', 'g']);
  assert.deepEqual(plain(PL.split('chope')), ['ch', 'o_e', 'p']);
});

test('blocking works by spelling and by sound', () => {
  assert.ok(PL.isBlocked(['f', 'u', 'ck']));
  assert.ok(PL.isBlocked(['f', 'u', 'k']));   // sounds the same when blended
  assert.ok(PL.isBlocked('rape'));
  assert.ok(!PL.isBlocked('shirt'));
  assert.ok(!PL.isBlocked('pup'));
  assert.ok(!PL.isBlocked('pea'));
});

test('teacher chains: tiles, old letter-by-letter chains, and errors', () => {
  assert.deepEqual(plain(PL.validateChain('chip, ship, shop').words), ['chip', 'ship', 'shop']);
  assert.equal(PL.validateChain('cap, cape, tape').ok, true);
  assert.equal(PL.validateChain('rain, ran').ok, true);            // ai → a is one tile
  assert.equal(PL.validateChain('rain, rat').ok, false);           // two tiles change
  const old = PL.validateChain('cat, cot, zot');
  assert.equal(old.ok, true);
  assert.equal(old.split, 'tiles');
  assert.equal(PL.validateChain('ship, shop, shot').ok, true);
  assert.equal(PL.validateChain('cat, fuk').ok, false);
  assert.equal(PL.validateChain('cat').ok, false);
});

test('a tile is asked about only if no other tile in the word shares its sound', () => {
  assert.equal(PL.soundOnce(['c', 'a', 't'], 0), true);
  assert.equal(PL.soundOnce(['b', 'o', 'x'], 2), true);
  assert.equal(PL.soundOnce(['c', 'a_e', 'k'], 0), false); // k is /k/ too
  assert.equal(PL.soundOnce(['s', 'i', 'x'], 0), false);   // x is /ks/
  assert.equal(PL.soundOnce(['s', 'i', 'x'], 2), false);
  assert.equal(PL.soundOnce(['qu', 'i', 'ck'], 0), false);
  assert.equal(PL.soundOnce(['d', 'a', 'd'], 0), false);
});
