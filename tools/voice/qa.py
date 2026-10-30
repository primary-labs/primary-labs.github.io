"""Primary Labs — automatic checks for generated clips. Letter Chains uses all of them; Monster Math
uses the wav2vec2 recognizer, the level, pitch, voicing, formant and HNR measurements, and hygiene.

Two kinds of checks, both local:
  - phoneme recognizers (ZIPA and wav2vec2-espeak) score how well a clip matches its target phones
  - acoustic measurements (Praat via parselmouth): voicing onset (VOT), stop releases, a vowel added
    after a final stop, whispering, vowel formants, steadiness of held sounds

The recognizers have known biases on this audio (wav2vec2 almost never outputs /æ/; ZIPA often hears
/ɪ/ as /ɛ/ and /ʌ/ as /ɑ/), so they rank takes of the same item and raise a warning only when both
agree. A person listens and makes the final call.
"""
import itertools
import json
import math
import os

import numpy as np
import parselmouth
from parselmouth.praat import call
from scipy.signal import butter, resample_poly, sosfiltfilt

SR16 = 16000


def to16k(x, sr):
    if sr == SR16:
        return x.astype('float32')
    g = math.gcd(sr, SR16)
    return resample_poly(x, SR16 // g, sr // g).astype('float32')


def pad(x, sec=0.5):
    z = np.zeros(int(sec * SR16), 'float32')
    return np.concatenate([z, x, z])


# ---------------------------------------------------------------- recognizers

VOWEL_POOL = ['æ', 'ɛ', 'ɪ', 'i', 'ʌ', 'ɑ', 'ɔ', 'o', 'e', 'ə', 'ʊ', 'u', 'a']
CONS_POOL = ['t', 'd', 'k', 'ɡ', 'p', 'b', 'n', 'm', 'ŋ', 's', 'z', 'dʒ', 'tʃ', 'ʔ', 'ɾ', 'θ', 'ð', 'h', 'l', 'j']
VOWELS = set(VOWEL_POOL) | {'oʊ', 'eɪ', 'aɪ', 'aʊ', 'ɔɪ'}
STOPS = {'t', 'd', 'k', 'ɡ', 'p', 'b'}


class _CTC:
    """CTC phone recognizer with substitution GOP: for each target phone, how much more likely the
    target sequence is than the best wrong version of it (one phone swapped or deleted)."""
    name = 'ctc'
    blank = 0
    equiv = {}
    prefix = []

    def tokens(self, phone):
        raise NotImplementedError

    def has(self, phone):
        try:
            self.tokens(phone)
            return True
        except KeyError:
            return False

    def seq_logp(self, lp, phones):
        import torch
        ids = []
        for p in phones:
            ids += self.tokens(p)
        ids = self.prefix + ids
        if not ids:
            return float(lp[:, self.blank].sum())
        loss = torch.nn.functional.ctc_loss(
            lp.unsqueeze(1), torch.tensor([ids]), torch.tensor([lp.shape[0]]), torch.tensor([len(ids)]),
            blank=self.blank, reduction='sum', zero_infinity=False)
        v = -float(loss)
        return v if math.isfinite(v) else -1e9

    def best_variant(self, lp, target):
        opts = [[o for o in self.equiv.get(p, [p]) if self.has(o)] or [p] for p in target]
        best = (-1e9, list(target))
        for combo in itertools.product(*opts):
            s = self.seq_logp(lp, list(combo))
            if s > best[0]:
                best = (s, list(combo))
        return best

    def score(self, x16, target):
        lp = self.logprobs(pad(x16))
        decoded = self.decode(lp)
        s_t, tv = self.best_variant(lp, target)
        per = []
        for k, ph in enumerate(target):
            pool = VOWEL_POOL if ph in VOWELS else CONS_POOL
            eq = set(self.equiv.get(ph, [ph]))
            alts = [(self.seq_logp(lp, tv[:k] + [c] + tv[k + 1:]), c)
                    for c in pool if c not in eq and self.has(c)]
            alts.append((self.seq_logp(lp, tv[:k] + tv[k + 1:]), 'nothing'))
            b = max(alts)
            per.append({'phone': ph, 'margin': round(s_t - b[0], 2), 'competitor': b[1]})
        add_v = max(self.seq_logp(lp, tv + [v]) for v in ['ə', 'ʌ'] if self.has(v))
        return {'heard': decoded, 'per_phone': per, 'min_margin': min(p['margin'] for p in per),
                'add_vowel_margin': round(s_t - add_v, 2)}


class Zipa(_CTC):
    """ZIPA-CR small (MIT code, CC BY 4.0 weights), ONNX on CPU."""
    name = 'zipa'
    equiv = {'æ': ['æ', 'æː'], 'ɪ': ['ɪ', 'ɪː'], 'ɑ': ['ɑ', 'ɑː', 'ɒ'], 't': ['t', 'tʰ'], 'k': ['k', 'kʰ'],
             'u': ['u', 'uː'], 'oʊ': ['oʊ', 'o', 'oː']}

    def __init__(self, model_dir):
        import onnxruntime as ort
        from lhotse.features import Fbank, FbankConfig
        self.model_dir = model_dir
        self.tok = {}
        for line in open(os.path.join(model_dir, 'tokens.txt'), encoding='utf-8'):
            t, i = line.split()
            self.tok[t] = int(i)
        self.inv = {i: t for t, i in self.tok.items()}
        self.sess = ort.InferenceSession(os.path.join(model_dir, 'model.onnx'), providers=['CPUExecutionProvider'])
        self.fb = Fbank(FbankConfig(num_filters=80, dither=0.0, snip_edges=False))
        self.prefix = [self.tok['▁']]  # ZIPA writes a word-boundary token before each word

    def tokens(self, phone):
        return [self.tok[c] for c in phone.replace('ɡ', 'g')]

    def logprobs(self, x16):
        import torch
        feats = self.fb.extract(x16, SR16)[None].astype('float32')
        out = self.sess.run(None, {'x': feats, 'x_lens': np.array([feats.shape[1]], dtype=np.int64)})[0][0]
        return torch.log_softmax(torch.from_numpy(out), -1)

    def decode(self, lp):
        out, prev = [], None
        for i in lp.argmax(-1).tolist():
            if i != prev and i != 0:
                out.append(self.inv[i])
            prev = i
        return ''.join(out).replace('▁', ' ').strip().replace('g', 'ɡ')


class W2V2(_CTC):
    """facebook/wav2vec2-lv-60-espeak-cv-ft (Apache-2.0), limited to English phones."""
    name = 'w2v2'
    equiv = {'æ': ['æ'], 'ɪ': ['ɪ'], 'ɑ': ['ɑː', 'ɑ', 'ɒ'], 'i': ['iː', 'i'], 'u': ['uː'], 'ɔ': ['ɔː', 'ɔ'],
             'e': ['eɪ'], 'o': ['oʊ'], 'a': ['aɪ']}
    ENGLISH = ('p b t d k ɡ f v θ ð s z ʃ ʒ h tʃ dʒ m n ŋ l ɹ j w ɾ ʔ ɫ iː ɪ eɪ ɛ æ ɑː ɑ ɒ ɔ ɔː oʊ ʊ uː ʌ ə ɚ '
               'ɜː aɪ aʊ ɔɪ ᵻ i ɐ ɑːɹ ɔːɹ ɛɹ ɪɹ ʊɹ oːɹ əl n̩ l̩ aɪə aɪɚ eə ɜ oː').split()

    def __init__(self, model_dir, device='cpu'):
        import torch
        from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForCTC
        self.model_dir = model_dir
        self.vocab = json.load(open(os.path.join(model_dir, 'vocab.json'), encoding='utf-8'))
        self.inv = {i: p for p, i in self.vocab.items()}
        self.blank = self.vocab['<pad>']
        self.fe = Wav2Vec2FeatureExtractor.from_pretrained(model_dir)
        self.model = Wav2Vec2ForCTC.from_pretrained(model_dir).eval().to(device)
        self.device = device
        mask = torch.full((len(self.vocab),), float('-inf'))
        mask[[self.vocab[p] for p in self.ENGLISH + ['<pad>'] if p in self.vocab]] = 0
        self.mask = mask

    def tokens(self, phone):
        return [self.vocab[phone]]

    def logprobs(self, x16):
        import torch
        with torch.no_grad():
            inp = self.fe(x16, sampling_rate=SR16, return_tensors='pt').input_values.to(self.device)
            logits = self.model(inp).logits[0].float().cpu()
        return torch.log_softmax(logits + self.mask, -1)

    def decode(self, lp):
        out, prev = [], None
        for i in lp.argmax(-1).tolist():
            if i != prev and i != self.blank:
                out.append(self.inv[i])
            prev = i
        return ' '.join(out)


def heard_matches(heard, target):
    """Loose comparison of a ZIPA decode with the target phones."""
    norm = lambda s: s.replace(' ', '').replace('ː', '').replace('ʰ', '').replace('ɒ', 'ɑ').replace('̚', '')
    return norm(heard) == norm(''.join(target))


# ---------------------------------------------------------------- level and voicing

def env_db(x, sr, win_ms=5, hop_ms=1):
    """Short-time level in dB re full scale, one value per hop, floored at -100."""
    w, h = int(sr * win_ms / 1000), int(sr * hop_ms / 1000)
    n = max(1, (len(x) - w) // h + 1)
    out = np.empty(n)
    for i in range(n):
        seg = x[i * h:i * h + w]
        out[i] = 20 * np.log10(np.sqrt(np.mean(seg * seg)) + 1e-9)
    return np.maximum(out, -100.0)


def band_env(x, sr, lo=None, hi=None, win_ms=5, hop_ms=1):
    """Level of one frequency band, in dB per hop."""
    if lo and hi:
        sos = butter(4, [lo, hi], 'bandpass', fs=sr, output='sos')
    elif lo:
        sos = butter(4, lo, 'highpass', fs=sr, output='sos')
    else:
        sos = butter(4, hi, 'lowpass', fs=sr, output='sos')
    return env_db(sosfiltfilt(sos, x).astype('float32'), sr, win_ms, hop_ms)


def pitch(x, sr, floor=75, ceiling=500, step=0.005):
    """Praat pitch track: (times, f0 with 0 for unvoiced)."""
    snd = parselmouth.Sound(x.astype('float64'), sampling_frequency=sr)
    p = snd.to_pitch(time_step=step, pitch_floor=floor, pitch_ceiling=ceiling)
    return p.xs(), p.selected_array['frequency']


def voiced_mask(x, sr, floor=75, ceiling=500, step=0.005):
    ts, f0 = pitch(x, sr, floor, ceiling, step)
    return ts, f0 > 0


def voiced_run(x, sr):
    """Start and end (s) of the longest stretch of voicing."""
    ts, v = voiced_mask(x, sr)
    best, cur, start = (0, 0, 0), 0, 0
    for i, on in enumerate(v):
        if on:
            if cur == 0:
                start = i
            cur += 1
            if cur > best[0]:
                best = (cur, start, i)
        else:
            cur = 0
    if not best[0]:
        return None
    return float(ts[best[1]]), float(ts[best[2]])


def vowel_core(x, sr, drop_db=12):
    """The loud part of the longest voiced stretch: the vowel, without the hum of a closure or nasal
    around it. Returns (start, end) in seconds."""
    run = voiced_run(x, sr)
    if not run:
        return None
    e = env_db(x, sr, 10, 5)
    a, b = int(run[0] * 200), min(len(e), int(run[1] * 200) + 1)
    if b - a < 3:
        return run
    seg = e[a:b]
    pk = int(np.argmax(seg))
    lo = hi = pk
    while lo > 0 and seg[lo - 1] >= seg[pk] - drop_db:
        lo -= 1
    while hi < len(seg) - 1 and seg[hi + 1] >= seg[pk] - drop_db:
        hi += 1
    return (a + lo) * 0.005, (a + hi) * 0.005 + 0.01


def vowel_peak_db(x, sr):
    core = vowel_core(x, sr)
    e = env_db(x, sr)
    if not core:
        return float(e.max())
    seg = e[int(core[0] * 1000):int(core[1] * 1000)]
    return float(seg.max()) if len(seg) else float(e.max())


def vowel_f0(x, sr):
    core = vowel_core(x, sr)
    if not core:
        return None
    ts, f0 = pitch(x, sr)
    m = (ts >= core[0]) & (ts <= core[1]) & (f0 > 0)
    return float(np.median(f0[m])) if m.any() else None


def periodic_spans(x, sr, ref_f0, tol=0.35, min_ms=15):
    """(start, end) spans in s of regular voicing near the vowel's pitch, each at least min_ms long.
    Breathy noise, creak and octave errors don't count."""
    ts, f0 = pitch(x, sr, floor=max(60, 0.6 * ref_f0), ceiling=min(600, 1.8 * ref_f0))
    ok = (f0 > 0) & (np.abs(f0 - ref_f0) <= tol * ref_f0)
    spans, start = [], None
    for i, on in enumerate(ok):
        if on and start is None:
            start = i
        if start is not None and (not on or i == len(ok) - 1):
            end = i if on else i - 1
            if (end - start + 1) * 5 >= min_ms:
                spans.append((float(ts[start]), float(ts[end])))
            start = None
    return spans


def voiced_ms(x, sr):
    ts, v = voiced_mask(x, sr)
    return int(v.sum() * 5)


def voiced_ms_after(x, sr, t_s):
    ts, v = voiced_mask(x, sr)
    return int(round(np.sum(v[ts > t_s]) * 5))


def hnr_db(x, sr, t0, t1, f0=None):
    """Harmonics-to-noise ratio over [t0, t1]: low values mean whispered or breathy."""
    snd = parselmouth.Sound(x.astype('float64'), sampling_frequency=sr)
    floor = max(60, 0.6 * f0) if f0 else 75
    h = call(snd, 'To Harmonicity (cc)', 0.01, floor, 0.1, 1.0)
    v = call(h, 'Get mean', t0, t1)
    return round(float(v), 1) if v == v else None


# ---------------------------------------------------------------- stops

def find_burst(x, sr, t0, t1):
    """Stop release: the sharpest rise in the 3 kHz+ band between t0 and t1 (s). Bursts are mostly
    high-frequency, so they hide under a fading vowel in the overall level."""
    hb = band_env(x, sr, lo=3000)
    a, b = max(0, int(t0 * 1000)), min(len(hb), int(t1 * 1000))
    seg = hb[a:b]
    if len(seg) < 6:
        return None
    j = seg[3:] - seg[:-3]
    i = int(np.argmax(j)) + 3
    return {'t': (a + i) / 1000, 'jump_db': round(float(j.max()), 1), 'level_db': round(float(seg[i]), 1),
            'level_rel_db': round(float(seg[i] - hb.max()), 1)}


def initial_burst(x, sr):
    """Release of a word-initial stop: first 3 kHz+ energy within 30 dB of its peak (s)."""
    hb = band_env(x, sr, lo=3000)
    return int(np.argmax(hb > hb.max() - 30)) / 1000


def onset_vot(x, sr):
    """Voice onset time of a word-initial stop, in ms: from the release to the first regular voicing
    near the vowel's pitch. Negative means voicing already runs through the release (prevoiced)."""
    f0v = vowel_f0(x, sr)
    if not f0v:
        return None
    burst = initial_burst(x, sr)
    spans = periodic_spans(x, sr, f0v)
    for s, e in spans:
        if e < burst:
            continue
        return int(round((s - burst) * 1000))
    return None


def prevoicing(x, sr):
    """Voicing before the release of a word-initial voiced stop: (ms, loudest level dB re vowel peak)."""
    burst = initial_burst(x, sr)
    ts, v = voiced_mask(x, sr)
    pre = (ts < burst) & v
    if not pre.any():
        return 0, -99.0
    e = env_db(x, sr, 20, 1)
    seg = e[int(ts[pre][0] * 1000):max(int(ts[pre][0] * 1000) + 1, int(burst * 1000) - 3)]
    return int(pre.sum() * 5), round(float(seg.max()) - vowel_peak_db(x, sr), 1)


def initial_murmur_db(x, sr):
    """Level of a word-initial nasal re the vowel after it (typical levels, dB). The vowel starts
    where 1-4 kHz energy rises to within 10 dB of its peak; the nasal hum before it has little."""
    run = voiced_run(x, sr)
    if not run:
        return None
    mid = band_env(x, sr, lo=1000, hi=4000, win_ms=10, hop_ms=5)
    e = env_db(x, sr, 10, 5)
    a, b = int(run[0] * 200), min(len(mid), int(run[1] * 200) + 1)
    seg = mid[a:b]
    if len(seg) < 4:
        return None
    on = a + int(np.argmax(seg > seg.max() - 10))
    if on - a < 2:
        return None
    return round(float(np.median(e[a:on])) - float(np.median(e[on:b])), 1)


def final_release(x, sr):
    """Is a final voiceless stop clearly released, and is a voiced 'uh' added after it?
    Burst level is measured against the vowel's peak (not the clip's own high band, which a loud
    initial burst would dominate)."""
    run = voiced_run(x, sr)
    if not run:
        return None
    b = find_burst(x, sr, run[1] - 0.01, run[1] + 0.3)
    if not b:
        return {'jump_db': 0.0, 're_vowel_db': -99.0, 'noise_ms': 0, 'voiced_after_ms': 0}
    t = int(b['t'] * 1000)
    e = env_db(x, sr)
    lvl = float(e[max(0, t - 2):t + 8].max())
    hb = band_env(x, sr, lo=3000)
    live = np.nonzero(hb[t:t + 300] > hb[t] - 20)[0]
    f0v = vowel_f0(x, sr)
    after, uh_start = 0, None
    if f0v:
        for s, e2 in periodic_spans(x, sr, f0v, tol=0.4, min_ms=10):
            lo, hi = max(s, b['t'] + 0.01), min(e2, b['t'] + 0.13)
            if hi > lo:
                after += int(round((hi - lo) * 1000))
                uh_start = lo if uh_start is None else uh_start
    return {'jump_db': b['jump_db'], 're_vowel_db': round(lvl - vowel_peak_db(x, sr), 1),
            'noise_ms': int(live[-1]) if len(live) else 0, 'voiced_after_ms': after, 't': b['t'],
            'uh_start': uh_start}


def onset_residue_db(x, sr):
    """Leftover sound from a carrier phrase before the word: 3 kHz+ energy in the first 15 ms,
    re the clip's own high-band peak. Near 0 means something loud and hissy starts the clip."""
    hb = band_env(x, sr, lo=3000)
    return round(float(hb[:15].max() - hb.max()), 1)


# ---------------------------------------------------------------- vowels

def formants(x, sr, t0, t1, gender):
    """Median F1/F2 between t0 and t1 s. Several analysis ceilings are tried and frames that can't be
    real (F1 < 250 Hz, F2 within 300 Hz of F1) are dropped, because a single Burg setting jumps
    between formants on these voices. Keeps the ceiling whose track is steadiest."""
    snd = parselmouth.Sound(x.astype('float64'), sampling_frequency=sr)
    ceilings = [4500, 5000, 5500] if gender == 'm' else [5000, 5500, 6000]
    ts = np.arange(t0, max(t0 + 0.006, t1), 0.005)
    best = None
    for c in ceilings:
        fm = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=c)
        f1 = np.array([fm.get_value_at_time(1, t) for t in ts], dtype=float)
        f2 = np.array([fm.get_value_at_time(2, t) for t in ts], dtype=float)
        ok = ~np.isnan(f1) & ~np.isnan(f2) & (f1 >= 250) & (f2 - f1 >= 300)
        if ok.sum() < max(2, 0.5 * len(ts)):
            continue
        a, b = f1[ok], f2[ok]
        cost = float(np.std(b) + 0.5 * np.std(a))
        if best is None or cost < best['cost']:
            best = {'F1': float(np.median(a)), 'F2': float(np.median(b)), 'F2_sd': float(np.std(b)),
                    'ceiling': c, 'cost': round(cost, 1)}
    return best


def logdist(a, b):
    return math.hypot(math.log(a['F1'] / b['F1']), math.log(a['F2'] / b['F2']))


def nearest_vowel(f, refs, target=None, usable=None):
    """Nearest reference vowel in log-formant space. With `usable`, only competitors the voice's own
    references really separate from the target are compared."""
    if not f:
        return None, {}
    d = {}
    for v, r in refs.items():
        if not r:
            continue
        if target and usable is not None and v != target and v not in usable.get(target, ()):
            continue
        d[v] = logdist(f, r)
    if not d:
        return None, {}
    return min(d, key=d.get), d


def steadiest(x, sr, t0, t1, win_s, gender):
    """Window of win_s inside [t0, t1] where vowel quality and pitch change least, avoiding creak."""
    snd = parselmouth.Sound(x.astype('float64'), sampling_frequency=sr)
    fm = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5,
                             maximum_formant=5000 if gender == 'm' else 5500)
    ts = np.arange(t0, t1, 0.005)
    f1 = np.array([fm.get_value_at_time(1, t) for t in ts], dtype=float)
    f2 = np.array([fm.get_value_at_time(2, t) for t in ts], dtype=float)
    pt, f0 = pitch(x, sr)
    f0i = np.interp(ts, pt, f0) if len(pt) else np.zeros(len(ts))
    lvl = np.interp(ts, np.arange(len(env_db(x, sr, 10, 5))) * 0.005, env_db(x, sr, 10, 5))
    n = int(round(win_s / 0.005))
    best = None
    for i in range(0, len(ts) - n + 1):
        a, b, p, l = f1[i:i + n], f2[i:i + n], f0i[i:i + n], lvl[i:i + n]
        if len(a) < n or np.isnan(a).any() or np.isnan(b).any() or (p <= 0).any():
            continue
        cost = float(np.std(b) + 0.5 * np.std(a) + 4 * np.std(p) + 20 * np.std(l))
        if best is None or cost < best[0]:
            best = (cost, float(ts[i]), float(np.median(a)), float(np.median(b)), float(np.std(b)), float(np.median(p)))
    if best is None:
        return None
    return {'start': best[1], 'F1': best[2], 'F2': best[3], 'F2_sd': best[4], 'f0': best[5], 'cost': round(best[0], 1)}


