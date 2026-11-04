<?php
require 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode($pdo->query("SELECT * FROM ahorros ORDER BY fecha DESC")->fetchAll());
    exit;
}

if ($method === 'POST') {
    $d = body();
    $stmt = $pdo->prepare("INSERT INTO ahorros (descripcion, moneda, monto, fecha) VALUES (?,?,?,?)");
    $stmt->execute([$d['descripcion'], $d['moneda'] ?? 'ARS', $d['monto'], $d['fecha']]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    $d = body();
    $stmt = $pdo->prepare("UPDATE ahorros SET descripcion=?, moneda=?, monto=?, fecha=? WHERE id=?");
    $stmt->execute([$d['descripcion'], $d['moneda'] ?? 'ARS', $d['monto'], $d['fecha'], $d['id']]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $pdo->prepare("DELETE FROM ahorros WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
