---
name: senior-ux-ui-streaming
description: Equipo Senior de Arquitectura y Diseño UX/UI para Plataformas de Streaming, Smart TV (55 pulgadas) y Mobile. Activar para construir interfaces cinematográficas de nivel Apple TV+, DAZN y Netflix, con botones de cristal de lujo, tarjetas de emisión con iluminación ambiental, micro-interacciones fluidas, modales cinematográficos y cero diseño plano o genérico.
---

# Senior Streaming UX/UI Design System & Architecture

Este Skill define los estándares de diseño, arquitectura visual y componentes de alta gama para la plataforma de streaming deportivo y entretenimiento.

---

## 1. Filosofía Visual: Cero Diseño Genérico (Estilo Apple TV+ / DAZN)

1. **Profundidad y Obsidian Glassmorphism**:
   - Prohibido fondos planos en gris sólido o negro puro #000000 mate.
   - Fondo base de obsidiana profunda #07080b combinado con mallas de gradientes radiales sutiles (azul índigo, esmeralda y naranja cálido).
   - Tarjetas y paneles usan superficies de cristal translúcido (rgba(18, 22, 34, 0.85)) con desenfoque de fondo (backdrop-filter: blur(24px)) y borde superior de luz (inset 0 1px 0 rgba(255,255,255,0.12)).

2. **Tipografía Jerárquica y Legible a Distancia**:
   - Fuente principal: 'Outfit' (sans-serif geométrica de alta legibilidad en pantallas 4K y televisores de 55 pulgadas).
   - Pesos bien contrastados: 950 para títulos de cartelera, 800 para botones y badges, 600 para textos secundarios.

3. **Iluminación Dinámica Ambiental (Ambient Glow)**:
   - Cada tarjeta de canal o evento cuenta con un orbe de brillo desenfocado (filter: blur(35px)) con el color distintivo de la señal (ej. Verde esmeralda para deportes, rojo para live, azul para series).
   - Al hacer foco o hover, el brillo ambiental se expande y eleva la tarjeta con una sombra de dispersión de lujo.

---

## 2. Estándares Oficiales de Componentes

### A. Botones de Acción de Alta Gama (Luxury Buttons)
- **Botón Primario (Hero / Play)**:
  - Gradiente esmeralda vibrante (linear-gradient(135deg, #10b981 0%, #059669 100%)).
  - Sombra difusa (box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4)).
  - Borde interno sutil y micro-interacción al hacer clic/enter (scale: 0.97 en tap, scale: 1.05 en hover/focus con halo blanco de 3px).
- **Botón Secundario de Cristal (Glass Pill)**:
  - Fondo rgba(255, 255, 255, 0.08) con backdrop-filter: blur(16px).
  - Borde fino 1px solid rgba(255, 255, 255, 0.18).
  - Texto blanco puro con icono Lucide SVG integrado.
- **Botones de Control y Navegación**:
  - Altura táctil mínima de 44px en celular y 52px en TV.

### B. Tarjetas de Transmisión (Broadcast Cards)
- Formato apaisado cinemático con esquinas redondeadas (border-radius: 20px).
- **Insignias de Estado**:
  - Pill de En Vivo con ecualizador animado en tiempo real de 3 barras (#f43f5e).
  - Pill de resolución (1080p Full HD, 60 FPS).
- **Logo del Canal / Escudo**:
  - Emblema flotante en caja de cristal con sombra profunda y bordes redondeados.
- **Micro-interacciones**:
  - En hover o selección del control remoto: zoom suave (transform: translateY(-6px) scale(1.03)), encendido del botón de Play flotante y borde esmeralda brillante.

### C. Barra de Navegación Híbrida (TV Rail + Mobile Bottom Dock)
- **Desktop y Smart TV**: Rail vertical colapsable lateral izquierdo de 80px (expandible a 260px con etiquetas y logo).
- **Mobile (<768px)**: Muelle flotante inferior (Bottom Navigation Dock) con acabado frosted glass (backdrop-filter: blur(28px)), iconos Lucide centrados con texto compacto y área táctil generosa.

### D. Reproductor Cinema & Modales
- Fondo de desenfoque cinematográfico (backdrop-filter: blur(40px) oscuro).
- Pestañas selectoras con recuento dinámico (badges), chips de servidores de streaming con prueba de latencia y estado en tiempo real.
