
// const express = require('express'), fs = require('fs'), path = require('path'), crypto = require('crypto');
// try { fs.readFileSync('.env', 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ''); }); } catch (e) {}
// const { MongoClient } = require('mongodb');
// const PASS = process.env.WARDEN_PASSWORD || 'warden123', SECRET = process.env.SESSION_SECRET || 'dev-secret';
// const sign = t => crypto.createHmac('sha256', SECRET).update(t).digest('hex');
// const today = () => new Date(Date.now() + 19800000).toISOString().slice(0, 10);
// const saveImg = async d => { if (!/^data:image\//.test(d || '')) return ''; const id = crypto.randomUUID(); await D.images.insertOne({ _id: id, data: d }); return id; };
// const h = fn => (req, res) => fn(req, res).catch(e => { console.error(e); res.status(500).json({ error: 'Server error: ' + e.message }); });
// let D = {};
// const app = express();
// app.use((q, r, n) => q.path === '/api/login' ? n() : connect().then(() => n(), e => r.status(500).json({ error: 'Database error: ' + e.message })));
// app.use(express.json({ limit: '4mb' }));
// const authed = req => { const t = (req.headers.authorization || '').replace('Bearer ', '') || req.query.t || ''; const [exp, sig] = t.split('.'); return !!exp && sig === sign(exp) && +exp > Date.now(); };
// app.use(express.static(path.join(__dirname, '..', 'public')));
// app.post('/api/login', (req, res) => { if (req.body.password !== PASS) return res.status(401).json({ error: 'Wrong password' }); const exp = Date.now() + 30 * 864e5; res.json({ token: exp + '.' + sign('' + exp) }); });
// app.use('/api', (req, res, next) => authed(req) ? next() : res.status(401).json({ error: 'Login required' }));
// app.get('/api/me', (q, r) => r.json({ ok: 1 }));
// app.get('/api/img/:id', h(async (req, res) => { const d = await D.images.findOne({ _id: req.params.id }); if (!d) return res.status(404).end(); const m = d.data.match(/^data:(image\/[\w+.-]+);base64,(.*)$/); res.set('Content-Type', m[1]).set('Cache-Control', 'private, max-age=31536000').send(Buffer.from(m[2], 'base64')); }));
// const clean = s => ({ ...s, roll: s._id, _id: undefined });
// // Students
// app.get('/api/students', h(async (q, r) => { const [st, lv] = await Promise.all([D.students.find().toArray(), D.leaves.find({ status: 'On Leave' }).toArray()]); const m = {}; lv.filter(l => covers(l, today())).forEach(l => m[l.roll] = l); r.json(st.map(s => ({ ...clean(s), status: m[s._id] ? 'On Leave' : 'In Hostel', leave: m[s._id] || null }))); }));
// const tmp = b => 'TMP-' + (b.room || 'X').toUpperCase().replace(/[^A-Z0-9]/g, '') + '-' + (b.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
// const batchOf = r => { const m = (r || '').match(/20(\d\d)/); if (!m) return ''; const y = 2000 + +m[1]; return y >= 2020 && y <= 2040 ? y + '-' + (y + 4) : ''; };
// app.post('/api/students', h(async (req, res) => {
//   const b = req.body, old = (b.oldRoll || '').trim().toUpperCase(), roll = (b.roll || '').trim().toUpperCase() || old || tmp(b);
//   if (!/^[A-Z0-9_-]+$/.test(roll) || !(b.name || '').trim()) return res.status(400).json({ error: 'Valid roll number (letters/digits only) and name required' });
//   const set = { name: b.name.trim(), batch: b.batch || batchOf(roll), branch: b.branch || '', mobile: b.mobile || '', parentMobile: b.parentMobile || '', room: b.room || '' };
//   if (b.photo) set.photo = await saveImg(b.photo);
//   if (old && old !== roll) {
//     if (await D.students.findOne({ _id: roll })) return res.status(400).json({ error: 'This roll number already exists' });
//     const o = await D.students.findOne({ _id: old }); if (!o) return res.status(400).json({ error: 'Old student not found' });
//     await D.students.insertOne({ ...o, _id: roll }); await D.students.deleteOne({ _id: old });
//     await D.leaves.updateMany({ roll: old }, { $set: { roll } }); await D.complaints.updateMany({ roll: old }, { $set: { roll } });
//     for (const f of await D.fees.find({ roll: old }).toArray()) { await D.fees.insertOne({ ...f, _id: roll + '_' + f.sem, roll }); await D.fees.deleteOne({ _id: f._id }); }
//     await D.attendance.updateMany({ ['m.' + old]: { $exists: true } }, { $rename: { ['m.' + old]: 'm.' + roll } });
//   }
//   const upd = { $set: set }; if (!set.photo) upd.$setOnInsert = { photo: '' };
//   await D.students.updateOne({ _id: roll }, upd, { upsert: true }); res.json({ ok: 1 });
// }));
// app.post('/api/students/import', h(async (req, res) => {
//   const F = ['batch', 'branch', 'mobile', 'parentMobile', 'room'];
//   const ops = (req.body.rows || []).filter(r => (r.name || '').trim()).map(r => {
//     const roll = (r.roll || '').trim().toUpperCase() || tmp(r); if (!/^[A-Z0-9_-]+$/.test(roll)) return null;
//     const set = { name: r.name.trim() }; F.forEach(k => { if ((r[k] || '').trim()) set[k] = r[k].trim(); }); if (!set.batch && batchOf(roll)) set.batch = batchOf(roll);
//     const ins = { photo: '' }; F.forEach(k => { if (!(k in set)) ins[k] = ''; });
//     return { updateOne: { filter: { _id: roll }, update: { $set: set, $setOnInsert: ins }, upsert: true } };
//   }).filter(Boolean);
//   if (ops.length) await D.students.bulkWrite(ops); res.json({ imported: ops.length });
// }));
// app.delete('/api/students/:roll', h(async (req, res) => { await D.students.deleteOne({ _id: req.params.roll }); res.json({ ok: 1 }); }));
// // Leaves (application image mandatory)
// app.get('/api/leaves', h(async (q, r) => r.json((await D.leaves.find().sort({ created: -1 }).toArray()).map(l => ({ ...l, id: l._id, status: leaveStatus(l) })))));
// app.post('/api/leaves', h(async (req, res) => {
//   const b = req.body, roll = (b.roll || '').toUpperCase();
//   if (!await D.students.findOne({ _id: roll })) return res.status(400).json({ error: 'Unknown roll number' });
//   if (!/^data:image\//.test(b.image || '')) return res.status(400).json({ error: 'Leave application image is mandatory' });
//   if (!b.from || !b.reason) return res.status(400).json({ error: 'From date and reason required' });
//   if (b.to && b.to < b.from) return res.status(400).json({ error: 'To date cannot be before From date' });
//   const clash = findClash(await D.leaves.find({ roll }).toArray(), b.from, b.to);
//   if (clash) return res.status(400).json({ error: 'This student already has leave from ' + clash.from + ' to ' + (clash.returned ? prevDay(clash.returned) : (clash.to || 'open-ended (not marked Returned yet)')) + '. Choose dates that do not overlap, or mark him Returned first.' });
//   const l = { _id: crypto.randomUUID(), roll, from: b.from, to: b.to || '', reason: b.reason, image: await saveImg(b.image), status: 'On Leave', created: new Date().toISOString() };
//   await D.leaves.insertOne(l); res.json({ ok: 1 });
// }));
// app.post('/api/leaves/:id/return', h(async (req, res) => { await D.leaves.updateOne({ _id: req.params.id }, { $set: { status: 'Returned', returned: req.body.date || today() } }); res.json({ ok: 1 }); }));
// // Attendance: doc per date { _id: date, m: { roll: P|L|A } }
// const covers = (l, d) => l.from <= d && (l.returned ? d < l.returned : (!l.to || d <= l.to));
// const prevDay = d => new Date(Date.parse(d + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10);
// const findClash = (list, from, to) => list.find(l => { const e = l.returned ? prevDay(l.returned) : (l.to || '9999-12-31'); return e >= l.from && from <= e && l.from <= (to || '9999-12-31'); });
// const leaveStatus = l => l.returned ? 'Returned' : l.from > today() ? 'Upcoming' : covers(l, today()) ? 'On Leave' : 'Completed';
// app.get('/api/attendance', h(async (req, res) => {
//   const d = req.query.date || today(), doc = await D.attendance.findOne({ _id: d }), saved = (doc && doc.m) || {};
//   const [st, lv] = await Promise.all([D.students.find({}, { projection: { _id: 1 } }).toArray(), D.leaves.find({ from: { $lte: d } }).toArray()]);
//   const onL = new Set(lv.filter(l => covers(l, d)).map(l => l.roll)), out = {};
//   st.forEach(s => out[s._id] = saved[s._id] || (onL.has(s._id) ? 'L' : 'P')); res.json({ date: d, marks: out });
// }));
// app.post('/api/attendance', h(async (req, res) => {
//   const { date, marks } = req.body, set = {}, unset = {};
//   Object.entries(marks || {}).forEach(([r, v]) => { if (!/^[A-Z0-9_-]+$/.test(r)) return; if (v === 'P') unset['m.' + r] = ''; else if (v === 'L' || v === 'A') set['m.' + r] = v; });
//   const upd = {}; if (Object.keys(set).length) upd.$set = set; if (Object.keys(unset).length) upd.$unset = unset;
//   if (!date || !Object.keys(upd).length) return res.json({ ok: 1 });
//   await D.attendance.updateOne({ _id: date }, upd, { upsert: true }); res.json({ ok: 1 });
// }));
// app.get('/api/attendance/all', h(async (req, res) => { const o = {}; (await D.attendance.find().toArray()).forEach(d => o[d._id] = d.m); res.json(o); }));
// // Complaints (auto number CMP-YYYY-NNNN, optional photo, date, resolution note)
// const nextNo = async d => { const y = (d || today()).slice(0, 4), r = await D.counters.findOneAndUpdate({ _id: 'cmp-' + y }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' }), doc = r && r.value !== undefined ? r.value : r; return 'CMP-' + y + '-' + String(doc.seq).padStart(4, '0'); };
// const isDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
// const backfill = async () => { const old = (await D.complaints.find().sort({ date: 1, created: 1 }).toArray()).filter(c => !c.no); for (const c of old) await D.complaints.updateOne({ _id: c._id }, { $set: { no: await nextNo(c.date) } }); };
// app.get('/api/complaints', h(async (q, r) => {
//   await backfill();
//   r.json((await D.complaints.find().sort({ date: 1, created: 1 }).toArray()).reverse().map(c => ({ ...c, id: c._id })));
// }));
// app.post('/api/complaints', h(async (req, res) => {
//   const b = req.body, roll = (b.roll || '').toUpperCase(), date = isDate(b.date) ? b.date : today();
//   if (!await D.students.findOne({ _id: roll }) || !(b.text || '').trim()) return res.status(400).json({ error: 'Valid student and complaint details required' });
//   await backfill();
//   const id = crypto.randomUUID(), no = await nextNo(date);
//   await D.complaints.insertOne({ _id: id, no, roll, text: b.text.trim(), date, image: await saveImg(b.image), status: 'Open', note: '', created: new Date().toISOString() });
//   res.json({ ok: 1, no, id });
// }));
// app.post('/api/complaints/:id', h(async (req, res) => {
//   const st = req.body.status; if (!['Open', 'In Progress', 'Resolved'].includes(st)) return res.status(400).json({ error: 'Invalid status' });
//   const upd = { $set: { status: st, note: (req.body.note || '').trim() } };
//   if (st === 'Resolved') upd.$set.resolved = isDate(req.body.resolved) ? req.body.resolved : today(); else upd.$unset = { resolved: '' };
//   await D.complaints.updateOne({ _id: req.params.id }, upd); res.json({ ok: 1 });
// }));
// // Fees (semester-wise)
// app.get('/api/fees', h(async (q, r) => r.json(await D.fees.find().toArray())));
// app.post('/api/fees', h(async (req, res) => {
//   const b = req.body, roll = (b.roll || '').toUpperCase(), id = roll + '_' + +b.sem;
//   if (!await D.students.findOne({ _id: roll })) return res.status(400).json({ error: 'Unknown roll number' });
//   if (!b.paid) { await D.fees.deleteOne({ _id: id }); return res.json({ ok: 1 }); }
//   if (!b.receipt || !b.date) return res.status(400).json({ error: 'Receipt no. and payment date required' });
//   await D.fees.updateOne({ _id: id }, { $set: { roll, sem: +b.sem, receipt: b.receipt, date: b.date, amount: b.amount || '' } }, { upsert: true }); res.json({ ok: 1 });
// }));
// let ready;
// const connect = () => ready || (ready = (async () => {
//   if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
//   const c = await new MongoClient(process.env.MONGODB_URI).connect(), db = c.db(process.env.DB_NAME || 'nielit_hostel');
//   ['students', 'leaves', 'attendance', 'complaints', 'fees', 'images', 'counters'].forEach(n => D[n] = db.collection(n));
// })().catch(e => { ready = null; throw e; }));
// if (!process.env.VERCEL) app.listen(process.env.PORT || 3000, () => console.log('Running on http://localhost:' + (process.env.PORT || 3000)));
// module.exports = app;


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
app.get('/api/students', h(async (q, r) => { const [st, lv] = await Promise.all([D.students.find().toArray(), D.leaves.find({ status: 'On Leave' }).toArray()]); const m = {}; lv.filter(l => covers(l, today())).forEach(l => m[l.roll] = l); r.json(st.filter(s => q.query.all || !s.vacated).map(s => ({ ...clean(s), status: m[s._id] ? 'On Leave' : 'In Hostel', leave: m[s._id] || null }))); }));
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
// Complaints (auto number CMP-YYYY-NNNN, optional photo, date, resolution note)
const nextNo = async d => { const y = (d || today()).slice(0, 4), r = await D.counters.findOneAndUpdate({ _id: 'cmp-' + y }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' }), doc = r && r.value !== undefined ? r.value : r; return 'CMP-' + y + '-' + String(doc.seq).padStart(4, '0'); };
const isDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
const backfill = async () => { const old = (await D.complaints.find().sort({ date: 1, created: 1 }).toArray()).filter(c => !c.no); for (const c of old) await D.complaints.updateOne({ _id: c._id }, { $set: { no: await nextNo(c.date) } }); };
app.get('/api/complaints', h(async (q, r) => {
  await backfill();
  r.json((await D.complaints.find().sort({ date: 1, created: 1 }).toArray()).reverse().map(c => ({ ...c, id: c._id })));
}));
app.post('/api/complaints', h(async (req, res) => {
  const b = req.body, roll = (b.roll || '').toUpperCase(), date = isDate(b.date) ? b.date : today();
  if (!await D.students.findOne({ _id: roll }) || !(b.text || '').trim()) return res.status(400).json({ error: 'Valid student and complaint details required' });
  await backfill();
  const id = crypto.randomUUID(), no = await nextNo(date);
  await D.complaints.insertOne({ _id: id, no, roll, text: b.text.trim(), date, image: await saveImg(b.image), status: 'Open', note: '', created: new Date().toISOString() });
  res.json({ ok: 1, no, id });
}));
app.post('/api/complaints/:id', h(async (req, res) => {
  const st = req.body.status; if (!['Open', 'In Progress', 'Resolved'].includes(st)) return res.status(400).json({ error: 'Invalid status' });
  const upd = { $set: { status: st, note: (req.body.note || '').trim() } };
  if (st === 'Resolved') upd.$set.resolved = isDate(req.body.resolved) ? req.body.resolved : today(); else upd.$unset = { resolved: '' };
  await D.complaints.updateOne({ _id: req.params.id }, upd); res.json({ ok: 1 });
}));
// Permanent leaving (vacate) with refund calculated as per the hostel fee refund SOP
const dayDiff = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
const refundCalc = (allot, app, fee, monthly) => { const days = dayDiff(allot, app), cat = days <= 10 ? 'I' : days <= 45 ? 'II' : 'III', processing = cat === 'III' ? 0 : 1000, deduction = cat === 'II' ? 2 * monthly : 0; return { days, category: cat, processing, deduction, refund: cat === 'III' ? 0 : Math.max(0, fee - processing - deduction) }; };
const num = v => Math.max(0, Math.round(+v || 0));
app.get('/api/exits', h(async (q, r) => r.json((await D.exits.find().sort({ exitDate: 1, created: 1 }).toArray()).reverse().map(e => ({ ...e, id: e._id })))));
app.post('/api/exits', h(async (req, res) => {
  const b = req.body, roll = (b.roll || '').toUpperCase(), st = await D.students.findOne({ _id: roll });
  if (!st || st.vacated) return res.status(400).json({ error: 'Student not found or already marked as left' });
  if (![b.allotDate, b.appDate, b.exitDate].every(isDate)) return res.status(400).json({ error: 'Allotment date, application date and vacating date are required' });
  if (b.appDate < b.allotDate) return res.status(400).json({ error: 'Application date cannot be before the allotment date' });
  const fee = num(b.feePaid), monthly = num(b.monthly);
  const e = { _id: crypto.randomUUID(), roll, name: st.name, room: st.room || '', batch: st.batch || '', branch: st.branch || '', allotDate: b.allotDate, appDate: b.appDate, exitDate: b.exitDate, reason: (b.reason || '').trim(), image: await saveImg(b.image),
    appRcvd: !!b.appRcvd, receipt: !!b.receipt, noDues: !!b.noDues, bank: !!b.bank, feePaid: fee, monthly, ...refundCalc(b.allotDate, b.appDate, fee, monthly), status: 'Under process', refundDate: '', remarks: '', created: new Date().toISOString() };
  await D.exits.insertOne(e);
  await D.students.updateOne({ _id: roll }, { $set: { vacated: b.exitDate, allotDate: b.allotDate } });
  await D.leaves.updateMany({ roll, returned: { $exists: false } }, { $set: { returned: b.exitDate, status: 'Returned' } });
  res.json({ ok: 1, id: e._id, category: e.category, refund: e.refund });
}));
app.post('/api/exits/:id', h(async (req, res) => {
  const e = await D.exits.findOne({ _id: req.params.id }); if (!e) return res.status(404).json({ error: 'Record not found' });
  const b = req.body, set = {};
  ['appRcvd', 'receipt', 'noDues', 'bank'].forEach(k => { if (k in b) set[k] = !!b[k]; });
  if (['Under process', 'Approved', 'Refunded'].includes(b.status)) set.status = b.status;
  if ('remarks' in b) set.remarks = String(b.remarks || '').trim();
  if ('refundDate' in b) set.refundDate = isDate(b.refundDate) ? b.refundDate : '';
  const fee = 'feePaid' in b ? num(b.feePaid) : e.feePaid, monthly = 'monthly' in b ? num(b.monthly) : e.monthly;
  const allot = isDate(b.allotDate) ? b.allotDate : e.allotDate, app = isDate(b.appDate) ? b.appDate : e.appDate;
  if (app < allot) return res.status(400).json({ error: 'Application date cannot be before the allotment date' });
  Object.assign(set, { feePaid: fee, monthly, allotDate: allot, appDate: app, ...refundCalc(allot, app, fee, monthly) });
  await D.exits.updateOne({ _id: e._id }, { $set: set }); res.json({ ok: 1, category: set.category, refund: set.refund });
}));
app.delete('/api/exits/:id', h(async (req, res) => { const e = await D.exits.findOne({ _id: req.params.id }); if (!e) return res.status(404).json({ error: 'Record not found' }); await D.students.updateOne({ _id: e.roll }, { $unset: { vacated: '' } }); await D.exits.deleteOne({ _id: e._id }); res.json({ ok: 1 }); }));
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
  ['students', 'leaves', 'attendance', 'complaints', 'fees', 'images', 'counters', 'exits'].forEach(n => D[n] = db.collection(n));
})().catch(e => { ready = null; throw e; }));
if (!process.env.VERCEL) app.listen(process.env.PORT || 3000, () => console.log('Running on http://localhost:' + (process.env.PORT || 3000)));
module.exports = app;
