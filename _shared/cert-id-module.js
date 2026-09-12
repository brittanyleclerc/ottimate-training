/* OTT-CERTID:START — Certificate IDs (CONSISTENCY-GUIDE §11). Identical in the portal AND every dashboard.
   Injected by inject-certificate.js (dashboards) and inject-certid.js (portal).
   Format:  OTT-<CODE>-<YYYYMMDD>-<VERTS>-<CHK>     e.g.  OTT-D101-20260504-SL.HC-7F3A
     CODE  = FUND | D101 | D102 | D201        VERTS = 2-letter vertical codes joined by "." ("NA" if none)
     CHK   = 4 hex chars — FNV-1a over code|date|verts|normalised rep name|salt.
   The checksum ties the ID to the rep's name and deters casual invention; it is NOT cryptographic proof
   (the salt lives in this file). Enablement approval remains the real verification (§10). */
var OTT_CERT_CODES = { ottimate_fundamentals_state: 'FUND', ottimate_demo_state: 'D101', ottimate_d102_state: 'D102', ottimate_pomatch_state: 'D201' };
var OTT_CERT_VERT_CODES = { restaurants: 'RE', hospitality: 'HO', retail: 'RT', grocery: 'GR', seniorliving: 'SL', healthcare: 'HC' };
var OTT_CERT_SALT = 'ottimate-training-2026';
function ottCertNorm(name){ return String(name || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function ottCertHash(str){ var h = 0x811c9dc5; for (var i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000' + (h & 0xffff).toString(16).toUpperCase()).slice(-4); }
/* "May 4, 2026" | Date | ms → "20260504" ('' if unparseable) */
function ottCertYmd(d){ var t = (d instanceof Date) ? d : new Date(typeof d === 'number' ? d : String(d || '')); if (isNaN(t.getTime())) return ''; return t.getFullYear() + ('0' + (t.getMonth() + 1)).slice(-2) + ('0' + t.getDate()).slice(-2); }
function ottCertVertCode(verts){ var c = (verts || []).map(function(v){ return OTT_CERT_VERT_CODES[v] || ''; }).filter(Boolean); return c.length ? c.join('.') : 'NA'; }
function ottCertMakeId(stateKey, date, verts, name){
  var code = OTT_CERT_CODES[stateKey]; var ymd = ottCertYmd(date); if (!code || !ymd) return '';
  var vc = ottCertVertCode(verts);
  return 'OTT-' + code + '-' + ymd + '-' + vc + '-' + ottCertHash([code, ymd, vc, ottCertNorm(name), OTT_CERT_SALT].join('|'));
}
/* Parse + verify. Returns { ok, stateKey, code, date (Date), dateLabel, verticals[], reason } */
function ottCertParseId(id, name){
  var m = String(id || '').trim().toUpperCase().match(/^OTT-(FUND|D101|D102|D201)-(\d{8})-([A-Z.]{2,})-([0-9A-F]{4})$/);
  if (!m) return { ok: false, reason: 'That doesn’t look like a certificate ID (expected OTT-XXXX-YYYYMMDD-XX-XXXX).' };
  var code = m[1], ymd = m[2], vc = m[3], chk = m[4];
  var stateKey = Object.keys(OTT_CERT_CODES).filter(function(k){ return OTT_CERT_CODES[k] === code; })[0];
  var date = new Date(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8));
  var verticals = vc === 'NA' ? [] : vc.split('.').map(function(c){ return Object.keys(OTT_CERT_VERT_CODES).filter(function(k){ return OTT_CERT_VERT_CODES[k] === c; })[0]; }).filter(Boolean);
  if (isNaN(date.getTime()) || (vc !== 'NA' && verticals.length !== vc.split('.').length)) return { ok: false, reason: 'That certificate ID is not valid.' };
  var expect = ottCertHash([code, ymd, vc, ottCertNorm(name), OTT_CERT_SALT].join('|'));
  if (expect !== chk) return { ok: false, stateKey: stateKey, reason: 'That certificate ID doesn’t match the name on your profile (' + (name || '—') + '). Check the ID, or make sure your profile name is exactly as printed on the certificate.' };
  return { ok: true, stateKey: stateKey, code: code, date: date, dateLabel: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), verticals: verticals };
}
/* OTT-CERTID:END */
