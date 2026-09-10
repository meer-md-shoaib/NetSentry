/**
 * NetSentry — 3D Dimensionality Reduction for Criminal Networks
 * Deterministic UMAP & Classical Multidimensional Scaling (MDS) implementation.
 * Fixed PRNG seed guarantees 100% mathematical reproducibility for the same dataset.
 */

/**
 * Mulberry32 deterministic Pseudo-Random Number Generator (PRNG)
 */
export function createPRNG(seed = 42) {
  let s = Math.floor(seed);
  return function() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Classical Multidimensional Scaling (MDS)
 * Projects high-dimensional distance matrix into 3D Euclidean coordinates.
 */
export function computeClassicalMDS(distMatrix, targetDims = 3) {
  const n = distMatrix.length;
  if (n < targetDims) {
    // Trivial fallback for very small datasets
    const coords = [];
    for (let i = 0; i < n; i++) {
      coords.push([(i - n / 2) * 20, 0, 0]);
    }
    return coords;
  }

  // 1. Compute squared distance matrix D2
  const D2 = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const d = distMatrix[i][j];
      D2[i * n + j] = d * d;
    }
  }

  // 2. Double centering matrix B = -0.5 * H * D2 * H
  // where H = I - (1/n)*ones
  const rowMeans = new Float64Array(n);
  const colMeans = new Float64Array(n);
  let totalMean = 0;

  for (let i = 0; i < n; i++) {
    let rSum = 0;
    for (let j = 0; j < n; j++) {
      rSum += D2[i * n + j];
    }
    rowMeans[i] = rSum / n;
    totalMean += rSum;
  }
  totalMean /= (n * n);

  for (let j = 0; j < n; j++) {
    let cSum = 0;
    for (let i = 0; i < n; i++) {
      cSum += D2[i * n + j];
    }
    colMeans[j] = cSum / n;
  }

  const B = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      B[i * n + j] = -0.5 * (D2[i * n + j] - rowMeans[i] - colMeans[j] + totalMean);
    }
  }

  // 3. Power iteration to find top 3 eigenvectors and eigenvalues
  const coords = [];
  for (let i = 0; i < n; i++) {
    coords.push(new Float64Array(targetDims));
  }

  const deflatedB = new Float64Array(B);

  for (let dim = 0; dim < targetDims; dim++) {
    // Initial random vector from fixed PRNG
    let vec = new Float64Array(n);
    const rng = createPRNG(1337 + dim * 101);
    for (let i = 0; i < n; i++) {
      vec[i] = rng() - 0.5;
    }

    // Normalize
    let norm = 0;
    for (let i = 0; i < n; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < n; i++) vec[i] /= norm;

    let eigenvalue = 0;
    const maxIters = 60;

    for (let iter = 0; iter < maxIters; iter++) {
      const nextVec = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        const rowOffset = i * n;
        for (let j = 0; j < n; j++) {
          sum += deflatedB[rowOffset + j] * vec[j];
        }
        nextVec[i] = sum;
      }

      let nextNorm = 0;
      for (let i = 0; i < n; i++) nextNorm += nextVec[i] * nextVec[i];
      nextNorm = Math.sqrt(nextNorm);

      if (nextNorm === 0) break;
      eigenvalue = nextNorm;

      for (let i = 0; i < n; i++) {
        vec[i] = nextVec[i] / nextNorm;
      }
    }

    const scale = Math.sqrt(Math.max(0, eigenvalue));
    for (let i = 0; i < n; i++) {
      coords[i][dim] = vec[i] * scale;
    }

    // Deflate matrix: B' = B - lambda * (v * v^T)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        deflatedB[i * n + j] -= eigenvalue * vec[i] * vec[j];
      }
    }
  }

  return coords.map(c => Array.from(c));
}

/**
 * UMAP-inspired Stochastic Gradient Descent 3D Manifold Embedding
 * Employs k-Nearest Neighbor graph for selective attraction and negative sampling
 * for dispersion, with adaptive step-size normalization to guarantee numerical stability.
 */
