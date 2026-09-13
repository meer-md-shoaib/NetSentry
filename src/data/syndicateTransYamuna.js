/**
 * NetSentry — Trans-Yamuna Armed Extortion & Firearm Syndicate
 * Target Syndicate 7: East Delhi - Western UP - Rajasthan Arms Axis
 */

export const SYNDICATE_TRANS_YAMUNA = {
  id: "syn_trans_yamuna",
  name: "Trans-Yamuna Armed Extortion Syndicate",
  category: "Contract Homicides, Gambling Dens & Illegal Arms",
  tagline: "North-East Delhi - Meerut - Alwar Corridor",
  color: "#EC4899", // Vivid Pink
  kingpin: "Irfan Chhenu (Chhenu Pehlwan)",
  primaryHub: "Seelampur & Jafrabad",
  threatLevel: "CRITICAL",
  firsCount: 47,
  activeOperatives: 5,
  estimatedHawala: "₹45 Cr"
};

export const ENTITIES_TRANS_YAMUNA = [
  {
    id: "person_chhenu",
    canonical_name: "Irfan Chhenu",
    aliases: ["Chhenu Pehlwan", "छेनू पहलवान"],
    orbit_level: 0,
    role: "Syndicate Boss",
    risk_score: 96,
    risk_tier: "critical",
    betweenness: 0.94,
    centrality_rank: 1,
    jurisdiction: "Delhi NCR & Western UP",
    city: "Delhi NCR",
    lat: 28.6692,
    lng: 77.2764,
    phones: ["+91-9811029988"],
    vehicles: ["DL-5C-R-1111"],
    firs: ["FIR 311/2020 PS Jafrabad", "MCOCA Case 18/2021"],
    agencies: ["Delhi Police Special Cell", "UP STF"],
    notes: "Directs targeted hits and protection collections across East Delhi wholesale markets; maintains armed rivalry with Nasir gang."
  },
  {
    id: "person_hashim_baba",
    canonical_name: "Hashim Baba",
    aliases: ["Baba North", "हाशिम बाबा"],
    orbit_level: 1,
    role: "Operational Enforcer",
    risk_score: 92,
    risk_tier: "critical",
    betweenness: 0.71,
    centrality_rank: 2,
    jurisdiction: "Delhi NCR",
    city: "Delhi NCR",
    lat: 28.6811,
    lng: 77.3048,
    phones: ["+91-9818044321"],
    vehicles: ["DL-8C-AK-9900"],
    firs: ["FIR 149/2021 PS GTB Enclave"],
    agencies: ["Delhi Police Crime Branch"],
    notes: "Operates syndicated gambling rackets and contract hit modules in Welcome and Seelampur."
  },
  {
    id: "person_deepak_boxer",
    canonical_name: "Deepak Pahal",
    aliases: ["Boxer", "दीपक बॉक्सर"],
    orbit_level: 1,
    role: "Interstate Hit Squad Lead",
    risk_score: 89,
    risk_tier: "critical",
    betweenness: 0.58,
    centrality_rank: 3,
    jurisdiction: "Delhi NCR & Mexico",
    city: "Gannaur",
    lat: 29.1311,
    lng: 77.0210,
    phones: ["+52-55-881299", "+91-9812033441"],
    vehicles: ["HR-10-Q-8888"],
    firs: ["FIR 214/2021 PS Alipur"],
    agencies: ["FBI / Interpol / Delhi Special Cell"],
    notes: "Headed Gogi gang after Jitender Gogi's courtroom murder; deported from Mexico after nationwide manhunt."
  }
];

export const LINKS_TRANS_YAMUNA = [
  { source: "person_chhenu", target: "person_hashim_baba", relationship: "Territorial Command", weight: 0.94 },
  { source: "person_chhenu", target: "person_deepak_boxer", relationship: "Hit Module Coordination", weight: 0.88 }
];
