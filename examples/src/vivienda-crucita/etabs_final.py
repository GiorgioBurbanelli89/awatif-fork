# -*- coding: utf-8 -*-
"""
ETABS - VERSIÓN FINAL - Ejecutar análisis y leer resultados
"""
import os
import sys
import json
import time
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

def pf(*args):
    print(*args, flush=True)

pf("=" * 70)
pf("ETABS - FINAL")
pf("=" * 70)

# Conectar
pf("\n[1] Conectando...")
helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
myETABSObject = helper.CreateObject(ProgramPath)
ret = myETABSObject.ApplicationStart()
pf(f"    ApplicationStart: {ret}")

time.sleep(3)
SapModel = myETABSObject.SapModel

# Abrir
pf("\n[2] Abriendo modelo...")
ret = SapModel.File.OpenFile(MODEL_PATH)
pf(f"    OpenFile: {ret}")
time.sleep(2)

# Verificar
filename = SapModel.GetModelFilename()
pf(f"    Archivo: {filename}")

# Casos
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
pf(f"\n[3] Casos: {casos}")

modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    pf("[ERROR] No hay caso MODAL")
    myETABSObject.ApplicationExit(False)
    sys.exit(1)

pf(f"    Caso modal: {modal_case}")

# GUARDAR PRIMERO (Crítico - usuario cerrará diálogos)
pf("\n[4] Guardando modelo...")
pf("    (Si aparece diálogo, CIÉRRALO)")
ret = SapModel.File.Save(MODEL_PATH)
pf(f"    Save: {ret}")
time.sleep(2)

# Configurar casos a ejecutar
pf("\n[5] Configurando análisis...")
SapModel.Analyze.SetRunCaseFlag("", False, True)  # Desactivar todos
SapModel.Analyze.SetRunCaseFlag(modal_case, True)  # Activar solo modal
pf(f"    {modal_case} activado")

# GUARDAR DE NUEVO (después de modificar flags)
pf("    Guardando...")
ret = SapModel.File.Save(MODEL_PATH)
pf(f"    Save: {ret}")
time.sleep(2)

# EJECUTAR ANÁLISIS
pf("\n[6] Ejecutando análisis...")
pf("    (Si aparece diálogo, CIÉRRALO)")
ret = SapModel.Analyze.RunAnalysis()
pf(f"    RunAnalysis: {ret}")

# Esperar a que termine el análisis
pf("    Esperando 10 segundos...")
time.sleep(10)

# GUARDAR DESPUÉS DEL ANÁLISIS
pf("\n[7] Guardando resultados...")
ret = SapModel.File.Save(MODEL_PATH)
pf(f"    Save: {ret}")
time.sleep(2)

# LEER RESULTADOS
pf("\n[8] Leyendo resultados modales...")

etabs_results = []

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
    pf(f"    SetCaseSelectedForOutput: {ret}")

    # Intentar varias veces por si el análisis toma tiempo
    for intento in range(3):
        result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
        n_results = result[0]
        pf(f"    Intento {intento+1}: {n_results} modos")

        if n_results > 0:
            break
        time.sleep(3)

    if n_results > 0:
        StepNum = result[3]
        Period = result[4]
        Frequency = result[5]
        CircFreq = result[6]

        pf(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}")
        pf("    " + "-" * 30)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            w = CircFreq[i] if CircFreq else 2 * 3.14159 * f
            pf(f"    {mode:<6}{T:<12.4f}{f:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f, 'omega': w})
    else:
        pf("    [WARN] No hay resultados modales después de 3 intentos")

except Exception as e:
    pf(f"    [ERROR] {e}")

# Masas participantes
pf("\n[9] Masas participantes...")
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

        pf(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
        pf("    " + "-" * 50)
        for i in range(min(12, n)):
            pf(f"    {i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")
            if i < len(etabs_results):
                etabs_results[i]['UX'] = UX[i]
                etabs_results[i]['UY'] = UY[i]
    else:
        pf("    No hay datos de masas participantes")
except Exception as e:
    pf(f"    [WARN] {e}")

# Guardar JSON
pf("\n[10] Guardando JSON...")
if etabs_results:
    output = {
        'model': 'sra silvia',
        'source': MODEL_PATH,
        'modal_case': modal_case,
        'etabs_results': etabs_results
    }
    with open('sra_silvia_modal_etabs.json', 'w') as f:
        json.dump(output, f, indent=2)
    pf(f"    [OK] Guardado en sra_silvia_modal_etabs.json")

    pf("\n    RESUMEN:")
    for r in etabs_results[:6]:
        pf(f"    Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
else:
    pf("    [WARN] No hay resultados para guardar")

# Cerrar
pf("\n[11] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)
pf("LISTO")
