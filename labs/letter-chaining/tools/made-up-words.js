#!/usr/bin/env node
/* Lists made-up words for js/words.js: short-vowel words (consonant, vowel, consonant) that are not
 * in the dictionary, don't sound like a real word, and aren't blocked.
 *
 *   node tools/made-up-words.js [--dict /usr/share/dict/words] [--prons path/to/misaki/us_gold.json]
 *                               [--count 300]
 *
 * --prons is misaki's pronouncing dictionary (in the voice tool's venv, under
 * site-packages/misaki/data/). With it, words that sound like a real word ("kat") are left out too.
 * The picks are seeded, so the same inputs give the same list. A person reads the list before it
 * goes into js/words.js. */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

function arg(name, fallback) {
  var i = process.argv.indexOf('--' + name);
  return i === -1 ? fallback : process.argv[i + 1];
}

var sb = { window: {} };
vm.createContext(sb);
['data.js', 'words.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), sb);
});
var PL = sb.window.PL;

// Beginnings and ends real short-vowel words use. No k (c and ck spell /k/), no r or l at the end
// (they change the vowel), and no v, j, h, w, y, wh or qu at the end (English doesn't end that way).
var START = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'l', 'm', 'n', 'p', 'qu', 'r', 's', 't', 'v', 'w', 'y', 'z', 'sh', 'ch', 'th', 'wh'];
var END = ['b', 'd', 'f', 'g', 'm', 'n', 'p', 's', 't', 'x', 'z', 'ck', 'sh', 'ch', 'th', 'ng', 'nk'];
var VOWELS = ['a', 'e', 'i', 'o', 'u'];

var dict = {};
fs.readFileSync(arg('dict', '/usr/share/dict/words'), 'utf8').split('\n').forEach(function (w) { dict[w.trim().toLowerCase()] = true; });

// misaki -> plain IPA, without stress, so sounds can be compared with PL.phones()
var sounds = {};
var prons = arg('prons');
if (prons) {
  var MAP = { A: 'eɪ', I: 'aɪ', W: 'aʊ', Y: 'ɔɪ', O: 'oʊ', 'ʤ': 'dʒ', 'ʧ': 'tʃ', 'ᵊ': 'ə', 'ɾ': 't' };
  var raw = JSON.parse(fs.readFileSync(prons, 'utf8'));
  Object.keys(raw).forEach(function (w) {
    var v = raw[w];
    var list = typeof v === 'string' ? [v] : Object.keys(v || {}).map(function (k) { return v[k]; });
    list.forEach(function (p) {
      if (typeof p !== 'string') return;
      var ipa = p.replace(/[ˈˌ]/g, '').split('').map(function (c) { return MAP[c] || c; }).join('');
      sounds[ipa] = true;
      sounds[ipa.replace(/ɔ/g, 'ɑ')] = true; // dog and dot share a vowel in this lab
    });
  });
}

var real = {};
PL.bankWords().forEach(function (w) { if (PL.WORDBANK[w].real) real[PL.phones(PL.WORDBANK[w].tiles).join('')] = true; });
PL.SOUNDS_LIKE_REAL.forEach(function (ph) { real[ph] = true; });

var cands = [];
START.forEach(function (a) {
  VOWELS.forEach(function (v) {
    END.forEach(function (b) {
      var tiles = [a, v, b];
      var w = PL.spell(tiles);
      var ph = PL.phones(tiles).join('');
      if (dict[w] || PL.isBlocked(tiles) || real[ph] || sounds[ph]) return;
      if (PL.WORDBANK[w] && PL.WORDBANK[w].real) return;
      cands.push(tiles);
    });
  });
});

// Seeded shuffle, then keep a spread: every start and end tile shows up.
var seed = 7;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
for (var i = cands.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = cands[i]; cands[i] = cands[j]; cands[j] = t; }
var count = Number(arg('count', 300));
var used = {}, out = [];
function key(t) { return t.join('.'); }
// Every made-up word for the lesson's first set that passes the checks above is kept.
cands.forEach(function (t) {
  var start = PL.START_SET;
  if (t.every(function (x) { return start.indexOf(x) !== -1; })) { out.push(t); used[key(t)] = true; }
});
var perStart = {}, perEnd = {};
cands.forEach(function (t) {
  if (used[key(t)] || out.length >= count) return;
  if ((perStart[t[0]] || 0) >= Math.ceil(count / START.length) || (perEnd[t[2]] || 0) >= Math.ceil(count / END.length) + 2) return;
  perStart[t[0]] = (perStart[t[0]] || 0) + 1;
  perEnd[t[2]] = (perEnd[t[2]] || 0) + 1;
  out.push(t);
  used[key(t)] = true;
});
out.sort(function (a, b) { return key(a) < key(b) ? -1 : 1; });
console.log(out.map(key).join(' '));
console.error(out.length + ' made-up words from ' + cands.length + ' candidates.');
