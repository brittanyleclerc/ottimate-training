/* inject-certificate.js <dashboard.html | portal.html>
   Dashboards — idempotently replaces the dashboard's own certificate with the shared one (CONSISTENCY-GUIDE §11):
     1. removes the legacy <div id="screen-certificate"> markup (the module builds the screen itself)
     2. removes the legacy certificate CSS block (from "#screen-certificate {" through the ".cert-actions {" rule)
     3. removes the legacy showCertificate() / backToDashboardFromCert() functions
     4. inserts/replaces cert-id-module.js (OTT-CERTID markers) + certificate-module.js (OTT-CERTIFICATE markers)
        right after the OTT-PROFILE block (requires inject-profile.js first)
   portal.html — inserts/replaces cert-id-module.js only (before "// Run on load").
   Re-runnable. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-certificate.js <file.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const idMod = fs.readFileSync(path.join(__dirname, 'cert-id-module.js'), 'utf8').trim();
const certMod = fs.readFileSync(path.join(__dirname, 'certificate-module.js'), 'utf8').trim();
let h = fs.readFileSync(fp, 'utf8');
const report = [];
const isPortal = path.basename(file) === 'portal.html';

function replaceBlock(S, E, mod, insertAt, label) {
  if (h.includes(S)) { const a = h.indexOf(S), b = h.indexOf(E) + E.length; h = h.slice(0, a) + mod + h.slice(b); report.push(label + ': replaced'); }
  else { const i = insertAt(); if (i < 0) { console.error(label + ': insertion anchor not found'); process.exit(2); } h = h.slice(0, i) + '\n\n' + mod + '\n' + h.slice(i); report.push(label + ': inserted'); }
}
function removeBalancedDiv(startMark, label) {
  let a = h.indexOf(startMark);
  if (a < 0) { report.push(label + ': already removed'); return; }
  const re = /<div\b[^>]*>|<\/div>/g; re.lastIndex = a; let depth = 0, m, b = -1;
  while ((m = re.exec(h))) { if (m[0].startsWith('</')) depth--; else depth++; if (depth === 0) { b = re.lastIndex; break; } }
  if (b < 0) { console.error(label + ': unbalanced'); process.exit(3); }
  const ls = h.lastIndexOf('\n', a) + 1; if (h.slice(ls, a).trim() === '') a = ls;
  while (h[b] === '\n') b++;
  // a preceding "<!-- CERTIFICATE SCREEN -->" comment line goes too
  const cm = '<!-- CERTIFICATE SCREEN -->\n'; if (h.slice(a - cm.length, a) === cm) a -= cm.length;
  h = h.slice(0, a) + h.slice(b);
  report.push(label + ': removed');
}
function removeFunction(name) {
  const re = new RegExp('^function ' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const m = re.exec(h); if (!m) { report.push(name + '(): already removed'); return; }
  let i = m.index + m[0].length, depth = 1;
  while (i < h.length && depth > 0) { const c = h[i]; if (c === '{') depth++; else if (c === '}') depth--; i++; }
  while (h[i] === '\n') i++;
  h = h.slice(0, m.index) + h.slice(i);
  report.push(name + '(): removed');
}

if (isPortal) {
  replaceBlock('/* OTT-CERTID:START', 'OTT-CERTID:END */', idMod, () => h.indexOf('// Run on load\n'), 'cert-id module');
} else {
  if (!h.includes('/* OTT-PROFILE:START')) { console.error('run inject-profile.js first'); process.exit(2); }
  // 1. legacy markup
  removeBalancedDiv('<div id="screen-certificate"', 'legacy certificate markup');
  // 2. legacy CSS block
  {
    const a = h.search(/^#screen-certificate \{/m);
    if (a >= 0) {
      const b0 = h.indexOf('\n.cert-actions {', a);
      if (b0 < 0) { console.error('legacy cert CSS end (.cert-actions) not found'); process.exit(3); }
      let b = h.indexOf('}', b0) + 1;   // .cert-actions rule is a single line in every dashboard
      while (h[b] === '\n') b++;
      let start = a; const ls = h.lastIndexOf('\n', a) + 1; if (h.slice(ls, a).trim() === '') start = ls;
      const cmt = h.lastIndexOf('/* ── CERTIFICATE', start); if (cmt >= 0 && start - cmt < 80) start = cmt;
      h = h.slice(0, start) + h.slice(b);
      report.push('legacy certificate CSS: removed');
    } else report.push('legacy certificate CSS: already removed');
  }
  // 3. legacy functions
  removeFunction('showCertificate');
  removeFunction('backToDashboardFromCert');
  // 4. modules right after the profile block (cert-id first, then the certificate screen)
  const afterMark = (mark) => { const i = h.indexOf(mark); return i < 0 ? -1 : i + mark.length; };
  replaceBlock('/* OTT-CERTID:START', 'OTT-CERTID:END */', idMod, () => afterMark('OTT-PROFILE:END */'), 'cert-id module');
  replaceBlock('/* OTT-CERTIFICATE:START', 'OTT-CERTIFICATE:END */', certMod, () => afterMark('OTT-CERTID:END */'), 'certificate module');
}
fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
