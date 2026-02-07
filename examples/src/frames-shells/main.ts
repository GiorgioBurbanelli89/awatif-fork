/**
 * Frames + Shells Combined Example with Modal Analysis
 * Floor slab with edge beams and corner columns
 * For comparison with SAP2000 and ETABS analysis
 *
 * Structure:
 * - Slab: 6m x 4m, t=0.15m (Quad4 shell elements)
 * - Beams: 0.3m x 0.5m along edges (Frame elements)
 * - Columns: 0.4m x 0.4m at corners, height=3m (Frame elements)
 * - Load: 10 kN/m² on slab
 * - Material: Concrete E=30 GPa, nu=0.2, rho=2.5 ton/m³
 */
import van, { State } from "vanjs-core";
import { deform, analyze, modal, Mesh, Node, Element, NodeInputs, ElementInputs, DeformOutputs, AnalyzeOutputs, ModalOutputs } from "awatif-fem";
import { getViewer, Parameters, getParameters, getToolbar, getDialog, getTables } from "awatif-ui";
import { getQuadMesh, getQuadUniformLoads } from "awatif-mesh";

// Init
const parameters: Parameters = {
  Lx: { value: van.state(6), min: 2, max: 12, step: 0.5, label: "Lx (m)" },
  Ly: { value: van.state(4), min: 2, max: 8, step: 0.5, label: "Ly (m)" },
  nx: { value: van.state(6), min: 2, max: 12, step: 1, label: "nx divisions" },
  ny: { value: van.state(4), min: 2, max: 8, step: 1, label: "ny divisions" },
  columnHeight: { value: van.state(3), min: 2, max: 6, step: 0.5, label: "H col (m)" },
  slabThickness: { value: van.state(0.15), min: 0.1, max: 0.3, step: 0.01, label: "t slab (m)" },
  beamWidth: { value: van.state(0.3), min: 0.2, max: 0.5, step: 0.05, label: "b beam (m)" },
  beamHeight: { value: van.state(0.5), min: 0.3, max: 0.8, step: 0.05, label: "h beam (m)" },
  load_kN: { value: van.state(-10), min: -50, max: 0, step: 1, label: "Load (kN/m²)" },
  // Modal Analysis
  modalMode: { value: van.state(1), min: 1, max: 6, step: 1, label: "Mode #" },
  modalScale: { value: van.state(50), min: 1, max: 200, step: 5, label: "Modal Scale" },
  modalSpeed: { value: van.state(1), min: 0.1, max: 3, step: 0.1, label: "Anim Speed" },
};

// Mesh state
const mesh: Mesh = {
  nodes: van.state([]),
  elements: van.state([]),
  nodeInputs: van.state({}),
  elementInputs: van.state({}),
  deformOutputs: van.state({}),
  analyzeOutputs: van.state({}),
};

// Modal outputs state
const modalOutputsState: State<ModalOutputs | null> = van.state(null);

// Modal results table data
const modalTableData: State<any[][]> = van.state([]);
const staticTableData: State<any[][]> = van.state([]);

// Material properties (SI units: N, m, kg)
const E_concrete = 30e9; // 30 GPa = 30e9 Pa
const nu_concrete = 0.2;
const rho_concrete = 2500; // kg/m³

