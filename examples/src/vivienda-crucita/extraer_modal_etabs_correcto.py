# -*- coding: utf-8 -*-
"""
Extraer resultados MODALES de sra silvia.EDB usando la API correcta
- Usa Results.Setup.SetCaseSelectedForOutput()
- Usa DatabaseTables como alternativa
"""
import os
import sys
import json
import comtypes.client

print("=" * 70)
print("EXTRACCION MODAL: sra silvia.EDB")
print("=" * 70)

MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: No se encuentra: {MODEL_PATH}")
    sys.exit(1)

# =============================================================================
# CONECTAR A ETABS
# =============================================================================
print("\nConectando a ETABS...")

import time

helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

# Intentar conectar a instancia existente
connected = False
try:
    myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
    SapModel = myETABSObject.SapModel
    # Verificar que realmente funciona
    try:
        units = SapModel.GetPresentUnits()
        if units == 0:
            # units=0 indica que no hay modelo activo
            print("[WARN] ETABS conectado pero sin modelo activo, inicializando...")
            SapModel.InitializeNewModel()
            connected = True
        else:
            print(f"[OK] Conectado a ETABS existente (units={units})")
            connected = True
    except:
        print("[WARN] Conexion existente no responde, creando nueva...")
except:
    print("[INFO] No hay instancia existente")

if not connected:
    # Crear nueva instancia
    ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe"
    if not os.path.exists(ProgramPath):
        ProgramPath = r"C:\Program Files\Computers and Structures\ETABS 20\ETABS.exe"

    if not os.path.exists(ProgramPath):
        print(f"ERROR: No se encuentra ETABS en {ProgramPath}")
        sys.exit(1)

    print(f"Iniciando ETABS desde: {ProgramPath}")
    myETABSObject = helper.CreateObject(ProgramPath)
    myETABSObject.ApplicationStart()

    # Esperar a que ETABS este listo
    time.sleep(3)

    SapModel = myETABSObject.SapModel
    SapModel.InitializeNewModel()
    print("[OK] Nueva instancia de ETABS iniciada")

# =============================================================================
# ABRIR MODELO
# =============================================================================
print(f"\nAbriendo modelo: {MODEL_PATH}")
ret = SapModel.File.OpenFile(MODEL_PATH)
if ret != 0:
    print(f"  [WARN] ret={ret} (puede que ya este abierto)")
else:
    print("  [OK] Modelo abierto")

# Unidades kN, m
SapModel.SetPresentUnits(6)

# =============================================================================
# VERIFICAR CASO MODAL
# =============================================================================
print("\n--- VERIFICANDO CASO MODAL ---")

# Listar casos de carga
ret = SapModel.LoadCases.GetNameList(0, [])
n_casos = ret[0]
casos = ret[1] if n_casos > 0 else []
print(f"Casos de carga: {casos}")

# Verificar si existe MODAL
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("  Creando caso MODAL...")
    SapModel.LoadCases.ModalEigen.SetCase("MODAL")
    SapModel.LoadCases.ModalEigen.SetNumberModes("MODAL", 12, 1)
    modal_case = "MODAL"
else:
    print(f"  Caso modal encontrado: {modal_case}")

# =============================================================================
# EJECUTAR ANALISIS
# =============================================================================
print("\n--- EJECUTANDO ANALISIS ---")

# Verificar estado del caso modal
try:
    ret = SapModel.Analyze.GetCaseStatus(modal_case)
    status = ret[0]
    status_text = {1: "No ejecutado", 2: "Ejecutando", 3: "Completado", 4: "Error"}
    print(f"  Estado de {modal_case}: {status_text.get(status, status)}")

    if status != 3:  # No completado
        print("  Ejecutando analisis...")
        SapModel.Analyze.SetRunCaseFlag("", False)  # Desactivar todos
        SapModel.Analyze.SetRunCaseFlag(modal_case, True)
        ret = SapModel.Analyze.RunAnalysis()
        print(f"  [OK] Analisis completado (ret={ret})")
except Exception as e:
    print(f"  [WARN] {e}")
    # Intentar correr de todos modos
    SapModel.Analyze.RunAnalysis()

# =============================================================================
# METODO 1: USAR Results API (CORRECTO)
# =============================================================================
print("\n" + "=" * 70)
print("METODO 1: Results API")
print("=" * 70)

