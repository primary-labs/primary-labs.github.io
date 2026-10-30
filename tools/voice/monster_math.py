#!/usr/bin/env python3
"""Primary Labs · Monster Math — make the default-voice clips with Kokoro-82M.

    python monster_math.py --out DIR [--voice af_heart] [--speed 0.9] [--only ID,ID,...]
    python monster_math.py --out DIR --review [--only ID,ID,...]     check existing clips again

Every line comes from labs/monster-math/tools/list-phrases.js, the same list the page uses, so new
lines are picked up automatically. Lines go through Kokoro's dictionary: Monster Math has no letter
sounds, so ordinary pronunciation is right. A word the dictionary doesn't know stops the build; fix
it in SAY_AS. Lines without end punctuation ("three", "three plus two") are said with a full stop, so
every count and problem ends the same way.

One-word lines (the counts) are said after a carrier sentence and cut out, because Kokoro garbles a
single short word ("two" came out as "ess-yoo"). Kokoro also sometimes adds a short sound at the
edges of a line: "uh" before a first s, f or th ("uh-six"), "uh" after a last one ("six-uh"), or a
hiss after a last voiced sound ("nine-ss"). These are found from the line's first and last sound and
cut (clean_edges).

Each clip is then reviewed, so a person doesn't have to listen to all of them:
  - words: Whisper writes down the words it hears, and they must match the line (digits,
    punctuation and words that sound the same, like "to"/"two", don't count as a difference)
  - sounds: wav2vec2-espeak writes down the sounds it hears, with no dictionary to guess words from,
    and they must match the sounds Kokoro was asked for (catches "ess-yoo" for "two", an extra "uh")
  - vowels: the short i, e and a of number words are measured, against the voice's own hid / head /
    had for a count, and against the same word in the other lines inside a sentence (catches "sex"
    for "six", "tin" for "ten")
  - glitches: a pause anywhere but after punctuation, or one that's too long, sound cutting out, a
    loud click, a pitch jump; and no extra sound left at either edge
  - basics: not clipped, not cut off at the end, not whispered or breathy
  - counts: "zero" ... "ten" are compared with each other for length, pitch and a falling end, and
    may be creaky for at most 40% of the word
A clip that fails is made again (TAKES_ONE_WORD / TAKES_LINE: a new seed, the carrier, a small change
in speed), up to --tries takes. The best take is kept; a clip that still fails is marked "check" in
manifest.json and listed when the run ends, for a person to listen to. The README has how well each
check did on known-bad clips.

Writes:
    DIR/<voice>/phrases/<id>.mp3    what ships: 64 kbps mono, copy into
                                    labs/monster-math/assets/audio/phrases/
    DIR/<voice>/wav/<id>.wav        24 kHz 16-bit masters
    DIR/<voice>/manifest.json       text, phonemes, what was heard, check results, every take tried
    DIR/<voice>/listen.html         plays every clip, the ones to check first
Levels match Letter Chains (about -20 LUFS, peaks below -1 dBFS).
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys
import time
import unicodedata

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'labs', 'monster-math')
sys.path.insert(0, HERE)

NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
# Whisper can't tell these apart by sound, so they say nothing about the clip.
SAME_SOUND = {'to': 'two', 'too': 'two', 'for': 'four', 'ate': 'eight', 'won': 'one', 'ex': 'x'}


def words(s):
    """The words of a line, for comparing: lower case, no punctuation, digits and signs spelled out."""
    s = s.lower().replace('’', "'").replace("'", '')
    s = s.replace('+', ' plus ').replace('=', ' equals ').replace('−', ' minus ').replace('-', ' minus ')
    out = []
    for w in re.findall(r'[a-z]+|\d+', s):
        if w.isdigit() and int(w) < len(NUM):
            w = NUM[int(w)]
        out.append(SAME_SOUND.get(w, w))
    return out


def same_words(text, heard):
    h = words(heard)
    return bool(h) and words(text) == h


# Words said another way, given to the dictionary instead: a respelling, or a misaki override like
# '[word](/phonemes/)'.
#   X    The dictionary reads "X." as an abbreviation and drops the pause after it, and a misaki
#        override drops it too; "ex" says the same /ˈɛks/ and keeps it.
#   and  Unstressed, "One and four" was heard as "One in four".
SAY_AS = {'X': 'ex', 'and': '[and](/ˈænd/)'}

# ---------------------------------------------------------------- edges
# Kokoro sometimes adds a short voiced sound before a line that starts with a hissing sound ("uh-six"),
# a voiced sound after a line that ends with one ("six-uh"), or a hiss after a line that ends voiced
# ("nine-ss"). Each is found from the line's first and last sound, and cut.

HOP_MS = 5
HISSING = set('sfθʃ') | {'tʃ'}    # voiceless fricatives, and ch
STOPS = set('tkpbdɡ') | {'dʒ'}    # their release is a burst of noise, so a final one is left alone
DEVOICED = set('vzð')             # these end with a little hiss in normal speech
EXTRA_MAX_MS = 150                # a longer voiced stretch before the first hiss is a word, not an extra sound
KEEP_MS = {'voiced': 25, 'devoiced': 100, 'hissing': 0}  # kept after the last sound, before the cut


def _frames(x, sr):
    import qa
    al = qa.env_db(x, sr, 10, HOP_MS)
    hi = qa.band_env(x, sr, 4000, 11000, 10, HOP_MS)
    lo = qa.band_env(x, sr, 80, 1000, 10, HOP_MS)
    n = min(len(al), len(hi), len(lo))
    ts, v = qa.voiced_mask(x, sr)
    t = (np.arange(n) * HOP_MS + 5) / 1000
    vv = np.interp(t, ts, v.astype(float)) > 0.5 if len(ts) else np.zeros(n, bool)
    return al[:n], hi[:n], lo[:n], vv


def _runs(mask, min_ms, hop_ms=HOP_MS):
    """(start, end) frame indexes of each stretch of True at least min_ms long."""
    out, i = [], 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]:
                j += 1
            if (j - i) * hop_ms >= min_ms:
                out.append((i, j))
            i = j
        else:
            i += 1
    return out


def _edges(x, sr, ps):
    """For each extra sound found, 'before', 'after' or 'hiss': (where to cut, ms; how long it is, ms)."""
    al, hi, lo, vv = _frames(x, sr)
    if not len(al):
        return {}
    strong = al > al.max() - 30
    fric = strong & (hi > lo + 3) & ~vv
    tonal = strong & (lo > hi + 10)
    ph = [p for p, _, _ in expected_phones(ps)]
    first, last = ph[0], ph[-1]
    found = {}
    frics = _runs(fric, 20)
    if first in HISSING and frics:
        f0 = frics[0][0]
        s0 = int(np.argmax(strong))
        if _runs(tonal[:f0], 25) and (f0 - s0) * HOP_MS <= EXTRA_MAX_MS:
            found['before'] = (max(0, f0 * HOP_MS - 10), (f0 - s0) * HOP_MS)
    if last in HISSING and frics:
        f1 = frics[-1][1]
        after = _runs(tonal[f1:], 25)
        if after:
            found['after'] = (f1 * HOP_MS + KEEP_MS['hissing'], (after[-1][1]) * HOP_MS)
    elif last not in HISSING | STOPS and vv.any():
        v1 = len(vv) - int(np.argmax(vv[::-1]))  # frame after the last voiced one
        keep = KEEP_MS['devoiced' if last in DEVOICED else 'voiced']
        noisy = _runs(strong[v1:] & (hi[v1:] > lo[v1:] + 3), 20)
        if noisy and noisy[-1][1] * HOP_MS > keep + 20:
            found['hiss'] = (v1 * HOP_MS + keep, noisy[-1][1] * HOP_MS)
    return found


EDGE_WORDS = {'before': 'a sound before the first word', 'after': 'a sound after the last word',
              'hiss': 'a hiss after the last word'}


def edge_problems(x, sr, ps):
    return ['%s (%d ms)' % (EDGE_WORDS[k], v[1]) for k, v in _edges(x, sr, ps).items()]


def clean_edges(x, sr, ps):
    """Cuts the extra sounds _edges finds. Returns (audio, what was cut). A cut start fades in over
    5 ms; a cut end fades out over the last 30 ms on a curve, so it ends in silence even when the cut
    lands inside a loud sound."""
    found = _edges(x, sr, ps)
    if not found:
        return x, []
    ms = sr // 1000
    s = found['before'][0] * ms if 'before' in found else 0
    ends = [found[k][0] * ms for k in ('after', 'hiss') if k in found]
    t = min(ends + [len(x)])
    y = x[s:t].astype('float32').copy()
    if s:
        n = min(len(y) // 2, 5 * ms)
        y[:n] *= np.linspace(0, 1, n, dtype='float32')
    if ends:
        n = min(len(y) // 2, 30 * ms)
        y[-n:] *= np.linspace(1, 0, n, dtype='float32') ** 2
    return y, ['cut %s (%d ms)' % (EDGE_WORDS[k], v[1]) for k, v in found.items()]


# ---------------------------------------------------------------- glitches
# Problems no word check hears: a pause in the wrong place, sound cutting out, a click, a pitch jump.

PAUSE_MS = 180        # a silence this long is a pause, not a consonant closure
PAUSE_TOL_S = 0.08    # word positions from the recognizer are rough (20 ms frames, stop closures)
MAX_PAUSE_MS = 500    # longest pause allowed, even at a full stop (the Heart lines pause up to 330 ms)
CUT_MS = 10           # digital silence this long between loud sounds is the sound cutting out
CLICK_D2 = 2.5        # a sample-to-sample jump (second difference) this big is a click
JUMP_ST = 7.0         # semitones between neighbouring pitch frames that count as a pitch jump


def glitches(x, sr, text, spans=None):
    """Pauses, cut-outs, clicks and pitch jumps. spans: [(start s, end s, punctuation after?)] for
    each word, from word_spans; with them a pause is allowed only right after a word followed by
    punctuation, without them the line's punctuation marks are counted instead."""
    import qa
    out = []
    al = qa.env_db(x, sr, 10, HOP_MS)
    pk = al.max()
    loud = np.flatnonzero(al > pk - 35)
    if not len(loud):
        return ['no speech']
    s0, s1 = loud[0], loud[-1]

    runs = [((s0 + i) * HOP_MS / 1000, (s0 + j) * HOP_MS / 1000) for i, j in _runs(al[s0:s1] < pk - 45, PAUSE_MS)]
    if spans:
        for a, b in runs:
            mid = (a + b) / 2
            ok = any(spans[k][2] and spans[k][1] - PAUSE_TOL_S <= mid <=
                     (spans[k + 1][0] + PAUSE_TOL_S if k + 1 < len(spans) else np.inf) for k in range(len(spans)))
            if not ok:
                out.append('a pause where the line has none (%d ms at %d ms)' % ((b - a) * 1000, a * 1000))
    else:
        allowed = len(re.findall(r'[.!?,;:]+\s', text.strip()))
        for ms in sorted((b - a) * 1000 for a, b in runs)[:max(0, len(runs) - allowed)]:
            out.append('a pause where the line has none (%d ms)' % ms)
    for a, b in runs:
        if (b - a) * 1000 > MAX_PAUSE_MS:
            out.append('a very long pause (%d ms)' % ((b - a) * 1000))

    # cutting out: near-silence that the sound drops into (or out of) within a few samples, where
    # natural speech fades
    ms = sr // 1000
    quiet = np.abs(x) < 1e-4
    a, b = s0 * HOP_MS * ms, min(len(x), (s1 + 2) * HOP_MS * ms)
    i = a
    while i < b:
        if quiet[i]:
            j = i
            while j < b and quiet[j]:
                j += 1
            edge = max(np.abs(x[max(0, i - 3):i]).max(initial=0), np.abs(x[j:j + 3]).max(initial=0))
            if j - i >= CUT_MS * ms and edge > 0.01:
                out.append('the sound cuts out (%d ms)' % ((j - i) // ms))
            i = j
        else:
            i += 1

    # clicks: a jump between samples bigger than any natural sound makes. The loudest "s" in the
    # Heart clips jumps up to 1.85 (second difference, at -20 LUFS); a quieter click can't be told
    # apart from one.
    d2 = np.abs(np.diff(x.astype('float64'), 2))
    hits = np.flatnonzero(d2 > CLICK_D2)
    if len(hits):
        out.append('a click at %d ms' % (hits[0] // ms))

    # pitch jumps inside voiced sound. Creaky voice at the end of a sentence reads as about half
    # the pitch, so those frames, and octave-sized jumps, are left out.
    ts, f0 = qa.pitch(x, sr)
    if (f0 > 0).any():
        med = np.median(f0[f0 > 0])
        prev_t, prev_f = None, None
        for t, f in zip(ts, f0):
            if not 0.55 * med < f < 1.8 * med:
                continue
            jump = abs(12 * np.log2(f / prev_f)) if prev_f else 0
            if prev_f and t - prev_t <= 0.02 and jump > JUMP_ST and abs(jump - 12) > 2.5:
                out.append('a pitch jump at %d ms (%d to %d Hz)' % (t * 1000, prev_f, f))
                break
            prev_t, prev_f = t, f
    return out


MIN_HNR_DB = 5.0     # harmonics-to-noise below this sounds whispered or breathy


def breathy(x, sr):
    """(a reason if the voice is whispered or breathy, else None; harmonics-to-noise in dB or None).
    Harmonics-to-noise is measured over the longest voiced stretch, so hissing sounds (the s and ks
    of "six") don't count against it."""
    import qa
    run = qa.voiced_run(x, sr)
    hnr = qa.hnr_db(x, sr, run[0], run[1]) if run else None
    if not run or run[1] - run[0] < 0.04:
        return 'whispered (no voiced sound)', hnr  # every line has a vowel
    return ('whispered or breathy (HNR %s dB)' % hnr if hnr is not None and hnr < MIN_HNR_DB else None), hnr


MAX_CREAK = 0.4      # share of a one-word line that may be creaky voice (vocal fry). The Heart counts
                     # run 0-34%; "five" is 36-59% however it's made, least at 5% faster.


def creak_share(x, sr, voice_f0):
    """Share of the voiced frames in creaky voice: pitch below 0.6 of the voice's usual pitch. A
    little at the end of a sentence is normal; half of a count sounds growly next to the others."""
    import qa
    _, f0 = qa.pitch(x, sr)
    v = f0[f0 > 0]
    return float(np.mean(v < 0.6 * voice_f0)) if len(v) >= 4 else 0.0


def number_outliers(clips, sr):
    """The counting clips (n-0 ... n-10) should sound alike: similar length, pitch, and a falling end.
    Takes {id: audio}; returns {id: [reasons]} for the ones that stand out. Creaky frames are left
    out of the pitch comparison (creak_share judges those)."""
    import qa
    tracks = {cid: qa.pitch(x, sr)[1] for cid, x in clips.items()}
    voiced = [f for f0 in tracks.values() for f in f0 if f > 0]
    if not voiced:
        return {}
    floor = 0.6 * float(np.median(voiced))
    stats = {}
    for cid, x in clips.items():
        al = qa.env_db(x, sr, 10, HOP_MS)
        loud = np.flatnonzero(al > al.max() - 35)
        f0 = tracks[cid]
        v = f0 > floor
        if not len(loud) or v.sum() < 4:
            continue
        st = 12 * np.log2(f0[v] / 100)
        k = max(2, len(st) // 4)
        stats[cid] = {'ms': (loud[-1] - loud[0]) * HOP_MS, 'st': float(np.median(st)),
                      'fall': float(np.median(st[:k]) - np.median(st[-k:]))}
    if len(stats) < 3:
        return {}
    med = {k: float(np.median([s[k] for s in stats.values()])) for k in ('ms', 'st', 'fall')}
    out = {}
    for cid, s in stats.items():
        r = []
        if not 0.6 * med['ms'] <= s['ms'] <= 1.6 * med['ms']:
            r.append('length %d ms, unlike the other counts (%d ms)' % (s['ms'], med['ms']))
        if abs(s['st'] - med['st']) > 3:
            r.append('pitch %+.1f semitones from the other counts' % (s['st'] - med['st']))
        if med['fall'] > 1 and s['fall'] < 0:
            r.append('pitch rises at the end, unlike the other counts')
        if r:
            out[cid] = r
    return out


# ---------------------------------------------------------------- sounds heard vs sounds expected
# A phone recognizer (wav2vec2-espeak) writes down the sounds it hears, with no dictionary to guess
# whole words from, so it catches what Whisper smooths over: an extra "uh", a wrong vowel, a missing
# sound. Its output is compared with the sounds Kokoro was asked to say.

KOKORO_TO_IPA = {'A': 'eɪ', 'I': 'aɪ', 'O': 'oʊ', 'W': 'aʊ', 'Y': 'ɔɪ', 'ʧ': 'tʃ', 'ʤ': 'dʒ', 'ᵊ': 'ə', 'ɐ': 'ə'}
IPA_VOWELS = set('aeiouæɑɒɔəɛɪʊʌɜɐᵻ') | {'eɪ', 'aɪ', 'oʊ', 'aʊ', 'ɔɪ'}
HEARD_SPLIT = {'ɚ': ['ə', 'ɹ'], 'ɝ': ['ə', 'ɹ'], 'n̩': ['ə', 'n'], 'l̩': ['ə', 'l'], 'əl': ['ə', 'l'],
               'aɪə': ['aɪ', 'ə'], 'aɪɚ': ['aɪ', 'ə', 'ɹ'], 'eə': ['ɛ', 'ə'], 'ɫ': ['l'], 'ɾ': ['t'],
               'ᵻ': ['ɪ'], 'ɐ': ['ə'], 'ɜ': ['ə']}
# Sounds the recognizer, or ordinary American speech, uses for one another.
SAME = [{'ɑ', 'ɒ', 'ɔ'}, {'ɔ', 'o', 'oʊ'}, {'ə', 'ʌ'}, {'t', 'ʔ', 'd'}, {'i', 'ɪ'}]
REDUCED = {'ə', 'ɪ', 'ʌ', 'i', 'ɛ', 'ʊ'}   # what an unstressed vowel may come out as
NUMBER_WORDS = {'zɪɹoʊ': 'zero', 'wʌn': 'one', 'tu': 'two', 'θɹi': 'three', 'fɔɹ': 'four', 'faɪv': 'five',
                'sɪks': 'six', 'sɛvən': 'seven', 'eɪt': 'eight', 'naɪn': 'nine', 'tɛn': 'ten'}
MAX_MISMATCH = 0.35   # share of a line's sounds that may differ before the line is flagged


def expected_phones(ps):
    """Kokoro phonemes -> [(IPA phone, stressed vowel?, word index)]."""
    out = []
    for w, word in enumerate(ps.split()):
        stress = False
        for c in word:
            if c in 'ˈˌ':
                stress = True
                continue
            if unicodedata.category(c).startswith('P'):
                continue
            p = KOKORO_TO_IPA.get(c, c)
            vowel = p in IPA_VOWELS
            out.append((p, vowel and stress, w))
            if vowel:
                stress = False
    return out


def split_heard(s):
    """The recognizer's output -> simple phones (no length marks, r-coloured vowels split)."""
    out = []
    for tok in s.split():
        if tok in HEARD_SPLIT:
            out += HEARD_SPLIT[tok]
            continue
        t = tok.replace('ː', '')
        if t in HEARD_SPLIT:
            out += HEARD_SPLIT[t]
        elif len(t) > 1 and t.endswith('ɹ') and t[:-1] in IPA_VOWELS | {'o'}:
            out += [t[:-1], 'ɹ']
        else:
            out.append(t)
    return [p for i, p in enumerate(out) if i == 0 or p != out[i - 1]]  # "ɹ ɹ", "i i": one sound


def _sub_cost(e, h):
    p, stressed, _ = e
    if p == h or any(p in s and h in s for s in SAME):
        return 0
    if p in IPA_VOWELS and not stressed and h in REDUCED:
        return 0
    return 1


def _del_costs(expected):
    """An unstressed vowel may be swallowed, an r after a vowel may be weak, and a sound shared by
    two neighbouring words ("three equals", "plus six") is said once."""
    out = []
    for i, (p, stressed, _) in enumerate(expected):
        weak_r = p == 'ɹ' and i and expected[i - 1][0] in IPA_VOWELS
        shared = i and expected[i - 1][0] == p and expected[i - 1][2] != expected[i][2]
        out.append(0 if (p in IPA_VOWELS and not stressed) or weak_r or shared else 1)
    return out


def _ins_cost(h):
    return 0 if h == 'ʔ' else 1  # a glottal catch before a vowel is ordinary speech


def phone_diffs(expected, heard):
    """Aligns the two and returns the differences that matter:
    [{'kind': 'sub'|'del'|'ins', 'expected', 'heard', 'word', 'where': 'start'|'end'|'mid'}]."""
    n, m = len(expected), len(heard)
    dc = _del_costs(expected)
    D = np.zeros((n + 1, m + 1))
    D[1:, 0] = np.cumsum(dc)
    D[0, 1:] = np.cumsum([_ins_cost(h) for h in heard])
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            D[i, j] = min(D[i - 1, j - 1] + _sub_cost(expected[i - 1], heard[j - 1]),
                          D[i - 1, j] + dc[i - 1],
                          D[i, j - 1] + _ins_cost(heard[j - 1]))
    out, i, j = [], n, m
    while i or j:
        if i and j and D[i, j] == D[i - 1, j - 1] + _sub_cost(expected[i - 1], heard[j - 1]):
            if _sub_cost(expected[i - 1], heard[j - 1]):
                out.append({'kind': 'sub', 'expected': expected[i - 1][0], 'heard': heard[j - 1],
                            'word': expected[i - 1][2], 'where': 'mid'})
            i, j = i - 1, j - 1
        elif i and D[i, j] == D[i - 1, j] + dc[i - 1]:
            if dc[i - 1]:
                out.append({'kind': 'del', 'expected': expected[i - 1][0], 'heard': None,
                            'word': expected[i - 1][2], 'where': 'mid'})
            i -= 1
        else:
            if _ins_cost(heard[j - 1]):
                where = 'start' if i == 0 else 'end' if i == n else 'mid'
                word = expected[min(i, n - 1)][2] if n else 0
                out.append({'kind': 'ins', 'expected': None, 'heard': heard[j - 1], 'word': word, 'where': where})
            j -= 1
    return out[::-1]


def _plain(word):
    return ''.join(p for p, _, _ in expected_phones(word))


# ---------------------------------------------------------------- vowels
# The recognizer can't be trusted to tell short i, e and a apart on this voice: it heard a real "tin"
# as "ten" and a good "six" as "sex". So those vowels in number words are measured instead (F1/F2),
# with the recognizer only finding where the vowel is:
#   - a count said on its own is compared with the voice's own careful hid, head and had, made the
#     same way (vowel_problems);
#   - inside a sentence vowels drift toward the middle, so a careful reference would call a fluent
#     "seven" a "sivven". Each number word is compared with the same word in the other lines instead
#     (vowel_outliers). Deliberately wrong vowels ("sex", "tin", "sivven") sat 4.0 to 9.7 spreads
#     away; good lines stayed within 3.6. The subtlest, "sivven", is close to the line.

UNSURE = {'ɪ', 'ɛ', 'æ'}
REF_WORDS = {'ɪ': ('hˈɪd.', 'bˈɪd.'), 'ɛ': ('hˈɛd.', 'bˈɛd.'), 'æ': ('hˈæd.', 'bˈæd.')}
REF_NAMES = {'ɪ': 'the "i" of hid', 'ɛ': 'the "e" of head', 'æ': 'the "a" of had'}
W2V2_FRAME_S = 0.02
W2V2_PAD_S = 0.5     # qa.pad adds this much silence before the clip


def ctc_align(lp, ids, blank=0):
    """Most likely CTC path for the token ids through log-probabilities lp (frames x vocab).
    Returns (first frame, last frame + 1) for each token, or None if the clip is too short."""
    T = lp.shape[0]
    ext = [blank]
    for i in ids:
        ext += [i, blank]
    S = len(ext)
    dp = np.full((T, S), -np.inf)
    back = np.zeros((T, S), dtype=int)
    dp[0, 0] = lp[0, ext[0]]
    if S > 1:
        dp[0, 1] = lp[0, ext[1]]
    for t in range(1, T):
        for s in range(S):
            cands = [(dp[t - 1, s], s)]
            if s >= 1:
                cands.append((dp[t - 1, s - 1], s - 1))
            if s >= 2 and ext[s] != blank and ext[s] != ext[s - 2]:
                cands.append((dp[t - 1, s - 2], s - 2))
            v, k = max(cands)
            dp[t, s] = v + lp[t, ext[s]]
            back[t, s] = k
    s = S - 1 if S == 1 or dp[T - 1, S - 1] >= dp[T - 1, S - 2] else S - 2
    if not np.isfinite(dp[T - 1, s]):
        return None
    path = [s]
    for t in range(T - 1, 0, -1):
        s = back[t, s]
        path.append(s)
    path = path[::-1]
    spans = [None] * len(ids)
    for t, s in enumerate(path):
        if s % 2:
            k = (s - 1) // 2
            spans[k] = (spans[k][0], t + 1) if spans[k] else (t, t + 1)
    return spans if all(spans) else None


def nearest_vowel(f, refs):
    return min(refs, key=lambda v: np.hypot(*np.log(np.array(f, float) / np.array(refs[v], float))))


def gender_of(voice):
    """'f' or 'm' from a Kokoro voice name (af_heart, am_michael), for the formant tracker."""
    return 'm' if voice[1:2] == 'm' else 'f'


def vowel_formants(x, sr, t0, t1, gender='f'):
    import qa
    mid, half = (t0 + t1) / 2, max(0.02, (t1 - t0) / 4)
    f = qa.formants(x, sr, max(0, mid - half), min(len(x) / sr, mid + half), gender)
    return (f['F1'], f['F2']) if f and f.get('F1') and f.get('F2') else None


def build_vowel_refs(eng, voice, speed):
    """The voice's own i, e and a, each the median over two words made like the counting clips, and
    the voice's usual pitch from the same words. Returns (refs, f0)."""
    import qa
    from engine import SR, seed_for
    refs, pitches = {}, []
    for v, ref_words in REF_WORDS.items():
        got = []
        for w in ref_words:
            made = make_take(eng, voice, w, 'carrier', speed, seed_for(voice, w, 'vowel-ref'))
            if made:
                ts, f0 = qa.pitch(made[0], SR)
                voiced = f0 > 0
                pitches += list(f0[voiced])
                if voiced.any():
                    f = vowel_formants(made[0], SR, ts[voiced].min(), ts[voiced].max(), gender_of(voice))
                    if f:
                        got.append(f)
        if got:
            refs[v] = tuple(np.median(np.array(got), axis=0))
    return refs, float(np.median(pitches)) if pitches else 200.0


def align_phones(ps, lp, rec):
    """Where each expected sound is: (expected phones the recognizer knows, [(first, last+1) frame])."""
    exp = [e for e in expected_phones(ps) if rec.has(e[0]) or any(rec.has(o) for o in rec.equiv.get(e[0], []))]
    if not exp:
        return [], None
    _, variant = rec.best_variant(lp, [p for p, _, _ in exp])
    return exp, ctc_align(lp.numpy() if hasattr(lp, 'numpy') else lp, [rec.tokens(p)[0] for p in variant], rec.blank)


def _secs(frame):
    return frame * W2V2_FRAME_S - W2V2_PAD_S


def word_spans(ps, exp, spans):
    """[(start s, end s, punctuation after?)] for each word of the line, or None. exp and spans come
    from align_phones."""
    if not spans:
        return None
    out = []
    for w, word in enumerate(ps.split()):
        mine = [spans[k] for k, e in enumerate(exp) if e[2] == w]
        if mine:
            out.append((_secs(min(a for a, _ in mine)), _secs(max(b for _, b in mine)),
                        unicodedata.category(word[-1]).startswith('P')))
    return out


def measure_number_vowels(x, sr, ps, exp, spans, gender='f'):
    """[{'word', 'vowel', 'F1', 'F2'}] for the stressed short i, e and a in each number word. exp and
    spans come from align_phones."""
    if not spans:
        return []
    ps_words = ps.split()
    out = []
    for k, (p, stressed, w) in enumerate(exp):
        name = NUMBER_WORDS.get(_plain(ps_words[w])) if w < len(ps_words) else None
        if not (name and stressed and p in UNSURE):
            continue
        f = vowel_formants(x, sr, _secs(spans[k][0]), _secs(spans[k][1]), gender)
        if f:
            out.append({'word': name, 'vowel': p, 'F1': round(f[0]), 'F2': round(f[1])})
    return out


def vowel_problems(found, refs):
    """For a count said on its own: is each vowel nearest the voice's own careful hid / head / had?
    (Inside a sentence vowels drift toward the middle, so those are compared with each other instead:
    see vowel_outliers.)"""
    out = []
    for v in found:
        if v['vowel'] in refs and len(refs) >= 2:
            got = nearest_vowel((v['F1'], v['F2']), refs)
            if got != v['vowel']:
                out.append('"%s": its vowel is closer to %s than to %s (F1 %d, F2 %d)' % (
                    v['word'], REF_NAMES[got], REF_NAMES[v['vowel']], v['F1'], v['F2']))
    return out


VOWEL_Z = 3.9        # how far (in spreads) a vowel may sit from the same word in the other lines:
                     # good lines stay within 3.6; deliberately wrong vowels sat 4.0 ("sivven") to 9.7
VOWEL_F1_Z = 2.5     # ...and its height (F1) must be off by this much: i, e and a differ mostly in
                     # height, and an odd F2 with a normal F1 (under 1 spread) is the tracker slipping
VOWEL_MIN_LINES = 8  # a word needs this many lines to be compared
VOWEL_MAD_FLOOR = 0.03


def vowel_outliers(found):
    """found: [{'clip', 'word', 'F1', 'F2'}] from the sentence lines. Each number word's vowel is
    compared with the same word in the other lines (median and spread of log F1 and F2); one that sits
    far off sounds different (a "sivven" among "sevens"). Returns {clip: [reasons]}."""
    out = {}
    by_word = {}
    for v in found:
        by_word.setdefault(v['word'], []).append(v)
    for word, vs in by_word.items():
        if len(vs) < VOWEL_MIN_LINES:
            continue
        logs = np.log(np.array([[v['F1'], v['F2']] for v in vs], float))
        med = np.median(logs, axis=0)
        mad = np.maximum(np.median(np.abs(logs - med), axis=0) * 1.4826, VOWEL_MAD_FLOOR)
        for v, lg in zip(vs, logs):
            z = (lg - med) / mad
            if np.hypot(*z) > VOWEL_Z and abs(z[0]) > VOWEL_F1_Z:
                out.setdefault(v['clip'], []).append(
                    '"%s" sounds unlike the same word in the other lines (vowel F1 %d, F2 %d; usually %d, %d)' % (
                        word, v['F1'], v['F2'], np.exp(med[0]), np.exp(med[1])))
    return out


def phone_problems(ps, heard):
    """Reasons a line's sounds don't match, from the recognizer's output (a space-separated string)."""
    exp = expected_phones(ps)
    if not exp:
        return []
    diffs = [d for d in phone_diffs(exp, split_heard(heard))
             if not (d['kind'] == 'sub' and d['expected'] in UNSURE and d['heard'] in UNSURE)]
    out = []
    for d in diffs:
        if d['kind'] == 'ins' and d['where'] in ('start', 'end'):
            out.append('an extra sound %s the line (heard /%s/)' % ('before' if d['where'] == 'start' else 'after',
                                                                  d['heard']))
    for w, word in enumerate(ps.split()):
        name = NUMBER_WORDS.get(_plain(word))
        mine = [d for d in diffs if d['word'] == w and d['where'] == 'mid']
        if name and mine:
            said = ', '.join('/%s/ for /%s/' % (d['heard'] or '-', d['expected'] or '-') for d in mine)
            out.append('"%s" sounds off (heard %s)' % (name, said))
    if len(diffs) / len(exp) > MAX_MISMATCH:
        out.append('%d of %d sounds differ (heard /%s/)' % (len(diffs), len(exp), heard))
    return out


# ---------------------------------------------------------------- takes
# Kokoro is unreliable on a single short word: "two" alone came out as "ess-yoo" and "six" as "sex"
# whatever the seed, speed or punctuation. Said after a carrier sentence and cut out at the pause, as
# Letter Chains does, all eleven counting words came out clean. So one-word lines are made that way,
# and longer lines try it when the plain take fails.

CARRIER = 'ðə wˈɜɹd ɪz. '   # "The word is." The full stop gives a real pause to cut in.
# (how, speed relative to --speed). A new seed alone barely changes Kokoro's output; a 3% change in
# speed does, and is too small to hear.
TAKES_ONE_WORD = [('carrier', 1.0), ('carrier', 1.0), ('carrier', 0.97), ('carrier', 1.03), ('carrier', 1.055),
                  ('plain', 1.0), ('plain', 0.97)]
TAKES_LINE = [('plain', 1.0), ('plain', 1.0), ('carrier', 1.0), ('carrier', 0.97), ('plain', 0.97), ('plain', 1.03)]


def cut_after_gap(x, sr, word_start_ms):
    """Cuts in the middle of the pause just before word_start_ms (Kokoro's rough timing for the word).
    Returns the audio from there on, or None when there's no pause of at least 30 ms to cut in."""
    import qa
    e = qa.env_db(x, sr)  # 1 value per ms
    pk = e.max()
    a, b = max(0, word_start_ms - 250), min(len(e) - 1, word_start_ms + 60)
    gaps = _runs(e[a:b] < pk - 50, 30, hop_ms=1)
    if not gaps:
        return None
    g0, g1 = max(gaps, key=lambda r: r[1])  # the pause closest to the word
    c = (a + (g0 + g1) // 2) * (sr // 1000)
    y = x[c:].astype('float32').copy()
    n = min(len(y), 3 * sr // 1000)
    y[:n] *= np.linspace(0, 1, n, dtype='float32')
    return y


def make_take(eng, voice, ps, how, speed, seed):
    """One take of a line, trimmed, edge-cleaned and levelled: (audio, cuts), or None."""
    from engine import MS, SR, edges_of, normalize, trim
    if how == 'carrier':
        cps = CARRIER + ps
        audio, pred = eng.synth(cps, voice, seed, speed)
        audio = cut_after_gap(audio, SR, int(edges_of(pred)[len(CARRIER) + 1] // MS))
        if audio is None:
            return None
    else:
        audio, _ = eng.synth(ps, voice, seed, speed)
    clip, cuts = clean_edges(trim(audio), SR, ps)
    return normalize(clip), cuts


SPEED = 0.9      # Kokoro speed: a little slower than Letter Chains, for kindergarten
MP3_LEVEL = 0.6  # libsndfile constant-bitrate setting that gives 64 kbps for 24 kHz mono


def load_phrases():
    out = subprocess.run(['node', os.path.join(LAB, 'tools', 'list-phrases.js')],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def spoken(text):
    t = text.strip()
    t = t if t[-1] in '.!?' else t + '.'
    for word, say in SAY_AS.items():
        t = re.sub(r'\b%s\b' % re.escape(word), say, t)
    return t


class Whisper:
    """Writes down the words it hears (openai/whisper-small.en, MIT)."""
    def __init__(self, name):
        from transformers import pipeline
        self.name = name
        self.asr = pipeline('automatic-speech-recognition', model=name, device='cpu')

    def __call__(self, x, sr):
        import qa
        return self.asr({'raw': qa.pad(qa.to16k(x, sr), 0.3), 'sampling_rate': 16000})['text'].strip()


class Phones:
    """Writes down the sounds it hears (facebook/wav2vec2-lv-60-espeak-cv-ft, Apache-2.0)."""
    def __init__(self, name):
        import qa
        from huggingface_hub import snapshot_download
        self.name = name
        self.rec = qa.W2V2(snapshot_download(name, allow_patterns=['*.json', 'pytorch_model.bin']))

    def listen(self, x, sr):
        """Log-probabilities per 20 ms frame, for decoding and for finding where each sound is."""
        import qa
        return self.rec.logprobs(qa.pad(qa.to16k(x, sr)))

    def __call__(self, x, sr):
        return self.rec.decode(self.listen(x, sr))


def check(clip, text, ps, whisper, phones, refs, voice_f0, SR, others=None, gender='f'):
    """Every per-clip check. others: the number-word vowels of the other lines, when they're known
    (remaking a few lines with --only), so a remake is compared with them while it retries."""
    import qa
    hy, flags = qa.hygiene(clip, SR)
    b, hnr = breathy(clip, SR)  # hnr is kept for ranking takes
    if b:
        flags.append(b)
    flags += edge_problems(clip, SR, ps)
    lp = phones.listen(clip, SR)
    exp, spans = align_phones(ps, lp, phones.rec)
    flags += glitches(clip, SR, text, word_spans(ps, exp, spans))
    heard = whisper(clip, SR)
    if not same_words(text, heard):
        flags.append('Whisper heard "%s"' % heard)
    sounds = phones.rec.decode(lp)
    flags += phone_problems(ps, sounds)
    vowels = measure_number_vowels(clip, SR, ps, exp, spans, gender)
    if others and len(ps.split()) > 1:
        flags += vowel_outliers(others + [dict(v, clip='__this__') for v in vowels]).get('__this__', [])
    if len(ps.split()) == 1:
        flags += vowel_problems(vowels, refs)
        creak = creak_share(clip, SR, voice_f0)
        if creak > MAX_CREAK:
            flags.append('creaky voice for %d%% of the word' % round(100 * creak))
    return {'heard': heard, 'sounds': sounds, 'vowels': vowels, 'hnr_db': hnr, 'hygiene': hy, 'reasons': flags}


def listen_page(manifest):
    """A plain local page for listening to every clip. Not part of the site."""
    rows = []
    for c in sorted(manifest['clips'], key=lambda c: (c['status'] == 'pass', c['order'])):
        rows.append('<tr class="%s"><td><audio controls preload="none" src="phrases/%s.mp3"></audio></td>'
                    '<td><b>%s</b><br><code>%s</code></td><td>%s<br><code>/%s/</code></td><td>%s</td></tr>' % (
                        c['status'], html.escape(c['id']), html.escape(c['text']), html.escape(c['id']),
                        html.escape(c['heard']), html.escape(c.get('sounds', '')),
                        html.escape('; '.join(c['reasons'] + c.get('set_reasons', []) + c['cuts']) or 'pass')))
    flagged = sum(1 for c in manifest['clips'] if c['status'] != 'pass')
    return ('<!doctype html><meta charset="utf-8"><title>Monster Math clips</title>\n'
            '<style>body{font:15px system-ui;margin:16px}td{padding:6px 10px;border-bottom:1px solid #ddd;'
            'vertical-align:top}tr.check{background:#fff4cc}code{color:#666}</style>\n'
            '<h1>Monster Math · %s</h1><p>%d clips, %d to check (shown first). Speed %s.</p>\n'
            '<table><tr><th>Clip</th><th>Line</th><th>Heard (words, sounds)</th><th>Checks</th></tr>\n%s\n</table>\n'
            % (html.escape(manifest['voice']), len(manifest['clips']), flagged, manifest['settings']['speed'],
               '\n'.join(rows)))


def set_checks(manifest, vdir):
    """Checks across clips: the counting clips should sound alike."""
    import soundfile as sf
    from engine import MS, POST_PAD_MS, PRE_PAD_MS, SR
    counts = {}
    for c in manifest['clips']:
        c['set_reasons'] = []
        if re.fullmatch(r'n-\d+', c['id']):
            x, _ = sf.read(os.path.join(vdir, 'wav', c['id'] + '.wav'), dtype='float32')
            counts[c['id']] = x[PRE_PAD_MS * MS:len(x) - POST_PAD_MS * MS]
    out = number_outliers(counts, SR)
    found = [dict(v, clip=c['id']) for c in manifest['clips'] if len(c['kokoro'].split()) > 1
             for v in c.get('vowels', [])]
    for cid, r in vowel_outliers(found).items():
        out.setdefault(cid, []).extend(r)
    for c in manifest['clips']:
        # a line remade with --only was already compared with the other lines while it retried
        c['set_reasons'] = [r for r in out.get(c['id'], []) if r not in c['reasons']]
        c['status'] = 'check' if c['reasons'] or c['set_reasons'] else 'pass'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', required=True)
    ap.add_argument('--voice', default='af_heart', help='a Kokoro voice; the checks were tuned on af_heart')
    ap.add_argument('--speed', type=float,
                    help='default %s, a little slower than Letter Chains, for kindergarten. --only and --review keep '
                         'the speed of the run already in --out' % SPEED)
    ap.add_argument('--only', help='comma-separated phrase ids; the rest of an existing manifest is kept')
    ap.add_argument('--review', action='store_true', help='check the clips already in --out again, without remaking them')
    ap.add_argument('--tries', type=int, default=7, help='takes to try per line, at most')
    ap.add_argument('--whisper', default='openai/whisper-small.en')
    ap.add_argument('--phones', default='facebook/wav2vec2-lv-60-espeak-cv-ft')
    ap.add_argument('--device', default='cpu', help='where Kokoro runs; the recognizers always run on the CPU')
    args = ap.parse_args()
    if args.tries < 1:
        ap.error('--tries must be at least 1')

    import soundfile as sf
    from engine import MS, POST_PAD_MS, PRE_PAD_MS, SR, Kokoro, padded, seed_for, sha, version, write

    phrases = load_phrases()
    order_of = {p['id']: i for i, p in enumerate(phrases)}
    want = set(args.only.split(',')) if args.only else None
    if want:
        unknown = sorted(want - set(order_of))
        if unknown:
            sys.exit('No phrase has the id %s' % ', '.join(unknown))
    vdir = os.path.join(args.out, args.voice)
    mpath = os.path.join(vdir, 'manifest.json')
    old = json.load(open(mpath, encoding='utf-8')) if os.path.exists(mpath) and (want or args.review) else None
    if args.review and not old:
        sys.exit('Nothing to review in %s' % vdir)
    if old and args.speed is not None and args.speed != old['settings']['speed']:
        sys.exit('The clips in %s were made at speed %s. To change it, remake every line (without --only).'
                 % (vdir, old['settings']['speed']))
    if want and not old:
        print('No earlier run in %s, so the new clips are not compared with the other lines.' % vdir, flush=True)

    whisper = Whisper(args.whisper)
    phones = Phones(args.phones)
    eng = Kokoro(args.device)
    t0 = time.time()
    manifest = {'voice': args.voice, 'engine': 'Kokoro-82M v1.0 (hexgrad/Kokoro-82M, Apache-2.0)',
                'created': time.strftime('%Y-%m-%d %H:%M'), 'sample_rate': SR,
                'versions': {p: version(p) for p in ['kokoro', 'misaki', 'torch', 'numpy', 'transformers',
                                                     'praat-parselmouth', 'pyloudnorm', 'soundfile']},
                'recognizers': {'words': args.whisper, 'sounds': args.phones},
                'settings': {'speed': SPEED if args.speed is None else args.speed, 'tries': args.tries, 'mp3_kbps': 64,
                             'min_hnr_db': MIN_HNR_DB},
                'clips': []}
    by_id = {c['id']: c for c in old['clips']} if old else {}
    if old:
        manifest['settings'] = old['settings']
    base_speed = manifest['settings']['speed']
    gender = gender_of(args.voice)
    refs, voice_f0 = build_vowel_refs(eng, args.voice, base_speed)
    manifest['vowel_refs'] = {v: [round(f) for f in ff] for v, ff in refs.items()}
    manifest['voice_f0'] = round(voice_f0)

    def show(entry):
        print('%-22s try %d  %-5s %s' % (entry['id'], entry['try'], entry['status'], '; '.join(entry['reasons'])),
              flush=True)

    failed = []  # lines no take could be made for
    if args.review:
        for cid, entry in by_id.items():
            if want and cid not in want:
                continue
            x, _ = sf.read(os.path.join(vdir, 'wav', cid + '.wav'), dtype='float32')
            c = check(x[PRE_PAD_MS * MS:len(x) - POST_PAD_MS * MS], entry['text'], entry['kokoro'], whisper, phones,
                      refs, voice_f0, SR, gender=gender)
            entry.update(heard=c['heard'], sounds=c['sounds'], vowels=c['vowels'], hnr_db=c['hnr_db'], hygiene=c['hygiene'],
                         reasons=c['reasons'], status='check' if c['reasons'] else 'pass')
            show(entry)
    else:
        def others_than(cid):
            return [dict(v, clip=c['id']) for c in by_id.values() if c['id'] != cid and len(c['kokoro'].split()) > 1
                    for v in c.get('vowels', [])]
        for p in phrases:
            if want and p['id'] not in want:
                continue
            ps = eng.g2p(spoken(p['text']))
            recipe = TAKES_ONE_WORD if len(ps.split()) == 1 else TAKES_LINE
            best = None
            tried = []
            for t in range(min(args.tries, len(recipe))):
                how, rel = recipe[t]
                speed = round(base_speed * rel, 3)
                seed = seed_for(args.voice, ps, 'phrase' if how == 'plain' else how, t)
                made = make_take(eng, args.voice, ps, how, speed, seed)
                if made is None:
                    tried.append({'try': t + 1, 'how': how, 'speed': speed, 'reasons': ['no pause to cut in']})
                    continue
                clip, cuts = made
                c = check(clip, p['text'], ps, whisper, phones, refs, voice_f0, SR, others_than(p['id']) if old else None,
                          gender)
                c.update(speed=speed, cuts=cuts, how=how)
                tried.append({'try': t + 1, 'how': how, 'speed': speed, 'heard': c['heard'], 'sounds': c['sounds'],
                              'cuts': cuts, 'reasons': list(c['reasons'])})
                rank = (len(c['reasons']), -(c['hnr_db'] or 0))
                if best is None or rank < best[0]:
                    best = (rank, t, seed, clip, c)
                if not c['reasons']:
                    break
            if best is None:
                print('%-22s no take could be made (no pause to cut in)' % p['id'], flush=True)
                failed.append(p['id'])
                continue
            _, t, seed, clip, c = best
            wav = os.path.join(vdir, 'wav', p['id'] + '.wav')
            mp3 = os.path.join(vdir, 'phrases', p['id'] + '.mp3')
            wav_sha = write(wav, clip)
            os.makedirs(os.path.dirname(mp3), exist_ok=True)
            sf.write(mp3, padded(clip), SR, format='MP3', bitrate_mode='CONSTANT', compression_level=MP3_LEVEL)
            back, _ = sf.read(mp3, dtype='float32')
            if abs(len(back) - len(padded(clip))) > SR // 10:
                c['reasons'].append('MP3 length differs from the master')
            by_id[p['id']] = {'id': p['id'], 'text': p['text'], 'kokoro': ps,
                              'status': 'check' if c['reasons'] else 'pass', 'reasons': c['reasons'],
                              'heard': c['heard'], 'sounds': c['sounds'], 'vowels': c['vowels'], 'hnr_db': c['hnr_db'],
                              'hygiene': c['hygiene'],
                              'try': t + 1, 'how': c['how'], 'seed': seed, 'speed': c['speed'], 'cuts': c['cuts'],
                              'duration_s': round(len(padded(clip)) / SR, 3),
                              'sha256_wav': wav_sha, 'sha256_mp3': sha(mp3), 'tries': tried}
            show(by_id[p['id']])

    for cid, entry in by_id.items():
        entry['order'] = order_of.get(cid, len(order_of))
    manifest['clips'] = sorted(by_id.values(), key=lambda c: c['order'])
    set_checks(manifest, vdir)
    for c in manifest['clips']:
        if c['set_reasons']:
            print('%-22s %s' % (c['id'], '; '.join(c['set_reasons'])), flush=True)
    with open(mpath, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1, default=lambda o: o.item() if hasattr(o, 'item') else str(o))
    with open(os.path.join(vdir, 'listen.html'), 'w', encoding='utf-8') as f:
        f.write(listen_page(manifest))
    flagged = [c['id'] for c in manifest['clips'] if c['status'] != 'pass']
    print('== %s: %d clips, %d to check%s, %.0f s. Listen: %s' % (
        args.voice, len(manifest['clips']), len(flagged), (' (%s)' % ', '.join(flagged)) if flagged else '',
        time.time() - t0, os.path.join(vdir, 'listen.html')), flush=True)
    if failed:
        sys.exit('No clip could be made for %s. Try again with more --tries.' % ', '.join(failed))


if __name__ == '__main__':
    main()
