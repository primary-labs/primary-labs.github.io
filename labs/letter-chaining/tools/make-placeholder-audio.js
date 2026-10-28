#!/usr/bin/env node
/* Makes PLACEHOLDER audio clips with the macOS built-in voice, plus a recording checklist.
 *
 *   node tools/make-placeholder-audio.js            (macOS only; needs the `say` command)
 *
 * Writes:
 *   assets/audio/words/<word>.wav        every word a chain can use
 *   assets/audio/keywords/<word>.wav     apple, igloo, octopus, ...
 *   assets/audio/sentences/<word>.wav    the sentence for each word that has one
 *   assets/audio/README.md               checklist for replacing these with human recordings
 * Then runs tools/build-audio.js to wrap each clip in the .js file the page loads.
 *
 * Apple's license limits the built-in voices to personal, non-commercial use, so replace
 * these with human recordings before the page is shipped to schools. Any WAV or MP3 at the
 * same path works; keep the file names.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var os = require('os');
var execFileSync = require('child_process').execFileSync;

var ROOT = path.join(__dirname, '..');
var OUT = path.join(ROOT, 'assets', 'audio');
var RATE = 22050;
var VOICE = process.env.VOICE || 'Samantha';

/* ---------- read the lesson content from js/data.js ---------- */

var sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8'), sandbox);
var PL = sandbox.window.PL;

var jobs = [];
PL.cvcWords().forEach(function (w) {
  jobs.push({ dir: 'words', name: w, text: w, rate: 140, label: w });
});
PL.LETTERS.forEach(function (l) {
  jobs.push({ dir: 'keywords', name: l.keyword, text: l.keyword, rate: 150, label: l.keyword + ' (keyword for ' + l.label + ')' });
});
Object.keys(PL.WORDS).sort().forEach(function (w) {
  var s = PL.WORDS[w].sentence;
  if (s) jobs.push({ dir: 'sentences', name: w, text: s, rate: 165, label: s });
});

/* The voice reads "ci" as /s/ (cit → "sit"). This set teaches c as /k/, so spell it with k. */
function forVoice(job) {
  return job.dir === 'words' ? job.text.replace(/c(?=i)/g, 'k') : job.text;
}

/* ---------- WAV in/out ---------- */

