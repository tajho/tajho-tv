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
        <div className="p-6 sm:p-8 bg-white/[0.03] border border-dashed border-white/15 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-extrabold text-white mb-1">No tienes canales personalizados aún</h4>
            <p className="text-xs sm:text-sm text-slate-400">Agrega cualquier enlace .m3u8, reproductor web o analiza listas M3U.</p>
          </div>
          <button
            type="button"
            className="btn-luxury-primary px-5 py-2.5 text-xs sm:text-sm"
            onClick={onOpenM3uModal}
          >
            <span>➕ Cargar Lista M3U</span>
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
          <IconComponent size={22} className="text-emerald-400" />
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
