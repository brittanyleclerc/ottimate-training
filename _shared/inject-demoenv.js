/* inject-demoenv.js <dashboard.html>
   Adds the shared "Demo Environment" link to a dashboard, in the one place that is identical in all
   four: the sidebar's RESOURCES section, directly under "Reference Materials". It is persistent (visible
   from every screen), always in the same spot, and opens in a new tab so training is never navigated away.
   A muted one-liner underneath carries the access note, right where the question arises.
   Canonical URL + copy live here — edit once, re-run on every dashboard. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-demoenv.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
let h = fs.readFileSync(fp, 'utf8');
const report = [];

const URL = 'https://demo-2026-api.plateiq.com/demoapp/';
const NOTE = 'No access? Ask your manager or your Ottimate rep.';
const ITEM_ID = 'snav-demoenv';

// ---- CSS (idempotent) ----
if (!h.includes('.si-ext-note')) {
  const css = '.sidebar-item.si-ext { display:flex; align-items:center; gap:0.5rem; text-decoration:none; }\n'
    + '.sidebar-item.si-ext .si-ext-arrow { margin-left:auto; font-size:0.75rem; opacity:0.7; }\n'
    + '.si-ext-note { font-size:0.68rem; line-height:1.35; color:rgba(255,255,255,0.55); padding:0.1rem 1.25rem 0.5rem 2.35rem; }\n';
  h = h.replace('</style>', () => css + '</style>');
  report.push('css: added');
} else report.push('css: present');

// ---- sidebar item under Reference Materials (idempotent) ----
if (!h.includes('id="' + ITEM_ID + '"')) {
  const m = h.match(/\n(\s*)<div class="sidebar-item" id="snav-ref" onclick="showRef\(\)">[^\n]*<\/div>/);
  if (!m) { console.error('sidebar Reference Materials item not found'); process.exit(2); }
  const indent = m[1];
  const block = '\n' + indent + '<a class="sidebar-item si-ext" id="' + ITEM_ID + '" href="' + URL + '" target="_blank" rel="noopener" title="' + NOTE + '"><span class="si-icon">🖥️</span> Demo Environment<span class="si-ext-arrow">↗</span></a>'
    + '\n' + indent + '<div class="si-ext-note">' + NOTE + '</div>';
  const at = h.indexOf(m[0]) + m[0].length;
  h = h.slice(0, at) + block + h.slice(at);
  report.push('sidebar: Demo Environment link added under Reference Materials');
} else report.push('sidebar: already present');

// ---- keep the URL/copy in sync on re-runs ----
const before = h;
h = h.replace(/(<a class="sidebar-item si-ext" id="snav-demoenv" href=")[^"]*(")/, (m0, a, b) => a + URL + b)
     .replace(/(id="snav-demoenv"[^>]*title=")[^"]*(")/, (m0, a, b) => a + NOTE + b)
     .replace(/(<div class="si-ext-note">)[^<]*(<\/div>)/, (m0, a, b) => a + NOTE + b);
if (h !== before) report.push('link/copy: refreshed');

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
