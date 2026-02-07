# -*- coding: utf-8 -*-
"""
Buscar modelo abierto en cualquier instancia de ETABS
"""
import json
import comtypes.client
from comtypes import COMError

print("=" * 60)
print("BUSCAR MODELO EN ETABS")
print("=" * 60)

# Conectar usando diferentes métodos
helper = comtypes.client.CreateObject('ETABSv1.Helper')
helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

# Metodo 1: GetObject (conecta a instancia activa)
print("\n[1] Intentando GetObject...")
try:
    ETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
    SapModel = ETABSObject.SapModel
    filename = SapModel.GetModelFilename()
    print(f"    Modelo: {filename}")

    if filename and filename != "" and filename != "None":
        print("\n[OK] Modelo encontrado!")

        # Verificar unidades
        units = SapModel.GetPresentUnits()
        print(f"    Unidades: {units}")

        # Listar casos
        ret = SapModel.LoadCases.GetNameList(0, [])
        casos = list(ret[1]) if ret[0] > 0 else []
        print(f"    Casos: {casos}")

        # Buscar caso modal
        modal_case = None
        for caso in casos:
            if 'MODAL' in caso.upper():
                modal_case = caso
                break

        if modal_case:
            print(f"\n--- Resultados de {modal_case} ---")

            # Configurar salida
            SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
            SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)

            # Obtener periodos
            result = SapModel.Results.ModalPeriod(
                0, [], [], [], [], [], [], []
            )

            n = result[0]
            StepNum = result[3]
            Period = result[4]
            Frequency = result[5]

            print(f"    Modos: {n}")

            if n > 0:
                print(f"\n    {'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
                print("    " + "-" * 35)

                etabs_results = []
                for i in range(min(12, n)):
                    mode = int(StepNum[i]) if StepNum else i + 1
                    T = Period[i]
                    f = Frequency[i]
                    print(f"    {mode:<6} {T:<12.4f} {f:<12.4f}")
                    etabs_results.append({'mode': mode, 'T': T, 'f': f})

                # Guardar
                with open('sra_silvia_modal_etabs.json', 'w') as f:
                    json.dump({'etabs_results': etabs_results}, f, indent=2)
                print(f"\n[OK] Guardado en sra_silvia_modal_etabs.json")
            else:
                print("    [WARN] No hay resultados modales")
                print("    -> Ejecutar analisis modal en ETABS primero")
        else:
            print("\n[WARN] No hay caso MODAL en el modelo")
    else:
        print("    [INFO] Sin modelo activo")

except COMError as e:
    print(f"    [ERROR] COM: {e}")
except Exception as e:
    print(f"    [ERROR] {e}")

# Metodo 2: Intentar RunningInstance
print("\n[2] Intentando otras conexiones...")
try:
    # A veces GetActiveObject funciona mejor
    import win32com.client
    ETABSObject = win32com.client.GetObject(Class="CSI.ETABS.API.ETABSObject")
    SapModel = ETABSObject.SapModel
    filename = SapModel.GetModelFilename()
    print(f"    Modelo via GetObject: {filename}")
except ImportError:
    print("    [INFO] win32com no disponible")
except Exception as e:
    print(f"    [INFO] {e}")

print("\n" + "=" * 60)
print("NOTA: Si el modelo no aparece, cierra todas las instancias")
print("      de ETABS y abre solo el modelo que quieres analizar.")
print("=" * 60)
