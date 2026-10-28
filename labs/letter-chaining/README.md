# Letter Chains · Primary Labs

A 1st-grade letter-chaining page for **short a, short i, short o, t, d, c, g, n**.
It is aligned to NYS Next Generation ELA standards:

- **1RF2b**: Orally produce single-syllable words by blending sounds (phonemes), including consonant blends.
- **1RF2c**: Isolate and pronounce initial, medial vowel, and final sounds (phonemes) in spoken single-syllable words.

## What's inside

| Area | What kids and teachers do |
| --- | --- |
| **Meet the Sounds** | Picture cards for each letter (apple, igloo, octopus, top, duck, cup, goat, nest). Tap a card to hear it. |
| **Letter Chains** | Five built-in chains (for example cat → cot → dot → dog → dig → did → dad). Kids hear the new word, tap the tile that changes (beginning, middle, or end), then tap the new letter. "Blend it" lights each sound, then sweeps so kids say the word fast on their own. |
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
assets/audio/         recorded clips for every word, keyword, and sentence (see its README)
tools/                scripts that make and wrap the audio clips
```

## Editing content

- **Chains**: edit `PL.CHAINS` in `js/data.js`. Each step must change exactly one letter. Teachers can also add chains in Teacher Corner; those are saved in their own browser only.
- **Words and sentences**: edit `PL.WORDS`. The `art` field is optional; words without a picture show the word itself. After changing a sentence, update its clip in `assets/audio/sentences/`.
- **Custom words** can be 2 or 3 letters, using any letters. Each step changes one letter, so every word in a chain is the same length. Words outside the built-in set have no clip, so they use the teacher's recording, or the computer's voice if there isn't one.
- **Pictures**: every word gets one from `js/pictures.js`. Words with a drawing in `js/art.js` use it, common words use an emoji (edit `EMOJI`), real words with no clear picture show a word card (edit `REAL`), and made-up words get a creature built from their letters. The same word always gets the same creature.
- `PL.BLOCKED` lists letter combinations the page never shows to kids, from teachers or from tiles kids tap.

## Audio

Every word, keyword picture (apple, igloo…), and sentence plays from a recorded clip in `assets/audio/`. The page doesn't rely on the computer's built-in voice, so it sounds the same in Chrome, Edge, Firefox, and Safari on any system. Built-in voices also differ by computer, and on some Macs they pop loudly each time they start. The built-in voice is used only if a clip fails to load.

**The current clips are placeholders** made with the macOS voice. Apple's license limits that voice to personal, non-commercial use, so replace them with human recordings before shipping. `assets/audio/README.md` lists every clip and what to say.

- Replace a clip: save a `.wav` or `.mp3` with the same name, then run `node tools/build-audio.js`.
- Remake all placeholders (macOS only): `node tools/make-placeholder-audio.js`.
- Each clip ships as a small `.js` file next to the audio, because the security policy (`connect-src 'none'`) stops scripts from downloading files. Only the `.js` files need to be deployed.
