import { v as a, g as D, a as O } from "./styles-CmYpyXmR.js";
import { g as L } from "./getParameters-a13Rdg56.js";
import { g as x, a as G, b as H, c as j, d as C, __tla as __tla_0 } from "./getSolids-CfeiNJEQ.js";
import { __tla as __tla_1 } from "./getMesh-BoyenBpJ.js";
import "./__vite-browser-external-D7Ct-6yo.js";
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
  const f = {
    stories: {
      value: a.state(2),
      min: 1,
      max: 5,
      step: 1
    }
  }, s = {
    points: a.state([]),
    stories: a.state([]),
    columns: a.state([]),
    slabs: a.state([]),
    columnsByStory: a.state(/* @__PURE__ */ new Map()),
    slabsByStory: a.state(/* @__PURE__ */ new Map()),
    columnData: a.state(/* @__PURE__ */ new Map()),
    slabData: a.state(/* @__PURE__ */ new Map())
  }, i = {
    nodes: a.state([]),
    elements: a.state([]),
    nodeInputs: a.state({}),
    elementInputs: a.state({})
  }, u = [
    [
      0,
      0,
      4
    ],
    [
      0,
      10,
      4
    ],
    [
      18,
      10,
      4
    ],
    [
      18,
      0,
      4
    ],
    [
      0,
      0,
      4
    ]
  ], l = [
    [
      0,
      0,
      4
    ],
    [
      0,
      10,
      4
    ],
    [
      18,
      10,
      4
    ],
    [
      18,
      0,
      4
    ],
    [
      6,
      0,
      4
    ],
    [
      6,
      10,
      4
    ]
  ], B = x(), M = G(), v = a.state([
    M
  ]), T = a.state([
    B
  ]);
  a.derive(() => {
    const n = [], m = [], c = [], o = [], b = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
    for (let e = 0; e < f.stories.value.val; e++) {
      const p = [], y = 4 * e;
      for (let t = 0; t < u.length; t++) p.push([
        u[t][0],
        u[t][1],
        u[t][2] + y
      ]);
      const w = [];
      let I = n.length;
      for (let t = 0; t < p.length; t++) n.push(p[t]), w.push(t + I);
      c.push(w), m.push(I), d.set(e, [
        e
      ]), h.set(e, {
        analysisInput: {
          areaLoad: 1,
          isOpening: false
        }
      });
      const S = [];
      for (let t = 0; t < l.length; t++) {
        const r = n.length;
        n.push([
          l[t][0],
          l[t][1],
          l[t][2] + y
        ]), o.push(r), S.push(o.length - 1);
      }
      if (e === 0) {
        const t = o.length - l.length;
        for (let r = 0; r < l.length; r++) g.set(t + r, {
          analysisInput: {
            support: [
              true,
              true,
              true,
              true,
              true,
              true
            ]
          }
        });
      }
      b.set(e, S);
    }
    s.points.val = n, s.stories.val = m, s.slabs.val = c, s.columns.val = o, s.columnsByStory.val = b, s.slabsByStory.val = d, s.columnData.val = g, s.slabData.val = h;
  });
  a.derive(() => {
    const { nodes: n, elements: m, nodeInputs: c, elementInputs: o } = H(s.points.val, s.stories.val, s.columns.val, s.slabs.val, s.columnsByStory.val, s.slabsByStory.val, s.columnData.val, s.slabData.val);
    i.nodes.val = n, i.elements.val = m, i.nodeInputs.val = c, i.elementInputs.val = o, M.geometry = j(s.points.val, s.slabs.val, s.columns.val), B.geometry = C(s.points.val, s.slabs.val, s.columns.val), v.val = [
      ...v.rawVal
    ];
  });
  document.body.append(L(f), D({
    objects3D: v,
    solids: T,
    mesh: i,
    settingsObj: {
      nodes: false,
      loads: false
    }
  }), O({
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/building/main.ts",
    author: "https://www.linkedin.com/in/abderrahmane-mazri-4638a81b8/"
  }));
});
