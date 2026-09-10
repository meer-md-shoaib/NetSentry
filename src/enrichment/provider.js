/**
 * Music Constellation — Metadata Provider Interface (Phase 2)
 * Abstract provider definition to ensure decoupled, swappable metadata engines.
 */

export class MetadataProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Search external metadata for a track
   * @param {Object} track - Normalized track { title, artist, album }
   * @returns {Promise<Object|null>} Enriched track metadata
   */
  async searchTrack(track) {
    throw new Error(`searchTrack not implemented in ${this.name}`);
  }

  /**
   * Search external metadata for an artist
   * @param {string} artistName
   * @returns {Promise<Object|null>} Enriched artist metadata
   */
  async searchArtist(artistName) {
    throw new Error(`searchArtist not implemented in ${this.name}`);
  }
}
