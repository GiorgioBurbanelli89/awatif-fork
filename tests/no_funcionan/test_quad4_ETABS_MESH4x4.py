# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - ETABS - MESH 4x4
====================================

Basado en MOD1 Definicion de propiedades y elementos.ipynb
Placa simplemente apoyada con mesh 4x4.
"""

import os
import sys
import math
import comtypes.client

print("="*70)
print("TEST QUAD4 SHELL - ETABS (MESH 4x4)")
print("="*70)

# Parametros
Lx = 2.0        # m
Ly = 2.0        # m
t = 0.2         # m (espesor)
E = 25000000    # kPa (25 GPa)
nu = 0.2
q = 10.0        # kN/m2
nx = 4          # divisiones en X
ny = 4          # divisiones en Y

OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

try:
    # ========================================
    # CONECTAR ETABS
    # ========================================
    print("\n[1] Iniciando ETABS...")

    # Intentar conectar a ETABS existente o crear nuevo
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    try:
        # Intentar conectar a ETABS existente
        myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
        print("    [OK] Conectado a ETABS existente")
    except:
        # Crear nueva instancia
        try:
            myETABSObject = helper.CreateObjectProgID("CSI.ETABS.API.ETABSObject")
            myETABSObject.ApplicationStart()
            print("    [OK] ETABS iniciado")
        except:
            print("    [ERROR] No se pudo iniciar ETABS")
            sys.exit(1)

    SapModel = myETABSObject.SapModel

    # ========================================
    # CREAR MODELO
    # ========================================
    print("\n[2] Creando modelo...")
    SapModel.InitializeNewModel()
    SapModel.File.NewBlank()

    # Unidades: kN, m, C (tonf_m_C = 12)
    kN_m_C = 6
    SapModel.SetPresentUnits(kN_m_C)
    print("    [OK] Modelo en blanco (kN, m)")

    # ========================================
    # MATERIAL
    # ========================================
    print("\n[3] Definiendo material...")
    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('CONC', MATERIAL_CONCRETE)
    SapModel.PropMaterial.SetMPIsotropic('CONC', E, nu, 0.00001)
    print(f"    [OK] E={E/1e6} GPa, nu={nu}")

    # ========================================
    # PROPIEDAD SHELL (SLAB)
    # ========================================
    print("\n[4] Definiendo propiedad SHELL...")

    # SetSlab(Name, SlabType, ShellType, MatProp, Thickness)
    # SlabType: 0=Slab, 1=Drop, 3=Ribbed, 4=Waffle, 5=Mat, 6=Footing
    # ShellType: 1=ShellThin, 2=ShellThick, 3=Membrane, 6=Layered
    ret = SapModel.PropArea.SetSlab("PLACA", 0, 2, "CONC", t)
    print(f"    [OK] PLACA (ShellThick, t={t}m)")

    # ========================================
    # GEOMETRIA - MESH 4x4
    # ========================================
    print(f"\n[5] Creando mesh {nx}x{ny}...")

    dx = Lx / nx
    dy = Ly / ny

    # Crear nodos
    node_map = {}
    node_id = 1
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = i * dx
            y = j * dy
            z = 0
            name = f"P{node_id}"
            SapModel.PointObj.AddCartesian(x, y, z, name)
            node_map[(i, j)] = name
            node_id += 1

    print(f"    Nodos: {node_id - 1}")

    # Crear elementos
    elem_id = 1
    for j in range(ny):
        for i in range(nx):
            x_coords = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
            y_coords = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
            z_coords = [0, 0, 0, 0]

            elem_name = f"A{elem_id}"
            ret = SapModel.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords, elem_name, "PLACA")
            elem_id += 1

    SapModel.View.RefreshView(0, False)
    print(f"    Elementos: {elem_id - 1}")

    # ========================================
    # APOYOS SIMPLES EN BORDES
    # ========================================
    print("\n[6] Aplicando apoyos simples en bordes...")
    # Solo U3 restringido (apoyo simple vertical)
    Restraint = [False, False, True, False, False, False]

    apoyos = 0
    for j in range(ny + 1):
        for i in range(nx + 1):
            # Solo nodos en los bordes
            if i == 0 or i == nx or j == 0 or j == ny:
                SapModel.PointObj.SetRestraint(node_map[(i, j)], Restraint)
                apoyos += 1

    print(f"    [OK] {apoyos} apoyos simples (U3 fijo)")

    # ========================================
    # CARGA
    # ========================================
    print("\n[7] Aplicando carga...")
    LTYPE_OTHER = 8
    SapModel.LoadPatterns.Add('CARGA', LTYPE_OTHER, 0, True)

    # Aplicar carga a todos los elementos
    # SetLoadUniform(Name, LoadPat, Value, Dir, Replace, CSys)
    # Dir: 6 = Z direction (gravity)
    for i in range(1, elem_id):
        ret = SapModel.AreaObj.SetLoadUniform(f"A{i}", 'CARGA', -q, 6, False, "Global")

    print(f"    [OK] Carga uniforme q={q} kN/m2")

    # ========================================
    # GUARDAR Y ANALIZAR
    # ========================================
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_mesh4x4_etabs.edb')
    print(f"\n[8] Guardando: {ModelPath}")
    SapModel.File.Save(ModelPath)

    print("\n[9] Ejecutando analisis...")
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    [OK] Analisis (ret={ret})")

    # ========================================
    # RESULTADOS
    # ========================================
    print("\n[10] Extrayendo resultados...")
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput("CARGA")

    # -- DESPLAZAMIENTOS --
    print("\n    DESPLAZAMIENTOS:")

    NumberResults = 0
    Obj = []; Elm = []; ACase = []; StepType = []; StepNum = []
    U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []
    ObjectElm = 0

    result = SapModel.Results.JointDispl("", ObjectElm, NumberResults, Obj, Elm, ACase,
                                          StepType, StepNum, U1, U2, U3, R1, R2, R3)

    if result and len(result) >= 13:
        NumberResults = result[0]
        Obj = result[1]
        U3 = result[8]

        print(f"    Puntos: {NumberResults}")

        w_max = 0
        w_center = 0
        center_node = node_map[(nx//2, ny//2)]

        if NumberResults > 0 and U3:
            for i in range(NumberResults):
                if abs(U3[i]) > abs(w_max):
                    w_max = U3[i]
                if Obj[i] == center_node:
                    w_center = U3[i]

            print(f"\n    |U3|_max = {abs(w_max)*1000:.6f} mm")
            print(f"    U3_centro ({center_node}) = {abs(w_center)*1000:.6f} mm")
    else:
        print("    No se obtuvieron desplazamientos")
        w_max = 0
        w_center = 0

    # -- FUERZAS EN SHELL --
    print("\n    FUERZAS SHELL:")

    NumberResults = 0
    Obj = []; Elm = []; PointElm = []; LoadCase = []
    StepType = []; StepNum = []
    F11 = []; F22 = []; F12 = []; FMax = []; FMin = []; FAngle = []; FVM = []
    M11 = []; M22 = []; M12 = []; MMax = []; MMin = []; MAngle = []
    V13 = []; V23 = []; VMax = []; VAngle = []

    result = SapModel.Results.AreaForceShell("", ObjectElm, NumberResults, Obj, Elm,
                                              PointElm, LoadCase, StepType, StepNum,
                                              F11, F22, F12, FMax, FMin, FAngle, FVM,
                                              M11, M22, M12, MMax, MMin, MAngle,
                                              V13, V23, VMax, VAngle)

    M11_max = 0
    M22_max = 0
    V13_max = 0

    if result and len(result) >= 24:
        NumberResults = result[0]
        M11 = result[14]
        M22 = result[15]
        V13 = result[20]

        print(f"    Puntos de integracion: {NumberResults}")

        if NumberResults > 0 and M11:
            M11_max = max(abs(m) for m in M11)
            M22_max = max(abs(m) for m in M22)
            V13_max = max(abs(v) for v in V13)

            print(f"\n    |M11|_max = {M11_max:.6f} kN-m/m")
            print(f"    |M22|_max = {M22_max:.6f} kN-m/m")
            print(f"    |V13|_max = {V13_max:.6f} kN/m")
    else:
        print("    No se obtuvieron fuerzas")

    # ========================================
    # COMPARACION TEORICA
    # ========================================
    print("\n" + "="*70)
    print("COMPARACION CON SOLUCION TEORICA (NAVIER)")
    print("="*70)

    # Rigidez a flexion
    D = E * 1000 * t**3 / (12 * (1 - nu**2))  # E en Pa
    print(f"\nRigidez D = {D:.2f} N-m")

    # Desplazamiento teorico
    q_Pa = q * 1000
    w_theory = 0.00406 * q_Pa * Lx**4 / D

    # Momento teorico
    M_theory = 0.0479 * q * Lx**2

    print(f"\nPlaca {Lx}x{Ly}m, t={t}m, q={q} kN/m2")
    print(f"Mesh: {nx}x{ny} = {nx*ny} elementos")
    print(f"\nTeorico (Navier):")
    print(f"  w_centro = {w_theory*1000:.6f} mm")
    print(f"  M_centro = {M_theory:.6f} kN-m/m")

    if w_center != 0:
        w_etabs = abs(w_center)
        error_w = abs(w_etabs - w_theory) / w_theory * 100

        print(f"\nETABS:")
        print(f"  w_centro = {w_etabs*1000:.6f} mm")
        print(f"  M11_max = {M11_max:.6f} kN-m/m")

        print(f"\nError:")
        print(f"  Desplazamiento: {error_w:.2f}%")

        if M_theory > 0:
            error_M = abs(M11_max - M_theory) / M_theory * 100
            print(f"  Momento: {error_M:.2f}%")

    # ========================================
    # GUARDAR RESULTADOS JSON
    # ========================================
    import json
    results = {
        "software": "ETABS",
        "mesh": f"{nx}x{ny}",
        "elementos": nx * ny,
        "parametros": {
            "Lx": Lx, "Ly": Ly, "t": t,
            "E_GPa": E/1e6, "nu": nu, "q_kN_m2": q
        },
        "teorico": {
            "D_Nm": D,
            "w_centro_mm": w_theory * 1000,
            "M_centro_kNm_m": M_theory
        },
        "etabs": {
            "w_max_mm": abs(w_max) * 1000 if w_max else None,
            "w_centro_mm": abs(w_center) * 1000 if w_center else None,
            "M11_max_kNm_m": M11_max,
            "M22_max_kNm_m": M22_max,
            "V13_max_kN_m": V13_max
        }
    }

    json_path = os.path.join(OUTPUT_DIR, 'etabs_quad4_mesh4x4_results.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResultados guardados: {json_path}")

    print("\n[11] ETABS dejado abierto para inspeccion")
    print(f"     Modelo: {ModelPath}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
