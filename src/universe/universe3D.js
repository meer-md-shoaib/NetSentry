/**
 * NetSentry — 3D Celestial Intelligence Graph Engine
 * WebGL-powered 3D visualization of criminal syndicates, cells, and suspects.
 *
 * Implements strict progressive disclosure across 4 zoom levels:
 * Level 1 (Full Universe): Distant celestial clouds, subtle dust, cluster names, 0 line clutter.
 * Level 2 (Galaxy): Cluster reveals key artists and faint inter-artist filaments.
 * Level 3 (Artist): Artist star dominates; artist's songs and local orbits emerge.
 * Level 4 (Song): Focused song star and only its top 3-4 relationship filaments emerge.
 */

import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';

/**
 * Creates a soft, restrained Gaussian star texture without giant white bloom.
 * Produces crisp, deep-space astronomical starlight.
 */
function createRestrainedStarTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.12, 'rgba(255, 255, 255, 0.65)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.18)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.03)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates an ultra-subtle, ethereal dust cloud texture for galaxy regions.
 */
function createSubtleNebulaTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.28)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.03)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a distinct 4-spike star/cross texture for artist anchors.
 * Looks like a bright sun — immediately distinguishable from round song dots.
 */
function createArtistCrossTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;

  // Soft outer glow
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c * 0.5);
  glow.addColorStop(0.0, 'rgba(255, 255, 255, 0.5)');
  glow.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
  glow.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // 4 elongated spike arms
  ctx.save();
  ctx.translate(c, c);
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2);
    const arm = ctx.createLinearGradient(0, 0, 0, -c * 0.85);
    arm.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    arm.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
    arm.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = arm;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.04, -c * 0.18);
    ctx.lineTo(0, -c * 0.85);
    ctx.lineTo(size * 0.04, -c * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Bright central core
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, c * 0.14);
  core.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  core.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
  core.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, c * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a minimal, crisp billboard label sprite with dark backing.
 */
function createMinimalLabelSprite(text, colorHex = '#e2e8f0', fontSize = 22) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;

  const padX = 12;
  const padY = 5;
  const pillW = Math.min(360, textW + padX * 2);
  const pillH = fontSize + padY * 2;
  const pillX = (384 - pillW) / 2;
  const pillY = (96 - pillH) / 2;

  // Ultra-subtle dark pill backing
  ctx.fillStyle = 'rgba(5, 7, 12, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  const r = pillH / 2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(pillX, pillY, pillW, pillH, r);
  } else {
    ctx.rect(pillX, pillY, pillW, pillH);
  }
  ctx.fill();
  ctx.stroke();

  // Crisp text
  ctx.fillStyle = colorHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 192, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(22, 5.5, 1);
  return sprite;
}

