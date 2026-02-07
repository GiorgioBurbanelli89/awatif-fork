// Shell visualization as solid surfaces (similar to ETABS)
// Gray for horizontal slabs, red for stairs

import * as THREE from "three";
import { Node, Element } from "awatif-fem";

export interface ShellSolidsConfig {
  slabColor?: number;
  slabOpacity?: number;
  stairColor?: number;
  stairOpacity?: number;
}

const DEFAULT_CONFIG: ShellSolidsConfig = {
  slabColor: 0x888888,     // Gray for slabs
  slabOpacity: 0.6,
  stairColor: 0xff4444,    // Red for stairs
  stairOpacity: 0.8,
};

// Create mesh for shell elements with solid colors
export function getShellSolids(
  nodes: Node[],
  horizontalShells: Element[],
  inclinedShells: Element[],
  config: ShellSolidsConfig = {}
): THREE.Group {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const group = new THREE.Group();

  // Create slab mesh (horizontal shells)
  if (horizontalShells.length > 0) {
    const slabMesh = createShellMesh(
      nodes,
      horizontalShells,
      cfg.slabColor!,
      cfg.slabOpacity!
    );
    slabMesh.name = "slabs";
    group.add(slabMesh);
  }

  // Create stair mesh (inclined shells)
  if (inclinedShells.length > 0) {
    const stairMesh = createShellMesh(
      nodes,
      inclinedShells,
      cfg.stairColor!,
      cfg.stairOpacity!
    );
    stairMesh.name = "stairs";
    group.add(stairMesh);
  }

  return group;
}

function createShellMesh(
  nodes: Node[],
  shells: Element[],
  color: number,
  opacity: number
): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();

  // Collect all positions and indices
  const positions: number[] = [];
  const indices: number[] = [];

  // For each shell, create triangles (fan triangulation for polygons)
  shells.forEach((shell) => {
    const n = shell.length;
    if (n < 3) return; // Skip invalid elements

    const baseIndex = positions.length / 3;

    // Add all vertices of the polygon
    for (let i = 0; i < n; i++) {
      const node = nodes[shell[i]];
      if (node) {
        positions.push(node[0], node[1], node[2]);
      } else {
        positions.push(0, 0, 0);
      }
    }

    // Fan triangulation: create (n-2) triangles from vertex 0
    // Works for triangles (3), quads (4), pentagons (5), hexagons (6), etc.
    for (let i = 1; i < n - 1; i++) {
      indices.push(baseIndex, baseIndex + i, baseIndex + i + 1);
    }
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({
    color: color,
    opacity: opacity,
    transparent: opacity < 1.0,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  return new THREE.Mesh(geometry, material);
}

// Update shell solids geometry (for reactive updates)
export function updateShellSolids(
  group: THREE.Group,
  nodes: Node[],
  horizontalShells: Element[],
  inclinedShells: Element[],
  config: ShellSolidsConfig = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Find and update slab mesh
  const slabMesh = group.getObjectByName("slabs") as THREE.Mesh;
  if (slabMesh && horizontalShells.length > 0) {
    updateShellGeometry(slabMesh, nodes, horizontalShells);
  }

  // Find and update stair mesh
  const stairMesh = group.getObjectByName("stairs") as THREE.Mesh;
  if (stairMesh && inclinedShells.length > 0) {
    updateShellGeometry(stairMesh, nodes, inclinedShells);
  }
}

function updateShellGeometry(
  mesh: THREE.Mesh,
  nodes: Node[],
  shells: Element[]
): void {
  const geometry = mesh.geometry;
  const positions: number[] = [];
  const indices: number[] = [];

  // Fan triangulation for any polygon (3, 4, 5, 6+ vertices)
  shells.forEach((shell) => {
    const n = shell.length;
    if (n < 3) return;

    const baseIndex = positions.length / 3;

    for (let i = 0; i < n; i++) {
      const node = nodes[shell[i]];
      if (node) {
        positions.push(node[0], node[1], node[2]);
      } else {
        positions.push(0, 0, 0);
      }
    }

    for (let i = 1; i < n - 1; i++) {
      indices.push(baseIndex, baseIndex + i, baseIndex + i + 1);
    }
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
}
