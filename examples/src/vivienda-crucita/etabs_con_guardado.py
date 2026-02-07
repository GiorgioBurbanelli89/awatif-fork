# -*- coding: utf-8 -*-
"""
ETABS con guardado correcto - evita mensaje de confirmación
"""
import os
import json
import time
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"
# Usar copia temporal para evitar modificar el original
TEMP_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra_silvia_temp.EDB"

print("=" * 60)
print("ETABS - CON GUARDADO CORRECTO")
print("=" * 60)

# Copiar archivo original a temporal
import shutil
shutil.copy(MODEL_PATH, TEMP_PATH)
print(f"[0] Copiado a: {TEMP_PATH}")

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

# Abrir archivo temporal
ret = SapModel.File.OpenFile(TEMP_PATH)
print(f"[3] OpenFile: {ret}")

# GUARDAR INMEDIATAMENTE después de abrir
ret = SapModel.File.Save(TEMP_PATH)
print(f"[4] Save después de abrir: {ret}")

# Verificar casos existentes
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
print(f"[5] Casos: {casos}")

# Buscar caso modal existente
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    # Crear caso modal
    SapModel.LoadCases.ModalEigen.SetCase("MODAL")
    modal_case = "MODAL"
    print(f"[6] Caso MODAL creado")
else:
    print(f"[6] Caso modal existente: {modal_case}")

# Configurar 12 modos
SapModel.LoadCases.ModalEigen.SetNumberModes(modal_case, 12, 1)

# Desactivar todos los casos
SapModel.Analyze.SetRunCaseFlag("", False, True)
# Activar solo modal
SapModel.Analyze.SetRunCaseFlag(modal_case, True)
print(f"[7] {modal_case} activado")

# GUARDAR ANTES DE ANALIZAR (CRÍTICO)
ret = SapModel.File.Save(TEMP_PATH)
print(f"[8] Save ANTES de analizar: {ret}")

# Pequeña pausa para asegurar que se guardó
time.sleep(1)

# Ejecutar análisis
print("[9] Ejecutando análisis...")
ret = SapModel.Analyze.RunAnalysis()
print(f"    RunAnalysis: {ret}")

# Esperar a que termine
time.sleep(2)

# GUARDAR DESPUÉS DE ANALIZAR
ret = SapModel.File.Save(TEMP_PATH)
print(f"[10] Save DESPUÉS de analizar: {ret}")

# Obtener resultados
print("\n[11] Obteniendo resultados...")
SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
print(f"     SetCaseSelectedForOutput: {ret}")

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
    print("Intentando con DatabaseTables...")

    try:
        result = SapModel.DatabaseTables.GetTableForDisplayArray(
            "Modal Participating Mass Ratios", GroupName=""
        )
        n_rows = result[3]
        print(f"Tabla Modal: {n_rows} filas")
    except Exception as e:
        print(f"Error DatabaseTables: {e}")

# Cerrar
print("\n[12] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)

# Limpiar archivo temporal
try:
    os.remove(TEMP_PATH)
    print("[13] Archivo temporal eliminado")
except:
    pass

print("LISTO")
