(function () {
  'use strict';
  var LEAD_EMAIL = 'info@selectivesolutions.com';
  var PHONE = '770-929-1155';
  var doc = document.documentElement;
  doc.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header state, back-to-top ring ---------- */
  var head = $('#site-head');
  var hero = $('.hero');
  var toTop = $('.to-top');
  var ticking = false;
  var onScroll = function () {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (head) head.classList.toggle('is-scrolled', y > 40);
    if (toTop) {
      toTop.classList.toggle('is-on', hero ? y > hero.offsetHeight - 80 : y > 600);
      toTop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
    }
    stepsProgress();
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      doc.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      doc.style.scrollBehavior = '';
      var logo = $('.hdr__logo');
      if (logo) logo.focus({ preventScroll: true });
    });
  }

  /* ---------- Active nav item + sliding gold bar ---------- */
  var navLinks = $$('.nav a[href^="#"]');
  var bar = $('.nav__bar');
  var moveBar = function (a) {
    if (!bar) return;
    if (!a) { bar.classList.remove('is-on'); return; }
    var nav = a.closest('.nav');
    var r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
    bar.style.setProperty('--x', (r.left - n.left + 10) + 'px');
    bar.style.setProperty('--w', (r.width - 20) + 'px');
    bar.classList.add('is-on');
  };
  if (hasIO && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = map[e.target.id];
        if (e.isIntersecting) current = a;
        else if (current === a) current = null;
      });
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a === current); if (a === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      moveBar(current);
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });
    window.addEventListener('resize', function () { moveBar(current); });
  }

  /* ---------- Full-screen menu ---------- */
  var menu = $('#menu');
  var burger = $('.hdr__burger');
  if (menu && burger) {
    $$('.menu__nav li', menu).forEach(function (li, i) { li.style.setProperty('--n', i); });
    var openMenu = function () {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { menu.classList.add('is-open'); $('.menu__close', menu).focus(); });
    };
    var closeMenu = function (returnFocus) {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(function () { menu.hidden = true; }, reduce ? 0 : 480);
      if (returnFocus !== false) burger.focus();
    };
    burger.addEventListener('click', openMenu);
    $('.menu__close', menu).addEventListener('click', closeMenu);
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { if (a.getAttribute('href').charAt(0) === '#') closeMenu(false); }); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a, button', menu);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100 && !menu.hidden) closeMenu(false); });
  }

  /* ---------- Hero video ---------- */
  var video = $('.hero__video');
  var vToggle = $('.hero__toggle');
  if (video && vToggle) {
    var userPaused = false;
    var setPaused = function (p) {
      vToggle.setAttribute('aria-pressed', p ? 'true' : 'false');
      vToggle.setAttribute('aria-label', p ? 'Play background video' : 'Pause background video');
    };
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () { setPaused(true); }); };
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); userPaused = true; setPaused(true); }
    vToggle.addEventListener('click', function () {
      if (video.paused) { userPaused = false; play(); setPaused(false); }
      else { userPaused = true; video.pause(); setPaused(true); }
    });
    if (hasIO) new IntersectionObserver(function (en) { if (userPaused) return; if (en[0].isIntersecting) play(); else video.pause(); }).observe(video);
  }

  /* ---------- Hero diagram ---------- */
  var dia = $('#dia');
  if (dia) {
    var nodes = $$('.dia__node', dia);
    var lines = $$('.dia__line', dia);
    var infoT = $('.dia__info-title', dia), infoX = $('.dia__info-text', dia);
    var auto = null, autoI = 0;
    var setNode = function (i) {
      nodes.forEach(function (n, k) { n.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      lines.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      if (i < 0) return;
      infoT.textContent = nodes[i].getAttribute('data-title');
      infoX.textContent = nodes[i].getAttribute('data-text');
    };
    var stopAuto = function () { if (auto) { clearInterval(auto); auto = null; } };
    nodes.forEach(function (n, i) {
      n.addEventListener('mouseenter', function () { stopAuto(); setNode(i); });
      n.addEventListener('focus', function () { stopAuto(); setNode(i); });
      n.addEventListener('click', function () { stopAuto(); setNode(i); });
    });
    if (!reduce) {
      auto = setInterval(function () { setNode(autoI % nodes.length); autoI++; }, 3200);
    }
  }

  /* ---------- Example ticket ---------- */
  var tLine = $('.ticket__line');
  if (tLine && !reduce) {
    var tickets = [['Printer offline', 'Fixed remotely'], ['New hire laptop', 'Set up'], ['Email on a new phone', 'Connected'], ['Shared drive missing', 'Mapped again'], ['Locked out of Windows', 'Password reset']];
    var tI = 0;
    setInterval(function () {
      tI = (tI + 1) % tickets.length;
      tLine.classList.add('is-out');
      setTimeout(function () {
        $('.ticket__from', tLine).textContent = tickets[tI][0];
        $('.ticket__to', tLine).textContent = tickets[tI][1];
        tLine.classList.remove('is-out');
      }, 300);
    }, 3200);
  }

  /* ---------- About timeline ---------- */
  var tlItems = $$('.tl__item');
  var openTl = function (item) {
    tlItems.forEach(function (it) {
      var on = it === item;
      it.classList.toggle('is-open', on);
      $('.tl__btn', it).setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  };
  tlItems.forEach(function (it) {
    var b = $('.tl__btn', it);
    b.addEventListener('click', function () { openTl(it.classList.contains('is-open') && !finePointer ? null : it); });
    if (finePointer) b.addEventListener('mouseenter', function () { openTl(it); });
  });

  /* ---------- Generic tabs (services + stories) ---------- */
  var setupTabs = function (list, sweepEl) {
    if (!list) return;
    var tabs = $$('[role="tab"]', list);
    var select = function (tab, focus) {
      if (tab.getAttribute('aria-selected') === 'true') { if (focus) tab.focus(); return; }
      var swap = function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          var p = document.getElementById(t.getAttribute('aria-controls'));
          p.hidden = !on;
          p.classList.toggle('is-active', on);
        });
      };
      if (sweepEl && !reduce) {
        sweepEl.classList.remove('is-sweep');
        void sweepEl.offsetWidth;
        sweepEl.classList.add('is-sweep');
        setTimeout(swap, 320);
        tabs.forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); t.tabIndex = t === tab ? 0 : -1; });
      } else swap();
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') n = tabs[0];
        else if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  };
  setupTabs($('.svc__tabs'), $('.svc__panels'));
  setupTabs($('.story-tabs'), null);

  /* CTAs that preselect the contact topic */
  var topic = $('#f-topic');
  $$('[data-topic]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-topic');
      if (topic && $$('option', topic).some(function (o) { return o.text === v; })) topic.value = v;
    });
  });

  /* ---------- Counters ---------- */
  if (hasIO && !reduce) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = +el.getAttribute('data-to'), t0 = null;
        cIO.unobserve(el);
        if (to < 2) return;
        var step = function (t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1300);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: .6 });
    $$('.count').forEach(function (el) { cIO.observe(el); });
  }

  /* ---------- Disclosure buttons (why us, field notes) ---------- */
  $$('.acc-row__btn, .note__btn').forEach(function (b) {
    var panel = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      if (b.classList.contains('note__btn')) b.firstChild.textContent = open ? 'Close' : 'Summary';
    });
  });

  /* ---------- Compare table notes ---------- */
  var cmpNote = $('.cmp__note span');
  var cmpRows = $$('.cmp__table tbody tr');
  var showNote = function (tr) {
    cmpRows.forEach(function (r) { r.classList.toggle('is-on', r === tr); });
    if (!cmpNote) return;
    cmpNote.textContent = tr.getAttribute('data-note');
    var p = cmpNote.parentNode;
    p.classList.remove('is-flash'); void p.offsetWidth; p.classList.add('is-flash');
  };
  cmpRows.forEach(function (tr) {
    tr.addEventListener('mouseenter', function () { showNote(tr); });
    tr.addEventListener('focus', function () { showNote(tr); });
    tr.addEventListener('click', function () { showNote(tr); });
  });

  /* ---------- Downtime calculator ---------- */
  var cStaff = $('#c-staff'), cRate = $('#c-rate'), cHours = $('#c-hours');
  if (cStaff && cRate && cHours) {
    var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var bars = $$('.calc__bars span');
    var fill = function (inp) { var p = (inp.value - inp.min) / (inp.max - inp.min) * 100; inp.style.setProperty('--p', p + '%'); };
    var calc = function () {
      var s = +cStaff.value, r = +cRate.value, h = +cHours.value;
      $('#c-staff-out').textContent = s + (s === 1 ? ' person' : ' people');
      $('#c-rate-out').textContent = '$' + r;
      $('#c-hours-out').textContent = h + (h === 1 ? ' hour' : ' hours');
      var m = s * r * h;
      $('#c-month').textContent = money(m);
      $('#c-year').textContent = money(m * 12);
      cStaff.setAttribute('aria-valuetext', s + ' people');
      cRate.setAttribute('aria-valuetext', r + ' dollars per hour');
      cHours.setAttribute('aria-valuetext', h + ' hours per month');
      var scale = Math.min(1, Math.max(.12, Math.sqrt(m * 12 / 60000)));
      bars.forEach(function (b, i) { b.style.setProperty('--h', Math.max(4, (i + 1) / 12 * 100 * scale) + '%'); });
      [cStaff, cRate, cHours].forEach(fill);
    };
    [cStaff, cRate, cHours].forEach(function (i) { i.addEventListener('input', calc); });
    calc();
  }

  /* ---------- Exposure check ---------- */
  var chk = $('#check-form');
  if (chk) {
    var gaps = { q1: 'Keep a backup copy away from the office', q2: 'Turn on a second sign-in step', q3: 'Give your staff security training', q4: 'Have someone manage the firewall', q5: 'Test a restore from backup', q6: 'Filter spam before it reaches inboxes' };
    var ringFg = $('#ring-fg'), ringNum = $('#ring-num'), adv = $('#check-advice');
    var C = 326.7;
    var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var update = function () {
      var yes = 0, answered = 0, missing = [];
      Object.keys(gaps).forEach(function (q) {
        var v = $('input[name="' + q + '"]:checked', chk);
        if (!v) return;
        answered++;
        if (v.value === '1') yes++; else missing.push(gaps[q]);
      });
      ringNum.textContent = yes;
      ringFg.style.strokeDashoffset = (C - C * yes / 6).toFixed(1);
      if (!answered) { adv.innerHTML = '<p>Answer the questions to see where you stand.</p>'; return; }
      var html = '';
      if (answered < 6) html += '<p><strong>' + answered + ' of 6 answered.</strong></p>';
      if (answered === 6 && yes === 6) html += '<p>You have the basics covered. It\'s still worth checking how often backups get tested and who reviews the firewall.</p>';
      else if (missing.length) {
        html += '<p>' + (yes >= 4 ? 'You\'re in decent shape. These are the gaps worth closing first:' : 'There\'s some work to do, which is common for small offices. Good places to start:') + '</p>';
        html += '<ul>' + missing.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';
      }
      if (answered === 6) html += '<a class="btn btn--dark" href="#contact">Go over it with us</a>';
      adv.innerHTML = html;
    };
    chk.addEventListener('change', update);
    chk.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- Onboarding progress line ---------- */
  var stepsWrap = $('#steps-wrap'), stepsFill = $('#steps-fill'), steps = $$('.step');
  function stepsProgress() {
    if (!stepsWrap || !stepsFill) return;
    var r = stepsWrap.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .75 - r.top) / (r.height + vh * .2)));
    if (reduce) p = r.top < vh ? 1 : 0;
    stepsFill.parentNode.style.setProperty('--p', p.toFixed(3));
    steps.forEach(function (s, i) { s.classList.toggle('is-reached', p >= (i + .5) / steps.length || p >= .98); });
  }

  /* ---------- Service-area map ---------- */
  var mapName = $('#map-name');
  var counties = $$('.county');
  var pick = function (c) {
    counties.forEach(function (k) { k.classList.toggle('is-on', k === c); });
    if (mapName) mapName.textContent = c.getAttribute('data-name');
  };
  counties.forEach(function (c) {
    c.addEventListener('mouseenter', function () { pick(c); });
    c.addEventListener('focus', function () { pick(c); });
    c.addEventListener('click', function () { pick(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(c); } });
  });

  /* ---------- FAQ search ---------- */
  var faqQ = $('#faq-q');
  if (faqQ) {
    var items = $$('#faq-list .acc__item'), empty = $('#faq-empty'), count = $('#faq-count');
    faqQ.addEventListener('input', function () {
      var q = faqQ.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) > -1;
        d.hidden = !hit;
        if (hit) shown++;
        if (q && hit) d.open = true;
      });
      empty.hidden = shown > 0;
      count.textContent = shown + (shown === 1 ? ' question' : ' questions');
    });
  }

  /* ---------- Callback form ---------- */
  var cb = $('#callback-form');
  if (cb) {
    var cbIn = $('#cb-phone'), cbMsg = $('#cb-msg');
    cb.addEventListener('submit', function (e) {
      var digits = cbIn.value.replace(/\D/g, '');
      if (digits.length < 10) {
        e.preventDefault();
        cbIn.setAttribute('aria-invalid', 'true');
        cbMsg.className = 'callback__msg is-bad';
        cbMsg.textContent = 'Enter a phone number with at least 10 digits, including the area code.';
        cbIn.focus();
        return;
      }
      cbIn.setAttribute('aria-invalid', 'false');
      if (cb.getAttribute('data-mode') !== 'mailto') return;
      e.preventDefault();
      window.location.href = 'mailto:' + LEAD_EMAIL + '?subject=' + encodeURIComponent('Call-back request') + '&body=' + encodeURIComponent('Please call me back at ' + cbIn.value.trim());
      cbMsg.className = 'callback__msg is-ok';
      cbMsg.textContent = 'Got it. Press send in your email app and we\'ll call you back. Urgent? Call ' + PHONE + '.';
    });
  }

  /* ---------- Contact form ---------- */
  var form = $('#contact-form');
  if (form) {
    var rules = [
      ['f-name', function (v) { return v.length >= 2; }],
      ['f-company', function (v) { return v.length >= 2; }],
      ['f-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }],
      ['f-phone', function (v) { return !v || v.replace(/\D/g, '').length >= 10; }],
      ['f-message', function (v) { return v.length >= 5; }]
    ];
    var check = function (id, ok) {
      var el = document.getElementById(id);
      var v = el.value.trim();
      var good = ok(v);
      el.parentElement.classList.toggle('is-bad', !good);
      el.parentElement.classList.toggle('is-ok', good && !!v);
      el.setAttribute('aria-invalid', good ? 'false' : 'true');
      if (good) el.removeAttribute('aria-describedby'); else el.setAttribute('aria-describedby', id + '-err');
      return good;
    };
    rules.forEach(function (r) {
      var el = document.getElementById(r[0]);
      el.addEventListener('blur', function () { if (el.value) check(r[0], r[1]); });
      el.addEventListener('input', function () { if (el.parentElement.classList.contains('is-bad')) check(r[0], r[1]); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      rules.forEach(function (r) { if (!check(r[0], r[1]) && !bad) bad = document.getElementById(r[0]); });
      if (bad) { e.preventDefault(); bad.focus(); return; }
      if ($('#f-website').value) { e.preventDefault(); return; }
      var btn = $('.form__submit', form);
      if (form.getAttribute('data-mode') !== 'mailto') { btn.disabled = true; btn.firstChild.textContent = 'Sending…'; return; }

      e.preventDefault();
      var v = function (id) { return (document.getElementById(id).value || '').trim(); };
      var body = ['Name: ' + v('f-name'), 'Company: ' + v('f-company'), 'Email: ' + v('f-email'), 'Phone: ' + (v('f-phone') || 'Not given'), 'Topic: ' + v('f-topic'), '', v('f-message')].join('\n');
      window.location.href = 'mailto:' + LEAD_EMAIL + '?subject=' + encodeURIComponent('Meeting request from ' + v('f-name') + ', ' + v('f-company')) + '&body=' + encodeURIComponent(body);
      $('.form__body', form).hidden = true;
      var done = $('#form-done');
      done.hidden = false;
      done.focus();
    });
  }

  /* ---------- Scroll reveals ---------- */
  var reveals = $$('.reveal, .wipe');
  if (hasIO && !reduce) {
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sibs = $$(':scope > .reveal, :scope > .wipe', el.parentElement);
        el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)) * 70, 280) + 'ms';
        el.classList.add('is-in');
        rIO.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { rIO.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- Pointer effects: cursor, magnetic buttons, tilt ---------- */
  if (finePointer && !reduce) {
    var cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    if (cur) {
      doc.classList.add('has-cursor');
      var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
      window.addEventListener('pointermove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
        if (!shown) { rx = mx; ry = my; shown = true; cur.style.opacity = 1; }
      }, { passive: true });
      document.addEventListener('mouseleave', function () { cur.style.opacity = 0; shown = false; });
      (function loop() {
        rx += (mx - rx) * .15; ry += (my - ry) * .15;
        ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
        requestAnimationFrame(loop);
      })();
      var hot = 'a, button, [role="tab"], summary, label, .county, .cmp__table tbody tr, input[type="range"], [data-tilt]';
      document.addEventListener('mouseover', function (e) {
        var t = e.target;
        if (t.closest('input:not([type="range"]):not([type="radio"]), textarea, select')) { cur.classList.add('is-text'); cur.classList.remove('is-hover'); return; }
        cur.classList.remove('is-text');
        var h = t.closest(hot);
        cur.classList.toggle('is-hover', !!h);
        var lbl = h ? (h.getAttribute('data-cursor') || (h.closest('[data-cursor]') && h.closest('[data-cursor]').getAttribute('data-cursor')) || '') : '';
        label.textContent = lbl;
      });
    }

    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        b.style.setProperty('--mx', (x * 8).toFixed(1) + 'px');
        b.style.setProperty('--my', (y * 6).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });

    $$('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        c.style.setProperty('--rx', (-y * 6 + 1).toFixed(2) + 'deg');
        c.style.transform = 'perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-6px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  onScroll();
})();
