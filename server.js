const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { URL } = require('url');

const PORT = 8080;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
  '.mp4': 'video/mp4'
};

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  // CORS Headers for Smart TV
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- STREAMING PROXY (BYPASS CORS FOR SMART TV) ---
  if (req.url.startsWith('/proxy')) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      const targetUrl = parsed.searchParams.get('url');
      if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Parametro url requerido');
        return;
      }

      const client = targetUrl.startsWith('https') ? https : http;
      const proxyReq = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (SmartTV; VIDAA/6.0) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Referer': targetUrl
        }
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
          ...proxyRes.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Error de conexion con el stream: ' + err.message);
      });
      return;
    } catch (e) {
      res.writeHead(500);
      res.end('Error proxy: ' + e.message);
      return;
    }
  }

  // --- PLATFORM & CHANNEL ANALYZER API ---
  if (req.url.startsWith('/api/analyze')) {
    const CORS_HEADERS = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    };

    try {
      const parsed = new URL(req.url, 'http://localhost');
      const targetUrl = parsed.searchParams.get('url');
      if (!targetUrl) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ success: false, error: 'Parámetro url requerido' }));
        return;
      }

      async function fetchWithRedirects(target, maxRedirects = 5) {
        let current = target;
        for (let i = 0; i < maxRedirects; i++) {
          const u = new URL(current);
          const client = u.protocol === 'https:' ? https : http;
          const resp = await new Promise((resolve, reject) => {
            const r = client.get(current, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Referer': current
              },
              timeout: 35000
            }, resolve);
            r.on('error', reject);
            r.on('timeout', () => { r.destroy(); reject(new Error('Tiempo de espera agotado al descargar la lista')); });
          });

          if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
            current = new URL(resp.headers.location, current).href;
            continue;
          }

          const chunks = [];
          for await (const chunk of resp) chunks.push(chunk);
          const body = Buffer.concat(chunks).toString('utf-8');
          return { finalUrl: current, statusCode: resp.statusCode, body };
        }
        throw new Error('Demasiadas redirecciones');
      }

      fetchWithRedirects(targetUrl).then(({ finalUrl, body }) => {
        const isM3u = body.includes('#EXTM3U') || body.includes('#EXTINF:') || finalUrl.includes('.m3u') || finalUrl.includes('.m3u8');

        if (isM3u && !body.includes('<!DOCTYPE') && !body.includes('<html')) {
          if (body.includes('#EXT-X-TARGETDURATION') || (body.includes('#EXT-X-STREAM-INF') && !body.includes('#EXTINF:'))) {
            res.writeHead(200, CORS_HEADERS);
            res.end(JSON.stringify({
              success: true,
              type: 'stream',
              title: 'Transmisión HLS Directa',
              count: 1,
              channels: [{
                name: 'Canal Directo HD',
                streamUrl: finalUrl,
                type: 'hls',
                tournament: 'Señal en Vivo'
              }]
            }));
            return;
          }

          const lines = body.split('\n');
          const channels = [];
          let cur = null;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
              const nameMatch = line.match(/,(.+)$/);
              const logoMatch = line.match(/tvg-logo="([^"]+)"/);
              const groupMatch = line.match(/group-title="([^"]+)"/);
              cur = {
                name: nameMatch ? nameMatch[1].trim() : 'Canal Detectado',
                logo: logoMatch ? logoMatch[1] : '',
                tournament: groupMatch ? groupMatch[1] : 'Lista M3U'
              };
            } else if (line.startsWith('http') && cur) {
              cur.streamUrl = line;
              channels.push(cur);
              cur = null;
            }
          }

          res.writeHead(200, CORS_HEADERS);
          res.end(JSON.stringify({
            success: true,
            type: 'm3u',
            title: 'Lista M3U Extraída',
            count: channels.length,
            channels: channels.slice(0, 200)
          }));
          return;
        }

        // Web Page / HTML Scraper
        const channels = [];
        const seen = new Set();
        const m3u8Regex = /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi;
        let m;
        while ((m = m3u8Regex.exec(body)) !== null) {
          let stream = m[0].replace(/\\/g, '').replace(/['";,]+$/, '');
          if (!seen.has(stream)) {
            seen.add(stream);
            channels.push({
              name: `Señal Extraída #${channels.length + 1}`,
              streamUrl: stream,
              type: 'hls',
              tournament: 'Stream Web HLS'
            });
          }
        }

        const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
        while ((m = iframeRegex.exec(body)) !== null) {
          let ifr = m[1];
          if (ifr.startsWith('//')) ifr = 'https:' + ifr;
          if (ifr.startsWith('http') && !seen.has(ifr)) {
            seen.add(ifr);
            channels.push({
              name: `Reproductor Web #${channels.length + 1}`,
              streamUrl: ifr,
              type: 'iframe',
              tournament: 'Embed de Plataforma'
            });
          }
        }

        const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1].trim() : targetUrl;

        res.writeHead(200, CORS_HEADERS);
        res.end(JSON.stringify({
          success: true,
          type: 'webpage',
          title: pageTitle,
          count: channels.length,
          channels
        }));
      }).catch(err => {
        res.writeHead(500, CORS_HEADERS);
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
      return;
    } catch (err) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ success: false, error: err.message }));
      return;
    }
  }

  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Archivo No Encontrado');
      } else {
        res.writeHead(500);
        res.end(`Error del servidor: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('\n=============================================================');
  console.log('   TAJHO TV - SERVIDOR ACTIVO PARA TU TV HISENSE 55"');
  console.log('=============================================================');
  console.log(`   1. Asegúrate que tu TV Hisense y esta PC estén en el mismo Wi-Fi.`);
  console.log(`   2. En tu TV Hisense abre la app "Navegador" (Browser).`);
  console.log(`   3. Escribe esta dirección en la barra de navegación:`);
  console.log(`\n      --> http://${localIp}:${PORT} <--\n`);
  console.log(`   4. Para probar en esta PC abre: http://localhost:${PORT}`);
  console.log('=============================================================\n');
});
