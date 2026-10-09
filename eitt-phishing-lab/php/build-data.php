<?php
declare(strict_types=1);

/**
 * EITT Phishing Lab — régénère les fichiers dérivés à partir de data/scenarios.json
 *
 *   - data/scenarios.js : copie utilisable en ouvrant index.html directement (file://)
 *   - sql/seed.sql      : insertion des scénarios dans MySQL / MariaDB
 *
 * Usage (en ligne de commande uniquement) :  php php/build-data.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$root = dirname(__DIR__);
$jsonPath = $root . '/data/scenarios.json';

$raw = file_get_contents($jsonPath);
if ($raw === false) {
    fwrite(STDERR, "Impossible de lire $jsonPath\n");
    exit(1);
}

try {
    $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    fwrite(STDERR, 'JSON invalide : ' . $e->getMessage() . "\n");
    exit(1);
}

$scenarios = $data['scenarios'] ?? null;
if (!is_array($scenarios) || count($scenarios) === 0) {
    fwrite(STDERR, "Aucun scénario trouvé.\n");
    exit(1);
}

$flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;

// 1) data/scenarios.js
$js = "/* Généré par php/build-data.php à partir de data/scenarios.json — ne pas modifier à la main. */\n"
    . 'window.EITT_SCENARIOS = ' . json_encode($data, $flags | JSON_PRETTY_PRINT) . ";\n";
file_put_contents($root . '/data/scenarios.js', $js);

// 2) sql/seed.sql
$esc = static fn (string $s): string => str_replace(['\\', "'"], ['\\\\', "''"], $s);
$sql = "-- Généré par php/build-data.php à partir de data/scenarios.json\n"
     . "-- À exécuter après sql/schema.sql (MySQL 5.7+ / MariaDB 10.3+).\n"
     . "SET NAMES utf8mb4;\n\n";

foreach ($scenarios as $i => $s) {
    $payload = json_encode($s, $flags);
    $sql .= sprintf(
        "INSERT INTO scenarios (id, sort_order, difficulty, is_phishing, payload, active) VALUES ('%s', %d, %d, %d, '%s', 1)\n"
        . "  ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order), difficulty = VALUES(difficulty),"
        . " is_phishing = VALUES(is_phishing), payload = VALUES(payload), active = VALUES(active);\n",
        $esc((string) $s['id']),
        $i + 1,
        (int) $s['difficulty'],
        !empty($s['isPhishing']) ? 1 : 0,
        $esc($payload)
    );
}
file_put_contents($root . '/sql/seed.sql', $sql);

printf("OK : %d scénarios -> data/scenarios.js et sql/seed.sql\n", count($scenarios));
