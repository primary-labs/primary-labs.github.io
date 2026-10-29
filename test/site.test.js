// Site-wide checks for every page: the security rules (no inline code, nothing from other sites)
// and the design rules in DESIGN.md (one shared stylesheet, one set of tokens, light theme only).
// Run: node --test test/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHARED_CSS = 'assets/primary-labs.css';

// Classes styled by the shared stylesheet. Page CSS may add its own classes and modifiers
// (`.btn--rec`, `.card-head`), but never restyle these.
const SHARED_CLASSES = ['skip-link', 'sr-only', 'site-header', 'header-inner', 'brand', 'brand-mark',
  'brand-name', 'lab-title', 'site-nav', 'btn', 'btn-icon', 'icon-btn', 'card', 'panel', 'segmented',
  'seg', 'pill', 'pill-num', 'note', 'fine', 'site-footer', 'footer-brand', 'toast',
  'btn--primary', 'btn--big', 'btn--ghost', 'btn--sm', 'btn--listen', 'btn--tool', 'btn--danger',
  'icon-btn--danger'];

// The shared tokens and their exact values (from Letter Chains).
const TOKENS = {
  'bg': '#FFF8EC', 'bg-deep': '#FBEFD9', 'surface': '#FFFFFF', 'line': '#EADFC9',
  'ink': '#1F2A44', 'ink-soft': '#4A5672',
  'yellow': '#FFC93C', 'yellow-dark': '#C99208', 'yellow-soft': '#FFF1C7',
  'green': '#1F8A3B', 'green-soft': '#DDF3E3', 'danger': '#B42318',
  'vowel': '#C93C20', 'vowel-dark': '#8F2914', 'vowel-soft': '#FDE4DD',
  'consonant': '#2160B0', 'consonant-dark': '#153F76', 'consonant-soft': '#DDEBFB',
  'radius-sm': '14px', 'radius': '22px', 'radius-lg': '32px', 'page': '1120px'
};
const TOKEN_NAMES = [...Object.keys(TOKENS), 'shadow', 'focus', 'font'];

