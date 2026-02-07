// Modal Spectral Analysis - NEC-SE-DS Ecuador
// Combinaciones: SRSS (raiz cuadrada suma cuadrados) y CQC (combinacion cuadratica completa)

import { necSpectrum, NECSpectrumParams } from "./nec-spectrum";

export type CombinationMethod = 'SRSS' | 'CQC';

export interface ModalResults {
  // Por modo
  frequencies: number[];      // Hz
  periods: number[];          // s
  angularFrequencies: number[]; // rad/s
  modeShapes: number[][];     // [modo][gdl]
  participationFactors: number[];  // Γn
  effectiveMasses: number[];  // M*n (kg o kN·s²/m)
  massParticipation: number[]; // % de masa total

  // Respuestas espectrales por modo
  spectralAccelerations: number[]; // Sa(Tn) en g
  modalDisplacements: number[][];  // [modo][gdl]
  modalForces: number[][];         // [modo][piso]
  modalShears: number[][];         // [modo][piso]

  // Respuestas combinadas
  combinedDisplacements: number[]; // [gdl]
  combinedForces: number[];        // [piso]
  combinedShears: number[];        // [piso]
  baseShear: number;               // Cortante basal combinado
}

// Coeficiente de correlacion para CQC (Der Kiureghian)
export function cqcCorrelation(
  omegaI: number,
  omegaJ: number,
  xiI: number = 0.05,
  xiJ: number = 0.05
): number {
  const r = omegaI / omegaJ;
  const xi = xiI; // Asumiendo mismo amortiguamiento

  const num = 8 * Math.sqrt(xiI * xiJ) * (xiI + r * xiJ) * Math.pow(r, 1.5);
  const den = Math.pow(1 - r * r, 2) +
              4 * xiI * xiJ * r * (1 + r * r) +
              4 * (xiI * xiI + xiJ * xiJ) * r * r;

  if (Math.abs(den) < 1e-10) return 1.0; // Modos identicos
  return num / den;
}

// Combinacion SRSS: R = sqrt(sum(Ri^2))
export function combineSRSS(responses: number[]): number {
  return Math.sqrt(responses.reduce((sum, r) => sum + r * r, 0));
}

// Combinacion CQC: R = sqrt(sum_i sum_j rho_ij * Ri * Rj)
export function combineCQC(
  responses: number[],
  angularFrequencies: number[],
  damping: number = 0.05
): number {
  const n = responses.length;
  let sum = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const rho = cqcCorrelation(
        angularFrequencies[i],
        angularFrequencies[j],
        damping,
        damping
      );
      sum += rho * responses[i] * responses[j];
    }
  }

  return Math.sqrt(Math.abs(sum));
}

// Combinar respuestas modales
export function combineModalResponses(
  modalResponses: number[][],  // [modo][componente]
  angularFrequencies: number[],
  method: CombinationMethod = 'CQC',
  damping: number = 0.05
): number[] {
  const numModes = modalResponses.length;
  if (numModes === 0) return [];

  const numComponents = modalResponses[0].length;
  const combined: number[] = [];

  for (let c = 0; c < numComponents; c++) {
    const componentResponses = modalResponses.map(mode => mode[c]);

    if (method === 'SRSS') {
      combined.push(combineSRSS(componentResponses));
    } else {
      combined.push(combineCQC(componentResponses, angularFrequencies, damping));
    }
  }

  return combined;
}

// Calcular factor de participacion modal
// Gamma_n = (phi_n^T * M * r) / (phi_n^T * M * phi_n)
// donde r es el vector de influencia (1s para direccion horizontal)
export function calculateParticipationFactor(
  modeShape: number[],  // Forma modal normalizada
  masses: number[],     // Masas por GDL
  influenceVector: number[] // Vector de influencia (tipicamente [1,1,1,...])
): number {
  const n = modeShape.length;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += modeShape[i] * masses[i] * influenceVector[i];
    denominator += modeShape[i] * masses[i] * modeShape[i];
  }

  if (Math.abs(denominator) < 1e-10) return 0;
  return numerator / denominator;
}

// Calcular masa modal efectiva
// M*_n = (phi_n^T * M * r)^2 / (phi_n^T * M * phi_n)
export function calculateEffectiveMass(
  modeShape: number[],
  masses: number[],
  influenceVector: number[]
): number {
  const gamma = calculateParticipationFactor(modeShape, masses, influenceVector);

  let phiMPhi = 0;
  for (let i = 0; i < modeShape.length; i++) {
    phiMPhi += modeShape[i] * masses[i] * modeShape[i];
  }

  return gamma * gamma * phiMPhi;
}

// Calcular cortantes por piso para un modo
export function calculateModalStoryShears(
  modeShape: number[],    // Desplazamientos modales por piso
  masses: number[],       // Masas por piso
  gamma: number,          // Factor de participacion
  Sa: number,             // Aceleracion espectral (g)
  g: number = 9.81        // Gravedad m/s²
): { forces: number[], shears: number[] } {
  const n = modeShape.length;
  const forces: number[] = [];
  const shears: number[] = [];

  // Fuerzas por piso: F_i = Gamma * phi_i * m_i * Sa * g
  for (let i = 0; i < n; i++) {
    forces.push(gamma * modeShape[i] * masses[i] * Sa * g);
  }

  // Cortantes: V_i = sum(F_j) para j >= i
  for (let i = 0; i < n; i++) {
    let shear = 0;
    for (let j = i; j < n; j++) {
      shear += forces[j];
    }
    shears.push(shear);
  }

  return { forces, shears };
}

