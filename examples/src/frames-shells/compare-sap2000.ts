/**
 * Frames + Shells Comparison Script for SAP2000/ETABS
 * Outputs detailed results for comparison
 */
import { deform, analyze, modal, Node, Element, NodeInputs, ElementInputs } from "awatif-fem";
import { getQuadMesh, getQuadUniformLoads } from "awatif-mesh";

// Model Parameters (same as SAP2000/ETABS model)
const Lx = 6; // m
const Ly = 4; // m
const nx = 6;
const ny = 4;
const H = 3; // column height, m
const t = 0.15; // slab thickness, m
const bBeam = 0.3; // beam width, m
const hBeam = 0.5; // beam height, m
const q = -10000; // N/m² (10 kN/m² downward)

// Material Properties
const E = 30e9; // Pa (30 GPa)
const nu = 0.2;
const rho = 2500; // kg/m³

console.log("=".repeat(70));
console.log("FRAMES + SHELLS MODEL FOR SAP2000/ETABS COMPARISON");
console.log("=".repeat(70));
console.log("\n[GEOMETRY]");
console.log(`Slab: ${Lx}m x ${Ly}m, thickness ${t}m`);
console.log(`Columns: 0.4m x 0.4m, height ${H}m, at corners`);
console.log(`Beams: ${bBeam}m x ${hBeam}m along slab perimeter`);
console.log(`Mesh: ${nx} x ${ny} quad elements`);
console.log("\n[MATERIAL]");
console.log(`E = ${E/1e9} GPa`);
console.log(`nu = ${nu}`);
console.log(`rho = ${rho} kg/m³`);
console.log("\n[LOAD]");
console.log(`Uniform pressure: ${Math.abs(q)/1000} kN/m² on slab`);
console.log(`Total load: ${Math.abs(q) * Lx * Ly / 1000} kN`);

// Build the model
const { nodes: slabNodes, elements: slabElements } = getQuadMesh({ Lx, Ly, nx, ny, z: H });

const nodes: Node[] = [...slabNodes];
const elements: Element[] = [...slabElements];
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
const densities = new Map<number, number>();

// Slab properties
slabElements.forEach((_, i) => {
  elementInputs.elasticities.set(i, E);
  elementInputs.thicknesses.set(i, t);
  elementInputs.poissonsRatios.set(i, nu);
  densities.set(i, rho);
});

// Slab loads
const slabLoads = getQuadUniformLoads(slabElements, slabNodes, q);
slabLoads.forEach((load, nodeIdx) => {
  nodeInputs.loads.set(nodeIdx, load);
});

// Columns
const G = E / (2 * (1 + nu));
const colWidth = 0.4;
const A_col = colWidth * colWidth;
const I_col = (colWidth * Math.pow(colWidth, 3)) / 12;
const J_col = 0.141 * Math.pow(colWidth, 4);

const cornerSlabIndices = [0, nx, ny * (nx + 1) + nx, ny * (nx + 1)];
const baseNodeIndices: number[] = [];

cornerSlabIndices.forEach((slabNodeIdx) => {
  const slabNode = slabNodes[slabNodeIdx];
  const baseNodeIdx = nodes.length;
  nodes.push([slabNode[0], slabNode[1], 0]);
  baseNodeIndices.push(baseNodeIdx);

  const columnElementIdx = elements.length;
  elements.push([baseNodeIdx, slabNodeIdx]);

  elementInputs.elasticities.set(columnElementIdx, E);
  elementInputs.areas.set(columnElementIdx, A_col);
  elementInputs.momentsOfInertiaZ.set(columnElementIdx, I_col);
  elementInputs.momentsOfInertiaY.set(columnElementIdx, I_col);
  elementInputs.shearModuli.set(columnElementIdx, G);
  elementInputs.torsionalConstants.set(columnElementIdx, J_col);
  densities.set(columnElementIdx, rho);

  nodeInputs.supports.set(baseNodeIdx, [true, true, true, true, true, true]);
});

// Beams
const A_beam = bBeam * hBeam;
const Iz_beam = (bBeam * Math.pow(hBeam, 3)) / 12;
const Iy_beam = (hBeam * Math.pow(bBeam, 3)) / 12;
const J_beam = Math.abs(bBeam * Math.pow(hBeam, 3) * (1/3 - 0.21 * hBeam / bBeam));

