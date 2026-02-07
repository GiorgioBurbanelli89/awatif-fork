/**
 * Modal Analysis Example
 * 3x4 Column Building - Same as ETABS model for comparison
 * Shows modal results in a table
 */

import van, { State } from "vanjs-core";
import {
  Node,
  Element,
  NodeInputs,
  ElementInputs,
  DeformOutputs,
  AnalyzeOutputs,
  deform,
  analyze,
  modal,
  ModalOutputs
} from "awatif-fem";
import {
  getViewer,
  getParameters,
  Parameters,
  getToolbar,
  getDialog,
  getTables
} from "awatif-ui";

// ============================================================
// PARAMETERS
// ============================================================
const parameters: Parameters = {
  Lx: { value: van.state(10), min: 5, max: 20, step: 1, label: "Lx (m)" },
  Ly: { value: van.state(12), min: 5, max: 20, step: 1, label: "Ly (m)" },
  nx: { value: van.state(3), min: 2, max: 5, step: 1, label: "Columns X" },
  ny: { value: van.state(4), min: 2, max: 6, step: 1, label: "Columns Y" },
  nFloors: { value: van.state(2), min: 1, max: 5, step: 1, label: "Floors" },
  floorHeight: { value: van.state(3), min: 2, max: 5, step: 0.5, label: "Height (m)" },
  colSize: { value: van.state(0.4), min: 0.2, max: 0.8, step: 0.05, label: "Col (m)" },
  beamH: { value: van.state(0.5), min: 0.3, max: 0.8, step: 0.05, label: "Beam H (m)" },
};

// State for mesh
const nodesState: State<Node[]> = van.state([]);
const elementsState: State<Element[]> = van.state([]);
const nodeInputsState: State<NodeInputs> = van.state({});
const elementInputsState: State<ElementInputs> = van.state({});
const deformOutputsState: State<DeformOutputs> = van.state({});
const analyzeOutputsState: State<AnalyzeOutputs> = van.state({});

// State for modal results table
const modalTableData: State<any[][]> = van.state([]);

// ============================================================
// BUILD MODEL
// ============================================================
function buildModel() {
  const Lx = parameters.Lx.value.val;
  const Ly = parameters.Ly.value.val;
  const nx = parameters.nx.value.val;
  const ny = parameters.ny.value.val;
  const nFloors = parameters.nFloors.value.val;
  const h = parameters.floorHeight.value.val;

  const dx = Lx / (nx - 1);
  const dy = Ly / (ny - 1);

  const nodes: Node[] = [];
  const elements: Element[] = [];

  // Create nodes grid for each floor
  const nodeGrid: number[][][] = [];

  for (let floor = 0; floor <= nFloors; floor++) {
    const z = floor * h;
    nodeGrid[floor] = [];

    for (let ix = 0; ix < nx; ix++) {
      nodeGrid[floor][ix] = [];
      for (let iy = 0; iy < ny; iy++) {
        const x = ix * dx;
        const y = iy * dy;
        const nodeIdx = nodes.length;
        nodes.push([x, y, z]);
        nodeGrid[floor][ix][iy] = nodeIdx;
      }
    }
  }

  // Create columns
  const columnElements: number[] = [];
  for (let floor = 0; floor < nFloors; floor++) {
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        const n1 = nodeGrid[floor][ix][iy];
        const n2 = nodeGrid[floor + 1][ix][iy];
        columnElements.push(elements.length);
        elements.push([n1, n2]);
      }
    }
  }

  // Create beams in X direction
  const beamElements: number[] = [];
  for (let floor = 1; floor <= nFloors; floor++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        const n1 = nodeGrid[floor][ix][iy];
        const n2 = nodeGrid[floor][ix + 1][iy];
        beamElements.push(elements.length);
        elements.push([n1, n2]);
      }
    }
  }

  // Create beams in Y direction
  for (let floor = 1; floor <= nFloors; floor++) {
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny - 1; iy++) {
        const n1 = nodeGrid[floor][ix][iy];
        const n2 = nodeGrid[floor][ix][iy + 1];
        beamElements.push(elements.length);
        elements.push([n1, n2]);
      }
    }
  }

  // Fixed supports at base
  const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      supports.set(nodeGrid[0][ix][iy], [true, true, true, true, true, true]);
    }
  }

  // No loads for modal
  const loads = new Map<number, [number, number, number, number, number, number]>();

  // Material and section properties
  const E = 25000000; // kN/m² (25 GPa)
  const G = E / (2 * (1 + 0.2));
  const rho = 2.5; // ton/m³

  const colB = parameters.colSize.value.val;
  const colH = colB;
  const colA = colB * colH;
  const colIz = (colB * Math.pow(colH, 3)) / 12;
  const colIy = (colH * Math.pow(colB, 3)) / 12;
  const colJ = colIz + colIy;

  const beamB = 0.3;
  const beamH = parameters.beamH.value.val;
  const beamA = beamB * beamH;
  const beamIz = (beamB * Math.pow(beamH, 3)) / 12;
  const beamIy = (beamH * Math.pow(beamB, 3)) / 12;
  const beamJ = beamIz + beamIy;

  // Element properties
  const elasticities = new Map<number, number>();
  const areas = new Map<number, number>();
  const momentsOfInertiaZ = new Map<number, number>();
  const momentsOfInertiaY = new Map<number, number>();
  const shearModuli = new Map<number, number>();
  const torsionalConstants = new Map<number, number>();
  const densities = new Map<number, number>();

  for (const elemIdx of columnElements) {
    elasticities.set(elemIdx, E);
    areas.set(elemIdx, colA);
    momentsOfInertiaZ.set(elemIdx, colIz);
    momentsOfInertiaY.set(elemIdx, colIy);
    shearModuli.set(elemIdx, G);
    torsionalConstants.set(elemIdx, colJ);
    densities.set(elemIdx, rho);
  }

  for (const elemIdx of beamElements) {
    elasticities.set(elemIdx, E);
    areas.set(elemIdx, beamA);
    momentsOfInertiaZ.set(elemIdx, beamIz);
    momentsOfInertiaY.set(elemIdx, beamIy);
    shearModuli.set(elemIdx, G);
    torsionalConstants.set(elemIdx, beamJ);
    densities.set(elemIdx, rho);
  }

  const nodeInputs: NodeInputs = { supports, loads };
  const elementInputs: ElementInputs = {
    elasticities,
    areas,
    momentsOfInertiaZ,
    momentsOfInertiaY,
    shearModuli,
    torsionalConstants
  };

  return { nodes, elements, nodeInputs, elementInputs, densities };
}