// Analisis modal espectral completo
export function modalSpectralAnalysis(
  frequencies: number[],      // Frecuencias naturales (Hz)
  modeShapes: number[][],     // Formas modales [modo][piso]
  floorMasses: number[],      // Masas por piso (kN*s²/m)
  spectrumParams: NECSpectrumParams,
  options: {
    method?: CombinationMethod;
    damping?: number;
    numModes?: number;        // Numero de modos a considerar
  } = {}
): ModalResults {
  const {
    method = 'CQC',
    damping = 0.05,
    numModes = Math.min(frequencies.length, floorMasses.length)
  } = options;

  const n = Math.min(numModes, frequencies.length);
  const numFloors = floorMasses.length;
  const totalMass = floorMasses.reduce((a, b) => a + b, 0);

  // Calculos por modo
  const periods: number[] = [];
  const angularFrequencies: number[] = [];
  const participationFactors: number[] = [];
  const effectiveMasses: number[] = [];
  const massParticipation: number[] = [];
  const spectralAccelerations: number[] = [];
  const modalForces: number[][] = [];
  const modalShears: number[][] = [];
  const modalDisplacements: number[][] = [];

  // Vector de influencia (1 para todos los pisos en direccion horizontal)
  const influenceVector = new Array(numFloors).fill(1);

  for (let mode = 0; mode < n; mode++) {
    const f = frequencies[mode];
    const T = 1 / f;
    const omega = 2 * Math.PI * f;
    const phi = modeShapes[mode];

    periods.push(T);
    angularFrequencies.push(omega);

    // Factor de participacion
    const gamma = calculateParticipationFactor(phi, floorMasses, influenceVector);
    participationFactors.push(gamma);

    // Masa modal efectiva
    const mEff = calculateEffectiveMass(phi, floorMasses, influenceVector);
    effectiveMasses.push(mEff);
    massParticipation.push((mEff / totalMass) * 100);

    // Aceleracion espectral
    const Sa = necSpectrum(T, spectrumParams);
    spectralAccelerations.push(Sa);

    // Fuerzas y cortantes modales
    const { forces, shears } = calculateModalStoryShears(phi, floorMasses, gamma, Sa);
    modalForces.push(forces);
    modalShears.push(shears);

    // Desplazamientos modales: u = Gamma * phi * Sa / omega²
    const modalDisp = phi.map(p => gamma * p * Sa * 9.81 / (omega * omega));
    modalDisplacements.push(modalDisp);
  }

  // Combinar respuestas
  const combinedForces = combineModalResponses(modalForces, angularFrequencies, method, damping);
  const combinedShears = combineModalResponses(modalShears, angularFrequencies, method, damping);
  const combinedDisplacements = combineModalResponses(modalDisplacements, angularFrequencies, method, damping);

  // Cortante basal = cortante en el primer piso
  const baseShear = combinedShears[0] || 0;

  return {
    frequencies: frequencies.slice(0, n),
    periods,
    angularFrequencies,
    modeShapes: modeShapes.slice(0, n),
    participationFactors,
    effectiveMasses,
    massParticipation,
    spectralAccelerations,
    modalDisplacements,
    modalForces,
    modalShears,
    combinedDisplacements,
    combinedForces,
    combinedShears,
    baseShear,
  };
}

// Informacion del analisis modal
export function getModalAnalysisInfo(results: ModalResults, method: CombinationMethod): string {
  const lines: string[] = [
    `\nANALISIS MODAL ESPECTRAL (${method})`,
    '=' .repeat(40),
    '\nMODOS DE VIBRACION:',
  ];

  for (let i = 0; i < results.periods.length; i++) {
    lines.push(
      `  Modo ${i + 1}: T=${results.periods[i].toFixed(3)}s, ` +
      `f=${results.frequencies[i].toFixed(2)}Hz, ` +
      `M*=${results.massParticipation[i].toFixed(1)}%`
    );
  }

  const totalMassParticipation = results.massParticipation.reduce((a, b) => a + b, 0);
  lines.push(`\n  Masa total participante: ${totalMassParticipation.toFixed(1)}%`);

  lines.push('\nRESPUESTAS COMBINADAS:');
  lines.push(`  Cortante Basal V = ${results.baseShear.toFixed(2)} kN`);

  lines.push('\nCORTANTES POR PISO:');
  results.combinedShears.forEach((v, i) => {
    lines.push(`  Piso ${i + 1}: V = ${v.toFixed(2)} kN`);
  });

  return lines.join('\n');
}

// Comparar analisis estatico vs dinamico
export function compareStaticVsDynamic(
  staticBaseShear: number,
  dynamicBaseShear: number,
  staticForces: number[],
  dynamicForces: number[]
): string {
  const ratio = dynamicBaseShear / staticBaseShear;

  const lines: string[] = [
    '\nCOMPARACION ESTATICO vs DINAMICO',
    '=' .repeat(40),
    `  V_estatico  = ${staticBaseShear.toFixed(2)} kN`,
    `  V_dinamico  = ${dynamicBaseShear.toFixed(2)} kN`,
    `  Ratio V_din/V_est = ${ratio.toFixed(3)}`,
    '',
    'FUERZAS POR PISO:',
    '  Piso    Estatico    Dinamico    Ratio',
  ];

  for (let i = 0; i < staticForces.length; i++) {
    const r = dynamicForces[i] / staticForces[i];
    lines.push(
      `  ${(i + 1).toString().padStart(4)}    ` +
      `${staticForces[i].toFixed(1).padStart(8)} kN    ` +
      `${dynamicForces[i].toFixed(1).padStart(8)} kN    ` +
      `${r.toFixed(3)}`
    );
  }

  return lines.join('\n');
}
