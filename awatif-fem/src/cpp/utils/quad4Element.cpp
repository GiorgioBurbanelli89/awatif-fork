/**
 * Quad4 Element Implementation for Awatif-FEM
 *
 * 4-node isoparametric quadrilateral element with:
 * - Membrane behavior (in-plane: u, v, θz drilling)
 * - Plate bending behavior (out-of-plane: w, θx, θy) - Mindlin/Reissner
 *
 * Based on:
 * - CSI Analysis Reference Manual (Chapter 10: The Shell Element)
 * - Edward Wilson - Static and Dynamic Analysis of Structures
 * - Ing. Alexis Pompilla Yábar - Finite Element Course
 *
 * DOFs per node: 6 (u, v, w, θx, θy, θz)
 * Total DOFs: 24
 *
 * Integration: Gauss 2x2 (4 points)
 */

#include "../data-model.h"
#include <vector>
#include <cmath>
#include <array>
#include <Eigen/Dense>
#include <iostream>

// getMapValueOrDefault is now defined in data-model.h

// Gauss integration points and weights for 2x2 integration
namespace Quad4Gauss {
    const double gp = 1.0 / std::sqrt(3.0);  // ±0.577350269
    const std::array<double, 4> xi  = {-gp, gp, gp, -gp};
    const std::array<double, 4> eta = {-gp, -gp, gp, gp};
    const std::array<double, 4> w   = {1.0, 1.0, 1.0, 1.0};
}

/**
 * Shape functions for 4-node quadrilateral
 * N_i(ξ,η) = (1/4)(1 + ξ_i*ξ)(1 + η_i*η)
 */
std::array<double, 4> getQuad4ShapeFunctions(double xi, double eta) {
    return {
        0.25 * (1 - xi) * (1 - eta),  // N1
        0.25 * (1 + xi) * (1 - eta),  // N2
        0.25 * (1 + xi) * (1 + eta),  // N3
        0.25 * (1 - xi) * (1 + eta)   // N4
    };
}

/**
 * Shape function derivatives w.r.t. natural coordinates
 * dN/dξ and dN/dη
 */
struct ShapeFunctionDerivatives {
    std::array<double, 4> dNdxi;
    std::array<double, 4> dNdeta;
};

ShapeFunctionDerivatives getQuad4ShapeFunctionDerivatives(double xi, double eta) {
    ShapeFunctionDerivatives deriv;

    // dN/dξ
    deriv.dNdxi[0] = -0.25 * (1 - eta);
    deriv.dNdxi[1] =  0.25 * (1 - eta);
    deriv.dNdxi[2] =  0.25 * (1 + eta);
    deriv.dNdxi[3] = -0.25 * (1 + eta);

    // dN/dη
    deriv.dNdeta[0] = -0.25 * (1 - xi);
    deriv.dNdeta[1] = -0.25 * (1 + xi);
    deriv.dNdeta[2] =  0.25 * (1 + xi);
    deriv.dNdeta[3] =  0.25 * (1 - xi);

    return deriv;
}

/**
 * Jacobian matrix and its inverse
 */
struct JacobianResult {
    Eigen::Matrix2d J;
    Eigen::Matrix2d Jinv;
    double detJ;
    bool valid;
};

JacobianResult getQuad4Jacobian(
    const std::vector<Node>& nodes,
    double xi, double eta)
{
    JacobianResult result;
    result.valid = false;

    auto deriv = getQuad4ShapeFunctionDerivatives(xi, eta);

    // J = | dx/dξ  dy/dξ |
    //     | dx/dη  dy/dη |
    result.J = Eigen::Matrix2d::Zero();

    for (int i = 0; i < 4; i++) {
        result.J(0, 0) += deriv.dNdxi[i] * nodes[i][0];   // dx/dξ
        result.J(0, 1) += deriv.dNdxi[i] * nodes[i][1];   // dy/dξ
        result.J(1, 0) += deriv.dNdeta[i] * nodes[i][0];  // dx/dη
        result.J(1, 1) += deriv.dNdeta[i] * nodes[i][1];  // dy/dη
    }

    result.detJ = result.J.determinant();

    if (std::abs(result.detJ) < 1e-12) {
        std::cerr << "Warning: Zero or near-zero Jacobian determinant in Quad4 element." << std::endl;
        result.Jinv = Eigen::Matrix2d::Zero();
        return result;
    }

    result.Jinv = result.J.inverse();
    result.valid = true;

    return result;
}

/**
 * Shape function derivatives w.r.t. physical coordinates (x, y)
 */
