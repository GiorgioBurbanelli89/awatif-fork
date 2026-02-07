/**
 * MODELO 3: Portico 3D + Losa Shell + Voladizos
 * Para comparar ETABS vs OpenSees vs Awatif
 *
 * Este es el modelo mas completo con elementos shell (losa)
 * que se extienden mas alla de las columnas formando voladizos.
 */

import { describe, it, expect } from "vitest";
import { modal, resetModalModule } from "./modalCpp";
import { Node, Element, NodeInputs, ElementInputs } from "./data-model";

describe("Modelo 3: Portico + Losa + Voladizos", () => {
  it("should compute modal frequencies with shell elements", async () => {
    await resetModalModule();

    // Propiedades
    const fc = 210;
    const E_kgcm2 = 15100 * Math.sqrt(fc);
    const E = E_kgcm2 * 98066.5;
    const nu = 0.2;
    const G = E / (2 * (1 + nu));
    const rho = 2400;

    // Secciones
    const col_b = 0.30, col_h = 0.30;
    const slab_t = 0.12; // 12cm

    const A_col = col_b * col_h;
    const Iz_col = col_b * Math.pow(col_h, 3) / 12;
    const Iy_col = col_h * Math.pow(col_b, 3) / 12;
    const J_col = 0.141 * Math.pow(Math.min(col_b, col_h), 4);

    // Geometria
    const H = 3.0;
    const Lx = 4.0;
    const Ly = 4.0;
    const voladizo = 1.5;

    // Limites de losa
    const x_min = -voladizo;
    const x_max = Lx + voladizo;
    const y_min = -voladizo;
    const y_max = Ly + voladizo;

    // Malla
    const nx = 7;
    const ny = 7;
    const dx = (x_max - x_min) / (nx - 1);
    const dy = (y_max - y_min) / (ny - 1);

    const nodes: Node[] = [];
    const nodeGrid = new Map<string, number>();

    // Nodos base columnas
    const colPositions: [number, number][] = [
      [0.0, 0.0],
      [Lx, 0.0],
      [0.0, Ly],
      [Lx, Ly]
    ];

    const baseNodeIds: number[] = [];
    for (const [x, y] of colPositions) {
      const nodeId = nodes.length;
      nodes.push([x, y, 0.0]);
      baseNodeIds.push(nodeId);
    }

    // Nodos de losa
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = x_min + i * dx;
        const y = y_min + j * dy;
        const nodeId = nodes.length;
        nodes.push([x, y, H]);
        nodeGrid.set(`${i},${j}`, nodeId);
      }
    }

    // Encontrar nodos de columna en losa
    const findClosestNode = (xTarget: number, yTarget: number): number => {
      let minDist = Infinity;
      let closest = 0;
      nodeGrid.forEach((nodeId) => {
        const [x, y] = nodes[nodeId];
        const dist = Math.sqrt((x - xTarget) ** 2 + (y - yTarget) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = nodeId;
        }
      });
      return closest;
    };

    const colTopNodes = colPositions.map(([x, y]) => findClosestNode(x, y));

    // Elementos
    const elements: Element[] = [];
    const elementTypes: string[] = [];

    // Columnas
    for (let i = 0; i < baseNodeIds.length; i++) {
      elements.push([baseNodeIds[i], colTopNodes[i]]);
      elementTypes.push('col');
    }

    // Shells (Quad4)
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const n1 = nodeGrid.get(`${i},${j}`)!;
        const n2 = nodeGrid.get(`${i + 1},${j}`)!;
        const n3 = nodeGrid.get(`${i + 1},${j + 1}`)!;
        const n4 = nodeGrid.get(`${i},${j + 1}`)!;
        elements.push([n1, n2, n3, n4]);
        elementTypes.push('shell');
      }
    }

    console.log("\n=== MODELO 3: Portico + Losa + Voladizos ===");
    console.log(`Portico: ${Lx}m x ${Ly}m, H=${H}m`);
    console.log(`Losa: ${(x_max - x_min).toFixed(1)}m x ${(y_max - y_min).toFixed(1)}m, t=${slab_t * 100}cm`);
    console.log(`Voladizo: ${voladizo}m en cada direccion`);
    console.log(`Nodos: ${nodes.length}, Elementos: ${elements.length}`);

    // Apoyos
    const supports = new Map<number, boolean[]>();
    for (const nodeId of baseNodeIds) {
      supports.set(nodeId, [true, true, true, true, true, true]);
    }

    const nodeInputs: NodeInputs = { supports };

    // Propiedades
    const elasticities = new Map<number, number>();
    const areas = new Map<number, number>();
    const momentsZ = new Map<number, number>();
    const momentsY = new Map<number, number>();
    const shearModuli = new Map<number, number>();
    const torsional = new Map<number, number>();
    const thicknesses = new Map<number, number>();
    const poissons = new Map<number, number>();
    const densities = new Map<number, number>();

    elements.forEach((_, i) => {
      const type = elementTypes[i];
      elasticities.set(i, E);
      shearModuli.set(i, G);
      densities.set(i, rho);

      if (type === 'col') {
        areas.set(i, A_col);
        momentsZ.set(i, Iz_col);
        momentsY.set(i, Iy_col);
        torsional.set(i, J_col);
      } else if (type === 'shell') {
        thicknesses.set(i, slab_t);
        poissons.set(i, nu);
      }
    });

    const elementInputs: ElementInputs = {
      elasticities,
      areas,
      momentsOfInertiaZ: momentsZ,
      momentsOfInertiaY: momentsY,
      shearModuli,
      torsionalConstants: torsional,
      thicknesses,
      poissonsRatios: poissons,
    };

    const results = await modal(nodes, elements, nodeInputs, elementInputs, {
      densities,
      numModes: 12,
    });

    console.log("\nResultados Awatif:");
    results.frequencies.forEach((f, mode) => {
      const T = results.periods.get(mode) || 0;
      const mp = results.massParticipation.get(mode);
      console.log(
        `  Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(3)}Hz, ` +
        `UX=${((mp?.UX || 0) * 100).toFixed(1)}%, UY=${((mp?.UY || 0) * 100).toFixed(1)}%`
      );
    });

    expect(results.frequencies.size).toBeGreaterThan(0);

    // El primer modo deberia ser dominado por desplazamiento lateral
    const f1 = results.frequencies.get(1) || 0;
    expect(f1).toBeGreaterThan(0.1);
    expect(f1).toBeLessThan(50);
  });
});
