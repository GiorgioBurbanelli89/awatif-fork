# -*- coding: utf-8 -*-
"""
ETABS - SOLO LEER RESULTADOS (Sin modificar modelo)
====================================================
Este script NO modifica el modelo. Solo lee resultados del análisis
que YA fue ejecutado previamente en ETABS.

IMPORTANTE: El caso MODAL debe existir y estar ejecutado en el modelo.
"""
import os
import sys
import json
import time
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

print("=" * 70)
print("ETABS - SOLO LEER RESULTADOS (Sin modificar)")
print("=" * 70)

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: No existe el modelo: {MODEL_PATH}")
    sys.exit(1)

print(f"Modelo: {MODEL_PATH}")

# ============================================================================
# CONECTAR A ETABS
# ============================================================================
print("\n[1] Conectando a ETABS...")

helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

# Intentar conectar a instancia existente primero
myETABSObject = None
try:
    myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
    if myETABSObject:
        print("    [OK] Conectado a ETABS existente")
except:
    pass

if not myETABSObject:
    # Crear nueva instancia
    etabs_paths = [
        r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe",
        r"C:\Program Files\Computers and Structures\ETABS 21\ETABS.exe",
    ]

    ProgramPath = None
    for path in etabs_paths:
        if os.path.exists(path):
            ProgramPath = path
            break

    if not ProgramPath:
        print("ERROR: ETABS no encontrado")
        sys.exit(1)

    print(f"    Iniciando: {ProgramPath}")
    myETABSObject = helper.CreateObject(ProgramPath)
    ret = myETABSObject.ApplicationStart()
    print(f"    ApplicationStart: {ret}")
    time.sleep(3)

SapModel = myETABSObject.SapModel

# ============================================================================
# ABRIR MODELO (Sin InitializeNewModel - ESO ES CLAVE)
# ============================================================================
print("\n[2] Abriendo modelo...")

# Verificar si ya hay un modelo abierto
current_file = SapModel.GetModelFilename()
if current_file and MODEL_PATH.upper() in current_file.upper():
    print(f"    [OK] Modelo ya abierto: {current_file}")
else:
    # Abrir el archivo directamente SIN InitializeNewModel
    ret = SapModel.File.OpenFile(MODEL_PATH)
    print(f"    OpenFile: {ret}")
    time.sleep(2)

# ============================================================================
# VERIFICAR ESTADO (Sin modificar nada)
# ============================================================================
print("\n[3] Verificando modelo...")

filename = SapModel.GetModelFilename()
print(f"    Archivo: {filename}")

# Verificar casos existentes
ret = SapModel.LoadCases.GetNameList(0, [])
n_casos = ret[0]
casos = list(ret[1]) if n_casos > 0 else []
print(f"    Casos: {casos}")

# Buscar caso modal
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("\n[ERROR] No hay caso MODAL en el modelo")
    print("        Cree el caso MODAL manualmente en ETABS primero")
    myETABSObject.ApplicationExit(False)
    sys.exit(1)

print(f"    Caso modal: {modal_case}")

# Verificar estado del análisis
ret = SapModel.Analyze.GetCaseStatus(modal_case)
status = ret[0]
status_map = {1: "No ejecutado", 2: "Ejecutando", 3: "Completado", 4: "Error"}
print(f"    Estado: {status_map.get(status, status)}")

# ============================================================================
# SI NO ESTA EJECUTADO, NECESITA GUARDAR PRIMERO Y LUEGO ANALIZAR
# ============================================================================
if status != 3:
    print("\n[4] Análisis no completado. Guardando y ejecutando...")

    # GUARDAR CON EL MISMO NOMBRE (CRITICO!)
    ret = SapModel.File.Save(MODEL_PATH)
    print(f"    Save: {ret}")
    time.sleep(1)

    # Desactivar todos los casos
    SapModel.Analyze.SetRunCaseFlag("", False, True)
    # Activar solo modal
    SapModel.Analyze.SetRunCaseFlag(modal_case, True)

    # GUARDAR OTRA VEZ después de modificar flags
    ret = SapModel.File.Save(MODEL_PATH)
    print(f"    Save (después de flags): {ret}")
    time.sleep(1)

    # Ejecutar
    print("    Ejecutando análisis...")
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    RunAnalysis: {ret}")
    time.sleep(3)

    # GUARDAR DESPUÉS de analizar
    ret = SapModel.File.Save(MODEL_PATH)
    print(f"    Save (después de análisis): {ret}")

# ============================================================================
# LEER RESULTADOS
# ============================================================================
print("\n[5] Leyendo resultados modales...")

etabs_results = []

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
    print(f"    SetCaseSelectedForOutput: {ret}")

    result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
    n_results = result[0]
    StepNum = result[3]
    Period = result[4]
    Frequency = result[5]
    CircFreq = result[6]

    print(f"\n    Modos: {n_results}")

    if n_results > 0:
        print(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}{'ω (rad/s)':<12}")
        print("    " + "-" * 45)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            w = CircFreq[i] if CircFreq else 2 * 3.14159 * f

            print(f"    {mode:<6}{T:<12.4f}{f:<12.4f}{w:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f, 'omega': w})
    else:
        print("    [WARN] No hay resultados modales")

except Exception as e:
    print(f"    [ERROR] {e}")

# ============================================================================
# MASAS PARTICIPANTES
# ============================================================================
print("\n[6] Masas participantes...")

try:
    result = SapModel.Results.ModalParticipatingMassRatios(
        0, [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
    )
    n = result[0]

    if n > 0:
        Period = result[4]
        UX = result[5]
        UY = result[6]
        SumUX = result[8]
        SumUY = result[9]
        RZ = result[13]

        print(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'RZ%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
        print("    " + "-" * 55)

        for i in range(min(12, n)):
            print(f"    {i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{RZ[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")

            if i < len(etabs_results):
                etabs_results[i]['UX'] = UX[i]
                etabs_results[i]['UY'] = UY[i]
                etabs_results[i]['RZ'] = RZ[i]
except Exception as e:
    print(f"    [WARN] {e}")

# ============================================================================
# GUARDAR JSON
# ============================================================================
print("\n[7] Guardando resultados...")

if etabs_results:
    output = {
        'model': 'sra silvia',
        'source': MODEL_PATH,
        'modal_case': modal_case,
        'n_modes': len(etabs_results),
        'etabs_results': etabs_results
    }

    output_file = 'sra_silvia_modal_etabs.json'
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"    [OK] Guardado en {output_file}")

    print("\n    RESUMEN:")
    for r in etabs_results[:6]:
        print(f"    Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
else:
    print("    [WARN] No hay resultados")

# ============================================================================
# CERRAR (Sin guardar cambios adicionales)
# ============================================================================
print("\n[8] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)
print("    [OK] Cerrado")

print("\n" + "=" * 70)
print("COMPLETADO")
print("=" * 70)