// Build and analyze model
async function buildAndAnalyze() {
  const Lx = parameters.Lx.value.val;
  const Ly = parameters.Ly.value.val;
  const nx = Math.round(parameters.nx.value.val);
  const ny = Math.round(parameters.ny.value.val);
  const H = parameters.columnHeight.value.val;
  const t = parameters.slabThickness.value.val;
  const bBeam = parameters.beamWidth.value.val;
  const hBeam = parameters.beamHeight.value.val;
  const q = parameters.load_kN.value.val * 1000; // kN/m² to N/m²

  // Generate slab mesh at z = H (top of columns)
  const { nodes: slabNodes, elements: slabElements } = getQuadMesh({
    Lx,
    Ly,
    nx,
    ny,
    z: H,
  });

  // Build combined mesh
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

  // Slab element properties
  slabElements.forEach((_, i) => {
    elementInputs.elasticities.set(i, E_concrete);
    elementInputs.thicknesses.set(i, t);
    elementInputs.poissonsRatios.set(i, nu_concrete);
    densities.set(i, rho_concrete);
  });

  // Slab loads
  const slabLoads = getQuadUniformLoads(slabElements, slabNodes, q);
  slabLoads.forEach((load, nodeIdx) => {
    nodeInputs.loads.set(nodeIdx, load);
  });

  // Add columns at the 4 corners (bottom nodes at z=0)
  const cornerSlabIndices = [
    0, // (0,0)
    nx, // (Lx,0)
    (ny) * (nx + 1) + nx, // (Lx,Ly)
    (ny) * (nx + 1), // (0,Ly)
  ];

  const G_concrete = E_concrete / (2 * (1 + nu_concrete));
  const colWidth = 0.4;
  const A_col = colWidth * colWidth;
  const I_col = (colWidth * Math.pow(colWidth, 3)) / 12;
  const J_col = 0.141 * Math.pow(colWidth, 4);

  cornerSlabIndices.forEach((slabNodeIdx) => {
    const slabNode = slabNodes[slabNodeIdx];
    const baseNodeIdx = nodes.length;
    nodes.push([slabNode[0], slabNode[1], 0]);

    const columnElementIdx = elements.length;
    elements.push([baseNodeIdx, slabNodeIdx]);

    elementInputs.elasticities.set(columnElementIdx, E_concrete);
    elementInputs.areas.set(columnElementIdx, A_col);
    elementInputs.momentsOfInertiaZ.set(columnElementIdx, I_col);
    elementInputs.momentsOfInertiaY.set(columnElementIdx, I_col);
    elementInputs.shearModuli.set(columnElementIdx, G_concrete);
    elementInputs.torsionalConstants.set(columnElementIdx, J_col);
    densities.set(columnElementIdx, rho_concrete);

    nodeInputs.supports.set(baseNodeIdx, [true, true, true, true, true, true]);
  });

  // Add edge beams
  const A_beam = bBeam * hBeam;
  const Iz_beam = (bBeam * Math.pow(hBeam, 3)) / 12;
  const Iy_beam = (hBeam * Math.pow(bBeam, 3)) / 12;
  const J_beam = Math.abs(bBeam * Math.pow(hBeam, 3) * (1/3 - 0.21 * hBeam / bBeam * (1 - Math.pow(hBeam / bBeam, 4) / 12)));

  function addBeamElement(n1: number, n2: number) {
    const beamElementIdx = elements.length;
    elements.push([n1, n2]);
    elementInputs.elasticities.set(beamElementIdx, E_concrete);
    elementInputs.areas.set(beamElementIdx, A_beam);
    elementInputs.momentsOfInertiaZ.set(beamElementIdx, Iz_beam);
    elementInputs.momentsOfInertiaY.set(beamElementIdx, Iy_beam);
    elementInputs.shearModuli.set(beamElementIdx, G_concrete);
    elementInputs.torsionalConstants.set(beamElementIdx, J_beam);
    densities.set(beamElementIdx, rho_concrete);
  }

  // Bottom edge (y=0)
  for (let i = 0; i < nx; i++) addBeamElement(i, i + 1);
  // Top edge (y=Ly)
  const topStart = ny * (nx + 1);
  for (let i = 0; i < nx; i++) addBeamElement(topStart + i, topStart + i + 1);
  // Left edge (x=0)
  for (let j = 0; j < ny; j++) addBeamElement(j * (nx + 1), (j + 1) * (nx + 1));
  // Right edge (x=Lx)
  for (let j = 0; j < ny; j++) addBeamElement(j * (nx + 1) + nx, (j + 1) * (nx + 1) + nx);

  // Update mesh state
  mesh.nodes.val = nodes;
  mesh.elements.val = elements;
  mesh.nodeInputs.val = nodeInputs;
  mesh.elementInputs.val = elementInputs;

  // Run static analysis
  const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);
  mesh.deformOutputs.val = deformOutputs;

  const analyzeOutputs = analyze(nodes, elements, elementInputs, deformOutputs);
  mesh.analyzeOutputs.val = analyzeOutputs;

  // Log static results
  const deformations = deformOutputs.deformations;
  const staticResults: any[][] = [];

  if (deformations) {
    let maxDisp = 0;
    let maxDispNode = 0;
    deformations.forEach((d, i) => {
      if (Math.abs(d[2]) > Math.abs(maxDisp)) {
        maxDisp = d[2];
        maxDispNode = i;
      }
    });

    const centerNodeIdx = Math.floor(ny / 2) * (nx + 1) + Math.floor(nx / 2);
    const centerDisp = deformations.get(centerNodeIdx);

    const reactions = deformOutputs.reactions;
    let totalRz = 0;
    if (reactions) {
      reactions.forEach((r) => { totalRz += r[2]; });
    }

    staticResults.push(
      ["Max Z displacement", `${(maxDisp * 1000).toFixed(3)} mm`, `Node ${maxDispNode}`],
      ["Center displacement", `${((centerDisp?.[2] || 0) * 1000).toFixed(3)} mm`, `Node ${centerNodeIdx}`],
      ["Total Rz (reactions)", `${(totalRz / 1000).toFixed(2)} kN`, ""],
      ["Expected Rz", `${(Math.abs(q) * Lx * Ly / 1000).toFixed(2)} kN`, `q*Lx*Ly`]
    );

    console.log("=== STATIC ANALYSIS RESULTS ===");
    console.log(`Max Z displacement: ${(maxDisp * 1000).toFixed(3)} mm at node ${maxDispNode}`);
    console.log(`Center displacement: ${((centerDisp?.[2] || 0) * 1000).toFixed(3)} mm`);
    console.log(`Total Rz: ${(totalRz / 1000).toFixed(2)} kN (Expected: ${(Math.abs(q) * Lx * Ly / 1000).toFixed(2)} kN)`);
  }
  staticTableData.val = staticResults;

  // Run modal analysis
  try {
    console.log("\n=== MODAL ANALYSIS RUNNING ===");
    console.log(`Total nodes: ${nodes.length}, Total elements: ${elements.length}`);
    console.log(`Shell elements: ${slabElements.length}, Frame elements: ${elements.length - slabElements.length}`);

    const modalOutputs = await modal(
      nodes,
      elements,
      nodeInputs,
      elementInputs,
      { densities, numModes: 6 }
    );

    // Save modal outputs for animation
    modalOutputsState.val = modalOutputs;

    // Build modal table data
    const tableData: any[][] = [];
    let sumUX = 0, sumUY = 0, sumRZ = 0;

    for (let mode = 1; mode <= modalOutputs.frequencies.size; mode++) {
      const T = modalOutputs.periods.get(mode) || 0;
      const f = modalOutputs.frequencies.get(mode) || 0;
      const mp = modalOutputs.massParticipation.get(mode);

      if (mp) {
        sumUX += mp.UX;
        sumUY += mp.UY;
        sumRZ += mp.RZ;

        tableData.push([
          mode,
          T.toFixed(4),
          f.toFixed(3),
          (mp.UX * 100).toFixed(1),
          (mp.UY * 100).toFixed(1),
          (mp.RZ * 100).toFixed(1),
          (sumUX * 100).toFixed(1),
          (sumUY * 100).toFixed(1),
          (sumRZ * 100).toFixed(1)
        ]);
      }
    }

    modalTableData.val = tableData;

    console.log("\n=== MODAL ANALYSIS RESULTS (Compare with SAP2000/ETABS) ===");
    console.log("Mode | T(s)   | f(Hz)  | UX%   | UY%   | RZ%   | SumUX | SumUY | SumRZ");
    console.log("-".repeat(80));
    tableData.forEach(row => console.log(row.join(" | ")));

  } catch (error) {
    console.error("Modal analysis failed:", error);
    modalTableData.val = [["Error", String(error), "", "", "", "", "", "", ""]];
  }
}

