/**
 * ZAPATA CON PEDESTAL - Awatif Example
 * =====================================
 *
 * Modelo de una zapata aislada cuadrada con pedestal central.
 * - Zapata: Shell elements (Quad4 thick plate con control de hourglass)
 * - Pedestal: Frame element
 * - Suelo: Fundación elástica Winkler (springs en cada nodo)
 *
 * Parametros interactivos:
 * - Dimensiones de la zapata (B, t)
 * - Dimensiones del pedestal (b_ped, h_ped)
 * - Modulo de elasticidad (E)
 * - Coeficiente de balasto (ks) - rigidez del suelo
 * - Carga vertical (P)
 * - Densidad de malla (n)
 */

import van from "vanjs-core";
import { Node, Element, NodeInputs, ElementInputs, deform } from "awatif-fem";
import { getViewer, Parameters, getParameters, getToolbar } from "awatif-ui";

// =====================================================
// PARAMETROS INTERACTIVOS
// =====================================================
const parameters: Parameters = {
  // Dimensiones zapata
  "B (m)": { value: van.state(2.0), min: 1.0, max: 4.0, step: 0.1 },
  "t (m)": { value: van.state(0.40), min: 0.20, max: 0.80, step: 0.05 },

  // Pedestal
  "b_ped (m)": { value: van.state(0.40), min: 0.20, max: 0.60, step: 0.05 },
  "h_ped (m)": { value: van.state(0.50), min: 0.30, max: 1.00, step: 0.10 },

  // Material
  "E (GPa)": { value: van.state(23.5), min: 15, max: 35, step: 0.5 },

  // Suelo - Coeficiente de balasto (Winkler)
  "ks (MN/m³)": { value: van.state(30), min: 5, max: 100, step: 5 },

  // Carga
  "P (kN)": { value: van.state(100), min: 10, max: 500, step: 10 },

  // Malla
  "n": { value: van.state(4), min: 2, max: 8, step: 1 },
};

// =====================================================
// ESTRUCTURA REACTIVA
// =====================================================
const mesh = {
  nodes: van.state<Node[]>([]),
  elements: van.state<Element[]>([]),
  nodeInputs: van.state<NodeInputs>({}),
  elementInputs: van.state<ElementInputs>({}),
  deformOutputs: van.state<any>({}),
  analyzeOutputs: van.state<any>({}),
};

