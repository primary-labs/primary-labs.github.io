/* Primary Labs · Sound Boxes: dragging counters and letter tiles into the boxes.
   A tray item follows the finger. Letting go calls drop(item, x, y); if that returns false, the item
   slides back to its place in the tray. Only on tablets and wider: on a phone a swipe has to scroll
   the page, so items there are tapped. A drag never also counts as a tap.
   Follows Story Puzzles' piece dragging (js/app.js there). */
(function () {
  'use strict';
  var SB = window.SB;
  var ui = SB.ui;

  var canDrag = window.matchMedia ? window.matchMedia('(min-width: 721px)') : { matches: false };
  var drag = null;   // { item, id, x, y, moved, hold }
  var dragEnd = 0;   // when a drag ended, so the click that follows it doesn't count too

  /* Makes items matching selector inside tray draggable. opts: { can(item), drop(item, x, y) }. */
  function attach(tray, selector, opts) {
    tray.addEventListener('pointerdown', function (e) {
      var item = e.target.closest && e.target.closest(selector);
      if (!item || drag || !e.isPrimary || e.button !== 0 || !canDrag.matches || !opts.can(item)) return;
      drag = { item: item, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, hold: null };
      try { item.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
    });
    tray.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && dx * dx + dy * dy < 100) return; // a wobble under 10px is still a tap
      drag.moved = true;
      // Moved with an animation that holds its place (no inline styles).
      var t = 'translate(' + dx + 'px, ' + dy + 'px)', frames = [{ transform: t }, { transform: t }];
      if (drag.hold) drag.hold.effect.setKeyframes(frames);
      else if (drag.item.animate) {
        drag.item.classList.add('is-dragging');
        drag.hold = drag.item.animate(frames, { duration: 1, fill: 'forwards' });
      }
    });
    function stop(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.moved) return; // a tap: the click that follows handles it
      dragEnd = Date.now();
      d.item.classList.remove('is-dragging');
      // drop() runs while the item is still where it was let go, so it can fly on from there.
      var placed = e.type === 'pointerup' && opts.drop(d.item, e.clientX, e.clientY);
      var at = getComputedStyle(d.item).transform;
      if (d.hold) d.hold.cancel();
      if (placed) return;
      // Back to its place in the tray, quickly.
      if (!ui.reduceMotion.matches && at && at !== 'none' && d.item.animate && d.item.isConnected) {
        d.item.animate([{ transform: at }, { transform: 'none' }], { duration: 200, easing: 'ease-out' });
      }
    }
    tray.addEventListener('pointerup', stop);
    tray.addEventListener('pointercancel', stop);
  }

  SB.Drag = {
    attach: attach,
    /* True just after a drag, when the browser may still send a click for it. */
    justDragged: function () { return Date.now() - dragEnd < 400; }
  };
})();
