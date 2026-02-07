import { G as h0, B as m0, F as g0, f as x0, l as S0, M as b0, v as C, a as M0, g as y0 } from "./styles-C0SegVHg.js";
import { a as F0 } from "./analyze-BCxdQoUM.js";
import { d as E0, __tla as __tla_0 } from "./deformCpp-DW1XeNIf.js";
import { m as T0, __tla as __tla_1 } from "./modalCpp-BCLz1dKn.js";
import { g as v0 } from "./getParameters-CaQGHjhr.js";
import { g as C0 } from "./getTables-CHkSh4ed.js";
import { g as w0 } from "./getDialog-Dq3s-eU8.js";
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
  function $0(t, s, a, r) {
    const i = 0.2 * a / s, e = a / s;
    return t <= 0 ? s * 0.4 : t <= i ? s * (0.4 + 0.6 * t / i) : t <= e ? s : t <= r ? a / t : a * r / (t * t);
  }
  function I0(t, s, a = 1.2) {
    return t <= 0 ? s * a : t <= 0.15 ? s * a * (1 + t / 0.15 * (1 * 2.5 - 1)) : t <= 0.5 ? s * a * 1 * 2.5 : t <= 2 ? s * a * 1 * 2.5 * (0.5 / t) : s * a * 1 * 2.5 * (0.5 * 2 / (t * t));
  }
  function A0(t, s) {
    const { Z: a, soilType: r, region: i, I: e = 1, R: l = 1 } = s;
    let c, n, o;
    if (s.Fa !== void 0 && s.Fd !== void 0 && s.Fs !== void 0) c = s.Fa, n = s.Fd, o = s.Fs;
    else {
      const u = N0(r, a);
      c = u.Fa, n = u.Fd, o = u.Fs;
    }
    const p = {
      Costa: 1.8,
      Sierra: 2.48,
      Oriente: 2.6
    }[i], m = 0.55 * o * n / c, M = 0.1 * o * n / c, x = r === "E" ? 1.5 : 1;
    let b;
    return t <= 0 ? b = a * c : t <= M ? b = a * c * (1 + (p - 1) * t / M) : t <= m ? b = p * a * c : b = p * a * c * Math.pow(m / t, x), b * e / l;
  }
  function N0(t, s) {
    const a = [
      0.15,
      0.25,
      0.3,
      0.35,
      0.4,
      0.5
    ], r = {
      A: [
        0.9,
        0.9,
        0.9,
        0.9,
        0.9,
        0.9
      ],
      B: [
        1,
        1,
        1,
        1,
        1,
        1
      ],
      C: [
        1.4,
        1.3,
        1.25,
        1.23,
        1.2,
        1.18
      ],
      D: [
        1.6,
        1.4,
        1.3,
        1.25,
        1.2,
        1.12
      ],
      E: [
        1.8,
        1.4,
        1.25,
        1.1,
        1,
        0.85
      ]
    }, i = {
      A: [
        0.9,
        0.9,
        0.9,
        0.9,
        0.9,
        0.9
      ],
      B: [
        1,
        1,
        1,
        1,
        1,
        1
      ],
      C: [
        1.36,
        1.28,
        1.19,
        1.15,
        1.11,
        1.06
      ],
      D: [
        1.62,
        1.45,
        1.36,
        1.28,
        1.19,
        1.11
      ],
      E: [
        2.1,
        1.75,
        1.7,
        1.65,
        1.6,
        1.5
      ]
    }, e = {
      A: [
        0.75,
        0.75,
        0.75,
        0.75,
        0.75,
        0.75
      ],
      B: [
        0.75,
        0.75,
        0.75,
        0.75,
        0.75,
        0.75
      ],
      C: [
        0.85,
        0.94,
        1.02,
        1.06,
        1.11,
        1.23
      ],
      D: [
        1.02,
        1.06,
        1.11,
        1.19,
        1.28,
        1.4
      ],
      E: [
        1.5,
        1.6,
        1.7,
        1.8,
        1.9,
        2
      ]
    }, l = (c, n) => {
      if (n <= 0.15) return c[0];
      if (n >= 0.5) return c[5];
      for (let o = 0; o < a.length - 1; o++) if (n >= a[o] && n <= a[o + 1]) {
        const d = (n - a[o]) / (a[o + 1] - a[o]);
        return c[o] + d * (c[o + 1] - c[o]);
      }
      return c[5];
    };
    return {
      Fa: l(r[t] || r.D, s),
      Fd: l(i[t] || i.D, s),
      Fs: l(e[t] || e.D, s)
    };
  }
  function D0(t, s, a) {
    if (s.length < 2) return 0;
    if (t <= s[0]) return a[0];
    if (t >= s[s.length - 1]) return a[a.length - 1];
    for (let r = 0; r < s.length - 1; r++) if (t >= s[r] && t <= s[r + 1]) {
      const i = (t - s[r]) / (s[r + 1] - s[r]);
      return a[r] + i * (a[r + 1] - a[r]);
    }
    return a[a.length - 1];
  }
  function P0(t, s) {
    switch (s.type) {
      case "ASCE7":
        return $0(t, s.SDS, s.SD1, s.TL ?? 4);
      case "EC8":
        return I0(t, s.ag, s.S ?? 1.2);
      case "NEC":
        return A0(t, s);
      case "USER":
        return D0(t, s.periods, s.accelerations);
    }
  }
  function k0(t) {
    return Math.sqrt(t.reduce((s, a) => s + a * a, 0));
  }
  function z0(t, s, a) {
    let r = 0;
    const i = Math.PI;
    for (let e = 0; e < t.length; e++) for (let l = 0; l < t.length; l++) {
      const c = 2 * i * s[e], n = 2 * i * s[l];
      if (c < 1e-10 || n < 1e-10) continue;
      const o = n / c, d = a, p = a;
      let m;
      if (Math.abs(o - 1) < 1e-10) m = 1;
      else {
        const M = 8 * Math.sqrt(d * p) * (d + o * p) * Math.pow(o, 1.5), x = Math.pow(1 - o * o, 2) + 4 * d * p * o * (1 + o * o) + 4 * (d * d + p * p) * o * o;
        m = x > 1e-20 ? M / x : 0;
      }
      r += m * t[e] * t[l];
    }
    return Math.sqrt(Math.abs(r));
  }
  function R0(t) {
    return t.reduce((s, a) => s + Math.abs(a), 0);
  }
  function K(t, s, a, r) {
    switch (a) {
      case "SRSS":
        return k0(t);
      case "CQC":
        return z0(t, s, r);
      case "ABS":
        return R0(t);
    }
  }
  async function O0(t, s, a, r, i, e) {
    const { spectrum: l, combination: c, damping: n = 0.05, scaleFactor: o = 9.81, numModes: d } = e, p = 9.81, m = Math.PI, M = "UX", x = Array.from(i.frequencies.values()), b = Array.from(i.periods.values()), u = i.modeShapes, F = i.massParticipation, h = d ? Math.min(d, x.length) : x.length, S = t.length, E = 6, I = /* @__PURE__ */ new Map();
    for (let T = 0; T < h; T++) {
      const N = b[T], z = P0(N, l);
      I.set(T + 1, z);
    }
    const _ = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), k = [];
    for (let T = 0; T < h; T++) {
      const N = T + 1, z = b[T], U = I.get(N) || 0, Z = U * p * z * z / (4 * m * m), A = u.get(N);
      if (!A) continue;
      const j = F.get(N), Q = j ? j[M] : 0, J = /* @__PURE__ */ new Map(), rt = /* @__PURE__ */ new Map();
      let it = 0, R = 0, _t = 0;
      for (let W = 0; W < S; W++) {
        const Bt = A.slice(W * E, (W + 1) * E), f0 = Bt.map((vt) => Q * Z * vt * o / p);
        J.set(W, f0);
        const ct = Bt.map((vt) => Q * U * o * vt);
        rt.set(W, ct), it += ct[0], R += ct[1], _t += ct[2];
      }
      _.set(N, J), D.set(N, rt), k.push([
        it,
        R,
        _t
      ]);
    }
    const g = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), y = x.slice(0, h);
    for (let T = 0; T < S; T++) {
      const N = [
        [],
        [],
        [],
        [],
        [],
        []
      ], z = [
        [],
        [],
        [],
        [],
        [],
        []
      ];
      for (let A = 0; A < h; A++) {
        const j = A + 1, Q = _.get(j), J = D.get(j);
        if (Q && J) {
          const rt = Q.get(T) || [
            0,
            0,
            0,
            0,
            0,
            0
          ], it = J.get(T) || [
            0,
            0,
            0,
            0,
            0,
            0
          ];
          for (let R = 0; R < 6; R++) N[R].push(rt[R]), z[R].push(it[R]);
        }
      }
      const U = [
        0,
        0,
        0,
        0,
        0,
        0
      ], Z = [
        0,
        0,
        0,
        0,
        0,
        0
      ];
      for (let A = 0; A < 6; A++) U[A] = K(N[A], y, c, n), Z[A] = K(z[A], y, c, n);
      g.set(T, U), f.set(T, Z);
    }
    const w = k.map((T) => T[0]), P = k.map((T) => T[1]), B = k.map((T) => T[2]), Tt = [
      K(w, y, c, n),
      K(P, y, c, n),
      K(B, y, c, n)
    ], Lt = /* @__PURE__ */ new Map();
    for (const [T, N] of _) {
      const z = /* @__PURE__ */ new Map();
      for (const [U, Z] of N) z.set(U, Z);
      Lt.set(T, z);
    }
    return {
      displacements: g,
      forces: f,
      baseShear: Tt,
      modalResponses: Lt,
      spectralAccelerations: I
    };
  }
  const L0 = [
    [
      -3.375,
      5.100000000000001,
      3.52
    ],
    [
      -3.375,
      5.100000000000001,
      6.58
    ],
    [
      -0.07500000000000018,
      5.100000000000001,
      0.1
    ],
    [
      -0.07500000000000018,
      5.100000000000001,
      3.52
    ],
    [
      -0.07500000000000018,
      5.100000000000001,
      6.58
    ],
    [
      3.375,
      5.100000000000001,
      0.1
    ],
    [
      3.375,
      5.100000000000001,
      3.52
    ],
    [
      3.375,
      5.100000000000001,
      6.58
    ],
    [
      -3.375,
      -1.75,
      0.1
    ],
    [
      -3.375,
      -1.75,
      3.52
    ],
    [
      -3.375,
      -1.75,
      6.58
    ],
    [
      -0.07500000000000018,
      -1.75,
      0.1
    ],
    [
      -0.07500000000000018,
      -1.75,
      3.52
    ],
    [
      -0.07500000000000018,
      -1.75,
      6.58
    ],
    [
      -0.07500000000000018,
      -1.75,
      7.58
    ],
    [
      3.375,
      -1.75,
      0.1
    ],
    [
      3.375,
      -1.75,
      3.52
    ],
    [
      3.375,
      -1.75,
      6.58
    ],
    [
      3.375,
      -1.75,
      7.58
    ],
    [
      -3.375,
      1.4499999999999957,
      0.1
    ],
    [
      -3.375,
      1.4499999999999957,
      3.52
    ],
    [
      -3.375,
      1.4499999999999957,
      6.58
    ],
    [
      -0.07500000000000018,
      1.4499999999999957,
      0.1
    ],
    [
      -0.07500000000000018,
      1.4499999999999957,
      3.52
    ],
    [
      -0.07500000000000018,
      1.4499999999999957,
      6.58
    ],
    [
      -0.07500000000000018,
      1.4499999999999957,
      7.58
    ],
    [
      3.375,
      1.4499999999999957,
      0.1
    ],
    [
      3.375,
      1.4499999999999957,
      3.52
    ],
    [
      3.375,
      1.4499999999999957,
      6.58
    ],
    [
      3.375,
      1.4499999999999957,
      7.58
    ],
    [
      -3.375,
      -3.8999999999999986,
      0.1
    ],
    [
      -3.375,
      -3.8999999999999986,
      3.52
    ],
    [
      -3.375,
      -3.8999999999999986,
      6.58
    ],
    [
      -0.07500000000000018,
      -3.8999999999999986,
      0.1
    ],
    [
      -0.07500000000000018,
      -3.8999999999999986,
      3.52
    ],
    [
      -0.07500000000000018,
      -3.8999999999999986,
      6.58
    ],
    [
      -0.07500000000000018,
      -0.4750000000000014,
      3.52
    ],
    [
      -0.07500000000000018,
      -5.274999999999999,
      3.52
    ],
    [
      -3.375,
      -5.175000000000004,
      3.52
    ],
    [
      1.2000000000000002,
      -1.75,
      3.52
    ],
    [
      1.2000000000000002,
      -3.8999999999999986,
      3.52
    ],
    [
      3.375,
      -2.825000000000003,
      3.52
    ],
    [
      1.2000000000000002,
      -5.175000000000004,
      3.52
    ],
    [
      1.2000000000000002,
      -0.4750000000000014,
      3.52
    ],
    [
      1.2000000000000002,
      -2.825000000000003,
      3.52
    ],
    [
      -1.4,
      -0.4750000000000014,
      3.52
    ],
    [
      -1.4,
      1.4499999999999957,
      3.52
    ],
    [
      -3.375,
      -0.4750000000000014,
      3.52
    ],
    [
      -0.07500000000000018,
      -3.125,
      7.58
    ],
    [
      -0.07500000000000018,
      2.2250000000000014,
      7.58
    ],
    [
      -3.55,
      -3.8999999999999986,
      6.58
    ],
    [
      1.2999999999999998,
      -3.8999999999999986,
      6.58
    ],
    [
      -3.55,
      -1.75,
      6.58
    ],
    [
      1.2999999999999998,
      -1.75,
      6.58
    ],
    [
      -0.07500000000000018,
      -5.274999999999999,
      6.58
    ],
    [
      -0.07500000000000018,
      -0.375,
      6.58
    ],
    [
      -3.55,
      1.4499999999999957,
      6.58
    ],
    [
      3.55,
      1.4499999999999957,
      6.58
    ],
    [
      -0.8499999999999996,
      1.4499999999999957,
      7.58
    ],
    [
      3.55,
      1.4499999999999957,
      7.58
    ],
    [
      -0.07500000000000018,
      1.2749999999999986,
      6.58
    ],
    [
      -0.07500000000000018,
      5.274999999999999,
      6.58
    ],
    [
      3.55,
      5.100000000000001,
      6.58
    ],
    [
      3.375,
      1.2749999999999986,
      6.58
    ],
    [
      3.375,
      5.274999999999999,
      6.58
    ],
    [
      -3.55,
      5.100000000000001,
      6.58
    ],
    [
      -3.375,
      1.2749999999999986,
      6.58
    ],
    [
      -3.375,
      5.274999999999999,
      6.58
    ],
    [
      3.375,
      -3.125,
      7.58
    ],
    [
      3.375,
      2.2250000000000014,
      7.58
    ],
    [
      -0.8499999999999996,
      -1.75,
      7.58
    ],
    [
      3.55,
      -1.75,
      7.58
    ],
    [
      -3.375,
      -5.274999999999999,
      6.58
    ],
    [
      -3.375,
      -0.375,
      6.58
    ],
    [
      1.1349,
      0.20989999999999753,
      2.955
    ],
    [
      -3.375,
      -0.4750000000000014,
      6.58
    ],
    [
      -3.55,
      -0.4750000000000014,
      6.58
    ],
    [
      0.10000000000000053,
      -0.4750000000000014,
      6.58
    ],
    [
      -3.375,
      5.100000000000001,
      0.1
    ],
    [
      -0.8499999999999996,
      2.2250000000000014,
      7.58
    ],
    [
      3.55,
      2.2250000000000014,
      7.58
    ],
    [
      3.55,
      -3.125,
      7.58
    ],
    [
      -0.8499999999999996,
      -3.125,
      7.58
    ],
    [
      -3.55,
      5.274999999999999,
      6.58
    ],
    [
      3.55,
      5.274999999999999,
      6.58
    ],
    [
      0.10000000000000053,
      -1.5750000000000028,
      6.58
    ],
    [
      1.2999999999999998,
      -1.5750000000000028,
      6.58
    ],
    [
      1.2999999999999998,
      -5.274999999999999,
      6.58
    ],
    [
      -3.55,
      -5.274999999999999,
      6.58
    ],
    [
      -3.55,
      -0.4750000000000014,
      3.52
    ],
    [
      1.2999999999999998,
      -0.4750000000000014,
      3.52
    ],
    [
      1.2999999999999998,
      -5.274999999999999,
      3.52
    ],
    [
      -3.55,
      -5.274999999999999,
      3.52
    ],
    [
      1.2999999999999998,
      -1.5750000000000028,
      3.52
    ],
    [
      3.55,
      -1.5750000000000028,
      3.52
    ],
    [
      3.55,
      -2.9250000000000043,
      3.52
    ],
    [
      1.2999999999999998,
      -2.9250000000000043,
      3.52
    ],
    [
      -3.55,
      5.274999999999999,
      3.52
    ],
    [
      3.55,
      5.274999999999999,
      3.52
    ],
    [
      3.55,
      1.4988000000000028,
      3.52
    ],
    [
      -3.55,
      1.4487999999999985,
      3.52
    ],
    [
      -0.16489999999999938,
      -0.4750000000000014,
      0
    ],
    [
      -0.16489999999999938,
      -1.5750000000000028,
      0
    ],
    [
      -0.16489999999999938,
      -1.5750000000000028,
      0.255
    ],
    [
      -0.16489999999999938,
      -0.4750000000000014,
      0.255
    ],
    [
      3.1413,
      -1.5750000000000028,
      1.5232999999999999
    ],
    [
      1.9308000000000005,
      -1.5750000000000028,
      1.5284
    ],
    [
      1.9308000000000005,
      -0.4750000000000014,
      1.5266
    ],
    [
      2.0413000000000006,
      -0.4750000000000014,
      1.5316999999999998
    ],
    [
      2.05,
      -0.3599000000000032,
      1.875
    ],
    [
      3.25,
      -0.3599000000000032,
      1.875
    ],
    [
      3.25,
      0.23089999999999833,
      2.2483999999999997
    ],
    [
      2.0349000000000004,
      0.2400999999999982,
      2.235
    ],
    [
      2.0349000000000004,
      1.3249999999999957,
      2.235
    ],
    [
      3.25,
      1.3200000000000003,
      2.2413
    ],
    [
      1.1441,
      1.3249999999999957,
      2.9684
    ],
    [
      0.055000000000000604,
      0.20989999999999753,
      2.975
    ],
    [
      0.055000000000000604,
      1.3249999999999957,
      2.9613
    ],
    [
      3.2464000000000004,
      -0.3633999999999986,
      1.7032999999999998
    ],
    [
      2.0464,
      -0.3633999999999986,
      1.7138
    ],
    [
      3.2464000000000004,
      -1.5784999999999982,
      1.7049999999999998
    ],
    [
      3.1368,
      -1.5784999999999982,
      1.7090999999999998
    ],
    [
      2.0391000000000004,
      -0.4785000000000039,
      1.7062
    ],
    [
      0.1322000000000001,
      -0.4750000000000014,
      3.52
    ]
  ], _0 = [
    [
      0,
      1
    ],
    [
      2,
      3
    ],
    [
      3,
      4
    ],
    [
      5,
      6
    ],
    [
      6,
      7
    ],
    [
      8,
      9
    ],
    [
      9,
      10
    ],
    [
      11,
      12
    ],
    [
      12,
      13
    ],
    [
      13,
      14
    ],
    [
      15,
      16
    ],
    [
      16,
      17
    ],
    [
      17,
      18
    ],
    [
      19,
      20
    ],
    [
      20,
      21
    ],
    [
      22,
      23
    ],
    [
      23,
      24
    ],
    [
      24,
      25
    ],
    [
      26,
      27
    ],
    [
      27,
      28
    ],
    [
      28,
      29
    ],
    [
      30,
      31
    ],
    [
      31,
      32
    ],
    [
      33,
      34
    ],
    [
      34,
      35
    ],
    [
      23,
      3
    ],
    [
      36,
      23
    ],
    [
      12,
      36
    ],
    [
      34,
      12
    ],
    [
      37,
      34
    ],
    [
      38,
      0
    ],
    [
      0,
      6
    ],
    [
      20,
      23
    ],
    [
      23,
      27
    ],
    [
      9,
      12
    ],
    [
      12,
      39
    ],
    [
      39,
      16
    ],
    [
      31,
      34
    ],
    [
      34,
      40
    ],
    [
      41,
      6
    ],
    [
      38,
      42
    ],
    [
      39,
      43
    ],
    [
      40,
      39
    ],
    [
      42,
      40
    ],
    [
      44,
      41
    ],
    [
      45,
      46
    ],
    [
      47,
      36
    ],
    [
      36,
      43
    ],
    [
      18,
      29
    ],
    [
      25,
      29
    ],
    [
      48,
      49
    ],
    [
      14,
      18
    ],
    [
      50,
      51
    ],
    [
      52,
      53
    ],
    [
      54,
      55
    ],
    [
      56,
      57
    ],
    [
      58,
      59
    ],
    [
      60,
      61
    ],
    [
      4,
      62
    ],
    [
      63,
      64
    ],
    [
      65,
      4
    ],
    [
      66,
      67
    ],
    [
      48,
      14
    ],
    [
      14,
      49
    ],
    [
      14,
      25
    ],
    [
      25,
      49
    ],
    [
      68,
      18
    ],
    [
      29,
      69
    ],
    [
      29,
      59
    ],
    [
      58,
      29
    ],
    [
      58,
      25
    ],
    [
      70,
      14
    ],
    [
      18,
      71
    ],
    [
      32,
      51
    ],
    [
      50,
      32
    ],
    [
      35,
      51
    ],
    [
      32,
      35
    ],
    [
      52,
      13
    ],
    [
      13,
      53
    ],
    [
      52,
      10
    ],
    [
      10,
      13
    ],
    [
      54,
      35
    ],
    [
      35,
      55
    ],
    [
      35,
      13
    ],
    [
      13,
      55
    ],
    [
      72,
      32
    ],
    [
      10,
      73
    ],
    [
      32,
      10
    ],
    [
      63,
      7
    ],
    [
      7,
      64
    ],
    [
      7,
      62
    ],
    [
      4,
      7
    ],
    [
      56,
      28
    ],
    [
      28,
      57
    ],
    [
      66,
      21
    ],
    [
      21,
      67
    ],
    [
      21,
      1
    ],
    [
      1,
      67
    ],
    [
      65,
      1
    ],
    [
      1,
      4
    ],
    [
      56,
      21
    ],
    [
      21,
      28
    ],
    [
      21,
      24
    ],
    [
      24,
      28
    ],
    [
      60,
      24
    ],
    [
      24,
      61
    ],
    [
      24,
      4
    ],
    [
      4,
      61
    ],
    [
      74,
      43
    ],
    [
      32,
      75
    ],
    [
      75,
      73
    ],
    [
      76,
      75
    ],
    [
      75,
      77
    ],
    [
      78,
      0
    ]
  ], B0 = [
    [
      79,
      80,
      81,
      82
    ],
    [
      83,
      84,
      57,
      56
    ],
    [
      76,
      77,
      85,
      86,
      87,
      88
    ],
    [
      89,
      90,
      91,
      92
    ],
    [
      93,
      94,
      95,
      96
    ],
    [
      97,
      98,
      99,
      100
    ],
    [
      101,
      102,
      103,
      104
    ],
    [
      105,
      106,
      107,
      108
    ],
    [
      109,
      110,
      111,
      112
    ],
    [
      113,
      114,
      111,
      112
    ],
    [
      112,
      74,
      115,
      113
    ],
    [
      74,
      116,
      117,
      115
    ],
    [
      104,
      107,
      106,
      103
    ],
    [
      118,
      110,
      109,
      119
    ],
    [
      120,
      121,
      122,
      119,
      118
    ],
    [
      23,
      46,
      45,
      36
    ],
    [
      74,
      116,
      123,
      43
    ],
    [
      105,
      108,
      122,
      121
    ],
    [
      79,
      80,
      81,
      82
    ],
    [
      83,
      84,
      57,
      56
    ],
    [
      76,
      77,
      85,
      86,
      87,
      88
    ],
    [
      89,
      90,
      91,
      92
    ],
    [
      93,
      94,
      95,
      96
    ],
    [
      97,
      98,
      99,
      100
    ],
    [
      101,
      102,
      103,
      104
    ],
    [
      105,
      106,
      107,
      108
    ],
    [
      109,
      110,
      111,
      112
    ],
    [
      113,
      114,
      111,
      112
    ],
    [
      112,
      74,
      115,
      113
    ],
    [
      74,
      116,
      117,
      115
    ],
    [
      104,
      107,
      106,
      103
    ],
    [
      118,
      110,
      109,
      119
    ],
    [
      120,
      121,
      122,
      119,
      118
    ],
    [
      23,
      46,
      45,
      36
    ],
    [
      74,
      116,
      123,
      43
    ],
    [
      105,
      108,
      122,
      121
    ]
  ], V0 = {
    2: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    5: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    8: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    11: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    15: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    19: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    22: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    26: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    30: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    33: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    78: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    101: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    102: [
      true,
      true,
      true,
      true,
      true,
      true
    ]
  }, xt = {
    nodes: L0,
    elements: _0,
    areas: B0,
    supports: V0
  }, H = [
    0.15,
    0.25,
    0.3,
    0.35,
    0.4,
    0.5
  ], U0 = {
    A: [
      0.9,
      0.9,
      0.9,
      0.9,
      0.9,
      0.9
    ],
    B: [
      1,
      1,
      1,
      1,
      1,
      1
    ],
    C: [
      1.4,
      1.3,
      1.25,
      1.23,
      1.2,
      1.18
    ],
    D: [
      1.6,
      1.4,
      1.3,
      1.25,
      1.2,
      1.12
    ],
    E: [
      1.8,
      1.4,
      1.25,
      1.1,
      1,
      0.85
    ]
  }, Z0 = {
    A: [
      0.9,
      0.9,
      0.9,
      0.9,
      0.9,
      0.9
    ],
    B: [
      1,
      1,
      1,
      1,
      1,
      1
    ],
    C: [
      1.36,
      1.28,
      1.19,
      1.15,
      1.11,
      1.06
    ],
    D: [
      1.62,
      1.45,
      1.36,
      1.28,
      1.19,
      1.11
    ],
    E: [
      2.1,
      1.75,
      1.7,
      1.65,
      1.6,
      1.5
    ]
  }, W0 = {
    A: [
      0.75,
      0.75,
      0.75,
      0.75,
      0.75,
      0.75
    ],
    B: [
      0.75,
      0.75,
      0.75,
      0.75,
      0.75,
      0.75
    ],
    C: [
      0.85,
      0.94,
      1.02,
      1.06,
      1.11,
      1.23
    ],
    D: [
      1.02,
      1.06,
      1.11,
      1.19,
      1.28,
      1.4
    ],
    E: [
      1.5,
      1.6,
      1.7,
      1.8,
      1.9,
      2
    ]
  }, $t = {
    Costa: 1.8,
    Sierra: 2.48,
    Oriente: 2.6
  };
  function Ct(t, s) {
    if (s <= 0.15) return t[0];
    if (s >= 0.5) return t[5];
    for (let a = 0; a < H.length - 1; a++) if (s >= H[a] && s <= H[a + 1]) {
      const r = (s - H[a]) / (H[a + 1] - H[a]);
      return t[a] + r * (t[a + 1] - t[a]);
    }
    return t[5];
  }
  function It(t, s) {
    return {
      Fa: Ct(U0[t], s),
      Fd: Ct(Z0[t], s),
      Fs: Ct(W0[t], s)
    };
  }
  function ot(t, s) {
    const { Z: a, soilType: r, region: i, I: e = 1, R: l = 1 } = s, { Fa: c, Fd: n, Fs: o } = It(r, a), d = $t[i], p = 0.55 * o * n / c, m = 0.1 * o * n / c, M = r === "E" ? 1.5 : 1;
    let x;
    return t <= 0 ? x = a * c : t <= m ? x = a * c * (1 + (d - 1) * t / m) : t <= p ? x = d * a * c : x = d * a * c * Math.pow(p / t, M), x * e / l;
  }
  function Ht(t, s, a) {
    const r = s.length, i = [];
    let e = 0;
    for (let l = 0; l < r; l++) e += a[l] * s[l];
    for (let l = 0; l < r; l++) i.push(t * (a[l] * s[l]) / e);
    return i;
  }
  function H0(t) {
    const { Z: s, soilType: a, region: r, I: i = 1, R: e = 1 } = t, { Fa: l, Fd: c, Fs: n } = It(a, s), o = $t[r], d = 0.55 * n * c / l, p = 0.1 * n * c / l, m = 2.4 * c, M = o * s * l;
    return `
NEC-SE-DS Ecuador Design Spectrum
================================
Zone Factor Z = ${s.toFixed(2)}g
Soil Type: ${a}
Region: ${r}
Importance I = ${i.toFixed(1)}
Reduction R = ${e.toFixed(1)}

Site Coefficients:
  Fa = ${l.toFixed(3)}
  Fd = ${c.toFixed(3)}
  Fs = ${n.toFixed(3)}
  eta = ${o.toFixed(2)}

Period Limits:
  T0 = ${p.toFixed(3)} s
  Tc = ${d.toFixed(3)} s
  TL = ${m.toFixed(3)} s

Sa(max) = ${M.toFixed(3)}g @ T0 <= T <= Tc
`.trim();
  }
  const V = {
    soilType: "D",
    zone: "VI",
    Z: 0.5,
    Fa: 1.12,
    Fd: 1.11,
    Fs: 1.4
  };
  function st(t, s, a) {
    const { Z: r, soilType: i, region: e, I: l = 1, R: c = 1 } = s, { Fa: n, Fd: o, Fs: d } = a || It(i, r), p = $t[e], m = 0.55 * d * o / n, M = 0.1 * d * o / n, x = i === "E" ? 1.5 : 1;
    let b;
    return t <= 0 ? b = r * n : t <= M ? b = r * n * (1 + (p - 1) * t / M) : t <= m ? b = p * r * n : b = p * r * n * Math.pow(m / t, x), b * l / c;
  }
  function At(t, s = 0.055) {
    return s * Math.pow(t, 0.75);
  }
  const X0 = {
    slabColor: 8947848,
    slabOpacity: 0.6,
    stairColor: 16729156,
    stairOpacity: 0.8
  };
  function q0(t, s, a, r = {}) {
    const i = {
      ...X0,
      ...r
    }, e = new h0();
    if (s.length > 0) {
      const l = Vt(t, s, i.slabColor, i.slabOpacity);
      l.name = "slabs", e.add(l);
    }
    if (a.length > 0) {
      const l = Vt(t, a, i.stairColor, i.stairOpacity);
      l.name = "stairs", e.add(l);
    }
    return e;
  }
  function Vt(t, s, a, r) {
    const i = new m0(), e = [], l = [];
    s.forEach((n) => {
      const o = n.length;
      if (o < 3) return;
      const d = e.length / 3;
      for (let p = 0; p < o; p++) {
        const m = t[n[p]];
        m ? e.push(m[0], m[1], m[2]) : e.push(0, 0, 0);
      }
      for (let p = 1; p < o - 1; p++) l.push(d, d + p, d + p + 1);
    }), i.setAttribute("position", new g0(e, 3)), i.setIndex(l), i.computeVertexNormals();
    const c = new x0({
      color: a,
      opacity: r,
      transparent: r < 1,
      side: S0,
      flatShading: true
    });
    return new b0(i, c);
  }
  function Y0(t, s, a = [], r = {}) {
    const { width: i = 400, height: e = 250, title: l = "Espectro NEC-SE-DS", showGrid: c = true } = r, n = document.createElement("canvas");
    n.width = i, n.height = e, n.style.background = "#fff", n.style.borderRadius = "4px";
    const o = n.getContext("2d");
    o.fillStyle = "#fff", o.fillRect(0, 0, i, e);
    const d = {
      top: 30,
      right: 20,
      bottom: 40,
      left: 50
    }, p = i - d.left - d.right, m = e - d.top - d.bottom, M = Math.max(...s.map((h) => h.T), 2), x = Math.max(...s.map((h) => h.Sa)) * 1.1, b = (h) => d.left + h / M * p, u = (h) => d.top + m - h / x * m;
    if (c) {
      o.strokeStyle = "#eee", o.lineWidth = 1;
      for (let S = 0; S <= M; S += 0.5) {
        const E = b(S);
        o.beginPath(), o.moveTo(E, d.top), o.lineTo(E, d.top + m), o.stroke();
      }
      const h = x > 1 ? 0.2 : 0.1;
      for (let S = 0; S <= x; S += h) {
        const E = u(S);
        o.beginPath(), o.moveTo(d.left, E), o.lineTo(d.left + p, E), o.stroke();
      }
    }
    o.strokeStyle = "#333", o.lineWidth = 2, o.beginPath(), o.moveTo(d.left, d.top), o.lineTo(d.left, d.top + m), o.lineTo(d.left + p, d.top + m), o.stroke(), o.strokeStyle = "#0066cc", o.lineWidth = 2, o.beginPath(), s.forEach((h, S) => {
      const E = b(h.T), I = u(h.Sa);
      S === 0 ? o.moveTo(E, I) : o.lineTo(E, I);
    }), o.stroke(), o.fillStyle = "rgba(0, 102, 204, 0.1)", o.beginPath(), o.moveTo(b(0), u(0)), s.forEach((h) => {
      o.lineTo(b(h.T), u(h.Sa));
    }), o.lineTo(b(s[s.length - 1].T), u(0)), o.closePath(), o.fill(), a.forEach((h) => {
      const S = b(h.T), E = u(h.Sa);
      o.strokeStyle = "#cc0000", o.lineWidth = 1, o.setLineDash([
        4,
        4
      ]), o.beginPath(), o.moveTo(S, d.top + m), o.lineTo(S, E), o.stroke(), o.setLineDash([]);
      const I = 4 + h.massParticipation * 6;
      o.fillStyle = "#cc0000", o.beginPath(), o.arc(S, E, I, 0, Math.PI * 2), o.fill(), o.fillStyle = "#000", o.font = "10px monospace", o.textAlign = "center", o.fillText(`M${h.mode}`, S, E - I - 4);
    }), o.fillStyle = "#333", o.font = "12px sans-serif", o.textAlign = "center", o.fillText("T (s)", d.left + p / 2, e - 8), o.save(), o.translate(15, d.top + m / 2), o.rotate(-Math.PI / 2), o.fillText("Sa (g)", 0, 0), o.restore(), o.font = "bold 12px sans-serif", o.fillStyle = "#333", o.textAlign = "center", o.fillText(l, i / 2, 18), o.font = "10px monospace", o.fillStyle = "#666", o.textAlign = "center";
    for (let h = 0; h <= M; h += 0.5) {
      const S = b(h);
      o.fillText(h.toFixed(1), S, d.top + m + 15);
    }
    o.textAlign = "right";
    const F = x > 1 ? 0.2 : 0.1;
    for (let h = 0; h <= x; h += F) {
      const S = u(h);
      o.fillText(h.toFixed(2), d.left - 5, S + 4);
    }
    return t.appendChild(n), n;
  }
  function G0(t, s, a = [], r = {}) {
    const { title: i = "Espectro NEC-SE-DS" } = r, e = t.getContext("2d"), l = t.width, c = t.height;
    e.fillStyle = "#fff", e.fillRect(0, 0, l, c);
    const n = {
      top: 30,
      right: 20,
      bottom: 40,
      left: 50
    }, o = l - n.left - n.right, d = c - n.top - n.bottom, p = Math.max(...s.map((u) => u.T), 2), m = Math.max(...s.map((u) => u.Sa)) * 1.1, M = (u) => n.left + u / p * o, x = (u) => n.top + d - u / m * d;
    e.strokeStyle = "#eee", e.lineWidth = 1;
    for (let u = 0; u <= p; u += 0.5) {
      const F = M(u);
      e.beginPath(), e.moveTo(F, n.top), e.lineTo(F, n.top + d), e.stroke();
    }
    const b = m > 1 ? 0.2 : 0.1;
    for (let u = 0; u <= m; u += b) {
      const F = x(u);
      e.beginPath(), e.moveTo(n.left, F), e.lineTo(n.left + o, F), e.stroke();
    }
    e.strokeStyle = "#333", e.lineWidth = 2, e.beginPath(), e.moveTo(n.left, n.top), e.lineTo(n.left, n.top + d), e.lineTo(n.left + o, n.top + d), e.stroke(), e.strokeStyle = "#0066cc", e.lineWidth = 2, e.beginPath(), s.forEach((u, F) => {
      const h = M(u.T), S = x(u.Sa);
      F === 0 ? e.moveTo(h, S) : e.lineTo(h, S);
    }), e.stroke(), e.fillStyle = "rgba(0, 102, 204, 0.1)", e.beginPath(), e.moveTo(M(0), x(0)), s.forEach((u) => {
      e.lineTo(M(u.T), x(u.Sa));
    }), e.lineTo(M(s[s.length - 1].T), x(0)), e.closePath(), e.fill(), a.forEach((u) => {
      const F = M(u.T), h = x(u.Sa);
      e.strokeStyle = "#cc0000", e.lineWidth = 1, e.setLineDash([
        4,
        4
      ]), e.beginPath(), e.moveTo(F, n.top + d), e.lineTo(F, h), e.stroke(), e.setLineDash([]);
      const S = 4 + u.massParticipation * 6;
      e.fillStyle = "#cc0000", e.beginPath(), e.arc(F, h, S, 0, Math.PI * 2), e.fill(), e.fillStyle = "#000", e.font = "10px monospace", e.textAlign = "center", e.fillText(`M${u.mode}`, F, h - S - 4);
    }), e.fillStyle = "#333", e.font = "12px sans-serif", e.textAlign = "center", e.fillText("T (s)", n.left + o / 2, c - 8), e.save(), e.translate(15, n.top + d / 2), e.rotate(-Math.PI / 2), e.fillText("Sa (g)", 0, 0), e.restore(), e.font = "bold 12px sans-serif", e.textAlign = "center", e.fillText(i, l / 2, 18), e.font = "10px monospace", e.fillStyle = "#666", e.textAlign = "center";
    for (let u = 0; u <= p; u += 0.5) e.fillText(u.toFixed(1), M(u), n.top + d + 15);
    e.textAlign = "right";
    for (let u = 0; u <= m; u += b) e.fillText(u.toFixed(2), n.left - 5, x(u) + 4);
  }
  const $ = {
    zFactor: {
      value: C.state(50),
      min: 15,
      max: 50,
      step: 5,
      label: "Z (0.15-0.50g)"
    },
    soilType: {
      value: C.state(4),
      min: 1,
      max: 5,
      step: 1,
      label: "Suelo (A=1,B=2,C=3,D=4,E=5)"
    },
    importance: {
      value: C.state(10),
      min: 10,
      max: 15,
      step: 1,
      label: "I (1.0-1.5)"
    },
    reduction: {
      value: C.state(60),
      min: 10,
      max: 80,
      step: 5,
      label: "R (1.0-8.0)"
    },
    showShells: {
      value: C.state(1),
      min: 0,
      max: 1,
      step: 1,
      label: "Shells (0=No, 1=Si)"
    },
    analysisType: {
      value: C.state(0),
      min: 0,
      max: 2,
      step: 1,
      label: "Metodo (0=Est,1=SRSS,2=CQC)"
    }
  }, v = xt.nodes, pt = xt.elements;
  function j0(t) {
    if (t.length <= 4) return [
      t
    ];
    const s = [];
    for (let a = 1; a < t.length - 1; a++) s.push([
      t[0],
      t[a],
      t[a + 1]
    ]);
    return s;
  }
  const Nt = xt.areas, Dt = Nt.flatMap((t) => t.length <= 4 ? [
    t
  ] : j0(t));
  console.log(`Shells visualizaci\xF3n: ${Nt.length}, FEM: ${Dt.length}`);
  function Q0(t, s) {
    const a = t.map((l) => {
      var _a;
      return ((_a = s[l]) == null ? void 0 : _a[2]) ?? 0;
    }), r = Math.max(...a), i = Math.min(...a);
    return r - i > 0.3 || i < 3.5;
  }
  function J0(t, s, a = 0.3) {
    const r = t.map((l) => {
      var _a;
      return ((_a = s[l]) == null ? void 0 : _a[2]) ?? 0;
    }), i = Math.min(...r);
    return Math.max(...r) - i < a;
  }
  const L = [], Xt = [];
  Nt.forEach((t) => {
    Q0(t, v) ? Xt.push(t) : L.push(t);
  });
  const St = Xt, et = /* @__PURE__ */ new Set();
  St.forEach((t) => {
    t.forEach((s) => et.add(s));
  });
  console.log(`Shells horizontales (losas): ${L.length}`);
  console.log(`Shells inclinados (escalera): ${St.length}`);
  console.log(`Nodos de escalera (excluidos): ${et.size}`);
  const X = /* @__PURE__ */ new Map();
  Object.entries(xt.supports).forEach(([t, s]) => {
    X.set(parseInt(t), s);
  });
  console.log(`Apoyos empotrados: ${X.size} nodos`);
  const K0 = 210, Pt = 12e3 * Math.sqrt(K0) * 100, qt = 0.2, Yt = Pt / (2 * (1 + qt)), Gt = 24, bt = 0.3, Mt = 0.3, yt = 0.25, Ft = 0.3, jt = bt * Mt, Qt = bt * Math.pow(Mt, 3) / 12, Jt = Mt * Math.pow(bt, 3) / 12, Kt = 0.141 * Math.pow(Math.min(bt, Mt), 4), t0 = yt * Ft, e0 = yt * Math.pow(Ft, 3) / 12, o0 = Ft * Math.pow(yt, 3) / 12, s0 = 0.141 * Math.pow(Math.min(yt, Ft), 4), n0 = 0.2, te = 0.15;
  function ee(t, s) {
    const a = s.map((e) => {
      const l = e.map((c) => t[c][2]);
      return l.reduce((c, n) => c + n, 0) / l.length;
    }), r = 0.3, i = [];
    return a.forEach((e) => {
      e >= 3 && (i.some((c) => Math.abs(c - e) < r) || i.push(e));
    }), i.sort((e, l) => e - l);
  }
  function kt(t, s) {
    const a = ee(t, s), r = Math.min(...t.map((n) => n[2])), i = a.map((n) => n - r), e = 7 * 7, l = e * n0 * Gt + e * 2, c = i.map(() => l);
    return {
      heights: i,
      weights: c,
      totalWeight: c.reduce((n, o) => n + o, 0),
      maxHeight: Math.max(...i),
      floorZs: a,
      baseZ: r
    };
  }
  function Ut(t, s, a, r, i = 0.3) {
    const e = /* @__PURE__ */ new Set();
    return s.forEach((l) => {
      const c = l.reduce((n, o) => n + a[o][2], 0) / l.length;
      Math.abs(c - t) < i && l.forEach((n) => {
        r.has(n) || e.add(n);
      });
    }), Array.from(e);
  }
  function zt(t) {
    return [
      "A",
      "B",
      "C",
      "D",
      "E"
    ][Math.min(Math.max(t - 1, 0), 4)];
  }
  const oe = C.state(v), a0 = C.state([
    ...pt,
    ...Dt
  ]), l0 = C.state({}), r0 = C.state({}), i0 = C.state({}), c0 = C.state({}), Zt = C.state(null), d0 = C.state(null);
  let O = null, ft = null, ht = null, mt = null, gt = null;
  const Rt = C.state([]), wt = C.state(""), u0 = C.state(void 0), p0 = /* @__PURE__ */ new Map();
  p0.set("modal", {
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
        text: "Sum UX"
      },
      {
        field: "H",
        text: "Sum UY"
      }
    ],
    data: Rt
  });
  C.derive(() => {
    console.log("clickedButton:", wt.val), wt.val === "Modal Results" && (console.log("Mostrando Modal Results, filas:", Rt.val.length), u0.val = C0({
      tables: p0
    }));
  });
  const se = q0(v, L, St, {
    slabColor: 8947848,
    slabOpacity: 0.5,
    stairColor: 13378082,
    stairOpacity: 0.7
  }), ne = C.state([
    se
  ]);
  C.derive(() => {
    const t = $.zFactor.value.val / 100, s = zt($.soilType.value.val), a = $.importance.value.val / 10, r = $.reduction.value.val / 10, e = $.showShells.value.val === 1 ? Dt : [], l = [
      ...pt,
      ...e
    ];
    a0.val = l;
    const c = t === 0.5 && s === "D", n = {
      Z: t,
      soilType: s,
      region: "Costa",
      I: a,
      R: r
    }, o = kt(v, L), d = At(o.maxHeight, 0.055), p = c ? st(d, n, V) : ot(d, n), m = p * o.totalWeight, M = Ht(m, o.heights, o.weights), x = /* @__PURE__ */ new Map();
    o.floorZs.forEach((g, f) => {
      const y = Ut(g, L, v, et);
      if (y.length > 0 && M[f] !== void 0) {
        const w = M[f] / y.length;
        y.forEach((P) => {
          x.set(P, [
            w,
            0,
            0,
            0,
            0,
            0
          ]);
        });
      }
    });
    const b = {
      supports: X,
      loads: x
    }, u = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map();
    l.forEach((g, f) => {
      if (u.set(f, Pt), I.set(f, Yt), g.length === 2) {
        const y = v[g[0]], w = v[g[1]];
        Math.abs(w[2] - y[2]) > 0.5 ? (F.set(f, jt), h.set(f, Qt), S.set(f, Jt), E.set(f, Kt)) : (F.set(f, t0), h.set(f, e0), S.set(f, o0), E.set(f, s0));
      } else if (g.length === 4) {
        const y = J0(g, v);
        _.set(f, y ? n0 : te), D.set(f, qt);
      }
    });
    const k = {
      elasticities: u,
      areas: F,
      momentsOfInertiaZ: h,
      momentsOfInertiaY: S,
      torsionalConstants: E,
      shearModuli: I,
      thicknesses: _,
      poissonsRatios: D
    };
    l0.val = b, r0.val = k;
    try {
      const g = E0(v, l, b, k), f = F0(v, l, k, g);
      i0.val = g, c0.val = f, console.clear(), console.log("=".repeat(50)), console.log("VIVIENDA CRUCITA - NEC-SE-DS"), console.log("=".repeat(50)), c && console.log(`
*** ESTUDIO DE SUELOS - Ing. Orlando Mora ***`), console.log(H0(n)), console.log(`
MODELO:`), console.log(`  Frames: ${pt.length}`), console.log(`  Losas: ${L.length}`), console.log(`  Escalera: ${St.length}`), console.log(`  Nodos escalera (SIN carga): ${et.size}`), console.log(`
FUERZAS SISMICAS:`), console.log(`  T = ${d.toFixed(3)} s`), console.log(`  Sa = ${p.toFixed(4)}g`), console.log(`  W = ${o.totalWeight.toFixed(1)} kN`), console.log(`  V = ${m.toFixed(2)} kN`), console.log(`
ANALISIS ESTATICO:`), console.log(`  T = ${d.toFixed(3)} s`), console.log(`  Sa = ${p.toFixed(4)}g`), console.log(`  W = ${o.totalWeight.toFixed(1)} kN`), console.log(`  V_estatico = ${m.toFixed(2)} kN`), console.log(`
POR PISO (solo losas, sin escalera):`), M.forEach((w, P) => {
        const B = Ut(o.floorZs[P], L, v, et);
        console.log(`  Z=${o.floorZs[P].toFixed(1)}m: F=${w.toFixed(1)}kN (${B.length} nodos)`);
      }), ae();
      const y = $.analysisType.value.val;
      y > 0 && le(n, c, m, y === 2 ? "CQC" : "SRSS");
    } catch (g) {
      console.error("Error:", g);
    }
  });
  async function ae() {
    try {
      if (O && ft && ht && mt && gt) {
        console.log("\u2713 Modal Results: usando cach\xE9"), Zt.val = O, Wt(O);
        return;
      }
      console.log(`
` + "=".repeat(50)), console.log("ANALISIS MODAL"), console.log("=".repeat(50));
      const t = [
        0,
        0.1,
        3.52,
        6.58
      ], s = 0.15, a = (g) => t.some((f) => Math.abs(g - f) < s), r = /* @__PURE__ */ new Set();
      X.forEach((g, f) => r.add(f));
      let i = pt.filter((g) => {
        const f = v[g[0]][2], y = v[g[1]][2], w = v[g[1]][0] - v[g[0]][0], P = v[g[1]][1] - v[g[0]][1], B = v[g[1]][2] - v[g[0]][2], Tt = Math.sqrt(w * w + P * P + B * B);
        return a(f) && a(y) && Tt > 0.3;
      });
      console.log(`Frames en niveles principales: ${i.length}`);
      let e = 0;
      const l = 10;
      for (; e < l; ) {
        const g = /* @__PURE__ */ new Map();
        i.forEach((y) => {
          g.set(y[0], (g.get(y[0]) || 0) + 1), g.set(y[1], (g.get(y[1]) || 0) + 1);
        });
        const f = /* @__PURE__ */ new Set();
        if (g.forEach((y, w) => {
          y === 1 && !r.has(w) && f.add(w);
        }), f.size === 0) break;
        console.log(`Iter ${e + 1}: eliminando ${f.size} nodos en voladizo`), i = i.filter((y) => !f.has(y[0]) && !f.has(y[1])), e++;
      }
      console.log(`Frames limpios para modal: ${i.length}`);
      const c = /* @__PURE__ */ new Set();
      i.forEach((g) => {
        g.forEach((f) => c.add(f));
      });
      const n = Array.from(c).sort((g, f) => g - f), o = /* @__PURE__ */ new Map();
      n.forEach((g, f) => {
        o.set(g, f);
      });
      const d = n.map((g) => v[g]), p = i.map((g) => g.map((f) => o.get(f))), m = /* @__PURE__ */ new Map();
      X.forEach((g, f) => {
        o.has(f) && m.set(o.get(f), g);
      });
      const M = {
        supports: m
      };
      console.log(`Modal: ${d.length} nodos, ${p.length} frames`), console.log(`Apoyos: originales=${X.size}, re-mapeados=${m.size}`);
      const x = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map();
      p.forEach((g, f) => {
        x.set(f, Pt), h.set(f, Yt), E.set(f, Gt / 9.81);
        const y = d[g[0]], w = d[g[1]];
        Math.abs(w[2] - y[2]) > 0.5 ? (b.set(f, jt), u.set(f, Qt), F.set(f, Jt), S.set(f, Kt)) : (b.set(f, t0), u.set(f, e0), F.set(f, o0), S.set(f, s0));
      });
      const I = {
        elasticities: x,
        areas: b,
        momentsOfInertiaZ: u,
        momentsOfInertiaY: F,
        shearModuli: h,
        torsionalConstants: S
      };
      console.log("Ejecutando an\xE1lisis modal (WASM)...");
      const _ = performance.now(), D = await T0(d, p, M, I, {
        densities: E,
        numModes: 6
      }), k = performance.now();
      console.log(`Modal completado en ${(k - _).toFixed(0)}ms`), D.frequencies.size > 0 ? (O = D, ft = d, ht = p, mt = M, gt = I, console.log(`\u2713 Resultados guardados en cach\xE9 (${D.frequencies.size} modos)`)) : console.warn("\u26A0 Modal: 0 modos encontrados"), Zt.val = D, Wt(D);
    } catch (t) {
      console.error("Error en an\xE1lisis modal:", t);
    }
  }
  function Wt(t) {
    const s = [];
    let a = 0, r = 0;
    console.log(`
MODOS DE VIBRACION:`), t.frequencies.forEach((e, l) => {
      const c = t.periods.get(l) || 0, n = t.massParticipation.get(l);
      console.log(`  Modo ${l}: T=${c.toFixed(3)}s, f=${e.toFixed(2)}Hz, Mx=${(((n == null ? void 0 : n.UX) || 0) * 100).toFixed(1)}%, My=${(((n == null ? void 0 : n.UY) || 0) * 100).toFixed(1)}%`), n && (a += n.UX, r += n.UY, s.push([
        l,
        c.toFixed(4),
        e.toFixed(3),
        (n.UX * 100).toFixed(1),
        (n.UY * 100).toFixed(1),
        (n.RZ * 100).toFixed(1),
        (a * 100).toFixed(1),
        (r * 100).toFixed(1)
      ]));
    });
    const i = t.sumParticipation;
    console.log(`  Suma: Mx=${(i.SumUX * 100).toFixed(1)}%, My=${(i.SumUY * 100).toFixed(1)}%`), Rt.val = s, console.log("Tabla Modal Results actualizada:", s.length, "modos");
  }
  async function le(t, s, a, r) {
    try {
      if (!O || !ft || !ht || !mt || !gt) {
        console.warn("No hay resultados modales para combinaci\xF3n espectral");
        return;
      }
      console.log(`
` + "=".repeat(50)), console.log(`COMBINACION ESPECTRAL (${r})`), console.log("=".repeat(50));
      const i = {
        type: "NEC",
        Z: t.Z,
        soilType: t.soilType,
        region: t.region,
        I: t.I,
        R: t.R,
        ...s ? {
          Fa: V.Fa,
          Fd: V.Fd,
          Fs: V.Fs
        } : {}
      };
      console.log("Ejecutando espectro de respuesta...");
      const l = (await O0(ft, ht, mt, gt, O, {
        spectrum: i,
        direction: "X",
        combination: r,
        damping: 0.05
      })).baseShear[0], c = [], n = [], o = [];
      O.frequencies.forEach((d, p) => {
        var _a;
        c.push(d), n.push(O.periods.get(p) || 0), o.push(((_a = O.massParticipation.get(p)) == null ? void 0 : _a.UX) || 0);
      }), d0.val = {
        baseShear: l,
        method: r,
        frequencies: c,
        periods: n,
        massParticipation: o.map((d) => d * 100)
      }, console.log(`
COMPARACION ESTATICO vs DINAMICO:`), console.log(`  V_estatico  = ${a.toFixed(2)} kN`), console.log(`  V_dinamico  = ${l.toFixed(2)} kN (${r})`), console.log(`  Ratio       = ${(l / a).toFixed(3)}`), l < 0.8 * a && console.log(`
  \u26A0\uFE0F V_dinamico < 0.80\xD7V_estatico \u2192 usar 0.80\xD7V_estatico`);
    } catch (i) {
      console.error("Error en combinaci\xF3n espectral:", i);
    }
  }
  document.body.append(M0({
    clickedButton: wt,
    buttons: [
      "Modal Results"
    ],
    sourceCode: "NEC-SE-DS Ecuador",
    author: "Vivienda Crucita"
  }), w0({
    dialogBody: u0
  }), v0($), y0({
    mesh: {
      nodes: oe,
      elements: a0,
      nodeInputs: l0,
      elementInputs: r0,
      deformOutputs: i0,
      analyzeOutputs: c0
    },
    solids: ne,
    settingsObj: {
      deformedShape: true,
      gridSize: 20,
      loads: true,
      supports: true,
      nodes: false,
      elements: true,
      shellResults: "none"
    }
  }));
  const Y = document.createElement("div");
  Y.style.cssText = `
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.95);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  font-family: monospace;
  font-size: 11px;
  max-width: 320px;
  z-index: 1000;
`;
  const Et = document.createElement("div");
  Et.id = "info-content";
  const nt = document.createElement("button");
  nt.textContent = "\u2212";
  nt.style.cssText = `
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  font-weight: bold;
`;
  let tt = false;
  nt.onclick = () => {
    tt = !tt, Et.style.display = tt ? "none" : "block", nt.textContent = tt ? "+" : "\u2212", Y.style.padding = tt ? "4px 28px 4px 8px" : "12px";
  };
  Y.style.position = "relative";
  Y.appendChild(nt);
  C.derive(() => {
    const t = $.zFactor.value.val / 100, s = zt($.soilType.value.val), a = $.importance.value.val / 10, r = $.reduction.value.val / 10, i = {
      Z: t,
      soilType: s,
      region: "Costa",
      I: a,
      R: r
    }, e = kt(v, L), l = At(e.maxHeight, 0.055), c = t === 0.5 && s === "D" ? st(l, i, V) : ot(l, i), n = c * e.totalWeight, o = Ht(n, e.heights, e.weights);
    Et.innerHTML = `
    <strong>NEC-SE-DS Ecuador</strong><br>
    <hr style="margin:4px 0">
    Z=${t.toFixed(2)}g | Suelo ${s}<br>
    T=${l.toFixed(3)}s | Sa=${c.toFixed(4)}g<br>
    <hr style="margin:4px 0">
    W=${e.totalWeight.toFixed(0)}kN<br>
    <b style="color:#c00">V=${n.toFixed(1)}kN</b><br>
    <hr style="margin:4px 0">
    <small>Fuerzas solo en losas<br>(escalera excluida)</small><br>
    ${o.map((d, p) => `F${p + 1}=${d.toFixed(0)}kN`).join(" ")}
  `;
  });
  Y.appendChild(Et);
  document.body.append(Y);
  const G = document.createElement("div");
  G.id = "spectrum-panel";
  G.style.cssText = `
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #0066cc;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  font-family: monospace;
  font-size: 11px;
  z-index: 9999;
  max-height: 45vh;
  overflow-y: auto;
`;
  console.log("Panel del espectro creado");
  const at = document.createElement("button");
  at.textContent = "\u2212";
  at.style.cssText = `
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;
  let dt = false;
  const lt = document.createElement("div");
  lt.id = "spectrum-content";
  at.onclick = () => {
    dt = !dt, lt.style.display = dt ? "none" : "block", at.textContent = dt ? "+" : "\u2212";
  };
  G.appendChild(at);
  G.appendChild(lt);
  const Ot = document.createElement("div");
  Ot.id = "chart-container";
  lt.appendChild(Ot);
  const q = document.createElement("div");
  q.id = "modal-table";
  q.style.marginTop = "10px";
  lt.appendChild(q);
  document.body.append(G);
  let ut = null;
  function re(t, s) {
    const a = [];
    for (let e = 0; e <= 100; e++) {
      const l = e / 100 * 3, c = s ? st(l, t, V) : ot(l, t);
      a.push({
        T: l,
        Sa: c
      });
    }
    return a;
  }
  C.derive(() => {
    const t = $.analysisType.value.val, s = $.zFactor.value.val / 100, a = zt($.soilType.value.val), r = $.importance.value.val / 10, i = $.reduction.value.val / 10;
    console.log("Actualizando panel espectro, analysisType =", t);
    const e = s === 0.5 && a === "D", l = {
      Z: s,
      soilType: a,
      region: "Costa",
      I: r,
      R: i
    };
    G.style.display = "block";
    const c = re(l, e), n = d0.val, o = [];
    n && n.periods.length > 0 && t > 0 && n.periods.forEach((x, b) => {
      const u = e ? st(x, l, V) : ot(x, l);
      o.push({
        T: x,
        Sa: u,
        mode: b + 1,
        massParticipation: (n.massParticipation[b] || 0) / 100
      });
    });
    const d = t === 0 ? "Est\xE1tico" : t === 1 ? "SRSS" : "CQC";
    console.log("Creando gr\xE1fico, puntos de curva:", c.length);
    try {
      ut ? G0(ut, c, o, {
        title: `Espectro NEC-SE-DS (${d})`
      }) : (ut = Y0(Ot, c, o, {
        width: 350,
        height: 150,
        title: `Espectro NEC-SE-DS (${d})`
      }), console.log("Canvas creado:", ut));
    } catch (x) {
      console.error("Error creando gr\xE1fico:", x);
    }
    const p = kt(v, L), m = At(p.maxHeight, 0.055), M = e ? st(m, l, V) : ot(m, l);
    if (t === 0) q.innerHTML = `
      <div style="padding:8px; background:#f5f5f5; border-radius:4px;">
        <strong>AN\xC1LISIS EST\xC1TICO</strong><br>
        <hr style="margin:4px 0">
        T<sub>aprox</sub> = ${m.toFixed(3)} s<br>
        Sa(T) = ${M.toFixed(4)} g<br>
        <hr style="margin:4px 0">
        <span style="color:#c00; font-weight:bold;">
          V = ${(M * p.totalWeight).toFixed(1)} kN
        </span>
      </div>
    `;
    else if (n && n.periods.length > 0) {
      let x = `
      <div style="margin-bottom:6px;"><strong>PARTICIPACI\xD3N MODAL (${n.method})</strong></div>
      <table style="width:100%; border-collapse:collapse; font-size:10px;">
        <tr style="background:#ddd;">
          <th style="padding:3px; border:1px solid #bbb;">Modo</th>
          <th style="padding:3px; border:1px solid #bbb;">T (s)</th>
          <th style="padding:3px; border:1px solid #bbb;">f (Hz)</th>
          <th style="padding:3px; border:1px solid #bbb;">Mx (%)</th>
        </tr>
    `, b = 0;
      n.periods.slice(0, 6).forEach((h, S) => {
        var _a;
        const E = n.massParticipation[S] || 0;
        b += E, x += `
        <tr>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">${S + 1}</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${h.toFixed(3)}</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${((_a = n.frequencies[S]) == null ? void 0 : _a.toFixed(2)) || "-"}</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${E.toFixed(1)}</td>
        </tr>
      `;
      }), x += `
        <tr style="background:#eee; font-weight:bold;">
          <td colspan="3" style="padding:2px 4px; border:1px solid #ddd;">\u03A3 Masa</td>
          <td style="padding:2px 4px; border:1px solid #ddd; text-align:right;">${b.toFixed(1)}%</td>
        </tr>
      </table>
    `;
      const u = M * p.totalWeight, F = n.baseShear / u;
      x += `
      <div style="margin-top:8px; padding:6px; background:#fee; border-radius:4px;">
        <strong>V<sub>est\xE1tico</sub> = ${u.toFixed(1)} kN</strong><br>
        <strong style="color:#c00;">V<sub>${n.method}</sub> = ${n.baseShear.toFixed(1)} kN</strong><br>
        <small>Ratio = ${F.toFixed(3)}</small>
      </div>
    `, q.innerHTML = x;
    } else t > 0 && (q.innerHTML = `
      <div style="color:#666; padding:10px; text-align:center;">
        <div style="margin-bottom:8px;">Calculando modos...</div>
        <div style="font-size:20px;">\u23F3</div>
      </div>
    `);
  });
});
