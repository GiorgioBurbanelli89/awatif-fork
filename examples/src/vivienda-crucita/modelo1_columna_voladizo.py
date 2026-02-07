# -*- coding: utf-8 -*-
"""
MODELO 1: Columna + Viga en Voladizo
Para comparar ETABS vs OpenSees vs Awatif

Geometria:
- 1 columna de 3m de altura
- 1 viga en voladizo de 1.5m en la parte superior

   voladizo (1.5m)
   [==========]
         |
         | columna (3m)
         |
        ///  (empotrado)
"""
import openseespy.opensees as ops
import math
import json

print("=" * 70)
print("MODELO 1: Columna + Viga en Voladizo")
print("ETABS vs OpenSees vs Awatif")
print("=" * 70)

# =============================================================================
# PROPIEDADES DEL MATERIAL (SI: Pa, kg, m)
# =============================================================================
fc = 210  # kg/cm2
E_kgcm2 = 15100 * math.sqrt(fc)  # kg/cm2
E = E_kgcm2 * 98066.5  # Pa (1 kg/cm2 = 98066.5 Pa)
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

print(f"\nPropiedades del Material:")
print(f"  E = {E:.4e} Pa = {E/1e9:.2f} GPa")
print(f"  G = {G:.4e} Pa")
print(f"  rho = {rho} kg/m3")

# Secciones
col_b, col_h = 0.30, 0.30  # Columnas 30x30
beam_b, beam_h = 0.25, 0.40  # Vigas 25x40

A_col = col_b * col_h
# Para columnas cuadradas: Iz = Iy
Iz_col = col_b * col_h**3 / 12
Iy_col = col_h * col_b**3 / 12
J_col = 0.141 * min(col_b, col_h)**4

A_beam = beam_b * beam_h
# Para vigas con h vertical (altura > ancho):
# Iy = b * h^3 / 12 = inercia para flexion vertical (la grande)
# Iz = h * b^3 / 12 = inercia para flexion horizontal (la pequena)
Iy_beam = beam_b * beam_h**3 / 12  # 0.001333 m4 (para flexion en plano XZ)
Iz_beam = beam_h * beam_b**3 / 12  # 0.000521 m4 (para flexion en plano XY)
J_beam = 0.141 * min(beam_b, beam_h)**4

print(f"\nSecciones:")
print(f"  Columna: {col_b*100:.0f}x{col_h*100:.0f}cm, A={A_col:.4f}m2, Iz={Iz_col:.6e}m4")
print(f"  Viga: {beam_b*100:.0f}x{beam_h*100:.0f}cm, A={A_beam:.4f}m2")
print(f"        Iy={Iy_beam:.6e}m4 (vertical), Iz={Iz_beam:.6e}m4 (horizontal)")

# =============================================================================
# GEOMETRIA
# =============================================================================
H = 3.0  # Altura de columna
voladizo = 1.5  # Longitud del voladizo

nodes = [
    [0.0, 0.0, 0.0],   # 0: Base (empotrado)
    [0.0, 0.0, H],     # 1: Tope de columna
    [voladizo, 0.0, H] # 2: Extremo del voladizo
]

elements = [
    [0, 1],  # Columna
    [1, 2]   # Viga en voladizo
]

element_types = ['col', 'beam']

supports = {0: [True, True, True, True, True, True]}  # Empotrado en base

print(f"\nGeometria:")
print(f"  Columna: H = {H}m")
print(f"  Voladizo: L = {voladizo}m")
print(f"  Nodos: {len(nodes)}")
print(f"  Elementos: {len(elements)}")

# =============================================================================
# GUARDAR MODELO JSON (para Awatif)
# =============================================================================
model_data = {
    "name": "Modelo 1: Columna + Voladizo",
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

with open('modelo1.json', 'w') as f:
    json.dump(model_data, f, indent=2)
print("\n[OK] Modelo guardado en modelo1.json")

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
# Para columnas (verticales): vecxz apunta en X
ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)
# Para vigas (horizontales): vecxz apunta en Z (arriba)
ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)

# Elementos
for i, (el, typ) in enumerate(zip(elements, element_types)):
    n1, n2 = el
    if typ == 'col':
        A, Iz, Iy, J = A_col, Iz_col, Iy_col, J_col
        transf = 1
    else:
        A, Iz, Iy, J = A_beam, Iz_beam, Iy_beam, J_beam
        transf = 2

    # elasticBeamColumn: eleTag, iNode, jNode, A, E, G, J, Iy, Iz, transfTag
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
    mass = rho * A * L / 2  # kg

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
   - Grid: 1 x 1, espaciado {voladizo}m x 0m
   - Pisos: 1 piso a {H}m

2. Definir materiales:
   - Define > Materials > Add New Material
   - Concrete, fc = 21 MPa (f'c = 210 kg/cm2)
   - E = {E/1e6:.0f} MPa, nu = {nu}

3. Definir secciones:
   - Define > Section Properties > Frame Sections
   - Columna: Concrete Rectangular {col_b*100:.0f}x{col_h*100:.0f}cm
   - Viga: Concrete Rectangular {beam_b*100:.0f}x{beam_h*100:.0f}cm

4. Dibujar elementos:
   - Draw > Draw Frame Element
   - Columna: desde (0,0,0) hasta (0,0,{H})
   - Voladizo: desde (0,0,{H}) hasta ({voladizo},0,{H})

5. Apoyos:
   - Assign > Joint > Restraints
   - Empotrar nodo en (0,0,0)

6. Fuente de masa:
   - Define > Mass Source
   - From Loads: Dead = 1.0
   - O usar masa lumped manual

7. Analisis Modal:
   - Define > Load Cases > MODAL
   - Eigenvector, 6 modos
   - Run Analysis

8. Comparar resultados con OpenSees:
""")
if results_opensees:
    for r in results_opensees[:3]:
        print(f"   Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
