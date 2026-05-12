#!/bin/sh
set -e

PORT=${PORT:-8000}

echo "==> Generando nginx.conf para puerto $PORT..."
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

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

echo "==> Iniciando php-fpm en background..."
php-fpm -D

echo "==> Iniciando nginx en puerto $PORT..."
exec nginx -g "daemon off;"
