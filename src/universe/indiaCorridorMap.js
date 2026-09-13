/**
 * NetSentry — India Interstate Police Corridor & Transit Flow Map
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 *
 * Renders spatial police jurisdictions and interstate criminal conduits:
 * - Plots suspect nodes at actual departmental FIR origins / operational cities
 * - Draws animated curved transit arcs for weapon transit, narcotics drops, and hawala loops
 * - Supports click-to-inspect, zoom/pan, and tactical arrest strike-through
 *
 * Label collision-avoidance:
 *   1. Node positions use a golden-angle spiral outward from hub center so
 *      multiple suspects in the same city never overlap.
 *   2. Label positions are chosen from 8 candidate directions per node; the
 *      first direction that is ≥ LABEL_MIN_DIST from every already-placed
 *      label anchor is selected.
 *   3. A dashed leader line connects each label to its node when the label
 *      is pushed far from the node.
 *   4. Each label sits on a white pill background for readability.
 */

import { INDIAN_POLICE_HUBS, INTERSTATE_CORRIDORS } from '../data/geoCorridors.js';

export class IndiaCorridorMap {
  constructor(svgElement, onSelectNode) {
    this.svg = svgElement;
    this.onSelectNode = onSelectNode;

    this.entities = [];
    this.selectedNodeId = null;
    this.neutralizedNodeId = null;

    this.viewBox = { x: 100, y: 80, width: 520, height: 560 };
    this.init();
  }

  init() {
    this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    this.svg.style.background = '#F0F4F8';
    this.renderBaseGeography();
  }

  setData(entities, syndicateId) {
    this.entities = entities || [];
    this.activeSyndicateId = syndicateId;
    this.render();
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.render();
  }

  setNeutralized(nodeId) {
    this.neutralizedNodeId = nodeId;
    this.render();
  }

  renderBaseGeography() {
    this.svg.innerHTML = `
      <defs>
        <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#EF4444" stop-opacity="0.8"/>
        </linearGradient>
        <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.15"/>
        </filter>
      </defs>

      <!-- Background India Outline Polyline Grid -->
      <g id="geo-boundaries" opacity="0.45">
        <!-- Northern Sector (Punjab, J&K, Delhi) -->
        <polygon points="260,110 320,130 350,170 330,230 250,210 240,140" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
        <!-- Western Sector (Rajasthan, Gujarat) -->
        <polygon points="240,210 330,230 320,330 200,350 180,280" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
        <!-- Central-Western Sector (Maharashtra) -->
        <polygon points="200,350 320,330 360,420 280,480 210,430" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
        <!-- Southern Sector (Karnataka, AP, TN) -->
        <polygon points="280,480 360,420 380,540 310,600 260,530" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
        <!-- Eastern Sector (Bihar, Jharkhand, Bengal) -->
        <polygon points="350,240 480,260 520,340 440,380 350,330" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
      </g>

      <!-- State Jurisdiction Labels -->
      <g id="geo-labels" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#94A3B8" letter-spacing="1">
        <text x="270" y="160">PUNJAB</text>
        <text x="335" y="215">DELHI NCR</text>
        <text x="225" y="300">RAJASTHAN</text>
        <text x="235" y="415">MAHARASHTRA</text>
        <text x="290" y="535">KARNATAKA</text>
        <text x="460" y="310">JHARKHAND</text>
      </g>

      <!-- Dynamic Layer Containers -->
      <g id="geo-corridors-layer"></g>
      <g id="geo-nodes-layer"></g>
    `;
  }

