'use strict';
// The clips that ship: every word has its letter sounds and word clip, the sounds and words are
// unchanged copies of Letter Chains' (so a remake there shows up here), bitrates, and the
// directions were made from their current text.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mp3Kbps = require('./mp3');
const { needed, FROM } = require('../tools/copy-clips');
const { phrases, used } = require('../tools/list-phrases');

const AUDIO = path.join(__dirname, '..', 'assets', 'audio');

function shipped() {
  let list = null;
  vm.runInNewContext(fs.readFileSync(path.join(AUDIO, 'index.js'), 'utf8'),
    { window: { SB: { Sound: { setClips: (ids) => { list = [...ids]; } } } } });
  return list;
}
const mp3s = (group) => fs.readdirSync(path.join(AUDIO, group)).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();

test('every word has its word clip and a sound clip for every letter its tray shows', () => {
  const have = new Set(shipped());
  const { words, letters, SB } = used();
  for (const w of words) assert.ok(have.has(SB.wordClip(w)), `${w}: no word clip`);
  for (const l of letters) assert.ok(have.has(SB.soundClip(l)), `${l}: no sound clip`);
});

test('sounds and words are byte-identical to Letter Chains\' clips', () => {
  for (const group of ['sounds', 'words']) {
    for (const name of mp3s(group)) {
      const ours = fs.readFileSync(path.join(AUDIO, group, name + '.mp3'));
      const src = path.join(FROM, group, name + '.mp3');
      assert.ok(fs.existsSync(src), `${group}/${name}: Letter Chains has no such clip`);
      assert.ok(ours.equals(fs.readFileSync(src)),
        `${group}/${name}.mp3 differs from Letter Chains' clip. Run node tools/copy-clips.js, then node tools/build-audio.js`);
    }
  }
});

test('only the sounds and words the levels use are copied', () => {
  const need = needed();
  assert.deepEqual(mp3s('sounds'), [...need.sounds]);
  assert.deepEqual(mp3s('words'), [...need.words]);
});

test('the shipped clip list matches the clips on disk', () => {
  const onDisk = ['sounds', 'words', 'phrases'].flatMap((g) =>
    fs.readdirSync(path.join(AUDIO, g)).filter((f) => f.endsWith('.js')).map((f) => g + '/' + f.slice(0, -3))).sort();
  assert.deepEqual(shipped().sort(), onDisk, 'run node tools/build-audio.js');
});

test('every direction has a clip made from its current text', () => {
  const have = new Set(shipped());
  const made = JSON.parse(fs.readFileSync(path.join(AUDIO, 'made-from.json'), 'utf8'));
  for (const p of phrases()) {
    assert.ok(have.has('phrases/' + p.id), `${p.id}: no clip (make it with tools/voice/sound_boxes.py)`);
    assert.equal(made[p.id], p.text, `${p.id}: the clip was made from "${made[p.id]}". Remake it (tools/voice/sound_boxes.py --only ${p.id}), then run node tools/build-audio.js --from <manifest.json>`);
  }
});

test('clips ship as MP3: letter sounds at 128 kbps, words and directions at 96', () => {
  const want = { sounds: 128, words: 96, phrases: 96 };
  for (const [group, kbps] of Object.entries(want)) {
    const dir = path.join(AUDIO, group);
    assert.deepEqual(fs.readdirSync(dir).filter((f) => f.endsWith('.wav')), [], `${group}/ has WAV files`);
    const names = mp3s(group);
    assert.ok(names.length > 0, `${group}/ has no clips`);
    const off = names.filter((n) => mp3Kbps(path.join(dir, n + '.mp3')) !== kbps);
    assert.deepEqual(off, [], `${group}/ clips not at ${kbps} kbps`);
  }
});
