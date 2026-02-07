# -*- coding: utf-8 -*-
"""
COMPARACIÓN COMPLETA: Awatif-FEM vs SAP2000 vs ETABS vs OpenSees
================================================================

Este script compara resultados del elemento Quad4 shell entre:
1. SAP2000 (CSI - Comercial)
2. ETABS (CSI - Comercial)
3. OpenSeesPy (Open Source)
4. Solución Teórica (Navier/Timoshenko)
5. Awatif-FEM (A validar)

Caso de prueba: Placa cuadrada simplemente apoyada con carga uniforme

Basado en:
- CSI Analysis Reference Manual (Chapter X - The Shell Element)
- Edward Wilson - Static and Dynamic Analysis of Structures
- OpenSees ShellMITC4 documentation

Autor: Tests de validación para awatif-fem
"""

import os
import sys
import json
import math
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

@dataclass
class TestConfig:
    """Configuración del test"""
    # Geometría
    Lx: float = 2.0         # m (ancho)
    Ly: float = 2.0         # m (altura)
    t: float = 0.2          # m (espesor)

    # Material (Concreto)
    E: float = 25e9         # Pa (25 GPa)
    nu: float = 0.2         # Poisson
    rho: float = 2500       # kg/m³

    # Carga
    q: float = 10000        # Pa (10 kN/m²)

    # Mesh
    nx: int = 4             # divisiones en X
    ny: int = 4             # divisiones en Y

    # Output
    output_dir: str = r'C:\Users\j-b-j\Documents\Calcpad-7.5.7\awatif-2.0.0\tests\results'

CONFIG = TestConfig()

# ============================================================================
# SOLUCIÓN TEÓRICA
# ============================================================================

def solucion_teorica(cfg: TestConfig) -> Dict:
    """
    Solución teórica para placa simplemente apoyada con carga uniforme.

    Referencias:
    - Timoshenko: Theory of Plates and Shells
    - Navier solution for rectangular plates
    """
    a = cfg.Lx
    b = cfg.Ly
    q = cfg.q
    E = cfg.E
    nu = cfg.nu
    t = cfg.t
    rho = cfg.rho

    # Rigidez a flexión
    D = E * t**3 / (12 * (1 - nu**2))

    # Desplazamiento máximo (centro) - Serie de Navier
    # w = sum_m sum_n (q_mn / (D * alpha_mn^2)) * sin(m*pi*x/a) * sin(n*pi*y/b)

    w_center = 0.0
    Mx_center = 0.0
    My_center = 0.0

    # Usar 50 términos para buena convergencia
    for m in range(1, 51, 2):  # Solo impares
        for n in range(1, 51, 2):
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
            Mx_center += -D * factor * ((m*math.pi/a)**2 + nu*(n*math.pi/b)**2)
            My_center += -D * factor * (nu*(m*math.pi/a)**2 + (n*math.pi/b)**2)

    # Fórmulas simplificadas (para placa cuadrada)
    w_simplified = 0.00406 * q * a**4 / D
    M_simplified = 0.0479 * q * a**2

    # Frecuencia fundamental (modo 1,1)
    rho_area = rho * t  # masa por unidad de área
    f11 = (math.pi / 2) * math.sqrt(D / rho_area) * ((1/a)**2 + (1/b)**2)

    return {
        'nombre': 'TEÓRICO (Navier)',
        'D': D,
        'w_center': w_center,
        'w_simplified': w_simplified,
        'Mx_center': Mx_center,
        'My_center': My_center,
        'M_simplified': M_simplified,
        'f11': f11,
        'T11': 1/f11 if f11 > 0 else 0
    }


# ============================================================================
# SAP2000
# ============================================================================

