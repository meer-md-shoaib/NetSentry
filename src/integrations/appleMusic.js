/**
 * Music Constellation — Apple Music Integration (Phase 8)
 * Provides:
 * 1. Apple Music URL resolver via iTunes Lookup API (Album, Song, Collection links)
 * 2. Apple Music / iTunes Library.xml local parser for full library & playlist export
 */

/**
 * Extracts Apple Music ID from URL or raw ID string
 * Examples:
 * - https://music.apple.com/us/album/ok-computer/1097861387
 * - https://music.apple.com/us/album/paranoid-android/1097861387?i=1097861770
 * - 1097861387
 */
export function extractAppleMusicId(input) {
  if (!input) return null;
  const str = String(input).trim();

  // If already pure digits
  if (/^[0-9]+$/.test(str)) return str;

  // Check for ?i=12345 track query param
  const trackMatch = str.match(/[?&]i=([0-9]+)/i);
  if (trackMatch) return trackMatch[1];

  // Check for /album/name/12345 or /id12345
  const albumMatch = str.match(/(?:album\/[^/]+\/|id)([0-9]+)/i);
  if (albumMatch) return albumMatch[1];

  // Generic digits in path
  const generalMatch = str.match(/\/([0-9]{8,12})(?:[/?#]|$)/);
  if (generalMatch) return generalMatch[1];

  return null;
}

/**
 * Resolves an Apple Music Album / Track link via iTunes Lookup API
 * @param {string} urlOrId - Apple Music URL or iTunes ID
 * @returns {Promise<Array<Object>>} Normalized raw track records
 */
export async function resolveAppleMusicUrl(urlOrId) {
  const id = extractAppleMusicId(urlOrId);
  if (!id) {
    throw new Error('Could not extract a valid Apple Music album or song ID from the provided link.');
  }

  const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song&limit=200`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(lookupUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`Apple Music / iTunes lookup failed with HTTP ${resp.status}`);
    }

    const data = await resp.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`No tracks found on Apple Music for ID "${id}".`);
    }

    // Determine collection name from album wrapper if present
    const albumWrapper = data.results.find(r => r.wrapperType === 'collection') || data.results[0];
    const albumName = albumWrapper.collectionName || 'Apple Music Collection';

    // Extract songs
    const songItems = data.results.filter(r => r.wrapperType === 'track' || r.kind === 'song' || r.trackName);

    if (songItems.length === 0) {
      // If only album metadata returned, try query songs with collectionId
      if (albumWrapper.collectionId) {
        return resolveAppleMusicUrl(String(albumWrapper.collectionId));
      }
      throw new Error('No playable songs found for this Apple Music album.');
    }

    return songItems.map(item => {
      let artworkUrl = item.artworkUrl100 || null;
      if (artworkUrl) {
        artworkUrl = artworkUrl.replace('100x100bb', '600x600bb');
      }

      return {
        title: item.trackName || 'Untitled Track',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || albumName,
        playlist: albumName,
        release_date: item.releaseDate ? item.releaseDate.split('T')[0] : null,
        genre: item.primaryGenreName || 'Various',
        duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : null,
        artwork_url: artworkUrl,
        preview_url: item.previewUrl || null,
        source: 'Apple Music',
        external_url: item.trackViewUrl || null
      };
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Apple Music request timed out. Please check your network connection.');
    }
    throw err;
  }
}

/**
 * Parses Apple Music / iTunes Library.xml exported files
 * Compatible with macOS Music.app and Windows iTunes
 * @param {string} xmlText - Raw XML content
 * @returns {Array<Object>} Normalized raw track records
 */
export function parseAppleMusicXML(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') {
    throw new Error('Invalid Apple Music XML text.');
  }

  // Parse dictionary key/value pairs using regex or DOMParser
  const tracks = [];
  const playlistMap = new Map(); // Track ID -> Array of Playlist Names

  // Check if browser DOMParser is available
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      // Fallback to regex parsing if DOMParser failed
      return parseAppleMusicXMLRegex(xmlText);
    }

    // Extract Playlists
    const playlistsNodes = doc.querySelectorAll('dict > array > dict');
    playlistsNodes.forEach(plNode => {
      let plName = '';
      const items = plNode.children;
      for (let i = 0; i < items.length - 1; i++) {
        if (items[i].tagName === 'key' && items[i].textContent === 'Name') {
          plName = items[i + 1].textContent;
          break;
        }
      }

      if (plName && !['Library', 'Music', 'Downloaded'].includes(plName)) {
        const trackIdKeys = plNode.querySelectorAll('array > dict > integer');
        trackIdKeys.forEach(tIdNode => {
          const tid = tIdNode.textContent.trim();
          if (!playlistMap.has(tid)) playlistMap.set(tid, []);
          playlistMap.get(tid).push(plName);
        });
      }
    });

    // Extract Tracks
    const rootDict = doc.querySelector('plist > dict');
    if (!rootDict) return parseAppleMusicXMLRegex(xmlText);

    let tracksDict = null;
    const children = rootDict.children;
    for (let i = 0; i < children.length - 1; i++) {
      if (children[i].tagName === 'key' && children[i].textContent === 'Tracks') {
        tracksDict = children[i + 1];
        break;
      }
    }

    if (tracksDict) {
      const trackNodes = tracksDict.querySelectorAll(':scope > dict');
      trackNodes.forEach(tNode => {
        const trackObj = {};
        const kv = tNode.children;
        for (let j = 0; j < kv.length - 1; j += 2) {
          const key = kv[j].textContent;
          const val = kv[j + 1].textContent;
          trackObj[key] = val;
        }

        const trackId = trackObj['Track ID'];
        const plNames = playlistMap.get(trackId) || [];
        const playlist = plNames.length > 0 ? plNames[0] : 'Apple Music Library';

        if (trackObj['Name']) {
          tracks.push({
            title: trackObj['Name'],
            artist: trackObj['Artist'] || 'Unknown Artist',
            album: trackObj['Album'] || 'Unknown Album',
            playlist,
            genre: trackObj['Genre'] || null,
            duration: trackObj['Total Time'] ? Math.round(parseInt(trackObj['Total Time'], 10) / 1000) : null,
            play_count: trackObj['Play Count'] ? parseInt(trackObj['Play Count'], 10) : null,
            year: trackObj['Year'] ? parseInt(trackObj['Year'], 10) : null,
            date_added: trackObj['Date Added'] || null,
            source: 'Apple Music Library'
          });
        }
      });
    }

    if (tracks.length > 0) return tracks;
  }

  return parseAppleMusicXMLRegex(xmlText);
}

/**
 * Robust regex-based plist XML parser (works in Node & browser environments)
 */
function parseAppleMusicXMLRegex(xmlText) {
  const tracks = [];
  const trackRegex = /<key>(\d+)<\/key>\s*<dict>([\s\S]*?)<\/dict>/g;
  let match;

  while ((match = trackRegex.exec(xmlText)) !== null) {
    const dictContent = match[2];
    const getVal = (keyName) => {
      const kMatch = dictContent.match(new RegExp(`<key>${keyName}<\\/key>\\s*<(?:string|integer|date)>([^<]+)<\\/`));
      return kMatch ? kMatch[1].trim() : null;
    };

    const name = getVal('Name');
    if (name) {
      tracks.push({
        title: name,
        artist: getVal('Artist') || 'Unknown Artist',
        album: getVal('Album') || 'Unknown Album',
        playlist: 'Apple Music Library',
        genre: getVal('Genre') || null,
        duration: getVal('Total Time') ? Math.round(parseInt(getVal('Total Time'), 10) / 1000) : null,
        play_count: getVal('Play Count') ? parseInt(getVal('Play Count'), 10) : null,
        year: getVal('Year') ? parseInt(getVal('Year'), 10) : null,
        date_added: getVal('Date Added') || null,
        source: 'Apple Music Library'
      });
    }
  }

  if (tracks.length === 0) {
    throw new Error('No valid tracks found in Apple Music XML export.');
  }

  return tracks;
}
