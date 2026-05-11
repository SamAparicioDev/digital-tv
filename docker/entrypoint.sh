#!/bin/sh
set -e

echo "==> Limpiando cache de configuracion..."
php artisan config:clear

echo "==> Ejecutando migraciones..."
php artisan migrate --force

echo "==> Iniciando servidor en 0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
