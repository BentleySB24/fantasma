/* FANTASMA site. Two small jobs: play the trailer in place, and fade sections in on scroll.
   Everything on the page reads and works without this file. */
(function () {
  'use strict';

  // Trailer: the link becomes a player inside the hero. The video file is not requested until the tap.
  var media = document.getElementById('hero-media');
  var link = document.getElementById('play-trailer');
  if (media && link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var v = media.querySelector('video');
      if (!v) {
        v = document.createElement('video');
        v.controls = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.poster = 'assets/img/trailer-poster.jpg';
        v.setAttribute('aria-label', 'FANTASMA trailer, 75 seconds');
        var s = document.createElement('source');
        s.src = link.getAttribute('href');
        s.type = 'video/mp4';
        v.appendChild(s);
        v.addEventListener('ended', function () { media.classList.remove('playing'); v.hidden = true; link.focus(); });
        media.appendChild(v);
      }
      v.hidden = false;
      media.classList.add('playing');
      var p = v.play();
      if (p && p.catch) { p.catch(function () { /* the controls are on screen; the visitor can press play */ }); }
      v.focus();
    });
  }

  // Rise on scroll. Without IntersectionObserver, or when motion is not welcome, everything is simply shown.
  var items = document.querySelectorAll('.reveal');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) { items[i].classList.add('in'); }
    return;
  }
  document.documentElement.classList.add('js');      // only now may the stylesheet hide anything
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  for (var j = 0; j < items.length; j++) { io.observe(items[j]); }
})();
