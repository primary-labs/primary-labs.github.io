/* Primary Labs · Letter Chains — hand-drawn SVG pictures (static, trusted strings) */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var INK = '#1F2A44';

  function svg(inner) {
    return (
      '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
      inner +
      '</g></svg>'
    );
  }

  var A = {};

  A.cat = svg(
    '<path d="M30 52 L33 16 L58 38 Z" fill="#F59E42"/>' +
    '<path d="M90 52 L87 16 L62 38 Z" fill="#F59E42"/>' +
    '<path d="M36 42 L37 27 L49 37 Z" fill="#F7A1B5" stroke="none"/>' +
    '<path d="M84 42 L83 27 L71 37 Z" fill="#F7A1B5" stroke="none"/>' +
    '<ellipse cx="60" cy="68" rx="37" ry="32" fill="#F59E42"/>' +
    '<path d="M53 40 L55 48 M60 38 L60 47 M67 40 L65 48" stroke="#C46A1B" stroke-width="3.5"/>' +
    '<circle cx="46" cy="63" r="4.5" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="74" cy="63" r="4.5" fill="' + INK + '" stroke="none"/>' +
    '<path d="M55 73 L65 73 L60 79 Z" fill="#E4572E" stroke-width="2"/>' +
    '<path d="M60 79 Q55 86 49 82 M60 79 Q65 86 71 82" fill="none" stroke-width="2.5"/>' +
    '<path d="M38 75 L18 71 M38 80 L19 83 M82 75 L102 71 M82 80 L101 83" fill="none" stroke-width="2"/>'
  );

  A.dog = svg(
    '<ellipse cx="60" cy="62" rx="32" ry="34" fill="#D9A066"/>' +
    '<ellipse cx="74" cy="54" rx="10" ry="9" fill="#A0673A" stroke="none"/>' +
    '<path d="M33 38 C17 40 12 70 21 84 C31 87 38 70 37 54 Z" fill="#A0673A"/>' +
    '<path d="M87 38 C103 40 108 70 99 84 C89 87 82 70 83 54 Z" fill="#A0673A"/>' +
    '<ellipse cx="60" cy="79" rx="18" ry="13" fill="#FFF4DC"/>' +
    '<ellipse cx="60" cy="72" rx="6.5" ry="4.5" fill="' + INK + '" stroke="none"/>' +
    '<path d="M60 77 L60 82 M60 82 Q54 88 49 84 M60 82 Q66 88 71 84" fill="none" stroke-width="2.5"/>' +
    '<circle cx="48" cy="55" r="4.5" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="72" cy="55" r="4.5" fill="' + INK + '" stroke="none"/>'
  );

  A.cot = svg(
    '<path d="M70 18 H80 L70 28 H80 M86 6 H93 L86 13 H93" fill="none" stroke-width="2.5"/>' +
    '<path d="M24 94 L48 68 M48 94 L24 68 M72 94 L96 68 M96 94 L72 68" fill="none" stroke-width="4"/>' +
    '<rect x="12" y="56" width="96" height="14" rx="6" fill="#2BA84A"/>' +
    '<rect x="16" y="43" width="30" height="15" rx="7" fill="#FFFFFF"/>' +
    '<path d="M50 56 Q70 44 104 52 L104 56 Z" fill="#FFC93C"/>'
  );

  A.dot = svg(
    '<circle cx="60" cy="60" r="36" fill="#E4572E"/>' +
    '<circle cx="47" cy="47" r="8" fill="#FFFFFF" fill-opacity="0.55" stroke="none"/>'
  );

  A.dig = svg(
    '<path d="M8 102 Q60 56 112 102 Z" fill="#A0673A"/>' +
    '<circle cx="40" cy="90" r="2.5" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="80" cy="92" r="2.5" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="60" cy="96" r="2.5" fill="#7A4A26" stroke="none"/>' +
    '<circle cx="30" cy="52" r="5" fill="#A0673A"/>' +
    '<circle cx="42" cy="40" r="4" fill="#A0673A"/>' +
    '<circle cx="22" cy="64" r="3.5" fill="#A0673A"/>' +
    '<path d="M88 14 L64 66" fill="none" stroke="#C98A4B" stroke-width="8"/>' +
    '<path d="M80 12 L96 19" fill="none" stroke-width="7"/>' +
    '<path d="M52 62 L74 72 L66 92 Q57 97 50 88 Z" fill="#9AA5B1"/>'
  );

  A.dad = svg(
    '<path d="M22 114 Q22 84 60 84 Q98 84 98 114 Z" fill="#2B6CB0"/>' +
    '<path d="M52 84 L60 96 L68 84" fill="#FFFFFF"/>' +
    '<rect x="52" y="70" width="16" height="16" fill="#E8B48A" stroke="none"/>' +
    '<circle cx="36" cy="56" r="6" fill="#E8B48A"/>' +
    '<circle cx="84" cy="56" r="6" fill="#E8B48A"/>' +
    '<circle cx="60" cy="54" r="25" fill="#E8B48A"/>' +
    '<path d="M35 50 Q35 25 60 25 Q85 25 85 50 Q77 37 60 39 Q45 39 35 50 Z" fill="#5B3A24"/>' +
    '<circle cx="51" cy="56" r="3.5" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="69" cy="56" r="3.5" fill="' + INK + '" stroke="none"/>' +
    '<path d="M50 66 Q60 75 70 66" fill="none" stroke-width="3"/>'
  );

  A.can = svg(
    '<path d="M34 24 L34 100 Q60 110 86 100 L86 24 Z" fill="#9AA5B1"/>' +
    '<path d="M34 44 Q60 52 86 44 L86 82 Q60 90 34 82 Z" fill="#E4572E"/>' +
    '<circle cx="60" cy="66" r="10" fill="#FFC93C" stroke-width="2.5"/>' +
    '<ellipse cx="60" cy="24" rx="26" ry="7" fill="#CBD2D9"/>'
  );

  A.tin = svg(
    '<path d="M16 54 L16 90 Q60 108 104 90 L104 54 Z" fill="#2B6CB0"/>' +
    '<path d="M16 70 Q60 86 104 70" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="2 8"/>' +
    '<ellipse cx="60" cy="54" rx="44" ry="13" fill="#8EC5FF"/>' +
    '<ellipse cx="60" cy="52" rx="32" ry="8" fill="none" stroke="#2B6CB0" stroke-width="2"/>' +
    '<circle cx="96" cy="98" r="15" fill="#D9A066"/>' +
    '<circle cx="91" cy="93" r="2.5" fill="#5B3A24" stroke="none"/>' +
    '<circle cx="100" cy="96" r="2.5" fill="#5B3A24" stroke="none"/>' +
    '<circle cx="94" cy="104" r="2.5" fill="#5B3A24" stroke="none"/>'
  );

  A.tan = svg(
    '<g transform="rotate(-30 60 56)">' +
    '<rect x="18" y="44" width="66" height="24" rx="4" fill="#D2B48C"/>' +
    '<rect x="34" y="44" width="34" height="24" fill="#FFF4DC"/>' +
    '<path d="M84 44 L106 56 L84 68 Z" fill="#D2B48C"/>' +
    '</g>' +
    '<path d="M16 102 q10 -12 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#C39B6B" stroke-width="7"/>'
  );

  A.ton = svg(
    '<path d="M46 54 Q46 28 60 28 Q74 28 74 54" fill="none" stroke-width="12"/>' +
    '<path d="M46 54 Q46 28 60 28 Q74 28 74 54" fill="none" stroke="#4A5568" stroke-width="6"/>' +
    '<path d="M26 104 L38 50 L82 50 L94 104 Z" fill="#4A5568"/>' +
    '<text x="60" y="88" text-anchor="middle" font-size="19" font-weight="700" fill="#FFFFFF" stroke="none">1 TON</text>'
  );

  A.tot = svg(
    '<path d="M30 116 Q30 92 60 92 Q90 92 90 116 Z" fill="#F7A1B5"/>' +
    '<circle cx="60" cy="58" r="33" fill="#F2C9A0"/>' +
    '<path d="M58 26 q-9 -11 2 -15 q9 -2 6 7" fill="none" stroke="#5B3A24" stroke-width="3"/>' +
    '<circle cx="48" cy="56" r="4" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="72" cy="56" r="4" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="41" cy="68" r="6" fill="#F7A1B5" stroke="none"/>' +
    '<circle cx="79" cy="68" r="6" fill="#F7A1B5" stroke="none"/>' +
    '<path d="M52 72 Q60 80 68 72" fill="none" stroke-width="3"/>'
  );

  A.nod = svg(
    '<circle cx="60" cy="62" r="32" fill="#FFC93C"/>' +
    '<path d="M42 58 Q48 52 54 58 M66 58 Q72 52 78 58" fill="none" stroke-width="3"/>' +
    '<path d="M46 72 Q60 86 74 72" fill="none" stroke-width="3"/>' +
    '<path d="M14 42 L14 82 M8 48 L14 42 L20 48 M8 76 L14 82 L20 76" fill="none" stroke-width="3"/>' +
    '<path d="M106 42 L106 82 M100 48 L106 42 L112 48 M100 76 L106 82 L112 76" fill="none" stroke-width="3"/>'
  );

  A.tag = svg(
    '<path d="M36 58 Q18 28 6 34" fill="none" stroke="#E4572E" stroke-width="3"/>' +
    '<g transform="rotate(-18 60 60)">' +
    '<path d="M42 38 L98 38 Q102 38 102 42 L102 78 Q102 82 98 82 L42 82 L20 60 Z" fill="#FFC93C"/>' +
    '<circle cx="36" cy="60" r="5" fill="#FFFFFF"/>' +
    '<path d="M54 54 L90 54 M54 66 L82 66" fill="none" stroke-width="3.5"/>' +
    '</g>'
  );

  A.cod = svg(
    '<circle cx="12" cy="42" r="4" fill="none" stroke="#2B6CB0" stroke-width="2"/>' +
    '<circle cx="8" cy="28" r="3" fill="none" stroke="#2B6CB0" stroke-width="2"/>' +
    '<path d="M56 42 Q64 26 76 44" fill="#5E9C76"/>' +
    '<path d="M18 62 C34 36 72 36 88 60 L106 42 L102 62 L106 82 L88 64 C72 88 34 88 18 62 Z" fill="#9BC4A8"/>' +
    '<path d="M46 48 Q54 62 46 76" fill="none" stroke-width="2.5"/>' +
    '<circle cx="33" cy="57" r="6" fill="#FFFFFF" stroke-width="2"/>' +
    '<circle cx="34" cy="57" r="3" fill="' + INK + '" stroke="none"/>' +
    '<path d="M60 64 q5 -4 10 0 M68 54 q5 -4 10 0" fill="none" stroke="#5E9C76" stroke-width="2.5"/>'
  );

  A.cog = svg(
    (function () {
      var t = '';
      for (var k = 0; k < 8; k++) {
        t += '<rect x="51" y="14" width="18" height="20" rx="3" fill="#9AA5B1" transform="rotate(' + k * 45 + ' 60 60)"/>';
      }
      return t;
    })() +
    '<circle cx="60" cy="60" r="33" fill="#9AA5B1"/>' +
    '<circle cx="60" cy="60" r="13" fill="#FFFFFF"/>'
  );

  A.gig = svg(
    '<ellipse cx="22" cy="44" rx="6" ry="4.5" fill="' + INK + '" stroke="none" transform="rotate(-20 22 44)"/>' +
    '<path d="M27 43 L27 20 L36 24" fill="none" stroke-width="3"/>' +
    '<ellipse cx="98" cy="30" rx="5" ry="4" fill="' + INK + '" stroke="none" transform="rotate(-20 98 30)"/>' +
    '<path d="M102 29 L102 10" fill="none" stroke-width="3"/>' +
    '<g transform="rotate(35 60 64)">' +
    '<ellipse cx="60" cy="70" rx="17" ry="15" fill="#E4572E"/>' +
    '<ellipse cx="60" cy="94" rx="23" ry="19" fill="#E4572E"/>' +
    '<ellipse cx="60" cy="72" rx="15.5" ry="13.5" fill="#E4572E" stroke="none"/>' +
    '<circle cx="60" cy="86" r="6" fill="' + INK + '" stroke="none"/>' +
    '<rect x="56" y="10" width="8" height="66" fill="#A0673A"/>' +
    '<rect x="52" y="2" width="16" height="13" rx="3" fill="#5B3A24"/>' +
    '<rect x="50" y="100" width="20" height="5" rx="2" fill="#5B3A24"/>' +
    '</g>'
  );

  /* Common short words that have no good emoji */
  A.log = svg(
    '<path d="M78 46 Q82 32 92 28" fill="none" stroke="#5B3A24" stroke-width="3"/>' +
    '<ellipse cx="96" cy="26" rx="8" ry="4.5" fill="#2BA84A" stroke-width="2.5" transform="rotate(-25 96 26)"/>' +
    '<path d="M28 46 H96 Q106 46 106 66 Q106 86 96 86 H28 Z" fill="#A0673A"/>' +
    '<path d="M46 56 H72 M60 76 H90 M82 60 H96" fill="none" stroke="#7A4A26" stroke-width="3"/>' +
    '<ellipse cx="28" cy="66" rx="13" ry="20" fill="#E8C08A"/>' +
    '<ellipse cx="28" cy="66" rx="7" ry="12" fill="none" stroke="#A0673A" stroke-width="2.5"/>' +
    '<ellipse cx="28" cy="66" rx="2.5" ry="4" fill="#A0673A" stroke="none"/>'
  );

  A.mop = svg(
    '<ellipse cx="60" cy="110" rx="40" ry="6" fill="#BEE3F8" stroke="none"/>' +
    '<path d="M70 6 L62 70" fill="none" stroke-width="11"/>' +
    '<path d="M70 6 L62 70" fill="none" stroke="#C98A4B" stroke-width="6"/>' +
    '<path d="M50 78 L36 106 M56 78 L50 110 M64 78 L68 110 M70 78 L84 106" fill="none" stroke-width="10"/>' +
    '<path d="M50 78 L36 106 M56 78 L50 110 M64 78 L68 110 M70 78 L84 106" fill="none" stroke="#F5F0E1" stroke-width="5"/>' +
    '<rect x="46" y="66" width="30" height="13" rx="4" fill="#2B6CB0"/>'
  );

  A.rug = svg(
    '<path d="M16 40 H6 M16 52 H6 M16 64 H6 M16 76 H6 M104 40 H114 M104 52 H114 M104 64 H114 M104 76 H114" fill="none" stroke-width="3"/>' +
    '<rect x="16" y="32" width="88" height="52" rx="5" fill="#E4572E"/>' +
    '<rect x="26" y="41" width="68" height="34" rx="3" fill="#FFC93C" stroke-width="2.5"/>' +
    '<path d="M60 46 L78 58 L60 70 L42 58 Z" fill="#2B6CB0" stroke-width="2.5"/>' +
    '<circle cx="33" cy="58" r="3" fill="#2B6CB0" stroke="none"/>' +
    '<circle cx="87" cy="58" r="3" fill="#2B6CB0" stroke="none"/>'
  );

  A.fan = svg(
    '<path d="M54 84 L46 106 H74 L66 84 Z" fill="#9AA5B1"/>' +
    '<rect x="38" y="104" width="44" height="9" rx="4" fill="#CBD2D9"/>' +
    '<circle cx="60" cy="52" r="36" fill="#DDF0FF"/>' +
    '<ellipse cx="60" cy="34" rx="10" ry="17" fill="#2B6CB0" stroke-width="2.5"/>' +
    '<ellipse cx="60" cy="34" rx="10" ry="17" fill="#2B6CB0" stroke-width="2.5" transform="rotate(120 60 52)"/>' +
    '<ellipse cx="60" cy="34" rx="10" ry="17" fill="#2B6CB0" stroke-width="2.5" transform="rotate(240 60 52)"/>' +
    '<circle cx="60" cy="52" r="7" fill="#FFFFFF"/>' +
    '<circle cx="60" cy="52" r="36" fill="none" stroke-width="3.5"/>' +
    '<path d="M104 30 q7 5 0 10 M108 50 q7 5 0 10" fill="none" stroke="#5AA9FF" stroke-width="3"/>'
  );

  A.wig = (function () {
    var curls = [[34, 80], [32, 64], [38, 48], [50, 37], [70, 37], [82, 48], [88, 64], [86, 80]];
    var c = '';
    curls.forEach(function (p) { c += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="#9B5DE5"/>'; });
    return svg(
      '<rect x="40" y="106" width="40" height="9" rx="4" fill="#A0673A"/>' +
      '<rect x="54" y="90" width="12" height="18" fill="#C98A4B"/>' +
      c +
      '<ellipse cx="60" cy="62" rx="27" ry="24" fill="#9B5DE5" stroke="none"/>' +
      '<ellipse cx="60" cy="74" rx="19" ry="21" fill="#EDE7F6"/>' +
      '<circle cx="48" cy="54" r="9" fill="#9B5DE5"/>' +
      '<circle cx="60" cy="51" r="9" fill="#9B5DE5"/>' +
      '<circle cx="72" cy="54" r="9" fill="#9B5DE5"/>'
    );
  })();

  A.jar = svg(
    '<path d="M34 42 H86 V94 Q86 106 74 106 H46 Q34 106 34 94 Z" fill="#DDF0FF"/>' +
    '<path d="M37 64 H83 V93 Q83 103 73 103 H47 Q37 103 37 93 Z" fill="#E4572E" stroke="none"/>' +
    '<path d="M34 42 H86 V94 Q86 106 74 106 H46 Q34 106 34 94 Z" fill="none"/>' +
    '<rect x="44" y="72" width="32" height="18" rx="3" fill="#FFFFFF" stroke-width="2.5"/>' +
    '<path d="M42 50 V60" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<rect x="30" y="22" width="60" height="20" rx="5" fill="#FFC93C"/>' +
    '<path d="M38 28 V36 M48 28 V36 M58 28 V36 M68 28 V36 M78 28 V36" fill="none" stroke="#C99A1E" stroke-width="2.5"/>'
  );

  A.lid = svg(
    '<path d="M16 80 Q60 30 104 80 Z" fill="#9AA5B1"/>' +
    '<path d="M34 66 Q46 54 60 52" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<rect x="10" y="78" width="100" height="11" rx="5.5" fill="#CBD2D9"/>' +
    '<rect x="48" y="44" width="24" height="10" rx="5" fill="#4A5568"/>'
  );

  /* Keyword pictures for the sound cards */
  A.apple = svg(
    '<path d="M60 36 Q58 22 64 12" fill="none" stroke="#5B3A24" stroke-width="4"/>' +
    '<path d="M60 36 C44 24 18 30 21 60 C24 88 44 106 60 97 C76 106 96 88 99 60 C102 30 76 24 60 36 Z" fill="#E4572E"/>' +
    '<path d="M64 24 Q80 10 90 21 Q77 33 64 24 Z" fill="#2BA84A" stroke-width="2.5"/>' +
    '<ellipse cx="40" cy="56" rx="6" ry="11" fill="#FFFFFF" fill-opacity="0.45" stroke="none"/>'
  );

  A.igloo = svg(
    '<path d="M12 96 A48 48 0 0 1 108 96 Z" fill="#EAF4FF"/>' +
    '<path d="M15 80 L44 80 M76 80 L105 80 M24 64 L46 64 M74 64 L96 64 M46 50 L74 50" fill="none" stroke="#8EA4BC" stroke-width="2.5"/>' +
    '<path d="M32 80 L32 96 M90 80 L90 96 M36 64 L36 80 M86 64 L86 80 M60 50 L60 58" fill="none" stroke="#8EA4BC" stroke-width="2.5"/>' +
    '<path d="M44 96 L44 78 A16 16 0 0 1 76 78 L76 96 Z" fill="#2B6CB0"/>' +
    '<path d="M4 96 L116 96" fill="none" stroke-width="3"/>'
  );

  A.octopus = (function () {
    var legs = [
      'M34 66 Q12 78 18 96 Q22 108 10 110',
      'M46 72 Q34 92 44 104 Q52 112 42 116',
      'M60 74 Q62 96 68 104 Q74 112 64 116',
      'M74 72 Q86 92 78 104 Q70 112 80 116',
      'M86 66 Q108 78 102 96 Q98 108 110 110'
    ];
    var outline = '', fill = '';
    legs.forEach(function (d) {
      outline += '<path d="' + d + '" fill="none" stroke-width="13"/>';
      fill += '<path d="' + d + '" fill="none" stroke="#9B5DE5" stroke-width="7"/>';
    });
    return svg(
      outline + fill +
      '<path d="M26 58 C20 8 100 8 94 58 C92 78 28 78 26 58 Z" fill="#9B5DE5"/>' +
      '<circle cx="47" cy="48" r="8" fill="#FFFFFF" stroke-width="2"/>' +
      '<circle cx="73" cy="48" r="8" fill="#FFFFFF" stroke-width="2"/>' +
      '<circle cx="48" cy="49" r="3.5" fill="' + INK + '" stroke="none"/>' +
      '<circle cx="72" cy="49" r="3.5" fill="' + INK + '" stroke="none"/>' +
      '<circle cx="38" cy="60" r="4" fill="#F7A1B5" stroke="none"/>' +
      '<circle cx="82" cy="60" r="4" fill="#F7A1B5" stroke="none"/>' +
      '<path d="M53 61 Q60 67 67 61" fill="none" stroke-width="2.5"/>' +
      '<circle cx="22" cy="98" r="2" fill="#E9D5FF" stroke="none"/>' +
      '<circle cx="98" cy="98" r="2" fill="#E9D5FF" stroke="none"/>'
    );
  })();

  A.top = svg(
    '<path d="M10 58 Q5 70 11 82 M110 58 Q115 70 109 82" fill="none" stroke-width="2.5"/>' +
    '<rect x="53" y="22" width="14" height="22" rx="4" fill="#2B6CB0"/>' +
    '<path d="M60 108 L22 66 Q22 42 60 40 Q98 42 98 66 Z" fill="#FFC93C"/>' +
    '<path d="M24 68 Q60 82 96 68" fill="none" stroke="#E4572E" stroke-width="7"/>'
  );

  A.duck = svg(
    '<path d="M8 110 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#2B6CB0" stroke-width="3"/>' +
    '<path d="M26 82 Q28 104 62 104 Q98 104 104 70 Q92 80 80 70 L44 70 Q28 70 26 82 Z" fill="#FFD43B"/>' +
    '<path d="M22 46 L6 51 L22 57 Z" fill="#F59E42"/>' +
    '<circle cx="40" cy="48" r="19" fill="#FFD43B"/>' +
    '<circle cx="37" cy="44" r="3.5" fill="' + INK + '" stroke="none"/>' +
    '<path d="M58 80 Q78 68 92 82 Q76 94 58 80 Z" fill="#F2B705" stroke-width="2.5"/>'
  );

  A.cup = svg(
    '<path d="M46 28 q-6 -8 0 -16 M60 26 q-6 -8 0 -16 M74 28 q-6 -8 0 -16" fill="none" stroke="#9AA5B1" stroke-width="3"/>' +
    '<path d="M88 52 Q110 52 106 72 Q102 88 86 86" fill="none" stroke-width="12"/>' +
    '<path d="M88 52 Q110 52 106 72 Q102 88 86 86" fill="none" stroke="#2B6CB0" stroke-width="6"/>' +
    '<path d="M28 40 L34 98 Q60 106 86 98 L92 40 Z" fill="#2B6CB0"/>' +
    '<ellipse cx="60" cy="40" rx="32" ry="8" fill="#8EC5FF"/>' +
    '<ellipse cx="60" cy="41" rx="24" ry="4.5" fill="#7A4A26" stroke="none"/>'
  );

  A.goat = svg(
    '<path d="M46 32 Q36 10 22 16" fill="none" stroke="#A0673A" stroke-width="7"/>' +
    '<path d="M74 32 Q84 10 98 16" fill="none" stroke="#A0673A" stroke-width="7"/>' +
    '<path d="M53 94 L60 114 L67 94 Z" fill="#FFFFFF"/>' +
    '<ellipse cx="26" cy="50" rx="15" ry="7" fill="#FFFFFF" transform="rotate(20 26 50)"/>' +
    '<ellipse cx="94" cy="50" rx="15" ry="7" fill="#FFFFFF" transform="rotate(-20 94 50)"/>' +
    '<path d="M38 34 Q60 22 82 34 Q87 70 72 93 Q60 101 48 93 Q33 70 38 34 Z" fill="#FFFFFF"/>' +
    '<circle cx="50" cy="52" r="4" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="70" cy="52" r="4" fill="' + INK + '" stroke="none"/>' +
    '<ellipse cx="60" cy="82" rx="11" ry="7" fill="#F7A1B5" stroke-width="2.5"/>' +
    '<circle cx="56" cy="82" r="1.8" fill="' + INK + '" stroke="none"/>' +
    '<circle cx="64" cy="82" r="1.8" fill="' + INK + '" stroke="none"/>'
  );

  A.nest = svg(
    '<ellipse cx="46" cy="60" rx="11" ry="14" fill="#8EC5FF"/>' +
    '<ellipse cx="74" cy="58" rx="11" ry="14" fill="#8EC5FF"/>' +
    '<ellipse cx="60" cy="64" rx="11" ry="14" fill="#BEE3F8"/>' +
    '<path d="M14 66 L5 58 M106 66 L115 56 M20 70 L10 74" fill="none" stroke="#7A4A26" stroke-width="3"/>' +
    '<path d="M14 66 Q16 102 60 102 Q104 102 106 66 Q60 82 14 66 Z" fill="#A0673A"/>' +
    '<path d="M22 78 Q60 92 98 78 M30 89 Q60 98 90 89" fill="none" stroke="#7A4A26" stroke-width="3"/>'
  );

  A.magnifier = svg(
    '<path d="M74 74 L104 104" fill="none" stroke-width="16"/>' +
    '<path d="M74 74 L104 104" fill="none" stroke="#A0673A" stroke-width="10"/>' +
    '<circle cx="50" cy="50" r="34" fill="#BEE3F8" stroke-width="7"/>' +
    '<path d="M30 42 Q36 28 50 26" fill="none" stroke="#FFFFFF" stroke-width="5"/>' +
    '<rect x="34" y="40" width="32" height="24" rx="6" fill="#2160B0" stroke-width="2.5"/>' +
    '<text x="50" y="59" text-anchor="middle" font-size="20" font-weight="700" fill="#FFFFFF" stroke="none">t</text>'
  );

  /* Two interlocking chain links: yellow passes over blue at the top, under it at the bottom. */
  A.chainHero = svg(
    '<rect x="6" y="40" width="60" height="40" rx="20" fill="none" stroke-width="16"/>' +
    '<rect x="6" y="40" width="60" height="40" rx="20" fill="none" stroke="#FFC93C" stroke-width="9"/>' +
    '<rect x="54" y="40" width="60" height="40" rx="20" fill="none" stroke-width="16"/>' +
    '<rect x="54" y="40" width="60" height="40" rx="20" fill="none" stroke="#2160B0" stroke-width="9"/>' +
    '<path d="M50 40.4 A20 20 0 0 1 64.8 53.2" fill="none" stroke-width="16" stroke-linecap="butt"/>' +
    '<path d="M49 40.2 A20 20 0 0 1 65.4 54.5" fill="none" stroke="#FFC93C" stroke-width="9" stroke-linecap="butt"/>'
  );

  /* UI pictures */
  A.chainLink =
    '<svg viewBox="0 0 48 24" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="5" width="24" height="14" rx="7" fill="none" stroke="currentColor" stroke-width="4"/>' +
    '<rect x="21" y="5" width="24" height="14" rx="7" fill="none" stroke="currentColor" stroke-width="4"/>' +
    '</svg>';

  A.logo =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
    '<rect width="48" height="48" rx="13" fill="#1F2A44"/>' +
    '<path d="M18.5 10 H29.5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M21 11 V20 L13 33.5 Q11 38 16 38 H32 Q37 38 35 33.5 L27 20 V11" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M16.6 29 H31.4 L33.6 33 Q34.6 35.5 31.8 35.5 H16.2 Q13.4 35.5 14.4 33 Z" fill="#FFC93C"/>' +
    '<circle cx="21" cy="24.5" r="2.2" fill="#E4572E"/>' +
    '<circle cx="27" cy="22" r="1.7" fill="#5AA9FF"/>' +
    '</svg>';

  A.shield =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
    '<path d="M24 4 L40 10 V22 C40 33 33 40 24 44 C15 40 8 33 8 22 V10 Z" fill="#2BA84A" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M16 24 L22 30 L33 18" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  A.mic =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/>' +
    '<path d="M5 11 a7 7 0 0 0 14 0 M12 18 V21.5 M8.5 21.5 H15.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';

  PL.ART = A;

  PL.art = function (name) { return A[name] || ''; };
})();
