/* Aditya Knox portfolio — progressive enhancement only. Content works without JS. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* scroll progress + sticky nav (one rAF-throttled listener) */
  var nav = $('#nav'), bar = $('#progress'), ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      nav.classList.toggle('stuck', y > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* jumping to a section: render every section first so the browser can land on the exact spot */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) document.documentElement.classList.add('nocv');
  });

  /* channel cards and client logos: reveal by position too, so they never stay hidden */
  var fly = Array.prototype.slice.call(document.querySelectorAll('.chan-row .rv, .brands .rv, .ctr-site.rv'));
  function revealFly() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    fly.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in');
    });
  }
  window.addEventListener('scroll', revealFly, { passive: true });
  window.addEventListener('resize', revealFly, { passive: true });
  revealFly();

  /* theme toggle (light default for first-time trust; dark follows the system or the visitor's choice) */
  var tbtn = $('#theme'), root = document.documentElement;
  function paintTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (tbtn) {
      tbtn.setAttribute('aria-pressed', String(dark));
      tbtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }
  paintTheme();
  if (tbtn) tbtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    paintTheme();
  });

  /* mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* reveal on scroll */
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.rv').forEach(function (el) { rio.observe(el); });

    /* count-up numbers */
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        countUp(en.target);
      });
    }, { threshold: 0.4 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });

    /* scroll spy */
    var links = $$('.menu a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = links.filter(function (x) { return x.getAttribute('href') === '#' + en.target.id; })[0];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(function (s) { spy.observe(s); });
    var home = $('#home');
    if (home) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) links.forEach(function (a) { a.removeAttribute('aria-current'); });
    }, { rootMargin: '-40% 0px -40% 0px' }).observe(home);
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  function countUp(el) {
    if (reduce) return;
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var dur = 1600, t0 = performance.now();
    el.textContent = pre + (0).toFixed(dec) + suf;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + (target * eased).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* spotlight cards + hero parallax (precise pointers only) */
  if (fine) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.spot');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
    var pw = $('#portrait');
    if (pw && !reduce) {
      pw.addEventListener('pointermove', function (e) {
        var r = pw.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        $$('.fc', pw).forEach(function (f) {
          var d = parseFloat(f.getAttribute('data-depth')) || 10;
          f.style.transform = 'translate3d(' + (x * d * 2).toFixed(1) + 'px,' + (y * d * 2).toFixed(1) + 'px,0)';
        });
      });
      pw.addEventListener('pointerleave', function () { $$('.fc', pw).forEach(function (f) { f.style.transform = ''; }); });
    }
  }

  /* before / now toggles */
  $$('[data-ba]').forEach(function (ba) {
    var btns = $$('.seg button', ba), layers = $$('.layer', ba), caps = $$('.cap span', ba), capBox = $('.cap', ba), touched = false;
    function set(i) {
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
      layers.forEach(function (l, k) { l.classList.toggle('on', k === i); });
      caps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { touched = true; if (capBox) capBox.setAttribute('aria-live', 'polite'); set(i); });
    });
    if (!reduce && 'IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { o.disconnect(); setTimeout(function () { if (!touched) set(1); }, 1800); }
      }, { threshold: 0.6 });
      o.observe(ba);
    }
  });

  /* image viewer */
  var dlg = $('#lb'), limg = $('#lb-img'), lcap = $('#lb-cap'), last = null;
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-lb]');
    if (!z || !dlg) return;
    last = z;
    var im = $('img', z);
    limg.src = z.getAttribute('data-lb');
    limg.alt = im ? im.alt : '';
    lcap.textContent = z.getAttribute('data-cap') || '';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  if (dlg) {
    $('#lb-x').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { limg.removeAttribute('src'); if (last && last.focus) last.focus(); });
  }

  /* copy email */
  var toast = $('#toast'), tt, copy = $('#copy');
  function say(m) { toast.textContent = m; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 2400); }
  if (copy) copy.addEventListener('click', function () {
    var m = copy.getAttribute('data-email');
    function fallback() {
      var t = document.createElement('textarea');
      t.value = m; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); say('Email copied: ' + m); } catch (_) { say(m); }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(m).then(function () { say('Email copied: ' + m); }, fallback);
    } else fallback();
  });
})();
