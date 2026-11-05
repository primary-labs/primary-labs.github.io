# Letter Chains · Primary Labs

A 1st-grade letter-chaining page. It starts with **short a, short i, short o, t, d, c, g, n**, and teachers
can turn on any of these tiles for their class:

| Group | Tiles |
| --- | --- |
| Short vowels | a e i o u |
| Consonants | b c d f g h j k l m n p qu r s t v w x y z |
| Digraphs | sh ch th wh ck ng nk |
| Long vowels: vowel teams | ai ay ee ea oa igh |
| Long vowels: silent e | a_e i_e o_e u_e |
| Other vowel sounds | oo ow ou oi oy |
| R-controlled vowels | ar or er ir ur |

It is aligned to NYS Next Generation ELA standards:

- **1RF2b**: Create new words by manipulating individual sounds (phonemes) in spoken one-syllable words.
- **1RF2c**: Manipulate individual sounds (phonemes) in single-syllable spoken words.
- **1RF3a**: Know the letter-sound correspondences for common blends and consonant digraphs (e.g., sh, ch, th).
- **1RF3b**: Decode long vowel sounds in regularly spelled one-syllable words (e.g., final –e conventions and common vowel teams).
- **1RF3c**: Decode regularly spelled one-syllable words.

## What's inside

| Area | What kids and teachers do |
| --- | --- |
| **Meet the Sounds** | Picture cards for each of the class's tiles (a as in apple, sh as in ship, ai as in rain). Tap a card to hear the sound (the teacher's recording if there is one), then its picture word ("/ă/ … apple"). |
| **Letter Chains** | With the start set, five built-in chains (for example cat → cot → dot → dog → dig → did → dad). With other tiles, up to five chains built from them (for example chip → ship → shop). Kids hear the new word, tap the tile that changes (beginning, middle, or end), then tap the new tile. "Blend it" lights and says each sound, then sweeps so kids say the word fast on their own. |
| **Sound Spy** | Nine quick rounds: "Where do you hear /t/?" Kids tap beginning, middle, or end. Words and tiles come from the class's tiles. |
| **Teacher Corner** | Press and hold to open. Pick the class's tiles, turn made-up words on or off, make new chains, record your voice for every sound and word, choose how long recordings are kept, make custom chains, and read the standards notes and a 5-minute routine. |

### Tiles

A tile is one sound, so a word is 2 or 3 tiles: ship is sh · i · p, rain is r · ai · n. A silent-e tile like a_e
puts its vowel in the middle and its quiet e after the last tile: cake is c · a_e · k, shown as c a k e with a
and e underlined together. Each tile always says one sound (short o is the "ah" of dot, c and g are hard, th is
the th of thumb, oo is the oo of moon), so the word list leaves out words where it doesn't ("was", "book",
"head", "page", "this").

### Chains from the teacher's tiles

The page builds up to five chains of 4 to 7 words from the words that use only the chosen tiles. Each step changes
one tile and its sound (meet → meat is not a step). Chains lean on tiles past the basics, so a class that turns
on ar and or mostly practices those. With made-up words on, a chain has at most two, and starts and ends on a
real word. The same tiles always give the same chains, so a class sees the same chains every day until the
teacher presses "Make new chains." With too few tiles for any chain, kids keep the built-in chains.

The choice is saved in this browser only (`pl-tile-set` in localStorage). "Reset to start set" brings back the
first eight tiles and the built-in chains.

On laptops, tablets held sideways and class boards, the word and the letter tiles fit on one screen: the start
set from 1024×768 up, and all 53 tiles on a 1920×1080 board. Tiles get smaller as a class turns on more of them
(over 16, then over 30). On smaller screens with many tiles, the tiles sit below the word and the page scrolls.

## Running it

No build step and no dependencies. Serve the site root (`python3 -m http.server 8000`) and visit
http://localhost:8000/labs/letter-chaining/, or open `index.html` directly.

Recording needs a secure page: **https://** or **localhost**. The page loads shared files from the site's
root `assets/`, so deploy the whole site, not just this folder.

## Teacher voice recordings: privacy

- Recordings are stored only in the browser's IndexedDB on that device. Nothing is uploaded.
- The page's Content-Security-Policy sets `connect-src 'none'`, so no script can send data anywhere. Fonts are hosted with the site, so the page makes no third-party requests.
- Recordings expire automatically: **until the tab closes**, **1 day**, or **7 days** (default). Expired clips are deleted on load, every minute, and when the tab comes back into view.
- The microphone is requested only when Record is pressed, and it is released as soon as recording stops. Each recording stops on its own after 4 seconds.
- Clips are trimmed of silence and leveled, so blended sounds line up.
- "Delete all recordings" clears everything. On shared computers, choose "Until this tab closes".

