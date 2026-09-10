/**
 * NetSentry — Parsing & Deduplication Engine
 * Handles CSV, JSON, and raw intelligence manifests.
 * Implements RFC 4180 parsing, progress reporting, schema normalization, and deduplication.
 */

import {
  normalizeRawRecord,
  detectHeaderMapping,
  cleanText
} from './normalizer.js';

/**
 * Fast RFC 4180 compliant CSV parser
 * Handles quotes, commas inside quotes, quotes escaping (""), and newlines.
 */
export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('CSV text is empty or invalid.');
  }

  // Detect delimiter: comma, semicolon, tab
  const firstLine = csvText.split(/\r\n|\n/)[0] || '';
  let delimiter = ',';
  if (firstLine.split(';').length > firstLine.split(',').length) {
    delimiter = ';';
  } else if (firstLine.split('\t').length > firstLine.split(',').length) {
    delimiter = '\t';
  }

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let insideQuotes = false;
  let i = 0;
  const len = csvText.length;

  while (i < len) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentVal += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
      i++;
      continue;
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.some(val => val.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      // Skip \r\n pair
      if (char === '\r' && nextChar === '\n') {
        i += 2;
      } else {
        i++;
      }
      continue;
    } else {
      currentVal += char;
      i++;
    }
  }

  // Flush remaining value
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.some(val => val.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    throw new Error('CSV file contains no data rows.');
  }

  const headers = rows[0].map(h => cleanText(h));
  if (headers.length === 0 || !headers.some(h => h.length > 0)) {
    throw new Error('CSV header row is invalid or missing.');
  }

  const dataRows = rows.slice(1);
  const headerMap = detectHeaderMapping(headers);

  const rawRecords = [];
  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (h) {
        obj[h] = row[c] !== undefined ? row[c] : '';
      }
    }
    rawRecords.push(obj);
  }

  return { rawRecords, headers, headerMap };
}

/**
 * Robust JSON parser
 * Normalizes suspect record arrays, agency manifests, and intelligence containers.
 */
export function parseJSON(jsonText) {
  if (!jsonText || typeof jsonText !== 'string') {
    throw new Error('JSON input is empty or invalid.');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`JSON syntax error: ${err.message}`);
  }

  let rawList = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // Check common container properties
    const candidates = ['records', 'suspects', 'criminals', 'nodes', 'data', 'items', 'syndicates'];
    for (const key of candidates) {
      if (Array.isArray(parsed[key])) {
        rawList = parsed[key];
        break;
      }
    }
    if (rawList.length === 0) {
      // If it's a single record object
      if (parsed.title || parsed.suspect || parsed.name || parsed.artist || parsed.syndicate) {
        rawList = [parsed];
      } else {
        throw new Error('JSON structure did not contain an array of intelligence records.');
      }
    }
  }

  if (rawList.length === 0) {
    throw new Error('JSON dataset contains no suspect records.');
  }

  // Detect sample headers from first few records
  const sampleHeaders = new Set();
  rawList.slice(0, 10).forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(k => sampleHeaders.add(k));
    }
  });

  const headers = Array.from(sampleHeaders);
  const headerMap = detectHeaderMapping(headers);

  return { rawRecords: rawList, headers, headerMap };
}

/**
 * Parses raw text dossier manifests
 * Handles lines like:
 * - Suspect Name - Syndicate [Operational Cell]
 * - Name: Aslam Bhai | Syndicate: D-West Cartel | Cell: Logistics
 */
export function parseManifestText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Manifest text is empty.');
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

  if (lines.length === 0) {
    throw new Error('No valid records found in pasted manifest.');
  }

  const records = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/^(?:\[?\d+\]?[.\-\s]+)+/, '').trim();

    if (line.includes('|') || /name\s*:/i.test(line) || /suspect\s*:/i.test(line)) {
      const parts = line.split('|').map(p => p.trim());
      let syndicate = '';
      let title = '';
      let cell = 'Operational Cell';

      parts.forEach(p => {
        if (/^(syndicate|gang|cartel|artist)\s*:/i.test(p)) syndicate = p.replace(/^[a-z]+\s*:/i, '').trim();
        else if (/^(name|suspect|title|operative)\s*:/i.test(p)) title = p.replace(/^[a-z]+\s*:/i, '').trim();
        else if (/^(cell|module|faction|album)\s*:/i.test(p)) cell = p.replace(/^[a-z]+\s*:/i, '').trim();
      });

      if (title && syndicate) {
        records.push({ title, artist: syndicate, album: cell, playlist: 'Intelligence Import', source: 'Text Manifest' });
        continue;
      }
    }

    const sepMatch = line.match(/\s*[-–—]\s*/);
    if (sepMatch) {
      const idx = sepMatch.index;
      const sepLen = sepMatch[0].length;
      let part1 = line.slice(0, idx).trim();
      let part2 = line.slice(idx + sepLen).trim();

      let cell = 'Operational Cell';
      const bracketMatch = part2.match(/\[([^\]]+)\]|\(([^)]+)\)$/);
      if (bracketMatch) {
        cell = bracketMatch[1] || bracketMatch[2];
        part2 = part2.replace(bracketMatch[0], '').trim();
      }

      if (part1 && part2) {
        records.push({
          title: part1,
          artist: part2,
          album: cell,
          playlist: 'Intelligence Import',
          source: 'Text Manifest'
        });
        continue;
      }
    }

    records.push({
      title: line,
      artist: 'Unassigned Syndicate',
      album: 'General Cell',
      playlist: 'Intelligence Import',
      source: 'Text Manifest'
    });
  }

  return records;
}

