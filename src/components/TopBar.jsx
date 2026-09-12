import React from 'react';
import { Search, X, Plus, Radio } from 'lucide-react';

export function TopBar({ searchQuery, onSearchChange, onSearchClear, onOpenSearch, onOpenModal }) {
  return (
    <header className="tv-topbar">
      {/* Mobile Brand */}
      <div className="topbar-brand-mobile">
        <img src="logo.png" alt="TAJHO TV" className="topbar-brand-img" />
        <span className="topbar-brand-name">TAJHO TV</span>
      </div>

      {/* Global Search Input */}
      <div className="topbar-search-box" id="topbarSearchBox">
        <Search size={18} style={{ color: '#94a3b8' }} />
        <input
          type="text"
          className="global-search-input"
          placeholder="Buscar canal, torneo o señal (ej: ESPN, TyC, Liga 1, Win)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onOpenSearch}
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={onSearchClear}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        ) : (
          <span className="search-shortcut-badge">Buscar /</span>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="topbar-actions">
        <button
          type="button"
          className="btn-topbar-action"
          onClick={onOpenModal}
        >
          <Plus size={16} />
          <span>Analizar M3U / Web</span>
        </button>

        <div className="topbar-status-chip">
          <span className="pulse-dot-emerald" />
          <span>99.8% ONLINE</span>
        </div>
      </div>
    </header>
  );
}