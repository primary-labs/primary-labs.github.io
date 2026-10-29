# Primary Labs design language

Every page looks and behaves like Letter Chains, the lab people praised. This file holds the rules.
The shared parts live in `assets/primary-labs.css`. `node --test test/` checks the rules a script can check.

Design for students with disabilities and neurodivergent (ASD) learners: clear, predictable screens
and calm surroundings matter more than visual flair.

## Principles

1. **Color carries information.** There are few colors, and each has one job (see the table below).
   Labs may add colors for content, like Monster Math's monster and robot groups and the red X, but
   never reuse yellow or green for anything else.
2. **Warm, calm surroundings.** A cream page, white cards with a soft shadow, and beige lines. The
   space around the activity stays quiet so the activity stands out.
3. **Big and tappable.** Tap targets are at least 44px and buttons at least 48px. Buttons are
   pill-shaped with a "key" look: a darker bottom edge that presses down on tap. There are three
   corner sizes only.
4. **One typeface.** Andika, which has single-story a and g for early readers. Bold (700) for
   anything a child taps or reads. 18px body text, and very large letters and numbers in the activity.
5. **An obvious focus ring.** A white-and-ink double ring on everything focusable. It always wins
   over a button's own shadow.
6. **Motion only as feedback.** Things move because a child just did something, or to point at the
   next step. At most 0.6 seconds, no decorative loops, and off when the device asks for reduced motion.
7. **Drawn icons for controls.** Buttons use simple SVG icons drawn in `currentColor` (speaker,
   bell, play). Emoji are fine as pictures inside content (👾 Monsters, word pictures), not as
   control icons. Emoji keep their own colors and can vanish on a selected button.

Light theme only. Every page sets `<meta name="theme-color" content="#FFF8EC">`.

## Colors

| Token | Value | Job |
| --- | --- | --- |
| `--bg` | `#FFF8EC` | page background |
| `--bg-deep` | `#FBEFD9` | hover, wells, page bands |
| `--surface` | `#FFFFFF` | cards and panels |
| `--line` | `#EADFC9` | borders and dividers |
| `--ink` | `#1F2A44` | text, main button, selected state |
| `--ink-soft` | `#4A5672` | secondary text |
| `--yellow` / `-dark` / `-soft` | `#FFC93C` / `#C99208` / `#FFF1C7` | look here, selected, what changed |
| `--green` / `-soft` | `#1F8A3B` / `#DDF3E3` | correct, done, saved |
| `--danger` | `#B42318` | destructive teacher actions only (delete) |
| `--vowel` / `-dark` / `-soft` | `#C93C20` / `#8F2914` / `#FDE4DD` | vowel (reading labs only) |
| `--consonant` / `-dark` / `-soft` | `#2160B0` / `#153F76` / `#DDEBFB` | consonant (reading labs only) |

Lab-only colors stay in the lab's CSS, for example Letter Chains' traffic-light lamps
(`--go`, `--slow`, `--stop`) and Monster Math's group colors and `--cross`.

## Type, shape, depth

- `--font`: Andika, then Trebuchet MS and the system font. Body 18px, line height 1.5.
- Corners: `--radius-sm` 14px (wells, inputs), `--radius` 22px (cards), `--radius-lg` 32px (the
  activity panel). Pills and round buttons use 999px.
- `--shadow` for cards and panels. Pressable buttons get a key edge: `0 4px 0` of a darker shade,
  `0 2px 0` while pressed.
- `--focus`: the double ring. `--page`: content width, 1120px, with 16px side padding.

## Page frame

- **Header** on every page: the Primary Labs mark and name (links to the site home), then on lab
  pages a `· Lab Name` title, then the lab's nav and tools on the right. The title links to the lab's
  start when the lab has more than one view; otherwise it is plain text. Under 1040px wide, a header
  with a lab title shows the mark without the brand name, so the lab's tabs fit on tablets. Under
  720px the nav gets its own row and the header stops being sticky. Check the header at 768px too.
- **Footer**: light, with a top border, "Primary Labs" in bold and one short line.

## Shared components

All of these are in `assets/primary-labs.css`.

| Class | Use it for |
| --- | --- |
| `.site-header`, `.header-inner`, `.brand`, `.brand-mark`, `.brand-name`, `.lab-title`, `.site-nav` | the page header |
| `.btn` + `--primary` | the one main action on screen (dark ink) |
| `.btn--listen` | "Hear it" actions (yellow: look here) |
| `.btn--ghost`, `.btn--tool` | secondary actions |
| `.btn--danger` | delete, in teacher areas only |
| `.btn--big`, `.btn--sm` | size modifiers; `.btn-icon` holds an SVG inside a button |
| `.icon-btn` | round icon button (sound, mute); `.is-muted` for its off state |
| `.panel` | the main activity surface (radius 32) |
| `.card` | teacher and info blocks (radius 22) |
| `.segmented` | one choice out of a few: radio labels (`.seg`) or buttons with `aria-pressed` |
| `.pill`, `.pill-num` | a row of choices, like chain pickers |
| `.note` | a yellow callout |
| `.fine` | small print |
| `.site-footer`, `.footer-brand` | the footer |
| `.toast` | a short status message at the bottom |
| `.sr-only`, `.skip-link` | accessibility helpers |

Shared animations: `pop`, `shake`, `bounce`, `rise`.

```html
<button type="button" class="btn btn--primary btn--big">Next one</button>
<button type="button" class="icon-btn" aria-label="Sound effects"><svg viewBox="0 0 24 24">…</svg></button>
<div class="segmented" role="group" aria-label="Numbers">
  <button type="button" aria-pressed="true">up to 5</button>
  <button type="button" aria-pressed="false">up to 10</button>
</div>
```

## Rules for page CSS

Each page loads `primary-labs.css` first, then its own stylesheet. The page stylesheet:

- doesn't define shared tokens, `@font-face`, or `prefers-color-scheme` styles;
- doesn't restyle shared classes. Give lab parts their own class names. Adjusting a shared class
  inside the lab's own component is fine (`.btn--rec .btn-icon`); `.btn { … }` is not;
- may add its own tokens (`--tile`, `--monA`) and its own modifiers (`.btn--rec`).

## Styling a new lab

1. Link `../../assets/primary-labs.css` before `css/styles.css`. Point the favicon and font preload
   at `../../assets/`.
2. Set `theme-color` to `#FFF8EC`.
3. Use the shared header with a `.lab-title`.
4. Put the activity on a `.panel`. Use `.btn--primary` for the one main action.
5. Use yellow only for "look here" and green only for "correct". Red and blue mean vowel and
   consonant, and only in reading labs.
6. Use drawn SVG icons for controls, not emoji.
7. Run `node --test test/`, then look at the page at 390px and desktop widths, and Tab through it.
