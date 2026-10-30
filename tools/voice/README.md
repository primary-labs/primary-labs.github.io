# Default voice (Kokoro)

Makes the default audio clips for every lab with Kokoro-82M, an open-source voice model (Apache-2.0
code and weights, no limits on the audio it makes). Both labs use its "Heart" voice (`af_heart`).
It runs on a Mac at build time. Nothing here ships to the browser: the pages only play the finished
files, so no AI runs in the classroom.

Teacher recordings still win. These clips replace the device's built-in voice, which differs by
computer and can't say a letter sound on its own, and the macOS "Samantha" clips used during
development, which Apple's license does not allow on a public site.

```
engine.py              the Kokoro model, and the trim, level and save helpers both labs use
qa.py                  automatic checks: phoneme recognizers and acoustic measurements
letter_chains.py       Letter Chains: letter sounds, words, keywords, sentences
phonemes.py            Letter Chains' exact phonemes
monster_math.py        Monster Math: every spoken line
test_monster_math.py   tests for Monster Math's word check
requirements.txt       pinned versions
```

## Set up

```sh
# Python 3.12 virtual environment (install through your package scanner if you use one)
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python -m unittest     # tests
```

The first run downloads the Kokoro weights (about 330 MB) from Hugging Face. Monster Math's review also
downloads Whisper (about 1 GB) and wav2vec2-espeak (about 1.3 GB).

## Letter Chains

### Why phonemes, not spelling

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
  - Praat's PSOLA gives slightly different audio each time, so letter sounds (and the stops, whose
    level follows the vowels) never come out byte for byte the same twice. Words, keywords and
    sentences do.

### Checks

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

### Run it

```sh
# Optional recognizer models for the checks
#   ZIPA-CR small:   https://huggingface.co/anyspeech/zipa-small-crctc-500k  (CC BY 4.0)
#   wav2vec2-espeak: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft  (Apache-2.0)

python letter_chains.py --out /tmp/voice-pack \
  --voices af_heart,af_nicole,am_michael \
  --zipa path/to/zipa-small-crctc-500k --w2v2 path/to/wav2vec2-lv-60-espeak-cv-ft
```

Content comes straight from `labs/letter-chaining/js/data.js`, so new words and sentences are picked
up automatically; letter sounds and keywords are listed in `phonemes.py`.

