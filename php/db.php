<?php
declare(strict_types=1);

/**
 * EITT Phishing Lab — fonctions communes (configuration, connexion PDO, validation des scénarios).
 * Ce fichier ne produit aucune sortie et n'est pas destiné à être appelé directement.
 */

if (!defined('EITT_ROOT')) {
    http_response_code(404);
    exit;
}

/** Configuration : php/config.php si présent, sinon valeurs par défaut sûres. */
function eitt_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }
    $defaults = [
        'use_db' => false,
        'db' => ['dsn' => '', 'user' => '', 'pass' => ''],
        'enable_stats' => false,
    ];
    $file = __DIR__ . '/config.php';
    if (is_file($file)) {
        $loaded = require $file;
        if (is_array($loaded)) {
            $cfg = array_replace_recursive($defaults, $loaded);
            return $cfg;
        }
    }
    $cfg = $defaults;
    return $cfg;
}

/** Connexion PDO (requêtes préparées, exceptions, pas d'émulation). */
function eitt_pdo(): PDO
{
    $db = eitt_config()['db'];
    return new PDO((string) $db['dsn'], (string) $db['user'], (string) $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

/** Chaîne bornée (supprime les caractères de contrôle sauf retour à la ligne). */
function eitt_str(mixed $v, int $max = 2000): ?string
{
    if (!is_string($v)) {
        return null;
    }
    $v = preg_replace('/[^\P{C}\n]/u', '', $v);
    if ($v === null) {
        return null;
    }
    return mb_substr($v, 0, $max);
}

/** URL fictive : uniquement https, domaines factices attendus. Les liens ne sont jamais suivis côté client. */
function eitt_url(mixed $v): ?string
{
    $s = eitt_str($v, 300);
    if ($s === null || !preg_match('#^https://[a-z0-9.-]+(?:/[^\s<>"\']*)?$#i', $s)) {
        return null;
    }
    return $s;
}

/**
 * Valide et nettoie un scénario (liste blanche de champs).
 * Retourne null si le scénario est invalide : il est alors ignoré.
 */
function eitt_clean_scenario(mixed $raw): ?array
{
    if (!is_array($raw)) {
        return null;
    }
    $id = eitt_str($raw['id'] ?? null, 16);
    $subject = eitt_str($raw['subject'] ?? null, 300);
    $sender = $raw['sender'] ?? null;
    if ($id === null || !preg_match('/^[a-z0-9_-]{1,16}$/i', $id) || $subject === null || !is_array($sender)
        || !is_bool($raw['isPhishing'] ?? null) || !is_array($raw['body'] ?? null) || !is_array($raw['analysis'] ?? null)) {
        return null;
    }
    $name = eitt_str($sender['name'] ?? null, 120);
    $addr = eitt_str($sender['address'] ?? null, 200);
    if ($name === null || $addr === null) {
        return null;
    }

    $body = [];
    foreach ($raw['body'] as $b) {
        if (!is_array($b)) {
            continue;
        }
        $t = $b['t'] ?? null;
        if (in_array($t, ['p', 'sig'], true) && ($x = eitt_str($b['x'] ?? null)) !== null) {
            $body[] = ['t' => $t, 'x' => $x];
        } elseif ($t === 'list' && is_array($b['items'] ?? null)) {
            $items = array_values(array_filter(array_map(static fn ($i) => eitt_str($i, 400), $b['items']), static fn ($i) => $i !== null));
            $body[] = ['t' => 'list', 'items' => $items];
        } elseif (in_array($t, ['link', 'btn'], true)) {
            $x = eitt_str($b['x'] ?? null, 200);
            $url = eitt_url($b['url'] ?? null);
            if ($x !== null && $url !== null) {
                $body[] = ['t' => $t, 'x' => $x, 'url' => $url];
            }
        }
    }

    $analysis = [];
    foreach (['sender', 'context', 'urgency', 'request', 'links', 'coherence'] as $k) {
        $a = $raw['analysis'][$k] ?? null;
        $flag = is_array($a) ? ($a['flag'] ?? null) : null;
        $text = is_array($a) ? eitt_str($a['text'] ?? null, 1200) : null;
        if (!in_array($flag, ['alert', 'ok', 'neutral'], true) || $text === null) {
            return null;
        }
        $analysis[$k] = ['flag' => $flag, 'text' => $text];
    }

    $attachments = [];
    foreach (is_array($raw['attachments'] ?? null) ? $raw['attachments'] : [] as $a) {
        if (is_array($a) && ($n = eitt_str($a['name'] ?? null, 120)) !== null) {
            $attachments[] = ['name' => $n, 'size' => eitt_str($a['size'] ?? '', 20) ?? ''];
        }
    }

    $tips = [];
    foreach (is_array($raw['tips'] ?? null) ? $raw['tips'] : [] as $t) {
        if (($s = eitt_str($t, 500)) !== null) {
            $tips[] = $s;
        }
    }

    $cons = [];
    foreach (['trustedPhishing', 'reportedLegit'] as $k) {
        if (($s = eitt_str($raw['consequences'][$k] ?? null, 800)) !== null) {
            $cons[$k] = $s;
        }
    }

    return [
        'id' => $id,
        'difficulty' => max(1, min(3, (int) ($raw['difficulty'] ?? 1))),
        'isPhishing' => $raw['isPhishing'],
        'time' => eitt_str($raw['time'] ?? '', 40) ?? '',
        'sender' => ['name' => $name, 'address' => $addr],
        'replyTo' => eitt_str($raw['replyTo'] ?? null, 200),
        'subject' => $subject,
        'attachments' => $attachments,
        'body' => $body,
        'analysis' => $analysis,
        'summary' => eitt_str($raw['summary'] ?? '', 600) ?? '',
        'tips' => $tips,
        'consequences' => $cons,
    ];
}
