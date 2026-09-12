/* inject-emailbanner.js <dashboard.html>
   Idempotently wires the shared "add your work email" banner into a dashboard (CONSISTENCY-GUIDE §9):
     1. removes any legacy banner markup placed directly in <body> (it sat UNDER the fixed #app-shell and
        was never visible once a session restored)
     2. inserts/replaces the banner markup INSIDE #app-shell, between .app-header and .app-body
        (between OTT-EMAILBANNER-MARKUP markers)
     3. removes the legacy hand-written getProfileEmail / openProfileEmailPrompt / updateProfileEmailBanner
        functions (+ their DOMContentLoaded hook) and inserts/replaces the shared module (between
        OTT-EMAILBANNER markers) at the same spot — or, on a first run with no legacy code, right after the
        OTT-PROFILE module
   Requires inject-profile.js to have run (the banner opens the shared profile editor). Re-runnable. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-emailbanner.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const mod = fs.readFileSync(path.join(__dirname, 'email-banner-module.js'), 'utf8').trim();
let h = fs.readFileSync(fp, 'utf8');
const report = [];
if (!h.includes('/* OTT-PROFILE:START')) { console.error('run inject-profile.js first'); process.exit(2); }

const MS = '<!-- OTT-EMAILBANNER-MARKUP:START -->', ME = '<!-- OTT-EMAILBANNER-MARKUP:END -->';
const MARKUP = MS + '\n'
  + '  <div id="profile-email-banner" hidden>\n'
  + '    <span>📧 Please add your work email to your profile so we can notify you about future training updates and release reminders.</span>\n'
  + '    <button type="button" onclick="openProfileEmailPrompt()">Add email</button>\n'
  + '  </div>\n'
  + '  ' + ME + '\n';

// ---- 1. legacy body-level markup ----
{
  const tag = '<div id="profile-email-banner" style=';
  let a = h.indexOf(tag);
  if (a >= 0) {
    const b = h.indexOf('</div>', a) + '</div>'.length;
    let end = b; while (h[end] === '\n') end++;
    const ls = h.lastIndexOf('\n', a) + 1; if (h.slice(ls, a).trim() === '') a = ls;
    h = h.slice(0, a) + h.slice(end);
    report.push('legacy body-level banner markup: removed');
  } else report.push('legacy body-level banner markup: none');
}

// ---- 2. markup inside #app-shell, right before .app-body ----
{
  if (h.includes(MS)) {
    const a = h.indexOf(MS), b = h.indexOf(ME, a) + ME.length;
    let end = b; while (h[end] === '\n') end++;
    const ls = h.lastIndexOf('\n', a) + 1;
    h = h.slice(0, ls) + '  ' + MARKUP + h.slice(end);
    report.push('shell banner markup: replaced');
  } else {
    const shell = h.indexOf('id="app-shell"');
    if (shell < 0) { console.error('#app-shell not found'); process.exit(3); }
    const body = h.indexOf('<div class="app-body">', shell);
    if (body < 0) { console.error('.app-body not found inside #app-shell'); process.exit(3); }
    const ls = h.lastIndexOf('\n', body) + 1;
    h = h.slice(0, ls) + '  ' + MARKUP + h.slice(ls);
    report.push('shell banner markup: inserted before .app-body');
  }
}

// ---- 3. module ----
const S = '/* OTT-EMAILBANNER:START', E = 'OTT-EMAILBANNER:END */';
if (h.includes(S)) {
  const a = h.indexOf(S), b = h.indexOf(E) + E.length;
  h = h.slice(0, a) + mod + h.slice(b);
  report.push('module: replaced');
} else {
  // legacy hand-written block: function getProfileEmail() … function updateProfileEmailBanner() {…} [+ DOMContentLoaded hook]
  const gs = h.search(/^function getProfileEmail\(\)\s*\{/m);
  if (gs >= 0) {
    const us = h.indexOf('function updateProfileEmailBanner', gs);
    if (us < 0) { console.error('legacy updateProfileEmailBanner not found after getProfileEmail'); process.exit(4); }
    let ue = h.indexOf('\n}\n', us) + 3;
    const hook = "window.addEventListener('DOMContentLoaded', updateProfileEmailBanner);\n";
    if (h.startsWith(hook, ue)) ue += hook.length;
    while (h[ue] === '\n') ue++;
    h = h.slice(0, gs) + mod + '\n\n' + h.slice(ue);
    report.push('module: replaced legacy hand-written banner functions');
  } else {
    const pe = h.indexOf('OTT-PROFILE:END */') + 'OTT-PROFILE:END */'.length;
    h = h.slice(0, pe) + '\n\n' + mod + h.slice(pe);
    report.push('module: inserted after the profile module');
  }
}
// any remaining legacy fallbacks that called the old prompt with "return false" are harmless, but normalize them
h = h.split('onclick="openProfileEmailPrompt(); return false;"').join('onclick="openProfileEmailPrompt()"');

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
