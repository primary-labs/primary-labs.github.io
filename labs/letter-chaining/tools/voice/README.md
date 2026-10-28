# Default voice pack (Kokoro)

Makes the Letter Chains audio clips with Kokoro-82M, an open-source voice model (Apache-2.0 code
and weights, no limits on the audio it makes). It runs on a Mac at build time. Nothing here ships
to the browser: the page only plays the finished files, so no AI runs in the classroom.

Teacher recordings still win. These clips replace the device's built-in voice, which differs by
computer and can't say a letter sound on its own, and the macOS "Samantha" clips used during
development, which Apple's license does not allow on a public site.

## Why phonemes, not spelling

Words, keywords and letter sounds are made from exact phoneme strings (`phonemes.py`), never from
spelling:

- Each letter in the set maps to one sound: a /æ/, i /ɪ/, o /ɑ/, t /t/, d /d/, c /k/, g /ɡ/, n /n/.
  So "cit" is always /kɪt/ (never "sit"), "gic" is /ɡɪk/ (never "jick"), and "dog" has the same
  vowel as "dot".
- Sentences go through Kokoro's dictionary, with the lesson word forced to the same phonemes as its
  word clip, and "on" forced to the "ah" of dot. A word the dictionary doesn't know stops the build
  instead of being guessed. "ton" is the made-up word "tahn" and has no sentence.
- Kokoro silently drops symbols it doesn't know (a keyboard `g` just vanishes), so the script
  refuses any string with one. Use `ɡ` (U+0261) and `ˈ` (U+02C8).
- Lone letter sounds can't be asked for directly: every voice says "tuh" for /t/.
  - Stops are cut from a word: the release of a word ending in the sound, or for /t k/ the burst and
    breath before voicing at the start of a word, and for /d g/ the burst up to the first voicing
    pulse. They are set 8 dB below the same voice's vowel sounds, so they aren't lost or harsh.
  - Vowels and /n/ come from the steadiest part of the sound inside a word (sometimes said slower),
    lengthened with Praat's PSOLA into a short version (380 ms for vowels, 320 ms for /n/, plus a
    little silence at each end) and a held 700 ms version (not used by the lab yet), with a gentle
    one-semitone pitch fall. Kokoro can't hold a sound itself: stretched timings go silent.

## Checks

Each word is said seven ways: alone; with a full stop or "!"; with a full stop, a little slower and a
little faster; and, as fallbacks, cut out of "The word is ..." (said straight on, or after a full
stop for a real pause). Keywords are said the same ways. Every take is checked and the kept take is
the one with no hard problems, then the fewest phoneme problems, then the best score:

- hard problems: whispered or breathy (low voicing or harmonics-to-noise), clipping, a clip that
  ends mid-sound, leftover sound from the carrier phrase, or no real pause to cut at;
- phoneme problems: both recognizers (ZIPA and wav2vec2-espeak) hear a different consonant, or a
  different /ɪ/ or /ɑ/; the vowel is closer to another vowel of the same voice (F1/F2, only for
  vowel pairs that voice's own references keep apart); a first /t/ or /k/ isn't aspirated; a first
  /d/ or /g/ has a long gap before voicing (sounds like /t/ or /k/) or a loud hum before it; a first
  /n/ is faint; a final /t/ or /k/ release is faint, or a voiced "uh" follows it.

Recognizers have known biases on this audio, so their scores mostly rank takes; they only raise a
problem when both agree. Sentences are checked only at their edges. Clips with any problem are
marked `check` in `manifest.json`, with the reasons. Each voice's manifest also lists which vowel
comparisons its references could not support. A person still listens to every clip before it ships.

## Run it

```sh
# Python 3.12 virtual environment (install through your package scanner if you use one)
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt

# Optional recognizer models for the checks
#   ZIPA-CR small:   https://huggingface.co/anyspeech/zipa-small-crctc-500k  (CC BY 4.0)
#   wav2vec2-espeak: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft  (Apache-2.0)

.venv/bin/python generate.py --out /tmp/voice-pack \
  --voices af_heart,af_nicole,am_michael \
  --zipa path/to/zipa-small-crctc-500k --w2v2 path/to/wav2vec2-lv-60-espeak-cv-ft
```

The first run downloads the Kokoro weights (about 330 MB) from Hugging Face. Content comes straight
from `js/data.js`, so new words and sentences are picked up automatically; letter sounds and
keywords are listed in `phonemes.py`.

Output for each voice: `words/`, `keywords/`, `sentences/` (same names as `assets/audio/`),
`sounds/<letter>.wav` and `sounds/<letter>-long.wav`, and `manifest.json`. Every take that was
tried is kept under `takes/` for comparison.

## Shipping a voice

The lab ships `af_heart` ("Heart"). To update it, copy the voice's `words/`, `keywords/` and
`sentences/` WAVs over the files in `assets/audio/`, and its `sounds/<letter>.wav` files (not the
`-long` ones, which the page doesn't use yet) into `assets/audio/sounds/`. Then run
`node tools/build-audio.js`. Listen to every clip marked `check` in `manifest.json` first.

Tell schools the default voice is computer-generated. Kokoro's model card notes that part of its
training audio was made by commercial text-to-speech systems.
