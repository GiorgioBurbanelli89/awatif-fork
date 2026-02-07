// Vivienda Crucita - Analisis Sismico con Espectro NEC-SE-DS Ecuador
// Modelo extraido de ETABS: Vivienda_Crucita_NIVELES_OK.EDB
//
// IMPORTANTE: Las fuerzas sismicas se aplican SOLO en:
// - Nodos de LOSAS HORIZONTALES (diafragmas)
// - EXCLUYENDO nodos que pertenecen a escaleras/rampas
// Referencia: CSI Analysis Reference Manual - Diaphragm Constraint

import van from "vanjs-core";
import * as THREE from "three";
import {
  deform,
  analyze,
  modal,
  responseSpectrum,
  Node,
  Element,
  NodeInputs,
  ElementInputs,
  ModalOutputs,
  NECSpectrum,
  CombinationType,
} from "awatif-fem";
import { getViewer, Parameters, getParameters, getToolbar, getDialog, getTables } from "awatif-ui";
import modelData from "./model.json";
import {
  necSpectrum,
  getSpectrumInfo,
  approximatePeriod,
  calculateBaseShear,
  distributeLateralForces,
  NECSpectrumParams,
  SoilType,
  Region,
  RIOCHICO_SOIL_STUDY,
  necSpectrumWithSoilStudy,
} from "./nec-spectrum";
import { getShellSolids } from "./getShellSolids";
import { createSpectrumChart, updateSpectrumChart, SpectrumPoint, ModalPoint } from "./spectrum-chart";

// Parametros NEC-SE-DS interactivos
const parameters: Parameters = {
  zFactor: {
    value: van.state(50),
    min: 15,
    max: 50,
    step: 5,
    label: "Z (0.15-0.50g)",
  },
  soilType: {
    value: van.state(4),
    min: 1,
    max: 5,
    step: 1,
    label: "Suelo (A=1,B=2,C=3,D=4,E=5)",
  },
  importance: {
    value: van.state(10),
    min: 10,
    max: 15,
    step: 1,
    label: "I (1.0-1.5)",
  },
  reduction: {
    value: van.state(60),
    min: 10,
    max: 80,
    step: 5,
    label: "R (1.0-8.0)",
  },
  showShells: {
    value: van.state(1),
    min: 0,
    max: 1,
    step: 1,
    label: "Shells (0=No, 1=Si)",
  },
  analysisType: {
    value: van.state(0),
    min: 0,
    max: 2,
    step: 1,
    label: "Metodo (0=Est,1=SRSS,2=CQC)",
  },
};

// Preparar nodos
const nodes: Node[] = modelData.nodes as Node[];

// Preparar elementos FRAMES (2 nodos)
const frameElements: Element[] = modelData.elements as Element[];

// Función para dividir polígonos de 5+ nodos en triángulos (fan triangulation)
function triangulatePolygon(polygon: number[]): Element[] {
  if (polygon.length <= 4) return [polygon as Element];

  // Fan triangulation: crear triángulos desde el primer vértice
  const triangles: Element[] = [];
  for (let i = 1; i < polygon.length - 1; i++) {
    triangles.push([polygon[0], polygon[i], polygon[i + 1]] as Element);
  }
  return triangles;
}

// Preparar elementos SHELLS
// - Para visualización: TODAS las areas (3, 4, 5, 6 nodos)
// - Para análisis FEM: dividir polígonos de 5+ en triángulos
const allShellElements: Element[] = modelData.areas as Element[];
const femShellElements: Element[] = allShellElements.flatMap(area => {
  if (area.length <= 4) return [area as Element];
  return triangulatePolygon(area);
});

console.log(`Shells visualización: ${allShellElements.length}, FEM: ${femShellElements.length}`);

// Funcion para determinar si un shell es parte de la escalera
// Escalera: cualquier área con minZ < 3.5m O que sea inclinada
function isStairShell(element: number[], nodes: Node[]): boolean {
  const zValues = element.map(nodeIdx => nodes[nodeIdx]?.[2] ?? 0);
  const maxZ = Math.max(...zValues);
  const minZ = Math.min(...zValues);
  const zDiff = maxZ - minZ;

  // Shells inclinados (diff > 0.3) son escalera
  if (zDiff > 0.3) {
    return true;
  }

  // Todo lo que está debajo del primer piso (Z < 3.5m) es escalera
  // Los pisos principales están en Z = 3.52m, 6.58m, 7.58m
  if (minZ < 3.5) {
    return true;
  }

  return false;
}

// Funcion para determinar si un shell es horizontal (para análisis)
function isHorizontalShell(element: Element, nodes: Node[], tolerance: number = 0.3): boolean {
  const zValues = element.map(nodeIdx => nodes[nodeIdx]?.[2] ?? 0);
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  return (maxZ - minZ) < tolerance;
}

// Clasificar shells: ESCALERA vs LOSAS DE PISO
const horizontalShells: Element[] = [];  // Losas de piso (para análisis sísmico)
const stairShells: Element[] = [];       // Toda la escalera (para visualización)

