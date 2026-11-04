<?php
require 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $anio = $_GET['anio'] ?? null;
    $sql = "SELECT i.*, pr.nombre AS propiedad_nombre FROM ingresos i
            LEFT JOIN propiedades pr ON pr.id = i.propiedad_id WHERE 1=1";
    $params = [];
    if ($anio) { $sql .= " AND i.anio = ?"; $params[] = $anio; }
    $sql .= " ORDER BY i.anio DESC, i.mes DESC, i.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $d = body();
    $stmt = $pdo->prepare("INSERT INTO ingresos (descripcion, tipo, propiedad_id, monto, anio, mes) VALUES (?,?,?,?,?,?)");
    $stmt->execute([$d['descripcion'], $d['tipo'], $d['propiedad_id'] ?? null, $d['monto'], $d['anio'], $d['mes']]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    $d = body();
    $stmt = $pdo->prepare("UPDATE ingresos SET descripcion=?, tipo=?, propiedad_id=?, monto=?, anio=?, mes=? WHERE id=?");
    $stmt->execute([$d['descripcion'], $d['tipo'], $d['propiedad_id'] ?? null, $d['monto'], $d['anio'], $d['mes'], $d['id']]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $pdo->prepare("DELETE FROM ingresos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
