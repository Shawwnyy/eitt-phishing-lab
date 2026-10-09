/* Page de démonstration du logo animé : rejouer l'intro, pause, tailles. */
(function () {
  'use strict';
  var logo = document.getElementById('logo');
  var pause = document.getElementById('btn-pause');
  var sizes = ['eitt-logo--sm', 'eitt-logo--md', 'eitt-logo--lg'];

  document.getElementById('btn-replay').addEventListener('click', function () { window.EITTLogo.replay(logo); });

  pause.addEventListener('click', function () {
    var paused = pause.getAttribute('aria-pressed') !== 'true';
    pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pause.textContent = paused ? 'Reprendre' : 'Pause';
    window.EITTLogo.setPaused(logo, paused);
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-size]'), function (btn) {
    btn.addEventListener('click', function () {
      sizes.forEach(function (s) { logo.classList.remove(s); });
      logo.classList.add(btn.getAttribute('data-size'));
    });
  });
})();