def ejecutar_sap2000(cfg: TestConfig) -> Dict:
    """Ejecutar análisis en SAP2000 y extraer resultados"""

    print("\n" + "="*60)
    print("SAP2000")
    print("="*60)

    results = {
        'nombre': 'SAP2000',
        'status': 'NO_EJECUTADO',
        'w_max': None,
        'M11_max': None,
        'M22_max': None,
        'f11': None
    }

    try:
        import comtypes.client

        print("  Conectando...")
        helper = comtypes.client.CreateObject('SAP2000v1.Helper')
        helper = helper.QueryInterface(comtypes.gen.SAP2000v1.cHelper)
        sap = helper.CreateObjectProgID("CSI.SAP2000.API.SapObject")
        sap.ApplicationStart()
        model = sap.SapModel
        print("  [OK] Conectado")

        # Inicializar
        model.InitializeNewModel(6)  # kN, m
        model.File.NewBlank()

        # Material
        E_kPa = cfg.E / 1000
        model.PropMaterial.SetMaterial('MAT1', 2)
        model.PropMaterial.SetMPIsotropic('MAT1', E_kPa, cfg.nu, 0.00001)
        model.PropMaterial.SetWeightAndMass('MAT1', 1, cfg.rho * 9.81 / 1000)

        # Shell (Plate-Thick = tipo 4)
        model.PropArea.SetShell_1('SHELL1', 4, False, 'MAT1', 0, cfg.t, cfg.t, -1, "", "")

        # Crear mesh
        dx = cfg.Lx / cfg.nx
        dy = cfg.Ly / cfg.ny

        point_map = {}
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                name = f"P_{i}_{j}"
                model.PointObj.AddCartesian(i*dx, j*dy, 0, name)
                point_map[(i, j)] = name

        for j in range(cfg.ny):
            for i in range(cfg.nx):
                x_c = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
                y_c = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
                z_c = [0, 0, 0, 0]
                model.AreaObj.AddByCoord(4, x_c, y_c, z_c, f"A_{i}_{j}", "SHELL1", f"A_{i}_{j}")

        print(f"  Mesh: {cfg.nx}x{cfg.ny} = {cfg.nx*cfg.ny} elementos")

        # Apoyos simples en bordes
        restraint = [False, False, True, False, False, False]
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                if i == 0 or i == cfg.nx or j == 0 or j == cfg.ny:
                    model.PointObj.SetRestraint(point_map[(i, j)], restraint)

        # Carga
        model.LoadPatterns.Add('CARGA', 8, 0, True)
        q_kN = cfg.q / 1000
        for j in range(cfg.ny):
            for i in range(cfg.nx):
                model.AreaObj.SetLoadUniform(f"A_{i}_{j}", 'CARGA', q_kN, 6, True)

        # Modal
        try:
            model.LoadCases.ModalEigen.SetCase("MODAL")
            model.LoadCases.ModalEigen.SetNumberModes("MODAL", 10, 1)
        except:
            pass

        # Guardar y analizar
        model_path = os.path.join(cfg.output_dir, 'comparacion_sap2000.sdb')
        model.File.Save(model_path)
        model.Analyze.CreateAnalysisModel()
        model.Analyze.RunAnalysis()
        print("  [OK] Análisis ejecutado")

        # Resultados estáticos
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

        if NumberResults > 0 and U3:
            results['w_max'] = max(abs(u) for u in U3 if u is not None)

            # Buscar nodo central
            centro = f"P_{cfg.nx//2}_{cfg.ny//2}"
            for i, name in enumerate(Obj):
                if name == centro and U3[i] is not None:
                    results['w_center'] = abs(U3[i])
                    break

        # Momentos
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
            "", 0, NumberResults, Obj, Elm, PointElm, LoadCase,
            StepType, StepNum,
            F11, F22, F12, FMax, FMin, FAngle, FVM,
            M11, M22, M12, MMax, MMin, MAngle,
            V13, V23, VMax, VAngle)

        if NumberResults > 0 and M11:
            results['M11_max'] = max(abs(m) for m in M11)
            results['M22_max'] = max(abs(m) for m in M22)

        # Modal
        try:
            NumberResults = 0
            LoadCase = []; StepType = []; StepNum = []
            Period = []; Frequency = []; CircFreq = []; EigenValue = []

            [NumberResults, LoadCase, StepType, StepNum, Period, Frequency,
             CircFreq, EigenValue, ret] = model.Results.ModalPeriod(
                NumberResults, LoadCase, StepType, StepNum,
                Period, Frequency, CircFreq, EigenValue)

            if NumberResults > 0:
                results['f11'] = Frequency[0]
                results['T11'] = Period[0]
                results['frequencies'] = list(Frequency[:5])
        except:
            pass

        results['status'] = 'OK'
        if results.get('w_max'):
            print(f"  w_max = {results['w_max']*1000:.4f} mm")
        if results.get('M11_max'):
            print(f"  M11_max = {results['M11_max']:.4f} kN-m/m")
        if results.get('f11'):
            print(f"  f1 = {results['f11']:.4f} Hz")

    except Exception as e:
        print(f"  [ERROR] {e}")
        import traceback
        traceback.print_exc()
        results['error'] = str(e)
        results['status'] = 'ERROR'

    return results


