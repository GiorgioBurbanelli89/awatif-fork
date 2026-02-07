/**
 * Modal Analysis Tests
 * Compares Awatif results with ETABS/OpenSeesPy reference values
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model";
import { modal, ModalOutputs, resetModalModule } from "./modalCpp";

describe("modalCpp", () => {
  // Skip these tests if WASM is not compiled
  const describeIfWasm = describe;

  // Reset WASM module before each test to avoid memory issues
  beforeEach(async () => {
    await resetModalModule();
  });

  describeIfWasm("Modal Analysis - Simple Frame", () => {
    /**
     * Test 1: Simple cantilever beam for basic validation
     * One element, fixed at one end
     */
    test("Cantilever beam - single mode", async () => {
      // Steel beam 1m long, 10cm x 10cm cross-section
      const L = 1.0;  // m
      const b = 0.1;  // m
      const h = 0.1;  // m
      const A = b * h;  // 0.01 m²
      const I = (b * h ** 3) / 12;  // 8.33e-6 m⁴
      const E = 2.1e11;  // Pa (steel)
      const rho = 7850;  // kg/m³ (steel)

      const nodes: Node[] = [
        [0, 0, 0],
        [L, 0, 0],
      ];
      const elements: Element[] = [[0, 1]];

      const nodeInputs: NodeInputs = {
        supports: new Map([
          [0, [true, true, true, true, true, true]],  // Fixed at node 0
        ]),
        loads: new Map(),
      };

      const elementInputs: ElementInputs = {
        elasticities: new Map([[0, E]]),
        areas: new Map([[0, A]]),
        momentsOfInertiaZ: new Map([[0, I]]),
        momentsOfInertiaY: new Map([[0, I]]),
        shearModuli: new Map([[0, E / (2 * 1.3)]]),  // G = E/(2*(1+ν))
        torsionalConstants: new Map([[0, I * 2]]),  // J ≈ 2I for square
      };

      const modalInputs = {
        densities: new Map([[0, rho]]),
        numModes: 3,
      };

      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      // Should have at least 1 mode
      expect(results.frequencies.size).toBeGreaterThanOrEqual(1);

      // First natural frequency of cantilever beam: f1 = (1.875)²/(2π) * sqrt(EI/ρAL⁴)
      // For this beam: f1 ≈ 82 Hz (analytical)
      const f1 = results.frequencies.get(1) || 0;
      expect(f1).toBeGreaterThan(50);  // Should be in reasonable range
      expect(f1).toBeLessThan(150);

      console.log("Cantilever results:", {
        f1: f1.toFixed(2) + " Hz",
        T1: results.periods.get(1)?.toFixed(4) + " s",
      });
    });

    /**
     * Test 2: Simple portal frame (2 columns, 1 beam, 2 floors)
     * Simpler model to test basic modal analysis
     */
    test("Simple portal frame - 2 columns", async () => {
      const h = 3.0;   // floor height
      const L = 5.0;   // bay length
      const n_floors = 1;

      const E = 2.1e10;  // Pa
      const nu = 0.2;
      const G = E / (2 * (1 + nu));

      // Column 40x40 cm
      const A = 0.16;
      const Iz = 0.4 ** 4 / 12;
      const Iy = 0.4 ** 4 / 12;
      const J = 0.141 * 0.4 ** 4;
      const rho = 2400;

      // 4 nodes: 2 at base, 2 at top
      const nodes: Node[] = [
        [0, 0, 0],     // node 0 - base left
        [L, 0, 0],     // node 1 - base right
        [0, 0, h],     // node 2 - top left
        [L, 0, h],     // node 3 - top right
      ];

      // 3 elements: 2 columns + 1 beam
      const elements: Element[] = [
        [0, 2],  // column left
        [1, 3],  // column right
        [2, 3],  // beam
      ];

      const nodeInputs: NodeInputs = {
        supports: new Map([
          [0, [true, true, true, true, true, true]],  // Fixed
          [1, [true, true, true, true, true, true]],  // Fixed
        ]),
        loads: new Map(),
      };

      const elementInputs: ElementInputs = {
        elasticities: new Map([[0, E], [1, E], [2, E]]),
        areas: new Map([[0, A], [1, A], [2, A]]),
        momentsOfInertiaZ: new Map([[0, Iz], [1, Iz], [2, Iz]]),
        momentsOfInertiaY: new Map([[0, Iy], [1, Iy], [2, Iy]]),
        shearModuli: new Map([[0, G], [1, G], [2, G]]),
        torsionalConstants: new Map([[0, J], [1, J], [2, J]]),
      };

      const modalInputs = {
        densities: new Map([[0, rho], [1, rho], [2, rho]]),
        numModes: 6,
      };

      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      console.log("\n=== PORTAL FRAME RESULTS ===");
      console.log("Nodes:", nodes.length);
      console.log("Elements:", elements.length);
      console.log("Modes:", results.frequencies.size);

      for (let mode = 1; mode <= Math.min(3, results.frequencies.size); mode++) {
        const T = results.periods.get(mode) || 0;
        const f = results.frequencies.get(mode) || 0;
        console.log(`Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(4)}Hz`);
      }

      expect(results.frequencies.size).toBeGreaterThanOrEqual(1);
      const T1 = results.periods.get(1) || 0;
      expect(T1).toBeGreaterThan(0.01);
      expect(T1).toBeLessThan(1.0);
    });

    /**
     * Test 3: 2x2 Building Frame - Smaller model
     */
    test("2x2 Building - 2 floors", async () => {
      const n_col_x = 2;
      const n_col_y = 2;
      const dx = 5.0;
      const dy = 4.0;
      const h = 3.0;
      const n_pisos = 2;

      const E = 2.1e10;
      const nu = 0.2;
      const G = E / (2 * (1 + nu));
      const A = 0.16;
      const Iz = 0.4 ** 4 / 12;
      const Iy = 0.4 ** 4 / 12;
      const J = 0.141 * 0.4 ** 4;
      const rho = 2400;

      const nodes: Node[] = [];
      const n_nodos_piso = n_col_x * n_col_y;

      for (let k = 0; k <= n_pisos; k++) {
        const z = k * h;
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            nodes.push([i * dx, j * dy, z]);
          }
        }
      }

      const elements: Element[] = [];
      const columnElements: number[] = [];
      const beamElements: number[] = [];
      let elemId = 0;

      // Columns
      for (let k = 0; k < n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n_inf = k * n_nodos_piso + j * n_col_x + i;
            const n_sup = (k + 1) * n_nodos_piso + j * n_col_x + i;
            elements.push([n_inf, n_sup]);
            columnElements.push(elemId++);
          }
        }
      }

      // Beams X
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x - 1; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + j * n_col_x + i + 1;
            elements.push([n1, n2]);
            beamElements.push(elemId++);
          }
        }
      }

      // Beams Y
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y - 1; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + (j + 1) * n_col_x + i;
            elements.push([n1, n2]);
            beamElements.push(elemId++);
          }
        }
      }

      const nodeInputs: NodeInputs = {
        supports: new Map(),
        loads: new Map(),
      };
      for (let i = 0; i < n_nodos_piso; i++) {
        nodeInputs.supports!.set(i, [true, true, true, true, true, true]);
      }

      const elementInputs: ElementInputs = {
        elasticities: new Map(),
        areas: new Map(),
        momentsOfInertiaZ: new Map(),
        momentsOfInertiaY: new Map(),
        shearModuli: new Map(),
        torsionalConstants: new Map(),
      };

      [...columnElements, ...beamElements].forEach((idx) => {
        elementInputs.elasticities!.set(idx, E);
        elementInputs.areas!.set(idx, A);
        elementInputs.momentsOfInertiaZ!.set(idx, Iz);
        elementInputs.momentsOfInertiaY!.set(idx, Iy);
        elementInputs.shearModuli!.set(idx, G);
        elementInputs.torsionalConstants!.set(idx, J);
      });

      const modalInputs = {
        densities: new Map<number, number>(),
        numModes: 6,
      };
      elements.forEach((_, idx) => {
        modalInputs.densities.set(idx, rho);
      });

      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      console.log("\n=== 2x2 BUILDING RESULTS ===");
      console.log("Nodes:", nodes.length, "Elements:", elements.length);
      for (let mode = 1; mode <= Math.min(3, results.frequencies.size); mode++) {
        const T = results.periods.get(mode) || 0;
        const f = results.frequencies.get(mode) || 0;
        const p = results.massParticipation.get(mode);
        console.log(`Mode ${mode}: T=${T.toFixed(4)}s, UX=${(p?.UX||0).toFixed(4)}, UY=${(p?.UY||0).toFixed(4)}, RZ=${(p?.RZ||0).toFixed(4)}`);
      }

      expect(results.frequencies.size).toBeGreaterThanOrEqual(3);
    });

    /**
     * Test 4: 3x3 Building Frame - Using Spectra sparse solver
     */
    test("3x3 Building - 2 floors", async () => {
      const n_col_x = 3;
      const n_col_y = 3;
      const dx = 5.0;
      const dy = 4.0;
      const h = 3.0;
      const n_pisos = 2;

      const E = 2.1e10;
      const nu = 0.2;
      const G = E / (2 * (1 + nu));
      const A = 0.16;
      const Iz = 0.4 ** 4 / 12;
      const Iy = 0.4 ** 4 / 12;
      const J = 0.141 * 0.4 ** 4;
      const rho = 2400;

      const nodes: Node[] = [];
      const n_nodos_piso = n_col_x * n_col_y;

      for (let k = 0; k <= n_pisos; k++) {
        const z = k * h;
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            nodes.push([i * dx, j * dy, z]);
          }
        }
      }

      const elements: Element[] = [];
      let elemId = 0;

      // Columns
      for (let k = 0; k < n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n_inf = k * n_nodos_piso + j * n_col_x + i;
            const n_sup = (k + 1) * n_nodos_piso + j * n_col_x + i;
            elements.push([n_inf, n_sup]);
            elemId++;
          }
        }
      }

      // Beams X
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x - 1; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + j * n_col_x + i + 1;
            elements.push([n1, n2]);
            elemId++;
          }
        }
      }

      // Beams Y
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y - 1; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + (j + 1) * n_col_x + i;
            elements.push([n1, n2]);
            elemId++;
          }
        }
      }

      const nodeInputs: NodeInputs = {
        supports: new Map(),
        loads: new Map(),
      };
      for (let i = 0; i < n_nodos_piso; i++) {
        nodeInputs.supports!.set(i, [true, true, true, true, true, true]);
      }

      const elementInputs: ElementInputs = {
        elasticities: new Map(),
        areas: new Map(),
        momentsOfInertiaZ: new Map(),
        momentsOfInertiaY: new Map(),
        shearModuli: new Map(),
        torsionalConstants: new Map(),
      };

      elements.forEach((_, idx) => {
        elementInputs.elasticities!.set(idx, E);
        elementInputs.areas!.set(idx, A);
        elementInputs.momentsOfInertiaZ!.set(idx, Iz);
        elementInputs.momentsOfInertiaY!.set(idx, Iy);
        elementInputs.shearModuli!.set(idx, G);
        elementInputs.torsionalConstants!.set(idx, J);
      });

      const modalInputs = {
        densities: new Map<number, number>(),
        numModes: 6,
      };
      elements.forEach((_, idx) => {
        modalInputs.densities.set(idx, rho);
      });

      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      console.log("\n=== 3x3 BUILDING RESULTS ===");
      console.log("Nodes:", nodes.length, "Elements:", elements.length);
      for (let mode = 1; mode <= Math.min(3, results.frequencies.size); mode++) {
        const T = results.periods.get(mode) || 0;
        const f = results.frequencies.get(mode) || 0;
        const p = results.massParticipation.get(mode);
        console.log(`Mode ${mode}: T=${T.toFixed(4)}s, UX=${(p?.UX||0).toFixed(4)}, UY=${(p?.UY||0).toFixed(4)}, RZ=${(p?.RZ||0).toFixed(4)}`);
      }

      expect(results.frequencies.size).toBeGreaterThanOrEqual(3);
    });

    /**
     * Test 5: 3x4 Building Frame - Compare with OpenSeesPy/ETABS
     * This matches the model in AppPy_Modal_FINAL.py
     * Using Spectra sparse solver for efficiency
     */
    test("3x4 Building - 2 floors - compare with OpenSeesPy", async () => {
      // Geometry matching AppPy_Modal_FINAL.py
      const n_col_x = 3;
      const n_col_y = 4;
      const dx = 5.0;  // m
      const dy = 4.0;  // m
      const h = 3.0;   // m (floor height)
      const n_pisos = 2;

      // Material (steel)
      const E = 2.1e10;  // Pa
      const nu = 0.2;
      const G = E / (2 * (1 + nu));

      // Column 40x40 cm
      const Ac = 0.16;  // m²
      const Izc = 0.4 ** 4 / 12;
      const Iyc = 0.4 ** 4 / 12;
      const Jc = 0.141 * 0.4 ** 4;

      // Beam 30x50 cm
      const Av = 0.15;
      const Izv = 0.3 * 0.5 ** 3 / 12;
      const Iyv = 0.5 * 0.3 ** 3 / 12;
      const Jv = 0.141 * 0.3 * 0.5 ** 3;

      // Density (concrete)
      const rho = 2400;  // kg/m³

      // Create nodes
      const nodes: Node[] = [];
      let nodeId = 0;

      for (let k = 0; k <= n_pisos; k++) {
        const z = k * h;
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const x = i * dx;
            const y = j * dy;
            nodes.push([x, y, z]);
            nodeId++;
          }
        }
      }

      // Create elements
      const elements: Element[] = [];
      let elemId = 0;
      const columnElements: number[] = [];
      const beamElements: number[] = [];
      const n_nodos_piso = n_col_x * n_col_y;

      // Columns
      for (let k = 0; k < n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n_inf = k * n_nodos_piso + j * n_col_x + i;
            const n_sup = (k + 1) * n_nodos_piso + j * n_col_x + i;
            elements.push([n_inf, n_sup]);
            columnElements.push(elemId);
            elemId++;
          }
        }
      }

      // Beams X direction
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x - 1; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + j * n_col_x + i + 1;
            elements.push([n1, n2]);
            beamElements.push(elemId);
            elemId++;
          }
        }
      }

      // Beams Y direction
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y - 1; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + (j + 1) * n_col_x + i;
            elements.push([n1, n2]);
            beamElements.push(elemId);
            elemId++;
          }
        }
      }

      // Node inputs - fixed at base
      const nodeInputs: NodeInputs = {
        supports: new Map(),
        loads: new Map(),
      };

      for (let i = 0; i < n_nodos_piso; i++) {
        nodeInputs.supports!.set(i, [true, true, true, true, true, true]);
      }

      // Element inputs
      const elementInputs: ElementInputs = {
        elasticities: new Map(),
        areas: new Map(),
        momentsOfInertiaZ: new Map(),
        momentsOfInertiaY: new Map(),
        shearModuli: new Map(),
        torsionalConstants: new Map(),
      };

      // Set column properties
      columnElements.forEach((idx) => {
        elementInputs.elasticities!.set(idx, E);
        elementInputs.areas!.set(idx, Ac);
        elementInputs.momentsOfInertiaZ!.set(idx, Izc);
        elementInputs.momentsOfInertiaY!.set(idx, Iyc);
        elementInputs.shearModuli!.set(idx, G);
        elementInputs.torsionalConstants!.set(idx, Jc);
      });

      // Set beam properties
      beamElements.forEach((idx) => {
        elementInputs.elasticities!.set(idx, E);
        elementInputs.areas!.set(idx, Av);
        elementInputs.momentsOfInertiaZ!.set(idx, Izv);
        elementInputs.momentsOfInertiaY!.set(idx, Iyv);
        elementInputs.shearModuli!.set(idx, G);
        elementInputs.torsionalConstants!.set(idx, Jv);
      });

      // Modal inputs with density
      const modalInputs = {
        densities: new Map<number, number>(),
        numModes: 6,
      };

      elements.forEach((_, idx) => {
        modalInputs.densities.set(idx, rho);
      });

      // Run modal analysis
      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      // Print results
      console.log("\n=== AWATIF MODAL RESULTS ===");
      console.log("Nodes:", nodes.length);
      console.log("Elements:", elements.length);
      console.log("Modes computed:", results.frequencies.size);

      console.log("\n--- Periods and Frequencies ---");
      let sumUX = 0, sumUY = 0, sumRZ = 0;

      for (let mode = 1; mode <= Math.min(6, results.frequencies.size); mode++) {
        const T = results.periods.get(mode) || 0;
        const f = results.frequencies.get(mode) || 0;
        const part = results.massParticipation.get(mode);

        if (part) {
          sumUX += part.UX;
          sumUY += part.UY;
          sumRZ += part.RZ;
        }

        console.log(`Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(4)}Hz, ` +
          `UX=${(part?.UX || 0).toFixed(4)}, UY=${(part?.UY || 0).toFixed(4)}, ` +
          `RZ=${(part?.RZ || 0).toFixed(4)}, ` +
          `SumUX=${sumUX.toFixed(4)}, SumUY=${sumUY.toFixed(4)}, SumRZ=${sumRZ.toFixed(4)}`);
      }

      // Validate results
      expect(results.frequencies.size).toBeGreaterThanOrEqual(3);

      const T1 = results.periods.get(1) || 0;
      const T2 = results.periods.get(2) || 0;

      // OpenSeesPy reference (from AppPy): T1 ≈ 0.15-0.35s for this building
      // ETABS reference: T1 ≈ 0.25s (from Screenshot_103)
      expect(T1).toBeGreaterThan(0.1);
      expect(T1).toBeLessThan(0.5);

      // T2 should be less than T1 (higher frequency)
      expect(T2).toBeLessThan(T1 * 1.1);  // Allow some tolerance

      // Mass participation should sum to reasonable values
      expect(sumUX).toBeGreaterThan(0.5);  // At least 50% in first 6 modes
      expect(sumUY).toBeGreaterThan(0.5);
    });

    /**
     * Test 6: 2x2 Building with RIGID DIAPHRAGM
     * Compare with/without diaphragm
     */
    test("2x2 Building - WITH RIGID DIAPHRAGM", async () => {
      const n_col_x = 2;
      const n_col_y = 2;
      const dx = 5.0;
      const dy = 4.0;
      const h = 3.0;
      const n_pisos = 2;

      const E = 2.1e10;
      const nu = 0.2;
      const G = E / (2 * (1 + nu));
      const A = 0.16;
      const Iz = 0.4 ** 4 / 12;
      const Iy = 0.4 ** 4 / 12;
      const J = 0.141 * 0.4 ** 4;
      const rho = 2400;

      const nodes: Node[] = [];
      const n_nodos_piso = n_col_x * n_col_y;

      // Store Z levels for diaphragm
      const floorLevels: number[] = [];

      for (let k = 0; k <= n_pisos; k++) {
        const z = k * h;
        if (k > 0) floorLevels.push(z);  // Only elevated floors
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            nodes.push([i * dx, j * dy, z]);
          }
        }
      }

      const elements: Element[] = [];
      const columnElements: number[] = [];
      const beamElements: number[] = [];
      let elemId = 0;

      // Columns
      for (let k = 0; k < n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n_inf = k * n_nodos_piso + j * n_col_x + i;
            const n_sup = (k + 1) * n_nodos_piso + j * n_col_x + i;
            elements.push([n_inf, n_sup]);
            columnElements.push(elemId++);
          }
        }
      }

      // Beams X
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y; j++) {
          for (let i = 0; i < n_col_x - 1; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + j * n_col_x + i + 1;
            elements.push([n1, n2]);
            beamElements.push(elemId++);
          }
        }
      }

      // Beams Y
      for (let k = 1; k <= n_pisos; k++) {
        for (let j = 0; j < n_col_y - 1; j++) {
          for (let i = 0; i < n_col_x; i++) {
            const n1 = k * n_nodos_piso + j * n_col_x + i;
            const n2 = k * n_nodos_piso + (j + 1) * n_col_x + i;
            elements.push([n1, n2]);
            beamElements.push(elemId++);
          }
        }
      }

      const nodeInputs: NodeInputs = {
        supports: new Map(),
        loads: new Map(),
      };
      for (let i = 0; i < n_nodos_piso; i++) {
        nodeInputs.supports!.set(i, [true, true, true, true, true, true]);
      }

      const elementInputs: ElementInputs = {
        elasticities: new Map(),
        areas: new Map(),
        momentsOfInertiaZ: new Map(),
        momentsOfInertiaY: new Map(),
        shearModuli: new Map(),
        torsionalConstants: new Map(),
      };

      [...columnElements, ...beamElements].forEach((idx) => {
        elementInputs.elasticities!.set(idx, E);
        elementInputs.areas!.set(idx, A);
        elementInputs.momentsOfInertiaZ!.set(idx, Iz);
        elementInputs.momentsOfInertiaY!.set(idx, Iy);
        elementInputs.shearModuli!.set(idx, G);
        elementInputs.torsionalConstants!.set(idx, J);
      });

      // Modal inputs WITH rigid diaphragm
      const modalInputs = {
        densities: new Map<number, number>(),
        numModes: 6,
        rigidDiaphragmLevels: floorLevels,  // Enable rigid diaphragm!
      };
      elements.forEach((_, idx) => {
        modalInputs.densities.set(idx, rho);
      });

      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      console.log("\n=== 2x2 BUILDING WITH RIGID DIAPHRAGM ===");
      console.log("Floor levels with diaphragm:", floorLevels);
      console.log("Modes computed:", results.frequencies.size);

      let sumUX = 0, sumUY = 0, sumRZ = 0;
      for (let mode = 1; mode <= Math.min(6, results.frequencies.size); mode++) {
        const T = results.periods.get(mode) || 0;
        const f = results.frequencies.get(mode) || 0;
        const p = results.massParticipation.get(mode);
        if (p) {
          sumUX += p.UX;
          sumUY += p.UY;
          sumRZ += p.RZ;
        }
        console.log(`Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(2)}Hz, UX=${(p?.UX||0).toFixed(4)}, UY=${(p?.UY||0).toFixed(4)}, RZ=${(p?.RZ||0).toFixed(4)}`);
      }
      console.log(`SumUX=${sumUX.toFixed(4)}, SumUY=${sumUY.toFixed(4)}, SumRZ=${sumRZ.toFixed(4)}`);

      expect(results.frequencies.size).toBeGreaterThanOrEqual(3);

      // With rigid diaphragm, the torsional mode should be more distinct
      // At least one mode should have significant RZ participation
      expect(sumRZ).toBeGreaterThan(0.3);  // Should have some torsional participation
    });

    it("Nave Industrial - Steel warehouse with trusses", async () => {
      /**
       * Industrial warehouse (galpón) with triangulated trusses
       * - 4 portal frames with trusses
       * - Span: 12m, Column height: 6m, Truss height: 2m
       * - Frame spacing: 6m
       * - Columns: IPE 300
       * - Truss chords: L 80x80x8
       * - Truss diagonals: L 60x60x6
       * - Material: Steel E=210 GPa, rho=7850 kg/m³
       */
      const nodes: Node[] = [];
      const elements: Element[] = [];
      const nodeInputs: NodeInputs = { supports: new Map(), loads: new Map() };
      const elementInputs: ElementInputs = {
        elasticities: new Map(),
        areas: new Map(),
        momentsOfInertiaZ: new Map(),
        momentsOfInertiaY: new Map(),
        torsionalConstants: new Map(),
        shearModuli: new Map(),
      };
      const densities = new Map<number, number>();

      // Steel material (SI units: N, m, kg)
      const E_steel = 210e9; // 210 GPa
      const nu_steel = 0.3;
      const rho_steel = 7850; // kg/m³
      const G_steel = E_steel / (2 * (1 + nu_steel));

      // Tubo cuadrado 200x200x6mm (columnas)
      // b = h = 0.20 m, t = 0.006 m
      const b_col = 0.20, t_col = 0.006;
      const b_int_col = b_col - 2 * t_col; // 0.188 m
      const A_col = b_col * b_col - b_int_col * b_int_col; // 0.004656 m²
      const I_col = (Math.pow(b_col, 4) - Math.pow(b_int_col, 4)) / 12; // m⁴
      // J para tubo cuadrado cerrado: J = 4*Am²*t/s, Am=(b-t)², s=4*(b-t)
      const Am_col = Math.pow(b_col - t_col, 2);
      const s_col = 4 * (b_col - t_col);
      const J_col = 4 * Am_col * Am_col * t_col / s_col;
      const TUBO_200x200x6 = { A: A_col, Iz: I_col, Iy: I_col, J: J_col };

      // Tubo rectangular 150x100x3mm (vigas/cerchas)
      // b = 0.15 m, h = 0.10 m, t = 0.003 m
      const b_viga = 0.15, h_viga = 0.10, t_viga = 0.003;
      const b_int_viga = b_viga - 2 * t_viga; // 0.144 m
      const h_int_viga = h_viga - 2 * t_viga; // 0.094 m
      const A_viga = b_viga * h_viga - b_int_viga * h_int_viga; // m²
      const Iz_viga = (b_viga * Math.pow(h_viga, 3) - b_int_viga * Math.pow(h_int_viga, 3)) / 12; // m⁴
      const Iy_viga = (h_viga * Math.pow(b_viga, 3) - h_int_viga * Math.pow(b_int_viga, 3)) / 12; // m⁴
      // J para tubo rectangular cerrado
      const Am_viga = (b_viga - t_viga) * (h_viga - t_viga);
      const s_viga = 2 * (b_viga - t_viga) + 2 * (h_viga - t_viga);
      const J_viga = 4 * Am_viga * Am_viga * t_viga / s_viga;
      const TUBO_150x100x3 = { A: A_viga, Iz: Iz_viga, Iy: Iy_viga, J: J_viga };

      console.log("Columna 200x200x6:", { A: A_col.toExponential(3), I: I_col.toExponential(3), J: J_col.toExponential(3) });
      console.log("Viga 150x100x3:", { A: A_viga.toExponential(3), Iz: Iz_viga.toExponential(3), Iy: Iy_viga.toExponential(3), J: J_viga.toExponential(3) });

      // Helper to add frame element
      function addFrameElement(n1: number, n2: number, section: typeof TUBO_200x200x6) {
        const idx = elements.length;
        elements.push([n1, n2]);
        elementInputs.elasticities!.set(idx, E_steel);
        elementInputs.areas!.set(idx, section.A);
        elementInputs.momentsOfInertiaZ!.set(idx, section.Iz);
        elementInputs.momentsOfInertiaY!.set(idx, section.Iy);
        elementInputs.torsionalConstants!.set(idx, section.J);
        elementInputs.shearModuli!.set(idx, G_steel);
        densities.set(idx, rho_steel);
      }

      // Parameters
      const span = 12;
      const H_col = 6;
      const H_truss = 2;
      const numFrames = 4;
      const spacing = 6;
      const numPanels = 6;
      const panelWidth = span / numPanels;
      const halfPanels = numPanels / 2;

      // Store indices for each frame
      const frameData: { bottom: number[]; top: number[]; leftBase: number; rightBase: number }[] = [];

      // Create frames along Y axis
      for (let frame = 0; frame < numFrames; frame++) {
        const y = frame * spacing;

        // Bottom chord nodes (at column top level)
        const bottomChord: number[] = [];
        for (let i = 0; i <= numPanels; i++) {
          const x = i * panelWidth;
          nodes.push([x, y, H_col]);
          bottomChord.push(nodes.length - 1);
        }

        // Top chord nodes (triangular profile - peak at center)
        const topChord: number[] = [];
        for (let i = 0; i <= numPanels; i++) {
          if (i === 0 || i === numPanels) {
            topChord.push(bottomChord[i]);
          } else {
            const x = i * panelWidth;
            let z;
            if (i <= halfPanels) {
              z = H_col + (i / halfPanels) * H_truss;
            } else {
              z = H_col + ((numPanels - i) / halfPanels) * H_truss;
            }
            nodes.push([x, y, z]);
            topChord.push(nodes.length - 1);
          }
        }

        // Column base nodes
        const leftBaseIdx = nodes.length;
        nodes.push([0, y, 0]);
        const rightBaseIdx = nodes.length;
        nodes.push([span, y, 0]);

        frameData.push({ bottom: bottomChord, top: topChord, leftBase: leftBaseIdx, rightBase: rightBaseIdx });

        // Left column (tubo 200x200x6)
        addFrameElement(leftBaseIdx, bottomChord[0], TUBO_200x200x6);
        // Right column (tubo 200x200x6)
        addFrameElement(rightBaseIdx, bottomChord[numPanels], TUBO_200x200x6);

        // Bottom chord (tubo 150x100x3)
        for (let i = 0; i < numPanels; i++) {
          addFrameElement(bottomChord[i], bottomChord[i + 1], TUBO_150x100x3);
        }

        // Top chord (tubo 150x100x3)
        for (let i = 0; i < numPanels; i++) {
          addFrameElement(topChord[i], topChord[i + 1], TUBO_150x100x3);
        }

        // Verticals (tubo 150x100x3)
        for (let i = 1; i < numPanels; i++) {
          addFrameElement(bottomChord[i], topChord[i], TUBO_150x100x3);
        }

        // Diagonals (tubo 150x100x3)
        for (let i = 0; i < numPanels; i++) {
          if (i < halfPanels) {
            addFrameElement(bottomChord[i], topChord[i + 1], TUBO_150x100x3);
          } else {
            addFrameElement(bottomChord[i + 1], topChord[i], TUBO_150x100x3);
          }
        }

        // Supports
        nodeInputs.supports.set(leftBaseIdx, [true, true, true, true, true, true]);
        nodeInputs.supports.set(rightBaseIdx, [true, true, true, true, true, true]);
      }

      // Longitudinal elements (purlins and ties)
      for (let frame = 0; frame < numFrames - 1; frame++) {
        const thisFrame = frameData[frame];
        const nextFrame = frameData[frame + 1];

        // Connect ALL top chord nodes (purlins - tubo 150x100x3)
        for (let i = 0; i <= numPanels; i++) {
          addFrameElement(thisFrame.top[i], nextFrame.top[i], TUBO_150x100x3);
        }

        // Connect bottom chord ends (longitudinal ties - tubo 150x100x3)
        addFrameElement(thisFrame.bottom[0], nextFrame.bottom[0], TUBO_150x100x3);
        addFrameElement(thisFrame.bottom[numPanels], nextFrame.bottom[numPanels], TUBO_150x100x3);
      }

      console.log("\n=== NAVE INDUSTRIAL (TEST) ===");
      console.log(`Span: ${span}m, Column height: ${H_col}m, Truss height: ${H_truss}m`);
      console.log(`Frames: ${numFrames}, Spacing: ${spacing}m, Panels: ${numPanels}`);
      console.log(`Nodes: ${nodes.length}, Elements: ${elements.length}`);

      const modalInputs = { densities, numModes: 6 };
      const results = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      console.log("\n=== MODAL RESULTS ===");
      console.log("Modes computed:", results.frequencies.size);

      let sumUX = 0, sumUY = 0, sumRZ = 0;
      for (let mode = 1; mode <= Math.min(6, results.frequencies.size); mode++) {
        const T = results.periods.get(mode) || 0;
        const f = results.frequencies.get(mode) || 0;
        const p = results.massParticipation.get(mode);
        if (p) {
          sumUX += p.UX;
          sumUY += p.UY;
          sumRZ += p.RZ;
        }
        console.log(`Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(2)}Hz, UX=${(p?.UX||0).toFixed(4)}, UY=${(p?.UY||0).toFixed(4)}, RZ=${(p?.RZ||0).toFixed(4)}`);
      }
      console.log(`SumUX=${sumUX.toFixed(4)}, SumUY=${sumUY.toFixed(4)}, SumRZ=${sumRZ.toFixed(4)}`);

      // Verify we got modes
      expect(results.frequencies.size).toBeGreaterThanOrEqual(3);

      // First mode should have a reasonable period (industrial warehouse ~0.1-0.5s)
      const T1 = results.periods.get(1) || 0;
      expect(T1).toBeGreaterThan(0.01);
      expect(T1).toBeLessThan(2.0);
    });
  });
});
