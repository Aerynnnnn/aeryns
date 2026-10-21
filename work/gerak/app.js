/* Gerak Studio (fictional) · concept by Aeryn's. No data leaves the page: every booking button only shows a toast. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- time in Kuala Lumpur (GMT+8), with ?at=2026-10-21T07:00 for reviews ---------- */
  function klNow() {
    var forced = /[?&]at=([0-9T:\-]+)/.exec(location.search);
    var d = forced ? new Date(forced[1] + ':00Z') : new Date(Date.now() + 8 * 3600e3);
    if (isNaN(d)) d = new Date(Date.now() + 8 * 3600e3);
    return { dow: d.getUTCDay(), mins: d.getUTCHours() * 60 + d.getUTCMinutes(), date: d };
  }
  var NOW = klNow();

  /* ---------- weekly timetable: [time, type, class name, level, minutes, coach, booked of 8, waitlist] ---------- */
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var WEEK = {
    Mon: [['06:30', 'reformer', 'Reformer Flow', 'All levels', 50, 'Aina', 8, 2], ['07:45', 'strength', 'Strength 45', 'All levels', 45, 'Wei Jie', 6], ['12:15', 'reformer', 'Reformer Express', 'All levels', 45, 'Wei Jie', 5], ['18:00', 'strength', 'Kettlebell Basics', 'Beginner', 45, 'Hafiz', 7], ['19:15', 'reformer', 'Reformer Foundations', 'Beginner', 50, 'Priya', 8, 4], ['20:30', 'mobility', 'Mobility Reset', 'All levels', 40, 'Priya', 4]],
    Tue: [['06:30', 'strength', 'Strength 45', 'All levels', 45, 'Wei Jie', 5], ['07:45', 'reformer', 'Reformer Flow', 'All levels', 50, 'Aina', 7], ['09:30', 'reformer', 'Reformer Foundations', 'Beginner', 50, 'Aina', 3], ['12:15', 'strength', 'Strength Express', 'All levels', 45, 'Wei Jie', 4], ['18:00', 'reformer', 'Reformer Burn', 'Intermediate', 50, 'Priya', 8, 3], ['19:15', 'strength', 'Strength 45', 'All levels', 45, 'Hafiz', 6], ['20:30', 'mobility', 'Mobility Reset', 'All levels', 40, 'Priya', 5]],
    Wed: [['06:30', 'reformer', 'Reformer Burn', 'Intermediate', 50, 'Aina', 7], ['07:45', 'mobility', 'Mobility Reset', 'All levels', 40, 'Aina', 3], ['12:15', 'reformer', 'Reformer Express', 'All levels', 45, 'Wei Jie', 6], ['18:00', 'strength', 'Strength 45', 'All levels', 45, 'Hafiz', 8, 1], ['19:15', 'reformer', 'Reformer Flow', 'All levels', 50, 'Wei Jie', 7], ['20:30', 'mobility', 'Mobility Reset', 'All levels', 40, 'Priya', 2]],
    Thu: [['06:30', 'reformer', 'Reformer Flow', 'All levels', 50, 'Aina', 8, 1], ['07:45', 'strength', 'Strength 45', 'All levels', 45, 'Wei Jie', 4], ['09:30', 'mobility', 'Mobility Reset', 'All levels', 40, 'Aina', 2], ['12:15', 'reformer', 'Reformer Express', 'All levels', 45, 'Wei Jie', 6], ['18:00', 'reformer', 'Reformer Foundations', 'Beginner', 50, 'Priya', 7], ['19:15', 'strength', 'Kettlebell Basics', 'Beginner', 45, 'Hafiz', 5], ['20:30', 'reformer', 'Reformer Burn', 'Intermediate', 50, 'Priya', 6]],
    Fri: [['06:30', 'strength', 'Strength 45', 'All levels', 45, 'Wei Jie', 6], ['07:45', 'reformer', 'Reformer Flow', 'All levels', 50, 'Aina', 8, 2], ['12:15', 'mobility', 'Mobility Reset', 'All levels', 40, 'Aina', 3], ['18:00', 'reformer', 'Reformer Burn', 'Intermediate', 50, 'Priya', 6], ['19:15', 'strength', 'Strength 45', 'All levels', 45, 'Hafiz', 4], ['20:30', 'mobility', 'Mobility Reset', 'All levels', 40, 'Priya', 2]],
    Sat: [['08:00', 'reformer', 'Reformer Foundations', 'Beginner', 50, 'Aina', 8, 5], ['08:15', 'strength', 'Strength 45', 'All levels', 45, 'Hafiz', 7], ['09:30', 'reformer', 'Reformer Flow', 'All levels', 50, 'Aina', 8, 3], ['09:45', 'strength', 'Kettlebell Basics', 'Beginner', 45, 'Hafiz', 5], ['11:00', 'reformer', 'Reformer Burn', 'Intermediate', 50, 'Wei Jie', 6]],
    Sun: [['09:00', 'mobility', 'Mobility Reset', 'All levels', 40, 'Priya', 6], ['10:15', 'reformer', 'Reformer Flow', 'All levels', 50, 'Priya', 8, 2], ['10:30', 'strength', 'Strength 45', 'All levels', 45, 'Hafiz', 5], ['11:30', 'reformer', 'Reformer Foundations', 'Beginner', 50, 'Priya', 4]]
  };
  var CAP = 8;
  var todayKey = DAYS[(NOW.dow + 6) % 7];

  function toMins(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function ampm(t) {
    var m = toMins(t), h = Math.floor(m / 60), mm = m % 60;
    return ((h + 11) % 12 + 1) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h < 12 ? 'am' : 'pm');
  }
  function clock(t) { var m = toMins(t), h = Math.floor(m / 60); return ((h + 11) % 12 + 1) + ':' + String(m % 60).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- timetable UI ---------- */
  var daysEl = $('#days'), ttEl = $('#tt'), filtersEl = $('#filters');
  var state = { day: todayKey, type: 'all' };

  function monday() {
    var d = new Date(NOW.date.getTime());
    d.setUTCDate(d.getUTCDate() - ((NOW.dow + 6) % 7));
    return d;
  }

  function buildDays() {
    if (!daysEl) return;
    var mon = monday();
    daysEl.innerHTML = DAYS.map(function (k, i) {
      var d = new Date(mon.getTime()); d.setUTCDate(mon.getUTCDate() + i);
      var label = d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
      return '<button type="button" class="day" role="tab" id="tab-' + k + '" aria-controls="tt" aria-selected="false" tabindex="-1" data-day="' + k + '">' +
        '<b>' + k + '</b><span>' + label + '</span><small>' + (k === todayKey ? 'Today' : '') + '</small></button>';
    }).join('');
  }

  function render() {
    if (!ttEl) return;
    $$('.day', daysEl).forEach(function (b) {
      var on = b.dataset.day === state.day;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
    });
    $$('.chip', filtersEl).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.type === state.type); });
    ttEl.setAttribute('aria-labelledby', 'tab-' + state.day);
    var rows = WEEK[state.day].filter(function (c) { return state.type === 'all' || c[1] === state.type; });
    if (!rows.length) {
      ttEl.innerHTML = '<p class="tt-empty">No ' + state.type + ' classes on ' + state.day + '. Try another day or <button type="button" class="text-link" data-type-reset>show all classes</button>.</p>';
      return;
    }
    var isToday = state.day === todayKey;
    ttEl.innerHTML = rows.map(function (c) {
      var t = c[0], booked = c[6], wait = c[7] || 0, left = CAP - booked, full = left <= 0;
      var past = isToday && toMins(t) + 5 <= NOW.mins;
      var meter = '';
      for (var i = 0; i < CAP; i++) meter += '<i' + (i < booked ? ' class="b"' : '') + '></i>';
      var note = full ? 'Full · ' + wait + ' on waitlist' : (left === 1 ? '1 spot left' : left + ' spots left');
      var act = past ? '<span>Started</span>'
        : full ? '<button type="button" class="btn btn-wait" data-demo>Join waitlist</button>'
        : '<button type="button" class="btn btn-lime" data-demo>Book</button>';
      return '<div class="slot' + (full ? ' full' : '') + (past ? ' past' : '') + '">' +
        '<p class="slot-time">' + clock(t) + '<small>' + (toMins(t) < 720 ? 'am' : 'pm') + ' · ' + c[4] + ' min</small></p>' +
        '<p class="slot-name"><b>' + esc(c[2]) + '</b><span><span class="tag">' + c[1] + '</span>' + esc(c[3]) + '</span></p>' +
        '<p class="slot-coach">with <b>' + esc(c[5]) + '</b></p>' +
        '<div class="slot-meter" aria-label="' + booked + ' of 8 places booked"><span class="meter" aria-hidden="true">' + meter + '</span><span class="meter-note">' + note + '</span></div>' +
        '<div class="slot-act">' + act + '</div></div>';
    }).join('');
  }

  if (daysEl) {
    buildDays();
    daysEl.addEventListener('click', function (e) {
      var b = e.target.closest('.day'); if (!b) return;
      state.day = b.dataset.day; render();
    });
    daysEl.addEventListener('keydown', function (e) {
      var i = DAYS.indexOf(state.day), n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % 7; else if (e.key === 'ArrowLeft') n = (i + 6) % 7;
      else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = 6;
      if (n === null) return;
      e.preventDefault(); state.day = DAYS[n]; render();
      var tab = $('#tab-' + state.day); tab.focus(); tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      state.type = b.dataset.type; render();
    });
    ttEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-type-reset]')) { state.type = 'all'; render(); }
    });
    // "See reformer times" links pre-filter the timetable
    $$('[data-filter-link]').forEach(function (a) {
      a.addEventListener('click', function () { state.type = a.dataset.filterLink; render(); });
    });
    render();
    var sel = $('#tab-' + state.day);
    if (sel && daysEl.scrollWidth > daysEl.clientWidth) daysEl.scrollLeft = Math.max(0, sel.offsetLeft - 8);
  }

  /* ---------- hero "next up" line ---------- */
  (function nextUp() {
    var el = $('#next-class span'); if (!el) return;
    for (var off = 0; off < 7; off++) {
      var key = DAYS[(DAYS.indexOf(todayKey) + off) % 7];
      var list = WEEK[key];
      for (var j = 0; j < list.length; j++) {
        var c = list[j];
        if (off === 0 && toMins(c[0]) <= NOW.mins) continue;
        var left = CAP - c[6];
        var when = off === 0 ? 'Today' : off === 1 ? 'Tomorrow' : key;
        el.innerHTML = when + ' ' + ampm(c[0]) + ' · ' + esc(c[2]) + ' with ' + esc(c[5]) + ' · ' +
          (left > 0 ? '<span class="ok">' + left + (left === 1 ? ' spot' : ' spots') + ' left</span>' : 'full, waitlist open');
        return;
      }
    }
  })();

  /* ---------- open now + today's hours ---------- */
  (function openNow() {
    var HOURS = { 0: ['08:45', '12:30'], 1: ['06:15', '21:30'], 2: ['06:15', '21:30'], 3: ['06:15', '21:30'], 4: ['06:15', '21:30'], 5: ['06:15', '21:30'], 6: ['07:45', '13:00'] };
    $$('.hours tr[data-days]').forEach(function (tr) {
      if (tr.dataset.days.split(',').indexOf(String(NOW.dow)) > -1) tr.classList.add('today');
    });
    var el = $('#open-now'); if (!el) return;
    var h = HOURS[NOW.dow], o = toMins(h[0]), c = toMins(h[1]);
    if (NOW.mins >= o && NOW.mins < c) { el.textContent = 'Open now · until ' + ampm(h[1]); el.className = 'open-now is-open'; }
    else {
      var nd = NOW.mins < o ? NOW.dow : (NOW.dow + 1) % 7;
      el.textContent = 'Closed now · opens ' + (nd === NOW.dow ? 'today' : 'tomorrow') + ' at ' + ampm(HOURS[nd][0]);
      el.className = 'open-now is-closed';
    }
  })();

  /* ---------- demo toast: nothing is booked or sent ---------- */
  var toast = $('#toast'), toastTimer;
  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 6000);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-demo]');
    if (b) { e.preventDefault(); showToast(); }
  });
  if (toast) $('.toast-x', toast).addEventListener('click', function () { toast.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toast && !toast.hidden) toast.hidden = true; });

  /* ---------- mobile menu ---------- */
  var top = $('.top'), menuBtn = $('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = !top.classList.contains('open');
      top.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open);
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { top.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- videos: muted always; paused for reduced motion; hero toggle ---------- */
  var videos = $$('video');
  videos.forEach(function (v) { v.muted = true; v.defaultMuted = true; v.setAttribute('muted', ''); });
  var toggle = $('[data-video-toggle]');
  function setPaused(p) {
    videos.forEach(function (v) {
      if (p) { v.pause(); v.removeAttribute('autoplay'); }
      else { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    });
    if (toggle) { toggle.setAttribute('aria-pressed', p); toggle.textContent = p ? 'Play video' : 'Pause video'; }
  }
  if (reduce) setPaused(true);
  if (toggle) toggle.addEventListener('click', function () { setPaused(toggle.getAttribute('aria-pressed') !== 'true'); });
  // the coach clip only starts loading once it's near the screen
  var lazyVid = $('.eight-video');

  /* ---------- reveal on scroll + nav highlight (rect checks, no IntersectionObserver) ---------- */
  var rv = $$('.rv'), secs = $$('main section[id]'), navLinks = $$('.nav a');
  function check() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = rv.length - 1; i >= 0; i--) {
      var r = rv[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > -40) { rv[i].classList.add('in'); rv.splice(i, 1); }
    }
    if (lazyVid && !reduce && lazyVid.preload === 'none') {
      var lr = lazyVid.getBoundingClientRect();
      if (lr.top < vh * 1.5) { lazyVid.preload = 'auto'; lazyVid.load(); var p = lazyVid.play(); if (p && p.catch) p.catch(function () {}); }
    }
    var cur = '';
    for (var s = 0; s < secs.length; s++) if (secs[s].getBoundingClientRect().top < 140) cur = secs[s].id;
    navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  // called straight from the scroll event (rAF can stall in throttled tabs); the work per call is tiny
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  check();
  // safety net: if a throttled tab never fires scroll/rAF, show everything after 2.5 s
  setTimeout(function () { if (document.hidden) rv.slice().forEach(function (el) { el.classList.add('in'); }); }, 2500);
})();
