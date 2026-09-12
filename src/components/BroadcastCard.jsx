import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, ShieldCheck, Radio } from 'lucide-react';

export function BroadcastCard({ channel, isFocused, onSelect, onFocus }) {
  const displayName = channel.subtitle || channel.name || channel.title || 'TV';
  const callsign = channel.callsign || channel.shortName || displayName.substring(0, 5).toUpperCase();
  const quality = channel.quality || '1080p • 60 FPS';
  const numServers = channel.sources ? channel.sources.length : 1;
  const tournament = channel.tournament || channel.title || 'Fútbol & Deportes en Vivo';
  const glowColor = channel.glowColor || 'rgba(16, 185, 129, 0.45)';

  return (
    <motion.div
      className={`broadcast-card ${isFocused ? 'is-focused' : ''}`}
      onClick={() => onSelect(channel)}
      onMouseEnter={onFocus}
      role="button"
      tabIndex={0}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
    >
      {/* Ambient Dynamic Aura */}
      <div
        className="card-ambient-glow"
        style={{ background: `radial-gradient(circle at 80% 20%, ${glowColor} 0%, transparent 70%)` }}
      />

      {/* Header Strip: Live Equalizer + Resolution */}
      <div className="card-header-strip">
        <div className="badge-live-equalizer">
          <div className="live-bars-group">
            <span /><span /><span /><span />
          </div>
          <span className="live-label-text">EN VIVO</span>
        </div>
        <span className="card-quality-pill">{quality}</span>
      </div>

      {/* Center Stage: Crystal Emblem + Floating Play Action */}
      <div className="card-center-stage">
        <div
          className="card-emblem-crystal"
          style={{ background: channel.color || 'linear-gradient(135deg, #1e293b, #0f172a)' }}
        >
          {channel.logo ? (
            <img
              src={channel.logo}
              alt=""
              className="card-logo-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <span style={{ display: channel.logo ? 'none' : 'block', fontWeight: 950, fontSize: 13, color: '#ffffff', letterSpacing: 0.5 }}>
            {callsign}
          </span>
        </div>

        <div className="card-play-action" title="Reproducir">
          <Play size={18} fill="currentColor" />
        </div>
      </div>

      {/* Details Footer */}
      <div className="card-details-footer">
        <div className="card-tournament-tag">
          <Trophy size={11} className="shrink-0 text-amber-400" />
          <span className="truncate">{tournament}</span>
        </div>
        <h4 className="card-channel-name" title={displayName}>{displayName}</h4>
        <div className="card-status-bar">
          <span className="card-server-online">
            <span className="card-pulse-emerald" /> {numServers} {numServers > 1 ? 'Servidores' : 'Servidor'}
          </span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            <ShieldCheck size={11} /> 99.8% ONLINE
          </span>
        </div>
      </div>
    </motion.div>
  );
}
