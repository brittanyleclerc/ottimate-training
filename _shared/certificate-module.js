/* OTT-CERTIFICATE:START — shared certificate screen (CONSISTENCY-GUIDE §11). Identical in every dashboard.
   Injected by inject-certificate.js, which retires each dashboard's own certificate markup, CSS, showCertificate()
   and backToDashboardFromCert(). ONE design for every track (the Fundamentals / Demo 101 layout): navy frame,
   badge, "Certificate of Completion", verticals trained, exam score, signature + issued date, Certificate ID.
   Per-dashboard differences live ONLY in OTT_CERT_CONFIG (badge, level, program, description, score total).
   Actions are identical everywhere: 🖨️ Print / Save as PDF · ← Back to Dashboard (always the Dashboard view).
   Issued date = APP.certDate, which every dashboard stamps at the moment the exam is passed.
   Deep link: <dashboard>.html#certificate opens it once the session has restored (used by the portal's
   "View My Certificate"). Requires cert-id-module.js (ottCertMakeId). */
var OTT_CERT_CONFIG = {
  'fundamentals-training': { key: 'ottimate_fundamentals_state', badge: '🎓', level: 'Level 1 · Fundamentals', program: 'Ottimate Fundamentals',
    desc: 'has successfully completed the <strong>Ottimate Fundamentals</strong> Sales Training Program, demonstrating proficiency in accounting fundamentals, Ottimate’s product and mission, industry vertical knowledge, and persona-based selling techniques.',
    total: function(){ return (typeof EXAM_QUESTIONS !== 'undefined' && EXAM_QUESTIONS.length) || 20; } },
  'demo-training': { key: 'ottimate_demo_state', badge: '🏅', level: 'Level 1 · Demo 101', program: 'Core AP + Statements',
    desc: 'has successfully completed the <strong>Ottimate Core AP + Statements</strong> Demo Training &amp; Certification Program, demonstrating proficiency in AP automation product knowledge, demo techniques, and the complete Core AP + Statements demo script.',
    total: function(){ return (typeof EXAM_QUESTIONS !== 'undefined' && EXAM_QUESTIONS.length) || 25; } },
  'demo102': { key: 'ottimate_d102_state', badge: '🏅', level: 'Level 1 · Demo 102', program: 'Vendor Pay &amp; Basic Reporting',
    desc: 'has successfully completed the <strong>Ottimate Vendor Pay &amp; Basic Reporting</strong> Demo Training &amp; Certification Program, demonstrating proficiency in the Vendor Pay revenue story, payment method hierarchy, standard reports &amp; dashboards, and the disbursement workflow.',
    total: function(){ return 95; } },
  'pomatch': { key: 'ottimate_pomatch_state', badge: '🎖️', level: 'Level 2 · Demo 201', program: 'PO Match',
    desc: 'has successfully completed the <strong>Demo 201 — PO Match (Level 2)</strong> Demo Training &amp; Certification Program, demonstrating proficiency in purchase-order matching, exception handling, the Demonstrating-to-Win delivery method, discovery, and the PO Match demo walkthrough.',
    total: function(){ return (typeof EXAM_QUESTIONS !== 'undefined' && EXAM_QUESTIONS.length) || 0; } }
};
var OTT_CERT_CSS = ''
  + '#screen-certificate{background:var(--gray1);display:none;flex-direction:column;align-items:center;justify-content:center;padding:2rem;position:fixed;inset:0;z-index:400;overflow-y:auto;}'
  + '#screen-certificate.active{display:flex;}'
  + '.certificate{background:var(--white);border:8px solid var(--navy);border-radius:8px;max-width:720px;width:100%;padding:3rem;text-align:center;position:relative;box-shadow:var(--shadow-lg);}'
  + '.certificate::before{content:"";position:absolute;inset:14px;border:2px solid var(--teal);border-radius:2px;pointer-events:none;}'
  + '.cert-logo{font-size:1.75rem;font-weight:800;color:var(--navy);}.cert-logo span{color:var(--teal);}'
  + '.cert-level{font-size:0.66rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--blue);margin-top:0.2rem;}'
  + '.cert-badge{width:75px;height:75px;background:linear-gradient(135deg,var(--blue),var(--teal));border-radius:50%;margin:1.1rem auto;display:flex;align-items:center;justify-content:center;font-size:2rem;}'
  + '.cert-title{font-size:0.75rem;letter-spacing:3px;text-transform:uppercase;color:var(--gray4);margin-bottom:0.75rem;}'
  + '.cert-presents{font-size:0.9rem;color:var(--gray4);margin-bottom:0.3rem;}'
  + '.cert-name{font-size:2.2rem;font-weight:800;color:var(--navy);font-style:italic;border-bottom:3px solid var(--teal);padding-bottom:0.4rem;margin:0.75rem 0 1rem;}'
  + '.cert-desc{font-size:0.9rem;color:var(--gray5);line-height:1.65;max-width:500px;margin:0 auto 0.75rem;}'
  + '.cert-verticals{margin:0.6rem auto 0.4rem;font-size:0.82rem;color:#555;max-width:420px;}.cert-verticals strong{color:#333;}'
  + '.cert-score-badge{display:inline-block;background:var(--teal-light);border:2px solid var(--teal);border-radius:8px;padding:0.4rem 1.25rem;font-weight:700;color:var(--blue);font-size:0.9rem;margin-bottom:1.5rem;}'
  + '.cert-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--gray2);}'
  + '.cert-sig-line{border-bottom:2px solid var(--navy);width:160px;margin-bottom:0.25rem;}.cert-sig-label{font-size:0.72rem;color:var(--gray4);text-align:left;}'
  + '.cert-date-text{font-size:0.82rem;color:var(--gray4);text-align:right;}'
  + '.cert-id{font-size:0.68rem;color:var(--gray3);letter-spacing:0.5px;margin-top:0.2rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}'
  + '.cert-actions{display:flex;gap:0.75rem;margin-top:1.5rem;justify-content:center;flex-wrap:wrap;}'
  + '@media (max-width:640px){.certificate{padding:2rem 1.25rem;}.cert-name{font-size:1.6rem;}.cert-footer{flex-direction:column;align-items:center;gap:0.75rem;}.cert-sig-label,.cert-date-text{text-align:center;}}'
  + '@media print{body.printing-cert>*:not(#screen-certificate){display:none !important;}body.printing-cert #screen-certificate{display:flex !important;position:static;padding:0;background:#fff;}body.printing-cert .certificate{box-shadow:none;}body.printing-cert .cert-actions{display:none !important;}}';
