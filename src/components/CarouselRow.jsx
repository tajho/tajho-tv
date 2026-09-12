import React from 'react';
import { Zap, Tv, Trophy, Flame, FolderPlus } from 'lucide-react';
import { BroadcastCard } from './BroadcastCard';

const iconMap = {
  zap: Zap,
  tv: Tv,
  trophy: Trophy,
  flame: Flame,
  'folder-plus': FolderPlus
};

export function CarouselRow({ section, channels, focusedCardId, onSelectChannel, onFocusChannel, onOpenM3uModal }) {
  const IconComponent = iconMap[section.icon] || Tv;

  if (channels.length === 0 && section.id === 'personalizados') {
    return (
      <div className="carousel-section">
        <div className="carousel-header">
          <div className="carousel-title">
            <IconComponent size={22} className="text-emerald-400" />
            <span>{section.title}</span>
          </div>
        </div>
        <div style={{
          padding: '24px 32px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>No tienes canales personalizados aún</h4>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Agrega cualquier enlace .m3u8, reproductor web o analiza listas M3U.</p>
          </div>
          <button
            type="button"
            className="btn-hero-secondary"
            style={{ padding: '10px 20px', fontSize: 13 }}
            onClick={onOpenM3uModal}
          >
            ➕ Cargar Lista M3U
          </button>
        </div>
      </div>
    );
  }

  if (channels.length === 0) return null;

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <div className="carousel-title">
          <IconComponent size={22} style={{ color: '#10b981' }} />
          <span>{section.title}</span>
        </div>
        <span className="carousel-count">{channels.length} SEÑALES</span>
      </div>

      <div className="carousel-track">
        {channels.map((ch) => (
          <BroadcastCard
            key={ch.id}
            channel={ch}
            isFocused={focusedCardId === ch.id}
            onSelect={onSelectChannel}
            onFocus={() => onFocusChannel(ch)}
          />
        ))}
      </div>
    </div>
  );
}