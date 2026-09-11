/* md-lite.js — tiny Markdown → HTML converter for the house docs (no dependencies).
   Handles: # headings, ---, tables, - / * lists (one nesting level), 1. lists, > quotes,
   paragraphs, **bold**, *italic*, `code`, [text](url). Everything else is escaped text.
   Options:
     imageMap  {file → embedded IMG key}: links to image files render as a collapsed
               <details> whose <img data-img="key"> is hydrated from the page's IMG map;
               unmapped image links render as plain "📷 caption".
     docLinks  {file.md → '#anchor'}: links to sibling .md files become in-page anchors. */
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function inline(s, opt){
  const imgMap = (opt && opt.imageMap) || {}, docLinks = (opt && opt.docLinks) || {};
  s = esc(s);
  // images (![alt](src)) and links ([text](url)) — the leading "!" is part of the image syntax and
  // must be consumed, not rendered.
  s = s.replace(/(!?)\[([^\]]+)\]\(([^)]+)\)/g, (m, bang, text, url) => {
    const file = url.split('/').pop();
    const isImg = bang === '!' || /\.(png|jpe?g|gif)$/i.test(url);
    if (isImg) {
      const src = (opt && opt.imageSrc) ? opt.imageSrc(file) : null;
      if (src) return `<figure class="doc-fig"><img src="${src}" alt="${text}" loading="lazy"><figcaption>${text}</figcaption></figure>`;
      const key = imgMap[file];
      if (key) return `<figure class="doc-fig"><img data-img="${key}" alt="${text}"><figcaption>${text}</figcaption></figure>`;
      return `<span class="doc-shot-ref">${text}</span>`;
    }
    if (/\.md$/i.test(url)) { const a = docLinks[file]; return a ? `<a href="${a}">${text}</a>` : text; }
    return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
  });
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

function mdToHtml(md, opt){
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = []; let i = 0;
  const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const prefix = (opt && opt.idPrefix) || 'doc';
  while (i < lines.length){
    const L = lines[i];
    if (!L.trim()){ i++; continue; }
    let m;
    if ((m = L.match(/^(#{1,6})\s+(.*)$/))){ const lvl = m[1].length; const t = inline(m[2], opt); out.push(`<h${lvl} id="${prefix}-${slug(m[2])}">${t}</h${lvl}>`); i++; continue; }
    if (/^-{3,}\s*$/.test(L)){ out.push('<hr>'); i++; continue; }
    if (/^\|/.test(L)){
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g,'').split('|').map(c => c.trim());
      const head = cells(rows[0]); const body = rows.slice(/^\|\s*:?-+/.test(rows[1]||'') ? 2 : 1);
      out.push('<div class="doc-table-wrap"><table class="doc-table"><thead><tr>' + head.map(c=>`<th>${inline(c,opt)}</th>`).join('') + '</tr></thead><tbody>'
        + body.map(r => '<tr>' + cells(r).map(c=>`<td>${inline(c,opt)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^>/.test(L)){
      const q = []; while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      out.push('<blockquote>' + q.map(x => x.trim() ? inline(x,opt) : '').join('<br>') + '</blockquote>'); continue;
    }
    if (/^\s*[-*]\s+/.test(L) || /^\s*\d+\.\s+/.test(L)){
      const ordered = /^\s*\d+\.\s+/.test(L); const tag = ordered ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))){
        const indent = lines[i].match(/^\s*/)[0].length; const text = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '');
        if (indent >= 2 && items.length) items[items.length-1].sub.push(text); else items.push({ text, sub: [] });
        i++;
      }
      out.push(`<${tag}>` + items.map(it => `<li>${inline(it.text,opt)}${it.sub.length ? '<ul>' + it.sub.map(s=>`<li>${inline(s,opt)}</li>`).join('') + '</ul>' : ''}</li>`).join('') + `</${tag}>`);
      continue;
    }
    const p = []; while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|-{3,}\s*$|\||>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) p.push(lines[i++]);
    if (p.length) out.push('<p>' + inline(p.join(' '), opt) + '</p>'); else i++;
  }
  return out.join('\n');
}
module.exports = { mdToHtml };
