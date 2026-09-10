/**
 * Music Constellation — Spotify Integration (Phase 8)
 * Provides:
 * 1. Spotify GDPR Data Export Parser (YourLibrary.json & Streaming_History_Audio_*.json)
 * 2. Spotify Web API Client (Top Tracks & Playlists via User Token / PKCE)
 * 3. Smart Tracklist Text Parser (Artist - Title pasted lists)
 */

/**
 * Parses official Spotify GDPR / Privacy export files
 * Handles:
 * - YourLibrary.json (Saved tracks, albums, playlists)
 * - Streaming_History_Audio_*.json / StreamingHistory*.json (Listening history with play duration)
 * @param {Object|Array} rawData - Parsed JSON object or array from Spotify export
 * @returns {Array<Object>} Normalized raw track records
 */
export function parseSpotifyDataExport(rawData) {
  if (!rawData) {
    throw new Error('Spotify data export is empty.');
  }

  const tracks = [];

  // Case 1: YourLibrary.json format
  if (rawData.tracks && Array.isArray(rawData.tracks)) {
    rawData.tracks.forEach(item => {
      const title = item.track || item.name || item.trackName;
      const artist = item.artist || item.artistName;
      const album = item.album || item.albumName || 'Liked Songs';

      if (title && artist) {
        tracks.push({
          title,
          artist,
          album,
          playlist: 'Spotify Liked Songs',
          source: 'Spotify YourLibrary',
          artwork_url: null,
          preview_url: null
        });
      }
    });

    if (tracks.length > 0) return tracks;
  }

  // Case 2: Streaming History format (array of streams)
  const streamArray = Array.isArray(rawData) ? rawData : (rawData.streams || rawData.history || null);
  if (streamArray && streamArray.length > 0) {
    const playMap = new Map();

    streamArray.forEach(entry => {
      // Modern Spotify GDPR format
      const title = entry.master_metadata_track_name || entry.trackName || entry.track;
      const artist = entry.master_metadata_album_artist_name || entry.artistName || entry.artist;
      const album = entry.master_metadata_album_album_name || entry.albumName || 'Streaming History';
      const msPlayed = entry.ms_played || entry.msPlayed || 0;
      const ts = entry.ts || entry.endTime || null;

      // Filter out skips under 15 seconds
      if (!title || !artist || msPlayed < 15000) return;

      const key = `${artist.toLowerCase().trim()}___${title.toLowerCase().trim()}`;
      if (!playMap.has(key)) {
        playMap.set(key, {
          title,
          artist,
          album,
          playlist: 'Spotify Streaming History',
          play_count: 1,
          total_ms: msPlayed,
          last_played: ts,
          source: 'Spotify Streaming History'
        });
      } else {
        const existing = playMap.get(key);
        existing.play_count += 1;
        existing.total_ms += msPlayed;
        if (ts && (!existing.last_played || ts > existing.last_played)) {
          existing.last_played = ts;
        }
      }
    });

    for (const item of playMap.values()) {
      tracks.push({
        title: item.title,
        artist: item.artist,
        album: item.album,
        playlist: item.playlist,
        play_count: item.play_count,
        duration: Math.round(item.total_ms / (item.play_count * 1000)),
        date_added: item.last_played ? item.last_played.split('T')[0] : null,
        source: item.source
      });
    }

    if (tracks.length > 0) {
      // Sort by play count descending
      tracks.sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
      return tracks;
    }
  }

  throw new Error('Unrecognized Spotify export format. Please upload YourLibrary.json or StreamingHistory.json.');
}

/**
 * Fetches user Top Tracks from official Spotify Web API
 * @param {string} accessToken - Spotify Bearer token (with user-top-read scope)
 * @param {string} timeRange - 'short_term' | 'medium_term' | 'long_term'
 * @returns {Promise<Array<Object>>} Normalized raw track records
 */
export async function fetchSpotifyTopTracks(accessToken, timeRange = 'medium_term') {
  if (!accessToken) {
    throw new Error('Spotify access token is required.');
  }

  const cleanToken = accessToken.replace(/^Bearer\s+/i, '').trim();
  const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${encodeURIComponent(timeRange)}`;

  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/json'
    }
  });

  if (!resp.ok) {
    if (resp.status === 401) {
      throw new Error('Spotify access token has expired or is invalid. Please refresh your token.');
    }
    throw new Error(`Spotify Web API error: HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const items = data.items || [];

  if (items.length === 0) {
    throw new Error('No top tracks found for this Spotify account.');
  }

  return items.map(item => {
    const artworkUrl = item.album?.images?.[0]?.url || null;
    const releaseDate = item.album?.release_date || null;
    const artistNames = (item.artists || []).map(a => a.name).join(', ');

    return {
      title: item.name,
      artist: artistNames || 'Unknown Artist',
      album: item.album?.name || 'Top Tracks',
      playlist: 'Spotify Top 50',
      duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : null,
      release_date: releaseDate,
      artwork_url: artworkUrl,
      preview_url: item.preview_url || null,
      external_url: item.external_urls?.spotify || null,
      source: 'Spotify Top Tracks'
    };
  });
}