Output for each voice: `words/`, `keywords/`, `sentences/` (same names as the lab's `assets/audio/`),
`sounds/<letter>.wav` and `sounds/<letter>-long.wav`, and `manifest.json`. Every take that was
tried is kept under `takes/` for comparison.

### Shipping a voice

The lab ships `af_heart` ("Heart"). To update it, copy the voice's `words/`, `keywords/` and
`sentences/` WAVs over the files in `labs/letter-chaining/assets/audio/`, and its
`sounds/<letter>.wav` files (not the `-long` ones, which the page doesn't use yet) into
`assets/audio/sounds/`. Then run `node tools/build-audio.js` from the lab's folder. Listen to every
clip marked `check` in `manifest.json` first.

## Monster Math

Every line comes from `labs/monster-math/tools/list-phrases.js`, the same list the page uses, so new
lines are picked up automatically: counts ("three"), problems ("three plus two"), answers ("Yes!
Three plus two is five!") and instructions.

### Why the dictionary is enough here

Monster Math has no letter sounds or made-up words, so ordinary pronunciation is right, and lines go
through Kokoro's dictionary. As in Letter Chains, a word the dictionary doesn't know stops the build
instead of being guessed. Words said another way are listed in `SAY_AS`:

- "X" is said as "ex". The dictionary reads "X." as an abbreviation and drops the pause after it,
  so "That one has an X. Skip it." ran together. "ex" is the same /ˈɛks/ and keeps the pause.
- "and" is stressed. Unstressed, "One and four make five!" was heard as "One in four".
- Lines without end punctuation ("three", "three plus two") are said with a full stop, so every
  count and problem ends the same way.
- Lines are said at speed 0.9, a little slower than Letter Chains, for kindergarten.

### Single words

Kokoro garbles a single short word: on its own, "two" came out as "ess-yoo" and "six" as "sex", whatever
the seed, speed or punctuation. So one-word lines (the counts) are said after a carrier sentence, "The
word is.", and cut out at the pause the full stop gives, as Letter Chains does. That way all eleven
counts came out clean, and they are all made the same way. Longer lines try the carrier when the
plain take fails.

### Extra sounds at the edges

Kokoro sometimes adds a short sound at the edge of a line, most often on short ones:

- a voiced "uh" before a first s, f or th ("uh-six", heard as "a seven");
- an "uh" after a last s ("six-uh");
- a hiss after a last voiced sound ("nine-ss", heard as "nines").

`clean_edges` finds these from the line's first and last sound and the audio around them (hiss is
high-pitched noise with no voicing; "uh" is voiced and low-pitched), and cuts them with a short fade.
A last v, z or th keeps 100 ms of hiss, because those end with a little hiss in normal speech (a
shorter cut lost the v of "five"). A last stop (t, d, k, g, p, b) or j is left alone, because its
release is a burst of noise, and a last ch is treated like s. The cuts are listed for each clip in
`manifest.json` and on `listen.html`.

### The review

Every clip is reviewed automatically, so a person only listens to the few it can't clear:

- **Words.** Whisper (`openai/whisper-small.en`, MIT, about 1 GB) writes down the words it hears,
  and they must match the line. Digits, signs, punctuation and words that sound the same ("to"/"two",
  "ex"/"X") don't count as differences. Whisper guesses whole words, so it can hear "two" in a clip
  that sounds like "ess-yoo".
- **Sounds.** wav2vec2-espeak (`facebook/wav2vec2-lv-60-espeak-cv-ft`, Apache-2.0, about 1.3 GB)
  writes down the sounds it hears, with no dictionary to guess from, and they are lined up with the
  sounds Kokoro was asked for. It catches an extra sound before or after the line and a wrong sound
  in a number word. Ordinary variation is allowed: a swallowed unstressed vowel, a weak r after a
  vowel, a glottal catch, a sound shared by two words ("three equals").
- **Vowels.** On this voice the sound recognizer can't tell short i, e and a apart (it heard a real
  "tin" as "ten"), so in number words those vowels are measured (F1 and F2). The recognizer only finds
  where the vowel is. A count said on its own is compared with the same voice's own careful vowels in
  hid, head and had, made the same way. Inside a sentence vowels drift toward the middle, so there each
  number word is compared with the same word in the other lines instead: "seven" is in 67 of them, and
  a wrong vowel stands out from the rest. Its height (F1) must differ, since an odd F2 with a normal F1
  is the formant tracker slipping.
- **Glitches.** A pause anywhere but right after a word followed by punctuation (the sound recognizer
  gives the word positions), or any pause over 500 ms (the lines pause up to 330 ms); the sound cutting
  out (digital silence it drops into within a few samples); a loud click; a pitch jump (creaky voice at
  the end of a sentence reads as half the pitch, so that is left out).
- **Basics.** Not clipped, not cut off at the end, not whispered or breathy (harmonics-to-noise below
  5 dB over the voiced part, so the hissing sounds of "six" don't count), and no extra sound left at
  either edge.
- **Counts.** "zero" to "ten" are compared with each other: length, pitch, and a falling end. A count
  may be creaky (vocal fry) for at most 40% of the word; the counts run 0 to 34%, and "five" is the
  creakiest however it's made, least at 5% faster, which is how it ships.

A clip that fails is made again, up to seven takes (a new seed, the carrier, a 3% or 5% change in
speed; a new seed alone barely changes Kokoro's output). The best take is kept. A clip that still fails
is marked `check` in `manifest.json`, shown first on `listen.html`, and listed when the run ends. The
comparisons across lines (counts, vowels) run after every clip is made; remake a clip they flag with
`--only`, and it is checked against the others.

### How well the review works

The checks were tested on known-bad clips (made-up glitches added to good clips, real Kokoro defects
from earlier runs, and deliberately wrong vowels) and on the good clips:

| Test | Result |
| --- | --- |
| The 328 clips of the shipped run | 0 left for a person |
| 30 good clips, nothing added (false alarms) | 30 passed |
| Real Kokoro defects from earlier runs: "uh-six-uh", "a seven", "one-d", "uh-five", "nines", "ess-yoo" for two, a "five" that lost its v, "One in four" | 8 of 8 caught |
| Deliberately wrong vowels in number words: "sex", "tin" (alone and in sentences), "sivven" | 7 of 7 caught ("sivven" only just) |
| A 300 ms gap added mid-line | 30 of 30 caught |
| A 60 ms dropout | 29 of 30 caught (the miss zeroed a stretch already 31 dB below the loudest part) |
| A loud click (±0.8) | 30 of 30 caught |
| A quiet click (±0.1) | 0 of 30: it jumps less than a natural "s" does |
| An 80 ms stutter (a stretch said three times) | 12 of 30 caught |

Whisper alone would have passed "ess-yoo" for "two" and "zix" for "six"; the sound and vowel checks
caught them.

What they can't judge: whether the voice sounds warm and natural. A model that predicts how people
would rate naturalness (torchaudio's SQUIM) was tried and couldn't tell the bad clips from the good
ones, so it isn't used.

### Run it

```sh
python monster_math.py --out /tmp/monster-math-voice                      # every line
python monster_math.py --out /tmp/monster-math-voice --only n-3,skip      # some lines; the rest are kept
python monster_math.py --out /tmp/monster-math-voice --review             # check existing clips again
```

Use `--only` in the folder of a full run, so the new clips are compared with the other lines; it keeps
that run's speed. A full run takes about 10 minutes, and the same settings make the same clips.

Output for the voice: `phrases/<id>.mp3` (what ships: 64 kbps mono), `wav/<id>.wav` (24 kHz masters),
`manifest.json` (what was heard, check results, every take tried) and `listen.html`, a plain local
page that plays every clip with the ones to check first.

### Shipping

Make sure the run ends with no clips to check, or listen to the ones it lists. Copy `phrases/*.mp3`
into `labs/monster-math/assets/audio/phrases/`, then run `node tools/build-audio.js` from the lab's
folder. The lab's tests fail if any line has no clip.

## Telling schools

Tell schools the default voice is computer-generated. Kokoro's model card notes that part of its
training audio was made by commercial text-to-speech systems.