allShellElements.forEach(shell => {
  if (isStairShell(shell, nodes)) {
    stairShells.push(shell);
  } else {
    horizontalShells.push(shell);
  }
});

// Para compatibilidad con el código existente
const inclinedShells = stairShells;

// IMPORTANTE: Obtener TODOS los nodos de shells inclinados (escalera)
// Estos nodos NO deben recibir fuerzas sismicas laterales
const stairNodeSet = new Set<number>();
inclinedShells.forEach(shell => {
  shell.forEach(nodeIdx => stairNodeSet.add(nodeIdx));
});

console.log(`Shells horizontales (losas): ${horizontalShells.length}`);
console.log(`Shells inclinados (escalera): ${inclinedShells.length}`);
console.log(`Nodos de escalera (excluidos): ${stairNodeSet.size}`);

// Preparar apoyos
const supportsMap = new Map<number, boolean[]>();
Object.entries(modelData.supports).forEach(([key, value]) => {
  supportsMap.set(parseInt(key), value as boolean[]);
});
console.log(`Apoyos empotrados: ${supportsMap.size} nodos`);

// Propiedades de materiales
const fc = 210;
const E_concrete = 12000 * Math.sqrt(fc) * 100;
const nu_concrete = 0.2;
const G_concrete = E_concrete / (2 * (1 + nu_concrete));
const density = 24;

// Secciones de frames
const colWidth = 0.30, colDepth = 0.30;
const beamWidth = 0.25, beamDepth = 0.30;

const A_col = colWidth * colDepth;
const Iz_col = (colWidth * Math.pow(colDepth, 3)) / 12;
const Iy_col = (colDepth * Math.pow(colWidth, 3)) / 12;
const J_col = 0.141 * Math.pow(Math.min(colWidth, colDepth), 4);

const A_beam = beamWidth * beamDepth;
const Iz_beam = (beamWidth * Math.pow(beamDepth, 3)) / 12;
const Iy_beam = (beamDepth * Math.pow(beamWidth, 3)) / 12;
const J_beam = 0.141 * Math.pow(Math.min(beamWidth, beamDepth), 4);

const slabThickness = 0.20;
const stairThickness = 0.15;

// Obtener niveles de piso de losas principales (Z >= 3.5m, pisos reales)
function getMainFloorLevels(nodes: Node[], horizontalShells: Element[]): number[] {
  const shellZLevels = horizontalShells.map(shell => {
    const zValues = shell.map(nodeIdx => nodes[nodeIdx][2]);
    return zValues.reduce((a, b) => a + b, 0) / zValues.length;
  });

  const tolerance = 0.3;
  const uniqueLevels: number[] = [];

  shellZLevels.forEach(z => {
    // Solo considerar pisos principales (Z >= 3.0m, ignorar descansos de escalera)
    if (z >= 3.0) {
      const exists = uniqueLevels.some(level => Math.abs(level - z) < tolerance);
      if (!exists) {
        uniqueLevels.push(z);
      }
    }
  });

  return uniqueLevels.sort((a, b) => a - b);
}

function getFloorData(nodes: Node[], horizontalShells: Element[]) {
  const floorZs = getMainFloorLevels(nodes, horizontalShells);
  const baseZ = Math.min(...nodes.map(n => n[2]));
  const heights = floorZs.map(z => z - baseZ);

  const floorArea = 7.0 * 7.0;
  const weightPerFloor = floorArea * slabThickness * density + floorArea * 2.0;
  const weights = heights.map(() => weightPerFloor);

  return {
    heights,
    weights,
    totalWeight: weights.reduce((a, b) => a + b, 0),
    maxHeight: Math.max(...heights),
    floorZs,
    baseZ,
  };
}

// Obtener nodos de losas en un nivel, EXCLUYENDO nodos de escalera
function getFloorNodesExcludingStairs(
  floorZ: number,
  horizontalShells: Element[],
  nodes: Node[],
  stairNodes: Set<number>,
  tolerance: number = 0.3
): number[] {
  const floorNodeSet = new Set<number>();

  horizontalShells.forEach(shell => {
    const avgZ = shell.reduce((sum, idx) => sum + nodes[idx][2], 0) / shell.length;
    if (Math.abs(avgZ - floorZ) < tolerance) {
      shell.forEach(nodeIdx => {
        // EXCLUIR nodos que pertenecen a la escalera
        if (!stairNodes.has(nodeIdx)) {
          floorNodeSet.add(nodeIdx);
        }
      });
    }
  });

  return Array.from(floorNodeSet);
}

function getSoilTypeFromIndex(index: number): SoilType {
  const types: SoilType[] = ['A', 'B', 'C', 'D', 'E'];
  return types[Math.min(Math.max(index - 1, 0), 4)];
}

// Estados reactivos
const nodesState = van.state<Node[]>(nodes);
// Para el estado inicial, usar solo elementos FEM-compatibles
const elementsState = van.state<Element[]>([...frameElements, ...femShellElements]);
const nodeInputsState = van.state<NodeInputs>({});
const elementInputsState = van.state<ElementInputs>({});
const deformOutputsState = van.state({});
const analyzeOutputsState = van.state({});