// ============================================================
// RUN ANALYSIS
// ============================================================
async function runAnalysis() {
  const model = buildModel();

  // Update states for viewer
  nodesState.val = model.nodes;
  elementsState.val = model.elements;
  nodeInputsState.val = model.nodeInputs;
  elementInputsState.val = model.elementInputs;

  // Run static analysis
  const deformOutputs = deform(model.nodes, model.elements, model.nodeInputs, model.elementInputs);
  deformOutputsState.val = deformOutputs;

  const analyzeOutputs = analyze(model.nodes, model.elements, model.elementInputs, deformOutputs);
  analyzeOutputsState.val = analyzeOutputs;

  // Run modal analysis
  try {
    const modalOutputs = await modal(
      model.nodes,
      model.elements,
      model.nodeInputs,
      model.elementInputs,
      { densities: model.densities, numModes: 6 }
    );

    // Build table data
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

    console.log("Modal Analysis Results:");
    console.log("Mode | T(s)   | f(Hz)  | UX%   | UY%   | RZ%   | SumUX | SumUY | SumRZ");
    console.log("-".repeat(80));
    tableData.forEach(row => console.log(row.join(" | ")));

  } catch (error) {
    console.error("Modal analysis failed:", error);
  }
}

// ============================================================
// UI SETUP
// ============================================================
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

// Dialog for modal results
const clickedButton = van.state("");
const dialogBody: State<any> = van.state(undefined);

van.derive(() => {
  if (clickedButton.val === "Modal Results") {
    dialogBody.val = getTables({ tables });
  }
});

// Run analysis on parameter change
van.derive(async () => {
  // Access all parameters to trigger on any change
  parameters.Lx.value.val;
  parameters.Ly.value.val;
  parameters.nx.value.val;
  parameters.ny.value.val;
  parameters.nFloors.value.val;
  parameters.floorHeight.value.val;
  parameters.colSize.value.val;
  parameters.beamH.value.val;

  await runAnalysis();
});

// Create UI
document.body.append(
  getToolbar({
    clickedButton,
    buttons: ["Modal Results"],
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/modal-analysis/index.ts",
  }),
  getDialog({ dialogBody }),
  getParameters(parameters),
  getViewer({
    mesh: {
      nodes: nodesState,
      elements: elementsState,
      nodeInputs: nodeInputsState,
      elementInputs: elementInputsState,
      deformOutputs: deformOutputsState,
      analyzeOutputs: analyzeOutputsState,
    },
    settingsObj: {
      gridSize: 20,
    },
  })
);
