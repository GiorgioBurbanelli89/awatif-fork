# -*- coding: utf-8 -*-
"""
ETABS - Usar copia temporal para evitar diálogos
"""
import os
import sys
import json
import time
import shutil
import comtypes.client

ORIGINAL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"
# Crear copia temporal en carpeta temporal
TEMP_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra_silvia_TEMP.EDB"

def pf(*args):
    print(*args, flush=True)

pf("=" * 70)
pf("ETABS - COPIA TEMPORAL")
pf("=" * 70)

# Copiar archivo a temporal
pf("\n[0] Creando copia temporal...")
if os.path.exists(TEMP_PATH):
    os.remove(TEMP_PATH)
shutil.copy(ORIGINAL_PATH, TEMP_PATH)
pf(f"    Copiado a: {TEMP_PATH}")

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

# Abrir copia temporal
pf("\n[2] Abriendo copia temporal...")
ret = SapModel.File.OpenFile(TEMP_PATH)
pf(f"    OpenFile: {ret}")
time.sleep(2)

# Guardar inmediatamente
pf("\n[3] Guardando inmediatamente...")
ret = SapModel.File.Save(TEMP_PATH)
pf(f"    Save: {ret}")
time.sleep(1)

# Verificar
filename = SapModel.GetModelFilename()
pf(f"    Archivo: {filename}")

# Casos
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
pf(f"\n[4] Casos: {casos}")

modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    pf("[ERROR] No hay caso MODAL")
    myETABSObject.ApplicationExit(False)
    os.remove(TEMP_PATH)
    sys.exit(1)

pf(f"    Caso modal: {modal_case}")

# Configurar
pf("\n[5] Configurando análisis...")
SapModel.Analyze.SetRunCaseFlag("", False, True)
SapModel.Analyze.SetRunCaseFlag(modal_case, True)

# Guardar después de configurar
ret = SapModel.File.Save(TEMP_PATH)
pf(f"    Save: {ret}")
time.sleep(1)

# Ejecutar
pf("\n[6] Ejecutando análisis...")
ret = SapModel.Analyze.RunAnalysis()
pf(f"    RunAnalysis: {ret}")
time.sleep(5)

# Guardar después de análisis
ret = SapModel.File.Save(TEMP_PATH)
pf(f"    Save: {ret}")
time.sleep(1)

# Leer resultados
pf("\n[7] Leyendo resultados...")

etabs_results = []

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
    n_results = result[0]
    pf(f"    Modos: {n_results}")

    if n_results > 0:
        StepNum = result[3]
        Period = result[4]
        Frequency = result[5]

        pf(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}")
        pf("    " + "-" * 30)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            pf(f"    {mode:<6}{T:<12.4f}{f:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f})
    else:
        pf("    [WARN] No hay resultados")

except Exception as e:
    pf(f"    [ERROR] {e}")

# Masas participantes
pf("\n[8] Masas participantes...")
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
except Exception as e:
    pf(f"    [WARN] {e}")

# Guardar JSON
if etabs_results:
    output = {
        'model': 'sra silvia',
        'source': ORIGINAL_PATH,
        'modal_case': modal_case,
        'etabs_results': etabs_results
    }
    with open('sra_silvia_modal_etabs.json', 'w') as f:
        json.dump(output, f, indent=2)
    pf(f"\n[9] Guardado en sra_silvia_modal_etabs.json")

    pf("\n    RESUMEN:")
    for r in etabs_results[:6]:
        pf(f"    Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")

# Cerrar sin guardar (False)
pf("\n[10] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)

# Eliminar copia temporal
try:
    os.remove(TEMP_PATH)
    pf("    Copia temporal eliminada")
except:
    pass

pf("LISTO")
