/* Primary Labs · Sound Boxes: the level list.
   The "Levels" button at the top opens the list over the page, so it never pushes the activity
   down. Picking a level, tapping outside, Escape or the button again closes it. */
(function () {
  'use strict';
  var SB = window.SB;
  var ui = SB.ui, Sound = SB.Sound;
  var $ = function (id) { return document.getElementById(id); };

  var current = '', onPick = null;

  function show(open) {
    $('levelsPanel').hidden = !open;
    $('levelsBtn').setAttribute('aria-expanded', String(open));
  }

  function render() {
    var box = $('levelList');
    box.textContent = '';
    SB.LEVELS.forEach(function (lv) {
      var b = ui.el('button', 'pill level-pill');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(lv.id === current));
      b.appendChild(ui.el('span', 'level-name', lv.name));
      b.appendChild(ui.el('span', 'level-words', lv.words.join(', ')));
      // The level already open stays as it is, so a stray tap can't restart it.
      b.addEventListener('click', function () {
        show(false);
        if (lv.id === current) { $('levelsBtn').focus({ preventScroll: true }); return; }
        Sound.sfx.click();
        onPick(lv.id);
      });
      box.appendChild(b);
    });
  }

  $('levelsBtn').addEventListener('click', function () {
    var open = $('levelsPanel').hidden;
    Sound.sfx.click();
    show(open);
    if (open) $('levelList').querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
  });
  document.addEventListener('pointerdown', function (e) {
    if (!$('levelsPanel').hidden && !e.target.closest('.levels-menu')) show(false);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || $('levelsPanel').hidden) return;
    show(false);
    $('levelsBtn').focus();
  });

  SB.Levels = {
    /* pick(id) runs when a different level is picked. */
    init: function (pick) { onPick = pick; },
    setCurrent: function (id) {
      var wasIn = $('levelsPanel').contains(document.activeElement);
      current = id;
      render();
      if (wasIn) $('levelsBtn').focus({ preventScroll: true }); // the list has closed
    }
  };
})();
