import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Plus, Smartphone } from 'lucide-react';

export function TopBar({ searchQuery, onSearchChange, onSearchClear, onOpenSearch, onOpenModal, onOpenRemote }) {
  return (
    <header className="tv-topbar">
      {/* Mobile Brand */}
      <div className="topbar-brand-mobile">
        <img src="logo.png" alt="TAJHO TV" className="topbar-brand-img" />
        <span className="topbar-brand-name">TAJHO TV</span>
      </div>

      {/* Global Search Input Box */}
      <div className="topbar-search-box" id="topbarSearchBox">
        <Search size={18} className="search-icon-svg" />
        <input
          type="text"
          className="global-search-input"
          placeholder="Buscar canal, torneo o señal (ej: ESPN, TyC, Liga 1, Win, Real Madrid)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onOpenSearch}
        />
        {searchQuery ? (
          <motion.button
            type="button"
            className="btn-search-clear"
            onClick={onSearchClear}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={14} />
          </motion.button>
        ) : (
          <span className="search-shortcut-badge">Buscar /</span>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="topbar-actions">
        {/* Botón Control con Celular */}
        <motion.button
          type="button"
          className="btn-topbar-action !bg-emerald-500/15 !border-emerald-500/30 !text-emerald-300"
          onClick={onOpenRemote}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          title="Vincular con tu celular"
        >
          <Smartphone size={16} />
          <span>Vincular Móvil</span>
        </motion.button>

        <motion.button
          type="button"
          className="btn-topbar-action"
          onClick={onOpenModal}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus size={16} />
          <span>Analizar M3U</span>
        </motion.button>

        <div className="topbar-live-status">
          <span className="pulse-dot-emerald" />
          <span>ONLINE</span>
        </div>
      </div>
    </header>
  );
}
