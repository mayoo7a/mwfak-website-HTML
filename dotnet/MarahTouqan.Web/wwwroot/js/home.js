/* Custom pixel cursor + pixel trail */
const pixelCursor = document.getElementById('pixelCursor');
let lastTrail = 0;
const TRAIL_INTERVAL = 35; // ms between trail pixels - lower = denser trail

// Hide the cursor offscreen initially so it doesn't sit at (0,0)
if (pixelCursor) { pixelCursor.style.left = '-100px'; pixelCursor.style.top = '-100px'; }
const noMouse = matchMedia('(hover: none), (pointer: coarse)').matches;
const canHover = matchMedia('(hover: hover)').matches;   // false on touch screens: no hover effects at all
function moveCursor(e) {
  if (!pixelCursor || noMouse) return;
  pixelCursor.style.left = e.clientX + 'px';
  pixelCursor.style.top  = e.clientY + 'px';

  // Spawn a small fading pixel behind the cursor
  const now = performance.now();
  if (now - lastTrail >= TRAIL_INTERVAL) {
    lastTrail = now;
    const t = document.createElement('div');
    t.className = 'trail-pixel';
    const jx = (Math.random() * 10) | 0;
    const jy = (Math.random() * 10) | 0;
    const offsetX = 18;
    const offsetY = 22;
    t.style.left = (e.clientX + offsetX + jx) + 'px';
    t.style.top  = (e.clientY + offsetY + jy) + 'px';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 600);
  }
}
addEventListener('pointermove', moveCursor, { passive: true });

if (canHover) document.querySelectorAll('[data-hover], a, button').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
});

/* Burger menu: keyboard (Escape closes) and screen-reader state (expanded, hidden, focus) */
const burger = document.getElementById('burger');
const menu   = document.getElementById('menuPanel');
function setMenu(open, returnFocus) {
  burger.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  menu.toggleAttribute('inert', !open);          // closed links cannot be tabbed to or read
  if (open) { const first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  else if (returnFocus) burger.focus({ preventScroll: true });
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open'), false));
document.querySelectorAll('.menu-panel a').forEach(a => {
  a.addEventListener('click', () => setMenu(false, false));
});
addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) { e.preventDefault(); setMenu(false, true); }
});

/* ============================================================
   REVIEWS: spiral galaxy, starfield canvas
   ============================================================ */