  render() {
    const corridorsLayer = this.svg.querySelector('#geo-corridors-layer');
    const nodesLayer = this.svg.querySelector('#geo-nodes-layer');
    if (!corridorsLayer || !nodesLayer) return;

    corridorsLayer.innerHTML = '';
    nodesLayer.innerHTML = '';

    // ─── 1. Draw Active Interstate Corridors ──────────────────────────────────
    const activeCorridors = INTERSTATE_CORRIDORS.filter(
      (c) => !this.activeSyndicateId || c.syndicateId === this.activeSyndicateId
    );

    activeCorridors.forEach((c) => {
      const fromHub = INDIAN_POLICE_HUBS[c.from];
      const toHub = INDIAN_POLICE_HUBS[c.to];
      if (!fromHub || !toHub) return;

      const midX = (fromHub.x + toHub.x) / 2 - 25;
      const midY = (fromHub.y + toHub.y) / 2 - 25;
      const pathData = `M ${fromHub.x} ${fromHub.y} Q ${midX} ${midY} ${toHub.x} ${toHub.y}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#0EA5E9');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-dasharray', '6,4');
      path.setAttribute('opacity', '0.8');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY - 6);
      text.setAttribute('font-family', 'Inter, sans-serif');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-weight', '600');
      text.setAttribute('fill', '#0284C7');
      text.textContent = c.type;

      corridorsLayer.appendChild(path);
      corridorsLayer.appendChild(text);
    });

    // ─── 2. Collision-free node positions (golden-angle spiral) ───────────────
    const MIN_NODE_DIST = 32;
    const placedPositions = [];

    /**
     * Spiral outward from (baseX, baseY) using a golden-angle step until a
     * position is found that is ≥ MIN_NODE_DIST from every already-placed node.
     */
    const findFreeNodePos = (baseX, baseY, seedHash) => {
      const angle0 = (seedHash % 360) * (Math.PI / 180);
      for (let i = 0; i < 48; i++) {
        const r = 18 + i * 14;
        const a = angle0 + i * 2.399963; // golden angle ≈ 137.5°
        const cx = baseX + Math.cos(a) * r;
        const cy = baseY + Math.sin(a) * r;
        const free = placedPositions.every((p) => {
          const dx = p.x - cx, dy = p.y - cy;
          return Math.sqrt(dx * dx + dy * dy) >= MIN_NODE_DIST;
        });
        if (free) return { x: cx, y: cy };
      }
      // Last-resort wide fallback
      return { x: baseX + ((seedHash % 80) - 40), y: baseY + (((seedHash >> 4) % 80) - 40) };
    };

    // Kingpins anchor to hub center first; lieutenants/operatives spiral outward
    const sorted = [...this.entities].sort((a, b) => (a.orbit_level ?? 99) - (b.orbit_level ?? 99));

    const entityPositions = sorted.map((e) => {
      let hub = INDIAN_POLICE_HUBS.mumbai; // default fallback
      const cityLower = (e.city || '').toLowerCase();
      for (const key in INDIAN_POLICE_HUBS) {
        if (cityLower.includes(key)) { hub = INDIAN_POLICE_HUBS[key]; break; }
      }

      const hash = Math.abs(this.hashCode(e.id));
      const isKingpin = (e.orbit_level ?? 99) === 0;

      let pos;
      if (isKingpin) {
        const hubFree = placedPositions.every((p) => {
          const dx = p.x - hub.x, dy = p.y - hub.y;
          return Math.sqrt(dx * dx + dy * dy) >= MIN_NODE_DIST;
        });
        pos = hubFree ? { x: hub.x, y: hub.y } : findFreeNodePos(hub.x, hub.y, hash);
      } else {
        pos = findFreeNodePos(hub.x, hub.y, hash);
      }

      placedPositions.push(pos);
      return { entity: e, pos };
    });

    // ─── 3. Collision-free label positions (8-direction candidate test) ────────
    const LABEL_MIN_DIST = 38;
    const labelPositions = [];

    entityPositions.forEach(({ entity: e, pos }) => {
      const r = (e.orbit_level ?? 99) === 0 ? 12 : 8;
      const candidates = [
        { dx:  0,       dy:  r + 13 },  // below
        { dx:  0,       dy: -(r + 13) },// above
        { dx:  r + 32,  dy:  0 },       // right
        { dx: -(r + 32),dy:  0 },       // left
        { dx:  28,      dy:  r + 13 },  // below-right
        { dx: -28,      dy:  r + 13 },  // below-left
        { dx:  28,      dy: -(r + 13) },// above-right
        { dx: -28,      dy: -(r + 13) } // above-left
      ];

      let chosen = { x: pos.x, y: pos.y + r + 13 }; // default: below
      for (const { dx, dy } of candidates) {
        const cand = { x: pos.x + dx, y: pos.y + dy };
        const free = labelPositions.every((lp) => {
          const ddx = lp.x - cand.x, ddy = lp.y - cand.y;
          return Math.sqrt(ddx * ddx + ddy * ddy) >= LABEL_MIN_DIST;
        });
        if (free) { chosen = cand; break; }
      }
      labelPositions.push(chosen);
    });

    // ─── 4. Render nodes + labels ─────────────────────────────────────────────
    entityPositions.forEach(({ entity: e, pos }, idx) => {
      const isSelected    = this.selectedNodeId   === e.id;
      const isNeutralized = this.neutralizedNodeId === e.id;
      const isKingpin     = (e.orbit_level ?? 99) === 0;
      const labelPos      = labelPositions[idx];

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      g.onclick = () => { this.selectNode(e.id); if (this.onSelectNode) this.onSelectNode(e.id); };

      // Selection pulse ring
      if (isSelected) {
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('cx', pos.x);
        pulse.setAttribute('cy', pos.y);
        pulse.setAttribute('r', '20');
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', '#0EA5E9');
        pulse.setAttribute('stroke-width', '2');
        pulse.setAttribute('opacity', '0.5');
        g.appendChild(pulse);
      }

      // Dashed leader line (only when label was pushed away from the node)
      const ldx = labelPos.x - pos.x, ldy = labelPos.y - pos.y;
      if (Math.sqrt(ldx * ldx + ldy * ldy) > 20) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pos.x); line.setAttribute('y1', pos.y);
        line.setAttribute('x2', labelPos.x); line.setAttribute('y2', labelPos.y);
        line.setAttribute('stroke', '#94A3B8');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '3,2');
        line.setAttribute('opacity', '0.55');
        g.appendChild(line);
      }

      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', isKingpin ? '12' : '8');
      circle.setAttribute('fill', isNeutralized ? '#EF4444' : isKingpin ? '#F97316' : '#0EA5E9');
      circle.setAttribute('stroke', '#FFFFFF');
      circle.setAttribute('stroke-width', isSelected ? '3' : '2');
      circle.setAttribute('filter', 'url(#hubShadow)');
      g.appendChild(circle);

      // White pill background behind label text
      const labelText = e.canonical_name || e.name || '';
      const pillW = Math.min(labelText.length * 5.5, 92) + 8;
      const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pill.setAttribute('x', labelPos.x - pillW / 2);
      pill.setAttribute('y', labelPos.y - 9);
      pill.setAttribute('width', pillW);
      pill.setAttribute('height', '12');
      pill.setAttribute('rx', '4');
      pill.setAttribute('fill', '#FFFFFF');
      pill.setAttribute('opacity', '0.92');
      g.appendChild(pill);

      // Label text
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', labelPos.x);
      label.setAttribute('y', labelPos.y);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-family', 'Inter, sans-serif');
      label.setAttribute('font-size', '9');
      label.setAttribute('font-weight', '700');
      label.setAttribute('fill', isKingpin ? '#C2410C' : '#0F172A');
      label.textContent = labelText;
      g.appendChild(label);

      nodesLayer.appendChild(g);
    });
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
