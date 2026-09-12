import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Calendar } from 'lucide-react';

export function MatchCard({ match, onSelectMatch }) {
  const isLive = match.isLive;

  return (
    <motion.div
      className="match-card-luxury"
      onClick={() => onSelectMatch(match)}
      role="button"
      tabIndex={0}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderLeft: "4px solid " + (match.accentColor || "#10b981")
      }}
    >
      {/* Encabezado del partido */}
      <div className="match-card-header">
        <span className="match-tournament-name">
          <Trophy size={11} className="inline mr-1 text-amber-400" />
          {match.tournament}
        </span>
        {isLive ? (
          <div className="match-badge-live">
            <span className="live-dot-ping" />
            <span>EN VIVO {match.minute}</span>
          </div>
        ) : (
          <div className="match-badge-time">
            <Calendar size={11} className="inline mr-1 text-slate-400" />
            <span>{match.time}</span>
          </div>
        )}
      </div>

      {/* Equipos y Marcador */}
      <div className="match-teams-grid">
        <div className="match-team-col">
          <div className="team-flag-box">
            <img src={match.homeFlag} alt={match.homeTeam} className="team-flag-img" loading="lazy" />
          </div>
          <span className="team-name-label">{match.homeTeam}</span>
        </div>

        <div className="match-score-center">
          <span className={"score-display " + (isLive ? "score-live-pulse" : "score-vs")}>
            {match.score}
          </span>
          <span className="match-channel-tag">{match.channelName}</span>
        </div>

        <div className="match-team-col">
          <div className="team-flag-box">
            <img src={match.awayFlag} alt={match.awayTeam} className="team-flag-img" loading="lazy" />
          </div>
          <span className="team-name-label">{match.awayTeam}</span>
        </div>
      </div>

      {/* Botón de Acción */}
      <div className="match-card-action-bar">
        <span className="match-hint-text">
          {isLive ? "Transmisión en directo" : "Canal asignado"}
        </span>
        <div className="match-play-btn">
          <Play size={14} fill="currentColor" />
          <span>VER PARTIDO</span>
        </div>
      </div>
    </motion.div>
  );
}
