/**
 * Pushover Analysis - TypeScript Implementation
 * ==============================================
 * Static nonlinear analysis with incremental lateral loading.
 *
 * Used for seismic capacity evaluation of structures.
 *
 * Author: Hekatan Project
 * Date: 2026-02-04
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model.js";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PlasticHinge {
  elementId: number;
  location: "start" | "end" | number;  // 0-1 for intermediate
  type: "moment" | "axial" | "shear" | "PMM";
  yieldMoment?: number;      // N·m
  yieldForce?: number;       // N
  plasticRotation?: number;  // rad (current)
  maxRotation?: number;      // rad (capacity)
  state: "elastic" | "yielded" | "collapsed";
}

export interface HingeDefinition {
  type: "moment" | "axial" | "shear" | "PMM";
  yieldMoment?: number;
  yieldForce?: number;
  maxRotation?: number;
  maxDisplacement?: number;
}

export type LoadPattern = "uniform" | "triangular" | "firstMode" | "custom";

export interface PushoverOptions {
  loadPattern: LoadPattern;
  customLoads?: Map<number, [number, number, number]>;  // Node -> [Fx, Fy, Fz]
  direction: "X" | "Y";
  controlNode: number;
  controlDOF: number;  // 0=UX, 1=UY, 2=UZ
  targetDisplacement: number;  // m
  numSteps?: number;
  tolerance?: number;
  maxIterations?: number;
  hingeDefinitions?: Map<number, HingeDefinition>;  // Element -> hinge def
}

export interface PushoverStep {
  step: number;
  loadFactor: number;
  controlDisplacement: number;
  baseShear: number;
  displacements: Map<number, [number, number, number, number, number, number]>;
  hingeStates: PlasticHinge[];
  converged: boolean;
}

export interface PushoverOutputs {
  steps: PushoverStep[];
  capacityCurve: [number, number][];  // [displacement, baseShear]
  yieldPoint?: { displacement: number; baseShear: number };
  ultimatePoint?: { displacement: number; baseShear: number };
  ductility?: number;
  hinges: PlasticHinge[];
  performancePoint?: { displacement: number; baseShear: number; Sa: number; Sd: number };
}

// ============================================================================
// LOAD PATTERN GENERATION
// ============================================================================

/**
 * Generate lateral load pattern based on type
 */
function generateLoadPattern(
  nodes: Node[],
  pattern: LoadPattern,
  direction: "X" | "Y",
  customLoads?: Map<number, [number, number, number]>,
  masses?: Map<number, number>,
  modeShape?: number[]
): Map<number, [number, number, number]> {
  const loads = new Map<number, [number, number, number]>();
  const dirIndex = direction === "X" ? 0 : 1;

  // Find height range
  const heights = nodes.map(n => n[2]);
  const maxHeight = Math.max(...heights);
  const minHeight = Math.min(...heights);
  const heightRange = maxHeight - minHeight || 1;

  switch (pattern) {
    case "uniform":
      // Equal force at each node
      for (let i = 0; i < nodes.length; i++) {
        const load: [number, number, number] = [0, 0, 0];
        const mass = masses?.get(i) || 1;
        load[dirIndex] = mass;
        loads.set(i, load);
      }
      break;

    case "triangular":
      // Force proportional to height
      for (let i = 0; i < nodes.length; i++) {
        const load: [number, number, number] = [0, 0, 0];
        const height = nodes[i][2];
        const mass = masses?.get(i) || 1;
        const factor = (height - minHeight) / heightRange;
        load[dirIndex] = mass * factor;
        loads.set(i, load);
      }
      break;

    case "firstMode":
      // Force proportional to first mode shape
      if (modeShape) {
        for (let i = 0; i < nodes.length; i++) {
          const load: [number, number, number] = [0, 0, 0];
          const mass = masses?.get(i) || 1;
          const phi = modeShape[i * 6 + dirIndex] || 0;
          load[dirIndex] = mass * Math.abs(phi);
          loads.set(i, load);
        }
      } else {
        // Fall back to triangular
        return generateLoadPattern(nodes, "triangular", direction, customLoads, masses);
      }
      break;

    case "custom":
      if (customLoads) {
        return customLoads;
      }
      break;
  }

  // Normalize so total = 1
  let total = 0;
  for (const [, load] of loads) {
    total += Math.abs(load[dirIndex]);
  }
  if (total > 0) {
    for (const [nodeId, load] of loads) {
      load[dirIndex] /= total;
      loads.set(nodeId, load);
    }
  }

  return loads;
}

