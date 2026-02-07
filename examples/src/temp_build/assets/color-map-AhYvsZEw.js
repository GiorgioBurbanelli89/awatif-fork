import { v as e, j as l, g as c, k as d, a as p } from "./styles-CmYpyXmR.js";
import { g as u } from "./getParameters-a13Rdg56.js";
import { g, __tla as __tla_0 } from "./getMesh-BoyenBpJ.js";
import { n as b, s as v } from "./pureFunctionsAny.generated-BKlLJiMU.js";
import "./__vite-browser-external-D7Ct-6yo.js";
Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  const i = {
    boundary: {
      value: e.state(10),
      min: 1,
      max: 10,
      step: 0.1,
      label: "Boundary point"
    }
  }, t = e.state([]), m = e.state([]), r = e.state([]), n = e.state([
    l(t, m, r)
  ]);
  e.derive(() => {
    const a = [
      i.boundary.value.val,
      0,
      3
    ], { nodes: s, elements: o } = g({
      points: [
        [
          0,
          0,
          0
        ],
        [
          5,
          0,
          0
        ],
        a,
        [
          8,
          0,
          7
        ],
        [
          15,
          0,
          5
        ],
        [
          15,
          0,
          0
        ],
        [
          20,
          0,
          0
        ],
        [
          20,
          0,
          10
        ],
        [
          0,
          0,
          10
        ],
        [
          0,
          0,
          0
        ]
      ],
      polygon: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      maxMeshSize: 1
    });
    t.val = s, m.val = o, r.val = h(a, t.val), n.val = [
      ...n.rawVal
    ];
  });
  document.body.append(u(i), c({
    mesh: {
      nodes: t,
      elements: m
    },
    objects3D: n
  }), d(r), p({
    sourceCode: "https://github.com/madil4/awatif/blob/main/examples/src/color-map/main.ts",
    author: "https://www.linkedin.com/in/siu-kai-cheung/"
  }));
  function h(a, s) {
    return s.map((o) => b(v(o, a)));
  }
});
