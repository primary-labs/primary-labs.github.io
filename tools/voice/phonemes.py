"""Primary Labs · Letter Chains — what every clip must say, as exact phonemes.

Nothing here is guessed from spelling. Words come from the lab's tile list (tools/content.js): each
tile says exactly one sound, so "cit" is always /kɪt/, "dog" has the same vowel as "dot", and "ship"
is /ʃ/ /ɪ/ /p/.

Two spellings of each item:
  target  - canonical IPA phones, used for the checks and shown when reviewing clips
  kokoro  - the string fed to Kokoro (misaki symbols: stress mark ˈ before the vowel,
            ɡ is U+0261, diphthongs are capital letters, e.g. O = oʊ)
"""

# Lab 1 letter set. c and g are always hard. o is the open, unrounded "ah" vowel.
CONSONANTS = {'t': 't', 'd': 'd', 'c': 'k', 'g': 'ɡ', 'n': 'n'}
VOWELS = {'a': 'æ', 'i': 'ɪ', 'o': 'ɑ'}


def cvc_target(word):
    return [CONSONANTS[word[0]], VOWELS[word[1]], CONSONANTS[word[2]]]


def cvc_kokoro(word):
    c1, v, c2 = cvc_target(word)
    return c1 + 'ˈ' + v + c2


# IPA -> misaki (Kokoro's symbols). Diphthongs are single capital letters.
TO_MISAKI = {'eɪ': 'A', 'aɪ': 'I', 'oʊ': 'O', 'aʊ': 'W', 'ɔɪ': 'Y', 'dʒ': 'ʤ', 'tʃ': 'ʧ', 'ɝ': 'ɜɹ'}
# Vowel plus r is one sound to the recognizers (wav2vec2 writes /ɑːɹ/ as one symbol).
R_VOWELS = {('ɑ', 'ɹ'): 'ɑɹ', ('ɔ', 'ɹ'): 'ɔɹ'}


def misaki(phones):
    return ''.join(TO_MISAKI.get(p, p) for p in phones)


def tile_target(phones):
    """A tile's phones as the recognizers see them: ar is /ɑɹ/, not /ɑ/ + /ɹ/."""
    return [R_VOWELS[tuple(phones)]] if tuple(phones) in R_VOWELS else list(phones)


def word_target(ipa, kinds):
    """Canonical phones of a word, from its tiles' phones (one list per tile)."""
    out = []
    for phones in ipa:
        out += tile_target(phones)
    return out


def word_kokoro(ipa, kinds):
    """Kokoro string of a word: onset, stress mark, vowel tile, coda. "cat" is kˈæt, "ship" ʃˈɪp."""
    v = kinds.index('vowel')
    return ''.join(misaki(p) for p in ipa[:v]) + 'ˈ' + misaki(ipa[v]) + ''.join(misaki(p) for p in ipa[v + 1:])