// ============================================================================
// PLASTIC HINGE MODEL
// ============================================================================

/**
 * Check if element has yielded and update hinge state
 */
function updateHingeState(
  hinge: PlasticHinge,
  moment: number,
  rotation: number
): PlasticHinge {
  const updated = { ...hinge };

  if (hinge.type === "moment" && hinge.yieldMoment) {
    if (Math.abs(moment) >= hinge.yieldMoment) {
      if (updated.state === "elastic") {
        updated.state = "yielded";
      }
      // Accumulate plastic rotation
      const excessMoment = Math.abs(moment) - hinge.yieldMoment;
      updated.plasticRotation = (updated.plasticRotation || 0) + excessMoment * 0.001;

      // Check collapse
      if (updated.maxRotation && updated.plasticRotation > updated.maxRotation) {
        updated.state = "collapsed";
      }
    }
  }

  return updated;
}

// ============================================================================
// STIFFNESS MATRIX MODIFICATION
// ============================================================================

/**
 * Reduce stiffness for yielded hinges
 */
function modifyStiffnessForHinges(
  K: number[][],
  hinges: PlasticHinge[],
  elements: Element[],
  numDOFsPerNode: number
): number[][] {
  const K_mod = K.map(row => [...row]);

  for (const hinge of hinges) {
    if (hinge.state === "yielded" || hinge.state === "collapsed") {
      const elem = elements[hinge.elementId];
      if (!elem) continue;

      // Reduce rotational stiffness at hinge location
      const reductionFactor = hinge.state === "collapsed" ? 0.001 : 0.1;

      const nodeIdx = hinge.location === "start" ? elem[0] : elem[elem.length - 1];
      const rotDOFs = [
        nodeIdx * numDOFsPerNode + 3,  // RX
        nodeIdx * numDOFsPerNode + 4,  // RY
        nodeIdx * numDOFsPerNode + 5   // RZ
      ];

      for (const dof of rotDOFs) {
        if (dof < K_mod.length) {
          K_mod[dof][dof] *= reductionFactor;
        }
      }
    }
  }

  return K_mod;
}

// ============================================================================
// MAIN PUSHOVER FUNCTION
// ============================================================================

/**
 * Perform Pushover Analysis
 */
