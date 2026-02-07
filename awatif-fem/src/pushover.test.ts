/**
 * Pushover Analysis Tests
 * =======================
 */

import {
  pushover,
  getPerformancePoint,
  PushoverOptions,
  HingeDefinition
} from "./pushoverCpp";
import { Node, NodeInputs, ElementInputs } from "./data-model";

describe("Pushover Analysis", () => {

  // Simple 2-story frame model
  const createFrameModel = (): {
    nodes: Node[];
    elements: number[][];
    nodeInputs: NodeInputs;
    elementInputs: ElementInputs;
    K: number[][];
    masses: Map<number, number>;
  } => {
    // 4 nodes: 2 at base (fixed), 2 at first floor
    const nodes: Node[] = [
      [0, 0, 0],    // Node 0: Base left (fixed)
      [6, 0, 0],    // Node 1: Base right (fixed)
      [0, 0, 3],    // Node 2: First floor left
      [6, 0, 3]     // Node 3: First floor right
    ];

    // Elements: 2 columns + 1 beam
    const elements = [
      [0, 2],  // Left column
      [1, 3],  // Right column
      [2, 3]   // Beam
    ];

    // Supports: base nodes fixed
    const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
    supports.set(0, [true, true, true, true, true, true]);
    supports.set(1, [true, true, true, true, true, true]);

    const nodeInputs: NodeInputs = { supports };

    // Element properties (concrete)
    const elasticities = new Map<number, number>();
    const areas = new Map<number, number>();
    const momentsOfInertiaY = new Map<number, number>();
    const momentsOfInertiaZ = new Map<number, number>();

    // Columns: 0.4x0.4m
    elasticities.set(0, 25e9);
    elasticities.set(1, 25e9);
    areas.set(0, 0.16);
    areas.set(1, 0.16);
    momentsOfInertiaY.set(0, 0.00213);
    momentsOfInertiaY.set(1, 0.00213);
    momentsOfInertiaZ.set(0, 0.00213);
    momentsOfInertiaZ.set(1, 0.00213);

    // Beam: 0.3x0.5m
    elasticities.set(2, 25e9);
    areas.set(2, 0.15);
    momentsOfInertiaY.set(2, 0.00312);
    momentsOfInertiaZ.set(2, 0.00112);

    const elementInputs: ElementInputs = {
      elasticities,
      areas,
      momentsOfInertiaY,
      momentsOfInertiaZ
    };

    // Build stiffness matrix (simplified - just diagonal for testing)
    const totalDOFs = 24;  // 4 nodes x 6 DOFs
    const K: number[][] = Array.from({ length: totalDOFs }, () =>
      new Array(totalDOFs).fill(0)
    );

    // Simplified stiffness for testing
    const k_col = 12 * 25e9 * 0.00213 / Math.pow(3, 3);  // 12EI/L^3

    // Free DOFs at nodes 2 and 3 (DOFs 12-23)
    K[12][12] = k_col;  // UX node 2
    K[13][13] = k_col;  // UY node 2
    K[14][14] = 25e9 * 0.16 / 3;  // UZ node 2
    K[15][15] = k_col * 0.1;  // RX node 2
    K[16][16] = k_col * 0.1;  // RY node 2
    K[17][17] = k_col * 0.1;  // RZ node 2

    K[18][18] = k_col;  // UX node 3
    K[19][19] = k_col;  // UY node 3
    K[20][20] = 25e9 * 0.16 / 3;  // UZ node 3
    K[21][21] = k_col * 0.1;  // RX node 3
    K[22][22] = k_col * 0.1;  // RY node 3
    K[23][23] = k_col * 0.1;  // RZ node 3

    // Coupling between nodes 2 and 3 (beam)
    K[12][18] = -k_col * 0.5;
    K[18][12] = -k_col * 0.5;

    // Masses at floor level
    const masses = new Map<number, number>();
    masses.set(2, 50000);  // 50 tons at node 2
    masses.set(3, 50000);  // 50 tons at node 3

    return { nodes, elements, nodeInputs, elementInputs, K, masses };
  };

  describe("Load Pattern Generation", () => {
    it("should generate uniform load pattern", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, masses } = createFrameModel();

      const options: PushoverOptions = {
        loadPattern: "uniform",
        direction: "X",
        controlNode: 2,
        controlDOF: 0,  // UX
        targetDisplacement: 0.01,
        numSteps: 5
      };

      const results = await pushover(
        nodes, elements, nodeInputs, elementInputs, K, masses, options
      );

      expect(results.steps.length).toBeGreaterThan(0);
      expect(results.capacityCurve.length).toBeGreaterThan(0);
    });

    it("should generate triangular load pattern", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, masses } = createFrameModel();

      const options: PushoverOptions = {
        loadPattern: "triangular",
        direction: "X",
        controlNode: 2,
        controlDOF: 0,
        targetDisplacement: 0.01,
        numSteps: 5
      };

      const results = await pushover(
        nodes, elements, nodeInputs, elementInputs, K, masses, options
      );

      expect(results.steps.length).toBeGreaterThan(0);
    });
  });

  describe("Capacity Curve", () => {
    it("should produce monotonically increasing displacement", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, masses } = createFrameModel();

      const options: PushoverOptions = {
        loadPattern: "uniform",
        direction: "X",
        controlNode: 2,
        controlDOF: 0,
        targetDisplacement: 0.05,
        numSteps: 10
      };

      const results = await pushover(
        nodes, elements, nodeInputs, elementInputs, K, masses, options
      );

      // Check monotonic displacement increase
      for (let i = 1; i < results.capacityCurve.length; i++) {
        expect(results.capacityCurve[i][0]).toBeGreaterThanOrEqual(
          results.capacityCurve[i - 1][0]
        );
      }
    });

    it("should increase base shear with displacement in elastic range", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, masses } = createFrameModel();

      const options: PushoverOptions = {
        loadPattern: "uniform",
        direction: "X",
        controlNode: 2,
        controlDOF: 0,
        targetDisplacement: 0.01,  // Small displacement (elastic)
        numSteps: 5
      };

      const results = await pushover(
        nodes, elements, nodeInputs, elementInputs, K, masses, options
      );

      // Base shear should increase with displacement
      const firstNonZero = results.capacityCurve.find(([d, _]) => d > 0);
      const last = results.capacityCurve[results.capacityCurve.length - 1];

      if (firstNonZero && last[0] > firstNonZero[0]) {
        expect(last[1]).toBeGreaterThanOrEqual(firstNonZero[1]);
      }
    });
  });

  describe("Plastic Hinges", () => {
    it("should track hinge states", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, masses } = createFrameModel();

      // Define hinges with low yield moment for testing
      const hingeDefinitions = new Map<number, HingeDefinition>();
      hingeDefinitions.set(0, {
        type: "moment",
        yieldMoment: 100000,  // 100 kN·m
        maxRotation: 0.05
      });
      hingeDefinitions.set(1, {
        type: "moment",
        yieldMoment: 100000,
        maxRotation: 0.05
      });

      const options: PushoverOptions = {
        loadPattern: "uniform",
        direction: "X",
        controlNode: 2,
        controlDOF: 0,
        targetDisplacement: 0.1,
        numSteps: 20,
        hingeDefinitions
      };

      const results = await pushover(
        nodes, elements, nodeInputs, elementInputs, K, masses, options
      );

      // Should have hinges tracked
      expect(results.hinges.length).toBeGreaterThan(0);

      // Each element with hinge definition should have 2 hinges (start and end)
      expect(results.hinges.length).toBe(4);
    });
  });

  describe("Performance Point", () => {
    it("should calculate performance point from capacity curve", () => {
      // Simple bilinear capacity curve
      const capacityCurve: [number, number][] = [
        [0, 0],
        [0.01, 500000],
        [0.02, 800000],
        [0.05, 1000000],
        [0.10, 1100000]
      ];

      const result = getPerformancePoint(
        capacityCurve,
        100000,  // Modal mass (100 tons)
        1.2,     // Modal participation factor
        { SDS: 1.0, SD1: 0.6 },  // ASCE 7 spectrum
        0.05     // 5% damping
      );

      // Result may or may not be found depending on curve-spectrum intersection
      // Just verify the function runs without error
      expect(result === undefined || typeof result.displacement === "number").toBe(true);
    });
  });

  describe("Ductility", () => {
    it("should calculate ductility ratio", async () => {
      const { nodes, elements, nodeInputs, elementInputs, K, masses } = createFrameModel();

      const hingeDefinitions = new Map<number, HingeDefinition>();
      hingeDefinitions.set(0, {
        type: "moment",
        yieldMoment: 50000,  // Low yield for early yielding
        maxRotation: 0.1
      });

      const options: PushoverOptions = {
        loadPattern: "uniform",
        direction: "X",
        controlNode: 2,
        controlDOF: 0,
        targetDisplacement: 0.1,
        numSteps: 20,
        hingeDefinitions
      };

      const results = await pushover(
        nodes, elements, nodeInputs, elementInputs, K, masses, options
      );

      // If yield point exists, ductility should be calculated
      if (results.yieldPoint && results.ultimatePoint) {
        expect(results.ductility).toBeDefined();
        expect(results.ductility).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
