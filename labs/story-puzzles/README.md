# Story Puzzles · Primary Labs

Grade 1 reading: read a short decodable story, then find the picture pieces that go with it. Based on
the classroom story-puzzle printables, where picture pieces fit under a story card.
It is aligned to NYS Next Generation English Language Arts Learning Standards, Grade 1:

- **1RF3c**: Decode regularly spelled one-syllable words.
- **1RF4**: Read beginning reader texts, appropriate to individual student ability, with sufficient accuracy and fluency to support comprehension.
- **1R7**: Use illustrations and details in literary and informational texts to discuss story elements and/or topics. (RI&RL)
- **1R1**: Develop and answer questions about key ideas and details in a text. (RI&RL)

Kindergarten students reading at this level practice **KRF3b** (Decode short vowel sounds with common
spellings.) and **KR7** (Describe the relationship between illustrations and the text.). The page's
"For teachers" notes say where each standard is practiced.

The wording is quoted from *NYS Next Generation English Language Arts Learning Standards (Revised 2017)*,
pp. 21–22 (K) and 29–31 (Grade 1):
https://www.nysed.gov/sites/default/files/programs/standards-instruction/nys-next-generation-ela-standards.pdf.
NYS lettering differs from Common Core's: decoding one-syllable words is 1RF3c (Common Core RF.1.3b),
and NYS 1RF4 has no "purpose and understanding" part. Check codes against that document, not a
Common Core correlation.

## How it plays

| Part | What kids do |
| --- | --- |
| **Story** | Ten short stories, six lines each, one sentence per row. Grouped by short vowel (a, i, o, u, e) plus *At the Pond*, which mixes them. Words are short-vowel words kids can sound out, plus a few high-frequency words. |
| **Pieces** | Six picture pieces in a tray: four show details from the story, two don't. Each one that doesn't is one sound away from a story word (map for mat, pot for pit), so kids have to read every letter. |
| **Find** | Tap a piece, or drag it onto the story. If it's in the story, it clicks into its spot under the story (the spots go in story order), its word gets a green underline, and its sentence lights up yellow and is read aloud. If it isn't, it fades out with "That one is not in the story. Read it again." Tapping a faded piece says that again. |
| **Finish** | When all four are in, the row of pictures tells the story in order. Kids retell it, then go to the next story or do it again. |
| **Hear the story** | Says "Let's read …" with the title, pauses like a storyteller, then reads every line, lighting each one up. Tapping a sentence reads just that sentence, and tapping a placed piece reads its sentence again. Tapping an empty spot says the directions. When a child opens a story (Next story, Do it again, or the story picker), it says "Let's read …" with the title lit. The title is never said on its own, so the voice doesn't start with a bare title out of nowhere. |

On tablets and boards the whole activity fits on one screen: the story text, the spots and the pieces
are sized from the screen's height, so a child sees the story, every piece and what happened all at
once. Upright tablets show the six pieces in one row under the spots. Phones scroll; when a piece is
tapped there, its spot comes into view before the piece flies to it.

The story list opens from a "Stories" button at the top right, next to the bell. It opens over the page,
so it never pushes the activity down, and picking a story, tapping outside, Escape or the button again
closes it. On small phones the button shows only its book icon. Below the activity, the teacher notes
(how to use it, standards, tips) stay closed behind one small grey "For teachers" line until a teacher
opens it, so children don't land in a page of text. A story left before it's finished keeps its pieces and their places for the rest
of the visit. A finished story starts fresh, with the pieces shuffled.

Dragging works on tablets and wider: a piece follows the finger, and letting go outside the tray (or
back on its own place) counts as a tap. Letting go elsewhere in the tray puts it back. On phones the
pieces are tapped, so a swipe still scrolls the page.

Nothing in the tray moves around: a placed piece leaves an empty outline, and a wrong one stays where it
was, faded. The bell button turns the sound effects off (speech stays on). A story's id in the address
(`#fat-cat`) opens that story, so teachers can link to one. Every sentence is a button, so it can be
heard from the keyboard too. A held-down Enter key counts once. Taps wait about a second after the
puzzle is finished or a new story opens, and "Next story" and "Do it again" appear only then, so a
child still tapping where the last piece was can't skip ahead or start over. Tapping the story that
is already open does nothing, and tapping a sentence again while it plays lets it finish.

