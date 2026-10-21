/* Embun Botanics concept shop. Everything here is a demo: the bag lives in memory, no data leaves the page. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var P = {
    halia: { name: 'Halia Glow Serum', what: 'Bentong ginger + 5% niacinamide', img: 'assets/serum-halia.jpg', batch: 'Batch 031 · poured 9 Oct 2026',
      label: '<span class="lbl serum" aria-hidden="true"><i>EMBUN</i><s></s><u>Halia</u><em>Glow serum · 30 ml</em></span>',
      long: 'A light, watery serum for dull, uneven skin. Three-week ginger infusion with niacinamide to even tone and calm oil, without the tight feeling.',
      sizes: [['30 ml', 89], ['30 ml refill', 74]],
      use: 'Two drops on damp skin, morning and night. Press, don\'t rub. Use sunscreen in the day.',
      inci: 'Aqua, Niacinamide, Glycerin, Zingiber Officinale (Ginger) Root Extract, Propanediol, Sodium Hyaluronate, Panthenol, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin.' },
    pandan: { name: 'Pandan Night Balm', what: 'Pandan leaf + shea, for dry patches', img: 'assets/balm-pandan.jpg', batch: 'Batch 018 · poured 2 Oct 2026',
      label: '<span class="lbl balm" aria-hidden="true"><i>EMBUN</i><u>Pandan</u></span>',
      long: 'A soft balm that melts on contact. For cheeks that tighten in air-conditioning, flaky patches and the corners of your nose after a cold.',
      sizes: [['50 g', 72], ['50 g refill', 60]],
      use: 'Warm a pea-sized amount between fingertips and press over dry areas as the last step at night.',
      inci: 'Butyrospermum Parkii (Shea) Butter, Caprylic/Capric Triglyceride, Pandanus Amaryllifolius Leaf Extract, Cera Alba, Squalane, Tocopherol, Helianthus Annuus Seed Oil.' },
    teh: { name: 'Teh Hijau Toner', what: 'Highland green tea + rice water', img: 'assets/toner-teh.jpg', batch: 'Batch 027 · poured 6 Oct 2026',
      long: 'Strong-brewed green tea and fermented rice water instead of plain water. Takes the heat out of red, shiny skin on the hottest afternoons.',
      sizes: [['120 ml', 58], ['120 ml refill', 48]],
      use: 'Shake. Pat a few drops into skin with your hands after cleansing, or keep it in the fridge and use it on a cotton pad.',
      inci: 'Camellia Sinensis Leaf Water, Oryza Sativa (Rice) Ferment Filtrate, Glycerin, Betaine, Allantoin, Sodium Benzoate, Potassium Sorbate.' },
    bunga: { name: 'Bunga Raya Cleansing Oil', what: 'Hibiscus + cold-pressed jojoba', img: 'assets/oil-bunga.jpg', batch: 'Batch 022 · poured 16 Oct 2026',
      long: 'Melts sunscreen and the day\'s grime, then rinses clean. Hibiscus petals add a gentle polish; skin feels soft, not stripped.',
      sizes: [['100 ml', 68], ['100 ml refill', 56]],
      use: 'Massage two pumps into dry skin for a minute. Add water until milky, then rinse. Follow with the toner.',
      inci: 'Simmondsia Chinensis (Jojoba) Seed Oil, Caprylic/Capric Triglyceride, Polyglyceryl-4 Oleate, Hibiscus Sabdariffa Flower Extract, Tocopherol.' },
    embun: { name: 'Embun Dew Cream', what: 'Light gel-cream with tea + pandan', img: 'assets/cream-embun.jpg', batch: 'Batch 009 · poured 12 Oct 2026',
      long: 'Our lightest moisturiser, made for humid days. Sinks in in seconds and leaves a fresh, dewy finish that sits well under sunscreen.',
      sizes: [['50 ml', 96], ['50 ml refill', 80]],
      use: 'Morning and night after serum. A fingertip covers the whole face.',
      inci: 'Camellia Sinensis Leaf Water, Glycerin, Squalane, Pandanus Amaryllifolius Leaf Extract, Sodium Hyaluronate, Carbomer, Sodium Hydroxide, Phenoxyethanol.' },
    wash: { name: 'Bunga Raya Body Wash', what: 'Hibiscus + coconut-based cleansers', img: 'assets/wash-bunga.jpg', batch: 'Batch 040 · poured 30 Sep 2026',
      label: '<span class="lbl wash" aria-hidden="true"><i>EMBUN</i><s></s><u>Bunga Raya</u><em>Body wash</em></span>',
      long: 'A soft-lather wash for twice-a-day showers in the heat. Leaves no film and a faint, fruity smell of the dried flower.',
      sizes: [['300 ml', 46], ['300 ml refill', 38]],
      use: 'Lather between palms or on a cloth, then rinse. Safe for daily use, face excluded.',
      inci: 'Aqua, Coco-Glucoside, Sodium Cocoyl Glutamate, Glycerin, Hibiscus Sabdariffa Flower Extract, Citric Acid, Sodium Benzoate.' }
  };
  P.routine = { name: 'The Highland Routine', img: 'assets/serum-halia.jpg', sizes: [['Cleansing oil, serum + balm', 209]] };
  var FREE = 150;
  var bag = []; // {id, size, price, qty}

  /* Toast */
  var toastEl = $('.toast'), toastTimer;
  var BASE = toastEl.innerHTML;
  function toast(prefix) {
    toastEl.innerHTML = (prefix ? prefix + ' ' : '') + BASE;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 4200);
  }
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); toast(); }); });
  $$('[data-demo-form]').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); toast(); }); });

  /* Bag */
  var bagBtn = $('.bag-btn'), countEl = $('.bag-btn .count');
  function rm(n) { return 'RM' + n; }
  function addItem(id, sizeIdx) {
    var p = P[id], s = p.sizes[sizeIdx || 0];
    var line = bag.filter(function (l) { return l.id === id && l.size === s[0]; })[0];
    if (line) line.qty++; else bag.push({ id: id, size: s[0], price: s[1], qty: 1 });
    renderBag();
    bagBtn.classList.remove('bump'); void bagBtn.offsetWidth; bagBtn.classList.add('bump');
  }
  function renderBag() {
    var n = 0, sub = 0;
    bag.forEach(function (l) { n += l.qty; sub += l.qty * l.price; });
    countEl.textContent = n;
    $('#bag-sub').textContent = rm(sub);
    var left = Math.max(0, FREE - sub);
    $('#ship').innerHTML = (left > 0 ? 'You\'re <b class="num">' + rm(left) + '</b> away from free delivery in West Malaysia.' : 'Free delivery in West Malaysia unlocked.') +
      '<div class="bar"><i style="width:' + Math.min(100, sub / FREE * 100) + '%"></i></div>';
    var body = $('#bag-body');
    if (!bag.length) { body.innerHTML = '<div class="empty"><b>Your bag is empty</b>Start with the Halia Glow Serum, our bestseller.</div>'; return; }
    body.innerHTML = bag.map(function (l, i) {
      var p = P[l.id];
      return '<div class="line-item"><img src="' + p.img + '" alt="" width="76" height="95"><div><h3>' + p.name + '</h3><span class="sz">' + l.size + '</span><br>' +
        '<span class="qty"><button data-q="-1" data-i="' + i + '" aria-label="One less">&minus;</button><span class="num">' + l.qty + '</span><button data-q="1" data-i="' + i + '" aria-label="One more">+</button></span></div>' +
        '<div class="lp num">' + rm(l.price * l.qty) + '<button class="rm" data-rm="' + i + '">Remove</button></div></div>';
    }).join('');
  }
  $('#bag-body').addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { var l = bag[+q.dataset.i]; l.qty += +q.dataset.q; if (l.qty < 1) bag.splice(+q.dataset.i, 1); renderBag(); }
    if (r) { bag.splice(+r.dataset.rm, 1); renderBag(); }
  });
  renderBag();

  $$('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.closest('.prod').dataset.id;
      addItem(id, 0);
      b.textContent = 'In your bag'; b.classList.add('done');
      setTimeout(function () { b.textContent = 'Add to bag'; b.classList.remove('done'); }, 2200);
      toast('Added to the demo bag.');
    });
  });
  $('[data-add-bundle]').addEventListener('click', function () {
    addItem('routine', 0);
    toast('Routine added to the demo bag.');
  });

  /* Drawers */
  var scrim = $('.scrim'), lastFocus = null, openDrawer = null;
  function open(d) {
    if (openDrawer && openDrawer !== d) close(true);
    lastFocus = document.activeElement;
    openDrawer = d;
    d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var x = $('.x', d); if (x) x.focus(); }, 60);
  }
  function close(keep) {
    if (!openDrawer) return;
    openDrawer.classList.remove('open'); openDrawer.setAttribute('aria-hidden', 'true');
    openDrawer = null;
    if (keep !== true) { scrim.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  }
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab' && openDrawer) { // keep focus inside the open drawer
      var f = $$('button, a[href], input, summary', openDrawer).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $$('[data-open-bag]').forEach(function (b) { b.addEventListener('click', function () { open($('#bag')); }); });

  var qv = $('#qv'), qvSize = 0, qvId = null;
  function showQV(id) {
    var p = P[id]; qvId = id; qvSize = 0;
    $('#qv-body').innerHTML =
      '<div class="qv-media"><img src="' + p.img + '" alt="' + p.name + '" width="880" height="1100">' + (p.label || '') + '</div>' +
      '<div class="qv-in"><p class="batch num">' + p.batch + '</p><h3 id="qv-title">' + p.name + '</h3><p class="what">' + p.what + '</p><p class="long">' + p.long + '</p>' +
      '<div class="sizes" role="group" aria-label="Size">' + p.sizes.map(function (s, i) {
        return '<button data-size="' + i + '" aria-pressed="' + (i === 0) + '">' + s[0] + '<small class="num">' + rm(s[1]) + (i ? ' · bring your bottle' : '') + '</small></button>';
      }).join('') + '</div>' +
      '<div class="acc"><details open><summary>How to use</summary><p>' + p.use + '</p></details>' +
      '<details><summary>Full ingredients</summary><p class="inci">' + p.inci + '</p></details>' +
      '<details><summary>Delivery &amp; returns</summary><p>Posted from Brinchang within 2 working days. Free over RM150 in West Malaysia. Unopened bottles can be returned within 14 days.</p></details></div></div>';
    $('#qv-price').textContent = rm(p.sizes[0][1]);
    open(qv);
  }
  $('#qv-body').addEventListener('click', function (e) {
    var b = e.target.closest('[data-size]'); if (!b) return;
    qvSize = +b.dataset.size;
    $$('[data-size]', qv).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    $('#qv-price').textContent = rm(P[qvId].sizes[qvSize][1]);
  });
  $('#qv-add').addEventListener('click', function () { addItem(qvId, qvSize); close(true); open($('#bag')); toast('Added to the demo bag.'); });
  $$('[data-qv]').forEach(function (b) { b.addEventListener('click', function () { showQV(b.closest('.prod').dataset.id); }); });
  $$('[data-qv-id]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); showQV(a.dataset.qvId); }); });

  /* Filter chips */
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter;
      $$('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      $$('.prod').forEach(function (p) { p.hidden = !(f === 'all' || p.dataset.cat.split(' ').indexOf(f) > -1); if (!p.hidden) p.classList.add('in'); });
    });
  });

  /* Mobile menu */
  var mb = $('.menu-btn'), mn = $('#mnav');
  mb.addEventListener('click', function () { var o = mn.classList.toggle('open'); mb.setAttribute('aria-expanded', o); mb.textContent = o ? 'Close' : 'Menu'; });
  $$('a', mn).forEach(function (a) { a.addEventListener('click', function () { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.textContent = 'Menu'; }); });

  /* Reveal on scroll + ingredient story: plain rect checks on scroll (IntersectionObserver stalls in throttled tabs) */
  var rv = $$('.rv'), ings = $$('.ing'), figs = $$('.story-pin figure'), dots = $$('.dots i'), cur = 0;
  if (reduce) rv.forEach(function (el) { el.classList.add('in'); });
  function check() {
    var vh = window.innerHeight;
    for (var i = rv.length - 1; i >= 0; i--) {
      var r = rv[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { rv[i].classList.add('in'); rv.splice(i, 1); }
    }
    if (ings.length) {
      var act = 0;
      ings.forEach(function (el, k) { if (el.getBoundingClientRect().top < vh * 0.55) act = k; });
      if (act !== cur) {
        cur = act;
        figs.forEach(function (f, k) { f.classList.toggle('on', k === act); });
        dots.forEach(function (d, k) { d.classList.toggle('on', k === act); });
      }
    }
  }
  // called straight from the scroll event (not rAF, which pauses in background/throttled tabs); the work is tiny
  function onScroll() { check(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', check);
  check();
  setTimeout(check, 300); // once more after fonts/images settle the layout
})();
