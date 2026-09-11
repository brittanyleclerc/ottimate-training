/* inject-roles.js <dashboard.html>
   Unifies the role model across dashboards (one shared profile needs one role list):
     1. replaces the welcome screen's role cards with the canonical OTT_ROLES list (keys AE, SE, SDR,
        CSM, MGR, PARTNER, OTHER) — the shared profile editor scrapes these, so it follows automatically
     2. displays roles by label in the dashboard hero (ottRoleLabel)
     3. sends the label (not the key) in notification/email payloads; the SAVE payload keeps the key
     4. pomatch: ROLE_LABELS becomes the canonical map
   Legacy stored values (e.g. "Solutions Engineer", "PARTNER") are normalized on load by ottMigrateState.
   Requires inject-statemigrate.js to have run (OTT_ROLES / ottRoleLabel live in that module). Re-runnable. */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-roles.js <dashboard.html>'); process.exit(1); }
const fp = path.join(__dirname, '..', file);
const base = path.basename(file, '.html');
let h = fs.readFileSync(fp, 'utf8');
const report = [];
if (!h.includes('var OTT_ROLES')) { console.error('run inject-statemigrate.js first'); process.exit(2); }

const ROLES = [['AE','Account Executive (AE)'],['SE','Sales Engineer (SE)'],['SDR','SDR / BDR'],['CSM','Customer Success (CSM)'],['MGR','Sales Manager'],['PARTNER','Channel Partner / Reseller'],['OTHER','Other']];

// ---- 1. welcome-screen role cards (contiguous block of toggleRole cards) ----
const cardRe = /^(\s*)<div class="select-card" onclick="toggleRole\(this,'[^']*'\)">[^<]*<\/div>\n/gm;
const matches = [...h.matchAll(cardRe)];
if (!matches.length) { console.error('no role cards found'); process.exit(3); }
const first = matches[0], last = matches[matches.length - 1];
const blockStart = first.index, blockEnd = last.index + last[0].length;
const indent = first[1];
const existing = h.slice(blockStart, blockEnd);
const unified = ROLES.map(([k, l]) => indent + '<div class="select-card" onclick="toggleRole(this,\'' + k + '\')">' + l + '</div>\n').join('');
if (existing === unified) report.push('role cards: already canonical');
else { h = h.slice(0, blockStart) + unified + h.slice(blockEnd); report.push('role cards: replaced ' + matches.length + ' → ' + ROLES.length + ' canonical'); }

// ---- 2. hero display ----
if (h.includes('Role: ${APP.role}')) { h = h.split('Role: ${APP.role}').join('Role: ${ottRoleLabel(APP.role)}'); report.push('hero: role shown by label'); }

// ---- 3. notification payloads → label ----
const payloadEdits = [
  ['      user_role:      APP.role,', '      user_role:      ottRoleLabel(APP.role),'],
  ["      user_role:     (ROLE_LABELS[role] || role) || 'Not yet provided',", "      user_role:     ottRoleLabel(role) || 'Not yet provided',"],
  ['      id: Date.now() + \'_\' + Math.random().toString(36).slice(2, 8),\n      name: APP.name,\n      role: APP.role,', '      id: Date.now() + \'_\' + Math.random().toString(36).slice(2, 8),\n      name: APP.name,\n      role: ottRoleLabel(APP.role),'],
  ['      name: APP.name, role: APP.role, dashboard: dashboardName,', '      name: APP.name, role: ottRoleLabel(APP.role), dashboard: dashboardName,'],
  ['role:ROLE_LABELS[APP.role]||APP.role, dashboard:', 'role:ottRoleLabel(APP.role), dashboard:'],
];
let n = 0; for (const [a, b] of payloadEdits) { if (h.includes(a)) { h = h.split(a).join(b); n++; } }
report.push('notification payloads: ' + n + ' converted to labels');

// ---- 4. pomatch ROLE_LABELS → canonical ----
if (base === 'pomatch') {
  const old = "const ROLE_LABELS = { SE:'Sales Engineer (SE)', AE:'Account Executive (AE)', CSM:'Customer Success (CSM)', OTHER:'Other' };";
  if (h.includes(old)) { h = h.replace(old, () => 'const ROLE_LABELS = OTT_ROLES;   // canonical role list (shared profile)'); report.push('ROLE_LABELS: now canonical'); }
  else report.push('ROLE_LABELS: already canonical');
}

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
