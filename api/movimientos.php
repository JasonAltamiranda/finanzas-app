<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $anio = $_GET['anio'] ?? null;
    $categoria = $_GET['categoria'] ?? null; // gasto | tarjeta | impuesto | rapipago
    $sql = "SELECT m.*, p.nombre AS persona_nombre, pr.nombre AS propiedad_nombre FROM movimientos m
            LEFT JOIN personas p ON p.id = m.persona_id
            LEFT JOIN propiedades pr ON pr.id = m.propiedad_id WHERE 1=1";
    $params = [];
    if ($anio) { $sql .= " AND m.anio = ?"; $params[] = $anio; }
    if ($categoria) { $sql .= " AND m.categoria = ?"; $params[] = $categoria; }
    $sql .= " ORDER BY m.anio DESC, m.mes DESC, m.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $d = body();
    $stmt = $pdo->prepare("INSERT INTO movimientos (categoria, persona_id, propiedad_id, descripcion, subcategoria, banco, monto, anio, mes)
                            VALUES (?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $d['categoria'], $d['persona_id'] ?? null, $d['propiedad_id'] ?? null, $d['descripcion'], $d['subcategoria'] ?? null,
        $d['banco'] ?? null, $d['monto'], $d['anio'], $d['mes']
    ]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    $d = body();
    $stmt = $pdo->prepare("UPDATE movimientos SET categoria=?, persona_id=?, propiedad_id=?, descripcion=?, subcategoria=?, banco=?, monto=?, anio=?, mes=? WHERE id=?");
    $stmt->execute([
        $d['categoria'], $d['persona_id'] ?? null, $d['propiedad_id'] ?? null, $d['descripcion'], $d['subcategoria'] ?? null,
        $d['banco'] ?? null, $d['monto'], $d['anio'], $d['mes'], $d['id']
    ]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $pdo->prepare("DELETE FROM movimientos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no soportado']);
