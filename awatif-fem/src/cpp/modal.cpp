/**
 * Modal Analysis for Awatif FEM
 * Solves the generalized eigenvalue problem: K*φ = ω²*M*φ
 * Returns natural frequencies and mode shapes
 *
 * Uses Eigen GeneralizedSelfAdjointEigenSolver (same pattern as deform.cpp)
 */

#include "data-model.h"
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <tuple>
#include <Eigen/Dense>
#include <Eigen/Sparse>
#include <iostream>
#include <cmath>

// External declarations from other files
extern Eigen::SparseMatrix<double> getGlobalStiffnessMatrix(
    const std::vector<Node> &nodes,
    const std::vector<unsigned int> &element_indices,
    const std::vector<unsigned int> &elementSizes,
    const ElementInputs &elementInputs,
    int dof);

// Helper to parse maps (same as deform.cpp)
template <typename K, typename V>
std::map<K, V> parseMapFromFlatModal(K *keys_ptr, V *values_ptr, int size)
{
    std::map<K, V> map_data;
    for (int i = 0; i < size; ++i)
    {
        map_data[keys_ptr[i]] = values_ptr[i];
    }
    return map_data;
}

template <typename K>
std::map<K, std::vector<bool>> parseMapBoolVecFromFlatModal(K *keys_ptr, bool *values_ptr, int size, int value_size)
{
    std::map<K, std::vector<bool>> map_data;
    for (int i = 0; i < size; ++i)
    {
        std::vector<bool> vec_value;
        vec_value.reserve(value_size);
        for (int j = 0; j < value_size; ++j)
        {
            vec_value.push_back(values_ptr[i * value_size + j]);
        }
        map_data[keys_ptr[i]] = vec_value;
    }
    return map_data;
}

/**
 * Get local mass matrix for frame element (2 nodes)
 * Based on OpenSees ElasticBeam3d.cpp getMass() function
 * Uses LUMPED mass matrix (diagonal) for stability
 */
Eigen::MatrixXd getLocalMassMatrixFrame(
    const std::vector<Node> &nodes,
    double rho,  // density (mass per unit volume)
    double A,    // cross-sectional area
    double Iz,   // moment of inertia Z
    double Iy)   // moment of inertia Y
{
    Eigen::Vector3d node0(nodes[0][0], nodes[0][1], nodes[0][2]);
    Eigen::Vector3d node1(nodes[1][0], nodes[1][1], nodes[1][2]);
    double L = (node1 - node0).norm();

    if (L < 1e-12)
    {
        return Eigen::MatrixXd::Zero(12, 12);
    }

    // Lumped mass matrix - OpenSees style
    // m = 0.5 * rho * L (total mass per node)
    double m = 0.5 * rho * A * L;

    // Rotational inertia for numerical stability
    // Use minimum rotational mass proportional to translational mass
    // This ensures M matrix is well-conditioned for eigenvalue solve
    double mr = 0.01 * m;  // 1% of translational mass for rotational DOFs

    Eigen::MatrixXd mLocal = Eigen::MatrixXd::Zero(12, 12);

    // Node 1: translational DOFs
    mLocal(0, 0) = m;   // ux
    mLocal(1, 1) = m;   // uy
    mLocal(2, 2) = m;   // uz
    // Rotational DOFs - small mass for numerical stability
    mLocal(3, 3) = mr;  // rx
    mLocal(4, 4) = mr;  // ry
    mLocal(5, 5) = mr;  // rz

    // Node 2: translational DOFs
    mLocal(6, 6) = m;   // ux
    mLocal(7, 7) = m;   // uy
    mLocal(8, 8) = m;   // uz
    // Rotational DOFs - small mass for numerical stability
    mLocal(9, 9) = mr;   // rx
    mLocal(10, 10) = mr; // ry
    mLocal(11, 11) = mr; // rz

    return mLocal;
}

/**
 * Get local mass matrix for shell element (3 nodes - triangle)
 * Lumped mass matrix formulation
 */
Eigen::MatrixXd getLocalMassMatrixShell(
    const std::vector<Node> &nodes,
    double rho,  // density
    double t)    // thickness
{
    // Calculate element area
    double x1 = nodes[0][0], y1 = nodes[0][1];
    double x2 = nodes[1][0], y2 = nodes[1][1];
    double x3 = nodes[2][0], y3 = nodes[2][1];

    double x21 = x2 - x1;
    double x31 = x3 - x1;
    double y12 = y1 - y2;
    double y31 = y3 - y1;
    double Ae = 0.5 * std::abs(x21 * y31 - x31 * (-y12));

    if (Ae < 1e-12)
    {
        return Eigen::MatrixXd::Zero(18, 18);
    }

    // Total mass of element
    double m = rho * Ae * t;

    // Lumped mass matrix - divide mass equally among 3 nodes
    double mn = m / 3.0;

    // For rotational DOFs, use small fraction of translational mass
    double mr = mn * t * t / 12.0;  // Rotational inertia approximation

    Eigen::MatrixXd mLocal = Eigen::MatrixXd::Zero(18, 18);

    // Node 1 (DOFs 0-5)
    mLocal(0, 0) = mn;   // ux
    mLocal(1, 1) = mn;   // uy
    mLocal(2, 2) = mn;   // uz
    mLocal(3, 3) = mr;   // rx
    mLocal(4, 4) = mr;   // ry
    mLocal(5, 5) = mr;   // rz

    // Node 2 (DOFs 6-11)
    mLocal(6, 6) = mn;
    mLocal(7, 7) = mn;
    mLocal(8, 8) = mn;
    mLocal(9, 9) = mr;
    mLocal(10, 10) = mr;
    mLocal(11, 11) = mr;

    // Node 3 (DOFs 12-17)
    mLocal(12, 12) = mn;
    mLocal(13, 13) = mn;
    mLocal(14, 14) = mn;
    mLocal(15, 15) = mr;
    mLocal(16, 16) = mr;
    mLocal(17, 17) = mr;

    return mLocal;
}