def lengthen(x, sr, factor, f0=None):
    """Pitch-synchronous overlap-add (Praat PSOLA through a Manipulation): longer, same vowel quality.
    With f0, the pitch is set to a gentle fall of about 1 semitone around f0, so a held sound doesn't
    sag like a sigh (a perfectly flat pitch sounds robotic). Praat's overlap-add stretches at most 3x
    per pass, so bigger factors run in equal passes."""
    steps = max(1, int(math.ceil(math.log(factor) / math.log(2.8)))) if factor > 1 else 1
    per = factor ** (1.0 / steps)
    y = x.astype('float64')
    for k in range(steps):
        snd = parselmouth.Sound(y, sampling_frequency=sr)
        manip = call(snd, 'To Manipulation', 0.01, 75, 600)
        if f0 and k == 0:
            pt = call(manip, 'Extract pitch tier')
            call(pt, 'Remove points between', 0, snd.duration)
            call(pt, 'Add point', 0.0, float(f0) * 1.03)
            call(pt, 'Add point', snd.duration, float(f0) * 0.97)
            call([manip, pt], 'Replace pitch tier')
        tier = call(manip, 'Extract duration tier')
        call(tier, 'Add point', 0.0, float(per))
        call([manip, tier], 'Replace duration tier')
        y = call(manip, 'Get resynthesis (overlap-add)').values[0]
    want = int(round(len(x) * factor))
    y = y[:want] if len(y) >= want else np.concatenate([y, np.zeros(want - len(y))])
    return y.astype('float32')


