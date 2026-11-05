// The bundled clips: one MP3 and its .js wrapper for every sound, keyword, word and sentence the page uses.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const load = require('./load');

const PL = load('js/data.js', 'js/words.js');
const AUDIO = path.join(__dirname, '..', 'assets', 'audio');
const GROUPS = ['sounds', 'keywords', 'words', 'sentences'];
// Letter sounds are short bursts and hisses, so they get more bits than words.
const KBPS = { sounds: 128, keywords: 96, words: 96, sentences: 96 };

function needed() {
  const uniq = (a) => [...new Set(a)].sort();
  return {
    sounds: uniq(PL.TILES.map((t) => t.sound)),
    keywords: uniq(PL.TILES.map((t) => t.keyword)),
    words: uniq(PL.bankWords()),
    sentences: uniq(Object.keys(PL.WORDS).filter((w) => PL.WORDS[w].sentence)),
  };
}

function files(group, ext) {
  return fs.readdirSync(path.join(AUDIO, group)).filter((f) => path.extname(f) === ext).map((f) => path.basename(f, ext)).sort();
}

// Bitrate of the first MPEG audio frame, in kbps (MPEG-1, 2 and 2.5, Layer III).
function mp3Kbps(file) {
  const b = fs.readFileSync(file);
  let i = 0;
  if (b.toString('latin1', 0, 3) === 'ID3') i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  for (; i < b.length - 3; i++) {
    if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) continue;
    const version = (b[i + 1] >> 3) & 3; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layer = (b[i + 1] >> 1) & 3; // 1 = Layer III
    const index = b[i + 2] >> 4;
    if (version === 1 || layer !== 1 || index === 0 || index === 15) continue;
    const table = version === 3
      ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
      : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
    return table[index];
  }
  return null;
}

test('every clip the page uses is there, and nothing else', () => {
  const want = needed();
  for (const g of GROUPS) assert.deepEqual(files(g, '.js'), want[g], g + '/ wrappers');
});

test('clips ship as MP3, not WAV', () => {
  for (const g of GROUPS) {
    assert.deepEqual(files(g, '.wav'), [], g + '/ has WAV files');
    assert.deepEqual(files(g, '.mp3'), files(g, '.js'), g + '/ MP3s and wrappers differ');
    for (const name of files(g, '.js')) {
      const js = fs.readFileSync(path.join(AUDIO, g, name + '.js'), 'utf8');
      assert.match(js, /"audio\/mpeg"/, g + '/' + name + '.js is not wrapped from its MP3; run node tools/build-audio.js');
    }
  }
});

test('letter sounds are 128 kbps, everything else 96', () => {
  for (const g of GROUPS) {
    const off = files(g, '.mp3').filter((name) => mp3Kbps(path.join(AUDIO, g, name + '.mp3')) !== KBPS[g]);
    assert.deepEqual(off, [], g + '/ clips not at ' + KBPS[g] + ' kbps');
  }
});
