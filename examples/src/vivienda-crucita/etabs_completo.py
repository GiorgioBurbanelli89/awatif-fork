# -*- coding: utf-8 -*-
"""
Script completo para ETABS:
1. Abre nueva instancia
2. Abre modelo
3. Guarda modelo (requerido antes de analizar)
4. Ejecuta análisis modal
5. Extrae resultados via DatabaseTables
"""
import os
import sys
import json
import time
import comtypes.client

print("=" * 70)
print("ETABS - SCRIPT COMPLETO")
print("=" * 70)

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: No existe: {MODEL_PATH}")
    sys.exit(1)

print(f"Modelo: {MODEL_PATH}")

# =============================================================================
# 1. INICIAR ETABS
# =============================================================================
print("\n[1] Iniciando ETABS...")

helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

# Buscar ejecutable de ETABS
etabs_paths = [
    r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe",
    r"C:\Program Files\Computers and Structures\ETABS 21\ETABS.exe",
    r"C:\Program Files\Computers and Structures\ETABS 20\ETABS.exe",
    r"C:\Program Files\Computers and Structures\ETABS 19\ETABS.exe",
]

ProgramPath = None
for path in etabs_paths:
    if os.path.exists(path):
        ProgramPath = path
        break

if not ProgramPath:
    print("ERROR: No se encuentra instalacion de ETABS")
    sys.exit(1)

print(f"    Ejecutable: {ProgramPath}")

# Crear objeto ETABS
ETABSObject = helper.CreateObject(ProgramPath)
ETABSObject.ApplicationStart()

print("    Esperando inicio...")
time.sleep(5)

SapModel = ETABSObject.SapModel

# Inicializar modelo vacío primero
SapModel.InitializeNewModel()
time.sleep(1)
print("    [OK] ETABS iniciado")

# =============================================================================
# 2. ABRIR MODELO
# =============================================================================
print("\n[2] Abriendo modelo...")
print(f"    {MODEL_PATH}")

ret = SapModel.File.OpenFile(MODEL_PATH)
if ret != 0:
    print(f"    [WARN] OpenFile retorno: {ret}")
else:
    print("    [OK] Modelo abierto")

time.sleep(2)

# Verificar
filename = SapModel.GetModelFilename()
print(f"    Verificacion: {filename}")

# =============================================================================
# 3. GUARDAR MODELO (Requerido antes de analizar)
# =============================================================================
print("\n[3] Guardando modelo...")
ret = SapModel.File.Save(filename)
if ret == 0:
    print("    [OK] Modelo guardado")
else:
    print(f"    [WARN] Save retorno: {ret}")

time.sleep(1)

# =============================================================================
# 4. CONFIGURAR ANALISIS MODAL
# =============================================================================
print("\n[4] Configurando analisis modal...")

# Verificar casos existentes
ret = SapModel.LoadCases.GetNameList(0, [])
n_casos = ret[0]
casos = list(ret[1]) if n_casos > 0 else []
print(f"    Casos existentes: {casos}")

# Buscar o crear caso modal
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("    Creando caso MODAL...")
    SapModel.LoadCases.ModalEigen.SetCase("MODAL")
    modal_case = "MODAL"

# Configurar 12 modos
SapModel.LoadCases.ModalEigen.SetNumberModes(modal_case, 12, 1)
print(f"    [OK] Caso: {modal_case} (12 modos)")

# =============================================================================
# 5. EJECUTAR ANALISIS
# =============================================================================
print("\n[5] Ejecutando analisis...")

# Desactivar todos los casos excepto modal
SapModel.Analyze.SetRunCaseFlag("", False, True)
SapModel.Analyze.SetRunCaseFlag(modal_case, True)

# Guardar antes de analizar (importante!)
SapModel.File.Save(filename)
print("    Modelo guardado")

# Ejecutar
print("    Analizando...")
ret = SapModel.Analyze.RunAnalysis()
print(f"    RunAnalysis: ret={ret}")

time.sleep(3)

# =============================================================================
# 6. OBTENER RESULTADOS - METODO 1: Results API
# =============================================================================
print("\n" + "=" * 70)
print("[6] RESULTADOS MODALES - Results API")
print("=" * 70)

etabs_results = []

try:
    # Configurar salida
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    # Obtener periodos
    result = SapModel.Results.ModalPeriod(
        0, [], [], [], [], [], [], []
    )

    n_results = result[0]
    StepNum = result[3]
    Period = result[4]
    Frequency = result[5]

    print(f"\nModos encontrados: {n_results}")

    if n_results > 0:
        print(f"\n{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
        print("-" * 35)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            print(f"{mode:<6} {T:<12.4f} {f:<12.4f}")
            etabs_results.append({'mode': mode, 'T': T, 'f': f})

except Exception as e:
    print(f"[ERROR] Results API: {e}")

# =============================================================================
# 7. OBTENER RESULTADOS - METODO 2: DatabaseTables
# =============================================================================
if not etabs_results:
    print("\n" + "=" * 70)
    print("[7] RESULTADOS MODALES - DatabaseTables")
    print("=" * 70)

    try:
        result = SapModel.DatabaseTables.GetTableForDisplayArray(
            "Modal Participating Mass Ratios", GroupName=""
        )

        n_rows = result[3]
        print(f"Filas: {n_rows}")

        if n_rows > 0:
            cols = result[2]
            data = result[4]
            n_cols = len(cols) if cols else 0

            if n_cols > 0:
                print(f"Columnas: {cols}")

                for row in range(min(12, n_rows)):
                    row_data = [data[row * n_cols + i] for i in range(n_cols)]
                    try:
                        mode = int(float(row_data[1]))
                        T = float(row_data[2])
                        f = 1/T if T > 0 else 0
                        print(f"Mode {mode}: T={T:.4f}s, f={f:.4f}Hz")
                        etabs_results.append({'mode': mode, 'T': T, 'f': f})
                    except:
                        pass

    except Exception as e:
        print(f"[ERROR] DatabaseTables: {e}")

# =============================================================================
# 8. MASAS PARTICIPANTES
# =============================================================================
print("\n" + "=" * 70)
print("[8] MASAS PARTICIPANTES")
print("=" * 70)

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    result = SapModel.Results.ModalParticipatingMassRatios(
        0, [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
    )

    n = result[0]
    Period = result[4]
    UX = result[5]
    UY = result[6]
    SumUX = result[8]
    SumUY = result[9]
    RZ = result[13]

    if n > 0:
        print(f"\n{'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'RZ%':<8}{'SumUX':<8}{'SumUY':<8}")
        print("-" * 60)

        for i in range(min(12, n)):
            print(f"{i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{RZ[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")

except Exception as e:
    print(f"[WARN] {e}")

# =============================================================================
# 9. GUARDAR RESULTADOS
# =============================================================================
print("\n" + "=" * 70)
print("[9] GUARDANDO RESULTADOS")
print("=" * 70)

if etabs_results:
    output = {
        'model': 'sra silvia',
        'source': MODEL_PATH,
        'modal_case': modal_case,
        'etabs_results': etabs_results
    }

    with open('sra_silvia_modal_etabs.json', 'w') as f:
        json.dump(output, f, indent=2)
    print(f"[OK] Guardado en sra_silvia_modal_etabs.json")

    print("\nRESUMEN:")
    for r in etabs_results[:6]:
        print(f"  Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
else:
    print("[WARN] No se obtuvieron resultados modales")

print("\n" + "=" * 70)
print("[OK] SCRIPT COMPLETADO")
print("=" * 70)
