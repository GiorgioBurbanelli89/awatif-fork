# -*- coding: utf-8 -*-
"""
Test Quad4 Shell Element - Comparación SAP2000/ETABS vs Awatif-FEM
==================================================================

Este script crea modelos de elementos shell Quad4 en SAP2000 y ETABS,
ejecuta análisis estático y modal, y compara resultados con awatif-fem.

Casos de prueba:
1. Placa cuadrada simplemente apoyada con carga uniforme
2. Placa en voladizo con carga puntual
3. Análisis modal de placa

Referencia teórica:
- Timoshenko: Theory of Plates and Shells
- CSI Analysis Reference Manual
- Wilson: Static and Dynamic Analysis of Structures

Autor: Test generado para validación de awatif-fem Quad4
"""

import os
import sys
import json
import math
from typing import Dict, List, Tuple, Optional

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

USE_SAP2000 = True   # Usar SAP2000
USE_ETABS = False    # Usar ETABS (opcional, requiere licencia)
SAVE_RESULTS = True  # Guardar resultados a JSON
CLOSE_AFTER = False  # Cerrar programa después del test

# Rutas
OUTPUT_DIR = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# ============================================================================
# PARÁMETROS DEL MODELO
# ============================================================================

# Geometría de placa cuadrada
PLATE_WIDTH = 2.0   # m (Lx)
PLATE_HEIGHT = 2.0  # m (Ly)
THICKNESS = 0.2     # m

# Material (Concreto)
E_MODULUS = 25e9    # Pa (25 GPa)
POISSON = 0.2
DENSITY = 2500      # kg/m³

# Carga
UNIFORM_LOAD = 10000  # Pa (10 kN/m²)
POINT_LOAD = 10000    # N (10 kN)

# ============================================================================
# SOLUCIÓN TEÓRICA - PLACA RECTANGULAR SIMPLEMENTE APOYADA
# ============================================================================

def theoretical_simply_supported_plate(a: float, b: float, q: float,
                                       E: float, nu: float, t: float,
                                       num_terms: int = 20) -> Dict:
    """
    Solución de Navier para placa rectangular simplemente apoyada
    con carga uniforme.

    Args:
        a: ancho (Lx)
        b: altura (Ly)
        q: carga uniforme (N/m²)
        E: módulo de elasticidad
        nu: coeficiente de Poisson
        t: espesor
        num_terms: número de términos en serie de Fourier

    Returns:
        dict con desplazamiento central y momentos máximos
    """
    # Rigidez a flexión
    D = E * t**3 / (12 * (1 - nu**2))

    # Desplazamiento en el centro (x=a/2, y=b/2)
    w_center = 0.0
    Mx_center = 0.0
    My_center = 0.0

    for m in range(1, num_terms + 1, 2):  # Solo impares
        for n in range(1, num_terms + 1, 2):  # Solo impares
            alpha_mn = (m * math.pi / a)**2 + (n * math.pi / b)**2

            # Coeficiente de Fourier para carga uniforme
            q_mn = 16 * q / (m * n * math.pi**2)

            # Desplazamiento
            w_mn = q_mn / (D * alpha_mn**2)

            # En el centro: sin(m*pi/2) * sin(n*pi/2)
            sin_m = math.sin(m * math.pi / 2)
            sin_n = math.sin(n * math.pi / 2)

            w_center += w_mn * sin_m * sin_n

            # Momentos
            factor = w_mn * sin_m * sin_n
            Mx_center += -D * factor * ((m * math.pi / a)**2 + nu * (n * math.pi / b)**2)
            My_center += -D * factor * (nu * (m * math.pi / a)**2 + (n * math.pi / b)**2)

    # Para placa cuadrada: w_max ≈ 0.00406 * q * a^4 / D
    # Momento máximo: M_max ≈ 0.0479 * q * a² (en el centro)

    return {
        'w_center': w_center,
        'Mx_center': Mx_center,
        'My_center': My_center,
        'D': D,
        'simplified_w': 0.00406 * q * a**4 / D,
        'simplified_M': 0.0479 * q * a**2
    }


# ============================================================================
# CLASE BASE PARA API CSI
# ============================================================================

