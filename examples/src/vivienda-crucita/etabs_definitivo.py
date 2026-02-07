# -*- coding: utf-8 -*-
"""
ETABS DEFINITIVO - Secuencia correcta de guardado
REGLA: GUARDAR antes de CUALQUIER análisis o modificación

Secuencia:
1. Abrir modelo
2. GUARDAR inmediatamente
3. Si hay que modificar -> GUARDAR después
4. GUARDAR antes de analizar
5. Ejecutar análisis
6. Leer resultados
7. Cerrar sin diálogo
"""
import os
import sys
import json
import time
import comtypes.client

# ============================================================================
# CONFIGURACIÓN
# ============================================================================
MODEL_PATH = r"C:\Users\j-b-j\Documents\Calcpad-7.5.7\sra silvia.EDB"

print("=" * 70)
print("ETABS DEFINITIVO - GUARDADO CORRECTO")
print("=" * 70)

if not os.path.exists(MODEL_PATH):
    print(f"ERROR: No existe el modelo: {MODEL_PATH}")
    sys.exit(1)

print(f"Modelo: {MODEL_PATH}")

# ============================================================================
# 1. CONECTAR A ETABS
# ============================================================================
print("\n[1] Conectando a ETABS...")

try:
    helper = comtypes.client.CreateObject('ETABSv1.Helper')
    helper = helper.QueryInterface(comtypes.gen.ETABSv1.cHelper)
except:
    print("ERROR: No se puede crear helper de ETABS")
    sys.exit(1)

# Buscar ejecutable
etabs_paths = [
    r"C:\Program Files\Computers and Structures\ETABS 22\ETABS.exe",
    r"C:\Program Files\Computers and Structures\ETABS 21\ETABS.exe",
    r"C:\Program Files\Computers and Structures\ETABS 20\ETABS.exe",
]

ProgramPath = None
for path in etabs_paths:
    if os.path.exists(path):
        ProgramPath = path
        break

if not ProgramPath:
    print("ERROR: ETABS no encontrado")
    sys.exit(1)

print(f"    Ejecutable: {ProgramPath}")

# Crear instancia de ETABS
ETABSObject = helper.CreateObject(ProgramPath)
ret = ETABSObject.ApplicationStart()
print(f"    ApplicationStart: {ret}")

time.sleep(3)

SapModel = ETABSObject.SapModel

# ============================================================================
# 2. INICIALIZAR Y ABRIR MODELO
# ============================================================================
print("\n[2] Abriendo modelo...")

ret = SapModel.InitializeNewModel()
print(f"    InitializeNewModel: {ret}")

ret = SapModel.File.OpenFile(MODEL_PATH)
print(f"    OpenFile: {ret}")

time.sleep(2)

# ============================================================================
# 3. GUARDAR INMEDIATAMENTE DESPUÉS DE ABRIR (CRÍTICO!)
# ============================================================================
print("\n[3] GUARDANDO modelo (después de abrir)...")
ret = SapModel.File.Save(MODEL_PATH)
print(f"    Save: {ret}")
time.sleep(1)

# ============================================================================
# 4. VERIFICAR CASOS EXISTENTES
# ============================================================================
print("\n[4] Verificando casos de carga...")

ret = SapModel.LoadCases.GetNameList(0, [])
n_casos = ret[0]
casos = list(ret[1]) if n_casos > 0 else []
print(f"    Casos existentes ({n_casos}): {casos}")

# Buscar caso modal existente
modal_case = None
for caso in casos:
    if 'MODAL' in caso.upper():
        modal_case = caso
        print(f"    [OK] Caso modal encontrado: {modal_case}")
        break

# ============================================================================
# 5. CREAR CASO MODAL SI NO EXISTE
# ============================================================================
if not modal_case:
    print("\n[5] Creando caso MODAL...")
    ret = SapModel.LoadCases.ModalEigen.SetCase("MODAL")
    print(f"    SetCase: {ret}")
    modal_case = "MODAL"

    # GUARDAR INMEDIATAMENTE después de crear caso
    print("    GUARDANDO después de crear caso...")
    ret = SapModel.File.Save(MODEL_PATH)
    print(f"    Save: {ret}")
    time.sleep(1)
else:
    print("\n[5] Caso modal ya existe, no hay que crear")

# ============================================================================
# 6. CONFIGURAR MODOS
# ============================================================================
print("\n[6] Configurando modos...")
ret = SapModel.LoadCases.ModalEigen.SetNumberModes(modal_case, 12, 1)
print(f"    SetNumberModes (12 modos): {ret}")

# GUARDAR después de configurar
print("    GUARDANDO después de configurar modos...")
ret = SapModel.File.Save(MODEL_PATH)
print(f"    Save: {ret}")
time.sleep(1)

# ============================================================================
# 7. CONFIGURAR CASOS A EJECUTAR
# ============================================================================
print("\n[7] Configurando casos a ejecutar...")

# Desactivar todos los casos
ret = SapModel.Analyze.SetRunCaseFlag("", False, True)
print(f"    Desactivar todos: {ret}")

