/**
 * P-Delta Analysis - TypeScript Implementation
 * =============================================
 * Second-order geometric nonlinear analysis.
 *
 * Accounts for the interaction between axial loads and lateral displacements.
 *
 * Author: Hekatan Project
 * Date: 2026-02-04
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model.js";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PDeltaOptions {
  maxIterations?: number;
  tolerance?: number;
  includeGeometricStiffness?: boolean;
  includeLargeDisplacements?: boolean;
}

export interface PDeltaOutputs {
  displacements: Map<number, [number, number, number, number, number, number]>;
  reactions: Map<number, [number, number, number, number, number, number]>;
  axialForces: Map<number, number>;
  iterations: number;
  converged: boolean;
  amplificationFactor: number;
  stabilityIndex: number;  // θ = P*Δ / (V*h)
}

// ============================================================================
// GEOMETRIC STIFFNESS MATRIX
// ============================================================================

/**
 * Calculate geometric stiffness matrix for a frame element
 * Kg accounts for the effect of axial force on lateral stiffness
 *
 * For a beam-column with axial force P:
 * Kg = P/L * [symmetric matrix with terms involving element geometry]
 */
function getGeometricStiffnessMatrix(
  P: number,      // Axial force (positive = tension)
  L: number,      // Element length
  A: number,      // Cross-sectional area
  I: number       // Moment of inertia
): number[][] {
  // 12x12 geometric stiffness matrix for 3D frame element
  // Simplified for 2D behavior (strong axis bending)

  const Kg: number[][] = Array.from({ length: 12 }, () =>
    new Array(12).fill(0)
  );

  if (Math.abs(L) < 1e-10) return Kg;

  const c = P / L;

  // Geometric stiffness terms for lateral DOFs
  // UY (local) at nodes i and j
  Kg[1][1] = 6 * c / 5;
  Kg[1][7] = -6 * c / 5;
  Kg[7][1] = -6 * c / 5;
  Kg[7][7] = 6 * c / 5;

  // UZ (local) at nodes i and j
  Kg[2][2] = 6 * c / 5;
  Kg[2][8] = -6 * c / 5;
  Kg[8][2] = -6 * c / 5;
  Kg[8][8] = 6 * c / 5;

  // Rotation terms RY
  Kg[4][4] = 2 * c * L / 15;
  Kg[4][10] = -c * L / 30;
  Kg[10][4] = -c * L / 30;
  Kg[10][10] = 2 * c * L / 15;

  // Rotation terms RZ
  Kg[5][5] = 2 * c * L / 15;
  Kg[5][11] = -c * L / 30;
  Kg[11][5] = -c * L / 30;
  Kg[11][11] = 2 * c * L / 15;

  // Coupling terms UY-RZ
  Kg[1][5] = c / 10;
  Kg[1][11] = c / 10;
  Kg[5][1] = c / 10;
  Kg[5][7] = -c / 10;
  Kg[7][5] = -c / 10;
  Kg[7][11] = -c / 10;
  Kg[11][1] = c / 10;
  Kg[11][7] = -c / 10;

  // Coupling terms UZ-RY
  Kg[2][4] = -c / 10;
  Kg[2][10] = -c / 10;
  Kg[4][2] = -c / 10;
  Kg[4][8] = c / 10;
  Kg[8][4] = c / 10;
  Kg[8][10] = c / 10;
  Kg[10][2] = -c / 10;
  Kg[10][8] = c / 10;

  return Kg;
}

/**
 * Transform local geometric stiffness to global coordinates
 */
function transformToGlobal(
  Kg_local: number[][],
  T: number[][]
): number[][] {
  const n = Kg_local.length;
  const Kg_global: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );

  // Kg_global = T^T * Kg_local * T
  const temp: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );

  // temp = Kg_local * T
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        temp[i][j] += Kg_local[i][k] * T[k][j];
      }
    }
  }

  // Kg_global = T^T * temp
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        Kg_global[i][j] += T[k][i] * temp[k][j];
      }
    }
  }

  return Kg_global;
}

