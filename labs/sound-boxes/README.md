# Sound Boxes · Primary Labs

Kindergarten and grade 1 reading: blend sounds into words and break words into sounds, with letters.
Based on Elkonin sound boxes: one box per sound, with counters, then letters. It is aligned to NYS
Next Generation English Language Arts Learning Standards:

- **KRF2d**: Blend and segment individual sounds (phonemes) in spoken one-syllable words.
- **KRF3a**: Demonstrate one-to-one letter-sound correspondence by producing the primary sound or most frequent sound for each consonant.
- **KRF3b**: Decode short vowel sounds with common spellings.
- **1RF3c**: Decode regularly spelled one-syllable words.

The wording is quoted from *NYS Next Generation English Language Arts Learning Standards (Revised 2017)*,
PDF page 22 (Kindergarten Reading Standards: Foundational Skills) and page 30 (1st Grade):
https://www.nysed.gov/sites/default/files/programs/standards-instruction/nys-next-generation-ela-standards.pdf.
NYS letters these differently from Common Core (decoding one-syllable words is 1RF3c, Common Core
RF.1.3b), so check codes against that document, not a Common Core correlation.

Not claimed: **1RF2a** ("Count, blend and segment single syllable words that include consonant blends.")
covers the same skill, but these words have no consonant blends. KRF2e and 1RF2b/c (changing sounds to
make new words) are Letter Chains' job; the research behind this lab found that one or two skills
(blending and segmenting) work better than adding more.

The page's "For teachers" notes say where each standard is practiced.

## How it plays

Two activities, switched with **Blend** and **Segment** at the top of the activity. Both use the same
screen: the directions, a picture card and a yellow hear button, the three sound boxes, a tray, and a
Next button that keeps its space while hidden, so nothing jumps.

| Part | What kids do |
| --- | --- |
| **Blend** | They hear the word's sounds one at a time, and each box lights yellow as its sound plays. They can tap any box to hear its sound again. Then they tap the matching picture out of three. The two wrong pictures are one sound away from the word (cat: hat, can), so every sound matters. A right picture says the word, puts its letters in the boxes and shows the picture on the card. A wrong picture fades where it is, and the voice says "Listen again." and plays the sounds again. |
| **Segment, say it** | They hear the word and see its picture. They put a counter in each box while saying each sound aloud: tap a counter or a box (the counters fill from the left), or drag a counter onto a box. Each box plays its sound as the counter lands, so they can check themselves. When all three are in, the word is said again and the letters come. |
| **Segment, spell it** | They put letter tiles in the boxes, from the word's letters plus two or three others (always including a second vowel), in a-to-z order. Tapping a tile fills the next box. A wrong tile plays its own sound and stays in its place (dragged, it slides back), and the box replays the sound it needs. When the word is spelled, it is sounded out and said. |

There is no timer, no score and no flashing. A wrong answer gets a low, quiet tone (with the bell on)
and a replay, never a buzzer. Yellow means "look here": the box whose sound is playing, and a dashed
yellow edge on the box to fill next. Green means right. Letters are red for vowels and blue for
consonants, as in Letter Chains.

Words are three sounds and three letters: consonant, short vowel, consonant. They come in levels by
vowel (short a, i, o, u, e) and a mixed level. The "Levels" button at the top opens the list over the
page; picking a level, tapping outside, Escape or the button again closes it. A level's id in the
address (`#short-a`) opens it, so teachers can link to one. A level always gives the same words in the
same order, and each word always gets the same pictures in the same places and the same letter tray.
The right picture's place follows `SB.PLACES`, which never repeats a place twice in a row. After the
last word, Next says "Start again" and goes back to the first.

Taps wait a moment after a word opens (0.6 s) and after it is done (1.2 s), so a child still tapping
can't skip ahead; "Next word" appears only after that. Dragging works on tablets and wider (721 px up),
where the whole activity fits on one screen; on phones the counters and tiles are tapped, so a swipe
still scrolls the page. Every box, picture, counter and tile is a button, so the whole activity works
from the keyboard. A held-down Enter or Space key counts once. The picture card does the same as the yellow
button, so the keyboard skips it. The bell turns sound effects off; speech stays on.

## Running it

No build step and no dependencies. Serve the site root (`python3 -m http.server 8000`) and visit
http://localhost:8000/labs/sound-boxes/.

## Editing words

Words live in `js/words.js`. Each word has `near`, its two wrong pictures in Blend, and `extra`, the
letters added to its tray. `SB.LEVELS` lists the levels and their words in order (at most ten each, the
length of `SB.PLACES`). Every word needs a picture a five-year-old names correctly on sight, so words
that don't picture well (cot, tot, gig) are left out, and no round shows two pictures with the same
everyday name (a cap reads as "hat"). Short o and short e have only four words for that reason.

After changing words, run `node tools/copy-clips.js` and `node tools/build-audio.js`. The tests check that:

