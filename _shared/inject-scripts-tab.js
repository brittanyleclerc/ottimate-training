/* inject-scripts-tab.js <dashboard.html>
   Standardizes the "🎬 Scripts & Videos" reference tab on the demo dashboards:
     - the tab is always the 2nd tab, right after Quick Reference (Demo 102's placement)
     - demo-training.html: moves the Demo Script & Resources card out of Quick Reference into its
       own panel and embeds the Drive video preview (same layout as Demo 102)
     - pomatch.html: builds PO_DOCS (cheat sheet + full script) from PO Match Docs/*.md via md-lite,
       inserts them between OTT-PODOCS markers, and renders them as printable in-page content
       (screenshot links hydrate from the page's embedded IMG map). Video stays "coming soon".
     - demo102.html: already standard — reports and exits.
   Re-runnable; re-run pomatch after editing the .md files. */
const fs = require('fs');
const path = require('path');
const { mdToHtml } = require('./md-lite.js');
const file = process.argv[2];
if (!file) { console.error('usage: node inject-scripts-tab.js <dashboard.html>'); process.exit(1); }
const ROOT = path.join(__dirname, '..');
const fp = path.join(ROOT, file);
let h = fs.readFileSync(fp, 'utf8');
const base = path.basename(file, '.html');
const report = [];
const cut = (s, label) => { const i = h.indexOf(s); if (i < 0) throw new Error(label + ': anchor missing'); if (h.indexOf(s, i + 1) >= 0) throw new Error(label + ': anchor not unique'); h = h.slice(0, i) + h.slice(i + s.length); };
const rep = (a, b, label) => { const i = h.indexOf(a); if (i < 0) throw new Error(label + ': anchor missing'); if (h.indexOf(a, i + 1) >= 0) throw new Error(label + ': anchor not unique'); h = h.slice(0, i) + b + h.slice(i + a.length); };

/* ---- tab position: right after Quick Reference ---- */
function moveScriptsTabAfterQuickRef(tabHtml) {
  const qr = h.match(/\n(\s*)<button class="ref-tab active" onclick="switchRefTab\(this,'ref-quickref'\)">[^\n]*<\/button>/);
  if (!qr) throw new Error('quick reference tab not found');
  const existing = h.match(/\n\s*<button class="ref-tab" onclick="switchRefTab\(this,'ref-scripts'\)">[^\n]*<\/button>/);
  if (existing) { h = h.replace(existing[0], ''); }
  const line = '\n' + qr[1] + tabHtml;
  const at = h.indexOf(qr[0]) + qr[0].length;
  const already = h.slice(at, at + line.length) === line;
  if (!already) h = h.slice(0, at) + line + h.slice(at);
  report.push('tab: ' + (already ? 'already 2nd' : (existing ? 'moved to 2nd (after Quick Reference)' : 'added as 2nd (after Quick Reference)')));
}

