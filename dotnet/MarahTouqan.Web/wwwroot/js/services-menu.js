/* menu: the burger opens the full-screen menu on smaller screens */
(function(){
  const burger = document.getElementById('burger'), menu = document.getElementById('menuPanel');
  if (!burger || !menu) return;
  function setMenu(open, returnFocus) {
    burger.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menu.toggleAttribute('inert', !open);
    if (open) { const first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
    else if (returnFocus) burger.focus({ preventScroll: true });
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open'), false));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false, false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { e.preventDefault(); setMenu(false, true); } });
  addEventListener('resize', () => { if (innerWidth >= 1200 && menu.classList.contains('open')) setMenu(false, false); });
})();
