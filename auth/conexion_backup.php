<?php
/*
 * conexion.php
 * Archivo de conexión a la base de datos usuariosignova
 * Incluir este archivo en login.php y registro.php con:
 * require_once 'conexion.php';
 */

$host = '127.0.0.1:3307';
$db       = 'usuariosignova';
$user     = 'root';       // usuario de phpMyAdmin (por defecto: root)
$password = '';           // contraseña de phpMyAdmin (por defecto: vacía en XAMPP)
$charset  = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $password, $opciones);
} catch (PDOException $e) {
    die(json_encode([
        'error' => true,
        'mensaje' => 'Error de conexión: ' . $e->getMessage()
    ]));
}
?>
