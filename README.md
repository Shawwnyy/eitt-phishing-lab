# EITT Phishing Lab

**EITT — Enseignement Informatique pour Toutes et Tous**
*Une simulation pour apprendre à reconnaître les pièges du numérique.*

Simulateur immersif : l'utilisateur **choisit le nombre de messages** (5, 8, 10, 15 ou 20 : la banque fournie contient 20 scénarios), se connecte à un ordinateur fictif, ouvre sa boîte mail (environ la moitié de tentatives de phishing, le reste légitime), décide, puis découvre les indices, les conséquences simulées et, **à la fin seulement**, son bilan. HTML, CSS et JavaScript vanilla ; PHP et SQL sont **optionnels**.

* **Aucune limite de temps** : on lit à son rythme. Un chronomètre de 15 minutes existe, mais il est **désactivé par défaut** (bouton « Sans limite » en bas à droite) et ne sanctionne jamais.
* **Heure à la seconde et date réelles** : l'horloge de la barre des tâches (et celle de l'écran de connexion) suit l'heure de l'appareil (HH:MM:SS), recalée sur la seconde réelle.
* **Batterie de l'appareil** : le niveau (par exemple 100 %) et l'état de charge s'affichent en bas à droite et sur l'écran de connexion, grâce à l'API Battery du navigateur (Chrome, Edge, Opera, Android). Firefox et Safari ne la fournissent pas : l'application affiche alors « n/d » avec une explication, sans rien inventer. La valeur est lue sur place, jamais enregistrée ni envoyée.
* **Pourcentage de chargement** affiché sous la barre pendant l'ouverture de session ; écran de connexion « Utilisateur ou utilisatrice » ; icône Wi-Fi fictive.
* **Écrire un e-mail pour de faux** : « Nouveau message » dans le Courrier ouvre un éditeur (destinataire vérifié, objet, message, pièce jointe choisie dans Documents). « Envoyer (simulé) » range le message dans **Envoyés** ; fermer la fenêtre ou « Enregistrer le brouillon » le range dans **Brouillons**, où on peut le modifier, l'envoyer ou le supprimer. Rien n'est transmis. Des conseils apparaissent en direct si le texte contient un mot de passe, un numéro de carte, un IBAN, un code reçu par SMS ou un numéro de sécurité sociale.
* **Calculatrice** fonctionnelle (souris et clavier, virgule décimale, division par zéro gérée).
* **Bilan à la fin** : il n'y a plus de bouton « Voir le bilan » en cours de route ; le bilan s'ouvre quand tous les messages ont reçu une réponse.
* **Attestation de réussite EITT** : dès 50 % de bonnes réponses (5 sur 10, 10 sur 20, 3 sur 5, 8 sur 15…). Le nom est facultatif, saisi dans la page et jamais envoyé ni enregistré. On peut l'imprimer ou l'enregistrer en PDF (seule l'attestation est imprimée) ou la télécharger en image SVG. C'est une attestation pédagogique, pas un diplôme ni une certification officielle.
* **Vrais fichiers fictifs** : « Documents » est un explorateur qui fonctionne (nouveau dossier / fichier, ouvrir, renommer, copier, couper, coller, supprimer vers la Corbeille, restaurer, supprimer définitivement, vider, importer un fichier texte de son appareil) et le **Bloc-notes** écrit, enregistre (Ctrl + S), enregistre sous, ouvre, télécharge une vraie copie `.txt`, et prévient avant de perdre un texte non enregistré. Tout est en mémoire : rien n'est stocké ni envoyé, et les fichiers disparaissent au rechargement.
* **Explications partout** : encart « Votre mission » sur le bureau (masquable), guide « Comment analyser un message ? » dans le Courrier, bouton **Aide** dans le Courrier, notes expliquées dans Documents, correction détaillée après chaque choix.

> Tout est fictif : comptes, entreprises, adresses (domaines `.example`), pièces jointes. Aucun mot de passe ni donnée personnelle n'est demandé. Aucune donnée n'est collectée par défaut.

## Contenu

```text
eitt-phishing-lab/
├── index.html            Application (accueil, connexion simulée, bureau, courrier, Documents, Bloc-notes, bilan)
├── logo-demo.html        Démonstration du logo animé EITT (rejouer, pause, tailles)
├── css/
│   ├── style.css         Design EITT (noir / bleu nuit / cyan néon), responsive
│   └── logo.css          Logo animé (SVG + CSS), variables de vitesse
├── js/
│   ├── app.js            Application complète
│   ├── logo.js           Injecte le logo SVG animé dans [data-eitt-logo]
│   └── logo-demo.js      Boutons de la page de démonstration
├── data/
│   ├── scenarios.json    Les 10 scénarios (source de vérité)
│   └── scenarios.js      Copie générée, pour l'ouverture directe de index.html
├── php/
│   ├── scenarios.php     API en lecture seule (JSON ou MySQL), validation côté serveur
│   ├── stats.php         Statistiques anonymes — DÉSACTIVÉES par défaut
│   ├── db.php            Configuration, connexion PDO, nettoyage des scénarios
│   ├── config.sample.php Modèle de configuration (à copier en config.php)
│   └── build-data.php    Régénère data/scenarios.js et sql/seed.sql (ligne de commande)
├── sql/
│   ├── schema.sql        Tables MySQL / MariaDB (optionnel)
│   └── seed.sql          Insertion des 10 scénarios (généré)
├── .htaccess, php/.htaccess, sql/.htaccess   Réglages Apache (voir « Déploiement »)
└── README.md
```

## Lancer en local

Choisissez l'une des trois méthodes.

1. **Sans rien installer** : ouvrez `index.html` dans un navigateur récent (double-clic). Les scénarios sont lus dans `data/scenarios.js`.
2. **Avec PHP 8.0+** : dans le dossier du projet, `php -S localhost:8000`, puis ouvrez <http://localhost:8000>. Les scénarios passent par `php/scenarios.php`.
3. **Sans PHP** : `python3 -m http.server 8000`, puis <http://localhost:8000>. Les scénarios sont lus dans `data/scenarios.json` (la console du navigateur peut signaler un 404 pour `php/scenarios.php` : sans conséquence).

L'application essaie dans l'ordre : `php/scenarios.php`, puis `data/scenarios.json`, puis la copie embarquée `data/scenarios.js`.

## Déployer sur un hébergement PHP classique

1. Copiez tout le dossier par FTP/SFTP à la racine du site ou dans un sous-dossier. PHP 8.0 ou supérieur, extension `json` et `mbstring` (présentes sur la plupart des hébergements).
2. Apache : les fichiers `.htaccess` fournis (Apache 2.4) interdisent l'accès direct à `php/config.php`, `php/db.php`, `php/build-data.php` et au dossier `sql/`, désactivent la liste des dossiers et ajoutent quelques en-têtes de sécurité (si `mod_headers` est actif).
3. Nginx ou autre serveur sans `.htaccess` : bloquez vous-même l'accès à `sql/` et à `php/(config|config.sample|db|build-data).php`.
4. Servez le site en HTTPS.

Aucune base de données n'est nécessaire.

## Utiliser MySQL / MariaDB (optionnel)

1. Importez `sql/schema.sql`, puis `sql/seed.sql` (par exemple avec phpMyAdmin, ou `mysql < sql/schema.sql`).
2. Créez le compte à droits minimaux proposé en commentaire à la fin de `schema.sql` (SELECT sur `scenarios`, INSERT sur `anonymous_results`).
3. Copiez `php/config.sample.php` en `php/config.php`, renseignez la connexion et passez `'use_db' => true`.

Si la base est indisponible, `scenarios.php` retombe silencieusement sur `data/scenarios.json` (aucun détail d'erreur n'est exposé).

### Statistiques anonymes (désactivées par défaut)

Avec `'use_db' => true` **et** `'enable_stats' => true`, le score final (nombres seulement) est ajouté à `anonymous_results` : date du jour, score, bonnes réponses. Aucun identifiant, aucune adresse IP, aucun cookie, aucun user-agent. Un message l'indique alors à l'écran. Le point d'entrée vérifie la méthode, l'origine, le type de contenu, la taille et la cohérence des nombres.

## Choisir le nombre de messages

L'écran d'accueil propose 5, 8, 10 (puis 15 et 20) messages : les choix s'adaptent automatiquement à la taille de la banque `data/scenarios.json`. Le tirage est aléatoire et équilibré (moitié phishing, moitié légitimes, au besoin ±1), puis classé du plus récent au plus ancien d'après le champ `time`. **La banque fournie contient 20 scénarios** (10 de phishing, 10 légitimes, de difficulté 1 à 3). Pour proposer davantage de choix, ajoutez des scénarios (voir ci-dessous) ; les options apparaîtront d'elles-mêmes.

**Série imposée (mode formateur)** : ajoutez `?ids=` à l'adresse pour fixer les messages, par exemple `index.html?ids=s01,s05,s12,s15,s20`. Le sélecteur est alors remplacé par la mention de la série, et le seuil de l'attestation s'adapte.

## Modifier les scénarios

1. Éditez `data/scenarios.json` (chaque scénario : `time` au format « Aujourd'hui, 08:42 », « Hier, 17:40 » ou « Mer. 7 oct., 18:14 », expéditeur, objet, corps en blocs `p` / `list` / `link` / `btn` / `sig`, pièces jointes factices, `analysis` pour les six signaux, `summary`, `tips`, `consequences`).
2. Régénérez les fichiers dérivés : `php php/build-data.php` (met à jour `data/scenarios.js` et `sql/seed.sql`).
3. Si vous utilisez MySQL, réimportez `sql/seed.sql`.

Utilisez uniquement des domaines fictifs (`.example`, `example.com`) et n'usurpez aucune organisation réelle. Un scénario invalide est ignoré par le serveur.

## Logo animé EITT

Ouvrez `logo-demo.html`. Pour l'intégrer ailleurs :

```html
<link rel="stylesheet" href="css/logo.css">
<div class="eitt-logo--md" data-eitt-logo></div>      <!-- sm, md ou lg -->
<script src="js/logo.js"></script>
```

Réglages dans `css/logo.css` : couleurs (`--eitt-cyan`, `--eitt-text`…), vitesses (`--eitt-spin-hatch`, `--eitt-spin-ring`, `--eitt-spin-dots`, `--eitt-bars-cycle`), taille (`--eitt-logo-w`). Ajoutez `data-intro="false"` pour supprimer le scintillement d'intro. Avec « réduire les animations » activé dans le système, l'image finale statique s'affiche.

## Sécurité et confidentialité

* Aucun champ de saisie de mot de passe ni d'identifiant ; l'écran de connexion est un simple bouton.
* Aucune donnée enregistrée dans le navigateur (ni cookie, ni `localStorage`) : fichiers, textes du Bloc-notes et nom de l'attestation restent en mémoire le temps de la page.
* Contenus dynamiques insérés avec `textContent` (jamais `innerHTML` sur des données) ; les liens des messages sont neutralisés : un clic ouvre une page locale du navigateur fictif, jamais un site externe.
* Politique CSP stricte dans les pages (`default-src 'self'`, aucun script ni style en ligne).
* Côté PHP : requêtes préparées, validation par liste blanche, nettoyage des scénarios (URL en `https://` uniquement, caractères de contrôle supprimés), méthodes HTTP contrôlées, erreurs non exposées.
* Aucune dépendance externe : ni CDN, ni police web, ni bibliothèque.

## Accessibilité

Utilisable au clavier (boutons natifs, focus visible, `Échap` ferme le menu Démarrer et les dialogues), fenêtres adaptées sur mobile (plein écran, sans déplacement), contrastes élevés, `prefers-reduced-motion` respecté, progression annoncée via `role="progressbar"`.

## Tests réalisés

Dans Chromium (Playwright) : **232 contrôles automatisés** (103 sur le parcours complet de la série d'origine, 81 sur fichiers / Bloc-notes / attestation / 5-20 messages, 48 sur l'horloge, la batterie, le chargement, la rédaction d'e-mails et la calculatrice), sans erreur ni avertissement dans la console.

* Accueil, dialogue « Comment ça fonctionne ? », connexion simulée, chargement, bureau, notification non bloquante, menu Démarrer.
* Fenêtres : ouvrir, réduire, restaurer depuis la barre des tâches, déplacer, fermer.
* Courrier : 20 messages disponibles (5 à 20 selon le choix), survol d'un lien (adresse réelle affichée), indices neutres, clic sur un lien (page locale « Lien neutralisé »), Répondre, Signaler, Supprimer / Restaurer, détails de l'en-tête (« Répondre à »), correction, conséquences simulées, score évolutif.
* Bilan : 7/10, 70 %, 3/5 phishing identifiés, 4/5 messages légitimes, niveau, indices manqués, conseils ; Recommencer et Retour à l'accueil.
* Horloge synchronisée : heure et date de l'appareil (écran de connexion et barre des tâches), avancement à la minute, passage à minuit. Pas de limite de temps par défaut (« Sans limite » après plusieurs heures simulées) ; chronomètre facultatif de 15 minutes : activation, décompte, désactivation, fin du temps sans sanction, redémarrage à 15:00.
* Choix du nombre de messages (5 / 8 / 10 / 15 / 20, indication du seuil), tirage sans doublon, boîte triée du plus récent au plus ancien, 20 messages distincts, tirage équilibré, absence de bouton « bilan » avant la fin.
* Attestation : délivrée à 3/5, 5/10 et 10/20, refusée à 2/5, 4/10 et 9/20 (avec le nombre de bonnes réponses manquantes), nom saisi échappé (aucune injection HTML), téléchargement SVG bien formé, impression PDF limitée à l'attestation sur une page.
* Horloge à la seconde (qui avance, change de jour), batterie simulée (87 %, 15 % faible, en charge, mise à jour en direct) et navigateur sans API Battery (« n/d »), pourcentage de chargement croissant, rédaction d'e-mails (validation, conseils de sécurité en direct, pièces jointes, envoyés, brouillons enregistrés automatiquement, modifiés, envoyés, supprimés), calculatrice (opérations, virgule, division par zéro, clavier), mobile 390 px.
* Fichiers : création avec validation (caractères interdits, doublons, vide), écriture et enregistrement dans le Bloc-notes, Ctrl + S, garde « Enregistrer les modifications ? », Enregistrer sous (autre dossier), téléchargement d'un vrai `.txt`, copier / couper / coller, renommer, dossiers imbriqués et fil d'Ariane, collage d'un dossier dans lui-même refusé, corbeille (restaurer, supprimer définitivement, vider), fichier supprimé pendant son édition, import (texte accepté, image refusée), clavier (flèches, F2, Échap), redémarrage = retour aux 7 fichiers d'origine, mobile 390 px.
* Explications : encart « Votre mission » (affiché, masquable), guide du Courrier (4 étapes) et bouton Aide, dialogue « Comment ça fonctionne ? » à jour.
* Mobile 390 px (tactile), tablette 820 px, ouverture directe `file://`, mouvement réduit, logo (pause, rejouer).
* PHP : lecture JSON, filtre de difficulté, rejet des paramètres invalides, méthodes interdites, mode base de données (testé avec SQLite via PDO), repli si la base est indisponible, statistiques anonymes (cas valides et refusés), nettoyage de scénarios piégés. `seed.sql` relu comme le ferait MySQL : charges utiles identiques aux sources.

## Limites et fonctionnalités simplifiées

* **MySQL / MariaDB réels non testés** : le schéma et l'import n'ont pas été exécutés sur un serveur MySQL (testé avec SQLite et par relecture du `seed.sql`).
* Navigateurs : testé dans Chromium seulement (non testé sur Firefox, Safari, ni sur un vrai téléphone ; mobile émulé). Les `@container` queries demandent un navigateur récent.
* Lecteurs d'écran : non testés.
* Le logo animé est une recréation vectorielle d'après la vidéo de référence : vitesses de rotation estimées à l'œil, forme des lettres dessinée à la main.
* Les fenêtres se déplacent à la souris ou au doigt sur grand écran, pas au clavier (les boutons Réduire / Agrandir / Fermer restent accessibles au clavier). Pas de redimensionnement des fenêtres.
* La progression et les fichiers créés ne sont pas sauvegardés : recharger la page recommence la simulation (choix voulu, par confidentialité). Le Bloc-notes permet de télécharger une copie, et Documents d'importer un fichier texte de son appareil.
* Les 10 scénarios ajoutés (s11 à s20) sont des créations originales, non relues par un pédagogue : à faire valider avant usage en formation.
* Les fichiers sont des textes simples (pas de dessin, pas de documents Word) ; 300 éléments au maximum, 100 000 caractères par fichier. Pas de glisser-déposer ni de sélection multiple.
* L'API Battery n'existe pas dans tous les navigateurs ni hors contexte sécurisé (https ou localhost) : sans elle, la batterie reste « n/d ». Elle n'a été testée qu'avec une batterie simulée (Chromium), pas sur un vrai appareil.
* Aucun e-mail n'est réellement envoyé : c'est un entraînement. Pas de destinataires multiples, de copie ni de mise en forme.
* L'impression de l'attestation dépend du navigateur (testé : PDF généré par Chromium) ; l'image SVG se rouvre dans n'importe quel navigateur.
* Le résultat n'est ni une certification ni une évaluation scientifique.

## Trois améliorations pour une future version

1. **Scénarios variés et niveaux** : une banque de 30 à 40 messages tirés au hasard par niveau, des variantes SMS et appels, et un mode « formateur » pour animer un atelier en groupe.
2. **Outil d'édition des scénarios** : une petite interface protégée pour créer, prévisualiser et valider des messages sans modifier le JSON à la main, avec contrôle automatique des domaines fictifs.
3. **Version téléchargeable et indicateurs de classe** : export PDF du bilan, et tableau de bord anonyme pour les formateurs (indices les plus manqués par séance), toujours sans donnée personnelle.
