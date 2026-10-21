/* Sinar Dental concept site. Everything is a demo: no booking, form or call leaves this page. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hours (visitor's clock) ---------- */
  // [open hour, close hour] by getDay(); null = closed. Lunch 13-14 has no slots.
  var HOURS = [null, [9, 21], [9, 21], [9, 21], [9, 21], [9, 21], [9, 17]];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtH(h) { var hh = Math.floor(h), m = Math.round((h - hh) * 60), ap = hh >= 12 ? 'pm' : 'am', h12 = hh % 12 || 12; return h12 + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ap; }

  var now = new Date();
  function statusText() {
    var d = now.getDay(), h = now.getHours() + now.getMinutes() / 60, r = HOURS[d];
    if (r && h >= r[0] && h < r[1]) {
      if (r[1] - h <= 0.5) return ['soon', 'Closing soon · until ' + fmtH(r[1])];
      return ['open', 'Open now · until ' + fmtH(r[1])];
    }
    if (r && h < r[0]) return ['closed', 'Closed · opens ' + fmtH(r[0]) + ' today'];
    for (var i = 1; i <= 7; i++) {
      var nd = (d + i) % 7;
      if (HOURS[nd]) return ['closed', 'Closed · opens ' + (i === 1 ? 'tomorrow' : DAYS[nd]) + ' ' + fmtH(HOURS[nd][0])];
    }
  }
  function paintStatus() {
    now = new Date();
    var s = statusText();
    $$('[data-status]').forEach(function (el) {
      el.classList.remove('open', 'soon', 'closed');
      el.classList.add(s[0]);
      el.textContent = s[1];
    });
    var rows = $$('#hours > div'), order = [1, 2, 3, 4, 5, 6, 0];
    rows.forEach(function (row, i) {
      var isToday = order[i] === now.getDay();
      row.classList.toggle('today', isToday);
      var dt = $('dt', row);
      dt.textContent = DAYS[order[i]] + (isToday ? ' (today)' : '');
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- Slots (deterministic demo availability) ---------- */
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function slotsFor(date) {
    var r = HOURS[date.getDay()], out = [];
    if (!r) return out;
    var isToday = dayKey(date) === dayKey(now), cutoff = now.getHours() + now.getMinutes() / 60 + 1;
    for (var t = r[0]; t <= r[1] - 0.5; t += 0.5) {
      if (t >= 13 && t < 14) continue;
      if (isToday && t < cutoff) continue;
      var taken = hash(dayKey(date) + '@' + t) % 100 < (t >= 18 ? 55 : 42);
      out.push({ t: t, taken: taken });
    }
    return out;
  }
  function openDays(n) {
    var list = [], d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (var i = 0; list.length < n && i < 21; i++) {
      var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (HOURS[x.getDay()] && slotsFor(x).length) list.push(x);
    }
    return list;
  }
  function dayLabel(x) {
    var diff = Math.round((new Date(x.getFullYear(), x.getMonth(), x.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : DAYS[x.getDay()];
  }
  // Next free slot chip in the hero
  (function () {
    var days = openDays(10);
    for (var i = 0; i < days.length; i++) {
      var free = slotsFor(days[i]).filter(function (s) { return !s.taken; })[0];
      if (free) {
        var chip = $('[data-next-slot]');
        chip.innerHTML = 'Next free slot: <b>' + dayLabel(days[i]) + ', ' + fmtH(free.t) + '</b>';
        chip.setAttribute('data-day', dayKey(days[i])); chip.setAttribute('data-t', free.t);
        return;
      }
    }
  })();

  /* ---------- Toast ---------- */
  var toastEl = $('.toast'), msgEl = $('.t-msg', toastEl), toastTimer;
  function toast(prefix) {
    msgEl.textContent = prefix || '';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 4600);
  }
  $$('[data-demo]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); toast(); }); });

  /* ---------- Mobile menu ---------- */
  var mb = $('.menu-btn'), mn = $('#mnav');
  function closeMenu() { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.textContent = 'Menu'; }
  mb.addEventListener('click', function () { var o = mn.classList.toggle('open'); mb.setAttribute('aria-expanded', o); mb.textContent = o ? 'Close' : 'Menu'; });
  $$('a', mn).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Price tabs ---------- */
  var tabs = $$('.ptabs [role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });
  selectTab(tabs[0]);

  /* ---------- Treatments + detail panel ---------- */
  var T = {
    checkup: { name: 'Check-up & clean', img: 'assets/t-checkup.jpg', book: 'checkup', time: '45 minutes', price: 'RM170',
      intro: 'A look at every tooth and your gums, then a scale and polish to lift off tartar your brush can\'t reach.',
      steps: ['We chat about anything bothering you, chair upright.', 'Your dentist checks each tooth and your gums, and takes intraoral photos you can see on screen.', 'X-rays only if they are needed, and we tell you why first.', 'Scale and polish with an ultrasonic scaler and a gritty-but-mild paste.', 'You get a written list of anything that needs doing, with prices.'],
      note: 'RM50 check-up plus RM120 to RM180 for the clean. Most people come back every six months.' },
    filling: { name: 'Fillings', img: 'assets/t-fillings.jpg', book: 'filling', time: '30–60 minutes', price: 'RM150',
      intro: 'Repairing a small hole or a chipped edge with tooth-coloured composite, shaded to match your tooth.',
      steps: ['We numb the area first if it\'s needed. Most people only feel a pinch.', 'The decayed part is removed and the tooth is cleaned.', 'Composite is layered in and set with a blue curing light.', 'We shape and polish it, then check your bite with thin paper.'],
      note: 'RM150 to RM300 per tooth depending on size. You can eat once the numbness wears off.' },
    rootcanal: { name: 'Root canal', img: 'assets/t-rootcanal.jpg', book: 'pain', time: 'Usually 2 visits', price: 'RM700',
      intro: 'Cleaning out the inside of a tooth when the nerve is infected or inflamed, so the tooth can stay.',
      steps: ['An X-ray shows the roots and the infection.', 'The tooth is fully numbed before anything starts.', 'The canals are cleaned, shaped and filled with a rubber-like material.', 'A temporary filling goes on; a crown is usually advised for back teeth later.'],
      note: 'From RM700 for a front tooth and RM1,200 for a back tooth. The tooth may feel tender for a few days afterwards.' },
    aligners: { name: 'Braces & clear aligners', img: 'assets/t-aligners.jpg', book: 'aligners', time: '12–24 months', price: 'RM5,500',
      intro: 'Moving teeth into a straighter, easier-to-clean position, with metal or ceramic braces or a series of clear trays.',
      steps: ['A 30-minute consultation with photos and a full-mouth X-ray.', 'A written plan comparing the options, how long each takes and the full price.', 'Braces are fitted in one visit, or aligner scans are taken for your trays.', 'Check-ins every 4 to 8 weeks, which fit well in the evening slots.'],
      note: 'Metal braces from RM5,500, ceramic from RM7,000, clear aligners from RM9,000. Card instalments available.' },
    whitening: { name: 'Whitening', img: 'assets/t-whitening.jpg', book: 'whitening', time: '90 minutes in clinic', price: 'RM850',
      intro: 'Lightening the natural shade of your teeth with a peroxide gel, either in one clinic session or at home over two weeks.',
      steps: ['A quick check first: whitening is only done on healthy teeth and gums.', 'We note your current shade so you can compare afterwards.', 'In clinic: gel is applied in short rounds while your gums are protected.', 'At home: custom trays and gel, worn for about an hour a day.'],
      note: 'Take-home kit RM850, in-clinic session RM1,200. Fillings and crowns don\'t change colour.' },
    implant: { name: 'Implants & crowns', img: 'assets/t-implants.jpg', book: 'checkup', time: '2–4 months, 3–4 visits', price: 'RM1,500',
      intro: 'A crown caps a weak tooth; an implant replaces a missing one with a small titanium post and a crown on top.',
      steps: ['Consultation with a full-mouth X-ray and a scan of the area.', 'Crown: the tooth is shaped and scanned, and the crown is fitted about a week later.', 'Implant: the post is placed under local anaesthetic, then left to settle for a few months.', 'The final crown is fitted and your bite is adjusted.'],
      note: 'Porcelain crowns from RM1,500. Implants including the crown from RM6,500. Quoted in writing after the scan.' }
  };
  var panel = $('#tpanel'), lastFocus = null, current = null;
  var hasDialog = panel && typeof panel.showModal === 'function';
  function showT(id, trigger) {
    var t = T[id]; current = t; lastFocus = trigger || document.activeElement;
    $('#tp-img').src = t.img;
    $('#tp-title').textContent = t.name;
    $('#tp-intro').textContent = t.intro;
    $('#tp-time').textContent = t.time;
    $('#tp-price').textContent = t.price;
    $('#tp-steps').innerHTML = t.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    $('#tp-note').textContent = t.note;
    if (hasDialog) panel.showModal(); else panel.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    $('.x', panel).focus();
  }
  function closeT() { if (hasDialog && panel.open) panel.close(); else panel.removeAttribute('open'); }
  panel.addEventListener('close', function () { document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); });
  if (!hasDialog) document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.hasAttribute('open')) { closeT(); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); } });
  panel.addEventListener('click', function (e) { if (e.target === panel) closeT(); }); // backdrop click
  $$('[data-close]', panel).forEach(function (b) { b.addEventListener('click', closeT); });
  $$('[data-treat]').forEach(function (b) { b.addEventListener('click', function () { showT(b.getAttribute('data-treat'), b); }); });
  $('#tp-book').addEventListener('click', function () {
    var id = current.book; lastFocus = null; closeT();
    startBooking(id);
  });

  /* ---------- Booking flow ---------- */
  var form = $('#booker'), step = 1, pickDay = null, pickT = null;
  var labels = { checkup: 'Check-up & clean', pain: 'Something hurts', filling: 'Filling', aligners: 'Braces / aligner chat', whitening: 'Whitening', kids: 'Kids\' visit' };
  var nextLabels = { 1: 'Next: day & time', 2: 'Next: your details', 3: 'Next: check', 4: 'Confirm booking' };
  var daysEl = $('#days'), slotsEl = $('#slots'), err = $('#err');
  var dayList = openDays(7);

  function renderDays() {
    daysEl.innerHTML = dayList.map(function (d, i) {
      var free = slotsFor(d).filter(function (s) { return !s.taken; }).length;
      return '<button type="button" class="day" data-i="' + i + '" aria-pressed="' + (pickDay && dayKey(pickDay) === dayKey(d)) + '">' +
        '<small>' + (dayLabel(d) === 'Today' ? 'Today' : SHORT[d.getDay()]) + '</small><b>' + d.getDate() + '</b><small>' + MONTHS[d.getMonth()] + '</small><i>' + free + ' free</i></button>';
    }).join('');
  }
  function renderSlots() {
    if (!pickDay) { slotsEl.innerHTML = '<p class="no-slots">Pick a day to see times.</p>'; return; }
    var list = slotsFor(pickDay);
    slotsEl.innerHTML = list.map(function (s) {
      return '<button type="button" class="slot' + (s.t >= 18 ? ' eve' : '') + '" data-t="' + s.t + '"' + (s.taken ? ' disabled aria-label="' + fmtH(s.t) + ', taken"' : '') +
        ' aria-pressed="' + (pickT === s.t) + '">' + fmtH(s.t) + '</button>';
    }).join('') || '<p class="no-slots">No times left on this day.</p>';
  }
  daysEl.addEventListener('click', function (e) {
    var b = e.target.closest('.day'); if (!b) return;
    pickDay = dayList[+b.getAttribute('data-i')]; pickT = null;
    renderDays(); renderSlots();
    var nb = daysEl.querySelector('[data-i="' + b.getAttribute('data-i') + '"]'); if (nb) nb.focus();
  });
  slotsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.slot'); if (!b || b.disabled) return;
    pickT = +b.getAttribute('data-t'); err.textContent = '';
    $$('.slot', slotsEl).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
  });

  function show(n) {
    step = n;
    $$('.step', form).forEach(function (f) { f.classList.toggle('on', +f.getAttribute('data-step') === n); });
    $$('.progress li', form).forEach(function (li) {
      var k = +li.getAttribute('data-pstep');
      li.classList.toggle('on', k === n); li.classList.toggle('past', k < n);
      if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $('#back').hidden = n === 1;
    $('#next').textContent = nextLabels[n];
    if (n === 2) { renderDays(); renderSlots(); }
    if (n === 4) renderSummary();
  }
  function stepError(msg) {
    var box = $('.step.on .err', form) || $('.step.on', form), p = $('.step.on .tmp-err', form);
    if (step === 3) { err.textContent = msg; return; }
    if (!p) { p = document.createElement('p'); p.className = 'err tmp-err'; p.setAttribute('role', 'alert'); p.style.marginTop = '12px'; box.appendChild(p); }
    p.textContent = msg;
  }
  function clearTmp() { $$('.tmp-err', form).forEach(function (p) { p.remove(); }); err.textContent = ''; }
  function renderSummary() {
    var tr = form.querySelector('input[name="treat"]:checked').value;
    var rows = [
      ['Treatment', labels[tr]],
      ['When', dayLabel(pickDay) + ', ' + pickDay.getDate() + ' ' + MONTHS[pickDay.getMonth()] + ' at ' + fmtH(pickT)],
      ['Name', form.elements.name.value.trim()],
      ['Mobile', form.phone.value.trim()],
      ['Paying by', form.payer.value]
    ];
    if (form.nervous.checked) rows.push(['Extra time', 'Yes, longer slot']);
    $('#summary').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd></dd></div>'; }).join('');
    $$('#summary dd').forEach(function (dd, i) { dd.textContent = rows[i][1]; }); // textContent: never inject typed text as HTML
  }
  $('#next').addEventListener('click', function () {
    clearTmp();
    if (step === 2 && (!pickDay || pickT === null)) { stepError('Pick a day and a free time first.'); return; }
    if (step === 3) {
      if (!form.elements.name.value.trim()) { err.textContent = 'Please add your name.'; form.elements.name.focus(); return; }
      if (!/^[0-9+\-\s]{8,}$/.test(form.phone.value.trim())) { err.textContent = 'Please add a mobile number we could reach you on.'; form.phone.focus(); return; }
    }
    if (step < 4) { show(step + 1); $('.step.on legend', form).setAttribute('tabindex', '-1'); $('.step.on legend', form).focus({ preventScroll: true }); return; }
    // Step 4: confirm (demo only)
    $$('.step', form).forEach(function (f) { f.classList.remove('on'); });
    $('.bk-nav', form).style.display = 'none';
    $('.progress', form).style.visibility = 'hidden';
    $('#done').hidden = false; $('#done').focus();
    toast('Demo booking.');
  });
  $('#back').addEventListener('click', function () { clearTmp(); if (step > 1) show(step - 1); });
  $('#again').addEventListener('click', function () {
    form.reset(); pickDay = null; pickT = null;
    $('#done').hidden = true; $('.bk-nav', form).style.display = ''; $('.progress', form).style.visibility = '';
    show(1);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); toast(); });

  function startBooking(treat, dayK, t) {
    if (treat) { var r = form.querySelector('input[name="treat"][value="' + treat + '"]'); if (r) r.checked = true; }
    $('#done').hidden = true; $('.bk-nav', form).style.display = ''; $('.progress', form).style.visibility = '';
    if (dayK) {
      pickDay = dayList.filter(function (d) { return dayKey(d) === dayK; })[0] || null; pickT = pickDay ? +t : null;
      show(pickDay ? 2 : 1);
    } else show(1);
    document.getElementById('book').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () { var f = $('.step.on input:checked', form) || $('.step.on .slot[aria-pressed="true"]', form) || $('#next'); if (f) f.focus({ preventScroll: true }); }, reduce ? 0 : 500);
  }
  $$('[data-book]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); startBooking(a.getAttribute('data-book')); }); });
  var chip = $('[data-next-slot]');
  chip.setAttribute('role', 'button'); chip.tabIndex = 0; chip.style.cursor = 'pointer';
  function chipGo() { if (chip.getAttribute('data-day')) startBooking(null, chip.getAttribute('data-day'), chip.getAttribute('data-t')); }
  chip.addEventListener('click', chipGo);
  chip.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chipGo(); } });
  show(1);

  /* ---------- Reveal on scroll: rect checks on scroll (IntersectionObserver stalls in throttled tabs) ---------- */
  var rv = $$('.rv');
  if (reduce) { rv.forEach(function (el) { el.classList.add('in'); }); rv = []; }
  function check() {
    var vh = window.innerHeight;
    for (var i = rv.length - 1; i >= 0; i--) {
      var r = rv[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { rv[i].classList.add('in'); rv.splice(i, 1); }
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  check();
  setTimeout(check, 300);
})();
