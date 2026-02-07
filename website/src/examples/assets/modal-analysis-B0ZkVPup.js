import { v as o, a as se, g as oe } from "./styles-C0SegVHg.js";
import { a as ne } from "./analyze-BCxdQoUM.js";
import { d as ae, __tla as __tla_0 } from "./deformCpp-DW1XeNIf.js";
import { m as le, __tla as __tla_1 } from "./modalCpp-BCLz1dKn.js";
import { g as me } from "./getParameters-CaQGHjhr.js";
import { g as ce } from "./getTables-CHkSh4ed.js";
import { g as ie } from "./getDialog-Dq3s-eU8.js";
import "./pureFunctionsAny.generated-BKlLJiMU.js";
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
  const a = {
    Lx: {
      value: o.state(10),
      min: 5,
      max: 20,
      step: 1,
      label: "Lx (m)"
    },
    Ly: {
      value: o.state(12),
      min: 5,
      max: 20,
      step: 1,
      label: "Ly (m)"
    },
    nx: {
      value: o.state(3),
      min: 2,
      max: 5,
      step: 1,
      label: "Columns X"
    },
    ny: {
      value: o.state(4),
      min: 2,
      max: 6,
      step: 1,
      label: "Columns Y"
    },
    nFloors: {
      value: o.state(2),
      min: 1,
      max: 5,
      step: 1,
      label: "Floors"
    },
    floorHeight: {
      value: o.state(3),
      min: 2,
      max: 5,
      step: 0.5,
      label: "Height (m)"
    },
    colSize: {
      value: o.state(0.4),
      min: 0.2,
      max: 0.8,
      step: 0.05,
      label: "Col (m)"
    },
    beamH: {
      value: o.state(0.5),
      min: 0.3,
      max: 0.8,
      step: 0.05,
      label: "Beam H (m)"
    }
  }, E = o.state([]), D = o.state([]), G = o.state({}), j = o.state({}), q = o.state({}), J = o.state({}), P = o.state([]);
  function ue() {
    const n = a.Lx.value.val, v = a.Ly.value.val, d = a.nx.value.val, l = a.ny.value.val, p = a.nFloors.value.val, x = a.floorHeight.value.val, y = n / (d - 1), b = v / (l - 1), m = [], r = [], c = [];
    for (let e = 0; e <= p; e++) {
      const t = e * x;
      c[e] = [];
      for (let s = 0; s < d; s++) {
        c[e][s] = [];
        for (let u = 0; u < l; u++) {
          const f = s * y, ee = u * b, te = m.length;
          m.push([
            f,
            ee,
            t
          ]), c[e][s][u] = te;
        }
      }
    }
    const i = [];
    for (let e = 0; e < p; e++) for (let t = 0; t < d; t++) for (let s = 0; s < l; s++) {
      const u = c[e][t][s], f = c[e + 1][t][s];
      i.push(r.length), r.push([
        u,
        f
      ]);
    }
    const h = [];
    for (let e = 1; e <= p; e++) for (let t = 0; t < d - 1; t++) for (let s = 0; s < l; s++) {
      const u = c[e][t][s], f = c[e][t + 1][s];
      h.push(r.length), r.push([
        u,
        f
      ]);
    }
    for (let e = 1; e <= p; e++) for (let t = 0; t < d; t++) for (let s = 0; s < l - 1; s++) {
      const u = c[e][t][s], f = c[e][t][s + 1];
      h.push(r.length), r.push([
        u,
        f
      ]);
    }
    const Y = /* @__PURE__ */ new Map();
    for (let e = 0; e < d; e++) for (let t = 0; t < l; t++) Y.set(c[0][e][t], [
      true,
      true,
      true,
      true,
      true,
      true
    ]);
    const N = /* @__PURE__ */ new Map(), I = 25e6, X = I / (2 * (1 + 0.2)), Z = 2.5, g = a.colSize.value.val, M = g, Q = g * M, C = g * Math.pow(M, 3) / 12, B = M * Math.pow(g, 3) / 12, W = C + B, w = 0.3, S = a.beamH.value.val, _ = w * S, T = w * Math.pow(S, 3) / 12, A = S * Math.pow(w, 3) / 12, $ = T + A, z = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map(), H = /* @__PURE__ */ new Map(), R = /* @__PURE__ */ new Map(), L = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map();
    for (const e of i) z.set(e, I), F.set(e, Q), U.set(e, C), H.set(e, B), R.set(e, X), L.set(e, W), O.set(e, Z);
    for (const e of h) z.set(e, I), F.set(e, _), U.set(e, T), H.set(e, A), R.set(e, X), L.set(e, $), O.set(e, Z);
    return {
      nodes: m,
      elements: r,
      nodeInputs: {
        supports: Y,
        loads: N
      },
      elementInputs: {
        elasticities: z,
        areas: F,
        momentsOfInertiaZ: U,
        momentsOfInertiaY: H,
        shearModuli: R,
        torsionalConstants: L
      },
      densities: O
    };
  }
  async function re() {
    const n = ue();
    E.val = n.nodes, D.val = n.elements, G.val = n.nodeInputs, j.val = n.elementInputs;
    const v = ae(n.nodes, n.elements, n.nodeInputs, n.elementInputs);
    q.val = v;
    const d = ne(n.nodes, n.elements, n.elementInputs, v);
    J.val = d;
    try {
      const l = await le(n.nodes, n.elements, n.nodeInputs, n.elementInputs, {
        densities: n.densities,
        numModes: 6
      }), p = [];
      let x = 0, y = 0, b = 0;
      for (let m = 1; m <= l.frequencies.size; m++) {
        const r = l.periods.get(m) || 0, c = l.frequencies.get(m) || 0, i = l.massParticipation.get(m);
        i && (x += i.UX, y += i.UY, b += i.RZ, p.push([
          m,
          r.toFixed(4),
          c.toFixed(3),
          (i.UX * 100).toFixed(1),
          (i.UY * 100).toFixed(1),
          (i.RZ * 100).toFixed(1),
          (x * 100).toFixed(1),
          (y * 100).toFixed(1),
          (b * 100).toFixed(1)
        ]));
      }
      P.val = p, console.log("Modal Analysis Results:"), console.log("Mode | T(s)   | f(Hz)  | UX%   | UY%   | RZ%   | SumUX | SumUY | SumRZ"), console.log("-".repeat(80)), p.forEach((m) => console.log(m.join(" | ")));
    } catch (l) {
      console.error("Modal analysis failed:", l);
    }
  }
  const k = /* @__PURE__ */ new Map();
  k.set("modal", {
    text: "Modal Results",
    fields: [
      {
        field: "A",
        text: "Mode"
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
        text: "SumUX %"
      },
      {
        field: "H",
        text: "SumUY %"
      },
      {
        field: "I",
        text: "SumRZ %"
      }
    ],
    data: P
  });
  const V = o.state(""), K = o.state(void 0);
  o.derive(() => {
    V.val === "Modal Results" && (K.val = ce({
      tables: k
    }));
  });
  o.derive(async () => {
    a.Lx.value.val, a.Ly.value.val, a.nx.value.val, a.ny.value.val, a.nFloors.value.val, a.floorHeight.value.val, a.colSize.value.val, a.beamH.value.val, await re();
  });
  document.body.append(se({
    clickedButton: V,
    buttons: [
      "Modal Results"
    ],
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/modal-analysis/index.ts"
  }), ie({
    dialogBody: K
  }), me(a), oe({
    mesh: {
      nodes: E,
      elements: D,
      nodeInputs: G,
      elementInputs: j,
      deformOutputs: q,
      analyzeOutputs: J
    },
    settingsObj: {
      gridSize: 20
    }
  }));
});
