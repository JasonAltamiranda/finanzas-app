-- Base de datos: finanzas
-- Importar en phpMyAdmin (XAMPP) o con: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS finanzas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finanzas;

-- Personas involucradas (Jason, Ana, Diego, Cintia, Jose, etc.)
CREATE TABLE personas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

-- Propiedades (Las Heras, Godoy Cruz, Depto) usadas para atar impuestos e ingresos por alquiler
CREATE TABLE propiedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

-- Movimientos generales: gastos, tarjetas, impuestos y rapipago, uno por mes/anio
CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria ENUM('gasto','tarjeta','impuesto','rapipago') NOT NULL,
    persona_id INT NULL,
    propiedad_id INT NULL,
    descripcion VARCHAR(120) NOT NULL,
    subcategoria VARCHAR(80) NULL,
    banco VARCHAR(60) NULL,
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    anio INT NOT NULL,
    mes TINYINT NOT NULL,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE SET NULL,
    INDEX idx_periodo (anio, mes),
    INDEX idx_categoria (categoria)
);

-- Ingresos: alquileres (atados a propiedad) y otros (jubilacion, rapi, jose)
CREATE TABLE ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(120) NOT NULL,
    tipo VARCHAR(60) NOT NULL,
    propiedad_id INT NULL,
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    anio INT NOT NULL,
    mes TINYINT NOT NULL,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE SET NULL,
    INDEX idx_periodo (anio, mes)
);

-- Prestamos con seguimiento de cuotas (el detalle mes a mes alimenta el total en Resumen)
CREATE TABLE prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona_id INT NULL,
    descripcion VARCHAR(120) NOT NULL,
    banco VARCHAR(60) NULL,
    cuota_monto DECIMAL(12,2) NOT NULL,
    cuotas_totales INT NOT NULL,
    cuotas_pagadas INT NOT NULL DEFAULT 0,
    fecha_inicio DATE NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'ARS',
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL
);

-- Babypas: gastos compartidos con la pareja, agrupados en items con cuotas
CREATE TABLE babypas_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(120) NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL,
    cuotas_totales INT NOT NULL DEFAULT 1,
    fecha_inicio DATE NOT NULL
);

CREATE TABLE babypas_cuotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    numero INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    pagada TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES babypas_items(id) ON DELETE CASCADE
);

-- Babypas: cuenta corriente del dia a dia con la pareja (debe / haber)
CREATE TABLE babypas_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion VARCHAR(120) NOT NULL,
    debe DECIMAL(12,2) NOT NULL DEFAULT 0,
    haber DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- Ahorros por moneda/instrumento (dolares, cripto, etc.)
CREATE TABLE ahorros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(120) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'ARS',
    monto DECIMAL(14,2) NOT NULL,
    fecha DATE NOT NULL
);

-- Datos base
INSERT INTO personas (nombre) VALUES ('Jason'),('Ana'),('Diego'),('Cintia'),('Jose');
INSERT INTO propiedades (nombre) VALUES ('Las Heras'),('Godoy Cruz'),('Depto');
