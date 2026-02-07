/**
 * Modal Animation Component
 * Animates mode shapes from modal analysis
 */
import van, { State } from "vanjs-core";
import { Node } from "awatif-fem";
import { ModalOutputs } from "awatif-fem";

import "./styles.css";

export interface ModalAnimationOptions {
  nodes: State<Node[]>;           // Original node positions
  modalOutputs: State<ModalOutputs | null>;  // Modal analysis results
  scale?: number;                 // Deformation scale factor (default: 100)
  speed?: number;                 // Animation speed (default: 1)
}

export interface ModalAnimationResult {
  element: HTMLDivElement;        // UI control panel
  animatedNodes: State<Node[]>;   // Animated node positions (use this in viewer)
  currentMode: State<number>;     // Current mode being animated
  isPlaying: State<boolean>;      // Animation playing state
}

/**
 * Creates a modal animation controller
 * Returns animated node positions that can be passed to the viewer
 */
export function getModalAnimation(options: ModalAnimationOptions): ModalAnimationResult {
  const { nodes, modalOutputs, scale = 100, speed = 1 } = options;

  // State
  const animatedNodes: State<Node[]> = van.state([]);
  const currentMode: State<number> = van.state(1);
  const isPlaying: State<boolean> = van.state(false);
  const animationScale: State<number> = van.state(scale);
  const animationSpeed: State<number> = van.state(speed);

  // Animation state
  let animationFrameId: number | null = null;
  let startTime: number = 0;

  // Create control panel
  const element = document.createElement("div");
  element.id = "modal-animation-controls";

  // Mode selector
  const modeLabel = document.createElement("label");
  modeLabel.textContent = "Mode: ";
  const modeSelect = document.createElement("select");
  modeSelect.id = "mode-select";

  // Play/Pause button
  const playButton = document.createElement("button");
  playButton.id = "play-btn";
  playButton.textContent = "Play";

  // Scale slider
  const scaleLabel = document.createElement("label");
  scaleLabel.textContent = "Scale: ";
  const scaleInput = document.createElement("input");
  scaleInput.type = "range";
  scaleInput.min = "1";
  scaleInput.max = "500";
  scaleInput.value = String(scale);
  scaleInput.id = "scale-slider";

  const scaleValue = document.createElement("span");
  scaleValue.id = "scale-value";
  scaleValue.textContent = String(scale);

  // Speed slider
  const speedLabel = document.createElement("label");
  speedLabel.textContent = "Speed: ";
  const speedInput = document.createElement("input");
  speedInput.type = "range";
  speedInput.min = "0.1";
  speedInput.max = "5";
  speedInput.step = "0.1";
  speedInput.value = String(speed);
  speedInput.id = "speed-slider";

  const speedValue = document.createElement("span");
  speedValue.id = "speed-value";
  speedValue.textContent = String(speed);

  // Frequency display
  const freqDisplay = document.createElement("span");
  freqDisplay.id = "freq-display";
  freqDisplay.textContent = "f = -- Hz";

  // Assemble UI
  element.appendChild(modeLabel);
  element.appendChild(modeSelect);
  element.appendChild(playButton);
  element.appendChild(document.createElement("br"));
  element.appendChild(scaleLabel);
  element.appendChild(scaleInput);
  element.appendChild(scaleValue);
  element.appendChild(document.createElement("br"));
  element.appendChild(speedLabel);
  element.appendChild(speedInput);
  element.appendChild(speedValue);
  element.appendChild(document.createElement("br"));
  element.appendChild(freqDisplay);

  // Initialize animated nodes
  animatedNodes.val = [...nodes.val];

  // Animation function
  function animate(timestamp: number) {
    if (!isPlaying.val) return;

    if (startTime === 0) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000; // seconds

    const outputs = modalOutputs.val;
    if (!outputs || !outputs.modeShapes.has(currentMode.val)) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    const modeShape = outputs.modeShapes.get(currentMode.val)!;
    const freq = outputs.frequencies.get(currentMode.val) || 1;
    const omega = 2 * Math.PI * freq * animationSpeed.val;

    // Sinusoidal variation: sin(ωt)
    const factor = Math.sin(omega * elapsed) * animationScale.val;

    // Update node positions
    const newNodes: Node[] = nodes.val.map((node, i) => {
      const dx = modeShape[i * 6 + 0] * factor;
      const dy = modeShape[i * 6 + 1] * factor;
      const dz = modeShape[i * 6 + 2] * factor;
      return [node[0] + dx, node[1] + dy, node[2] + dz] as Node;
    });

    animatedNodes.val = newNodes;

    animationFrameId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationFrameId !== null) return;
    startTime = 0;
    isPlaying.val = true;
    playButton.textContent = "Pause";
    animationFrameId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isPlaying.val = false;
    playButton.textContent = "Play";
    // Reset to original positions
    animatedNodes.val = [...nodes.val];
  }

  // Event handlers
  playButton.onclick = () => {
    if (isPlaying.val) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };

  scaleInput.oninput = () => {
    animationScale.val = parseFloat(scaleInput.value);
    scaleValue.textContent = scaleInput.value;
  };

  speedInput.oninput = () => {
    animationSpeed.val = parseFloat(speedInput.value);
    speedValue.textContent = speedInput.value;
  };

  modeSelect.onchange = () => {
    currentMode.val = parseInt(modeSelect.value);
    startTime = 0; // Reset animation phase
    updateFreqDisplay();
  };

  function updateFreqDisplay() {
    const outputs = modalOutputs.val;
    if (outputs && outputs.frequencies.has(currentMode.val)) {
      const f = outputs.frequencies.get(currentMode.val)!;
      const T = outputs.periods.get(currentMode.val)!;
      freqDisplay.textContent = `f = ${f.toFixed(3)} Hz, T = ${T.toFixed(4)} s`;
    }
  }

  // Update mode selector when modal outputs change
  van.derive(() => {
    const outputs = modalOutputs.val;
    if (!outputs) return;

    // Clear existing options
    modeSelect.innerHTML = "";

    // Add mode options
    outputs.frequencies.forEach((freq, mode) => {
      const option = document.createElement("option");
      option.value = String(mode);
      option.textContent = `Mode ${mode} (${freq.toFixed(2)} Hz)`;
      modeSelect.appendChild(option);
    });

    // Set first mode as default
    if (outputs.frequencies.size > 0) {
      currentMode.val = 1;
      modeSelect.value = "1";
      updateFreqDisplay();
    }
  });

  // Update animated nodes when original nodes change
  van.derive(() => {
    if (!isPlaying.val) {
      animatedNodes.val = [...nodes.val];
    }
  });

  return {
    element,
    animatedNodes,
    currentMode,
    isPlaying,
  };
}
