# TAJHO TV — Smart TV Streaming Platform (Hisense VIDAA & Web)

<p align="center">
  <img src="logo.png" alt="TAJHO TV Logo" width="140" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
</p>

<p align="center">
  <strong>Plataforma Senior de Fútbol y Deportes en Vivo para Smart TV Hisense VIDAA OS, Android TV y Web</strong><br>
  <em>Arquitectura High-Availability con Conmutación Multi-Servidor Anti-Caídas, Buscador Inteligente y PWA Standalone.</em>
</p>

---

## 🌟 Características Principales

- 📺 **Diseñada para Smart TV de 55"**: UI cinemática estilo Apple TV y DAZN, escalada y optimizada para resolución 4K/1080p.
- 🎮 **Navegación Espacial 100% por Control Remoto (D-Pad)**: Flechas (Arriba, Abajo, Izquierda, Derecha), OK, y botón Volver con feedback sonoro sintético vía Web Audio API.
- ⚡ **Buscador de Canales Inteligente**: Búsqueda en tiempo real por canal, torneo o país, con chips de filtrado rápido a 1 clic (*ESPN, TyC Sports, Win Sports, Liga 1 Perú, Real Madrid, En Directo*).
- 🛡️ **Motor Anti-Caídas (Failover Automático)**: Cada canal cuenta con múltiples servidores espejo; si uno falla o entra en buffer prolongado, conmuta automáticamente en menos de 500ms.
- 📡 **Analizador Inteligente de Plataformas & M3U**: Extrae señales de vídeo y canales en vivo desde cualquier enlace o web con 4 presets mundiales a 1 clic.
- 🚀 **100% Independiente en la Nube**: Funciona directamente desde GitHub Pages como PWA sin necesidad de instalar nada en la computadora.

---

## 📺 Cómo Abrir en tu Smart TV Hisense

1. En tu TV Hisense, abre el **Navegador Web** (Browser).
2. Ingresa a la URL oficial en GitHub Pages:
   ```text
   https://tajho.github.io/tajho-tv/
   ```
3. En el menú del navegador del TV, presiona **"Fijar en el Inicio"** o **"Añadir a Aplicaciones"**.
4. ¡Listo! Tendrás el icono de **TAJHO TV** directamente en tu pantalla de inicio junto a Netflix y YouTube para abrirlo a pantalla completa.

---

## 🛠️ Tecnologías

- **HTML5 / CSS3 / ES6+** — Arquitectura nativa sin dependencias pesadas.
- **Hls.js** — Motor de streaming HTTP Live Streaming (HLS).
- **Web App Manifest & Service Worker (PWA)** — Soporte Standalone para VIDAA OS.
- **Web Audio API** — Sintetizador de sonido de navegación para mandos a distancia.

---
© 2026 TAJHO TV. Todos los derechos reservados.
