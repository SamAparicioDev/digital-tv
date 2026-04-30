# Backend - Digital TV (Laravel + Vite)

Este módulo representa el backend y el pipeline de assets frontend para Digital TV. Utiliza Laravel con Vite para gestionar recursos frontend (TailwindCSS, JS) y sirve APIs o lógica de negocio según la arquitectura del proyecto.

Contexto general
- Arquitectura: Laravel (backend) + Vite (plugin Laravel) para assets frontend.
- Estilos: TailwindCSS configurado vía laravel-vite-plugin.
- Propósito: exponer endpoints y servir el frontend asociado; orquestación de datos, autenticación, y lógica de negocio del lado del servidor.

Estructura relevante (observación general)
- app/         (lógica de servidor, controladores, modelos, etc.)
- resources/   (vistas Blade o recursos; CSS/JS compilados vía Vite)
- routes/      (definición de rutas web/api)
- config/      (configuraciones de la aplicación)
- vite.config.js (configuración de Vite para Laravel)

Dependencias y ecosistema
- Node.js: se recomienda versión LTS reciente para compilar assets con Vite.
- Administrador de dependencias: npm (observa package.json en Backend).
- Librerías clave: vite, laravel-vite-plugin, tailwindcss, axios, concurrently (para tareas paralelas), etc.

Config y scripts locales
- Instalar dependencias: npm install (desde la carpeta Backend)
- Ejecutar en modo desarrollo: npm run dev (levanta Vite para assets)
- Construir assets de producción: npm run build
- Construir y/o ejecutar el servidor Laravel: según el proyecto, normalmente se usa php artisan serve para el servidor API; asegúrate de tener PHP instalado y las dependencias de Composer si aplica.
- Notas sobre Laravel: si el proyecto está configurado para usar Laravel, revisa .env y la configuración de la base de datos y endpoints de la API.

Guía de contribución rápida
- Mantén consistencia en las rutas y en la organización de assets para facilitar el deployment.
- Usa TailwindCSS para estilos y evita estilos CSS globales no necesarios cuando ya exista una utilidad de Tailwind.
- Verifica que el servidor de desarrollo compila correctamente los assets y que la ruta de entrada de assets (resources/js/app.js y resources/css/app.css) esté correctamente referenciada por Laravel/Vite.

Notas finales
- Este README ofrece una guía básica para empezar rápido. Si hay particularidades (endpoints, variables de entorno, o scripts custom) que deban añadirse, agrégalos conforme evolucionen las ramas del proyecto.
