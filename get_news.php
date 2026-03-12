<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

try {
    $stmt = $db->query("
        SELECT
            id,
            title,
            category,
            DATE_FORMAT(news_date, '%Y-%m-%d') AS date,
            image_url AS image,
            excerpt,
            content
        FROM news
        ORDER BY news_date DESC, id DESC
    ");

    $items = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $items
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Haberler alınamadı: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}