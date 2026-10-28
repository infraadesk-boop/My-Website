/* ===== EDIT THESE SETTINGS ===== */
const SETTINGS = {
  email: 'Infraadesk@gmail.com',
  phone: '+91 9625561969',
  whatsapp: '+91 9625561969',          // digits only with country code, e.g. 919876543210
  scriptUrl: 'https://script.google.com/macros/s/AKfycbxReSCrGVJII35OOU77Hkapn5pAHLq3N_h8NfnJVm_6AsfAy4qnqYNDw88b-B2Njbiufw/exec',      // paste your free Web3Forms access key here
  social: [
     {name:'Instagram', url:'https://www.instagram.com/infraadesk/'},
     {name:'Facebook', url:'https://www.facebook.com/profile.php?id=61595440933256'}
   ]             // e.g. [{name:'LinkedIn', url:'https://...'}]
};
const HOME_SERVICES = ['Design and Drawings','Detailed Cost Estimates','Site Visits and Quality Review','Material Consultation','Budget Planning'];
const CONTR_SERVICES = ['Design and Drawing Support','RA Bill Preparation and Compliance Support','BOQ Preparation','Quantity Estimation','Rate Analysis','Contractor Profile Enhancement'];
const STAGES = ['Planning only','Design stage','Ready to start','Under construction','Billing / completion'];

/* ===== HEADER + FOOTER ===== */
const page = location.pathname.split('/').pop() || 'index.html';
const links = [['index.html','Home'],['homeowners.html','Homeowners'],['contractors.html','Contractors'],['about.html','About Us'],['how-it-works.html','How It Works'],['contact.html','Contact']];
const headerEl = document.getElementById('site-header');
if (headerEl) headerEl.innerHTML = `
<a class="skip" href="#main">Skip to content</a>
<header><div class="wrap bar">
<a class="brand" href="index.html" aria-label="InfraDesk home"><img src="images/logo.png" alt="InfraDesk Construction Solutions"></a>
<button class="menu-btn" aria-expanded="false" aria-controls="site-nav">Menu</button>
<nav id="site-nav" aria-label="Main"><ul>
${links.map(l => `<li><a href="${l[0]}"${l[0]===page?' aria-current="page"':''}>${l[1]}</a></li>`).join('')}
<li><a class="btn btn-orange" href="contact.html">Request a Quote</a></li></ul></nav></div></header>`;
const logo = document.querySelector('.brand img');
if (logo) logo.addEventListener('error', () => logo.replaceWith(Object.assign(document.createElement('span'), {className:'brand-text', textContent:'InfraDesk'})));

const footerEl = document.getElementById('site-footer');
if (footerEl) footerEl.innerHTML = `
<footer><div class="wrap"><div class="fgrid">
<div><h3>InfraDesk Construction Solutions</h3><p>Design. Estimate. Build Better.</p></div>
<div><h3>Services</h3><ul><li><a href="homeowners.html">For Homeowners</a></li><li><a href="contractors.html">For Contractors</a></li><li><a href="how-it-works.html">How It Works</a></li></ul></div>
<div><h3>Company</h3><ul><li><a href="about.html">About Us</a></li><li><a href="contact.html">Contact</a></li><li><a href="privacy.html">Privacy Policy</a></li><li><a href="terms.html">Terms and Conditions</a></li></ul></div>
<div><h3>Contact</h3><ul class="contact-list"><li>Email: <a href="mailto:${SETTINGS.email}">${SETTINGS.email}</a></li><li>Phone: ${SETTINGS.phone}</li>
${SETTINGS.social.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a></li>`).join('')}</ul></div>
</div><div class="copy"><span>&copy; ${new Date().getFullYear()} InfraDesk Construction Solutions. All rights reserved.</span><span>infradesk.in</span></div></div></footer>`;

/* ===== MOBILE MENU ===== */
const mb = document.querySelector('.menu-btn'), nv = document.getElementById('site-nav');
if (mb && nv) mb.addEventListener('click', () => mb.setAttribute('aria-expanded', nv.classList.toggle('open')));

/* ===== ENQUIRY FORMS ===== */
document.querySelectorAll('[data-form]').forEach(box => {
  const type = box.dataset.form, services = type === 'homeowner' ? HOME_SERVICES : CONTR_SERVICES;
  box.innerHTML = `<form novalidate>
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Full name *<input name="name" required autocomplete="name"></label>
<label>Phone *<input name="phone" type="tel" required autocomplete="tel" placeholder="+91 98765 43210"></label>
<label>Email (optional)<input name="email" type="email" autocomplete="email"></label>
<label>Location (city / area) *<input name="location" required></label>
<fieldset><legend>Services required * (choose one or more)</legend>
${services.map((s,i) => `<label class="chk"><input type="checkbox" name="svc" value="${s}"> ${s}</label>`).join('')}</fieldset>
<label>Project stage *<select name="stage" required><option value="">Select</option>${STAGES.map(s => `<option>${s}</option>`).join('')}</select></label>
<label>Deadline (if any)<input name="deadline" type="date"></label>
<label>Project description *<textarea name="details" rows="5" required></textarea></label>
<label class="chk"><input type="checkbox" name="consent" required> I agree to be contacted about this enquiry, as described in the <a href="privacy.html">Privacy Policy</a>. *</label>
<p class="status" role="status" aria-live="polite"></p>
<button class="btn btn-orange" type="submit">Send enquiry</button></form>`;
  const form = box.querySelector('form'), status = form.querySelector('.status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = form.elements, say = (m, ok) => { status.textContent = m; status.className = 'status ' + (ok ? 'ok' : 'err'); };
    if (f.botcheck.checked) return;
    if (!/^[+0-9\s-]{10,15}$/.test(f.phone.value.trim())) return say('Enter a valid phone number (10 to 15 digits).');
    if (!form.querySelector('[name=svc]:checked')) return say('Select at least one service.');
    if (!form.checkValidity()) { form.reportValidity(); return say('Please fill the required fields.'); }
    if (!SETTINGS.scriptUrl) return say('This form is not connected yet. Please contact us by email or phone.');
    const data = { botcheck: '', subject: 'New ' + type + ' enquiry - InfraDesk', from_name: 'InfraDesk website', enquiry_type: type,
      name: f.name.value, phone: f.phone.value, email: f.email.value, location: f.location.value, services: [...form.querySelectorAll('[name=svc]:checked')].map(c => c.value).join(', '),
      stage: f.stage.value, deadline: f.deadline.value, details: f.details.value };
    try {
      const r = await fetch(SETTINGS.scriptUrl, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(data) })
      if (!(await r.json()).success) throw 0;
      form.reset(); say('Thank you. Your enquiry has been sent. We will contact you soon.', true);
    } catch { say('Sorry, your enquiry could not be sent. Please email or call us.'); }
  });
});
const wa = document.getElementById('wa-btn');
if (wa) { if (SETTINGS.whatsapp) wa.href = 'https://wa.me/' + SETTINGS.whatsapp; else wa.hidden = true; }
