/**
 * NetSentry — Celestial Solar System 2D Canvas Engine
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Deterministic orbital layout anchored to Betweenness Centrality bottlenecks:
 * - Orbit 0 (The Sun): Kingpin / Central Bottleneck
 * - Orbit I (Inner Ring): Core Operational Lieutenants (Radius 160px)
 * - Orbit II (Outer Ring): Ground Operatives, Fleet Sedans, MSISDN Taps (Radius 290px)
 * 
 * Includes high-DPI vector iconography (Crown, Person, Sedan, Phone) with zero emojis,
 * rock-solid click interactions, and in-canvas tactical arrest neutralization effects.
 */

export class SolarSystem2D {
  constructor(canvasElement, onSelectNode) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onSelectNode = onSelectNode;

    // View state
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Data state
    this.nodes = [];
    this.links = [];
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.neutralizedNodeId = null;

    // Config
    this.orbitRadii = [0, 160, 290];
    this.colors = {
      orbitRing: '#E2E8F0',
      orbitRingActive: '#CBD5E1',
      linkDefault: '#CBD5E1',
      linkActive: '#0EA5E9',
      kingpin: '#F97316',
      lieutenant: '#0EA5E9',
      operative: '#8B5CF6',
      transit: '#06B6D4',
      neutralized: '#EF4444',
      textPrimary: '#0F172A',
      textSecondary: '#64748B'
    };

    this.initEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;

