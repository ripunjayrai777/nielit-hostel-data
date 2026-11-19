/* Leave tab -> sub-section "Permanent leave": record a student vacating the hostel for good,
   refund category and amount as per the NIELIT hostel fee refund SOP, checklist, status, undo.
   Add a script tag with src="exits.js" AFTER camera.js, before the closing body tag. */
(() => {
  const q = s => document.querySelector(s);
  document.head.insertAdjacentHTML('beforeend', `<style>
.subtabs{display:inline-flex;border:1px solid var(--bd);border-radius:10px;overflow:hidden;margin-bottom:14px;background:var(--card)}.subtabs button{border:0;background:none;color:var(--mu);padding:9px 16px;font-weight:700}.subtabs button+button{border-left:1px solid var(--bd)}.subtabs .on{background:var(--sel);color:var(--lk)}
.fl{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:700;color:var(--mu)}.fl input,.fl select{font-weight:400;color:var(--tx)}.row>.fl{flex:1;min-width:140px}
.chk{display:flex;flex-wrap:wrap;gap:8px 18px;margin:6px 0 12px}.chk label{display:flex;align-items:center;gap:7px;font-size:14px}.chk input{min-height:0;width:18px;height:18px}
.rt{width:100%;margin:8px 0}.rt td{padding:5px 0;border:0}.rt td:last-child{text-align:right;font-weight:700}.rt tr.tot td{border-top:1px solid var(--bd);padding-top:8px;font-size:16px}
.cth{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px}.cth b{font:700 16px 'Bricolage Grotesque',sans-serif}.cth span{font-size:12.5px;color:var(--mu)}
.cmp{border-bottom:1px solid var(--bd)}.cmp:last-child{border:0}.cmp summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;gap:4px 12px;align-items:center;padding:12px 2px}.cmp summary::-webkit-details-marker{display:none}
.cno{font:700 12.5px 'Bricolage Grotesque',sans-serif;background:var(--sel);padding:4px 9px;border-radius:8px;white-space:nowrap}.cin{min-width:0}.cin b{display:block;font-size:14.5px}.cin small{display:block;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbody{padding:4px 2px 16px;display:grid;gap:14px}.cbody h4{margin:0 0 6px;font-size:12.5px;color:var(--mu);font-weight:700}.cbody p{margin:0;white-space:pre-wrap}.cimg{max-width:min(100%,320px);border-radius:10px;border:1px solid var(--bd);display:block}.res{border:1px solid var(--bd);border-radius:10px;padding:12px;background:var(--sel)}.cpv{display:flex;align-items:center;gap:12px;margin-top:8px}.cpv img{max-height:110px;max-width:60%;border-radius:8px;border:1px solid var(--bd)}
.tag.x1{background:var(--wab);color:var(--wa)}.tag.x2{background:var(--sel);color:var(--lk)}.tag.x3{background:var(--okb);color:var(--ok)}
@media(max-width:560px){.cmp summary{grid-template-columns:1fr auto}.cmp .cin{grid-column:1/-1;order:3}}
</style>`);
  const inr = n => '\u20B9' + Number(n || 0).toLocaleString('en-IN');
  const fd = d => d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '-';
  const say = m => { if (typeof toast === 'function') toast(m); };
  const ST = { 'Under process': 'x1', 'Approved': 'x2', 'Refunded': 'x3' };
  // same rule as the server and the SOP: <=10 days I, 11-45 days II, >45 days III
  const calc = (al, ap, fee, mo) => {
    if (!al || !ap) return null;
    const days = Math.round((Date.parse(ap + 'T00:00:00Z') - Date.parse(al + 'T00:00:00Z')) / 864e5);
    if (days < 0) return { err: 'Application date is before the allotment date.' };
    const cat = days <= 10 ? 'I' : days <= 45 ? 'II' : 'III', processing = cat === 'III' ? 0 : 1000, deduction = cat === 'II' ? 2 * mo : 0;
    return { days, category: cat, processing, deduction, refund: cat === 'III' ? 0 : Math.max(0, fee - processing - deduction) };
  };
  const table = (c, fee) => `<table class="rt"><tr><td>Hostel fee paid</td><td>${inr(fee)}</td></tr>${c.category === 'III' ? '<tr><td>No refund of hostel fee (after 45 days)</td><td>\u2212 ' + inr(fee) + '</td></tr>' : `<tr><td>Processing fee</td><td>\u2212 ${inr(c.processing)}</td></tr>${c.category === 'II' ? `<tr><td>Two months' hostel charge</td><td>\u2212 ${inr(c.deduction)}</td></tr>` : ''}`}<tr class="tot"><td>Refundable hostel fee</td><td>${inr(c.refund)}</td></tr></table>`;
  const sw = on => `<div class="subtabs"><button class="${on ? '' : 'on'}" onclick="LSUB='';V.leave()">Temporary leave</button><button class="${on ? 'on' : ''}" onclick="LSUB='exit';V.leave()">Permanent leave</button></div>`;
  const oldLeave = V.leave;
  V.leave = async function () {
    if (window.LSUB === 'exit') return exitView();
    await oldLeave.apply(this, arguments); q('#main').insertAdjacentHTML('afterbegin', sw(false));
  };
  const oq = window.quickLeave; window.quickLeave = r => { window.LSUB = ''; oq(r); };

  const chk = (p, o) => `<div class="chk">${[['appRcvd', 'Withdrawal application'], ['receipt', 'Fee receipt copy'], ['noDues', 'No Dues Certificate'], ['bank', 'Bank account details']].map(([k, t]) => `<label><input type="checkbox" id="${p}${k}" ${o && o[k] ? 'checked' : ''}>${t}</label>`).join('')}</div>`;
  const item = e => `<details class="cmp" ${e.id === window.XOPEN ? 'open' : ''}><summary><span class="cno">${E(e.roll.startsWith('TMP-') ? '-' : e.roll)}</span><span class="cin"><b>${E(e.room || '-')} \u00B7 ${E(e.name)}</b><small>Left ${fd(e.exitDate)}, Category ${e.category}, refund ${inr(e.refund)}</small></span><span class="tag ${ST[e.status] || 'x1'}">${E(e.status)}</span></summary>
<div class="cbody"><div><h4>Refund calculation (SOP Category ${e.category}, ${e.days} days after allotment)</h4>${table(e, e.feePaid)}<p class="mu">Allotment ${fd(e.allotDate)}, application received ${fd(e.appDate)}, vacated ${fd(e.exitDate)}. Security deposit is refunded separately after a valid No Dues Certificate.</p></div>
<div><h4>Reason</h4><p>${e.reason ? E(e.reason) : '<span class="mu">Not recorded.</span>'}</p></div>
<div><h4>Withdrawal application</h4>${e.image ? `<a href="${up(e.image)}" target="_blank"><img class="cimg" loading="lazy" src="${up(e.image)}" alt="Application"></a>` : '<p class="mu">No photo attached.</p>'}</div>
<div class="res"><h4>Process</h4>${chk('k_' + e.id + '_', e)}<div class="row"><label class="fl">Status<select id="s_${e.id}">${['Under process', 'Approved', 'Refunded'].map(s => `<option ${e.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label class="fl">Refund paid on<input type="date" id="d_${e.id}" value="${e.refundDate || ''}"></label></div>
<div class="row"><label class="fl">Hostel fee paid (\u20B9)<input id="f_${e.id}" inputmode="numeric" value="${e.feePaid}"></label><label class="fl">Monthly hostel charge (\u20B9)<input id="m_${e.id}" inputmode="numeric" value="${e.monthly}"></label></div>
<textarea id="r_${e.id}" rows="2" placeholder="Remarks">${E(e.remarks || '')}</textarea><div class="row" style="margin:10px 0 0"><button class="btn" onclick="saveExit('${e.id}')">Save</button><button class="btn ghost" onclick="undoExit('${e.id}')">Undo (re-admit student)</button></div></div></div></details>`;

  async function exitView() {
    const [ex, fees] = await Promise.all([api('/api/exits'), api('/api/fees')]);
    window.EXFEES = fees; window.XIMG = ''; window.XMAN = false;
    q('#main').innerHTML = sw(true) + `<div class="card"><b>Record permanent leaving</b><p class="mu" style="margin:6px 0 12px">Use this when a student vacates the hostel for good. He is removed from attendance, fees and hostel counts, and the refund is worked out as per the refund SOP.</p>
<div class="row"><label class="fl">Student<select id="xr" onchange="xPick()">${opts()}</select></label></div>
<div class="row"><label class="fl">Hostel allotment date<input id="xa" type="date" oninput="xCalc()"></label><label class="fl">Withdrawal application received on<input id="xp" type="date" value="${today()}" oninput="xCalc()"></label><label class="fl">Vacating date<input id="xv" type="date" value="${today()}"></label></div>
<textarea id="xt" rows="2" placeholder="Reason for leaving"></textarea><p class="mu">Withdrawal application photo (optional). Take a live photo or upload one.</p><input id="xi" type="file" accept="image/*"><br><br>
<div class="row"><label class="fl">Hostel fee paid (\u20B9)<input id="xf" inputmode="numeric" oninput="xCalc()"></label><label class="fl">Monthly hostel charge (\u20B9)<input id="xm" inputmode="numeric" oninput="xCalc(1)"></label></div>
<p class="mu">The monthly charge is filled as fee paid divided by 6 (six months a semester). Change it if the Institute's monthly charge is different.</p>
<b style="font-size:13.5px">Documents received</b>${chk('x_', { appRcvd: false })}<div id="xprev"></div>
<div class="row" style="margin-top:12px"><button class="btn" onclick="addExit()">Record permanent leaving</button><a class="btn ghost" style="text-decoration:none;display:inline-grid;place-items:center" href="/hostel-refund-sop.pdf" target="_blank" rel="noopener">View refund SOP</a></div></div>
<div class="card"><div class="cth"><b>Students who have left</b><span>${ex.length} total</span></div>${ex.length ? ex.map(item).join('') : '<p class="empty">No student has left the hostel yet.</p>'}</div>`;
    const li = q('#xi');
    if (typeof openCam === 'function') {
      li.style.display = 'none'; const w = document.createElement('div');
      w.innerHTML = '<div class="row"><button type="button" class="btn">Take photo</button><button type="button" class="btn ghost">Upload from device</button></div><div class="cpv"></div>'; li.after(w);
      const [b1, b2] = w.querySelectorAll('button'), pv = w.querySelector('.cpv');
      const set = d => { window.XIMG = d; pv.innerHTML = d ? '<img src="' + d + '" alt="Selected photo"><button type="button" class="btn ghost sm">Remove</button>' : ''; if (d) pv.querySelector('button').onclick = () => set(''); };
      b1.onclick = () => openCam('environment', set); b2.onclick = () => li.click(); li.onchange = async () => { if (li.files[0]) { set(await shrink(li.files[0])); li.value = ''; } };
    } else li.onchange = async () => { window.XIMG = li.files[0] ? await shrink(li.files[0]) : ''; };
    xPick();
  }
  window.xPick = () => {
    const r = q('#xr').value, s = S.find(x => x.roll == r) || {}, f = (window.EXFEES || []).filter(x => x.roll == r && x.amount).sort((a, b) => b.sem - a.sem)[0];
    q('#xa').value = s.allotDate || ''; q('#xf').value = f ? f.amount : ''; window.XMAN = false; xCalc();
  };
  window.xCalc = manual => {
    if (manual) window.XMAN = true;
    const fee = +q('#xf').value || 0; if (!window.XMAN) q('#xm').value = fee ? Math.round(fee / 6) : '';
    const c = calc(q('#xa').value, q('#xp').value, fee, +q('#xm').value || 0);
    q('#xprev').innerHTML = !c ? '<p class="mu">Enter the allotment and application dates to see the refund category.</p>' : c.err ? `<p class="red">${c.err}</p>` : `<div class="res"><b>Category ${c.category}</b> <span class="mu">(${c.days} days after allotment)</span>${table(c, fee)}<p class="mu" style="margin:0">Security deposit / caution money is refunded separately after a valid No Dues Certificate.</p></div>`;
  };
  window.addExit = async () => {
    const r = q('#xr').value, s = S.find(x => x.roll == r); if (!s) return alert('Choose a student');
    if (!q('#xa').value) return alert('Hostel allotment date is required (it decides the refund category)');
    if (!confirm('Record permanent leaving of ' + s.name + '? He will be removed from the active hostel list (attendance, fees and counts). You can undo this from the list below.')) return;
    const j = await api('/api/exits', { method: 'POST', body: { roll: r, allotDate: q('#xa').value, appDate: q('#xp').value, exitDate: q('#xv').value, reason: q('#xt').value, image: window.XIMG || '', feePaid: q('#xf').value, monthly: q('#xm').value, ...Object.fromEntries(['appRcvd', 'receipt', 'noDues', 'bank'].map(k => [k, q('#x_' + k).checked])) } });
    window.XOPEN = j.id; say('Recorded. Category ' + j.category + ', refund ' + inr(j.refund)); S = await api('/api/students'); V.leave();
  };
  window.saveExit = async id => {
    await api('/api/exits/' + id, { method: 'POST', body: { status: q('#s_' + id).value, refundDate: q('#d_' + id).value, feePaid: q('#f_' + id).value, monthly: q('#m_' + id).value, remarks: q('#r_' + id).value, ...Object.fromEntries(['appRcvd', 'receipt', 'noDues', 'bank'].map(k => [k, q('#k_' + id + '_' + k).checked])) } });
    window.XOPEN = id; say('Saved'); V.leave();
  };
  window.undoExit = async id => {
    const e = (await api('/api/exits')).find(x => x.id === id); if (!e || !confirm('Re-admit ' + e.name + '? This cancels the permanent leaving record and puts the student back on the active list.')) return;
    await api('/api/exits/' + id, { method: 'DELETE' }); window.XOPEN = ''; say('Student re-admitted'); S = await api('/api/students'); V.leave();
  };
})();
