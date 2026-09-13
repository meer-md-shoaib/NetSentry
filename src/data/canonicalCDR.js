/**
 * NetSentry — Canonical Intercepted Call Detail Records (CDRs)
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 */

export const CANONICAL_CDRS = [
  {
    call_id: "CDR-MH-001",
    caller_msisdn: "+91-9822019900",
    called_number: "+91-9844055211",
    duration_sec: 24,
    cell_tower_id: "TOWER-PUNE-BUND-GARDEN-04",
    timestamp: "2026-08-10T11:20:12Z",
    syndicate_id: "syn_telgi"
  },
  {
    call_id: "CDR-MH-002",
    caller_msisdn: "+91-9822019900",
    called_number: "+91-9844055211",
    duration_sec: 18,
    cell_tower_id: "TOWER-PUNE-BUND-GARDEN-04",
    timestamp: "2026-08-10T11:25:40Z",
    syndicate_id: "syn_telgi"
  },
  {
    call_id: "CDR-MH-003",
    caller_msisdn: "+91-9822019900",
    called_number: "+91-9820033100",
    duration_sec: 145,
    cell_tower_id: "TOWER-PUNE-RAILWAY-01",
    timestamp: "2026-08-11T16:10:00Z",
    syndicate_id: "syn_telgi"
  },
  {
    call_id: "CDR-NCR-101",
    caller_msisdn: "+1-647-882-9901",
    called_number: "+91-9812033990",
    duration_sec: 32,
    cell_tower_id: "TOWER-DELHI-LODHI-02",
    timestamp: "2026-08-15T22:04:19Z",
    syndicate_id: "syn_ncr"
  }
];
