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
  for (const f of ['js/phrases.js', 'js/sound.js', 'assets/audio/index.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  (listeners.pointerdown || []).forEach((fn) => fn()); // the first tap opens the audio output
  return { MM: sandbox.MM, net, device };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('a line plays its clip, not the computer voice', async () => {
  const { MM, device } = page();
  await MM.Sound.say('n-3');
  assert.deepEqual([...device], []);
});

test('a clip that failed to download is tried again, not given up on for the visit', async () => {
  const { MM, net, device } = page();
  net.online = false;
  await MM.Sound.say('n-3');
  assert.deepEqual([...device], ['three'], 'offline: the computer voice is the last resort');
  net.online = true;
  device.length = 0;
  await MM.Sound.say('n-3');
  assert.deepEqual([...device], [], 'back online: the clip plays');
});

test('a preload that failed does not stop the clip from playing later', async () => {
  const { MM, net, device } = page();
  net.online = false;
  MM.Sound.preload(['n-4']);
  await wait(20);
  net.online = true;
  await MM.Sound.say('n-4');
  assert.deepEqual([...device], [], 'the clip plays once the connection is back');
});

test('a dropped request is tried once more straight away', async () => {
  const { MM, net, device } = page();
  net.online = false;
  const said = MM.Sound.say('n-5');
  await wait(0);
  net.online = true; // back before the second try
  await said;
  assert.deepEqual([...device], [], 'the second try plays the clip');
  assert.equal(net.requests.filter((r) => r.endsWith('/n-5.js')).length, 2);
});
