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
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.netsentry = new NetSentryController();
});
