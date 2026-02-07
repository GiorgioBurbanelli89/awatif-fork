# -*- coding: utf-8 -*-
"""
ETABS API: Crear los 3 modelos de comparacion
Modelo 1: Columna + Voladizo
Modelo 2: 2 Columnas + 2 Voladizos Paralelos
Modelo 3: Portico 3D + Losa Shell + Voladizos
"""
import os
import sys
import math
import comtypes.client

# Conectar a ETABS existente o abrir nuevo
AttachToInstance = True  # Cambiar a False para abrir nuevo ETABS

print("=" * 70)
print("ETABS API: Modelos de Comparacion")
print("=" * 70)

# =============================================================================
# CONEXION A ETABS
# =============================================================================
try:
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    if AttachToInstance:
        myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
        print("[OK] Conectado a ETABS existente")
    else:
        ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
        myETABSObject = helper.CreateObject(ProgramPath)
        myETABSObject.ApplicationStart()
        print("[OK] ETABS iniciado")

    SapModel = myETABSObject.SapModel
except Exception as e:
    print(f"ERROR conectando a ETABS: {e}")
    print("Asegurese de que ETABS este abierto si AttachToInstance=True")
    sys.exit(1)

# =============================================================================
# PROPIEDADES COMUNES
# =============================================================================
fc = 210  # kg/cm2
E_kgcm2 = 15100 * math.sqrt(fc)
E_kPa = E_kgcm2 * 98.0665  # kPa (kN/m2)
E_MPa = E_kPa / 1000  # MPa = kN/mm2 * 1e6
nu = 0.2
rho = 2.4  # ton/m3

# Secciones
col_b, col_h = 0.30, 0.30  # m
beam_b, beam_h = 0.25, 0.40  # m
slab_t = 0.12  # m

print(f"\nPropiedades:")
print(f"  E = {E_MPa:.0f} MPa")
print(f"  nu = {nu}")
print(f"  rho = {rho} ton/m3")


