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
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'Geçersiz JSON verisi gönderildi.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$id       = isset($data['id']) ? (int)$data['id'] : 0;
$title    = trim((string)($data['title'] ?? ''));
$category = trim((string)($data['category'] ?? ''));
$date     = trim((string)($data['date'] ?? ''));
$image    = trim((string)($data['image'] ?? ''));
$excerpt  = trim((string)($data['excerpt'] ?? ''));
$content  = trim((string)($data['content'] ?? ''));

if ($title === '' || $category === '' || $date === '' || $excerpt === '') {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'Başlık, kategori, tarih ve özet zorunludur.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($id > 0) {
        $stmt = $db->prepare("
            UPDATE news SET
                title = :title,
                category = :category,
                news_date = :news_date,
                image_url = :image_url,
                excerpt = :excerpt,
                content = :content
            WHERE id = :id
        ");

        $stmt->execute([
            ':title' => $title,
            ':category' => $category,
            ':news_date' => $date,
            ':image_url' => $image,
            ':excerpt' => $excerpt,
            ':content' => $content,
            ':id' => $id
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Haber güncellendi.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        $stmt = $db->prepare("
            INSERT INTO news (title, category, news_date, image_url, excerpt, content)
            VALUES (:title, :category, :news_date, :image_url, :excerpt, :content)
        ");

        $stmt->execute([
            ':title' => $title,
            ':category' => $category,
            ':news_date' => $date,
            ':image_url' => $image,
            ':excerpt' => $excerpt,
            ':content' => $content
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Haber kaydedildi.'
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Haber kaydedilemedi: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}