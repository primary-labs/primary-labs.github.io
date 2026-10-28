// The page must work under its own security policy: no inline scripts or styles, no outside requests.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./load');

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = read('index.html');
const js = fs.readdirSync(path.join(ROOT, 'js')).map((f) => ['js/' + f, read('js/' + f)]);
const css = read('css/styles.css');

test('the security policy is strict', () => {
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  for (const rule of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "connect-src 'none'"]) assert.ok(csp.includes(rule), rule);
  assert.doesNotMatch(csp, /unsafe-|https?:/);
});

test('no inline scripts, styles, or event handlers in the page', () => {
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    assert.match(m[1], /\bsrc="/, 'every script has a src');
    assert.equal(m[2].trim(), '', 'no code inside script tags');
  }
  assert.doesNotMatch(html, /<style\b/);
  assert.doesNotMatch(html, /\sstyle=/);
  assert.doesNotMatch(html, /\son[a-z]+=/);
});

test('scripts never write inline styles or handlers into markup', () => {
  for (const [f, src] of js) {
    assert.doesNotMatch(src, /style=/, f);
    assert.doesNotMatch(src, /\son[a-z]+=["']/, f);
    assert.doesNotMatch(src, /\beval\(|new Function\(/, f);
  }
});

test('nothing loads from another site', () => {
  const files = [['index.html', html], ['css/styles.css', css], ...js];
  for (const [f, src] of files) {
    const urls = (src.match(/(?:src|href)=["']([^"']+)|url\(['"]?([^'")]+)/g) || []);
    for (const u of urls) assert.doesNotMatch(u, /\/\/|https?:/, `${f}: ${u}`);
    assert.doesNotMatch(src, /fonts\.googleapis|fonts\.gstatic|\bfetch\(/, f);
  }
});

test('every file the page links to exists', () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('../'));
  for (const r of refs) assert.ok(fs.existsSync(path.join(ROOT, r)), r);
  for (const m of css.matchAll(/url\('\.\.\/([^']+)'\)/g)) assert.ok(fs.existsSync(path.join(ROOT, m[1])), m[1]);
});
