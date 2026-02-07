# -*- coding: utf-8 -*-
"""
ETABS - CONECTAR A INSTANCIA EXISTENTE
======================================
INSTRUCCIONES:
1. Abre ETABS manualmente
2. Abre el modelo "sra silvia.EDB" manualmente
3. Guarda el modelo manualmente (Ctrl+S)
4. Ejecuta este script

Este script se conecta a ETABS que YA está abierto y ejecuta el análisis.
NO crea nueva instancia de ETABS.
"""
import os
import sys
import json
import time
import comtypes.client

def pf(*args):
    print(*args, flush=True)

pf("=" * 70)
pf("ETABS - CONECTAR A INSTANCIA EXISTENTE")
pf("=" * 70)
pf("\nASEGÚRATE de tener ETABS abierto con el modelo 'sra silvia.EDB'")
pf("y que el modelo esté GUARDADO (Ctrl+S)")
pf("")

# Conectar a ETABS existente
pf("[1] Conectando a ETABS existente...")

try:
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)
    myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")

    if myETABSObject is None:
        pf("    [ERROR] No hay ETABS abierto")
        pf("    Abre ETABS manualmente y carga el modelo primero")
        sys.exit(1)

    SapModel = myETABSObject.SapModel
    pf("    [OK] Conectado a ETABS")

except Exception as e:
    pf(f"    [ERROR] {e}")
    pf("    Abre ETABS manualmente y carga el modelo primero")
    sys.exit(1)

# Verificar modelo
filename = SapModel.GetModelFilename()
pf(f"\n[2] Modelo actual: {filename}")

if not filename or len(filename) == 0:
    pf("    [ERROR] No hay modelo abierto")
    pf("    Abre un modelo en ETABS primero")
    sys.exit(1)

# Listar casos
pf("\n[3] Verificando casos...")
ret = SapModel.LoadCases.GetNameList(0, [])
casos = list(ret[1]) if ret[0] > 0 else []
pf(f"    Casos: {casos}")

# Buscar modal
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    pf("    [ERROR] No hay caso MODAL")
    sys.exit(1)

pf(f"    Caso modal: {modal_case}")

# Guardar antes (ya debería estar guardado, pero por si acaso)
pf("\n[4] Guardando modelo...")
try:
    ret = SapModel.File.Save()
    pf(f"    Save: {ret}")
except:
    pf("    Save falló, continuando...")

# Configurar caso modal
pf("\n[5] Configurando análisis...")
try:
    SapModel.Analyze.SetRunCaseFlag("", False, True)
    SapModel.Analyze.SetRunCaseFlag(modal_case, True, False)
    pf(f"    {modal_case} activado")
except Exception as e:
    pf(f"    [WARN] {e}")

# Crear modelo de análisis y ejecutar
pf("\n[6] Ejecutando análisis...")
try:
    ret = SapModel.Analyze.CreateAnalysisModel()
    pf(f"    CreateAnalysisModel: {ret}")

    ret = SapModel.Analyze.RunAnalysis()
    pf(f"    RunAnalysis: {ret}")
except Exception as e:
    pf(f"    [WARN] {e}")

# Guardar después
pf("\n[7] Guardando resultados...")
try:
    ret = SapModel.File.Save()
    pf(f"    Save: {ret}")
except:
    pass

# Leer resultados usando DatabaseTables (más robusto)
pf("\n[8] Leyendo resultados modales via DatabaseTables...")

etabs_results = []

try:
    import numpy as np

    # Método 1: DatabaseTables (más robusto según MOD 4 notebook)
    name_table = "Modal Periods And Frequencies"
    table = SapModel.DatabaseTables.GetTableForDisplayArray(name_table, GroupName="")

    if table[3] > 0:  # noOfRows > 0
        cols = table[2]
        noOfRows = table[3]
        vals = np.array_split(table[4], noOfRows)

        pf(f"    Modos encontrados: {noOfRows}")
        pf(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}")
        pf("    " + "-" * 30)

        for i, row in enumerate(vals):
            row_dict = dict(zip(cols, row))
            mode = int(row_dict.get('Mode', i+1))
            T = float(row_dict.get('Period', 0))
            f = float(row_dict.get('Frequency', 0))
            w = float(row_dict.get('CircFreq', 2 * 3.14159 * f))

            pf(f"    {mode:<6}{T:<12.4f}{f:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f, 'omega': w})
    else:
        pf("    [WARN] No hay resultados en DatabaseTables")
        pf("    Intentando método tradicional...")

        # Método 2: Results.ModalPeriod (fallback)
        SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
        SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

        result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])
        n_results = result[0]
        pf(f"    Modos encontrados (método tradicional): {n_results}")

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
            pf("    [WARN] No hay resultados modales")
            pf("    Posibles causas:")
            pf("    1. El modelo no tiene masa definida")
            pf("    2. El caso MODAL no se ejecutó")
            pf("    3. Ejecuta el análisis manualmente en ETABS primero")

except Exception as e:
    pf(f"    [ERROR] {e}")

# Masas participantes via DatabaseTables
pf("\n[9] Masas participantes via DatabaseTables...")
try:
    name_table = "Modal Participating Mass Ratios"
    table = SapModel.DatabaseTables.GetTableForDisplayArray(name_table, GroupName="")

    if table[3] > 0:  # noOfRows > 0
        cols = table[2]
        noOfRows = table[3]
        vals = np.array_split(table[4], noOfRows)

        pf(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'RZ%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
        pf("    " + "-" * 55)

        for i, row in enumerate(vals[:12]):
            row_dict = dict(zip(cols, row))
            mode = int(row_dict.get('Mode', i+1))
            T = float(row_dict.get('Period', 0))
            UX = float(row_dict.get('UX', 0))
            UY = float(row_dict.get('UY', 0))
            RZ = float(row_dict.get('RZ', 0))
            SumUX = float(row_dict.get('SumUX', 0))
            SumUY = float(row_dict.get('SumUY', 0))

            pf(f"    {mode:<6}{T:<10.4f}{UX*100:<8.1f}{UY*100:<8.1f}{RZ*100:<8.1f}{SumUX*100:<8.1f}{SumUY*100:<8.1f}")

            if i < len(etabs_results):
                etabs_results[i]['UX'] = UX
                etabs_results[i]['UY'] = UY
                etabs_results[i]['RZ'] = RZ
    else:
        pf("    No hay datos de masas participantes en DatabaseTables")
        # Fallback al método tradicional
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
            Rz = result[13]

            pf(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'RZ%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
            pf("    " + "-" * 55)
            for i in range(min(12, n)):
                pf(f"    {i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{Rz[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")
                if i < len(etabs_results):
                    etabs_results[i]['UX'] = UX[i]
                    etabs_results[i]['UY'] = UY[i]
                    etabs_results[i]['RZ'] = Rz[i]
        else:
            pf("    No hay datos de masas participantes")

except Exception as e:
    pf(f"    [WARN] {e}")

# Guardar JSON
pf("\n[10] Guardando JSON...")
if etabs_results:
    output = {
        'model': filename,
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

pf("\n" + "=" * 70)
pf("COMPLETADO")
pf("=" * 70)
pf("\nNOTA: ETABS sigue abierto, puedes cerrar este script")
