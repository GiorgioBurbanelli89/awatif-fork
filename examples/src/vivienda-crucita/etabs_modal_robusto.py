# -*- coding: utf-8 -*-
"""
Script robusto para extraer resultados modales de ETABS
Intenta conectar a instancia existente, si no, crea una nueva
"""
import os
import sys
import json
import time

print("=" * 70)
print("ETABS MODAL - SCRIPT ROBUSTO")
print("=" * 70)

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: No existe: {MODEL_PATH}")
    sys.exit(1)

print(f"Modelo: {MODEL_PATH}")

# Importar comtypes
try:
    import comtypes.client
    print("[OK] comtypes importado")
except ImportError:
    print("ERROR: pip install comtypes")
    sys.exit(1)

# =============================================================================
# FUNCION: Conectar a ETABS
# =============================================================================
def conectar_etabs():
    """Conectar a ETABS existente o crear nueva instancia"""

    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    # Intentar conectar a instancia existente
    try:
        ETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
        SapModel = ETABSObject.SapModel

        # Verificar si hay modelo cargado
        filename = SapModel.GetModelFilename()
        if filename and filename != "":
            print(f"[OK] Conectado a ETABS con modelo: {filename}")
            return SapModel
        else:
            print("[INFO] ETABS abierto pero sin modelo")
            # Intentar abrir nuestro modelo
            print(f"[INFO] Abriendo modelo: {MODEL_PATH}")
            ret = SapModel.File.OpenFile(MODEL_PATH)
            if ret == 0:
                print("[OK] Modelo abierto")
                return SapModel
            else:
                print(f"[WARN] Error abriendo modelo: ret={ret}")

    except Exception as e:
        print(f"[INFO] No hay instancia existente: {e}")

    # Crear nueva instancia
    print("\n[INFO] Creando nueva instancia de ETABS...")

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

    print(f"[INFO] Usando: {ProgramPath}")

    # Crear objeto ETABS
    ETABSObject = helper.CreateObject(ProgramPath)
    ETABSObject.ApplicationStart()

    # Esperar a que ETABS inicie
    print("[INFO] Esperando inicio de ETABS...")
    time.sleep(5)

    SapModel = ETABSObject.SapModel

    # Inicializar modelo nuevo primero
    SapModel.InitializeNewModel()
    time.sleep(1)

    # Ahora abrir el archivo
    print(f"[INFO] Abriendo: {MODEL_PATH}")
    ret = SapModel.File.OpenFile(MODEL_PATH)
    if ret != 0:
        print(f"[WARN] OpenFile retorno: {ret}")

    time.sleep(2)
    print("[OK] ETABS listo")

    return SapModel


# =============================================================================
# MAIN
# =============================================================================
SapModel = conectar_etabs()

# Unidades kN, m
SapModel.SetPresentUnits(6)

# =============================================================================
# LISTAR CASOS
# =============================================================================
print("\n--- CASOS DE CARGA ---")

ret = SapModel.LoadCases.GetNameList(0, [])
n_casos = ret[0]
casos = list(ret[1]) if n_casos > 0 else []
print(f"Casos ({n_casos}): {casos}")

# Buscar caso modal
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("[INFO] Creando caso MODAL...")
    SapModel.LoadCases.ModalEigen.SetCase("MODAL")
    SapModel.LoadCases.ModalEigen.SetNumberModes("MODAL", 12, 1)
    modal_case = "MODAL"
else:
    print(f"[OK] Caso modal: {modal_case}")

# =============================================================================
# EJECUTAR ANALISIS SI ES NECESARIO
# =============================================================================
print("\n--- VERIFICAR ANALISIS ---")

try:
    ret = SapModel.Analyze.GetCaseStatus(modal_case)
    status = ret[0]
    status_text = {1: "No ejecutado", 2: "Ejecutando", 3: "Completado", 4: "Error"}
    print(f"  {modal_case}: {status_text.get(status, status)}")

    if status != 3:
        print("[INFO] Ejecutando analisis...")
        SapModel.Analyze.SetRunCaseFlag("", False)
        SapModel.Analyze.SetRunCaseFlag(modal_case, True)
        SapModel.Analyze.RunAnalysis()
        print("[OK] Analisis completado")
except Exception as e:
    print(f"[WARN] {e}")
    print("[INFO] Ejecutando analisis de todos modos...")
    SapModel.Analyze.RunAnalysis()

# =============================================================================
# OBTENER RESULTADOS MODALES
# =============================================================================
print("\n" + "=" * 70)
print("RESULTADOS MODALES")
print("=" * 70)

etabs_results = []

try:
    # IMPORTANTE: Configurar output
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
    print(f"SetCaseSelectedForOutput: ret={ret}")

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
# ALTERNATIVA: DatabaseTables
# =============================================================================
if not etabs_results:
    print("\n[INFO] Intentando con DatabaseTables...")

    try:
        # Listar tablas
        ret = SapModel.DatabaseTables.GetAvailableTables()
        tablas = ret[2]

        modal_tables = [t for t in tablas if 'Modal' in t]
        print(f"Tablas modales: {modal_tables}")

        # Intentar leer Modal Periods
        for tabla in ["Modal Periods And Frequencies", "Modal Period"]:
            if tabla in tablas:
                result = SapModel.DatabaseTables.GetTableForDisplayArray(
                    tabla, "", "", 0, 0, [], [], 0, []
                )
                n_rows = result[3]
                if n_rows > 0:
                    cols = result[4]
                    data = result[5]
                    n_cols = len(cols)

                    print(f"\nTabla: {tabla} ({n_rows} filas)")
                    print(f"Columnas: {cols}")

                    for row in range(min(12, n_rows)):
                        row_data = {cols[i]: data[row * n_cols + i] for i in range(n_cols)}
                        print(f"  {row_data}")

                        # Extraer datos
                        try:
                            mode = row_data.get('Mode', row_data.get('StepNum', row + 1))
                            T = float(row_data.get('Period', 0))
                            f = float(row_data.get('Frequency', 0))
                            if T > 0:
                                etabs_results.append({'mode': mode, 'T': T, 'f': f})
                        except:
                            pass
                    break

    except Exception as e:
        print(f"[ERROR] DatabaseTables: {e}")

# =============================================================================
# MASAS PARTICIPANTES
# =============================================================================
print("\n" + "=" * 70)
print("MASAS PARTICIPANTES")
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
        print(f"\n{'Mode':<6} {'T(s)':<10} {'UX%':<8} {'UY%':<8} {'RZ%':<8} {'SumUX':<8} {'SumUY':<8}")
        print("-" * 60)

        for i in range(min(12, n)):
            print(f"{i+1:<6} {Period[i]:<10.4f} {UX[i]*100:<8.1f} {UY[i]*100:<8.1f} {RZ[i]*100:<8.1f} {SumUX[i]*100:<8.1f} {SumUY[i]*100:<8.1f}")

except Exception as e:
    print(f"[WARN] Masas participantes: {e}")

# =============================================================================
# GUARDAR
# =============================================================================
print("\n" + "=" * 70)
print("GUARDANDO RESULTADOS")
print("=" * 70)

if etabs_results:
    output = {
        'model': 'sra silvia',
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
