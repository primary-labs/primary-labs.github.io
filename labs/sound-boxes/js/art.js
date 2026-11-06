/* Primary Labs · Sound Boxes: pictures and control icons.
   Static, trusted strings. The drawings live in js/art-living.js and js/art-things.js (SB.PARTS),
   in a 120 × 120 box with an ink outline, like Letter Chains' and Story Puzzles' pictures. Many
   come from those labs. A few pictures are two parts layered (a net's back, then its front). */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});

  var INK = '#1F2A44';
  var P = SB.PARTS || {};

  /* Pictures drawn from more than one part, back to front. */
  var LAYERS = {
    net: ['net-back', 'net-front'],
    pan: ['pan-back', 'pan-front']
  };

  /* Story Puzzles drew these sitting low, on the floor of a scene. Here each picture stands on its
     own, so they move up (in 120ths) to the middle of the box. */
  var LIFT = { cap: 15, map: 19, pan: 21, bun: 13, bus: 11 };

  function inner(word) {
    var art = LAYERS[word] ? LAYERS[word].map(function (p) { return P[p]; }).join('') : P[word] || '';
    return LIFT[word] ? '<g transform="translate(0 -' + LIFT[word] + ')">' + art + '</g>' : art;
  }

  // Every shape gets the ink outline unless it says otherwise.
  var OUTLINE = '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">';

  function picture(word) {
    return '<svg class="pic-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      OUTLINE + inner(word) + '</g></svg>';
  }

  /* ---------- control icons ----------
     Drawn like the other labs' icons (DESIGN.md: no emoji on controls). */
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">';
  var BELL = 'M12 3.5a1.5 1.5 0 0 1 1.5 1.5v.6A6 6 0 0 1 18 11.5v3.2l1.6 2.3a.6.6 0 0 1-.5 1H4.9a.6.6 0 0 1-.5-1L6 14.7v-3.2a6 6 0 0 1 4.5-5.9V5A1.5 1.5 0 0 1 12 3.5z';
  var CLAPPER = '<path d="M9.8 20a2.3 2.3 0 0 0 4.4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  var icons = {
    speaker: ICON + '<path d="M3.5 9h4l5-4.5v15l-5-4.5h-4z" fill="currentColor"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.6 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bell: ICON + '<path d="' + BELL + '" fill="currentColor"/>' + CLAPPER + '</svg>',
    // Off: an outline bell with a slash, so it reads differently from the solid "on" bell.
    bellOff: ICON + '<path d="' + BELL + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' + CLAPPER +
      '<path d="M4 3.5l16 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    next: ICON + '<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // Three boxes in a row, for the Levels button.
    boxes: ICON + '<rect x="2.5" y="8" width="5.5" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<rect x="9.25" y="8" width="5.5" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<rect x="16" y="8" width="5.5" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  };

  SB.Art = {
    has: function (word) {
      if (LAYERS[word]) return LAYERS[word].every(function (p) { return !!P[p]; });
      return !!P[word];
    },
    picture: picture,
    icons: icons
  };
})(typeof window !== 'undefined' ? window : this);