/**
 * Normalizes, deduplicates, and aggregates any array of raw records
 * @param {Array<Object>} rawRecords - Raw track objects
 * @param {string} sourceName - Identifier for the source dataset
 * @param {Object} [customHeaderMap] - Optional pre-computed header map
 * @param {Function} [onProgress] - Callback for streaming progress
 */
export async function ingestRawRecords(
  rawRecords,
  sourceName = 'realworld-import',
  customHeaderMap = null,
  onProgress = () => {}
) {
  const total = rawRecords.length;
  if (total === 0) {
    throw new Error('No records provided for ingestion.');
  }

  const sampleHeaders = new Set();
  rawRecords.slice(0, 10).forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(k => sampleHeaders.add(k));
    }
  });
  const headerMap = customHeaderMap || detectHeaderMapping(Array.from(sampleHeaders));

  onProgress({ percent: 45, phase: 'Normalizing fields & validating schemas...', processed: 0, total });
  await new Promise(r => setTimeout(r, 40));

  const trackMap = new Map(); // id (fingerprint) -> track
  let duplicatesRemoved = 0;
  const reviewNeededList = [];

  const playlistSet = new Set();
  const artistSet = new Set();
  const albumSet = new Set();

  const chunkSize = Math.max(50, Math.floor(total / 10));

  for (let i = 0; i < total; i++) {
    const raw = rawRecords[i];
    const normalized = normalizeRawRecord(raw, sourceName, headerMap);

    // Check review flags
    if (normalized.needs_review) {
      reviewNeededList.push(normalized);
    }

    // Deduplication check
    const existing = trackMap.get(normalized.id);
    if (existing) {
      duplicatesRemoved++;
      // Merge playlist memberships
      if (normalized.playlists && normalized.playlists.length > 0) {
        normalized.playlists.forEach(pl => {
          if (!existing.playlists.includes(pl)) {
            existing.playlists.push(pl);
          }
        });
      }
      // Keep higher play count
      if (normalized.play_count !== null) {
        if (existing.play_count === null || normalized.play_count > existing.play_count) {
          existing.play_count = normalized.play_count;
        }
      }
      // Fill missing fields if available
      if (!existing.genre && normalized.genre) existing.genre = normalized.genre;
      if (!existing.release_date && normalized.release_date) existing.release_date = normalized.release_date;
      if (!existing.artwork_url && normalized.artwork_url) existing.artwork_url = normalized.artwork_url;
      if (!existing.preview_url && normalized.preview_url) existing.preview_url = normalized.preview_url;

      existing.duplicateCount = (existing.duplicateCount || 0) + 1;
    } else {
      normalized.duplicateCount = 0;
      trackMap.set(normalized.id, normalized);
    }

    // Track sets
    if (normalized.artist && normalized.artist !== 'Unknown Artist') {
      artistSet.add(normalized.artist);
    }
    if (normalized.album && normalized.album !== 'Unknown Album') {
      albumSet.add(normalized.album);
    }
    normalized.playlists.forEach(pl => playlistSet.add(pl));

    // Progress throttle
    if (i % chunkSize === 0 || i === total - 1) {
      const pct = Math.min(90, 45 + Math.round((i / total) * 45));
      onProgress({
        percent: pct,
        phase: `Deduplicating & indexing track ${i + 1} of ${total}...`,
        processed: i + 1,
        total
      });
      await new Promise(r => setTimeout(r, 5));
    }
  }

  const cleanRecords = Array.from(trackMap.values());

  onProgress({ percent: 100, phase: 'Import complete!', processed: total, total });
  await new Promise(r => setTimeout(r, 60));

  return {
    songsImported: cleanRecords.length,
    rawCount: total,
    uniqueArtists: artistSet.size,
    uniqueAlbums: albumSet.size,
    uniquePlaylists: playlistSet.size,
    duplicatesRemoved: duplicatesRemoved,
    tracksNeedingReview: reviewNeededList.length,
    records: cleanRecords,
    reviewRecords: reviewNeededList,
    playlists: Array.from(playlistSet).sort(),
    artists: Array.from(artistSet).sort()
  };
}

/**
 * Chunked ingestion & deduplication pipeline for uploaded file content
 */
export async function ingestNetworkData(
  rawContent,
  fileType, // 'csv' | 'json'
  sourceName = 'user-import',
  onProgress = () => {}
) {
  // Step 1: Parsing
  onProgress({ percent: 15, phase: 'Parsing raw data...', processed: 0, total: 0 });
  await new Promise(r => setTimeout(r, 40));

  const trimmed = typeof rawContent === 'string' ? rawContent.trim() : '';
  let parsedResult;

  if (fileType.toLowerCase() === 'csv') {
    parsedResult = parseCSV(rawContent);
  } else if (fileType.toLowerCase() === 'json') {
    parsedResult = parseJSON(rawContent);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Supported types: CSV, JSON.`);
  }

  const { rawRecords, headerMap } = parsedResult;
  return ingestRawRecords(rawRecords, sourceName, headerMap, onProgress);
}
