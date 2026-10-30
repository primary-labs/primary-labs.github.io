#!/usr/bin/env python3
"""Primary Labs · Letter Chains — make the default-voice audio pack with Kokoro-82M.

    python letter_chains.py --out DIR [--voices af_heart,af_nicole,am_michael]
                            [--zipa MODEL_DIR] [--w2v2 MODEL_DIR] [--only words,keywords,sentences,sounds]

Words, keywords and letter sounds are made from exact phoneme strings (see phonemes.py), never from
spelling. Sentences go through Kokoro's dictionary, with the lesson word (and "on") forced to the
same phonemes as its word clip; a word the dictionary doesn't know stops the build.

Each word is said several ways (alone, with a full stop or "!", a little faster or slower, and as a
fallback cut out of "The word is ..."). Every take is checked, and the one kept is the one with the
fewest problems: first no hard problems (whispered, clipped, leftover sound from the carrier), then
the fewest phoneme problems, then the best recognizer and acoustic score. Letter sounds are cut out
of words said by the same voice.

Writes, for each voice:
    DIR/<voice>/words/<word>.wav          every word a chain can use
    DIR/<voice>/keywords/<keyword>.wav    apple, igloo, octopus, ...
    DIR/<voice>/sentences/<word>.wav      the sentence for each word that has one
    DIR/<voice>/sounds/<letter>.wav       the letter sound, e.g. sounds/t.wav is /t/
    DIR/<voice>/sounds/<letter>-long.wav  held version of a, i, o and n, for blending
    DIR/<voice>/manifest.json             targets, which take was kept, check results, notes
and every take that was tried under DIR/takes/<voice>/.

Masters are 24 kHz mono 16-bit WAV. Words, keywords, sentences and held sounds are about -20 LUFS
(BS.1770 with 100 ms blocks, as a relative target); stop letter sounds sit 8 dB below the same
voice's vowel letter sounds. Peaks stay below -1 dBFS.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'labs', 'letter-chaining')
sys.path.insert(0, HERE)
import phonemes as P  # noqa: E402
import qa  # noqa: E402
from engine import (MS, PEAK, PRE_PAD_MS, SR, TARGET_LUFS, Kokoro, edges_of, env, fade,  # noqa: E402
                    normalize, padded, seed_for, trim, version, write)

STOP_BELOW_VOWELS_DB = 8.0
STOP_MAX_GAIN_DB = 15.0

# Notes shown next to a clip when reviewing it, and notes for the owner only (both in the manifest).
TEACHER_NOTES = {
    ('words', 'ton'): 'Said "tahn", with the short o of tot, so the chain tin → ton → tot changes one sound. '
                      'The lab treats it as a made-up word (no picture or sentence).',
    ('words', 'dog'): 'Short o as in dot ("dahg"), so dot → dog changes one sound.',
    ('words', 'cog'): 'Short o as in cot ("kahg").', ('words', 'tog'): 'Short o as in tot ("tahg").',
    ('words', 'nog'): 'Short o as in not ("nahg").', ('words', 'gog'): 'Short o as in got ("gahg").',
    ('sentences', 'dog'): '"dog" here should match the word clip: "dahg".',
    ('sentences', 'cog'): '"cog" here should match the word clip: "kahg".',
}
OWNER_NOTES = {
    'cac': 'Consider blocking: crude slang for excrement (UK "cack", South African "kak") and a slur sense in some dictionaries.',
    'nog': 'Consider blocking: part of a British ethnic slur.',
    'gat': 'Consider blocking: slang for a gun.', 'nad': 'Consider blocking: crude slang ("nads").',
    'god': 'Review: religious word in a public-school product.',
    'dat': 'Review: reads as a respelling of "that" when spoken.',
    'gon': 'Review: reads as slang for "gonna" when spoken.', 'nic': 'Review: slang for nicotine.',
}

HARD = ('whispered', 'clipping', 'ends mid-sound', 'leftover sound', 'no quiet gap')


# ---------------------------------------------------------------- content

def load_content():
    js = (
        "const fs=require('fs'),vm=require('vm');const sb={window:{}};"
        "vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),sb);const PL=sb.window.PL;"
        "console.log(JSON.stringify({letters:PL.LETTERS,words:PL.cvcWords(),"
        "sentences:Object.keys(PL.WORDS).sort().filter(w=>PL.WORDS[w].sentence)"
        ".map(w=>({word:w,text:PL.WORDS[w].sentence}))}));"
    )
    out = subprocess.run(['node', '-e', js, os.path.join(LAB, 'js', 'data.js')],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


# ---------------------------------------------------------------- reference vowels

def build_refs(eng, voice, gender):
    """The voice's own reference vowels, each the median over three contexts (h_d, b_d, p_p).
    Pairs the references don't clearly separate are left out of the vowel check for this voice,
    and implausible orderings are reported."""
    refs, notes, f0s = {}, [], []
    for v in P.REFERENCE_VOWELS:
        vals = []
        for frame in ('hˈ%sd', 'bˈ%sd', 'pˈ%sp'):
            ps = frame % v
            audio, _ = eng.synth(ps, voice, seed_for(voice, ps, 'ref'))
            core = qa.vowel_core(audio, SR)
            if not core:
                continue
            f0 = qa.vowel_f0(audio, SR)
            if f0:
                f0s.append(f0)
            f = qa.formants(audio, SR, core[0] + 0.3 * (core[1] - core[0]), core[0] + 0.7 * (core[1] - core[0]), gender)
            if f:
                vals.append(f)
        refs[v] = {'F1': float(np.median([f['F1'] for f in vals])), 'F2': float(np.median([f['F2'] for f in vals]))} if vals else None
    usable = {}
    for v in refs:
        usable[v] = [u for u in refs if u != v and refs[v] and refs[u] and qa.logdist(refs[v], refs[u]) >= 0.15]
    r = refs
    if all(r.get(k) for k in ('i', 'ɪ', 'ɛ', 'æ')) and not (r['i']['F1'] < r['ɪ']['F1'] < r['ɛ']['F1'] < r['æ']['F1']):
        notes.append('Front-vowel F1 order is off (expected i < ɪ < ɛ < æ); front vowel checks may be unreliable for this voice.')
    for a, b in (('ɪ', 'ɛ'), ('ɑ', 'ɔ'), ('æ', 'ɛ'), ('ɑ', 'ʌ')):
        if b not in usable.get(a, []):
            notes.append('This voice\'s /%s/ and /%s/ references are too close to tell apart; that comparison is skipped.' % (a, b))
    return refs, usable, notes, (float(np.median(f0s)) if f0s else None)


# ---------------------------------------------------------------- words and keywords

WORD_TAKES = [('iso', '', 1.0), ('dot', '.', 1.0), ('excl', '!', 1.0), ('dot_slow', '.', 0.92), ('dot_fast', '.', 1.08),
              ('carrier', None, 1.0), ('pause', None, 1.0)]


def word_takes(eng, voice, word_ps):
    takes = []
    for kind, end, speed in WORD_TAKES:
        if kind == 'carrier':
            ps = P.CARRIER + word_ps + '.'
        elif kind == 'pause':
            ps = P.CARRIER_PAUSE + word_ps + '.'
        else:
            ps = word_ps + end
        seed = seed_for(voice, ps, speed)
        audio, pred = eng.synth(ps, voice, seed, speed)
        cut = None
        if kind in ('carrier', 'pause'):
            # Cut in the quiet gap before the word, if there is one; at least 10 ms before any burst.
            e = env(audio)
            pk = e.max()
            start_ms = edges_of(pred)[ps.rfind(word_ps) + 1] // MS
            a, b = max(0, start_ms - 250), min(len(e) - 1, start_ms + 60)
            quiet = e[a:b] < pk - 50
            runs, s0 = [], None
            for i, q in enumerate(quiet):
                if q and s0 is None:
                    s0 = i
                if s0 is not None and (not q or i == len(quiet) - 1):
                    runs.append((s0, i))
                    s0 = None
            runs = [r for r in runs if r[1] - r[0] >= 30]
            if runs:
                r = max(runs, key=lambda r: r[1])  # the gap closest to the word
                c = a + (r[0] + r[1]) // 2
                cut = {'ms': int(c), 'gap_ms': int(r[1] - r[0])}
                audio = fade(audio[c * MS:], 3, 0)
            else:
                cut = {'ms': None, 'gap_ms': 0}
        clip = normalize(trim(audio))
        takes.append({'kind': kind, 'ps': ps, 'speed': speed, 'seed': seed, 'audio': clip, 'cut': cut})
    return takes


ALLO = {'t': 'd', 'k': 'ɡ', 'd': 't', 'ɡ': 'k', 'p': 'b'}


def check_word(take, target, gender, refs, usable, recog, best_voiced, cvc):
    """Check one take. Returns hard problems, phoneme problems (both worth a listen), notes, a score."""
    x = take['audio']
    hard, phon, notes, out = [], [], [], {}
    score = 0.0
    hy, flags = qa.hygiene(x, SR)
    out['hygiene'] = hy
    hard += flags
    if take['cut'] is not None:
        out['cut'] = take['cut']
        if take['cut']['ms'] is None:
            hard.append('no quiet gap before the word in the carrier phrase')
        else:
            res = qa.onset_residue_db(x, SR)
            out['onset_residue_db'] = res
            if target[0] not in ('t', 'k') and res > -15:
                hard.append('leftover sound from the carrier phrase at the start')
        score -= 2  # the last word of a phrase tends to come out breathier
    # whispered / breathy
    vms = qa.voiced_ms(x, SR)
    core = qa.vowel_core(x, SR)
    f0v = qa.vowel_f0(x, SR)
    hnr = qa.hnr_db(x, SR, core[0], core[1], f0v) if core else None
    out.update({'voiced_ms': vms, 'hnr_db': hnr})
    if (best_voiced and vms < 0.5 * best_voiced) or (hnr is not None and hnr < 5):
        hard.append('whispered or breathy (%d ms voiced, HNR %s dB)' % (vms, hnr))
    if hnr is not None:
        score += min(hnr, 15) / 5
    # recognizers
    x16 = qa.to16k(x, SR)
    margins = {}
    for r in recog:
        s = r.score(x16, target)
        out[r.name] = s
        margins[r.name] = s['per_phone']
        cm = [p['margin'] for p in s['per_phone'] if p['phone'] not in qa.VOWELS]
        if cm:
            w = 1.0 if r.name == 'zipa' else 0.5
            score += w * (float(np.clip(min(cm), -15, 15)) + 0.3 * float(np.mean(np.clip(cm, -15, 15))))
        if r.name == 'zipa' and not qa.heard_matches(s['heard'], target):
            notes.append('ZIPA heard [%s]' % s['heard'])
    if 'zipa' in margins and 'w2v2' in margins:
        for pz, pw in zip(margins['zipa'], margins['w2v2']):
            ph = pz['phone']
            if ph in qa.VOWELS and ph not in ('ɪ', 'ɑ'):
                continue  # wav2vec2 almost never outputs /æ/; both hear /ʌ/ as /ɑ/; other vowels aren't taught here
            if pz['margin'] < -2 and pw['margin'] < -2:
                what = 'nothing' if pz['competitor'] == 'nothing' else '/%s/' % pz['competitor']
                phon.append('both recognizers hear %s instead of /%s/' % (what, ph))
                score -= 4
    # vowel formants against the voice's own references
    if cvc and core:
        v = target[1]
        f = qa.formants(x, SR, core[0] + 0.35 * (core[1] - core[0]), core[0] + 0.65 * (core[1] - core[0]), gender)
        best, d = qa.nearest_vowel(f, refs, v, usable)
        if f:
            out['vowel'] = {'F1': round(f['F1']), 'F2': round(f['F2']), 'nearest': best}
        if v in d:
            score -= 6 * d[v]  # closest to this voice's own vowel wins, even where a comparison is skipped
        if best and best != v and v in d:
            ratio = d[v] / max(d[best], 1e-6)
            out['vowel']['ratio'] = round(ratio, 2)
            if ratio > 1.15:
                phon.append('vowel closer to /%s/ than /%s/' % (best, v))
                score -= 3 * min(ratio, 3.0)
        elif best == v and v in d:
            score += 2 - 4 * d[v]
    # first consonant
    c1 = target[0]
    if c1 in ALLO:
        vot = qa.onset_vot(x, SR)
        out['vot_ms'] = vot
        if vot is not None:
            if c1 in ('t', 'k', 'p') and vot < 30:
                phon.append('first /%s/ weakly aspirated (%d ms), may sound like /%s/' % (c1, vot, ALLO[c1]))
                score -= 4
            if c1 == 'd' and vot > 35 or c1 == 'ɡ' and vot > 45:
                phon.append('first /%s/ has a long gap before voicing (%d ms), may sound like /%s/' % (c1, vot, ALLO[c1]))
                score -= 4
            if c1 in ('d', 'ɡ'):
                score -= max(0, vot - 20) / 10
        if c1 in ('d', 'ɡ'):
            pv_ms, pv_db = qa.prevoicing(x, SR)
            out['prevoicing'] = {'ms': pv_ms, 're_vowel_db': pv_db}
            if pv_ms > 30 and pv_db > -12:
                phon.append('loud hum before the first /%s/ (%d ms), may sound like "m%s"' % (c1, pv_ms, 'd' if c1 == 'd' else 'g'))
                score -= 2
    if c1 == 'n' and cvc:
        m = qa.initial_murmur_db(x, SR)
        out['initial_n_db'] = m
        if m is not None and m < -15:
            phon.append('first /n/ is faint (%s dB below the vowel)' % m)
            score -= 2
    # last consonant
    c2 = target[-1]
    if c2 in ('t', 'k', 'p') and not (len(target) > 1 and target[-2] == 's'):
        rel = qa.final_release(x, SR)
        out['release'] = rel
        if rel:
            if rel['jump_db'] < 15 or rel['re_vowel_db'] < -25:
                phon.append('final /%s/ release is faint (%s dB below the vowel)' % (c2, rel['re_vowel_db']))
                score -= 5
            else:
                score += min(rel['re_vowel_db'] + 25, 15) / 5
            if rel['voiced_after_ms'] > 20:
                phon.append('a voiced "uh" after the final /%s/ (%d ms)' % (c2, rel['voiced_after_ms']))
                score -= 6
            if rel['noise_ms'] > 120:
                notes.append('long breathy release (%d ms)' % rel['noise_ms'])
    out['score'] = round(score, 2)
    out['hard'] = hard
    out['reasons'] = hard + phon
    out['notes'] = notes
    return out


def pick(checks, takes=None):
    """Fewest hard problems, then fewest phoneme problems, then the word said on its own over one cut
    from a carrier phrase (those come out breathier), then best score."""
    carrier = lambda i: 1 if takes and takes[i].get('cut') is not None else 0
    return min(range(len(checks)), key=lambda i: (len(checks[i]['hard']), len(checks[i]['reasons']), carrier(i), -checks[i]['score']))


def trim_uh(take, rel):
    """A copy of the take that ends just before a voiced "uh" after the final release."""
    x = take['audio']
    end = int((max(rel['t'] + 0.025, rel['uh_start']) + 0.005) * SR)
    y = np.concatenate([fade(x[:end], 0, 20), np.zeros(20 * MS, 'float32')])  # the clip then ends in silence
    return dict(take, kind=take['kind'] + '_trim', audio=y)


# ---------------------------------------------------------------- letter sounds

def continuous_take(eng, voice, spec, src, gender, centre_hz=None):
    """Find the steadiest stretch of a vowel or /n/ inside a word, then lengthen it with PSOLA into
    a short and a held version. Kokoro can't hold a sound itself: stretched timings go silent."""
    ps, speed = (src.split('@')[0], float(src.split('@')[1])) if '@' in src else (src, 1.0)
    seed = seed_for(voice, src, 'cont')
    audio, _ = eng.synth(ps, voice, seed, speed)
    if spec['kind'] == 'vowel':
        core = qa.vowel_core(audio, SR)
        if not core:
            return None
        lo, hi = core[0] + 0.02, core[1] - 0.02
    else:
        run = qa.voiced_run(audio, SR)
        if not run:
            return None
        # /n/: the part of the voiced stretch where energy above 1 kHz drops (nasal murmur)
        mid = qa.band_env(audio, SR, lo=1000, hi=4000, win_ms=10, hop_ms=5)
        low = qa.band_env(audio, SR, hi=500, win_ms=10, hop_ms=5)
        ratio = mid - low
        idx = [i for i in range(int(run[0] * 200), min(len(ratio), int(run[1] * 200))) if ratio[i] < -15]
        if len(idx) < 8:
            return None
        runs, cur = [], [idx[0]]
        for i in idx[1:]:
            if i == cur[-1] + 1:
                cur.append(i)
            else:
                runs.append(cur)
                cur = [i]
        runs.append(cur)
        r = max(runs, key=len)
        lo, hi = r[0] * 0.005 + 0.02, r[-1] * 0.005 - 0.02
    avail = hi - lo
    if avail < 0.08:
        return None
    out = {'src': src, 'seed': seed}
    plans = (('audio', P.SHORT_MS[spec['kind']], (0.42, 0.38, 0.34, 0.30, 0.26, 0.22, 0.19, 0.15, 0.12), 0.6),
             ('long', P.LONG_MS, (0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.12), 0.5))
    for which, target_ms, wins, keep in plans:
        # The longest window that fits and is steady: the less we stretch, the less robotic.
        st, win = None, None
        for w in wins:
            if w > avail or w * 1000 > target_ms:
                continue
            cand = qa.steadiest(audio, SR, lo, hi, w, gender)
            if not cand:
                continue
            if spec['kind'] == 'nasal' or cand['F2_sd'] <= 110 or w == min(x for x in wins if x <= avail):
                st, win = cand, w
                break
        if not st:
            return None
        seg = audio[int(st['start'] * SR): int((st['start'] + win) * SR)]
        factor = target_ms / (win * 1000)
        # Big stretches copy each pitch period several times; a slight random pitch drift keeps
        # the copies from being identical, which is what the ear hears as robotic.
        wob = 0.8 if factor > 1.8 else 0.0
        # Slowed sources come out lower than the voice speaks its words. Close half of that gap:
        # raising pitch with PSOLA duplicates pitch periods, which is what sounds robotic, so the
        # take whose own pitch is already close wins (see check_sound).
        target_hz = (st['f0'] * (centre_hz / st['f0']) ** 0.5) if centre_hz and st['f0'] else None
        y = qa.psola(seg, SR, factor, keep=0.8 if wob else keep, fall_st=1.0, wobble_pct=wob,
                     seed=seed_for(voice, src, which), centre_hz=target_hz)
        if centre_hz and st['f0']:
            out['pitch_gap_st'] = round(float(12 * np.log2((target_hz or st['f0']) / centre_hz)), 1)
        out[which] = normalize(fade(y, 30 if which == 'audio' else 50, 50 if which == 'audio' else 80))
        out[which + '_window_ms'] = round(win * 1000)
        out['f0'] = st['f0']
    out['window_ms'] = out['audio_window_ms']
    return out


