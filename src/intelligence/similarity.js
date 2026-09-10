/**
 * NetSentry — Multi-Signal Intelligence Similarity Calculators
 * Implements Modus Operandi/FIR Metadata, Multi-Agency Case Co-occurrence, and Cartel/Syndicate Nexus signals.
 */

// Known crime syndicates, operational wings, and logistics nexus networks
const KNOWN_SYNDICATE_AFFINITIES = [
  // Inter-state Lawrence-Bishnoi Syndicate <-> Goldy Brar Operational Module <-> North Transit Ring
  { syndicates: ['bishnoi syndicate', 'goldy brar cell', 'lawrence syndicate', 'north transit ring'], score: 0.95 },
  // Bambiha Syndicate <-> Kaushal Chaudhary Group <-> Lucky Patial Module
  { syndicates: ['bambiha gang', 'kaushal chaudhary group', 'lucky patial module'], score: 0.95 },
  // Mewat Financial Fraud Nexus <-> Bharatpur Module <-> Alwar SIM Cloning Ring
  { syndicates: ['mewat cyber syndicate', 'bharatpur module', 'alwar sim cloning ring', 'deeg financial wing'], score: 0.90 },
  // Trans-Border Narcotics Corridor <-> Hawala Conduit
  { syndicates: ['border drone infiltration', 'amritsar conduit', 'jammu trans-border ring', 'taran taran logistics'], score: 0.85 },
  // Extortion & Arms Smuggling Ring
  { syndicates: ['rohtak arms module', 'delhi ncr extortion ring', 'west up logistics cell'], score: 0.80 }
];

/**
 * Split crime category / IPC code string into canonical classification tokens
 */
export function extractClassificationTokens(classStr) {
  if (!classStr || typeof classStr !== 'string') return [];
  return classStr
    .toLowerCase()
    .split(/[\/,&|+\-]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

/**
 * Alias for backward compatibility
 */
export const extractGenreTokens = extractClassificationTokens;

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
 * Signal 1: Crime Metadata & Modus Operandi Similarity [0, 1]
 * Compares crime category tokens, investigative tags, and temporal offense window proximity.
 */
export function computeMetadataSimilarity(recordA, recordB) {
  // 1. Crime category / classification similarity
  const catA = new Set(extractClassificationTokens(recordA.crime_category || recordA.genre || ''));
  const catB = new Set(extractClassificationTokens(recordB.crime_category || recordB.genre || ''));
  const categoryScore = jaccardSimilarity(catA, catB);

  // 2. Modus operandi & investigative tag similarity
  const tagsA = new Set((recordA.tags || recordA.modus_operandi || []).map(t => t.toLowerCase().trim()));
  const tagsB = new Set((recordB.tags || recordB.modus_operandi || []).map(t => t.toLowerCase().trim()));
  const tagScore = jaccardSimilarity(tagsA, tagsB);

  // 3. Temporal Offense Window Proximity
  let temporalScore = 0.5; // neutral fallback
  const dateStrA = recordA.first_offense_date || recordA.release_date || recordA.date || '';
  const dateStrB = recordB.first_offense_date || recordB.release_date || recordB.date || '';
  const yearA = dateStrA ? parseInt(dateStrA.substring(0, 4), 10) : null;
  const yearB = dateStrB ? parseInt(dateStrB.substring(0, 4), 10) : null;

  if (yearA && yearB && !isNaN(yearA) && !isNaN(yearB)) {
    const diff = Math.abs(yearA - yearB);
    temporalScore = Math.exp(-diff / 8.0); // Exponential decay
  }

  // Same operational cell / hub boost
  let cellScore = 0.0;
  const cellA = (recordA.cell || recordA.album || '').trim();
  const cellB = (recordB.cell || recordB.album || '').trim();
  if (cellA && cellB && cellA !== 'Unknown Operational Cell' && cellA !== 'Unknown Album') {
    if (cellA.toLowerCase() === cellB.toLowerCase()) {
      cellScore = 1.0;
    }
  }

  // Composite crime metadata similarity
  const score = (0.40 * categoryScore) + (0.35 * tagScore) + (0.15 * temporalScore) + (0.10 * cellScore);
  return Math.max(0.0, Math.min(1.0, score));
}

/**
 * Signal 3: Investigating Agency & Joint Operation Co-occurrence [0, 1]
 * Measures how frequently two suspects co-occur across agency case files and joint operations.
 */
export function computePlaylistSimilarity(recordA, recordB) {
  const casesA = new Set(recordA.agencies || recordA.playlists || []);
  const casesB = new Set(recordB.agencies || recordB.playlists || []);

  if (casesA.size === 0 || casesB.size === 0) return 0.0;

  let sharedCount = 0;
  casesA.forEach(item => {
    if (casesB.has(item)) sharedCount++;
  });

  if (sharedCount === 0) return 0.0;

  // Jaccard index of joint case appearances
  const union = casesA.size + casesB.size - sharedCount;
  const jaccard = union > 0 ? sharedCount / union : 0.0;

  // Bonus for multiple joint agency chargesheets
  const coInvestigationWeight = Math.min(1.0, 0.4 + (sharedCount * 0.3));
  return Math.min(1.0, Math.max(jaccard, coInvestigationWeight));
}

/**
 * Signal 4: Syndicate Affiliation & Logistics Nexus [0, 1]
 * Measures same-cartel identity and inter-state logistics nexus affinities.
 */
export function computeArtistSimilarity(recordA, recordB) {
  const synA = (recordA.syndicate || recordA.artist || '').toLowerCase().trim();
  const synB = (recordB.syndicate || recordB.artist || '').toLowerCase().trim();

  if (!synA || !synB || synA === 'independent operative' || synB === 'independent operative' || synA === 'unknown artist') {
    return 0.0;
  }

  // Exact same crime syndicate
  if (synA === synB) {
    return 1.0;
  }

  // Check known cartel affinities & operational nexus
  for (const group of KNOWN_SYNDICATE_AFFINITIES) {
    if (group.syndicates.includes(synA) && group.syndicates.includes(synB)) {
      return group.score;
    }
  }

  // Check shared intelligence mentions in criminal dossier notes
  const notesA = (recordA.intelligence_notes || recordA.artist_biography || '').toLowerCase();
  const notesB = (recordB.intelligence_notes || recordB.artist_biography || '').toLowerCase();
  if (notesA.includes(synB) || notesB.includes(synA)) {
    return 0.70;
  }

  return 0.0;
}
