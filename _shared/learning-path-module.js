/* OTT-LEARNINGPATH:START — shared progressive "Learning Path" reference section.
   Identical in every dashboard. Reads the four cert keys READ-ONLY and renders a
   journey that expands as certifications are earned. Injected by inject-learningpath.js. */
const LEARNING_PATH = [
  { key:'fundamentals', name:'Fundamentals', level:'Level 1', certKey:'ottimate_fundamentals_state', href:'fundamentals-training.html',
    blurb:'AP terminology, invoice capture, GL coding, and the platform foundation every rep needs.',
    assets:[{l:'Key Terms Cheat Sheet',t:'ref-quickref'},{l:'Persona Discovery Questions',t:'ref-discovery'},{l:'Objection Handler',t:'ref-objections'},{l:'Industry Verticals',t:'ref-verticals'}],
    powerQuestion:'Walk me through what happens from the moment an invoice arrives to when it’s paid today.',
    keyFact:'Ottimate captures line-level invoice data instantly — no manual keying or OCR cleanup.' },
  { key:'demo101', name:'Demo 101 — Core AP & Statements', level:'Level 1', certKey:'ottimate_demo_state', href:'demo-training.html',
    blurb:'The core AP demo: capture, coding, approval workflows, and statement reconciliation.',
    assets:[{l:'Quick Reference',t:'ref-quickref'},{l:'Scripts & Videos',t:'ref-scripts'},{l:'Core AP Discovery',t:'ref-discovery'},{l:'Objection Handler',t:'ref-objections'},{l:'Industry Verticals',t:'ref-verticals'}],
    powerQuestion:'Where do invoices get stuck or lost in your current approval process?',
    keyFact:'Coding and approval routing happen in one place; statements reconcile against captured invoices.' },
  { key:'demo102', name:'Demo 102 — Vendor Pay & Reporting', level:'Level 1', certKey:'ottimate_d102_state', href:'demo102.html', requires:['ottimate_demo_state'], requiresLabel:'Demo 101',
    blurb:'Vendor Pay methods, the disbursement workflow, and standard reporting & dashboards.',
    assets:[{l:'Vendor Pay Quick Reference',t:'ref-quickref'},{l:'Scripts & Videos',t:'ref-scripts'},{l:'Demo Mastery',t:'ref-mastery'},{l:'Discovery Questions',t:'ref-discovery'}],
    powerQuestion:'How do you decide which vendors are paid by check vs. ACH vs. card — and who manages that?',
    keyFact:'Vendor Pay adds a payment-method hierarchy and can turn AP into a rebate revenue stream (vCard).' },
  { key:'pomatch', name:'Demo 201 — PO Match', level:'Level 2', certKey:'ottimate_pomatch_state', href:'pomatch.html', requires:['ottimate_demo_state','ottimate_d102_state'], requiresLabel:'Demo 101 + Demo 102',
    blurb:'Purchase-order matching, exception handling, discovery, and the capabilities menu.',
    assets:[{l:'PO Match Quick Reference',t:'ref-quickref'},{l:'Demo Script & Cheat Sheet',t:'ref-scripts'},{l:'Scenarios',t:'ref-scen'},{l:'Capabilities Menu',t:'ref-menu'},{l:'Discovery Questions',t:'ref-discovery'}],
    powerQuestion:'Are these purchases quantity-driven (units of an item) or amount-driven (a service/contract for a dollar value)?',
    keyFact:'Amount-vs-quantity is a per-PO-item setting and runs on both 2-way and 3-way matches.' }
];
const LEARNING_PATH_CSS = `
#lp-mount .lp-intro{font-size:0.88rem;color:var(--gray5);margin-bottom:0.75rem;line-height:1.55;}
#lp-mount .lp-progress{height:10px;background:var(--gray2);border-radius:100px;overflow:hidden;margin-bottom:1.25rem;}
#lp-mount .lp-progress-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,var(--accent),var(--accent-mid));transition:width .5s ease;}
#lp-mount .lp-list{display:flex;flex-direction:column;gap:0.75rem;}
#lp-mount .lp-item{display:flex;gap:0.85rem;border:1.5px solid var(--gray2);border-radius:10px;padding:0.9rem 1rem;background:var(--white);transition:all .15s;}
#lp-mount .lp-item.lp-done{border-color:var(--accent);background:var(--accent-light);}
#lp-mount .lp-item.lp-attested{border-color:var(--orange);background:var(--orange-light);}
#lp-mount .lp-attested .lp-status{color:#7D4C00;}
#lp-mount .lp-item.lp-verified{border-color:var(--green);background:var(--green-light);}
#lp-mount .lp-verified .lp-status{color:#1a6e3c;}
#lp-mount .lp-item.lp-cur{border-color:var(--accent);border-width:2px;box-shadow:0 2px 10px rgba(0,0,0,0.06);}
#lp-mount .lp-badge{font-size:1.5rem;line-height:1;flex-shrink:0;}
#lp-mount .lp-head{display:flex;align-items:baseline;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.2rem;}
#lp-mount .lp-name{font-weight:700;color:var(--navy);font-size:0.95rem;}
#lp-mount .lp-level{font-size:0.66rem;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:var(--accent);background:var(--white);border:1px solid var(--accent);border-radius:100px;padding:0.05rem 0.5rem;}
#lp-mount .lp-here{font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:#fff;background:var(--accent);border-radius:100px;padding:0.08rem 0.5rem;}
#lp-mount .lp-status{font-size:0.8rem;font-weight:600;color:var(--gray5);margin-bottom:0.3rem;}
#lp-mount .lp-blurb{font-size:0.82rem;color:var(--gray4);line-height:1.5;margin-bottom:0.5rem;}
#lp-mount .lp-assets{display:flex;flex-wrap:wrap;gap:0.3rem 0.6rem;margin-bottom:0.4rem;}
#lp-mount .lp-asset{font-size:0.74rem;color:var(--gray4);text-decoration:none;border-bottom:1px dotted var(--gray3);padding-bottom:1px;cursor:pointer;}
#lp-mount .lp-asset:hover{color:var(--accent);border-bottom-color:var(--accent);}
#lp-mount .lp-asset.on{color:var(--accent);font-weight:600;}
#lp-mount .lp-link{font-size:0.8rem;font-weight:600;color:var(--accent);text-decoration:none;}
#lp-mount .lp-link:hover{text-decoration:underline;}
#lp-mount .lp-locked{font-size:0.78rem;font-weight:600;color:var(--gray4);display:inline-flex;align-items:center;gap:0.3rem;}
#lp-mount .lp-asset.off{color:var(--gray3);border-bottom-style:none;cursor:default;}
#lp-mount .lp-item.lp-todo{opacity:0.72;}
#lp-mount .lp-playbook{background:var(--white);border:1px solid var(--gray2);border-radius:8px;padding:0.55rem 0.7rem;margin:0.1rem 0 0.55rem;}
#lp-mount .lp-pb-q{font-size:0.8rem;color:var(--navy);line-height:1.45;margin-bottom:0.25rem;}
#lp-mount .lp-pb-k{font-size:0.78rem;color:var(--gray4);line-height:1.4;}
`;
function renderLearningPath(mountId){
  const mount = document.getElementById(mountId); if(!mount) return;
  if(!document.getElementById('ott-lp-css')){ const st=document.createElement('style'); st.id='ott-lp-css'; st.textContent=LEARNING_PATH_CSS; document.head.appendChild(st); }
  const file = (location.pathname.match(/([^/]+)\.html/)||[])[1] || '';
  const CUR = {'fundamentals-training':'fundamentals','demo-training':'demo101','demo102':'demo102','pomatch':'pomatch'}[file];
  let earned = 0, attestedN = 0;
  const rows = LEARNING_PATH.map(function(t){
    let st=null; try{ st=JSON.parse(localStorage.getItem(t.certKey)||'null'); }catch(e){}
    // Real cert, or a self-attested prerequisite (derived from a confirmed bypass — CONSISTENCY-GUIDE §6).
    // Attested unlocks the same content a cert does, but is labelled honestly and is not counted as earned.
    const cert = ottCertStatus(t.certKey);
    const passed = cert.passed; if(passed) earned++;
    const attested = cert.attested; if(attested) attestedN++;
    const unlocked = passed || attested;
    const isCur = (t.key === CUR);
    // Same rule the target dashboard enforces (ottGateAllows): every prerequisite certified (or self-attested),
    // or that dashboard's own record carries a confirmed bypass. Never link into a gate screen.
    // Temporary preview gate (§12): a track held back for this rep's role shows "In final review" and no links.
    const preview = (!isCur && typeof ottPreviewBlocked === 'function') ? ottPreviewBlocked(t.certKey) : null;
    const content = (typeof ottContentStatus === 'function') ? ottContentStatus(t.certKey) : { stale:false, renewal:null };
    const open = !preview && (isCur || !t.requires || t.requires.every(function(k){ return ottCertOrAttested(k); }) || !!(st && st.bypassed === true));
    const status = preview ? '🔍 In final review — coming soon'
      : content.renewal ? ('🔁 Renewal in progress — previously certified' + (content.renewal.priorCertDate ? ' ' + content.renewal.priorCertDate : '') + '; complete the updated dashboard to renew')
      : passed ? ('✅ Certified' + (st.certDate ? ' · ' + st.certDate : '') + (content.stale ? ' · 🔁 content updated since — retake ' + (content.policy === 'required' ? 'required' : 'recommended') : ''))
      : attested ? ('<span title="' + ottAttestedTitle(cert) + '">' + (cert.verified ? '✅ Completed elsewhere — verified by Sales Enablement' : '☑️ Completed elsewhere (self-attested · via ' + cert.viaLabel + ' bypass' + (cert.atLabel ? ' ' + cert.atLabel : '') + ')') + '</span>')
      : (isCur ? '▶ You are training here now' : (t.level==='Level 2' ? '🔒 Unlocks after Level 1' : '⬜ Not started'));
    const cls = passed ? 'lp-done' : (attested ? (cert.verified ? 'lp-verified' : 'lp-attested') : (isCur ? 'lp-cur' : 'lp-todo'));
    const shortName = t.name.split('—')[0].trim();
    return '<div class="lp-item ' + cls + '">'
      + '<div class="lp-badge">' + (passed ? '🏆' : (attested ? (cert.verified ? '✅' : '☑️') : (t.level==='Level 2' ? '🔒' : '📘'))) + '</div>'
      + '<div class="lp-body" style="flex:1;">'
      +   '<div class="lp-head"><span class="lp-name">' + t.name + '</span><span class="lp-level">' + t.level + '</span>' + (isCur ? '<span class="lp-here">You are here</span>' : '') + '</div>'
      +   '<div class="lp-status">' + status + '</div>'
      +   '<div class="lp-blurb">' + t.blurb + '</div>'
      +   '<div class="lp-assets">' + t.assets.map(function(a){
            // Locked track: chips are plain text — a link would only land on that dashboard's gate screen.
            if (!open) return '<span class="lp-asset off" title="' + (preview ? 'In final review — coming soon' : 'Unlocks after ' + t.requiresLabel) + '">• ' + a.l + '</span>';
            // same dashboard: open the tab in place; other dashboard: navigate with a #ref= hash the module handles on load
            var link = isCur ? ('href="#" onclick="ottOpenRefTab(&quot;' + a.t + '&quot;);return false;"') : ('href="' + t.href + '#ref=' + a.t + '"');
            return '<a class="lp-asset ' + (unlocked?'on':'') + '" ' + link + ' title="Open ' + a.l + '">' + (unlocked?'✓':'•') + ' ' + a.l + '</a>';
          }).join('') + '</div>'
      +   (unlocked ? '<div class="lp-playbook"><div class="lp-pb-q">🔑 <strong>Power question:</strong> ' + t.powerQuestion + '</div><div class="lp-pb-k">💡 ' + t.keyFact + '</div></div>' : '')
      +   (isCur ? ''
            : (open ? '<a class="lp-link" href="' + t.href + '#ref">' + (passed ? 'Open ' : 'Open ') + shortName + ' Reference Materials →</a>'
                    : (preview ? '<span class="lp-locked" title="' + preview.message.replace(/"/g, '&quot;') + '">🔍 In final review — you’ll be emailed when it’s released</span>'
                               : '<span class="lp-locked">🔒 Unlocks after ' + t.requiresLabel + ' certification</span>')))
      + '</div></div>';
  }).join('');
  const pct = Math.round(earned / LEARNING_PATH.length * 100);
  mount.innerHTML = '<div class="card"><div class="card-title">🗺️ Your Learning Path</div>'
    + '<p class="lp-intro">Your reference library grows as you complete each certification — <strong>' + earned + ' of ' + LEARNING_PATH.length + '</strong> earned' + (attestedN ? ' · ' + attestedN + ' self-attested (completed elsewhere)' : '') + '. Completed tracks show a 🏆. Links open that track&rsquo;s Reference Materials; locked tracks unlock when you certify their prerequisites.</p>'
    + '<div class="lp-progress"><div class="lp-progress-fill" style="width:' + pct + '%"></div></div>'
    + '<div class="lp-list">' + rows + '</div></div>';
}
/* Deep link: open a specific Reference tab on this dashboard (used by asset chips + #ref=<id> hash). */
function ottOpenRefTab(tabId){
  if (typeof showRef !== 'function') return false;
  showRef();
  var btn = null; document.querySelectorAll('.ref-tab').forEach(function(b){ if ((b.getAttribute('onclick')||'').indexOf("'" + tabId + "'") >= 0) btn = b; });
  if (btn) { switchRefTab(btn, tabId); return true; }
  return false;
}
/* On load with #ref (Reference Materials) or #ref=<tab-id> (that tab): wait for the session to restore. */
(function(){
  var m = (location.hash || '').match(/^#ref(?:=(ref-[a-z]+))?$/); if (!m) return;
  var tab = m[1] || '', tries = 0;
  var iv = setInterval(function(){
    var shell = document.getElementById('app-shell');
    if (shell && shell.classList.contains('active')) { clearInterval(iv); if (tab) ottOpenRefTab(tab); else if (typeof showRef === 'function') showRef(); history.replaceState(null, '', location.pathname + location.search); }
    else if (++tries > 80) clearInterval(iv);   // ~12s: no session (welcome/gate screen) — leave the hash, do nothing
  }, 150);
})();
if (typeof switchRefTab === 'function' && !window.__lpRefWrap){ window.__lpRefWrap = true; const _lps = switchRefTab; window.switchRefTab = function(btn, pid){ _lps(btn, pid); if (pid === 'ref-learning') renderLearningPath('lp-mount'); }; }
/* OTT-LEARNINGPATH:END */
