/* OTT-PREVIEWGATE:START — temporary role-based preview gate (CONSISTENCY-GUIDE §12).
   Identical in the portal AND every dashboard. Injected by inject-previewgate.js.
   A dashboard that is not yet released to everyone can be held back for specific ROLES while others (testers,
   reviewers) use it. ONE config line per dashboard below; roles are the shared profile's role keys (OTT_ROLES:
   AE, SE, SDR, CSM, MGR, PARTNER, OTHER). To release: set roles to [] (or delete the entry), re-run
   `node _shared/inject-previewgate.js` on portal.html + the four dashboards, check, publish.
   Where it applies: the portal card (locked, "In final review", click → popup), the dashboard itself (checked
   BEFORE the prerequisite gate, so the bypass is unreachable; and again on the welcome form once a role is picked),
   and the Learning Path links. Anyone already certified on that dashboard is never blocked. */
var OTT_PREVIEW_GATES = {
  ottimate_pomatch_state: {
    roles: ['AE', 'SDR'],
    label: 'Demo 201 — PO Match',
    title: 'Demo 201 — PO Match is in final review',
    message: 'This training is being finalized and isn’t open to Account Executives and SDR / BDRs just yet. It will be released soon — you’ll get an email as soon as it’s available. In the meantime, Fundamentals, Demo 101 and Demo 102 are all open to you.'
  }
};
function ottPreviewRoleOf(){
  try { var p = JSON.parse(localStorage.getItem('ottimate_profile') || 'null'); if (p && p.role) return (typeof ottNormalizeRole === 'function') ? ottNormalizeRole(p.role) : p.role; } catch(e){}
  var keys = ['ottimate_fundamentals_state', 'ottimate_demo_state', 'ottimate_d102_state', 'ottimate_pomatch_state'];
  for (var i = 0; i < keys.length; i++){ try { var s = JSON.parse(localStorage.getItem(keys[i]) || 'null'); if (s && s.role) return (typeof ottNormalizeRole === 'function') ? ottNormalizeRole(s.role) : s.role; } catch(e){} }
  return '';
}
/* The gate for stateKey if it blocks `role` (default: the current profile's role); null otherwise. */
function ottPreviewBlocked(stateKey, role, ignoreCert){
  var g = OTT_PREVIEW_GATES[stateKey]; if (!g || !g.roles || !g.roles.length) return null;
  // already certified → not held back, UNLESS their certification predates a required content update (§13): they
  // will have to complete the released dashboard again, so until release they are held back like everyone else in the role
  if (!ignoreCert){ try { var own = JSON.parse(localStorage.getItem(stateKey) || 'null');
    if (own && own.examPassed === true){ var cfg = (typeof ottContentConfig === 'function') ? ottContentConfig(stateKey) : null; if (!(cfg && cfg.policy === 'required' && String(own.certContentV || '') < cfg.version)) return null; } } catch(e){} }
  var r = (role === undefined) ? ottPreviewRoleOf() : role;
  return (r && g.roles.indexOf(r) >= 0) ? g : null;
}
var OTT_PREVIEW_CSS = ''
  + '.ott-preview-overlay{position:fixed;inset:0;background:rgba(10,46,74,0.62);display:flex;align-items:center;justify-content:center;padding:1.25rem;z-index:10000;}'
  + '.ott-preview-box{width:min(520px,100%);background:#fff;border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,0.25);padding:1.75rem 1.75rem 1.4rem;text-align:center;font-family:inherit;}'
  + '.ott-preview-box .pv-icon{font-size:2.4rem;margin-bottom:0.5rem;}'
  + '.ott-preview-box h2{font-size:1.2rem;font-weight:800;color:#0A2E4A;margin:0 0 0.6rem;}'
  + '.ott-preview-box p{font-size:0.92rem;line-height:1.55;color:#343A40;margin:0 0 1.2rem;}'
  + '.ott-preview-box .pv-actions{display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;}'
  + '.ott-preview-box .pv-btn{display:inline-block;background:linear-gradient(135deg,#1565A0,#00BCD4);color:#fff;border:none;border-radius:8px;padding:0.6rem 1.2rem;font-weight:700;font-size:0.9rem;font-family:inherit;cursor:pointer;text-decoration:none;}'
  + '.ott-preview-box .pv-btn.pv-secondary{background:#fff;color:#1565A0;border:2px solid #1565A0;}'
  + '.ott-preview-screen{position:fixed;inset:0;z-index:9000;background:linear-gradient(140deg,#0A2E4A 0%,#1565A0 55%,#1976D2 100%);display:flex;align-items:center;justify-content:center;padding:2rem;}';
function ottPreviewEnsureCss(){ if (document.getElementById('ott-preview-css')) return; var st = document.createElement('style'); st.id = 'ott-preview-css'; st.textContent = OTT_PREVIEW_CSS; document.head.appendChild(st); }
function ottPreviewEsc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function ottPreviewBoxHtml(g, actionsHtml){
  return '<div class="ott-preview-box"><div class="pv-icon">🔍</div><h2>' + ottPreviewEsc(g.title) + '</h2><p>' + ottPreviewEsc(g.message) + '</p><div class="pv-actions">' + actionsHtml + '</div></div>';
}
/* Portal: popup over the page (click on the card). */
function ottPreviewModal(g){
  ottPreviewEnsureCss();
  var old = document.getElementById('ott-preview-overlay'); if (old) old.remove();
  var o = document.createElement('div'); o.id = 'ott-preview-overlay'; o.className = 'ott-preview-overlay';
  o.innerHTML = ottPreviewBoxHtml(g, '<button type="button" class="pv-btn" onclick="document.getElementById(\'ott-preview-overlay\').remove()">Got it</button>');
  o.addEventListener('click', function(e){ if (e.target === o) o.remove(); });
  document.body.appendChild(o);
}
/* Dashboard: full-screen hold with a way back to the portal. Hides every other screen. */
function ottPreviewScreen(g){
  ottPreviewEnsureCss();
  document.querySelectorAll('.screen.active').forEach(function(s){ s.classList.remove('active'); });
  var shell = document.getElementById('app-shell'); if (shell) shell.classList.remove('active');
  var old = document.getElementById('ott-preview-screen'); if (old) old.remove();
  var s = document.createElement('div'); s.id = 'ott-preview-screen'; s.className = 'ott-preview-screen';
  s.innerHTML = ottPreviewBoxHtml(g, '<a class="pv-btn" href="portal.html">← Return to Training Portal</a>');
  document.body.appendChild(s);
}
/* OTT-PREVIEWGATE:END */
