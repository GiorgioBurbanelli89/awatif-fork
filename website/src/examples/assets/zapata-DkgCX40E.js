import { v as o, g as H, a as Q } from "./styles-C0SegVHg.js";
import { d as W, __tla as __tla_0 } from "./deformCpp-DW1XeNIf.js";
import { g as X } from "./getParameters-CaQGHjhr.js";
Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  const l = {
    "B (m)": {
      value: o.state(2),
      min: 1,
      max: 4,
      step: 0.1
    },
    "t (m)": {
      value: o.state(0.4),
      min: 0.2,
      max: 0.8,
      step: 0.05
    },
    "b_ped (m)": {
      value: o.state(0.4),
      min: 0.2,
      max: 0.6,
      step: 0.05
    },
    "h_ped (m)": {
      value: o.state(0.5),
      min: 0.3,
      max: 1,
      step: 0.1
    },
    "E (GPa)": {
      value: o.state(23.5),
      min: 15,
      max: 35,
      step: 0.5
    },
    "ks (MN/m\xB3)": {
      value: o.state(30),
      min: 5,
      max: 100,
      step: 5
    },
    "P (kN)": {
      value: o.state(100),
      min: 10,
      max: 500,
      step: 10
    },
    n: {
      value: o.state(4),
      min: 2,
      max: 8,
      step: 1
    }
  }, c = {
    nodes: o.state([]),
    elements: o.state([]),
    nodeInputs: o.state({}),
    elementInputs: o.state({}),
    deformOutputs: o.state({}),
    analyzeOutputs: o.state({})
  };
  o.derive(() => {
    var _a, _b;
    const p = l["B (m)"].value.val, g = p, P = l["t (m)"].value.val, d = l["b_ped (m)"].value.val, F = l["h_ped (m)"].value.val, b = l["E (GPa)"].value.val * 1e9, x = l["ks (MN/m\xB3)"].value.val * 1e6, I = -l["P (kN)"].value.val * 1e3, s = l.n.value.val, $ = 0.2, z = b / (2 * (1 + $)), u = g / s, f = p / s, v = [], n = [];
    let h = 0;
    for (let e = 0; e <= s; e++) {
      const t = [];
      for (let m = 0; m <= s; m++) {
        const r = -g / 2 + m * u, w = -p / 2 + e * f;
        v.push([
          r,
          w,
          0
        ]), t.push(h), h++;
      }
      n.push(t);
    }
    const _ = h;
    v.push([
      0,
      0,
      F
    ]), h++;
    const R = Math.floor(s / 2), J = Math.floor(s / 2), C = n[J][R], M = [], A = [];
    let k = 0;
    for (let e = 0; e < s; e++) for (let t = 0; t < s; t++) {
      const m = n[e][t], r = n[e][t + 1], w = n[e + 1][t + 1], G = n[e + 1][t];
      M.push([
        m,
        r,
        w,
        G
      ]), A.push(k), k++;
    }
    const i = k;
    M.push([
      C,
      _
    ]);
    const S = u * f, U = u * f / 2, Y = u * f / 4, E = /* @__PURE__ */ new Map();
    for (let e = 0; e <= s; e++) for (let t = 0; t <= s; t++) {
      const m = n[e][t];
      let r;
      (t === 0 || t === s) && (e === 0 || e === s) ? r = Y : t === 0 || t === s || e === 0 || e === s ? r = U : r = S;
      const D = x * r;
      E.set(m, [
        0,
        0,
        D,
        0,
        0,
        0
      ]);
    }
    const O = /* @__PURE__ */ new Map();
    O.set(n[0][0], [
      true,
      true,
      false,
      false,
      false,
      false
    ]), O.set(n[0][s], [
      false,
      true,
      false,
      false,
      false,
      false
    ]);
    const Z = /* @__PURE__ */ new Map();
    Z.set(_, [
      0,
      0,
      I,
      0,
      0,
      0
    ]);
    const B = {
      supports: O,
      loads: Z,
      springs: E
    }, a = {
      elasticities: /* @__PURE__ */ new Map(),
      thicknesses: /* @__PURE__ */ new Map(),
      poissonsRatios: /* @__PURE__ */ new Map(),
      shearModuli: /* @__PURE__ */ new Map(),
      areas: /* @__PURE__ */ new Map(),
      momentsOfInertiaZ: /* @__PURE__ */ new Map(),
      momentsOfInertiaY: /* @__PURE__ */ new Map(),
      torsionalConstants: /* @__PURE__ */ new Map()
    };
    A.forEach((e) => {
      a.elasticities.set(e, b), a.thicknesses.set(e, P), a.poissonsRatios.set(e, $), a.shearModuli.set(e, z);
    });
    const q = d * d, j = Math.pow(d, 4) / 12, K = 0.141 * Math.pow(d, 4);
    a.elasticities.set(i, b), a.areas.set(i, q), a.momentsOfInertiaZ.set(i, j), a.momentsOfInertiaY.set(i, j), a.torsionalConstants.set(i, K), a.shearModuli.set(i, z);
    const N = W(v, M, B, a);
    c.nodes.val = v, c.elements.val = M, c.nodeInputs.val = B, c.elementInputs.val = a, c.deformOutputs.val = N;
    const y = (_a = N.deformations) == null ? void 0 : _a.get(_), L = (_b = N.deformations) == null ? void 0 : _b.get(C), T = p * g, V = Math.abs(I) / (x * T);
    y && (console.log(`Zapata ${p}m x ${p}m, t=${P}m, ks=${x / 1e6} MN/m\xB3, P=${-I / 1e3}kN`), console.log(`  UZ pedestal: ${(y[2] * 1e3).toFixed(4)} mm`), console.log(`  UZ centro zapata: ${(((L == null ? void 0 : L[2]) ?? 0) * 1e3).toFixed(4)} mm`), console.log(`  w te\xF3rico (r\xEDgida): ${(V * 1e3).toFixed(4)} mm`));
  });
  document.body.append(X(l), H({
    mesh: c,
    settingsObj: {
      nodes: true,
      supports: true,
      loads: true,
      deformedShape: true,
      shellResults: "displacementZ",
      gridSize: 5
    }
  }), Q({
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/zapata/main.ts",
    author: "https://github.com/madil4"
  }));
});
