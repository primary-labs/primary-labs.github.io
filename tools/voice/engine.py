"""Primary Labs · the Kokoro-82M voice engine and audio helpers shared by every lab's voice script.

    Kokoro(device)                       the model, with misaki's dictionary and no guessing
      .g2p(text)                         text -> phoneme string; an unknown word raises
      .synth(ps, voice, seed, speed)     phoneme string -> (audio, frames per token)
    trim, normalize, padded, write       cut silence, level, pad, save as 16-bit WAV

Audio is 24 kHz mono float32. normalize() aims for -20 LUFS (BS.1770 with 100 ms blocks) with peaks
below -1 dBFS, so clips from every lab play at the same level.
"""
import hashlib
import importlib.metadata as md
import os
import zlib

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

import qa

SR = 24000
HOP = 600            # one Kokoro duration frame = 600 samples = 25 ms
MS = SR // 1000      # samples per millisecond
TARGET_LUFS = -20.0
PEAK = 0.89          # about -1 dBFS
PRE_PAD_MS, POST_PAD_MS = 25, 60


def check_symbols(ps, vocab):
    """Kokoro silently drops any symbol it doesn't know (a keyboard g just vanishes), so refuse them."""
    bad = sorted({ch for ch in ps if ch not in vocab})
    if bad:
        names = ', '.join('%r (U+%04X)' % (c, ord(c)) for c in bad)
        raise ValueError('Kokoro does not know these symbols in %r: %s' % (ps, names))


class Kokoro:
    def __init__(self, device='cpu'):
        import torch
        from misaki import espeak

        class NoGuess:
            """misaki falls back to eSpeak for unknown words. We never want a guess, so an unknown
            word fails loudly instead (see g2p)."""
            def __init__(self, *a, **k):
                pass

            def __call__(self, token):
                return (None, None)

        espeak.EspeakFallback = NoGuess
        from kokoro import KPipeline
        self.torch = torch
        self.pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M', device=device)
        self.model = self.pipe.model
        self.vocab = self.model.vocab
        self.packs = {}

    def g2p(self, text):
        ps, tokens = self.pipe.g2p(text)
        missing = [t.text for t in tokens if any(c.isalpha() for c in t.text) and not t.phonemes]
        if missing:
            raise ValueError('No pronunciation for %s in %r. Add an override.' % (missing, text))
        return ps

    def synth(self, ps, voice, seed, speed=1.0):
        """Phoneme string -> (audio, frames per token). Same maths as KModel.forward_with_tokens,
        with a fixed random seed so a rebuild gives the same clips."""
        check_symbols(ps, self.vocab)
        torch, m = self.torch, self.model
        if voice not in self.packs:
            self.packs[voice] = self.pipe.load_voice(voice).to(m.device)
        ref_s = self.packs[voice][len(ps) - 1]
        torch.manual_seed(seed)
        with torch.no_grad():
            ids = torch.LongTensor([[0, *[self.vocab[c] for c in ps], 0]]).to(m.device)
            L = ids.shape[-1]
            lengths = torch.full((1,), L, dtype=torch.long, device=m.device)
            mask = torch.zeros(1, L, dtype=torch.bool, device=m.device)
            d_en = m.bert_encoder(m.bert(ids, attention_mask=(~mask).int())).transpose(-1, -2)
            s = ref_s[:, 128:]
            d = m.predictor.text_encoder(d_en, s, lengths, mask)
            x, _ = m.predictor.lstm(d)
            dur = torch.sigmoid(m.predictor.duration_proj(x)).sum(axis=-1) / speed
            pred = torch.round(dur).clamp(min=1).long().squeeze(0)
            idx = torch.repeat_interleave(torch.arange(L, device=m.device), pred)
            aln = torch.zeros((L, idx.shape[0]), device=m.device)
            aln[idx, torch.arange(idx.shape[0])] = 1
            aln = aln.unsqueeze(0)
            F0, N = m.predictor.F0Ntrain(d.transpose(-1, -2) @ aln, s)
            t_en = m.text_encoder(ids, lengths, mask)
            audio = m.decoder(t_en @ aln, F0, N, ref_s[:, :128]).squeeze().cpu().numpy().astype('float32')
        return audio, pred.cpu().tolist()


def edges_of(pred):
    """Sample boundaries of each token; token 0 is the start pad, token i+1 is character i.
    Kokoro's timings are only roughly where the sounds are."""
    return (np.cumsum([0] + list(pred)) * HOP).astype(int)


def seed_for(*parts):
    return zlib.crc32('|'.join(str(p) for p in parts).encode('utf-8'))


# ---------------------------------------------------------------- audio helpers

METER = pyln.Meter(SR, block_size=0.100)


def fade(x, in_ms=5, out_ms=15):
    y = x.astype('float32').copy()
    a, b = min(len(y) // 2, int(in_ms * MS)), min(len(y) // 2, int(out_ms * MS))
    if a:
        y[:a] *= np.linspace(0, 1, a, dtype='float32')
    if b:
        y[-b:] *= np.linspace(1, 0, b, dtype='float32')
    return y


def env(x):
    return qa.env_db(x, SR)


def trim(x, back_ms=30, keep_ms=80):
    """Cut silence with generous margins, so prevoicing and final releases are never lost."""
    e = env(x)
    pk = e.max()
    on = int(np.argmax(e > pk - 45))
    off = len(e) - 1 - int(np.argmax(e[::-1] > pk - 55))
    s = max(0, (on - back_ms) * MS)
    t = min(len(x), (off + keep_ms) * MS)
    return fade(x[s:t], 5, 15)


def loudness(x):
    try:
        L = METER.integrated_loudness(x.astype('float64'))
    except ValueError:
        return None
    return L if np.isfinite(L) else None


def normalize(x, lufs=TARGET_LUFS):
    L = loudness(x)
    g = 1.0 if L is None else 10 ** ((lufs - L) / 20)
    pk = float(np.abs(x).max()) * g
    if pk > PEAK:
        g *= PEAK / pk
    return (x * g).astype('float32')


def padded(x):
    return np.concatenate([np.zeros(PRE_PAD_MS * MS, 'float32'), x, np.zeros(POST_PAD_MS * MS, 'float32')])


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        h.update(f.read())
    return h.hexdigest()


def write(path, x):
    """Pads x and saves it as a 16-bit WAV. Returns the file's SHA-256."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sf.write(path, padded(x), SR, subtype='PCM_16')
    return sha(path)


def version(p):
    try:
        return md.version(p)
    except md.PackageNotFoundError:
        return None
