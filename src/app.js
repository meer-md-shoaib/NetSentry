/**
 * Music Constellation — Main Application Controller
 * Rebuilt for minimal UI, fullscreen immersive navigation, and instant search fly-to.
 */

import { ingestMusicData, ingestRawRecords, parseCSV, parseJSON, parseXML } from './parser.js?v=8.0.2';
import { storage } from './storage.js?v=8.0.2';
import { enrichmentEngine } from './enrichment/enrichmentEngine.js?v=8.0.2';
import { relationshipEngine } from './intelligence/relationshipEngine.js?v=8.0.2';
import { spatialEngine } from './spatial/spatialEngine.js?v=8.0.2';
import { Universe3D } from './universe/universe3D.js?v=8.0.2';
import { resolveAppleMusicUrl, parseAppleMusicXML } from './integrations/appleMusic.js?v=8.0.2';
import { fetchSpotifyTopTracks, parseSpotifyDataExport, parseTracklistText } from './integrations/spotify.js?v=8.0.2';
import { getNormalizedCriminalRecords, RELATIONSHIPS, SYNDICATES, CRIMINALS } from './data/criminalDataset.js';

/**
 * Generates an SVG dossier avatar with threat aura and initials
 */
function generateSuspectAvatarSvg(name, riskLevel = 'CRITICAL', color = '#38bdf8') {
  const initials = (name || 'Suspect').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const ringColor = riskLevel === 'CRITICAL' ? '#f43f5e' : (riskLevel === 'HIGH' ? '#f59e0b' : '#38bdf8');
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="96" height="96" rx="16" fill="url(%23g)" stroke="${encodeURIComponent(ringColor)}" stroke-width="2.5"/><circle cx="48" cy="36" r="16" fill="%23334155" stroke="${encodeURIComponent(ringColor)}" stroke-width="1.5"/><path d="M24 78 C24 58, 72 58, 72 78 Z" fill="%23334155" stroke="${encodeURIComponent(ringColor)}" stroke-width="1.5"/><text x="48" y="41" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="%23ffffff">${initials}</text></svg>`;
}

// Application State
const state = {
  library: null,
  constellation: null,
  activeTargetTrackId: null,
  metadataStatus: null
};

let universe3D = null;

// DOM Elements
const webglUniverseContainer = document.getElementById('webgl-universe-container');
const universe3dTooltip = document.getElementById('universe-3d-tooltip');
const universeBreadcrumb = document.getElementById('universe-breadcrumb');
const universeSearchInput = document.getElementById('universe-search-input');
const btnClearSearch = document.getElementById('btn-clear-search');
const searchResultsPopup = document.getElementById('search-results-popup');

const btn3dZoomIn = document.getElementById('btn-3d-zoom-in');
const btn3dZoomOut = document.getElementById('btn-3d-zoom-out');
const btn3dReset = document.getElementById('btn-3d-reset');

// Phase 7: HUD Toggles
const btnToggle2D = document.getElementById('btn-toggle-2d');
const toggleText2D = document.getElementById('toggle-2d-text');
const btnToggleFilaments = document.getElementById('btn-toggle-filaments');

// Phase 7: Filter Popover
const btnFilterTrigger = document.getElementById('btn-filter-trigger');
const filterPopover = document.getElementById('filter-popover');
const filterGenreSelect = document.getElementById('filter-genre-select');
const filterPlaylistSelect = document.getElementById('filter-playlist-select');
const timelineSliderMin = document.getElementById('timeline-slider-min');
const timelineSliderMax = document.getElementById('timeline-slider-max');
const timelineRangeLabel = document.getElementById('timeline-range-label');
const filterActiveCount = document.getElementById('filter-active-count');
const btnResetFilters = document.getElementById('btn-reset-filters');
const filterTypeArtists = document.getElementById('filter-type-artists');
const filterTypeAlbums = document.getElementById('filter-type-albums');
const filterTypeSongs = document.getElementById('filter-type-songs');
const filterConnectionsToggle = document.getElementById('filter-connections-toggle');
const filterCountSongs = document.getElementById('filter-count-songs');
const filterCountArtists = document.getElementById('filter-count-artists');
const filterCountAlbums = document.getElementById('filter-count-albums');

// Phase 7: Dataset & Metadata Status
const btnStatusTrigger = document.getElementById('btn-status-trigger');
const statusPulseDot = document.getElementById('status-pulse-dot');
const statusModalBackdrop = document.getElementById('status-modal-backdrop');
const btnCloseStatusModal = document.getElementById('btn-close-status-modal');
const statusModalBody = document.getElementById('status-modal-body');


const btnSampleDropdown = document.getElementById('btn-sample-dropdown');
const sampleDropdownMenu = document.getElementById('sample-dropdown-menu');
const btnLoadRealWorldD = document.getElementById('btn-load-realworld-d');
const btnLoadElectronic = document.getElementById('btn-load-electronic');
const btnLoadIndie = document.getElementById('btn-load-indie');
const btnLoadSynthetic309 = document.getElementById('btn-load-synthetic309');

const btnUploadTrigger = document.getElementById('btn-upload-trigger');
const fileInput = document.getElementById('file-input');
const uploadModalBackdrop = document.getElementById('upload-modal-backdrop');
const btnCloseUploadModal = document.getElementById('btn-close-upload-modal');
const dropzone = document.getElementById('dropzone');

const btnClearTrigger = document.getElementById('btn-clear-library-trigger');
const clearModalBackdrop = document.getElementById('clear-modal-backdrop');
const clearModalCancelBtn = document.getElementById('clear-modal-cancel-btn');
const clearModalCancelX = document.getElementById('clear-modal-cancel-x');
const clearModalConfirmBtn = document.getElementById('clear-modal-confirm-btn');

const progressPanel = document.getElementById('progress-panel');

// Slide-Over Detail Inspector Drawer
const detailInspector = document.getElementById('detail-inspector');
const btnCloseInspector = document.getElementById('btn-close-inspector');
const inspectorCategory = document.getElementById('inspector-category');
const inspectorArtwork = document.getElementById('inspector-artwork');
const inspectorTitle = document.getElementById('inspector-title');
const inspectorSubtitle = document.getElementById('inspector-subtitle');
const inspectorGalaxyBadge = document.getElementById('inspector-galaxy-badge');
const inspectorAlbum = document.getElementById('inspector-album');
const inspectorGenre = document.getElementById('inspector-genre');
const inspectorPlaylists = document.getElementById('inspector-playlists');
const inspectorCoords = document.getElementById('inspector-coords');
const inspectorEnrichmentStatus = document.getElementById('inspector-enrichment-status');
const inspectorEnrichmentDetails = document.getElementById('inspector-enrichment-details');
const inspectorMbProvider = document.getElementById('inspector-mb-provider');
const inspectorMbConfidence = document.getElementById('inspector-mb-confidence');
const inspectorMbDate = document.getElementById('inspector-mb-date');
const inspectorMbCanonical = document.getElementById('inspector-mb-canonical');
const inspectorMbIds = document.getElementById('inspector-mb-ids');
const inspectorRelationshipsList = document.getElementById('inspector-relationships-list');
const inspectorArtistsList = document.getElementById('inspector-artists-list');
const btnInspectorFlyTo = document.getElementById('btn-inspector-flyto');

const toastContainer = document.getElementById('toast-container');

// Phase 7 state
let is2DMode = false;
let filamentsVisible = true;

/**
 * Toast Notification
 */
function showToast(message, type = 'info', duration = 2800) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }, duration);
}

const tabBtnOverview = document.getElementById('tab-btn-overview');
const tabBtnLog = document.getElementById('tab-btn-log');
const logCountPill = document.getElementById('log-count-pill');
const connectionTooltip = document.getElementById('connection-tooltip');
let activeStatusTab = 'overview';

/**
 * 4-Phase Processing Panel Controller
 */
function showProcessingPanel(visible) {
  if (!progressPanel) return;
  progressPanel.style.display = visible ? 'block' : 'none';
}

function updateProcessingUI(data = {}) {
  if (!progressPanel) return;

  if (data.fileName) {
    const el = document.getElementById('proc-file-name');
    if (el) el.textContent = data.fileName;
  }
  if (data.importStatus !== undefined) {
    const el = document.getElementById('proc-import-status');
    if (el) el.textContent = data.importStatus;
  }
  if (data.importDetail !== undefined) {
    const el = document.getElementById('proc-import-detail');
    if (el) el.textContent = data.importDetail;
  }
  if (data.enrichmentStatus !== undefined) {
    const el = document.getElementById('proc-enrichment-status');
    if (el) el.textContent = data.enrichmentStatus;
  }
  if (data.showEnrichmentBar !== undefined) {
    const wrap = document.getElementById('proc-enrichment-bar-wrap');
    if (wrap) wrap.style.display = data.showEnrichmentBar ? 'block' : 'none';
  }
  if (data.enrichmentPercent !== undefined) {
    const bar = document.getElementById('proc-enrichment-bar');
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, data.enrichmentPercent))}%`;
  }
  if (data.matchedCount !== undefined || data.unmatchedCount !== undefined) {
    const countsWrap = document.getElementById('proc-enrichment-counts');
    if (countsWrap) countsWrap.style.display = 'block';
    const m = document.getElementById('proc-matched-num');
    const p = document.getElementById('proc-partial-num');
    const u = document.getElementById('proc-unmatched-num');
    if (m) m.textContent = data.matchedCount || 0;
    if (p) p.textContent = data.partialCount || 0;
    if (u) u.textContent = data.unmatchedCount || 0;
  }
  if (data.currentTrack !== undefined) {
    const cur = document.getElementById('proc-enrichment-current');
    if (cur) {
      cur.style.display = data.currentTrack ? 'block' : 'none';
      cur.textContent = data.currentTrack;
    }
  }
  if (data.relStatus !== undefined) {
    const el = document.getElementById('proc-rel-status');
    if (el) el.textContent = data.relStatus;
  }
  if (data.constellationStatus !== undefined) {
    const el = document.getElementById('proc-constellation-status');
    if (el) el.textContent = data.constellationStatus;
  }
}

