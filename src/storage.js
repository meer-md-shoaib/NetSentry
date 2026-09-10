/**
 * Music Constellation — Storage & Persistence Layer (Phase 2)
 * High-capacity client-side persistence using IndexedDB with fallback to localStorage.
 * Stores normalized tracks, metadata, and metadata enrichment cache.
 */

const DB_NAME = 'MusicConstellationDB';
const DB_VERSION = 2;
const STORE_NAME = 'normalized_tracks';
const META_STORE = 'library_meta';
const CACHE_STORE = 'enrichment_cache';

class StorageManager {
  constructor() {
    this.db = null;
    this.isIndexedDBSupported = typeof indexedDB !== 'undefined';
  }

  async init() {
    if (!this.isIndexedDBSupported) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('artist', 'artist', { unique: false });
          store.createIndex('album', 'album', { unique: false });
          store.createIndex('needs_review', 'needs_review', { unique: false });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        resolve(null);
      };
    });
  }

  /**
   * Save the complete ingested library
   */
  async saveLibrary(ingestResult) {
    if (!this.db) await this.init();

    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORE_NAME, META_STORE], 'readwrite');
        const trackStore = tx.objectStore(STORE_NAME);
        const metaStore = tx.objectStore(META_STORE);

        // Clear previous tracks
        trackStore.clear();

        // Insert tracks
        ingestResult.records.forEach(track => {
          trackStore.put(track);
        });

        // Save metadata
        const metadata = {
          key: 'summary',
          songsImported: ingestResult.songsImported,
          rawCount: ingestResult.rawCount,
          uniqueArtists: ingestResult.uniqueArtists,
          uniqueAlbums: ingestResult.uniqueAlbums,
          uniquePlaylists: ingestResult.uniquePlaylists,
          duplicatesRemoved: ingestResult.duplicatesRemoved,
          tracksNeedingReview: ingestResult.tracksNeedingReview,
          playlists: ingestResult.playlists,
          artists: ingestResult.artists,
          enrichmentReport: ingestResult.enrichmentReport || null,
          lastUpdated: new Date().toISOString()
        };
        metaStore.put(metadata);

        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    } else {
      try {
        const safeRecords = ingestResult.records.slice(0, 1000);
        localStorage.setItem('mc_tracks', JSON.stringify(safeRecords));
        localStorage.setItem('mc_summary', JSON.stringify({
          ...ingestResult,
          records: undefined,
          reviewRecords: undefined
        }));
        return true;
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
        return false;
      }
    }
  }

  /**
   * Load saved library from storage
   */
  async loadLibrary() {
    if (!this.db) await this.init();

    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORE_NAME, META_STORE], 'readonly');
        const trackStore = tx.objectStore(STORE_NAME);
        const metaStore = tx.objectStore(META_STORE);

        const tracksReq = trackStore.getAll();
        const metaReq = metaStore.get('summary');

        let records = [];
        let summary = null;

        tracksReq.onsuccess = () => {
          records = tracksReq.result || [];
        };

        metaReq.onsuccess = () => {
          summary = metaReq.result || null;
        };

        tx.oncomplete = () => {
          if (records.length > 0 && summary) {
            resolve({
              ...summary,
              records,
              reviewRecords: records.filter(r => r.needs_review)
            });
          } else {
            resolve(null);
          }
        };

        tx.onerror = () => resolve(null);
      });
    } else {
      try {
        const metaRaw = localStorage.getItem('mc_summary');
        const tracksRaw = localStorage.getItem('mc_tracks');
        if (metaRaw && tracksRaw) {
          const summary = JSON.parse(metaRaw);
          const records = JSON.parse(tracksRaw);
          return {
            ...summary,
            records,
            reviewRecords: records.filter(r => r.needs_review)
          };
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Update single track
   */
  async updateTrack(updatedTrack) {
    if (!this.db) await this.init();

    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(updatedTrack);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    }
    return false;
  }

  /**
   * Cache enrichment item in IndexedDB
   */
  async saveEnrichmentCache(id, data) {
    if (!this.db) await this.init();
    if (!this.db) return false;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([CACHE_STORE], 'readwrite');
        const store = tx.objectStore(CACHE_STORE);
        store.put({ id, data, cached_at: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Load entire enrichment cache into memory Map
   */
  async loadAllEnrichmentCache() {
    if (!this.db) await this.init();
    const map = new Map();
    if (!this.db) return map;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([CACHE_STORE], 'readonly');
        const store = tx.objectStore(CACHE_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          const items = req.result || [];
          items.forEach(it => {
            if (it && it.id) map.set(it.id, it.data);
          });
          resolve(map);
        };
        req.onerror = () => resolve(map);
      } catch (e) {
        resolve(map);
      }
    });
  }

  /**
   * Completely clear stored library records and metadata
   */
  async clearLibrary() {
    if (!this.db) await this.init();

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction([STORE_NAME, META_STORE], 'readwrite');
          tx.objectStore(STORE_NAME).clear();
          tx.objectStore(META_STORE).clear();
          tx.oncomplete = () => {
            localStorage.removeItem('mc_tracks');
            localStorage.removeItem('mc_summary');
            resolve(true);
          };
          tx.onerror = () => {
            localStorage.removeItem('mc_tracks');
            localStorage.removeItem('mc_summary');
            resolve(false);
          };
        } catch (err) {
          localStorage.removeItem('mc_tracks');
          localStorage.removeItem('mc_summary');
          resolve(true);
        }
      });
    } else {
      localStorage.removeItem('mc_tracks');
      localStorage.removeItem('mc_summary');
      return true;
    }
  }

  /**
   * Export clean enriched JSON for downstream phases
   */
  exportToJSON(data, filename = 'music_constellation_library.json') {
    const exportPayload = {
      version: '2.0.0',
      phase: 2,
      exported_at: new Date().toISOString(),
      summary: {
        total_songs: data.records ? data.records.length : data.songsImported,
        unique_artists: data.uniqueArtists,
        unique_albums: data.uniqueAlbums,
        unique_playlists: data.uniquePlaylists,
        duplicates_removed: data.duplicatesRemoved,
        tracks_needing_review: data.tracksNeedingReview,
        enrichment_report: data.enrichmentReport || null
      },
      tracks: data.records || []
    };

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export generated Phase 4 spatial constellation JSON for Phase 5 WebGL engine
   */
  exportSpatialJSON(constellationData, filename = 'music_constellation_spatial_universe.json') {
    const jsonStr = JSON.stringify(constellationData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const storage = new StorageManager();