// Estado para resultados de análisis dinámico
const modalOutputsState = van.state<ModalOutputs | null>(null);
const dynamicResultsState = van.state<{
  baseShear: number;
  method: string;
  frequencies: number[];
  periods: number[];
  massParticipation: number[];
} | null>(null);

// Flag para evitar recalcular modal (la estructura no cambia)
// El análisis modal solo depende de la estructura - los parámetros sísmicos (Z, R, etc)
// solo afectan el espectro de respuesta, NO los modos propios
let cachedModalResults: ModalOutputs | null = null;
let cachedModalNodes: Node[] | null = null;
let cachedModalElements: Element[] | null = null;
let cachedModalNodeInputs: NodeInputs | null = null;
let cachedModalElementInputs: ElementInputs | null = null;

// Estado para tabla de resultados modales (para getTables)
const modalTableData = van.state<any[][]>([]);

// Estados para dialog y toolbar
const clickedButton = van.state("");
const dialogBody = van.state<any>(undefined);

// Configuración de tablas para modal results
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
    { field: "G", text: "Sum UX" },
    { field: "H", text: "Sum UY" },
  ],
  data: modalTableData,
});

// Mostrar dialog cuando se clickea el botón
van.derive(() => {
  console.log("clickedButton:", clickedButton.val);
  if (clickedButton.val === "Modal Results") {
    console.log("Mostrando Modal Results, filas:", modalTableData.val.length);
    dialogBody.val = getTables({ tables });
  }
});

// Shell solids visualization (like ETABS)
const shellSolidsGroup = getShellSolids(nodes, horizontalShells, inclinedShells, {
  slabColor: 0x888888,     // Gray for slabs
  slabOpacity: 0.5,
  stairColor: 0xcc2222,    // Red for stairs
  stairOpacity: 0.7,
});
const solids = van.state<THREE.Object3D[]>([shellSolidsGroup]);

