/**
 * Test: Modelo sra silvia - Vivienda real extraída de ETABS
 * Geometría: 100 nodos, 110 frames, 11 areas, 13 apoyos
 * Niveles: 0.0, 1.43, 2.16, 2.72, 3.22, 6.28, 7.48 m
 */
import { describe, it, expect } from "vitest";
import { analyze } from "@awatif/fem";
import type { Node, Element, AnalysisInputs } from "@awatif/fem";

// Datos extraídos de sra_silvia_extraido.json (simplificado para test)
// Usando solo frames de concreto (columnas y vigas principales)

describe("Modelo sra silvia", () => {
  // Propiedades del material - Concreto f'c = 210 kg/cm2
  const fc = 210; // kg/cm2
  const E = 15100 * Math.sqrt(fc) * 98066.5; // Pa ≈ 21.46 GPa
  const nu = 0.2;
  const G = E / (2 * (1 + nu));
  const rho = 2400; // kg/m3

  // Secciones
  const sections = {
    "C 30X30 cm": { b: 0.30, h: 0.30 }, // Columnas
    "C25X40": { b: 0.25, h: 0.40 }, // Columnas
    "V 25X30 cm": { b: 0.25, h: 0.30 }, // Vigas
    "VB 20X20 cm": { b: 0.20, h: 0.20 }, // Vigas secundarias
  };

  // Modelo simplificado: Pórtico principal con 4 columnas
  // Coordenadas de esquinas principales
  const nodes: Node[] = [
    // Base (z=0)
    [0, 0, 0], // 0
    [6.74, 0, 0], // 1
    [6.74, 10.21, 0], // 2
    [0, 10.21, 0], // 3
    // Nivel 1 (z=3.22)
    [0, 0, 3.22], // 4
    [6.74, 0, 3.22], // 5
    [6.74, 10.21, 3.22], // 6
    [0, 10.21, 3.22], // 7
  ];

  // Elementos: 4 columnas + 4 vigas
  const elements: Element[] = [
    // Columnas (vertical)
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
    // Vigas (horizontal en z=3.22)
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
  ];

  it("Análisis modal básico - solo frames", () => {
    // Sección columna 30x30
    const b = 0.30;
    const h = 0.30;
    const A = b * h;
    const Iy = (b * h ** 3) / 12;
    const Iz = (h * b ** 3) / 12;
    const J = 0.141 * Math.min(b, h) ** 4;

    const inputs: AnalysisInputs = {
      nodes,
      elements,
      supports: [
        [0, true, true, true, true, true, true],
        [1, true, true, true, true, true, true],
        [2, true, true, true, true, true, true],
        [3, true, true, true, true, true, true],
      ],
      sections: elements.map(() => ({
        area: A,
        Iy: Iy,
        Iz: Iz,
        J: J,
        E: E,
        G: G,
      })),
      materials: elements.map(() => ({
        E: E,
        G: G,
        density: rho,
      })),
      analysisType: "modal" as const,
      numModes: 6,
    };

    const result = analyze(inputs);

    console.log("\n=== SRA SILVIA - MODELO SIMPLIFICADO ===");
    console.log(`E = ${(E / 1e9).toFixed(2)} GPa`);
    console.log(`rho = ${rho} kg/m3`);
    console.log(`Columnas: ${b * 100}x${h * 100} cm`);
    console.log(`Nodos: ${nodes.length}, Elementos: ${elements.length}`);

    if (result.eigenvalues) {
      console.log("\nModos de vibración:");
      console.log("-".repeat(35));

      for (let i = 0; i < Math.min(6, result.eigenvalues.length); i++) {
        const omega = Math.sqrt(result.eigenvalues[i]);
        const f = omega / (2 * Math.PI);
        const T = 1 / f;
        console.log(`Mode ${i + 1}: T = ${T.toFixed(4)}s, f = ${f.toFixed(4)}Hz`);
      }
    }

    expect(result.eigenvalues).toBeDefined();
    expect(result.eigenvalues!.length).toBeGreaterThan(0);

    // El primer modo debería ser razonable para un pórtico de ~3m
    // T esperado entre 0.1 y 1.0 segundos
    const omega1 = Math.sqrt(result.eigenvalues![0]);
    const T1 = (2 * Math.PI) / omega1;
    expect(T1).toBeGreaterThan(0.05);
    expect(T1).toBeLessThan(2.0);
  });

  it("Análisis modal con vigas diferentes", () => {
    // Sección columna 30x30
    const col = { b: 0.30, h: 0.30 };
    const A_col = col.b * col.h;
    const Iy_col = (col.b * col.h ** 3) / 12;
    const Iz_col = (col.h * col.b ** 3) / 12;
    const J_col = 0.141 * Math.min(col.b, col.h) ** 4;

    // Sección viga 25x30
    const viga = { b: 0.25, h: 0.30 };
    const A_viga = viga.b * viga.h;
    const Iy_viga = (viga.b * viga.h ** 3) / 12;
    const Iz_viga = (viga.h * viga.b ** 3) / 12;
    const J_viga = 0.141 * Math.min(viga.b, viga.h) ** 4;

    const inputs: AnalysisInputs = {
      nodes,
      elements,
      supports: [
        [0, true, true, true, true, true, true],
        [1, true, true, true, true, true, true],
        [2, true, true, true, true, true, true],
        [3, true, true, true, true, true, true],
      ],
      sections: elements.map((_, i) => {
        // Primeros 4 son columnas, siguientes 4 son vigas
        const isColumn = i < 4;
        return {
          area: isColumn ? A_col : A_viga,
          Iy: isColumn ? Iy_col : Iy_viga,
          Iz: isColumn ? Iz_col : Iz_viga,
          J: isColumn ? J_col : J_viga,
          E: E,
          G: G,
        };
      }),
      materials: elements.map(() => ({
        E: E,
        G: G,
        density: rho,
      })),
      analysisType: "modal" as const,
      numModes: 6,
    };

    const result = analyze(inputs);

    console.log("\n=== SRA SILVIA - CON VIGAS 25x30 ===");

    if (result.eigenvalues) {
      for (let i = 0; i < Math.min(6, result.eigenvalues.length); i++) {
        const omega = Math.sqrt(result.eigenvalues[i]);
        const f = omega / (2 * Math.PI);
        const T = 1 / f;
        console.log(`Mode ${i + 1}: T = ${T.toFixed(4)}s, f = ${f.toFixed(4)}Hz`);
      }
    }

    expect(result.eigenvalues).toBeDefined();
  });
});
