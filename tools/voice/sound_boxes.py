#!/usr/bin/env python3
"""Primary Labs · Sound Boxes — make the spoken directions with Kokoro-82M.

    python sound_boxes.py [--out DIR] [--voice af_heart] [--speed 0.9] [--only ID,ID,...]
    python sound_boxes.py [--out DIR] --review [--only ID,ID,...]     check existing clips again

DIR defaults to ~/Documents/Primary Labs audio/runs/sound-boxes.

Only the directions are made here, from labs/sound-boxes/tools/list-phrases.js ("Which picture?",
"Tap a box for each sound." ...). They are ordinary words, so they go through Kokoro's dictionary
with Monster Math's pipeline and checks (monster_math.py), as in story_puzzles.py. Sound Boxes'
letter sounds and words are never made here: they are copied from Letter Chains
(labs/sound-boxes/tools/copy-clips.js), where the owner picked every letter sound by ear.

The dictionary already gives "box" and "boxes" the "ah" of dot (bˈɑks), so nothing is forced. A new
direction with a short o word needs the same check in manifest.json, and a FORCE table like
story_puzzles.py's if it comes out as "aw".

Writes the same files as monster_math.py: DIR/<voice>/phrases/<id>.mp3 (copy these into
labs/sound-boxes/assets/audio/phrases/), wav/, manifest.json and listen.html.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import monster_math as mm  # noqa: E402

mm.LAB = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'labs', 'sound-boxes')
mm.RUN_NAME = 'sound-boxes'
mm.__doc__ = __doc__

_listen_page = mm.listen_page


def listen_page(manifest):
    return _listen_page(manifest).replace('Monster Math', 'Sound Boxes')


mm.listen_page = listen_page

if __name__ == '__main__':
    mm.main()
