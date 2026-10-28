# Letter Chains · Primary Labs

A 1st-grade letter-chaining page for **short a, short i, short o, t, d, c, g, n**.
It is aligned to NYS Next Generation ELA standards:

- **1RF2b**: Orally produce single-syllable words by blending sounds (phonemes), including consonant blends.
- **1RF2c**: Isolate and pronounce initial, medial vowel, and final sounds (phonemes) in spoken single-syllable words.

## What's inside

| Area | What kids and teachers do |
| --- | --- |
| **Meet the Sounds** | Picture cards for each letter (apple, igloo, octopus, top, duck, cup, goat, nest). Tap a card to hear the sound (the teacher's recording if there is one), then its picture word ("/ă/ … apple"). |
| **Letter Chains** | Five built-in chains (for example cat → cot → dot → dog → dig → did → dad). Kids hear the new word, tap the tile that changes (beginning, middle, or end), then tap the new letter. "Blend it" lights and says each sound, then sweeps so kids say the word fast on their own. |
| **Sound Spy** | Nine quick rounds: "Where do you hear /t/?" Kids tap beginning, middle, or end. |
| **Teacher Corner** | Press and hold to open. Record your voice for every sound and word, choose how long recordings are kept, make custom chains, and read the standards notes and a 5-minute routine. |

## Running it

No build step and no dependencies. Either:

- open `index.html` in a browser, or
- serve the folder: `python3 -m http.server 8000`, then visit http://localhost:8000

Recording needs a secure page: **https://** or **localhost**. Any static host works (GitHub Pages, Netlify, a school web server).

## Teacher voice recordings: privacy

- Recordings are stored only in the browser's IndexedDB on that device. Nothing is uploaded.
- The page's Content-Security-Policy sets `connect-src 'none'`, so no script can send data anywhere. Fonts are hosted with the site, so the page makes no third-party requests.
- Recordings expire automatically: **until the tab closes**, **1 day**, or **7 days** (default). Expired clips are deleted on load, every minute, and when the tab comes back into view.
- The microphone is requested only when Record is pressed, and it is released as soon as recording stops. Each recording stops on its own after 4 seconds.
- Clips are trimmed of silence and leveled, so blended sounds line up neatly.
- "Delete all recordings" clears everything. On shared computers, choose "Until this tab closes".

## Files

```
index.html            page shell and static content
css/styles.css        styles (Andika font: single-story a and g for early readers)
js/data.js            letters, words, sentences, chains, chain validation
js/art.js             hand-drawn SVG pictures
js/pictures.js        a picture for any word: drawing, emoji, word card, or made-up creature
js/voice-store.js     IndexedDB storage with expiry
js/recorder.js        microphone recording, trimming, and WAV encoding
js/sound.js           playback: teacher voice first, then the bundled clips
js/app.js             views and activities
assets/fonts/         Andika (SIL Open Font License)
assets/audio/         clips for every letter sound, word, keyword, and sentence (see its README)
tools/build-audio.js  wraps each clip in the .js file the page loads
tools/voice/          makes the clips with the Kokoro voice model (see its README)
```

## Editing content

- **Chains**: edit `PL.CHAINS` in `js/data.js`. Each step must change exactly one letter. Teachers can also add chains in Teacher Corner; those are saved in their own browser only.
- **Words and sentences**: edit `PL.WORDS`. The `art` field is optional; words without a picture show the word itself. After changing a sentence, update its clip in `assets/audio/sentences/`.
- **Custom words** can be 2 or 3 letters, using any letters. Each step changes one letter, so every word in a chain is the same length. Words outside the built-in set have no clip, so they use the teacher's recording, or the device's built-in voice if there isn't one. Letters outside the built-in set have no sound clip; without a recording, Blend pauses for them.
- **Pictures**: every word gets one from `js/pictures.js`. Words with a drawing in `js/art.js` use it, common words use an emoji (edit `EMOJI`), real words with no clear picture show a word card (edit `REAL`), and made-up words get a creature built from their letters. The same word always gets the same creature.
- `PL.BLOCKED` lists letter combinations the page never shows to kids, from teachers or from tiles kids tap.

## Audio

Every letter sound, word, keyword picture (apple, igloo…), and sentence plays from a clip in `assets/audio/`. The page doesn't rely on the computer's built-in voice, so it sounds the same in Chrome, Edge, Firefox, and Safari on any system. Built-in voices also differ by computer, can't say a letter sound on its own, and on some Macs they pop loudly each time they start. The built-in voice is used only if a clip fails to load, and for teacher-made words that have no clip.

**The clips are computer-generated**, with the "Heart" voice of Kokoro-82M, an open-source voice model (Apache-2.0, no limits on the audio it makes). They were made ahead of time from exact phonemes, so "cit" is always /kĭt/ and every short o is the "ah" in dot. No AI runs in the browser. When a teacher records a letter sound or word, their recording plays instead. `tools/voice/README.md` explains how the clips were made and checked, and `assets/audio/README.md` lists every clip.

- Remake the clips: see `tools/voice/README.md`, then copy the chosen voice's files in and run `node tools/build-audio.js`.
- Replace one clip: save a `.wav` or `.mp3` with the same name, then run `node tools/build-audio.js`.
- Each clip ships as a small `.js` file next to the audio, because the security policy (`connect-src 'none'`) stops scripts from downloading files. Only the `.js` files need to be deployed.
