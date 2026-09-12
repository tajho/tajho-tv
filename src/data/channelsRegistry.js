/**
 * TAJHO TV — CANALES DEPORTIVOS REALES Y VERIFICADOS
 * Transmisiones en vivo estables con arquitectura de conmutación multi-servidor
 */

export const CHANNELS_REGISTRY = [
  // --- PARTIDOS & SEÑALES EN VIVO (HERO & DIRECTO) ---
  {
    id: "live-espn2",
    featured: true,
    name: "ESPN 2 HD",
    subtitle: "ESPN 2 — En Vivo",
    title: "UEFA Champions League & Fútbol Internacional",
    category: "destacados",
    badge: "EN VIVO",
    isLive: true,
    quality: "1080p • 60 FPS",
    callsign: "ESPN2",
    color: "linear-gradient(135deg, #cc0000 0%, #8b0000 100%)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN2_logo.svg",
    heroBg: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&auto=format&fit=crop&q=85",
    description: "Transmisión en directo de la Champions League, Premier League, Serie A y torneos internacionales con señal digital de alta definición.",
    sources: [
      { name: "Servidor 1 (Fibra HD)", url: "http://138.121.15.230:9002/ESPN-2/index.m3u8" },
      { name: "Servidor 2 (Respaldo)", url: "http://138.121.15.230:9002/ESPN-3/index.m3u8" }
    ]
  },
  {
    id: "live-tyc",
    featured: true,
    name: "TyC Sports HD",
    subtitle: "TyC Sports — Fútbol en Vivo",
    title: "Liga Profesional & Copa Argentina",
    category: "destacados",
    badge: "SUDAMÉRICA",
    isLive: true,
    quality: "1080p • 60 FPS",
    callsign: "TyC",
    color: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/TyC_Sports_logo.svg",
    heroBg: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&auto=format&fit=crop&q=85",
    description: "Toda la cobertura del fútbol argentino, Primera División, entrevistas exclusivas y transmisiones de la Selección.",
    sources: [
      { name: "Servidor 1 (Satélite HD)", url: "http://15.204.246.24:8080/TyCSportsHD/index.m3u8" },
      { name: "Servidor 2 (Fibra Argentina)", url: "http://45.134.141.161:2200/ARG/TyC_Sports_HD/index.m3u8" }
    ]
  },
  {
    id: "live-rmtv",
    featured: true,
    name: "Real Madrid TV HD",
    subtitle: "Real Madrid TV — 24/7",
    title: "LaLiga & Champions League",
    category: "destacados",
    badge: "OFICIAL",
    isLive: true,
    quality: "1080p • 60 FPS",
    callsign: "RMTV",
    color: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    heroBg: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1920&auto=format&fit=crop&q=85",
    description: "Canal oficial del Real Madrid CF en vivo: ruedas de prensa, entrenamientos, partidos históricos y previas en directo.",
    sources: [
      { name: "Servidor 1 (Oficial Akamai)", url: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8" },
      { name: "Servidor 2 (Mirror Europa)", url: "http://88.212.15.19/live/real_madrid_tv/index.m3u8" }
    ]
  },

  // --- CATEGORÍA 1: CANALES DEPORTIVOS PREMIUM (VERIFICADOS) ---
  {
    id: "ch-espn2",
    name: "ESPN 2 HD",
    callsign: "ESPN2",
    color: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
    category: "deportes",
    badge: "PREMIUM",
    quality: "1080p",
    tournament: "FÚTBOL INTERNACIONAL",
    description: "UEFA Champions League, Premier League, LaLiga y SportsCenter.",
    sources: [
      { name: "Servidor 1 (Fibra)", url: "http://138.121.15.230:9002/ESPN-2/index.m3u8" },
      { name: "Servidor 2 (Respaldo)", url: "http://138.121.15.230:9002/ESPN-3/index.m3u8" }
    ]
  },
  {
    id: "ch-espn3",
    name: "ESPN 3 HD",
    callsign: "ESPN3",
    color: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    category: "deportes",
    badge: "PREMIUM",
    quality: "1080p",
    tournament: "DEPORTES & MOTOR",
    description: "Fórmula 1, Moto GP, Serie A y torneos internacionales en directo.",
    sources: [
      { name: "Servidor 1 (Directo)", url: "http://138.121.15.230:9002/ESPN-3/index.m3u8" },
      { name: "Servidor 2 (Respaldo)", url: "http://138.121.15.230:9002/ESPN-4/index.m3u8" }
    ]
  },
  {
    id: "ch-espn4",
    name: "ESPN 4 HD",
    callsign: "ESPN4",
    color: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    category: "deportes",
    badge: "PREMIUM",
    quality: "1080p",
    tournament: "COPAS INTERNACIONALES",
    description: "Transmisiones simultáneas de fútbol europeo y torneos de tenis ATP.",
    sources: [
      { name: "Servidor 1 (Fibra)", url: "http://138.121.15.230:9002/ESPN-4/index.m3u8" },
      { name: "Servidor 2 (Respaldo)", url: "http://138.121.15.230:9002/ESPN-2/index.m3u8" }
    ]
  },
  {
    id: "ch-tyc",
    name: "TyC Sports HD",
    callsign: "TyC",
    color: "linear-gradient(135deg, #0284c7 0%, #075985 100%)",
    category: "deportes",
    badge: "ARGENTINA",
    quality: "1080p 60FPS",
    tournament: "LIGA PROFESIONAL",
    description: "El canal líder de deportes en Argentina con fútbol en directo y debate.",
    sources: [
      { name: "Servidor 1 (HD Directo)", url: "http://15.204.246.24:8080/TyCSportsHD/index.m3u8" },
      { name: "Servidor 2 (Mirror Fibra)", url: "http://45.134.141.161:2200/ARG/TyC_Sports_HD/index.m3u8" }
    ]
  },
  {
    id: "ch-win",
    name: "Win Sports HD",
    callsign: "WIN",
    color: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
    category: "deportes",
    badge: "COLOMBIA",
    quality: "1080p",
    tournament: "LIGA BETPLAY",
    description: "Fútbol Profesional Colombiano, Copa Colombia y programas estelares.",
    sources: [
      { name: "Servidor 1 (Transmisión HD)", url: "http://138.121.15.230:9002/WIN-SPORT/index.m3u8" }
    ]
  },
  {
    id: "ch-azteca",
    name: "Azteca Deportes HD",
    callsign: "AZTECA",
    color: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    category: "deportes",
    badge: "MÉXICO",
    quality: "1080p 60FPS",
    tournament: "LIGA MX & BOX",
    description: "Fútbol mexicano de Primera División, Box Azteca y Selección Nacional.",
    sources: [
      { name: "Servidor 1 (Oficial 1080p)", url: "http://181.119.66.28:8081/AZTECA-DEPORTES-HD/index.m3u8" }
    ]
  },
  {
    id: "ch-bein",
    name: "beIN SPORTS XTRA",
    callsign: "beIN",
    color: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    category: "deportes",
    badge: "INTERNACIONAL",
    quality: "1080p",
    tournament: "LIGUE 1 & COPA LIBERTADORES",
    description: "Ligue 1 de Francia, Copa Libertadores y eventos internacionales exclusivos.",
    sources: [
      { name: "Servidor 1 (CDN Amagi)", url: "https://bein-xtra-bein.amagi.tv/playlist.m3u8" }
    ]
  },
  {
    id: "ch-golazo",
    name: "CBS Sports Golazo",
    callsign: "GOLAZO",
    color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    category: "deportes",
    badge: "CHAMPIONS LEAGUE",
    quality: "720p 60FPS",
    tournament: "UEFA CHAMPIONS LEAGUE",
    description: "Canal especializado 24/7 en fútbol mundial: análisis, goles y UEFA Champions League.",
    sources: [
      { name: "Servidor 1 (Google DAI Oficial)", url: "https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8" }
    ]
  },

  // --- CATEGORÍA 2: CLUBES & LIGAS EUROPEAS ---
  {
    id: "ch-rmtv",
    name: "Real Madrid TV",
    callsign: "RMTV",
    color: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
    category: "torneos",
    badge: "ESPAÑA",
    quality: "720p HD",
    tournament: "LALIGA EA SPORTS",
    description: "Partidos en diferido, análisis táctico y entrevistas del Real Madrid.",
    sources: [
      { name: "Servidor 1 (Oficial Akamai)", url: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8" },
      { name: "Servidor 2 (Europa Directo)", url: "http://88.212.15.19/live/real_madrid_tv/index.m3u8" }
    ]
  },
  {
    id: "ch-tdp",
    name: "Teledeporte RTVE",
    callsign: "TDP",
    color: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
    category: "torneos",
    badge: "RTVE OFICIAL",
    quality: "1080p",
    tournament: "POLIDEPORTIVO ESPAÑOL",
    description: "Señal pública española de alta gama: fútbol, ciclismo, atletismo y tenis.",
    sources: [
      { name: "Servidor 1 (RTVE Cloud)", url: "https://rtve01p.origin.c21livecloud.com/live-origin/tdp-hls/bitrate_1.m3u8" }
    ]
  },
  {
    id: "ch-esport3",
    name: "Esport3 Catalunya",
    callsign: "ESPORT3",
    color: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
    category: "torneos",
    badge: "CATALUNYA",
    quality: "1080p 60FPS",
    tournament: "FÚTBOL & BASKET",
    description: "Canal deportivo de TV3: cobertura exhaustiva del FC Barcelona, Girona y Espanyol.",
    sources: [
      { name: "Servidor 1 (3Cat CDN Direct)", url: "https://directes-tv-int.3catdirectes.cat/live-content/esport3-hls/master.m3u8" }
    ]
  },
  {
    id: "ch-sevilla",
    name: "Sevilla FC TV",
    callsign: "SFC",
    color: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
    category: "torneos",
    badge: "OFICIAL",
    quality: "HD",
    tournament: "LALIGA EA SPORTS",
    description: "Emisión oficial de los partidos, ruedas de prensa y documentales del Sevilla FC.",
    sources: [
      { name: "Servidor 1 (StreamAMG)", url: "https://open.http.mp.streamamg.com/p/3001314/sp/300131400/playManifest/entryId/0_ye0b8tc0/format/applehttp/protocol/https/uiConfId/30026292/a.m3u8" }
    ]
  },

  // --- CATEGORÍA 3: TRANSMISIONES 24/7 & ALTA DISPONIBILIDAD ---
  {
    id: "ch-redbull",
    name: "Red Bull TV Sports",
    callsign: "REDBULL",
    color: "linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)",
    category: "fijos",
    badge: "24/7 ONLINE",
    quality: "1080p 60FPS",
    tournament: "EXTREME & MOTOR",
    description: "Fórmula 1, eventos mundiales de fútbol freestyle, acrobacia y deportes extremos 24/7.",
    sources: [
      { name: "Servidor 1 (Akamai Global)", url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8" }
    ]
  },
  {
    id: "ch-arena1",
    name: "Arena Sport 1 HD",
    callsign: "ARENA1",
    color: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
    category: "fijos",
    badge: "INTERNACIONAL",
    quality: "1080p",
    tournament: "FÚTBOL TOP EUROPEO",
    description: "Retransmisión de partidos estelares de las mejores ligas del planeta.",
    sources: [
      { name: "Servidor 1 (Live Feed)", url: "http://88.212.15.19/live/test_arenasport/playlist.m3u8" }
    ]
  },
  {
    id: "ch-arena2",
    name: "Arena Sport 2 HD",
    callsign: "ARENA2",
    color: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
    category: "fijos",
    badge: "INTERNACIONAL",
    quality: "1080p",
    tournament: "COPAS & LIGAS",
    description: "Señal alternativa para encuentros en simultáneo de copas internacionales.",
    sources: [
      { name: "Servidor 1 (Live Feed)", url: "http://88.212.15.19/live/test_arenasport_dva/playlist.m3u8" }
    ]
  }
];

export const SECTIONS = [
  { 
    id: "destacados", 
    title: "EN VIVO AHORA — Partidos Estelares", 
    icon: `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>` 
  },
  { 
    id: "deportes", 
    title: "Canales Deportivos Premium HD", 
    icon: `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>` 
  },
  { 
    id: "torneos", 
    title: "Clubes & Ligas Europeas", 
    icon: `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>` 
  },
  { 
    id: "fijos", 
    title: "Transmisiones 24/7 de Alta Disponibilidad", 
    icon: `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` 
  },
  { 
    id: "personalizados", 
    title: "Mis Canales y Listas M3U", 
    icon: `<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>` 
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHANNELS_REGISTRY, SECTIONS };
}
