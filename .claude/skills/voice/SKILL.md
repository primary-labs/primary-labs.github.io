---
name: voice
description: Make, remake, check and ship the Primary Labs voice clips (Kokoro "Heart" voice, tools/voice/). Use when spoken content changes (Letter Chains words, tiles, keywords or sentences; a line in Monster Math's or Story Puzzles' js/phrases.js; a new story), when someone says a clip or letter sound sounds wrong, when a lab with audio is added, or when tools/voice/ changes. Not for playback or recording code (sound.js, recorder.js).
---

# Voice clips

Every lab plays clips made ahead of time by `tools/voice/` with Kokoro-82M's "Heart" voice
(`af_heart`). This page is the steps. The reasons and measurements behind them are in
`tools/voice/README.md`: read the lab's section there before changing how clips are made.

## Rules

- **The owner's ear decides.** The checks catch a lot, but they passed /g/, /ow/, /j/ and /w/ when the
  owner heard them as wrong. When the owner says a clip is wrong, it is wrong, whatever the checks say.
- **Show the owner a handful of takes, never hundreds.** The machine can make hundreds; the owner hears
  at most four per clip (the listen page's limit), each made a different way. Narrowing them is your job:
  the checks rank takes, `spectrogram.py` shows echoes and seams, and the owner's earlier picks show what
  works (held sounds for v, z, r; some of the vowel for g, j, ng). Never ask the owner to dig through takes.
- **Make only what changed.** Use `--only` and `--names` (Letter Chains) or `--only ID,...` (Monster
  Math, Story Puzzles). **Ask the owner before a full Letter Chains run**: it takes hours and remakes every
  letter sound slightly differently. Full Monster Math (about 10 minutes) and Story Puzzles runs are fine.
- **A remade letter sound never ships without the owner's pick** on the listen page, even when every
  check passes.
- **When a clip sounds wrong, check the live clip first** (`--review`) before remaking anything.
- Never let the dictionary guess a word, and never use macOS voices (Apple allows them for personal use only).
- Run long jobs in the background with a log. Commit or push only when asked.

## Setup

```sh
cd tools/voice && source .venv/bin/activate     # then plain `python`; or call .venv/bin/python
```

- Runs go to `~/Documents/Primary Labs audio/runs/<lab>/af_heart/` (`letter-chains`, `monster-math`,
  `story-puzzles`). The folder is reused, so `--only` finds the last full run. `--out` overrides it.
- Runs never go online. If a model is missing, the run stops and prints the `hf download` command.
  Tell the owner before running it (the models total about 2.6 GB).
- If `pip` is needed, use the bare command inside the venv (a malware scanner wraps it; see AGENTS.md).

## Before making clips: phoneme traps

- **Letter Chains words** are written as tiles in `labs/letter-chaining/js/words.js` (`sh.i.p`,
  `c.a_e.k`). Their sounds come from the tiles, never from spelling: c and g are hard, short o is the
  "ah" of dot, and made-up words follow the same rules ("cit" is /kɪt/). A new tile needs a sound in
  `phonemes.SOUNDS` (or `WHOLE_VOWELS`) and a keyword in `phonemes.KEYWORDS`.
- **Story Puzzles: short o.** Every short-o word in a story (dog, log, on, off, hot, top...) needs an entry
  in `FORCE` in `story_puzzles.py` with /ɑ/. The dictionary gives "aw", which would make dog and dot sound
  different.
- **Unknown words stop the build.** Add names to `FORCE` (Story Puzzles) or `SAY_AS` (Monster Math). Never
  work around the stop.
- **Kokoro strings:** `ɡ` is U+0261 and the stress mark `ˈ` is U+02C8. A keyboard `g` is silently dropped,
  so the scripts refuse it.
- **A k before long a can come out as t** ("cake" was heard as "take"). Kokoro hears an aspirated `kʰ`,
  with long a written as `eɪ`: add the word to `phonemes.WORD_MORE` and let the owner pick.
- **Watch for:** "and" is said stressed, so it isn't heard as "in". One-word lines are cut from a carrier
  sentence automatically. "read" in "Let's read ..." must come out as `ɹˈid` in the manifest.
- The recognizers often hear Heart's short i as short e even on good clips, and hear a lone f, th or h as
  nothing. Treat those flags as noise; listen instead.

## A clip sounds wrong (Letter Chains)

1. Check the live clip: `python letter_chains.py --review --only sounds --names d`
   (groups: `words`, `keywords`, `sentences`, `sounds`; `--names` matches across groups, so narrow with
   `--only`). It prints what both recognizers hear and every problem, and writes `review.json`. For real
   words and keywords, Whisper also writes down the word it hears ("Take." for the old cake; "son" for sun
   is just a word that sounds the same). Use it
   to decide what to try (heard /t/ for /d/: keep more of the vowel), not whether to act: if the owner
   hears it wrong, remake it even when the review passes.
2. Remake it with every take: `python letter_chains.py --only sounds --names d --all-takes` (one sound
   takes a few minutes; run it in the background). Cut letter sounds always try every source;
   `--all-takes` matters for words, keywords and whole vowels (ai, oo, oi...), which otherwise stop at the
   first take that passes, and it adds their other spellings. A remake only writes to the run folder:
   nothing ships until you copy a clip into the lab.
3. Open `~/Documents/Primary Labs audio/runs/letter-chains/af_heart/listen.html` in Firefox for the owner
   (`open -a Firefox <path>`). For each clip it plays the live clip, then up to four takes: the best take of
   each of the four best ways it was made (held by Kokoro, from a slowed word, said on its own, shorter...).
   The page keeps every clip still waiting for an answer, across runs (`--listen` rebuilds it). Before
   opening it, look at what it shows: if the four takes are near-duplicates or all have the same flaw,
   fix the way they're made first.
4. The owner copies back the box at the bottom. Pass all of it, as is:
   `python letter_chains.py --pick "<the box>"`. Picked takes are put in the run folder as the exact
   file the owner heard (WAV and MP3), and it prints the lines to add to `PICKED` in `phonemes.py` so later
   runs make the same take. Add them, each with a short comment saying why.
5. **"None sound right"**: those four takes are recorded as turned down and never shown again, so
   `--listen` (or the next run) offers the next four. Do that once at most. If the owner turns down a
   second round, or the page says no takes are left, the way the sound is made is wrong. Look at it with
   `python spectrogram.py out.png <clips>` (repeating blotches = an echo; a buzz that turns into hiss = a
   v heard as f), then add another way in `phonemes.py`: new source words, a held sound (`'vˈæn+v10'`:
   Kokoro holds the v for 10 frames of 25 ms), or another spelling (`WHOLE_MORE`, `WORD_MORE`). Or add cut
   options, which reuse each source word: `trace_options` (`~N`, keep N ms more vowel or glide),
   `length_options` (`=N`, N ms long: less stretching; `=0` as long as Kokoro said it, not stretched),
   `boost_options` (`^N`, N dB more hiss for v, z), or `option_sets` for several at once (`~70=0`).
   Before adding ways, check that the ones you have actually make takes: a source that gives no take is
   silently skipped (ng's normal-speed words all were), so count the takes of each way in the manifest.
   Remake and go back to step 3.
6. Ship it (below): only the picked clips. "Keep the live clip" means copy nothing. A word picked
   written another way also needs its sentence remade: `--only sentences --names <word>`.

Monster Math and Story Puzzles: `python monster_math.py --review --only ID` checks a clip in the run
folder again; remake with `--only ID` and listen on that run's `listen.html`.

## What Kokoro can and can't do (learned the hard way)

- It can't say a lone sound: every voice adds "uh". Sounds are cut from words.
- Held with `+cN`, v, z and r stay voiced to about 200 ms; vowels start to fade past about 150 ms; ng
  doesn't hold at all.
- It devoices a final v or z (heard as f, s): take voiced sounds from the start of a word.
- A lone nasal hum barely says where the tongue is: ng alone was heard as "el" or nothing. With 40-100 ms
  of the vowel before it ("(i)ng"), it is heard as ng, as /g/ and /j/ needed some of the vowel after.
- Very slow speeds (below about 0.5) and big stretches can sound robotic. A hiss is lengthened with new
  noise of the same spectrum (`hiss_extend`); joining copies of it was heard as an echo.

## Content changed

- **Letter Chains:** new or changed words: `--only words --names a,b`. A new tile: `--only sounds,keywords
  --names <sound>,<keyword>` and its words. Changed sentences: `--only sentences --names <word>`.
  `--new-only` makes just the clips the lab doesn't ship yet. Letter sounds then need the owner's pick.
- **Monster Math / Story Puzzles:** `python monster_math.py --only ID,ID` or `python story_puzzles.py --only
  ID,ID`. The new clips are compared with the other lines in the same run folder. Inserting a line in
  the middle renumbers every later id (`fat-cat-4` becomes `fat-cat-5`): remake each of them too
  (`node tools/list-phrases.js` in the lab lists ids and text).
- Read the run's last lines: anything marked `check` needs a listen or a fix (a rewritten line, a `FORCE`
  entry) before it ships.
- Check each new clip's phonemes in the run's `manifest.json` (`kokoro`): short-o words show `ɑ` (`dˈɑɡ`,
  `ˌɑn`), names come out as forced, and nothing was guessed.

## Shipping

Every lab ships MP3 only: letter sounds at 128 kbps, everything else at 96. The tests check it.
`R=~/Documents/Primary\ Labs\ audio/runs`.

**Letter Chains**
1. Copy the new MP3s from `$R/letter-chains/af_heart/{words,keywords,sentences,sounds}/` into
   `labs/letter-chaining/assets/audio/<same folder>/`. Only the clips meant to ship: picked ones, and ones
   whose checks pass. Never copy WAVs or `-long` files.
2. Delete the MP3s of words no longer in the list (`build-audio.js` never deletes audio).
3. `cd labs/letter-chaining && node tools/build-audio.js`
4. Update the clip list in `labs/letter-chaining/assets/audio/README.md` by hand if clips were added or removed.

**Monster Math**
1. Copy the MP3s you made (`$R/monster-math/af_heart/phrases/<id>.mp3`) into
   `labs/monster-math/assets/audio/phrases/`, and delete MP3s whose line is gone (`build-audio.js` warns
   about them).
2. `cd labs/monster-math && node tools/build-audio.js`; if lines changed, also `node tools/list-phrases.js --readme`.

**Story Puzzles**
1. Copy the MP3s you made (`$R/story-puzzles/af_heart/phrases/<id>.mp3`) into
   `labs/story-puzzles/assets/audio/phrases/`, and delete MP3s whose line is gone (`build-audio.js` warns
   about them).
2. `cd labs/story-puzzles && node tools/build-audio.js --from "$HOME/Documents/Primary Labs audio/runs/story-puzzles/af_heart/manifest.json"`
   (an absolute path). This records the text each clip was made from; the tests fail without it.
   If lines changed, also `node tools/list-phrases.js --readme`.

**Then, for every lab**
- `cd tools/voice && python save_masters.py <lab>` zips the shipped WAV masters and the run record into
  `~/Documents/Primary Labs audio/masters/`.
- Run the tests: `node --test test/ labs/<lab>/test/` from the repo root, and play the new clips in the lab
  (`python3 -m http.server 8000` from the repo root, unless the owner's is already running).
- Swapping clips for new MP3s at the same bitrate doesn't need the iPhone check in AGENTS.md; changing
  how audio is stored, loaded or played does.
- When committing (only when asked), stage just this change's clips and code. If other work is
  uncommitted in the same files, ask the owner how to split it.

## A new lab with audio

- **Ordinary words only** (no letter sounds or made-up words): copy `story_puzzles.py`. It runs Monster
  Math's pipeline and checks on the lab's own `tools/list-phrases.js`, with a `FORCE` table and its own
  `RUN_NAME`. Add the lab to `LABS` in `save_masters.py`.
- **Letter sounds or made-up words:** these need exact phonemes, as Letter Chains does (`phonemes.py`).
  The dictionary would guess wrong. Talk to the owner first.
- Add a section to `tools/voice/README.md`, and give the lab a `tools/build-audio.js` and an MP3 bitrate test.
