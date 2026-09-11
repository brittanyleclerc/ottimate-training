/* inject-statemigrate.js <dashboard.html>
   Idempotently wires the shared additive state migration into a dashboard:
     1. inserts/replaces the module (between OTT-STATEMIGRATE markers) before `function saveState`
     2. routes the dashboard's own state load through ottMigrateState(key)
     3. adds `schemaV: OTT_SCHEMA_V` to the saveState payload
     4. routes the saveState write through ottSafeSetState (cert guard)
   Re-runnable. Exits non-zero if an anchor is not found. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-statemigrate.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const mod = fs.readFileSync(path.join(__dirname, 'state-migration-module.js'), 'utf8').trim();
let h = fs.readFileSync(fp, 'utf8');
const report = [];
const KEY = { 'fundamentals-training.html':'ottimate_fundamentals_state', 'demo-training.html':'ottimate_demo_state',
              'demo102.html':'ottimate_d102_state', 'pomatch.html':'ottimate_pomatch_state' }[path.basename(file)];
if (!KEY) { console.error('unknown dashboard: ' + file); process.exit(2); }

// ---- 1. module ----
// Must be placed at the TOP of the <script> block that loads state: the load in
// fundamentals/demo-training is an IIFE that runs at parse time, so the module's
// `var`s must already be assigned (hoisting alone would leave them undefined).
const S = '/* OTT-STATEMIGRATE:START', E = 'OTT-STATEMIGRATE:END */';
if (h.includes(S)) {
  const a = h.indexOf(S), b = h.indexOf(E) + E.length;
  h = h.slice(0, a) + mod + h.slice(b);
  report.push('module: replaced');
} else {
  const loadIdx = h.indexOf(`'${KEY}'`);
  if (loadIdx < 0) { console.error('state key not found'); process.exit(3); }
  const open = h.lastIndexOf('<script', loadIdx);
  const openEnd = h.indexOf('>', open) + 1;
  if (open < 0 || openEnd <= 0) { console.error('enclosing <script> not found'); process.exit(3); }
  h = h.slice(0, openEnd) + '\n' + mod + '\n' + h.slice(openEnd);
  report.push('module: inserted at top of the state-loading <script> block');
}

// ---- 2. load path ----
const loadCall = `ottMigrateState('${KEY}')`;
if (h.includes(loadCall)) report.push('load: already migrated');
else {
  // Plain-string anchors (no regex escaping needed). Each is a 3-line or 1-line literal match.
  const variants = [
    // fundamentals / demo-training: "const saved = getItem(KEY);\n    if (saved) {\n      const s = JSON.parse(saved);"
    { from: `const saved = localStorage.getItem('${KEY}');\n    if (saved) {\n      const s = JSON.parse(saved);`,
      to:   `const s = ${loadCall};\n    if (s) {` },
    // demo102
    { from: `const saved = JSON.parse(localStorage.getItem('${KEY}') || 'null');`,
      to:   `const saved = ${loadCall};` },
    // pomatch
    { from: `const saved = readState('${KEY}');`,
      to:   `const saved = ${loadCall};` },
  ];
  let done = false;
  for (const v of variants) {
    const i = h.indexOf(v.from);
    if (i >= 0) {
      if (h.indexOf(v.from, i + 1) >= 0) { console.error('load anchor is not unique for ' + KEY); process.exit(4); }
      h = h.slice(0, i) + v.to + h.slice(i + v.from.length); done = true; break;
    }
  }
  if (!done) { console.error('load anchor not found for ' + KEY); process.exit(4); }
  report.push('load: routed through ottMigrateState');
}

// ---- 3. save payload ----
const rawSaveAnchor = "localStorage.setItem('" + KEY + "', JSON.stringify({";
const guardedSaveAnchor = "ottSafeSetState('" + KEY + "', ({";
const saveAnchor = h.includes(guardedSaveAnchor) ? guardedSaveAnchor : rawSaveAnchor;   // step 4 may already have run
if (h.includes(saveAnchor) && /schemaV:\s*OTT_SCHEMA_V/.test(h.slice(h.indexOf(saveAnchor), h.indexOf(saveAnchor) + 400)))
  report.push('save: schemaV already present');
else {
  const a = h.indexOf(saveAnchor);
  if (a < 0) { console.error('save anchor not found'); process.exit(5); }
  const after = a + saveAnchor.length;
  const nl = h.indexOf('\n', after);
  const indent = (h.slice(nl + 1).match(/^\s*/) || [''])[0];
  h = h.slice(0, nl + 1) + indent + 'schemaV: OTT_SCHEMA_V,\n' + h.slice(nl + 1);
  report.push('save: schemaV added to payload');
}

// ---- 4. cert guard: route the save through ottSafeSetState ----
const rawSave = "localStorage.setItem('" + KEY + "', JSON.stringify({";
const guarded = "ottSafeSetState('" + KEY + "', ({";
if (h.includes(guarded)) report.push('save: already routed through cert guard');
else if (h.includes(rawSave)) {
  if (!h.includes('function ottSafeSetState')) { console.error('module lacks ottSafeSetState'); process.exit(6); }
  if (h.indexOf(rawSave) !== h.lastIndexOf(rawSave)) { console.error('save anchor not unique'); process.exit(6); }
  h = h.replace(rawSave, guarded);
  report.push('save: routed through ottSafeSetState (cert guard)');
} else { console.error('save anchor for cert guard not found'); process.exit(6); }

// ---- 5. "Not you? / Reset" clears every dashboard + the shared profile ----
const ownRemove = "localStorage.removeItem('" + KEY + "');";
if (h.includes(ownRemove)) {
  if (h.indexOf(ownRemove) !== h.lastIndexOf(ownRemove)) { console.error('removeItem anchor not unique'); process.exit(7); }
  h = h.replace(ownRemove, () => 'ottResetAllProgress();');
  report.push('reset: now clears all dashboards + shared profile');
} else if (h.includes('ottResetAllProgress();')) report.push('reset: already shared');
else { console.error('reset anchor not found'); process.exit(7); }
const RESET_MSG = 'This will clear the current name, role, verticals, and ALL training progress on this browser (every dashboard) so a new person can start fresh. Certifications already reported to Sales Enablement are unaffected. Continue?';
for (const old of ['This will clear all progress and return to the welcome screen so a new user can start fresh. Continue?', 'Reset all progress? This cannot be undone.']) {
  if (h.includes("'" + old + "'")) { h = h.split("'" + old + "'").join("'" + RESET_MSG + "'"); report.push('reset: confirm text unified'); }
}

// ---- 6. fundamentals only: persist m3Stale (Module 3 completed under different verticals) ----
if (KEY === 'ottimate_fundamentals_state') {
  const payloadLine = '      schemaV: OTT_SCHEMA_V,\n';
  if (!h.includes('m3Stale: APP.m3Stale')) { h = h.replace(payloadLine, () => payloadLine + '      m3Stale: !!APP.m3Stale,\n'); report.push('m3Stale: added to payload'); }
  const restoreAnchor = '      if (s.quizScores) APP.quizScores = s.quizScores;\n';
  if (!h.includes('APP.m3Stale = true')) { if (!h.includes(restoreAnchor)) { console.error('restore anchor not found'); process.exit(8); } h = h.replace(restoreAnchor, () => restoreAnchor + '      if (s.m3Stale) APP.m3Stale = true;\n'); report.push('m3Stale: restored on load'); }
}

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