(function spiralGalaxy(){
  const gal = document.getElementById('cnGal');
  const sec = document.getElementById('testimonials');
  const root = document.getElementById('cn');
  if (!gal || !sec || !root) return;
  const gctx = gal.getContext('2d');
  const text = document.getElementById('cnText');
  const qEl = document.getElementById('cnQuote'), nEl = document.getElementById('cnName'), rEl = document.getElementById('cnRole');
  const dotsEl = document.getElementById('cnDots');
  const reduce = false;   // the reviews keep their gentle animation on every device, including phones set to "reduce motion"

  const profiles = (window.siteReviews || []).map(r => ({ name: r.name, role: r.role, cStars: 5, img: '', review: r.review }));

  const tint = ['#F9A323','#D23697','#1E7CDF','#FA5643','#F9A323','#D23697','#1E7CDF','#FA5643'];
  const CR = '#F7F7F7';
  const starPath = (c, x, y, r, rot) => { c.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * 0.55 : r, an = rot - Math.PI / 2 + k * Math.PI / 5; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + Math.sin(an) * rr); } c.closePath(); };
  const N = profiles.length;
  const ARMS = 4, TILT = 0.42, TURN = Math.PI * 3.1, ROT = -0.3;
  const markerR = [0.34, 0.58, 0.8, 0.46, 0.9, 0.28, 0.68, 0.55];
  let gW = 0, gH = 0, R = 100, parts = [], rot = 0.5, cur = -1, timer = null, started = false, gLast = 0, mpos = [];

  profiles.forEach((p, i) => {
    const d = document.createElement('button'); d.type = 'button'; d.className = 'cn-dot';
    d.setAttribute('aria-label', 'Show review from ' + p.name);
    d.addEventListener('click', () => { show(i); restart(); });
    dotsEl.appendChild(d);
  });

  function rnd(){ return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function seed(){
    const n = 620, k = Math.max(0.7, Math.min(1, R / 300));   // same number of dots as the wide screen; each dot shrinks with the galaxy
    parts = [];
    for (let i = 0; i < n; i++) {
      const f = Math.pow(Math.random(), 0.62);
      const arm = i % ARMS;
      const ang = arm * (Math.PI * 2 / ARMS) + f * TURN + rnd() * (0.5 - f * 0.28);
      const rad = f + rnd() * 0.035;
      const hue = f < 0.25 ? '#F9A323' : f < 0.6 ? '#D23697' : '#1E7CDF';
      parts.push({ f: Math.max(rad, 0.01), a: ang, c: Math.random() < 0.08 ? '#F2EBE8' : hue, s: (Math.random() * 2.6 + 2.6) * k, al: 1 });
    }
  }
  function layoutG(){
    const r = gal.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    gW = r.width; gH = r.height;
    gal.width = gW * d; gal.height = gH * d; gctx.setTransform(d, 0, 0, d, 0, 0);
    R = Math.max(20, Math.min(gW * 0.47, (gH - 80) * 1.05));   // 40px of spare room above and below, so star glows are never clipped
    seed();
  }
  function proj(f, a){
    const x = Math.cos(a) * f * R, y = Math.sin(a) * f * R * TILT;
    const cs = Math.cos(ROT), sn = Math.sin(ROT);
    return [gW / 2 + x * cs - y * sn, gH / 2 + x * sn + y * cs];
  }
  function drawGal(t){
    if (gW < 20 || gH < 20) return;   // not laid out yet: wait for the next resize
    const dt = gLast ? Math.min((t - gLast) / 1000, 0.05) : 0; gLast = t;
    if (!reduce) rot += dt * 0.05;
    gctx.clearRect(0, 0, gW, gH);
    const [cx, cy] = [gW / 2, gH / 2];
    // flat cartoon core: yellow sun with a cream highlight
    gctx.save(); gctx.translate(cx, cy); gctx.rotate(ROT); gctx.scale(1, TILT * 1.35);
    gctx.fillStyle = '#FA5643'; gctx.beginPath(); gctx.arc(0, 0, R * 0.17, 0, 6.283); gctx.fill();
    gctx.fillStyle = '#F9A323'; gctx.beginPath(); gctx.arc(0, 0, R * 0.12, 0, 6.283); gctx.fill();
    gctx.fillStyle = '#F7F7F7'; gctx.beginPath(); gctx.arc(-R * 0.035, -R * 0.035, R * 0.04, 0, 6.283); gctx.fill();
    gctx.restore();
    // chunky square dots along the arms
    for (const p of parts) {
      const [x, y] = proj(p.f, p.a + rot * (1.15 - p.f * 0.75));
      gctx.fillStyle = p.c;
      gctx.fillRect(Math.round(x), Math.round(y), p.s, p.s);
    }
    // review stars: cartoon stars with a thick cream outline
    mpos = [];
    for (let i = 0; i < N; i++) {
      const f = markerR[i % markerR.length], a = (i % ARMS) * (Math.PI * 2 / ARMS) + f * TURN + rot * (1.15 - f * 0.75);
      const [x, y] = proj(f, a); mpos.push([x, y]);
      const on = i === cur, col = tint[i % tint.length];
      // shiny four-point sparkle star (the "cross" star): glow, glossy white core, gentle pulse
      const sc = gW < 700 ? 0.9 : 1;
      const base = on ? '#F9A323' : col;
      const tw = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t / 420 + i * 1.7);
      const r = (on ? 15 : 9) * sc * (0.88 + 0.22 * tw);
      const gl = gctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
      gl.addColorStop(0, base + (on ? 'cc' : '99')); gl.addColorStop(1, base + '00');
      gctx.fillStyle = gl; gctx.beginPath(); gctx.arc(x, y, r * 2.2, 0, 6.283); gctx.fill();
      const spark = (rr, k) => { gctx.beginPath(); gctx.moveTo(x, y - rr);
        gctx.quadraticCurveTo(x + rr * k, y - rr * k, x + rr, y); gctx.quadraticCurveTo(x + rr * k, y + rr * k, x, y + rr);
        gctx.quadraticCurveTo(x - rr * k, y + rr * k, x - rr, y); gctx.quadraticCurveTo(x - rr * k, y - rr * k, x, y - rr); gctx.closePath(); };
      spark(r, 0.16);
      const bg = gctx.createRadialGradient(x, y, 0, x, y, r);
      bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(0.18, '#FFFFFF'); bg.addColorStop(0.5, base); bg.addColorStop(1, base);
      gctx.fillStyle = bg; gctx.fill();
    }
  }
  function pick(e){
    const r = gal.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 30 * 30;
    mpos.forEach((m, i) => { const d = (m[0] - x) * (m[0] - x) + (m[1] - y) * (m[1] - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  gal.addEventListener('click', e => { const i = pick(e); if (i >= 0) { show(i); restart(); } });
  gal.addEventListener('pointermove', e => { gal.style.cursor = pick(e) >= 0 ? 'pointer' : 'default'; });

  function show(i){
    cur = i;
    [...dotsEl.children].forEach((d, j) => d.classList.toggle('on', j === i));
    const p = profiles[i];
    nEl.textContent = p.name; rEl.textContent = p.role; qEl.textContent = '\u201C' + p.review + '\u201D';
    [qEl, nEl, rEl].forEach(el => el.classList.remove('cn-swap')); void text.offsetWidth; [qEl, nEl, rEl].forEach(el => el.classList.add('cn-swap'));
    if (reduce || !started) drawGal(gLast || 0);
  }
  // keep the review layout still: the quote box, name pill and role line are sized to the largest review
  function fixSizes(){
    const keep = [qEl.textContent, nEl.textContent, rEl.textContent];
    qEl.style.minHeight = nEl.style.minWidth = rEl.style.minHeight = '';
    let qh = 0, nw = 0, rh = 0;
    profiles.forEach(p => {
      qEl.textContent = '\u201C' + p.review + '\u201D'; nEl.textContent = p.name; rEl.textContent = p.role;
      qh = Math.max(qh, qEl.offsetHeight); nw = Math.max(nw, nEl.offsetWidth); rh = Math.max(rh, rEl.offsetHeight);
    });
    qEl.textContent = keep[0]; nEl.textContent = keep[1]; rEl.textContent = keep[2];
    qEl.style.minHeight = qh + 'px'; nEl.style.minWidth = nw + 'px'; rEl.style.minHeight = rh + 'px';
    updateEx();
  }
  function restart(){ clearInterval(timer); timer = setInterval(() => show((cur + 1) % N), 2500); }

  /* starfield */
  const cv = document.getElementById('gxCanvas'), ctx = cv.getContext('2d');
  let W = 0, H = 0, ex = null, stars = [], shoot = null, visible = false, raf = 0, last = 0;
  function resize(){
    const r = sec.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(Math.min(220, W * H / 7000));
    updateGC();
    stars = Array.from({ length: Math.round(n * 1.9) }, () => mkStar(sample(Math.random() * H)));
    updateEx();
    draw(0);
  }
  // star density peaks around the galaxy and thins out with distance
  let gc = { x: 0, y: 0, sx: 1, sy: 1 };
  function updateGC(){
    const a = sec.getBoundingClientRect(), g = gal.getBoundingClientRect();
    gc = { x: g.left - a.left + g.width / 2, y: g.top - a.top + g.height / 2, sx: Math.max(150, g.width * 0.36), sy: Math.max(150, g.height * 0.8) };
  }
  function sample(y){   // pick a position (fixed y if given) with probability falling off from the galaxy
    let x = Math.random() * W;
    for (let k = 0; k < 40; k++) {
      x = Math.random() * W; const yy = y == null ? Math.random() * H : y;
      const dx = (x - gc.x) / gc.sx, dy = (yy - gc.y) / gc.sy;
      if (Math.random() < 0.03 + Math.exp(-(dx * dx + dy * dy) / 2)) return { x, y: yy };
    }
    return { x, y: y == null ? Math.random() * H : y };
  }
  const mkStar = p => ({ x: p.x, y: p.y, r: Math.random() * 1.4 + .3, p: Math.random() * 6.28, s: Math.random() * 1.5 + .5, v: Math.random() * 6 + 2, col: sfCols[Math.floor(Math.random() * sfCols.length)], big: Math.random() < 0.22 });
  // keep the sky clear behind the review text: stars are only drawn around it
  function updateEx(){
    // box around everything the reader sees: quote text, name, role and dots (measured on the real text, not just the container)
    const a = sec.getBoundingClientRect();
    let l = 1e9, r = -1e9, t = 1e9, bt = -1e9;
    const add = b => { if (!b || !b.width) return; l = Math.min(l, b.left); r = Math.max(r, b.right); t = Math.min(t, b.top); bt = Math.max(bt, b.bottom); };
    add(text.getBoundingClientRect());
    [qEl, nEl, rEl, dotsEl].forEach(e => add(e.getBoundingClientRect()));
    if (qEl.firstChild) { const rg = document.createRange(); rg.selectNodeContents(qEl); add(rg.getBoundingClientRect()); }
    if (l > r) return;
    ex = { l: l - a.left - 28, r: r - a.left + 28, t: t - a.top - 22, b: bt - a.top + 22 };
  }
  const inEx = (x, y, m) => ex && x > ex.l - m && x < ex.r + m && y > ex.t - m && y < ex.b + m;
  const sfCols = ['#F2EBE8', '#F2EBE8', '#F9A323', '#D23697', '#1E7CDF'];
  let exAt = 0;
  function draw(t){
    if (t - exAt > 200 || t < exAt) { updateEx(); exAt = t; }
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const on = reduce || Math.floor(t / 1000 * s.s + s.p) % 3 !== 0;   // steps on and off, like cartoon twinkling
      if (on && !inEx(s.x, s.y, 6)) {
        ctx.fillStyle = s.col;
        const u = s.r > 1 ? 4 : 3;
        if (s.big) { ctx.fillRect(s.x - u * 2, s.y - 1, u * 4, 2); ctx.fillRect(s.x - 1, s.y - u * 2, 2, u * 4); }
        else ctx.fillRect(Math.round(s.x), Math.round(s.y), u, u);
      }
      if (!reduce) { s.y -= s.v * (t - last) / 1000 * .12; if (s.y < -8) { s.y = H + 8; s.x = sample(H + 8).x; } }
    }
    last = t;
  }
  function loop(t){ draw(t); drawGal(t); raf = requestAnimationFrame(loop); }

  const relayout = () => { try { layoutG(); resize(); fixSizes(); drawGal(gLast || 0); } catch (e) {} };
  relayout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  if ('ResizeObserver' in window) new ResizeObserver(() => { const r = gal.getBoundingClientRect(); if (Math.abs(r.width - gW) > 1 || Math.abs(r.height - gH) > 1) relayout(); }).observe(gal);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        relayout();
        if (!started) { started = true; show(0); }
        restart();
        if (!reduce) raf = requestAnimationFrame(loop);
      } else clearInterval(timer);
    }, { threshold: .15 }).observe(sec);
  } else { started = true; show(0); restart(); }
})();

