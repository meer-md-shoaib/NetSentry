/**
 * NetSentry — Mewat Cyber Fraud Ring & Deeg Phishing Hub
 * Target Syndicate 4 Extension: Multi-State Fake KYC, Mule Accounts & Phishing
 */

export const SYNDICATE_MEWAT_DEEG = {
  id: "syn_mewat_deeg",
  name: "Mewat & Deeg Cyber Fraud Ring",
  category: "UPI Spoofing, Fake Utility Phishing & Biometric KYC Fraud",
  tagline: "Bharatpur - Deeg - Alwar - Jamtara Digital Axis",
  color: "#8B5CF6", // Royal Violet
  kingpin: "Tahir Khan (Master Mewati)",
  primaryHub: "Deeg & Bharatpur",
  threatLevel: "HIGH",
  firsCount: 88,
  activeOperatives: 5,
  estimatedHawala: "₹180 Cr"
};

export const ENTITIES_MEWAT_DEEG = [
  {
    id: "person_tahir_mewati",
    canonical_name: "Tahir Khan",
    aliases: ["Master Mewati", "ताहिर खान"],
    orbit_level: 0,
    role: "Technical Architect & Spoofing Mastermind",
    risk_score: 93,
    risk_tier: "critical",
    betweenness: 0.91,
    centrality_rank: 1,
    jurisdiction: "Rajasthan & Haryana",
    city: "Bharatpur",
    lat: 27.2152,
    lng: 77.5030,
    phones: ["+91-9828012399"],
    vehicles: ["RJ-05-CB-4400"],
    firs: ["FIR 211/2023 PS Cyber Crime Gurugram"],
    agencies: ["Haryana Cyber Cell", "Rajasthan Police"],
    notes: "Develops customized malicious APKs mimicking state electricity boards; routes stolen victim balances through multi-hop mule accounts."
  },
  {
    id: "person_mubin_sheikh",
    canonical_name: "Mubin Sheikh",
    aliases: ["SIM Dealer Mubin", "मुबीन शेख"],
    orbit_level: 1,
    role: "Bulk Forged KYC SIM Supplier",
    risk_score: 83,
    risk_tier: "high",
    betweenness: 0.62,
    centrality_rank: 2,
    jurisdiction: "Rajasthan",
    city: "Deeg",
    lat: 27.4725,
    lng: 77.3242,
    phones: ["+91-9829033221"],
    vehicles: ["RJ-05-D-2200"],
    firs: ["FIR 155/2023 PS Deeg"],
    agencies: ["Rajasthan Police", "I4C MHA"],
    notes: "Circulated 4,000+ pre-activated SIM cards using fraudulent biometric scans across West Bengal and Assam."
  },
  {
    id: "person_wasim_lambu",
    canonical_name: "Wasim Akram",
    aliases: ["Wasim Lambu", "वसीम लंबू"],
    orbit_level: 2,
    role: "Mule Account Cashout Chief",
    risk_score: 79,
    risk_tier: "high",
    betweenness: 0.44,
    centrality_rank: 3,
    jurisdiction: "Haryana",
    city: "Nuh",
    lat: 28.1067,
    lng: 77.0142,
    phones: ["+91-9812044889"],
    vehicles: ["HR-27-B-9911"],
    firs: ["FIR 89/2023 PS City Nuh"],
    agencies: ["Haryana Cyber Crime Branch"],
    notes: "Directs micro-ATM cash withdrawals in rural border villages within 15 minutes of victim transactions."
  }
];

export const LINKS_MEWAT_DEEG = [
  { source: "person_tahir_mewati", target: "person_mubin_sheikh", relationship: "SIM Inventory Pipeline", weight: 0.92 },
  { source: "person_tahir_mewati", target: "person_wasim_lambu", relationship: "Cashout Directives", weight: 0.88 }
];
