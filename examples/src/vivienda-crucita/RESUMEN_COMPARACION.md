# Comparación Modal: OpenSees vs Awatif

## Modelos de Prueba

### Modelo 1: Columna + Voladizo
- 1 columna de 3m
- 1 viga en voladizo de 1.5m

### Modelo 2: 2 Columnas + 2 Voladizos
- 2 columnas separadas 4m
- 2 vigas paralelas en voladizo de 1.5m

### Modelo 3: Pórtico + Losa + Voladizos
- 4 columnas formando pórtico 4m x 4m
- Losa shell-thin 7m x 7m (incluyendo voladizos)

## Propiedades Comunes

```
Material:
- E = 21.46 GPa (f'c = 210 kg/cm²)
- ν = 0.2
- ρ = 2400 kg/m³

Secciones:
- Columnas: 30x30 cm
- Vigas: 25x40 cm
- Losa: 12 cm
```

## Resultados

### OpenSees
| Modelo | T1 (s) | f1 (Hz) | T2 (s) | f2 (Hz) |
|--------|--------|---------|--------|---------|
| Modelo 1 | 0.1109 | 9.017 | 0.1076 | 9.292 |
| Modelo 2 | 0.1109 | 9.017 | 0.1109 | 9.017 |
| Modelo 3 | 0.3168 | 3.156 | 0.3168 | 3.156 |

### Awatif
| Modelo | T1 (s) | f1 (Hz) | T2 (s) | f2 (Hz) |
|--------|--------|---------|--------|---------|
| Modelo 1 | 0.1395 | 7.168 | 0.1365 | 7.325 |
| Modelo 2 | 0.1395 | 7.168 | 0.1395 | 7.168 |
| Modelo 3 | 0.1447 | 6.912 | 0.1149 | 8.703 |

## Diferencias

| Modelo | ΔT1 | Observaciones |
|--------|-----|---------------|
| Modelo 1 | +26% | Awatif más flexible |
| Modelo 2 | +26% | Awatif más flexible |
| Modelo 3 | -54% | Diferente comportamiento (Awatif: torsión primero) |

## Análisis

### Modelos 1 y 2 (solo frames)
La diferencia consistente del 26% sugiere una diferencia sistemática en:
- Formulación de matriz de rigidez
- Orientación de ejes locales (Iy vs Iz)
- Transformación de coordenadas

Dado que T² ∝ M/K, una diferencia del 26% en T implica:
- (1.26)² ≈ 1.59 → K_awatif ≈ 0.63 × K_opensees (si M igual)

### Modelo 3 (con losa shell)
Las diferencias son más complejas:
- OpenSees: Primeros modos son translacionales (T = 0.32s)
- Awatif: Primer modo es torsional (T = 0.14s)

Esto puede deberse a:
1. Diferente distribución de masa en la losa
2. Diferente rigidez de membrana vs flexión
3. Diferente conexión frame-shell

## Próximos Pasos

1. Comparar con ETABS (ejecutar `etabs_modelos_comparacion.py`)
2. Investigar la orientación de Iy/Iz en elementos horizontales
3. Revisar la formulación del elemento shell Quad4
4. Verificar la distribución de masa en elementos shell
