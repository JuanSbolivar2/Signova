<?php
/*
 * registro.php
 * Página de registro de nuevos usuarios en SIGNOVA
 */
session_start();

if (isset($_SESSION['usuario_id'])) {
    header('Location: ../index.html');
    exit;
}

require_once 'conexion.php';

$error  = '';
$exito  = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre     = trim($_POST['nombre']     ?? '');
    $correo     = trim($_POST['correo']     ?? '');
    $contrasena = trim($_POST['contrasena'] ?? '');
    $confirmar  = trim($_POST['confirmar']  ?? '');

    // Validaciones
    if (empty($nombre) || empty($correo) || empty($contrasena) || empty($confirmar)) {
        $error = 'Por favor completa todos los campos.';
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $error = 'El correo electrónico no es válido.';
    } elseif (strlen($contrasena) < 6) {
        $error = 'La contraseña debe tener al menos 6 caracteres.';
    } elseif ($contrasena !== $confirmar) {
        $error = 'Las contraseñas no coinciden.';
    } else {
        // Verificar si el correo ya existe
        $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
        $stmt->execute([$correo]);

        if ($stmt->fetch()) {
            $error = 'Ya existe una cuenta con ese correo electrónico.';
        } else {
            // Insertar usuario (contraseña hasheada con bcrypt)
            $hash = password_hash($contrasena, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)');
            $stmt->execute([$nombre, $correo, $hash]);

            // Iniciar sesión automáticamente
            $_SESSION['usuario_id']     = $pdo->lastInsertId();
            $_SESSION['usuario_nombre'] = $nombre;
            $_SESSION['usuario_correo'] = $correo;
            header('Location: ../index.html');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIGNOVA — Crear Cuenta</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Poppins', sans-serif;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

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
      position: relative; z-index: 1;
    }
    .brand span { color: #5c9bff; }

    .tagline {
      font-size: 1rem;
      color: rgba(255,255,255,0.6);
      font-weight: 300;
      max-width: 320px;
      line-height: 1.6;
      position: relative; z-index: 1;
    }

    .features {
      margin-top: 36px;
      position: relative; z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,0.75);
      font-size: 0.9rem;
    }
    .feature-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #5c9bff;
      flex-shrink: 0;
    }

    .seña-deco {
      position: absolute;
      font-size: 14rem;
      opacity: 0.04;
      bottom: -30px; right: 40px;
      user-select: none; z-index: 0;
    }

    .panel-right {
      width: 45%;
      background: #f2f4f8;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 30px;
      overflow-y: auto;
    }

    .card {
      background: #ffffff;
      border-radius: 20px;
      padding: 44px 44px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    }

    .card h2 {
      font-size: 1.7rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 26px;
    }

    .input-group {
      margin-bottom: 14px;
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
      margin-top: 6px;
      margin-bottom: 22px;
    }
    .btn-primary:hover  { background: #1a2a6c; }
    .btn-primary:active { transform: scale(0.98); }

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

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 0.88rem;
      margin-bottom: 18px;
    }

    /* Indicador fuerza contraseña */
    .password-hint {
      font-size: 0.78rem;
      color: #9ca3af;
      margin-top: 4px;
      margin-left: 4px;
    }

    @media (max-width: 768px) {
      body { flex-direction: column; height: auto; min-height: 100vh; overflow: auto; }
      .panel-left { width: 100%; padding: 50px 30px; align-items: center; text-align: center; }
      .panel-right { width: 100%; padding: 30px 20px; }
      .seña-deco { display: none; }
      .features { align-items: center; }
    }
  </style>
</head>
<body>

  <!-- ── PANEL IZQUIERDO ─────────────────────────────────── -->
  <div class="panel-left">
    <div class="brand">SIGN<span>OVA</span></div>
    <p class="tagline">Crea tu cuenta y empieza a aprender Lengua de Señas Colombiana hoy.</p>
    <div class="features">
      <div class="feature-item"><div class="feature-dot"></div>Videos demostrativos de señas LSC</div>
      <div class="feature-item"><div class="feature-dot"></div>Quiz y juegos interactivos</div>
      <div class="feature-item"><div class="feature-dot"></div>Seguimiento de tu progreso</div>
      <div class="feature-item"><div class="feature-dot"></div>Totalmente gratis y sin instalación</div>
    </div>
    <div class="seña-deco">✌️</div>
  </div>

  <!-- ── PANEL DERECHO ───────────────────────────────────── -->
  <div class="panel-right">
    <div class="card">
      <h2>Crear cuenta</h2>

      <?php if ($error): ?>
        <div class="alert-error"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <form method="POST" action="registro.php">
        <div class="input-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value="<?= htmlspecialchars($_POST['nombre'] ?? '') ?>"
            required
            autocomplete="name"
          >
        </div>

        <div class="input-group">
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
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
            autocomplete="new-password"
            minlength="6"
          >
          <p class="password-hint">Mínimo 6 caracteres</p>
        </div>

        <div class="input-group">
          <input
            type="password"
            name="confirmar"
            placeholder="Confirmar contraseña"
            required
            autocomplete="new-password"
          >
        </div>

        <button type="submit" class="btn-primary">Crear cuenta</button>
      </form>

      <p class="alt-link">
        ¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a>
      </p>
    </div>
  </div>

</body>
</html>
