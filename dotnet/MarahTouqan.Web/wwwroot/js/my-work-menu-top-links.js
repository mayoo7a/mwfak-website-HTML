/* opening Work or Services from the menu always lands at the top of that page */
(function(){
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const top = () => { if (!location.hash) window.scrollTo(0, 0); };
  top();
  addEventListener('load', top);
  addEventListener('pageshow', top);
  document.querySelectorAll('.header-nav a, .menu-panel a, .brand').forEach(a => {
    const u = new URL(a.href, location.href);
    if (u.pathname === location.pathname && !u.hash) a.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });
})();
