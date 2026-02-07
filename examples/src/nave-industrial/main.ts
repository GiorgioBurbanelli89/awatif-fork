/**
 * Nave Industrial con Cerchas - Industrial Warehouse with Trusses
 *
 * Structure:
 * - Steel portal frames with triangulated trusses
 * - Span: 12m, Column height: 6m, Truss height: 2m
 * - Frame spacing: 6m
 * - Columns: Tubo cuadrado 200x200x6mm (square tube 20cm x 20cm, 6mm wall)
 * - Truss chords/diagonals: Tubo rectangular 150x100x3mm (rectangular tube 15cm x 10cm, 3mm wall)
 * - Material: Steel E=210 GPa, rho=7850 kg/m³
 *
 * For comparison with ETABS: see nave_industrial_etabs.py
 */
import van, { State } from "vanjs-core";
import { modal, Node, Element, NodeInputs, ElementInputs, ModalOutputs } from "awatif-fem";
import { getViewer, Parameters, getParameters, getToolbar, getDialog, getTables } from "awatif-ui";

console.log("=== CARGANDO NAVE INDUSTRIAL ===");

// Parameters
const parameters: Parameters = {
  span: { value: van.state(12), min: 8, max: 24, step: 2, label: "Span (m)" },
  columnHeight: { value: van.state(6), min: 4, max: 10, step: 0.5, label: "Column H (m)" },
  trussHeight: { value: van.state(2), min: 1, max: 4, step: 0.5, label: "Truss H (m)" },
  numFrames: { value: van.state(4), min: 2, max: 8, step: 1, label: "Num Frames" },
  frameSpacing: { value: van.state(6), min: 4, max: 10, step: 1, label: "Frame Spacing (m)" },
  numPanels: { value: van.state(6), min: 4, max: 12, step: 2, label: "Truss Panels" },
  // Modal
  modalMode: { value: van.state(1), min: 1, max: 6, step: 1, label: "Mode #" },
  modalScale: { value: van.state(20), min: 1, max: 100, step: 5, label: "Modal Scale" },
  modalSpeed: { value: van.state(0.5), min: 0.01, max: 5, step: 0.05, label: "Anim Speed" },
};

// Mesh state
const mesh = {
  nodes: van.state<Node[]>([]),
  elements: van.state<Element[]>([]),
  nodeInputs: van.state<NodeInputs>({}),
  elementInputs: van.state<ElementInputs>({}),
  deformOutputs: van.state({}),
  analyzeOutputs: van.state({}),
};

const modalOutputsState: State<ModalOutputs | null> = van.state(null);
const modalTableData: State<any[][]> = van.state([]);

// Steel material (SI units: N, m, kg)
const E_steel = 210e9; // 210 GPa
const nu_steel = 0.3;
const rho_steel = 7850; // kg/m³
const G_steel = E_steel / (2 * (1 + nu_steel));

// Tubo cuadrado 200x200x6mm (columnas)
// Columns: 20cm x 20cm square tube, 6mm wall thickness
const b_col = 0.20, t_col = 0.006;
const b_int_col = b_col - 2 * t_col;
const A_col = b_col * b_col - b_int_col * b_int_col;
const I_col = (Math.pow(b_col, 4) - Math.pow(b_int_col, 4)) / 12;
// J for closed square tube: J = 4*Am²*t/s
const Am_col = Math.pow(b_col - t_col, 2);
const s_col = 4 * (b_col - t_col);
const J_col = 4 * Am_col * Am_col * t_col / s_col;
const TUBO_200x200x6 = { A: A_col, Iz: I_col, Iy: I_col, J: J_col };

// Tubo rectangular 150x100x3mm (vigas/cerchas)
// Beams/trusses: 15cm x 10cm rectangular tube, 3mm wall thickness
const b_viga = 0.15, h_viga = 0.10, t_viga = 0.003;
const b_int_viga = b_viga - 2 * t_viga;
const h_int_viga = h_viga - 2 * t_viga;
const A_viga = b_viga * h_viga - b_int_viga * h_int_viga;
const Iz_viga = (b_viga * Math.pow(h_viga, 3) - b_int_viga * Math.pow(h_int_viga, 3)) / 12;
const Iy_viga = (h_viga * Math.pow(b_viga, 3) - h_int_viga * Math.pow(b_int_viga, 3)) / 12;
// J for closed rectangular tube
const Am_viga = (b_viga - t_viga) * (h_viga - t_viga);
const s_viga = 2 * (b_viga - t_viga) + 2 * (h_viga - t_viga);
const J_viga = 4 * Am_viga * Am_viga * t_viga / s_viga;
const TUBO_150x100x3 = { A: A_viga, Iz: Iz_viga, Iy: Iy_viga, J: J_viga };

