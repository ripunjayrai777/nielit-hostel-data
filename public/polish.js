/* Home polish: full-width desktop layout, quick actions, loading skeleton, entrance and chart animations.
   Add a script tag with src="polish.js" as the LAST script before the closing body tag in public/index.html */
(() => {
  const q = s => document.querySelector(s);
  document.head.insertAdjacentHTML('beforeend', `<style>
/* ---- full width on desktop ---- */
@media(min-width:900px){main{max-width:none;margin:0 0 0 196px;padding:24px 32px}main>*{max-width:none!important}.ft{max-width:none}}
/* ---- hero ---- */
.hero{animation:rise .5s cubic-bezier(.2,.8,.2,1) backwards}
@media(min-width:760px){.hero{display:grid;grid-template-columns:minmax(240px,auto) 1fr;gap:4px 36px;align-items:center;padding:22px 26px}.hero .dt{grid-column:1;grid-row:1}.hero .hnum{grid-column:1;grid-row:2;margin-top:2px}.hero .mu{grid-column:2;grid-row:1;align-self:end}.hero .pbar{grid-column:2;grid-row:2;margin-top:0;align-self:center;height:10px}}
.pbar i{animation:reveal .9s .25s cubic-bezier(.2,.8,.2,1) backwards}
/* ---- quick actions ---- */
.qa{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;animation:rise .5s .06s cubic-bezier(.2,.8,.2,1) backwards}.qa .btn{flex:1 1 150px}@media(min-width:760px){.qa .btn{flex:0 0 auto}}
/* ---- chart grid layout ---- */
.cg{gap:16px}.cg .card{padding:16px 18px;transition:transform .2s,box-shadow .2s;animation:rise .55s cubic-bezier(.2,.8,.2,1) backwards}
.cg>.card:nth-child(1){animation-delay:.10s}.cg>.card:nth-child(2){animation-delay:.16s}.cg>.card:nth-child(3){animation-delay:.22s}.cg>.card:nth-child(4){animation-delay:.28s}.cg~.card{animation:rise .55s .34s cubic-bezier(.2,.8,.2,1) backwards}
@media(min-width:760px){.cg{grid-template-columns:repeat(12,minmax(0,1fr))}.cg>.card{grid-column:span 6}.cg>.card.wide{grid-column:span 12}.cg>.card:nth-child(4){grid-column:span 12}}
@media(min-width:1100px){.cg>.card:nth-child(1){grid-column:span 8}.cg>.card:nth-child(2){grid-column:span 4}.cg>.card:nth-child(3),.cg>.card:nth-child(4){grid-column:span 6}.stk{max-width:56px!important}.bars{height:200px}}
@media(hover:hover){.cg .card:hover{transform:translateY(-2px);box-shadow:0 8px 24px #0f3d3e22}}
/* ---- chart animations ---- */
.stk{transform-origin:bottom;animation:grow .7s cubic-bezier(.2,.8,.2,1) backwards;animation-delay:calc(var(--i,0) * 35ms + .2s)}
.bcol{transition:filter .15s}.bcol:hover .stk{filter:brightness(1.1)}.bars .bcol:last-child{background:linear-gradient(0deg,var(--sel),transparent 85%);border-radius:8px 8px 0 0}
.gt{animation:reveal .9s .25s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}@keyframes grow{from{transform:scaleY(0)}}@keyframes reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
/* ---- loading skeleton ---- */
.sk-l,.sk-b{border-radius:6px;background:linear-gradient(90deg,var(--sel) 25%,var(--bd) 37%,var(--sel) 63%);background-size:400% 100%;animation:shim 1.3s ease infinite}.sk-l{height:12px;margin:14px 0}.sk-b{height:120px;margin-top:16px;border-radius:10px}@keyframes shim{from{background-position:100% 0}to{background-position:0 0}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
</style>`);
  const QA = '<div class="qa"><button class="btn" onclick="go(\'att\')">Mark today\'s attendance</button><button class="btn ghost" onclick="go(\'leave\')">Add leave</button><button class="btn ghost" onclick="go(\'comp\')">New complaint</button></div>';
  const SKEL = '<div class="cg sk" aria-hidden="true"><div class="card wide"><div class="sk-l" style="width:30%"></div><div class="sk-b"></div></div><div class="card"><div class="sk-l" style="width:50%"></div><div class="sk-l"></div><div class="sk-l"></div></div><div class="card"><div class="sk-l" style="width:40%"></div><div class="sk-l"></div></div><div class="card"><div class="sk-l" style="width:40%"></div><div class="sk-l"></div></div></div>';
  const calm = () => window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  const countUp = el => {
    if (el.dataset.d) return; el.dataset.d = 1;
    const to = +el.textContent; if (!to || calm()) return;
    const t0 = performance.now(), step = t => { const p = Math.min(1, (t - t0) / 700); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    el.textContent = 0; requestAnimationFrame(step);
  };
  function tick() {
    const main = q('#main'); if (!main) return;
    const hero = q('.hero'); if (!hero) return;
    if (!q('.qa')) hero.insertAdjacentHTML('afterend', QA);
    const qa = q('.qa'); if (hero.nextElementSibling !== qa) hero.after(qa);   // keep order: hero, actions, charts
    const n = hero.querySelector('.hnum span'); if (n) countUp(n);
    const real = q('#cg'), sk = q('.cg.sk');
    if (real && sk) sk.remove();
    else if (!real && !sk && typeof tab !== 'undefined' && tab === 'dash') {
      q('.qa').insertAdjacentHTML('afterend', SKEL);
      setTimeout(() => { const s = q('.cg.sk'); if (s) s.remove(); }, 7000);
    }
    document.querySelectorAll('.bars .bcol').forEach((c, i) => { if (!c.style.getPropertyValue('--i')) c.style.setProperty('--i', i); });
  }
  const main = q('#main');
  if (main) { new MutationObserver(tick).observe(main, { childList: true, subtree: true, characterData: false }); tick(); }
})();
