'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const build = require('../tools/build-audio');
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
  const sandbox = { window: { MM: { Sound: {
    addClip: (id, type, b64) => { got.clips[id] = { type, b64 }; },
    setClips: (ids) => { got.list = [...ids]; }
  } } } };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  return got;
}

test('build-audio wraps clips and lists them', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-audio-'));
  const ph = path.join(dir, 'phrases');
  fs.mkdirSync(ph);
  fs.writeFileSync(path.join(ph, 'n-3.wav'), wav());
  fs.writeFileSync(path.join(ph, 'not-a-phrase.wav'), wav());
  fs.writeFileSync(path.join(ph, 'gone-9.js'), 'stale');

  assert.equal(build(dir), 1);
  const clip = run(path.join(ph, 'n-3.js'));
  assert.equal(clip.clips['n-3'].type, 'audio/wav');
  assert.deepEqual(Buffer.from(clip.clips['n-3'].b64, 'base64'), wav());
  assert.deepEqual(run(path.join(dir, 'index.js')).list, ['n-3']);
  assert.ok(!fs.existsSync(path.join(ph, 'not-a-phrase.js')), 'unknown ids are skipped');
  assert.ok(!fs.existsSync(path.join(ph, 'gone-9.js')), 'stale wrappers are removed');
  fs.rmSync(dir, { recursive: true });
});

test('the shipped clip list matches the clips on disk', () => {
  const audio = path.join(__dirname, '..', 'assets', 'audio');
  const list = run(path.join(audio, 'index.js')).list;
  const onDisk = fs.readdirSync(path.join(audio, 'phrases')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
  assert.deepEqual(list, onDisk, 'run node tools/build-audio.js');
});

test('every phrase has a clip', () => {
  const have = new Set(run(path.join(__dirname, '..', 'assets', 'audio', 'index.js')).list);
  const missing = Array.from(phrases(), (p) => p.id).filter((id) => !have.has(id)); // a plain array, not the sandbox's
  assert.deepEqual(missing, [], 'make clips with tools/voice/monster_math.py (see tools/voice/README.md)');
});

test('list-phrases gives every id with its text', () => {
  const list = phrases();
  assert.ok(list.length > 300);
  assert.deepEqual(list.find((p) => p.id === 'problem-add-3-2'), { id: 'problem-add-3-2', text: 'three plus two' });
});
