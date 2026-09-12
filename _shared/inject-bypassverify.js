/* inject-bypassverify.js <dashboard.html | portal.html>
   Idempotently inserts/replaces the shared bypass-verification module (between OTT-BYPASSVERIFY markers):
     - dashboards: right after the OTT-EMAILBANNER block (requires inject-statemigrate + inject-emailbanner first)
     - portal.html: right before the "// Run on load" line of its main script
   Re-runnable. See CONSISTENCY-GUIDE §10 and BYPASS-VERIFICATION-SETUP.md. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-bypassverify.js <file.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const mod = fs.readFileSync(path.join(__dirname, 'bypass-verify-module.js'), 'utf8').trim();
let h = fs.readFileSync(fp, 'utf8');
const report = [];
const S = '/* OTT-BYPASSVERIFY:START', E = 'OTT-BYPASSVERIFY:END */';
if (h.includes(S)) {
  const a = h.indexOf(S), b = h.indexOf(E) + E.length;
  h = h.slice(0, a) + mod + h.slice(b);
  report.push('module: replaced');
} else if (path.basename(file) === 'portal.html') {
  const anchor = '// Run on load\n';
  const i = h.indexOf(anchor);
  if (i < 0) { console.error('portal anchor "// Run on load" not found'); process.exit(2); }
  h = h.slice(0, i) + mod + '\n\n' + h.slice(i);
  report.push('module: inserted before "// Run on load"');
} else {
  const eb = 'OTT-EMAILBANNER:END */';
  const i = h.indexOf(eb);
  if (i < 0) { console.error('run inject-emailbanner.js first'); process.exit(2); }
  const at = i + eb.length;
  h = h.slice(0, at) + '\n\n' + mod + h.slice(at);
  report.push('module: inserted after the email-banner module');
}
fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