# Keyword pictures. Forced too: dictionaries give "top" the "aw" vowel in some entries.
KEYWORDS = {
    'apple':   {'target': ['æ', 'p', 'ə', 'l'],                'kokoro': 'ˈæpᵊl'},
    'igloo':   {'target': ['ɪ', 'ɡ', 'l', 'u'],                'kokoro': 'ˈɪɡlu'},
    'octopus': {'target': ['ɑ', 'k', 't', 'ə', 'p', 'ə', 's'], 'kokoro': 'ˈɑktəpəs'},
    'top':     {'target': ['t', 'ɑ', 'p'],                     'kokoro': 'tˈɑp'},
    'duck':    {'target': ['d', 'ʌ', 'k'],                     'kokoro': 'dˈʌk'},
    'cup':     {'target': ['k', 'ʌ', 'p'],                     'kokoro': 'kˈʌp'},
    'goat':    {'target': ['ɡ', 'oʊ', 't'],                    'kokoro': 'ɡˈOt'},
    'nest':    {'target': ['n', 'ɛ', 's', 't'],                'kokoro': 'nˈɛst'},
    # Added with the full tile set. Short o is the "ah" of dot here too (log, mop, fox, box, sock).
    'egg':      {'target': ['ɛ', 'ɡ'],                          'kokoro': 'ˈɛɡ'},
    'umbrella': {'target': ['ʌ', 'm', 'b', 'ɹ', 'ɛ', 'l', 'ə'],  'kokoro': 'ˌʌmbɹˈɛlə'},
    'bus':      {'target': ['b', 'ʌ', 's'],                     'kokoro': 'bˈʌs'},
    'fox':      {'target': ['f', 'ɑ', 'k', 's'],                'kokoro': 'fˈɑks'},
    'hat':      {'target': ['h', 'æ', 't'],                     'kokoro': 'hˈæt'},
    'jar':      {'target': ['dʒ', 'ɑɹ'],                        'kokoro': 'ʤˈɑɹ'},
    'kid':      {'target': ['k', 'ɪ', 'd'],                     'kokoro': 'kˈɪd'},
    'log':      {'target': ['l', 'ɑ', 'ɡ'],                     'kokoro': 'lˈɑɡ'},
    'mop':      {'target': ['m', 'ɑ', 'p'],                     'kokoro': 'mˈɑp'},
    'pig':      {'target': ['p', 'ɪ', 'ɡ'],                     'kokoro': 'pˈɪɡ'},
    'queen':    {'target': ['k', 'w', 'i', 'n'],                'kokoro': 'kwˈin'},
    'rug':      {'target': ['ɹ', 'ʌ', 'ɡ'],                     'kokoro': 'ɹˈʌɡ'},
    'sun':      {'target': ['s', 'ʌ', 'n'],                     'kokoro': 'sˈʌn'},
    'van':      {'target': ['v', 'æ', 'n'],                     'kokoro': 'vˈæn'},
    'wig':      {'target': ['w', 'ɪ', 'ɡ'],                     'kokoro': 'wˈɪɡ'},
    'box':      {'target': ['b', 'ɑ', 'k', 's'],                'kokoro': 'bˈɑks'},
    'yarn':     {'target': ['j', 'ɑɹ', 'n'],                    'kokoro': 'jˈɑɹn'},
    'zebra':    {'target': ['z', 'i', 'b', 'ɹ', 'ə'],           'kokoro': 'zˈibɹə'},
    'ship':     {'target': ['ʃ', 'ɪ', 'p'],                     'kokoro': 'ʃˈɪp'},
    'chick':    {'target': ['tʃ', 'ɪ', 'k'],                    'kokoro': 'ʧˈɪk'},
    'thumb':    {'target': ['θ', 'ʌ', 'm'],                     'kokoro': 'θˈʌm'},
    'whale':    {'target': ['w', 'eɪ', 'l'],                    'kokoro': 'wˈAl'},
    'sock':     {'target': ['s', 'ɑ', 'k'],                     'kokoro': 'sˈɑk'},
    'ring':     {'target': ['ɹ', 'ɪ', 'ŋ'],                     'kokoro': 'ɹˈɪŋ'},
    'skunk':    {'target': ['s', 'k', 'ʌ', 'ŋ', 'k'],           'kokoro': 'skˈʌŋk'},
    'rain':     {'target': ['ɹ', 'eɪ', 'n'],                    'kokoro': 'ɹˈAn'},
    'hay':      {'target': ['h', 'eɪ'],                         'kokoro': 'hˈA'},
    'bee':      {'target': ['b', 'i'],                          'kokoro': 'bˈi'},
    'leaf':     {'target': ['l', 'i', 'f'],                     'kokoro': 'lˈif'},
    'boat':     {'target': ['b', 'oʊ', 't'],                    'kokoro': 'bˈOt'},
    'light':    {'target': ['l', 'aɪ', 't'],                    'kokoro': 'lˈIt'},
    'cake':     {'target': ['k', 'eɪ', 'k'],                    'kokoro': 'kˈAk'},
    'kite':     {'target': ['k', 'aɪ', 't'],                    'kokoro': 'kˈIt'},
    'bone':     {'target': ['b', 'oʊ', 'n'],                    'kokoro': 'bˈOn'},
    'cube':     {'target': ['k', 'j', 'u', 'b'],                'kokoro': 'kjˈub'},
    'moon':     {'target': ['m', 'u', 'n'],                     'kokoro': 'mˈun'},
    'cow':      {'target': ['k', 'aʊ'],                         'kokoro': 'kˈW'},
    'cloud':    {'target': ['k', 'l', 'aʊ', 'd'],               'kokoro': 'klˈWd'},
    'oil':      {'target': ['ɔɪ', 'l'],                         'kokoro': 'ˈYl'},
    'toy':      {'target': ['t', 'ɔɪ'],                         'kokoro': 'tˈY'},
    'car':      {'target': ['k', 'ɑɹ'],                         'kokoro': 'kˈɑɹ'},
    'corn':     {'target': ['k', 'ɔɹ', 'n'],                    'kokoro': 'kˈɔɹn'},
    'tiger':    {'target': ['t', 'aɪ', 'ɡ', 'ɝ'],               'kokoro': 'tˈIɡəɹ'},
    'bird':     {'target': ['b', 'ɝ', 'd'],                     'kokoro': 'bˈɜɹd'},
    'turtle':   {'target': ['t', 'ɝ', 't', 'ə', 'l'],           'kokoro': 'tˈɜɹTᵊl'},
}
# The keywords made before the full tile set. Their clips are kept as they are.
KEYWORDS_V1 = ('apple', 'igloo', 'octopus', 'top', 'duck', 'cup', 'goat', 'nest')