def psola(x, sr, factor, keep=0.5, fall_st=1.0, wobble_pct=0.0, seed=0, centre_hz=None):
    """Lengthen with Praat PSOLA while keeping the voice alive.

    The pitch contour is straightened (its overall rise or fall removed) and replaced by a gentle
    fall of fall_st semitones, but `keep` of the voice's own small pitch movements stays, and
    wobble_pct adds a slow random drift (a few cents) like a real held sound. A perfectly flat
    pitch, or many copies of one pitch period, is what makes a stretched vowel sound robotic, so
    keep factor small (pick a long natural window first)."""
    y = x.astype('float64')
    snd = parselmouth.Sound(y, sampling_frequency=sr)
    dur = snd.duration
    manip = call(snd, 'To Manipulation', 0.01, 75, 600)
    pt = call(manip, 'Extract pitch tier')
    n = call(pt, 'Get number of points')
    if n >= 3:
        t = np.array([call(pt, 'Get time from index', i + 1) for i in range(n)])
        f = np.log2(np.array([call(pt, 'Get value at index', i + 1) for i in range(n)]))
        slope, icpt = np.polyfit(t, f, 1)
        resid = f - (slope * t + icpt)
        centre = float(np.log2(centre_hz)) if centre_hz else float(np.median(f))
        line = centre + (fall_st / 12.0) * (0.5 - t / dur)
        new = line + keep * resid
        if wobble_pct:
            rng = np.random.default_rng(seed)
            k = np.linspace(0, dur, max(4, int(dur * 8)))  # a new random target every ~125 ms
            w = np.interp(t, k, rng.standard_normal(len(k)))
            new = new + np.log2(1 + wobble_pct / 100.0) * w
        call(pt, 'Remove points between', 0, dur)
        for ti, fi in zip(t, new):
            call(pt, 'Add point', float(ti), float(2 ** fi))
        call([manip, pt], 'Replace pitch tier')
    steps = max(1, int(math.ceil(math.log(factor) / math.log(2.8)))) if factor > 1 else 1
    per = factor ** (1.0 / steps)
    for k in range(steps):
        if k:
            snd = parselmouth.Sound(y, sampling_frequency=sr)
            manip = call(snd, 'To Manipulation', 0.01, 75, 600)
        tier = call(manip, 'Extract duration tier')
        call(tier, 'Add point', 0.0, float(per))
        call([manip, tier], 'Replace duration tier')
        y = call(manip, 'Get resynthesis (overlap-add)').values[0]
    want = int(round(len(x) * factor))
    y = y[:want] if len(y) >= want else np.concatenate([y, np.zeros(want - len(y))])
    return y.astype('float32')