export function computeUMAP3D(distMatrix, options = {}) {
  const {
    nEpochs = 90,
    seed = 42,
    bound = 85
  } = options;

  const n = distMatrix.length;
  if (n <= 3) {
    return computeClassicalMDS(distMatrix, 3);
  }

  const rng = createPRNG(seed);

  // 1. Initial coordinates from deterministic Classical MDS, with variance check
  let coords = computeClassicalMDS(distMatrix, 3);
  let variance = 0;
  for (let i = 0; i < n; i++) {
    variance += coords[i][0] * coords[i][0] + coords[i][1] * coords[i][1] + coords[i][2] * coords[i][2];
  }

  // If MDS returned degenerate coordinates (e.g. all 0), initialize with spherical PRNG dispersion
  if (variance < 0.1 || !Number.isFinite(variance)) {
    coords = [];
    for (let i = 0; i < n; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 25 * Math.cbrt(rng());
      coords.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ]);
    }
  }

  // 2. Construct k-NN Graph for targeted topological attraction
  const k = Math.min(12, Math.max(2, n - 1));
  const knn = [];
  for (let i = 0; i < n; i++) {
    const neighbors = [];
    for (let j = 0; j < n; j++) {
      if (i !== j) neighbors.push({ idx: j, dist: distMatrix[i][j] });
    }
    neighbors.sort((a, b) => a.dist - b.dist);
    knn.push(neighbors.slice(0, k));
  }

  const nNegativeSamples = 5;
  const learningRate = 1.0;

  // 3. Optimization Loop with Adaptive Step Size & Gradient Clipping
  for (let epoch = 0; epoch < nEpochs; epoch++) {
    const alpha = (learningRate * (1.0 - epoch / nEpochs)) / Math.max(1, Math.sqrt(n));

    for (let i = 0; i < n; i++) {
      let gx = 0, gy = 0, gz = 0;

      // Attractive forces along k-NN edges only
      for (const nb of knn[i]) {
        const j = nb.idx;
        const dx = coords[i][0] - coords[j][0];
        const dy = coords[i][1] - coords[j][1];
        const dz = coords[i][2] - coords[j][2];
        const distSq = dx * dx + dy * dy + dz * dz + 1e-4;
        const dist = Math.sqrt(distSq);

        const targetDist = Math.max(1.2, nb.dist * 28);
        const weight = Math.exp(-nb.dist * 2.2);
        const force = weight * (dist - targetDist) / dist;

        gx -= dx * force;
        gy -= dy * force;
        gz -= dz * force;
      }

      // Repulsive forces from negative random samples
      for (let s = 0; s < nNegativeSamples; s++) {
        const j = Math.floor(rng() * n);
        if (i === j) continue;

        const dx = coords[i][0] - coords[j][0];
        const dy = coords[i][1] - coords[j][1];
        const dz = coords[i][2] - coords[j][2];
        const distSq = dx * dx + dy * dy + dz * dz + 0.05;
        const repForce = 36.0 / distSq;

        gx += (dx / Math.sqrt(distSq)) * repForce;
        gy += (dy / Math.sqrt(distSq)) * repForce;
        gz += (dz / Math.sqrt(distSq)) * repForce;
      }

      // Gradient clipping to prevent gradient explosion / NaN
      const gradNorm = Math.hypot(gx, gy, gz);
      const maxGrad = 24.0;
      if (gradNorm > maxGrad) {
        gx = (gx / gradNorm) * maxGrad;
        gy = (gy / gradNorm) * maxGrad;
        gz = (gz / gradNorm) * maxGrad;
      }

      coords[i][0] += alpha * gx;
      coords[i][1] += alpha * gy;
      coords[i][2] += alpha * gz;
    }
  }

  return normalizeToBoundingCube(coords, bound);
}

/**
 * Normalizes 3D coordinates into centered [-bound, bound]^3 cube with fallback jitter
 */
export function normalizeToBoundingCube(coords, bound = 85) {
  if (!coords || coords.length === 0) return [];
  const n = coords.length;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  coords.forEach(c => {
    if (Number.isFinite(c[0])) {
      minX = Math.min(minX, c[0]);
      maxX = Math.max(maxX, c[0]);
    }
    if (Number.isFinite(c[1])) {
      minY = Math.min(minY, c[1]);
      maxY = Math.max(maxY, c[1]);
    }
    if (Number.isFinite(c[2])) {
      minZ = Math.min(minZ, c[2]);
      maxZ = Math.max(maxZ, c[2]);
    }
  });

  const rangeX = (maxX - minX) || 1;
  const rangeY = (maxY - minY) || 1;
  const rangeZ = (maxZ - minZ) || 1;
  let maxRange = Math.max(rangeX, rangeY, rangeZ);

  // If points are degenerate, distribute them evenly
  if (maxRange < 0.1) {
    maxRange = 1;
  }

  const midX = (minX + maxX) / 2 || 0;
  const midY = (minY + maxY) / 2 || 0;
  const midZ = (minZ + maxZ) / 2 || 0;

  return coords.map((c, idx) => {
    let px = Number.isFinite(c[0]) ? c[0] : (idx % 10 - 5);
    let py = Number.isFinite(c[1]) ? c[1] : (Math.floor(idx / 10) % 10 - 5);
    let pz = Number.isFinite(c[2]) ? c[2] : (idx % 7 - 3.5);

    const x = ((px - midX) / maxRange) * (bound * 1.8);
    const y = ((py - midY) / maxRange) * (bound * 1.8);
    const z = ((pz - midZ) / maxRange) * (bound * 1.8);

    return [
      Math.round(x * 100) / 100,
      Math.round(y * 100) / 100,
      Math.round(z * 100) / 100
    ];
  });
}
