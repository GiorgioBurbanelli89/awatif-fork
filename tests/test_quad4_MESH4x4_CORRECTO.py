# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - SAP2000 - MESH 4x4 CORRECTO
==============================================

IMPORTANTE:
- Primero guardar, luego ejecutar
- Nodos de borde: U3 restringido
- Nodos internos: SIN restricciones
"""

import os
import math
import comtypes.client

print("="*70)
print("TEST QUAD4 SHELL - SAP2000 (MESH 4x4 CORRECTO)")
print("="*70)

# Parametros
Lx = 2.0        # m
Ly = 2.0        # m
t = 0.2         # m (espesor)
E = 25000000    # kPa (25 GPa)
nu = 0.2
q = 10.0        # kN/m2
nx = 4          # elementos en X
ny = 4          # elementos en Y

OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

try:
    # ========================================
    # CONECTAR SAP2000
    # ========================================
    print("\n[1] Iniciando SAP2000...")
    helper = comtypes.client.CreateObject('SAP2000v1.Helper')
    helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
    SapObject = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
    SapObject.ApplicationStart()
    SapModel = SapObject.SapModel
    print("    [OK] Iniciado")

    # ========================================
    # CREAR MODELO
    # ========================================
    print("\n[2] Creando modelo...")
    SapModel.InitializeNewModel(6)  # kN, m, C
    SapModel.File.NewBlank()
    print("    [OK] Modelo en blanco")

    # ========================================
    # MATERIAL
    # ========================================
    print("\n[3] Definiendo material...")
    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('CONC', MATERIAL_CONCRETE)
    SapModel.PropMaterial.SetMPIsotropic('CONC', E, nu, 0.00001)
    print(f"    [OK] E={E/1e6} GPa, nu={nu}")

    # ========================================
    # PROPIEDAD SHELL
    # ========================================
    print("\n[4] Definiendo propiedad PLATE-THICK...")
    # ShellType 4 = Plate-Thick (Mindlin/Reissner)
    ret = SapModel.PropArea.SetShell_1('PLACA', 4, False, 'CONC', 0, t, t, -1, "", "")
    print(f"    [OK] PLACA (Plate-Thick, t={t}m)")

    # ========================================
    # GEOMETRIA - MESH 4x4
    # ========================================
    print("\n[5] Creando mesh 4x4...")

    dx = Lx / nx
    dy = Ly / ny

    # Crear nodos
    node_map = {}
    node_id = 1
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = i * dx
            y = j * dy
            name = f"N{node_id}"
            SapModel.PointObj.AddCartesian(x, y, 0.0, name)
            node_map[(i, j)] = name
            node_id += 1

    n_nodes = (nx + 1) * (ny + 1)
    print(f"    Nodos: {n_nodes}")

    # Crear elementos
    elem_id = 1
    for j in range(ny):
        for i in range(nx):
            n1 = node_map[(i, j)]
            n2 = node_map[(i+1, j)]
            n3 = node_map[(i+1, j+1)]
            n4 = node_map[(i, j+1)]
            pts = [n1, n2, n3, n4]
            name = f"E{elem_id}"
            SapModel.AreaObj.AddByPoint(4, pts, name, 'PLACA', name)
            elem_id += 1

    n_elem = nx * ny
    print(f"    Elementos: {n_elem}")

    SapModel.View.RefreshView(0, False)

    # ========================================
    # APOYOS - SOLO EN BORDES
    # ========================================
    print("\n[6] Aplicando apoyos simples en bordes...")

    n_apoyos = 0
    for j in range(ny + 1):
        for i in range(nx + 1):
            # Verificar si es nodo de borde
            is_border = (i == 0 or i == nx or j == 0 or j == ny)

            if is_border:
                # Apoyo simple: solo U3 restringido
                Restraint = [False, False, True, False, False, False]
                SapModel.PointObj.SetRestraint(node_map[(i, j)], Restraint)
                n_apoyos += 1
            # Los nodos internos NO tienen restricciones

    print(f"    [OK] {n_apoyos} apoyos simples en borde (U3 fijo)")
    print(f"    [OK] {n_nodes - n_apoyos} nodos internos libres")

    # ========================================
    # CARGA
    # ========================================
    print("\n[7] Aplicando carga...")
    LTYPE_OTHER = 8
    SapModel.LoadPatterns.Add('CARGA', LTYPE_OTHER, 1, True)

    # Aplicar carga a todos los elementos
    for j in range(ny):
        for i in range(nx):
            elem_name = f"E{j * nx + i + 1}"
            SapModel.AreaObj.SetLoadUniform(elem_name, 'CARGA', q, 6, True, "Global", 0)

    print(f"    [OK] Carga uniforme q={q} kN/m2 en {n_elem} elementos")

    # ========================================
    # GUARDAR PRIMERO
    # ========================================
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_mesh4x4_CORRECTO.sdb')
    print(f"\n[8] GUARDANDO PRIMERO: {ModelPath}")
    SapModel.File.Save(ModelPath)
    print("    [OK] Guardado")

    # ========================================
    # EJECUTAR ANALISIS
    # ========================================
    print("\n[9] EJECUTANDO ANALISIS...")
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    [OK] Analisis (ret={ret})")

    # Verificar estado
    locked = SapModel.GetModelIsLocked()
    print(f"    Modelo bloqueado: {locked}")

    # Status de casos
    ret_status = SapModel.Analyze.GetCaseStatus()
    status_text = {0: "Not run", 1: "Could not start", 2: "Not finished", 3: "Finished"}
    case_names = list(ret_status[1])
    case_status = list(ret_status[2])
    for i, name in enumerate(case_names):
        print(f"    Caso {name}: {status_text.get(case_status[i], case_status[i])}")

    # ========================================
    # GUARDAR DESPUES
    # ========================================
    print("\n[10] GUARDANDO DESPUES DE ANALISIS...")
    SapModel.File.Save(ModelPath)
    print("    [OK] Guardado")

    # ========================================
    # RESULTADOS
    # ========================================
    print("\n[11] Extrayendo resultados...")
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput("CARGA")

    # -- DESPLAZAMIENTOS --
    print("\n    DESPLAZAMIENTOS:")
    ret = SapModel.Results.JointDispl("", 2)
    n_results = ret[0]
    print(f"    Resultados: {n_results}")

    w_max = 0
    w_centro = 0
    if n_results > 0:
        nodos = list(ret[2])
        U3 = list(ret[9])

        # Buscar maximo
        for i in range(n_results):
            if abs(U3[i]) > abs(w_max):
                w_max = U3[i]

        # Buscar centro (nodo N13 para mesh 4x4)
        centro_name = node_map[(nx//2, ny//2)]
        if centro_name in nodos:
            idx = nodos.index(centro_name)
            w_centro = U3[idx]

        print(f"    |U3|_max = {abs(w_max)*1000:.6f} mm")
        print(f"    U3_centro ({centro_name}) = {w_centro*1000:.6f} mm")

    # -- FUERZAS EN SHELL --
    print("\n    FUERZAS SHELL:")

    all_M11 = []
    all_M22 = []
    all_V13 = []

    for elem_i in range(1, n_elem + 1):
        elem_name = f"E{elem_i}"
        ret = SapModel.Results.AreaForceShell(elem_name, 0)
        n = ret[0]
        if n > 0:
            all_M11.extend(list(ret[14]))
            all_M22.extend(list(ret[15]))
            all_V13.extend(list(ret[20]))

    if all_M11:
        M11_max = max(abs(m) for m in all_M11)
        M22_max = max(abs(m) for m in all_M22)
        V13_max = max(abs(v) for v in all_V13)

        print(f"    Puntos totales: {len(all_M11)}")
        print(f"\n    |M11|_max = {M11_max:.6f} kN-m/m")
        print(f"    |M22|_max = {M22_max:.6f} kN-m/m")
        print(f"    |V13|_max = {V13_max:.6f} kN/m")

    # ========================================
    # COMPARACION TEORICA
    # ========================================
    print("\n" + "="*70)
    print("COMPARACION CON SOLUCION TEORICA (NAVIER)")
    print("="*70)

    # Rigidez a flexion
    D = E * 1000 * t**3 / (12 * (1 - nu**2))  # E en Pa
    print(f"\nRigidez D = {D:.2f} N-m")

    # Desplazamiento teorico (Navier para placa simplemente apoyada)
    q_Pa = q * 1000  # kN/m2 a Pa
    w_theory = 0.00406 * q_Pa * Lx**4 / D

    # Momento teorico en el centro
    M_theory = 0.0479 * q * Lx**2

    print(f"\nPlaca {Lx}x{Ly}m, t={t}m, q={q} kN/m2")
    print(f"Mesh: {nx}x{ny} = {n_elem} elementos")
    print(f"\nTeorico (Navier):")
    print(f"  w_centro = {w_theory*1000:.6f} mm")
    print(f"  M_centro = {M_theory:.6f} kN-m/m")

    if w_centro != 0:
        print(f"\nSAP2000 (Plate-Thick, mesh {nx}x{ny}):")
        print(f"  w_centro = {abs(w_centro)*1000:.6f} mm")
        print(f"  M11_max = {M11_max:.6f} kN-m/m")
        print(f"  M22_max = {M22_max:.6f} kN-m/m")

        error_w = abs(abs(w_centro) - w_theory) / w_theory * 100
        error_M = abs(M11_max - M_theory) / M_theory * 100
        print(f"  Error w: {error_w:.2f}%")
        print(f"  Error M11: {error_M:.2f}%")

    # No cerrar SAP2000
    print("\n[12] SAP2000 dejado abierto para inspeccion")
    print(f"     Modelo: {ModelPath}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
