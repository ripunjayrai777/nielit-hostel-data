const express = require('express'), fs = require('fs'), path = require('path'), crypto = require('crypto');
try { fs.readFileSync('.env', 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ''); }); } catch (e) {}
const { MongoClient } = require('mongodb');
const PASS = process.env.WARDEN_PASSWORD || 'warden123', SECRET = process.env.SESSION_SECRET || 'dev-secret';
const sign = t => crypto.createHmac('sha256', SECRET).update(t).digest('hex');
const today = () => new Date(Date.now() + 19800000).toISOString().slice(0, 10);
const saveImg = async d => { if (!/^data:image\//.test(d || '')) return ''; const id = crypto.randomUUID(); await D.images.insertOne({ _id: id, data: d }); return id; };
const h = fn => (req, res) => fn(req, res).catch(e => { console.error(e); res.status(500).json({ error: 'Server error: ' + e.message }); });
let D = {};
const app = express();
app.use((q, r, n) => q.path === '/api/login' ? n() : connect().then(() => n(), e => r.status(500).json({ error: 'Database error: ' + e.message })));
app.use(express.json({ limit: '4mb' }));
const authed = req => { const t = (req.headers.authorization || '').replace('Bearer ', '') || req.query.t || ''; const [exp, sig] = t.split('.'); return !!exp && sig === sign(exp) && +exp > Date.now(); };
app.use(express.static(path.join(__dirname, '..', 'public')));
app.post('/api/login', (req, res) => { if (req.body.password !== PASS) return res.status(401).json({ error: 'Wrong password' }); const exp = Date.now() + 30 * 864e5; res.json({ token: exp + '.' + sign('' + exp) }); });
app.use('/api', (req, res, next) => authed(req) ? next() : res.status(401).json({ error: 'Login required' }));
app.get('/api/me', (q, r) => r.json({ ok: 1 }));
app.get('/api/img/:id', h(async (req, res) => { const d = await D.images.findOne({ _id: req.params.id }); if (!d) return res.status(404).end(); const m = d.data.match(/^data:(image\/[\w+.-]+);base64,(.*)$/); res.set('Content-Type', m[1]).set('Cache-Control', 'private, max-age=31536000').send(Buffer.from(m[2], 'base64')); }));
const clean = s => ({ ...s, roll: s._id, _id: undefined });
// Students
app.get('/api/students', h(async (q, r) => { const [st, lv] = await Promise.all([D.students.find().toArray(), D.leaves.find({ status: 'On Leave' }).toArray()]); const m = {}; lv.filter(l => covers(l, today())).forEach(l => m[l.roll] = l); r.json(st.map(s => ({ ...clean(s), status: m[s._id] ? 'On Leave' : 'In Hostel', leave: m[s._id] || null }))); }));
const tmp = b => 'TMP-' + (b.room || 'X').toUpperCase().replace(/[^A-Z0-9]/g, '') + '-' + (b.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
const batchOf = r => { const m = (r || '').match(/20(\d\d)/); if (!m) return ''; const y = 2000 + +m[1]; return y >= 2020 && y <= 2040 ? y + '-' + (y + 4) : ''; };
app.post('/api/students', h(async (req, res) => {
  const b = req.body, old = (b.oldRoll || '').trim().toUpperCase(), roll = (b.roll || '').trim().toUpperCase() || old || tmp(b);
  if (!/^[A-Z0-9_-]+$/.test(roll) || !(b.name || '').trim()) return res.status(400).json({ error: 'Valid roll number (letters/digits only) and name required' });
  const set = { name: b.name.trim(), batch: b.batch || batchOf(roll), branch: b.branch || '', mobile: b.mobile || '', parentMobile: b.parentMobile || '', room: b.room || '' };
  if (b.photo) set.photo = await saveImg(b.photo);
  if (old && old !== roll) {
    if (await D.students.findOne({ _id: roll })) return res.status(400).json({ error: 'This roll number already exists' });
    const o = await D.students.findOne({ _id: old }); if (!o) return res.status(400).json({ error: 'Old student not found' });
    await D.students.insertOne({ ...o, _id: roll }); await D.students.deleteOne({ _id: old });
    await D.leaves.updateMany({ roll: old }, { $set: { roll } }); await D.complaints.updateMany({ roll: old }, { $set: { roll } });
    for (const f of await D.fees.find({ roll: old }).toArray()) { await D.fees.insertOne({ ...f, _id: roll + '_' + f.sem, roll }); await D.fees.deleteOne({ _id: f._id }); }
    await D.attendance.updateMany({ ['m.' + old]: { $exists: true } }, { $rename: { ['m.' + old]: 'm.' + roll } });
  }
  const upd = { $set: set }; if (!set.photo) upd.$setOnInsert = { photo: '' };
  await D.students.updateOne({ _id: roll }, upd, { upsert: true }); res.json({ ok: 1 });
}));
app.post('/api/students/import', h(async (req, res) => {
  const F = ['batch', 'branch', 'mobile', 'parentMobile', 'room'];
  const ops = (req.body.rows || []).filter(r => (r.name || '').trim()).map(r => {
    const roll = (r.roll || '').trim().toUpperCase() || tmp(r); if (!/^[A-Z0-9_-]+$/.test(roll)) return null;
    const set = { name: r.name.trim() }; F.forEach(k => { if ((r[k] || '').trim()) set[k] = r[k].trim(); }); if (!set.batch && batchOf(roll)) set.batch = batchOf(roll);
    const ins = { photo: '' }; F.forEach(k => { if (!(k in set)) ins[k] = ''; });
    return { updateOne: { filter: { _id: roll }, update: { $set: set, $setOnInsert: ins }, upsert: true } };
  }).filter(Boolean);
  if (ops.length) await D.students.bulkWrite(ops); res.json({ imported: ops.length });
}));
app.delete('/api/students/:roll', h(async (req, res) => { await D.students.deleteOne({ _id: req.params.roll }); res.json({ ok: 1 }); }));
// Leaves (application image mandatory)
app.get('/api/leaves', h(async (q, r) => r.json((await D.leaves.find().sort({ created: -1 }).toArray()).map(l => ({ ...l, id: l._id, status: leaveStatus(l) })))));
app.post('/api/leaves', h(async (req, res) => {
  const b = req.body, roll = (b.roll || '').toUpperCase();
  if (!await D.students.findOne({ _id: roll })) return res.status(400).json({ error: 'Unknown roll number' });
  if (!/^data:image\//.test(b.image || '')) return res.status(400).json({ error: 'Leave application image is mandatory' });
  if (!b.from || !b.reason) return res.status(400).json({ error: 'From date and reason required' });
  if (b.to && b.to < b.from) return res.status(400).json({ error: 'To date cannot be before From date' });
  const clash = findClash(await D.leaves.find({ roll }).toArray(), b.from, b.to);
  if (clash) return res.status(400).json({ error: 'This student already has leave from ' + clash.from + ' to ' + (clash.returned ? prevDay(clash.returned) : (clash.to || 'open-ended (not marked Returned yet)')) + '. Choose dates that do not overlap, or mark him Returned first.' });
  const l = { _id: crypto.randomUUID(), roll, from: b.from, to: b.to || '', reason: b.reason, image: await saveImg(b.image), status: 'On Leave', created: new Date().toISOString() };
  await D.leaves.insertOne(l); res.json({ ok: 1 });
}));
app.post('/api/leaves/:id/return', h(async (req, res) => { await D.leaves.updateOne({ _id: req.params.id }, { $set: { status: 'Returned', returned: req.body.date || today() } }); res.json({ ok: 1 }); }));
// Attendance: doc per date { _id: date, m: { roll: P|L|A } }
const covers = (l, d) => l.from <= d && (l.returned ? d < l.returned : (!l.to || d <= l.to));
const prevDay = d => new Date(Date.parse(d + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10);
const findClash = (list, from, to) => list.find(l => { const e = l.returned ? prevDay(l.returned) : (l.to || '9999-12-31'); return e >= l.from && from <= e && l.from <= (to || '9999-12-31'); });
const leaveStatus = l => l.returned ? 'Returned' : l.from > today() ? 'Upcoming' : covers(l, today()) ? 'On Leave' : 'Completed';
app.get('/api/attendance', h(async (req, res) => {
  const d = req.query.date || today(), doc = await D.attendance.findOne({ _id: d }), saved = (doc && doc.m) || {};
  const [st, lv] = await Promise.all([D.students.find({}, { projection: { _id: 1 } }).toArray(), D.leaves.find({ from: { $lte: d } }).toArray()]);
  const onL = new Set(lv.filter(l => covers(l, d)).map(l => l.roll)), out = {};
  st.forEach(s => out[s._id] = saved[s._id] || (onL.has(s._id) ? 'L' : 'P')); res.json({ date: d, marks: out });
}));
app.post('/api/attendance', h(async (req, res) => {
  const { date, marks } = req.body, set = {}, unset = {};
  Object.entries(marks || {}).forEach(([r, v]) => { if (!/^[A-Z0-9_-]+$/.test(r)) return; if (v === 'P') unset['m.' + r] = ''; else if (v === 'L' || v === 'A') set['m.' + r] = v; });
  const upd = {}; if (Object.keys(set).length) upd.$set = set; if (Object.keys(unset).length) upd.$unset = unset;
  if (!date || !Object.keys(upd).length) return res.json({ ok: 1 });
  await D.attendance.updateOne({ _id: date }, upd, { upsert: true }); res.json({ ok: 1 });
}));
app.get('/api/attendance/all', h(async (req, res) => { const o = {}; (await D.attendance.find().toArray()).forEach(d => o[d._id] = d.m); res.json(o); }));
// Complaints
app.get('/api/complaints', h(async (q, r) => r.json((await D.complaints.find().sort({ date: -1 }).toArray()).map(c => ({ ...c, id: c._id })))));
app.post('/api/complaints', h(async (req, res) => { const b = req.body, roll = (b.roll || '').toUpperCase(); if (!await D.students.findOne({ _id: roll }) || !b.text) return res.status(400).json({ error: 'Valid roll number and complaint text required' }); await D.complaints.insertOne({ _id: crypto.randomUUID(), roll, text: b.text, status: 'Open', date: today() }); res.json({ ok: 1 }); }));
app.post('/api/complaints/:id', h(async (req, res) => { await D.complaints.updateOne({ _id: req.params.id }, { $set: { status: req.body.status } }); res.json({ ok: 1 }); }));
// Fees (semester-wise)
app.get('/api/fees', h(async (q, r) => r.json(await D.fees.find().toArray())));
app.post('/api/fees', h(async (req, res) => {
  const b = req.body, roll = (b.roll || '').toUpperCase(), id = roll + '_' + +b.sem;
  if (!await D.students.findOne({ _id: roll })) return res.status(400).json({ error: 'Unknown roll number' });
  if (!b.paid) { await D.fees.deleteOne({ _id: id }); return res.json({ ok: 1 }); }
  if (!b.receipt || !b.date) return res.status(400).json({ error: 'Receipt no. and payment date required' });
  await D.fees.updateOne({ _id: id }, { $set: { roll, sem: +b.sem, receipt: b.receipt, date: b.date, amount: b.amount || '' } }, { upsert: true }); res.json({ ok: 1 });
}));
let ready;
const connect = () => ready || (ready = (async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  const c = await new MongoClient(process.env.MONGODB_URI).connect(), db = c.db(process.env.DB_NAME || 'nielit_hostel');
  ['students', 'leaves', 'attendance', 'complaints', 'fees', 'images'].forEach(n => D[n] = db.collection(n));
})().catch(e => { ready = null; throw e; }));
if (!process.env.VERCEL) app.listen(process.env.PORT || 3000, () => console.log('Running on http://localhost:' + (process.env.PORT || 3000)));
module.exports = app;