export async function pushover(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs,
  stiffnessMatrix: number[][],
  masses: Map<number, number>,
  options: PushoverOptions,
  modeShape?: number[]
): Promise<PushoverOutputs> {
  const {
    loadPattern,
    customLoads,
    direction,
    controlNode,
    controlDOF,
    targetDisplacement,
    numSteps = 50,
    tolerance = 1e-6,
    maxIterations = 100,
    hingeDefinitions
  } = options;

  const numNodes = nodes.length;
  const numDOFsPerNode = 6;
  const totalDOFs = numNodes * numDOFsPerNode;
  const dirIndex = direction === "X" ? 0 : 1;

  // Generate load pattern
  const lateralLoads = generateLoadPattern(
    nodes, loadPattern, direction, customLoads, masses, modeShape
  );

  // Initialize hinges
  const hinges: PlasticHinge[] = [];
  if (hingeDefinitions) {
    for (const [elemId, def] of hingeDefinitions) {
      hinges.push({
        elementId: elemId,
        location: "start",
        type: def.type,
        yieldMoment: def.yieldMoment,
        yieldForce: def.yieldForce,
        maxRotation: def.maxRotation,
        plasticRotation: 0,
        state: "elastic"
      });
      hinges.push({
        elementId: elemId,
        location: "end",
        type: def.type,
        yieldMoment: def.yieldMoment,
        yieldForce: def.yieldForce,
        maxRotation: def.maxRotation,
        plasticRotation: 0,
        state: "elastic"
      });
    }
  }

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

  // Control DOF in reduced system
  const controlFullDOF = controlNode * numDOFsPerNode + controlDOF;
  const controlReducedDOF = dofMap.get(controlFullDOF);

  if (controlReducedDOF === undefined) {
    throw new Error("Control DOF is constrained");
  }

  // Extract and reduce stiffness matrix
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
  const F_pattern = new Array(numFreeDOFs).fill(0);
  for (const [nodeId, load] of lateralLoads) {
    for (let d = 0; d < 3; d++) {
      const fullDOF = nodeId * numDOFsPerNode + d;
      const reducedDOF = dofMap.get(fullDOF);
      if (reducedDOF !== undefined) {
        F_pattern[reducedDOF] = load[d];
      }
    }
  }

  // Simple solver
  const solve = (K: number[][], F: number[]): number[] => {
    const n = F.length;
    const augmented = K.map((row, i) => [...row, F[i]]);

    // Gaussian elimination
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

    // Back substitution
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

  // Pushover steps
  const steps: PushoverStep[] = [];
  const capacityCurve: [number, number][] = [];

  let currentK = stiffnessMatrix;
  let totalDisp = new Array(numFreeDOFs).fill(0);

  const dispIncrement = targetDisplacement / numSteps;

  for (let step = 0; step <= numSteps; step++) {
    // Target displacement for this step
    const targetDisp = step * dispIncrement;

    // Modify stiffness for hinges
    const K_mod = modifyStiffnessForHinges(currentK, hinges, elements, numDOFsPerNode);
    const K_red = extractReducedMatrix(K_mod);

    // Displacement control: find load factor for target displacement
    // Solve: K * u = λ * F
    // We want u[controlDOF] = targetDisp
    // So: λ = targetDisp / (K^-1 * F)[controlDOF]

    const u_unit = solve(K_red.map(r => [...r]), F_pattern);
    const u_control_unit = u_unit[controlReducedDOF];

    let loadFactor = 0;
    if (Math.abs(u_control_unit) > 1e-15) {
      loadFactor = targetDisp / u_control_unit;
    }

    // Calculate displacements
    const u_reduced = u_unit.map(u => u * loadFactor);
    totalDisp = u_reduced;

    // Expand to full DOFs
    const displacements = new Map<number, [number, number, number, number, number, number]>();
    for (let n = 0; n < numNodes; n++) {
      const nodeDisp: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
      for (let d = 0; d < numDOFsPerNode; d++) {
        const fullDOF = n * numDOFsPerNode + d;
        const reducedDOF = dofMap.get(fullDOF);
        if (reducedDOF !== undefined) {
          nodeDisp[d] = u_reduced[reducedDOF];
        }
      }
      displacements.set(n, nodeDisp);
    }

    // Calculate base shear
    let baseShear = 0;
    for (let i = 0; i < numFreeDOFs; i++) {
      baseShear += F_pattern[i] * loadFactor;
    }

    // Update hinges (simplified - check moments at element ends)
    for (let h = 0; h < hinges.length; h++) {
      const hinge = hinges[h];
      const elem = elements[hinge.elementId];
      if (!elem) continue;

      // Estimate moment from displacement (simplified)
      const n1 = elem[0];
      const n2 = elem[elem.length - 1];
      const d1 = displacements.get(n1);
      const d2 = displacements.get(n2);

      if (d1 && d2) {
        const rotation = Math.abs(d1[4] - d2[4]);  // RY difference
        const E = elementInputs.elasticities?.get(hinge.elementId) || 25e9;
        const I = elementInputs.momentsOfInertiaY?.get(hinge.elementId) || 0.001;
        const L = Math.sqrt(
          Math.pow(nodes[n2][0] - nodes[n1][0], 2) +
          Math.pow(nodes[n2][1] - nodes[n1][1], 2) +
          Math.pow(nodes[n2][2] - nodes[n1][2], 2)
        ) || 1;

        const moment = 4 * E * I * rotation / L;
        hinges[h] = updateHingeState(hinge, moment, rotation);
      }
    }

    // Store step
    const controlDisp = displacements.get(controlNode)?.[controlDOF] || 0;

    steps.push({
      step,
      loadFactor,
      controlDisplacement: controlDisp,
      baseShear: Math.abs(baseShear),
      displacements,
      hingeStates: hinges.map(h => ({ ...h })),
      converged: true
    });

    capacityCurve.push([controlDisp, Math.abs(baseShear)]);

    // Check for collapse
    const collapsedHinges = hinges.filter(h => h.state === "collapsed").length;
    if (collapsedHinges > hinges.length * 0.3) {
      break;  // Structure has collapsed
    }
  }

  // Find yield and ultimate points
  let yieldPoint: { displacement: number; baseShear: number } | undefined;
  let ultimatePoint: { displacement: number; baseShear: number } | undefined;

  // Simple yield detection: first hinge yields
  const firstYieldStep = steps.find(s =>
    s.hingeStates.some(h => h.state === "yielded")
  );
  if (firstYieldStep) {
    yieldPoint = {
      displacement: firstYieldStep.controlDisplacement,
      baseShear: firstYieldStep.baseShear
    };
  }

  // Ultimate: maximum base shear
  const maxShear = Math.max(...capacityCurve.map(([, V]) => V));
  const ultimateStep = capacityCurve.find(([, V]) => V === maxShear);
  if (ultimateStep) {
    ultimatePoint = {
      displacement: ultimateStep[0],
      baseShear: ultimateStep[1]
    };
  }

  // Ductility
  let ductility: number | undefined;
  if (yieldPoint && ultimatePoint) {
    ductility = ultimatePoint.displacement / yieldPoint.displacement;
  }

  return {
    steps,
    capacityCurve,
    yieldPoint,
    ultimatePoint,
    ductility,
    hinges
  };
}

/**
 * Calculate performance point using Capacity Spectrum Method (ATC-40)
 */
export function getPerformancePoint(
  capacityCurve: [number, number][],
  modalMass: number,
  modalParticipation: number,
  spectrum: { SDS: number; SD1: number; TL?: number },
  damping: number = 0.05
): { displacement: number; baseShear: number; Sa: number; Sd: number } | undefined {
  // Convert capacity curve to ADRS format (Sa vs Sd)
  const adrsCapacity: [number, number][] = capacityCurve.map(([d, V]) => {
    const Sd = d / modalParticipation;
    const Sa = V / (modalMass * 9.81);
    return [Sd, Sa];
  });

  // Generate demand spectrum in ADRS format
  const adrsDemand: [number, number][] = [];
  const { SDS, SD1, TL = 4.0 } = spectrum;

  for (let T = 0.01; T <= 4.0; T += 0.01) {
    let Sa: number;
    const T0 = 0.2 * SD1 / SDS;
    const Ts = SD1 / SDS;

    if (T <= T0) {
      Sa = SDS * (0.4 + 0.6 * T / T0);
    } else if (T <= Ts) {
      Sa = SDS;
    } else if (T <= TL) {
      Sa = SD1 / T;
    } else {
      Sa = SD1 * TL / (T * T);
    }

    const Sd = Sa * 9.81 * T * T / (4 * Math.PI * Math.PI);
    adrsDemand.push([Sd, Sa]);
  }

  // Find intersection (simplified)
  for (let i = 0; i < adrsCapacity.length - 1; i++) {
    const [Sd1, Sa1] = adrsCapacity[i];
    const [Sd2, Sa2] = adrsCapacity[i + 1];

    for (let j = 0; j < adrsDemand.length - 1; j++) {
      const [SdD1, SaD1] = adrsDemand[j];
      const [SdD2, SaD2] = adrsDemand[j + 1];

      // Check if segments intersect
      if (Sd1 <= SdD2 && Sd2 >= SdD1) {
        // Linear interpolation to find intersection
        const t = (SdD1 - Sd1) / (Sd2 - Sd1 + SdD1 - SdD2 + 1e-10);
        if (t >= 0 && t <= 1) {
          const Sd = Sd1 + t * (Sd2 - Sd1);
          const Sa = Sa1 + t * (Sa2 - Sa1);

          return {
            displacement: Sd * modalParticipation,
            baseShear: Sa * modalMass * 9.81,
            Sa,
            Sd
          };
        }
      }
    }
  }

  return undefined;
}

export default pushover;
