// /* Official look: new sign-in page, NIELIT logo (public/logo.png), tricolour header stripe, footer.
//    Add a script tag with src="branding.js" before the closing body tag in public/index.html */
// (() => {
//   const q = s => document.querySelector(s);
//   document.head.insertAdjacentHTML('beforeend', `<style>
// .bl{display:inline-grid;place-items:center;background:#fff;border-radius:12px;overflow:hidden;flex:none}.bl img{width:100%;height:100%;object-fit:contain;display:block}
// .bl.sm{width:40px;height:40px;padding:3px}.bl.big{width:68px;height:68px;padding:6px;border-radius:14px}
// .bl.mono{background:#ffffff24;color:#fff;font:800 20px 'Bricolage Grotesque',sans-serif;padding:0}.bl.big.mono{font-size:30px}
// header{padding:9px 16px;height:58px}header::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#ff9933 0 33.33%,#fff 33.33% 66.66%,#138808 66.66%)}
// header .brand{gap:12px}header h1{font-size:16px}
// .ft{max-width:1100px;margin:0 auto;padding:6px 14px 20px;color:var(--mu);font-size:12px;text-align:center}@media(min-width:900px){.ft{margin-left:196px;max-width:none;padding:6px 28px 24px}}
// #login.official{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);min-height:100vh;padding:0;background:var(--card);place-items:stretch;position:relative}
// #login.official.hide{display:none!important}
// #login.official::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;z-index:2;background:linear-gradient(90deg,#ff9933 0 33.33%,#e9efec 33.33% 66.66%,#138808 66.66%)}
// .lg-l{background:var(--ink);color:#fff;padding:44px 48px 32px;display:flex;flex-direction:column;justify-content:space-between;gap:28px;background-image:radial-gradient(circle at 12% 90%,#ffffff14 0,transparent 42%),radial-gradient(#ffffff0f 1px,transparent 1px);background-size:auto,22px 22px}
// .lg-top{display:flex;align-items:center;gap:14px}.lg-org{font:700 17px/1.25 'Bricolage Grotesque',sans-serif}.lg-sub{opacity:.8;font-size:14px;margin-top:2px}
// .lg-mid h1{font:800 clamp(30px,4vw,46px)/1.05 'Bricolage Grotesque',sans-serif;margin:0 0 14px}.lg-mid p{max-width:36ch;opacity:.85;font-size:16px;margin:0}
// .lg-bot{font-size:12.5px;opacity:.75;border-top:1px solid #ffffff30;padding-top:14px}
// .lg-r{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:32px 24px}
// .lg-form{width:100%;max-width:370px}.lg-form h2{font:800 28px/1.1 'Bricolage Grotesque',sans-serif;margin:0 0 6px}.lg-form>p{color:var(--mu);margin:0 0 22px}
// .lg-form label{display:block;font-weight:700;font-size:13.5px;margin-bottom:6px}.pwrap{position:relative;margin-bottom:14px}.pwrap input{width:100%;padding-right:72px;min-height:46px}
// .eye{position:absolute;right:6px;top:6px;bottom:6px;border:0;background:none;color:var(--lk);font-weight:700;padding:0 10px;border-radius:7px}
// .lg-form .btn{width:100%;min-height:46px;font-size:15px}.lg-form .fine{color:var(--mu);font-size:12.5px;margin:16px 0 0;text-align:center}
// @media(max-width:820px){#login.official{grid-template-columns:1fr;grid-template-rows:auto 1fr}.lg-l{padding:30px 22px 22px;gap:14px}.lg-mid p,.lg-bot{display:none}.lg-mid h1{font-size:27px;margin:0}.lg-r{justify-content:flex-start;padding:28px 20px}}
// </style>`);
//   const logo = cls => {
//     const w = document.createElement('span'); w.className = 'bl ' + cls;
//     const i = new Image(); i.alt = 'NIELIT logo';
//     i.onerror = () => { i.remove(); w.textContent = 'N'; w.classList.add('mono'); };
//     i.src = '/logo.png'; w.appendChild(i); return w;
//   };
//   // sign-in page (keeps #pw and login() so existing logic works)
//   const L = q('#login');
//   if (L) {
//     L.classList.add('official');
//     L.innerHTML = `<div class="lg-l"><div class="lg-top"><span class="slot"></span><div><div class="lg-org">National Institute of Electronics &amp; Information Technology</div><div class="lg-sub">Gorakhpur Campus</div></div></div>
// <div class="lg-mid"><h1>Boys Hostel<br>Warden Portal</h1><p>Attendance, leave, complaints and fee records of hostel residents, in one place.</p></div>
// <div class="lg-bot">Ministry of Electronics &amp; Information Technology, Government of India</div></div>
// <div class="lg-r"><form class="lg-form" onsubmit="login();return false"><h2>Sign in</h2><p>For authorised hostel staff only.</p><label for="pw">Password</label>
// <div class="pwrap"><input id="pw" type="password" autocomplete="current-password" placeholder="Enter warden password"><button type="button" class="eye" aria-label="Show password">Show</button></div>
// <button class="btn" type="submit">Sign in</button><p class="fine">Cannot sign in? Please contact the system administrator.</p></form></div>`;
//     L.querySelector('.slot').replaceWith(logo('big'));
//     const pw = L.querySelector('#pw'), eye = L.querySelector('.eye');
//     eye.onclick = () => { const s = pw.type === 'password'; pw.type = s ? 'text' : 'password'; eye.textContent = s ? 'Hide' : 'Show'; eye.setAttribute('aria-label', s ? 'Hide password' : 'Show password'); };
//   }
//   // header + footer
//   const b = q('header .brand');
//   if (b) { b.innerHTML = '<span class="slot"></span><div><h1>NIELIT Gorakhpur</h1><small>Boys Hostel, warden portal</small></div>'; b.querySelector('.slot').replaceWith(logo('sm')); }
//   const app = q('#app');
//   if (app) app.insertAdjacentHTML('beforeend', '<footer class="ft">NIELIT Gorakhpur Campus, Boys Hostel. For authorised hostel staff only.</footer>');
// })();



