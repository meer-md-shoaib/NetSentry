/**
 * NetSentry — Automated Test Suite for FIU AML, CDR Telecom & Dynamic Ingest
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 */

import assert from 'assert';
import { analyzeFIUTransactions } from '../src/intelligence/fiuAnalyzer.js';
import { analyzeCDRLogs } from '../src/intelligence/cdrAnalyzer.js';
import { parseCSVToEntities } from '../src/parser/csvParser.js';

console.log('[NetSentry Test Suite] Running FIU, CDR & Ingest unit tests...');

// 1. Test FIU Structuring / Smurfing Detection
console.log('Test 1: FIU Structuring & Smurfing Detection...');
const smurfingTxns = [
  { from_account: 'ACC-8812', to_account: 'ACC-9941', amount: 49500, timestamp: '2026-09-10T10:00:00Z' },
  { from_account: 'ACC-8812', to_account: 'ACC-9942', amount: 48900, timestamp: '2026-09-10T10:15:00Z' },
  { from_account: 'ACC-8812', to_account: 'ACC-9943', amount: 15000, timestamp: '2026-09-10T10:30:00Z' }
];

const fiuReport = analyzeFIUTransactions(smurfingTxns);
const smurfAlerts = fiuReport.suspiciousReports.filter(r => r.type === 'STRUCTURING_SMURFING');
assert.strictEqual(smurfAlerts.length, 2, 'Should detect exactly 2 transactions structured under ₹50,000');
console.log('✓ Test 1 Passed.');

// 2. Test CDR Command Burst & Burner Telecom Detection
console.log('Test 2: CDR Command Burst Detection...');
const sampleCdrLogs = [];
// Generate 12 short calls (average 25s) between suspect burner pair
for (let i = 0; i < 12; i++) {
  sampleCdrLogs.push({
    caller_msisdn: '+91-9820011223',
    receiver_msisdn: '+91-9876543210',
    duration_sec: 25,
    cell_tower_id: 'TOWER-DL-09'
  });
}

const cdrReport = analyzeCDRLogs(sampleCdrLogs);
assert(cdrReport.burstAnomalies.length > 0, 'Should detect operational command dispatch burst');
assert.strictEqual(cdrReport.burstAnomalies[0].type, 'COMMAND_BURST_DISPATCH');
console.log('✓ Test 2 Passed.');

// 3. Test Client-Side CSV Dynamic Ingestion
console.log('Test 3: Dynamic CSV Parser & Schema Normalizer...');
const testCsv = `id,name,alias,threat,role,jurisdiction,fir,notes
TST-01,Devraj Chauhan,Deva Bhai,CRITICAL,Syndicate Boss,Haryana,FIR 44/26,Interstate arms trafficking
TST-02,Rohit Verma,Rohit Shooter,HIGH,Enforcer,Punjab,FIR 45/26,Contract enforcement`;

const parsed = parseCSVToEntities(testCsv);
assert.strictEqual(parsed.length, 2, 'Should parse exactly 2 records');
assert.strictEqual(parsed[0].canonical_name, 'Devraj Chauhan');
assert.strictEqual(parsed[0].risk_tier, 'critical');
assert.strictEqual(parsed[0].orbit_level, 0, 'First record should be assigned Kingpin orbit 0');
assert.strictEqual(parsed[1].orbit_level, 1, 'Subsequent record should be assigned lieutenant orbit 1');
console.log('✓ Test 3 Passed.');

console.log('\n========================================');
console.log('ALL FIU, CDR & INGEST TESTS PASSED (100%)');
console.log('========================================\n');
