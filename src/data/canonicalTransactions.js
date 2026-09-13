/**
 * NetSentry — Canonical Financial Intelligence Unit (FIU) Transactions
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Labeled financial transactions simulating banking transactions,
 * mule accounts, and hawala settlement logs across Indian banks.
 */

export const CANONICAL_TRANSACTIONS = [
  {
    tx_id: "TXN-FIU-901",
    from_account: "AC-HDFC-99120",
    from_bank: "HDFC Bank (Pune Bund Garden)",
    to_account: "AC-ICIC-44011",
    to_bank: "ICICI Bank (Belgaum Market)",
    amount: 49500,
    timestamp: "2026-08-14T10:15:00Z",
    syndicate_id: "syn_telgi",
    narrative: "Counterfeit stamp vendor collection pass-through"
  },
  {
    tx_id: "TXN-FIU-902",
    from_account: "AC-HDFC-99120",
    from_bank: "HDFC Bank (Pune Bund Garden)",
    to_account: "AC-ICIC-44011",
    to_bank: "ICICI Bank (Belgaum Market)",
    amount: 49800,
    timestamp: "2026-08-14T10:45:00Z",
    syndicate_id: "syn_telgi",
    narrative: "Smurfing second tranche under Rule 114B limit"
  },
  {
    tx_id: "TXN-FIU-903",
    from_account: "AC-SBIN-88129",
    from_bank: "SBI (Mumbai Pydhonie)",
    to_account: "AC-KOTK-33100",
    to_bank: "Kotak Mahindra (Surat Ring Road)",
    amount: 3500000,
    timestamp: "2026-08-20T14:30:00Z",
    syndicate_id: "syn_dwest",
    narrative: "Synthetic narcotic container transit clearance"
  },
  {
    tx_id: "TXN-FIU-904",
    from_account: "AC-PAYT-11009",
    from_bank: "Paytm Payments Bank (Bharatpur)",
    to_account: "AC-AIRT-77221",
    to_bank: "Airtel Payments Bank (Jamtara)",
    amount: 25000,
    timestamp: "2026-09-01T09:12:00Z",
    syndicate_id: "syn_cyber",
    narrative: "Phishing utility bill scam victim auto-sweep"
  },
  {
    tx_id: "TXN-FIU-905",
    from_account: "AC-PNB-66012",
    from_bank: "Punjab National Bank (Amritsar)",
    to_account: "AC-SBIN-99331",
    to_bank: "SBI (Ferozepur Cantt)",
    amount: 1200000,
    timestamp: "2026-09-05T18:40:00Z",
    syndicate_id: "syn_punjab",
    narrative: "Border drone payload receiver courier payment"
  }
];
