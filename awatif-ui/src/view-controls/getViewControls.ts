/**
 * View Controls Component
 * Provides buttons to switch between Plan, Elevation, and 3D views
 * Similar to SAP2000/ETABS view controls
 */
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import van, { State } from "vanjs-core";

import "./styles.css";

export type ViewType = "3D" | "plan" | "front" | "back" | "left" | "right";

export interface ViewControlsOptions {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  controls: OrbitControls;
  gridSize: number;
  onViewChange?: (view: ViewType) => void;
  zLevel?: State<number>;  // For plan view at specific Z level
}

export interface ViewControlsResult {
  element: HTMLDivElement;
  currentView: State<ViewType>;
  setView: (view: ViewType) => void;
}

export function getViewControls(options: ViewControlsOptions): ViewControlsResult {
  const { camera, controls, gridSize, onViewChange, zLevel } = options;

  const currentView: State<ViewType> = van.state("3D");
  const currentZLevel: State<number> = zLevel || van.state(0);

  // Create control panel
  const element = document.createElement("div");
  element.id = "view-controls";

  // View buttons
  const views: { label: string; view: ViewType; tooltip: string }[] = [
    { label: "3D", view: "3D", tooltip: "Isometric 3D View" },
    { label: "XY", view: "plan", tooltip: "Plan View (Top)" },
    { label: "XZ", view: "front", tooltip: "Front Elevation" },
    { label: "YZ", view: "left", tooltip: "Left Elevation" },
  ];

  views.forEach(({ label, view, tooltip }) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.title = tooltip;
    btn.className = view === "3D" ? "active" : "";
    btn.onclick = () => setView(view);
    element.appendChild(btn);
  });

  // Z Level control for plan view
  const zLevelContainer = document.createElement("div");
  zLevelContainer.id = "z-level-container";
  zLevelContainer.style.display = "none";

  const zLabel = document.createElement("label");
  zLabel.textContent = "Z: ";
  const zInput = document.createElement("input");
  zInput.type = "number";
  zInput.step = "0.5";
  zInput.value = String(currentZLevel.val);
  zInput.style.width = "60px";
  zInput.onchange = () => {
    currentZLevel.val = parseFloat(zInput.value);
    if (currentView.val === "plan") {
      setView("plan");
    }
  };

  zLevelContainer.appendChild(zLabel);
  zLevelContainer.appendChild(zInput);
  element.appendChild(zLevelContainer);

  // Distance factor for camera positioning
  const distance = gridSize * 2;
  const center = new THREE.Vector3(gridSize * 0.5, gridSize * 0.5, 0);

  function setView(view: ViewType) {
    currentView.val = view;

    // Update button states
    element.querySelectorAll("button").forEach((btn) => {
      btn.className = btn.textContent === view ||
        (view === "plan" && btn.textContent === "XY") ||
        (view === "front" && btn.textContent === "XZ") ||
        (view === "left" && btn.textContent === "YZ")
        ? "active" : "";
    });

    // Show/hide Z level control
    zLevelContainer.style.display = view === "plan" ? "inline-block" : "none";

    // Calculate target based on view
    const targetZ = view === "plan" ? currentZLevel.val : center.z;
    const target = new THREE.Vector3(center.x, center.y, targetZ);

    switch (view) {
      case "3D":
        // Isometric view
        camera.position.set(
          center.x + distance * 0.7,
          center.y - distance * 0.7,
          distance * 0.5
        );
        camera.up.set(0, 0, 1);
        break;

      case "plan":
        // Top view (looking down -Z)
        camera.position.set(center.x, center.y, distance);
        camera.up.set(0, 1, 0);
        break;

      case "front":
        // Front elevation (looking from -Y)
        camera.position.set(center.x, -distance, center.z);
        camera.up.set(0, 0, 1);
        break;

      case "back":
        // Back elevation (looking from +Y)
        camera.position.set(center.x, distance, center.z);
        camera.up.set(0, 0, 1);
        break;

      case "left":
        // Left elevation (looking from -X)
        camera.position.set(-distance, center.y, center.z);
        camera.up.set(0, 0, 1);
        break;

      case "right":
        // Right elevation (looking from +X)
        camera.position.set(distance, center.y, center.z);
        camera.up.set(0, 0, 1);
        break;
    }

    controls.target.copy(target);
    controls.update();

    if (onViewChange) {
      onViewChange(view);
    }
  }

  return {
    element,
    currentView,
    setView,
  };
}