/**
 * Get local mass matrix for Quad4 shell element (4 nodes)
 * Lumped mass matrix formulation
 * Based on CSI Analysis Reference Manual Figure 4-5 for Mass Moment of Inertia
 * MMI for rectangular diaphragm: M(b² + d²)/12
 */
Eigen::MatrixXd getLocalMassMatrixQuad4(
    const std::vector<Node> &nodes,
    double rho,  // density
    double t)    // thickness
{
    // Calculate element area using shoelace formula for quadrilateral
    // Area = 0.5 * |sum of (x_i * y_{i+1} - x_{i+1} * y_i)|
    double x1 = nodes[0][0], y1 = nodes[0][1], z1 = nodes[0][2];
    double x2 = nodes[1][0], y2 = nodes[1][1], z2 = nodes[1][2];
    double x3 = nodes[2][0], y3 = nodes[2][1], z3 = nodes[2][2];
    double x4 = nodes[3][0], y4 = nodes[3][1], z4 = nodes[3][2];

    // For 3D quad, calculate area using cross product of diagonals
    Eigen::Vector3d diag1(x3 - x1, y3 - y1, z3 - z1);  // diagonal 1-3
    Eigen::Vector3d diag2(x4 - x2, y4 - y2, z4 - z2);  // diagonal 2-4
    double Ae = 0.5 * diag1.cross(diag2).norm();

    if (Ae < 1e-12)
    {
        return Eigen::MatrixXd::Zero(24, 24);
    }

    // Total mass of element
    double m = rho * Ae * t;

    // Lumped mass matrix - divide mass equally among 4 nodes
    double mn = m / 4.0;

    // For rotational DOFs, calculate approximate element dimensions
    // Using centroid and average distances
    double xc = (x1 + x2 + x3 + x4) / 4.0;
    double yc = (y1 + y2 + y3 + y4) / 4.0;

    // Approximate b (width) and d (depth) from element geometry
    double b = std::sqrt(std::pow(x2 - x1, 2) + std::pow(y2 - y1, 2));  // edge 1-2
    double d = std::sqrt(std::pow(x4 - x1, 2) + std::pow(y4 - y1, 2));  // edge 1-4

    // Mass moment of inertia for rectangular element: MMI = M(b² + d²)/12
    // Per CSI Analysis Reference Manual Figure 4-5
    double MMI = mn * (b * b + d * d) / 12.0;

    // Minimum rotational mass for numerical stability
    double mr_min = mn * t * t / 12.0;
    double mr = std::max(MMI, mr_min);

    Eigen::MatrixXd mLocal = Eigen::MatrixXd::Zero(24, 24);

    // Assign mass to each of 4 nodes (6 DOFs each)
    // For building analysis: only lateral mass (UX, UY), no vertical mass (UZ)
    // This prevents spurious slab bending modes and matches ETABS behavior
    for (int node = 0; node < 4; ++node)
    {
        int offset = node * 6;

        // Translational DOFs - only lateral (no vertical mass for slab)
        mLocal(offset + 0, offset + 0) = mn;   // ux - lateral mass
        mLocal(offset + 1, offset + 1) = mn;   // uy - lateral mass
        mLocal(offset + 2, offset + 2) = 0.0;  // uz - NO vertical mass (slab acts as diaphragm)

        // Rotational DOFs - no rotational inertia for diaphragm behavior
        mLocal(offset + 3, offset + 3) = 0.0;  // rx
        mLocal(offset + 4, offset + 4) = 0.0;  // ry
        mLocal(offset + 5, offset + 5) = 0.0;  // rz (drilling DOF)
    }

    return mLocal;
}

/**
 * Get local mass matrix (dispatcher)
 */
Eigen::MatrixXd getLocalMassMatrix(
    const std::vector<Node> &elementNodes,
    const ElementInputs &elementInputs,
    const std::map<int, double> &densities,
    int elementIndex)
{
    double rho = 0.0;
    auto it = densities.find(elementIndex);
    if (it != densities.end())
    {
        rho = it->second;
    }

    if (elementNodes.size() == 2)
    {
        // Frame element
        double A = 0.0, Iz = 0.0, Iy = 0.0;

        auto aIt = elementInputs.areas.find(elementIndex);
        if (aIt != elementInputs.areas.end()) A = aIt->second;

        auto izIt = elementInputs.momentsOfInertiaZ.find(elementIndex);
        if (izIt != elementInputs.momentsOfInertiaZ.end()) Iz = izIt->second;

        auto iyIt = elementInputs.momentsOfInertiaY.find(elementIndex);
        if (iyIt != elementInputs.momentsOfInertiaY.end()) Iy = iyIt->second;

        return getLocalMassMatrixFrame(elementNodes, rho, A, Iz, Iy);
    }
    else if (elementNodes.size() == 3)
    {
        // Shell element (triangle)
        double t = 0.0;
        auto tIt = elementInputs.thicknesses.find(elementIndex);
        if (tIt != elementInputs.thicknesses.end()) t = tIt->second;

        return getLocalMassMatrixShell(elementNodes, rho, t);
    }
    else if (elementNodes.size() == 4)
    {
        // Quad4 shell element
        double t = 0.0;
        auto tIt = elementInputs.thicknesses.find(elementIndex);
        if (tIt != elementInputs.thicknesses.end()) t = tIt->second;

        return getLocalMassMatrixQuad4(elementNodes, rho, t);
    }

    return Eigen::MatrixXd::Zero(12, 12);
}

