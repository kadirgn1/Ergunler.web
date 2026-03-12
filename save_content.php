<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Yetkisiz erişim.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Geçersiz istek yöntemi.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

$group = trim((string)($payload['group'] ?? ''));
$data = $payload['data'] ?? null;

if ($group === '' || !is_array($data)) {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'group ve data alanları zorunludur.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO site_contents (content_group, content_key, content_value)
        VALUES (:content_group, :content_key, :content_value)
        ON DUPLICATE KEY UPDATE
            content_value = VALUES(content_value)
    ");

    foreach ($data as $key => $value) {
        $contentKey = trim((string)$key);
        if ($contentKey === '') {
            continue;
        }

        $stmt->execute([
            ':content_group' => $group,
            ':content_key' => $contentKey,
            ':content_value' => is_scalar($value) || $value === null
                ? (string)$value
                : json_encode($value, JSON_UNESCAPED_UNICODE),
        ]);
    }

    $db->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'İçerik kaydedildi.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'İçerik kaydedilemedi: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}