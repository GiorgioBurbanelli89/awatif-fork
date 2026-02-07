/**
 * Response Spectrum Analysis for Awatif FEM
 * ==========================================
 * Implements ASCE 7 style response spectrum analysis with CQC/SRSS modal combination.
 *
 * Author: Hekatan Project
 * Date: 2026-02-04
 */

#include <cmath>
#include <vector>
#include <cstdlib>
#include <algorithm>
#include <Eigen/Dense>

// Constants
const double PI = 3.14159265358979323846;
const double G_ACCEL = 9.81;  // m/s²

// ============================================================================
// DESIGN SPECTRUM FUNCTIONS
// ============================================================================

/**
 * ASCE 7-22 Design Response Spectrum
 * @param T - Period (seconds)
 * @param SDS - Design spectral acceleration at short periods (g)
 * @param SD1 - Design spectral acceleration at 1 second (g)
 * @param TL - Long-period transition period (seconds)
 * @return Sa - Spectral acceleration (g)
 */
double getSpectralAcceleration_ASCE7(double T, double SDS, double SD1, double TL) {
    double T0 = 0.2 * SD1 / SDS;
    double Ts = SD1 / SDS;

    if (T <= 0.0) {
        return SDS * 0.4;
    } else if (T <= T0) {
        return SDS * (0.4 + 0.6 * T / T0);
    } else if (T <= Ts) {
        return SDS;
    } else if (T <= TL) {
        return SD1 / T;
    } else {
        return SD1 * TL / (T * T);
    }
}

/**
 * Eurocode 8 Design Response Spectrum (Type 1, Ground Type B)
 * @param T - Period (seconds)
 * @param ag - Peak ground acceleration (g)
 * @param S - Soil factor (default 1.2 for Type B)
 * @return Sa - Spectral acceleration (g)
 */
double getSpectralAcceleration_EC8(double T, double ag, double S = 1.2) {
    // Type 1 spectrum, Ground Type B parameters
    double TB = 0.15;
    double TC = 0.50;
    double TD = 2.0;
    double eta = 1.0;  // Damping correction factor (5% damping)

    if (T <= 0.0) {
        return ag * S;
    } else if (T <= TB) {
        return ag * S * (1.0 + T / TB * (eta * 2.5 - 1.0));
    } else if (T <= TC) {
        return ag * S * eta * 2.5;
    } else if (T <= TD) {
        return ag * S * eta * 2.5 * (TC / T);
    } else {
        return ag * S * eta * 2.5 * (TC * TD / (T * T));
    }
}

/**
 * User-defined spectrum (linear interpolation)
 * @param T - Period to evaluate
 * @param periods - Array of periods
 * @param accelerations - Array of spectral accelerations (g)
 * @param numPoints - Number of points
 * @return Sa - Interpolated spectral acceleration (g)
 */
double getSpectralAcceleration_User(double T, double* periods, double* accelerations, int numPoints) {
    if (numPoints < 2) return 0.0;

    // Clamp to range
    if (T <= periods[0]) return accelerations[0];
    if (T >= periods[numPoints-1]) return accelerations[numPoints-1];

    // Linear interpolation
    for (int i = 0; i < numPoints - 1; i++) {
        if (T >= periods[i] && T <= periods[i+1]) {
            double ratio = (T - periods[i]) / (periods[i+1] - periods[i]);
            return accelerations[i] + ratio * (accelerations[i+1] - accelerations[i]);
        }
    }

    return accelerations[numPoints-1];
}

// ============================================================================
// MODAL COMBINATION METHODS
// ============================================================================

/**
 * SRSS - Square Root of Sum of Squares
 * Simple combination, good for well-separated modes
 * @param responses - Array of modal responses
 * @param numModes - Number of modes
 * @return Combined response
 */
double combineSRSS(double* responses, int numModes) {
    double sum = 0.0;
    for (int i = 0; i < numModes; i++) {
        sum += responses[i] * responses[i];
    }
    return std::sqrt(sum);
}