// Ejecutar analisis
van.derive(() => {
  const Z = parameters.zFactor.value.val / 100;
  const soilType = getSoilTypeFromIndex(parameters.soilType.value.val);
  const I = parameters.importance.value.val / 10;
  const R = parameters.reduction.value.val / 10;
  const showShells = parameters.showShells.value.val === 1;

  // Para análisis FEM: solo elementos de 2, 3, 4 nodos
  const shellsToUse = showShells ? femShellElements : [];
  const elements: Element[] = [...frameElements, ...shellsToUse];
  elementsState.val = elements;

  const useStudyCoefficients = (Z === 0.50 && soilType === 'D');

  const spectrumParams: NECSpectrumParams = {
    Z, soilType, region: 'Costa' as Region, I, R,
  };

  const floorData = getFloorData(nodes, horizontalShells);
  const T = approximatePeriod(floorData.maxHeight, 0.055);

  const Sa = useStudyCoefficients
    ? necSpectrumWithSoilStudy(T, spectrumParams, RIOCHICO_SOIL_STUDY)
    : necSpectrum(T, spectrumParams);

  const V = Sa * floorData.totalWeight;
  const lateralForces = distributeLateralForces(V, floorData.heights, floorData.weights);

  // Aplicar fuerzas SOLO en nodos de losas, EXCLUYENDO escalera
  const loadsMap = new Map<number, number[]>();

  floorData.floorZs.forEach((z, floorIdx) => {
    const floorNodes = getFloorNodesExcludingStairs(z, horizontalShells, nodes, stairNodeSet);

    if (floorNodes.length > 0 && lateralForces[floorIdx] !== undefined) {
      const forcePerNode = lateralForces[floorIdx] / floorNodes.length;
      floorNodes.forEach(nodeIdx => {
        loadsMap.set(nodeIdx, [forcePerNode, 0, 0, 0, 0, 0]);
      });
    }
  });

  const nodeInputs: NodeInputs = {
    supports: supportsMap,
    loads: loadsMap,
  };

  // Propiedades de elementos
  const elasticities = new Map<number, number>();
  const areas = new Map<number, number>();
  const momentsOfInertiaZ = new Map<number, number>();
  const momentsOfInertiaY = new Map<number, number>();
  const torsionalConstants = new Map<number, number>();
  const shearModuli = new Map<number, number>();
  const thicknesses = new Map<number, number>();
  const poissonsRatios = new Map<number, number>();

  elements.forEach((el, i) => {
    elasticities.set(i, E_concrete);
    shearModuli.set(i, G_concrete);

    if (el.length === 2) {
      const n1 = nodes[el[0]];
      const n2 = nodes[el[1]];
      const dz = Math.abs(n2[2] - n1[2]);
      const isColumn = dz > 0.5;

      if (isColumn) {
        areas.set(i, A_col);
        momentsOfInertiaZ.set(i, Iz_col);
        momentsOfInertiaY.set(i, Iy_col);
        torsionalConstants.set(i, J_col);
      } else {
        areas.set(i, A_beam);
        momentsOfInertiaZ.set(i, Iz_beam);
        momentsOfInertiaY.set(i, Iy_beam);
        torsionalConstants.set(i, J_beam);
      }
    } else if (el.length === 4) {
      const isHorizontal = isHorizontalShell(el, nodes);
      thicknesses.set(i, isHorizontal ? slabThickness : stairThickness);
      poissonsRatios.set(i, nu_concrete);
    }
  });

  const elementInputs: ElementInputs = {
    elasticities,
    areas,
    momentsOfInertiaZ,
    momentsOfInertiaY,
    torsionalConstants,
    shearModuli,
    thicknesses,
    poissonsRatios,
  };

  // Siempre actualizar supports (independiente del análisis)
  nodeInputsState.val = nodeInputs;
  elementInputsState.val = elementInputs;

  try {
    const deformOutputs = deform(nodes, elements, nodeInputs, elementInputs);
    const analyzeOutputs = analyze(nodes, elements, elementInputs, deformOutputs);

    deformOutputsState.val = deformOutputs;
    analyzeOutputsState.val = analyzeOutputs;

    console.clear();
    console.log("=".repeat(50));
    console.log("VIVIENDA CRUCITA - NEC-SE-DS");
    console.log("=".repeat(50));

    if (useStudyCoefficients) {
      console.log("\n*** ESTUDIO DE SUELOS - Ing. Orlando Mora ***");
    }

    console.log(getSpectrumInfo(spectrumParams));
    console.log("\nMODELO:");
    console.log(`  Frames: ${frameElements.length}`);
    console.log(`  Losas: ${horizontalShells.length}`);
    console.log(`  Escalera: ${inclinedShells.length}`);
    console.log(`  Nodos escalera (SIN carga): ${stairNodeSet.size}`);
    console.log("\nFUERZAS SISMICAS:");
    console.log(`  T = ${T.toFixed(3)} s`);
    console.log(`  Sa = ${Sa.toFixed(4)}g`);
    console.log(`  W = ${floorData.totalWeight.toFixed(1)} kN`);
    console.log(`  V = ${V.toFixed(2)} kN`);
    console.log("\nANALISIS ESTATICO:");
    console.log(`  T = ${T.toFixed(3)} s`);
    console.log(`  Sa = ${Sa.toFixed(4)}g`);
    console.log(`  W = ${floorData.totalWeight.toFixed(1)} kN`);
    console.log(`  V_estatico = ${V.toFixed(2)} kN`);
    console.log("\nPOR PISO (solo losas, sin escalera):");
    lateralForces.forEach((f, i) => {
      const floorNodes = getFloorNodesExcludingStairs(floorData.floorZs[i], horizontalShells, nodes, stairNodeSet);
      console.log(`  Z=${floorData.floorZs[i].toFixed(1)}m: F=${f.toFixed(1)}kN (${floorNodes.length} nodos)`);
    });

    // ANÁLISIS MODAL - Siempre se ejecuta para tener Modal Results disponible
    // Modal Results = frecuencias, periodos, participación de masa (independiente del método de análisis)
    runModalAnalysis();

    // COMBINACIÓN ESPECTRAL - Solo cuando analysisType > 0 (SRSS=1 o CQC=2)
    const analysisType = parameters.analysisType.value.val;
    if (analysisType > 0) {
      const combinationMethod = analysisType === 2 ? 'CQC' : 'SRSS';
      runSpectralCombination(
        spectrumParams,
        useStudyCoefficients,
        V,
        combinationMethod
      );
    }

  } catch (e) {
    console.error("Error:", e);
  }
});

