# Frontend - Digital TV (Next.js + React)

Este módulo corresponde al frontend de la aplicación Digital TV. Es una aplicación Next.js (React) con TypeScript y TailwindCSS, orientada a entregar una interfaz de usuario moderna y responsive.

Contexto general
- Arquitectura: Next.js 16.x con React y TypeScript.
- Estilos: TailwindCSS; utilidades y clases para componentes UI.
- Librerías destacadas: Radix UI (componentes accesibles), form handling (react-hook-form), zod para validaciones, y otras utilidades de UI/UX.
- Propósito: consumir APIs del backend y renderizar la experiencia de usuario de forma eficiente y accesible.

Estructura relevante (observación general de carpetas comunes)
- pages / app: rutas y vistas (según configuración de Next.js); componentes reutilizables en components.
- components: componentes UI reutilizables (botones, tarjetas, menús, etc.).
- lib: utilidades y API helpers (p. ej. llamadas a API, manejo de tokens, etc.).
- contexts: contextos de React para estado global (autenticación, temas, etc.).
- hooks: ganchos personalizados (útil para lógica compartida).
- styles: estilos globales o configuraciones de Tailwind (si existieran).
- public: activos estáticos (imágenes, fuentes, etc.).

Requisitos y dependencias
- Node.js: se recomienda usar una versión LTS reciente (p. ej. 18.x o superior).
- Gestor de paquetes: npm (por el presence de package-lock.json). También es compatible con pnpm o yarn si se prefiere, pero este proyecto usa npm en los scripts proporcionados.
- Dependencias clave (extracto de package.json):
  - next, react, react-dom, typescript
  - tailwindcss, postcss, autoprefixer
  - lib/search, UI components y herramientas de desarrollo (ej. lucide-react, date-fns, recharts, etc.)

Config y scripts locales
- Instalar dependencias: npm install
- Ejecutar en modo desarrollo: npm run dev
- Construir para producción: npm run build
- Iniciar el servidor de producción local: npm start
- Linter: npm run lint

Notas de entorno
- Variables de entorno: las configuraciones sensibles deben estar en un archivo .env.local (no se debe subir al repositorio). El proyecto utiliza variables de entorno de Next.js para endpoints, claves y flags de características.
- Vínculos al backend: la app frontend consume APIs del backend; asegúrate de que las URL de API estén configuradas correctamente en el entorno.

Guía de contribución rápida
- Duplicar y adaptar componentes desde /components cuando haya cambios visuales o de comportamiento repetidos.
- Mantener tipado con TypeScript; añadir tests de UI si corresponde.
- Ejecutar lint y pruebas si existieran en este repositorio local.

Notas finales
- Este README debe servir como guía para emergencias rápidas y para nuevos contributors que quieran entender el propósito y uso del frontend. Mantén este documento actualizado conforme evoluciona la arquitectura o el stack tecnológico.

¿Quieres que adapte este README a una estructura de carpetas exacta si me compartes el árbol de directorios completo?
