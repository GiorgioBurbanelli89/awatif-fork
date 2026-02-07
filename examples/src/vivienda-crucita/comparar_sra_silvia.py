# -*- coding: utf-8 -*-
"""
Comparar modelo "sra silvia" entre ETABS, OpenSees y Awatif
Usa los datos extraidos de sra_silvia_extraido.json
"""
import json
import math
import openseespy.opensees as ops

print("=" * 70)
print("COMPARACION: sra silvia")
print("ETABS vs OpenSees vs Awatif")
print("=" * 70)

# Cargar datos extraidos
with open('sra_silvia_extraido.json', 'r', encoding='utf-8') as f:
    model_data = json.load(f)

nodes_raw = model_data['nodes']
frames_raw = model_data['frames']
areas_raw = model_data['areas']
supports_raw = model_data['supports']
z_levels = model_data['z_levels']

print(f"\nDatos cargados:")
print(f"  Nodos: {len(nodes_raw)}")
print(f"  Frames: {len(frames_raw)}")
print(f"  Areas: {len(areas_raw)}")
print(f"  Apoyos: {len(supports_raw)}")
print(f"  Niveles: {z_levels}")

# =============================================================================
# PROPIEDADES DEL MATERIAL
# =============================================================================
fc = 210  # kg/cm2
E_kgcm2 = 15100 * math.sqrt(fc)
E = E_kgcm2 * 98066.5  # Pa
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

# Secciones (basado en los nombres del modelo)
sections = {
    'C 30X30 cm': {'b': 0.30, 'h': 0.30, 'type': 'frame'},
    'C25X40': {'b': 0.25, 'h': 0.40, 'type': 'frame'},
    'V 25X30 cm': {'b': 0.25, 'h': 0.30, 'type': 'frame'},
    'VB 20X20 cm': {'b': 0.20, 'h': 0.20, 'type': 'frame'},
    'Losa 20 cm': {'t': 0.20, 'type': 'shell'},
    'Escalera': {'t': 0.15, 'type': 'shell'},
    'CUBIERTA': {'t': 0.10, 'type': 'shell'},
}

# Metalicas (ignorar por ahora o usar valores aproximados)
sections['TH 100X50X3'] = {'b': 0.10, 'h': 0.05, 'type': 'frame'}
sections['1G_40X80X15X2mm_der'] = {'b': 0.08, 'h': 0.04, 'type': 'frame'}

print(f"\nPropiedades:")
print(f"  E = {E/1e9:.2f} GPa")
print(f"  rho = {rho} kg/m3")

# =============================================================================
# PREPARAR DATOS PARA OPENSEES
# =============================================================================
# Mapear nombres de nodos a indices
node_name_to_idx = {}
nodes_list = []
for i, (name, coords) in enumerate(nodes_raw.items()):
    node_name_to_idx[name] = i
    nodes_list.append([coords['x'], coords['y'], coords['z']])

# Preparar frames
elements_list = []
element_props = []

for frame in frames_raw:
    n1_name = frame['point1']
    n2_name = frame['point2']

    if n1_name not in node_name_to_idx or n2_name not in node_name_to_idx:
        continue

    n1 = node_name_to_idx[n1_name]
    n2 = node_name_to_idx[n2_name]

    section_name = frame['section']
    sec = sections.get(section_name, {'b': 0.25, 'h': 0.25, 'type': 'frame'})

    if sec['type'] != 'frame':
        continue

    b = sec.get('b', 0.25)
    h = sec.get('h', 0.25)

    A = b * h
    Iy = b * h**3 / 12
    Iz = h * b**3 / 12
    J = 0.141 * min(b, h)**4

    elements_list.append([n1, n2])
    element_props.append({
        'A': A, 'Iy': Iy, 'Iz': Iz, 'J': J,
        'type': frame['type'],
        'section': section_name
    })

# Preparar apoyos
supports_set = set()
for name, restraints in supports_raw.items():
    if name in node_name_to_idx:
        supports_set.add(node_name_to_idx[name])

print(f"\nPreparado para OpenSees:")
print(f"  Nodos: {len(nodes_list)}")
print(f"  Elementos: {len(elements_list)}")
print(f"  Apoyos: {len(supports_set)}")

