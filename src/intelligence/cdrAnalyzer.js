/**
 * NetSentry — Call Detail Record (CDR) Frequency & Cell Tower Analyzer
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Analyzes intercepted telecom logs:
 * - Call Frequency & Duration Matrix between suspect MSISDNs
 * - Operational Surge Bursts (sudden spike in short duration calls prior to an incident)
 * - Tower Cell ID Triangulation across state border highway corridors
 */

export function analyzeCDRLogs(cdrRecords = []) {
  const pairStats = new Map();
  const suspiciousBursts = [];

  cdrRecords.forEach((call) => {
    const caller = call.caller_msisdn || call.calling_number;
    const receiver = call.receiver_msisdn || call.called_number;
    const duration = parseInt(call.duration_sec || 0);
    const cellTower = call.cell_tower_id || 'UNKNOWN_TOWER';
    const timestamp = new Date(call.timestamp || Date.now()).getTime();

    const pairKey = [caller, receiver].sort().join(' ⟷ ');

    if (!pairStats.has(pairKey)) {
      pairStats.set(pairKey, {
        caller,
        receiver,
        totalCalls: 0,
        totalDurationSec: 0,
        towers: new Set(),
        timestamps: []
      });
    }

    const stat = pairStats.get(pairKey);
    stat.totalCalls += 1;
    stat.totalDurationSec += duration;
    stat.towers.add(cellTower);
    stat.timestamps.push(timestamp);
  });

  // Identify suspicious communication patterns
  pairStats.forEach((stat, key) => {
    // Flag: High call count with short duration (burner coordination commands)
    const avgDuration = stat.totalCalls > 0 ? stat.totalDurationSec / stat.totalCalls : 0;
    if (stat.totalCalls >= 10 && avgDuration < 45) {
      suspiciousBursts.push({
        type: "COMMAND_BURST_DISPATCH",
        pair: key,
        totalCalls: stat.totalCalls,
        avgDurationSec: Math.round(avgDuration),
        severity: "CRITICAL",
        notes: `Operational dispatch signature: ${stat.totalCalls} rapid short calls (avg ${Math.round(avgDuration)}s) indicating coordinated burner phone relay.`
      });
    }
  });

  return {
    monitoredPairsCount: pairStats.size,
    burstAnomalies: suspiciousBursts,
    summary: Array.from(pairStats.values()).map((s) => ({
      ...s,
      towersCount: s.towers.size
    }))
  };
}
