/**
 * Time History Analysis for Awatif FEM
 * =====================================
 * Solves the dynamic equation of motion using Newmark-β integration.
 *
 * M*ü + C*u̇ + K*u = F(t)
 *
 * Author: Hekatan Project
 * Date: 2026-02-04
 */

#include <cmath>
#include <vector>
#include <cstdlib>
#include <algorithm>
#include <Eigen/Dense>
#include <Eigen/Sparse>
#include <Eigen/SparseLU>

// Constants
const double PI = 3.14159265358979323846;

// ============================================================================
// NEWMARK-BETA INTEGRATION METHOD
// ============================================================================

/**
 * Newmark-β parameters for different methods:
 * - Average Acceleration (unconditionally stable): β=0.25, γ=0.5
 * - Linear Acceleration: β=1/6, γ=0.5
 * - Central Difference (explicit): β=0, γ=0.5
 */
struct NewmarkParams {
    double beta;   // Typically 0.25 for average acceleration
    double gamma;  // Typically 0.5 for no numerical damping
};

// ============================================================================
// RAYLEIGH DAMPING
// ============================================================================

/**
 * Rayleigh damping: C = α*M + β*K
 *
 * Given two target frequencies (f1, f2) and damping ratios (ξ1, ξ2):
 * α = 2*ω1*ω2*(ξ1*ω2 - ξ2*ω1) / (ω2² - ω1²)
 * β = 2*(ξ2*ω2 - ξ1*ω1) / (ω2² - ω1²)
 *
 * For equal damping ξ at both frequencies:
 * α = 2*ξ*ω1*ω2 / (ω1 + ω2)
 * β = 2*ξ / (ω1 + ω2)
 */
struct RayleighDamping {
    double alpha;  // Mass proportional coefficient
    double beta;   // Stiffness proportional coefficient
};

RayleighDamping calculateRayleighCoefficients(double f1, double f2, double xi1, double xi2) {
    double w1 = 2.0 * PI * f1;
    double w2 = 2.0 * PI * f2;

    double denom = w2 * w2 - w1 * w1;
    if (std::abs(denom) < 1e-10) {
        // Same frequency - use simplified formula
        double w = w1;
        return { 2.0 * xi1 * w, 0.0 };
    }

    double alpha = 2.0 * w1 * w2 * (xi1 * w2 - xi2 * w1) / denom;
    double beta = 2.0 * (xi2 * w2 - xi1 * w1) / denom;

    return { alpha, beta };
}

RayleighDamping calculateRayleighEqual(double f1, double f2, double xi) {
    double w1 = 2.0 * PI * f1;
    double w2 = 2.0 * PI * f2;

    double alpha = 2.0 * xi * w1 * w2 / (w1 + w2);
    double beta = 2.0 * xi / (w1 + w2);

    return { alpha, beta };
}

// ============================================================================
// MAIN TIME HISTORY FUNCTION
// ============================================================================

