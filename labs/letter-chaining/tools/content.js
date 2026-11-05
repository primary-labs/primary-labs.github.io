#!/usr/bin/env node
/* Prints everything the voice tool needs to make this lab's clips, as JSON:
 *   tiles      id, ipa, sound (clip name), keyword
 *   sounds     one entry per bundled letter-sound clip: name, ipa, the tiles that use it
 *   words      every word in js/words.js: spelling, tiles, ipa (one entry per sound), real or made-up
 *   sentences  { word, text } for every word with a sentence
 *
 *   node tools/content.js
 * Used by ../../tools/voice/letter_chains.py. */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var sb = { window: {} };
vm.createContext(sb);
['data.js', 'words.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), sb);
});
var PL = sb.window.PL;

var sounds = {};
PL.TILES.forEach(function (t) {
  if (!sounds[t.sound]) sounds[t.sound] = { name: t.sound, ipa: t.ipa.slice(), tiles: [] };
  sounds[t.sound].tiles.push(t.id);
});

var out = {
  tiles: PL.TILES.map(function (t) { return { id: t.id, group: t.group, kind: t.kind, ipa: t.ipa, sound: t.sound, keyword: t.keyword }; }),
  sounds: Object.keys(sounds).map(function (k) { return sounds[k]; }),
  words: PL.bankWords().map(function (w) {
    var e = PL.WORDBANK[w];
    return { word: w, tiles: e.tiles, ipa: e.tiles.map(function (t) { return PL.tile(t).ipa; }), real: e.real };
  }),
  sentences: Object.keys(PL.WORDS).sort().filter(function (w) { return PL.WORDS[w].sentence; })
    .map(function (w) { return { word: w, text: PL.WORDS[w].sentence }; })
};
process.stdout.write(JSON.stringify(out));
