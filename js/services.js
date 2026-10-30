/* InfraDesk service-discovery section.
   To edit a service: change its text or its field list below.
   Field format: 'Label*|type|options'  (* = required; types: text, tel, email, number, date, area, file, sel) */
(() => {
const FALLBACK_URL = ''; // only needed if SETTINGS.scriptUrl (js/site.js) is not loaded on this page
const getUrl = () => (typeof SETTINGS !== 'undefined' && SETTINGS.scriptUrl) || FALLBACK_URL;

const N='Full name*|text', M='Mobile number*|tel', L='Project location*|text', AD='Additional details|area';
const BT='Building type*|sel|Independent house,Residential flat,Commercial,Other';
const ST='Current construction stage*|sel|Planning,Foundation,Structure,Finishing,Completed';
const DA='Drawing availability*|sel|Available,Not available';
const SERVICES = [
 {i:'🏠',t:'Plan My House',d:'Planning to build a new home? Get professional assistance with design coordination, drawings, preliminary budgeting and construction planning.',f:[N,M,'Email address|email',L,'Plot area (sq. ft.)*|number','Expected built-up area (sq. ft.)|number','Number of floors*|number','Do you have an existing floor plan?*|sel|Yes,No','Additional requirements|area']},
 {i:'₹',t:'Get a Cost Estimate',d:'Understand your approximate construction budget through project-specific cost estimation and quantity calculations.',f:[N,M,L,BT,'Built-up area (sq. ft.)*|number','Number of floors|number','Construction stage*|sel|Planning,Foundation,Structure,Finishing','Finish preference*|sel|Basic,Standard,Premium',DA,AD]},
 {i:'📐',t:'Get Drawings & BOQ',d:'Get assistance with drawing coordination, detailed BOQ, quantity take-offs and construction documentation.',f:[N,M,L,'Project type*|text','Required service*|sel|Drawings,BOQ,Quantity estimation,All','Built-up area (sq. ft.)|number',DA,'Upload drawings (PDF/JPG/PNG)|file','Additional requirements|area']},
 {i:'📄',t:'Review My Quotation',d:'Have a contractor quotation? Get assistance reviewing item descriptions, quantities, specifications, rates and missing work items.',f:[N,M,L,BT,'Approximate quotation value (Rs.)|text','Number of contractor quotations|number','Upload quotation (PDF/JPG/PNG)|file','Additional concerns|area']},
 {i:'🔍',t:'Book a Site Visit',d:'Get professional site observations, progress reviews, measurement checks and construction quality monitoring.',f:[N,M,'Project location / address*|text',BT,ST,'Purpose of visit*|sel|Progress review,Measurement verification,Quality observation,Material inspection,Other','Preferred visit date|date',AD]},
 {i:'🧱',t:'Compare Materials',d:'Get guidance on selecting suitable construction materials based on specifications, quality, availability and budget.',f:[N,M,L,'Material category*|sel|Cement,Steel,Bricks,Tiles,Paint,Waterproofing,Plumbing,Electrical,Other','Project stage|sel|Planning,Foundation,Structure,Finishing,Completed','Preferred budget range|text','Specific brands or materials to compare|area','Additional requirements|area']},
 {i:'🧾',t:'Get Billing Support',d:'Outsourced quantity surveying and billing support for civil contractors, including RA bills, measurements, BOQs and rate analysis.',f:['Contractor / company name*|text','Contact person*|text',M,'Email address*|email',L,'Department / client*|sel|PWD,CPWD,DDA,MCD,Private,Other','Project value range|text','Required service*|sel|RA Bill,BOQ,Quantity estimation,Rate analysis,Measurement sheets,Other','One-time or recurring requirement*|sel|One-time,Recurring',AD]},
 {i:'🚚',t:'Get Procurement Help',d:'Get assistance preparing material purchase lists, comparing supplier quotations, identifying suitable suppliers and coordinating material requirements.',f:[N,M,L,'Project type*|text',ST,'Materials required*|area','Approximate purchase budget|text','Procurement requirement*|sel|Material list,Supplier comparison,Quotation comparison,Delivery coordination',AD]}
];

const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const parse = s => { const [l,t,o] = s.split('|'); return {label:l.replace('*',''), req:l.endsWith('*'), t, o:o ? o.split(',') : []}; };
const b64 = f => new Promise((ok,no) => { const r = new FileReader(); r.onload = () => ok(r.result.split(',')[1]); r.onerror = no; r.readAsDataURL(f); });
const TYPES = ['application/pdf','image/jpeg','image/png'], MAX = 5*1024*1024;

function fieldHTML(spec, i) {
  const f = parse(spec), id = 'f'+i, r = f.req ? ' required' : '';
  let c;
  if (f.t === 'sel') c = `<select id="${id}" name="${id}"${r}><option value="">Select</option>${f.o.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (f.t === 'area') c = `<textarea id="${id}" name="${id}" rows="4" maxlength="1500"${r}></textarea>`;
  else if (f.t === 'file') c = `<input id="${id}" name="${id}" type="file" accept=".pdf,.jpg,.jpeg,.png"><small>PDF, JPG or PNG, up to 5 MB</small>`;
  else c = `<input id="${id}" name="${id}" type="${f.t}" maxlength="150"${f.t==='number'?' min="0" step="any"':''}${f.t==='tel'?' inputmode="tel" autocomplete="tel"':''}${r}>`;
  return `<div class="m-f"><label for="${id}">${esc(f.label)}${f.req?' *':''}</label>${c}</div>`;
}

const root = document.getElementById('services-root');
if (!root) return;
root.innerHTML = `<section class="alt" id="services"><div class="wrap">
<div class="sec-head"><h2>What do you need help with?</h2>
<p>Whether you are planning a new house, managing ongoing construction or looking for professional billing support, InfraDesk provides practical construction solutions tailored to your requirements.</p></div>
<div class="s-grid">${SERVICES.map((s,k) => `<article class="s-card"><div class="s-ic" aria-hidden="true">${s.i}</div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p><button type="button" class="btn btn-orange" data-k="${k}">${esc(s.t)}</button></article>`).join('')}</div>
</div></section>`;

const dlg = document.createElement('dialog');
dlg.className = 'm'; dlg.setAttribute('aria-labelledby', 'm-title');
document.body.appendChild(dlg);
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
let opener = null;
dlg.addEventListener('close', () => opener && opener.focus());

function openForm(k, btn) {
  const s = SERVICES[k]; opener = btn;
  let busy = false, sid = (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());
  dlg.innerHTML = `<div class="m-head"><h2 id="m-title">${esc(s.t)}</h2><button type="button" class="m-x" aria-label="Close form">&times;</button></div>
<div class="m-body"><p>Fields marked * are required.</p><form novalidate>
<input type="checkbox" name="hp" class="m-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
${s.f.map(fieldHTML).join('')}
<p class="m-st" role="status" aria-live="polite"></p>
<button class="btn btn-orange" type="submit">Submit Enquiry</button></form></div>`;
  const form = dlg.querySelector('form'), st = dlg.querySelector('.m-st'), sub = form.querySelector('[type=submit]');
  const say = (m, c) => { st.textContent = m; st.className = 'm-st ' + (c || ''); };
  dlg.querySelector('.m-x').onclick = () => dlg.close();
  form.onsubmit = async e => {
    e.preventDefault();
    if (busy || form.hp.checked) return;
    const fields = {}; let file = null, err = '';
    for (let i = 0; i < s.f.length; i++) {
      const p = parse(s.f[i]), el = form.elements['f'+i];
      if (p.t === 'file') { file = el.files[0]; continue; }
      const v = el.value.trim();
      if (p.req && !v) { err = 'Please fill in: ' + p.label; el.focus(); break; }
      if (p.t === 'tel' && !/^(\+91|91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''))) { err = 'Enter a valid 10-digit mobile number.'; el.focus(); break; }
      if (p.t === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) { err = 'Enter a valid email address.'; el.focus(); break; }
      if (v) fields[p.label] = v;
    }
    if (!err && file && (!TYPES.includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name))) err = 'Upload a PDF, JPG or PNG file.';
    if (!err && file && file.size > MAX) err = 'The file is larger than 5 MB.';
    if (err) return say(err, 'err');
    const url = getUrl();
    if (!url) return say('This form is not connected yet. Please contact us by email or phone.', 'err');
    busy = true; sub.disabled = true; sub.textContent = 'Sending...'; say('');
    try {
      const body = {service: s.t, submission_id: sid, botcheck: '', fields};
      if (file) body.file = {name: file.name, type: file.type, data: await b64(file)};
      const r = await fetch(url, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(body)});
      if (!(await r.json()).success) throw 0;
      dlg.querySelector('.m-body').innerHTML = `<div class="m-ok"><h3>Thank you!</h3><p>Your ${esc(s.t)} enquiry has been sent. We will contact you soon.</p><br><button type="button" class="btn btn-blue">Close</button></div>`;
      dlg.querySelector('.m-ok button').onclick = () => dlg.close();
    } catch (x) {
      busy = false; sub.disabled = false; sub.textContent = 'Submit Enquiry';
      say('Sorry, your enquiry could not be sent. Please try again, or email or call us.', 'err');
    }
  };
  dlg.showModal();
}
root.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) openForm(+b.dataset.k, b); });
})();