try:
    # IMPORTANTE: Configurar salida de resultados PRIMERO
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
    print(f"  SetCaseSelectedForOutput({modal_case}): ret={ret}")

    # Ahora obtener resultados modales
    NumberResults = 0
    LoadCase = []
    StepType = []
    StepNum = []
    Period = []
    Frequency = []
    CircFreq = []
    EigenValue = []

    result = SapModel.Results.ModalPeriod(
        NumberResults, LoadCase, StepType, StepNum,
        Period, Frequency, CircFreq, EigenValue
    )

    NumberResults = result[0]
    LoadCase = result[1]
    StepNum = result[3]
    Period = result[4]
    Frequency = result[5]

    print(f"\n  Modos encontrados: {NumberResults}")

    if NumberResults > 0:
        print(f"\n  {'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
        print("  " + "-" * 35)

        etabs_results_api = []
        for i in range(min(12, NumberResults)):
            print(f"  {int(StepNum[i]):<6} {Period[i]:<12.4f} {Frequency[i]:<12.4f}")
            etabs_results_api.append({
                'mode': int(StepNum[i]),
                'T': Period[i],
                'f': Frequency[i]
            })
    else:
        print("  [WARN] No se obtuvieron resultados con Results API")
        etabs_results_api = []

except Exception as e:
    print(f"  [ERROR] {e}")
    etabs_results_api = []

# =============================================================================
# METODO 2: USAR DatabaseTables API
# =============================================================================
print("\n" + "=" * 70)
print("METODO 2: DatabaseTables API")
print("=" * 70)

etabs_results_tables = []

try:
    # Listar tablas disponibles que contengan "Modal"
    ret = SapModel.DatabaseTables.GetAvailableTables()
    tablas = ret[2]

    print("  Tablas modales disponibles:")
    for t in tablas:
        if 'Modal' in t:
            print(f"    - {t}")

    # Intentar leer tabla de periodos
    tabla_periodo = "Modal Periods And Frequencies"

    # Primero seleccionar el caso para output
    SapModel.DatabaseTables.SetLoadCasesSelectedForDisplay([modal_case])

    # Obtener tabla
    result = SapModel.DatabaseTables.GetTableForDisplayArray(
        tabla_periodo,  # TableKey
        "",             # FieldKeyList (vacio = todos)
        "",             # GroupName
        0,              # ObjectType (0 = all)
        0, [], [], 0, []  # Parametros de salida
    )

    n_cols = result[2]
    n_rows = result[3]
    cols = result[4]
    data = result[5]

    print(f"\n  Tabla: {tabla_periodo}")
    print(f"  Columnas: {n_cols}, Filas: {n_rows}")
    print(f"  Campos: {cols}")

    if n_rows > 0:
        # Parsear datos
        n_fields = len(cols)
        print(f"\n  {'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
        print("  " + "-" * 35)

        for row in range(n_rows):
            row_data = {}
            for col_idx, col_name in enumerate(cols):
                row_data[col_name] = data[row * n_fields + col_idx]

            mode = row_data.get('Mode', row_data.get('StepNum', row + 1))
            period = float(row_data.get('Period', 0))
            freq = float(row_data.get('Frequency', 0))

            if period > 0:
                print(f"  {mode:<6} {period:<12.4f} {freq:<12.4f}")
                etabs_results_tables.append({
                    'mode': mode,
                    'T': period,
                    'f': freq
                })

except Exception as e:
    print(f"  [ERROR] {e}")
    import traceback
    traceback.print_exc()

# =============================================================================
# METODO 3: Masas Modales Participantes
# =============================================================================
print("\n" + "=" * 70)
print("METODO 3: Masas Modales Participantes")
print("=" * 70)

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    result = SapModel.Results.ModalParticipatingMassRatios(
        0, [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
    )

    NumberResults = result[0]
    Period = result[4]
    UX = result[5]
    UY = result[6]
    UZ = result[7]
    SumUX = result[8]
    SumUY = result[9]
    RZ = result[13]
    SumRZ = result[14]

    print(f"  Modos: {NumberResults}")

    if NumberResults > 0:
        print(f"\n  {'Mode':<6} {'T (s)':<10} {'UX %':<10} {'UY %':<10} {'RZ %':<10} {'SumUX':<10} {'SumUY':<10}")
        print("  " + "-" * 70)

        for i in range(min(12, NumberResults)):
            print(f"  {i+1:<6} {Period[i]:<10.4f} {UX[i]*100:<10.2f} {UY[i]*100:<10.2f} {RZ[i]*100:<10.2f} {SumUX[i]*100:<10.2f} {SumUY[i]*100:<10.2f}")

except Exception as e:
    print(f"  [ERROR] {e}")

# =============================================================================
# GUARDAR RESULTADOS
# =============================================================================
print("\n" + "=" * 70)
print("GUARDANDO RESULTADOS")
print("=" * 70)

# Usar resultados de API o Tables (el que tenga datos)
etabs_results = etabs_results_api if etabs_results_api else etabs_results_tables

output_data = {
    'model': 'sra silvia',
    'source': MODEL_PATH,
    'modal_case': modal_case,
    'etabs_results': etabs_results,
    'method': 'Results.ModalPeriod' if etabs_results_api else 'DatabaseTables'
}

output_file = 'sra_silvia_modal_etabs.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)
print(f"[OK] Resultados guardados en {output_file}")

# =============================================================================
# RESUMEN
# =============================================================================
print("\n" + "=" * 70)
print("RESUMEN ETABS")
print("=" * 70)

if etabs_results:
    print(f"\n{'Mode':<6} {'T (s)':<15} {'f (Hz)':<15}")
    print("-" * 40)
    for r in etabs_results[:6]:
        print(f"{r['mode']:<6} {r['T']:<15.4f} {r['f']:<15.4f}")
else:
    print("\n[WARN] No se obtuvieron resultados modales")
    print("Posibles causas:")
    print("  1. El modelo no tiene caso MODAL definido")
    print("  2. El analisis no se ha ejecutado")
    print("  3. Hay errores en el modelo")

print("\n" + "=" * 70)