# Words inside sentences that must match their word clip (same vowel), written as misaki overrides.
# Words listed here are left to the dictionary instead, for a real word that can't carry the lab's
# vowel. None right now: "ton" used to have a sentence, but the lab now treats it as made-up ("tahn").
SENTENCE_KEEP_NATURAL = set()
# Other words forced in every sentence. The dictionary says "on" with the "aw" vowel; in a short-o
# lab it should be the "ah" of dot, as most decodable programs teach it.
SENTENCE_FORCE = {'on': 'ˌɑn'}

# Fallback ways to say a word: inside "The word is ..." and then cut out. The full stop gives the
# only real pause before the word (a comma gives about 25 ms). The last word of a phrase tends to
# come out breathier, so these takes rank below the word said on its own.
CARRIER = 'ðə wˈɜɹd ɪz '
CARRIER_PAUSE = 'ðə wˈɜɹd ɪz. '

# Letter sounds. Lone sounds can't be asked for directly (every voice adds "uh"), so each one is
# cut from a word said by the same voice ("word@0.6" = said at 0.6x speed, for a longer sound):
#   stops      the release of a word ending in that sound, or the start of a word (only the
#              burst and breath before voicing for /t k/; the burst up to the first pulse for /d g/)
#   continuous the longest steady part of the sound inside a slowly said word, lengthened as little
#              as possible with PSOLA (Praat): at most about 1.3x for the short version and 2x for
#              the held one. Repeating pitch periods many times is what sounds robotic. The pitch
#              keeps some of its natural movement around a gentle 1-semitone fall. Kokoro can't
#              hold a sound itself: stretched timings go silent.
SHORT_MS = {'vowel': 380, 'nasal': 320}  # /n/ hums inside words are short; 320 ms keeps the stretch small
LONG_MS = 700  # held version for connected blending ("caaat"); not used by the lab yet
SOUNDS = [
    {'id': 'a', 'ipa': 'æ', 'kind': 'vowel', 'sources': ['hˈæd', 'pˈæp', 'hˈæd@0.6', 'pˈæp@0.6', 'hˈæd@0.45', 'pˈæp@0.45', 'bˈæd@0.45', 'hˈæd@0.35', 'pˈæp@0.35', 'bˈæd@0.35']},
    {'id': 'i', 'ipa': 'ɪ', 'kind': 'vowel', 'sources': ['hˈɪd', 'pˈɪp', 'hˈɪd@0.6', 'pˈɪp@0.6', 'hˈɪd@0.45', 'pˈɪp@0.45', 'bˈɪd@0.45', 'hˈɪd@0.35', 'pˈɪp@0.35', 'bˈɪd@0.35']},
    {'id': 'o', 'ipa': 'ɑ', 'kind': 'vowel', 'sources': ['hˈɑd', 'pˈɑp', 'hˈɑd@0.6', 'pˈɑp@0.6', 'hˈɑd@0.45', 'pˈɑp@0.45', 'bˈɑd@0.45', 'hˈɑd@0.35', 'pˈɑp@0.35', 'bˈɑd@0.35']},
    {'id': 'n', 'ipa': 'n', 'kind': 'nasal', 'sources': ['sˈʌn@0.6', 'sˈʌn@0.45', 'ˈʌn@0.45', 'sˈʌn@0.35', 'ˈʌn@0.35', 'ˈʌn@0.3',
                                                        'ˈʌnn@0.45', 'ˈʌnn@0.35', 'ˈʌnən@0.45', 'sˈɪn@0.35']},
    {'id': 't', 'ipa': 't', 'kind': 'voiceless', 'sources': ['ˈæt', 'kˈæt', 'pˈɑt', 'bˈʌt', 'tˈɑp']},
    {'id': 'c', 'ipa': 'k', 'kind': 'voiceless', 'sources': ['dˈʌk', 'ˈæk', 'bˈɑk', 'pˈɪk', 'kˈɑp']},
    {'id': 'd', 'ipa': 'd', 'kind': 'voiced', 'sources': ['ˈæd', 'bˈʌd', 'mˈɑd', 'dˈʌt']},
    # /g/ is cut from the start of "gut" with 65 ms of the vowel after voicing starts (trace_ms): a bare
    # burst sounded like /b/ or /d/. Picked by ear from 50-80 ms; longer starts to sound like "guh".
    {'id': 'g', 'ipa': 'ɡ', 'kind': 'voiced', 'trace_ms': 65, 'sources': ['ɡˈʌt']},
]

