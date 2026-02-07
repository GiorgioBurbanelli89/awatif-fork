// NEC-SE-DS Ecuador Seismic Design Spectrum
// Norma Ecuatoriana de la Construccion - Peligro Sismico

export type SoilType = 'A' | 'B' | 'C' | 'D' | 'E';
export type Region = 'Costa' | 'Sierra' | 'Oriente';

// Zone factors (Z) reference values
const Z_VALUES = [0.15, 0.25, 0.30, 0.35, 0.40, 0.50] as const;

// Fa - Site amplification coefficient for short period
const FA_TABLE: Record<SoilType, number[]> = {
  'A': [0.90, 0.90, 0.90, 0.90, 0.90, 0.90],
  'B': [1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  'C': [1.40, 1.30, 1.25, 1.23, 1.20, 1.18],
  'D': [1.60, 1.40, 1.30, 1.25, 1.20, 1.12],
  'E': [1.80, 1.40, 1.25, 1.10, 1.00, 0.85],
};

// Fd - Displacement amplification coefficient
const FD_TABLE: Record<SoilType, number[]> = {
  'A': [0.90, 0.90, 0.90, 0.90, 0.90, 0.90],
  'B': [1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  'C': [1.36, 1.28, 1.19, 1.15, 1.11, 1.06],
  'D': [1.62, 1.45, 1.36, 1.28, 1.19, 1.11],
  'E': [2.10, 1.75, 1.70, 1.65, 1.60, 1.50],
};

// Fs - Soil nonlinear behavior coefficient
const FS_TABLE: Record<SoilType, number[]> = {
  'A': [0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
  'B': [0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
  'C': [0.85, 0.94, 1.02, 1.06, 1.11, 1.23],
  'D': [1.02, 1.06, 1.11, 1.19, 1.28, 1.40],
  'E': [1.50, 1.60, 1.70, 1.80, 1.90, 2.00],
};

// Eta (n) - Spectral amplification ratio by region
const ETA_VALUES: Record<Region, number> = {
  'Costa': 1.80,    // Coastal provinces (except Esmeraldas)
  'Sierra': 2.48,   // Highland + Esmeraldas + Galapagos
  'Oriente': 2.60,  // Amazon region
};

// Interpolate coefficient from table
function interpolateCoefficient(table: number[], Z: number): number {
  if (Z <= 0.15) return table[0];
  if (Z >= 0.50) return table[5];

  for (let i = 0; i < Z_VALUES.length - 1; i++) {
    if (Z >= Z_VALUES[i] && Z <= Z_VALUES[i + 1]) {
      const t = (Z - Z_VALUES[i]) / (Z_VALUES[i + 1] - Z_VALUES[i]);
      return table[i] + t * (table[i + 1] - table[i]);
    }
  }
  return table[5];
}

// Get site coefficients
export function getSiteCoefficients(soilType: SoilType, Z: number) {
  return {
    Fa: interpolateCoefficient(FA_TABLE[soilType], Z),
    Fd: interpolateCoefficient(FD_TABLE[soilType], Z),
    Fs: interpolateCoefficient(FS_TABLE[soilType], Z),
  };
}

// NEC-SE-DS Spectrum parameters
export interface NECSpectrumParams {
  Z: number;        // Zone factor (PGA in rock, g)
  soilType: SoilType;
  region: Region;
  I?: number;       // Importance factor (default 1.0)
  R?: number;       // Response reduction factor (default 1.0 for elastic)
}

// Calculate NEC-SE-DS design spectrum
export function necSpectrum(T: number, params: NECSpectrumParams): number {
  const { Z, soilType, region, I = 1.0, R = 1.0 } = params;

  const { Fa, Fd, Fs } = getSiteCoefficients(soilType, Z);
  const eta = ETA_VALUES[region];

  // Period limits
  const Tc = 0.55 * Fs * Fd / Fa;
  const T0 = 0.10 * Fs * Fd / Fa;
  const TL = 2.4 * Fd;

  // r factor (decay exponent)
  const r = soilType === 'E' ? 1.5 : 1.0;

  // Spectral acceleration (fraction of g)
  let Sa: number;

  if (T <= 0) {
    Sa = Z * Fa; // PGA
  } else if (T <= T0) {
    // Linear ramp from Z*Fa to eta*Z*Fa
    Sa = Z * Fa * (1 + (eta - 1) * T / T0);
  } else if (T <= Tc) {
    // Plateau
    Sa = eta * Z * Fa;
  } else {
    // Decay branch
    Sa = eta * Z * Fa * Math.pow(Tc / T, r);
  }

  // Apply importance factor and reduction
  return (Sa * I) / R;
}

// Get spectrum curve for plotting
export function getSpectrumCurve(
  params: NECSpectrumParams,
  Tmax: number = 4.0,
  numPoints: number = 100
): { T: number[]; Sa: number[] } {
  const T: number[] = [];
  const Sa: number[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * Tmax;
    T.push(t);
    Sa.push(necSpectrum(t, params));
  }

  return { T, Sa };
}

// Calculate seismic base shear
export function calculateBaseShear(
  W: number,           // Seismic weight (kN)
  T: number,           // Fundamental period (s)
  params: NECSpectrumParams
): number {
  const Sa = necSpectrum(T, params);
  return Sa * W; // V = Sa * W (kN)
}

// Distribute lateral forces by height (inverted triangular)
export function distributeLateralForces(
  V: number,           // Base shear (kN)
  heights: number[],   // Heights of each floor (m)
  weights: number[]    // Weight at each floor (kN)
): number[] {
  const n = heights.length;
  const forces: number[] = [];

  // Sum of (wi * hi)
  let sumWH = 0;
  for (let i = 0; i < n; i++) {
    sumWH += weights[i] * heights[i];
  }

  // Fi = V * (wi * hi) / sum(wj * hj)
  for (let i = 0; i < n; i++) {
    forces.push(V * (weights[i] * heights[i]) / sumWH);
  }

  return forces;
}

// Get spectrum info for display
export function getSpectrumInfo(params: NECSpectrumParams): string {
  const { Z, soilType, region, I = 1.0, R = 1.0 } = params;
  const { Fa, Fd, Fs } = getSiteCoefficients(soilType, Z);
  const eta = ETA_VALUES[region];

  const Tc = 0.55 * Fs * Fd / Fa;
  const T0 = 0.10 * Fs * Fd / Fa;
  const TL = 2.4 * Fd;
  const SaMax = eta * Z * Fa;

  return `
NEC-SE-DS Ecuador Design Spectrum
================================
Zone Factor Z = ${Z.toFixed(2)}g
Soil Type: ${soilType}
Region: ${region}
Importance I = ${I.toFixed(1)}
Reduction R = ${R.toFixed(1)}

Site Coefficients:
  Fa = ${Fa.toFixed(3)}
  Fd = ${Fd.toFixed(3)}
  Fs = ${Fs.toFixed(3)}
  eta = ${eta.toFixed(2)}

Period Limits:
  T0 = ${T0.toFixed(3)} s
  Tc = ${Tc.toFixed(3)} s
  TL = ${TL.toFixed(3)} s

Sa(max) = ${SaMax.toFixed(3)}g @ T0 <= T <= Tc
`.trim();
}

// Estudio de suelos - Ing. Orlando Mora (Nov 2024)
// Riochico, Portoviejo - Manabi
export const RIOCHICO_SOIL_STUDY = {
  soilType: 'D' as SoilType,
  zone: 'VI',
  Z: 0.50,
  Fa: 1.12,  // Del estudio de suelos
  Fd: 1.11,  // Del estudio de suelos
  Fs: 1.40,  // Del estudio de suelos
};

// Default parameters for Crucita/Riochico, Manabi
export const CRUCITA_PARAMS: NECSpectrumParams = {
  Z: 0.50,          // Zona sismica VI
  soilType: 'D',    // Segun estudio de suelos
  region: 'Costa',  // Region Costa
  I: 1.0,           // Importancia normal
  R: 1.0,           // Espectro elastico
};

// Spectrum with exact soil study coefficients
export function necSpectrumWithSoilStudy(
  T: number,
  params: NECSpectrumParams,
  soilStudy?: { Fa: number; Fd: number; Fs: number }
): number {
  const { Z, soilType, region, I = 1.0, R = 1.0 } = params;

  // Use soil study values if provided, otherwise interpolate from tables
  const { Fa, Fd, Fs } = soilStudy || getSiteCoefficients(soilType, Z);
  const eta = ETA_VALUES[region];

  // Period limits
  const Tc = 0.55 * Fs * Fd / Fa;
  const T0 = 0.10 * Fs * Fd / Fa;

  // r factor
  const r = soilType === 'E' ? 1.5 : 1.0;

  // Spectral acceleration
  let Sa: number;
  if (T <= 0) {
    Sa = Z * Fa;
  } else if (T <= T0) {
    Sa = Z * Fa * (1 + (eta - 1) * T / T0);
  } else if (T <= Tc) {
    Sa = eta * Z * Fa;
  } else {
    Sa = eta * Z * Fa * Math.pow(Tc / T, r);
  }

  return (Sa * I) / R;
}

// Calculate approximate fundamental period (NEC formula)
export function approximatePeriod(hn: number, Ct: number = 0.055): number {
  // T = Ct * hn^0.75 for concrete moment frames
  // Ct = 0.055 for concrete frames
  // Ct = 0.072 for steel frames
  return Ct * Math.pow(hn, 0.75);
}
