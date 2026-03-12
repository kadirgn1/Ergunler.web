<?php
declare(strict_types=1);

$host = 'localhost';
$db_name = 'ergunler_db';
$username = 'root';
$password = '';

try {
    $db = new PDO(
        "mysql:host={$host};dbname={$db_name};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'Veritabanı bağlantısı kurulamadı: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}