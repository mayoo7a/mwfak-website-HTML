(function(){
  const links = [...document.querySelectorAll('.menu-item')];
  const panels = links.map(l => document.getElementById(l.dataset.slug));
  function mark(slug){
    links.forEach(l => l.setAttribute('aria-current', l.dataset.slug === slug ? 'true' : 'false'));
  }
  mark(links[0].dataset.slug);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    panels.forEach(p => p && io.observe(p));
  }
  links.forEach(l => l.addEventListener('click', () => mark(l.dataset.slug)));
  /* a click brings the section's top line right under the header */
  const hdr = document.querySelector('.header');
  const setH = () => document.documentElement.style.setProperty('--hdr', (hdr ? Math.round(hdr.getBoundingClientRect().height) : 72) + 'px');
  setH(); addEventListener('resize', setH);
  links.forEach(l => l.addEventListener('click', e => {
    const a = document.getElementById(l.dataset.slug); if (!a) return;
    e.preventDefault(); history.replaceState(null, '', '#' + l.dataset.slug);
    const go = () => scrollTo({ top: a.getBoundingClientRect().top + scrollY - (hdr ? hdr.getBoundingClientRect().height : 72), behavior: 'smooth' });
    go(); setTimeout(go, 700); setTimeout(go, 1500);
  }));
})();
