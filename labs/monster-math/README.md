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

Every spoken line has an id in `js/phrases.js` (for example `problem-add-3-2` → "three plus two"). The page plays the clip for that id when there is one, and the device's built-in voice when there isn't.

**There are no clips yet**, so it uses the device voice for now. The default voice will come from the same open-source voice tool as Letter Chains once that's ready. Don't use macOS voices: Apple allows them for personal use only.

- `node tools/list-phrases.js` prints every id and its text as JSON, for a voice tool.
- `node tools/list-phrases.js --readme` rewrites `assets/audio/README.md`, the recording list.
- Save clips as `assets/audio/phrases/<id>.wav` or `.mp3`, then run `node tools/build-audio.js`. It wraps each clip in a `.js` file (the security policy, `connect-src 'none'`, stops scripts from downloading files) and updates `assets/audio/index.js`, the list of clips that exist.

## Tests

```sh
node --test labs/monster-math/test/
```

They check problem generation (ranges, answer choices, no repeats), that every line has a phrase, the audio tools, and the control icons. The site's security and design rules are checked for every page by `node --test test/` at the repo root.

## Files

```
index.html             page shell
css/styles.css         styles for this lab (shared look: ../../assets/primary-labs.css, see DESIGN.md)
js/phrases.js          every spoken line: id, spoken text, on-screen text
js/problems.js         problems and answer choices
js/sound.js            clip player, device-voice fallback, sound effects
js/art.js              monster and robot drawings, the red X, control icons
js/app.js              the activity
assets/audio/          clips (none yet), index.js, and the recording list
tools/                 build-audio.js, list-phrases.js
test/                  Node tests
```
