<?php
// api_login.php — recibe POST con correo+contrasena, responde JSON
session_start();
header('Content-Type: application/json');
require_once 'conexion.php';

$correo     = trim($_POST['correo']     ?? '');
$contrasena = trim($_POST['contrasena'] ?? '');

if (!$correo || !$contrasena) {
    echo json_encode(['ok' => false, 'msg' => 'Completa todos los campos.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, nombre, correo, contrasena FROM usuarios WHERE correo = ? LIMIT 1');
$stmt->execute([$correo]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($contrasena, $usuario['contrasena'])) {
    echo json_encode(['ok' => false, 'msg' => 'Correo o contraseña incorrectos.']);
    exit;
}

$_SESSION['usuario_id']     = $usuario['id'];
$_SESSION['usuario_nombre'] = $usuario['nombre'];
$_SESSION['usuario_correo'] = $usuario['correo'];

echo json_encode([
    'ok'     => true,
    'nombre' => $usuario['nombre'],
    'correo' => $usuario['correo']
]);