function readWav(file) {
  var b = fs.readFileSync(file);
  var p = 12, fmt = null, data = null;
  while (p + 8 <= b.length) {
    var id = b.toString('ascii', p, p + 4);
    var size = b.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { channels: b.readUInt16LE(p + 10), rate: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    if (id === 'data') data = b.subarray(p + 8, p + 8 + size);
    p += 8 + size + (size % 2);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error('Unexpected WAV format in ' + file);
  var n = Math.floor(data.length / 2 / fmt.channels);
  var out = new Float32Array(n);
  for (var i = 0; i < n; i++) {
    var sum = 0;
    for (var c = 0; c < fmt.channels; c++) sum += data.readInt16LE((i * fmt.channels + c) * 2) / 32768;
    out[i] = sum / fmt.channels;
  }
  return { samples: out, rate: fmt.rate };
}

function writeWav(file, samples, rate) {
  var b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (var i = 0; i < samples.length; i++) {
    var s = Math.max(-1, Math.min(1, samples[i]));
    b.writeInt16LE(Math.round(s < 0 ? s * 32768 : s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, b);
}

/* Trim silence, level the volume, and fade the ends so clips never click. */
function clean(samples, rate) {
  var peak = 0;
  for (var i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  if (peak < 0.01) throw new Error('silent clip');
  var win = Math.floor(rate * 0.01), threshold = peak * 0.05;
  function loud(at) {
    var s = 0, end = Math.min(samples.length, at + win);
    for (var j = at; j < end; j++) s += samples[j] * samples[j];
    return Math.sqrt(s / Math.max(1, end - at)) > threshold;
  }
  var start = 0, end = samples.length;
  for (i = 0; i < samples.length; i += win) if (loud(i)) { start = i; break; }
  for (i = samples.length - win; i > 0; i -= win) if (loud(i)) { end = i + win; break; }
  start = Math.max(0, start - Math.floor(rate * 0.04));
  end = Math.min(samples.length, end + Math.floor(rate * 0.08));
  var out = samples.slice(start, end);
  var gain = 0.7 / peak; // about -3 dB, the same level for every clip
  var fade = Math.min(Math.floor(rate * 0.01), Math.floor(out.length / 4));
  for (i = 0; i < out.length; i++) {
    var f = Math.min(1, i / fade, (out.length - 1 - i) / fade);
    out[i] = out[i] * gain * f;
  }
  return out;
}

/* ---------- run ---------- */

try { execFileSync('which', ['say'], { stdio: 'ignore' }); } catch (e) {
  console.error('This script needs the macOS `say` command.');
  process.exit(1);
}

var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pl-audio-'));
var long = [];
jobs.forEach(function (job, n) {
  var dir = path.join(OUT, job.dir);
  fs.mkdirSync(dir, { recursive: true });
  var raw = path.join(tmp, job.dir + '-' + job.name + '.wav');
  execFileSync('say', ['-v', VOICE, '-r', String(job.rate), '--file-format=WAVE', '--data-format=LEI16@' + RATE, '-o', raw, forVoice(job)]);
  var wav = readWav(raw);
  var out = clean(wav.samples, wav.rate);
  writeWav(path.join(dir, job.name + '.wav'), out, wav.rate);
  job.seconds = out.length / wav.rate;
  // A word clip much longer than a second usually means the voice spelled it out letter by letter
  if (job.dir !== 'sentences' && job.seconds > 1.1) long.push(job.dir + '/' + job.name + ' (' + job.seconds.toFixed(2) + 's)');
  process.stdout.write('\r' + (n + 1) + ' / ' + jobs.length + ' clips');
});
fs.rmSync(tmp, { recursive: true, force: true });
process.stdout.write('\n');

/* ---------- recording checklist ---------- */

var lines = [
  '# Audio clips',
  '',
  'Every word, keyword picture, and sentence in Letter Chains plays from a file in this folder.',
  'The page never uses the computer\'s built-in voice when a file is here, so it sounds the same on',
  'every computer and browser.',
  '',
  '**The current files are placeholders** made with the macOS voice "' + VOICE + '" by',
  '`tools/make-placeholder-audio.js`. Apple\'s license limits that voice to personal, non-commercial use,',
  'so record these with a real voice before shipping to schools.',
  '',
  '## Recording tips',
  '',
  '- Record each item on its own, in a quiet room, at a normal speaking pace.',
  '- Say short vowels clearly: /ă/ as in apple, /ĭ/ as in igloo, /ŏ/ as in octopus.',
  '- C and g are always hard here: "cit" is /k/ /ĭ/ /t/, not "sit".',
  '- Save as WAV or MP3 with the file name below (`cat.wav` or `cat.mp3`). If both exist, the MP3 is used.',
  '- Trim silence at the start and end, and keep levels even between clips.',
  '- After adding or replacing files, run `node tools/build-audio.js`. The page loads the `.js` file next to',
  '  each clip, because its security policy stops scripts from downloading audio files directly.',
  ''
];
[['words', 'Words'], ['keywords', 'Keyword pictures'], ['sentences', 'Sentences']].forEach(function (g) {
  var list = jobs.filter(function (j) { return j.dir === g[0]; });
  lines.push('## ' + g[1] + ' (' + list.length + ')', '', '| File | Say |', '| --- | --- |');
  list.forEach(function (j) { lines.push('| `' + j.dir + '/' + j.name + '.wav` | ' + j.label + ' |'); });
  lines.push('');
});
fs.writeFileSync(path.join(OUT, 'README.md'), lines.join('\n'));
require('./build-audio')();

console.log('Wrote ' + jobs.length + ' clips to assets/audio/ and a checklist to assets/audio/README.md');
if (long.length) console.log('Check these; the voice may have spelled them out: ' + long.join(', '));