if (base === 'demo102') {
  report.push('already standard (Scripts & Videos is 2nd, own panel)');
} else if (base === 'demo-training') {
  moveScriptsTabAfterQuickRef('<button class="ref-tab" onclick="switchRefTab(this,\'ref-scripts\')">🎬 Scripts &amp; Videos</button>');
  if (!h.includes('id="ref-scripts"')) {
    // lift the navy "Demo Script & Resources" card out of Quick Reference
    const start = '    <div class="ref-panel active" id="ref-quickref">\n      <div class="card ref-no-print" style="background:var(--navy);color:white;margin-bottom:1rem;">';
    const a = h.indexOf(start); if (a < 0) throw new Error('quickref script card not found');
    const cardStart = a + '    <div class="ref-panel active" id="ref-quickref">\n'.length;
    const cardEnd = h.indexOf('      </div>\n', h.indexOf('⚠️ Internal use only', cardStart)) + '      </div>\n'.length;
    const card = h.slice(cardStart, cardEnd);
    h = h.slice(0, cardStart) + h.slice(cardEnd);
    const driveId = (card.match(/drive\.google\.com\/file\/d\/([^/]+)\//) || [])[1];
    const panel = '    <!-- SCRIPTS & VIDEOS -->\n    <div class="ref-panel" id="ref-scripts">\n'
      + card.replace('📽️ Demo Script &amp; Resources', '📝 Demo Script &amp; Resources')
      + (driveId ? '      <div class="card">\n        <div class="card-title">🎬 Core AP + Statements — Full Demo Video</div>\n        <div class="video-wrap"><iframe src="https://drive.google.com/file/d/' + driveId + '/preview" style="width:100%;aspect-ratio:16/9;border:none;border-radius:8px;" allow="autoplay" allowfullscreen></iframe></div>\n        <div style="display:flex;justify-content:flex-end;margin-top:0.5rem;"><a href="https://drive.google.com/file/d/' + driveId + '/view?usp=sharing" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">↗ Open in Drive</a></div>\n        <p style="font-size:0.84rem;color:var(--gray4);margin-top:0.25rem;">Complete run-through of the Core AP + Statements demo. Watch before your first live demo.</p>\n      </div>\n' : '')
      + '    </div>\n\n';
    h = h.slice(0, a) + panel + h.slice(a);
    report.push('panel: created #ref-scripts (script card moved out of Quick Reference' + (driveId ? ', Drive video embedded' : '') + ')');
    if (!h.includes('.video-wrap')) { h = h.replace('</style>', '.video-wrap { width:100%; }\n.video-wrap iframe, .video-wrap video { width:100%; aspect-ratio:16/9; border:none; border-radius:8px; background:#000; }\n</style>'); report.push('css: .video-wrap added'); }
  } else report.push('panel: already present');
} else if (base === 'pomatch') {
  moveScriptsTabAfterQuickRef('<button class="ref-tab" onclick="switchRefTab(this,\'ref-scripts\')">🎬 Scripts &amp; Videos</button>');
  // 1. build STANDALONE documents from the markdown (opened in a new tab from the dashboard,
  //    like Demo 101/102's Google Doc buttons). Screenshots reference the real files in pomatch-assets/.
  const docsDir = path.join(ROOT, 'PO Match Docs');
  const assetsDir = path.join(ROOT, 'pomatch-assets');
  const imageSrc = (file) => fs.existsSync(path.join(assetsDir, file)) ? '../pomatch-assets/' + encodeURIComponent(file) : null;
  const DOCS = [
    { md: 'Ottimate-PO-Match-Demo-Script.md',      html: 'Ottimate-PO-Match-Demo-Script.html',      title: 'Demo 201 — PO Match · Demo Script & Walk-Through', other: 'Ottimate-PO-Match-Demo-Cheat-Sheet.html', otherLabel: '📋 Cheat Sheet' },
    { md: 'Ottimate-PO-Match-Demo-Cheat-Sheet.md', html: 'Ottimate-PO-Match-Demo-Cheat-Sheet.html', title: 'Demo 201 — PO Match · Live-Demo Cheat Sheet',       other: 'Ottimate-PO-Match-Demo-Script.html',      otherLabel: '📜 Full Demo Script' },
  ];
  // Sections rendered as a one-step-at-a-time click-through instead of one long scroll.
  const STEPPED = { 'The talk track': 'Segment', 'Demo walk-through (screenshots)': 'Screen' };
  // Short tab labels (the full heading still titles the section).
  const TAB_LABEL = { 'How this script is built (the method)':'🧭 Method', 'Know the room — WIIFM by persona':'👥 WIIFM', 'Pre-demo discovery (ask before you share your screen)':'🔍 Discovery',
    'Scenario map (demo environment)':'🗺️ Scenarios', 'Demo flow at a glance':'📋 Flow', 'The talk track':'🎤 Talk Track', 'Optional capabilities — the menu':'🧩 Optional Capabilities',
    'Guardrails — harmful habits & words to avoid':'⛔ Guardrails', 'Objection & Q&A handling':'🛡️ Objections', 'Demo walk-through (screenshots)':'🖥️ Walk-Through',
    'Discovery → what it unlocks':'🔍 Discovery', 'Core flow (the spine — always run this)':'▶️ Core Flow', 'The menu (pull out only on the signal)':'🧩 Optional Capabilities', 'Guardrails (say / don\'t say)':'⛔ Guardrails' };
  const plain = (t) => t.replace(/\*([^*]+)\*/g, '$1').replace(/\*\*/g, '').trim();
  const slugify = (t) => plain(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function splitMd(md, level) {
    const re = new RegExp('^' + '#'.repeat(level) + ' +(.*)$', 'gm');
    const marks = [...md.matchAll(re)];
    const intro = marks.length ? md.slice(0, marks[0].index) : md;
    const parts = marks.map((m, i) => ({
      title: m[1].trim(),
      body: md.slice(m.index + m[0].length, i + 1 < marks.length ? marks[i + 1].index : md.length),
    }));
    return { intro, parts };
  }
  const DOC_CSS = ':root{--navy:#0A2E4A;--accent:#4F46E5;--accent-light:#EEF0FD;--accent-dark:#3730A3;--gray1:#F8F9FA;--gray2:#E9ECEF;--gray3:#ADB5BD;--gray4:#6C757D;--gray5:#343A40;--green:#27AE60;--orange:#F39C12;--orange-light:#FEF9E7;}'
    + '*{box-sizing:border-box;}html{font-size:15px;}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--gray5);background:var(--gray1);}'
    + '.top{position:sticky;top:0;z-index:20;background:linear-gradient(135deg,#0A2E4A,var(--accent-dark));color:#fff;padding:0.9rem 1.5rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;}'
    + '.top .t{font-weight:800;font-size:1rem;}.top .s{font-size:0.78rem;opacity:0.8;margin-top:0.15rem;}.top .a{display:flex;gap:0.5rem;flex-wrap:wrap;}'
    + '.btn{display:inline-block;font-size:0.8rem;font-weight:700;padding:0.4rem 0.85rem;border-radius:8px;text-decoration:none;cursor:pointer;border:1px solid rgba(255,255,255,0.5);color:#fff;background:rgba(255,255,255,0.12);}.btn:hover{background:rgba(255,255,255,0.22);}'
    + '.tabs{position:sticky;top:58px;z-index:19;background:#fff;border-bottom:1px solid var(--gray2);padding:0.6rem 1.25rem;display:flex;gap:0.4rem;flex-wrap:wrap;}'
    + '.tab{font-size:0.8rem;font-weight:600;color:var(--gray5);background:#fff;border:1.5px solid var(--gray2);border-radius:100px;padding:0.35rem 0.85rem;cursor:pointer;white-space:nowrap;}'
    + '.tab:hover{border-color:var(--accent);color:var(--accent);}.tab.active{background:var(--accent);border-color:var(--accent);color:#fff;}'
    + '.wrap{max-width:940px;margin:1.25rem auto;padding:0 1.25rem 4rem;}'
    + '.panel{display:none;}.panel.active{display:block;}'
    + '.doc{background:#fff;border:1px solid var(--gray2);border-radius:10px;padding:1.4rem 1.75rem;font-size:0.92rem;line-height:1.65;}'
    + '.doc h1{font-size:1.4rem;color:var(--navy);margin:0 0 0.5rem;}.doc h2{font-size:1.2rem;font-weight:800;color:var(--navy);margin:0 0 0.75rem;}'
    + '.doc h3{font-size:1rem;font-weight:700;color:var(--accent-dark);margin:1.1rem 0 0.4rem;}.doc h4{font-size:0.92rem;font-weight:700;margin:0.9rem 0 0.3rem;}'
    + '.doc p{margin:0 0 0.65rem;}.doc ul,.doc ol{margin:0 0 0.75rem 1.3rem;padding:0;}.doc li{margin-bottom:0.3rem;}'
    + '.doc blockquote{margin:0.5rem 0 0.9rem;padding:0.65rem 1rem;border-left:4px solid var(--accent);background:var(--accent-light);border-radius:0 8px 8px 0;font-style:italic;}'
    + '.doc hr{border:none;border-top:1px dashed var(--gray2);margin:1.1rem 0;}.doc code{font-size:0.85em;background:var(--gray1);padding:0.05rem 0.3rem;border-radius:4px;}'
    + '.doc-table-wrap{overflow-x:auto;margin:0.4rem 0 1rem;}.doc-table{width:100%;border-collapse:collapse;font-size:0.85rem;}'
    + '.doc-table th{background:var(--gray1);text-align:left;padding:0.5rem 0.65rem;border-bottom:2px solid var(--gray2);}.doc-table td{padding:0.5rem 0.65rem;border-bottom:1px solid var(--gray2);vertical-align:top;}'
    + '.doc-fig{margin:0.6rem 0 1rem;}.doc-fig img{display:block;width:100%;border:1px solid var(--gray2);border-radius:8px;background:#fff;}'
    + '.doc-fig figcaption{font-size:0.78rem;color:var(--gray4);margin-top:0.35rem;text-align:center;}.doc-shot-ref{color:var(--gray4);font-size:0.86rem;}'
    + '.steps{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin:0 0 1rem;padding-bottom:0.85rem;border-bottom:1px solid var(--gray2);}'
    + '.spill{font-size:0.76rem;font-weight:700;color:var(--gray4);background:var(--gray1);border:1.5px solid var(--gray2);border-radius:100px;min-width:1.9rem;height:1.9rem;padding:0 0.5rem;cursor:pointer;}'
    + '.spill:hover{border-color:var(--accent);color:var(--accent);}.spill.active{background:var(--accent);border-color:var(--accent);color:#fff;}'
    + '.snav{display:flex;justify-content:space-between;align-items:center;gap:0.75rem;margin-top:1.25rem;padding-top:0.85rem;border-top:1px solid var(--gray2);}'
    + '.snav .btn{border-color:var(--accent);color:var(--accent);background:#fff;}.snav .btn:hover{background:var(--accent-light);}.snav .btn[disabled]{opacity:0.4;pointer-events:none;}'
    + '.scount{font-size:0.8rem;font-weight:600;color:var(--gray4);}'
    + '.step{display:none;}.step.active{display:block;}'
    + '@media print{body{background:#fff;}.top,.tabs,.steps,.snav{display:none !important;}.wrap{max-width:none;margin:0;padding:0;}'
    + '.doc{border:none;padding:0;font-size:10.5pt;}.panel{display:block !important;}.step{display:block !important;}'
    + '.panel + .panel{break-before:page;}.doc h2{break-after:avoid;}table,blockquote,.doc-fig{break-inside:avoid;}.doc-fig img{max-height:4in;object-fit:contain;}}';
  const DOC_JS = 'function docTab(id){document.querySelectorAll(".tab").forEach(function(b){b.classList.toggle("active",b.dataset.for===id);});'
    + 'document.querySelectorAll(".panel").forEach(function(p){p.classList.toggle("active",p.id===id);});window.scrollTo(0,0);'
    + 'if(history.replaceState)history.replaceState(null,"","#"+id);}'
    + 'function docStep(sec,i){var p=document.getElementById(sec);if(!p)return;var steps=p.querySelectorAll(".step");if(i<0||i>=steps.length)return;'
    + 'steps.forEach(function(s,n){s.classList.toggle("active",n===i);});p.querySelectorAll(".spill").forEach(function(b,n){b.classList.toggle("active",n===i);});'
    + 'var prev=p.querySelector(".s-prev"),next=p.querySelector(".s-next"),c=p.querySelector(".scount");'
    + 'if(prev)prev.disabled=(i===0);if(next)next.disabled=(i===steps.length-1);if(c)c.textContent=(i+1)+" of "+steps.length;'
    + 'p.scrollIntoView({block:"start"});}'
    + 'document.addEventListener("DOMContentLoaded",function(){var h=location.hash.slice(1);if(h&&document.getElementById(h))docTab(h);'
    + 'document.querySelectorAll(".panel .steps").forEach(function(s){docStep(s.parentElement.id,0);});});';
  for (const d of DOCS) {
    const md = fs.readFileSync(path.join(docsDir, d.md), 'utf8');
    const { intro, parts } = splitMd(md, 2);
    const mdOpts = { imageSrc, docLinks: { [d.other.replace('.html', '.md')]: d.other }, idPrefix: 'doc' };
    const tabs = [], panels = [];
    // Overview panel = everything before the first H2 (title, framing, demo environment)
    tabs.push({ id: 'overview', label: '📖 Overview' });
    panels.push('<div class="panel active" id="overview"><div class="doc">' + mdToHtml(intro, mdOpts) + '</div></div>');
    for (const p of parts) {
      const id = slugify(p.title);
      const key = Object.keys(TAB_LABEL).find((k) => plain(p.title).indexOf(k) === 0);
      tabs.push({ id, label: TAB_LABEL[key] || plain(p.title) });
      const stepKey = Object.keys(STEPPED).find((k) => plain(p.title).indexOf(k) === 0);
      if (stepKey) {
        const sub = splitMd(p.body, 3);
        const pills = sub.parts.map((s, i) => '<button class="spill' + (i === 0 ? ' active' : '') + '" onclick="docStep(\'' + id + '\',' + i + ')" title="' + plain(s.title).replace(/"/g, '&quot;') + '">' + (i + 1) + '</button>').join('');
        const steps = sub.parts.map((s, i) => '<div class="step' + (i === 0 ? ' active' : '') + '"><h3>' + mdToHtml('### ' + s.title, mdOpts).replace(/<\/?h3[^>]*>/g, '') + '</h3>' + mdToHtml(s.body, mdOpts) + '</div>').join('');
        panels.push('<div class="panel" id="' + id + '"><div class="doc"><h2>' + plain(p.title) + '</h2>'
          + (sub.intro.trim() ? mdToHtml(sub.intro, mdOpts) : '')
          + '<div class="steps"><span class="scount">1 of ' + sub.parts.length + '</span>' + pills + '</div>'
          + steps
          + '<div class="snav"><button class="btn s-prev" onclick="docStep(\'' + id + '\',[].indexOf.call(this.closest(\'.panel\').querySelectorAll(\'.step\'),this.closest(\'.panel\').querySelector(\'.step.active\'))-1)">← Previous ' + STEPPED[stepKey] + '</button>'
          + '<button class="btn s-next" onclick="docStep(\'' + id + '\',[].indexOf.call(this.closest(\'.panel\').querySelectorAll(\'.step\'),this.closest(\'.panel\').querySelector(\'.step.active\'))+1)">Next ' + STEPPED[stepKey] + ' →</button></div>'
          + '</div></div>');
      } else {
        panels.push('<div class="panel" id="' + id + '"><div class="doc"><h2>' + plain(p.title) + '</h2>' + mdToHtml(p.body, mdOpts) + '</div></div>');
      }
    }
    const page = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + d.title + '</title>\n'
      + '<!-- GENERATED by _shared/inject-scripts-tab.js from ' + d.md + ' — do not hand-edit; edit the .md and re-run `node _shared/inject-scripts-tab.js pomatch.html`. -->\n'
      + '<style>' + DOC_CSS + '</style>\n</head>\n<body>\n'
      + '<div class="top"><div><div class="t">' + d.title + '</div><div class="s">Internal use only · Ottimate Sales Enablement</div></div>'
      + '<div class="a"><a class="btn" href="' + d.other + '">' + d.otherLabel + '</a><a class="btn" href="#" onclick="window.print();return false;">🖨️ Print all</a><a class="btn" href="../pomatch.html">← Back to Demo 201</a></div></div>\n'
      + '<div class="tabs">' + tabs.map((t, i) => '<button class="tab' + (i === 0 ? ' active' : '') + '" data-for="' + t.id + '" onclick="docTab(\'' + t.id + '\')">' + t.label + '</button>').join('') + '</div>\n'
      + '<div class="wrap">\n' + panels.join('\n') + '\n</div>\n'
      + '<script>' + DOC_JS + '<' + '/script>\n</body>\n</html>\n';
    fs.writeFileSync(path.join(docsDir, d.html), page);
    report.push('doc: ' + d.html + ' — ' + tabs.length + ' tabs' + (page.match(/class="step /g) ? '' : '') + ' (' + (page.length / 1024).toFixed(0) + ' KB)');
  }
  // 2. remove the previously embedded docs block, if any
  const S = '/* OTT-PODOCS:START', E = '/* OTT-PODOCS:END */';
  if (h.includes(S)) { const a = h.indexOf(S), b = h.indexOf(E) + E.length; let end = b; while (h[end] === '\n') end++; h = h.slice(0, a) + h.slice(end); report.push('embedded PO_DOCS block: removed'); }
  // 3. panel: links only (opens the standalone documents in a new tab) + video status
  const panelStart = '    <div class="ref-panel" id="ref-scripts">';
  const a = h.indexOf(panelStart); if (a < 0) throw new Error('scripts panel not found');
  const b = h.indexOf('    </div>`;', a); if (b < 0) throw new Error('scripts panel end not found');
  const linksPanel = panelStart + '<div class="card">\n'
    + '      ${refHead(\'🎬 Scripts &amp; Videos\',\'ref-scripts\')}\n'
    + '      <p class="body-text">The code-verified Demo 201 script and the one-page cheat sheet open in a new tab — read them before every live demo.</p>\n'
    + '      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin:0.75rem 0 0.25rem;">\n'
    + '        <a href="PO%20Match%20Docs/Ottimate-PO-Match-Demo-Script.html" target="_blank" rel="noopener" class="btn btn-primary">📜 Open Demo Script &amp; Walk-Through →</a>\n'
    + '        <a href="PO%20Match%20Docs/Ottimate-PO-Match-Demo-Cheat-Sheet.html" target="_blank" rel="noopener" class="btn btn-secondary">📋 Open Live-Demo Cheat Sheet →</a>\n'
    + '      </div>\n'
    + '      <p class="text-muted" style="font-size:0.78rem;margin-top:0.5rem;">⚠️ Internal use only. Do not share externally. Both documents are printable from the page.</p>\n'
    + '      <div class="info-box tip" style="margin-top:1rem;"><div class="info-box-title">🎥 Demo video — coming soon</div>A recorded PO Match walkthrough will be added here. (Existing recordings show an older UI and are being refreshed.)</div>\n'
    + '    </div>\n';
  h = h.slice(0, a) + linksPanel + h.slice(b);
  report.push('panel: links-only (script + cheat sheet open in a new tab)');
} else { console.error('not a demo dashboard: ' + file); process.exit(2); }

fs.writeFileSync(fp, h);
console.log(file + ':\n  ' + report.join('\n  '));
