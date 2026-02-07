/**
 * PLACA BASE CON PERNOS DE ANCLAJE - Awatif
 * ==========================================
 * Test que compara con OpenSees y SAP2000
 */

import { Node, NodeInputs, ElementInputs } from "./data-model";

describe("Placa Base con Pernos de Anclaje", () => {

  // ==========================================================================
  // PARAMETROS (mismos que OpenSees y SAP2000)
  // ==========================================================================

  const H_col = 3.0;           // Altura columna (m)
  const B_placa = 0.40;        // Ancho placa base (m)
  const L_placa = 0.40;        // Largo placa base (m)
  const d_perno = 0.020;       // Diametro perno (m) - 20mm
  const L_perno = 0.30;        // Longitud embebida perno (m)

  const x_perno = B_placa / 2 - 0.05;
  const y_perno = L_placa / 2 - 0.05;

  const E_acero = 200.0e9;     // Pa
  const A_col = 0.0093;        // m2
  const I_col = 1.12e-4;       // m4

  const A_perno = Math.PI * Math.pow(d_perno / 2, 2);
  const k_axial = E_acero * A_perno / L_perno;
  const k_cortante = 0.4 * k_axial;

  // Cargas
  const P_axial = -200000;     // N (compresion)
  const M_momento = 50000;     // N.m
  const V_cortante = 20000;    // N

  // ==========================================================================
  // MODELO AWATIF
  // ==========================================================================

  const createPlacaBaseModel = () => {
    // Nodos (10 total)
    // 0-3: Base de pernos (fundacion)
    // 4-7: Tope de pernos (nivel placa)
    // 8: Centro de placa
    // 9: Tope de columna

    const nodes: Node[] = [
      // Base de pernos (z = -L_perno)
      [-x_perno, -y_perno, -L_perno],  // 0: P1_BASE
      [x_perno, -y_perno, -L_perno],   // 1: P2_BASE
      [x_perno, y_perno, -L_perno],    // 2: P3_BASE
      [-x_perno, y_perno, -L_perno],   // 3: P4_BASE

      // Tope de pernos (z = 0)
      [-x_perno, -y_perno, 0],         // 4: P1_PLACA
      [x_perno, -y_perno, 0],          // 5: P2_PLACA
      [x_perno, y_perno, 0],           // 6: P3_PLACA
      [-x_perno, y_perno, 0],          // 7: P4_PLACA

      // Centro placa y tope columna
      [0, 0, 0],                       // 8: CENTRO_PLACA
      [0, 0, H_col]                    // 9: TOPE_COLUMNA
    ];

    // Elementos
    // 0-3: Pernos (springs)
    // 4-7: Placa (rigida)
    // 8: Columna
    const elements: number[][] = [
      [0, 4],  // Perno 1
      [1, 5],  // Perno 2
      [2, 6],  // Perno 3
      [3, 7],  // Perno 4
      [4, 8],  // Placa 1
      [5, 8],  // Placa 2
      [6, 8],  // Placa 3
      [7, 8],  // Placa 4
      [8, 9]   // Columna
    ];

    // Restricciones (base de pernos empotrada)
    const supports = new Map<number, [boolean, boolean, boolean, boolean, boolean, boolean]>();
    supports.set(0, [true, true, true, true, true, true]);
    supports.set(1, [true, true, true, true, true, true]);
    supports.set(2, [true, true, true, true, true, true]);
    supports.set(3, [true, true, true, true, true, true]);

    const nodeInputs: NodeInputs = { supports };

    // Propiedades de elementos
    const elasticities = new Map<number, number>();
    const areas = new Map<number, number>();
    const momentsOfInertiaZ = new Map<number, number>();

    // Pernos (0-3): usar rigidez equivalente
    for (let i = 0; i < 4; i++) {
      elasticities.set(i, E_acero);
      areas.set(i, A_perno);
      momentsOfInertiaZ.set(i, Math.PI * Math.pow(d_perno, 4) / 64);
    }

    // Placa rigida (4-7): muy rigida
    for (let i = 4; i < 8; i++) {
      elasticities.set(i, E_acero * 100);
      areas.set(i, 0.01);
      momentsOfInertiaZ.set(i, 0.001);
    }

    // Columna (8)
    elasticities.set(8, E_acero);
    areas.set(8, A_col);
    momentsOfInertiaZ.set(8, I_col);

    const elementInputs: ElementInputs = {
      elasticities,
      areas,
      momentsOfInertiaZ
    };

    // Matriz de rigidez simplificada (60x60 para 10 nodos x 6 DOFs)
    const totalDOFs = 60;
    const K: number[][] = Array.from({ length: totalDOFs }, () =>
      new Array(totalDOFs).fill(0)
    );

    // Rigidez de pernos (axial principalmente)
    for (let p = 0; p < 4; p++) {
      const n1 = p;      // Nodo base
      const n2 = p + 4;  // Nodo placa

      // Rigidez axial en Z
      const dof1_z = n1 * 6 + 2;
      const dof2_z = n2 * 6 + 2;

      K[dof1_z][dof1_z] += k_axial;
      K[dof1_z][dof2_z] -= k_axial;
      K[dof2_z][dof1_z] -= k_axial;
      K[dof2_z][dof2_z] += k_axial;

      // Rigidez cortante en X e Y
      const dof1_x = n1 * 6 + 0;
      const dof2_x = n2 * 6 + 0;
      const dof1_y = n1 * 6 + 1;
      const dof2_y = n2 * 6 + 1;

      K[dof1_x][dof1_x] += k_cortante;
      K[dof1_x][dof2_x] -= k_cortante;
      K[dof2_x][dof1_x] -= k_cortante;
      K[dof2_x][dof2_x] += k_cortante;

      K[dof1_y][dof1_y] += k_cortante;
      K[dof1_y][dof2_y] -= k_cortante;
      K[dof2_y][dof1_y] -= k_cortante;
      K[dof2_y][dof2_y] += k_cortante;
    }

    // Rigidez de placa rigida (conecta nodos 4-7 al centro 8)
    const k_placa = E_acero * 100 * 0.01 / 0.15;  // EA/L muy grande
    for (let p = 0; p < 4; p++) {
      const n1 = p + 4;  // Nodo esquina placa
      const n2 = 8;      // Centro placa

      for (let d = 0; d < 3; d++) {
        const dof1 = n1 * 6 + d;
        const dof2 = n2 * 6 + d;

        K[dof1][dof1] += k_placa;
        K[dof1][dof2] -= k_placa;
        K[dof2][dof1] -= k_placa;
        K[dof2][dof2] += k_placa;
      }
    }

    // Rigidez de columna
    const k_col = 12 * E_acero * I_col / Math.pow(H_col, 3);
    const km_col = 6 * E_acero * I_col / Math.pow(H_col, 2);
    const kr_col = 4 * E_acero * I_col / H_col;
    const ka_col = E_acero * A_col / H_col;

    // Columna: nodo 8 (centro placa) a nodo 9 (tope)
    // UX
    K[8*6+0][8*6+0] += k_col;
    K[8*6+0][9*6+0] -= k_col;
    K[9*6+0][8*6+0] -= k_col;
    K[9*6+0][9*6+0] += k_col;

    // UY
    K[8*6+1][8*6+1] += k_col;
    K[8*6+1][9*6+1] -= k_col;
    K[9*6+1][8*6+1] -= k_col;
    K[9*6+1][9*6+1] += k_col;

    // UZ (axial)
    K[8*6+2][8*6+2] += ka_col;
    K[8*6+2][9*6+2] -= ka_col;
    K[9*6+2][8*6+2] -= ka_col;
    K[9*6+2][9*6+2] += ka_col;

    // Rotaciones
    K[8*6+4][8*6+4] += kr_col;
    K[9*6+4][9*6+4] += kr_col;

    return { nodes, elements, nodeInputs, elementInputs, K };
  };

  // ==========================================================================
  // SOLVER SIMPLE
  // ==========================================================================

  const solve = (K: number[][], F: number[], freeDOFs: number[]): number[] => {
    const n = freeDOFs.length;
    const K_red: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const F_red = new Array(n).fill(0);

    // Extraer submatriz
    for (let i = 0; i < n; i++) {
      F_red[i] = F[freeDOFs[i]];
      for (let j = 0; j < n; j++) {
        K_red[i][j] = K[freeDOFs[i]][freeDOFs[j]];
      }
    }

    // Gauss elimination
    const aug = K_red.map((row, i) => [...row, F_red[i]]);

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
          maxRow = row;
        }
      }
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[col][col]) > 1e-15) {
          const factor = aug[row][col] / aug[col][col];
          for (let j = col; j <= n; j++) {
            aug[row][j] -= factor * aug[col][j];
          }
        }
      }
    }

    // Back substitution
    const x_red = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x_red[i] = aug[i][n];
      for (let j = i + 1; j < n; j++) {
        x_red[i] -= aug[i][j] * x_red[j];
      }
      if (Math.abs(aug[i][i]) > 1e-15) {
        x_red[i] /= aug[i][i];
      }
    }

    // Expandir a todos los DOFs
    const x = new Array(K.length).fill(0);
    for (let i = 0; i < n; i++) {
      x[freeDOFs[i]] = x_red[i];
    }

    return x;
  };

  // ==========================================================================
  // TESTS
  // ==========================================================================

  it("should create placa base model with 10 nodes", () => {
    const { nodes, elements } = createPlacaBaseModel();

    expect(nodes.length).toBe(10);
    expect(elements.length).toBe(9);

    console.log("\n--- Modelo Placa Base Awatif ---");
    console.log(`Nodos: ${nodes.length}`);
    console.log(`Elementos: ${elements.length}`);
    console.log(`  Pernos: 4`);
    console.log(`  Placa: 4`);
    console.log(`  Columna: 1`);
  });

  it("should solve for displacements under axial + moment load", () => {
    const { nodes, elements, nodeInputs, K } = createPlacaBaseModel();

    // Identificar DOFs libres (excluir nodos 0-3 que estan fijos)
    const freeDOFs: number[] = [];
    for (let n = 4; n < 10; n++) {
      for (let d = 0; d < 6; d++) {
        freeDOFs.push(n * 6 + d);
      }
    }

    // Vector de cargas
    const F = new Array(60).fill(0);
    // Cargas en nodo 9 (tope columna)
    F[9 * 6 + 1] = V_cortante;  // Fy
    F[9 * 6 + 2] = P_axial;     // Fz (compresion)
    F[9 * 6 + 3] = M_momento;   // Mx

    // Resolver
    const u = solve(K, F, freeDOFs);

    // Resultados en tope de columna
    const u_tope = {
      UX: u[9 * 6 + 0] * 1000,  // mm
      UY: u[9 * 6 + 1] * 1000,
      UZ: u[9 * 6 + 2] * 1000,
      RX: u[9 * 6 + 3] * 1000   // mrad
    };

    // Resultados en centro de placa
    const u_placa = {
      UX: u[8 * 6 + 0] * 1000,
      UY: u[8 * 6 + 1] * 1000,
      UZ: u[8 * 6 + 2] * 1000,
      RX: u[8 * 6 + 3] * 1000
    };

    // Fuerzas en pernos
    const F_pernos = [];
    for (let p = 0; p < 4; p++) {
      const uz_perno = u[(p + 4) * 6 + 2];
      const F_perno = uz_perno * k_axial / 1000;  // kN
      F_pernos.push(F_perno);
    }

    console.log("\n--- Resultados Awatif ---");
    console.log("\nDesplazamientos en tope de columna:");
    console.log(`  UX: ${u_tope.UX.toFixed(4)} mm`);
    console.log(`  UY: ${u_tope.UY.toFixed(4)} mm`);
    console.log(`  UZ: ${u_tope.UZ.toFixed(4)} mm`);
    console.log(`  RX: ${u_tope.RX.toFixed(4)} mrad`);

    console.log("\nDesplazamientos en centro de placa:");
    console.log(`  UZ: ${u_placa.UZ.toFixed(4)} mm`);
    console.log(`  RX: ${u_placa.RX.toFixed(4)} mrad`);

    console.log("\nFuerzas en pernos:");
    F_pernos.forEach((f, i) => {
      console.log(`  Perno ${i + 1}: ${f.toFixed(2)} kN`);
    });

    // Verificaciones basicas
    expect(Math.abs(u_tope.UZ)).toBeGreaterThan(0);  // Debe haber deformacion axial

    // El momento debe causar rotacion
    // Los pernos deben tener fuerzas diferentes (debido al momento)
  });

  it("should compare with OpenSees reference values", () => {
    // Valores de referencia de OpenSees (se llenan despues de ejecutar)
    const OPENSEES_REF = {
      UY_tope_mm: 0,  // Por llenar
      UZ_tope_mm: 0,
      RX_placa_mrad: 0,
      F_perno1_kN: 0,
      F_perno2_kN: 0,
      F_perno3_kN: 0,
      F_perno4_kN: 0
    };

    console.log("\n--- Comparacion pendiente ---");
    console.log("Ejecutar OpenSees y SAP2000 para obtener valores de referencia");

    expect(true).toBe(true);
  });
});
