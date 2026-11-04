<?php
require 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode($pdo->query("SELECT * FROM babypas_movimientos ORDER BY fecha DESC, id DESC")->fetchAll());
    exit;
}

if ($method === 'POST') {
    $d = body();
    $stmt = $pdo->prepare("INSERT INTO babypas_movimientos (fecha, descripcion, debe, haber) VALUES (?,?,?,?)");
    $stmt->execute([$d['fecha'], $d['descripcion'], $d['debe'] ?? 0, $d['haber'] ?? 0]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $pdo->prepare("DELETE FROM babypas_movimientos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
