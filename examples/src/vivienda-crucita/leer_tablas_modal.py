# -*- coding: utf-8 -*-
"""
Leer tablas modales de ETABS usando DatabaseTables API
Requiere: ETABS abierto con modelo y análisis modal ejecutado
"""
import json
import comtypes.client

print("=" * 60)
print("LEER TABLAS MODALES - ETABS")
print("=" * 60)

# Conectar a ETABS existente
try:
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)

    myETABSObject = helper.GetObject("CSI.ETABS.API.ETABSObject")
    SapModel = myETABSObject.SapModel

    nombre = SapModel.GetModelFilename()
    print(f"[OK] Conectado - Modelo: {nombre}")

except Exception as e:
    print(f"[ERROR] {e}")
    print("\nAsegurate de tener ETABS abierto con un modelo cargado")
    exit(1)

if not nombre:
    print("[ERROR] No hay modelo abierto en ETABS")
    exit(1)

# =============================================================================
# LEER TABLA: Modal Participating Mass Ratios
# =============================================================================
print("\n--- Modal Participating Mass Ratios ---")

try:
    result = SapModel.DatabaseTables.GetTableForDisplayArray(
        "Modal Participating Mass Ratios", GroupName=""
    )

    n_rows = result[3]
    print(f"Filas: {n_rows}")

    if n_rows > 0:
        cols = result[2]
        data = result[4]
        n_cols = len(cols)

        print(f"Columnas: {cols}")

        # Crear lista de resultados
        etabs_results = []

        print(f"\n{'Modo':<6}{'T(s)':<10}{'f(Hz)':<10}{'UX%':<8}{'UY%':<8}{'RZ%':<8}")
        print("-" * 50)

        for row in range(n_rows):
            row_data = [data[row * n_cols + i] for i in range(n_cols)]

            try:
                mode = int(float(row_data[1])) if row_data[1] else row + 1
                T = float(row_data[2]) if row_data[2] else 0
                f = 1/T if T > 0 else 0
                UX = float(row_data[3]) * 100 if row_data[3] else 0
                UY = float(row_data[4]) * 100 if row_data[4] else 0
                RZ = float(row_data[11]) * 100 if len(row_data) > 11 and row_data[11] else 0

                print(f"{mode:<6}{T:<10.4f}{f:<10.2f}{UX:<8.1f}{UY:<8.1f}{RZ:<8.1f}")

                etabs_results.append({
                    'mode': mode,
                    'T': T,
                    'f': f,
                    'UX': UX,
                    'UY': UY,
                    'RZ': RZ
                })

            except Exception as e:
                print(f"  [WARN] Error en fila {row}: {e}")

        # Guardar
        with open('sra_silvia_modal_etabs.json', 'w') as f:
            json.dump({'etabs_results': etabs_results}, f, indent=2)
        print(f"\n[OK] Guardado en sra_silvia_modal_etabs.json")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()

# =============================================================================
# LEER TABLA: Modal Periods And Frequencies (alternativa)
# =============================================================================
print("\n--- Modal Periods And Frequencies ---")

try:
    result = SapModel.DatabaseTables.GetTableForDisplayArray(
        "Modal Periods And Frequencies", GroupName=""
    )

    n_rows = result[3]
    print(f"Filas: {n_rows}")

    if n_rows > 0:
        cols = result[2]
        data = result[4]
        n_cols = len(cols)

        print(f"Columnas: {cols}")
        print(f"\n{'Modo':<6}{'T(s)':<12}{'f(Hz)':<12}")
        print("-" * 35)

        for row in range(min(12, n_rows)):
            row_data = [data[row * n_cols + i] for i in range(n_cols)]
            print(f"  {row_data}")

except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 60)