# =============================================================================
# ANALISIS MODAL CON OPENSEES
# =============================================================================
print("\n" + "=" * 70)
print("ANALISIS MODAL - OPENSEES")
print("=" * 70)

ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

# Crear nodos
for i, n in enumerate(nodes_list):
    ops.node(i + 1, float(n[0]), float(n[1]), float(n[2]))

# Apoyos (empotrados)
for idx in supports_set:
    ops.fix(idx + 1, 1, 1, 1, 1, 1, 1)

# Transformaciones
ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)  # Columnas
ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)  # Vigas

# Elementos
for i, (el, props) in enumerate(zip(elements_list, element_props)):
    n1, n2 = el
    A = props['A']
    Iy = props['Iy']
    Iz = props['Iz']
    J = props['J']

    # Determinar transformacion
    dz = abs(nodes_list[n2][2] - nodes_list[n1][2])
    transf = 1 if dz > 0.5 else 2

    ops.element('elasticBeamColumn', i + 1, n1 + 1, n2 + 1, A, E, G, J, Iy, Iz, transf)

# Masa lumped
for i, (el, props) in enumerate(zip(elements_list, element_props)):
    n1, n2 = el
    dx = nodes_list[n2][0] - nodes_list[n1][0]
    dy = nodes_list[n2][1] - nodes_list[n1][1]
    dz = nodes_list[n2][2] - nodes_list[n1][2]
    L = math.sqrt(dx*dx + dy*dy + dz*dz)

    A = props['A']
    mass = rho * A * L / 2

    for node_idx in [n1, n2]:
        if node_idx not in supports_set:
            ops.mass(node_idx + 1, mass, mass, mass, 0, 0, 0)

# Analisis modal
try:
    eigenvalues = ops.eigen(12)

    print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
    print("-" * 35)

    opensees_results = []
    for i, ev in enumerate(eigenvalues[:12]):
        if ev > 0:
            omega = math.sqrt(ev)
            freq = omega / (2 * math.pi)
            period = 1 / freq
            opensees_results.append({'mode': i+1, 'T': period, 'f': freq})
            print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f}")
        else:
            print(f"{i+1:<6} {'ERROR':<12}")

except Exception as e:
    print(f"ERROR en OpenSees: {e}")
    opensees_results = []

ops.wipe()

# =============================================================================
# GUARDAR PARA AWATIF
# =============================================================================
awatif_model = {
    'nodes': nodes_list,
    'elements': elements_list,
    'element_props': element_props,
    'supports': list(supports_set),
    'E': E,
    'G': G,
    'rho': rho
}

with open('sra_silvia_awatif.json', 'w') as f:
    json.dump(awatif_model, f, indent=2)
print(f"\n[OK] Modelo Awatif guardado en sra_silvia_awatif.json")

# =============================================================================
# RESUMEN COMPARATIVO
# =============================================================================
print("\n" + "=" * 70)
print("RESUMEN COMPARATIVO")
print("=" * 70)

etabs_results = model_data.get('etabs_results', [])

print(f"\n{'Mode':<6} {'ETABS T(s)':<15} {'OpenSees T(s)':<15} {'Diferencia':<15}")
print("-" * 60)

for i in range(min(6, len(opensees_results))):
    os_T = opensees_results[i]['T'] if i < len(opensees_results) else 0
    et_T = etabs_results[i]['T'] if i < len(etabs_results) else 0

    if et_T > 0:
        diff = (os_T - et_T) / et_T * 100
        diff_str = f"{diff:+.1f}%"
    else:
        diff_str = "N/A (no ETABS)"

    print(f"{i+1:<6} {et_T:<15.4f} {os_T:<15.4f} {diff_str:<15}")

print("\n" + "=" * 70)
print("NOTAS:")
print("=" * 70)
print("""
- Si ETABS no tiene resultados, ejecutar analisis en ETABS primero
- Para Awatif, usar el archivo sra_silvia_awatif.json
- Los shells/areas no estan incluidos en este analisis OpenSees simplificado
""")