// Función para ANÁLISIS MODAL PURO
// Solo calcula modos de vibración, frecuencias, periodos y participación de masa
// Se ejecuta SIEMPRE para que el botón "Modal Results" funcione
async function runModalAnalysis() {
  try {
    // VERIFICAR SI YA TENEMOS RESULTADOS MODALES EN CACHÉ
    if (cachedModalResults && cachedModalNodes && cachedModalElements && cachedModalNodeInputs && cachedModalElementInputs) {
      console.log("✓ Modal Results: usando caché");
      modalOutputsState.val = cachedModalResults;
      updateModalTable(cachedModalResults);
      return;
    }

    console.log("\n" + "=".repeat(50));
    console.log("ANALISIS MODAL");
    console.log("=".repeat(50));

    // COMO ETABS: Usar SOLO frames para análisis modal
    // Filtrar para excluir escaleras y nodos extremos sin apoyo

    // Main structural levels (exclude stair intermediate levels)
    const mainLevels = [0.0, 0.1, 3.52, 6.58];
    const tolerance = 0.15;
    const isMainLevel = (z: number) =>
      mainLevels.some(lvl => Math.abs(z - lvl) < tolerance);

    // Get supports as set
    const supportSet = new Set<number>();
    supportsMap.forEach((_, key) => supportSet.add(key));

    // Filter elements: only keep elements at main levels and length > 0.3m
    let filteredFrames: Element[] = frameElements.filter(el => {
      const z1 = nodes[el[0]][2];
      const z2 = nodes[el[1]][2];
      const dx = nodes[el[1]][0] - nodes[el[0]][0];
      const dy = nodes[el[1]][1] - nodes[el[0]][1];
      const dz = nodes[el[1]][2] - nodes[el[0]][2];
      const L = Math.sqrt(dx*dx + dy*dy + dz*dz);
      return isMainLevel(z1) && isMainLevel(z2) && L > 0.3;
    });

    console.log(`Frames en niveles principales: ${filteredFrames.length}`);

    // Iteratively remove unsupported tip nodes (cantilevers that create mechanisms)
    let iterations = 0;
    const maxIterations = 10;
    while (iterations < maxIterations) {
      const nodeConnections = new Map<number, number>();
      filteredFrames.forEach(el => {
        nodeConnections.set(el[0], (nodeConnections.get(el[0]) || 0) + 1);
        nodeConnections.set(el[1], (nodeConnections.get(el[1]) || 0) + 1);
      });

      const tipNodes = new Set<number>();
      nodeConnections.forEach((count, nodeId) => {
        if (count === 1 && !supportSet.has(nodeId)) {
          tipNodes.add(nodeId);
        }
      });

      if (tipNodes.size === 0) break;
      console.log(`Iter ${iterations + 1}: eliminando ${tipNodes.size} nodos en voladizo`);
      filteredFrames = filteredFrames.filter(el =>
        !tipNodes.has(el[0]) && !tipNodes.has(el[1])
      );
      iterations++;
    }

    console.log(`Frames limpios para modal: ${filteredFrames.length}`);

    // 1. Obtener nodos únicos usados por frames filtrados
    const usedNodeIndices = new Set<number>();
    filteredFrames.forEach(el => {
      el.forEach(nodeIdx => usedNodeIndices.add(nodeIdx));
    });
    const sortedUsedNodes = Array.from(usedNodeIndices).sort((a, b) => a - b);

    // 2. Crear mapeo de índices viejos a nuevos
    const oldToNew = new Map<number, number>();
    sortedUsedNodes.forEach((oldIdx, newIdx) => {
      oldToNew.set(oldIdx, newIdx);
    });

    // 3. Filtrar nodos
    const modalNodes = sortedUsedNodes.map(idx => nodes[idx]);

    // 4. Re-mapear índices de elementos
    const modalElements = filteredFrames.map(el =>
      el.map(nodeIdx => oldToNew.get(nodeIdx)!) as Element
    );

    // 5. Re-mapear apoyos
    const modalSupports = new Map<number, boolean[]>();
    supportsMap.forEach((value, oldKey) => {
      if (oldToNew.has(oldKey)) {
        modalSupports.set(oldToNew.get(oldKey)!, value);
      }
    });

    const modalNodeInputs: NodeInputs = {
      supports: modalSupports,
    };

    console.log(`Modal: ${modalNodes.length} nodos, ${modalElements.length} frames`);
    console.log(`Apoyos: originales=${supportsMap.size}, re-mapeados=${modalSupports.size}`);

    // Propiedades de elementos para modal
    const modalElasticities = new Map<number, number>();
    const modalAreas = new Map<number, number>();
    const modalMomentsZ = new Map<number, number>();
    const modalMomentsY = new Map<number, number>();
    const modalShearModuli = new Map<number, number>();
    const modalTorsional = new Map<number, number>();
    const densities = new Map<number, number>();

    modalElements.forEach((el, i) => {
      modalElasticities.set(i, E_concrete);
      modalShearModuli.set(i, G_concrete);
      densities.set(i, density / 9.81);

      const n1 = modalNodes[el[0]];
      const n2 = modalNodes[el[1]];
      const dz = Math.abs(n2[2] - n1[2]);
      const isColumn = dz > 0.5;

      if (isColumn) {
        modalAreas.set(i, A_col);
        modalMomentsZ.set(i, Iz_col);
        modalMomentsY.set(i, Iy_col);
        modalTorsional.set(i, J_col);
      } else {
        modalAreas.set(i, A_beam);
        modalMomentsZ.set(i, Iz_beam);
        modalMomentsY.set(i, Iy_beam);
        modalTorsional.set(i, J_beam);
      }
    });

    const modalElementInputs: ElementInputs = {
      elasticities: modalElasticities,
      areas: modalAreas,
      momentsOfInertiaZ: modalMomentsZ,
      momentsOfInertiaY: modalMomentsY,
      shearModuli: modalShearModuli,
      torsionalConstants: modalTorsional,
    };

    console.log("Ejecutando análisis modal (WASM)...");
    const startTime = performance.now();

    const modalResults = await modal(modalNodes, modalElements, modalNodeInputs, modalElementInputs, {
      densities,
      numModes: 6,
    });

    const endTime = performance.now();
    console.log(`Modal completado en ${(endTime - startTime).toFixed(0)}ms`);

    // GUARDAR EN CACHÉ
    if (modalResults.frequencies.size > 0) {
      cachedModalResults = modalResults;
      cachedModalNodes = modalNodes;
      cachedModalElements = modalElements;
      cachedModalNodeInputs = modalNodeInputs;
      cachedModalElementInputs = modalElementInputs;
      console.log(`✓ Resultados guardados en caché (${modalResults.frequencies.size} modos)`);
    } else {
      console.warn("⚠ Modal: 0 modos encontrados");
    }

    modalOutputsState.val = modalResults;
    updateModalTable(modalResults);

  } catch (e) {
    console.error("Error en análisis modal:", e);
  }
}

