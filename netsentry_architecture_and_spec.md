# NetSentry — Criminal Network Intelligence Platform
## Smart India Hackathon (SIH 2026) Technical Specification & Architecture

### Executive Summary
**NetSentry** is an intelligence fusion and spatial analytics platform designed for state police forces and central intelligence agencies (NIA, IB, Narcotics Control Bureau, State Special Operation Cells). It transforms fragmented law enforcement records (FIRs, chargesheets, CDR logs, Hawala money trails, and field intelligence reports) into an interactive **3D spatial criminal intelligence graph**.

---

### Key Differentiators & Unique Selling Points (USPs)

#### USP 1: Automated Alias & Cross-Identity Resolution
- Discovers hidden identities, phonetic aliases ("Goldy", "Fauji", "Master"), pre-activated SIM profiles, and fake passport hashes across fragmented state police databases.
- Resolves disparate records into unified canonical suspect profiles with deterministic confidence scoring (`MATCHED`, `PARTIAL`, `UNMATCHED`).

#### USP 2: Cross-Jurisdiction Multi-Agency Linking
- Connects organized crime operations that deliberately cross state borders (e.g., Delhi Police Special Cell, Punjab Police AGTF, Haryana STF, UP STF).
- Links suspects through multi-signal evidence:
  1. **FIR & IPC Classification Similarity** (Jaccard tokenized overlap of criminal codes and offenses).
  2. **Semantic Modus Operandi Matching** (Client-side TF-IDF vectorizer analyzing narrative dossier notes and tactical patterns).
  3. **Multi-Agency Case Co-occurrence** (Detecting joint warrants and overlapping investigative scopes).
  4. **Syndicate & Cartel Nexus Affiliations** (Deterministic graph clustering of known gang alliances and transit corridors).

---

### Architectural Pipeline

```
┌────────────────────────┐
│ Raw LE Manifests       │ (CSV, JSON, FIR Blotters, CDR Logs)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Ingestion & Normalizer │ (RFC 4180 parsing, deduplication, schema alignment)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Identity Resolver      │ (Alias resolution, identity matching, cross-referencing)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Relationship Engine    │ (4-Signal multi-modal criminal affinity & link weights)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Spatial 3D Engine      │ (Deterministic UMAP/MDS projection, density clustering)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 3D Intelligence Graph  │ (Interactive Three.js WebGL canvas, dossiers, search fly-to)
└────────────────────────┘
```

---

### Data Schema Standard

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique intelligence record identifier |
| `name` / `canonical_name` | String | Primary suspect or entity name |
| `alias` | String | Operational handles, street monikers |
| `syndicate` | String | Criminal syndicate, gang, or cartel command anchor |
| `cell` | String | Operational module, tactical unit, or regional hub |
| `crime_category` | String | Offense classification (e.g. Arms Act, NDPS, Extortion) |
| `fir_number` | String | Formal First Information Report reference |
| `investigating_agency`| String | State police division or central agency |
| `jurisdiction` | String | Geographic operational zone |
| `threat_level` | String | Visual classification (`RED`, `ORANGE`, `YELLOW`) |
| `intelligence_notes` | String | Narrative dossier content vectorized by TF-IDF |

---

### Progressive 3D Navigation Model

1. **Level 1 (Macro Universe)**: High-altitude celestial cluster overview of interstate criminal networks with minimal clutter.
2. **Level 2 (Syndicate Command Cluster)**: Focus on a specific crime cartel and its inter-connected regional logistics wings.
3. **Level 3 (Operational Cell Hub)**: Concentric ring orbital view of tactical modules and operatives.
4. **Level 4 (Suspect Operative Node)**: Deep-dive dossier view showing verified links, multi-signal radar breakdowns, and evidence trails.
