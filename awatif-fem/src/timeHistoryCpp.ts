/**
 * Time History Analysis - TypeScript Implementation
 * ==================================================
 * Solves the dynamic equation of motion using Newmark-β integration.
 *
 * M*ü + C*u̇ + K*u = F(t)
 *
 * Author: Hekatan Project
 * Date: 2026-02-04
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model.js";
import type { ModalOutputs } from "./modalCpp";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GroundMotion {
  dt: number;                    // Time step (seconds)
  accelerations: number[];       // Acceleration values (m/s² or g)
  units?: "m/s2" | "g";          // Units of acceleration, default m/s²
  name?: string;                 // Optional name (e.g., "El Centro NS")
}

export interface RayleighDamping {
  type: "rayleigh";
  alpha: number;                 // Mass proportional coefficient
  beta: number;                  // Stiffness proportional coefficient
}

export interface ModalDamping {
  type: "modal";
  ratios: Map<number, number>;   // Mode -> damping ratio
  defaultRatio?: number;         // Default ratio for modes not specified
}

export interface FrequencyDamping {
  type: "frequency";
  f1: number;                    // First target frequency (Hz)
  f2: number;                    // Second target frequency (Hz)
  xi1: number;                   // Damping ratio at f1
  xi2: number;                   // Damping ratio at f2
}

export type DampingDefinition = RayleighDamping | ModalDamping | FrequencyDamping;

export interface NewmarkParameters {
  beta?: number;                 // Default 0.25 (average acceleration)
  gamma?: number;                // Default 0.5 (no numerical damping)
}

export interface TimeHistoryOptions {
  groundMotion: GroundMotion;
  direction: "X" | "Y" | "Z";
  damping: DampingDefinition;
  newmark?: NewmarkParameters;
  outputInterval?: number;       // Store every N steps (default 1 = all)
}

export interface TimeHistoryOutputs {
  time: number[];
  displacements: Map<number, number[][]>;  // Node -> [step][dof]
  velocities: Map<number, number[][]>;
  accelerations: Map<number, number[][]>;
  baseShear: number[][];                   // [step][Vx, Vy, Vz]
  peakDisplacement: Map<number, [number, number, number, number, number, number]>;
  peakVelocity: Map<number, [number, number, number, number, number, number]>;
  peakAcceleration: Map<number, [number, number, number, number, number, number]>;
  maxBaseShear: [number, number, number];
}

// ============================================================================
// DAMPING CALCULATIONS
// ============================================================================

/**
 * Calculate Rayleigh damping coefficients from target frequencies
 */
export function calculateRayleighDamping(
  f1: number,
  f2: number,
  xi1: number,
  xi2: number
): { alpha: number; beta: number } {
  const w1 = 2 * Math.PI * f1;
  const w2 = 2 * Math.PI * f2;

  const denom = w2 * w2 - w1 * w1;
  if (Math.abs(denom) < 1e-10) {
    // Same frequency
    return { alpha: 2 * xi1 * w1, beta: 0 };
  }

  const alpha = 2 * w1 * w2 * (xi1 * w2 - xi2 * w1) / denom;
  const beta = 2 * (xi2 * w2 - xi1 * w1) / denom;

  return { alpha, beta };
}

/**
 * Calculate Rayleigh coefficients for equal damping at two frequencies
 */
export function calculateRayleighEqual(
  f1: number,
  f2: number,
  xi: number
): { alpha: number; beta: number } {
  const w1 = 2 * Math.PI * f1;
  const w2 = 2 * Math.PI * f2;

  const alpha = 2 * xi * w1 * w2 / (w1 + w2);
  const beta = 2 * xi / (w1 + w2);

  return { alpha, beta };
}

// ============================================================================
// NEWMARK-BETA INTEGRATION (PURE JAVASCRIPT)
// ============================================================================

/**
 * Time History Analysis using Newmark-β method
 */
