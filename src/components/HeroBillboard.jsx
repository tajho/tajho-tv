import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Radio, Sparkles, Tv, ShieldCheck } from 'lucide-react';

export function HeroBillboard({ channel, onPlay, onOpenModal }) {
  if (!channel) return null;
  const numServers = channel.sources ? channel.sources.length : 1;

  return (
    <div className="hero-billboard" id="heroBillboard">
      {/* Background with Fallback & Gradient Mesh */}
      {channel.heroBg ? (
        <img
          src={channel.heroBg}
          alt=""
          className="hero-backdrop-img"
          loading="eager"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : null}
      
      {/* Dynamic Ambient Stadium Lighting Overlay */}
      <div className="hero-overlay-gradient" />

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Badges Strip */}
        <div className="hero-badge-strip">
          <div className="badge-live-equalizer">
            <div className="live-bars-group">
              <span /><span /><span /><span />
            </div>
            <span className="live-label-text">EN DIRECTO</span>
          </div>

          <div className="hero-server-health">
            <span className="health-dot" />
            <span>{numServers} SERVIDORES ACTIVOS (99.8% ONLINE)</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/5 border border-white/10 text-slate-300">
            <Tv size={12} className="text-emerald-400" /> SMART TV & MOBILE
          </span>
        </div>

        {/* Title & Category */}
        <h1 className="hero-title">{channel.subtitle || channel.name}</h1>
        <div className="hero-subtitle flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400 shrink-0" />
          <span>{channel.tournament || channel.title || 'Fútbol & Deportes de Élite'}</span>
        </div>

        <p className="hero-desc">
          {channel.description || 'Transmisión digital en vivo de alta definición con conmutación multi-servidor y túnel HTTPS anti-bloqueo.'}
        </p>

        {/* Action Buttons */}
        <div className="hero-actions">
          <motion.button
            type="button"
            className="btn-hero-play"
            onClick={() => onPlay(channel)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
          >
            <Play size={20} fill="currentColor" />
            <span>REPRODUCIR AHORA</span>
          </motion.button>

          <motion.button
            type="button"
            className="btn-hero-secondary"
            onClick={onOpenModal}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={20} />
            <span>AGREGAR SEÑAL / M3U</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
