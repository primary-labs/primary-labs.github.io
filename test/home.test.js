// Home page lab list: every lab is listed, and each entry has the grade and subject tags that
// the filter (assets/lab-filter.js) uses.
// Run: node --test test/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// How each tag is written in the entry's "Grade · Subject · Standards" line.
const LABELS = { k: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', reading: 'Reading', math: 'Math' };

const items = [...html.matchAll(/<li\b([^>]*\bclass="lab-item"[^>]*)>([\s\S]*?)<\/li>/g)].map((m) => ({
  href: (m[2].match(/class="lab-link" href="([^"]+)"/) || [])[1],
  meta: (m[2].match(/<p class="lab-meta">([^<]*)<\/p>/) || [])[1] || '',
  tags: (name) => ((m[1].match(new RegExp(`\\sdata-${name}="([^"]*)"`)) || [])[1] || '').split(/\s+/).filter(Boolean)
}));

// The values of a filter's buttons, without "All".
function filterValues(name) {
  const group = html.match(new RegExp(`data-filter="${name}"[^>]*>([\\s\\S]*?)</div>`));
  assert.ok(group, `${name} filter`);
  return [...group[1].matchAll(/<button\b[^>]*\svalue="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}

test('home: every lab is listed', () => {
  const labs = fs.readdirSync(path.join(ROOT, 'labs')).filter((d) => fs.existsSync(path.join(ROOT, 'labs', d, 'index.html')));
  const listed = items.map((i) => i.href);
  for (const d of labs) assert.ok(listed.includes(`labs/${d}/`), `labs/${d}/ is on the home page`);
});

for (const name of ['grade', 'subject']) {
  test(`home: every lab has ${name} tags the filter knows`, () => {
    const values = filterValues(name);
    assert.ok(items.length, 'lab items found');
    for (const item of items) {
      const tags = item.tags(name);
      assert.ok(tags.length, `${item.href} has data-${name}`);
      for (const t of tags) {
        assert.ok(values.includes(t), `${item.href}: ${name} "${t}" has a filter button`);
        assert.ok(item.meta.includes(LABELS[t]), `${item.href}: "${item.meta}" says ${LABELS[t]}`);
      }
    }
  });
}
