/**
 * FÚTBOL TV PRO - 55" SMART TV ENGINE (VIDAA / BROWSER)
 * Full Remote Control Spatial Navigation + HLS Live Player
 */

(function () {
  'use strict';

  // --- STATE ---
  let channels = [...DEFAULT_CHANNELS];
  let currentCategory = 'partidos';
  let filteredChannels = [];
  let currentPlayingChannel = null;
  let hls = null;
  let isPlaying = false;
  let isMuted = false;
  let osdTimer = null;
  let isPlayerActive = false;

  // Spatial Navigation Zones: 'categories' | 'grid' | 'osd' | 'modal'
  let focusZone = 'grid';
  let focusedCategoryIndex = 0;
  let focusedCardIndex = 0;
  let focusedOsdIndex = 0; // 0: Back, 1: Play/Pause, 2: Mute, 3: Reload, 4+: Quick Channels

  // DOM Elements
  const appContainer = document.getElementById('appContainer');
  const categoriesBar = document.getElementById('categoriesBar');
  const sectionTitle = document.getElementById('sectionTitle');
  const channelsGrid = document.getElementById('channelsGrid');
  const liveClock = document.getElementById('liveClock');

  // Player Elements
  const playerModal = document.getElementById('playerModal');
  const video = document.getElementById('tvVideoPlayer');
  const playerBuffering = document.getElementById('playerBuffering');
  const playerOsd = document.getElementById('playerOsd');
  const btnOsdBack = document.getElementById('btnOsdBack');
  const osdChannelName = document.getElementById('osdChannelName');
  const osdChannelSub = document.getElementById('osdChannelSub');
  const osdQuickChannels = document.getElementById('osdQuickChannels');
  const btnOsdPlayPause = document.getElementById('btnOsdPlayPause');
  const iconPlayPause = document.getElementById('iconPlayPause');
  const textPlayPause = document.getElementById('textPlayPause');
  const btnOsdMute = document.getElementById('btnOsdMute');
  const iconMute = document.getElementById('iconMute');
  const textMute = document.getElementById('textMute');
  const btnOsdReload = document.getElementById('btnOsdReload');

  // Modal Elements
  const modalAddChannel = document.getElementById('modalAddChannel');
  const inputChannelName = document.getElementById('inputChannelName');
  const inputChannelUrl = document.getElementById('inputChannelUrl');
  const inputChannelTournament = document.getElementById('inputChannelTournament');
  const btnModalCancel = document.getElementById('btnModalCancel');
  const btnModalSave = document.getElementById('btnModalSave');

  // --- INITIALIZATION ---
  function init() {
    loadCustomChannels();
    startClock();
    renderCategories();
    switchCategory('partidos');
    setupEventListeners();
    setupVideoEvents();

    // Start focus on first card
    setTimeout(() => {
      focusZone = 'grid';
      focusedCardIndex = 0;
      updateVisualFocus();
    }, 150);
  }

  // --- LOCAL STORAGE CHANNELS ---
  function loadCustomChannels() {
    try {
      const saved = localStorage.getItem('futbol_tv_custom_channels');
      if (saved) {
        const custom = JSON.parse(saved);
        if (Array.isArray(custom) && custom.length > 0) {
          channels = [...custom, ...DEFAULT_CHANNELS];
        }
      }
    } catch (e) {
      console.error("Error loading custom channels", e);
    }
  }

  function saveCustomChannel(newChannel) {
    try {
      channels.unshift(newChannel);
      const customOnly = channels.filter(c => c.category === 'personalizados');
      localStorage.setItem('futbol_tv_custom_channels', JSON.stringify(customOnly));
      switchCategory('personalizados');
    } catch (e) {
      console.error("Error saving channel", e);
    }
  }

  // --- LIVE CLOCK ---
  function startClock() {
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (liveClock) liveClock.textContent = `${h}:${m}:${s}`;
    }
    update();
    setInterval(update, 1000);
  }

  // --- RENDER CATEGORIES ---
  function renderCategories() {
    categoriesBar.innerHTML = '';
    CATEGORIES.forEach((cat, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `category-tab ${cat.id === currentCategory ? 'active' : ''}`;
      btn.dataset.index = idx;
      btn.dataset.id = cat.id;
      btn.innerHTML = `<span>${cat.icon}</span> <span>${cat.name}</span>`;
      btn.addEventListener('click', () => {
        focusZone = 'categories';
        focusedCategoryIndex = idx;
        switchCategory(cat.id);
      });
      categoriesBar.appendChild(btn);
    });

    // Add custom stream button at the right end
    const btnAdd = document.createElement('button');
    btnAdd.type = 'button';
    btnAdd.className = 'btn-add-m3u';
    btnAdd.dataset.index = CATEGORIES.length;
    btnAdd.innerHTML = `<span>➕</span> <span>Agregar Enlace</span>`;
    btnAdd.addEventListener('click', openAddModal);
    categoriesBar.appendChild(btnAdd);
  }

  function switchCategory(catId) {
    currentCategory = catId;
    // Update active tab styles
    const tabs = categoriesBar.querySelectorAll('.category-tab');
    tabs.forEach(t => {
      if (t.dataset.id === catId) t.classList.add('active');
      else t.classList.remove('active');
    });

    // Filter channels
    if (catId === 'personalizados') {
      filteredChannels = channels.filter(c => c.category === 'personalizados');
      sectionTitle.innerHTML = `<span>🔗</span> Mis Canales Personalizados & M3U (${filteredChannels.length})`;
    } else {
      filteredChannels = channels.filter(c => c.category === catId);
      const catObj = CATEGORIES.find(c => c.id === catId);
      sectionTitle.innerHTML = `<span>${catObj ? catObj.icon : '⚽'}</span> ${catObj ? catObj.name : 'Canales'}`;
    }

    renderGrid();
    focusedCardIndex = 0;
    updateVisualFocus();
  }

  // --- RENDER GRID ---
  function renderGrid() {
    channelsGrid.innerHTML = '';

    if (filteredChannels.length === 0) {
      channelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; background: var(--bg-card); border-radius: var(--card-radius); border: 1px dashed var(--border-light);">
          <div style="font-size: 48px; margin-bottom: 12px;">⚽</div>
          <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">No hay canales en esta sección</h2>
          <p style="color: var(--text-secondary); font-size: 15px; margin-bottom: 20px;">Puedes agregar tus propios enlaces de fútbol (.m3u8 o stream) fácilmente.</p>
          <button type="button" class="btn-add-m3u" style="display: inline-flex; margin: 0 auto;" onclick="window.openAddModalDirect()">
            ➕ Agregar Mi Primer Canal
          </button>
        </div>
      `;
      return;
    }

    filteredChannels.forEach((ch, idx) => {
      const card = document.createElement('div');
      card.className = 'channel-card';
      card.dataset.index = idx;

      card.innerHTML = `
        <div>
          <div class="card-top">
            <div class="card-logo-container" style="background: ${ch.color || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}; color: #fff; font-weight: 900; font-size: ${ch.shortName && ch.shortName.length > 5 ? '13px' : '16px'}; letter-spacing: -0.5px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 8px 18px rgba(0,0,0,0.35);">
              <span>${ch.shortName || '⚽'}</span>
            </div>
            <span class="card-badge-pill ${ch.isLive ? 'badge-live' : 'card-badge-pill'}" style="${!ch.isLive ? 'background: rgba(255,255,255,0.1); color: #fff;' : ''}">
              ${ch.isLive ? '<span class="live-dot"></span> EN VIVO' : (ch.time || ch.badge || 'HD')}
            </span>
          </div>
          <div class="card-info">
            <div class="card-tournament">${ch.tournament || 'FÚTBOL INTERNACIONAL'}</div>
            <h3 class="card-name">${ch.name}</h3>
            <p class="card-desc">${ch.description || 'Transmisión deportiva en directo.'}</p>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size: 12px; font-weight: 800; color: var(--text-muted);">
            ${ch.badge ? `★ ${ch.badge}` : 'SEÑAL DIRECTA'}
          </span>
          <div class="card-btn-play">
            <span>▶</span>
            <span>VER AHORA</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        playChannel(ch);
      });

      channelsGrid.appendChild(card);
    });
  }

  window.openAddModalDirect = openAddModal;

  // --- VIDEO PLAYER LOGIC (HLS.JS) ---
  function playChannel(ch) {
    currentPlayingChannel = ch;
    isPlayerActive = true;
    playerModal.classList.add('active');
    playerBuffering.classList.add('active');

    // Update OSD info
    osdChannelName.textContent = ch.name;
    osdChannelSub.textContent = `${ch.tournament || 'Fútbol en Directo'} • ${ch.description || ''}`;

    renderOsdQuickChannels();
    showOsd();

    const iframe = document.getElementById('tvIframePlayer');
    const streamUrl = ch.streamUrl || '';
    const isWebEmbed = !streamUrl.includes('.m3u8') && (streamUrl.includes('http://') || streamUrl.includes('https://')) && !streamUrl.includes('.mp4');

    // Reset Video & Iframe
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.pause();
    video.removeAttribute('src');

    if (isWebEmbed && iframe) {
      // EMBED / WEB STREAM MODE
      video.style.display = 'none';
      iframe.style.display = 'block';
      iframe.src = streamUrl;
      playerBuffering.classList.remove('active');
    } else {
      // DIRECT HLS STREAM MODE
      if (iframe) {
        iframe.style.display = 'none';
        iframe.src = '';
      }
      video.style.display = 'block';
      video.load();

      function startHls(url) {
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60,
          });

          hls.loadSource(url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.muted = isMuted;
            video.play().catch(() => {
              video.muted = true;
              video.play().catch(e => console.warn(e));
            });
            playerBuffering.classList.remove('active');
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn("HLS Error", data);
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !url.includes('/proxy?url=')) {
                // Auto-retry through local server proxy to bypass CORS
                console.log("CORS/Network error detected, retrying via local TV proxy...");
                hls.destroy();
                startHls('/proxy?url=' + encodeURIComponent(streamUrl));
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                playerBuffering.classList.remove('active');
                alert("La señal de este canal no está transmitiendo en este momento o cambió de enlace. Puedes agregar otro enlace con el botón ➕.");
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(() => { video.muted = true; video.play(); });
          playerBuffering.classList.remove('active');
        } else {
          video.src = url;
          video.play().catch(e => console.warn(e));
          playerBuffering.classList.remove('active');
        }
      }

      startHls(streamUrl);
    }

    // Set focus to OSD Back Button
    focusZone = 'osd';
    focusedOsdIndex = 0;
    updateVisualFocus();
  }

  function closePlayer() {
    isPlayerActive = false;
    playerModal.classList.remove('active');
    const iframe = document.getElementById('tvIframePlayer');
    if (iframe) {
      iframe.src = '';
      iframe.style.display = 'none';
    }
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.pause();
    video.removeAttribute('src');

    // Return focus to grid
    focusZone = 'grid';
    updateVisualFocus();
  }

  function togglePlayPause() {
    if (video.paused) {
      video.play();
      iconPlayPause.textContent = '⏸';
      textPlayPause.textContent = 'Pausar';
    } else {
      video.pause();
      iconPlayPause.textContent = '▶';
      textPlayPause.textContent = 'Reanudar';
    }
  }

  function toggleMute() {
    video.muted = !video.muted;
    isMuted = video.muted;
    if (isMuted) {
      iconMute.textContent = '🔇';
      textMute.textContent = 'Activar Sonido';
    } else {
      iconMute.textContent = '🔊';
      textMute.textContent = 'Silenciar';
    }
  }

  function reloadStream() {
    if (currentPlayingChannel) {
      playChannel(currentPlayingChannel);
    }
  }

  function showOsd() {
    playerOsd.classList.remove('hidden');
    clearTimeout(osdTimer);
    osdTimer = setTimeout(() => {
      if (isPlayerActive && !video.paused) {
        playerOsd.classList.add('hidden');
      }
    }, 4500);
  }

  function renderOsdQuickChannels() {
    osdQuickChannels.innerHTML = '';
    const activeList = filteredChannels.length > 0 ? filteredChannels : channels;

    activeList.forEach((ch, idx) => {
      const item = document.createElement('div');
      item.className = `quick-ch-item ${ch.id === currentPlayingChannel?.id ? 'active-current' : ''}`;
      item.dataset.index = idx;
      item.innerHTML = `
        <span style="font-size: 14px;">${ch.isLive ? '🔴' : '⚽'}</span>
        <span style="font-weight: 800; font-size: 14px;">${ch.name}</span>
      `;
      item.addEventListener('click', () => {
        playChannel(ch);
      });
      osdQuickChannels.appendChild(item);
    });
  }

  // --- SPATIAL NAVIGATION FOR TV REMOTE ---
  function getGridColumns() {
    const cards = channelsGrid.querySelectorAll('.channel-card');
    if (cards.length < 2) return 1;
    const firstTop = cards[0].offsetTop;
    let cols = 0;
    for (let c of cards) {
      if (c.offsetTop === firstTop) cols++;
      else break;
    }
    return Math.max(1, cols);
  }

  function updateVisualFocus() {
    // Remove all focused classes
    document.querySelectorAll('.is-focused').forEach(el => el.classList.remove('is-focused'));

    if (focusZone === 'categories') {
      const allTabs = categoriesBar.querySelectorAll('.category-tab, .btn-add-m3u');
      if (allTabs[focusedCategoryIndex]) {
        const el = allTabs[focusedCategoryIndex];
        el.classList.add('is-focused');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    } else if (focusZone === 'grid') {
      const cards = channelsGrid.querySelectorAll('.channel-card');
      if (cards[focusedCardIndex]) {
        const el = cards[focusedCardIndex];
        el.classList.add('is-focused');
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    } else if (focusZone === 'osd') {
      showOsd();
      // OSD Elements: 0: Back, 1: Play/Pause, 2: Mute, 3: Reload, 4+: Quick Channels
      const osdFocusable = [
        btnOsdBack,
        btnOsdPlayPause,
        btnOsdMute,
        btnOsdReload,
        ...Array.from(osdQuickChannels.querySelectorAll('.quick-ch-item'))
      ];
      if (osdFocusable[focusedOsdIndex]) {
        const el = osdFocusable[focusedOsdIndex];
        el.classList.add('is-focused');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    } else if (focusZone === 'modal') {
      const modalElements = [inputChannelName, inputChannelUrl, inputChannelTournament, btnModalCancel, btnModalSave];
      const target = modalElements[window.focusedModalIndex || 0];
      if (target) {
        target.classList.add('is-focused');
        if (target.focus) target.focus();
      }
    }
  }

  function handleKeyDown(e) {
    const key = e.keyCode;

    // Wake OSD if player is active
    if (isPlayerActive) {
      showOsd();
    }

    switch (key) {
      // --- LEFT ARROW (37) ---
      case 37:
        e.preventDefault();
        if (focusZone === 'categories') {
          if (focusedCategoryIndex > 0) {
            focusedCategoryIndex--;
            updateVisualFocus();
          }
        } else if (focusZone === 'grid') {
          if (focusedCardIndex > 0) {
            focusedCardIndex--;
            updateVisualFocus();
          }
        } else if (focusZone === 'osd') {
          if (focusedOsdIndex > 0) {
            focusedOsdIndex--;
            updateVisualFocus();
          }
        }
        break;

      // --- RIGHT ARROW (39) ---
      case 39:
        e.preventDefault();
        if (focusZone === 'categories') {
          const totalTabs = categoriesBar.querySelectorAll('.category-tab, .btn-add-m3u').length;
          if (focusedCategoryIndex < totalTabs - 1) {
            focusedCategoryIndex++;
            updateVisualFocus();
          }
        } else if (focusZone === 'grid') {
          if (focusedCardIndex < filteredChannels.length - 1) {
            focusedCardIndex++;
            updateVisualFocus();
          }
        } else if (focusZone === 'osd') {
          const osdFocusableCount = 4 + osdQuickChannels.querySelectorAll('.quick-ch-item').length;
          if (focusedOsdIndex < osdFocusableCount - 1) {
            focusedOsdIndex++;
            updateVisualFocus();
          }
        }
        break;

      // --- UP ARROW (38) ---
      case 38:
        e.preventDefault();
        if (focusZone === 'grid') {
          const cols = getGridColumns();
          if (focusedCardIndex - cols >= 0) {
            focusedCardIndex -= cols;
            updateVisualFocus();
          } else {
            // Jump to Categories Bar
            focusZone = 'categories';
            focusedCategoryIndex = Math.min(focusedCategoryIndex, CATEGORIES.length);
            updateVisualFocus();
          }
        } else if (focusZone === 'osd') {
          // If on controls row, jump to back button
          if (focusedOsdIndex > 0) {
            focusedOsdIndex = 0;
            updateVisualFocus();
          }
        }
        break;

      // --- DOWN ARROW (40) ---
      case 40:
        e.preventDefault();
        if (focusZone === 'categories') {
          if (filteredChannels.length > 0) {
            focusZone = 'grid';
            focusedCardIndex = 0;
            updateVisualFocus();
          }
        } else if (focusZone === 'grid') {
          const cols = getGridColumns();
          if (focusedCardIndex + cols < filteredChannels.length) {
            focusedCardIndex += cols;
            updateVisualFocus();
          }
        } else if (focusZone === 'osd') {
          // If on back button, jump to first control
          if (focusedOsdIndex === 0) {
            focusedOsdIndex = 1;
            updateVisualFocus();
          }
        }
        break;

      // --- ENTER / OK (13) ---
      case 13:
        e.preventDefault();
        if (focusZone === 'categories') {
          const allTabs = categoriesBar.querySelectorAll('.category-tab, .btn-add-m3u');
          if (allTabs[focusedCategoryIndex]) {
            allTabs[focusedCategoryIndex].click();
          }
        } else if (focusZone === 'grid') {
          if (filteredChannels[focusedCardIndex]) {
            playChannel(filteredChannels[focusedCardIndex]);
          }
        } else if (focusZone === 'osd') {
          const osdFocusable = [
            btnOsdBack,
            btnOsdPlayPause,
            btnOsdMute,
            btnOsdReload,
            ...Array.from(osdQuickChannels.querySelectorAll('.quick-ch-item'))
          ];
          if (osdFocusable[focusedOsdIndex]) {
            osdFocusable[focusedOsdIndex].click();
          }
        }
        break;

      // --- BACK / RETURN / ESCAPE (27, 10009, 461, 8) ---
      case 27:
      case 10009: // Smart TV Return key
      case 461:   // LG / VIDAA Back key
      case 8:     // Backspace
        if (modalAddChannel.classList.contains('active')) {
          e.preventDefault();
          closeAddModal();
        } else if (isPlayerActive) {
          e.preventDefault();
          closePlayer();
        }
        break;

      // --- SPACE (32) or P (80) -> PLAY/PAUSE ---
      case 32:
      case 80:
        if (isPlayerActive) {
          e.preventDefault();
          togglePlayPause();
        }
        break;

      // --- M (77) -> MUTE ---
      case 77:
        if (isPlayerActive) {
          e.preventDefault();
          toggleMute();
        }
        break;

      // --- F (70) -> FULLSCREEN TOGGLE ---
      case 70:
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen().catch(e => console.warn(e));
        }
        break;
    }
  }

  // --- MODAL LOGIC ---
  function openAddModal() {
    modalAddChannel.classList.add('active');
    focusZone = 'modal';
    window.focusedModalIndex = 0;
    inputChannelName.value = '';
    inputChannelUrl.value = '';
    inputChannelTournament.value = '';
    setTimeout(() => inputChannelName.focus(), 100);
  }

  function closeAddModal() {
    modalAddChannel.classList.remove('active');
    focusZone = 'categories';
    updateVisualFocus();
  }

  function handleSaveChannel() {
    const name = inputChannelName.value.trim();
    const url = inputChannelUrl.value.trim();
    const tournament = inputChannelTournament.value.trim();

    if (!name || !url) {
      alert("Por favor ingresa al menos el Nombre y el Enlace de la transmisión.");
      return;
    }

    const newCh = {
      id: "custom-" + Date.now(),
      name: name,
      category: "personalizados",
      tournament: tournament || "Transmisión Personalizada",
      logo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80",
      description: "Canal agregado manualmente vía M3U / HLS.",
      streamUrl: url,
      isLive: true,
      badge: "M3U"
    };

    saveCustomChannel(newCh);
    closeAddModal();
    playChannel(newCh);
  }

  // --- ATTACH LISTENERS ---
  function setupEventListeners() {
    window.addEventListener('keydown', handleKeyDown);

    // OSD Button Clicks
    btnOsdBack.addEventListener('click', closePlayer);
    btnOsdPlayPause.addEventListener('click', togglePlayPause);
    btnOsdMute.addEventListener('click', toggleMute);
    btnOsdReload.addEventListener('click', reloadStream);

    // Modal Clicks
    btnModalCancel.addEventListener('click', closeAddModal);
        btnModalSave.addEventListener('click', handleSaveChannel);

    const btnLoadAuto = document.getElementById('btnLoadAutoSports');
    if (btnLoadAuto) {
      btnLoadAuto.addEventListener('click', async () => {
        btnLoadAuto.disabled = true;
        btnLoadAuto.textContent = 'Descargando canales...';
        try {
          const res = await fetch('/proxy?url=' + encodeURIComponent('https://iptv-org.github.io/iptv/categories/sports.m3u'));
          const text = await res.text();
          const lines = text.split('\n');
          const loaded = [];
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
              const info = lines[i];
              const url = (lines[i+1] || '').trim();
              if (url.startsWith('http')) {
                const parts = info.split(',');
                const name = parts[parts.length - 1].trim();
                loaded.push({
                  id: 'm3u-' + Date.now() + '-' + i,
                  name: name,
                  shortName: name.substring(0, 5).toUpperCase(),
                  color: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  category: 'personalizados',
                  tournament: 'Deportes En Vivo',
                  description: 'Canal importado desde lista deportiva M3U.',
                  streamUrl: url,
                  isLive: true,
                  badge: 'M3U'
                });
              }
            }
            if (loaded.length >= 80) break;
          }
          if (loaded.length > 0) {
            channels = [...loaded, ...channels];
            localStorage.setItem('futbol_tv_custom_channels', JSON.stringify(loaded));
            alert(`¡Se cargaron ${loaded.length} canales deportivos con éxito!`);
            closeAddModal();
            switchCategory('personalizados');
          } else {
            alert('No se pudieron extraer canales de la lista.');
          }
        } catch (e) {
          alert('Error al descargar canales: ' + e.message);
        } finally {
          btnLoadAuto.disabled = false;
          btnLoadAuto.textContent = 'Cargar Lista';
        }
      });
    }

    // Mouse movement inside player wakes OSD
    playerModal.addEventListener('mousemove', showOsd);
    playerModal.addEventListener('click', (e) => {
      if (e.target === video) showOsd();
    });
  }

  function setupVideoEvents() {
    video.addEventListener('waiting', () => {
      playerBuffering.classList.add('active');
    });
    video.addEventListener('playing', () => {
      playerBuffering.classList.remove('active');
      iconPlayPause.textContent = '⏸';
      textPlayPause.textContent = 'Pausar';
    });
    video.addEventListener('pause', () => {
      iconPlayPause.textContent = '▶';
      textPlayPause.textContent = 'Reanudar';
    });
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