// Helper to add frame element
function addFrameElement(
  elements: Element[],
  elementInputs: ElementInputs,
  densities: Map<number, number>,
  n1: number,
  n2: number,
  section: typeof TUBO_200x200x6
) {
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

// Build model
async function buildAndAnalyze() {
  const span = parameters.span.value.val;
  const H_col = parameters.columnHeight.value.val;
  const H_truss = parameters.trussHeight.value.val;
  const numFrames = Math.round(parameters.numFrames.value.val);
  const spacing = parameters.frameSpacing.value.val;
  const numPanels = Math.round(parameters.numPanels.value.val);

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

  const panelWidth = span / numPanels;
  const halfPanels = numPanels / 2;

  // Store indices for each frame: { bottom: number[], top: number[], leftBase: number, rightBase: number }
  const frameData: { bottom: number[]; top: number[]; leftBase: number; rightBase: number }[] = [];

  // Create frames along Y axis
  for (let frame = 0; frame < numFrames; frame++) {
    const y = frame * spacing;

    // === NODES FOR THIS FRAME ===
    // Bottom chord nodes (at column top level)
    const bottomChord: number[] = [];
    for (let i = 0; i <= numPanels; i++) {
      const x = i * panelWidth;
      nodes.push([x, y, H_col]);
      bottomChord.push(nodes.length - 1);
    }

    // Top chord nodes (triangular profile - peak at center)
    // Extremes (i=0 and i=numPanels) share nodes with bottom chord
    const topChord: number[] = [];
    for (let i = 0; i <= numPanels; i++) {
      if (i === 0 || i === numPanels) {
        // Extremes share node with bottom chord
        topChord.push(bottomChord[i]);
      } else {
        const x = i * panelWidth;
        // Triangular roof profile
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

    // === ELEMENTS FOR THIS FRAME ===

    // Left column (base to bottom chord left end) - Tubo 200x200x6
    addFrameElement(elements, elementInputs, densities, leftBaseIdx, bottomChord[0], TUBO_200x200x6);

    // Right column (base to bottom chord right end) - Tubo 200x200x6
    addFrameElement(elements, elementInputs, densities, rightBaseIdx, bottomChord[numPanels], TUBO_200x200x6);

    // Bottom chord (cordón inferior) - Tubo 150x100x3
    for (let i = 0; i < numPanels; i++) {
      addFrameElement(elements, elementInputs, densities, bottomChord[i], bottomChord[i + 1], TUBO_150x100x3);
    }

    // Top chord (cordón superior) - Tubo 150x100x3
    for (let i = 0; i < numPanels; i++) {
      addFrameElement(elements, elementInputs, densities, topChord[i], topChord[i + 1], TUBO_150x100x3);
    }

    // Verticals (montantes) - only interior nodes, not at extremes where nodes are shared - Tubo 150x100x3
    for (let i = 1; i < numPanels; i++) {
      addFrameElement(elements, elementInputs, densities, bottomChord[i], topChord[i], TUBO_150x100x3);
    }

    // Diagonals - Tubo 150x100x3
    for (let i = 0; i < numPanels; i++) {
      // Alternate diagonal direction for stability
      if (i < halfPanels) {
        // Left half: diagonals go up-right
        addFrameElement(elements, elementInputs, densities, bottomChord[i], topChord[i + 1], TUBO_150x100x3);
      } else {
        // Right half: diagonals go up-left
        addFrameElement(elements, elementInputs, densities, bottomChord[i + 1], topChord[i], TUBO_150x100x3);
      }
    }

    // Supports
    nodeInputs.supports.set(leftBaseIdx, [true, true, true, true, true, true]);
    nodeInputs.supports.set(rightBaseIdx, [true, true, true, true, true, true]);
  }

  // === LONGITUDINAL ELEMENTS (connecting frames) ===
  // Purlins (correas) - connect ALL top chord nodes between adjacent frames - Tubo 150x100x3
  for (let frame = 0; frame < numFrames - 1; frame++) {
    const thisFrame = frameData[frame];
    const nextFrame = frameData[frame + 1];

    // Connect ALL top chord nodes (purlins/correas) - Tubo 150x100x3
    for (let i = 0; i <= numPanels; i++) {
      addFrameElement(elements, elementInputs, densities, thisFrame.top[i], nextFrame.top[i], TUBO_150x100x3);
    }

    // Connect bottom chord ends (at columns) - longitudinal ties - Tubo 150x100x3
    addFrameElement(elements, elementInputs, densities, thisFrame.bottom[0], nextFrame.bottom[0], TUBO_150x100x3);
    addFrameElement(elements, elementInputs, densities, thisFrame.bottom[numPanels], nextFrame.bottom[numPanels], TUBO_150x100x3);
  }

  // Update mesh
  mesh.nodes.val = nodes;
  mesh.elements.val = elements;
  mesh.nodeInputs.val = nodeInputs;
  mesh.elementInputs.val = elementInputs;

  console.log("\n=== NAVE INDUSTRIAL CON CERCHAS ===");
  console.log(`Luz: ${span}m, Altura columna: ${H_col}m, Altura cercha: ${H_truss}m`);
  console.log(`Pórticos: ${numFrames}, Separación: ${spacing}m, Paneles: ${numPanels}`);
  console.log(`Longitud total: ${(numFrames - 1) * spacing}m`);
  console.log(`Nodos: ${nodes.length}, Elementos: ${elements.length}`);

  // Run modal analysis
  try {
    console.log("\n=== ANÁLISIS MODAL ===");

    const modalOutputs = await modal(
      nodes,
      elements,
      nodeInputs,
      elementInputs,
      { densities, numModes: 6 }
    );

    modalOutputsState.val = modalOutputs;

    console.log("Modal outputs:", {
      frequencies: modalOutputs.frequencies,
      periods: modalOutputs.periods,
      massParticipation: modalOutputs.massParticipation,
      freqSize: modalOutputs.frequencies?.size,
    });

    // Build table
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
    console.log("Table data filled:", tableData.length, "rows");

    console.log("\nMode | T(s)     | f(Hz)   | UX%   | UY%   | RZ%   | SumUX | SumUY | SumRZ");
    console.log("-".repeat(80));
    tableData.forEach(row => {
      console.log(`${row[0]}    | ${row[1]} | ${row[2]}  | ${row[3]}  | ${row[4]}  | ${row[5]}  | ${row[6]}  | ${row[7]}  | ${row[8]}`);
    });

  } catch (error) {
    console.error("Modal analysis failed:", error);
    modalTableData.val = [["Error", String(error), "", "", "", "", "", "", ""]];
  }
}

// Tables
const tables = new Map();
tables.set("modal", {
  text: "Resultados Modales",
  fields: [
    { field: "A", text: "Modo" },
    { field: "B", text: "T (s)" },
    { field: "C", text: "f (Hz)" },
    { field: "D", text: "UX %" },
    { field: "E", text: "UY %" },
    { field: "F", text: "RZ %" },
    { field: "G", text: "SumUX" },
    { field: "H", text: "SumUY" },
    { field: "I", text: "SumRZ" },
  ],
  data: modalTableData,
});

// Dialog
const clickedButton = van.state("");
const dialogBody: State<any> = van.state(undefined);

van.derive(() => {
  if (clickedButton.val === "Results") {
    console.log("Opening Results dialog, table data:", modalTableData.val);
    dialogBody.val = getTables({ tables });
  }
});

// Run on parameter change
van.derive(async () => {
  parameters.span.value.val;
  parameters.columnHeight.value.val;
  parameters.trussHeight.value.val;
  parameters.numFrames.value.val;
  parameters.frameSpacing.value.val;
  parameters.numPanels.value.val;

  await buildAndAnalyze();
});

// UI
document.body.append(
  getToolbar({
    clickedButton,
    buttons: ["Results"],
    sourceCode: "https://github.com/madil4/awatif",
    author: "Nave Industrial - Awatif",
  }),
  getDialog({ dialogBody }),
  getParameters(parameters),
  getViewer({
    mesh,
    modalOutputs: modalOutputsState,
    settingsObj: {
      nodes: true,
      elements: true,
      deformedShape: false,
      loads: false,
      supports: true,
      gridSize: 25,
      viewType: "3D",
      modalMode: parameters.modalMode.value.val,
      modalScale: parameters.modalScale.value.val,
      modalSpeed: parameters.modalSpeed.value.val,
      modalAnimate: false,
    },
  })
);
