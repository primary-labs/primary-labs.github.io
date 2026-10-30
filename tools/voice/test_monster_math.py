"""Tests for monster_math.py. Run from this folder: python -m unittest"""
import unittest

import numpy as np

from monster_math import (breathy, clean_edges, creak_share, ctc_align, cut_after_gap, edge_problems, expected_phones, glitches,
                          nearest_vowel, number_outliers, phone_diffs, phone_problems, same_words, split_heard, spoken,
                          vowel_outliers)

SR = 24000


def glide(ms, f0_from, f0_to):
    """A vowel-like sound whose pitch moves smoothly from f0_from to f0_to."""
    n = int(SR * ms / 1000)
    f0 = np.linspace(f0_from, f0_to, n)
    phase = 2 * np.pi * np.cumsum(f0) / SR
    y = 0.3 * sum(np.sin(k * phase) / k for k in range(1, 6))
    f = int(0.005 * SR)  # 5 ms fades: an abrupt start or stop is itself a click
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y.astype('float32')


def voiced(ms, f0=180):
    """A vowel-like sound: harmonics of f0 up to 1 kHz."""
    t = np.arange(int(SR * ms / 1000)) / SR
    return (0.3 * sum(np.sin(2 * np.pi * f0 * k * t) / k for k in range(1, 1000 // f0 + 1))).astype('float32')


def hiss(ms, level=0.1, seed=0):
    """An "s"-like sound: noise above 4.5 kHz."""
    n = int(SR * ms / 1000)
    spec = np.fft.rfft(np.random.default_rng(seed).standard_normal(n))
    spec[np.fft.rfftfreq(n, 1 / SR) < 4500] = 0
    y = np.fft.irfft(spec, n)
    return (level * y / np.abs(y).max()).astype('float32')


def quiet(ms):
    return np.zeros(int(SR * ms / 1000), 'float32')


def join(*parts):
    return np.concatenate(parts)


class Edges(unittest.TestCase):
    def test_a_sound_before_a_first_s_is_cut(self):
        x = join(quiet(30), voiced(90), hiss(120), voiced(250), hiss(120), quiet(60))
        self.assertTrue(edge_problems(x, SR, 'sˈɪks.'))
        y, cuts = clean_edges(x, SR, 'sˈɪks.')
        self.assertEqual(edge_problems(y, SR, 'sˈɪks.'), [])
        self.assertAlmostEqual((len(x) - len(y)) / SR * 1000, 120, delta=25)
        self.assertEqual(len(cuts), 1)

    def test_a_sound_after_a_last_s_is_cut(self):
        x = join(quiet(30), hiss(120), voiced(250), hiss(120), voiced(90), quiet(60))
        self.assertTrue(edge_problems(x, SR, 'sˈɪks.'))
        y, cuts = clean_edges(x, SR, 'sˈɪks.')
        self.assertEqual(edge_problems(y, SR, 'sˈɪks.'), [])
        self.assertAlmostEqual((len(x) - len(y)) / SR * 1000, 135, delta=25)

    def test_a_hiss_after_a_last_n_is_cut(self):
        x = join(quiet(30), voiced(300), hiss(70, 0.2), quiet(60))
        self.assertTrue(edge_problems(x, SR, 'nˈIn.'))
        y, cuts = clean_edges(x, SR, 'nˈIn.')
        self.assertEqual(edge_problems(y, SR, 'nˈIn.'), [])

    def test_a_cut_end_fades_out_fully(self):
        import qa
        for x, ps in [(join(quiet(30), voiced(300), hiss(70, 0.2), quiet(60)), 'nˈIn.'),
                      (join(quiet(30), hiss(120), voiced(250), hiss(120), voiced(90), quiet(60)), 'sˈɪks.')]:
            y, cuts = clean_edges(x, SR, ps)
            self.assertTrue(cuts)
            self.assertEqual(qa.hygiene(y, SR)[1], [], 'the clip must not end mid-sound')

    def test_a_clean_line_is_left_alone(self):
        x = join(quiet(30), hiss(120), voiced(300), quiet(60))
        self.assertEqual(edge_problems(x, SR, 'sˈi.'), [])
        y, cuts = clean_edges(x, SR, 'sˈi.')
        self.assertEqual(cuts, [])
        self.assertTrue(np.array_equal(x, y))

    def test_a_line_that_starts_voiced_keeps_its_start(self):
        x = join(quiet(30), voiced(90), hiss(120), voiced(250), quiet(60))
        self.assertEqual(edge_problems(x, SR, 'jˈɛsi.'), [])
        y, cuts = clean_edges(x, SR, 'jˈɛsi.')
        self.assertEqual(cuts, [])

    def test_the_release_of_a_last_voiced_stop_is_kept(self):
        # "good": the d ends with a short burst of noise, like t and k
        x = join(quiet(30), voiced(300), hiss(60, 0.2), quiet(60))
        self.assertEqual(edge_problems(x, SR, 'ɡˈʊd.'), [])

    def test_a_last_ch_is_kept(self):
        # "each": ch ends with a hiss, like s
        x = join(quiet(30), voiced(300), hiss(150, 0.2), quiet(60))
        self.assertEqual(edge_problems(x, SR, 'ˈiʧ.'), [])

    def test_a_sound_after_a_last_ch_is_cut(self):
        x = join(quiet(30), voiced(300), hiss(150, 0.2), voiced(90), quiet(60))
        self.assertTrue(edge_problems(x, SR, 'ˈiʧ.'))

    def test_a_long_first_word_is_not_taken_for_an_extra_sound(self):
        # "three plus one": a faint "th", then "ree", then the "s" of plus
        x = join(quiet(30), hiss(60, 0.002), voiced(400), hiss(100), voiced(200), quiet(60))
        self.assertEqual(edge_problems(x, SR, 'θɹˈi plˈʌs wˈʌn.'), [])


def has(reasons, words):
    return any(words in r for r in reasons)


class Glitches(unittest.TestCase):
    def test_a_clean_line_has_none(self):
        x = join(quiet(30), hiss(100), glide(300, 200, 170), quiet(40), glide(250, 190, 160), quiet(60))
        self.assertEqual(glitches(x, SR, 'three plus two'), [])

    def test_a_pause_where_the_line_has_no_punctuation(self):
        x = join(quiet(30), glide(300, 200, 170), quiet(300), glide(300, 190, 160), quiet(60))
        self.assertTrue(has(glitches(x, SR, 'three plus two'), 'pause'))

    def test_a_pause_at_punctuation_is_fine(self):
        x = join(quiet(30), glide(300, 200, 170), quiet(300), glide(300, 190, 160), quiet(60))
        self.assertEqual(glitches(x, SR, 'Yes! Three plus two.'), [])

    def test_a_very_long_pause_at_punctuation(self):
        x = join(quiet(30), glide(300, 200, 170), quiet(1200), glide(300, 190, 160), quiet(60))
        self.assertTrue(has(glitches(x, SR, 'Yes! Three plus two.'), 'pause'))

    def test_a_pause_in_the_wrong_place_is_found_even_if_the_line_has_punctuation(self):
        # "Yes! Seven plus one": the pause sits between "seven" and "plus", not after "Yes!"
        x = join(quiet(30), glide(200, 200, 180), glide(300, 200, 170), quiet(300), glide(300, 190, 160), quiet(60))
        words = [(0.03, 0.23, True), (0.23, 0.53, False), (0.83, 1.13, True)]  # (start s, end s, punctuation after)
        self.assertTrue(has(glitches(x, SR, 'Yes! Seven plus.', words), 'pause'))

    def test_a_pause_after_punctuation_is_fine_when_words_are_known(self):
        x = join(quiet(30), glide(200, 200, 180), quiet(300), glide(300, 200, 170), glide(300, 190, 160), quiet(60))
        words = [(0.03, 0.23, True), (0.53, 0.83, False), (0.83, 1.13, True)]
        self.assertEqual(glitches(x, SR, 'Yes! Seven plus.', words), [])

    def test_sound_cutting_out(self):
        v = glide(600, 200, 170)
        v[int(0.3 * SR):int(0.36 * SR)] = 0
        self.assertTrue(has(glitches(join(quiet(30), v, quiet(60)), SR, 'three'), 'cuts out'))

    def test_a_click(self):
        v = glide(500, 200, 170)
        v[int(0.25 * SR):int(0.25 * SR) + 3] = [0.8, -0.8, 0.8]
        self.assertTrue(has(glitches(join(quiet(30), v, quiet(60)), SR, 'three'), 'click'))

    def test_a_pitch_jump(self):
        x = join(quiet(30), glide(200, 180, 180), glide(200, 300, 300), quiet(60))
        self.assertTrue(has(glitches(x, SR, 'three'), 'pitch'))

    def test_an_octave_drop_is_creaky_voice_not_a_jump(self):
        # The pitch tracker reads the creak at the end of a sentence as half the pitch.
        x = join(quiet(30), glide(200, 180, 180), glide(200, 90, 90), quiet(60))
        self.assertFalse(has(glitches(x, SR, 'three'), 'pitch'))

    def test_a_loud_click_next_to_a_hissing_sound(self):
        # Quieter clicks can't be told from a natural "s": its sample-to-sample jumps are as big.
        v = join(glide(300, 200, 170), hiss(200, 0.2), glide(300, 190, 160))
        v[int(0.25 * SR):int(0.25 * SR) + 3] = [0.8, -0.8, 0.8]
        self.assertTrue(has(glitches(join(quiet(30), v, quiet(60)), SR, 'three plus six'), 'click'))

    def test_hissing_sounds_are_not_clicks(self):
        v = join(glide(300, 200, 170), hiss(200, 0.3), glide(300, 190, 160), hiss(150, 0.3))
        self.assertFalse(has(glitches(join(quiet(30), v, quiet(60)), SR, 'three plus six'), 'click'))

    def test_a_smooth_pitch_glide_is_fine(self):
        x = join(quiet(30), glide(400, 180, 260), quiet(60))
        self.assertEqual(glitches(x, SR, 'three'), [])


class Breathy(unittest.TestCase):
    def test_a_word_full_of_hissing_sounds_is_not_breathy(self):
        # "six" is mostly s and ks; only its voiced part says whether the voice is breathy
        x = join(quiet(30), hiss(150, 0.15), glide(200, 200, 180), hiss(150, 0.15), quiet(60))
        reason, hnr = breathy(x, SR)
        self.assertIsNone(reason)
        self.assertGreater(hnr, 5)

    def test_a_whispered_vowel_is_breathy(self):
        v = glide(400, 200, 180)
        noisy = v * 0.25 + hiss(400, 0.25, seed=3) + 0.15 * np.random.default_rng(4).standard_normal(len(v)).astype('float32')
        self.assertIsNotNone(breathy(join(quiet(30), noisy, quiet(60)), SR)[0])


class Phones(unittest.TestCase):
    def test_expected_phones_spell_out_kokoro_symbols(self):
        self.assertEqual([p for p, _, _ in expected_phones('fˈIv.')], ['f', 'aɪ', 'v'])
        self.assertEqual([p for p, _, _ in expected_phones('sˈɪks!')], ['s', 'ɪ', 'k', 's'])
        self.assertEqual([w for _, _, w in expected_phones('nˌɑt sˈɪks.')], [0, 0, 0, 1, 1, 1, 1])
        self.assertEqual([s for _, s, _ in expected_phones('sˈɛvən.')], [False, True, False, False, False])

    def test_heard_phones_are_split_into_simple_sounds(self):
        self.assertEqual(split_heard('f oːɹ'), ['f', 'o', 'ɹ'])
        self.assertEqual(split_heard('s ɪ k s'), ['s', 'ɪ', 'k', 's'])
        self.assertEqual(split_heard('t ɛ n̩'), ['t', 'ɛ', 'ə', 'n'])

    def test_a_sound_written_twice_is_one_sound(self):
        # "four is" comes out as f oːɹ ɹ ɪ z; "three" as θ ɹ iː i
        self.assertEqual(split_heard('f oːɹ ɹ ɪ z'), ['f', 'o', 'ɹ', 'ɪ', 'z'])
        self.assertEqual(split_heard('θ ɹ iː i'), ['θ', 'ɹ', 'i'])

    def test_a_sound_shared_by_two_words_is_said_once(self):
        # "three equals": the "ee" of three runs into the "ee" of equals
        self.assertEqual(phone_diffs(expected_phones('θɹˈi ˈikwᵊlz'), split_heard('θ ɹ iː iː k w əl z')), [])

    def test_a_weak_r_after_a_vowel_is_fine(self):
        self.assertEqual(phone_diffs(expected_phones('fˈɔɹ.'), ['f', 'oʊ']), [])

    def test_the_same_sounds_have_no_differences(self):
        self.assertEqual(phone_diffs(expected_phones('sˈɪks.'), ['s', 'ɪ', 'k', 's']), [])

    def test_a_wrong_vowel_is_a_difference(self):
        d = phone_diffs(expected_phones('sˈɪks.'), ['s', 'ɛ', 'k', 's'])
        self.assertEqual([(x['kind'], x['expected'], x['heard']) for x in d], [('sub', 'ɪ', 'ɛ')])

    def test_an_extra_sound_at_the_start_is_found(self):
        d = phone_diffs(expected_phones('sˈɪks.'), ['ə', 's', 'ɪ', 'k', 's'])
        self.assertEqual([(x['kind'], x['heard'], x['where']) for x in d], [('ins', 'ə', 'start')])

    def test_unstressed_vowels_may_be_reduced(self):
        # "seven" is often heard as s ɛ v ɪ n or s ɛ v n
        self.assertEqual(phone_diffs(expected_phones('sˈɛvən.'), ['s', 'ɛ', 'v', 'ɪ', 'n']), [])
        self.assertEqual(phone_diffs(expected_phones('sˈɛvən.'), ['s', 'ɛ', 'v', 'n']), [])

    def test_a_wrong_number_word_is_a_problem(self):
        reasons = phone_problems('sˈɪks.', 'f ɪ k s')
        self.assertTrue(has(reasons, 'six'))

    def test_the_recognizer_is_not_trusted_on_short_i_e_a(self):
        # On this voice it heard a real "tin" as "ten", and a good "six" as "sex", so those vowels are
        # judged by vowel_problems instead.
        self.assertEqual(phone_problems('sˈɪks.', 's ɛ k s'), [])
        self.assertEqual(phone_problems('tˈɛn.', 't ɪ n'), [])

    def test_a_right_line_has_no_problems(self):
        self.assertEqual(phone_problems('nˌɑt sˈɪks.', 'n ɑː t s ɪ k s'), [])


class Vowels(unittest.TestCase):
    def test_ctc_align_finds_where_each_sound_is(self):
        # 10 frames, vocabulary: 0 = blank, 1 = A, 2 = B. A in frames 0-2, blank 3-5, B 6-9.
        lp = np.full((10, 3), -9.0)
        lp[0:3, 1] = 0
        lp[3:6, 0] = 0
        lp[6:10, 2] = 0
        self.assertEqual(ctc_align(lp, [1, 2], blank=0), [(0, 3), (6, 10)])

    def test_ctc_align_handles_a_sound_said_twice(self):
        lp = np.full((7, 2), -9.0)
        lp[[0, 1, 4, 5], 1] = 0
        lp[[2, 3, 6], 0] = 0
        self.assertEqual(ctc_align(lp, [1, 1], blank=0), [(0, 2), (4, 6)])

    def test_a_vowel_unlike_the_same_word_in_other_lines_stands_out(self):
        rng = np.random.default_rng(0)
        found = [{'clip': 'line-%d' % i, 'word': 'seven', 'F1': 860 * np.exp(rng.normal(0, 0.05)),
                  'F2': 1930 * np.exp(rng.normal(0, 0.02))} for i in range(40)]
        found.append({'clip': 'sivven', 'word': 'seven', 'F1': 590, 'F2': 2080})
        self.assertEqual(list(vowel_outliers(found)), ['sivven'])

    def test_an_odd_f2_alone_is_a_measuring_slip(self):
        # i, e and a differ mostly in height (F1); a normal F1 with a strange F2 is the tracker slipping.
        rng = np.random.default_rng(0)
        found = [{'clip': 'line-%d' % i, 'word': 'seven', 'F1': 860 * np.exp(rng.normal(0, 0.05)),
                  'F2': 1930 * np.exp(rng.normal(0, 0.02))} for i in range(40)]
        found.append({'clip': 'slip', 'word': 'seven', 'F1': 850, 'F2': 1217})
        self.assertEqual(vowel_outliers(found), {})

    def test_a_word_in_too_few_lines_is_not_judged(self):
        found = [{'clip': 'a', 'word': 'zero', 'F1': 420, 'F2': 2450}, {'clip': 'b', 'word': 'zero', 'F1': 900, 'F2': 1500}]
        self.assertEqual(vowel_outliers(found), {})

    def test_the_nearest_reference_vowel_wins(self):
        refs = {'ɪ': (700, 2300), 'ɛ': (800, 1900), 'æ': (1000, 1900)}
        self.assertEqual(nearest_vowel((720, 2250), refs), 'ɪ')
        self.assertEqual(nearest_vowel((820, 1880), refs), 'ɛ')


class CarrierCut(unittest.TestCase):
    def test_the_cut_is_in_the_pause_before_the_word(self):
        x = join(quiet(30), glide(300, 200, 170), quiet(150), glide(300, 190, 160), quiet(60))
        y = cut_after_gap(x, SR, word_start_ms=500)
        self.assertAlmostEqual((len(x) - len(y)) / SR * 1000, 405, delta=20)

    def test_no_pause_means_no_cut(self):
        x = join(quiet(30), glide(300, 200, 170), glide(300, 190, 160), quiet(60))
        self.assertIsNone(cut_after_gap(x, SR, word_start_ms=330))


class Counting(unittest.TestCase):
    def counts(self, **changed):
        clips = {'n-%d' % n: join(quiet(30), glide(400, 200, 170), quiet(60)) for n in range(11)}
        clips.update(changed)
        return clips

    def test_matching_counts_are_fine(self):
        self.assertEqual(number_outliers(self.counts(), SR), {})

    def test_a_much_longer_count_stands_out(self):
        out = number_outliers(self.counts(**{'n-4': join(quiet(30), glide(900, 200, 170), quiet(60))}), SR)
        self.assertEqual(list(out), ['n-4'])

    def test_creaky_voice_is_not_counted_as_a_pitch_difference(self):
        creaky = join(quiet(30), glide(250, 200, 180), glide(250, 90, 85), quiet(60))
        self.assertNotIn('n-5', number_outliers(self.counts(**{'n-5': creaky}), SR))

    def test_creak_share_measures_how_much_of_a_word_is_creaky(self):
        creaky = join(quiet(30), glide(250, 200, 180), glide(250, 90, 85), quiet(60))
        self.assertAlmostEqual(creak_share(creaky, SR, voice_f0=190), 0.5, delta=0.15)
        self.assertLess(creak_share(join(quiet(30), glide(400, 200, 170), quiet(60)), SR, voice_f0=190), 0.05)

    def test_a_count_that_rises_stands_out(self):
        out = number_outliers(self.counts(**{'n-7': join(quiet(30), glide(400, 170, 240), quiet(60))}), SR)
        self.assertEqual(list(out), ['n-7'])


class Spoken(unittest.TestCase):
    def test_lines_without_end_punctuation_get_a_full_stop(self):
        self.assertEqual(spoken('three'), 'three.')
        self.assertEqual(spoken('three plus two'), 'three plus two.')
        self.assertEqual(spoken('Not three.'), 'Not three.')

    def test_x_is_said_as_ex_so_its_full_stop_stays(self):
        # The dictionary reads "X." as an abbreviation and drops the pause after it.
        self.assertEqual(spoken('That one has an X. Skip it.'), 'That one has an ex. Skip it.')
        self.assertEqual(spoken('Count the robots with no X.'), 'Count the robots with no ex.')

    def test_and_is_stressed_so_it_is_not_heard_as_in(self):
        # Unstressed, "One and four" was heard as "One in four".
        self.assertEqual(spoken('One and four make five!'), 'One [and](/ˈænd/) four make five!')


class SameWords(unittest.TestCase):
    def test_digits_and_punctuation_match_spelled_words(self):
        self.assertTrue(same_words('Yes! Seven plus two is nine!', ' Yes, 7 plus 2 is 9.'))
        self.assertTrue(same_words('Not ten.', 'Not 10.'))
        self.assertTrue(same_words('zero', '0'))

    def test_math_signs_match_words(self):
        self.assertTrue(same_words('three plus two', '3 + 2'))
        self.assertTrue(same_words('Seven minus two equals five!', '7 - 2 = 5!'))

    def test_apostrophes_and_case_are_ignored(self):
        self.assertTrue(same_words("Let's count again. Tap each robot.", 'lets count again tap each robot'))
        self.assertTrue(same_words('Count the monsters with no X.', "Count the monster's with no x."))

    def test_words_that_sound_the_same_match(self):
        # The recognizer can't tell these apart by sound, so they say nothing about the clip.
        self.assertTrue(same_words('two', 'To.'))
        self.assertTrue(same_words('four', 'For.'))
        self.assertTrue(same_words('eight', 'ate'))
        self.assertTrue(same_words('one', 'Won.'))
        self.assertTrue(same_words('Count the robots with no X.', 'Count the robots with no ex.'))

    def test_a_wrong_number_fails(self):
        self.assertFalse(same_words('Yes! Seven plus two is nine!', 'Yes, 7 plus 2 is 5.'))
        self.assertFalse(same_words('six', 'sticks'))

    def test_a_missing_or_extra_word_fails(self):
        self.assertFalse(same_words('Tap each monster to count them all.', 'Tap each monster to count them.'))
        self.assertFalse(same_words('three plus two', 'three plus two plus'))

    def test_nothing_heard_fails(self):
        self.assertFalse(same_words('nine', ''))


if __name__ == '__main__':
    unittest.main()
