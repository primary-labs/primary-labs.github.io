# Audio clips

Every line Story Puzzles says plays from a clip in `phrases/`: each story's lines, "Let's read …" with its title, and the
directions. A line without a clip falls back to the device's built-in voice, which sounds different on
every computer, so every line should have one.

**These clips are computer-generated** with the "Heart" voice of Kokoro-82M, an open-source voice
model, by the site's `tools/voice/story_puzzles.py`. Each one was checked automatically: one
recognizer had to hear exactly the words below and a second one exactly their sounds, and further
checks look for glitches. `tools/voice/README.md` explains the method. Do not use macOS voices
(Samantha, Daniel and the rest): Apple allows them for personal use only.

## Replacing a clip

1. Save it as `phrases/<file>.mp3` or `.wav`, using the names below. If both exist, the MP3 is used,
   so delete the old MP3 when replacing it with a WAV.
2. Run `node tools/build-audio.js`. It wraps each clip in a `.js` file and updates `index.js`.
3. Only the `.js` files need to be deployed.

Trim silence at the start and end, and keep levels even with the other clips.

Regenerate this list with `node tools/list-phrases.js --readme`.

## Clips (73)

| File | Say |
| --- | --- |
| `intro` | Read the story. Then tap the pictures that are in it. |
| `not-in` | That one is not in the story. Read it again. |
| `done` | You did it! Now use the pictures to tell the story. |
| `fat-cat-start` | Let's read The Fat Cat. |
| `fat-cat-1` | Pam has a cat. |
| `fat-cat-2` | The cat is fat. |
| `fat-cat-3` | The cat naps on a mat. |
| `fat-cat-4` | The cat naps in a bag. |
| `fat-cat-5` | The cat naps in a pan. |
| `fat-cat-6` | Then the cat naps on Dad! |
| `camp-start` | Let's read Camp. |
| `camp-1` | Max and Dad pack the van. |
| `camp-2` | They get to camp. |
| `camp-3` | Dad sets up a tent. |
| `camp-4` | Max and Dad have hot dogs. |
| `camp-5` | Max can see a bat! |
| `camp-6` | Then Max and Dad nap in the tent. |
| `big-pig-start` | Let's read The Big Pig. |
| `big-pig-1` | Tim has a pig. |
| `big-pig-2` | It is a big pig. |
| `big-pig-3` | The pig has a wig. |
| `big-pig-4` | The pig has a bib. |
| `big-pig-5` | The pig sits in a bin. |
| `big-pig-6` | Then the pig digs a pit. |
| `sid-digs-start` | Let's read Sid Can Dig. |
| `sid-digs-1` | Sid can dig. |
| `sid-digs-2` | Sid digs and digs. |
| `sid-digs-3` | Sid digs up a lid. |
| `sid-digs-4` | Sid digs up a pin. |
| `sid-digs-5` | Sid digs up a mitt. |
| `sid-digs-6` | Then Sid digs up a gift! |
| `dot-dog-start` | Let's read Dot the Dog. |
| `dot-dog-1` | Dot is a dog. |
| `dot-dog-2` | Dot can hop. |
| `dot-dog-3` | Dot hops on a log. |
| `dot-dog-4` | Dot hops on a box. |
| `dot-dog-5` | Dot hops on a rock. |
| `dot-dog-6` | Then Dot naps on a cot. |
| `bob-box-start` | Let's read Bob's Box. |
| `bob-box-1` | Bob has a big box. |
| `bob-box-2` | A sock is in the box. |
| `bob-box-3` | A mop is in the box. |
| `bob-box-4` | A pot is in the box. |
| `bob-box-5` | A frog is in the box! |
| `bob-box-6` | Hop, frog, hop! |
| `the-bug-start` | Let's read The Bug. |
| `the-bug-1` | A bug is on a rug. |
| `the-bug-2` | The bug can run. |
| `the-bug-3` | The bug runs to a cup. |
| `the-bug-4` | The bug runs to a bun. |
| `the-bug-5` | The bug runs and runs. |
| `the-bug-6` | Then the bug sits on a duck! |
| `gus-pup-start` | Let's read Gus the Pup. |
| `gus-pup-1` | Gus is a pup. |
| `gus-pup-2` | Gus runs in the sun. |
| `gus-pup-3` | Gus digs in the mud. |
| `gus-pup-4` | Mom puts Gus in the tub. |
| `gus-pup-5` | Then the pup naps on a rug. |
| `gus-pup-6` | Gus is snug. |
| `red-hen-start` | Let's read The Red Hen. |
| `red-hen-1` | Meg has a red hen. |
| `red-hen-2` | The hen sits in a pen. |
| `red-hen-3` | The hen sits on an egg. |
| `red-hen-4` | The hen sits on a bed. |
| `red-hen-5` | Then the hen sits on a jet! |
| `red-hen-6` | Get off, hen! |
| `pond-start` | Let's read At the Pond. |
| `pond-1` | Kim and Dad go to the pond. |
| `pond-2` | A duck is in the pond. |
| `pond-3` | A frog sits on a log. |
| `pond-4` | Kim gets a fish in the net. |
| `pond-5` | Then the sun sets. |
| `pond-6` | It was fun! |
