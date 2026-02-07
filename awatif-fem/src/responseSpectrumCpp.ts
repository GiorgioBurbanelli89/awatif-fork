/**
 * Response Spectrum Analysis - TypeScript Wrapper
 * ================================================
 * Provides response spectrum analysis with SRSS/CQC modal combination.
 *
 * Author: Hekatan Project
 * Date: 2026-02-04
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model.js";
import type { ModalOutputs } from "./modalCpp";

// Types for spectrum definition
export type SpectrumType = "ASCE7" | "EC8" | "NEC" | "USER";
export type CombinationType = "SRSS" | "CQC" | "ABS";

export interface ASCE7Spectrum {
  type: "ASCE7";
  SDS: number;  // Design spectral acceleration at short periods (g)
  SD1: number;  // Design spectral acceleration at 1 second (g)
  TL?: number;  // Long-period transition (s), default 4.0
}

export interface EC8Spectrum {
  type: "EC8";
  ag: number;   // Peak ground acceleration (g)
  S?: number;   // Soil factor, default 1.2 (Type B)
}

// NEC-SE-DS Ecuador Spectrum
export interface NECSpectrum {
  type: "NEC";
  Z: number;           // Zone factor (PGA in rock, g): 0.15-0.50
  soilType: "A" | "B" | "C" | "D" | "E";  // Soil classification
  region: "Costa" | "Sierra" | "Oriente"; // Geographic region
  I?: number;          // Importance factor (default 1.0)
  R?: number;          // Response reduction factor (default 1.0)
  // Optional: direct soil study coefficients
  Fa?: number;         // Site amplification coefficient
  Fd?: number;         // Displacement amplification coefficient
  Fs?: number;         // Soil nonlinear behavior coefficient
}

export interface UserSpectrum {
  type: "USER";
  periods: number[];       // Periods array (s)
  accelerations: number[]; // Spectral accelerations (g)
}

export type DesignSpectrum = ASCE7Spectrum | EC8Spectrum | NECSpectrum | UserSpectrum;

export interface ResponseSpectrumOptions {
  spectrum: DesignSpectrum;
  direction: "X" | "Y" | "Z";
  combination: CombinationType;
  damping?: number;        // Modal damping ratio, default 0.05
  scaleFactor?: number;    // Scale factor, default 9.81 (g to m/s²)
  numModes?: number;       // Number of modes to use, default all
}

export interface ResponseSpectrumOutputs {
  displacements: Map<number, [number, number, number, number, number, number]>;
  forces: Map<number, [number, number, number, number, number, number]>;
  baseShear: [number, number, number];  // [Vx, Vy, Vz]
  modalResponses: Map<number, Map<number, [number, number, number, number, number, number]>>;
  spectralAccelerations: Map<number, number>;  // Mode -> Sa
}

// ============================================================================
// PURE JAVASCRIPT IMPLEMENTATION (no WASM dependency)
// ============================================================================

/**
 * Get spectral acceleration from ASCE 7 spectrum
 */
function getSa_ASCE7(T: number, SDS: number, SD1: number, TL: number): number {
  const T0 = 0.2 * SD1 / SDS;
  const Ts = SD1 / SDS;

  if (T <= 0) return SDS * 0.4;
  if (T <= T0) return SDS * (0.4 + 0.6 * T / T0);
  if (T <= Ts) return SDS;
  if (T <= TL) return SD1 / T;
  return SD1 * TL / (T * T);
}

/**
 * Get spectral acceleration from Eurocode 8 spectrum
 */
function getSa_EC8(T: number, ag: number, S: number = 1.2): number {
  const TB = 0.15, TC = 0.50, TD = 2.0, eta = 1.0;

  if (T <= 0) return ag * S;
  if (T <= TB) return ag * S * (1.0 + T / TB * (eta * 2.5 - 1.0));
  if (T <= TC) return ag * S * eta * 2.5;
  if (T <= TD) return ag * S * eta * 2.5 * (TC / T);
  return ag * S * eta * 2.5 * (TC * TD / (T * T));
}

/**
 * Get spectral acceleration from NEC-SE-DS Ecuador spectrum
 */
