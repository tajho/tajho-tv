import { useState, useCallback } from 'react';

export function useM3uParser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const parseM3uUrl = useCallback(async (rawUrl) => {
    setLoading(true);
    setError(null);

    try {
      let text = '';
      try {
        const res = await fetch(rawUrl);
        if (res.ok) text = await res.text();
      } catch (err) {
        console.warn('Direct M3U fetch failed, fallback to CORS proxy...');
      }

      if (!text) {
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rawUrl);
        const res = await fetch(proxyUrl);
        if (res.ok) text = await res.text();
      }

      if (!text) {
        throw new Error('No se pudo descargar la lista M3U. Verifica que el enlace sea accesible.');
      }

      const lines = text.split('\n');
      const allExtracted = [];
      let cur = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          const nameMatch = line.match(/,(.+)$/);
          const groupMatch = line.match(/group-title="([^"]+)"/);
          const logoMatch = line.match(/tvg-logo="([^"]+)"/);
          const rawName = nameMatch ? nameMatch[1].trim() : 'Canal';
          const isGeo = line.toLowerCase().includes('geo-blocked') || rawName.toLowerCase().includes('geo-blocked');
          const group = groupMatch ? groupMatch[1].trim() : 'General';

          const resMatch = rawName.match(/\((\d+p)\)/i);
          const resolution = resMatch ? resMatch[1] : '1080p';
          const cleanName = rawName.replace(/\(\d+p\)/gi, '').replace(/\[[^\]]+\]/g, '').trim();

          cur = {
            name: cleanName,
            rawName: rawName,
            group: group,
            logo: logoMatch ? logoMatch[1] : '',
            resolution: resolution,
            isGeo: isGeo
          };
        } else if (line.startsWith('http') && cur) {
          cur.streamUrl = line;
          const isInternalIp = line.includes('39.134.') || line.includes('117.156.') || line.includes('112.25.') || line.includes('223.110.') || line.includes('127.0.0.1');
          if (!cur.isGeo && !isInternalIp) {
            allExtracted.push(cur);
          }
          cur = null;
        }
      }

      if (allExtracted.length === 0) {
        throw new Error('No se detectaron canales abiertos reproducibles en este enlace.');
      }

      const sportsKeywords = ['sport', 'futbol', 'football', 'soccer', 'deport', 'liga', 'copa', 'champions', 'nba', 'espn', 'tyc', 'win', 'fox', 'bein', 'dazn', 'golf', 'racing', 'f1', 'tennis', 'tvr', 'klicgo'];
      const moviesKeywords = ['movie', 'cine', 'film', 'series', 'cinema'];
      const entKeywords = ['entertainment', 'music', 'musica', 'animation', 'comedy', 'kids', 'general'];

      const sports = [];
      const movies = [];
      const ent = [];
      const other = [];

      allExtracted.forEach(ch => {
        const hay = (ch.name + ' ' + ch.group).toLowerCase();
        if (sportsKeywords.some(k => hay.includes(k))) sports.push(ch);
        else if (moviesKeywords.some(k => hay.includes(k))) movies.push(ch);
        else if (entKeywords.some(k => hay.includes(k))) ent.push(ch);
        else other.push(ch);
      });

      const sortByHttps = (list) => list.sort((a, b) => (b.streamUrl.startsWith('https://') ? 1 : 0) - (a.streamUrl.startsWith('https://') ? 1 : 0));
      sortByHttps(sports);
      sortByHttps(movies);
      sortByHttps(ent);
      sortByHttps(allExtracted);

      const catMap = {
        sports: { id: 'sports', name: '⚽ Deportes', list: sports },
        movies: { id: 'movies', name: '🎬 Cine & Series', list: movies },
        ent: { id: 'ent', name: '✨ Entretenimiento', list: ent },
        all: { id: 'all', name: '🌐 Todas las Señales', list: allExtracted }
      };

      setCategories(catMap);
      setTotalCount(allExtracted.length);
      return catMap;
    } catch (err) {
      setError(err.message || 'Error al procesar lista M3U');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, categories, totalCount, parseM3uUrl };
}