extern "C" {

/**
 * Time History Analysis using Newmark-β method
 *
 * @param numDOFs - Total number of degrees of freedom
 * @param numSteps - Number of time steps
 * @param dt - Time step size (seconds)
 *
 * @param M_data - Mass matrix (sparse triplet format: row, col, value)
 * @param M_nnz - Number of non-zeros in M
 * @param K_data - Stiffness matrix (sparse triplet format)
 * @param K_nnz - Number of non-zeros in K
 *
 * @param freeDOFs - Array of free (unconstrained) DOF indices
 * @param numFreeDOFs - Number of free DOFs
 *
 * @param groundAccel - Ground acceleration time history [numSteps]
 * @param direction - Direction of ground motion: 0=X, 1=Y, 2=Z
 * @param influenceVector - Influence vector [numDOFs] (typically mass*1 in direction)
 *
 * @param dampingType - 0=Rayleigh, 1=Modal
 * @param alpha - Rayleigh alpha (mass proportional)
 * @param beta_damp - Rayleigh beta (stiffness proportional)
 *
 * @param newmark_beta - Newmark β parameter (0.25 for average acceleration)
 * @param newmark_gamma - Newmark γ parameter (0.5 for no numerical damping)
 *
 * @param outputDisp - Output: Displacement history [numSteps * numDOFs]
 * @param outputVel - Output: Velocity history [numSteps * numDOFs]
 * @param outputAccel - Output: Acceleration history [numSteps * numDOFs]
 * @param outputBaseShear - Output: Base shear history [numSteps * 3]
 *
 * @return 0 on success, non-zero on error
 */
int timeHistory(
    int numDOFs,
    int numSteps,
    double dt,

    double* M_row,
    double* M_col,
    double* M_val,
    int M_nnz,

    double* K_row,
    double* K_col,
    double* K_val,
    int K_nnz,

    int* freeDOFs,
    int numFreeDOFs,

    double* groundAccel,
    int direction,
    double* influenceVector,

    int dampingType,
    double alpha,
    double beta_damp,

    double newmark_beta,
    double newmark_gamma,

    double** outputDisp,
    double** outputVel,
    double** outputAccel,
    double** outputBaseShear
) {
    using namespace Eigen;

    // ========== BUILD MATRICES ==========

    // Full matrices
    SparseMatrix<double> M_full(numDOFs, numDOFs);
    SparseMatrix<double> K_full(numDOFs, numDOFs);

    std::vector<Triplet<double>> M_triplets, K_triplets;

    for (int i = 0; i < M_nnz; i++) {
        int row = static_cast<int>(M_row[i]);
        int col = static_cast<int>(M_col[i]);
        M_triplets.push_back(Triplet<double>(row, col, M_val[i]));
    }

    for (int i = 0; i < K_nnz; i++) {
        int row = static_cast<int>(K_row[i]);
        int col = static_cast<int>(K_col[i]);
        K_triplets.push_back(Triplet<double>(row, col, K_val[i]));
    }

    M_full.setFromTriplets(M_triplets.begin(), M_triplets.end());
    K_full.setFromTriplets(K_triplets.begin(), K_triplets.end());

    // ========== DAMPING MATRIX ==========

    // Rayleigh damping: C = α*M + β*K
    SparseMatrix<double> C_full = alpha * M_full + beta_damp * K_full;

    // ========== REDUCE TO FREE DOFS ==========

    // Create mapping
    std::vector<int> dofMap(numDOFs, -1);
    for (int i = 0; i < numFreeDOFs; i++) {
        dofMap[freeDOFs[i]] = i;
    }

    // Extract reduced matrices
    SparseMatrix<double> M(numFreeDOFs, numFreeDOFs);
    SparseMatrix<double> K(numFreeDOFs, numFreeDOFs);
    SparseMatrix<double> C(numFreeDOFs, numFreeDOFs);

    std::vector<Triplet<double>> M_red, K_red, C_red;

    for (int k = 0; k < M_full.outerSize(); ++k) {
        for (SparseMatrix<double>::InnerIterator it(M_full, k); it; ++it) {
            int i = dofMap[it.row()];
            int j = dofMap[it.col()];
            if (i >= 0 && j >= 0) {
                M_red.push_back(Triplet<double>(i, j, it.value()));
            }
        }
    }

    for (int k = 0; k < K_full.outerSize(); ++k) {
        for (SparseMatrix<double>::InnerIterator it(K_full, k); it; ++it) {
            int i = dofMap[it.row()];
            int j = dofMap[it.col()];
            if (i >= 0 && j >= 0) {
                K_red.push_back(Triplet<double>(i, j, it.value()));
            }
        }
    }

    for (int k = 0; k < C_full.outerSize(); ++k) {
        for (SparseMatrix<double>::InnerIterator it(C_full, k); it; ++it) {
            int i = dofMap[it.row()];
            int j = dofMap[it.col()];
            if (i >= 0 && j >= 0) {
                C_red.push_back(Triplet<double>(i, j, it.value()));
            }
        }
    }

    M.setFromTriplets(M_red.begin(), M_red.end());
    K.setFromTriplets(K_red.begin(), K_red.end());
    C.setFromTriplets(C_red.begin(), C_red.end());

    // Influence vector (reduced)
    VectorXd r(numFreeDOFs);
    for (int i = 0; i < numFreeDOFs; i++) {
        r(i) = influenceVector[freeDOFs[i]];
    }

    // ========== NEWMARK-BETA INTEGRATION ==========

    // Newmark constants
    double a0 = 1.0 / (newmark_beta * dt * dt);
    double a1 = newmark_gamma / (newmark_beta * dt);
    double a2 = 1.0 / (newmark_beta * dt);
    double a3 = 1.0 / (2.0 * newmark_beta) - 1.0;
    double a4 = newmark_gamma / newmark_beta - 1.0;
    double a5 = dt * (newmark_gamma / (2.0 * newmark_beta) - 1.0);
    double a6 = dt * (1.0 - newmark_gamma);
    double a7 = newmark_gamma * dt;

    // Effective stiffness matrix: K_eff = K + a0*M + a1*C
    SparseMatrix<double> K_eff = K + a0 * M + a1 * C;

    // LU factorization
    SparseLU<SparseMatrix<double>> solver;
    solver.compute(K_eff);
    if (solver.info() != Success) {
        return -1;  // Factorization failed
    }

    // ========== ALLOCATE OUTPUT ==========

    *outputDisp = (double*)malloc(numSteps * numDOFs * sizeof(double));
    *outputVel = (double*)malloc(numSteps * numDOFs * sizeof(double));
    *outputAccel = (double*)malloc(numSteps * numDOFs * sizeof(double));
    *outputBaseShear = (double*)malloc(numSteps * 3 * sizeof(double));

    if (!*outputDisp || !*outputVel || !*outputAccel || !*outputBaseShear) {
        return -2;  // Memory allocation failed
    }

    std::fill(*outputDisp, *outputDisp + numSteps * numDOFs, 0.0);
    std::fill(*outputVel, *outputVel + numSteps * numDOFs, 0.0);
    std::fill(*outputAccel, *outputAccel + numSteps * numDOFs, 0.0);
    std::fill(*outputBaseShear, *outputBaseShear + numSteps * 3, 0.0);

    // ========== INITIAL CONDITIONS ==========

    VectorXd u = VectorXd::Zero(numFreeDOFs);      // Displacement
    VectorXd v = VectorXd::Zero(numFreeDOFs);      // Velocity
    VectorXd a = VectorXd::Zero(numFreeDOFs);      // Acceleration

    // Initial acceleration: M*a0 = F0 - C*v0 - K*u0
    // For zero initial conditions with ground motion:
    // a0 = -M^(-1) * M * r * ag(0) = -r * ag(0)
    // But we'll compute it properly
    VectorXd F0 = -M * r * groundAccel[0];
    // Solve M*a = F0 (simplified for diagonal M)
    for (int i = 0; i < numFreeDOFs; i++) {
        double m_ii = M.coeff(i, i);
        if (m_ii > 1e-10) {
            a(i) = F0(i) / m_ii;
        }
    }

    // ========== TIME STEPPING ==========

    for (int step = 0; step < numSteps; step++) {
        // Store current state to output (expand to full DOFs)
        for (int i = 0; i < numFreeDOFs; i++) {
            int fullDOF = freeDOFs[i];
            (*outputDisp)[step * numDOFs + fullDOF] = u(i);
            (*outputVel)[step * numDOFs + fullDOF] = v(i);
            (*outputAccel)[step * numDOFs + fullDOF] = a(i);
        }

        // Calculate base shear: V = K*u + C*v - M*(a + r*ag)
        // Simplified: sum of restoring forces
        VectorXd Ku = K * u;
        double Vx = 0, Vy = 0, Vz = 0;
        for (int i = 0; i < numFreeDOFs; i++) {
            int fullDOF = freeDOFs[i];
            int localDir = fullDOF % 6;
            if (localDir == 0) Vx += Ku(i);
            else if (localDir == 1) Vy += Ku(i);
            else if (localDir == 2) Vz += Ku(i);
        }
        (*outputBaseShear)[step * 3 + 0] = Vx;
        (*outputBaseShear)[step * 3 + 1] = Vy;
        (*outputBaseShear)[step * 3 + 2] = Vz;

        if (step >= numSteps - 1) break;

        // Effective force at next step
        double ag_next = groundAccel[step + 1];
        VectorXd F_next = -M * r * ag_next;

        // Effective force
        VectorXd F_eff = F_next + M * (a0 * u + a2 * v + a3 * a) +
                                  C * (a1 * u + a4 * v + a5 * a);

        // Solve for new displacement
        VectorXd u_new = solver.solve(F_eff);

        // Update velocity and acceleration
        VectorXd a_new = a0 * (u_new - u) - a2 * v - a3 * a;
        VectorXd v_new = v + a6 * a + a7 * a_new;

        // Update state
        u = u_new;
        v = v_new;
        a = a_new;
    }

    return 0;  // Success
}

/**
 * Calculate peak response from time history
 */
void getPeakResponse(
    double* history,
    int numSteps,
    int numDOFs,
    double* peakPositive,
    double* peakNegative,
    double* peakAbsolute
) {
    for (int dof = 0; dof < numDOFs; dof++) {
        double maxPos = 0, maxNeg = 0;
        for (int step = 0; step < numSteps; step++) {
            double val = history[step * numDOFs + dof];
            if (val > maxPos) maxPos = val;
            if (val < maxNeg) maxNeg = val;
        }
        peakPositive[dof] = maxPos;
        peakNegative[dof] = maxNeg;
        peakAbsolute[dof] = std::max(std::abs(maxPos), std::abs(maxNeg));
    }
}

}  // extern "C"
