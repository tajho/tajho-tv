import React, { useState, useEffect, useCallback } from 'react';
import { CHANNELS_REGISTRY, SECTIONS } from './data/channelsRegistry';
import { SidebarRail } from './components/SidebarRail';
import { TopBar } from './components/TopBar';
import { HeroBillboard } from './components/HeroBillboard';
import { CarouselRow } from './components/CarouselRow';
import { SearchView } from './components/SearchView';
import { CinemaPlayer } from './components/CinemaPlayer';
import { M3uModal } from './components/M3uModal';
import { useAudioSynthesizer } from './hooks/useAudioSynthesizer';

export default function App() {
  const [channels] = useState(CHANNELS_REGISTRY);
  const [customChannels, setCustomChannels] = useState(() => {
    try {
      const saved = localStorage.getItem('futbol_tv_custom_channels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('home');
  const [heroChannel, setHeroChannel] = useState(channels[0]);
  const [playingChannel, setPlayingChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { playSound } = useAudioSynthesizer();

  const allChannels = [...channels, ...customChannels];

  const handleSelectChannel = useCallback((ch) => {
    playSound('select');
    setPlayingChannel(ch);
  }, [playSound]);

  const handleFocusChannel = useCallback((ch) => {
    playSound('tick');
    setHeroChannel(ch);
  }, [playSound]);

  const handleImportChannels = useCallback((imported) => {
    setCustomChannels(prev => {
      const next = [...imported, ...prev];
      try {
        localStorage.setItem('futbol_tv_custom_channels', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    if (imported[0]) {
      handleSelectChannel(imported[0]);
    }
  }, [handleSelectChannel]);

  // Global Keyboard Shortcuts (TV Remote D-Pad / Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 10009 || e.keyCode === 461) {
        if (playingChannel) setPlayingChannel(null);
        else if (isModalOpen) setIsModalOpen(false);
        else if (activeTab === 'search') setActiveTab('home');
      } else if (e.key === '/' && !playingChannel && !isModalOpen) {
        e.preventDefault();
        setActiveTab('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingChannel, isModalOpen, activeTab]);

  return (
    <div className="tv-app-layout">
      {/* Sidebar Rail (TV Dock / Mobile Bottom Bar) */}
      <SidebarRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          playSound('select');
          setActiveTab(tab);
        }}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="tv-main-viewport">
        {/* Topbar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (activeTab !== 'search') setActiveTab('search');
          }}
          onSearchClear={() => setSearchQuery('')}
          onOpenSearch={() => setActiveTab('search')}
          onOpenModal={() => setIsModalOpen(true)}
        />

        {/* View Routing */}
        {activeTab === 'search' ? (
          <SearchView
            channels={allChannels}
            searchQuery={searchQuery}
            onClose={() => setActiveTab('home')}
            onSelectChannel={handleSelectChannel}
            onOpenModal={() => setIsModalOpen(true)}
          />
        ) : (
          <>
            {/* Hero Billboard */}
            <HeroBillboard
              channel={heroChannel}
              onPlay={handleSelectChannel}
              onOpenModal={() => setIsModalOpen(true)}
            />

            {/* Carousels Track */}
            <div className="carousels-container" id="carouselsContainer">
              {SECTIONS.map((sec) => {
                let items = [];
                if (sec.id === 'personalizados') items = customChannels;
                else if (activeTab === 'live' && sec.id !== 'destacados') return null;
                else if (activeTab === 'premium' && sec.id !== 'premium' && sec.id !== 'internacional') return null;
                else items = channels.filter(c => c.category === sec.id);

                return (
                  <CarouselRow
                    key={sec.id}
                    section={sec}
                    channels={items}
                    focusedCardId={heroChannel?.id}
                    onSelectChannel={handleSelectChannel}
                    onFocusChannel={handleFocusChannel}
                    onOpenM3uModal={() => setIsModalOpen(true)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Cinema Video Player Modal */}
      {playingChannel ? (
        <CinemaPlayer
          channel={playingChannel}
          onClose={() => setPlayingChannel(null)}
        />
      ) : null}

      {/* M3U & Platform Analyzer Modal */}
      <M3uModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportChannels={handleImportChannels}
        onTestChannel={handleSelectChannel}
      />
    </div>
  );
}