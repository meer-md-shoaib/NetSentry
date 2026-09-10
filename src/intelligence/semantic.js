/**
 * Music Constellation — Semantic Intelligence Engine (Phase 3)
 * Fast client-side TF-IDF vectorizer and cosine similarity across artist bios, tags, and metadata.
 */

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'let', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

export class SemanticVectorizer {
  constructor() {
    this.vocabulary = new Map(); // word -> index
    this.idf = []; // index -> IDF weight
    this.vectors = new Map(); // trackId -> Float64Array
  }

  /**
   * Tokenize text into normalized alphanumeric words, removing stop words
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  /**
   * Build TF-IDF model from all tracks in the library
   */
  fit(tracks) {
    this.vocabulary.clear();
    this.vectors.clear();
    const docCount = tracks.length;
    if (docCount === 0) return;

    // 1. Extract documents text
    const documents = tracks.map(t => {
      const bio = t.artist_biography || t.artist_description || '';
      const tags = (t.tags || []).join(' ');
      const genre = t.genre || '';
      const album = t.album || '';
      const artist = t.artist || '';
      const title = t.title || '';
      return `${artist} ${artist} ${title} ${album} ${genre} ${genre} ${tags} ${tags} ${bio}`;
    });

    // 2. Count Document Frequencies (DF)
    const docFreq = new Map(); // word -> count of docs containing it
    const tokenizedDocs = documents.map(doc => {
      const tokens = this.tokenize(doc);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(token => {
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      });
      return tokens;
    });

    // 3. Build Vocabulary (keep words occurring in at least 1 document)
    let vocabIndex = 0;
    docFreq.forEach((count, word) => {
      this.vocabulary.set(word, vocabIndex++);
    });

    const vocabSize = this.vocabulary.size;
    this.idf = new Float64Array(vocabSize);

    // 4. Calculate IDF with smooth IDF formula: ln((N + 1) / (df + 1)) + 1
    this.vocabulary.forEach((idx, word) => {
      const df = docFreq.get(word) || 0;
      this.idf[idx] = Math.log((docCount + 1) / (df + 1)) + 1.0;
    });

    // 5. Build L2-normalized TF-IDF vectors for each track
    tracks.forEach((track, i) => {
      const tokens = tokenizedDocs[i];
      const vector = new Float64Array(vocabSize);

      // Term Frequency (TF)
      tokens.forEach(token => {
        const idx = this.vocabulary.get(token);
        if (idx !== undefined) {
          vector[idx] += 1.0;
        }
      });

      // TF-IDF = tf * idf
      let normSq = 0;
      for (let j = 0; j < vocabSize; j++) {
        if (vector[j] > 0) {
          vector[j] = Math.log(1 + vector[j]) * this.idf[j];
          normSq += vector[j] * vector[j];
        }
      }

      // L2 Normalize
      const norm = Math.sqrt(normSq);
      if (norm > 0) {
        for (let j = 0; j < vocabSize; j++) {
          vector[j] /= norm;
        }
      }

      this.vectors.set(track.id, vector);
    });
  }

  /**
   * Compute Cosine Similarity between two tracks [0, 1]
   */
  computeSimilarity(trackIdA, trackIdB) {
    if (trackIdA === trackIdB) return 1.0;
    const vecA = this.vectors.get(trackIdA);
    const vecB = this.vectors.get(trackIdB);
    if (!vecA || !vecB) return 0.0;

    let dot = 0;
    const len = vecA.length;
    for (let i = 0; i < len; i++) {
      if (vecA[i] !== 0 && vecB[i] !== 0) {
        dot += vecA[i] * vecB[i];
      }
    }

    return Math.max(0.0, Math.min(1.0, dot));
  }
}
