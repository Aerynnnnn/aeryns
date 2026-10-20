// Aeryn's — contact details live here. An empty value makes its buttons scroll to the contact section instead.
const CONTACT = {
  whatsapp: '60124775410',   // digits only with country code (012-477 5410)
  email: 'aerynnnn7@gmail.com',
  instagram: 'ckyw.1',       // handle without @
  waMessage: "Hi Aeryn's! I'd like a website for my business: "
};

// Contact buttons
const setLink = (sel, url) => document.querySelectorAll(sel).forEach(a => {
  if (!url) return;
  a.href = url;
  if (!url.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
});
setLink('[data-wa]', CONTACT.whatsapp && `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.waMessage)}`);
setLink('[data-email]', CONTACT.email && `mailto:${CONTACT.email}?subject=${encodeURIComponent('Website enquiry')}`);
setLink('[data-ig]', CONTACT.instagram && `https://instagram.com/${CONTACT.instagram}`);

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

// Nav border once scrolled + reveal on scroll (a rect check, not IntersectionObserver: IO stalls in throttled tabs)
const nav = document.querySelector('.nav');
const reveals = [...document.querySelectorAll('.reveal')];
function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 8);
  const limit = window.innerHeight * 0.92;
  for (let i = reveals.length - 1; i >= 0; i--) {
    if (reveals[i].getBoundingClientRect().top < limit) { reveals[i].classList.add('in'); reveals.splice(i, 1); }
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// FLAT18 day / night switch: follows the clock (dinner from 5pm), tap to flip
document.querySelectorAll('.daynight').forEach(box => {
  const btn = box.querySelector('.dn-switch');
  const label = box.querySelector('.dn-label');
  const set = mode => {
    box.dataset.mode = mode;
    label.textContent = mode === 'night' ? 'Night' : 'Day';
    btn.setAttribute('aria-pressed', String(mode === 'night'));
    btn.setAttribute('aria-label', `Showing the ${mode} look. Switch to ${mode === 'night' ? 'day' : 'night'}`);
  };
  const h = new Date().getHours();
  set(h >= 17 || h < 6 ? 'night' : 'day');
  btn.addEventListener('click', () => set(box.dataset.mode === 'night' ? 'day' : 'night'));
});
