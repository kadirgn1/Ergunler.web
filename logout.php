<?php
session_start();
session_destroy(); // Tüm oturum verilerini sil
header("Location: login.php"); // Giriş sayfasına yönlendir
exit;
?>