/* Kayu Lane (concept site by Aeryn's). Filters, piece sheet, making story, estimate, showroom status, reveals.
   Everything that sells or sends is a demo: it only shows the toast. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data ---------- */
  var TIMBER = {
    nyatoh: { name: 'Nyatoh', f: 1, img: 'assets/grain-nyatoh.jpg' },
    merbau: { name: 'Merbau', f: 1.15, img: 'assets/grain-merbau.jpg' },
    chengal: { name: 'Chengal', f: 1.25, img: 'assets/grain-chengal.jpg' }
  };
  var A = 'assets/';
  // price = catalogue price in the listed timber; other timbers are derived from the factors above
  var PIECES = {
    meja: { no: 'KL-04 · Tables', name: 'Meja Panjang dining table', meaning: 'Meja panjang: the long table', timber: 'merbau', price: 6800,
      desc: 'A top glued from five boards picked to read as one, on legs tenoned through the rails and pegged. It comes apart for a narrow staircase, and we put it back together in your dining room in twenty minutes.',
      photos: [['piece-meja-panjang.jpg', 'The long table in a dining room'], ['make-timber.jpg', 'Boards stacked to settle for a year'], ['grain-merbau.jpg', 'Merbau grain']],
      spec: [['Size', '220 × 95 × 75 cm, seats 8'], ['Also', '180 cm long, seats 6: 15% less'], ['Joinery', 'Draw-bored mortise and tenon, knock-down'], ['Finish', 'Hardwax oil, three coats'], ['Weight', 'About 68 kg'], ['Lead time', '9–10 weeks']] },
    lorong: { no: 'KL-01 · Seating', name: 'Lorong dining chair', meaning: 'Lorong: a lane', timber: 'nyatoh', price: 1280,
      desc: 'Our first design and still the one we make most. Seven spindles, each wedged through a seat hollowed by hand. Light enough to lift with one hand, and the back is shaped for long dinners, not for photos.',
      photos: [['piece-lorong-chair.jpg', 'The Lorong chair'], ['make-chisel.jpg', 'Hollowing a seat by chisel'], ['make-joinery.jpg', 'A hand-cut joint']],
      spec: [['Size', '45 × 51 × 84 cm, seat height 45 cm'], ['Joinery', 'Wedged through-tenons, pegged rails'], ['Finish', 'Hardwax oil, three coats'], ['Weight', '5.5 kg'], ['Lead time', '6–7 weeks; sets of 6 in 9 weeks']] },
    rotan: { no: 'KL-02 · Seating', name: 'Rotan lounge chair', meaning: 'Rotan: rattan, cane', timber: 'merbau', price: 2450,
      desc: 'A low reading chair: merbau frame, with a seat and back of cane hand-woven for us by a weaver in Balik Pulau. The cane turns honey-coloured in a year. When it finally wears through, we re-weave it for RM380.',
      photos: [['piece-rotan-lounger.jpg', 'The Rotan lounge chair in afternoon light'], ['grain-merbau.jpg', 'Merbau grain'], ['make-joinery.jpg', 'A hand-cut joint']],
      spec: [['Size', '66 × 78 × 80 cm, seat height 38 cm'], ['Cane', 'Hand-woven, six-way pattern'], ['Joinery', 'Mortise and tenon, pegged'], ['Weight', '9 kg'], ['Lead time', '8 weeks (weaving adds one)']] },
    pasar: { no: 'KL-03 · Seating', name: 'Pasar stools, a pair', meaning: 'Pasar: the market', timber: 'chengal', price: 680, ready: true, unit: 'the pair',
      desc: 'Three legs, so they never wobble on an old tiled floor. The tops are thick chengal offcuts from table builds, so each one is a slightly different shade. This pair is finished and waiting in the showroom.',
      photos: [['piece-pasar-stools.jpg', 'A pair of Pasar stools', true], ['grain-chengal.jpg', 'Chengal grain'], ['make-timber.jpg', 'Where the offcuts come from']],
      spec: [['Size', 'Ø 32 × 46 cm each'], ['Joinery', 'Wedged round tenons'], ['Weight', '3.2 kg each'], ['Availability', 'In the showroom now: one pair']] },
    almari: { no: 'KL-07 · Storage', name: 'Almari sideboard', meaning: 'Almari: cupboard, from the Portuguese armário', timber: 'merbau', price: 7400,
      desc: 'Four dovetailed nyatoh drawers over two doors on wooden knuckle hinges, in a merbau case. The back is tongue-and-groove and finished like the front, because in a terrace house a sideboard often ends up as a room divider.',
      photos: [['piece-almari-sideboard.jpg', 'The Almari sideboard'], ['detail-handle.jpg', 'A carved finger pull'], ['make-joinery.jpg', 'Hand-cut dovetails']],
      spec: [['Size', '160 × 45 × 78 cm'], ['Drawers', 'Four, hand-cut dovetails'], ['Doors', 'Two, on wooden knuckle hinges'], ['Weight', 'About 74 kg'], ['Lead time', '10 weeks']] },
    serambi: { no: 'KL-05 · Seating', name: 'Serambi bench', meaning: 'Serambi: the veranda', timber: 'chengal', price: 1350,
      desc: 'Our five-foot-way bench: one thick plank on four splayed legs, wedged from the top so the joints tighten as the wood settles. Heavy enough to stay put outdoors, as long as it has a roof over it.',
      photos: [['piece-serambi-bench.jpg', 'The Serambi bench by an old door'], ['grain-chengal.jpg', 'Chengal grain'], ['make-chisel.jpg', 'Chisel work']],
      spec: [['Size', '150 × 30 × 46 cm, seats 3'], ['Joinery', 'Through-wedged staked legs'], ['Outdoors', 'Yes, under cover (chengal only)'], ['Weight', '16 kg'], ['Lead time', '6 weeks']] },
    anjung: { no: 'KL-10 · Tables', name: 'Anjung coffee table', meaning: 'Anjung: the porch, the front room', timber: 'chengal', price: 3200,
      desc: 'A low table with a 6 cm solid top and a shelf below for newspapers and the remote. Every corner is rounded by hand plane, so small children meet a curve, not an edge.',
      photos: [['piece-anjung-table.jpg', 'The Anjung coffee table', true], ['grain-chengal.jpg', 'Chengal grain'], ['make-oil.jpg', 'Oiling a top by hand']],
      spec: [['Size', '130 × 70 × 38 cm'], ['Top', '6 cm solid, two boards'], ['Joinery', 'Bridle joints, pegged'], ['Weight', 'About 41 kg'], ['Lead time', '8 weeks']] },
    ruang: { no: 'KL-06 · Storage', name: 'Ruang wall shelves, set of 3', meaning: 'Ruang: space, a room', timber: 'nyatoh', price: 960, unit: 'the set',
      desc: 'Solid shelves that hang on a hidden wooden cleat, a sliding dovetail fixed to your wall. The wall is the one place we allow screws. Each shelf holds 25 kg of books without a bracket in sight.',
      photos: [['piece-ruang-shelf.jpg', 'Three Ruang shelves in an alcove', true], ['make-joinery.jpg', 'A dovetail, the shape of the hidden cleat'], ['grain-nyatoh.jpg', 'Nyatoh grain']],
      spec: [['Size', '90 × 22 × 3.5 cm each'], ['Fixing', 'Hidden sliding-dovetail cleat'], ['Load', '25 kg per shelf'], ['Fitting', 'Free on Penang island'], ['Lead time', '5 weeks']] },
    tulis: { no: 'KL-08 · Tables', name: 'Tulis writing desk', meaning: 'Tulis: to write', timber: 'nyatoh', price: 2900,
      desc: 'A slim desk for a bedroom corner or a shophouse mezzanine. One shallow drawer for the charger, legs tapered on the inside faces, and a cable notch cut exactly where you need it, measured when you visit.',
      photos: [['piece-tulis-desk.jpg', 'The Tulis desk under a wall shelf', true], ['detail-handle.jpg', 'A carved finger pull'], ['grain-nyatoh.jpg', 'Nyatoh grain']],
      spec: [['Size', '120 × 60 × 74 cm'], ['Drawer', 'One, dovetailed, carved pull'], ['Joinery', 'Mortise and tenon'], ['Weight', '22 kg'], ['Lead time', '7 weeks']] },
    laci: { no: 'KL-09 · Storage', name: 'Laci chest, restored', meaning: 'Laci: a drawer', timber: 'chengal', price: 4600, ready: true, oneoff: true,
      desc: 'A 1950s chengal chest from a house in Jelutong that came to us with two split sides and a missing drawer. We re-cut the joints, made a new bottom drawer from matching boards, and kept the original brass pulls and carved trim. There is only one.',
      photos: [['piece-laci-drawers.jpg', 'The restored Laci chest'], ['detail-handle.jpg', 'Drawer detail'], ['visit-showroom.jpg', 'In the showroom']],
      spec: [['Size', '100 × 48 × 90 cm'], ['Made', 'About 1955; restored 2026'], ['Drawers', 'Four, one of them new'], ['Weight', '48 kg'], ['Availability', 'One-off, in the showroom']] },
    dulang: { no: 'KL-11 · Small things', name: 'Dulang serving trays, a pair', meaning: 'Dulang: a tray', timber: 'merbau', price: 190, ready: true, unit: 'the pair',
      desc: 'Carved from merbau offcuts left over from table tops, with cut-in handles and no feet so they sit flat on a counter. Oiled with food-safe oil. Wash by hand and dry standing up.',
      photos: [['piece-dulang-trays.jpg', 'A pair of Dulang trays', true], ['grain-merbau.jpg', 'Merbau grain'], ['make-chisel.jpg', 'Carving by chisel']],
      spec: [['Sizes', '52 × 16 cm and 44 × 14 cm'], ['Food-safe', 'Yes; hand wash only'], ['Weight', '0.9 kg the pair'], ['Availability', 'About a dozen pairs in the showroom']] }
  };

  var rm = function (n) { return 'RM' + Math.round(n).toLocaleString('en-MY'); };
  var r10 = function (n) { return Math.round(n / 10) * 10; };
  var r100 = function (n) { return Math.round(n / 100) * 100; };
  var priceIn = function (p, t) { return t === p.timber ? p.price : r10(p.price / TIMBER[p.timber].f * TIMBER[t].f); };

  /* ---------- toast (every demo action) ---------- */
  var toast = $('[data-toast]'), tt;
  function showToast() {
    toast.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-demo]');
    if (b) { e.preventDefault(); showToast(); }
  });
  var form = $('[data-demo-form]');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); showToast(); });

  /* ---------- filters ---------- */
  var grid = $('[data-grid]'), note = $('[data-filter-note]');
  var NOTES = { all: '', seating: 'Showing 4 seating pieces.', tables: 'Showing 3 tables.', storage: 'Showing 3 storage pieces.', small: 'Showing 1 small thing. More in the showroom.', ready: '3 pieces finished and waiting in the showroom. Take them home this week.' };
  $$('.filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      $$('.filters button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      $$('.piece', grid).forEach(function (el) {
        var cats = (el.getAttribute('data-cat') || '').split(' ');
        el.hidden = f === 'all' ? false : cats.indexOf(f) === -1;
      });
      note.textContent = NOTES[f] || '';
    });
  });

  /* ---------- piece sheet ---------- */
  var sheet = $('[data-sheet]'), panel = $('.sheet-panel', sheet), mainImg = $('[data-sheet-main]'), thumbs = $('[data-sheet-thumbs]');
  var opts = $('[data-sheet-options]'), priceEl = $('[data-sheet-price]'), priceNote = $('[data-sheet-price-note]');
  var lastFocus = null, current = null;

  function setMain(ph) {
    mainImg.src = A + ph[0];
    mainImg.alt = ph[1];
    mainImg.classList.toggle('mb', !!ph[2]);
  }
  function setPrice(t) {
    var p = current;
    priceEl.textContent = rm(priceIn(p, t));
    priceNote.textContent = (p.unit ? p.unit + ' · ' : '') + (p.ready ? 'as shown, ready now' : 'in ' + TIMBER[t].name.toLowerCase() + ', delivery extra');
  }
  function openSheet(id, trigger) {
    var p = PIECES[id]; if (!p) return;
    current = p; lastFocus = trigger || document.activeElement;
    $('[data-sheet-no]').textContent = p.no;
    $('[data-sheet-title]').textContent = p.name;
    $('[data-sheet-meaning]').textContent = p.meaning;
    $('[data-sheet-desc]').textContent = p.desc;
    setMain(p.photos[0]);
    thumbs.innerHTML = '';
    p.photos.forEach(function (ph, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show photo ' + (i + 1) + ': ' + ph[1]);
      b.setAttribute('aria-current', String(i === 0));
      b.innerHTML = '<img src="' + A + ph[0] + '" alt="">';
      b.addEventListener('click', function () {
        setMain(ph);
        $$('button', thumbs).forEach(function (x) { x.setAttribute('aria-current', String(x === b)); });
      });
      thumbs.appendChild(b);
    });
    var list = p.ready ? [p.timber] : ['nyatoh', 'merbau', 'chengal'];
    opts.innerHTML = list.map(function (t) {
      return '<label><input type="radio" name="sheet-timber" value="' + t + '"' + (t === p.timber ? ' checked' : '') + '>' +
        '<span><i style="background-image:url(' + TIMBER[t].img + ')"></i>' + TIMBER[t].name + (p.ready ? '' : ' · ' + rm(priceIn(p, t))) + '</span></label>';
    }).join('');
    $$('input', opts).forEach(function (inp) { inp.addEventListener('change', function () { setPrice(inp.value); }); });
    setPrice(p.timber);
    $('[data-sheet-spec]').innerHTML = p.spec.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('');
    sheet.hidden = false;
    document.body.classList.add('locked');
    panel.scrollTop = 0;
    panel.focus();
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.hidden = true;
    document.body.classList.remove('locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { openSheet(b.getAttribute('data-open'), b); });
  });
  $$('[data-close]', sheet).forEach(function (b) { b.addEventListener('click', closeSheet); });
  var go = $('[data-close-go]', sheet);
  if (go) go.addEventListener('click', function () { lastFocus = null; closeSheet(); });
  document.addEventListener('keydown', function (e) {
    if (sheet.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key === 'Tab') { // keep focus inside the dialog
      var f = $$('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- commission estimate ---------- */
  var estPiece = $('[data-est-piece]'), estTimber = $('[data-est-timber]'), estSize = $('[data-est-size]'), estOut = $('[data-est-out]'), estNote = $('[data-est-note]');
  // option values in the HTML are the catalogue prices; map them back to pieces
  var BY_PRICE = {};
  Object.keys(PIECES).forEach(function (k) { BY_PRICE[PIECES[k].price] = PIECES[k]; });
  function estimate() {
    var p = BY_PRICE[estPiece.value];
    if (!p) { estOut.textContent = 'We price it from the drawing'; estNote.textContent = ', free, within three working days'; return; }
    var size = parseFloat(estSize.value), t = estTimber.value;
    var lo, hi;
    if (t === 'unsure') { lo = priceIn(p, 'nyatoh') * size * .92; hi = priceIn(p, 'chengal') * size * 1.08; }
    else { var v = priceIn(p, t) * size; lo = v * .92; hi = v * 1.08; }
    estOut.textContent = rm(r100(lo)) + ' – ' + rm(r100(hi));
    estNote.textContent = ', before delivery';
  }
  [estPiece, estTimber, estSize].forEach(function (el) { if (el) el.addEventListener('change', estimate); });
  if (estPiece) estimate();

  /* ---------- showroom status (Malaysia time) ---------- */
  function klNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (x) { o[x.type] = x.value; });
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: parseInt(o.hour, 10) % 24, m: parseInt(o.minute, 10) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), h: d.getHours(), m: d.getMinutes() }; }
  }
  function status() {
    var n = klNow(), openDays = [4, 5, 6, 0], isDay = openDays.indexOf(n.day) > -1, t = n.h * 60 + n.m;
    var open = isDay && t >= 660 && t < 1080, text;
    if (open) text = 'Showroom open now, until 6pm';
    else if (isDay && t < 660) text = 'Showroom opens at 11am today';
    else {
      var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var d = (n.day + 1) % 7; while (openDays.indexOf(d) === -1) d = (d + 1) % 7;
      text = 'Showroom closed · opens ' + (d === (n.day + 1) % 7 ? 'tomorrow' : names[d]) + ', 11am';
    }
    $$('[data-status]').forEach(function (el) {
      el.setAttribute('data-open-now', open ? '1' : '0');
      $('[data-status-text]', el).textContent = text;
    });
  }
  status();
  setInterval(status, 60000);

  /* ---------- making story + reveals (rect checks on scroll; no IntersectionObserver) ---------- */
  var steps = $$('[data-step]'), stepImgs = $$('[data-step-img]'), dots = $$('.story-dots li'), media = $('.story-media');
  var reveals = $$('.rv'), active = -1, ticking = false;
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var r = reveals[i].getBoundingClientRect();
      if (r.top < vh * .92 && r.bottom > 0) { reveals[i].classList.add('in'); reveals.splice(i, 1); }
    }
    if (media && media.offsetParent !== null) {
      var mid = vh * .5, best = 0, bestD = Infinity;
      steps.forEach(function (s, i) {
        var b = s.getBoundingClientRect(), d = Math.abs((b.top + Math.min(b.height, vh) / 2) - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== active) {
        active = best;
        steps.forEach(function (s, i) { s.classList.toggle('on', i === best); });
        stepImgs.forEach(function (im, i) { im.classList.toggle('on', i === best); });
        dots.forEach(function (d, i) { d.classList.toggle('on', i === best); });
      }
    }
  }
  function req() { if (!ticking) { ticking = true; setTimeout(onScroll, 40); } } // setTimeout, not rAF: rAF stalls in throttled tabs
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  window.addEventListener('load', onScroll);
  onScroll();
  if (reduce) reveals.forEach(function (el) { el.classList.add('in'); });
})();
