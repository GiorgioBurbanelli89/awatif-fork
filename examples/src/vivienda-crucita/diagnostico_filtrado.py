"""
Diagnostico del modelo despues de filtrar
"""
import json
import math

with open('model.json', 'r') as f:
    data = json.load(f)

nodes = data['nodes']
all_elements = data['elements']
supports = data['supports']
support_indices = set(int(k) for k in supports.keys())

# Main structural levels (exclude stair intermediate levels)
main_levels = [0.0, 0.1, 3.52, 6.58]
tolerance = 0.15

def is_main_level(z):
    return any(abs(z - lvl) < tolerance for lvl in main_levels)

# Filter elements
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

print(f"Elementos filtrados: {len(elements)} (de {len(all_elements)})")

# Get used nodes
used_nodes = set()
for el in elements:
    used_nodes.add(el[0])
    used_nodes.add(el[1])

print(f"Nodos usados: {len(used_nodes)}")

# Count connections per node
node_connections = {n: 0 for n in used_nodes}
for el in elements:
    node_connections[el[0]] += 1
    node_connections[el[1]] += 1

# Classify nodes
tip_nodes = [n for n, c in node_connections.items() if c == 1]
supported_tips = [n for n in tip_nodes if n in support_indices]
unsupported_tips = [n for n in tip_nodes if n not in support_indices]

print(f"\nNodos extremos (1 conexion): {len(tip_nodes)}")
print(f"  Con apoyo: {len(supported_tips)}")
print(f"  Sin apoyo: {len(unsupported_tips)} <- PROBLEMA")

if unsupported_tips:
    print(f"\nNodos extremos sin apoyo:")
    for n in unsupported_tips[:10]:
        z = nodes[n][2]
        print(f"  Nodo {n}: Z={z:.2f}m")

# Check if supports are in used nodes
used_supports = support_indices & used_nodes
missing_supports = support_indices - used_nodes
print(f"\nApoyos usados: {len(used_supports)}")
print(f"Apoyos no usados (nodos fuera del modelo): {missing_supports}")

# Check levels
z_levels = sorted(set(round(nodes[n][2], 2) for n in used_nodes))
print(f"\nNiveles Z usados: {z_levels}")

# Count columns and beams
columns = []
beams = []
for el in elements:
    dz = abs(nodes[el[1]][2] - nodes[el[0]][2])
    if dz > 0.5:
        columns.append(el)
    else:
        beams.append(el)

print(f"\nColumnas: {len(columns)}")
print(f"Vigas: {len(beams)}")

# Verify all columns have supports at base
column_bases = set()
for el in columns:
    z0, z1 = nodes[el[0]][2], nodes[el[1]][2]
    base_node = el[0] if z0 < z1 else el[1]
    if nodes[base_node][2] < 0.2:  # base level
        column_bases.add(base_node)

print(f"\nBases de columnas: {len(column_bases)}")
unsupported_bases = column_bases - support_indices
if unsupported_bases:
    print(f"  SIN APOYO: {unsupported_bases}")
else:
    print(f"  Todas soportadas: OK")
