/* Srija Roy: academic website. Progressive enhancement only.
   The page is fully readable without this script; it adds the theme toggle,
   mobile menu, scroll-spy, publication filter and image viewer. */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Theme ---------- */
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }
  var MOON = 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z';
  var SUN = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4';
  function syncThemeUi() {
    var dark = currentTheme() === 'dark';
    $$('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      var path = $('svg path', btn);
      if (path) path.setAttribute('d', dark ? SUN : MOON); /* show the icon of the theme you will switch to */
    });
    $$('.theme-label').forEach(function (el) { el.textContent = dark ? 'Light theme' : 'Dark theme'; });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0c1a20' : '#08485a');
  }
  $$('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: theme still applies for this visit */ }
      syncThemeUi();
    });
  });
  syncThemeUi();

  /* ---------- External links: announce new tab to screen readers ---------- */
  $$('a[target="_blank"]').forEach(function (a) {
    var hint = document.createElement('span');
    hint.className = 'sr-only';
    hint.textContent = ' (opens in a new tab)';
    a.appendChild(hint);
  });

  /* ---------- Mobile navigation ---------- */
  var sidebar = $('#sidebar');
  var menuBtn = $('.menu-btn');
  var backdrop = $('.backdrop');
  var mobileMQ = window.matchMedia('(max-width: 900px)');

  function setMenu(open) {
    sidebar.classList.toggle('open', open);
    backdrop.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  menuBtn.addEventListener('click', function () { setMenu(!sidebar.classList.contains('open')); });
  backdrop.addEventListener('click', function () { setMenu(false); });
  $$('.nav-link, .profile, .side-links a', sidebar).forEach(function (a) {
    a.addEventListener('click', function () { if (mobileMQ.matches) setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });
  (mobileMQ.addEventListener ? mobileMQ.addEventListener.bind(mobileMQ, 'change') : mobileMQ.addListener.bind(mobileMQ))(function () { setMenu(false); });

  /* ---------- Scroll-spy ---------- */
  var links = {};
  $$('.nav-link').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var sections = Object.keys(links).map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function setActive(id) {
    Object.keys(links).forEach(function (k) {
      var on = k === id;
      links[k].classList.toggle('active', on);
      if (on) links[k].setAttribute('aria-current', 'location'); else links[k].removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    var visible = {};
    var lastId = sections[sections.length - 1].id;

    function pickActive() {
      /* at the very bottom the last section can never reach the detection band, so pick it explicitly */
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) { setActive(lastId); return; }
      /* otherwise the topmost section crossing the band in the upper part of the viewport wins */
      var best = null;
      sections.forEach(function (s) { if (visible[s.id] > 0 && best === null) best = s.id; });
      if (best) setActive(best);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      pickActive();
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] });
    sections.forEach(function (s) { io.observe(s); });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; pickActive(); });
    }, { passive: true });
  }
  setActive('home');

  /* ---------- Publication filter + search ---------- */
  var pubs = $$('.pub');
  var filterBtns = $$('.filter');
  var search = $('#pub-search');
  var count = $('#pub-count');
  var empty = $('#pub-empty');
  var activeFilter = 'all';

  function applyPubFilter() {
    var q = (search.value || '').trim().toLowerCase();
    var shown = 0;
    pubs.forEach(function (p) {
      var okType = activeFilter === 'all' || p.getAttribute('data-type') === activeFilter;
      var okText = !q || p.textContent.toLowerCase().indexOf(q) !== -1;
      var show = okType && okText;
      p.hidden = !show;
      if (show) shown++;
    });
    count.textContent = 'Showing ' + shown + ' of ' + pubs.length + ' items';
    empty.hidden = shown !== 0;
  }
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      activeFilter = b.getAttribute('data-filter');
      filterBtns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('active', on);
        x.setAttribute('aria-pressed', String(on));
      });
      applyPubFilter();
    });
  });
  search.addEventListener('input', applyPubFilter);
  $('#pub-reset').addEventListener('click', function () {
    search.value = '';
    filterBtns[0].click();
    search.focus();
  });
  applyPubFilter();

  /* ---------- Image viewer ---------- */
  var box = $('#lightbox');
  var boxImg = $('img', box);
  var boxCap = $('figcaption', box);
  var group = [];
  var idx = 0;
  var opener = null;
  var BLANK = boxImg.getAttribute('src'); /* 1px placeholder from the markup */

  function captionFor(btn) {
    var fig = btn.closest('figure');
    var cap = fig && $('figcaption', fig);
    return cap ? cap.textContent : '';
  }
  function show(i) {
    idx = (i + group.length) % group.length;
    var img = $('img', group[idx]);
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = captionFor(group[idx]) || img.alt;
    var many = group.length > 1;
    $('.lb-prev', box).hidden = !many;
    $('.lb-next', box).hidden = !many;
  }
  function open(btn) {
    var name = btn.getAttribute('data-group');
    group = $$('.zoom[data-group="' + name + '"]');
    opener = btn;
    show(group.indexOf(btn));
    if (typeof box.showModal === 'function') box.showModal(); else box.setAttribute('open', '');
  }
  $$('.zoom').forEach(function (btn) { btn.addEventListener('click', function () { open(btn); }); });
  $('.lb-close', box).addEventListener('click', function () { box.close(); });
  $('.lb-prev', box).addEventListener('click', function () { show(idx - 1); });
  $('.lb-next', box).addEventListener('click', function () { show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); }); /* click on backdrop */
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  box.addEventListener('close', function () { boxImg.src = BLANK; if (opener) opener.focus(); });

  /* ---------- Printing: expand every collapsed section ---------- */
  var reopened = [];
  window.addEventListener('beforeprint', function () {
    $$('details').forEach(function (d) { if (!d.open) { d.open = true; reopened.push(d); } });
  });
  window.addEventListener('afterprint', function () {
    reopened.forEach(function (d) { d.open = false; });
    reopened = [];
  });
})();
