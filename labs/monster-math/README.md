# Monster Math · Primary Labs

Kindergarten adding and subtracting within 10, by counting monsters or robots.
It is aligned to NYS Next Generation Mathematics standards:

- **NY-K.OA.2a**: Add and subtract within 10.
- **NY-K.CC.4**: Understand the relationship between numbers and quantities up to 20; connect counting to cardinality.

## How it plays

| Setting | What kids do |
| --- | --- |
| **Add** | Two groups of friends. Tap each one to count it (it gets a number badge), then pick the total from three answers. |
| **Minus** | One group. Tap friends to cross them out. The answers unlock once the right number is crossed out. Then count the ones left and pick the answer. |
| **Friends** | Monsters or robots. Same problems, different pictures and sound effects. |
| **Numbers** | Up to 5, or up to 10. |

A wrong answer is greyed out and the count resets, with a prompt to count again. A right answer earns a star and the friends dance. The speaker button repeats the problem and the instruction. The bell button turns the sound effects on and off (speech stays on).

This lab started as a Claude artifact called "Monster Math & Words". Its reading tab was left out: Letter Chains covers that skill, and its letter sounds ("buh", "kuh") didn't meet Primary Labs' phoneme rules.

## Running it

No build step and no dependencies. Serve the site root (`python3 -m http.server 8000`) and visit http://localhost:8000/labs/monster-math/, or open `index.html` directly.

## Voice

Every spoken line has an id in `js/phrases.js` (for example `problem-add-3-2` → "three plus two"), and every line plays from a clip in `assets/audio/phrases/`. The page doesn't rely on the device's built-in voice, so it sounds the same on every computer. That voice is used only if a clip fails to load, or for a new line that has no clip yet.

**The clips are computer-generated**, with the "Heart" voice of Kokoro-82M, the same open-source voice model (Apache-2.0) as Letter Chains. They were made ahead of time, and each one was checked automatically: one recognizer had to hear exactly the words of its line, a second one exactly its sounds (so "six" can't sound like "sex"), and further checks look for glitches such as a stray pause or the sound cutting out. No AI runs in the browser. `../../tools/voice/README.md` explains how. Don't use macOS voices: Apple allows them for personal use only.

- After adding or changing a line in `js/phrases.js`, make its clip with `../../tools/voice/monster_math.py --only <id>` in the folder of a full run (see its README), copy the MP3 into `assets/audio/phrases/`, and run `node tools/build-audio.js`. The tests fail until every line has a clip.
- `node tools/list-phrases.js` prints every id and its text as JSON. The voice tool reads this.
- `node tools/list-phrases.js --readme` rewrites `assets/audio/README.md`, the clip list.
- `node tools/build-audio.js` wraps each clip in a `.js` file (the security policy, `connect-src 'none'`, stops scripts from downloading files) and updates `assets/audio/index.js`, the list of clips that exist. Only the `.js` files need to be deployed.

## Tests

```sh
node --test labs/monster-math/test/
```

They check problem generation (ranges, answer choices, no repeats), that every line has a phrase and every phrase has a clip, the audio tools, and the control icons. The site's security and design rules are checked for every page by `node --test test/` at the repo root.

## Files

```
index.html             page shell
css/styles.css         styles for this lab (shared look: ../../assets/primary-labs.css, see DESIGN.md)
js/phrases.js          every spoken line: id, spoken text, on-screen text
js/problems.js         problems and answer choices
js/sound.js            clip player, device-voice fallback, sound effects
js/art.js              monster and robot drawings, the red X, control icons
js/app.js              the activity
assets/audio/          clips (MP3, Heart voice), index.js, and the clip list
tools/                 build-audio.js, list-phrases.js
test/                  Node tests
```
