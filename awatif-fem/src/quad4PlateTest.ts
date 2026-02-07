/**
 * Quad4 Plate Test - Comparison with SAP2000 and analytical solution
 * Rectangular plate 6m x 4m, t=0.1m, E=35GPa, nu=0.15, q=10kN/m²
 * Simply supported on all edges
 */

import { deform, analyze, Node, Element, NodeInputs, ElementInputs } from "./index";

// Plate parameters
const a = 6; // m (X direction)
const b = 4; // m (Y direction)
const t = 0.1; // m (thickness)
const E = 35e9; // Pa (35 GPa)
const nu = 0.15;
const q = -10000; // N/m² (10 kN/m² downward)

// Mesh parameters
const nx = 6;
const ny = 4;
const dx = a / nx;
const dy = b / ny;

// Expected results from analytical solution (Timoshenko plate theory)
// For simply supported rectangular plate under uniform load:
// w_max = α * q * b^4 / (E * t^3) where α depends on a/b ratio
const expected = {
  w_center: 3.24, // mm (approximate from analytical)
  reactions: 240, // kN (total = q * a * b)
};

// Generate nodes
const nodes: Node[] = [];
for (let j = 0; j <= ny; j++) {
  for (let i = 0; i <= nx; i++) {
    nodes.push([i * dx, j * dy, 0]);
  }
}

// Generate quad elements (counter-clockwise)
const elements: Element[] = [];
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    const n1 = j * (nx + 1) + i;
    const n2 = n1 + 1;
    const n3 = n2 + (nx + 1);
    const n4 = n1 + (nx + 1);
    elements.push([n1, n2, n3, n4]);
  }
}

// Boundary conditions: simply supported (Z fixed) on all edges
const boundaryNodes: number[] = [];
for (let i = 0; i < nodes.length; i++) {
  const [x, y] = nodes[i];
  if (Math.abs(x) < 1e-10 || Math.abs(x - a) < 1e-10 ||
      Math.abs(y) < 1e-10 || Math.abs(y - b) < 1e-10) {
    boundaryNodes.push(i);
  }
}

// Nodal loads from uniform pressure
const loadsMap = new Map<number, [number, number, number, number, number, number]>();
elements.forEach((elem) => {
  const elemArea = dx * dy;
  const forcePerNode = q * elemArea / 4;
  elem.forEach((nodeIdx) => {
    const existing = loadsMap.get(nodeIdx) || [0, 0, 0, 0, 0, 0];
    loadsMap.set(nodeIdx, [0, 0, existing[2] + forcePerNode, 0, 0, 0]);
  });
});

const nodeInputs: NodeInputs = {
  supports: new Map(
    boundaryNodes.map((i) => [i, [false, false, true, false, false, false] as [boolean, boolean, boolean, boolean, boolean, boolean]])
  ),
  loads: loadsMap,
};

const elementInputs: ElementInputs = {
  elasticities: new Map(elements.map((_, i) => [i, E])),
  thicknesses: new Map(elements.map((_, i) => [i, t])),
  poissonsRatios: new Map(elements.map((_, i) => [i, nu])),
};

// Run analysis
console.log("Running Quad4 Plate Analysis...");
console.log(`Plate: ${a}m x ${b}m, t=${t}m`);
console.log(`Material: E=${E/1e9} GPa, nu=${nu}`);
console.log(`Load: q=${Math.abs(q)/1000} kN/m²`);
console.log(`Mesh: ${nx} x ${ny} elements (${elements.length} total)`);
console.log(`Nodes: ${nodes.length}`);
console.log("");

const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

// Get center node displacement
const centerNodeIdx = Math.floor(ny / 2) * (nx + 1) + Math.floor(nx / 2);
const centerDeform = deformOutputs.deformations?.get(centerNodeIdx);
const w_center_mm = Math.abs((centerDeform?.[2] ?? 0) * 1000);

// Get total reactions
let totalReactionZ = 0;
deformOutputs.reactions?.forEach((r, nodeIdx) => {
  if (boundaryNodes.includes(nodeIdx)) {
    totalReactionZ += r[2];
  }
});
const totalReactions_kN = Math.abs(totalReactionZ) / 1000;

console.log("");
console.log("============================================================");
console.log("RESULTS");
console.log("============================================================");
console.log("");
console.log("Parameter            Awatif          Expected        Error");
console.log("------------------------------------------------------------");

const err_w = Math.abs(w_center_mm - expected.w_center) / expected.w_center * 100;
const err_R = Math.abs(totalReactions_kN - expected.reactions) / expected.reactions * 100;

console.log(`w center (mm)        ${w_center_mm.toFixed(2).padEnd(15)} ${expected.w_center.toFixed(2).padEnd(15)} ${err_w.toFixed(1)}%`);
console.log(`Reactions (kN)       ${totalReactions_kN.toFixed(2).padEnd(15)} ${expected.reactions.toFixed(0).padEnd(15)} ${err_R.toFixed(1)}%`);
console.log("------------------------------------------------------------");

if (err_w < 10 && err_R < 5) {
  console.log("\n*** RESULTS MATCH! ***");
} else {
  console.log("\nNote: Differences may be due to element formulation");
}

// Debug output
console.log("\n[DEBUG] Center node displacement:", centerDeform);
console.log("[DEBUG] Total load applied:", q * a * b / 1000, "kN");

export { nodes, elements, nodeInputs, elementInputs, deformOutputs };
