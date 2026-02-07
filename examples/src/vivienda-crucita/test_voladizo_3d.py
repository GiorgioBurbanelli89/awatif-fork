# -*- coding: utf-8 -*-
"""
TEST COMPARATIVO: Portico 2x2, 2 pisos CON VIGAS EN VOLADIZO
Compara ETABS vs OpenSees vs Awatif

Geometria:
- Grid: 2x2 columnas, espaciadas 4m x 4m
- Pisos: 2 pisos, altura 3m cada uno
- Voladizos: vigas de 1.5m hacia afuera en cada esquina (nivel 2)
- Material: Concreto f'c=210 kg/cm2

Casos:
1. Solo frames (sin losa)
2. Con losa shell-thin
"""
import openseespy.opensees as ops
import math
import json

print("=" * 70)
print("TEST COMPARATIVO: PORTICO 2x2 CON VOLADIZOS")
print("ETABS vs OpenSees vs Awatif")
print("=" * 70)

# ============================================================================
# GEOMETRIA
# ============================================================================
Lx = 4.0  # Luz en X
Ly = 4.0  # Luz en Y
H = 3.0   # Altura de piso
n_pisos = 2
voladizo = 1.5  # Longitud de voladizo

# Columnas: 2x2
n_col_x = 2
n_col_y = 2

# ============================================================================
# PROPIEDADES DEL MATERIAL (SI: Pa, kg, m)
# ============================================================================
fc = 210  # kg/cm2
# E = 15100 * sqrt(f'c) en kg/cm2 -> convertir a Pa
E_kgcm2 = 15100 * math.sqrt(fc)  # kg/cm2
E = E_kgcm2 * 98066.5  # Pa (1 kg/cm2 = 98066.5 Pa)
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

# Secciones
col_b, col_h = 0.30, 0.30  # Columnas 30x30
beam_b, beam_h = 0.25, 0.40  # Vigas 25x40

A_col = col_b * col_h
Iz_col = col_b * col_h**3 / 12
Iy_col = col_h * col_b**3 / 12
J_col = 0.141 * min(col_b, col_h)**4

A_beam = beam_b * beam_h
Iz_beam = beam_b * beam_h**3 / 12
Iy_beam = beam_h * beam_b**3 / 12
J_beam = 0.141 * min(beam_b, beam_h)**4

print(f"\nPropiedades:")
print(f"  E = {E:.2e} Pa = {E/1e9:.2f} GPa")
print(f"  rho = {rho} kg/m3")
print(f"  Columna: {col_b*100:.0f}x{col_h*100:.0f}cm, A={A_col:.4f}m2, Iz={Iz_col:.6e}m4")
print(f"  Viga: {beam_b*100:.0f}x{beam_h*100:.0f}cm, A={A_beam:.4f}m2, Iz={Iz_beam:.6e}m4")

# ============================================================================
# CREAR NODOS
# ============================================================================
nodes = []
node_id = 0

# Nodos en grid principal (columnas)
grid_nodes = {}  # (i, j, k) -> node_id
for k in range(n_pisos + 1):
    z = k * H
    for j in range(n_col_y):
        for i in range(n_col_x):
            x = i * Lx
            y = j * Ly
            nodes.append([x, y, z])
            grid_nodes[(i, j, k)] = node_id
            node_id += 1

# Nodos de voladizo (solo en el ultimo piso)
voladizo_nodes = []
k = n_pisos  # Ultimo piso
z = k * H

# Voladizos en las 4 direcciones desde cada nodo de esquina
# Esquina (0,0): voladizo hacia -X y -Y
x, y = 0, 0
nodes.append([x - voladizo, y, z])  # Voladizo -X
voladizo_nodes.append((node_id, grid_nodes[(0, 0, k)]))
node_id += 1
nodes.append([x, y - voladizo, z])  # Voladizo -Y
voladizo_nodes.append((node_id, grid_nodes[(0, 0, k)]))
node_id += 1

# Esquina (1,0): voladizo hacia +X y -Y
x, y = Lx, 0
nodes.append([x + voladizo, y, z])  # Voladizo +X
voladizo_nodes.append((node_id, grid_nodes[(1, 0, k)]))
node_id += 1
nodes.append([x, y - voladizo, z])  # Voladizo -Y
voladizo_nodes.append((node_id, grid_nodes[(1, 0, k)]))
node_id += 1

# Esquina (0,1): voladizo hacia -X y +Y
x, y = 0, Ly
nodes.append([x - voladizo, y, z])  # Voladizo -X
voladizo_nodes.append((node_id, grid_nodes[(0, 1, k)]))
node_id += 1
nodes.append([x, y + voladizo, z])  # Voladizo +Y
voladizo_nodes.append((node_id, grid_nodes[(0, 1, k)]))
node_id += 1

