# -*- coding: utf-8 -*-
"""
Extraer geometria del modelo "sra silvia.EDB" de ETABS
y crear modelos equivalentes en OpenSees y Awatif
"""
import os
import sys
import json
import math
import comtypes.client

print("=" * 70)
print("EXTRACCION DE MODELO: sra silvia.EDB")
print("=" * 70)

# Ruta del modelo
MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: No se encuentra el archivo: {MODEL_PATH}")
    sys.exit(1)

print(f"Modelo: {MODEL_PATH}")

# =============================================================================
# CONECTAR A ETABS - NUEVA INSTANCIA
# =============================================================================
print("\nAbriendo nueva instancia de ETABS...")

try:
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    # Crear nueva instancia
    ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
    if not os.path.exists(ProgramPath):
        # Intentar ETABS 20
        ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 20\ETABS.exe"

    myETABSObject = helper.CreateObject(ProgramPath)
    myETABSObject.ApplicationStart()
    print("[OK] ETABS iniciado")

    SapModel = myETABSObject.SapModel

except Exception as e:
    print(f"ERROR iniciando ETABS: {e}")
    print("Intentando conectar a instancia existente...")
    try:
        myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
        SapModel = myETABSObject.SapModel
        print("[OK] Conectado a ETABS existente")
    except:
        print("ERROR: No se puede conectar a ETABS")
        sys.exit(1)

# =============================================================================
# ABRIR MODELO
# =============================================================================
print(f"\nAbriendo modelo: {MODEL_PATH}")
ret = SapModel.File.OpenFile(MODEL_PATH)
if ret != 0:
    print(f"ERROR abriendo modelo: ret={ret}")
else:
    print("[OK] Modelo abierto")

# Unidades kN, m
kN_m_C = 6
SapModel.SetPresentUnits(kN_m_C)

# =============================================================================
# EXTRAER NODOS (JOINTS)
# =============================================================================
print("\n--- EXTRAYENDO NODOS ---")
NumberNames = 0
Names = []
[NumberNames, Names, ret] = SapModel.PointObj.GetNameList(NumberNames, Names)
print(f"Total nodos: {NumberNames}")

nodes_data = {}
for name in Names:
    X, Y, Z = 0.0, 0.0, 0.0
    [X, Y, Z, ret] = SapModel.PointObj.GetCoordCartesian(name, X, Y, Z)
    nodes_data[name] = {'x': X, 'y': Y, 'z': Z}

# Mostrar niveles unicos
z_levels = sorted(set(round(n['z'], 2) for n in nodes_data.values()))
print(f"Niveles Z: {z_levels}")

# =============================================================================
# EXTRAER FRAMES (COLUMNAS Y VIGAS)
# =============================================================================
print("\n--- EXTRAYENDO FRAMES ---")
NumberFrames = 0
FrameNames = []
[NumberFrames, FrameNames, ret] = SapModel.FrameObj.GetNameList(NumberFrames, FrameNames)
print(f"Total frames: {NumberFrames}")

frames_data = []
for name in FrameNames:
    Point1 = ''
    Point2 = ''
    [Point1, Point2, ret] = SapModel.FrameObj.GetPoints(name, Point1, Point2)

    Section = ''
    SAuto = ''
    [Section, SAuto, ret] = SapModel.FrameObj.GetSection(name, Section, SAuto)

    n1 = nodes_data.get(Point1, {})
    n2 = nodes_data.get(Point2, {})

    # Determinar si es columna o viga
    dz = abs(n2.get('z', 0) - n1.get('z', 0))
    is_column = dz > 0.5

    frames_data.append({
        'name': name,
        'point1': Point1,
        'point2': Point2,
        'section': Section,
        'type': 'column' if is_column else 'beam',
        'coords': {
            'x1': n1.get('x', 0), 'y1': n1.get('y', 0), 'z1': n1.get('z', 0),
            'x2': n2.get('x', 0), 'y2': n2.get('y', 0), 'z2': n2.get('z', 0)
        }
    })

# Contar tipos
n_cols = sum(1 for f in frames_data if f['type'] == 'column')
n_beams = sum(1 for f in frames_data if f['type'] == 'beam')
print(f"  Columnas: {n_cols}")
print(f"  Vigas: {n_beams}")

