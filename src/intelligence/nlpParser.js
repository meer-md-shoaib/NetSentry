/**
 * NetSentry — Automated FIR Narrative NLP Entity Extractor
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Extracts structured intelligence signals from unstructured police case summaries:
 * - Indian Telecom MSISDNs (+91-98...)
 * - Indian State Vehicle Registration Plates (MH-12-Q-4004, KA-01-M-9912...)
 * - Indian Penal Code (IPC / UAPA / MCOCA) Sections
 * - Accused Aliases & Pseudonyms (urff / a.k.a / alias)
 * - Bank Accounts & Hawala Transfer Tokens
 */

export function extractEntitiesFromNarrative(text) {
  if (!text) return null;

  // 1. Phone numbers (Indian 10-digit, with optional +91 or 0 prefix)
  const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}/g;
  const rawPhones = text.match(phoneRegex) || [];
  const phones = [...new Set(rawPhones.map((p) => p.replace(/[\-\s]/g, '')))];

  // 2. Vehicle Registration Plates (Standard Indian RTO format)
  const plateRegex = /[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}/gi;
  const rawPlates = text.match(plateRegex) || [];
  const vehicles = [...new Set(rawPlates.map((v) => v.toUpperCase().replace(/\s+/g, '-')))];

  // 3. IPC & Special Law Sections
  const ipcRegex = /(?:IPC\s*(?:Section|Sec\.?)?\s*|\bSec\.?\s*)(\d+[A-Z]?)|UAPA|MCOCA|NDPS\s*(?:Act)?/gi;
  const rawLaws = text.match(ipcRegex) || [];
  const legalSections = [...new Set(rawLaws.map((l) => l.toUpperCase().trim()))];

  // 4. Aliases (Patterns: "alias X", "a.k.a X", "urff X", "alias @ X")
  const aliasRegex = /(?:alias|a\.k\.a\.?|urff|alias\s+as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
  const aliases = [];
  let match;
  while ((match = aliasRegex.exec(text)) !== null) {
    if (match[1]) aliases.push(match[1].trim());
  }

  // 5. Bank Account Numbers & IFSC Tokens
  const bankRegex = /\b\d{9,18}\b|[A-Z]{4}0[A-Z0-9]{6}/g;
  const rawBanks = text.match(bankRegex) || [];
  const financialTokens = [...new Set(rawBanks)];

  return {
    phones,
    vehicles,
    legalSections,
    aliases: [...new Set(aliases)],
    financialTokens,
    extractionTimestamp: new Date().toISOString()
  };
}
