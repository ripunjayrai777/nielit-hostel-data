/* Stats charts for the Home tab (dependency-free).
   Add a script tag with src="charts.js" before the closing body tag in public/index.html */
(() => {
  const q = s => document.querySelector(s);
  document.head.insertAdjacentHTML('beforeend', `<style>
.cg{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-bottom:14px}.cg .card{margin:0}.cg .wide{grid-column:1/-1}
.ct{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px}.ct b{font:700 16px 'Bricolage Grotesque',sans-serif}.ct span{font-size:12.5px;color:var(--mu)}
.bars{display:flex;align-items:flex-end;gap:5px;height:170px;border-bottom:1px solid var(--bd);padding-top:20px}
.bcol{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
.bn{font-size:11px;font-weight:700;margin-bottom:2px}.stk{width:100%;max-width:36px;display:flex;flex-direction:column;border-radius:6px 6px 0 0;overflow:hidden}.stk i{display:block}.stk .l{background:var(--wa)}.stk .a{background:var(--no)}
.bx{display:flex;gap:5px;margin-top:5px}.bx span{flex:1;min-width:0;text-align:center;font-size:11px;line-height:1.2;color:var(--mu)}.bx .td{color:var(--lk);font-weight:700}.bx small{font-size:9.5px}
.lgd{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:12.5px;color:var(--mu)}.lgd i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}
.gr{display:grid;grid-template-columns:104px 1fr auto;gap:10px;align-items:center;margin:10px 0;font-size:14px}.gr .gl{font-weight:600;line-height:1.2}.gr .gv{font-size:13px;color:var(--mu);white-space:nowrap}
.gt{height:14px;border-radius:99px;background:var(--sel);overflow:hidden;display:flex}.gt i{display:block;height:100%}.gw{display:flex;height:100%}
.big{font-size:15px;margin-bottom:10px}.big b{font:800 34px/1 'Bricolage Grotesque',sans-serif;margin-right:2px}
</style>`);
  let fees = [], sem = window.SEM || 1;
  const iso = (t, back) => new Date(Date.parse(t + 'T00:00:00Z') - back * 864e5).toISOString().slice(0, 10);
  const mon = d => new Date(d + 'T00:00:00Z').toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' });

  function feeBody() {
    const paid = new Set(fees.filter(f => f.sem == sem).map(f => f.roll)), n = S.filter(s => paid.has(s.roll)).length, t = S.length;
    q('#fee-body').innerHTML = `<div class="big"><b>${n}</b> of ${t} paid</div><div class="gt"><i style="flex:${n} 1 0%;background:var(--ok)"></i><i style="flex:${t - n} 1 0%"></i></div><div class="mu" style="margin-top:8px">${t - n} pending${t ? ', ' + Math.round(n / t * 100) + '% collected' : ''}</div>`;
  }
  window.chartFeeSem = v => { sem = +v; window.SEM = sem; feeBody(); };

  async function charts() {
    const [lv, A, cm, fe] = await Promise.all([api('/api/leaves'), api('/api/attendance/all'), api('/api/complaints'), api('/api/fees')]);
    if (tab !== 'dash' || !q('.hero') || !S.length) return;
    fees = fe;
    // 1) last 14 days
    const t = today(), days = [...Array(14)].map((_, i) => iso(t, 13 - i)).map(d => {
      let l = 0, a = 0;
      S.forEach(s => { const m = (A[d] || {})[s.roll] || (lv.some(x => x.roll == s.roll && covers(x, d)) ? 'L' : 'P'); if (m === 'L') l++; else if (m === 'A') a++; });
      return { d, l, a, n: l + a };
    });
    const mx = Math.max(...days.map(x => x.n)), pk = days.find(x => x.n === mx);
    const bars = days.map(x => `<div class="bcol" title="${x.d}: ${x.l} on leave, ${x.a} absent"><span class="bn">${x.n || ''}</span><div class="stk" style="height:${mx ? x.n / mx * 86 : 0}%"><i class="a" style="flex:${x.a} 1 0%"></i><i class="l" style="flex:${x.l} 1 0%"></i></div></div>`).join('');
    const lbl = days.map((x, i) => `<span class="${x.d === t ? 'td' : ''}">${+x.d.slice(8)}<br><small>${i === 0 || x.d.slice(8) === '01' || x.d === t ? mon(x.d) : '&nbsp;'}</small></span>`).join('');
    // 2) batch and branch
    const g = {}; S.forEach(s => { const k = (s.batch || 'No batch') + ' ' + (s.branch || 'No branch'); g[k] = g[k] || { n: 0, l: 0 }; g[k].n++; if (s.status === 'On Leave') g[k].l++; });
    const gk = Object.keys(g).sort(), gm = Math.max(...gk.map(k => g[k].n));
    const grp = gk.map(k => `<div class="gr"><span class="gl">${E(k)}</span><div class="gt"><div class="gw" style="width:${g[k].n / gm * 100}%"><i style="flex:${g[k].n - g[k].l} 1 0%;background:var(--ok)"></i><i style="flex:${g[k].l} 1 0%;background:var(--wa)"></i></div></div><span class="gv">${g[k].n - g[k].l} of ${g[k].n} in</span></div>`).join('');
    // 3) complaints
    const c = { Open: 0, 'In Progress': 0, Resolved: 0 }; cm.forEach(x => { if (x.status in c) c[x.status]++; });
    const cbody = cm.length ? `<div class="gt"><i style="flex:${c.Open} 1 0%;background:var(--no)"></i><i style="flex:${c['In Progress']} 1 0%;background:var(--wa)"></i><i style="flex:${c.Resolved} 1 0%;background:var(--ok)"></i></div><div class="chips"><span class="chip A">Open ${c.Open}</span><span class="chip L">In progress ${c['In Progress']}</span><span class="chip P">Resolved ${c.Resolved}</span></div>` : '<p class="mu">No complaints recorded yet.</p>';
    const old = q('#cg'); if (old) old.remove();
    q('.hero').insertAdjacentHTML('afterend', `<div class="cg" id="cg">
<div class="card wide"><div class="ct"><b>Last 14 days</b><span>${mx ? 'Peak ' + mx + ' students on ' + (+pk.d.slice(8)) + ' ' + mon(pk.d) : 'No leave or absence in this period'}</span></div><div class="bars">${bars}</div><div class="bx">${lbl}</div><div class="lgd"><span><i style="background:var(--wa)"></i>On leave</span><span><i style="background:var(--no)"></i>Absent</span></div></div>
<div class="card"><div class="ct"><b>By batch and branch</b><span>In hostel today</span></div>${grp}<div class="lgd"><span><i style="background:var(--ok)"></i>In hostel</span><span><i style="background:var(--wa)"></i>On leave</span></div></div>
<div class="card"><div class="ct"><b>Complaints</b><span>${cm.length} total</span></div>${cbody}</div>
<div class="card"><div class="ct"><b>Hostel fee</b><select onchange="chartFeeSem(this.value)" aria-label="Semester">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${n == sem ? 'selected' : ''}>Semester ${n}</option>`).join('')}</select></div><div id="fee-body"></div></div></div>`);
    feeBody();
  }
  const o = V.dash;
  V.dash = async function () { await o.apply(this, arguments); try { await charts(); } catch (e) { console.error(e); } };
})();