- every word is consonant, short vowel, consonant, with one letter per sound (no x, which is two sounds);
- every wrong picture is one sound from its word, and no round shows two same-named pictures;
- extra letters are two or three, not in the word, with a vowel;
- each level's word order is the one written in the test, so a change to it is deliberate;
- every word and wrong picture is drawn, and every word has its word clip and its letters' sound clips.

## Pictures

`js/art-living.js` (animals and people) and `js/art-things.js` hold the drawings, each in a 120 × 120 box
with an ink outline added by `js/art.js`. Most come unchanged from Story Puzzles (`js/art.js`) and three
from Letter Chains (wig, top, dig). Story Puzzles' sun and pen were made for scenes (a small corner sun,
an animal pen), so Sound Boxes has its own. Drawn for this lab: hat, kid, lip, leg, zip, tap, sub, nut,
peg, ten (a ten-frame of dots, no digits) and pen. Pictures Story Puzzles drew sitting low in a scene
(cap, map, pan, bun, bus) are lifted to the middle of the box in `js/art.js`.

## Audio

Three kinds of clip, all MP3, in `assets/audio/` (see its README for the list):

- **Letter sounds** (`sounds/`, 128 kbps) and **words** (`words/`, 96 kbps) are copied unchanged from
  Letter Chains by `node tools/copy-clips.js`. Letter Chains owns them: the owner picked every letter
  sound there by ear, so this lab never makes its own. k plays c's clip, as there. A word without a
  Letter Chains clip can't be used; pick another word. The tests fail if a copy differs from its
  source, so a remake in Letter Chains shows up here: run `copy-clips.js` again.
- **Directions** (`phrases/`, 96 kbps): "Which picture?", "Listen again.", "Tap a box for each sound."
  and "Put the letters in the boxes." Each has an id in `js/phrases.js`. They were made with the
  "Heart" voice of Kokoro-82M by `../../tools/voice/sound_boxes.py`, which runs Monster Math's pipeline
  and checks (see `../../tools/voice/README.md`). After changing one, make its clip with
  `sound_boxes.py --only <id>`, copy the MP3 into `assets/audio/phrases/`, and run
  `node tools/build-audio.js --from "$HOME/Documents/Primary Labs audio/runs/sound-boxes/af_heart/manifest.json"`.
  That records the text each clip was made from in `assets/audio/made-from.json`; the tests fail until
  every direction has a clip made from its current text.

Every clip is a computer voice made ahead of time; no AI runs in the browser. Playback goes bundled
clip, then the device's built-in voice as a last resort if a clip can't be downloaded. The device voice
says words and directions but not a letter sound on its own, so a missing letter-sound clip is a short
pause. There is no teacher recording in this lab.

- `node tools/build-audio.js` wraps each clip in a `.js` file (the security policy, `connect-src 'none'`,
  stops scripts from downloading files) and updates `assets/audio/index.js`. Only the `.js` files need
  to be deployed.
- `node tools/list-phrases.js` prints the directions as JSON (the voice tool reads this);
  `--readme` rewrites `assets/audio/README.md`.
- A moment after the page opens, every clip downloads in the background, one at a time, so a dropped
  connection later never switches to the computer voice. A clip that fails to download is tried again
  the next time it's needed.

## Tests

```sh
node --test labs/sound-boxes/test/
```

They check the words and levels (above), the round layout (pictures and tray stay the same, the right
picture never in the same place twice in a row), that every sound and word clip is byte-identical to
Letter Chains', that only the clips the levels need are copied, bitrates, that every direction has a
clip made from its current text, the audio tools, the clip player (a clip, never the computer voice,
even after the connection drops), and that every picture and control icon is drawn. The site's security
and design rules are checked for every page by `node --test test/` at the repo root. Play both
activities by hand in the browser.

## Files

```
index.html             page shell and the teacher notes
css/styles.css         styles for the activity (shared look: ../../assets/primary-labs.css, see DESIGN.md)
css/teachers.css       styles for the teacher notes
js/words.js            the words, their wrong pictures and extra letters, and the levels
js/rounds.js           what a round shows: picture order, letter tray, clip ids
js/phrases.js          the spoken directions: id and text
js/sound.js            clip player, device-voice fallback, sound effects
js/art-living.js       drawings: animals and people
js/art-things.js       drawings: things
js/art.js              pictures from the drawings, control icons
js/ui.js               small page helpers both activities use
js/boxes.js            the three sound boxes
js/drag.js             dragging counters and tiles onto the boxes
js/blend.js            Blend
js/segment.js          Segment: counters, then letters
js/levels.js           the level list
js/app.js              the page: level, word and activity, and the controls
assets/audio/          clips (sounds/, words/, phrases/), index.js, made-from.json, and the clip list
tools/                 build-audio.js, copy-clips.js, list-phrases.js
test/                  Node tests
```
