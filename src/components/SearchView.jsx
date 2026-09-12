import React from 'react';
import { motion } from 'framer-motion';
import { BroadcastCard } from './BroadcastCard';
import { Search, Sparkles, Filter, ChevronRight } from 'lucide-react';

export function SearchView({
  searchQuery,
  onSearchChange,
  filterTag,
  onSelectTag,
  results,
  onSelectChannel,
  onBackHome
}) {
  const chips = ['Todos', 'ESPN', 'TyC Sports', 'Win Sports', 'Perú', 'Argentina', 'Real Madrid', 'En Directo'];

  return (
    <motion.div
      className="tv-search-viewport"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="search-view-header">
        {/* Quick Filter Chips */}
        <div className="search-chips-container">
          <span className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-wider mr-2">
            <Filter size={14} className="text-emerald-400" /> Filtros:
          </span>
          {chips.map((tag) => (
            <motion.button
              key={tag}
              type="button"
              className={`search-chip ${filterTag === tag ? 'active' : ''}`}
              onClick={() => onSelectTag(tag)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tag}
            </motion.button>
          ))}
        </div>

        {/* Results Count & Back */}
        <div className="search-meta-bar">
          <div className="search-results-count flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            <span>{results.length} Canales Encontrados {searchQuery ? `para "${searchQuery}"` : ''}</span>
          </div>

          <motion.button
            type="button"
            className="btn-search-back-home"
            onClick={onBackHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Volver al Inicio</span>
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Grid Results */}
      {results.length > 0 ? (
        <motion.div
          className="search-results-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.04 }
            }
          }}
        >
          {results.map((channel) => (
            <BroadcastCard
              key={channel.id}
              channel={channel}
              isFocused={false}
              onSelect={onSelectChannel}
              onFocus={() => {}}
            />
          ))}
        </motion.div>
      ) : (
        <div className="search-empty-state">
          <div className="empty-icon-box">
            <Search size={36} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No encontramos canales con esa búsqueda</h3>
          <p className="text-sm font-semibold text-slate-400 max-w-md">
            Prueba buscando "ESPN", "TyC", "Win", "Directo" o usa el analizador para pegar enlaces de listas M3U o páginas web.
          </p>
        </div>
      )}
    </motion.div>
  );
}
