#!/usr/bin/env python3
"""Primary Labs · Story Puzzles — make the default-voice clips with Kokoro-82M.

    python story_puzzles.py --out DIR [--voice af_heart] [--speed 0.9] [--only ID,ID,...]
    python story_puzzles.py --out DIR --review [--only ID,ID,...]     check existing clips again

Every line comes from labs/story-puzzles/tools/list-phrases.js, the same list the page uses: each
story's six lines, "Let's read <title>.", and the directions. Story Puzzles has no letter sounds or made-up words,
so lines go through Kokoro's dictionary, exactly as in Monster Math. This script runs Monster Math's
pipeline (monster_math.py) on these lines: the same takes, edge cleaning, review (Whisper for the
words, wav2vec2-espeak for the sounds, glitch and basic checks), levels and MP3 settings, and the same
"and" said stressed so "Sid digs and digs" is never heard as "digs in digs".

FORCE sets a few words to exact phonemes in every line (any capitalization):
  - short o is the "ah" of dot, as the lab teaches it, so dog, dogs, log, frog, on and off are
    forced to /ɑ/ (the dictionary gives them the "aw" vowel; Letter Chains forces "on" the same way)
  - names the dictionary doesn't know: Sid, Kim

Writes the same files as monster_math.py: DIR/<voice>/phrases/<id>.mp3 (copy these into
labs/story-puzzles/assets/audio/phrases/), wav/, manifest.json and listen.html.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import monster_math as mm  # noqa: E402

mm.LAB = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'labs', 'story-puzzles')
mm.__doc__ = __doc__

# misaki symbols: stress mark ˈ before the vowel, ɡ is U+0261 (see phonemes.py)
FORCE = {
    'on': 'ˌɑn', 'off': 'ˈɑf',
    'dog': 'dˈɑɡ', 'dogs': 'dˈɑɡz', 'log': 'lˈɑɡ', 'frog': 'fɹˈɑɡ',
    'Sid': 'sˈɪd', 'Kim': 'kˈɪm',
}

_spoken = mm.spoken


def spoken(text):
    t = _spoken(text)
    for word, ps in FORCE.items():
        t = re.sub(r'(?<![\[\w])(%s)\b' % re.escape(word), lambda m, p=ps: '[%s](/%s/)' % (m.group(1), p), t,
                   flags=re.IGNORECASE)
    return t


mm.spoken = spoken

_listen_page = mm.listen_page


def listen_page(manifest):
    return _listen_page(manifest).replace('Monster Math', 'Story Puzzles')


mm.listen_page = listen_page

if __name__ == '__main__':
    mm.main()
