import { v as a, a as J, g as G } from "./styles-CmYpyXmR.js";
import { __tla as __tla_0 } from "./deformCpp-DpDj4ueE.js";
import { m as V, __tla as __tla_1 } from "./modalCpp-U1ltYCKc.js";
import { g as j } from "./getParameters-a13Rdg56.js";
import { g as k } from "./getTables-CMr1Bo80.js";
import { g as W } from "./getDialog-e1cRYq1Q.js";
Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })(),
  (() => {
    try {
      return __tla_1;
    } catch {
    }
  })()
]).then(async () => {
  console.log("=== CARGANDO NAVE INDUSTRIAL ===");
  const m = {
    span: {
      value: a.state(12),
      min: 8,
      max: 24,
      step: 2,
      label: "Span (m)"
    },
    columnHeight: {
      value: a.state(6),
      min: 4,
      max: 10,
      step: 0.5,
      label: "Column H (m)"
    },
    trussHeight: {
      value: a.state(2),
      min: 1,
      max: 4,
      step: 0.5,
      label: "Truss H (m)"
    },
    numFrames: {
      value: a.state(4),
      min: 2,
      max: 8,
      step: 1,
      label: "Num Frames"
    },
    frameSpacing: {
      value: a.state(6),
      min: 4,
      max: 10,
      step: 1,
      label: "Frame Spacing (m)"
    },
    numPanels: {
      value: a.state(6),
      min: 4,
      max: 12,
      step: 2,
      label: "Truss Panels"
    },
    modalMode: {
      value: a.state(1),
      min: 1,
      max: 6,
      step: 1,
      label: "Mode #"
    },
    modalScale: {
      value: a.state(20),
      min: 1,
      max: 100,
      step: 5,
      label: "Modal Scale"
    },
    modalSpeed: {
      value: a.state(0.5),
      min: 0.01,
      max: 5,
      step: 0.05,
      label: "Anim Speed"
    }
  }, $ = {
    nodes: a.state([]),
    elements: a.state([]),
    nodeInputs: a.state({}),
    elementInputs: a.state({}),
    deformOutputs: a.state({}),
    analyzeOutputs: a.state({})
  }, Y = a.state(null), R = a.state([]), Z = 21e10, K = 0.3, Q = 7850, ee = Z / (2 * (1 + K)), S = 0.2, y = 6e-3, H = S - 2 * y, te = S * S - H * H, D = (Math.pow(S, 4) - Math.pow(H, 4)) / 12, N = Math.pow(S - y, 2), ae = 4 * (S - y), se = 4 * N * N * y / ae, B = {
    A: te,
    Iz: D,
    Iy: D,
    J: se
  }, _ = 0.15, A = 0.1, h = 3e-3, T = _ - 2 * h, P = A - 2 * h, oe = _ * A - T * P, le = (_ * Math.pow(A, 3) - T * Math.pow(P, 3)) / 12, ne = (A * Math.pow(_, 3) - P * Math.pow(T, 3)) / 12, E = (_ - h) * (A - h), ie = 2 * (_ - h) + 2 * (A - h), me = 4 * E * E * h / ie, f = {
    A: oe,
    Iz: le,
    Iy: ne,
    J: me
  };
  function g(x, d, I, M, F, s) {
    const l = x.length;
    x.push([
      M,
      F
    ]), d.elasticities.set(l, Z), d.areas.set(l, s.A), d.momentsOfInertiaZ.set(l, s.Iz), d.momentsOfInertiaY.set(l, s.Iy), d.torsionalConstants.set(l, s.J), d.shearModuli.set(l, ee), I.set(l, Q);
  }
  async function ue() {
    var _a;
    const x = m.span.value.val, d = m.columnHeight.value.val, I = m.trussHeight.value.val, M = Math.round(m.numFrames.value.val), F = m.frameSpacing.value.val, s = Math.round(m.numPanels.value.val), l = [], u = [], w = {
      supports: /* @__PURE__ */ new Map(),
      loads: /* @__PURE__ */ new Map()
    }, r = {
      elasticities: /* @__PURE__ */ new Map(),
      areas: /* @__PURE__ */ new Map(),
      momentsOfInertiaZ: /* @__PURE__ */ new Map(),
      momentsOfInertiaY: /* @__PURE__ */ new Map(),
      torsionalConstants: /* @__PURE__ */ new Map(),
      shearModuli: /* @__PURE__ */ new Map()
    }, p = /* @__PURE__ */ new Map(), C = x / s, O = s / 2, z = [];
    for (let t = 0; t < M; t++) {
      const c = t * F, n = [];
      for (let e = 0; e <= s; e++) {
        const U = e * C;
        l.push([
          U,
          c,
          d
        ]), n.push(l.length - 1);
      }
      const i = [];
      for (let e = 0; e <= s; e++) if (e === 0 || e === s) i.push(n[e]);
      else {
        const U = e * C;
        let v;
        e <= O ? v = d + e / O * I : v = d + (s - e) / O * I, l.push([
          U,
          c,
          v
        ]), i.push(l.length - 1);
      }
      const b = l.length;
      l.push([
        0,
        c,
        0
      ]);
      const o = l.length;
      l.push([
        x,
        c,
        0
      ]), z.push({
        bottom: n,
        top: i,
        leftBase: b,
        rightBase: o
      }), g(u, r, p, b, n[0], B), g(u, r, p, o, n[s], B);
      for (let e = 0; e < s; e++) g(u, r, p, n[e], n[e + 1], f);
      for (let e = 0; e < s; e++) g(u, r, p, i[e], i[e + 1], f);
      for (let e = 1; e < s; e++) g(u, r, p, n[e], i[e], f);
      for (let e = 0; e < s; e++) e < O ? g(u, r, p, n[e], i[e + 1], f) : g(u, r, p, n[e + 1], i[e], f);
      w.supports.set(b, [
        true,
        true,
        true,
        true,
        true,
        true
      ]), w.supports.set(o, [
        true,
        true,
        true,
        true,
        true,
        true
      ]);
    }
    for (let t = 0; t < M - 1; t++) {
      const c = z[t], n = z[t + 1];
      for (let i = 0; i <= s; i++) g(u, r, p, c.top[i], n.top[i], f);
      g(u, r, p, c.bottom[0], n.bottom[0], f), g(u, r, p, c.bottom[s], n.bottom[s], f);
    }
    $.nodes.val = l, $.elements.val = u, $.nodeInputs.val = w, $.elementInputs.val = r, console.log(`
=== NAVE INDUSTRIAL CON CERCHAS ===`), console.log(`Luz: ${x}m, Altura columna: ${d}m, Altura cercha: ${I}m`), console.log(`P\xF3rticos: ${M}, Separaci\xF3n: ${F}m, Paneles: ${s}`), console.log(`Longitud total: ${(M - 1) * F}m`), console.log(`Nodos: ${l.length}, Elementos: ${u.length}`);
    try {
      console.log(`
=== AN\xC1LISIS MODAL ===`);
      const t = await V(l, u, w, r, {
        densities: p,
        numModes: 6
      });
      Y.val = t, console.log("Modal outputs:", {
        frequencies: t.frequencies,
        periods: t.periods,
        massParticipation: t.massParticipation,
        freqSize: (_a = t.frequencies) == null ? void 0 : _a.size
      });
      const c = [];
      let n = 0, i = 0, b = 0;
      for (let o = 1; o <= t.frequencies.size; o++) {
        const e = t.periods.get(o) || 0, U = t.frequencies.get(o) || 0, v = t.massParticipation.get(o);
        v && (n += v.UX, i += v.UY, b += v.RZ, c.push([
          o,
          e.toFixed(4),
          U.toFixed(3),
          (v.UX * 100).toFixed(1),
          (v.UY * 100).toFixed(1),
          (v.RZ * 100).toFixed(1),
          (n * 100).toFixed(1),
          (i * 100).toFixed(1),
          (b * 100).toFixed(1)
        ]));
      }
      R.val = c, console.log("Table data filled:", c.length, "rows"), console.log(`
Mode | T(s)     | f(Hz)   | UX%   | UY%   | RZ%   | SumUX | SumUY | SumRZ`), console.log("-".repeat(80)), c.forEach((o) => {
        console.log(`${o[0]}    | ${o[1]} | ${o[2]}  | ${o[3]}  | ${o[4]}  | ${o[5]}  | ${o[6]}  | ${o[7]}  | ${o[8]}`);
      });
    } catch (t) {
      console.error("Modal analysis failed:", t), R.val = [
        [
          "Error",
          String(t),
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        ]
      ];
    }
  }
  const X = /* @__PURE__ */ new Map();
  X.set("modal", {
    text: "Resultados Modales",
    fields: [
      {
        field: "A",
        text: "Modo"
      },
      {
        field: "B",
        text: "T (s)"
      },
      {
        field: "C",
        text: "f (Hz)"
      },
      {
        field: "D",
        text: "UX %"
      },
      {
        field: "E",
        text: "UY %"
      },
      {
        field: "F",
        text: "RZ %"
      },
      {
        field: "G",
        text: "SumUX"
      },
      {
        field: "H",
        text: "SumUY"
      },
      {
        field: "I",
        text: "SumRZ"
      }
    ],
    data: R
  });
  const q = a.state(""), L = a.state(void 0);
  a.derive(() => {
    q.val === "Results" && (console.log("Opening Results dialog, table data:", R.val), L.val = k({
      tables: X
    }));
  });
  a.derive(async () => {
    m.span.value.val, m.columnHeight.value.val, m.trussHeight.value.val, m.numFrames.value.val, m.frameSpacing.value.val, m.numPanels.value.val, await ue();
  });
  document.body.append(J({
    clickedButton: q,
    buttons: [
      "Results"
    ],
    sourceCode: "https://github.com/madil4/awatif",
    author: "Nave Industrial - Awatif"
  }), W({
    dialogBody: L
  }), j(m), G({
    mesh: $,
    modalOutputs: Y,
    settingsObj: {
      nodes: true,
      elements: true,
      deformedShape: false,
      loads: false,
      supports: true,
      gridSize: 25,
      viewType: "3D",
      modalMode: m.modalMode.value.val,
      modalScale: m.modalScale.value.val,
      modalSpeed: m.modalSpeed.value.val,
      modalAnimate: false
    }
  }));
});
