/* OTT-PROFILE:START — shared "Your Profile" card + inline role/verticals editor.
   Identical in every dashboard. Injected by inject-profile.js.
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
  + '.pc-nudge{margin-top:0.7rem;padding:0.55rem 0.7rem;border-radius:8px;background:var(--orange-light);border:1px solid var(--orange);color:#7D4C00;font-size:0.78rem;line-height:1.45;display:flex;flex-direction:column;gap:0.45rem;cursor:default;}.pc-nudge .btn{align-self:flex-start;}'
  + '.pc-toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:0.65rem 1.5rem;border-radius:8px;font-weight:700;font-size:0.9rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);max-width:90vw;text-align:center;}';

/* What happens when verticals change, per dashboard (keyed by filename). Return a toast string or ''.
   Only the Fundamentals track has vertical-specific graded content, so only it resets anything. */
var OTT_PROFILE_BEHAVIOR = {
  // Certs are snapshots: a vertical change never resets anything. Fundamentals' Module 3 is the only
  // vertical-graded content, so it gets a "review / optional retake" nudge (m3Stale) instead.
  'fundamentals-training': {
    apply: function(){
      if (typeof APP === 'undefined') return '';
      if (APP.modulesDone && APP.modulesDone.has(3)){ APP.m3Stale = true; return '✅ Profile updated — Module 3 now reflects your new verticals. Review it when you can; your completion and certification are unchanged.'; }
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
function ottProfileCardHTML(){
  var verts = (typeof APP !== 'undefined' && Array.isArray(APP.verticals)) ? APP.verticals : [];
  var chips = verts.length ? verts.map(function(v){ return '<span class="pc-chip">' + ottProfileVertLabel(v) + '</span>'; }).join('')
                           : '<span class="text-muted" style="font-size:0.8rem;">No verticals selected yet.</span>';
  return '<div class="card mb-2" id="profile-card">'
    +  '<div class="flex items-center justify-between" style="flex-wrap:wrap;gap:0.6rem;">'
    +    '<div><div class="pc-title">👤 Your Profile</div>'
    +      '<div class="pc-role">Role: <strong>' + ottProfileRoleLabel() + '</strong></div>'
    +      '<div style="margin-top:0.3rem;">' + chips + '</div></div>'
    +    '<button class="btn btn-secondary btn-sm" onclick="openProfileEditor()" style="white-space:nowrap;">✎ Edit role &amp; verticals</button>'
    +  '</div></div>';
}
/* Insert the card right after the dashboard hero (idempotent). */
function ottInjectProfileCard(){
  ottProfileEnsureCss();
  var main = document.getElementById('main-area'); if (!main) return;
  if (main.querySelector('#profile-card')) return;
  var hero = main.querySelector('.page-hero'); if (!hero) return;
  hero.insertAdjacentHTML('afterend', ottProfileCardHTML());
}
/* ── editor ── */
var PF_ROLE = '', PF_VERTS = [];
function openProfileEditor(){
  var card = document.getElementById('profile-card'); if (!card) return;
  var opt = ottProfileOptions();
  PF_ROLE = APP.role || ''; PF_VERTS = (APP.verticals || []).slice();
  var roleCards = opt.roles.map(function(o){
    return '<div class="' + o.cls + (APP.role === o.value ? ' selected' : '') + '" onclick="pfSetRole(this,\'' + o.value.replace(/'/g, '&#39;') + '\')">' + o.html + '</div>';
  }).join('');
  var vertCards = opt.verts.map(function(o){
    return '<div class="' + o.cls + (PF_VERTS.indexOf(o.value) >= 0 ? ' selected' : '') + '" onclick="pfToggleVert(this,\'' + o.value + '\')">' + o.html + '</div>';
  }).join('');
  card.innerHTML = '<div class="pc-title" style="margin-bottom:0.85rem;">✎ Edit Your Profile</div>'
    + (roleCards ? '<label class="form-label">Your Role</label><div class="pc-grid">' + roleCards + '</div>' : '')
    + '<label class="form-label">Your Primary Verticals <span style="font-weight:400;text-transform:none;">(select all that apply)</span></label>'
    + '<div class="pc-note" id="pc-note">⚠️ Please select your role and at least one vertical.</div>'
    + '<div class="pc-grid">' + vertCards + '</div>'
    + '<div class="pc-actions"><button class="btn btn-primary btn-sm" onclick="saveProfileEdits()">Save changes</button>'
    + '<button class="btn btn-secondary btn-sm" onclick="showDashboard()">Cancel</button></div>'
    + '<p class="pc-hint">Shared across all your training dashboards. Your role and verticals appear on your certificate and completion record.</p>';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
  if (!PF_ROLE || PF_VERTS.length === 0){ if (note) note.classList.add('on'); return; }
  var prev = (APP.verticals || []).slice().sort().join(','), next = PF_VERTS.slice().sort().join(',');
  var vertsChanged = prev !== next, roleChanged = PF_ROLE !== APP.role;
  var beh = OTT_PROFILE_BEHAVIOR[ottProfileDash()] || {};
  APP.role = PF_ROLE; APP.verticals = PF_VERTS.slice();
  var msg = vertsChanged ? (beh.apply ? beh.apply() : '✅ Profile updated.') : (roleChanged ? '✅ Role updated.' : '');
  if (typeof ottWriteProfile === 'function') ottWriteProfile({ name: APP.name, role: APP.role, verticals: APP.verticals });   // shared: every dashboard follows on its next load
  saveState();
  showDashboard();
  ottProfileToast(msg + (vertsChanged || roleChanged ? ' Applies to all your training dashboards.' : ''));
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
  APP.m3Stale = false;
  saveState(); showDashboard();
  ottProfileToast('Module 3 and the Final Exam are ready to retake with your new verticals.');
}
function ottInjectModule3Nudge(){
  if (ottProfileDash() !== 'fundamentals-training' || typeof APP === 'undefined' || !APP.m3Stale) return;
  var card = null; document.querySelectorAll('#main-area .module-card').forEach(function(c){ if ((c.getAttribute('onclick') || '').indexOf('showModule(3)') >= 0) card = c; });
  if (!card || card.querySelector('.pc-nudge')) return;
  card.insertAdjacentHTML('beforeend', '<div class="pc-nudge" onclick="event.stopPropagation();"><div>🔄 <strong>Your verticals changed</strong> after you completed this module — the content now reflects your new selection. Your completion and certification are unchanged.</div><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();ottRetakeModule3();">Retake for my new verticals</button></div>');
}
if (typeof renderDashboard === 'function' && !window.__pcDashWrap){
  window.__pcDashWrap = true; var _pcRd = renderDashboard;
  window.renderDashboard = function(){ _pcRd.apply(this, arguments); ottInjectProfileCard(); ottInjectModule3Nudge(); };
}
/* OTT-PROFILE:END */
