(() => {
  'use strict';
  const app = document.getElementById('app');
  const token = app.dataset.token;
  const panel = document.getElementById('panel');
  const stateEl = document.getElementById('state');
  const $ = id => document.getElementById(id);

  // ---------- small helpers ----------
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  const humanize = k => k.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, c => c.toUpperCase());
  const toast = (msg, bad) => {
    const t = $('toast'); t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : ''); t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, bad ? 9000 : 3500);
  };
  const post = (handler, body, extra = {}) => fetch(`/admin?handler=${handler}`, {
    method: 'POST', headers: { RequestVerificationToken: token, ...extra }, body
  });

  // ---------- state ----------
  let data = null, savedJson = '', active = localStorage.getItem('adminTab') || 'site';
  const openCards = new Set();
  const isDirty = () => JSON.stringify(data) !== savedJson;
  const refreshState = () => {
    const d = data && isDirty();
    stateEl.textContent = d ? 'Unsaved changes' : 'All saved';
    stateEl.className = 'state' + (d ? ' dirty' : '');
    $('saveBtn').disabled = !d;
  };

  // ---------- friendly names and hints ----------
  const LABELS = {
    baseUrl: 'Website address', ogImage: 'Image shown when the link is shared', ogImageAlt: 'Describe that image',
    whatsAppNumber: 'WhatsApp number (digits only, with country code)', phoneDisplay: 'Phone number as shown', email: 'Email',
    behance: 'Behance link', linkedIn: 'LinkedIn link', instagram: 'Instagram link', cvPath: 'CV file (PDF)',
    jobTitle: 'Job title', shortBio: 'Short bio (for Google)', knowsAbout: 'Skills (for Google)', serviceTypes: 'Service types (for Google)',
    behanceHandle: 'Behance name shown', linkedInName: 'LinkedIn name shown', emailCardText: 'Email card text', contactTitle: 'Contact title',
    postScript1: 'P.S. line 1', postScript2: 'P.S. line 2', availabilityLine1: 'Availability line 1', availabilityLine2: 'Availability line 2',
    footerTagline: 'Footer tagline', title: 'Title', description: 'Description', path: 'Page address',
    heroVideo: 'Hero video (computer)', heroVideoSmall: 'Hero video (phone, smaller)', heroPoster: 'Hero picture (shown before the video plays)',
    heroTitle: 'Hidden page heading (for Google)', heroAriaLabel: 'Video description (for screen readers)',
    introLine2: 'Headline, line 2', introPixel: 'Headline, pixel words', introUnderline: 'Headline, underlined word', introParagraphs: 'Intro paragraphs',
    cvLinkText: 'CV link text', dragonPre: 'Dragon title, small text', dragonWord: 'Dragon title, big word', dragonTooltip: 'Dragon speech bubble',
    cards: 'The 4 service cards', service: 'Service', heading1: 'Heading, line 1', heading2: 'Heading, line 2', text: 'Text', ribbon: 'Ribbon text',
    workTitle: 'My Work title', workCta: 'My Work button', slides: 'Slideshow screens', project: 'Project', type: 'Type', alt: 'Picture description',
    reviewsTitle: 'Reviews title (one word per box)', reviews: 'Reviews', name: 'Name', role: 'Where it came from', color: 'Color',
    slug: 'Address name', menuLabel: 'Name in the menu', tagline: 'Tagline', boxImage: 'Colored box', projectImage: 'Example project picture',
    projectName: 'Example project name', projectType: 'Example project type', priceLabel: 'Price label', price: 'Price', ctaText: 'Button text',
    scopeTitle: 'Scope: title', scope: 'Scope items', before: 'Text before the highlight', highlight: 'Highlighted part', after: 'Text after the highlight',
    icon: 'Icon', stepsTitle: 'Steps: title', steps: 'Steps', receiveTitle: 'What you receive: title', receive: 'What you receive (groups)',
    heading: 'Group heading', items: 'Items', filesTitle: 'Files: title', formats: 'File formats', filesNote: 'Files note', toolsTitle: 'Tools: title',
    tools: 'Tools', moreText: '"See more" text', lessText: '"See less" text', title1: 'Big title, line 1', title2: 'Big title, line 2',
    groups: 'Groups on the page', projects: 'All projects', accent: 'Color', pairWithNext: 'Show next to the group after it',
    logoImage: 'Logo picture', logoAlt: 'Logo description (for screen readers)', brandName: 'Text beside the logo', brandAria: 'Logo link description (for screen readers)',
    menuLinks: 'Menu links (top bar and burger menu)', label: 'Text', link: 'Link', quoteText: 'Quote button text', backHomeText: '"Back home" text',
    selectedProjectLabel: 'Text before the example project name', emailLabel: 'Contact card 1 label', behanceLabel: 'Contact card 2 label',
    linkedInLabel: 'Contact card 3 label', whatsAppLabel: 'Contact card 4 label', psPrefix: 'Text before the P.S. lines', footerBye: 'Big closing line',
    footerSitemapLabel: 'Column 1 title', footerElsewhereLabel: 'Column 2 title', footerCurrentlyLabel: 'Column 3 title',
    footerSitemapLinks: 'Column 1 links', footerElsewhereLinks: 'Column 2 links', introPrefix: 'Headline, first word', replayLabel: 'Replay button text',
    stickerLabels: 'Sticker tooltips (palette, pen, layers, ruler)',
    description1: 'Description, line 1', description2: 'Description, line 2', image: 'Picture', hint: 'Note under the services'
  };
  const LONG = new Set(['description', 'shortBio', 'text', 'dragonTooltip', 'hint', 'filesNote', 'ogImageAlt', 'heroTitle', 'introParagraphs']);
  const HTML_OK = new Set(['dragonTooltip', 'introParagraphs']);
  const PALETTE = [['#F9A323', 'Orange'], ['#D23697', 'Pink'], ['#1E7CDF', 'Blue'], ['#FA5643', 'Red']];
  const BOXES = [['box-orange.svg', 'Orange'], ['box-magenta.svg', 'Pink'], ['box-blue.svg', 'Blue'], ['box-red.svg', 'Red']];
  const ICONS = [['palette', 'Palette'], ['curve', 'Curve'], ['calendar', 'Calendar'], ['screens', 'Screens']];
  const FILES = {   // key -> [kind, folder]
    ogImage: ['image', ''], image: ['image', 'portfolio'], projectImage: ['image', 'portfolio'], heroPoster: ['image', ''],
    heroVideo: ['video', ''], heroVideoSmall: ['video', ''], cvPath: ['pdf', ''], logoImage: ['image', '']
  };
  const LINK_HELP = 'A page (my-work.html), a section (index.html#about), a web address, or a shortcut: {behance} {linkedin} {instagram} {email} {whatsapp} {cv}';
  const serviceOpts = () => data.services.map(s => [s.slug, s.menuLabel || s.slug]);
  const projectOpts = () => data.work.projects.map(p => [p.slug, p.name || p.slug]);
  const selectFor = (path, key) => {
    if (key === 'service' && path.startsWith('home.cards')) return serviceOpts();
    if (key === 'project') return projectOpts();
    if (key === 'icon' && path.includes('.scope.')) return ICONS;
    if (key === 'boxImage') return BOXES;
    if (key === 'color' || key === 'accent') return PALETTE;
    return null;
  };
  const titleOf = (o, i) => {
    if (typeof o !== 'object') return String(o);
    const t = [o.name, o.title, o.label, o.menuLabel, o.heading1 && (o.heading1 + ' ' + (o.heading2 || '')), o.text, o.heading, o.project, o.service, o.slug].find(x => x && String(x).trim());
    return `${i + 1}. ${t ? String(t).slice(0, 70) : 'New item'}`;
  };

  // ---------- generic editor ----------
  function field(label, input, help) {
    return h('div', { class: 'field' }, h('label', {}, h('span', { class: 'lbl' }, label), input), help && h('small', {}, help));
  }
  function textInput(obj, key, path) {
    const long = LONG.has(key);
    const el = h(long ? 'textarea' : 'input', { class: 'inp', dir: 'auto', rows: long ? 3 : null, type: long ? null : 'text' });
    el.value = obj[key] ?? '';
    const counter = (path === 'pages.home.title' || /^pages\.[^.]+\.(title|description)$/.test(path))
      ? h('small', { class: 'count' }) : null;
    const limit = key === 'title' ? 60 : 160;
    const upd = () => { if (counter) { counter.textContent = `${el.value.length} characters (about ${limit} show on Google)`; counter.className = 'count' + (el.value.length > limit ? ' over' : ''); } };
    el.addEventListener('input', () => { obj[key] = el.value; upd(); refreshState(); });
    upd();
    return [el, counter];
  }
  function selectInput(obj, key, opts) {
    const el = h('select', { class: 'inp' });
    if (!opts.some(o => o[0] === obj[key])) el.append(h('option', { value: obj[key] ?? '' }, obj[key] || '(choose)'));
    opts.forEach(([v, l]) => el.append(h('option', { value: v }, l)));
    el.value = obj[key] ?? '';
    el.addEventListener('change', () => { obj[key] = el.value; refreshState(); });
    return el;
  }
  function fileInput(obj, key, path) {
    const isTool = key === 'icon' && path.includes('.tools.');
    const [kind, folder] = isTool ? ['image', 'tools'] : FILES[key];
    const full = v => v ? '/' + (isTool ? 'assets/tools/' : '') + v.replace(/^\//, '') : '';
    const preview = h('div', { class: 'preview' });
    const input = h('input', { class: 'inp', type: 'text', dir: 'ltr' });
    input.value = obj[key] ?? '';
    const draw = () => {
      preview.replaceChildren();
      const v = obj[key];
      if (!v) return;
      if (kind === 'image') preview.append(h('img', { src: full(v), alt: '', onerror: e => e.target.remove() }));
      else preview.append(h('span', { class: 'chip' }, v.split('/').pop()));
    };
    input.addEventListener('input', () => { obj[key] = input.value; draw(); refreshState(); });
    const choose = h('button', { class: 'btn btn-blue small', type: 'button', onclick: () => openPicker(kind, folder, isTool, p => { obj[key] = p; input.value = p; draw(); refreshState(); }) }, 'Choose / upload');
    draw();
    return h('div', { class: 'filerow' }, preview, h('div', { class: 'filebody' }, input, choose));
  }
  function listOfStrings(arr, key, path) {
    const long = LONG.has(key);
    const box = h('div', { class: 'strlist' });
    const draw = () => {
      box.replaceChildren();
      arr.forEach((v, i) => {
        const el = h(long ? 'textarea' : 'input', { class: 'inp', dir: 'auto', rows: long ? 3 : null, type: long ? null : 'text' });
        el.value = v;
        el.addEventListener('input', () => { arr[i] = el.value; refreshState(); });
        box.append(h('div', { class: 'strrow' }, el, rowButtons(arr, i, draw)));
      });
      box.append(h('button', { class: 'btn btn-ghost small', type: 'button', onclick: () => { arr.push(''); draw(); refreshState(); box.querySelector('.strrow:last-of-type .inp')?.focus(); } }, '+ Add'));
    };
    draw();
    return box;
  }
  function rowButtons(arr, i, redraw) {
    const mv = d => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; redraw(); refreshState(); };
    return h('div', { class: 'rowbtns' },
      h('button', { class: 'icon', type: 'button', title: 'Move up', onclick: () => mv(-1) }, '↑'),
      h('button', { class: 'icon', type: 'button', title: 'Move down', onclick: () => mv(1) }, '↓'),
      h('button', { class: 'icon del', type: 'button', title: 'Delete', onclick: () => { if (confirm('Delete this?')) { arr.splice(i, 1); redraw(); refreshState(); } } }, '✕'));
  }
  const blank = o => Array.isArray(o) ? [] : (o && typeof o === 'object') ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, blank(v)])) : typeof o === 'boolean' ? false : '';

  function listOfObjects(arr, key, path, onRemove) {
    const box = h('div', { class: 'cards' });
    const draw = () => {
      box.replaceChildren();
      arr.forEach((item, i) => {
        const p = `${path}.${i}`;
        const d = h('details', { class: 'card', 'data-p': p, open: openCards.has(p) });
        d.addEventListener('toggle', () => d.open ? openCards.add(p) : openCards.delete(p));
        const del = h('button', { class: 'icon del', type: 'button', title: 'Delete', onclick: e => {
          e.preventDefault();
          if (!confirm('Delete this item?' + (onRemove ? '\n(It will also be removed wherever it is used.)' : ''))) return;
          const gone = arr.splice(i, 1)[0]; onRemove && onRemove(gone); rerender(); refreshState();
        } }, '✕');
        const mv = (e, dd) => { e.preventDefault(); const j = i + dd; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; rerender(); refreshState(); };
        d.append(h('summary', {}, h('span', { class: 'ttl' }, titleOf(item, i)),
          h('span', { class: 'rowbtns' }, h('button', { class: 'icon', type: 'button', title: 'Move up', onclick: e => mv(e, -1) }, '↑'), h('button', { class: 'icon', type: 'button', title: 'Move down', onclick: e => mv(e, 1) }, '↓'), del)));
        d.append(h('div', { class: 'body' }, objectForm(item, p)));
        box.append(d);
      });
      box.append(h('button', { class: 'btn btn-ghost small', type: 'button', onclick: () => {
        const n = arr.length ? blank(arr[0]) : {};
        if ('pairWithNext' in n) n.pairWithNext = false;
        arr.push(n); openCards.add(`${path}.${arr.length - 1}`); rerender(); refreshState();
      } }, '+ Add new'));
    };
    draw();
    return box;
  }

  function objectForm(obj, path) {
    const wrap = h('div', { class: 'form' });
    for (const key of Object.keys(obj)) {
      const v = obj[key], p = `${path}.${key}`, label = LABELS[key] || humanize(key);
      if (key === 'slug') {
        wrap.append(field(label, textInput(obj, key, p)[0], 'Used in the web address. Letters, numbers and dashes only. Change it only if you must.'));
        const inp = wrap.lastChild.querySelector('input');
        inp.addEventListener('change', () => { inp.value = obj.slug = inp.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); renameRefs(path, obj); });
      } else if (Array.isArray(v)) {
        wrap.append(h('div', { class: 'sub' }, h('h3', {}, label), typeof (v[0] ?? '') === 'string'
          ? listOfStrings(v, key, p)
          : listOfObjects(v, key, p, key === 'projects' ? projectRemoved : key === 'services' ? serviceRemoved : null),
          HTML_OK.has(key) && h('small', {}, 'You can use <strong>bold</strong> tags.')));
      } else if (v && typeof v === 'object') {
        wrap.append(h('div', { class: 'sub' }, h('h3', {}, label), objectForm(v, p)));
      } else if (typeof v === 'boolean') {
        const cb = h('input', { type: 'checkbox' }); cb.checked = v;
        cb.addEventListener('change', () => { obj[key] = cb.checked; refreshState(); });
        wrap.append(h('div', { class: 'field check' }, h('label', {}, cb, ' ', label)));
      } else if ((FILES[key] || (key === 'icon' && p.includes('.tools.')))) {
        wrap.append(field(label, fileInput(obj, key, p)));
      } else if (selectFor(p, key)) {
        wrap.append(field(label, selectInput(obj, key, selectFor(p, key))));
      } else {
        const [el, counter] = textInput(obj, key, p);
        wrap.append(field(label, [el, counter], key === 'link' ? LINK_HELP : HTML_OK.has(key) ? 'You can use <strong>bold</strong> tags.' : null));
      }
    }
    return wrap;
  }

  // keep references in sync when an address name changes or an item is deleted
  let slugBefore = new WeakMap();
  const track = () => {
    slugBefore = new WeakMap();
    [...data.work.projects, ...data.services].forEach(o => slugBefore.set(o, o.slug));
  };
  const renameRefs = (path, obj) => {
    const was = slugBefore.get(obj); if (was == null || was === obj.slug) return;
    if (path.startsWith('work.projects')) {
      data.work.groups.forEach(g => g.items.forEach(i => { if (i.project === was) i.project = obj.slug; }));
      data.home.slides.forEach(s => { if (s.project === was) s.project = obj.slug; });
    } else {
      data.home.cards.forEach(c => { if (c.service === was) c.service = obj.slug; });
    }
    slugBefore.set(obj, obj.slug);
  };
  const projectRemoved = p => {
    data.work.groups.forEach(g => g.items = g.items.filter(i => i.project !== p.slug));
    data.home.slides = data.home.slides.filter(s => s.project !== p.slug);
  };
  const serviceRemoved = s => { data.home.cards = data.home.cards.filter(c => c.service !== s.slug); };

  // ---------- tabs ----------
  const TABS = [
    ['site', 'Contact & links', 'Phone, WhatsApp, email, social links, CV, footer and contact texts.', () => [objectForm(data.site, 'site')]],
    ['pages', 'Google texts', 'The title and description Google shows for each page.', () => [objectForm(data.pages, 'pages')]],
    ['home', 'Home page', 'Hero video, intro, the 4 cards, slideshow and reviews.', () => [objectForm(data.home, 'home')]],
    ['services', 'Services & prices', 'Prices, what is included, steps, files and tools for each service.', () => [h('h2', {}, 'Page heading and note'), objectForm(data.servicesPage, 'servicesPage'), h('h2', {}, 'The services'), listOfObjects(data.services, 'services', 'services', serviceRemoved)]],
    ['menu', 'Logo, menu & footer', 'The logo and the text beside it, the menu links, the quote button, the footer and the contact card labels.', () => [objectForm(data.ui, 'ui')]],
    ['fonts', 'Fonts', 'Choose the fonts used across the whole website.', () => [fontsPanel()]],
    ['work', 'My work', 'Projects, their pictures and descriptions, and how they are grouped.', () => [objectForm(data.work, 'work')]],
  ];
  let fontCatalog = [];
  const loadedFonts = new Set();
  const loadFont = f => {
    if (!f || loadedFonts.has(f.name)) return; loadedFonts.add(f.name);
    document.head.append(h('link', { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?family=${f.query}&display=swap` }));
  };
  function fontsPanel() {
    const ROLES = [
      ['heading', 'Headings', 'Big titles such as "My Services" and the section names.', 'Logo design · Brand identity'],
      ['body', 'Body text', 'Paragraphs, menus, buttons and small labels.', 'Brand identity, logo, packaging and UI/UX design.'],
      ['accent', 'Quotes and accents', 'Review quotes and a few highlighted words.', '"Excellent attention to detail."'],
      ['arabic', 'Arabic letters', 'Used wherever Arabic text appears, in every part of the site.', 'تصميم الشعارات والهوية البصرية']];
    const box = h('div', { class: 'form' });
    ROLES.forEach(([key, title, help, sample]) => {
      const sel = h('select', { class: 'inp' });
      ['Display (headings)', 'Clean sans', 'Serif', 'Arabic'].forEach(g => {
        const og = h('optgroup', { label: g });
        fontCatalog.filter(f => f.group === g).forEach(f => og.append(h('option', { value: f.name }, f.name)));
        sel.append(og);
      });
      sel.value = data.fonts[key];
      const info = f => fontCatalog.find(x => x.name === f);
      const prev = h('p', { class: 'fontprev', dir: 'auto' }, sample);
      const draw = () => { const f = info(sel.value); loadFont(f); prev.style.fontFamily = `'${sel.value}', ${f ? f.generic : 'sans-serif'}`; };
      sel.addEventListener('change', () => { data.fonts[key] = sel.value; draw(); refreshState(); });
      draw();
      box.append(h('div', { class: 'sub' }, h('h3', {}, title), h('p', { class: 'muted' }, help), sel, prev));
    });
    box.append(h('p', { class: 'muted' }, 'Fonts load from Google Fonts. After saving, open the site and check each page.'));
    return box;
  }
  const drawTabs = () => {
    const nav = $('tabs'); nav.replaceChildren();
    TABS.forEach(([id, label]) => nav.append(h('button', { class: 'tab' + (id === active ? ' on' : ''), type: 'button', onclick: () => { active = id; localStorage.setItem('adminTab', id); rerender(); } }, label)));
  };
  function rerender() {
    const y = window.scrollY;
    drawTabs();
    const [, label, help, build] = TABS.find(t => t[0] === active);
    panel.replaceChildren(h('h1', {}, label), h('p', { class: 'muted lead' }, help), ...build());
    track();
    window.scrollTo(0, y);
  }

  // ---------- file picker ----------
  let pickCb = null, pickKind = 'image', pickFolder = '', pickTool = false;
  const kindOk = (p, kind) => {
    const e = p.slice(p.lastIndexOf('.')).toLowerCase();
    return kind === 'image' ? ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(e) : kind === 'video' ? e === '.mp4' : e === '.pdf';
  };
  async function openPicker(kind, folder, isTool, cb) {
    pickCb = cb; pickKind = kind; pickFolder = folder; pickTool = isTool;
    $('pickerTitle').textContent = { image: 'Choose a picture', video: 'Choose a video', pdf: 'Choose a PDF' }[kind];
    $('pickerUpload').accept = kind === 'image' ? 'image/*' : kind === 'video' ? 'video/mp4' : 'application/pdf';
    $('picker').hidden = false;
    const grid = $('pickerGrid'); grid.replaceChildren(h('p', { class: 'muted' }, 'Loading…'));
    const all = await (await fetch('/admin?handler=Assets')).json();
    const list = all.filter(p => kindOk(p, kind) && (isTool ? p.startsWith('assets/tools/') : !p.startsWith('assets/tools/')));
    grid.replaceChildren(...list.map(p => h('button', { class: 'thumb', type: 'button', onclick: () => pick(p) },
      kind === 'image' ? h('img', { src: '/' + p, loading: 'lazy', alt: '' }) : h('span', { class: 'big' }, kind === 'video' ? '▶' : 'PDF'), h('small', {}, p.split('/').pop()))));
  }
  const pick = p => { $('picker').hidden = true; pickCb && pickCb(pickTool ? p.replace('assets/tools/', '') : p); };
  $('pickerClose').onclick = () => $('picker').hidden = true;
  $('pickerUpload').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f); fd.append('folder', pickFolder);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin?handler=Upload'); xhr.setRequestHeader('RequestVerificationToken', token);
    xhr.upload.onprogress = ev => { stateEl.textContent = `Uploading… ${Math.round(ev.loaded / ev.total * 100)}%`; };
    xhr.onload = () => {
      e.target.value = ''; refreshState();
      let r = {}; try { r = JSON.parse(xhr.responseText); } catch { }
      if (xhr.status === 200 && r.path) { toast('Uploaded.'); pick(r.path); } else toast(r.error || 'Upload failed.', true);
    };
    xhr.onerror = () => toast('Upload failed.', true);
    xhr.send(fd);
  });

  // ---------- save, undo, history ----------
  async function save() {
    const res = await post('Save', JSON.stringify(data), { 'Content-Type': 'application/json' });
    if (res.status === 401 || res.redirected) { toast('You were logged out. Log in again, then save.', true); return false; }
    const r = await res.json();
    if (!r.ok) { toast('Not saved:\n• ' + r.errors.join('\n• '), true); return false; }
    savedJson = JSON.stringify(data); refreshState(); toast('Saved. The website is updated.'); return true;
  }
  const load = async () => { data = await (await fetch('/admin?handler=Content')).json(); savedJson = JSON.stringify(data); if (!fontCatalog.length) fontCatalog = await (await fetch('/admin?handler=Fonts')).json(); };
  async function restore(name) {
    if (isDirty() && !confirm('You have unsaved changes. They will be lost. Continue?')) return;
    data = await (await fetch('/admin?handler=Backup&name=' + encodeURIComponent(name))).json();
    if (await save()) { await load(); rerender(); toast('Brought back that version.'); }
  }
  $('saveBtn').onclick = save;
  $('undoBtn').onclick = async () => {
    const list = await (await fetch('/admin?handler=Backups')).json();
    if (!list.length) return toast('Nothing to undo yet.', true);
    $('historyList').replaceChildren(...list.map((b, i) => h('li', {}, h('span', {}, (i === 0 ? 'Last save: ' : '') + b.at), h('button', { class: 'btn btn-blue small', type: 'button', onclick: () => { $('history').hidden = true; restore(b.name); } }, 'Bring back'))));
    $('history').hidden = false;
  };
  $('historyClose').onclick = () => $('history').hidden = true;
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (isDirty()) save(); } });
  window.addEventListener('beforeunload', e => { if (data && isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  load().then(() => { if (!TABS.some(t => t[0] === active)) active = 'site'; rerender(); refreshState(); document.addEventListener('input', refreshState); });
})();
