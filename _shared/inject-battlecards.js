/* inject-battlecards.js <dashboard.html>
   Idempotently wires the generated battlecards module into a dashboard:
     1. swaps the inline bc-filters+bc-grid+modals for <div id="bc-mount"></div>
        (done FIRST, on the original file, so the module's own strings can't collide)
     2. inserts (or replaces, between OTT-BATTLECARDS markers) the module before renderRef
   The module wraps switchRefTab to render battlecards when the tab is shown, so no
   fragile post-template hook is needed. Re-runnable. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-battlecards.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const mod = fs.readFileSync(path.join(__dirname, 'generated', 'battlecards-module.js'), 'utf8');
let h = fs.readFileSync(fp, 'utf8');
const report = [];

// ---- 1. Swap inline battlecards for a mount (BEFORE module insertion) ----
if (!h.includes('id="bc-mount"')) {
  const startMarks = ['<div class="bc-filters" id="bc-filter-bar">', '<div class="bc-filters">'];
  const endMarks = ['${battlecardModals()}', '<div class="bc-print-section"'];
  let a = -1; for (const s of startMarks){ a = h.indexOf(s); if (a >= 0) break; }
  let b = -1, em, keepEnd = false;
  if (a >= 0) for (const e of endMarks){ const j = h.indexOf(e, a); if (j >= 0){ b = j; em = e; keepEnd = (e !== '${battlecardModals()}'); break; } }
  if (a >= 0 && b > a) {
    h = h.slice(0, a) + '<div id="bc-mount"></div>\n      ' + h.slice(keepEnd ? b : b + em.length);
    report.push('panel: swapped inline battlecards -> #bc-mount (end: ' + em + (keepEnd ? ', kept' : ', consumed') + ')');
  } else { report.push('panel: WARN could not find inline block (a='+a+' b='+b+')'); }
} else report.push('panel: already #bc-mount (skipped)');

// ---- 2. Insert/replace module (AFTER swap) ----
const S = '/* OTT-BATTLECARDS:START', E = 'OTT-BATTLECARDS:END */';
if (h.includes(S)) {
  const a = h.indexOf(S), b = h.indexOf(E) + E.length;
  h = h.slice(0, a) + mod + h.slice(b);
  report.push('module: replaced between markers');
} else {
  const idx = h.indexOf('function renderRef(');
  if (idx < 0) { console.error('renderRef not found'); process.exit(2); }
  h = h.slice(0, idx) + mod + '\n\n' + h.slice(idx);
  report.push('module: inserted before renderRef');
}

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