# Reference vowels for each voice, said in h_d, b_d and p_p frames (as in classic vowel studies).
# Forced phonemes, so "hawed" keeps a distinct /ɔ/ even in a voice that merges cot and caught.
REFERENCE_VOWELS = ['æ', 'ɪ', 'ɑ', 'ɔ', 'ʌ', 'ɛ', 'i']

# Misaki symbols -> IPA, for showing strings to people and for the recognizers.
MISAKI_TO_IPA = {'A': 'eɪ', 'I': 'aɪ', 'W': 'aʊ', 'Y': 'ɔɪ', 'O': 'oʊ', 'ᵊ': 'ə', 'ʤ': 'dʒ', 'ʧ': 'tʃ'}


def ipa_text(phones):
    return '/' + ''.join(phones) + '/'

# The 8 letter sounds above shipped first and are kept as they are. The rest of the tile set, by how
# each is made (name = the lab's clip name, sym = the Kokoro symbol to cut out of the source):
#   vowel, nasal, voiceless, voiced   as above
#   fric       hissing sounds: the steady hiss of a word-final sound said slowly (no vowel after)
#   breath     /h/: the breath before the vowel starts
#   vcont      buzzing and flowing sounds (v z l r): the steady part, held like /n/
#   affricate  ch and j: the release, a little longer than a stop's
#   cluster    qu /kw/, x /ks/, nk /ŋk/: cut out of a word, from the first sound to the end of the last
#   glide      w and y: the start of a word up to where the vowel settles (they can't be held)
#   whole      long and other vowels (ai ee oa igh u_e oo ow oi ar or er): said on their own like a
#              word ("A", "oh", "you", "are"), checked like a word
SOUNDS_V1 = ('a', 'i', 'o', 'n', 't', 'c', 'd', 'g')
SHORT_MS.update({'vcont': 320, 'fric': 340})
FRIC_BELOW_VOWELS_DB = {'s': 5.0, 'ʃ': 5.0, 'f': 9.0, 'θ': 9.0, 'h': 12.0}
SOUNDS += [
    {'id': 'e', 'ipa': 'ɛ', 'kind': 'vowel', 'sources': ['hˈɛd', 'pˈɛp', 'hˈɛd@0.6', 'pˈɛp@0.6', 'hˈɛd@0.45', 'pˈɛp@0.45', 'bˈɛd@0.45', 'hˈɛd@0.35', 'pˈɛp@0.35', 'bˈɛd@0.35']},
    # This voice's /ʌ/ is measured reliably after t and k (after h and p the formant tracker slips)
    {'id': 'u', 'ipa': 'ʌ', 'kind': 'vowel', 'sources': ['tˈʌb', 'kˈʌt', 'ˈʌp', 'tˈʌb@0.6', 'kˈʌt@0.6', 'ˈʌp@0.6', 'tˈʌb@0.45', 'kˈʌt@0.45', 'tˈʌb@0.35', 'kˈʌt@0.35']},
    {'id': 'm', 'ipa': 'm', 'kind': 'nasal', 'sources': ['sˈʌm@0.6', 'sˈʌm@0.45', 'ˈʌm@0.45', 'hˈʌm@0.35', 'ˈʌm@0.35', 'ˈʌm@0.3', 'ˈʌmm@0.45', 'hˈɪm@0.35', 'ɡˈʌm@0.4']},
    {'id': 'ng', 'ipa': 'ŋ', 'kind': 'nasal', 'sources': ['sˈɪŋ@0.6', 'sˈɪŋ@0.45', 'kˈɪŋ@0.45', 'ɹˈɪŋ@0.35', 'sˈʌŋ@0.45', 'sˈɪŋ@0.35', 'lˈʌŋ@0.35', 'wˈɪŋ@0.4']},
    {'id': 'p', 'ipa': 'p', 'kind': 'voiceless', 'sources': ['ˈæp', 'kˈæp', 'tˈɑp', 'kˈʌp', 'pˈɑt']},
    {'id': 'b', 'ipa': 'b', 'kind': 'voiced', 'sources': ['ˈæb', 'kˈʌb', 'tˈæb', 'bˈʌt', 'bˈæt']},
    {'id': 's', 'ipa': 's', 'sym': 's', 'kind': 'fric', 'sources': ['ˈæs@0.45', 'bˈʌs@0.45', 'mˈɪs@0.4', 'ɡˈæs@0.35', 'jˈɛs@0.4', 'ˈʌs@0.35']},
    {'id': 'sh', 'ipa': 'ʃ', 'sym': 'ʃ', 'kind': 'fric', 'sources': ['ˈæʃ@0.45', 'fˈɪʃ@0.45', 'dˈɪʃ@0.4', 'ɹˈʌʃ@0.35', 'kˈæʃ@0.4', 'ˈʌʃ@0.35']},
    {'id': 'f', 'ipa': 'f', 'sym': 'f', 'kind': 'fric', 'sources': ['ˈʌf@0.45', 'ɹˈif@0.45', 'lˈif@0.4', 'ˈɑf@0.4', 'kˈʌf@0.35', 'ˈæf@0.35']},
    {'id': 'th', 'ipa': 'θ', 'sym': 'θ', 'kind': 'fric', 'sources': ['bˈæθ@0.45', 'pˈæθ@0.45', 'mˈæθ@0.4', 'mˈɑθ@0.4', 'tˈuθ@0.35', 'ˈæθ@0.35']},
    {'id': 'h', 'ipa': 'h', 'sym': 'h', 'kind': 'breath', 'sources': ['hˈæt@0.6', 'hˈɑp@0.6', 'hˈʌt@0.5', 'hˈæt@0.45', 'hˈɪt@0.5', 'hˈɑt@0.45']},
    {'id': 'v', 'ipa': 'v', 'sym': 'v', 'kind': 'vcont', 'sources': ['ˈʌv@0.7', 'hˈIv@0.7', 'ɡˈAv@0.7', 'ˈʌv@0.6', 'lˈʌv@0.6', 'dˈIv@0.8', 'ˈʌv']},
    # Kokoro devoices a final z, so z comes from the start of a word
    {'id': 'z', 'ipa': 'z', 'sym': 'z', 'kind': 'vcont', 'sources': ['zˈɪp@0.6', 'zˈɪp@0.5', 'zˈɪɡ@0.6', 'zˈæp@0.5', 'zˈɪp@0.7', 'zˈɪɡ@0.5']},
    {'id': 'l', 'ipa': 'l', 'sym': 'l', 'kind': 'vcont', 'sources': ['ˈʌl@0.7', 'bˈɛl@0.7', 'hˈɪl@0.7', 'dˈɑl@0.6', 'ˈɪl@0.6', 'ɡˈʌl@0.6', 'ˈʌl']},
    {'id': 'r', 'ipa': 'ɹ', 'sym': 'ɜɹ', 'kind': 'vcont', 'sources': ['ˈɜɹ@0.7', 'fˈɜɹ@0.7', 'sˈɜɹ@0.7', 'ˈɜɹ@0.6', 'hˈɜɹ@0.6', 'bˈɜɹ@0.8', 'ˈɜɹ']},
    {'id': 'ch', 'ipa': 'tʃ', 'sym': 'ʧ', 'kind': 'affricate', 'voiced': False, 'release_ms': 190, 'length_ms': (60, 260), 'sources': ['ˈɪʧ', 'mˈʌʧ', 'ɹˈɪʧ', 'ʧˈɪp', 'ʧˈɑp', 'ˈæʧ@0.8']},
    # /j/ like /g/: with only the release, both recognizers heard /ch/. 50 ms of the vowel of "job" after
    # voicing starts makes it /j/ to both; the owner heard no difference from 50 to 65 ms, so the shortest.
    {'id': 'j', 'ipa': 'dʒ', 'sym': 'ʤ', 'kind': 'affricate', 'voiced': True, 'release_ms': 95, 'trace_ms': 50, 'length_ms': (40, 160), 'sources': ['ʤˈɑb']},
    {'id': 'qu', 'ipa': 'kw', 'sym': 'kw', 'kind': 'cluster', 'sources': ['kwˈɪt', 'kwˈɪk', 'kwˈæk@0.8', 'kwˈɪz', 'kwˈɪt@0.8']},
    {'id': 'x', 'ipa': 'ks', 'sym': 'ks', 'kind': 'cluster', 'sources': ['bˈɑks@0.6', 'fˈɑks@0.6', 'sˈɪks@0.6', 'mˈɪks@0.5', 'wˈæks@0.5', 'ˈæks@0.6']},
    {'id': 'nk', 'ipa': 'ŋk', 'sym': 'ŋk', 'kind': 'cluster', 'sources': ['ˈɪŋk@0.6', 'pˈɪŋk@0.6', 'sˈɪŋk@0.5', 'bˈæŋk@0.5', 'ʤˈʌŋk@0.5', 'ˈɪŋk@0.45']},
    {'id': 'w', 'ipa': 'w', 'sym': 'w', 'kind': 'glide', 'sources': ['wˈɪɡ@0.6', 'wˈɛt@0.6', 'wˈʌn@0.6', 'wˈɪn@0.5', 'wˈæɡ@0.5', 'wˈɛb@0.5']},
    {'id': 'y', 'ipa': 'j', 'sym': 'j', 'kind': 'glide', 'sources': ['jˈɛs@0.6', 'jˈɛt@0.6', 'jˈæm@0.6', 'jˈʌm@0.5', 'jˈæk@0.5', 'jˈɛs@0.5']},
]
# Whole vowels: name -> (target phones, Kokoro string said as a word). Checked like a word.
WHOLE_VOWELS = {
    'ai': (['eɪ'], 'ˈA'), 'ee': (['i'], 'ˈi'), 'oa': (['oʊ'], 'ˈO'), 'igh': (['aɪ'], 'ˈI'),
    'u_e': (['j', 'u'], 'jˈu'), 'oo': (['u'], 'ˈu'), 'ow': (['aʊ'], 'ˈW'), 'oi': (['ɔɪ'], 'ˈY'),
    'ar': (['ɑɹ'], 'ˈɑɹ'), 'or': (['ɔɹ'], 'ˈɔɹ'), 'er': (['ɝ'], 'ˈɜɹ'),
}
REFERENCE_VOWELS = REFERENCE_VOWELS + ['u']
MISAKI_TO_IPA.update({'ɜɹ': 'ɝ'})

