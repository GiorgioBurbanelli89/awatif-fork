/**
 * Frames + Shells Comparison Script for SAP2000/ETABS
 * Uses consistent units: m, N, kg, s (SI)
 *
 * Equivalent in SAP2000/ETABS:
 * - Length: m
 * - Force: N
 * - Mass: kg
 * - Time: s
 */
import { deform, Node, Element, NodeInputs, ElementInputs } from "./index";

// ==============================================================================
// MODEL PARAMETERS
// ==============================================================================
const Lx = 6; // m
const Ly = 4; // m
const nx = 6; // divisions in X
const ny = 4; // divisions in Y
const H = 3; // column height, m
const t = 0.15; // slab thickness, m
const bBeam = 0.3; // beam width, m
const hBeam = 0.5; // beam height, m

// Material (Concrete)
const E = 30e9; // Pa (30 GPa)
const nu = 0.2;
const rho = 2500; // kg/m³

// Load
const q = -10000; // N/m² (10 kN/m² downward)

console.log("=".repeat(80));
console.log("FRAMES + SHELLS - COMPARISON WITH SAP2000/ETABS");
console.log("Units: m, N, kg, s (SI consistent)");
console.log("=".repeat(80));

// ==============================================================================
// GENERATE MESH (without awatif-mesh)
// ==============================================================================
const dx = Lx / nx;
const dy = Ly / ny;

// Slab nodes at z = H
const nodes: Node[] = [];
for (let j = 0; j <= ny; j++) {
  for (let i = 0; i <= nx; i++) {
    nodes.push([i * dx, j * dy, H]);
  }
}

const numSlabNodes = nodes.length;

// Quad elements for slab
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

const numSlabElements = elements.length;

// Column base nodes at z = 0
const cornerSlabIndices = [0, nx, ny * (nx + 1) + nx, ny * (nx + 1)];
const baseNodeIndices: number[] = [];

cornerSlabIndices.forEach((slabNodeIdx) => {
  const baseNodeIdx = nodes.length;
  nodes.push([nodes[slabNodeIdx][0], nodes[slabNodeIdx][1], 0]);
  baseNodeIndices.push(baseNodeIdx);

  // Column element
  elements.push([baseNodeIdx, slabNodeIdx]);
});

// Beam elements along perimeter
for (let i = 0; i < nx; i++) elements.push([i, i + 1]); // bottom
const topStart = ny * (nx + 1);
for (let i = 0; i < nx; i++) elements.push([topStart + i, topStart + i + 1]); // top
for (let j = 0; j < ny; j++) elements.push([j * (nx + 1), (j + 1) * (nx + 1)]); // left
for (let j = 0; j < ny; j++) elements.push([j * (nx + 1) + nx, (j + 1) * (nx + 1) + nx]); // right

console.log("\n[GEOMETRY]");
console.log(`Slab: ${Lx}m x ${Ly}m, t=${t}m, at Z=${H}m`);
console.log(`Columns: 0.4m x 0.4m, H=${H}m, at corners`);
console.log(`Beams: ${bBeam}m x ${hBeam}m along perimeter`);
console.log(`\nTotal nodes: ${nodes.length} (Slab: ${numSlabNodes}, Column bases: ${baseNodeIndices.length})`);
console.log(`Total elements: ${elements.length} (Shells: ${numSlabElements}, Frames: ${elements.length - numSlabElements})`);

// ==============================================================================
// ELEMENT PROPERTIES
// ==============================================================================
const nodeInputs: NodeInputs = { supports: new Map(), loads: new Map() };
const elementInputs: ElementInputs = {
  elasticities: new Map(),
  areas: new Map(),
  momentsOfInertiaZ: new Map(),
  momentsOfInertiaY: new Map(),
  torsionalConstants: new Map(),
  shearModuli: new Map(),
  thicknesses: new Map(),
  poissonsRatios: new Map(),
};

const G = E / (2 * (1 + nu));

// Slab (shell) properties
for (let i = 0; i < numSlabElements; i++) {
  elementInputs.elasticities.set(i, E);
  elementInputs.thicknesses.set(i, t);
  elementInputs.poissonsRatios.set(i, nu);
}

// Column properties
const colWidth = 0.4;
const A_col = colWidth * colWidth;
const I_col = (colWidth * Math.pow(colWidth, 3)) / 12;
const J_col = 0.141 * Math.pow(colWidth, 4);

for (let i = 0; i < 4; i++) {
  const elemIdx = numSlabElements + i;
  elementInputs.elasticities.set(elemIdx, E);
  elementInputs.areas.set(elemIdx, A_col);
  elementInputs.momentsOfInertiaZ.set(elemIdx, I_col);
  elementInputs.momentsOfInertiaY.set(elemIdx, I_col);
  elementInputs.shearModuli.set(elemIdx, G);
  elementInputs.torsionalConstants.set(elemIdx, J_col);
}

// Beam properties
const A_beam = bBeam * hBeam;
const Iz_beam = (bBeam * Math.pow(hBeam, 3)) / 12;
const Iy_beam = (hBeam * Math.pow(bBeam, 3)) / 12;
const J_beam = Math.abs(bBeam * Math.pow(hBeam, 3) * (1/3 - 0.21 * hBeam / bBeam));