function addBeam(n1: number, n2: number) {
  const idx = elements.length;
  elements.push([n1, n2]);
  elementInputs.elasticities.set(idx, E);
  elementInputs.areas.set(idx, A_beam);
  elementInputs.momentsOfInertiaZ.set(idx, Iz_beam);
  elementInputs.momentsOfInertiaY.set(idx, Iy_beam);
  elementInputs.shearModuli.set(idx, G);
  elementInputs.torsionalConstants.set(idx, J_beam);
  densities.set(idx, rho);
}

for (let i = 0; i < nx; i++) addBeam(i, i + 1);
const topStart = ny * (nx + 1);
for (let i = 0; i < nx; i++) addBeam(topStart + i, topStart + i + 1);
for (let j = 0; j < ny; j++) addBeam(j * (nx + 1), (j + 1) * (nx + 1));
for (let j = 0; j < ny; j++) addBeam(j * (nx + 1) + nx, (j + 1) * (nx + 1) + nx);

console.log(`\n[MODEL SUMMARY]`);
console.log(`Total nodes: ${nodes.length}`);
console.log(`Shell elements: ${slabElements.length}`);
console.log(`Frame elements (columns + beams): ${elements.length - slabElements.length}`);
console.log(`Total elements: ${elements.length}`);

// Run static analysis
console.log("\n" + "=".repeat(70));
console.log("STATIC ANALYSIS RESULTS");
console.log("=".repeat(70));

const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

console.log("\n[NODE DISPLACEMENTS (Selected nodes)]");
console.log("Node   X(m)     Y(m)     Z(m)     UZ(mm)   RX(rad)  RY(rad)");
console.log("-".repeat(70));

// Print displacements for key nodes
const keyNodes = [
  { idx: 0, name: "Corner (0,0)" },
  { idx: Math.floor(nx/2), name: "Mid-bottom edge" },
  { idx: Math.floor(ny/2) * (nx + 1) + Math.floor(nx/2), name: "CENTER" },
  { idx: topStart + Math.floor(nx/2), name: "Mid-top edge" },
];

keyNodes.forEach(({ idx, name }) => {
  const d = deformOutputs.deformations?.get(idx);
  const n = nodes[idx];
  if (d && n) {
    console.log(
      `${idx.toString().padStart(4)} ${n[0].toFixed(2).padStart(8)} ${n[1].toFixed(2).padStart(8)} ${n[2].toFixed(2).padStart(8)} ` +
      `${(d[2]*1000).toFixed(4).padStart(10)} ${d[3].toFixed(6).padStart(10)} ${d[4].toFixed(6).padStart(10)} <- ${name}`
    );
  }
});

// Print all slab node displacements
console.log("\n[ALL SLAB NODE DISPLACEMENTS]");
console.log("Node   X(m)     Y(m)     UX(mm)   UY(mm)   UZ(mm)   RX(rad)  RY(rad)  RZ(rad)");
console.log("-".repeat(90));

for (let j = 0; j <= ny; j++) {
  for (let i = 0; i <= nx; i++) {
    const idx = j * (nx + 1) + i;
    const d = deformOutputs.deformations?.get(idx);
    const n = nodes[idx];
    if (d && n) {
      console.log(
        `${idx.toString().padStart(4)} ${n[0].toFixed(2).padStart(8)} ${n[1].toFixed(2).padStart(8)} ` +
        `${(d[0]*1000).toFixed(4).padStart(9)} ${(d[1]*1000).toFixed(4).padStart(9)} ${(d[2]*1000).toFixed(4).padStart(9)} ` +
        `${d[3].toFixed(6).padStart(10)} ${d[4].toFixed(6).padStart(10)} ${d[5].toFixed(6).padStart(10)}`
      );
    }
  }
}

// Reactions
console.log("\n[SUPPORT REACTIONS]");
console.log("Node   X(m)     Y(m)     FX(kN)   FY(kN)   FZ(kN)   MX(kNm)  MY(kNm)  MZ(kNm)");
console.log("-".repeat(90));

