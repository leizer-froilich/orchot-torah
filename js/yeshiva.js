/* Orchot Torah · institution pages */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ---------- gold title ornament, same drawing as the homepage ---------- */
  const FRAME = 'M180 8.9L164.7 2.3L158.8 8.1V18.1H165V3.7L179.6 9.7zM180 8.9l.2.8L194.7 3.7V18.1H201.2V8.1L195.2 2.3z' +
                'M158.8 43.9V49.7L164.8 55.7L179.9 61.7V60.8L165 54.1V43.9zM201.2 43.9H194.8V54.1L180 60.8V61.7L195.2 55.5L201.2 49.7z';
  const side = '<path d="M232 40h52"/><path d="M284 40c14 0 22-6 22-13 0-6-6-9-10-6.5s-2.5 8 2.5 7.5"/><path d="M284 40c14 0 22 6 22 13 0 6-6 9-10 6.5s-2.5-8 2.5-7.5"/><path d="M312 40h20"/>';
  const ORN = '<defs><linearGradient id="gmo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="360" y2="64"><stop offset="0" stop-color="#8C6A32"/><stop offset=".3" stop-color="#E9CF8E"/><stop offset=".5" stop-color="#F6E4AE"/><stop offset=".7" stop-color="#C29A5B"/><stop offset="1" stop-color="#8C6A32"/></linearGradient></defs>' +
    '<g fill="none" stroke="url(#gmo)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' + side + '<g transform="translate(360 0) scale(-1 1)">' + side + '</g></g>' +
    '<g fill="url(#gmo)"><path class="f" d="' + FRAME + '"/><path class="f" d="M180 22l2.2 6.8L189 31l-6.8 2.2L180 40l-2.2-6.8L171 31l6.8-2.2z"/><path class="f" d="M220 34l6 6-6 6-6-6z"/><path class="f" d="M140 34l6 6-6 6-6-6z"/><circle class="f" cx="344" cy="40" r="2.6"/><circle class="f" cx="16" cy="40" r="2.6"/></g>';
  $$('[data-orn]').forEach(s => { s.innerHTML = ORN; s.querySelectorAll('g[stroke] path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1)); });

  /* ---------- titles fill in from a gold contour ---------- */
  $$('h2').forEach(h => {
    [...h.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'tf'; s.textContent = n.textContent; n.replaceWith(s); } });
    h.querySelectorAll('.tf,.gold').forEach((s, i) => s.style.setProperty('--d', (.2 + i * .35) + 's'));
  });
  const fio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-filled'); fio.unobserve(e.target); } }), { threshold: .6 });
  $$('h2').forEach(h => fio.observe(h));

  /* ---------- menu, reveals, in-page anchors ---------- */
  const menu = $('#menu');
  const setMenu = o => { document.body.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); menu.setAttribute('aria-label', o ? 'סגירת תפריט' : 'פתיחת תפריט'); };
  menu.addEventListener('click', () => setMenu(!document.body.classList.contains('open')));
  $('#drawerClose').addEventListener('click', () => setMenu(false));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = a.getAttribute('href').length > 1 && $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); scrollTo({ top: t.getBoundingClientRect().top + scrollY - 20, behavior: RM ? 'auto' : 'smooth' });
  }));

  /* ---------- hero: parchment over the photo, erased by growing ink blots ---------- */
  document.body.classList.add('is-ready');
  const ink = $('#ink'), hero = $('.hero');
  const show = () => { document.body.classList.add('is-revealed'); $('.hero h1').classList.add('is-filled'); };
  if (RM) { ink.remove(); show(); } else {
    const W = hero.clientWidth, H = hero.clientHeight; ink.width = W; ink.height = H;
    const c = ink.getContext('2d'); c.fillStyle = '#F2E8D5'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'destination-out';
    const R = Math.hypot(W, H), seeds = [[.5, .4, 0, 1500, .6], [.2, .7, 180, 1400, .46], [.8, .68, 240, 1400, .46], [.14, .16, 420, 1250, .4], [.88, .16, 460, 1250, .4]]
      .map(([x, y, d, dur, s]) => ({ x, y, d, dur, s, ph: [Math.random() * 6, Math.random() * 6, Math.random() * 6] }));
    const start = performance.now();
    setTimeout(show, 900);
    requestAnimationFrame(function frame(now) {
      const t = now - start; let alive = false;
      for (const s of seeds) {
        const p = clamp((t - s.d) / s.dur); if (p < 1) alive = true; if (p <= 0) continue;
        const r = easeOut(p) * R * s.s, cx = s.x * W, cy = s.y * H; c.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = i / 72 * Math.PI * 2, rr = r * (1 + .16 * Math.sin(a * 3 + s.ph[0] + t * .0012) + .1 * Math.sin(a * 7 + s.ph[1]) + .06 * Math.sin(a * 13 + s.ph[2] - t * .002));
          i ? c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        const g = c.createRadialGradient(cx, cy, r * .55, cx, cy, r * 1.2); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fill();
      }
      if (alive) requestAnimationFrame(frame); else { ink.style.transition = 'opacity .5s'; ink.style.opacity = 0; setTimeout(() => ink.remove(), 550); }
    });
  }

  /* ---------- gallery: tilted endless rows; built when near the screen, each row starting at a different photo ---------- */
  const wg = $('#wg'), imgs = wg.dataset.imgs.split('|'), ROWS = 8;
  new IntersectionObserver(([e], ob) => {
    if (!e.isIntersecting) return; ob.disconnect();
    const rot = n => imgs.map((_, i) => imgs[(i + n) % imgs.length]);
    const cell = s => `<button class="wg__i" type="button" data-i="${imgs.indexOf(s)}" aria-label="הגדלת תמונה ${imgs.indexOf(s) + 1}"><img src="${s}" alt="" decoding="async"></button>`;
    wg.innerHTML = Array.from({ length: ROWS }, (_, r) => { const g = `<div class="wg__g">${rot(r * 3).map(cell).join('')}</div>`; return `<div class="wg__row" style="--t:${84 + r * 13}s">${g}${g}${g}${g}</div>`; }).join('');
  }, { rootMargin: '700px' }).observe(wg);

  /* ---------- gallery lightbox ---------- */
  const lb = $('#lb'), big = lb.querySelector('img'); let cur = 0;
  const open = i => { cur = (i + imgs.length) % imgs.length; big.src = imgs[cur]; lb.classList.add('on'); lb.setAttribute('aria-hidden', false); };
  const close = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', true); };
  wg.addEventListener('click', e => { const b = e.target.closest('.wg__i'); if (b) open(+b.dataset.i); });
  lb.querySelector('.lb__x').addEventListener('click', close);
  lb.querySelector('.lb__p').addEventListener('click', () => open(cur - 1));
  lb.querySelector('.lb__f').addEventListener('click', () => open(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); setMenu(false); }
    if (!lb.classList.contains('on')) return;
    if (e.key === 'ArrowLeft') open(cur + 1); if (e.key === 'ArrowRight') open(cur - 1);
  });

  /* ---------- gold sparks in the buttons ---------- */
  (function btnSparks() {
    if (RM) return;
    const cv = document.createElement('canvas'); cv.className = 'bsparks'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const c = cv.getContext('2d'); let W, H, ps = [], hot = null, run = false, acc = 0;
    const spr = document.createElement('canvas'); spr.width = spr.height = 32;
    const g = spr.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,250,232,1)'); gr.addColorStop(.25, 'rgba(246,224,160,.9)'); gr.addColorStop(.6, 'rgba(194,154,91,.32)'); gr.addColorStop(1, 'rgba(194,154,91,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    const add = r => { const a = Math.random() * 6.28, v = .08 + Math.random() * .2; ps.push({ x: r.left + 6 + Math.random() * (r.width - 12), y: r.top + 5 + Math.random() * (r.height - 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v - .2, life: 0, max: 50 + Math.random() * 40, s: 3 + Math.random() * 5 }); if (!run) { run = true; requestAnimationFrame(frame); } };
    function frame() {
      c.clearRect(0, 0, W, H);
      if (hot && hot.isConnected) { acc += .12; while (acc >= 1) { acc--; add(hot.getBoundingClientRect()); } }
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.life++; p.x += p.vx; p.y += p.vy; const k = p.life / p.max; if (k >= 1) { ps.splice(i, 1); continue; } c.globalAlpha = Math.sin(Math.PI * k) * .9; c.drawImage(spr, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
      c.globalAlpha = 1; if (ps.length || hot) requestAnimationFrame(frame); else run = false;
    }
    document.addEventListener('pointerover', e => { const b = e.pointerType === 'touch' ? null : e.target.closest('.btn'); if (b === hot) return; hot = b; if (hot) add(hot.getBoundingClientRect()); });
    document.addEventListener('pointerout', e => { if (hot && !hot.contains(e.relatedTarget)) hot = null; });
  })();
})();
