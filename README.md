# Finanzas - app personal

App para reemplazar el Excel: gastos, tarjetas, prestamos, impuestos, Babypas (cuenta compartida con tu pareja), ahorros e ingresos (alquileres, jubilaciones), con base de datos MySQL.

## 1. Instalar con XAMPP

1. Instala XAMPP (https://www.apachefriends.org) si todavia no lo tenes.
2. Copia la carpeta `finanzas-app` completa dentro de `C:\xampp\htdocs\` (Windows) o `/opt/lampp/htdocs/` (Linux).
3. Abri el Panel de Control de XAMPP y arranca **Apache** y **MySQL**.
4. Entra a `http://localhost/phpmyadmin`, creá una base nueva importando el archivo `database/schema.sql` (boton "Importar").
5. Abri `http://localhost/finanzas-app/` en el navegador. Ya deberia mostrar el dashboard.

Si tu MySQL tiene usuario/clave distintos a `root` sin clave, editalos en `api/db.php`.

## 2. Acceder tambien desde el celular

Para usarla desde el celular (en la misma red WiFi que tu PC):

1. En tu PC, fijate tu IP local: en Windows `ipconfig`, en Linux/Mac `ifconfig` o `ip a` (buscá algo como `192.168.0.X`).
2. En XAMPP, en `httpd.conf` asegurate que Apache escuche en todas las interfaces (por defecto ya es asi).
3. Si Windows te bloquea el acceso, permiti Apache en el Firewall (puerto 80).
4. Desde el celular, con la misma WiFi, entra a `http://192.168.0.X/finanzas-app/` (reemplazando por tu IP real).

Para acceder desde afuera de tu casa hace falta exponer el servidor a internet (por ejemplo con un servicio como ngrok, o alojando la app en un hosting con PHP + MySQL) - si mas adelante lo queres, te ayudo a configurarlo.

## 3. Estructura del proyecto

```
finanzas-app/
  database/schema.sql   -> tablas de la base de datos
  api/                   -> endpoints PHP (JSON) para cada seccion
  css/style.css
  js/app.js
  index.html
```

## 4. Como esta organizada la info

- **Resumen**: totales del mes actual (ingresos, gastos, tarjetas, prestamos, rapipago) y ahorro acumulado.
- **Ingresos**: alquileres (local, casa, depto - podes atarlos a una propiedad), jubilacion, rapi, jose. Por mes y anio.
- **Gastos**: por persona (Jason, Ana, Diego, Cintia, Jose), por mes.
- **Tarjetas**: consumos de tarjeta por persona y banco. El total general se calcula solo en el Resumen.
- **Prestamos**: detalle cuota por cuota (monto, cuotas totales y pagadas). El total que corresponde pagar cada mes se calcula solo en el Resumen, igual que haces vos manualmente al trasladarlo a la hoja del anio.
- **Rapipago**: deuda aparte de las tarjetas y los prestamos bancarios.
- **Impuestos**: los generales (seguros, AFIP, celulares, obra social) y los que dependen de una propiedad (Las Heras, Godoy Cruz, Depto) - elegis la propiedad al cargar.
- **Babypas**: tiene dos partes. 1) Items en cuotas compartidas con tu pareja: al cargar un gasto se generan automaticamente las cuotas mensuales, y las podes marcar como pagadas tocandolas. 2) Debe/Haber del dia a dia: una cuenta corriente simple para ir anotando quien le debe a quien.
- **Ahorros**: por moneda (pesos, dolares, cripto, etc.).

Los datos de personas (Jason, Ana, Diego, Cintia, Jose) y propiedades (Las Heras, Godoy Cruz, Depto) ya vienen cargados - podes agregar mas directo desde las tablas `personas` y `propiedades` en phpMyAdmin si hace falta.

## 5. Si ya tenias la base de datos creada

Si ya habias importado el `schema.sql` anterior, hay que volver a importarlo (o correr los `ALTER TABLE` necesarios) para sumar las tablas y columnas nuevas: `propiedades`, `babypas_movimientos`, la categoria `rapipago` en `movimientos`, y los campos `propiedad_id`. Lo mas simple es borrar la base `finanzas` en phpMyAdmin y volver a importar el `schema.sql` actualizado.
