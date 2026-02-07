# -*- coding: utf-8 -*-
"""
Leer resultados modales de un modelo YA ABIERTO en ETABS
Asume que el usuario ya tiene abierto sra silvia.EDB en ETABS
"""
import json
import comtypes.client

print("=" * 70)
print("LEER MODAL - MODELO EXISTENTE EN ETABS")
print("=" * 70)
print("\nNOTA: Asegurate de tener el modelo 'sra silvia.EDB' abierto en ETABS")
print("      y haber corrido el analisis modal antes de ejecutar este script.\n")

# =============================================================================
# CONECTAR A ETABS EXISTENTE
# =============================================================================
try:
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
    SapModel = myETABSObject.SapModel

    # Verificar conexion
    filename = SapModel.GetModelFilename()
    print(f"[OK] Conectado a ETABS")
    print(f"     Modelo: {filename}")

except Exception as e:
    print(f"[ERROR] No se puede conectar a ETABS: {e}")
    print("\nAsegurate de que ETABS este abierto con un modelo cargado.")
    exit(1)

# =============================================================================
# OBTENER LISTA DE CASOS
# =============================================================================
print("\n--- CASOS DE CARGA ---")

ret = SapModel.LoadCases.GetNameList(0, [])
n_casos = ret[0]
casos = list(ret[1]) if n_casos > 0 else []
print(f"Casos: {casos}")

# Buscar caso modal
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        break

if not modal_case:
    print("[WARN] No se encontro caso MODAL")
    modal_case = "Modal"  # Intentar con nombre por defecto

print(f"Usando caso: {modal_case}")

# =============================================================================
# VERIFICAR ESTADO DEL ANALISIS
# =============================================================================
print("\n--- ESTADO DEL ANALISIS ---")

try:
    for caso in casos:
        ret = SapModel.Analyze.GetCaseStatus(caso)
        status = ret[0]
        status_text = {1: "No ejecutado", 2: "Ejecutando", 3: "Completado", 4: "Error"}
        print(f"  {caso}: {status_text.get(status, f'Status={status}')}")
except Exception as e:
    print(f"  [WARN] No se puede verificar estado: {e}")

# =============================================================================
# OBTENER RESULTADOS MODALES - METODO 1: Results API
# =============================================================================
print("\n" + "=" * 70)
print("RESULTADOS MODALES - Results API")
print("=" * 70)

etabs_results = []

try:
    # Configurar salida
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    # Periodos y frecuencias
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
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()

# =============================================================================
# OBTENER MASAS PARTICIPANTES
# =============================================================================
print("\n" + "=" * 70)
print("MASAS MODALES PARTICIPANTES")
print("=" * 70)

try:
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

    result = SapModel.Results.ModalParticipatingMassRatios(
        0, [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
    )

    n_results = result[0]
    Period = result[4]
    UX = result[5]
    UY = result[6]
    SumUX = result[8]
    SumUY = result[9]
    RZ = result[13]

    if n_results > 0:
        print(f"\n{'Mode':<6} {'T (s)':<10} {'UX %':<10} {'UY %':<10} {'RZ %':<10} {'SumUX':<10} {'SumUY':<10}")
        print("-" * 70)

        for i in range(min(12, n_results)):
            print(f"{i+1:<6} {Period[i]:<10.4f} {UX[i]*100:<10.2f} {UY[i]*100:<10.2f} {RZ[i]*100:<10.2f} {SumUX[i]*100:<10.2f} {SumUY[i]*100:<10.2f}")

except Exception as e:
    print(f"[ERROR] {e}")

# =============================================================================
# GUARDAR RESULTADOS
# =============================================================================
if etabs_results:
    output = {
        'model': 'sra silvia',
        'modal_case': modal_case,
        'etabs_results': etabs_results
    }

    with open('sra_silvia_modal_etabs.json', 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\n[OK] Resultados guardados en sra_silvia_modal_etabs.json")
else:
    print("\n[WARN] No se obtuvieron resultados modales")

print("\n" + "=" * 70)
