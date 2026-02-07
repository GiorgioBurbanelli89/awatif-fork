# -*- coding: utf-8 -*-
"""
MODELO 2: 2 Columnas + 2 Vigas Paralelas en Voladizo
Para comparar ETABS vs OpenSees vs Awatif

Geometria:
- 2 columnas de 3m de altura, separadas 4m en Y
- 2 vigas en voladizo de 1.5m (paralelas, hacia +X)

            voladizo (1.5m)
   [====o====o====]  <- viga + voladizo
        |    |
        | 4m |  (separacion en Y)
        |    |
   [====o====o====]  <- viga + voladizo
        |    |
        | columnas (3m)
        |    |
       /// ///  (empotrado)

Vista en planta (z = 3m):
        Y
        ^
   1.5m |   voladizo
   -----|----->
        0    X
    +---+---+
    | 2 |   | 3 <- extremo voladizo
    +---+---+
    | 0 |   | 1 <- base columnas
    +---+---+
        4m
"""
import openseespy.opensees as ops
import math
import json

print("=" * 70)
print("MODELO 2: 2 Columnas + 2 Vigas Paralelas en Voladizo")
print("ETABS vs OpenSees vs Awatif")
print("=" * 70)

# =============================================================================
# PROPIEDADES DEL MATERIAL (SI: Pa, kg, m)
# =============================================================================
fc = 210  # kg/cm2
E_kgcm2 = 15100 * math.sqrt(fc)
E = E_kgcm2 * 98066.5  # Pa
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

print(f"\nPropiedades del Material:")
print(f"  E = {E:.4e} Pa = {E/1e9:.2f} GPa")
print(f"  rho = {rho} kg/m3")

# Secciones
col_b, col_h = 0.30, 0.30
beam_b, beam_h = 0.25, 0.40

A_col = col_b * col_h
Iz_col = col_b * col_h**3 / 12
Iy_col = col_h * col_b**3 / 12
J_col = 0.141 * min(col_b, col_h)**4

A_beam = beam_b * beam_h
Iy_beam = beam_b * beam_h**3 / 12  # Para flexion vertical
Iz_beam = beam_h * beam_b**3 / 12  # Para flexion horizontal
J_beam = 0.141 * min(beam_b, beam_h)**4

print(f"\nSecciones:")
print(f"  Columna: {col_b*100:.0f}x{col_h*100:.0f}cm")
print(f"  Viga: {beam_b*100:.0f}x{beam_h*100:.0f}cm")

# =============================================================================
# GEOMETRIA
# =============================================================================
H = 3.0  # Altura de columna
Ly = 4.0  # Separacion entre columnas en Y
voladizo = 1.5  # Longitud del voladizo

nodes = [
    # Base (z = 0)
    [0.0, 0.0, 0.0],   # 0: Base col 1
    [0.0, Ly, 0.0],    # 1: Base col 2
    # Tope columnas (z = H)
    [0.0, 0.0, H],     # 2: Tope col 1
    [0.0, Ly, H],      # 3: Tope col 2
    # Extremos voladizo
    [voladizo, 0.0, H],  # 4: Extremo voladizo 1
    [voladizo, Ly, H]    # 5: Extremo voladizo 2
]

elements = [
    # Columnas
    [0, 2],  # 0: Col 1
    [1, 3],  # 1: Col 2
    # Vigas en voladizo
    [2, 4],  # 2: Voladizo 1
    [3, 5]   # 3: Voladizo 2
]

element_types = ['col', 'col', 'beam', 'beam']

supports = {
    0: [True, True, True, True, True, True],
    1: [True, True, True, True, True, True]
}

print(f"\nGeometria:")
print(f"  Columnas: H = {H}m, separacion = {Ly}m")
print(f"  Voladizos: L = {voladizo}m (2 paralelos)")
print(f"  Nodos: {len(nodes)}")
print(f"  Elementos: {len(elements)}")