let totalRz = 0;
baseNodeIndices.forEach(idx => {
  const r = deformOutputs.reactions?.get(idx);
  const n = nodes[idx];
  if (r && n) {
    console.log(
      `${idx.toString().padStart(4)} ${n[0].toFixed(2).padStart(8)} ${n[1].toFixed(2).padStart(8)} ` +
      `${(r[0]/1000).toFixed(2).padStart(9)} ${(r[1]/1000).toFixed(2).padStart(9)} ${(r[2]/1000).toFixed(2).padStart(9)} ` +
      `${(r[3]/1000).toFixed(4).padStart(10)} ${(r[4]/1000).toFixed(4).padStart(10)} ${(r[5]/1000).toFixed(4).padStart(10)}`
    );
    totalRz += r[2];
  }
});

console.log("-".repeat(90));
console.log(`Total Rz: ${(totalRz/1000).toFixed(2)} kN (Expected: ${Math.abs(q)*Lx*Ly/1000} kN)`);

// Run modal analysis
console.log("\n" + "=".repeat(70));
console.log("MODAL ANALYSIS RESULTS");
console.log("=".repeat(70));

async function runModal() {
  try {
    const modalOutputs = await modal(nodes, elements, nodeInputs, elementInputs, { densities, numModes: 6 });

    console.log("\n[NATURAL FREQUENCIES AND PERIODS]");
    console.log("Mode   Period(s)   Freq(Hz)    UX%      UY%      UZ%      RX%      RY%      RZ%");
    console.log("-".repeat(90));

    let sumUX = 0, sumUY = 0, sumUZ = 0, sumRX = 0, sumRY = 0, sumRZ = 0;

    for (let mode = 1; mode <= modalOutputs.frequencies.size; mode++) {
      const T = modalOutputs.periods.get(mode) || 0;
      const f = modalOutputs.frequencies.get(mode) || 0;
      const mp = modalOutputs.massParticipation.get(mode);

      if (mp) {
        sumUX += mp.UX;
        sumUY += mp.UY;
        sumUZ += mp.UZ;
        sumRX += mp.RX;
        sumRY += mp.RY;
        sumRZ += mp.RZ;

        console.log(
          `${mode.toString().padStart(4)} ${T.toFixed(6).padStart(12)} ${f.toFixed(4).padStart(11)} ` +
          `${(mp.UX*100).toFixed(2).padStart(8)} ${(mp.UY*100).toFixed(2).padStart(8)} ${(mp.UZ*100).toFixed(2).padStart(8)} ` +
          `${(mp.RX*100).toFixed(2).padStart(8)} ${(mp.RY*100).toFixed(2).padStart(8)} ${(mp.RZ*100).toFixed(2).padStart(8)}`
        );
      }
    }

    console.log("-".repeat(90));
    console.log(
      `SUM: ${" ".repeat(23)} ` +
      `${(sumUX*100).toFixed(2).padStart(8)} ${(sumUY*100).toFixed(2).padStart(8)} ${(sumUZ*100).toFixed(2).padStart(8)} ` +
      `${(sumRX*100).toFixed(2).padStart(8)} ${(sumRY*100).toFixed(2).padStart(8)} ${(sumRZ*100).toFixed(2).padStart(8)}`
    );

    // Print mode shape for first mode
    console.log("\n[MODE 1 SHAPE - Slab nodes only]");
    console.log("Node   X(m)     Y(m)     UX       UY       UZ       RX       RY       RZ");
    console.log("-".repeat(90));

    const mode1Shape = modalOutputs.modeShapes.get(1);
    if (mode1Shape) {
      for (let j = 0; j <= ny; j++) {
        for (let i = 0; i <= nx; i++) {
          const idx = j * (nx + 1) + i;
          const n = nodes[idx];
          console.log(
            `${idx.toString().padStart(4)} ${n[0].toFixed(2).padStart(8)} ${n[1].toFixed(2).padStart(8)} ` +
            `${mode1Shape[idx*6+0].toFixed(6).padStart(9)} ${mode1Shape[idx*6+1].toFixed(6).padStart(9)} ${mode1Shape[idx*6+2].toFixed(6).padStart(9)} ` +
            `${mode1Shape[idx*6+3].toFixed(6).padStart(9)} ${mode1Shape[idx*6+4].toFixed(6).padStart(9)} ${mode1Shape[idx*6+5].toFixed(6).padStart(9)}`
          );
        }
      }
    }

  } catch (error) {
    console.error("Modal analysis failed:", error);
  }
}

runModal();
