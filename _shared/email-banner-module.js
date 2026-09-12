/* OTT-EMAILBANNER:START — shared "add your work email" banner (CONSISTENCY-GUIDE §9).
   Identical in every dashboard. Injected by inject-emailbanner.js, which also places the banner
   markup INSIDE #app-shell (between .app-header and .app-body). It must live inside the shell:
   #app-shell is position:fixed; inset:0; z-index:300, so anything placed in <body> before it is
   covered and can never be seen once the session is restored (that is why the banner "only worked
   on the portal" on 2026-09-11).
   - getProfileEmail(): the shared profile (ottimate_profile) is the source of truth; APP.email and
     the dashboard records are read-only fallbacks so a record that carries an email still hides the
     banner (ottMigrateState adopts it into the profile on the next load).
   - The "Add email" button opens the shared profile editor (profile-module.js) on the email field,
     from any view. There is no separate prompt: one profile, one editor. */
var OTT_EMAIL_BANNER_CSS = ''
  + '#profile-email-banner{flex-shrink:0;background:linear-gradient(90deg,#fff3cd,#fefcf2);border-bottom:1px solid #f0c36d;color:#7d4c00;padding:0.65rem 1.25rem;text-align:center;font-size:0.86rem;font-weight:600;line-height:1.4;display:none;align-items:center;justify-content:center;gap:0.8rem;flex-wrap:wrap;position:relative;z-index:150;}'
  + '#profile-email-banner.on{display:flex;}'
  + '#profile-email-banner button{background:var(--navy);color:#fff;border:none;border-radius:6px;padding:0.35rem 0.8rem;font-weight:700;font-size:0.82rem;font-family:inherit;cursor:pointer;white-space:nowrap;}'
  + '#profile-email-banner button:hover{background:var(--accent);}'
  + '@media print{#profile-email-banner{display:none !important;}}';
function ottEmailBannerEnsureCss(){
  if (document.getElementById('ott-eb-css')) return;
  var st = document.createElement('style'); st.id = 'ott-eb-css'; st.textContent = OTT_EMAIL_BANNER_CSS; document.head.appendChild(st);
}
function getProfileEmail(){
  var candidates = [];
  try { var p = JSON.parse(localStorage.getItem('ottimate_profile') || 'null'); if (p && p.email) candidates.push(String(p.email).trim()); } catch(e){}
  if (typeof APP !== 'undefined' && APP && APP.email) candidates.push(String(APP.email).trim());
  ['ottimate_demo_state','ottimate_fundamentals_state','ottimate_d102_state','ottimate_pomatch_state'].forEach(function(k){
    try { var s = JSON.parse(localStorage.getItem(k) || 'null'); if (s && s.email) candidates.push(String(s.email).trim()); } catch(e){}
  });
  return candidates.filter(Boolean)[0] || '';
}
function updateProfileEmailBanner(){
  var banner = document.getElementById('profile-email-banner'); if (!banner) return;
  ottEmailBannerEnsureCss();
  banner.classList.toggle('on', !getProfileEmail());
}
function openProfileEmailPrompt(){
  if (typeof openProfileEditor === 'function') openProfileEditor({ focusEmail: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateProfileEmailBanner); else updateProfileEmailBanner();
/* OTT-EMAILBANNER:END */