/**
 * Fetches playlist tracks from official Spotify Web API
 * @param {string} accessToken - Spotify Bearer token
 * @param {string} playlistId - Spotify playlist ID
 */
export async function fetchSpotifyPlaylist(accessToken, playlistId) {
  if (!accessToken || !playlistId) {
    throw new Error('Both Spotify access token and playlist ID are required.');
  }

  const cleanToken = accessToken.replace(/^Bearer\s+/i, '').trim();
  // Extract ID if full URL passed
  const idMatch = playlistId.match(/playlist\/([a-zA-Z0-9]+)/);
  const cleanId = idMatch ? idMatch[1] : playlistId.trim();

  const url = `https://api.spotify.com/v1/playlists/${encodeURIComponent(cleanId)}?fields=name,tracks.items(track(name,artists,album(name,images,release_date),duration_ms,preview_url,external_urls))`;

  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/json'
    }
  });

  if (!resp.ok) {
    throw new Error(`Spotify Playlist lookup error: HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const playlistName = data.name || 'Spotify Playlist';
  const trackEntries = data.tracks?.items || [];

  return trackEntries
    .filter(entry => entry.track && entry.track.name)
    .map(entry => {
      const item = entry.track;
      const artworkUrl = item.album?.images?.[0]?.url || null;
      const releaseDate = item.album?.release_date || null;
      const artistNames = (item.artists || []).map(a => a.name).join(', ');

      return {
        title: item.name,
        artist: artistNames || 'Unknown Artist',
        album: item.album?.name || playlistName,
        playlist: playlistName,
        duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : null,
        release_date: releaseDate,
        artwork_url: artworkUrl,
        preview_url: item.preview_url || null,
        external_url: item.external_urls?.spotify || null,
        source: 'Spotify Playlist'
      };
    });
}

/**
 * Smart Text Parser for pasted tracklists
 * Parses lines like:
 * - Radiohead - Paranoid Android
 * - 01. The Weeknd - Blinding Lights [After Hours]
 * - Beach House — Space Song
 * - Artist: Frank Ocean | Title: Nights | Album: Blonde
 * @param {string} rawText - Multi-line tracklist
 * @returns {Array<Object>} Normalized raw track records
 */
export function parseTracklistText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Tracklist text is empty.');
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

  if (lines.length === 0) {
    throw new Error('No valid track lines found in pasted text.');
  }

  const tracks = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Strip leading track numbers: "1.", "01 -", "[1]", "1 "
    line = line.replace(/^(?:\[?\d+\]?[.\-\s]+)+/, '').trim();

    // Check for structured format: "Artist: ... | Title: ... | Album: ..."
    if (line.includes('|') || /title\s*:/i.test(line)) {
      const parts = line.split('|').map(p => p.trim());
      let artist = '';
      let title = '';
      let album = 'Pasted Playlist';

      parts.forEach(p => {
        if (/^artist\s*:/i.test(p)) artist = p.replace(/^artist\s*:/i, '').trim();
        else if (/^title\s*:/i.test(p)) title = p.replace(/^title\s*:/i, '').trim();
        else if (/^track\s*:/i.test(p)) title = p.replace(/^track\s*:/i, '').trim();
        else if (/^album\s*:/i.test(p)) album = p.replace(/^album\s*:/i, '').trim();
      });

      if (title && artist) {
        tracks.push({ title, artist, album, playlist: 'Pasted Playlist', source: 'Text Paste' });
        continue;
      }
    }

    // Standard separator check: " - ", " – ", " — "
    const sepMatch = line.match(/\s*[-–—]\s*/);
    if (sepMatch) {
      const idx = sepMatch.index;
      const sepLen = sepMatch[0].length;
      let part1 = line.slice(0, idx).trim();
      let part2 = line.slice(idx + sepLen).trim();

      // Check if part2 contains album in brackets: "Song Title (Album)" or "Song [Album]"
      let album = 'Pasted Playlist';
      const albumBracket = part2.match(/\[([^\]]+)\]|\(([^)]+)\)$/);
      if (albumBracket) {
        const potentialAlbum = albumBracket[1] || albumBracket[2];
        if (potentialAlbum && !/(remix|feat|ft|live|version|edit)/i.test(potentialAlbum)) {
          album = potentialAlbum;
          part2 = part2.replace(albumBracket[0], '').trim();
        }
      }

      if (part1 && part2) {
        tracks.push({
          artist: part1,
          title: part2,
          album,
          playlist: 'Pasted Playlist',
          source: 'Text Paste'
        });
        continue;
      }
    }

    // Fallback: single phrase treated as Title
    tracks.push({
      title: line,
      artist: 'Unknown Artist',
      album: 'Pasted Playlist',
      playlist: 'Pasted Playlist',
      source: 'Text Paste'
    });
  }

  if (tracks.length === 0) {
    throw new Error('Could not extract valid tracks from the pasted text.');
  }

  return tracks;
}
