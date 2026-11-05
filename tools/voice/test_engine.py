"""Tests for engine.py's MP3 export. Run from this folder: python -m unittest"""
import os
import tempfile
import unittest

import numpy as np
import soundfile as sf

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


if __name__ == '__main__':
    unittest.main()
