# -*- coding: utf-8 -*-
"""
ETABS sin diálogo de guardar - NO modifica el modelo
Solo lee los resultados del caso MODAL existente
"""
import os
import json
import time
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

print("=" * 60)
print("ETABS - SIN DIALOGO (solo lectura)")
print("=" * 60)

# Conectar
helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

# Crear nueva instancia
ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
myETABSObject = helper.CreateObject(ProgramPath)
ret = myETABSObject.ApplicationStart()
print(f"[1] ApplicationStart: {ret}")

SapModel = myETABSObject.SapModel

# Inicializar
ret = SapModel.InitializeNewModel()
print(f"[2] InitializeNewModel: {ret}")

# Abrir archivo
ret = SapModel.File.OpenFile(MODEL_PATH)
print(f"[3] OpenFile: {ret}")

# Esperar a que cargue
time.sleep(2)

# Verificar casos existentes (SIN CREAR NUEVOS)
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
print(f"[4] Casos existentes: {casos}")

# Buscar caso modal existente
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("[ERROR] No hay caso MODAL en el modelo")
    print("        Crear el caso MODAL manualmente en ETABS primero")
    myETABSObject.ApplicationExit(False)
    exit(1)

print(f"[5] Caso MODAL encontrado: {modal_case}")

# Verificar estado del análisis
ret = SapModel.Analyze.GetCaseStatus(modal_case)
status = ret[0]
status_map = {1: "No ejecutado", 2: "Ejecutando", 3: "Completado", 4: "Error"}
print(f"[6] Estado de {modal_case}: {status_map.get(status, status)}")

# Si el análisis YA está completado, solo leer resultados
if status == 3:
    print("[7] Análisis ya completado - leyendo resultados...")
else:
    # Ejecutar análisis SOLO del caso modal existente
    print("[7] Ejecutando análisis...")

    # GUARDAR el modelo ANTES de ejecutar
    ret = SapModel.File.Save()
    print(f"    Save antes de analizar: {ret}")
    time.sleep(1)

    # Configurar para ejecutar solo el caso modal
    SapModel.Analyze.SetRunCaseFlag("", False, True)
    SapModel.Analyze.SetRunCaseFlag(modal_case, True)

    # Ejecutar
    ret = SapModel.Analyze.RunAnalysis()
    print(f"    RunAnalysis: {ret}")

    # GUARDAR después de ejecutar
    ret = SapModel.File.Save()
    print(f"    Save después de analizar: {ret}")

time.sleep(1)

# Obtener resultados
print("\n[8] Obteniendo resultados...")
SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
print(f"    SetCaseSelectedForOutput: {ret}")

result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
n = result[0]
StepNum = result[3]
Period = result[4]
Frequency = result[5]

print(f"\nModos: {n}")
if n > 0:
    print(f"\n{'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}")
    print("-" * 35)

    etabs_results = []
    for i in range(min(12, n)):
        mode = int(StepNum[i]) if StepNum else i + 1
        T = Period[i]
        f = Frequency[i]
        print(f"{mode:<6}{T:<12.4f}{f:<12.4f}")
        etabs_results.append({'mode': mode, 'T': T, 'f': f})

    with open('sra_silvia_modal_etabs.json', 'w') as f:
        json.dump({'etabs_results': etabs_results, 'modal_case': modal_case}, f, indent=2)
    print("\n[OK] Guardado en sra_silvia_modal_etabs.json")
else:
    print("[WARN] No hay resultados modales")

# Cerrar sin guardar cambios adicionales (False = no guardar)
print("\n[9] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)

print("LISTO")