// Función auxiliar para llenar la tabla de Modal Results
function updateModalTable(modalResults: ModalOutputs) {
  const tableData: any[][] = [];
  let sumUX = 0, sumUY = 0;

  console.log("\nMODOS DE VIBRACION:");
  modalResults.frequencies.forEach((f, mode) => {
    const T = modalResults.periods.get(mode) || 0;
    const mp = modalResults.massParticipation.get(mode);

    console.log(
      `  Modo ${mode}: T=${T.toFixed(3)}s, f=${f.toFixed(2)}Hz, ` +
      `Mx=${((mp?.UX || 0) * 100).toFixed(1)}%, My=${((mp?.UY || 0) * 100).toFixed(1)}%`
    );

    if (mp) {
      sumUX += mp.UX;
      sumUY += mp.UY;

      tableData.push([
        mode,
        T.toFixed(4),
        f.toFixed(3),
        (mp.UX * 100).toFixed(1),
        (mp.UY * 100).toFixed(1),
        (mp.RZ * 100).toFixed(1),
        (sumUX * 100).toFixed(1),
        (sumUY * 100).toFixed(1),
      ]);
    }
  });

  const sumPart = modalResults.sumParticipation;
  console.log(`  Suma: Mx=${(sumPart.SumUX * 100).toFixed(1)}%, My=${(sumPart.SumUY * 100).toFixed(1)}%`);

  modalTableData.val = tableData;
  console.log("Tabla Modal Results actualizada:", tableData.length, "modos");
}

// Función para COMBINACIÓN ESPECTRAL (SRSS/CQC)
// Solo se ejecuta cuando el usuario selecciona análisis dinámico
async function runSpectralCombination(
  spectrumParams: NECSpectrumParams,
  useStudyCoefficients: boolean,
  staticV: number,
  combinationMethod: CombinationType
) {
  try {
    if (!cachedModalResults || !cachedModalNodes || !cachedModalElements || !cachedModalNodeInputs || !cachedModalElementInputs) {
      console.warn("No hay resultados modales para combinación espectral");
      return;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`COMBINACION ESPECTRAL (${combinationMethod})`);
    console.log("=".repeat(50));

    const necSpectrum: NECSpectrum = {
      type: "NEC",
      Z: spectrumParams.Z,
      soilType: spectrumParams.soilType,
      region: spectrumParams.region,
      I: spectrumParams.I,
      R: spectrumParams.R,
      ...(useStudyCoefficients ? {
        Fa: RIOCHICO_SOIL_STUDY.Fa,
        Fd: RIOCHICO_SOIL_STUDY.Fd,
        Fs: RIOCHICO_SOIL_STUDY.Fs,
      } : {}),
    };

    console.log("Ejecutando espectro de respuesta...");
    const rsResults = await responseSpectrum(
      cachedModalNodes,
      cachedModalElements,
      cachedModalNodeInputs,
      cachedModalElementInputs,
      cachedModalResults,
      {
        spectrum: necSpectrum,
        direction: "X",
        combination: combinationMethod,
        damping: 0.05,
      }
    );

    const dynamicV = rsResults.baseShear[0];

    // Guardar resultados
    const freqs: number[] = [];
    const periods: number[] = [];
    const massPartX: number[] = [];
    cachedModalResults.frequencies.forEach((f, mode) => {
      freqs.push(f);
      periods.push(cachedModalResults.periods.get(mode) || 0);
      massPartX.push(cachedModalResults.massParticipation.get(mode)?.UX || 0);
    });

    dynamicResultsState.val = {
      baseShear: dynamicV,
      method: combinationMethod,
      frequencies: freqs,
      periods: periods,
      massParticipation: massPartX.map(m => m * 100),
    };

    // Comparación
    console.log("\nCOMPARACION ESTATICO vs DINAMICO:");
    console.log(`  V_estatico  = ${staticV.toFixed(2)} kN`);
    console.log(`  V_dinamico  = ${dynamicV.toFixed(2)} kN (${combinationMethod})`);
    console.log(`  Ratio       = ${(dynamicV / staticV).toFixed(3)}`);

    if (dynamicV < 0.8 * staticV) {
      console.log("\n  ⚠️ V_dinamico < 0.80×V_estatico → usar 0.80×V_estatico");
    }

  } catch (e) {
    console.error("Error en combinación espectral:", e);
  }
}

// UI
document.body.append(
  getToolbar({
    clickedButton,
    buttons: ["Modal Results"],
    sourceCode: "NEC-SE-DS Ecuador",
    author: "Vivienda Crucita",
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
    solids,
    settingsObj: {
      deformedShape: true,
      gridSize: 20,
      loads: true,
      supports: true,
      nodes: false,
      elements: true,
      shellResults: "none",  // Use solids visualization instead
    },
  }),
);

// Panel informativo - CENTRO SUPERIOR
const infoDiv = document.createElement("div");
infoDiv.style.cssText = `
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.95);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  font-family: monospace;
  font-size: 11px;
  max-width: 320px;
  z-index: 1000;
`;