class CSI_API_Base:
    """Clase base para manejar API de SAP2000/ETABS"""

    def __init__(self, program: str = 'SAP2000'):
        self.program = program
        self.model = None
        self.app = None
        self.helper = None

    def connect(self) -> bool:
        """Conectar al programa"""
        try:
            import comtypes.client

            if self.program == 'SAP2000':
                self.helper = comtypes.client.CreateObject('SAP2000v1.Helper')
                self.helper = self.helper.QueryInterface(
                    comtypes.gen.SAP2000v1.cHelper
                )
                self.app = self.helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
            else:  # ETABS
                self.helper = comtypes.client.CreateObject('ETABSv1.Helper')
                self.helper = self.helper.QueryInterface(
                    comtypes.gen.ETABSv1.cHelper
                )
                self.app = self.helper.CreateObjectProgID("CSI.ETABS.API.ETABSObject")

            self.app.ApplicationStart()
            self.model = self.app.SapModel

            print(f"[OK] {self.program} conectado")
            return True

        except Exception as e:
            print(f"[ERROR] No se pudo conectar a {self.program}: {e}")
            return False

    def disconnect(self, save: bool = True) -> None:
        """Desconectar del programa"""
        try:
            if save and self.model:
                self.model.File.Save("")
            if self.app:
                self.app.ApplicationExit(False)
            print(f"[OK] {self.program} desconectado")
        except:
            pass

    def init_model(self, units: int = 6) -> bool:
        """
        Inicializar modelo nuevo
        Units: 6 = kN, m, C (SI)
        """
        try:
            self.model.InitializeNewModel(units)
            self.model.File.NewBlank()
            print(f"[OK] Modelo inicializado (unidades={units})")
            return True
        except Exception as e:
            print(f"[ERROR] init_model: {e}")
            return False


# ============================================================================
# TEST 1: PLACA CUADRADA SIMPLEMENTE APOYADA
# ============================================================================

