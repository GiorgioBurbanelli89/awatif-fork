"""
Comparación Modal: OpenSeesPy vs Awatif
Modelo: Vivienda Crucita

Este script ejecuta análisis modal en OpenSees y compara con Awatif.
Usa las MISMAS propiedades y unidades para garantizar comparación válida.
"""

import openseespy.opensees as ops
import json
import numpy as np
import math

# Leer modelo JSON
with open('model.json', 'r') as f:
    model_data = json.load(f)

nodes = model_data['nodes']
elements = model_data['elements']
supports = model_data['supports']

print("=" * 60)
print("ANÁLISIS MODAL - VIVIENDA CRUCITA")
print("OpenSeesPy vs Awatif")
print("=" * 60)

# Unidades: SI (Pa, kg, m, s)
E = 2.1e10  # Pa (concreto f'c=210 kg/cm2)
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

# Secciones
col_b, col_h = 0.30, 0.30  # columnas 30x30 cm
beam_b, beam_h = 0.25, 0.30  # vigas 25x30 cm

A_col = col_b * col_h
Iz_col = col_b * col_h**3 / 12
Iy_col = col_h * col_b**3 / 12
J_col = 0.141 * min(col_b, col_h)**4

A_beam = beam_b * beam_h
Iz_beam = beam_b * beam_h**3 / 12
Iy_beam = beam_h * beam_b**3 / 12
J_beam = 0.141 * min(beam_b, beam_h)**4

print(f"\nPropiedades del material:")
print(f"  E = {E:.3e} Pa")
print(f"  G = {G:.3e} Pa")
print(f"  rho = {rho} kg/m3")

print(f"\nSecciones:")
print(f"  Columna: {col_b*100:.0f}x{col_h*100:.0f} cm, A={A_col:.4f} m2, Iz={Iz_col:.6e} m4")
print(f"  Viga: {beam_b*100:.0f}x{beam_h*100:.0f} cm, A={A_beam:.4f} m2, Iz={Iz_beam:.6e} m4")

# Filtrar nodos usados por elementos (igual que en Awatif test)
used_nodes = set()
for el in elements:
    for nidx in el:
        used_nodes.add(nidx)

sorted_used = sorted(list(used_nodes))
old_to_new = {old: new for new, old in enumerate(sorted_used)}

# Filtrar nodos
filtered_nodes = [nodes[idx] for idx in sorted_used]

# Remap elementos
filtered_elements = []
for el in elements:
    new_el = [old_to_new[nidx] for nidx in el]
    filtered_elements.append(new_el)

# Remap soportes
filtered_supports = {}
for key, val in supports.items():
    old_idx = int(key)
    if old_idx in old_to_new:
        filtered_supports[old_to_new[old_idx]] = val

print(f"\nModelo:")
print(f"  Nodos originales: {len(nodes)}")
print(f"  Nodos usados: {len(filtered_nodes)}")
print(f"  Elementos: {len(filtered_elements)}")
print(f"  Apoyos: {len(filtered_supports)}")

# Clasificar elementos
columns = []
beams = []
for i, el in enumerate(filtered_elements):
    n1 = filtered_nodes[el[0]]
    n2 = filtered_nodes[el[1]]
    dz = abs(n2[2] - n1[2])
    if dz > 0.5:
        columns.append(i)
    else:
        beams.append(i)

print(f"  Columnas: {len(columns)}, Vigas: {len(beams)}")

# Crear modelo OpenSees
ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

# Crear nodos
for i, node in enumerate(filtered_nodes):
    tag = i + 1  # OpenSees usa tags desde 1
    ops.node(tag, float(node[0]), float(node[1]), float(node[2]))

# Aplicar restricciones
for node_idx, constraints in filtered_supports.items():
    tag = node_idx + 1
    # constraints es [ux, uy, uz, rx, ry, rz] donde true = restringido
    fix_vals = [1 if c else 0 for c in constraints]
    ops.fix(tag, *fix_vals)

print(f"\nNodos con restricciones: {list(filtered_supports.keys())}")

# Definir transformación geométrica
# Para columnas (verticales): usar vector local Y en dirección global X o Y
ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)  # para elementos en Z
ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)  # para elementos horizontales

