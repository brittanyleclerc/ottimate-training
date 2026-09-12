/* OTT-RENEWAL:START — certification renewal notice (CONSISTENCY-GUIDE §13). Identical in every dashboard.
   Injected by inject-renewal.js. The core (content versions, stale detection, archiving + reset at load) lives in
   state-migration-module.js; this only SHOWS the rep what is going on, inside the shell, once the session restores:
     renewal in progress → amber banner "🔁 Renewal in progress — … was updated on <date>. Complete the updated modules and
                           pass the final exam to renew your certification (previously earned <date>)."
     optional retake     → same banner, softer wording, dismissible for the session. */
var OTT_RENEWAL_CSS = ''
  + '#ott-renewal-banner{flex-shrink:0;background:linear-gradient(90deg,#FEF3C7,#FFFBEB);border-bottom:1px solid #F59E0B;color:#7D4C00;padding:0.65rem 1.25rem;text-align:center;font-size:0.86rem;font-weight:600;line-height:1.45;display:flex;align-items:center;justify-content:center;gap:0.8rem;flex-wrap:wrap;}'
  + '#ott-renewal-banner button{background:transparent;color:#7D4C00;border:1px solid #F59E0B;border-radius:6px;padding:0.3rem 0.7rem;font-weight:700;font-size:0.8rem;font-family:inherit;cursor:pointer;}'
  + '@media print{#ott-renewal-banner{display:none !important;}}';
function ottRenewalOwnKey(){ var f = (location.pathname.match(/([^/]+)\.html/) || [])[1] || ''; return { 'fundamentals-training':'ottimate_fundamentals_state','demo-training':'ottimate_demo_state','demo102':'ottimate_d102_state','pomatch':'ottimate_pomatch_state' }[f] || ''; }
function ottRenewalText(key){
  if (typeof ottContentStatus !== 'function') return '';
  var c = ottContentStatus(key); var esc = function(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
  if (c.renewal) return '🔁 <strong>Renewal in progress.</strong> ' + esc(c.note || 'This training was updated.') + ' Complete the updated modules and pass the final exam to renew your certification' + (c.renewal.priorCertDate ? ' (previously earned ' + esc(c.renewal.priorCertDate) + ')' : '') + '.';
  if (c.stale && c.policy === 'optional') return '🔁 ' + esc(c.note || 'This training was updated since you certified.') + ' Your certification stands — retaking the updated modules and exam is recommended.';
  return '';
}
function ottRenewalBanner(){
  var key = ottRenewalOwnKey(); if (!key) return;
  var txt = ottRenewalText(key); var old = document.getElementById('ott-renewal-banner');
  if (!txt){ if (old) old.remove(); return; }
  if (old){ old.querySelector('span').innerHTML = txt; return; }
  if (sessionStorage.getItem('ott-renewal-dismissed') === key && ottContentStatus(key).policy === 'optional') return;
  if (!document.getElementById('ott-renewal-css')){ var st = document.createElement('style'); st.id = 'ott-renewal-css'; st.textContent = OTT_RENEWAL_CSS; document.head.appendChild(st); }
  var shell = document.getElementById('app-shell'); var body = shell && shell.querySelector('.app-body'); if (!body) return;
  var n = document.createElement('div'); n.id = 'ott-renewal-banner';
  n.innerHTML = '<span>' + txt + '</span>' + (ottContentStatus(key).renewal ? '' : '<button type="button" onclick="sessionStorage.setItem(\'ott-renewal-dismissed\',\'' + key + '\');this.parentNode.remove()">Later</button>');
  body.insertAdjacentElement('beforebegin', n);
}
(function(){ var tries = 0; var iv = setInterval(function(){ var shell = document.getElementById('app-shell'); if (shell && shell.classList.contains('active')){ clearInterval(iv); ottRenewalBanner(); } else if (++tries > 200) clearInterval(iv); }, 150); })();
/* OTT-RENEWAL:END */
