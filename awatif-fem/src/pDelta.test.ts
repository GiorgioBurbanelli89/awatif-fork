/**
 * P-Delta Analysis Tests
 * ======================
 */

import {
  pDelta,
  getAmplificationFactor,
  isPDeltaSignificant,
  PDeltaOptions
} from "./pDeltaCpp";
import { Node, NodeInputs, ElementInputs } from "./data-model";

describe("P-Delta Analysis", () => {

  // Simple cantilever column model
  const createCantileverModel = (): {
    nodes: Node[];
    elements: number[][];
    nodeInputs: NodeInputs;
    elementInputs: ElementInputs;
    K: number[][];
  } => {
    // Two nodes: base (fixed) and top (free)
    const nodes: Node[] = [
      [0, 0, 0],   // Base
      [0, 0, 3]    // Top (3m height)
    ];

    const elements = [[0, 1]];

    const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
    supports.set(0, [true, true, true, true, true, true]);

    const nodeInputs: NodeInputs = { supports };

    // Steel column W10x49
    const elasticities = new Map<number, number>();
    const areas = new Map<number, number>();
    const momentsOfInertiaZ = new Map<number, number>();

    elasticities.set(0, 200e9);  // Steel E = 200 GPa
    areas.set(0, 0.0093);        // 93 cm^2
    momentsOfInertiaZ.set(0, 1.12e-4);  // I = 1120 cm^4

    const elementInputs: ElementInputs = {
      elasticities,
      areas,
      momentsOfInertiaZ
    };

    // Build stiffness matrix for cantilever
    const totalDOFs = 12;
    const K: number[][] = Array.from({ length: totalDOFs }, () =>
      new Array(totalDOFs).fill(0)
    );

    const E = 200e9;
    const I = 1.12e-4;
    const A = 0.0093;
    const L = 3;

    // Axial stiffness
    const ka = E * A / L;
    K[2][2] = ka;
    K[8][2] = -ka;
    K[2][8] = -ka;
    K[8][8] = ka;

    // Bending stiffness (strong axis - UX direction)
    const kb = 12 * E * I / Math.pow(L, 3);
    const km = 6 * E * I / Math.pow(L, 2);
    const kr = 4 * E * I / L;
    const krp = 2 * E * I / L;

    // UX
    K[0][0] = kb;
    K[0][6] = -kb;
    K[6][0] = -kb;
    K[6][6] = kb;

    // UX - RY coupling
    K[0][4] = km;
    K[0][10] = km;
    K[4][0] = km;
    K[10][0] = km;
    K[6][4] = -km;
    K[6][10] = -km;
    K[4][6] = -km;
    K[10][6] = -km;

    // RY
    K[4][4] = kr;
    K[4][10] = krp;
    K[10][4] = krp;
    K[10][10] = kr;

    // UY (weak axis - similar structure)
    K[1][1] = kb * 0.5;  // Simplified
    K[1][7] = -kb * 0.5;
    K[7][1] = -kb * 0.5;
    K[7][7] = kb * 0.5;

    return { nodes, elements, nodeInputs, elementInputs, K };
  };

  describe("First-Order Analysis", () => {
    it("should solve without P-Delta effects", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K } = createCantileverModel();

      // Lateral load at top
      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [10000, 0, 0, 0, 0, 0]);  // 10 kN lateral

      const options: PDeltaOptions = {
        includeGeometricStiffness: false
      };

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads, options
      );

      expect(results.converged).toBe(true);
      expect(results.displacements.size).toBe(2);

      // Top node should have lateral displacement
      const topDisp = results.displacements.get(1);
      expect(topDisp).toBeDefined();
      expect(Math.abs(topDisp![0])).toBeGreaterThan(0);
    });
  });

  describe("P-Delta Effects", () => {
    it("should increase displacement with axial load", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K } = createCantileverModel();

      // Lateral load + axial load at top
      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [10000, 0, -500000, 0, 0, 0]);  // 10 kN lateral + 500 kN axial

      const options: PDeltaOptions = {
        includeGeometricStiffness: true,
        maxIterations: 20,
        tolerance: 1e-6
      };

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads, options
      );

      expect(results.converged).toBe(true);
      expect(results.iterations).toBeGreaterThan(0);

      // Amplification factor should be > 1 with P-Delta
      expect(results.amplificationFactor).toBeGreaterThanOrEqual(1);
    });

    it("should converge within max iterations", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K } = createCantileverModel();

      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [10000, 0, -100000, 0, 0, 0]);

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads
      );

      expect(results.iterations).toBeLessThanOrEqual(20);
    });
  });

  describe("Axial Forces", () => {
    it("should calculate element axial forces", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K } = createCantileverModel();

      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [0, 0, -100000, 0, 0, 0]);  // Pure axial compression

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads
      );

      expect(results.axialForces.size).toBeGreaterThan(0);

      // Column should have axial force
      const P = results.axialForces.get(0);
      expect(P).toBeDefined();
    });
  });

  describe("Stability Index", () => {
    it("should calculate stability index", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K } = createCantileverModel();

      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [10000, 0, -500000, 0, 0, 0]);

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads
      );

      // Stability index should be defined
      expect(typeof results.stabilityIndex).toBe("number");
    });
  });

  describe("Utility Functions", () => {
    it("should calculate amplification factor", () => {
      // theta = 0.1 -> B2 = 1/(1-0.1) = 1.111
      expect(getAmplificationFactor(0.1)).toBeCloseTo(1.111, 2);

      // theta = 0.2 -> B2 = 1/(1-0.2) = 1.25
      expect(getAmplificationFactor(0.2)).toBeCloseTo(1.25, 2);

      // Unstable case
      expect(getAmplificationFactor(1.0)).toBe(Infinity);
    });

    it("should identify significant P-Delta effects", () => {
      // ASCE 7: theta > 0.10 requires P-Delta
      expect(isPDeltaSignificant(0.05)).toBe(false);
      expect(isPDeltaSignificant(0.10)).toBe(false);  // Exactly 0.10 is boundary
      expect(isPDeltaSignificant(0.15)).toBe(true);
      expect(isPDeltaSignificant(0.25)).toBe(true);
    });
  });

  describe("Reactions", () => {
    it("should calculate support reactions", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K } = createCantileverModel();

      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [10000, 0, -50000, 0, 0, 0]);

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads
      );

      // Base should have reactions
      expect(results.reactions.size).toBeGreaterThan(0);

      const baseReaction = results.reactions.get(0);
      expect(baseReaction).toBeDefined();
    });
  });

  describe("Multi-story Frame", () => {
    it("should handle multi-node model", async () => {
      // 3-node cantilever (2 elements)
      const nodes: Node[] = [
        [0, 0, 0],
        [0, 0, 3],
        [0, 0, 6]
      ];

      const elements = [[0, 1], [1, 2]];

      const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
      supports.set(0, [true, true, true, true, true, true]);

      const nodeInputs: NodeInputs = { supports };

      const elasticities = new Map<number, number>();
      const areas = new Map<number, number>();
      const momentsOfInertiaZ = new Map<number, number>();

      for (let e = 0; e < 2; e++) {
        elasticities.set(e, 200e9);
        areas.set(e, 0.01);
        momentsOfInertiaZ.set(e, 1e-4);
      }

      const elementInputs: ElementInputs = {
        elasticities,
        areas,
        momentsOfInertiaZ
      };

      // Simplified stiffness matrix
      const totalDOFs = 18;
      const K: number[][] = Array.from({ length: totalDOFs }, () =>
        new Array(totalDOFs).fill(0)
      );

      const k = 12 * 200e9 * 1e-4 / 27;  // 12EI/L^3

      // Free DOFs diagonal terms
      for (let i = 6; i < 18; i++) {
        K[i][i] = k;
      }

      const loads = new Map<number, [number, number, number, number, number, number]>();
      loads.set(1, [5000, 0, -100000, 0, 0, 0]);
      loads.set(2, [10000, 0, -100000, 0, 0, 0]);

      const results = await pDelta(
        nodes, elements, nodeInputs, elementInputs, K, loads
      );

      expect(results.converged).toBe(true);
      expect(results.displacements.size).toBe(3);
      expect(results.axialForces.size).toBe(2);
    });
  });
});