function ottCertConfig(){ var file = (location.pathname.match(/([^/]+)\.html/) || [])[1] || ''; return OTT_CERT_CONFIG[file] || null; }
function ottCertEnsureScreen(){
  if (!document.getElementById('ott-cert-css')){ var st = document.createElement('style'); st.id = 'ott-cert-css'; st.textContent = OTT_CERT_CSS; document.head.appendChild(st); }
  var el = document.getElementById('screen-certificate'); if (el) return el;
  var cfg = ottCertConfig() || { badge: '🎓', level: '', desc: '' };
  el = document.createElement('div'); el.id = 'screen-certificate';
  el.innerHTML = '<div class="certificate" id="certificate-inner">'
    + '<div class="cert-logo">Ottim<span>ate</span></div>'
    + '<div class="cert-level">' + cfg.level + '</div>'
    + '<div class="cert-badge">' + cfg.badge + '</div>'
    + '<div class="cert-title">Certificate of Completion</div>'
    + '<div class="cert-presents">This certifies that</div>'
    + '<div class="cert-name" id="cert-name">—</div>'
    + '<div class="cert-desc">' + cfg.desc + '</div>'
    + '<div class="cert-verticals" id="cert-verticals"></div>'
    + '<div class="cert-score-badge" id="cert-score">Final Exam Score: —</div>'
    + '<div class="cert-footer"><div class="cert-sig"><div class="cert-sig-line"></div><div class="cert-sig-label">Ottimate Sales Enablement</div></div>'
    + '<div><div class="cert-date-text" id="cert-date"></div><div class="cert-id" id="cert-id"></div></div></div>'
    + '</div>'
    + '<div class="cert-actions no-print">'
    + '<button class="btn btn-primary" onclick="printCertificate()">🖨️ Print / Save as PDF</button>'
    + '<button class="btn btn-secondary" onclick="backToDashboardFromCert()">← Back to Dashboard</button>'
    + '</div>';
  document.body.appendChild(el);
  return el;
}
function ottCertEsc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function showCertificate(){
  if (typeof APP === 'undefined') return;
  var cfg = ottCertConfig(); var el = ottCertEnsureScreen();
  var total = cfg ? cfg.total() : 0;
  var pct = (total && APP.examScore != null) ? Math.round((APP.examScore / total) * 100) : null;
  var certVerts = (APP.certVerticals && APP.certVerticals.length) ? APP.certVerticals : (APP.verticals || []);
  var labels = certVerts.map(function(v){ return (typeof VERTICAL_LABELS !== 'undefined' && VERTICAL_LABELS[v]) || v; }).join(' · ');
  var issued = APP.certDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('cert-name').textContent = APP.name || '—';
  document.getElementById('cert-verticals').innerHTML = labels ? '<strong>Industry Verticals Trained:</strong> ' + ottCertEsc(labels) : '';
  document.getElementById('cert-score').textContent = (APP.examScore != null && total) ? 'Final Exam Score: ' + APP.examScore + '/' + total + (pct != null ? ' (' + pct + '%)' : '') : 'Ottimate Certified';
  document.getElementById('cert-date').textContent = 'Issued: ' + issued;
  var id = (cfg && typeof ottCertMakeId === 'function') ? ottCertMakeId(cfg.key, issued, certVerts, APP.name) : '';
  document.getElementById('cert-id').textContent = id ? 'Certificate ID: ' + id : '';
  el.classList.add('active'); el.scrollTop = 0;
}
function backToDashboardFromCert(){
  var el = document.getElementById('screen-certificate'); if (el) el.classList.remove('active');
  var shell = document.getElementById('app-shell'); if (shell) shell.classList.add('active');
  if (typeof showDashboard === 'function') showDashboard();
}
function printCertificate(){
  document.body.classList.add('printing-cert');
  var done = function(){ document.body.classList.remove('printing-cert'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(function(){ window.print(); setTimeout(done, 1500); }, 30);
}
/* #certificate deep link (portal "View My Certificate"): wait for the session to restore, then open. */
(function(){
  if ((location.hash || '') !== '#certificate') return;
  var tries = 0;
  var iv = setInterval(function(){
    var shell = document.getElementById('app-shell');
    if (shell && shell.classList.contains('active')){ clearInterval(iv); history.replaceState(null, '', location.pathname + location.search); if (typeof APP !== 'undefined' && APP.examPassed) showCertificate(); }
    else if (++tries > 80) clearInterval(iv);
  }, 150);
})();
/* OTT-CERTIFICATE:END */