def test_simply_supported_plate_sap2000() -> Dict:
    """
    Test de placa cuadrada 2x2m simplemente apoyada con carga uniforme.
    Compara resultados de SAP2000 con solución teórica de Navier.
    """
    print("\n" + "="*70)
    print("TEST 1: PLACA SIMPLEMENTE APOYADA - SAP2000")
    print("="*70)

    results = {
        'test_name': 'simply_supported_plate',
        'program': 'SAP2000',
        'status': 'FAILED',
        'theoretical': {},
        'sap2000': {},
        'error_percent': {}
    }

    try:
        import comtypes.client

        # Conectar a SAP2000
        print("\n[1] Conectando a SAP2000...")
        helper = comtypes.client.CreateObject('SAP2000v1.Helper')
        helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
        sap = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
        sap.ApplicationStart()
        model = sap.SapModel
        print("    [OK]")

        # Inicializar modelo (kN, m)
        print("\n[2] Inicializando modelo...")
        model.InitializeNewModel(6)  # kN, m, C
        model.File.NewBlank()
        print("    [OK]")

        # Material
        print("\n[3] Definiendo material...")
        model.PropMaterial.SetMaterial('CONC', 2)  # 2 = Concrete
        E_kPa = E_MODULUS / 1000  # Pa a kPa
        model.PropMaterial.SetMPIsotropic('CONC', E_kPa, POISSON, 0.00001)
        model.PropMaterial.SetWeightAndMass('CONC', 1, DENSITY * 9.81 / 1000)  # kN/m³
        print(f"    [OK] E={E_kPa/1e6:.0f} GPa, nu={POISSON}")

        # Propiedad de shell - Plate-Thick (tipo 4)
        print("\n[4] Definiendo propiedad shell...")
        # SetShell_1(Name, ShellType, MatProp, Thickness, ...)
        # ShellType: 4 = Plate-Thick (Mindlin/Reissner)
        ret = model.PropArea.SetShell_1('PLACA', 4, False, 'CONC', 0,
                                         THICKNESS, THICKNESS, -1, "", "")
        print(f"    [OK] PLACA t={THICKNESS}m (Plate-Thick)")

        # Crear puntos para Quad4 (4 esquinas)
        print("\n[5] Creando geometría Quad4...")
        # Puntos en sentido antihorario
        pts = [
            (0, 0, 0),
            (PLATE_WIDTH, 0, 0),
            (PLATE_WIDTH, PLATE_HEIGHT, 0),
            (0, PLATE_HEIGHT, 0)
        ]

        for i, (x, y, z) in enumerate(pts):
            model.PointObj.AddCartesian(x, y, z, f"P{i+1}")

        # Crear área (Quad4)
        x_coords = [p[0] for p in pts]
        y_coords = [p[1] for p in pts]
        z_coords = [p[2] for p in pts]

        ret = model.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords,
                                        "SHELL1", "PLACA", "SHELL1")
        print(f"    [OK] Quad4 {PLATE_WIDTH}x{PLATE_HEIGHT}m")

        # Apoyos simples (solo UZ restringido en las 4 esquinas)
        print("\n[6] Aplicando apoyos simples...")
        restraint = [False, False, True, False, False, False]  # Solo UZ
        for i in range(1, 5):
            model.PointObj.SetRestraint(f"P{i}", restraint)
        print("    [OK] 4 esquinas con U3 fijo")

        # Patrón de carga
        print("\n[7] Creando patrón de carga...")
        model.LoadPatterns.Add('CARGA', 8, 0, True)  # 8 = Other
        print("    [OK]")

        # Carga uniforme
        print("\n[8] Aplicando carga uniforme...")
        q_kN_m2 = UNIFORM_LOAD / 1000  # Pa a kN/m²
        # Dir=6 significa dirección de gravedad (hacia -Z)
        ret = model.AreaObj.SetLoadUniform("SHELL1", 'CARGA', q_kN_m2, 6, True)
        print(f"    [OK] q={q_kN_m2} kN/m²")

        # Guardar
        model_path = os.path.join(OUTPUT_DIR, 'test_quad4_simply_supported.sdb')
        print(f"\n[9] Guardando modelo...")
        model.File.Save(model_path)
        print(f"    [OK] {model_path}")

        # Crear y ejecutar análisis
        print("\n[10] Ejecutando análisis...")
        model.Analyze.CreateAnalysisModel()
        ret = model.Analyze.RunAnalysis()
        print(f"    [OK] ret={ret}")

        # Configurar output
        print("\n[11] Extrayendo resultados...")
        model.Results.Setup.DeselectAllCasesAndCombosForOutput()
        model.Results.Setup.SetCaseSelectedForOutput("CARGA")

        # Obtener desplazamientos
        # Necesitamos el nodo central - para Quad4 sin subdivisión, usamos promedio
        NumberResults = 0
        Obj = []; Elm = []; LoadCase = []; StepType = []; StepNum = []
        U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []

        [NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
         U1, U2, U3, R1, R2, R3, ret] = model.Results.JointDispl(
            "", 0, NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
            U1, U2, U3, R1, R2, R3)

        print(f"    Nodos: {NumberResults}")

        if NumberResults > 0:
            # El desplazamiento máximo (en valor absoluto)
            max_U3 = max(abs(u) for u in U3)
            avg_U3 = sum(U3) / len(U3)

            print(f"    U3 max = {max_U3*1000:.4f} mm")
            print(f"    U3 avg = {avg_U3*1000:.4f} mm")

            results['sap2000']['w_max'] = max_U3
            results['sap2000']['w_avg'] = avg_U3

        # Obtener fuerzas/momentos en shell
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
            "SHELL1", 0, NumberResults, Obj, Elm, PointElm, LoadCase,
            StepType, StepNum,
            F11, F22, F12, FMax, FMin, FAngle, FVM,
            M11, M22, M12, MMax, MMin, MAngle,
            V13, V23, VMax, VAngle)

        if NumberResults > 0:
            max_M11 = max(abs(m) for m in M11) if M11 else 0
            max_M22 = max(abs(m) for m in M22) if M22 else 0
            max_V13 = max(abs(v) for v in V13) if V13 else 0

            print(f"    M11 max = {max_M11:.4f} kN-m/m")
            print(f"    M22 max = {max_M22:.4f} kN-m/m")
            print(f"    V13 max = {max_V13:.4f} kN/m")

            results['sap2000']['M11_max'] = max_M11
            results['sap2000']['M22_max'] = max_M22
            results['sap2000']['V13_max'] = max_V13

        # Solución teórica
        print("\n[12] Comparando con solución teórica...")
        theoretical = theoretical_simply_supported_plate(
            PLATE_WIDTH, PLATE_HEIGHT,
            UNIFORM_LOAD, E_MODULUS, POISSON, THICKNESS
        )

        results['theoretical'] = {
            'w_center': theoretical['w_center'],
            'w_simplified': theoretical['simplified_w'],
            'M_simplified': theoretical['simplified_M'] / 1000  # N-m a kN-m
        }

        print(f"\n    TEÓRICO (Navier):")
        print(f"      w_center = {theoretical['w_center']*1000:.4f} mm")
        print(f"      M_center ≈ {theoretical['simplified_M']/1000:.4f} kN-m/m")

        # Calcular errores
        if results['sap2000'].get('w_max'):
            error_w = abs(results['sap2000']['w_max'] - theoretical['w_center']) / abs(theoretical['w_center']) * 100
            results['error_percent']['w'] = error_w
            print(f"\n    ERROR en desplazamiento: {error_w:.2f}%")

            if error_w < 10:  # Menos del 10% de error
                results['status'] = 'PASSED'
                print("    [PASSED] Error < 10%")
            else:
                print("    [FAILED] Error >= 10%")

        # Cerrar o dejar abierto
        if CLOSE_AFTER:
            print("\n[13] Cerrando SAP2000...")
            sap.ApplicationExit(False)
        else:
            print("\n[13] SAP2000 dejado abierto para revisión")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        results['error'] = str(e)

    return results