// Tables setup
const tables = new Map();
tables.set("modal", {
  text: "Modal Results",
  fields: [
    { field: "A", text: "Mode" },
    { field: "B", text: "T (s)" },
    { field: "C", text: "f (Hz)" },
    { field: "D", text: "UX %" },
    { field: "E", text: "UY %" },
    { field: "F", text: "RZ %" },
    { field: "G", text: "SumUX %" },
    { field: "H", text: "SumUY %" },
    { field: "I", text: "SumRZ %" },
  ],
  data: modalTableData,
});

tables.set("static", {
  text: "Static Results",
  fields: [
    { field: "A", text: "Description" },
    { field: "B", text: "Value" },
    { field: "C", text: "Notes" },
  ],
  data: staticTableData,
});

// Dialog setup
const clickedButton = van.state("");
const dialogBody: State<any> = van.state(undefined);

van.derive(() => {
  if (clickedButton.val === "Results") {
    dialogBody.val = getTables({ tables });
  }
});

// Run analysis on parameter change
van.derive(async () => {
  parameters.Lx.value.val;
  parameters.Ly.value.val;
  parameters.nx.value.val;
  parameters.ny.value.val;
  parameters.columnHeight.value.val;
  parameters.slabThickness.value.val;
  parameters.beamWidth.value.val;
  parameters.beamHeight.value.val;
  parameters.load_kN.value.val;

  await buildAndAnalyze();
});

// Create UI
document.body.append(
  getToolbar({
    clickedButton,
    buttons: ["Results"],
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/frames-shells/main.ts",
    author: "https://awatif.co",
  }),
  getDialog({ dialogBody }),
  getParameters(parameters),
  getViewer({
    mesh,
    modalOutputs: modalOutputsState,
    settingsObj: {
      nodes: false,
      elements: true,
      deformedShape: false,
      loads: true,
      supports: true,
      shellResults: "displacementZ",
      gridSize: 15,
      viewType: "3D",
      viewZLevel: 3,  // Z level of the slab
      modalMode: parameters.modalMode.value.val,
      modalScale: parameters.modalScale.value.val,
      modalSpeed: parameters.modalSpeed.value.val,
      modalAnimate: false,
    },
  })
);
