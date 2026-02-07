# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - SAP2000 - SINTAXIS CORRECTA
==============================================

Basado en test_shell_PLATE_THICK_CORRECTO.py que funciona.
Compara con solucion teorica de Navier.
"""

import os
import math
import comtypes.client

print("="*70)
print("TEST QUAD4 SHELL - SAP2000 (SINTAXIS CORRECTA)")
print("="*70)

# Parametros
Lx = 2.0        # m
Ly = 2.0        # m
t = 0.2         # m (espesor)
E = 25000000    # kPa (25 GPa)
nu = 0.2
q = 10.0        # kN/m2

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
    # SetShell_1(Name, ShellType, IncludeDrillingDOF, MatProp, MatAng,
    #            Thickness, Bending, Color, Notes, GUID)
    # ShellType 4 = Plate-Thick (Mindlin/Reissner - CON CORTANTE)
    ret = SapModel.PropArea.SetShell_1('PLACA', 4, False, 'CONC', 0, t, t, -1, "", "")
    print(f"    [OK] PLACA (Plate-Thick, t={t}m)")

    # ========================================
    # GEOMETRIA - 1 QUAD4
    # ========================================
    print("\n[5] Creando Quad4...")
    x_coords = [0, Lx, Lx, 0]
    y_coords = [0, 0, Ly, Ly]
    z_coords = [0, 0, 0, 0]

    for i in range(4):
        SapModel.PointObj.AddCartesian(x_coords[i], y_coords[i], z_coords[i], f"P{i+1}")

    ret = SapModel.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords, "A1", "PLACA", "A1")
    SapModel.View.RefreshView(0, False)
    print(f"    [OK] Quad4 {Lx}x{Ly}m")

    # ========================================
    # APOYOS SIMPLES
    # ========================================
    print("\n[6] Aplicando apoyos simples...")
    # Solo U3 restringido (apoyo simple vertical)
    Restraint = [False, False, True, False, False, False]

    for i in range(1, 5):
        SapModel.PointObj.SetRestraint(f"P{i}", Restraint)

    print("    [OK] 4 apoyos simples (U3 fijo)")

    # ========================================
    # CARGA
    # ========================================
    print("\n[7] Aplicando carga...")
    LTYPE_OTHER = 8
    SapModel.LoadPatterns.Add('CARGA', LTYPE_OTHER, 1, True)

    # Dir = 6 = Gravity direction
    ret = SapModel.AreaObj.SetLoadUniform("A1", 'CARGA', q, 6, True, "Global", 0)
    print(f"    [OK] Carga uniforme q={q} kN/m2")

    # ========================================
    # GUARDAR Y ANALIZAR
    # ========================================
    ModelPath = os.path.join(OUTPUT_DIR, 'test_quad4_sap2000.sdb')
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

    [NumberResults, Obj, Elm, ACase, StepType, StepNum, U1, U2, U3, R1, R2, R3, ret] = \
        SapModel.Results.JointDispl("", ObjectElm, NumberResults, Obj, Elm, ACase,
                                     StepType, StepNum, U1, U2, U3, R1, R2, R3)

    print(f"    Puntos: {NumberResults}")

    w_max = 0
    if NumberResults > 0:
        for i in range(NumberResults):
            print(f"      {Obj[i]}: U3 = {U3[i]*1000:.6f} mm")
            if abs(U3[i]) > abs(w_max):
                w_max = U3[i]

        print(f"\n    |U3|_max = {abs(w_max)*1000:.6f} mm")

    # -- FUERZAS EN SHELL --
    print("\n    FUERZAS SHELL:")

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
        SapModel.Results.AreaForceShell("A1", ObjectElm, NumberResults, Obj, Elm,
                                        PointElm, LoadCase, StepType, StepNum,
                                        F11, F22, F12, FMax, FMin, FAngle, FVM,
                                        M11, M22, M12, MMax, MMin, MAngle,
                                        V13, V23, VMax, VAngle)

    print(f"    Puntos de integracion: {NumberResults}")

    M11_max = 0
    M22_max = 0
    V13_max = 0

    if NumberResults > 0:
        M11_max = max(abs(m) for m in M11)
        M22_max = max(abs(m) for m in M22)
        V13_max = max(abs(v) for v in V13)

        print(f"\n    |M11|_max = {M11_max:.6f} kN-m/m")
        print(f"    |M22|_max = {M22_max:.6f} kN-m/m")
        print(f"    |V13|_max = {V13_max:.6f} kN/m")

        print(f"\n    Detalle por punto:")
        for i in range(NumberResults):
            print(f"      {PointElm[i]}: M11={M11[i]:.4f}, M22={M22[i]:.4f}, V13={V13[i]:.4f}")

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
    # w_max = 0.00406 * q * a^4 / D (para placa cuadrada)
    q_Pa = q * 1000  # kN/m2 a Pa
    w_theory = 0.00406 * q_Pa * Lx**4 / D

    # Momento teorico en el centro
    # M_max = 0.0479 * q * a^2 (para placa cuadrada)
    M_theory = 0.0479 * q * Lx**2

    print(f"\nPlaca {Lx}x{Ly}m, t={t}m, q={q} kN/m2")
    print(f"\nTeorico (Navier):")
    print(f"  w_max = 0.00406 * q * a^4 / D")
    print(f"  w_max = {w_theory*1000:.6f} mm")
    print(f"  M_max = 0.0479 * q * a^2")
    print(f"  M_max = {M_theory:.6f} kN-m/m")

    if w_max != 0:
        w_sap = abs(w_max)
        error_w = abs(w_sap - w_theory) / w_theory * 100

        print(f"\nSAP2000:")
        print(f"  w_max = {w_sap*1000:.6f} mm")
        print(f"  M11_max = {M11_max:.6f} kN-m/m")

        print(f"\nError:")
        print(f"  Desplazamiento: {error_w:.2f}%")

        if M_theory > 0:
            error_M = abs(M11_max - M_theory) / M_theory * 100
            print(f"  Momento: {error_M:.2f}%")

    # ========================================
    # NOTA IMPORTANTE
    # ========================================
    print("\n" + "="*70)
    print("NOTA: Con 1 solo elemento Quad4 el error es alto (~50%)")
    print("      Para precision usar mesh 4x4 o mas fino")
    print("="*70)

    # No cerrar SAP2000 para inspeccion
    print("\n[11] SAP2000 dejado abierto para inspeccion")
    print(f"     Modelo: {ModelPath}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
