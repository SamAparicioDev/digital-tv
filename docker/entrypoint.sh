#!/bin/sh
set -e

PORT=${PORT:-8080}
echo "==> Puerto: $PORT"

echo "==> Iniciando servidor en 0.0.0.0:$PORT..."
php artisan serve --host=0.0.0.0 --port=$PORT &
SERVER_PID=$!

echo "==> Ejecutando migraciones..."
php artisan migrate --force

echo "==> Sembrando datos iniciales..."
php artisan db:seed --class=DatabaseSeeder --force
php artisan db:seed --class=MetodoPagoSeeder --force

echo "==> Enlazando storage..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Setup completo. Servidor corriendo (PID $SERVER_PID)."
wait $SERVER_PID
