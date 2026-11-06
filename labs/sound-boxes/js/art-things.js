/* Primary Labs · Sound Boxes: drawings of things.
   Everything that isn't an animal or a person: bag, cup, sun, hat ...
   Each part is the inside of a 120 × 120 picture; js/art.js adds the ink outline.
   Parts copied from Story Puzzles (js/art.js) and Letter Chains (js/art.js) are unchanged. */
(function (root) {
  'use strict';
  var SB = (root.SB = root.SB || {});
  var P = (SB.PARTS = SB.PARTS || {});

  /* ---------------------------------------------------------------- from Story Puzzles (js/art.js) */

  P.bag =
    '<path d="M54 43 Q54 17 68 17 Q82 17 82 43" fill="none" stroke-width="9"/>' +
    '<path d="M54 43 Q54 17 68 17 Q82 17 82 43" fill="none" stroke="#B23A1E" stroke-width="4"/>' +
    '<path d="M22 50 L36 43 L98 43 L84 50 Z" fill="#B23A1E"/>' +
    '<path d="M84 50 L98 43 L98 99 L84 106 Z" fill="#B23A1E"/>' +
    '<rect x="22" y="50" width="62" height="56" fill="#E4572E"/>' +
    '<path d="M30 60 V96" fill="none" stroke="#F7A1B5" stroke-width="4"/>' +
    '<path d="M39 50 Q39 24 53 24 Q67 24 67 50" fill="none" stroke-width="9"/>' +
    '<path d="M39 50 Q39 24 53 24 Q67 24 67 50" fill="none" stroke="#E4572E" stroke-width="4"/>';

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

  P.cap =
    '<ellipse cx="62" cy="104" rx="48" ry="4" fill="#CBD2D9" stroke="none"/>' +
    '<path d="M74 86 Q102 80 116 92 Q114 102 94 102 Q78 102 70 96 Z" fill="#B23A1E"/>' +
    '<path d="M86 94 Q100 92 110 95" fill="none" stroke="#E4572E" stroke-width="3"/>' +
    '<path d="M10 94 C8 66 28 46 52 46 C78 46 94 66 92 92 Q50 100 10 94 Z" fill="#E4572E"/>' +
    '<path d="M52 47 C42 58 38 76 40 96 M52 47 C66 58 72 76 72 94" fill="none" stroke-width="2.5"/>' +
    '<path d="M20 74 Q24 60 34 54" fill="none" stroke="#F7A1B5" stroke-width="4"/>' +
    '<ellipse cx="52" cy="46" rx="7" ry="3.5" fill="#B23A1E" stroke-width="2.5"/>';

  P.cup =
    '<path d="M28 34 L38 102 Q60 110 82 102 L92 34 Z" fill="#2B6CB0"/>' +
    '<path d="M31 48 Q60 56 89 48 M35.5 82 Q60 89 84.5 82" fill="none" stroke="#8EC5FF" stroke-width="4"/>' +
    '<ellipse cx="60" cy="34" rx="32" ry="8" fill="#8EC5FF"/>' +
    '<ellipse cx="60" cy="35" rx="26" ry="5" fill="#FFFFFF" stroke="none"/>' +
    '<path d="M64 35 L74 6 L88 2" fill="none" stroke-width="10"/>' +
    '<path d="M64 35 L74 6 L88 2" fill="none" stroke="#E4572E" stroke-width="5"/>';

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

  P.mop =
    '<ellipse cx="60" cy="108" rx="50" ry="8" fill="#BEE3F8" stroke="none"/>' +
    '<path d="M76 4 L64 62" fill="none" stroke-width="11"/>' +
    '<path d="M76 4 L64 62" fill="none" stroke="#C98A4B" stroke-width="6"/>' +
    STRANDS.map(function (d) {
      return '<path d="' + d + '" fill="none" stroke-width="11"/><path d="' + d + '" fill="none" stroke="#F5F0E1" stroke-width="5.5"/>';
    }).join('') +
    '<rect x="48" y="56" width="30" height="14" rx="5" fill="#2B6CB0"/>';

  P.mug =
    '<path d="M80 46 H92 Q104 46 104 62 V70 Q104 86 90 86 H80" fill="none" stroke-width="13"/>' +
    '<path d="M80 46 H92 Q104 46 104 62 V70 Q104 86 90 86 H80" fill="none" stroke="#E4572E" stroke-width="8"/>' +
    '<path d="M22 34 H84 V96 Q84 106 74 106 H32 Q22 106 22 96 Z" fill="#E4572E"/>' +
    '<ellipse cx="53" cy="34" rx="31" ry="7" fill="#E4572E"/>' +
    '<ellipse cx="53" cy="35" rx="24" ry="4" fill="#7A4A26" stroke="none"/>' +
    '<path d="M53 88 C36 77 37 61 46 61 C50 61 53 64 53 67 C53 64 56 61 60 61 C69 61 70 77 53 88 Z" fill="#FFFFFF" stroke-width="2.5"/>' +
    '<path d="M30 48 V90" fill="none" stroke="#F7A1B5" stroke-width="4"/>';

  P['pan-back'] =
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

  P.pin =
    '<g transform="rotate(30 60 60)">' +
    '<path d="M60 64 L60 110" fill="none" stroke-width="7"/>' +
    '<path d="M60 64 L60 108" fill="none" stroke="#CBD2D9" stroke-width="3"/>' +
    '<rect x="38" y="56" width="44" height="12" rx="6" fill="#B23A1E"/>' +
    '<path d="M48 28 L52 58 H68 L72 28 Z" fill="#E4572E"/>' +
    '<rect x="36" y="16" width="48" height="15" rx="7.5" fill="#E4572E"/>' +
    '<path d="M44 22 H56 M54 36 L56 50" fill="none" stroke="#FFFFFF" stroke-width="3.5"/>' +
    '</g>';

  P.rug =
    '<path d="M16 40 H6 M16 52 H6 M16 64 H6 M16 76 H6 M104 40 H114 M104 52 H114 M104 64 H114 M104 76 H114" fill="none" stroke-width="3"/>' +
    '<rect x="16" y="32" width="88" height="52" rx="5" fill="#E4572E"/>' +
    '<rect x="26" y="41" width="68" height="34" rx="3" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M60 46 L78 58 L60 70 L42 58 Z" fill="#2B6CB0" stroke-width="2.5"/>' +
    '<circle cx="33" cy="58" r="3" fill="#2B6CB0" stroke="none"/>' +
    '<circle cx="87" cy="58" r="3" fill="#2B6CB0" stroke="none"/>';

  // Story Puzzles' sun is small, in the corner of a scene. This one fills the box, drawn the same way.
  P.sun = (function () {
    var rays = '';
    for (var k = 0; k < 8; k++) {
      rays += '<path d="M60 6 L69 31 H51 Z" fill="#F2B705" stroke-width="2.5" transform="rotate(' + k * 45 + ' 60 60)"/>';
    }
    return rays + '<circle cx="60" cy="60" r="32" fill="#FFD43B"/>' +
      '<path d="M41 54 Q43 40 56 38" fill="none" stroke="#FFFFFF" stroke-width="5"/>';
  })();

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

  /* ---------------------------------------------------------------- from Letter Chains (js/art.js) */

  P.wig = (function () {
    var curls = [[34, 80], [32, 64], [38, 48], [50, 37], [70, 37], [82, 48], [88, 64], [86, 80]];
    var c = '';
    curls.forEach(function (p) { c += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="#9B5DE5"/>'; });
    return '<rect x="40" y="106" width="40" height="9" rx="4" fill="#A0673A"/>' +
      '<rect x="54" y="90" width="12" height="18" fill="#C98A4B"/>' +
      c +
      '<ellipse cx="60" cy="62" rx="27" ry="24" fill="#9B5DE5" stroke="none"/>' +
      '<ellipse cx="60" cy="74" rx="19" ry="21" fill="#EDE7F6"/>' +
      '<circle cx="48" cy="54" r="9" fill="#9B5DE5"/>' +
      '<circle cx="60" cy="51" r="9" fill="#9B5DE5"/>' +
      '<circle cx="72" cy="54" r="9" fill="#9B5DE5"/>';
  })();

  P.top =
    '<path d="M10 58 Q5 70 11 82 M110 58 Q115 70 109 82" fill="none" stroke-width="2.5"/>' +
    '<rect x="53" y="22" width="14" height="22" rx="4" fill="#2B6CB0"/>' +
    '<path d="M60 108 L22 66 Q22 42 60 40 Q98 42 98 66 Z" fill="#FFC93C"/>' +
    '<path d="M24 68 Q60 82 96 68" fill="none" stroke="#E4572E" stroke-width="7"/>';

  // a shovel digging a mound of dirt
  P.dig =
    '<path d="M8 102 Q60 56 112 102 Z" fill="#A0673A"/>' +
    '<circle cx="40" cy="90" r="2.5" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="80" cy="92" r="2.5" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="60" cy="96" r="2.5" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="30" cy="52" r="5" fill="#A0673A"/>' +
    '<circle cx="42" cy="40" r="4" fill="#A0673A"/>' +
    '<circle cx="22" cy="64" r="3.5" fill="#A0673A"/>' +
    '<path d="M88 14 L64 66" fill="none" stroke="#C98A4B" stroke-width="8"/>' +
    '<path d="M80 12 L96 19" fill="none" stroke-width="7"/>' +
    '<path d="M52 62 L74 72 L66 92 Q57 97 50 88 Z" fill="#9AA5B1"/>';

  /* ---------------------------------------------------------------- new for Sound Boxes */

  // a top hat with a red band (not a cap: cap is drawn above)
  P.hat =
    '<ellipse cx="60" cy="90" rx="52" ry="13" fill="#1F2A44"/>' +
    '<path d="M18 93 Q60 106 102 93" fill="none" stroke="#9AA5B1" stroke-width="3"/>' +
    '<path d="M36 14 H84 Q88 14 88 18 V88 Q60 96 32 88 V18 Q32 14 36 14 Z" fill="#1F2A44"/>' +
    '<path d="M32 68 H88 V82 Q60 89 32 82 Z" fill="#E4572E"/>' +
    '<path d="M40 22 V58" fill="none" stroke="#9AA5B1" stroke-width="4"/>';

  // a zipper on blue cloth, with its pull tab
  P.zip =
    '<rect x="24" y="8" width="72" height="104" rx="8" fill="#5AA9FF"/>' +
    '<path d="M50 16 H60 M60 24 H70 M50 32 H60 M60 40 H70 M50 48 H60 M60 56 H70 M50 64 H60 M60 72 H70 M50 80 H60 M60 88 H70 M50 96 H60 M60 104 H70" fill="none" stroke-width="8"/>' +
    '<path d="M50 16 H60 M60 24 H70 M50 32 H60 M60 40 H70 M50 48 H60 M60 56 H70 M50 64 H60 M60 72 H70 M50 80 H60 M60 88 H70 M50 96 H60 M60 104 H70" fill="none" stroke="#FFC93C" stroke-width="4"/>' +
    '<path d="M46 12 H74 L68 40 H52 Z" fill="#9AA5B1"/>' +
    '<rect x="53" y="34" width="14" height="38" rx="7" fill="#CBD2D9"/>' +
    '<rect x="57" y="56" width="6" height="10" rx="3" fill="#5AA9FF"/>';

  // a kitchen tap with a red lever and water drops
  P.tap =
    '<path d="M36 52 V40 Q36 22 58 22 H76 Q90 22 90 36 V48" fill="none" stroke-width="16"/>' +
    '<path d="M36 52 V40 Q36 22 58 22 H76 Q90 22 90 36 V48" fill="none" stroke="#CBD2D9" stroke-width="10"/>' +
    '<rect x="26" y="50" width="20" height="52" rx="4" fill="#CBD2D9"/>' +
    '<path d="M32 58 V94" fill="none" stroke="#FFFFFF" stroke-width="3"/>' +
    '<rect x="14" y="100" width="44" height="10" rx="3" fill="#9AA5B1"/>' +
    '<path d="M28 62 L12 50" fill="none" stroke-width="5"/>' +
    '<circle cx="12" cy="50" r="6" fill="#E4572E"/>' +
    '<rect x="82" y="46" width="16" height="8" rx="2" fill="#9AA5B1"/>' +
    '<path d="M90 64 C90 64 82 76 82 82 A8 8 0 0 0 98 82 C98 76 90 64 90 64 Z" fill="#5AA9FF"/>' +
    '<path d="M90 96 C90 96 86 102 86 105 A4 4 0 0 0 94 105 C94 102 90 96 90 96 Z" fill="#5AA9FF" stroke-width="2.5"/>';

  // a sub sandwich: long roll, lettuce, tomato and cheese
  P.sub =
    '<path d="M8 74 H112 Q112 86 100 86 H20 Q8 86 8 74 Z" fill="#D9A066"/>' +
    '<path d="M8 74 Q13 64 18 70 Q24 63 30 70 Q36 63 42 70 Q48 63 54 70 Q60 63 66 70 Q72 63 78 70 Q84 63 90 70 Q96 63 102 70 Q108 64 112 74 Z" fill="#2BA84A"/>' +
    '<rect x="14" y="60" width="28" height="9" rx="4.5" fill="#E4572E"/>' +
    '<rect x="46" y="60" width="28" height="9" rx="4.5" fill="#E4572E"/>' +
    '<rect x="78" y="60" width="28" height="9" rx="4.5" fill="#E4572E"/>' +
    '<path d="M10 56 H110 V62 H74 L70 68 L66 62 H34 L30 68 L26 62 H10 Z" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M10 58 Q8 36 30 36 H90 Q112 36 110 58 Z" fill="#C98A4B"/>' +
    '<path d="M32 46 L40 41 M54 46 L62 41 M76 46 L84 41" fill="none" stroke="#FFF4DC" stroke-width="3"/>';

  // a peanut in its shell
  P.nut =
    '<g transform="rotate(25 60 60)">' +
    '<path d="M60 12 C81 12 87 32 80 47 C76 54 76 58 80 66 C89 83 82 108 60 108 C38 108 31 83 40 66 C44 58 44 54 40 47 C33 32 39 12 60 12 Z" fill="#D9A066"/>' +
    '<path d="M51 18 Q45 31 51 46 M69 18 Q75 31 69 46 M47 72 Q41 88 49 102 M73 72 Q79 88 71 102 M43 31 Q60 37 77 31 M41 87 Q60 93 79 87" fill="none" stroke="#A0673A" stroke-width="2.5"/>' +
    '</g>';

  // a wooden clothes peg with its metal spring
  P.peg =
    '<g transform="rotate(25 60 60)">' +
    '<path d="M38 12 Q38 8 42 8 H52 L59 66 V106 Q59 110 55 110 H52 Q48 110 48 106 L44 66 Z" fill="#D9A066"/>' +
    '<path d="M82 12 Q82 8 78 8 H68 L61 66 V106 Q61 110 65 110 H68 Q72 110 72 106 L76 66 Z" fill="#D9A066"/>' +
    '<path d="M44 20 L47 40 M76 20 L73 40 M54 80 V100 M66 80 V100" fill="none" stroke="#A0673A" stroke-width="2"/>' +
    '<rect x="40" y="52" width="40" height="14" rx="7" fill="#9AA5B1"/>' +
    '<path d="M48 52 V66 M56 52 V66 M64 52 V66 M72 52 V66" fill="none" stroke-width="2"/>' +
    '</g>';

  // ten dots in a ten-frame (no digits: the trays are letters)
  P.ten = (function () {
    var dots = '';
    [20, 40, 60, 80, 100].forEach(function (x) {
      dots += '<circle cx="' + x + '" cy="47" r="7.5" fill="#E4572E" stroke-width="2"/>' +
        '<circle cx="' + x + '" cy="73" r="7.5" fill="#E4572E" stroke-width="2"/>';
    });
    return '<rect x="10" y="34" width="100" height="52" rx="3" fill="#FFFFFF"/>' +
      '<path d="M30 34 V86 M50 34 V86 M70 34 V86 M90 34 V86 M10 60 H110" fill="none"/>' + dots;
  })();

  // a ballpoint pen with its cap on, for writing (Story Puzzles' "pen" is an animal pen)
  P.pen =
    '<g transform="rotate(-45 60 60)">' +
    '<rect x="22" y="52" width="64" height="16" rx="3" fill="#5AA9FF"/>' +
    '<path d="M42 56 H76" fill="none" stroke="#FFFFFF" stroke-width="3"/>' +
    '<rect x="22" y="51" width="14" height="18" rx="3" fill="#2B6CB0"/>' +
    '<path d="M22 52 L11 57 V63 L22 68 Z" fill="#CBD2D9"/>' +
    '<circle cx="9" cy="60" r="3" fill="#1F2A44"/>' +
    '<rect x="82" y="50" width="34" height="20" rx="5" fill="#2B6CB0"/>' +
    '<rect x="88" y="43" width="26" height="6" rx="3" fill="#CBD2D9"/>' +
    '</g>';
})(typeof window !== 'undefined' ? window : this);
