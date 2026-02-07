"""
Comparacion: Estructura CON vs SIN escalera
Para verificar el efecto de la escalera en la rigidez
"""
import openseespy.opensees as ops
import json
import math

with open('model.json', 'r') as f:
    model_data = json.load(f)

nodes = model_data['nodes']
all_elements = model_data['elements']
supports = model_data['supports']
support_set = set(int(k) for k in supports.keys())

# Propiedades
E = 2.1e10  # Pa
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

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

def run_modal(elements_list, description, support_set, nodes):
    """Ejecuta analisis modal y retorna T1"""

    # Limpieza iterativa de nodos extremos
    elements = elements_list.copy()
    for _ in range(10):
        node_conn = {}
        for el in elements:
            node_conn[el[0]] = node_conn.get(el[0], 0) + 1
            node_conn[el[1]] = node_conn.get(el[1], 0) + 1

        tips = {n for n, c in node_conn.items() if c == 1 and n not in support_set}
        if not tips:
            break
        elements = [el for el in elements if el[0] not in tips and el[1] not in tips]

    # Remap
    used = set()
    for el in elements:
        used.add(el[0])
        used.add(el[1])

    sorted_used = sorted(list(used))
    old_to_new = {old: new for new, old in enumerate(sorted_used)}

    filtered_nodes = [nodes[idx] for idx in sorted_used]
    filtered_elements = [[old_to_new[n] for n in el] for el in elements]
    filtered_supports = {old_to_new[int(k)]: v for k, v in supports.items() if int(k) in old_to_new}

    # Modelo OpenSees
    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    for i, n in enumerate(filtered_nodes):
        ops.node(i + 1, float(n[0]), float(n[1]), float(n[2]))

    for idx, constraints in filtered_supports.items():
        ops.fix(idx + 1, *[1 if c else 0 for c in constraints])

    ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)
    ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)

    n_col, n_beam = 0, 0
    for i, el in enumerate(filtered_elements):
        n1, n2 = filtered_nodes[el[0]], filtered_nodes[el[1]]
        dz = abs(n2[2] - n1[2])

        if dz > 0.5:
            A, Iz, Iy, J = A_col, Iz_col, Iy_col, J_col
            transf = 1
            n_col += 1
        else:
            A, Iz, Iy, J = A_beam, Iz_beam, Iy_beam, J_beam
            transf = 2
            n_beam += 1

        ops.element('elasticBeamColumn', i + 1, el[0] + 1, el[1] + 1, A, E, G, J, Iy, Iz, transf)

    # Masa
    for i, el in enumerate(filtered_elements):
        n1, n2 = filtered_nodes[el[0]], filtered_nodes[el[1]]
        dx, dy, dz = n2[0]-n1[0], n2[1]-n1[1], n2[2]-n1[2]
        L = math.sqrt(dx*dx + dy*dy + dz*dz)
        A = A_col if abs(dz) > 0.5 else A_beam
        mass = rho * A * L / 2

        for node_idx in el:
            if node_idx not in filtered_supports:
                ops.mass(node_idx + 1, mass, mass, mass, 0, 0, 0)

    try:
        evs = ops.eigen(6)
        if evs[0] > 0:
            T1 = 1 / (math.sqrt(evs[0]) / (2 * math.pi))
        else:
            T1 = float('inf')
    except:
        T1 = float('inf')

    ops.wipe()

    return T1, len(filtered_nodes), n_col, n_beam

print("=" * 70)
print("COMPARACION: CON vs SIN ESCALERA")
print("=" * 70)

# Niveles principales
main_levels = [0.0, 0.1, 3.52, 6.58]
tolerance = 0.15

def is_main(z):
    return any(abs(z - l) < tolerance for l in main_levels)

# Caso 1: SOLO PORTICO PRINCIPAL (sin escalera ni elementos adicionales)
print("\n>>> CASO 1: Solo niveles principales, L > 2m")
elements_main = []
for el in all_elements:
    z1, z2 = nodes[el[0]][2], nodes[el[1]][2]
    dx = nodes[el[1]][0] - nodes[el[0]][0]
    dy = nodes[el[1]][1] - nodes[el[0]][1]
    dz = nodes[el[1]][2] - nodes[el[0]][2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)

    # Solo elementos largos (columnas y vigas principales)
    if is_main(z1) and is_main(z2) and L > 2.0:
        elements_main.append(el)

T1_main, n_nodes, n_col, n_beam = run_modal(elements_main, "Solo principales", support_set, nodes)
print(f"   Nodos: {n_nodes}, Columnas: {n_col}, Vigas: {n_beam}")
print(f"   T1 = {T1_main:.4f}s, f1 = {1/T1_main:.3f}Hz")

# Caso 2: PORTICO + VIGAS CORTAS (offsets)
print("\n>>> CASO 2: Niveles principales, L > 0.3m (incluye offsets)")
elements_offset = []
for el in all_elements:
    z1, z2 = nodes[el[0]][2], nodes[el[1]][2]
    dx = nodes[el[1]][0] - nodes[el[0]][0]
    dy = nodes[el[1]][1] - nodes[el[0]][1]
    dz = nodes[el[1]][2] - nodes[el[0]][2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)

    if is_main(z1) and is_main(z2) and L > 0.3:
        elements_offset.append(el)

T1_offset, n_nodes, n_col, n_beam = run_modal(elements_offset, "Con offsets", support_set, nodes)
print(f"   Nodos: {n_nodes}, Columnas: {n_col}, Vigas: {n_beam}")
print(f"   T1 = {T1_offset:.4f}s, f1 = {1/T1_offset:.3f}Hz")

# Caso 3: TODO (incluyendo escalera)
print("\n>>> CASO 3: Todos los elementos (con escalera)")
elements_all = []
for el in all_elements:
    dx = nodes[el[1]][0] - nodes[el[0]][0]
    dy = nodes[el[1]][1] - nodes[el[0]][1]
    dz = nodes[el[1]][2] - nodes[el[0]][2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)
    if L > 0.3:  # Excluir solo elementos muy cortos
        elements_all.append(el)

T1_all, n_nodes, n_col, n_beam = run_modal(elements_all, "Con escalera", support_set, nodes)
print(f"   Nodos: {n_nodes}, Columnas: {n_col}, Vigas: {n_beam}")
if T1_all < 1000:
    print(f"   T1 = {T1_all:.4f}s, f1 = {1/T1_all:.3f}Hz")
else:
    print(f"   T1 = INFINITO (mecanismo)")

# Resumen
print("\n" + "=" * 70)
print("RESUMEN:")
print("=" * 70)
print(f"  Solo vigas largas (L>2m):   T1 = {T1_main:.4f}s")
print(f"  Con offsets (L>0.3m):       T1 = {T1_offset:.4f}s")
if T1_all < 1000:
    print(f"  Con escalera:               T1 = {T1_all:.4f}s")
    print(f"\nConclusiones:")
    if T1_all < T1_offset:
        print(f"  -> Escalera AUMENTA rigidez (reduce periodo {(1-T1_all/T1_offset)*100:.1f}%)")
    else:
        print(f"  -> Escalera REDUCE rigidez (aumenta periodo {(T1_all/T1_offset-1)*100:.1f}%)")
else:
    print(f"  Con escalera:               MECANISMO (nodos sin conectar)")
    print(f"\nConclusiones:")
    print(f"  -> Escalera tiene NODOS SUELTOS que crean mecanismos")
