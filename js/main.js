// Mobile menu toggle
const btn = document.querySelector('.menu-btn');
const nav = document.getElementById('site-nav');
if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
}
// Footer year
const yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();
