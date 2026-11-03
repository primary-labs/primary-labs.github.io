'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load');

const SP = load('js/stories.js', 'js/art.js');
const Art = SP.Art;

test('every picture a story uses is drawn', () => {
  for (const s of SP.STORIES) {
    for (const p of [...s.pieces, ...s.others]) assert.ok(Art.has(p.pic), `${s.id}: ${p.pic}`);
  }
});

test('pieces are plain SVG: no text, ids, styles or links', () => {
  for (const s of SP.STORIES) {
    for (const p of [...s.pieces, ...s.others]) {
      const svg = Art.piece(p.pic);
      assert.match(svg, /^<svg class="piece-svg" viewBox="0 -1 100 122" aria-hidden="true" focusable="false">/, p.pic);
      assert.doesNotMatch(svg, /style=|<text|\sid=|href|<use|<image|url\(/, p.pic);
      assert.doesNotMatch(svg, /undefined|NaN/, p.pic);
    }
  }
});

test('a puzzle piece is the jigsaw shape with its picture, and an empty spot is the shape alone', () => {
  const piece = Art.piece('cat-mat');
  assert.match(piece, /class="piece-shape"/);
  assert.match(piece, /viewBox="0 0 120 120"/, 'the picture is nested inside');
  assert.doesNotMatch(Art.piece(null), /viewBox="0 0 120 120"/);
});

// Controls use drawn icons, not emoji (DESIGN.md, principle 7).
test('art has the control icons', () => {
  for (const name of ['speaker', 'bell', 'bellOff', 'next', 'again', 'check']) {
    const svg = Art.icons && Art.icons[name];
    assert.equal(typeof svg, 'string', name);
    assert.match(svg, /^<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">/, name);
    assert.match(svg, /currentColor/, `${name} follows the text color`);
    assert.doesNotMatch(svg, /style=/, name);
  }
  assert.notEqual(Art.icons.bell, Art.icons.bellOff);
});
