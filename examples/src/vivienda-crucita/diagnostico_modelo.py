"""
Diagnóstico del modelo estructural
"""
import json
import math

with open('model.json', 'r') as f:
    data = json.load(f)

nodes = data['nodes']
elements = data['elements']
supports = data['supports']

print("=" * 60)
print("DIAGNOSTICO DEL MODELO ESTRUCTURAL")
print("=" * 60)

# Contar conexiones por nodo
node_connections = {i: [] for i in range(len(nodes))}
for i, el in enumerate(elements):
    node_connections[el[0]].append(i)
    node_connections[el[1]].append(i)

# Nodos usados por elementos
used_nodes = set()
for el in elements:
    used_nodes.add(el[0])
    used_nodes.add(el[1])

unused_nodes = set(range(len(nodes))) - used_nodes

print(f"\nNodos totales: {len(nodes)}")
print(f"Nodos usados: {len(used_nodes)}")
print(f"Nodos no usados: {len(unused_nodes)}")
if unused_nodes:
    print(f"  Indices: {sorted(list(unused_nodes))[:20]}...")

# Clasificar nodos por numero de conexiones
by_connections = {}
for node_id, elems in node_connections.items():
    n = len(elems)
    if n not in by_connections:
        by_connections[n] = []
    by_connections[n].append(node_id)

print(f"\nConexiones por nodo:")
for n_conn in sorted(by_connections.keys()):
    nodes_list = by_connections[n_conn]
    print(f"  {n_conn} elementos: {len(nodes_list)} nodos")

# Analizar nodos extremos (1 conexion) - potenciales mecanismos
tip_nodes = by_connections.get(1, [])
if tip_nodes:
    print(f"\nNodos extremos (1 conexion):")
    for node_id in tip_nodes[:10]:  # mostrar primeros 10
        coords = nodes[node_id]
        elem_idx = node_connections[node_id][0]
        el = elements[elem_idx]
        other_node = el[1] if el[0] == node_id else el[0]
        other_coords = nodes[other_node]

        dx = other_coords[0] - coords[0]
        dy = other_coords[1] - coords[1]
        dz = other_coords[2] - coords[2]
        L = math.sqrt(dx*dx + dy*dy + dz*dz)
        is_col = abs(dz) > 0.5

        print(f"  Nodo {node_id}: ({coords[0]:.2f}, {coords[1]:.2f}, {coords[2]:.2f})")
        print(f"    -> Elem {elem_idx} ({('COL' if is_col else 'VIGA')}, L={L:.2f}m) -> Nodo {other_node}")

# Verificar apoyos
print(f"\nApoyos:")
print(f"  Total: {len(supports)}")
support_indices = [int(k) for k in supports.keys()]
support_z = [nodes[i][2] for i in support_indices if i < len(nodes)]
print(f"  Indices: {support_indices}")
print(f"  Z coords: {set([round(z, 2) for z in support_z])}")

# Verificar que apoyos esten en nodos de base
base_nodes = [i for i, n in enumerate(nodes) if n[2] < 0.2]  # Z cerca de 0
print(f"\nNodos de base (Z < 0.2): {len(base_nodes)}")
print(f"  Indices: {base_nodes[:15]}...")

# Verificar si hay columnas sin apoyos en la base
column_base_nodes = []
for i, el in enumerate(elements):
    n1, n2 = el
    z1, z2 = nodes[n1][2], nodes[n2][2]
    if abs(z2 - z1) > 0.5:  # columna
        bottom = n1 if z1 < z2 else n2
        if nodes[bottom][2] < 0.2:  # base
            column_base_nodes.append(bottom)

column_base_set = set(column_base_nodes)
supported_set = set(support_indices)
unsupported_columns = column_base_set - supported_set

print(f"\nColumnas en base: {len(column_base_set)} nodos")
print(f"  Soportados: {len(column_base_set & supported_set)}")
print(f"  Sin soporte: {len(unsupported_columns)}")
if unsupported_columns:
    print(f"  Nodos sin soporte: {sorted(list(unsupported_columns))}")

# Analizar niveles
z_coords = sorted(set([round(n[2], 2) for n in nodes]))
print(f"\nNiveles Z: {z_coords}")

# Contar elementos por tipo
columns = []
beams = []
for i, el in enumerate(elements):
    dz = abs(nodes[el[1]][2] - nodes[el[0]][2])
    if dz > 0.5:
        columns.append(i)
    else:
        beams.append(i)

print(f"\nElementos:")
print(f"  Columnas: {len(columns)}")
print(f"  Vigas: {len(beams)}")

# Verificar vigas por nivel
beams_by_level = {}
for i in beams:
    el = elements[i]
    z = round(nodes[el[0]][2], 2)
    if z not in beams_by_level:
        beams_by_level[z] = []
    beams_by_level[z].append(i)

print(f"\nVigas por nivel:")
for z in sorted(beams_by_level.keys()):
    print(f"  Z={z}: {len(beams_by_level[z])} vigas")

# Verificar escalera
# Buscar nodos con Z > 6.58 (nivel de cubierta)
high_nodes = [i for i, n in enumerate(nodes) if n[2] > 6.6]
print(f"\nNodos sobre cubierta (escalera?): {len(high_nodes)}")
for node_id in high_nodes[:5]:
    print(f"  Nodo {node_id}: Z={nodes[node_id][2]:.2f}m")
