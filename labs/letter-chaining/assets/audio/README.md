# Audio clips

Every letter sound, word, keyword picture, and sentence in Letter Chains plays from a file in this
folder. The page never uses the computer's built-in voice when a file is here, so it sounds the same
on every computer and browser. When a teacher records a letter sound or word in Teacher Corner, their recording plays instead.

**These files are computer-generated** with the "Heart" voice of Kokoro-82M, an open-source voice
model, by `tools/voice/generate.py`. Words, keywords and letter sounds were made from exact phonemes,
and every take was checked automatically for phoneme errors before the best one was kept. `tools/voice/README.md` explains
the method.

## Replacing a clip

- Keep the exact file name below. Save as WAV or MP3 (if both exist, the MP3 is used).
- Then run `node tools/build-audio.js` to rebuild the `.js` file the page loads.
- Say short vowels clearly: /ă/ as in apple, /ĭ/ as in igloo, /ŏ/ as in octopus. Short o is always
  the open "ah" of dot, so dog is "dahg" and ton is "tahn".
- C and g are always hard here: "cit" is /k/ /ĭ/ /t/, not "sit".
- Letter sounds are just the sound, with no "uh": /t/ not "tuh", and /n/ is a short hum.
- Trim silence at the start and end, and keep levels even between clips.

## Letter sounds (8)

| File | Say |
| --- | --- |
| `sounds/a.wav` | /ă/ as in apple |
| `sounds/i.wav` | /ĭ/ as in igloo |
| `sounds/o.wav` | /ŏ/ as in octopus ("ah") |
| `sounds/t.wav` | /t/ |
| `sounds/d.wav` | /d/ |
| `sounds/c.wav` | /k/ |
| `sounds/g.wav` | /g/ (hard, as in goat) |
| `sounds/n.wav` | /n/ |

## Words (67)

| File | Say |
| --- | --- |
| `words/tat.wav` | tat |
| `words/tad.wav` | tad |
| `words/tac.wav` | tac |
| `words/tag.wav` | tag |
| `words/tan.wav` | tan |
| `words/tid.wav` | tid |
| `words/tic.wav` | tic |
| `words/tig.wav` | tig |
| `words/tin.wav` | tin |
| `words/tot.wav` | tot |
| `words/tod.wav` | tod |
| `words/toc.wav` | toc |
| `words/tog.wav` | tog |
| `words/ton.wav` | ton ("tahn", a made-up word) |
| `words/dat.wav` | dat |
| `words/dad.wav` | dad |
| `words/dac.wav` | dac |
| `words/dag.wav` | dag |
| `words/dan.wav` | dan |
| `words/dit.wav` | dit |
| `words/did.wav` | did |
| `words/dig.wav` | dig |
| `words/din.wav` | din |
| `words/dot.wav` | dot |
| `words/dod.wav` | dod |
| `words/doc.wav` | doc |
| `words/dog.wav` | dog ("dahg") |
| `words/don.wav` | don |
| `words/cat.wav` | cat |
| `words/cad.wav` | cad |
| `words/cac.wav` | cac |
| `words/cag.wav` | cag |
| `words/can.wav` | can |
| `words/cit.wav` | cit |
| `words/cid.wav` | cid |
| `words/cic.wav` | cic |
| `words/cin.wav` | cin |
| `words/cot.wav` | cot |
| `words/cod.wav` | cod |
| `words/cog.wav` | cog |
| `words/con.wav` | con |
| `words/gat.wav` | gat |
| `words/gad.wav` | gad |
| `words/gac.wav` | gac |
| `words/gag.wav` | gag |
| `words/gan.wav` | gan |
| `words/gid.wav` | gid |
| `words/gic.wav` | gic |
| `words/gig.wav` | gig |
| `words/got.wav` | got |
| `words/god.wav` | god |
| `words/goc.wav` | goc |
| `words/gog.wav` | gog |
| `words/gon.wav` | gon |
| `words/nat.wav` | nat |
| `words/nad.wav` | nad |
| `words/nac.wav` | nac |
| `words/nag.wav` | nag |
| `words/nan.wav` | nan |
| `words/nid.wav` | nid |
| `words/nic.wav` | nic |
| `words/nin.wav` | nin |
| `words/not.wav` | not |
| `words/nod.wav` | nod |
| `words/noc.wav` | noc |
| `words/nog.wav` | nog |
| `words/non.wav` | non |

## Keyword pictures (8)

| File | Say |
| --- | --- |
| `keywords/apple.wav` | apple (keyword for short a) |
| `keywords/igloo.wav` | igloo (keyword for short i) |
| `keywords/octopus.wav` | octopus (keyword for short o) |
| `keywords/top.wav` | top (keyword for t) |
| `keywords/duck.wav` | duck (keyword for d) |
| `keywords/cup.wav` | cup (keyword for c) |
| `keywords/goat.wav` | goat (keyword for g) |
| `keywords/nest.wav` | nest (keyword for n) |

## Sentences (19)

| File | Say |
| --- | --- |
| `sentences/can.wav` | The soup is in a can. |
| `sentences/cat.wav` | The cat naps in the sun. |
| `sentences/cod.wav` | A cod is a fish. |
| `sentences/cog.wav` | A cog is a wheel with teeth. |
| `sentences/cot.wav` | I can nap on a cot. |
| `sentences/dad.wav` | Dad gives me a hug. |
| `sentences/did.wav` | I did it! |
| `sentences/dig.wav` | We dig in the sand. |
| `sentences/dog.wav` | The dog wags its tail. |
| `sentences/dot.wav` | Draw a big red dot. |
| `sentences/gig.wav` | The band plays a gig. |
| `sentences/got.wav` | I got a new hat. |
| `sentences/nod.wav` | Nod your head to say yes. |
| `sentences/not.wav` | The soup is not hot. |
| `sentences/tad.wav` | Add a tad of salt. (A tad means a little bit.) |
| `sentences/tag.wav` | The tag is on the gift. |
| `sentences/tan.wav` | The sand is tan. |
| `sentences/tin.wav` | The cookies are in a tin. |
| `sentences/tot.wav` | A tot is a little kid. |