// Selectors in page CSS that restyle a shared class. Selector text is whatever sits between the
// previous rule boundary and each "{". A shared class may be adjusted inside a lab's own component
// (`.btn--rec .btn-icon`): some earlier part of the selector must name a lab class. Otherwise it
// restyles the shared part page-wide (`.btn { }`, `main .btn { }`).
function sharedRestyles(css) {
  const sharedClass = new RegExp(String.raw`\.(${SHARED_CLASSES.join('|')})(?![\w-])`);
  const isShared = (c) => SHARED_CLASSES.includes(c);
  const found = [];
  for (const m of stripComments(css).matchAll(/(?:^|[{};])([^{};]*)\{/g)) {
    const sel = m[1].trim();
    if (sel.startsWith('@')) continue;
    for (const part of sel.split(',')) {
      let scoped = false;
      for (const compound of part.trim().split(/[\s>+~]+/)) {
        if (!scoped && sharedClass.test(compound)) { found.push(part.trim()); break; }
        const classes = [...compound.matchAll(/\.([\w-]+)/g)].map((c) => c[1]);
        if (classes.some((c) => !isShared(c))) scoped = true;
      }
    }
  }
  return found;
}

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Resolve a reference from a file to a repo-relative path ('' for the site root).
function resolve(from, ref) {
  const clean = ref.split('#')[0].split('?')[0];
  return path.relative(ROOT, path.resolve(ROOT, path.dirname(from), clean));
}

function tags(html, name) { return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]); }
function attr(tag, name) { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`)); return m ? m[1] : null; }

const PAGES = [['home', 'index.html'],
  ...fs.readdirSync(path.join(ROOT, 'labs')).filter((d) => fs.existsSync(path.join(ROOT, 'labs', d, 'index.html')))
    .map((d) => [d, `labs/${d}/index.html`])];

for (const [name, page] of PAGES) {
  const html = read(page);
  const links = tags(html, 'link');
  const sheets = links.filter((t) => attr(t, 'rel') === 'stylesheet').map((t) => resolve(page, attr(t, 'href')));
  const scripts = tags(html, 'script').map((t) => attr(t, 'src')).filter(Boolean).map((s) => resolve(page, s));
  const pageCss = sheets.filter((f) => f !== SHARED_CSS).map((f) => [f, stripComments(read(f))]);
  const js = scripts.map((f) => [f, read(f)]);

  // ---------------------------------------------------------------- security

  test(`${name}: the security policy is strict`, () => {
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
    for (const rule of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "connect-src 'none'"]) assert.ok(csp.includes(rule), rule);
    assert.doesNotMatch(csp, /unsafe-|https?:/);
  });

  test(`${name}: no inline scripts, styles, or event handlers in the page`, () => {
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      assert.match(m[1], /\bsrc="/, 'every script has a src');
      assert.equal(m[2].trim(), '', 'no code inside script tags');
    }
    assert.doesNotMatch(html, /<style\b/);
    assert.doesNotMatch(html, /\sstyle=/);
    assert.doesNotMatch(html, /\son[a-z]+=/);
  });

  test(`${name}: scripts never write inline styles or handlers into markup`, () => {
    for (const [f, src] of js) {
      assert.doesNotMatch(src, /style=/, f);
      assert.doesNotMatch(src, /\son[a-z]+=["']/, f);
      assert.doesNotMatch(src, /\beval\(|new Function\(/, f);
    }
  });

  test(`${name}: nothing loads from another site`, () => {
    const files = [[page, html], ...sheets.map((f) => [f, read(f)]), ...js];
    for (const [f, src] of files) {
      const urls = src.match(/(?:src|href)=["']([^"']+)|url\(['"]?([^'")]+)/g) || [];
      for (const u of urls) assert.doesNotMatch(u, /\/\/|https?:/, `${f}: ${u}`);
      assert.doesNotMatch(src, /fonts\.googleapis|fonts\.gstatic|\bfetch\(/, f);
    }
  });

  test(`${name}: every file the page links to exists`, () => {
    for (const m of html.matchAll(/(?:src|href)="([^"#]*)(?:#[^"]*)?"/g)) {
      if (!m[1]) continue;
      const f = resolve(page, m[1]);
      assert.ok(fs.existsSync(path.join(ROOT, f)), `${page}: ${m[1]}`);
    }
    for (const f of sheets) {
      for (const m of read(f).matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
        if (m[1].startsWith('data:')) continue;
        assert.ok(fs.existsSync(path.join(ROOT, resolve(f, m[1]))), `${f}: ${m[1]}`);
      }
    }
  });

  // ---------------------------------------------------------------- design

  test(`${name}: loads the shared stylesheet first`, () => {
    assert.equal(sheets[0], SHARED_CSS);
  });

  test(`${name}: uses the shared font and icon`, () => {
    const preload = links.find((t) => attr(t, 'rel') === 'preload' && attr(t, 'as') === 'font');
    assert.ok(preload, 'font preload');
    assert.equal(resolve(page, attr(preload, 'href')), 'assets/fonts/andika-700.woff2');
    const icon = links.find((t) => attr(t, 'rel') === 'icon');
    assert.ok(icon, 'favicon link');
    assert.equal(resolve(page, attr(icon, 'href')), 'assets/favicon.svg');
  });

  test(`${name}: theme color is cream`, () => {
    assert.match(html, /<meta name="theme-color" content="#FFF8EC">/);
  });

  test(`${name}: page CSS leaves the design system alone`, () => {
    const tokenDef = new RegExp(String.raw`(?<![\w-])--(${TOKEN_NAMES.join('|')})\s*:`);
    for (const [f, css] of pageCss) {
      assert.doesNotMatch(css, /@font-face/, `${f}: @font-face`);
      assert.doesNotMatch(css, /prefers-color-scheme/, `${f}: prefers-color-scheme`);
      const def = css.match(tokenDef);
      assert.equal(def, null, `${f} defines shared token ${def && def[0]}`);
      assert.deepEqual(sharedRestyles(css), [], `${f} restyles a shared class`);
    }
  });
}

// ---------------------------------------------------------------- shared stylesheet

test('shared stylesheet defines every token', () => {
  const css = stripComments(read(SHARED_CSS));
  for (const [token, value] of Object.entries(TOKENS)) {
    const m = css.match(new RegExp(String.raw`(?<![\w-])--${token}\s*:\s*([^;]+);`));
    assert.ok(m, `--${token} is defined`);
    assert.equal(m[1].trim().toUpperCase(), value.toUpperCase(), `--${token}`);
  }
  for (const token of ['shadow', 'focus', 'font']) assert.match(css, new RegExp(String.raw`(?<![\w-])--${token}\s*:`), `--${token}`);
});

test('shared focus ring wins over component shadows', () => {
  assert.match(stripComments(read(SHARED_CSS)), /:focus-visible\s*\{[^}]*box-shadow:\s*var\(--focus\)\s*!important/);
});

test('fonts live in one place', () => {
  for (const d of fs.readdirSync(path.join(ROOT, 'labs'))) {
    assert.equal(fs.existsSync(path.join(ROOT, 'labs', d, 'assets', 'fonts')), false, `labs/${d}/assets/fonts`);
  }
  assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'fonts', 'andika-700.woff2')));
});

test('the restyle check catches shared modifiers and page-wide prefixes', () => {
  assert.deepEqual(sharedRestyles('.btn--primary { color: red; }'), ['.btn--primary']);
  assert.deepEqual(sharedRestyles('.icon-btn--danger { color: red; }'), ['.icon-btn--danger']);
  assert.deepEqual(sharedRestyles('main .btn { border-radius: 4px; }'), ['main .btn']);
  assert.deepEqual(sharedRestyles('body > .site-header { position: static; }'), ['body > .site-header']);
});

test('the restyle check allows lab classes and tweaks inside them', () => {
  assert.deepEqual(sharedRestyles('.btn--rec { color: red; } .btn--rec .btn-icon { width: 16px; }'), []);
  assert.deepEqual(sharedRestyles('.chain-picker > * { flex-shrink: 0; } .card-head h2 { margin: 0; }'), []);
});

// DESIGN.md: buttons are at least 48px tall.
test('shared buttons are at least 48px tall', () => {
  const css = stripComments(read(SHARED_CSS));
  for (const sel of ['.btn', '.segmented > button']) {
    const esc = sel.replace(/[.>]/g, (c) => '\\' + c).replace(/ /g, '\\s*');
    const rule = css.match(new RegExp(`(?:^|})\\s*${esc}\\s*\\{([^}]*)\\}`));
    assert.ok(rule, `${sel} rule`);
    const h = rule[1].match(/min-height:\s*(\d+)px/);
    assert.ok(h && Number(h[1]) >= 48, `${sel} min-height is ${h && h[1]}px`);
  }
});