def stop_take(eng, voice, spec, src):
    """Cut a stop out of a word: the release of a final stop, or the start of a word (for /t k/ only
    the burst and breath before voicing starts; for /d g/ the burst up to the first voicing pulse)."""
    seed = seed_for(voice, src, 'stop')
    audio, _ = eng.synth(src, voice, seed)
    audio = normalize(audio)
    run = qa.voiced_run(audio, SR)
    if not run:
        return None
    initial = src[0] == spec['ipa'] and src[-1] != spec['ipa']
    f0v = qa.vowel_f0(audio, SR)
    if initial:
        b = qa.find_burst(audio, SR, max(0.0, run[0] - 0.2), run[0] + 0.12)
    else:
        b = qa.find_burst(audio, SR, run[1] - 0.12, run[1] + 0.3)
    if not b:
        return None
    t = int(b['t'] * 1000)
    voicing_after = None
    if f0v:
        for s, e in qa.periodic_spans(audio, SR, f0v, tol=0.4, min_ms=10):
            if s * 1000 > t + 2:
                voicing_after = int(s * 1000)
                break
    hb = qa.band_env(audio, SR, lo=3000)
    if spec['kind'] == 'voiceless':
        if initial:
            end = (voicing_after - 5) if voicing_after else t + 80
        else:
            live = np.nonzero(hb[t:t + 300] > hb[t] - 20)[0]
            end = t + min(int(live[-1]) if len(live) else 60, 110) + 10
        start, burst_ms, fin, fout = t - 3, 3, 3, 20
    else:
        if initial:
            # the burst plus a trace of the vowel (one or two pulses), faded, so it isn't a click
            end = min(voicing_after + 22, t + 45) if voicing_after else t + 35
        else:
            end = t + 35
        start, burst_ms, fin, fout = t - 6, 6, 3, 15
    if end - start < 20:
        return None
    clip = fade(audio[max(0, start) * MS:end * MS], fin, fout)
    return {'src': src, 'seed': seed, 'audio': clip, 'burst_s': burst_ms / 1000, 'initial': initial,
            'burst': {'jump_db': b['jump_db'], 'level_db': b['level_db']}}


