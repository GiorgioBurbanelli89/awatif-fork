export * from "./data-model";

export { analyze } from "./analyze";
// export { deform } from "./deform";
export { deformCpp as deform } from "./deformCpp";

// Modal Analysis
export { modal, resetModalModule } from "./modalCpp";
export type { ModalOutputs } from "./modalCpp";

// Response Spectrum Analysis (NEW)
export { responseSpectrum, getSpectrumCurve } from "./responseSpectrumCpp";
export type {
  ResponseSpectrumOptions,
  ResponseSpectrumOutputs,
  DesignSpectrum,
  ASCE7Spectrum,
  EC8Spectrum,
  NECSpectrum,
  UserSpectrum,
  SpectrumType,
  CombinationType
} from "./responseSpectrumCpp";

// Time History Analysis (NEW)
export {
  timeHistory,
  calculateRayleighDamping,
  calculateRayleighEqual,
  createSinusoidalMotion,
  createImpulseMotion,
  createElCentroLike
} from "./timeHistoryCpp";
export type {
  TimeHistoryOptions,
  TimeHistoryOutputs,
  GroundMotion,
  RayleighDamping,
  ModalDamping,
  FrequencyDamping,
  DampingDefinition,
  NewmarkParameters
} from "./timeHistoryCpp";

// Pushover Analysis (NEW)
export { pushover, getPerformancePoint } from "./pushoverCpp";
export type {
  PushoverOptions,
  PushoverOutputs,
  PushoverStep,
  PlasticHinge,
  HingeDefinition,
  LoadPattern
} from "./pushoverCpp";

// P-Delta Analysis (NEW)
export { pDelta, getAmplificationFactor, isPDeltaSignificant } from "./pDeltaCpp";
export type {
  PDeltaOptions,
  PDeltaOutputs
} from "./pDeltaCpp";
