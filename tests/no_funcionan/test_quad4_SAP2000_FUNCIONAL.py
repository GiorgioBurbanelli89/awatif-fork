# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - SAP2000 - BASADO EN rectangular_slab_fea_sap2000.py
======================================================================

Este script FUNCIONA. Basado en el modelo funcional que obtiene momentos.
Crea manualmente nodos y elementos con restricciones correctas.
"""
import comtypes.client
import math

print("="*70)
print("TEST QUAD4 SHELL - SAP2000 - PLACA 2x2m - MESH 4x4")
print("="*70)

# ========== PARAMETROS ==========
a = 2.0   # m (dimension X)
b = 2.0   # m (dimension Y)
t = 0.2   # m (espesor)
q = 10.0  # kN/m2
E = 25000 # MPa (25 GPa)
nu = 0.2
n_a = 4   # elementos en X
n_b = 4   # elementos en Y

OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
import os
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

print(f"\nPARAMETROS:")
print(f"  Dimensiones: {a}m x {b}m")
print(f"  Espesor: {t}m")
print(f"  Carga: {q} kN/m2")
print(f"  E = {E} MPa")
print(f"  nu = {nu}")
print(f"  Malla: {n_a} x {n_b} elementos")

try:
    # ========== INICIAR SAP2000 ==========
    print("\n[1] Iniciando SAP2000...")
    helper = comtypes.client.CreateObject('SAP2000v1.Helper')
    helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
    SapObject = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
    SapObject.ApplicationStart()
    SapModel = SapObject.SapModel
    print("    [OK] Iniciado")

    # ========== CREAR MODELO ==========
    print("\n[2] Creando modelo...")
    SapModel.InitializeNewModel(6)  # kN, m, C
    SapModel.File.NewBlank()
    print("    [OK] Modelo en blanco")

    # ========== MATERIAL ==========
    print("\n[3] Definiendo material...")
    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('MAT', MATERIAL_CONCRETE)
    # E en kN/m2 = MPa * 1000
    SapModel.PropMaterial.SetMPIsotropic('MAT', E*1000, nu, 0.00001)
    print(f"    [OK] E={E} MPa, nu={nu}")

    # ========== PROPIEDAD DE SHELL ==========
    print("\n[4] Definiendo propiedad Plate-Thick...")
    # Tipo 4 = Plate-Thick (Mindlin/Reissner con cortante)
    ret = SapModel.PropArea.SetShell_1('PLACA', 4, False, 'MAT', 0, t, t, -1, "", "")
    print(f"    [OK] PLACA (Plate-Thick/Mindlin, t={t}m)")

    # ========== CREAR PUNTOS ==========
    print(f"\n[5] Creando malla de puntos ({n_a+1} x {n_b+1})...")
    dx = a / n_a
    dy = b / n_b

    point_names = []
    for i in range(n_a + 1):
        for j in range(n_b + 1):
            x = i * dx
            y = j * dy
            z = 0
            name = f"P{i}_{j}"
            SapModel.PointObj.AddCartesian(x, y, z, name)
            point_names.append((i, j, name))

    print(f"    [OK] {(n_a+1)*(n_b+1)} puntos creados")

    # ========== CREAR AREAS ==========
    print(f"\n[6] Creando areas ({n_a} x {n_b})...")
    area_names = []
    for i in range(n_a):
        for j in range(n_b):
            x_coords = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
            y_coords = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
            z_coords = [0, 0, 0, 0]

            area_name = f"A{i}_{j}"
            SapModel.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords, area_name, "PLACA", area_name)
            area_names.append(area_name)

    SapModel.View.RefreshView(0, False)
    print(f"    [OK] {len(area_names)} areas creadas")

    # ========== APOYOS (BORDES) ==========
    print("\n[7] Aplicando apoyos en bordes...")
    # Restricciones:
    # - U3 siempre restringido en bordes
    # - R1 restringido en bordes x=0 y x=a
    # - R2 restringido en bordes y=0 y y=b

    support_count = 0
    for i, j, name in point_names:
        is_x_border = (i == 0 or i == n_a)
        is_y_border = (j == 0 or j == n_b)

        if is_x_border or is_y_border:
            Restraint = [
                False,           # U1
                False,           # U2
                True,            # U3
                is_x_border,     # R1
                is_y_border,     # R2
                False            # R3
            ]
            SapModel.PointObj.SetRestraint(name, Restraint)
            support_count += 1

    print(f"    [OK] {support_count} apoyos aplicados")

    # ========== CARGAS ==========
    print("\n[8] Aplicando carga uniforme...")
    LTYPE_OTHER = 8
    SapModel.LoadPatterns.Add('DEAD', LTYPE_OTHER, 1, True)

    for area_name in area_names:
        # Dir = 6 (Gravity), valor positivo
        SapModel.AreaObj.SetLoadUniform(area_name, 'DEAD', q, 6, True, "Global", 0)

    print(f"    [OK] Carga {q} kN/m2 aplicada")

    # ========== GUARDAR ==========
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_funcional_sap2000.sdb')
    print(f"\n[9] Guardando: {ModelPath}")
    SapModel.File.Save(ModelPath)

    # ========== ANALIZAR ==========
    print("\n[10] Ejecutando analisis...")
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    [OK] Analisis (ret={ret})")

    # ========== CONFIGURAR SALIDA ==========
    print("\n[11] Configurando output...")
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput("DEAD")

    # ========== EXTRAER DESPLAZAMIENTOS ==========
    print("\n[12] Extrayendo desplazamientos...")

    w_max = 0
    w_center = 0
    center_point = f"P{n_a//2}_{n_b//2}"

    # Extraer de todos los puntos
    for i, j, name in point_names:
        NumberResults = 0
        Obj = []; Elm = []; LoadCase = []; StepType = []; StepNum = []
        U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []

        [NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
         U1, U2, U3, R1, R2, R3, ret] = \
            SapModel.Results.JointDispl(name, 0, NumberResults, Obj, Elm,
                                         LoadCase, StepType, StepNum,
                                         U1, U2, U3, R1, R2, R3)

        if NumberResults > 0 and U3:
            uz = U3[0]
            if abs(uz) > abs(w_max):
                w_max = uz
            if name == center_point:
                w_center = uz

    print(f"    |U3|_max = {abs(w_max)*1000:.6f} mm")
    print(f"    U3_centro ({center_point}) = {abs(w_center)*1000:.6f} mm")

    # ========== EXTRAER MOMENTOS GLOBALES ==========
    print("\n[13] Extrayendo momentos...")

    all_M11 = []
    all_M22 = []
    all_V13 = []

    for area_name in area_names:
        NumberResults = 0
        Obj = []; Elm = []; PointElm = []; LoadCase = []
        StepType = []; StepNum = []
        F11 = []; F22 = []; F12 = []; FMax = []; FMin = []; FAngle = []; FVM = []
        M11 = []; M22 = []; M12 = []; MMax = []; MMin = []; MAngle = []
        V13 = []; V23 = []; VMax = []; VAngle = []

        [NumberResults, Obj, Elm, PointElm, LoadCase, StepType, StepNum,
         F11, F22, F12, FMax, FMin, FAngle, FVM,
         M11, M22, M12, MMax, MMin, MAngle,
         V13, V23, VMax, VAngle, ret] = \
            SapModel.Results.AreaForceShell(area_name, 0, 0, [], [],
                                            [], [], [], [],
                                            [], [], [], [], [], [], [],
                                            [], [], [], [], [], [],
                                            [], [], [], [])

        if NumberResults > 0:
            all_M11.extend(M11)
            all_M22.extend(M22)
            all_V13.extend(V13)

    M11_max = max(abs(m) for m in all_M11) if all_M11 else 0
    M22_max = max(abs(m) for m in all_M22) if all_M22 else 0
    V13_max = max(abs(v) for v in all_V13) if all_V13 else 0

    print(f"    |M11|_max = {M11_max:.6f} kN-m/m")
    print(f"    |M22|_max = {M22_max:.6f} kN-m/m")
    print(f"    |V13|_max = {V13_max:.6f} kN/m")

    # ========== COMPARACION TEORICA (NAVIER) ==========
    print("\n" + "="*70)
    print("COMPARACION CON SOLUCION TEORICA (NAVIER)")
    print("="*70)

    # Rigidez a flexion
    D = (E * 1000) * t**3 / (12 * (1 - nu**2))  # kN-m
    print(f"\nRigidez D = {D:.2f} kN-m")

    # Solucion de Navier
    def navier_w(x, y, a, b, q, D, n=100):
        w = 0
        for m in range(1, n, 2):
            for nn in range(1, n, 2):
                amn = 16 * q / (math.pi**6 * m * nn)
                denom = D * (m**2/a**2 + nn**2/b**2)**2
                w += amn / denom * math.sin(m*math.pi*x/a) * math.sin(nn*math.pi*y/b)
        return w

    w_navier = navier_w(a/2, b/2, a, b, q, D)
    M_navier = 0.0479 * q * a**2  # Momento aprox para placa cuadrada

    print(f"\nTeorico (Navier placa delgada):")
    print(f"  w_centro = {w_navier*1000:.6f} mm")
    print(f"  M_centro = {M_navier:.6f} kN-m/m")

    print(f"\nSAP2000 (Plate-Thick Mindlin):")
    print(f"  w_centro = {abs(w_center)*1000:.6f} mm")
    print(f"  M11_max = {M11_max:.6f} kN-m/m")
    print(f"  M22_max = {M22_max:.6f} kN-m/m")

    if w_center != 0:
        error_w = abs(abs(w_center) - w_navier) / w_navier * 100
        print(f"\nError desplazamiento: {error_w:.2f}%")

    if M_navier > 0:
        error_M = abs(M11_max - M_navier) / M_navier * 100
        print(f"Error momento M11: {error_M:.2f}%")

    # ========== GUARDAR JSON ==========
    import json
    results = {
        "software": "SAP2000",
        "mesh": f"{n_a}x{n_b}",
        "elementos": n_a * n_b,
        "parametros": {
            "a": a, "b": b, "t": t,
            "E_MPa": E, "nu": nu, "q_kN_m2": q
        },
        "teorico": {
            "D_kNm": D,
            "w_centro_mm": w_navier * 1000,
            "M_centro_kNm_m": M_navier
        },
        "sap2000": {
            "w_max_mm": abs(w_max) * 1000,
            "w_centro_mm": abs(w_center) * 1000,
            "M11_max_kNm_m": M11_max,
            "M22_max_kNm_m": M22_max,
            "V13_max_kN_m": V13_max
        }
    }

    json_path = os.path.join(OUTPUT_DIR, 'sap2000_quad4_funcional_results.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResultados: {json_path}")

    # ========== CERRAR ==========
    print("\n[14] SAP2000 dejado abierto")
    print(f"     Modelo: {ModelPath}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
