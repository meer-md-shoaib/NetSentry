/**
 * NetSentry — Punjab Border Drone Narcotics & Majha Arms Network
 * Target Syndicate 5 Extension: Trans-Border Heroin Drops & Illegal Arms
 */

export const SYNDICATE_PUNJAB_DRONE = {
  id: "syn_punjab_drone",
  name: "Punjab Border Drone Narcotics Cartel",
  category: "Trans-Border Hexacopter Payloads & NDPS Infiltration",
  tagline: "Amritsar - Batala - Ferozepur - Mamdot Border Belt",
  color: "#10B981", // Emerald Green
  kingpin: "Jasdeep Singh (Jaggu Bhagwanpuria)",
  primaryHub: "Batala & Amritsar",
  threatLevel: "CRITICAL",
  firsCount: 65,
  activeOperatives: 5,
  estimatedHawala: "₹380 Cr"
};

export const ENTITIES_PUNJAB_DRONE = [
  {
    id: "person_jaggu",
    canonical_name: "Jasdeep Singh",
    aliases: ["Jaggu Bhagwanpuria", "जग्गू भगवानपुरिया"],
    orbit_level: 0,
    role: "Trans-Border Cartel Boss",
    risk_score: 98,
    risk_tier: "critical",
    betweenness: 0.95,
    centrality_rank: 1,
    jurisdiction: "Punjab & Border Belt",
    city: "Batala",
    lat: 31.8186,
    lng: 75.2028,
    phones: ["+91-9814099881"],
    vehicles: ["PB-06-AV-0001"],
    firs: ["FIR 99/2020 PS Batala", "NDPS Special Case 44/2021"],
    agencies: ["Punjab Police AGTF", "BSF Intelligence", "NCB"],
    notes: "Directs drone drops from Pakistani contacts into border agricultural fields; supplies weapons and narcotics to Bishnoi and allied gangs."
  },
  {
    id: "person_billa_border",
    canonical_name: "Balwinder Singh",
    aliases: ["Billa Border", "बिल्ला"],
    orbit_level: 1,
    role: "Border Infiltration & Recovery Lead",
    risk_score: 87,
    risk_tier: "critical",
    betweenness: 0.68,
    centrality_rank: 2,
    jurisdiction: "Punjab Border Belt",
    city: "Ferozepur",
    lat: 30.9237,
    lng: 74.6114,
    phones: ["+91-9872044119"],
    vehicles: ["PB-05-AB-7711"],
    firs: ["FIR 14/2023 PS Mamdot"],
    agencies: ["BSF", "Punjab Police Special Task Force"],
    notes: "Monitors GPS coordinates sent by cross-border handlers to retrieve nighttime drone-dropped packages."
  }
];

export const LINKS_PUNJAB_DRONE = [
  { source: "person_jaggu", target: "person_billa_border", relationship: "Drone Coordinate Directives", weight: 0.96 }
];
