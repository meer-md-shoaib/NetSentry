/**
 * NetSentry — Cross-Syndicate Strategic Bridge Detector
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Unmasks covert multi-cartel conduits:
 * Detects individuals or assets (hawala operators, arms brokers, mule bankers)
 * that interface across two or more distinct criminal syndicates.
 */

export function detectCrossSyndicateBridges(allSyndicateEntities) {
  const phoneToSyndicates = new Map();
  const vehicleToSyndicates = new Map();
  const bridges = [];

  // Index phones and vehicles across all syndicates
  for (const [syndicateId, entities] of Object.entries(allSyndicateEntities)) {
    entities.forEach((entity) => {
      // Index phones
      (entity.phones || []).forEach((phone) => {
        if (!phoneToSyndicates.has(phone)) phoneToSyndicates.set(phone, []);
        phoneToSyndicates.get(phone).push({ syndicateId, entity });
      });

      // Index vehicles
      (entity.vehicles || []).forEach((veh) => {
        if (!vehicleToSyndicates.has(veh)) vehicleToSyndicates.set(veh, []);
        vehicleToSyndicates.get(veh).push({ syndicateId, entity });
      });
    });
  }

  // Detect shared phones across syndicates
  phoneToSyndicates.forEach((entries, phone) => {
    const uniqueSyns = new Set(entries.map((e) => e.syndicateId));
    if (uniqueSyns.size > 1) {
      bridges.push({
        type: "TELECOM_BRIDGE",
        identifier: phone,
        syndicatesInvolved: Array.from(uniqueSyns),
        entitiesInvolved: entries.map((e) => e.entity.canonical_name),
        threatLevel: "CRITICAL",
        notes: `Shared MSISDN wiretap detected actively routing communications across ${uniqueSyns.size} distinct syndicates.`
      });
    }
  });

  // Detect shared vehicles across syndicates
  vehicleToSyndicates.forEach((entries, veh) => {
    const uniqueSyns = new Set(entries.map((e) => e.syndicateId));
    if (uniqueSyns.size > 1) {
      bridges.push({
        type: "TRANSIT_FLEET_BRIDGE",
        identifier: veh,
        syndicatesInvolved: Array.from(uniqueSyns),
        entitiesInvolved: entries.map((e) => e.entity.canonical_name),
        threatLevel: "HIGH",
        notes: `Vehicle license plate logged crossing border checkpoints for operations of multiple syndicates.`
      });
    }
  });

  return bridges;
}
