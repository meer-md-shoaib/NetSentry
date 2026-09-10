/**
 * Music Constellation — Spatial Constellation Engine (Phase 4)
 * Orchestrates distance matrix, 3D coordinate reduction, cluster hierarchy, and JSON export.
 */

import { computeUMAP3D, computeClassicalMDS } from './reduction.js';
import { galaxyClusterer } from './clustering.js';

export class SpatialEngine {
  constructor() {
    this.currentConstellation = null;
  }

  /**
   * Generates complete 3D spatial constellation from tracks and relationship engine
   */
  generateConstellation(tracks, relationshipEngine, options = {}) {
    const {
      algorithm = 'UMAP',
      seed = 42,
      minEdgeAffinity = 0.38,
      clusterDistanceThreshold = 0.52
    } = options;

    const n = tracks.length;
    if (n === 0) return null;

    // 1. Build Distance Matrix from Phase 3 Relationship Engine
    // Distance = 1.0 - Similarity
    const distMatrix = [];
    for (let i = 0; i < n; i++) {
      const row = new Float64Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) {
          row[j] = 0;
        } else {
          const rel = relationshipEngine.computePairwiseRelationship(tracks[i], tracks[j]);
          row[j] = Math.max(0.0, 1.0 - rel.totalScore);
        }
      }
      distMatrix.push(row);
    }

    // 2. 3D Dimensionality Reduction
    let coordinates3D;
    if (algorithm.toUpperCase() === 'MDS') {
      coordinates3D = computeClassicalMDS(distMatrix, 3);
    } else {
      coordinates3D = computeUMAP3D(distMatrix, { seed });
    }

    // 3. Density-based Galaxy Clustering
    const galaxies = galaxyClusterer.clusterTracks(tracks, distMatrix, coordinates3D, clusterDistanceThreshold);

    // 4. Inter-Cluster Spatial Separation & Repulsion
    // Ensures spacious voids and prevents clusters from overlapping in 3D space
    if (galaxies.length > 1) {
      const minClusterDistance = 140;
      const expansionFactor = 2.4;

      let gcx = 0, gcy = 0, gcz = 0;
      galaxies.forEach(g => {
        gcx += g.centroid[0];
        gcy += g.centroid[1];
        gcz += g.centroid[2];
      });
      gcx /= galaxies.length;
      gcy /= galaxies.length;
      gcz /= galaxies.length;

      // Radial expansion from global center
      const newCentroids = galaxies.map(g => {
        const dx = g.centroid[0] - gcx;
        const dy = g.centroid[1] - gcy;
        const dz = g.centroid[2] - gcz;
        const dist = Math.hypot(dx, dy, dz) || 1;
        const scale = Math.max(expansionFactor, 120 / dist);
        return [
          gcx + dx * scale,
          gcy + dy * scale,
          gcz + dz * scale
        ];
      });

      // Relaxation pass: pairwise repulsion if any two galaxies are still too close
      for (let iter = 0; iter < 6; iter++) {
        for (let i = 0; i < galaxies.length; i++) {
          for (let j = i + 1; j < galaxies.length; j++) {
            const dx = newCentroids[j][0] - newCentroids[i][0];
            const dy = newCentroids[j][1] - newCentroids[i][1];
            const dz = newCentroids[j][2] - newCentroids[i][2];
            const dist = Math.hypot(dx, dy, dz) || 0.1;
            const requiredDist = Math.max(minClusterDistance, (galaxies[i].radius + galaxies[j].radius) * 1.3);

            if (dist < requiredDist) {
              const push = (requiredDist - dist) * 0.5;
              const nx = dx / dist;
              const ny = dy / dist;
              const nz = dz / dist;
              newCentroids[i][0] -= nx * push;
              newCentroids[i][1] -= ny * push;
              newCentroids[i][2] -= nz * push;
              newCentroids[j][0] += nx * push;
              newCentroids[j][1] += ny * push;
              newCentroids[j][2] += nz * push;
            }
          }
        }
      }

      // Displace tracks relative to their new galaxy centroid
      const trackIdToIndex = new Map();
      tracks.forEach((t, i) => trackIdToIndex.set(t.id, i));

      galaxies.forEach((g, gIdx) => {
        const oldC = g.centroid;
        const newC = newCentroids[gIdx];
        const shiftX = newC[0] - oldC[0];
        const shiftY = newC[1] - oldC[1];
        const shiftZ = newC[2] - oldC[2];

        g.centroid = [
          Math.round(newC[0] * 100) / 100,
          Math.round(newC[1] * 100) / 100,
          Math.round(newC[2] * 100) / 100
        ];

        g.track_ids.forEach(tid => {
          const tIdx = trackIdToIndex.get(tid);
          if (tIdx !== undefined) {
            coordinates3D[tIdx][0] += shiftX;
            coordinates3D[tIdx][1] += shiftY;
            coordinates3D[tIdx][2] += shiftZ;
          }
        });
      });
    }

    // Map track ID -> Galaxy mapping
    const trackToGalaxyMap = new Map();
    galaxies.forEach(galaxy => {
      galaxy.track_ids.forEach(id => {
        trackToGalaxyMap.set(id, galaxy);
      });
    });

    // 5. Construct Spatial Tracks Array
    const spatialTracks = tracks.map((track, i) => {
      const galaxy = trackToGalaxyMap.get(track.id) || galaxies[0];
      const coords = coordinates3D[i] || [0, 0, 0];
      const albumName = track.album || 'Unknown Album';
      const albumKey = `${track.artist}___${albumName}`.toLowerCase();
      const parsedYear = track.release_date ? parseInt(String(track.release_date).slice(0, 4), 10) : null;

      return {
        ...track,
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: albumName,
        album_key: albumKey,
        genre: track.genre || 'Various',
        playlist: track.playlist || 'Library',
        release_date: track.release_date || (track.enrichment?.release_date) || null,
        year: (parsedYear && !isNaN(parsedYear)) ? parsedYear : (track.enrichment?.release_date ? parseInt(track.enrichment.release_date.slice(0, 4), 10) : null),
        artwork_url: track.artwork_url,
        preview_url: track.preview_url,
        enrichment: track.enrichment || null,
        x: coords[0],
        y: coords[1],
        z: coords[2],
        galaxy_id: galaxy.id,
        galaxy_name: galaxy.name,
        galaxy_color: galaxy.color
      };
    });

    // 6. Compute Album Spatial Centroids & Systems
    const albumGroups = new Map();
    spatialTracks.forEach(st => {
      const key = st.album_key;
      if (!albumGroups.has(key)) albumGroups.set(key, []);
      albumGroups.get(key).push(st);
    });

    const spatialAlbums = [];
    let albumIdx = 1;
    albumGroups.forEach((arr, key) => {
      let sumX = 0, sumY = 0, sumZ = 0;
      arr.forEach(t => {
        sumX += t.x;
        sumY += t.y;
        sumZ += t.z;
      });
      const cx = Math.round((sumX / arr.length) * 100) / 100;
      const cy = Math.round((sumY / arr.length) * 100) / 100;
      const cz = Math.round((sumZ / arr.length) * 100) / 100;

      let maxDist = 0;
      arr.forEach(t => {
        const d = Math.hypot(t.x - cx, t.y - cy, t.z - cz);
        if (d > maxDist) maxDist = d;
      });

      const albumId = `alb-${albumIdx++}`;
      arr.forEach(t => {
        t.album_id = albumId;
      });

      spatialAlbums.push({
        id: albumId,
        album: arr[0].album,
        artist: arr[0].artist,
        artwork_url: arr[0].artwork_url,
        galaxy_id: arr[0].galaxy_id,
        galaxy_color: arr[0].galaxy_color,
        total_tracks: arr.length,
        track_ids: arr.map(t => t.id),
        centroid: [cx, cy, cz],
        radius: Math.max(3.5, Math.round((maxDist + 2.5) * 100) / 100)
      });
    });

    // 7. Compute Artist Spatial Centroids
    const artistGroups = new Map();
    spatialTracks.forEach(st => {
      const a = st.artist;
      if (!artistGroups.has(a)) artistGroups.set(a, []);
      artistGroups.get(a).push(st);
    });

    const spatialArtists = [];
    artistGroups.forEach((arr, artistName) => {
      let sumX = 0, sumY = 0, sumZ = 0;
      arr.forEach(t => {
        sumX += t.x;
        sumY += t.y;
        sumZ += t.z;
      });
      spatialArtists.push({
        artist: artistName,
        total_songs: arr.length,
        galaxy_id: arr[0].galaxy_id,
        galaxy_color: arr[0].galaxy_color,
        centroid: [
          Math.round((sumX / arr.length) * 100) / 100,
          Math.round((sumY / arr.length) * 100) / 100,
          Math.round((sumZ / arr.length) * 100) / 100
        ]
      });
    });

    // 8. Compute Constellation Connection Edges
    const connections = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = distMatrix[i][j];
        const similarity = 1.0 - dist;

        if (similarity >= minEdgeAffinity) {
          const rel = relationshipEngine.computePairwiseRelationship(tracks[i], tracks[j]);
          connections.push({
            source: tracks[i].id,
            target: tracks[j].id,
            weight: Math.round(similarity * 100) / 100,
            explanation: rel.explanation
          });
        }
      }
    }

    // 9. Compute Filter Metadata (Genres, Playlists, Temporal Bounds)
    const genresSet = new Set();
    const playlistsSet = new Set();
    let yearMin = 9999;
    let yearMax = 0;

    spatialTracks.forEach(t => {
      if (t.genre) genresSet.add(t.genre);
      if (t.playlist) playlistsSet.add(t.playlist);
      if (t.year && !isNaN(t.year)) {
        if (t.year < yearMin) yearMin = t.year;
        if (t.year > yearMax) yearMax = t.year;
      }
    });

    const filterMetadata = {
      genresList: Array.from(genresSet).sort(),
      playlistsList: Array.from(playlistsSet).sort(),
      yearMin: yearMin <= yearMax ? yearMin : 1970,
      yearMax: yearMax >= yearMin ? yearMax : new Date().getFullYear()
    };

    // Assemble Hierarchy Object
    this.currentConstellation = {
      universe_id: `universe_${Date.now()}`,
      phase: 7,
      generated_at: new Date().toISOString(),
      algorithm: algorithm,
      reproducible_seed: seed,
      total_songs: n,
      total_galaxies: galaxies.length,
      total_artists: spatialArtists.length,
      total_albums: spatialAlbums.length,
      total_connections: connections.length,
      filter_metadata: filterMetadata,
      spatial_bounds: {
        min: -100,
        max: 100,
        dimension: 3
      },
      galaxies,
      artists: spatialArtists,
      albums: spatialAlbums,
      tracks: spatialTracks,
      connections
    };

    return this.currentConstellation;
  }
}

export const spatialEngine = new SpatialEngine();
