import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MusicBrainzProvider, getLookupCacheKey } from './musicbrainzProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const csvPath = path.join(__dirname, '../../sample-data/music_constellation_real_world_D.csv');
  const cacheOutPath = path.join(__dirname, 'preseeded_cache.json');

  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim());
  const tracks = [];
  const seen = new Set();

  for (let i = 1; i < lines.length; i++) {
    // Handle CSV quoting
    const line = lines[i];
    let parts = [];
    let inQuotes = false;
    let current = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    const title = parts[0]?.replace(/^"|"$/g, '').trim();
    const artist = parts[1]?.replace(/^"|"$/g, '').trim();
    const album = parts[2]?.replace(/^"|"$/g, '').trim();

    if (!title) continue;
    const key = ((artist || '') + '___' + (title || '') + '___' + (album || '')).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tracks.push({ title, artist, album });
    }
  }

  console.log(`Parsed ${tracks.length} unique tracks from CSV.`);

  // Load existing cache if any
  let cacheData = {};
  if (fs.existsSync(cacheOutPath)) {
    try {
      cacheData = JSON.parse(fs.readFileSync(cacheOutPath, 'utf8'));
      console.log(`Loaded ${Object.keys(cacheData).length} existing cached entries.`);
    } catch (e) {}
  }

  const mb = new MusicBrainzProvider();

  // Populate provider cache with existing
  for (const [k, v] of Object.entries(cacheData)) {
    mb.cache.set(k, v);
  }

  let newlyFetched = 0;
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const key = getLookupCacheKey(t.title, t.artist, t.album);

    if (cacheData[key]) {
      continue;
    }

    console.log(`[${i + 1}/${tracks.length}] Querying MusicBrainz for: "${t.title}" by "${t.artist}" (Album: "${t.album}")...`);
    try {
      const res = await mb.searchTrack(t);
      cacheData[key] = res;
      newlyFetched++;
      console.log(`  -> Result: status=${res.status}, conf=${res.confidence}, id=${res.recording_id || 'none'}`);

      // Save progress every 5 fetches
      if (newlyFetched % 5 === 0) {
        fs.writeFileSync(cacheOutPath, JSON.stringify(cacheData, null, 2), 'utf8');
      }
    } catch (err) {
      console.error(`  -> Error querying ${t.title}:`, err.message);
    }
  }

  fs.writeFileSync(cacheOutPath, JSON.stringify(cacheData, null, 2), 'utf8');
  console.log(`Finished! Total cache entries: ${Object.keys(cacheData).length}. Newly fetched: ${newlyFetched}.`);
}

main().catch(console.error);
