# Modal Analysis for Awatif FEM

## Overview

This implementation adds modal (eigenvalue) analysis capability to Awatif FEM.
It solves the generalized eigenvalue problem:

**K * φ = ω² * M * φ**

Where:
- **K** = Global stiffness matrix
- **M** = Global mass matrix
- **ω** = Natural circular frequency (rad/s)
- **φ** = Mode shape (eigenvector)

## Files Created

### C++ (Solver)
- `awatif-fem/src/cpp/modal.cpp` - Modal analysis solver
  - `getLocalMassMatrixFrame()` - Consistent mass matrix for beams
  - `getLocalMassMatrixShell()` - Lumped mass matrix for shells
  - `getGlobalMassMatrix()` - Assembles global mass matrix
  - `modal()` - Main function (exported to WASM)

### TypeScript (Wrapper)
- `awatif-fem/src/modalCpp.ts` - TypeScript interface to WASM
  - `modal()` - Async function to run modal analysis
  - `ModalOutputs` - Result interface

### Example
- `examples/src/modal-analysis/` - 3x4 column building example

## Usage

```typescript
import { modal, Node, Element, NodeInputs, ElementInputs } from "awatif-fem";

// Define model
const nodes: Node[] = [[0,0,0], [0,0,3], ...];
const elements: Element[] = [[0,1], [1,2], ...];

const nodeInputs: NodeInputs = {
  supports: new Map([[0, [true,true,true,true,true,true]]]), // Fixed base
  loads: new Map() // No loads for modal analysis
};

const elementInputs: ElementInputs = {
  elasticities: new Map([[0, 25000000]]),  // E = 25 GPa
  areas: new Map([[0, 0.16]]),             // A = 0.4*0.4 = 0.16 m²
  momentsOfInertiaZ: new Map([[0, 0.00213]]),
  momentsOfInertiaY: new Map([[0, 0.00213]]),
  shearModuli: new Map([[0, 10416667]]),   // G = E/(2*(1+nu))
  torsionalConstants: new Map([[0, 0.00426]])
};

// Run modal analysis
const modalOutputs = await modal(
  nodes,
  elements,
  nodeInputs,
  elementInputs,
  {
    densities: new Map([[0, 2.5]]),  // ρ = 2.5 ton/m³
    numModes: 12
  }
);

// Results
console.log("Periods:", modalOutputs.periods);
console.log("Frequencies:", modalOutputs.frequencies);
console.log("Mass Participation:", modalOutputs.massParticipation);
console.log("Sum Participation:", modalOutputs.sumParticipation);
```

## Output Structure

```typescript
interface ModalOutputs {
  frequencies: Map<number, number>;      // Mode -> Hz
  periods: Map<number, number>;          // Mode -> seconds
  modeShapes: Map<number, number[]>;     // Mode -> deformations
  massParticipation: Map<number, {
    UX: number;  // Translation X
    UY: number;  // Translation Y
    UZ: number;  // Translation Z
    RX: number;  // Rotation X
    RY: number;  // Rotation Y
    RZ: number;  // Rotation Z (torsion)
  }>;
  sumParticipation: {
    SumUX: number;
    SumUY: number;
    SumUZ: number;
    SumRX: number;
    SumRY: number;
    SumRZ: number;
  };
}
```

## Build Instructions

### Requirements
- Node.js >= 20
- Emscripten SDK (for C++ to WASM compilation)
- Eigen library (C++ linear algebra)

### Build Commands

```bash
cd awatif-fem

# Build static solver (existing)
npm run build

# Build modal solver (new)
npm run build:modal

# Build both
npm run build:all
```

### Emscripten Build Command (for reference)
```bash
emcc ./src/cpp/modal.cpp \
     ./src/cpp/utils/getGlobalStiffnessMatrix.cpp \
     ./src/cpp/utils/getLocalStiffnessMatrix.cpp \
     ./src/cpp/utils/getTransformationMatrix.cpp \
     -o ./src/cpp/built/modal.js \
     -O3 \
     -s ASSERTIONS \
     -s ALLOW_MEMORY_GROWTH \
     -s MODULARIZE \
     -s EXPORT_ES6 \
     -s EXPORTED_FUNCTIONS=_malloc,_free,_modal \
     -s EXPORTED_RUNTIME_METHODS=HEAPF64,HEAPU32,HEAPU8 \
     -I /path/to/eigen/
```

## Comparison with ETABS

| Feature | ETABS | Awatif Modal |
|---------|-------|--------------|
| Eigenvalue solver | Lanczos/Ritz | Eigen::GeneralizedSelfAdjointEigenSolver |
| Mass matrix | Consistent/Lumped | Consistent (frames), Lumped (shells) |
| Element types | All | Frame (2-node), Shell (3-node) |
| Mass source | Load patterns | Direct density input |
| Output | T, f, UX, UY, RZ, etc. | Same |

## Example Results (3x4 Building)

Expected results similar to ETABS:
```
Mode  T(s)      UX      UY      RZ
1     0.227     90.4%   0.0%    0.0%
2     0.215     0.0%    91.3%   0.0%
3     0.184     0.0%    0.0%    91.0%
4     0.075     9.6%    0.0%    0.0%
5     0.074     0.0%    8.7%    0.0%
6     0.063     0.0%    0.0%    9.0%
```

## Technical Notes

### Mass Matrix Formulation

**Frame Elements (2 nodes):**
- Uses consistent mass matrix for transverse directions
- Lumped mass for axial and torsional DOFs
- Formula: `m = ρ * A * L`

**Shell Elements (3 nodes):**
- Uses lumped mass matrix (1/3 of total mass per node)
- Rotational inertia: `m_r = m * t² / 12`
- Formula: `m = ρ * A_e * t`

### Eigenvalue Solver

Uses Eigen's `GeneralizedSelfAdjointEigenSolver`:
- Solves K*x = λ*M*x directly
- Assumes both K and M are symmetric positive definite
- Returns eigenvalues in ascending order

### Mass Participation

Calculated as:
```
Γ = φᵀ * M * r       (modal participation factor)
M_eff = Γ² / (φᵀ*M*φ)  (effective modal mass)
Ratio = M_eff / M_total
```

Where `r` is the influence vector (unit displacement in each direction).