export async function timeHistory(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs,
  stiffnessMatrix: number[][],   // Global stiffness matrix
  massMatrix: number[][],        // Global mass matrix (or lumped diagonal)
  options: TimeHistoryOptions
): Promise<TimeHistoryOutputs> {
  const {
    groundMotion,
    direction,
    damping,
    newmark = {},
    outputInterval = 1
  } = options;

  const { beta = 0.25, gamma = 0.5 } = newmark;
  const dt = groundMotion.dt;
  const numSteps = groundMotion.accelerations.length;
  const numNodes = nodes.length;
  const numDOFsPerNode = 6;
  const totalDOFs = numNodes * numDOFsPerNode;

  // Direction index
  const dirIndex = direction === "X" ? 0 : direction === "Y" ? 1 : 2;

  // Convert ground acceleration to m/s² if needed
  const ag = groundMotion.units === "g"
    ? groundMotion.accelerations.map(a => a * 9.81)
    : [...groundMotion.accelerations];

  // ========== IDENTIFY FREE DOFs ==========
  const supports = nodeInputs.supports || new Map();
  const freeDOFs: number[] = [];
  const fixedDOFs: number[] = [];

  for (let n = 0; n < numNodes; n++) {
    const support = supports.get(n);
    for (let d = 0; d < numDOFsPerNode; d++) {
      const dof = n * numDOFsPerNode + d;
      if (support && support[d]) {
        fixedDOFs.push(dof);
      } else {
        freeDOFs.push(dof);
      }
    }
  }

  const numFreeDOFs = freeDOFs.length;

  // ========== EXTRACT REDUCED MATRICES ==========
  // For simplicity, assuming matrices are already reduced or using diagonal mass

  // Create DOF mapping
  const dofMap = new Map<number, number>();
  freeDOFs.forEach((dof, idx) => dofMap.set(dof, idx));

  // Reduced matrices (simplified - assuming diagonal mass)
  const M = new Array(numFreeDOFs).fill(0);
  const K: number[][] = Array.from({ length: numFreeDOFs }, () =>
    new Array(numFreeDOFs).fill(0)
  );

  // Extract mass (diagonal)
  for (let i = 0; i < numFreeDOFs; i++) {
    const fullDOF = freeDOFs[i];
    if (massMatrix[fullDOF]) {
      M[i] = massMatrix[fullDOF][fullDOF] || 1.0;
    } else {
      M[i] = 1.0;  // Default unit mass
    }
  }

  // Extract stiffness
  for (let i = 0; i < numFreeDOFs; i++) {
    for (let j = 0; j < numFreeDOFs; j++) {
      const fi = freeDOFs[i];
      const fj = freeDOFs[j];
      if (stiffnessMatrix[fi] && stiffnessMatrix[fi][fj] !== undefined) {
        K[i][j] = stiffnessMatrix[fi][fj];
      }
    }
  }

  // ========== DAMPING MATRIX ==========
  let alpha = 0, betaDamp = 0;

  if (damping.type === "rayleigh") {
    alpha = damping.alpha;
    betaDamp = damping.beta;
  } else if (damping.type === "frequency") {
    const coeffs = calculateRayleighDamping(
      damping.f1, damping.f2, damping.xi1, damping.xi2
    );
    alpha = coeffs.alpha;
    betaDamp = coeffs.beta;
  } else if (damping.type === "modal") {
    // Use default 5% damping for Rayleigh approximation
    const xi = damping.defaultRatio || 0.05;
    // Assume f1=1Hz, f2=10Hz for approximation
    const coeffs = calculateRayleighEqual(1.0, 10.0, xi);
    alpha = coeffs.alpha;
    betaDamp = coeffs.beta;
  }

  // C = alpha*M + beta*K (simplified for diagonal M)
  const C: number[][] = Array.from({ length: numFreeDOFs }, () =>
    new Array(numFreeDOFs).fill(0)
  );

  for (let i = 0; i < numFreeDOFs; i++) {
    for (let j = 0; j < numFreeDOFs; j++) {
      C[i][j] = betaDamp * K[i][j];
      if (i === j) {
        C[i][j] += alpha * M[i];
      }
    }
  }

  // ========== INFLUENCE VECTOR ==========
  const r = new Array(numFreeDOFs).fill(0);
  for (let i = 0; i < numFreeDOFs; i++) {
    const fullDOF = freeDOFs[i];
    const localDir = fullDOF % numDOFsPerNode;
    if (localDir === dirIndex) {
      r[i] = M[i];  // Mass in direction of motion
    }
  }

  // ========== NEWMARK CONSTANTS ==========
  const a0 = 1.0 / (beta * dt * dt);
  const a1 = gamma / (beta * dt);
  const a2 = 1.0 / (beta * dt);
  const a3 = 1.0 / (2.0 * beta) - 1.0;
  const a4 = gamma / beta - 1.0;
  const a5 = dt * (gamma / (2.0 * beta) - 1.0);
  const a6 = dt * (1.0 - gamma);
  const a7 = gamma * dt;

  // ========== EFFECTIVE STIFFNESS ==========
  // K_eff = K + a0*M + a1*C
  const K_eff: number[][] = Array.from({ length: numFreeDOFs }, () =>
    new Array(numFreeDOFs).fill(0)
  );

  for (let i = 0; i < numFreeDOFs; i++) {
    for (let j = 0; j < numFreeDOFs; j++) {
      K_eff[i][j] = K[i][j] + a1 * C[i][j];
      if (i === j) {
        K_eff[i][j] += a0 * M[i];
      }
    }
  }

  // Simple LU decomposition for small systems
  // For larger systems, use iterative solver
  const solveLU = (A: number[][], b: number[]): number[] => {
    const n = b.length;
    const x = new Array(n).fill(0);

    // Gaussian elimination with partial pivoting
    const augmented = A.map((row, i) => [...row, b[i]]);

    for (let col = 0; col < n; col++) {
      // Find pivot
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
          maxRow = row;
        }
      }
      [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

      // Eliminate
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(augmented[col][col]) > 1e-15) {
          const factor = augmented[row][col] / augmented[col][col];
          for (let j = col; j <= n; j++) {
            augmented[row][j] -= factor * augmented[col][j];
          }
        }
      }
    }

    // Back substitution
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

  // ========== INITIALIZE ==========
  let u = new Array(numFreeDOFs).fill(0);
  let v = new Array(numFreeDOFs).fill(0);
  let a = new Array(numFreeDOFs).fill(0);

  // Initial acceleration
  for (let i = 0; i < numFreeDOFs; i++) {
    if (M[i] > 1e-10) {
      a[i] = -r[i] * ag[0] / M[i];
    }
  }

  // ========== OUTPUT STORAGE ==========
  const timeArray: number[] = [];
  const dispHistory = new Map<number, number[][]>();
  const velHistory = new Map<number, number[][]>();
  const accelHistory = new Map<number, number[][]>();
  const baseShearHistory: number[][] = [];

  // Initialize node histories
  for (let n = 0; n < numNodes; n++) {
    dispHistory.set(n, []);
    velHistory.set(n, []);
    accelHistory.set(n, []);
  }

  // ========== TIME STEPPING ==========
  for (let step = 0; step < numSteps; step++) {
    // Store output at intervals
    if (step % outputInterval === 0) {
      timeArray.push(step * dt);

      // Expand to full DOFs and store by node
      for (let n = 0; n < numNodes; n++) {
        const nodeDisp: number[] = [0, 0, 0, 0, 0, 0];
        const nodeVel: number[] = [0, 0, 0, 0, 0, 0];
        const nodeAccel: number[] = [0, 0, 0, 0, 0, 0];

        for (let d = 0; d < numDOFsPerNode; d++) {
          const fullDOF = n * numDOFsPerNode + d;
          const reducedIdx = dofMap.get(fullDOF);
          if (reducedIdx !== undefined) {
            nodeDisp[d] = u[reducedIdx];
            nodeVel[d] = v[reducedIdx];
            nodeAccel[d] = a[reducedIdx];
          }
        }

        dispHistory.get(n)!.push(nodeDisp);
        velHistory.get(n)!.push(nodeVel);
        accelHistory.get(n)!.push(nodeAccel);
      }

      // Base shear
      let Vx = 0, Vy = 0, Vz = 0;
      for (let i = 0; i < numFreeDOFs; i++) {
        let Ku_i = 0;
        for (let j = 0; j < numFreeDOFs; j++) {
          Ku_i += K[i][j] * u[j];
        }
        const fullDOF = freeDOFs[i];
        const localDir = fullDOF % numDOFsPerNode;
        if (localDir === 0) Vx += Ku_i;
        else if (localDir === 1) Vy += Ku_i;
        else if (localDir === 2) Vz += Ku_i;
      }
      baseShearHistory.push([Vx, Vy, Vz]);
    }

    if (step >= numSteps - 1) break;

    // Effective force at next step
    const ag_next = ag[step + 1];
    const F_next = r.map(ri => -ri * ag_next);

    // F_eff = F + M*(a0*u + a2*v + a3*a) + C*(a1*u + a4*v + a5*a)
    const F_eff = new Array(numFreeDOFs).fill(0);
    for (let i = 0; i < numFreeDOFs; i++) {
      F_eff[i] = F_next[i];
      F_eff[i] += M[i] * (a0 * u[i] + a2 * v[i] + a3 * a[i]);
      for (let j = 0; j < numFreeDOFs; j++) {
        F_eff[i] += C[i][j] * (a1 * u[j] + a4 * v[j] + a5 * a[j]);
      }
    }

    // Solve for new displacement
    const u_new = solveLU(K_eff.map(row => [...row]), F_eff);

    // Update acceleration and velocity
    const a_new = new Array(numFreeDOFs);
    const v_new = new Array(numFreeDOFs);
    for (let i = 0; i < numFreeDOFs; i++) {
      a_new[i] = a0 * (u_new[i] - u[i]) - a2 * v[i] - a3 * a[i];
      v_new[i] = v[i] + a6 * a[i] + a7 * a_new[i];
    }

    // Update state
    u = u_new;
    v = v_new;
    a = a_new;
  }

  // ========== CALCULATE PEAK VALUES ==========
  const peakDisplacement = new Map<number, [number, number, number, number, number, number]>();
  const peakVelocity = new Map<number, [number, number, number, number, number, number]>();
  const peakAcceleration = new Map<number, [number, number, number, number, number, number]>();

  for (let n = 0; n < numNodes; n++) {
    const dHist = dispHistory.get(n)!;
    const vHist = velHistory.get(n)!;
    const aHist = accelHistory.get(n)!;

    const peakD: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    const peakV: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    const peakA: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];

    for (const step of dHist) {
      for (let d = 0; d < 6; d++) {
        if (Math.abs(step[d]) > Math.abs(peakD[d])) peakD[d] = step[d];
      }
    }
    for (const step of vHist) {
      for (let d = 0; d < 6; d++) {
        if (Math.abs(step[d]) > Math.abs(peakV[d])) peakV[d] = step[d];
      }
    }
    for (const step of aHist) {
      for (let d = 0; d < 6; d++) {
        if (Math.abs(step[d]) > Math.abs(peakA[d])) peakA[d] = step[d];
      }
    }

    peakDisplacement.set(n, peakD);
    peakVelocity.set(n, peakV);
    peakAcceleration.set(n, peakA);
  }

  // Max base shear
  let maxVx = 0, maxVy = 0, maxVz = 0;
  for (const [Vx, Vy, Vz] of baseShearHistory) {
    if (Math.abs(Vx) > Math.abs(maxVx)) maxVx = Vx;
    if (Math.abs(Vy) > Math.abs(maxVy)) maxVy = Vy;
    if (Math.abs(Vz) > Math.abs(maxVz)) maxVz = Vz;
  }

  return {
    time: timeArray,
    displacements: dispHistory,
    velocities: velHistory,
    accelerations: accelHistory,
    baseShear: baseShearHistory,
    peakDisplacement,
    peakVelocity,
    peakAcceleration,
    maxBaseShear: [maxVx, maxVy, maxVz]
  };
}

