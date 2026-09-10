/**
 * Music Constellation — Relationship & Intelligence Engine (Phase 3)
 * Combines 4 signals (Metadata, Semantic, Playlist, Artist) into tunable, explainable similarity scores.
 */

import { SemanticVectorizer } from './semantic.js';
import {
  computeMetadataSimilarity,
  computePlaylistSimilarity,
  computeArtistSimilarity
} from './similarity.js';

export class RelationshipEngine {
  constructor() {
    this.vectorizer = new SemanticVectorizer();
    this.tracks = [];
    this.trackMap = new Map();
    this.explicitLinks = new Map();

    // Configurable Tunable Weights (Defaults as planned)
    this.weights = {
      metadata: 0.25,
      semantic: 0.30,
      playlist: 0.25,
      artist: 0.20
    };
  }

  /**
   * Set explicit intelligence relationships (e.g. CDR, Hawala, FIR links)
   */
  setExplicitLinks(links = []) {
    this.explicitLinks.clear();
    links.forEach(link => {
      const key1 = `${link.source}__${link.target}`;
      const key2 = `${link.target}__${link.source}`;
      this.explicitLinks.set(key1, link);
      this.explicitLinks.set(key2, link);
    });
  }

  /**
   * Index library tracks and build semantic text corpus
   */
  indexLibrary(tracks) {
    this.tracks = tracks || [];
    this.trackMap.clear();
    this.tracks.forEach(t => this.trackMap.set(t.id, t));

    // Train semantic vectorizer across all enriched tracks
    this.vectorizer.fit(this.tracks);
  }

  /**
   * Update weights dynamically
   */
  setWeights(newWeights) {
    this.weights = {
      ...this.weights,
      ...newWeights
    };
  }

  /**
   * Compute multi-signal similarity between two tracks
   */
  computePairwiseRelationship(trackA, trackB) {
    if (trackA.id === trackB.id) {
      return {
        totalScore: 1.0,
        signals: { metadata: 1.0, semantic: 1.0, playlist: 1.0, artist: 1.0 },
        contributions: { metadata: 25, semantic: 25, playlist: 25, artist: 25 },
        explanation: 'Identical entity'
      };
    }

    // Check explicit intelligence connection first
    const linkKey = `${trackA.id}__${trackB.id}`;
    if (this.explicitLinks.has(linkKey)) {
      const explicit = this.explicitLinks.get(linkKey);
      return {
        totalScore: explicit.weight || 0.92,
        signals: { metadata: 0.9, semantic: 0.9, playlist: 0.85, artist: 0.95 },
        contributions: { metadata: 20, semantic: 30, playlist: 20, artist: 30 },
        explanation: explicit.explanation || `Connected by ${explicit.type || 'intelligence trail'}`
      };
    }

    const sMeta = computeMetadataSimilarity(trackA, trackB);
    const sSem = this.vectorizer.computeSimilarity(trackA.id, trackB.id);
    const sPlay = computePlaylistSimilarity(trackA, trackB);
    const sArt = computeArtistSimilarity(trackA, trackB);

    const wMeta = this.weights.metadata;
    const wSem = this.weights.semantic;
    const wPlay = this.weights.playlist;
    const wArt = this.weights.artist;

    const totalWeight = wMeta + wSem + wPlay + wArt;
    if (totalWeight === 0) {
      return { totalScore: 0, signals: {}, contributions: {}, explanation: 'Weights set to zero' };
    }

    const weightedScore = (wMeta * sMeta) + (wSem * sSem) + (wPlay * sPlay) + (wArt * sArt);
    const totalScore = Math.max(0.0, Math.min(1.0, weightedScore / totalWeight));

    // Calculate percentage contribution of each signal
    const cMeta = totalScore > 0 ? Math.round(((wMeta * sMeta) / weightedScore) * 100) : 25;
    const cSem = totalScore > 0 ? Math.round(((wSem * sSem) / weightedScore) * 100) : 25;
    const cPlay = totalScore > 0 ? Math.round(((wPlay * sPlay) / weightedScore) * 100) : 25;
    const cArt = totalScore > 0 ? Math.round(((wArt * sArt) / weightedScore) * 100) : 25;

    // Generate explainability narrative
    const explanation = this.generateExplanation(trackA, trackB, {
      sMeta, sSem, sPlay, sArt, cMeta, cSem, cPlay, cArt
    });

    return {
      totalScore,
      signals: {
        metadata: sMeta,
        semantic: sSem,
        playlist: sPlay,
        artist: sArt
      },
      contributions: {
        metadata: cMeta,
        semantic: cSem,
        playlist: cPlay,
        artist: cArt
      },
      explanation
    };
  }

