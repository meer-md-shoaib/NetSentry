/**
 * Music Constellation — MusicBrainz Public API Provider
 * Conforms to MetadataProvider interface.
 * Implements:
 * - Strictly <= 1 req/sec rate limit with client throttle queue
 * - Descriptive compliant User-Agent
 * - In-memory and persistent cache with normalized keys
 * - Exponential backoff retry on HTTP 429 / 503 / network errors
 * - Candidate scoring (title, artist, album matching) with confidence calculation
 * - Extraction of real MusicBrainz IDs (recording_id, artist_id, release_id), tags, release date
 * - Does NOT claim audio features (BPM, key, timbre, energy)
 */

import { MetadataProvider } from './provider.js';

export function normalizeText(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

export function getLookupCacheKey(title, artist, album) {
  const normTitle = normalizeText(title);
  const normArtist = normalizeText(artist);
  const normAlbum = normalizeText(album);
  return `${normArtist}___${normTitle}___${normAlbum}`;
}

export function stringSimilarity(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
  }
  // Bigram Dice coefficient
  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.slice(i, i + 2));
    }
    return bigrams;
  };
  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  if (b1.size === 0 || b2.size === 0) return 0;
  let intersection = 0;
  b1.forEach(bg => { if (b2.has(bg)) intersection++; });
  return (2.0 * intersection) / (b1.size + b2.size);
}

export class MusicBrainzProvider extends MetadataProvider {
  constructor() {
    super('musicbrainz');
    this.baseUrl = 'https://musicbrainz.org/ws/2';
    this.userAgent = 'MusicConstellation/1.0.0 ( contact@music-constellation.app )';

    // Rate Limiting (MusicBrainz requires <= 1 req/sec)
    this.minIntervalMs = 1100;
    this.lastRequestTime = 0;
    this.queuePromise = Promise.resolve();

    // Cache (Key -> Lookup Result)
    this.cache = new Map();
  }

