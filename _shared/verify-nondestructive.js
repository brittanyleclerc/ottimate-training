/* verify-nondestructive.js
   Proves a dashboard update does NOT alter existing certification progress.
   These run in the BROWSER (paste in console, or drive via automation) because
   progress lives in localStorage.

   Procedure:
     1. On the OLD build, run  ottSnapshot()  -> copy the returned JSON.
     2. Deploy the NEW build, hard-reload.
     3. Run  ottVerify(<pasted JSON>)  -> must report UNCHANGED for every
        cert-bearing key.

   Cert-bearing keys (NEVER rename these — the portal gates on them):
     ottimate_fundamentals_state, ottimate_demo_state,
     ottimate_d102_state, ottimate_pomatch_state
*/
const OTT_CERT_KEYS = ['ottimate_fundamentals_state','ottimate_demo_state','ottimate_d102_state','ottimate_pomatch_state'];

function ottSnapshot(){
  const snap = {};
  OTT_CERT_KEYS.forEach(k => { snap[k] = localStorage.getItem(k); }); // raw string or null
  const out = JSON.stringify(snap);
  console.log('SNAPSHOT (copy this):\n' + out);
  return out;
}

function ottVerify(prevJson){
  let prev; try { prev = JSON.parse(prevJson); } catch(e){ console.error('bad snapshot JSON'); return false; }
  let ok = true;
  const rows = [];
  OTT_CERT_KEYS.forEach(k => {
    const before = prev[k] ?? null;
    const after  = localStorage.getItem(k);
    // What matters for "did we reset a cert": examPassed must not go true->false/null,
    // and the whole blob should be byte-identical unless the user actively used the dashboard.
    const bPassed = before ? (JSON.parse(before).examPassed === true) : false;
    const aPassed = after  ? (JSON.parse(after).examPassed  === true) : false;
    const identical = before === after;
    const certLost = bPassed && !aPassed;
    if (certLost) ok = false;
    rows.push({ key:k, wasCertified:bPassed, stillCertified:aPassed, byteIdentical:identical, CERT_LOST:certLost });
  });
  console.table(rows);
  console.log(ok ? '✅ PASS — no certification was reset.' : '❌ FAIL — a cert-bearing key lost its passed state.');
  return ok;
}
if (typeof module !== 'undefined') module.exports = { ottSnapshot, ottVerify, OTT_CERT_KEYS };
