<?php
require 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode($pdo->query("SELECT * FROM personas ORDER BY nombre")->fetchAll());
    exit;
}

if ($method === 'POST') {
    $d = body();
    $stmt = $pdo->prepare("INSERT INTO personas (nombre) VALUES (?)");
    $stmt->execute([$d['nombre']]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