struct PhysicalDerivatives {
    std::array<double, 4> dNdx;
    std::array<double, 4> dNdy;
};

PhysicalDerivatives getQuad4PhysicalDerivatives(
    const std::vector<Node>& nodes,
    double xi, double eta)
{
    PhysicalDerivatives phys;

    auto deriv = getQuad4ShapeFunctionDerivatives(xi, eta);
    auto jac = getQuad4Jacobian(nodes, xi, eta);

    if (!jac.valid) {
        std::fill(phys.dNdx.begin(), phys.dNdx.end(), 0.0);
        std::fill(phys.dNdy.begin(), phys.dNdy.end(), 0.0);
        return phys;
    }

    // [dN/dx]   [Jinv] * [dN/dξ]
    // [dN/dy] =         [dN/dη]
    for (int i = 0; i < 4; i++) {
        phys.dNdx[i] = jac.Jinv(0, 0) * deriv.dNdxi[i] + jac.Jinv(0, 1) * deriv.dNdeta[i];
        phys.dNdy[i] = jac.Jinv(1, 0) * deriv.dNdxi[i] + jac.Jinv(1, 1) * deriv.dNdeta[i];
    }

    return phys;
}

/**
 * B matrix for membrane behavior (3x8 for pure membrane, 3x12 with drilling)
 *
 * ε = | εxx  |   | ∂u/∂x      |
 *     | εyy  | = | ∂v/∂y      |
 *     | γxy  |   | ∂u/∂y+∂v/∂x|
 *
 * DOFs per node: u, v (with optional drilling θz)
 */
Eigen::MatrixXd getQuad4BMatrixMembrane(
    const std::vector<Node>& nodes,
    double xi, double eta)
{
    auto phys = getQuad4PhysicalDerivatives(nodes, xi, eta);

    // 3 strains x 8 DOFs (2 per node)
    Eigen::MatrixXd B = Eigen::MatrixXd::Zero(3, 8);

    for (int i = 0; i < 4; i++) {
        int col = 2 * i;

        // εxx = ∂u/∂x
        B(0, col) = phys.dNdx[i];

        // εyy = ∂v/∂y
        B(1, col + 1) = phys.dNdy[i];

        // γxy = ∂u/∂y + ∂v/∂x
        B(2, col) = phys.dNdy[i];
        B(2, col + 1) = phys.dNdx[i];
    }

    return B;
}

/**
 * B matrix for plate bending (Mindlin/Reissner formulation)
 *
 * κ = | κxx  |   | ∂θy/∂x          |
 *     | κyy  | = | -∂θx/∂y         |
 *     | κxy  |   | ∂θy/∂y - ∂θx/∂x |
 *
 * γ = | γxz |   | ∂w/∂x + θy |
 *     | γyz | = | ∂w/∂y - θx |
 *
 * DOFs per node: w, θx, θy
 */
struct Quad4PlateMatrices {
    Eigen::MatrixXd Bb;  // Bending: 3x12
    Eigen::MatrixXd Bs;  // Shear: 2x12
};

Quad4PlateMatrices getQuad4BMatrixPlate(
    const std::vector<Node>& nodes,
    double xi, double eta)
{
    Quad4PlateMatrices result;
    result.Bb = Eigen::MatrixXd::Zero(3, 12);
    result.Bs = Eigen::MatrixXd::Zero(2, 12);

    auto N = getQuad4ShapeFunctions(xi, eta);
    auto phys = getQuad4PhysicalDerivatives(nodes, xi, eta);

    for (int i = 0; i < 4; i++) {
        int col = 3 * i;  // Each node has 3 DOFs: w, θx, θy

        // Bending strains
        // κxx = ∂θy/∂x
        result.Bb(0, col + 2) = phys.dNdx[i];

        // κyy = -∂θx/∂y
        result.Bb(1, col + 1) = -phys.dNdy[i];

        // κxy = ∂θy/∂y - ∂θx/∂x
        result.Bb(2, col + 1) = -phys.dNdx[i];
        result.Bb(2, col + 2) = phys.dNdy[i];

        // Transverse shear strains (Mindlin/Reissner)
        // γxz = ∂w/∂x + θy
        result.Bs(0, col) = phys.dNdx[i];
        result.Bs(0, col + 2) = N[i];

        // γyz = ∂w/∂y - θx
        result.Bs(1, col) = phys.dNdy[i];
        result.Bs(1, col + 1) = -N[i];
    }

    return result;
}

/**
 * Constitutive matrices for isotropic material
 */