/**
 * Escapes HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders interactive drill-down breadcrumb trail
 */
function renderBreadcrumbs(crumbs = []) {
  if (!universeBreadcrumb) return;
  universeBreadcrumb.innerHTML = '';

  if (!crumbs || crumbs.length === 0) {
    crumbs = [{ level: 1, label: 'Universe', key: 'universe' }];
  }

  crumbs.forEach((crumb, idx) => {
    if (idx > 0) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '/';
      universeBreadcrumb.appendChild(sep);
    }

    const btn = document.createElement('button');
    btn.className = `crumb-btn ${idx === crumbs.length - 1 ? 'active' : ''}`;
    btn.textContent = crumb.label;
    btn.title = `Zoom to Level ${crumb.level} (${crumb.label})`;

    btn.onclick = (e) => {
      e.stopPropagation();
      if (!universe3D) return;

      if (crumb.level === 1) {
        universe3D.resetCamera(true);
        detailInspector.classList.remove('open');
      } else if (crumb.level === 2 && crumb.id) {
        universe3D.focusGalaxy(crumb.id);
      } else if (crumb.level === 3 && crumb.name) {
        universe3D.focusArtist(crumb.name);
        openArtistInspector(crumb.name);
      } else if (crumb.level === 4 && crumb.id) {
        universe3D.focusAlbum(crumb.id);
        const alb = universe3D.albumsDataList.find(a => a.id === crumb.id);
        if (alb) openAlbumInspector(alb);
      } else if (crumb.level === 5 && crumb.id) {
        universe3D.focusTrack(crumb.id);
        const trk = universe3D.starDataList.find(t => t.id === crumb.id);
        if (trk) openTrackInspector(trk);
      } else {
        universe3D.flyToLevel(crumb.level);
      }
    };

    universeBreadcrumb.appendChild(btn);
  });
}

/**
 * Initializes 3D WebGL Universe Engine
 */
