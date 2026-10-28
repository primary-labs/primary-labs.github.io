/* Primary Labs · Letter Chains — a picture for every word.

   PL.picture(word) picks, in order:
     1. a hand-drawn picture (js/art.js)
     2. an emoji for common words
     3. a word card for real words with no clear picture ("is", "the", "got")
     4. a made-up creature for made-up words ("zog"). The same word always makes the same creature,
        so kids can meet "the zog" again.

   Emoji come from the device's emoji font, so they look a little different on each system.
   The list sticks to emoji from 2019 or earlier (Unicode 12), which older school computers have. */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var INK = '#1F2A44';

  /* word → emoji */
  var EMOJI = {
    // two letters
    go: '🟢', hi: '👋', he: '👦', me: '🙋', no: '🚫', oh: '😮', ok: '👌', ox: '🐂', up: '⬆️',
    us: '👪', we: '👫', ax: '🪓',
    // three letters
    add: '➕', aim: '🎯', air: '💨', ant: '🐜', ape: '🦍', arm: '💪', art: '🎨', axe: '🪓',
    bad: '👎', bag: '👜', bat: '🦇', bed: '🛏️', bee: '🐝', bin: '🗑️', bow: '🎀',
    box: '📦', boy: '👦', bud: '🌱', bug: '🐛', bus: '🚌', bye: '👋',
    cab: '🚕', cap: '🧢', car: '🚗', cob: '🌽', cop: '👮', cow: '🐄', cry: '😢', cub: '🐻',
    cue: '🎱', cut: '✂️',
    dew: '💧', doe: '🦌',
    ear: '👂', eat: '😋', egg: '🥚', elf: '🧝', elk: '🦌', end: '🔚', ewe: '🐑', eye: '👁️',
    fir: '🌲', fix: '🔧', fog: '🌫️', fox: '🦊', fry: '🍟', fun: '🎉',
    gas: '⛽', gem: '💎',
    ham: '🍖', hat: '🎩', hay: '🌾', hen: '🐔', hey: '👋', hog: '🐖', hop: '🐇', hot: '🔥',
    hug: '🤗', hum: '🎵',
    ice: '🧊', ill: '🤒', ink: '🖋️',
    jet: '✈️', job: '💼', jog: '🏃', joy: '😊',
    key: '🔑', kid: '🧒',
    lab: '🧪', leg: '🦵', lip: '👄',
    mad: '😠', man: '👨', map: '🗺️', mom: '👩', moo: '🐄', mug: '☕',
    nag: '🐴', nap: '😴', net: '🥅', new: '🆕', nut: '🥜',
    oak: '🌳', oat: '🌾', off: '📴', oil: '🛢️', old: '👴', one: '1️⃣', owl: '🦉',
    pan: '🍳', paw: '🐾', pay: '💵', pen: '🖊️', pet: '🐕', pie: '🥧', pig: '🐷',
    pin: '📌', pot: '🍲', pug: '🐶', pup: '🐶',
    ram: '🐏', rat: '🐀', raw: '🥩', red: '🔴', rod: '🎣', row: '🚣', run: '🏃',
    sad: '😢', sea: '🌊', see: '👀', sew: '🧵', she: '👧', sip: '🥤', six: '6️⃣', ski: '🎿',
    sky: '🌤️', sob: '😭', spy: '🕵️', sub: '🥪', sum: '➕', sun: '☀️',
    tap: '🚰', tea: '🍵', ten: '🔟', tie: '👔', toy: '🧸', tub: '🛁', two: '2️⃣',
    van: '🚐',
    wax: '🕯️', web: '🕸️', wed: '💒', wet: '💦', win: '🏆', won: '🏆', wow: '😮',
    yam: '🍠', yes: '✅', yum: '😋',
    zap: '⚡', zip: '🤐', zoo: '🦒'
  };

  /* Hand-drawn pictures that stand for a word (names in js/art.js). */
  var HAND = ['cat', 'cot', 'dot', 'dog', 'dig', 'dad', 'can', 'tan', 'tin', 'tot', 'nod', 'tag',
    'gig', 'cod', 'cog', 'top', 'cup', 'log', 'mop', 'rug', 'fan', 'wig', 'jar', 'lid'];

  /* Real words with no clear picture. They show as a word card, not a creature. */
  var REAL = (
    'ad am an as at be by do if in is it ma my of on or pa so to yo ' +
    'ace act ado age ago aid ail all and any apt arc are ark ash ask ate awe awl ' +
    'ban bar bay beg bet bib bid big bit bob bog boo bop bun but buy ' +
    'cad cam con coy cud dab dam day den did die dim din dip don dry dub dud due dug dun duo dye ' +
    'ebb eel ego elm emu era eve fad far fat fax fed fee few fib fig fin fit flu fly fob foe for fur ' +
    'gab gag gal gap gel get gnu gob god got gum gun gut guy gym ' +
    'had hag has hem her hew hid him hip his hit hob how hub hue hut icy imp inn ion its ivy ' +
    'jab jag jam jaw jay jig jot jug jut keg ken kin kit lad lag lap law lax lay led let lie lit lob ' +
    'lot low lug mat maw may men met mid mix mob mow mud mum nab nil nor not now nun ' +
    'oar odd oft opt orb ore our out owe own pad pal pap par pat pea peg pep per pew pit ply pod pop ' +
    'pow pro pry pub pun put rag ran rap ray rib rid rig rim rip rob roe rot rub rum rut rye ' +
    'sag sap sat saw say set shy sin sir sis sit sly sod son sow soy spa sty sue sup ' +
    'tab tad tar tax ted tee the thy tic tip toe tog too tow try tug urn use vat vet vex via vie vow ' +
    'wad wag war was way wee who why wit woe wok woo yak yap yaw yay yea yen yet yew you zen zit'
  ).split(' ');

  /* ---------- drawing ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function emojiSvg(e) {
    return '<svg class="pic-emoji" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      '<text x="60" y="64" text-anchor="middle" dominant-baseline="central" font-size="88">' + esc(e) + '</text></svg>';
  }

  /* A speech bubble with the word in it, for real words with no clear picture. */
  function wordSvg(w) {
    var size = w.length <= 2 ? 50 : 42;
    return '<svg class="pic-word" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M26 22 H94 Q108 22 108 36 V74 Q108 88 94 88 H54 L36 104 L38 88 H26 Q12 88 12 74 V36 Q12 22 26 22 Z" fill="#FFFFFF"/>' +
      '</g>' +
      '<text x="60" y="56" text-anchor="middle" dominant-baseline="central" font-size="' + size + '" font-weight="700" fill="' + INK + '">' + esc(w) + '</text></svg>';
  }

  /* ---------- made-up word creatures ----------
     Every part is picked by a random number seeded from the word, so "zog" always looks the same. */

  function seeded(word) {
    var h = 2166136261;
    for (var i = 0; i < word.length; i++) { h ^= word.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h = (h + 0x6D2B79F5) | 0;
      var t = Math.imul(h ^ (h >>> 15), 1 | h);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var BODY_COLORS = [
    ['#9B5DE5', '#C9A7F2'], ['#2BA84A', '#8FD9A0'], ['#5AA9FF', '#B4D8FF'], ['#F59E42', '#FBCB96'],
    ['#F7A1B5', '#FBD0DA'], ['#FFC93C', '#FFE59A'], ['#2EC4B6', '#97E3DB'], ['#E4572E', '#F2A994']
  ];

  /* Body shapes. top: y of the top edge at the middle. side: x of the left edge near the eyes. */
  var BODIES = [
    { top: 34, side: 26, eyeY: 62, mouthY: 82, feet: 98, draw: function (c) { return '<circle cx="60" cy="68" r="34" fill="' + c + '"/>'; } },
    { top: 26, side: 32, eyeY: 56, mouthY: 80, feet: 100, draw: function (c) { return '<ellipse cx="60" cy="66" rx="28" ry="40" fill="' + c + '"/>'; } },
    { top: 28, side: 28, eyeY: 58, mouthY: 78, feet: 0, draw: function (c) {
      return '<path d="M28 102 V60 A32 32 0 0 1 92 60 V102 Q84 94 76 102 Q68 94 60 102 Q52 94 44 102 Q36 94 28 102 Z" fill="' + c + '"/>';
    } },
    { top: 40, side: 20, eyeY: 64, mouthY: 84, feet: 98, draw: function (c) { return '<rect x="20" y="40" width="80" height="60" rx="28" fill="' + c + '"/>'; } }
  ];

  function creatureSvg(word) {
    var r = seeded(word);
    function pick(a) { return a[Math.floor(r() * a.length)]; }
    var color = pick(BODY_COLORS);
    var body = pick(BODIES);
    var top = Math.floor(r() * 4);
    var eyes = 1 + Math.floor(r() * 3);
    var mouth = Math.floor(r() * 4);
    var spots = r() < 0.5;
    var arms = r() < 0.6;
    var out = '';
    var t = body.top;

    // On top: antennae, horns, a curl, or round ears
    if (top === 0) {
      out += '<path d="M50 ' + (t + 4) + ' L42 ' + (t - 18) + ' M70 ' + (t + 4) + ' L78 ' + (t - 18) + '" fill="none"/>' +
        '<circle cx="42" cy="' + (t - 20) + '" r="6" fill="' + color[1] + '"/><circle cx="78" cy="' + (t - 20) + '" r="6" fill="' + color[1] + '"/>';
    } else if (top === 1) {
      out += '<path d="M42 ' + (t + 10) + ' L40 ' + (t - 14) + ' L54 ' + (t + 4) + ' Z" fill="#FFF4DC"/>' +
        '<path d="M78 ' + (t + 10) + ' L80 ' + (t - 14) + ' L66 ' + (t + 4) + ' Z" fill="#FFF4DC"/>';
    } else if (top === 2) {
      out += '<path d="M60 ' + (t + 4) + ' Q56 ' + (t - 14) + ' 66 ' + (t - 16) + ' Q74 ' + (t - 14) + ' 70 ' + (t - 6) + '" fill="none" stroke-width="4"/>';
    } else {
      out += '<circle cx="' + (body.side + 12) + '" cy="' + (t + 6) + '" r="11" fill="' + color[0] + '"/>' +
        '<circle cx="' + (120 - body.side - 12) + '" cy="' + (t + 6) + '" r="11" fill="' + color[0] + '"/>' +
        '<circle cx="' + (body.side + 12) + '" cy="' + (t + 6) + '" r="5" fill="' + color[1] + '" stroke="none"/>' +
        '<circle cx="' + (120 - body.side - 12) + '" cy="' + (t + 6) + '" r="5" fill="' + color[1] + '" stroke="none"/>';
    }

    if (arms) {
      out += '<path d="M' + (body.side + 4) + ' ' + (body.eyeY + 16) + ' Q' + (body.side - 12) + ' ' + (body.eyeY + 10) + ' ' + (body.side - 14) + ' ' + (body.eyeY - 4) + '" fill="none" stroke-width="5"/>' +
        '<path d="M' + (116 - body.side) + ' ' + (body.eyeY + 16) + ' Q' + (132 - body.side) + ' ' + (body.eyeY + 10) + ' ' + (134 - body.side) + ' ' + (body.eyeY - 4) + '" fill="none" stroke-width="5"/>';
    }
    if (body.feet) {
      out += '<ellipse cx="46" cy="' + body.feet + '" rx="10" ry="6" fill="' + color[0] + '"/>' +
        '<ellipse cx="74" cy="' + body.feet + '" rx="10" ry="6" fill="' + color[0] + '"/>';
    }

    out += body.draw(color[0]);

    if (spots) {
      out += '<circle cx="' + (body.side + 14) + '" cy="' + (body.mouthY + 4) + '" r="5" fill="' + color[1] + '" stroke="none"/>' +
        '<circle cx="' + (106 - body.side) + '" cy="' + (body.mouthY - 2) + '" r="4" fill="' + color[1] + '" stroke="none"/>' +
        '<circle cx="' + (100 - body.side) + '" cy="' + (body.mouthY + 8) + '" r="3" fill="' + color[1] + '" stroke="none"/>';
    }

    // Eyes
    var ey = body.eyeY;
    var xs = eyes === 1 ? [60] : eyes === 2 ? [48, 72] : [44, 60, 76];
    var er = eyes === 1 ? 13 : eyes === 2 ? 10 : 8;
    xs.forEach(function (x, i) {
      var y = eyes === 3 && i === 1 ? ey - 6 : ey;
      out += '<circle cx="' + x + '" cy="' + y + '" r="' + er + '" fill="#FFFFFF" stroke-width="2.5"/>' +
        '<circle cx="' + (x + 1) + '" cy="' + (y + 1) + '" r="' + Math.round(er * 0.45) + '" fill="' + INK + '" stroke="none"/>';
    });

    // Mouth
    var my = body.mouthY;
    if (mouth === 0) {
      out += '<path d="M50 ' + my + ' Q60 ' + (my + 10) + ' 70 ' + my + '" fill="none"/>';
    } else if (mouth === 1) {
      out += '<ellipse cx="60" cy="' + (my + 2) + '" rx="6" ry="7" fill="' + INK + '"/>';
    } else if (mouth === 2) {
      out += '<path d="M46 ' + my + ' Q60 ' + (my + 14) + ' 74 ' + my + ' Z" fill="' + INK + '"/>' +
        '<path d="M52 ' + (my + 1) + ' L55 ' + (my + 6) + ' L58 ' + (my + 2) + ' Z M62 ' + (my + 2) + ' L65 ' + (my + 6) + ' L68 ' + (my + 1) + ' Z" fill="#FFFFFF" stroke="none"/>';
    } else {
      out += '<path d="M50 ' + my + ' Q60 ' + (my + 10) + ' 70 ' + my + '" fill="none"/>' +
        '<path d="M56 ' + (my + 4) + ' Q56 ' + (my + 12) + ' 61 ' + (my + 12) + ' Q66 ' + (my + 12) + ' 65 ' + (my + 4) + '" fill="#F7A1B5" stroke-width="2.5"/>';
    }

    return '<svg class="pic-creature" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' + out + '</g></svg>';
  }

  /* ---------- picking a picture ---------- */

  function handArt(w) { return HAND.indexOf(w) !== -1 && PL.ART && PL.ART[w] ? PL.ART[w] : ''; }

  /* Real words show a picture or a word card. Anything else is a made-up word and gets a creature. */
  PL.isRealWord = function (w) {
    return !!(EMOJI[w] || handArt(w) || REAL.indexOf(w) !== -1 || (PL.WORDS && PL.WORDS[w]));
  };

  /* Returns { kind: 'art' | 'emoji' | 'word' | 'creature', svg }. */
  PL.pictureInfo = function (w) {
    w = String(w || '').toLowerCase();
    var art = handArt(w);
    if (art) return { kind: 'art', svg: art };
    if (EMOJI[w]) return { kind: 'emoji', svg: emojiSvg(EMOJI[w]) };
    if (PL.isRealWord(w)) return { kind: 'word', svg: wordSvg(w) };
    return { kind: 'creature', svg: creatureSvg(w) };
  };

  PL.picture = function (w) { return PL.pictureInfo(w).svg; };
})();
