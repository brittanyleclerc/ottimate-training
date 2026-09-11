/* OTT-VERTICALS:START — shared Industry Verticals reference section (render code).
   Identical in every dashboard. The injector prepends the data:
     const VERTICAL_PROFILES = {...};   // canonical, from _shared/verticals-profiles.js
     const VERTICAL_LENSES   = {...};   // per-dashboard call-outs, from _shared/verticals-lenses.js
   Shows the rep's selected verticals (APP.verticals) with a "show all" toggle; each vertical =
   the canonical profile + this dashboard's lens (if any). Renders when the ref-verticals tab opens. */
var VERTICALS_CSS = ''
  + '#vr-mount .vr-head{display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;}'
  + '#vr-mount .vr-sub{font-size:0.85rem;color:var(--gray4);margin-top:0.35rem;}'
  + '#vr-mount .vr-toggle{font-size:0.8rem;font-weight:600;color:var(--accent);background:none;border:1px solid var(--accent);border-radius:100px;padding:0.2rem 0.7rem;cursor:pointer;}'
  + '#vr-mount .vr-tabs{display:flex;flex-wrap:wrap;gap:0.4rem;margin:0.9rem 0 1rem;}'
  + '#vr-mount .vr-tab{font-size:0.82rem;font-weight:600;color:var(--gray5);background:var(--white);border:1.5px solid var(--gray2);border-radius:100px;padding:0.35rem 0.85rem;cursor:pointer;}'
  + '#vr-mount .vr-tab:hover{border-color:var(--accent);color:var(--accent);}'
  + '#vr-mount .vr-tab.active{background:var(--accent);border-color:var(--accent);color:#fff;}'
  + '#vr-mount .vr-panel{display:none;}#vr-mount .vr-panel.active{display:block;}'
  + '#vr-mount .vr-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0;}'
  + '@media (max-width:820px){#vr-mount .vr-grid{grid-template-columns:1fr;}}'
  + '#vr-mount .vr-h3{font-size:0.9rem;font-weight:700;color:var(--navy);margin-bottom:0.4rem;}'
  + '#vr-mount .vr-list{margin:0 0 0 1.1rem;padding:0;font-size:0.86rem;line-height:1.55;color:var(--gray5);}#vr-mount .vr-list li{margin-bottom:0.3rem;}'
  + '#vr-mount .vr-box{border-radius:8px;padding:0.75rem 0.9rem;margin-top:0.75rem;font-size:0.86rem;line-height:1.55;}'
  + '#vr-mount .vr-box-t{font-weight:700;margin-bottom:0.3rem;}'
  + '#vr-mount .vr-icp{background:var(--gray1);border:1px solid var(--gray2);color:var(--gray5);}'
  + '#vr-mount .vr-voice{background:var(--green-light);border:1px solid var(--green);color:#145c32;font-style:italic;}'
  + '#vr-mount .vr-lens{background:var(--accent-light);border:1.5px solid var(--accent);color:var(--gray5);}'
  + '#vr-mount .vr-lens .vr-box-t{color:var(--accent-dark);display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;}'
  + '#vr-mount .vr-draft{font-size:0.62rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#7D4C00;background:var(--orange-light);border:1px solid var(--orange);border-radius:100px;padding:0.05rem 0.5rem;}'
  + 'body.printing-tab #vr-mount .vr-panel{display:block !important;page-break-inside:avoid;margin-bottom:1rem;}'
  + 'body.printing-tab #vr-mount .vr-tabs,body.printing-tab #vr-mount .vr-toggle{display:none !important;}';
