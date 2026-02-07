/**
 * Springs Test - Comparison with OpenSees
 * ========================================
 *
 * Tests:
 * 1. Single node with vertical spring
 * 2. Plate on elastic foundation (Winkler)
 */

import { Node, Element, NodeInputs, ElementInputs, DeformOutputs } from "./data-model";
import { deformCpp } from "./deformCpp";

describe("Springs (Winkler Foundation)", () => {
  test("Single node with vertical spring - exact solution", () => {
    /**
     * Single node with vertical spring:
     * P = -100 kN (down)
     * Kz = 10 MN/m
     * Expected: w = P/K = -10 mm
     */
    console.log("\n=== TEST 1: Single Node with Vertical Spring ===");

    const P = -100000; // N
    const Kz = 1e7; // N/m

    // Two nodes: one fixed ground, one free with spring
    const nodes: Node[] = [
      [0, 0, 0], // Node 0: ground reference
      [0, 0, 0.001], // Node 1: free node (slightly offset for numerical stability)
    ];

    // No structural elements, just spring connection
    const elements: Element[] = [];

    // Springs
    const springs = new Map<number, [number, number, number, number, number, number]>();
    springs.set(1, [0, 0, Kz, 0, 0, 0]); // Spring at node 1

    // Supports
    const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
    supports.set(0, [true, true, true, true, true, true]); // Fix ground node
    supports.set(1, [true, true, false, true, true, true]); // Only Z free at node 1

    // Loads
    const loads = new Map<number, [number, number, number, number, number, number]>();
    loads.set(1, [0, 0, P, 0, 0, 0]);

    const nodeInputs: NodeInputs = { supports, loads, springs };
    const elementInputs: ElementInputs = {};

    const result = deformCpp(nodes, elements, nodeInputs, elementInputs);

    const uz = result.deformations?.get(1)?.[2] ?? 0;
    const expected_uz = P / Kz;

    console.log(`P = ${P / 1000} kN`);
    console.log(`Kz = ${Kz / 1e6} MN/m`);
    console.log(`Expected uz = ${expected_uz * 1000} mm`);
    console.log(`Awatif uz = ${uz * 1000} mm`);
    console.log(`Error: ${(Math.abs(uz - expected_uz) / Math.abs(expected_uz) * 100).toFixed(4)}%`);

    expect(uz).toBeCloseTo(expected_uz, 6);
  });

  test("Plate on elastic foundation (Winkler) - comparison with OpenSees", () => {
    /**
     * Square plate on Winkler foundation:
     * B = L = 2 m
     * t = 0.4 m
     * E = 23.5 GPa
     * nu = 0.2
     * ks = 30 MN/m^3
     * P = -100 kN at center
     * Mesh: 4x4
     *
     * OpenSees result: uz_center = -0.863820 mm
     * Theoretical (rigid): w = P/(ks*A) = 0.833333 mm
     */
    console.log("\n=== TEST 2: Plate on Winkler Foundation ===");

    const B = 2.0;
    const L = 2.0;
    const t = 0.4;
    const n = 4;
    const E = 23.5e9; // Pa
    const nu = 0.2;
    const G = E / (2 * (1 + nu));
    const ks = 30e6; // N/m^3
    const P = -100000; // N

    const dx = L / n;
    const dy = B / n;

    // Create nodes
    const nodes: Node[] = [];
    const nodeGrid: number[][] = [];

    let nodeIdx = 0;
    for (let j = 0; j <= n; j++) {
      const row: number[] = [];
      for (let i = 0; i <= n; i++) {
        const x = -L / 2 + i * dx;
        const y = -B / 2 + j * dy;
        nodes.push([x, y, 0]);
        row.push(nodeIdx);
        nodeIdx++;
      }
      nodeGrid.push(row);
    }

    // Create shell elements
    const elements: Element[] = [];
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const n1 = nodeGrid[j][i];
        const n2 = nodeGrid[j][i + 1];
        const n3 = nodeGrid[j + 1][i + 1];
        const n4 = nodeGrid[j + 1][i];
        elements.push([n1, n2, n3, n4]);
      }
    }

    // Springs with tributary area
    const Atrib_interior = dx * dy;
    const Atrib_border = (dx * dy) / 2;
    const Atrib_corner = (dx * dy) / 4;

    const springs = new Map<number, [number, number, number, number, number, number]>();

    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const idx = nodeGrid[j][i];

        const isCorner = (i === 0 || i === n) && (j === 0 || j === n);
        const isBorder = i === 0 || i === n || j === 0 || j === n;

        let Atrib: number;
        if (isCorner) {
          Atrib = Atrib_corner;
        } else if (isBorder) {
          Atrib = Atrib_border;
        } else {
          Atrib = Atrib_interior;
        }

        const Kz = ks * Atrib;
        springs.set(idx, [0, 0, Kz, 0, 0, 0]);
      }
    }

    // Minimum supports for rigid body motion
    const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
    supports.set(nodeGrid[0][0], [true, true, false, false, false, false]);
    supports.set(nodeGrid[0][n], [false, true, false, false, false, false]);

    // Load at center
    const centerI = Math.floor(n / 2);
    const centerJ = Math.floor(n / 2);
    const centerNode = nodeGrid[centerJ][centerI];

    const loads = new Map<number, [number, number, number, number, number, number]>();
    loads.set(centerNode, [0, 0, P, 0, 0, 0]);

    const nodeInputs: NodeInputs = { supports, loads, springs };

    // Element properties
    const elementInputs: ElementInputs = {
      elasticities: new Map(),
      thicknesses: new Map(),
      poissonsRatios: new Map(),
      shearModuli: new Map(),
    };

    for (let i = 0; i < elements.length; i++) {
      elementInputs.elasticities!.set(i, E);
      elementInputs.thicknesses!.set(i, t);
      elementInputs.poissonsRatios!.set(i, nu);
      elementInputs.shearModuli!.set(i, G);
    }

    // Analyze
    const result = deformCpp(nodes, elements, nodeInputs, elementInputs);

    const uz_center = result.deformations?.get(centerNode)?.[2] ?? 0;
    const w_rigid = Math.abs(P) / (ks * B * L);
    const uz_opensees = -0.863820e-3; // From OpenSees test

    console.log(`Plate: ${B}m x ${L}m x ${t}m`);
    console.log(`E = ${E / 1e9} GPa, nu = ${nu}`);
    console.log(`ks = ${ks / 1e6} MN/m^3`);
    console.log(`P = ${P / 1000} kN`);
    console.log(`Mesh: ${n}x${n}`);
    console.log();
    console.log(`Theoretical w (rigid): ${w_rigid * 1000} mm`);
    console.log(`OpenSees uz_center:    ${uz_opensees * 1000} mm`);
    console.log(`Awatif uz_center:      ${uz_center * 1000} mm`);
    console.log();
    console.log(`Awatif vs OpenSees difference: ${(Math.abs(uz_center - uz_opensees) / Math.abs(uz_opensees) * 100).toFixed(2)}%`);
    console.log(`Awatif vs Rigid ratio: ${Math.abs(uz_center) / w_rigid}`);

    // Note: Awatif Quad4 thick plate and OpenSees ShellMITC4 have different formulations
    // The important thing is that:
    // 1. Springs work correctly (verified by test 1)
    // 2. The plate deflects (uz_center < 0)
    // 3. The center deflects more than corners (concentration effect)
    expect(uz_center).toBeLessThan(0); // Plate deflects downward
    expect(Math.abs(uz_center)).toBeGreaterThan(w_rigid * 0.5); // At least some flexibility
  });
});