# ============================================================================
# ETABS
# ============================================================================

def ejecutar_etabs(cfg: TestConfig) -> Dict:
    """Ejecutar análisis en ETABS y extraer resultados"""

    print("\n" + "="*60)
    print("ETABS")
    print("="*60)

    results = {
        'nombre': 'ETABS',
        'status': 'NO_EJECUTADO',
        'w_max': None,
        'M11_max': None,
        'f11': None
    }

    try:
        import comtypes.client

        print("  Conectando...")
        helper = comtypes.client.CreateObject('ETABSv1.Helper')
        helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)
        etabs = helper.CreateObjectProgID("CSI.ETABS.API.ETABSObject")
        etabs.ApplicationStart()
        model = etabs.SapModel
        print("  [OK] Conectado")

        # Similar a SAP2000...
        model.InitializeNewModel(6)
        model.File.NewBlank()

        E_kPa = cfg.E / 1000
        model.PropMaterial.SetMaterial('MAT1', 2)
        model.PropMaterial.SetMPIsotropic('MAT1', E_kPa, cfg.nu, 0.00001)
        model.PropMaterial.SetWeightAndMass('MAT1', 1, cfg.rho * 9.81 / 1000)

        # Crear propiedad shell - intentar diferentes métodos
        try:
            model.PropArea.SetShell_1('SHELL1', 4, False, 'MAT1', 0, cfg.t, cfg.t, -1, "", "")
        except:
            try:
                model.PropArea.SetShell('SHELL1', 4, 'MAT1', 0, cfg.t, cfg.t)
            except Exception as e2:
                print(f"  [WARN] No se pudo crear shell: {e2}")

        # Crear mesh (igual que SAP2000)
        dx = cfg.Lx / cfg.nx
        dy = cfg.Ly / cfg.ny

        point_map = {}
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                name = f"P_{i}_{j}"
                model.PointObj.AddCartesian(i*dx, j*dy, 0, name)
                point_map[(i, j)] = name

        for j in range(cfg.ny):
            for i in range(cfg.nx):
                x_c = [i*dx, (i+1)*dx, (i+1)*dx, i*dx]
                y_c = [j*dy, j*dy, (j+1)*dy, (j+1)*dy]
                z_c = [0, 0, 0, 0]
                model.AreaObj.AddByCoord(4, x_c, y_c, z_c, f"A_{i}_{j}", "SHELL1", f"A_{i}_{j}")

        print(f"  Mesh: {cfg.nx}x{cfg.ny}")

        # Apoyos
        restraint = [False, False, True, False, False, False]
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                if i == 0 or i == cfg.nx or j == 0 or j == cfg.ny:
                    model.PointObj.SetRestraint(point_map[(i, j)], restraint)

        # Carga
        model.LoadPatterns.Add('CARGA', 8, 0, True)
        q_kN = cfg.q / 1000
        for j in range(cfg.ny):
            for i in range(cfg.nx):
                model.AreaObj.SetLoadUniform(f"A_{i}_{j}", 'CARGA', q_kN, 6, True)

        # Modal
        try:
            model.LoadCases.ModalEigen.SetCase("MODAL")
            model.LoadCases.ModalEigen.SetNumberModes("MODAL", 10, 1)
        except:
            pass

        # Guardar y analizar
        model_path = os.path.join(cfg.output_dir, 'comparacion_etabs.edb')
        model.File.Save(model_path)
        model.Analyze.RunAnalysis()
        print("  [OK] Análisis ejecutado")

        # Resultados
        model.Results.Setup.DeselectAllCasesAndCombosForOutput()
        model.Results.Setup.SetCaseSelectedForOutput("CARGA")

        NumberResults = 0
        Obj = []; Elm = []; LoadCase = []; StepType = []; StepNum = []
        U1 = []; U2 = []; U3 = []; R1 = []; R2 = []; R3 = []

        [NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
         U1, U2, U3, R1, R2, R3, ret] = model.Results.JointDispl(
            "", 0, NumberResults, Obj, Elm, LoadCase, StepType, StepNum,
            U1, U2, U3, R1, R2, R3)

        if NumberResults > 0:
            results['w_max'] = max(abs(u) for u in U3)

        # Modal
        try:
            NumberResults = 0
            LoadCase = []; StepType = []; StepNum = []
            Period = []; Frequency = []; CircFreq = []; EigenValue = []

            [NumberResults, LoadCase, StepType, StepNum, Period, Frequency,
             CircFreq, EigenValue, ret] = model.Results.ModalPeriod(
                NumberResults, LoadCase, StepType, StepNum,
                Period, Frequency, CircFreq, EigenValue)

            if NumberResults > 0:
                results['f11'] = Frequency[0]
                results['T11'] = Period[0]
        except:
            pass

        results['status'] = 'OK'
        print(f"  w_max = {results['w_max']*1000:.4f} mm")
        if results['f11']:
            print(f"  f1 = {results['f11']:.4f} Hz")

    except Exception as e:
        print(f"  [ERROR] {e}")
        results['error'] = str(e)
        results['status'] = 'ERROR'

    return results