/* Switch screen slideshow: slides left every 2.5 seconds. Joy-Con buttons, the arrows and swiping control it; the caption follows the slide */
(function switchSlideshow(){
  const slides = document.querySelectorAll('.screen-slide');
  if (slides.length < 2) return;
  const screenLink = document.querySelector('.switch-screen');
  const frame = document.querySelector('.switch-frame');
  const cCount = document.getElementById('wcCount'), cName = document.getElementById('wcName'), cType = document.getElementById('wcType');
  let i = 0, timer = null, paused = false, swiped = false;
  const caption = () => {
    const s = slides[i];
    if (cName) cName.textContent = s.dataset.type || '';
    if (cType) cType.textContent = s.dataset.name || '';
    if (screenLink) { screenLink.href = 'my-work.html'; screenLink.setAttribute('aria-label', 'See all my work'); }   // the screen opens the My Work page, from the top
  };
  let busy = false, pending = null;
  const show = (n, dir = 1) => {
    // never start a slide while one is still moving (fast clicks or swipes): the latest request waits its turn, so the images always stay joined
    if (busy) { pending = { n: n, dir: dir }; return; }
    const old = slides[i];
    i = (n + slides.length) % slides.length;
    const nw = slides[i];
    nw.loading = 'eager';
    caption();
    if (old === nw) return;
    // slide only once the next image is loaded and decoded, so no empty strip ever shows between the two
    const run = () => {
      // park every other slide off-screen, start the new one just beside the screen (2px overlap), then slide both across
      slides.forEach(s => { if (s !== old && s !== nw) { s.style.transition = 'none'; s.style.transform = 'translateX(100%)'; } });
      nw.style.transition = 'none'; nw.style.transform = 'translateX(calc(' + (dir * 100) + '% - ' + (dir * 2) + 'px))';
      void nw.offsetWidth;
      old.style.transition = ''; nw.style.transition = '';
      old.style.transform = 'translateX(calc(' + (-dir * 100) + '% + ' + (dir * 2) + 'px))';
      nw.style.transform = 'translateX(0)';
      old.classList.remove('is-active'); nw.classList.add('is-active');
    };
    busy = true;
    const go = () => { run(); setTimeout(() => { busy = false; if (pending) { const q = pending; pending = null; show(q.n, q.dir); } }, 650); };
    if (nw.complete && nw.naturalWidth) { go(); }
    else { let done = false; const once = () => { if (!done) { done = true; go(); } }; (nw.decode ? nw.decode() : Promise.reject()).then(once, once); setTimeout(once, 1500); }
  };
  // load every slide up front so later slides are ready by the time they are shown
  const preload = () => slides.forEach(s => { s.loading = 'eager'; if (s.decode) s.decode().catch(() => {}); });
  if (document.readyState === 'complete') setTimeout(preload, 300); else addEventListener('load', () => setTimeout(preload, 300));
  const start = () => { clearInterval(timer); if (!paused) timer = setInterval(() => show(i + 1), 2500); };
  const actions = {
    next:  () => { show(i + 1); start(); },
    prev:  () => { show(i - 1, -1); start(); },
    pause: () => { paused = !paused; paused ? clearInterval(timer) : start(); },
    work:  () => { location.href = screenLink.href; }
  };
  document.querySelectorAll('.joy-btn').forEach(btn =>
    btn.addEventListener('click', () => actions[btn.dataset.joy]()));
  // swipe left or right on the console to change the project; a tap still opens it in My Work
  if (frame) {
    let x0 = 0, y0 = 0, t0 = 0;
    frame.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); clearInterval(timer); }, { passive: true });
    frame.addEventListener('touchend', e => {
      const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; setTimeout(() => { swiped = false; }, 450); dx < 0 ? show(i + 1) : show(i - 1, -1); }
      start();
    }, { passive: true });
    if (screenLink) screenLink.addEventListener('click', e => { if (swiped) e.preventDefault(); });
  }
  caption();
  start();
})();

