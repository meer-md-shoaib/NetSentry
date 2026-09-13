/**
 * NetSentry — Automated Test Suite for Intelligence, ML & Graph Algorithms
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 */

import assert from 'assert';
import { predictRecordLinkage, transliterateIndicToLatin, normalizedLevenshtein, getDoubleMetaphoneTokens } from '../src/intelligence/rfAliasMatcher.js';
import { simulateSuspectArrest } from '../src/intelligence/tacticalSim.js';
import { extractEntitiesFromNarrative } from '../src/intelligence/nlpParser.js';
import { detectCrossSyndicateBridges } from '../src/intelligence/bridgeDetector.js';
import { CANONICAL_ENTITIES, CANONICAL_LINKS } from '../src/data/canonicalSyndicates.js';

console.log('[NetSentry Test Suite] Running algorithmic and ML unit tests...');

// 1. Test Indic Transliteration & Phonetics
console.log('Test 1: Indic Transliteration & Phonetics...');
const metaIndic = getDoubleMetaphoneTokens('अस्लम');
const metaLatin = getDoubleMetaphoneTokens('Aslam');
assert.strictEqual(metaIndic, metaLatin, 'Double Metaphone of अस्लम must match Aslam');

const lev = normalizedLevenshtein('Mohd Aslam', 'Mohd. Aslam');
assert(lev > 0.85, 'Levenshtein should be high for minor punctuation variation');
console.log('✓ Test 1 Passed.');

// 2. Test Supervised Random Forest Prediction
console.log('Test 2: Random Forest Linkage Prediction...');
const entityA = { name: 'Mohd. Aslam', phones: ['+91-9820091100'], vehicles: ['MH-01-DX-9009'] };
const entityB = { name: 'अस्लम भाई', phones: ['+91-9820091100'], vehicles: ['MH-01-DX-9009'] };
const pred = predictRecordLinkage(entityA, entityB);

assert(pred.confidenceScore >= 0.85, 'Score should trigger AUTO_MERGE for high corroboration');
assert.strictEqual(pred.decision, 'AUTO_MERGE', 'Decision should be AUTO_MERGE');
console.log(`✓ Test 2 Passed (Confidence: ${Math.round(pred.confidenceScore * 100)}%).`);

// 3. Test Tactical Arrest Simulator
console.log('Test 3: Tactical Arrest Simulator & Graph Fracture...');
const telgiNodes = CANONICAL_ENTITIES.syn_telgi;
const telgiLinks = CANONICAL_LINKS.syn_telgi;
const sim = simulateSuspectArrest('person_telgi', telgiNodes, telgiLinks);

assert.strictEqual(sim.capacityDropPct, 74.2, 'Kingpin arrest should yield 74.2% drop');
assert(sim.successorName.length > 0, 'Successor should be identified');
console.log(`✓ Test 3 Passed (Successor: ${sim.successorName}).`);

// 4. Test FIR Narrative NLP Extractor
console.log('Test 4: FIR Narrative NLP Extractor...');
const narrative = 'Accused Mohd Aslam alias Aslam Bhai fled in vehicle MH-12-Q-4004 using phone +91-9822019900 booked under IPC 420 and UAPA.';
const nlp = extractEntitiesFromNarrative(narrative);

assert(nlp.phones.includes('+919822019900') || nlp.phones.some((p) => p.includes('9822019900')), 'Phone should be extracted');
assert(nlp.vehicles.includes('MH-12-Q-4004'), 'Vehicle plate should be extracted');
assert(nlp.legalSections.some((s) => s.includes('420')), 'IPC 420 should be extracted');
console.log('✓ Test 4 Passed.');

// 5. Test Cross-Syndicate Strategic Bridge Detector
console.log('Test 5: Cross-Syndicate Strategic Bridge Detector...');
const mockMulti = {
  syn1: [{ id: 'a', canonical_name: 'Suspect A', phones: ['+91-9899001122'] }],
  syn2: [{ id: 'b', canonical_name: 'Suspect B', phones: ['+91-9899001122'] }]
};
const bridges = detectCrossSyndicateBridges(mockMulti);
assert.strictEqual(bridges.length, 1, 'Should detect 1 shared phone bridge');
console.log('✓ Test 5 Passed.');

console.log('\n========================================');
console.log('ALL 5 UNIT TESTS PASSED WITH 100% SUCCESS');
console.log('========================================\n');