## Running it

No build step and no dependencies. Serve the site root (`python3 -m http.server 8000`) and visit
http://localhost:8000/labs/story-puzzles/.

## Editing stories

Stories live in `js/stories.js`. Each one has six lines, four `pieces` (picture, line, the word as
written in that line, and alt text) in story order, and two `others` with the word they stand for.
The tests check that:

- every piece's word is in its line, and the pieces go in story order;
- the `others` words don't appear anywhere in the story, and each is one sound from the story word in its `near`;
- every word is a short-vowel word a child can sound out, or one of the high-frequency words in `SP.SIGHT`;
- every picture is drawn in `js/art.js`, and every line has a clip made from its current text.

After changing a line or title, remake its clip (see Voice).

## Pictures

`js/art.js` holds the drawings: one part per thing or animal, drawn in a 120 × 120 box with an ink
outline like Letter Chains' pictures (several parts come from there). A story picture is a scene: parts
layered in order with a position and size, so "cat on a mat" is the mat then the cat, and "cat in a bag"
is the cat then the bag over its lower half. `Art.piece()` puts a picture into the jigsaw shape.

## Voice

Every spoken line has an id in `js/phrases.js` (`fat-cat-3` → "The cat naps on a mat.",
`fat-cat-start` → "Let's read The Fat Cat.", `intro`, `not-in`, `done`), and every line
plays from a clip in `assets/audio/phrases/`. The device's built-in voice is used only if a clip can't
be downloaded.

The current story's clips load first. A moment later every other clip downloads in the background, one
at a time, so a connection that drops after the page opens (school Wi-Fi) never switches a story to the
computer voice. A clip that fails to download is tried again the next time it's needed.

**The clips are computer-generated**, with the "Heart" voice of Kokoro-82M, the same open-source voice
model (Apache-2.0) as the other labs, made ahead of time by `../../tools/voice/story_puzzles.py`. It runs
Monster Math's checks on every line: one recognizer had to hear exactly the words of its line, a second
one its sounds, and further checks look for glitches. Short o is forced to the "ah" of dot everywhere
(dog, log, frog, on, off), so dog and dot share a vowel. No AI runs in the browser.

- After changing a line, make its clip with `../../tools/voice/story_puzzles.py --only <id>` (see its
  README, or the `voice` skill), copy the MP3 into `assets/audio/phrases/`, and run
  `node tools/build-audio.js --from "$HOME/Documents/Primary Labs audio/runs/story-puzzles/af_heart/manifest.json"`. That records the text each clip was
  made from in `assets/audio/made-from.json`. The tests fail until every line has a clip that says
  the line as it reads now.
- `node tools/list-phrases.js` prints every id and its text as JSON. The voice tool reads this.
- `node tools/list-phrases.js --readme` rewrites `assets/audio/README.md`, the clip list.
- `node tools/build-audio.js` wraps each clip in a `.js` file (the security policy, `connect-src 'none'`,
  stops scripts from downloading files) and updates `assets/audio/index.js`. Only the `.js` files need
  to be deployed.

## Tests

```sh
node --test labs/story-puzzles/test/
```

They check the stories (structure, story order, decodable words, pieces that don't belong), the clip player (a clip, never the computer voice, even after the connection drops), that every
line has a phrase and a clip made from its current text, the audio tools, and that every picture and
control icon is drawn. The
site's security and design rules are checked for every page by `node --test test/` at the repo root.

## Files

```
index.html             page shell and the teacher notes
css/styles.css         styles for this lab (shared look: ../../assets/primary-labs.css, see DESIGN.md)
js/stories.js          the stories, their pieces, and the sight words
js/phrases.js          every spoken line: id and text
js/sound.js            clip player, device-voice fallback, sound effects
js/art.js              pictures, the puzzle piece, control icons
js/app.js              the activity
assets/audio/          clips (MP3, Heart voice), index.js, made-from.json, and the clip list
tools/                 build-audio.js, list-phrases.js
test/                  Node tests
```
