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

$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'Geçerli bir haber ID değeri gerekli.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $db->prepare("DELETE FROM news WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Haber silindi.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Haber silinemedi: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}