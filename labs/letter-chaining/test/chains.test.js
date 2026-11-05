// Chains built from a teacher's tiles.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

// Arrays made inside the page's sandbox aren't deepEqual to arrays made here; copy them first.
const plain = (x) => JSON.parse(JSON.stringify(x));

const PL = load('js/data.js', 'js/words.js', 'js/chains.js', 'js/art.js', 'js/pictures.js');

const SETS = [
  PL.START_SET,
  'a e i o u b c d f g h j k l m n p qu r s t v w x y z'.split(' '),
  'a i o b c d f h l m n p r s t sh ch th ck ng nk'.split(' '),
  'a e i o ai ay ee ea oa igh b d f g h l m n p r s t sh ch'.split(' '),
  'a i o a_e i_e o_e u_e b c d f h k l m n p r s t v'.split(' '),
  'a o oo ow ou oi oy ar or er ir ur b c d f h k l m n p s t sh ch th'.split(' '),
  PL.TILE_IDS
];

function check(chain, tiles, madeUp) {
  assert.ok(chain.words.length >= 4 && chain.words.length <= 7, chain.name);
  assert.equal(new Set(chain.words).size, chain.words.length, chain.name + ' repeats a word');
  assert.ok(PL.WORDBANK[chain.words[0]].real, chain.name + ' starts on a made-up word');
  assert.ok(PL.WORDBANK[chain.words.at(-1)].real, chain.name + ' ends on a made-up word');
  let made = 0;
  chain.words.forEach((w, i) => {
    const e = PL.WORDBANK[w];
    assert.ok(e, w);
    assert.ok(e.tiles.every((t) => tiles.includes(t)), w + ' uses a tile that is off');
    assert.ok(!PL.isBlocked(e.tiles), w);
    if (!e.real) made++;
    if (i) {
      const before = PL.WORDBANK[chain.words[i - 1]].tiles;
      assert.notEqual(PL.changedIndex(before, e.tiles), -1, chain.words[i - 1] + ' → ' + w);
      assert.notEqual(PL.phones(before).join(''), PL.phones(e.tiles).join(''), chain.words[i - 1] + ' → ' + w + ' sound the same');
    }
  });
  assert.ok(made <= (madeUp ? 2 : 0), chain.name + ' has ' + made + ' made-up words');
}

test('every chain changes one tile and its sound per step, using only the chosen tiles', () => {
  for (const tiles of SETS) {
    for (const madeUp of [false, true]) {
      for (const seed of [1, 2, 3]) {
        const chains = PL.buildChains(tiles, { madeUp, seed });
        assert.ok(chains.length >= 4, tiles.join(' ') + ': only ' + chains.length + ' chains');
        chains.forEach((c) => check(c, tiles, madeUp));
      }
    }
  }
});

test('the same tiles and seed give the same chains; a new seed changes them', () => {
  const tiles = SETS[2];
  const a = PL.buildChains(tiles, { seed: 4 }).map((c) => c.words.join(' '));
  const b = PL.buildChains(tiles, { seed: 4 }).map((c) => c.words.join(' '));
  const c = PL.buildChains(tiles, { seed: 5 }).map((x) => x.words.join(' '));
  assert.deepEqual(plain(a), plain(b));
  assert.notDeepEqual(plain(a), plain(c));
});

test('chains practice the newer tiles a teacher turns on', () => {
  const chains = PL.buildChains(SETS[5], { seed: 1 });
  const focus = new Set(['oo', 'ow', 'ou', 'oi', 'oy', 'ar', 'or', 'er', 'ir', 'ur']);
  const words = chains.flatMap((c) => c.words);
  const hits = words.filter((w) => PL.WORDBANK[w].tiles.some((t) => focus.has(t)));
  assert.ok(hits.length >= words.length / 2, hits.length + ' of ' + words.length);
});

function noRepeats(chains, label) {
  const seen = new Set();
  for (const c of chains) {
    const key = c.words.join(' '), back = c.words.slice().reverse().join(' ');
    assert.ok(!seen.has(key) && !seen.has(back), label + ': ' + key + ' twice');
    seen.add(key);
  }
}

test('small and random tile choices: chains end on real words and are never repeated', () => {
  // Found by hand: one made-up word kept the end of the chain, and four of five chains were the same.
  const cases = [
    { tiles: 'w h n or e ng'.split(' '), madeUp: true, seed: 1 },
    { tiles: PL.START_SET.concat(['j', 'oi']), madeUp: true, seed: 2 }
  ];
  let r = 12345;
  const rnd = () => ((r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const pick = (list, n) => list.slice().sort(() => rnd() - 0.5).slice(0, n);
  const vowels = PL.TILE_IDS.filter((t) => PL.isVowel(t)), cons = PL.TILE_IDS.filter((t) => !PL.isVowel(t));
  for (let i = 0; i < 300; i++) {
    cases.push({ tiles: pick(vowels, 1 + Math.floor(rnd() * 4)).concat(pick(cons, 3 + Math.floor(rnd() * 8))), madeUp: rnd() < 0.7, seed: 1 + Math.floor(rnd() * 5) });
  }
  for (const { tiles, madeUp, seed } of cases) {
    const label = tiles.join(' ') + (madeUp ? ' +made-up' : '') + ' seed ' + seed;
    const chains = PL.buildChains(tiles, { madeUp, seed });
    chains.forEach((c) => check(c, tiles, madeUp));
    noRepeats(chains, label);
  }
});

test('too few tiles give no chains', () => {
  assert.deepEqual(plain(PL.buildChains(['a', 't'], { seed: 1 })), []);
});