/**
 * Get transformation matrix for frame element
 */
function getTransformationMatrix(
  node1: Node,
  node2: Node
): number[][] {
  const dx = node2[0] - node1[0];
  const dy = node2[1] - node1[1];
  const dz = node2[2] - node1[2];
  const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (L < 1e-10) {
    return Array.from({ length: 12 }, (_, i) =>
      Array.from({ length: 12 }, (_, j) => i === j ? 1 : 0)
    );
  }

  // Direction cosines
  const cx = dx / L;
  const cy = dy / L;
  const cz = dz / L;

  // Local x-axis along element
  // Local z-axis: cross product with global Z (or Y if vertical)
  let zx: number, zy: number, zz: number;

  if (Math.abs(cz) > 0.999) {
    // Nearly vertical element
    zx = 0;
    zy = cz > 0 ? -1 : 1;
    zz = 0;
  } else {
    // Cross product with global Z
    const mag = Math.sqrt(cx * cx + cy * cy);
    zx = -cy / mag;
    zy = cx / mag;
    zz = 0;
  }

  // Local y-axis: cross product of z and x
  const yx = zy * cz - zz * cy;
  const yy = zz * cx - zx * cz;
  const yz = zx * cy - zy * cx;

  // 3x3 rotation matrix
  const R = [
    [cx, cy, cz],
    [yx, yy, yz],
    [zx, zy, zz]
  ];

  // 12x12 transformation matrix (4 blocks of 3x3)
  const T: number[][] = Array.from({ length: 12 }, () =>
    new Array(12).fill(0)
  );

  for (let block = 0; block < 4; block++) {
    const offset = block * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        T[offset + i][offset + j] = R[i][j];
      }
    }
  }

  return T;
}

// ============================================================================
// MAIN P-DELTA FUNCTION
// ============================================================================

/**
 * Perform P-Delta Analysis
 */
