#!/usr/bin/env node
/* Lists every line Story Puzzles says, for whoever makes the clips (a voice tool or a person).
 *
 *   node tools/list-phrases.js              JSON: [{ "id": "fat-cat-1", "text": "Pam has a cat." }, ...]
 *   node tools/list-phrases.js --readme     rewrites assets/audio/README.md (the clip list)
 *
 * The site's tools/voice/story_puzzles.py reads the JSON. Each clip is saved as
 * assets/audio/phrases/<id>.mp3, then wrapped with node tools/build-audio.js.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

/* Loads the stories and phrases the way the page does, and returns window.SP. */
function load() {
  var sandbox = { window: {} };
  vm.createContext(sandbox);
  ['stories.js', 'phrases.js'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), sandbox, { filename: f });
  });
  return sandbox.window.SP;
}

function phrases() {
  return load().Phrases.all().map(function (p) { return { id: p.id, text: p.say }; });
}

function readme(list) {
  return [
    '# Audio clips',
    '',
    'Every line Story Puzzles says plays from a clip in `phrases/`: each story\'s lines, "Let\'s read …" with its title, and the',
    "directions. A line without a clip falls back to the device's built-in voice, which sounds different on",
    'every computer, so every line should have one.',
    '',
    '**These clips are computer-generated** with the "Heart" voice of Kokoro-82M, an open-source voice',
    "model, by the site's `tools/voice/story_puzzles.py`. Each one was checked automatically: one",
    'recognizer had to hear exactly the words below and a second one exactly their sounds, and further',
    'checks look for glitches. `tools/voice/README.md` explains the method. Do not use macOS voices',
    '(Samantha, Daniel and the rest): Apple allows them for personal use only.',
    '',
    '## Replacing a clip',
    '',
    '1. Save it as a mono MP3 at 96 kbps, `phrases/<file>.mp3`, using the names below.',
    '2. Run `node tools/build-audio.js` (add `--from <manifest.json>` for clips from the voice tool). It',
    '   wraps each clip in a `.js` file and updates `index.js`.',
    '3. Only the `.js` files need to be deployed.',
    '',
    'Trim silence at the start and end, and keep levels even with the other clips.',
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

module.exports = { phrases: phrases, load: load };