# Activar solo el caso modal
ret = SapModel.Analyze.SetRunCaseFlag(modal_case, True)
print(f"    Activar {modal_case}: {ret}")

# GUARDAR ANTES DE ANALIZAR (CRÍTICO!)
print("    GUARDANDO antes de analizar...")
ret = SapModel.File.Save(MODEL_PATH)
print(f"    Save: {ret}")
time.sleep(1)

# ============================================================================
# 8. EJECUTAR ANÁLISIS
# ============================================================================
print("\n[8] EJECUTANDO ANÁLISIS...")
print("    (El modelo YA está guardado, no debe aparecer diálogo)")

ret = SapModel.Analyze.RunAnalysis()
print(f"    RunAnalysis: {ret}")

# Esperar a que termine
time.sleep(3)

# ============================================================================
# 9. OBTENER RESULTADOS MODALES
# ============================================================================
print("\n[9] Obteniendo resultados modales...")

etabs_results = []

try:
    # Configurar salida
    SapModel.Results.Setup.DeselectAllCasesAndCombosForOutput()
    ret = SapModel.Results.Setup.SetCaseSelectedForOutput(modal_case)
    print(f"    SetCaseSelectedForOutput: {ret}")

    # Obtener periodos
    result = SapModel.Results.ModalPeriod(0, [], [], [], [], [], [], [])

    n_results = result[0]
    LoadCase = result[1]
    StepType = result[2]
    StepNum = result[3]
    Period = result[4]
    Frequency = result[5]
    CircFreq = result[6]
    EigenValue = result[7]

    print(f"\n    Modos encontrados: {n_results}")

    if n_results > 0:
        print(f"\n    {'Mode':<6}{'T (s)':<12}{'f (Hz)':<12}{'ω (rad/s)':<12}")
        print("    " + "-" * 45)

        for i in range(min(12, n_results)):
            mode = int(StepNum[i]) if StepNum else i + 1
            T = Period[i]
            f = Frequency[i]
            w = CircFreq[i] if CircFreq else 2 * 3.14159 * f

            print(f"    {mode:<6}{T:<12.4f}{f:<12.4f}{w:<12.4f}")

            etabs_results.append({
                'mode': mode,
                'T': T,
                'f': f,
                'omega': w
            })
    else:
        print("    [WARN] No hay resultados modales")

except Exception as e:
    print(f"    [ERROR] {e}")

# ============================================================================
# 10. OBTENER MASAS PARTICIPANTES
# ============================================================================
print("\n[10] Obteniendo masas participantes...")

try:
    result = SapModel.Results.ModalParticipatingMassRatios(
        0, [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
    )

    n = result[0]

    if n > 0:
        Period = result[4]
        UX = result[5]
        UY = result[6]
        UZ = result[7]
        SumUX = result[8]
        SumUY = result[9]
        RZ = result[13]

        print(f"\n    {'Mode':<6}{'T(s)':<10}{'UX%':<8}{'UY%':<8}{'RZ%':<8}{'ΣUX%':<8}{'ΣUY%':<8}")
        print("    " + "-" * 55)

        for i in range(min(12, n)):
            print(f"    {i+1:<6}{Period[i]:<10.4f}{UX[i]*100:<8.1f}{UY[i]*100:<8.1f}{RZ[i]*100:<8.1f}{SumUX[i]*100:<8.1f}{SumUY[i]*100:<8.1f}")

            # Agregar a resultados
            if i < len(etabs_results):
                etabs_results[i]['UX'] = UX[i]
                etabs_results[i]['UY'] = UY[i]
                etabs_results[i]['RZ'] = RZ[i]
                etabs_results[i]['SumUX'] = SumUX[i]
                etabs_results[i]['SumUY'] = SumUY[i]

except Exception as e:
    print(f"    [WARN] {e}")

# ============================================================================
# 11. GUARDAR RESULTADOS EN JSON
# ============================================================================
print("\n[11] Guardando resultados...")

if etabs_results:
    output = {
        'model': 'sra silvia',
        'source': MODEL_PATH,
        'modal_case': modal_case,
        'n_modes': len(etabs_results),
        'etabs_results': etabs_results
    }

    output_file = 'sra_silvia_modal_etabs.json'
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"    [OK] Guardado en {output_file}")

    print("\n    RESUMEN PRIMEROS 6 MODOS:")
    print("    " + "-" * 40)
    for r in etabs_results[:6]:
        print(f"    Mode {r['mode']}: T = {r['T']:.4f}s, f = {r['f']:.3f}Hz")
else:
    print("    [WARN] No hay resultados para guardar")

# ============================================================================
# 12. CERRAR ETABS (sin diálogo)
# ============================================================================
print("\n[12] Cerrando ETABS...")

# Guardar una última vez por si acaso
ret = SapModel.File.Save(MODEL_PATH)
print(f"    Save final: {ret}")

# Cerrar sin preguntar (False = no guardar cambios adicionales)
ETABSObject.ApplicationExit(False)
print("    [OK] ETABS cerrado")

print("\n" + "=" * 70)
print("SCRIPT COMPLETADO EXITOSAMENTE")
print("=" * 70)
