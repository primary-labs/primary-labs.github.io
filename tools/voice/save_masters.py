#!/usr/bin/env python3
"""Primary Labs · keep the WAV masters of the clips a lab ships.

    python save_masters.py letter-chains|monster-math|story-puzzles [--run DIR] [--voice af_heart]

Run it after copying a run's clips into the lab. It zips the WAV master of every clip in the run folder
whose MP3 is the one the lab ships now (the same bytes), with the run's manifest.json, into
~/Documents/Primary Labs audio/masters/<lab>-<date>.zip. Each zip holds what shipped that day.

Run folders are reused, so the next run overwrites them. Letter sounds never come out the same twice,
so these WAVs are the only way back to the exact audio. Monster Math and Story Puzzles come out the
same each time with the same versions, but their masters are kept the same way.
"""
import argparse
import os
import sys
import time
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from engine import MASTERS, run_dir, sha  # noqa: E402

# lab -> (folder under labs/, [(name in the zip, WAV folder in the run, MP3 folder in the run, lab folder)])
LABS = {
    'letter-chains': ('letter-chaining', [(g, g, g, g) for g in ('sounds', 'keywords', 'words', 'sentences')]),
    'monster-math': ('monster-math', [('phrases', 'wav', 'phrases', 'phrases')]),
    'story-puzzles': ('story-puzzles', [('phrases', 'wav', 'phrases', 'phrases')]),
    # Only the directions: Sound Boxes' letter sounds and words are Letter Chains' clips.
    'sound-boxes': ('sound-boxes', [('phrases', 'wav', 'phrases', 'phrases')]),
}


def shipped_masters(lab, vdir):
    """(path in the zip, WAV path) for every clip in the run whose MP3 the lab ships now."""
    folder, groups = LABS[lab]
    audio = os.path.join(REPO, 'labs', folder, 'assets', 'audio')
    out = []
    for name, wav_dir, mp3_dir, lab_dir in groups:
        src = os.path.join(vdir, mp3_dir)
        if not os.path.isdir(src):
            continue
        for f in sorted(os.listdir(src)):
            if not f.endswith('.mp3'):
                continue
            mine, theirs = os.path.join(src, f), os.path.join(audio, lab_dir, f)
            wav = os.path.join(vdir, wav_dir, f[:-4] + '.wav')
            if os.path.exists(theirs) and os.path.exists(wav) and sha(mine) == sha(theirs):
                out.append(('%s/%s.wav' % (name, f[:-4]), wav))
    return out


def zip_path(lab, day, folder=MASTERS):
    path = os.path.join(folder, '%s-%s.zip' % (lab, day))
    n = 2
    while os.path.exists(path):
        path = os.path.join(folder, '%s-%s-%d.zip' % (lab, day, n))
        n += 1
    return path


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('lab', choices=sorted(LABS))
    ap.add_argument('--run', help='run folder (default: ~/Documents/Primary Labs audio/runs/<lab>)')
    ap.add_argument('--voice', default='af_heart')
    args = ap.parse_args()
    vdir = os.path.join(args.run or run_dir(args.lab), args.voice)
    clips = shipped_masters(args.lab, vdir)
    if not clips:
        sys.exit('Nothing in %s matches what the lab ships. Copy the clips into the lab first.' % vdir)
    os.makedirs(MASTERS, exist_ok=True)
    path = zip_path(args.lab, time.strftime('%Y-%m-%d'))
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for arc, wav in clips:
            z.write(wav, arc)
        manifest = os.path.join(vdir, 'manifest.json')
        if os.path.exists(manifest):
            z.write(manifest, 'manifest.json')
    print('Saved %d masters to %s (%.1f MB)' % (len(clips), path, os.path.getsize(path) / 1e6))


if __name__ == '__main__':
    main()