# ============================================================================
# OPENSEES
# ============================================================================

def ejecutar_opensees(cfg: TestConfig) -> Dict:
    """
    Ejecutar análisis en OpenSeesPy.

    Usa elemento ShellMITC4:
    - MITC = Mixed Interpolation of Tensorial Components
    - Formulación Mindlin/Reissner (incluye cortante)
    - Igual que SAP2000/ETABS Plate-Thick
    """

    print("\n" + "="*60)
    print("OPENSEES (ShellMITC4)")
    print("="*60)

    results = {
        'nombre': 'OpenSees',
        'status': 'NO_EJECUTADO',
        'w_max': None,
        'f11': None
    }

    try:
        import openseespy.opensees as ops

        print("  Inicializando modelo...")
        ops.wipe()
        ops.model('basic', '-ndm', 3, '-ndf', 6)

        # Crear nodos
        dx = cfg.Lx / cfg.nx
        dy = cfg.Ly / cfg.ny

        node_map = {}
        node_id = 1
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                x = i * dx
                y = j * dy
                z = 0.0
                ops.node(node_id, x, y, z)
                node_map[(i, j)] = node_id
                node_id += 1

        print(f"  Nodos: {node_id - 1}")

        # Restricciones (bordes) - Simplemente apoyada
        # Para evitar modos rígidos, necesitamos restringir también algunos DOFs en plano
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                nid = node_map[(i, j)]
                if i == 0 or i == cfg.nx or j == 0 or j == cfg.ny:
                    # Bordes: fijar U3 (apoyo simple)
                    # También fijar rotaciones para estabilidad numérica
                    ops.fix(nid, 0, 0, 1, 1, 1, 0)

        # Fijar esquina (0,0) completamente para evitar modos rígidos
        ops.fix(node_map[(0, 0)], 1, 1, 1, 1, 1, 1)
        # Fijar UY en esquina (nx, 0) para evitar rotación rígida
        ops.fix(node_map[(cfg.nx, 0)], 0, 1, 1, 1, 1, 0)

        # Material - ElasticIsotropic
        mat_tag = 1
        ops.nDMaterial('ElasticIsotropic', mat_tag, cfg.E, cfg.nu, cfg.rho)

        # Sección - PlateFiber
        sec_tag = 1
        ops.section('PlateFiber', sec_tag, mat_tag, cfg.t)

        # Elementos ShellMITC4
        elem_id = 1
        for j in range(cfg.ny):
            for i in range(cfg.nx):
                n1 = node_map[(i, j)]
                n2 = node_map[(i+1, j)]
                n3 = node_map[(i+1, j+1)]
                n4 = node_map[(i, j+1)]

                ops.element('ShellMITC4', elem_id, n1, n2, n3, n4, sec_tag)
                elem_id += 1

        print(f"  Elementos: {elem_id - 1}")

        # Patrón de carga - Uniforme
        ops.timeSeries('Constant', 1)
        ops.pattern('Plain', 1, 1)

        # Carga distribuida en cada elemento
        # Para OpenSees, usamos eleLoad con tipo "shellFace"
        # O carga nodal equivalente

        # Carga nodal equivalente (q * área_tributaria)
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                nid = node_map[(i, j)]

                # Área tributaria
                ax = dx
                ay = dy

                if i == 0 or i == cfg.nx:
                    ax = dx / 2
                if j == 0 or j == cfg.ny:
                    ay = dy / 2

                A_trib = ax * ay
                Fz = -cfg.q * A_trib  # Fuerza hacia abajo

                # Solo aplicar a nodos interiores (los de borde están restringidos)
                if not (i == 0 or i == cfg.nx or j == 0 or j == cfg.ny):
                    ops.load(nid, 0.0, 0.0, Fz, 0.0, 0.0, 0.0)

        print(f"  Carga: {cfg.q} Pa")

        # Sistema de análisis
        ops.system('BandSPD')
        ops.numberer('RCM')
        ops.constraints('Plain')
        ops.integrator('LoadControl', 1.0)
        ops.algorithm('Linear')
        ops.analysis('Static')

        # Ejecutar
        print("  Ejecutando análisis estático...")
        ops.analyze(1)

        # Extraer desplazamientos
        w_list = []
        for j in range(cfg.ny + 1):
            for i in range(cfg.nx + 1):
                nid = node_map[(i, j)]
                disp = ops.nodeDisp(nid)
                w_list.append(abs(disp[2]))  # U3

        results['w_max'] = max(w_list)

        # Desplazamiento en centro
        centro = node_map[(cfg.nx//2, cfg.ny//2)]
        disp_centro = ops.nodeDisp(centro)
        results['w_center'] = abs(disp_centro[2])

        print(f"  w_max = {results['w_max']*1000:.4f} mm")
        print(f"  w_centro = {results['w_center']*1000:.4f} mm")

        # Análisis modal
        print("  Ejecutando análisis modal...")
        ops.wipeAnalysis()

        num_modes = 5
        eigenvalues = ops.eigen(num_modes)

        if eigenvalues:
            frequencies = [math.sqrt(ev) / (2 * math.pi) for ev in eigenvalues if ev > 0]
            if frequencies:
                results['f11'] = frequencies[0]
                results['T11'] = 1 / frequencies[0]
                results['frequencies'] = frequencies
                print(f"  f1 = {results['f11']:.4f} Hz")

        results['status'] = 'OK'

    except ImportError:
        print("  [ERROR] OpenSeesPy no instalado")
        print("  Instalar: pip install openseespy")
        results['status'] = 'NO_INSTALADO'

    except Exception as e:
        print(f"  [ERROR] {e}")
        import traceback
        traceback.print_exc()
        results['error'] = str(e)
        results['status'] = 'ERROR'

    return results


# ============================================================================
# GENERAR MODELO AWATIF
# ============================================================================

def generar_modelo_awatif(cfg: TestConfig) -> Dict:
    """Generar modelo en formato JSON para awatif-fem"""

    print("\n" + "="*60)
    print("AWATIF-FEM (Modelo JSON)")
    print("="*60)

    dx = cfg.Lx / cfg.nx
    dy = cfg.Ly / cfg.ny

    # Nodos
    nodes = []
    for j in range(cfg.ny + 1):
        for i in range(cfg.nx + 1):
            nodes.append([i * dx, j * dy, 0.0])

    # Elementos
    elements = []
    for j in range(cfg.ny):
        for i in range(cfg.nx):
            n1 = j * (cfg.nx + 1) + i
            n2 = n1 + 1
            n3 = n2 + (cfg.nx + 1)
            n4 = n1 + (cfg.nx + 1)
            elements.append([n1, n2, n3, n4])

    # Apoyos
    supports = {}
    for j in range(cfg.ny + 1):
        for i in range(cfg.nx + 1):
            if i == 0 or i == cfg.nx or j == 0 or j == cfg.ny:
                node_idx = j * (cfg.nx + 1) + i
                supports[str(node_idx)] = [False, False, True, False, False, False]

    # Propiedades
    num_elements = len(elements)
    element_props = {
        'elasticities': {str(i): cfg.E for i in range(num_elements)},
        'poissonsRatios': {str(i): cfg.nu for i in range(num_elements)},
        'thicknesses': {str(i): cfg.t for i in range(num_elements)},
        'densities': {str(i): cfg.rho for i in range(num_elements)}
    }

    model = {
        'description': f'Placa {cfg.Lx}x{cfg.Ly}x{cfg.t}m simplemente apoyada',
        'mesh': f'{cfg.nx}x{cfg.ny}',
        'nodes': nodes,
        'elements': elements,
        'supports': supports,
        'elementProperties': element_props,
        'uniformLoad': cfg.q
    }

    # Guardar
    json_path = os.path.join(cfg.output_dir, 'awatif_quad4_model.json')
    with open(json_path, 'w') as f:
        json.dump(model, f, indent=2)

    print(f"  Nodos: {len(nodes)}")
    print(f"  Elementos: {len(elements)}")
    print(f"  Guardado: {json_path}")

    return {'path': json_path, 'model': model}


# ============================================================================
# TABLA COMPARATIVA
# ============================================================================

def generar_tabla_comparativa(teorico: Dict, sap2000: Dict, etabs: Dict,
                               opensees: Dict, cfg: TestConfig) -> str:
    """Generar tabla comparativa de resultados"""

    def fmt(val, mult=1, dec=4):
        if val is None:
            return "N/A"
        return f"{val*mult:.{dec}f}"

    def error(val, ref):
        if val is None or ref is None or ref == 0:
            return "N/A"
        return f"{abs(val-ref)/abs(ref)*100:.1f}%"

    w_ref = teorico['w_center']
    M_ref = abs(teorico['Mx_center']) / 1000  # N-m a kN-m
    f_ref = teorico['f11']

    tabla = f"""
================================================================================
COMPARACIÓN DE RESULTADOS - ELEMENTO QUAD4 SHELL
================================================================================

Caso: Placa simplemente apoyada {cfg.Lx}x{cfg.Ly}x{cfg.t}m
      E = {cfg.E/1e9} GPa, nu = {cfg.nu}, rho = {cfg.rho} kg/m3
      Carga uniforme q = {cfg.q/1000} kN/m²
      Mesh: {cfg.nx}x{cfg.ny} elementos

--------------------------------------------------------------------------------
                          DESPLAZAMIENTO MÁXIMO (mm)
--------------------------------------------------------------------------------
Programa              w_max          Error vs Teórico
--------------------------------------------------------------------------------
TEÓRICO (Navier)      {fmt(w_ref, 1000)}        (referencia)
SAP2000               {fmt(sap2000.get('w_max'), 1000):12}  {error(sap2000.get('w_max'), w_ref):>8}
ETABS                 {fmt(etabs.get('w_max'), 1000):12}  {error(etabs.get('w_max'), w_ref):>8}
OpenSees              {fmt(opensees.get('w_max'), 1000):12}  {error(opensees.get('w_max'), w_ref):>8}
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
                          MOMENTO MÁXIMO M11 (kN-m/m)
--------------------------------------------------------------------------------
TEÓRICO (aprox)       {fmt(teorico['M_simplified'], 1):12}  (referencia)
SAP2000               {fmt(sap2000.get('M11_max'), 1):12}  {error(sap2000.get('M11_max'), teorico['M_simplified']):>8}
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
                          FRECUENCIA FUNDAMENTAL (Hz)
--------------------------------------------------------------------------------
TEÓRICO               {fmt(f_ref, 1, 2):12}  (referencia)
SAP2000               {fmt(sap2000.get('f11'), 1, 2):12}  {error(sap2000.get('f11'), f_ref):>8}
ETABS                 {fmt(etabs.get('f11'), 1, 2):12}  {error(etabs.get('f11'), f_ref):>8}
OpenSees              {fmt(opensees.get('f11'), 1, 2):12}  {error(opensees.get('f11'), f_ref):>8}
--------------------------------------------------------------------------------

Notas:
- SAP2000/ETABS usan Plate-Thick (Mindlin/Reissner)
- OpenSees usa ShellMITC4 (Mixed Interpolation of Tensorial Components)
- Todos incluyen deformación por cortante transversal

Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M')}
================================================================================
"""
    return tabla


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Ejecutar comparación completa"""

    print("\n" + "="*70)
    print("COMPARACIÓN QUAD4: AWATIF vs SAP2000 vs ETABS vs OPENSEES")
    print("="*70)

    cfg = CONFIG

    # Crear directorio de salida
    if not os.path.exists(cfg.output_dir):
        os.makedirs(cfg.output_dir)

    # 1. Solución teórica
    print("\n[1] SOLUCIÓN TEÓRICA")
    teorico = solucion_teorica(cfg)
    print(f"    D = {teorico['D']:.2f} N-m")
    print(f"    w_center = {teorico['w_center']*1000:.4f} mm")
    print(f"    M_center = {teorico['Mx_center']/1000:.4f} kN-m/m")
    print(f"    f_11 = {teorico['f11']:.2f} Hz")

    # 2. SAP2000
    print("\n[2] SAP2000")
    sap2000 = ejecutar_sap2000(cfg)

    # 3. ETABS (opcional)
    print("\n[3] ETABS")
    try:
        etabs = ejecutar_etabs(cfg)
    except:
        etabs = {'nombre': 'ETABS', 'status': 'NO_DISPONIBLE'}
        print("  [SKIP] ETABS no disponible")

    # 4. OpenSees
    print("\n[4] OPENSEES")
    opensees = ejecutar_opensees(cfg)

    # 5. Modelo Awatif
    print("\n[5] MODELO AWATIF")
    awatif = generar_modelo_awatif(cfg)

    # 6. Tabla comparativa
    tabla = generar_tabla_comparativa(teorico, sap2000, etabs, opensees, cfg)
    print(tabla)

    # Guardar tabla
    tabla_path = os.path.join(cfg.output_dir, 'comparacion_resultados.txt')
    with open(tabla_path, 'w', encoding='utf-8') as f:
        f.write(tabla)
    print(f"\nTabla guardada: {tabla_path}")

    # Guardar JSON
    resultados = {
        'config': {
            'Lx': cfg.Lx, 'Ly': cfg.Ly, 't': cfg.t,
            'E': cfg.E, 'nu': cfg.nu, 'rho': cfg.rho,
            'q': cfg.q, 'mesh': f'{cfg.nx}x{cfg.ny}'
        },
        'teorico': teorico,
        'sap2000': sap2000,
        'etabs': etabs,
        'opensees': opensees,
        'timestamp': datetime.now().isoformat()
    }

    json_path = os.path.join(cfg.output_dir, 'comparacion_resultados.json')
    with open(json_path, 'w') as f:
        json.dump(resultados, f, indent=2, default=str)
    print(f"Resultados JSON: {json_path}")

    print("\n" + "="*70)
    print("COMPARACIÓN COMPLETADA")
    print("="*70)

    return resultados


if __name__ == '__main__':
    main()
