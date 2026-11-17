/* Fees tab: after Save, the row gets "Update" and "Clear" buttons.
   Add a script tag with src="fees.js" before the closing body tag in public/index.html */
(() => {
  const q = s => document.querySelector(s);
  document.head.insertAdjacentHTML('beforeend', '<style>tr.fsv td:first-child{box-shadow:inset 3px 0 0 var(--ok)}.fa{display:flex;gap:6px}.btn.warn{background:transparent;color:var(--no);border:1px solid var(--no)}</style>');
  const say = m => { if (typeof toast === 'function') toast(m); };
  let FEE = {};
  const acts = r => FEE[r]
    ? `<button class="btn sm" onclick="saveFee('${r}')">Update</button><button class="btn sm warn" onclick="clearFee('${r}')">Clear</button>`
    : `<button class="btn sm" onclick="saveFee('${r}')">Save</button>`;
  const mark = r => { q('#fa_' + r).innerHTML = acts(r); q('#fr_' + r).classList.toggle('fsv', !!FEE[r]); };

  V.fee = async function () {
    const f = await api('/api/fees'), sem = window.SEM || 1; FEE = {};
    f.filter(x => x.sem == sem).forEach(x => FEE[x.roll] = x);
    q('#main').innerHTML = `<div class="card"><div class="row"><select onchange="window.SEM=+this.value;V.fee()" aria-label="Semester">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${n == sem ? 'selected' : ''}>Semester ${n}</option>`).join('')}</select><button class="btn sm" onclick="dlFee()">Download CSV</button></div>${filterBar()}
<div class="tbl"><table><tr><th>Room</th><th>Name</th><th>Paid?</th><th>Receipt no.</th><th>Date</th><th>Amount</th><th></th></tr>${filt().map(s => {
      const x = FEE[s.roll];
      return `<tr id="fr_${s.roll}" class="${x ? 'fsv' : ''}"><td>${E(s.room || '-')}</td><td>${E(s.name)}</td><td><input type="checkbox" id="p_${s.roll}" ${x ? 'checked' : ''} onchange="feeTick('${s.roll}')" aria-label="Paid"></td><td><input id="r_${s.roll}" value="${x ? E(x.receipt) : ''}" size="10" placeholder="Receipt no."></td><td><input type="date" id="d_${s.roll}" value="${x ? x.date : ''}"></td><td><input id="a_${s.roll}" value="${x ? E(x.amount) : ''}" size="6" placeholder="Amount"></td><td><div class="fa" id="fa_${s.roll}">${acts(s.roll)}</div></td></tr>`;
    }).join('')}</table></div></div>`;
  };
  window.feeTick = r => { const d = q('#d_' + r); if (q('#p_' + r).checked && !d.value) d.value = today(); };
  window.saveFee = async r => {
    const paid = q('#p_' + r).checked, receipt = q('#r_' + r).value.trim(), date = q('#d_' + r).value, amount = q('#a_' + r).value.trim(), sem = window.SEM || 1;
    if (!paid) return alert('Tick "Paid" first. To remove a saved fee record, use Clear.');
    if (!receipt || !date) return alert('Receipt no. and payment date are required');
    const had = !!FEE[r];
    await api('/api/fees', { method: 'POST', body: { roll: r, sem, paid: true, receipt, date, amount } });
    FEE[r] = { roll: r, sem, receipt, date, amount }; mark(r); say(had ? 'Fee updated' : 'Fee saved');
  };
  window.clearFee = async r => {
    const s = S.find(x => x.roll == r), sem = window.SEM || 1;
    if (!confirm('Clear the Semester ' + sem + ' fee record of ' + (s ? s.name : r) + '? Receipt details will be removed.')) return;
    await api('/api/fees', { method: 'POST', body: { roll: r, sem, paid: false } });
    delete FEE[r]; q('#p_' + r).checked = false; q('#r_' + r).value = ''; q('#d_' + r).value = ''; q('#a_' + r).value = '';
    mark(r); say('Fee record cleared');
  };
})();
