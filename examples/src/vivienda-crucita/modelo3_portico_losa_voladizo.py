# -*- coding: utf-8 -*-
"""
MODELO 3: Portico 3D 1 piso + Losa Shell + Voladizos
Para comparar ETABS vs OpenSees vs Awatif

Geometria:
- 4 columnas formando un portico 4m x 4m, altura 3m
- Vigas conectando las columnas en el tope
- Losa shell-thin de 12cm cubriendo el area + voladizos
- 4 voladizos de 1.5m en cada direccion (X, -X, Y, -Y)

Vista en planta (z = 3m):
                    Y
                    ^
                    |
    +---------------+---------------+
    |               |               |
    |   voladizo    |   voladizo    |
    |   1.5m        |   1.5m        |
    +-------+-------+-------+-------+
    |       |   LOSA        |       |
    |       |   4m x 4m     |       |
    | vol   +-------+-------+  vol  |---> X
    |       |               |       |
    |       |               |       |
    +-------+-------+-------+-------+
    |               |               |
    |   voladizo    |   voladizo    |
    |               |               |
    +---------------+---------------+

Losa total: 7m x 7m (4m + 1.5m*2)
Malla: 7x7 = 49 nodos de losa, 36 elementos shell
"""
import openseespy.opensees as ops
import math
import json

print("=" * 70)
print("MODELO 3: Portico 3D + Losa Shell + Voladizos")
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
slab_t = 0.12  # Espesor losa 12cm

A_col = col_b * col_h
Iz_col = col_b * col_h**3 / 12
Iy_col = col_h * col_b**3 / 12
J_col = 0.141 * min(col_b, col_h)**4

A_beam = beam_b * beam_h
Iy_beam = beam_b * beam_h**3 / 12
Iz_beam = beam_h * beam_b**3 / 12
J_beam = 0.141 * min(beam_b, beam_h)**4

print(f"\nSecciones:")
print(f"  Columna: {col_b*100:.0f}x{col_h*100:.0f}cm")
print(f"  Viga: {beam_b*100:.0f}x{beam_h*100:.0f}cm")
print(f"  Losa: t = {slab_t*100:.0f}cm")

# =============================================================================
# GEOMETRIA
# =============================================================================
H = 3.0  # Altura
Lx = 4.0  # Dimension en X
Ly = 4.0  # Dimension en Y
voladizo = 1.5  # Voladizo en cada direccion

# Limites de la losa con voladizos
x_min = -voladizo
x_max = Lx + voladizo
y_min = -voladizo
y_max = Ly + voladizo

# Malla de nodos para losa (dividir en segmentos)
nx = 7  # Numero de divisiones en X
ny = 7  # Numero de divisiones en Y
dx = (x_max - x_min) / (nx - 1)
dy = (y_max - y_min) / (ny - 1)

nodes = []
node_grid = {}  # (i, j) -> node_id

# Nodos de base (columnas z=0)
col_positions = [
    (0.0, 0.0),
    (Lx, 0.0),
    (0.0, Ly),
    (Lx, Ly)
]

base_node_ids = []
for x, y in col_positions:
    node_id = len(nodes)
    nodes.append([x, y, 0.0])
    base_node_ids.append(node_id)

# Nodos de losa (z = H)
losa_node_start = len(nodes)
for j in range(ny):
    for i in range(nx):
        x = x_min + i * dx
        y = y_min + j * dy
        node_id = len(nodes)
        nodes.append([x, y, H])
        node_grid[(i, j)] = node_id

# Encontrar nodos de columna en losa (esquinas del portico)
def find_closest_grid_node(x_target, y_target):
    """Encuentra el nodo de la grilla mas cercano a la posicion dada"""
    min_dist = float('inf')
    closest = None
    for (i, j), node_id in node_grid.items():
        x, y, z = nodes[node_id]
        dist = math.sqrt((x - x_target)**2 + (y - y_target)**2)
        if dist < min_dist:
            min_dist = dist
            closest = (i, j, node_id)
    return closest

col_top_nodes = []
for x, y in col_positions:
    i, j, node_id = find_closest_grid_node(x, y)
    col_top_nodes.append(node_id)

print(f"\nGeometria:")
print(f"  Portico: {Lx}m x {Ly}m, H = {H}m")
print(f"  Voladizo: {voladizo}m en cada direccion")
print(f"  Losa total: {x_max - x_min:.1f}m x {y_max - y_min:.1f}m")
print(f"  Nodos: {len(nodes)} (4 base + {len(nodes)-4} losa)")

# Elementos
elements = []
element_types = []

# Columnas
for i, (base, top) in enumerate(zip(base_node_ids, col_top_nodes)):
    elements.append([base, top])
    element_types.append('col')

# Vigas perimetrales del portico (conectan columnas)
beam_pairs = [
    (col_top_nodes[0], col_top_nodes[1]),  # Viga X inferior
    (col_top_nodes[2], col_top_nodes[3]),  # Viga X superior
    (col_top_nodes[0], col_top_nodes[2]),  # Viga Y izquierda
    (col_top_nodes[1], col_top_nodes[3])   # Viga Y derecha
]

# NO agregar vigas - la losa actua como diafragma
# Si queremos vigas, las agregariamos aqui
# for n1, n2 in beam_pairs:
#     elements.append([n1, n2])
#     element_types.append('beam')

