<?php
declare(strict_types=1);

/**
 * EITT Phishing Lab — statistiques anonymes (DÉSACTIVÉES par défaut).
 *
 *   POST php/stats.php   corps JSON : {"score":7,"total":10,"phishing_ok":4,"legit_ok":3,"answered":10}
 *
 * Active uniquement si config.php contient 'use_db' => true ET 'enable_stats' => true.
 * Enregistre des nombres agrégés et la date du jour. Aucun identifiant, aucune adresse IP,
 * aucun cookie, aucun user-agent.
 */

define('EITT_ROOT', dirname(__DIR__));
require __DIR__ . '/db.php';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

function stats_fail(int $code)
{
    http_response_code($code);
    exit;
}

$cfg = eitt_config();
if (empty($cfg['use_db']) || empty($cfg['enable_stats'])) {
    stats_fail(404);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    stats_fail(405);
}

// Même origine uniquement (protection contre les envois depuis d'autres sites).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $host = parse_url($origin, PHP_URL_HOST);
    $port = parse_url($origin, PHP_URL_PORT);
    $originHost = $host . ($port ? ':' . $port : '');
    if (!is_string($host) || !hash_equals(strtolower((string) ($_SERVER['HTTP_HOST'] ?? '')), strtolower($originHost))) {
        stats_fail(403);
    }
}

if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
    stats_fail(415);
}

$raw = file_get_contents('php://input', false, null, 0, 1025);
if ($raw === false || strlen($raw) > 1024) {
    stats_fail(413);
}
$in = json_decode($raw, true);
if (!is_array($in)) {
    stats_fail(400);
}

$vals = [];
foreach (['score', 'total', 'phishing_ok', 'legit_ok', 'answered'] as $k) {
    $v = filter_var($in[$k] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 50]]);
    if ($v === false) {
        stats_fail(422);
    }
    $vals[$k] = $v;
}
if ($vals['total'] < 1 || $vals['score'] > $vals['total'] || $vals['answered'] > $vals['total']
    || $vals['phishing_ok'] + $vals['legit_ok'] !== $vals['score']) {
    stats_fail(422);
}

try {
    $st = eitt_pdo()->prepare(
        'INSERT INTO anonymous_results (played_on, score, total, phishing_ok, legit_ok, answered)
         VALUES (:d, :s, :t, :p, :l, :a)'
    );
    $st->execute([
        ':d' => date('Y-m-d'), ':s' => $vals['score'], ':t' => $vals['total'],
        ':p' => $vals['phishing_ok'], ':l' => $vals['legit_ok'], ':a' => $vals['answered'],
    ]);
} catch (Throwable $e) {
    error_log('EITT Phishing Lab : statistiques non enregistrées (' . get_class($e) . ').');
    stats_fail(503);
}

http_response_code(204);
