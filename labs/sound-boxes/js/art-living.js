/* Primary Labs · Sound Boxes: drawings of animals and people.
   Cat, pig, dog, pup, hen, bug and bat, and a kid, lips and a leg.
   Each part is the inside of a 120 × 120 picture; js/art.js adds the ink outline.
   Parts copied from Story Puzzles (js/art.js) and Letter Chains (js/art.js) are unchanged. */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});
  var P = (SB.PARTS = SB.PARTS || {});

  /* ---------------------------------------------------------------- from Story Puzzles (js/art.js) */

  P.cat =
    '<path d="M18 108 C14 78 32 62 60 62 C88 62 106 78 104 92 C112 98 112 108 98 108 Z" fill="#F59E42"/>' +
    '<path d="M22 90 L30 88 M21 98 L29 97" fill="none" stroke="#C46A1B" stroke-width="3.5"/>' +
    '<path d="M104 92 C106 99 100 99 94 99 L68 99 A4.5 4.5 0 0 0 68 108" fill="none" stroke-width="3"/>' +
    '<path d="M80 100 L79 107 M90 100 L89 107" fill="none" stroke="#C46A1B" stroke-width="3.5"/>' +
    '<ellipse cx="40" cy="104" rx="8.5" ry="5" fill="#F59E42"/>' +
    '<ellipse cx="55" cy="104" rx="8.5" ry="5" fill="#F59E42"/>' +
    '<path d="M36 41 L38.4 12.4 L58.4 30 Z" fill="#F59E42"/>' +
    '<path d="M84 41 L81.6 12.4 L61.6 30 Z" fill="#F59E42"/>' +
    '<path d="M40.8 33.2 L41.6 21.2 L51.2 29.2 Z" fill="#F7A1B5" stroke="none"/>' +
    '<path d="M79.2 33.2 L78.4 21.2 L68.8 29.2 Z" fill="#F7A1B5" stroke="none"/>' +
    '<ellipse cx="60" cy="54" rx="29.6" ry="25.6" fill="#F59E42"/>' +
    '<path d="M54.4 32 L56 38.4 M60 30.4 L60 37.6 M65.6 32 L64 38.4" fill="none" stroke="#C46A1B" stroke-width="3"/>' +
    '<path d="M43 49 Q49 55 55 49 M65 49 Q71 55 77 49" fill="none" stroke-width="3"/>' +
    '<path d="M56 58.4 L64 58.4 L60 63.2 Z" fill="#E4572E" stroke-width="2"/>' +
    '<path d="M60 63.2 Q56 69 51 66 M60 63.2 Q64 69 69 66" fill="none" stroke-width="2.5"/>' +
    '<path d="M42.4 59.6 L26.4 56.4 M42.4 63.6 L27.2 66 M77.6 59.6 L93.6 56.4 M77.6 63.6 L92.8 66" fill="none" stroke-width="2"/>';

  P.pig =
    '<path d="M89 88 q11 -6 10 2 q-1 7 7 3" fill="none" stroke-width="3"/>' +
    '<ellipse cx="34" cy="100" rx="11" ry="8" fill="#F9B8C8"/>' +
    '<ellipse cx="86" cy="100" rx="11" ry="8" fill="#F9B8C8"/>' +
    '<ellipse cx="60" cy="86" rx="30" ry="22" fill="#F9B8C8"/>' +
    '<rect x="45" y="88" width="12" height="20" rx="5" fill="#F9B8C8"/>' +
    '<rect x="63" y="88" width="12" height="20" rx="5" fill="#F9B8C8"/>' +
    '<path d="M45.5 102 H56.5 M63.5 102 H74.5" fill="none" stroke-width="2.5"/>' +
    '<path d="M38 28 L34 10 L52 19 Z" fill="#F9B8C8"/>' +
    '<path d="M82 28 L86 10 L68 19 Z" fill="#F9B8C8"/>' +
    '<path d="M39 22 L37.5 15 L45 19 Z" fill="#F7A1B5" stroke="none"/>' +
    '<path d="M81 22 L82.5 15 L75 19 Z" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="60" cy="44" r="28" fill="#F9B8C8"/>' +
    '<circle cx="40" cy="54" r="4.5" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="80" cy="54" r="4.5" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="49" cy="42" r="4" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="71" cy="42" r="4" fill="#1F2A44" stroke="none"/>' +
    '<ellipse cx="60" cy="55" rx="12" ry="8.5" fill="#F7A1B5"/>' +
    '<ellipse cx="56" cy="55" rx="2" ry="3" fill="#1F2A44" stroke="none"/>' +
    '<ellipse cx="64" cy="55" rx="2" ry="3" fill="#1F2A44" stroke="none"/>' +
    '<path d="M54 66.5 Q60 70 66 66.5" fill="none" stroke-width="2.5"/>';

  P.dog =
    '<path d="M18 62 Q8 52 10 34" fill="none" stroke-width="11"/>' +
    '<path d="M18 62 Q8 52 10 34" fill="none" stroke="#FFFFFF" stroke-width="5"/>' +
    '<rect x="28" y="74" width="11" height="34" rx="5" fill="#FFFFFF"/>' +
    '<rect x="62" y="74" width="11" height="34" rx="5" fill="#FFFFFF"/>' +
    '<rect x="14" y="54" width="68" height="30" rx="15" fill="#FFFFFF"/>' +
    '<rect x="18" y="74" width="11" height="34" rx="5" fill="#FFFFFF"/>' +
    '<rect x="72" y="74" width="11" height="34" rx="5" fill="#FFFFFF"/>' +
    '<ellipse cx="94" cy="49" rx="13" ry="9" fill="#FFFFFF"/>' +
    '<circle cx="80" cy="40" r="19" fill="#FFFFFF"/>' +
    '<ellipse cx="94" cy="49" rx="13" ry="9" fill="#FFFFFF" stroke="none"/>' +
    '<path d="M90 40.5 Q100 39 105 43 Q109 48 104 56 Q98 59 90 57" fill="none" stroke-width="3"/>' +
    '<ellipse cx="106" cy="45" rx="4.5" ry="3.8" fill="#1F2A44" stroke="none"/>' +
    '<ellipse cx="84" cy="36" rx="8" ry="8.5" fill="#A0673A" stroke="none"/>' +
    '<circle cx="85" cy="36" r="4" fill="#1F2A44" stroke="none"/>' +
    '<path d="M72 24 C62 24 58 42 62 54 C68 56 74 46 76 32 Z" fill="#A0673A"/>' +
    '<path d="M94 57 Q99 60 103 56" fill="none" stroke-width="2.5"/>' +
    '<path d="M68 56 Q76 64 90 58" fill="none" stroke="#E4572E" stroke-width="5"/>';

  P.pup =
    '<path d="M82 98 Q98 94 96 78" fill="none" stroke-width="11"/>' +
    '<path d="M82 98 Q98 94 96 78" fill="none" stroke="#D9A066" stroke-width="5"/>' +
    '<path d="M36 108 C32 84 42 62 60 62 C78 62 88 84 84 108 Z" fill="#D9A066"/>' +
    '<ellipse cx="60" cy="84" rx="11" ry="13" fill="#FFF4DC" stroke="none"/>' +
    '<ellipse cx="38" cy="103" rx="11" ry="6" fill="#D9A066"/>' +
    '<ellipse cx="82" cy="103" rx="11" ry="6" fill="#D9A066"/>' +
    '<rect x="47" y="86" width="11" height="22" rx="5" fill="#D9A066"/>' +
    '<rect x="62" y="86" width="11" height="22" rx="5" fill="#D9A066"/>' +
    '<ellipse cx="60" cy="42" rx="23" ry="24.5" fill="#D9A066"/>' +
    '<path d="M40.6 24.7 C29 26.2 25.4 47.8 31.9 57.8 C39.1 60 44.2 47.8 43.4 36.2 Z" fill="#A0673A"/>' +
    '<path d="M79.4 24.7 C91 26.2 94.6 47.8 88.1 57.8 C80.9 60 75.8 47.8 76.6 36.2 Z" fill="#A0673A"/>' +
    '<ellipse cx="60" cy="54.2" rx="13" ry="9.4" fill="#FFF4DC"/>' +
    '<ellipse cx="60" cy="49" rx="4.7" ry="3.3" fill="#1F2A44" stroke="none"/>' +
    '<path d="M53 56 Q60 66 67 56 Z" fill="#E4572E" stroke-width="2.5"/>' +
    '<circle cx="51.4" cy="37" r="4" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="68.6" cy="37" r="4" fill="#1F2A44" stroke="none"/>';

  P.hen =
    '<path d="M46 66 L38 26 Q22 24 24 40 Q8 40 13 56 Q4 64 18 74 Z" fill="#C46A1B"/>' +
    '<path d="M22 84 C22 66 36 60 52 62 C62 63 68 60 74 58 C90 56 98 70 98 84 C98 100 82 108 60 108 C38 108 22 100 22 84 Z" fill="#E4572E"/>' +
    '<path d="M40 84 Q60 72 80 86 Q60 100 40 84 Z" fill="#C46A1B" stroke-width="2.5"/>' +
    '<path d="M72 38 Q70 28 77 30 Q79 22 85 28 Q91 24 92 34 Z" fill="#E4572E"/>' +
    '<path d="M96 56 Q100 66 94 66 Q90 62 94 56 Z" fill="#E4572E" stroke-width="2.5"/>' +
    '<path d="M97 45 L110 50 L97 55 Z" fill="#FFC93C"/>' +
    '<circle cx="82" cy="48" r="16" fill="#E4572E"/>' +
    '<circle cx="86" cy="45" r="4" fill="#1F2A44" stroke="none"/>';

  P.bug =
    '<path d="M32 56 L14 46 M28 74 L9 74 M32 92 L14 102 M88 56 L106 46 M92 74 L111 74 M88 92 L106 102" fill="none" stroke-width="5"/>' +
    '<path d="M53 16 Q48 6 40 6 M67 16 Q72 6 80 6" fill="none" stroke-width="3"/>' +
    '<circle cx="40" cy="6" r="3.5" fill="#1F2A44"/>' +
    '<circle cx="80" cy="6" r="3.5" fill="#1F2A44"/>' +
    '<circle cx="60" cy="28" r="17" fill="#1F2A44"/>' +
    '<circle cx="60" cy="72" r="36" fill="#E4572E"/>' +
    '<path d="M60 36 L60 108" fill="none" stroke-width="3"/>' +
    '<circle cx="43" cy="56" r="7" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="77" cy="56" r="7" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="38" cy="78" r="6.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="82" cy="78" r="6.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="48" cy="97" r="6" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="72" cy="97" r="6" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="53" cy="23" r="5.5" fill="#FFFFFF" stroke="none"/>' +
    '<circle cx="67" cy="23" r="5.5" fill="#FFFFFF" stroke="none"/>' +
    '<circle cx="54" cy="24" r="3" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="66" cy="24" r="3" fill="#1F2A44" stroke="none"/>';

  P.bat =
    '<path d="M50 54 C42 38 26 30 6 32 C12 40 12 48 9 56 Q19 50 23 62 Q31 52 37 66 Q44 60 50 72 Z" fill="#9B5DE5"/>' +
    '<path d="M70 54 C78 38 94 30 114 32 C108 40 108 48 111 56 Q101 50 97 62 Q89 52 83 66 Q76 60 70 72 Z" fill="#9B5DE5"/>' +
    '<ellipse cx="60" cy="66" rx="12" ry="15" fill="#8E7CC3"/>' +
    '<path d="M48 38 L46 20 L58 30 Z" fill="#8E7CC3"/>' +
    '<path d="M72 38 L74 20 L62 30 Z" fill="#8E7CC3"/>' +
    '<path d="M49.5 31 L48.5 25 L54 29 Z" fill="#F7A1B5" stroke="none"/>' +
    '<path d="M70.5 31 L71.5 25 L66 29 Z" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="60" cy="44" r="15" fill="#8E7CC3"/>' +
    '<circle cx="54" cy="42" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="66" cy="42" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<path d="M56 50 L57.5 54 L59 50.5 M61 50.5 L62.5 54 L64 50" fill="#FFFFFF" stroke-width="1.5"/>' +
    '<path d="M54 49 Q60 53 66 49" fill="none" stroke-width="2.5"/>' +
    '<path d="M56 81 L55 85 M64 81 L65 85" fill="none" stroke-width="3"/>';

  /* ---------------------------------------------------------------- new for Sound Boxes */

  // a smiling child, head and shoulders
  P.kid =
    '<path d="M16 112 Q16 82 44 78 H76 Q104 82 104 112 Z" fill="#2BA84A"/>' +
    '<rect x="52" y="66" width="16" height="16" fill="#F2C9A0"/>' +
    '<circle cx="32" cy="52" r="6" fill="#F2C9A0"/>' +
    '<circle cx="88" cy="52" r="6" fill="#F2C9A0"/>' +
    '<circle cx="60" cy="48" r="28" fill="#F2C9A0"/>' +
    '<path d="M32 46 Q30 16 60 16 Q90 16 88 46 Q78 32 60 31 Q42 32 32 46 Z" fill="#5B3A24"/>' +
    '<circle cx="50" cy="50" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="70" cy="50" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="43" cy="60" r="4" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="77" cy="60" r="4" fill="#F7A1B5" stroke="none"/>' +
    '<path d="M50 62 Q60 70 70 62" fill="none"/>';

  // red smiling lips on their own
  P.lip =
    '<path d="M12 56 Q60 72 108 56 C98 80 82 90 60 90 C38 90 22 80 12 56 Z" fill="#E4572E"/>' +
    '<path d="M12 56 C24 44 38 34 50 36 C55 37 58 40 60 42 C62 40 65 37 70 36 C82 34 96 44 108 56 Q60 72 12 56 Z" fill="#E4572E"/>' +
    '<path d="M44 79 Q60 84 74 79" fill="none" stroke="#F9B8C8" stroke-width="4"/>' +
    '<path d="M38 46 Q46 42 52 44" fill="none" stroke="#F9B8C8" stroke-width="3.5"/>';

  // one bare leg in blue shorts, foot pointing right
  P.leg =
    '<path d="M42 8 H74 C76 30 78 46 75 58 C73 66 70 76 69 88 C80 92 96 94 104 98 C110 101 110 110 102 110 H46 C40 110 38 104 40 94 C38 82 34 72 38 62 C40 54 40 30 42 8 Z" fill="#F2C9A0"/>' +
    '<path d="M66 58 Q70 62 74 60" fill="none" stroke-width="2.5"/>' +
    '<path d="M96 100 V106 M102 101 V106" fill="none" stroke="#E8B48A" stroke-width="2.5"/>' +
    '<path d="M32 6 H84 V36 Q58 42 32 36 Z" fill="#2B6CB0"/>' +
    '<path d="M36 30 Q58 35 80 30" fill="none" stroke="#5AA9FF" stroke-width="3"/>';
})(typeof window !== 'undefined' ? window : this);
