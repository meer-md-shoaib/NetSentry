/**
 * Music Constellation — Wikipedia / Wikidata Provider (Phase 2)
 * Free, fast, open CORS. Provides artist biography summaries, descriptions, and artist thumbnail.
 */

import { MetadataProvider } from './provider.js';

export class WikipediaProvider extends MetadataProvider {
  constructor() {
    super('Wikipedia');
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary';
  }

  /**
   * Search artist summary / biography
   */
  async searchArtist(artistName) {
    if (!artistName || artistName === 'Unknown Artist') return null;

    // Normalize name for Wikipedia title matching
    const query = artistName.trim().replace(/\s+/g, '_');
    const url = `${this.baseUrl}/${encodeURIComponent(query)}`;

    try {
      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) {
        // Fallback: try adding " (band)" or " (musician)" if 404
        if (resp.status === 404) {
          const fallbackResp = await fetch(`${this.baseUrl}/${encodeURIComponent(query + '_(band)')}`);
          if (fallbackResp.ok) {
            const fbData = await fallbackResp.json();
            return this._formatResponse(fbData);
          }
        }
        return null;
      }

      const data = await resp.json();
      return this._formatResponse(data);
    } catch (e) {
      return null;
    }
  }

  _formatResponse(data) {
    if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      return null;
    }

    return {
      provider: this.name,
      description: data.description || null,
      biography_extract: data.extract || null,
      page_url: data.content_urls?.desktop?.page || null,
      artist_image: data.thumbnail?.source || null
    };
  }

  async searchTrack() {
    // Wikipedia primarily enriches artist-level context
    return null;
  }
}
