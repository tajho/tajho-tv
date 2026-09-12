import React, { useState } from 'react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { BroadcastCard } from './BroadcastCard';

export function SearchView({ channels, searchQuery, onClose, onSelectChannel, onOpenModal }) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterChips = [
    { id: 'all', label: '⭐ Todos' },
    { id: 'espn', label: '⚽ ESPN' },
    { id: 'tyc', label: '🇦🇷 TyC Sports' },
    { id: 'win', label: '🇨🇴 Win Sports' },
    { id: 'peru', label: '🇵🇪 Liga 1 / Perú' },
    { id: 'madrid', label: '🇪🇸 Real Madrid' },
    { id: 'live', label: '🔴 En Directo' },
    { id: 'custom', label: '📁 Mis Canales' }
  ];

  const filtered = channels.filter(ch => {
    const hay = (ch.name + ' ' + (ch.subtitle || '') + ' ' + (ch.tournament || '') + ' ' + (ch.callsign || '')).toLowerCase();
    
    if (selectedFilter === 'espn' && !hay.includes('espn')) return false;
    if (selectedFilter === 'tyc' && !hay.includes('tyc')) return false;
    if (selectedFilter === 'win' && !hay.includes('win')) return false;
    if (selectedFilter === 'peru' && !hay.includes('peru') && !hay.includes('liga 1') && !hay.includes('pe')) return false;
    if (selectedFilter === 'madrid' && !hay.includes('madrid') && !hay.includes('rmtv')) return false;
    if (selectedFilter === 'live' && !ch.isLive && ch.category !== 'destacados') return false;
    if (selectedFilter === 'custom' && ch.category !== 'personalizados') return false;

    if (!searchQuery) return true;
    return hay.includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div className="tv-search-viewport" style={{ display: 'flex' }}>
      <div className="search-view-header">
        {/* Filter Chips */}
        <div className="search-chips-container">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              type="button"
              className={`search-chip ${selectedFilter === chip.id ? 'active' : ''}`}
              onClick={() => setSelectedFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Meta Header */}
        <div className="search-meta-bar">
          <span className="search-results-count">
            MOSTRANDO {filtered.length} SEÑALES {searchQuery ? `PARA "${searchQuery.toUpperCase()}"` : ''}
          </span>
          <button type="button" className="btn-search-back-home" onClick={onClose}>
            <ArrowLeft size={16} />
            <span>Volver a Inicio</span>
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="search-empty-state">
          <div className="empty-icon-box">
            <Search size={36} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>No se encontraron canales</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Prueba con otro filtro o agrega tu propia señal M3U.</p>
          <button
            type="button"
            className="btn-hero-play"
            style={{ padding: '10px 20px', fontSize: 13 }}
            onClick={onOpenModal}
          >
            <Plus size={16} />
            <span>Agregar Señal Manual / M3U</span>
          </button>
        </div>
      ) : (
        <div className="search-results-grid">
          {filtered.map((ch) => (
            <BroadcastCard
              key={ch.id}
              channel={ch}
              onSelect={onSelectChannel}
            />
          ))}
        </div>
      )}
    </div>
  );
}