/**
 * CQC - Complete Quadratic Combination
 * Accounts for modal coupling, better for closely-spaced modes
 * @param responses - Array of modal responses
 * @param frequencies - Array of modal frequencies (Hz)
 * @param numModes - Number of modes
 * @param damping - Modal damping ratio (typically 0.05)
 * @return Combined response
 */
double combineCQC(double* responses, double* frequencies, int numModes, double damping) {
    double result = 0.0;

    for (int i = 0; i < numModes; i++) {
        for (int j = 0; j < numModes; j++) {
            // Calculate correlation coefficient rho_ij
            double wi = 2.0 * PI * frequencies[i];
            double wj = 2.0 * PI * frequencies[j];

            double beta = wj / wi;  // Frequency ratio
            double xi = damping;
            double xj = damping;

            // Der Kiureghian correlation coefficient
            double rho;
            if (std::abs(beta - 1.0) < 1e-10) {
                rho = 1.0;
            } else {
                double num = 8.0 * std::sqrt(xi * xj) * (xi + beta * xj) * std::pow(beta, 1.5);
                double den = std::pow(1.0 - beta * beta, 2.0) +
                             4.0 * xi * xj * beta * (1.0 + beta * beta) +
                             4.0 * (xi * xi + xj * xj) * beta * beta;
                rho = num / den;
            }

            result += rho * responses[i] * responses[j];
        }
    }

    return std::sqrt(std::abs(result));
}

/**
 * Absolute Sum (ABS) - Conservative combination
 * @param responses - Array of modal responses
 * @param numModes - Number of modes
 * @return Combined response
 */
double combineABS(double* responses, int numModes) {
    double sum = 0.0;
    for (int i = 0; i < numModes; i++) {
        sum += std::abs(responses[i]);
    }
    return sum;
}

// ============================================================================
// MAIN RESPONSE SPECTRUM FUNCTION
// ============================================================================

