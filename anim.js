(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header + tow-line progress with a little tow truck
  var header = document.querySelector('header');
  if (header) {
    var line = document.createElement('div');
    line.className = 'towline';
    line.setAttribute('aria-hidden', 'true');
    line.innerHTML = '<div class="towline-bar"></div>' +
      '<svg class="towline-truck" viewBox="0 0 34 18"><rect x="0" y="5" width="18" height="8" rx="1.5" fill="#FFB81C"/><path d="M18 3h7l5 5v5H18z" fill="#FFB81C"/><rect x="21" y="5" width="4" height="3" fill="#111316"/><path d="M2 5 L9 0" stroke="#FFB81C" stroke-width="1.6"/><circle cx="6" cy="14.5" r="3" fill="#111316" stroke="#FFB81C" stroke-width="1.5"/><circle cx="25" cy="14.5" r="3" fill="#111316" stroke="#FFB81C" stroke-width="1.5"/><circle cx="31" cy="7" r="1.2" fill="#FFF3C4"/></svg>';
    header.appendChild(line);
    var bar = line.firstChild, truck = line.lastChild;
    var onScroll = function () {
      var h = document.documentElement;
      var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = (p * 100) + '%';
      truck.style.left = (p * 100) + '%';
      header.classList.toggle('is-stuck', h.scrollTop > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Beacon pulse on small round status dots
  document.querySelectorAll('span[style*="border-radius: 50%"]').forEach(function (el) {
    var w = parseInt(el.style.width, 10);
    if (w && w <= 10) { el.classList.add('beacon'); el.style.color = el.style.background; }
  });

  // Hero headline line-by-line entrance
  var h1 = document.querySelector('h1');
  if (h1 && !reduce) {
    var parts = h1.innerHTML.split(/<br\s*\/?>/i);
    if (parts.length > 1) {
      h1.style.perspective = '600px';
      h1.innerHTML = parts.map(function (p, i) {
        return '<span class="hero-line" style="animation-delay:' + (120 + i * 140) + 'ms">' + p + '</span>';
      }).join('<br>');
    }
  }

  // Services strip → infinite marquee
  document.querySelectorAll('.hz + div > div').forEach(function (row) {
    if (!/Emergency towing/.test(row.textContent)) return;
    var track = document.createElement('div');
    track.className = 'marquee-track';
    var items = Array.prototype.slice.call(row.children);
    items.forEach(function (c) { track.appendChild(c); });
    var slash = document.createElement('span'); slash.style.color = '#FFB81C'; slash.textContent = '/';
    track.appendChild(slash);
    items.concat([slash]).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
    row.innerHTML = ''; row.style.display = 'block'; row.classList.add('marquee'); row.appendChild(track);
  });

  // Glow on the big CTA phone number
  document.querySelectorAll('section[style*="#FFB81C"] a[href^="tel:"]').forEach(function (a) { a.classList.add('glow'); });

  // Parallax on the hero image slot
  var heroPh = document.querySelector('section .ph');
  if (heroPh && !reduce) {
    window.addEventListener('scroll', function () {
      var y = Math.min(window.scrollY, 800);
      heroPh.style.transform = 'translateY(' + (y * 0.08) + 'px)';
    }, { passive: true });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  // Scroll reveals with stagger
  var targets = [];
  var add = function (el, d, cls) { if (!el || el.classList.contains('rv')) return; el.classList.add('rv'); if (cls) el.classList.add(cls); el.style.setProperty('--d', (d || 0) + 'ms'); targets.push(el); };
  document.querySelectorAll('h2').forEach(function (el) { add(el); });
  document.querySelectorAll('[style*="display: grid"]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { add(c, (i % 6) * 90); });
  });
  document.querySelectorAll('article').forEach(function (a) {
    var kids = a.children;
    if (kids[0]) add(kids[0], 0, 'rv-l');
    if (kids[1]) add(kids[1], 120, 'rv-r');
  });
  document.querySelectorAll('section [style*="flex-wrap: wrap"] > [style*="flex: 1 1"]').forEach(function (el, i) {
    if (el.closest('article') || el.closest('header')) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // above the fold stays put
    add(el, (i % 2) * 120);
  });
  document.querySelectorAll('details').forEach(function (d, i) { add(d, i * 70); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (t) {
    if (t.getBoundingClientRect().top < window.innerHeight * 0.9) t.classList.add('in');
    else io.observe(t);
  });
})();
