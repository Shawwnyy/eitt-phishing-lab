/* EITT Phishing Lab — application (JavaScript vanilla).
   Tout le contenu dynamique est inséré avec textContent / createElement : aucun innerHTML sur des données.
   Aucune donnée personnelle n'est collectée ni stockée (pas de cookie, pas de localStorage). */
(function () {
  'use strict';

  /* ======================================================================
     Utilitaires
     ====================================================================== */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCompactScreen = function () { return window.matchMedia('(max-width: 899px)').matches; };

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    start: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    min: '<path d="M6 18h12"/>',
    max: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    reply: '<path d="M10 8L4 13l6 5v-3c5 0 8 1 10 4 0-6-3-10-10-10z"/>',
    clip: '<path d="M20 11l-8 8a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    restart: '<path d="M12 3v8M6.5 6.5a8 8 0 1 0 11 0"/>',
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    'chevron-left': '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    inbox: '<path d="M4 13l3-8h10l3 8v6H4z"/><path d="M4 13h5l1 3h4l1-3h5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    note: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M12 19V6M6 11l6-6 6 6"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    edit: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    cut: '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8 16l10-12M16 16L6 4"/>',
    paste: '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M9 12h6M9 16h4"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5v.5"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h1M15 11h1M8 15h2M12 15h1M15 15h1"/>'
  };
  function ic(name) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'ic' + (name === 'start' ? ' ic--fill' : ''));
    svg.innerHTML = ICONS[name] || ''; // constantes internes uniquement
    return svg;
  }
  function hydrateIcons(root) {
    $$('[data-icon]', root).forEach(function (el) {
      if (el.getAttribute('data-hydrated')) return;
      el.appendChild(ic(el.getAttribute('data-icon')));
      el.setAttribute('data-hydrated', '1');
    });
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtMMSS(sec) { sec = Math.max(0, sec); return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60); }
  function fmtDur(ms) {
    var s = Math.max(1, Math.round(ms / 1000));
    if (s < 60) return s + ' s';
    return Math.floor(s / 60) + ' min ' + pad2(s % 60) + ' s';
  }
  function hostOf(url) { try { return new URL(url).hostname; } catch (e) { return String(url); } }
  function domainOfAddress(addr) { var i = String(addr).indexOf('@'); return i >= 0 ? addr.slice(i + 1) : addr; }
  function initials(name) {
    var parts = String(name).replace(/[—·\-()]/g, ' ').split(/\s+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }
  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }

  /* ======================================================================
     Contenu pédagogique
     ====================================================================== */
  var CATS = [
    { key: 'sender', label: 'Expéditeur', ask: "Qui écrit ? L'adresse complète correspond-elle au service ou à la personne que vous connaissez ?" },
    { key: 'context', label: 'Contexte', ask: 'Attendiez-vous ce message ? Comparez avec vos Documents (agenda, inscriptions, notes).' },
    { key: 'urgency', label: 'Urgence', ask: "Le message vous presse-t-il d'agir vite ? Le délai est-il justifié, ou s'agit-il d'une pression ?" },
    { key: 'request', label: 'Demandes', ask: "Que vous demande-t-on : une information, un clic, un paiement, un document, un mot de passe ?" },
    { key: 'links', label: 'Liens', ask: 'Où mènent vraiment les liens et les pièces jointes ? Survolez-les sans cliquer.' },
    { key: 'coherence', label: 'Cohérence', ask: 'Les détails (nom, dates, numéros) sont-ils exacts et cohérents avec ce que vous savez ?' }
  ];
  var ADVICE = {
    sender: "Lisez l'adresse complète de l'expéditeur (pas seulement son nom affiché) et comparez-la au domaine habituel. Consultez aussi l'adresse « Répondre à » dans les détails.",
    context: "Demandez-vous « Est-ce que j'attendais ce message ? » et comparez avec vos notes, votre agenda ou vos démarches en cours.",
    urgency: "Une urgence est une raison de vérifier, jamais de cliquer. Prenez le temps de contrôler par un autre canal.",
    request: "Méfiez-vous de toute demande de mot de passe, de paiement ou de document sensible par e-mail, même bien présentée.",
    links: "Survolez les liens pour voir leur vraie destination, ouvrez les services par leur adresse habituelle et ne lancez jamais une pièce jointe inattendue.",
    coherence: "Cherchez les détails exacts (nom, numéro, date) qui prouvent que le message vous concerne vraiment."
  };
  var FLAG_LABEL = { alert: 'À surveiller', ok: 'Cohérent', neutral: 'À nuancer' };

  var PRACTICES = [
    ["Vérifier le contexte d'une demande", "Attendiez-vous ce message ? Correspond-il à une démarche que vous avez réellement faite ?"],
    ["Examiner soigneusement l'expéditeur", "Lisez l'adresse complète, pas seulement le nom affiché, et consultez l'adresse « Répondre à »."],
    ["Éviter de suivre un lien simplement parce qu'un message semble urgent", "L'urgence est une raison de vérifier, pas de cliquer."],
    ["Accéder à un service par son application ou son adresse habituelle plutôt que par un lien inattendu", "Tapez vous-même l'adresse ou utilisez votre application ou vos favoris."],
    ["Ne jamais transmettre son mot de passe par e-mail", "Aucun service sérieux ne le demande par message."],
    ["Contacter l'organisme concerné par un canal indépendant en cas de doute", "Utilisez un numéro ou une adresse que vous avez trouvés vous-même, pas ceux du message."],
    ["Signaler les messages suspects selon les procédures de son organisation", "Un signalement protège aussi vos collègues et vos proches."]
  ];

  var DOCS = [
    { name: 'Mes inscriptions.txt', text: "MES INSCRIPTIONS (EITT)\n\n• Atelier « Premiers pas avec la messagerie » — mercredi 14 octobre, 14 h, salle Ada Lovelace (Valmont)\n• Lettre d'information d'EITT — abonné(e) depuis septembre\n\nNote : je participe aux ateliers en tant que public. Je ne suis pas bénévole de l'association.\nAucune autre inscription en cours." },
    { name: 'Agenda octobre.txt', text: "AGENDA — OCTOBRE\n\n• Mer. 14 oct., 14 h : atelier EITT (salle Ada Lovelace)\n• Jeu. 15 oct., 14 h 30 : contrôle chez le Dr Lambert (cabinet de Valmont, place du Marché)\n• Sam. 24 oct. : marché de Valmont\n\nRappel : le cabinet m'envoie ses rappels depuis son adresse habituelle, et je les confirme toujours par téléphone." },
    { name: 'Colis attendus.txt', text: "COLIS ATTENDUS\n\nAucun colis attendu cette semaine.\nDernière commande : un livre d'initiation à l'informatique, reçu le 28 septembre.\n\nÀ retenir : si un transporteur me contacte pour un colis que je n'attends pas, je ne clique pas. Je vérifie sur le site que je connais." },
    { name: 'Dossier mairie.txt', text: "DOSSIER MAIRIE DE VALMONT\n\nDépôt du dossier de renouvellement de mon titre d'identité en mairie le 2 octobre.\nRécépissé n° VAL-2026-3391.\nOn m'a dit : le titre sera à retirer à l'accueil de la mairie, rien à payer en ligne." },
    { name: 'Sécurité du compte.txt', text: "SÉCURITÉ DU COMPTE\n\nMercredi soir, à 18 h 12 : j'ai changé le mot de passe de ma messagerie depuis mon ordinateur, à la maison.\n\nMes règles : je ne donne jamais mon mot de passe par e-mail, et j'ouvre ma messagerie par mon application ou mon adresse habituelle." },
    { name: 'Banque.txt', text: "MA BANQUE\n\nMon compte est à la Banque du Val (banqueduval.example). Ma carte fonctionne normalement, aucun incident.\nMes relevés sont dans mon espace client, que j'ouvre depuis l'application ou en tapant moi-même l'adresse.\n\nÀ retenir : ma banque ne me demande jamais mon code, ni mon numéro de carte, ni un code reçu par SMS, que ce soit par e-mail, par SMS ou par téléphone." },
    { name: 'Abonnements maison.txt', text: "ABONNEMENTS MAISON\n\n• Internet : Fibrabox, 29,99 € par mois, prélevé le 5 du mois. Les factures sont dans mon espace client (fibrabox.example).\n• Aucun antivirus payant, aucun abonnement logiciel : je n'ai rien souscrit.\n• Pas d'abonnement de streaming.\n\nÀ retenir : un « renouvellement » que je ne connais pas se vérifie sur mon relevé, jamais en appelant le numéro du message." },
    { name: 'Famille et amis.txt', text: "FAMILLE ET AMIS\n\n• Julien Marchand (ami) : julien.marchand@courriel-perso.example. Il habite à Lyon ; nous nous parlons souvent.\n• Nadia (voisine).\n• Dimanche dernier : randonnée avec Julien et Nadia au Mont Verrier, sous la pluie.\n\nÀ retenir : si un ami me demande de l'argent par e-mail, je l'appelle d'abord avec le numéro que j'ai déjà." },
    { name: 'Médiathèque et club de lecture.txt', text: "MÉDIATHÈQUE ET CLUB DE LECTURE\n\n• Livre réservé à la médiathèque de Valmont le 3 octobre : « Les oiseaux du Jura ».\n• Club de lecture de Valmont, animé par Hélène Vidal (helene.vidal@club-lecture-valmont.example). Prochaine réunion : jeudi 15 octobre à 18 h, salle des Lilas.\n• Je n'attends aucun document partagé." },
    { name: 'Démarches administratives.txt', text: "DÉMARCHES ADMINISTRATIVES\n\nDéclaration de revenus envoyée en mai. Aucun remboursement annoncé à ce jour.\n\nÀ retenir : une administration ne me demande jamais de numéro de carte bancaire par e-mail, et ne réclame rien sous 48 heures." },
    { name: 'Fournisseurs.txt', text: "FOURNISSEURS ET FACTURES\n\nJe n'ai aucun fournisseur ni prestataire qui me facture en ce moment. Aucun devis en cours, aucune facture en attente.\n\nÀ retenir : une facture inattendue se vérifie en appelant l'entreprise avec un numéro que je trouve moi-même." }
  ];

  var APPS = {
    mail: { title: 'Courrier', icon: 'mail', size: [1040, 660], build: buildMail },
    browser: { title: 'Navigateur', icon: 'globe', size: [820, 560], build: buildBrowser },
    docs: { title: 'Documents', icon: 'folder', size: [860, 540], build: buildDocs },
    notepad: { title: 'Bloc-notes', icon: 'note', size: [720, 520], build: buildNotepad },
    calc: { title: 'Calculatrice', icon: 'calc', size: [340, 500], build: buildCalc },
    security: { title: 'Centre de sécurité EITT', icon: 'shield', size: [720, 600], build: buildSecurity }
  };
  var APP_ORDER = ['mail', 'browser', 'docs', 'notepad', 'calc', 'security'];
  var TILE_CLASS = { mail: 'mail', browser: 'browser', docs: 'docs', notepad: 'notepad', calc: 'calc', security: 'security' };

  /* ======================================================================
     État
     ====================================================================== */
  var USER_ADDRESS = 'utilisateur@eitt-demo.example';
  var TIMER_START = 900; // chronomètre facultatif : 15 minutes, désactivé par défaut (aucune limite de temps)

  var state;
  function freshState() {
    return {
      decisions: new Map(),      // id -> { verdict, correct, via, ms, clickedLink, clickedAttach }
      trash: new Set(),
      openedAt: new Map(),
      clickedLink: new Set(),
      clickedAttach: new Set(),
      selectedId: null,
      sent: [],                  // messages « envoyés » (simulation, jamais transmis)
      drafts: [],
      mailItem: null,
      folder: 'inbox',
      detailsOpen: false,
      hintsOpen: false,
      notice: '',
      timer: { on: false, remaining: TIMER_START, expired: false },
      statsSent: false
    };
  }
  state = freshState();

  var data = { bank: [], scenarios: [], byId: new Map(), meta: {}, loaded: false, promise: null };
  var current = 'home';
  var tickHandle = null;
  var mailUI = null;
  var browserUI = null;
  var replyForId = null;

  /* ======================================================================
     Chargement des scénarios (PHP/MySQL → JSON → copie JS embarquée)
     ====================================================================== */
  function fetchJson(url) {
    return fetch(url, { cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'application/json' } }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var ct = r.headers.get('content-type') || '';
      if (ct.indexOf('json') === -1) throw new Error('Réponse non JSON');
      return r.json();
    });
  }
  function validScenario(s) {
    return s && typeof s.id === 'string' && typeof s.subject === 'string' && s.sender && typeof s.sender.address === 'string' &&
      Array.isArray(s.body) && s.analysis && typeof s.isPhishing === 'boolean';
  }
  function normalize(payload) {
    var list = Array.isArray(payload) ? payload : (payload && payload.scenarios) || [];
    var clean = list.filter(validScenario).map(function (s) {
      s.attachments = Array.isArray(s.attachments) ? s.attachments : [];
      s.tips = Array.isArray(s.tips) ? s.tips : [];
      s.consequences = s.consequences || {};
      s.replyTo = s.replyTo || null;
      return s;
    });
    return { list: clean, meta: (payload && payload.meta) || {} };
  }
  function loadScenarios() {
    var embedded = function () { return Promise.resolve(window.EITT_SCENARIOS); };
    // Ouverture directe du fichier (file://) : les requêtes sont inutiles, on lit la copie embarquée.
    var attempts = location.protocol === 'file:' ? [embedded] : [
      function () { return fetchJson('php/scenarios.php'); },
      function () { return fetchJson('data/scenarios.json'); },
      embedded
    ];
    var i = 0;
    function next() {
      if (i >= attempts.length) return Promise.resolve(false);
      var attempt = attempts[i++];
      return Promise.resolve().then(attempt).then(function (payload) {
        var n = normalize(payload);
        if (!n.list.length) throw new Error('Aucun scénario valide');
        data.bank = n.list;
        data.scenarios = n.list.slice();
        data.meta = n.meta;
        data.byId = new Map(n.list.map(function (s) { return [s.id, s]; }));
        data.loaded = true;
        return true;
      }).catch(function () { return next(); });
    }
    return next();
  }

  /* ======================================================================
     Choix du nombre de messages (tirage équilibré dans la banque de scénarios)
     ====================================================================== */
  var settings = { count: 10 };
  var COUNT_CHOICES = [5, 8, 10, 15, 20];
  var COUNT_NAMES = { 5: 'Découverte', 8: 'Rapide', 10: 'Entraînement', 15: 'Approfondi', 20: 'Complet' };
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function dayOf(t) {
    t = String(t || '');
    if (/aujourd/i.test(t)) return 0;
    if (/hier/i.test(t)) return 1;
    var m = t.match(/(\d{1,2})\s*oct/i);
    return m ? Math.max(2, 9 - parseInt(m[1], 10)) : 9;
  }
  function minutesOf(t) { var m = String(t || '').match(/(\d{1,2}):(\d{2})/); return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 0; }
  function timeRank(s) { return dayOf(s.time) * 1440 + (1440 - minutesOf(s.time)); }
  function pickScenarios(bank, n) {
    var k = Math.max(1, Math.min(n, bank.length));
    var P = shuffle(bank.filter(function (s) { return s.isPhishing; })), L = shuffle(bank.filter(function (s) { return !s.isPhishing; }));
    var nP = Math.floor(k / 2) + (k % 2 && Math.random() < 0.5 ? 1 : 0);
    var nL = Math.min(k - nP, L.length);
    nP = Math.min(P.length, k - nL);
    return P.slice(0, nP).concat(L.slice(0, nL)).map(function (s) { return { s: s, i: bank.indexOf(s) }; })
      .sort(function (a, b) { return (timeRank(a.s) - timeRank(b.s)) || (a.i - b.i); })
      .map(function (x) { return x.s; });
  }
  // Série imposée par le lien (mode formateur) : index.html?ids=s01,s05,s12
  function forcedList() {
    try {
      var raw = new URLSearchParams(location.search).get('ids');
      if (!raw) return [];
      var ids = raw.split(',').map(function (x) { return x.trim(); });
      return data.bank.filter(function (sc) { return ids.indexOf(sc.id) !== -1; });
    } catch (e) { return []; }
  }
  function applySelection(n) {
    var forced = forcedList();
    var list = forced.length ? forced.slice().sort(function (a, b) { return (timeRank(a) - timeRank(b)) || (data.bank.indexOf(a) - data.bank.indexOf(b)); }) : pickScenarios(data.bank, n);
    data.scenarios = list;
    data.byId = new Map(list.map(function (s) { return [s.id, s]; }));
  }
  function readCount() {
    var forced = forcedList();
    if (forced.length) return forced.length;
    var r = $('input[name="count"]:checked');
    var v = r ? parseInt(r.value, 10) : settings.count;
    return v > 0 ? v : settings.count;
  }
  function updateCountHint() {
    var n = Math.min(readCount(), data.bank.length), need = passMark(n);
    $('#count-hint').textContent = 'Environ la moitié des messages sont des tentatives de phishing. Pour obtenir l’attestation de réussite, il faudra au moins ' + need + ' bonne' + (need > 1 ? 's' : '') + ' réponse' + (need > 1 ? 's' : '') + ' sur ' + n + ' (50 %).';
  }
  function buildCountPicker() {
    var box = $('#count-options'), fs = $('#count-pick');
    if (!box || !fs || !data.bank.length) return;
    var max = data.bank.length;
    if (forcedList().length) {
      clear(box);
      box.appendChild(h('p', { class: 'count-forced', text: 'Série imposée par le lien utilisé (mode formateur) : ' + forcedList().length + ' message(s).' }));
      fs.hidden = false;
      updateCountHint();
      return;
    }
    var opts = COUNT_CHOICES.filter(function (n) { return n <= max; });
    if (opts.indexOf(max) === -1) opts.push(max);
    if (opts.indexOf(settings.count) === -1) settings.count = opts.indexOf(10) !== -1 ? 10 : opts[opts.length - 1];
    clear(box);
    opts.forEach(function (n) {
      var input = h('input', { type: 'radio', name: 'count', value: String(n), id: 'count-' + n });
      input.checked = n === settings.count;
      input.addEventListener('change', function () { settings.count = n; updateCountHint(); });
      box.appendChild(h('label', { class: 'count-opt', for: 'count-' + n }, input, h('span', { class: 'count-n', text: String(n) }), h('span', { class: 'count-l', text: COUNT_NAMES[n] || 'Série complète' })));
    });
    fs.hidden = false;
    updateCountHint();
  }

  /* ======================================================================
     Écrans, dialogues
     ====================================================================== */
  function showScreen(name) {
    current = name;
    $$('.screen').forEach(function (s) { s.classList.toggle('is-active', s.id === 'screen-' + name); });
    var focusTarget = { home: '#home-title', login: '#btn-signin', desktop: '#btn-start', report: '#report-title' }[name];
    if (focusTarget) {
      var el = $(focusTarget);
      if (el) { if (!el.hasAttribute('tabindex') && el.tagName.match(/^H/)) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
    }
    var sc = $('#screen-' + name);
    if (sc && sc.scrollTo) sc.scrollTo(0, 0);
  }

  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
  }
  function closeDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }
  function showInfo(title, nodes) {
    $('#info-title').textContent = title;
    var body = $('#info-body');
    clear(body);
    append(body, nodes);
    openDialog($('#dlg-info'));
  }

  /* ======================================================================
     Horloge réelle (heure de l’appareil) et chronomètre facultatif
     ====================================================================== */
  // Heure et date : synchronisées avec l'horloge réelle de l'appareil (fuseau local).
  var fmtTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  var fmtHM = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
  var fmtDateShort = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  var fmtDateLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  var fmtDateFull = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function renderClocks() {
    var now = new Date();
    var time = fmtTime.format(now);
    $('#login-time').textContent = time;
    $('#login-date').textContent = cap(fmtDateLong.format(now));
    $('#tb-time').textContent = time;
    $('#tb-date').textContent = fmtDateShort.format(now);
    $('#tb-clock').title = cap(fmtDateFull.format(now));
  }

  function tickClock() {
    renderClocks();
    setTimeout(tickClock, 1000 - (Date.now() % 1000) + 8); // se recale sur la seconde réelle
  }

  /* Batterie de l'appareil (API Battery, quand le navigateur la fournit). Lue localement, jamais enregistrée ni envoyée. */
  var battery = { level: null, charging: false };
  function batteryLabel() {
    if (battery.level === null) return 'Batterie de l’appareil : information non disponible';
    return 'Batterie de l’appareil : ' + battery.level + ' %' + (battery.charging ? ', en charge' : '');
  }
  function renderBattery() {
    var lvl = battery.level;
    $$('.js-battery').forEach(function (el) {
      clear(el);
      var fill = h('span', { class: 'bat-fill' });
      fill.style.width = (lvl === null ? 0 : lvl) + '%';
      el.appendChild(h('span', { class: 'bat' + (lvl !== null && lvl <= 20 && !battery.charging ? ' is-low' : '') + (battery.charging ? ' is-charging' : ''), 'aria-hidden': 'true' }, fill));
      el.appendChild(h('span', { class: 'bat-txt', 'aria-hidden': 'true', text: lvl === null ? 'n/d' : lvl + ' %' }));
      if (battery.charging) el.appendChild(h('span', { class: 'bat-bolt', 'aria-hidden': 'true' }, ic('bolt')));
      el.setAttribute('aria-label', batteryLabel());
      el.title = batteryLabel() + (lvl === null ? ' (votre navigateur ne partage pas cette information).' : '. Lue localement : jamais enregistrée ni envoyée.');
    });
  }
  function initBattery() {
    renderBattery();
    if (!navigator.getBattery) return;
    try {
      navigator.getBattery().then(function (b) {
        var upd = function () { battery.level = Math.round(b.level * 100); battery.charging = !!b.charging; renderBattery(); };
        upd();
        b.addEventListener('levelchange', upd);
        b.addEventListener('chargingchange', upd);
      }).catch(function () { /* information indisponible : l'affichage reste « n/d » */ });
    } catch (e) { /* ignoré */ }
  }

  // Chronomètre facultatif : désactivé par défaut (aucune limite de temps), 15 minutes si activé, jamais de sanction.
  function renderTimer() {
    var btn = $('#btn-timer');
    $('#timer-text').textContent = state.timer.on ? fmtMMSS(state.timer.remaining) : 'Sans limite';
    btn.setAttribute('aria-pressed', state.timer.on ? 'true' : 'false');
    btn.title = state.timer.on
      ? 'Chronomètre indicatif activé (15 minutes, aucune sanction). Cliquez pour le désactiver et jouer sans limite de temps.'
      : 'Vous jouez sans limite de temps. Cliquez pour activer un chronomètre indicatif de 15 minutes (facultatif).';
  }
  function startTicking() {
    stopTicking();
    renderTimer();
    tickHandle = setInterval(function () {
      if (current !== 'desktop' || !state.timer.on || state.timer.expired) return;
      state.timer.remaining -= 1;
      renderTimer();
      if (state.timer.remaining <= 0) {
        state.timer.expired = true;
        openDialog($('#dlg-timer'));
      }
    }, 1000);
  }
  function stopTicking() { if (tickHandle) { clearInterval(tickHandle); tickHandle = null; } }

  /* ======================================================================
     Gestionnaire de fenêtres
     ====================================================================== */
  var wm = { wins: new Map(), z: 20, active: null };

  function desktopArea() { return $('#windows'); }

  function openApp(appId) {
    var existing = wm.wins.get(appId);
    if (existing) { focusWindow(appId); return existing; }
    var app = APPS[appId];
    var area = desktopArea();
    var aw = area.clientWidth, ah = area.clientHeight;
    var w = Math.min(app.size[0], aw - 24), hgt = Math.min(app.size[1], ah - 24);
    var offset = (wm.wins.size % 5) * 28;
    var left = Math.max(8, Math.round((aw - w) / 2) + offset - 56);
    var top = Math.max(8, Math.round((ah - hgt) / 2) + offset - 30);

    var body = h('div', { class: 'win-body' });
    var btnMin = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Réduire la fenêtre ' + app.title, onclick: function () { minimizeWindow(appId); } }, ic('min'));
    var btnMax = h('button', { class: 'icon-btn btn-max', type: 'button', 'aria-label': 'Agrandir ou restaurer la fenêtre ' + app.title, onclick: function () { toggleMaximize(appId); } }, ic('max'));
    var btnClose = h('button', { class: 'icon-btn close', type: 'button', 'aria-label': 'Fermer la fenêtre ' + app.title, onclick: function () { requestClose(appId); } }, ic('close'));
    var titlebar = h('div', { class: 'win-title' }, ic(app.icon), h('span', { class: 'ttl', text: app.title }), h('div', { class: 'win-btns' }, btnMin, btnMax, btnClose));
    var win = h('div', { class: 'win', role: 'dialog', 'aria-label': app.title, dataset: { app: appId } }, titlebar, body);
    win.style.width = w + 'px'; win.style.height = hgt + 'px';
    win.style.left = left + 'px'; win.style.top = top + 'px';
    win.addEventListener('pointerdown', function () { if (wm.active !== appId) focusWindow(appId); });
    enableDrag(win, titlebar);
    titlebar.addEventListener('dblclick', function (e) { if (!e.target.closest('button') && !isCompactScreen()) toggleMaximize(appId); });

    area.appendChild(win);
    wm.wins.set(appId, { el: win, body: body, minimized: false });
    app.build(body);
    focusWindow(appId);
    renderTaskbar();
    return wm.wins.get(appId);
  }

  function enableDrag(win, bar) {
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button') || e.button > 0) return;
      if (isCompactScreen() || win.classList.contains('is-max')) return;
      var sx = e.clientX, sy = e.clientY, sl = win.offsetLeft, st = win.offsetTop;
      try { bar.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
      function move(ev) {
        var area = desktopArea();
        var l = Math.max(-win.offsetWidth + 120, Math.min(area.clientWidth - 120, sl + ev.clientX - sx));
        var t = Math.max(0, Math.min(area.clientHeight - 40, st + ev.clientY - sy));
        win.style.left = l + 'px'; win.style.top = t + 'px';
      }
      function up(ev) {
        try { bar.releasePointerCapture(ev.pointerId); } catch (err) { /* ignoré */ }
        bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
      }
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });
  }

  function focusWindow(appId) {
    var w = wm.wins.get(appId);
    if (!w) return;
    w.minimized = false;
    w.el.classList.remove('is-min');
    wm.z += 1; w.el.style.zIndex = String(wm.z);
    wm.wins.forEach(function (o, id) { o.el.classList.toggle('is-active', id === appId); });
    wm.active = appId;
    renderTaskbar();
  }
  function minimizeWindow(appId) {
    var w = wm.wins.get(appId);
    if (!w) return;
    w.minimized = true; w.el.classList.add('is-min'); w.el.classList.remove('is-active');
    if (wm.active === appId) wm.active = null;
    renderTaskbar();
    var btn = $('.tb-task[data-app="' + appId + '"]');
    if (btn) btn.focus();
  }
  function toggleMaximize(appId) {
    var w = wm.wins.get(appId);
    if (!w) return;
    w.el.classList.toggle('is-max');
    $('.win-title', w.el).classList.toggle('is-fixed', w.el.classList.contains('is-max'));
  }
  function closeWindow(appId) {
    var w = wm.wins.get(appId);
    if (!w) return;
    w.el.remove();
    wm.wins.delete(appId);
    if (appId === 'mail') mailUI = null;
    if (appId === 'browser') browserUI = null;
    if (appId === 'docs') explorerUI = null;
    if (appId === 'notepad') { npUI = null; np = Object.assign(freshNp(), { wrap: np.wrap, size: np.size }); }
    if (wm.active === appId) wm.active = null;
    renderTaskbar();
    var icon = $('.desk-icon[data-app="' + appId + '"]');
    if (icon) icon.focus();
  }
  function requestClose(appId) {
    if (appId === 'notepad' && np && np.dirty) { npGuard().then(function (ok) { if (ok) closeWindow(appId); }); return; }
    closeWindow(appId);
  }
  function closeAllWindows() {
    Array.from(wm.wins.keys()).forEach(function (id) { var w = wm.wins.get(id); if (w) w.el.remove(); });
    wm.wins.clear(); wm.active = null; mailUI = null; browserUI = null; explorerUI = null; npUI = null;
    renderTaskbar();
  }
  function renderTaskbar() {
    var box = $('#tb-tasks');
    clear(box);
    wm.wins.forEach(function (w, id) {
      var app = APPS[id];
      var cls = 'tb-task' + (wm.active === id && !w.minimized ? ' is-active' : '') + (w.minimized ? ' is-min' : '');
      box.appendChild(h('button', {
        class: cls, type: 'button', dataset: { app: id }, title: app.title, 'aria-label': app.title + (w.minimized ? ' (réduite)' : ''),
        onclick: function () {
          if (w.minimized || wm.active !== id) focusWindow(id); else minimizeWindow(id);
        }
      }, ic(app.icon), h('span', { class: 't', text: app.title })));
    });
  }

  /* ======================================================================
     Bureau : icônes, menu Démarrer, notification
     ====================================================================== */
  function appTile(appId) { return h('span', { class: 'app-tile app-tile--' + TILE_CLASS[appId] }, ic(APPS[appId].icon)); }

  function buildDesktop() {
    var icons = $('#desk-icons');
    clear(icons);
    APP_ORDER.forEach(function (id) {
      var btn = h('button', { class: 'desk-icon', type: 'button', dataset: { app: id }, onclick: function () { closeStartMenu(); openApp(id); hideToast(); } },
        appTile(id), h('span', { text: APPS[id].title }));
      if (id === 'mail') btn.appendChild(h('span', { class: 'badge', id: 'mail-badge', 'aria-hidden': 'true' }));
      icons.appendChild(btn);
    });
    var sm = $('#sm-apps');
    clear(sm);
    APP_ORDER.forEach(function (id) {
      sm.appendChild(h('button', { class: 'sm-app', type: 'button', onclick: function () { closeStartMenu(); openApp(id); hideToast(); } },
        appTile(id), h('span', { text: APPS[id].title })));
    });
    updateBadge();
  }
  function updateBadge() {
    var b = $('#mail-badge');
    if (!b) return;
    var left = data.scenarios.filter(function (s) { return !state.decisions.has(s.id); }).length;
    b.textContent = String(left);
    b.hidden = left === 0;
  }

  function openStartMenu() { $('#startmenu').hidden = false; $('#btn-start').setAttribute('aria-expanded', 'true'); }
  function closeStartMenu() { $('#startmenu').hidden = true; $('#btn-start').setAttribute('aria-expanded', 'false'); }
  function toggleStartMenu() { if ($('#startmenu').hidden) openStartMenu(); else closeStartMenu(); }

  var toastTimer = null;
  function showToast() {
    var total = data.scenarios.length;
    $('#toast-msg').textContent = total + ' messages vous attendent dans le Courrier. Lisez-les à votre rythme : il n’y a aucune limite de temps.';
    $('#toast').hidden = false;
  }
  function hideToast() { $('#toast').hidden = true; if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; } }

  /* ======================================================================
     Flux : lancement, connexion, chargement, bureau
     ====================================================================== */
  function launch() {
    var err = $('#load-error');
    err.hidden = true;
    var go = function () {
      if (!data.loaded) {
        err.textContent = "Les scénarios n'ont pas pu être chargés. Vérifiez que les fichiers du dossier « data » sont présents, puis rechargez la page.";
        err.hidden = false;
        return;
      }
      settings.count = readCount();
      applySelection(settings.count);
      showScreen('login');
    };
    if (data.loaded) go(); else data.promise.then(go);
  }

  function bootSequence() {
    showScreen('boot');
    var steps = ['Chargement du profil fictif…', 'Préparation du bureau…', 'Ouverture de la session…'];
    var total = reduceMotion ? 700 : 1800;
    var t0 = Date.now();
    var fill = $('#boot-fill'), bar = $('#boot-bar'), label = $('#boot-step'), pct = $('#boot-pct');
    fill.style.width = '0%'; pct.textContent = '0 %';
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / total);
      fill.style.width = Math.round(p * 100) + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      pct.textContent = Math.round(p * 100) + ' %';
      label.textContent = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
      if (p >= 1) { clearInterval(iv); enterDesktop(); }
    }, 60);
  }

  function enterDesktop() {
    buildDesktop();
    $('#guide-count').textContent = String(data.scenarios.length);
    $('#guide').hidden = false;
    showScreen('desktop');
    startTicking();
    hideToast();
    toastTimer = setTimeout(function () { if (current === 'desktop') showToast(); }, reduceMotion ? 300 : 1200);
  }

  function resetSimulation() {
    closeAllWindows();
    closeStartMenu();
    hideToast();
    stopTicking();
    ['dlg-how', 'dlg-info', 'dlg-reply', 'dlg-timer', 'dlg-ask', 'dlg-compose'].forEach(function (id) { closeDialog($('#' + id)); });
    state = freshState();
    resetFiles();
  }
  function goHome() { resetSimulation(); showScreen('home'); }
  function restart() { resetSimulation(); applySelection(settings.count); showScreen('login'); }

  /* ======================================================================
     Messagerie
     ====================================================================== */
  function inboxList() { return data.scenarios.filter(function (s) { return !state.trash.has(s.id); }); }
  function trashList() { return data.scenarios.filter(function (s) { return state.trash.has(s.id); }); }
  function visibleList() { return state.folder === 'trash' ? trashList() : inboxList(); }
  function decidedCount() { return state.decisions.size; }
  function correctCount() { var n = 0; state.decisions.forEach(function (d) { if (d.correct) n += 1; }); return n; }

  function buildMail(body) {
    var root = h('div', { class: 'mail' });
    var ui = {
      root: root,
      pos: h('strong'),
      bar: h('div', { class: 'bar', role: 'progressbar', 'aria-label': 'Messages analysés', 'aria-valuemin': '0' }, h('span')),
      stats: h('span'),
      notice: h('span', { class: 'muted', role: 'status', 'aria-live': 'polite' }),
      side: h('nav', { class: 'mail-side', 'aria-label': 'Dossiers' }),
      list: h('div', { class: 'mail-list' }),
      read: h('div', { class: 'mail-read', 'aria-live': 'off' })
    };
    var topbar = h('div', { class: 'mail-bar' }, ui.pos, ui.bar, ui.stats,
      h('button', { class: 'btn btn-small btn-primary', type: 'button', id: 'btn-compose', onclick: function () { openCompose(null); } }, ic('edit'), 'Nouveau message'),
      h('button', { class: 'btn btn-small', type: 'button', onclick: function () { openDialog($('#dlg-how')); } }, ic('info'), 'Aide'), ui.notice);
    root.appendChild(topbar);
    root.appendChild(h('div', { class: 'mail-main' }, ui.side, ui.list, ui.read));
    body.appendChild(root);
    mailUI = ui;
    renderMail();
  }


  /* ---------- Courrier : envoyés, brouillons et rédaction (simulation, rien n'est transmis) ---------- */
  var MAIL_SEQ = 0;
  function mailPool() { return state.folder === 'sent' ? state.sent : state.drafts; }
  function findMailItem(id) { return state.sent.concat(state.drafts).filter(function (m) { return m.id === id; })[0] || null; }
  function firstLine(t) { return String(t || '').split('\n').filter(function (l) { return l.trim(); })[0] || ''; }

  function renderMailItemList() {
    var items = mailPool();
    if (!items.length) {
      mailUI.list.appendChild(h('p', { class: 'empty', text: state.folder === 'sent' ? 'Aucun message envoyé. « Nouveau message » permet d’en écrire un (simulation).' : 'Aucun brouillon. Un message commencé puis fermé est enregistré ici.' }));
      return;
    }
    var ul = h('ul');
    items.forEach(function (m) {
      ul.appendChild(h('li', null, h('button', {
        class: 'mi is-read' + (state.mailItem === m.id ? ' is-selected' : ''), type: 'button', dataset: { mid: m.id }, 'aria-current': state.mailItem === m.id ? 'true' : null,
        onclick: function () { state.mailItem = m.id; mailUI.root.classList.add('show-read'); renderMail(); mailUI.read.scrollTop = 0; var t = $('.r-subject', mailUI.read); if (t) t.focus({ preventScroll: true }); }
      }, h('span', { class: 'from', text: 'À : ' + (m.to || '(aucun destinataire)') }), h('span', { class: 'when', text: fmtHM.format(new Date(m.at)) }),
        h('span', { class: 'subj', text: m.subject || '(sans objet)' }), h('span', { class: 'prev', text: firstLine(m.body) }))));
    });
    mailUI.list.appendChild(ul);
  }

  function renderMailItemReader() {
    var rd = mailUI.read, m = state.mailItem ? findMailItem(state.mailItem) : null;
    if (m && mailPool().indexOf(m) === -1) m = null;
    if (!m) {
      rd.appendChild(h('div', { class: 'mail-guide' }, h('h2', { text: state.folder === 'sent' ? 'Messages envoyés' : 'Brouillons' }),
        h('p', { text: 'Choisissez un message dans la liste, ou écrivez-en un nouveau. C’est un entraînement : rien n’est réellement envoyé.' }),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { openCompose(null); } }, ic('edit'), 'Nouveau message')));
      return;
    }
    var isDraft = state.folder === 'drafts';
    rd.appendChild(h('div', { class: 'r-head' }, h('div', { class: 'r-av', 'aria-hidden': 'true', text: 'MOI' }),
      h('div', { class: 'r-from' }, h('span', { class: 'name', text: isDraft ? 'Brouillon' : 'Message envoyé' }), h('span', { class: 'addr', text: '<' + USER_ADDRESS + '>' }))));
    rd.appendChild(h('dl', { class: 'r-details' },
      h('dt', { text: 'De' }), h('dd', { text: USER_ADDRESS }),
      h('dt', { text: 'À' }), h('dd', { text: m.to || '(aucun destinataire)' }),
      h('dt', { text: 'Date' }), h('dd', { text: cap(fmtDateFull.format(new Date(m.at))) + ', ' + fmtHM.format(new Date(m.at)) })));
    rd.appendChild(h('h2', { class: 'r-subject', tabindex: '-1', text: m.subject || '(sans objet)' }));
    if (m.attach.length) {
      var at = h('div', { class: 'r-attach' });
      m.attach.forEach(function (a) { at.appendChild(h('span', { class: 'attach is-static' }, ic('clip'), h('span', { text: a.name }), h('span', { class: 'muted', text: '(' + a.size + ')' }))); });
      rd.appendChild(at);
    }
    rd.appendChild(h('div', { class: 'r-body r-plain', text: m.body || '(message vide)' }));
    if (!isDraft) rd.appendChild(h('p', { class: 'note', text: 'Simulation : ce message n’a été transmis à personne. Il reste dans cette page et disparaît au rechargement.' }));
    rd.appendChild(h('div', { class: 'r-actions' },
      h('button', { class: 'btn btn-small', type: 'button', onclick: backToList }, ic('chevron-left'), 'Retour'),
      isDraft ? h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: function () { openCompose(m); } }, ic('edit'), 'Modifier') : null,
      h('button', { class: 'btn btn-small', type: 'button', onclick: function () {
        var pool = mailPool(); pool.splice(pool.indexOf(m), 1); state.mailItem = null; mailUI.root.classList.remove('show-read'); renderMail();
        setNotice((isDraft ? 'Brouillon' : 'Message') + ' supprimé.');
      } }, ic('trash'), 'Supprimer')));
  }

  var composeId = null, composeAttach = [], composeDone = false;
  var SENSITIVE = [
    [/mot de passe|password|\bmdp\b/i, 'Ne mettez jamais un mot de passe dans un e-mail : il peut être lu, transféré ou copié, et aucun service sérieux ne vous le demandera.'],
    [/(?:\d[ -]?){13,19}/, 'Cette suite de chiffres ressemble à un numéro de carte bancaire. Ne l’envoyez pas par e-mail.'],
    [/\biban\b|\bFR\d{2}[ ]?\d{4}/i, 'Un IBAN ne se communique qu’à une personne ou à un organisme que vous avez vous-même contacté et dont vous êtes sûr.'],
    [/code (?:secret|confidentiel|pin|de v[ée]rification|re[çc]u)|\bcode pin\b|code sms/i, 'Un code reçu par SMS ou un code secret ne se partage jamais, même avec quelqu’un qui paraît légitime.'],
    [/s[ée]curit[ée] sociale|\b[12][ ]?\d{2}[ ]?\d{2}[ ]?\d{2}[ ]?\d{3}[ ]?\d{3}\b/i, 'Votre numéro de sécurité sociale est une donnée sensible : ne l’écrivez pas dans un e-mail.']
  ];
  function composeData() { return { to: $('#cp-to').value.trim(), subject: $('#cp-subject').value.trim(), body: $('#cp-body').value, attach: composeAttach.slice() }; }
  function composeIsEmpty(d) { return !d.to && !d.subject && !d.body.trim() && !d.attach.length; }
  function renderComposeHints() {
    var d = composeData(), text = d.subject + ' ' + d.body, ul = $('#cp-hints'), hints = [];
    SENSITIVE.forEach(function (r) { if (r[0].test(text)) hints.push(r[1]); });
    if (d.to && /@/.test(d.to) && !/\.example$/i.test(d.to)) hints.push('Rien ne part vraiment, mais prenez l’habitude de ne pas saisir de vraies adresses dans une simulation : utilisez plutôt une adresse en « .example » (par exemple ami@exemple.example).');
    if (d.attach.length) hints.push('Avant d’envoyer une pièce jointe, demandez-vous : le destinataire en a-t-il vraiment besoin ? Évitez d’envoyer des documents sensibles par e-mail.');
    if (d.body.trim() && !d.subject) hints.push('Pensez à ajouter un objet : un message sans objet inspire moins confiance.');
    clear(ul);
    hints.forEach(function (t) { ul.appendChild(h('li', { text: t })); });
    ul.hidden = !hints.length;
  }
  function renderComposeAttach() {
    var box = $('#cp-attach');
    clear(box);
    composeAttach.forEach(function (a, i) {
      box.appendChild(h('span', { class: 'cp-chip' }, ic('clip'), h('span', { text: a.name + ' (' + a.size + ')' }),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Retirer la pièce jointe ' + a.name, onclick: function () { composeAttach.splice(i, 1); renderComposeAttach(); renderComposeHints(); } }, ic('close'))));
    });
  }
  function openCompose(draft) {
    composeId = draft ? draft.id : null; composeDone = false;
    composeAttach = draft ? draft.attach.slice() : [];
    $('#cp-to').value = draft ? draft.to : ''; $('#cp-subject').value = draft ? draft.subject : ''; $('#cp-body').value = draft ? draft.body : '';
    $('#cp-err').hidden = true; $('#cp-err').textContent = ''; $('#cp-to').removeAttribute('aria-invalid');
    $('#compose-title').textContent = draft ? 'Modifier le brouillon' : 'Nouveau message';
    renderComposeAttach(); renderComposeHints();
    openDialog($('#dlg-compose'));
    $('#cp-to').focus();
  }
  function storeDraft() {
    var d = composeData();
    if (composeIsEmpty(d)) { if (composeId) state.drafts = state.drafts.filter(function (m) { return m.id !== composeId; }); composeId = null; return null; }
    var item = composeId ? state.drafts.filter(function (m) { return m.id === composeId; })[0] : null;
    if (item) Object.assign(item, d, { at: Date.now() });
    else { item = Object.assign({ id: 'm' + (++MAIL_SEQ) }, d, { at: Date.now() }); state.drafts.unshift(item); }
    composeId = item.id;
    return item;
  }
  function finishCompose() { composeDone = true; closeDialog($('#dlg-compose')); }
  function sendCompose() {
    var d = composeData(), err = '';
    if (!d.to) err = 'Indiquez un destinataire.';
    else if (!/^[^\s@,;<>()]+@[^\s@,;<>()]+\.[^\s@,;<>()]{2,}$/.test(d.to)) err = 'Cette adresse n’est pas valide : vérifiez le « @ » et le point du domaine (par exemple ami@exemple.example).';
    else if (!d.subject && !d.body.trim()) err = 'Écrivez au moins un objet ou un message.';
    var e = $('#cp-err');
    if (err) { e.textContent = err; e.hidden = false; $('#cp-to').setAttribute('aria-invalid', 'true'); (d.to ? $('#cp-body') : $('#cp-to')).focus(); return; }
    if (composeId) state.drafts = state.drafts.filter(function (m) { return m.id !== composeId; });
    var item = Object.assign({ id: 'm' + (++MAIL_SEQ) }, d, { at: Date.now() });
    state.sent.unshift(item);
    composeId = null; finishCompose();
    if (mailUI) { state.folder = 'sent'; state.selectedId = null; state.mailItem = item.id; mailUI.root.classList.add('show-read'); renderMail(); }
    setNotice('Message envoyé (simulation) : il est dans « Envoyés ». Rien n’a quitté cette page.');
  }
  function saveComposeDraft() {
    var it = storeDraft(); finishCompose();
    if (mailUI) { renderMail(); setNotice(it ? 'Brouillon enregistré dans « Brouillons ».' : 'Message vide : rien à enregistrer.'); }
  }
  function discardCompose() {
    if (composeId) state.drafts = state.drafts.filter(function (m) { return m.id !== composeId; });
    composeId = null; finishCompose();
    if (mailUI) { renderMail(); setNotice('Message supprimé.'); }
  }
  function attachFromDocs() {
    var files = fsAllFiles();
    if (!files.length) { $('#cp-err').textContent = 'Aucun fichier dans Documents à joindre.'; $('#cp-err').hidden = false; return; }
    ask({ title: 'Joindre un fichier', message: 'Choisissez un fichier de votre espace Documents (fictif).', select: { label: 'Fichier', options: files, value: files[0].value }, buttons: [{ label: 'Joindre', value: 'ok', kind: 'primary' }, BTN_CANCEL] }).then(function (r) {
      if (r.action !== 'ok' || !FS.nodes.has(r.select)) return;
      var n = FS.nodes.get(r.select);
      if (composeAttach.some(function (a) { return a.fileId === n.id; })) return;
      composeAttach.push({ fileId: n.id, name: n.name, size: fmtSize(n.content) });
      renderComposeAttach(); renderComposeHints();
      $('#cp-body').focus();
    });
  }
  function initCompose() {
    var dlg = $('#dlg-compose');
    ['#cp-to', '#cp-subject', '#cp-body'].forEach(function (sel) { $(sel).addEventListener('input', renderComposeHints); });
    $('#cp-to').addEventListener('input', function () { $('#cp-err').hidden = true; $('#cp-to').removeAttribute('aria-invalid'); });
    $('#cp-send').addEventListener('click', sendCompose);
    $('#cp-save').addEventListener('click', saveComposeDraft);
    $('#cp-discard').addEventListener('click', discardCompose);
    $('#cp-attach-btn').addEventListener('click', attachFromDocs);
    // Fermeture par la croix ou Échap : le texte commencé devient un brouillon (comme dans une vraie messagerie).
    dlg.addEventListener('close', function () {
      if (dlg.open || composeDone) return;
      composeDone = true;
      var it = storeDraft();
      if (mailUI) { renderMail(); if (it) setNotice('Brouillon enregistré automatiquement.'); }
    });
  }

  function setNotice(text) {
    state.notice = text;
    if (mailUI) mailUI.notice.textContent = text;
    setTimeout(function () { if (state.notice === text) { state.notice = ''; if (mailUI) mailUI.notice.textContent = ''; } }, 5000);
  }

  function renderMail() {
    if (!mailUI) return;
    renderMailBar(); renderMailSide(); renderMailList(); renderMailReader();
    updateBadge();
  }

  function renderMailBar() {
    var total = data.scenarios.length;
    var idx = state.selectedId ? data.scenarios.findIndex(function (s) { return s.id === state.selectedId; }) + 1 : 0;
    mailUI.pos.textContent = idx ? 'Message ' + idx + '/' + total : 'Aucun message ouvert';
    var done = decidedCount();
    mailUI.bar.setAttribute('aria-valuemax', String(total));
    mailUI.bar.setAttribute('aria-valuenow', String(done));
    $('span', mailUI.bar).style.width = Math.round(done / total * 100) + '%';
    mailUI.stats.textContent = 'Analysés : ' + done + '/' + total + ' · Score : ' + correctCount() + '/' + done;
  }

  function renderMailSide() {
    clear(mailUI.side);
    [['inbox', 'Boîte de réception', 'inbox', inboxList().length], ['sent', 'Envoyés', 'reply', state.sent.length], ['drafts', 'Brouillons', 'edit', state.drafts.length], ['trash', 'Corbeille', 'trash', trashList().length]].forEach(function (f) {
      mailUI.side.appendChild(h('button', {
        class: 'folder' + (state.folder === f[0] ? ' is-active' : ''), type: 'button', 'aria-current': state.folder === f[0] ? 'true' : null, dataset: { folder: f[0] },
        onclick: function () { state.folder = f[0]; state.selectedId = null; state.mailItem = null; mailUI.root.classList.remove('show-read'); renderMail(); }
      }, h('span', { class: 'lbl' }, ic(f[2]), h('span', { text: f[1] })), h('span', { class: 'n', text: String(f[3]) })));
    });
  }

  function renderMailList() {
    clear(mailUI.list);
    if (state.folder === 'sent' || state.folder === 'drafts') { renderMailItemList(); return; }
    var items = visibleList();
    if (!items.length) {
      mailUI.list.appendChild(h('p', { class: 'empty', text: state.folder === 'trash' ? 'La corbeille est vide.' : 'Aucun message dans ce dossier.' }));
      return;
    }
    var ul = h('ul');
    items.forEach(function (s) {
      var d = state.decisions.get(s.id);
      var first = (s.body.find(function (b) { return b.t === 'p'; }) || { x: '' }).x;
      var stateLabel = d ? (d.correct ? ['ok', '✔ Bonne réponse'] : ['bad', '✖ À revoir']) : null;
      var li = h('li', null, h('button', {
        class: 'mi' + (state.selectedId === s.id ? ' is-selected' : '') + (d || state.openedAt.has(s.id) ? ' is-read' : ''), type: 'button',
        'aria-current': state.selectedId === s.id ? 'true' : null, onclick: function () { selectMessage(s.id); }
      },
        h('span', { class: 'from', text: s.sender.name }), h('span', { class: 'when', text: s.time.replace("Aujourd'hui, ", '').replace('Hier, ', 'Hier ') }),
        h('span', { class: 'subj', text: s.subject }), h('span', { class: 'prev', text: first }),
        d ? h('span', { class: 'state ' + stateLabel[0], text: stateLabel[1] }) : (state.openedAt.has(s.id) ? h('span', { class: 'state pend', text: 'À analyser' }) : null)));
      ul.appendChild(li);
    });
    mailUI.list.appendChild(ul);
  }

  function selectMessage(id) {
    state.selectedId = id;
    if (!state.openedAt.has(id)) state.openedAt.set(id, performance.now());
    state.detailsOpen = false; state.hintsOpen = false;
    mailUI.root.classList.add('show-read');
    renderMail();
    mailUI.read.scrollTop = 0;
    var t = $('.r-subject', mailUI.read);
    if (t) t.focus({ preventScroll: true });
  }

  function backToList() {
    state.selectedId = null;
    mailUI.root.classList.remove('show-read');
    renderMail();
  }

  function renderMailReader() {
    var prevScroll = mailUI.read.scrollTop;
    clear(mailUI.read);
    if (state.folder === 'sent' || state.folder === 'drafts') { renderMailItemReader(); return; }
    var sc = state.selectedId ? data.byId.get(state.selectedId) : null;
    if (!sc) {
      var firstId = nextUndecidedId(null);
      mailUI.read.appendChild(h('div', { class: 'mail-guide' },
        h('h2', { text: 'Comment analyser un message ?' }),
        h('ol', null,
          h('li', null, h('strong', { text: 'Ouvrez un message' }), ' dans la liste. Les messages non lus sont en gras.'),
          h('li', null, h('strong', { text: 'Observez. ' }), 'Lisez l’adresse complète de l’expéditeur, cliquez sur « Afficher les détails » et survolez les liens pour voir leur vraie destination (aucun site réel n’est jamais ouvert ici). Consultez aussi vos Documents (notes, agenda) pour vérifier le contexte : ils sont dans l’application « Documents ».'),
          h('li', null, h('strong', { text: 'Décidez : ' }), '« Message légitime » ou « Tentative de phishing ». « Examiner les indices » pose les bonnes questions sans donner la réponse.'),
          h('li', null, h('strong', { text: 'Apprenez. ' }), 'Après votre choix, la correction explique chaque signal. Passez ensuite au message suivant.')),
        h('p', { class: 'muted', text: 'Aucune limite de temps : prenez le temps qu’il vous faut. « Répondre » et « Signaler » comptent comme une réponse ; « Supprimer » met le message à la corbeille sans le compter. Le bilan s’affiche à la fin, quand tous les messages ont reçu une réponse ; à partir de 50 % de bonnes réponses, vous obtenez une attestation de réussite EITT. Envie de vous entraîner à écrire ? « Nouveau message » ouvre un éditeur de courrier fictif : rien n’est envoyé.' }),
        firstId ? h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { if (state.trash.has(firstId)) state.folder = 'trash'; selectMessage(firstId); } }, 'Ouvrir un message à analyser') : null));
      return;
    }
    var dec = state.decisions.get(sc.id);
    var inTrash = state.trash.has(sc.id);
    var rd = mailUI.read;

    // En-tête
    var toggle = h('button', {
      class: 'r-toggle', type: 'button', 'aria-expanded': state.detailsOpen ? 'true' : 'false',
      onclick: function () { state.detailsOpen = !state.detailsOpen; renderMailReader(); }
    }, state.detailsOpen ? 'Masquer les détails' : 'Afficher les détails');
    rd.appendChild(h('div', { class: 'r-head' },
      h('div', { class: 'r-av', 'aria-hidden': 'true', text: initials(sc.sender.name) }),
      h('div', { class: 'r-from' }, h('span', { class: 'name', text: sc.sender.name }), h('span', { class: 'addr', text: '<' + sc.sender.address + '>' }), toggle)));
    if (state.detailsOpen) {
      var dl = h('dl', { class: 'r-details' },
        h('dt', { text: 'De' }), h('dd', { text: sc.sender.name + ' <' + sc.sender.address + '>' }),
        h('dt', { text: 'À' }), h('dd', { text: 'Utilisateur EITT <' + USER_ADDRESS + '>' }),
        h('dt', { text: 'Date' }), h('dd', { text: sc.time }));
      if (sc.replyTo) { dl.appendChild(h('dt', { text: 'Répondre à' })); dl.appendChild(h('dd', { text: sc.replyTo })); }
      dl.appendChild(h('dt', { text: 'Objet' })); dl.appendChild(h('dd', { text: sc.subject }));
      rd.appendChild(dl);
    }
    rd.appendChild(h('h2', { class: 'r-subject', tabindex: '-1', text: sc.subject }));
    if (inTrash) rd.appendChild(h('p', { class: 'muted', text: 'Ce message est dans la corbeille. Vous pouvez le restaurer pour l’analyser.' }));

    // Pièces jointes (éléments fictifs)
    if (sc.attachments.length) {
      var at = h('div', { class: 'r-attach' });
      sc.attachments.forEach(function (a) {
        at.appendChild(h('button', {
          class: 'attach', type: 'button', onclick: function () {
            state.clickedAttach.add(sc.id);
            showInfo('Pièce jointe fictive', [
              h('p', { text: 'Dans cette simulation, « ' + a.name + ' » est un élément factice : aucun fichier n’est ouvert, téléchargé ou exécuté.' }),
              h('p', { class: 'muted', text: 'Dans la réalité, ouvrir une pièce jointe inattendue est l’une des façons les plus courantes d’infecter un ordinateur.' })
            ]);
          }
        }, ic('clip'), h('span', { text: a.name }), h('span', { class: 'muted', text: '(' + a.size + ')' })));
      });
      rd.appendChild(at);
    }

    // Corps du message
    var linkStatus = h('div', { class: 'link-status', 'aria-live': 'polite' }, 'Astuce : survolez un lien pour afficher sa destination réelle.');
    var hasLink = false;
    var bodyBox = h('div', { class: 'r-body' });
    sc.body.forEach(function (b) {
      if (b.t === 'p') bodyBox.appendChild(h('p', { text: b.x }));
      else if (b.t === 'sig') bodyBox.appendChild(h('p', { class: 'sig', text: b.x }));
      else if (b.t === 'list') bodyBox.appendChild(h('ul', null, (b.items || []).map(function (it) { return h('li', { text: it }); })));
      else if (b.t === 'link' || b.t === 'btn') {
        hasLink = true;
        var a = h('a', { href: '#', class: b.t === 'btn' ? 'fake-btn' : 'fake-link', 'data-url': b.url, text: b.x });
        var show = function () { clear(linkStatus); linkStatus.appendChild(document.createTextNode('Lien : ')); linkStatus.appendChild(h('b', { text: b.url })); };
        var hide = function () { linkStatus.textContent = 'Astuce : survolez un lien pour afficher sa destination réelle.'; };
        a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
        a.addEventListener('mouseleave', hide); a.addEventListener('blur', hide);
        a.addEventListener('click', function (e) {
          e.preventDefault();
          state.clickedLink.add(sc.id);
          openBrowserNeutral(b.url, sc.id);
        });
        bodyBox.appendChild(b.t === 'btn' ? a : h('p', null, a));
      }
    });
    rd.appendChild(bodyBox);
    if (hasLink || sc.attachments.length) rd.appendChild(linkStatus);

    // Actions
    var actions = h('div', { class: 'r-actions' },
      h('button', { class: 'btn btn-small', type: 'button', onclick: backToList }, ic('chevron-left'), 'Retour'),
      h('button', { class: 'btn btn-small', type: 'button', disabled: !!dec, title: dec ? 'Message déjà analysé' : 'Répondre revient à faire confiance à l’expéditeur', onclick: function () { startReply(sc.id); } }, ic('reply'), 'Répondre'),
      h('button', { class: 'btn btn-small', type: 'button', disabled: !!dec, title: dec ? 'Message déjà analysé' : 'Signaler ce message comme suspect', onclick: function () { decide(sc.id, 'phishing', 'report'); } }, ic('flag'), 'Signaler'),
      inTrash
        ? h('button', { class: 'btn btn-small', type: 'button', onclick: function () { state.trash.delete(sc.id); setNotice('Message restauré dans la boîte de réception.'); renderMail(); } }, ic('inbox'), 'Restaurer')
        : h('button', { class: 'btn btn-small', type: 'button', onclick: function () { trashMessage(sc.id); } }, ic('trash'), 'Supprimer'));
    rd.appendChild(actions);

    // Décision ou résultat
    if (!dec) rd.appendChild(buildDecisionPanel(sc));
    else rd.appendChild(buildResult(sc, dec));

    rd.scrollTop = prevScroll;
  }

  function trashMessage(id) {
    state.trash.add(id);
    var wasSelected = state.selectedId === id;
    setNotice(state.decisions.has(id) ? 'Message déplacé dans la corbeille.' : 'Message déplacé dans la corbeille. Supprimer n’est pas une réponse : il reste à analyser.');
    if (wasSelected) { state.selectedId = null; mailUI.root.classList.remove('show-read'); }
    renderMail();
  }

  function buildDecisionPanel(sc) {
    var panel = h('section', { class: 'r-decide', 'aria-labelledby': 'dec-title' },
      h('h3', { id: 'dec-title', text: 'Votre analyse' }),
      h('div', { class: 'decide-row' },
        h('button', { class: 'btn btn-ok', type: 'button', onclick: function () { decide(sc.id, 'legit', 'verdict'); } }, ic('check'), 'Message légitime'),
        h('button', { class: 'btn btn-bad', type: 'button', onclick: function () { decide(sc.id, 'phishing', 'verdict'); } }, ic('alert'), 'Tentative de phishing'),
        h('button', {
          class: 'btn btn-ghost', type: 'button', 'aria-expanded': state.hintsOpen ? 'true' : 'false',
          onclick: function () { state.hintsOpen = !state.hintsOpen; renderMailReader(); }
        }, ic('search'), state.hintsOpen ? 'Masquer les indices' : 'Examiner les indices')));
    if (state.hintsOpen) {
      var wrap = h('div', { class: 'hints' });
      var links = uniq(sc.body.filter(function (b) { return b.t === 'link' || b.t === 'btn'; }).map(function (b) { return hostOf(b.url); }));
      CATS.forEach(function (c) {
        var extra = '';
        if (c.key === 'sender') extra = ' Adresse : ' + sc.sender.address + ' (domaine « ' + domainOfAddress(sc.sender.address) + ' »). Ouvrez « Afficher les détails » pour voir tous les champs.';
        if (c.key === 'links') {
          extra = links.length ? ' Domaines des liens : ' + links.join(', ') + '.' : ' Ce message ne contient aucun lien.';
          if (sc.attachments.length) extra += ' Pièce jointe : ' + sc.attachments.map(function (a) { return a.name; }).join(', ') + '.';
        }
        wrap.appendChild(h('p', { class: 'hint' }, h('b', { text: c.label + ' — ' }), c.ask + extra));
      });
      wrap.appendChild(h('p', { class: 'muted', text: 'Ces questions ne donnent pas la réponse : un seul indice ne suffit presque jamais, c’est leur ensemble qui compte.' }));
      panel.appendChild(wrap);
    }
    return panel;
  }

  function startReply(id) {
    var sc = data.byId.get(id);
    replyForId = id;
    var to = sc.replyTo || sc.sender.address;
    var body = $('#reply-body');
    clear(body);
    body.appendChild(h('p', null, h('strong', { text: 'À : ' }), sc.sender.name + ' <' + to + '>'));
    body.appendChild(h('p', null, h('strong', { text: 'Objet : ' }), 'Re: ' + sc.subject));
    body.appendChild(h('div', { class: 'reply-preview', text: 'Bonjour,\n\nMerci pour votre message. Je vous réponds avec les informations demandées.\n\nCordialement,\nUtilisateur EITT' }));
    body.appendChild(h('p', { class: 'muted', text: 'Répondre revient à faire confiance à l’expéditeur. Cette réponse est simulée : rien n’est envoyé.' }));
    openDialog($('#dlg-reply'));
  }

  function decide(id, verdict, via) {
    if (state.decisions.has(id)) return;
    var sc = data.byId.get(id);
    var started = state.openedAt.get(id);
    var ms = started ? Math.round(performance.now() - started) : 0;
    state.decisions.set(id, {
      verdict: verdict, via: via, ms: ms,
      correct: (verdict === 'phishing') === sc.isPhishing,
      clickedLink: state.clickedLink.has(id), clickedAttach: state.clickedAttach.has(id)
    });
    if (state.selectedId !== id) { state.selectedId = id; mailUI.root.classList.add('show-read'); }
    state.hintsOpen = false;
    renderMail();
    var res = $('.result', mailUI.read);
    if (res) { mailUI.read.scrollTop = Math.max(0, res.offsetTop - 12); var hd = $('h3', res); if (hd) hd.focus({ preventScroll: true }); }
  }

  function nextUndecidedId(afterId) {
    var list = inboxList();
    var start = Math.max(0, list.findIndex(function (s) { return s.id === afterId; }));
    for (var i = 1; i <= list.length; i++) {
      var s = list[(start + i) % list.length];
      if (!state.decisions.has(s.id)) return s.id;
    }
    var fromTrash = trashList().find(function (s) { return !state.decisions.has(s.id); });
    return fromTrash ? fromTrash.id : null;
  }

  function buildResult(sc, dec) {
    var phishing = sc.isPhishing;
    var said = dec.verdict;
    var kind, title, text, iconName;
    if (phishing && said === 'phishing') { kind = 'ok'; iconName = 'check'; title = 'Bonne réaction !'; text = 'Vous avez identifié plusieurs signaux d’alerte.'; }
    else if (phishing && said === 'legit') { kind = 'bad'; iconName = 'alert'; title = 'Attention'; text = 'Certains indices auraient mérité une vérification supplémentaire.'; }
    else if (!phishing && said === 'phishing') { kind = 'warn'; iconName = 'info'; title = 'Pas de panique'; text = 'Ce message ne présentait pas suffisamment d’indices pour conclure à une tentative de phishing.'; }
    else { kind = 'ok'; iconName = 'check'; title = 'Bonne analyse !'; text = 'Vous avez examiné le contexte avant de décider.'; }

    var box = h('section', { class: 'result', 'aria-label': 'Correction du message' });
    box.appendChild(h('div', { class: 'res-banner ' + kind },
      h('span', null, ic(iconName)),
      h('div', null, h('h3', { tabindex: '-1', text: title }), h('p', { text: text }),
        h('p', { class: 'muted', text: 'Ce message était ' + (phishing ? 'une tentative de phishing' : 'légitime') + '. ' + sc.summary }))));

    // Conséquence simulée (visuelle et pédagogique)
    var cons = null;
    if (phishing && said === 'legit') {
      var t = sc.consequences.trustedPhishing || 'Dans une situation réelle, cette décision aurait pu avoir des conséquences. Ici, rien n’a été envoyé ni exécuté.';
      if (dec.via === 'reply') t += ' Votre réponse (simulée) serait partie vers : ' + (sc.replyTo || sc.sender.address) + '.';
      if (dec.clickedLink) t += ' Vous aviez aussi cliqué sur un lien avant de décider : dans la réalité, c’est souvent à cette étape que le piège se referme.';
      if (dec.clickedAttach) t += ' Vous aviez ouvert la pièce jointe (factice) avant de décider.';
      cons = h('p', { class: 'consequence risk' }, h('span', { class: 'lbl', text: 'Conséquence simulée' }), h('br'), t);
    } else if (phishing && said === 'phishing') {
      var t2 = 'Votre signalement est enregistré (simulation). Dans une organisation, l’équipe sécurité pourrait prévenir les autres destinataires et bloquer l’expéditeur.';
      if (dec.clickedLink) t2 += ' Vous aviez cliqué sur un lien avant de signaler : en cas de doute, signalez sans cliquer.';
      cons = h('p', { class: 'consequence' }, h('span', { class: 'lbl', text: 'Conséquence simulée' }), h('br'), t2);
    } else if (!phishing && said === 'phishing') {
      cons = h('p', { class: 'consequence' }, h('span', { class: 'lbl', text: 'Conséquence simulée' }), h('br'),
        sc.consequences.reportedLegit || 'Un signalement inutile fait perdre du temps. Une alerte est plus utile lorsque plusieurs signaux concordent.');
    } else {
      cons = h('p', { class: 'consequence' }, h('span', { class: 'lbl', text: 'Conséquence simulée' }), h('br'), 'Aucune conséquence : vous avez traité ce message normalement.');
    }
    box.appendChild(cons);

    // Analyse par signal
    var an = h('ul', { class: 'an-list' });
    CATS.forEach(function (c) {
      var a = sc.analysis[c.key] || { flag: 'neutral', text: '' };
      an.appendChild(h('li', { class: 'an-item' },
        h('div', { class: 'k' }, h('span', { text: c.label }), h('span', { class: 'flag ' + a.flag, text: FLAG_LABEL[a.flag] || '' })),
        h('p', { text: a.text })));
    });
    box.appendChild(h('div', { class: 'res-block' }, h('h4', { text: 'Les indices à retenir' }), an));
    box.appendChild(h('p', { class: 'muted', text: 'Ni une faute, ni une adresse inconnue, ni un ton pressant ne suffisent seuls : c’est le croisement des signaux qui permet de décider.' }));

    if (sc.tips.length) box.appendChild(h('div', { class: 'res-block' }, h('h4', { text: 'Bonnes pratiques' }), h('ul', null, sc.tips.map(function (t) { return h('li', { text: t }); }))));
    if (dec.ms) box.appendChild(h('p', { class: 'res-time', text: 'Temps passé sur ce message : ' + fmtDur(dec.ms) + ' (indicatif : il ne mesure pas votre compétence).' }));

    var nextId = nextUndecidedId(sc.id);
    box.appendChild(h('div', { class: 'decide-row' },
      nextId
        ? h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { if (state.trash.has(nextId)) state.folder = 'trash'; else state.folder = 'inbox'; selectMessage(nextId); } }, 'Message suivant')
        : h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { showReport(); } }, 'Voir mon bilan')));
    return box;
  }

  /* ======================================================================
     Navigateur fictif
     ====================================================================== */
  function buildBrowser(body) {
    var ui = { page: 'portail', url: 'eitt-demo.example/portail', fromId: null, neutralUrl: null };
    ui.addr = h('span', { class: 'u' });
    ui.tag = h('span', { class: 'tag', text: 'Page fictive' });
    ui.content = h('div', { class: 'brw-page' });
    var bar = h('div', { class: 'brw-bar' },
      h('button', { class: 'btn btn-small', type: 'button', 'aria-label': 'Accueil du portail', onclick: function () { browserGo('portail'); } }, ic('home')),
      h('div', { class: 'brw-addr', 'aria-label': 'Adresse de la page (non modifiable)' }, ic('lock'), ui.addr, ui.tag));
    var marks = h('div', { class: 'brw-marks' },
      h('button', { class: 'btn btn-small', type: 'button', onclick: function () { browserGo('portail'); } }, 'Portail EITT'),
      h('button', { class: 'btn btn-small', type: 'button', onclick: function () { browserGo('aide'); } }, 'Aide en ligne'));
    body.appendChild(h('div', { class: 'brw' }, bar, marks, ui.content));
    browserUI = ui;
    renderBrowser();
  }
  function browserGo(page) {
    if (!browserUI) return;
    browserUI.page = page; browserUI.fromId = null; browserUI.neutralUrl = null;
    browserUI.url = page === 'aide' ? 'eitt-demo.example/aide' : 'eitt-demo.example/portail';
    renderBrowser();
  }
  function openBrowserNeutral(url, fromId) {
    openApp('browser');
    browserUI.page = 'neutral'; browserUI.neutralUrl = url; browserUI.fromId = fromId; browserUI.url = url;
    renderBrowser();
    focusWindow('browser');
  }
  function renderBrowser() {
    if (!browserUI) return;
    var ui = browserUI;
    ui.addr.textContent = ui.url;
    ui.tag.textContent = ui.page === 'neutral' ? 'Lien neutralisé' : 'Page fictive';
    clear(ui.content);
    if (ui.page === 'portail') {
      append(ui.content, [
        h('h2', { text: 'Portail EITT (page de démonstration)' }),
        h('p', { text: 'Cette page est entièrement fictive. Le navigateur de la simulation n’ouvre jamais de site réel : toutes les pages sont locales.' }),
        h('p', { class: 'muted', text: 'Astuce : pour accéder à un service, tapez vous-même son adresse ou utilisez vos favoris, plutôt que de suivre un lien reçu par message.' }),
        h('div', { class: 'decide-row' }, h('button', { class: 'btn', type: 'button', onclick: function () { browserGo('aide'); } }, 'Ouvrir l’aide en ligne'))
      ]);
    } else if (ui.page === 'aide') {
      append(ui.content, [
        h('h2', { text: 'Aide en ligne : reconnaître un lien fiable' }),
        h('ul', null, [
          'Lisez le nom de domaine, c’est-à-dire la partie juste avant le premier « / » : c’est elle qui désigne le site.',
          'Un nom qui ressemble au site connu (avec un mot ajouté, un tiret…) n’est pas le site connu.',
          'Survolez un lien avant de cliquer : l’adresse réelle s’affiche.',
          'En cas de doute, ouvrez le service par votre application ou votre adresse habituelle.'
        ].map(function (t) { return h('li', { text: t }); }))
      ]);
    } else {
      var url = ui.neutralUrl;
      var host = hostOf(url);
      var box = h('div', { class: 'url-box' });
      var idx = url.indexOf(host);
      if (idx >= 0) { box.appendChild(document.createTextNode(url.slice(0, idx))); box.appendChild(h('mark', { text: host })); box.appendChild(document.createTextNode(url.slice(idx + host.length))); }
      else box.textContent = url;
      var sc = ui.fromId ? data.byId.get(ui.fromId) : null;
      append(ui.content, [
        h('h2', { text: 'Lien neutralisé' }),
        h('p', { text: 'Dans cette simulation, aucun site externe n’est jamais ouvert. Voici l’adresse vers laquelle ce lien vous aurait conduit :' }),
        box,
        h('p', null, h('strong', { text: 'Domaine du lien : ' }), host),
        sc ? h('p', null, h('strong', { text: 'Domaine de l’expéditeur : ' }), domainOfAddress(sc.sender.address)) : null,
        sc ? h('p', { class: 'muted', text: 'À vous de juger si ces informations vous semblent cohérentes entre elles et avec ce que vous attendiez.' }) : null,
        h('p', { class: 'note', text: 'Dans une situation réelle, n’ouvrez pas un lien inattendu : accédez au service par son adresse ou son application habituelle.' }),
        h('div', { class: 'decide-row' },
          sc ? h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { openApp('mail'); focusWindow('mail'); } }, ic('mail'), 'Retourner au message') : null,
          h('button', { class: 'btn', type: 'button', onclick: function () { browserGo('portail'); } }, 'Aller au portail'))
      ]);
    }
  }

  /* ======================================================================
     Fichiers fictifs (en mémoire) : Documents, Téléchargements, Corbeille
     Tout fonctionne vraiment dans la simulation : créer, écrire, enregistrer,
     renommer, copier, déplacer, supprimer, restaurer. Rien n'est envoyé ni stocké :
     les fichiers disparaissent au rechargement (sauf ceux que l'on télécharge soi-même).
     ====================================================================== */
  var WELCOME_TEXT = [
    'BIENVENUE DANS VOTRE ESPACE FICTIF',
    '',
    'Tout fonctionne vraiment dans cette simulation :',
    '• Documents : créez des dossiers et des fichiers, renommez, copiez, déplacez (Couper puis Coller), supprimez, puis restaurez depuis la Corbeille.',
    '• Bloc-notes : écrivez, puis choisissez Enregistrer (Ctrl + S) ou Enregistrer sous… pour le ranger dans le dossier de votre choix.',
    '• Télécharger (dans le Bloc-notes) : garde une vraie copie du texte sur votre appareil.',
    '• Importer (dans Documents) : ajoute un fichier texte de votre appareil. Il reste sur votre appareil, rien n’est envoyé.',
    '',
    'Attention : ces fichiers n’existent que dans la simulation. Ils disparaissent quand vous rechargez la page ou redémarrez la simulation. Aucun serveur ne les reçoit.',
    '',
    'Vos notes personnelles (inscriptions, agenda, colis…) servent de contexte pour juger les messages du Courrier : relisez-les avant de décider !'
  ].join('\n');

  var FS_MAX_NODES = 300;
  var FILE_MAX = 100000;
  var NAME_BAD = /[\\\/:*?"<>|\u0000-\u001f]/;
  var collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
  var fmtFileDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  var NP_SIZES = [0.85, 1, 1.2, 1.45, 1.8];

  var FS = null;
  var fx = { folder: null, sel: null };
  var explorerUI = null;
  var np = null;
  var npUI = null;
  var fxNoticeTimer = null;

  function freshFS() {
    var fs = { nodes: new Map(), seq: 0, clip: null, docs: null, downloads: null };
    function add(parent, name, type, content, system) {
      var id = 'n' + (++fs.seq), now = Date.now();
      var node = { id: id, name: name, type: type, parent: parent, content: content || '', created: now, modified: now, trashed: false, trashedFrom: null, trashedAt: 0, system: !!system };
      fs.nodes.set(id, node);
      return node;
    }
    fs.docs = add(null, 'Documents', 'folder', '', true).id;
    fs.downloads = add(null, 'Téléchargements', 'folder', '', true).id;
    add(fs.docs, 'Bienvenue - mode d’emploi.txt', 'file', WELCOME_TEXT);
    DOCS.forEach(function (d) { add(fs.docs, d.name, 'file', d.text); });
    return fs;
  }
  function freshNp() { return { fileId: null, name: 'Sans titre.txt', text: '', dirty: false, wrap: true, size: 1 }; }
  function resetFiles() {
    FS = freshFS();
    fx = { folder: FS.docs, sel: null };
    np = freshNp();
    explorerUI = null; npUI = null;
  }

  function fsAlive(id) {
    var n = FS.nodes.get(id);
    while (n) {
      if (n.trashed) return false;
      if (n.parent === null) return true;
      n = FS.nodes.get(n.parent);
    }
    return false;
  }
  function fsKids(pid) {
    var out = [];
    FS.nodes.forEach(function (n) { if (n.parent === pid && !n.trashed) out.push(n); });
    out.sort(function (a, b) { if (a.type !== b.type) return a.type === 'folder' ? -1 : 1; return collator.compare(a.name, b.name); });
    return out;
  }
  function fsTrashed() {
    var out = [];
    FS.nodes.forEach(function (n) { if (n.trashed) out.push(n); });
    out.sort(function (a, b) { return b.trashedAt - a.trashedAt; });
    return out;
  }
  function fsPath(id) {
    var out = [], n = FS.nodes.get(id);
    while (n) { out.unshift(n); n = n.parent === null ? null : FS.nodes.get(n.parent); }
    return out;
  }
  function fsPathText(id) { return fsPath(id).map(function (n) { return n.name; }).join(' › '); }
  function fsSplitName(name) { var i = name.lastIndexOf('.'); return i > 0 ? [name.slice(0, i), name.slice(i)] : [name, '']; }
  function fsFind(pid, name) {
    var low = name.toLowerCase(), found = null;
    FS.nodes.forEach(function (n) { if (!found && n.parent === pid && !n.trashed && n.name.toLowerCase() === low) found = n; });
    return found;
  }
  function fsUnique(pid, name, exceptId) {
    var taken = function (nm) { var f = fsFind(pid, nm); return f && f.id !== exceptId; };
    if (!taken(name)) return name;
    var p = fsSplitName(name);
    for (var i = 2; i < 1000; i++) { var c = p[0] + ' (' + i + ')' + p[1]; if (!taken(c)) return c; }
    return name;
  }
  function cleanName(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function fsCheckName(name) {
    if (!name) return 'Saisissez un nom.';
    if (name.length > 60) return 'Le nom est trop long (60 caractères au maximum).';
    if (NAME_BAD.test(name)) return 'Ces caractères sont interdits dans un nom : \\ / : * ? " < > |';
    if (name.charAt(0) === '.') return 'Le nom ne peut pas commencer par un point.';
    return '';
  }
  function withExt(name) { return !name || /\.[^.\s]{1,8}$/.test(name) ? name : name + '.txt'; }
  function fsAdd(pid, name, type, content) {
    var id = 'n' + (++FS.seq), now = Date.now();
    var node = { id: id, name: name, type: type, parent: pid, content: content || '', created: now, modified: now, trashed: false, trashedFrom: null, trashedAt: 0, system: false };
    FS.nodes.set(id, node);
    return node;
  }
  function fsFull() { return FS.nodes.size >= FS_MAX_NODES; }
  function fsWithin(id, ancestorId) {
    var n = FS.nodes.get(id);
    while (n) { if (n.id === ancestorId) return true; n = n.parent === null ? null : FS.nodes.get(n.parent); }
    return false;
  }
  function fsCopy(id, destPid) {
    var src = FS.nodes.get(id);
    var node = fsAdd(destPid, fsUnique(destPid, src.name), src.type, src.content);
    if (src.type === 'folder') fsKids(src.id).forEach(function (k) { fsCopy(k.id, node.id); });
    return node;
  }
  function fsTrash(id) { var n = FS.nodes.get(id); n.trashed = true; n.trashedFrom = n.parent; n.trashedAt = Date.now(); }
  function fsRestore(id) {
    var n = FS.nodes.get(id);
    var dest = n.trashedFrom !== null && FS.nodes.has(n.trashedFrom) && fsAlive(n.trashedFrom) ? n.trashedFrom : FS.docs;
    n.trashed = false; n.parent = dest; n.name = fsUnique(dest, n.name, n.id); n.modified = Date.now();
    return n;
  }
  function fsPurge(id) {
    var doomed = [id];
    for (var i = 0; i < doomed.length; i++) FS.nodes.forEach(function (n) { if (n.parent === doomed[i]) doomed.push(n.id); });
    doomed.forEach(function (d) { FS.nodes.delete(d); });
    if (FS.clip && !FS.nodes.has(FS.clip.id)) FS.clip = null;
  }
  function fsFolderChoices() {
    var out = [];
    (function walk(pid, depth) {
      fsKids(pid).forEach(function (n) {
        if (n.type !== 'folder') return;
        out.push({ value: n.id, label: fsPathText(n.id) });
        walk(n.id, depth + 1);
      });
    })(null, 0);
    return out;
  }
  function fsAllFiles() {
    var out = [];
    FS.nodes.forEach(function (n) { if (n.type === 'file' && fsAlive(n.id)) out.push({ value: n.id, label: fsPathText(n.parent) + ' › ' + n.name }); });
    out.sort(function (a, b) { return collator.compare(a.label, b.label); });
    return out;
  }
  function fmtSize(text) {
    var n = new TextEncoder().encode(text).length;
    return n < 1024 ? n + ' o' : (n / 1024).toFixed(1).replace('.', ',') + ' Ko';
  }

  /* ---------- Boîte de dialogue générique (remplace prompt / confirm) ---------- */
  function ask(o) {
    return new Promise(function (resolve) {
      var dlg = $('#dlg-ask'), inp = $('#ask-input'), lab = $('#ask-label'), sel = $('#ask-select'), slab = $('#ask-sel-label'), err = $('#ask-err'), box = $('#ask-actions');
      $('#ask-title').textContent = o.title || '';
      var msg = $('#ask-msg'); msg.textContent = o.message || ''; msg.hidden = !o.message;
      lab.hidden = inp.hidden = !o.input;
      if (o.input) { lab.textContent = o.input.label; inp.value = o.input.value || ''; }
      slab.hidden = sel.hidden = !o.select;
      if (o.select) {
        slab.textContent = o.select.label; clear(sel);
        o.select.options.forEach(function (opt) { sel.appendChild(h('option', { value: opt.value, text: opt.label })); });
        if (o.select.value) sel.value = o.select.value;
      }
      err.hidden = true; err.textContent = ''; inp.removeAttribute('aria-invalid');
      clear(box);
      var done = false, primary = null, primaryBtn = null;
      function result(action) { return { action: action, input: o.input ? inp.value : '', select: o.select ? sel.value : '' }; }
      function finish(action) {
        if (done) return;
        done = true; dlg.removeEventListener('close', onClose); closeDialog(dlg); resolve(result(action));
      }
      function onClose() { if (dlg.open) return; finish('cancel'); }
      function submit(b) {
        if (!b.skipValidate && o.validate) {
          var e = o.validate(result(b.value));
          if (e) { err.textContent = e; err.hidden = false; inp.setAttribute('aria-invalid', 'true'); (o.input ? inp : sel).focus(); return; }
        }
        finish(b.value);
      }
      o.buttons.forEach(function (b) {
        var btn = h('button', { class: 'btn ' + (b.kind === 'primary' ? 'btn-primary' : b.kind === 'danger' ? 'btn-danger' : 'btn-ghost'), type: 'button', text: b.label, onclick: function () { submit(b); } });
        if (!primary && (b.kind === 'primary' || b.kind === 'danger')) { primary = b; primaryBtn = btn; }
        box.appendChild(btn);
      });
      inp.onkeydown = function (e) { if (e.key === 'Enter' && primary) { e.preventDefault(); submit(primary); } };
      dlg.addEventListener('close', onClose);
      openDialog(dlg);
      if (o.input) { inp.focus(); inp.select(); } else if (primaryBtn) primaryBtn.focus();
    });
  }
  var BTN_CANCEL = { label: 'Annuler', value: 'cancel', kind: 'ghost', skipValidate: true };

  /* ---------- Explorateur « Documents » ---------- */
  function fxSay(text) {
    if (explorerUI) explorerUI.live.textContent = text;
    if (fxNoticeTimer) clearTimeout(fxNoticeTimer);
    fxNoticeTimer = setTimeout(function () { if (explorerUI) explorerUI.live.textContent = ''; }, 9000);
  }
  function fxItems() { return fx.folder === 'trash' ? fsTrashed() : fsKids(fx.folder); }
  function fxSelNode() { return fx.sel && FS.nodes.get(fx.sel) ? FS.nodes.get(fx.sel) : null; }
  function fxRefresh(focus) { renderExplorer(focus); renderNp(); }

  function buildDocs(body) {
    var ui = explorerUI = { btn: {} };
    function tool(key, label, icon, fn) {
      var b = h('button', { class: 'btn btn-small fx-btn', type: 'button', dataset: { act: key }, onclick: fn }, ic(icon), h('span', { text: label }));
      ui.btn[key] = b;
      return b;
    }
    ui.fileInput = h('input', { type: 'file', accept: '.txt,.md,.csv,.log,.json,text/plain', hidden: true, tabindex: '-1', 'aria-label': 'Choisir un fichier texte sur votre appareil' });
    ui.fileInput.addEventListener('change', fxImportChosen);
    ui.tools = h('div', { class: 'fx-tools', role: 'toolbar', 'aria-label': 'Actions sur les fichiers' },
      tool('newFolder', 'Nouveau dossier', 'folder', fxNewFolder),
      tool('newFile', 'Nouveau fichier', 'plus', fxNewFile),
      tool('open', 'Ouvrir', 'file', function () { var n = fxSelNode(); if (n) fxOpen(n.id); }),
      tool('rename', 'Renommer', 'edit', fxRename),
      tool('copy', 'Copier', 'copy', function () { fxClip('copy'); }),
      tool('cut', 'Couper', 'cut', function () { fxClip('cut'); }),
      tool('paste', 'Coller', 'paste', fxPaste),
      tool('del', 'Supprimer', 'trash', fxDelete),
      tool('import', 'Importer…', 'upload', function () { ui.fileInput.click(); }),
      tool('restore', 'Restaurer', 'restart', fxRestore),
      tool('purge', 'Supprimer définitivement', 'trash', fxPurge),
      tool('empty', 'Vider la corbeille', 'trash', fxEmptyTrash),
      ui.fileInput);
    ui.side = h('nav', { class: 'fx-side', 'aria-label': 'Emplacements' });
    ui.up = h('button', { class: 'icon-btn fx-up', type: 'button', 'aria-label': 'Dossier parent', onclick: fxUp }, ic('up'));
    ui.crumbs = h('div', { class: 'fx-crumbs', 'aria-label': 'Chemin' });
    ui.head = h('div', { class: 'fx-head', 'aria-hidden': 'true' }, h('span', { text: 'Nom' }), h('span', { class: 'c2', text: 'Modifié le' }), h('span', { class: 'c3', text: 'Taille' }));
    ui.list = h('div', { class: 'fx-list', role: 'listbox', 'aria-label': 'Contenu du dossier' });
    ui.count = h('span', { class: 'fx-count' });
    ui.live = h('span', { class: 'fx-live', role: 'status', 'aria-live': 'polite' });
    ui.list.addEventListener('keydown', fxKeydown);
    body.appendChild(h('div', { class: 'fx' },
      ui.tools,
      h('div', { class: 'fx-main' }, ui.side, h('div', { class: 'fx-pane' }, h('div', { class: 'fx-path' }, ui.up, ui.crumbs), ui.head, ui.list)),
      h('div', { class: 'fx-status' }, ui.count, ui.live)));
    renderExplorer();
  }

  function renderExplorer(focus) {
    var ui = explorerUI;
    if (!ui) return;
    var inTrash = fx.folder === 'trash';
    if (!inTrash && !(FS.nodes.has(fx.folder) && fsAlive(fx.folder))) fx.folder = FS.docs;
    var items = fxItems();
    if (fx.sel && !items.some(function (n) { return n.id === fx.sel; })) fx.sel = null;

    // Emplacements
    clear(ui.side);
    var rootId = inTrash ? 'trash' : fsPath(fx.folder)[0].id;
    [[FS.docs, 'Documents', 'folder'], [FS.downloads, 'Téléchargements', 'download'], ['trash', 'Corbeille', 'trash']].forEach(function (p) {
      var cnt = p[0] === 'trash' ? fsTrashed().length : null;
      ui.side.appendChild(h('button', {
        class: 'fx-place' + (rootId === p[0] ? ' is-active' : ''), type: 'button', 'aria-current': rootId === p[0] ? 'true' : null, dataset: { place: p[0] === 'trash' ? 'trash' : 'folder' },
        onclick: function () { fx.folder = p[0]; fx.sel = null; renderExplorer(true); }
      }, ic(p[2]), h('span', { text: p[1] }), cnt ? h('span', { class: 'fx-badge', text: String(cnt) }) : null));
    });

    // Chemin
    clear(ui.crumbs);
    if (inTrash) ui.crumbs.appendChild(h('span', { class: 'fx-here', text: 'Corbeille' }));
    else fsPath(fx.folder).forEach(function (n, i, arr) {
      if (i) ui.crumbs.appendChild(h('span', { class: 'fx-sep', 'aria-hidden': 'true', text: '›' }));
      if (i === arr.length - 1) ui.crumbs.appendChild(h('span', { class: 'fx-here', 'aria-current': 'location', text: n.name }));
      else ui.crumbs.appendChild(h('button', { class: 'fx-crumb', type: 'button', text: n.name, onclick: function () { fx.folder = n.id; fx.sel = null; renderExplorer(true); } }));
    });
    var parentId = inTrash ? null : FS.nodes.get(fx.folder).parent;
    ui.up.disabled = parentId === null;

    // Liste
    clear(ui.list);
    if (!items.length) {
      ui.list.appendChild(h('p', { class: 'fx-empty', text: inTrash ? 'La corbeille est vide.' : 'Ce dossier est vide. Utilisez « Nouveau fichier » ou « Nouveau dossier ».' }));
    }
    items.forEach(function (n, i) {
      var isSel = n.id === fx.sel;
      var tab = isSel || (!fx.sel && i === 0) ? '0' : '-1';
      var origin = inTrash && n.trashedFrom !== null && FS.nodes.has(n.trashedFrom) ? 'Depuis : ' + fsPathText(n.trashedFrom) : '';
      ui.list.appendChild(h('button', {
        class: 'fx-row' + (isSel ? ' is-active' : ''), type: 'button', role: 'option', 'aria-selected': isSel ? 'true' : 'false', tabindex: tab,
        dataset: { id: n.id, type: n.type },
        onclick: function () { fxSelect(n.id); },
        ondblclick: function () { fxOpen(n.id); }
      }, h('span', { class: 'c1' }, ic(n.type === 'folder' ? 'folder' : 'file'), h('span', { class: 'nm', text: n.name })),
        h('span', { class: 'c2', text: origin || fmtFileDate.format(new Date(n.modified)) }),
        h('span', { class: 'c3', text: n.type === 'folder' ? '—' : fmtSize(n.content) })));
    });
    renderExplorerTools(items);
    if (focus) {
      var target = $('.fx-row.is-active', ui.list) || $('.fx-row', ui.list);
      if (target) target.focus();
    }
  }

  function renderExplorerTools(items) {
    var ui = explorerUI;
    if (!ui) return;
    items = items || fxItems();
    var inTrash = fx.folder === 'trash', n = fxSelNode();
    var movable = !!n && !n.system && !inTrash;
    var clipOk = !!FS.clip && FS.nodes.has(FS.clip.id) && fsAlive(FS.clip.id);
    var show = { newFolder: !inTrash, newFile: !inTrash, open: !inTrash, rename: !inTrash, copy: !inTrash, cut: !inTrash, paste: !inTrash, del: !inTrash, import: !inTrash, restore: inTrash, purge: inTrash, empty: inTrash };
    var enable = { newFolder: true, newFile: true, open: !!n, rename: movable, copy: movable, cut: movable, paste: clipOk, del: movable, import: true, restore: !!n, purge: !!n, empty: items.length > 0 };
    Object.keys(ui.btn).forEach(function (k) { ui.btn[k].hidden = !show[k]; ui.btn[k].disabled = !enable[k]; });
    $$('.fx-row', ui.list).forEach(function (r) {
      var on = r.dataset.id === fx.sel;
      r.classList.toggle('is-active', on); r.setAttribute('aria-selected', on ? 'true' : 'false'); r.tabIndex = on ? 0 : -1;
    });
    ui.count.textContent = items.length + (items.length > 1 ? ' éléments' : ' élément') + (n ? ' · « ' + n.name + ' » sélectionné' : '');
  }

  function fxSelect(id) { fx.sel = id; renderExplorerTools(); }
  function fxFocusId(id) {
    var r = explorerUI && $('.fx-row[data-id="' + id + '"]', explorerUI.list);
    if (r) { fx.sel = id; renderExplorerTools(); r.focus(); }
  }
  function fxUp() {
    if (fx.folder === 'trash') return;
    var p = FS.nodes.get(fx.folder).parent;
    if (p !== null) { var from = fx.folder; fx.folder = p; fx.sel = from; renderExplorer(true); }
  }
  function fxOpen(id) {
    var n = FS.nodes.get(id);
    if (!n) return;
    if (fx.folder === 'trash') { fxSay('Restaurez cet élément pour pouvoir l’ouvrir.'); return; }
    if (n.type === 'folder') { fx.folder = n.id; fx.sel = null; renderExplorer(true); }
    else openFileInNotepad(n.id);
  }
  function fxKeydown(e) {
    var ui = explorerUI, rows = $$('.fx-row', ui.list), i = rows.indexOf(document.activeElement), k = e.key;
    var mod = e.ctrlKey || e.metaKey;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      var j = Math.max(0, Math.min(rows.length - 1, (i < 0 ? 0 : i) + (k === 'ArrowDown' ? 1 : -1)));
      if (rows[j]) fxFocusId(rows[j].dataset.id);
    } else if (k === 'Enter') { e.preventDefault(); if (fx.sel) fxOpen(fx.sel); }
    else if (k === 'Delete') { e.preventDefault(); if (fx.folder === 'trash') fxPurge(); else fxDelete(); }
    else if (k === 'F2') { e.preventDefault(); fxRename(); }
    else if (k === 'Backspace') { e.preventDefault(); fxUp(); }
    else if (mod && (k === 'c' || k === 'C')) { e.preventDefault(); fxClip('copy'); }
    else if (mod && (k === 'x' || k === 'X')) { e.preventDefault(); fxClip('cut'); }
    else if (mod && (k === 'v' || k === 'V')) { e.preventDefault(); fxPaste(); }
  }

  function fxNameValidator(exceptId) {
    return function (v) {
      var nm = cleanName(v.input), e = fsCheckName(nm);
      if (e) return e;
      var clash = fsFind(fx.folder, nm);
      if (clash && clash.id !== exceptId) return 'Un élément porte déjà ce nom dans ce dossier.';
      return '';
    };
  }
  function fxNewFolder() {
    if (fsFull()) { fxSay('Espace plein : supprimez des éléments avant d’en créer.'); return; }
    ask({ title: 'Nouveau dossier', message: 'Il sera créé dans « ' + fsPathText(fx.folder) + ' ».', input: { label: 'Nom du dossier', value: fsUnique(fx.folder, 'Nouveau dossier') },
      buttons: [{ label: 'Créer', value: 'ok', kind: 'primary' }, BTN_CANCEL], validate: fxNameValidator(null) }).then(function (r) {
      if (r.action !== 'ok') return;
      var n = fsAdd(fx.folder, cleanName(r.input), 'folder');
      fx.sel = n.id; fxRefresh(true); fxSay('Dossier « ' + n.name + ' » créé. Double-cliquez dessus pour l’ouvrir.');
    });
  }
  function fxNewFile() {
    if (fsFull()) { fxSay('Espace plein : supprimez des éléments avant d’en créer.'); return; }
    ask({ title: 'Nouveau fichier', message: 'Il sera créé dans « ' + fsPathText(fx.folder) + ' ». L’extension .txt est ajoutée si vous n’en saisissez pas.',
      input: { label: 'Nom du fichier', value: fsUnique(fx.folder, 'Nouveau document.txt') },
      buttons: [{ label: 'Créer', value: 'ok', kind: 'primary' }, BTN_CANCEL],
      validate: function (v) { return fxNameValidator(null)({ input: withExt(cleanName(v.input)) }); } }).then(function (r) {
      if (r.action !== 'ok') return;
      var n = fsAdd(fx.folder, withExt(cleanName(r.input)), 'file', '');
      fx.sel = n.id; fxRefresh(true); fxSay('Fichier « ' + n.name + ' » créé (vide). Choisissez « Ouvrir » pour y écrire dans le Bloc-notes.');
    });
  }
  function fxRename() {
    var n = fxSelNode();
    if (!n || n.system || fx.folder === 'trash') return;
    ask({ title: 'Renommer', message: 'Nouveau nom pour « ' + n.name + ' ».', input: { label: 'Nom', value: n.name },
      buttons: [{ label: 'Renommer', value: 'ok', kind: 'primary' }, BTN_CANCEL], validate: fxNameValidator(n.id) }).then(function (r) {
      if (r.action !== 'ok') return;
      n.name = cleanName(r.input); n.modified = Date.now();
      fxRefresh(true); fxSay('Renommé en « ' + n.name + ' ».');
    });
  }
  function fxClip(mode) {
    var n = fxSelNode();
    if (!n || n.system || fx.folder === 'trash') return;
    FS.clip = { id: n.id, mode: mode };
    renderExplorerTools();
    fxSay('« ' + n.name + ' » ' + (mode === 'copy' ? 'copié' : 'coupé') + '. Ouvrez un dossier puis choisissez « Coller ».');
  }
  function fxPaste() {
    var c = FS.clip;
    if (!c || fx.folder === 'trash' || !FS.nodes.has(c.id) || !fsAlive(c.id)) return;
    var src = FS.nodes.get(c.id);
    if (src.type === 'folder' && fsWithin(fx.folder, src.id)) { fxSay('Impossible : on ne peut pas coller un dossier dans lui-même.'); return; }
    if (c.mode === 'copy') {
      if (fsFull()) { fxSay('Espace plein : supprimez des éléments avant de coller.'); return; }
      var cp = fsCopy(src.id, fx.folder);
      fx.sel = cp.id; fxRefresh(true); fxSay('« ' + cp.name + ' » collé.');
    } else {
      if (src.parent === fx.folder) { FS.clip = null; renderExplorerTools(); fxSay('L’élément est déjà dans ce dossier.'); return; }
      src.parent = fx.folder; src.name = fsUnique(fx.folder, src.name, src.id); src.modified = Date.now();
      FS.clip = null; fx.sel = src.id; fxRefresh(true); fxSay('« ' + src.name + ' » déplacé ici.');
    }
  }
  function fxDelete() {
    var n = fxSelNode();
    if (!n || n.system || fx.folder === 'trash') return;
    fsTrash(n.id);
    if (FS.clip && FS.clip.id === n.id) FS.clip = null;
    fx.sel = null; fxRefresh(true);
    fxSay('« ' + n.name + ' » est dans la Corbeille. Vous pouvez le restaurer tant que la corbeille n’est pas vidée.');
  }
  function fxRestore() {
    var n = fxSelNode();
    if (!n || fx.folder !== 'trash') return;
    var r = fsRestore(n.id);
    fx.sel = null; fxRefresh(true); fxSay('« ' + r.name + ' » restauré dans « ' + fsPathText(r.parent) + ' ».');
  }
  function fxPurge() {
    var n = fxSelNode();
    if (!n || fx.folder !== 'trash') return;
    ask({ title: 'Supprimer définitivement ?', message: '« ' + n.name + ' » sera supprimé pour de bon : il ne pourra plus être restauré.', buttons: [{ label: 'Supprimer définitivement', value: 'ok', kind: 'danger' }, BTN_CANCEL] }).then(function (r) {
      if (r.action !== 'ok') return;
      fsPurge(n.id); fx.sel = null; fxRefresh(true); fxSay('Supprimé définitivement.');
    });
  }
  function fxEmptyTrash() {
    var list = fsTrashed();
    if (!list.length) return;
    ask({ title: 'Vider la corbeille ?', message: list.length + (list.length > 1 ? ' éléments seront supprimés' : ' élément sera supprimé') + ' définitivement.', buttons: [{ label: 'Vider la corbeille', value: 'ok', kind: 'danger' }, BTN_CANCEL] }).then(function (r) {
      if (r.action !== 'ok') return;
      list.forEach(function (n) { fsPurge(n.id); }); fx.sel = null; fxRefresh(true); fxSay('Corbeille vidée.');
    });
  }
  function fxImportChosen() {
    var input = explorerUI && explorerUI.fileInput, f = input && input.files && input.files[0];
    if (!f) return;
    input.value = '';
    if (fsFull()) { fxSay('Espace plein : supprimez des éléments avant d’importer.'); return; }
    if (f.size > 200000) { fxSay('Fichier trop volumineux (200 Ko au maximum).'); return; }
    if (!/\.(txt|md|csv|log|json)$/i.test(f.name) && !/^text\//.test(f.type)) { fxSay('Seuls les fichiers texte sont acceptés (.txt, .md, .csv, .log, .json).'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || '');
      if (text.indexOf('\u0000') !== -1 || text.length > FILE_MAX) { fxSay('Ce fichier n’est pas un texte simple ou il est trop long.'); return; }
      var name = fsUnique(fx.folder, cleanName(f.name.replace(NAME_BAD, '_')).slice(0, 60) || 'Import.txt');
      var n = fsAdd(fx.folder, name, 'file', text);
      fx.sel = n.id; fxRefresh(true); fxSay('« ' + n.name + ' » importé. Le fichier reste sur votre appareil : rien n’est envoyé.');
    };
    reader.onerror = function () { fxSay('Lecture impossible.'); };
    reader.readAsText(f);
  }

  /* ---------- Bloc-notes ---------- */
  function openFileInNotepad(id) {
    var node = FS.nodes.get(id);
    if (!node || node.type !== 'file') return;
    var existed = wm.wins.has('notepad');
    openApp('notepad');
    if (!existed) { npLoad(node); return; }
    npGuard().then(function (ok) { if (ok) npLoad(node); });
  }
  function npLoad(node) {
    np.fileId = node.id; np.name = node.name; np.text = node.content; np.dirty = false;
    if (npUI) { npUI.ta.value = np.text; npUI.ta.scrollTop = 0; npUI.ta.setSelectionRange(0, 0); npUI.ta.focus(); }
    renderNp();
  }
  function npNode() { return np.fileId && FS.nodes.has(np.fileId) && fsAlive(np.fileId) ? FS.nodes.get(np.fileId) : null; }
  function npSay(text) {
    if (npUI) { npUI.msg.textContent = text; setTimeout(function () { if (npUI && npUI.msg.textContent === text) npUI.msg.textContent = ''; }, 6000); }
  }
  function npGuard() {
    if (!np.dirty) return Promise.resolve(true);
    return ask({ title: 'Enregistrer les modifications ?', message: 'Le document « ' + np.name + ' » contient des modifications non enregistrées.',
      buttons: [{ label: 'Enregistrer', value: 'save', kind: 'primary' }, { label: 'Ne pas enregistrer', value: 'discard', kind: 'danger', skipValidate: true }, BTN_CANCEL] }).then(function (r) {
      if (r.action === 'save') return npSave();
      return r.action === 'discard';
    });
  }
  function npNew() {
    npGuard().then(function (ok) {
      if (!ok) return;
      np = Object.assign(freshNp(), { wrap: np.wrap, size: np.size });
      if (npUI) { npUI.ta.value = ''; npUI.ta.focus(); }
      renderNp(); npSay('Nouveau document vide.');
    });
  }
  function npOpenDialog() {
    npGuard().then(function (ok) {
      if (!ok) return;
      var files = fsAllFiles();
      if (!files.length) { npSay('Aucun fichier à ouvrir : créez-en un dans Documents.'); return; }
      ask({ title: 'Ouvrir un fichier', message: 'Choisissez un fichier texte de votre espace fictif.', select: { label: 'Fichier', options: files, value: np.fileId || files[0].value },
        buttons: [{ label: 'Ouvrir', value: 'ok', kind: 'primary' }, BTN_CANCEL] }).then(function (r) {
        if (r.action === 'ok' && FS.nodes.has(r.select)) npLoad(FS.nodes.get(r.select));
      });
    });
  }
  function npSave() {
    var node = npNode();
    if (!node) return npSaveAs();
    node.content = np.text; node.modified = Date.now(); np.dirty = false;
    fxRefresh(); npSay('Enregistré dans « ' + fsPathText(node.parent) + ' ».');
    return Promise.resolve(true);
  }
  function npSaveAs() {
    var folders = fsFolderChoices();
    var cur = npNode() ? npNode().parent : (fx.folder !== 'trash' && FS.nodes.has(fx.folder) && fsAlive(fx.folder) ? fx.folder : FS.docs);
    return ask({
      title: 'Enregistrer sous', message: 'Choisissez un nom et un dossier. L’extension .txt est ajoutée si vous n’en saisissez pas.',
      input: { label: 'Nom du fichier', value: np.name }, select: { label: 'Dossier', options: folders, value: cur },
      buttons: [{ label: 'Enregistrer', value: 'ok', kind: 'primary' }, BTN_CANCEL],
      validate: function (v) {
        var nm = cleanName(v.input), e = fsCheckName(nm);
        if (e) return e;
        var hit = fsFind(v.select, withExt(nm));
        return hit && hit.type === 'folder' ? 'Un dossier porte déjà ce nom.' : '';
      }
    }).then(function (r) {
      if (r.action !== 'ok') return false;
      var name = withExt(cleanName(r.input)), dest = r.select, hit = fsFind(dest, name);
      function commit(node) {
        node.content = np.text; node.modified = Date.now(); np.fileId = node.id; np.name = node.name; np.dirty = false;
        fxRefresh(); npSay('Enregistré dans « ' + fsPathText(node.parent) + ' ».'); return true;
      }
      if (hit && hit.id === np.fileId) return commit(hit);
      if (hit) {
        return ask({ title: 'Remplacer le fichier ?', message: '« ' + name + ' » existe déjà dans « ' + fsPathText(dest) + ' ». Voulez-vous le remplacer ?', buttons: [{ label: 'Remplacer', value: 'ok', kind: 'danger' }, BTN_CANCEL] })
          .then(function (c) { return c.action === 'ok' ? commit(hit) : false; });
      }
      if (fsFull()) { npSay('Espace plein : supprimez des éléments avant d’enregistrer.'); return false; }
      return commit(fsAdd(dest, name, 'file', ''));
    });
  }
  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function npDownload() {
    saveBlob(new Blob([np.text], { type: 'text/plain;charset=utf-8' }), np.name);
    npSay('Une copie de « ' + np.name + ' » a été téléchargée sur votre appareil.');
  }

  function buildNotepad(body) {
    var ui = npUI = {};
    function tb(label, icon, fn, extra) { return h('button', Object.assign({ class: 'btn btn-small', type: 'button', onclick: fn }, extra || {}), icon ? ic(icon) : null, label ? h('span', { text: label }) : null); }
    ui.docName = h('strong', { class: 'np-name' });
    ui.state = h('span', { class: 'np-state' });
    ui.where = h('span', { class: 'np-where muted' });
    ui.wrapBtn = tb('Retour à la ligne', null, function () { np.wrap = !np.wrap; renderNp(); }, { 'aria-pressed': 'true' });
    ui.msg = h('span', { class: 'np-msg', role: 'status', 'aria-live': 'polite' });
    ui.pos = h('span', { class: 'np-pos' });
    ui.ta = h('textarea', { class: 'np-text', 'aria-label': 'Contenu du document', spellcheck: 'false', placeholder: 'Écrivez ici… Pensez à enregistrer (Ctrl + S).', maxlength: String(FILE_MAX) });
    ui.ta.value = np.text;
    ui.ta.addEventListener('input', function () { np.text = ui.ta.value; np.dirty = true; renderNp(); });
    ['keyup', 'click', 'select'].forEach(function (ev) { ui.ta.addEventListener(ev, renderNpStatus); });
    ui.ta.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); npSave(); } });
    body.appendChild(h('div', { class: 'np' },
      h('div', { class: 'np-tools', role: 'toolbar', 'aria-label': 'Actions du Bloc-notes' },
        tb('Nouveau', 'plus', npNew), tb('Ouvrir…', 'folder', npOpenDialog), tb('Enregistrer', 'save', function () { npSave(); }, { dataset: { act: 'save' } }),
        tb('Enregistrer sous…', 'save', function () { npSaveAs(); }, { dataset: { act: 'saveas' } }), tb('Télécharger', 'download', npDownload, { dataset: { act: 'download' } }),
        h('span', { class: 'np-sep', 'aria-hidden': 'true' }),
        tb('A−', null, function () { np.size = Math.max(0, np.size - 1); renderNp(); }, { 'aria-label': 'Réduire la taille du texte' }),
        tb('A+', null, function () { np.size = Math.min(NP_SIZES.length - 1, np.size + 1); renderNp(); }, { 'aria-label': 'Agrandir la taille du texte' }), ui.wrapBtn),
      h('div', { class: 'np-info' }, ui.docName, ui.state, ui.where),
      ui.ta,
      h('div', { class: 'np-status' }, ui.pos, ui.msg)));
    renderNp();
  }
  function renderNpStatus() {
    if (!npUI) return;
    var ta = npUI.ta, before = ta.value.slice(0, ta.selectionStart);
    var line = before.split('\n').length, col = before.length - before.lastIndexOf('\n');
    var words = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    npUI.pos.textContent = 'Ligne ' + line + ', colonne ' + col + ' · ' + ta.value.length + (ta.value.length > 1 ? ' caractères' : ' caractère') + ' · ' + words + (words > 1 ? ' mots' : ' mot');
  }
  function renderNp() {
    if (!npUI) return;
    var node = npNode();
    if (node) np.name = node.name;
    npUI.docName.textContent = np.name;
    npUI.state.textContent = np.dirty ? 'Modifications non enregistrées' : (node ? 'Enregistré' : 'Nouveau document');
    npUI.state.className = 'np-state ' + (np.dirty ? 'is-dirty' : 'is-saved');
    npUI.where.textContent = node ? 'Dossier : ' + fsPathText(node.parent) : (np.fileId ? 'Ce fichier a été supprimé : enregistrez-le à nouveau.' : 'Pas encore enregistré dans un dossier.');
    npUI.ta.style.fontSize = NP_SIZES[np.size] + 'rem';
    npUI.ta.style.whiteSpace = np.wrap ? 'pre-wrap' : 'pre';
    npUI.ta.setAttribute('wrap', np.wrap ? 'soft' : 'off');
    npUI.wrapBtn.setAttribute('aria-pressed', np.wrap ? 'true' : 'false');
    var w = wm.wins.get('notepad');
    if (w) { var t = $('.ttl', w.el); if (t) t.textContent = (np.dirty ? '● ' : '') + np.name + ' — Bloc-notes'; }
    renderNpStatus();
  }

  /* ======================================================================
     Attestation de réussite (à partir de 50 % de bonnes réponses)
     ====================================================================== */
  var fmtDateLegal = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  function passMark(total) { return Math.ceil(total / 2); }
  function attestName(raw) { return cleanName(String(raw || '').replace(/[\u0000-\u001f]/g, '')).slice(0, 60); }

  function attestSvg(m) {
    var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
    var ff = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
    var name = m.name || 'Participant(e)';
    var ns = name.length > 40 ? 28 : name.length > 28 ? 36 : 46;
    function t(y, size, weight, fill, text, spacing) {
      return '<text x="500" y="' + y + '" text-anchor="middle" font-family="' + ff + '" font-size="' + size + '" font-weight="' + weight + '" fill="' + fill + '"' + (spacing ? ' letter-spacing="' + spacing + '"' : '') + '>' + esc(text) + '</text>';
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700" role="img" aria-label="Attestation de réussite EITT">' +
      '<rect width="1000" height="700" fill="#ffffff"/>' +
      '<rect x="24" y="24" width="952" height="652" fill="none" stroke="#0a9fb4" stroke-width="6"/>' +
      '<rect x="42" y="42" width="916" height="616" fill="none" stroke="#0b1a3a" stroke-opacity=".35" stroke-width="1.5"/>' +
      t(122, 60, 800, '#0b1a3a', 'EITT', 10) +
      t(158, 19, 500, '#3b4b6b', 'Enseignement Informatique pour Toutes et Tous') +
      '<rect x="440" y="178" width="120" height="4" fill="#0a9fb4"/>' +
      t(244, 38, 700, '#0a7f92', 'ATTESTATION DE RÉUSSITE', 3) +
      t(300, 20, 400, '#3b4b6b', 'décernée à') +
      t(372, ns, 700, '#0b1a3a', name) +
      '<rect x="220" y="392" width="560" height="2" fill="#0b1a3a" fill-opacity=".4"/>' +
      t(446, 22, 400, '#0b1a3a', 'pour avoir réussi la simulation « EITT Phishing Lab »') +
      t(486, 24, 700, '#0b1a3a', m.correct + ' bonnes réponses sur ' + m.total + ' (' + m.pct + ' %)') +
      t(526, 22, 400, '#0b1a3a', 'et démontré qu’il ou elle sait repérer les principaux') +
      t(556, 22, 400, '#0b1a3a', 'signaux d’un message d’hameçonnage.') +
      t(604, 20, 600, '#0b1a3a', 'Délivrée le ' + m.date) +
      t(640, 14, 400, '#55627f', 'Attestation pédagogique, délivrée à l’issue d’une simulation entièrement fictive.') +
      t(660, 14, 400, '#55627f', 'Elle ne constitue ni un diplôme ni une certification officielle.') +
      '</svg>';
  }

  function buildAttestation(correct, total, pct) {
    var need = passMark(total);
    if (correct < need) {
      return h('section', { class: 'card rep-section attest-miss' }, h('h2', { text: 'Attestation de réussite' }),
        h('p', { text: 'L’attestation EITT est délivrée à partir de 50 % de bonnes réponses, soit au moins ' + need + ' sur ' + total + ' pour cette série (par exemple 5 sur 10 ou 10 sur 20). Il vous en manque ' + (need - correct) + '.' }),
        h('p', { class: 'muted', text: 'Relisez les corrections ci-dessous, puis recommencez : vous pourrez aussi choisir une autre taille de série.' }));
    }
    var model = { name: '', correct: correct, total: total, pct: pct, date: fmtDateLegal.format(new Date()) };
    var nameOut = h('p', { class: 'attest-name', text: 'Participant(e)' });
    var input = h('input', { type: 'text', id: 'attest-name', class: 'field', maxlength: '60', autocomplete: 'off', placeholder: 'Ex. : Prénom Nom', 'aria-describedby': 'attest-help' });
    input.addEventListener('input', function () { model.name = attestName(input.value); nameOut.textContent = model.name || 'Participant(e)'; });
    var cert = h('article', { class: 'attest', 'aria-label': 'Attestation de réussite' },
      h('div', { class: 'attest-brand' }, h('span', { class: 'attest-eitt', text: 'EITT' }), h('span', { class: 'attest-org', text: 'Enseignement Informatique pour Toutes et Tous' })),
      h('h3', { class: 'attest-title', text: 'Attestation de réussite' }),
      h('p', { class: 'attest-small', text: 'décernée à' }), nameOut,
      h('p', { text: 'pour avoir réussi la simulation « EITT Phishing Lab »' }),
      h('p', { class: 'attest-score', text: correct + ' bonnes réponses sur ' + total + ' (' + pct + ' %)' }),
      h('p', { text: 'et démontré qu’il ou elle sait repérer les principaux signaux d’un message d’hameçonnage.' }),
      h('p', { class: 'attest-date', text: 'Délivrée le ' + model.date }),
      h('p', { class: 'attest-fine', text: 'Attestation pédagogique, délivrée à l’issue d’une simulation entièrement fictive. Elle ne constitue ni un diplôme ni une certification officielle.' }));
    return h('section', { class: 'card rep-section attest-block' },
      h('div', { class: 'attest-tools' },
        h('h2', { text: 'Bravo, voici votre attestation de réussite' }),
        h('p', { text: correct + ' bonnes réponses sur ' + total + ' : vous avez atteint le seuil de 50 % (au moins ' + need + ' sur ' + total + '). Vous avez compris les réflexes essentiels pour repérer un message piégé.' }),
        h('label', { class: 'attest-label', for: 'attest-name', text: 'Nom à inscrire sur l’attestation (facultatif)' }), input,
        h('p', { class: 'muted', id: 'attest-help', text: 'Ce nom reste sur votre appareil : il n’est ni envoyé ni enregistré.' }),
        h('div', { class: 'rep-actions' },
          h('button', { class: 'btn btn-primary', type: 'button', id: 'attest-print', onclick: function () { window.print(); } }, ic('file'), 'Imprimer ou enregistrer en PDF'),
          h('button', { class: 'btn', type: 'button', id: 'attest-dl', onclick: function () { saveBlob(new Blob([attestSvg(model)], { type: 'image/svg+xml;charset=utf-8' }), 'attestation-EITT-Phishing-Lab.svg'); } }, ic('download'), 'Télécharger l’attestation (image)'))),
      cert);
  }

  /* ======================================================================
     Calculatrice
     ====================================================================== */
  function buildCalc(body) {
    var c = { cur: '0', acc: null, op: null, fresh: true, expr: '', err: '' };
    var out = h('output', { class: 'calc-out', 'aria-live': 'polite' });
    var hist = h('div', { class: 'calc-hist', 'aria-hidden': 'true' });
    function fmt(v) { return String(v).replace('.', ','); }
    function render() {
      out.textContent = c.err || fmt(c.cur);
      hist.textContent = c.expr;
    }
    function num(v) { return parseFloat(Number(v).toPrecision(12)); }
    function apply(a, b, op) {
      if (op === '+') return a + b;
      if (op === '−') return a - b;
      if (op === '×') return a * b;
      if (op === '÷') return b === 0 ? null : a / b;
      return b;
    }
    function press(k) {
      if (c.err && k !== 'C') { return; }
      if (/^[0-9]$/.test(k)) {
        if (c.fresh) { c.cur = k; c.fresh = false; }
        else if (c.cur.replace(/[-.]/g, '').length < 14) c.cur = c.cur === '0' ? k : c.cur + k;
      } else if (k === ',') {
        if (c.fresh) { c.cur = '0.'; c.fresh = false; } else if (c.cur.indexOf('.') === -1) c.cur += '.';
      } else if (k === 'C') { c = { cur: '0', acc: null, op: null, fresh: true, expr: '', err: '' }; }
      else if (k === '⌫') {
        if (!c.fresh) { c.cur = c.cur.length > 1 && !(c.cur.length === 2 && c.cur[0] === '-') ? c.cur.slice(0, -1) : '0'; }
      } else if (k === '±') { if (c.cur !== '0') c.cur = c.cur[0] === '-' ? c.cur.slice(1) : '-' + c.cur; }
      else if (k === '%') { c.cur = String(num(parseFloat(c.cur) / 100)); c.fresh = true; }
      else if (k === '=') {
        if (c.op !== null) {
          var r = apply(c.acc, parseFloat(c.cur), c.op);
          if (r === null) { c.err = 'Division par zéro impossible'; c.expr = ''; }
          else { c.expr = fmt(c.acc) + ' ' + c.op + ' ' + fmt(c.cur) + ' ='; c.cur = String(num(r)); }
          c.acc = null; c.op = null; c.fresh = true;
        }
      } else if (k === '+' || k === '−' || k === '×' || k === '÷') {
        if (c.op !== null && !c.fresh) {
          var r2 = apply(c.acc, parseFloat(c.cur), c.op);
          if (r2 === null) { c.err = 'Division par zéro impossible'; c.expr = ''; c.acc = null; c.op = null; c.fresh = true; render(); return; }
          c.cur = String(num(r2));
        }
        c.acc = parseFloat(c.cur); c.op = k; c.fresh = true; c.expr = fmt(c.acc) + ' ' + k;
      }
      render();
    }
    var KEYS = [['C', 'fn'], ['⌫', 'fn'], ['%', 'fn'], ['÷', 'op'], ['7'], ['8'], ['9'], ['×', 'op'], ['4'], ['5'], ['6'], ['−', 'op'], ['1'], ['2'], ['3'], ['+', 'op'], ['±', 'fn'], ['0'], [','], ['=', 'eq']];
    var NAMES = { 'C': 'Effacer tout', '⌫': 'Effacer le dernier chiffre', '÷': 'Diviser', '×': 'Multiplier', '−': 'Soustraire', '+': 'Additionner', '=': 'Égal', '±': 'Changer le signe', '%': 'Pour cent', ',': 'Virgule' };
    var grid = h('div', { class: 'calc-grid' });
    KEYS.forEach(function (k) {
      grid.appendChild(h('button', { class: 'calc-key ' + (k[1] || 'num'), type: 'button', 'aria-label': NAMES[k[0]] || null, dataset: { key: k[0] }, onclick: function () { press(k[0]); } }, k[0]));
    });
    var root = h('div', { class: 'calc', tabindex: '-1' }, h('div', { class: 'calc-screen' }, hist, out), grid);
    root.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (e.target.closest('button') && (k === 'Enter' || k === ' ')) return;
      var map = { '*': '×', '/': '÷', '-': '−', '.': ',', Enter: '=', Backspace: '⌫', Escape: 'C', Delete: 'C' };
      var key = map[k] || k;
      if (/^[0-9]$/.test(key) || ['+', '−', '×', '÷', ',', '=', '⌫', 'C', '%'].indexOf(key) !== -1) { e.preventDefault(); press(key); }
    });
    body.appendChild(root);
    render();
  }

  /* ======================================================================
     Centre de sécurité EITT (support pédagogique)
     ====================================================================== */
  function buildSecurity(body) {
    var pad = h('div', { class: 'app-pad' });
    pad.appendChild(h('div', { class: 'sec-head' }, appTile('security'), h('div', null, h('h2', { text: 'Centre de sécurité EITT' }), h('p', { class: 'muted', text: 'Sept bonnes pratiques pour repérer les messages piégés.' }))));
    var grid = h('div', { class: 'sec-grid' });
    PRACTICES.forEach(function (p, i) {
      grid.appendChild(h('div', { class: 'sec-item' }, h('span', { class: 'num', text: String(i + 1) }), h('div', null, h('strong', { text: p[0] }), h('p', { class: 'muted', text: p[1] }))));
    });
    pad.appendChild(grid);
    pad.appendChild(h('h3', { text: 'Six questions à se poser devant un message', style: null }));
    pad.lastChild.style.margin = '18px 0 8px';
    pad.appendChild(h('ul', null, CATS.map(function (c) { return h('li', null, h('strong', { text: c.label + ' — ' }), c.ask); })));
    pad.appendChild(h('p', { class: 'note', text: 'Le Centre de sécurité EITT est un support pédagogique. Il n’effectue aucune analyse antivirus et ne vérifie pas la sécurité de votre ordinateur.' }));
    body.appendChild(pad);
  }

  /* ======================================================================
     Bilan final
     ====================================================================== */
  function levelFor(pct) {
    if (pct >= 80) return { name: 'Bonne analyse', text: 'Vous croisez bien les indices avant de décider. Continuez à vérifier par un canal indépendant dès qu’une demande est sensible.' };
    if (pct >= 50) return { name: 'En progression', text: 'Vous repérez déjà plusieurs signaux. Entraînez-vous à croiser expéditeur, contexte et demande avant de trancher.' };
    return { name: 'Découverte', text: 'Vous découvrez les réflexes à adopter. Relisez les corrections et le Centre de sécurité, puis recommencez : c’est en s’entraînant qu’on progresse.' };
  }

  function showReport() {
    closeDialog($('#dlg-timer'));
    stopTicking();
    closeStartMenu();
    var total = data.scenarios.length;
    var correct = correctCount();
    var pct = Math.round(correct / total * 100);
    var phishTotal = data.scenarios.filter(function (s) { return s.isPhishing; }).length;
    var legitTotal = total - phishTotal;
    var phishOk = 0, legitOk = 0, clickedPhish = 0, msSum = 0, msN = 0;
    var missed = {}, falsePos = [], notDone = [], toReview = [];
    data.scenarios.forEach(function (s) {
      var d = state.decisions.get(s.id);
      if (d && d.correct) { if (s.isPhishing) phishOk += 1; else legitOk += 1; }
      if (d && d.ms) { msSum += d.ms; msN += 1; }
      if (!d) notDone.push(s);
      if (!d || !d.correct) toReview.push({ s: s, d: d });
      if (s.isPhishing && !(d && d.verdict === 'phishing')) {
        CATS.forEach(function (c) { if (s.analysis[c.key] && s.analysis[c.key].flag === 'alert') missed[c.key] = (missed[c.key] || 0) + 1; });
      }
      if (s.isPhishing && d && d.verdict === 'legit' && d.clickedLink) clickedPhish += 1;
      if (!s.isPhishing && d && d.verdict === 'phishing') falsePos.push(s);
    });
    var topMissed = Object.keys(missed).sort(function (a, b) { return missed[b] - missed[a]; }).slice(0, 3);
    var level = levelFor(pct);

    var body = $('#report-body');
    clear(body);

    // Niveau
    var levels = h('div', { class: 'levels', 'aria-label': 'Niveaux pédagogiques indicatifs' },
      ['Découverte', 'En progression', 'Bonne analyse'].map(function (n) { return h('span', { class: n === level.name ? 'is-current' : '', text: n }); }));
    body.appendChild(h('section', { class: 'rep-level' },
      h('p', { class: 'muted', text: 'Niveau pédagogique indicatif' }), h('p', { class: 'lv', text: level.name }), h('p', { text: level.text }), levels));

    // Attestation (à partir de 50 % de bonnes réponses)
    body.appendChild(buildAttestation(correct, total, pct));

    // Chiffres
    var stat = function (v, l) { return h('div', { class: 'stat' }, h('span', { class: 'v', text: v }), h('span', { class: 'l', text: l })); };
    body.appendChild(h('div', { class: 'stats' },
      stat(correct + ' / ' + total, 'Bonnes réponses'),
      stat(correct + ' / ' + total, 'Score sur ' + total),
      stat(pct + ' %', 'Pourcentage de réussite'),
      stat(phishOk + ' / ' + phishTotal, 'Tentatives de phishing identifiées'),
      stat(legitOk + ' / ' + legitTotal, 'Messages légitimes reconnus'),
      stat(notDone.length ? String(notDone.length) : '0', 'Message(s) non analysé(s)')));

    // Indices manqués
    var miss = h('section', { class: 'card rep-section' }, h('h2', { text: 'Principaux indices manqués' }));
    if (topMissed.length) {
      miss.appendChild(h('ul', null, topMissed.map(function (k) {
        var cat = CATS.filter(function (c) { return c.key === k; })[0];
        return h('li', null, h('strong', { text: cat.label + ' ' }), '(' + missed[k] + ' message(s) piégé(s) concerné(s)). ' + ADVICE[k]);
      })));
    } else {
      miss.appendChild(h('p', { text: phishOk === phishTotal ? 'Aucun indice manqué : vous avez repéré tous les messages piégés. Bravo !' : 'Aucun indice manqué à signaler pour l’instant.' }));
    }
    body.appendChild(miss);

    // Messages à revoir
    var rev = h('section', { class: 'card rep-section' }, h('h2', { text: 'Messages à revoir' }));
    if (toReview.length) {
      var tbl = h('table', { class: 'rep-table' }, h('thead', null, h('tr', null, ['Message', 'Votre réponse', 'Réponse attendue', 'À retenir'].map(function (t) { return h('th', { scope: 'col', text: t }); }))),
        h('tbody', null, toReview.map(function (r) {
          var said = r.d ? (r.d.verdict === 'phishing' ? 'Phishing' : 'Légitime') : 'Non analysé';
          return h('tr', null, h('td', { text: r.s.subject }), h('td', { text: said }), h('td', { text: r.s.isPhishing ? 'Phishing' : 'Légitime' }), h('td', { text: r.s.summary }));
        })));
      rev.appendChild(h('div', { class: 'table-wrap' }, tbl));
    } else rev.appendChild(h('p', { text: 'Aucun message à revoir : toutes vos réponses sont correctes.' }));
    body.appendChild(rev);

    // Conseils personnalisés
    var tips = [];
    topMissed.forEach(function (k) { tips.push(ADVICE[k]); });
    if (falsePos.length) tips.push('Vous avez signalé ' + falsePos.length + ' message(s) légitime(s) : un lien, une date limite ou un ton sérieux ne suffisent pas à conclure. Cherchez plusieurs signaux qui concordent (expéditeur, contexte, demande).');
    if (clickedPhish) tips.push('Vous avez cliqué sur un lien de ' + clickedPhish + ' message(s) piégé(s) avant de décider : survolez d’abord les liens et ouvrez le service par son adresse habituelle.');
    if (notDone.length) tips.push(notDone.length + ' message(s) n’ont pas été analysés (vérifiez aussi la corbeille). Reprenez-les pour compléter votre entraînement.');
    if (msN) tips.push('Temps moyen par message analysé : ' + fmtDur(msSum / msN) + '. Ce temps est indicatif : prendre son temps pour vérifier est un bon réflexe.');
    tips.push('Relisez le Centre de sécurité EITT : les sept bonnes pratiques résument l’essentiel à retenir.');
    body.appendChild(h('section', { class: 'card rep-section' }, h('h2', { text: 'Conseils personnalisés' }), h('ul', null, tips.map(function (t) { return h('li', { text: t }); }))));

    body.appendChild(h('p', { class: 'disclaimer', text: 'Ce résultat mesure uniquement les réponses données dans cette simulation. Il ne constitue ni une certification ni une évaluation scientifique de votre compétence réelle.' }));
    if (data.meta && data.meta.stats === true) body.appendChild(h('p', { class: 'disclaimer', text: 'Cette installation enregistre uniquement des statistiques anonymes (score total), sans identifiant ni adresse IP.' }));

    var actions = h('div', { class: 'rep-actions' });
    if (notDone.length) actions.appendChild(h('button', { class: 'btn btn-ghost btn-lg', type: 'button', onclick: function () { showScreen('desktop'); startTicking(); openApp('mail'); } }, 'Continuer l’analyse'));
    actions.appendChild(h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: restart }, 'Recommencer'));
    actions.appendChild(h('button', { class: 'btn btn-ghost btn-lg', type: 'button', onclick: goHome }, 'Retourner à l’accueil'));
    body.appendChild(actions);

    showScreen('report');
    sendStats({ score: correct, total: total, phishing_ok: phishOk, legit_ok: legitOk, answered: decidedCount() });
  }

  function sendStats(summary) {
    if (state.statsSent || !data.meta || data.meta.stats !== true) return;
    state.statsSent = true;
    try {
      fetch('php/stats.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify(summary) }).catch(function () { /* ignoré */ });
    } catch (e) { /* ignoré */ }
  }

  /* ======================================================================
     Initialisation
     ====================================================================== */
  function init() {
    hydrateIcons(document);
    resetFiles();
    initCompose();

    // Dialogues : boutons de fermeture et clic sur le fond
    $$('dialog').forEach(function (dlg) {
      $$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { closeDialog(dlg); }); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg && dlg.id !== 'dlg-timer' && dlg.id !== 'dlg-ask' && dlg.id !== 'dlg-compose') closeDialog(dlg); });
    });

    $('#btn-launch').addEventListener('click', launch);
    $('#btn-how').addEventListener('click', function () { openDialog($('#dlg-how')); });
    $('#btn-signin').addEventListener('click', bootSequence);
    $('#btn-login-back').addEventListener('click', goHome);

    $('#btn-start').addEventListener('click', function (e) { e.stopPropagation(); toggleStartMenu(); });
    $('#startmenu').addEventListener('click', function (e) { e.stopPropagation(); });
    $('#sm-how').addEventListener('click', function () { closeStartMenu(); openDialog($('#dlg-how')); });
    $('#sm-restart').addEventListener('click', function () { closeStartMenu(); restart(); });
    $('#sm-home').addEventListener('click', function () { closeStartMenu(); goHome(); });
    document.addEventListener('click', function (e) { if (!$('#startmenu').hidden && !e.target.closest('#btn-start')) closeStartMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#startmenu').hidden) { closeStartMenu(); $('#btn-start').focus(); } });

    $('#toast-open').addEventListener('click', function () { hideToast(); openApp('mail'); });
    $('#toast-close').addEventListener('click', hideToast);

    $('#btn-timer').addEventListener('click', function () {
      state.timer.on = !state.timer.on;
      if (state.timer.on && (state.timer.expired || state.timer.remaining <= 0)) { state.timer.remaining = TIMER_START; state.timer.expired = false; }
      renderTimer();
    });
    $('#guide-close').addEventListener('click', function () { $('#guide').hidden = true; });

    tickClock();
    initBattery();
    $('#timer-continue').addEventListener('click', function () { state.timer.on = false; renderTimer(); closeDialog($('#dlg-timer')); });

    $('#reply-send').addEventListener('click', function () {
      closeDialog($('#dlg-reply'));
      if (replyForId) { var id = replyForId; replyForId = null; decide(id, 'legit', 'reply'); }
    });

    // Chargement des scénarios en arrière-plan
    data.promise = loadScenarios().then(function (ok) {
      if (ok) buildCountPicker();
      if (ok && data.meta && data.meta.stats === true) {
        $('.home-foot').appendChild(h('p', { class: 'muted', text: 'Cette installation enregistre uniquement des statistiques anonymes (score total), sans identifiant ni adresse IP.' }));
      }
      return ok;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
