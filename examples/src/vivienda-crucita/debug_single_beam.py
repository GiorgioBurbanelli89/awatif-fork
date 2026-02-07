# -*- coding: utf-8 -*-
"""
Debug: Compare single beam element between OpenSees and expected values
This isolates the stiffness/mass calculation from assembly issues
"""
import openseespy.opensees as ops
import math
import numpy as np

print("=" * 70)
print("DEBUG: Single Cantilever Beam - OpenSees vs Theory")
print("=" * 70)

# Properties (SI: Pa, kg, m)
fc = 210  # kg/cm2
E_kgcm2 = 15100 * math.sqrt(fc)  # kg/cm2
E = E_kgcm2 * 98066.5  # Pa
nu = 0.2
G = E / (2 * (1 + nu))
rho = 2400  # kg/m3

# Beam section 25x40 cm (b x h, width x height)
beam_b = 0.25  # width (in local y direction for horizontal beam)
beam_h = 0.40  # height (in local z direction for horizontal beam)

A = beam_b * beam_h

# CORRECT moment of inertia calculation:
# For cross-section with width b (in y) and height h (in z):
# Iy = integral of z^2 dA = b * h^3 / 12 (for bending in xz plane, vertical)
# Iz = integral of y^2 dA = h * b^3 / 12 (for bending in xy plane, horizontal)

Iy_correct = beam_b * beam_h**3 / 12  # = 0.001333 (LARGER - for vertical bending)
Iz_correct = beam_h * beam_b**3 / 12  # = 0.000521 (smaller - for horizontal bending)

# What the test code was using (SWAPPED!):
Iz_test = beam_b * beam_h**3 / 12  # = 0.001333 (labeled as Iz but should be Iy)
Iy_test = beam_h * beam_b**3 / 12  # = 0.000521 (labeled as Iy but should be Iz)

J = 0.141 * min(beam_b, beam_h)**4

print(f"\nMaterial Properties:")
print(f"  E = {E:.4e} Pa = {E/1e9:.2f} GPa")
print(f"  G = {G:.4e} Pa")
print(f"  rho = {rho} kg/m3")

print(f"\nSection Properties:")
print(f"  A = {A:.6f} m2")
print(f"  Iy_correct (for vertical bending) = {Iy_correct:.6e} m4")
print(f"  Iz_correct (for horizontal bending) = {Iz_correct:.6e} m4")
print(f"  J = {J:.6e} m4")

print(f"\nWhat test code uses (SWAPPED):")
print(f"  Iy_test = {Iy_test:.6e} m4 (should be Iz)")
print(f"  Iz_test = {Iz_test:.6e} m4 (should be Iy)")

# Cantilever beam along X-axis
L = 4.0  # length in meters
nodes = [
    [0.0, 0.0, 0.0],  # Fixed end
    [L, 0.0, 0.0]     # Free end
]

print(f"\nCantilever beam: L = {L} m, along X-axis")

# Analytical frequency of cantilever
# omega_n = beta_n^2 * sqrt(EI / (rho*A*L^4))
# For first mode: beta_1 * L = 1.875
beta1_L = 1.875
omega1_vertical = beta1_L**2 / L**2 * math.sqrt(E * Iy_correct / (rho * A))
f1_vertical = omega1_vertical / (2 * math.pi)
T1_vertical = 1 / f1_vertical

omega1_horizontal = beta1_L**2 / L**2 * math.sqrt(E * Iz_correct / (rho * A))
f1_horizontal = omega1_horizontal / (2 * math.pi)
T1_horizontal = 1 / f1_horizontal

print(f"\nAnalytical (continuous beam, 1st mode):")
print(f"  Vertical (using Iy={Iy_correct:.6e}): f = {f1_vertical:.3f} Hz, T = {T1_vertical:.4f} s")
print(f"  Horizontal (using Iz={Iz_correct:.6e}): f = {f1_horizontal:.3f} Hz, T = {T1_horizontal:.4f} s")

# OpenSees model with CORRECT properties
print("\n" + "=" * 70)
print("OpenSees with CORRECT Iy/Iz assignment:")
print("=" * 70)

ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

ops.node(1, 0.0, 0.0, 0.0)
ops.node(2, L, 0.0, 0.0)
ops.fix(1, 1, 1, 1, 1, 1, 1)