var VR_SHOW_ALL = false;
function vrEsc(s){ return String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;'); }
function vrDash(){ return (location.pathname.match(/([^/]+)\.html/) || [])[1] || ''; }
function vrSwitch(btn, key){
  var m = document.getElementById('vr-mount'); if (!m) return;
  m.querySelectorAll('.vr-tab').forEach(function(b){ b.classList.toggle('active', b === btn); });
  m.querySelectorAll('.vr-panel').forEach(function(p){ p.classList.toggle('active', p.id === 'vr-' + key); });
}
function vrToggleAll(){ VR_SHOW_ALL = !VR_SHOW_ALL; renderVerticals('vr-mount'); }
function renderVerticals(mountId){
  var mount = document.getElementById(mountId); if (!mount) return;
  if (!document.getElementById('ott-vr-css')){ var st = document.createElement('style'); st.id = 'ott-vr-css'; st.textContent = VERTICALS_CSS; document.head.appendChild(st); }
  var all = Object.keys(VERTICAL_PROFILES);
  var mine = (typeof APP !== 'undefined' && Array.isArray(APP.verticals)) ? APP.verticals.filter(function(v){ return VERTICAL_PROFILES[v]; }) : [];
  var showing = (VR_SHOW_ALL || !mine.length) ? all : mine;
  var lenses = VERTICAL_LENSES[vrDash()] || null;
  var tabs = showing.map(function(v, i){ var p = VERTICAL_PROFILES[v]; return '<button class="vr-tab' + (i === 0 ? ' active' : '') + '" onclick="vrSwitch(this,\'' + v + '\')">' + p.emoji + ' ' + vrEsc(p.label) + '</button>'; }).join('');
  var panels = showing.map(function(v, i){
    var p = VERTICAL_PROFILES[v];
    var lens = lenses && lenses[v];
    var lensHtml = lens ? '<div class="vr-box vr-lens"><div class="vr-box-t">🎯 ' + vrEsc(lenses._title || 'Lens') + (lens.draft ? ' <span class="vr-draft">Draft — pending Enablement review</span>' : '') + '</div><ul class="vr-list">'
      + lens.points.map(function(pt){ return '<li><strong>' + vrEsc(pt[0]) + ':</strong> ' + vrEsc(pt[1]) + '</li>'; }).join('') + '</ul></div>' : '';
    return '<div class="vr-panel' + (i === 0 ? ' active' : '') + '" id="vr-' + v + '"><div class="card">'
      + '<div class="card-title">' + p.emoji + ' ' + vrEsc(p.label) + ' — ' + vrEsc(p.tagline) + '</div>'
      + '<p class="body-text">' + vrEsc(p.desc) + '</p>'
      + lensHtml
      + '<div class="vr-grid"><div><div class="vr-h3">🔴 Key Pain Points</div><ul class="vr-list">' + p.pain.map(function(x){ return '<li>' + vrEsc(x) + '</li>'; }).join('') + '</ul></div>'
      + '<div><div class="vr-h3">✅ How Ottimate Solves It</div><ul class="vr-list">' + p.solve.map(function(s){ return '<li><strong>' + vrEsc(s[0]) + ':</strong> ' + vrEsc(s[1]) + '</li>'; }).join('') + '</ul></div></div>'
      + '<div class="vr-box vr-icp"><div class="vr-box-t">🎯 Ideal Customer Profile</div>' + vrEsc(p.icp) + '</div>'
      + '<div class="vr-box vr-voice"><div class="vr-box-t">💬 Customer Voice</div>' + vrEsc(p.voice) + '</div>'
      + '</div></div>';
  }).join('');
  var sub = mine.length
    ? (VR_SHOW_ALL ? 'Showing all ' + all.length + ' verticals. Your selected verticals: ' + mine.map(function(v){ return VERTICAL_PROFILES[v].label; }).join(', ') + '.'
                   : 'Tailored to the ' + mine.length + ' vertical' + (mine.length > 1 ? 's' : '') + ' you selected — change them from the Dashboard profile card.')
    : 'No verticals selected yet — showing all ' + all.length + '. Pick yours from the Dashboard profile card.';
  mount.innerHTML = '<div class="card" style="margin-bottom:1rem;border-left:4px solid var(--accent);">'
    + '<div class="vr-head"><div><div class="card-title" style="margin:0;border:none;padding:0;">🗂️ Industry Verticals</div><div class="vr-sub">' + sub + '</div></div>'
    + '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">' + (mine.length && mine.length < all.length ? '<button class="vr-toggle" onclick="vrToggleAll()">' + (VR_SHOW_ALL ? 'Show my verticals' : 'Show all ' + all.length) + '</button>' : '')
    + '<button class="btn btn-secondary btn-sm print-tab-btn" onclick="printTab(\'ref-verticals\')">🖨️ Print Vertical Guides</button></div></div>'
    + '<div class="vr-tabs">' + tabs + '</div></div>'
    + panels;
}
if (typeof switchRefTab === 'function' && !window.__vrRefWrap){ window.__vrRefWrap = true; var _vrs = switchRefTab; window.switchRefTab = function(btn, pid){ _vrs(btn, pid); if (pid === 'ref-verticals') renderVerticals('vr-mount'); }; }
if (typeof printTab === 'function' && !window.__vrPrintWrap){ window.__vrPrintWrap = true; var _vrp = printTab; window.printTab = function(id){ if (id === 'ref-verticals'){ var m = document.getElementById('vr-mount'); if (m && !m.innerHTML) renderVerticals('vr-mount'); } return _vrp.apply(this, arguments); }; }
/* OTT-VERTICALS:END */
