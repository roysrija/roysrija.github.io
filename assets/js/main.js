/* Srija Roy: academic website. Progressive enhancement only.
   The page is fully readable without this script; it adds the theme toggle,
   top-bar dropdown and mobile menu, scroll-spy, publication filter and image viewer.
   Adding ?preview (or ?palette=name) to the URL also shows a colour-palette preview panel. */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Theme (light / dark) ---------- */
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var MOON = 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z';
  var SUN = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4';

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }
  function syncThemeUi() {
    var dark = currentTheme() === 'dark';
    $$('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      var path = $('svg path', btn);
      if (path) path.setAttribute('d', dark ? SUN : MOON); /* show the icon of the theme you will switch to */
    });
    /* browser chrome colour follows the active palette */
    var meta = $('meta[name="theme-color"]');
    if (meta) {
      var cs = getComputedStyle(root);
      var c = (cs.getPropertyValue('--bar') || '').trim();
      if (c) meta.setAttribute('content', c);
    }
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

  /* ---------- Top bar: mobile menu + "More" dropdown ---------- */
  var topbar = $('.topbar');
  var menuBtn = $('.menu-btn');
  var more = $('.more');
  var moreBtn = $('.more-btn');
  var mobileMQ = window.matchMedia('(max-width: 1024px)');

  function setMenu(open) {
    topbar.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  function setMore(open) {
    more.classList.toggle('open', open);
    /* .closed keeps the hover-opened list shut after a choice/Escape until the pointer leaves */
    more.classList.toggle('closed', !open);
    moreBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!topbar.classList.contains('open')); });
  moreBtn.addEventListener('click', function () {
    /* a click pins the list open (it may already be showing because of hover); a second click closes it */
    setMore(!more.classList.contains('open'));
  });
  /* a fresh pointer visit may open the list again */
  more.addEventListener('mouseenter', function () { more.classList.remove('closed'); });
  more.addEventListener('mouseleave', function () { more.classList.remove('closed'); });
  function moreShown() { return getComputedStyle($('.more-list', more)).display !== 'none'; }

  $$('.nav-link', topbar).forEach(function (a) {
    if (a.tagName !== 'A') return;
    a.addEventListener('click', function () { setMore(false); if (mobileMQ.matches) setMenu(false); });
  });
  document.addEventListener('click', function (e) {
    if (topbar.contains(e.target)) return;
    setMenu(false);
    if (more.classList.contains('open')) setMore(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (moreShown() && !mobileMQ.matches) {
      var hadFocus = more.contains(document.activeElement);
      setMore(false);
      if (hadFocus) moreBtn.focus();
    } else if (topbar.classList.contains('open')) {
      setMenu(false); menuBtn.focus();
    }
  });
  function onBreakpoint() { setMenu(false); setMore(false); }
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', onBreakpoint); else mobileMQ.addListener(onBreakpoint);

  /* ---------- Scroll-spy ---------- */
  var links = {};
  $$('a.nav-link').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var sections = Object.keys(links).map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function setActive(id) {
    Object.keys(links).forEach(function (k) {
      var on = k === id;
      links[k].classList.toggle('active', on);
      if (on) links[k].setAttribute('aria-current', 'location'); else links[k].removeAttribute('aria-current');
    });
    /* highlight "More" when one of its pages is the current section */
    moreBtn.classList.toggle('active', !!$('.more-list .nav-link.active'));
  }
  if ('IntersectionObserver' in window) {
    var visible = {};
    var lastId = sections[sections.length - 1].id;

    var pickActive = function () {
      /* at the very bottom the last section can never reach the detection band, so pick it explicitly */
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) { setActive(lastId); return; }
      /* otherwise the topmost section crossing the band in the upper part of the viewport wins */
      var best = null;
      sections.forEach(function (s) { if (visible[s.id] > 0 && best === null) best = s.id; });
      if (best) setActive(best);
    };
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

  /* ---------- Colour palette preview (only with ?preview or ?palette=) ---------- */
  var PALETTES = [
    { id: 'indigo',     name: 'Midnight Indigo',   a: '#2f4fa3', b: '#162d68' }, /* default */
    { id: 'teal',       name: 'River Teal',        a: '#0b6e84', b: '#08485a' },
    { id: 'forest',     name: 'Forest Green',      a: '#2b6b45', b: '#15402a' },
    { id: 'terracotta', name: 'Terracotta Earth',  a: '#a84a22', b: '#5e2610' },
    { id: 'burgundy',   name: 'Burgundy Academic', a: '#8a2c3c', b: '#3b1823' }
  ];
  var DEFAULT_PALETTE = 'indigo';
  var params = new URLSearchParams(window.location.search);
  if (params.has('preview') || params.has('palette')) {
    var panel = document.createElement('aside'); /* a landmark, so assistive tech can find it */
    panel.className = 'palette-picker';
    panel.setAttribute('aria-labelledby', 'pp-title');
    panel.innerHTML = '<h2 id="pp-title">Colour options</h2>';
    var current = root.getAttribute('data-palette') || DEFAULT_PALETTE;
    var buttons = PALETTES.map(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-palette', p.id);
      b.innerHTML = '<span class="sw" style="background:linear-gradient(135deg,' + p.a + ' 50%,' + p.b + ' 50%)"></span><span>' + p.name + '</span>';
      b.addEventListener('click', function () {
        if (p.id === DEFAULT_PALETTE) root.removeAttribute('data-palette'); else root.setAttribute('data-palette', p.id);
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        try {
          var u = new URL(window.location.href);
          u.searchParams.set('palette', p.id);
          window.history.replaceState(null, '', u.toString());
        } catch (e) { /* URL update is optional */ }
        syncThemeUi();
      });
      b.setAttribute('aria-pressed', String(p.id === current));
      panel.appendChild(b);
      return b;
    });
    document.body.appendChild(panel);
  }

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
