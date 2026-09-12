/* OTT-PROFILE:START — shared "Your Profile" card + inline name/email/role/verticals editor.
   Identical in every dashboard. Injected by inject-profile.js.
   - Name + email are text inputs (.pc-input); email is REQUIRED (2026-09-11) — it feeds release
     reminders — and the "add your work email" banner (email-banner-module.js) opens this editor.
   - Options (roles, verticals) are SCRAPED from the dashboard's own welcome screen
     (toggleRole / toggleVertical cards), so each dashboard keeps its own role values
     (they flow into cert webhooks/emails) and its native card styling.
   - The card is inserted after .page-hero by wrapping renderDashboard(); saving calls
     the dashboard's own saveState() + showDashboard().
   - Per-dashboard consequences of changing verticals live in OTT_PROFILE_BEHAVIOR. */
var OTT_PROFILE_CSS = ''
  + '#profile-card .pc-chip{display:inline-block;font-size:0.74rem;font-weight:600;color:var(--accent);background:var(--accent-light);border:1px solid var(--accent);border-radius:100px;padding:0.12rem 0.6rem;margin:0 0.3rem 0.3rem 0;}'
  + '#profile-card .pc-title{font-weight:700;color:var(--navy);font-size:0.9rem;}'
  + '#profile-card .pc-role{margin-top:0.35rem;font-size:0.85rem;color:var(--gray5);}'
  + '#profile-card .pc-hint{font-size:0.78rem;color:var(--gray4);margin-top:0.6rem;line-height:1.45;}'
  + '#profile-card .pc-note{font-size:0.8rem;font-weight:600;color:var(--red);margin:0.2rem 0 0.6rem;display:none;}'
  + '#profile-card .pc-note.on{display:block;}'
  + '#profile-card .pc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:0.5rem;margin:0.4rem 0 1rem;}'
  + '#profile-card .pc-grid > *{margin:0;}'
  + '#profile-card .pc-actions{display:flex;gap:0.5rem;flex-wrap:wrap;}'
  + '#profile-card .pc-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem 1rem;margin:0 0 1rem;}'
  + '#profile-card .pc-fields .form-label{margin-bottom:0.35rem;}'
  + '#profile-card .pc-input{display:block;width:100%;padding:0.6rem 0.8rem;border:2px solid var(--gray2);border-radius:8px;font-size:0.9rem;font-family:inherit;color:var(--gray5);background:var(--white);transition:border-color 0.18s;}'
  + '#profile-card .pc-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light);}'
  + '#profile-card .pc-email{font-size:0.82rem;color:var(--gray4);margin-top:0.15rem;}'
  + '#lens-card .pc-chip{display:inline-block;font-size:0.74rem;font-weight:600;color:var(--accent);background:var(--accent-light);border:1px solid var(--accent);border-radius:100px;padding:0.12rem 0.6rem;margin-bottom:0.35rem;}'
  + '#lens-card .pc-lens-grid{display:grid;grid-template-columns:1fr;gap:0.9rem 1.5rem;}'
  + '#lens-card .pc-lens-grid.pc-lens-2col{grid-template-columns:1fr 1fr;}'
  + '@media (max-width:860px){#lens-card .pc-lens-grid.pc-lens-2col{grid-template-columns:1fr;}}'
  + '#lens-card .pc-lens-block{min-width:0;}'
  + '#lens-card .pc-lens-list{margin:0 0 0 1.05rem;padding:0;font-size:0.82rem;line-height:1.5;color:var(--gray5);}#lens-card .pc-lens-list li{margin-bottom:0.25rem;}'
  + '#lens-card .pc-lens-tag{font-size:0.86rem;font-weight:700;color:var(--navy);margin-bottom:0.2rem;}'
  + '#lens-card .pc-lens-icp{font-size:0.82rem;color:var(--gray5);line-height:1.5;}'
  + '#lens-card .pc-lens-more{display:inline-block;margin-top:0.8rem;font-size:0.8rem;font-weight:600;color:var(--accent);text-decoration:none;}#lens-card .pc-lens-more:hover{text-decoration:underline;}'
  + '.pc-nudge{margin-top:0.7rem;padding:0.55rem 0.7rem;border-radius:8px;background:var(--orange-light);border:1px solid var(--orange);color:#7D4C00;font-size:0.78rem;line-height:1.45;display:flex;flex-direction:column;gap:0.45rem;cursor:default;}.pc-nudge .btn{align-self:flex-start;}'
  + '.pc-toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:0.65rem 1.5rem;border-radius:8px;font-weight:700;font-size:0.9rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);max-width:90vw;text-align:center;}';

