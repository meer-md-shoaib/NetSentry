# NetSentry — Criminal Network Intelligence Platform
> **Smart India Hackathon (SIH 2026)** • Problem Statement: 26189

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://meer-md-shoaib.github.io/NetSentry/)
[![Status](https://img.shields.io/badge/Status-Operational-blue?style=for-the-badge)](https://meer-md-shoaib.github.io/NetSentry/)
[![Deployment](https://img.shields.io/badge/Deployment-Automated%20CI%2FCD-purple?style=for-the-badge&logo=githubactions)](https://github.com/meer-md-shoaib/NetSentry/actions)

🌐 **Live Application URL**: [https://meer-md-shoaib.github.io/NetSentry/](https://meer-md-shoaib.github.io/NetSentry/)

---

## 🎯 Core Unique Selling Points (USPs)

### 1. Automated Alias & Cross-Identity Resolution (USP 1)
- Identifies aliases, monikers, and phonetic variations across disparate state police registries.
- Resolves identities with deterministic confidence scoring (`MATCHED`, `PARTIAL`, `UNMATCHED`).
- Cross-references hard identifiers: CDR phone numbers, IMEI records, vehicle registrations, and financial accounts.

### 2. Cross-Jurisdiction Multi-Agency Linking (USP 2)
- Automatically detects links across inter-state crime syndicates operating between Delhi NCR, Punjab, Haryana, Rajasthan, Uttar Pradesh, and Maharashtra.
- Connects agencies: **Delhi Police Special Cell**, **Punjab Police AGTF**, **Haryana STF**, **UP STF**, **Maharashtra ATS**, **DRI**, and **NIA**.
- Multi-signal similarity combines FIR classifications, TF-IDF vectorized dossier text, joint chargesheets, and cartel logistics nexus.

---

## 🌐 3D Celestial Graph Features

- **Interactive 3D WebGL Canvas**: Pure Three.js engine with zero external framework dependencies.
- **2D / 3D Tactical Map Toggle**: Switch seamlessly between 3D deep space exploration and flattened 2D tactical maps.
- **Slide-Over Suspect Dossier**: Click on any suspect node to open full criminal intelligence dossiers with risk indexes, case references, phone numbers, and connected associates.
- **Instant Search & Fly-To Navigation**: Type any suspect name, alias, syndicate, FIR number, or jurisdiction to auto-complete and fly the camera directly to the entity.
- **Offline FIR / Manifest Ingestion**: Upload custom CSV or JSON intelligence manifests with RFC 4180 parsing and instant re-clustering.

---

## 📂 Sample Datasets

- `sample-data/netsentry_criminal_records.csv`: 30+ normalized law enforcement suspect records with IPC sections, threat levels, and FIR details.
- `sample-data/netsentry_interstate_syndicates.json`: 20 transnational and inter-state criminal dossiers with detailed modus operandi and intelligence notes.

---

## 🚀 Local Development

```bash
# Clone repository
git clone https://github.com/meer-md-shoaib/NetSentry.git
cd NetSentry

# Start any static HTTP server (e.g. Python)
python -m http.server 8080

# Open in browser
http://localhost:8080
```
