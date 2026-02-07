# Tests de Validación Quad4 - Awatif-FEM

## Resumen

Estos tests validan la implementación del elemento Quad4 (shell de 4 nodos) en awatif-fem comparando resultados con:

1. **SAP2000** - Software comercial CSI
2. **ETABS** - Software comercial CSI
3. **Solución Teórica** - Ecuaciones de Navier/Timoshenko

## Archivos de Test

| Archivo | Descripción |
|---------|-------------|
| `test_quad4_simple.py` | Test básico con 1 elemento Quad4 en SAP2000 |
| `test_quad4_etabs.py` | Test con mesh 4x4 en ETABS |
| `test_quad4_sap2000_etabs.py` | Suite completa de tests |

## Requisitos

- Python 3.8+
- comtypes (`pip install comtypes`)
- SAP2000 v21+ instalado
- ETABS v22+ instalado (opcional)
- numpy (opcional, para análisis)

## Caso de Prueba Principal

### Placa Cuadrada Simplemente Apoyada

```
Geometría:
  - Dimensiones: 2m x 2m
  - Espesor: 0.2m

Material (Concreto):
  - E = 25 GPa
  - ν = 0.2
  - ρ = 2500 kg/m³

Condiciones de Borde:
  - Simplemente apoyada en las 4 esquinas (U3 = 0)

Carga:
  - Uniforme: q = 10 kN/m²
```

### Solución Teórica (Navier)

Para placa cuadrada simplemente apoyada:

```
Rigidez a flexión:
  D = E·t³ / (12·(1-ν²))
  D = 25e9 × 0.2³ / (12 × 0.96) = 173,611 N·m

Desplazamiento máximo (centro):
  w_max = 0.00406 × q × a⁴ / D
  w_max = 0.00406 × 10000 × 16 / 173611
  w_max ≈ 0.0037 m = 3.7 mm

Momento máximo (centro):
  M_max ≈ 0.0479 × q × a²
  M_max ≈ 0.0479 × 10 × 4 = 1.92 kN·m/m

Frecuencia fundamental (modo 1,1):
  f₁₁ = (π/2) × √(D/ρh) × [(1/a)² + (1/b)²]
  f₁₁ ≈ 35-40 Hz (para esta configuración)
```

## Ejecutar Tests

### Test Simple (SAP2000)

```bash
cd C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests
python test_quad4_simple.py
```

### Test ETABS

```bash
python test_quad4_etabs.py
```

### Suite Completa

```bash
python test_quad4_sap2000_etabs.py
```

## Resultados Esperados

### Convergencia del Mesh

| Mesh | Elementos | Error w | Error M |
|------|-----------|---------|---------|
| 1×1 | 1 | >50% | >50% |
| 2×2 | 4 | ~20% | ~25% |
| 4×4 | 16 | ~5% | ~10% |
| 8×8 | 64 | <2% | <5% |

### Comparación con Awatif-FEM

Los resultados de SAP2000/ETABS se comparan con awatif-fem usando:

1. **Desplazamientos** - Valor máximo en el centro
2. **Momentos** - M11, M22 máximos
3. **Frecuencias** - Primeros 5 modos naturales

## Estructura de Resultados

Los resultados se guardan en `tests/results/`:

```
results/
├── test_quad4_simple.sdb           # Modelo SAP2000
├── test_quad4_etabs.edb            # Modelo ETABS
├── test_quad4_etabs_results.json   # Resultados JSON
├── awatif_quad4_model.json         # Modelo para awatif-fem
└── test_results.json               # Resumen de tests
```

## Notas Técnicas

### Tipo de Elemento Shell

Usamos **Plate-Thick** (tipo 4 en CSI) que corresponde a la formulación Mindlin/Reissner:
- Incluye deformación por cortante transversal
- Válido para placas gruesas (t/L > 1/20)
- Compatible con awatif-fem Quad4 implementation

### DOFs por Nodo

Shell con 6 DOFs: `[u, v, w, θx, θy, θz]`
- u, v: desplazamientos en plano (membrana)
- w: desplazamiento fuera del plano (flexión)
- θx, θy: rotaciones de placa
- θz: drilling DOF (pequeña rigidez para estabilidad)

### Puntos de Integración

- Gauss 2×2 (4 puntos) para integración de rigidez
- Puntos en ξ, η = ±1/√3 ≈ ±0.577

## Referencias

1. CSI Analysis Reference Manual - Chapter 10: Shell Element
2. Wilson, E.L. - Static and Dynamic Analysis of Structures
3. Timoshenko - Theory of Plates and Shells
4. Ing. Alexis Pompilla Yábar - Curso de Elementos Finitos