// Contenedor del contenido (para poder ocultarlo)
const infoContent = document.createElement("div");
infoContent.id = "info-content";

// Botón minimizar/maximizar
const toggleBtn = document.createElement("button");
toggleBtn.textContent = "−";
toggleBtn.style.cssText = `
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  font-weight: bold;
`;
let isMinimized = false;
toggleBtn.onclick = () => {
  isMinimized = !isMinimized;
  infoContent.style.display = isMinimized ? "none" : "block";
  toggleBtn.textContent = isMinimized ? "+" : "−";
  infoDiv.style.padding = isMinimized ? "4px 28px 4px 8px" : "12px";
};
infoDiv.style.position = "relative";
infoDiv.appendChild(toggleBtn);

van.derive(() => {
  const Z = parameters.zFactor.value.val / 100;
  const soilType = getSoilTypeFromIndex(parameters.soilType.value.val);
  const I = parameters.importance.value.val / 10;
  const R = parameters.reduction.value.val / 10;

  const params: NECSpectrumParams = { Z, soilType, region: 'Costa' as Region, I, R };
  const floorData = getFloorData(nodes, horizontalShells);
  const T = approximatePeriod(floorData.maxHeight, 0.055);
  const Sa = (Z === 0.50 && soilType === 'D')
    ? necSpectrumWithSoilStudy(T, params, RIOCHICO_SOIL_STUDY)
    : necSpectrum(T, params);
  const V = Sa * floorData.totalWeight;
  const forces = distributeLateralForces(V, floorData.heights, floorData.weights);

  infoContent.innerHTML = `
    <strong>NEC-SE-DS Ecuador</strong><br>
    <hr style="margin:4px 0">
    Z=${Z.toFixed(2)}g | Suelo ${soilType}<br>
    T=${T.toFixed(3)}s | Sa=${Sa.toFixed(4)}g<br>
    <hr style="margin:4px 0">
    W=${floorData.totalWeight.toFixed(0)}kN<br>
    <b style="color:#c00">V=${V.toFixed(1)}kN</b><br>
    <hr style="margin:4px 0">
    <small>Fuerzas solo en losas<br>(escalera excluida)</small><br>
    ${forces.map((f, i) => `F${i + 1}=${f.toFixed(0)}kN`).join(' ')}
  `;
});

infoDiv.appendChild(infoContent);
document.body.append(infoDiv);

// Panel del espectro - CENTRO INFERIOR
const spectrumPanel = document.createElement("div");
spectrumPanel.id = "spectrum-panel";
spectrumPanel.style.cssText = `
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #0066cc;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  font-family: monospace;
  font-size: 11px;
  z-index: 9999;
  max-height: 45vh;
  overflow-y: auto;
`;
console.log("Panel del espectro creado");

