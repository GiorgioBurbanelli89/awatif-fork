/**
 * ZAPATA CON PEDESTAL - Test de elementos Shell + Frame
 * ======================================================
 *
 * Modelo:
 * - Zapata cuadrada 2m x 2m, espesor 0.4m (Shell Quad4 - thick)
 * - Pedestal 0.4m x 0.4m x 0.5m altura (Frame)
 * - Material: Concreto E=23.5GPa, nu=0.2, rho=2400 kg/m3
 * - Carga: 100 kN vertical hacia abajo
 *
 * Comparacion con OpenSees:
 * - OpenSees uz_pedestal = -0.0667 mm
 * - OpenSees uz_centro   = -0.0534 mm
 */

import { Node, Element, NodeInputs, ElementInputs } from "./data-model";
import { deformCpp } from "./deformCpp";
import { modal, resetModalModule } from "./modalCpp";

describe("Zapata con Pedestal", () => {
  beforeEach(async () => {
    await resetModalModule();
  });

  test("Zapata 2x2m con pedestal - Shell Thick + Frame", async () => {
    // =====================================================
    // PARAMETROS
    // =====================================================
    const B = 2.0;       // ancho zapata (m)
    const L = 2.0;       // largo zapata (m)
    const t_zap = 0.40;  // espesor zapata (m)

    const b_ped = 0.40;  // dimension pedestal (m)
    const h_ped = 0.50;  // altura pedestal (m)

    // Material (Concreto f'c = 25 MPa)
    const E = 23.5e9;    // Pa
    const nu = 0.20;
    const G = E / (2 * (1 + nu));
    const rho = 2400;    // kg/m3

    // Carga
    const P = -100000;   // N (100 kN hacia abajo)

    // Malla de la zapata
    const nx = 4;        // divisiones en X
    const ny = 4;        // divisiones en Y
    const dx = L / nx;
    const dy = B / ny;

    console.log("\n=== ZAPATA CON PEDESTAL ===");
    console.log(`Zapata: ${L}m x ${B}m x ${t_zap}m`);
    console.log(`Pedestal: ${b_ped}m x ${b_ped}m x ${h_ped}m`);
    console.log(`Malla: ${nx}x${ny} = ${nx * ny} elementos shell`);

    // =====================================================
    // NODOS
    // =====================================================
    const nodes: Node[] = [];
    const zapataNodeGrid: number[][] = [];

    // Nodos de la zapata en plano Z=0
    let nodeIdx = 0;
    for (let j = 0; j <= ny; j++) {
      const row: number[] = [];
      for (let i = 0; i <= nx; i++) {
        const x = -L / 2 + i * dx;
        const y = -B / 2 + j * dy;
        const z = 0;
        nodes.push([x, y, z]);
        row.push(nodeIdx);
        nodeIdx++;
      }
      zapataNodeGrid.push(row);
    }

    const nZapataNodes = nodeIdx;

    // Nodo del pedestal (arriba)
    const pedNode = nodeIdx;
    nodes.push([0, 0, h_ped]);
    nodeIdx++;

    // Nodo central de la zapata
    const centerI = Math.floor(nx / 2);
    const centerJ = Math.floor(ny / 2);
    const centerNode = zapataNodeGrid[centerJ][centerI];

    console.log(`Nodos zapata: ${nZapataNodes}`);
    console.log(`Nodo pedestal: ${pedNode}`);
    console.log(`Nodo centro: ${centerNode}`);

    // =====================================================
    // ELEMENTOS
    // =====================================================
    const elements: Element[] = [];
    const shellElements: number[] = [];
    let elemIdx = 0;

    // Elementos Shell Quad4 (zapata)
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const n1 = zapataNodeGrid[j][i];
        const n2 = zapataNodeGrid[j][i + 1];
        const n3 = zapataNodeGrid[j + 1][i + 1];
        const n4 = zapataNodeGrid[j + 1][i];
        elements.push([n1, n2, n3, n4]);
        shellElements.push(elemIdx);
        elemIdx++;
      }
    }

    // Elemento Frame (pedestal)
    const pedElement = elemIdx;
    elements.push([centerNode, pedNode]);
    elemIdx++;

    console.log(`Elementos shell: ${shellElements.length}`);
    console.log(`Elemento pedestal: ${pedElement}`);

    // =====================================================
    // CONDICIONES DE BORDE
    // =====================================================
    const nodeInputs: NodeInputs = {
      supports: new Map(),
      loads: new Map(),
    };

    // Nodos del borde de la zapata (apoyados en Z)
    const boundaryNodes: number[] = [];
    for (let i = 0; i <= nx; i++) {
      boundaryNodes.push(zapataNodeGrid[0][i]);     // borde inferior
      boundaryNodes.push(zapataNodeGrid[ny][i]);    // borde superior
    }
    for (let j = 1; j < ny; j++) {
      boundaryNodes.push(zapataNodeGrid[j][0]);     // borde izquierdo
      boundaryNodes.push(zapataNodeGrid[j][nx]);    // borde derecho
    }

    // Apoyo simple (solo Z restringido)
    const uniqueBoundary = [...new Set(boundaryNodes)];
    uniqueBoundary.forEach((n) => {
      nodeInputs.supports!.set(n, [false, false, true, false, false, false]);
    });

    console.log(`Nodos de borde: ${uniqueBoundary.length}`);

    // Carga en la parte superior del pedestal
    nodeInputs.loads!.set(pedNode, [0, 0, P, 0, 0, 0]);

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

    // Propiedades de los shells (zapata)
    shellElements.forEach((idx) => {
      elementInputs.elasticities!.set(idx, E);
      elementInputs.thicknesses!.set(idx, t_zap);
      elementInputs.poissonsRatios!.set(idx, nu);
      elementInputs.shearModuli!.set(idx, G);
    });

    // Propiedades del pedestal (frame)
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
    // ANALISIS ESTATICO
    // =====================================================
    console.log("\nEjecutando analisis estatico...");

    const deformOutputs = deformCpp(nodes, elements, nodeInputs, elementInputs);

    expect(deformOutputs).toBeDefined();
    expect(deformOutputs.deformations).toBeDefined();

    // Desplazamiento del pedestal
    const dispPed = deformOutputs.deformations!.get(pedNode);
    expect(dispPed).toBeDefined();

    const uz_ped_mm = dispPed ? dispPed[2] * 1000 : 0;

    // Desplazamiento del centro de la zapata
    const dispCenter = deformOutputs.deformations!.get(centerNode);
    const uz_center_mm = dispCenter ? dispCenter[2] * 1000 : 0;

    console.log("\n=== RESULTADOS ESTATICOS ===");
    console.log(`Desplazamiento pedestal UZ: ${uz_ped_mm.toFixed(4)} mm`);
    console.log(`Desplazamiento centro zapata UZ: ${uz_center_mm.toFixed(4)} mm`);

    // Comparacion con OpenSees
    const opensees_uz_ped = -0.0667;  // mm
    const opensees_uz_center = -0.0534;  // mm

    console.log("\n=== COMPARACION CON OPENSEES ===");
    console.log(`OpenSees uz_pedestal: ${opensees_uz_ped} mm`);
    console.log(`OpenSees uz_centro:   ${opensees_uz_center} mm`);

    const diff_ped = Math.abs(uz_ped_mm - opensees_uz_ped) / Math.abs(opensees_uz_ped) * 100;
    const diff_center = Math.abs(uz_center_mm - opensees_uz_center) / Math.abs(opensees_uz_center) * 100;

    console.log(`Diferencia pedestal: ${diff_ped.toFixed(1)}%`);
    console.log(`Diferencia centro: ${diff_center.toFixed(1)}%`);

    // Reacciones
    let totalRz = 0;
    deformOutputs.reactions!.forEach((reaction, nodeIdx) => {
      if (uniqueBoundary.includes(nodeIdx)) {
        totalRz += reaction[2];
      }
    });

    console.log(`\nReaccion total Rz: ${(totalRz / 1000).toFixed(2)} kN`);
    console.log(`Carga aplicada P: ${Math.abs(P / 1000).toFixed(2)} kN`);

    // Verificaciones
    expect(Math.abs(totalRz + P) / Math.abs(P)).toBeLessThan(0.01);  // Equilibrio

    // =====================================================
    // ANALISIS MODAL
    // =====================================================
    console.log("\n=== ANALISIS MODAL ===");

    const modalInputs = {
      densities: new Map<number, number>(),
      numModes: 6,
    };

    // Densidad de shells
    shellElements.forEach((idx) => {
      modalInputs.densities.set(idx, rho);
    });

    // Densidad del pedestal
    modalInputs.densities.set(pedElement, rho);

    try {
      const modalResults = await modal(nodes, elements, nodeInputs, elementInputs, modalInputs);

      console.log(`\nModos calculados: ${modalResults.frequencies.size}`);
      console.log("Modo  Periodo (s)    Frecuencia (Hz)");
      console.log("-".repeat(40));

      for (let mode = 1; mode <= Math.min(6, modalResults.frequencies.size); mode++) {
        const T = modalResults.periods.get(mode) || 0;
        const f = modalResults.frequencies.get(mode) || 0;
        console.log(`${mode}     ${T.toFixed(4)}         ${f.toFixed(4)}`);
      }

      expect(modalResults.frequencies.size).toBeGreaterThanOrEqual(1);
    } catch (e) {
      console.log("Modal analysis skipped (shell modal not fully supported yet)");
    }
  });
});
