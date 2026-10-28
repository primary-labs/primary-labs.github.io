# AGENTS.md

Primary Labs is a free set of K–2 reading and math activities ("labs") that run in a web browser.
It is a static site served by GitHub Pages at primary-labs.org (`CNAME`, `.nojekyll`). There is no build
step, no package manager, and no framework.

Consider students with disabilities and neurodivergent (ASD) learners. Clear, predictable
screens and clean, consistent sounds matter more here than visual flair.

## Layout

```
index.html, assets/        home page (site.css, home.js, Andika fonts, favicon)
labs/letter-chaining/      Letter Chains: grade 1 phonics (window.PL)
labs/monster-math/         Monster Math: kindergarten add/subtract within 10 (window.MM)
```

Each lab is self-contained: its own `index.html`, `css/`, `js/`, `assets/` (including its own copy of
the fonts), `tools/`, and a `README.md`. Read the lab's README before changing it, and keep it up to
date when behavior, files, or commands change.

## Hard rules

These protect student and teacher privacy. Don't loosen them.

- **Strict Content-Security-Policy on every page** (a `<meta http-equiv>` tag): `connect-src 'none'`,
  `script-src 'self'`, `style-src 'self'`, no `unsafe-*`, no outside hosts.
- **No inline code.** No `<script>` bodies, `<style>` tags, `style=` attributes, or `on*=` handlers in
  HTML, and no JS that writes them into markup. No `eval` or `new Function`.
- **Nothing loads from another site.** Fonts, images, and audio are hosted in the repo. No `fetch`,
  analytics, CDNs, or Google Fonts.
- **Audio ships as `.js` files.** Because `connect-src 'none'` blocks downloads, each clip is wrapped
  in a script by the lab's `tools/build-audio.js`. After adding or replacing a `.wav`/`.mp3`, run
  `node tools/build-audio.js` from that lab's folder.
- **Teacher recordings stay on the device** (IndexedDB, with expiry). Never add upload or sync.
  Don't rename storage keys or database names (e.g. `primary-labs-letter-chains`); that would orphan
  saved recordings.

## Code style

- Plain browser JavaScript: one IIFE per file with `'use strict'`, attached to the lab's global
  namespace (`window.PL`, `window.MM`). Scripts load in order through `<script src>` tags. No ES
  modules, bundlers, or dependencies.
- Node is used only for tools and tests (`node:test`, no npm packages).
- Match the existing file's style. Keep comments short and plain.

## Content and copy

- Always write the name as **Primary Labs** in user-facing text.
- Copy is short and plain, written for teachers and young kids.
- Each lab names the NYS Next Generation standards it covers (README, page metadata, home page entry).
- Use the Andika font (single-story a and g for early readers).

## Voice and phonemes

The labs teach phonics, so audio must carry exactly the right sounds:

- Letter sounds have no added "uh" (/t/, not "tuh"). C and g are always hard. Short o is the "ah" of
  dot, so dog and dot share a vowel. Nonsense words follow the same rules ("cit" is /kɪt/).
- Playback order: teacher recording, then bundled clip, then the device voice as a last resort.
- Default clips are made with Kokoro-82M ("Heart" voice, `af_heart`) from exact phoneme strings and
  checked automatically. See `labs/letter-chaining/tools/voice/README.md`.
- Don't use macOS voices (Samantha etc.) for shipped audio: Apple allows them for personal use only.
- Monster Math has no clips yet; it uses the device voice until they're generated.

Python tooling lives in `labs/letter-chaining/tools/voice/` (Python 3.12 venv in `.venv/`, ignored by
git). On this machine `pip`/`uv` are wrapped by a malware scanner: activate the venv and call the bare
command names (`uv pip install ...`), not `.venv/bin/pip`.

## Running and testing

```sh
python3 -m http.server 8000        # from the repo root, then open http://localhost:8000
node --test labs/monster-math/test/
```

- Microphone recording needs https or localhost.
- Check changes in Safari on iPhone/iPad when touching audio: audio must start during a tap
  (`touchend`/`click`), and recordings are stored as ArrayBuffers, not Blobs, because iOS Safari
  can't reliably read Blobs back from IndexedDB.
- Letter Chains has no automated tests; test it by hand in the browser.

## Adding a lab

1. Create `labs/<slug>/` with its own `index.html` (copy an existing lab's CSP), `css/`, `js/`,
   `assets/fonts/`, favicon, and `README.md` covering standards, how it plays, running, and files.
2. Add it to the `lab-list` in the root `index.html` (grade · subject · standards, one-line description).
3. Consider copying `labs/monster-math/test/site-rules.test.js` to check the security rules.

## Git

Commit messages are short and simple (e.g. "Add Monster Math lab"), with no body unless needed and
no co-author or AI attribution lines. Commit or push only when asked.
