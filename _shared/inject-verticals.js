/* inject-verticals.js <dashboard.html>
   Rolls the shared Industry Verticals reference tab into a dashboard (all four):
     1. inserts/replaces the module between OTT-VERTICALS markers before renderRef —
        data (VERTICAL_PROFILES from verticals-profiles.js + VERTICAL_LENSES from verticals-lenses.js)
        is prepended as JSON so the dashboard stays self-contained
     2. ensures a "🗂️ Industry Verticals" ref-tab right after Objection Handler
     3. ensures a <div class="ref-panel" id="ref-verticals"><div id="vr-mount"></div></div> panel
     4. retires each dashboard's own implementation:
        - fundamentals: VERTICAL_PRINT_DATA, renderVerticalRefPanel(), switchRefVTab(), the two render hooks
        - demo-training: the inline verticals build inside renderRef(), switchRefVTab()
     5. fundamentals + demo-training: regenerates `const VERTICAL_DATA` (Module 3 / quiz content) from the
        canonical profiles so there is one source of truth
   Re-runnable. */
const fs = require('fs');
const path = require('path');
const { VERTICAL_PROFILES } = require('./verticals-profiles.js');
const { VERTICAL_LENSES } = require('./verticals-lenses.js');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-verticals.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const base = path.basename(file, '.html');
let h = fs.readFileSync(fp, 'utf8');
const report = [];
const rep = (a, b, label) => { const i = h.indexOf(a); if (i < 0) { report.push(label + ': already done'); return false; } if (h.indexOf(a, i + 1) >= 0) throw new Error(label + ': anchor not unique'); h = h.slice(0, i) + b + h.slice(i + a.length); return true; };
const cutBlock = (startMark, endMark, label, inclusiveEnd) => {
  const a = h.indexOf(startMark); if (a < 0) { report.push(label + ': already removed'); return; }
  const b = h.indexOf(endMark, a); if (b < 0) throw new Error(label + ': end not found');
  h = h.slice(0, a) + h.slice(inclusiveEnd ? b + endMark.length : b); report.push(label + ': removed');
};

// ---- 1. module ----
const renderCode = fs.readFileSync(path.join(__dirname, 'verticals-module.js'), 'utf8').trim();
// NOTE: function replacements — the data contains "$1..." (dollar amounts), which a string
// replacement would interpret as a capture-group reference.
const dataBlock = 'const VERTICAL_PROFILES = ' + JSON.stringify(VERTICAL_PROFILES) + ';\nconst VERTICAL_LENSES = ' + JSON.stringify(VERTICAL_LENSES) + ';\n';
const mod = renderCode.replace('/* OTT-VERTICALS:START', () => '/* OTT-VERTICALS:START — data generated from _shared/verticals-profiles.js + verticals-lenses.js by inject-verticals.js; do not hand-edit.')
  .replace(/(\*\/\n)/, (m) => m + dataBlock);
const S = '/* OTT-VERTICALS:START', E = '/* OTT-VERTICALS:END */';
if (h.includes(S)) { const a = h.indexOf(S), b = h.indexOf(E) + E.length; h = h.slice(0, a) + mod + h.slice(b); report.push('module: replaced'); }
else { const i = h.indexOf('function renderRef('); if (i < 0) throw new Error('renderRef not found'); h = h.slice(0, i) + mod + '\n\n' + h.slice(i); report.push('module: inserted before renderRef'); }

// ---- 2. tab after Objection Handler ----
if (!h.includes("switchRefTab(this,'ref-verticals')")) {
  const m = h.match(/\n(\s*)<(div|button) class="ref-tab" onclick="switchRefTab\(this,'ref-objections'\)">[^\n]*<\/(div|button)>/);
  if (!m) throw new Error('objections tab not found');
  const tag = m[2];
  const line = '\n' + m[1] + '<' + tag + ' class="ref-tab" onclick="switchRefTab(this,\'ref-verticals\')">🗂️ Industry Verticals</' + tag + '>';
  const at = h.indexOf(m[0]) + m[0].length; h = h.slice(0, at) + line + h.slice(at); report.push('tab: added after Objection Handler');
} else report.push('tab: present');

