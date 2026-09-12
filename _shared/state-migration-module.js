/* OTT-STATEMIGRATE:START — shared additive state migration (CONSISTENCY-GUIDE §3).
   Identical in every dashboard. Injected by inject-statemigrate.js.
   Rules: never rename a cert key, never clear/remove a blob, never touch examPassed.
   Fills MISSING array/object fields with safe defaults, stamps schemaV, and re-saves
   ONLY if something changed. A corrupt blob is left untouched (returns null). */
var OTT_SCHEMA_V = 2;
var OTT_STATE_DEFAULTS = {
  ottimate_fundamentals_state: { verticals:[], certVerticals:[], modulesDone:[], quizScores:{} },
  ottimate_demo_state:         { verticals:[], certVerticals:[], modulesDone:[], quizScores:{} },
  ottimate_d102_state:         { verticals:[], certVerticals:[], modulesDone:[], quizScores:{}, quizState:{} },
  ottimate_pomatch_state:      { verticals:[], certVerticals:[], modulesDone:[], quizScores:{} }
};
/* ── Shared profile (one record for name / role / verticals across every dashboard) ──
   ottimate_profile = { name, email, role, verticals, updatedAt }. Entered once on the first dashboard a rep
   opens; every dashboard reads it on load (overlaying its own record's profile fields) and the shared
   profile editor writes it. Email (added 2026-09-11) is part of the profile: the portal and every dashboard
   show the "add your work email" banner (email-banner-module.js) until the profile carries one.
   Certs are snapshots: NOTHING on the profile path touches examPassed, quiz scores, module completion,
   or certVerticals. */
var OTT_PROFILE_KEY = 'ottimate_profile';
var OTT_ROLES = { AE:'Account Executive (AE)', SE:'Sales Engineer (SE)', SDR:'SDR / BDR', CSM:'Customer Success (CSM)', MGR:'Sales Manager', PARTNER:'Channel Partner / Reseller', OTHER:'Other' };
var OTT_ROLE_LEGACY = { 'Account Executive':'AE', 'Solutions Engineer':'SE', 'SDR / BDR':'SDR', 'Sales Manager':'MGR', 'Customer Success':'CSM', 'Other':'OTHER',
                        'Sales Development Rep (SDR)':'SDR', 'Sales Engineer (SE)':'SE', 'Account Executive (AE)':'AE', 'Customer Success (CSM)':'CSM', 'Channel Partner / Reseller':'PARTNER' };
function ottNormalizeRole(r){ if (!r) return r; if (OTT_ROLES[r]) return r; return OTT_ROLE_LEGACY[r] || r; }
function ottRoleLabel(r){ return OTT_ROLES[r] || r || '—'; }
function ottReadProfile(){ try { var p = JSON.parse(localStorage.getItem(OTT_PROFILE_KEY) || 'null'); return (p && p.name) ? p : null; } catch(e){ return null; } }
function ottWriteProfile(p){
  var cur = ottReadProfile() || {};
  var next = { name: p.name || cur.name || '', email: String(p.email || cur.email || '').trim(), role: ottNormalizeRole(p.role || cur.role || ''), verticals: Array.isArray(p.verticals) ? p.verticals.slice() : (cur.verticals || []), updatedAt: Date.now() };
  // certClaims — self-reported certificate details for self-attested prerequisites (portal, §11). Preserved, never rebuilt here.
  var claims = (p.certClaims && typeof p.certClaims === 'object') ? p.certClaims : cur.certClaims; if (claims) next.certClaims = claims;
  try { localStorage.setItem(OTT_PROFILE_KEY, JSON.stringify(next)); } catch(e){}
  // A rename from the profile editor must follow the same person into every dashboard record, otherwise the
  // records stop matching the profile (the overlay in ottMigrateState only ever touches records with the
  // profile's name) and the "one profile" model silently splits. Only the name field is rewritten.
  if (cur.name && next.name && cur.name !== next.name){
    for (var k in OTT_STATE_DEFAULTS){
      var s = null; try { s = JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){}
      if (s && typeof s === 'object' && s.name === cur.name){ s.name = next.name; try { localStorage.setItem(k, JSON.stringify(s)); } catch(e){} }
    }
  }
  return next;
}
/* First load after this feature ships: build the shared profile from the existing records (prefer the current dashboard's). */
function ottBootstrapProfile(preferKey){
  var p = ottReadProfile(); if (p) return p;
  var keys = [preferKey].concat(Object.keys(OTT_STATE_DEFAULTS).filter(function(k){ return k !== preferKey; }));
  for (var i = 0; i < keys.length; i++){
    var s = null; try { s = JSON.parse(localStorage.getItem(keys[i]) || 'null'); } catch(e){}
    if (s && s.name && s.role){
      var verts = Array.isArray(s.verticals) ? s.verticals : [];
      if (!verts.length){ for (var j = 0; j < keys.length; j++){ var t = null; try { t = JSON.parse(localStorage.getItem(keys[j]) || 'null'); } catch(e){} if (t && t.name === s.name && Array.isArray(t.verticals) && t.verticals.length){ verts = t.verticals; break; } } }
      return ottWriteProfile({ name: s.name, email: s.email || '', role: s.role, verticals: verts });
    }
  }
  return null;
}
/* Shared-device handoff: "Not you? / Reset" clears EVERY dashboard's record and the shared profile —
   with one profile across dashboards, a per-dashboard reset would leave another person's progress
   attached to the new name. */