# Esquina (1,1): voladizo hacia +X y +Y
x, y = Lx, Ly
nodes.append([x + voladizo, y, z])  # Voladizo +X
voladizo_nodes.append((node_id, grid_nodes[(1, 1, k)]))
node_id += 1
nodes.append([x, y + voladizo, z])  # Voladizo +Y
voladizo_nodes.append((node_id, grid_nodes[(1, 1, k)]))
node_id += 1

print(f"\nGeometria:")
print(f"  Grid: {n_col_x}x{n_col_y}, Lx={Lx}m, Ly={Ly}m")
print(f"  Pisos: {n_pisos}, H={H}m")
print(f"  Voladizos: {voladizo}m")
print(f"  Nodos totales: {len(nodes)}")

# ============================================================================
# CREAR ELEMENTOS
# ============================================================================
elements = []
element_types = []  # 'col' o 'beam'

# Columnas
for k in range(n_pisos):
    for j in range(n_col_y):
        for i in range(n_col_x):
            n1 = grid_nodes[(i, j, k)]
            n2 = grid_nodes[(i, j, k + 1)]
            elements.append([n1, n2])
            element_types.append('col')

# Vigas en X
for k in range(1, n_pisos + 1):
    for j in range(n_col_y):
        for i in range(n_col_x - 1):
            n1 = grid_nodes[(i, j, k)]
            n2 = grid_nodes[(i + 1, j, k)]
            elements.append([n1, n2])
            element_types.append('beam')

# Vigas en Y
for k in range(1, n_pisos + 1):
    for j in range(n_col_y - 1):
        for i in range(n_col_x):
            n1 = grid_nodes[(i, j, k)]
            n2 = grid_nodes[(i, j + 1, k)]
            elements.append([n1, n2])
            element_types.append('beam')

# Vigas en voladizo
for (tip_node, base_node) in voladizo_nodes:
    elements.append([base_node, tip_node])
    element_types.append('beam')

n_cols = sum(1 for t in element_types if t == 'col')
n_beams = sum(1 for t in element_types if t == 'beam')
print(f"  Columnas: {n_cols}")
print(f"  Vigas: {n_beams} (incluyendo {len(voladizo_nodes)} voladizos)")

# ============================================================================
# APOYOS (base empotrada)
# ============================================================================
supports = {}
for j in range(n_col_y):
    for i in range(n_col_x):
        node_id = grid_nodes[(i, j, 0)]
        supports[node_id] = [True, True, True, True, True, True]

print(f"  Apoyos: {len(supports)} nodos empotrados en base")

# ============================================================================
# GUARDAR MODELO JSON (para Awatif)
# ============================================================================
model_data = {
    "name": "Test Voladizo 2x2",
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

with open('test_voladizo_model.json', 'w') as f:
    json.dump(model_data, f, indent=2)
print("\n[OK] Modelo guardado en test_voladizo_model.json")

# ============================================================================
# ANALISIS MODAL CON OPENSEES
# ============================================================================
print("\n" + "=" * 70)
print("ANALISIS MODAL - OPENSEES")
print("=" * 70)

ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

# Crear nodos
for i, n in enumerate(nodes):
    ops.node(i + 1, float(n[0]), float(n[1]), float(n[2]))

# Apoyos
for node_idx, constraints in supports.items():
    ops.fix(node_idx + 1, *[1 if c else 0 for c in constraints])

# Transformaciones
ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)  # Para columnas (verticales)
ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)  # Para vigas (horizontales)

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

# ============================================================================
# RESUMEN PARA COMPARACION
# ============================================================================
print("\n" + "=" * 70)
print("RESUMEN PARA COMPARACION CON ETABS Y AWATIF")
print("=" * 70)

print(f"""
MODELO: Portico 2x2, 2 pisos, con voladizos

GEOMETRIA:
  - Grid: {n_col_x}x{n_col_y} columnas
  - Luces: Lx={Lx}m, Ly={Ly}m
  - Alturas: {n_pisos} pisos x {H}m = {n_pisos*H}m total
  - Voladizos: {len(voladizo_nodes)} vigas de {voladizo}m cada una

PROPIEDADES:
  - E = {E:.4e} Pa
  - rho = {rho} kg/m3
  - Columnas: {col_b*100:.0f}x{col_h*100:.0f} cm
  - Vigas: {beam_b*100:.0f}x{beam_h*100:.0f} cm

RESULTADOS OPENSEES:
""")

if results_opensees:
    for r in results_opensees[:3]:
        print(f"  Mode {r['mode']}: T={r['T']:.4f}s, f={r['f']:.3f}Hz")

print(f"""
NOTA:
  - Los voladizos estan CONECTADOS rigidamente a los nodos de esquina
  - El nodo extremo del voladizo puede rotar (no es mecanismo)
  - La masa del voladizo se distribuye a los nodos conectados

Para comparar con ETABS:
  1. Crear modelo con misma geometria
  2. Verificar que los voladizos no creen mecanismos
  3. Comparar periodos T1, T2, T3
""")
