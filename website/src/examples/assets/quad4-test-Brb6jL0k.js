import { v as e, g as f, a as x } from "./styles-C0SegVHg.js";
import { a as h } from "./analyze-BCxdQoUM.js";
import { d as y, __tla as __tla_0 } from "./deformCpp-DW1XeNIf.js";
import { g } from "./getParameters-CaQGHjhr.js";
import { __tla as __tla_1 } from "./getMesh-BoyenBpJ.js";
import { g as I, a as b } from "./getQuadMesh-DBDCt0Fm.js";
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
  })()
]).then(async () => {
  const t = {
    Lx: {
      value: e.state(6),
      min: 2,
      max: 12,
      step: 0.5
    },
    Ly: {
      value: e.state(4),
      min: 2,
      max: 8,
      step: 0.5
    },
    nx: {
      value: e.state(6),
      min: 2,
      max: 12,
      step: 1
    },
    ny: {
      value: e.state(4),
      min: 2,
      max: 8,
      step: 1
    },
    thickness: {
      value: e.state(0.1),
      min: 0.05,
      max: 0.5,
      step: 0.01
    },
    E_GPa: {
      value: e.state(35),
      min: 10,
      max: 200,
      step: 5
    },
    load_kN: {
      value: e.state(-10),
      min: -50,
      max: 50,
      step: 1
    }
  }, a = {
    nodes: e.state([]),
    elements: e.state([]),
    nodeInputs: e.state({}),
    elementInputs: e.state({}),
    deformOutputs: e.state({}),
    analyzeOutputs: e.state({})
  };
  e.derive(() => {
    const m = t.Lx.value.val, p = t.Ly.value.val, u = Math.round(t.nx.value.val), r = Math.round(t.ny.value.val), i = t.thickness.value.val, v = t.E_GPa.value.val * 1e9, d = t.load_kN.value.val * 1e3, { nodes: l, elements: s, boundaryIndices: c } = I({
      Lx: m,
      Ly: p,
      nx: u,
      ny: r
    });
    a.nodeInputs.val = {
      supports: new Map(c.map((o) => [
        o,
        [
          false,
          false,
          true,
          false,
          false,
          false
        ]
      ])),
      loads: b(s, l, d)
    }, a.nodes.val = l, a.elements.val = s, a.elementInputs.val = {
      elasticities: new Map(s.map((o, n) => [
        n,
        v
      ])),
      thicknesses: new Map(s.map((o, n) => [
        n,
        i
      ])),
      poissonsRatios: new Map(s.map((o, n) => [
        n,
        0.15
      ]))
    }, a.deformOutputs.val = y(l, s, a.nodeInputs.val, a.elementInputs.val), a.analyzeOutputs.val = h(l, s, a.elementInputs.val, a.deformOutputs.val);
  });
  document.body.append(g(t), f({
    mesh: a,
    settingsObj: {
      nodes: false,
      elements: true,
      deformedShape: true,
      loads: true,
      supports: true,
      shellResults: "displacementZ"
    }
  }), x({
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/quad4-test/main.ts",
    author: "https://awatif.co"
  }));
});