function ottResetAllProgress(){
  try { Object.keys(OTT_STATE_DEFAULTS).forEach(function(k){ localStorage.removeItem(k); }); localStorage.removeItem(OTT_PROFILE_KEY); } catch(e){}
  try { if (window.indexedDB) indexedDB.deleteDatabase('ottimate_training'); } catch(e){}   // uploaded certificates (portal)
}
function ottMigrateState(key){
  var raw = null;
  try { raw = localStorage.getItem(key); } catch(e){ return null; }
  var profile = ottBootstrapProfile(key);
  if (!raw){
    // No record for this dashboard but the rep already has a profile: create the record from it so the
    // dashboard skips its welcome form. Progress fields start empty (this dashboard was never used).
    if (!profile) return null;
    var fresh = Object.assign({}, OTT_STATE_DEFAULTS[key] || {}, { name: profile.name, email: profile.email || '', role: profile.role, verticals: profile.verticals.slice(), schemaV: OTT_SCHEMA_V });
    fresh.modulesDone = []; fresh.quizScores = {}; fresh.certVerticals = [];
    try { localStorage.setItem(key, JSON.stringify(fresh)); } catch(e){}
    return fresh;
  }
  var s; try { s = JSON.parse(raw); } catch(e){ return null; }        // corrupt: leave as-is, never clear
  if (!s || typeof s !== 'object' || Array.isArray(s)) return s;
  var defaults = OTT_STATE_DEFAULTS[key] || {};
  var changed = false;
  // Profile overlay: the shared profile wins for name/role/verticals — but only for the same person.
  // A record under a different name is someone else's progress; leave it untouched.
  if (s.role && ottNormalizeRole(s.role) !== s.role){ s.role = ottNormalizeRole(s.role); changed = true; }
  if (profile && (!s.name || s.name === profile.name)){
    if (s.name !== profile.name){ s.name = profile.name; changed = true; }
    if (profile.role && s.role !== profile.role){ s.role = profile.role; changed = true; }
    if (Array.isArray(profile.verticals) && profile.verticals.length && JSON.stringify(s.verticals || []) !== JSON.stringify(profile.verticals)){ s.verticals = profile.verticals.slice(); changed = true; }
    if (profile.email && s.email !== profile.email){ s.email = profile.email; changed = true; }
    // self-heal: a record that already carries an email (welcome form) while the profile has none — adopt it
    else if (!profile.email && s.email){ profile = ottWriteProfile({ email: s.email }); }
  }
  for (var k in defaults){
    if (!Object.prototype.hasOwnProperty.call(defaults, k)) continue;
    var d = defaults[k];
    var bad = (s[k] === undefined || s[k] === null) || (Array.isArray(d) && !Array.isArray(s[k]));
    if (bad){ s[k] = Array.isArray(d) ? d.slice() : Object.assign({}, d); changed = true; }
  }
  // Inherit verticals: a profile created before this dashboard collected verticals (or one that
  // skipped them) has verticals:[] — borrow the same person's selection from another dashboard's
  // record (read-only on theirs) so vertical-specific content is filtered from the first load.
  if (Array.isArray(s.verticals) && s.verticals.length === 0 && s.name){
    for (var sk in OTT_STATE_DEFAULTS){
      if (sk === key) continue;
      var sib = null; try { sib = JSON.parse(localStorage.getItem(sk) || 'null'); } catch(e){}
      if (sib && sib.name === s.name && Array.isArray(sib.verticals) && sib.verticals.length){ s.verticals = sib.verticals.slice(); changed = true; break; }
    }
  }
  if (s.schemaV !== OTT_SCHEMA_V){ s.schemaV = OTT_SCHEMA_V; changed = true; }
  if (changed){ try { localStorage.setItem(key, JSON.stringify(s)); } catch(e){} }
  return s;
}
/* Cert guard for saveState(): a certified record (examPassed:true) can never be downgraded
   by an ordinary save — e.g. a failed restore followed by the cross-dashboard profile
   auto-onboarding, which would otherwise write a blank record over the cert. If a save
   would drop the cert, we keep the stored record and update only the profile fields.
   The explicit user-confirmed cert reset (Fundamentals vertical change) sets
   window.__ottAllowCertReset = true for that one save. "Not you?" uses removeItem — unaffected. */
