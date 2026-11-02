/* Orchot Torah · founder page: horizontal presentation with the hero's ink spread on every station */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const EN = document.documentElement.lang === 'en', RTL = document.documentElement.dir === 'rtl';
  const T = EN ? { open: 'Open menu', close: 'Close menu', sent: 'Thank you! Your message was received, and the yeshiva office will be in touch shortly.', img: 'Enlarge photo ' }
               : { open: 'פתיחת תפריט', close: 'סגירת תפריט', sent: 'תודה! הפנייה התקבלה, ומשרד הישיבה יחזור אליכם בהקדם.', img: 'הגדלת תמונה ' };
  const track = $('#track'), slides = $$('.st'), rail = $('#rail'), prev = $('#prev'), next = $('#next');

  /* ---------- gold title ornament, same drawing as the homepage ---------- */
  const FRAME = 'M180 8.9L164.7 2.3L158.8 8.1V18.1H165V3.7L179.6 9.7zM180 8.9l.2.8L194.7 3.7V18.1H201.2V8.1L195.2 2.3z' +
                'M158.8 43.9V49.7L164.8 55.7L179.9 61.7V60.8L165 54.1V43.9zM201.2 43.9H194.8V54.1L180 60.8V61.7L195.2 55.5L201.2 49.7z';
  const side = '<path d="M232 40h52"/><path d="M284 40c14 0 22-6 22-13 0-6-6-9-10-6.5s-2.5 8 2.5 7.5"/><path d="M284 40c14 0 22 6 22 13 0 6-6 9-10 6.5s-2.5-8 2.5-7.5"/><path d="M312 40h20"/>';
  const ORN = '<defs><linearGradient id="gmo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="360" y2="64"><stop offset="0" stop-color="#8C6A32"/><stop offset=".3" stop-color="#E9CF8E"/><stop offset=".5" stop-color="#F6E4AE"/><stop offset=".7" stop-color="#C29A5B"/><stop offset="1" stop-color="#8C6A32"/></linearGradient></defs>' +
    '<g fill="none" stroke="url(#gmo)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' + side + '<g transform="translate(360 0) scale(-1 1)">' + side + '</g></g>' +
    '<g fill="url(#gmo)"><path d="' + FRAME + '"/><path d="M180 22l2.2 6.8L189 31l-6.8 2.2L180 40l-2.2-6.8L171 31l6.8-2.2z"/><path d="M220 34l6 6-6 6-6-6z"/><path d="M140 34l6 6-6 6-6-6z"/><circle cx="344" cy="40" r="2.6"/><circle cx="16" cy="40" r="2.6"/></g>';
  $$('[data-orn]').forEach(s => { s.innerHTML = ORN; });

  /* ---------- titles fill in from a gold contour, as on the homepage ---------- */
  $$('.st h2').forEach(h => {
    [...h.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'tf'; s.textContent = n.textContent; n.replaceWith(s); } });
    h.querySelectorAll('.tf,.gold').forEach((s, i) => s.style.setProperty('--d', (.5 + i * .35) + 's'));
  });

  /* ---------- menu ---------- */
  const menu = $('#menu');
  const setMenu = o => { document.body.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); menu.setAttribute('aria-label', o ? T.close : T.open); };
  menu.addEventListener('click', () => setMenu(!document.body.classList.contains('open')));
  $('#drawerClose').addEventListener('click', () => setMenu(false));

  /* ---------- the ink: navy cover painted on a canvas, erased by growing blots to show the old paper ---------- */
  function spread(st, seedX) {
    const cover = st.querySelector('.st__cover');
    if (RM || !cover) { cover && cover.remove(); return; }
    const W = st.clientWidth, H = st.clientHeight, cv = document.createElement('canvas'); cv.className = 'ink';
    cv.width = W; cv.height = H; st.appendChild(cv);
    const c = cv.getContext('2d'); c.fillStyle = '#0E1C2A'; c.fillRect(0, 0, W, H); cover.remove();
    c.globalCompositeOperation = 'destination-out';
    const R = Math.hypot(W, H), jit = () => (Math.random() - .5) * .16;
    const seeds = [
      { x: seedX, y: .46, d: 0, dur: 1500, s: .62 }, { x: seedX + (seedX < .5 ? .24 : -.24) + jit(), y: .2 + jit(), d: 170, dur: 1450, s: .46 },
      { x: seedX + (seedX < .5 ? .28 : -.28) + jit(), y: .82 + jit(), d: 240, dur: 1400, s: .46 }, { x: .5 + jit(), y: .5 + jit(), d: 380, dur: 1300, s: .5 },
      { x: 1 - seedX + jit(), y: .24 + jit(), d: 520, dur: 1200, s: .46 }, { x: 1 - seedX + jit(), y: .8 + jit(), d: 580, dur: 1150, s: .46 },
    ].map(s => ({ ...s, ph: [Math.random() * 6, Math.random() * 6, Math.random() * 6], drops: Array.from({ length: 12 }, () => ({ a: Math.random() * Math.PI * 2, k: 1.04 + Math.random() * .28, z: .02 + Math.random() * .05 })) }));
    const start = performance.now();
    requestAnimationFrame(function frame(now) {
      const t = now - start; let alive = false;
      for (const s of seeds) {
        const p = clamp((t - s.d) / s.dur); if (p < 1) alive = true; if (p <= 0) continue;
        const r = easeOut(p) * R * s.s, cx = s.x * W, cy = s.y * H;
        c.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = i / 72 * Math.PI * 2, n = .16 * Math.sin(a * 3 + s.ph[0] + t * .0012) + .1 * Math.sin(a * 7 + s.ph[1]) + .06 * Math.sin(a * 13 + s.ph[2] - t * .002), rr = r * (1 + n);
          i ? c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        const g = c.createRadialGradient(cx, cy, r * .55, cx, cy, r * 1.2); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fill();
        for (const d of s.drops) {
          const dr = r * d.k, x = cx + Math.cos(d.a) * dr, y = cy + Math.sin(d.a) * dr, rad = Math.max(2, r * d.z), dg = c.createRadialGradient(x, y, 0, x, y, rad);
          dg.addColorStop(0, 'rgba(0,0,0,.9)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = dg; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
        }
      }
      if (alive) requestAnimationFrame(frame); else { cv.style.transition = 'opacity .5s'; cv.style.opacity = 0; setTimeout(() => cv.remove(), 550); }
    });
  }

  /* ---------- stations: open once, track the current one ---------- */
  let cur = 0, lastCur = 0;
  rail.innerHTML = '<i></i>' + slides.map((s, i) => `<button type="button" aria-label="${s.dataset.label}"><span>${s.dataset.label}</span></button>`).join('');
  const dots = [...rail.querySelectorAll('button')], fill = rail.querySelector('i');
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  function open(st, i) {
    if (st.classList.contains('is-open')) return;
    spread(st, (i >= lastCur) === RTL ? .08 : .92);        // the paper spreads from the side you came in from (RTL: next arrives from the left)
    setTimeout(() => { st.classList.add('is-open'); st.querySelector('h1,h2')?.classList.add('is-filled'); }, RM ? 0 : 420);
  }
  function mark(i) {
    if (i === cur && document.body.classList.contains('is-ready')) return;
    lastCur = cur; cur = i;
    dots.forEach((d, k) => { d.classList.toggle('on', k <= i); d.classList.toggle('cur', k === i); });
    fill.style.setProperty('--p', i / (slides.length - 1));
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = slides.indexOf(e.target); mark(i); open(e.target, i);
  }), { root: track, threshold: .55 });
  slides.forEach(s => io.observe(s));

  function go(i, behavior) {
    i = clamp(i, 0, slides.length - 1);
    slides[i].scrollIntoView({ behavior: behavior || (RM ? 'auto' : 'smooth'), inline: 'center', block: 'nearest' });
  }
  prev.addEventListener('click', () => go(cur - 1)); next.addEventListener('click', () => go(cur + 1));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
    const k = { ArrowLeft: RTL ? 1 : -1, ArrowRight: RTL ? -1 : 1, PageDown: 1, PageUp: -1, ' ': 1, Home: -99, End: 99 }[e.key];
    if (k && !e.target.closest('a,button,input,textarea')) { e.preventDefault(); go(cur + k); }
  });

  /* the mouse wheel and vertical trackpad swipes move one station at a time */
  let lock = 0, acc = 0;
  track.addEventListener('wheel', e => {
    if (innerWidth <= 820) return;
    const here = slides[cur];
    if (here.classList.contains('st--foot') && (e.deltaY > 0 || here.scrollTop > 0)) return;   // the last slide scrolls by itself
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;     // a horizontal swipe is the browser's own
    e.preventDefault();
    const now = performance.now(); if (now < lock) return;
    acc += e.deltaY; if (Math.abs(acc) < 40) return;
    go(cur + Math.sign(acc)); acc = 0; lock = now + 950;
  }, { passive: false });

  /* drag with the mouse */
  let down = null;
  track.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && !e.target.closest('a,button')) down = { x: e.clientX }; });
  addEventListener('pointerup', e => { if (down) { const dx = e.clientX - down.x; if (Math.abs(dx) > 70) go(cur + ((dx > 0) === RTL ? 1 : -1)); down = null; } });

  $$('a[href="#contact"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setMenu(false); go(slides.length - 1, 'auto'); }));

  /* ---------- contact form: custom dropdown + demo submit ---------- */
  const dd = $('#dd');
  if (dd) {
    const ddBtn = dd.querySelector('.dd__btn'), ddVal = $('#dd-val'), ddIn = dd.querySelector('input');
    const closeDD = () => { dd.classList.remove('is-open'); ddBtn.setAttribute('aria-expanded', false); };
    ddBtn.addEventListener('click', () => { const o = !dd.classList.contains('is-open'); dd.classList.toggle('is-open', o); ddBtn.setAttribute('aria-expanded', o); });
    dd.querySelectorAll('li').forEach(li => li.addEventListener('click', () => { dd.querySelectorAll('li').forEach(x => x.setAttribute('aria-selected', x === li)); ddVal.textContent = li.textContent; ddIn.value = li.textContent; closeDD(); }));
    document.addEventListener('click', e => { if (!dd.contains(e.target)) closeDD(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') closeDD(); });
    $('#form').addEventListener('submit', e => { e.preventDefault(); $('#formNote').textContent = T.sent; });
  }

  /* ---------- start ---------- */
  const hash = +location.hash.replace('#s', '') || 0;
  if (hash) go(hash, 'auto');
  mark(hash);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => document.body.classList.add('is-ready'));

  /* ---------- gold sparks in the buttons, as on the homepage ---------- */
  (function btnSparks() {
    if (RM) return;
    const cv = document.createElement('canvas'); cv.className = 'bsparks'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const c = cv.getContext('2d'), SEL = '.btn, .lc__b'; let W, H, ps = [], hot = null, run = false, acc2 = 0;
    const spr = document.createElement('canvas'); spr.width = spr.height = 32;
    const g = spr.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,250,232,1)'); gr.addColorStop(.25, 'rgba(246,224,160,.9)'); gr.addColorStop(.6, 'rgba(194,154,91,.32)'); gr.addColorStop(1, 'rgba(194,154,91,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    function add(r) {
      const a = Math.random() * Math.PI * 2, v = .08 + Math.random() * .2;
      ps.push({ x: r.left + 6 + Math.random() * (r.width - 12), y: r.top + 5 + Math.random() * (r.height - 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v - .2, life: 0, max: 50 + Math.random() * 40, s: 3 + Math.random() * 5 });
      if (!run) { run = true; requestAnimationFrame(frame); }
    }
    function frame() {
      c.clearRect(0, 0, W, H);
      if (hot && hot.isConnected) { acc2 += .12; while (acc2 >= 1) { acc2--; add(hot.getBoundingClientRect()); } }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.life++; p.x += p.vx; p.y += p.vy; const k = p.life / p.max; if (k >= 1) { ps.splice(i, 1); continue; }
        c.globalAlpha = Math.sin(Math.PI * k) * .9; c.drawImage(spr, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      c.globalAlpha = 1; if (ps.length || hot) requestAnimationFrame(frame); else run = false;
    }
    document.addEventListener('pointerover', e => { const b = e.pointerType === 'touch' ? null : e.target.closest(SEL); if (b === hot) return; hot = b; if (hot) add(hot.getBoundingClientRect()); });
    document.addEventListener('pointerout', e => { if (hot && !hot.contains(e.relatedTarget)) hot = null; });
  })();
})();
