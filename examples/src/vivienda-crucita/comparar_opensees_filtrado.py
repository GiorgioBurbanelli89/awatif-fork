"""
Comparacion Modal: OpenSeesPy vs Awatif
CON FILTRADO DE NODOS EXTREMOS (mismo que Awatif)
"""
import openseespy.opensees as ops
import json
import numpy as np
import math

with open('model.json', 'r') as f:
    model_data = json.load(f)

nodes = model_data['nodes']
all_elements = model_data['elements']
supports = model_data['supports']
support_set = set(int(k) for k in supports.keys())

print("=" * 60)
print("COMPARACION MODAL: OpenSees vs Awatif")
print("CON FILTRADO DE NODOS (sin voladizos)")
print("=" * 60)

# Unidades: Pa, kg/m3 (como test viviendaCrucita.test.ts)
E = 2.1e10  # Pa (= 21 GPa)
nu = 0.2
G = E / (2 * (1 + nu))
mass_density = 2400  # kg/m3 (NO dividir por g)

# Secciones
col_b, col_h = 0.30, 0.30
beam_b, beam_h = 0.25, 0.30

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
print(f"  rho_mass = {mass_density:.0f} kg/m3")

# ========= FILTRADO IGUAL QUE AWATIF =========
main_levels = [0.0, 0.1, 3.52, 6.58]
tolerance = 0.15

def is_main_level(z):
    return any(abs(z - lvl) < tolerance for lvl in main_levels)

# Filtrar elementos
elements = []
for el in all_elements:
    z1 = nodes[el[0]][2]
    z2 = nodes[el[1]][2]
    dx = nodes[el[1]][0] - nodes[el[0]][0]
    dy = nodes[el[1]][1] - nodes[el[0]][1]
    dz = nodes[el[1]][2] - nodes[el[0]][2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)
    if is_main_level(z1) and is_main_level(z2) and L > 0.3:
        elements.append(el)

print(f"\nElementos en niveles principales: {len(elements)}")

# Limpieza iterativa de nodos extremos sin apoyo
iterations = 0
max_iterations = 10
while iterations < max_iterations:
    node_connections = {}
    for el in elements:
        node_connections[el[0]] = node_connections.get(el[0], 0) + 1
        node_connections[el[1]] = node_connections.get(el[1], 0) + 1

    tip_nodes = set()
    for node_id, count in node_connections.items():
        if count == 1 and node_id not in support_set:
            tip_nodes.add(node_id)

    if not tip_nodes:
        break

    print(f"  Iter {iterations + 1}: eliminando {len(tip_nodes)} nodos en voladizo")
    elements = [el for el in elements if el[0] not in tip_nodes and el[1] not in tip_nodes]
    iterations += 1

print(f"Elementos limpios: {len(elements)}")

# Obtener nodos usados
used_nodes = set()
for el in elements:
    used_nodes.add(el[0])
    used_nodes.add(el[1])

sorted_used = sorted(list(used_nodes))
old_to_new = {old: new for new, old in enumerate(sorted_used)}

# Filtrar nodos
filtered_nodes = [nodes[idx] for idx in sorted_used]

# Remap elementos
filtered_elements = [[old_to_new[n] for n in el] for el in elements]

# Remap soportes
filtered_supports = {}
for key, val in supports.items():
    old_idx = int(key)
    if old_idx in old_to_new:
        filtered_supports[old_to_new[old_idx]] = val

print(f"Nodos: {len(filtered_nodes)}, Apoyos: {len(filtered_supports)}")

# Clasificar elementos
columns, beams = [], []
for i, el in enumerate(filtered_elements):
    dz = abs(filtered_nodes[el[1]][2] - filtered_nodes[el[0]][2])
    if dz > 0.5:
        columns.append(i)
    else:
        beams.append(i)

print(f"Columnas: {len(columns)}, Vigas: {len(beams)}")

# ========= CREAR MODELO OPENSEES =========
ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

# Nodos
for i, node in enumerate(filtered_nodes):
    ops.node(i + 1, float(node[0]), float(node[1]), float(node[2]))

# Apoyos
for node_idx, constraints in filtered_supports.items():
    ops.fix(node_idx + 1, *[1 if c else 0 for c in constraints])

# Transformaciones
ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)  # columnas
ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)  # vigas

# Elementos
for i, el in enumerate(filtered_elements):
    n1, n2 = filtered_nodes[el[0]], filtered_nodes[el[1]]
    dz = abs(n2[2] - n1[2])

    if dz > 0.5:  # Columna
        A, Iz, Iy, J = A_col, Iz_col, Iy_col, J_col
        transf = 1
    else:  # Viga
        A, Iz, Iy, J = A_beam, Iz_beam, Iy_beam, J_beam
        transf = 2

    ops.element('elasticBeamColumn', i + 1, el[0] + 1, el[1] + 1, A, E, G, J, Iy, Iz, transf)

# Masa lumped
for i, el in enumerate(filtered_elements):
    n1, n2 = filtered_nodes[el[0]], filtered_nodes[el[1]]
    dx = n2[0] - n1[0]
    dy = n2[1] - n1[1]
    dz = n2[2] - n1[2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)
    A = A_col if abs(dz) > 0.5 else A_beam
    mass = mass_density * A * L / 2  # ton

    for node_idx in el:
        if node_idx not in filtered_supports:
            ops.mass(node_idx + 1, mass, mass, mass, 0, 0, 0)

# Analisis modal
num_modes = 6
eigenvalues = ops.eigen(num_modes)

print(f"\n{'='*60}")
print("RESULTADOS OPENSEES:")
print(f"{'='*60}")

print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12} {'Eigenvalue':<15}")
print("-" * 50)

for i, ev in enumerate(eigenvalues[:6]):
    if ev > 0:
        omega = math.sqrt(ev)
        freq = omega / (2 * math.pi)
        period = 1 / freq if freq > 0 else 0
        print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f} {ev:<15.4f}")
    else:
        print(f"{i+1:<6} {'N/A':<12} {'N/A':<12} {ev:<15.4f}")

print(f"\n{'='*60}")
print("COMPARACION CON AWATIF:")
print(f"{'='*60}")
print("\nAwatif (test viviendaCrucita.test.ts):")
print("  Mode 1: T=0.5965s, f=1.676Hz")
print("  Mode 2: T=0.3325s, f=3.007Hz")
print("  Mode 3: T=0.3046s, f=3.283Hz")
print("  Mode 4: T=0.2873s, f=3.481Hz")
print("  Mode 5: T=0.2850s, f=3.508Hz")
print("  Mode 6: T=0.2349s, f=4.257Hz")

# Verificar
print("\nVerificacion:")
if eigenvalues[0] > 0:
    T1_opensees = 1 / (math.sqrt(eigenvalues[0]) / (2 * math.pi))
    T1_awatif = 0.5965
    diff = abs(T1_opensees - T1_awatif) / T1_awatif * 100
    print(f"  T1 OpenSees: {T1_opensees:.4f}s")
    print(f"  T1 Awatif:   {T1_awatif:.4f}s")
    print(f"  Diferencia:  {diff:.1f}%")
else:
    print("  ERROR: Eigenvalue negativo")

ops.wipe()
