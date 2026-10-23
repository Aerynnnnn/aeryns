// Aeryn's — contact details live here. An empty value makes its buttons scroll to the contact section instead.
const CONTACT = {
  whatsapp: '60124775410',   // digits only with country code (012-477 5410)
  email: 'aerynnnn7@gmail.com',
  instagram: 'ckyw.1',       // handle without @
  waMessage: "Hi Aeryn's! I'd like a website for my business: "
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp01 = v => Math.min(1, Math.max(0, v));
const waUrl = text => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

// Contact buttons
const setLink = (sel, url) => document.querySelectorAll(sel).forEach(a => {
  if (!url) return;
  a.href = url;
  if (!url.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
});
setLink('[data-wa]', CONTACT.whatsapp && waUrl(CONTACT.waMessage));
setLink('[data-email]', CONTACT.email && `mailto:${CONTACT.email}?subject=${encodeURIComponent('Website enquiry')}`);
setLink('[data-ig]', CONTACT.instagram && `https://instagram.com/${CONTACT.instagram}`);
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

// The scroll engine (untouched, see scrollcraft.js)
const sc = ScrollCraft.mount(document.body);

/* ---------- the address field: shows where you are, opens the section list ---------- */
const bar = document.querySelector('.bar');
const omniBtn = document.querySelector('.omni-field');
const omniList = document.getElementById('omni-list');
const omniHash = document.querySelector('[data-omni-hash]');
const sections = [...document.querySelectorAll('main > section[id]')];
const darkPanels = [...document.querySelectorAll('.work, .own-plate, .close')];
const setMenu = open => { omniList.hidden = !open; omniBtn.setAttribute('aria-expanded', String(open)); };
omniBtn.addEventListener('click', () => setMenu(omniList.hidden));
omniList.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('click', e => { if (!e.target.closest('.omni')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !omniList.hidden) { setMenu(false); omniBtn.focus(); } });

let lastHash = null;
function updateChrome() {
  const vh = innerHeight;
  let cur = '';
  for (const s of sections) if (s.getBoundingClientRect().top <= vh * 0.35) cur = s.id;
  const hash = cur === 'top' || cur === 'intro' ? '' : '#' + cur;
  if (hash !== lastHash) {
    lastHash = hash;
    omniHash.textContent = hash;
    omniList.querySelectorAll('a').forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === hash));
  }
  const probe = (bar.offsetHeight || 60) / 2;
  bar.classList.toggle('on-dark', darkPanels.some(el => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
}

/* ---------- hero: planes lean with the pointer (desktop only, additive) ---------- */
const scene = document.querySelector('.hero-scene');
document.querySelectorAll('.pw').forEach(el => el.style.setProperty('--d', el.dataset.depth));
if (finePointer && !reduce) {
  addEventListener('pointermove', e => {
    if (scrollY > innerHeight * 1.5) return;
    scene.style.setProperty('--mx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
    scene.style.setProperty('--my', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
  }, { passive: true });
}

/* ---------- the peak: a browser that types each client's address and scrolls their site ---------- */
const work = document.querySelector('.work');
const browser = work.querySelector('.browser');
const shots = [...work.querySelectorAll('.shot')];
const tabs = [...work.querySelectorAll('.tab')];
const labels = [...work.querySelectorAll('.label')];
const addrHost = work.querySelector('[data-addr-host]');
const addrPath = work.querySelector('[data-addr-path]');
const addrLoad = work.querySelector('[data-addr-load]');
const view = work.querySelector('.browser-view');
const urls = shots.map(s => s.dataset.url);
const N = shots.length, SEG = 1 / N;
let shown = -1, lastAddr = '';

function workProgress() {
  const r = work.getBoundingClientRect();
  return clamp01(-r.top / Math.max(r.height - innerHeight, 1));
}
function drawWork() {
  const p = workProgress();
  const i = Math.min(N - 1, Math.floor(p / SEG));
  const t = (p - i * SEG) / SEG;
  const typeT = i === 0 ? 1 : clamp01(t / 0.14);
  const loadT = i === 0 ? 1 : clamp01((t - 0.1) / 0.1);
  const loaded = i === 0 || t >= 0.17;
  const cur = loaded ? i : i - 1;
  const start = i === 0 ? 0.02 : 0.2;
  const s = reduce ? 0 : loaded ? clamp01((t - start) / (0.96 - start)) : 1;

  // address: type the new one, host first then path
  const url = urls[i], typed = url.slice(0, Math.round(url.length * typeT));
  if (typed !== lastAddr) {
    lastAddr = typed;
    const slash = url.indexOf('/') + 1;
    addrHost.textContent = typed.slice(0, slash);
    addrPath.textContent = typed.slice(slash);
  }
  browser.classList.toggle('is-typing', typeT < 1);
  addrLoad.style.opacity = loadT > 0 && loadT < 1 ? '1' : '0';
  addrLoad.style.transform = `scaleX(${loadT.toFixed(3)})`;

  if (cur !== shown) {
    shown = cur;
    shots.forEach((el, k) => el.classList.toggle('is-on', k === cur));
    labels.forEach((el, k) => el.classList.toggle('is-on', k === cur));
  }
  tabs.forEach((el, k) => el.classList.toggle('is-on', k === i));
  const img = shots[cur].querySelector('img');
  const travel = Math.max(img.offsetHeight - view.clientHeight, 0);
  img.style.transform = `translate3d(0, ${(-s * travel).toFixed(1)}px, 0)`;
}
// Keyboard: a label's link that is not showing scrolls its site into place first
labels.forEach((el, k) => el.addEventListener('focusin', () => {
  if (el.classList.contains('is-on')) return;
  const r = work.getBoundingClientRect();
  const y = scrollY + r.top + (k * SEG + SEG * 0.6) * (r.height - innerHeight);
  scrollTo({ top: y, behavior: 'instant' });
}));

/* ---------- the close: your brand in the address bar ---------- */
const nameIn = document.getElementById('brand-name');
const yours = document.querySelector('[data-yours]');
const slugEl = document.querySelector('[data-yours-slug]');
const nameEls = document.querySelectorAll('[data-yours-name]');
const brandBtn = document.querySelector('[data-wa-brand]');
const palettes = [
  ['#f4efe6', '#2a211a', '#c13d26'], ['#e7efe9', '#17302a', '#2f7a5a'], ['#1d2230', '#f1ece2', '#f2b84b'],
  ['#f6e9e4', '#3a1f1a', '#d0573c'], ['#eef0f6', '#1a2240', '#3d5bd9'], ['#28201b', '#f3e7d6', '#e48a4f'],
];
function updateBrand() {
  const name = nameIn.value.trim().replace(/\s+/g, ' ');
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '') || 'your-brand';
  slugEl.textContent = slug;
  nameEls.forEach(el => { el.textContent = name || 'Your Brand'; });
  let h = 0; for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [bg, ink, acc] = name ? palettes[h % palettes.length] : palettes[0];
  yours.style.setProperty('--y-bg', bg); yours.style.setProperty('--y-ink', ink); yours.style.setProperty('--y-acc', acc);
  if (CONTACT.whatsapp) brandBtn.href = waUrl(name ? `Hi Aeryn's! I'd like a website for ${name}.` : CONTACT.waMessage);
}
nameIn.addEventListener('input', updateBrand);
nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); brandBtn.click(); } });