export async function pDelta(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs,
  stiffnessMatrix: number[][],
  loads: Map<number, [number, number, number, number, number, number]>,
  options: PDeltaOptions = {}
): Promise<PDeltaOutputs> {
  const {
    maxIterations = 20,
    tolerance = 1e-6,
    includeGeometricStiffness = true
  } = options;

  const numNodes = nodes.length;
  const numDOFsPerNode = 6;
  const totalDOFs = numNodes * numDOFsPerNode;

  // Identify free DOFs
  const supports = nodeInputs.supports || new Map();
  const freeDOFs: number[] = [];

  for (let n = 0; n < numNodes; n++) {
    const support = supports.get(n);
    for (let d = 0; d < numDOFsPerNode; d++) {
      const dof = n * numDOFsPerNode + d;
      if (!support || !support[d]) {
        freeDOFs.push(dof);
      }
    }
  }

  const numFreeDOFs = freeDOFs.length;
  const dofMap = new Map<number, number>();
  freeDOFs.forEach((dof, idx) => dofMap.set(dof, idx));

  // Extract reduced stiffness matrix
  const extractReducedMatrix = (K_full: number[][]): number[][] => {
    const K_red: number[][] = Array.from({ length: numFreeDOFs }, () =>
      new Array(numFreeDOFs).fill(0)
    );
    for (let i = 0; i < numFreeDOFs; i++) {
      for (let j = 0; j < numFreeDOFs; j++) {
        K_red[i][j] = K_full[freeDOFs[i]][freeDOFs[j]];
      }
    }
    return K_red;
  };

  // Load vector (reduced)
  const F_reduced = new Array(numFreeDOFs).fill(0);
  for (const [nodeId, load] of loads) {
    for (let d = 0; d < 6; d++) {
      const fullDOF = nodeId * numDOFsPerNode + d;
      const reducedDOF = dofMap.get(fullDOF);
      if (reducedDOF !== undefined) {
        F_reduced[reducedDOF] = load[d];
      }
    }
  }

  // Simple solver
  const solve = (K: number[][], F: number[]): number[] => {
    const n = F.length;
    const augmented = K.map((row, i) => [...row, F[i]]);

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
          maxRow = row;
        }
      }
      [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

      for (let row = col + 1; row < n; row++) {
        if (Math.abs(augmented[col][col]) > 1e-15) {
          const factor = augmented[row][col] / augmented[col][col];
          for (let j = col; j <= n; j++) {
            augmented[row][j] -= factor * augmented[col][j];
          }
        }
      }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      if (Math.abs(augmented[i][i]) > 1e-15) {
        x[i] /= augmented[i][i];
      }
    }
    return x;
  };

  // Iterative P-Delta solution
  let u_current = new Array(numFreeDOFs).fill(0);
  let converged = false;
  let iterations = 0;

  // First-order solution (without P-Delta)
  const K_elastic = extractReducedMatrix(stiffnessMatrix);
  const u_firstOrder = solve(K_elastic.map(r => [...r]), [...F_reduced]);

  // Store axial forces
  const axialForces = new Map<number, number>();

  for (iterations = 0; iterations < maxIterations; iterations++) {
    // Calculate axial forces from current displacements
    for (let e = 0; e < elements.length; e++) {
      const elem = elements[e];
      if (elem.length < 2) continue;

      const n1 = elem[0];
      const n2 = elem[elem.length - 1];

      // Get displacements
      const u1 = new Array(6).fill(0);
      const u2 = new Array(6).fill(0);

      for (let d = 0; d < 6; d++) {
        const dof1 = dofMap.get(n1 * numDOFsPerNode + d);
        const dof2 = dofMap.get(n2 * numDOFsPerNode + d);
        if (dof1 !== undefined) u1[d] = u_current[dof1];
        if (dof2 !== undefined) u2[d] = u_current[dof2];
      }

      // Axial deformation
      const dx = nodes[n2][0] - nodes[n1][0];
      const dy = nodes[n2][1] - nodes[n1][1];
      const dz = nodes[n2][2] - nodes[n1][2];
      const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (L < 1e-10) continue;

      const du = (u2[0] - u1[0]) * dx / L +
                 (u2[1] - u1[1]) * dy / L +
                 (u2[2] - u1[2]) * dz / L;

      const E = elementInputs.elasticities?.get(e) || 25e9;
      const A = elementInputs.areas?.get(e) || 0.01;

      const P = E * A * du / L;
      axialForces.set(e, P);
    }

    if (!includeGeometricStiffness) {
      u_current = u_firstOrder;
      converged = true;
      break;
    }

    // Build global geometric stiffness matrix
    const Kg_global: number[][] = Array.from({ length: totalDOFs }, () =>
      new Array(totalDOFs).fill(0)
    );

    for (let e = 0; e < elements.length; e++) {
      const elem = elements[e];
      if (elem.length < 2) continue;

      const n1 = elem[0];
      const n2 = elem[elem.length - 1];

      const dx = nodes[n2][0] - nodes[n1][0];
      const dy = nodes[n2][1] - nodes[n1][1];
      const dz = nodes[n2][2] - nodes[n1][2];
      const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const A = elementInputs.areas?.get(e) || 0.01;
      const I = elementInputs.momentsOfInertiaZ?.get(e) || 0.0001;
      const P = axialForces.get(e) || 0;

      // Get local geometric stiffness
      const Kg_local = getGeometricStiffnessMatrix(P, L, A, I);

      // Transform to global
      const T = getTransformationMatrix(nodes[n1], nodes[n2]);
      const Kg_elem = transformToGlobal(Kg_local, T);

      // Assemble into global matrix
      const elemDOFs = [
        ...Array.from({ length: 6 }, (_, d) => n1 * numDOFsPerNode + d),
        ...Array.from({ length: 6 }, (_, d) => n2 * numDOFsPerNode + d)
      ];

      for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 12; j++) {
          Kg_global[elemDOFs[i]][elemDOFs[j]] += Kg_elem[i][j];
        }
      }
    }

    // Effective stiffness: K_eff = K_elastic + K_geometric
    const K_eff: number[][] = Array.from({ length: totalDOFs }, (_, i) =>
      Array.from({ length: totalDOFs }, (_, j) =>
        stiffnessMatrix[i][j] + Kg_global[i][j]
      )
    );

    // Reduce and solve
    const K_eff_red = extractReducedMatrix(K_eff);
    const u_new = solve(K_eff_red.map(r => [...r]), [...F_reduced]);

    // Check convergence
    let maxDiff = 0;
    for (let i = 0; i < numFreeDOFs; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(u_new[i] - u_current[i]));
    }

    u_current = u_new;

    if (maxDiff < tolerance) {
      converged = true;
      break;
    }
  }

  // Expand results to full DOFs
  const displacements = new Map<number, [number, number, number, number, number, number]>();
  for (let n = 0; n < numNodes; n++) {
    const nodeDisp: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    for (let d = 0; d < 6; d++) {
      const reducedDOF = dofMap.get(n * numDOFsPerNode + d);
      if (reducedDOF !== undefined) {
        nodeDisp[d] = u_current[reducedDOF];
      }
    }
    displacements.set(n, nodeDisp);
  }

  // Calculate reactions
  const reactions = new Map<number, [number, number, number, number, number, number]>();
  for (let n = 0; n < numNodes; n++) {
    const support = supports.get(n);
    if (support && support.some(s => s)) {
      const reaction: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];

      for (let d = 0; d < 6; d++) {
        if (support[d]) {
          const fullDOF = n * numDOFsPerNode + d;
          // R = K * u - F
          for (let j = 0; j < totalDOFs; j++) {
            const jReduced = dofMap.get(j);
            if (jReduced !== undefined) {
              reaction[d] += stiffnessMatrix[fullDOF][j] * u_current[jReduced];
            }
          }
        }
      }
      reactions.set(n, reaction);
    }
  }

  // Calculate amplification factor
  const u_first_max = Math.max(...u_firstOrder.map(Math.abs));
  const u_pdelta_max = Math.max(...u_current.map(Math.abs));
  const amplificationFactor = u_first_max > 1e-10 ? u_pdelta_max / u_first_max : 1;

  // Stability index (simplified)
  // θ = Σ(P*Δ) / (V*h)
  let sumPDelta = 0;
  let totalHeight = 0;
  let baseShear = 0;

  for (const [nodeId, load] of loads) {
    baseShear += Math.abs(load[0]) + Math.abs(load[1]);
  }

  for (let e = 0; e < elements.length; e++) {
    const P = axialForces.get(e) || 0;
    const elem = elements[e];
    if (elem.length < 2) continue;

    const n1 = elem[0];
    const n2 = elem[elem.length - 1];
    const d1 = displacements.get(n1);
    const d2 = displacements.get(n2);

    if (d1 && d2) {
      const delta = Math.sqrt(
        Math.pow(d2[0] - d1[0], 2) +
        Math.pow(d2[1] - d1[1], 2)
      );
      sumPDelta += Math.abs(P) * delta;

      const h = Math.abs(nodes[n2][2] - nodes[n1][2]);
      totalHeight = Math.max(totalHeight, h);
    }
  }

  const stabilityIndex = baseShear > 0 && totalHeight > 0
    ? sumPDelta / (baseShear * totalHeight)
    : 0;

  return {
    displacements,
    reactions,
    axialForces,
    iterations: iterations + 1,
    converged,
    amplificationFactor,
    stabilityIndex
  };
}

/**
 * Calculate P-Delta amplification factor using approximate formula
 * B2 = 1 / (1 - θ)  where θ is the stability coefficient
 */
export function getAmplificationFactor(stabilityIndex: number): number {
  if (stabilityIndex >= 1) {
    return Infinity;  // Unstable
  }
  return 1 / (1 - stabilityIndex);
}

/**
 * Check if P-Delta effects are significant
 * According to ASCE 7: θ > 0.10 requires P-Delta consideration
 */
export function isPDeltaSignificant(stabilityIndex: number): boolean {
  return stabilityIndex > 0.10;
}

export default pDelta;