/**
 * Assemble global mass matrix
 */
Eigen::SparseMatrix<double> getGlobalMassMatrix(
    const std::vector<Node> &nodes,
    const std::vector<unsigned int> &element_indices,
    const std::vector<unsigned int> &elementSizes,
    const ElementInputs &elementInputs,
    const std::map<int, double> &densities,
    int dof)
{
    std::vector<Eigen::Triplet<double>> tripletList;
    tripletList.reserve(elementSizes.size() * 18 * 18);

    // Get transformation matrix function
    extern Eigen::MatrixXd getTransformationMatrix(const std::vector<Node> &elementNodes);

    int current_element_node_idx = 0;
    for (size_t i = 0; i < elementSizes.size(); ++i)
    {
        unsigned int numElementNodes = elementSizes[i];
        std::vector<Node> elmNodes;
        Element currentElementIndices;
        elmNodes.reserve(numElementNodes);
        currentElementIndices.reserve(numElementNodes);

        for (unsigned int j = 0; j < numElementNodes; ++j)
        {
            unsigned int nodeIndex = element_indices[current_element_node_idx + j];
            elmNodes.push_back(nodes[nodeIndex]);
            currentElementIndices.push_back(nodeIndex);
        }

        // Get local mass matrix
        Eigen::MatrixXd mLocal = getLocalMassMatrix(elmNodes, elementInputs, densities, i);

        // Get transformation matrix
        Eigen::MatrixXd T = getTransformationMatrix(elmNodes);

        // Transform to global: M_global = T^T * M_local * T
        Eigen::MatrixXd mGlobalElement = T.transpose() * mLocal * T;

        // Assemble into global matrix
        for (unsigned int rowNodeIdx = 0; rowNodeIdx < numElementNodes; ++rowNodeIdx)
        {
            for (int rowDof = 0; rowDof < 6; ++rowDof)
            {
                int globalRow = currentElementIndices[rowNodeIdx] * 6 + rowDof;

                for (unsigned int colNodeIdx = 0; colNodeIdx < numElementNodes; ++colNodeIdx)
                {
                    for (int colDof = 0; colDof < 6; ++colDof)
                    {
                        int globalCol = currentElementIndices[colNodeIdx] * 6 + colDof;
                        double value = mGlobalElement(rowNodeIdx * 6 + rowDof, colNodeIdx * 6 + colDof);

                        if (std::abs(value) > 1e-15)
                        {
                            tripletList.emplace_back(globalRow, globalCol, value);
                        }
                    }
                }
            }
        }

        current_element_node_idx += numElementNodes;
    }

    Eigen::SparseMatrix<double> M(dof, dof);
    M.setFromTriplets(tripletList.begin(), tripletList.end());
    return M;
}

/**
 * Get free DOF indices (same as deform.cpp)
 */
std::vector<int> getModalFreeIndices(
    const NodeInputs &nodeInputs,
    int dof)
{
    std::vector<bool> isFixed(dof, false);
    for (const auto &pair : nodeInputs.supports)
    {
        int nodeIndex = pair.first;
        const auto &supportFlags = pair.second;
        if (supportFlags.size() == 6)
        {
            for (int i = 0; i < 6; ++i)
            {
                if (supportFlags[i])
                {
                    isFixed[nodeIndex * 6 + i] = true;
                }
            }
        }
    }

    std::vector<int> freeIndices;
    for (int i = 0; i < dof; ++i)
    {
        if (!isFixed[i])
        {
            freeIndices.push_back(i);
        }
    }
    return freeIndices;
}

/**
 * Reduce SPARSE matrix to free DOFs only (keeps it sparse)
 */
Eigen::SparseMatrix<double> getReducedMatrixSparse(
    const Eigen::SparseMatrix<double> &matrix,
    const std::vector<int> &reducedIndices)
{
    int n = reducedIndices.size();
    std::vector<Eigen::Triplet<double>> triplets;
    triplets.reserve(matrix.nonZeros());

    // Create index mapping
    std::map<int, int> indexMap;
    for (int i = 0; i < n; ++i) {
        indexMap[reducedIndices[i]] = i;
    }

    // Extract reduced matrix entries
    for (int k = 0; k < matrix.outerSize(); ++k) {
        for (Eigen::SparseMatrix<double>::InnerIterator it(matrix, k); it; ++it) {
            auto rowIt = indexMap.find(it.row());
            auto colIt = indexMap.find(it.col());
            if (rowIt != indexMap.end() && colIt != indexMap.end()) {
                triplets.emplace_back(rowIt->second, colIt->second, it.value());
            }
        }
    }

    Eigen::SparseMatrix<double> reduced(n, n);
    reduced.setFromTriplets(triplets.begin(), triplets.end());
    return reduced;
}

