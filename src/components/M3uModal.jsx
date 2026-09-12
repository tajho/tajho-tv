import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Upload, Play, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useM3uParser } from '../hooks/useM3uParser';

export function M3uModal({ isOpen, onClose, onImportChannels, onTestChannel }) {
  const [urlInput, setUrlInput] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('sports');
  const { loading, error, categories, totalCount, parseM3uUrl } = useM3uParser();

  if (!isOpen) return null;

  const presets = [
    { label: '⚽ Deportes Mundial (+250)', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
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
    <AnimatePresence>
      <div className="senior-player-modal active flex items-center justify-center p-4" style={{ zIndex: 11000 }}>
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-[680px] bg-[#0c1017]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.95)] z-10 max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <img src="logo.png" alt="TAJHO TV" className="w-9 h-9 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">Analizador de Canales & Listas M3U</h3>
                <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1">
                  <ShieldCheck size={13} /> Túnel HTTPS Anti-Bloqueo Integrado
                </span>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* URL Input & Presets */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-slate-300 font-medium mb-3">
              Pega el enlace de <strong className="text-white">cualquier plataforma, web deportiva o archivo M3U</strong>:
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map((p, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  className="search-chip text-xs !py-1.5 !px-3"
                  onClick={() => {
                    setUrlInput(p.url);
                    handleRunAnalyzer(p.url);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 focus-within:border-emerald-500 transition-colors">
                <Globe size={18} className="text-emerald-400 shrink-0" />
                <input
                  type="url"
                  placeholder="https://ejemplo.com/lista.m3u o canal en vivo..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunAnalyzer()}
                  className="w-full bg-transparent border-none outline-none text-white text-sm font-semibold placeholder:text-slate-500"
                />
              </div>

              <motion.button
                type="button"
                className="btn-luxury-primary px-5 text-sm whitespace-nowrap"
                onClick={() => handleRunAnalyzer()}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? 'Analizando...' : 'Analizar Enlace'}
              </motion.button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Viewport */}
          {categories && (
            <div className="flex-1 flex flex-col min-h-0 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 overflow-x-auto mb-3 scrollbar-none">
                {Object.keys(categories).map((k) => {
                  const cat = categories[k];
                  const isActive = activeCategoryKey === k;
                  return (
                    <motion.button
                      key={k}
                      type="button"
                      onClick={() => setActiveCategoryKey(k)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{cat.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {cat.list.length}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Channels List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {categories[activeCategoryKey]?.list.slice(0, 30).map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-xs text-white shrink-0 overflow-hidden border border-white/10">
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          c.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="truncate">
                        <h5 className="text-sm font-bold text-white truncate">{c.name}</h5>
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <ShieldCheck size={11} /> HTTPS Verificado • {c.resolution}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => onTestChannel(c)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={12} fill="currentColor" /> Probar
                    </motion.button>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  Mostrando canales certificados con soporte HLS
                </span>
                <motion.button
                  type="button"
                  onClick={handleImportSelected}
                  className="btn-luxury-primary px-4 py-2 text-xs"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Sparkles size={14} />
                  <span>Importar {categories[activeCategoryKey]?.name}</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