/* Track cursor position globally so scroll-aware tooltips can recheck */
let _cursorX = -1, _cursorY = -1;
addEventListener('pointermove', e => { _cursorX = e.clientX; _cursorY = e.clientY; }, { passive: true });

/* JS-based hover for intro stickers — scroll-aware */
if (canHover) document.querySelectorAll('.intro .sticker').forEach(s => {
  s.addEventListener('pointerenter', () => s.classList.add('is-hovered'));
  s.addEventListener('pointerleave', () => s.classList.remove('is-hovered'));
});
addEventListener('scroll', () => {
  if (_cursorX < 0) return;
  const el = document.elementFromPoint(_cursorX, _cursorY);
  document.querySelectorAll('.intro .sticker').forEach(s => {
    if (el && s.contains(el)) s.classList.add('is-hovered');
    else s.classList.remove('is-hovered');
  });
}, { passive: true });

/* Cat follows the cursor while hovering "cat cuddles" — scroll-aware */
(function catFollower(){
  const cat = document.getElementById('catFollower');
  const trigger = document.querySelector('.intro-headline .pixel');
  if (!cat || !trigger || !canHover) return;
  const offsetX = -70, offsetY = -20;
  const place = (x, y) => {
    cat.style.left = (x + offsetX) + 'px';
    cat.style.top  = (y + offsetY) + 'px';
  };
  const onMove = e => place(e.clientX, e.clientY);
  const show = () => { cat.classList.add('show'); document.body.classList.add('cat-mode'); };
  const hide = () => { cat.classList.remove('show'); document.body.classList.remove('cat-mode'); };
  trigger.addEventListener('pointerenter', e => { onMove(e); show(); });
  trigger.addEventListener('pointerleave', hide);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('scroll', () => {
    if (_cursorX < 0) return;
    place(_cursorX, _cursorY);
    const el = document.elementFromPoint(_cursorX, _cursorY);
    if (el && trigger.contains(el)) show(); else hide();
  }, { passive: true });
})();

