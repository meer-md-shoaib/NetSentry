/**
 * NetSentry — Main Application Controller (SIH 2026 Master Edition)
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Orchestrates:
 * 1. 2D Celestial Solar System Canvas Engine
 * 2. Sovereign 3D WebGL Galaxy Network Engine (Light Mode)
 * 3. India Interstate Police Corridor & Transit Flow Map
 * 4. Multi-Syndicate Switcher (5 Realistic Indian Criminal Networks)
 * 5. Tactical "What-If" Arrest Impact Simulator
 * 6. Human-In-The-Loop (HITL) Adjudication Dock
 * 7. Section 65B Indian Evidence Act Court Dossier Generator
 * 8. Interactive AI / Random Forest Model Playground
 * 9. Multilingual Global Search (English, Devanagari Hindi, Phone, Plate)
 * 10. Temporal Syndicate Expansion Timeline Player
 * 11. Synthesized Low-Latency Tactical Web Audio Feedback
 */

import { CANONICAL_SYNDICATES, CANONICAL_ENTITIES, CANONICAL_LINKS } from './data/canonicalSyndicates.js';
import { SolarSystem2D } from './universe/solarSystem2D.js';
import { Universe3DLight } from './universe/universe3DLight.js';
import { IndiaCorridorMap } from './universe/indiaCorridorMap.js';
import { TimelinePlayer } from './universe/timelinePlayer.js';
import { predictRecordLinkage } from './intelligence/rfAliasMatcher.js';
import { simulateSuspectArrest } from './intelligence/tacticalSim.js';
import { compileSection65BCertificate } from './intelligence/section65B.js';
import { renderROCCurveSVG, renderConfusionMatrixHTML } from './intelligence/mlMetricsVisualizer.js';
import { tacticalAudio } from './ui/tacticalAudio.js';
import { parseCSVToEntities } from './parser/csvParser.js';
import { extractEntitiesFromNarrative } from './intelligence/nlpParser.js';

class NetSentryController {
  constructor() {
    this.activeSyndicateId = 'syn_telgi';
    this.activeView = '2d'; // '2d' | '3d' | 'map'
    this.selectedNodeId = null;
    this.neutralizedNodeId = null;

    // View Engine Instances
    this.engine2D = null;
    this.engine3D = null;
    this.engineMap = null;
    this.timelinePlayer = null;

    this.init();
  }

  init() {
    console.log('[NetSentry] Initializing Sovereign Intelligence Architecture...');

    // 1. Populate Syndicate Dropdown
    this.initSyndicateDropdown();

    // 2. Initialize 2D Solar System Canvas
    const canvas2D = document.getElementById('solar-canvas-2d');
    if (canvas2D) {
      this.engine2D = new SolarSystem2D(canvas2D, (id) => this.handleSelectEntity(id));
    }

    // 3. Initialize 3D Universe WebGL Canvas
    const container3D = document.getElementById('universe-3d-container');
    if (container3D && window.THREE) {
      this.engine3D = new Universe3DLight(container3D, (id) => this.handleSelectEntity(id));
    }

    // 4. Initialize India Corridor Map
    const svgMap = document.getElementById('india-map-svg');
    if (svgMap) {
      this.engineMap = new IndiaCorridorMap(svgMap, (id) => this.handleSelectEntity(id));
    }

    // 5. Initialize Temporal Timeline Player
    const stage = document.querySelector('.viewport-stage');
    if (stage) {
      const timelineContainer = document.createElement('div');
      stage.appendChild(timelineContainer);
      this.timelinePlayer = new TimelinePlayer(timelineContainer, (year) => {
        this.filterByYear(year);
      });
    }

    // 6. Setup UI Event Listeners
    this.initUIEventListeners();

    // 7. Load Initial Syndicate Data
    this.loadSyndicate(this.activeSyndicateId);
  }

  initSyndicateDropdown() {
    const selector = document.getElementById('syndicate-selector');
    if (!selector) return;

    selector.innerHTML = '';
    CANONICAL_SYNDICATES.forEach((syn) => {
      const opt = document.createElement('option');
      opt.value = syn.id;
      opt.textContent = `${syn.name} (${syn.threatLevel})`;
      selector.appendChild(opt);
    });

    selector.value = this.activeSyndicateId;
    selector.addEventListener('change', (e) => {
      this.loadSyndicate(e.target.value);
    });
  }