for (let i = numSlabElements + 4; i < elements.length; i++) {
  elementInputs.elasticities.set(i, E);
  elementInputs.areas.set(i, A_beam);
  elementInputs.momentsOfInertiaZ.set(i, Iz_beam);
  elementInputs.momentsOfInertiaY.set(i, Iy_beam);
  elementInputs.shearModuli.set(i, G);
  elementInputs.torsionalConstants.set(i, J_beam);
}

// ==============================================================================
// LOADS
// ==============================================================================
// Distributed load on slab (equivalent nodal loads)
const elemArea = dx * dy;
const forcePerNode = q * elemArea / 4;

for (let i = 0; i < numSlabElements; i++) {
  const elem = elements[i];
  elem.forEach((nodeIdx) => {
    const existing = nodeInputs.loads.get(nodeIdx) || [0, 0, 0, 0, 0, 0];
    nodeInputs.loads.set(nodeIdx, [0, 0, existing[2] + forcePerNode, 0, 0, 0] as [number, number, number, number, number, number]);
  });
}

// Fixed supports at column bases
baseNodeIndices.forEach(idx => {
  nodeInputs.supports.set(idx, [true, true, true, true, true, true]);
});

console.log("\n[MATERIAL]");
console.log(`E = ${E/1e9} GPa = ${E} Pa`);
console.log(`nu = ${nu}`);
console.log(`G = ${G/1e9} GPa`);

console.log("\n[SECTION PROPERTIES]");
console.log(`Column: A=${A_col} m², I=${I_col.toExponential(4)} m⁴, J=${J_col.toExponential(4)} m⁴`);
console.log(`Beam: A=${A_beam} m², Iz=${Iz_beam.toExponential(4)} m⁴, Iy=${Iy_beam.toExponential(4)} m⁴`);

console.log("\n[LOADS]");
console.log(`Uniform load: ${Math.abs(q)/1000} kN/m² = ${q} N/m²`);
console.log(`Total load: ${Math.abs(q) * Lx * Ly / 1000} kN = ${Math.abs(q) * Lx * Ly} N`);

// ==============================================================================
// RUN ANALYSIS
// ==============================================================================
console.log("\n" + "=".repeat(80));
console.log("STATIC ANALYSIS RESULTS");
console.log("=".repeat(80));

const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

// ==============================================================================
// OUTPUT RESULTS
// ==============================================================================
console.log("\n[SLAB NODE COORDINATES AND DISPLACEMENTS]");
console.log("Node      X(m)      Y(m)      Z(m)       UX(m)         UY(m)         UZ(m)        RX(rad)       RY(rad)       RZ(rad)");
console.log("-".repeat(130));

for (let j = 0; j <= ny; j++) {
  for (let i = 0; i <= nx; i++) {
    const idx = j * (nx + 1) + i;
    const n = nodes[idx];
    const d = deformOutputs.deformations?.get(idx);
    if (d) {
      console.log(
        `${idx.toString().padStart(4)} ` +
        `${n[0].toFixed(3).padStart(9)} ${n[1].toFixed(3).padStart(9)} ${n[2].toFixed(3).padStart(9)} ` +
        `${d[0].toExponential(6).padStart(14)} ${d[1].toExponential(6).padStart(14)} ${d[2].toExponential(6).padStart(14)} ` +
        `${d[3].toExponential(6).padStart(14)} ${d[4].toExponential(6).padStart(14)} ${d[5].toExponential(6).padStart(14)}`
      );
    }
  }
}

// Key results summary
console.log("\n[SUMMARY]");
const centerIdx = Math.floor(ny/2) * (nx + 1) + Math.floor(nx/2);
const centerD = deformOutputs.deformations?.get(centerIdx);
console.log(`Center node (${centerIdx}): UZ = ${centerD ? (centerD[2]*1000).toFixed(4) : 'N/A'} mm`);

// Reactions
console.log("\n[SUPPORT REACTIONS]");
console.log("Node      X(m)      Y(m)      Z(m)       FX(N)         FY(N)         FZ(N)        MX(Nm)        MY(Nm)        MZ(Nm)");
console.log("-".repeat(130));

let totalFz = 0;
baseNodeIndices.forEach(idx => {
  const n = nodes[idx];
  const r = deformOutputs.reactions?.get(idx);
  if (r) {
    totalFz += r[2];
    console.log(
      `${idx.toString().padStart(4)} ` +
      `${n[0].toFixed(3).padStart(9)} ${n[1].toFixed(3).padStart(9)} ${n[2].toFixed(3).padStart(9)} ` +
      `${r[0].toExponential(6).padStart(14)} ${r[1].toExponential(6).padStart(14)} ${r[2].toExponential(6).padStart(14)} ` +
      `${r[3].toExponential(6).padStart(14)} ${r[4].toExponential(6).padStart(14)} ${r[5].toExponential(6).padStart(14)}`
    );
  }
});

console.log("-".repeat(130));
console.log(`Total Fz = ${totalFz.toFixed(2)} N = ${(totalFz/1000).toFixed(2)} kN`);
console.log(`Expected = ${Math.abs(q) * Lx * Ly} N = ${Math.abs(q) * Lx * Ly / 1000} kN`);
console.log(`Error = ${Math.abs((totalFz - Math.abs(q) * Lx * Ly) / (Math.abs(q) * Lx * Ly) * 100).toFixed(2)}%`);

console.log("\n" + "=".repeat(80));
console.log("END OF REPORT");
console.log("=".repeat(80));
