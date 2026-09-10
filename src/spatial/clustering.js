/**
 * NetSentry — Network Cluster Partitioning & Hierarchy Engine
 * Density-based cluster partitioning, automatic syndicate naming, and centroid calculations.
 */

const GALAXY_PALETTES = [
  { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.25)', name: 'Stellar Cyan' },
  { primary: '#818cf8', glow: 'rgba(129, 140, 248, 0.25)', name: 'Deep Nebula' },
  { primary: '#34d399', glow: 'rgba(52, 211, 153, 0.25)', name: 'Emerald Celestial' },
  { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', name: 'Solar Gold' },
  { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.25)', name: 'Cosmic Magenta' },
  { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)', name: 'Orion Violet' },
  { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)', name: 'Glacial Blue' }
];

export class GalaxyClusterer {
  /**
   * Partitions tracks into distinct galaxies based on distance matrix and 3D coordinates
   */
  clusterTracks(tracks, distMatrix, coordinates3D, distanceThreshold = 0.52) {
    const n = tracks.length;
    if (n === 0) return [];

    // Adjacency graph for connected components / density clustering
    const visited = new Uint8Array(n);
    const clusters = [];

    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;

      const clusterIndices = [];
      const queue = [i];
      visited[i] = 1;

      while (queue.length > 0) {
        const curr = queue.shift();
        clusterIndices.push(curr);

        for (let j = 0; j < n; j++) {
          if (!visited[j] && distMatrix[curr][j] <= distanceThreshold) {
            visited[j] = 1;
            queue.push(j);
          }
        }
      }

      clusters.push(clusterIndices);
    }

    // Merge singleton clusters if too fragmented
    const refinedClusters = [];
    const singletons = [];

    clusters.forEach(c => {
      if (c.length >= 2 || clusters.length <= 3) {
        refinedClusters.push(c);
      } else {
        singletons.push(...c);
      }
    });

    // Reassign singletons to closest cluster
    if (singletons.length > 0 && refinedClusters.length > 0) {
      singletons.forEach(sIdx => {
        let bestDist = Infinity;
        let bestClusterIdx = 0;

        refinedClusters.forEach((c, cIdx) => {
          c.forEach(mIdx => {
            const d = distMatrix[sIdx][mIdx];
            if (d < bestDist) {
              bestDist = d;
              bestClusterIdx = cIdx;
            }
          });
        });

        refinedClusters[bestClusterIdx].push(sIdx);
      });
    } else if (refinedClusters.length === 0) {
      refinedClusters.push(singletons);
    }

    // Build Galaxy Cluster Objects
    const usedNames = new Set();
    const galaxies = refinedClusters.map((indices, clusterIdx) => {
      const memberTracks = indices.map(idx => tracks[idx]);
      const palette = GALAXY_PALETTES[clusterIdx % GALAXY_PALETTES.length];

      // 1. Calculate 3D Centroid
      let sumX = 0, sumY = 0, sumZ = 0;
      indices.forEach(idx => {
        sumX += coordinates3D[idx][0];
        sumY += coordinates3D[idx][1];
        sumZ += coordinates3D[idx][2];
      });
      const centroid = [
        Math.round((sumX / indices.length) * 100) / 100,
        Math.round((sumY / indices.length) * 100) / 100,
        Math.round((sumZ / indices.length) * 100) / 100
      ];

      // 2. Calculate Radius
      let maxDistSq = 0;
      indices.forEach(idx => {
        const dx = coordinates3D[idx][0] - centroid[0];
        const dy = coordinates3D[idx][1] - centroid[1];
        const dz = coordinates3D[idx][2] - centroid[2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq > maxDistSq) maxDistSq = distSq;
      });
      const radius = Math.round(Math.sqrt(maxDistSq) * 100) / 100;

      // 3. Extract, Normalize & Prioritize Crime Category/Modus Operandi Tags
      const tagScores = new Map();
      const genericWords = new Set(['crime', 'case', 'fir', 'record', 'data', 'suspect']);

      memberTracks.forEach(t => {
        const cat = t.crime_category || t.genre;
        if (cat) {
          const parts = cat.split(/[\/,&|]+/);
          parts.forEach(p => {
            const norm = normalizeTag(p);
            if (norm && !genericWords.has(norm.toLowerCase())) {
              tagScores.set(norm, (tagScores.get(norm) || 0) + 5);
            }
          });
        }
        (t.tags || t.modus_operandi || []).forEach(tag => {
          const norm = normalizeTag(tag);
          if (norm && !genericWords.has(norm.toLowerCase())) {
            tagScores.set(norm, (tagScores.get(norm) || 0) + 3);
          }
        });
      });

      // 4. Unique Syndicates in Cluster
      const artistSet = new Set();
      memberTracks.forEach(t => {
        const syn = t.syndicate || t.artist;
        if (syn && syn !== 'Unknown Syndicate' && syn !== 'Unknown Artist' && syn !== 'Independent Operative') {
          artistSet.add(syn);
        }
      });
      const artistsList = Array.from(artistSet);

      // Sort tags by score
      const sortedCandidates = Array.from(tagScores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      const filteredTags = [];
      for (const tag of sortedCandidates) {
        const lower = tag.toLowerCase();
        const isRedundant = filteredTags.some(existing => {
          const exLower = existing.toLowerCase();
          return exLower.includes(lower) || lower.includes(exLower);
        });
        if (!isRedundant) {
          filteredTags.push(tag);
        }
        if (filteredTags.length >= 3) break;
      }

      // Generate purely data-driven criminal network cluster name
      let cleanGalaxyName = '';
      if (filteredTags.length >= 2) {
        cleanGalaxyName = `${filteredTags[0]} • ${filteredTags[1]}`;
      } else if (filteredTags.length === 1) {
        cleanGalaxyName = filteredTags[0];
      } else if (artistsList.length > 0) {
        cleanGalaxyName = `${artistsList[0]} Network`;
      } else {
        cleanGalaxyName = `Command Network ${clusterIdx + 1}`;
      }

      // Ensure unique cluster naming
      if (usedNames.has(cleanGalaxyName)) {
        cleanGalaxyName = `${cleanGalaxyName} ${clusterIdx + 1}`;
      }
      usedNames.add(cleanGalaxyName);

      const galaxyTheme = filteredTags.join(' & ') || cleanGalaxyName;

      // 5. Cohesive Narrative Description
      const description = generateGalaxyNarrative(galaxyTheme, filteredTags, artistsList, indices.length);

      return {
        id: `galaxy_${clusterIdx + 1}`,
        cluster_index: clusterIdx,
        name: cleanGalaxyName,
        theme: galaxyTheme,
        description: description,
        color: palette.primary,
        color_glow: palette.glow,
        total_songs: indices.length,
        centroid: centroid,
        radius: Math.max(10, radius),
        top_tags: filteredTags,
        artists: artistsList,
        track_ids: memberTracks.map(t => t.id)
      };
    });

    return galaxies;
  }
}

/**
 * Normalizes and formats a tag into proper Title Case and canonical form
 */
function normalizeTag(raw) {
  if (!raw) return '';
  const clean = raw.trim();
  if (clean.length < 2) return '';

  const canonicalMap = {
    'idm': 'IDM',
    'edm': 'EDM',
    'r&b': 'R&B',
    'post rock': 'Post-Rock',
    'post-rock': 'Post-Rock',
    'post punk': 'Post-Punk',
    'post-punk': 'Post-Punk',
    'dream pop': 'Dream Pop',
    'dreampop': 'Dream Pop',
    'synth pop': 'Synth-Pop',
    'synthpop': 'Synth-Pop',
    'synth-pop': 'Synth-Pop',
    'shoegaze': 'Shoegaze',
    'art rock': 'Art Rock',
    'indie rock': 'Indie Rock',
    'indie folk': 'Indie Folk',
    'indie pop': 'Indie Pop',
    'chamber pop': 'Chamber Pop',
    'psychedelic pop': 'Psychedelic Pop',
    'psychedelic rock': 'Psychedelic Rock',
    'neo-psychedelia': 'Neo-Psychedelia',
    'singer-songwriter': 'Singer-Songwriter',
    'downtempo': 'Downtempo',
    'ambient': 'Ambient',
    'chillwave': 'Chillwave',
    'lo-fi': 'Lo-Fi',
    'electronic': 'Electronic',
    'electronica': 'Electronica',
    'alternative': 'Alternative Rock',
    'rock': 'Rock',
    'pop': 'Pop'
  };

  const lower = clean.toLowerCase();
  if (canonicalMap[lower]) return canonicalMap[lower];

  return clean
    .split(/[\s-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generates an evocative, cohesive 1-2 sentence description of the galaxy cluster
 */
function generateGalaxyNarrative(theme, topTags, artists, songCount) {
  const artistList = artists.slice(0, 3);
  const artistStr = artistList.length === 1 
    ? artistList[0] 
    : artistList.length === 2 
      ? `${artistList[0]} and ${artistList[1]}` 
      : `${artistList[0]}, ${artistList[1]}, and ${artistList[2]}`;

  const text = (theme + ' ' + topTags.join(' ')).toLowerCase();

  if (text.includes('ambient') || text.includes('downtempo') || text.includes('chillwave')) {
    return `Expansive atmospheric textures and warm analogue synthesizers drifting over hypnotic downtempo rhythms, centered on ${artistStr}.`;
  }
  if (text.includes('art rock') || text.includes('post-punk') || text.includes('experimental')) {
    return `Intricate rhythmic counterpoint, harmonic tension, and art rock experimentation blending guitar craft with electronic subtlety, led by ${artistStr}.`;
  }
  if (text.includes('dream pop') || text.includes('shoegaze')) {
    return `Reverberant, celestial walls of sound drenched in shimmering guitar delays and ethereal vocal harmonies, anchored by ${artistStr}.`;
  }
  if (text.includes('folk') || text.includes('singer-songwriter') || text.includes('acoustic')) {
    return `Introspective lyricism, delicate fingerpicked motifs, and evocative storytelling with hushed dynamics, featuring ${artistStr}.`;
  }
  if (text.includes('psychedelic') || text.includes('synth-pop') || text.includes('synthpop') || text.includes('neo-psychedelia')) {
    return `Swirling analog polyphonies, phased guitar loops, and hypnotic basslines creating a retro-futuristic cosmic voyage, spearheaded by ${artistStr}.`;
  }
  if (text.includes('post-rock') || text.includes('chamber pop')) {
    return `Dynamic cinematic swells and rich orchestral textures balancing quiet introspection with dramatic melodic crescendos, featuring ${artistStr}.`;
  }
  if (text.includes('indie rock') || text.includes('post-punk revival')) {
    return `Driving rhythmic propulsion, sharp melodic guitar hooks, and raw urgent vocals capturing the kinetic energy of modern indie, led by ${artistStr}.`;
  }

  const tagsFormatted = topTags.slice(0, 2).join(' & ');
  return `A cohesive celestial soundscape exploring ${tagsFormatted || 'harmonic melodies'} across ${songCount} tracks, anchored by ${artistStr || 'featured artists'}.`;
}

export const galaxyClusterer = new GalaxyClusterer();
