<?php
// api_registro.php — recibe POST con nombre+correo+contrasena, responde JSON
session_start();
header('Content-Type: application/json');
require_once 'conexion.php';

$nombre     = trim($_POST['nombre']     ?? '');
$correo     = trim($_POST['correo']     ?? '');
$contrasena = trim($_POST['contrasena'] ?? '');
$confirmar  = trim($_POST['confirmar']  ?? '');

if (!$nombre || !$correo || !$contrasena || !$confirmar) {
    echo json_encode(['ok' => false, 'msg' => 'Completa todos los campos.']);
    exit;
}
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'msg' => 'El correo no es válido.']);
    exit;
}
if (strlen($contrasena) < 6) {
    echo json_encode(['ok' => false, 'msg' => 'La contraseña debe tener mínimo 6 caracteres.']);
    exit;
}
if ($contrasena !== $confirmar) {
    echo json_encode(['ok' => false, 'msg' => 'Las contraseñas no coinciden.']);
    exit;
}

// Verificar correo duplicado
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
$stmt->execute([$correo]);
if ($stmt->fetch()) {
    echo json_encode(['ok' => false, 'msg' => 'Ya existe una cuenta con ese correo.']);
    exit;
}

// Insertar en MySQL
$hash = password_hash($contrasena, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)');
$stmt->execute([$nombre, $correo, $hash]);

$_SESSION['usuario_id']     = $pdo->lastInsertId();
$_SESSION['usuario_nombre'] = $nombre;
$_SESSION['usuario_correo'] = $correo;

echo json_encode([
    'ok'     => true,
    'nombre' => $nombre,
    'correo' => $correo
]);