# ============================================================================
# TEST 2: PLACA EN VOLADIZO (CANTILEVER)
# ============================================================================

def test_cantilever_plate_sap2000() -> Dict:
    """
    Test de placa en voladizo con carga puntual en el extremo.
    """
    print("\n" + "="*70)
    print("TEST 2: PLACA EN VOLADIZO - SAP2000")
    print("="*70)

    results = {
        'test_name': 'cantilever_plate',
        'program': 'SAP2000',
        'status': 'FAILED',
        'theoretical': {},
        'sap2000': {},
        'error_percent': {}
    }

    try:
        import comtypes.client

        # Conectar
        print("\n[1] Conectando a SAP2000...")
        helper = comtypes.client.CreateObject('SAP2000v1.Helper')
        helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
        sap = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
        sap.ApplicationStart()
        model = sap.SapModel
        print("    [OK]")

        # Inicializar
        model.InitializeNewModel(6)  # kN, m
        model.File.NewBlank()

        # Material
        model.PropMaterial.SetMaterial('CONC', 2)
        E_kPa = E_MODULUS / 1000
        model.PropMaterial.SetMPIsotropic('CONC', E_kPa, POISSON, 0.00001)

        # Shell - Plate-Thick
        model.PropArea.SetShell_1('PLACA', 4, False, 'CONC', 0,
                                   THICKNESS, THICKNESS, -1, "", "")

        # Geometría - Quad4 en voladizo
        # Borde empotrado en x=0
        L = PLATE_WIDTH  # Longitud del voladizo
        W = PLATE_HEIGHT  # Ancho

        pts = [
            (0, 0, 0),      # P1 - empotrado
            (L, 0, 0),      # P2 - libre
            (L, W, 0),      # P3 - libre
            (0, W, 0)       # P4 - empotrado
        ]

        for i, (x, y, z) in enumerate(pts):
            model.PointObj.AddCartesian(x, y, z, f"P{i+1}")

        x_coords = [p[0] for p in pts]
        y_coords = [p[1] for p in pts]
        z_coords = [p[2] for p in pts]

        model.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords,
                                  "SHELL1", "PLACA", "SHELL1")

        print(f"    [OK] Voladizo {L}x{W}m")

        # Empotramiento en x=0 (P1 y P4)
        restraint_fixed = [True, True, True, True, True, True]
        model.PointObj.SetRestraint("P1", restraint_fixed)
        model.PointObj.SetRestraint("P4", restraint_fixed)
        print("    [OK] Borde x=0 empotrado")

        # Carga puntual en el centro del borde libre
        model.LoadPatterns.Add('CARGA', 8, 0, True)

        # Crear punto en el centro del borde libre
        model.PointObj.AddCartesian(L, W/2, 0, "P_CARGA")

        P_kN = POINT_LOAD / 1000  # N a kN
        model.PointObj.SetLoadForce("P_CARGA", 'CARGA',
                                     [0, 0, -P_kN, 0, 0, 0], False, "", 0)
        print(f"    [OK] Carga {P_kN} kN en extremo")

        # Guardar y analizar
        model_path = os.path.join(OUTPUT_DIR, 'test_quad4_cantilever.sdb')
        model.File.Save(model_path)
        model.Analyze.CreateAnalysisModel()
        model.Analyze.RunAnalysis()
        print("    [OK] Análisis ejecutado")

        # Resultados
        model.Results.Setup.DeselectAllCasesAndCombosForOutput()
        model.Results.Setup.SetCaseSelectedForOutput("CARGA")

        # Desplazamiento en el punto de carga
        NumberResults = 0
        Obj = []; Elm = []; LoadCase = []; StepType = []; StepNum = []
        U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []

        [NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
         U1, U2, U3, R1, R2, R3, ret] = model.Results.JointDispl(
            "P_CARGA", 0, NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
            U1, U2, U3, R1, R2, R3)

        if NumberResults > 0:
            w_tip = abs(U3[0])
            print(f"\n    U3 en extremo = {w_tip*1000:.4f} mm")
            results['sap2000']['w_tip'] = w_tip

            # Teórico: viga en voladizo con carga puntual
            # w = PL³/(3EI), I = bt³/12
            I = W * THICKNESS**3 / 12
            w_theory = P_kN * 1000 * L**3 / (3 * E_MODULUS * I)
            results['theoretical']['w_tip'] = w_theory

            print(f"    Teórico (viga): w = {w_theory*1000:.4f} mm")

            error = abs(w_tip - w_theory) / w_theory * 100
            results['error_percent']['w'] = error
            print(f"    Error: {error:.2f}%")

            if error < 20:  # Placa vs viga tiene diferencias
                results['status'] = 'PASSED'

        if CLOSE_AFTER:
            sap.ApplicationExit(False)

    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        results['error'] = str(e)

    return results


