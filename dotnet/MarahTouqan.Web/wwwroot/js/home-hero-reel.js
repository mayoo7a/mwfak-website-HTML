/* Hero showreel: always plays when the site opens (muted, as browsers require for autoplay),
   and the page opens at the top so the reel is the first thing seen. No player bar: click the
   video to pause or play. When it ends a small button replays it. The header follows
   the reel's light/dark scenes, and the reel waits while it is scrolled out of view. */
(function () {
  var v = document.getElementById('heroReel');
  var wrap = document.getElementById('heroReelWrap');
  var btn = document.getElementById('heroReelBtn');
  var hero = v ? v.closest('.hero') : null;
  if (!v || !wrap || !btn || !hero) return;

  // open at the top of the page (the reel), unless the link points to a section
  if (!location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var toTop = function () { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); };
    toTop();
    addEventListener('load', toTop);
    addEventListener('pageshow', function (e) { if (e.persisted) toTop(); });   // restored from the back/forward cache
  }

  // smaller file on phones, full 1080p on bigger screens
  var small = window.matchMedia('(max-width: 900px)').matches;
  v.src = small ? v.dataset.srcSmall : v.dataset.src;

  var label = btn.querySelector('.hero-reel-btn-label');
  var icon = btn.querySelector('path');
  var ICON_PLAY = 'M8 5v14l11-7z';
  var ICON_REPLAY = 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z';

  // seconds where the reel's background is dark (navy, red, purple, magenta)
  var DARK = [[0, 2.4], [26.3, 28.1], [30.4, 46.4]];   // measured from assets/hero.mp4 (top of the frame)
  function isDark(t) { for (var i = 0; i < DARK.length; i++) { if (t >= DARK[i][0] && t < DARK[i][1]) return true; } return false; }
  // the logo (top left) follows the left side of the frame; the buttons on the right follow DARK above
  var DARK_L = [[0, 2.4], [26.2, 28.2], [33.6, 41.6], [42.4, 46.4]];   // measured the same way, top-left corner only
  function inRanges(R, t) { for (var i = 0; i < R.length; i++) { if (t >= R[i][0] && t < R[i][1]) return true; } return false; }
  function tone() {
    var t = v.ended ? (v.duration || 46.3) - 0.05 : v.currentTime;   // the last frame is dark navy, so everything stays light when the reel ends
    hero.classList.toggle('hero--dark', isDark(t));
    hero.classList.toggle('hero--dark-l', inRanges(DARK_L, t));
  }
  var raf = 0;

  // colours read off the reel's left and right edges, so the space beside the video
  // always matches the scene playing. Measured from assets/hero.mp4: if the video is
  // replaced, measure it again.
  var EDGE = [[0,"#0a152f","#0a152f"],[2.4,"#ffb554","#f7f0e1"],[2.5,"#ffac3d","#f34f4f"],[3.0,"#ffb34f","#f34d4e"],[3.1,"#f7f0e1","#f36e6b"],[3.2,"#f7f0e1","#f5eedf"],[6.5,"#f7f0e1","#8d8c91"],[6.6,"#f7f0e1","#2b2c46"],[7.2,"#f6efe1","#3d3947"],[7.3,"#f6efe1","#ac8335"],[7.4,"#f6efe1","#f6b328"],[7.9,"#f6efe1","#fe8410"],[8.0,"#f6efe1","#ff983e"],[8.1,"#d9ae76","#fefdf8"],[8.2,"#fe7508","#fefdf8"],[8.3,"#efe2d0","#fefdf8"],[8.4,"#fffdf8","#fefdf8"],[10.2,"#fefdf8","#2a2423"],[10.4,"#fefdf8","#3c3531"],[10.5,"#fefdf8","#72645c"],[11.4,"#fefdf8","#9c3d34"],[11.5,"#fefdf8","#a93c32"],[11.9,"#fefdf8","#f17b1b"],[12.6,"#fefdf8","#fbf6ec"],[12.7,"#1d171e","#fbf6ec"],[12.8,"#f17b1b","#fbf6ec"],[12.9,"#fcf7ed","#fbf6ec"],[14.8,"#c8caad","#fbf6ec"],[14.9,"#b1b291","#fbf6ec"],[17.8,"#fbf6ed","#fff3e0"],[18.0,"#fff3e0","#fff3e0"],[19.4,"#fff3e0","#1a5a1b"],[21.4,"#ffe9ca","#1a5a1b"],[21.5,"#ffb44f","#235a1e"],[21.6,"#ffac3d","#e63f3e"],[21.8,"#ffac3d","#f3494b"],[22.1,"#feb658","#f24e4e"],[22.2,"#f4ece4","#f27472"],[22.3,"#f4ece4","#f4ece4"],[25.4,"#d48133","#f4ece4"],[25.7,"#df8c42","#f4ece4"],[26.1,"#b7763a","#f4ece4"],[26.2,"#1b272c","#f4ece4"],[28.2,"#d0cdc6","#fff4e3"],[28.3,"#fcf1e2","#fff4e3"],[30.1,"#f5ebdc","#f0e6d8"],[30.2,"#f5eadd","#072e2d"],[33.5,"#f2e9db","#aeacbb"],[33.6,"#093937","#747a9e"],[33.7,"#082f2e","#a5a4b6"],[33.8,"#1a1f49","#5f617e"],[33.9,"#0a0f3a","#1e254e"],[34.0,"#0c113c","#0a0f3a"],[38.7,"#0c113d","#21245c"],[38.9,"#0d1343","#101547"],[41.4,"#0d1344","#5b2345"],[41.5,"#0d1344","#f03f40"],[41.6,"#c58335","#e53c3f"],[41.7,"#f09c32","#e43c3f"],[42.1,"#f7a130","#96333e"],[42.2,"#e99a33","#3f4454"],[42.3,"#575c62","#373b4a"],[42.4,"#4a5261","#3b3e4d"],[42.9,"#454f5e","#484956"],[43.1,"#37414f","#464855"],[43.5,"#444753","#454753"],[43.8,"#373845","#3a3d49"],[44.0,"#2b2a39","#363a47"],[45.6,"#2c2e45","#282e45"]];
  var sideL = wrap.querySelector('.hero-reel-side--l');
  var sideR = wrap.querySelector('.hero-reel-side--r');
  var ei = -1;
  function edges() {
    var t = v.currentTime, i = ei < 0 || t < EDGE[ei][0] ? 0 : ei;
    while (i + 1 < EDGE.length && EDGE[i + 1][0] <= t) i++;
    if (i === ei) return;
    ei = i;
    sideL.style.backgroundColor = EDGE[i][1];
    sideR.style.backgroundColor = EDGE[i][2];
  }
  edges();

  function loop() { tone(); edges(); raf = v.paused ? 0 : requestAnimationFrame(loop); }

  // button states: 'pause' (resume), 'ended' (replay), 'idle' (not started yet)
  var state = null;
  function show(next) {
    state = next;
    if (!next) { wrap.classList.remove('show-btn'); return; }
    icon.setAttribute('d', next === 'ended' ? ICON_REPLAY : ICON_PLAY);
    label.textContent = next === 'ended' ? 'Replay' : 'Play';
    btn.setAttribute('aria-label', next === 'ended' ? 'Replay the showreel' : 'Play the showreel');
    wrap.classList.add('show-btn');
  }
  // the reel has no audio track, so it always plays muted
  function play() {
    var p = v.play();
    if (p && p.catch) p.catch(function (err) {
      if (err && err.name === 'AbortError') return;   // interrupted by a pause, not blocked
      if (!v.muted) { v.muted = true; var q = v.play(); if (q && q.catch) q.catch(blocked); }
      else { blocked(); }
    });
  }
  // the browser refused to autoplay: start on the visitor's first click, tap or key press
  function blocked() {
    if (!v.paused) return;   // it is playing after all
    show('idle');
    function kick(e) {
      document.removeEventListener('pointerdown', kick, true);
      document.removeEventListener('keydown', kick, true);
      if (state !== 'idle') return;
      if (e && e.target && wrap.contains(e.target)) return;   // the reel's own click handles it
      play(false);
    }
    document.addEventListener('pointerdown', kick, true);
    document.addEventListener('keydown', kick, true);
  }
  function fromStart() { v.currentTime = 0; play(true); }

  var userPaused = false, pausedByScroll = false, inView = true;
  function toggle() {
    if (v.ended || state === 'ended' || state === 'idle') { fromStart(); return; }
    if (v.paused) { userPaused = false; play(false); }
    else { userPaused = true; v.pause(); }
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  v.addEventListener('click', toggle);
  v.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
  });
  v.addEventListener('play', function () {
    if (!inView) { pausedByScroll = true; v.pause(); return; }   // wait until the reel is on screen
    show(null);
    if (!raf) raf = requestAnimationFrame(loop);
  });
  v.addEventListener('pause', function () { if (!v.ended && userPaused) show('pause'); });
  v.addEventListener('ended', function () { userPaused = false; show('ended'); });
  ['pause', 'seeked', 'ended', 'loadeddata', 'timeupdate'].forEach(function (ev) { v.addEventListener(ev, tone); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        inView = e.isIntersecting;
        if (!inView && !v.paused && !v.ended) { pausedByScroll = true; v.pause(); }
        else if (inView && pausedByScroll) { pausedByScroll = false; play(false); }
      });
    }, { threshold: 0.35 }).observe(v);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && state === 'idle') play(false);
  });

  tone();
  play(false);
})();
