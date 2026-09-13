/**
 * NetSentry — Coastal Seaborne Contraband & Kutch Dhow Smuggling Syndicate
 * Target Syndicate 8: Arabian Sea Maritime Smuggling, Dhow Landings & Hawala
 */

export const SYNDICATE_COASTAL = {
  id: "syn_coastal",
  name: "Coastal Seaborne Contraband Syndicate",
  category: "Maritime Dhow Smuggling, Off-Shore Transshipment & Gold Influx",
  tagline: "Kutch - Porbandar - Mandvi - Ratnagiri Seaboard",
  color: "#059669", // Deep Emerald
  kingpin: "Kishore Patel (Kishore Kutch)",
  primaryHub: "Mandvi & Porbandar",
  threatLevel: "HIGH",
  firsCount: 38,
  activeOperatives: 4,
  estimatedHawala: "₹210 Cr"
};

export const ENTITIES_COASTAL = [
  {
    id: "person_kishore_kutch",
    canonical_name: "Kishore Patel",
    aliases: ["Kishore Kutch", "किशोर पटेल"],
    orbit_level: 0,
    role: "Maritime Fleet Mastermind",
    risk_score: 91,
    risk_tier: "critical",
    betweenness: 0.89,
    centrality_rank: 1,
    jurisdiction: "Gujarat Coastal Belt",
    city: "Mandvi",
    lat: 22.8339,
    lng: 69.3558,
    phones: ["+91-9825011988"],
    vehicles: ["GJ-12-AK-0007"],
    firs: ["FIR 51/2023 PS Marine Kutch"],
    agencies: ["Gujarat ATS", "Indian Coast Guard"],
    notes: "Controls mechanized fishing dhow fleet operating from Mandvi port; conducts mid-sea contraband transfers beyond 12 nautical miles."
  },
  {
    id: "person_naved_dubai",
    canonical_name: "Naved Khan",
    aliases: ["Naved Dubai", "नावेद खान"],
    orbit_level: 1,
    role: "International Port Cargo Consignee",
    risk_score: 86,
    risk_tier: "critical",
    betweenness: 0.64,
    centrality_rank: 2,
    jurisdiction: "Maharashtra & Gujarat",
    city: "Navi Mumbai",
    lat: 18.9500,
    lng: 72.9500,
    phones: ["+971-50-998811", "+91-9820011445"],
    vehicles: ["MH-46-AZ-9900"],
    firs: ["FIR 112/2022 PS Uran"],
    agencies: ["Directorate of Revenue Intelligence (DRI)"],
    notes: "Manages freight-forwarding container manifests at Nhava Sheva port for disguised contraband consignments."
  }
];

export const LINKS_COASTAL = [
  { source: "person_kishore_kutch", target: "person_naved_dubai", relationship: "Offshore Cargo Transshipment", weight: 0.91 }
];
