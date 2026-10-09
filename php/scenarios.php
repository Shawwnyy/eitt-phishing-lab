<?php
declare(strict_types=1);

/**
 * EITT Phishing Lab — API en lecture seule des scénarios.
 *
 *   GET php/scenarios.php[?difficulty=1|2|3]
 *
 * Source : data/scenarios.json (par défaut) ou table MySQL « scenarios » si config.php l'active.
 * Aucune donnée n'est enregistrée, aucun cookie n'est posé, aucune adresse IP n'est conservée.
 */

define('EITT_ROOT', dirname(__DIR__));
require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

function eitt_fail(int $code, string $message)
{
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    eitt_fail(405, 'Méthode non autorisée.');
}

// Paramètre facultatif validé côté serveur : liste blanche stricte.
$difficulty = null;
if (isset($_GET['difficulty'])) {
    $d = filter_var($_GET['difficulty'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 3]]);
    if ($d === false) {
        eitt_fail(400, 'Paramètre « difficulty » invalide (1 à 3).');
    }
    $difficulty = $d;
}

$cfg = eitt_config();
$source = 'json';
$rows = null;

if (!empty($cfg['use_db'])) {
    try {
        $pdo = eitt_pdo();
        if ($difficulty !== null) {
            $st = $pdo->prepare('SELECT payload FROM scenarios WHERE active = 1 AND difficulty = :d ORDER BY sort_order');
            $st->execute([':d' => $difficulty]);
        } else {
            $st = $pdo->query('SELECT payload FROM scenarios WHERE active = 1 ORDER BY sort_order');
        }
        $rows = [];
        foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $payload) {
            $rows[] = json_decode((string) $payload, true);
        }
        $source = 'db';
    } catch (Throwable $e) {
        // Détails volontairement non exposés : repli silencieux sur le fichier JSON.
        error_log('EITT Phishing Lab : base de données indisponible (' . get_class($e) . ').');
        $rows = null;
    }
}

if ($rows === null) {
    $file = EITT_ROOT . '/data/scenarios.json';
    $json = is_file($file) ? file_get_contents($file) : false;
    $decoded = $json !== false ? json_decode($json, true) : null;
    if (!is_array($decoded) || !is_array($decoded['scenarios'] ?? null)) {
        eitt_fail(500, 'Scénarios indisponibles.');
    }
    $rows = $decoded['scenarios'];
    if ($difficulty !== null) {
        $rows = array_values(array_filter($rows, static fn ($s) => is_array($s) && (int) ($s['difficulty'] ?? 0) === $difficulty));
    }
}

$scenarios = [];
foreach ($rows as $row) {
    $clean = eitt_clean_scenario($row);
    if ($clean !== null) {
        $scenarios[] = $clean;
    }
}

if (!$scenarios) {
    eitt_fail(500, 'Aucun scénario valide.');
}

echo json_encode([
    'meta' => [
        'source' => $source,
        'count' => count($scenarios),
        'stats' => $source === 'db' && !empty($cfg['enable_stats']),
    ],
    'scenarios' => $scenarios,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
