import { v as t, a as K, g as ee } from "./styles-CmYpyXmR.js";
import { a as te } from "./analyze-BCxdQoUM.js";
import { d as ae, __tla as __tla_0 } from "./deformCpp-DpDj4ueE.js";
import { m as se, __tla as __tla_1 } from "./modalCpp-U1ltYCKc.js";
import { g as oe } from "./getParameters-a13Rdg56.js";
import { g as le } from "./getTables-CMr1Bo80.js";
import { g as ne } from "./getDialog-e1cRYq1Q.js";
import { __tla as __tla_2 } from "./getMesh-BoyenBpJ.js";
import { g as ie, a as me } from "./getQuadMesh-DBDCt0Fm.js";
import "./pureFunctionsAny.generated-BKlLJiMU.js";
import "./__vite-browser-external-D7Ct-6yo.js";
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
  })(),
  (() => {
    try {
      return __tla_2;
    } catch {
    }
  })()
]).then(async () => {
  const a = {
    Lx: {
      value: t.state(6),
      min: 2,
      max: 12,
      step: 0.5,
      label: "Lx (m)"
    },
    Ly: {
      value: t.state(4),
      min: 2,
      max: 8,
      step: 0.5,
      label: "Ly (m)"
    },
    nx: {
      value: t.state(6),
      min: 2,
      max: 12,
      step: 1,
      label: "nx divisions"
    },
    ny: {
      value: t.state(4),
      min: 2,
      max: 8,
      step: 1,
      label: "ny divisions"
    },
    columnHeight: {
      value: t.state(3),
      min: 2,
      max: 6,
      step: 0.5,
      label: "H col (m)"
    },
    slabThickness: {
      value: t.state(0.15),
      min: 0.1,
      max: 0.3,
      step: 0.01,
      label: "t slab (m)"
    },
    beamWidth: {
      value: t.state(0.3),
      min: 0.2,
      max: 0.5,
      step: 0.05,
      label: "b beam (m)"
    },
    beamHeight: {
      value: t.state(0.5),
      min: 0.3,
      max: 0.8,
      step: 0.05,
      label: "h beam (m)"
    },
    load_kN: {
      value: t.state(-10),
      min: -50,
      max: 0,
      step: 1,
      label: "Load (kN/m\xB2)"
    },
    modalMode: {
      value: t.state(1),
      min: 1,
      max: 6,
      step: 1,
      label: "Mode #"
    },
    modalScale: {
      value: t.state(50),
      min: 1,
      max: 200,
      step: 5,
      label: "Modal Scale"
    },
    modalSpeed: {
      value: t.state(1),
      min: 0.1,
      max: 3,
      step: 0.1,
      label: "Anim Speed"
    }
  }, p = {
    nodes: t.state([]),
    elements: t.state([]),
    nodeInputs: t.state({}),
    elementInputs: t.state({}),
    deformOutputs: t.state({}),
    analyzeOutputs: t.state({})
  }, Y = t.state(null), O = t.state([]), D = t.state([]), y = 3e10, Z = 0.2, F = 2500;
  async function de() {
    const L = a.Lx.value.val, R = a.Ly.value.val, l = Math.round(a.nx.value.val), c = Math.round(a.ny.value.val), B = a.columnHeight.value.val, X = a.slabThickness.value.val, v = a.beamWidth.value.val, f = a.beamHeight.value.val, N = a.load_kN.value.val * 1e3, { nodes: T, elements: x } = ie({
      Lx: L,
      Ly: R,
      nx: l,
      ny: c,
      z: B
    }), r = [
      ...T
    ], d = [
      ...x
    ], b = {
      supports: /* @__PURE__ */ new Map(),
      loads: /* @__PURE__ */ new Map()
    }, s = {
      elasticities: /* @__PURE__ */ new Map(),
      areas: /* @__PURE__ */ new Map(),
      momentsOfInertiaZ: /* @__PURE__ */ new Map(),
      momentsOfInertiaY: /* @__PURE__ */ new Map(),
      torsionalConstants: /* @__PURE__ */ new Map(),
      shearModuli: /* @__PURE__ */ new Map(),
      thicknesses: /* @__PURE__ */ new Map(),
      poissonsRatios: /* @__PURE__ */ new Map()
    }, S = /* @__PURE__ */ new Map();
    x.forEach((e, o) => {
      s.elasticities.set(o, y), s.thicknesses.set(o, X), s.poissonsRatios.set(o, Z), S.set(o, F);
    }), me(x, T, N).forEach((e, o) => {
      b.loads.set(o, e);
    });
    const j = [
      0,
      l,
      c * (l + 1) + l,
      c * (l + 1)
    ], z = y / (2 * (1 + Z)), g = 0.4, q = g * g, _ = g * Math.pow(g, 3) / 12, W = 0.141 * Math.pow(g, 4);
    j.forEach((e) => {
      const o = T[e], n = r.length;
      r.push([
        o[0],
        o[1],
        0
      ]);
      const i = d.length;
      d.push([
        n,
        e
      ]), s.elasticities.set(i, y), s.areas.set(i, q), s.momentsOfInertiaZ.set(i, _), s.momentsOfInertiaY.set(i, _), s.shearModuli.set(i, z), s.torsionalConstants.set(i, W), S.set(i, F), b.supports.set(n, [
        true,
        true,
        true,
        true,
        true,
        true
      ]);
    });
    const G = v * f, P = v * Math.pow(f, 3) / 12, J = f * Math.pow(v, 3) / 12, Q = Math.abs(v * Math.pow(f, 3) * (1 / 3 - 0.21 * f / v * (1 - Math.pow(f / v, 4) / 12)));
    function w(e, o) {
      const n = d.length;
      d.push([
        e,
        o
      ]), s.elasticities.set(n, y), s.areas.set(n, G), s.momentsOfInertiaZ.set(n, P), s.momentsOfInertiaY.set(n, J), s.shearModuli.set(n, z), s.torsionalConstants.set(n, Q), S.set(n, F);
    }
    for (let e = 0; e < l; e++) w(e, e + 1);
    const $ = c * (l + 1);
    for (let e = 0; e < l; e++) w($ + e, $ + e + 1);
    for (let e = 0; e < c; e++) w(e * (l + 1), (e + 1) * (l + 1));
    for (let e = 0; e < c; e++) w(e * (l + 1) + l, (e + 1) * (l + 1) + l);
    p.nodes.val = r, p.elements.val = d, p.nodeInputs.val = b, p.elementInputs.val = s;
    const I = ae(r, d, b, s);
    p.deformOutputs.val = I;
    const V = te(r, d, s, I);
    p.analyzeOutputs.val = V;
    const A = I.deformations, k = [];
    if (A) {
      let e = 0, o = 0;
      A.forEach((h, E) => {
        Math.abs(h[2]) > Math.abs(e) && (e = h[2], o = E);
      });
      const n = Math.floor(c / 2) * (l + 1) + Math.floor(l / 2), i = A.get(n), M = I.reactions;
      let m = 0;
      M && M.forEach((h) => {
        m += h[2];
      }), k.push([
        "Max Z displacement",
        `${(e * 1e3).toFixed(3)} mm`,
        `Node ${o}`
      ], [
        "Center displacement",
        `${(((i == null ? void 0 : i[2]) || 0) * 1e3).toFixed(3)} mm`,
        `Node ${n}`
      ], [
        "Total Rz (reactions)",
        `${(m / 1e3).toFixed(2)} kN`,
        ""
      ], [
        "Expected Rz",
        `${(Math.abs(N) * L * R / 1e3).toFixed(2)} kN`,
        "q*Lx*Ly"
      ]), console.log("=== STATIC ANALYSIS RESULTS ==="), console.log(`Max Z displacement: ${(e * 1e3).toFixed(3)} mm at node ${o}`), console.log(`Center displacement: ${(((i == null ? void 0 : i[2]) || 0) * 1e3).toFixed(3)} mm`), console.log(`Total Rz: ${(m / 1e3).toFixed(2)} kN (Expected: ${(Math.abs(N) * L * R / 1e3).toFixed(2)} kN)`);
    }
    D.val = k;
    try {
      console.log(`
=== MODAL ANALYSIS RUNNING ===`), console.log(`Total nodes: ${r.length}, Total elements: ${d.length}`), console.log(`Shell elements: ${x.length}, Frame elements: ${d.length - x.length}`);
      const e = await se(r, d, b, s, {
        densities: S,
        numModes: 6
      });
      Y.val = e;
      const o = [];
      let n = 0, i = 0, M = 0;
      for (let m = 1; m <= e.frequencies.size; m++) {
        const h = e.periods.get(m) || 0, E = e.frequencies.get(m) || 0, u = e.massParticipation.get(m);
        u && (n += u.UX, i += u.UY, M += u.RZ, o.push([
          m,
          h.toFixed(4),
          E.toFixed(3),
          (u.UX * 100).toFixed(1),
          (u.UY * 100).toFixed(1),
          (u.RZ * 100).toFixed(1),
          (n * 100).toFixed(1),
          (i * 100).toFixed(1),
          (M * 100).toFixed(1)
        ]));
      }
      O.val = o, console.log(`
=== MODAL ANALYSIS RESULTS (Compare with SAP2000/ETABS) ===`), console.log("Mode | T(s)   | f(Hz)  | UX%   | UY%   | RZ%   | SumUX | SumUY | SumRZ"), console.log("-".repeat(80)), o.forEach((m) => console.log(m.join(" | ")));
    } catch (e) {
      console.error("Modal analysis failed:", e), O.val = [
        [
          "Error",
          String(e),
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
  const U = /* @__PURE__ */ new Map();
  U.set("modal", {
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
    data: O
  });
  U.set("static", {
    text: "Static Results",
    fields: [
      {
        field: "A",
        text: "Description"
      },
      {
        field: "B",
        text: "Value"
      },
      {
        field: "C",
        text: "Notes"
      }
    ],
    data: D
  });
  const C = t.state(""), H = t.state(void 0);
  t.derive(() => {
    C.val === "Results" && (H.val = le({
      tables: U
    }));
  });
  t.derive(async () => {
    a.Lx.value.val, a.Ly.value.val, a.nx.value.val, a.ny.value.val, a.columnHeight.value.val, a.slabThickness.value.val, a.beamWidth.value.val, a.beamHeight.value.val, a.load_kN.value.val, await de();
  });
  document.body.append(K({
    clickedButton: C,
    buttons: [
      "Results"
    ],
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/frames-shells/main.ts",
    author: "https://awatif.co"
  }), ne({
    dialogBody: H
  }), oe(a), ee({
    mesh: p,
    modalOutputs: Y,
    settingsObj: {
      nodes: false,
      elements: true,
      deformedShape: false,
      loads: true,
      supports: true,
      shellResults: "displacementZ",
      gridSize: 15,
      viewType: "3D",
      viewZLevel: 3,
      modalMode: a.modalMode.value.val,
      modalScale: a.modalScale.value.val,
      modalSpeed: a.modalSpeed.value.val,
      modalAnimate: false
    }
  }));
});
