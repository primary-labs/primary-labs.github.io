/* Primary Labs · Letter Chains — microphone recorder
 *
 * - The microphone is requested only when a teacher presses Record.
 * - The mic is released (tracks stopped) as soon as recording ends.
 * - Recordings auto-stop after a few seconds.
 * - Silence at the start and end is trimmed and the volume is evened out, so sounds
 *   line up neatly when the app blends them (c…a…t → cat).
 */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];

  function pickType() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    for (var i = 0; i < TYPES.length; i++) if (MediaRecorder.isTypeSupported(TYPES[i])) return TYPES[i];
    return '';
  }

  function AudioCtx() { return window.AudioContext || window.webkitAudioContext; }

  function friendlyError(err) {
    var name = err && err.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return 'The microphone is blocked. Click the lock or camera icon in the address bar, allow the microphone, then try again.';
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No microphone was found. Plug one in and try again.';
    if (name === 'NotReadableError') return 'Another app is using the microphone. Close it and try again.';
    return 'Recording could not start. Try again, or reload the page.';
  }

  /* ---------- trim + normalize + encode WAV ---------- */

  function encodeWav(samples, sampleRate) {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var v = new DataView(buffer);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, samples.length * 2, true);
    for (var i = 0, o = 44; i < samples.length; i++, o += 2) {
      var s = Math.max(-1, Math.min(1, samples[i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  function cleanUp(blob) {
    var Ctx = AudioCtx();
    if (!Ctx || !blob.size) return Promise.resolve({ blob: blob, duration: 0 });
    var ctx;
    return readBuffer(blob)
      .then(function (buf) {
        ctx = new Ctx();
        return new Promise(function (resolve, reject) {
          // Callback form for older Safari
          var p = ctx.decodeAudioData(buf, resolve, reject);
          if (p && p.then) p.then(resolve, reject);
        });
      })
      .then(function (audio) {
        var rate = audio.sampleRate;
        var len = audio.length;
        var mono = new Float32Array(len);
        for (var c = 0; c < audio.numberOfChannels; c++) {
          var ch = audio.getChannelData(c);
          for (var i = 0; i < len; i++) mono[i] += ch[i] / audio.numberOfChannels;
        }
        // Find speech using short-window loudness
        var win = Math.max(1, Math.floor(rate * 0.01));
        var peak = 0;
        for (i = 0; i < len; i++) peak = Math.max(peak, Math.abs(mono[i]));
        if (peak < 0.01) throw new Error('silent');
        var threshold = Math.max(0.02, peak * 0.12);
        var start = 0, end = len;
        for (i = 0; i < len; i += win) {
          if (rms(mono, i, win) > threshold) { start = i; break; }
        }
        for (i = len - win; i > 0; i -= win) {
          if (rms(mono, i, win) > threshold) { end = i + win; break; }
        }
        var pad = Math.floor(rate * 0.06);
        start = Math.max(0, start - pad);
        end = Math.min(len, end + pad * 2);
        var out = mono.slice(start, end);
        // Normalize, then short fades so there are no clicks
        var gain = 0.9 / peak;
        var fade = Math.min(Math.floor(rate * 0.012), Math.floor(out.length / 4));
        for (i = 0; i < out.length; i++) {
          var f = 1;
          if (i < fade) f = i / fade;
          else if (i > out.length - fade) f = (out.length - i) / fade;
          out[i] = out[i] * gain * f;
        }
        return { blob: encodeWav(out, rate), duration: out.length / rate };
      })
      .catch(function (err) {
        if (err && err.message === 'silent') throw new Error("We couldn't hear anything. Check the microphone and try again.");
        // If decoding isn't supported, keep the original recording.
        return { blob: blob, duration: 0 };
      })
      .finally(function () { if (ctx && ctx.close) ctx.close().catch(function () {}); });
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

  function rms(data, from, n) {
    var sum = 0, end = Math.min(data.length, from + n);
    for (var i = from; i < end; i++) sum += data[i] * data[i];
    return Math.sqrt(sum / Math.max(1, end - from));
  }

  /* ---------- public API ---------- */

  var Recorder = {
    /* Returns null when recording can work here, or a reason it can't. */
    unsupportedReason: function () {
      if (!window.isSecureContext) {
        return 'Recording doesn’t work on this copy of the page. Open the page from its web address instead.';
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
        return 'This web browser can’t record. Try the newest Chrome, Edge, Safari, or Firefox.';
      }
      return null;
    },

    /* Starts recording. opts: { maxMs, onLevel(0..1), onTick(msLeft) }.
       Resolves to a session with stop() → Promise<{blob, duration}> and cancel(). */
    start: function (opts) {
      opts = opts || {};
      var maxMs = opts.maxMs || 4000;
      var reason = Recorder.unsupportedReason();
      if (reason) return Promise.reject(new Error(reason));

      return navigator.mediaDevices
        .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        .catch(function (err) { throw new Error(friendlyError(err)); })
        .then(function (stream) {
          var type = pickType();
          var mr;
          try { mr = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream); }
          catch (e) { stream.getTracks().forEach(function (t) { t.stop(); }); throw new Error(friendlyError(e)); }

          var chunks = [];
          var started = Date.now();
          var raf = 0, timer = 0, tick = 0;
          var meterCtx = null;
          var cancelled = false;
          var done;
          var finished = new Promise(function (resolve) { done = resolve; });

          // Live level meter so teachers can see the mic is hearing them
          try {
            var Ctx = AudioCtx();
            if (Ctx && opts.onLevel) {
              meterCtx = new Ctx();
              var src = meterCtx.createMediaStreamSource(stream);
              var an = meterCtx.createAnalyser();
              an.fftSize = 512;
              src.connect(an);
              var data = new Uint8Array(an.fftSize);
              var loop = function () {
                an.getByteTimeDomainData(data);
                var s = 0;
                for (var i = 0; i < data.length; i++) { var x = (data[i] - 128) / 128; s += x * x; }
                opts.onLevel(Math.min(1, Math.sqrt(s / data.length) * 4));
                raf = requestAnimationFrame(loop);
              };
              loop();
            }
          } catch (e) { /* meter is optional */ }

          function release() {
            cancelAnimationFrame(raf);
            clearTimeout(timer);
            clearInterval(tick);
            stream.getTracks().forEach(function (t) { t.stop(); });
            if (meterCtx && meterCtx.close) meterCtx.close().catch(function () {});
            if (opts.onLevel) opts.onLevel(0);
          }

          mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
          mr.onstop = function () {
            release();
            if (cancelled) return done(null);
            var raw = new Blob(chunks, { type: (mr.mimeType || type || 'audio/webm').split(';')[0] });
            done(raw);
          };
          mr.start();

          timer = setTimeout(function () { if (mr.state !== 'inactive') mr.stop(); }, maxMs);
          if (opts.onTick) {
            opts.onTick(maxMs);
            tick = setInterval(function () { opts.onTick(Math.max(0, maxMs - (Date.now() - started))); }, 200);
          }

          return {
            finished: finished.then(function (raw) { return raw ? cleanUp(raw) : null; }),
            stop: function () { if (mr.state !== 'inactive') mr.stop(); return this.finished; },
            cancel: function () { cancelled = true; if (mr.state !== 'inactive') mr.stop(); else release(); }
          };
        });
    }
  };

  PL.Recorder = Recorder;
})();
