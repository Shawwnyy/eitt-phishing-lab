/* EITT — logo animé : injecte le SVG dans chaque élément [data-eitt-logo].
   API : EITTLogo.mount(el, {intro}), EITTLogo.replay(el), EITTLogo.setPaused(el, bool).
   Le balisage est une constante : aucune donnée externe n'est injectée. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  var LABEL = 'EITT — Enseignement Informatique pour Toutes et Tous';

  function hatchLines() {
    var s = '';
    for (var x = -24; x <= 124; x += 4) {
      s += '<line x1="' + x + '" y1="-30" x2="' + x + '" y2="130" />';
    }
    return s;
  }

  function ticks() {
    var s = '';
    for (var i = 0; i < 8; i++) {
      var x = 244 + i * 5.6;
      s += '<path class="eitt-tick" d="M' + x.toFixed(1) + ' 70.5v' + (i % 2 ? 3.5 : 5) + '" />';
    }
    return s;
  }

  function template(id) {
    return '' +
      '<svg xmlns="' + NS + '" viewBox="0 0 295 100" role="img" aria-labelledby="' + id + '-t" shape-rendering="geometricPrecision">' +
      '<title id="' + id + '-t">' + LABEL + '</title>' +
      '<defs><clipPath id="' + id + '-band"><path clip-rule="evenodd" d="M15 50a34 34 0 1 0 68 0a34 34 0 1 0-68 0ZM24 50a25 25 0 1 0 50 0a25 25 0 1 0-50 0Z"/></clipPath></defs>' +
      /* Emblème */
      '<g class="eitt-spin eitt-dots c-fill"><circle cx="49" cy="3" r="2.5"/><circle cx="96" cy="50" r="2.5"/><circle cx="49" cy="97" r="2.5"/><circle cx="2" cy="50" r="2.5"/></g>' +
      '<g class="eitt-spin eitt-ring-a"><circle class="c-stroke" cx="49" cy="50" r="40.5" stroke-width="2.5" stroke-dasharray="58 4 62 3 52 5 62 8.5"/></g>' +
      '<g class="eitt-spin eitt-ring-b"><circle class="c-stroke" cx="49" cy="50" r="39.5" stroke-width="5.5" stroke-dasharray="20 70 16 60 22 66.5"/></g>' +
      '<g clip-path="url(#' + id + '-band)"><g class="eitt-spin eitt-hatch c-stroke" stroke-width="1.2">' + hatchLines() + '</g></g>' +
      '<circle class="c-stroke" cx="49" cy="50" r="22.3" stroke-width="4.5"/>' +
      /* Cartouche : ligne haute */
      '<path class="l-stroke" d="M95 26L110 11.5H268"/>' +
      '<circle class="c-fill" cx="95" cy="26" r="2.5"/>' +
      '<rect class="c-fill" x="268" y="9" width="26" height="5"/>' +
      '<path d="M113 14.5H152" stroke="var(--eitt-dim)" stroke-width="1.5" fill="none"/>' +
      '<path class="c-stroke" d="M139 14.5H152" stroke-width="2"/>' +
      /* Texte EITT (chemins : aucune police externe) */
      '<g class="t-fill">' +
      '<path class="eitt-letter eitt-letter-0" d="M156 32H174V36H160.2V39.7H171.5V43.3H160.2V47H174V51H156Z"/>' +
      '<path class="eitt-letter eitt-letter-1" d="M178 32H191V36H186.7V47H191V51H178V47H182.3V36H178Z"/>' +
      '<path class="eitt-letter eitt-letter-2" d="M196 32H215V36H207.6V51H203.4V36H196Z"/>' +
      '<path class="eitt-letter eitt-letter-3" d="M218 32H237V36H229.6V51H225.4V36H218Z"/>' +
      '</g>' +
      /* Ligne basse, barres obliques et graduations */
      '<path class="l-stroke" d="M100 67H233L242 76H288"/>' +
      '<circle class="c-fill" cx="290" cy="76" r="2.5"/>' +
      '<g transform="translate(107 69)"><path class="c-fill eitt-bar eitt-bar-1" d="M0 0H14L21 7H7Z"/></g>' +
      '<g transform="translate(125.5 69)"><path class="c-fill eitt-bar eitt-bar-2" d="M0 0H14L21 7H7Z"/></g>' +
      '<g transform="translate(144 69)"><path class="c-fill eitt-bar eitt-bar-3" d="M0 0H14L21 7H7Z"/></g>' +
      '<g fill="none">' + ticks() + '</g>' +
      '</svg>';
  }

  function mount(el, opts) {
    opts = opts || {};
    if (!el || el.getAttribute('data-eitt-mounted')) return el;
    uid += 1;
    var id = 'eitt-logo-' + uid;
    var doc = new DOMParser().parseFromString(template(id), 'image/svg+xml');
    el.classList.add('eitt-logo');
    el.appendChild(document.importNode(doc.documentElement, true));
    el.setAttribute('data-eitt-mounted', '1');
    var intro = opts.intro !== undefined ? opts.intro : el.getAttribute('data-intro') !== 'false';
    if (intro) el.classList.add('is-intro');
    return el;
  }

  function replay(el) {
    if (!el) return;
    el.classList.remove('is-intro');
    void el.getBoundingClientRect(); // force le recalcul pour relancer les animations
    el.classList.add('is-intro');
  }

  function setPaused(el, paused) {
    if (el) el.classList.toggle('is-paused', !!paused);
  }

  function autoMount() {
    var list = document.querySelectorAll('[data-eitt-logo]');
    for (var i = 0; i < list.length; i++) mount(list[i]);
  }

  window.EITTLogo = { mount: mount, replay: replay, setPaused: setPaused, autoMount: autoMount };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})();