# More takes to choose from, so both recognizers can be satisfied (see letter_chains.add_happiness).
# Each source is also tried with two other random seeds ('#2', '#3').
MORE_SOURCES = {
    'a': ['tˈæp@0.5', 'kˈæt@0.45', 'sˈæd@0.45', 'ˈæt@0.45'],
    'e': ['tˈɛn@0.5', 'bˈɛt@0.45', 'sˈɛt@0.45', 'ˈɛɡ@0.45'],
    'i': ['tˈɪp@0.5', 'sˈɪt@0.45', 'kˈɪd@0.45', 'ˈɪt@0.45'],
    'o': ['tˈɑp@0.5', 'ɡˈɑt@0.45', 'sˈɑk@0.45', 'ˈɑn@0.45'],
    'u': ['ˈʌp@0.45', 'sˈʌb@0.45', 'dˈʌk@0.45', 'ˈʌs@0.45'],
    'n': ['tˈɪn@0.45', 'pˈæn@0.45', 'ˈɪn@0.45', 'ɡˈʌn@0.45'],
    'm': ['ˈæm@0.45', 'dˈɪm@0.45', 'tˈɑm@0.45', 'jˈʌm@0.45'],
    'ng': ['ɹˈɪŋ@0.45', 'sˈɑŋ@0.45', 'bˈæŋ@0.45', 'θˈɪŋ@0.45'],
    't': ['tˈɪp', 'sˈɪt', 'ɡˈɑt'], 'c': ['kˈɪt', 'bˈæk', 'kˈʌp'],
    'd': ['dˈɪɡ', 'dˈɑɡ', 'ɹˈɛd', 'kˈɪd', 'dˈæd'], 'b': ['bˈɪɡ', 'bˈɛd', 'bˈʌs', 'ɹˈɪb', 'tˈʌb'],
    'p': ['pˈɪɡ', 'pˈɛt', 'pˈʌp', 'kˈʌp', 'ʃˈɪp'],
    's': ['ˈʌs@0.45', 'ɡˈæs@0.45', 'jˈɛs@0.45', 'bˈʌs@0.35'],
    'sh': ['fˈɪʃ@0.35', 'dˈæʃ@0.4', 'kˈæʃ@0.35', 'ɹˈæʃ@0.4'],
    'f': ['ɹˈif@0.35', 'ˈɪf@0.4', 'ɡˈɑf@0.4', 'lˈif@0.35'],
    'th': ['mˈæθ@0.35', 'bˈæθ@0.35', 'tˈiθ@0.4', 'mˈɑθ@0.35'],
    'h': ['hˈɪm@0.6', 'hˈʌɡ@0.5', 'hˈɑt@0.6', 'hˈæm@0.5'],
    'v': ['lˈIv@0.7', 'fˈIv@0.7', 'sˈAv@0.7', 'kˈAv@0.6'],
    'z': ['zˈɪp@0.4', 'zˈæp@0.6', 'zˈɪɡ@0.4', 'zˈu@0.6', 'zˈɪp@0.8'],
    'l': ['bˈɛl@0.6', 'hˈɪl@0.6', 'pˈɑl@0.6', 'dˈɑl@0.7'],
    'r': ['fˈɜɹ@0.6', 'hˈɜɹ@0.7', 'sˈɜɹ@0.6', 'ˈɜɹ@0.8'],
    'ch': ['mˈʌʧ', 'ʧˈɪn', 'ʧˈæt', 'ɹˈɪʧ@0.8', 'ʧˈʌɡ'],
    'qu': ['kwˈɪz@0.8', 'kwˈæk', 'kwˈin', 'kwˈɪk@0.8'],
    'x': ['bˈɑks@0.5', 'fˈɑks@0.5', 'sˈɪks@0.5', 'tˈæks@0.6'],
    'nk': ['pˈɪŋk@0.5', 'bˈæŋk@0.6', 'θˈɪŋk@0.5', 'sˈʌŋk@0.5'],
    'w': ['wˈɪɡ', 'wˈɛt', 'wˈɪn@0.7', 'wˈæks@0.7'],
    'y': ['jˈɛs', 'jˈæm', 'jˈɛt@0.7', 'jˈʌm@0.7'],
}
for _s in SOUNDS:
    if _s['id'] in ('g', 'j'):
        continue  # picked by ear
    _base = _s['sources'] + [x for x in MORE_SOURCES.get(_s['id'], []) if x not in _s['sources']]
    _s['sources'] = _base + [x + '#2' for x in _base] + [x + '#3' for x in _base]
