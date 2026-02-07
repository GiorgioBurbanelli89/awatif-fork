// Spectrum Chart - Grafica del espectro de respuesta NEC-SE-DS
// Dibuja Sa vs T con canvas

export interface SpectrumPoint {
  T: number;
  Sa: number;
}

export interface ModalPoint {
  T: number;
  Sa: number;
  mode: number;
  massParticipation: number;
}

export function createSpectrumChart(
  container: HTMLElement,
  spectrumCurve: SpectrumPoint[],
  modalPoints: ModalPoint[] = [],
  options: {
    width?: number;
    height?: number;
    title?: string;
    showGrid?: boolean;
  } = {}
): HTMLCanvasElement {
  const { width = 400, height = 250, title = "Espectro NEC-SE-DS", showGrid = true } = options;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.background = "#fff";
  canvas.style.borderRadius = "4px";

  const ctx = canvas.getContext("2d")!;

  // Clear
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // Margins
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Find data ranges
  const maxT = Math.max(...spectrumCurve.map(p => p.T), 2.0);
  const maxSa = Math.max(...spectrumCurve.map(p => p.Sa)) * 1.1;

  // Scale functions
  const scaleX = (T: number) => margin.left + (T / maxT) * plotWidth;
  const scaleY = (Sa: number) => margin.top + plotHeight - (Sa / maxSa) * plotHeight;

  // Draw grid
  if (showGrid) {
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let t = 0; t <= maxT; t += 0.5) {
      const x = scaleX(t);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    const saStep = maxSa > 1 ? 0.2 : 0.1;
    for (let sa = 0; sa <= maxSa; sa += saStep) {
      const y = scaleY(sa);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();
    }
  }

  // Draw axes
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotHeight);
  ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
  ctx.stroke();

  // Draw spectrum curve
  ctx.strokeStyle = "#0066cc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  spectrumCurve.forEach((point, i) => {
    const x = scaleX(point.T);
    const y = scaleY(point.Sa);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Fill under curve
  ctx.fillStyle = "rgba(0, 102, 204, 0.1)";
  ctx.beginPath();
  ctx.moveTo(scaleX(0), scaleY(0));
  spectrumCurve.forEach(point => {
    ctx.lineTo(scaleX(point.T), scaleY(point.Sa));
  });
  ctx.lineTo(scaleX(spectrumCurve[spectrumCurve.length - 1].T), scaleY(0));
  ctx.closePath();
  ctx.fill();

  // Draw modal points
  modalPoints.forEach(point => {
    const x = scaleX(point.T);
    const y = scaleY(point.Sa);

    // Vertical line from axis to point
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, margin.top + plotHeight);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Circle at point
    const radius = 4 + point.massParticipation * 6; // Size based on mass participation
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Mode label
    ctx.fillStyle = "#000";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`M${point.mode}`, x, y - radius - 4);
  });

  // Axis labels
  ctx.fillStyle = "#333";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("T (s)", margin.left + plotWidth / 2, height - 8);

  ctx.save();
  ctx.translate(15, margin.top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Sa (g)", 0, 0);
  ctx.restore();

  // Title
  ctx.font = "bold 12px sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 18);

  // Axis tick labels
  ctx.font = "10px monospace";
  ctx.fillStyle = "#666";
  ctx.textAlign = "center";

  // X-axis ticks
  for (let t = 0; t <= maxT; t += 0.5) {
    const x = scaleX(t);
    ctx.fillText(t.toFixed(1), x, margin.top + plotHeight + 15);
  }

  // Y-axis ticks
  ctx.textAlign = "right";
  const saStep = maxSa > 1 ? 0.2 : 0.1;
  for (let sa = 0; sa <= maxSa; sa += saStep) {
    const y = scaleY(sa);
    ctx.fillText(sa.toFixed(2), margin.left - 5, y + 4);
  }

  container.appendChild(canvas);
  return canvas;
}

// Update spectrum chart with new data
export function updateSpectrumChart(
  canvas: HTMLCanvasElement,
  spectrumCurve: SpectrumPoint[],
  modalPoints: ModalPoint[] = [],
  options: {
    title?: string;
  } = {}
): void {
  const { title = "Espectro NEC-SE-DS" } = options;
  const ctx = canvas.getContext("2d")!;
  const width = canvas.width;
  const height = canvas.height;

  // Clear
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // Margins
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Find data ranges
  const maxT = Math.max(...spectrumCurve.map(p => p.T), 2.0);
  const maxSa = Math.max(...spectrumCurve.map(p => p.Sa)) * 1.1;

  // Scale functions
  const scaleX = (T: number) => margin.left + (T / maxT) * plotWidth;
  const scaleY = (Sa: number) => margin.top + plotHeight - (Sa / maxSa) * plotHeight;

  // Draw grid
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;
  for (let t = 0; t <= maxT; t += 0.5) {
    const x = scaleX(t);
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + plotHeight);
    ctx.stroke();
  }
  const saStep = maxSa > 1 ? 0.2 : 0.1;
  for (let sa = 0; sa <= maxSa; sa += saStep) {
    const y = scaleY(sa);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + plotWidth, y);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotHeight);
  ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
  ctx.stroke();

  // Draw spectrum curve
  ctx.strokeStyle = "#0066cc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  spectrumCurve.forEach((point, i) => {
    const x = scaleX(point.T);
    const y = scaleY(point.Sa);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Fill under curve
  ctx.fillStyle = "rgba(0, 102, 204, 0.1)";
  ctx.beginPath();
  ctx.moveTo(scaleX(0), scaleY(0));
  spectrumCurve.forEach(point => {
    ctx.lineTo(scaleX(point.T), scaleY(point.Sa));
  });
  ctx.lineTo(scaleX(spectrumCurve[spectrumCurve.length - 1].T), scaleY(0));
  ctx.closePath();
  ctx.fill();

  // Draw modal points
  modalPoints.forEach(point => {
    const x = scaleX(point.T);
    const y = scaleY(point.Sa);

    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, margin.top + plotHeight);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);

    const radius = 4 + point.massParticipation * 6;
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`M${point.mode}`, x, y - radius - 4);
  });

  // Labels
  ctx.fillStyle = "#333";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("T (s)", margin.left + plotWidth / 2, height - 8);

  ctx.save();
  ctx.translate(15, margin.top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Sa (g)", 0, 0);
  ctx.restore();

  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 18);

  ctx.font = "10px monospace";
  ctx.fillStyle = "#666";
  ctx.textAlign = "center";
  for (let t = 0; t <= maxT; t += 0.5) {
    ctx.fillText(t.toFixed(1), scaleX(t), margin.top + plotHeight + 15);
  }
  ctx.textAlign = "right";
  for (let sa = 0; sa <= maxSa; sa += saStep) {
    ctx.fillText(sa.toFixed(2), margin.left - 5, scaleY(sa) + 4);
  }
}