def level_stop(take, vowel_level_db):
    """Set a stop's loudest 50 ms to sit 8 dB below the voice's vowel letter sounds (capped gain)."""
    x = take['audio']
    cur = qa.max_rms_db(x, SR, 20)
    want = vowel_level_db - STOP_BELOW_VOWELS_DB
    gain_db = want - cur
    take['gain_db'] = round(gain_db, 1)
    g = 10 ** (min(gain_db, STOP_MAX_GAIN_DB) / 20)
    pk = float(np.abs(x).max()) * g
    if pk > PEAK:
        g *= PEAK / pk
    take['audio'] = (x * g).astype('float32')


def check_sound(take, spec, gender, refs, usable, recog, which='audio'):
    clip = take[which]
    x = padded(clip)  # pitch tracking needs some room around very short clips
    off = PRE_PAD_MS / 1000
    hard, phon, out = [], [], {}
    dur = len(clip) / SR * 1000
    out['dur_ms'] = round(dur)
    score = 0.0
    if spec['kind'] in ('voiceless', 'voiced'):
        out['burst'] = take['burst']
        out['gain_db'] = take.get('gain_db')
        ts, v = qa.voiced_mask(x, SR)
        after = (ts > off + take['burst_s'] + 0.005) & (ts < off + dur / 1000)
        va = int(v[after].sum() * 5)
        frac = float(v[after].mean()) if after.any() else 0.0
        out['voiced_after_burst_ms'] = va
        if spec['kind'] == 'voiceless' and va > 15:
            phon.append('%d ms of voicing after the burst, may sound like "%suh"' % (va, spec['id']))
        if spec['kind'] == 'voiced' and va > (30 if take['initial'] else 15) and frac > 0.6:
            phon.append('mostly voiced after the burst (%d ms), may sound like "%suh"' % (va, spec['id']))
        if take['burst']['jump_db'] < 12:
            phon.append('weak burst')
        if take.get('gain_db') is not None and take['gain_db'] > STOP_MAX_GAIN_DB:
            phon.append('very quiet release (needed %+.0f dB; capped at +15)' % take['gain_db'])
        if not 25 <= dur <= 170:
            phon.append('length %d ms is outside 25-170 ms' % dur)
        score = -va + take['burst']['jump_db'] / 2 - abs(dur - 70) / 10 - (max(0, take.get('gain_db') or 0) / 3)
        if take['initial'] and spec['kind'] == 'voiceless':
            score -= 3  # aspiration before a vowel can carry a whispered "uh"
        if take['initial'] and spec['kind'] == 'voiced':
            score -= 2  # cut at the vowel onset
        if recog:
            x16 = qa.to16k(clip, SR)
            res = {r.name: r.score(x16, [spec['ipa']]) for r in recog}
            out['recognizers'] = {k: {'heard': v2['heard'], 'margin': v2['per_phone'][0]['margin'],
                                      'competitor': v2['per_phone'][0]['competitor']} for k, v2 in res.items()}
            ms = [v2['per_phone'][0] for v2 in res.values()]
            if len(ms) == 2 and all(m['margin'] < -2 for m in ms):
                phon.append('both recognizers hear /%s/ instead of /%s/' % (ms[0]['competitor'], spec['ipa']))
            z = res.get('zipa')
            if z and z['per_phone'][0]['margin'] < 0 and z['per_phone'][0]['competitor'] in qa.STOPS:
                score -= 3
            score += sum(np.clip(m['margin'], -5, 5) for m in ms) / 2
    else:
        ts, v = qa.voiced_mask(x, SR)
        inside = (ts > off + 0.03) & (ts < off + dur / 1000 - 0.03)
        frac = float(v[inside].mean()) if inside.any() else 0.0
        out['voiced_fraction'] = round(frac, 2)
        if frac < 0.9:
            phon.append('not voiced throughout')
        f = qa.formants(x, SR, off + 0.2 * dur / 1000, off + 0.8 * dur / 1000, gender)
        vq = qa.voice_quality(clip, SR, take.get('f0') or 200,
                              0.03 if which == 'audio' else 0.05, 0.05 if which == 'audio' else 0.08)
        out['voice'] = vq
        if vq['jitter_pct'] is not None and vq['jitter_pct'] > 3:
            phon.append('rough voice (jitter %.1f%%)' % vq['jitter_pct'])
        if vq['shimmer_pct'] is not None and vq['shimmer_pct'] > 13:
            phon.append('uneven loudness (shimmer %.1f%%)' % vq['shimmer_pct'])
        if vq['dip_db'] > 8:
            phon.append('dropout in the middle (%.0f dB dip)' % vq['dip_db'])
        rep = qa.repeat_fraction(clip, SR)
        out['repeat_frac'] = rep
        if rep is not None and rep > 0.3:
            phon.append('sounds mechanical (%d%% of pitch periods are copies)' % round(100 * rep))
        out['stretch'] = round(dur / take.get(which + '_window_ms', dur), 2) if take.get(which + '_window_ms') else None
        if spec['kind'] == 'vowel':
            best, d = qa.nearest_vowel(f, refs, spec['ipa'], usable)
            if f:
                out['vowel'] = {'F1': round(f['F1']), 'F2': round(f['F2']), 'F2_sd': round(f['F2_sd']), 'nearest': best}
                if best and best != spec['ipa'] and spec['ipa'] in d and d[spec['ipa']] / max(d[best], 1e-6) > 1.15:
                    phon.append('closer to /%s/ than /%s/' % (best, spec['ipa']))
                if f['F2_sd'] > 150:
                    phon.append('vowel quality drifts (F2 spread %d Hz)' % f['F2_sd'])
                score = 3 - 12 * d.get(spec['ipa'], 1) - f['F2_sd'] / 100
            else:
                phon.append('vowel not measurable')
                score = -5
        else:
            mid = qa.band_env(x, SR, lo=1000, hi=4000, win_ms=10, hop_ms=5)
            low = qa.band_env(x, SR, hi=500, win_ms=10, hop_ms=5)
            a, b = int((off + 0.05) * 200), int((off + dur / 1000 - 0.05) * 200)
            ratio = float(np.median((mid - low)[a:b])) if b > a else 0.0
            out['nasal_ratio_db'] = round(ratio, 1)
            if ratio > -12:
                phon.append('too much high-frequency energy for a hummed /n/')
            score = -ratio / 5 + frac * 5
        # Real voices have 1-3% jitter and some shimmer; only roughness beyond that costs points.
        score -= max(0, (vq['jitter_pct'] or 0) - 2) + max(0, (vq['shimmer_pct'] or 0) - 8) / 3 + 10 * (rep or 0) + 2 * max(0, (out['stretch'] or 1) - 1)
        if take.get('pitch_gap_st') is not None:  # still far from the voice's speaking pitch
            out['pitch_gap_st'] = take['pitch_gap_st']
            score -= max(0, abs(take['pitch_gap_st']) - 1.5) * 2
    out['score'] = round(float(score), 2)
    out['hard'] = hard
    out['reasons'] = hard + phon
    out['notes'] = []
    return out


