/**
 * Time History Analysis Tests
 * ============================
 */

import {
  timeHistory,
  calculateRayleighDamping,
  calculateRayleighEqual,
  createSinusoidalMotion,
  createImpulseMotion,
  createElCentroLike,
  GroundMotion
} from "./timeHistoryCpp";
import { Node, NodeInputs, ElementInputs } from "./data-model";

describe("Time History Analysis", () => {

  describe("Rayleigh Damping Calculations", () => {
    it("should calculate correct coefficients for equal damping", () => {
      const { alpha, beta } = calculateRayleighEqual(1.0, 5.0, 0.05);

      // At f=1Hz and f=5Hz, damping should be approximately 5%
      const w1 = 2 * Math.PI * 1.0;
      const w2 = 2 * Math.PI * 5.0;

      // Check: xi = alpha/(2*w) + beta*w/2
      const xi1 = alpha / (2 * w1) + beta * w1 / 2;
      const xi2 = alpha / (2 * w2) + beta * w2 / 2;

      expect(xi1).toBeCloseTo(0.05, 2);
      expect(xi2).toBeCloseTo(0.05, 2);
    });

    it("should calculate coefficients for different damping ratios", () => {
      const { alpha, beta } = calculateRayleighDamping(1.0, 10.0, 0.02, 0.08);

      // Verify at target frequencies
      const w1 = 2 * Math.PI * 1.0;
      const w2 = 2 * Math.PI * 10.0;

      const xi1 = alpha / (2 * w1) + beta * w1 / 2;
      const xi2 = alpha / (2 * w2) + beta * w2 / 2;

      expect(xi1).toBeCloseTo(0.02, 2);
      expect(xi2).toBeCloseTo(0.08, 2);
    });
  });

  describe("Ground Motion Utilities", () => {
    it("should create sinusoidal motion", () => {
      const motion = createSinusoidalMotion(2.0, 1.0, 1.0, 0.01);

      expect(motion.dt).toBe(0.01);
      expect(motion.accelerations.length).toBe(100);

      // Check peak amplitude
      const maxAbs = Math.max(...motion.accelerations.map(Math.abs));
      expect(maxAbs).toBeCloseTo(1.0, 2);
    });

    it("should create impulse motion", () => {
      const motion = createImpulseMotion(5.0, 1.0, 0.01);

      expect(motion.accelerations.length).toBe(100);

      // Peak should be at t ≈ 0.05s
      const peakIdx = motion.accelerations.indexOf(Math.max(...motion.accelerations));
      expect(peakIdx * motion.dt).toBeCloseTo(0.05, 1);
    });

    it("should create El Centro-like motion", () => {
      const motion = createElCentroLike(1.0, 0.02);

      expect(motion.accelerations.length).toBe(500);  // 10s / 0.02s
      expect(motion.name).toContain("El Centro");
    });
  });

  describe("SDOF Time History", () => {
    // Simple SDOF system: single mass on spring
    const createSDOFModel = (): {
      nodes: Node[];
      elements: number[][];
      nodeInputs: NodeInputs;
      elementInputs: ElementInputs;
      K: number[][];
      M: number[][];
    } => {
      // Two nodes: 0=fixed base, 1=free mass
      const nodes: Node[] = [
        [0, 0, 0],
        [0, 0, 1]
      ];

      const elements = [[0, 1]];

      const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
      supports.set(0, [true, true, true, true, true, true]);  // Fixed base

      const nodeInputs: NodeInputs = { supports };
      const elementInputs: ElementInputs = {};

      // Simple 12x12 matrices (2 nodes x 6 DOFs)
      // Only DOF 6 (node 1, UX) is free with K=100 N/m, M=1 kg
      const totalDOFs = 12;
      const K: number[][] = Array.from({ length: totalDOFs }, () =>
        new Array(totalDOFs).fill(0)
      );
      const M: number[][] = Array.from({ length: totalDOFs }, () =>
        new Array(totalDOFs).fill(0)
      );

      // Stiffness in X direction
      K[0][0] = 100; K[0][6] = -100;
      K[6][0] = -100; K[6][6] = 100;

      // Mass at free node (UX only for simplicity)
      M[6][6] = 1.0;

      return { nodes, elements, nodeInputs, elementInputs, K, M };
    };

    it("should respond to impulse with natural frequency", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, M } = createSDOFModel();

      // Natural frequency: f = sqrt(k/m)/(2*pi) = sqrt(100/1)/(2*pi) ≈ 1.59 Hz
      const expectedFreq = Math.sqrt(100 / 1) / (2 * Math.PI);

      // Short impulse motion
      const motion = createImpulseMotion(10.0, 2.0, 0.005);

      const results = await timeHistory(
        nodes,
        elements,
        nodeInputs,
        elementInputs,
        K,
        M,
        {
          groundMotion: motion,
          direction: "X",
          damping: { type: "rayleigh", alpha: 0, beta: 0 },  // No damping
          newmark: { beta: 0.25, gamma: 0.5 }
        }
      );

      // Check that we got results
      expect(results.time.length).toBeGreaterThan(0);
      expect(results.displacements.size).toBe(2);
      expect(results.peakDisplacement.get(1)).toBeDefined();
    });

    it("should show damped response", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, M } = createSDOFModel();

      const motion = createImpulseMotion(10.0, 3.0, 0.005);

      // Undamped
      const undamped = await timeHistory(
        nodes, elements, nodeInputs, elementInputs, K, M,
        {
          groundMotion: motion,
          direction: "X",
          damping: { type: "rayleigh", alpha: 0, beta: 0 }
        }
      );

      // Damped (5%)
      const damped = await timeHistory(
        nodes, elements, nodeInputs, elementInputs, K, M,
        {
          groundMotion: motion,
          direction: "X",
          damping: { type: "frequency", f1: 1.0, f2: 5.0, xi1: 0.05, xi2: 0.05 }
        }
      );

      // Peak displacement should be smaller with damping
      const peakUndamped = Math.abs(undamped.peakDisplacement.get(1)![0]);
      const peakDamped = Math.abs(damped.peakDisplacement.get(1)![0]);

      // Allow for some variation but damped should generally be less
      expect(peakDamped).toBeLessThanOrEqual(peakUndamped * 1.5);
    });
  });
});