# Crear elementos
for i, el in enumerate(filtered_elements):
    tag = i + 1
    n1_tag = el[0] + 1
    n2_tag = el[1] + 1

    n1 = filtered_nodes[el[0]]
    n2 = filtered_nodes[el[1]]
    dz = abs(n2[2] - n1[2])

    if dz > 0.5:  # Columna
        A, Iz, Iy, J = A_col, Iz_col, Iy_col, J_col
        transf = 1
    else:  # Viga
        A, Iz, Iy, J = A_beam, Iz_beam, Iy_beam, J_beam
        transf = 2

    # elasticBeamColumn: tag, i, j, A, E, G, J, Iy, Iz, transf
    ops.element('elasticBeamColumn', tag, n1_tag, n2_tag, A, E, G, J, Iy, Iz, transf)

# Contar conexiones por nodo
node_connections = {i: 0 for i in range(len(filtered_nodes))}
for el in filtered_elements:
    node_connections[el[0]] += 1
    node_connections[el[1]] += 1

isolated_nodes = [n for n, c in node_connections.items() if c == 0]
tip_nodes = [n for n, c in node_connections.items() if c == 1]
print(f"\nConectividad:")
print(f"  Nodos aislados (0 elementos): {len(isolated_nodes)}")
print(f"  Nodos extremos (1 elemento): {len(tip_nodes)}")

# Masa consistente
nodes_with_mass = set()
for i, el in enumerate(filtered_elements):
    tag = i + 1
    n1 = filtered_nodes[el[0]]
    n2 = filtered_nodes[el[1]]

    dx = n2[0] - n1[0]
    dy = n2[1] - n1[1]
    dz = n2[2] - n1[2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)

    if abs(dz) > 0.5:  # Columna
        A = A_col
    else:  # Viga
        A = A_beam

    mass = rho * A * L / 2  # masa por nodo (lumped)

    n1_tag = el[0] + 1
    n2_tag = el[1] + 1

    # Agregar masa en nodos no restringidos
    if el[0] not in filtered_supports:
        ops.mass(n1_tag, mass, mass, mass, 0, 0, 0)
        nodes_with_mass.add(el[0])
    if el[1] not in filtered_supports:
        ops.mass(n2_tag, mass, mass, mass, 0, 0, 0)
        nodes_with_mass.add(el[1])

print(f"  Nodos con masa: {len(nodes_with_mass)}")
print(f"  Nodos sin masa (apoyos): {len(filtered_nodes) - len(nodes_with_mass)}")

# Análisis modal
num_modes = 6
eigenvalues = ops.eigen(num_modes)

print(f"\n{'='*60}")
print("RESULTADOS OPENSEES:")
print(f"{'='*60}")
print(f"\nEigenvalues: {eigenvalues[:6]}")

print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
print("-" * 30)

for i, ev in enumerate(eigenvalues[:6]):
    if ev > 0:
        omega = math.sqrt(ev)
        freq = omega / (2 * math.pi)
        period = 1 / freq if freq > 0 else 0
        print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f}")
    else:
        print(f"{i+1:<6} {'N/A':<12} {'N/A':<12} (eigenvalue <= 0)")

print(f"\n{'='*60}")
print("COMPARACIÓN:")
print(f"{'='*60}")
print("\nAwatif reportó:")
print("  Mode 1: T=21.27s, f=0.047Hz")
print("  Mode 2: T=21.27s, f=0.047Hz")
print("  Mode 3: T=21.27s, f=0.047Hz")
print("\nEsperado para edificio 2 pisos: T ~ 0.1-0.3s, f ~ 3-10Hz")

# Verificar masa total
total_mass = 0
for i, el in enumerate(filtered_elements):
    n1 = filtered_nodes[el[0]]
    n2 = filtered_nodes[el[1]]
    dx, dy, dz = n2[0]-n1[0], n2[1]-n1[1], n2[2]-n1[2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)
    A = A_col if abs(dz) > 0.5 else A_beam
    total_mass += rho * A * L

print(f"\nMasa total de la estructura: {total_mass:.2f} kg = {total_mass/1000:.2f} ton")

ops.wipe()
