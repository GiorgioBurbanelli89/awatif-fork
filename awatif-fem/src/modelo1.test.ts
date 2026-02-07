/**
 * MODELO 1: Columna + Viga en Voladizo
 * Para comparar ETABS vs OpenSees vs Awatif
 *
 * Geometria:
 * - 1 columna de 3m de altura
 * - 1 viga en voladizo de 1.5m
 */

import { describe, it, expect } from "vitest";
import { modal, resetModalModule } from "./modalCpp";
import { Node, Element, NodeInputs, ElementInputs } from "./data-model";

describe("Modelo 1: Columna + Voladizo", () => {
  it("should compute modal frequencies for column with cantilever", async () => {
    await resetModalModule();

    // Propiedades del material (SI: Pa, kg, m)
    const fc = 210; // kg/cm2
    const E_kgcm2 = 15100 * Math.sqrt(fc);
    const E = E_kgcm2 * 98066.5; // Pa
    const nu = 0.2;
    const G = E / (2 * (1 + nu));
    const rho = 2400; // kg/m3

    // Secciones
    const col_b = 0.30, col_h = 0.30;
    const beam_b = 0.25, beam_h = 0.40;

    const A_col = col_b * col_h;
    const Iz_col = col_b * Math.pow(col_h, 3) / 12;
    const Iy_col = col_h * Math.pow(col_b, 3) / 12;
    const J_col = 0.141 * Math.pow(Math.min(col_b, col_h), 4);

    const A_beam = beam_b * beam_h;
    // Iy = para flexion vertical (la grande)
    const Iy_beam = beam_b * Math.pow(beam_h, 3) / 12;
    // Iz = para flexion horizontal (la pequena)
    const Iz_beam = beam_h * Math.pow(beam_b, 3) / 12;
    const J_beam = 0.141 * Math.pow(Math.min(beam_b, beam_h), 4);

    // Geometria
    const H = 3.0;
    const voladizo = 1.5;

    const nodes: Node[] = [
      [0.0, 0.0, 0.0],   // 0: Base
      [0.0, 0.0, H],     // 1: Tope columna
      [voladizo, 0.0, H] // 2: Extremo voladizo
    ];

    const elements: Element[] = [
      [0, 1], // Columna
      [1, 2]  // Voladizo
    ];

    const elementTypes = ['col', 'beam'];

    // Apoyos
    const supports = new Map<number, boolean[]>();
    supports.set(0, [true, true, true, true, true, true]);

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
      const isCol = elementTypes[i] === 'col';
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

    console.log("\n=== MODELO 1: Columna + Voladizo ===");
    console.log(`Columna: H=${H}m, voladizo: L=${voladizo}m`);
    console.log(`E = ${(E/1e9).toFixed(2)} GPa`);

    const results = await modal(nodes, elements, nodeInputs, elementInputs, {
      densities,
      numModes: 6,
    });

    console.log("\nResultados Awatif:");
    results.frequencies.forEach((f, mode) => {
      const T = results.periods.get(mode) || 0;
      console.log(`  Mode ${mode}: T=${T.toFixed(4)}s, f=${f.toFixed(3)}Hz`);
    });

    // Verificaciones basicas
    expect(results.frequencies.size).toBeGreaterThan(0);
    const f1 = results.frequencies.get(1) || 0;
    expect(f1).toBeGreaterThan(0.5);
    expect(f1).toBeLessThan(50);
  });
});