export class Universe3D {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSelectTrack: null,
      onSelectAlbum: null,
      onSelectArtist: null,
      onSelectGalaxy: null,
      onHoverObject: null,
      onLevelChange: null,
      getRelatedTracks: null,
      ...options
    };

    // State & Data
    this.constellation = null;
    this.currentLevel = 1; // 1: Universe, 2: Galaxy, 3: Artist, 4: Album, 5: Song
    this.selectedTrackId = null;
    this.selectedAlbumId = null;
    this.selectedArtistName = null;
    this.focusedGalaxyId = null;
    this.hoveredTrackId = null;
    this.hoveredAlbumId = null;
    this.hoveredArtistName = null;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points = { threshold: 4.0 };
    this.mouse = new THREE.Vector2(-999, -999);
    this.clock = new THREE.Clock();

    // Scene Groups
    this.starfieldGroup = new THREE.Group();
    this.galaxiesGroup = new THREE.Group();
    this.starsGroup = new THREE.Group();
    this.artistsGroup = new THREE.Group();
    this.albumsGroup = new THREE.Group();
    this.connectionsGroup = new THREE.Group();
    this.labelsGroup = new THREE.Group();
    this.highlightGroup = new THREE.Group();

    // Textures
    this.starTexture = createRestrainedStarTexture(64);
    this.nebulaTexture = createSubtleNebulaTexture(128);
    this.artistTexture = createArtistCrossTexture(128);

    // Dynamic Geometry & Attributes Cache
    this.starPoints = null;
    this.starDataList = [];
    this.artistDataList = [];
    this.albumsDataList = [];
    this.connectionsData = [];
    this.activeConnectionLines = null;
    this.selectionRingMesh = null;

    // Animation & Flight
    this.flightState = null;
    this.animId = null;

    // Filter State (Phase 7)
    this.activeFilter = {
      genre: null,
      playlist: null,
      yearMin: null,
      yearMax: null
    };

    // Product Mode State (Phase 7)
    this.showConnections = true;
    this.is2DMode = false;
    this.saved3DCamera = null;

    // Artist Solar System (Level 3+)
    this.solarSystemGroup = null;
    this.solarSystemArtistName = null;
    // Map albumId -> world position of its planet in solar system
    this.solarPlanetPositions = new Map();
    // Map trackId -> world position of its moon in solar system
    this.solarMoonPositions = new Map();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 1000;
    const height = this.container.clientHeight || 700;

    // 1. Scene with pitch-black space
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020306);
    this.scene.fog = new THREE.FogExp2(0x020306, 0.0008);

    // 2. Camera starting far away for Level 1 overview
    this.camera = new THREE.PerspectiveCamera(46, width / height, 1, 4000);
    this.camera.position.set(0, 160, 620);

    // 3. Renderer with Linear Tone Mapping (prevents whiteout bloom)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // 4. Smooth OrbitControls with inertia damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 1400;
    this.controls.maxPolarAngle = Math.PI - 0.08;
    this.controls.minPolarAngle = 0.08;

    // 5. Ambient Lighting
    const ambient = new THREE.AmbientLight(0x334155, 1.0);
    this.scene.add(ambient);

    // 6. Assemble Groups
    this.scene.add(this.starfieldGroup);
    this.scene.add(this.galaxiesGroup);
    this.scene.add(this.connectionsGroup);
    this.scene.add(this.starsGroup);
    this.scene.add(this.artistsGroup);
    this.scene.add(this.albumsGroup);
    this.scene.add(this.labelsGroup);
    this.scene.add(this.highlightGroup);

    // 7. Distant ambient starfield & selection focus ring
    this.buildSparseStarfield();
    this.buildSelectionRing();

    // 8. Event Listeners
    this.initEventListeners();
    this.startLoop();
  }

  /**
   * Distant, sparse celestial dust (subtle background depth)
   */
  buildSparseStarfield() {
    const count = 900;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 700 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const dim = 0.2 + Math.random() * 0.35;
      colors[i * 3] = 0.7 * dim;
      colors[i * 3 + 1] = 0.8 * dim;
      colors[i * 3 + 2] = 0.9 * dim;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      map: this.starTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });

    const starfield = new THREE.Points(geometry, material);
    this.starfieldGroup.add(starfield);
  }

  /**
   * Sleek selection focus ring
   */
  buildSelectionRing() {
    const ringGeo = new THREE.RingGeometry(3.6, 4.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false
    });
    this.selectionRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.selectionRingMesh.visible = false;
    this.highlightGroup.add(this.selectionRingMesh);
  }

  /**
   * Loads constellation dataset and populates spatial nodes
   */
  loadConstellation(constellation) {
    this.constellation = constellation;
    this.clearDynamicObjects();

    if (!constellation || !constellation.tracks || constellation.tracks.length === 0) {
      return;
    }

    this.starDataList = constellation.tracks;
    this.artistDataList = constellation.artists || [];
    this.albumsDataList = constellation.albums || [];
    this.connectionsData = constellation.connections || [];

    // 1. Build Subtle Galaxy Dust Clouds & Major Cluster Labels (Level 1)
    this.buildGalaxyRegions(constellation.galaxies || []);

    // 2. Build Artist Beacon Stars (Level 2 & 3)
    this.buildArtistNodes(this.artistDataList);

    // 3. Build Album Orbital Systems & Beacons (Level 3 & 4)
    this.buildAlbumNodes(this.albumsDataList);

    // 4. Build Song Stars (Level 1 - 5)
    this.buildSongStars(this.starDataList);

    // 5. Position Camera far away for Level 1 overview
    this.resetCamera(false);

    // 6. Initial Progressive Disclosure update
    this.updateProgressiveDisclosure(true);
  }

  /**
   * Clears old constellation items
   */
  clearDynamicObjects() {
    while (this.galaxiesGroup.children.length > 0) {
      const obj = this.galaxiesGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.galaxiesGroup.remove(obj);
    }
    while (this.starsGroup.children.length > 0) {
      const obj = this.starsGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.starsGroup.remove(obj);
    }
    while (this.artistsGroup.children.length > 0) {
      const obj = this.artistsGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.artistsGroup.remove(obj);
    }
    while (this.albumsGroup.children.length > 0) {
      const obj = this.albumsGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.albumsGroup.remove(obj);
    }
    while (this.connectionsGroup.children.length > 0) {
      const obj = this.connectionsGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.connectionsGroup.remove(obj);
    }
    while (this.labelsGroup.children.length > 0) {
      const obj = this.labelsGroup.children[0];
      if (obj.material && obj.material.map) obj.material.map.dispose();
      if (obj.material) obj.material.dispose();
      this.labelsGroup.remove(obj);
    }

    this.starPoints = null;
    this.activeConnectionLines = null;
    this.selectionRingMesh.visible = false;
  }

  /**
   * Builds subtle, restrained galaxy clouds and clean cluster name labels
   */
  buildGalaxyRegions(galaxies) {
    galaxies.forEach(galaxy => {
      const [gx, gy, gz] = galaxy.centroid;
      const color = new THREE.Color(galaxy.color || '#818cf8');
      const radius = Math.max(30, (galaxy.radius || 25) * 1.6);

      // Subtle, non-blinding dust sprite
      const mat = new THREE.SpriteMaterial({
        map: this.nebulaTexture,
        color: color,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(gx, gy, gz);
      sprite.scale.set(radius * 2.2, radius * 2.2, 1);
      sprite.userData = { type: 'galaxy_cloud', galaxyId: galaxy.id };
      this.galaxiesGroup.add(sprite);

      // Cluster Name Label (Minimal, elegant)
      const label = createMinimalLabelSprite(galaxy.name, galaxy.color || '#ffffff', 24);
      label.position.set(gx, gy + radius * 0.75 + 10, gz);
      label.scale.set(28, 7, 1);
      label.userData = { type: 'galaxy_label', galaxyId: galaxy.id };
      this.labelsGroup.add(label);
    });
  }

  /**
   * Builds prominent artist anchor stars — 4-spike cross shape, clearly distinct from song dots
   */
  buildArtistNodes(artists) {
    artists.forEach(art => {
      const [ax, ay, az] = art.centroid;
      // Tint toward galaxy color but keep mostly white so the cross shape reads clearly
      const color = new THREE.Color(art.galaxy_color || '#38bdf8');
      color.lerp(new THREE.Color('#ffffff'), 0.55);

      const mat = new THREE.SpriteMaterial({
        map: this.artistTexture,
        color: color,
        transparent: true,
        opacity: 0.92,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(ax, ay, az);
      // Prominent artist beacon cross (15x15) clearly distinct from song dots
      sprite.scale.set(15, 15, 1);
      sprite.userData = { type: 'artist', artist: art.artist, galaxyId: art.galaxy_id };
      this.artistsGroup.add(sprite);

      // Clean artist label
      const label = createMinimalLabelSprite(art.artist, '#ffffff', 20);
      label.position.set(ax, ay + 9.5, az);
      label.scale.set(24, 6, 1);
      label.visible = false;
      label.userData = { type: 'artist_label', artist: art.artist, galaxyId: art.galaxy_id };
      this.labelsGroup.add(label);
    });
  }

  /**
   * Builds album orbital rings (Level 3 & 4). NO beacon sprites — rings + labels only.
   * Keeps the screen clean: just elegant elliptical orbits, never clutter.
   */
  buildAlbumNodes(albums) {
    albums.forEach(album => {
      const [cx, cy, cz] = album.centroid;
      const color = new THREE.Color(album.galaxy_color || '#38bdf8');
      const radius = Math.max(3.5, album.radius || 4.5);

      // Celestial orbit ring — only visible element for albums
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(48);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const ringMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      const ringLine = new THREE.LineLoop(ringGeo, ringMat);
      ringLine.position.set(cx, cy, cz);
      ringLine.visible = false;
      ringLine.userData = {
        type: 'album_ring',
        albumId: album.id,
        artist: album.artist,
        galaxyId: album.galaxy_id
      };
      this.albumsGroup.add(ringLine);

      // Album Label — appears near ring centre
      const label = createMinimalLabelSprite(album.album, '#f8fafc', 17);
      label.position.set(cx, cy + radius * 0.6 + 2.5, cz);
      label.scale.set(22, 5.5, 1);
      label.visible = false;
      label.userData = {
        type: 'album_label',
        albumId: album.id,
        artist: album.artist,
        galaxyId: album.galaxy_id
      };
      this.labelsGroup.add(label);
    });
  }

  /**
   * Syndicate Command Cluster — builds a procedural Syndicate → Cells → Suspects hierarchy.
   * Syndicate Command Anchor = central anchor. Cells = operational hubs on concentric rings.
   * Suspects = operative nodes orbiting their cell hub.
   * Returns the max system radius so the camera can frame it.
   */
  buildArtistSolarSystem(artistName) {
    this.teardownArtistSolarSystem();

    const artistData = this.artistDataList.find(a => a.artist === artistName);
    if (!artistData) return 60;

    const [cx, cy, cz] = artistData.centroid;
    const artistColor = new THREE.Color(artistData.galaxy_color || '#f59e0b');

    this.solarSystemGroup = new THREE.Group();
    // Group sits at artist centroid; all child positions are relative
    this.solarSystemGroup.position.set(cx, cy, cz);
    this.scene.add(this.solarSystemGroup);
    this.solarSystemArtistName = artistName;
    this.solarPlanetPositions.clear();
    this.solarMoonPositions.clear();

    // ── SYNDICATE COMMAND ANCHOR ────────────────────────────
    const sunColor = artistColor.clone().lerp(new THREE.Color('#ffffff'), 0.45);
    const sunMat = new THREE.SpriteMaterial({
      map: this.artistTexture,
      color: sunColor,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });
    const sun = new THREE.Sprite(sunMat);
    sun.scale.set(30, 30, 1);
    sun.userData = { type: 'solar_sun', artist: artistName };
    this.solarSystemGroup.add(sun);

    // Command Anchor label
    const sunLabel = createMinimalLabelSprite(artistName, '#ffffff', 26);
    sunLabel.position.set(0, 22, 0);
    sunLabel.scale.set(36, 9, 1);
    sunLabel.userData = { type: 'solar_sun_label', artist: artistName };
    this.solarSystemGroup.add(sunLabel);

    // ── OPERATIONAL CELL HUBS ─────────────────────────────────
    const albums = this.albumsDataList.filter(a => a.artist === artistName);
    const tracks = this.starDataList.filter(t => t.artist === artistName);
    const numAlbums = albums.length;

    // Determine orbit ring radii — generous spacing so moons never overlap the sun
    let albumSlots = [];
    if (numAlbums === 0) {
      // Handled below
    } else if (numAlbums <= 4) {
      albums.forEach((alb, i) => {
        albumSlots.push({ album: alb, orbitR: 56, angle: (i / numAlbums) * Math.PI * 2 - Math.PI / 2 });
      });
    } else if (numAlbums <= 8) {
      const half = Math.ceil(numAlbums / 2);
      albums.forEach((alb, i) => {
        if (i < half) {
          albumSlots.push({ album: alb, orbitR: 48, angle: (i / half) * Math.PI * 2 - Math.PI / 2 });
        } else {
          const j = i - half;
          const outerCount = numAlbums - half;
          albumSlots.push({ album: alb, orbitR: 82, angle: (j / outerCount) * Math.PI * 2 });
        }
      });
    } else {
      // Three rings
      const third = Math.ceil(numAlbums / 3);
      albums.forEach((alb, i) => {
        const ring = Math.floor(i / third);
        const inRing = i % third;
        const count = Math.min(third, numAlbums - ring * third);
        const r = [48, 80, 114][ring] || 114;
        albumSlots.push({ album: alb, orbitR: r, angle: (inRing / count) * Math.PI * 2 - Math.PI / 2 });
      });
    }

    // Draw orbit ring(s) for each unique radius
    const usedRadii = [...new Set(albumSlots.map(s => s.orbitR))];
    usedRadii.forEach(orbitR => {
      const curve = new THREE.EllipseCurve(0, 0, orbitR, orbitR, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(96);
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const mat = new THREE.LineBasicMaterial({
        color: artistColor,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      });
      this.solarSystemGroup.add(new THREE.LineLoop(geo, mat));
    });

    let maxSystemRadius = 25;

    albumSlots.forEach(({ album, orbitR, angle }) => {
      const px = Math.cos(angle) * orbitR;
      const pz = Math.sin(angle) * orbitR;
      const albumColor = new THREE.Color(album.galaxy_color || '#38bdf8');

      // Store world position for camera targeting
      this.solarPlanetPositions.set(album.id, new THREE.Vector3(cx + px, cy, cz + pz));

      // Planet sprite (size 13x13)
      const planetMat = new THREE.SpriteMaterial({
        map: this.starTexture,
        color: albumColor,
        transparent: true,
        opacity: 0.96,
        depthWrite: false
      });
      const planet = new THREE.Sprite(planetMat);
      planet.position.set(px, 0, pz);
      planet.scale.set(13, 13, 1);
      planet.userData = { type: 'solar_album', albumId: album.id, album: album.album, artist: artistName };
      this.solarSystemGroup.add(planet);

      // Album label (always visible, crisp text)
      const hexColor = '#' + albumColor.getHexString();
      const albumLabel = createMinimalLabelSprite(album.album, hexColor, 18);
      albumLabel.position.set(px, 11, pz);
      albumLabel.scale.set(26, 6.5, 1);
      albumLabel.userData = { type: 'solar_album_label', albumId: album.id, album: album.album, artist: artistName };
      this.solarSystemGroup.add(albumLabel);

      // ── SUSPECT OPERATIVE NODES ─────────────────────────────
      const albumSongs = tracks.filter(t => t.album_id === album.id);
      const numSongs = albumSongs.length;

      if (numSongs > 0) {
        // Moon orbit radius scaled with ample breathing room
        const moonR = Math.max(16, Math.min(34, numSongs * 3.2));

        // Moon orbit ring
        const moonCurve = new THREE.EllipseCurve(0, 0, moonR, moonR, 0, Math.PI * 2, false, 0);
        const moonPts = moonCurve.getPoints(56);
        const moonGeo = new THREE.BufferGeometry().setFromPoints(moonPts.map(p => new THREE.Vector3(p.x, 0, p.y)));
        const moonOrbitMat = new THREE.LineBasicMaterial({
          color: albumColor,
          transparent: true,
          opacity: 0.32,
          depthWrite: false
        });
        const moonRing = new THREE.LineLoop(moonGeo, moonOrbitMat);
        moonRing.position.set(px, 0, pz);
        this.solarSystemGroup.add(moonRing);

        maxSystemRadius = Math.max(maxSystemRadius, orbitR + moonR);

        albumSongs.forEach((song, j) => {
          const songAngle = (j / numSongs) * Math.PI * 2;
          const mx = px + Math.cos(songAngle) * moonR;
          const mz = pz + Math.sin(songAngle) * moonR;

          // Store world position
          this.solarMoonPositions.set(song.id, new THREE.Vector3(cx + mx, cy, cz + mz));

          // Substantially increased node size (8.5x8.5)
          const moonMat = new THREE.SpriteMaterial({
            map: this.starTexture,
            color: albumColor.clone().lerp(new THREE.Color('#ffffff'), 0.25),
            transparent: true,
            opacity: 0.90,
            depthWrite: false
          });
          const moon = new THREE.Sprite(moonMat);
          moon.position.set(mx, 0, mz);
          moon.scale.set(8.5, 8.5, 1);
          moon.userData = { type: 'solar_song', trackId: song.id, title: song.title, artist: song.artist };
          this.solarSystemGroup.add(moon);

          // Substantially increased and always readable song label
          const dirX = Math.cos(songAngle);
          const dirZ = Math.sin(songAngle);
          const songLabel = createMinimalLabelSprite(song.title, '#e2e8f0', 17);
          songLabel.position.set(mx + dirX * 4.2, 5.0, mz + dirZ * 4.2);
          songLabel.scale.set(24, 6, 1);
          songLabel.userData = { type: 'solar_song_label', trackId: song.id, title: song.title };
          this.solarSystemGroup.add(songLabel);
        });
      } else {
        maxSystemRadius = Math.max(maxSystemRadius, orbitR);
      }
    });

    // If no albums at all, place tracks directly around the artist
    if (numAlbums === 0 && tracks.length > 0) {
      const moonR = Math.max(22, tracks.length * 3.4);
      const curve = new THREE.EllipseCurve(0, 0, moonR, moonR, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      this.solarSystemGroup.add(new THREE.LineLoop(geo, new THREE.LineBasicMaterial({
        color: artistColor, transparent: true, opacity: 0.25, depthWrite: false
      })));
      tracks.forEach((song, j) => {
        const a = (j / tracks.length) * Math.PI * 2;
        const mx = Math.cos(a) * moonR;
        const mz = Math.sin(a) * moonR;
        this.solarMoonPositions.set(song.id, new THREE.Vector3(cx + mx, cy, cz + mz));
        const m = new THREE.SpriteMaterial({ map: this.starTexture, color: artistColor.clone(), transparent: true, opacity: 0.90, depthWrite: false });
        const moon = new THREE.Sprite(m);
        moon.position.set(mx, 0, mz);
        moon.scale.set(8.5, 8.5, 1);
        moon.userData = { type: 'solar_song', trackId: song.id, title: song.title, artist: song.artist };
        this.solarSystemGroup.add(moon);

        const songLabel = createMinimalLabelSprite(song.title, '#e2e8f0', 17);
        songLabel.position.set(mx + Math.cos(a) * 4.2, 5.0, mz + Math.sin(a) * 4.2);
        songLabel.scale.set(24, 6, 1);
        songLabel.userData = { type: 'solar_song_label', trackId: song.id, title: song.title };
        this.solarSystemGroup.add(songLabel);
      });
      maxSystemRadius = moonR;
    }

    return maxSystemRadius;
  }

  /**
   * Tears down the solar system overlay and restores constellation groups.
   */
  teardownArtistSolarSystem() {
    if (!this.solarSystemGroup) return;

    if (this.solarFilamentsLine) {
      if (this.solarFilamentsLine.geometry) this.solarFilamentsLine.geometry.dispose();
      if (this.solarFilamentsLine.material) this.solarFilamentsLine.material.dispose();
      this.solarFilamentsLine = null;
    }

    while (this.solarSystemGroup.children.length > 0) {
      const obj = this.solarSystemGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map && obj.material.map !== this.starTexture &&
            obj.material.map !== this.artistTexture && obj.material.map !== this.nebulaTexture) {
          obj.material.map.dispose();
        }
        obj.material.dispose();
      }
      this.solarSystemGroup.remove(obj);
    }
    this.scene.remove(this.solarSystemGroup);
    this.solarSystemGroup = null;
    this.solarSystemArtistName = null;
    this.solarPlanetPositions.clear();
    this.solarMoonPositions.clear();

    // Restore constellation group visibility
    if (this.starPoints) this.starPoints.visible = true;
    this.artistsGroup.children.forEach(c => { c.visible = true; });
    this.galaxiesGroup.children.forEach(c => {
      c.visible = true;
      if (c.material) c.material.opacity = 0.14;
    });
    this.labelsGroup.children.forEach(c => { c.visible = true; });
    this.albumsGroup.children.forEach(c => { c.visible = false; });
  }

  /**
   * Builds song stars using Three.js Points
   */
  buildSongStars(tracks) {
    const count = tracks.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = tracks[i];
      positions[i * 3] = t.x;
      positions[i * 3 + 1] = t.y;
      positions[i * 3 + 2] = t.z;

      const c = new THREE.Color(t.galaxy_color || '#94a3b8');
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.6,
      vertexColors: true,
      map: this.starTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.starPoints.name = 'song_stars';
    this.starsGroup.add(this.starPoints);
  }

  /**
   * PROGRESSIVE DISCLOSURE ENGINE
   * Evaluates camera distance and focuses relevant elements across 5 zoom levels:
   * Level 1: Full Universe (Macro celestial overview)
   * Level 2: Galaxy (Cluster identity & artist beacons)
   * Level 3: Artist (Artist star & discography/album orbits)
   * Level 4: Album (Album orbit ring & track cluster)
   * Level 5: Song (Deep track inspection & local similarities)
   */
  updateProgressiveDisclosure(force = false) {
    if (!this.constellation) return;

    const camDist = this.camera.position.distanceTo(this.controls.target);

    // If solar system is active and user zoomed out past system boundary:
    if (this.solarSystemGroup && camDist > 250 && !this.flightState) {
      this.teardownArtistSolarSystem();
      this.selectedArtistName = null;
      this.selectedAlbumId = null;
      this.selectedTrackId = null;
      this.selectionRingMesh.visible = false;
    }

    // Determine current level based on focus state or camera distance:
    let newLevel = 1;
    if (this.selectedTrackId || camDist <= 55) {
      newLevel = 5; // Song
    } else if (this.selectedAlbumId || camDist <= 120) {
      newLevel = 4; // Album
    } else if (this.selectedArtistName || camDist <= 240) {
      newLevel = 3; // Artist
    } else if (this.focusedGalaxyId || camDist <= 420) {
      newLevel = 2; // Galaxy
    } else {
      newLevel = 1; // Universe
    }

    if (newLevel !== this.currentLevel || force) {
      this.currentLevel = newLevel;
      if (this.options.onLevelChange) {
        this.options.onLevelChange(newLevel, this.getLevelBreadcrumbs());
      }
    }

    this.applyLevelVisuals(this.currentLevel, camDist);
  }

  /**
   * Returns structured breadcrumb array for current exploration depth
   */
  getLevelBreadcrumbs() {
    const crumbs = [{ level: 1, label: 'Universe', key: 'universe' }];

    const galaxy = this.focusedGalaxyId
      ? this.constellation?.galaxies.find(g => g.id === this.focusedGalaxyId)
      : null;
    if (galaxy && this.currentLevel >= 2) {
      crumbs.push({ level: 2, label: galaxy.name, key: 'galaxy', id: galaxy.id });
    }

    if (this.selectedArtistName && this.currentLevel >= 3) {
      crumbs.push({ level: 3, label: this.selectedArtistName, key: 'artist', name: this.selectedArtistName });
    }

    const album = this.selectedAlbumId
      ? this.albumsDataList.find(a => a.id === this.selectedAlbumId)
      : null;
    if (album && this.currentLevel >= 4) {
      crumbs.push({ level: 4, label: album.album, key: 'album', id: album.id });
    }

    const track = this.selectedTrackId
      ? this.starDataList.find(t => t.id === this.selectedTrackId)
      : null;
    if (track && this.currentLevel >= 5) {
      crumbs.push({ level: 5, label: track.title, key: 'song', id: track.id });
    }

    return crumbs;
  }

  /**
   * Applies the exact visual restraint rules per level (1 - 5)
   */
  applyLevelVisuals(level, camDist) {
    // When solar system is active, dim the rest of the universe
    if (this.solarSystemGroup) {
      if (this.starPoints) {
        this.starPoints.material.opacity = 0.04;
        this.starPoints.material.size = 2.0;
      }
      this.galaxiesGroup.children.forEach(c => {
        if (c.material) c.material.opacity = 0.025;
      });
      this.artistsGroup.children.forEach(c => { c.visible = false; });
      this.albumsGroup.children.forEach(c => { c.visible = false; });
      this.labelsGroup.children.forEach(c => { c.visible = false; });
      return;
    }

    // 1. Song Stars Opacity & Substantially Increased Sizes
    if (this.starPoints) {
      this.starPoints.visible = true;
      const mat = this.starPoints.material;
      if (level === 1) { mat.size = 3.6; mat.opacity = 0.35; }
      else if (level === 2) { mat.size = 5.0; mat.opacity = 0.60; }
      else if (level === 3) { mat.size = 6.5; mat.opacity = 0.78; }
      else if (level === 4) { mat.size = 8.0; mat.opacity = 0.90; }
      else { mat.size = 9.5; mat.opacity = 1.0; }
    }

    // 2. Galaxy Dust Clouds
    this.galaxiesGroup.children.forEach(cloud => {
      const isFocused = !this.focusedGalaxyId || cloud.userData.galaxyId === this.focusedGalaxyId;
      if (level === 1) {
        cloud.material.opacity = 0.14;
      } else if (level === 2) {
        cloud.material.opacity = isFocused ? 0.22 : 0.04;
      } else {
        cloud.material.opacity = isFocused ? 0.10 : 0.02;
      }
    });

    // 3. Album Orbit Rings (Level 3 & 4 only — no beacon sprites)
    this.albumsGroup.children.forEach(obj => {
      if (obj.userData.type !== 'album_ring') return;
      const isThisArtist = !this.selectedArtistName || obj.userData.artist === this.selectedArtistName;
      const isThisAlbum = !this.selectedAlbumId || obj.userData.albumId === this.selectedAlbumId;

      if (level >= 3 && isThisArtist) {
        obj.visible = true;
        obj.material.opacity = (level === 4 && isThisAlbum) ? 0.75 : 0.28;
      } else {
        obj.visible = false;
        obj.material.opacity = 0.0;
      }
    });

    // 4. Dynamic Labels Visibility (Level 1, 2, 3)
    this.labelsGroup.children.forEach(label => {
      if (label.userData.type === 'galaxy_label') {
        // Galaxy labels visible at Level 1 & 2
        label.visible = level <= 2;
      } else if (label.userData.type === 'artist_label') {
        // Artist labels visible at Level 1, 2 & 3
        const inActiveGalaxy = !this.focusedGalaxyId || label.userData.galaxyId === this.focusedGalaxyId;
        label.visible = inActiveGalaxy && (level <= 3);
      } else if (label.userData.type === 'album_label') {
        // Album labels visible at Level 3 & 4 for active artist
        const isThisArtist = !this.selectedArtistName || label.userData.artist === this.selectedArtistName;
        label.visible = isThisArtist && (level === 3 || level === 4);
      }
    });

    // 5. Progressive Connections Disclosure
    this.updateVisibleConnections(level);
  }

  /**
   * Restrained, local relationship filament rendering across 5 levels.
   */
  updateVisibleConnections(level) {
    if (this.activeConnectionLines) {
      this.connectionsGroup.remove(this.activeConnectionLines);
      if (this.activeConnectionLines.geometry) this.activeConnectionLines.geometry.dispose();
      if (this.activeConnectionLines.material) this.activeConnectionLines.material.dispose();
      this.activeConnectionLines = null;
    }

    // Filaments toggle check
    if (!this.showConnections) return;

    // LEVEL 1: ZERO LINES. Clean, spacious universe.
    if (level === 1) return;

    const trackMap = new Map();
    this.starDataList.forEach(t => trackMap.set(t.id, t));

    const linePositions = [];
    const lineColors = [];

    const activeConnsList = [];

    if (level === 5 && this.selectedTrackId) {
      // LEVEL 5 (Song): Only top connections directly tied to this focused song
      const localConns = this.connectionsData
        .filter(c => c.source === this.selectedTrackId || c.target === this.selectedTrackId)
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 5);

      localConns.forEach(conn => {
        const s = trackMap.get(conn.source);
        const t = trackMap.get(conn.target);
        if (!s || !t) return;

        linePositions.push(s.x, s.y, s.z, t.x, t.y, t.z);
        const weight = Math.max(0.2, Math.min(1.0, conn.weight || 0.6));
        const alpha = weight * 0.85;
        const cS = new THREE.Color(s.galaxy_color || '#38bdf8');
        const cT = new THREE.Color(t.galaxy_color || '#818cf8');
        lineColors.push(cS.r * alpha, cS.g * alpha, cS.b * alpha);
        lineColors.push(cT.r * alpha, cT.g * alpha, cT.b * alpha);
        activeConnsList.push(conn);
      });
    } else if (level === 4 && this.selectedAlbumId) {
      // LEVEL 4 (Album): Filaments connecting tracks within this album
      const albumTracks = this.starDataList.filter(t => t.album_id === this.selectedAlbumId).map(t => t.id);
      const albumTrackSet = new Set(albumTracks);

      const localConns = this.connectionsData
        .filter(c => albumTrackSet.has(c.source) && albumTrackSet.has(c.target))
        .slice(0, 8);

      localConns.forEach(conn => {
        const s = trackMap.get(conn.source);
        const t = trackMap.get(conn.target);
        if (!s || !t) return;

        linePositions.push(s.x, s.y, s.z, t.x, t.y, t.z);
        const weight = Math.max(0.15, Math.min(1.0, conn.weight || 0.5));
        const alpha = weight * 0.45;
        lineColors.push(0.35 * alpha, 0.75 * alpha, 1.0 * alpha);
        lineColors.push(0.35 * alpha, 0.75 * alpha, 1.0 * alpha);
        activeConnsList.push(conn);
      });
    } else if (level === 3 && this.selectedArtistName) {
      // LEVEL 3 (Artist): Restrained artist local relationships
      const artistTracks = this.starDataList.filter(t => t.artist === this.selectedArtistName).map(t => t.id);
      const artistTrackSet = new Set(artistTracks);

      const localConns = this.connectionsData
        .filter(c => artistTrackSet.has(c.source) || artistTrackSet.has(c.target))
        .slice(0, 10);

      localConns.forEach(conn => {
        const s = trackMap.get(conn.source);
        const t = trackMap.get(conn.target);
        if (!s || !t) return;

        linePositions.push(s.x, s.y, s.z, t.x, t.y, t.z);
        const weight = Math.max(0.15, Math.min(1.0, conn.weight || 0.5));
        const alpha = weight * 0.4;
        lineColors.push(0.3 * alpha, 0.7 * alpha, 0.9 * alpha);
        lineColors.push(0.5 * alpha, 0.4 * alpha, 0.9 * alpha);
        activeConnsList.push(conn);
      });
    } else if (level === 2 && this.focusedGalaxyId) {
      // LEVEL 2 (Galaxy): Subtle inter-artist filaments within this cluster only (max 10 lines)
      const galaxyTrackSet = new Set(
        this.starDataList.filter(t => t.galaxy_id === this.focusedGalaxyId).map(t => t.id)
      );

      const clusterConns = this.connectionsData
        .filter(c => galaxyTrackSet.has(c.source) && galaxyTrackSet.has(c.target) && c.weight >= 0.55)
        .slice(0, 10);

      clusterConns.forEach(conn => {
        const s = trackMap.get(conn.source);
        const t = trackMap.get(conn.target);
        if (!s || !t) return;

        linePositions.push(s.x, s.y, s.z, t.x, t.y, t.z);
        const alpha = 0.09 * (conn.weight || 0.5);
        lineColors.push(0.4 * alpha, 0.6 * alpha, 0.9 * alpha);
        lineColors.push(0.4 * alpha, 0.6 * alpha, 0.9 * alpha);
        activeConnsList.push(conn);
      });
    }

    if (linePositions.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });

    this.activeConnectionLines = new THREE.LineSegments(geometry, material);
    this.activeConnectionLines.userData = { connections: activeConnsList };
    this.connectionsGroup.add(this.activeConnectionLines);
  }

  /**
   * Smooth camera flight to focus on a Galaxy cluster (Level 2)
   */
  focusGalaxy(galaxyId) {
    this.teardownArtistSolarSystem(); // exit solar system if active
    if (!this.constellation) return;
    const galaxy = this.constellation.galaxies.find(g => g.id === galaxyId);
    if (!galaxy) return;

    this.focusedGalaxyId = galaxyId;
    this.selectedArtistName = null;
    this.selectedAlbumId = null;
    this.selectedTrackId = null;
    this.selectionRingMesh.visible = false;

    const [gx, gy, gz] = galaxy.centroid;
    const targetLookAt = new THREE.Vector3(gx, gy, gz);
    const viewDist = Math.max(90, (galaxy.radius || 40) * 1.8);
    const targetCamPos = targetLookAt.clone().add(new THREE.Vector3(0, viewDist * 0.35, viewDist));

    this.flyTo(targetLookAt, targetCamPos, 650, () => {
      this.updateProgressiveDisclosure(true);
    });
  }

  /**
   * Smooth camera flight to focus on a Syndicate (Level 3)
   * Builds a Syndicate Command Cluster centered on the syndicate.
   */
  focusArtist(artistName) {
    const art = this.artistDataList.find(a => a.artist.toLowerCase() === artistName.toLowerCase());
    if (!art) return;

    this.selectedArtistName = art.artist;
    this.focusedGalaxyId = art.galaxy_id;
    this.selectedAlbumId = null;
    this.selectedTrackId = null;
    this.selectionRingMesh.visible = false;

    // Build the procedural solar system
    const systemRadius = this.buildArtistSolarSystem(art.artist);

    const [ax, ay, az] = art.centroid;
    const targetLookAt = new THREE.Vector3(ax, ay, az);
    // Frame the whole system: camera above and behind
    const camDist = Math.max(90, systemRadius * 2.6 + 30);
    const targetCamPos = new THREE.Vector3(ax, ay + camDist * 0.3, az + camDist);

    this.flyTo(targetLookAt, targetCamPos, 700, () => {
      this.updateProgressiveDisclosure(true);
    });
  }

  /**
   * Smooth camera flight to focus on an Album (Level 4)
   * When in solar system mode, flies to the planet's position.
   */
  focusAlbum(albumId) {
    const alb = this.albumsDataList.find(a => a.id === albumId);
    if (!alb) return;

    this.selectedAlbumId = alb.id;
    this.selectedArtistName = alb.artist;
    this.focusedGalaxyId = alb.galaxy_id;
    this.selectedTrackId = null;
    this.selectionRingMesh.visible = false;

    // If solar system is active, fly to the planet position
    if (this.solarSystemGroup && this.solarPlanetPositions.has(albumId)) {
      const planetPos = this.solarPlanetPositions.get(albumId);
      const targetLookAt = planetPos.clone();
      const targetCamPos = planetPos.clone().add(new THREE.Vector3(0, 18, 48));
      this.flyTo(targetLookAt, targetCamPos, 550, () => {
        this.updateProgressiveDisclosure(true);
      });
      return;
    }

    const [cx, cy, cz] = alb.centroid;
    const targetLookAt = new THREE.Vector3(cx, cy, cz);
    const viewDist = Math.max(35, alb.radius * 2.2);
    const targetCamPos = targetLookAt.clone().add(new THREE.Vector3(0, viewDist * 0.35, viewDist));
    this.flyTo(targetLookAt, targetCamPos, 580, () => {
      this.updateProgressiveDisclosure(true);
    });
  }

  /**
   * Smooth camera flight to focus on a Song Star (Level 5)
   * When in solar system mode, flies to the moon's position.
   */
  focusTrack(trackId) {
    const track = this.starDataList.find(t => t.id === trackId);
    if (!track) return;

    this.selectedTrackId = track.id;
    this.selectedAlbumId = track.album_id || null;
    this.selectedArtistName = track.artist;
    // If not in solar system, enter the artist's solar system first so the song is in context
    if (!this.solarSystemGroup && track.artist) {
      const art = this.artistDataList.find(a => a.artist.toLowerCase() === track.artist.toLowerCase());
      if (art) {
        this.buildArtistSolarSystem(art.artist);
      }
    }

    // If solar system is active, fly to the moon's position and highlight local network
    if (this.solarSystemGroup && this.solarMoonPositions.has(trackId)) {
      const moonPos = this.solarMoonPositions.get(trackId);
      this.selectionRingMesh.position.copy(moonPos);
      this.selectionRingMesh.visible = true;

      // 1. Identify related songs
      let relatedIds = [];
      let relatedTracks = [];
      if (this.options.getRelatedTracks) {
        relatedTracks = this.options.getRelatedTracks(trackId, 4) || [];
        relatedIds = relatedTracks.map(r => r.track?.id || r.id);
      } else {
        const conns = this.connectionsData
          .filter(c => c.source === trackId || c.target === trackId)
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 4);
        relatedIds = conns.map(c => c.source === trackId ? c.target : c.source);
        relatedTracks = conns.map(c => ({
          id: c.source === trackId ? c.target : c.source,
          score: c.weight,
          explanation: c.explanation
        }));
      }
      const relatedSet = new Set(relatedIds);

      // Clean old local filaments
      if (this.solarFilamentsLine) {
        this.solarSystemGroup.remove(this.solarFilamentsLine);
        if (this.solarFilamentsLine.geometry) this.solarFilamentsLine.geometry.dispose();
        if (this.solarFilamentsLine.material) this.solarFilamentsLine.material.dispose();
        this.solarFilamentsLine = null;
      }

      // Draw local filaments between focused moon and related moons
      const filamentPoints = [];
      const filamentColors = [];
      const filamentConns = [];

      this.solarSystemGroup.children.forEach(child => {
        if (child.userData.type === 'solar_song') {
          const tid = child.userData.trackId;
          if (tid === trackId) {
            child.scale.set(13.5, 13.5, 1);
            child.material.opacity = 1.0;
          } else if (relatedSet.has(tid)) {
            child.scale.set(10.5, 10.5, 1);
            child.material.opacity = 0.95;
            const myRelX = moonPos.x - this.solarSystemGroup.position.x;
            const myRelY = moonPos.y - this.solarSystemGroup.position.y;
            const myRelZ = moonPos.z - this.solarSystemGroup.position.z;
            filamentPoints.push(myRelX, myRelY, myRelZ, child.position.x, child.position.y, child.position.z);
            filamentColors.push(0.35, 0.85, 1.0, 0.45, 0.65, 1.0);

            const relItem = (relatedTracks || []).find(r => (r.track?.id || r.id) === tid);
            const targetTrack = this.starDataList.find(t => t.id === tid);
            let explanation = relItem?.explanation;
            if (!explanation) {
              if (targetTrack && targetTrack.album_id === track.album_id) {
                explanation = `Same album · ${track.album || 'Album'}`;
              } else {
                explanation = 'Same artist';
              }
            }
            filamentConns.push({
              source: trackId,
              target: tid,
              weight: relItem?.score || 0.85,
              explanation
            });
          } else {
            child.scale.set(8.5, 8.5, 1);
            child.material.opacity = 0.28;
          }
        }
      });

      if (filamentPoints.length > 0) {
        const fGeo = new THREE.BufferGeometry();
        fGeo.setAttribute('position', new THREE.Float32BufferAttribute(filamentPoints, 3));
        fGeo.setAttribute('color', new THREE.Float32BufferAttribute(filamentColors, 3));
        const fMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.92,
          depthWrite: false
        });
        this.solarFilamentsLine = new THREE.LineSegments(fGeo, fMat);
        this.solarFilamentsLine.userData = { connections: filamentConns };
        this.solarSystemGroup.add(this.solarFilamentsLine);
      }

      const targetLookAt = moonPos.clone();
      const targetCamPos = moonPos.clone().add(new THREE.Vector3(0, 7, 24));
      this.flyTo(targetLookAt, targetCamPos, 480, () => {
        this.updateProgressiveDisclosure(true);
      });
      return;
    }

    // Normal track focus if solar system was not available
    this.selectionRingMesh.position.set(track.x, track.y, track.z);
    this.selectionRingMesh.visible = true;
    const targetLookAt = new THREE.Vector3(track.x, track.y, track.z);
    const targetCamPos = targetLookAt.clone().add(new THREE.Vector3(0, 10, 46));
    this.flyTo(targetLookAt, targetCamPos, 550, () => {
      this.updateProgressiveDisclosure(true);
    });
  }

  /**
   * Smooth travel to any level in the hierarchy (e.g. from breadcrumb click)
   */
  flyToLevel(targetLevel) {
    if (targetLevel === 1) {
      this.resetCamera(true);
    } else if (targetLevel === 2) {
      const gid = this.focusedGalaxyId || (this.constellation?.galaxies[0]?.id);
      if (gid) this.focusGalaxy(gid);
    } else if (targetLevel === 3) {
      const art = this.selectedArtistName || (this.artistDataList[0]?.artist);
      if (art) this.focusArtist(art);
    } else if (targetLevel === 4) {
      const alb = this.selectedAlbumId || (this.albumsDataList[0]?.id);
      if (alb) this.focusAlbum(alb);
    } else if (targetLevel === 5) {
      const tid = this.selectedTrackId || (this.starDataList[0]?.id);
      if (tid) this.focusTrack(tid);
    }
  }

  /**
   * Universal search flight navigation (Artist -> Album -> Track -> Galaxy)
   */
  searchAndFlyTo(query) {
    if (!query || !this.constellation) return false;
    const q = query.trim().toLowerCase();

    // 1. Check artist match
    const artMatch = this.artistDataList.find(a => a.artist.toLowerCase().includes(q));
    if (artMatch) {
      this.focusArtist(artMatch.artist);
      if (this.options.onSelectArtist) this.options.onSelectArtist(artMatch.artist);
      return true;
    }

    // 2. Check album match
    const albMatch = this.albumsDataList.find(a => a.album.toLowerCase().includes(q));
    if (albMatch) {
      this.focusAlbum(albMatch.id);
      if (this.options.onSelectAlbum) this.options.onSelectAlbum(albMatch);
      return true;
    }

    // 3. Check track title match
    const trackMatch = this.starDataList.find(t => t.title.toLowerCase().includes(q));
    if (trackMatch) {
      this.focusTrack(trackMatch.id);
      if (this.options.onSelectTrack) this.options.onSelectTrack(trackMatch);
      return true;
    }

    // 4. Check galaxy name match
    const galaxyMatch = this.constellation.galaxies.find(g => g.name.toLowerCase().includes(q));
    if (galaxyMatch) {
      this.focusGalaxy(galaxyMatch.id);
      if (this.options.onSelectGalaxy) this.options.onSelectGalaxy(galaxyMatch);
      return true;
    }

    return false;
  }

  /**
   * Reset camera to distant Universe view (Level 1)
   */
  resetCamera(smooth = true) {
    this.teardownArtistSolarSystem(); // exit solar system if active
    this.focusedGalaxyId = null;
    this.selectedArtistName = null;
    this.selectedAlbumId = null;
    this.selectedTrackId = null;
    this.selectionRingMesh.visible = false;

    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const targetCamPos = new THREE.Vector3(0, 160, 620);

    if (smooth) {
      this.flyTo(targetLookAt, targetCamPos, 700, () => {
        this.updateProgressiveDisclosure(true);
      });
    } else {
      this.controls.target.copy(targetLookAt);
      this.camera.position.copy(targetCamPos);
      this.controls.update();
      this.updateProgressiveDisclosure(true);
    }
  }

  /**
   * Applies multi-faceted filter (Genre, Playlist, Timeline, Entity Types) directly affecting 3D scene
   */
  setFilter(filterCriteria = {}) {
    this.activeFilter = {
      ...this.activeFilter,
      ...filterCriteria
    };

    if (!this.starPoints || !this.starDataList.length) {
      return { songs: 0, artists: 0, albums: 0 };
    }

    const colorsAttr = this.starPoints.geometry.attributes.color;
    const colors = colorsAttr.array;
    let matchSongCount = 0;
    const matchingArtists = new Set();
    const matchingAlbums = new Set();
    const matchingGalaxies = new Set();
    const matchingTrackIds = new Set();

    const { genre, playlist, yearMin, yearMax, entityTypes } = this.activeFilter;
    const isGenreActive = genre && genre !== 'ALL';
    const isPlaylistActive = playlist && playlist !== 'ALL';
    const isYearMinActive = yearMin !== null && yearMin !== undefined;
    const isYearMaxActive = yearMax !== null && yearMax !== undefined;

    const showArtists = !entityTypes || entityTypes.artists !== false;
    const showAlbums = !entityTypes || entityTypes.albums !== false;
    const showSongs = !entityTypes || entityTypes.songs !== false;

    for (let i = 0; i < this.starDataList.length; i++) {
      const track = this.starDataList[i];
      let matches = true;

      if (isGenreActive) {
        if (!track.genre || !track.genre.toLowerCase().includes(genre.toLowerCase())) {
          matches = false;
        }
      }

      if (matches && isPlaylistActive) {
        if (!track.playlist || !track.playlist.toLowerCase().includes(playlist.toLowerCase())) {
          matches = false;
        }
      }

      if (matches && (isYearMinActive || isYearMaxActive)) {
        if (track.year) {
          if (isYearMinActive && track.year < yearMin) matches = false;
          if (isYearMaxActive && track.year > yearMax) matches = false;
        }
      }

      if (matches) {
        matchSongCount++;
        matchingTrackIds.add(track.id);
        if (track.artist) matchingArtists.add(track.artist.toLowerCase().trim());
        if (track.album_id) matchingAlbums.add(track.album_id);
        if (track.galaxy_id) matchingGalaxies.add(track.galaxy_id);

        const c = new THREE.Color(track.galaxy_color || '#38bdf8');
        colors[i * 3] = showSongs ? c.r : 0.02;
        colors[i * 3 + 1] = showSongs ? c.g : 0.02;
        colors[i * 3 + 2] = showSongs ? c.b : 0.03;
      } else {
        // Dim non-matching stars to near-invisible
        colors[i * 3] = 0.015;
        colors[i * 3 + 1] = 0.015;
        colors[i * 3 + 2] = 0.025;
      }
    }

    colorsAttr.needsUpdate = true;

    // Filter Artists
    const isAnyFilterActive = isGenreActive || isPlaylistActive || isYearMinActive || isYearMaxActive;
    this.artistsGroup.children.forEach(sprite => {
      const artName = (sprite.userData.artist || '').toLowerCase().trim();
      if (!showArtists) {
        sprite.visible = false;
      } else if (isAnyFilterActive) {
        sprite.visible = matchingArtists.has(artName);
      } else {
        sprite.visible = true;
      }
    });

    // Filter Labels
    this.labelsGroup.children.forEach(label => {
      const type = label.userData.type;
      if (type === 'artist_label') {
        const artName = (label.userData.artist || '').toLowerCase().trim();
        if (!showArtists) {
          label.visible = false;
        } else if (isAnyFilterActive) {
          label.visible = matchingArtists.has(artName);
        } else {
          // progressive disclosure handles distance
        }
      } else if (type === 'album_label') {
        if (!showAlbums) {
          label.visible = false;
        } else if (isAnyFilterActive) {
          label.visible = matchingAlbums.has(label.userData.albumId);
        }
      } else if (type === 'galaxy_label') {
        if (isAnyFilterActive) {
          label.visible = matchingGalaxies.has(label.userData.galaxyId);
        }
      }
    });

    // Filter Album rings
    this.albumsGroup.children.forEach(ring => {
      if (!showAlbums) {
        ring.visible = false;
      } else if (isAnyFilterActive) {
        ring.visible = matchingAlbums.has(ring.userData.albumId);
      }
    });

    // Filter Solar System (if active)
    if (this.solarSystemGroup) {
      this.solarSystemGroup.children.forEach(child => {
        if (child.userData.type === 'solar_song') {
          const isMatch = matchingTrackIds.has(child.userData.trackId);
          child.material.opacity = isMatch ? 0.90 : 0.12;
        } else if (child.userData.type === 'solar_album') {
          const isMatch = matchingAlbums.has(child.userData.albumId);
          child.material.opacity = isMatch ? 0.96 : 0.15;
        }
      });
    }

    this.matchingTrackIds = matchingTrackIds;
    this.updateVisibleConnections(this.currentLevel);

    return {
      songs: matchSongCount,
      artists: matchingArtists.size,
      albums: matchingAlbums.size
    };
  }

  /**
   * Toggles relationship filaments on/off
   */
  setConnectionsVisible(visible) {
    this.showConnections = !!visible;
    this.connectionsGroup.visible = this.showConnections;
    if (this.showConnections) {
      this.updateVisibleConnections(this.currentLevel);
    }
  }

  /**
   * Toggles between 3D Universe and 2D Celestial Chart mode
   */
  set2DMode(is2D) {
    this.is2DMode = !!is2D;

    if (this.is2DMode) {
      this.saved3DCamera = {
        pos: this.camera.position.clone(),
        target: this.controls.target.clone()
      };

      const targetLookAt = new THREE.Vector3(0, 0, 0);
      const targetCamPos = new THREE.Vector3(0, 520, 0.001);

      this.controls.maxPolarAngle = 0.001;
      this.controls.minPolarAngle = 0.001;

      this.flyTo(targetLookAt, targetCamPos, 700, () => {
        this.updateProgressiveDisclosure(true);
      });
    } else {
      this.controls.maxPolarAngle = Math.PI - 0.08;
      this.controls.minPolarAngle = 0.08;

      const restorePos = this.saved3DCamera?.pos || new THREE.Vector3(0, 160, 620);
      const restoreTarget = this.saved3DCamera?.target || new THREE.Vector3(0, 0, 0);

      this.flyTo(restoreTarget, restorePos, 700, () => {
        this.updateProgressiveDisclosure(true);
      });
    }
  }

  /**
   * Smooth camera flight interpolation
   */
  flyTo(targetLookAt, targetCameraPos, duration = 600, onComplete = null) {
    this.flightState = {
      startCamPos: this.camera.position.clone(),
      targetCamPos: targetCameraPos.clone(),
      startLookAt: this.controls.target.clone(),
      targetLookAt: targetLookAt.clone(),
      startTime: performance.now(),
      duration,
      onComplete
    };
  }

  /**
   * Raycasting & Interactive events
   */
  initEventListeners() {
    const dom = this.renderer.domElement;

    // Hover detection
    dom.addEventListener('mousemove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.checkHover(e.clientX, e.clientY);
    });

    dom.addEventListener('mouseleave', () => {
      this.mouse.set(-999, -999);
      if (this.hoveredTrackId !== null) {
        this.hoveredTrackId = null;
        dom.style.cursor = 'grab';
        if (this.options.onHoverObject) this.options.onHoverObject(null);
      }
    });

    // Click handling
    let downPos = { x: 0, y: 0 };
    dom.addEventListener('mousedown', (e) => {
      downPos = { x: e.clientX, y: e.clientY };
      dom.style.cursor = 'grabbing';
    });

    dom.addEventListener('mouseup', (e) => {
      dom.style.cursor = this.hoveredTrackId ? 'pointer' : 'grab';
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 4) {
        this.handleClick(e);
      }
    });

    // Double click to dive deeper
    dom.addEventListener('dblclick', () => {
      if (this.hoveredTrackId) {
        this.focusTrack(this.hoveredTrackId);
        const trk = this.starDataList.find(t => t.id === this.hoveredTrackId);
        if (trk && this.options.onSelectTrack) this.options.onSelectTrack(trk);
      } else if (this.hoveredAlbumId) {
        this.focusAlbum(this.hoveredAlbumId);
        const alb = this.albumsDataList.find(a => a.id === this.hoveredAlbumId);
        if (alb && this.options.onSelectAlbum) this.options.onSelectAlbum(alb);
      } else if (this.hoveredArtistName) {
        this.focusArtist(this.hoveredArtistName);
        if (this.options.onSelectArtist) this.options.onSelectArtist(this.hoveredArtistName);
      }
    });

    // Window / container resize
    const resizeObserver = new ResizeObserver(() => this.onResize());
    resizeObserver.observe(this.container);
  }

  checkHover(clientX, clientY) {
    if (this.flightState) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 0. Check Solar System Objects & Labels
    if (this.solarSystemGroup) {
      const solarInteractive = this.solarSystemGroup.children.filter(c =>
        c.visible && (c.userData.type?.startsWith('solar_'))
      );
      const hits = this.raycaster.intersectObjects(solarInteractive);
      if (hits.length > 0) {
        this.renderer.domElement.style.cursor = 'pointer';
        const hit = hits[0].object;
        const u = hit.userData;
        if (u.type === 'solar_song' || u.type === 'solar_song_label') {
          const track = this.starDataList.find(t => t.id === u.trackId);
          if (track && this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'track', data: track }, clientX, clientY);
          }
        } else if (u.type === 'solar_album' || u.type === 'solar_album_label') {
          const album = this.albumsDataList.find(a => a.id === u.albumId);
          if (album && this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'album', data: album }, clientX, clientY);
          }
        } else if (u.type === 'solar_sun' || u.type === 'solar_sun_label') {
          const artist = this.artistDataList.find(a => a.artist === u.artist);
          if (artist && this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'artist', data: artist }, clientX, clientY);
          }
        }
        return;
      }
    }

    // 1. Check Labels (Artist, Galaxy, Album)
    const visibleLabels = this.labelsGroup.children.filter(c => c.visible);
    if (visibleLabels.length > 0) {
      const labelHits = this.raycaster.intersectObjects(visibleLabels);
      if (labelHits.length > 0) {
        this.renderer.domElement.style.cursor = 'pointer';
        const hit = labelHits[0].object;
        const u = hit.userData;
        if (u.type === 'artist_label') {
          const artist = this.artistDataList.find(a => a.artist === u.artist);
          if (artist && this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'artist', data: artist }, clientX, clientY);
          }
        } else if (u.type === 'galaxy_label') {
          const galaxy = this.constellation?.galaxies.find(g => g.id === u.galaxyId);
          if (galaxy && this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'galaxy', data: galaxy }, clientX, clientY);
          }
        }
        return;
      }
    }

    // 2. Check Artist Anchors (Cross sprites)
    if (this.artistsGroup.children.length > 0) {
      const visibleArtists = this.artistsGroup.children.filter(c => c.userData.type === 'artist' && c.visible);
      const artistIntersects = this.raycaster.intersectObjects(visibleArtists);
      if (artistIntersects.length > 0) {
        const hit = artistIntersects[0].object;
        const artist = this.artistDataList.find(a => a.artist === hit.userData.artist);
        if (artist) {
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'artist', data: artist }, clientX, clientY);
          }
          return;
        }
      }
    }

    // 3. Check Galaxy Clouds
    if (this.galaxiesGroup.children.length > 0) {
      const visibleClouds = this.galaxiesGroup.children.filter(c => c.visible && c.userData.galaxyId);
      const cloudHits = this.raycaster.intersectObjects(visibleClouds);
      if (cloudHits.length > 0) {
        this.renderer.domElement.style.cursor = 'pointer';
        const hit = cloudHits[0].object;
        const galaxy = this.constellation?.galaxies.find(g => g.id === hit.userData.galaxyId);
        if (galaxy && this.options.onHoverObject) {
          this.options.onHoverObject({ type: 'galaxy', data: galaxy }, clientX, clientY);
        }
        return;
      }
    }

    // 4. Check Album Orbit Rings
    if (this.albumsGroup.children.length > 0) {
      const visibleAlbums = this.albumsGroup.children.filter(c => c.userData.type === 'album_ring' && c.visible);
      const albumIntersects = this.raycaster.intersectObjects(visibleAlbums);
      if (albumIntersects.length > 0) {
        const hit = albumIntersects[0].object;
        const album = this.albumsDataList.find(a => a.id === hit.userData.albumId);
        if (album) {
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'album', data: album }, clientX, clientY);
          }
          return;
        }
      }
    }

    // 5. Check Song Stars
    if (this.starPoints && this.starPoints.visible) {
      const starIntersects = this.raycaster.intersectObject(this.starPoints);
      if (starIntersects.length > 0) {
        const idx = starIntersects[0].index;
        const track = this.starDataList[idx];
        if (track) {
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.options.onHoverObject) {
            this.options.onHoverObject({ type: 'track', data: track }, clientX, clientY);
          }
          return;
        }
      }
    }

    // 6. Check Connection Lines & Filaments
    if (this.showConnections) {
      if (this.solarFilamentsLine && this.solarFilamentsLine.visible) {
        this.raycaster.params.Line = { threshold: 4.5 };
        const fHits = this.raycaster.intersectObject(this.solarFilamentsLine);
        if (fHits.length > 0) {
          const conns = this.solarFilamentsLine.userData?.connections || [];
          const segIdx = Math.floor((fHits[0].index || 0) / 2);
          const conn = conns[segIdx] || conns[0];
          if (conn && this.options.onHoverObject) {
            this.renderer.domElement.style.cursor = 'help';
            this.options.onHoverObject({ type: 'connection', data: conn }, clientX, clientY);
            return;
          }
        }
      }

      if (this.activeConnectionLines && this.activeConnectionLines.visible) {
        this.raycaster.params.Line = { threshold: 4.5 };
        const lineHits = this.raycaster.intersectObject(this.activeConnectionLines);
        if (lineHits.length > 0) {
          const conns = this.activeConnectionLines.userData?.connections || [];
          const segIdx = Math.floor((lineHits[0].index || 0) / 2);
          const conn = conns[segIdx] || conns[0];
          if (conn && this.options.onHoverObject) {
            this.renderer.domElement.style.cursor = 'help';
            this.options.onHoverObject({ type: 'connection', data: conn }, clientX, clientY);
            return;
          }
        }
      }
    }

    // Clear hover if nothing intersected
    this.hoveredTrackId = null;
    this.hoveredAlbumId = null;
    this.hoveredArtistName = null;
    this.renderer.domElement.style.cursor = 'grab';
    if (this.options.onHoverObject) {
      this.options.onHoverObject(null);
    }
  }

  handleClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 0. Solar System objects take priority when active
    if (this.solarSystemGroup) {
      const solarInteractive = this.solarSystemGroup.children.filter(c =>
        c.visible && (c.userData.type?.startsWith('solar_'))
      );
      const solarHits = this.raycaster.intersectObjects(solarInteractive);
      if (solarHits.length > 0) {
        const hit = solarHits[0].object;
        const u = hit.userData;
        if (u.type === 'solar_album' || u.type === 'solar_album_label') {
          const album = this.albumsDataList.find(a => a.id === u.albumId);
          if (album) {
            this.focusAlbum(album.id);
            if (this.options.onSelectAlbum) this.options.onSelectAlbum(album);
          }
          return;
        }
        if (u.type === 'solar_song' || u.type === 'solar_song_label') {
          const track = this.starDataList.find(t => t.id === u.trackId);
          if (track) {
            this.focusTrack(track.id);
            if (this.options.onSelectTrack) this.options.onSelectTrack(track);
          }
          return;
        }
        if (u.type === 'solar_sun' || u.type === 'solar_sun_label') {
          if (this.options.onSelectArtist) this.options.onSelectArtist(u.artist);
          return;
        }
      }
      return; // inside solar system — no regular constellation clicks
    }

    // 1. Check Labels (Artist labels, Galaxy labels, Album labels)
    const visibleLabels = this.labelsGroup.children.filter(c => c.visible);
    if (visibleLabels.length > 0) {
      const labelHits = this.raycaster.intersectObjects(visibleLabels);
      if (labelHits.length > 0) {
        const hit = labelHits[0].object;
        const u = hit.userData;
        if (u.type === 'artist_label') {
          this.focusArtist(u.artist);
          if (this.options.onSelectArtist) this.options.onSelectArtist(u.artist);
          return;
        }
        if (u.type === 'galaxy_label') {
          this.focusGalaxy(u.galaxyId);
          if (this.options.onSelectGalaxy) this.options.onSelectGalaxy(u.galaxyId);
          return;
        }
        if (u.type === 'album_label') {
          this.focusAlbum(u.albumId);
          const album = this.albumsDataList.find(a => a.id === u.albumId);
          if (album && this.options.onSelectAlbum) this.options.onSelectAlbum(album);
          return;
        }
      }
    }

    // 2. Check Artist Anchors (4-spike cross sprites)
    if (this.artistsGroup.children.length > 0) {
      const visibleArtists = this.artistsGroup.children.filter(c => c.userData.type === 'artist' && c.visible);
      const artistIntersects = this.raycaster.intersectObjects(visibleArtists);
      if (artistIntersects.length > 0) {
        const hit = artistIntersects[0].object;
        const artist = this.artistDataList.find(a => a.artist === hit.userData.artist);
        if (artist) {
          this.focusArtist(artist.artist);
          if (this.options.onSelectArtist) this.options.onSelectArtist(artist.artist);
          return;
        }
      }
    }

    // 3. Check Galaxy Clouds
    if (this.galaxiesGroup.children.length > 0) {
      const visibleClouds = this.galaxiesGroup.children.filter(c => c.visible && c.userData.galaxyId);
      const cloudHits = this.raycaster.intersectObjects(visibleClouds);
      if (cloudHits.length > 0) {
        const hit = cloudHits[0].object;
        if (hit.userData.galaxyId) {
          this.focusGalaxy(hit.userData.galaxyId);
          if (this.options.onSelectGalaxy) this.options.onSelectGalaxy(hit.userData.galaxyId);
          return;
        }
      }
    }

    // 4. Check Album Rings
    if (this.albumsGroup.children.length > 0) {
      const visibleAlbumRings = this.albumsGroup.children.filter(c => c.userData.type === 'album_ring' && c.visible);
      const albumIntersects = this.raycaster.intersectObjects(visibleAlbumRings);
      if (albumIntersects.length > 0) {
        const hit = albumIntersects[0].object;
        const album = this.albumsDataList.find(a => a.id === hit.userData.albumId);
        if (album) {
          this.focusAlbum(album.id);
          if (this.options.onSelectAlbum) this.options.onSelectAlbum(album);
          return;
        }
      }
    }

    // 5. Check Song Stars
    if (this.starPoints && this.starPoints.visible) {
      const starIntersects = this.raycaster.intersectObject(this.starPoints);
      if (starIntersects.length > 0) {
        const idx = starIntersects[0].index;
        const track = this.starDataList[idx];
        if (track) {
          this.focusTrack(track.id);
          if (this.options.onSelectTrack) this.options.onSelectTrack(track);
          return;
        }
      }
    }
  }

  /**
   * Searches across artists, albums, songs, and galaxies and navigates directly
   */
  searchAndFlyTo(query) {
    if (!query || !query.trim()) return false;
    const q = query.trim().toLowerCase();

    // 1. Search Artists
    const art = this.artistDataList.find(a => a.artist.toLowerCase().includes(q));
    if (art) {
      this.focusArtist(art.artist);
      if (this.options.onSelectArtist) this.options.onSelectArtist(art.artist);
      return true;
    }

    // 2. Search Tracks
    const trk = this.starDataList.find(t => t.title.toLowerCase().includes(q));
    if (trk) {
      this.focusTrack(trk.id);
      if (this.options.onSelectTrack) this.options.onSelectTrack(trk);
      return true;
    }

    // 3. Search Albums
    const alb = this.albumsDataList.find(a => a.album.toLowerCase().includes(q));
    if (alb) {
      this.focusAlbum(alb.id);
      if (this.options.onSelectAlbum) this.options.onSelectAlbum(alb);
      return true;
    }

    // 4. Search Galaxies
    const gal = (this.constellation?.galaxies || []).find(g => g.name.toLowerCase().includes(q));
    if (gal) {
      this.focusGalaxy(gal.id);
      if (this.options.onSelectGalaxy) this.options.onSelectGalaxy(gal.id);
      return true;
    }

    return false;
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Main Render Loop
   */
  startLoop() {
    const animate = () => {
      this.animId = requestAnimationFrame(animate);

      const elapsed = this.clock.getElapsedTime();

      // Subtle celestial drift of ambient starfield
      this.starfieldGroup.rotation.y = elapsed * 0.003;

      // Animate selection ring orientation & breathing pulse
      if (this.selectionRingMesh.visible) {
        this.selectionRingMesh.lookAt(this.camera.position);
        const pulse = 1.0 + 0.12 * Math.sin(elapsed * 4.0);
        this.selectionRingMesh.scale.set(pulse, pulse, 1.0);
      }

      // Smooth camera flight
      if (this.flightState) {
        const { startCamPos, targetCamPos, startLookAt, targetLookAt, startTime, duration, onComplete } = this.flightState;
        const now = performance.now();
        const progress = Math.min(1.0, (now - startTime) / duration);

        // Smooth cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3);

        this.camera.position.lerpVectors(startCamPos, targetCamPos, ease);
        this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);

        if (progress >= 1.0) {
          this.flightState = null;
          if (onComplete) onComplete();
        }
      }

      this.controls.update();

      // Continuously update progressive disclosure based on user navigation
      this.updateProgressiveDisclosure(false);

      this.renderer.render(this.scene, this.camera);
    };

    this.animId = requestAnimationFrame(animate);
  }

  dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.clearDynamicObjects();
    this.renderer.dispose();
  }
}
