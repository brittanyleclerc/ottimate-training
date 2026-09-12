/* OTT-BYPASSVERIFY:START — admin verification of prerequisite bypasses (CONSISTENCY-GUIDE §10).
   Identical in every dashboard AND the portal. Injected by inject-bypassverify.js.

   Flow:  rep confirms a bypass → ottNotifyBypass() sends the event (Make.com webhook when configured, else the
          EmailJS bypass email) with a random per-bypass id stored on the record as bypassId
        → Enablement approves / rejects from the email (Make scenario, see _shared/BYPASS-VERIFICATION-SETUP.md)
        → every page load calls ottVerifyBypasses(): fetch the verification FEED (id,status rows), match this
          browser's bypassIds and apply:
            approved → bypassVerified:true (+ bypassed restored if it had been rejected)  → "✓ Admin verified"
            rejected → bypassed removed (the gate returns), bypassRejected:true         → "not verified" notice
            no row   → nothing changes (self-attested, as before)
   Only this browser's own ids are looked up, so the feed never needs to carry names or emails.
   Config: the two URLs below. Both blank = today's behaviour (EmailJS email, no verification). */
var OTT_BYPASS_WEBHOOK_URL = '';   // Make.com "bypass event" webhook (GET). Blank → EmailJS bypass email (per-dashboard template).
var OTT_BYPASS_FEED_URL    = '';   // Verification feed: published Google Sheet CSV (id,status,decided_at) or a JSON URL. Blank → _shared/bypass-verifications.json next to the site.
var OTT_BYPASS_FEED_FALLBACK = '_shared/bypass-verifications.json';
var OTT_BYPASS_EMAIL_NAME = { ottimate_d102_state: 'Demo 102 — Vendor Pay & Basic Reporting', ottimate_pomatch_state: 'PO Match (Level 2)' };   // EmailJS training_name — keep (Enablement filters on these)
var OTT_BYPASS_LABEL = { ottimate_d102_state: 'Demo 102', ottimate_pomatch_state: 'Demo 201 — PO Match' };
var OTT_BYPASS_PREREQ_LABEL = { ottimate_d102_state: 'Demo 101', ottimate_pomatch_state: 'Demo 101 + Demo 102' };
function ottBypassRead(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } }
function ottBypassWrite(k, o){ try { localStorage.setItem(k, JSON.stringify(o)); } catch(e){} }
function ottBypassNewId(){ var s = ''; try { var a = new Uint8Array(8); crypto.getRandomValues(a); for (var i = 0; i < a.length; i++) s += ('0' + a[i].toString(16)).slice(-2); } catch(e){ s = Math.random().toString(16).slice(2, 18); } return 'bp_' + Date.now().toString(36) + '_' + s; }
/* Send the bypass event. Called by the dashboards' sendEmailBypass() (immediately when a profile exists, else deferred
   until the welcome form is saved — see flushBypassNotice). Idempotent per id: the record remembers it was sent. */
function ottNotifyBypass(ownKey, name, role, extra){
  var own = ottBypassRead(ownKey) || {};
  if (!own.bypassId){ own.bypassId = ottBypassNewId(); ottBypassWrite(ownKey, own); }
  var email = '';
  try { var p = JSON.parse(localStorage.getItem('ottimate_profile') || 'null'); email = (p && p.email) || own.email || ''; } catch(e){}
  var roleLabel = (typeof ottRoleLabel === 'function') ? ottRoleLabel(role) : (role || '');
  var when = new Date();
  if (OTT_BYPASS_WEBHOOK_URL){
    try {
      var q = new URLSearchParams({ event: 'bypass', id: own.bypassId, name: name || 'Not yet provided', email: email || '', role: roleLabel || 'Not yet provided',
        dashboard: OTT_BYPASS_LABEL[ownKey] || ownKey, prereqs: OTT_BYPASS_PREREQ_LABEL[ownKey] || '', time: when.toISOString(),
        time_label: when.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }), site: location.origin + location.pathname.replace(/[^/]*$/, ''),
        legacy: (extra && extra.legacy) ? '1' : '0', since: (extra && extra.since) || '' });
      fetch(OTT_BYPASS_WEBHOOK_URL + (OTT_BYPASS_WEBHOOK_URL.indexOf('?') >= 0 ? '&' : '?') + q.toString(), { method: 'GET', mode: 'no-cors', keepalive: true });
    } catch(e){}
  } else if (typeof emailjs !== 'undefined'){
    try {
      emailjs.send('service_fpds6be', 'template_aizkufe', { user_name: name || 'Not yet provided', user_role: roleLabel || 'Not yet provided',
        training_name: OTT_BYPASS_EMAIL_NAME[ownKey] || ownKey, bypass_time: when.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }), bypass_id: own.bypassId, user_email: email });
    } catch(e){}
  }
}
/* Bypasses recorded before verification existed (bypassed:true, no bypassId) are registered with Make ONCE on the first
   load after OTT_BYPASS_WEBHOOK_URL is configured — flagged legacy=1 with the best-known date — so Enablement can decide
   on them too. Never uses the EmailJS fallback (those reps' emails were already sent at the time). Needs a profile name. */
