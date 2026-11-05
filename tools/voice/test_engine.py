"""Tests for engine.py (MP3 export, run folders, model lookup) and save_masters.py. Run from this folder: python -m unittest"""
import os
import tempfile
import unittest

import numpy as np
import soundfile as sf

import engine
import save_masters
from engine import SR, mp3_kbps, to_mp3


class ToMp3(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        t = np.arange(int(0.4 * SR)) / SR
        x = 0.3 * np.sin(2 * np.pi * 220 * t) + 0.05 * np.random.default_rng(0).standard_normal(len(t))
        self.wav = os.path.join(self.dir.name, 'clip.wav')
        sf.write(self.wav, x.astype('float32'), SR, subtype='PCM_16')

    def tearDown(self):
        self.dir.cleanup()

    def test_writes_the_asked_bitrate_and_keeps_the_length(self):
        for kbps in (64, 96, 128):
            mp3 = os.path.join(self.dir.name, 'clip-%d.mp3' % kbps)
            to_mp3(self.wav, mp3, kbps)
            self.assertEqual(mp3_kbps(mp3), kbps)
            self.assertEqual(len(sf.read(mp3)[0]), len(sf.read(self.wav)[0]))

    def test_refuses_other_bitrates(self):
        with self.assertRaises(ValueError):
            to_mp3(self.wav, os.path.join(self.dir.name, 'x.mp3'), 112)



class Places(unittest.TestCase):
    def test_runs_and_masters_live_outside_the_repo(self):
        repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.assertEqual(engine.run_dir('letter-chains'), os.path.join(engine.RUNS, 'letter-chains'))
        self.assertFalse(engine.RUNS.startswith(repo))
        self.assertFalse(engine.MASTERS.startswith(repo))

    def test_a_missing_model_stops_with_the_download_command(self):
        with self.assertRaises(SystemExit) as e:
            engine.find_model('nobody/no-such-model', ['model.bin'])
        self.assertIn("hf download nobody/no-such-model --include 'model.bin'", str(e.exception))

    def test_a_missing_file_of_a_cached_model_stops_too(self):
        with self.assertRaises(SystemExit) as e:
            engine.find_model(engine.KOKORO, ['voices/no_such_voice.pt'])
        self.assertIn('voices/no_such_voice.pt', str(e.exception))


class Masters(unittest.TestCase):
    def test_keeps_only_clips_whose_mp3_the_lab_ships(self):
        lab = os.path.join(save_masters.REPO, 'labs', 'story-puzzles', 'assets', 'audio', 'phrases')
        shipped = sorted(f for f in os.listdir(lab) if f.endswith('.mp3'))[:2]
        with tempfile.TemporaryDirectory() as vdir:
            os.makedirs(os.path.join(vdir, 'phrases'))
            os.makedirs(os.path.join(vdir, 'wav'))
            for f in shipped:
                with open(os.path.join(lab, f), 'rb') as src, open(os.path.join(vdir, 'phrases', f), 'wb') as dst:
                    dst.write(src.read())
                open(os.path.join(vdir, 'wav', f[:-4] + '.wav'), 'wb').close()
            with open(os.path.join(vdir, 'phrases', shipped[1]), 'ab') as changed:
                changed.write(b'x')  # no longer the shipped MP3
            got = save_masters.shipped_masters('story-puzzles', vdir)
        self.assertEqual([arc for arc, _ in got], ['phrases/%s.wav' % shipped[0][:-4]])

    def test_zip_names_never_overwrite(self):
        with tempfile.TemporaryDirectory() as d:
            first = save_masters.zip_path('monster-math', '2026-11-04', d)
            open(first, 'w').close()
            self.assertTrue(save_masters.zip_path('monster-math', '2026-11-04', d).endswith('-2026-11-04-2.zip'))


if __name__ == '__main__':
    unittest.main()