Eigen::Matrix3d getQuad4IsotropicDm(double E, double nu, double t) {
    // Membrane: plane stress
    double factor = E * t / (1 - nu * nu);
    Eigen::Matrix3d D;
    D << 1.0,  nu,  0.0,
         nu,  1.0,  0.0,
         0.0, 0.0, (1.0 - nu) / 2.0;
    return D * factor;
}

Eigen::Matrix3d getQuad4IsotropicDb(double E, double nu, double t) {
    // Bending
    double factor = E * t * t * t / (12.0 * (1 - nu * nu));
    Eigen::Matrix3d D;
    D << 1.0,  nu,  0.0,
         nu,  1.0,  0.0,
         0.0, 0.0, (1.0 - nu) / 2.0;
    return D * factor;
}

Eigen::Matrix2d getQuad4IsotropicDs(double E, double nu, double t) {
    // Shear (with shear correction factor 5/6)
    double k = 5.0 / 6.0;
    double G = E / (2.0 * (1.0 + nu));
    Eigen::Matrix2d D;
    D << k * G * t, 0.0,
         0.0, k * G * t;
    return D;
}

/**
 * Compute element area
 */
double getQuad4Area(const std::vector<Node>& nodes) {
    double area = 0.0;
    for (int i = 0; i < 4; i++) {
        area += Quad4Gauss::w[i] *
                getQuad4Jacobian(nodes, Quad4Gauss::xi[i], Quad4Gauss::eta[i]).detJ;
    }
    return area;
}

/**
 * Main function: Local stiffness matrix for Quad4 Shell element
 *
 * Combines membrane (8x8 or 12x12 with drilling) and plate (12x12) behaviors
 * into a full 24x24 shell stiffness matrix
 *
 * DOF ordering per node: [u, v, w, θx, θy, θz]
 * Global ordering: [node1_DOFs, node2_DOFs, node3_DOFs, node4_DOFs]
 */
