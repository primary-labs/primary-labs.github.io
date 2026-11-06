'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const build = require('../tools/build-audio');
const { copy, needed, FROM } = require('../tools/copy-clips');
const { phrases } = require('../tools/list-phrases');

// A tiny valid WAV: 8-bit mono, 8 kHz, 4 samples of silence.
function wav() {
  const b = Buffer.alloc(48);
  b.write('RIFF', 0); b.writeUInt32LE(40, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34);
  b.write('data', 36); b.writeUInt32LE(4, 40); b.fill(128, 44);
  return b;
}

function run(file) {
  const got = { clips: {}, list: null };
  const sandbox = { window: { SB: { Sound: {
    addClip: (id, type, b64) => { got.clips[id] = { type, b64 }; },
    setClips: (ids) => { got.list = [...ids]; }
  } } } };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  return got;
}

test('build-audio wraps every group\'s clips and lists them', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-audio-'));
  for (const g of ['sounds', 'words', 'phrases']) fs.mkdirSync(path.join(dir, g));
  fs.writeFileSync(path.join(dir, 'sounds', 't.wav'), wav());
  fs.writeFileSync(path.join(dir, 'words', 'cat.wav'), wav());
  fs.writeFileSync(path.join(dir, 'phrases', 'which.wav'), wav());
  fs.writeFileSync(path.join(dir, 'phrases', 'not-a-phrase.wav'), wav());
  fs.writeFileSync(path.join(dir, 'words', 'gone.js'), 'stale');

  assert.equal(build(dir), 3);
  const clip = run(path.join(dir, 'words', 'cat.js'));
  assert.equal(clip.clips['words/cat'].type, 'audio/wav');
  assert.deepEqual(Buffer.from(clip.clips['words/cat'].b64, 'base64'), wav());
  assert.deepEqual(run(path.join(dir, 'index.js')).list, ['sounds/t', 'words/cat', 'phrases/which']);
  assert.ok(!fs.existsSync(path.join(dir, 'phrases', 'not-a-phrase.js')), 'unknown directions are skipped');
  assert.ok(!fs.existsSync(path.join(dir, 'words', 'gone.js')), 'stale wrappers are removed');

  // --from records the text each direction was made from, for clips that exist.
  const manifest = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifest, JSON.stringify({ clips: [{ id: 'which', text: 'Which picture?' }, { id: 'again', text: 'x' }] }));
  build(dir, manifest);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'made-from.json'), 'utf8')), { which: 'Which picture?' });
  build(dir);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'made-from.json'), 'utf8')), { which: 'Which picture?' }, 'kept without --from');
  fs.rmSync(dir, { recursive: true });
});

test('copy-clips copies exactly what the levels need and removes the rest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-copy-'));
  fs.mkdirSync(path.join(dir, 'words'));
  fs.writeFileSync(path.join(dir, 'words', 'zog.mp3'), 'old');
  const need = needed();
  assert.equal(copy(dir, FROM), need.sounds.length + need.words.length);
  assert.ok(!fs.existsSync(path.join(dir, 'words', 'zog.mp3')), 'a word no level uses is removed');
  assert.ok(need.sounds.includes('c') && !need.sounds.includes('k'), 'k uses c\'s clip');
  assert.ok(fs.readFileSync(path.join(dir, 'words', 'cat.mp3')).equals(fs.readFileSync(path.join(FROM, 'words', 'cat.mp3'))));
  fs.rmSync(dir, { recursive: true });
});

test('copy-clips stops when Letter Chains has no clip', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-copy-'));
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-from-'));
  assert.throws(() => copy(dir, empty), /Letter Chains has no clip for .*words\/cat/);
  fs.rmSync(dir, { recursive: true });
  fs.rmSync(empty, { recursive: true });
});

test('list-phrases gives every direction with its text, short and digit-free', () => {
  const list = phrases();
  assert.deepEqual(list.find((p) => p.id === 'which'), { id: 'which', text: 'Which picture?' });
  assert.ok(list.length <= 6, 'directions stay few');
  for (const p of list) {
    assert.match(p.id, /^[a-z]+(-[a-z]+)*$/, p.id);
    assert.doesNotMatch(p.text, /\d/, p.id);
    assert.ok(p.text.split(' ').length <= 7, `${p.id} is short`);
  }
});
