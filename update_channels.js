const fs = require('fs');
const path = require('path');

const m3uList = JSON.parse(fs.readFileSync(path.join(__dirname, 'm3u_channels.json'), 'utf8'));

// Also keep the match day cards and 24/7 sports
const matchCards = [
  {
    id: "match-1",
    name: "Red Bull TV Deportes 24/7",
    shortName: "RB TV",
    color: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
    category: "partidos",
    tournament: "Deportes Extremos & Competición",
    time: "EN VIVO",
    description: "Transmisión oficial de eventos deportivos internacionales.",
    streamUrl: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    isLive: true,
    badge: "24/7 EN VIVO"
  },
  {
    id: "match-2",
    name: "Mux Deportes HD",
    shortName: "MUX",
    color: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    category: "partidos",
    tournament: "Señal Satelital Abierta",
    time: "EN VIVO",
    description: "Señal deportiva continua en alta definición.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    badge: "HD"
  }
];

const allChannels = [...matchCards, ...m3uList];

const code = `// Base de datos de Canales M3U y Partidos para Fútbol TV Portal
const DEFAULT_CHANNELS = ${JSON.stringify(allChannels, null, 2)};

const CATEGORIES = [
  { id: "partidos", name: "Señales en Vivo", icon: "🏆" },
  { id: "deportes", name: "Deportes M3U", icon: "⚽" },
  { id: "nacionales", name: "Perú & Argentina M3U", icon: "📺" },
  { id: "personalizados", name: "Mis Canales (M3U / URL)", icon: "🔗" }
];
`;

fs.writeFileSync(path.join(__dirname, 'channels.js'), code, 'utf8');
console.log('Channels updated successfully! Total channels:', allChannels.length);
