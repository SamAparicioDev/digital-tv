#!/bin/sh
set -e

PORT=${PORT:-8000}

echo "==> Generando nginx.conf para puerto $PORT..."
envsubst '${PORT}' < /etc/nginx/nginx.conf.template | tr -d '\r' > /etc/nginx/nginx.conf

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

echo "==> Iniciando php-fpm..."
php-fpm --nodaemonize &

echo "==> Esperando que php-fpm este listo en 127.0.0.1:9000..."
i=0
while ! nc -z 127.0.0.1 9000; do
  i=$((i+1))
  if [ $i -ge 30 ]; then
    echo "ERROR: php-fpm no respondio en 15 segundos"
    exit 1
  fi
  sleep 0.5
done
echo "==> php-fpm listo."

echo "==> Iniciando nginx en puerto $PORT..."
exec nginx -g "daemon off;"
