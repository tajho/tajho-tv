import React from 'react';
import { Play, Plus } from 'lucide-react';

export function HeroBillboard({ channel, onPlay, onOpenModal }) {
  if (!channel) return null;
  const numServers = channel.sources ? channel.sources.length : 1;

  return (
    <div className="hero-billboard" id="heroBillboard">
      {channel.heroBg ? (
        <img
          src={channel.heroBg}
          alt={channel.name}
          className="hero-backdrop-img"
        />
      ) : null}
      <div className="hero-overlay-gradient" />

      <div className="hero-content">
        <div className="hero-badge-strip">
          <span className="hero-tag">EN VIVO</span>
          <div className="hero-server-health">
            <span className="health-dot" />
            <span>{numServers} SERVIDORES ACTIVOS (99.8% ONLINE)</span>
          </div>
        </div>

        <h1 className="hero-title">{channel.subtitle || channel.name}</h1>
        <div className="hero-subtitle">{channel.tournament || channel.title || 'Deportes Internacionales'}</div>
        <p className="hero-desc">
          {channel.description || 'Transmisión en directo de alta fidelidad con conmutación multi-servidor.'}
        </p>

        <div className="hero-actions">
          <button
            type="button"
            className="btn-hero-play"
            onClick={() => onPlay(channel)}
          >
            <Play size={20} fill="currentColor" />
            <span>REPRODUCIR AHORA</span>
          </button>

          <button
            type="button"
            className="btn-hero-secondary"
            onClick={onOpenModal}
          >
            <Plus size={20} />
            <span>AGREGAR SEÑAL / M3U</span>
          </button>
        </div>
      </div>
    </div>
  );
}