# =============================================================================
# GUARDAR MODELO JSON (para Awatif)
# =============================================================================
model_data = {
    "name": "Modelo 2: 2 Columnas + 2 Voladizos Paralelos",
    "units": "Pa, kg, m",
    "nodes": nodes,
    "elements": elements,
    "element_types": element_types,
    "supports": {str(k): v for k, v in supports.items()},
    "properties": {
        "E": E,
        "G": G,
        "rho": rho,
        "col": {"A": A_col, "Iz": Iz_col, "Iy": Iy_col, "J": J_col},
        "beam": {"A": A_beam, "Iz": Iz_beam, "Iy": Iy_beam, "J": J_beam}
    }
}

with open('modelo2.json', 'w') as f:
    json.dump(model_data, f, indent=2)
print("\n[OK] Modelo guardado en modelo2.json")

# =============================================================================
# ANALISIS MODAL CON OPENSEES
# =============================================================================
print("\n" + "=" * 70)
print("ANALISIS MODAL - OPENSEES")
print("=" * 70)

ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

# Nodos
for i, n in enumerate(nodes):
    ops.node(i + 1, float(n[0]), float(n[1]), float(n[2]))

# Apoyos
for node_idx, constraints in supports.items():
    ops.fix(node_idx + 1, *[1 if c else 0 for c in constraints])

# Transformaciones
ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)  # Columnas
ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)  # Vigas

# Elementos
for i, (el, typ) in enumerate(zip(elements, element_types)):
    n1, n2 = el
    if typ == 'col':
        A, Iz, Iy, J = A_col, Iz_col, Iy_col, J_col
        transf = 1
    else:
        A, Iz, Iy, J = A_beam, Iz_beam, Iy_beam, J_beam
        transf = 2

    ops.element('elasticBeamColumn', i + 1, n1 + 1, n2 + 1, A, E, G, J, Iy, Iz, transf)

# Masa lumped
for i, (el, typ) in enumerate(zip(elements, element_types)):
    n1_coord = nodes[el[0]]
    n2_coord = nodes[el[1]]
    dx = n2_coord[0] - n1_coord[0]
    dy = n2_coord[1] - n1_coord[1]
    dz = n2_coord[2] - n1_coord[2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)

    A = A_col if typ == 'col' else A_beam
    mass = rho * A * L / 2

    for node_idx in el:
        if node_idx not in supports:
            ops.mass(node_idx + 1, mass, mass, mass, 0, 0, 0)

# Analisis modal
try:
    eigenvalues = ops.eigen(6)

    print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12} {'omega (rad/s)':<15}")
    print("-" * 50)

    results_opensees = []
    for i, ev in enumerate(eigenvalues[:6]):
        if ev > 0:
            omega = math.sqrt(ev)
            freq = omega / (2 * math.pi)
            period = 1 / freq
            results_opensees.append({'mode': i+1, 'T': period, 'f': freq, 'omega': omega})
            print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f} {omega:<15.4f}")
        else:
            print(f"{i+1:<6} {'ERROR':<12} {'ev<0':<12}")

except Exception as e:
    print(f"ERROR en OpenSees: {e}")

ops.wipe()

# =============================================================================
# INSTRUCCIONES PARA ETABS
# =============================================================================
print("\n" + "=" * 70)
print("INSTRUCCIONES PARA CREAR EN ETABS:")
print("=" * 70)
print(f"""
1. Nuevo modelo: File > New Model
   - Units: kN, m, C
   - Grid: 2 en X (0, {voladizo}), 2 en Y (0, {Ly})
   - Pisos: 1 piso a {H}m

2. Materiales y Secciones (igual que Modelo 1)

3. Dibujar elementos:
   - Columna 1: (0, 0, 0) a (0, 0, {H})
   - Columna 2: (0, {Ly}, 0) a (0, {Ly}, {H})
   - Voladizo 1: (0, 0, {H}) a ({voladizo}, 0, {H})
   - Voladizo 2: (0, {Ly}, {H}) a ({voladizo}, {Ly}, {H})

4. Apoyos:
   - Empotrar nodos (0,0,0) y (0,{Ly},0)

5. Analisis Modal y comparar:
""")
if results_opensees:
    for r in results_opensees[:3]:
        print(f"   Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
