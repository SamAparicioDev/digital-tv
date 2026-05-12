#!/bin/sh
set -e

PORT=${PORT:-8080}

echo "==> Puerto detectado: $PORT"
echo "==> Limpiando cache de configuracion..."
php artisan config:clear

echo "==> Ejecutando migraciones..."
php artisan migrate --force

echo "==> Sembrando privilegios, roles y usuario administrador..."
php artisan db:seed --class=DatabaseSeeder --force

echo "==> Sembrando metodos de pago..."
php artisan db:seed --class=MetodoPagoSeeder --force

echo "==> Enlazando storage publico..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Calentando cache de configuracion..."
php artisan config:cache

echo "==> Iniciando servidor en 0.0.0.0:$PORT..."
exec php artisan serve --host=0.0.0.0 --port=$PORT
