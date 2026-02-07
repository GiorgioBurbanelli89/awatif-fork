/**
 * IFC Viewer - Awatif Example
 * ===========================
 *
 * Visor de archivos IFC usando Three.js y web-ifc
 *
 * Funcionalidades:
 * - Cargar archivos .ifc
 * - Visualizar geometria 3D
 * - Orbitar, hacer zoom y pan
 * - Ver informacion del modelo
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as WebIFC from "web-ifc";

// Elementos DOM
const canvas = document.getElementById("viewer") as HTMLCanvasElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const btnLoad = document.getElementById("btnLoad") as HTMLButtonElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const infoContent = document.getElementById("infoContent") as HTMLPreElement;
const loadingEl = document.getElementById("loading") as HTMLDivElement;

// Escena Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camara
const camera = new THREE.PerspectiveCamera(
  75,
  (window.innerWidth - 300) / window.innerHeight,
  0.1,
  10000
);
camera.position.set(20, 20, 20);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth - 300, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Controles de orbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 50, 50);
scene.add(dirLight);

// Grid
const grid = new THREE.GridHelper(100, 100, 0x444444, 0x333333);
scene.add(grid);

// Axes helper
const axes = new THREE.AxesHelper(10);
scene.add(axes);

// Grupo para el modelo IFC
let modelGroup: THREE.Group | null = null;

// API de web-ifc
let ifcApi: WebIFC.IfcAPI | null = null;

// Colores por tipo IFC
const ifcColors: { [key: number]: number } = {
  [WebIFC.IFCSLAB]: 0x808080,        // Gris - Losas
  [WebIFC.IFCCOLUMN]: 0xff6b6b,      // Rojo - Columnas
  [WebIFC.IFCBEAM]: 0x4ecdc4,        // Cyan - Vigas
  [WebIFC.IFCWALL]: 0xf9ca24,        // Amarillo - Muros
  [WebIFC.IFCFOOTING]: 0x6c5ce7,     // Purpura - Zapatas
  [WebIFC.IFCROOF]: 0xa8e6cf,        // Verde claro - Techos
  [WebIFC.IFCSTAIR]: 0xfdcb6e,       // Naranja - Escaleras
  [WebIFC.IFCDOOR]: 0x74b9ff,        // Azul claro - Puertas
  [WebIFC.IFCWINDOW]: 0x81ecec,      // Cyan claro - Ventanas
};

// Inicializar web-ifc
async function initIfcApi() {
  statusEl.textContent = "Inicializando web-ifc...";
  ifcApi = new WebIFC.IfcAPI();

  // Configurar path para WASM
  await ifcApi.Init();

  statusEl.textContent = "Listo para cargar archivos IFC";
}

// Cargar archivo IFC
async function loadIfcFile(file: File) {
  if (!ifcApi) {
    await initIfcApi();
  }

  loadingEl.style.display = "block";
  statusEl.textContent = `Cargando ${file.name}...`;

  try {
    // Leer archivo
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    // Abrir modelo
    const modelID = ifcApi!.OpenModel(data);

    // Obtener geometria
    const flatMeshes = ifcApi!.LoadAllGeometry(modelID);

    // Limpiar modelo anterior
    if (modelGroup) {
      scene.remove(modelGroup);
      modelGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
    }

    modelGroup = new THREE.Group();

    // Estadisticas
    const stats = {
      meshes: 0,
      vertices: 0,
      faces: 0,
    };

    // Procesar cada mesh
    for (let i = 0; i < flatMeshes.size(); i++) {
      const mesh = flatMeshes.get(i);
      const geometry = mesh.geometries;

      for (let j = 0; j < geometry.size(); j++) {
        const geom = geometry.get(j);
        const verts = ifcApi!.GetVertexArray(
          geom.geometryExpressID,
          modelID
        );
        const indices = ifcApi!.GetIndexArray(
          geom.geometryExpressID,
          modelID
        );

        if (verts.length === 0) continue;

        // Crear geometria Three.js
        const threeGeom = new THREE.BufferGeometry();

        // Vertices (x, y, z, nx, ny, nz por vertice)
        const positions: number[] = [];
        const normals: number[] = [];

        for (let k = 0; k < verts.length; k += 6) {
          positions.push(verts[k], verts[k + 1], verts[k + 2]);
          normals.push(verts[k + 3], verts[k + 4], verts[k + 5]);
        }

        threeGeom.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );
        threeGeom.setAttribute(
          "normal",
          new THREE.Float32BufferAttribute(normals, 3)
        );
        threeGeom.setIndex(Array.from(indices));

        // Obtener tipo IFC para el color
        const expressID = mesh.expressID;
        let color = 0xcccccc; // Color por defecto

        try {
          const props = ifcApi!.GetLine(modelID, expressID);
          const typeID = props?.constructor?.name;
          // Intentar obtener color del tipo
          for (const [type, c] of Object.entries(ifcColors)) {
            if (expressID === parseInt(type)) {
              color = c as number;
              break;
            }
          }
        } catch (e) {
          // Usar color por defecto
        }

        // Material
        const material = new THREE.MeshPhongMaterial({
          color,
          side: THREE.DoubleSide,
          flatShading: false,
        });

        // Crear mesh
        const threeMesh = new THREE.Mesh(threeGeom, material);

        // Aplicar transformacion
        const matrix = new THREE.Matrix4();
        matrix.fromArray(geom.flatTransformation);
        threeMesh.applyMatrix4(matrix);

        modelGroup.add(threeMesh);

        stats.meshes++;
        stats.vertices += positions.length / 3;
        stats.faces += indices.length / 3;
      }
    }

    scene.add(modelGroup);

    // Centrar camara en el modelo
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    camera.position.set(
      center.x + maxDim,
      center.y + maxDim,
      center.z + maxDim
    );
    controls.target.copy(center);
    controls.update();

    // Mostrar info
    infoContent.textContent = `Archivo: ${file.name}
Meshes: ${stats.meshes}
Vertices: ${stats.vertices.toLocaleString()}
Caras: ${stats.faces.toLocaleString()}
Dimensiones:
  X: ${size.x.toFixed(2)} m
  Y: ${size.y.toFixed(2)} m
  Z: ${size.z.toFixed(2)} m`;

    statusEl.textContent = `Modelo cargado: ${stats.meshes} meshes`;

    // Cerrar modelo en web-ifc
    ifcApi!.CloseModel(modelID);
  } catch (error) {
    console.error("Error cargando IFC:", error);
    statusEl.textContent = `Error: ${error}`;
  } finally {
    loadingEl.style.display = "none";
  }
}

// Event listeners
btnLoad.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    loadIfcFile(file);
  }
});

btnReset.addEventListener("click", () => {
  camera.position.set(20, 20, 20);
  controls.target.set(0, 0, 0);
  controls.update();
});

// Resize handler
window.addEventListener("resize", () => {
  const width = window.innerWidth - 300;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Cargar modelo desde URL
async function loadIfcFromUrl(url: string) {
  if (!ifcApi) {
    await initIfcApi();
  }

  loadingEl.style.display = "block";
  statusEl.textContent = `Cargando ${url}...`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();

    // Crear un File-like object
    const blob = new Blob([buffer]);
    const file = new File([blob], url.split('/').pop() || 'modelo.ifc');

    await loadIfcFile(file);
  } catch (error) {
    console.error("Error cargando IFC desde URL:", error);
    statusEl.textContent = `Error: ${error}`;
    loadingEl.style.display = "none";
  }
}

// Iniciar
initIfcApi().then(() => {
  animate();
  // Cargar modelo de ejemplo automaticamente
  loadIfcFromUrl('./modelo.ifc');
});
