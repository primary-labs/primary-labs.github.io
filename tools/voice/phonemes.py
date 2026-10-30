"""Primary Labs · Letter Chains — what every clip must say, as exact phonemes.

Nothing here is guessed from spelling. Each letter in this set maps to exactly one phoneme,
so a word like "cit" is always /kɪt/ and "dog" always has the same vowel as "dot".

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
}

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
    {'id': 'g', 'ipa': 'ɡ', 'kind': 'voiced', 'sources': ['ˈæɡ', 'bˈʌɡ', 'tˈɑɡ', 'ɡˈʌt']},
]

# Reference vowels for each voice, said in h_d, b_d and p_p frames (as in classic vowel studies).
# Forced phonemes, so "hawed" keeps a distinct /ɔ/ even in a voice that merges cot and caught.
REFERENCE_VOWELS = ['æ', 'ɪ', 'ɑ', 'ɔ', 'ʌ', 'ɛ', 'i']

# Misaki symbols -> IPA, for showing strings to people and for the recognizers.
MISAKI_TO_IPA = {'A': 'eɪ', 'I': 'aɪ', 'W': 'aʊ', 'Y': 'ɔɪ', 'O': 'oʊ', 'ᵊ': 'ə', 'ʤ': 'dʒ', 'ʧ': 'tʃ'}


def ipa_text(phones):
    return '/' + ''.join(phones) + '/'