function ottSafeSetState(key, obj){
  try {
    var stored = null; try { stored = JSON.parse(localStorage.getItem(key) || 'null'); } catch(e){}
    // carry a persisted prerequisite bypass (and a not-yet-sent bypass notification) forward — dashboards don't put them in their payloads
    if (stored && obj) ['bypassed','bypassedAt','bypassNotifyPending','bypassId','bypassVerified','bypassVerifiedAt','bypassRejected','bypassRejectedAt','bypassRejectedAck'].forEach(function(f){
      if (stored[f] !== undefined && obj[f] === undefined) obj[f] = stored[f];
    });
    if (stored && stored.examPassed === true && obj && obj.examPassed !== true && !window.__ottAllowCertReset){
      var keep = Object.assign({}, stored);
      ['name','role','verticals'].forEach(function(f){ if (obj[f] !== undefined) keep[f] = obj[f]; });
      keep.schemaV = OTT_SCHEMA_V;
      obj = keep;
      if (window.console) console.warn('[ottimate] cert guard: kept certified record for ' + key);
    }
    if (obj && obj.role && ottNormalizeRole(obj.role) !== obj.role) obj.role = ottNormalizeRole(obj.role);
    localStorage.setItem(key, JSON.stringify(obj));
    // first-ever onboarding on this browser: the welcome form's save creates the shared profile
    var prof = ottReadProfile();
    if (obj && obj.name && obj.role && !prof) ottWriteProfile(obj);
    // profile exists but has no email yet and this save (welcome form / editor) carries one for the same person
    else if (obj && obj.email && prof && !prof.email && prof.name === obj.name) ottWriteProfile({ email: obj.email });
  } catch(e){}
  window.__ottAllowCertReset = false;
}
/* Prerequisite gate — ONE rule for every gated dashboard (Demo 102, PO Match):
   the gate is checked on EVERY load, before restoring the session, and lets the user in only if
   (a) every prerequisite dashboard's record has examPassed:true, or
   (b) THIS dashboard's own record carries bypassed:true — set once when the user confirms
       "completed on another device" (ottRecordBypass), so the bypass email fires once and a
       stray profile can never skip the check. "Not you? / Reset" removes the record → gate returns. */
function ottReadState(key){ try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch(e){ return null; } }
function ottGateAllows(ownKey, prereqKeys){
  var met = prereqKeys.every(function(k){ var s = ottReadState(k); return !!(s && s.examPassed === true); });
  if (met) return true;
  var own = ottReadState(ownKey);
  return !!(own && own.bypassed === true);
}
/* notified=false → no profile existed when the user confirmed the bypass (brand-new user on this browser): the
   Enablement notification is deferred until the welcome form is saved, so it carries a real name/role instead of
   "Not yet provided". The pending flag lives in the record (survives a reload) and is cleared by ottBypassNotified. */
function ottRecordBypass(ownKey, notified){
  var own = ottReadState(ownKey); if (!own || typeof own !== 'object') own = {};
  own.bypassed = true; own.schemaV = OTT_SCHEMA_V;
  if (!own.bypassedAt) own.bypassedAt = Date.now();
  if (notified === false) own.bypassNotifyPending = true;
  try { localStorage.setItem(ownKey, JSON.stringify(own)); } catch(e){}
}
/* Welcome-form "Cancel" after a bypass that has not been completed (no profile yet on this browser): withdraw the
   bypass so the gate returns next time. A record that held nothing but bypass fields is removed outright. */
