# Audio clips

Sound Boxes plays three kinds of clip:

- `sounds/`: letter sounds, copied unchanged from Letter Chains (`labs/letter-chaining/assets/audio/sounds/`), MP3 at 128 kbps.
- `words/`: the words, copied unchanged from Letter Chains (`.../words/`), MP3 at 96 kbps.
- `phrases/`: the spoken directions, made for this lab by the site's `tools/voice/sound_boxes.py`, MP3 at 96 kbps.

Run `node tools/copy-clips.js` to copy the sounds and words again (after a word or level changes, or
after Letter Chains remakes a clip), then `node tools/build-audio.js`. Never make a new letter sound
here: the owner picks every letter sound by ear in Letter Chains.

**These clips are computer-generated** with the "Heart" voice of Kokoro-82M, an open-source voice
model. `tools/voice/README.md` explains how they were made and checked. Do not use macOS voices
(Samantha, Daniel and the rest): Apple allows them for personal use only.

Regenerate this list with `node tools/list-phrases.js --readme`.

## Letter sounds (21)

`a` `b` `c` `d` `e` `f` `g` `h` `i` `j` `l` `m` `n` `o` `p` `r` `s` `t` `u` `w` `z` (k plays `c`)

## Words (24)

`bag` `bat` `bug` `bus` `can` `cat` `cup` `dog` `hen` `leg` `lid` `lip` `log` `map` `mop` `net` `pan` `pen` `pig` `pin` `rug` `sun` `top` `wig`

## Directions (4)

| File | Say |
| --- | --- |
| `which` | Which picture? |
| `again` | Listen again. |
| `boxes` | Tap a box for each sound. |
| `letters` | Put the letters in the boxes. |