function getSa_NEC(T: number, spectrum: NECSpectrum): number {
  const { Z, soilType, region, I = 1.0, R = 1.0 } = spectrum;

  // Get site coefficients (interpolated from NEC tables or from soil study)
  let Fa: number, Fd: number, Fs: number;

  if (spectrum.Fa !== undefined && spectrum.Fd !== undefined && spectrum.Fs !== undefined) {
    // Use direct soil study values
    Fa = spectrum.Fa;
    Fd = spectrum.Fd;
    Fs = spectrum.Fs;
  } else {
    // Interpolate from NEC tables
    const coeffs = getNECSiteCoefficients(soilType, Z);
    Fa = coeffs.Fa;
    Fd = coeffs.Fd;
    Fs = coeffs.Fs;
  }

  // Eta (spectral amplification) by region
  const etaValues = { Costa: 1.80, Sierra: 2.48, Oriente: 2.60 };
  const eta = etaValues[region];

  // Period limits
  const Tc = 0.55 * Fs * Fd / Fa;
  const T0 = 0.10 * Fs * Fd / Fa;

  // r factor (decay exponent)
  const r = soilType === "E" ? 1.5 : 1.0;

  // Spectral acceleration
  let Sa: number;
  if (T <= 0) {
    Sa = Z * Fa;
  } else if (T <= T0) {
    Sa = Z * Fa * (1 + (eta - 1) * T / T0);
  } else if (T <= Tc) {
    Sa = eta * Z * Fa;
  } else {
    Sa = eta * Z * Fa * Math.pow(Tc / T, r);
  }

  // Apply importance and reduction factors
  return (Sa * I) / R;
}