    // Center view if not panned yet
    if (this.panX === 0 && this.panY === 0) {
      this.panX = this.width / 2;
      this.panY = this.height / 2;
    }
    this.render();
  }

  setData(entities, links) {
    this.links = links || [];
    this.nodes = this.calculateOrbitalPositions(entities || []);
    this.render();
  }

  calculateOrbitalPositions(entities) {
    const nodes = [];
    const orbitBuckets = { 0: [], 1: [], 2: [] };

    entities.forEach((entity) => {
      const orbit = entity.orbit_level !== undefined ? entity.orbit_level : 2;
      const bucket = orbitBuckets[orbit] || orbitBuckets[2];
      bucket.push(entity);
    });

    // Orbit 0: Kingpin at exact center (0, 0)
    orbitBuckets[0].forEach((e) => {
      nodes.push({
        ...e,
        x: 0,
        y: 0,
        radius: 34,
        orbit: 0
      });
    });

    // Orbit 1: Lieutenants arranged evenly in circle
    const count1 = orbitBuckets[1].length;
    orbitBuckets[1].forEach((e, idx) => {
      const angle = (idx / count1) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        ...e,
        x: Math.cos(angle) * this.orbitRadii[1],
        y: Math.sin(angle) * this.orbitRadii[1],
        radius: 24,
        orbit: 1
      });
    });

    // Orbit 2: Operatives, vehicles, and phone taps
    const count2 = orbitBuckets[2].length;
    orbitBuckets[2].forEach((e, idx) => {
      const angle = (idx / count2) * Math.PI * 2 - Math.PI / 4;
      nodes.push({
        ...e,
        x: Math.cos(angle) * this.orbitRadii[2],
        y: Math.sin(angle) * this.orbitRadii[2],
        radius: 20,
        orbit: 2
      });
    });

    return nodes;
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.render();
  }

  setNeutralized(nodeId) {
    this.neutralizedNodeId = nodeId;
    this.render();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check node hit
      const hitNode = this.getNodeAt(clickX, clickY);
      if (hitNode) {
        this.selectedNodeId = hitNode.id;
        if (this.onSelectNode) this.onSelectNode(hitNode.id);
        this.render();
        return;
      }

      this.isDragging = true;
      this.dragStartX = clickX - this.panX;
      this.dragStartY = clickY - this.panY;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      if (this.isDragging) {
        this.panX = curX - this.dragStartX;
        this.panY = curY - this.dragStartY;
        this.render();
        return;
      }

      const hitNode = this.getNodeAt(curX, curY);
      const newHover = hitNode ? hitNode.id : null;
      if (newHover !== this.hoveredNodeId) {
        this.hoveredNodeId = newHover;
        this.canvas.style.cursor = hitNode ? 'pointer' : 'grab';
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newScale = Math.min(Math.max(0.4, this.scale * zoomFactor), 2.8);
      this.scale = newScale;
      this.render();
    }, { passive: false });
  }

  getNodeAt(screenX, screenY) {
    // Invert world transform
    const worldX = (screenX - this.panX) / this.scale;
    const worldY = (screenY - this.panY) / this.scale;

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dist = Math.hypot(n.x - worldX, n.y - worldY);
      if (dist <= n.radius + 6) return n;
    }
    return null;
  }

  focusNode(nodeId) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    this.panX = this.width / 2 - node.x * this.scale;
    this.panY = this.height / 2 - node.y * this.scale;
    this.selectedNodeId = nodeId;
    this.render();
  }

  resetView() {
    this.scale = 1.0;
    this.panX = this.width / 2;
    this.panY = this.height / 2;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // 1. Draw concentric orbits
    this.drawOrbits(ctx);

    // 2. Draw relationship links
    this.drawLinks(ctx);

    // 3. Draw nodes & iconography
    this.drawNodes(ctx);

    ctx.restore();
  }

  drawOrbits(ctx) {
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = this.colors.orbitRing;

    // Orbit I
    ctx.beginPath();
    ctx.arc(0, 0, this.orbitRadii[1], 0, Math.PI * 2);
    ctx.stroke();

    // Orbit II
    ctx.beginPath();
    ctx.arc(0, 0, this.orbitRadii[2], 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  drawLinks(ctx) {
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    this.links.forEach((l) => {
      const s = nodeMap.get(l.source);
      const t = nodeMap.get(l.target);
      if (!s || !t) return;

      const isHighlighted =
        this.selectedNodeId === s.id ||
        this.selectedNodeId === t.id ||
        this.hoveredNodeId === s.id ||
        this.hoveredNodeId === t.id;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
      ctx.strokeStyle = isHighlighted ? this.colors.linkActive : this.colors.linkDefault;
      ctx.stroke();
    });
  }

  drawNodes(ctx) {
    this.nodes.forEach((node) => {
      const isSelected = this.selectedNodeId === node.id;
      const isHovered = this.hoveredNodeId === node.id;
      const isNeutralized = this.neutralizedNodeId === node.id;

      ctx.save();
      ctx.translate(node.x, node.y);

      // Pulse ring on selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Neutralized perimeter dash
      if (isNeutralized) {
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 6, 0, Math.PI * 2);
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = this.colors.neutralized;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node background fill
      ctx.beginPath();
      ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = isSelected ? 'rgba(14, 165, 233, 0.3)' : 'rgba(15, 23, 42, 0.1)';
      ctx.shadowBlur = isSelected ? 12 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node colored ring
      let ringColor = this.colors.operative;
      if (node.orbit === 0) ringColor = this.colors.kingpin;
      else if (node.orbit === 1) ringColor = this.colors.lieutenant;
      else if (node.role && node.role.includes('Vehicle')) ringColor = this.colors.transit;

      if (isNeutralized) ringColor = this.colors.neutralized;

      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.strokeStyle = ringColor;
      ctx.stroke();

      // Vector Iconography
      this.drawVectorIcon(ctx, node, ringColor);

      // Strikethrough if arrested
      if (isNeutralized) {
        ctx.strokeStyle = this.colors.neutralized;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-node.radius * 0.7, -node.radius * 0.7);
        ctx.lineTo(node.radius * 0.7, node.radius * 0.7);
        ctx.stroke();

        // Strikethrough banner
        ctx.fillStyle = this.colors.neutralized;
        ctx.fillRect(-60, -node.radius - 22, 120, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[NEUTRALIZED]', 0, -node.radius - 11);
      }

      // Label below node
      ctx.fillStyle = this.colors.textPrimary;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.canonical_name || node.name || 'Entity';
      ctx.fillText(label, 0, node.radius + 15);

      // Sub-label (Role or City)
      ctx.fillStyle = this.colors.textSecondary;
      ctx.font = '500 9px Inter, sans-serif';
      const subLabel = node.role || node.city || '';
      ctx.fillText(subLabel, 0, node.radius + 26);

      ctx.restore();
    });
  }

  drawVectorIcon(ctx, node, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const role = (node.role || '').toLowerCase();

    if (node.orbit === 0) {
      // 👑 Crown Silhouette for Kingpin
      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.lineTo(10, 5);
      ctx.lineTo(10, -5);
      ctx.lineTo(5, -1);
      ctx.lineTo(0, -7);
      ctx.lineTo(-5, -1);
      ctx.lineTo(-10, -5);
      ctx.closePath();
      ctx.fill();
    } else if (role.includes('vehicle')) {
      // 🚗 Sedan Car Silhouette
      ctx.beginPath();
      ctx.moveTo(-8, 3);
      ctx.lineTo(8, 3);
      ctx.lineTo(7, -1);
      ctx.lineTo(3, -4);
      ctx.lineTo(-3, -4);
      ctx.lineTo(-6, -1);
      ctx.closePath();
      ctx.stroke();
      // Wheels
      ctx.beginPath();
      ctx.arc(-5, 4, 1.8, 0, Math.PI * 2);
      ctx.arc(5, 4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (role.includes('telecom') || role.includes('tap')) {
      // 📞 Telecom Handset
      ctx.beginPath();
      ctx.arc(0, 0, 5, Math.PI * 0.2, Math.PI * 1.8, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 👤 Person Silhouette
      ctx.beginPath();
      ctx.arc(0, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 6, 6.5, Math.PI, 0, false);
      ctx.fill();
    }
  }
}
