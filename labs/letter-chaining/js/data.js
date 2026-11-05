/* Primary Labs · Letter Chains — tiles, built-in chains, and the rules for words.

   A word is made of tiles, not letters. A tile is one sound: "b", "sh", "ai", "igh", or a silent-e
   tile like "a_e" (cake is c · a_e · k). Every word has 2 or 3 tiles: beginning, (middle,) end. */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  /* Tile groups, in the order teachers and kids see them. */
  PL.GROUPS = [
    { id: 'short', name: 'Short vowels' },
    { id: 'consonant', name: 'Consonants' },
    { id: 'digraph', name: 'Digraphs' },
    { id: 'team', name: 'Long vowels: vowel teams' },
    { id: 'silent', name: 'Long vowels: silent e' },
    { id: 'other', name: 'Other vowel sounds' },
    { id: 'r', name: 'R-controlled vowels' }
  ];

  /* Every tile. ipa: the exact sounds (for the voice tool and the rules below). sound: the name of its
     bundled clip in assets/audio/sounds/ (tiles that say the same sound share one). keyword: the picture
     word on Meet the Sounds. where: 'start' or 'end' when real words only use it there. */
  function T(id, group, ipa, sound, keyword, label, tip, where) {
    return { id: id, group: group, kind: /^(short|team|silent|other|r)$/.test(group) ? 'vowel' : 'consonant',
      ipa: ipa.split(' '), sound: sound, keyword: keyword, label: label, tip: tip, where: where || null };
  }
  PL.TILES = [
    T('a', 'short', 'æ', 'a', 'apple', 'short a', 'Say /ă/ as in apple. Open your mouth wide and keep it short.'),
    T('e', 'short', 'ɛ', 'e', 'egg', 'short e', 'Say /ĕ/ as in egg. Keep it short.'),
    T('i', 'short', 'ɪ', 'i', 'igloo', 'short i', 'Say /ĭ/ as in igloo. Smile a little and keep it short.'),
    T('o', 'short', 'ɑ', 'o', 'octopus', 'short o', 'Say /ŏ/ as in octopus, the "ah" of dot. Make a round "O" with your mouth.'),
    T('u', 'short', 'ʌ', 'u', 'umbrella', 'short u', 'Say /ŭ/ as in umbrella. Keep it short.'),

    T('b', 'consonant', 'b', 'b', 'bus', 'b', 'Say a quick /b/. Try not to add "uh" (not "buh").'),
    T('c', 'consonant', 'k', 'c', 'cup', 'c', 'Say the hard /k/ sound, as in cup. Keep it short and clipped.'),
    T('d', 'consonant', 'd', 'd', 'duck', 'd', 'Say a quick /d/. Try not to add "uh" (not "duh").'),
    T('f', 'consonant', 'f', 'f', 'fox', 'f', 'Blow /fff/ with your top teeth on your lip.'),
    T('g', 'consonant', 'ɡ', 'g', 'goat', 'g', 'Say the hard /g/ sound, as in goat. Keep it short and clipped.'),
    T('h', 'consonant', 'h', 'h', 'hat', 'h', 'Breathe out a quiet /h/, like fogging a window.', 'start'),
    T('j', 'consonant', 'dʒ', 'j', 'jar', 'j', 'Say a quick /j/. Try not to add "uh".', 'start'),
    T('k', 'consonant', 'k', 'c', 'kid', 'k', 'The same /k/ sound as c. Keep it short and clipped.'),
    T('l', 'consonant', 'l', 'l', 'log', 'l', 'Hold /lll/ with your tongue behind your top teeth.'),
    T('m', 'consonant', 'm', 'm', 'mop', 'm', 'Hum /mmm/ with your lips closed.'),
    T('n', 'consonant', 'n', 'n', 'nest', 'n', 'Hum /nnn/ through your nose for about one second.'),
    T('p', 'consonant', 'p', 'p', 'pig', 'p', 'Say a quick, quiet /p/. Try not to add "uh" (not "puh").'),
    T('qu', 'consonant', 'k w', 'qu', 'queen', 'qu', 'Say /kw/ as in queen. Q and u stay together.', 'start'),
    T('r', 'consonant', 'ɹ', 'r', 'rug', 'r', 'Hold /rrr/ like a growl. Try not to add "uh".'),
    T('s', 'consonant', 's', 's', 'sun', 's', 'Hiss /sss/ like a snake.'),
    T('t', 'consonant', 't', 't', 'top', 't', 'Say a quick, crisp /t/. Try not to add "uh" (not "tuh").'),
    T('v', 'consonant', 'v', 'v', 'van', 'v', 'Hum /vvv/ with your top teeth on your lip.'),
    T('w', 'consonant', 'w', 'w', 'wig', 'w', 'Round your lips and say a quick /w/.', 'start'),
    T('x', 'consonant', 'k s', 'x', 'box', 'x', 'Say /ks/ as in box. X goes at the end.', 'end'),
    T('y', 'consonant', 'j', 'y', 'yarn', 'y', 'Say a quick /y/ as in yarn.', 'start'),
    T('z', 'consonant', 'z', 'z', 'zebra', 'z', 'Buzz /zzz/ like a bee.'),

    T('sh', 'digraph', 'ʃ', 'sh', 'ship', 'sh', 'Say /sh/ as in ship, like "be quiet."'),
    T('ch', 'digraph', 'tʃ', 'ch', 'chick', 'ch', 'Say a quick /ch/ as in chick, like a sneeze.'),
    T('th', 'digraph', 'θ', 'th', 'thumb', 'th', 'Put your tongue between your teeth and blow /th/ as in thumb.'),
    T('wh', 'digraph', 'w', 'w', 'whale', 'wh', 'Says /w/ as in whale.', 'start'),
    T('ck', 'digraph', 'k', 'c', 'sock', 'ck', 'Says /k/ as in sock. Ck goes at the end, after a short vowel.', 'end'),
    T('ng', 'digraph', 'ŋ', 'ng', 'ring', 'ng', 'Hum /ng/ in the back of your nose, as in ring.', 'end'),
    T('nk', 'digraph', 'ŋ k', 'nk', 'skunk', 'nk', 'Say /ngk/ as in skunk.', 'end'),

    T('ai', 'team', 'eɪ', 'ai', 'rain', 'long a', 'Long a, as in rain. It says its name.'),
    T('ay', 'team', 'eɪ', 'ai', 'hay', 'long a', 'Long a, as in hay. Ay goes at the end.', 'end'),
    T('ee', 'team', 'i', 'ee', 'bee', 'long e', 'Long e, as in bee. It says its name.'),
    T('ea', 'team', 'i', 'ee', 'leaf', 'long e', 'Long e, as in leaf.'),
    T('oa', 'team', 'oʊ', 'oa', 'boat', 'long o', 'Long o, as in boat. It says its name.'),
    T('igh', 'team', 'aɪ', 'igh', 'light', 'long i', 'Long i, as in light. G and h are quiet.'),

    T('a_e', 'silent', 'eɪ', 'ai', 'cake', 'long a', 'Long a, as in cake. The e at the end is quiet and makes a say its name.'),
    T('i_e', 'silent', 'aɪ', 'igh', 'kite', 'long i', 'Long i, as in kite. The e at the end is quiet.'),
    T('o_e', 'silent', 'oʊ', 'oa', 'bone', 'long o', 'Long o, as in bone. The e at the end is quiet.'),
    T('u_e', 'silent', 'j u', 'u_e', 'cube', 'long u', 'Long u, as in cube. The e at the end is quiet.'),

    T('oo', 'other', 'u', 'oo', 'moon', 'oo', 'Say /oo/ as in moon.'),
    T('ow', 'other', 'aʊ', 'ow', 'cow', 'ow', 'Say /ow/ as in cow, like when you get hurt.'),
    T('ou', 'other', 'aʊ', 'ow', 'cloud', 'ou', 'Says /ow/ as in cloud, the same sound as ow.'),
    T('oi', 'other', 'ɔɪ', 'oi', 'oil', 'oi', 'Say /oy/ as in oil.'),
    T('oy', 'other', 'ɔɪ', 'oi', 'toy', 'oy', 'Says /oy/ as in toy, the same sound as oi. Oy goes at the end.', 'end'),

    T('ar', 'r', 'ɑ ɹ', 'ar', 'car', 'ar', 'Say /ar/ as in car.'),
    T('or', 'r', 'ɔ ɹ', 'or', 'corn', 'or', 'Say /or/ as in corn.'),
    T('er', 'r', 'ɝ', 'er', 'tiger', 'er', 'Say /er/ as in tiger.'),
    T('ir', 'r', 'ɝ', 'er', 'bird', 'ir', 'Says /er/ as in bird, the same sound as er.'),
    T('ur', 'r', 'ɝ', 'er', 'turtle', 'ur', 'Says /er/ as in turtle, the same sound as er.')
  ];

  var BY_ID = {};
  PL.TILES.forEach(function (t) { BY_ID[t.id] = t; });
  PL.TILE_IDS = PL.TILES.map(function (t) { return t.id; });
  PL.tile = function (id) { return BY_ID[id] || null; };

  /* Bundled letter-sound clips (assets/audio/sounds/<name>.js). */
  PL.SOUND_IDS = PL.TILES.map(function (t) { return t.sound; }).filter(function (s, i, a) { return a.indexOf(s) === i; });

  /* The lesson's first set, and the default until a teacher picks other tiles. */
  PL.START_SET = ['a', 'i', 'o', 't', 'd', 'c', 'g', 'n'];

  PL.ALL_VOWELS = ['a', 'e', 'i', 'o', 'u']; // tile colors for single letters not in PL.TILES
  PL.isVowel = function (id) {
    var t = BY_ID[id];
    return t ? t.kind === 'vowel' : PL.ALL_VOWELS.indexOf(id) !== -1;
  };

  /* Built-in words with a hand-drawn picture or a sentence. More words (no sentence) are in js/words.js. */
  PL.WORDS = {
    cat: { art: 'cat', sentence: 'The cat naps in the sun.' },
    cot: { art: 'cot', sentence: 'I can nap on a cot.' },
    dot: { art: 'dot', sentence: 'Draw a big red dot.' },
    dog: { art: 'dog', sentence: 'The dog wags its tail.' },
    dig: { art: 'dig', sentence: 'We dig in the sand.' },
    did: { sentence: 'I did it!' },
    dad: { art: 'dad', sentence: 'Dad gives me a hug.' },
    can: { art: 'can', sentence: 'The soup is in a can.' },
    tan: { art: 'tan', sentence: 'The sand is tan.' },
    tin: { art: 'tin', sentence: 'The cookies are in a tin.' },
    tot: { art: 'tot', sentence: 'A tot is a little kid.' },
    not: { sentence: 'The soup is not hot.' },
    nod: { art: 'nod', sentence: 'Nod your head to say yes.' },
    tag: { art: 'tag', sentence: 'The tag is on the gift.' },
    tad: { sentence: 'Add a tad of salt. (A tad means a little bit.)' },
    gig: { art: 'gig', sentence: 'The band plays a gig.' },
    cod: { art: 'cod', sentence: 'A cod is a fish.' },
    cog: { art: 'cog', sentence: 'A cog is a wheel with teeth.' },
    got: { sentence: 'I got a new hat.' },

    // Short vowels
    bag: { sentence: 'My lunch is in the bag.' },
    cap: { sentence: 'He has a red cap.' },
    fan: { art: 'fan', sentence: 'The fan keeps us cool.' },
    hat: { sentence: 'Put on your hat.' },
    jam: { sentence: 'I like jam on my toast.' },
    map: { sentence: 'The map shows the way.' },
    pan: { sentence: 'Mom cooks eggs in a pan.' },
    rat: { sentence: 'The rat runs fast.' },
    van: { sentence: 'We ride in the van.' },
    bed: { sentence: 'I go to bed at night.' },
    hen: { sentence: 'The hen sits on her eggs.' },
    jet: { sentence: 'The jet flies up high.' },
    leg: { sentence: 'I hop on one leg.' },
    net: { sentence: 'Catch the ball in the net.' },
    pen: { sentence: 'I write with a pen.' },
    web: { sentence: 'The spider made a web.' },
    big: { sentence: 'The whale is big.' },
    lid: { art: 'lid', sentence: 'Put the lid on the pot.' },
    pig: { sentence: 'The pig rolls in the mud.' },
    six: { sentence: 'I have six crayons.' },
    wig: { art: 'wig', sentence: 'The clown has a funny wig.' },
    zip: { sentence: 'Zip up your coat.' },
    box: { sentence: 'The toys are in the box.' },
    fox: { sentence: 'The fox has a red tail.' },
    hot: { sentence: 'The sun is hot.' },
    log: { art: 'log', sentence: 'The frog sits on a log.' },
    mop: { art: 'mop', sentence: 'Mop up the mess.' },
    pot: { sentence: 'The soup is in the pot.' },
    bug: { sentence: 'A bug is on the leaf.' },
    bus: { sentence: 'We ride the bus to school.' },
    cup: { art: 'cup', sentence: 'I drink milk from a cup.' },
    hug: { sentence: 'Give me a big hug.' },
    mud: { sentence: 'The pig rolls in the mud.' },
    nut: { sentence: 'The squirrel has a nut.' },
    rug: { art: 'rug', sentence: 'The cat naps on the rug.' },
    sun: { sentence: 'The sun is up.' },
    // Digraphs
    ship: { sentence: 'The ship sails on the sea.' },
    shop: { sentence: 'We shop for food.' },
    fish: { sentence: 'The fish swims fast.' },
    dish: { sentence: 'Put the dish in the sink.' },
    chick: { sentence: 'The chick is small and yellow.' },
    chip: { sentence: 'I ate a chip.' },
    bath: { sentence: 'I take a bath at night.' },
    path: { sentence: 'We walk on the path.' },
    duck: { art: 'duck', sentence: 'The duck swims in the pond.' },
    sock: { sentence: 'I have one red sock.' },
    rock: { sentence: 'I sit on a big rock.' },
    ring: { sentence: 'She has a gold ring.' },
    king: { sentence: 'The king has a crown.' },
    wing: { sentence: 'The bird has a wing.' },
    sing: { sentence: 'We sing a song.' },
    quack: { sentence: 'The duck says quack.' },
    // Long vowels
    rain: { sentence: 'The rain makes puddles.' },
    tail: { sentence: 'The dog wags its tail.' },
    hay: { sentence: 'The horse eats hay.' },
    cake: { sentence: 'We eat cake at the party.' },
    game: { sentence: 'Let us play a game.' },
    wave: { sentence: 'Wave to your friend.' },
    bee: { sentence: 'The bee buzzes by.' },
    feet: { sentence: 'I have two feet.' },
    sheep: { sentence: 'The sheep says baa.' },
    tea: { sentence: 'Grandma drinks hot tea.' },
    leaf: { sentence: 'A leaf fell from the tree.' },
    beach: { sentence: 'We dig in the sand at the beach.' },
    boat: { sentence: 'The boat floats on the lake.' },
    coat: { sentence: 'Put on your coat.' },
    soap: { sentence: 'Wash your hands with soap.' },
    light: { sentence: 'Turn on the light.' },
    night: { sentence: 'The moon comes out at night.' },
    kite: { sentence: 'The kite flies in the wind.' },
    bike: { sentence: 'I ride my bike.' },
    nine: { sentence: 'I am nine years old.' },
    bone: { sentence: 'The dog has a bone.' },
    rope: { sentence: 'We jump with a rope.' },
    home: { sentence: 'We go home after school.' },
    cube: { sentence: 'Put an ice cube in the cup.' },
    // Other vowels
    moon: { sentence: 'The moon is bright.' },
    zoo: { sentence: 'We see lions at the zoo.' },
    food: { sentence: 'The dog wants food.' },
    cow: { sentence: 'The cow says moo.' },
    owl: { sentence: 'The owl hoots at night.' },
    mouth: { sentence: 'Open your mouth wide.' },
    oil: { sentence: 'Mom cooks with oil.' },
    coin: { sentence: 'I put a coin in my bank.' },
    boy: { sentence: 'The boy runs to the park.' },
    toy: { sentence: 'The toy is in the box.' },
    // R-controlled
    car: { sentence: 'Dad drives the car.' },
    jar: { art: 'jar', sentence: 'The jam is in a jar.' },
    farm: { sentence: 'The cow lives on a farm.' },
    shark: { sentence: 'A shark swims in the sea.' },
    corn: { sentence: 'We eat corn for lunch.' },
    fork: { sentence: 'Eat with a fork.' },
    horn: { sentence: 'Toot the horn!' },
    bird: { sentence: 'The bird sings in the tree.' },
    girl: { sentence: 'The girl kicks the ball.' },
    shirt: { sentence: 'I have a blue shirt.' },
    fur: { sentence: 'The cat has soft fur.' },
    turn: { sentence: 'It is your turn.' }
  };

  /* Built-in chains for the start set. Each step changes exactly ONE sound: beginning, middle, or end. */
  PL.CHAINS = [
    { id: 'c1', name: 'Cat to Dad', words: ['cat', 'cot', 'dot', 'dog', 'dig', 'did', 'dad'] },
    { id: 'c2', name: 'Can to Nod', words: ['can', 'tan', 'tin', 'ton', 'tot', 'not', 'nod'] },
    { id: 'c3', name: 'Tag to Gig', words: ['tag', 'tad', 'dad', 'did', 'dig', 'gig'] },
    { id: 'c4', name: 'Short o Trail', words: ['dog', 'dot', 'cot', 'cod', 'nod', 'not', 'tot'] },
    { id: 'c5', name: 'Mix It Up', words: ['tin', 'tan', 'can', 'cat', 'cot', 'cog', 'dog'] }
  ];

  /* Words kids never see, from teachers or from tiles kids tap: by spelling, and by sound (kids hear
     each tile's sound when they blend, so "f · u · ck" and "f · u · k" are both stopped). */
  PL.BLOCKED = [
    'tit', 'git', 'cig', 'gin', 'nit', 'dic', 'nig', 'coc',
    'ass', 'azz', 'cum', 'kum', 'cok', 'dik', 'dix', 'fag', 'fap', 'fuc', 'fuk', 'fux', 'fu',
    'gyp', 'ho', 'jap', 'jiz', 'kkk', 'kys', 'pis', 'sex', 'sux', 'vag', 'wop', 'wtf', 'xxx',
    'fuck', 'shit', 'shat', 'shite', 'cock', 'dick', 'suck', 'cuck', 'chink', 'coon', 'gook', 'kike',
    'wank', 'whore', 'hore', 'rape', 'nude', 'lube', 'pube', 'boob', 'poop', 'poo', 'pee', 'dope',
    'weed', 'meth', 'coke', 'shag', 'bum', 'teat', 'cooch', 'nob', 'wang', 'dong', 'bong', 'tard',
    'turd', 'fart', 'chode', 'fook', 'porn', 'thot', 'hoe', 'hoar', 'nad', 'gat', 'cac', 'nog',
    'jizz', 'piss', 'damn', 'hell', 'crap', 'butt', 'god', 'gun', 'kill', 'dead', 'die', 'gay',
    'dike', 'wog', 'mick', 'yid', 'queer', 'nip', 'beer', 'wine', 'rum', 'vape', 'hate'
  ];
  PL.BLOCKED_SOUNDS = [
    'fʌk', 'ʃɪt', 'ʃæt', 'ʃaɪt', 'kɑk', 'dɪk', 'kʌm', 'tɪt', 'tit', 'fæɡ', 'nɪɡ', 'kun', 'ɡuk', 'kaɪk',
    'tʃɪŋk', 'dʒæp', 'wæŋk', 'hɔɹ', 'ɹeɪp', 'bub', 'pup', 'pu', 'sʌk', 'kʌk', 'ʃæɡ', 'bʌm', 'væɡ',
    'nɑb', 'wæŋ', 'dɑŋ', 'bɑŋ', 'tɑɹd', 'tɝd', 'fɑɹt', 'tʃoʊd', 'fuk', 'pɔɹn', 'θɑt', 'dʒɪz', 'pɪs',
    'mɛθ', 'koʊk', 'doʊp', 'wid', 'sɛks', 'hoʊ', 'nud', 'njud', 'lub', 'pjub', 'kutʃ', 'ɡɪt',
    'sɪɡ', 'dʒɪn', 'nɪt', 'fæp', 'kɑks', 'sʌks', 'dɪks', 'fʌks', 'næd', 'ɡæt', 'kæk',
    'nɑɡ', 'ɡɑd', 'ɡʌn', 'ɡeɪ', 'dʌŋ', 'pʌs', 'wɑp', 'daɪk', 'dʒɪp', 'nɪp', 'wɑɡ', 'mɪk', 'kwiɹ', 'jɪd',
    'biɹ', 'waɪn', 'ɹʌm', 'veɪp'
  ];

  PL.POSITIONS = [
    { key: 'beginning', light: 'go' },
    { key: 'middle', light: 'slow' },
    { key: 'end', light: 'stop' }
  ];

  /* Which of PL.POSITIONS each tile of a word sits in. Two-tile words have a beginning and an end. */
  PL.positionsFor = function (len) { return len === 2 ? [0, 2] : [0, 1, 2]; };
  PL.positionAt = function (i, len) { return PL.positionsFor(len)[i]; };

  /* ---------- spelling <-> tiles ---------- */

  /* Spells a list of tiles. A silent-e tile puts its e after the last tile: c · a_e · k is "cake". */
  PL.spell = function (tiles) {
    var out = '', tail = '';
    tiles.forEach(function (t) {
      if (/^[aeiou]_e$/.test(t)) { out += t[0]; tail = 'e'; } else out += t || '';
    });
    return out + tail;
  };

  /* The tile to show for an id (silent-e tiles show as "a_e"). */
  PL.tileText = function (id) { return id; };

  /* Splits a typed word into tiles: the word list first, then the longest tile at each point, with a
     final e after one consonant tile making a silent-e tile ("hope" is h · o_e · p). */
  var MULTI = PL.TILE_IDS.filter(function (id) { return id.length > 1 && id.indexOf('_') === -1; })
    .sort(function (a, b) { return b.length - a.length; });
  function greedy(word) {
    var out = [];
    for (var i = 0; i < word.length;) {
      var hit = null;
      for (var k = 0; k < MULTI.length; k++) {
        if (word.substr(i, MULTI[k].length) === MULTI[k]) { hit = MULTI[k]; break; }
      }
      out.push(hit || word[i]);
      i += hit ? hit.length : 1;
    }
    return out;
  }
  PL.split = function (word) {
    word = String(word || '').toLowerCase();
    if (PL.WORDBANK && PL.WORDBANK[word]) return PL.WORDBANK[word].tiles.slice();
    var m = /^(.*?)([aiou])([^aeiou]+)e$/.exec(word);
    if (m && m[2] + '_e' in BY_ID) {
      var tail = greedy(m[3]);
      if (tail.length === 1) return greedy(m[1]).concat([m[2] + '_e'], tail);
    }
    return greedy(word);
  };

  /* Plain letters, one tile each: how teacher chains were split before tiles had more than one letter. */
  PL.splitLetters = function (word) { return String(word || '').toLowerCase().split(''); };

  /* The sounds a list of tiles makes, as IPA. Letters with no tile give '?'. */
  PL.phones = function (tiles) {
    var out = [];
    tiles.forEach(function (id) { var t = BY_ID[id]; out = out.concat(t ? t.ipa : ['?']); });
    return out;
  };

  /* True if no other tile in the word shares a sound with tile i, so "Where do you hear it?" has one
     answer (not c in cake, whose k is /k/ too, or s in six, whose x is /ks/). */
  PL.soundOnce = function (tiles, i) {
    var mine = PL.phones([tiles[i]]);
    return tiles.every(function (t, j) {
      return j === i || !PL.phones([t]).some(function (p) { return mine.indexOf(p) !== -1; });
    });
  };

  function asTiles(x) { return Array.isArray(x) ? x : PL.split(x); }

  /* Returns the tile index that changed between two words (or tile lists) with the same number of
     tiles, or -1 if not exactly one changed. */
  PL.changedIndex = function (from, to) {
    if (!from || !to) return -1;
    var a = asTiles(from), b = asTiles(to);
    if (a.length !== b.length) return -1;
    var idx = -1;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        if (idx !== -1) return -1;
        idx = i;
      }
    }
    return idx;
  };

  /* True when tiles spell, or sound like, a word kids never see. */
  PL.isBlocked = function (tiles) {
    tiles = asTiles(tiles);
    if (PL.BLOCKED.indexOf(PL.spell(tiles)) !== -1) return true;
    var ph = PL.phones(tiles);
    return ph.indexOf('?') === -1 && PL.BLOCKED_SOUNDS.indexOf(ph.join('')) !== -1;
  };

  /* Validates a teacher-made chain. Returns { ok, words, error }.
     Words are 2 or 3 tiles (ship is sh · i · p), using any letters. Each step changes exactly one tile.
     Chains saved before tiles could hold more than one letter are read letter by letter, as before. */
  PL.validateChain = function (raw) {
    var words = String(raw || '')
      .toLowerCase()
      .split(/[\s,>→\-–—]+/)
      .filter(Boolean);
    if (words.length < 2) return { ok: false, error: 'Type at least two words, like: cat, cot, dot' };
    if (words.length > 12) return { ok: false, error: 'Keep chains to 12 words or fewer.' };
    var first = check(words, PL.split);
    if (first.ok) return first;
    var letters = check(words, PL.splitLetters);
    return letters.ok ? letters : first;
  };

  function check(words, split) {
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!/^[a-z]+$/.test(w)) return { ok: false, error: '"' + w + '" should use only the letters a to z.' };
      if (w.length > 6) return { ok: false, error: '"' + w + '" is too long. Use words with 2 or 3 sounds.' };
      var tiles = split(w);
      if (tiles.length < 2 || tiles.length > 3) {
        return { ok: false, error: '"' + w + '" needs 2 or 3 sounds, like "at", "cat", or "ship" (sh · i · p).' };
      }
      if (PL.isBlocked(tiles)) return { ok: false, error: '"' + w + '" is not a good fit for kids. Try another word.' };
      if (i > 0) {
        var before = split(words[i - 1]);
        if (before.length !== tiles.length) {
          return { ok: false, error: 'Keep every word in a chain the same number of sounds. "' + words[i - 1] + '" and "' + w + '" are not.' };
        }
        if (PL.changedIndex(before, tiles) === -1) {
          return { ok: false, error: '"' + words[i - 1] + '" → "' + w + '" should change exactly one sound.' };
        }
      }
    }
    return { ok: true, words: words, split: split === PL.splitLetters ? 'letters' : 'tiles' };
  }
})();