Eigen::MatrixXd getLocalStiffnessMatrixQuad4(
    const std::vector<Node>& nodes,
    const ElementInputs& elementInputs,
    int index)
{
    if (nodes.size() != 4) {
        throw std::runtime_error("Quad4 element must have exactly 4 nodes.");
    }

    // Get material properties
    double E = getMapValueOrDefault(elementInputs.elasticities, index, 0.0);
    double nu = getMapValueOrDefault(elementInputs.poissonsRatios, index, 0.0);
    double t = getMapValueOrDefault(elementInputs.thicknesses, index, 0.0);

    if (E <= 0.0 || t <= 0.0) {
        std::cerr << "Warning: Invalid E or t for Quad4 element " << index << ". Returning zero matrix." << std::endl;
        return Eigen::MatrixXd::Zero(24, 24);
    }

    // Constitutive matrices
    Eigen::Matrix3d Dm = getQuad4IsotropicDm(E, nu, t);  // Membrane
    Eigen::Matrix3d Db = getQuad4IsotropicDb(E, nu, t);  // Bending
    Eigen::Matrix2d Ds = getQuad4IsotropicDs(E, nu, t);  // Shear

    // Initialize stiffness matrices
    Eigen::MatrixXd Km = Eigen::MatrixXd::Zero(8, 8);    // Membrane (u,v per node)
    Eigen::MatrixXd Kb = Eigen::MatrixXd::Zero(12, 12);  // Bending (w,θx,θy per node)
    Eigen::MatrixXd Ks = Eigen::MatrixXd::Zero(12, 12);  // Shear

    // Gauss 2x2 integration for membrane and bending
    for (int gp = 0; gp < 4; gp++) {
        double xi = Quad4Gauss::xi[gp];
        double eta = Quad4Gauss::eta[gp];
        double w = Quad4Gauss::w[gp];

        auto jac = getQuad4Jacobian(nodes, xi, eta);
        if (!jac.valid) continue;

        double dA = jac.detJ * w;

        // Membrane contribution (2x2 integration)
        Eigen::MatrixXd Bm = getQuad4BMatrixMembrane(nodes, xi, eta);
        Km += Bm.transpose() * Dm * Bm * dA;

        // Bending contribution (2x2 integration)
        auto plateB = getQuad4BMatrixPlate(nodes, xi, eta);
        Kb += plateB.Bb.transpose() * Db * plateB.Bb * dA;
    }

    // Reduced 1-point integration for shear (to avoid shear locking)
    // This is the standard Mindlin/Reissner formulation with selective reduced integration
    // For very thin plates (t/L < 0.05), results converge to Kirchhoff theory
    {
        auto jac = getQuad4Jacobian(nodes, 0.0, 0.0);
        if (jac.valid) {
            double dA = jac.detJ * 4.0;  // Weight for 1-point rule
            auto plateB = getQuad4BMatrixPlate(nodes, 0.0, 0.0);
            Ks += plateB.Bs.transpose() * Ds * plateB.Bs * dA;
        }
    }

    // Hourglass stabilization for plate bending
    // The hourglass mode is γ = [1, -1, 1, -1] (checkerboard pattern)
    // This adds artificial stiffness to resist zero-energy hourglass modes
    // Reference: Flanagan & Belytschko (1981), Cook et al. "Concepts and Applications of FEA"
    {
        double area = getQuad4Area(nodes);
        double L = std::sqrt(area);  // Characteristic length

        // Hourglass stabilization parameter (0.01-0.1 typical)
        // Using bending stiffness as reference: D = E*t³/12(1-ν²)
        double D_bend = E * t * t * t / (12.0 * (1.0 - nu * nu));
        double alpha_hg = 0.05;  // Stabilization factor
        double k_hg = alpha_hg * D_bend / (L * L);  // Hourglass stiffness

        // Hourglass mode vector for w DOF: γ = [1, -1, 1, -1]
        // Maps to plate DOF indices: w at 0, 3, 6, 9 (within 12-DOF plate system)
        Eigen::VectorXd gamma = Eigen::VectorXd::Zero(12);
        gamma(0) = 1.0;   // w1
        gamma(3) = -1.0;  // w2
        gamma(6) = 1.0;   // w3
        gamma(9) = -1.0;  // w4

        // Add hourglass stiffness: K_hg = k_hg * γ * γᵀ
        Ks += k_hg * gamma * gamma.transpose();
    }

    // Total plate stiffness
    Eigen::MatrixXd Kp = Kb + Ks;

    // Assemble into 24x24 matrix
    // DOF order per node: [u, v, w, θx, θy, θz]
    // Indices: u=0, v=1, w=2, θx=3, θy=4, θz=5
    Eigen::MatrixXd K = Eigen::MatrixXd::Zero(24, 24);

    // Membrane DOFs mapping: u_i->6*i, v_i->6*i+1
    std::array<int, 8> memDOFs = {0, 1, 6, 7, 12, 13, 18, 19};
    for (int i = 0; i < 8; i++) {
        for (int j = 0; j < 8; j++) {
            K(memDOFs[i], memDOFs[j]) += Km(i, j);
        }
    }

    // Plate DOFs mapping: w_i->6*i+2, θx_i->6*i+3, θy_i->6*i+4
    std::array<int, 12> plateDOFs = {2, 3, 4, 8, 9, 10, 14, 15, 16, 20, 21, 22};
    for (int i = 0; i < 12; i++) {
        for (int j = 0; j < 12; j++) {
            K(plateDOFs[i], plateDOFs[j]) += Kp(i, j);
        }
    }

    // Add small drilling stiffness for θz (to prevent singularity)
    // This follows CSI's approach
    double area = getQuad4Area(nodes);
    double drillingStiffness = 0.01 * E * t * area / 4.0;  // Small value per node
    for (int i = 0; i < 4; i++) {
        int dof = 6 * i + 5;  // θz DOF
        K(dof, dof) += drillingStiffness;
    }

    return K;
}

/**
 * Lumped mass matrix for Quad4 element (for modal analysis)
 *
 * Returns a vector of 24 diagonal mass values
 */
std::vector<double> getQuad4LumpedMass(
    const std::vector<Node>& nodes,
    double rho,
    double thickness)
{
    double area = getQuad4Area(nodes);
    double totalMass = rho * thickness * area;
    double massPerNode = totalMass / 4.0;

    // Rotational inertia (simplified)
    // Using I = m * (L^2) / 12 approximation where L is characteristic length
    double L = std::sqrt(area);
    double rotInertia = massPerNode * L * L / 12.0;

    std::vector<double> mass(24);
    for (int i = 0; i < 4; i++) {
        int base = 6 * i;
        mass[base + 0] = massPerNode;      // u (UX) - lateral mass
        mass[base + 1] = massPerNode;      // v (UY) - lateral mass
        mass[base + 2] = 0.0;              // w (UZ) - NO vertical mass (avoids spurious slab bending modes)
        mass[base + 3] = 0.0;              // θx - NO rotational inertia (slab acts as diaphragm)
        mass[base + 4] = 0.0;              // θy - NO rotational inertia
        mass[base + 5] = 0.0;              // θz - NO drilling rotation
    }

    return mass;
}
