'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const { Art } = load('js/art.js');

// Controls use drawn icons, not emoji (DESIGN.md, principle 7).
test('art has the speaker and bell icons for controls', () => {
  for (const name of ['speaker', 'bell', 'bellOff']) {
    const svg = Art.icons && Art.icons[name];
    assert.equal(typeof svg, 'string', name);
    assert.match(svg, /^<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">/, name);
    assert.match(svg, /currentColor/, `${name} follows the text color`);
    assert.doesNotMatch(svg, /style=/, name);
  }
});

test('the bell and the bell-off icons look different', () => {
  assert.notEqual(Art.icons.bell, Art.icons.bellOff);
});
