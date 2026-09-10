/**
 * Music Constellation — iTunes Search API Provider
 * Fast, free, no API key required, global CDN, and CORS enabled.
 * Provides 600x600 album artwork, canonical release date, primary genre, and 30s audio previews.
 * Features candidate scoring, normalized status (MATCHED/PARTIAL/UNMATCHED), and in-memory caching.
 */

import { MetadataProvider } from './provider.js';
import { normalizeText, getLookupCacheKey, stringSimilarity } from './musicbrainzProvider.js';

export class ITunesProvider extends MetadataProvider {
  constructor() {
    super('iTunes');
    this.baseUrl = 'https://itunes.apple.com/search';
    this.cache = new Map();
  }

  /**
   * Search track by title, artist, and album with candidate scoring
   * @param {Object} track - { title, artist, album, ... }
   * @returns {Promise<Object>} Normalized enrichment result
   */
  async searchTrack(track) {
    if (!track.title || track.title === 'Untitled Track' || track.title === 'Unknown Track') {
      return {
        status: 'UNMATCHED',
        provider: this.name,
        confidence: 0,
        reason: 'Missing or empty track title',
        timestamp: new Date().toISOString()
      };
    }

    const cacheKey = getLookupCacheKey(track.title, track.artist, track.album);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const artistQuery = (track.artist && track.artist !== 'Unknown Artist') ? track.artist : '';
    const cleanTitle = String(track.title).replace(/[\"]/g, '').trim();
    const searchTerm = `${artistQuery} ${cleanTitle}`.trim();
    const url = `${this.baseUrl}?term=${encodeURIComponent(searchTerm)}&entity=song&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    let result = null;

    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`iTunes API HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const items = data.results || [];

      if (items.length === 0) {
        result = {
          status: 'UNMATCHED',
          provider: this.name,
          confidence: 0,
          reason: 'No matching track found on iTunes',
          timestamp: new Date().toISOString()
        };
      } else {
        // Score candidates using Dice coefficient similarity
        let bestCandidate = items[0];
        let bestScore = -1;

        for (const item of items) {
          const simTitle = stringSimilarity(item.trackName, track.title);
          let simArtist = 1.0;
          if (artistQuery) {
            simArtist = stringSimilarity(item.artistName, track.artist);
          }

          let score = simTitle;
          if (artistQuery) {
            score = (simTitle * 0.60) + (simArtist * 0.40);
          }

          if (track.album && track.album !== 'Unknown Album' && track.album !== 'Single' && item.collectionName) {
            const simAlbum = stringSimilarity(item.collectionName, track.album);
            if (simAlbum > 0.8) {
              score = Math.min(1.0, score + 0.05); // slight bonus for matching album
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = item;
          }
        }

        let status = 'UNMATCHED';
        if (bestScore >= 0.70) {
          status = 'MATCHED';
        } else if (bestScore >= 0.45) {
          status = 'PARTIAL';
        }

        // Upscale artwork from 100x100 to 600x600
        let artworkUrl = bestCandidate.artworkUrl100 || null;
        if (artworkUrl) {
          artworkUrl = artworkUrl.replace('100x100bb', '600x600bb');
        }

        const releaseDate = bestCandidate.releaseDate ? bestCandidate.releaseDate.split('T')[0] : null;
        const parsedYear = releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : null;

        result = {
          status,
          provider: this.name,
          confidence: Math.round(bestScore * 100) / 100,
          recording_id: String(bestCandidate.trackId || ''),
          artist_id: String(bestCandidate.artistId || ''),
          release_id: String(bestCandidate.collectionId || ''),
          canonical_title: bestCandidate.trackName || track.title,
          canonical_artist: bestCandidate.artistName || track.artist,
          canonical_album: bestCandidate.collectionName || track.album,
          artwork_url: artworkUrl,
          preview_url: bestCandidate.previewUrl || null,
          genre: bestCandidate.primaryGenreName || null,
          tags: bestCandidate.primaryGenreName ? [bestCandidate.primaryGenreName] : [],
          release_date: releaseDate,
          year: (parsedYear && !isNaN(parsedYear)) ? parsedYear : null,
          duration_ms: bestCandidate.trackTimeMillis || null,
          external_url: bestCandidate.trackViewUrl || null,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      clearTimeout(timeoutId);
      result = {
        status: 'ERROR',
        provider: this.name,
        confidence: 0,
        reason: err.name === 'AbortError' ? 'iTunes request timed out' : (err.message || 'iTunes lookup failed'),
        timestamp: new Date().toISOString()
      };
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Search artist for canonical artist ID and genre
   */
  async searchArtist(artistName) {
    if (!artistName || artistName === 'Unknown Artist') return null;

    const url = `${this.baseUrl}?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!data.results || data.results.length === 0) return null;

      const artist = data.results[0];
      return {
        provider: this.name,
        artist_id: String(artist.artistId || ''),
        canonical_name: artist.artistName,
        genre: artist.primaryGenreName || null,
        external_url: artist.artistLinkUrl || null
      };
    } catch (e) {
      return null;
    }
  }
}
