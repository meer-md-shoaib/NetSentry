/**
 * NetSentry — Sovereign 3D WebGL Galactic Universe Engine (Light Mode Edition)
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Re-engineered for high-contrast light mode with prominent luminous spheres,
 * concentric 3D orbital rings, billboarded text sprite labels, and raycast selection.
 */

export class Universe3DLight {
  constructor(containerElement, onSelectNode) {
    this.container = containerElement;
    this.onSelectNode = onSelectNode;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.nodeMeshes = [];
    this.linkLines = [];
    this.labelSprites = [];
    this.ringMeshes = [];

    this.selectedNodeId = null;
    this.neutralizedNodeId = null;
    this.animating = false;

    this.colors = {
      bg: 0xF0F4F8,
      grid: 0xCBD5E1,
      ring: 0xCBD5E1,
      kingpin: 0xF97316,
      lieutenant: 0x0EA5E9,
      operative: 0x8B5CF6,
      transit: 0x06B6D4,
      neutralized: 0xEF4444,
      link: 0x94A3B8,
      linkActive: 0x0EA5E9
    };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.colors.bg);
    this.scene.fog = new THREE.FogExp2(this.colors.bg, 0.003);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    this.camera.position.set(0, 80, 140);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 450;
      this.controls.minDistance = 20;
    }

    // 5. Lighting (Bright High-Contrast Studio)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(50, 100, 50);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe0f2fe, 0.4);
    dirLight2.position.set(-50, -50, -50);
    this.scene.add(dirLight2);

    // 6. Subtle Ground Grid
    const gridHelper = new THREE.GridHelper(300, 30, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -10;
    this.scene.add(gridHelper);

    // 7. Event listeners
    this.initEvents();

    // Start loop
    this.animate = this.animate.bind(this);
    this.animating = true;
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  initEvents() {
    this.renderer.domElement.addEventListener('click', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.id) {
          this.selectNode(hit.userData.id);
          if (this.onSelectNode) this.onSelectNode(hit.userData.id);
        }
      }
    });

    window.addEventListener('resize', () => this.resize());
  }

  setData(entities, links) {
    this.clearGraph();

    const orbitRadii = [0, 38, 72];
    const orbitBuckets = { 0: [], 1: [], 2: [] };

    entities.forEach((e) => {
      const orbit = e.orbit_level !== undefined ? e.orbit_level : 2;
      const bucket = orbitBuckets[orbit] || orbitBuckets[2];
      bucket.push(e);
    });

    // Draw 3D Orbital Guide Rings
    [orbitRadii[1], orbitRadii[2]].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.2, r + 0.2, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: this.colors.ring,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      this.scene.add(ring);
      this.ringMeshes.push(ring);
    });

    const positions = new Map();

    // Orbit 0 (Kingpin Sun at center)
    orbitBuckets[0].forEach((e) => {
      const pos = new THREE.Vector3(0, 0, 0);
      positions.set(e.id, pos);
      this.createNodeMesh(e, pos, 6.5, this.colors.kingpin);
    });

    // Orbit 1 (Lieutenants)
    const count1 = orbitBuckets[1].length;
    orbitBuckets[1].forEach((e, i) => {
      const angle = (i / count1) * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * orbitRadii[1],
        Math.sin(angle * 2) * 4,
        Math.sin(angle) * orbitRadii[1]
      );
      positions.set(e.id, pos);
      this.createNodeMesh(e, pos, 4.5, this.colors.lieutenant);
    });

    // Orbit 2 (Operatives & Transit)
    const count2 = orbitBuckets[2].length;
    orbitBuckets[2].forEach((e, i) => {
      const angle = (i / count2) * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * orbitRadii[2],
        Math.sin(angle * 3) * 6,
        Math.sin(angle) * orbitRadii[2]
      );
      positions.set(e.id, pos);
      const isVehicle = e.role && e.role.includes('Vehicle');
      const color = isVehicle ? this.colors.transit : this.colors.operative;
      this.createNodeMesh(e, pos, 3.5, color);
    });

    // Draw Links
    (links || []).forEach((l) => {
      const posS = positions.get(l.source);
      const posT = positions.get(l.target);
      if (!posS || !posT) return;

      const points = [posS, posT];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: this.colors.link,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData = { source: l.source, target: l.target };
      this.scene.add(line);
      this.linkLines.push(line);
    });
  }

  createNodeMesh(entity, position, radius, colorHex) {
    // 1. Sphere Mesh
    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.3,
      metalness: 0.2,
      emissive: colorHex,
      emissiveIntensity: 0.2
    });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.copy(position);
    mesh.userData = { ...entity, baseRadius: radius, baseColor: colorHex };

    // 2. Halo glow sphere
    const glowGeo = new THREE.SphereGeometry(radius * 1.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    mesh.add(glow);

    this.scene.add(mesh);
    this.nodeMeshes.push(mesh);

    // 3. Billboard Text Label Sprite
    const labelSprite = this.createTextSprite(entity.canonical_name || entity.name || 'Suspect');
    labelSprite.position.copy(position);
    labelSprite.position.y -= radius + 4;
    this.scene.add(labelSprite);
    this.labelSprites.push(labelSprite);
  }

  createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    // Draw white background pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 44, 22);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(16, 4, 1);
    return sprite;
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;

    this.nodeMeshes.forEach((mesh) => {
      const isSelected = mesh.userData.id === nodeId;
      mesh.scale.setScalar(isSelected ? 1.35 : 1.0);
      mesh.material.emissiveIntensity = isSelected ? 0.6 : 0.2;
    });

    // Highlight links
    this.linkLines.forEach((line) => {
      const isConn = line.userData.source === nodeId || line.userData.target === nodeId;
      line.material.color.setHex(isConn ? this.colors.linkActive : this.colors.link);
      line.material.opacity = isConn ? 0.95 : 0.3;
    });
  }

  setNeutralized(nodeId) {
    this.neutralizedNodeId = nodeId;
    this.nodeMeshes.forEach((mesh) => {
      if (mesh.userData.id === nodeId) {
        mesh.material.color.setHex(this.colors.neutralized);
        mesh.material.emissive.setHex(this.colors.neutralized);
        mesh.material.emissiveIntensity = 0.8;
      }
    });
  }

  focusKingpin() {
    const kingpin = this.nodeMeshes.find((m) => m.userData.orbit_level === 0);
    if (!kingpin || !this.controls) return;
    this.camera.position.set(0, 60, 90);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  resetView() {
    if (!this.controls) return;
    this.camera.position.set(0, 80, 140);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  clearGraph() {
    this.nodeMeshes.forEach((m) => this.scene.remove(m));
    this.linkLines.forEach((l) => this.scene.remove(l));
    this.labelSprites.forEach((s) => this.scene.remove(s));
    this.ringMeshes.forEach((r) => this.scene.remove(r));
    this.nodeMeshes = [];
    this.linkLines = [];
    this.labelSprites = [];
    this.ringMeshes = [];
  }

  animate() {
    if (!this.animating) return;
    requestAnimationFrame(this.animate);

    // Subtle gentle orbit rotation for living network feel
    this.nodeMeshes.forEach((mesh) => {
      mesh.rotation.y += 0.005;
    });

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.animating = false;
    this.clearGraph();
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
