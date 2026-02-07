import * as THREE from "three";
import { Node, Element } from "awatif-fem";

import { Lut } from "three/addons/math/Lut.js";
import van, { State } from "vanjs-core";

export function getColorMap(
  nodes: State<Node[]>,
  elements: State<Element[]>,
  values: State<number[]>
): THREE.Mesh {
  // Init
  const lut = new Lut();
  const color = new THREE.Color();

  const colorMap = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
    })
  );

  // Update
  lut.setColorMap("rainbow");
  colorMap.renderOrder = -1; // to ensure that it always set behind the mesh
  colorMap.frustumCulled = false;

  // Events
  // When nodes, elements or values change, update the color map
  van.derive(() => {
    // Update geometry
    colorMap.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(nodes.val.flat(), 3)
    );

    // Convert elements to triangles (THREE.js only supports triangles)
    const triangleIndices: number[] = [];
    elements.val.forEach((e) => {
      if (e.length === 3) {
        // Triangle: use directly
        triangleIndices.push(e[0], e[1], e[2]);
      } else if (e.length === 4) {
        // Quad: split into two triangles
        // Triangle 1: n1, n2, n3
        triangleIndices.push(e[0], e[1], e[2]);
        // Triangle 2: n1, n3, n4
        triangleIndices.push(e[0], e[2], e[3]);
      }
      // Skip 2-node elements (lines)
    });

    colorMap.geometry.setIndex(
      new THREE.Uint16BufferAttribute(triangleIndices, 1)
    );

    colorMap.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(nodes.val.map(() => [0, 0, 0]).flat(), 3)
    );

    // Update colors
    const filteredValues = values.val.filter(v => !isNaN(v) && isFinite(v));
    if (filteredValues.length === 0) return;
    lut.setMax(Math.max(...filteredValues));
    lut.setMin(Math.min(...filteredValues));

    for (let i = 0; i < values.val.length; i++) {
      const lutColor = lut.getColor(values.val[i]) ?? new THREE.Color(0, 0, 0);

      color.copy(lutColor).convertSRGBToLinear();
      color.multiplyScalar(0.6); // dim the color for better integration with mesh

      colorMap.geometry.attributes.color.setXYZ(i, color.r, color.g, color.b);
    }
  });

  return colorMap;
}
