"""
Analizar nodos extremos que causan mecanismos
"""
import json
import math

with open('model.json', 'r') as f:
    data = json.load(f)

nodes = data['nodes']
elements = data['elements']
supports = data['supports']
support_indices = set(int(k) for k in supports.keys())

# Contar conexiones por nodo
node_connections = {i: [] for i in range(len(nodes))}
for i, el in enumerate(elements):
    node_connections[el[0]].append(i)
    node_connections[el[1]].append(i)

# Nodos extremos (1 conexion)
tip_nodes = [n for n, elems in node_connections.items() if len(elems) == 1]

print("=" * 70)
print("NODOS EXTREMOS - ANALISIS DE MECANISMOS")
print("=" * 70)

# Clasificar nodos extremos
supported_tips = []
unsupported_tips = []

for node_id in tip_nodes:
    if node_id in support_indices:
        supported_tips.append(node_id)
    else:
        unsupported_tips.append(node_id)

print(f"\nNodos extremos totales: {len(tip_nodes)}")
print(f"  Con apoyo: {len(supported_tips)} (OK, no son mecanismos)")
print(f"  Sin apoyo: {len(unsupported_tips)} (PROBLEMA - mecanismos potenciales)")

if unsupported_tips:
    print(f"\n*** NODOS EXTREMOS SIN APOYO (mecanismos) ***")
    for node_id in unsupported_tips:
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

        print(f"\n  Nodo {node_id}:")
        print(f"    Coords: ({coords[0]:.2f}, {coords[1]:.2f}, Z={coords[2]:.2f}m)")
        print(f"    Conectado a: Elem {elem_idx} ({('COL' if is_col else 'VIGA')}, L={L:.2f}m)")
        print(f"    Otro nodo: {other_node} (Z={other_coords[2]:.2f}m)")

# Analizar conectividad de la escalera
print("\n" + "=" * 70)
print("ANALISIS DE ESCALERA")
print("=" * 70)

# Encontrar nodos de escalera (Z intermedios)
main_levels = [0.0, 0.1, 3.52, 6.58, 7.58]
stair_nodes = []
for i, n in enumerate(nodes):
    z = n[2]
    is_main = any(abs(z - lvl) < 0.1 for lvl in main_levels)
    if not is_main and i in [el[0] for el in elements] or i in [el[1] for el in elements]:
        stair_nodes.append(i)

if stair_nodes:
    print(f"\nNodos de escalera (niveles intermedios): {len(stair_nodes)}")
    for node_id in stair_nodes[:10]:
        coords = nodes[node_id]
        n_conns = len(node_connections[node_id])
        print(f"  Nodo {node_id}: Z={coords[2]:.2f}m, {n_conns} conexiones")

# Ver los elementos cortos (escalera)
print("\n" + "=" * 70)
print("ELEMENTOS CORTOS (< 0.5m)")
print("=" * 70)

short_elements = []
for i, el in enumerate(elements):
    n1, n2 = el
    dx = nodes[n2][0] - nodes[n1][0]
    dy = nodes[n2][1] - nodes[n1][1]
    dz = nodes[n2][2] - nodes[n1][2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)
    if L < 0.5:
        short_elements.append((i, el, L))

print(f"\nElementos cortos: {len(short_elements)}")
for elem_idx, el, L in short_elements[:15]:
    n1, n2 = el
    z1, z2 = nodes[n1][2], nodes[n2][2]
    dz = abs(z2 - z1)
    tipo = "COL" if dz > L * 0.8 else "VIGA"
    print(f"  Elem {elem_idx}: L={L:.3f}m ({tipo}), Z1={z1:.2f}, Z2={z2:.2f}")
