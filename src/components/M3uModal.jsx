import React, { useState } from 'react';
import { X, Globe, Upload, Play, Download } from 'lucide-react';
import { useM3uParser } from '../hooks/useM3uParser';

export function M3uModal({ isOpen, onClose, onImportChannels, onTestChannel }) {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [urlInput, setUrlInput] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('sports');
  const { loading, error, categories, totalCount, parseM3uUrl } = useM3uParser();

  if (!isOpen) return null;

  const presets = [
    { label: '⚽ Deportes Mundial (+250 Canales)', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { label: '🇵🇪 Perú (Liga 1 & TV)', url: 'https://iptv-org.github.io/iptv/countries/pe.m3u' },
    { label: '🇦🇷 Argentina (Fútbol)', url: 'https://iptv-org.github.io/iptv/countries/ar.m3u' },
    { label: '🌎 Canales en Español', url: 'https://iptv-org.github.io/iptv/languages/spa.m3u' }
  ];

  const handleRunAnalyzer = async (urlToRun) => {
    const target = urlToRun || urlInput;
    if (!target.trim()) {
      alert('Por favor ingresa un enlace válido.');
      return;
    }
    const res = await parseM3uUrl(target.trim());
    if (res?.sports?.list.length > 0) setActiveCategoryKey('sports');
    else if (res?.movies?.list.length > 0) setActiveCategoryKey('movies');
    else setActiveCategoryKey('all');
  };

  const handleImportSelected = () => {
    if (!categories || !categories[activeCategoryKey]) return;
    const selectedList = categories[activeCategoryKey].list.slice(0, 80);
    const mapped = selectedList.map((c, i) => ({
      id: 'imported-' + Date.now() + '-' + i,
      name: c.name,
      subtitle: c.name,
      shortName: (c.name || 'CANAL').substring(0, 5).toUpperCase(),
      color: 'linear-gradient(135deg, #0284c7, #0369a1)',
      category: 'personalizados',
      tournament: c.group || 'Canal M3U',
      logo: c.logo || '',
      quality: c.resolution + ' HD',
      description: 'Canal importado desde lista M3U oficial.',
      sources: [{ name: 'Servidor M3U', url: c.streamUrl }]
    }));

    onImportChannels(mapped);
    alert(`¡Se importaron ${mapped.length} canales (${categories[activeCategoryKey].name}) con éxito!`);
    onClose();
  };

  return (
    <div className="senior-player-modal active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 11000 }}>
      <div style={{ width: '92%', maxWidth: 660, background: '#0d1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '26px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.9)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="logo.png" alt="TAJHO TV" style={{ width: 34, height: 34, borderRadius: 10 }} />
            <h3 style={{ fontSize: 19, fontWeight: 950, color: '#fff' }}>Gestor de Canales & Listas M3U</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: 8, color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* URL Input Box */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>
            Pega el enlace de <strong>cualquier plataforma, web deportiva o archivo M3U</strong> para extraer señales seguras:
          </p>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="search-chip"
                style={{ padding: '6px 12px', fontSize: 11 }}
                onClick={() => {
                  setUrlInput(p.url);
                  handleRunAnalyzer(p.url);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://servidor.com/lista.m3u o https://iptv-org..."
              style={{
                flex: 1,
                background: '#161b26',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                outline: 'none'
              }}
            />
            <button
              type="button"
              className="btn-hero-play"
              style={{ padding: '12px 20px', fontSize: 13, borderRadius: 12, whiteSpace: 'nowrap' }}
              disabled={loading}
              onClick={() => handleRunAnalyzer()}
            >
              <Globe size={16} />
              <span>{loading ? 'Analizando...' : 'Analizar'}</span>
            </button>
          </div>
        </div>

        {error ? (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, color: '#fca5a5', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        ) : null}

        {/* Results Container */}
        {categories ? (
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#34d399' }}>
                ✓ {categories[activeCategoryKey]?.list.length} canales en {categories[activeCategoryKey]?.name} (Total: {totalCount})
              </span>
              <button
                type="button"
                style={{ background: '#10b981', color: '#fff', fontWeight: 900, fontSize: 12, padding: '7px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 2px 10px rgba(16,185,129,0.3)' }}
                onClick={handleImportSelected}
              >
                📥 Importar Seleccionados
              </button>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 10, scrollbarWidth: 'none' }}>
              {Object.values(categories).map(cat => (
                cat.list.length > 0 ? (
                  <button
                    key={cat.id}
                    type="button"
                    className={`search-chip ${activeCategoryKey === cat.id ? 'active' : ''}`}
                    style={{ padding: '6px 14px', fontSize: 11 }}
                    onClick={() => setActiveCategoryKey(cat.id)}
                  >
                    {cat.name} ({cat.list.length})
                  </button>
                ) : null
              ))}
            </div>

            {/* Channels List */}
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories[activeCategoryKey]?.list.slice(0, 80).map((ch, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    {ch.logo ? (
                      <img src={ch.logo} alt={ch.name} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8, background: '#0f172a', padding: 3 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: 32, height: 32, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#10b981' }}>TV</div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 850, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 280 }}>
                        {ch.name}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ color: ch.streamUrl.startsWith('https://') ? '#34d399' : '#fbbf24', fontWeight: 800 }}>
                          {ch.streamUrl.startsWith('https://') ? '🟢 HTTPS VERIFICADO' : '⚡ TÚNEL PROXY'}
                        </span>
                        <span>•</span>
                        <span>{ch.resolution}</span>
                        <span>•</span>
                        <span>{ch.group}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 10, fontWeight: 850, fontSize: 11, padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      onTestChannel({
                        id: 'extracted-' + Date.now() + '-' + idx,
                        name: ch.name,
                        subtitle: ch.name,
                        tournament: ch.group || 'Señal M3U',
                        category: 'personalizados',
                        quality: ch.resolution + ' HD',
                        sources: [{ name: 'Servidor M3U', url: ch.streamUrl }]
                      });
                      onClose();
                    }}
                  >
                    ▶ Probar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}