# vecxz = (0, 0, 1) for horizontal beam
# This makes local y point up (global Z direction for X-beam)
ops.geomTransf('Linear', 1, 0.0, 0.0, 1.0)

# elasticBeamColumn: A, E, G, J, Iy, Iz
# For X-beam with vecxz=(0,0,1):
#   local y = global Y, so Iy affects bending in xz plane... no wait
#   Actually for horizontal beam: local y = (0,0,1) x (1,0,0) = (0,1,0) = global Y
#   Hmm, let me recalculate...

# For X-beam (element along X):
#   local x = (1, 0, 0) = global X
#   With vecxz = (0, 0, 1):
#     local y = vecxz x local_x = (0,0,1) x (1,0,0) = (0,1,0) = global Y
#     local z = local_x x local_y = (1,0,0) x (0,1,0) = (0,0,1) = global Z
#
# So: local y = global Y, local z = global Z
# Bending about local y (= global Y, horizontal axis) -> displacement in z (vertical)
#   This uses Iy in the stiffness formula
# Bending about local z (= global Z, vertical axis) -> displacement in y (horizontal)
#   This uses Iz in the stiffness formula

# For our section oriented with h vertical:
#   Iy (bending about horizontal axis, vertical deflection) = b * h^3 / 12 = 0.001333 (LARGE)
#   Iz (bending about vertical axis, horizontal deflection) = h * b^3 / 12 = 0.000521 (small)

ops.element('elasticBeamColumn', 1, 1, 2, A, E, G, J, Iy_correct, Iz_correct, 1)

# Lumped mass at free end
mass = 0.5 * rho * A * L
ops.mass(2, mass, mass, mass, 0, 0, 0)

print(f"Lumped mass at node 2: {mass:.2f} kg")

eigenvalues = ops.eigen(6)

print(f"\nOpenSees CORRECT Results:")
print(f"{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
print("-" * 30)
for i, ev in enumerate(eigenvalues[:6]):
    if ev > 0:
        omega = math.sqrt(ev)
        freq = omega / (2 * math.pi)
        period = 1 / freq if freq > 0 else 0
        print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f}")
    else:
        print(f"{i+1:<6} {'N/A':<12} {'ev<0':<12}")

ops.wipe()

# OpenSees model with TEST (swapped) properties
print("\n" + "=" * 70)
print("OpenSees with SWAPPED Iy/Iz (as in original test):")
print("=" * 70)

ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

ops.node(1, 0.0, 0.0, 0.0)
ops.node(2, L, 0.0, 0.0)
ops.fix(1, 1, 1, 1, 1, 1, 1)

ops.geomTransf('Linear', 1, 0.0, 0.0, 1.0)

# Use the swapped values as in the test
ops.element('elasticBeamColumn', 1, 1, 2, A, E, G, J, Iy_test, Iz_test, 1)

mass = 0.5 * rho * A * L
ops.mass(2, mass, mass, mass, 0, 0, 0)

eigenvalues_swapped = ops.eigen(6)

print(f"\nOpenSees SWAPPED Results:")
print(f"{'Mode':<6} {'T (s)':<12} {'f (Hz)':<12}")
print("-" * 30)
for i, ev in enumerate(eigenvalues_swapped[:6]):
    if ev > 0:
        omega = math.sqrt(ev)
        freq = omega / (2 * math.pi)
        period = 1 / freq if freq > 0 else 0
        print(f"{i+1:<6} {period:<12.4f} {freq:<12.4f}")
    else:
        print(f"{i+1:<6} {'N/A':<12} {'ev<0':<12}")

ops.wipe()

# Summary
print("\n" + "=" * 70)
print("CONCLUSION:")
print("=" * 70)
print("""
The test_voladizo_3d.py has Iy and Iz SWAPPED!

In the test code:
  Iz_beam = beam_b * beam_h**3 / 12  # = 0.001333
  Iy_beam = beam_h * beam_b**3 / 12  # = 0.000521

But for a section with width b (in local y) and height h (in local z):
  Iy (for vertical bending) = b * h^3 / 12 = 0.001333  <-- SHOULD be Iy
  Iz (for horizontal bending) = h * b^3 / 12 = 0.000521 <-- SHOULD be Iz

The labels are SWAPPED. This means:
- OpenSees is using the SMALL value for vertical bending
- This makes the structure LESS stiff than it should be

For Awatif, we need to check if it has the same issue or a different one.
""")
