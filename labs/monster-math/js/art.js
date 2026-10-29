/* Primary Labs · Monster Math: the monster and robot drawings and the red X.
   Each friend comes in three faces (0, 1, 2). Bodies use currentColor, so CSS sets their color. */
(function (root) {
  'use strict';
  var MM = (root.MM = root.MM || {});

  var O = 'stroke="#1E2940" stroke-width="3" stroke-linejoin="round"';

  function monster(v) {
    var eyes = [
      '<circle cx="50" cy="50" r="15" fill="#FFFFFF" ' + O + '/><circle cx="53" cy="52" r="7" fill="#1E2940"/><circle cx="56" cy="48" r="2.5" fill="#FFFFFF"/>',
      '<circle cx="37" cy="50" r="10" fill="#FFFFFF" ' + O + '/><circle cx="63" cy="50" r="10" fill="#FFFFFF" ' + O + '/><circle cx="39" cy="52" r="4.5" fill="#1E2940"/><circle cx="65" cy="52" r="4.5" fill="#1E2940"/>',
      '<circle cx="32" cy="50" r="7" fill="#FFFFFF" ' + O + '/><circle cx="50" cy="42" r="8" fill="#FFFFFF" ' + O + '/><circle cx="68" cy="50" r="7" fill="#FFFFFF" ' + O + '/><circle cx="33" cy="51" r="3" fill="#1E2940"/><circle cx="51" cy="43" r="3.5" fill="#1E2940"/><circle cx="69" cy="51" r="3" fill="#1E2940"/>'
    ][v];
    return '<svg class="art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<path d="M30 30 L22 8 L42 24 Z" fill="currentColor" ' + O + '/>' +
      '<path d="M70 30 L78 8 L58 24 Z" fill="currentColor" ' + O + '/>' +
      '<ellipse cx="35" cy="91" rx="11" ry="6" fill="currentColor" ' + O + '/>' +
      '<ellipse cx="65" cy="91" rx="11" ry="6" fill="currentColor" ' + O + '/>' +
      '<path d="M13 60 C13 31 29 20 50 20 C71 20 87 31 87 60 C87 81 71 90 50 90 C29 90 13 81 13 60 Z" fill="currentColor" ' + O + '/>' +
      eyes +
      '<path d="M33 69 Q50 84 67 69" fill="none" stroke="#1E2940" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M40 72.5 L43.5 79 L47 75 Z" fill="#FFFFFF"/>' +
      '<path d="M53 75 L56.5 79 L60 72.5 Z" fill="#FFFFFF"/>' +
      '</svg>';
  }

  function robot(v) {
    var eyes = [
      '<rect x="31" y="29" width="14" height="14" rx="3" fill="#FFFFFF" ' + O + '/><rect x="55" y="29" width="14" height="14" rx="3" fill="#FFFFFF" ' + O + '/><rect x="36" y="34" width="5" height="5" fill="#1E2940"/><rect x="60" y="34" width="5" height="5" fill="#1E2940"/>',
      '<rect x="29" y="31" width="42" height="12" rx="6" fill="#FFFFFF" ' + O + '/><circle cx="42" cy="37" r="3.5" fill="#1E2940"/><circle cx="58" cy="37" r="3.5" fill="#1E2940"/>',
      '<circle cx="39" cy="36" r="8" fill="#FFFFFF" ' + O + '/><circle cx="61" cy="36" r="8" fill="#FFFFFF" ' + O + '/><circle cx="39" cy="36" r="3.5" fill="#1E2940"/><circle cx="61" cy="36" r="3.5" fill="#1E2940"/>'
    ][v];
    return '<svg class="art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<line x1="50" y1="10" x2="50" y2="21" stroke="#1E2940" stroke-width="3"/>' +
      '<circle cx="50" cy="8" r="5.5" fill="#FFC83D" ' + O + '/>' +
      '<path d="M30 70 L16 82" fill="none" stroke="#1E2940" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M70 70 L84 82" fill="none" stroke="#1E2940" stroke-width="6" stroke-linecap="round"/>' +
      '<rect x="31" y="61" width="38" height="31" rx="7" fill="currentColor" ' + O + '/>' +
      '<circle cx="50" cy="76" r="5" fill="#FF6B6B" ' + O + '/>' +
      '<rect x="20" y="20" width="60" height="41" rx="11" fill="currentColor" ' + O + '/>' +
      '<rect x="15" y="34" width="5" height="12" rx="2" fill="#1E2940"/>' +
      '<rect x="80" y="34" width="5" height="12" rx="2" fill="#1E2940"/>' +
      eyes +
      '<rect x="37" y="48" width="26" height="7" rx="2" fill="#1E2940"/>' +
      '<line x1="43.5" y1="48" x2="43.5" y2="55" stroke="#FFFFFF" stroke-width="1.5"/>' +
      '<line x1="50" y1="48" x2="50" y2="55" stroke="#FFFFFF" stroke-width="1.5"/>' +
      '<line x1="56.5" y1="48" x2="56.5" y2="55" stroke="#FFFFFF" stroke-width="1.5"/>' +
      '</svg>';
  }

  // Colored by CSS (.x line), so it follows the theme.
  var X = '<svg class="x" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
    '<line x1="14" y1="14" x2="86" y2="86"/><line x1="86" y1="14" x2="14" y2="86"/></svg>';

  // Icons for controls, drawn like Letter Chains' icons (DESIGN.md: no emoji on controls).
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">';
  var BELL = 'M12 3.5a1.5 1.5 0 0 1 1.5 1.5v.6A6 6 0 0 1 18 11.5v3.2l1.6 2.3a.6.6 0 0 1-.5 1H4.9a.6.6 0 0 1-.5-1L6 14.7v-3.2a6 6 0 0 1 4.5-5.9V5A1.5 1.5 0 0 1 12 3.5z';
  var CLAPPER = '<path d="M9.8 20a2.3 2.3 0 0 0 4.4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  var icons = {
    speaker: ICON + '<path d="M3.5 9h4l5-4.5v15l-5-4.5h-4z" fill="currentColor"/>' +
      '<path d="M16 8.5a5 5 0 0 1 0 7M18.6 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bell: ICON + '<path d="' + BELL + '" fill="currentColor"/>' + CLAPPER + '</svg>',
    // Off: an outline bell with a slash, so it reads differently from the solid "on" bell.
    bellOff: ICON + '<path d="' + BELL + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' + CLAPPER +
      '<path d="M4 3.5l16 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  MM.Art = {
    friend: function (kind, v) { return kind === 'monster' ? monster(v % 3) : robot(v % 3); },
    X: X,
    icons: icons
  };
})(window);
