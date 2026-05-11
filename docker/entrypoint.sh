#!/bin/sh
set -e

echo "==> Limpiando cache de configuracion..."
php artisan config:clear

echo "==> Ejecutando migraciones..."
php artisan migrate --force

echo "==> Sembrando metodos de pago..."
php artisan db:seed --class=MetodoPagoSeeder --force

echo "==> Enlazando storage publico..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Iniciando servidor en 0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
