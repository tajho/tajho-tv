/**
 * FÚTBOL TV PRO - SENIOR APPLICATION ENGINE
 * High-Availability Multi-Source Failover & Spatial Remote Navigation
 */

(function () {
  'use strict';

  // --- STATE ---
  let registry = [...CHANNELS_REGISTRY];
  let customChannels = [];
  let currentHeroChannel = registry[0];
  let currentPlayingChannel = null;
  let currentSourceIndex = 0;
  let hls = null;
  let isPlayerActive = false;
  let isMuted = false;
  let osdTimer = null;
  let failoverTimer = null;

  // Spatial Navigation Grid:
  // Zone: 'rail' | 'hero' | 'carousels' | 'osd' | 'search-input' | 'search-chips' | 'search-grid'
  let currentZone = 'hero';
  let focusedRailIndex = 0;
  let focusedHeroBtnIndex = 0; // 0: Play, 1: Secondary
  let focusedRowIndex = 0; // 0..N carousel rows
  let focusedColIndex = 0; // 0..M cards in current row
  let focusedOsdIndex = 0;
  let focusedSearchChipIndex = 0;
  let focusedSearchGridIndex = 0;

  // Search Engine State
  let isSearchMode = false;
  let searchQuery = '';
  let selectedFilter = 'all';
  let currentSearchResults = [];
  let searchDebounceTimer = null;

  // DOM Elements
  const sidebarRail = document.getElementById('sidebarRail');
  const heroBillboard = document.getElementById('heroBillboard');
  const heroBackdropImg = document.getElementById('heroBackdropImg');
  const heroTag = document.getElementById('heroTag');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroDesc = document.getElementById('heroDesc');
  const heroHealth = document.getElementById('heroHealth');
  const btnHeroPlay = document.getElementById('btnHeroPlay');
  const btnHeroSecondary = document.getElementById('btnHeroSecondary');
  const carouselsContainer = document.getElementById('carouselsContainer');

  // Search Elements
  const topbarSearchBox = document.getElementById('topbarSearchBox');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const btnSearchClear = document.getElementById('btnSearchClear');
  const btnTopbarAdd = document.getElementById('btnTopbarAdd');
  const tvSearchView = document.getElementById('tvSearchView');
  const searchChipsContainer = document.getElementById('searchChipsContainer');
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  const searchResultsCount = document.getElementById('searchResultsCount');
  const btnSearchCloseView = document.getElementById('btnSearchCloseView');
  const searchEmptyState = document.getElementById('searchEmptyState');
  const emptyStateTitle = document.getElementById('emptyStateTitle');
  const emptyStateSubtitle = document.getElementById('emptyStateSubtitle');
  const btnEmptyAddSignal = document.getElementById('btnEmptyAddSignal');

  // Player Elements
  const playerModal = document.getElementById('seniorPlayerModal');
  const video = document.getElementById('seniorVideo');
  const iframe = document.getElementById('seniorIframe');
  const buffering = document.getElementById('seniorBuffering');
  const playerOsd = document.getElementById('seniorOsd');
  const failoverToast = document.getElementById('failoverToast');
  const osdTitle = document.getElementById('osdChannelTitle');
  const osdSub = document.getElementById('osdChannelSub');
  const osdServersGroup = document.getElementById('osdServersGroup');
  const btnOsdBack = document.getElementById('btnOsdBack');
  const btnOsdPlayPause = document.getElementById('btnOsdPlayPause');
  const btnOsdMute = document.getElementById('btnOsdMute');

  // Modal
  const modalAdd = document.getElementById('modalAddChannel');
  const btnModalCancel = document.getElementById('btnModalCancel');
  const btnModalSave = document.getElementById('btnModalSave');
  const inputChannelName = document.getElementById('inputChannelName');
  const inputChannelUrl = document.getElementById('inputChannelUrl');
  const inputChannelTournament = document.getElementById('inputChannelTournament');
  const btnLoadAutoSports = document.getElementById('btnLoadAutoSports');

  // --- INITIALIZATION ---
  function init() {
    loadStoredChannels();
    renderCarousels();
    updateHeroBillboard(registry[0]);
    setupEvents();

    // Default Focus on Hero Play Button
    currentZone = 'hero';
    focusedHeroBtnIndex = 0;
    updateFocus();
  }

  function loadStoredChannels() {
    try {
      const saved = localStorage.getItem('futbol_tv_custom_channels');
      if (saved) {
        customChannels = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Error loading stored channels", e);
    }
  }

  function saveCustomChannel(ch) {
    customChannels.unshift(ch);
    localStorage.setItem('futbol_tv_custom_channels', JSON.stringify(customChannels));
    renderCarousels();
  }

  // --- DYNAMIC HERO BILLBOARD ---
  function updateHeroBillboard(ch) {
    if (!ch) return;
    currentHeroChannel = ch;

    heroTag.textContent = ch.badge || 'EN DIRECTO';
    heroTitle.textContent = ch.subtitle || ch.name;
    heroSubtitle.textContent = ch.title || ch.tournament || 'Fútbol Internacional';
    heroDesc.textContent = ch.description || 'Señal satelital en alta definición con servidores de respaldo.';

    const sourcesCount = ch.sources ? ch.sources.length : 1;
    heroHealth.innerHTML = `<span class="health-dot"></span> ${sourcesCount} SERVIDORES ACTIVOS (99.8% ONLINE)`;

    const bgUrl = ch.heroBg || ch.logo;
    if (bgUrl && bgUrl.startsWith('http')) {
      const tempImg = new Image();
      tempImg.onload = () => {
        heroBackdropImg.src = bgUrl;
        heroBackdropImg.style.display = 'block';
        heroBackdropImg.style.opacity = '1';
      };
      tempImg.onerror = () => {
        heroBackdropImg.style.display = 'none';
      };
      tempImg.src = bgUrl;
    } else {
      heroBackdropImg.style.display = 'none';
    }
  }

  // --- BROADCAST CARD COMPONENT ---
  function createBroadcastCard(ch, rowIdx, colIdx, onClick) {
    const card = document.createElement('div');
    card.className = 'broadcast-card';
    if (rowIdx !== undefined) card.dataset.row = rowIdx;
    if (colIdx !== undefined) card.dataset.col = colIdx;

    const displayName = ch.name || ch.subtitle || ch.title || 'TV';
    const callsign = ch.callsign || ch.shortName || displayName.substring(0, 4).toUpperCase();
    const badge = ch.badge || 'HD';
    const numServers = ch.sources ? ch.sources.length : 1;
    const emblemHtml = ch.logo
      ? `<img src="${ch.logo}" alt="${callsign}" class="card-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none;">${callsign}</span>`
      : `<span>${callsign}</span>`;

    card.innerHTML = `
      <div class="card-badge-row">
        <div class="card-emblem-box" style="background: ${ch.color || 'linear-gradient(135deg, #10b981, #047857)'};">
          ${emblemHtml}
        </div>
        <span class="badge-pill-custom ${ch.isLive ? 'badge-live-pulse' : ''}" style="${!ch.isLive ? 'background: rgba(255,255,255,0.08); color: #fff;' : ''}">
          ${ch.isLive ? '<span class="pulse-dot-red"></span> EN VIVO' : badge}
        </span>
      </div>
      <div class="card-details">
        <h4>${ch.subtitle || ch.name}</h4>
        <p>${ch.tournament || ch.title || 'FÚTBOL INTERNACIONAL'}</p>
      </div>
      <div class="card-footer-strip">
        <span>${ch.quality || '1080p 60FPS'}</span>
        <span class="card-servers-count">● ${numServers} ${numServers > 1 ? 'Servidores' : 'Servidor'}</span>
      </div>
    `;

    if (onClick) {
      card.addEventListener('click', onClick);
    }
    return card;
  }

  // --- RENDER CAROUSELS (DAZN / NETFLIX STYLE) ---
  function renderCarousels() {
    carouselsContainer.innerHTML = '';

    SECTIONS.forEach((sec, rowIdx) => {
      let items = [];
      if (sec.id === 'personalizados') {
        items = customChannels;
      } else {
        items = registry.filter(c => c.category === sec.id);
      }

      if (items.length === 0 && sec.id === 'personalizados') {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'carousel-section';
        sectionEl.dataset.row = rowIdx;
        sectionEl.innerHTML = `
          <div class="carousel-header">
            <div class="carousel-title"><span>${sec.icon}</span> ${sec.title}</div>
          </div>
          <div style="padding: 24px 32px; background: rgba(255,255,255,0.03); border: 1px dashed var(--border-subtle); border-radius: 18px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h4 style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">No tienes canales personalizados aún</h4>
              <p style="font-size: 13px; color: var(--text-muted);">Agrega cualquier enlace .m3u8, reproductor web o descarga la lista M3U oficial.</p>
            </div>
            <button type="button" class="btn-hero-secondary" style="padding: 10px 20px; font-size: 13px;" onclick="window.openSeniorModal()">
              ➕ Agregar Mi Primer Canal
            </button>
          </div>
        `;
        carouselsContainer.appendChild(sectionEl);
        return;
      }

      if (items.length === 0) return;

      const sectionEl = document.createElement('div');
      sectionEl.className = 'carousel-section';
      sectionEl.dataset.row = rowIdx;

      sectionEl.innerHTML = `
        <div class="carousel-header">
          <div class="carousel-title">
            <span>${sec.icon}</span>
            <span>${sec.title}</span>
          </div>
          <span class="carousel-count">${items.length} SEÑALES</span>
        </div>
        <div class="carousel-track" id="track-row-${rowIdx}"></div>
      `;

      const track = sectionEl.querySelector(`#track-row-${rowIdx}`);

      items.forEach((ch, colIdx) => {
        const card = createBroadcastCard(ch, rowIdx, colIdx, () => {
          playChannelWithFailover(ch, 0);
        });
        track.appendChild(card);
      });

      carouselsContainer.appendChild(sectionEl);
    });
  }

  window.openSeniorModal = openModal;

  // --- CHANNEL SEARCH ENGINE (SENIOR 55" TV EXPERIENCE) ---
  function getAllChannels() {
    const combined = [...registry, ...customChannels];
    const seen = new Set();
    const unique = [];
    combined.forEach(ch => {
      const key = (ch.streamUrl || (ch.sources && ch.sources[0]?.url) || ch.name || ch.id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(ch);
      }
    });
    return unique;
  }

  function normalizeText(txt) {
    if (!txt) return '';
    return txt.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function openSearchView(initialQuery, filter) {
    isSearchMode = true;
    heroBillboard.style.display = 'none';
    carouselsContainer.style.display = 'none';
    tvSearchView.style.display = 'flex';

    sidebarRail.querySelectorAll('.rail-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === 1);
    });

    if (initialQuery !== undefined) {
      globalSearchInput.value = initialQuery;
      searchQuery = initialQuery;
    } else {
      searchQuery = globalSearchInput.value.trim();
    }
    btnSearchClear.style.display = searchQuery ? 'flex' : 'none';

    if (filter !== undefined) {
      selectedFilter = filter;
    }
    updateChipActiveState();
    performSearch();

    currentZone = 'search-input';
    updateFocus();
  }

  function closeSearchView() {
    isSearchMode = false;
    tvSearchView.style.display = 'none';
    heroBillboard.style.display = 'flex';
    carouselsContainer.style.display = 'flex';

    sidebarRail.querySelectorAll('.rail-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === 0);
    });

    globalSearchInput.value = '';
    searchQuery = '';
    btnSearchClear.style.display = 'none';
    if (globalSearchInput) globalSearchInput.blur();

    currentZone = 'carousels';
    focusedRowIndex = 0;
    focusedColIndex = 0;
    updateFocus();
  }

  function updateChipActiveState() {
    document.querySelectorAll('.search-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === selectedFilter);
    });
  }

  function performSearch() {
    const all = getAllChannels();
    const qNorm = normalizeText(searchQuery);

    let filtered = all.filter(ch => {
      // 1. Filter Chip Matching
      if (selectedFilter === 'espn') {
        const name = normalizeText(ch.name + ' ' + (ch.subtitle || '') + ' ' + (ch.callsign || ''));
        if (!name.includes('espn')) return false;
      } else if (selectedFilter === 'tyc') {
        const name = normalizeText(ch.name + ' ' + (ch.subtitle || '') + ' ' + (ch.callsign || ''));
        if (!name.includes('tyc')) return false;
      } else if (selectedFilter === 'win') {
        const name = normalizeText(ch.name + ' ' + (ch.subtitle || '') + ' ' + (ch.callsign || ''));
        if (!name.includes('win')) return false;
      } else if (selectedFilter === 'peru') {
        const full = normalizeText(ch.name + ' ' + (ch.subtitle || '') + ' ' + (ch.tournament || '') + ' ' + (ch.description || ''));
        if (!full.includes('peru') && !full.includes('liga 1') && !full.includes('pe')) return false;
      } else if (selectedFilter === 'madrid') {
        const full = normalizeText(ch.name + ' ' + (ch.subtitle || '') + ' ' + (ch.tournament || ''));
        if (!full.includes('madrid') && !full.includes('rmtv')) return false;
      } else if (selectedFilter === 'live') {
        if (!ch.isLive && ch.category !== 'destacados') return false;
      } else if (selectedFilter === 'custom') {
        if (ch.category !== 'personalizados') return false;
      }

      // 2. Text Query Matching
      if (!qNorm) return true;

      const haystack = normalizeText(
        [
          ch.name,
          ch.subtitle,
          ch.title,
          ch.tournament,
          ch.category,
          ch.callsign,
          ch.shortName,
          ch.description,
          ch.badge
        ].filter(Boolean).join(' ')
      );

      return haystack.includes(qNorm);
    });

    currentSearchResults = filtered;
    renderSearchResults();
  }

  function renderSearchResults() {
    searchResultsGrid.innerHTML = '';

    if (currentSearchResults.length === 0) {
      searchResultsGrid.style.display = 'none';
      searchEmptyState.style.display = 'flex';
      emptyStateTitle.textContent = searchQuery ? `No se encontraron canales para "${searchQuery}"` : 'No hay canales disponibles en este filtro';
      searchResultsCount.textContent = '0 CANALES ENCONTRADOS';
      return;
    }

    searchResultsGrid.style.display = 'grid';
    searchEmptyState.style.display = 'none';

    if (searchQuery) {
      searchResultsCount.textContent = `🔍 ${currentSearchResults.length} CANALES ENCONTRADOS PARA "${searchQuery.toUpperCase()}"`;
    } else {
      const chipLabels = {
        all: 'TODOS',
        espn: 'ESPN',
        tyc: 'TYC SPORTS',
        win: 'WIN SPORTS',
        peru: 'LIGA 1 / PERÚ',
        madrid: 'REAL MADRID',
        live: 'EN DIRECTO',
        custom: 'MIS CANALES M3U'
      };
      searchResultsCount.textContent = `MOSTRANDO ${currentSearchResults.length} SEÑALES (${chipLabels[selectedFilter] || 'FILTRO'})`;
    }

    currentSearchResults.forEach((ch, idx) => {
      const card = createBroadcastCard(ch, undefined, idx, () => {
        playChannelWithFailover(ch, 0);
      });
      card.dataset.gridIndex = idx;
      searchResultsGrid.appendChild(card);
    });
  }

  // --- MULTI-SOURCE FAILOVER PLAYER ENGINE ---
  function playChannelWithFailover(ch, sourceIndex = 0) {
    playNavSound('select');
    currentPlayingChannel = ch;
    currentSourceIndex = sourceIndex;
    isPlayerActive = true;

    playerModal.classList.add('active');
    buffering.style.display = 'flex';
    showOsd();

    const sources = ch.sources || [{ name: "Servidor Principal", url: ch.streamUrl }];
    const currentSource = sources[currentSourceIndex] || sources[0];

    osdTitle.textContent = ch.subtitle || ch.name;
    osdSub.textContent = `${ch.tournament || ch.title || 'Deportes en Directo'} • ${currentSource.name}`;

    renderServerPills(sources);

    // Clean previous video/iframe
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.pause();
    video.removeAttribute('src');

    const streamUrl = currentSource.url;
    const isWebEmbed = !streamUrl.includes('.m3u8') && (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) && !streamUrl.includes('.mp4');

    if (isWebEmbed) {
      video.style.display = 'none';
      iframe.style.display = 'block';
      iframe.src = streamUrl;
      buffering.style.display = 'none';
      return;
    }

    iframe.style.display = 'none';
    iframe.src = '';
    video.style.display = 'block';
    video.load();

    function attemptStream(url) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingTimeOut: 8000,
          levelLoadingTimeOut: 8000
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(failoverTimer);
          buffering.style.display = 'none';
          video.muted = isMuted;
          video.play().catch(() => {
            video.muted = true;
            video.play().catch(e => console.warn(e));
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn("HLS Event Error:", data);
          if (data.fatal) {
            handleFailover(ch);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(() => { video.muted = true; video.play(); });
        buffering.style.display = 'none';
      } else {
        video.src = url;
        video.play().catch(e => console.warn(e));
        buffering.style.display = 'none';
      }

      // Safety timeout: if after 8s no frame is ready, trigger failover to next mirror
      clearTimeout(failoverTimer);
      failoverTimer = setTimeout(() => {
        if (video.readyState < 2 && isPlayerActive) {
          console.warn("Stream buffer stalled > 8s, triggering failover...");
          handleFailover(ch);
        }
      }, 8000);
    }

    attemptStream(streamUrl);

    // Focus on Back Button in OSD
    currentZone = 'osd';
    focusedOsdIndex = 0;
    updateFocus();
  }

  function handleFailover(ch) {
    const sources = ch.sources || [{ name: "Servidor Principal", url: ch.streamUrl }];
    const nextIndex = currentSourceIndex + 1;

    if (nextIndex < sources.length) {
      showToast(`⚠️ Servidor ${currentSourceIndex + 1} no responde. Conmutando a ${sources[nextIndex].name}...`);
      setTimeout(() => {
        playChannelWithFailover(ch, nextIndex);
      }, 500);
    } else {
      // Try through CORS proxy before giving up
      const currentUrl = sources[0].url;
      if (!currentUrl.includes('/proxy?url=') && !currentUrl.includes('api.allorigins.win')) {
        showToast(`🔄 Conectando mediante túnel proxy satelital...`);
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
        const proxyUrl = isLocal 
          ? '/proxy?url=' + encodeURIComponent(currentUrl)
          : 'https://api.allorigins.win/raw?url=' + encodeURIComponent(currentUrl);
        sources.push({ name: "Servidor Proxy Antibloqueos", url: proxyUrl });
        playChannelWithFailover(ch, sources.length - 1);
      } else {
        buffering.style.display = 'none';
        showToast(`❌ Todos los servidores de esta señal están temporalmente fuera de línea.`);
      }
    }
  }

  function renderServerPills(sources) {
    osdServersGroup.innerHTML = '';
    sources.forEach((src, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-server-switch ${idx === currentSourceIndex ? 'active' : ''}`;
      btn.dataset.index = idx;
      btn.textContent = src.name;
      btn.addEventListener('click', () => {
        playChannelWithFailover(currentPlayingChannel, idx);
      });
      osdServersGroup.appendChild(btn);
    });
  }

  function showToast(msg) {
    failoverToast.textContent = msg;
    failoverToast.style.display = 'block';
    setTimeout(() => {
      failoverToast.style.display = 'none';
    }, 4000);
  }

  function closePlayer() {
    clearTimeout(failoverTimer);
    isPlayerActive = false;
    playerModal.classList.remove('active');
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

    currentZone = 'carousels';
    updateFocus();
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

  // --- SENIOR AUDIO SYNTHESIZER (REMOTE CONTROL SOUNDS) ---
  let audioCtx = null;
  function playNavSound(type = 'tick') {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.025);
        gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.025);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.025);
      } else if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      // Ignored
    }
  }

  // --- SPATIAL NAVIGATION FOR 55" TV REMOTE ---
  function updateFocus() {
    playNavSound('tick');
    document.querySelectorAll('.is-focused').forEach(el => el.classList.remove('is-focused'));

    if (currentZone === 'rail') {
      sidebarRail.classList.add('expanded');
      const railButtons = sidebarRail.querySelectorAll('.rail-btn');
      if (railButtons[focusedRailIndex]) {
        railButtons[focusedRailIndex].classList.add('is-focused');
      }
    } else {
      sidebarRail.classList.remove('expanded');
    }

    if (currentZone === 'hero') {
      const heroBtns = [btnHeroPlay, btnHeroSecondary];
      if (heroBtns[focusedHeroBtnIndex]) {
        heroBtns[focusedHeroBtnIndex].classList.add('is-focused');
        heroBillboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (currentZone === 'carousels') {
      const rows = carouselsContainer.querySelectorAll('.carousel-section');
      if (rows[focusedRowIndex]) {
        const cards = rows[focusedRowIndex].querySelectorAll('.broadcast-card');
        if (cards[focusedColIndex]) {
          const activeCard = cards[focusedColIndex];
          activeCard.classList.add('is-focused');
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

          // Dynamically update Hero Billboard with highlighted card!
          const rowId = rows[focusedRowIndex].dataset.row;
          let items = [];
          if (SECTIONS[rowId]?.id === 'personalizados') items = customChannels;
          else items = registry.filter(c => c.category === SECTIONS[rowId]?.id);

          if (items[focusedColIndex]) {
            updateHeroBillboard(items[focusedColIndex]);
          }
        }
      }
    } else if (currentZone === 'search-input') {
      if (topbarSearchBox) topbarSearchBox.classList.add('is-focused');
      if (globalSearchInput) {
        globalSearchInput.focus();
      }
    } else if (currentZone === 'search-chips') {
      if (topbarSearchBox) topbarSearchBox.classList.remove('is-focused');
      if (globalSearchInput) globalSearchInput.blur();
      const chips = searchChipsContainer ? searchChipsContainer.querySelectorAll('.search-chip') : [];
      if (chips[focusedSearchChipIndex]) {
        chips[focusedSearchChipIndex].classList.add('is-focused');
        chips[focusedSearchChipIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    } else if (currentZone === 'search-grid') {
      if (topbarSearchBox) topbarSearchBox.classList.remove('is-focused');
      if (globalSearchInput) globalSearchInput.blur();
      const cards = searchResultsGrid ? searchResultsGrid.querySelectorAll('.broadcast-card') : [];
      if (cards[focusedSearchGridIndex]) {
        cards[focusedSearchGridIndex].classList.add('is-focused');
        cards[focusedSearchGridIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (currentZone === 'osd') {
      showOsd();
      const osdElements = [
        btnOsdBack,
        btnOsdPlayPause,
        btnOsdMute,
        ...Array.from(osdServersGroup.querySelectorAll('.btn-server-switch'))
      ];
      if (osdElements[focusedOsdIndex]) {
        osdElements[focusedOsdIndex].classList.add('is-focused');
      }
    }
  }

  function handleKeyDown(e) {
    const key = e.keyCode;

    // Global Search Shortcut: / or F (when not typing in an input and player not active)
    if ((e.key === '/' || (e.keyCode === 70 && !e.ctrlKey && !e.metaKey)) && document.activeElement !== globalSearchInput && !modalAdd.classList.contains('active') && !isPlayerActive) {
      e.preventDefault();
      openSearchView();
      return;
    }

    if (isPlayerActive) {
      showOsd();
    }

    switch (key) {
      // --- LEFT (37) ---
      case 37:
        if (currentZone === 'hero') {
          e.preventDefault();
          if (focusedHeroBtnIndex > 0) {
            focusedHeroBtnIndex--;
            updateFocus();
          } else {
            currentZone = 'rail';
            focusedRailIndex = 0;
            updateFocus();
          }
        } else if (currentZone === 'carousels') {
          e.preventDefault();
          if (focusedColIndex > 0) {
            focusedColIndex--;
            updateFocus();
          } else {
            currentZone = 'rail';
            focusedRailIndex = 2;
            updateFocus();
          }
        } else if (currentZone === 'search-input') {
          if (globalSearchInput.selectionStart === 0 && globalSearchInput.selectionEnd === 0) {
            e.preventDefault();
            currentZone = 'rail';
            focusedRailIndex = 1;
            updateFocus();
          }
        } else if (currentZone === 'search-chips') {
          e.preventDefault();
          if (focusedSearchChipIndex > 0) {
            focusedSearchChipIndex--;
            updateFocus();
          } else {
            currentZone = 'rail';
            focusedRailIndex = 1;
            updateFocus();
          }
        } else if (currentZone === 'search-grid') {
          e.preventDefault();
          const gridWidth = searchResultsGrid?.clientWidth || 1200;
          const cols = Math.max(1, Math.floor(gridWidth / 330));
          if (focusedSearchGridIndex % cols === 0) {
            currentZone = 'rail';
            focusedRailIndex = 1;
            updateFocus();
          } else if (focusedSearchGridIndex > 0) {
            focusedSearchGridIndex--;
            updateFocus();
          }
        } else if (currentZone === 'osd') {
          e.preventDefault();
          if (focusedOsdIndex > 0) {
            focusedOsdIndex--;
            updateFocus();
          }
        }
        break;

      // --- RIGHT (39) ---
      case 39:
        if (currentZone === 'rail') {
          e.preventDefault();
          if (isSearchMode) {
            currentZone = 'search-input';
            updateFocus();
          } else {
            currentZone = 'carousels';
            updateFocus();
          }
        } else if (currentZone === 'hero') {
          e.preventDefault();
          if (focusedHeroBtnIndex < 1) {
            focusedHeroBtnIndex++;
            updateFocus();
          }
        } else if (currentZone === 'carousels') {
          e.preventDefault();
          const rows = carouselsContainer.querySelectorAll('.carousel-section');
          if (rows[focusedRowIndex]) {
            const cards = rows[focusedRowIndex].querySelectorAll('.broadcast-card');
            if (focusedColIndex < cards.length - 1) {
              focusedColIndex++;
              updateFocus();
            }
          }
        } else if (currentZone === 'search-chips') {
          e.preventDefault();
          const chips = searchChipsContainer ? searchChipsContainer.querySelectorAll('.search-chip') : [];
          if (focusedSearchChipIndex < chips.length - 1) {
            focusedSearchChipIndex++;
            updateFocus();
          }
        } else if (currentZone === 'search-grid') {
          e.preventDefault();
          if (focusedSearchGridIndex < currentSearchResults.length - 1) {
            focusedSearchGridIndex++;
            updateFocus();
          }
        } else if (currentZone === 'osd') {
          e.preventDefault();
          const osdElementsCount = 3 + osdServersGroup.querySelectorAll('.btn-server-switch').length;
          if (focusedOsdIndex < osdElementsCount - 1) {
            focusedOsdIndex++;
            updateFocus();
          }
        }
        break;

      // --- UP (38) ---
      case 38:
        if (currentZone === 'rail') {
          e.preventDefault();
          if (focusedRailIndex > 0) {
            focusedRailIndex--;
            updateFocus();
          }
        } else if (currentZone === 'carousels') {
          e.preventDefault();
          if (focusedRowIndex > 0) {
            focusedRowIndex--;
            focusedColIndex = 0;
            updateFocus();
          } else {
            currentZone = 'hero';
            focusedHeroBtnIndex = 0;
            updateFocus();
          }
        } else if (currentZone === 'search-chips') {
          e.preventDefault();
          currentZone = 'search-input';
          updateFocus();
        } else if (currentZone === 'search-grid') {
          e.preventDefault();
          const gridWidth = searchResultsGrid?.clientWidth || 1200;
          const cols = Math.max(1, Math.floor(gridWidth / 330));
          if (focusedSearchGridIndex - cols >= 0) {
            focusedSearchGridIndex -= cols;
            updateFocus();
          } else {
            currentZone = 'search-chips';
            updateFocus();
          }
        } else if (currentZone === 'osd') {
          e.preventDefault();
          if (focusedOsdIndex > 0) {
            focusedOsdIndex = 0;
            updateFocus();
          }
        }
        break;

      // --- DOWN (40) ---
      case 40:
        if (currentZone === 'rail') {
          e.preventDefault();
          const railBtns = sidebarRail.querySelectorAll('.rail-btn');
          if (focusedRailIndex < railBtns.length - 1) {
            focusedRailIndex++;
            updateFocus();
          }
        } else if (currentZone === 'hero') {
          e.preventDefault();
          currentZone = 'carousels';
          focusedRowIndex = 0;
          focusedColIndex = 0;
          updateFocus();
        } else if (currentZone === 'carousels') {
          e.preventDefault();
          const rows = carouselsContainer.querySelectorAll('.carousel-section');
          if (focusedRowIndex < rows.length - 1) {
            focusedRowIndex++;
            focusedColIndex = 0;
            updateFocus();
          }
        } else if (currentZone === 'search-input') {
          e.preventDefault();
          currentZone = 'search-chips';
          focusedSearchChipIndex = 0;
          updateFocus();
        } else if (currentZone === 'search-chips') {
          e.preventDefault();
          if (currentSearchResults.length > 0) {
            currentZone = 'search-grid';
            focusedSearchGridIndex = 0;
            updateFocus();
          }
        } else if (currentZone === 'search-grid') {
          e.preventDefault();
          const gridWidth = searchResultsGrid?.clientWidth || 1200;
          const cols = Math.max(1, Math.floor(gridWidth / 330));
          if (focusedSearchGridIndex + cols < currentSearchResults.length) {
            focusedSearchGridIndex += cols;
            updateFocus();
          }
        } else if (currentZone === 'osd') {
          e.preventDefault();
          if (focusedOsdIndex === 0) {
            focusedOsdIndex = 1;
            updateFocus();
          }
        }
        break;

      // --- ENTER / OK (13) ---
      case 13:
        if (currentZone === 'rail') {
          e.preventDefault();
          const railBtns = sidebarRail.querySelectorAll('.rail-btn');
          if (railBtns[focusedRailIndex]) {
            railBtns[focusedRailIndex].click();
          }
        } else if (currentZone === 'hero') {
          e.preventDefault();
          if (focusedHeroBtnIndex === 0) {
            playChannelWithFailover(currentHeroChannel, 0);
          } else {
            openModal();
          }
        } else if (currentZone === 'carousels') {
          e.preventDefault();
          const rows = carouselsContainer.querySelectorAll('.carousel-section');
          if (rows[focusedRowIndex]) {
            const cards = rows[focusedRowIndex].querySelectorAll('.broadcast-card');
            if (cards[focusedColIndex]) {
              cards[focusedColIndex].click();
            }
          }
        } else if (currentZone === 'search-input') {
          e.preventDefault();
          performSearch();
          if (currentSearchResults.length > 0) {
            currentZone = 'search-grid';
            focusedSearchGridIndex = 0;
            updateFocus();
          }
        } else if (currentZone === 'search-chips') {
          e.preventDefault();
          const chips = searchChipsContainer ? searchChipsContainer.querySelectorAll('.search-chip') : [];
          if (chips[focusedSearchChipIndex]) {
            chips[focusedSearchChipIndex].click();
          }
        } else if (currentZone === 'search-grid') {
          e.preventDefault();
          if (currentSearchResults[focusedSearchGridIndex]) {
            playChannelWithFailover(currentSearchResults[focusedSearchGridIndex], 0);
          }
        } else if (currentZone === 'osd') {
          e.preventDefault();
          const osdElements = [
            btnOsdBack,
            btnOsdPlayPause,
            btnOsdMute,
            ...Array.from(osdServersGroup.querySelectorAll('.btn-server-switch'))
          ];
          if (osdElements[focusedOsdIndex]) {
            osdElements[focusedOsdIndex].click();
          }
        }
        break;

      // --- BACK / ESC / RETURN (27, 10009, 461, 8) ---
      case 27:
      case 10009:
      case 461:
      case 8:
        if (modalAdd.classList.contains('active')) {
          e.preventDefault();
          closeModal();
        } else if (isPlayerActive) {
          e.preventDefault();
          closePlayer();
        } else if (isSearchMode && (key !== 8 || document.activeElement !== globalSearchInput || globalSearchInput.value === '')) {
          e.preventDefault();
          closeSearchView();
        }
        break;

      // --- SPACE (32) / P (80) ---
      case 32:
      case 80:
        if (isPlayerActive) {
          e.preventDefault();
          if (video.paused) video.play();
          else video.pause();
        }
        break;

      // --- M (77) ---
      case 77:
        if (isPlayerActive) {
          e.preventDefault();
          video.muted = !video.muted;
          isMuted = video.muted;
        }
        break;
    }
  }

  // --- MODAL & EVENT ATTACHMENTS ---
  function openModal() {
    modalAdd.classList.add('active');
  }

  function closeModal() {
    modalAdd.classList.remove('active');
  }

  function setupEvents() {
    window.addEventListener('keydown', handleKeyDown);

    btnHeroPlay.addEventListener('click', () => {
      playChannelWithFailover(currentHeroChannel, 0);
    });

    btnHeroSecondary.addEventListener('click', openModal);

    btnOsdBack.addEventListener('click', closePlayer);
    btnOsdPlayPause.addEventListener('click', () => {
      if (video.paused) video.play();
      else video.pause();
    });
    btnOsdMute.addEventListener('click', () => {
      video.muted = !video.muted;
      isMuted = video.muted;
    });

    // Mobile Touch: Tap video to toggle OSD controls
    playerModal.addEventListener('click', (e) => {
      if (e.target === playerModal || e.target === video || e.target === playerOsd) {
        if (playerOsd.classList.contains('hidden')) {
          showOsd();
        } else {
          playerOsd.classList.add('hidden');
        }
      }
    });

    btnModalCancel.addEventListener('click', closeModal);
    btnModalSave.addEventListener('click', () => {
      const name = inputChannelName.value.trim();
      const url = inputChannelUrl.value.trim();
      const tour = inputChannelTournament.value.trim();
      if (!name || !url) return;

      const newCh = {
        id: "custom-" + Date.now(),
        name: name,
        shortName: name.substring(0, 5).toUpperCase(),
        color: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        category: "personalizados",
        tournament: tour || "Canal Personalizado",
        description: "Transmisión agregada manualmente.",
        sources: [{ name: "Servidor Directo", url: url }]
      };

      saveCustomChannel(newCh);
      closeModal();
      playChannelWithFailover(newCh, 0);
    });

    if (btnLoadAutoSports) {
      btnLoadAutoSports.addEventListener('click', async () => {
        btnLoadAutoSports.disabled = true;
        btnLoadAutoSports.textContent = 'Descargando canales...';
        try {
          const sportsUrl = 'https://iptv-org.github.io/iptv/categories/sports.m3u';
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
          let res;
          if (isLocal) {
            res = await fetch('/proxy?url=' + encodeURIComponent(sportsUrl)).catch(() => fetch(sportsUrl));
          } else {
            res = await fetch(sportsUrl).catch(() => fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(sportsUrl)));
          }
          const text = await res.text();
          const lines = text.split('\n');
          const loaded = [];
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
              const line = lines[i];
              const url = (lines[i+1] || '').trim();
              if (url.startsWith('http')) {
                const parts = line.split(',');
                const rawName = parts[parts.length - 1].trim();
                loaded.push({
                  id: 'm3u-' + Date.now() + '-' + i,
                  name: rawName,
                  shortName: rawName.substring(0, 5).toUpperCase(),
                  color: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  category: 'personalizados',
                  tournament: 'Deportes M3U',
                  description: 'Canal verificado de deportes.',
                  sources: [{ name: 'Servidor M3U', url: url }]
                });
              }
            }
            if (loaded.length >= 60) break;
          }
          if (loaded.length > 0) {
            customChannels = [...loaded, ...customChannels];
            localStorage.setItem('futbol_tv_custom_channels', JSON.stringify(customChannels));
            renderCarousels();
            alert(`¡Se cargaron ${loaded.length} canales deportivos con éxito!`);
            closeModal();
          }
        } catch (e) {
          alert("Error: " + e.message);
        } finally {
          btnLoadAutoSports.disabled = false;
          btnLoadAutoSports.textContent = 'Cargar Lista';
        }
      });
    }

    // --- MODAL TAB SWITCHING ---
    const tabBtnAnalyzer = document.getElementById('tabBtnAnalyzer');
    const tabBtnManual = document.getElementById('tabBtnManual');
    const tabContentAnalyzer = document.getElementById('tabContentAnalyzer');
    const tabContentManual = document.getElementById('tabContentManual');
    const btnModalCloseCross = document.getElementById('btnModalCloseCross');

    if (tabBtnAnalyzer && tabBtnManual) {
      tabBtnAnalyzer.addEventListener('click', () => {
        tabBtnAnalyzer.style.background = '#10b981';
        tabBtnAnalyzer.style.color = '#fff';
        tabBtnManual.style.background = 'rgba(255,255,255,0.06)';
        tabBtnManual.style.color = '#94a3b8';
        tabContentAnalyzer.style.display = 'block';
        tabContentManual.style.display = 'none';
      });

      tabBtnManual.addEventListener('click', () => {
        tabBtnManual.style.background = '#10b981';
        tabBtnManual.style.color = '#fff';
        tabBtnAnalyzer.style.background = 'rgba(255,255,255,0.06)';
        tabBtnAnalyzer.style.color = '#94a3b8';
        tabContentManual.style.display = 'block';
        tabContentAnalyzer.style.display = 'none';
      });
    }

    if (btnModalCloseCross) btnModalCloseCross.addEventListener('click', closeModal);

    // --- PLATFORM ANALYZER ENGINE ---
    const inputAnalyzeUrl = document.getElementById('inputAnalyzeUrl');
    const btnRunAnalyzer = document.getElementById('btnRunAnalyzer');
    const analyzerResultsContainer = document.getElementById('analyzerResultsContainer');
    const analyzerStatusText = document.getElementById('analyzerStatusText');
    const analyzerChannelsList = document.getElementById('analyzerChannelsList');
    const btnImportAllExtracted = document.getElementById('btnImportAllExtracted');

    let currentExtractedChannels = [];

    // Preset Chips
    document.querySelectorAll('.btn-preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (inputAnalyzeUrl) {
          inputAnalyzeUrl.value = btn.dataset.url;
          if (btnRunAnalyzer) btnRunAnalyzer.click();
        }
      });
    });

    if (btnRunAnalyzer) {
      btnRunAnalyzer.addEventListener('click', async () => {
        const rawUrl = inputAnalyzeUrl.value.trim();
        if (!rawUrl) {
          alert("Por favor ingresa el enlace de la plataforma, web o lista M3U.");
          return;
        }

        btnRunAnalyzer.disabled = true;
        btnRunAnalyzer.innerHTML = `
          <div style="width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span>ANALIZANDO CÓDIGO FUENTE & TRANSMISIONES...</span>
        `;
        analyzerResultsContainer.style.display = 'none';

        try {
          const apiBase = (window.location.protocol.startsWith('http')) 
            ? window.location.origin 
            : 'http://127.0.0.1:8080';

          let data = null;
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');

          if (isLocal) {
            try {
              const res = await fetch(`${apiBase}/api/analyze?url=${encodeURIComponent(rawUrl)}`);
              data = await res.json();
            } catch (fetchErr) {
              console.warn("Backend analyzer fetch error, trying client-side fallback:", fetchErr);
            }
          }

          if (!data || !data.success) {
            // Client-side fallback with direct fetch and CORS proxy
            let directRes = await fetch(rawUrl).catch(() => null);
            if (!directRes || !directRes.ok) {
              directRes = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(rawUrl)).catch(() => null);
            }
            if (directRes && directRes.ok) {
              const text = await directRes.text();
              const lines = text.split('\n');
              const channels = [];
              let cur = null;
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('#EXTINF:')) {
                  const nameMatch = line.match(/,(.+)$/);
                  const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                  cur = {
                    name: nameMatch ? nameMatch[1].trim() : 'Canal Detectado',
                    logo: logoMatch ? logoMatch[1] : '',
                    tournament: 'Lista Directa'
                  };
                } else if (line.startsWith('http') && cur) {
                  cur.streamUrl = line;
                  channels.push(cur);
                  cur = null;
                }
              }
              data = { success: true, count: channels.length, channels: channels.slice(0, 200), title: 'Lista Descargada' };
            } else {
              throw new Error("No se pudo descargar la lista de canales.");
            }
          }

          if (!data.success) {
            throw new Error(data.error || 'No se pudieron extraer canales de este enlace');
          }

          currentExtractedChannels = data.channels || [];
          if (currentExtractedChannels.length === 0) {
            alert("No se detectaron transmisiones de vídeo abiertas en esta URL.");
            return;
          }

          analyzerStatusText.textContent = `✓ ${currentExtractedChannels.length} canales extraídos (${data.title || data.type || 'M3U'})`;
          analyzerChannelsList.innerHTML = '';

          currentExtractedChannels.forEach((ch, idx) => {
            const item = document.createElement('div');
            item.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);";
            item.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                ${ch.logo ? `<img src="${ch.logo}" style="width: 28px; height: 28px; object-fit: contain; border-radius: 6px;" onerror="this.style.display='none'">` : '<div style="width: 28px; height: 28px; background: #0284c7; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900;">TV</div>'}
                <div>
                  <div style="font-weight: 800; font-size: 13px; color: #fff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 320px;">${ch.name}</div>
                  <div style="font-size: 11px; color: #94a3b8;">${ch.tournament || ch.type || 'Stream Directo'}</div>
                </div>
              </div>
              <button type="button" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; font-weight: 800; font-size: 11px; padding: 6px 12px; cursor: pointer;">
                ▶ Probar
              </button>
            `;

            item.querySelector('button').addEventListener('click', () => {
              const testCh = {
                id: 'extracted-' + Date.now() + '-' + idx,
                name: ch.name,
                subtitle: ch.name,
                tournament: ch.tournament || 'Stream Extraído',
                category: 'personalizados',
                sources: [{ name: 'Servidor Extraído', url: ch.streamUrl }]
              };
              closeModal();
              playChannelWithFailover(testCh, 0);
            });

            analyzerChannelsList.appendChild(item);
          });

          analyzerResultsContainer.style.display = 'block';

        } catch (e) {
          alert("Error al analizar plataforma: " + e.message);
        } finally {
          btnRunAnalyzer.disabled = false;
          btnRunAnalyzer.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>ANALIZAR Y EXTRAER CANALES</span>
          `;
        }
      });
    }

    if (btnImportAllExtracted) {
      btnImportAllExtracted.addEventListener('click', () => {
        if (!currentExtractedChannels || currentExtractedChannels.length === 0) return;

        const mapped = currentExtractedChannels.map((c, i) => ({
          id: 'imported-' + Date.now() + '-' + i,
          name: c.name,
          subtitle: c.name,
          shortName: (c.name || 'CANAL').substring(0, 5).toUpperCase(),
          color: 'linear-gradient(135deg, #0284c7, #0369a1)',
          category: 'personalizados',
          tournament: c.tournament || 'Plataforma Extraída',
          logo: c.logo || '',
          description: 'Canal extraído automáticamente de plataforma web.',
          sources: [{ name: 'Servidor Extraído', url: c.streamUrl }]
        }));

        customChannels = [...mapped, ...customChannels];
        localStorage.setItem('futbol_tv_custom_channels', JSON.stringify(customChannels));
        renderCarousels();
        alert(`¡Se importaron con éxito ${mapped.length} canales a tu fila de Canales Personalizados!`);
        closeModal();
        playChannelWithFailover(mapped[0], 0);
      });
    }

    // --- SEARCH BAR & VIEW EVENTS ---
    if (globalSearchInput) {
      globalSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        btnSearchClear.style.display = searchQuery ? 'flex' : 'none';
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          if (!isSearchMode) {
            openSearchView(searchQuery, selectedFilter);
          } else {
            performSearch();
          }
        }, 120);
      });

      globalSearchInput.addEventListener('focus', () => {
        if (!isSearchMode) {
          openSearchView(globalSearchInput.value.trim(), selectedFilter);
        }
      });
    }

    if (btnSearchClear) {
      btnSearchClear.addEventListener('click', () => {
        globalSearchInput.value = '';
        searchQuery = '';
        btnSearchClear.style.display = 'none';
        globalSearchInput.focus();
        performSearch();
      });
    }

    if (btnSearchCloseView) {
      btnSearchCloseView.addEventListener('click', () => {
        closeSearchView();
      });
    }

    if (btnTopbarAdd) {
      btnTopbarAdd.addEventListener('click', () => {
        openModal();
      });
    }

    if (btnEmptyAddSignal) {
      btnEmptyAddSignal.addEventListener('click', () => {
        openModal();
      });
    }

    // Filter Chips Click Listeners
    if (searchChipsContainer) {
      searchChipsContainer.querySelectorAll('.search-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          playNavSound('select');
          selectedFilter = chip.dataset.filter;
          if (globalSearchInput) {
            globalSearchInput.value = '';
            searchQuery = '';
            btnSearchClear.style.display = 'none';
          }
          updateChipActiveState();
          performSearch();
        });
      });
    }

    // Rail Buttons navigation clicks (5 buttons: Inicio, Buscar, En Directo, Canales, Cargar M3U)
    const railBtns = sidebarRail.querySelectorAll('.rail-btn');
    if (railBtns[0]) railBtns[0].addEventListener('click', () => { closeSearchView(); currentZone = 'hero'; updateFocus(); });
    if (railBtns[1]) railBtns[1].addEventListener('click', () => { openSearchView(); });
    if (railBtns[2]) railBtns[2].addEventListener('click', () => { closeSearchView(); currentZone = 'carousels'; focusedRowIndex = 0; updateFocus(); });
    if (railBtns[3]) railBtns[3].addEventListener('click', () => { closeSearchView(); currentZone = 'carousels'; focusedRowIndex = 1; updateFocus(); });
    if (railBtns[4]) railBtns[4].addEventListener('click', openModal);
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

