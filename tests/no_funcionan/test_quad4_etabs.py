# -*- coding: utf-8 -*-
"""
Test Quad4 Shell - ETABS
========================

Crea un elemento Quad4 shell en ETABS y extrae resultados
para comparar con awatif-fem.

Basado en: Api Etabs/Ejemplo_oficial_etabs.py
"""

import os
import sys
import comtypes.client

print("="*70)
print("TEST QUAD4 - ETABS")
print("="*70)

# Parámetros
Lx = 2.0        # m
Ly = 2.0        # m
t = 0.2         # m (espesor)
E = 25e6        # kPa (25 GPa)
nu = 0.2        # Poisson
q = 10.0        # kN/m² (carga uniforme)
rho = 2500      # kg/m³ (para modal)

OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Configuración
AttachToInstance = False  # True para conectar a ETABS existente
SpecifyPath = False
ProgramPath = R'C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe'

try:
    # ========================================
    # CONECTAR A ETABS
    # ========================================
    print("\n[1] Conectando a ETABS...")

    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    if AttachToInstance:
        try:
            etabs = helper.GetObject("CSI.ETABS.API.ETABSObject")
            print("    [OK] Conectado a instancia existente")
        except:
            print("    [WARN] No hay instancia, creando nueva...")
            etabs = helper.CreateObjectProgID("CSI.ETABS.API.ETABSObject")
            etabs.ApplicationStart()
    else:
        if SpecifyPath:
            etabs = helper.CreateObject(ProgramPath)
        else:
            etabs = helper.CreateObjectProgID("CSI.ETABS.API.ETABSObject")
        etabs.ApplicationStart()

    model = etabs.SapModel
    print("    [OK] ETABS iniciado")

    # ========================================
    # CREAR MODELO
    # ========================================
    print("\n[2] Inicializando modelo...")
    model.InitializeNewModel(6)  # kN, m, C
    model.File.NewBlank()
    print("    [OK]")

    # ========================================
    # MATERIAL
    # ========================================
    print("\n[3] Definiendo material...")
    model.PropMaterial.SetMaterial('CONC', 2)  # 2 = Concrete
    model.PropMaterial.SetMPIsotropic('CONC', E, nu, 0.00001)

    # Masa para análisis modal
    # SetWeightAndMass(Name, PerUnitVolume, Value)
    # PerUnitVolume: 1 = Weight, 2 = Mass
    weight_density = rho * 9.81 / 1000  # kN/m³
    model.PropMaterial.SetWeightAndMass('CONC', 1, weight_density)

    print(f"    E = {E/1e6} GPa, nu = {nu}")
    print(f"    Densidad = {rho} kg/m³")

    # ========================================
    # PROPIEDAD SHELL
    # ========================================
    print("\n[4] Definiendo shell...")

    # SetShell_1(Name, ShellType, IncludeDrillingDOF, MatProp, MatAng,
    #            Membrane_t, Bending_t, Color, Notes, GUID)
    # ShellType: 4 = Plate-Thick (Mindlin)
    ret = model.PropArea.SetShell_1('SHELL1', 4, False, 'CONC', 0, t, t, -1, "", "")
    print(f"    [OK] Plate-Thick, t = {t} m")

    # ========================================
    # GEOMETRÍA - MESH 4x4
    # ========================================
    print("\n[5] Creando mesh 4x4...")

    nx, ny = 4, 4
    dx = Lx / nx
    dy = Ly / ny

    # Crear puntos
    point_map = {}
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = i * dx
            y = j * dy
            z = 0
            name = f"P_{i}_{j}"
            model.PointObj.AddCartesian(x, y, z, name)
            point_map[(i, j)] = name

    print(f"    {(nx+1)*(ny+1)} puntos creados")

    # Crear áreas Quad4
    area_count = 0
    for j in range(ny):
        for i in range(nx):
            x_c = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
            y_c = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
            z_c = [0, 0, 0, 0]

            area_name = f"A_{i}_{j}"
            model.AreaObj.AddByCoord(4, x_c, y_c, z_c, area_name, "SHELL1", area_name)
            area_count += 1

    print(f"    {area_count} elementos Quad4 creados")

    # ========================================
    # APOYOS
    # ========================================
    print("\n[6] Aplicando apoyos...")

    # Simplemente apoyada en bordes (solo U3)
    restraint = [False, False, True, False, False, False]
    support_count = 0

    for j in range(ny + 1):
        for i in range(nx + 1):
            # Bordes
            if i == 0 or i == nx or j == 0 or j == ny:
                model.PointObj.SetRestraint(point_map[(i, j)], restraint)
                support_count += 1

    print(f"    {support_count} apoyos simples (U3 fijo)")

    # ========================================
    # CARGA ESTÁTICA
    # ========================================
    print("\n[7] Aplicando carga estática...")

    model.LoadPatterns.Add('CARGA', 8, 0, True)  # 8 = Other

    # Aplicar carga uniforme a todas las áreas
    for j in range(ny):
        for i in range(nx):
            area_name = f"A_{i}_{j}"
            model.AreaObj.SetLoadUniform(area_name, 'CARGA', q, 6, True)

    print(f"    q = {q} kN/m²")

    # ========================================
    # CASO MODAL
    # ========================================
    print("\n[8] Configurando análisis modal...")

    try:
        model.LoadCases.ModalEigen.SetCase("MODAL")
        model.LoadCases.ModalEigen.SetNumberModes("MODAL", 10, 1)
        print("    [OK] Caso modal configurado (10 modos)")
    except Exception as e:
        print(f"    [WARN] No se pudo configurar modal: {e}")

    # ========================================
    # GUARDAR
    # ========================================
    model_path = os.path.join(OUTPUT_DIR, 'test_quad4_etabs.edb')
    print(f"\n[9] Guardando: {model_path}")
    model.File.Save(model_path)

    # ========================================
    # ANÁLISIS
    # ========================================
    print("\n[10] Ejecutando análisis...")
    ret = model.Analyze.RunAnalysis()
    print(f"    [OK] ret = {ret}")

    # ========================================
    # RESULTADOS ESTÁTICOS
    # ========================================
    print("\n[11] Extrayendo resultados estáticos...")

    model.Results.Setup.DeselectAllCasesAndCombosForOutput()
    model.Results.Setup.SetCaseSelectedForOutput("CARGA")

    # Desplazamientos
    NumberResults = 0
    Obj = []; Elm = []; LoadCase = []; StepType = []; StepNum = []
    U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []

    [NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
     U1, U2, U3, R1, R2, R3, ret] = model.Results.JointDispl(
        "", 0, NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
        U1, U2, U3, R1, R2, R3)

    print(f"\n    DESPLAZAMIENTOS ({NumberResults} nodos):")

    if NumberResults > 0:
        # Encontrar nodo central
        center_idx = -1
        for i, name in enumerate(Obj):
            if "2_2" in name:  # Centro del mesh 4x4
                center_idx = i
                break

        if center_idx >= 0:
            print(f"      Centro ({Obj[center_idx]}): U3 = {U3[center_idx]*1000:.6f} mm")

        max_U3 = max(abs(u) for u in U3)
        print(f"      |U3|_max = {max_U3*1000:.6f} mm")

    # Fuerzas en shell
    NumberResults = 0
    Obj = []; Elm = []; PointElm = []; LoadCase = []
    StepType = []; StepNum = []
    F11 = []; F22 = []; F12 = []; FMax = []; FMin = []; FAngle = []; FVM = []
    M11 = []; M22 = []; M12 = []; MMax = []; MMin = []; MAngle = []
    V13 = []; V23 = []; VMax = []; VAngle = []

    # Obtener resultados del área central
    [NumberResults, Obj, Elm, PointElm, LoadCase, StepType, StepNum,
     F11, F22, F12, FMax, FMin, FAngle, FVM,
     M11, M22, M12, MMax, MMin, MAngle,
     V13, V23, VMax, VAngle, ret] = model.Results.AreaForceShell(
        "", 0, NumberResults, Obj, Elm, PointElm, LoadCase,
        StepType, StepNum,
        F11, F22, F12, FMax, FMin, FAngle, FVM,
        M11, M22, M12, MMax, MMin, MAngle,
        V13, V23, VMax, VAngle)

    print(f"\n    MOMENTOS ({NumberResults} puntos):")

    if NumberResults > 0:
        max_M11 = max(abs(m) for m in M11)
        max_M22 = max(abs(m) for m in M22)
        max_V13 = max(abs(v) for v in V13)

        print(f"      |M11|_max = {max_M11:.6f} kN-m/m")
        print(f"      |M22|_max = {max_M22:.6f} kN-m/m")
        print(f"      |V13|_max = {max_V13:.6f} kN/m")

    # ========================================
    # RESULTADOS MODALES
    # ========================================
    print("\n[12] Extrayendo resultados modales...")

    NumberResults = 0
    LoadCase = []; StepType = []; StepNum = []
    Period = []; Frequency = []; CircFreq = []; EigenValue = []

    try:
        [NumberResults, LoadCase, StepType, StepNum, Period, Frequency,
         CircFreq, EigenValue, ret] = model.Results.ModalPeriod(
            NumberResults, LoadCase, StepType, StepNum,
            Period, Frequency, CircFreq, EigenValue)

        if NumberResults > 0:
            print(f"\n    FRECUENCIAS NATURALES ({NumberResults} modos):")
            for i in range(min(NumberResults, 5)):
                print(f"      Modo {i+1}: f = {Frequency[i]:.4f} Hz, T = {Period[i]:.4f} s")
    except Exception as e:
        print(f"    [WARN] No se pudieron extraer modos: {e}")

    # ========================================
    # COMPARACIÓN TEÓRICA
    # ========================================
    print("\n" + "="*70)
    print("COMPARACIÓN TEÓRICA")
    print("="*70)

    import math

    # Rigidez D
    D = E * 1000 * t**3 / (12 * (1 - nu**2))

    # Desplazamiento teórico (Navier)
    q_Pa = q * 1000
    w_theory = 0.00406 * q_Pa * Lx**4 / D

    # Momento teórico
    M_theory = 0.0479 * q * Lx**2

    # Frecuencia teórica modo (1,1)
    rho_area = rho * t
    f11_theory = (math.pi / 2) * math.sqrt(D / rho_area) * \
                 ((1/Lx)**2 + (1/Ly)**2)

    print(f"\nTeórico (placa simplemente apoyada {Lx}x{Ly}m):")
    print(f"  D = {D:.2f} N-m")
    print(f"  w_max = {w_theory*1000:.6f} mm")
    print(f"  M_max = {M_theory:.6f} kN-m/m")
    print(f"  f_11 = {f11_theory:.4f} Hz")

    if NumberResults > 0 and len(U3) > 0:
        w_etabs = max(abs(u) for u in U3)
        error_w = abs(w_etabs - w_theory) / w_theory * 100

        print(f"\nETABS vs Teórico:")
        print(f"  w: {w_etabs*1000:.6f} mm vs {w_theory*1000:.6f} mm ({error_w:.2f}% error)")

        if M11:
            M_etabs = max(abs(m) for m in M11)
            error_M = abs(M_etabs - M_theory) / M_theory * 100
            print(f"  M: {M_etabs:.6f} vs {M_theory:.6f} kN-m/m ({error_M:.2f}% error)")

        if Frequency:
            f_etabs = Frequency[0]
            error_f = abs(f_etabs - f11_theory) / f11_theory * 100
            print(f"  f: {f_etabs:.4f} Hz vs {f11_theory:.4f} Hz ({error_f:.2f}% error)")

    # ========================================
    # GUARDAR RESULTADOS
    # ========================================
    print("\n[13] Guardando resultados...")

    results = {
        'geometry': {'Lx': Lx, 'Ly': Ly, 't': t, 'mesh': f'{nx}x{ny}'},
        'material': {'E': E, 'nu': nu, 'rho': rho},
        'load': {'q': q},
        'etabs': {
            'w_max': max(abs(u) for u in U3) if U3 else None,
            'M11_max': max(abs(m) for m in M11) if M11 else None,
            'M22_max': max(abs(m) for m in M22) if M22 else None,
            'frequencies': list(Frequency[:5]) if Frequency else []
        },
        'theoretical': {
            'w_max': w_theory,
            'M_max': M_theory,
            'f11': f11_theory
        }
    }

    import json
    results_path = os.path.join(OUTPUT_DIR, 'test_quad4_etabs_results.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"    [OK] {results_path}")

    # ========================================
    # FINALIZAR
    # ========================================
    print("\n[14] ETABS dejado abierto para inspección")
    print(f"     Modelo: {model_path}")

    print("\n" + "="*70)
    print("TEST COMPLETADO")
    print("="*70)

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()

print("\n[FIN]")
