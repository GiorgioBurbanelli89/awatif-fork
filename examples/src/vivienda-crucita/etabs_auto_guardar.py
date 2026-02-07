# -*- coding: utf-8 -*-
"""
ETABS - Auto guardar con manejo de diálogos
"""
import os
import sys
import json
import time
import threading
import comtypes.client

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

def print_flush(*args, **kwargs):
    """Print con flush inmediato"""
    print(*args, **kwargs, flush=True)

def handle_save_dialog():
    """Thread que maneja diálogos de guardar automáticamente"""
    import pyautogui
    import pygetwindow as gw
    import ctypes

    print_flush("[THREAD] Iniciando monitor de diálogos...")

    while True:
        try:
            # Buscar diálogos de guardar
            save_windows = gw.getWindowsWithTitle('Save')
            if save_windows:
                print_flush("[THREAD] Diálogo Save detectado - presionando Enter")

                # Traer al frente
                user32 = ctypes.windll.user32
                hwnd = save_windows[0]._hWnd
                user32.SetForegroundWindow(hwnd)
                time.sleep(0.3)

                # Presionar Enter
                pyautogui.press('enter')
                time.sleep(1)

        except Exception as e:
            pass

        time.sleep(2)

print_flush("=" * 70)
print_flush("ETABS - AUTO GUARDAR")
print_flush("=" * 70)

# Iniciar thread para manejar diálogos
dialog_thread = threading.Thread(target=handle_save_dialog, daemon=True)
dialog_thread.start()

# Conectar a ETABS
print_flush("\n[1] Conectando a ETABS...")

helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
myETABSObject = helper.CreateObject(ProgramPath)
ret = myETABSObject.ApplicationStart()
print_flush(f"    ApplicationStart: {ret}")

time.sleep(3)
SapModel = myETABSObject.SapModel

# Abrir modelo
print_flush(f"\n[2] Abriendo modelo...")
print_flush(f"    {MODEL_PATH}")
ret = SapModel.File.OpenFile(MODEL_PATH)
print_flush(f"    OpenFile: {ret}")
time.sleep(2)

# Verificar archivo
filename = SapModel.GetModelFilename()
print_flush(f"    Archivo cargado: {filename}")

# Listar casos
print_flush("\n[3] Verificando casos...")
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
print_flush(f"    Casos: {casos}")

# Buscar modal
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print_flush("[ERROR] No hay caso MODAL")
    myETABSObject.ApplicationExit(False)
    sys.exit(1)

print_flush(f"    Caso modal: {modal_case}")

# Intentar leer resultados
print_flush("\n[4] Leyendo resultados...")

etabs_results = []

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
    n_results = result[0]
    print_flush(f"    ModalPeriod: {n_results} modos")

    if n_results > 0:
        StepNum = result[3]
        Period = result[4]
        Frequency = result[5]

        print_flush(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}")
        print_flush("    " + "-" * 30)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            print_flush(f"    {mode:<6}{T:<12.4f}{f:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f})
    else:
        print_flush("    No hay resultados - ejecutando análisis...")

        # Guardar
        print_flush("    Guardando modelo...")
        ret = SapModel.File.Save(MODEL_PATH)
        print_flush(f"    Save: {ret}")
        time.sleep(3)  # Esperar diálogo si aparece

        # Configurar
        SapModel.Analyze.SetRunCaseFlag("", False, True)
        SapModel.Analyze.SetRunCaseFlag(modal_case, True)

        # Guardar de nuevo
        ret = SapModel.File.Save(MODEL_PATH)
        print_flush(f"    Save: {ret}")
        time.sleep(3)

        # Ejecutar
        print_flush("    Ejecutando análisis...")
        ret = SapModel.Analyze.RunAnalysis()
        print_flush(f"    RunAnalysis: {ret}")
        time.sleep(3)

        # Guardar después
        ret = SapModel.File.Save(MODEL_PATH)
        print_flush(f"    Save: {ret}")
        time.sleep(3)

        # Leer de nuevo
        SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
        result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
        n_results = result[0]

        if n_results > 0:
            StepNum = result[3]
            Period = result[4]
            Frequency = result[5]
            for i in range(min(12, n_results)):
                mode = int(StepNum[i]) if StepNum else i + 1
                T = Period[i]
                f = Frequency[i]
                print_flush(f"    Mode {mode}: T={T:.4f}s, f={f:.4f}Hz")
                etabs_results.append({'mode': mode, 'T': T, 'f': f})

except Exception as e:
    print_flush(f"    [ERROR] {e}")

# Masas participantes
print_flush("\n[5] Masas participantes...")
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

        print_flush(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
        print_flush("    " + "-" * 50)
        for i in range(min(12, n)):
            print_flush(f"    {i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")
            if i < len(etabs_results):
                etabs_results[i]['UX'] = UX[i]
                etabs_results[i]['UY'] = UY[i]
except Exception as e:
    print_flush(f"    [WARN] {e}")

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
    print_flush(f"\n[6] Guardado en sra_silvia_modal_etabs.json")

# Cerrar
print_flush("\n[7] Cerrando ETABS...")
myETABSObject.ApplicationExit(False)
print_flush("LISTO")
