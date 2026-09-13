/**
 * NetSentry — Interstate Vehicle Theft, VIN Tampering & Malda FICN Ring
 * Target Syndicate 9: Luxury SUV Cloning & High-Grade Fake Currency Influx
 */

export const SYNDICATE_VEHICLE_FICN = {
  id: "syn_vehicle_ficn",
  name: "Interstate Vehicle Cloning & Malda FICN Ring",
  category: "Luxury Vehicle VIN Tampering & High-Grade Counterfeit Notes",
  tagline: "Rohtak - Meerut - Malda - Patna Transit Axis",
  color: "#CA8A04", // Gold Yellow
  kingpin: "Manoj Kumar (Manoj Bakkarwala)",
  primaryHub: "Rohtak & Malda",
  threatLevel: "CRITICAL",
  firsCount: 72,
  activeOperatives: 5,
  estimatedHawala: "₹140 Cr"
};

export const ENTITIES_VEHICLE_FICN = [
  {
    id: "person_bakkarwala",
    canonical_name: "Manoj Kumar",
    aliases: ["Manoj Bakkarwala", "मनोज बक्करवाला"],
    orbit_level: 0,
    role: "Interstate Vehicle Theft Kingpin",
    risk_score: 95,
    risk_tier: "critical",
    betweenness: 0.92,
    centrality_rank: 1,
    jurisdiction: "Haryana, Delhi NCR & Punjab",
    city: "Rohtak",
    lat: 28.8955,
    lng: 76.6066,
    phones: ["+91-9812019944"],
    vehicles: ["HR-12-AK-9999"],
    firs: ["FIR 188/2021 PS Rohtak City", "FIR 52/2020 PS Crime Branch Delhi"],
    agencies: ["Haryana Police STF", "Delhi Crime Branch"],
    notes: "Mastermind behind 500+ luxury vehicle thefts across North India; clones engine VINs and re-registers them in northeastern states."
  },
  {
    id: "person_dinu_malda",
    canonical_name: "Dinesh Kumar",
    aliases: ["Dinu Malda", "दीनू मालदा"],
    orbit_level: 1,
    role: "Cross-Border FICN Pipeline Chief",
    risk_score: 88,
    risk_tier: "critical",
    betweenness: 0.69,
    centrality_rank: 2,
    jurisdiction: "West Bengal & Bihar",
    city: "Malda",
    lat: 25.0108,
    lng: 88.1411,
    phones: ["+91-9832011499"],
    vehicles: ["WB-66-B-1100"],
    firs: ["FIR 63/2022 PS Kaliachak"],
    agencies: ["National Investigation Agency (NIA)"],
    notes: "Receives high-grade Fake Indian Currency Notes smuggled across the international border; channels counterfeit currency into regional agricultural markets."
  },
  {
    id: "person_subedar_arms",
    canonical_name: "Suresh Kumar",
    aliases: ["Subedar", "सूबेदार"],
    orbit_level: 2,
    role: "Clandestine Weapons Foundry Head",
    risk_score: 84,
    risk_tier: "high",
    betweenness: 0.45,
    centrality_rank: 3,
    jurisdiction: "Western Uttar Pradesh",
    city: "Meerut",
    lat: 28.9845,
    lng: 77.7064,
    phones: ["+91-9837012299"],
    vehicles: ["UP-15-CL-4400"],
    firs: ["FIR 412/2022 PS Lisari Gate"],
    agencies: ["UP STF"],
    notes: "Manufactures custom replica automatic weapons using lathe machinery in clandestine workshops in Lisari Gate."
  }
];

export const LINKS_VEHICLE_FICN = [
  { source: "person_bakkarwala", target: "person_dinu_malda", relationship: "Vehicle Delivery for FICN Cash", weight: 0.90 },
  { source: "person_bakkarwala", target: "person_subedar_arms", relationship: "Arms for Getaway Fleet", weight: 0.85 }
];
