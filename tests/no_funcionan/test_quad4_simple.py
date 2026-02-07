# -*- coding: utf-8 -*-
"""
Test Simple Quad4 - Un solo elemento shell
==========================================

Crea un elemento Quad4 simple en SAP2000 y extrae:
1. Matriz de rigidez local
2. Desplazamientos bajo carga
3. Momentos y cortantes

Esto permite validar directamente la implementación de awatif-fem.
"""

import os
import comtypes.client
import numpy as np

print("="*70)
print("TEST QUAD4 SIMPLE - SAP2000")
print("="*70)

# Parámetros
Lx = 2.0        # m
Ly = 2.0        # m
t = 0.2         # m (espesor)
E = 25e6        # kPa (25 GPa)
nu = 0.2        # Poisson
q = 10.0        # kN/m² (carga uniforme)

OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

try:
    # ========================================
    # CONECTAR A SAP2000
    # ========================================
    print("\n[1] Conectando a SAP2000...")
    helper = comtypes.client.CreateObject('SAP2000v1.Helper')
    helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
    sap = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
    sap.ApplicationStart()
    model = sap.SapModel
    print("    [OK] Conectado")

    # Obtener versión
    version = model.GetVersion()
    print(f"    Versión: {version[0]}")

    # ========================================
    # CREAR MODELO
    # ========================================
    print("\n[2] Creando modelo...")
    model.InitializeNewModel(6)  # kN, m, C
    model.File.NewBlank()
    print("    [OK]")

    # ========================================
    # MATERIAL
    # ========================================
    print("\n[3] Definiendo material...")
    model.PropMaterial.SetMaterial('MAT1', 2)  # 2 = Concrete
    model.PropMaterial.SetMPIsotropic('MAT1', E, nu, 0.00001)
    print(f"    E = {E/1e6} GPa, nu = {nu}")

    # ========================================
    # PROPIEDAD SHELL
    # ========================================
    print("\n[4] Definiendo shell...")
    # ShellType: 1=Shell-Thin, 2=Shell-Thick, 3=Plate-Thin, 4=Plate-Thick, 5=Membrane
    # Usamos 4 = Plate-Thick (Mindlin/Reissner - incluye cortante)
    ret = model.PropArea.SetShell_1('SHELL1', 4, False, 'MAT1', 0, t, t, -1, "", "")
    print(f"    Tipo: Plate-Thick, t = {t} m")

    # ========================================
    # GEOMETRÍA - QUAD4
    # ========================================
    print("\n[5] Creando Quad4...")

    # 4 nodos en esquinas (sentido antihorario)
    nodes = [
        (0, 0, 0),      # N1
        (Lx, 0, 0),     # N2
        (Lx, Ly, 0),    # N3
        (0, Ly, 0)      # N4
    ]

    for i, (x, y, z) in enumerate(nodes):
        model.PointObj.AddCartesian(x, y, z, f"N{i+1}")

    # Crear área Quad4
    x_c = [n[0] for n in nodes]
    y_c = [n[1] for n in nodes]
    z_c = [n[2] for n in nodes]

    ret = model.AreaObj.AddByCoord(4, x_c, y_c, z_c, "QUAD1", "SHELL1", "QUAD1")
    print(f"    [OK] Quad4 {Lx}x{Ly} m")

    # Verificar
    num_areas = model.AreaObj.Count()
    print(f"    Áreas en modelo: {num_areas}")

    # ========================================
    # APOYOS
    # ========================================
    print("\n[6] Aplicando apoyos...")

    # Caso 1: Simplemente apoyada (solo UZ en las 4 esquinas)
    restraint = [False, False, True, False, False, False]  # solo U3

    for i in range(1, 5):
        model.PointObj.SetRestraint(f"N{i}", restraint)

    print("    [OK] 4 apoyos simples (U3 fijo)")

    # ========================================
    # CARGA
    # ========================================
    print("\n[7] Aplicando carga...")
    model.LoadPatterns.Add('CARGA1', 8, 0, True)  # 8 = Other

    # Carga uniforme en área
    # Dir: 6 = Gravity direction
    ret = model.AreaObj.SetLoadUniform("QUAD1", 'CARGA1', q, 6, True)
    print(f"    [OK] q = {q} kN/m²")

    # ========================================
    # GUARDAR
    # ========================================
    model_path = os.path.join(OUTPUT_DIR, 'test_quad4_simple.sdb')
    print(f"\n[8] Guardando: {model_path}")
    model.File.Save(model_path)

    # ========================================
    # ANÁLISIS
    # ========================================
    print("\n[9] Ejecutando análisis...")
    model.Analyze.CreateAnalysisModel()
    ret = model.Analyze.RunAnalysis()
    print(f"    [OK] ret = {ret}")

    # ========================================
    # RESULTADOS
    # ========================================
    print("\n[10] Extrayendo resultados...")

    model.Results.Setup.DeselectAllCasesAndCombosForOutput()
    model.Results.Setup.SetCaseSelectedForOutput("CARGA1")

    # -- DESPLAZAMIENTOS --
    print("\n    DESPLAZAMIENTOS:")

    NumberResults = 0
    Obj = []; Elm = []; LoadCase = []; StepType = []; StepNum = []
    U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []

    [NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
     U1, U2, U3, R1, R2, R3, ret] = model.Results.JointDispl(
        "", 0, NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
        U1, U2, U3, R1, R2, R3)

    print(f"    Nodos con resultados: {NumberResults}")

    if NumberResults > 0:
        for i in range(NumberResults):
            print(f"      {Obj[i]}: U3 = {U3[i]*1000:.6f} mm")

    # -- FUERZAS EN SHELL --
    print("\n    FUERZAS/MOMENTOS EN SHELL:")

    NumberResults = 0
    Obj = []; Elm = []; PointElm = []; LoadCase = []
    StepType = []; StepNum = []
    F11 = []; F22 = []; F12 = []; FMax = []; FMin = []; FAngle = []; FVM = []
    M11 = []; M22 = []; M12 = []; MMax = []; MMin = []; MAngle = []
    V13 = []; V23 = []; VMax = []; VAngle = []

    [NumberResults, Obj, Elm, PointElm, LoadCase, StepType, StepNum,
     F11, F22, F12, FMax, FMin, FAngle, FVM,
     M11, M22, M12, MMax, MMin, MAngle,
     V13, V23, VMax, VAngle, ret] = model.Results.AreaForceShell(
        "QUAD1", 0, NumberResults, Obj, Elm, PointElm, LoadCase,
        StepType, StepNum,
        F11, F22, F12, FMax, FMin, FAngle, FVM,
        M11, M22, M12, MMax, MMin, MAngle,
        V13, V23, VMax, VAngle)

    print(f"    Puntos con resultados: {NumberResults}")

    if NumberResults > 0:
        print(f"\n    Resultados en puntos de integración:")
        for i in range(min(NumberResults, 8)):
            print(f"      {PointElm[i]}:")
            print(f"        M11 = {M11[i]:.6f} kN-m/m")
            print(f"        M22 = {M22[i]:.6f} kN-m/m")
            print(f"        V13 = {V13[i]:.6f} kN/m")

        print(f"\n    Valores máximos:")
        print(f"      |M11|_max = {max(abs(m) for m in M11):.6f} kN-m/m")
        print(f"      |M22|_max = {max(abs(m) for m in M22):.6f} kN-m/m")
        print(f"      |V13|_max = {max(abs(v) for v in V13):.6f} kN/m")

    # ========================================
    # COMPARACIÓN TEÓRICA
    # ========================================
    print("\n" + "="*70)
    print("COMPARACIÓN CON SOLUCIÓN TEÓRICA")
    print("="*70)

    # Rigidez a flexión
    D = E * 1000 * t**3 / (12 * (1 - nu**2))  # E en Pa
    print(f"\nRigidez D = {D:.2f} N-m")

    # Placa cuadrada simplemente apoyada con carga uniforme
    # Solución de Navier: w_max ≈ 0.00406 * q * a^4 / D
    q_Pa = q * 1000  # kN/m² a Pa
    a = Lx
    w_theory = 0.00406 * q_Pa * a**4 / D

    # Momento en el centro: M_max ≈ 0.0479 * q * a²
    M_theory = 0.0479 * q * a**2  # kN-m/m

    print(f"\nTeoría (Navier para placa simplemente apoyada):")
    print(f"  w_max = 0.00406 * q * a⁴ / D")
    print(f"  w_max = {w_theory*1000:.6f} mm")
    print(f"  M_max ≈ 0.0479 * q * a² = {M_theory:.6f} kN-m/m")

    if NumberResults > 0 and len(U3) > 0:
        w_sap = max(abs(u) for u in U3)
        M_sap = max(abs(m) for m in M11) if M11 else 0

        error_w = abs(w_sap - w_theory) / w_theory * 100 if w_theory > 0 else 0
        error_M = abs(M_sap - M_theory) / M_theory * 100 if M_theory > 0 else 0

        print(f"\nComparación SAP2000 vs Teórico:")
        print(f"  w: SAP={w_sap*1000:.6f} mm, Teórico={w_theory*1000:.6f} mm, Error={error_w:.2f}%")
        print(f"  M: SAP={M_sap:.6f} kN-m/m, Teórico={M_theory:.6f} kN-m/m, Error={error_M:.2f}%")

        # Nota: Con solo 1 elemento Quad4 el error será alto
        # Se necesita mesh más fino para converger
        print("\n  NOTA: Con 1 solo elemento el error es alto.")
        print("  Para mejor precisión usar mesh más fino (4x4 o más).")

    # ========================================
    # DATOS PARA AWATIF-FEM
    # ========================================
    print("\n" + "="*70)
    print("DATOS PARA VALIDAR AWATIF-FEM")
    print("="*70)

    print(f"""
// Nodos (4)
const nodes = [
  [0, 0, 0],      // N0
  [{Lx}, 0, 0],   // N1
  [{Lx}, {Ly}, 0],// N2
  [0, {Ly}, 0]    // N3
];

// Elemento Quad4
const elements = [[0, 1, 2, 3]];

// Apoyos (U3 fijo en todos)
const supports = {{
  0: [false, false, true, false, false, false],
  1: [false, false, true, false, false, false],
  2: [false, false, true, false, false, false],
  3: [false, false, true, false, false, false]
}};

// Propiedades
const elementInputs = {{
  elasticities: {{ 0: {E*1000} }},     // Pa
  poissonsRatios: {{ 0: {nu} }},
  thicknesses: {{ 0: {t} }}           // m
}};

// Carga uniforme: {q} kN/m² = {q*1000} Pa
""")

    # ========================================
    # FINALIZAR
    # ========================================
    print("\n[11] SAP2000 dejado abierto para inspección")
    print(f"     Archivo: {model_path}")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