// Botón minimizar espectro
const spectrumToggle = document.createElement("button");
spectrumToggle.textContent = "−";
spectrumToggle.style.cssText = `
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;
let spectrumMinimized = false;
const spectrumContent = document.createElement("div");
spectrumContent.id = "spectrum-content";

spectrumToggle.onclick = () => {
  spectrumMinimized = !spectrumMinimized;
  spectrumContent.style.display = spectrumMinimized ? "none" : "block";
  spectrumToggle.textContent = spectrumMinimized ? "+" : "−";
};

spectrumPanel.appendChild(spectrumToggle);
spectrumPanel.appendChild(spectrumContent);

// Contenedor del gráfico
const chartContainer = document.createElement("div");
chartContainer.id = "chart-container";
spectrumContent.appendChild(chartContainer);

// Tabla de resultados modales
const modalTable = document.createElement("div");
modalTable.id = "modal-table";
modalTable.style.marginTop = "10px";
spectrumContent.appendChild(modalTable);

document.body.append(spectrumPanel);

// Canvas del espectro (se crea una vez)
let spectrumCanvas: HTMLCanvasElement | null = null;

// Función para generar curva del espectro local
function generateSpectrumCurve(params: NECSpectrumParams, useStudy: boolean): SpectrumPoint[] {
  const curve: SpectrumPoint[] = [];
  const Tmax = 3.0;
  const numPoints = 100;

  for (let i = 0; i <= numPoints; i++) {
    const T = (i / numPoints) * Tmax;
    const Sa = useStudy
      ? necSpectrumWithSoilStudy(T, params, RIOCHICO_SOIL_STUDY)
      : necSpectrum(T, params);
    curve.push({ T, Sa });
  }
  return curve;
}

// Actualizar panel del espectro - SIEMPRE visible, muestra espectro inmediatamente
van.derive(() => {
  const analysisType = parameters.analysisType.value.val;
  const Z = parameters.zFactor.value.val / 100;
  const soilType = getSoilTypeFromIndex(parameters.soilType.value.val);
  const I = parameters.importance.value.val / 10;
  const R = parameters.reduction.value.val / 10;

  console.log("Actualizando panel espectro, analysisType =", analysisType);

  const useStudy = (Z === 0.50 && soilType === 'D');
  const params: NECSpectrumParams = { Z, soilType, region: 'Costa' as Region, I, R };

  // Siempre mostrar panel
  spectrumPanel.style.display = "block";

  // Generar curva del espectro
  const curve = generateSpectrumCurve(params, useStudy);

  // Obtener puntos modales si hay resultados dinámicos
  const modalResults = dynamicResultsState.val;
  const modalPoints: ModalPoint[] = [];

  if (modalResults && modalResults.periods.length > 0 && analysisType > 0) {
    modalResults.periods.forEach((T, i) => {
      const Sa = useStudy
        ? necSpectrumWithSoilStudy(T, params, RIOCHICO_SOIL_STUDY)
        : necSpectrum(T, params);
      modalPoints.push({
        T,
        Sa,
        mode: i + 1,
        massParticipation: (modalResults.massParticipation[i] || 0) / 100
      });
    });
  }

  // Título según tipo de análisis
  const methodName = analysisType === 0 ? 'Estático' : (analysisType === 1 ? 'SRSS' : 'CQC');

  // Crear o actualizar gráfico
  console.log("Creando gráfico, puntos de curva:", curve.length);
  try {
    if (!spectrumCanvas) {
      spectrumCanvas = createSpectrumChart(chartContainer, curve, modalPoints, {
        width: 350,
        height: 150,
        title: `Espectro NEC-SE-DS (${methodName})`
      });
      console.log("Canvas creado:", spectrumCanvas);
    } else {
      updateSpectrumChart(spectrumCanvas, curve, modalPoints, {
        title: `Espectro NEC-SE-DS (${methodName})`
      });
    }
  } catch (e) {
    console.error("Error creando gráfico:", e);
  }

  // Calcular período aproximado para análisis estático
  const floorData = getFloorData(nodes, horizontalShells);
  const T_approx = approximatePeriod(floorData.maxHeight, 0.055);
  const Sa_approx = useStudy
    ? necSpectrumWithSoilStudy(T_approx, params, RIOCHICO_SOIL_STUDY)
    : necSpectrum(T_approx, params);

  // Tabla de resultados
  if (analysisType === 0) {
    // Análisis estático - mostrar solo período aproximado
    modalTable.innerHTML = `
      <div style="padding:8px; background:#f5f5f5; border-radius:4px;">
        <strong>ANÁLISIS ESTÁTICO</strong><br>
        <hr style="margin:4px 0">
        T<sub>aprox</sub> = ${T_approx.toFixed(3)} s<br>
        Sa(T) = ${Sa_approx.toFixed(4)} g<br>
        <hr style="margin:4px 0">
        <span style="color:#c00; font-weight:bold;">
          V = ${(Sa_approx * floorData.totalWeight).toFixed(1)} kN
        </span>
      </div>
    `;
  } else if (modalResults && modalResults.periods.length > 0) {
    // Análisis dinámico con resultados
    let tableHTML = `
      <div style="margin-bottom:6px;"><strong>PARTICIPACIÓN MODAL (${modalResults.method})</strong></div>
      <table style="width:100%; border-collapse:collapse; font-size:10px;">
        <tr style="background:#ddd;">
          <th style="padding:3px; border:1px solid #bbb;">Modo</th>
          <th style="padding:3px; border:1px solid #bbb;">T (s)</th>
          <th style="padding:3px; border:1px solid #bbb;">f (Hz)</th>
          <th style="padding:3px; border:1px solid #bbb;">Mx (%)</th>
        </tr>
    `;

    let sumMx = 0;
    modalResults.periods.slice(0, 6).forEach((T, i) => {
      const mx = modalResults.massParticipation[i] || 0;
      sumMx += mx;
      tableHTML += `
        <tr>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">${i + 1}</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${T.toFixed(3)}</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${modalResults.frequencies[i]?.toFixed(2) || '-'}</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${mx.toFixed(1)}</td>
        </tr>
      `;
    });

    tableHTML += `
        <tr style="background:#eee; font-weight:bold;">
          <td colspan="3" style="padding:2px 4px; border:1px solid #ddd;">Σ Masa</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${sumMx.toFixed(1)}%</td>
        </tr>
      </table>
    `;

    // Cortante basal
    const V_static = Sa_approx * floorData.totalWeight;
    const ratio = modalResults.baseShear / V_static;

    tableHTML += `
      <div style="margin-top:8px; padding:6px; background:#fee; border-radius:4px;">
        <strong>V<sub>estático</sub> = ${V_static.toFixed(1)} kN</strong><br>
        <strong style="color:#c00;">V<sub>${modalResults.method}</sub> = ${modalResults.baseShear.toFixed(1)} kN</strong><br>
        <small>Ratio = ${ratio.toFixed(3)}</small>
      </div>
    `;

    modalTable.innerHTML = tableHTML;
  } else if (analysisType > 0) {
    // Esperando resultados dinámicos
    modalTable.innerHTML = `
      <div style="color:#666; padding:10px; text-align:center;">
        <div style="margin-bottom:8px;">Calculando modos...</div>
        <div style="font-size:20px;">⏳</div>
      </div>
    `;
  }
});