/* Official look: new sign-in page, NIELIT logo (public/logo.png), tricolour header stripe, footer.
   Add a script tag with src="branding.js" before the closing body tag in public/index.html */
(() => {
  const q = s => document.querySelector(s);
  document.head.insertAdjacentHTML('beforeend', `<style>
.bl{display:inline-grid;place-items:center;background:#fff;border-radius:12px;overflow:hidden;flex:none}.bl img{height:100%;width:auto;max-width:none;object-fit:contain;display:block}
.bl.sm{height:40px;padding:4px 9px}.bl.big{height:76px;padding:8px 16px;border-radius:14px}
.bl.mono{background:#ffffff24;color:#fff;font:800 20px 'Bricolage Grotesque',sans-serif;padding:0}.bl.sm.mono{width:40px}.bl.big.mono{width:76px;font-size:30px}
header{padding:9px 16px;height:58px}header::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#ff9933 0 33.33%,#fff 33.33% 66.66%,#138808 66.66%)}
header .brand{gap:12px}header h1{font-size:16px}
.ft{max-width:1100px;margin:0 auto;padding:6px 14px 20px;color:var(--mu);font-size:12px;text-align:center}@media(min-width:900px){.ft{margin-left:196px;max-width:none;padding:6px 28px 24px}}
#login.official{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);min-height:100vh;padding:0;background:var(--card);place-items:stretch;position:relative}
#login.official.hide{display:none!important}
#login.official::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;z-index:2;background:linear-gradient(90deg,#ff9933 0 33.33%,#e9efec 33.33% 66.66%,#138808 66.66%)}
.lg-l{background:var(--ink);color:#fff;padding:44px 48px 32px;display:flex;flex-direction:column;justify-content:space-between;gap:28px;background-image:radial-gradient(circle at 12% 90%,#ffffff14 0,transparent 42%),radial-gradient(#ffffff0f 1px,transparent 1px);background-size:auto,22px 22px}
.lg-top{display:flex;align-items:center;gap:14px}.lg-org{font:700 17px/1.25 'Bricolage Grotesque',sans-serif}.lg-sub{opacity:.8;font-size:14px;margin-top:2px}
.lg-mid h1{font:800 clamp(30px,4vw,46px)/1.05 'Bricolage Grotesque',sans-serif;margin:0 0 14px}.lg-mid p{max-width:36ch;opacity:.85;font-size:16px;margin:0}
.lg-bot{font-size:12.5px;opacity:.75;border-top:1px solid #ffffff30;padding-top:14px}
.lg-r{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:32px 24px}
.lg-form{width:100%;max-width:370px}.lg-form h2{font:800 28px/1.1 'Bricolage Grotesque',sans-serif;margin:0 0 6px}.lg-form>p{color:var(--mu);margin:0 0 22px}
.lg-form label{display:block;font-weight:700;font-size:13.5px;margin-bottom:6px}.pwrap{position:relative;margin-bottom:14px}.pwrap input{width:100%;padding-right:72px;min-height:46px}
.eye{position:absolute;right:6px;top:6px;bottom:6px;border:0;background:none;color:var(--lk);font-weight:700;padding:0 10px;border-radius:7px}
.lg-form .btn{width:100%;min-height:46px;font-size:15px}.lg-form .fine{color:var(--mu);font-size:12.5px;margin:16px 0 0;text-align:center}
@media(max-width:520px){header small{display:none}header h1{font-size:15px}}@media(max-width:420px){header .brand>div:last-child{display:none}}
@media(max-width:820px){.lg-top{flex-direction:column;align-items:flex-start;gap:12px}.bl.big{height:60px;padding:6px 12px}.bl.big.mono{width:60px}#login.official{grid-template-columns:1fr;grid-template-rows:auto 1fr}.lg-l{padding:30px 22px 22px;gap:14px}.lg-mid p,.lg-bot{display:none}.lg-mid h1{font-size:27px;margin:0}.lg-r{justify-content:flex-start;padding:28px 20px}}
</style>`);
  const logo = cls => {
    const w = document.createElement('span'); w.className = 'bl ' + cls;
    const i = new Image(); i.alt = 'NIELIT logo';
    i.onerror = () => { i.remove(); w.textContent = 'N'; w.classList.add('mono'); };
    i.src = '/logo.png'; w.appendChild(i); return w;
  };
  // sign-in page (keeps #pw and login() so existing logic works)
  const L = q('#login');
  if (L) {
    L.classList.add('official');
    L.innerHTML = `<div class="lg-l"><div class="lg-top"><span class="slot"></span><div><div class="lg-org">National Institute of Electronics &amp; Information Technology</div><div class="lg-sub">Gorakhpur Campus</div></div></div>
<div class="lg-mid"><h1>Boys Hostel<br>Warden Portal</h1><p>Attendance, leave, complaints and fee records of hostel residents, in one place.</p></div>
<div class="lg-bot">Ministry of Electronics &amp; Information Technology, Government of India</div></div>
<div class="lg-r"><form class="lg-form" onsubmit="login();return false"><h2>Sign in</h2><p>For authorised hostel staff only.</p><label for="pw">Password</label>
<div class="pwrap"><input id="pw" type="password" autocomplete="current-password" placeholder="Enter warden password"><button type="button" class="eye" aria-label="Show password">Show</button></div>
<button class="btn" type="submit">Sign in</button><p class="fine">Cannot sign in? Please contact the system administrator.</p></form></div>`;
    L.querySelector('.slot').replaceWith(logo('big'));
    const pw = L.querySelector('#pw'), eye = L.querySelector('.eye');
    eye.onclick = () => { const s = pw.type === 'password'; pw.type = s ? 'text' : 'password'; eye.textContent = s ? 'Hide' : 'Show'; eye.setAttribute('aria-label', s ? 'Hide password' : 'Show password'); };
  }
  // header + footer
  const b = q('header .brand');
  if (b) { b.innerHTML = '<span class="slot"></span><div><h1>NIELIT Gorakhpur</h1><small>Boys Hostel, warden portal</small></div>'; b.querySelector('.slot').replaceWith(logo('sm')); }
  const app = q('#app');
  if (app) app.insertAdjacentHTML('beforeend', '<footer class="ft">NIELIT Gorakhpur Campus, Boys Hostel. For authorised hostel staff only.</footer>');
})();