/* What happens when verticals change, per dashboard (keyed by filename). Return a toast string or ''.
   Only the Fundamentals track has vertical-specific graded content, so only it resets anything. */
var OTT_PROFILE_BEHAVIOR = {
  // Certs are snapshots: a vertical change never resets anything. Fundamentals' Module 3 is the only
  // vertical-graded content, so it gets a "review / optional retake" nudge instead. Staleness is DERIVED on
  // every render by comparing the current verticals with the snapshots taken at completion (APP.m3Verticals)
  // and at certification (APP.certVerticals) — so it appears no matter which dashboard changed the profile,
  // and disappears again if the rep reverts to the selection they completed with.
  'fundamentals-training': {
    apply: function(){
      if (typeof APP === 'undefined') return '';
      if (ottVerticalsStale()) return '✅ Profile updated — Module 3 now reflects your new verticals. Review it when you can; your completion and certification are unchanged.';
      return '✅ Profile updated — Module 3 content now reflects your new verticals.';
    }
  },
  'demo-training': { apply: function(){ return '✅ Profile updated — Reference Materials will reflect your new verticals.'; } },
  'demo102':       { apply: function(){ return '✅ Profile updated.'; } },
  'pomatch':       { apply: function(){ return '✅ Profile updated — your Demo Lens has been refreshed.'; } }
};

function ottProfileDash(){ return (location.pathname.match(/([^/]+)\.html/) || [])[1] || ''; }
function ottProfileEnsureCss(){
  if (document.getElementById('ott-pc-css')) return;
  var st = document.createElement('style'); st.id = 'ott-pc-css'; st.textContent = OTT_PROFILE_CSS; document.head.appendChild(st);
}
/* Scrape this dashboard's own option cards from the welcome screen. */
function ottProfileOptions(){
  var roles = [], verts = [];
  document.querySelectorAll('[onclick^="toggleRole("]').forEach(function(el){
    var m = el.getAttribute('onclick').match(/toggleRole\(this,\s*'([^']*)'\)/); if (!m) return;
    roles.push({ value: m[1], label: el.textContent.trim(), html: el.innerHTML, cls: el.className.replace(/\bselected\b/g,'').trim() });
  });
  document.querySelectorAll('[onclick^="toggleVertical("]').forEach(function(el){
    var m = el.getAttribute('onclick').match(/toggleVertical\(this,\s*'([^']*)'\)/); if (!m) return;
    verts.push({ value: m[1], label: el.textContent.trim(), html: el.innerHTML, cls: el.className.replace(/\bselected\b/g,'').trim() });
  });
  return { roles: roles, verts: verts };
}
function ottProfileRoleLabel(){
  var r = (typeof APP !== 'undefined' && APP.role) || '';
  if (typeof ROLE_LABELS !== 'undefined' && ROLE_LABELS[r]) return ROLE_LABELS[r];
  var hit = ottProfileOptions().roles.filter(function(o){ return o.value === r; })[0];
  return hit ? hit.label : (r || '—');
}
function ottProfileVertLabel(v){
  if (typeof VERTICAL_LABELS !== 'undefined' && VERTICAL_LABELS[v]) return VERTICAL_LABELS[v];
  var hit = ottProfileOptions().verts.filter(function(o){ return o.value === v; })[0];
  return hit ? hit.label : v;
}
function ottProfileEsc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function ottProfileCardHTML(){
  var verts = (typeof APP !== 'undefined' && Array.isArray(APP.verticals)) ? APP.verticals : [];
  var chips = verts.length ? verts.map(function(v){ return '<span class="pc-chip">' + ottProfileVertLabel(v) + '</span>'; }).join('')
                           : '<span class="text-muted" style="font-size:0.8rem;">No verticals selected yet.</span>';
  return '<div class="card mb-2" id="profile-card">'
    +  '<div class="flex items-center justify-between" style="flex-wrap:wrap;gap:0.6rem;">'
    +    '<div><div class="pc-title">👤 Your Profile</div>'
    +      '<div class="pc-role">Role: <strong>' + ottProfileRoleLabel() + '</strong></div>'
    +      '<div class="pc-email">' + ((typeof APP !== 'undefined' && APP.email) ? '📧 ' + ottProfileEsc(APP.email) : '<span style="color:var(--red);font-weight:600;">📧 No work email on file — add one to get training updates.</span>') + '</div>'
    +      '<div style="margin-top:0.3rem;">' + chips + '</div></div>'
    +    '<button class="btn btn-secondary btn-sm" onclick="openProfileEditor()" style="white-space:nowrap;">✎ Edit Profile &amp; Verticals</button>'
    +  '</div></div>';
}
/* Insert the card right after the dashboard hero (idempotent). */
function ottInjectProfileCard(){
  ottProfileEnsureCss();
  var main = document.getElementById('main-area'); if (!main) return;
  if (main.querySelector('#profile-card')) return;
  var hero = main.querySelector('.page-hero'); if (!hero) return;
  hero.insertAdjacentHTML('afterend', ottProfileCardHTML());
  ottInjectLensCard();
}
/* ── "🎯 Your Demo Lens" — per-vertical call-outs for THIS dashboard, right under the profile card.
   Data: VERTICAL_LENSES[dashboard] (injected by inject-verticals.js). Fundamentals has no lens, so it
   shows each vertical's tagline + ICP from VERTICAL_PROFILES instead. >2 verticals → two columns. */
