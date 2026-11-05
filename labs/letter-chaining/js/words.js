/* Primary Labs · Letter Chains — every word a chain can use, written as tiles ("sh.i.p", "c.a_e.k").

   Each word has a bundled clip in assets/audio/words/, made from its tiles' exact sounds, so every
   tile says the same sound in every word. Words where a tile says something else are left out:
   "was", "put", "his" (s says /z/), "book" (oo as in moon only), "head" (ea as in leaf only),
   "page" and "face" (c and g are always hard), "with" and "this" (th as in thumb only).

   Real words were picked by hand. Made-up words follow short-vowel patterns only, are not in the
   dictionary, and don't sound like a real word or anything rude; tools/made-up-words.js lists the
   candidates. Edit either list, then remake the clips (see ../../tools/voice/README.md). */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var REAL = [
    // short a
    'a.t a.m a.n a.x b.a.d b.a.g b.a.t c.a.b c.a.n c.a.p c.a.t d.a.d f.a.n f.a.t f.a.x g.a.p g.a.s h.a.d h.a.m h.a.t',
    'j.a.b j.a.m l.a.b l.a.d l.a.p m.a.d m.a.n m.a.p m.a.t n.a.g n.a.p p.a.d p.a.l p.a.n p.a.t r.a.g r.a.m r.a.n r.a.p',
    'r.a.t s.a.d s.a.g s.a.p s.a.t t.a.b t.a.d t.a.g t.a.n t.a.p t.a.x v.a.n v.a.t w.a.g w.a.x y.a.k y.a.m y.a.p z.a.p',
    'b.a.ck p.a.ck r.a.ck s.a.ck t.a.ck j.a.ck l.a.ck qu.a.ck sh.a.ck wh.a.ck c.a.sh d.a.sh m.a.sh r.a.sh',
    'b.a.th p.a.th m.a.th ch.a.t ch.a.p b.a.ng f.a.ng h.a.ng r.a.ng s.a.ng b.a.nk t.a.nk s.a.nk r.a.nk y.a.nk th.a.nk',
    // short e
    'b.e.d b.e.g b.e.t d.e.n f.e.d g.e.t h.e.n j.e.t k.e.g l.e.d l.e.g l.e.t m.e.n m.e.t n.e.t p.e.g p.e.n p.e.p p.e.t',
    'r.e.d s.e.t t.e.n v.e.t w.e.b w.e.d w.e.t y.e.s y.e.t d.e.ck n.e.ck p.e.ck ch.e.ck sh.e.d m.e.sh wh.e.n v.e.x',
    // short i
    'i.f i.n i.t b.i.b b.i.d b.i.g b.i.n b.i.t d.i.d d.i.g d.i.m d.i.p f.i.g f.i.n f.i.t f.i.x g.i.g h.i.d h.i.m h.i.p',
    'h.i.t j.i.g k.i.d k.i.n k.i.t l.i.d l.i.p l.i.t m.i.x p.i.g p.i.n p.i.t r.i.b r.i.d r.i.g r.i.m r.i.p s.i.p s.i.t',
    's.i.x t.i.n t.i.p w.i.g w.i.n w.i.t z.i.p k.i.ck l.i.ck p.i.ck s.i.ck t.i.ck w.i.ck ch.i.ck qu.i.ck th.i.ck',
    'f.i.sh d.i.sh w.i.sh sh.i.p sh.i.n ch.i.p ch.i.n r.i.ch wh.i.ch wh.i.p wh.i.z wh.i.m th.i.n qu.i.t qu.i.z',
    'k.i.ng r.i.ng s.i.ng w.i.ng th.i.ng s.i.nk p.i.nk w.i.nk l.i.nk m.i.nk r.i.nk th.i.nk',
    // short o (the "ah" of dot)
    'o.n o.x b.o.x c.o.b c.o.d c.o.g c.o.p c.o.t d.o.g d.o.t f.o.g f.o.x g.o.t h.o.g h.o.p h.o.t j.o.b j.o.g j.o.t',
    'l.o.g l.o.t m.o.b m.o.m m.o.p n.o.d n.o.t p.o.d p.o.p p.o.t r.o.b r.o.d r.o.t s.o.b t.o.p t.o.t',
    'd.o.ck l.o.ck r.o.ck s.o.ck sh.o.ck ch.o.p sh.o.p sh.o.t m.o.th l.o.ng s.o.ng g.o.ng h.o.nk',
    // short u
    'u.p u.s b.u.d b.u.g b.u.n b.u.s b.u.t c.u.b c.u.p c.u.t d.u.g f.u.n g.u.m h.u.g h.u.m h.u.t j.u.g m.u.d m.u.g',
    'n.u.t p.u.p r.u.b r.u.g r.u.n s.u.b s.u.m s.u.n t.u.b t.u.g y.u.m d.u.ck l.u.ck p.u.ck t.u.ck y.u.ck',
    's.u.ch m.u.ch h.u.sh r.u.sh m.u.sh l.u.sh sh.u.t ch.u.g ch.u.m th.u.d h.u.ng l.u.ng r.u.ng s.u.ng',
    'b.u.nk j.u.nk s.u.nk d.u.nk ch.u.nk',
    // vowel teams
    'r.ai.n m.ai.n p.ai.n g.ai.n v.ai.n w.ai.t b.ai.t m.ai.l n.ai.l p.ai.l r.ai.l s.ai.l t.ai.l h.ai.l j.ai.l f.ai.l',
    'w.ai.l p.ai.d r.ai.d m.ai.d l.ai.d ai.m ai.d ch.ai.n f.ai.th',
    'd.ay b.ay h.ay j.ay l.ay m.ay p.ay r.ay s.ay w.ay',
    'b.ee s.ee f.ee t.ee b.ee.f r.ee.f f.ee.t m.ee.t b.ee.t s.ee.k w.ee.k p.ee.k d.ee.p k.ee.p p.ee.p s.ee.p w.ee.p',
    'b.ee.p j.ee.p f.ee.l h.ee.l p.ee.l r.ee.l s.ee.n t.ee.n k.ee.n qu.ee.n wh.ee.l sh.ee.p sh.ee.t ch.ee.k t.ee.th',
    's.ee.d f.ee.d n.ee.d d.ee.d r.ee.d h.ee.d ee.l',
    's.ea t.ea p.ea ea.t m.ea.t s.ea.t b.ea.t h.ea.t n.ea.t b.ea.d b.ea.n m.ea.n l.ea.n t.ea.m b.ea.m s.ea.m l.ea.f',
    'b.ea.k l.ea.k p.ea.k w.ea.k h.ea.l m.ea.l s.ea.l d.ea.l ea.ch b.ea.ch p.ea.ch r.ea.ch t.ea.ch l.ea.sh h.ea.p',
    'l.ea.p ch.ea.p wh.ea.t',
    'oa.k oa.t b.oa.t c.oa.t g.oa.t m.oa.t r.oa.d l.oa.d t.oa.d s.oa.p f.oa.m l.oa.f g.oa.l c.oa.l f.oa.l l.oa.n',
    'm.oa.n r.oa.m c.oa.ch p.oa.ch oa.th',
    'h.igh s.igh th.igh l.igh.t n.igh.t s.igh.t m.igh.t r.igh.t f.igh.t t.igh.t',
    // silent e
    'c.a_e.k b.a_e.k l.a_e.k m.a_e.k r.a_e.k t.a_e.k w.a_e.k sh.a_e.k qu.a_e.k g.a_e.m n.a_e.m s.a_e.m t.a_e.m',
    'c.a_e.m f.a_e.m g.a_e.t l.a_e.t d.a_e.t m.a_e.t c.a_e.v g.a_e.v s.a_e.v w.a_e.v c.a_e.p t.a_e.p c.a_e.n',
    'l.a_e.n m.a_e.n p.a_e.n v.a_e.n s.a_e.l m.a_e.l p.a_e.l t.a_e.l b.a_e.l g.a_e.l m.a_e.d f.a_e.d w.a_e.d',
    'sh.a_e.d s.a_e.f b.a_e.s c.a_e.s v.a_e.s a_e.t a_e.p wh.a_e.l',
    'b.i_e.k h.i_e.k l.i_e.k k.i_e.t b.i_e.t s.i_e.t t.i_e.m d.i_e.m l.i_e.m m.i_e.n f.i_e.n l.i_e.n n.i_e.n',
    'p.i_e.n v.i_e.n d.i_e.n r.i_e.d h.i_e.d s.i_e.d w.i_e.d t.i_e.d f.i_e.v d.i_e.v h.i_e.v w.i_e.p p.i_e.p',
    'r.i_e.p l.i_e.f w.i_e.f f.i_e.l m.i_e.l p.i_e.l t.i_e.l wh.i_e.l wh.i_e.t sh.i_e.n ch.i_e.m',
    'b.o_e.n c.o_e.n h.o_e.m h.o_e.p r.o_e.p n.o_e.t v.o_e.t j.o_e.k p.o_e.k w.o_e.k m.o_e.l h.o_e.l p.o_e.l',
    'r.o_e.l s.o_e.l t.o_e.n z.o_e.n l.o_e.n c.o_e.d m.o_e.d r.o_e.d d.o_e.m r.o_e.b l.o_e.b c.o_e.v m.o_e.p',
    'c.u_e.b c.u_e.t m.u_e.l m.u_e.t f.u_e.m',
    // other vowel sounds
    'm.oo z.oo t.oo b.oo g.oo m.oo.n n.oo.n s.oo.n f.oo.d m.oo.d b.oo.m r.oo.m z.oo.m l.oo.m t.oo.l p.oo.l c.oo.l',
    'h.oo.t b.oo.t r.oo.t t.oo.t l.oo.t l.oo.p h.oo.p c.oo.p g.oo.f r.oo.f b.oo.th t.oo.th',
    'c.ow h.ow n.ow w.ow v.ow ow.l h.ow.l d.ow.n g.ow.n t.ow.n f.ow.l',
    'ou.t ou.ch l.ou.d p.ou.t b.ou.t sh.ou.t c.ou.ch p.ou.ch v.ou.ch m.ou.th s.ou.th n.ou.n f.ou.l',
    'oi.l b.oi.l c.oi.l f.oi.l s.oi.l t.oi.l j.oi.n c.oi.n',
    'b.oy t.oy j.oy s.oy c.oy',
    // r-controlled
    'c.ar f.ar j.ar t.ar b.ar ar.t ar.m ar.k ar.ch b.ar.k d.ar.k p.ar.k m.ar.k sh.ar.k l.ar.k c.ar.d h.ar.d y.ar.d',
    'c.ar.t d.ar.t p.ar.t t.ar.t h.ar.m f.ar.m ch.ar.m b.ar.n y.ar.n m.ar.ch m.ar.sh h.ar.sh',
    'f.or f.or.k c.or.k p.or.k t.or.n b.or.n c.or.n h.or.n w.or.n f.or.m s.or.t p.or.t f.or.t sh.or.t c.or.d',
    'n.or.th p.or.ch t.or.ch',
    'h.er f.er.n h.er.d t.er.m p.er.k v.er.b',
    's.ir f.ir b.ir.d g.ir.l f.ir.m d.ir.t sh.ir.t th.ir.d b.ir.th ch.ir.p wh.ir.l',
    'f.ur b.ur.n t.ur.n h.ur.t c.ur.l h.ur.l s.ur.f t.ur.f c.ur.b c.ur.d b.ur.p'
  ];

  /* Sounds of real words the pronouncing dictionary says another way, so a made-up word can't sound
     like them: catch is also /kætʃ/ ("cach"). */
  PL.SOUNDS_LIKE_REAL = ['kætʃ'];

  // Made-up words (short vowels only). "ton" is said "tahn", with the short o of tot.
  var MADE_UP = [
    't.o.n b.a.z b.e.b b.e.f b.e.m b.e.nk b.e.p b.e.sh b.i.p b.i.x b.u.p c.e.b c.e.d c.e.m c.e.ng c.e.nk',
    'c.e.t c.e.x c.e.z c.i.f c.i.m c.i.x c.u.g ch.a.g ch.a.s ch.a.sh ch.a.z ch.e.p ch.i.m ch.o.m ch.o.nk ch.o.th',
    'ch.o.x ch.u.p ch.u.z d.e.ng d.i.z d.o.sh d.o.z d.u.s d.u.t f.a.nk f.a.s f.e.ng f.e.sh f.i.f f.i.m f.i.ng',
    'f.i.th f.o.ng f.o.nk f.o.th f.u.ng f.u.p f.u.sh g.a.ch g.a.x g.e.b g.e.ch g.e.f g.e.g g.e.x g.i.ch g.i.x g.o.f',
    'g.o.m g.o.x g.u.ng g.u.th h.a.b h.e.g h.e.ng h.e.z h.i.g h.i.nk h.i.th h.o.ch h.o.f h.o.sh h.u.th j.a.s j.e.ch',
    'j.e.p j.i.ck j.i.d j.i.sh j.i.t j.i.th j.o.nk j.u.m j.u.ng j.u.p j.u.th l.a.ng l.e.b l.e.f l.e.p l.e.sh l.e.th',
    'l.i.g l.o.m l.o.th l.u.ch l.u.d l.u.n l.u.p l.u.s m.e.b m.e.nk m.e.p m.i.p m.o.f m.u.b n.a.nk n.a.th n.e.n',
    'n.e.nk n.i.n n.i.z n.o.nk n.o.s n.u.ng n.u.s n.u.sh n.u.z p.a.b p.a.f p.a.g p.e.b p.e.m p.e.sh p.i.b p.i.d',
    'p.o.ch p.o.f p.u.m qu.e.ch qu.e.m qu.e.ng qu.e.x qu.o.ck qu.o.m qu.o.n qu.o.s qu.u.b qu.u.ch qu.u.m qu.u.n',
    'qu.u.s qu.u.z r.e.ng r.i.n r.i.sh r.i.th r.o.ch r.o.nk r.o.p r.o.s s.a.th s.e.b s.e.ng s.e.nk s.o.ch s.o.th',
    's.u.sh s.u.t sh.a.z sh.e.g sh.e.nk sh.e.sh sh.i.g sh.i.ng sh.o.s sh.u.f sh.u.p sh.u.th sh.u.z t.a.z t.e.b',
    't.e.nk t.e.p t.e.s t.e.t t.o.b t.u.d th.a.sh th.e.ch th.e.ck th.e.d th.e.g th.e.th th.i.ch th.i.d th.i.x',
    'th.o.m th.o.p th.u.f th.u.x th.u.z v.a.ch v.a.d v.a.p v.a.th v.e.d v.i.nk v.i.x v.i.z v.o.b v.o.t v.o.z v.u.f',
    'v.u.th w.e.ch w.e.g w.e.ng w.e.nk w.e.p w.e.sh w.e.th w.o.s w.o.x w.u.b w.u.f w.u.m w.u.ng w.u.nk wh.a.d',
    'wh.a.f wh.a.s wh.a.sh wh.e.ch wh.e.p wh.e.s wh.e.x wh.i.b wh.i.s wh.o.f wh.u.b wh.u.ck wh.u.f y.a.ch y.a.f',
    'y.a.sh y.e.f y.e.m y.i.ch y.i.ck y.i.t y.o.ng y.o.nk y.o.sh y.o.th y.u.g y.u.z z.a.ng z.a.sh z.e.ck z.e.f',
    'z.e.nk z.e.s z.i.m z.i.sh z.i.x z.o.b z.o.m z.o.p z.u.g z.u.n'
  ];

  /* spelling -> { tiles, real } */
  var BANK = {};
  function add(list, real) {
    list.join(' ').split(/\s+/).filter(Boolean).forEach(function (d) {
      var tiles = d.split('.');
      var w = PL.spell(tiles);
      if (!BANK[w]) BANK[w] = { tiles: tiles, real: real };
    });
  }
  add(REAL, true);
  add(MADE_UP, false);
  PL.WORDBANK = BANK;

  /* Every word in the list, sorted. */
  PL.bankWords = function () { return Object.keys(BANK).sort(); };

  /* True for a word in the list (it has a bundled clip). */
  PL.isWord = function (w) { return Object.prototype.hasOwnProperty.call(BANK, w); };
})();