extern "C" {

/**
 * Response Spectrum Analysis
 *
 * @param numNodes - Number of nodes
 * @param numModes - Number of modes to consider
 * @param numDOFsPerNode - DOFs per node (typically 6)
 *
 * @param frequencies - Modal frequencies [numModes] (Hz)
 * @param modeShapes - Mode shapes [numModes * numNodes * numDOFsPerNode]
 * @param massParticipation - Mass participation [numModes * 6] (UX,UY,UZ,RX,RY,RZ per mode)
 * @param nodalMasses - Nodal masses [numNodes * 6] (Mx,My,Mz,Ixx,Iyy,Izz per node)
 *
 * @param spectrumType - 0=ASCE7, 1=EC8, 2=User-defined
 * @param SDS - Design spectral acceleration short period (g) - for ASCE7
 * @param SD1 - Design spectral acceleration 1 second (g) - for ASCE7
 * @param TL - Long period transition (s) - for ASCE7
 * @param ag - Peak ground acceleration (g) - for EC8
 * @param userPeriods - User-defined periods array
 * @param userAccels - User-defined accelerations array
 * @param numUserPoints - Number of user-defined points
 *
 * @param direction - Excitation direction: 0=X, 1=Y, 2=Z
 * @param combinationType - 0=SRSS, 1=CQC, 2=ABS
 * @param damping - Modal damping ratio (typically 0.05)
 * @param scaleFactor - Scale factor (typically 9.81 to convert g to m/s²)
 *
 * @param outputDisplacements - Output: Combined displacements [numNodes * numDOFsPerNode]
 * @param outputForces - Output: Equivalent static forces [numNodes * numDOFsPerNode]
 * @param outputBaseShear - Output: Base shear [3] (Vx, Vy, Vz)
 * @param outputModalResponses - Output: Modal responses [numModes * numNodes * numDOFsPerNode]
 *
 * @return 0 on success, non-zero on error
 */
int responseSpectrum(
    int numNodes,
    int numModes,
    int numDOFsPerNode,

    double* frequencies,
    double* modeShapes,
    double* massParticipation,
    double* nodalMasses,

    int spectrumType,
    double SDS,
    double SD1,
    double TL,
    double ag,
    double* userPeriods,
    double* userAccels,
    int numUserPoints,

    int direction,
    int combinationType,
    double damping,
    double scaleFactor,

    double** outputDisplacements,
    double** outputForces,
    double** outputBaseShear,
    double** outputModalResponses
) {
    int totalDOFs = numNodes * numDOFsPerNode;

    // ========== ALLOCATE OUTPUT MEMORY ==========
    *outputDisplacements = (double*)malloc(totalDOFs * sizeof(double));
    *outputForces = (double*)malloc(totalDOFs * sizeof(double));
    *outputBaseShear = (double*)malloc(3 * sizeof(double));
    *outputModalResponses = (double*)malloc(numModes * totalDOFs * sizeof(double));

    if (!*outputDisplacements || !*outputForces || !*outputBaseShear || !*outputModalResponses) {
        return -1;  // Memory allocation failed
    }

    // Initialize outputs to zero
    std::fill(*outputDisplacements, *outputDisplacements + totalDOFs, 0.0);
    std::fill(*outputForces, *outputForces + totalDOFs, 0.0);
    std::fill(*outputBaseShear, *outputBaseShear + 3, 0.0);
    std::fill(*outputModalResponses, *outputModalResponses + numModes * totalDOFs, 0.0);

    // ========== CALCULATE MODAL RESPONSES ==========

    // Temporary storage for modal responses at each DOF
    std::vector<std::vector<double>> modalDisp(totalDOFs, std::vector<double>(numModes, 0.0));
    std::vector<std::vector<double>> modalForce(totalDOFs, std::vector<double>(numModes, 0.0));
    std::vector<double> modalBaseShearX(numModes, 0.0);
    std::vector<double> modalBaseShearY(numModes, 0.0);
    std::vector<double> modalBaseShearZ(numModes, 0.0);

    // Calculate total mass
    double totalMass = 0.0;
    for (int n = 0; n < numNodes; n++) {
        totalMass += nodalMasses[n * numDOFsPerNode + direction];
    }
    if (totalMass < 1e-10) totalMass = 1.0;  // Avoid division by zero

    for (int m = 0; m < numModes; m++) {
        // Get period and spectral acceleration
        double freq = frequencies[m];
        double period = (freq > 1e-10) ? 1.0 / freq : 100.0;  // Avoid div by zero

        double Sa;
        switch (spectrumType) {
            case 0:  // ASCE 7
                Sa = getSpectralAcceleration_ASCE7(period, SDS, SD1, TL);
                break;
            case 1:  // Eurocode 8
                Sa = getSpectralAcceleration_EC8(period, ag);
                break;
            case 2:  // User-defined
                Sa = getSpectralAcceleration_User(period, userPeriods, userAccels, numUserPoints);
                break;
            default:
                Sa = SDS;  // Default to plateau
        }

        // Spectral displacement: Sd = Sa * T² / (4π²)
        double Sd = Sa * G_ACCEL * period * period / (4.0 * PI * PI);

        // Get modal participation factor for this direction
        // Gamma_n = (phi^T * M * r) / (phi^T * M * phi)
        // where r is influence vector (1 in excitation direction)
        double gamma = massParticipation[m * 6 + direction];  // Already calculated

        // Get mode shape for this mode
        double* phi = &modeShapes[m * totalDOFs];

        // Modal response: u_n = Gamma_n * Sd * phi_n
        for (int dof = 0; dof < totalDOFs; dof++) {
            double u_modal = gamma * Sd * phi[dof] * scaleFactor / G_ACCEL;
            modalDisp[dof][m] = u_modal;

            // Store in output array
            (*outputModalResponses)[m * totalDOFs + dof] = u_modal;
        }

        // Modal equivalent static force: F_n = Gamma_n * Sa * M * phi_n
        for (int n = 0; n < numNodes; n++) {
            for (int d = 0; d < numDOFsPerNode; d++) {
                int dof = n * numDOFsPerNode + d;
                double mass = nodalMasses[n * numDOFsPerNode + d];
                double F_modal = gamma * Sa * scaleFactor * mass * phi[dof];
                modalForce[dof][m] = F_modal;
            }
        }

        // Modal base shear: V_n = sum(F_n)
        double Vx = 0.0, Vy = 0.0, Vz = 0.0;
        for (int n = 0; n < numNodes; n++) {
            Vx += modalForce[n * numDOFsPerNode + 0][m];
            Vy += modalForce[n * numDOFsPerNode + 1][m];
            Vz += modalForce[n * numDOFsPerNode + 2][m];
        }
        modalBaseShearX[m] = Vx;
        modalBaseShearY[m] = Vy;
        modalBaseShearZ[m] = Vz;
    }

    // ========== COMBINE MODAL RESPONSES ==========

    std::vector<double> freqArray(frequencies, frequencies + numModes);

    for (int dof = 0; dof < totalDOFs; dof++) {
        std::vector<double> respDisp(numModes);
        std::vector<double> respForce(numModes);

        for (int m = 0; m < numModes; m++) {
            respDisp[m] = modalDisp[dof][m];
            respForce[m] = modalForce[dof][m];
        }

        double combinedDisp, combinedForce;

        switch (combinationType) {
            case 0:  // SRSS
                combinedDisp = combineSRSS(respDisp.data(), numModes);
                combinedForce = combineSRSS(respForce.data(), numModes);
                break;
            case 1:  // CQC
                combinedDisp = combineCQC(respDisp.data(), freqArray.data(), numModes, damping);
                combinedForce = combineCQC(respForce.data(), freqArray.data(), numModes, damping);
                break;
            case 2:  // ABS
                combinedDisp = combineABS(respDisp.data(), numModes);
                combinedForce = combineABS(respForce.data(), numModes);
                break;
            default:
                combinedDisp = combineSRSS(respDisp.data(), numModes);
                combinedForce = combineSRSS(respForce.data(), numModes);
        }

        (*outputDisplacements)[dof] = combinedDisp;
        (*outputForces)[dof] = combinedForce;
    }

    // Combine base shear
    switch (combinationType) {
        case 0:  // SRSS
            (*outputBaseShear)[0] = combineSRSS(modalBaseShearX.data(), numModes);
            (*outputBaseShear)[1] = combineSRSS(modalBaseShearY.data(), numModes);
            (*outputBaseShear)[2] = combineSRSS(modalBaseShearZ.data(), numModes);
            break;
        case 1:  // CQC
            (*outputBaseShear)[0] = combineCQC(modalBaseShearX.data(), freqArray.data(), numModes, damping);
            (*outputBaseShear)[1] = combineCQC(modalBaseShearY.data(), freqArray.data(), numModes, damping);
            (*outputBaseShear)[2] = combineCQC(modalBaseShearZ.data(), freqArray.data(), numModes, damping);
            break;
        case 2:  // ABS
            (*outputBaseShear)[0] = combineABS(modalBaseShearX.data(), numModes);
            (*outputBaseShear)[1] = combineABS(modalBaseShearY.data(), numModes);
            (*outputBaseShear)[2] = combineABS(modalBaseShearZ.data(), numModes);
            break;
        default:
            (*outputBaseShear)[0] = combineSRSS(modalBaseShearX.data(), numModes);
            (*outputBaseShear)[1] = combineSRSS(modalBaseShearY.data(), numModes);
            (*outputBaseShear)[2] = combineSRSS(modalBaseShearZ.data(), numModes);
    }

    return 0;  // Success
}

}  // extern "C"
