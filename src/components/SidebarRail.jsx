import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Radio, Tv, Upload, ShieldCheck } from 'lucide-react';

export function SidebarRail({ activeTab, onSelectTab, onOpenModal }) {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'live', label: 'En Directo', icon: Radio },
    { id: 'premium', label: 'Canales', icon: Tv },
  ];

  return (
    <aside className="tv-sidebar-rail" id="sidebarRail">
      {/* Brand Container */}
      <div className="rail-brand-container">
        <img src="logo.png" alt="TAJHO TV" className="rail-brand-logo" />
        <span className="rail-brand-text">TAJHO TV</span>
      </div>

      {/* Nav items */}
      <nav className="rail-nav-items">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              className={`rail-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={22} className="rail-svg" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          className="rail-btn"
          onClick={onOpenModal}
          title="Cargar M3U"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload size={22} className="rail-svg" />
          <span>Cargar M3U</span>
        </motion.button>
      </nav>

      {/* Footer info (Desktop/TV only) */}
      <div className="rail-version-chip hidden md:flex flex-col items-center gap-1.5 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-400 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>ONLINE</span>
        </div>
        <span className="text-[10px] font-extrabold text-slate-500">v8.5 LUXURY</span>
      </div>
    </aside>
  );
}