// =====================================================
// FUNCION PRINCIPAL: Crear modelo y analizar
// =====================================================
van.derive(() => {
  // Leer parametros
  const B = parameters["B (m)"].value.val;
  const L = B;  // Zapata cuadrada
  const t = parameters["t (m)"].value.val;
  const b_ped = parameters["b_ped (m)"].value.val;
  const h_ped = parameters["h_ped (m)"].value.val;
  const E = parameters["E (GPa)"].value.val * 1e9;  // Pa
  const ks = parameters["ks (MN/m³)"].value.val * 1e6;  // N/m³ (coeficiente de balasto)
  const P = -parameters["P (kN)"].value.val * 1000;  // N (negativo = hacia abajo)
  const n = parameters["n"].value.val;

  const nu = 0.20;
  const G = E / (2 * (1 + nu));

  const dx = L / n;
  const dy = B / n;

  // =====================================================
  // CREAR NODOS
  // =====================================================
  const nodes: Node[] = [];
  const zapataGrid: number[][] = [];

  // Nodos de la zapata (plano Z=0)
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
    zapataGrid.push(row);
  }

  // Nodo del pedestal (arriba del centro)
  const pedNode = nodeIdx;
  nodes.push([0, 0, h_ped]);
  nodeIdx++;

  // Identificar nodo central de la zapata
  const centerI = Math.floor(n / 2);
  const centerJ = Math.floor(n / 2);
  const centerNode = zapataGrid[centerJ][centerI];

  // =====================================================
  // CREAR ELEMENTOS
  // =====================================================
  const elements: Element[] = [];
  const shellElements: number[] = [];

  // Elementos Shell (zapata)
  let elemIdx = 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const n1 = zapataGrid[j][i];
      const n2 = zapataGrid[j][i + 1];
      const n3 = zapataGrid[j + 1][i + 1];
      const n4 = zapataGrid[j + 1][i];
      elements.push([n1, n2, n3, n4]);
      shellElements.push(elemIdx);
      elemIdx++;
    }
  }

  // Elemento Frame (pedestal)
  const pedElement = elemIdx;
  elements.push([centerNode, pedNode]);

  // =====================================================
  // CONDICIONES DE BORDE - Fundación Winkler con Springs
  // =====================================================

  // Área tributaria por nodo
  const Atrib_interior = dx * dy;           // Nodos interiores
  const Atrib_borde = (dx * dy) / 2;        // Nodos en bordes
  const Atrib_esquina = (dx * dy) / 4;      // Nodos en esquinas

  // Springs (resortes verticales - modelo Winkler)
  const springs = new Map<number, [number, number, number, number, number, number]>();

  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const nodeIdx = zapataGrid[j][i];

      // Determinar área tributaria según posición
      let Atrib: number;
      const isCorner = (i === 0 || i === n) && (j === 0 || j === n);
      const isBorder = i === 0 || i === n || j === 0 || j === n;

      if (isCorner) {
        Atrib = Atrib_esquina;
      } else if (isBorder) {
        Atrib = Atrib_borde;
      } else {
        Atrib = Atrib_interior;
      }

      // Kz = ks * Atrib (rigidez del resorte vertical)
      const Kz = ks * Atrib;

      // [Kx, Ky, Kz, Krx, Kry, Krz]
      springs.set(nodeIdx, [0, 0, Kz, 0, 0, 0]);
    }
  }

  // Apoyos mínimos para evitar movimiento de cuerpo rígido (solo en X, Y)
  const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
  supports.set(zapataGrid[0][0], [true, true, false, false, false, false]);
  supports.set(zapataGrid[0][n], [false, true, false, false, false, false]);

  // Cargas - Carga concentrada en el pedestal
  const loads = new Map<number, [number, number, number, number, number, number]>();
  loads.set(pedNode, [0, 0, P, 0, 0, 0]);

  const nodeInputs: NodeInputs = { supports, loads, springs };

  // =====================================================
  // PROPIEDADES DE ELEMENTOS
  // =====================================================
  const elementInputs: ElementInputs = {
    elasticities: new Map(),
    thicknesses: new Map(),
    poissonsRatios: new Map(),
    shearModuli: new Map(),
    areas: new Map(),
    momentsOfInertiaZ: new Map(),
    momentsOfInertiaY: new Map(),
    torsionalConstants: new Map(),
  };

  // Shells (zapata)
  shellElements.forEach((idx) => {
    elementInputs.elasticities!.set(idx, E);
    elementInputs.thicknesses!.set(idx, t);
    elementInputs.poissonsRatios!.set(idx, nu);
    elementInputs.shearModuli!.set(idx, G);
  });

  // Frame (pedestal)
  const A_ped = b_ped * b_ped;
  const I_ped = Math.pow(b_ped, 4) / 12;
  const J_ped = 0.141 * Math.pow(b_ped, 4);

  elementInputs.elasticities!.set(pedElement, E);
  elementInputs.areas!.set(pedElement, A_ped);
  elementInputs.momentsOfInertiaZ!.set(pedElement, I_ped);
  elementInputs.momentsOfInertiaY!.set(pedElement, I_ped);
  elementInputs.torsionalConstants!.set(pedElement, J_ped);
  elementInputs.shearModuli!.set(pedElement, G);

  // =====================================================
  // ANALISIS
  // =====================================================
  const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);

  // Actualizar mesh reactivo
  mesh.nodes.val = nodes;
  mesh.elements.val = elements;
  mesh.nodeInputs.val = nodeInputs;
  mesh.elementInputs.val = elementInputs;
  mesh.deformOutputs.val = deformOutputs;

  // Mostrar resultados en consola
  const dispPed = deformOutputs.deformations?.get(pedNode);
  const dispCenter = deformOutputs.deformations?.get(centerNode);

  // Asentamiento teórico (placa rígida sobre Winkler)
  const A_zapata = B * L;
  const w_teorico = Math.abs(P) / (ks * A_zapata);

  if (dispPed) {
    console.log(`Zapata ${B}m x ${B}m, t=${t}m, ks=${ks/1e6} MN/m³, P=${-P/1000}kN`);
    console.log(`  UZ pedestal: ${(dispPed[2] * 1000).toFixed(4)} mm`);
    console.log(`  UZ centro zapata: ${((dispCenter?.[2] ?? 0) * 1000).toFixed(4)} mm`);
    console.log(`  w teórico (rígida): ${(w_teorico * 1000).toFixed(4)} mm`);
  }
});

// =====================================================
// UI
// =====================================================
document.body.append(
  getParameters(parameters),
  getViewer({
    mesh,
    settingsObj: {
      nodes: true,
      supports: true,
      loads: true,
      deformedShape: true,
      shellResults: "displacementZ",
      gridSize: 5,
    },
  }),
  getToolbar({
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/zapata/main.ts",
    author: "https://github.com/madil4",
  })
);
