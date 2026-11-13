/* Live camera capture + upload for leave application (and student photo).
   Add a script tag with src="camera.js" just before the closing body tag in public/index.html */
(() => {
  const q = s => document.querySelector(s);
  document.head.insertAdjacentHTML('beforeend', `<style>
#cam{position:fixed;inset:0;background:#000;z-index:100;display:flex;flex-direction:column}
#cam video,#cam #cp{flex:1;min-height:0;width:100%;object-fit:contain;background:#000}
.cbar{display:flex;justify-content:space-around;align-items:center;padding:16px 16px calc(16px + env(safe-area-inset-bottom));background:#000}
.shutter{width:68px;height:68px;border-radius:50%;border:4px solid #fff;background:#ffffff33;padding:0}.shutter:active{background:#fff}
.cbar .btn.ghost{color:#fff;border-color:#ffffff66}.mir{transform:scaleX(-1)}
.capbox{margin:6px 0}.pv{display:flex;align-items:center;gap:12px;margin-top:8px}.pv img{max-height:110px;max-width:60%;border-radius:8px;border:1px solid var(--bd)}
</style>`);
  document.body.insertAdjacentHTML('beforeend', `<div id="cam" class="hide"><video id="cv" autoplay playsinline muted></video><img id="cp" class="hide" alt="Captured photo"><div class="cbar" id="cb1"><button type="button" class="btn ghost" id="cx">Cancel</button><button type="button" class="shutter" id="cs" aria-label="Capture photo"></button><button type="button" class="btn ghost" id="cf">Flip</button></div><div class="cbar hide" id="cb2"><button type="button" class="btn ghost" id="cr">Retake</button><button type="button" class="btn" id="cu">Use photo</button></div></div>`);
  let stream = null, face = 'environment', done = null, shot = '';
  const stop = () => { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
  const close = () => { stop(); q('#cam').classList.add('hide'); document.body.style.overflow = ''; };
  const live = () => { q('#cv').classList.remove('hide'); q('#cp').classList.add('hide'); q('#cb1').classList.remove('hide'); q('#cb2').classList.add('hide'); };
  async function start() {
    stop();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: face }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      const v = q('#cv'); v.classList.toggle('mir', face === 'user'); v.srcObject = stream;
    } catch (e) { close(); alert('Camera not available (' + (e.name || 'error') + '). Allow camera permission in the browser, or use "Upload from device".'); }
  }
  window.openCam = (f, cb) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return alert('Live camera is not supported here. Use "Upload from device".');
    face = f; done = cb; shot = ''; live(); q('#cam').classList.remove('hide'); document.body.style.overflow = 'hidden'; start();
  };
  q('#cs').onclick = () => {
    const v = q('#cv'); if (!v.videoWidth) return;
    const k = Math.min(1, 1400 / Math.max(v.videoWidth, v.videoHeight)), c = document.createElement('canvas');
    c.width = v.videoWidth * k; c.height = v.videoHeight * k; c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    shot = c.toDataURL('image/jpeg', .72); q('#cp').src = shot;
    q('#cv').classList.add('hide'); q('#cp').classList.remove('hide'); q('#cb1').classList.add('hide'); q('#cb2').classList.remove('hide');
  };
  q('#cr').onclick = live;
  q('#cu').onclick = () => { const s = shot; close(); if (done) done(s); };
  q('#cx').onclick = close;
  q('#cf').onclick = () => { face = face === 'environment' ? 'user' : 'environment'; start(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Replace the plain file input with [Take photo] [Upload from device] + preview
  function attach(sel, f, key, text) {
    const li = q(sel); if (!li) return; window[key] = '';
    li.removeAttribute('capture'); li.style.display = 'none';
    const p = li.previousElementSibling; if (p && p.tagName === 'P') p.textContent = text;
    const w = document.createElement('div'); w.className = 'capbox';
    w.innerHTML = '<div class="row"><button type="button" class="btn">Take photo</button><button type="button" class="btn ghost">Upload from device</button></div><div class="pv"></div>';
    li.after(w);
    const [b1, b2] = w.querySelectorAll('button'), pv = w.querySelector('.pv');
    const set = d => { window[key] = d; pv.innerHTML = d ? '<img src="' + d + '" alt="Selected photo"><button type="button" class="btn ghost sm">Remove</button>' : ''; if (d) pv.querySelector('button').onclick = () => set(''); };
    b1.onclick = () => openCam(f, set); b2.onclick = () => li.click();
    li.onchange = async () => { if (li.files[0]) { set(await shrink(li.files[0])); li.value = ''; } };
  }
  ['leave', 'stu'].forEach(k => {
    const o = V[k];
    V[k] = async function () {
      await o.apply(this, arguments);
      if (k === 'leave') attach('#li', 'environment', 'LEAVEIMG', 'Application photo (mandatory). Take a live photo or upload one.');
      else attach('#sf', 'user', 'STUIMG', 'Student photo (optional). Take a live photo or upload one.');
    };
  });
  const say = m => { if (typeof toast === 'function') toast(m); };
  window.addLeave = async () => {
    if (!window.LEAVEIMG) return alert('Application image is mandatory. Take a photo or upload one.');
    await api('/api/leaves', { method: 'POST', body: { roll: q('#lr').value, from: q('#lf').value, to: q('#lt').value, reason: q('#lx').value, image: window.LEAVEIMG } });
    say('Leave saved'); V.leave();
  };
  window.addStu = async () => {
    const b = { oldRoll: q('#so').value };
    [['roll', 'sr'], ['name', 'sn'], ['batch', 'sb'], ['branch', 'sbr'], ['mobile', 'sm'], ['parentMobile', 'sp'], ['room', 'srm']].forEach(([k, i]) => b[k] = q('#' + i).value);
    if (window.STUIMG) b.photo = window.STUIMG;
    await api('/api/students', { method: 'POST', body: b }); say('Student saved'); go('stu');
  };
})();
