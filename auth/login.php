<?php
/*
 * login.php
 * Página de inicio de sesión de SIGNOVA
 */
session_start();

// Si ya hay sesión activa, redirigir al inicio
if (isset($_SESSION['usuario_id'])) {
    header('Location: ../index.html');
    exit;
}

require_once 'conexion.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo     = trim($_POST['correo'] ?? '');
    $contrasena = trim($_POST['contrasena'] ?? '');

    if (empty($correo) || empty($contrasena)) {
        $error = 'Por favor completa todos los campos.';
    } else {
        // Buscar usuario por correo
        $stmt = $pdo->prepare('SELECT id, nombre, correo, contrasena FROM usuarios WHERE correo = ? LIMIT 1');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch();

        if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
            // Credenciales correctas → crear sesión
            $_SESSION['usuario_id']     = $usuario['id'];
            $_SESSION['usuario_nombre'] = $usuario['nombre'];
            $_SESSION['usuario_correo'] = $usuario['correo'];
            header('Location: ../index.html');
            exit;
        } else {
            $error = 'Correo o contraseña incorrectos.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIGNOVA — Iniciar Sesión</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Poppins', sans-serif;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ── PANEL IZQUIERDO ─────────────────────────────────────── */
    .panel-left {
      width: 55%;
      background: linear-gradient(135deg, #0a0f2e 0%, #0d1b4b 40%, #1a2a6c 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 60px 70px;
      position: relative;
      overflow: hidden;
    }

    /* Círculos decorativos de fondo */
    .panel-left::before {
      content: '';
      position: absolute;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: rgba(255,255,255,0.03);
      top: -100px; left: -100px;
    }
    .panel-left::after {
      content: '';
      position: absolute;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: rgba(255,255,255,0.03);
      bottom: -80px; right: -80px;
    }

    .brand {
      font-size: 2.8rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -1px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }
    .brand span {
      color: #5c9bff;
    }

    .tagline {
      font-size: 1rem;
      color: rgba(255,255,255,0.6);
      font-weight: 300;
      max-width: 320px;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .seña-deco {
      position: absolute;
      font-size: 14rem;
      opacity: 0.04;
      bottom: -30px;
      right: 40px;
      user-select: none;
      z-index: 0;
    }

    /* ── PANEL DERECHO ───────────────────────────────────────── */
    .panel-right {
      width: 45%;
      background: #f2f4f8;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 30px;
    }

    .card {
      background: #ffffff;
      border-radius: 20px;
      padding: 48px 44px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    }

    .card h2 {
      font-size: 1.7rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 28px;
    }

    /* ── INPUTS ──────────────────────────────────────────────── */
    .input-group {
      margin-bottom: 16px;
    }

    .input-group input {
      width: 100%;
      padding: 14px 18px;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font-size: 0.95rem;
      font-family: 'Poppins', sans-serif;
      color: #374151;
      background: #fff;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-group input::placeholder { color: #9ca3af; }

    .input-group input:focus {
      border-color: #1a2a6c;
      box-shadow: 0 0 0 3px rgba(26,42,108,0.08);
    }

    /* ── OLVIDÉ CONTRASEÑA ───────────────────────────────────── */
    .forgot {
      text-align: right;
      margin-bottom: 20px;
    }
    .forgot a {
      font-size: 0.82rem;
      color: #6b7280;
      text-decoration: none;
      transition: color 0.2s;
    }
    .forgot a:hover { color: #1a2a6c; }

    /* ── BOTÓN ───────────────────────────────────────────────── */
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: #111827;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 500;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      margin-bottom: 22px;
    }
    .btn-primary:hover  { background: #1a2a6c; }
    .btn-primary:active { transform: scale(0.98); }

    /* ── ENLACE REGISTRO ─────────────────────────────────────── */
    .alt-link {
      text-align: center;
      font-size: 0.88rem;
      color: #6b7280;
    }
    .alt-link a {
      color: #1a2a6c;
      font-weight: 600;
      text-decoration: none;
    }
    .alt-link a:hover { text-decoration: underline; }

    /* ── ERROR ───────────────────────────────────────────────── */
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 0.88rem;
      margin-bottom: 18px;
    }

    /* ── RESPONSIVE ──────────────────────────────────────────── */
    @media (max-width: 768px) {
      body { flex-direction: column; height: auto; min-height: 100vh; }
      .panel-left {
        width: 100%; padding: 50px 30px;
        align-items: center; text-align: center;
      }
      .panel-right { width: 100%; padding: 30px 20px; }
      .seña-deco { display: none; }
    }
  </style>
</head>
<body>

  <!-- ── PANEL IZQUIERDO ─────────────────────────────────── -->
  <div class="panel-left">
    <div class="brand">SIGN<span>OVA</span></div>
    <p class="tagline">Inicia sesión para continuar aprendiendo Lengua de Señas Colombiana.</p>
    <div class="seña-deco">🤟</div>
  </div>

  <!-- ── PANEL DERECHO ───────────────────────────────────── -->
  <div class="panel-right">
    <div class="card">
      <h2>Login</h2>

      <?php if ($error): ?>
        <div class="alert-error"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <form method="POST" action="login.php">
        <div class="input-group">
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value="<?= htmlspecialchars($_POST['correo'] ?? '') ?>"
            required
            autocomplete="email"
          >
        </div>

        <div class="input-group">
          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            required
            autocomplete="current-password"
          >
        </div>

        <div class="forgot">
          <a href="recuperar.php">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" class="btn-primary">Ingresar</button>
      </form>

      <p class="alt-link">
        ¿No tienes cuenta? <a href="registro.php">Regístrate</a>
      </p>
    </div>
  </div>

</body>
</html>