  /**
   * Explainable text generation based on signal strengths
   */
  generateExplanation(trackA, trackB, data) {
    const { sMeta, sSem, sPlay, sArt } = data;
    const totalScore = (data.cMeta * sMeta + data.cSem * sSem + data.cPlay * sPlay + data.cArt * sArt) / 100;
    const scorePct = Math.round((totalScore || sMeta) * 100);

    // 1. Same artist
    if ((trackA.artist || '').toLowerCase().trim() === (trackB.artist || '').toLowerCase().trim()) {
      if (trackA.album && trackB.album && trackA.album === trackB.album && trackA.album !== 'Unknown Album') {
        return `Same album · ${trackA.album}`;
      }
      return 'Same artist';
    }

    // 2. Associated acts / collaborators
    if (sArt >= 0.70) {
      return `Artist affinity · ${Math.round(sArt * 100)}%`;
    }

    // 3. Shared playlist dominant
    const sharedPlaylists = (trackA.playlists || []).filter(p => (trackB.playlists || []).includes(p));
    if (sharedPlaylists.length > 0) {
      return `Shared playlist · ${sharedPlaylists[0]}`;
    }

    // 4. Semantic similarity dominant
    if (sSem >= 0.45 && sSem >= sMeta) {
      return `Semantic similarity · ${scorePct}%`;
    }

    // 5. Metadata similarity (genre/tags) dominant
    if (sMeta >= 0.45) {
      if (trackA.genre && trackA.genre === trackB.genre) {
        return `Shared genre · ${trackA.genre}`;
      }
      return `Metadata similarity · ${scorePct}%`;
    }

    // 6. Multi-signal contextual affinity
    return `Multi-signal affinity · ${scorePct}%`;
  }

  /**
   * Find top related songs for a target track
   */
  getRelatedTracks(targetTrackId, topN = 6) {
    const target = this.trackMap.get(targetTrackId);
    if (!target) return [];

    const candidates = [];
    this.tracks.forEach(t => {
      if (t.id === targetTrackId) return;

      const rel = this.computePairwiseRelationship(target, t);
      candidates.push({
        track: t,
        score: rel.totalScore,
        signals: rel.signals,
        contributions: rel.contributions,
        explanation: rel.explanation
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topN);
  }

  /**
   * Find top related artists for a target artist
   */
  getRelatedArtists(targetArtistName, topN = 5) {
    if (!targetArtistName) return [];
    const targetLower = targetArtistName.toLowerCase().trim();

    // Gather tracks by target artist
    const targetTracks = this.tracks.filter(t => (t.artist || '').toLowerCase().trim() === targetLower);
    if (targetTracks.length === 0) return [];

    // Map other artists to their average score with target artist's tracks
    const artistScores = new Map(); // artistName -> { sumScore, count, explanations: [] }

    this.tracks.forEach(otherTrack => {
      const otherArtist = otherTrack.artist;
      const otherLower = (otherArtist || '').toLowerCase().trim();
      if (!otherArtist || otherLower === targetLower) return;

      // Average similarity across sample tracks
      let maxScore = 0;
      let bestExplanation = '';

      targetTracks.forEach(tTrack => {
        const rel = this.computePairwiseRelationship(tTrack, otherTrack);
        if (rel.totalScore > maxScore) {
          maxScore = rel.totalScore;
          bestExplanation = rel.explanation;
        }
      });

      if (!artistScores.has(otherArtist)) {
        artistScores.set(otherArtist, {
          artist: otherArtist,
          score: maxScore,
          explanation: bestExplanation,
          sampleArtwork: otherTrack.artwork_url || null,
          genre: otherTrack.genre || null
        });
      } else {
        const existing = artistScores.get(otherArtist);
        if (maxScore > existing.score) {
          existing.score = maxScore;
          existing.explanation = bestExplanation;
        }
      }
    });

    const list = Array.from(artistScores.values());
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, topN);
  }
}

export const relationshipEngine = new RelationshipEngine();
