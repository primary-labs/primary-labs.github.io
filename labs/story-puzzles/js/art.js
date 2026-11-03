/* Primary Labs · Story Puzzles: the pictures, the puzzle piece, and the control icons.
   Static, trusted strings. Drawn like Letter Chains' pictures (js/art.js there): flat colors with an
   ink outline, in a 120 × 120 box.

   P holds the parts: one thing or animal each ("cat", "mat"). Some come from Letter Chains.
   SCENES builds a story picture from parts, drawn in order: [part, x, y, scale]. Later layers go on
   top, so "cat on a mat" is the mat then the cat, and "cat in a bag" is the cat then the bag over its
   lower half. A picture that isn't a scene is a part on its own ("van"). */
(function (root) {
  'use strict';
  var SP = (root.SP = root.SP || {});

  var INK = '#1F2A44';
  var P = {};

  /* ---------------------------------------------------------------- animals and people */

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

  P['wig-on-pig'] =
    '<circle cx="27" cy="62" r="10" fill="#9B5DE5"/>' +
    '<circle cx="93" cy="62" r="10" fill="#9B5DE5"/>' +
    '<circle cx="25" cy="48" r="11" fill="#9B5DE5"/>' +
    '<circle cx="95" cy="48" r="11" fill="#9B5DE5"/>' +
    '<circle cx="29" cy="33" r="11" fill="#9B5DE5"/>' +
    '<circle cx="91" cy="33" r="11" fill="#9B5DE5"/>' +
    '<circle cx="41" cy="20" r="11" fill="#9B5DE5"/>' +
    '<circle cx="79" cy="20" r="11" fill="#9B5DE5"/>' +
    '<circle cx="60" cy="14" r="11" fill="#9B5DE5"/>' +
    '<path d="M28 66 C24 30 40 14 60 14 C80 14 96 30 92 66 L86 66 L82 34 L38 34 L34 66 Z" fill="#9B5DE5" stroke="none"/>' +
    '<circle cx="46" cy="28" r="8" fill="#9B5DE5"/>' +
    '<circle cx="60" cy="25" r="8" fill="#9B5DE5"/>' +
    '<circle cx="74" cy="28" r="8" fill="#9B5DE5"/>';

  P['bib-on-pig'] =
    '<path d="M42 65.4 A28 28 0 0 0 78 65.4 L80 82 Q80 98 60 98 Q40 98 40 82 Z" fill="#8EC5FF"/>' +
    '<path d="M45 69 Q60 77 75 69 L76 82 Q76 93 60 93 Q44 93 44 82 Z" fill="#FFFFFF" stroke="none"/>' +
    '<circle cx="60" cy="83" r="3.5" fill="#F7A1B5" stroke="none"/>';

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

  P['dog-nap'] =
    '<path d="M18 98 Q4 100 6 86" fill="none" stroke-width="11"/>' +
    '<path d="M18 98 Q4 100 6 86" fill="none" stroke="#FFFFFF" stroke-width="5"/>' +
    '<rect x="62" y="98" width="48" height="10" rx="5" fill="#FFFFFF"/>' +
    '<rect x="12" y="72" width="76" height="36" rx="18" fill="#FFFFFF"/>' +
    '<path d="M24 107 C20 92 28 84 40 84 C52 84 58 94 56 107" fill="none" stroke-width="3"/>' +
    '<ellipse cx="99" cy="89" rx="12" ry="8.5" fill="#FFFFFF"/>' +
    '<circle cx="84" cy="80" r="18" fill="#FFFFFF"/>' +
    '<ellipse cx="99" cy="89" rx="12" ry="8.5" fill="#FFFFFF" stroke="none"/>' +
    '<path d="M92 80.5 Q102 80 107 84 Q112 90 106 96 Q100 98 94 97" fill="none" stroke-width="3"/>' +
    '<ellipse cx="109" cy="86" rx="4.5" ry="3.8" fill="#1F2A44" stroke="none"/>' +
    '<ellipse cx="88" cy="77" rx="8" ry="7.5" fill="#A0673A" stroke="none"/>' +
    '<path d="M83 76 Q88 81 93 76" fill="none" stroke-width="3"/>' +
    '<path d="M76 64 C66 64 62 82 66 94 C72 96 78 86 80 72 Z" fill="#A0673A"/>';

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

  P['pup-nap'] =
    '<path d="M98 102 Q114 98 112 84" fill="none" stroke-width="11"/>' +
    '<path d="M98 102 Q114 98 112 84" fill="none" stroke="#D9A066" stroke-width="5"/>' +
    '<path d="M14 106 C10 80 32 58 60 58 C88 58 110 80 106 106 Q106 108 102 108 L18 108 Q14 108 14 106 Z" fill="#D9A066"/>' +
    '<path d="M22 107 C18 94 22 84 34 81 M98 107 C102 94 98 84 86 81" fill="none" stroke-width="3"/>' +
    '<ellipse cx="60" cy="74" rx="23" ry="23" fill="#D9A066"/>' +
    '<path d="M40.6 58 C29 59.5 25.4 81 31.9 91 C39.1 93.3 44.2 81 43.4 69.5 Z" fill="#A0673A"/>' +
    '<path d="M79.4 58 C91 59.5 94.6 81 88.1 91 C80.9 93.3 75.8 81 76.6 69.5 Z" fill="#A0673A"/>' +
    '<ellipse cx="60" cy="86" rx="13" ry="9" fill="#FFF4DC"/>' +
    '<ellipse cx="60" cy="81" rx="4.7" ry="3.3" fill="#1F2A44" stroke="none"/>' +
    '<path d="M60 84 L60 87 M60 87 Q56 91 52 88 M60 87 Q64 91 68 88" fill="none" stroke-width="2.5"/>' +
    '<path d="M46 69 Q51 74 56 69 M64 69 Q69 74 74 69" fill="none" stroke-width="3"/>' +
    '<ellipse cx="46" cy="103" rx="12" ry="6" fill="#D9A066"/>' +
    '<ellipse cx="74" cy="103" rx="12" ry="6" fill="#D9A066"/>';

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

  P.frog =
    '<ellipse cx="25" cy="97" rx="15" ry="11" fill="#2BA84A"/>' +
    '<ellipse cx="95" cy="97" rx="15" ry="11" fill="#2BA84A"/>' +
    '<ellipse cx="60" cy="84" rx="32" ry="24" fill="#2BA84A"/>' +
    '<ellipse cx="60" cy="92" rx="18" ry="14" fill="#9BC4A8" stroke="none"/>' +
    '<circle cx="40" cy="34" r="14" fill="#2BA84A"/>' +
    '<circle cx="80" cy="34" r="14" fill="#2BA84A"/>' +
    '<ellipse cx="60" cy="58" rx="36" ry="24" fill="#2BA84A"/>' +
    '<circle cx="40" cy="34" r="9" fill="#FFFFFF" stroke="none"/>' +
    '<circle cx="80" cy="34" r="9" fill="#FFFFFF" stroke="none"/>' +
    '<circle cx="41" cy="35" r="4.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="79" cy="35" r="4.5" fill="#1F2A44" stroke="none"/>' +
    '<path d="M38 62 Q60 78 82 62" fill="none" stroke-width="3"/>' +
    '<circle cx="32" cy="64" r="4.5" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="88" cy="64" r="4.5" fill="#F7A1B5" stroke="none"/>' +
    '<ellipse cx="46" cy="104" rx="10" ry="4.5" fill="#2BA84A"/>' +
    '<ellipse cx="74" cy="104" rx="10" ry="4.5" fill="#2BA84A"/>';

  P.duck =
    '<path d="M26 86 Q28 108 62 108 Q98 108 104 74 Q92 84 80 74 L44 74 Q28 74 26 86 Z" fill="#FFD43B"/>' +
    '<path d="M22 50 L6 55 L22 61 Z" fill="#F59E42"/>' +
    '<circle cx="40" cy="52" r="19" fill="#FFD43B"/>' +
    '<circle cx="37" cy="48" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<path d="M58 84 Q78 72 92 86 Q76 98 58 84 Z" fill="#F2B705" stroke-width="2.5"/>';

  P.fish =
    '<path d="M28 60 L8 40 Q14 60 8 80 Z" fill="#C46A1B"/>' +
    '<path d="M40 42 C44 20 66 16 80 38 Z" fill="#C46A1B"/>' +
    '<ellipse cx="60" cy="60" rx="38" ry="26" fill="#F59E42"/>' +
    '<path d="M74 44 Q68 60 74 76" fill="none" stroke="#C46A1B" stroke-width="3"/>' +
    '<path d="M50 64 Q60 56 64 70 Q56 74 50 64 Z" fill="#C46A1B" stroke-width="2.5"/>' +
    '<circle cx="84" cy="54" r="4.5" fill="#1F2A44" stroke="none"/>' +
    '<path d="M95 64 Q91 69 86 67" fill="none" stroke-width="2.5"/>';

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

  P.dad =
    '<path d="M22 114 Q22 84 60 84 Q98 84 98 114 Z" fill="#2B6CB0"/>' +
    '<path d="M52 84 L60 96 L68 84" fill="#FFFFFF"/>' +
    '<rect x="52" y="70" width="16" height="16" fill="#E8B48A" stroke="none"/>' +
    '<circle cx="36" cy="56" r="6" fill="#E8B48A"/>' +
    '<circle cx="84" cy="56" r="6" fill="#E8B48A"/>' +
    '<circle cx="60" cy="54" r="25" fill="#E8B48A"/>' +
    '<path d="M35 50 Q35 25 60 25 Q85 25 85 50 Q77 37 60 39 Q45 39 35 50 Z" fill="#5B3A24"/>' +
    '<circle cx="51" cy="56" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<circle cx="69" cy="56" r="3.5" fill="#1F2A44" stroke="none"/>' +
    '<path d="M50 66 Q60 75 70 66" fill="none" stroke-width="3"/>';

  P.zzz =
    '<path d="M64 34 H78 L64 48 H78 M84 18 H95 L84 29 H95 M100 5 H108 L100 13 H108" fill="none" stroke-width="3.5"/>';

  /* ---------------------------------------------------------------- things */

  P.bag =
    '<path d="M54 43 Q54 17 68 17 Q82 17 82 43" fill="none" stroke-width="9"/>' +
    '<path d="M54 43 Q54 17 68 17 Q82 17 82 43" fill="none" stroke="#B23A1E" stroke-width="4"/>' +
    '<path d="M22 50 L36 43 L98 43 L84 50 Z" fill="#B23A1E"/>' +
    '<path d="M84 50 L98 43 L98 99 L84 106 Z" fill="#B23A1E"/>' +
    '<rect x="22" y="50" width="62" height="56" fill="#E4572E"/>' +
    '<path d="M30 60 V96" fill="none" stroke="#F7A1B5" stroke-width="4"/>' +
    '<path d="M39 50 Q39 24 53 24 Q67 24 67 50" fill="none" stroke-width="9"/>' +
    '<path d="M39 50 Q39 24 53 24 Q67 24 67 50" fill="none" stroke="#E4572E" stroke-width="4"/>';

  P['bag-front'] =
    '<path d="M84 50 L98 43 L98 99 L84 106 Z" fill="#B23A1E"/>' +
    '<rect x="22" y="50" width="62" height="56" fill="#E4572E"/>' +
    '<path d="M30 60 V96" fill="none" stroke="#F7A1B5" stroke-width="4"/>';

  P.bed =
    '<path d="M18 94 V108 M102 94 V108" fill="none" stroke-width="9"/>' +
    '<path d="M18 94 V108 M102 94 V108" fill="none" stroke="#7A4A26" stroke-width="4"/>' +
    '<rect x="8" y="28" width="16" height="74" rx="6" fill="#A0673A"/>' +
    '<rect x="18" y="80" width="86" height="14" rx="3" fill="#C98A4B"/>' +
    '<rect x="22" y="64" width="78" height="18" rx="4" fill="#FFFFFF"/>' +
    '<rect x="25" y="47" width="28" height="18" rx="8" fill="#FFFFFF"/>' +
    '<path d="M46 62 H100 V97 H52 Q46 97 46 91 Z" fill="#5AA9FF"/>' +
    '<path d="M46 62 H57 V97 H52 Q46 97 46 91 Z" fill="#BEE3F8"/>' +
    '<path d="M64 76 H92" fill="none" stroke="#2B6CB0" stroke-width="3"/>' +
    '<rect x="98" y="50" width="14" height="52" rx="5" fill="#A0673A"/>';

  // A wheelie bin: the open lid stands up behind (bin), the body and wheels go in front (bin-front).
  P.bin =
    '<path d="M18 44 L24 8 Q25 4 29 4 H91 Q95 4 96 8 L102 44 Z" fill="#5E9C76"/>' +
    '<path d="M24.5 12 H95.5" fill="none" stroke-width="2.5"/>' +
    '<rect x="16" y="38" width="88" height="10" rx="3" fill="#1F2A44"/>';

  P['bin-front'] =
    '<circle cx="28" cy="106" r="10" fill="#1F2A44"/>' +
    '<circle cx="92" cy="106" r="10" fill="#1F2A44"/>' +
    '<circle cx="28" cy="106" r="3.5" fill="#CBD2D9" stroke="none"/>' +
    '<circle cx="92" cy="106" r="3.5" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M20 48 H100 L94 104 Q93.5 108 89 108 H31 Q26.5 108 26 104 Z" fill="#2BA84A"/>' +
    '<rect x="38" y="60" width="44" height="36" rx="5" fill="#5E9C76" stroke-width="2.5"/>' +
    '<path d="M28 58 L32 98" fill="none" stroke="#9BC4A8" stroke-width="4"/>' +
    '<rect x="14" y="44" width="92" height="10" rx="4" fill="#2BA84A"/>';

  P.box =
    '<path d="M38 46 L102 46 L105 32 L43 32 Z" fill="#E8C08A"/>' +
    '<path d="M16 58 L38 46 L25 36 L4 47 Z" fill="#E8C08A"/>' +
    '<path d="M16 58 L38 46 L102 46 L80 58 Z" fill="#A0673A"/>' +
    '<path d="M80 58 L102 46 L102 94 L80 106 Z" fill="#C98A4B"/>' +
    '<rect x="16" y="58" width="64" height="48" fill="#D9A066"/>' +
    '<path d="M80 58 L102 46 L114 54 L93 67 Z" fill="#E8C08A"/>' +
    '<path d="M16 58 L80 58 L83 71 L19 71 Z" fill="#E8C08A"/>';

  P.bun =
    '<rect x="16" y="84" width="88" height="20" rx="9" fill="#E8C08A"/>' +
    '<path d="M12 86 Q12 42 60 42 Q108 42 108 86 Q108 92 102 92 H18 Q12 92 12 86 Z" fill="#D9A066"/>' +
    '<path d="M26 70 Q30 54 48 50" fill="none" stroke="#E8C08A" stroke-width="5"/>' +
    '<ellipse cx="50" cy="62" rx="4" ry="2.2" fill="#FFF4DC" stroke="none" transform="rotate(-20 50 62)"/>' +
    '<ellipse cx="66" cy="56" rx="4" ry="2.2" fill="#FFF4DC" stroke="none" transform="rotate(15 66 56)"/>' +
    '<ellipse cx="80" cy="66" rx="4" ry="2.2" fill="#FFF4DC" stroke="none" transform="rotate(30 80 66)"/>' +
    '<ellipse cx="62" cy="74" rx="4" ry="2.2" fill="#FFF4DC" stroke="none" transform="rotate(-10 62 74)"/>' +
    '<ellipse cx="40" cy="78" rx="4" ry="2.2" fill="#FFF4DC" stroke="none" transform="rotate(-35 40 78)"/>' +
    '<ellipse cx="88" cy="80" rx="4" ry="2.2" fill="#FFF4DC" stroke="none" transform="rotate(40 88 80)"/>';

  P.bus =
    '<ellipse cx="60" cy="108" rx="50" ry="4" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M8 40 Q8 30 18 30 H88 Q96 30 98 38 L100 52 H108 Q113 52 113 58 V90 Q113 94 109 94 H12 Q8 94 8 90 Z" fill="#FFC93C"/>' +
    '<rect x="16" y="38" width="14" height="18" rx="3" fill="#BEE3F8" stroke-width="2.5"/>' +
    '<rect x="35" y="38" width="14" height="18" rx="3" fill="#BEE3F8" stroke-width="2.5"/>' +
    '<rect x="54" y="38" width="14" height="18" rx="3" fill="#BEE3F8" stroke-width="2.5"/>' +
    '<path d="M75 38 H89 Q92 38 93 41 L95 56 H75 Z" fill="#BEE3F8" stroke-width="2.5"/>' +
    '<path d="M8 66 H113 M8 74 H113" fill="none" stroke-width="2.5"/>' +
    '<rect x="105" y="58" width="8" height="7" rx="2" fill="#FFF4DC" stroke-width="2"/>' +
    '<rect x="100" y="86" width="15" height="8" rx="3" fill="#4A5568"/>' +
    '<circle cx="30" cy="94" r="12" fill="#1F2A44"/>' +
    '<circle cx="30" cy="94" r="5" fill="#CBD2D9" stroke="none"/>' +
    '<circle cx="88" cy="94" r="12" fill="#1F2A44"/>' +
    '<circle cx="88" cy="94" r="5" fill="#CBD2D9" stroke="none"/>';

  P.can =
    '<path d="M34 24 L34 100 Q60 110 86 100 L86 24 Z" fill="#9AA5B1"/>' +
    '<path d="M34 44 Q60 52 86 44 L86 82 Q60 90 34 82 Z" fill="#E4572E"/>' +
    '<circle cx="60" cy="66" r="10" fill="#FFC93C" stroke-width="2.5"/>' +
    '<ellipse cx="60" cy="24" rx="26" ry="7" fill="#CBD2D9"/>';

  P['can-front'] =
    '<path d="M34 24 Q60 38 86 24 L86 100 Q60 110 34 100 Z" fill="#9AA5B1"/>' +
    '<path d="M34 44 Q60 52 86 44 L86 82 Q60 90 34 82 Z" fill="#E4572E"/>' +
    '<circle cx="60" cy="66" r="10" fill="#FFC93C" stroke-width="2.5"/>';

  P['can-hole'] =
    '<ellipse cx="60" cy="24" rx="21" ry="4.5" fill="#4A5568" stroke="none"/>';

  P.cap =
    '<ellipse cx="62" cy="104" rx="48" ry="4" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M74 86 Q102 80 116 92 Q114 102 94 102 Q78 102 70 96 Z" fill="#B23A1E"/>' +
    '<path d="M86 94 Q100 92 110 95" fill="none" stroke="#E4572E" stroke-width="3"/>' +
    '<path d="M10 94 C8 66 28 46 52 46 C78 46 94 66 92 92 Q50 100 10 94 Z" fill="#E4572E"/>' +
    '<path d="M52 47 C42 58 38 76 40 96 M52 47 C66 58 72 76 72 94" fill="none" stroke-width="2.5"/>' +
    '<path d="M20 74 Q24 60 34 54" fill="none" stroke="#F7A1B5" stroke-width="4"/>' +
    '<ellipse cx="52" cy="46" rx="7" ry="3.5" fill="#B23A1E" stroke-width="2.5"/>';

  P.cot =
    '<path d="M70 18 H80 L70 28 H80 M86 6 H93 L86 13 H93" fill="none" stroke-width="2.5"/>' +
    '<path d="M24 94 L48 68 M48 94 L24 68 M72 94 L96 68 M96 94 L72 68" fill="none" stroke-width="4"/>' +
    '<rect x="12" y="56" width="96" height="14" rx="6" fill="#2BA84A"/>' +
    '<rect x="16" y="43" width="30" height="15" rx="7" fill="#FFFFFF"/>' +
    '<path d="M50 56 Q70 44 104 52 L104 56 Z" fill="#FFC93C"/>';

  // A kid's cup with a straw and no handle, so it can't pass for Gus's mug.
  P.cup =
    '<path d="M28 34 L38 102 Q60 110 82 102 L92 34 Z" fill="#2B6CB0"/>' +
    '<path d="M31 48 Q60 56 89 48 M35.5 82 Q60 89 84.5 82" fill="none" stroke="#8EC5FF" stroke-width="4"/>' +
    '<ellipse cx="60" cy="34" rx="32" ry="8" fill="#8EC5FF"/>' +
    '<ellipse cx="60" cy="35" rx="26" ry="5" fill="#FFFFFF" stroke="none"/>' +
    '<path d="M64 35 L74 6 L88 2" fill="none" stroke-width="10"/>' +
    '<path d="M64 35 L74 6 L88 2" fill="none" stroke="#E4572E" stroke-width="5"/>';

  P.egg =
    '<ellipse cx="60" cy="108" rx="30" ry="4" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M60 44 C78 44 87 72 87 86 C87 100 75 108 60 108 C45 108 33 100 33 86 C33 72 42 44 60 44 Z" fill="#FFF4DC"/>' +
    '<path d="M45 66 Q48 56 54 52" fill="none" stroke="#FFFFFF" stroke-width="4.5"/>';

  P.fan =
    '<path d="M54 84 L46 106 H74 L66 84 Z" fill="#9AA5B1"/>' +
    '<rect x="38" y="104" width="44" height="9" rx="4" fill="#CBD2D9"/>' +
    '<circle cx="60" cy="52" r="36" fill="#DDF0FF"/>' +
    '<ellipse cx="60" cy="34" rx="10" ry="17" fill="#2B6CB0" stroke-width="2.5"/>' +
    '<ellipse cx="60" cy="34" rx="10" ry="17" fill="#2B6CB0" stroke-width="2.5" transform="rotate(120 60 52)"/>' +
    '<ellipse cx="60" cy="34" rx="10" ry="17" fill="#2B6CB0" stroke-width="2.5" transform="rotate(240 60 52)"/>' +
    '<circle cx="60" cy="52" r="7" fill="#FFFFFF"/>' +
    '<circle cx="60" cy="52" r="36" fill="none" stroke-width="3.5"/>' +
    '<path d="M104 30 q7 5 0 10 M108 50 q7 5 0 10" fill="none" stroke="#5AA9FF" stroke-width="3"/>';

  P.gift =
    '<path d="M18 54 L40 42 L100 42 L78 54 Z" fill="#8EC5FF"/>' +
    '<path d="M78 54 L100 42 L100 94 L78 106 Z" fill="#2B6CB0"/>' +
    '<rect x="18" y="54" width="60" height="52" fill="#5AA9FF"/>' +
    '<rect x="43" y="54" width="10" height="52" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M86 49.6 L92 46.4 L92 98.4 L86 101.6 Z" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M43 54 L65 42 L75 42 L53 54 Z" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M24.4 50.5 L84.4 50.5 L93.6 45.5 L33.6 45.5 Z" fill="#FFC93C" stroke-width="2.5"/>' +
    '<ellipse cx="47" cy="36" rx="13" ry="8" fill="#FFC93C" transform="rotate(-25 47 36)"/>' +
    '<ellipse cx="71" cy="36" rx="13" ry="8" fill="#FFC93C" transform="rotate(25 71 36)"/>' +
    '<ellipse cx="47" cy="37" rx="5" ry="2.5" fill="#F2B705" stroke="none" transform="rotate(-25 47 37)"/>' +
    '<ellipse cx="71" cy="37" rx="5" ry="2.5" fill="#F2B705" stroke="none" transform="rotate(25 71 37)"/>' +
    '<circle cx="59" cy="44" r="6" fill="#F2B705"/>';

  P['hot-dogs'] =
    '<g transform="translate(2 -26)">' +
    '<rect x="18" y="62" width="80" height="22" rx="11" fill="#D9A066"/>' +
    '<rect x="8" y="66" width="100" height="15" rx="7.5" fill="#E4572E"/>' +
    '<path d="M22 70 L28 76 L34 70 L40 76 L46 70 L52 76 L58 70 L64 76 L70 70 L76 76 L82 70 L88 76 L94 70" fill="none" stroke="#FFC93C" stroke-width="3"/>' +
    '<path d="M16 77 H100 Q100 94 84 94 H32 Q16 94 16 77 Z" fill="#E8C08A"/>' +
    '</g>' +
    '<g transform="translate(-2 10)">' +
    '<rect x="18" y="62" width="80" height="22" rx="11" fill="#D9A066"/>' +
    '<rect x="8" y="66" width="100" height="15" rx="7.5" fill="#E4572E"/>' +
    '<path d="M22 70 L28 76 L34 70 L40 76 L46 70 L52 76 L58 70 L64 76 L70 70 L76 76 L82 70 L88 76 L94 70" fill="none" stroke="#FFC93C" stroke-width="3"/>' +
    '<path d="M16 77 H100 Q100 94 84 94 H32 Q16 94 16 77 Z" fill="#E8C08A"/>' +
    '</g>';

  P.jet =
    '<path d="M18 52 L10 24 H22 L42 52 Z" fill="#E4572E"/>' +
    '<path d="M16 54 H92 Q112 54 114 66 Q112 78 92 78 H26 Q14 78 12 64 Q12 54 16 54 Z" fill="#FFFFFF"/>' +
    '<path d="M14 70 Q20 78 26 78 H92 Q108 78 112 70 Z" fill="#DDF0FF" stroke="none"/>' +
    '<path d="M16 54 H92 Q112 54 114 66 Q112 78 92 78 H26 Q14 78 12 64 Q12 54 16 54 Z" fill="none"/>' +
    '<path d="M98 58 Q106 58 109 64 H98 Z" fill="#2B6CB0" stroke-width="2.5"/>' +
    '<circle cx="38" cy="63" r="3.5" fill="#5AA9FF" stroke-width="2"/>' +
    '<circle cx="50" cy="63" r="3.5" fill="#5AA9FF" stroke-width="2"/>' +
    '<circle cx="62" cy="63" r="3.5" fill="#5AA9FF" stroke-width="2"/>' +
    '<circle cx="74" cy="63" r="3.5" fill="#5AA9FF" stroke-width="2"/>' +
    '<circle cx="86" cy="63" r="3.5" fill="#5AA9FF" stroke-width="2"/>' +
    '<path d="M50 72 H74 L54 98 H42 Z" fill="#2B6CB0"/>' +
    '<path d="M14 66 L4 74 H24 Z" fill="#E4572E" stroke-width="2.5"/>';

  // A pot lid seen from above, tipped up, with a knob on top.
  P.lid =
    '<g transform="rotate(-12 60 64)">' +
    '<path d="M12 68 A48 18 0 0 0 108 68 L108 76 A48 18 0 0 1 12 76 Z" fill="#B23A1E"/>' +
    '<path d="M12 68 C14 46 40 40 60 40 C80 40 106 46 108 68 A48 18 0 0 1 12 68 Z" fill="#E4572E"/>' +
    '<path d="M26 58 Q34 48 48 45" fill="none" stroke="#F7A1B5" stroke-width="4"/>' +
    '<path d="M53 42 L54 30 H66 L67 42 Q60 45 53 42 Z" fill="#4A5568"/>' +
    '<ellipse cx="60" cy="29" rx="12" ry="5.5" fill="#4A5568"/>' +
    '</g>';

  P.log =
    '<path d="M78 46 Q82 32 92 28" fill="none" stroke="#5B3A24" stroke-width="3"/>' +
    '<ellipse cx="96" cy="26" rx="8" ry="4.5" fill="#2BA84A" stroke-width="2.5" transform="rotate(-25 96 26)"/>' +
    '<path d="M28 46 H96 Q106 46 106 66 Q106 86 96 86 H28 Z" fill="#A0673A"/>' +
    '<path d="M46 56 H72 M60 76 H90 M82 60 H96" fill="none" stroke="#7A4A26" stroke-width="3"/>' +
    '<ellipse cx="28" cy="66" rx="13" ry="20" fill="#E8C08A"/>' +
    '<ellipse cx="28" cy="66" rx="7" ry="12" fill="none" stroke="#A0673A" stroke-width="2.5"/>' +
    '<ellipse cx="28" cy="66" rx="2.5" ry="4" fill="#A0673A" stroke="none"/>';

  P.map =
    '<path d="M8 58 L43 52 L43 100 L8 106 Z" fill="#E8C08A"/>' +
    '<path d="M43 52 L77 58 L77 106 L43 100 Z" fill="#D9A066"/>' +
    '<path d="M77 58 L112 52 L112 100 L77 106 Z" fill="#E8C08A"/>' +
    '<path d="M12 70 Q22 62 34 66 Q40 74 30 82 Q18 86 12 80 Z" fill="#9BC4A8" stroke="none"/>' +
    '<path d="M52 88 Q60 80 70 86 Q72 96 60 98 Q50 96 52 88 Z" fill="#5E9C76" stroke="none"/>' +
    '<path d="M86 64 Q98 58 106 64 Q108 74 98 76 Q86 76 86 64 Z" fill="#9BC4A8" stroke="none"/>' +
    '<path d="M46 56 Q52 70 46 80 Q40 92 48 102" fill="none" stroke="#5AA9FF" stroke-width="5"/>' +
    '<path d="M18 96 Q34 90 50 74 Q66 62 82 80 Q88 88 96 90" fill="none" stroke="#E4572E" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="butt"/>' +
    '<path d="M94 84 L104 94 M104 84 L94 94" fill="none" stroke="#E4572E" stroke-width="4"/>';

  P.mat =
    '<path d="M7 98 V104 Q7 107 10 107 H110 Q113 107 113 104 V98 Z" fill="#5E9C76"/>' +
    '<path d="M20 60 H100 Q104 60 105 63 L113 97 Q114 101 110 101 H10 Q6 101 7 97 L15 63 Q16 60 20 60 Z" fill="#2BA84A"/>' +
    '<path d="M24 67 L96 67 L103 94 L17 94 Z" fill="#E8C08A" stroke-width="2.5"/>' +
    '<path d="M18.6 87.7 L22.7 94 M21.8 75.5 L33.7 94 M27.3 67 L44.7 94 M38.3 67 L55.7 94 M35.7 67 L18.3 94 M49.3 67 L66.7 94 M46.7 67 L29.3 94 M60.3 67 L77.7 94 M57.7 67 L40.3 94 M71.3 67 L88.7 94 M68.7 67 L51.3 94 M82.3 67 L99.7 94 M79.7 67 L62.3 94 M93.3 67 L97.8 74 M90.7 67 L73.3 94 M97.6 73.3 L84.3 94 M100.8 85.5 L95.3 94" fill="none" stroke="#C98A4B" stroke-width="2" stroke-linecap="butt"/>' +
    '<path d="M24 67 L96 67 L103 94 L17 94 Z" fill="none" stroke-width="2.5"/>';

  P.mitt =
    '<g transform="translate(8 4) scale(0.92) rotate(-8 60 60)">' +
    '<path d="M20 52 Q22 34 42 28 L44 62 L30 62 Z" fill="#7A4A26"/>' +
    '<path d="M24 44 L42 38 M26 52 L42 48" fill="none" stroke="#E8C08A" stroke-width="2.5"/>' +
    '<ellipse cx="30" cy="66" rx="12" ry="24" fill="#A0673A" transform="rotate(-35 30 66)"/>' +
    '<rect x="40" y="18" width="17" height="60" rx="8.5" fill="#A0673A"/>' +
    '<rect x="55" y="12" width="17" height="64" rx="8.5" fill="#A0673A"/>' +
    '<rect x="70" y="16" width="17" height="60" rx="8.5" fill="#A0673A"/>' +
    '<rect x="85" y="26" width="16" height="52" rx="8" fill="#A0673A"/>' +
    '<path d="M38 60 Q68 70 100 62 Q102 100 68 102 Q36 100 38 60 Z" fill="#A0673A"/>' +
    '<rect x="44" y="96" width="44" height="14" rx="6" fill="#7A4A26"/>' +
    '<circle cx="66" cy="78" r="16" fill="#FFFFFF"/>' +
    '<path d="M56 67 Q62 78 56 89 M76 67 Q70 78 76 89" fill="none" stroke="#E4572E" stroke-width="2.5"/>' +
    '</g>';

  // A string mop: a floppy head of curly strands, each with its own outline so they read as strings.
  var STRANDS = [
    'M56 66 C44 72 30 80 24 96 C21 104 28 108 32 102',
    'M70 66 C82 72 94 80 98 96 C100 104 92 108 88 102',
    'M58 68 C50 80 40 88 40 102 C40 110 48 110 48 104',
    'M68 68 C74 80 82 88 82 102 C82 110 74 110 74 104',
    'M54 66 C42 70 28 74 18 86 C14 92 18 98 24 94',
    'M72 66 C84 70 98 74 104 86 C108 92 104 98 98 94',
    'M60 68 C58 82 52 92 56 106 C58 112 64 110 62 104',
    'M64 68 C68 82 70 94 66 106'
  ];
  P.mop =
    '<ellipse cx="60" cy="108" rx="50" ry="8" fill="#BEE3F8" stroke="none"/>' +
    '<path d="M76 4 L64 62" fill="none" stroke-width="11"/>' +
    '<path d="M76 4 L64 62" fill="none" stroke="#C98A4B" stroke-width="6"/>' +
    STRANDS.map(function (d) {
      return '<path d="' + d + '" fill="none" stroke-width="11"/><path d="' + d + '" fill="none" stroke="#F5F0E1" stroke-width="5.5"/>';
    }).join('') +
    '<rect x="48" y="56" width="30" height="14" rx="5" fill="#2B6CB0"/>';

  P.mud =
    '<ellipse cx="12" cy="76" rx="2.6" ry="4" fill="#7A4A26" stroke-width="2" transform="rotate(-35 12 76)"/>' +
    '<ellipse cx="22" cy="68" rx="2.2" ry="3.4" fill="#7A4A26" stroke-width="2" transform="rotate(-15 22 68)"/>' +
    '<circle cx="32" cy="74" r="2.4" fill="#7A4A26" stroke-width="2"/>' +
    '<ellipse cx="108" cy="75" rx="2.6" ry="4" fill="#7A4A26" stroke-width="2" transform="rotate(35 108 75)"/>' +
    '<ellipse cx="98" cy="67" rx="2.2" ry="3.4" fill="#7A4A26" stroke-width="2" transform="rotate(15 98 67)"/>' +
    '<circle cx="88" cy="73" r="2.4" fill="#7A4A26" stroke-width="2"/>' +
    '<path d="M114.1 96 C115 97.2 114.9 98.7 113.1 99.8 C111.3 101 106.3 101.8 103.3 102.7 C100.2 103.6 97.3 104.3 94.6 105.3 C91.9 106.3 90.4 107.8 87 108.6 C83.6 109.4 78.7 110.2 74.2 110.3 C69.7 110.4 64.5 109.7 60 109.4 C55.5 109.2 51.8 108.9 47.3 108.7 C42.8 108.6 37.3 109 33 108.6 C28.6 108.2 23.8 107.5 21.1 106.5 C18.4 105.5 18.2 103.9 16.7 102.7 C15.3 101.5 14.5 100.5 12.7 99.4 C10.9 98.3 6.9 97.2 5.9 96 C5 94.8 5.1 93.3 6.9 92.2 C8.7 91 13.7 90.2 16.7 89.3 C19.8 88.4 22.7 87.7 25.4 86.7 C28.1 85.7 29.6 84.2 33 83.4 C36.4 82.6 41.3 81.8 45.8 81.7 C50.3 81.6 55.5 82.3 60 82.6 C64.5 82.8 68.2 83.1 72.7 83.3 C77.2 83.4 82.7 83 87 83.4 C91.4 83.8 96.2 84.5 98.9 85.5 C101.6 86.5 101.8 88.1 103.3 89.3 C104.7 90.5 105.5 91.5 107.3 92.6 C109.1 93.7 113.1 94.8 114.1 96 Z" fill="#7A4A26"/>' +
    '<path d="M71 93 C71.7 93.8 71.2 94.9 69.2 95.5 C67.1 96.1 62 96.5 58.5 96.7 C55 97 51.7 96.9 48 97 C44.3 97.1 40 97.3 36.5 97.1 C33 96.8 28.4 96.2 26.8 95.5 C25.3 94.8 26.3 93.8 27 93 C27.7 92.3 29.5 91.7 31.1 91 C32.6 90.3 33.7 89.4 36.5 88.9 C39.3 88.4 44.3 87.9 48 88 C51.7 88.1 55.7 88.8 58.5 89.3 C61.3 89.8 62.9 90.4 64.9 91 C67 91.6 70.3 92.3 71 93 Z" fill="#A0673A" stroke="none"/>' +
    '<path d="M80 94 H92" fill="none" stroke="#A0673A" stroke-width="3"/>';

  P.mug =
    '<path d="M80 46 H92 Q104 46 104 62 V70 Q104 86 90 86 H80" fill="none" stroke-width="13"/>' +
    '<path d="M80 46 H92 Q104 46 104 62 V70 Q104 86 90 86 H80" fill="none" stroke="#E4572E" stroke-width="8"/>' +
    '<path d="M22 34 H84 V96 Q84 106 74 106 H32 Q22 106 22 96 Z" fill="#E4572E"/>' +
    '<ellipse cx="53" cy="34" rx="31" ry="7" fill="#E4572E"/>' +
    '<ellipse cx="53" cy="35" rx="24" ry="4" fill="#7A4A26" stroke="none"/>' +
    '<path d="M53 88 C36 77 37 61 46 61 C50 61 53 64 53 67 C53 64 56 61 60 61 C69 61 70 77 53 88 Z" fill="#FFFFFF" stroke-width="2.5"/>' +
    '<path d="M30 48 V90" fill="none" stroke="#F7A1B5" stroke-width="4"/>';

  P['net-back'] =
    '<path d="M17 52 C17 82 36 106 50 106 C64 106 83 82 83 52 Z" fill="#EEF7FF" stroke="none"/>' +
    '<path d="M80 46 L114 10" fill="none" stroke-width="10"/>' +
    '<path d="M80 46 L114 10" fill="none" stroke="#C98A4B" stroke-width="5"/>' +
    '<path d="M17 52 A33 8 0 0 1 83 52" fill="none" stroke-width="5"/>' +
    '<path d="M17 52 A33 8 0 0 1 83 52" fill="none" stroke="#9AA5B1" stroke-width="2"/>';

  P['net-front'] =
    '<path d="M28 57 Q32 92 50 106 M40 59 Q44 94 50 106 M60 59 Q56 94 50 106 M72 57 Q68 92 50 106" fill="none" stroke="#4A5568" stroke-width="1.5" stroke-opacity="0.7"/>' +
    '<path d="M20 70 Q50 76 80 70 M24 84 Q50 89 76 84 M32 96 Q50 100 68 96" fill="none" stroke="#4A5568" stroke-width="1.5" stroke-opacity="0.7"/>' +
    '<path d="M17 52 C17 82 36 106 50 106 C64 106 83 82 83 52" fill="none" stroke-width="2.5"/>' +
    '<path d="M17 52 A33 8 0 0 0 83 52" fill="none" stroke-width="8"/>' +
    '<path d="M17 52 A33 8 0 0 0 83 52" fill="none" stroke="#9AA5B1" stroke-width="3.5"/>';

  P.night =
    '<rect x="1.5" y="1.5" width="117" height="117" rx="14" fill="#2A3A66"/>' +
    '<path d="M28.8 15 A17 17 0 1 0 45.2 39.7 A15 15 0 0 1 28.8 15 Z" fill="#FFD43B" stroke-width="2"/>' +
    '<path d="M70 13.5 L71.4 16.6 L74.5 18 L71.4 19.4 L70 22.5 L68.6 19.4 L65.5 18 L68.6 16.6 Z" fill="#FFD43B" stroke="none"/>' +
    '<path d="M100 25 L101.6 28.4 L105 30 L101.6 31.6 L100 35 L98.4 31.6 L95 30 L98.4 28.4 Z" fill="#FFF4DC" stroke="none"/>' +
    '<path d="M88 58.5 L89.1 60.9 L91.5 62 L89.1 63.1 L88 65.5 L86.9 63.1 L84.5 62 L86.9 60.9 Z" fill="#FFF4DC" stroke="none"/>' +
    '<path d="M16 60.5 L17.1 62.9 L19.5 64 L17.1 65.1 L16 67.5 L14.9 65.1 L12.5 64 L14.9 62.9 Z" fill="#FFF4DC" stroke="none"/>' +
    '<path d="M56 37 L57 39 L59 40 L57 41 L56 43 L55 41 L53 40 L55 39 Z" fill="#FFD43B" stroke="none"/>' +
    '<circle cx="106" cy="54" r="1.6" fill="#FFF4DC" stroke="none"/>' +
    '<circle cx="40" cy="60" r="1.6" fill="#FFF4DC" stroke="none"/>' +
    '<path d="M1.5 98 Q30 86 60 96 Q90 104 118.5 92 V104.5 Q118.5 118.5 104.5 118.5 H15.5 Q1.5 118.5 1.5 104.5 Z" fill="#1F2A44" stroke="none"/>' +
    '<rect x="1.5" y="1.5" width="117" height="117" rx="14" fill="none"/>';

  P.pan =
    '<g transform="translate(0 10)">' +
    '<rect x="80" y="60" width="35" height="10" rx="5" fill="#4A5568" transform="rotate(-22 80 65)"/>' +
    '<circle cx="107" cy="55" r="2.5" fill="#FFFFFF" stroke-width="2"/>' +
    '<ellipse cx="46" cy="70" rx="38" ry="18" fill="#4A5568"/>' +
    '<ellipse cx="46" cy="71" rx="32" ry="13.5" fill="#9AA5B1"/>' +
    '<path d="M24 66 Q32 61 44 60" fill="none" stroke="#CBD2D9" stroke-width="3.5"/>' +
    '<path d="M8 70 L12 80 A34 16 0 0 0 80 80 L84 70 A38 18 0 0 1 8 70 Z" fill="#4A5568"/>' +
    '<path d="M8 70 A38 18 0 0 0 84 70 L78 71 A32 13.5 0 0 1 14 71 Z" fill="#4A5568"/>' +
    '</g>';

  P['pan-front'] =
    '<g transform="translate(0 10)">' +
    '<path d="M8 70 L12 80 A34 16 0 0 0 80 80 L84 70 A38 18 0 0 1 8 70 Z" fill="#4A5568"/>' +
    '<path d="M8 70 A38 18 0 0 0 84 70 L78 71 A32 13.5 0 0 1 14 71 Z" fill="#4A5568"/>' +
    '</g>';

  P.pen =
    '<path d="M4 109 V98 Q12 92 20 96 Q28 91 36 96 Q44 91 52 96 Q60 91 68 96 Q76 91 84 96 Q92 91 100 96 Q108 92 116 98 V109 Z" fill="#FFC93C" stroke-width="2.5"/>' +
    '<rect x="8" y="62" width="13" height="48" rx="4" fill="#A0673A"/>' +
    '<rect x="39" y="62" width="13" height="48" rx="4" fill="#A0673A"/>' +
    '<rect x="68" y="62" width="13" height="48" rx="4" fill="#A0673A"/>' +
    '<rect x="99" y="62" width="13" height="48" rx="4" fill="#A0673A"/>' +
    '<rect x="4" y="69" width="112" height="11" rx="3" fill="#C98A4B"/>' +
    '<rect x="4" y="88" width="112" height="11" rx="3" fill="#C98A4B"/>' +
    '<path d="M26 74 H34 M86 74 H94 M56 93 H64" fill="none" stroke="#A0673A" stroke-width="2.5"/>' +
    '<path d="M27 108 L31 101 M33 108 L33 102 M58 108 L55 102 M88 108 L92 101 M94 108 L94 102" fill="none" stroke="#C46A1B" stroke-width="2"/>';

  P.pin =
    '<g transform="rotate(30 60 60)">' +
    '<path d="M60 64 L60 110" fill="none" stroke-width="7"/>' +
    '<path d="M60 64 L60 108" fill="none" stroke="#CBD2D9" stroke-width="3"/>' +
    '<rect x="38" y="56" width="44" height="12" rx="6" fill="#B23A1E"/>' +
    '<path d="M48 28 L52 58 H68 L72 28 Z" fill="#E4572E"/>' +
    '<rect x="36" y="16" width="48" height="15" rx="7.5" fill="#E4572E"/>' +
    '<path d="M44 22 H56 M54 36 L56 50" fill="none" stroke="#FFFFFF" stroke-width="3.5"/>' +
    '</g>';

  P.pit =
    '<path d="M4 100 C4 89 24 85 44 86 C62 83 86 84 102 87 C114 89 118 95 116 102 C114 109 96 113 60 113 C22 113 4 109 4 100 Z" fill="#E8C08A" stroke="none"/>' +
    '<ellipse cx="44" cy="98" rx="32" ry="10" fill="#7A4A26"/>' +
    '<ellipse cx="44" cy="101" rx="25" ry="6" fill="#5B3A24" stroke="none"/>' +
    '<path d="M98 64 L100 50" fill="none" stroke-width="9"/>' +
    '<path d="M98 64 L100 50" fill="none" stroke="#C98A4B" stroke-width="4"/>' +
    '<path d="M93 50 H107" fill="none" stroke-width="9"/>' +
    '<path d="M93 50 H107" fill="none" stroke="#C98A4B" stroke-width="4"/>' +
    '<path d="M88 66 Q97 61 106 66 V78 Q106 86 97 92 Q88 86 88 78 Z" fill="#9AA5B1"/>' +
    '<path d="M92 69 V78" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>' +
    '<path d="M72 104 C74 90 84 82 96 82 C108 82 116 92 116 104 Z" fill="#A0673A"/>' +
    '<circle cx="88" cy="96" r="2" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="102" cy="92" r="2" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="106" cy="100" r="2" fill="#7A4A26" stroke="none"/>';

  P['pit-front'] =
    '<path d="M12 98 A32 10 0 0 0 76 98 L77 109 C66 113 34 114 14 111 C8 109 6 104 12 98 Z" fill="#E8C08A" stroke="none"/>' +
    '<path d="M12 98 A32 10 0 0 0 76 98" fill="none"/>';

  P.pond =
    '<path d="M14 84 Q12 64 16 44" fill="none" stroke-width="7"/>' +
    '<path d="M14 84 Q12 64 16 44" fill="none" stroke="#5E9C76" stroke-width="2"/>' +
    '<path d="M24 82 Q24 66 28 52" fill="none" stroke-width="7"/>' +
    '<path d="M24 82 Q24 66 28 52" fill="none" stroke="#5E9C76" stroke-width="2"/>' +
    '<rect x="11" y="34" width="9" height="20" rx="4.5" fill="#7A4A26" transform="rotate(4 15 44)"/>' +
    '<rect x="24" y="44" width="8" height="16" rx="4" fill="#7A4A26" transform="rotate(10 28 52)"/>' +
    '<ellipse cx="60" cy="90" rx="54" ry="20" fill="#5AA9FF"/>' +
    '<ellipse cx="60" cy="88" rx="42" ry="12" fill="#8EC5FF" stroke="none"/>' +
    '<path d="M34 92 H48 M70 84 H86" fill="none" stroke="#FFFFFF" stroke-width="3"/>' +
    '<path d="M96 100 A10 5 0 1 1 104 96 L96 98 Z" fill="#2BA84A" stroke-width="2.5"/>';

  P.pot =
    '<rect x="8" y="54" width="18" height="10" rx="5" fill="#4A5568"/>' +
    '<rect x="94" y="54" width="18" height="10" rx="5" fill="#4A5568"/>' +
    '<ellipse cx="60" cy="50" rx="40" ry="10" fill="#CBD2D9"/>' +
    '<ellipse cx="60" cy="51" rx="35" ry="7" fill="#4A5568"/>' +
    '<path d="M20 50 L24 98 A36 9 0 0 0 96 98 L100 50 A40 10 0 0 1 20 50 Z" fill="#9AA5B1"/>' +
    '<path d="M32 62 L34 90" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<path d="M20 50 A40 10 0 0 0 100 50 L95 51 A35 7 0 0 1 25 51 Z" fill="#CBD2D9"/>';

  P['pot-front'] =
    '<path d="M20 50 L24 98 A36 9 0 0 0 96 98 L100 50 A40 10 0 0 1 20 50 Z" fill="#9AA5B1"/>' +
    '<path d="M32 62 L34 90" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<path d="M20 50 A40 10 0 0 0 100 50 L95 51 A35 7 0 0 1 25 51 Z" fill="#CBD2D9"/>';

  P.ripple =
    '<path d="M26 97 q8 -5 17 0 t17 0 t17 0 t17 0" fill="none" stroke="#2B6CB0" stroke-width="3"/>';

  P.rock =
    '<path d="M8 104 Q4 90 11 80 Q16 66 32 60 Q40 48 58 47 Q76 45 88 52 Q100 54 106 66 Q116 80 112 104 Z" fill="#9AA5B1"/>' +
    '<path d="M38 60 Q46 51 60 51 Q76 50 86 56 L66 63 Z" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M13 82 Q18 68 32 63 L38 74 Z" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M32 62 L38 74 L66 63 L87 55 M66 63 L72 76" fill="none" stroke="#4A5568" stroke-width="2.5"/>';

  P.rug =
    '<path d="M16 40 H6 M16 52 H6 M16 64 H6 M16 76 H6 M104 40 H114 M104 52 H114 M104 64 H114 M104 76 H114" fill="none" stroke-width="3"/>' +
    '<rect x="16" y="32" width="88" height="52" rx="5" fill="#E4572E"/>' +
    '<rect x="26" y="41" width="68" height="34" rx="3" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M60 46 L78 58 L60 70 L42 58 Z" fill="#2B6CB0" stroke-width="2.5"/>' +
    '<circle cx="33" cy="58" r="3" fill="#2B6CB0" stroke="none"/>' +
    '<circle cx="87" cy="58" r="3" fill="#2B6CB0" stroke="none"/>';

  function sock(fill, stripes) {
    return '<path d="M36 12 H68 V60 Q68 66 76 67 L90 69 Q108 72 107 89 Q106 104 88 104 H54 Q34 104 34 84 L36 12 Z" fill="' + fill + '"/>' +
      (stripes ? '<path d="M35 36 H68 M35 50 H68" fill="none" stroke="#E4572E" stroke-width="7" stroke-linecap="butt"/>' : '') +
      '<path d="M88 69 L90 69 Q108 72 107 89 Q106 104 88 104 L86 104 Q96 86 88 69 Z" fill="#E4572E" stroke="none"/>' +
      '<path d="M34.3 74 L34 84 Q34 104 54 104 L58 104 Q56 84 34.3 74 Z" fill="#E4572E" stroke="none"/>' +
      '<path d="M86 104 Q96 86 88 69 M58 104 Q56 84 34.3 74" fill="none" stroke-width="2.5"/>' +
      '<rect x="36" y="12" width="32" height="12" fill="#E4572E"/>' +
      '<path d="M36 12 H68 V60 Q68 66 76 67 L90 69 Q108 72 107 89 Q106 104 88 104 H54 Q34 104 34 84 L36 12 Z" fill="none"/>';
  }
  P.sock = sock('#FFFFFF', true);

  // A sock lying on its side, toe up, for Dot to stand on. Blue with no stripes, so the white dog
  // stands out (white stripes under its legs looked like a fence).
  P['sock-side'] = '<g transform="translate(6 24) rotate(-90 60 60)">' + sock('#8EC5FF', false) + '</g>';

  P.sun =
    '<path d="M103.5 27.2 L114 31 L103.5 34.8 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M101.7 39.3 L106.4 49.4 L96.3 44.7 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M91.8 46.5 L88 57 L84.2 46.5 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M79.7 44.7 L69.6 49.4 L74.3 39.3 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M72.5 34.8 L62 31 L72.5 27.2 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M74.3 22.7 L69.6 12.6 L79.7 17.3 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M84.2 15.5 L88 5 L91.8 15.5 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<path d="M96.3 17.3 L106.4 12.6 L101.7 22.7 Z" fill="#F2B705" stroke-width="2.5"/>' +
    '<circle cx="88" cy="31" r="15" fill="#FFD43B"/>' +
    '<path d="M79 29 Q80 22 86 21" fill="none" stroke="#FFFFFF" stroke-width="3.5"/>';

  // The sky part of the sunset: a glow, the sun going down behind the far bank, and birds. The pond goes in front.
  P.sunset =
    '<circle cx="70" cy="64" r="40" fill="#FFF1C7" stroke="none"/>' +
    '<path d="M45.2 61 L35 64 L45.2 67 Z M48.8 50.8 L38.3 49.2 L46.2 56.3 Z M56.4 43 L47.5 37.2 L51.7 47 Z M66.5 39.2 L60.9 30.2 L60.6 40.8 Z M79.4 40.8 L79.1 30.2 L73.5 39.2 Z M88.3 47 L92.5 37.2 L83.6 43 Z M93.8 56.3 L101.7 49.2 L91.2 50.8 Z M94.8 67 L105 64 L94.8 61 Z" fill="#F59E42" stroke-width="2.5"/>' +
    '<circle cx="70" cy="64" r="20" fill="#F59E42"/>' +
    '<path d="M58 58 Q62 50 70 48" fill="none" stroke="#FFD43B" stroke-width="4"/>' +
    '<path d="M4 84 Q6 68 28 66 Q48 64 62 70 Q80 62 98 64 Q116 66 116 84 Z" fill="#5E9C76"/>' +
    '<path d="M16 26 q5 -5 10 0 q5 -5 10 0 M90 14 q4 -4 8 0 q4 -4 8 0" fill="none" stroke-width="2.5"/>';

  // The sun shining on the water at sunset.
  P['sunset-water'] =
    '<path d="M56 80 H86 M60 88 H82 M65 96 H77" fill="none" stroke="#F59E42" stroke-width="4"/>';

  // A grassy bank at the edge of the pond.
  P.grass =
    '<path d="M50 120 Q52 104 84 102 Q116 102 120 120 Z" fill="#2BA84A"/>';

  P.tent =
    '<path d="M46 22 L46 10" fill="none" stroke-width="4"/>' +
    '<path d="M46 22 L84 16 L110 92 L80 100 Z" fill="#C46A1B"/>' +
    '<path d="M46 22 L80 100 L12 100 Z" fill="#F59E42"/>' +
    '<path d="M46 40 L30 100 L58 100 Q50 72 46 40 Z" fill="#5B3A24"/>' +
    '<path d="M46 40 Q52 72 58 100 L70 100 Q58 70 46 40 Z" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M6 106 L14 98 M86 106 L80 98 M114 98 L110 90" fill="none" stroke="#7A4A26" stroke-width="3.5"/>';

  P.tub =
    '<path d="M30 100 L25 109 M90 100 L95 109" fill="none" stroke-width="9"/>' +
    '<path d="M30 100 L25 109 M90 100 L95 109" fill="none" stroke="#F2B705" stroke-width="4"/>' +
    '<path d="M14 60 L18 86 Q22 102 42 102 H78 Q98 102 102 86 L106 60 Z" fill="#FFFFFF"/>' +
    '<path d="M20 90 Q26 98 42 98 H78 Q94 98 100 90" fill="none" stroke="#BEE3F8" stroke-width="4"/>' +
    '<circle cx="18" cy="50" r="7" fill="#FFFFFF" stroke-width="2.5"/>' +
    '<circle cx="28" cy="46" r="6" fill="#DDF0FF" stroke-width="2.5"/>' +
    '<circle cx="96" cy="48" r="6" fill="#DDF0FF" stroke-width="2.5"/>' +
    '<circle cx="104" cy="52" r="5" fill="#FFFFFF" stroke-width="2.5"/>' +
    '<circle cx="88" cy="40" r="3.5" fill="#FFFFFF" stroke-width="2"/>' +
    '<rect x="8" y="55" width="104" height="9" rx="4.5" fill="#FFFFFF"/>';

  P.van =
    '<path d="M10 88 V46 Q10 36 20 36 H72 Q79 36 83 41 L96 58 L106 61 Q112 63 112 70 V86 Q112 92 106 92 H16 Q10 92 10 88 Z" fill="#5AA9FF"/>' +
    '<path d="M10 76 H112" fill="none" stroke="#2B6CB0" stroke-width="6" stroke-linecap="butt"/>' +
    '<rect x="18" y="44" width="22" height="16" rx="3" fill="#DDF0FF"/>' +
    '<rect x="46" y="44" width="22" height="16" rx="3" fill="#DDF0FF"/>' +
    '<path d="M74 44 H79 Q82 44 84 47 L92 60 H74 Z" fill="#DDF0FF"/>' +
    '<path d="M22 56 L30 48 M50 56 L58 48" fill="none" stroke="#FFFFFF" stroke-width="3"/>' +
    '<path d="M71 40 V88" fill="none" stroke-width="2.5"/>' +
    '<path d="M77 66 H84" fill="none" stroke-width="3"/>' +
    '<ellipse cx="107" cy="67" rx="4" ry="3.5" fill="#FFC93C" stroke-width="2.5"/>' +
    '<rect x="8" y="62" width="5" height="9" rx="2" fill="#E4572E" stroke-width="2.5"/>' +
    '<circle cx="32" cy="92" r="12" fill="#4A5568"/>' +
    '<circle cx="32" cy="92" r="4.5" fill="#CBD2D9" stroke-width="2.5"/>' +
    '<circle cx="90" cy="92" r="12" fill="#4A5568"/>' +
    '<circle cx="90" cy="92" r="4.5" fill="#CBD2D9" stroke-width="2.5"/>';

  /* ---------------------------------------------------------------- scenes */

  var SCENES = {
    'cat-mat': [['mat'], ['cat', 24, 22, 0.6], ['zzz', 44, 0, 0.55]],
    'cat-bag': [['bag'], ['cat', 24, 4, 0.55], ['bag-front'], ['zzz', 58, -2, 0.5]],
    'cat-pan': [['pan'], ['cat', 13, 33, 0.55], ['pan-front'], ['zzz', 32, 10, 0.5]],
    'cat-dad': [['dad', 12, 26, 0.8], ['cat', 33, 1, 0.45]],
    'cat-map': [['map'], ['cat', 30, 24, 0.52], ['zzz', 48, 2, 0.5]],
    'cat-can': [['can', 6, 22, 0.9], ['can-hole', 6, 22, 0.9], ['cat', 35, 7, 0.42], ['can-front', 6, 22, 0.9]],
    'bat': [['night'], ['bat', 28, 22, 0.6]],
    'pig-wig': [['pig'], ['wig-on-pig']],
    'pig-bib': [['pig'], ['bib-on-pig']],
    'pig-bin': [['bin'], ['pig', 24, 0, 0.6], ['bin-front']],
    'pig-pit': [['pit'], ['pig', 7, 47, 0.62], ['pit-front']],
    'pig-pot': [['pot'], ['pig', 24, 4, 0.6], ['pot-front']],
    'pig-bun': [['pig', -6, 29, 0.75], ['bun', 64, 61, 0.45]],
    // The lid lifts off a small pot, so it reads as a lid; the lid is big and red, the pot small and grey.
    'lid': [['pot', 22, 48, 0.64], ['lid', 12, -4, 0.8]],
    'dog-log': [['log', 0, 14], ['dog', 32, 2, 0.55]],
    'dog-box': [['box'], ['dog', 31, -5, 0.55]],
    'dog-rock': [['rock', 0, 8], ['dog', 36, -2, 0.55]],
    'dog-cot': [['cot', 0, 8], ['dog-nap', 25, -1, 0.6]],
    'dog-sock': [['sock-side'], ['dog', 6, 21, 0.55]],
    'dog-pot': [['pot'], ['dog', 24, 7, 0.6], ['pot-front']],
    'bug-rug': [['rug', 0, 12], ['bug', 38, 50, 0.36]],
    'bug-cup': [['cup', 0, 6], ['bug', 38, 52, 0.28]],
    'bug-bun': [['bun', 0, 8], ['bug', 43, 26, 0.28]],
    'bug-duck': [['duck', 0, 4], ['bug', 50, 46, 0.26]],
    'bug-bus': [['bus', 0, 4], ['bug', 33, 4, 0.3]],
    'bug-cap': [['cap'], ['bug', 35, 17, 0.28]],
    'pup-sun': [['sun'], ['pup', 3, 43, 0.62]],
    'pup-mud': [['pup', 23, 33, 0.62], ['mud']],
    'pup-tub': [['pup', 24, 9, 0.6], ['tub']],
    'pup-rug': [['rug', 0, 22], ['pup-nap', 18, 20, 0.7], ['zzz', 40, 6, 0.6]],
    'pup-bug': [['pup', -4, 32, 0.7], ['bug', 78, 75, 0.3]],
    'pup-mug': [['pup', -4, 32, 0.7], ['mug', 66, 60, 0.45]],
    'hen-pen': [['hen', 18, 8, 0.75], ['pen']],
    'hen-egg': [['egg'], ['hen', 26, -13, 0.6]],
    'hen-bed': [['bed'], ['hen', 45, 10, 0.5]],
    'hen-jet': [['jet', 0, 6], ['hen', 36, 8, 0.5]],
    'hen-pan': [['pan'], ['hen', 18, 38, 0.5], ['pan-front']],
    'hen-net': [['net-back'], ['hen', 27, 49, 0.4], ['net-front']],
    'duck-pond': [['pond'], ['duck', 30, 37, 0.55], ['ripple']],
    'frog-log': [['log', 0, 20], ['frog', 26, 16, 0.5]],
    'fish-net': [['net-back'], ['fish', 24, 48, 0.5], ['net-front']],
    'sunset': [['sunset'], ['pond'], ['sunset-water']],
    'jet-pond': [['pond'], ['jet', 40, -8, 0.62]],
    'bun-pond': [['pond', -4, 4, 0.85], ['grass'], ['bun', 56, 58, 0.55]]
  };

  function layer(l) {
    var part = P[l[0]];
    if (part === undefined) throw new Error('No part ' + l[0]);
    if (!l[1] && !l[2] && (l[3] === undefined || l[3] === 1)) return part;
    return '<g transform="translate(' + (l[1] || 0) + ' ' + (l[2] || 0) + ') scale(' + (l[3] || 1) + ')">' + part + '</g>';
  }

  function inner(id) {
    if (SCENES[id]) return SCENES[id].map(layer).join('');
    return P[id] || '';
  }

  // Every shape gets the ink outline unless it says otherwise.
  var OUTLINE = '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">';

  /* ---------------------------------------------------------------- puzzle piece */

  /* A jigsaw piece, 100 wide, with a round tab on top that fits into the story card. The picture
     sits in the 80 × 80 square below the tab. */
  var SHAPE = 'M15 21 H39 C43 21 44.5 18.5 43.2 15.6 A8.6 8.6 0 1 1 56.8 15.6 C55.5 18.5 57 21 61 21 ' +
    'H85 A12 12 0 0 1 97 33 V107 A12 12 0 0 1 85 119 H15 A12 12 0 0 1 3 107 V33 A12 12 0 0 1 15 21 Z';

  /* piece(id): a piece showing that picture. piece(null): the empty shape, for spots and gaps. */
  function piece(id) {
    return '<svg class="piece-svg" viewBox="0 -1 100 122" aria-hidden="true" focusable="false">' +
      '<path class="piece-shape" d="' + SHAPE + '"/>' +
      (id ? '<svg x="10" y="30" width="80" height="80" viewBox="0 0 120 120">' + OUTLINE + inner(id) + '</g></svg>' : '') +
      '</svg>';
  }

  /* ---------------------------------------------------------------- control icons */

  // Drawn like Letter Chains' and Monster Math's icons (DESIGN.md: no emoji on controls).
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
    again: ICON + '<path d="M19 12a7 7 0 1 1-2.05-4.95" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M17.5 3.5v4h-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: ICON + '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // An open book, for the Stories button.
    book: ICON + '<path d="M12 6.5C10 5 7 4.6 3.5 5v13c3.5-.4 6.5.1 8.5 1.5 2-1.4 5-1.9 8.5-1.5V5C17 4.6 14 5 12 6.5zM12 6.5v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  SP.Art = {
    has: function (id) { return !!(SCENES[id] || P[id]); },
    piece: piece,
    icons: icons
  };
})(typeof window !== 'undefined' ? window : this);