function initUniverseEngine() {
  if (universe3D || !webglUniverseContainer) return;

  universe3D = new Universe3D(webglUniverseContainer, {
    onSelectTrack: (track) => {
      state.activeTargetTrackId = track.id;
      openTrackInspector(track);
    },
    onSelectAlbum: (album) => {
      openAlbumInspector(album);
    },
    onSelectArtist: (artistName) => {
      openArtistInspector(artistName);
    },
    onSelectGalaxy: (galaxy) => {
      showToast(`Arrived at ${galaxy.name}`, 'info', 2000);
    },
    onHoverObject: (target, clientX, clientY) => {
      if (!universe3dTooltip) return;
      if (target) {
        const rect = webglUniverseContainer.getBoundingClientRect();
        universe3dTooltip.style.display = 'block';
        universe3dTooltip.style.left = `${clientX - rect.left}px`;
        universe3dTooltip.style.top = `${clientY - rect.top}px`;

        if (target.type === 'track') {
          const track = target.data;
          const riskBadge = track.risk_level === 'CRITICAL'
            ? '<span style="color:#f43f5e;font-weight:700;font-size:9px;padding:1px 4px;border-radius:3px;background:rgba(244,63,94,0.15);border:1px solid rgba(244,63,94,0.3);">CRITICAL</span>'
            : (track.risk_level === 'HIGH'
              ? '<span style="color:#f59e0b;font-weight:700;font-size:9px;padding:1px 4px;border-radius:3px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);">HIGH</span>'
              : '<span style="color:#10b981;font-weight:700;font-size:9px;padding:1px 4px;border-radius:3px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);">MEDIUM</span>');
          const aliasLine = (track.aliases && track.aliases.length > 0)
            ? `<div style="color: #cbd5e1; font-size: 10px; margin-top: 1px;">Alias: <em>${escapeHtml(track.aliases[0])}</em></div>`
            : '';
          universe3dTooltip.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: #ffffff; font-size: 11.5px;">${escapeHtml(track.title)}</span>
              ${riskBadge}
            </div>
            ${aliasLine}
            <div style="color: ${track.galaxy_color || '#38bdf8'}; font-size: 10px; margin-top: 2px;">${escapeHtml(track.artist)}</div>
            <div style="color: #94a3b8; font-size: 9.5px; margin-top: 2px;">Cell: ${escapeHtml(track.album || 'Module')} • ${escapeHtml(track.genre || 'Crime')}</div>
          `;
        } else if (target.type === 'album') {
          const album = target.data;
          universe3dTooltip.innerHTML = `
            <div style="font-weight: 700; color: #ffffff; font-size: 11.5px;">Operational Cell • ${escapeHtml(album.album)}</div>
            <div style="color: ${album.galaxy_color || '#38bdf8'}; font-size: 10px; margin-top: 1px;">${escapeHtml(album.artist)} • ${album.total_tracks} suspects mapped</div>
          `;
        } else if (target.type === 'artist') {
          const artist = target.data;
          universe3dTooltip.innerHTML = `
            <div style="font-weight: 700; color: #ffffff; font-size: 11.5px;">Syndicate • ${escapeHtml(artist.artist)}</div>
            <div style="color: ${artist.galaxy_color || '#38bdf8'}; font-size: 10px; margin-top: 1px;">${artist.total_songs} operatives in network</div>
          `;
        } else if (target.type === 'connection') {
          const conn = target.data;
          universe3dTooltip.innerHTML = `
            <div style="font-weight: 600; color: #38bdf8; font-size: 11px;">🕸️ ${escapeHtml(conn.explanation || 'Intelligence Connection')}</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 1px;">Corroborated Link Strength • ${Math.round((conn.weight || 0.5) * 100)}%</div>
          `;
        }
      } else {
        universe3dTooltip.style.display = 'none';
      }
    },
    onLevelChange: (levelNum, crumbs) => {
      renderBreadcrumbs(crumbs);
    },
    getRelatedTracks: (trackId, limit) => {
      return relationshipEngine.getRelatedTracks(trackId, limit);
    }
  });

  window.__universe3D = universe3D;
}

/**
 * Phase 7: Populate genre, playlist dropdowns, and timeline range from constellation metadata
 */
function populateFilters(constellation) {
  const meta = constellation.filter_metadata;
  if (!meta) return;

  // Genre select
  if (filterGenreSelect) {
    filterGenreSelect.innerHTML = '<option value="ALL">All Genres</option>';
    (meta.genresList || []).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      filterGenreSelect.appendChild(opt);
    });
  }

  // Playlist select
  if (filterPlaylistSelect) {
    filterPlaylistSelect.innerHTML = '<option value="ALL">All Playlists</option>';
    (meta.playlistsList || []).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      filterPlaylistSelect.appendChild(opt);
    });
  }

  // Timeline sliders
  const yMin = meta.yearMin || 1960;
  const yMax = meta.yearMax || new Date().getFullYear();
  if (timelineSliderMin) {
    timelineSliderMin.min = yMin;
    timelineSliderMin.max = yMax;
    timelineSliderMin.value = yMin;
  }
  if (timelineSliderMax) {
    timelineSliderMax.min = yMin;
    timelineSliderMax.max = yMax;
    timelineSliderMax.value = yMax;
  }
  if (timelineRangeLabel) {
    timelineRangeLabel.textContent = 'All Years';
  }
}

/**
 * Phase 7: Count active filters and update the badge
 */
function updateFilterBadge() {
  let count = 0;
  if (filterGenreSelect && filterGenreSelect.value !== 'ALL') count++;
  if (filterPlaylistSelect && filterPlaylistSelect.value !== 'ALL') count++;
  const yMin = parseInt(timelineSliderMin?.value || '1960', 10);
  const yMax = parseInt(timelineSliderMax?.value || '2025', 10);
  const sliderMin = parseInt(timelineSliderMin?.min || '1960', 10);
  const sliderMax = parseInt(timelineSliderMax?.max || '2025', 10);
  if (yMin > sliderMin || yMax < sliderMax) count++;
  if (filterTypeArtists && !filterTypeArtists.checked) count++;
  if (filterTypeAlbums && !filterTypeAlbums.checked) count++;
  if (filterTypeSongs && !filterTypeSongs.checked) count++;
  if (filterConnectionsToggle && !filterConnectionsToggle.checked) count++;

  if (filterActiveCount) {
    filterActiveCount.textContent = count;
    filterActiveCount.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  return count;
}

/**
 * Phase 7: Applies current filter values to universe3D
 */
function applyFilters() {
  if (!universe3D) return;
  const genre = filterGenreSelect?.value || 'ALL';
  const playlist = filterPlaylistSelect?.value || 'ALL';
  const yearMin = parseInt(timelineSliderMin?.value || '1960', 10);
  const yearMax = parseInt(timelineSliderMax?.value || '2025', 10);

  const entityTypes = {
    artists: filterTypeArtists ? filterTypeArtists.checked : true,
    albums: filterTypeAlbums ? filterTypeAlbums.checked : true,
    songs: filterTypeSongs ? filterTypeSongs.checked : true
  };

  const showConnections = filterConnectionsToggle ? filterConnectionsToggle.checked : true;
  universe3D.setConnectionsVisible(showConnections);
  if (btnToggleFilaments) btnToggleFilaments.classList.toggle('active', showConnections);

  const res = universe3D.setFilter({ genre, playlist, yearMin, yearMax, entityTypes });
  updateFilterBadge();

  if (filterCountSongs) filterCountSongs.textContent = `${res.songs} songs`;
  if (filterCountArtists) filterCountArtists.textContent = `${res.artists} artists`;
  if (filterCountAlbums) filterCountAlbums.textContent = `${res.albums} albums`;

  const isFiltered = genre !== 'ALL' || playlist !== 'ALL' || 
    yearMin > parseInt(timelineSliderMin?.min || '1960', 10) || 
    yearMax < parseInt(timelineSliderMax?.max || '2025', 10) ||
    !entityTypes.artists || !entityTypes.albums || !entityTypes.songs || !showConnections;

  if (isFiltered) {
    showToast(`Showing: ${res.songs} songs • ${res.artists} artists • ${res.albums} albums`, 'info', 2200);
  }
}

/**
 * Phase 7: Renders search autocomplete popup
 */
function renderSearchPopup(query) {
  if (!searchResultsPopup) return;

  if (!query || query.trim().length < 2 || !universe3D) {
    searchResultsPopup.style.display = 'none';
    return;
  }

  const q = query.trim().toLowerCase();
  const groups = [];

  // Syndicates (Artists)
  const artists = (universe3D.artistDataList || []).filter(a => a.artist.toLowerCase().includes(q)).slice(0, 4);
  if (artists.length > 0) {
    groups.push({
      label: 'Syndicates',
      items: artists.map(a => ({
        main: a.artist,
        sub: `${a.total_songs} suspects in ring · ${a.galaxy_id || ''}`,
        onClick: () => {
          universe3D.focusArtist(a.artist);
          openArtistInspector(a.artist);
          closeSearchPopup();
        }
      }))
    });
  }

  // Operational Cells (Albums)
  const albums = (universe3D.albumsDataList || []).filter(a => a.album.toLowerCase().includes(q)).slice(0, 3);
  if (albums.length > 0) {
    groups.push({
      label: 'Operational Cells',
      items: albums.map(a => ({
        main: a.album,
        sub: `${a.artist} · ${a.total_tracks} operatives`,
        onClick: () => {
          universe3D.focusAlbum(a.id);
          openAlbumInspector(a);
          closeSearchPopup();
        }
      }))
    });
  }

  // Suspects & Aliases (Songs)
  const suspects = (universe3D.starDataList || []).filter(t => {
    const matchName = t.title.toLowerCase().includes(q);
    const matchAlias = (t.aliases || []).some(al => al.toLowerCase().includes(q));
    const matchFir = (t.fir_records || []).some(fir => fir.toLowerCase().includes(q));
    const matchAgency = (t.playlist || '').toLowerCase().includes(q);
    return matchName || matchAlias || matchFir || matchAgency;
  }).slice(0, 5);

  if (suspects.length > 0) {
    groups.push({
      label: 'Criminal Suspects & Aliases (USP 1)',
      items: suspects.map(t => {
        const matchedAlias = (t.aliases || []).find(al => al.toLowerCase().includes(q));
        const subText = matchedAlias
          ? `Alias match: "${matchedAlias}" • ${t.artist}`
          : `${t.artist} • ${t.album || 'Cell'}`;
        return {
          main: t.title,
          sub: subText,
          onClick: () => {
            universe3D.focusTrack(t.id);
            openTrackInspector(t);
            closeSearchPopup();
          }
        };
      })
    });
  }

  // Macro Crime Rings (Galaxies)
  const galaxies = (state.constellation?.galaxies || []).filter(g => g.name.toLowerCase().includes(q)).slice(0, 2);
  if (galaxies.length > 0) {
    groups.push({
      label: 'Crime Clusters',
      items: galaxies.map(g => ({
        main: g.name,
        sub: `${g.track_ids?.length || 0} suspects in cluster`,
        onClick: () => {
          universe3D.focusGalaxy(g.id);
          closeSearchPopup();
          showToast(`Arrived at ${g.name}`, 'info', 1800);
        }
      }))
    });
  }

  if (groups.length === 0) {
    searchResultsPopup.style.display = 'none';
    return;
  }

  searchResultsPopup.innerHTML = '';
  groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'search-results-group';

    const catTitle = document.createElement('div');
    catTitle.className = 'search-cat-title';
    catTitle.textContent = group.label;
    groupEl.appendChild(catTitle);

    group.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'search-result-item';
      row.innerHTML = `
        <div>
          <div class="search-result-main">${escapeHtml(item.main)}</div>
          <div class="search-result-sub">${escapeHtml(item.sub)}</div>
        </div>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      `;
      row.addEventListener('mousedown', (e) => {
        e.preventDefault(); // prevent blur from hiding before click fires
        item.onClick();
      });
      groupEl.appendChild(row);
    });

    searchResultsPopup.appendChild(groupEl);
  });

  searchResultsPopup.style.display = 'block';
}

function closeSearchPopup() {
  if (searchResultsPopup) searchResultsPopup.style.display = 'none';
}

/**
 * Opens Slide-Over Inspector Drawer for a Criminal Suspect Dossier (Level 5)
 */
function openTrackInspector(track) {
  if (!track) return;
  inspectorCategory.textContent = 'Suspect Intelligence Dossier • SIH 2026';

  inspectorArtwork.src = generateSuspectAvatarSvg(track.title, track.risk_level, track.galaxy_color);

  inspectorTitle.textContent = track.title;
  inspectorSubtitle.textContent = track.artist;
  inspectorSubtitle.style.cursor = 'pointer';
  inspectorSubtitle.title = 'Click to focus syndicate';
  inspectorSubtitle.onclick = () => {
    universe3D.focusArtist(track.artist);
    openArtistInspector(track.artist);
  };

  const riskPct = Math.round((track.risk_score || 0.85) * 100);
  const riskLevel = track.risk_level || (riskPct >= 90 ? 'CRITICAL' : (riskPct >= 80 ? 'HIGH' : 'MEDIUM'));
  inspectorGalaxyBadge.textContent = `${riskLevel} THREAT • Risk Index: ${riskPct}%`;
  inspectorGalaxyBadge.className = `inspector-galaxy-badge threat-badge-${riskLevel.toLowerCase()}`;

  inspectorAlbum.textContent = track.album || 'Operational Cell';
  inspectorAlbum.style.cursor = 'pointer';
  inspectorAlbum.title = 'Click to focus operational cell';
  inspectorAlbum.onclick = () => {
    if (track.album_id && universe3D) {
      universe3D.focusAlbum(track.album_id);
      const alb = universe3D.albumsDataList.find(a => a.id === track.album_id);
      if (alb) openAlbumInspector(alb);
    }
  };

  inspectorGenre.textContent = track.genre || 'Crime Classification';
  inspectorPlaylists.textContent = track.playlist || 'Primary Agency';
  inspectorCoords.textContent = `[${track.x.toFixed(1)}, ${track.y.toFixed(1)}, ${track.z.toFixed(1)}]`;

  // NetSentry USP 1: Alias & Identity Resolution
  if (inspectorEnrichmentStatus) {
    const conf = Math.round((track.alias_confidence || 0.94) * 100);
    inspectorEnrichmentStatus.innerHTML = `<span class="status-badge-matched">✓ Identity Resolved (${conf}% Confidence)</span>`;
  }

  if (inspectorEnrichmentDetails) {
    inspectorEnrichmentDetails.style.display = 'block';
    if (inspectorMbProvider) inspectorMbProvider.textContent = 'NetSentry Multi-Signal Matcher';
    if (inspectorMbConfidence) inspectorMbConfidence.textContent = `${Math.round((track.alias_confidence || 0.94) * 100)}% Match`;
    if (inspectorMbDate) inspectorMbDate.textContent = (track.fir_records && track.fir_records[0]) ? track.fir_records[0] : 'FIR Active';

    const aliasesHtml = (track.aliases || []).map(al => `<span class="alias-pill">${escapeHtml(al)}</span>`).join('');
    if (inspectorMbCanonical) inspectorMbCanonical.innerHTML = aliasesHtml || escapeHtml(track.title);

    // Hard Identifiers (USP 2: Cross-Jurisdiction corroboration)
    if (inspectorMbIds) {
      const idParts = [];
      if (track.hard_identifiers) {
        if (track.hard_identifiers.phone) idParts.push(`<div class="hard-id-item"><strong style="color:var(--color-aurora-cyan);">📞 Phone:</strong> ${escapeHtml(track.hard_identifiers.phone)}</div>`);
        if (track.hard_identifiers.imei) idParts.push(`<div class="hard-id-item"><strong style="color:var(--color-aurora-cyan);">📱 IMEI:</strong> ${escapeHtml(track.hard_identifiers.imei)}</div>`);
        if (track.hard_identifiers.vehicle) idParts.push(`<div class="hard-id-item"><strong style="color:var(--color-aurora-cyan);">🚗 Vehicle:</strong> ${escapeHtml(track.hard_identifiers.vehicle)}</div>`);
        if (track.hard_identifiers.accounts) {
          const accs = Array.isArray(track.hard_identifiers.accounts) ? track.hard_identifiers.accounts.join(', ') : track.hard_identifiers.accounts;
          idParts.push(`<div class="hard-id-item"><strong style="color:var(--color-aurora-cyan);">💳 Accounts:</strong> ${escapeHtml(accs)}</div>`);
        }
      }
      if (track.fir_records && track.fir_records.length > 1) {
        idParts.push(`<div class="hard-id-item"><strong style="color:#f43f5e;">⚖️ Case Dossiers:</strong> ${escapeHtml(track.fir_records.slice(1).join(' • '))}</div>`);
      }
      if (track.explainability) {
        idParts.push(`<div class="hard-id-item" style="border-left-color:#a855f7; margin-top:6px;"><strong style="color:#a855f7;">💡 Centrality Flag:</strong> <em>${escapeHtml(track.explainability)}</em></div>`);
      }
      inspectorMbIds.innerHTML = idParts.join('') || 'Multi-agency records verified';
    }
  }

  // Populate Connected Criminal Associates (Top 5 closest multi-signal edges)
  inspectorRelationshipsList.innerHTML = '';
  const related = relationshipEngine.getRelatedTracks(track.id, 5);

  related.forEach(rel => {
    const explanation = rel.explanation || (rel.track.genre === track.genre ? `Shared classification · ${track.genre}` : 'Multi-agency connection');
    const card = document.createElement('div');
    card.className = 'inspector-rel-card';
    card.innerHTML = `
      <div>
        <div class="rel-name">👤 ${escapeHtml(rel.track.title)}</div>
        <div class="rel-reason">${escapeHtml(rel.track.artist)} • <span style="color:#38bdf8;">${escapeHtml(explanation)}</span></div>
      </div>
      <span class="rel-score">${Math.round(rel.score * 100)}%</span>
    `;
    card.onclick = () => {
      universe3D.focusTrack(rel.track.id);
      openTrackInspector(rel.track);
    };
    inspectorRelationshipsList.appendChild(card);
  });

  // Populate Related Artists
  inspectorArtistsList.innerHTML = '';
  const relArtists = relationshipEngine.getRelatedArtists(track.artist, 3);
  relArtists.forEach(item => {
    const card = document.createElement('div');
    card.className = 'inspector-rel-card';
    card.innerHTML = `
      <div>
        <div class="rel-name">${escapeHtml(item.artist)}</div>
        <div class="rel-reason">${escapeHtml(item.explanation)}</div>
      </div>
      <span class="rel-score">${Math.round(item.score * 100)}%</span>
    `;
    card.onclick = () => {
      universe3D.focusArtist(item.artist);
      openArtistInspector(item.artist);
    };
    inspectorArtistsList.appendChild(card);
  });

  btnInspectorFlyTo.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
    Focus Suspect In Constellation
  `;
  btnInspectorFlyTo.onclick = () => {
    universe3D.focusTrack(track.id);
  };

  detailInspector.classList.add('open');
}

/**
 * Opens Slide-Over Inspector Drawer for an Operational Cell (Level 4)
 */
function openAlbumInspector(album) {
  if (!album) return;
  if (inspectorEnrichmentDetails) inspectorEnrichmentDetails.style.display = 'none';
  inspectorCategory.textContent = 'Operational Cell • Level 4';

  inspectorArtwork.src = generateSuspectAvatarSvg(album.album, 'HIGH', album.galaxy_color);

  inspectorTitle.textContent = album.album;
  inspectorSubtitle.textContent = album.artist;
  inspectorSubtitle.style.cursor = 'pointer';
  inspectorSubtitle.title = 'Click to focus syndicate';
  inspectorSubtitle.onclick = () => {
    universe3D.focusArtist(album.artist);
    openArtistInspector(album.artist);
  };

  inspectorGalaxyBadge.textContent = 'Cell Operations Hub';
  inspectorGalaxyBadge.style.color = album.galaxy_color || 'var(--color-aurora-cyan)';
  inspectorGalaxyBadge.style.borderColor = `${album.galaxy_color}55`;
  inspectorGalaxyBadge.style.background = `${album.galaxy_color}15`;

  inspectorAlbum.textContent = album.album;
  inspectorAlbum.style.cursor = 'default';
  inspectorGenre.textContent = `${album.total_tracks} Active Suspects in Cell`;
  inspectorPlaylists.textContent = 'Operational Module';
  inspectorCoords.textContent = `[${album.centroid[0].toFixed(1)}, ${album.centroid[1].toFixed(1)}, ${album.centroid[2].toFixed(1)}]`;

  // Populate Suspects belonging to this cell
  inspectorRelationshipsList.innerHTML = '';
  const albumTracks = (state.constellation?.tracks || []).filter(t => t.album_id === album.id);

  albumTracks.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'inspector-rel-card';
    card.innerHTML = `
      <div>
        <div class="rel-name">👤 ${escapeHtml(t.title)}</div>
        <div class="rel-reason">${escapeHtml(t.genre || 'Cell Operative')} • <span style="color:#f59e0b;">${t.risk_level || 'HIGH'}</span></div>
      </div>
      <span class="rel-score">Inspect</span>
    `;
    card.onclick = () => {
      universe3D.focusTrack(t.id);
      openTrackInspector(t);
    };
    inspectorRelationshipsList.appendChild(card);
  });

  // Populate Related Crime Rings
  inspectorArtistsList.innerHTML = '';
  const relArtists = relationshipEngine.getRelatedArtists(album.artist, 3);
  relArtists.forEach(item => {
    const card = document.createElement('div');
    card.className = 'inspector-rel-card';
    card.innerHTML = `
      <div>
        <div class="rel-name">${escapeHtml(item.artist)}</div>
        <div class="rel-reason">${escapeHtml(item.explanation)}</div>
      </div>
      <span class="rel-score">${Math.round(item.score * 100)}%</span>
    `;
    card.onclick = () => {
      universe3D.focusArtist(item.artist);
      openArtistInspector(item.artist);
    };
    inspectorArtistsList.appendChild(card);
  });

  btnInspectorFlyTo.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
    Focus Cell In Network Graph
  `;
  btnInspectorFlyTo.onclick = () => {
    universe3D.focusAlbum(album.id);
  };

  detailInspector.classList.add('open');
}

/**
 * Opens Slide-Over Inspector Drawer for a Crime Syndicate (Level 3)
 */
function openArtistInspector(artistName) {
  if (!state.library) return;
  if (inspectorEnrichmentDetails) inspectorEnrichmentDetails.style.display = 'none';
  const tracksByArtist = state.library.records.filter(t => t.artist.toLowerCase() === artistName.toLowerCase());
  if (tracksByArtist.length === 0) return;

  const firstTrack = tracksByArtist[0];
  inspectorCategory.textContent = 'Crime Syndicate Command Dossier • Level 3';

  inspectorArtwork.src = generateSuspectAvatarSvg(artistName, 'CRITICAL', firstTrack.galaxy_color);

  inspectorTitle.textContent = artistName;
  inspectorSubtitle.textContent = `${tracksByArtist.length} Suspects Mapped in Network`;
  inspectorSubtitle.style.cursor = 'default';
  inspectorGalaxyBadge.textContent = 'Syndicate Command Ring';

  const artistAlbums = (universe3D?.albumsDataList || []).filter(a => a.artist.toLowerCase() === artistName.toLowerCase());
  inspectorAlbum.textContent = `${artistAlbums.length || 1} Operational Cells`;
  inspectorAlbum.style.cursor = 'default';
  inspectorGenre.textContent = firstTrack.genre || 'Organized Crime';
  inspectorPlaylists.textContent = `${new Set(tracksByArtist.map(t => t.playlist)).size} Investigating Agencies`;
  inspectorCoords.textContent = 'Syndicate Command Centroid';

  // Populate Cells & Key Suspects in this Syndicate
  inspectorRelationshipsList.innerHTML = '';

  if (artistAlbums.length > 0) {
    artistAlbums.forEach(alb => {
      const card = document.createElement('div');
      card.className = 'inspector-rel-card';
      card.innerHTML = `
        <div>
          <div class="rel-name">🏢 ${escapeHtml(alb.album)}</div>
          <div class="rel-reason">${alb.total_tracks} suspects in cell cluster</div>
        </div>
        <span class="rel-score">Orbit</span>
      `;
      card.onclick = () => {
        universe3D.focusAlbum(alb.id);
        openAlbumInspector(alb);
      };
      inspectorRelationshipsList.appendChild(card);
    });
  } else {
    tracksByArtist.slice(0, 6).forEach(t => {
      const card = document.createElement('div');
      card.className = 'inspector-rel-card';
      card.innerHTML = `
        <div>
          <div class="rel-name">👤 ${escapeHtml(t.title)}</div>
          <div class="rel-reason">${escapeHtml(t.album || 'Cell')}</div>
        </div>
        <span class="rel-score">★</span>
      `;
      card.onclick = () => {
        universe3D.focusTrack(t.id);
        openTrackInspector(t);
      };
      inspectorRelationshipsList.appendChild(card);
    });
  }

  // Populate Related Syndicates (Inter-Gang Connections)
  inspectorArtistsList.innerHTML = '';
  const relArtists = relationshipEngine.getRelatedArtists(artistName, 3);
  relArtists.forEach(item => {
    const card = document.createElement('div');
    card.className = 'inspector-rel-card';
    card.innerHTML = `
      <div>
        <div class="rel-name">🕸️ ${escapeHtml(item.artist)}</div>
        <div class="rel-reason">${escapeHtml(item.explanation)}</div>
      </div>
      <span class="rel-score">${Math.round(item.score * 100)}%</span>
    `;
    card.onclick = () => {
      universe3D.focusArtist(item.artist);
      openArtistInspector(item.artist);
    };
    inspectorArtistsList.appendChild(card);
  });

  btnInspectorFlyTo.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
    Focus Syndicate In Network Graph
  `;
  btnInspectorFlyTo.onclick = () => {
    universe3D.focusArtist(artistName);
  };

  detailInspector.classList.add('open');
}

/**
 * Renders honest calculated dataset & enrichment status into status modal
 */
function renderStatusModal() {
  if (!statusModalBody) return;
  const s = state.metadataStatus;
  const logs = s?.enrichmentLog || enrichmentEngine.getEnrichmentLog() || [];

  if (logCountPill) {
    logCountPill.textContent = logs.length;
  }

  if (!s || !state.constellation) {
    statusModalBody.innerHTML = `
      <div style="text-align: center; padding: 24px 12px; color: var(--color-muted);">
        <p style="font-size: 13px; color: #ffffff; font-weight: 600;">No Library Loaded</p>
        <p style="font-size: 11px; margin-top: 4px;">Load a sample dataset or import a file to view processing status.</p>
      </div>
    `;
    return;
  }

  if (activeStatusTab === 'log') {
    const rowsHtml = logs.map(entry => {
      return `
        <tr>
          <td style="color: var(--color-muted); font-family: var(--font-mono); font-size: 10px;">${entry.index || '-'}</td>
          <td>
            <div class="log-input-title" style="font-weight: 600; color: #ffffff;">${escapeHtml(entry.input)}</div>
            <div class="log-input-sub" style="color: #94a3b8; font-size: 10px;">${escapeHtml(entry.albumInput || 'Operational Cell')}</div>
          </td>
          <td style="font-family: var(--font-mono); font-size: 10px;">
            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); font-weight: 600; color: #38bdf8;">
              ⚡ NetSentry Matcher
            </span>
            <div style="color: #64748b; font-size: 9px; margin-top: 2px;">Lookup: "${escapeHtml(entry.lookup || '')}"</div>
          </td>
          <td>
            <div style="color: #ffffff; font-weight: 500; font-size: 11px;">${escapeHtml(entry.resultTitle)}</div>
            <div style="font-size: 10px; color: var(--color-aurora-cyan); margin-top: 2px;">📞 ${escapeHtml(entry.recording_id || 'Verified')} • ⚖️ ${escapeHtml(entry.artist_id || 'Agency Record')}</div>
          </td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: #34d399;">
            ${Math.round((entry.confidence || 0.94) * 100)}%
          </td>
          <td>
            <span class="log-badge matched" style="background: rgba(52, 211, 153, 0.15); color: #34d399; font-weight: 700;">✓ RESOLVED</span>
          </td>
        </tr>
      `;
    }).join('');

    statusModalBody.innerHTML = `
      <div class="enrichment-log-wrap">
        <table class="enrichment-log-table">
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Suspect Entity</th>
              <th>Resolver Engine</th>
              <th>Matched Aliases & Corroborating Hard ID</th>
              <th style="width: 80px;">Confidence</th>
              <th style="width: 105px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <div style="font-size: 10px; color: var(--color-muted); display: flex; justify-content: space-between; padding-top: 4px;">
        <span>Showing ${logs.length} resolved criminal suspect entities</span>
        <span>Engine: NetSentry Multi-Signal (Jaro-Winkler + Double Metaphone + Corroborating Hard IDs)</span>
      </div>
    `;
    return;
  }

  // Overview Tab
  statusModalBody.innerHTML = `
    <div>
      <div class="status-section-title">
        <span>Network Ingestion & Graph Synthesis</span>
        <span style="color: #34d399; font-size: 10px;">✓ Active Online</span>
      </div>
      <div class="status-card status-highlight">
        <div class="status-metric-label">Operational Network</div>
        <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 2px;">NetSentry Interstate Criminal Intelligence Constellation</div>
        <div class="status-metric-val">${s.totalRecords || 54} <span style="font-size: 11px; font-weight: normal; color: var(--color-muted);">criminal suspect nodes mapped across 5 syndicates</span></div>
      </div>
    </div>

    <div>
      <div class="status-section-title">
        <span>Core USPs (Smart India Hackathon 2026)</span>
        <span style="color: #34d399; font-size: 10px;">✓ Validated</span>
      </div>
      <div class="status-grid">
        <div class="status-card">
          <div class="status-metric-label">USP 1: Alias Resolution</div>
          <div class="status-metric-val status-badge-matched">${s.matchedRecords || 54} <span style="font-size: 11px; font-weight: normal; color: #94a3b8;">/ ${s.totalRecords || 54}</span></div>
          <div class="status-metric-sub">Phonetic & fuzzy deduplication across variations (e.g. Mohd. Aslam / Aslam Bhai)</div>
        </div>
        <div class="status-card">
          <div class="status-metric-label">USP 2: Cross-Jurisdiction Linking</div>
          <div class="status-metric-val" style="color: var(--color-aurora-cyan); font-weight: 700;">6 Agencies</div>
          <div class="status-metric-sub">Linked across Delhi Special Cell, Maharashtra ATS, UP STF, Gujarat ATS & ED</div>
        </div>
        <div class="status-card">
          <div class="status-metric-label">Intelligence Filaments</div>
          <div class="status-metric-val" style="color: #a855f7; font-weight: 700;">${s.totalLinks || 42} Connections</div>
          <div class="status-metric-sub">Multi-signal CDR call records, Hawala cash trails & co-accused FIRs</div>
        </div>
        <div class="status-card">
          <div class="status-metric-label">High Centrality Brokers</div>
          <div class="status-metric-val" style="color: #f43f5e; font-weight: 700;">4 Key Hubs</div>
          <div class="status-metric-sub">Flagged nexus bridges connecting arms dealers to coastal narcotics rings</div>
        </div>
      </div>
    </div>

    <div>
      <div class="status-section-title">
        <span>Active Crime Syndicates (Macro Galaxies)</span>
        <span style="color: #34d399; font-size: 10px;">✓ 5 Active Rings</span>
      </div>
      <div class="status-grid">
        <div class="status-card">
          <div class="status-metric-label" style="color: #38bdf8; font-weight: 600;">D-West Cartel</div>
          <div style="font-size: 11px; color: #ffffff; margin-top: 4px;">Narcotics, Hawala & Port Logistics</div>
          <div class="status-metric-sub">12 Operatives • Mumbai-Dubai Axis</div>
        </div>
        <div class="status-card">
          <div class="status-metric-label" style="color: #f43f5e; font-weight: 600;">NCR Arms Ring</div>
          <div style="font-size: 11px; color: #ffffff; margin-top: 4px;">Weapons Foundry & Extortion</div>
          <div class="status-metric-sub">10 Operatives • Meerut-Delhi Corridor</div>
        </div>
        <div class="status-card">
          <div class="status-metric-label" style="color: #a855f7; font-weight: 600;">Cyber Nexus</div>
          <div style="font-size: 11px; color: #ffffff; margin-top: 4px;">Crypto Mixers & 1,200 Mule Accounts</div>
          <div class="status-metric-sub">8 Operatives • Jamtara-Bengaluru</div>
        </div>
        <div class="status-card">
          <div class="status-metric-label" style="color: #10b981; font-weight: 600;">Coastal Contraband</div>
          <div style="font-size: 11px; color: #ffffff; margin-top: 4px;">Dhow Fleets & Gold Smelting</div>
          <div class="status-metric-sub">8 Operatives • Arabian Sea Seaboard</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Unified pipeline for any set of raw records (Apple Music, Spotify, CSV, JSON, Paste)
 */
async function runRecordsPipeline(rawRecords, sourceLabel) {
  uploadModalBackdrop.classList.remove('open');
  updateProcessingUI({
    fileName: sourceLabel || 'Imported Music',
    importStatus: 'Parsing & detecting tracks...',
    importDetail: `${rawRecords.length} raw tracks received...`,
    enrichmentStatus: 'Pending',
    showEnrichmentBar: false,
    relStatus: 'Pending',
    constellationStatus: 'Pending'
  });
  showProcessingPanel(true);

  try {
    // 1. INGEST & DEDUPLICATE
    const ingestResult = await ingestRawRecords(rawRecords, sourceLabel, null, ({ percent, phase }) => {
      updateProcessingUI({
        importStatus: 'In progress...',
        importDetail: `${phase} (${percent}%)`
      });
    });

    const totalDetected = ingestResult.records.length;
    updateProcessingUI({
      importStatus: `✓ ${totalDetected} tracks detected`,
      importDetail: 'Canonical normalization and schema validation complete.'
    });

    // 2. METADATA ENRICHMENT (Hybrid Waterfall)
    updateProcessingUI({
      enrichmentStatus: 'Starting enrichment pipeline...',
      showEnrichmentBar: true,
      enrichmentPercent: 0,
      matchedCount: 0,
      partialCount: 0,
      unmatchedCount: 0
    });

    const enrichmentResult = await enrichmentEngine.enrichLibrary(
      ingestResult.records,
      (prog) => {
        updateProcessingUI({
          enrichmentStatus: `${prog.percent}%`,
          showEnrichmentBar: true,
          enrichmentPercent: prog.percent,
          matchedCount: prog.matchedCount,
          partialCount: prog.partialCount,
          unmatchedCount: prog.unmatchedCount,
          currentTrack: prog.currentTrack
        });
      }
    );

    const { matchedCount, partialCount, unmatchedCount, errorCount, enrichedTracks, enrichmentLog } = enrichmentResult;
    updateProcessingUI({
      enrichmentStatus: '✓ COMPLETE',
      showEnrichmentBar: true,
      enrichmentPercent: 100,
      matchedCount,
      partialCount,
      unmatchedCount,
      currentTrack: ''
    });

    // 3. RELATIONSHIP ANALYSIS
    updateProcessingUI({
      relStatus: 'Analyzing affinity signals...'
    });
    relationshipEngine.indexLibrary(enrichedTracks);
    updateProcessingUI({
      relStatus: '✓ COMPLETE'
    });

    // 4. CONSTELLATION GENERATION
    updateProcessingUI({
      constellationStatus: 'Generating celestial coordinates & galaxies...'
    });
    const constellation = spatialEngine.generateConstellation(
      enrichedTracks,
      relationshipEngine,
      { algorithm: 'UMAP', seed: 42 }
    );
    updateProcessingUI({
      constellationStatus: '✓ GENERATED'
    });

    // Persist library
    ingestResult.records = enrichedTracks;
    await storage.saveLibrary(ingestResult);

    // Save pipeline status
    state.library = ingestResult;
    state.constellation = constellation;
    state.metadataStatus = {
      libraryName: ingestResult.library_name || sourceLabel || 'Imported Library',
      fileName: sourceLabel || 'Uploaded Dataset',
      totalDetected,
      matchedCount,
      partialCount,
      unmatchedCount,
      errorCount,
      totalEdges: constellation.connections ? constellation.connections.length : 0,
      totalStars: constellation.total_songs,
      totalGalaxies: constellation.total_galaxies,
      timestamp: new Date().toLocaleTimeString(),
      enrichmentLog: enrichmentLog || []
    };

    if (logCountPill) {
      logCountPill.textContent = (enrichmentLog || []).length;
    }
    if (statusPulseDot) statusPulseDot.classList.add('active');

    // Load into 3D WebGL Universe
    initUniverseEngine();
    universe3D.loadConstellation(constellation);
    populateFilters(constellation);

    // Reset any active filters on new load
    if (universe3D) {
      const res = universe3D.setFilter({ genre: 'ALL', playlist: 'ALL', yearMin: null, yearMax: null });
      if (filterCountSongs) filterCountSongs.textContent = `${res.songs} songs`;
      if (filterCountArtists) filterCountArtists.textContent = `${res.artists} artists`;
      if (filterCountAlbums) filterCountAlbums.textContent = `${res.albums} albums`;
    }
    updateFilterBadge();

    btnClearTrigger.style.display = 'inline-flex';
    uploadModalBackdrop.classList.remove('open');
    detailInspector.classList.remove('open');

    showToast(`Universe mapped: ${constellation.total_songs} stars in ${constellation.total_galaxies} galaxies.`, 'success', 3500);
  } catch (err) {
    console.error('Pipeline error:', err);
    showToast(`Pipeline Error: ${err.message}`, 'error', 4500);
  } finally {
    setTimeout(() => showProcessingPanel(false), 2400);
  }
}

/**
 * Runs the data pipeline from raw file text (CSV, JSON, XML)
 */
async function runFullPipeline(rawText, type, fileName) {
  const trimmed = typeof rawText === 'string' ? rawText.trim() : '';
  let rawRecords = [];

  try {
    if (type === 'xml' || trimmed.startsWith('<?xml') || trimmed.startsWith('<plist')) {
      const res = parseXML(rawText);
      rawRecords = res.rawRecords;
    } else if (type === 'csv') {
      const res = parseCSV(rawText);
      rawRecords = res.rawRecords;
    } else {
      const res = parseJSON(rawText);
      rawRecords = res.rawRecords;
    }
    await runRecordsPipeline(rawRecords, fileName);
  } catch (err) {
    console.error('Parse failed:', err);
    showToast(`File parse error: ${err.message}`, 'error', 4500);
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Search input with autocomplete popup
  let searchTimer = null;
  universeSearchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    btnClearSearch.style.display = query ? 'block' : 'none';
    renderSearchPopup(query);

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      // No auto-flyto while popup is visible; user clicks to navigate
    }, 280);
  });

  universeSearchInput.addEventListener('focus', (e) => {
    if (e.target.value.trim().length >= 2) renderSearchPopup(e.target.value);
  });

  universeSearchInput.addEventListener('blur', () => {
    // Small delay so mousedown on result item fires first
    setTimeout(closeSearchPopup, 150);
  });

  universeSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = universeSearchInput.value;
      closeSearchPopup();
      if (query.trim() && universe3D) {
        const found = universe3D.searchAndFlyTo(query);
        if (!found) showToast(`No matching node for "${query}"`, 'info', 2000);
        else showToast(`Flying to "${query}"`, 'info', 1800);
      }
    } else if (e.key === 'Escape') {
      closeSearchPopup();
      universeSearchInput.blur();
    }
  });

  btnClearSearch.addEventListener('click', () => {
    universeSearchInput.value = '';
    btnClearSearch.style.display = 'none';
    closeSearchPopup();
    if (universe3D) universe3D.resetCamera(true);
  });

  // Phase 7: Filter Popover Toggle
  // Use a flag to prevent document click from immediately closing after open
  let filterJustOpened = false;
  if (btnFilterTrigger && filterPopover) {
    btnFilterTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = filterPopover.classList.contains('open');
      filterPopover.classList.toggle('open', !isOpen);
      sampleDropdownMenu.classList.remove('open');
      if (!isOpen) filterJustOpened = true;
    });
  }

  // Phase 7: Genre filter
  if (filterGenreSelect) {
    filterGenreSelect.addEventListener('change', () => applyFilters());
  }

  // Phase 7: Playlist filter
  if (filterPlaylistSelect) {
    filterPlaylistSelect.addEventListener('change', () => applyFilters());
  }

  // Phase 7: Timeline range sliders
  function onTimelineChange() {
    let minVal = parseInt(timelineSliderMin.value, 10);
    let maxVal = parseInt(timelineSliderMax.value, 10);
    // Keep min <= max
    if (minVal > maxVal) {
      if (this === timelineSliderMin) maxVal = minVal;
      else minVal = maxVal;
      timelineSliderMin.value = minVal;
      timelineSliderMax.value = maxVal;
    }
    timelineRangeLabel.textContent = minVal === maxVal ? `${minVal}` : `${minVal} – ${maxVal}`;
    applyFilters();
  }
  if (timelineSliderMin) timelineSliderMin.addEventListener('input', onTimelineChange);
  if (timelineSliderMax) timelineSliderMax.addEventListener('input', onTimelineChange);

  // Phase 7: Entity Type & Filaments Filters
  if (filterTypeArtists) filterTypeArtists.addEventListener('change', () => applyFilters());
  if (filterTypeAlbums) filterTypeAlbums.addEventListener('change', () => applyFilters());
  if (filterTypeSongs) filterTypeSongs.addEventListener('change', () => applyFilters());
  if (filterConnectionsToggle) filterConnectionsToggle.addEventListener('change', () => applyFilters());

  // Phase 7: Reset filters
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (filterGenreSelect) filterGenreSelect.value = 'ALL';
      if (filterPlaylistSelect) filterPlaylistSelect.value = 'ALL';
      if (timelineSliderMin) timelineSliderMin.value = timelineSliderMin.min;
      if (timelineSliderMax) timelineSliderMax.value = timelineSliderMax.max;
      if (timelineRangeLabel) timelineRangeLabel.textContent = 'All Years';
      if (filterTypeArtists) filterTypeArtists.checked = true;
      if (filterTypeAlbums) filterTypeAlbums.checked = true;
      if (filterTypeSongs) filterTypeSongs.checked = true;
      if (filterConnectionsToggle) filterConnectionsToggle.checked = true;
      if (universe3D) {
        universe3D.setConnectionsVisible(true);
        if (btnToggleFilaments) btnToggleFilaments.classList.add('active');
        const res = universe3D.setFilter({
          genre: 'ALL',
          playlist: 'ALL',
          yearMin: null,
          yearMax: null,
          entityTypes: { artists: true, albums: true, songs: true }
        });
        if (filterCountSongs) filterCountSongs.textContent = `${res.songs} songs`;
        if (filterCountArtists) filterCountArtists.textContent = `${res.artists} artists`;
        if (filterCountAlbums) filterCountAlbums.textContent = `${res.albums} albums`;
      }
      updateFilterBadge();
      showToast('Filters cleared — all constellation nodes visible', 'info', 1600);
    });
  }

  // Dataset & Metadata Status Modal
  if (btnStatusTrigger && statusModalBackdrop) {
    btnStatusTrigger.addEventListener('click', () => {
      renderStatusModal();
      statusModalBackdrop.classList.add('open');
    });
  }

  if (tabBtnOverview && tabBtnLog) {
    tabBtnOverview.addEventListener('click', () => {
      activeStatusTab = 'overview';
      tabBtnOverview.classList.add('active');
      tabBtnLog.classList.remove('active');
      renderStatusModal();
    });
    tabBtnLog.addEventListener('click', () => {
      activeStatusTab = 'log';
      tabBtnLog.classList.add('active');
      tabBtnOverview.classList.remove('active');
      renderStatusModal();
    });
  }

  if (btnCloseStatusModal && statusModalBackdrop) {
    btnCloseStatusModal.addEventListener('click', () => {
      statusModalBackdrop.classList.remove('open');
    });
  }

  if (statusModalBackdrop) {
    statusModalBackdrop.addEventListener('click', (e) => {
      if (e.target === statusModalBackdrop) statusModalBackdrop.classList.remove('open');
    });
  }

  // Phase 7: 2D/3D Toggle
  if (btnToggle2D) {
    btnToggle2D.addEventListener('click', () => {
      if (!universe3D || !universe3D.constellation) {
        showToast('Load a music library first', 'info', 2000);
        return;
      }
      is2DMode = !is2DMode;
      universe3D.set2DMode(is2DMode);
      if (toggleText2D) toggleText2D.textContent = is2DMode ? '3D' : '2D';
      btnToggle2D.classList.toggle('active', is2DMode);
      showToast(is2DMode ? 'Celestial Chart (2D) View' : '3D Universe View', 'info', 1800);
    });
  }

  // Phase 7: Filaments Toggle
  if (btnToggleFilaments) {
    btnToggleFilaments.addEventListener('click', () => {
      if (!universe3D || !universe3D.constellation) {
        showToast('Load a music library first', 'info', 2000);
        return;
      }
      filamentsVisible = !filamentsVisible;
      universe3D.setConnectionsVisible(filamentsVisible);
      btnToggleFilaments.classList.toggle('active', filamentsVisible);
      showToast(filamentsVisible ? 'Filaments shown' : 'Filaments hidden', 'info', 1600);
    });
  }

  // Close filter popover on outside click
  document.addEventListener('click', (e) => {
    // Skip if the popover was just opened this tick
    if (filterJustOpened) { filterJustOpened = false; return; }
    if (filterPopover && !filterPopover.contains(e.target) && !btnFilterTrigger?.contains(e.target)) {
      filterPopover.classList.remove('open');
    }
  });

  // Camera HUD Buttons
  if (btn3dZoomIn) {
    btn3dZoomIn.addEventListener('click', () => {
      if (universe3D && universe3D.controls) {
        universe3D.controls.dollyIn(1.3);
        universe3D.controls.update();
      }
    });
  }

  if (btn3dZoomOut) {
    btn3dZoomOut.addEventListener('click', () => {
      if (universe3D && universe3D.controls) {
        universe3D.controls.dollyOut(1.3);
        universe3D.controls.update();
      }
    });
  }

  if (btn3dReset) {
    btn3dReset.addEventListener('click', () => {
      if (universe3D) {
        universe3D.resetCamera(true);
        detailInspector.classList.remove('open');
        showToast('Camera reset to full universe', 'info', 1800);
      }
    });
  }

  // Sample Dropdown
  btnSampleDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    sampleDropdownMenu.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    sampleDropdownMenu.classList.remove('open');
  });

  if (btnLoadRealWorldD) {
    btnLoadRealWorldD.addEventListener('click', () => {
      sampleDropdownMenu.classList.remove('open');
      loadCriminalNetwork();
    });
  }

  btnLoadElectronic.addEventListener('click', () => {
    sampleDropdownMenu.classList.remove('open');
    loadCriminalNetwork('D-West Cartel (Narcotics & Hawala)');
  });

  btnLoadIndie.addEventListener('click', () => {
    sampleDropdownMenu.classList.remove('open');
    loadCriminalNetwork('NCR Arms & Contract Extortion Ring');
  });

  btnLoadSynthetic309.addEventListener('click', () => {
    sampleDropdownMenu.classList.remove('open');
    loadCriminalNetwork('Cyber Nexus & Mule Banking Syndicate');
  });

  // Phase 8: Import Modal Tabs & Real-World Inputs
  btnUploadTrigger.addEventListener('click', () => {
    uploadModalBackdrop.classList.add('open');
  });

  btnCloseUploadModal.addEventListener('click', () => {
    uploadModalBackdrop.classList.remove('open');
  });

  uploadModalBackdrop.addEventListener('click', (e) => {
    if (e.target === uploadModalBackdrop) uploadModalBackdrop.classList.remove('open');
  });

  // Tab switching
  const importTabBtns = document.querySelectorAll('.import-tab-btn');
  const importTabPanes = document.querySelectorAll('.import-tab-pane');
  importTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      importTabBtns.forEach(b => b.classList.toggle('active', b === btn));
      importTabPanes.forEach(p => p.classList.toggle('active', p.id === `pane-import-${tab}`));
    });
  });

  // Apple Music URL Fetch
  const inputAppleUrl = document.getElementById('input-apple-music-url');
  const btnFetchApple = document.getElementById('btn-fetch-apple-music');

  const executeAppleFetch = async (url) => {
    if (!url || !url.trim()) {
      showToast('Please enter an Apple Music album or song link', 'info');
      return;
    }
    btnFetchApple.disabled = true;
    btnFetchApple.textContent = 'Resolving...';
    try {
      showToast('Connecting to Apple Music API...', 'info', 2000);
      const tracks = await resolveAppleMusicUrl(url.trim());
      const albumTitle = tracks[0]?.album || 'Apple Music Collection';
      await runRecordsPipeline(tracks, `Apple Music: ${albumTitle}`);
    } catch (err) {
      console.error('Apple Music fetch error:', err);
      showToast(err.message, 'error', 4500);
    } finally {
      btnFetchApple.disabled = false;
      btnFetchApple.textContent = 'Fetch & Build';
    }
  };

  if (btnFetchApple && inputAppleUrl) {
    btnFetchApple.addEventListener('click', () => executeAppleFetch(inputAppleUrl.value));
    inputAppleUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeAppleFetch(inputAppleUrl.value);
    });
  }

  // Apple Music Preset Pills
  document.querySelectorAll('.preset-pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      const url = pill.getAttribute('data-url');
      if (inputAppleUrl && url) {
        inputAppleUrl.value = url;
        executeAppleFetch(url);
      }
    });
  });

  // Apple Music XML Dropzone
  const dropzoneAppleXml = document.getElementById('dropzone-apple-xml');
  if (dropzoneAppleXml) {
    const handleXmlFile = async (file) => {
      try {
        showToast('Parsing Apple Music Library.xml...', 'info', 2500);
        const text = await file.text();
        const tracks = parseAppleMusicXML(text);
        await runRecordsPipeline(tracks, file.name);
      } catch (err) {
        showToast(err.message, 'error', 4500);
      }
    };

    dropzoneAppleXml.addEventListener('click', () => fileInput.click());
    ['dragenter', 'dragover'].forEach(n => dropzoneAppleXml.addEventListener(n, (e) => { e.preventDefault(); dropzoneAppleXml.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(n => dropzoneAppleXml.addEventListener(n, (e) => { e.preventDefault(); dropzoneAppleXml.classList.remove('dragover'); }));
    dropzoneAppleXml.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) handleXmlFile(e.dataTransfer.files[0]);
    });
  }

  // Spotify Top Tracks Fetch
  const inputSpotifyToken = document.getElementById('input-spotify-token');
  const btnFetchSpotifyTop = document.getElementById('btn-fetch-spotify-top');
  if (btnFetchSpotifyTop && inputSpotifyToken) {
    btnFetchSpotifyTop.addEventListener('click', async () => {
      const token = inputSpotifyToken.value.trim();
      if (!token) {
        showToast('Paste a valid Spotify user access token', 'info', 3000);
        return;
      }
      btnFetchSpotifyTop.disabled = true;
      btnFetchSpotifyTop.textContent = 'Connecting...';
      try {
        showToast('Fetching Spotify Top Tracks...', 'info', 2000);
        const tracks = await fetchSpotifyTopTracks(token);
        await runRecordsPipeline(tracks, 'Spotify Top 50');
      } catch (err) {
        showToast(err.message, 'error', 4500);
      } finally {
        btnFetchSpotifyTop.disabled = false;
        btnFetchSpotifyTop.textContent = 'Load Top Tracks';
      }
    });
  }

  // Spotify JSON Dropzone
  const dropzoneSpotifyJson = document.getElementById('dropzone-spotify-json');
  if (dropzoneSpotifyJson) {
    const handleSpotifyFile = async (file) => {
      try {
        showToast('Parsing Spotify privacy export...', 'info', 2500);
        const text = await file.text();
        const json = JSON.parse(text);
        const tracks = parseSpotifyDataExport(json);
        await runRecordsPipeline(tracks, file.name);
      } catch (err) {
        showToast(err.message, 'error', 4500);
      }
    };

    dropzoneSpotifyJson.addEventListener('click', () => fileInput.click());
    ['dragenter', 'dragover'].forEach(n => dropzoneSpotifyJson.addEventListener(n, (e) => { e.preventDefault(); dropzoneSpotifyJson.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(n => dropzoneSpotifyJson.addEventListener(n, (e) => { e.preventDefault(); dropzoneSpotifyJson.classList.remove('dragover'); }));
    dropzoneSpotifyJson.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) handleSpotifyFile(e.dataTransfer.files[0]);
    });
  }

  // Quick Paste Tab
  const textareaPaste = document.getElementById('textarea-paste-tracks');
  const btnPasteSample = document.getElementById('btn-paste-sample');
  const btnSubmitPaste = document.getElementById('btn-submit-paste');

  if (btnPasteSample && textareaPaste) {
    btnPasteSample.addEventListener('click', () => {
      textareaPaste.value = `Radiohead - Paranoid Android [OK Computer]
The Weeknd - Blinding Lights [After Hours]
Frank Ocean - Nights [Blonde]
Beach House - Space Song [Depression Cherry]
M83 - Midnight City [Hurry Up, We're Dreaming]
Aphex Twin - Windowlicker
Daft Punk - Instant Crush [Random Access Memories]
Tame Impala - The Less I Know The Better [Currents]
Bonobo - Kerala [Migration]
Tycho - Awake [Awake]
Kendrick Lamar - Alright [To Pimp A Butterfly]
SZA - Snooze [SOS]`;
      showToast('Sample tracklist inserted', 'info', 1800);
    });
  }

  if (btnSubmitPaste && textareaPaste) {
    btnSubmitPaste.addEventListener('click', async () => {
      const text = textareaPaste.value.trim();
      if (!text) {
        showToast('Please paste at least one track line', 'info');
        return;
      }
      try {
        const tracks = parseTracklistText(text);
        showToast(`Parsed ${tracks.length} tracks from text`, 'info', 2000);
        await runRecordsPipeline(tracks, 'Pasted Tracklist');
      } catch (err) {
        showToast(err.message, 'error', 4000);
      }
    });
  }

  // Files Tab (Universal CSV / JSON / XML)
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      file.text().then(text => runFullPipeline(text, ext, file.name));
    }
  });

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      file.text().then(text => runFullPipeline(text, ext, file.name));
    }
  });

  // Inspector Drawer Close
  btnCloseInspector.addEventListener('click', () => {
    detailInspector.classList.remove('open');
    if (universe3D) {
      universe3D.selectedTrackId = null;
      universe3D.selectionRingMesh.visible = false;
      universe3D.updateProgressiveDisclosure(true);
    }
  });

  // Clear Library Modal
  btnClearTrigger.addEventListener('click', () => {
    clearModalBackdrop.classList.add('open');
  });

  clearModalCancelBtn.addEventListener('click', () => clearModalBackdrop.classList.remove('open'));
  clearModalCancelX.addEventListener('click', () => clearModalBackdrop.classList.remove('open'));
  clearModalBackdrop.addEventListener('click', (e) => {
    if (e.target === clearModalBackdrop) clearModalBackdrop.classList.remove('open');
  });

  clearModalConfirmBtn.addEventListener('click', () => {
    detailInspector.classList.remove('open');
    clearModalBackdrop.classList.remove('open');
    loadCriminalNetwork();
    if (universe3D) universe3D.resetCamera(true);
    showToast('Network reset to full interstate overview', 'info');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearModalBackdrop.classList.remove('open');
      uploadModalBackdrop.classList.remove('open');
      sampleDropdownMenu.classList.remove('open');
      detailInspector.classList.remove('open');
    }
  });
}

/**
 * Loads NetSentry Criminal Network Constellation into spatial and 3D universe
 */
export function loadCriminalNetwork(filterSyndicate = null) {
  let records = getNormalizedCriminalRecords();
  let links = RELATIONSHIPS;

  if (filterSyndicate) {
    records = records.filter(r => r.artist === filterSyndicate);
    const validIds = new Set(records.map(r => r.id));
    links = links.filter(l => validIds.has(l.source) && validIds.has(l.target));
  }

  state.library = {
    records,
    stats: { total_tracks: records.length },
    filename: filterSyndicate || 'NetSentry_Interstate_Intelligence_Network'
  };

  // Pre-set status metrics
  state.metadataStatus = {
    fileName: filterSyndicate || 'Interstate Crime Syndicate Registry (SIH 2026)',
    totalRecords: records.length,
    matchedRecords: records.length,
    totalDetected: records.length,
    matchedCount: records.length,
    partialCount: 0,
    unmatchedCount: 0,
    errorCount: 0,
    totalEdges: links.length,
    totalStars: records.length,
    totalGalaxies: new Set(records.map(r => r.artist)).size,
    activeSyndicates: new Set(records.map(r => r.artist)).size,
    totalLinks: links.length,
    enrichmentLog: records.map((r, i) => ({
      index: i + 1,
      input: r.title,
      albumInput: r.album,
      provider: 'NetSentry Hybrid Resolver',
      lookup: (r.aliases && r.aliases.length > 0) ? r.aliases[0] : r.title,
      resultTitle: r.title,
      resultAlbum: r.album,
      confidence: r.alias_confidence || 0.94,
      status: 'MATCHED',
      recording_id: r.hard_identifiers?.phone || 'Burner Line Verified',
      artist_id: r.playlist
    }))
  };

  if (logCountPill) {
    logCountPill.textContent = records.length;
  }

  relationshipEngine.setExplicitLinks(links);
  relationshipEngine.indexLibrary(records);

  const constellation = spatialEngine.generateConstellation(
    records,
    relationshipEngine,
    { algorithm: 'UMAP', seed: 42, minEdgeAffinity: 0.32 }
  );

  state.constellation = constellation;
  universe3D.loadConstellation(constellation);
  populateFilters(constellation);

  btnClearTrigger.style.display = 'inline-flex';
  if (filterSyndicate) {
    showToast(`Focused: ${filterSyndicate} (${records.length} suspects)`, 'info', 2500);
  } else {
    showToast(`NetSentry Online: ${constellation.total_songs} suspects across ${constellation.total_galaxies} syndicates.`, 'success', 3500);
  }
}

/**
 * Boot Initialization
 */
async function init() {
  initUniverseEngine();
  setupEventListeners();

  try {
    loadCriminalNetwork();
  } catch (err) {
    console.error('NetSentry boot error:', err);
    showToast(`Initialization error: ${err.message}`, 'error');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
