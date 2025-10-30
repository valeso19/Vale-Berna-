# Berna & Vale - Organizador de Boda (Web App)

Esta es una **Web App PWA** pensada para organizar un casamiento. Está hecha para correr sin servidor (todo en el navegador) y puede alojarse en **GitHub Pages**.

## Qué incluye
- index.html, styles.css, app.js
- manifest.json y service worker (sw.js) para modo offline básico
- /assets (iconos de ejemplo)

## Cómo probar localmente
1. Descargar o clonar el repositorio.
2. Abrir `index.html` en un navegador (mejor usar un servidor local para que el service worker funcione).
   - Por ejemplo: `npx serve .` o `python -m http.server 8000`
3. Usar la app desde el navegador móvil o de escritorio.

## Cómo publicar en GitHub Pages
1. Crear un nuevo repositorio en GitHub.
2. Subir todos los archivos (puedes arrastrar y soltar en la interfaz de GitHub).
3. En la configuración del repo -> Pages -> seleccionar `main` branch y `/ (root)` como carpeta.
4. Guardar: GitHub generará una URL `https://<tu-usuario>.github.io/<repo>`.

## Notas
- Los datos se guardan en `localStorage` del navegador. Para migrar a IndexedDB se puede adaptar `app.js`.
- Exportá datos con el botón "Exportar JSON" para respaldos.
- El app está pensada para usarse desde el navegador móvil; el service worker hace cache del app shell.\n