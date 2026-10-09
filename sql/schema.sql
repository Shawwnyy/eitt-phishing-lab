-- EITT Phishing Lab — schéma MySQL 5.7+ / MariaDB 10.3+
-- OPTIONNEL : l'application fonctionne sans base de données (scénarios lus dans data/scenarios.json).
-- Ordre d'installation : schema.sql, puis seed.sql, puis config.php avec 'use_db' => true.

CREATE DATABASE IF NOT EXISTS eitt_phishing_lab
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eitt_phishing_lab;

-- Scénarios (messages de la simulation). « payload » contient le scénario complet au format JSON
-- (voir data/scenarios.json) ; les autres colonnes servent au tri et au filtrage.
CREATE TABLE IF NOT EXISTS scenarios (
  id          VARCHAR(16)       NOT NULL,
  sort_order  SMALLINT UNSIGNED NOT NULL,
  difficulty  TINYINT UNSIGNED  NOT NULL DEFAULT 1,
  is_phishing TINYINT(1)        NOT NULL,
  payload     JSON              NOT NULL,
  active      TINYINT(1)        NOT NULL DEFAULT 1,
  updated_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_active_order (active, sort_order),
  CONSTRAINT chk_scenarios_difficulty CHECK (difficulty BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Statistiques anonymes (utilisées seulement si 'enable_stats' => true dans php/config.php).
-- Aucune colonne d'identification : ni adresse IP, ni cookie, ni nom, ni user-agent.
CREATE TABLE IF NOT EXISTS anonymous_results (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  played_on   DATE             NOT NULL,
  score       TINYINT UNSIGNED NOT NULL,
  total       TINYINT UNSIGNED NOT NULL,
  phishing_ok TINYINT UNSIGNED NOT NULL,
  legit_ok    TINYINT UNSIGNED NOT NULL,
  answered    TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_played_on (played_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compte applicatif à droits minimaux (adaptez le mot de passe, puis reportez-le dans php/config.php) :
--   CREATE USER 'eitt_lab'@'localhost' IDENTIFIED BY 'un-mot-de-passe-long-et-unique';
--   GRANT SELECT ON eitt_phishing_lab.scenarios TO 'eitt_lab'@'localhost';
--   GRANT INSERT ON eitt_phishing_lab.anonymous_results TO 'eitt_lab'@'localhost';
--   FLUSH PRIVILEGES;

-- Exemple de lecture des statistiques (à exécuter avec un compte administrateur) :
--   SELECT played_on, COUNT(*) AS parties, ROUND(AVG(score / total) * 100) AS reussite_moyenne_pct
--   FROM anonymous_results GROUP BY played_on ORDER BY played_on DESC;
