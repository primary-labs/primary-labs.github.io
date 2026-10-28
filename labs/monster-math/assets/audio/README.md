# Audio clips

Every line Monster Math says can play from a clip in `phrases/`. Lines without a clip use the
device's built-in voice, which sounds different on every computer, so the goal is a clip for all of them.

There are no clips yet. The default voice will come from the same open-source voice tool as
Letter Chains. Do not use macOS voices (Samantha, Daniel and the rest): Apple allows them for
personal use only.

## Adding clips

1. Save each clip as `phrases/<file>.wav` or `.mp3`, using the names below.
2. Run `node tools/build-audio.js`. It wraps each clip in a `.js` file and updates `index.js`.
3. Only the `.js` files need to be deployed.

Trim silence at the start and end, and keep levels even between clips. MP3 keeps the folder
small (about 350 clips).

Regenerate this list with `node tools/list-phrases.js --readme`.

## Clips (328)

| File | Say |
| --- | --- |
| `n-0` | zero |
| `not-0` | Not zero. |
| `n-1` | one |
| `not-1` | Not one. |
| `n-2` | two |
| `not-2` | Not two. |
| `n-3` | three |
| `not-3` | Not three. |
| `n-4` | four |
| `not-4` | Not four. |
| `n-5` | five |
| `not-5` | Not five. |
| `n-6` | six |
| `not-6` | Not six. |
| `n-7` | seven |
| `not-7` | Not seven. |
| `n-8` | eight |
| `not-8` | Not eight. |
| `n-9` | nine |
| `not-9` | Not nine. |
| `n-10` | ten |
| `not-10` | Not ten. |
| `problem-add-1-1` | one plus one |
| `yes-add-1-1` | Yes! One plus one is two! |
| `solved-add-1-1` | One and one make two! |
| `problem-add-1-2` | one plus two |
| `yes-add-1-2` | Yes! One plus two is three! |
| `solved-add-1-2` | One and two make three! |
| `problem-add-1-3` | one plus three |
| `yes-add-1-3` | Yes! One plus three is four! |
| `solved-add-1-3` | One and three make four! |
| `problem-add-1-4` | one plus four |
| `yes-add-1-4` | Yes! One plus four is five! |
| `solved-add-1-4` | One and four make five! |
| `problem-add-1-5` | one plus five |
| `yes-add-1-5` | Yes! One plus five is six! |
| `solved-add-1-5` | One and five make six! |
| `problem-add-1-6` | one plus six |
| `yes-add-1-6` | Yes! One plus six is seven! |
| `solved-add-1-6` | One and six make seven! |
| `problem-add-1-7` | one plus seven |
| `yes-add-1-7` | Yes! One plus seven is eight! |
| `solved-add-1-7` | One and seven make eight! |
| `problem-add-1-8` | one plus eight |
| `yes-add-1-8` | Yes! One plus eight is nine! |
| `solved-add-1-8` | One and eight make nine! |
| `problem-add-1-9` | one plus nine |
| `yes-add-1-9` | Yes! One plus nine is ten! |
| `solved-add-1-9` | One and nine make ten! |
| `problem-add-2-1` | two plus one |
| `yes-add-2-1` | Yes! Two plus one is three! |
| `solved-add-2-1` | Two and one make three! |
| `problem-add-2-2` | two plus two |
| `yes-add-2-2` | Yes! Two plus two is four! |
| `solved-add-2-2` | Two and two make four! |
| `problem-add-2-3` | two plus three |
| `yes-add-2-3` | Yes! Two plus three is five! |
| `solved-add-2-3` | Two and three make five! |
| `problem-add-2-4` | two plus four |
| `yes-add-2-4` | Yes! Two plus four is six! |
| `solved-add-2-4` | Two and four make six! |
| `problem-add-2-5` | two plus five |
| `yes-add-2-5` | Yes! Two plus five is seven! |
| `solved-add-2-5` | Two and five make seven! |
| `problem-add-2-6` | two plus six |
| `yes-add-2-6` | Yes! Two plus six is eight! |
| `solved-add-2-6` | Two and six make eight! |
| `problem-add-2-7` | two plus seven |
| `yes-add-2-7` | Yes! Two plus seven is nine! |
| `solved-add-2-7` | Two and seven make nine! |
| `problem-add-2-8` | two plus eight |
| `yes-add-2-8` | Yes! Two plus eight is ten! |
| `solved-add-2-8` | Two and eight make ten! |
| `problem-add-3-1` | three plus one |
| `yes-add-3-1` | Yes! Three plus one is four! |
| `solved-add-3-1` | Three and one make four! |
| `problem-add-3-2` | three plus two |
| `yes-add-3-2` | Yes! Three plus two is five! |
| `solved-add-3-2` | Three and two make five! |
| `problem-add-3-3` | three plus three |
| `yes-add-3-3` | Yes! Three plus three is six! |
| `solved-add-3-3` | Three and three make six! |
| `problem-add-3-4` | three plus four |
| `yes-add-3-4` | Yes! Three plus four is seven! |
| `solved-add-3-4` | Three and four make seven! |
| `problem-add-3-5` | three plus five |
| `yes-add-3-5` | Yes! Three plus five is eight! |
| `solved-add-3-5` | Three and five make eight! |
| `problem-add-3-6` | three plus six |
| `yes-add-3-6` | Yes! Three plus six is nine! |
| `solved-add-3-6` | Three and six make nine! |
| `problem-add-3-7` | three plus seven |
| `yes-add-3-7` | Yes! Three plus seven is ten! |
| `solved-add-3-7` | Three and seven make ten! |
| `problem-add-4-1` | four plus one |
| `yes-add-4-1` | Yes! Four plus one is five! |
| `solved-add-4-1` | Four and one make five! |
| `problem-add-4-2` | four plus two |
| `yes-add-4-2` | Yes! Four plus two is six! |
| `solved-add-4-2` | Four and two make six! |
| `problem-add-4-3` | four plus three |
| `yes-add-4-3` | Yes! Four plus three is seven! |
| `solved-add-4-3` | Four and three make seven! |
| `problem-add-4-4` | four plus four |
| `yes-add-4-4` | Yes! Four plus four is eight! |
| `solved-add-4-4` | Four and four make eight! |
| `problem-add-4-5` | four plus five |
| `yes-add-4-5` | Yes! Four plus five is nine! |
| `solved-add-4-5` | Four and five make nine! |
| `problem-add-4-6` | four plus six |
| `yes-add-4-6` | Yes! Four plus six is ten! |
| `solved-add-4-6` | Four and six make ten! |
| `problem-add-5-1` | five plus one |
| `yes-add-5-1` | Yes! Five plus one is six! |
| `solved-add-5-1` | Five and one make six! |
| `problem-add-5-2` | five plus two |
| `yes-add-5-2` | Yes! Five plus two is seven! |
| `solved-add-5-2` | Five and two make seven! |
| `problem-add-5-3` | five plus three |
| `yes-add-5-3` | Yes! Five plus three is eight! |
| `solved-add-5-3` | Five and three make eight! |
| `problem-add-5-4` | five plus four |
| `yes-add-5-4` | Yes! Five plus four is nine! |
| `solved-add-5-4` | Five and four make nine! |
| `problem-add-5-5` | five plus five |
| `yes-add-5-5` | Yes! Five plus five is ten! |
| `solved-add-5-5` | Five and five make ten! |
| `problem-add-6-1` | six plus one |
| `yes-add-6-1` | Yes! Six plus one is seven! |
| `solved-add-6-1` | Six and one make seven! |
| `problem-add-6-2` | six plus two |
| `yes-add-6-2` | Yes! Six plus two is eight! |
| `solved-add-6-2` | Six and two make eight! |
| `problem-add-6-3` | six plus three |
| `yes-add-6-3` | Yes! Six plus three is nine! |
| `solved-add-6-3` | Six and three make nine! |
| `problem-add-6-4` | six plus four |
| `yes-add-6-4` | Yes! Six plus four is ten! |
| `solved-add-6-4` | Six and four make ten! |
| `problem-add-7-1` | seven plus one |
| `yes-add-7-1` | Yes! Seven plus one is eight! |
| `solved-add-7-1` | Seven and one make eight! |
| `problem-add-7-2` | seven plus two |
| `yes-add-7-2` | Yes! Seven plus two is nine! |
| `solved-add-7-2` | Seven and two make nine! |
| `problem-add-7-3` | seven plus three |
| `yes-add-7-3` | Yes! Seven plus three is ten! |
| `solved-add-7-3` | Seven and three make ten! |
| `problem-add-8-1` | eight plus one |
| `yes-add-8-1` | Yes! Eight plus one is nine! |
| `solved-add-8-1` | Eight and one make nine! |
| `problem-add-8-2` | eight plus two |
| `yes-add-8-2` | Yes! Eight plus two is ten! |
| `solved-add-8-2` | Eight and two make ten! |
| `problem-add-9-1` | nine plus one |
| `yes-add-9-1` | Yes! Nine plus one is ten! |
| `solved-add-9-1` | Nine and one make ten! |
| `problem-sub-2-1` | two minus one |
| `yes-sub-2-1` | Yes! Two minus one is one! |
| `solved-sub-2-1` | Two minus one equals one! |
| `problem-sub-3-1` | three minus one |
| `yes-sub-3-1` | Yes! Three minus one is two! |
| `solved-sub-3-1` | Three minus one equals two! |
| `problem-sub-3-2` | three minus two |
| `yes-sub-3-2` | Yes! Three minus two is one! |
| `solved-sub-3-2` | Three minus two equals one! |
| `problem-sub-4-1` | four minus one |
| `yes-sub-4-1` | Yes! Four minus one is three! |
| `solved-sub-4-1` | Four minus one equals three! |
| `problem-sub-4-2` | four minus two |
| `yes-sub-4-2` | Yes! Four minus two is two! |
| `solved-sub-4-2` | Four minus two equals two! |
| `problem-sub-4-3` | four minus three |
| `yes-sub-4-3` | Yes! Four minus three is one! |
| `solved-sub-4-3` | Four minus three equals one! |
| `problem-sub-5-1` | five minus one |
| `yes-sub-5-1` | Yes! Five minus one is four! |
| `solved-sub-5-1` | Five minus one equals four! |
| `problem-sub-5-2` | five minus two |
| `yes-sub-5-2` | Yes! Five minus two is three! |
| `solved-sub-5-2` | Five minus two equals three! |
| `problem-sub-5-3` | five minus three |
| `yes-sub-5-3` | Yes! Five minus three is two! |
| `solved-sub-5-3` | Five minus three equals two! |
| `problem-sub-5-4` | five minus four |
| `yes-sub-5-4` | Yes! Five minus four is one! |
| `solved-sub-5-4` | Five minus four equals one! |
| `problem-sub-6-1` | six minus one |
| `yes-sub-6-1` | Yes! Six minus one is five! |
| `solved-sub-6-1` | Six minus one equals five! |
| `problem-sub-6-2` | six minus two |
| `yes-sub-6-2` | Yes! Six minus two is four! |
| `solved-sub-6-2` | Six minus two equals four! |
| `problem-sub-6-3` | six minus three |
| `yes-sub-6-3` | Yes! Six minus three is three! |
| `solved-sub-6-3` | Six minus three equals three! |
| `problem-sub-6-4` | six minus four |
| `yes-sub-6-4` | Yes! Six minus four is two! |
| `solved-sub-6-4` | Six minus four equals two! |
| `problem-sub-6-5` | six minus five |
| `yes-sub-6-5` | Yes! Six minus five is one! |
| `solved-sub-6-5` | Six minus five equals one! |
| `problem-sub-7-1` | seven minus one |
| `yes-sub-7-1` | Yes! Seven minus one is six! |
| `solved-sub-7-1` | Seven minus one equals six! |
| `problem-sub-7-2` | seven minus two |
| `yes-sub-7-2` | Yes! Seven minus two is five! |
| `solved-sub-7-2` | Seven minus two equals five! |
| `problem-sub-7-3` | seven minus three |
| `yes-sub-7-3` | Yes! Seven minus three is four! |
| `solved-sub-7-3` | Seven minus three equals four! |
| `problem-sub-7-4` | seven minus four |
| `yes-sub-7-4` | Yes! Seven minus four is three! |
| `solved-sub-7-4` | Seven minus four equals three! |
| `problem-sub-7-5` | seven minus five |
| `yes-sub-7-5` | Yes! Seven minus five is two! |
| `solved-sub-7-5` | Seven minus five equals two! |
| `problem-sub-7-6` | seven minus six |
| `yes-sub-7-6` | Yes! Seven minus six is one! |
| `solved-sub-7-6` | Seven minus six equals one! |
| `problem-sub-8-1` | eight minus one |
| `yes-sub-8-1` | Yes! Eight minus one is seven! |
| `solved-sub-8-1` | Eight minus one equals seven! |
| `problem-sub-8-2` | eight minus two |
| `yes-sub-8-2` | Yes! Eight minus two is six! |
| `solved-sub-8-2` | Eight minus two equals six! |
| `problem-sub-8-3` | eight minus three |
| `yes-sub-8-3` | Yes! Eight minus three is five! |
| `solved-sub-8-3` | Eight minus three equals five! |
| `problem-sub-8-4` | eight minus four |
| `yes-sub-8-4` | Yes! Eight minus four is four! |
| `solved-sub-8-4` | Eight minus four equals four! |
| `problem-sub-8-5` | eight minus five |
| `yes-sub-8-5` | Yes! Eight minus five is three! |
| `solved-sub-8-5` | Eight minus five equals three! |
| `problem-sub-8-6` | eight minus six |
| `yes-sub-8-6` | Yes! Eight minus six is two! |
| `solved-sub-8-6` | Eight minus six equals two! |
| `problem-sub-8-7` | eight minus seven |
| `yes-sub-8-7` | Yes! Eight minus seven is one! |
| `solved-sub-8-7` | Eight minus seven equals one! |
| `problem-sub-9-1` | nine minus one |
| `yes-sub-9-1` | Yes! Nine minus one is eight! |
| `solved-sub-9-1` | Nine minus one equals eight! |
| `problem-sub-9-2` | nine minus two |
| `yes-sub-9-2` | Yes! Nine minus two is seven! |
| `solved-sub-9-2` | Nine minus two equals seven! |
| `problem-sub-9-3` | nine minus three |
| `yes-sub-9-3` | Yes! Nine minus three is six! |
| `solved-sub-9-3` | Nine minus three equals six! |
| `problem-sub-9-4` | nine minus four |
| `yes-sub-9-4` | Yes! Nine minus four is five! |
| `solved-sub-9-4` | Nine minus four equals five! |
| `problem-sub-9-5` | nine minus five |
| `yes-sub-9-5` | Yes! Nine minus five is four! |
| `solved-sub-9-5` | Nine minus five equals four! |
| `problem-sub-9-6` | nine minus six |
| `yes-sub-9-6` | Yes! Nine minus six is three! |
| `solved-sub-9-6` | Nine minus six equals three! |
| `problem-sub-9-7` | nine minus seven |
| `yes-sub-9-7` | Yes! Nine minus seven is two! |
| `solved-sub-9-7` | Nine minus seven equals two! |
| `problem-sub-9-8` | nine minus eight |
| `yes-sub-9-8` | Yes! Nine minus eight is one! |
| `solved-sub-9-8` | Nine minus eight equals one! |
| `problem-sub-10-1` | ten minus one |
| `yes-sub-10-1` | Yes! Ten minus one is nine! |
| `solved-sub-10-1` | Ten minus one equals nine! |
| `problem-sub-10-2` | ten minus two |
| `yes-sub-10-2` | Yes! Ten minus two is eight! |
| `solved-sub-10-2` | Ten minus two equals eight! |
| `problem-sub-10-3` | ten minus three |
| `yes-sub-10-3` | Yes! Ten minus three is seven! |
| `solved-sub-10-3` | Ten minus three equals seven! |
| `problem-sub-10-4` | ten minus four |
| `yes-sub-10-4` | Yes! Ten minus four is six! |
| `solved-sub-10-4` | Ten minus four equals six! |
| `problem-sub-10-5` | ten minus five |
| `yes-sub-10-5` | Yes! Ten minus five is five! |
| `solved-sub-10-5` | Ten minus five equals five! |
| `problem-sub-10-6` | ten minus six |
| `yes-sub-10-6` | Yes! Ten minus six is four! |
| `solved-sub-10-6` | Ten minus six equals four! |
| `problem-sub-10-7` | ten minus seven |
| `yes-sub-10-7` | Yes! Ten minus seven is three! |
| `solved-sub-10-7` | Ten minus seven equals three! |
| `problem-sub-10-8` | ten minus eight |
| `yes-sub-10-8` | Yes! Ten minus eight is two! |
| `solved-sub-10-8` | Ten minus eight equals two! |
| `problem-sub-10-9` | ten minus nine |
| `yes-sub-10-9` | Yes! Ten minus nine is one! |
| `solved-sub-10-9` | Ten minus nine equals one! |
| `count-all-monster` | Tap each monster to count them all. |
| `how-many-monster` | How many are left? Count the monsters with no X. |
| `again-monster` | Let's count again. Tap each monster. |
| `again-monster-no-x` | Let's count again. Tap each monster with no X. |
| `take-away-monster-1` | Tap one monster to take it away. |
| `take-away-monster-2` | Tap two monsters to take them away. |
| `take-away-monster-3` | Tap three monsters to take them away. |
| `take-away-monster-4` | Tap four monsters to take them away. |
| `take-away-monster-5` | Tap five monsters to take them away. |
| `take-away-monster-6` | Tap six monsters to take them away. |
| `take-away-monster-7` | Tap seven monsters to take them away. |
| `take-away-monster-8` | Tap eight monsters to take them away. |
| `take-away-monster-9` | Tap nine monsters to take them away. |
| `count-all-robot` | Tap each robot to count them all. |
| `how-many-robot` | How many are left? Count the robots with no X. |
| `again-robot` | Let's count again. Tap each robot. |
| `again-robot-no-x` | Let's count again. Tap each robot with no X. |
| `take-away-robot-1` | Tap one robot to take it away. |
| `take-away-robot-2` | Tap two robots to take them away. |
| `take-away-robot-3` | Tap three robots to take them away. |
| `take-away-robot-4` | Tap four robots to take them away. |
| `take-away-robot-5` | Tap five robots to take them away. |
| `take-away-robot-6` | Tap six robots to take them away. |
| `take-away-robot-7` | Tap seven robots to take them away. |
| `take-away-robot-8` | Tap eight robots to take them away. |
| `take-away-robot-9` | Tap nine robots to take them away. |
| `gone-1` | One gone! How many are left? |
| `gone-2` | Two gone! How many are left? |
| `gone-3` | Three gone! How many are left? |
| `gone-4` | Four gone! How many are left? |
| `gone-5` | Five gone! How many are left? |
| `gone-6` | Six gone! How many are left? |
| `gone-7` | Seven gone! How many are left? |
| `gone-8` | Eight gone! How many are left? |
| `gone-9` | Nine gone! How many are left? |
| `skip` | That one has an X. Skip it. |
