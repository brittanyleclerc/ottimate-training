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
   ottimate_profile = { name, role, verticals, updatedAt }. Entered once on the first dashboard a rep
   opens; every dashboard reads it on load (overlaying its own record's profile fields) and the shared
   profile editor writes it. Certs are snapshots: NOTHING on the profile path touches examPassed,
   quiz scores, module completion, or certVerticals. */
var OTT_PROFILE_KEY = 'ottimate_profile';
var OTT_ROLES = { AE:'Account Executive (AE)', SE:'Sales Engineer (SE)', SDR:'SDR / BDR', CSM:'Customer Success (CSM)', MGR:'Sales Manager', PARTNER:'Channel Partner / Reseller', OTHER:'Other' };
var OTT_ROLE_LEGACY = { 'Account Executive':'AE', 'Solutions Engineer':'SE', 'SDR / BDR':'SDR', 'Sales Manager':'MGR', 'Customer Success':'CSM', 'Other':'OTHER',
                        'Sales Development Rep (SDR)':'SDR', 'Sales Engineer (SE)':'SE', 'Account Executive (AE)':'AE', 'Customer Success (CSM)':'CSM', 'Channel Partner / Reseller':'PARTNER' };
function ottNormalizeRole(r){ if (!r) return r; if (OTT_ROLES[r]) return r; return OTT_ROLE_LEGACY[r] || r; }
function ottRoleLabel(r){ return OTT_ROLES[r] || r || '—'; }
function ottReadProfile(){ try { var p = JSON.parse(localStorage.getItem(OTT_PROFILE_KEY) || 'null'); return (p && p.name) ? p : null; } catch(e){ return null; } }
function ottWriteProfile(p){
  var cur = ottReadProfile() || {};
  var next = { name: p.name || cur.name || '', role: ottNormalizeRole(p.role || cur.role || ''), verticals: Array.isArray(p.verticals) ? p.verticals.slice() : (cur.verticals || []), updatedAt: Date.now() };
  try { localStorage.setItem(OTT_PROFILE_KEY, JSON.stringify(next)); } catch(e){}
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
      return ottWriteProfile({ name: s.name, role: s.role, verticals: verts });
    }
  }
  return null;
}
/* Shared-device handoff: "Not you? / Reset" clears EVERY dashboard's record and the shared profile —
   with one profile across dashboards, a per-dashboard reset would leave another person's progress
   attached to the new name. */
function ottResetAllProgress(){
  try { Object.keys(OTT_STATE_DEFAULTS).forEach(function(k){ localStorage.removeItem(k); }); localStorage.removeItem(OTT_PROFILE_KEY); } catch(e){}
}
function ottMigrateState(key){
  var raw = null;
  try { raw = localStorage.getItem(key); } catch(e){ return null; }
  var profile = ottBootstrapProfile(key);
  if (!raw){
    // No record for this dashboard but the rep already has a profile: create the record from it so the
    // dashboard skips its welcome form. Progress fields start empty (this dashboard was never used).
    if (!profile) return null;
    var fresh = Object.assign({}, OTT_STATE_DEFAULTS[key] || {}, { name: profile.name, role: profile.role, verticals: profile.verticals.slice(), schemaV: OTT_SCHEMA_V });
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
    // carry a persisted prerequisite bypass forward — dashboards don't put it in their payloads
    if (stored && stored.bypassed === true && obj && obj.bypassed === undefined) obj.bypassed = true;
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
    if (obj && obj.name && obj.role && !ottReadProfile()) ottWriteProfile(obj);
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
function ottRecordBypass(ownKey){
  var own = ottReadState(ownKey); if (!own || typeof own !== 'object') own = {};
  own.bypassed = true; own.schemaV = OTT_SCHEMA_V;
  try { localStorage.setItem(ownKey, JSON.stringify(own)); } catch(e){}
}
/* OTT-STATEMIGRATE:END */
