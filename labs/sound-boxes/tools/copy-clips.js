#!/usr/bin/env node
/* Copies the letter sounds and words Sound Boxes uses from Letter Chains, unchanged.
 *
 *   node tools/copy-clips.js
 *
 * Letter Chains owns these clips: the owner picked every letter sound there by ear, so this lab
 * never makes its own. Copies sounds/<clip>.mp3 for every letter a tray shows and words/<word>.mp3
 * for every word in a level, and deletes MP3s no level needs any more. Stops if Letter Chains has
 * no clip for one. Then run node tools/build-audio.js. The tests check the copies still match.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var used = require('./list-phrases').used;

var HERE = path.join(__dirname, '..', 'assets', 'audio');
var FROM = path.join(__dirname, '..', '..', 'letter-chaining', 'assets', 'audio');

/* { group: [names] } of the clips Sound Boxes needs from Letter Chains. */
function needed() {
  var u = used();
  var sounds = {};
  u.letters.forEach(function (l) { sounds[u.SB.soundClip(l).slice('sounds/'.length)] = true; });
  return { sounds: Object.keys(sounds).sort(), words: u.words };
}

function copy(here, from) {
  var need = needed(), count = 0, missing = [];
  Object.keys(need).forEach(function (group) {
    var dir = path.join(here, group);
    fs.mkdirSync(dir, { recursive: true });
    need[group].forEach(function (name) {
      var src = path.join(from, group, name + '.mp3');
      if (!fs.existsSync(src)) { missing.push(group + '/' + name); return; }
      fs.copyFileSync(src, path.join(dir, name + '.mp3'));
      count++;
    });
    fs.readdirSync(dir).forEach(function (f) {
      if (path.extname(f) === '.mp3' && need[group].indexOf(path.basename(f, '.mp3')) === -1) fs.unlinkSync(path.join(dir, f));
    });
  });
  if (missing.length) throw new Error('Letter Chains has no clip for ' + missing.join(', ') + '. Pick another word.');
  return count;
}

module.exports = { needed: needed, copy: copy, FROM: FROM };

if (require.main === module) {
  console.log('Copied ' + copy(HERE, FROM) + ' clips from Letter Chains.');
}