// ============================================================================
// GROUND MOTION UTILITIES
// ============================================================================

/**
 * Create a simple sinusoidal ground motion for testing
 */
export function createSinusoidalMotion(
  frequency: number,
  amplitude: number,
  duration: number,
  dt: number = 0.01
): GroundMotion {
  const numSteps = Math.ceil(duration / dt);
  const accelerations: number[] = [];

  for (let i = 0; i < numSteps; i++) {
    const t = i * dt;
    accelerations.push(amplitude * Math.sin(2 * Math.PI * frequency * t));
  }

  return {
    dt,
    accelerations,
    units: "m/s2",
    name: `Sinusoidal ${frequency}Hz`
  };
}

/**
 * Create an impulse ground motion
 */
export function createImpulseMotion(
  peakAcceleration: number,
  duration: number,
  dt: number = 0.01
): GroundMotion {
  const numSteps = Math.ceil(duration / dt);
  const accelerations: number[] = [];

  for (let i = 0; i < numSteps; i++) {
    const t = i * dt;
    // Half-sine impulse in first 0.1 seconds
    if (t < 0.1) {
      accelerations.push(peakAcceleration * Math.sin(Math.PI * t / 0.1));
    } else {
      accelerations.push(0);
    }
  }

  return {
    dt,
    accelerations,
    units: "m/s2",
    name: "Impulse"
  };
}

/**
 * Simple El Centro-like synthetic motion
 */
export function createElCentroLike(
  scaleFactor: number = 1.0,
  dt: number = 0.02
): GroundMotion {
  // Simplified synthetic motion inspired by El Centro
  const duration = 10.0;
  const numSteps = Math.ceil(duration / dt);
  const accelerations: number[] = [];

  for (let i = 0; i < numSteps; i++) {
    const t = i * dt;

    // Envelope function
    const envelope = t < 2 ? t / 2 :
                     t < 6 ? 1.0 :
                     t < 10 ? (10 - t) / 4 : 0;

    // Multiple frequency content
    const motion = 0.2 * Math.sin(2 * Math.PI * 1.5 * t) +
                   0.15 * Math.sin(2 * Math.PI * 3.0 * t + 0.5) +
                   0.1 * Math.sin(2 * Math.PI * 5.0 * t + 1.0) +
                   0.05 * Math.sin(2 * Math.PI * 8.0 * t + 1.5);

    accelerations.push(scaleFactor * 3.0 * envelope * motion);
  }

  return {
    dt,
    accelerations,
    units: "m/s2",
    name: "El Centro-like synthetic"
  };
}

export default timeHistory;
