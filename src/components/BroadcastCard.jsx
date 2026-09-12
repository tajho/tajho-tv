import React from 'react';
import { Play } from 'lucide-react';

export function BroadcastCard({ channel, isFocused, onSelect, onFocus }) {
  const displayName = channel.subtitle || channel.name || channel.title || 'TV';
  const callsign = channel.callsign || channel.shortName || displayName.substring(0, 5).toUpperCase();
  const quality = channel.quality || '1080p • 60 FPS';
  const numServers = channel.sources ? channel.sources.length : 1;
  const tournament = channel.tournament || channel.title || 'Fútbol & Deportes en Vivo';
  const glowColor = channel.glowColor || 'rgba(16, 185, 129, 0.45)';

  return (
    <div
      className={`broadcast-card ${isFocused ? 'is-focused' : ''}`}
      onClick={() => onSelect(channel)}
      onMouseEnter={onFocus}
      role="button"
      tabIndex={0}
    >
      {/* Ambient Glow */}
      <div className="card-ambient-glow" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />

      {/* Top Header */}
      <div className="card-header-strip">
        <div className="badge-live-equalizer">
          <div className="live-bars-group">
            <span /><span /><span /><span />
          </div>
          <span className="live-label-text">EN VIVO</span>
        </div>
        <span className="card-quality-pill">{quality}</span>
      </div>

      {/* Center Section: Emblem + Action */}
      <div className="card-center-stage">
        <div className="card-emblem-crystal" style={{ background: channel.color || '#0f172a' }}>
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={callsign}
              className="card-logo-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <span style={{ display: channel.logo ? 'none' : 'block', fontWeight: 950, fontSize: 14, color: '#fff' }}>
            {callsign}
          </span>
        </div>

        <div className="card-play-action" title="Reproducir">
          <Play size={18} fill="currentColor" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="card-details-footer">
        <div className="card-tournament-tag">
          <span>🏆 {tournament}</span>
        </div>
        <h4 className="card-channel-name">{displayName}</h4>
        <div className="card-status-bar">
          <span className="card-server-online">
            <span className="card-pulse-emerald" /> {numServers} {numServers > 1 ? 'Servidores' : 'Servidor'}
          </span>
          <span>99.8% ONLINE</span>
        </div>
      </div>
    </div>
  );
}