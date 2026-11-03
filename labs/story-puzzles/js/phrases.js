/* Primary Labs · Story Puzzles: everything the page says out loud.
   Each phrase has an id (also its clip's file name, assets/audio/phrases/<id>.mp3) and the text to
   say: every story's lines, "Let's read …" with each story's title, and the directions.
   No page code here: tools/list-phrases.js and the tests read this file in Node. */
(function (root) {
  'use strict';
  var SP = (root.SP = root.SP || {});

  var table = {};
  function add(id, say) {
    if (table[id]) throw new Error('Duplicate phrase id ' + id);
    table[id] = { id: id, say: say };
    return id;
  }

  /* Ids for each kind of line. The app only ever asks for these. */
  var ids = {
    // The title is always said in a sentence, so it never comes out of nowhere.
    start: function (story) { return story.id + '-start'; },
    line: function (story, n) { return story.id + '-' + (n + 1); },
    intro: function () { return 'intro'; },
    notIn: function () { return 'not-in'; },
    done: function () { return 'done'; }
  };

  add(ids.intro(), 'Read the story. Then tap the pictures that are in it.');
  add(ids.notIn(), 'That one is not in the story. Read it again.');
  add(ids.done(), 'You did it! Now use the pictures to tell the story.');

  (SP.STORIES || []).forEach(function (story) {
    add(ids.start(story), 'Let\'s read ' + story.title + '.');
    story.lines.forEach(function (line, n) { add(ids.line(story, n), line); });
  });

  SP.Phrases = {
    ids: ids,
    get: function (id) { return table[id] || null; },
    all: function () { return Object.keys(table).map(function (k) { return table[k]; }); }
  };
})(typeof window !== 'undefined' ? window : this);