function ottRegisterLegacyBypasses(){
  if (!OTT_BYPASS_WEBHOOK_URL) return;
  var p = null; try { p = JSON.parse(localStorage.getItem('ottimate_profile') || 'null'); } catch(e){}
  Object.keys(OTT_BYPASS_LABEL).forEach(function(k){
    var own = ottBypassRead(k); if (!own || own.bypassed !== true || own.bypassId || own.bypassNotifyPending) return;
    var name = (p && p.name) || own.name; if (!name) return;
    var since = own.bypassedAt ? new Date(own.bypassedAt).toISOString() : (own.certDate ? 'around ' + own.certDate : 'unknown');
    ottNotifyBypass(k, name, (p && p.role) || own.role || '', { legacy: true, since: since });
  });
}
/* Parse the feed: JSON ([{id,status}] or {rows:[…]} or {id:status}) or CSV with an id and a status column. */
function ottParseBypassFeed(text){
  var out = {}; text = String(text || '').replace(/^\uFEFF/, '').trim(); if (!text) return out;
  var norm = function(s){ s = String(s || '').trim().toLowerCase(); return (s === 'approve' || s === 'approved' || s === 'verified' || s === 'yes') ? 'approved' : (s === 'reject' || s === 'rejected' || s === 'denied' || s === 'no') ? 'rejected' : ''; };
  if (text[0] === '[' || text[0] === '{'){
    try {
      var j = JSON.parse(text); var rows = Array.isArray(j) ? j : (Array.isArray(j.rows) ? j.rows : null);
      if (rows) rows.forEach(function(r){ if (r && r.id) out[String(r.id).trim()] = norm(r.status); });
      else for (var k in j) if (Object.prototype.hasOwnProperty.call(j, k)) out[String(k).trim()] = norm(j[k]);
    } catch(e){}
    return out;
  }
  var lines = text.split(/\r?\n/).filter(function(l){ return l.trim(); }); if (!lines.length) return out;
  var cells = function(line){ var res = [], cur = '', q = false; for (var i = 0; i < line.length; i++){ var c = line[i]; if (q){ if (c === '"' && line[i + 1] === '"'){ cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ','){ res.push(cur); cur = ''; } else cur += c; } res.push(cur); return res; };
  var head = cells(lines[0]).map(function(h){ return h.trim().toLowerCase(); });
  var iId = head.indexOf('id'), iSt = head.indexOf('status');
  if (iId < 0 || iSt < 0){ iId = 0; iSt = 1; } else lines = lines.slice(1);
  lines.forEach(function(l){ var c = cells(l); var id = (c[iId] || '').trim(); if (id) out[id] = norm(c[iSt]); });
  return out;
}
function ottBypassFeedUrl(){ return OTT_BYPASS_FEED_URL || (location.protocol === 'file:' ? '' : OTT_BYPASS_FEED_FALLBACK); }
/* Apply decisions for this browser's bypass ids. Returns the list of {key,status} that CHANGED. */
function ottApplyBypassDecisions(feed){
  var changed = [];
  Object.keys(OTT_BYPASS_LABEL).forEach(function(k){
    var own = ottBypassRead(k); if (!own || !own.bypassId) return;
    var st = feed[own.bypassId]; if (!st) return;
    var now = Date.now();
    if (st === 'approved' && !own.bypassVerified){
      own.bypassVerified = true; own.bypassVerifiedAt = now; own.bypassed = true;
      delete own.bypassRejected; delete own.bypassRejectedAt; delete own.bypassRejectedAck;
      ottBypassWrite(k, own); changed.push({ key: k, status: 'approved' });
    } else if (st === 'rejected' && !own.bypassRejected){
      own.bypassRejected = true; own.bypassRejectedAt = now;
      delete own.bypassed; delete own.bypassVerified; delete own.bypassVerifiedAt;
      ottBypassWrite(k, own); changed.push({ key: k, status: 'rejected' });
    }
  });
  return changed;
}
/* Fetch the feed and apply. cb(changed) runs only when something changed. Silent on any failure (offline, file://, no feed). */
function ottVerifyBypasses(cb){
  var need = Object.keys(OTT_BYPASS_LABEL).some(function(k){ var o = ottBypassRead(k); return !!(o && o.bypassId); });
  var url = ottBypassFeedUrl(); if (!need || !url || typeof fetch !== 'function') return;
  try {
    fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' }).then(function(r){ return r.ok ? r.text() : ''; }).then(function(t){
      if (!t) return;
      var changed = ottApplyBypassDecisions(ottParseBypassFeed(t));
      if (changed.length && typeof cb === 'function') cb(changed);
    }).catch(function(){});
  } catch(e){}
}
/* Rejection notice (portal banner / dashboard gate). Returns '' when there is nothing to show. */
function ottBypassRejectionText(k){
  var o = ottBypassRead(k); if (!o || !o.bypassRejected) return '';
  var at = o.bypassRejectedAt ? new Date(o.bypassRejectedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  return 'Sales Enablement could not verify your ' + (OTT_BYPASS_LABEL[k] || k) + ' bypass' + (at ? ' (' + at + ')' : '') + '. Please complete ' + (OTT_BYPASS_PREREQ_LABEL[k] || 'the prerequisite') + ' here first — your progress in ' + (OTT_BYPASS_LABEL[k] || k) + ' is kept and will be waiting once you do.';
}
/* Dashboard gate screens: show the rejection note and hide the "Completed on another device?" link. */
function ottApplyGateRejection(ownKey){
  var txt = ottBypassRejectionText(ownKey); if (!txt) return;
  var card = document.querySelector('#screen-gate .gate-card'); if (!card || card.querySelector('.gate-rejected')) return;
  var note = document.createElement('div'); note.className = 'gate-rejected';
  note.style.cssText = 'margin:0 0 1rem;padding:0.7rem 0.9rem;border-radius:8px;background:#FEF9E7;border:1px solid #F39C12;color:#7D4C00;font-size:0.86rem;line-height:1.45;text-align:left;';
  note.textContent = '⚠️ ' + txt;
  var anchor = card.querySelector('h2'); if (anchor) anchor.insertAdjacentElement('afterend', note); else card.prepend(note);
  card.querySelectorAll('.gate-bypass').forEach(function(el){ el.style.display = 'none'; });
}
/* Default handler: portal → re-render cards + rejection banner; dashboards → toast on approval, notice on rejection,
   Learning Path re-render. The gate itself applies on the next load (never yank a rep out mid-module). */
function ottOnBypassDecisions(changed){
  if (typeof updatePortal === 'function'){ try { updatePortal(); } catch(e){} }
  var file = (location.pathname.match(/([^/]+)\.html/) || [])[1] || '';
  var ownKey = { 'demo102': 'ottimate_d102_state', 'pomatch': 'ottimate_pomatch_state' }[file] || '';
  changed.forEach(function(c){
    if (c.status === 'approved' && typeof ottProfileToast === 'function') ottProfileToast('✓ Sales Enablement verified your ' + OTT_BYPASS_LABEL[c.key] + ' bypass.');
    if (c.status === 'rejected' && c.key === ownKey) ottShowRejectionNotice(c.key);
  });
  if (document.getElementById('lp-mount') && typeof renderLearningPath === 'function') renderLearningPath('lp-mount');
}
function ottShowRejectionNotice(k){
  var txt = ottBypassRejectionText(k); if (!txt) return;
  var shell = document.getElementById('app-shell'); var body = shell && shell.querySelector('.app-body');
  if (!body || document.getElementById('ott-bypass-rejected')) return;
  var n = document.createElement('div'); n.id = 'ott-bypass-rejected';
  n.style.cssText = 'flex-shrink:0;background:#FEF9E7;border-bottom:1px solid #F39C12;color:#7D4C00;padding:0.65rem 1.25rem;text-align:center;font-size:0.86rem;font-weight:600;line-height:1.4;display:flex;align-items:center;justify-content:center;gap:0.8rem;flex-wrap:wrap;';
  n.innerHTML = '<span>⚠️ ' + txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span><a href="portal.html" style="background:var(--navy);color:#fff;border-radius:6px;padding:0.35rem 0.8rem;font-weight:700;font-size:0.82rem;text-decoration:none;white-space:nowrap;">Back to Portal</a>';
  body.insertAdjacentElement('beforebegin', n);
}
ottRegisterLegacyBypasses();
ottVerifyBypasses(ottOnBypassDecisions);
/* OTT-BYPASSVERIFY:END */
