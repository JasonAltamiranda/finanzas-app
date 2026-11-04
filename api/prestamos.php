<?php
require 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT pr.*, p.nombre AS persona_nombre FROM prestamos pr
            LEFT JOIN personas p ON p.id = pr.persona_id
            ORDER BY pr.fecha_inicio DESC";
    echo json_encode($pdo->query($sql)->fetchAll());
    exit;
}

if ($method === 'POST') {
    $d = body();
    $stmt = $pdo->prepare("INSERT INTO prestamos (persona_id, descripcion, banco, cuota_monto, cuotas_totales, cuotas_pagadas, fecha_inicio, moneda)
                            VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $d['persona_id'] ?? null, $d['descripcion'], $d['banco'] ?? null, $d['cuota_monto'],
        $d['cuotas_totales'], $d['cuotas_pagadas'] ?? 0, $d['fecha_inicio'], $d['moneda'] ?? 'ARS'
    ]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    $d = body();
    $stmt = $pdo->prepare("UPDATE prestamos SET persona_id=?, descripcion=?, banco=?, cuota_monto=?, cuotas_totales=?, cuotas_pagadas=?, fecha_inicio=?, moneda=? WHERE id=?");
    $stmt->execute([
        $d['persona_id'] ?? null, $d['descripcion'], $d['banco'] ?? null, $d['cuota_monto'],
        $d['cuotas_totales'], $d['cuotas_pagadas'] ?? 0, $d['fecha_inicio'], $d['moneda'] ?? 'ARS', $d['id']
    ]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $pdo->prepare("DELETE FROM prestamos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
