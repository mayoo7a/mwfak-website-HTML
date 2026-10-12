/* Custom pixel cursor + pixel trail (same as the home page; off on touch devices) */
(function () {
  var cur = document.getElementById('pixelCursor');
  if (!cur || matchMedia('(hover: none), (pointer: coarse)').matches) return;
  var last = 0;
  cur.style.left = '-100px'; cur.style.top = '-100px';
  addEventListener('pointermove', function (e) {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
    var now = performance.now();
    if (now - last >= 35) {
      last = now;
      var t = document.createElement('div');
      t.className = 'trail-pixel';
      t.style.left = (e.clientX + 18 + ((Math.random() * 10) | 0)) + 'px';
      t.style.top = (e.clientY + 22 + ((Math.random() * 10) | 0)) + 'px';
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, 600);
    }
  }, { passive: true });
  document.querySelectorAll('[data-hover], a, button').forEach(function (el) {
    el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-active'); });
    el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-active'); });
  });
})();