function ottLensCardHTML(){
  if (typeof APP === 'undefined' || !Array.isArray(APP.verticals) || !APP.verticals.length) return '';
  var lenses = (typeof VERTICAL_LENSES !== 'undefined') ? VERTICAL_LENSES[ottProfileDash()] : null;
  var profiles = (typeof VERTICAL_PROFILES !== 'undefined') ? VERTICAL_PROFILES : null;
  if (!lenses && !profiles) return '';
  var esc = function(s){ return String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;'); };
  var verts = APP.verticals.filter(function(v){ return (lenses && lenses[v]) || (profiles && profiles[v]); });
  if (!verts.length) return '';
  var blocks = verts.map(function(v){
    var label = ottProfileVertLabel(v);
    var emoji = (profiles && profiles[v] && profiles[v].emoji) ? profiles[v].emoji + ' ' : '';
    var body;
    if (lenses && lenses[v]) {
      body = '<ul class="pc-lens-list">' + lenses[v].points.map(function(p){ return '<li><strong>' + esc(p[0]) + ':</strong> ' + esc(p[1]) + '</li>'; }).join('') + '</ul>';
    } else {
      var p = profiles[v];
      body = '<div class="pc-lens-tag">' + esc(p.tagline) + '</div><div class="pc-lens-icp"><strong>Ideal customer:</strong> ' + esc(p.icp) + '</div>';
    }
    return '<div class="pc-lens-block"><span class="pc-chip">' + emoji + esc(label) + '</span>' + body + '</div>';
  }).join('');
  var title = lenses ? ('🎯 Your Demo Lens — ' + esc(lenses._title || 'Tailored to Your Verticals')) : '🎯 Your Verticals — At a Glance';
  var sub = lenses ? 'How to angle this demo for the verticals you selected. Edit your verticals above and this refreshes.'
                   : 'The positioning for each vertical you selected. Edit your verticals above and this refreshes.';
  var more = (typeof ottOpenRefTab === 'function') ? '<a class="pc-lens-more" href="#" onclick="ottOpenRefTab(\'ref-verticals\');return false;">Full vertical profiles in Reference Materials →</a>' : '';
  return '<div class="card mb-2" id="lens-card" style="border-left:4px solid var(--accent);">'
    + '<div class="card-title">' + title + '</div>'
    + '<p class="text-muted" style="font-size:0.82rem;margin-bottom:0.75rem;">' + sub + '</p>'
    + '<div class="pc-lens-grid' + (verts.length > 2 ? ' pc-lens-2col' : '') + '">' + blocks + '</div>'
    + more + '</div>';
}
function ottInjectLensCard(){
  var main = document.getElementById('main-area'); if (!main) return;
  var old = main.querySelector('#lens-card'); if (old) old.remove();
  var html = ottLensCardHTML(); if (!html) return;
  var after = main.querySelector('#profile-card') || main.querySelector('.page-hero'); if (!after) return;
  after.insertAdjacentHTML('afterend', html);
}
/* ── editor ── */
var PF_ROLE = '', PF_VERTS = [];
/* opts.focusEmail — opened from the email banner: land on the email field. Works from any view: if the
   profile card is not on screen (module / reference / exam view) the Dashboard is rendered first. */
function openProfileEditor(opts){
  opts = opts || {};
  var card = document.getElementById('profile-card');
  if (!card && typeof showDashboard === 'function'){ showDashboard(); card = document.getElementById('profile-card'); }
  if (!card) return;
  var opt = ottProfileOptions();
  PF_ROLE = APP.role || ''; PF_VERTS = (APP.verticals || []).slice();
  var roleCards = opt.roles.map(function(o){
    return '<div class="' + o.cls + (APP.role === o.value ? ' selected' : '') + '" onclick="pfSetRole(this,\'' + o.value.replace(/'/g, '&#39;') + '\')">' + o.html + '</div>';
  }).join('');
  var vertCards = opt.verts.map(function(o){
    return '<div class="' + o.cls + (PF_VERTS.indexOf(o.value) >= 0 ? ' selected' : '') + '" onclick="pfToggleVert(this,\'' + o.value + '\')">' + o.html + '</div>';
  }).join('');
  card.innerHTML = '<div class="pc-title" style="margin-bottom:0.85rem;">✎ Edit Your Profile</div>'
    + '<form class="pc-fields" autocomplete="on" onsubmit="saveProfileEdits();return false;">'
    +   '<div><label class="form-label" for="pf-name">Your Name</label><input class="pc-input" id="pf-name" name="name" type="text" autocomplete="name" value="' + ottProfileEsc(APP.name || '') + '" placeholder="e.g. Jordan Rivera" /></div>'
    +   '<div><label class="form-label" for="pf-email">Your Work Email</label><input class="pc-input" id="pf-email" name="email" type="email" autocomplete="email" inputmode="email" value="' + ottProfileEsc(APP.email || '') + '" placeholder="name@company.com" /></div>'
    + '</form>'
    + (roleCards ? '<label class="form-label">Your Role</label><div class="pc-grid">' + roleCards + '</div>' : '')
    + '<label class="form-label">Your Primary Verticals <span style="font-weight:400;text-transform:none;">(select all that apply)</span></label>'
    + '<div class="pc-note" id="pc-note">⚠️ Please enter your name and a valid work email, select your role, and choose at least one vertical.</div>'
    + '<div class="pc-grid">' + vertCards + '</div>'
    + '<div class="pc-actions"><button class="btn btn-primary btn-sm" onclick="saveProfileEdits()">Save changes</button>'
    + '<button class="btn btn-secondary btn-sm" onclick="showDashboard()">Cancel</button></div>'
    + '<p class="pc-hint">One profile, shared across all your training dashboards. Your name, role, and verticals appear on your certificate and completion record; your work email is used for training updates and release reminders.</p>';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (opts.focusEmail){ var em = document.getElementById('pf-email'); if (em) setTimeout(function(){ em.focus(); }, 50); }
}
function pfSetRole(el, r){ el.parentNode.querySelectorAll('[onclick^="pfSetRole("]').forEach(function(c){ c.classList.remove('selected'); }); el.classList.add('selected'); PF_ROLE = r; }
function pfToggleVert(el, v){ el.classList.toggle('selected'); PF_VERTS = PF_VERTS.indexOf(v) >= 0 ? PF_VERTS.filter(function(x){ return x !== v; }) : PF_VERTS.concat([v]); }
function ottProfileToast(msg){
  if (!msg) return;
  var t = document.createElement('div'); t.className = 'pc-toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 4000);
}
function saveProfileEdits(){
  var note = document.getElementById('pc-note');
  var nextName = ((document.getElementById('pf-name') || {}).value || '').trim();
  var nextEmail = ((document.getElementById('pf-email') || {}).value || '').trim();
  if (!nextName || !nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail) || !PF_ROLE || PF_VERTS.length === 0){ if (note) note.classList.add('on'); return; }
  var prev = (APP.verticals || []).slice().sort().join(','), next = PF_VERTS.slice().sort().join(',');
  var vertsChanged = prev !== next, roleChanged = PF_ROLE !== APP.role;
  var identityChanged = nextName !== (APP.name || '') || nextEmail !== (APP.email || '');
  var beh = OTT_PROFILE_BEHAVIOR[ottProfileDash()] || {};
  APP.name = nextName; APP.email = nextEmail; APP.role = PF_ROLE; APP.verticals = PF_VERTS.slice();
  var msg = vertsChanged ? (beh.apply ? beh.apply() : '✅ Profile updated.') : (roleChanged || identityChanged ? '✅ Profile updated.' : '');
  if (typeof ottWriteProfile === 'function') ottWriteProfile({ name: APP.name, email: APP.email, role: APP.role, verticals: APP.verticals });   // shared: every dashboard follows on its next load (a rename follows into every record)
  saveState();
  var hdr = document.getElementById('header-username'); if (hdr) hdr.textContent = APP.name;
  showDashboard();
  if (typeof updateProfileEmailBanner === 'function') updateProfileEmailBanner();
  ottProfileToast(msg + (msg ? ' Applies to all your training dashboards.' : ''));
}
/* Fundamentals only: optional retake of Module 3 + Final Exam after a vertical change (user-initiated). */
function ottRetakeModule3(){
  if (typeof APP === 'undefined') return;
  if (!confirm('Retake for your new verticals? This clears your Module 3 completion and your Fundamentals Final Exam so you can take them again with the updated content. Your other dashboards are not affected.')) return;
  APP.modulesDone.delete(3); delete APP.quizScores[3];
  if (typeof IQ_SUBMITTED !== 'undefined') IQ_SUBMITTED[3] = false;
  if (typeof IQ_ANSWERS !== 'undefined') IQ_ANSWERS[3] = {};
  if (typeof QUIZ_DATA !== 'undefined') QUIZ_DATA[3] = [];
  window.__ottAllowCertReset = true;   // explicit, user-confirmed
  APP.examPassed = false; APP.examScore = null; APP.certVerticals = [];
  if (typeof examAnswers !== 'undefined') examAnswers = {};
  if (typeof examSubmitted !== 'undefined') examSubmitted = false;
  if (typeof EXAM_QUESTIONS !== 'undefined') EXAM_QUESTIONS = [];
  APP.m3Verticals = undefined;
  saveState(); showDashboard();
  ottProfileToast('Module 3 and the Final Exam are ready to retake with your new verticals.');
}
function ottSameSet(a, b){ if (!Array.isArray(a) || !Array.isArray(b)) return false; return a.slice().sort().join(',') === b.slice().sort().join(','); }
/* Fundamentals only. True when vertical-graded work was completed under a different vertical selection than the
   current one: Module 3 (vs. APP.m3Verticals) or the Final Exam (vs. APP.certVerticals). Records that completed
   Module 3 before the snapshot existed are seeded with the current selection once (assumed completed with it). */
function ottVerticalsStale(){
  if (typeof APP === 'undefined' || !Array.isArray(APP.verticals) || !APP.verticals.length) return false;
  var m3done = APP.modulesDone && APP.modulesDone.has(3);
  if (m3done && !Array.isArray(APP.m3Verticals)) { APP.m3Verticals = APP.verticals.slice(); if (typeof saveState === 'function') saveState(); }
  var m3Stale = m3done && !ottSameSet(APP.m3Verticals, APP.verticals);
  var examStale = APP.examPassed === true && Array.isArray(APP.certVerticals) && APP.certVerticals.length > 0 && !ottSameSet(APP.certVerticals, APP.verticals);
  return m3Stale || examStale;
}
function ottInjectModule3Nudge(){
  if (ottProfileDash() !== 'fundamentals-training' || typeof APP === 'undefined' || !ottVerticalsStale()) return;
  var card = null; document.querySelectorAll('#main-area .module-card').forEach(function(c){ if ((c.getAttribute('onclick') || '').indexOf('showModule(3)') >= 0) card = c; });
  if (!card || card.querySelector('.pc-nudge')) return;
  var meta = card.querySelector('.mc-meta');
  (meta || card).insertAdjacentHTML(meta ? 'afterend' : 'beforeend', '<div class="pc-nudge" onclick="event.stopPropagation();"><div>🔄 <strong>Your verticals changed</strong> since you completed this module (on any dashboard) — the content now reflects your new selection. Your completion and certification are unchanged.</div><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();ottRetakeModule3();">Retake for my new verticals</button></div>');
}
if (typeof renderDashboard === 'function' && !window.__pcDashWrap){
  window.__pcDashWrap = true; var _pcRd = renderDashboard;
  window.renderDashboard = function(){ _pcRd.apply(this, arguments); ottInjectProfileCard(); ottInjectModule3Nudge(); };
}
/* OTT-PROFILE:END */
