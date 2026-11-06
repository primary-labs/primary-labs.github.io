'use strict';
// The clip player with a fake page: clip scripts "download" from assets/audio/ unless the test takes
// the connection away, and the device voice records what it would say. The computer voice must only
// ever be a last resort (AGENTS.md: bundled clip, then device voice).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function page() {
  const net = { online: true, requests: [] };
  const device = [];
  const listeners = {};
  class FakeContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.sampleRate = 48000; this.destination = {}; }
    createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
    createBufferSource() {
      const src = { connect() {}, start() { setTimeout(() => src.onended && src.onended(), 5); }, stop() {} };
      return src;
    }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
    decodeAudioData(buf, ok) { const b = { duration: 0.01 }; if (ok) ok(b); return Promise.resolve(b); }
    resume() { return Promise.resolve(); }
    suspend() { return Promise.resolve(); }
  }
  const document = {
    visibilityState: 'visible',
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    createElement() { return {}; },
    head: {
      appendChild(s) {
        net.requests.push(s.src);
        setTimeout(() => {
          const file = path.join(ROOT, s.src);
          if (!net.online || !fs.existsSync(file)) return s.onerror && s.onerror();
          vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
          if (s.onload) s.onload();
        }, 1);
      }
    }
  };
  const sandbox = {
    document, setTimeout, clearTimeout, Promise, Uint8Array, Float32Array,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    AudioContext: FakeContext,
    speechSynthesis: { speak(u) { device.push(u.text); setTimeout(() => u.onend && u.onend(), 1); }, getVoices: () => [], cancel() {}, speaking: false, pending: false },
    SpeechSynthesisUtterance: function (text) { this.text = text; }
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const f of ['js/words.js', 'js/rounds.js', 'js/phrases.js', 'js/sound.js', 'assets/audio/index.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  (listeners.pointerdown || []).forEach((fn) => fn()); // the first tap opens the audio output
  return { SB: sandbox.SB, net, device };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('letter sounds, words and directions play their clips, not the computer voice', async () => {
  const { SB, device } = page();
  for (const id of ['sounds/c', 'words/cat', 'phrases/which']) assert.equal(await SB.Sound.say(id), true, id);
  assert.deepEqual([...device], []);
});

test('a word\'s sounds play one after another, each starting in order', async () => {
  const { SB } = page();
  const started = [];
  const ok = await SB.Sound.sayAll(['sounds/c', 'sounds/a', 'sounds/t'], (id, i) => started.push(i), 0);
  assert.equal(ok, true);
  assert.deepEqual(started, [0, 1, 2]);
});

test('offline: words and directions fall back to the computer voice; a letter sound is a pause, never "see"', async () => {
  const { SB, net, device } = page();
  net.online = false;
  await SB.Sound.say('words/cat');
  await SB.Sound.say('phrases/again');
  await SB.Sound.say('sounds/c');
  assert.deepEqual([...device], ['cat', 'Listen again.']);
});

test('a clip that failed to download is tried again, not given up on for the visit', async () => {
  const { SB, net, device } = page();
  net.online = false;
  await SB.Sound.say('words/cat');
  net.online = true;
  device.length = 0;
  await SB.Sound.say('words/cat');
  assert.deepEqual([...device], [], 'back online: the clip plays');
});

test('every clip downloads in the background, one at a time, so a dropped connection later changes nothing', async () => {
  const { SB, net, device } = page();
  const done = SB.Sound.preloadAll();
  await wait(0);
  assert.equal(net.requests.length, 1, 'starts with one request');
  await done;
  net.online = false;
  for (const id of ['words/cat', 'words/pen', 'phrases/letters']) await SB.Sound.say(id);
  assert.deepEqual([...device], [], 'no clip falls back to the computer voice');
});
