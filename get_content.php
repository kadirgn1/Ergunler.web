<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$group = trim((string)($_GET['group'] ?? ''));

if ($group === '') {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'group parametresi zorunludur.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $db->prepare("
        SELECT content_key, content_value
        FROM site_contents
        WHERE content_group = :content_group
        ORDER BY id ASC
    ");

    $stmt->execute([':content_group' => $group]);
    $rows = $stmt->fetchAll();

    $result = [];
    foreach ($rows as $row) {
        $result[$row['content_key']] = $row['content_value'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $result
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'İçerik alınamadı: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}