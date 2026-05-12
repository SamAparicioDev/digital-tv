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

echo "==> Calentando cache de configuracion..."
php artisan config:cache

echo "==> Iniciando nginx + php-fpm via supervisord en :8000..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
