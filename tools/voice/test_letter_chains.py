"""Tests for letter_chains.py's picks, take names, lengthening and listen page. Run from this folder: python -m unittest"""
import contextlib
import io
import json
import os
import tempfile
import unittest

import numpy as np
import soundfile as sf

import letter_chains as LC
import phonemes as P
from engine import SR, mp3_kbps

LAB_AUDIO = os.path.join(LC.LAB, 'assets', 'audio')


def noise(ms, seed=0):
    return (0.1 * np.random.default_rng(seed).standard_normal(int(SR * ms / 1000))).astype('float32')


def repeats(x, lo_ms=20):
    """Highest normalized autocorrelation at lags past lo_ms: near 1 when the signal repeats itself."""
    x = x - x.mean()
    f = np.fft.rfft(x, 2 * len(x))
    ac = np.fft.irfft(f * np.conj(f))[:len(x)]
    ac /= ac[0]
    return float(ac[lo_ms * SR // 1000: len(x) // 2].max())


class Sources(unittest.TestCase):
    def test_every_take_of_a_sound_gets_its_own_file(self):
        for s in P.SOUNDS:
            srcs = s['sources'] + [x + sign + str(o) for x in s['sources']
                                   for sign, key in (('~', 'trace_options'), ('=', 'length_options'), ('^', 'boost_options'))
                                   for o in s.get(key, [])]
            srcs += [x + ''.join('%s%d' % (sign, c[k]) for sign, k in LC.OPTION.items() if k in c)
                     for x in s['sources'] for c in s.get('option_sets', [])]
            tags = [LC.take_tag(x) for x in srcs]
            self.assertEqual(len(set(tags)), len(tags), s['id'])

    def test_cut_options(self):
        self.assertEqual(LC.src_core('vˈæn+v10#2=200^6'), 'vˈæn+v10#2')
        self.assertEqual(LC.src_options('vˈæn+v10#2=200^6'), {'target_ms': 200, 'boost_db': 6})
        self.assertEqual(LC.src_options('dˈʌt~50'), {'trace_ms': 50})
        self.assertEqual(LC.parse_src('vˈæn+v10@0.8#2=200'), ('vˈæn', 0.8))
        v = next(s for s in P.SOUNDS if s['id'] == 'v')
        p = LC.picked_spec(v, 'vˈæn+v8=200^6')
        self.assertEqual((p['sources'], p['target_ms'], p['boost_db'], p['length_options']), (['vˈæn+v8'], 200, 6, []))

    def test_held_sources(self):
        self.assertEqual(LC.parse_src('vˈæn+v10@0.9#2~30'), ('vˈæn', 0.9))
        self.assertEqual(LC.hold_of('vˈæn+v10@0.9#2'), {0: 10})
        self.assertEqual(LC.hold_of('hˈæd+æ8'), {2: 8})
        self.assertIsNone(LC.hold_of('hˈæd@0.6#2'))
        self.assertEqual(LC.parse_src('hˈæd@0.6#2'), ('hˈæd', 0.6))

    def test_every_source_uses_symbols_kokoro_knows(self):
        import engine
        with open(os.path.join(engine.find_model(engine.KOKORO, ['config.json']), 'config.json')) as f:
            known = set(json.load(f)['vocab'])
        for s in P.SOUNDS:
            for src in s['sources']:
                ps, _ = LC.parse_src(src)
                self.assertFalse(set(ps) - known, '%s: %r' % (s['id'], src))
        for name, alts in P.WHOLE_MORE.items():
            for ps in alts:
                self.assertFalse(set(ps) - known, '%s: %r' % (name, ps))

    def test_how_a_take_was_made(self):
        self.assertEqual(LC.take_how('sounds', 'v', 'vˈæn+v10'), 'held by Kokoro')
        self.assertEqual(LC.take_how('sounds', 'a', 'hˈæd@0.35#2'), 'from a slowed word')
        self.assertEqual(LC.take_how('sounds', 'a', 'ˈæ'), 'said on its own')
        self.assertEqual(LC.take_how('sounds', 'j', 'ʤˈɑb@0.8~70'), 'from a slowed word, cut 70 ms later')
        self.assertEqual(LC.take_how('sounds', 'v', 'vˈæn+v10=200^6'), 'held by Kokoro, 200 ms long, more hiss (+6 dB)')
        self.assertEqual(LC.take_how('words', 'cake', 'dot2'), 'written as usual')
        self.assertEqual(LC.take_how('words', 'cake', 'kʰeɪk_iso'), 'written as kʰeɪk')
        self.assertEqual(LC.take_how('sounds', 'oi', 'ʔY_dot'), 'written as ʔY')
        self.assertEqual(LC.take_label('words', 'cake', 'dot2'), 'written as usual, with a full stop (dot2)')
        self.assertEqual(LC.take_label('words', 'cake', 'kʰA:k_dot_slow'), 'written as kʰA:k, a little slower (kʰA:k_dot_slow)')
        self.assertEqual(LC.take_label('sounds', 'v', 'vˈæn+v10'), 'held by Kokoro: vˈæn+v10')


class Picks(unittest.TestCase):
    def test_parse_the_whole_box(self):
        box = 'sounds/d=dˈʌt~50, words/cake=kʰeɪk_iso\nKeep the live clip: sounds/b, sounds/a\nNone sound right: sounds/r'
        self.assertEqual(LC.parse_box(box), ([('sounds', 'd', 'dˈʌt~50'), ('words', 'cake', 'kʰeɪk_iso')],
                                             ['sounds/b', 'sounds/a'], ['sounds/r']))
        self.assertEqual(LC.parse_box('No new takes picked.\nKeep the live clip: sounds/b'), ([], ['sounds/b'], []))

    def test_other_spellings(self):
        self.assertEqual(LC.alt_label('kʰˈeɪk'), 'kʰeɪk_')
        self.assertEqual(LC.alt_spellings('words', 'cake'), P.WORD_MORE['cake'])
        self.assertEqual(LC.alt_spellings('sounds', 'oi'), P.WHOLE_MORE['oi'])
        self.assertTrue(LC.picked_spelling_of('cake', 'kʰeɪk_iso'))
        self.assertFalse(LC.picked_spelling_of('cake', 'dot2'))

    def test_parse(self):
        self.assertEqual(LC.parse_picks('sounds/d=dˈʌt~50, words/pin=dot2'),
                         [('sounds', 'd', 'dˈʌt~50'), ('words', 'pin', 'dot2')])
        for bad in ('d=dˈʌt', 'sounds/d', 'songs/d=x'):
            with self.assertRaises(ValueError):
                LC.parse_picks(bad)

    def test_every_pick_names_a_real_take(self):
        sounds = {s['id']: s for s in P.SOUNDS}
        kinds = [k for k, _, _ in LC.WORD_TAKES]
        for cid, kind in P.PICKED.items():
            group, name = cid.split('/')
            if group == 'sounds' and name in sounds:
                LC.picked_spec(sounds[name], kind)  # raises if it isn't one of the sound's sources
            else:
                alts = [LC.alt_label(a) for a in LC.alt_spellings(group, name)]
                base = kind.replace('_trim', '')
                self.assertTrue(base in kinds or any(base.startswith(a) and base[len(a):] in kinds for a in alts), cid)

    def test_picked_spec_makes_one_source(self):
        d = next(s for s in P.SOUNDS if s['id'] == 'd')
        p = LC.picked_spec(d, 'dˈʌt~50')
        self.assertEqual((p['sources'], p['trace_options'], p['trace_ms']), (['dˈʌt'], [], 50))
        with self.assertRaises(ValueError):
            LC.picked_spec(d, 'nothing')

    def test_ship_picks_puts_the_exact_take_in_place(self):
        with tempfile.TemporaryDirectory() as out:
            vdir, tdir = os.path.join(out, 'af_heart'), os.path.join(out, 'takes', 'af_heart')
            take = LC.take_file(tdir, 'sounds', 'd', 'dˈʌt~50')
            os.makedirs(os.path.dirname(take))
            sf.write(take, noise(120), SR, subtype='PCM_16')
            os.makedirs(vdir)
            with open(os.path.join(vdir, 'manifest.json'), 'w') as f:
                json.dump({'to_hear': ['sounds/d', 'sounds/b', 'sounds/r'], 'on_page': {'sounds/r': ['ɹˈɛd+ɹ8']},
                           'clips': [{'id': 'sounds/d', 'group': 'sounds', 'name': 'd', 'take': 'ˈæd', 'status': 'check',
                                      'takes': [{'kind': 'dˈʌt~50', 'score': 1, 'reasons': ['weak burst']}]}]}, f)
            with contextlib.redirect_stdout(io.StringIO()) as said:
                LC.ship_picks(out, 'af_heart', 'sounds/d=dˈʌt~50\nKeep the live clip: sounds/b\nNone sound right: sounds/r')
            self.assertIn("'sounds/d': 'dˈʌt~50',", said.getvalue())
            with open(take, 'rb') as a, open(os.path.join(vdir, 'sounds', 'd.wav'), 'rb') as b:
                self.assertEqual(a.read(), b.read())
            self.assertEqual(mp3_kbps(os.path.join(vdir, 'sounds', 'd.mp3')), 128)
            with open(os.path.join(vdir, 'manifest.json')) as f:
                entry = json.load(f)['clips'][0]
            self.assertEqual((entry['take'], entry['status'], entry['reasons']), ('dˈʌt~50', 'picked', ['weak burst']))
            with open(os.path.join(vdir, 'manifest.json')) as f:
                m = json.load(f)
            self.assertEqual(m['to_hear'], ['sounds/r'])  # picked and kept clips leave the page
            self.assertEqual(m['rejected'], {'sounds/r': ['ɹˈɛd+ɹ8']})  # what they turned down won't come back
            self.assertTrue(os.path.exists(os.path.join(vdir, 'listen.html')))

    def test_ship_picks_stops_on_a_missing_take(self):
        with tempfile.TemporaryDirectory() as out:
            os.makedirs(os.path.join(out, 'af_heart'))
            with open(os.path.join(out, 'af_heart', 'manifest.json'), 'w') as f:
                json.dump({'clips': []}, f)
            with self.assertRaises(SystemExit), contextlib.redirect_stdout(io.StringIO()):
                LC.ship_picks(out, 'af_heart', 'sounds/d=dˈʌt~50')


class Lengthening(unittest.TestCase):
    def test_hiss_extend_never_repeats(self):
        seg = noise(110)
        y = LC.hiss_extend(seg, int(0.34 * SR), seed=1)
        self.assertEqual(len(y), int(0.34 * SR))
        np.testing.assert_array_equal(y[:len(seg) - 60 * SR // 1000], seg[:len(seg) - 60 * SR // 1000])
        self.assertLess(repeats(y), 0.3)
        # joining copies, as the hiss used to be lengthened, repeats almost exactly
        self.assertGreater(repeats(np.concatenate([seg, seg, seg])), 0.6)

    def test_hiss_extend_keeps_the_spectrum(self):
        seg = noise(150)
        seg = np.convolve(seg, np.ones(8) / 8, mode='same').astype('float32')  # a low, dull hiss
        y = LC.hiss_extend(seg, int(0.4 * SR), seed=2)
        self.assertLess(abs(LC.centroid_hz(y[-int(0.2 * SR):]) - LC.centroid_hz(seg)), 300)

    def test_mixed_extend_length(self):
        t = np.arange(int(0.15 * SR)) / SR
        seg = (0.3 * np.sin(2 * np.pi * 200 * t) + noise(150)).astype('float32')
        self.assertEqual(len(LC.mixed_extend(seg, int(0.32 * SR), 0.32 / 0.15, seed=3)), int(0.32 * SR))


class ListenPage(unittest.TestCase):
    def setUp(self):
        self.out = tempfile.mkdtemp()
        self.vdir, tdir = os.path.join(self.out, 'af_heart'), os.path.join(self.out, 'takes', 'af_heart')
        kinds = ['vˈæn+v10', 'vˈæn+v8', 'vˈæn+v8=200', 'vˈæn+v8^6', 'ˈʌv@0.7', 'ˈʌv', 'zˈæp@0.5']
        for k in kinds:
            f = LC.take_file(tdir, 'sounds', 'v', k)
            os.makedirs(os.path.dirname(f), exist_ok=True)
            sf.write(f, noise(100), SR)
        self.made = [{'id': 'sounds/v', 'group': 'sounds', 'name': 'v', 'text': '/v/', 'take': 'vˈæn+v10', 'reasons': [],
                      'takes': [{'kind': k, 'score': 10 - i, 'reasons': []} for i, k in enumerate(kinds)]
                      + [{'kind': 'gone', 'reasons': ['no usable cut']}]},
                     {'id': 'sounds/v-long', 'group': 'sounds', 'name': 'v-long', 'takes': []},
                     {'id': 'words/ship', 'group': 'words', 'name': 'ship', 'status': 'pass', 'takes': []}]

    def tearDown(self):
        import shutil
        shutil.rmtree(self.out)

    def test_live_clip_and_a_few_takes_each_made_a_different_way(self):
        page, shown = LC.listen_page(self.made, self.vdir, 'af_heart')
        self.assertIn('Live clip', page)
        self.assertTrue(os.path.exists(os.path.join(self.vdir, 'live', 'sounds', 'v.mp3')))
        self.assertEqual(len(shown['sounds/v']), LC.LISTEN_TAKES)
        self.assertEqual(shown['sounds/v'], ['vˈæn+v10', 'vˈæn+v8=200', 'vˈæn+v8^6', 'ˈʌv@0.7'])  # one per way
        self.assertNotIn('<details>', page)
        self.assertIn('None of these sound right', page)
        self.assertNotIn('v-long', page)
        self.assertNotIn('words/ship', page)  # passed, and the run wasn't asked for it by name
        self.assertIn('words/ship', LC.listen_page(self.made, self.vdir, 'af_heart', every=True)[0])
        self.assertNotIn('<script src', page)

    def test_rejected_takes_never_come_back(self):
        _, first = LC.listen_page(self.made, self.vdir, 'af_heart')
        _, second = LC.listen_page(self.made, self.vdir, 'af_heart', rejected=first)
        self.assertFalse(set(first['sounds/v']) & set(second['sounds/v']))
        self.assertEqual(second['sounds/v'], ['vˈæn+v8', 'ˈʌv', 'zˈæp@0.5'])
        page, third = LC.listen_page(self.made, self.vdir, 'af_heart',
                                     rejected={'sounds/v': first['sounds/v'] + second['sounds/v']})
        self.assertEqual(third['sounds/v'], [])
        self.assertIn('the way it is made needs to change', page)


if __name__ == '__main__':
    unittest.main()
