import React from 'react';
import { Home, Search, Radio, Tv, Upload } from 'lucide-react';

export function SidebarRail({ activeTab, onSelectTab, onOpenModal }) {
  return (
    <aside className="tv-sidebar-rail" id="sidebarRail">
      <div className="rail-brand-container">
        <img src="logo.png" alt="TAJHO TV" className="rail-brand-logo" />
        <span className="rail-brand-text">TAJHO TV</span>
      </div>

      <nav className="rail-nav-items">
        <button
          type="button"
          className={`rail-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onSelectTab('home')}
          title="Inicio"
        >
          <Home size={22} className="rail-svg" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          className={`rail-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => onSelectTab('search')}
          title="Buscar"
          id="btnRailSearch"
        >
          <Search size={22} className="rail-svg" />
          <span>Buscar</span>
        </button>

        <button
          type="button"
          className={`rail-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => onSelectTab('live')}
          title="En Directo"
        >
          <Radio size={22} className="rail-svg" />
          <span>En Directo</span>
        </button>

        <button
          type="button"
          className={`rail-btn ${activeTab === 'premium' ? 'active' : ''}`}
          onClick={() => onSelectTab('premium')}
          title="Canales"
        >
          <Tv size={22} className="rail-svg" />
          <span>Canales</span>
        </button>

        <button
          type="button"
          className="rail-btn"
          onClick={onOpenModal}
          title="Cargar M3U"
        >
          <Upload size={22} className="rail-svg" />
          <span>Cargar M3U</span>
        </button>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: 0.5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>ONLINE</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b' }}>v8.0 PRO</span>
      </div>
    </aside>
  );
}