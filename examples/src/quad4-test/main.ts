/**
 * Quad4 Plate Test - Comparison with SAP2000 and Calcpad
 * Rectangular plate 6m x 4m, t=0.1m, E=35GPa, nu=0.15, q=10kN/m²
 */
import van from "vanjs-core";
import { deform, analyze, Mesh } from "awatif-fem";
import { getViewer, Parameters, getParameters, getToolbar } from "awatif-ui";
import { getQuadMesh, getQuadUniformLoads } from "awatif-mesh";

// Init
const parameters: Parameters = {
  Lx: { value: van.state(6), min: 2, max: 12, step: 0.5 },
  Ly: { value: van.state(4), min: 2, max: 8, step: 0.5 },
  nx: { value: van.state(6), min: 2, max: 12, step: 1 },
  ny: { value: van.state(4), min: 2, max: 8, step: 1 },
  thickness: { value: van.state(0.1), min: 0.05, max: 0.5, step: 0.01 },
  E_GPa: { value: van.state(35), min: 10, max: 200, step: 5 },
  load_kN: { value: van.state(-10), min: -50, max: 50, step: 1 },
};

const mesh: Mesh = {
  nodes: van.state([]),
  elements: van.state([]),
  nodeInputs: van.state({}),
  elementInputs: van.state({}),
  deformOutputs: van.state({}),
  analyzeOutputs: van.state({}),
};

// Events: on parameter change mesh & deform
van.derive(() => {
  const Lx = parameters.Lx.value.val;
  const Ly = parameters.Ly.value.val;
  const nx = Math.round(parameters.nx.value.val);
  const ny = Math.round(parameters.ny.value.val);
  const t = parameters.thickness.value.val;
  const E = parameters.E_GPa.value.val * 1e9;
  const q = parameters.load_kN.value.val * 1000;

  // Generate quad mesh
  const { nodes, elements, boundaryIndices } = getQuadMesh({ Lx, Ly, nx, ny });

  // Setup supports (simply supported - Z fixed)
  mesh.nodeInputs.val = {
    supports: new Map(
      boundaryIndices.map((i) => [i, [false, false, true, false, false, false]])
    ),
    loads: getQuadUniformLoads(elements, nodes, q),
  };

  mesh.nodes.val = nodes;
  mesh.elements.val = elements;

  mesh.elementInputs.val = {
    elasticities: new Map(elements.map((_, i) => [i, E])),
    thicknesses: new Map(elements.map((_, i) => [i, t])),
    poissonsRatios: new Map(elements.map((_, i) => [i, 0.15])),
  };

  mesh.deformOutputs.val = deform(
    nodes,
    elements,
    mesh.nodeInputs.val,
    mesh.elementInputs.val
  );

  mesh.analyzeOutputs.val = analyze(
    nodes,
    elements,
    mesh.elementInputs.val,
    mesh.deformOutputs.val
  );
});

document.body.append(
  getParameters(parameters),
  getViewer({
    mesh,
    settingsObj: {
      nodes: false,
      elements: true,
      deformedShape: true,
      loads: true,
      supports: true,
      shellResults: "displacementZ",
    },
  }),
  getToolbar({
    sourceCode:
      "https://github.com/madil4/awatif/blob/main/examples/src/quad4-test/main.ts",
    author: "https://awatif.co",
  })
);
