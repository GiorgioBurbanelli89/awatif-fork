# -*- coding: utf-8 -*-
"""
Script simple para ETABS - basado en documentacion API
"""
import os
import json
import time
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

print("=" * 60)
print("ETABS - SCRIPT SIMPLE")
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

# Inicializar y abrir
ret = SapModel.InitializeNewModel()
print(f"[2] InitializeNewModel: {ret}")

ret = SapModel.File.OpenFile(MODEL_PATH)
print(f"[3] OpenFile: {ret}")

# Guardar
ret = SapModel.File.Save(MODEL_PATH)
print(f"[4] Save: {ret}")

# Configurar caso modal
SapModel.LoadCases.ModalEigen.SetCase("MODAL")
SapModel.LoadCases.ModalEigen.SetNumberModes("MODAL", 12, 1)
print("[5] Caso MODAL configurado")

# Desactivar todo y activar solo MODAL
SapModel.Analyze.SetRunCaseFlag("", False, True)
SapModel.Analyze.SetRunCaseFlag("MODAL", True)
print("[6] MODAL activado para analisis")

# Guardar antes de analizar (IMPORTANTE)
ret = SapModel.File.Save(MODEL_PATH)
print(f"[7] Save antes de analisis: {ret}")

# Ejecutar
print("[8] Ejecutando analisis...")
ret = SapModel.Analyze.RunAnalysis()
print(f"    RunAnalysis: {ret}")

# Obtener resultados
print("\n[9] Obteniendo resultados...")
SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
SapModel.Results.Setup.SetCaseSelectedForOutput("MODAL")

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
        json.dump({'etabs_results': etabs_results}, f, indent=2)
    print("\n[OK] Guardado en sra_silvia_modal_etabs.json")

print("\n[10] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)
print("LISTO")
