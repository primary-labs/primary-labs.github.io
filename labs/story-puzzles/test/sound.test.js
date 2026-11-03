'use strict';
// The clip player with a fake page: clip scripts "download" from assets/audio/phrases/ unless the
// test takes the connection away, and the device voice records what it would say. The computer voice
// must only ever be a last resort (AGENTS.md: teacher recording, then bundled clip, then device voice).
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
    createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} }, connect() {} }; }
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
  for (const f of ['js/stories.js', 'js/phrases.js', 'js/sound.js', 'assets/audio/index.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  (listeners.pointerdown || []).forEach((fn) => fn()); // the first tap opens the audio output
  return { SP: sandbox.SP, net, device };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('a story line plays its clip, not the computer voice', async () => {
  const { SP, device } = page();
  assert.equal(await SP.Sound.say('big-pig-3'), true);
  assert.deepEqual([...device], []);
});

test('a clip that failed to download is tried again, not given up on for the visit', async () => {
  const { SP, net, device } = page();
  net.online = false;
  await SP.Sound.say('big-pig-3');
  assert.deepEqual([...device], ['The pig has a wig.'], 'offline: the computer voice is the last resort');
  net.online = true;
  device.length = 0;
  await SP.Sound.say('big-pig-3');
  assert.deepEqual([...device], [], 'back online: the clip plays');
});

test('every clip downloads in the background, so a dropped connection later changes nothing', async () => {
  const { SP, net, device } = page();
  await SP.Sound.preloadAll();
  net.online = false;
  for (const p of SP.Phrases.all()) await SP.Sound.say(p.id);
  assert.deepEqual([...device], [], 'no line falls back to the computer voice');
});

test('background downloads go one at a time', async () => {
  const { SP, net } = page();
  const done = SP.Sound.preloadAll();
  await wait(0);
  assert.equal(net.requests.length, 1, 'starts with one request');
  await done;
  assert.equal(new Set(net.requests).size, SP.Phrases.all().length, 'every clip requested once');
});
