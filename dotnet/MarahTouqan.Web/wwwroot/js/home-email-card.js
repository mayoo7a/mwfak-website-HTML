/* Email card: opens the visitor's mail app (mailto). If nothing opens (no mail app set up, or the browser blocks it),
   a Gmail compose window opens instead, addressed to the same email. */
(function () {
  var a = document.querySelector('.contact-card[data-card="email"]');
  if (!a) return;
  var TO = 'marah.touqan@gmail.com', SUBJECT = 'Project enquiry';
  a.setAttribute('href', 'mailto:' + TO + '?subject=' + encodeURIComponent(SUBJECT));
  a.addEventListener('click', function () {
    var left = false;
    function gone() { left = true; }
    addEventListener('blur', gone, { once: true });
    document.addEventListener('visibilitychange', gone, { once: true });
    setTimeout(function () {
      removeEventListener('blur', gone);
      if (left) return;   // a mail app took over
      window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) + '&su=' + encodeURIComponent(SUBJECT), '_blank', 'noopener');
    }, 900);
  });
})();

/* top bar: stays at the top once the page is scrolled (wide screens; the CSS only styles it there) */
(function stickyHeader(){
  const h = document.querySelector('.hero .header');
  if (!h) return;
  const on = () => h.classList.toggle('header--stuck', (window.scrollY || document.documentElement.scrollTop) > 60);
  addEventListener('scroll', on, { passive: true });
  addEventListener('resize', on);
  on();
})();
