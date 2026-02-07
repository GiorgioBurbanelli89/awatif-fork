# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - SAP2000 - MESH 4x4 - MODELO ESTABLE
======================================================

Placa simplemente apoyada con mesh 4x4.
Restricciones correctas para evitar inestabilidad:
- Bordes: U3 restringido (apoyo simple)
- Esquinas: U1,U2,U3 restringidos (evitar movimiento horizontal)
"""

import os
import math
import comtypes.client

print("="*70)
print("TEST QUAD4 SHELL - SAP2000 (MESH 4x4 ESTABLE)")
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
    print(f"    Nodo central: {node_map[(nx//2, ny//2)]} en ({nx//2 * dx}, {ny//2 * dy})")

    # Crear elementos
    elem_id = 1
    elem_names = []
    for j in range(ny):
        for i in range(nx):
            x_coords = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
            y_coords = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
            z_coords = [0, 0, 0, 0]

            elem_name = f"A{elem_id}"
            ret = SapModel.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords, elem_name, "PLACA", elem_name)
            elem_names.append(elem_name)
            elem_id += 1

    SapModel.View.RefreshView(0, False)
    print(f"    Elementos: {elem_id - 1}")

    # ========================================
    # RESTRICCIONES
    # ========================================
    print("\n[6] Aplicando restricciones...")

    # Esquinas: Empotramiento completo (evita movimiento rigido)
    corners = [(0, 0), (nx, 0), (0, ny), (nx, ny)]
    Restraint_fixed = [True, True, True, True, True, True]

    for (i, j) in corners:
        SapModel.PointObj.SetRestraint(node_map[(i, j)], Restraint_fixed)
    print(f"    [OK] 4 esquinas empotradas")

    # Bordes (excepto esquinas): Solo U3 restringido
    Restraint_simple = [False, False, True, False, False, False]
    apoyos_simple = 0

    for j in range(ny + 1):
        for i in range(nx + 1):
            # Solo bordes, no esquinas
            if (i == 0 or i == nx or j == 0 or j == ny):
                if (i, j) not in corners:
                    SapModel.PointObj.SetRestraint(node_map[(i, j)], Restraint_simple)
                    apoyos_simple += 1

    print(f"    [OK] {apoyos_simple} apoyos simples en bordes (U3 fijo)")

    # ========================================
    # CARGA
    # ========================================
    print("\n[7] Aplicando carga...")
    LTYPE_OTHER = 8
    SapModel.LoadPatterns.Add('CARGA', LTYPE_OTHER, 1, True)

    # Aplicar carga a todos los elementos
    for name in elem_names:
        ret = SapModel.AreaObj.SetLoadUniform(name, 'CARGA', q, 6, True, "Global", 0)

    print(f"    [OK] Carga uniforme q={q} kN/m2")

    # ========================================
    # GUARDAR Y ANALIZAR
    # ========================================
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_estable_sap2000.sdb')
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
    ObjectElm = 2  # 2 = GroupElm (All)

    [NumberResults, Obj, Elm, ACase, StepType, StepNum, U1, U2, U3, R1, R2, R3, ret] = \
        SapModel.Results.JointDispl("All", ObjectElm, NumberResults, Obj, Elm, ACase,
                                     StepType, StepNum, U1, U2, U3, R1, R2, R3)

    print(f"    Puntos: {NumberResults}")

    w_max = 0
    w_center = 0
    center_node = node_map[(nx//2, ny//2)]

    if NumberResults > 0 and U3:
        # Mostrar desplazamientos por nodo
        print("\n    Desplazamientos U3 (mm):")
        for i in range(NumberResults):
            print(f"      {Obj[i]}: {U3[i]*1000:.6f}")
            if abs(U3[i]) > abs(w_max):
                w_max = U3[i]
            if Obj[i] == center_node:
                w_center = U3[i]

        print(f"\n    |U3|_max = {abs(w_max)*1000:.6f} mm")
        print(f"    U3_centro ({center_node}) = {abs(w_center)*1000:.6f} mm")

    # -- FUERZAS EN SHELL (elemento por elemento) --
    print("\n    FUERZAS SHELL:")

    all_M11 = []
    all_M22 = []
    all_V13 = []

    for elem_name in elem_names:
        NumberResults = 0
        Obj = []; Elm = []; PointElm = []; LoadCase = []
        StepType = []; StepNum = []
        F11 = []; F22 = []; F12 = []; FMax = []; FMin = []; FAngle = []; FVM = []
        M11 = []; M22 = []; M12 = []; MMax = []; MMin = []; MAngle = []
        V13 = []; V23 = []; VMax = []; VAngle = []
        ObjectElm = 0  # Object

        [NumberResults, Obj, Elm, PointElm, LoadCase, StepType, StepNum,
         F11, F22, F12, FMax, FMin, FAngle, FVM,
         M11, M22, M12, MMax, MMin, MAngle,
         V13, V23, VMax, VAngle, ret] = \
            SapModel.Results.AreaForceShell(elem_name, ObjectElm, NumberResults, Obj, Elm,
                                            PointElm, LoadCase, StepType, StepNum,
                                            F11, F22, F12, FMax, FMin, FAngle, FVM,
                                            M11, M22, M12, MMax, MMin, MAngle,
                                            V13, V23, VMax, VAngle)

        if NumberResults > 0 and M11:
            all_M11.extend(M11)
            all_M22.extend(M22)
            all_V13.extend(V13)

    print(f"    Puntos de integracion total: {len(all_M11)}")

    M11_max = 0
    M22_max = 0
    V13_max = 0

    if all_M11:
        M11_max = max(abs(m) for m in all_M11)
        M22_max = max(abs(m) for m in all_M22)
        V13_max = max(abs(v) for v in all_V13)

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
    print(f"Mesh: {nx}x{ny} = {nx*ny} elementos")
    print(f"\nTeorico (Navier placa delgada):")
    print(f"  w_centro = {w_theory*1000:.6f} mm")
    print(f"  M_centro = {M_theory:.6f} kN-m/m")

    if w_center != 0:
        w_sap = abs(w_center)
        error_w = abs(w_sap - w_theory) / w_theory * 100

        print(f"\nSAP2000 (Plate-Thick Mindlin):")
        print(f"  w_centro = {w_sap*1000:.6f} mm")
        print(f"  M11_max = {M11_max:.6f} kN-m/m")

        print(f"\nError vs Navier (placa delgada):")
        print(f"  Desplazamiento: {error_w:.2f}%")

        if M_theory > 0:
            error_M = abs(M11_max - M_theory) / M_theory * 100
            print(f"  Momento: {error_M:.2f}%")

    # ========================================
    # GUARDAR RESULTADOS JSON
    # ========================================
    import json
    results = {
        "software": "SAP2000",
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
        "sap2000": {
            "w_max_mm": abs(w_max) * 1000 if w_max else None,
            "w_centro_mm": abs(w_center) * 1000 if w_center else None,
            "M11_max_kNm_m": M11_max,
            "M22_max_kNm_m": M22_max,
            "V13_max_kN_m": V13_max
        }
    }

    json_path = os.path.join(OUTPUT_DIR, 'sap2000_quad4_estable_results.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResultados guardados: {json_path}")

    print("\n[11] SAP2000 dejado abierto para inspeccion")
    print(f"     Modelo: {ModelPath}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
