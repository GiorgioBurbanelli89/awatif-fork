# -*- coding: utf-8 -*-
"""
COMPARACION: 3 Modelos Progresivos
Ejecuta OpenSees para los 3 modelos y genera resumen

Modelo 1: Columna + Voladizo
Modelo 2: 2 Columnas + 2 Voladizos Paralelos
Modelo 3: Portico + Losa Shell + Voladizos
"""
import openseespy.opensees as ops
import math
import json

print("=" * 70)
print("COMPARACION MODAL: 3 MODELOS PROGRESIVOS")
print("OpenSees como referencia")
print("=" * 70)

# =============================================================================
# PROPIEDADES COMUNES
# =============================================================================
fc = 210
E_kgcm2 = 15100 * math.sqrt(fc)
E = E_kgcm2 * 98066.5  # Pa
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

col_b, col_h = 0.30, 0.30
beam_b, beam_h = 0.25, 0.40
slab_t = 0.12

A_col = col_b * col_h
Iz_col = col_b * col_h**3 / 12
Iy_col = col_h * col_b**3 / 12
J_col = 0.141 * min(col_b, col_h)**4

A_beam = beam_b * beam_h
Iy_beam = beam_b * beam_h**3 / 12
Iz_beam = beam_h * beam_b**3 / 12
J_beam = 0.141 * min(beam_b, beam_h)**4

all_results = {}


def run_modelo_1():
    """Columna + Voladizo"""
    H = 3.0
    voladizo = 1.5

    nodes = [
        [0.0, 0.0, 0.0],
        [0.0, 0.0, H],
        [voladizo, 0.0, H]
    ]
    elements = [[0, 1], [1, 2]]
    types = ['col', 'beam']
    supports = {0: [True]*6}

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    for i, n in enumerate(nodes):
        ops.node(i+1, *n)
    for idx, c in supports.items():
        ops.fix(idx+1, *[1 if x else 0 for x in c])

    ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)
    ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)

    for i, (el, t) in enumerate(zip(elements, types)):
        if t == 'col':
            ops.element('elasticBeamColumn', i+1, el[0]+1, el[1]+1, A_col, E, G, J_col, Iy_col, Iz_col, 1)
        else:
            ops.element('elasticBeamColumn', i+1, el[0]+1, el[1]+1, A_beam, E, G, J_beam, Iy_beam, Iz_beam, 2)

    for i, (el, t) in enumerate(zip(elements, types)):
        L = math.sqrt(sum((nodes[el[1]][j]-nodes[el[0]][j])**2 for j in range(3)))
        A = A_col if t == 'col' else A_beam
        m = rho * A * L / 2
        for n in el:
            if n not in supports:
                ops.mass(n+1, m, m, m, 0, 0, 0)

    try:
        evs = ops.eigen(3)  # Solo 3 modos (modelo simple)
    except:
        print("  WARN: Eigen solver issue, trying fewer modes...")
        evs = ops.eigen(2)

    results = []
    for ev in evs:
        if ev > 0:
            w = math.sqrt(ev)
            f = w / (2 * math.pi)
            T = 1/f
            results.append({'T': T, 'f': f})
    ops.wipe()
    return results


def run_modelo_2():
    """2 Columnas + 2 Voladizos"""
    H = 3.0
    Ly = 4.0
    voladizo = 1.5

    nodes = [
        [0.0, 0.0, 0.0], [0.0, Ly, 0.0],
        [0.0, 0.0, H], [0.0, Ly, H],
        [voladizo, 0.0, H], [voladizo, Ly, H]
    ]
    elements = [[0, 2], [1, 3], [2, 4], [3, 5]]
    types = ['col', 'col', 'beam', 'beam']
    supports = {0: [True]*6, 1: [True]*6}

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    for i, n in enumerate(nodes):
        ops.node(i+1, *n)
    for idx, c in supports.items():
        ops.fix(idx+1, *[1 if x else 0 for x in c])

    ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)
    ops.geomTransf('Linear', 2, 0.0, 0.0, 1.0)

    for i, (el, t) in enumerate(zip(elements, types)):
        if t == 'col':
            ops.element('elasticBeamColumn', i+1, el[0]+1, el[1]+1, A_col, E, G, J_col, Iy_col, Iz_col, 1)
        else:
            ops.element('elasticBeamColumn', i+1, el[0]+1, el[1]+1, A_beam, E, G, J_beam, Iy_beam, Iz_beam, 2)

    for i, (el, t) in enumerate(zip(elements, types)):
        L = math.sqrt(sum((nodes[el[1]][j]-nodes[el[0]][j])**2 for j in range(3)))
        A = A_col if t == 'col' else A_beam
        m = rho * A * L / 2
        for n in el:
            if n not in supports:
                ops.mass(n+1, m, m, m, 0, 0, 0)

    try:
        evs = ops.eigen(6)
    except:
        print("  WARN: Eigen solver issue, trying fewer modes...")
        evs = ops.eigen(3)

    results = []
    for ev in evs:
        if ev > 0:
            w = math.sqrt(ev)
            f = w / (2 * math.pi)
            T = 1/f
            results.append({'T': T, 'f': f})
    ops.wipe()
    return results


