<?php
require 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $items = $pdo->query("SELECT * FROM babypas_items ORDER BY fecha_inicio DESC")->fetchAll();
    $cuotasStmt = $pdo->prepare("SELECT * FROM babypas_cuotas WHERE item_id = ? ORDER BY numero ASC");
    foreach ($items as &$item) {
        $cuotasStmt->execute([$item['id']]);
        $item['cuotas'] = $cuotasStmt->fetchAll();
    }
    echo json_encode($items);
    exit;
}

if ($method === 'POST') {
    $d = body();
    // Crea el item y genera automaticamente sus cuotas mensuales
    $stmt = $pdo->prepare("INSERT INTO babypas_items (descripcion, monto_total, cuotas_totales, fecha_inicio) VALUES (?,?,?,?)");
    $stmt->execute([$d['descripcion'], $d['monto_total'], $d['cuotas_totales'], $d['fecha_inicio']]);
    $itemId = $pdo->lastInsertId();

    $montoCuota = round($d['monto_total'] / $d['cuotas_totales'], 2);
    $fecha = new DateTime($d['fecha_inicio']);
    $cuotaStmt = $pdo->prepare("INSERT INTO babypas_cuotas (item_id, numero, monto, fecha, pagada) VALUES (?,?,?,?,0)");
    for ($i = 1; $i <= $d['cuotas_totales']; $i++) {
        $cuotaStmt->execute([$itemId, $i, $montoCuota, $fecha->format('Y-m-d')]);
        $fecha->modify('+1 month');
    }
    echo json_encode(['id' => $itemId]);
    exit;
}

if ($method === 'PUT') {
    // Marca una cuota como pagada / no pagada
    $d = body();
    $stmt = $pdo->prepare("UPDATE babypas_cuotas SET pagada = ? WHERE id = ?");
    $stmt->execute([$d['pagada'], $d['cuota_id']]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $pdo->prepare("DELETE FROM babypas_items WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
