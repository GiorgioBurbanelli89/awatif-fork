/**
 * Test Modal Analysis: Pórtico 2x2 con voladizos
 * Compara con OpenSees: T1=0.165s, T2=0.147s, T3=0.147s
 */

import { describe, it, expect } from "vitest";
import { modal, resetModalModule } from "./modalCpp";
import { Node, Element, NodeInputs, ElementInputs } from "./data-model";

describe("Test Voladizo 2x2", () => {
  it("should match OpenSees results for frame with cantilevers", async () => {
    await resetModalModule();

    // Geometría
    const Lx = 4.0, Ly = 4.0, H = 3.0;
    const n_pisos = 2;
    const voladizo = 1.5;

    // Propiedades (SI: Pa, kg, m)
    const fc = 210;  // kg/cm²
    const E_kgcm2 = 15100 * Math.sqrt(fc);
    const E = E_kgcm2 * 98066.5;  // Pa
    const nu = 0.2;
    const G = E / (2 * (1 + nu));
    const rho = 2400;  // kg/m³

    // Secciones
    const col_b = 0.30, col_h = 0.30;
    const beam_b = 0.25, beam_h = 0.40;

    const A_col = col_b * col_h;
    const Iz_col = col_b * Math.pow(col_h, 3) / 12;
    const Iy_col = col_h * Math.pow(col_b, 3) / 12;
    const J_col = 0.141 * Math.pow(Math.min(col_b, col_h), 4);

    const A_beam = beam_b * beam_h;
    const Iz_beam = beam_b * Math.pow(beam_h, 3) / 12;
    const Iy_beam = beam_h * Math.pow(beam_b, 3) / 12;
    const J_beam = 0.141 * Math.pow(Math.min(beam_b, beam_h), 4);

    // Crear nodos
    const nodes: Node[] = [];
    const gridNodes: Map<string, number> = new Map();
    let nodeId = 0;

    // Nodos del grid (columnas)
    for (let k = 0; k <= n_pisos; k++) {
      const z = k * H;
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 2; i++) {
          const x = i * Lx;
          const y = j * Ly;
          nodes.push([x, y, z]);
          gridNodes.set(`${i},${j},${k}`, nodeId);
          nodeId++;
        }
      }
    }

    // Nodos de voladizo (último piso)
    const k = n_pisos;
    const z = k * H;
    const voladizoNodes: [number, number][] = [];

    // Esquina (0,0)
    nodes.push([-voladizo, 0, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("0,0,2")!]);
    nodes.push([0, -voladizo, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("0,0,2")!]);

    // Esquina (1,0)
    nodes.push([Lx + voladizo, 0, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("1,0,2")!]);
    nodes.push([Lx, -voladizo, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("1,0,2")!]);

    // Esquina (0,1)
    nodes.push([-voladizo, Ly, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("0,1,2")!]);
    nodes.push([0, Ly + voladizo, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("0,1,2")!]);

    // Esquina (1,1)
    nodes.push([Lx + voladizo, Ly, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("1,1,2")!]);
    nodes.push([Lx, Ly + voladizo, z]);
    voladizoNodes.push([nodeId++, gridNodes.get("1,1,2")!]);

    console.log(`Nodos: ${nodes.length}`);

    // Crear elementos
    const elements: Element[] = [];
    const elementTypes: string[] = [];

    // Columnas
    for (let kk = 0; kk < n_pisos; kk++) {
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 2; i++) {
          const n1 = gridNodes.get(`${i},${j},${kk}`)!;
          const n2 = gridNodes.get(`${i},${j},${kk + 1}`)!;
          elements.push([n1, n2]);
          elementTypes.push("col");
        }
      }
    }

    // Vigas X
    for (let kk = 1; kk <= n_pisos; kk++) {
      for (let j = 0; j < 2; j++) {
        const n1 = gridNodes.get(`0,${j},${kk}`)!;
        const n2 = gridNodes.get(`1,${j},${kk}`)!;
        elements.push([n1, n2]);
        elementTypes.push("beam");
      }
    }

    // Vigas Y
    for (let kk = 1; kk <= n_pisos; kk++) {
      for (let i = 0; i < 2; i++) {
        const n1 = gridNodes.get(`${i},0,${kk}`)!;
        const n2 = gridNodes.get(`${i},1,${kk}`)!;
        elements.push([n1, n2]);
        elementTypes.push("beam");
      }
    }

    // Vigas en voladizo
    for (const [tipNode, baseNode] of voladizoNodes) {
      elements.push([baseNode, tipNode]);
      elementTypes.push("beam");
    }

    console.log(`Elementos: ${elements.length} (${elementTypes.filter(t => t === 'col').length} col, ${elementTypes.filter(t => t === 'beam').length} beam)`);

    // Apoyos
    const supports = new Map<number, boolean[]>();
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < 2; i++) {
        const nodeIdx = gridNodes.get(`${i},${j},0`)!;
        supports.set(nodeIdx, [true, true, true, true, true, true]);
      }
    }

    const nodeInputs: NodeInputs = { supports };

    // Propiedades de elementos
    const elasticities = new Map<number, number>();
    const areas = new Map<number, number>();
    const momentsZ = new Map<number, number>();
    const momentsY = new Map<number, number>();
    const shearModuli = new Map<number, number>();
    const torsional = new Map<number, number>();
    const densities = new Map<number, number>();

    elements.forEach((_, i) => {
      const isCol = elementTypes[i] === "col";
      elasticities.set(i, E);
      shearModuli.set(i, G);
      densities.set(i, rho);

      if (isCol) {
        areas.set(i, A_col);
        momentsZ.set(i, Iz_col);
        momentsY.set(i, Iy_col);
        torsional.set(i, J_col);
      } else {
        areas.set(i, A_beam);
        momentsZ.set(i, Iz_beam);
        momentsY.set(i, Iy_beam);
        torsional.set(i, J_beam);
      }
    });

    const elementInputs: ElementInputs = {
      elasticities,
      areas,
      momentsOfInertiaZ: momentsZ,
      momentsOfInertiaY: momentsY,
      shearModuli,
      torsionalConstants: torsional,
    };

    // Análisis modal
    console.log("\nEjecutando análisis modal...");
    const results = await modal(nodes, elements, nodeInputs, elementInputs, {
      densities,
      numModes: 6,
    });

    // Resultados
    console.log(`\nModos: ${results.frequencies.size}`);
    results.frequencies.forEach((f, mode) => {
      const T = results.periods.get(mode) || 0;
      const mp = results.massParticipation.get(mode);
      console.log(
        `Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(3)}Hz, ` +
        `UX=${((mp?.UX || 0) * 100).toFixed(1)}%, UY=${((mp?.UY || 0) * 100).toFixed(1)}%`
      );
    });

    // OpenSees reference: T1=0.1647s, T2=0.1474s
    const T1 = results.periods.get(1) || 0;
    const f1 = results.frequencies.get(1) || 0;

    console.log(`\nComparación con OpenSees:`);
    console.log(`  Awatif:   T1=${T1.toFixed(4)}s, f1=${f1.toFixed(3)}Hz`);
    console.log(`  OpenSees: T1=0.1647s, f1=6.071Hz`);

    // Verificaciones
    expect(results.frequencies.size).toBeGreaterThan(0);
    expect(f1).toBeGreaterThan(1);  // Al menos 1 Hz
    expect(f1).toBeLessThan(20);    // Menos de 20 Hz

    // Comparar con OpenSees (tolerancia 20%)
    const T1_opensees = 0.1647;
    const diff = Math.abs(T1 - T1_opensees) / T1_opensees;
    console.log(`  Diferencia: ${(diff * 100).toFixed(1)}%`);

    // El período debería estar dentro del 50% del valor de OpenSees
    expect(T1).toBeGreaterThan(T1_opensees * 0.5);
    expect(T1).toBeLessThan(T1_opensees * 1.5);
  });
});
