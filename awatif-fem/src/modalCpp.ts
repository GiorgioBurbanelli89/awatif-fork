/**
 * Modal Analysis using C++ WASM solver
 * Solves eigenvalue problem: K*φ = ω²*M*φ
 * Based on deformCpp.ts pattern
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model.js";
import createModule from "./cpp/built/modal.js";

// Modal outputs interface
export interface ModalOutputs {
  frequencies: Map<number, number>;      // Mode index -> frequency (Hz)
  periods: Map<number, number>;          // Mode index -> period (s)
  modeShapes: Map<number, number[]>;     // Mode index -> [deformations for all nodes]
  massParticipation: Map<number, {
    UX: number;
    UY: number;
    UZ: number;
    RX: number;
    RY: number;
    RZ: number;
  }>;
  sumParticipation: {
    SumUX: number;
    SumUY: number;
    SumUZ: number;
    SumRX: number;
    SumRY: number;
    SumRZ: number;
  };
}

// WASM module type
type WasmModule = Awaited<ReturnType<typeof createModule>>;

// WASM module - lazy loaded to avoid memory issues between tests
let mod: WasmModule | null = null;

async function getModule(): Promise<WasmModule> {
  if (!mod) {
    mod = await createModule();
  }
  return mod;
}

// Reset module (useful for tests)
export async function resetModalModule(): Promise<void> {
  mod = null;
  mod = await createModule();
}

// Utils - same pattern as deformCpp.ts
type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

function allocate<T extends TypedArrayConstructor>(
  data: number[],
  TypedArrayCtor: T,
  heapTypedArray: InstanceType<T>,
  wasmMod: WasmModule
): number {
  const buffer = new TypedArrayCtor(data);
  const pointer = wasmMod._malloc(buffer.length * buffer.BYTES_PER_ELEMENT);
  heapTypedArray.set(buffer, pointer / buffer.BYTES_PER_ELEMENT);
  return pointer;
}

/**
 * Modal Analysis Function
 * @param rigidDiaphragmLevels - Z coordinates of floors with rigid diaphragm (optional)
 */
