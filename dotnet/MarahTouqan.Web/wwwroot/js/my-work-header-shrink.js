/* top bar: shrinks a little once the page is scrolled */
(function(){
  const h = document.querySelector('.header'); if (!h) return;
  const on = () => h.classList.toggle('header--stuck', (window.scrollY || document.documentElement.scrollTop) > 40);
  addEventListener('scroll', on, { passive: true }); on();
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