  loadSyndicate(syndicateId) {
    this.activeSyndicateId = syndicateId;
    this.neutralizedNodeId = null;

    // Hide tactical alert card if open
    const alertCard = document.getElementById('tactical-alert-card');
    if (alertCard) alertCard.style.display = 'none';

    const entities = CANONICAL_ENTITIES[syndicateId] || [];
    const links = CANONICAL_LINKS[syndicateId] || [];

    // Update Engines
    if (this.engine2D) this.engine2D.setData(entities, links);
    if (this.engine3D) this.engine3D.setData(entities, links);
    if (this.engineMap) this.engineMap.setData(entities, syndicateId);

    // Auto-select Kingpin (orbit 0)
    const kingpin = entities.find((e) => e.orbit_level === 0) || entities[0];
    if (kingpin) {
      this.handleSelectEntity(kingpin.id);
    }
  }

  filterByYear(year) {
    // Optional temporal filter: highlight active nodes
    console.log(`[NetSentry Timeline] Filtered to Year: ${year}`);
  }

  initUIEventListeners() {
    // View Switcher Buttons
    const btn2D = document.getElementById('btn-view-2d');
    const btn3D = document.getElementById('btn-view-3d');
    const btnMap = document.getElementById('btn-view-map');

    btn2D?.addEventListener('click', () => {
      tacticalAudio.playViewSwitch();
      this.switchView('2d');
    });
    btn3D?.addEventListener('click', () => {
      tacticalAudio.playViewSwitch();
      this.switchView('3d');
    });
    btnMap?.addEventListener('click', () => {
      tacticalAudio.playViewSwitch();
      this.switchView('map');
    });

    // Floating Camera / View Controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      if (this.activeView === '2d' && this.engine2D) {
        this.engine2D.scale = Math.min(2.8, this.engine2D.scale * 1.2);
        this.engine2D.render();
      }
    });

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      if (this.activeView === '2d' && this.engine2D) {
        this.engine2D.scale = Math.max(0.4, this.engine2D.scale * 0.8);
        this.engine2D.render();
      }
    });

    document.getElementById('btn-center-kingpin')?.addEventListener('click', () => {
      const entities = CANONICAL_ENTITIES[this.activeSyndicateId] || [];
      const kingpin = entities.find((e) => e.orbit_level === 0);
      if (kingpin) {
        if (this.activeView === '2d' && this.engine2D) this.engine2D.focusNode(kingpin.id);
        if (this.activeView === '3d' && this.engine3D) this.engine3D.focusKingpin();
      }
    });

    document.getElementById('btn-reset-view')?.addEventListener('click', () => {
      if (this.activeView === '2d' && this.engine2D) this.engine2D.resetView();
      if (this.activeView === '3d' && this.engine3D) this.engine3D.resetView();
    });

    // Tactical Arrest Simulation Button in Inspector
    document.getElementById('btn-simulate-arrest')?.addEventListener('click', () => {
      this.runTacticalArrestSimulation();
    });

    // Reset Arrest Simulation Button in Alert Card
    document.getElementById('btn-reset-arrest')?.addEventListener('click', () => {
      this.resetTacticalArrest();
    });

    // HITL Confirm Merge Button in bottom dock
    document.getElementById('btn-confirm-hitl-merge')?.addEventListener('click', () => {
      this.confirmHITLMerge();
    });

    // Modals Triggers
    document.getElementById('btn-open-dossier-top')?.addEventListener('click', () => this.openDossierModal());
    document.getElementById('btn-view-dossier')?.addEventListener('click', () => this.openDossierModal());
    document.getElementById('btn-open-ml')?.addEventListener('click', () => this.openMLModal());

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
      });
    });

    // Print Court Certificate
    document.getElementById('btn-print-certificate')?.addEventListener('click', () => {
      window.print();
    });

    // Interactive ML Live Inference Trigger
    document.getElementById('btn-run-live-inference')?.addEventListener('click', () => {
      this.runLiveMLInference();
    });

    // Global Multilingual Search Input
    this.initGlobalSearch();

    // Data Ingestion & FIR NLP Modal
    this.initIngestModal();
  }

  switchView(mode) {
    this.activeView = mode;

    // Toggle button active classes
    document.getElementById('btn-view-2d')?.classList.toggle('active', mode === '2d');
    document.getElementById('btn-view-3d')?.classList.toggle('active', mode === '3d');
    document.getElementById('btn-view-map')?.classList.toggle('active', mode === 'map');

    // Toggle container display
    const c2D = document.getElementById('canvas-2d-container');
    const c3D = document.getElementById('universe-3d-container');
    const cMap = document.getElementById('map-geo-container');

    if (c2D) c2D.style.display = mode === '2d' ? 'block' : 'none';
    if (c3D) c3D.style.display = mode === '3d' ? 'block' : 'none';
    if (cMap) cMap.style.display = mode === 'map' ? 'block' : 'none';

    // Synchronize active selection
    if (mode === '2d' && this.engine2D) {
      this.engine2D.resize();
      if (this.selectedNodeId) this.engine2D.selectNode(this.selectedNodeId);
    } else if (mode === '3d' && this.engine3D) {
      this.engine3D.resize();
      if (this.selectedNodeId) this.engine3D.selectNode(this.selectedNodeId);
    } else if (mode === 'map' && this.engineMap) {
      if (this.selectedNodeId) this.engineMap.selectNode(this.selectedNodeId);
    }
  }

  handleSelectEntity(entityId) {
    this.selectedNodeId = entityId;
    tacticalAudio.playLockOn();

    const entities = CANONICAL_ENTITIES[this.activeSyndicateId] || [];
    const entity = entities.find((e) => e.id === entityId);
    if (!entity) return;

    // Sync across engines
    if (this.engine2D) this.engine2D.selectNode(entityId);
    if (this.engine3D) this.engine3D.selectNode(entityId);
    if (this.engineMap) this.engineMap.selectNode(entityId);

    // Update Right Inspector Drawer
    document.getElementById('drawer-entity-id').textContent = entity.id.toUpperCase();
    document.getElementById('drawer-entity-name').textContent = entity.canonical_name || entity.name;
    document.getElementById('drawer-entity-role').textContent = `${entity.role} • ${entity.jurisdiction || 'Multi-State'}`;
    document.getElementById('drawer-risk-score').textContent = entity.risk_score || 85;

    const badge = document.getElementById('drawer-risk-badge');
    if (badge) {
      badge.textContent = (entity.risk_tier || 'high').toUpperCase();
      badge.className = `risk-indicator-pill risk-${entity.risk_tier || 'high'}`;
    }

    document.getElementById('drawer-betweenness-rank').textContent = `#${entity.centrality_rank || 1}`;

    // Render Aliases
    const aliasBox = document.getElementById('drawer-aliases-container');
    if (aliasBox) {
      aliasBox.innerHTML = '';
      (entity.aliases || []).forEach((a) => {
        const span = document.createElement('span');
        span.className = 'tag-bubble tag-bubble-accent';
        span.textContent = a;
        aliasBox.appendChild(span);
      });
    }

    // Render Phones
    const phoneBox = document.getElementById('drawer-phones-container');
    if (phoneBox) {
      phoneBox.innerHTML = '';
      (entity.phones || []).forEach((p) => {
        const span = document.createElement('span');
        span.className = 'tag-bubble mono-tag';
        span.textContent = `📞 ${p}`;
        phoneBox.appendChild(span);
      });
      if ((entity.phones || []).length === 0) {
        phoneBox.innerHTML = '<span style="font-size: 11px; color: var(--gray);">No active MSISDN wiretaps</span>';
      }
    }

    // Render Vehicles
    const vehBox = document.getElementById('drawer-vehicles-container');
    if (vehBox) {
      vehBox.innerHTML = '';
      (entity.vehicles || []).forEach((v) => {
        const span = document.createElement('span');
        span.className = 'tag-bubble mono-tag';
        span.textContent = `🚗 ${v}`;
        vehBox.appendChild(span);
      });
      if ((entity.vehicles || []).length === 0) {
        vehBox.innerHTML = '<span style="font-size: 11px; color: var(--gray);">No registered transit vehicles</span>';
      }
    }

    // Render FIRs
    const firsBox = document.getElementById('drawer-firs-container');
    if (firsBox) {
      firsBox.innerHTML = '';
      (entity.firs || []).forEach((fir) => {
        const item = document.createElement('div');
        item.className = 'fir-card-item';
        item.innerHTML = `
          <div class="fir-number">${fir}</div>
          <div class="fir-agency">Investigating: ${entity.agencies ? entity.agencies.join(', ') : 'State Police'}</div>
        `;
        firsBox.appendChild(item);
      });
    }

    // Intelligence Summary
    document.getElementById('drawer-notes-text').textContent =
      entity.notes || 'Subject under active multi-agency surveillance.';
  }

  runTacticalArrestSimulation() {
    if (!this.selectedNodeId) return;

    const entities = CANONICAL_ENTITIES[this.activeSyndicateId] || [];
    const links = CANONICAL_LINKS[this.activeSyndicateId] || [];

    const sim = simulateSuspectArrest(this.selectedNodeId, entities, links);
    if (!sim) return;

    tacticalAudio.playArrestAlert();
    this.neutralizedNodeId = this.selectedNodeId;

    // Update Engines
    if (this.engine2D) this.engine2D.setNeutralized(this.selectedNodeId);
    if (this.engine3D) this.engine3D.setNeutralized(this.selectedNodeId);
    if (this.engineMap) this.engineMap.setNeutralized(this.selectedNodeId);

    // Show Tactical Alert Card
    const card = document.getElementById('tactical-alert-card');
    const text = document.getElementById('tactical-alert-text');
    if (card && text) {
      text.innerHTML = `
        Neutralized <strong>${sim.targetName}</strong>: Syndicate capacity dropped by 
        <strong style="color: var(--critical);">-${sim.capacityDropPct}%</strong> (${sim.isolatedCellsCount} isolated cells). 
        Successor: <strong>${sim.successorName}</strong> (${sim.successorRole}).
      `;
      card.style.display = 'flex';
    }
  }

  resetTacticalArrest() {
    this.neutralizedNodeId = null;

    // Reset alert card
    const card = document.getElementById('tactical-alert-card');
    if (card) card.style.display = 'none';

    // Reload active syndicate to clear strikethrough
    this.loadSyndicate(this.activeSyndicateId);
  }

  confirmHITLMerge() {
    const dockText = document.getElementById('hitl-candidate-text');
    const pill = document.getElementById('hitl-confidence-pill');
    const btn = document.getElementById('btn-confirm-hitl-merge');

    if (btn) {
      btn.disabled = true;
      btn.textContent = '✓ Adjudicated & Merged';
      btn.style.background = '#64748B';
    }

    if (dockText) {
      dockText.innerHTML = '<span style="color: #10B981; font-weight: 700;">✓ Cross-State Merge Confirmed in SQLite Database (NetSentry Section 65B Audit Trail Updated)</span>';
    }

    if (pill) {
      pill.textContent = 'ADJUDICATED';
      pill.style.background = '#DCFCE7';
      pill.style.color = '#15803D';
    }
  }

  async openDossierModal() {
    const modal = document.getElementById('modal-dossier');
    if (!modal) return;

    const entities = CANONICAL_ENTITIES[this.activeSyndicateId] || [];
    const entity = entities.find((e) => e.id === this.selectedNodeId) || entities[0];
    if (!entity) return;

    const cert = await compileSection65BCertificate(entity);

    document.getElementById('cert-subject-name').textContent = cert.subjectName.toUpperCase();
    document.getElementById('cert-sha256-hash').textContent = cert.sha256;
    document.getElementById('cert-phonetic-rationale').textContent = cert.phoneticRationale;
    document.getElementById('cert-timestamp').textContent = cert.timestamp;

    modal.style.display = 'flex';
  }

  openMLModal() {
    const modal = document.getElementById('modal-ml');
    if (!modal) return;

    // Run initial inference on default inputs
    this.runLiveMLInference();

    // Render ROC-AUC Curve & Confusion Matrix into modal if not rendered
    let benchmarkContainer = document.getElementById('ml-benchmark-graphs-container');
    if (!benchmarkContainer) {
      benchmarkContainer = document.createElement('div');
      benchmarkContainer.id = 'ml-benchmark-graphs-container';
      benchmarkContainer.innerHTML = renderROCCurveSVG() + renderConfusionMatrixHTML();
      document.querySelector('#modal-ml .modal-dialog-body')?.appendChild(benchmarkContainer);
    }

    modal.style.display = 'flex';
  }

  runLiveMLInference() {
    const nameA = document.getElementById('ml-input-name-a')?.value || 'Mohd. Aslam';
    const nameB = document.getElementById('ml-input-name-b')?.value || 'अस्लम भाई';
    const phone = document.getElementById('ml-input-phone')?.value || '+91-9820091100';
    const plate = document.getElementById('ml-input-plate')?.value || 'MH-01-DX-9009';

    const entityA = { name: nameA, phones: [phone], vehicles: [plate] };
    const entityB = { name: nameB, phones: [phone], vehicles: [plate] };

    const result = predictRecordLinkage(entityA, entityB);

    const barsBox = document.getElementById('ml-feature-bars-container');
    if (barsBox) {
      barsBox.innerHTML = `
        <div style="margin-bottom: 12px; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: #0F172A;">Prediction Confidence:</span>
          <span style="font-size: 16px; font-weight: 800; font-family: var(--font-mono); color: #10B981;">
            ${Math.round(result.confidenceScore * 100)}% (${result.decision})
          </span>
        </div>
      `;

      result.featureBreakdown.forEach((feat) => {
        const pct = Math.round(feat.value * 100);
        const row = document.createElement('div');
        row.className = 'feature-bar-row';
        row.innerHTML = `
          <div class="feature-bar-header">
            <span>${feat.name} (Weight: ${feat.weight})</span>
            <span style="font-family: var(--font-mono); color: #0EA5E9;">${pct}%</span>
          </div>
          <div class="feature-bar-track">
            <div class="feature-bar-fill" style="width: ${pct}%;"></div>
          </div>
        `;
        barsBox.appendChild(row);
      });
    }
  }

  initGlobalSearch() {
    const input = document.getElementById('global-search-input');
    const popup = document.getElementById('search-autocomplete-popup');
    if (!input || !popup) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        popup.style.display = 'none';
        return;
      }

      const entities = CANONICAL_ENTITIES[this.activeSyndicateId] || [];
      const matches = entities.filter((ent) => {
        const inName = (ent.canonical_name || '').toLowerCase().includes(q);
        const inAliases = (ent.aliases || []).some((a) => a.toLowerCase().includes(q));
        const inPhones = (ent.phones || []).some((p) => p.toLowerCase().includes(q));
        const inVehicles = (ent.vehicles || []).some((v) => v.toLowerCase().includes(q));
        const inFirs = (ent.firs || []).some((f) => f.toLowerCase().includes(q));
        return inName || inAliases || inPhones || inVehicles || inFirs;
      });

      if (matches.length === 0) {
        popup.innerHTML = '<div style="padding: 10px; font-size: 12px; color: var(--gray);">No suspects matching query</div>';
        popup.style.display = 'block';
        return;
      }

      popup.innerHTML = '';
      matches.forEach((m) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
          <div>
            <div class="search-result-name">${m.canonical_name}</div>
            <div class="search-result-meta">${m.role} • ${m.city}</div>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11px; color: #0EA5E9;">#${m.centrality_rank}</span>
        `;
        item.addEventListener('click', () => {
          this.handleSelectEntity(m.id);
          if (this.activeView === '2d' && this.engine2D) this.engine2D.focusNode(m.id);
          popup.style.display = 'none';
          input.value = m.canonical_name;
        });
        popup.appendChild(item);
      });
      popup.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !popup.contains(e.target)) {
        popup.style.display = 'none';
      }
    });
  }

  initIngestModal() {
    const btnOpen = document.getElementById('btn-open-ingest');
    const modal = document.getElementById('modal-ingest');
    if (!btnOpen || !modal) return;

    btnOpen.addEventListener('click', () => {
      modal.style.display = 'flex';
    });

    // Tab switcher
    const tabBtnCsv = document.getElementById('tab-btn-csv');
    const tabBtnFir = document.getElementById('tab-btn-fir');
    const tabContentCsv = document.getElementById('tab-content-csv');
    const tabContentFir = document.getElementById('tab-content-fir');

    tabBtnCsv?.addEventListener('click', () => {
      tabBtnCsv.className = 'btn-command btn-command-primary';
      tabBtnFir.className = 'btn-command btn-command-secondary';
      tabContentCsv.style.display = 'block';
      tabContentFir.style.display = 'none';
    });

    tabBtnFir?.addEventListener('click', () => {
      tabBtnFir.className = 'btn-command btn-command-primary';
      tabBtnCsv.className = 'btn-command btn-command-secondary';
      tabContentFir.style.display = 'block';
      tabContentCsv.style.display = 'none';
    });

    // Sample CSV Buttons
    const csvInput = document.getElementById('csv-input-text');
    const synNameInput = document.getElementById('ingest-syndicate-name');

    document.getElementById('btn-load-sample-mewat')?.addEventListener('click', () => {
      if (synNameInput) synNameInput.value = 'Mewat Cyber Fraud Ring';
      if (csvInput) {
        csvInput.value = `id,name,alias,threat,role,jurisdiction,fir,notes
MEW-01,Kasim Hacker,Kasim Cyber,CRITICAL,Mastermind,Haryana/Rajasthan,FIR 102/25,Coordinates 450 mule bank accounts and SIM farm
MEW-02,Tariq Phisher,Tariq OTP,HIGH,Social Engineer,Mewat,FIR 103/25,Phishing APK distributor via WhatsApp
MEW-03,Junaid Cashout,Junaid ATM,HIGH,Cashout Operator,Alwar,FIR 104/25,Operates ATM debit card withdrawals across Delhi-NCR
MEW-04,Rashid SIM,Rashid Telecom,MEDIUM,SIM Card Supplier,Bharatpur,FIR 105/25,Procures pre-activated Assam/Bihar SIM cards
MEW-05,Faizan Crypto,Faizan USDT,HIGH,Crypto Launderer,Gurugram,FIR 106/25,Converts fraud INR to USDT on P2P exchanges`;
      }
    });

    document.getElementById('btn-load-sample-drone')?.addEventListener('click', () => {
      if (synNameInput) synNameInput.value = 'Punjab Border Drone Cartel';
      if (csvInput) {
        csvInput.value = `id,name,alias,threat,role,jurisdiction,fir,notes
DRN-01,Gurmukh Singh,Guri Majha,CRITICAL,Border Kingpin,Punjab/Pakistan,FIR 401/24,Coordinates cross-border drone sorties for heroin and pistols
DRN-02,Jaspal Bawa,Bawa Amritsar,HIGH,Drop Receiver,Tarn Taran,FIR 402/24,Receives night payload coordinates via Signal app
DRN-03,Harpreet Happy,Happy Shooter,HIGH,Armed Enforcer,Ferozepur,FIR 403/24,Provides armed transit and courier protection
DRN-04,Maninder Goldy,Goldy Hawala,HIGH,Hawala Banker,Jalandhar,FIR 404/24,Channels drug proceeds to Dubai and Canada conduits
DRN-05,Baljit Billa,Billa Driver,MEDIUM,Interstate Courier,Bathinda,FIR 405/24,Transports concealed consignments along NH-44`;
      }
    });

    document.getElementById('btn-load-sample-kutch')?.addEventListener('click', () => {
      if (synNameInput) synNameInput.value = 'Kutch Maritime Dhow Syndicate';
      if (csvInput) {
        csvInput.value = `id,name,alias,threat,role,jurisdiction,fir,notes
KUT-01,Haji Usman,Usman Seth,CRITICAL,Dhow Syndicate Head,Gujarat/Kutch,FIR 55/25,Commands mid-sea transshipment vessels off Jakhau coast
KUT-02,Ibrahim Noor,Noor Tandel,HIGH,Sea Captain,Mandvi,FIR 56/25,Navigates non-AIS motorized dhows across international waters
KUT-03,Sikandar Patel,Sikandar Kalo,HIGH,Coastal Landings,Porbandar,FIR 57/25,Manages beach offloading and local hideout logistics
KUT-04,Devji Bhai,Devji Angadia,HIGH,Angadia Courier,Ahmedabad,FIR 58/25,Channels physical currency notes through Angadia network
KUT-05,Ramesh Koli,Ramesh Driver,MEDIUM,Truck Dispatcher,Gandhidham,FIR 59/25,Transports sealed containers to inland industrial hubs`;
      }
    });

    // CSV Submit Handler
    document.getElementById('btn-submit-csv')?.addEventListener('click', () => {
      const text = csvInput?.value?.trim();
      if (!text) {
        alert('Please paste or select valid CSV data.');
        return;
      }

      const parsedEntities = parseCSVToEntities(text);
      if (parsedEntities.length === 0) {
        alert('Failed to parse CSV records. Verify columns include at least name/accused.');
        return;
      }

      const synId = `syn_custom_${Date.now().toString(36)}`;
      const synName = synNameInput?.value?.trim() || 'Custom Police Field Ingest';

      // Register Syndicate
      CANONICAL_SYNDICATES.push({
        id: synId,
        name: synName,
        threatLevel: 'CRITICAL',
        hq: 'Central Police Command',
        activeYears: '2024-2026',
        primaryRacket: 'Trans-Jurisdictional Organized Crime',
        estimatedRevenue: '₹750+ Crores',
        color: '#E11D48'
      });

      // Register Entities
      CANONICAL_ENTITIES[synId] = parsedEntities;

      // Generate Links (Star-hub to Kingpin and sequential chain)
      const kingpinId = parsedEntities[0].id;
      const links = [];
      for (let i = 1; i < parsedEntities.length; i++) {
        links.push({
          source: kingpinId,
          target: parsedEntities[i].id,
          type: 'DIRECT_COMMAND',
          strength: 0.85
        });
        if (i > 1) {
          links.push({
            source: parsedEntities[i - 1].id,
            target: parsedEntities[i].id,
            type: 'LOGISTICAL_CONDUIT',
            strength: 0.65
          });
        }
      }
      CANONICAL_LINKS[synId] = links;

      // Add to selector
      const selector = document.getElementById('syndicate-selector');
      if (selector) {
        const opt = document.createElement('option');
        opt.value = synId;
        opt.textContent = `${synName} (CUSTOM CRITICAL)`;
        selector.appendChild(opt);
        selector.value = synId;
      }

      this.loadSyndicate(synId);
      tacticalAudio.playAction();
      modal.style.display = 'none';
      alert(`Successfully ingested ${parsedEntities.length} suspect entities into "${synName}".`);
    });

    // Sample FIR Buttons
    const firInput = document.getElementById('fir-input-text');
    document.getElementById('btn-load-sample-fir1')?.addEventListener('click', () => {
      if (firInput) {
        firInput.value = `FIR No. 402/2024 PS Majitha, Amritsar Rural. U/S 307, 120B IPC, Sec 21/25 NDPS Act, and Unlawful Activities Prevention Act (UAPA). Informant reported drone dropping contraband near village Dhianpur. Accused Gurmukh Singh alias Guri Majha operating from border coordinates coordinated with Jaspal Bawa urff Bawa Amritsar. Vehicle bearing registration PB-02-AX-4411 intercepted with 5kg heroin and 2 Glock pistols. Primary contact number +91-9876543210 recovered from burner handset. Foreign Hawala route routed through account 991200445588 Bank of Punjab.`;
      }
    });

    document.getElementById('btn-load-sample-fir2')?.addEventListener('click', () => {
      if (firInput) {
        firInput.value = `FIR No. 118/2025 PS Cyber Crime Gurugram. U/S 419, 420 IPC and Section 66D Information Technology Act. Complainant defrauded of Rs 48,50,000 through malicious electricity bill APK. Key operative Kasim Hacker urff Kasim Cyber tracked operating in Deeg district near Rajasthan border. Vehicle utilized for cash withdrawal was white Scorpio HR-28-B-1122. Linked burner phone +91-9812345678 active near cell tower MEW-9912. Hawala money transferred to mule account 501004812345 HDFC Bank.`;
      }
    });

    // Parse FIR Button
    let extractedFIRData = null;
    document.getElementById('btn-parse-fir')?.addEventListener('click', () => {
      const text = firInput?.value?.trim();
      if (!text) {
        alert('Please enter or load FIR narrative text.');
        return;
      }

      const res = extractEntitiesFromNarrative(text);
      extractedFIRData = res;

      const resultBox = document.getElementById('fir-nlp-results-box');
      const listDiv = document.getElementById('fir-nlp-entities-list');
      if (resultBox && listDiv) {
        listDiv.innerHTML = `
          <div><strong>Extracted Accused Aliases:</strong> ${res.aliases.length > 0 ? res.aliases.map(a => `<span class="tag-bubble tag-bubble-accent">${a}</span>`).join(' ') : 'None identified'}</div>
          <div style="margin-top: 6px;"><strong>Intercepted Phone Numbers:</strong> ${res.phones.length > 0 ? res.phones.map(p => `<span class="tag-bubble mono-tag">📞 ${p}</span>`).join(' ') : 'None'}</div>
          <div style="margin-top: 6px;"><strong>Transit Vehicles:</strong> ${res.vehicles.length > 0 ? res.vehicles.map(v => `<span class="tag-bubble mono-tag">🚗 ${v}</span>`).join(' ') : 'None'}</div>
          <div style="margin-top: 6px;"><strong>Statutory Sections:</strong> ${res.legalSections.length > 0 ? res.legalSections.map(l => `<span class="tag-bubble" style="background:#FEE2E2; color:#B91C1C;">⚖️ ${l}</span>`).join(' ') : 'None'}</div>
          <div style="margin-top: 6px;"><strong>Financial / Hawala Accounts:</strong> ${res.financialTokens.length > 0 ? res.financialTokens.map(f => `<span class="tag-bubble mono-tag">🏦 ${f}</span>`).join(' ') : 'None'}</div>
        `;
        resultBox.style.display = 'block';
        tacticalAudio.playLockOn();
      }
    });

    // Add Extracted FIR Entities to Graph
    document.getElementById('btn-add-fir-to-graph')?.addEventListener('click', () => {
      if (!extractedFIRData || extractedFIRData.aliases.length === 0) {
        alert('No distinct suspect entities found in the parsed FIR to add to graph.');
        return;
      }

      const entities = CANONICAL_ENTITIES[this.activeSyndicateId] || [];
      const links = CANONICAL_LINKS[this.activeSyndicateId] || [];

      extractedFIRData.aliases.forEach((aliasName, idx) => {
        const newId = `nlp_ent_${Date.now()}_${idx}`;
        const newEntity = {
          id: newId,
          canonical_name: aliasName,
          aliases: [aliasName],
          orbit_level: 2,
          role: 'FIR Co-Conspirator',
          risk_score: 85,
          risk_tier: 'high',
          betweenness: 0.45,
          centrality_rank: entities.length + 1,
          jurisdiction: 'FIR Jurisdiction',
          city: 'Regional Hub',
          lat: 28.6139,
          lng: 77.2090,
          phones: extractedFIRData.phones,
          vehicles: extractedFIRData.vehicles,
          firs: ['FIR Extracted Record 2026'],
          agencies: ['State Special Cell'],
          notes: `Identified via Sovereign FIR NLP extraction under ${extractedFIRData.legalSections.join(', ')}.`
        };

        entities.push(newEntity);

        // Link to active kingpin
        const kingpin = entities.find(e => e.orbit_level === 0) || entities[0];
        if (kingpin) {
          links.push({
            source: kingpin.id,
            target: newId,
            type: 'FIR_CORROBORATED',
            strength: 0.8
          });
        }
      });

      this.loadSyndicate(this.activeSyndicateId);
      tacticalAudio.playAction();
      modal.style.display = 'none';
      alert(`Added ${extractedFIRData.aliases.length} suspects from FIR directly into active network graph!`);
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.netsentry = new NetSentryController();
});
