/* Primary Labs · Sound Boxes: small page helpers shared by both activities. */
(function () {
  'use strict';
  var SB = window.SB;
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function button(cls, label) {
    var b = el('button', cls);
    b.type = 'button';
    if (label) b.setAttribute('aria-label', label);
    return b;
  }

  /* True when b has the keyboard's focus ring, i.e. the child is using keys, not taps. */
  function byKeys(b) {
    try { return !!b && b.matches(':focus-visible'); } catch (e) { return false; } // older browsers
  }

  /* Moves the keyboard to b. The page scrolls to it only for keyboard users, so a tap never makes
     the page jump. */
  function focusOn(b) {
    if (!b) return;
    b.focus({ preventScroll: true });
    if (byKeys(b)) b.scrollIntoView({ block: 'nearest' });
  }

  /* Moves target from where `from` (a DOMRect) was to where it is now. Returns the animation, or
     nothing when it doesn't move. */
  function fly(target, from) {
    if (reduceMotion.matches || !target.animate) return null;
    var to = target.getBoundingClientRect();
    if (!to.width) return null;
    var dx = from.left + from.width / 2 - (to.left + to.width / 2);
    var dy = from.top + from.height / 2 - (to.top + to.height / 2);
    return target.animate([
      { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
      { transform: 'none' }
    ], { duration: 350, easing: 'cubic-bezier(.2, .8, .3, 1)' });
  }

  /* Plays a shared keyframe animation (pop, shake) again, even if it just ran. */
  function replay(e, cls) {
    e.classList.remove(cls);
    void e.offsetWidth;
    e.classList.add(cls);
  }

  SB.ui = { el: el, button: button, byKeys: byKeys, focusOn: focusOn, fly: fly, replay: replay, reduceMotion: reduceMotion };
})();
