/* inject-learningpath.js <dashboard.html>
   Idempotently adds the shared progressive "Learning Path" reference section:
     1. inserts/replaces the module (between OTT-LEARNINGPATH markers) before renderRef
     2. adds a "🗺️ Learning Path" ref-tab button (first tab) if missing
     3. adds a <div class="ref-panel" id="ref-learning"><div id="lp-mount"></div></div> panel if missing
   The module wraps switchRefTab to render when the tab is shown. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-learningpath.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const mod = fs.readFileSync(path.join(__dirname, 'learning-path-module.js'), 'utf8');
let h = fs.readFileSync(fp, 'utf8');
const report = [];

// ---- 1. module (idempotent) ----
const S = '/* OTT-LEARNINGPATH:START', E = 'OTT-LEARNINGPATH:END */';
if (h.includes(S)) {
  const a = h.indexOf(S), b = h.indexOf(E) + E.length;
  h = h.slice(0, a) + mod.trim() + h.slice(b);
  report.push('module: replaced');
} else {
  const idx = h.indexOf('function renderRef(');
  if (idx < 0) { console.error('renderRef not found'); process.exit(2); }
  h = h.slice(0, idx) + mod.trim() + '\n\n' + h.slice(idx);
  report.push('module: inserted');
}

// ---- 2. tab button (first tab) ----
if (!h.includes("switchRefTab(this,'ref-learning')")) {
  const useDiv = h.includes('<div class="ref-tab active"') || /<div class="ref-tab"/.test(h);
  const btn = useDiv
    ? '\n      <div class="ref-tab" onclick="switchRefTab(this,\'ref-learning\')">🗺️ Learning Path</div>'
    : '\n      <button class="ref-tab" onclick="switchRefTab(this,\'ref-learning\')">🗺️ Learning Path</button>';
  const anchor = '<div class="ref-tabs">';
  const a = h.indexOf(anchor);
  if (a >= 0) { h = h.slice(0, a + anchor.length) + btn + h.slice(a + anchor.length); report.push('tab: added (' + (useDiv?'div':'button') + ')'); }
  else report.push('tab: WARN .ref-tabs not found');
} else report.push('tab: already present');

// ---- 3. panel ----
if (!h.includes('id="ref-learning"')) {
  const anchor = '<div class="ref-panel"';
  const a = h.indexOf(anchor);
  const panel = '<div class="ref-panel" id="ref-learning"><div id="lp-mount"></div></div>\n    ';
  if (a >= 0) { h = h.slice(0, a) + panel + h.slice(a); report.push('panel: added'); }
  else report.push('panel: WARN .ref-panel not found');
} else report.push('panel: already present');

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
