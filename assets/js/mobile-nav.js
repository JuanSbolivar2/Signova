document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.navbar').forEach(function (navbar) {
    var links = navbar.querySelector('.nav-links');
    if (!links) return;

    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>';
    navbar.appendChild(toggle);

    toggle.addEventListener('click', function () {
      links.classList.toggle('nav-open');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('nav-open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        links.classList.remove('nav-open');
      }
    });
  });
});