// NEC-SE-DS Site Coefficients Tables
function getNECSiteCoefficients(soilType: string, Z: number): { Fa: number; Fd: number; Fs: number } {
  const Z_VALUES = [0.15, 0.25, 0.30, 0.35, 0.40, 0.50];

  const FA_TABLE: Record<string, number[]> = {
    A: [0.90, 0.90, 0.90, 0.90, 0.90, 0.90],
    B: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
    C: [1.40, 1.30, 1.25, 1.23, 1.20, 1.18],
    D: [1.60, 1.40, 1.30, 1.25, 1.20, 1.12],
    E: [1.80, 1.40, 1.25, 1.10, 1.00, 0.85],
  };

  const FD_TABLE: Record<string, number[]> = {
    A: [0.90, 0.90, 0.90, 0.90, 0.90, 0.90],
    B: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
    C: [1.36, 1.28, 1.19, 1.15, 1.11, 1.06],
    D: [1.62, 1.45, 1.36, 1.28, 1.19, 1.11],
    E: [2.10, 1.75, 1.70, 1.65, 1.60, 1.50],
  };

  const FS_TABLE: Record<string, number[]> = {
    A: [0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
    B: [0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
    C: [0.85, 0.94, 1.02, 1.06, 1.11, 1.23],
    D: [1.02, 1.06, 1.11, 1.19, 1.28, 1.40],
    E: [1.50, 1.60, 1.70, 1.80, 1.90, 2.00],
  };

  const interpolate = (table: number[], z: number): number => {
    if (z <= 0.15) return table[0];
    if (z >= 0.50) return table[5];
    for (let i = 0; i < Z_VALUES.length - 1; i++) {
      if (z >= Z_VALUES[i] && z <= Z_VALUES[i + 1]) {
        const t = (z - Z_VALUES[i]) / (Z_VALUES[i + 1] - Z_VALUES[i]);
        return table[i] + t * (table[i + 1] - table[i]);
      }
    }
    return table[5];
  };

  return {
    Fa: interpolate(FA_TABLE[soilType] || FA_TABLE.D, Z),
    Fd: interpolate(FD_TABLE[soilType] || FD_TABLE.D, Z),
    Fs: interpolate(FS_TABLE[soilType] || FS_TABLE.D, Z),
  };
}

/**
 * Get spectral acceleration from user-defined spectrum (linear interpolation)
 */
function getSa_User(T: number, periods: number[], accels: number[]): number {
  if (periods.length < 2) return 0;
  if (T <= periods[0]) return accels[0];
  if (T >= periods[periods.length - 1]) return accels[accels.length - 1];

  for (let i = 0; i < periods.length - 1; i++) {
    if (T >= periods[i] && T <= periods[i + 1]) {
      const ratio = (T - periods[i]) / (periods[i + 1] - periods[i]);
      return accels[i] + ratio * (accels[i + 1] - accels[i]);
    }
  }
  return accels[accels.length - 1];
}

/**
 * Get spectral acceleration based on spectrum type
 */
function getSpectralAcceleration(T: number, spectrum: DesignSpectrum): number {
  switch (spectrum.type) {
    case "ASCE7":
      return getSa_ASCE7(T, spectrum.SDS, spectrum.SD1, spectrum.TL ?? 4.0);
    case "EC8":
      return getSa_EC8(T, spectrum.ag, spectrum.S ?? 1.2);
    case "NEC":
      return getSa_NEC(T, spectrum);
    case "USER":
      return getSa_User(T, spectrum.periods, spectrum.accelerations);
  }
}

/**
 * SRSS - Square Root of Sum of Squares
 */
function combineSRSS(responses: number[]): number {
  return Math.sqrt(responses.reduce((sum, r) => sum + r * r, 0));
}

/**
 * CQC - Complete Quadratic Combination
 */
function combineCQC(responses: number[], frequencies: number[], damping: number): number {
  let result = 0;
  const PI = Math.PI;

  for (let i = 0; i < responses.length; i++) {
    for (let j = 0; j < responses.length; j++) {
      const wi = 2 * PI * frequencies[i];
      const wj = 2 * PI * frequencies[j];

      if (wi < 1e-10 || wj < 1e-10) continue;

      const beta = wj / wi;
      const xi = damping;
      const xj = damping;

      let rho: number;
      if (Math.abs(beta - 1) < 1e-10) {
        rho = 1.0;
      } else {
        const num = 8 * Math.sqrt(xi * xj) * (xi + beta * xj) * Math.pow(beta, 1.5);
        const den = Math.pow(1 - beta * beta, 2) +
                    4 * xi * xj * beta * (1 + beta * beta) +
                    4 * (xi * xi + xj * xj) * beta * beta;
        rho = den > 1e-20 ? num / den : 0;
      }

      result += rho * responses[i] * responses[j];
    }
  }

  return Math.sqrt(Math.abs(result));
}

/**
 * ABS - Absolute Sum (conservative)
 */
function combineABS(responses: number[]): number {
  return responses.reduce((sum, r) => sum + Math.abs(r), 0);
}

/**
 * Combine modal responses
 */
function combineResponses(
  responses: number[],
  frequencies: number[],
  combination: CombinationType,
  damping: number
): number {
  switch (combination) {
    case "SRSS": return combineSRSS(responses);
    case "CQC": return combineCQC(responses, frequencies, damping);
    case "ABS": return combineABS(responses);
  }
}

// ============================================================================
// MAIN RESPONSE SPECTRUM FUNCTION
// ============================================================================

/**
 * Perform Response Spectrum Analysis
 *
 * @param nodes - Array of node coordinates
 * @param elements - Array of element connectivity
 * @param nodeInputs - Node-based inputs (supports, loads, springs)
 * @param elementInputs - Element-based inputs (properties)
 * @param modalResults - Results from modal analysis
 * @param options - Response spectrum options
 * @returns Response spectrum results
 */
export async function responseSpectrum(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs,
  modalResults: ModalOutputs,
  options: ResponseSpectrumOptions
): Promise<ResponseSpectrumOutputs> {
  const {
    spectrum,
    direction,
    combination,
    damping = 0.05,
    scaleFactor = 9.81,
    numModes: maxModes
  } = options;

  const G = 9.81;
  const PI = Math.PI;

  // Direction index: X=0, Y=1, Z=2
  const dirKey = direction === "X" ? "UX" : direction === "Y" ? "UY" : "UZ";
  const dirIndex = direction === "X" ? 0 : direction === "Y" ? 1 : 2;

  // Get modal data
  const frequencies = Array.from(modalResults.frequencies.values());
  const periods = Array.from(modalResults.periods.values());
  const modeShapes = modalResults.modeShapes;
  const massParticipation = modalResults.massParticipation;

  const numModes = maxModes ? Math.min(maxModes, frequencies.length) : frequencies.length;
  const numNodes = nodes.length;
  const numDOFs = 6;

  // Calculate spectral accelerations for each mode
  const spectralAccelerations = new Map<number, number>();
  for (let m = 0; m < numModes; m++) {
    const T = periods[m];
    const Sa = getSpectralAcceleration(T, spectrum);
    spectralAccelerations.set(m + 1, Sa);
  }

  // Calculate modal responses
  const modalDisplacements: Map<number, Map<number, number[]>> = new Map();
  const modalForces: Map<number, Map<number, number[]>> = new Map();
  const modalBaseShears: number[][] = [];

  for (let m = 0; m < numModes; m++) {
    const modeNum = m + 1;
    const T = periods[m];
    const Sa = spectralAccelerations.get(modeNum) || 0;

    // Spectral displacement: Sd = Sa * g * T² / (4π²)
    const Sd = Sa * G * T * T / (4 * PI * PI);

    // Get mode shape
    const phi = modeShapes.get(modeNum);
    if (!phi) continue;

    // Get participation factor
    const participation = massParticipation.get(modeNum);
    const gamma = participation ? participation[dirKey] : 0;

    // Modal displacement: u_m = Γ * Sd * φ
    const modeDisp = new Map<number, number[]>();
    const modeForce = new Map<number, number[]>();

    let Vx = 0, Vy = 0, Vz = 0;

    for (let n = 0; n < numNodes; n++) {
      const phiNode = phi.slice(n * numDOFs, (n + 1) * numDOFs);

      // Displacement for this mode
      const u = phiNode.map(p => gamma * Sd * p * scaleFactor / G);
      modeDisp.set(n, u);

      // Force: F = Γ * Sa * M * φ (assuming unit mass)
      const f = phiNode.map(p => gamma * Sa * scaleFactor * p);
      modeForce.set(n, f);

      // Accumulate base shear
      Vx += f[0];
      Vy += f[1];
      Vz += f[2];
    }

    modalDisplacements.set(modeNum, modeDisp);
    modalForces.set(modeNum, modeForce);
    modalBaseShears.push([Vx, Vy, Vz]);
  }

  // Combine modal responses
  const combinedDisplacements = new Map<number, [number, number, number, number, number, number]>();
  const combinedForces = new Map<number, [number, number, number, number, number, number]>();
  const freqArray = frequencies.slice(0, numModes);

  for (let n = 0; n < numNodes; n++) {
    const dispResults: number[][] = [[], [], [], [], [], []];
    const forceResults: number[][] = [[], [], [], [], [], []];

    for (let m = 0; m < numModes; m++) {
      const modeNum = m + 1;
      const modeDisp = modalDisplacements.get(modeNum);
      const modeForce = modalForces.get(modeNum);

      if (modeDisp && modeForce) {
        const d = modeDisp.get(n) || [0, 0, 0, 0, 0, 0];
        const f = modeForce.get(n) || [0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 6; i++) {
          dispResults[i].push(d[i]);
          forceResults[i].push(f[i]);
        }
      }
    }

    const combinedDisp: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    const combinedForce: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 6; i++) {
      combinedDisp[i] = combineResponses(dispResults[i], freqArray, combination, damping);
      combinedForce[i] = combineResponses(forceResults[i], freqArray, combination, damping);
    }

    combinedDisplacements.set(n, combinedDisp);
    combinedForces.set(n, combinedForce);
  }

  // Combine base shear
  const baseShearX = modalBaseShears.map(v => v[0]);
  const baseShearY = modalBaseShears.map(v => v[1]);
  const baseShearZ = modalBaseShears.map(v => v[2]);

  const combinedBaseShear: [number, number, number] = [
    combineResponses(baseShearX, freqArray, combination, damping),
    combineResponses(baseShearY, freqArray, combination, damping),
    combineResponses(baseShearZ, freqArray, combination, damping)
  ];

  // Format modal responses for output
  const modalResponsesOutput = new Map<number, Map<number, [number, number, number, number, number, number]>>();
  for (const [modeNum, modeDisp] of modalDisplacements) {
    const modeMap = new Map<number, [number, number, number, number, number, number]>();
    for (const [nodeId, disp] of modeDisp) {
      modeMap.set(nodeId, disp as [number, number, number, number, number, number]);
    }
    modalResponsesOutput.set(modeNum, modeMap);
  }

  return {
    displacements: combinedDisplacements,
    forces: combinedForces,
    baseShear: combinedBaseShear,
    modalResponses: modalResponsesOutput,
    spectralAccelerations
  };
}

/**
 * Get design spectrum curve for visualization
 * @param spectrum - Design spectrum definition
 * @param Tmax - Maximum period to plot
 * @param numPoints - Number of points
 * @returns Array of [T, Sa] pairs
 */
export function getSpectrumCurve(
  spectrum: DesignSpectrum,
  Tmax: number = 4.0,
  numPoints: number = 100
): [number, number][] {
  const curve: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const T = (i / numPoints) * Tmax;
    const Sa = getSpectralAcceleration(T, spectrum);
    curve.push([T, Sa]);
  }

  return curve;
}

export default responseSpectrum;
