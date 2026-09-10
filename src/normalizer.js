/**
 * NetSentry — Data Normalization Engine
 * Converts disparate intelligence records into standardized internal schemas.
 */

// Common header synonyms across CCTNS, FIR logs, and custom CSV/JSON
export const HEADER_ALIASES = {
  title: ['suspect_name', 'suspect', 'name', 'operative', 'accused', 'alias_target', 'title', 'track name', 'song'],
  artist: ['syndicate', 'crime_syndicate', 'gang', 'cartel', 'organization', 'ring', 'artist', 'creator'],
  album: ['operational_cell', 'cell', 'module', 'faction', 'hub', 'sub_unit', 'album'],
  playlist: ['jurisdiction', 'agency', 'police_station', 'investigating_agency', 'cctns_state', 'playlist', 'category'],
  release_date: ['fir_date', 'incident_date', 'registration_date', 'year', 'date', 'release date'],
  date_added: ['date added', 'date_added', 'added_at', 'created_at', 'import_date'],
  play_count: ['incident_count', 'case_count', 'play count', 'play_count'],
  duration: ['duration', 'duration_ms', 'time', 'length'],
  genre: ['crime_category', 'ipc_section', 'offense', 'crime_type', 'modus_operandi', 'genre', 'tag', 'tags']
};

/**
 * Standardize text: trim, remove stray quotes, collapse multiple spaces
 */
export function cleanText(str) {
  if (str === null || str === undefined) return '';
  let s = String(str).trim();
  // Remove wrapping quotes if present
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ');
  return s;
}

/**
 * Smart casing for track names / artists if all uppercase or lowercase
 */
export function smartCase(str) {
  const text = cleanText(str);
  if (!text) return '';
  // If entirely uppercase and longer than 3 chars, normalize to Title Case
  if (text.length > 3 && text === text.toUpperCase() && !text.includes('DJ') && !text.includes('IDM')) {
    return text
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return text;
}

/**
 * Convert any duration string or number into seconds
 * Supports mm:ss, hh:mm:ss, milliseconds (e.g. 210000), or raw seconds
 */
export function parseDurationToSeconds(val) {
  if (val === null || val === undefined || val === '') return null;
  
  if (typeof val === 'number') {
    // If greater than 30,000, it's likely milliseconds
    if (val > 30000) return Math.round(val / 1000);
    return Math.round(val);
  }

  const s = String(val).trim();
  if (!s) return null;

  // Numeric string check
  if (!isNaN(Number(s))) {
    const num = Number(s);
    if (num > 30000) return Math.round(num / 1000);
    return Math.round(num);
  }

  // Format mm:ss or hh:mm:ss
  if (s.includes(':')) {
    const parts = s.split(':').map(p => parseInt(p, 10));
    if (parts.some(isNaN)) return null;
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  return null;
}

/**
 * Format seconds into mm:ss
 */
export function formatSecondsToTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const pad = n => (n < 10 ? '0' + n : String(n));
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}:${pad(remMins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Generate unique internal deduplication key
 */
export function generateTrackFingerprint(artist, title, album) {
  const a = cleanText(artist).toLowerCase();
  const t = cleanText(title).toLowerCase();
  const al = cleanText(album).toLowerCase();
  return `${a}:::${t}:::${al}`;
}

/**
 * Normalizes a single raw record object into standard internal schema
 */
export function normalizeRawRecord(raw, source = 'file-upload', headerMap = null) {
  // If headerMap provided, extract fields accordingly
  const getField = (canonicalKey) => {
    if (headerMap && headerMap[canonicalKey]) {
      return raw[headerMap[canonicalKey]];
    }
    // Fallback: direct match or alias search
    if (raw[canonicalKey] !== undefined) return raw[canonicalKey];
    const aliases = HEADER_ALIASES[canonicalKey] || [];
    for (const key of Object.keys(raw)) {
      const lowerKey = key.trim().toLowerCase();
      if (aliases.includes(lowerKey)) {
        return raw[key];
      }
    }
    return undefined;
  };

  const rawTitle = getField('title');
  const rawArtist = getField('artist');
  const rawAlbum = getField('album');
  const rawPlaylist = getField('playlist');
  const rawReleaseDate = getField('release_date');
  const rawDateAdded = getField('date_added');
  const rawPlayCount = getField('play_count');
  const rawDuration = getField('duration');
  const rawGenre = getField('genre');

  const title = smartCase(rawTitle);
  const artist = smartCase(rawArtist);
  const album = smartCase(rawAlbum) || 'General Cell';

  // Playlist parsing: could be string or array
  let playlists = [];
  if (Array.isArray(rawPlaylist)) {
    playlists = rawPlaylist.map(p => cleanText(p)).filter(Boolean);
  } else if (rawPlaylist) {
    const pStr = cleanText(rawPlaylist);
    if (pStr) playlists = [pStr];
  }

  // Duration normalization
  const durationSec = parseDurationToSeconds(rawDuration);
  const formattedDuration = durationSec !== null ? formatSecondsToTime(durationSec) : null;

  // Incident count normalization
  let playCount = null;
  if (rawPlayCount !== undefined && rawPlayCount !== null && rawPlayCount !== '') {
    const p = parseInt(rawPlayCount, 10);
    if (!isNaN(p)) playCount = p;
  }

  // Review flags check
  const reviewReasons = [];
  if (!title) reviewReasons.push('Missing suspect name');
  if (!artist) reviewReasons.push('Missing syndicate classification');
  const needsReview = reviewReasons.length > 0;

  // Internal unique track ID
  const fingerprint = (artist || title)
    ? generateTrackFingerprint(artist, title, album)
    : `unidentified_${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: fingerprint,
    title: title || 'Unidentified Suspect',
    artist: artist || 'Unassigned Syndicate',
    album: album,
    playlists: playlists,
    source: source,
    release_date: cleanText(rawReleaseDate) || null,
    date_added: cleanText(rawDateAdded) || null,
    play_count: playCount,
    duration: durationSec,
    formatted_duration: formattedDuration,
    genre: smartCase(rawGenre) || null,
    artwork_url: (raw && raw.artwork_url) || null,
    is_synthetic: Boolean(raw && raw.is_synthetic),
    needs_review: needsReview,
    review_reasons: reviewReasons,
    raw_preview: {
      title: rawTitle,
      artist: rawArtist,
      album: rawAlbum
    }
  };
}

/**
 * Automatically map raw header keys to canonical schema fields
 */
export function detectHeaderMapping(headers) {
  const mapping = {};
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const header of headers) {
      const normalizedHeader = header.trim().toLowerCase();
      if (aliases.includes(normalizedHeader) && !mapping[canonical]) {
        mapping[canonical] = header;
        break;
      }
    }
  }
  return mapping;
}
