# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - SAP2000 - MESH 4x4 - BASADO EN SCRIPT QUE FUNCIONA
=====================================================================

Basado EXACTAMENTE en test_shell_PLATE_THICK_CORRECTO.py que funciona.
Solo agrega mesh 4x4 con la misma logica de apoyos simples (solo U3 fijo).
"""
import comtypes.client
import math

print("="*70)
print("TEST QUAD4 SHELL - SAP2000 - PLACA 2x2m - MESH 4x4 (CORRECTO)")
print("="*70)

try:
    print("\n[1] Iniciando SAP2000...")
    helper = comtypes.client.CreateObject('SAP2000v1.Helper')
    helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
    SapObject = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
    SapObject.ApplicationStart()
    SapModel = SapObject.SapModel
    print("    [OK] Iniciado")

    print("\n[2] Creando modelo...")
    SapModel.InitializeNewModel(6)  # kN, m, C
    SapModel.File.NewBlank()
    print("    [OK] Modelo en blanco")

    print("\n[3] Definiendo material...")
    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('CONC', MATERIAL_CONCRETE)
    SapModel.PropMaterial.SetMPIsotropic('CONC', 25000000, 0.2, 0.00001)
    print("    [OK] Material CONC (E=25 GPa)")

    print("\n[4] Definiendo propiedad PLATE-THICK...")
    # SetShell_1: Name, ShellType, IncludeDrillingDOF, MatProp, MatAng, Thickness, Bending, Color, Notes, GUID
    # ShellType 4 = Plate-Thick (Mindlin/Reissner)
    ret = SapModel.PropArea.SetShell_1('PLACA', 4, False, 'CONC', 0, 0.2, 0.2, -1, "", "")
    print(f"    [OK] PLACA (Plate-Thick tipo 4, t=0.2m)")

    # ========== MESH 4x4 ==========
    Lx = 2.0
    Ly = 2.0
    nx = 4
    ny = 4
    dx = Lx / nx
    dy = Ly / ny

    print(f"\n[5] Creando puntos (mesh {nx}x{ny})...")
    point_map = {}
    point_id = 1
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = i * dx
            y = j * dy
            z = 0
            name = f"P{point_id}"
            SapModel.PointObj.AddCartesian(x, y, z, name)
            point_map[(i, j)] = name
            point_id += 1

    print(f"    [OK] {point_id - 1} puntos creados")

    print(f"\n[6] Creando areas...")
    area_names = []
    area_id = 1
    for j in range(ny):
        for i in range(nx):
            x_coords = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
            y_coords = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
            z_coords = [0, 0, 0, 0]

            name = f"A{area_id}"
            ret = SapModel.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords, name, "PLACA", name)
            area_names.append(name)
            area_id += 1

    SapModel.View.RefreshView(0, False)
    print(f"    [OK] {len(area_names)} areas creadas")

    print("\n[7] Aplicando apoyos simples en bordes...")
    # IGUAL QUE EL SCRIPT FUNCIONAL: Solo U3 restringido
    Restraint = [False, False, True, False, False, False]

    support_count = 0
    for j in range(ny + 1):
        for i in range(nx + 1):
            # Solo nodos en bordes
            if i == 0 or i == nx or j == 0 or j == ny:
                SapModel.PointObj.SetRestraint(point_map[(i, j)], Restraint)
                support_count += 1

    print(f"    [OK] {support_count} apoyos simples (U3 fijo)")

    print("\n[8] Creando patron de carga...")
    LTYPE_OTHER = 8
    SapModel.LoadPatterns.Add('DEAD', LTYPE_OTHER, 1, True)
    print("    [OK] Patron DEAD")

    print("\n[9] Aplicando carga uniforme...")
    # IGUAL QUE EL SCRIPT FUNCIONAL: Dir = 6 (Gravity), valor positivo, Replace=True
    for name in area_names:
        ret = SapModel.AreaObj.SetLoadUniform(name, 'DEAD', 10, 6, True, "Global", 0)
    print(f"    [OK] Carga 10 kN/m2")

    # Save
    import os
    OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_mesh4x4_correcto.sdb')
    print(f"\n[10] Guardando: {ModelPath}")
    SapModel.File.Save(ModelPath)

    # Analyze
    print("\n[11] Ejecutando analisis...")
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    [OK] Analisis (ret={ret})")

    # Configure output
    print("\n[12] Configurando output...")
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput("DEAD")
    print("    [OK] Caso DEAD seleccionado")

    # ========== EXTRAER DESPLAZAMIENTOS ==========
    print("\n[13] Extrayendo desplazamientos...")

    w_max = 0
    w_center = 0
    center_node = point_map[(nx//2, ny//2)]

    for j in range(ny + 1):
        for i in range(nx + 1):
            name = point_map[(i, j)]
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
                if name == center_node:
                    w_center = uz

    print(f"    |U3|_max = {abs(w_max)*1000:.6f} mm")
    print(f"    U3_centro ({center_node}) = {abs(w_center)*1000:.6f} mm")

    # ========== EXTRAER MOMENTOS ==========
    print("\n[14] Extrayendo momentos...")

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
        ObjectElm = 0

        [NumberResults, Obj, Elm, PointElm, LoadCase, StepType, StepNum,
         F11, F22, F12, FMax, FMin, FAngle, FVM,
         M11, M22, M12, MMax, MMin, MAngle,
         V13, V23, VMax, VAngle, ret] = \
            SapModel.Results.AreaForceShell(area_name, ObjectElm, NumberResults, Obj, Elm,
                                            PointElm, LoadCase, StepType, StepNum,
                                            F11, F22, F12, FMax, FMin, FAngle, FVM,
                                            M11, M22, M12, MMax, MMin, MAngle,
                                            V13, V23, VMax, VAngle)

        if NumberResults > 0:
            all_M11.extend(M11)
            all_M22.extend(M22)
            all_V13.extend(V13)

    print(f"    Puntos totales: {len(all_M11)}")

    if all_M11:
        M11_max = max(abs(m) for m in all_M11)
        M22_max = max(abs(m) for m in all_M22)
        V13_max = max(abs(v) for v in all_V13)

        print(f"\n    |M11|_max = {M11_max:.6f} kN-m/m")
        print(f"    |M22|_max = {M22_max:.6f} kN-m/m")
        print(f"    |V13|_max = {V13_max:.6f} kN/m")
    else:
        M11_max = 0
        M22_max = 0
        V13_max = 0

    # ========== COMPARACION TEORICA ==========
    print("\n" + "="*70)
    print("COMPARACION TEORICA (NAVIER)")
    print("="*70)

    t = 0.2
    E = 25000000  # kPa
    nu = 0.2
    q = 10.0

    D = E * t**3 / (12 * (1 - nu**2))
    print(f"\nRigidez D = {D:.2f} kN-m")

    # Navier para placa simplemente apoyada
    def navier_w(x, y, a, b, q, D, n=100):
        w = 0
        for m in range(1, n, 2):
            for nn in range(1, n, 2):
                amn = 16 * q / (math.pi**6 * m * nn)
                denom = D * (m**2/a**2 + nn**2/b**2)**2
                w += amn / denom * math.sin(m*math.pi*x/a) * math.sin(nn*math.pi*y/b)
        return w

    w_navier = navier_w(Lx/2, Ly/2, Lx, Ly, q, D)
    M_navier = 0.0479 * q * Lx**2

    print(f"\nTeorico (Navier):")
    print(f"  w_centro = {w_navier*1000:.6f} mm")
    print(f"  M_centro = {M_navier:.6f} kN-m/m")

    print(f"\nSAP2000 (Plate-Thick, mesh {nx}x{ny}):")
    print(f"  w_centro = {abs(w_center)*1000:.6f} mm")
    print(f"  M11_max = {M11_max:.6f} kN-m/m")
    print(f"  M22_max = {M22_max:.6f} kN-m/m")

    if w_center != 0:
        error_w = abs(abs(w_center) - w_navier) / w_navier * 100
        print(f"\n  Error w: {error_w:.2f}%")

    if M_navier > 0 and M11_max > 0:
        error_M = abs(M11_max - M_navier) / M_navier * 100
        print(f"  Error M11: {error_M:.2f}%")

    # ========== GUARDAR JSON ==========
    import json
    results = {
        "software": "SAP2000",
        "mesh": f"{nx}x{ny}",
        "elementos": nx * ny,
        "parametros": {"Lx": Lx, "Ly": Ly, "t": t, "E_kPa": E, "nu": nu, "q": q},
        "teorico": {"D_kNm": D, "w_centro_mm": w_navier*1000, "M_centro_kNm_m": M_navier},
        "sap2000": {
            "w_max_mm": abs(w_max)*1000,
            "w_centro_mm": abs(w_center)*1000,
            "M11_max_kNm_m": M11_max,
            "M22_max_kNm_m": M22_max,
            "V13_max_kN_m": V13_max
        }
    }
    json_path = os.path.join(OUTPUT_DIR, 'sap2000_quad4_mesh4x4_correcto.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nJSON: {json_path}")

    # Cerrar
    print("\n[15] Cerrando SAP2000...")
    SapObject.ApplicationExit(False)
    print("    [OK] Cerrado")

    print("\n" + "="*70)
    if M11_max > 0:
        print("EXITO - RESULTADOS OBTENIDOS")
    else:
        print("SIN RESULTADOS")
    print("="*70)

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
