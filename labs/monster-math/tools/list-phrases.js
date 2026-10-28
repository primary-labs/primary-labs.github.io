#!/usr/bin/env node
/* Lists every line Monster Math says, for whoever makes the clips (a voice tool or a person).
 *
 *   node tools/list-phrases.js              JSON: [{ "id": "problem-add-3-2", "text": "three plus two" }, ...]
 *   node tools/list-phrases.js --readme     rewrites assets/audio/README.md (the recording list)
 *
 * Each clip is saved as assets/audio/phrases/<id>.wav (or .mp3), then wrapped with
 * node tools/build-audio.js.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

function phrases() {
  var sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'phrases.js'), 'utf8'), sandbox);
  return sandbox.window.MM.Phrases.all().map(function (p) { return { id: p.id, text: p.say }; });
}

function readme(list) {
  return [
    '# Audio clips',
    '',
    'Every line Monster Math says can play from a clip in `phrases/`. Lines without a clip use the',
    "device's built-in voice, which sounds different on every computer, so the goal is a clip for all of them.",
    '',
    'There are no clips yet. The default voice will come from the same open-source voice tool as',
    'Letter Chains. Do not use macOS voices (Samantha, Daniel and the rest): Apple allows them for',
    'personal use only.',
    '',
    '## Adding clips',
    '',
    '1. Save each clip as `phrases/<file>.wav` or `.mp3`, using the names below.',
    '2. Run `node tools/build-audio.js`. It wraps each clip in a `.js` file and updates `index.js`.',
    '3. Only the `.js` files need to be deployed.',
    '',
    'Trim silence at the start and end, and keep levels even between clips. MP3 keeps the folder',
    'small (about 350 clips).',
    '',
    'Regenerate this list with `node tools/list-phrases.js --readme`.',
    '',
    '## Clips (' + list.length + ')',
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
    console.log('Wrote ' + list.length + ' clips to ' + path.relative(process.cwd(), out));
  } else {
    process.stdout.write(JSON.stringify(list, null, 2) + '\n');
  }
}

module.exports = { phrases: phrases };