## Files

```
index.html            page shell and static content
css/styles.css        styles for this lab (shared look: ../../assets/primary-labs.css, see DESIGN.md)
js/data.js            tiles, sentences, built-in chains, blocked words, splitting words into tiles, chain validation
js/words.js           every word a chain can use (real and made-up), written as tiles
js/chains.js          builds chains from the teacher's tiles
js/art.js             hand-drawn SVG pictures
js/pictures.js        a picture for any word: drawing, emoji, word card, or made-up creature
js/voice-store.js     IndexedDB storage with expiry
js/recorder.js        microphone recording, trimming, and WAV encoding
js/sound.js           playback: teacher voice first, then the bundled clips (a failed download is retried)
js/app.js             views and activities
assets/audio/         clips for every letter sound, word, keyword, and sentence (see its README)
tools/build-audio.js  wraps each clip in the .js file the page loads
tools/content.js      prints the tiles, words and sentences as JSON for the voice tool
tools/made-up-words.js lists made-up word candidates for js/words.js
test/                 tests for the word list, chain builder, clip files and clip loading: node --test test/
```

The clips are made by the site's voice tool in `../../tools/voice/` (see its README).

## Editing content

- **Built-in chains**: edit `PL.CHAINS` in `js/data.js`. They are for the start set. Each step must change exactly one tile.
- **Word list**: edit `js/words.js`. Write each word as its tiles (`sh.i.p`, `c.a_e.k`). Real words are picked by hand; made-up words come from `node tools/made-up-words.js --prons <misaki us_gold.json>`, read by a person first. Then remake the clips and run `node --test test/`.
- **Tiles**: edit `PL.TILES` in `js/data.js` (sounds as IPA, clip name, keyword, tip). A new sound needs a clip and a keyword clip (see the voice tool).
- **Sentences**: edit `PL.WORDS` in `js/data.js`. The `art` field is optional. After changing a sentence, update its clip in `assets/audio/sentences/`.
- **Custom words** can have 2 or 3 sounds, using any letters (ship, cake). Each step changes one sound, and every word in a chain has the same number of sounds. Chains saved before tiles could hold more than one letter still read letter by letter. Words outside the word list have no clip, so they use the teacher's recording, or the device's built-in voice if there isn't one. Letters that aren't a tile (like a lone q) have no sound clip; without a recording, Blend pauses for them.
- **Pictures**: every word gets one from `js/pictures.js`. Words listed in `HAND` use their drawing from `js/art.js`, common words use an emoji (edit `EMOJI`), real words with no clear picture show a word card (edit `REAL`), and made-up words get a creature built from their letters. The same word always gets the same creature.
- `PL.BLOCKED` lists spellings and `PL.BLOCKED_SOUNDS` lists sounds the page never shows to kids, from teachers or from tiles kids tap. Sounds count because Blend plays each tile, so "f · u · k" is stopped like "f · u · ck".

## Audio

Every tile's sound, word, keyword picture (apple, igloo…), and sentence plays from a clip in `assets/audio/`. Tiles that say the same sound share a clip (c, k and ck; ai, ay and a_e). The page doesn't rely on the computer's built-in voice, so it sounds the same in Chrome, Edge, Firefox, and Safari on any system. Built-in voices also differ by computer, can't say a letter sound on its own, and on some Macs they pop loudly each time they start. The built-in voice is used only if a clip fails to load, and for teacher-made words that have no clip.

**The clips are computer-generated**, with the "Heart" voice of Kokoro-82M, an open-source voice model (Apache-2.0, no limits on the audio it makes). Letter sounds, words and keywords were made ahead of time from exact phonemes, so "cit" is always /kĭt/ and every short o is the "ah" in dot. Sentences use Kokoro's dictionary, with the lesson word forced to match its word clip. No AI runs in the browser. When a teacher records a letter sound or word, their recording plays instead. `../../tools/voice/README.md` explains how the clips were made and checked, and `assets/audio/README.md` lists every clip.

- Clips are MP3: letter sounds at 128 kbps, everything else at 96. Letter sounds get more bits because their bursts and hisses smear at lower bitrates.
- Remake the clips with the `voice` skill (`.claude/skills/voice/SKILL.md` at the repo root): the owner picks every letter sound by ear on the run's listen page, then the MP3s are copied in and `node tools/build-audio.js` is run.
- Replace one clip: save an `.mp3` at the same bitrate with the same name, then run `node tools/build-audio.js`.
- Each clip ships as a small `.js` file next to the audio, because the security policy (`connect-src 'none'`) stops scripts from downloading files. Only the `.js` files need to be deployed.