// ---- 3./4. panel + retire own implementation ----
const PANEL = '<div class="ref-panel" id="ref-verticals"><div id="vr-mount"></div></div>';
if (base === 'fundamentals-training') {
  rep('    <!-- INDUSTRY VERTICALS REFERENCE — populated by renderVerticalRefPanel() -->\n    <div class="ref-panel" id="ref-verticals"></div>', '    ' + PANEL, 'panel');
  rep("  if (panelId === 'ref-verticals') renderVerticalRefPanel();\n", '', 'switchRefTab hook');
  rep("  // For verticals: ensure content is rendered\n  if (tabId === 'ref-verticals') renderVerticalRefPanel();\n", '', 'printTab hook');
  cutBlock('const VERTICAL_PRINT_DATA = {', '\n};\n', 'VERTICAL_PRINT_DATA', true);
  cutBlock('function renderVerticalRefPanel() {', '\n}\n', 'renderVerticalRefPanel', true);
  cutBlock('function switchRefVTab(btn, prefix, vKey) {', '\n}\n', 'switchRefVTab', true);
} else if (base === 'demo-training') {
  rep('    <div class="ref-panel" id="ref-verticals">\n      ${refVerticalsHTML}\n    </div>', '    ' + PANEL, 'panel');
  cutBlock('  // Build verticals HTML before the template literal to avoid IIFE-in-template issues\n', '    _refVertPanels;\n', 'inline verticals build in renderRef', true);
  cutBlock('function switchRefVTab(btn, prefix, vKey) {', '\n}\n', 'switchRefVTab', true);
} else if (base === 'demo102' || base === 'pomatch') {
  if (!h.includes('id="ref-verticals"')) {
    const anchor = '<div class="ref-panel" id="ref-battlecards"';
    const a = h.indexOf(anchor); if (a < 0) throw new Error('battlecards panel not found');
    const ls = h.lastIndexOf('\n', a) + 1; const indent = h.slice(ls, a);
    h = h.slice(0, ls) + indent + PANEL + '\n' + h.slice(ls); report.push('panel: added before Battlecards');
  } else report.push('panel: present');
} else { console.error('unknown dashboard'); process.exit(2); }

// ---- 5. regenerate VERTICAL_DATA (Module 3 content) from canonical ----
if (base === 'fundamentals-training' || base === 'demo-training') {
  const a = h.indexOf('const VERTICAL_DATA = {'); if (a < 0) throw new Error('VERTICAL_DATA not found');
  const b = h.indexOf('\n};', a) + 3;
  const esc = (s) => s.replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;');
  const data = {};
  for (const k of Object.keys(VERTICAL_PROFILES)) { const p = VERTICAL_PROFILES[k];
    data[k] = { label: p.label + ' ' + p.emoji, headline: esc(p.tagline), intro: esc(p.desc), challenges: p.pain.map(esc), solution: p.solve.map(s => '<strong>' + esc(s[0]) + '</strong>: ' + esc(s[1])), quote: esc(p.voice), icp: esc(p.icp) }; }
  const gen = '// VERTICAL_DATA is GENERATED from _shared/verticals-profiles.js by inject-verticals.js — edit the canonical, then re-run.\nconst VERTICAL_DATA = ' + JSON.stringify(data, null, 2) + ';';
  const before = h.slice(a, b);
  // drop a previous generated-comment line if present
  const cl = h.lastIndexOf('\n', a - 1); const prevLine = h.slice(cl + 1, a);
  const start = /^\/\/ VERTICAL_DATA is GENERATED/.test(prevLine) ? cl + 1 : a;
  h = h.slice(0, start) + gen + h.slice(b);
  report.push('VERTICAL_DATA: regenerated from canonical (' + (before.length) + ' → ' + gen.length + ' chars)');
}

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
