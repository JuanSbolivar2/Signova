<?php
/*
 * recuperar.php
 * Página de recuperación de contraseña (pantalla de aviso)
 * Nota: en un servidor real se integraría con un servicio de email (PHPMailer, etc.)
 */
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIGNOVA — Recuperar contraseña</title>
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
      content: ''; position: absolute;
      width: 400px; height: 400px; border-radius: 50%;
      background: rgba(255,255,255,0.03); top: -100px; left: -100px;
    }
    .brand { font-size: 2.8rem; font-weight: 700; color: #fff; letter-spacing: -1px; margin-bottom: 12px; position: relative; z-index: 1; }
    .brand span { color: #5c9bff; }
    .tagline { font-size: 1rem; color: rgba(255,255,255,0.6); font-weight: 300; max-width: 320px; line-height: 1.6; position: relative; z-index: 1; }
    .seña-deco { position: absolute; font-size: 14rem; opacity: 0.04; bottom: -30px; right: 40px; user-select: none; z-index: 0; }

    .panel-right {
      width: 45%;
      background: #f2f4f8;
      display: flex; justify-content: center; align-items: center;
      padding: 40px 30px;
    }
    .card {
      background: #fff; border-radius: 20px; padding: 48px 44px;
      width: 100%; max-width: 420px;
      box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    }
    .card h2 { font-size: 1.7rem; font-weight: 600; color: #111827; margin-bottom: 10px; }
    .card p  { font-size: 0.9rem; color: #6b7280; margin-bottom: 26px; line-height: 1.6; }
    .input-group { margin-bottom: 16px; }
    .input-group input {
      width: 100%; padding: 14px 18px;
      border: 1.5px solid #e5e7eb; border-radius: 10px;
      font-size: 0.95rem; font-family: 'Poppins', sans-serif;
      color: #374151; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-group input::placeholder { color: #9ca3af; }
    .input-group input:focus { border-color: #1a2a6c; box-shadow: 0 0 0 3px rgba(26,42,108,0.08); }
    .btn-primary {
      width: 100%; padding: 14px; background: #111827; color: #fff;
      border: none; border-radius: 10px; font-size: 1rem; font-weight: 500;
      font-family: 'Poppins', sans-serif; cursor: pointer;
      transition: background 0.2s; margin-bottom: 22px;
    }
    .btn-primary:hover { background: #1a2a6c; }
    .alt-link { text-align: center; font-size: 0.88rem; color: #6b7280; }
    .alt-link a { color: #1a2a6c; font-weight: 600; text-decoration: none; }
    .alt-link a:hover { text-decoration: underline; }
    .info-box {
      background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8;
      border-radius: 10px; padding: 12px 16px; font-size: 0.85rem;
      margin-bottom: 20px; line-height: 1.5;
    }
    @media (max-width: 768px) {
      body { flex-direction: column; height: auto; min-height: 100vh; }
      .panel-left { width: 100%; padding: 50px 30px; align-items: center; text-align: center; }
      .panel-right { width: 100%; padding: 30px 20px; }
      .seña-deco { display: none; }
    }
  </style>
</head>
<body>

  <div class="panel-left">
    <div class="brand">SIGN<span>OVA</span></div>
    <p class="tagline">Recupera el acceso a tu cuenta de aprendizaje de LSC.</p>
    <div class="seña-deco">🤙</div>
  </div>

  <div class="panel-right">
    <div class="card">
      <h2>¿Olvidaste tu contraseña?</h2>
      <p>Ingresa tu correo y te enviaremos instrucciones para recuperar tu cuenta.</p>

      <div class="info-box">
        📧 Revisa tu carpeta de spam si no ves el correo en unos minutos.
      </div>

      <form method="POST" action="recuperar.php">
        <div class="input-group">
          <input type="email" name="correo" placeholder="Correo electrónico" required>
        </div>
        <button type="submit" class="btn-primary">Enviar instrucciones</button>
      </form>

      <p class="alt-link">
        <a href="login.php">← Volver a iniciar sesión</a>
      </p>
    </div>
  </div>

</body>
</html>