extern "C"
{
    /**
     * Modal Analysis Function
     * Solves generalized eigenvalue problem: K*φ = ω²*M*φ
     */
    void modal(
        // --- Geometry ---
        double *nodes_flat_ptr, int num_nodes,
        unsigned int *element_indices_ptr, int num_element_indices,
        unsigned int *element_sizes_ptr, int num_elements,

        // --- Boundary Conditions ---
        int *support_keys_ptr, bool *support_values_ptr, int num_supports,

        // --- Element Properties ---
        int *elasticity_keys_ptr, double *elasticity_values_ptr, int num_elasticities,
        int *area_keys_ptr, double *area_values_ptr, int num_areas,
        int *moi_z_keys_ptr, double *moi_z_values_ptr, int num_moi_z,
        int *moi_y_keys_ptr, double *moi_y_values_ptr, int num_moi_y,
        int *shear_mod_keys_ptr, double *shear_mod_values_ptr, int num_shear_mod,
        int *torsion_keys_ptr, double *torsion_values_ptr, int num_torsion,
        int *thickness_keys_ptr, double *thickness_values_ptr, int num_thickness,
        int *poisson_keys_ptr, double *poisson_values_ptr, int num_poisson,
        int *elasticitiesOrthogonal_keys_ptr, double *elasticitiesOrthogonal_values_ptr, int num_elasticitiesOrthogonal,

        // --- Mass Properties ---
        int *density_keys_ptr, double *density_values_ptr, int num_densities,

        // --- Rigid Diaphragm (NEW) ---
        double *diaphragm_levels_ptr, int num_diaphragm_levels,  // Z levels with rigid diaphragm

        // --- Modal Parameters ---
        int num_modes,  // Number of modes to compute

        // --- Outputs ---
        double **frequencies_ptr_out,     // Natural frequencies (Hz)
        double **periods_ptr_out,         // Periods (s)
        double **mode_shapes_ptr_out,     // Mode shape vectors (flattened)
        double **mass_participation_ptr_out,  // Mass participation ratios [UX, UY, UZ, RX, RY, RZ] per mode
        int *num_modes_out                // Actual number of modes computed
    )
    {
        // --- 1. Parse Inputs ---
        std::vector<Node> nodes(num_nodes, Node(3));
        for (int i = 0; i < num_nodes; ++i)
        {
            nodes[i][0] = nodes_flat_ptr[i * 3 + 0];
            nodes[i][1] = nodes_flat_ptr[i * 3 + 1];
            nodes[i][2] = nodes_flat_ptr[i * 3 + 2];
        }

        std::vector<unsigned int> element_indices(element_indices_ptr, element_indices_ptr + num_element_indices);
        std::vector<unsigned int> element_sizes(element_sizes_ptr, element_sizes_ptr + num_elements);

        NodeInputs nodeInputs;
        nodeInputs.supports = parseMapBoolVecFromFlatModal(support_keys_ptr, support_values_ptr, num_supports, 6);

        ElementInputs elementInputs;
        elementInputs.elasticities = parseMapFromFlatModal(elasticity_keys_ptr, elasticity_values_ptr, num_elasticities);
        elementInputs.areas = parseMapFromFlatModal(area_keys_ptr, area_values_ptr, num_areas);
        elementInputs.momentsOfInertiaZ = parseMapFromFlatModal(moi_z_keys_ptr, moi_z_values_ptr, num_moi_z);
        elementInputs.momentsOfInertiaY = parseMapFromFlatModal(moi_y_keys_ptr, moi_y_values_ptr, num_moi_y);
        elementInputs.shearModuli = parseMapFromFlatModal(shear_mod_keys_ptr, shear_mod_values_ptr, num_shear_mod);
        elementInputs.torsionalConstants = parseMapFromFlatModal(torsion_keys_ptr, torsion_values_ptr, num_torsion);
        elementInputs.thicknesses = parseMapFromFlatModal(thickness_keys_ptr, thickness_values_ptr, num_thickness);
        elementInputs.poissonsRatios = parseMapFromFlatModal(poisson_keys_ptr, poisson_values_ptr, num_poisson);
        elementInputs.elasticitiesOrthogonal = parseMapFromFlatModal(elasticitiesOrthogonal_keys_ptr, elasticitiesOrthogonal_values_ptr, num_elasticitiesOrthogonal);

        std::map<int, double> densities = parseMapFromFlatModal(density_keys_ptr, density_values_ptr, num_densities);

        // --- 2. Build Global Matrices ---
        int dof = num_nodes * 6;
        int original_dof = dof;  // Store original before any transformations
        // Build matrices (silent for speed)
        Eigen::SparseMatrix<double> K_global = getGlobalStiffnessMatrix(nodes, element_indices, element_sizes, elementInputs, dof);
        Eigen::SparseMatrix<double> M_global = getGlobalMassMatrix(nodes, element_indices, element_sizes, elementInputs, densities, dof);

        // --- 2b. Apply Rigid Diaphragm Constraints (if specified) ---
        // This uses a transformation approach: slave DOFs are expressed in terms of master DOFs
        // For each floor: UX_slave = UX_master - RZ_master * (y_slave - y_cm)
        //                 UY_slave = UY_master + RZ_master * (x_slave - x_cm)
        std::vector<int> slaveDOFs;  // DOFs to eliminate (will be expressed via transformation)
        std::map<int, std::tuple<int, int, int, double, double>> slaveToMaster;  // slave -> (masterUX, masterUY, masterRZ, dx, dy)

        if (num_diaphragm_levels > 0) {
            std::vector<double> diaphragmLevels(diaphragm_levels_ptr, diaphragm_levels_ptr + num_diaphragm_levels);
            const double z_tol = 0.01;
            std::map<double, std::vector<int>> nodesByLevel;

            for (int i = 0; i < num_nodes; ++i) {
                double z = nodes[i][2];
                for (double level : diaphragmLevels) {
                    if (std::abs(z - level) < z_tol) {
                        nodesByLevel[level].push_back(i);
                        break;
                    }
                }
            }

            for (const auto& pair : nodesByLevel) {
                double level = pair.first;
                const std::vector<int>& levelNodes = pair.second;
                if (levelNodes.size() < 2) continue;

                // Calculate center of mass
                double total_mass = 0.0;
                double x_cm = 0.0, y_cm = 0.0;

                for (int nodeIdx : levelNodes) {
                    double m = M_global.coeff(nodeIdx * 6, nodeIdx * 6);
                    if (m < 1e-15) m = 1.0;
                    total_mass += m;
                    x_cm += m * nodes[nodeIdx][0];
                    y_cm += m * nodes[nodeIdx][1];
                }
                if (total_mass > 1e-15) {
                    x_cm /= total_mass;
                    y_cm /= total_mass;
                }

                // First node is master
                int masterNode = levelNodes[0];
                int masterUX = masterNode * 6 + 0;
                int masterUY = masterNode * 6 + 1;
                int masterRZ = masterNode * 6 + 5;

                // Mark slave DOFs and store transformation info
                for (size_t i = 1; i < levelNodes.size(); ++i) {
                    int slaveNode = levelNodes[i];
                    double dx = nodes[slaveNode][0] - x_cm;
                    double dy = nodes[slaveNode][1] - y_cm;

                    int slaveUX = slaveNode * 6 + 0;
                    int slaveUY = slaveNode * 6 + 1;

                    slaveDOFs.push_back(slaveUX);
                    slaveDOFs.push_back(slaveUY);

                    slaveToMaster[slaveUX] = std::make_tuple(masterUX, masterUY, masterRZ, dx, -dy);
                    slaveToMaster[slaveUY] = std::make_tuple(masterUX, masterUY, masterRZ, dx, dy);
                }
            }

            // Sort and remove duplicates from slaveDOFs
            std::sort(slaveDOFs.begin(), slaveDOFs.end());
            slaveDOFs.erase(std::unique(slaveDOFs.begin(), slaveDOFs.end()), slaveDOFs.end());

        }

        // --- 3. Apply Boundary Conditions (reduce to free DOFs) ---
        std::cout << "Supports in nodeInputs: " << nodeInputs.supports.size() << " nodes" << std::endl;
        int totalFixedDOFs = 0;
        for (const auto &pair : nodeInputs.supports) {
            int count = 0;
            for (bool b : pair.second) if (b) count++;
            totalFixedDOFs += count;
        }
        std::cout << "Total fixed DOFs: " << totalFixedDOFs << std::endl;

        std::vector<int> freeIndices = getModalFreeIndices(nodeInputs, dof);

        // Apply rigid diaphragm transformation if specified
        // This condenses slave DOFs into master DOFs using kinematic relationships
        Eigen::SparseMatrix<double> K_transformed = K_global;
        Eigen::SparseMatrix<double> M_transformed = M_global;

        if (!slaveDOFs.empty() && !slaveToMaster.empty()) {
            // (removed debug log)

            // Build transformation matrix T: u_full = T * u_reduced
            // Where u_reduced excludes slave DOFs but includes master DOFs
            std::set<int> slaveSet(slaveDOFs.begin(), slaveDOFs.end());

            // Map from original DOF to reduced DOF index
            std::vector<int> reducedIndices;
            std::map<int, int> origToReduced;

            for (int i = 0; i < dof; ++i) {
                if (slaveSet.find(i) == slaveSet.end()) {
                    origToReduced[i] = reducedIndices.size();
                    reducedIndices.push_back(i);
                }
            }

            int n_reduced = reducedIndices.size();
            // (removed debug log)

            // Build transformation matrix T (dof x n_reduced)
            std::vector<Eigen::Triplet<double>> triplets;

            for (int i = 0; i < dof; ++i) {
                if (slaveSet.find(i) == slaveSet.end()) {
                    // Free DOF: maps directly
                    triplets.emplace_back(i, origToReduced[i], 1.0);
                } else {
                    // Slave DOF: expressed in terms of master DOFs
                    auto it = slaveToMaster.find(i);
                    if (it != slaveToMaster.end()) {
                        int masterUX = std::get<0>(it->second);
                        int masterUY = std::get<1>(it->second);
                        int masterRZ = std::get<2>(it->second);
                        double dx = std::get<3>(it->second);
                        double dy = std::get<4>(it->second);

                        int dofType = i % 6;

                        if (dofType == 0) {
                            // UX_slave = UX_master - RZ_master * dy
                            if (origToReduced.count(masterUX))
                                triplets.emplace_back(i, origToReduced[masterUX], 1.0);
                            if (origToReduced.count(masterRZ))
                                triplets.emplace_back(i, origToReduced[masterRZ], -dy);
                        } else if (dofType == 1) {
                            // UY_slave = UY_master + RZ_master * dx
                            if (origToReduced.count(masterUY))
                                triplets.emplace_back(i, origToReduced[masterUY], 1.0);
                            if (origToReduced.count(masterRZ))
                                triplets.emplace_back(i, origToReduced[masterRZ], dx);
                        }
                    }
                }
            }

            Eigen::SparseMatrix<double> T(dof, n_reduced);
            T.setFromTriplets(triplets.begin(), triplets.end());

            // Transform: K_transformed = T^T * K * T, M_transformed = T^T * M * T
            K_transformed = T.transpose() * K_global * T;
            M_transformed = T.transpose() * M_global * T;

            // Update freeIndices to use reduced system
            freeIndices.clear();
            for (int i = 0; i < n_reduced; ++i) {
                freeIndices.push_back(i);
            }

            // Update dof for the reduced system
            dof = n_reduced;

            // (removed debug log)
        }
        int n_free = freeIndices.size();
        // (removed debug log)

        if (n_free == 0)
        {
            std::cerr << "Error: No free DOFs for modal analysis." << std::endl;
            *num_modes_out = 0;
            return;
        }

        // Reduce to SPARSE matrices (much more memory efficient)
        // Use K_transformed/M_transformed if rigid diaphragm was applied, otherwise K_global/M_global
        Eigen::SparseMatrix<double> K_reduced, M_reduced;

        if (!slaveDOFs.empty()) {
            // With rigid diaphragm: matrices are already transformed and reduced
            // freeIndices now refers to the transformed system
            // (removed debug log)

            // Get free DOFs from the TRANSFORMED system (no supports applied yet)
            // Need to re-apply support conditions to the transformed system
            std::vector<int> transformedFreeIndices;
            std::set<int> fixedDOFsInTransformed;

            // Map original supports to transformed DOF indices
            for (const auto &pair : nodeInputs.supports) {
                int nodeIndex = pair.first;
                const auto &supportFlags = pair.second;
                if (supportFlags.size() == 6) {
                    for (int i = 0; i < 6; ++i) {
                        if (supportFlags[i]) {
                            int origDOF = nodeIndex * 6 + i;
                            // Check if this DOF is a slave (was eliminated)
                            std::set<int> slaveSet(slaveDOFs.begin(), slaveDOFs.end());
                            if (slaveSet.find(origDOF) == slaveSet.end()) {
                                // Not a slave, find its index in transformed system
                                // freeIndices contains the original DOF indices that are in the reduced system
                                for (int j = 0; j < (int)freeIndices.size(); ++j) {
                                    if (freeIndices[j] == origDOF) {
                                        fixedDOFsInTransformed.insert(j);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (int i = 0; i < dof; ++i) {
                if (fixedDOFsInTransformed.find(i) == fixedDOFsInTransformed.end()) {
                    transformedFreeIndices.push_back(i);
                }
            }

            freeIndices = transformedFreeIndices;
            n_free = freeIndices.size();
            // (removed debug log)

            K_reduced = getReducedMatrixSparse(K_transformed, freeIndices);
            M_reduced = getReducedMatrixSparse(M_transformed, freeIndices);
        } else {
            // Without rigid diaphragm: reduce from global matrices
            // (removed debug log)
            K_reduced = getReducedMatrixSparse(K_global, freeIndices);
            // (removed debug log)

            // (removed debug log)
            M_reduced = getReducedMatrixSparse(M_global, freeIndices);
        }
        // (removed debug log)
        // (removed debug log)

        // --- 4. Remove DOFs without significant mass (static condensation) ---
        // This prevents spurious modes from DOFs with zero/tiny mass
        // Only keep DOFs where M_ii > threshold * max(M_ii)
        double mDiagMax = 0.0;
        for (int i = 0; i < n_free; ++i) {
            double val = M_reduced.coeff(i, i);
            if (val > mDiagMax) mDiagMax = val;
        }

        const double MASS_THRESHOLD = 1e-6;  // DOFs with mass < 1e-6 * max are considered massless
        double massThreshold = mDiagMax * MASS_THRESHOLD;

        std::vector<int> massiveDOFs;  // DOFs with significant mass
        std::vector<int> masslessDOFs; // DOFs without mass (to be condensed out)

        for (int i = 0; i < n_free; ++i) {
            if (M_reduced.coeff(i, i) > massThreshold) {
                massiveDOFs.push_back(i);
            } else {
                masslessDOFs.push_back(i);
            }
        }

        // (removed debug log)

        // If there are massless DOFs, we need to condense them out
        // For modal analysis, we simply exclude them (they don't contribute to dynamic response)
        Eigen::SparseMatrix<double> K_modal, M_modal;
        std::vector<int> modalDOFs;

        if (masslessDOFs.empty()) {
            // No condensation needed
            K_modal = K_reduced;
            M_modal = M_reduced;
            modalDOFs = std::vector<int>(n_free);
            for (int i = 0; i < n_free; ++i) modalDOFs[i] = i;
        } else {
            // Extract submatrices for DOFs with mass only
            int n_modal = massiveDOFs.size();
            std::vector<Eigen::Triplet<double>> kTriplets, mTriplets;

            // Create mapping from reduced DOF to modal DOF
            std::map<int, int> reducedToModal;
            for (int i = 0; i < n_modal; ++i) {
                reducedToModal[massiveDOFs[i]] = i;
            }

            // Extract K and M for massive DOFs only
            for (int k = 0; k < K_reduced.outerSize(); ++k) {
                for (Eigen::SparseMatrix<double>::InnerIterator it(K_reduced, k); it; ++it) {
                    auto rowIt = reducedToModal.find(it.row());
                    auto colIt = reducedToModal.find(it.col());
                    if (rowIt != reducedToModal.end() && colIt != reducedToModal.end()) {
                        kTriplets.emplace_back(rowIt->second, colIt->second, it.value());
                    }
                }
            }
            for (int k = 0; k < M_reduced.outerSize(); ++k) {
                for (Eigen::SparseMatrix<double>::InnerIterator it(M_reduced, k); it; ++it) {
                    auto rowIt = reducedToModal.find(it.row());
                    auto colIt = reducedToModal.find(it.col());
                    if (rowIt != reducedToModal.end() && colIt != reducedToModal.end()) {
                        mTriplets.emplace_back(rowIt->second, colIt->second, it.value());
                    }
                }
            }

            K_modal.resize(n_modal, n_modal);
            M_modal.resize(n_modal, n_modal);
            K_modal.setFromTriplets(kTriplets.begin(), kTriplets.end());
            M_modal.setFromTriplets(mTriplets.begin(), mTriplets.end());

            modalDOFs = massiveDOFs;

            // (removed debug log)
        }

        int n_modal = modalDOFs.size();

        // --- 5. Solve eigenvalue problem using GeneralizedSelfAdjointEigenSolver ---
        // Solves K*φ = λ*M*φ directly
        int nev = std::min(num_modes, n_modal);

        std::cout << "Modal: " << n_modal << " DOFs, computing " << nev << " modes" << std::endl;

        // Convert sparse to dense
        Eigen::MatrixXd K_dense = Eigen::MatrixXd(K_modal);
        Eigen::MatrixXd M_dense = Eigen::MatrixXd(M_modal);

        // Make symmetric
        K_dense = 0.5 * (K_dense + K_dense.transpose());
        M_dense = 0.5 * (M_dense + M_dense.transpose());

        // Debug: Print K and M statistics
        double K_max = K_dense.cwiseAbs().maxCoeff();
        double M_max = M_dense.cwiseAbs().maxCoeff();
        double K_diag_min = 1e30, M_diag_min = 1e30;
        for (int i = 0; i < n_modal; ++i) {
            if (std::abs(K_dense(i, i)) > 1e-15 && std::abs(K_dense(i, i)) < K_diag_min)
                K_diag_min = std::abs(K_dense(i, i));
            if (std::abs(M_dense(i, i)) > 1e-15 && std::abs(M_dense(i, i)) < M_diag_min)
                M_diag_min = std::abs(M_dense(i, i));
        }
        std::cout << "K: diag_max=" << K_max << ", diag_min=" << K_diag_min << std::endl;
        std::cout << "M: diag_max=" << M_max << ", diag_min=" << M_diag_min << std::endl;

        // Regularize both K and M to ensure positive definiteness
        double eps_K = K_max * 1e-10;
        double eps_M = M_max * 1e-6;
        for (int i = 0; i < n_modal; ++i) {
            K_dense(i, i) += eps_K;
            M_dense(i, i) += eps_M;
        }

        // Use GeneralizedSelfAdjointEigenSolver (more robust than manual Cholesky)
        // Solves K*φ = λ*M*φ where both K and M must be symmetric positive definite
        Eigen::GeneralizedSelfAdjointEigenSolver<Eigen::MatrixXd> eigSolver(K_dense, M_dense);

        if (eigSolver.info() != Eigen::Success) {
            std::cerr << "Error: GeneralizedSelfAdjointEigenSolver failed!" << std::endl;
            *num_modes_out = 0;
            return;
        }

        // Get eigenvalues (sorted ascending) and eigenvectors
        Eigen::VectorXd eigenvalues = eigSolver.eigenvalues().head(nev);
        Eigen::MatrixXd eigenvectors = eigSolver.eigenvectors().leftCols(nev);

        // Debug output
        std::cout << "Raw eigenvalues: ";
        for (int i = 0; i < std::min(6, nev); ++i) {
            std::cout << eigenvalues(i) << " ";
        }
        std::cout << std::endl;

        std::cout << "Frequencies: ";
        for (int i = 0; i < std::min(6, nev); ++i) {
            double omega = std::sqrt(std::max(0.0, eigenvalues(i)));
            double freq = omega / (2.0 * M_PI);
            std::cout << freq << "Hz ";
        }
        std::cout << std::endl;

        // --- 6. Extract Results ---
        // Map from modal DOF index to global DOF index
        // modalDOFs[i] is index in freeIndices, freeIndices[modalDOFs[i]] is global DOF
        auto getGlobalDOF = [&](int modalIdx) -> int {
            return freeIndices[modalDOFs[modalIdx]];
        };

        // First, calculate center of mass (needed for all modes)
        double total_mass_for_cm = 0.0;
        double x_cm_global = 0.0, y_cm_global = 0.0, z_cm_global = 0.0;

        for (int i = 0; i < n_modal; ++i) {
            int globalIdx = getGlobalDOF(i);
            int nodeIdx = globalIdx / 6;
            int dofType = globalIdx % 6;

            if (dofType == 0) { // UX DOF - has mass
                double m = M_dense.coeff(i, i);
                if (m > 1e-15) {
                    total_mass_for_cm += m;
                    x_cm_global += m * nodes[nodeIdx][0];
                    y_cm_global += m * nodes[nodeIdx][1];
                    z_cm_global += m * nodes[nodeIdx][2];
                }
            }
        }
        if (total_mass_for_cm > 1e-15) {
            x_cm_global /= total_mass_for_cm;
            y_cm_global /= total_mass_for_cm;
            z_cm_global /= total_mass_for_cm;
        }

        // Calculate total mass for each direction (using condensed system)
        double total_mass[6] = {0.0, 0.0, 0.0, 0.0, 0.0, 0.0};
        for (int i = 0; i < n_modal; ++i)
        {
            int globalIdx = getGlobalDOF(i);
            int nodeIdx = globalIdx / 6;
            int dofType = globalIdx % 6;

            if (dofType < 3) {
                // Translational DOFs
                total_mass[dofType] += M_dense.coeff(i, i);
            }
        }
        // RZ total mass (mass moment of inertia about Z)
        for (int i = 0; i < n_modal; ++i) {
            int globalIdx = getGlobalDOF(i);
            int nodeIdx = globalIdx / 6;
            int dofType = globalIdx % 6;

            if (dofType == 0) { // UX DOF
                double m = M_dense.coeff(i, i);
                double r = std::sqrt(std::pow(nodes[nodeIdx][0] - x_cm_global, 2) +
                                     std::pow(nodes[nodeIdx][1] - y_cm_global, 2));
                total_mass[5] += m * r * r;  // RZ
            }
        }

        // --- 6b. All modes from condensed system are valid (no filtering needed) ---
        // Static condensation already removed massless DOFs, so all modes are physical
        int actual_modes = std::min((int)eigenvalues.size(), num_modes);
        *num_modes_out = actual_modes;

        // (removed debug log)

        // Allocate output arrays
        *frequencies_ptr_out = (double *)malloc(actual_modes * sizeof(double));
        *periods_ptr_out = (double *)malloc(actual_modes * sizeof(double));
        *mode_shapes_ptr_out = (double *)malloc(actual_modes * dof * sizeof(double));
        *mass_participation_ptr_out = (double *)malloc(actual_modes * 6 * sizeof(double));

        for (int modeOut = 0; modeOut < actual_modes; ++modeOut)
        {
            double lambda = eigenvalues(modeOut);

            // ω² = λ, ω = sqrt(λ), f = ω/(2π), T = 1/f
            double omega = (lambda > 0) ? std::sqrt(lambda) : 0.0;
            double freq = omega / (2.0 * M_PI);
            double period = (freq > 1e-10) ? 1.0 / freq : 0.0;

            (*frequencies_ptr_out)[modeOut] = freq;
            (*periods_ptr_out)[modeOut] = period;

            // Expand mode shape to full DOF vector
            // phi_reduced is n_modal sized, we need to map back to global DOFs
            Eigen::VectorXd phi_reduced = eigenvectors.col(modeOut);
            Eigen::VectorXd phi_full = Eigen::VectorXd::Zero(dof);

            for (int i = 0; i < n_modal; ++i)
            {
                phi_full(getGlobalDOF(i)) = phi_reduced(i);
            }

            // Store mode shape
            for (int i = 0; i < dof; ++i)
            {
                (*mode_shapes_ptr_out)[modeOut * dof + i] = phi_full(i);
            }

            // Calculate mass participation factors
            Eigen::VectorXd M_phi = M_dense * phi_reduced;
            double phi_M_phi = phi_reduced.dot(M_phi);

            // Calculate participation for each direction
            for (int dir = 0; dir < 6; ++dir)
            {
                double gamma = 0.0;
                double total_mass_dir = total_mass[dir];

                if (dir < 3) {
                    // Translational directions (UX=0, UY=1, UZ=2)
                    for (int i = 0; i < n_modal; ++i) {
                        if (getGlobalDOF(i) % 6 == dir) {
                            double m = M_dense.coeff(i, i);
                            gamma += m * phi_reduced(i);
                        }
                    }
                } else if (dir == 5) {
                    // RZ - Rotational about Z axis
                    for (int i = 0; i < n_modal; ++i) {
                        int globalIdx = getGlobalDOF(i);
                        int nodeIdx = globalIdx / 6;
                        int dofType = globalIdx % 6;

                        if (dofType == 0) { // UX
                            double m = M_dense.coeff(i, i);
                            double dy = nodes[nodeIdx][1] - y_cm_global;
                            gamma -= m * dy * phi_reduced(i);
                        } else if (dofType == 1) { // UY
                            double m = M_dense.coeff(i, i);
                            double dx = nodes[nodeIdx][0] - x_cm_global;
                            gamma += m * dx * phi_reduced(i);
                        }
                    }
                } else {
                    // RX, RY - set to 0
                    gamma = 0.0;
                    total_mass_dir = 1.0;
                }

                double effective_mass = (std::abs(phi_M_phi) > 1e-15) ? (gamma * gamma) / phi_M_phi : 0.0;
                double participation = (std::abs(total_mass_dir) > 1e-15) ? effective_mass / total_mass_dir : 0.0;

                // Clamp to [0, 1]
                participation = std::max(0.0, std::min(1.0, participation));

                (*mass_participation_ptr_out)[modeOut * 6 + dir] = participation;
            }
        }

        std::cout << "Modal analysis completed: " << actual_modes << " modes" << std::endl;
    }
}
