# Como Agregar Nuevos Solvers en Awatif

## Estructura del Proyecto

```
awatif-2.0.0/
├── awatif-fem/           # Solvers FEM
│   ├── src/
│   │   ├── index.ts      # Exports principales
│   │   ├── data-model.ts # Tipos de datos
│   │   ├── deformCpp.ts  # Solver de deformaciones (WASM)
│   │   ├── modalCpp.ts   # Solver modal (WASM)
│   │   └── cpp/
│   │       ├── deform.cpp
│   │       ├── modal.cpp
│   │       └── built/    # Archivos WASM compilados
│   └── package.json
├── examples/
│   └── src/
│       └── modal-analysis/  # Ejemplo de uso
└── package.json          # Monorepo con workspaces
```

## Pasos para Agregar un Nuevo Solver

### 1. Crear el archivo C++ del solver

Crear `awatif-fem/src/cpp/miSolver.cpp`:

```cpp
#include "data-model.h"
#include <Eigen/Dense>
#include <Eigen/Sparse>

extern "C" {
    void miSolver(
        // Inputs
        double *nodes_flat_ptr, int num_nodes,
        unsigned int *element_indices_ptr, int num_element_indices,
        // ... mas parametros ...

        // Outputs
        double **results_ptr_out,
        int *num_results_out
    ) {
        // Implementacion del solver
    }
}
```

### 2. Crear el wrapper TypeScript

Crear `awatif-fem/src/miSolverCpp.ts`:

```typescript
import { Node, Element, NodeInputs, ElementInputs } from "./data-model.js";
import createModule from "./cpp/built/miSolver.js";

// Definir interface de outputs
export interface MiSolverOutputs {
  results: Map<number, number>;
  // ... otros campos
}

// Tipo del modulo WASM
type WasmModule = Awaited<ReturnType<typeof createModule>>;

let mod: WasmModule | null = null;

async function getModule(): Promise<WasmModule> {
  if (!mod) {
    mod = await createModule();
  }
  return mod;
}

// Funcion de allocate (copiar de modalCpp.ts)
function allocate<T extends TypedArrayConstructor>(
  data: number[],
  TypedArrayCtor: T,
  heapTypedArray: InstanceType<T>,
  wasmMod: WasmModule
): number {
  const buffer = new TypedArrayCtor(data);
  const pointer = wasmMod._malloc(buffer.length * buffer.BYTES_PER_ELEMENT);
  heapTypedArray.set(buffer, pointer / buffer.BYTES_PER_ELEMENT);
  return pointer;
}

// Funcion principal del solver
export async function miSolver(
  nodes: Node[],
  elements: Element[],
  nodeInputs: NodeInputs,
  elementInputs: ElementInputs,
  solverInputs: { /* parametros especificos */ }
): Promise<MiSolverOutputs> {

  const wasmMod = await getModule();
  const gc: number[] = []; // Para liberar memoria

  // 1. Allocar datos de entrada
  // ... (ver modalCpp.ts como ejemplo)

  // 2. Llamar funcion C++
  wasmMod._miSolver(/* parametros */);

  // 3. Leer resultados
  // ...

  // 4. Liberar memoria
  gc.forEach((ptr) => wasmMod._free(ptr));

  return results;
}
```

### 3. Exportar en index.ts

**IMPORTANTE:** Separar exports de tipos y valores:

```typescript
// awatif-fem/src/index.ts

export * from "./data-model";
export { analyze } from "./analyze";
export { deformCpp as deform } from "./deformCpp";

// Modal Analysis
export { modal, resetModalModule } from "./modalCpp";
export type { ModalOutputs } from "./modalCpp";

// Mi Nuevo Solver
export { miSolver } from "./miSolverCpp";
export type { MiSolverOutputs } from "./miSolverCpp";
```

### 4. Agregar script de compilacion en package.json

```json
{
  "scripts": {
    "build:miSolver": "emcc ./src/cpp/miSolver.cpp ./src/cpp/utils/getGlobalStiffnessMatrix.cpp ./src/cpp/utils/getLocalStiffnessMatrix.cpp ./src/cpp/utils/getTransformationMatrix.cpp -o ./src/cpp/built/miSolver.js -O3 -s ASSERTIONS -s ALLOW_MEMORY_GROWTH -s MODULARIZE -s EXPORT_ES6 -s EXPORTED_FUNCTIONS=_malloc,_free,_miSolver -s EXPORTED_RUNTIME_METHODS=HEAPF64,HEAPU32,HEAPU8 -I /path/to/eigen/ -I /path/to/spectra/include/"
  }
}
```

### 5. Compilar el WASM

```bash
cd awatif-fem
npm run build:miSolver
```

Esto genera:
- `src/cpp/built/miSolver.js`
- `src/cpp/built/miSolver.wasm`

### 6. Crear ejemplo de uso

Crear `examples/src/mi-solver-example/`:

```
mi-solver-example/
├── index.html
└── index.ts
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mi Solver - Awatif</title>
</head>
<body>
  <script type="module" src="./index.ts"></script>
</body>
</html>
```

**index.ts:**
```typescript
import { Node, Element, miSolver, MiSolverOutputs } from "awatif-fem";
import { getViewer } from "awatif-ui";

// Definir modelo
const nodes: Node[] = [...];
const elements: Element[] = [...];

// Ejecutar solver
const results = await miSolver(nodes, elements, nodeInputs, elementInputs, {});

console.log("Results:", results);
```

### 7. Agregar al vite.config.ts

```typescript
// examples/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // ... otros ejemplos
        "mi-solver-example": "src/mi-solver-example/index.html",
      },
    },
  },
});
```

## Dependencias de Compilacion

Para compilar solvers WASM necesitas:

1. **Emscripten** (emcc)
   ```bash
   # Instalar emsdk
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

2. **Eigen** (algebra lineal)
   - Descargar de https://eigen.tuxfamily.org/
   - Solo headers, no requiere compilacion

3. **Spectra** (eigenvalues sparse) - opcional
   - Descargar de https://spectralib.org/
   - Solo headers

## Errores Comunes

### "does not provide an export named 'MiType'"

**Causa:** Mezclaste export de tipos con valores.

**Solucion:** Usar `export type` para interfaces/types:
```typescript
// MAL
export { miSolver, MiSolverOutputs } from "./miSolverCpp";

// BIEN
export { miSolver } from "./miSolverCpp";
export type { MiSolverOutputs } from "./miSolverCpp";
```

### WASM no carga

Verificar que:
1. El archivo `.wasm` existe en `cpp/built/`
2. El plugin `vite-plugin-top-level-await` esta en vite.config.ts
3. Ejecutar desde la raiz del monorepo: `npm run dev:examples`

## Ejemplo Completo: Modal Solver

Ver archivos:
- `awatif-fem/src/modalCpp.ts` - Wrapper TypeScript
- `awatif-fem/src/cpp/modal.cpp` - Implementacion C++
- `examples/src/modal-analysis/index.ts` - Ejemplo de uso