def crear_modelo_1():
    """Modelo 1: Columna + Voladizo"""
    print("\n" + "=" * 70)
    print("MODELO 1: Columna + Voladizo")
    print("=" * 70)

    H = 3.0
    voladizo = 1.5

    # Iniciar modelo nuevo
    SapModel.InitializeNewModel()
    ret = SapModel.File.NewBlank()

    # Unidades kN, m
    kN_m_C = 6
    SapModel.SetPresentUnits(kN_m_C)

    # Material
    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('CONC', MATERIAL_CONCRETE)
    SapModel.PropMaterial.SetMPIsotropic('CONC', E_MPa * 1000, nu, 0.00001)  # E en kPa
    SapModel.PropMaterial.SetWeightAndMass('CONC', 1, rho * 9.81)  # Peso unitario kN/m3

    # Secciones
    SapModel.PropFrame.SetRectangle('COL30x30', 'CONC', col_h, col_b)
    SapModel.PropFrame.SetRectangle('VIGA25x40', 'CONC', beam_h, beam_b)

    # Crear frames
    FrameName = ''
    # Columna
    [FrameName, ret] = SapModel.FrameObj.AddByCoord(0, 0, 0, 0, 0, H, FrameName, 'COL30x30', '1')
    # Voladizo
    [FrameName, ret] = SapModel.FrameObj.AddByCoord(0, 0, H, voladizo, 0, H, FrameName, 'VIGA25x40', '2')

    # Apoyo empotrado en base
    SapModel.PointObj.SetRestraint('1', [True, True, True, True, True, True])

    # Modal analysis
    SapModel.LoadCases.ModalEigen.SetCase('MODAL')
    SapModel.LoadCases.ModalEigen.SetNumberModes('MODAL', 6, 1)

    SapModel.View.RefreshView(0, False)

    # Guardar
    ModelPath = os.path.join(os.getcwd(), 'ETABS_Modelo1.edb')
    SapModel.File.Save(ModelPath)
    print(f"[OK] Modelo guardado: {ModelPath}")

    # Correr analisis
    print("Ejecutando analisis...")
    SapModel.Analyze.RunAnalysis()

    # Obtener resultados modales
    print("\nResultados Modal:")
    NumberResults = 0
    LoadCase = []
    StepType = []
    StepNum = []
    Period = []
    Frequency = []
    CircFreq = []
    EigenValue = []

    [NumberResults, LoadCase, StepType, StepNum, Period, Frequency, CircFreq, EigenValue, ret] = \
        SapModel.Results.ModalPeriod(NumberResults, LoadCase, StepType, StepNum, Period, Frequency, CircFreq, EigenValue)

    print(f"{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
    print("-" * 35)
    for i in range(min(6, NumberResults)):
        print(f"{i+1:<6} {Period[i]:<12.4f} {Frequency[i]:<12.4f}")

    return Period, Frequency


def crear_modelo_2():
    """Modelo 2: 2 Columnas + 2 Voladizos"""
    print("\n" + "=" * 70)
    print("MODELO 2: 2 Columnas + 2 Voladizos")
    print("=" * 70)

    H = 3.0
    Ly = 4.0
    voladizo = 1.5

    SapModel.InitializeNewModel()
    ret = SapModel.File.NewBlank()

    kN_m_C = 6
    SapModel.SetPresentUnits(kN_m_C)

    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('CONC', MATERIAL_CONCRETE)
    SapModel.PropMaterial.SetMPIsotropic('CONC', E_MPa * 1000, nu, 0.00001)
    SapModel.PropMaterial.SetWeightAndMass('CONC', 1, rho * 9.81)

    SapModel.PropFrame.SetRectangle('COL30x30', 'CONC', col_h, col_b)
    SapModel.PropFrame.SetRectangle('VIGA25x40', 'CONC', beam_h, beam_b)

    FrameName = ''
    # Columna 1
    [FrameName, ret] = SapModel.FrameObj.AddByCoord(0, 0, 0, 0, 0, H, FrameName, 'COL30x30', '1')
    # Columna 2
    [FrameName, ret] = SapModel.FrameObj.AddByCoord(0, Ly, 0, 0, Ly, H, FrameName, 'COL30x30', '2')
    # Voladizo 1
    [FrameName, ret] = SapModel.FrameObj.AddByCoord(0, 0, H, voladizo, 0, H, FrameName, 'VIGA25x40', '3')
    # Voladizo 2
    [FrameName, ret] = SapModel.FrameObj.AddByCoord(0, Ly, H, voladizo, Ly, H, FrameName, 'VIGA25x40', '4')

    # Apoyos
    SapModel.PointObj.SetRestraint('1', [True, True, True, True, True, True])
    SapModel.PointObj.SetRestraint('2', [True, True, True, True, True, True])

    SapModel.LoadCases.ModalEigen.SetCase('MODAL')
    SapModel.LoadCases.ModalEigen.SetNumberModes('MODAL', 6, 1)

    SapModel.View.RefreshView(0, False)

    ModelPath = os.path.join(os.getcwd(), 'ETABS_Modelo2.edb')
    SapModel.File.Save(ModelPath)
    print(f"[OK] Modelo guardado: {ModelPath}")

    print("Ejecutando analisis...")
    SapModel.Analyze.RunAnalysis()

    NumberResults = 0
    LoadCase = []
    StepType = []
    StepNum = []
    Period = []
    Frequency = []
    CircFreq = []
    EigenValue = []

    [NumberResults, LoadCase, StepType, StepNum, Period, Frequency, CircFreq, EigenValue, ret] = \
        SapModel.Results.ModalPeriod(NumberResults, LoadCase, StepType, StepNum, Period, Frequency, CircFreq, EigenValue)

    print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
    print("-" * 35)
    for i in range(min(6, NumberResults)):
        print(f"{i+1:<6} {Period[i]:<12.4f} {Frequency[i]:<12.4f}")

    return Period, Frequency


def crear_modelo_3():
    """Modelo 3: Portico + Losa + Voladizos"""
    print("\n" + "=" * 70)
    print("MODELO 3: Portico + Losa + Voladizos")
    print("=" * 70)

    H = 3.0
    Lx = 4.0
    Ly = 4.0
    voladizo = 1.5

    SapModel.InitializeNewModel()
    ret = SapModel.File.NewBlank()

    kN_m_C = 6
    SapModel.SetPresentUnits(kN_m_C)

    MATERIAL_CONCRETE = 2
    SapModel.PropMaterial.SetMaterial('CONC', MATERIAL_CONCRETE)
    SapModel.PropMaterial.SetMPIsotropic('CONC', E_MPa * 1000, nu, 0.00001)
    SapModel.PropMaterial.SetWeightAndMass('CONC', 1, rho * 9.81)

    SapModel.PropFrame.SetRectangle('COL30x30', 'CONC', col_h, col_b)

    # Shell section
    SapModel.PropArea.SetSlab('LOSA12', 1, 2, 'CONC', slab_t)  # Shell-Thin

    # Columnas
    FrameName = ''
    col_positions = [
        (0.0, 0.0),
        (Lx, 0.0),
        (0.0, Ly),
        (Lx, Ly)
    ]

    for i, (x, y) in enumerate(col_positions):
        [FrameName, ret] = SapModel.FrameObj.AddByCoord(x, y, 0, x, y, H, FrameName, 'COL30x30', f'C{i+1}')

    # Apoyos
    for i in range(4):
        point_name = f'{i+1}'
        SapModel.PointObj.SetRestraint(point_name, [True, True, True, True, True, True])

    # Losa con voladizos (area total)
    x_min = -voladizo
    x_max = Lx + voladizo
    y_min = -voladizo
    y_max = Ly + voladizo

    # Crear area por coordenadas
    AreaName = ''
    X = [x_min, x_max, x_max, x_min]
    Y = [y_min, y_min, y_max, y_max]
    Z = [H, H, H, H]

    [AreaName, ret] = SapModel.AreaObj.AddByCoord(4, X, Y, Z, AreaName, 'LOSA12')
    print(f"Losa creada: {AreaName}")

    # Auto mesh la losa
    SapModel.AreaObj.SetAutoMesh(AreaName, 1, 4, 4)  # Mesh at points

    SapModel.LoadCases.ModalEigen.SetCase('MODAL')
    SapModel.LoadCases.ModalEigen.SetNumberModes('MODAL', 12, 1)

    SapModel.View.RefreshView(0, False)

    ModelPath = os.path.join(os.getcwd(), 'ETABS_Modelo3.edb')
    SapModel.File.Save(ModelPath)
    print(f"[OK] Modelo guardado: {ModelPath}")

    print("Ejecutando analisis...")
    SapModel.Analyze.RunAnalysis()

    NumberResults = 0
    LoadCase = []
    StepType = []
    StepNum = []
    Period = []
    Frequency = []
    CircFreq = []
    EigenValue = []

    [NumberResults, LoadCase, StepType, StepNum, Period, Frequency, CircFreq, EigenValue, ret] = \
        SapModel.Results.ModalPeriod(NumberResults, LoadCase, StepType, StepNum, Period, Frequency, CircFreq, EigenValue)

    print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
    print("-" * 35)
    for i in range(min(12, NumberResults)):
        print(f"{i+1:<6} {Period[i]:<12.4f} {Frequency[i]:<12.4f}")

    return Period, Frequency


# =============================================================================
# MENU PRINCIPAL
# =============================================================================
if __name__ == "__main__":
    print("\nSeleccione modelo a crear:")
    print("1. Modelo 1: Columna + Voladizo")
    print("2. Modelo 2: 2 Columnas + 2 Voladizos")
    print("3. Modelo 3: Portico + Losa + Voladizos")
    print("4. Todos los modelos")
    print("0. Salir")

    try:
        opcion = input("\nOpcion: ").strip()
    except:
        opcion = "4"  # Por defecto crear todos

    if opcion == "1":
        crear_modelo_1()
    elif opcion == "2":
        crear_modelo_2()
    elif opcion == "3":
        crear_modelo_3()
    elif opcion == "4":
        print("\nCreando todos los modelos...")
        results = {}
        results['modelo1'] = crear_modelo_1()
        results['modelo2'] = crear_modelo_2()
        results['modelo3'] = crear_modelo_3()

        print("\n" + "=" * 70)
        print("RESUMEN DE TODOS LOS MODELOS")
        print("=" * 70)
        for name, (periods, freqs) in results.items():
            print(f"\n{name.upper()}:")
            for i in range(min(3, len(periods))):
                print(f"  Mode {i+1}: T={periods[i]:.4f}s, f={freqs[i]:.3f}Hz")
    else:
        print("Saliendo...")
