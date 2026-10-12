(function(){
  const projects = document.querySelectorAll('.project');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lb-prev'), nextBtn = lightbox.querySelector('.lb-next');
  const tEl = document.getElementById('lb-type'), nEl = document.getElementById('lb-name'), dEl = document.getElementById('lb-desc');

  // what each company does, in two short lines
  const DESC = {
    'baseera': ['A therapy service that uses art', 'as a way to help people express themselves and heal.'],
    'zinger-lab': ['A burger restaurant', 'serving burgers, sandwiches and fries.'],
    '33-butchery': ['A butcher shop', 'selling quality cuts of meat to its customers.'],
    'canary-calls': ['A call center that', 'handles customer calls for businesses.'],
    'compera-jewelry': ['A jewellery brand', 'selling elegant pieces, packaged as gifts.'],
    'hbcs': ['An accounting company', 'providing accounting services for businesses.'],
    'heavyweight-hoodies': ['A clothing brand', 'making heavyweight, warm hoodies.'],
    'motammem': ['A construction company', 'handling building and contracting work.'],
    'sol-root': ['A food brand', 'selling tahini in jars.'],
    'battikhi-stays': ['A hospitality brand in Jordan', 'offering comfortable stays for families.'],
    'the-welcome-table': ['A community brand built around', 'hospitality and sharing coffee together.'],
    'ummati': ['An app that helps people', 'build lasting Sunnah habits, one step at a time.'],
    'qanadeel': ['An association for', 'child development and childhood programmes.'],
    'mwafq': ['A platform for people to', 'find and book official medical exams.'],
    'ticketat': ['An events platform', 'for discovering events and booking tickets online.']
  };
  const stem = p => (p.dataset.src || '').split('/').pop().replace(/\.webp$/, '');
  // flip order = the order of the page, each project once
  const list = [];
  projects.forEach(p => { if (!list.some(q => q.dataset.src === p.dataset.src)) list.push(p); });
  let cur = -1;
  const prog = document.getElementById('lb-progress');
  list.forEach((p, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show ' + p.dataset.name); b.addEventListener('click', e => { e.stopPropagation(); show(i); }); prog.appendChild(b); });

  function show(i) {
    cur = (i + list.length) % list.length;
    const p = list[cur];
    lightboxImg.src = p.dataset.src;
    lightboxImg.alt = p.dataset.name;
    const cap = p.closest('.project-item');
    tEl.textContent = cap && cap.querySelector('.project-type') ? cap.querySelector('.project-type').textContent : '';
    nEl.textContent = p.dataset.name;
    const d = DESC[stem(p)] || []; dEl.innerHTML = ''; d.forEach((t, k) => { if (k) dEl.appendChild(document.createTextNode(' ')); const l = document.createElement('span'); l.textContent = t; dEl.appendChild(l); });
    lightbox.setAttribute('aria-label', p.dataset.name);
    layoutDesc();
    [...prog.children].forEach((b, k) => b.classList.toggle('on', k === cur));
    // load the neighbours so flipping is instant
    [1, -1].forEach(d => { const n = list[(cur + d + list.length) % list.length]; if (n) new Image().src = n.dataset.src; });
  }
  // on phones the description is wrapped by hand so the last row is the shortest one
  function layoutDesc() {
    const d = dEl, phone = matchMedia('(max-width: 640px)').matches;
    d.querySelectorAll('br.lb-br').forEach(x => x.remove());
    if (!phone || !d.textContent.trim()) return;
    const avail = d.clientWidth || d.parentElement.clientWidth;
    if (!avail) return;
    const cs = getComputedStyle(d), cv = layoutDesc.cv || (layoutDesc.cv = document.createElement('canvas')), ctx = cv.getContext('2d');
    ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    const words = d.textContent.trim().split(/\s+/), sp = ctx.measureText(' ').width, wd = words.map(w => ctx.measureText(w).width);
    const pack = lim => { const rows = [[]], widths = [0]; words.forEach((w, i) => { let r = rows.length - 1; const add = (rows[r].length ? sp : 0) + wd[i]; if (rows[r].length && widths[r] + add > lim) { rows.push([]); widths.push(0); r++; } widths[r] += (rows[r].length ? sp : 0) + wd[i]; rows[r].push(i); }); return { rows, widths }; };
    const base = pack(avail - 2), n = base.rows.length;
    if (n < 2) return;
    // try every wrapping width and keep the layout whose last row is the shortest compared with the others
    let best = base, bestScore = 1e9;
    for (let lim = avail - 2; lim > avail * 0.45; lim -= 3) {
      const r = pack(lim);
      if (r.rows.length > n + 1) break;
      if (r.rows.length < 2) continue;
      const last = r.widths[r.widths.length - 1], others = Math.min.apply(null, r.widths.slice(0, -1));
      const score = (last - others) + (r.rows.length - n) * 60;   // a negative score means the last row is the shortest
      if (score < bestScore) { bestScore = score; best = r; }
    }
    // rebuild the text with a line break after each row
    const text = best.rows.map(r => r.map(i => words[i]).join(' '));
    d.textContent = '';
    text.forEach((t, k) => { if (k) { const br = document.createElement('br'); br.className = 'lb-br'; d.appendChild(br); } d.appendChild(document.createTextNode(t)); });
  }
  addEventListener('resize', () => { if (isOpen()) show(cur); });
  function open(p) {
    show(list.findIndex(q => q.dataset.src === p.dataset.src));
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const isOpen = () => lightbox.classList.contains('open');

  projects.forEach(p => p.addEventListener('click', () => open(p)));

  // clicking the dark background closes; the picture, text and arrows do not
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  ['click','pointerup','touchend'].forEach(ev =>
    closeBtn.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); close(); })
  );
  // phones: tap the left or right side of the picture to flip
  lightboxImg.addEventListener('click', e => {
    if (!matchMedia('(max-width: 640px)').matches) return;
    e.stopPropagation();
    const r = lightboxImg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (x < 0.35) show(cur - 1); else if (x > 0.65) show(cur + 1);
  });
  prevBtn.addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });

  addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });

  // swipe left / right on touch screens
  let x0 = 0, y0 = 0, tracking = false;
  lightbox.addEventListener('touchstart', e => { if (e.touches.length !== 1) { tracking = false; return; } tracking = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    if (!tracking) return; tracking = false;
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) show(dx < 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // a link like my-work.html#baseera opens that project straight away
  const want = decodeURIComponent((location.hash || '').slice(1));
  if (want) {
    const hit = Array.from(projects).find(p => (p.dataset.src || '').endsWith('/' + want + '.webp'));
    if (hit) setTimeout(() => open(hit), 250);
  }
})();
