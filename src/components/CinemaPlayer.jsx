import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, ShieldCheck, Radio, Server, Sparkles } from 'lucide-react';

export function CinemaPlayer({ channel, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showOsd, setShowOsd] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const osdTimerRef = useRef(null);

  const sources = channel?.sources || [{ name: 'Servidor Principal', url: channel?.streamUrl }];
  const currentSource = sources[currentSourceIndex] || sources[0];

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const resetOsdTimer = () => {
    setShowOsd(true);
    clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 5000);
  };

  useEffect(() => {
    resetOsdTimer();
    const video = videoRef.current;
    if (!video || !currentSource) return;

    let streamUrl = currentSource.url;
    // Mixed Content Shield: Tunnel HTTP through HTTPS CORS proxy
    if (window.location.protocol === 'https:' && streamUrl.startsWith('http://')) {
      streamUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(streamUrl);
    }

    setBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setBuffering(false);
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(console.warn);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal error:', data);
          if (currentSourceIndex + 1 < sources.length) {
            triggerToast(`⚠️ Servidor ${currentSourceIndex + 1} no responde. Conmutando a espejo...`);
            setCurrentSourceIndex((prev) => prev + 1);
          } else {
            setBuffering(false);
            triggerToast('❌ Todos los servidores están fuera de línea.');
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(console.warn);
      });
      setBuffering(false);
    } else {
      video.src = streamUrl;
      video.play().catch(console.warn);
      setBuffering(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSourceIndex, currentSource]);

  const togglePlay = () => {
    resetOsdTimer();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    resetOsdTimer();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div
      className="senior-player-modal active"
      onClick={resetOsdTimer}
      onMouseMove={resetOsdTimer}
      style={{ zIndex: 12000 }}
    >
      <video
        ref={videoRef}
        className="cinema-video-element"
        playsInline
        autoPlay
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onClick={resetOsdTimer}
      />

      {/* Buffering Indicator */}
      {buffering && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-emerald-400 animate-spin" />
          <span className="text-sm font-black text-emerald-300 tracking-wider flex items-center gap-2">
            <Radio size={16} className="animate-pulse" /> SINTONIZANDO SEÑAL DIGITAL HD...
          </span>
        </motion.div>
      )}

      {/* Failover Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            className="failover-toast !flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Player OSD Controls */}
      <AnimatePresence>
        {showOsd && (
          <motion.div
            className="senior-osd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <motion.button
                type="button"
                className="btn-luxury-glass px-4 py-2 text-xs sm:text-sm"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={18} />
                <span>Volver al Catálogo</span>
              </motion.button>

              <div className="text-right">
                <h2 className="text-lg sm:text-2xl font-black text-white">
                  {channel.subtitle || channel.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-bold flex items-center justify-end gap-1.5 mt-0.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>{channel.tournament || channel.title || 'Deportes en Directo'} • {currentSource?.name}</span>
                </p>
              </div>
            </div>

            {/* Footer Controls */}
            <div>
              {/* Server Switchers */}
              <div className="mb-4">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Server size={12} className="text-emerald-400" /> Servidores de Respaldo (Anti-Caídas):
                </span>
                <div className="osd-servers-pill-group">
                  {sources.map((src, idx) => {
                    const isCurrent = idx === currentSourceIndex;
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        className={`btn-server-switch ${isCurrent ? 'active' : ''}`}
                        onClick={() => setCurrentSourceIndex(idx)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {src.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    className="btn-luxury-primary px-5 py-2.5 text-xs sm:text-sm"
                    onClick={togglePlay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                    <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    className="btn-luxury-glass px-4 py-2.5 text-xs sm:text-sm"
                    onClick={toggleMute}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isMuted ? 'Activar Sonido' : 'Silenciar'}</span>
                  </motion.button>
                </div>

                <div className="text-[11px] font-bold text-slate-400">
                  Toca la pantalla o presiona OK en tu mando para ocultar controles
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
