const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchM3u(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseM3u(text, defaultCat, badge) {
  const lines = text.split('\n');
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const url = (lines[i+1] || '').trim();
      if (url.startsWith('http')) {
        const parts = line.split(',');
        const rawName = parts[parts.length - 1].trim();
        const cleanName = rawName.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
        
        let logo = '';
        const matchLogo = line.match(/tvg-logo="([^"]+)"/);
        if (matchLogo) logo = matchLogo[1];

        results.push({
          id: 'iptv-' + Math.random().toString(36).substr(2, 9),
          name: cleanName || rawName,
          shortName: (cleanName || rawName).substring(0, 5).toUpperCase(),
          color: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          category: defaultCat,
          tournament: badge || 'Fútbol & Deportes',
          logo: logo,
          description: `Transmisión oficial de ${cleanName}.`,
          streamUrl: url,
          isLive: true,
          badge: badge || 'M3U'
        });
      }
    }
  }
  return results;
}

async function main() {
  console.log("Descargando listas M3U oficiales...");
  try {
    const [sportsData, peData, arData] = await Promise.all([
      fetchM3u('https://iptv-org.github.io/iptv/categories/sports.m3u'),
      fetchM3u('https://iptv-org.github.io/iptv/countries/pe.m3u'),
      fetchM3u('https://iptv-org.github.io/iptv/countries/ar.m3u')
    ]);

    const sportsChannels = parseM3u(sportsData, 'deportes', 'DEPORTES').slice(0, 40);
    const peChannels = parseM3u(peData, 'nacionales', 'PERÚ').slice(0, 30);
    const arChannels = parseM3u(arData, 'nacionales', 'ARGENTINA').slice(0, 20);

    console.log(`Descargados: ${sportsChannels.length} deportes, ${peChannels.length} Perú, ${arChannels.length} Argentina.`);

    const all = [...peChannels, ...sportsChannels, ...arChannels];
    fs.writeFileSync(path.join(__dirname, 'm3u_channels.json'), JSON.stringify(all, null, 2), 'utf8');
    console.log("Guardado en m3u_channels.json!");
  } catch (err) {
    console.error("Error al descargar:", err);
  }
}

main();
