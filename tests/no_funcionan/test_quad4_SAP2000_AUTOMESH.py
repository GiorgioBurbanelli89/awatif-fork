# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - SAP2000 - USANDO AUTOMESH
============================================

Basado en sap2000_losa_template.py que funciona correctamente.
Crea un area grande y la subdivide automaticamente con SetAutoMesh.
"""

import os
import math
import comtypes.client

print("="*70)
print("TEST QUAD4 SHELL - SAP2000 (AUTOMESH)")
print("="*70)

# Parametros
a = 2.0         # m (largo X)
b = 2.0         # m (largo Y)
t = 0.2         # m (espesor)
E = 25000000    # kPa (25 GPa)
nu = 0.2
q = 10.0        # kN/m2
nx = 4          # subdivisiones en X
ny = 4          # subdivisiones en Y

OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

try:
    # ========================================
    # CONECTAR SAP2000
    # ========================================
    print("\n[1] Conectando a SAP2000...")
    helper = comtypes.client.CreateObject('SAP2000v1.Helper')
    helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)

    try:
        # Intentar conectar a instancia existente
        mySapObject = helper.GetObject("CSI.SAP2000.API.SapObject")
        print("    [OK] Conectado a instancia existente")
    except:
        # Crear nueva instancia
        mySapObject = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
        mySapObject.ApplicationStart()
        print("    [OK] SAP2000 iniciado")

    SapModel = mySapObject.SapModel
    print(f"    Version: {SapModel.GetVersion()[0]}")

    # ========================================
    # CREAR MODELO
    # ========================================
    print("\n[2] Creando modelo...")
    SapModel.InitializeNewModel()
    SapModel.File.NewBlank()
    SapModel.SetPresentUnits(6)  # kN, m, C
    print("    [OK] Modelo en blanco (kN, m)")

    # ========================================
    # MATERIAL
    # ========================================
    print("\n[3] Definiendo material...")
    mat = 'CONC'
    SapModel.PropMaterial.SetMaterial(mat, 2)  # 2 = Concrete
    SapModel.PropMaterial.SetMPIsotropic(mat, E, nu, 0.00001)
    print(f"    [OK] E={E/1e6} GPa, nu={nu}")

    # ========================================
    # PROPIEDAD SHELL
    # ========================================
    print("\n[4] Definiendo propiedad Shell...")
    shell = 'PLACA'
    # Tipo 4 = Plate-Thick (Mindlin/Reissner)
    SapModel.PropArea.SetShell_1(shell, 4, False, mat, 0.0, t, t, 0, "", "")
    print(f"    [OK] PLACA (Plate-Thick, t={t}m)")

    # ========================================
    # CREAR AREA (1 elemento grande)
    # ========================================
    print("\n[5] Creando area...")
    X = [0.0, a, a, 0.0]
    Y = [0.0, 0.0, b, b]
    Z = [0.0, 0.0, 0.0, 0.0]

    ret = SapModel.AreaObj.AddByCoord(4, X, Y, Z, "", shell, "LOSA1")
    print(f"    [OK] Area {a}x{b}m creada")

    # ========================================
    # SUBDIVIDIR CON AUTOMESH
    # ========================================
    print(f"\n[6] Subdividiendo en mesh {nx}x{ny}...")
    # SetAutoMesh(Name, MeshType, n1, n2, MaxSize1, MaxSize2, PointOnEdgeFromLine,
    #             PointOnEdgeFromPoint, ExtendCookieCutLines, Rotation, MaxSizeGeneral,
    #             LocalAxesOnEdge, LocalAxesOnFace, RestraintsOnEdge, RestraintsOnFace,
    #             Group, SubMesh, SubMeshSize)
    # MeshType: 1=NoMesh, 2=CookieCut, 3=MaxSize, 4=General, 5=ByNumPts
    ret = SapModel.AreaObj.SetAutoMesh("LOSA1", 5, nx, ny, 0, 0, False, False, False, 0, 0,
                                       False, False, False, False, "", False, 0)
    print(f"    [OK] AutoMesh {nx}x{ny}")

    SapModel.View.RefreshView(0, False)

    # Obtener puntos creados
    ret = SapModel.PointObj.GetNameList()
    puntos = list(ret[1]) if ret[0] > 0 else []
    print(f"    Nodos creados: {len(puntos)}")

    # ========================================
    # RESTRICCIONES EN BORDES
    # ========================================
    print("\n[7] Aplicando restricciones...")
    n_apoyos = 0

    for punto in puntos:
        ret = SapModel.PointObj.GetCoordCartesian(punto)
        x, y, z = ret[0], ret[1], ret[2]

        en_borde = (abs(x) < 0.001 or abs(x - a) < 0.001 or
                    abs(y) < 0.001 or abs(y - b) < 0.001)

        if en_borde:
            # Esquinas: empotramiento para estabilidad
            if abs(x) < 0.001 and abs(y) < 0.001:
                # Esquina (0,0): UX=UY=UZ=0
                SapModel.PointObj.SetRestraint(punto, [True, True, True, False, False, False])
            elif abs(x - a) < 0.001 and abs(y) < 0.001:
                # Esquina (a,0): UY=UZ=0
                SapModel.PointObj.SetRestraint(punto, [False, True, True, False, False, False])
            elif abs(x) < 0.001 and abs(y - b) < 0.001:
                # Esquina (0,b): UX=UZ=0
                SapModel.PointObj.SetRestraint(punto, [True, False, True, False, False, False])
            else:
                # Resto del borde: solo UZ=0
                SapModel.PointObj.SetRestraint(punto, [False, False, True, False, False, False])
            n_apoyos += 1

    print(f"    [OK] {n_apoyos} nodos apoyados en borde")

    # ========================================
    # CARGA
    # ========================================
    print("\n[8] Aplicando carga...")
    ret = SapModel.AreaObj.SetLoadUniform("LOSA1", "DEAD", q, 6, True, "Global", 0)
    print(f"    [OK] Carga uniforme q={q} kN/m2")

    # ========================================
    # GUARDAR Y ANALIZAR
    # ========================================
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_automesh_sap2000.sdb')
    print(f"\n[9] Guardando: {ModelPath}")
    SapModel.File.Save(ModelPath)

    print("\n[10] Ejecutando analisis...")
    SapModel.Analyze.SetRunCaseFlag("", False, True)
    SapModel.Analyze.SetRunCaseFlag("DEAD", True, False)
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    [OK] Analisis (ret={ret})")

    # ========================================
    # RESULTADOS
    # ========================================
    print("\n[11] Extrayendo resultados...")
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput("DEAD")

    # -- DESPLAZAMIENTOS --
    print("\n    DESPLAZAMIENTOS:")
    U3_dict = {}

    for punto in puntos:
        ret_coord = SapModel.PointObj.GetCoordCartesian(punto)
        x, y = ret_coord[0], ret_coord[1]

        ret_disp = SapModel.Results.JointDispl(punto, 0)
        if ret_disp[0] > 0:
            uz = ret_disp[9][0]  # U3 esta en indice 9
            U3_dict[(x, y)] = uz

    w_max = 0
    w_center = 0

    if U3_dict:
        # Encontrar maximo
        min_pos = min(U3_dict, key=U3_dict.get)
        w_max = U3_dict[min_pos]

        # Encontrar centro
        for (x, y), uz in U3_dict.items():
            if abs(x - a/2) < 0.3 and abs(y - b/2) < 0.3:
                if w_center == 0 or abs(uz) > abs(w_center):
                    w_center = uz

        print(f"    Puntos con desplazamiento: {len(U3_dict)}")
        print(f"    |U3|_max = {abs(w_max)*1000:.6f} mm en ({min_pos[0]:.2f}, {min_pos[1]:.2f})")
        print(f"    U3_centro = {abs(w_center)*1000:.6f} mm")

    # -- FUERZAS EN SHELL --
    print("\n    FUERZAS SHELL:")

    NumberResults = 0
    Obj = []; Elm = []; PointElm = []; LoadCase = []
    StepType = []; StepNum = []
    F11 = []; F22 = []; F12 = []; FMax = []; FMin = []; FAngle = []; FVM = []
    M11 = []; M22 = []; M12 = []; MMax = []; MMin = []; MAngle = []
    V13 = []; V23 = []; VMax = []; VAngle = []
    ObjectElm = 0

    [NumberResults, Obj, Elm, PointElm, LoadCase, StepType, StepNum,
     F11, F22, F12, FMax, FMin, FAngle, FVM,
     M11, M22, M12, MMax, MMin, MAngle,
     V13, V23, VMax, VAngle, ret] = \
        SapModel.Results.AreaForceShell("LOSA1", ObjectElm, NumberResults, Obj, Elm,
                                        PointElm, LoadCase, StepType, StepNum,
                                        F11, F22, F12, FMax, FMin, FAngle, FVM,
                                        M11, M22, M12, MMax, MMin, MAngle,
                                        V13, V23, VMax, VAngle)

    M11_max = 0
    M22_max = 0
    V13_max = 0

    if NumberResults > 0 and M11:
        M11_max = max(abs(m) for m in M11)
        M22_max = max(abs(m) for m in M22)
        V13_max = max(abs(v) for v in V13)

        print(f"    Puntos de integracion: {NumberResults}")
        print(f"\n    |M11|_max = {M11_max:.6f} kN-m/m")
        print(f"    |M22|_max = {M22_max:.6f} kN-m/m")
        print(f"    |V13|_max = {V13_max:.6f} kN/m")

    # ========================================
    # COMPARACION TEORICA (NAVIER)
    # ========================================
    print("\n" + "="*70)
    print("COMPARACION CON SOLUCION TEORICA (NAVIER)")
    print("="*70)

    # Rigidez a flexion
    D = E * t**3 / (12 * (1 - nu**2))  # kN-m
    print(f"\nRigidez D = {D:.2f} kN-m")

    # Solucion de Navier para placa simplemente apoyada
    def navier_w(x, y, a, b, q, D, n=100):
        w = 0
        for m in range(1, n, 2):
            for nn in range(1, n, 2):
                amn = 16 * q / (math.pi**6 * m * nn)
                denom = D * (m**2/a**2 + nn**2/b**2)**2
                w += amn / denom * math.sin(m*math.pi*x/a) * math.sin(nn*math.pi*y/b)
        return w

    w_navier = navier_w(a/2, b/2, a, b, q, D)

    # Momento maximo (aprox para placa cuadrada)
    M_navier = 0.0479 * q * a**2

    print(f"\nPlaca {a}x{b}m, t={t}m, q={q} kN/m2")
    print(f"Mesh: {nx}x{ny} = {nx*ny} elementos")
    print(f"\nTeorico (Navier):")
    print(f"  w_centro = {w_navier*1000:.6f} mm")
    print(f"  M_centro = {M_navier:.6f} kN-m/m")

    if w_center != 0:
        w_sap = abs(w_center)
        error_w = abs(w_sap - w_navier) / w_navier * 100

        print(f"\nSAP2000:")
        print(f"  w_centro = {w_sap*1000:.6f} mm")
        print(f"  M11_max = {M11_max:.6f} kN-m/m")

        print(f"\nError:")
        print(f"  Desplazamiento: {error_w:.2f}%")

        if M_navier > 0:
            error_M = abs(M11_max - M_navier) / M_navier * 100
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
            "a": a, "b": b, "t": t,
            "E_GPa": E/1e6, "nu": nu, "q_kN_m2": q
        },
        "teorico": {
            "D_kNm": D,
            "w_centro_mm": w_navier * 1000,
            "M_centro_kNm_m": M_navier
        },
        "sap2000": {
            "w_max_mm": abs(w_max) * 1000 if w_max else None,
            "w_centro_mm": abs(w_center) * 1000 if w_center else None,
            "M11_max_kNm_m": M11_max,
            "M22_max_kNm_m": M22_max,
            "V13_max_kN_m": V13_max
        }
    }

    json_path = os.path.join(OUTPUT_DIR, 'sap2000_quad4_automesh_results.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResultados guardados: {json_path}")

    print("\n[12] SAP2000 dejado abierto para inspeccion")
    print(f"     Modelo: {ModelPath}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