# Secciones unicas
sections = set(f['section'] for f in frames_data)
print(f"  Secciones: {sections}")

# =============================================================================
# EXTRAER AREAS (LOSAS)
# =============================================================================
print("\n--- EXTRAYENDO AREAS ---")
NumberAreas = 0
AreaNames = []
[NumberAreas, AreaNames, ret] = SapModel.AreaObj.GetNameList(NumberAreas, AreaNames)
print(f"Total areas: {NumberAreas}")

areas_data = []
for name in AreaNames:
    NumberPoints = 0
    PointNames = []
    [NumberPoints, PointNames, ret] = SapModel.AreaObj.GetPoints(name, NumberPoints, PointNames)

    Section = ''
    [Section, ret] = SapModel.AreaObj.GetProperty(name, Section)

    points_coords = []
    for pname in PointNames:
        n = nodes_data.get(pname, {})
        points_coords.append({
            'name': pname,
            'x': n.get('x', 0),
            'y': n.get('y', 0),
            'z': n.get('z', 0)
        })

    areas_data.append({
        'name': name,
        'section': Section,
        'num_points': NumberPoints,
        'points': PointNames,
        'coords': points_coords
    })

# Secciones de area
area_sections = set(a['section'] for a in areas_data)
print(f"  Secciones de area: {area_sections}")

# =============================================================================
# EXTRAER APOYOS
# =============================================================================
print("\n--- EXTRAYENDO APOYOS ---")
supports_data = {}
for name in Names:
    Restraints = [False] * 6
    [Restraints, ret] = SapModel.PointObj.GetRestraint(name, Restraints)
    if any(Restraints):
        supports_data[name] = list(Restraints)

print(f"Nodos con apoyo: {len(supports_data)}")

# =============================================================================
# EJECUTAR ANALISIS MODAL EN ETABS
# =============================================================================
print("\n--- ANALISIS MODAL ETABS ---")

# Asegurarse de que existe caso MODAL
try:
    SapModel.LoadCases.ModalEigen.SetCase('MODAL')
    SapModel.LoadCases.ModalEigen.SetNumberModes('MODAL', 12, 1)
except:
    pass

# Correr analisis
print("Ejecutando analisis...")
ret = SapModel.Analyze.RunAnalysis()

# Obtener resultados modales
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

print(f"\nResultados ETABS ({NumberResults} modos):")
print(f"{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
print("-" * 35)

etabs_results = []
for i in range(min(12, NumberResults)):
    print(f"{i+1:<6} {Period[i]:<12.4f} {Frequency[i]:<12.4f}")
    etabs_results.append({'mode': i+1, 'T': Period[i], 'f': Frequency[i]})

# =============================================================================
# GUARDAR DATOS EXTRAIDOS
# =============================================================================
model_export = {
    'name': 'sra silvia',
    'source': MODEL_PATH,
    'nodes': nodes_data,
    'frames': frames_data,
    'areas': areas_data,
    'supports': supports_data,
    'z_levels': z_levels,
    'etabs_results': etabs_results
}

output_file = 'sra_silvia_extraido.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(model_export, f, indent=2, ensure_ascii=False)
print(f"\n[OK] Datos guardados en {output_file}")

# =============================================================================
# RESUMEN
# =============================================================================
print("\n" + "=" * 70)
print("RESUMEN DEL MODELO")
print("=" * 70)
print(f"  Nodos: {len(nodes_data)}")
print(f"  Frames: {len(frames_data)} ({n_cols} columnas, {n_beams} vigas)")
print(f"  Areas: {len(areas_data)}")
print(f"  Apoyos: {len(supports_data)}")
print(f"  Niveles: {z_levels}")

if etabs_results:
    print(f"\nPrimeros 3 modos ETABS:")
    for r in etabs_results[:3]:
        print(f"  Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")

print("\n" + "=" * 70)
print("Ahora ejecutar:")
print("  python crear_opensees_desde_etabs.py  # Crear modelo OpenSees")
print("  python crear_awatif_desde_etabs.py    # Crear test Awatif")
print("=" * 70)
