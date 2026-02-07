# -*- coding: utf-8 -*-
"""
ETABS - LEER RESULTADOS SIMPLE
Versión simplificada que solo lee resultados existentes
"""
import os
import sys
import json
import time
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

print("=" * 70)
print("ETABS - LEER RESULTADOS")
print("=" * 70)

# Conectar
helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
myETABSObject = helper.CreateObject(ProgramPath)
ret = myETABSObject.ApplicationStart()
print(f"[1] ApplicationStart: {ret}")

time.sleep(3)
SapModel = myETABSObject.SapModel

# Abrir modelo (SIN InitializeNewModel)
print(f"\n[2] Abriendo: {MODEL_PATH}")
ret = SapModel.File.OpenFile(MODEL_PATH)
print(f"    OpenFile: {ret}")
time.sleep(2)

# Verificar casos
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
print(f"\n[3] Casos: {casos}")

modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("[ERROR] No hay caso MODAL")
    myETABSObject.ApplicationExit(False)
    sys.exit(1)

print(f"    Caso modal: {modal_case}")

# Intentar leer resultados directamente
print("\n[4] Leyendo resultados...")

etabs_results = []

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
    n_results = result[0]

    if n_results > 0:
        StepNum = result[3]
        Period = result[4]
        Frequency = result[5]
        CircFreq = result[6]

        print(f"\n    Modos encontrados: {n_results}")
        print(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}")
        print("    " + "-" * 30)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            w = CircFreq[i] if CircFreq else 2 * 3.14159 * f

            print(f"    {mode:<6}{T:<12.4f}{f:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f, 'omega': w})
    else:
        print("    [WARN] No hay resultados - ejecutando análisis...")

        # GUARDAR antes de analizar
        ret = SapModel.File.Save(MODEL_PATH)
        print(f"    Save: {ret}")

        # Configurar flags
        SapModel.Analyze.SetRunCaseFlag("", False, True)
        SapModel.Analyze.SetRunCaseFlag(modal_case, True)

        # Guardar después de modificar flags
        ret = SapModel.File.Save(MODEL_PATH)
        print(f"    Save (flags): {ret}")

        # Ejecutar
        ret = SapModel.Analyze.RunAnalysis()
        print(f"    RunAnalysis: {ret}")
        time.sleep(3)

        # Guardar después de analizar
        ret = SapModel.File.Save(MODEL_PATH)
        print(f"    Save (post-análisis): {ret}")

        # Leer resultados de nuevo
        SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
        SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

        result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
        n_results = result[0]

        if n_results > 0:
            StepNum = result[3]
            Period = result[4]
            Frequency = result[5]

            print(f"\n    Modos: {n_results}")
            for i in range(min(12, n_results)):
                mode = int(StepNum[i]) if StepNum else i + 1
                T = Period[i]
                f = Frequency[i]
                print(f"    Mode {mode}: T={T:.4f}s, f={f:.4f}Hz")
                etabs_results.append({'mode': mode, 'T': T, 'f': f})

except Exception as e:
    print(f"    [ERROR] {e}")

# Masas participantes
print("\n[5] Masas participantes...")
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

        print(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
        print("    " + "-" * 50)
        for i in range(min(12, n)):
            print(f"    {i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")
            if i < len(etabs_results):
                etabs_results[i]['UX'] = UX[i]
                etabs_results[i]['UY'] = UY[i]
except Exception as e:
    print(f"    [WARN] {e}")

# Guardar JSON
if etabs_results:
    output = {
        'model': 'sra silvia',
        'source': MODEL_PATH,
        'modal_case': modal_case,
        'etabs_results': etabs_results
    }
    with open('sra_silvia_modal_etabs.json', 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\n[6] Guardado en sra_silvia_modal_etabs.json")

# Cerrar
print("\n[7] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)
print("LISTO")
