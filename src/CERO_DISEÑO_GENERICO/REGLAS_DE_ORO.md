# SISTEMA DE DISEÑO — TAJHO TV
## DIRECTRICES DE DESARROLLO: CERO DISEÑO GENÉRICO & PROHIBIDO REINVENTAR LA RUEDA

---

### 🏆 1. REGLA: CERO DISEÑO GENÉRICO (ZERO GENERIC DESIGN)
Esta plataforma está diseñada para pantallas gigantes de 55" Smart TV (Hisense VIDAA OS, Android TV) y dispositivos móviles de alta gama (iOS / Android). 
Bajo ninguna circunstancia se admiten componentes planos, grises o genéricos.

#### Estándares Visuales Obligatorios:
1. **Acabado Glassmorphism & OLED Dark:** Fondos profundos (#07080b, #0d1117, #161b26) con desenfoque de cristal (backdrop-filter: blur(24px)) y sutiles reflejos de luz superiores.
2. **Resplandor Ambiental Dinámico (Ambient Glow):** Cada tarjeta proyecta un halo de luz ambiental difuminado (radial-gradient) con el color de la señal (Rojo ESPN, Celeste TyC, Azul Real Madrid, Naranja Win Sports).
3. **Ecualizador de Vídeo/Audio en Vivo (Live Equalizer):** En lugar de un punto rojo estático, cada transmisión activa muestra un ecualizador de 4 barras animadas en tiempo real.
4. **Emblema de Cristal & Botón de Acción Flotante:** Logotipos en cápsulas biseladas y botón circular de reproducción que se expande con físicas suaves al enfocar con el mando o interactuar por toque.
5. **Tipografía Jerárquica Ultra-Bold:** Uso de la tipografía Outfit en pesos 700, 850 y 950 con micro-espaciados para máxima legibilidad a 3 metros de distancia en TV.

---

### 🚀 2. REGLA: PROHIBIDO REINVENTAR LA RUEDA
Se utilizan exclusivamente las mejores librerías oficiales y estándares modernos:
* **React 19 (react, react-dom):** Componentización modular, hooks declarativos (useCallback, useRef, useState, useEffect).
* **Lucide React (lucide-react):** Suite oficial de iconos SVG vectoriales sin pixelado ni dependencias pesadas.
* **Hls.js (hls.js):** Motor de streaming HLS oficial para reproducción adaptive bitrate, buffer stall recovery y conmutación de espejos.
* **Vite 6 (vite):** Bundler ultrarrápido configurado con salida optimizada para despliegue universal en GitHub Pages.
* **Web Audio API:** Síntesis nativa por oscilador sinusoidal y triangular para retroalimentación sonora al navegar con el mando de la TV.
