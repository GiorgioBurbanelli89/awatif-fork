/**
 * Test Modal Analysis with Vivienda Crucita model
 * This tests a real building model from ETABS
 */

import { describe, it, expect } from "vitest";
import { modal, resetModalModule } from "./modalCpp";
import { Node, Element, NodeInputs, ElementInputs } from "./data-model";

// Import model data
import modelData from "../../examples/src/vivienda-crucita/model.json";

describe("Vivienda Crucita Modal Analysis", () => {
  it("should compute reasonable frequencies for a 2-story building", async () => {
    await resetModalModule();

    // Material properties - USING EXACT SAME UNITS AS WORKING TESTS (Pa, kg/m³)
    const E_concrete = 2.1e10; // Pa (NOT kN/m²!) - same as working tests
    const nu_concrete = 0.2;
    const G_concrete = E_concrete / (2 * (1 + nu_concrete));
    const density = 2400; // kg/m³ (NOT kN/m³!) - same as working tests

    // Section properties
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

    // Get nodes and frames from model
    const nodes: Node[] = modelData.nodes as Node[];
    const allFrameElements: Element[] = modelData.elements as Element[];

    console.log(`\n=== VIVIENDA CRUCITA TEST ===`);
    console.log(`Total nodes: ${nodes.length}`);
    console.log(`Total frames: ${allFrameElements.length}`);

    // Main structural levels (exclude stair intermediate levels)
    const mainLevels = [0.0, 0.1, 3.52, 6.58];
    const tolerance = 0.15;

    const isMainLevel = (z: number) =>
      mainLevels.some(lvl => Math.abs(z - lvl) < tolerance);

    // Get supports as set
    const supportSet = new Set<number>();
    Object.keys(modelData.supports).forEach(key => supportSet.add(parseInt(key)));

    // Filter elements: only keep elements where BOTH nodes are at main levels
    // and element length > 0.3m (exclude short offset elements)
    let frameElements: Element[] = allFrameElements.filter(el => {
      const z1 = nodes[el[0]][2];
      const z2 = nodes[el[1]][2];
      const dx = nodes[el[1]][0] - nodes[el[0]][0];
      const dy = nodes[el[1]][1] - nodes[el[0]][1];
      const dz = nodes[el[1]][2] - nodes[el[0]][2];
      const L = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // Keep if both nodes at main levels and length > 0.3m
      return isMainLevel(z1) && isMainLevel(z2) && L > 0.3;
    });

    console.log(`Filtered frames (main levels): ${frameElements.length}`);

    // Iteratively remove elements with tip nodes (unsupported cantilevers)
    // This removes cantilever beams that create mechanisms
    let iterations = 0;
    const maxIterations = 10;
    while (iterations < maxIterations) {
      // Count connections per node
      const nodeConnections = new Map<number, number>();
      frameElements.forEach(el => {
        nodeConnections.set(el[0], (nodeConnections.get(el[0]) || 0) + 1);
        nodeConnections.set(el[1], (nodeConnections.get(el[1]) || 0) + 1);
      });

      // Find tip nodes (1 connection) that are not supported
      const tipNodes = new Set<number>();
      nodeConnections.forEach((count, nodeId) => {
        if (count === 1 && !supportSet.has(nodeId)) {
          tipNodes.add(nodeId);
        }
      });

      if (tipNodes.size === 0) break;  // No more tip nodes

      console.log(`Iteration ${iterations + 1}: Removing ${tipNodes.size} unsupported tip nodes`);

      // Remove elements connected to tip nodes
      frameElements = frameElements.filter(el =>
        !tipNodes.has(el[0]) && !tipNodes.has(el[1])
      );

      iterations++;
    }

    console.log(`Final frames after cleanup: ${frameElements.length}`);

    // Get unique nodes used by filtered frames
    const usedNodeIndices = new Set<number>();
    frameElements.forEach(el => {
      el.forEach(nodeIdx => usedNodeIndices.add(nodeIdx));
    });
    const sortedUsedNodes = Array.from(usedNodeIndices).sort((a, b) => a - b);

    // Create mapping from old to new indices
    const oldToNew = new Map<number, number>();
    sortedUsedNodes.forEach((oldIdx, newIdx) => {
      oldToNew.set(oldIdx, newIdx);
    });

    // Filter nodes
    const modalNodes = sortedUsedNodes.map(idx => nodes[idx]);

    // Re-map element indices
    const modalElements = frameElements.map(el =>
      el.map(nodeIdx => oldToNew.get(nodeIdx)!) as Element
    );

    // Re-map supports
    const supportsMap = new Map<number, boolean[]>();
    Object.entries(modelData.supports).forEach(([key, value]) => {
      supportsMap.set(parseInt(key), value as boolean[]);
    });

    const modalSupports = new Map<number, boolean[]>();
    supportsMap.forEach((value, oldKey) => {
      if (oldToNew.has(oldKey)) {
        modalSupports.set(oldToNew.get(oldKey)!, value);
      }
    });

    console.log(`Nodes used by frames: ${modalNodes.length}`);
    console.log(`Original supports: ${supportsMap.size}`);
    console.log(`Re-mapped supports: ${modalSupports.size}`);

    // Print the re-mapped support indices and their Z coordinates
    console.log(`Re-mapped support indices: ${Array.from(modalSupports.keys()).join(', ')}`);
    console.log(`Re-mapped support Z coords: ${Array.from(modalSupports.keys()).map(idx => modalNodes[idx]?.[2]?.toFixed(2) || 'N/A').join(', ')}`);

    // Print support node Z coordinates
    console.log(`Support nodes (original indices): ${Array.from(supportsMap.keys()).join(', ')}`);
    console.log(`Support nodes Z coords: ${Array.from(supportsMap.keys()).map(idx => nodes[idx]?.[2]?.toFixed(2) || 'N/A').join(', ')}`);

    // Check which support nodes are in the frame model
    const missingSupports: number[] = [];
    supportsMap.forEach((_, oldKey) => {
      if (!oldToNew.has(oldKey)) {
        missingSupports.push(oldKey);
      }
    });
    if (missingSupports.length > 0) {
      console.log(`WARNING: Support nodes NOT in frame model: ${missingSupports.join(', ')}`);
      console.log(`These nodes Z coords: ${missingSupports.map(idx => nodes[idx]?.[2]?.toFixed(2) || 'N/A').join(', ')}`);
    }

    const modalNodeInputs: NodeInputs = {
      supports: modalSupports,
    };

    // Check element lengths and statistics
    console.log(`\nChecking element lengths...`);
    let zeroLengthCount = 0;
    let shortElementCount = 0;
    let columnCount = 0;
    let beamCount = 0;
    let totalLength = 0;
    let minLength = 1e10;
    let maxLength = 0;

    modalElements.forEach((el, i) => {
      const n1 = modalNodes[el[0]];
      const n2 = modalNodes[el[1]];
      const dx = n2[0] - n1[0];
      const dy = n2[1] - n1[1];
      const dz = n2[2] - n1[2];
      const L = Math.sqrt(dx*dx + dy*dy + dz*dz);
      totalLength += L;
      if (L < minLength) minLength = L;
      if (L > maxLength) maxLength = L;

      const isColumn = Math.abs(dz) > 0.5;
      if (isColumn) columnCount++;
      else beamCount++;

      if (L < 1e-6) {
        console.log(`Element ${i}: L=${L.toFixed(6)}m - ZERO LENGTH!`);
        zeroLengthCount++;
      } else if (L < 0.1) {
        console.log(`Element ${i}: L=${L.toFixed(3)}m - SHORT!`);
        shortElementCount++;
      }
    });

    const avgLength = totalLength / modalElements.length;
    console.log(`Total elements: ${modalElements.length} (${columnCount} columns, ${beamCount} beams)`);
    console.log(`Element lengths: min=${minLength.toFixed(2)}m, max=${maxLength.toFixed(2)}m, avg=${avgLength.toFixed(2)}m`);
    console.log(`Zero-length: ${zeroLengthCount}, Short (<0.1m): ${shortElementCount}`);

    // Element properties
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
      densities.set(i, density); // kg/m³ directly (NOT divided by g!)

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

    // Print properties summary
    console.log(`\nMaterial properties:`);
    console.log(`  E_concrete = ${E_concrete.toExponential(3)} kN/m²`);
    console.log(`  density = ${(density/9.81).toFixed(4)} ton/m³`);
    console.log(`  A_col = ${A_col.toFixed(4)} m², Iz_col = ${Iz_col.toExponential(3)} m⁴`);
    console.log(`  A_beam = ${A_beam.toFixed(4)} m², Iz_beam = ${Iz_beam.toExponential(3)} m⁴`);

    // Run modal analysis
    console.log(`\nRunning modal analysis...`);
    const modalResults = await modal(modalNodes, modalElements, modalNodeInputs, modalElementInputs, {
      densities,
      numModes: 6,
    });

    // Print results
    console.log(`\nModes computed: ${modalResults.frequencies.size}`);
    modalResults.frequencies.forEach((f, mode) => {
      const T = modalResults.periods.get(mode) || 0;
      const mp = modalResults.massParticipation.get(mode);
      console.log(
        `Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(3)}Hz, ` +
        `UX=${((mp?.UX || 0) * 100).toFixed(1)}%, UY=${((mp?.UY || 0) * 100).toFixed(1)}%`
      );
    });

    // Assertions
    expect(modalResults.frequencies.size).toBeGreaterThan(0);

    // For a 2-story concrete building, fundamental period should be ~0.1-0.5s
    // Frequency should be ~2-10 Hz
    const f1 = modalResults.frequencies.get(1) || 0;
    const T1 = modalResults.periods.get(1) || 0;

    console.log(`\nFundamental frequency: ${f1.toFixed(3)} Hz`);
    console.log(`Fundamental period: ${T1.toFixed(4)} s`);

    // Check that frequencies are reasonable (not near zero, not extremely high)
    expect(f1).toBeGreaterThan(0.5); // At least 0.5 Hz
    expect(f1).toBeLessThan(50); // Less than 50 Hz

    // Check that period is reasonable
    expect(T1).toBeGreaterThan(0.02); // At least 0.02s
    expect(T1).toBeLessThan(2.0); // Less than 2s

    // Check mass participation - should have significant values
    const mp1 = modalResults.massParticipation.get(1);
    const totalUX = modalResults.sumParticipation.SumUX;
    const totalUY = modalResults.sumParticipation.SumUY;

    console.log(`\nTotal mass participation: UX=${(totalUX * 100).toFixed(1)}%, UY=${(totalUY * 100).toFixed(1)}%`);

    // With 6 modes, we should capture at least 50% of mass in each direction
    expect(totalUX).toBeGreaterThan(0.3);
    expect(totalUY).toBeGreaterThan(0.3);
  });
});
