/**
 * Music Constellation — Metadata Enrichment Engine
 * Orchestrates multi-provider enrichment, rate limiting, caching, scoring, and progress reporting.
 * Implements a high-performance Hybrid Waterfall:
 * 1. Fast Apple iTunes Search API (50-150ms, 600x600 artwork, 30s audio previews, genres)
 * 2. Rate-limited MusicBrainz Fallback (<= 1 req/sec) when iTunes has no match
 * 3. Concurrent worker pool (5 workers) for sub-5s processing of entire playlists
 */

import { MusicBrainzProvider, getLookupCacheKey } from './musicbrainzProvider.js';
import { ITunesProvider } from './itunesProvider.js';
import { storage } from '../storage.js';

export class EnrichmentEngine {
  constructor() {
    this.providers = new Map();
    this.mb = new MusicBrainzProvider();
    this.itunes = new ITunesProvider();

    this.registerProvider('musicbrainz', this.mb);
    this.registerProvider('itunes', this.itunes);

    this.mode = 'hybrid'; // 'hybrid' | 'itunes' | 'musicbrainz'
    this.primaryProvider = this.itunes;
    this.enrichmentLog = [];
  }

  /**
   * Register a new metadata provider conforming to MetadataProvider interface
   */
  registerProvider(name, provider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  /**
   * Set operating mode or primary active provider ('hybrid', 'itunes', 'musicbrainz')
   */
  setMode(mode) {
    this.mode = mode.toLowerCase();
  }

  /**
   * Set primary active provider
   */
  setPrimaryProvider(name) {
    const p = this.providers.get(name.toLowerCase());
    if (p) this.primaryProvider = p;
  }

  /**
   * Retrieve current enrichment inspection log
   */
  getEnrichmentLog() {
    return this.enrichmentLog;
  }

  /**
   * Clear enrichment inspection log
   */
  clearEnrichmentLog() {
    this.enrichmentLog = [];
  }

  /**
   * Single track enrichment with Hybrid Waterfall
   */
  async enrichSingleTrack(track, cacheMap) {
    const cacheKey = getLookupCacheKey(track.title, track.artist, track.album);
    let result = cacheMap.get(cacheKey);
    let wasCached = false;

    if (result && (result.status === 'MATCHED' || result.status === 'PARTIAL')) {
      return { result, wasCached: true, cacheKey };
    }

    if (this.mode === 'musicbrainz') {
      try {
        result = await this.mb.searchTrack(track);
        await storage.saveEnrichmentCache(cacheKey, result);
        cacheMap.set(cacheKey, result);
        return { result, wasCached: false, cacheKey };
      } catch (err) {
        return {
          result: {
            status: 'ERROR',
            provider: 'MusicBrainz',
            confidence: 0,
            reason: err.message || 'MusicBrainz lookup failed',
            timestamp: new Date().toISOString()
          },
          wasCached: false,
          cacheKey
        };
      }
    }

    // Hybrid or iTunes Mode:
    // Step 1: Fast Lookup via iTunes (CDN-backed, <150ms)
    let itunesResult = null;
    try {
      itunesResult = await this.itunes.searchTrack(track);
      if (itunesResult && (itunesResult.status === 'MATCHED' || itunesResult.confidence >= 0.65)) {
        await storage.saveEnrichmentCache(cacheKey, itunesResult);
        cacheMap.set(cacheKey, itunesResult);
        return { result: itunesResult, wasCached: false, cacheKey };
      }
    } catch (err) {
      console.warn(`[Enrichment] iTunes lookup error for "${track.title}":`, err);
    }

    // If pure iTunes mode, return whatever iTunes produced
    if (this.mode === 'itunes') {
      const finalItunes = itunesResult || {
        status: 'UNMATCHED',
        provider: 'iTunes',
        confidence: 0,
        reason: 'No match found on iTunes',
        timestamp: new Date().toISOString()
      };
      await storage.saveEnrichmentCache(cacheKey, finalItunes);
      cacheMap.set(cacheKey, finalItunes);
      return { result: finalItunes, wasCached: false, cacheKey };
    }

    // Step 2: Fallback to MusicBrainz (rate-limited queue <= 1 req/sec)
    try {
      const mbResult = await this.mb.searchTrack(track);
      if (mbResult && (mbResult.status === 'MATCHED' || mbResult.status === 'PARTIAL')) {
        // If iTunes had artwork or preview but low title confidence, preserve media
        if (itunesResult?.artwork_url && !mbResult.artwork_url) {
          mbResult.artwork_url = itunesResult.artwork_url;
        }
        if (itunesResult?.preview_url && !mbResult.preview_url) {
          mbResult.preview_url = itunesResult.preview_url;
        }
        await storage.saveEnrichmentCache(cacheKey, mbResult);
        cacheMap.set(cacheKey, mbResult);
        return { result: mbResult, wasCached: false, cacheKey };
      }

      // If neither gave MATCHED, take best candidate or honest UNMATCHED
      const fallback = (itunesResult && itunesResult.status === 'PARTIAL')
        ? itunesResult
        : (mbResult || {
            status: 'UNMATCHED',
            provider: 'Hybrid',
            confidence: 0,
            reason: 'No match found on iTunes or MusicBrainz',
            timestamp: new Date().toISOString()
          });

      await storage.saveEnrichmentCache(cacheKey, fallback);
      cacheMap.set(cacheKey, fallback);
      return { result: fallback, wasCached: false, cacheKey };
    } catch (err) {
      const errResult = itunesResult || {
        status: 'ERROR',
        provider: 'Hybrid',
        confidence: 0,
        reason: err.message || 'Lookup failed',
        timestamp: new Date().toISOString()
      };
      return { result: errResult, wasCached: false, cacheKey };
    }
  }

  /**
   * Enrich an entire track library with concurrent workers and real-time streaming progress
   */
  async enrichLibrary(tracks, onProgress = () => {}) {
    if (!tracks || tracks.length === 0) {
      return {
        totalTracks: 0,
        matchedCount: 0,
        partialCount: 0,
        unmatchedCount: 0,
        errorCount: 0,
        enrichedTracks: [],
        enrichmentLog: []
      };
    }

    const total = tracks.length;
    let processed = 0;
    let matchedCount = 0;
    let partialCount = 0;
    let unmatchedCount = 0;
    let errorCount = 0;

    const enrichedTracks = new Array(total);
    this.enrichmentLog = [];

    // Pre-load enrichment cache from IndexedDB
    let cacheMap = new Map();
    try {
      cacheMap = await storage.loadAllEnrichmentCache();
    } catch (e) {
      console.warn('[Enrichment] Could not read IndexedDB cache, proceeding with memory cache:', e);
    }

    // Supplement with preseeded cache for instant 0ms hits on known tracks
    try {
      const resp = await fetch('./src/enrichment/preseeded_cache.json');
      if (resp.ok) {
        const preData = await resp.json();
        for (const [k, v] of Object.entries(preData)) {
          const existing = cacheMap.get(k);
          if (!existing || (existing.status !== 'MATCHED' && v.status === 'MATCHED')) {
            cacheMap.set(k, v);
            this.itunes.cache.set(k, v);
            this.mb.cache.set(k, v);
          }
        }
      }
    } catch (_) {}

    // Concurrency limit: 5 parallel workers for rapid pipeline processing
    const CONCURRENCY = this.mode === 'musicbrainz' ? 1 : 5;
    let cursor = 0;

    const worker = async () => {
      while (cursor < total) {
        const i = cursor++;
        const track = tracks[i];

        const { result, wasCached } = await this.enrichSingleTrack(track, cacheMap);

        // Record count by honest status
        if (result.status === 'MATCHED') {
          matchedCount++;
        } else if (result.status === 'PARTIAL') {
          partialCount++;
        } else if (result.status === 'ERROR') {
          errorCount++;
        } else {
          unmatchedCount++;
        }

        // Build structured log entry
        const logEntry = {
          index: i + 1,
          input: `${track.artist || 'Unknown Artist'} — ${track.title}`,
          albumInput: track.album || 'Single',
          provider: result.provider || (this.mode === 'hybrid' ? 'iTunes' : this.mode),
          lookup: `${track.title} [artist: ${track.artist || ''}]`,
          resultTitle: result.canonical_title ? `${result.canonical_artist} - ${result.canonical_title}` : 'No Match Found',
          resultAlbum: result.canonical_album || null,
          recording_id: result.recording_id || null,
          artist_id: result.artist_id || null,
          release_id: result.release_id || null,
          confidence: typeof result.confidence === 'number' ? result.confidence : 0,
          status: result.status || 'UNMATCHED',
          cached: wasCached,
          artwork_url: result.artwork_url || null,
          preview_url: result.preview_url || null,
          external_url: result.external_url || null,
          genre: result.genre || null,
          tags: result.tags || [],
          timestamp: new Date().toLocaleTimeString()
        };

        this.enrichmentLog.push(logEntry);

        // Merge enriched metadata into track copy
        const merged = {
          ...track,
          enrichment: {
            status: result.status || 'UNMATCHED',
            provider: result.provider || 'Hybrid',
            confidence: result.confidence || 0,
            recording_id: result.recording_id || null,
            artist_id: result.artist_id || null,
            release_id: result.release_id || null,
            disambiguation: result.disambiguation || null,
            release_date: result.release_date || null,
            artwork_url: result.artwork_url || null,
            preview_url: result.preview_url || null,
            genre: result.genre || null
          }
        };

        // Canonical enrichment overrides only if match succeeded
        if (result.status === 'MATCHED' || result.status === 'PARTIAL') {
          if (result.canonical_artist) merged.artist = result.canonical_artist;
          if (result.canonical_album && (!merged.album || merged.album === 'Unknown Album')) {
            merged.album = result.canonical_album;
          }
          if (result.canonical_title) merged.title = result.canonical_title;
          if (result.release_date && !merged.release_date) merged.release_date = result.release_date;
          if (result.year && !merged.year) merged.year = result.year;
          if (result.tags && result.tags.length > 0) {
            merged.tags = Array.from(new Set([...(merged.tags || []), ...result.tags]));
          }
          if (result.artwork_url && !merged.artwork_url) {
            merged.artwork_url = result.artwork_url;
          }
          if (result.preview_url && !merged.preview_url) {
            merged.preview_url = result.preview_url;
          }
          if (result.genre && (!merged.genre || merged.genre === 'Various' || merged.genre === 'Other')) {
            merged.genre = result.genre;
          }
        }

        enrichedTracks[i] = merged;

        processed++;
        const percent = Math.round((processed / total) * 100);

        onProgress({
          percent,
          processed,
          total,
          matchedCount,
          partialCount,
          unmatchedCount,
          errorCount,
          currentTrack: `${track.artist || 'Unknown'} — ${track.title}`,
          currentLog: logEntry
        });
      }
    };

    const workerCount = Math.min(CONCURRENCY, total);
    const pool = [];
    for (let w = 0; w < workerCount; w++) {
      pool.push(worker());
    }
    await Promise.all(pool);

    // Keep log sorted by track index
    this.enrichmentLog.sort((a, b) => a.index - b.index);

    return {
      totalTracks: total,
      matchedCount,
      partialCount,
      unmatchedCount,
      errorCount,
      enrichedTracks,
      enrichmentLog: this.enrichmentLog
    };
  }
}

export const enrichmentEngine = new EnrichmentEngine();
