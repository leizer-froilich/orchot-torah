/* Orchot Torah · homepage interactions */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = () => innerWidth <= 820;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const EN = document.documentElement.lang === 'en', RTL = document.documentElement.dir === 'rtl';
  const T = EN ? { open: 'Open menu', close: 'Close menu', sent: 'Thank you! Your message was received, and the yeshiva office will be in touch shortly.' }
               : { open: 'פתיחת תפריט', close: 'סגירת תפריט', sent: 'תודה! הפנייה התקבלה, ומשרד הישיבה יחזור אליכם בהקדם.' };

  /* ---------- gold title ornament: one drawing, injected into every [data-orn] ---------- */
  const side = '<path d="M232 40h52"/><path d="M284 40c14 0 22-6 22-13 0-6-6-9-10-6.5s-2.5 8 2.5 7.5"/>' +
               '<path d="M284 40c14 0 22 6 22 13 0 6-6 9-10 6.5s-2.5-8 2.5-7.5"/><path d="M312 40h20"/>';
  const ORN =
    '<defs><linearGradient id="gmo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="360" y2="64">' +
    '<stop offset="0" stop-color="#8C6A32"/><stop offset=".3" stop-color="#E9CF8E"/><stop offset=".5" stop-color="#F6E4AE"/>' +
    '<stop offset=".7" stop-color="#C29A5B"/><stop offset="1" stop-color="#8C6A32"/></linearGradient></defs>' +
    '<g fill="none" stroke="url(#gmo)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M160 60V36l20-12 20 12v24"/><path d="M171 60V48a9 9 0 0 1 18 0v12"/><path d="M146 60h68"/>' +
    side + '<g transform="translate(360 0) scale(-1 1)">' + side + '</g></g>' +
    '<g fill="url(#gmo)"><path class="f" d="M180 0l2.4 7.6L190 10l-7.6 2.4L180 20l-2.4-7.6L170 10l7.6-2.4z"/>' +
    '<path class="f" d="M220 34l6 6-6 6-6-6z"/><path class="f" d="M140 34l6 6-6 6-6-6z"/>' +
    '<circle class="f" cx="344" cy="40" r="2.6"/><circle class="f" cx="16" cy="40" r="2.6"/></g>';
  $$('[data-orn]').forEach(svg => {
    svg.innerHTML = ORN;
    svg.querySelectorAll('g[stroke] path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1));
  });

  /* ---------- smooth scroll, menu, anchors ---------- */
  let lenis = null;
  if (window.Lenis && !RM) { lenis = new Lenis({ lerp: .1 }); lenis.stop(); (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now()); }
  const menu = $('#menu');
  const setMenu = o => { document.body.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); menu.setAttribute('aria-label', o ? T.close : T.open); };
  menu.addEventListener('click', () => setMenu(!document.body.classList.contains('open')));
  $('#drawerClose').addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeDD(); } });
  new MutationObserver(() => { if (lenis && !document.body.classList.contains('is-loading')) document.body.classList.contains('open') ? lenis.stop() : lenis.start(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = document.querySelector(id); if (!t) return; e.preventDefault(); setMenu(false);
    const off = id === '#top' ? 0 : -(MOBILE() ? 70 : 20);
    if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.4 });
    else scrollTo({ top: t.getBoundingClientRect().top + scrollY + off, behavior: RM ? 'auto' : 'smooth' });
  }));

  /* ---------- titles: wrap plain text in .tf so each part fills in from its gold contour, in reading direction ---------- */
  $$('h2').forEach(h => {
    [...h.childNodes].forEach(n => {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const s = document.createElement('span'); s.className = 'tf'; s.textContent = n.textContent; n.replaceWith(s);
    });
    h.querySelectorAll('.tf,.gold').forEach((s, i) => s.style.setProperty('--d', (.2 + i * .35) + 's'));
  });
  const fio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-filled'); fio.unobserve(e.target); } }),
    { threshold: .6 });
  $$('h2').forEach(h => fio.observe(h));

  /* ---------- number icons sit inside the logo's open-book shield ---------- */
  const SHIELD = '<path class="sh sh--a" d="M32 14L4 4v24M4 46v12l28 12"/><path class="sh sh--b" d="M32 14L60 4v24M60 46v12L32 70"/>' +
                 '<path class="dot" d="M32 1l2.4 4.5L32 10l-2.4-4.5z"/>';
  $$('.stat svg').forEach(svg => {
    const ic = svg.innerHTML;
    svg.setAttribute('viewBox', '0 0 64 72');
    svg.innerHTML = SHIELD + `<g transform="translate(15.2 20.2) scale(1.4)"><g class="ic">${ic}</g></g>`;
    svg.querySelectorAll('.sh').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1));
  });

  /* ---------- preloader: the logo breaks into pieces, then rebuilds itself as the site loads ---------- */
  const video = $('#heroVideo');
  const pctEl = $('#pct'), bar = $('.pre__bar');
  // the logo's own parts: frame halves, the three Hebrew lines, the English line. They open apart, then close in this DOM order.
  const parts = $$('#preLogo img'), preLogo = $('#preLogo');
  const OFF = { 'frame-bl': [-15, 8, -5], 'frame-br': [15, 8, 5], 'frame-tl': [-15, -9, 5], 'frame-tr': [15, -9, -5],
                w3: [-8, 2, 0], w2: [8, -1, 0], w1: [0, -9, 0], en: [0, 9, 0] };   // [x %, y %, deg] when fully open
  const smooth = t => t * t * (3 - 2 * t);
  function drawParts(now, build) {
    const el = now - t0, fadeIn = clamp(el / 500), open = RM ? 0 : smooth(clamp((el - 650) / 1100));
    parts.forEach((im, i) => {
      const [dx, dy, r] = OFF[im.dataset.p], q = smooth(clamp((build * 1.3 - i * .1) / .32)), k = open * (1 - q);
      im.style.transform = `translate(${(dx * k).toFixed(2)}%,${(dy * k).toFixed(2)}%) rotate(${(r * k).toFixed(2)}deg)`;
      im.style.opacity = (fadeIn * (1 - .7 * k)).toFixed(3);
      im.style.filter = k > .01 ? `blur(${(k * 2.2).toFixed(2)}px)` : 'none';
    });
  }
  function settle() {   // whole again: a soft gold glow, then open the site
    drawParts(performance.now(), 1); preLogo.classList.add('is-whole');
    setTimeout(intro, RM ? 0 : 650);
  }
  const tasks = [
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = 'assets/img/rav-steinman-cut.webp'; }),
    new Promise(r => { if (video.readyState >= 3) return r(); video.addEventListener('canplaythrough', r, { once: true }); video.addEventListener('error', r, { once: true }); setTimeout(r, 7000); video.load(); }),
  ];
  let done = 0; tasks.forEach(p => p.then(() => done++));
  const t0 = performance.now(), MIN = RM ? 300 : 3400;
  let shown = 0;
  (function tick(now) {
    const timeP = clamp((now - t0) / MIN), realP = done / tasks.length;
    const target = Math.min(timeP, realP * .7 + timeP * .3, realP === 1 ? 1 : .94);
    shown += (target - shown) * .12;
    if (realP === 1 && timeP === 1 && shown > .995) shown = 1;
    pctEl.textContent = Math.round(shown * 100);
    bar.style.setProperty('--p', shown);
    drawParts(now, clamp((shown - .5) / .5));
    if (shown < 1) requestAnimationFrame(tick); else settle();
  })(t0);

  /* ---------- intro: sketch lines draw, ink spreads and reveals the hall ---------- */
  const hero = $('.hero'), sketch = $('#sketch'), ink = $('#ink');
  function intro() {
    $('#pre').classList.add('is-done');
    document.body.classList.remove('is-loading');
    setTimeout(() => document.body.classList.add('is-ready'), 350);
    if (RM) { sketch.remove(); ink.remove(); video.play().catch(() => {}); document.body.classList.add('is-revealed'); $('.hero h1').classList.add('is-filled'); lenis && lenis.start(); return; }
    // pencil sketch
    sketch.querySelectorAll('path').forEach((p, i) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1500, delay: 120 + i * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    });
    const erase = spreadInk();   // paper covers the hero right away; the sketch is drawn on it
    setTimeout(() => { video.play().catch(() => {}); erase(); }, 1100);
    setTimeout(() => { sketch.style.opacity = 0; }, 2300);
    setTimeout(() => { document.body.classList.add('is-revealed'); lenis && lenis.start(); }, 3000);
    setTimeout(() => $('.hero h1').classList.add('is-filled'), 3400);
    setTimeout(() => sketch.remove(), 4200);
  }

  /* ---------- hero: Maran is sized so the title block sits on him below the beard ---------- */
  const ravFig = $('.hero__rav'), heroText = $('.hero__text'), heroIn = $('.hero__in');
  const fitRav = () => ravFig.style.setProperty('--tb', Math.round(heroText.offsetHeight + parseFloat(getComputedStyle(heroIn).paddingBottom) + 10) + 'px');
  fitRav(); addEventListener('resize', fitRav); document.fonts && document.fonts.ready.then(fitRav);

  /* ---------- hero: the hall video drifts with the mouse, Maran a touch the other way ---------- */
  (function follow() {
    if (RM || matchMedia('(hover: none)').matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, on = false;
    const f = () => {
      x += (tx - x) * .06; y += (ty - y) * .06;
      hero.style.setProperty('--mx', x.toFixed(4)); hero.style.setProperty('--my', y.toFixed(4));
      if (Math.abs(tx - x) + Math.abs(ty - y) > .001) requestAnimationFrame(f); else on = false;
    };
    const go = () => { if (!on) { on = true; requestAnimationFrame(f); } };
    hero.addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; go(); });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; go(); });
  })();

  // parchment layer painted on a canvas, then erased by growing ink blots (destination-out)
  function spreadInk() {
    const W = hero.clientWidth, H = hero.clientHeight;
    ink.width = W; ink.height = H;
    const c = ink.getContext('2d');
    c.fillStyle = '#F2E8D5'; c.fillRect(0, 0, W, H);
    // paper grain + soft stains
    const g = document.createElement('canvas'); g.width = g.height = 160;
    const gc = g.getContext('2d'), id = gc.createImageData(160, 160);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random(); id.data[i] = 120; id.data[i + 1] = 90; id.data[i + 2] = 50; id.data[i + 3] = v > .5 ? v * 26 : 0; }
    gc.putImageData(id, 0, 0);
    c.fillStyle = c.createPattern(g, 'repeat'); c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = 120 + Math.random() * 320;
      const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(140,106,50,.07)'); rg.addColorStop(1, 'rgba(140,106,50,0)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
    }
    const R = Math.hypot(W, H);
    const seeds = [
      { x: .5, y: .3, d: 0, dur: 2100, s: .55 }, { x: .5, y: .72, d: 140, dur: 2000, s: .5 },
      { x: .16, y: .62, d: 320, dur: 1900, s: .42 }, { x: .84, y: .58, d: 380, dur: 1900, s: .42 },
      { x: .3, y: .16, d: 520, dur: 1800, s: .36 }, { x: .72, y: .14, d: 560, dur: 1800, s: .36 },
      { x: .06, y: .2, d: 700, dur: 1700, s: .34 }, { x: .95, y: .9, d: 640, dur: 1700, s: .34 },
      { x: .04, y: .95, d: 760, dur: 1600, s: .3 }, { x: .97, y: .18, d: 820, dur: 1600, s: .3 },
    ].map(s => ({ ...s, d: s.d * 1.5, dur: s.dur * 1.5, ph: [Math.random() * 6, Math.random() * 6, Math.random() * 6], drops: Array.from({ length: 14 }, () => ({ a: Math.random() * Math.PI * 2, k: 1.04 + Math.random() * .3, z: .02 + Math.random() * .05 })) }));
    let start;
    return () => { start = performance.now(); c.globalCompositeOperation = 'destination-out'; requestAnimationFrame(frame); };
    function frame(now) {
      const t = now - start;
      let alive = false;
      for (const s of seeds) {
        const p = clamp((t - s.d) / s.dur); if (p < 1) alive = true; if (p <= 0) continue;
        const r = easeOut(p) * R * s.s, cx = s.x * W, cy = s.y * H;
        c.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = i / 72 * Math.PI * 2;
          const n = .16 * Math.sin(a * 3 + s.ph[0] + t * .0012) + .1 * Math.sin(a * 7 + s.ph[1]) + .06 * Math.sin(a * 13 + s.ph[2] - t * .002);
          const rr = r * (1 + n);
          i ? c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        const gr = c.createRadialGradient(cx, cy, r * .55, cx, cy, r * 1.2);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gr; c.fill();
        for (const d of s.drops) {            // ink droplets running ahead of the edge
          const dr = r * d.k, x = cx + Math.cos(d.a) * dr, y = cy + Math.sin(d.a) * dr, rad = Math.max(2, r * d.z);
          const dg = c.createRadialGradient(x, y, 0, x, y, rad); dg.addColorStop(0, 'rgba(0,0,0,.9)'); dg.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = dg; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
        }
      }
      if (alive) requestAnimationFrame(frame);
      else { ink.style.transition = 'opacity .8s'; ink.style.opacity = 0; setTimeout(() => ink.remove(), 900); }
    }
  }

  /* ---------- sparks of holiness above the Rav ---------- */
  (function sparks() {
    const cv = $('#sparks'), cx = cv.getContext('2d'), rav = $('.hero__rav');
    let W, H, parts = [], running = true, dpr = Math.min(2, devicePixelRatio || 1);
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
    const sc = sprite.getContext('2d'), sg = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, 'rgba(255,244,210,1)'); sg.addColorStop(.18, 'rgba(240,210,140,.9)'); sg.addColorStop(.45, 'rgba(194,154,91,.28)'); sg.addColorStop(1, 'rgba(194,154,91,0)');
    sc.fillStyle = sg; sc.fillRect(0, 0, 64, 64);
    function size() { W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(initial) {
      const b = rav.getBoundingClientRect(), hb = hero.getBoundingClientRect();
      const ox = b.left - hb.left + b.width / 2, oy = b.top - hb.top + b.height * .22;
      const wide = Math.random() < .25;     // a few drift across the whole hall
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random());
      return {
        x: wide ? Math.random() * W : ox + Math.cos(a) * rr * b.width * .55,
        y: wide ? H * (.35 + Math.random() * .65) : oy + Math.sin(a) * rr * b.height * .4,
        vy: -(.15 + Math.random() * .55), vx: (Math.random() - .5) * .2, sw: Math.random() * 6, life: 0,
        max: 220 + Math.random() * 300, s: wide ? 3 + Math.random() * 6 : 4 + Math.random() * 12, glint: Math.random() < .07,
        t: initial ? Math.random() * 300 : 0
      };
    }
    function init() { size(); const n = MOBILE() ? 55 : 120; parts = Array.from({ length: n }, () => { const p = spawn(true); p.life = p.t; return p; }); }
    function draw() {
      if (!running) return;
      cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]; p.life++;
        p.x += p.vx + Math.sin((p.life + p.sw * 40) * .02) * .25; p.y += p.vy;
        const k = p.life / p.max, a = Math.sin(Math.PI * k) * (.55 + .45 * Math.sin(p.life * .12 + p.sw));
        if (k >= 1) { parts[i] = spawn(false); continue; }
        cx.globalAlpha = clamp(a);
        cx.drawImage(sprite, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        if (p.glint) {   // four-point star glint
          const L = p.s * 1.6; cx.strokeStyle = 'rgba(255,240,200,.9)'; cx.lineWidth = .8;
          cx.beginPath(); cx.moveTo(p.x - L, p.y); cx.lineTo(p.x + L, p.y); cx.moveTo(p.x, p.y - L); cx.lineTo(p.x, p.y + L); cx.stroke();
        }
      }
      cx.globalAlpha = 1; requestAnimationFrame(draw);
    }
    init(); addEventListener('resize', size);
    if (RM) { draw(); running = false; return; }
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) draw(); }).observe(hero);
    draw();
  })();

  /* ---------- reveals + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); io.unobserve(e.target);
    if (e.target.classList.contains('stat')) count(e.target.querySelector('[data-count]'));
  }), { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  function count(el) {
    const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), D = RM ? 0 : 2000;
    (function f(now) { const p = D ? clamp((now - t0) / D) : 1; el.textContent = Math.round(easeOut(p) * to).toLocaleString('en-US') + (p === 1 ? suf : ''); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- founder video plays only while visible ---------- */
  const fv = document.querySelector('[data-lazy-video]');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { fv.preload = 'auto'; fv.play().catch(() => {}); } else fv.pause(); }, { threshold: .25 }).observe(fv);

  /* ---------- pinned sections: network (horizontal) and history (timeline) ---------- */
  const netPin = $('.net__pin'), track = $('#netTrack'), netBar = $('#netBar'), netNow = $('#netNow');
  const histPin = $('.hist__pin'), steps = $$('#histList .step'), histLine = $('#histLine'), histImgs = $$('#histImgs img');
  const prog = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
  let lastStep = -1, dist = 0;
  // measure how far the last card sits past the end padding: to the left in Hebrew, to the right in English
  function measure() {
    track.style.transform = 'none';
    const tr = track.getBoundingClientRect(), last = track.lastElementChild.getBoundingClientRect(), cs = getComputedStyle(track);
    dist = RTL ? Math.max(0, tr.left + parseFloat(cs.paddingLeft) - last.left)
               : -Math.max(0, last.right - (tr.right - parseFloat(cs.paddingRight)));
  }
  measure(); addEventListener('resize', measure); addEventListener('load', measure);
  function onScroll() {
    if (!MOBILE() && !RM) {
      const p = prog(netPin);
      track.style.transform = `translate3d(${p * dist}px,0,0)`;
      netBar.style.setProperty('--p', p);
      netNow.textContent = String(Math.round(p * (track.children.length - 1)) + 1).padStart(2, '0');
      const hp = prog(histPin);
      histLine.style.setProperty('--p', hp);
      const idx = Math.min(steps.length - 1, Math.floor(hp * steps.length * .999));
      if (idx !== lastStep) {
        lastStep = idx;
        steps.forEach((s, i) => { s.classList.toggle('on', i <= idx); s.classList.toggle('cur', i === idx); });
        histImgs.forEach((im, i) => im.classList.toggle('on', i === idx));
      }
    } else {
      track.style.transform = '';
      steps.forEach(s => { s.classList.add('on'); });
    }
  }
  // mobile: the cards are swiped natively; the gold bar follows the swipe
  track.addEventListener('scroll', () => {
    if (!MOBILE()) return;
    const max = track.scrollWidth - track.clientWidth;
    netBar.style.setProperty('--p', max > 0 ? Math.abs(track.scrollLeft) / max : 0);
  }, { passive: true });
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); lenis && lenis.on('scroll', req);
  onScroll();

  /* ---------- gallery band: two seamless rows (two identical groups each) ---------- */
  const imgs = Array.from({ length: 18 }, (_, i) => i + 1).filter(n => ![5].includes(n) && n <= 18).map(n => `assets/img/gallery-${String(n).padStart(2, '0')}.jpg`);
  const rowA = imgs.slice(0, 9), rowB = imgs.slice(9);
  const group = list => `<div class="mq__g">${list.map(s => `<img src="${s}" alt="" loading="lazy">`).join('')}</div>`;
  $('#bandRows').innerHTML = `<div class="mq mq--a">${group(rowA)}${group(rowA)}</div><div class="mq mq--b">${group(rowB)}${group(rowB)}</div>`;

  /* ---------- custom dropdown (no browser-default select) ---------- */
  const dd = $('#dd'), ddBtn = dd.querySelector('.dd__btn'), ddVal = $('#dd-val'), ddIn = dd.querySelector('input');
  function closeDD() { dd.classList.remove('is-open'); ddBtn.setAttribute('aria-expanded', false); }
  ddBtn.addEventListener('click', () => { const o = !dd.classList.contains('is-open'); dd.classList.toggle('is-open', o); ddBtn.setAttribute('aria-expanded', o); });
  dd.querySelectorAll('li').forEach(li => li.addEventListener('click', () => {
    dd.querySelectorAll('li').forEach(x => x.setAttribute('aria-selected', x === li));
    ddVal.textContent = li.textContent; ddIn.value = li.textContent; closeDD();
  }));
  document.addEventListener('click', e => { if (!dd.contains(e.target)) closeDD(); });

  /* ---------- "להתחבר לקול התורה": looped beit-midrash sound with soft fades, off by default ---------- */
  (function kol() {
    const btn = $('#kol'), VOL = .32, URL_ = 'assets/audio/kol-hatorah.mp3';
    let ac, gain, buf, src, on = false, loading = null, el = null, fadeT = null;
    const load = () => loading || (loading = (async () => {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        gain = ac.createGain(); gain.gain.value = 0; gain.connect(ac.destination);
        const data = await (await fetch(URL_, { cache: 'force-cache' })).arrayBuffer();
        buf = await ac.decodeAudioData(data);
      } catch (e) {            // fallback: a plain looping <audio> with a stepped volume fade
        ac = null; el = new Audio(URL_); el.loop = true; el.volume = 0;
      }
    })());
    function elFade(v, sec, after) {
      clearInterval(fadeT); const from = el.volume, steps = Math.max(1, sec * 30); let i = 0;
      fadeT = setInterval(() => { i++; el.volume = clamp(from + (v - from) * i / steps); if (i >= steps) { clearInterval(fadeT); after && after(); } }, 1000 / 30);
    }
    function start() {
      src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      src.loopStart = .03; src.loopEnd = buf.duration - .03;      // skip the codec's edge padding so the loop has no gap
      src.connect(gain); src.start(0, .03);
    }
    function fadeTo(v, sec) {
      const t = ac.currentTime; gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t); gain.gain.linearRampToValueAtTime(v, t + sec);
    }
    async function setOn(v) {
      on = v; btn.classList.toggle('is-on', v); btn.setAttribute('aria-pressed', v);
      if (v) {
        await load(); if (!on) return;
        if (el) { el.play().catch(() => {}); elFade(VOL, 2.2); return; }
        await ac.resume(); if (!src) start(); fadeTo(VOL, 2.2);
      } else if (el) {
        elFade(0, 1.2, () => { if (!on) el.pause(); });
      } else if (ac) {
        fadeTo(0, 1.2);
        setTimeout(() => { if (!on && src) { src.stop(); src.disconnect(); src = null; ac.suspend(); } }, 1300);
      }
    }
    btn.addEventListener('click', () => setOn(!on));
    // fade out while the tab is hidden, fade back in on return
    document.addEventListener('visibilitychange', () => {
      if (!on) return;
      if (el) { document.hidden ? elFade(0, .6) : elFade(VOL, 1.5); return; }
      if (!ac) return;
      if (document.hidden) fadeTo(0, .6); else { ac.resume(); fadeTo(VOL, 1.5); }
    });
  })();

  /* ---------- sparks inside every button: a few on hover, a small burst on press ---------- */
  (function btnSparks() {
    if (RM) return;
    const cv = document.createElement('canvas'); cv.className = 'bsparks'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const c = cv.getContext('2d'), SEL = '.btn, button';
    let W, H, ps = [], hot = null, run = false, acc = 0;
    const spr = document.createElement('canvas'); spr.width = spr.height = 32;
    const g = spr.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,250,232,1)'); gr.addColorStop(.25, 'rgba(246,224,160,.9)'); gr.addColorStop(.6, 'rgba(194,154,91,.32)'); gr.addColorStop(1, 'rgba(194,154,91,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    const size = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    function add(r, bx, by) {
      const burst = !r, a = Math.random() * Math.PI * 2, v = burst ? .5 + Math.random() * 1.4 : .08 + Math.random() * .2;
      ps.push({ x: burst ? bx : r.left + 8 + Math.random() * (r.width - 16), y: burst ? by : r.top + 5 + Math.random() * (r.height - 10),
                vx: Math.cos(a) * v, vy: Math.sin(a) * v - .22, life: 0, max: burst ? 30 + Math.random() * 24 : 50 + Math.random() * 40,
                s: burst ? 4 + Math.random() * 6 : 3 + Math.random() * 5, gl: Math.random() < .2 });
      if (!run) { run = true; requestAnimationFrame(frame); }
    }
    function frame() {
      c.clearRect(0, 0, W, H);
      if (hot && hot.isConnected) { acc += .12; while (acc >= 1) { acc--; add(hot.getBoundingClientRect()); } }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.life++; p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy *= .97;
        const k = p.life / p.max; if (k >= 1) { ps.splice(i, 1); continue; }
        c.globalAlpha = Math.sin(Math.PI * k) * .9;
        c.drawImage(spr, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        if (p.gl) {
          const L = p.s * .9 * Math.sin(Math.PI * k); c.strokeStyle = 'rgba(255,246,220,.85)'; c.lineWidth = .7;
          c.beginPath(); c.moveTo(p.x - L, p.y); c.lineTo(p.x + L, p.y); c.moveTo(p.x, p.y - L); c.lineTo(p.x, p.y + L); c.stroke();
        }
      }
      c.globalAlpha = 1;
      if (ps.length || hot) requestAnimationFrame(frame); else run = false;
    }
    document.addEventListener('pointerover', e => {
      const b = e.pointerType === 'touch' ? null : e.target.closest(SEL);
      if (b === hot) return; hot = b;
      if (hot) { const r = hot.getBoundingClientRect(); for (let i = 0; i < 3; i++) add(r); }
    });
    document.addEventListener('pointerout', e => { if (hot && !hot.contains(e.relatedTarget)) hot = null; });
    document.addEventListener('pointerdown', e => { if (e.target.closest(SEL)) for (let i = 0; i < 10; i++) add(null, e.clientX, e.clientY); });
  })();

  /* ---------- logos strip: hovering a logo floats that institution's photo beside the cursor ---------- */
  (function logoPreview() {
    const box = $('#lprev'); if (!box || matchMedia('(hover: none)').matches) return;
    const arch = box.querySelector('.arch'), img = arch.querySelector('img'), nm = box.querySelector('.plate b'), pl = box.querySelector('.plate span');
    const logos = $$('.logos__row img');
    let tx = 0, ty = 0, x = 0, y = 0, on = false, raf = 0, warmed = false;
    logos[0].parentNode.addEventListener('pointerenter', () => {   // warm the photos once the row is reached
      if (warmed) return; warmed = true; logos.forEach(l => { if (l.dataset.photo) new Image().src = l.dataset.photo; });
    });
    logos.forEach(l => {
      l.addEventListener('pointerenter', e => {
        const solid = !l.dataset.photo;
        arch.classList.toggle('solid', solid); img.src = solid ? l.getAttribute('src') : l.dataset.photo;
        nm.textContent = l.alt; pl.textContent = l.dataset.place || '';
        if (!box.classList.contains('on')) { x = tx = e.clientX; y = ty = e.clientY; }
        on = true; box.classList.add('on'); loop();
      });
      l.addEventListener('pointerleave', () => { on = false; box.classList.remove('on'); });
    });
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    function loop() {
      cancelAnimationFrame(raf);
      (function f() {
        x += (tx - x) * .16; y += (ty - y) * .16;
        const w = box.offsetWidth, h = box.offsetHeight;
        let px = clamp(x - w / 2, 12, innerWidth - w - 12), py = y - h - 26;
        if (py < 12) py = y + 34;
        box.style.transform = `translate3d(${px}px,${py}px,0)`;
        if (on || Math.abs(tx - x) + Math.abs(ty - y) > .5) raf = requestAnimationFrame(f);
      })();
    }
  })();

  /* ---------- form (demo until connected to the office) ---------- */
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    $('#formNote').textContent = T.sent;
  });
})();
