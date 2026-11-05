// The clip player with a fake page: clip scripts "download" from assets/audio/ unless the test drops
// the request, and the device voice records what it would say. The device voice must only ever be a
// last resort (AGENTS.md: teacher recording, then bundled clip, then device voice).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function page() {
  const net = { drop: 0, offline: false, requests: [] };
  const device = [];
  const listeners = {};
  class FakeContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.sampleRate = 48000; this.destination = {}; }
    createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} }, connect() {} }; }
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
    createBufferSource() {
      const src = { connect() {}, start() { setTimeout(() => src.onended && src.onended(), 5); }, stop() {} };
      return src;
    }
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
          if (net.offline || net.drop-- > 0 || !fs.existsSync(file)) return s.onerror && s.onerror();
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
  for (const f of ['js/data.js', 'js/words.js', 'js/sound.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  (listeners.pointerdown || []).forEach((fn) => fn()); // the first tap opens the audio output
  return { PL: sandbox.PL, net, device };
}

test('a word plays its clip, not the device voice', async () => {
  const { PL, device } = page();
  assert.equal(await PL.Sound.word('cat'), 'clip');
  assert.deepEqual(device, []);
});

test('one dropped download is tried again straight away', async () => {
  const { PL, net, device } = page();
  net.drop = 1;
  assert.equal(await PL.Sound.word('cat'), 'clip');
  assert.deepEqual(device, []);
});

test('a clip that could not load is tried again the next time it is needed', async () => {
  const { PL, net } = page();
  net.offline = true;
  assert.equal(await PL.Sound.word('cat'), 'device'); // last resort while the clip can't load
  net.offline = false;
  assert.equal(await PL.Sound.word('cat'), 'clip');
});