def repeat_fraction(x, sr):
    """Share of neighbouring pitch periods that are near-identical copies (correlation > 0.995).
    Natural vowels sit low; heavily stretched PSOLA output sits high and sounds mechanical."""
    snd = parselmouth.Sound(x.astype('float64'), sampling_frequency=sr)
    try:
        pp = call(snd, 'To PointProcess (periodic, cc)', 70, 500)
    except Exception:
        return None
    n = call(pp, 'Get number of points')
    tt = np.array([call(pp, 'Get time from index', i + 1) for i in range(n)])
    cs = []
    for i in range(1, len(tt) - 1):
        a = x[int(tt[i - 1] * sr):int(tt[i] * sr)]
        b = x[int(tt[i] * sr):int(tt[i + 1] * sr)]
        L = min(len(a), len(b))
        if L < 20 or abs(len(a) - len(b)) > 3:
            cs.append(0.0)
            continue
        a, b = a[:L], b[:L]
        cs.append(float(np.dot(a, b) / np.sqrt(np.dot(a, a) * np.dot(b, b) + 1e-18)))
    return round(float(np.mean(np.array(cs) > 0.995)), 2) if cs else None


def voice_quality(x, sr, f0, skip_start_s=0.05, skip_end_s=0.08):
    """Jitter and shimmer (Praat, local; pitch floor tied to the voice so it can't lock onto half
    the pitch) and the deepest level dip, ignoring the fade-in and fade-out."""
    snd = parselmouth.Sound(x.astype('float64'), sampling_frequency=sr)
    out = {'jitter_pct': None, 'shimmer_pct': None}
    floor, ceil = max(60, 0.7 * f0), min(600, 1.6 * f0)
    t0, t1 = skip_start_s, max(skip_start_s + 0.05, len(x) / sr - skip_end_s)
    try:
        pp = call(snd, 'To PointProcess (periodic, cc)', floor, ceil)
        out['jitter_pct'] = round(100 * call(pp, 'Get jitter (local)', t0, t1, 0.0001, 0.02, 1.3), 2)
        out['shimmer_pct'] = round(100 * call([snd, pp], 'Get shimmer (local)', t0, t1, 0.0001, 0.02, 1.3, 1.6), 2)
    except Exception:
        pass
    e = env_db(x, sr, 10, 5)
    mid = e[int(t0 * 200):int(t1 * 200)]
    out['dip_db'] = round(float(np.median(mid) - mid.min()), 1) if len(mid) else 0.0
    return out


def max_rms_db(x, sr, win_ms=50):
    return float(env_db(x, sr, win_ms, 5).max())


def hygiene(x, sr):
    """Edges, peak and clipping."""
    n5 = int(0.005 * sr)
    lvl = lambda s: float(20 * np.log10(np.sqrt(np.mean(s * s)) + 1e-9))
    out = {'dur_s': round(len(x) / sr, 3), 'first5_db': round(lvl(x[:n5]), 1), 'last5_db': round(lvl(x[-n5:]), 1),
           'peak_db': round(float(20 * np.log10(np.abs(x).max() + 1e-12)), 2), 'clipped': int(np.sum(np.abs(x) >= 0.999))}
    flags = []
    if out['last5_db'] > -50:
        flags.append('ends mid-sound')
    if out['clipped']:
        flags.append('clipping')
    return out, flags