# Elementos shell (Quad4)
shell_elements = []
for j in range(ny - 1):
    for i in range(nx - 1):
        n1 = node_grid[(i, j)]
        n2 = node_grid[(i + 1, j)]
        n3 = node_grid[(i + 1, j + 1)]
        n4 = node_grid[(i, j + 1)]
        shell_elements.append([n1, n2, n3, n4])
        elements.append([n1, n2, n3, n4])
        element_types.append('shell')

print(f"  Columnas: {len(base_node_ids)}")
print(f"  Shells: {len(shell_elements)}")

# Apoyos
supports = {}
for node_id in base_node_ids:
    supports[node_id] = [True, True, True, True, True, True]

# =============================================================================
# GUARDAR MODELO JSON (para Awatif)
# =============================================================================
model_data = {
    "name": "Modelo 3: Portico + Losa + Voladizos",
    "units": "Pa, kg, m",
    "nodes": nodes,
    "elements": elements,
    "element_types": element_types,
    "supports": {str(k): v for k, v in supports.items()},
    "properties": {
        "E": E,
        "G": G,
        "nu": nu,
        "rho": rho,
        "col": {"A": A_col, "Iz": Iz_col, "Iy": Iy_col, "J": J_col},
        "beam": {"A": A_beam, "Iz": Iz_beam, "Iy": Iy_beam, "J": J_beam},
        "shell": {"t": slab_t}
    }
}

with open('modelo3.json', 'w') as f:
    json.dump(model_data, f, indent=2)
print("\n[OK] Modelo guardado en modelo3.json")

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

# Material para shell
ops.nDMaterial('ElasticIsotropic', 1, E, nu, rho)

# Seccion de shell
ops.section('PlateFiber', 1, 1, slab_t)

# Elementos
elem_id = 1
for el, typ in zip(elements, element_types):
    if typ == 'col':
        n1, n2 = el
        ops.element('elasticBeamColumn', elem_id, n1 + 1, n2 + 1,
                   A_col, E, G, J_col, Iy_col, Iz_col, 1)
    elif typ == 'shell':
        n1, n2, n3, n4 = el
        # ShellMITC4 para losas
        ops.element('ShellMITC4', elem_id, n1 + 1, n2 + 1, n3 + 1, n4 + 1, 1)
    elem_id += 1

# Masa lumped para columnas
for i, (base, top) in enumerate(zip(base_node_ids, col_top_nodes)):
    n1_coord = nodes[base]
    n2_coord = nodes[top]
    dz = n2_coord[2] - n1_coord[2]
    L = abs(dz)
    mass = rho * A_col * L / 2

    if base not in supports:
        ops.mass(base + 1, mass, mass, mass, 0, 0, 0)
    if top not in supports:
        ops.mass(top + 1, mass, mass, mass, 0, 0, 0)

# Masa de losa (distribuida a nodos)
area_total = (x_max - x_min) * (y_max - y_min)
mass_total = rho * area_total * slab_t
n_losa_nodes = nx * ny
mass_per_node = mass_total / n_losa_nodes

for (i, j), node_id in node_grid.items():
    if node_id not in supports:
        ops.mass(node_id + 1, mass_per_node, mass_per_node, 0, 0, 0, 0)

print(f"\nMasa losa total: {mass_total:.0f} kg")
print(f"Masa por nodo: {mass_per_node:.2f} kg")

# Analisis modal
try:
    eigenvalues = ops.eigen(12)

    print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
    print("-" * 35)

    results_opensees = []
    for i, ev in enumerate(eigenvalues[:12]):
        if ev > 0:
            omega = math.sqrt(ev)
            freq = omega / (2 * math.pi)
            period = 1 / freq
            results_opensees.append({'mode': i+1, 'T': period, 'f': freq})
            print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f}")
        else:
            print(f"{i+1:<6} {'ERROR':<12} {'ev<0':<12}")

except Exception as e:
    print(f"ERROR en OpenSees: {e}")
    import traceback
    traceback.print_exc()

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
   - Grid: 7x7 en X e Y (de {x_min} a {x_max})
   - Pisos: 1 piso a {H}m

2. Materiales:
   - Concrete, fc = 21 MPa
   - E = {E/1e6:.0f} MPa, nu = {nu}

3. Secciones:
   - Columna: Rectangular {col_b*100:.0f}x{col_h*100:.0f}cm
   - Losa: Shell-Thin, t = {slab_t*100:.0f}cm

4. Dibujar elementos:
   - 4 columnas en: (0,0), ({Lx},0), (0,{Ly}), ({Lx},{Ly})
   - Losa shell cubriendo toda el area {x_max-x_min:.1f}m x {y_max-y_min:.1f}m
     (incluyendo voladizos de {voladizo}m en cada lado)

5. Apoyos:
   - Empotrar los 4 nodos base

6. Fuente de masa:
   - From Element Self Mass

7. Analisis Modal:
   - 12 modos minimo
   - Run Analysis

8. NOTA IMPORTANTE - Voladizo de losa:
   La losa se extiende {voladizo}m mas alla de las columnas
   en cada direccion, creando voladizos en la losa.

9. Comparar con OpenSees:
""")
if results_opensees:
    for r in results_opensees[:6]:
        print(f"   Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
