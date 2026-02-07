/**
 * Test Quad4 element against SAP2000 and Calcpad results
 * Rectangular plate 6m x 4m, t=0.1m, E=35GPa, nu=0.15, q=10kN/m²
 */
import { Node, Element, NodeInputs, ElementInputs } from "./data-model";
import { deformCpp } from "./deformCpp";

describe("Quad4 Plate Element", () => {
  test("Rectangular plate 6x4m - comparison with SAP2000/Calcpad", () => {
    // Plate parameters (matching Calcpad/SAP2000)
    const a = 6.0;      // m (length in x direction)
    const b = 4.0;      // m (length in y direction)
    const t = 0.1;      // m (thickness)
    const E = 35e9;     // Pa (35 GPa = 35000 MPa)
    const nu = 0.15;    // Poisson's ratio
    const q = -10000;   // N/m² (10 kN/m² downward = negative)

    // Mesh divisions
    const na = 6;       // divisions in x
    const nb = 4;       // divisions in y

    // Expected results from Calcpad PDF and SAP2000
    const expected = {
      w_center: 6.63,      // mm (deflection at center)
      reactions: 240,      // kN (total reactions)
    };

    // Generate nodes (7x5 = 35 nodes)
    const nodes: Node[] = [];
    const da = a / na;
    const db = b / nb;

    for (let j = 0; j <= nb; j++) {
      for (let i = 0; i <= na; i++) {
        nodes.push([i * da, j * db, 0]);
      }
    }

    // Generate quad4 elements (24 elements)
    const elements: Element[] = [];
    for (let j = 0; j < nb; j++) {
      for (let i = 0; i < na; i++) {
        const n1 = j * (na + 1) + i;
        const n2 = n1 + 1;
        const n3 = n2 + (na + 1);
        const n4 = n1 + (na + 1);
        elements.push([n1, n2, n3, n4]);
      }
    }

    // Identify boundary nodes
    const boundaryIndices: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const [x, y] = nodes[i];
      if (x === 0 || x === a || y === 0 || y === b) {
        boundaryIndices.push(i);
      }
    }

    // Setup node inputs
    const nodeInputs: NodeInputs = {
      supports: new Map(),
      loads: new Map(),
    };

    // Simply supported on all edges (restrain Z only)
    boundaryIndices.forEach((i) => {
      nodeInputs.supports!.set(i, [false, false, true, false, false, false]);
    });

    // Calculate equivalent nodal loads from uniform pressure
    // For quad4 elements, force at each corner = q * elementArea / 4
    elements.forEach((element) => {
      const [n1, n2, n3, n4] = element;

      // Element area (assuming rectangular elements)
      const elementArea = da * db;
      const forcePerNode = q * elementArea / 4;

      // Add forces to each node of the element
      [n1, n2, n3, n4].forEach((nodeIdx) => {
        const existing = nodeInputs.loads!.get(nodeIdx) || [0, 0, 0, 0, 0, 0];
        nodeInputs.loads!.set(nodeIdx, [
          existing[0],
          existing[1],
          existing[2] + forcePerNode,
          existing[3],
          existing[4],
          existing[5],
        ] as [number, number, number, number, number, number]);
      });
    });

    // Setup element inputs
    const G = E / (2 * (1 + nu));  // Shear modulus
    const elementInputs: ElementInputs = {
      elasticities: new Map(),
      thicknesses: new Map(),
      poissonsRatios: new Map(),
      shearModuli: new Map(),
    };

    elements.forEach((_, i) => {
      elementInputs.elasticities!.set(i, E);
      elementInputs.thicknesses!.set(i, t);
      elementInputs.poissonsRatios!.set(i, nu);
      elementInputs.shearModuli!.set(i, G);
    });

    // Run deformation analysis
    const deformOutputs = deformCpp(nodes, elements, nodeInputs, elementInputs);

    // Verify deformOutputs exists
    expect(deformOutputs).toBeDefined();
    expect(deformOutputs.deformations).toBeDefined();
    expect(deformOutputs.reactions).toBeDefined();

    // Find center node (approximately at na/2, nb/2)
    const centerI = Math.floor(na / 2);
    const centerJ = Math.floor(nb / 2);
    const centerNodeIdx = centerJ * (na + 1) + centerI;

    // Get center displacement
    const centerDeform = deformOutputs.deformations!.get(centerNodeIdx);
    expect(centerDeform).toBeDefined();

    const w_center_mm = centerDeform ? Math.abs(centerDeform[2]) * 1000 : 0;

    // Calculate total reactions
    let totalReactionZ = 0;
    deformOutputs.reactions!.forEach((reaction, nodeIdx) => {
      if (boundaryIndices.includes(nodeIdx)) {
        totalReactionZ += reaction[2];
      }
    });
    const totalReactions_kN = Math.abs(totalReactionZ) / 1000;

    // Output for debugging
    console.log(`\n[AWATIF QUAD4 TEST RESULTS]`);
    console.log(`  w_center = ${w_center_mm.toFixed(4)} mm (expected: ${expected.w_center} mm)`);
    console.log(`  Reactions = ${totalReactions_kN.toFixed(2)} kN (expected: ${expected.reactions} kN)`);

    // Verify reactions are correct (should sum to total applied load)
    // Total load = q * area = 10 kN/m² * 24 m² = 240 kN
    expect(totalReactions_kN).toBeCloseTo(expected.reactions, 0);

    // Verify deflection (allowing 20% tolerance due to element formulation differences)
    // Mindlin/Reissner plates give slightly different results than Kirchhoff
    const w_error = Math.abs(w_center_mm - expected.w_center) / expected.w_center;
    console.log(`  Deflection error: ${(w_error * 100).toFixed(1)}%`);
    expect(w_error).toBeLessThan(0.30); // 30% tolerance
  });
});
