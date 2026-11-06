/* Primary Labs · Sound Boxes: speech and sound effects.
   Every letter sound, word and direction plays from a bundled clip (assets/audio/). The device voice
   is a last resort, for a clip that can't be downloaded: it says words and directions, but it
   can't say a letter sound on its own, so a missing sound clip is a short pause.
   Sound effects are made on the fly, with no files.
   The clip player follows Story Puzzles' js/sound.js. */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});

  var LOOKAHEAD = 0.03; // seconds; schedule a little ahead so sounds never start late and click
  var FADE = 0.015;     // seconds; every clip fades in and out, including when it's cut short
  var GAP = 450;        // ms between sounds when they play one after another

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

  /* ---------- device voice (only when a clip can't be downloaded) ---------- */
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

  /* What the device voice says for a clip id: the word, or the direction's text. */
  function deviceText(id) {
    var at = id.indexOf('/'), group = id.slice(0, at), name = id.slice(at + 1);
    if (group === 'words') return name;
    if (group === 'phrases') { var p = SB.Phrases.get(name); return p ? p.say : ''; }
    return '';
  }

  /* ---------- clips ----------
     Each clip ships as a .js file (tools/build-audio.js) because the page's security policy stops
     scripts from downloading files. assets/audio/index.js lists which clips exist. */
  var CLIP_ROOT = 'assets/audio/';
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
        s.onload = function () { if (!clipData[id]) delete loads[id]; resolve(!!clipData[id]); };
        // A failed download is forgotten, so the next play tries again: the connection may be back.
        s.onerror = function () {
          delete loads[id];
          if (s.parentNode) s.parentNode.removeChild(s);
          resolve(false);
        };
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
        if (!c) { delete buffers[id]; return null; } // try again next time
        var bin = atob(clipData[id].b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return decode(c, bytes.buffer).then(function (buf) {
          clipData[id].b64 = null; // keep the decoded audio instead
          return buf;
        });
      }).catch(function () { delete buffers[id]; return null; });
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

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* A clip, or the device voice, or (for a letter sound with no clip) a short pause. */
  function sayNow(id, my) {
    var clip = have[id] ? clipBuffer(id) : Promise.resolve(null);
    return clip.then(function (buf) {
      if (my !== token) return false;
      if (buf) return playBuffer(buf, my);
      var text = deviceText(id);
      if (text) return speakDevice(text, my);
      return wait(GAP).then(function () { return my === token; });
    });
  }

  /* ---------- sound effects ----------
     Soft and short, the same every time. A wrong answer gets a low, quiet tone, never a buzzer. */
  function tone(freq, dur, type, when, vol) {
    if (!sfxOn) return;
    var c = audio();
    if (!c) return;
    var t = c.currentTime + LOOKAHEAD + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
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
    /* a counter or letter lands in its box */
    snap: function () { tone(660, 0.07, 'triangle', 0, 0.2); tone(990, 0.12, 'triangle', 0.07, 0.18); },
    soft: function () { tone(330, 0.3, 'sine', 0, 0.14); },
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
    /* Plays one clip by id ('sounds/c', 'words/cat', 'phrases/which'), cutting off anything
       already playing. Resolves true if it played to the end. */
    say: function (id) {
      var my = Sound.stop();
      return sayNow(id, my).then(function (ok) { return ok && my === token; });
    },
    /* Plays clips one after another with a pause between (GAP, or gap ms). onEach(id, i) runs as
       each one starts. Resolves true if every clip played, false if something else cut it off. */
    sayAll: function (list, onEach, gap) {
      var my = Sound.stop();
      var pause = gap === undefined ? GAP : gap;
      return list.reduce(function (p, id, i) {
        return p.then(function (ok) {
          if (!ok || my !== token) return false;
          return (i ? wait(pause) : Promise.resolve()).then(function () {
            if (my !== token) return false;
            if (onEach) onEach(id, i);
            return sayNow(id, my);
          });
        });
      }, Promise.resolve(true)).then(function (ok) { return !!ok && my === token; });
    },
    /* Starts loading clips before they're needed, so the first play has no delay. */
    preload: function (list) { list.forEach(function (id) { if (have[id]) loadClip(id); }); },
    /* Downloads every clip, one at a time, so the lab keeps its voice even if the connection drops
       after the page opens (school Wi-Fi). Resolves once each has been tried. */
    preloadAll: function () {
      return Object.keys(have).reduce(function (p, id) {
        return p.then(function () { return loadClip(id); });
      }, Promise.resolve()).then(function () {});
    },
    sfx: sfx,
    sfxOn: function () { return sfxOn; },
    setSfx: function (on) { sfxOn = !!on; },
    /* Called by assets/audio/index.js and each clip's .js file. */
    setClips: function (ids) { (ids || []).forEach(function (id) { have[id] = true; }); },
    addClip: function (id, type, b64) {
      if (typeof id === 'string' && typeof b64 === 'string') clipData[id] = { type: type, b64: b64 };
    }
  };
  SB.Sound = Sound;
})(window);
