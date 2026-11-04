<?php
require 'db.php';
$anio = $_GET['anio'] ?? date('Y');
$mes = $_GET['mes'] ?? date('n');

$out = [];

$stmt = $pdo->prepare("SELECT COALESCE(SUM(monto),0) t FROM movimientos WHERE categoria='gasto' AND anio=? AND mes=?");
$stmt->execute([$anio, $mes]);
$out['gastos_mes'] = (float) $stmt->fetch()['t'];

$stmt = $pdo->prepare("SELECT COALESCE(SUM(monto),0) t FROM movimientos WHERE categoria='tarjeta' AND anio=? AND mes=?");
$stmt->execute([$anio, $mes]);
$out['tarjetas_mes'] = (float) $stmt->fetch()['t'];

$stmt = $pdo->prepare("SELECT COALESCE(SUM(monto),0) t FROM movimientos WHERE categoria='rapipago' AND anio=? AND mes=?");
$stmt->execute([$anio, $mes]);
$out['rapipago_mes'] = (float) $stmt->fetch()['t'];

$stmt = $pdo->prepare("SELECT COALESCE(SUM(monto),0) t FROM ingresos WHERE anio=? AND mes=?");
$stmt->execute([$anio, $mes]);
$out['ingresos_mes'] = (float) $stmt->fetch()['t'];

// Total de prestamos activos para ese mes puntual (cuota vigente segun fecha de inicio)
$stmt = $pdo->prepare("SELECT COALESCE(SUM(cuota_monto),0) t, COUNT(*) c FROM prestamos
                        WHERE cuotas_pagadas < cuotas_totales
                        AND fecha_inicio <= LAST_DAY(CONCAT(?,'-',?,'-01'))");
$stmt->execute([$anio, $mes]);
$prest = $stmt->fetch();
$out['prestamos_mes'] = (float) $prest['t'];
$out['prestamos_activos'] = (int) $prest['c'];

$out['ahorro_total'] = (float) $pdo->query("SELECT COALESCE(SUM(monto),0) t FROM ahorros")->fetch()['t'];

$saldo = $pdo->query("SELECT COALESCE(SUM(debe),0) d, COALESCE(SUM(haber),0) h FROM babypas_movimientos")->fetch();
$out['babypas_saldo'] = (float) $saldo['d'] - (float) $saldo['h'];

$stmt = $pdo->prepare("SELECT p.nombre, COALESCE(SUM(m.monto),0) total FROM personas p
                        LEFT JOIN movimientos m ON m.persona_id = p.id AND m.categoria='gasto' AND m.anio=? AND m.mes=?
                        GROUP BY p.id ORDER BY total DESC");
$stmt->execute([$anio, $mes]);
$out['gastos_por_persona'] = $stmt->fetchAll();

echo json_encode($out);