# ============================================================================
# TEST 3: ANÁLISIS MODAL
# ============================================================================

def test_modal_analysis_sap2000() -> Dict:
    """
    Test de análisis modal de placa cuadrada simplemente apoyada.
    Compara frecuencias naturales con solución teórica.
    """
    print("\n" + "="*70)
    print("TEST 3: ANÁLISIS MODAL - SAP2000")
    print("="*70)

    results = {
        'test_name': 'modal_analysis',
        'program': 'SAP2000',
        'status': 'FAILED',
        'theoretical': {},
        'sap2000': {},
        'error_percent': {}
    }

    try:
        import comtypes.client

        # Conectar
        print("\n[1] Conectando a SAP2000...")
        helper = comtypes.client.CreateObject('SAP2000v1.Helper')
        helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
        sap = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
        sap.ApplicationStart()
        model = sap.SapModel
        print("    [OK]")

        # Inicializar
        model.InitializeNewModel(6)  # kN, m
        model.File.NewBlank()

        # Material con masa
        model.PropMaterial.SetMaterial('CONC', 2)
        E_kPa = E_MODULUS / 1000
        model.PropMaterial.SetMPIsotropic('CONC', E_kPa, POISSON, 0.00001)
        # Peso y masa: kN/m³ y kg/m³
        model.PropMaterial.SetWeightAndMass('CONC', 1, DENSITY * 9.81 / 1000)
        print(f"    [OK] Material con densidad {DENSITY} kg/m³")

        # Shell - Plate-Thick
        model.PropArea.SetShell_1('PLACA', 4, False, 'CONC', 0,
                                   THICKNESS, THICKNESS, -1, "", "")

        # Subdividir para mejor precisión modal (4x4 mesh)
        nx, ny = 4, 4
        dx = PLATE_WIDTH / nx
        dy = PLATE_HEIGHT / ny

        print(f"\n[2] Creando mesh {nx}x{ny}...")

        # Crear puntos
        point_names = {}
        for j in range(ny + 1):
            for i in range(nx + 1):
                x = i * dx
                y = j * dy
                name = f"P_{i}_{j}"
                model.PointObj.AddCartesian(x, y, 0, name)
                point_names[(i, j)] = name

        # Crear áreas (Quad4)
        area_count = 0
        for j in range(ny):
            for i in range(nx):
                x_coords = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
                y_coords = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
                z_coords = [0, 0, 0, 0]

                area_name = f"A_{i}_{j}"
                model.AreaObj.AddByCoord(4, x_coords, y_coords, z_coords,
                                          area_name, "PLACA", area_name)
                area_count += 1

        print(f"    [OK] {area_count} elementos Quad4")

        # Apoyos simples en bordes
        restraint = [False, False, True, False, False, False]
        support_count = 0

        for j in range(ny + 1):
            for i in range(nx + 1):
                # Bordes: i=0, i=nx, j=0, j=ny
                if i == 0 or i == nx or j == 0 or j == ny:
                    model.PointObj.SetRestraint(point_names[(i, j)], restraint)
                    support_count += 1

        print(f"    [OK] {support_count} apoyos simples")

        # Configurar análisis modal
        print("\n[3] Configurando análisis modal...")

        # Añadir caso de carga modal
        model.LoadCases.ModalEigen.SetCase("MODAL")
        model.LoadCases.ModalEigen.SetNumberModes("MODAL", 10, 1)
        print("    [OK] 10 modos")

        # Guardar y analizar
        model_path = os.path.join(OUTPUT_DIR, 'test_quad4_modal.sdb')
        model.File.Save(model_path)
        model.Analyze.CreateAnalysisModel()
        model.Analyze.RunAnalysis()
        print("    [OK] Análisis ejecutado")

        # Extraer frecuencias
        print("\n[4] Extrayendo frecuencias...")

        NumberResults = 0
        LoadCase = []; StepType = []; StepNum = []
        Period = []; Frequency = []; CircFreq = []; EigenValue = []

        [NumberResults, LoadCase, StepType, StepNum, Period, Frequency,
         CircFreq, EigenValue, ret] = model.Results.ModalPeriod(
            NumberResults, LoadCase, StepType, StepNum,
            Period, Frequency, CircFreq, EigenValue)

        if NumberResults > 0:
            print(f"\n    {NumberResults} modos encontrados:")
            for i in range(min(NumberResults, 5)):
                print(f"      Modo {i+1}: f = {Frequency[i]:.4f} Hz, T = {Period[i]:.4f} s")

            results['sap2000']['frequencies'] = list(Frequency[:10])
            results['sap2000']['periods'] = list(Period[:10])

        # Frecuencia teórica para placa simplemente apoyada
        # f_mn = (π/2) * sqrt(D/(ρh)) * [(m/a)² + (n/b)²]
        D = E_MODULUS * THICKNESS**3 / (12 * (1 - POISSON**2))
        rho_area = DENSITY * THICKNESS  # masa por unidad de área

        f11_theory = (math.pi / 2) * math.sqrt(D / rho_area) * \
                     ((1/PLATE_WIDTH)**2 + (1/PLATE_HEIGHT)**2)

        results['theoretical']['f11'] = f11_theory
        print(f"\n    Teórico (modo 1,1): f = {f11_theory:.4f} Hz")

        if results['sap2000'].get('frequencies'):
            error = abs(results['sap2000']['frequencies'][0] - f11_theory) / f11_theory * 100
            results['error_percent']['f11'] = error
            print(f"    Error modo 1: {error:.2f}%")

            if error < 15:
                results['status'] = 'PASSED'

        if CLOSE_AFTER:
            sap.ApplicationExit(False)

    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        results['error'] = str(e)

    return results


