/* check-consistency.js — foundation drift-check.
   Run:  node _shared/check-consistency.js
   Verifies every dashboard's BASE design tokens + base metrics match the
   canonical set in _shared/ottimate-tokens.css. Accent tokens are allowed to
   differ (they are the per-level override). Exits non-zero if anything drifts. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

/* Parse every inline <script> exactly the way a browser chunks them: a script element ends at the
   FIRST literal "</script", wherever it appears. (A regex that skips `<script src=...>` tags mis-pairs
   the opening/closing tags and can silently validate the wrong text — that blind spot hid a broken
   EXAM_QUESTIONS array in pomatch.html on 2026-09-10, which killed the whole script block at runtime:
   the dashboard fell back to its default welcome screen and no button worked.) */
function scriptErrors(html) {
  const out = []; let i = 0, n = 0;
  while (true) {
    const s = html.indexOf('<script', i); if (s < 0) break;
    const gt = html.indexOf('>', s); if (gt < 0) break;
    const tag = html.slice(s, gt + 1);
    const e = html.indexOf('</script', gt + 1); if (e < 0) break;
    n++;
    if (!/\bsrc=/.test(tag)) {
      const body = html.slice(gt + 1, e);
      try { new vm.Script(body); }
      catch (err) { out.push('inline script #' + n + ' (from line ' + html.slice(0, gt).split('\n').length + '): ' + err.message); }
    }
    i = e + 8;
  }
  return out;
}

// Canonical BASE tokens (must match ottimate-tokens.css). Accent-* are excluded.
const CANON = {
  '--navy':'#0A2E4A','--blue':'#1565A0','--teal':'#00BCD4','--teal-light':'#E0F7FA',
  '--purple':'#7B2D8B','--purple-light':'#F3E5F5','--green':'#27AE60','--green-light':'#D5F5E3',
  '--orange':'#F39C12','--orange-light':'#FEF9E7','--red':'#E74C3C','--red-light':'#FDEDEC',
  '--gray1':'#F8F9FA','--gray2':'#E9ECEF','--gray3':'#ADB5BD','--gray4':'#6C757D','--gray5':'#343A40',
  '--white':'#FFFFFF','--shadow-sm':'0 1px 4px rgba(0,0,0,0.08)','--shadow-md':'0 4px 16px rgba(0,0,0,0.12)',
  '--shadow-lg':'0 8px 32px rgba(0,0,0,0.18)','--radius':'10px'
};
const FILES = ['portal.html','fundamentals-training.html','demo-training.html','demo102.html','pomatch.html'];
// [source file in _shared, start marker, end marker] — the dashboard copy must equal the trimmed source
const SHARED_BLOCKS = [
  ['state-migration-module.js', '/* OTT-STATEMIGRATE:START', 'OTT-STATEMIGRATE:END */'],
  ['profile-module.js',         '/* OTT-PROFILE:START',      'OTT-PROFILE:END */'],
  ['email-banner-module.js',    '/* OTT-EMAILBANNER:START',  'OTT-EMAILBANNER:END */'],
  ['learning-path-module.js',   '/* OTT-LEARNINGPATH:START', 'OTT-LEARNINGPATH:END */'],
  ['bypass-verify-module.js',   '/* OTT-BYPASSVERIFY:START', 'OTT-BYPASSVERIFY:END */'],
  ['cert-id-module.js',         '/* OTT-CERTID:START',       'OTT-CERTID:END */'],
  ['preview-gate-module.js',    '/* OTT-PREVIEWGATE:START',  'OTT-PREVIEWGATE:END */'],
  ['renewal-module.js',         '/* OTT-RENEWAL:START',      'OTT-RENEWAL:END */'],
  ['certificate-module.js',     '/* OTT-CERTIFICATE:START',  'OTT-CERTIFICATE:END */'],
];

function tokens(css){
  const map = {};
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m; while ((m = re.exec(css))) if (!(m[1] in map)) map[m[1]] = m[2].trim();
  return map;
}
function norm(v){ return v.replace(/\s+/g,' ').trim().toLowerCase(); }

