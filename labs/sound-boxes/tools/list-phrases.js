#!/usr/bin/env node
/* Lists the directions Sound Boxes says, for whoever makes the clips (a voice tool or a person).
 *
 *   node tools/list-phrases.js              JSON: [{ "id": "which", "text": "Which picture?" }, ...]
 *   node tools/list-phrases.js --readme     rewrites assets/audio/README.md (the clip list)
 *
 * The site's tools/voice/sound_boxes.py reads the JSON. Each clip is saved as
 * assets/audio/phrases/<id>.mp3, then wrapped with node tools/build-audio.js.
 * Letter sounds and words aren't listed: they are copied from Letter Chains (tools/copy-clips.js).
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

/* Loads the words, rounds and phrases the way the page does, and returns window.SB. */
function load() {
  var sandbox = { window: {} };
  vm.createContext(sandbox);
  ['words.js', 'rounds.js', 'phrases.js'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), sandbox, { filename: f });
  });
  return sandbox.window.SB;
}

function phrases() {
  return load().Phrases.all().map(function (p) { return { id: p.id, text: p.say }; });
}

/* The words the levels use, and the letters their trays show, in a-to-z order. */
function used() {
  var SB = load();
  var words = {}, letters = {};
  SB.LEVELS.forEach(function (lv) {
    lv.words.forEach(function (w) {
      words[w] = true;
      SB.tiles(w).forEach(function (l) { letters[l] = true; });
    });
  });
  return { words: Object.keys(words).sort(), letters: Object.keys(letters).sort(), SB: SB };
}

function readme(list) {
  var u = used();
  var sounds = u.letters.map(function (l) { return u.SB.soundClip(l).slice(7); })
    .filter(function (s, i, a) { return a.indexOf(s) === i; });
  return [
    '# Audio clips',
    '',
    'Sound Boxes plays three kinds of clip:',
    '',
    '- `sounds/`: letter sounds, copied unchanged from Letter Chains (`labs/letter-chaining/assets/audio/sounds/`), MP3 at 128 kbps.',
    '- `words/`: the words, copied unchanged from Letter Chains (`.../words/`), MP3 at 96 kbps.',
    '- `phrases/`: the spoken directions, made for this lab by the site\'s `tools/voice/sound_boxes.py`, MP3 at 96 kbps.',
    '',
    'Run `node tools/copy-clips.js` to copy the sounds and words again (after a word or level changes, or',
    'after Letter Chains remakes a clip), then `node tools/build-audio.js`. Never make a new letter sound',
    'here: the owner picks every letter sound by ear in Letter Chains.',
    '',
    '**These clips are computer-generated** with the "Heart" voice of Kokoro-82M, an open-source voice',
    'model. `tools/voice/README.md` explains how they were made and checked. Do not use macOS voices',
    '(Samantha, Daniel and the rest): Apple allows them for personal use only.',
    '',
    'Regenerate this list with `node tools/list-phrases.js --readme`.',
    '',
    '## Letter sounds (' + sounds.length + ')',
    '',
    sounds.map(function (s) { return '`' + s + '`'; }).join(' ') + (u.letters.indexOf('k') !== -1 ? ' (k plays `c`)' : ''),
    '',
    '## Words (' + u.words.length + ')',
    '',
    u.words.map(function (w) { return '`' + w + '`'; }).join(' '),
    '',
    '## Directions (' + list.length + ')',
    '',
    '| File | Say |',
    '| --- | --- |'
  ].concat(list.map(function (p) { return '| `' + p.id + '` | ' + p.text + ' |'; })).join('\n') + '\n';
}

if (require.main === module) {
  var list = phrases();
  if (process.argv.includes('--readme')) {
    var out = path.join(__dirname, '..', 'assets', 'audio', 'README.md');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, readme(list));
    console.log('Wrote ' + path.relative(process.cwd(), out));
  } else {
    process.stdout.write(JSON.stringify(list, null, 2) + '\n');
  }
}

module.exports = { phrases: phrases, load: load, used: used };
