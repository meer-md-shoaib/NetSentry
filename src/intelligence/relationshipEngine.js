/**
 * NetSentry — Criminal Relationship & Intelligence Engine
 * Combines 4 signals (FIR/Crime Metadata, Semantic NLP Dossier, Multi-Agency Case Co-occurrence, Syndicate Nexus)
 * into tunable, explainable similarity scores for law enforcement analysts.
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
    this.records = [];
    this.recordMap = new Map();
    this.explicitLinks = new Map();

    // Configurable Tunable Weights for Criminal Intelligence
    this.weights = {
      metadata: 0.25, // FIR & crime category match
      semantic: 0.30, // Modus operandi & dossier NLP similarity
      playlist: 0.25, // Cross-jurisdiction case co-occurrence
      artist: 0.20    // Syndicate affiliation & nexus
    };
  }

  // Alias for backward compatibility with existing component calls
  get tracks() {
    return this.records;
  }
  set tracks(val) {
    this.records = val;
  }
  get trackMap() {
    return this.recordMap;
  }

  /**
   * Set explicit intelligence relationships (e.g. CDR phone logs, Hawala trails, co-accused FIR links)
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
   * Index intelligence records and build semantic text corpus
   */
  indexLibrary(records) {
    this.records = records || [];
    this.recordMap.clear();
    this.records.forEach(r => this.recordMap.set(r.id, r));

    // Train semantic vectorizer across all intelligence dossiers
    this.vectorizer.fit(this.records);
  }

  /**
   * Update weights dynamically from UI sliders
   */
  setWeights(newWeights) {
    this.weights = {
      ...this.weights,
      ...newWeights
    };
  }

  /**
   * Compute multi-signal similarity between two suspects/entities
   */
  computePairwiseRelationship(recordA, recordB) {
    if (recordA.id === recordB.id) {
      return {
        totalScore: 1.0,
        signals: { metadata: 1.0, semantic: 1.0, playlist: 1.0, artist: 1.0 },
        contributions: { metadata: 25, semantic: 25, playlist: 25, artist: 25 },
        explanation: 'Identical suspect entity'
      };
    }

    // Check explicit intelligence connection first (CDR, Hawala, FIR)
    const linkKey = `${recordA.id}__${recordB.id}`;
    if (this.explicitLinks.has(linkKey)) {
      const explicit = this.explicitLinks.get(linkKey);
      return {
        totalScore: explicit.weight || 0.92,
        signals: { metadata: 0.9, semantic: 0.9, playlist: 0.85, artist: 0.95 },
        contributions: { metadata: 20, semantic: 30, playlist: 20, artist: 30 },
        explanation: explicit.explanation || `Connected via ${explicit.type || 'intelligence link'}`
      };
    }

    const sMeta = computeMetadataSimilarity(recordA, recordB);
    const sSem = this.vectorizer.computeSimilarity(recordA.id, recordB.id);
    const sPlay = computePlaylistSimilarity(recordA, recordB);
    const sArt = computeArtistSimilarity(recordA, recordB);

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
    const explanation = this.generateExplanation(recordA, recordB, {
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
  generateExplanation(recordA, recordB, data) {
    const { sMeta, sSem, sPlay, sArt } = data;
    const totalScore = (data.cMeta * sMeta + data.cSem * sSem + data.cPlay * sPlay + data.cArt * sArt) / 100;
    const scorePct = Math.round((totalScore || sMeta) * 100);

    const synA = (recordA.syndicate || recordA.artist || '').toLowerCase().trim();
    const synB = (recordB.syndicate || recordB.artist || '').toLowerCase().trim();
    const cellA = (recordA.cell || recordA.album || '').trim();
    const cellB = (recordB.cell || recordB.album || '').trim();

    // 1. Same syndicate
    if (synA && synA === synB && synA !== 'independent operative' && synA !== 'unknown artist') {
      if (cellA && cellB && cellA === cellB && cellA !== 'Unknown Operational Cell' && cellA !== 'Unknown Album') {
        return `Same operational cell · ${cellA}`;
      }
      return `Same crime syndicate · ${recordA.syndicate || recordA.artist}`;
    }

    // 2. Syndicate logistics affinity / known nexus
    if (sArt >= 0.70) {
      return `Syndicate nexus affinity · ${Math.round(sArt * 100)}%`;
    }

    // 3. Shared investigating agency / joint operation
    const agenciesA = recordA.agencies || recordA.playlists || [];
    const agenciesB = recordB.agencies || recordB.playlists || [];
    const sharedAgencies = agenciesA.filter(p => agenciesB.includes(p));
    if (sharedAgencies.length > 0) {
      return `Cross-agency link · ${sharedAgencies[0]}`;
    }

    // 4. Semantic similarity dominant (shared modus operandi)
    if (sSem >= 0.45 && sSem >= sMeta) {
      return `Modus operandi match · ${scorePct}%`;
    }

    // 5. Metadata similarity dominant (crime category/IPC sections)
    if (sMeta >= 0.45) {
      const catA = recordA.crime_category || recordA.genre;
      const catB = recordB.crime_category || recordB.genre;
      if (catA && catA === catB) {
        return `Shared classification · ${catA}`;
      }
      return `Offense pattern match · ${scorePct}%`;
    }

    // 6. Multi-signal contextual affinity
    return `Multi-signal intelligence link · ${scorePct}%`;
  }

  /**
   * Find top related suspects for a target suspect
   */
  getRelatedTracks(targetRecordId, topN = 6) {
    const target = this.recordMap.get(targetRecordId);
    if (!target) return [];

    const candidates = [];
    this.records.forEach(r => {
      if (r.id === targetRecordId) return;

      const rel = this.computePairwiseRelationship(target, r);
      candidates.push({
        track: r,
        score: rel.totalScore,
        signals: rel.signals,
        contributions: rel.contributions,
        explanation: rel.explanation
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topN);
  }

  getRelatedSuspects(targetRecordId, topN = 6) {
    return this.getRelatedTracks(targetRecordId, topN);
  }

  /**
   * Find top related syndicates for a target crime syndicate
   */
  getRelatedArtists(targetSyndicateName, topN = 5) {
    if (!targetSyndicateName) return [];
    const targetLower = targetSyndicateName.toLowerCase().trim();

    // Gather records by target syndicate
    const targetRecords = this.records.filter(r => (r.syndicate || r.artist || '').toLowerCase().trim() === targetLower);
    if (targetRecords.length === 0) return [];

    // Map other syndicates to their average score with target syndicate records
    const syndicateScores = new Map();

    this.records.forEach(otherRecord => {
      const otherSyn = otherRecord.syndicate || otherRecord.artist;
      const otherLower = (otherSyn || '').toLowerCase().trim();
      if (!otherSyn || otherLower === targetLower) return;

      let maxScore = 0;
      let bestExplanation = '';

      targetRecords.forEach(tRecord => {
        const rel = this.computePairwiseRelationship(tRecord, otherRecord);
        if (rel.totalScore > maxScore) {
          maxScore = rel.totalScore;
          bestExplanation = rel.explanation;
        }
      });

      if (!syndicateScores.has(otherSyn)) {
        syndicateScores.set(otherSyn, {
          artist: otherSyn,
          syndicate: otherSyn,
          score: maxScore,
          explanation: bestExplanation,
          sampleArtwork: otherRecord.artwork_url || null,
          genre: otherRecord.crime_category || otherRecord.genre || null
        });
      } else {
        const existing = syndicateScores.get(otherSyn);
        if (maxScore > existing.score) {
          existing.score = maxScore;
          existing.explanation = bestExplanation;
        }
      }
    });

    const list = Array.from(syndicateScores.values());
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, topN);
  }

  getRelatedSyndicates(targetSyndicateName, topN = 5) {
    return this.getRelatedArtists(targetSyndicateName, topN);
  }
}

export const relationshipEngine = new RelationshipEngine();