/* ---------- one frame loop for everything page-local ---------- */
// Entry reveals: the engine uses IntersectionObserver, which stalls in throttled tabs, so back it with a rect check
const pendingIn = [...document.querySelectorAll('[data-sc-in]')];
function revealFallback() {
  const limit = innerHeight * 0.9;
  for (let k = pendingIn.length - 1; k >= 0; k--) {
    const el = pendingIn[k];
    if (el.classList.contains('sc-in')) { pendingIn.splice(k, 1); continue; }
    if (el.getBoundingClientRect().top > limit) continue;
    el.classList.add('sc-in');
    const st = parseFloat(el.dataset.scStagger);
    if (!isNaN(st)) [...el.children].forEach((kid, n) => { kid.style.transitionDelay = n * st + 'ms'; kid.classList.add('sc-in'); });
    pendingIn.splice(k, 1);
  }
}

let queued = false;
function frame() { queued = false; updateChrome(); drawWork(); revealFallback(); }
const request = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', request);
addEventListener('load', request);
work.querySelectorAll('img').forEach(img => img.addEventListener('load', request));
frame();
// Some embedded/throttled views pause rAF and scroll events: poll as a fallback (cheap, only when scrollY moved)
let polledY = -1;
setInterval(() => {
  if (scrollY === polledY) return;
  polledY = scrollY;
  frame();
  sc.read();
}, 300);
