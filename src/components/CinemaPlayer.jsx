import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';

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
    }, 4500);
  };

  useEffect(() => {
    resetOsdTimer();
    const video = videoRef.current;
    if (!video || !currentSource) return;

    let streamUrl = currentSource.url;
    // Mixed Content Shield: If running on HTTPS, route HTTP through CORS proxy
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
          // Failover to next server
          if (currentSourceIndex + 1 < sources.length) {
            triggerToast(`⚠️ Servidor ${currentSourceIndex + 1} no responde. Conmutando a espejo...`);
            setCurrentSourceIndex(prev => prev + 1);
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
  }, [channel, currentSourceIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
    resetOsdTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetOsdTimer();
  };

  return (
    <div
      className="senior-player-modal active"
      onClick={(e) => {
        if (e.target === e.currentTarget || e.target === videoRef.current) {
          setShowOsd(prev => !prev);
        }
      }}
    >
      <video
        ref={videoRef}
        className="senior-video"
        playsInline
        autoPlay
      />

      {/* Buffering Indicator */}
      {buffering ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)',
          gap: 14,
          zIndex: 100
        }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: 13, fontWeight: 900, color: '#34d399', letterSpacing: 1 }}>
            CONECTANDO CON SEÑAL DIGITAL HD...
          </span>
        </div>
      ) : null}

      {/* Failover Toast */}
      {toastMsg ? (
        <div className="failover-toast" style={{ display: 'block' }}>
          {toastMsg}
        </div>
      ) : null}

      {/* Player OSD */}
      <div className={`senior-osd ${showOsd ? '' : 'hidden'}`}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-hero-secondary"
            style={{ padding: '10px 18px', fontSize: 13 }}
            onClick={onClose}
          >
            <ArrowLeft size={18} />
            <span>Volver al Catálogo</span>
          </button>

          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>
              {channel.subtitle || channel.name}
            </h2>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800 }}>
              {channel.tournament || channel.title || 'Deportes en Directo'} • {currentSource?.name}
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div>
          {/* Server Switchers */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
              Servidores de Respaldo Disponibles (Conmutación Automática Anti-Caídas):
            </span>
            <div className="osd-servers-pill-group">
              {sources.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn-server-switch ${idx === currentSourceIndex ? 'active' : ''}`}
                  onClick={() => setCurrentSourceIndex(idx)}
                >
                  {src.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="btn-hero-play"
                style={{ padding: '10px 20px', fontSize: 13 }}
                onClick={togglePlay}
              >
                {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
              </button>

              <button
                type="button"
                className="btn-hero-secondary"
                style={{ padding: '10px 18px', fontSize: 13 }}
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isMuted ? 'Activar Sonido' : 'Silenciar'}</span>
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>
              Toca la pantalla o presiona OK en tu mando para ocultar controles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}