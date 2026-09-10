/**
 * Music Constellation — Multi-Signal Similarity Calculators (Phase 3)
 * Implements Metadata, Playlist Co-occurrence, and Artist Relationship signals.
 */

// Known music collective, side-project, and collaborator networks
const KNOWN_ARTIST_AFFINITIES = [
  // Thom Yorke & Jonny Greenwood: Radiohead <-> The Smile <-> Atoms for Peace
  { artists: ['radiohead', 'the smile', 'atoms for peace', 'thom yorke'], score: 0.95 },
  // Dan Snaith: Caribou <-> Daphni <-> Manitoba
  { artists: ['caribou', 'daphni', 'manitoba'], score: 0.95 },
  // Ambient & IDM frequent collaborators and touring peers
  { artists: ['tycho', 'boards of canada', 'bonobo', 'jon hopkins', 'four tet', 'caribou', 'kiasmos'], score: 0.65 },
  // Dream Pop & Indie Rock peers
  { artists: ['beach house', 'slowdive', 'cocteau twins'], score: 0.75 },
  { artists: ['phoebe bridgers', 'boygenius', 'lucy dacus', 'julien baker', 'better oblivion community center'], score: 0.95 },
  { artists: ['arctic monkeys', 'the last shadow puppets', 'miles kane'], score: 0.90 },
  { artists: ['tame impala', 'pond', 'gum', 'kevin parker'], score: 0.85 }
];

/**
 * Split genre string into canonical tokens
 */
export function extractGenreTokens(genreStr) {
  if (!genreStr || typeof genreStr !== 'string') return [];
  return genreStr
    .toLowerCase()
    .split(/[\/,&|+\-]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

/**
 * Jaccard Index of two sets
 */
export function jaccardSimilarity(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0.0;
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0.0;
}

/**
 * Signal 1: Metadata Similarity [0, 1]
 * Compares genre tokens, community tags, and release era proximity.
 */
export function computeMetadataSimilarity(trackA, trackB) {
  // 1. Genre similarity
  const genresA = new Set(extractGenreTokens(trackA.genre));
  const genresB = new Set(extractGenreTokens(trackB.genre));
  const genreScore = jaccardSimilarity(genresA, genresB);

  // 2. Tag similarity
  const tagsA = new Set((trackA.tags || []).map(t => t.toLowerCase().trim()));
  const tagsB = new Set((trackB.tags || []).map(t => t.toLowerCase().trim()));
  const tagScore = jaccardSimilarity(tagsA, tagsB);

  // 3. Temporal Era Proximity
  let temporalScore = 0.5; // neutral fallback
  const yearA = trackA.release_date ? parseInt(trackA.release_date.substring(0, 4), 10) : null;
  const yearB = trackB.release_date ? parseInt(trackB.release_date.substring(0, 4), 10) : null;

  if (yearA && yearB && !isNaN(yearA) && !isNaN(yearB)) {
    const diff = Math.abs(yearA - yearB);
    temporalScore = Math.exp(-diff / 8.0); // Exponential decay with 8-year half-life
  }

  // Same album boost
  let albumScore = 0.0;
  if (trackA.album && trackB.album && trackA.album !== 'Unknown Album') {
    if (trackA.album.toLowerCase().trim() === trackB.album.toLowerCase().trim()) {
      albumScore = 1.0;
    }
  }

  // Composite metadata similarity
  const score = (0.40 * genreScore) + (0.35 * tagScore) + (0.15 * temporalScore) + (0.10 * albumScore);
  return Math.max(0.0, Math.min(1.0, score));
}

/**
 * Signal 3: Playlist Co-occurrence [0, 1]
 * Measures how frequently two songs co-occur in the user's playlists.
 */
export function computePlaylistSimilarity(trackA, trackB) {
  const playlistsA = new Set(trackA.playlists || []);
  const playlistsB = new Set(trackB.playlists || []);

  if (playlistsA.size === 0 || playlistsB.size === 0) return 0.0;

  let sharedCount = 0;
  playlistsA.forEach(pl => {
    if (playlistsB.has(pl)) sharedCount++;
  });

  if (sharedCount === 0) return 0.0;

  // Jaccard index
  const union = playlistsA.size + playlistsB.size - sharedCount;
  const jaccard = union > 0 ? sharedCount / union : 0.0;

  // Bonus for multiple co-curations
  const coCurationWeight = Math.min(1.0, 0.4 + (sharedCount * 0.3));
  return Math.min(1.0, Math.max(jaccard, coCurationWeight));
}

/**
 * Signal 4: Artist Relationship [0, 1]
 * Measures same-artist identity and side-project / collaborator affinities.
 */
export function computeArtistSimilarity(trackA, trackB) {
  const artistA = (trackA.artist || '').toLowerCase().trim();
  const artistB = (trackB.artist || '').toLowerCase().trim();

  if (!artistA || !artistB || artistA === 'unknown artist' || artistB === 'unknown artist') {
    return 0.0;
  }

  // Exact same artist
  if (artistA === artistB) {
    return 1.0;
  }

  // Check known affinities & side-projects
  for (const group of KNOWN_ARTIST_AFFINITIES) {
    if (group.artists.includes(artistA) && group.artists.includes(artistB)) {
      return group.score;
    }
  }

  // Check shared mentions in Wikipedia biography
  const bioA = (trackA.artist_biography || '').toLowerCase();
  const bioB = (trackB.artist_biography || '').toLowerCase();
  if (bioA.includes(artistB) || bioB.includes(artistA)) {
    return 0.70;
  }

  return 0.0;
}