export async function modal(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs,
  modalInputs: {
    densities: Map<number, number>;
    numModes?: number;
    rigidDiaphragmLevels?: number[];  // NEW: Z levels with rigid diaphragm
  }
): Promise<ModalOutputs> {
  if (nodes.length === 0) {
    return {
      frequencies: new Map(),
      periods: new Map(),
      modeShapes: new Map(),
      massParticipation: new Map(),
      sumParticipation: { SumUX: 0, SumUY: 0, SumUZ: 0, SumRX: 0, SumRY: 0, SumRZ: 0 }
    };
  }

  // Get WASM module (lazy loaded)
  const wasmMod = await getModule();

  const gc: number[] = []; // Garbage Collector for pointers
  const numNodes = nodes.length;
  const numModes = modalInputs.numModes || 12;
  const dof = numNodes * 6;

  // 1- Allocate data (same pattern as deformCpp.ts)

  // Nodes
  const nodesPtr = allocate(nodes.flat(), Float64Array, wasmMod.HEAPF64, wasmMod);
  gc.push(nodesPtr);

  // Elements
  const elementIndices = elements.flat();
  const elementsPtr = allocate(elementIndices, Uint32Array, wasmMod.HEAPU32, wasmMod);
  gc.push(elementsPtr);
  const elementSizes = elements.map((e) => e.length);
  const elementSizesPtr = allocate(elementSizes, Uint32Array, wasmMod.HEAPU32, wasmMod);
  gc.push(elementSizesPtr);

  // NodeInputs.supports
  const supportKeys = nodeInputs.supports
    ? Array.from(nodeInputs.supports.keys())
    : [];
  const supportValues = nodeInputs.supports
    ? Array.from(nodeInputs.supports.values())
        .flat()
        .map((b) => (b ? 1 : 0))
    : [];
  const supportKeysPtr = allocate(supportKeys, Uint32Array, wasmMod.HEAPU32, wasmMod);
  gc.push(supportKeysPtr);
  const supportValuesPtr = allocate(supportValues, Uint8Array, wasmMod.HEAPU8, wasmMod);
  gc.push(supportValuesPtr);

  // ElementInputs - helper function
  const processElementInput = (inputMap: Map<number, number> | undefined) => {
    const keys = inputMap ? Array.from(inputMap.keys()) : [];
    const values = inputMap ? Array.from(inputMap.values()) : [];
    const keysPtr = allocate(keys, Uint32Array, wasmMod.HEAPU32, wasmMod);
    gc.push(keysPtr);
    const valuesPtr = allocate(values, Float64Array, wasmMod.HEAPF64, wasmMod);
    gc.push(valuesPtr);
    return { keysPtr, valuesPtr, size: keys.length };
  };

  const elasticities = processElementInput(elementInputs.elasticities);
  const areas = processElementInput(elementInputs.areas);
  const moiZ = processElementInput(elementInputs.momentsOfInertiaZ);
  const moiY = processElementInput(elementInputs.momentsOfInertiaY);
  const shearMod = processElementInput(elementInputs.shearModuli);
  const torsion = processElementInput(elementInputs.torsionalConstants);
  const thickness = processElementInput(elementInputs.thicknesses);
  const poisson = processElementInput(elementInputs.poissonsRatios);
  const elasticitiesOrtho = processElementInput(elementInputs.elasticitiesOrthogonal);
  const densities = processElementInput(modalInputs.densities);

  // Rigid diaphragm levels (NEW)
  const diaphragmLevels = modalInputs.rigidDiaphragmLevels || [];
  const diaphragmLevelsPtr = allocate(diaphragmLevels, Float64Array, wasmMod.HEAPF64, wasmMod);
  gc.push(diaphragmLevelsPtr);

  // Output pointers (4 bytes for 32-bit WASM pointers)
  const frequenciesPtrOutPtr = wasmMod._malloc(4);
  gc.push(frequenciesPtrOutPtr);
  const periodsPtrOutPtr = wasmMod._malloc(4);
  gc.push(periodsPtrOutPtr);
  const modeShapesPtrOutPtr = wasmMod._malloc(4);
  gc.push(modeShapesPtrOutPtr);
  const massParticipationPtrOutPtr = wasmMod._malloc(4);
  gc.push(massParticipationPtrOutPtr);
  const numModesOutPtr = wasmMod._malloc(4);
  gc.push(numModesOutPtr);

  // 2- Call C++ Function
  wasmMod._modal(
    nodesPtr, numNodes,
    elementsPtr, elementIndices.length,
    elementSizesPtr, elements.length,
    supportKeysPtr, supportValuesPtr, supportKeys.length,
    elasticities.keysPtr, elasticities.valuesPtr, elasticities.size,
    areas.keysPtr, areas.valuesPtr, areas.size,
    moiZ.keysPtr, moiZ.valuesPtr, moiZ.size,
    moiY.keysPtr, moiY.valuesPtr, moiY.size,
    shearMod.keysPtr, shearMod.valuesPtr, shearMod.size,
    torsion.keysPtr, torsion.valuesPtr, torsion.size,
    thickness.keysPtr, thickness.valuesPtr, thickness.size,
    poisson.keysPtr, poisson.valuesPtr, poisson.size,
    elasticitiesOrtho.keysPtr, elasticitiesOrtho.valuesPtr, elasticitiesOrtho.size,
    densities.keysPtr, densities.valuesPtr, densities.size,
    diaphragmLevelsPtr, diaphragmLevels.length,  // Rigid diaphragm levels
    numModes,
    frequenciesPtrOutPtr,
    periodsPtrOutPtr,
    modeShapesPtrOutPtr,
    massParticipationPtrOutPtr,
    numModesOutPtr
  );

  // 3- Read Output Data (same pattern as deformCpp.ts)
  const numModesOut = wasmMod.HEAPU32[numModesOutPtr / 4];
  const frequenciesPtr = wasmMod.HEAPU32[frequenciesPtrOutPtr / 4];
  const periodsPtr = wasmMod.HEAPU32[periodsPtrOutPtr / 4];
  const modeShapesPtr = wasmMod.HEAPU32[modeShapesPtrOutPtr / 4];
  const massParticipationPtr = wasmMod.HEAPU32[massParticipationPtrOutPtr / 4];

  console.log(`Modal WASM returned: numModesOut=${numModesOut}, dof=${dof}`);
  console.log(`Pointers: freq=${frequenciesPtr}, periods=${periodsPtr}, mass=${massParticipationPtr}`);

  if (numModesOut === 0) {
    console.warn("Modal analysis returned 0 modes!");
    return {
      frequencies: new Map(),
      periods: new Map(),
      modeShapes: new Map(),
      massParticipation: new Map(),
      sumParticipation: { SumUX: 0, SumUY: 0, SumUZ: 0, SumRX: 0, SumRY: 0, SumRZ: 0 }
    };
  }

  // Read arrays from heap
  const frequencies = new Float64Array(wasmMod.HEAPF64.buffer, frequenciesPtr, numModesOut);
  const periods = new Float64Array(wasmMod.HEAPF64.buffer, periodsPtr, numModesOut);
  // Note: modeShapes uses a potentially reduced dof from WASM, but we read what we need
  const modeShapes = new Float64Array(wasmMod.HEAPF64.buffer, modeShapesPtr, numModesOut * dof);
  const massParticipation = new Float64Array(wasmMod.HEAPF64.buffer, massParticipationPtr, numModesOut * 6);

  console.log(`Read arrays: frequencies=${Array.from(frequencies).slice(0, 6)}`);
  console.log(`Read arrays: periods=${Array.from(periods).slice(0, 6)}`);
  console.log(`Read arrays: massParticipation=${Array.from(massParticipation).slice(0, 12)}`);

  // Build output maps
  const result: ModalOutputs = {
    frequencies: new Map(),
    periods: new Map(),
    modeShapes: new Map(),
    massParticipation: new Map(),
    sumParticipation: { SumUX: 0, SumUY: 0, SumUZ: 0, SumRX: 0, SumRY: 0, SumRZ: 0 }
  };

  for (let mode = 0; mode < numModesOut; mode++) {
    result.frequencies.set(mode + 1, frequencies[mode]);
    result.periods.set(mode + 1, periods[mode]);

    // Extract mode shape
    const shape: number[] = [];
    for (let i = 0; i < dof; i++) {
      shape.push(modeShapes[mode * dof + i]);
    }
    result.modeShapes.set(mode + 1, shape);

    // Extract mass participation
    const ux = massParticipation[mode * 6 + 0];
    const uy = massParticipation[mode * 6 + 1];
    const uz = massParticipation[mode * 6 + 2];
    const rx = massParticipation[mode * 6 + 3];
    const ry = massParticipation[mode * 6 + 4];
    const rz = massParticipation[mode * 6 + 5];

    result.massParticipation.set(mode + 1, { UX: ux, UY: uy, UZ: uz, RX: rx, RY: ry, RZ: rz });

    // Accumulate sums
    result.sumParticipation.SumUX += ux;
    result.sumParticipation.SumUY += uy;
    result.sumParticipation.SumUZ += uz;
    result.sumParticipation.SumRX += rx;
    result.sumParticipation.SumRY += ry;
    result.sumParticipation.SumRZ += rz;
  }

  // 4- Free Memory
  if (frequenciesPtr) gc.push(frequenciesPtr);
  if (periodsPtr) gc.push(periodsPtr);
  if (modeShapesPtr) gc.push(modeShapesPtr);
  if (massParticipationPtr) gc.push(massParticipationPtr);

  gc.forEach((ptr) => wasmMod._free(ptr));

  return result;
}