# Voiced stops may also keep the start of the vowel, as /g/ does (trace_ms), when the bare
# burst isn't heard as the right sound. The recognizers and the checks pick.
for _s in SOUNDS:
    if _s['id'] in ('d', 'b'):
        _s['trace_options'] = [35, 50, 65]
# Long and other vowels: other ways to say them on their own, tried when no take of the first is clean.
# 'ː' holds the vowel longer; 'ʔ' starts it with a catch, so "oo" can't slide in from a "y" ("you").
WHOLE_MORE = {
    'ai': ['ˈAː', 'ʔˈA'], 'ee': ['ˈiː', 'ʔˈi'], 'oa': ['ˈOː', 'ʔˈO'], 'igh': ['ˈIː', 'ʔˈI'], 'u_e': ['jˈuː'],
    'oo': ['ʔˈu', 'ˈuː', 'ʔˈuː'], 'ow': ['ˈWː', 'ʔˈW'], 'oi': ['ˈYː', 'ʔˈY'], 'ar': ['ˈɑːɹ', 'ʔˈɑɹ'],
    'or': ['ˈɔːɹ', 'ʔˈɔɹ'], 'er': ['ˈɜːɹ', 'ʔˈɜɹ', 'ˈɚ'],
}
# Whole vowels picked by ear: name -> the one take to make (letter_chains.WORD_TAKES kind).
# /ow/: the owner heard the first pick as wrong although both recognizers passed it.
WHOLE_PICKED = {'ow': 'dot2'}
