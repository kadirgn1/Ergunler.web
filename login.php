<?php
declare(strict_types=1);

session_start();

$admin_user = "admin";
$admin_pass = "123456";

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim((string)($_POST['username'] ?? ''));
    $pass = trim((string)($_POST['password'] ?? ''));

    if ($user === $admin_user && $pass === $admin_pass) {
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $user;
        header("Location: admin.php");
        exit;
    } else {
        $error = "Hatalı kullanıcı adı veya şifre!";
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Giriş Yap | Ergünler Yönetim Paneli</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <style>
        body {
            background: #f4f7fb;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .login-card {
            width: 100%;
            max-width: 400px;
            padding: 30px;
            border-radius: 20px;
            background: #fff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .btn-primary {
            background: #f39c12;
            border: none;
            font-weight: 800;
        }
        .btn-primary:hover {
            background: #d68910;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h3 class="text-center mb-4">Admin Girişi</h3>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="mb-3">
                <label class="form-label">Kullanıcı Adı</label>
                <input type="text" name="username" class="form-control" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Şifre</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary w-100 py-2">Giriş Yap</button>
        </form>
    </div>
</body>
</html>