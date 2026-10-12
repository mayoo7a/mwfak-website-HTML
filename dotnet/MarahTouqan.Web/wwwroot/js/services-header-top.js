/* top bar: dark blue at the top, cream after a little scrolling */
(function(){
  const h = document.querySelector('.header'); if (!h) return;
  const on = () => h.classList.toggle('header--stuck', (window.scrollY || document.documentElement.scrollTop) > 40);
  addEventListener('scroll', on, { passive: true }); on();
})();
