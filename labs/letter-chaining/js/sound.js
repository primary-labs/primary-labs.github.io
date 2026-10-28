/* Primary Labs · Letter Chains — playback: teacher voice first, then bundled clips.
   The device voice is only a last resort if a clip fails to load. */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var MUTE_KEY = 'pl-muted';
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* ignore */ }

  var token = 0; // bumps on stop() so stale playback chains end quietly
  var current = null; // the clip that is playing now: { stop() }
  var chosenVoice = null;

  var LOOKAHEAD = 0.03; // seconds; schedule a little ahead so sounds never start late and click
  var FADE = 0.015;     // seconds; every clip fades in and out, including when it's cut short

  function synth() { return 'speechSynthesis' in window ? window.speechSynthesis : null; }

  function pickVoice() {
    var s = synth();
    if (!s) return null;
    var voices = s.getVoices() || [];
    var preferred = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Ava', 'Allison', 'Karen'];
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
    chosenVoice = pickVoice();
    if ('onvoiceschanged' in synth()) synth().onvoiceschanged = function () { chosenVoice = pickVoice(); };
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- one shared audio output that stays open ----------
     Browsers shut the speaker output down after a stretch of silence and restart it for the
     next sound. Many speakers, monitors and headphones pop on every restart. So the page keeps
     one output open and plays a signal far too quiet to hear (about -120 dB) between sounds. */

  var ctx = null;
  var master = null;

  function audio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
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

  // Audio can only start after a tap or key press. Open the output on the first one,
  // so it's already running when the first sound plays.
  // iPhone and iPad Safari only count touchend and click as a tap (touchstart might be the
  // start of a scroll). Teacher recordings load from storage before playing, which ends the
  // tap, so the output has to be opened here, during the tap itself.
  function warm() { if (!muted) audio(); }
  ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, warm, { capture: true, passive: true });
  });
  // Let the output rest while the tab is in the background.
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.visibilityState === 'hidden') ctx.suspend();
    else if (!muted) ctx.resume();
  });

  /* ---------- clips ---------- */

  function releaseAudio() {
    if (current) { var c = current; current = null; c.stop(); }
  }

  function readBuffer(blob) {
    if (blob.arrayBuffer) return blob.arrayBuffer();
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsArrayBuffer(blob);
    });
  }

  function decode(c, buf) {
    return new Promise(function (resolve, reject) {
      var p = c.decodeAudioData(buf, resolve, reject); // callback form for older Safari
      if (p && p.then) p.then(resolve, reject);
    });
  }

  /* Teacher recordings (blobs from this browser's storage). */
  function playBlob(blob, my) {
    releaseAudio();
    if (my !== token) return Promise.resolve(false);
    var c = audio();
    if (!c) return playBlobElement(blob, my);
    return readBuffer(blob)
      .then(function (buf) { return decode(c, buf); })
      .then(function (clip) { return playBuffer(clip, my); })
      .catch(function () { return my === token ? playBlobElement(blob, my) : false; });
  }

  /* ---------- bundled clips (assets/audio/) ----------
     Every letter sound, word, keyword picture, and sentence ships as a clip in the page's own
     computer-generated voice (see tools/voice/), so the page sounds the same on every computer
     and never depends on the device voice. Device voices differ by system, can't say a letter
     sound on its own, and on some Macs they pop loudly each time they start.
     Each clip is wrapped in a .js file (see tools/build-audio.js), because the page's security
     policy stops scripts from downloading files directly. */

  var CLIP_ROOT = 'assets/audio/';
  var clipData = {};  // name → { type, b64 }, filled in by the clip scripts
  var clipLoads = {}; // name → Promise<boolean>
  var clipBuffers = {}; // name → Promise<AudioBuffer|null>

  function loadClip(name) {
    if (!clipLoads[name]) {
      clipLoads[name] = new Promise(function (resolve) {
        if (clipData[name]) return resolve(true);
        var s = document.createElement('script');
        s.src = CLIP_ROOT + name + '.js';
        s.async = true;
        s.onload = function () { resolve(!!clipData[name]); };
        s.onerror = function () { resolve(false); };
        document.head.appendChild(s);
      });
    }
    return clipLoads[name];
  }

  function clipBuffer(name) {
    if (!clipBuffers[name]) {
      clipBuffers[name] = loadClip(name).then(function (ok) {
        var c = ok && audio();
        if (!c) return null;
        var bin = atob(clipData[name].b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        clipData[name].b64 = null; // the decoded audio is kept instead
        return decode(c, bytes.buffer);
      }).catch(function () { return null; });
    }
    return clipBuffers[name];
  }

  function playBundled(name, my) {
    if (my !== token) return Promise.resolve(false);
    return clipBuffer(name).then(function (buf) {
      if (!buf || my !== token) return false;
      return playBuffer(buf, my);
    });
  }

  function hasWordClip(w) { return !!(PL.isWord && PL.isWord(w)); }
  function hasSoundClip(id) { return !!(PL.LETTER_IDS && PL.LETTER_IDS.indexOf(id) !== -1); }
  function hasSentenceClip(w) { return !!(PL.WORDS && PL.WORDS[w] && PL.WORDS[w].sentence); }

  /* Plays a decoded clip through the shared output with short fades in and out. */
  function playBuffer(clip, my) {
    releaseAudio();
    if (my !== token) return Promise.resolve(false);
    var c = audio();
    if (!c) return Promise.resolve(false);
    return Promise.resolve().then(function () {
        if (my !== token) return false;
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
          // Safety net in case "ended" never fires
          setTimeout(function () { finish(true); }, (LOOKAHEAD + clip.duration) * 1000 + 1500);
        });
      })
      .catch(function () { return false; });
  }

  /* Fallback for browsers without Web Audio. */
  function playBlobElement(blob, my) {
    return new Promise(function (resolve) {
      releaseAudio();
      if (my !== token) return resolve(false);
      var url = URL.createObjectURL(blob);
      var a = new Audio();
      var settled = false;
      var me = {
        stop: function () { a.pause(); finish(false); }
      };
      function finish(ok) {
        if (settled) return;
        settled = true;
        a.onended = a.onerror = null;
        URL.revokeObjectURL(url);
        if (current === me) current = null;
        resolve(ok);
      }
      a.onended = function () { finish(true); };
      a.onerror = function () { finish(false); };
      a.src = url;
      current = me;
      var p = a.play();
      if (p && p.catch) p.catch(function () { finish(false); });
      setTimeout(function () { finish(true); }, 8000);
    });
  }

  function speakNow(text, rate, my) {
    var s = synth();
    if (!s || !text) return Promise.resolve(false);
    return new Promise(function (resolve) {
      if (my !== token) return resolve(false);
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (chosenVoice) u.voice = chosenVoice;
      u.rate = rate || 0.85;
      u.pitch = 1.05;
      var settled = false;
      var end = function () { if (!settled) { settled = true; resolve(true); } };
      u.onend = end;
      u.onerror = end;
      s.speak(u);
      // Some browsers never fire onend; don't hang the lesson.
      setTimeout(end, Math.max(1600, text.length * 140));
    });
  }

  function hasClip(id) { return !!(PL.Voice && PL.Voice.has(id)); }

  function teacherClip(id, my) {
    if (!hasClip(id)) return Promise.resolve(false);
    return PL.Voice.getBlob(id).then(function (blob) {
      if (!blob || my !== token) return false;
      return playBlob(blob, my);
    });
  }

  var Sound = {
    isMuted: function () { return muted; },
    setMuted: function (m) {
      muted = !!m;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
      if (muted) Sound.stop();
      else audio();
    },
    canSpeak: function () { return !!synth(); },

    stop: function () {
      token++;
      releaseAudio();
      // Only cancel speech that is actually playing. Cancelling cuts a word mid-sound.
      var s = synth();
      if (s && (s.speaking || s.pending)) s.cancel();
    },

    /* Begins a fresh playback sequence and returns its token. */
    begin: function () { Sound.stop(); return token; },
    alive: function (my) { return my === token; },
    wait: function (ms, my) { return wait(ms).then(function () { return my === token; }); },

    /* Teacher clip by id, or false when there isn't one.
       With no clip to play, it leaves whatever is already playing alone. */
    clip: function (id, my) {
      if (muted || !hasClip(id)) return Promise.resolve(false);
      return teacherClip(id, my === undefined ? Sound.begin() : my);
    },

    speak: function (text, rate, my) {
      if (muted) return Promise.resolve(false);
      return speakNow(text, rate, my === undefined ? Sound.begin() : my);
    },

    /* A whole word: teacher recording, else the bundled clip, else (only if that fails) the device voice. */
    word: function (w, my) {
      if (muted) return Promise.resolve('muted');
      if (my === undefined) my = Sound.begin();
      return teacherClip('word:' + w, my).then(function (ok) {
        if (ok) return 'teacher';
        return (hasWordClip(w) ? playBundled('words/' + w, my) : Promise.resolve(false)).then(function (played) {
          if (played) return 'clip';
          if (my !== token) return 'none';
          return speakNow(w, 0.75, my).then(function (spoke) { return spoke ? 'device' : 'none'; });
        });
      });
    },

    /* Just the letter sound, for tiles, Blend, and Sound Spy: teacher recording, else the
       bundled clip. Resolves true if a sound played. Letters with neither (from teacher-made
       chains) play nothing and leave whatever is already playing alone. */
    letterSound: function (id, my) {
      if (muted || (!hasClip('sound:' + id) && !hasSoundClip(id))) return Promise.resolve(false);
      if (my === undefined) my = Sound.begin();
      return teacherClip('sound:' + id, my).then(function (ok) {
        if (ok) return true;
        return hasSoundClip(id) ? playBundled('sounds/' + id, my) : false;
      });
    },

    hasLetterSound: function (id) { return hasClip('sound:' + id) || hasSoundClip(id); },

    /* A Sounds-page card: the sound (teacher recording, else the bundled clip), then its
       keyword ("/ă/ … apple"). If no sound plays, the keyword plays alone. */
    letter: function (id, my, opts) {
      if (muted) return Promise.resolve('muted');
      if (my === undefined) my = Sound.begin();
      return teacherClip('sound:' + id, my).then(function (teacher) {
        if (!teacher && opts && opts.silentFallback) return 'none';
        var l = PL.letter(id);
        var keyword = l ? l.keyword : id;
        function sayKeyword(after) {
          if (my !== token) return Promise.resolve('stopped'); // cut off by a newer sound, not a failure
          return (l ? playBundled('keywords/' + keyword, my) : Promise.resolve(false)).then(function (played) {
            if (played) return after || 'keyword';
            if (my !== token) return 'stopped';
            return speakNow(keyword, 0.8, my).then(function (spoke) { return spoke ? after || 'keyword' : after || 'none'; });
          });
        }
        var sound = teacher ? Promise.resolve(true)
          : hasSoundClip(id) ? playBundled('sounds/' + id, my) : Promise.resolve(false);
        return sound.then(function (played) {
          if (!played) return my !== token ? 'stopped' : sayKeyword();
          return wait(450).then(function () { return sayKeyword(teacher ? 'teacher' : 'clip'); });
        });
      });
    },

    /* The example sentence for a word. */
    sentence: function (w, my) {
      if (muted) return Promise.resolve('muted');
      if (!hasSentenceClip(w)) return Promise.resolve('none');
      if (my === undefined) my = Sound.begin();
      return playBundled('sentences/' + w, my).then(function (played) {
        if (played) return 'clip';
        if (my !== token) return 'none';
        return speakNow(PL.WORDS[w].sentence, 0.85, my).then(function (spoke) { return spoke ? 'device' : 'none'; });
      });
    },

    /* Start loading clips before they're needed, so the first play has no delay.
       Takes word lists; loads each word's clip, its sentence, and its letter sounds. */
    preloadWords: function (words) {
      (words || []).forEach(function (w) {
        if (hasWordClip(w)) loadClip('words/' + w);
        if (hasSentenceClip(w)) loadClip('sentences/' + w);
        String(w).split('').forEach(function (ch) { if (hasSoundClip(ch)) loadClip('sounds/' + ch); });
      });
    },
    preloadKeywords: function () {
      (PL.LETTERS || []).forEach(function (l) {
        loadClip('sounds/' + l.id);
        loadClip('keywords/' + l.keyword);
      });
    },

    /* Called by each clip's .js file (assets/audio/). */
    addClip: function (name, type, b64) {
      if (typeof name === 'string' && typeof b64 === 'string') clipData[name] = { type: type, b64: b64 };
    },

    /* Little synthesized cues — no audio files needed.
       Soft on purpose: pure sine tones that swell in over 30 ms and fade out smoothly.
       A fast attack (the old cues hit full volume in about 7 ms) sounds like a pop. */
    chime: function (kind) {
      if (muted) return;
      var notes = kind === 'yay' ? [523.25, 659.25, 783.99, 1046.5]
        : kind === 'done' ? [523.25, 659.25, 783.99, 659.25, 1046.5]
        : kind === 'oops' ? [330, 262]
        : null;
      if (!notes) return;
      try {
        var c = audio();
        if (!c) return;
        var t = c.currentTime + LOOKAHEAD;
        var step = kind === 'oops' ? 0.18 : 0.12;
        var peak = kind === 'oops' ? 0.07 : 0.08;
        notes.forEach(function (f, i) {
          var o = c.createOscillator();
          var g = c.createGain();
          g.gain.value = 0; // silent until its start time, even if scheduling runs late
          o.type = 'sine';
          o.frequency.value = f;
          var start = t + i * step;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(peak, start + 0.03);
          g.gain.setTargetAtTime(0, start + 0.03, 0.09); // smooth fade, gone by the time it stops
          o.connect(g);
          g.connect(master);
          o.start(start);
          o.stop(start + 0.7);
        });
      } catch (e) { /* cues are optional */ }
    }
  };

  PL.Sound = Sound;
})();