/* Dragon tooltip follows the cursor when hovering on the Dragon title or GIF */
(function dragonTooltipFollower(){
  const tip = document.querySelector('.dragon-tooltip');
  const block = document.querySelector('.mag-title-block');
  if (!tip || !block || !canHover) return;
  let lastX = -1, lastY = -1;
  const place = (x, y) => {
    lastX = x; lastY = y;
    tip.style.left = x + 'px';
    tip.style.top  = (y - 16) + 'px';
  };
  const onMove = e => place(e.clientX, e.clientY);
  const show = () => tip.classList.add('show');
  const hide = () => tip.classList.remove('show');
  addEventListener('pointermove', onMove, { passive: true });
  const reCheck = () => {
    if (lastX < 0) return;
    const el = document.elementFromPoint(lastX, lastY);
    const inside = el && block.contains(el);
    if (inside) show(); else hide();
  };
  block.addEventListener('pointerenter', show);
  block.addEventListener('pointerleave', hide);
  addEventListener('scroll', reCheck, { passive: true });
})();

/* Place the 4 floating intro stickers in 4 non-overlapping vertical bands */
(function placeStickers(){
  const stickers = Array.from(document.querySelectorAll('.intro .sticker'));
  if (!stickers.length) return;
  const place = () => {
    const section = document.querySelector('.intro');
    if (!section) return;
    const w = section.clientWidth;
    const h = section.clientHeight;
    stickers.forEach(s => s.style.display = '');
    if (w <= 1050) {
      // phones and small tablets: top-left, top-right, bottom-left, bottom-right corners, inside the section's padding
      const corners = [
        { top: 0,  left: '7%',  stagger: 0 },
        { top: 0,  right: '8%', stagger: 8 },
        { bottom: 0, left: '10%', stagger: 6 },
        { bottom: 0, right: '7%', stagger: 0 }
      ];
      // centre each shape in the free band between the section edge and the text, so it has space on both sides
      const sr = section.getBoundingClientRect();
      const head = document.querySelector('.intro-headline').getBoundingClientRect();
      const body = document.querySelector('.intro-body').getBoundingClientRect();
      const topGap = Math.max(0, head.top - sr.top), botGap = Math.max(0, sr.bottom - body.bottom);
      stickers.forEach((s, i) => {
        const c = corners[i % corners.length];
        s.style.position = 'absolute';
        const sh = s.getBoundingClientRect().height || 40;
        const gap = c.top !== undefined ? topGap : botGap;
        const off = Math.round(Math.min(64, Math.max(8, (gap - sh) / 2)) + (c.stagger || 0) * 0.5);
        s.style.top = c.top !== undefined ? off + 'px' : 'auto'; s.style.bottom = c.bottom !== undefined ? off + 'px' : 'auto';
        s.style.left = c.left || 'auto'; s.style.right = c.right || 'auto';
        const tilt = ((i % 2 ? 1 : -1) * (4 + i * 2)).toFixed(1);
        s.style.setProperty('--tilt', tilt + 'deg');
        s.style.transform = `rotate(${tilt}deg)`;
      });
      return;
    }
    // 2 stickers on the LEFT band (5%-15% of width), 2 on the RIGHT band (85%-95%)
    // and 4 vertical bands across the section height.
    const bands = [
      { side: 'left',  yPct: 18 },
      { side: 'right', yPct: 22 },
      { side: 'left',  yPct: 62 },
      { side: 'right', yPct: 70 }
    ];
    stickers.forEach((s, i) => {
      const b = bands[i % bands.length];
      const xJitter = Math.random() * 4;
      const yJitter = (Math.random() * 6) - 3;
      if (b.side === 'left') {
        s.style.left  = (6 + xJitter) + '%';
        s.style.right = 'auto';
      } else {
        s.style.right = (6 + xJitter) + '%';
        s.style.left  = 'auto';
      }
      s.style.top = (b.yPct + yJitter) + '%';
      s.style.position = 'absolute';
      // Subtle random rotation
      const tilt = (Math.random() * 14 - 7).toFixed(1);
      s.style.setProperty('--tilt', tilt + 'deg');
      s.style.transform = `rotate(${tilt}deg)`;
    });
  };
  // hide any shape that would touch the text or run off the section, so only shapes that really fit are shown
  const fit = () => {
    const section = document.querySelector('.intro');
    if (!section) return;
    const sr = section.getBoundingClientRect();
    const lines = [];
    ['.intro-headline', '.intro-body'].forEach(sel => {
      const el = document.querySelector(sel); if (!el) return;
      const rg = document.createRange(); rg.selectNodeContents(el);
      Array.from(rg.getClientRects()).forEach(r => { if (r.width > 2 && r.height > 2) lines.push(r); });
    });
    const pad = 16;
    stickers.forEach(s => {
      const r = s.getBoundingClientRect();
      const out = r.left < sr.left + 4 || r.right > sr.right - 4 || r.top < sr.top + 4 || r.bottom > sr.bottom - 4;
      const hit = lines.some(l => r.left < l.right + pad && r.right > l.left - pad && r.top < l.bottom + pad && r.bottom > l.top - pad);
      s.style.display = (out || hit) ? 'none' : '';
    });
  };
  const layout = () => { place(); fit(); };
  layout();
  addEventListener('resize', layout);
  addEventListener('load', () => setTimeout(layout, 200));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
})();

/* Back-to-top — sticky circle button that scrolls to the top */
(function backToTop(){
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19 V5 M5 12 L12 5 L19 12"/></svg>';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  // Sections that have a LIGHT (cream) background — button should switch to dark color over them
  const lightSelectors = ['.intro', '.work', '.contact', '.footer'];
  const lightSections = lightSelectors
    .map(sel => document.querySelector(sel))
    .filter(Boolean);

  function toggle(){
    btn.classList.toggle('is-visible', window.scrollY > 200);
    // Determine if the button (bottom-right) is currently over a light section
    const probeY = window.innerHeight - 50;
    let onLight = false;
    for (const el of lightSections) {
      const r = el.getBoundingClientRect();
      if (r.top <= probeY && r.bottom >= probeY) { onLight = true; break; }
    }
    btn.classList.toggle('is-on-light', onLight);
  }
  toggle();
  addEventListener('scroll', toggle, { passive: true });
  addEventListener('resize', toggle);
})();