let anyDrift = false;
console.log('=== Ottimate dashboard consistency check ===\n');
for (const f of FILES){
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)){ console.log(`• ${f}: MISSING`); anyDrift = true; continue; }
  const h = fs.readFileSync(fp, 'utf8');
  const head = h.slice(0, 20000);           // tokens live near the top
  const t = tokens(head);
  const issues = [];

  // 1) base tokens
  for (const [k,v] of Object.entries(CANON)){
    if (!(k in t)) issues.push(`missing token ${k}`);
    else if (norm(t[k]) !== norm(v)) issues.push(`${k} = ${t[k]}  (canonical ${v})`);
  }
  // 2) accent present
  for (const k of ['--accent','--accent-light']) if (!(k in t)) issues.push(`missing ${k} (level accent)`);
  // 2b) banner gradient tokens (per-dashboard, must exist and be used by header + hero)
  for (const k of ['--banner-a','--banner-b']) if (!(k in t)) issues.push(`missing ${k} (banner token)`);
  const usesBanner = (sel) => { const i = h.indexOf('\n' + sel + ' {'); if (i < 0) return false; const block = h.slice(i, h.indexOf('}', i)); return block.includes('var(--banner-a)') && block.includes('var(--banner-b)'); };
  if (f !== 'portal.html' && !usesBanner('.app-header')) issues.push('.app-header does not use var(--banner-a/b)');
  if (f !== 'portal.html' && !usesBanner('.page-hero')) issues.push('.page-hero does not use var(--banner-a/b)');
  // 7) every inline script must parse — a broken block silently disables the whole dashboard
  scriptErrors(h).forEach(e => issues.push('SCRIPT WILL NOT RUN — ' + e));
  // 3) base font size 15px  (html or body)
  if (!/font-size:\s*15px/.test(head)) issues.push('base font-size 15px not found');
  // 4) text-size-adjust pin
  if (!/text-size-adjust:\s*100%/.test(head)) issues.push('missing html text-size-adjust:100%');
  // 5) viewport
  if (!/name="viewport"[^>]*width=device-width/.test(h.slice(0,2000))) issues.push('viewport meta missing');
  // 6) layout metric tokens (new)
  for (const k of ['--sidebar-w','--header-h','--main-max']) if (!(k in t)) issues.push(`missing layout token ${k}`);
  // 8) shared modules must be byte-identical to their _shared source (dashboards only). Hand-editing a
  //    dashboard's copy is how the four files drifted on 2026-09-11 — fix the _shared file, re-run its injector.
  for (const [src, S, E] of SHARED_BLOCKS) {
      if (f === 'portal.html' && src !== 'bypass-verify-module.js' && src !== 'cert-id-module.js' && src !== 'preview-gate-module.js' && src !== 'state-migration-module.js') continue;
      const canon = fs.readFileSync(path.join(__dirname, src), 'utf8').trim();
      const n = h.split(S).length - 1;
      if (n !== 1) { issues.push(`${src}: expected exactly 1 ${S} block, found ${n}`); continue; }
      const a = h.indexOf(S), b = h.indexOf(E, a);
      if (b < 0) { issues.push(`${src}: end marker missing`); continue; }
      if (h.slice(a, b + E.length) !== canon) issues.push(`${src}: dashboard copy differs from _shared source — re-run its injector`);
  }
  if (f !== 'portal.html') {
    // 9) the email banner must live INSIDE #app-shell (between .app-header and .app-body); anything placed in
    //    <body> before the shell sits under position:fixed #app-shell and is never visible.
    const shell = h.indexOf('id="app-shell"'), banner = h.indexOf('id="profile-email-banner"'), body = h.indexOf('<div class="app-body">', shell);
    const nb = h.split('id="profile-email-banner"').length - 1;
    if (nb !== 1) issues.push(`expected exactly 1 #profile-email-banner, found ${nb}`);
    else if (!(banner > shell && banner < body)) issues.push('#profile-email-banner is not inside #app-shell before .app-body (run inject-emailbanner.js)');
    // 10) session restore must bring the email back, or the next save blanks it
    if (!/APP.email = (s|saved).email/.test(h)) issues.push('session restore does not set APP.email (run inject-statemigrate.js)');
  }

  if (issues.length){ anyDrift = true; console.log(`• ${f}: ${issues.length} issue(s)`); issues.forEach(i=>console.log(`    - ${i}`)); }
  else console.log(`• ${f}: ✓ consistent`);
}
console.log('\n' + (anyDrift ? 'RESULT: drift found (baseline — expected before rollout).' : 'RESULT: all dashboards consistent.'));
process.exit(anyDrift ? 1 : 0);
