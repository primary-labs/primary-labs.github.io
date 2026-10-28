/* Primary Labs · Monster Math: speech and sound effects.
   Speech plays the recorded clip for a phrase when there is one (assets/audio/), and the device
   voice when there isn't. Sound effects are made on the fly, with no files.
   The clip player follows Letter Chains' js/sound.js. */
(function (root) {
  'use strict';
  var MM = (root.MM = root.MM || {});

  var LOOKAHEAD = 0.03; // seconds; schedule a little ahead so sounds never start late and click
  var FADE = 0.015;     // seconds; every clip fades in and out, including when it's cut short

  var token = 0;        // bumps on stop() so stale playback ends quietly
  var current = null;   // the clip playing now: { stop() }
  var sfxOn = true;

  /* ---------- one shared audio output that stays open ----------
     Browsers shut the speaker output down after a stretch of silence and restart it for the
     next sound. Many speakers pop on every restart, so the page keeps one output open and plays
     a signal far too quiet to hear (about -120 dB) between sounds. */
  var ctx = null, master = null;
  function audio() {
    var Ctx = root.AudioContext || root.webkitAudioContext;
    if (!Ctx) return null;
    if (!ctx) {
      try { ctx = new Ctx({ latencyHint: 'interactive' }); } catch (e) { ctx = new Ctx(); }
      master = ctx.createGain();
      master.connect(ctx.destination);
      var hold = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var data = hold.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = 1e-6;
      var keep = ctx.createBufferSource();
      keep.buffer = hold;
      keep.loop = true;
      keep.connect(master);
      keep.start();
    }
    if (ctx.state === 'suspended' && document.visibilityState !== 'hidden') ctx.resume();
    return ctx;
  }
  // Audio can only start during a tap or key press, so open the output on the first one.
  // iPhone and iPad Safari only count touchend and click as a tap.
  ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { audio(); }, { capture: true, passive: true });
  });
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.visibilityState === 'hidden') ctx.suspend(); else ctx.resume();
  });

  /* ---------- device voice (only for lines with no clip) ---------- */
  function synth() { return 'speechSynthesis' in root ? root.speechSynthesis : null; }
  var voice = null;
  function pickVoice() {
    var s = synth();
    if (!s) return null;
    var voices = s.getVoices() || [];
    var preferred = ['Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Samantha', 'Ava', 'Allison', 'Karen'];
    for (var p = 0; p < preferred.length; p++) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name.indexOf(preferred[p]) !== -1 && /^en/i.test(voices[i].lang)) return voices[i];
      }
    }
    for (i = 0; i < voices.length; i++) if (/^en[-_]US/i.test(voices[i].lang)) return voices[i];
    for (i = 0; i < voices.length; i++) if (/^en/i.test(voices[i].lang)) return voices[i];
    return null;
  }
  if (synth()) {
    voice = pickVoice();
    if ('onvoiceschanged' in synth()) synth().onvoiceschanged = function () { voice = pickVoice(); };
  }
  function speakDevice(text, my) {
    var s = synth();
    if (!s || !text) return Promise.resolve(false);
    return new Promise(function (resolve) {
      if (my !== token) return resolve(false);
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = 0.85;
      var settled = false;
      var end = function () { if (!settled) { settled = true; resolve(true); } };
      u.onend = end;
      u.onerror = end;
      s.speak(u);
      // Some browsers never fire onend; don't hang.
      setTimeout(end, Math.max(1600, text.length * 140));
    });
  }

  /* ---------- clips ----------
     Each clip ships as a .js file (tools/build-audio.js) because the page's security policy stops
     scripts from downloading files. assets/audio/index.js lists which phrases have one. */
  var CLIP_ROOT = 'assets/audio/phrases/';
  var have = {};       // id → true, from index.js
  var clipData = {};   // id → { type, b64 }, filled in by the clip scripts
  var loads = {};      // id → Promise<boolean>
  var buffers = {};    // id → Promise<AudioBuffer|null>

  function loadClip(id) {
    if (!loads[id]) {
      loads[id] = new Promise(function (resolve) {
        if (clipData[id]) return resolve(true);
        var s = document.createElement('script');
        s.src = CLIP_ROOT + id + '.js';
        s.async = true;
        s.onload = function () { resolve(!!clipData[id]); };
        s.onerror = function () { resolve(false); };
        document.head.appendChild(s);
      });
    }
    return loads[id];
  }
  function decode(c, buf) {
    return new Promise(function (resolve, reject) {
      var p = c.decodeAudioData(buf, resolve, reject); // callback form for older Safari
      if (p && p.then) p.then(resolve, reject);
    });
  }
  function clipBuffer(id) {
    if (!buffers[id]) {
      buffers[id] = loadClip(id).then(function (ok) {
        var c = ok && audio();
        if (!c) return null;
        var bin = atob(clipData[id].b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        clipData[id].b64 = null; // keep the decoded audio instead
        return decode(c, bytes.buffer);
      }).catch(function () { return null; });
    }
    return buffers[id];
  }

  function release() { if (current) { var c = current; current = null; c.stop(); } }

  function playBuffer(clip, my) {
    release();
    var c = audio();
    if (!c || my !== token) return Promise.resolve(false);
    return new Promise(function (resolve) {
      var src = c.createBufferSource();
      var g = c.createGain();
      src.buffer = clip;
      var t = c.currentTime + LOOKAHEAD;
      var end = t + clip.duration;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + FADE);
      g.gain.setValueAtTime(1, Math.max(t + FADE, end - FADE));
      g.gain.linearRampToValueAtTime(0, end);
      src.connect(g);
      g.connect(master);
      var settled = false;
      var me = {
        stop: function () {
          // Fade out over a few milliseconds instead of cutting mid-sound
          var now = c.currentTime;
          try {
            g.gain.cancelScheduledValues(now);
            g.gain.setValueAtTime(g.gain.value, now);
            g.gain.linearRampToValueAtTime(0, now + FADE);
            src.stop(now + FADE + 0.01);
          } catch (e) { /* already stopped */ }
          finish(false);
        }
      };
      function finish(ok) {
        if (settled) return;
        settled = true;
        if (current === me) current = null;
        resolve(ok);
      }
      src.onended = function () { finish(true); };
      src.start(t);
      current = me;
      setTimeout(function () { finish(true); }, (LOOKAHEAD + clip.duration) * 1000 + 1500);
    });
  }

  function sayNow(id, my) {
    var p = MM.Phrases.get(id);
    if (!p) return Promise.resolve(false);
    var clip = have[id] ? clipBuffer(id) : Promise.resolve(null);
    return clip.then(function (buf) {
      if (my !== token) return false;
      if (buf) return playBuffer(buf, my);
      return speakDevice(p.say, my);
    });
  }

  /* ---------- sound effects ---------- */
  function tone(freq, dur, type, when, vol, slideTo) {
    if (!sfxOn) return;
    var c = audio();
    if (!c) return;
    var t = c.currentTime + LOOKAHEAD + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.value = 0;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.03);
  }
  var sfx = {
    boing: function () { tone(180, 0.18, 'triangle', 0, 0.3, 520); tone(520, 0.25, 'triangle', 0.16, 0.22, 240); },
    beep: function () { tone(880, 0.07, 'square', 0, 0.07); tone(1320, 0.07, 'square', 0.08, 0.07); tone(990, 0.1, 'square', 0.16, 0.07); },
    zap: function () { tone(1400, 0.28, 'sawtooth', 0, 0.1, 110); },
    chomp: function () { tone(260, 0.12, 'square', 0, 0.12, 90); tone(220, 0.12, 'square', 0.13, 0.12, 80); },
    count: function (n) { tone(392 * Math.pow(2, n / 12), 0.16, 'triangle', 0, 0.25); },
    yay: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.28, 'triangle', i * 0.1, 0.22); }); },
    oops: function () { tone(392, 0.16, 'sine', 0, 0.18); tone(311, 0.3, 'sine', 0.17, 0.18); },
    click: function () { tone(700, 0.05, 'sine', 0, 0.12); }
  };

  var Sound = {
    /* Stops whatever is speaking and returns a fresh token for a new sequence. */
    stop: function () {
      token++;
      release();
      var s = synth();
      if (s && (s.speaking || s.pending)) s.cancel();
      return token;
    },
    alive: function (my) { return my === token; },
    /* Says one phrase by id, cutting off anything already speaking. */
    say: function (id) { return sayNow(id, Sound.stop()); },
    /* Says phrases one after another, with a short pause between. Stops early if anything else speaks. */
    sayAll: function (list) {
      var my = Sound.stop();
      return list.reduce(function (p, id, i) {
        return p.then(function () {
          if (my !== token) return;
          return (i ? new Promise(function (r) { setTimeout(r, 150); }) : Promise.resolve())
            .then(function () { return my === token && sayNow(id, my); });
        });
      }, Promise.resolve());
    },
    /* Starts loading clips before they're needed, so the first play has no delay. */
    preload: function (list) { list.forEach(function (id) { if (have[id]) loadClip(id); }); },
    sfx: sfx,
    sfxOn: function () { return sfxOn; },
    setSfx: function (on) { sfxOn = !!on; },
    /* Called by assets/audio/index.js and each clip's .js file. */
    setClips: function (ids) { (ids || []).forEach(function (id) { have[id] = true; }); },
    addClip: function (id, type, b64) {
      if (typeof id === 'string' && typeof b64 === 'string') clipData[id] = { type: type, b64: b64 };
    }
  };
  MM.Sound = Sound;
})(window);
