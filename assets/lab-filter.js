/* Primary Labs home page: filter the lab list by grade and subject.
   Each .lab-item lists its grades and subjects in data-grade and data-subject.
   The choice is kept in the address (?grade=1&subject=reading), so a filtered list can be bookmarked. */
(function () {
  'use strict';

  var filtersEl = document.getElementById('labFilters');
  var statusEl = document.getElementById('labStatus');
  var countEl = document.getElementById('labCount');
  var resetBtn = document.getElementById('labReset');
  var listEl = document.getElementById('labList');
  if (!filtersEl || !statusEl || !countEl || !resetBtn || !listEl) return;

  var items = listEl.querySelectorAll('.lab-item');
  var groups = filtersEl.querySelectorAll('[data-filter]');
  if (!items.length || !groups.length) return;

  // Words for "No Grade 2 math labs yet."
  var WORDS = { k: 'kindergarten', 1: 'Grade 1', 2: 'Grade 2', reading: 'reading', math: 'math' };

  var chosen = {}; // filter name -> value; '' means all

  function nameOf(group) { return group.getAttribute('data-filter'); }

  function tagsOf(item, name) {
    return (item.getAttribute('data-' + name) || '').split(/\s+/);
  }

  function hasButton(group, value) {
    var buttons = group.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) if (buttons[i].value === value) return true;
    return false;
  }

  function matches(item) {
    for (var g = 0; g < groups.length; g++) {
      var name = nameOf(groups[g]);
      if (chosen[name] && tagsOf(item, name).indexOf(chosen[name]) < 0) return false;
    }
    return true;
  }

  function describe() {
    var words = [];
    for (var g = 0; g < groups.length; g++) {
      var v = chosen[nameOf(groups[g])];
      if (v) words.push(WORDS[v] || v);
    }
    return words.join(' ');
  }

  function render() {
    var shown = 0;
    for (var i = 0; i < items.length; i++) {
      var ok = matches(items[i]);
      items[i].hidden = !ok;
      if (ok) shown += 1;
    }

    for (var g = 0; g < groups.length; g++) {
      var buttons = groups[g].querySelectorAll('button');
      for (var b = 0; b < buttons.length; b++) {
        buttons[b].setAttribute('aria-pressed', String(buttons[b].value === chosen[nameOf(groups[g])]));
      }
    }

    var total = items.length;
    if (!shown) countEl.textContent = 'No ' + describe() + ' labs yet.';
    else if (shown < total) countEl.textContent = 'Showing ' + shown + ' of ' + total + ' labs.';
    else countEl.textContent = 'Showing ' + total + (total === 1 ? ' lab.' : ' labs.');
    resetBtn.hidden = shown > 0;
    listEl.hidden = !shown;
  }

  function readAddress() {
    var params = new URLSearchParams(location.search);
    for (var g = 0; g < groups.length; g++) {
      var name = nameOf(groups[g]);
      var v = params.get(name) || '';
      chosen[name] = hasButton(groups[g], v) ? v : '';
    }
  }

  function writeAddress() {
    var params = new URLSearchParams(location.search);
    for (var name in chosen) {
      if (chosen[name]) params.set(name, chosen[name]);
      else params.delete(name);
    }
    var query = params.toString();
    try {
      history.replaceState(history.state, '', location.pathname + (query ? '?' + query : '') + location.hash);
    } catch (e) { /* some browsers block this on file:// pages */ }
  }

  filtersEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    var group = btn && btn.closest('[data-filter]');
    if (!group) return;
    chosen[nameOf(group)] = btn.value;
    render();
    writeAddress();
  });

  resetBtn.addEventListener('click', function () {
    for (var name in chosen) chosen[name] = '';
    render();
    writeAddress();
    // The reset button hides itself, so move focus back to the first filter.
    groups[0].querySelector('button').focus();
  });

  readAddress();
  render();
  filtersEl.hidden = false;
  statusEl.hidden = false;
})();
