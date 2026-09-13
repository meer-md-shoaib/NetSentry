/**
 * NetSentry — Indian Geographic Transit Corridors & Police Jurisdictions
 * Maps spatial coordinates for LEA state headquarters, transit choke-points,
 * and cross-border criminal conduits across India.
 */

export const INDIAN_POLICE_HUBS = {
  pune: { name: "Pune CID & Bund Garden PS", state: "Maharashtra", lat: 18.5204, lng: 73.8567, x: 260, y: 440 },
  mumbai: { name: "Mumbai ATS & Crime Branch", state: "Maharashtra", lat: 19.0760, lng: 72.8777, x: 230, y: 410 },
  bangalore: { name: "Bangalore SIT & Cubbon Park PS", state: "Karnataka", lat: 12.9716, lng: 77.5946, x: 310, y: 560 },
  belgaum: { name: "Belgaum Market PS", state: "Karnataka", lat: 15.8497, lng: 74.4977, x: 275, y: 495 },
  delhi: { name: "Delhi Police Special Cell", state: "Delhi NCR", lat: 28.6139, lng: 77.2090, x: 320, y: 220 },
  bathinda: { name: "Punjab AGTF Bathinda Hub", state: "Punjab", lat: 30.2110, lng: 74.9455, x: 280, y: 180 },
  sonipat: { name: "Haryana STF Sonipat Module", state: "Haryana", lat: 28.9931, lng: 77.0151, x: 315, y: 210 },
  bharatpur: { name: "Mewat Cyber Cell Bharatpur", state: "Rajasthan", lat: 27.2152, lng: 77.5030, x: 330, y: 250 },
  jamtara: { name: "Jamtara Cyber Crime Police Station", state: "Jharkhand", lat: 23.9629, lng: 86.8028, x: 500, y: 320 },
  amritsar: { name: "Amritsar Border Narcotics Sector", state: "Punjab", lat: 31.6340, lng: 74.8723, x: 270, y: 150 },
  ferozepur: { name: "Ferozepur BSF Drop Intercept Hub", state: "Punjab", lat: 30.9237, lng: 74.6114, x: 265, y: 165 },
  surat: { name: "Surat Diamond Hawala Unit", state: "Gujarat", lat: 21.1702, lng: 72.8311, x: 225, y: 365 },
  kolhapur: { name: "Kolhapur Toll Checkpoint (Kagal)", state: "Maharashtra", lat: 16.7050, lng: 74.2433, x: 270, y: 480 },
  hubli: { name: "Hubli Junction Intercept Desk", state: "Karnataka", lat: 15.3647, lng: 75.1240, x: 285, y: 510 }
};

export const INTERSTATE_CORRIDORS = [
  {
    id: "corridor_mh_ka",
    name: "NH-48 Golden Quadrilateral (Pune ⟷ Belgaum ⟷ Bangalore)",
    from: "pune",
    to: "belgaum",
    syndicateId: "syn_telgi",
    type: "Counterfeit Paper & Hawala Transit",
    risk: "CRITICAL"
  },
  {
    id: "corridor_ka_south",
    name: "Belgaum ⟷ Hubli ⟷ Bangalore Transit Conduit",
    from: "belgaum",
    to: "bangalore",
    syndicateId: "syn_telgi",
    type: "Distribution & Cash Relay",
    risk: "HIGH"
  },
  {
    id: "corridor_mh_gj",
    name: "Mumbai ⟷ Surat Coastal Contraband Axis",
    from: "mumbai",
    to: "surat",
    syndicateId: "syn_dwest",
    type: "Synthetic Narcotics & Hawala Layering",
    risk: "CRITICAL"
  },
  {
    id: "corridor_ncr_pb",
    name: "GT Road Axis (Delhi NCR ⟷ Sonipat ⟷ Bathinda)",
    from: "delhi",
    to: "bathinda",
    syndicateId: "syn_ncr",
    type: "Illegal Weapon Consignments & Hit Squads",
    risk: "CRITICAL"
  },
  {
    id: "corridor_mewat_cyber",
    name: "Bharatpur (Mewat) ⟷ Jamtara Mule Financial Tunnel",
    from: "bharatpur",
    to: "jamtara",
    syndicateId: "syn_cyber",
    type: "Mule Account Clearing & Phishing Cashouts",
    risk: "HIGH"
  },
  {
    id: "corridor_punjab_border",
    name: "IB Drone Payload Corridor (Amritsar ⟷ Ferozepur)",
    from: "amritsar",
    to: "ferozepur",
    syndicateId: "syn_punjab",
    type: "Night Drone Contraband Recoveries",
    risk: "CRITICAL"
  }
];
