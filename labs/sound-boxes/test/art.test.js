'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const SB = load('js/words.js', 'js/art-living.js', 'js/art-things.js', 'js/art.js');
const Art = SB.Art;
const pictures = [...new Set(Object.entries(SB.WORDS).flatMap(([w, { near }]) => [w, ...near]))];

test('every word and every wrong picture is drawn', () => {
  for (const p of pictures) assert.ok(Art.has(p), p);
});

test('pictures are plain SVG drawings: no text, emoji, ids, styles or links', () => {
  for (const p of pictures) {
    const svg = Art.picture(p);
    assert.match(svg, /^<svg class="pic-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">/, p);
    assert.doesNotMatch(svg, /style=|<text|\sid=|href|<use|<image|url\(/, p);
    assert.doesNotMatch(svg, /undefined|NaN/, p);
    assert.doesNotMatch(svg, /[^\x00-\x7F]/, `${p} has no emoji or other non-ASCII characters`);
    assert.ok(svg.length > 300, `${p} is a drawing, not an empty box`);
  }
});

test('no two pictures are the same drawing', () => {
  const seen = new Map();
  for (const p of pictures) {
    const svg = Art.picture(p);
    assert.ok(!seen.has(svg), `${p} looks the same as ${seen.get(svg)}`);
    seen.set(svg, p);
  }
});

// Controls use drawn icons, not emoji (DESIGN.md, principle 7).
test('art has the control icons', () => {
  for (const name of ['speaker', 'bell', 'bellOff', 'next', 'boxes']) {
    const svg = Art.icons && Art.icons[name];
    assert.equal(typeof svg, 'string', name);
    assert.match(svg, /^<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">/, name);
    assert.match(svg, /currentColor/, `${name} follows the text color`);
    assert.doesNotMatch(svg, /style=/, name);
  }
  assert.notEqual(Art.icons.bell, Art.icons.bellOff);
});