function ottCancelPendingBypass(ownKey){
  var own = ottReadState(ownKey); if (!own || typeof own !== 'object' || own.bypassed !== true || own.bypassNotifyPending !== true) return false;
  ['bypassed','bypassedAt','bypassNotifyPending','bypassId'].forEach(function(f){ delete own[f]; });
  var meaningful = !!(own.name || own.examPassed || (Array.isArray(own.modulesDone) && own.modulesDone.length) || own.bypassVerified || own.bypassRejected);
  try { if (meaningful) localStorage.setItem(ownKey, JSON.stringify(own)); else localStorage.removeItem(ownKey); } catch(e){}
  return true;
}
function ottBypassNotifyDue(ownKey){ var own = ottReadState(ownKey); return !!(own && own.bypassNotifyPending === true); }
function ottBypassNotified(ownKey){
  var own = ottReadState(ownKey); if (!own || typeof own !== 'object') return;
  delete own.bypassNotifyPending;
  try { localStorage.setItem(ownKey, JSON.stringify(own)); } catch(e){}
}
/* ── Self-attested prerequisites (2026-09-11) ──
   A confirmed bypass is the rep attesting that the prerequisite(s) were completed elsewhere. That status is
   DERIVED, read-only, from the bypassing dashboard's own record (bypassed/bypassedAt) — nothing is written to
   the prerequisite's record and examPassed is never faked. Everywhere the platform shows or gates on a cert,
   use ottCertStatus(): passed (real cert) wins; otherwise attested (with which dashboard's bypass, and when).
   Attested unlocks the same content a cert would (Learning Path playbooks, downstream gates) but is labelled
   "Completed elsewhere (self-attested)", never "Certified", and never counts as an earned certification. */
var OTT_PREREQS = { ottimate_d102_state: ['ottimate_demo_state'], ottimate_pomatch_state: ['ottimate_demo_state', 'ottimate_d102_state'] };
var OTT_DASH_LABEL = { ottimate_fundamentals_state: 'Fundamentals', ottimate_demo_state: 'Demo 101', ottimate_d102_state: 'Demo 102', ottimate_pomatch_state: 'Demo 201 — PO Match' };
function ottCertStatus(key){
  var s = ottReadState(key);
  var out = { passed: !!(s && s.examPassed === true), attested: false, verified: false, via: null, viaLabel: '', at: null, atLabel: '' };
  if (out.passed) return out;
  for (var own in OTT_PREREQS){
    if (OTT_PREREQS[own].indexOf(key) < 0) continue;
    var o = ottReadState(own);
    if (o && o.bypassed === true){
      var v = o.bypassVerified === true;
      if (out.attested && !v) continue;   // keep the first attestation unless a later one is admin-verified
      out.attested = true; out.verified = v; out.via = own; out.viaLabel = OTT_DASH_LABEL[own] || own; out.at = o.bypassedAt || null;
      out.atLabel = ottBypassWhen(o);
      if (v) break;
    }
  }
  return out;
}
/* "on Sep 11, 2026" when the bypass stamped a date; bypasses recorded before 2026-09-11 have no bypassedAt, so fall back
   to the record's creation date ("around September 10, 2026") — the profile was created in that dashboard right after
   the bypass. '' when neither is known. */
function ottBypassWhen(o){
  if (!o) return '';
  if (o.bypassedAt) return 'on ' + new Date(o.bypassedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return o.certDate ? 'around ' + o.certDate : '';
}
function ottCertOrAttested(key){ var c = ottCertStatus(key); return c.passed || c.attested; }
function ottAttestedTitle(c){ return 'You confirmed completing this on another device when you opened ' + c.viaLabel + (c.atLabel ? ' ' + c.atLabel : '') + (c.verified ? '. Verified by Sales Enablement.' : '.'); }
/* The person a bypass notification should name: the shared profile, else any dashboard record with a name. */
function ottBypassIdentity(){
  var p = ottReadProfile(); if (p && p.name) return { name: p.name, role: p.role || '' };
  for (var k in OTT_STATE_DEFAULTS){ var s = ottReadState(k); if (s && s.name) return { name: s.name, role: s.role || '' }; }
  return null;
}
/* OTT-STATEMIGRATE:END */
