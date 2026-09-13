/**
 * NetSentry — Bambiha-Kaushal Interstate Alliance Dataset
 * Target Syndicate 6: Trans-State Contract Killings & Gang Warfare (Punjab, Haryana, J&K)
 */

export const SYNDICATE_BAMBIHA = {
  id: "syn_bambiha",
  name: "Bambiha-Kaushal Interstate Alliance",
  category: "Inter-State Gang Warfare & Contract Homicides",
  tagline: "Punjab - Haryana - Delhi NCR - Armenia Transit Axis",
  color: "#D97706", // Dark Amber
  kingpin: "Gurpreet Singh (Lucky Patial)",
  primaryHub: "Mohali & Gurugram",
  threatLevel: "CRITICAL",
  firsCount: 41,
  activeOperatives: 6,
  estimatedHawala: "₹85 Cr"
};

export const ENTITIES_BAMBIHA = [
  {
    id: "person_lucky_patial",
    canonical_name: "Gurpreet Singh",
    aliases: ["Lucky Patial", "लकी पटियाल"],
    orbit_level: 0, // Kingpin Sun
    role: "Foreign Operations Commander",
    risk_score: 97,
    risk_tier: "critical",
    betweenness: 0.93,
    centrality_rank: 1,
    jurisdiction: "Punjab & Armenia",
    city: "Mohali",
    lat: 30.7046,
    lng: 76.7179,
    phones: ["+374-91-440199", "+91-9872019944"],
    vehicles: ["PB-65-AZ-0005"],
    firs: ["FIR 84/2021 PS SSOC Mohali", "FIR 112/2022 PS Mataur"],
    agencies: ["Punjab Police AGTF", "Interpol Red Notice Desk"],
    notes: "Operates command infrastructure from Armenia; coordinates hit-squad contracts targeting Bishnoi syndicate operatives."
  },
  {
    id: "person_kaushal",
    canonical_name: "Kaushal Chaudhary",
    aliases: ["Kaushal Gurugram", "कौशल चौधरी"],
    orbit_level: 1,
    role: "Haryana Command Lieutenant",
    risk_score: 91,
    risk_tier: "critical",
    betweenness: 0.65,
    centrality_rank: 2,
    jurisdiction: "Haryana & Delhi NCR",
    city: "Gurugram",
    lat: 28.4595,
    lng: 77.0266,
    phones: ["+91-9812055411"],
    vehicles: ["HR-26-DK-9000"],
    firs: ["FIR 194/2020 PS Palam Vihar"],
    agencies: ["Haryana STF", "Delhi Police Crime Branch"],
    notes: "Heads NCR extortion operations; runs protection rackets across Gurugram real estate developers and toll plazas."
  },
  {
    id: "person_amit_dagar",
    canonical_name: "Amit Dagar",
    aliases: ["Dagar Gurugram", "अमित डागर"],
    orbit_level: 1,
    role: "Finance & Logistics Chief",
    risk_score: 84,
    risk_tier: "high",
    betweenness: 0.52,
    centrality_rank: 3,
    jurisdiction: "Haryana",
    city: "Gurugram",
    lat: 28.4595,
    lng: 77.0266,
    phones: ["+91-9811099234"],
    vehicles: ["HR-51-AB-1212"],
    firs: ["FIR 72/2021 PS DLF Phase 2"],
    agencies: ["Haryana STF"],
    notes: "Coordinates weapons caches and safe houses in Pataudi and Sohna."
  },
  {
    id: "person_budha",
    canonical_name: "Sukhpreet Singh",
    aliases: ["Budha", "सुखप्रीत सिंह"],
    orbit_level: 2,
    role: "Malwa Armed Wing Enforcer",
    risk_score: 82,
    risk_tier: "high",
    betweenness: 0.38,
    centrality_rank: 4,
    jurisdiction: "Punjab",
    city: "Moga",
    lat: 30.8165,
    lng: 75.1717,
    phones: ["+91-9876022119"],
    vehicles: ["PB-29-M-7700"],
    firs: ["FIR 88/2019 PS Kurali"],
    agencies: ["Punjab Police SSOC"],
    notes: "Extradited from Armenia; handled armed hit squads across Ludhiana and Moga."
  },
  {
    id: "person_arun_jatt",
    canonical_name: "Arun Choudhary",
    aliases: ["Jatt Samba", "अरुण जाट"],
    orbit_level: 2,
    role: "Highway Corridor Enforcer",
    risk_score: 74,
    risk_tier: "medium",
    betweenness: 0.28,
    centrality_rank: 5,
    jurisdiction: "J&K & Punjab",
    city: "Samba",
    lat: 32.5574,
    lng: 75.1189,
    phones: ["+91-9419088122"],
    vehicles: ["JK-21-C-4455"],
    firs: ["FIR 204/2022 PS Samba"],
    agencies: ["J&K Police", "Punjab Police"],
    notes: "Controls highway extortion checkpoints between Kathua, Samba, and Pathankot."
  }
];

export const LINKS_BAMBIHA = [
  { source: "person_lucky_patial", target: "person_kaushal", relationship: "Command Coordination", weight: 0.95 },
  { source: "person_lucky_patial", target: "person_budha", relationship: "Hit Directives", weight: 0.88 },
  { source: "person_kaushal", target: "person_amit_dagar", relationship: "Extortion Pooling", weight: 0.90 },
  { source: "person_amit_dagar", target: "person_arun_jatt", relationship: "Transit Conduit", weight: 0.72 }
];
