# AGENTS.md

Primary Labs is a free set of K–2 reading and math activities ("labs") that run in a web browser.
It is a static site served by GitHub Pages at primary-labs.org (`CNAME`, `.nojekyll`). There is no build
step, no package manager, and no framework.

Consider students with disabilities and neurodivergent (ASD) learners. Clear, predictable
screens and clean, consistent sounds matter more here than visual flair.

Read `DESIGN.md` before changing how any page looks.

## Layout

```
index.html                 home page
assets/                    shared: primary-labs.css (design system), fonts, favicon; home's site.css, home.js, lab-filter.js
labs/letter-chaining/      Letter Chains: grade 1 phonics (window.PL)
labs/monster-math/         Monster Math: K–1 add/subtract within 10 (window.MM)
labs/story-puzzles/        Story Puzzles: grade 1 decodable stories with picture pieces (window.SP)
labs/sound-boxes/          Sound Boxes: K–1 blending and segmenting with sound boxes (window.SB)
tools/voice/               makes every lab's default voice clips with Kokoro (Python, build time only)
test/                      site-wide checks for every page, and the home page's lab list
DESIGN.md                  the design language
```

Each lab has its own `index.html`, `css/`, `js/`, `assets/`, `tools/`, `test/`, and a `README.md`, and loads
the shared stylesheet, fonts, and favicon from the root `assets/`. Read the lab's README before changing it, and keep it up to
date when behavior, files, or commands change.

## Hard rules

These protect student and teacher privacy. Don't loosen them.

- **Strict Content-Security-Policy on every page** (a `<meta http-equiv>` tag): `connect-src 'none'`,
  `script-src 'self'`, `style-src 'self'`, no `unsafe-*`, no outside hosts.
- **No inline code.** No `<script>` bodies, `<style>` tags, `style=` attributes, or `on*=` handlers in
  HTML, and no JS that writes them into markup. No `eval` or `new Function`.
- **Nothing loads from another site.** Fonts, images, and audio are hosted in the repo (fonts only
  in `assets/fonts/`). No `fetch`,
  analytics, CDNs, or Google Fonts.
- **Audio ships as `.js` files.** Because `connect-src 'none'` blocks downloads, each clip is wrapped
  in a script by the lab's `tools/build-audio.js`. After adding or replacing a `.wav`/`.mp3`, run
  `node tools/build-audio.js` from that lab's folder.
- **Teacher recordings stay on the device** (IndexedDB, with expiry). Never add upload or sync.
  Don't rename storage keys or database names (e.g. `primary-labs-letter-chains`); that would orphan
  saved recordings.

## Code style

- Plain browser JavaScript: one IIFE per file with `'use strict'`, attached to the lab's global
  namespace (`window.PL`, `window.MM`, `window.SP`, `window.SB`). Scripts load in order through `<script src>` tags. No ES
  modules, bundlers, or dependencies.
- Node is used only for tools and tests (`node:test`, no npm packages).
- Match the existing file's style. Keep comments short and plain.

## Content and copy

- Always write the name as **Primary Labs** in user-facing text.
- Copy is short and plain, written for teachers and young kids. It never names tools or tech
  (Kokoro, AI, open-source, file formats): the default voice is "a computer voice". Those details
  belong in the READMEs.
- Each lab names the NYS Next Generation standards it covers (README, page metadata, home page entry).
- Follow `DESIGN.md`: Andika font, cream light theme, shared header and buttons, yellow = look here,
  green = correct, drawn icons on controls.

## Voice and phonemes

The labs teach phonics, so audio must carry exactly the right sounds:

- Letter sounds have no added "uh" (/t/, not "tuh"). C and g are always hard. Short o is the "ah" of
  dot, so dog and dot share a vowel. Nonsense words follow the same rules ("cit" is /kɪt/).
- Playback order: teacher recording (Letter Chains only), then bundled clip, then the device voice as
  a last resort.
- Default clips for every lab are made with Kokoro-82M ("Heart" voice, `af_heart`) and checked
  automatically: Letter Chains from exact phoneme strings, Monster Math and Story Puzzles from the
  dictionary with word, sound and glitch checks (Story Puzzles forces short o to "ah"). Sound Boxes
  makes only its directions that way and copies its letter sounds and words from Letter Chains. A person listens only to the clips the checks can't clear,
  and the owner hears every letter sound: a sound they haven't flagged is assumed right, and a remade one
  ships only with their pick. See `tools/voice/README.md`.
- To make, remake, check or ship clips, use the `voice` skill (`.claude/skills/voice/SKILL.md`). Every lab ships
  MP3: letter sounds at 128 kbps, everything else at 96.
- Don't use macOS voices (Samantha etc.) for shipped audio: Apple allows them for personal use only.

Python tooling lives in `tools/voice/` (Python 3.12 venv in `.venv/`, ignored by git). On this
machine `pip`/`uv` are wrapped by a malware scanner: activate the venv and call the bare command
names (`pip install ...`, `uv pip install ...`), not `.venv/bin/pip`.

## Running and testing

```sh
python3 -m http.server 8000        # from the repo root, then open http://localhost:8000
node --test test/ labs/monster-math/test/ labs/story-puzzles/test/ labs/letter-chaining/test/ labs/sound-boxes/test/
cd tools/voice && .venv/bin/python -m unittest   # voice tool tests (needs its venv)
```

- Microphone recording needs https or localhost.
- Check changes in Safari on iPhone/iPad when touching audio: audio must start during a tap
  (`touchend`/`click`), and recordings are stored as ArrayBuffers, not Blobs, because iOS Safari
  can't reliably read Blobs back from IndexedDB. Swapping clips for new MP3s at the same bitrate
  doesn't need this check.
- `test/site.test.js` checks every page's security policy, inline code, outside URLs and linked files,
  that page CSS leaves the shared tokens and classes alone, and that page text names no tools (Kokoro,
  AI, open-source, MP3...). It doesn't check motion, tap targets,
  colors or layout. Each lab's README says what its own tests cover; test the activities by hand in
  the browser.
- After a visual change, look at each page at 390px and desktop widths and Tab through it.

## Adding a lab

1. Create `labs/<slug>/` with its own `index.html` (copy an existing lab's CSP), `css/`, `js/`, and
   a `README.md` covering standards, how it plays, running, and files.
2. Style it with the "Styling a new lab" checklist in `DESIGN.md`.
3. Add it to the `lab-list` in the root `index.html` (grade · subject · standards, one-line description),
   with `data-grade` (`k`, `1`, `2`) and `data-subject` (`reading`, `math`) for the home page filter.
   A new subject also needs a button in the filter.
4. Run `node --test test/`; the site-wide checks pick up the new page automatically.

## Git

Commit messages are short and simple (e.g. "Add Monster Math lab"), with no body unless needed and
no co-author or AI attribution lines. Commit or push only when asked.