# ---------------------------------------------------------------- main

def compact(check):
    out = {}
    for k, v in check.items():
        if k in ('reasons', 'hard', 'notes'):
            continue
        if isinstance(v, dict) and 'per_phone' in v:
            out[k] = {'heard': v['heard'], 'min_margin': v['min_margin'],
                      'per_phone': [(p['phone'], p['margin'], p['competitor']) for p in v['per_phone']]}
        else:
            out[k] = v
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', required=True)
    ap.add_argument('--voices', default='af_heart,af_nicole,am_michael')
    ap.add_argument('--zipa', help='ZIPA-CR ONNX model folder (model.onnx, tokens.txt)')
    ap.add_argument('--w2v2', help='facebook/wav2vec2-lv-60-espeak-cv-ft folder')
    ap.add_argument('--only', default='words,keywords,sentences,sounds')
    ap.add_argument('--device', default='cpu')
    args = ap.parse_args()
    groups = set(args.only.split(','))
    content = load_content()
    eng = Kokoro(args.device)
    recog = []
    if args.zipa:
        recog.append(qa.Zipa(args.zipa))
    if args.w2v2:
        recog.append(qa.W2V2(args.w2v2))
    versions = {p: version(p) for p in ['kokoro', 'misaki', 'torch', 'numpy', 'praat-parselmouth', 'pyloudnorm',
                                        'onnxruntime', 'transformers', 'lhotse', 'scipy']}

    for voice in args.voices.split(','):
        t_voice = time.time()
        gender = 'm' if voice.startswith('am_') else 'f'
        vdir = os.path.join(args.out, voice)
        tdir = os.path.join(args.out, 'takes', voice)
        refs, usable, ref_notes, voice_f0 = build_refs(eng, voice, gender)
        manifest = {'voice': voice, 'engine': 'Kokoro-82M v1.0 (hexgrad/Kokoro-82M, Apache-2.0)',
                    'created': time.strftime('%Y-%m-%d %H:%M'), 'versions': versions, 'sample_rate': SR,
                    'recognizers': {r.name: r.model_dir for r in recog},
                    'settings': {'loudness_lufs': TARGET_LUFS, 'stop_below_vowels_db': STOP_BELOW_VOWELS_DB,
                                 'word_takes': [k for k, _, _ in WORD_TAKES]},
                    'reference_vowels': {k: ({'F1': round(v['F1']), 'F2': round(v['F2'])} if v else None) for k, v in refs.items()},
                    'reference_notes': ref_notes, 'speaking_f0_hz': round(voice_f0) if voice_f0 else None, 'clips': []}

        def keep(group, name, text, target, take, check, takes_info, checked):
            path = os.path.join(vdir, group, name + '.wav')
            digest = write(path, take['audio'])
            entry = {'id': group + '/' + name, 'group': group, 'name': name, 'text': text,
                     'target': P.ipa_text(target) if target else None,
                     'kokoro': take.get('ps') or take.get('src'), 'take': take.get('kind', take.get('src')),
                     'status': 'check' if check['reasons'] else 'pass', 'checked': checked,
                     'reasons': check['reasons'], 'notes': check.get('notes', []), 'checks': compact(check),
                     'duration_s': round(len(padded(take['audio'])) / SR, 3), 'sha256': digest, 'takes': takes_info}
            if (group, name) in TEACHER_NOTES:
                entry['teacher_note'] = TEACHER_NOTES[(group, name)]
            if group == 'words' and name in OWNER_NOTES:
                entry['owner_note'] = OWNER_NOTES[name]
            manifest['clips'].append(entry)
            return entry

        def run_words(group, items):
            for name, target, word_ps, cvc in items:
                takes = word_takes(eng, voice, word_ps)
                base = [qa.voiced_ms(t['audio'], SR) for t in takes if t['cut'] is None]
                best_voiced = max(base) if base else None
                checks = [check_word(t, target, gender, refs, usable, recog, best_voiced, cvc) for t in takes]
                for t, c in list(zip(takes, checks)):
                    rel = c.get('release')
                    if rel and rel.get('uh_start') and any(r.startswith('a voiced "uh"') for r in c['reasons']):
                        tt = trim_uh(t, rel)
                        takes.append(tt)
                        checks.append(check_word(tt, target, gender, refs, usable, recog, best_voiced, cvc))
                for t in takes:
                    write(os.path.join(tdir, group, '%s__%s.wav' % (name, t['kind'])), t['audio'])
                b = pick(checks, takes)
                info = [{'kind': t['kind'], 'score': c['score'], 'reasons': c['reasons'],
                         'heard': c.get('zipa', {}).get('heard'), 'cut': t['cut']} for t, c in zip(takes, checks)]
                e = keep(group, name, name, target, takes[b], checks[b], info, 'full' if cvc else 'consonants')
                print('%-10s %s/%-8s %-8s %-5s %s' % (voice, group, name, takes[b]['kind'], e['status'],
                                                      '; '.join(e['reasons'])), flush=True)

        if 'words' in groups:
            run_words('words', [(w, P.cvc_target(w), P.cvc_kokoro(w), True) for w in content['words']])
        if 'keywords' in groups:
            run_words('keywords', [(k, s['target'], s['kokoro'], False) for k, s in P.KEYWORDS.items()])

        if 'sentences' in groups:
            for item in content['sentences']:
                w, text = item['word'], item['text']
                force = dict(P.SENTENCE_FORCE)
                if w not in P.SENTENCE_KEEP_NATURAL:
                    force[w] = P.cvc_kokoro(w)
                marked = text
                for word, ps_w in force.items():
                    marked = re.sub(r'\b(%s)\b' % re.escape(word), lambda m, p=ps_w: '[%s](/%s/)' % (m.group(1), p),
                                    marked, flags=re.IGNORECASE)
                ps = eng.g2p(marked)
                seed = seed_for(voice, ps, 'sentence')
                audio, _ = eng.synth(ps, voice, seed)
                clip = normalize(trim(audio))
                hy, flags = qa.hygiene(clip, SR)
                check = {'hygiene': hy, 'reasons': flags, 'hard': flags, 'notes': [], 'score': 0}
                keep('sentences', w, text, None, {'kind': 'sentence', 'ps': ps, 'audio': clip}, check, [], 'edges')
                print('%-10s sentences/%-4s %s' % (voice, w, ps), flush=True)

        if 'sounds' in groups:
            vowel_levels = []
            for spec in P.SOUNDS:
                takes = []
                tried = []
                for src in spec['sources']:
                    t = (continuous_take(eng, voice, spec, src, gender, voice_f0) if spec['kind'] in ('vowel', 'nasal')
                         else stop_take(eng, voice, spec, src))
                    tried.append(src)
                    if t:
                        takes.append(t)
                if spec['kind'] in ('voiceless', 'voiced'):
                    ref_level = float(np.median(vowel_levels)) if vowel_levels else -20.0
                    for t in takes:
                        level_stop(t, ref_level)
                checks = []
                for t in takes:
                    c = check_sound(t, spec, gender, refs, usable, recog)
                    if 'long' in t:  # held sounds: the held version has to be good too
                        lc = check_sound(t, spec, gender, refs, usable, [], 'long')
                        c['score'] = round(c['score'] + lc['score'], 2)
                        c['long_reasons'] = lc['reasons']
                        t['long_check'] = lc
                    checks.append(c)
                for t in takes:
                    tag = re.sub(r'[^a-z0-9]', '', t['src'].replace('@', 'x').replace('æ', 'ae').replace('ɑ', 'aa')
                                 .replace('ɪ', 'ih').replace('ʌ', 'uh').replace('ɡ', 'g'))
                    write(os.path.join(tdir, 'sounds', '%s__%s.wav' % (spec['id'], tag)), t['audio'])
                failed = [s for s in tried if s not in [t['src'] for t in takes]]
                if not takes:
                    manifest['clips'].append({'id': 'sounds/' + spec['id'], 'group': 'sounds', 'name': spec['id'],
                                              'text': '/%s/' % spec['ipa'], 'status': 'missing',
                                              'reasons': ['no source word gave a usable cut'], 'takes': [], 'tried': tried})
                    print('%-10s sounds/%-6s MISSING' % (voice, spec['id']), flush=True)
                    continue
                b = min(range(len(takes)), key=lambda i: (len(checks[i]['reasons']) + len(checks[i].get('long_reasons', [])),
                                                         -checks[i]['score']))
                best = takes[b]
                info = [{'kind': t['src'], 'score': c['score'], 'reasons': c['reasons'] + ['held: ' + r for r in c.get('long_reasons', [])]}
                        for t, c in zip(takes, checks)] + [{'kind': s, 'reasons': ['no usable cut']} for s in failed]
                e = keep('sounds', spec['id'], '/%s/' % spec['ipa'], [spec['ipa']], best, checks[b], info, 'acoustic')
                e['sound'] = spec['ipa']
                print('%-10s sounds/%-6s from %-9s %-5s %s' % (voice, spec['id'], best['src'], e['status'], '; '.join(e['reasons'])), flush=True)
                if spec['kind'] in ('vowel', 'nasal'):
                    if spec['kind'] == 'vowel':
                        vowel_levels.append(qa.max_rms_db(best['audio'], SR, 20))
                    lc = best['long_check']
                    digest = write(os.path.join(vdir, 'sounds', spec['id'] + '-long.wav'), best['long'])
                    manifest['clips'].append({'id': 'sounds/%s-long' % spec['id'], 'group': 'sounds', 'name': spec['id'] + '-long',
                                              'text': '/%s/ held' % spec['ipa'], 'target': P.ipa_text([spec['ipa']]),
                                              'kokoro': best['src'], 'take': best['src'], 'sound': spec['ipa'],
                                              'status': 'check' if lc['reasons'] else 'pass', 'checked': 'acoustic',
                                              'reasons': lc['reasons'], 'notes': [], 'checks': compact(lc),
                                              'duration_s': round(len(padded(best['long'])) / SR, 3), 'sha256': digest, 'takes': []})

        with open(os.path.join(vdir, 'manifest.json'), 'w', encoding='utf-8') as f:
            json.dump(manifest, f, ensure_ascii=False, indent=1, default=lambda o: o.item() if hasattr(o, 'item') else str(o))
        n = len(manifest['clips'])
        flagged = sum(1 for c in manifest['clips'] if c['status'] != 'pass')
        print('== %s: %d clips, %d flagged for a closer listen, %.0f s' % (voice, n, flagged, time.time() - t_voice), flush=True)


if __name__ == '__main__':
    main()