def run_modelo_3():
    """Portico + Losa + Voladizos"""
    H = 3.0
    Lx = 4.0
    Ly = 4.0
    voladizo = 1.5

    x_min, x_max = -voladizo, Lx + voladizo
    y_min, y_max = -voladizo, Ly + voladizo
    nx, ny = 7, 7
    dx = (x_max - x_min) / (nx - 1)
    dy = (y_max - y_min) / (ny - 1)

    nodes = []
    col_base = []

    # Base columnas
    for (x, y) in [(0, 0), (Lx, 0), (0, Ly), (Lx, Ly)]:
        col_base.append(len(nodes))
        nodes.append([x, y, 0.0])

    # Losa
    grid = {}
    for j in range(ny):
        for i in range(nx):
            x = x_min + i * dx
            y = y_min + j * dy
            grid[(i, j)] = len(nodes)
            nodes.append([x, y, H])

    # Encontrar topes de columnas
    def closest(xt, yt):
        mind = float('inf')
        best = None
        for (i, j), nid in grid.items():
            d = math.sqrt((nodes[nid][0]-xt)**2 + (nodes[nid][1]-yt)**2)
            if d < mind:
                mind, best = d, nid
        return best

    col_top = [closest(0, 0), closest(Lx, 0), closest(0, Ly), closest(Lx, Ly)]

    elements = []
    types = []

    # Columnas
    for b, t in zip(col_base, col_top):
        elements.append([b, t])
        types.append('col')

    # Shells
    for j in range(ny-1):
        for i in range(nx-1):
            n1 = grid[(i, j)]
            n2 = grid[(i+1, j)]
            n3 = grid[(i+1, j+1)]
            n4 = grid[(i, j+1)]
            elements.append([n1, n2, n3, n4])
            types.append('shell')

    supports = {i: [True]*6 for i in col_base}

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    for i, n in enumerate(nodes):
        ops.node(i+1, *n)
    for idx, c in supports.items():
        ops.fix(idx+1, *[1 if x else 0 for x in c])

    ops.geomTransf('Linear', 1, 1.0, 0.0, 0.0)
    ops.nDMaterial('ElasticIsotropic', 1, E, nu, rho)
    ops.section('PlateFiber', 1, 1, slab_t)

    eid = 1
    for el, t in zip(elements, types):
        if t == 'col':
            ops.element('elasticBeamColumn', eid, el[0]+1, el[1]+1, A_col, E, G, J_col, Iy_col, Iz_col, 1)
        elif t == 'shell':
            ops.element('ShellMITC4', eid, el[0]+1, el[1]+1, el[2]+1, el[3]+1, 1)
        eid += 1

    # Masa columnas
    for b, t in zip(col_base, col_top):
        L = abs(nodes[t][2] - nodes[b][2])
        m = rho * A_col * L / 2
        if t not in supports:
            ops.mass(t+1, m, m, m, 0, 0, 0)

    # Masa losa
    area = (x_max - x_min) * (y_max - y_min)
    m_total = rho * area * slab_t
    m_per_node = m_total / (nx * ny)
    for (i, j), nid in grid.items():
        if nid not in supports:
            ops.mass(nid+1, m_per_node, m_per_node, 0, 0, 0, 0)

    try:
        evs = ops.eigen(12)
    except:
        print("  WARN: Eigen solver issue, trying fewer modes...")
        try:
            evs = ops.eigen(6)
        except:
            evs = ops.eigen(3)

    results = []
    for ev in evs:
        if ev > 0:
            w = math.sqrt(ev)
            f = w / (2 * math.pi)
            T = 1/f
            results.append({'T': T, 'f': f})
    ops.wipe()
    return results


# =============================================================================
# EJECUTAR TODOS LOS MODELOS
# =============================================================================
print("\n>>> Ejecutando Modelo 1: Columna + Voladizo")
all_results['modelo1'] = run_modelo_1()

print(">>> Ejecutando Modelo 2: 2 Columnas + 2 Voladizos")
all_results['modelo2'] = run_modelo_2()

print(">>> Ejecutando Modelo 3: Portico + Losa + Voladizos")
all_results['modelo3'] = run_modelo_3()

# =============================================================================
# RESUMEN
# =============================================================================
print("\n" + "=" * 70)
print("RESUMEN DE RESULTADOS - OPENSEES")
print("=" * 70)

for name, results in all_results.items():
    print(f"\n{name.upper()}:")
    for i, r in enumerate(results[:6]):
        print(f"  Mode {i+1}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")

# Guardar JSON
with open('resultados_opensees_3modelos.json', 'w') as f:
    json.dump(all_results, f, indent=2)
print("\n[OK] Resultados guardados en resultados_opensees_3modelos.json")

# =============================================================================
# TABLA COMPARATIVA
# =============================================================================
print("\n" + "=" * 70)
print("TABLA COMPARATIVA (primeros 3 modos)")
print("=" * 70)
print(f"\n{'Modelo':<25} {'Mode 1 T(s)':<15} {'Mode 2 T(s)':<15} {'Mode 3 T(s)':<15}")
print("-" * 70)

for name, results in all_results.items():
    t1 = results[0]['T'] if len(results) > 0 else 0
    t2 = results[1]['T'] if len(results) > 1 else 0
    t3 = results[2]['T'] if len(results) > 2 else 0
    print(f"{name:<25} {t1:<15.4f} {t2:<15.4f} {t3:<15.4f}")

print(f"\n{'NOTA:':<70}")
print("  - Modelo 1: Estructura mas simple (1 columna + 1 voladizo)")
print("  - Modelo 2: Agrega simetria (2 columnas + 2 voladizos paralelos)")
print("  - Modelo 3: Agrega losa shell que conecta todo y crea rigidez")
print("\nPara comparar con ETABS y Awatif:")
print("  - Ejecutar: python etabs_modelos_comparacion.py")
print("  - Ejecutar tests: npx vitest run modelo1.test.ts modelo2.test.ts modelo3.test.ts")
