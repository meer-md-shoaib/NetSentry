/**
 * NetSentry — India Interstate Police Corridor & Transit Flow Map
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Renders spatial police jurisdictions and interstate criminal conduits:
 * - Plots suspect nodes at actual departmental FIR origins / operational cities
 * - Draws animated curved transit arcs for weapon transit, narcotics drops, and hawala loops
 * - Supports click-to-inspect, zoom/pan, and tactical arrest strike-through
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
    // Clear and draw state boundary polygons
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

    // 1. Draw Active Interstate Corridors
    const activeCorridors = INTERSTATE_CORRIDORS.filter(
      (c) => !this.activeSyndicateId || c.syndicateId === this.activeSyndicateId
    );

    activeCorridors.forEach((c) => {
      const fromHub = INDIAN_POLICE_HUBS[c.from];
      const toHub = INDIAN_POLICE_HUBS[c.to];
      if (!fromHub || !toHub) return;

      // Draw quadratic Bezier curve arc
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

      // Add label along corridor
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

    // 2. Map Entities to City Hubs and render pins
    this.entities.forEach((e) => {
      // Find matching hub by city or fallback
      let hub = null;
      const cityLower = (e.city || '').toLowerCase();
      for (let key in INDIAN_POLICE_HUBS) {
        if (cityLower.includes(key)) {
          hub = INDIAN_POLICE_HUBS[key];
          break;
        }
      }
      if (!hub) hub = INDIAN_POLICE_HUBS.mumbai;

      // Small jitter so multiple suspects in same city don't completely overlap
      const hash = Math.abs(this.hashCode(e.id));
      const offsetX = (hash % 20) - 10;
      const offsetY = ((hash >> 3) % 20) - 10;
      const posX = hub.x + offsetX;
      const posY = hub.y + offsetY;

      const isSelected = this.selectedNodeId === e.id;
      const isNeutralized = this.neutralizedNodeId === e.id;
      const isKingpin = e.orbit_level === 0;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${posX}, ${posY})`);
      g.style.cursor = 'pointer';
      g.onclick = () => {
        this.selectNode(e.id);
        if (this.onSelectNode) this.onSelectNode(e.id);
      };

      // Node Marker Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', isKingpin ? '12' : '8');
      circle.setAttribute('fill', isNeutralized ? '#EF4444' : isKingpin ? '#F97316' : '#0EA5E9');
      circle.setAttribute('stroke', '#FFFFFF');
      circle.setAttribute('stroke-width', isSelected ? '3' : '2');
      circle.setAttribute('filter', 'url(#hubShadow)');

      if (isSelected) {
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('r', '18');
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', '#0EA5E9');
        pulse.setAttribute('stroke-width', '2');
        pulse.setAttribute('opacity', '0.6');
        g.appendChild(pulse);
      }

      // Pin Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '0');
      label.setAttribute('y', isKingpin ? '22' : '18');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-family', 'Inter, sans-serif');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', '700');
      label.setAttribute('fill', '#0F172A');
      label.textContent = e.canonical_name || e.name;

      g.appendChild(circle);
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
