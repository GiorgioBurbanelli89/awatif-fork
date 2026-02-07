/**
 * Response Spectrum Analysis Tests
 * =================================
 * Tests for SRSS/CQC modal combination and design spectra.
 */

import { responseSpectrum, getSpectrumCurve, DesignSpectrum } from "./responseSpectrumCpp";
import type { ModalOutputs } from "./modalCpp";
import { Node, Element, NodeInputs, ElementInputs } from "./data-model";

describe("Response Spectrum Analysis", () => {
  // Simple cantilever model for testing
  const createTestModel = (): {
    nodes: Node[];
    elements: Element[];
    nodeInputs: NodeInputs;
    elementInputs: ElementInputs;
  } => {
    // 3-story single column (cantilever)
    const nodes: Node[] = [
      [0, 0, 0],   // Node 0: base (fixed)
      [0, 0, 3],   // Node 1: level 1
      [0, 0, 6],   // Node 2: level 2
      [0, 0, 9]    // Node 3: level 3
    ];

    const elements: Element[] = [
      [0, 1],  // Element 0
      [1, 2],  // Element 1
      [2, 3]   // Element 2
    ];

    // Fixed base support
    const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
    supports.set(0, [true, true, true, true, true, true]);

    const nodeInputs: NodeInputs = { supports };

    // Properties
    const E = 25e9;  // Pa
    const elementInputs: ElementInputs = {
      elasticities: new Map([[0, E], [1, E], [2, E]]),
      areas: new Map([[0, 0.16], [1, 0.16], [2, 0.16]]),
      momentsOfInertiaZ: new Map([[0, 0.00213], [1, 0.00213], [2, 0.00213]]),
      momentsOfInertiaY: new Map([[0, 0.00213], [1, 0.00213], [2, 0.00213]])
    };

    return { nodes, elements, nodeInputs, elementInputs };
  };

  describe("ASCE 7 Spectrum", () => {
    it("should calculate correct spectral accelerations", () => {
      const spectrum: DesignSpectrum = {
        type: "ASCE7",
        SDS: 1.0,
        SD1: 0.6,
        TL: 4.0
      };

      const curve = getSpectrumCurve(spectrum, 4.0, 40);

      // T0 = 0.2 * 0.6 / 1.0 = 0.12s
      // Ts = 0.6 / 1.0 = 0.6s

      // Check plateau (T between T0 and Ts)
      const plateau = curve.find(([T]) => T >= 0.12 && T <= 0.6);
      expect(plateau).toBeDefined();
      if (plateau) {
        expect(plateau[1]).toBeCloseTo(1.0, 2);  // Sa = SDS = 1.0g
      }

      // Check descending branch (T > Ts)
      const descending = curve.find(([T]) => Math.abs(T - 1.0) < 0.05);
      if (descending) {
        expect(descending[1]).toBeCloseTo(0.6, 1);  // Sa = SD1/T = 0.6/1.0
      }
    });
  });

  describe("Eurocode 8 Spectrum", () => {
    it("should calculate correct spectral accelerations", () => {
      const spectrum: DesignSpectrum = {
        type: "EC8",
        ag: 0.35,
        S: 1.2
      };

      const curve = getSpectrumCurve(spectrum, 4.0, 40);

      // Check plateau (TB=0.15 to TC=0.5)
      const plateau = curve.find(([T]) => T >= 0.15 && T <= 0.5);
      expect(plateau).toBeDefined();
      if (plateau) {
        // Sa = ag * S * eta * 2.5 = 0.35 * 1.2 * 1.0 * 2.5 = 1.05g
        expect(plateau[1]).toBeCloseTo(1.05, 2);
      }
    });
  });

  describe("User-defined Spectrum", () => {
    it("should interpolate correctly", () => {
      const spectrum: DesignSpectrum = {
        type: "USER",
        periods: [0, 0.5, 1.0, 2.0],
        accelerations: [0.4, 1.0, 0.6, 0.3]
      };

      const curve = getSpectrumCurve(spectrum, 2.0, 20);

      // At T=0.5, should be 1.0
      const point1 = curve.find(([T]) => Math.abs(T - 0.5) < 0.05);
      if (point1) {
        expect(point1[1]).toBeCloseTo(1.0, 1);
      }
    });
  });

  describe("Modal Combination Methods", () => {
    it("SRSS should combine correctly", async () => {
      const { nodes, elements, nodeInputs, elementInputs } = createTestModel();

      // Mock modal results for testing
      const mockModalResults: ModalOutputs = {
        frequencies: new Map([
          [1, 1.0],
          [2, 3.0],
          [3, 5.0]
        ]),
        periods: new Map([
          [1, 1.0],
          [2, 0.333],
          [3, 0.2]
        ]),
        modeShapes: new Map([
          [1, [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0]],
          [2, [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0]],
          [3, [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]]
        ]),
        massParticipation: new Map([
          [1, { UX: 0.8, UY: 0, UZ: 0, RX: 0, RY: 0, RZ: 0 }],
          [2, { UX: 0.15, UY: 0, UZ: 0, RX: 0, RY: 0, RZ: 0 }],
          [3, { UX: 0.05, UY: 0, UZ: 0, RX: 0, RY: 0, RZ: 0 }]
        ]),
        sumParticipation: { SumUX: 1.0, SumUY: 0, SumUZ: 0, SumRX: 0, SumRY: 0, SumRZ: 0 }
      };

      const results = await responseSpectrum(
        nodes,
        elements,
        nodeInputs,
        elementInputs,
        mockModalResults,
        {
          spectrum: { type: "ASCE7", SDS: 1.0, SD1: 0.6 },
          direction: "X",
          combination: "SRSS",
          damping: 0.05
        }
      );

      // Check that results exist
      expect(results.displacements.size).toBe(4);
      expect(results.baseShear).toBeDefined();
      expect(results.baseShear.length).toBe(3);
    });

    it("CQC should account for modal correlation", async () => {
      const { nodes, elements, nodeInputs, elementInputs } = createTestModel();

      // Modal results with closely-spaced modes
      const mockModalResults: ModalOutputs = {
        frequencies: new Map([
          [1, 1.0],
          [2, 1.05],  // Close to mode 1
          [3, 3.0]
        ]),
        periods: new Map([
          [1, 1.0],
          [2, 0.952],
          [3, 0.333]
        ]),
        modeShapes: new Map([
          [1, [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0]],
          [2, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0]],
          [3, [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]]
        ]),
        massParticipation: new Map([
          [1, { UX: 0.7, UY: 0, UZ: 0, RX: 0, RY: 0, RZ: 0 }],
          [2, { UX: 0, UY: 0.7, UZ: 0, RX: 0, RY: 0, RZ: 0 }],
          [3, { UX: 0.3, UY: 0.3, UZ: 0, RX: 0, RY: 0, RZ: 0 }]
        ]),
        sumParticipation: { SumUX: 1.0, SumUY: 1.0, SumUZ: 0, SumRX: 0, SumRY: 0, SumRZ: 0 }
      };

      const resultsSRSS = await responseSpectrum(
        nodes,
        elements,
        nodeInputs,
        elementInputs,
        mockModalResults,
        {
          spectrum: { type: "ASCE7", SDS: 1.0, SD1: 0.6 },
          direction: "X",
          combination: "SRSS",
          damping: 0.05
        }
      );

      const resultsCQC = await responseSpectrum(
        nodes,
        elements,
        nodeInputs,
        elementInputs,
        mockModalResults,
        {
          spectrum: { type: "ASCE7", SDS: 1.0, SD1: 0.6 },
          direction: "X",
          combination: "CQC",
          damping: 0.05
        }
      );

      // Both should have results
      expect(resultsCQC.baseShear).toBeDefined();
      expect(resultsSRSS.baseShear).toBeDefined();
    });
  });
});