# ============================================================================
# COMPARACIÓN CON AWATIF-FEM
# ============================================================================

def create_awatif_model() -> Dict:
    """
    Crea el modelo equivalente en formato awatif-fem para comparación.
    Retorna los datos en formato JSON para usar con awatif-fem.
    """
    print("\n" + "="*70)
    print("MODELO AWATIF-FEM (JSON)")
    print("="*70)

    # Nodos para placa 2x2 con mesh 4x4
    nx, ny = 4, 4
    dx = PLATE_WIDTH / nx
    dy = PLATE_HEIGHT / ny

    nodes = []
    for j in range(ny + 1):
        for i in range(nx + 1):
            nodes.append([i * dx, j * dy, 0.0])

    # Elementos Quad4
    elements = []
    for j in range(ny):
        for i in range(nx):
            n1 = j * (nx + 1) + i
            n2 = n1 + 1
            n3 = n2 + (nx + 1)
            n4 = n1 + (nx + 1)
            elements.append([n1, n2, n3, n4])

    # Apoyos (bordes)
    supports = {}
    for j in range(ny + 1):
        for i in range(nx + 1):
            if i == 0 or i == nx or j == 0 or j == ny:
                node_idx = j * (nx + 1) + i
                supports[node_idx] = [False, False, True, False, False, False]

    # Propiedades de elemento
    element_props = {
        'elasticities': {str(i): E_MODULUS for i in range(len(elements))},
        'poissonsRatios': {str(i): POISSON for i in range(len(elements))},
        'thicknesses': {str(i): THICKNESS for i in range(len(elements))},
        'densities': {str(i): DENSITY for i in range(len(elements))}
    }

    model = {
        'nodes': nodes,
        'elements': elements,
        'supports': supports,
        'elementProperties': element_props,
        'loads': {
            'uniform': {
                'all': UNIFORM_LOAD  # Pa
            }
        }
    }

    # Guardar a JSON
    json_path = os.path.join(OUTPUT_DIR, 'awatif_quad4_model.json')
    with open(json_path, 'w') as f:
        json.dump(model, f, indent=2)

    print(f"    [OK] Modelo guardado: {json_path}")
    print(f"    Nodos: {len(nodes)}")
    print(f"    Elementos Quad4: {len(elements)}")

    return model


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Ejecutar todos los tests"""
    print("\n" + "="*70)
    print("TESTS DE VALIDACIÓN QUAD4 - SAP2000/ETABS vs AWATIF-FEM")
    print("="*70)
    print(f"\nParámetros:")
    print(f"  Placa: {PLATE_WIDTH}x{PLATE_HEIGHT}x{THICKNESS} m")
    print(f"  Material: E={E_MODULUS/1e9:.0f} GPa, nu={POISSON}")
    print(f"  Densidad: {DENSITY} kg/m³")
    print(f"  Carga uniforme: {UNIFORM_LOAD/1000:.1f} kN/m²")

    all_results = []

    # Test 1: Placa simplemente apoyada
    if USE_SAP2000:
        result1 = test_simply_supported_plate_sap2000()
        all_results.append(result1)

    # Test 2: Voladizo
    if USE_SAP2000:
        result2 = test_cantilever_plate_sap2000()
        all_results.append(result2)

    # Test 3: Modal
    if USE_SAP2000:
        result3 = test_modal_analysis_sap2000()
        all_results.append(result3)

    # Crear modelo awatif
    awatif_model = create_awatif_model()

    # Resumen
    print("\n" + "="*70)
    print("RESUMEN DE TESTS")
    print("="*70)

    passed = 0
    failed = 0

    for result in all_results:
        status = result.get('status', 'UNKNOWN')
        name = result.get('test_name', 'unnamed')

        if status == 'PASSED':
            passed += 1
            icon = "✓"
        else:
            failed += 1
            icon = "✗"

        print(f"  {icon} {name}: {status}")

    print(f"\nTotal: {passed} PASSED, {failed} FAILED")

    # Guardar resultados
    if SAVE_RESULTS:
        results_path = os.path.join(OUTPUT_DIR, 'test_results.json')
        with open(results_path, 'w') as f:
            json.dump(all_results, f, indent=2, default=str)
        print(f"\nResultados guardados: {results_path}")

    return all_results


if __name__ == '__main__':
    main()
