/* keep each project block (image + caption + price) vertically centred on the screen while it is pinned */
(function(){
  const figs = document.querySelectorAll('.svc-proj');
  if (!figs.length) return;
  const set = () => {
    const barH = (document.querySelector('.header') || { offsetHeight: 80 }).offsetHeight;
    figs.forEach(f => {
      const h = f.getBoundingClientRect().height;
      f.style.setProperty('--proj-top', Math.max(barH + 16, Math.round((innerHeight - h) / 2)) + 'px');
    });
  };
  set();
  addEventListener('resize', set);
  addEventListener('load', set);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
  figs.forEach(f => f.querySelectorAll('img').forEach(i => { if (!i.complete) i.addEventListener('load', set); }));
})();

document.querySelectorAll('.svc-fade-btn').forEach(b => b.addEventListener('click', () => {
  const f = b.closest('.svc-fade'); const o = f.classList.toggle('is-open'); b.setAttribute('aria-expanded', o);
  document.querySelectorAll('.svc-proj').forEach(() => {}); window.dispatchEvent(new Event('resize'));
}));

(function () {
  const arts = [...document.querySelectorAll('.svc')];
  function place() {
    arts.forEach(art => {
      const cta = art.querySelector('.svc-cta--proj'), price = art.querySelector('.svc-price'); if (!cta || !price) return;
      cta.style.marginTop = '';
      if (matchMedia('(max-width: 480px)').matches || !art.offsetParent) return;
      cta.style.marginTop = '0px';
      const p = price.getBoundingClientRect(), c = cta.getBoundingClientRect();
      cta.style.marginTop = Math.max(0, Math.round((p.top + p.height / 2) - (c.top + c.height / 2))) + 'px';
    });
  }
  place(); addEventListener('resize', place); addEventListener('load', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();

/* back-to-top button */
(function () {
  var btn = document.createElement('button');
  btn.className = 'back-to-top'; btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19 V5 M5 12 L12 5 L19 12"/></svg>';
  document.body.appendChild(btn);
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  function bgUnder() {
    var x = innerWidth - 50, y = innerHeight - 50, els = document.elementsFromPoint(x, y);
    for (var i = 0; i < els.length; i++) {
      if (els[i] === btn) continue;
      var c = getComputedStyle(els[i]).backgroundColor.match(/[\d.]+/g);
      if (c && (c.length < 4 || parseFloat(c[3]) > 0.5)) return c.map(Number);
    }
    return [14, 28, 65];
  }
  function toggle() {
    btn.classList.toggle('is-visible', scrollY > 200);
    var c = bgUnder(); var lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    btn.classList.toggle('is-on-light', lum > 0.6);
  }
  toggle(); addEventListener('scroll', toggle, { passive: true }); addEventListener('resize', toggle);
})();
