/* "Hostel" tab: hostel photo, at-a-glance numbers, fee structure, mess charges,
   rules and regulations (PDF view/download) and the mess menu (image view/download).
   Add a script tag with src="about.js" before the closing body tag in public/index.html */
(() => {
  // ---- Edit these values whenever something changes ----
  const ABOUT = {
    title: 'NIELIT Boys Hostel',
    subtitle: 'Gorakhpur Campus',
    image: '/hostel.jpg',            // put the hostel photo in public/hostel.jpg
    rules: '/hostel-rules.pdf',      // put the rules PDF in public/hostel-rules.pdf
    menu: '/mess-menu.jpg',          // mess menu image in public/mess-menu.jpg
    menuTitle: 'Mess menu 2026',
    fees: [{ label: '', amount: 12000 }, { label: '', amount: 15000 }],   // label example: 'Double sharing'
    messAmount: 3200,
    contacts: []                     // example: [{ label: 'Warden', value: '98xxxxxx12' }]
  };
  const q = s => document.querySelector(s);
  const inr = n => '\u20B9' + Number(n).toLocaleString('en-IN');
  document.head.insertAdjacentHTML('beforeend', `<style>
.ah{position:relative;border-radius:var(--r);overflow:hidden;min-height:190px;margin-bottom:14px;background:linear-gradient(135deg,var(--ink),#1f6f6f);color:#fff;display:flex;align-items:flex-end}
.ah img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ah::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,#000a 0,#0000 65%)}
.ahc{position:relative;z-index:1;padding:18px}.ahc h2{margin:0;font:800 clamp(24px,4vw,34px)/1.1 'Bricolage Grotesque',sans-serif}.ahc p{margin:4px 0 0;opacity:.9}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.tile{background:var(--sel);border-radius:10px;padding:12px}
.tile b{display:block;font:800 26px/1.1 'Bricolage Grotesque',sans-serif}.tile span{font-size:13px;color:var(--mu)}
.mnu{width:100%;border-radius:10px;border:1px solid var(--bd);display:block}.abtn{display:inline-flex;align-items:center;text-decoration:none;min-height:38px;padding:0 14px;border-radius:9px;font-weight:700;font-size:14px}
.abtn.p{background:var(--pr);color:#fff}.abtn.g{border:1px solid var(--bd);color:var(--lk)}.acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
@media(max-width:420px){nav button{font-size:9.5px}nav svg{width:19px;height:19px}}
</style>`);
  if (!TABS.some(t => t[0] === 'about')) TABS.push(['about', 'Hostel']);
  ICON.about = '<path d="M4 21V5l8-2 8 2v16"/><path d="M9 21v-5h6v5M8 9h2M14 9h2M8 13h2M14 13h2"/>';
  const nav = q('#nav');
  if (nav && nav.children.length) {
    nav.innerHTML = TABS.map(t => `<button id="n_${t[0]}" onclick="go('${t[0]}')"><svg viewBox="0 0 24 24">${ICON[t[0]]}</svg><span>${t[1]}</span></button>`).join('');
    const b = q('#n_' + tab); if (b) b.classList.add('on');
  }
  V.about = async function () {
    const rooms = new Set(S.map(s => s.room).filter(Boolean)).size, batches = [...new Set(S.map(s => s.batch).filter(Boolean))].sort();
    const A = ABOUT;
    q('#main').innerHTML = `<div class="ah"><img src="${A.image}" alt="${E(A.title)}" onerror="this.remove()"><div class="ahc"><h2>${E(A.title)}</h2><p>${E(A.subtitle)}</p></div></div>
<div class="card"><b>At a glance</b><div class="tiles" style="margin-top:10px"><div class="tile"><b>${S.length}</b><span>Residents</span></div><div class="tile"><b>${rooms}</b><span>Rooms occupied</span></div>${batches.length ? `<div class="tile"><b>${batches.length}</b><span>Batches (${E(batches.join(', '))})</span></div>` : ''}</div></div>
<div class="card"><b>Fee structure</b><div class="tiles" style="margin-top:10px">${A.fees.map(f => `<div class="tile"><b>${inr(f.amount)}</b><span>per semester${f.label ? ', ' + E(f.label) : ''}</span></div>`).join('')}<div class="tile"><b>${inr(A.messAmount)}</b><span>mess charges per month</span></div></div></div>
${A.contacts.length ? `<div class="card"><b>Contact</b>${A.contacts.map(c => `<p style="margin:8px 0 0"><span class="mu">${E(c.label)}</span><br>${E(c.value)}</p>`).join('')}</div>` : ''}
<div class="card"><b>Rules and regulations</b><p class="mu" style="margin:6px 0 0">Official hostel rules for residents.</p><div class="acts" id="rulesActs"></div></div>
<div class="card"><b>${E(A.menuTitle)}</b><div style="margin-top:10px"><a href="${A.menu}" target="_blank" rel="noopener"><img class="mnu" src="${A.menu}" alt="${E(A.menuTitle)}" loading="lazy"></a></div><div class="acts"><a class="abtn p" href="${A.menu}" target="_blank" rel="noopener">Open full size</a><a class="abtn g" href="${A.menu}" download="NIELIT-Mess-Menu-2026.jpg">Download</a></div></div>`;
    let ok = false; try { ok = (await fetch(A.rules, { method: 'HEAD' })).ok; } catch (e) {}
    const box = q('#rulesActs'); if (!box) return;
    box.innerHTML = ok ? `<a class="abtn p" href="${A.rules}" target="_blank" rel="noopener">View PDF</a><a class="abtn g" href="${A.rules}" download="NIELIT-Hostel-Rules.pdf">Download PDF</a>` : `<span class="mu">The rules PDF is not added yet. Save it as public/hostel-rules.pdf and deploy.</span>`;
  };
})();
