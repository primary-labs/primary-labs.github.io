/* Primary Labs · Letter Chains — builds chains from the tiles a teacher picks.

   PL.buildChains(tiles, { madeUp, seed, count }) returns up to `count` chains (default 5), each
   4 to 7 words from js/words.js that use only those tiles. Every step changes one tile and its
   sound (meet → meat is not a step). The same tiles and seed always give the same chains, so a class
   sees the same chains until the teacher asks for new ones. */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var MAX_LEN = 7, MIN_LEN = 4, TRIES = 40;

  function rng(seed) {
    var h = (seed >>> 0) || 1;
    return function () {
      h = (h + 0x6D2B79F5) | 0;
      var t = Math.imul(h ^ (h >>> 15), 1 | h);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

  /* The words these tiles can make: { real: [...], madeUp: [...] }. */
  PL.wordsFor = function (tiles, madeUp) {
    var set = {};
    tiles.forEach(function (t) { set[t] = true; });
    var out = { real: [], madeUp: [] };
    PL.bankWords().forEach(function (w) {
      var e = PL.WORDBANK[w];
      if (PL.isBlocked(e.tiles)) return;
      if (!e.tiles.every(function (t) { return set[t]; })) return;
      if (e.real) out.real.push(w);
      else if (madeUp) out.madeUp.push(w);
    });
    return out;
  };

  PL.buildChains = function (tiles, opts) {
    opts = opts || {};
    var count = opts.count || 5;
    var pool = PL.wordsFor(tiles, !!opts.madeUp);
    var words = pool.real.concat(pool.madeUp).sort();
    var info = {};
    words.forEach(function (w) {
      var e = PL.WORDBANK[w];
      info[w] = { tiles: e.tiles, sound: PL.phones(e.tiles).join(' '), real: e.real, picture: PL.pictureInfo ? PL.pictureInfo(w).kind : 'word', next: [] };
    });
    // Links: same number of tiles, one tile different, and a different sound. Words that differ only
    // at one place share a key with that place left out ("c.*.t"), so only those are compared.
    var index = {}, groups = {};
    words.forEach(function (w, i) {
      index[w] = i;
      var t = info[w].tiles;
      for (var p = 0; p < t.length; p++) {
        var key = p + ':' + t.slice(0, p).join('.') + '.*.' + t.slice(p + 1).join('.');
        (groups[key] = groups[key] || []).push(w);
      }
    });
    Object.keys(groups).forEach(function (key) {
      var g = groups[key], at = Number(key.split(':')[0]);
      for (var i = 0; i < g.length; i++) {
        for (var j = i + 1; j < g.length; j++) {
          if (info[g[i]].sound === info[g[j]].sound) continue;
          info[g[i]].next.push({ w: g[j], at: at });
          info[g[j]].next.push({ w: g[i], at: at });
        }
      }
    });
    words.forEach(function (w) { info[w].next.sort(function (x, y) { return index[x.w] - index[y.w]; }); });

    var r = rng(opts.seed || 1);
    var usedWords = {}, usedTiles = {}, chains = [];
    // Tiles past the basics (digraphs, long vowels...): chains lean on these, since a teacher who
    // turns them on is teaching them.
    var focus = {};
    tiles.forEach(function (t) { var x = PL.tile(t); if (x && x.group !== 'short' && x.group !== 'consonant') focus[t] = true; });

    function wordScore(w) {
      var x = info[w];
      var s = x.real ? 3 : 2.75;
      if (x.tiles.some(function (t) { return focus[t]; })) s += 2.5;
      if (x.picture === 'art' || x.picture === 'emoji') s += 1.5;
      if (usedWords[w]) s -= 3;
      x.tiles.forEach(function (t) { if (!usedTiles[t]) s += 1; });
      return s;
    }

    function walk(start) {
      var chain = [start], at = [], seen = {};
      seen[start] = true;
      var made = info[start].real ? 0 : 1;
      while (chain.length < MAX_LEN) {
        var cur = chain[chain.length - 1];
        var best = null, bestScore = -Infinity;
        info[cur].next.forEach(function (n) {
          if (seen[n.w]) return;
          if (!info[n.w].real && (made + 1) * 3 > MAX_LEN) return; // at most 2 made-up words
          var s = wordScore(n.w) + r() * 2.5;
          var k = at.length;
          if (k && at[k - 1] === n.at) s -= 2;              // change a different position each time
          if (k > 1 && at[k - 1] === n.at && at[k - 2] === n.at) s -= 4;
          if (!info[n.w].next.some(function (m) { return !seen[m.w] && m.w !== cur; })) s -= 1.5; // dead end
          if (s > bestScore) { best = n; bestScore = s; }
        });
        if (!best) break;
        chain.push(best.w);
        at.push(best.at);
        seen[best.w] = true;
        if (!info[best.w].real) made++;
      }
      // End on a real word (a chain that gets too short is dropped below)
      while (chain.length > 1 && !info[chain[chain.length - 1]].real) { chain.pop(); at.pop(); }
      var score = chain.length * 2;
      chain.forEach(function (w) { score += wordScore(w) / 2; });
      [0, 1, 2].forEach(function (p) { if (at.indexOf(p) !== -1) score += 2; });
      return { words: chain, score: score };
    }

    var starts = words.filter(function (w) { return info[w].real && info[w].next.length; });
    var picked = {}; // chains already picked, both ways round
    for (var c = 0; c < count && starts.length; c++) {
      var best = null;
      for (var k = 0; k < TRIES; k++) {
        var s = starts[Math.floor(r() * starts.length)];
        var got = walk(s);
        if (got.words.length < MIN_LEN || picked[got.words.join(' ')]) continue;
        if (usedWords[got.words[0]]) got.score -= 4;
        if (!best || got.score > best.score) best = got;
      }
      if (!best) break;
      picked[best.words.join(' ')] = picked[best.words.slice().reverse().join(' ')] = true;
      best.words.forEach(function (w) {
        usedWords[w] = true;
        info[w].tiles.forEach(function (t) { usedTiles[t] = true; });
      });
      chains.push({
        id: 'g' + (c + 1),
        name: cap(best.words[0]) + ' to ' + cap(best.words[best.words.length - 1]),
        words: best.words,
        built: true
      });
    }
    return chains;
  };
})();