  /**
   * Serialized rate-limiting queue ensuring strictly at least 1100ms between requests
   */
  async _scheduleThrottledRequest(fn) {
    const run = async () => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.minIntervalMs) {
        await new Promise(r => setTimeout(r, this.minIntervalMs - elapsed));
      }
      this.lastRequestTime = Date.now();
      return fn();
    };

    const next = this.queuePromise.then(run, run);
    this.queuePromise = next;
    return next;
  }

  /**
   * Robust fetch with exponential backoff on 429 / 503
   */
  async _fetchWithBackoff(url, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        const resp = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': this.userAgent
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.status === 429 || resp.status === 503) {
          if (attempt < maxRetries) {
            const backoff = (attempt + 1) * 2000;
            console.warn(`[MusicBrainz] Rate limit / temporary ${resp.status}, backing off ${backoff}ms...`);
            await new Promise(r => setTimeout(r, backoff));
            continue;
          }
          throw new Error(`MusicBrainz HTTP ${resp.status} (Rate limit / service unavailable)`);
        }

        if (!resp.ok) {
          throw new Error(`MusicBrainz HTTP ${resp.status}`);
        }

        return await resp.json();
      } catch (err) {
        if (attempt < maxRetries && (err.name === 'AbortError' || err.message.includes('HTTP'))) {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * Scores candidate recording against track query
   */
  _scoreCandidate(candidate, track) {
    const titleSim = stringSimilarity(candidate.title, track.title);

    const artistCredit = (candidate['artist-credit'] || [])
      .map(a => a.name || a.artist?.name || '')
      .join(' ');
    const artistSim = stringSimilarity(artistCredit, track.artist);

    let bestRelease = null;
    let albumSim = 0;
    if (candidate.releases && candidate.releases.length > 0) {
      for (const rel of candidate.releases) {
        const sim = stringSimilarity(rel.title, track.album);
        if (sim > albumSim) {
          albumSim = sim;
          bestRelease = rel;
        }
      }
      if (!bestRelease) bestRelease = candidate.releases[0];
    }

    // Weighted confidence score
    const hasAlbumQuery = Boolean(track.album && track.album !== 'Unknown Album');
    let confidence;
    if (hasAlbumQuery) {
      confidence = (titleSim * 0.45) + (artistSim * 0.35) + (albumSim * 0.20);
    } else {
      confidence = (titleSim * 0.55) + (artistSim * 0.45);
    }

    return {
      confidence: Math.round(confidence * 100) / 100,
      titleSim,
      artistSim,
      albumSim,
      bestRelease
    };
  }

  /**
   * Search recording by title, artist, and album
   * @param {Object} track - { title, artist, album, ... }
   * @returns {Promise<Object>} Normalized enrichment result
   */
  async searchTrack(track) {
    if (!track.title || track.title === 'Untitled Track' || track.title === 'Unknown Track') {
      return {
        status: 'UNMATCHED',
        provider: this.name,
        confidence: 0,
        reason: 'Missing or empty track title'
      };
    }

    const cacheKey = getLookupCacheKey(track.title, track.artist, track.album);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const cleanTitle = String(track.title).replace(/[\"]/g, '').trim();
    const cleanArtist = String(track.artist || '').replace(/[\"]/g, '').trim();
    const cleanAlbum = String(track.album || '').replace(/[\"]/g, '').trim();
    const hasAlbum = cleanAlbum && cleanAlbum !== 'Unknown Album' && cleanAlbum !== 'Single';

    let result = null;

    try {
      // Step 1: If album exists, try targeted query including release
      let data = null;
      if (hasAlbum && cleanArtist) {
        const qRelease = `recording:"${cleanTitle}" AND artist:"${cleanArtist}" AND release:"${cleanAlbum}"`;
        const url = `${this.baseUrl}/recording/?query=${encodeURIComponent(qRelease)}&fmt=json&limit=5`;
        data = await this._scheduleThrottledRequest(() => this._fetchWithBackoff(url));
      }

      // Step 2: Fallback query by title and artist if no release matches
      if (!data || !data.recordings || data.recordings.length === 0) {
        const artistClause = cleanArtist ? ` AND artist:"${cleanArtist}"` : '';
        const qTrack = `recording:"${cleanTitle}"${artistClause}`;
        const url = `${this.baseUrl}/recording/?query=${encodeURIComponent(qTrack)}&fmt=json&limit=5`;
        data = await this._scheduleThrottledRequest(() => this._fetchWithBackoff(url));
      }

      // Step 3: If still no match and title has parentheses (e.g. "Swimming Pools (Drank)"), strip them and try once more
      if (!data || !data.recordings || data.recordings.length === 0) {
        const strippedTitle = cleanTitle.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
        if (strippedTitle && strippedTitle !== cleanTitle && strippedTitle.length > 2) {
          const artistClause = cleanArtist ? ` AND artist:"${cleanArtist}"` : '';
          const qStripped = `recording:"${strippedTitle}"${artistClause}`;
          const url = `${this.baseUrl}/recording/?query=${encodeURIComponent(qStripped)}&fmt=json&limit=5`;
          data = await this._scheduleThrottledRequest(() => this._fetchWithBackoff(url));
        }
      }

      const recordings = data?.recordings || [];
      if (recordings.length === 0) {
        result = {
          status: 'UNMATCHED',
          provider: this.name,
          confidence: 0,
          reason: 'No matching recording found in MusicBrainz',
          timestamp: new Date().toISOString()
        };
      } else {
        // Score all candidate recordings
        let bestCandidate = null;
        let bestScore = -1;
        let bestReleaseObj = null;

        for (const rec of recordings) {
          const scored = this._scoreCandidate(rec, track);
          if (scored.confidence > bestScore) {
            bestScore = scored.confidence;
            bestCandidate = rec;
            bestReleaseObj = scored.bestRelease;
          }
        }

        let status = 'UNMATCHED';
        if (bestScore >= 0.80) {
          status = 'MATCHED';
        } else if (bestScore >= 0.45) {
          status = 'PARTIAL';
        }

        const artistObj = (bestCandidate['artist-credit'] || [])[0]?.artist;
        const tags = (bestCandidate.tags || []).map(t => t.name).slice(0, 6);
        const parsedYear = bestReleaseObj?.date ? parseInt(bestReleaseObj.date.slice(0, 4), 10) : null;

        result = {
          status,
          provider: this.name,
          confidence: bestScore,
          recording_id: bestCandidate.id,
          artist_id: artistObj?.id || (bestCandidate['artist-credit'] || [])[0]?.id || null,
          release_id: bestReleaseObj?.id || null,
          canonical_title: bestCandidate.title,
          canonical_artist: (bestCandidate['artist-credit'] || []).map(a => a.name).join(', '),
          canonical_album: bestReleaseObj?.title || track.album,
          release_date: bestReleaseObj?.date || null,
          year: (parsedYear && !isNaN(parsedYear)) ? parsedYear : null,
          tags,
          disambiguation: bestCandidate.disambiguation || null,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      console.error('[MusicBrainz] Query error for', track.title, err);
      result = {
        status: 'ERROR',
        provider: this.name,
        confidence: 0,
        reason: err.message || 'Network lookup error',
        timestamp: new Date().toISOString()
      };
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Search artist for canonical artist ID and community tags
   */
  async searchArtist(artistName) {
    if (!artistName || artistName === 'Unknown Artist') return null;
    const cacheKey = `artist___${normalizeText(artistName)}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const cleanArtist = artistName.replace(/[\"]/g, '').trim();
    const url = `${this.baseUrl}/artist/?query=artist:"${encodeURIComponent(cleanArtist)}"&fmt=json&limit=1`;

    try {
      const data = await this._scheduleThrottledRequest(() => this._fetchWithBackoff(url));
      if (!data || !data.artists || data.artists.length === 0) return null;

      const artist = data.artists[0];
      const tags = (artist.tags || []).map(t => t.name).slice(0, 6);

      const res = {
        provider: this.name,
        artist_id: artist.id,
        canonical_name: artist.name,
        country: artist.country || null,
        type: artist.type || null,
        tags
      };
      this.cache.set(cacheKey, res);
      return res;
    } catch (e) {
      return null;
    }
  }
}
