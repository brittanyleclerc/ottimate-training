/* inject-profile.js <dashboard.html>
   Idempotently wires the shared profile card + editor into a dashboard:
     1. inserts/replaces the module (between OTT-PROFILE markers) before renderRef
     2. retires the dashboard's OWN editor so there is exactly one:
        - fundamentals / demo-training: the "✏️ Edit" hero link now opens the shared editor;
          the .ev-overlay modal markup and openEditVerticals/closeEditVerticals/saveEditedVerticals are removed
        - pomatch: its inline profileCard + PROFILE EDITOR block are removed (the module renders the card)
        - demo102: nothing to retire
   The module wraps renderDashboard() to insert the card after .page-hero. Re-runnable. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-profile.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const mod = fs.readFileSync(path.join(__dirname, 'profile-module.js'), 'utf8').trim();
let h = fs.readFileSync(fp, 'utf8');
const report = [];
const base = path.basename(file, '.html');

function cutBetween(startMark, endMark, label) {
  const a = h.indexOf(startMark);
  if (a < 0) { report.push(label + ': already removed'); return; }
  const b = h.indexOf(endMark, a);
  if (b < 0) { console.error(label + ': end marker not found'); process.exit(3); }
  h = h.slice(0, a) + h.slice(b);
  report.push(label + ': removed (' + (h.length ? '' : '') + 'up to ' + JSON.stringify(endMark.slice(0, 30)) + ')');
}
function removeBalancedDiv(startMark, label) {
  let a = h.indexOf(startMark);
  if (a < 0) { report.push(label + ': already removed'); return; }
  const re = /<div\b[^>]*>|<\/div>/g; re.lastIndex = a; let depth = 0, m, b = -1;
  while ((m = re.exec(h))) { if (m[0].startsWith('</')) depth--; else depth++; if (depth === 0) { b = re.lastIndex; break; } }
  if (b < 0) { console.error(label + ': unbalanced'); process.exit(3); }
  const ls = h.lastIndexOf('\n', a) + 1; if (h.slice(ls, a).trim() === '') a = ls;
  while (h[b] === '\n') b++;
  h = h.slice(0, a) + h.slice(b);
  report.push(label + ': removed');
}

// ---- 1. module ----
const S = '/* OTT-PROFILE:START', E = 'OTT-PROFILE:END */';
if (h.includes(S)) {
  const a = h.indexOf(S), b = h.indexOf(E) + E.length;
  h = h.slice(0, a) + mod + h.slice(b);
  report.push('module: replaced');
} else {
  const idx = h.indexOf('function renderRef(');
  if (idx < 0) { console.error('renderRef not found'); process.exit(2); }
  h = h.slice(0, idx) + mod + '\n\n' + h.slice(idx);
  report.push('module: inserted before renderRef');
}

// ---- 2. retire the dashboard's own editor ----
if (base === 'fundamentals-training' || base === 'demo-training') {
  if (h.includes('onclick="openEditVerticals()"')) { h = h.split('onclick="openEditVerticals()"').join('onclick="openProfileEditor()"'); report.push('hero link: retargeted to openProfileEditor'); }
  else report.push('hero link: already retargeted');
  const cm = '<!-- EDIT VERTICALS MODAL -->\n'; if (h.includes(cm)) h = h.replace(cm, '');
  removeBalancedDiv('<div class="ev-overlay" id="ev-overlay"', 'ev-overlay modal');
  cutBetween('// ── EDIT VERTICALS', '// ── MAKE.COM NOTIFICATION', 'old edit-verticals JS');
} else if (base === 'pomatch') {
  cutBetween('// ══ PROFILE EDITOR', '// ══ MODULE SHELL', 'old profile editor JS');
  // inline profileCard template inside renderDashboard
  const pcStart = '  const profileCard = `<div class="card mb-2" id="profile-card">';
  const a = h.indexOf(pcStart);
  if (a >= 0) {
    const endTok = '    </div>`;\n'; const b = h.indexOf(endTok, a);
    if (b < 0) { console.error('profileCard template end not found'); process.exit(3); }
    h = h.slice(0, a) + h.slice(b + endTok.length);
    report.push('inline profileCard template: removed');
  } else report.push('inline profileCard template: already removed');
  const use = '    ${profileCard}\n';
  if (h.includes(use)) { h = h.replace(use, ''); report.push('${profileCard} usage: removed'); } else report.push('${profileCard} usage: already removed');
} else if (base === 'demo102') {
  report.push('nothing to retire');
} else { console.error('unknown dashboard: ' + file); process.exit(2); }

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
