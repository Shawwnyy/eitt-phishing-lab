<?php
/**
 * EITT Phishing Lab — configuration.
 *
 * Copiez ce fichier en « config.php » pour modifier les réglages.
 * Sans config.php, l'application fonctionne avec les valeurs par défaut :
 * scénarios lus dans data/scenarios.json, aucune base de données, aucune statistique.
 *
 * Ne versionnez jamais config.php s'il contient un mot de passe de base de données.
 */
return [
    // false : scénarios lus dans data/scenarios.json (par défaut, aucune base nécessaire)
    // true  : scénarios lus dans la table MySQL « scenarios » (voir sql/schema.sql et sql/seed.sql)
    'use_db' => false,

    // Connexion PDO (MySQL / MariaDB). Utilisez un compte dédié avec droits minimaux :
    //   SELECT sur « scenarios », INSERT sur « anonymous_results ».
    'db' => [
        'dsn'  => 'mysql:host=localhost;dbname=eitt_phishing_lab;charset=utf8mb4',
        'user' => 'eitt_lab',
        'pass' => 'changez-moi',
    ],

    // false par défaut. true : enregistre en fin de partie uniquement des chiffres agrégés et anonymes
    // (score, nombre de bonnes réponses) dans « anonymous_results ». Aucun identifiant, aucune adresse IP.
    // Nécessite 'use_db' => true.
    'enable_stats' => false,
];
