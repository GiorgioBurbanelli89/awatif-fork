import { s as Et, n as Qt, b as Ft, k as Ht, i as Gt, z as w, c as jt, m as d, t as yt, a as xt, e as A, f as Xt } from "./pureFunctionsAny.generated-BKlLJiMU.js";
function Ut(t) {
  if (t.length === 2) return $t(t);
  if (t.length === 3) return It(t);
}
function $t(t) {
  const o = Et(t[1], t[0]), e = Qt(o), m = Ft(o, [1, 0, 0]) / e, c = Ft(o, [0, 1, 0]) / e, r = Ft(o, [0, 0, 1]) / e, Y = Math.sqrt(m ** 2 + c ** 2);
  let N = [[m, c, r], [-c / Y, m / Y, 0], [-m * r / Y, -c * r / Y, Y]];
  return r === 1 && (N = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]]), r === -1 && (N = [[0, 0, -1], [0, 1, 0], [1, 0, 0]]), Ht(Gt(4), N).toArray();
}
function It(t) {
  const r = [t[0], t[1], t[2]], Y = w(3, 3).toArray();
  for (let h = 0; h < 3; h++) for (let O = 0; O < 3; O++) Y[h][O] = r[O][h];
  const N = [-1, 1, 0], M = [-1, 0, 1], n = w(3, 2).toArray();
  for (let h = 0; h < 3; h++) for (let O = 0; O < 3; O++) n[h][0] += Y[h][O] * N[O], n[h][1] += Y[h][O] * M[O];
  const Q = n.map((h) => h[0]), p = n.map((h) => h[1]);
  let a = jt(Q, p), Z = Qt(a);
  if (Z === 0) return console.warn("Degenerate triangle: nodes are collinear or coincident."), w(18, 18).toArray();
  a = a.map((h) => h / Z);
  const X = [...a], S = Gt(3).toArray(), J = a[0];
  let G;
  if (Math.abs(J) > 1 - 1e-10) {
    const h = a[2];
    G = S.map((O, W) => O[2] - h * a[W]);
  } else G = S.map((h, O) => h[0] - J * a[O]);
  if (Z = Qt(G), Z === 0) return console.warn("Degenerate local X-axis detected."), w(18, 18).toArray();
  G = G.map((h) => h / Z);
  let L = jt(X, G);
  if (Z = Qt(L), Z === 0) return console.warn("Degenerate local Y-axis detected."), w(18, 18).toArray();
  L = L.map((h) => h / Z);
  const T = [G, L, X], K = w(18, 18).toArray();
  for (let h = 0; h < 3; h++) {
    const O = h * 6, W = O + 3;
    for (let I = 0; I < 3; I++) for (let H = 0; H < 3; H++) K[O + I][O + H] = T[I][H], K[W + I][W + H] = T[I][H];
  }
  return K;
}
function tn(t, o, e) {
  if (t.length === 2) return nn(t, o, e);
  if (t.length === 3) return on(t, o, e);
}
function nn(t, o, e) {
  var _a, _b, _c, _d, _e, _f;
  const m = ((_a = o == null ? void 0 : o.momentsOfInertiaZ) == null ? void 0 : _a.get(e)) ?? 0, c = ((_b = o == null ? void 0 : o.momentsOfInertiaY) == null ? void 0 : _b.get(e)) ?? 0, r = ((_c = o == null ? void 0 : o.elasticities) == null ? void 0 : _c.get(e)) ?? 0, Y = ((_d = o == null ? void 0 : o.areas) == null ? void 0 : _d.get(e)) ?? 0, N = ((_e = o == null ? void 0 : o.shearModuli) == null ? void 0 : _e.get(e)) ?? 0, M = ((_f = o == null ? void 0 : o.torsionalConstants) == null ? void 0 : _f.get(e)) ?? 0, n = Qt(Et(t[0], t[1])), Q = r * Y / n, p = r * m / n ** 3, a = r * c / n ** 3, Z = N * M / n;
  return [[Q, 0, 0, 0, 0, 0, -Q, 0, 0, 0, 0, 0], [0, 12 * p, 0, 0, 0, 6 * n * p, 0, -12 * p, 0, 0, 0, 6 * n * p], [0, 0, 12 * a, 0, -6 * n * a, 0, 0, 0, -12 * a, 0, -6 * n * a, 0], [0, 0, 0, Z, 0, 0, 0, 0, 0, -Z, 0, 0], [0, 0, -6 * n * a, 0, 4 * a * n ** 2, 0, 0, 0, 6 * n * a, 0, 2 * a * n ** 2, 0], [0, 6 * n * p, 0, 0, 0, 4 * p * n ** 2, 0, -6 * n * p, 0, 0, 0, 2 * p * n ** 2], [-Q, 0, 0, 0, 0, 0, Q, 0, 0, 0, 0, 0], [0, -12 * p, 0, 0, 0, -6 * p * n, 0, 12 * p, 0, 0, 0, -6 * p * n], [0, 0, -12 * a, 0, 6 * n * a, 0, 0, 0, 12 * a, 0, 6 * n * a, 0], [0, 0, 0, -Z, 0, 0, 0, 0, 0, Z, 0, 0], [0, 0, -6 * n * a, 0, 2 * a * n ** 2, 0, 0, 0, 6 * n * a, 0, 4 * a * n ** 2, 0], [0, 6 * n * p, 0, 0, 0, 2 * p * n ** 2, 0, -6 * n * p, 0, 0, 0, 4 * p * n ** 2]];
}
function on(t, o, e) {
  var _a, _b, _c, _d, _e;
  const m = ((_a = o.elasticities) == null ? void 0 : _a.get(e)) ?? 0, c = ((_b = o.elasticitiesOrthogonal) == null ? void 0 : _b.get(e)) ?? 0, r = ((_c = o.poissonsRatios) == null ? void 0 : _c.get(e)) ?? 0, Y = ((_d = o.shearModuli) == null ? void 0 : _d.get(e)) ?? 0, N = ((_e = o.thicknesses) == null ? void 0 : _e.get(e)) ?? 0, M = c > 0, n = M ? Rt(m, c, Y, r, N) : vt(m, r, N), Q = M ? Pt(Y, N) : Kt(m, r, N), p = M ? Bt(m, c, Y, r) : Lt(m, r), a = t.map(([l, s]) => [l, s]), Z = a[1][0] - a[0][0], X = a[2][0] - a[0][0], S = a[0][1] - a[1][1], J = a[2][1] - a[0][1], G = 0.5 * (Z * J - X * -S), L = Vt(a), T = qt(a), K = Jt(a, p, N), h = d(d(yt(L), Q), L), O = d(d(yt(T), n), T), W = w(18, 18).toArray(), I = d(xt(h, O), G), H = [[0, 1, 5], [6, 7, 11], [12, 13, 17]];
  for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) for (let x = 0; x < 3; x++) {
    const y = H[l][s], D = H[x][s];
    W[y][D] = K[l * 3 + s][x * 3 + s];
  }
  for (let l = 0; l < 18; l++) for (let s = 0; s < 18; s++) W[l][s] = (W[l][s] ?? 0) + I.get([l, s]);
  return W;
  function vt(l, s, x) {
    const y = l / (1 - s * s), D = A([[y, y * s, 0], [y * s, y, 0], [0, 0, y * (1 - s) / 2]]);
    return d(x ** 3 / 12, D);
  }
  function Kt(l, s, x) {
    const y = 0.8333333333333334, D = l / (2 * (1 + s)), k = y * D * x;
    return A([[k, 0], [0, k]]);
  }
  function Rt(l, s, x, y, D) {
    const k = s * y / l, f = 1 - y * k, b = l / f, C = s / f, v = y * s / f, u = A([[b, v, 0], [v, C, 0], [0, 0, x]]);
    return d(D ** 3 / 12, u);
  }
  function Pt(l, s) {
    const y = 0.8333333333333334 * l * s;
    return A([[y, 0], [0, y]]);
  }
  function Vt(l) {
    const s = w(2, 18).toArray(), [x, y] = l[0], [D, k] = l[1], [f, b] = l[2], C = 0.5 * ((D - x) * (b - y) - (f - x) * -(y - k)), v = (x + D + f) / 3, j = (y + k + b) / 3, u = [v, x, D], U = [j, y, k], $ = [v, D, f], B = [j, k, b], R = [v, f, x], Mt = [j, b, y], z = 1 / 3, [ct, it, lt, wt] = kt(u, U), [ht, St, _t, Nt] = kt($, B), [ut, Dt, Tt, Ot] = kt(R, Mt), ft = w(2, 18).toArray(), gt = w(2, 18).toArray(), mt = w(2, 18).toArray();
    for (let g = 0; g < 2; g++) for (let i = 0; i < 6; i++) ft[g][i] = z * ct[g][i] + it[g][i], ft[g][i + 6] = z * ct[g][i] + lt[g][i], ft[g][i + 12] = z * ct[g][i], gt[g][i] = z * ht[g][i], gt[g][i + 6] = z * ht[g][i] + St[g][i], gt[g][i + 12] = z * ht[g][i] + _t[g][i], mt[g][i] = z * ut[g][i] + Tt[g][i], mt[g][i + 6] = z * ut[g][i], mt[g][i + 12] = z * ut[g][i] + Dt[g][i];
    for (let g = 0; g < 2; g++) for (let i = 0; i < 18; i++) ft[g][i] *= wt, gt[g][i] *= Nt, mt[g][i] *= Ot, s[g][i] = (ft[g][i] + gt[g][i] + mt[g][i]) / C;
    return s;
  }
  function kt(l, s) {
    const x = w(2, 6).toArray(), y = w(2, 6).toArray(), D = w(2, 6).toArray(), k = l[1] - l[0], f = l[0] - l[2], b = s[2] - s[0], C = s[0] - s[1], v = l[2] - l[1], j = s[1] - s[2], u = 0.5 * (k * b - f * C), U = 0.5 * C * f, $ = 0.5 * b * k, B = 0.5 * k * f, R = 0.5 * C * b;
    return x[0][2] = 0.5 * v / u, x[0][3] = -0.5, x[1][2] = 0.5 * j / u, x[1][4] = 0.5, y[0][2] = 0.5 * f / u, y[0][3] = 0.5 * U / u, y[0][4] = 0.5 * B / u, y[1][2] = 0.5 * b / u, y[1][3] = 0.5 * R / u, y[1][4] = 0.5 * $ / u, D[0][2] = 0.5 * k / u, D[0][3] = -0.5 * $ / u, D[0][4] = -0.5 * B / u, D[1][2] = 0.5 * C / u, D[1][3] = -0.5 * R / u, D[1][4] = -0.5 * U / u, [x, y, D, u];
  }
  function qt(l) {
    const s = w(3, 18).toArray(), [x, y] = l[0], [D, k] = l[1], [f, b] = l[2], C = D - x, v = f - x, j = f - D, u = k - b, U = b - y, $ = y - k, B = 0.5 * (C * U - v * -$), R = u / (2 * B), Mt = j / (2 * B), z = U / (2 * B), ct = -v / (2 * B), it = $ / (2 * B), lt = C / (2 * B);
    return s[0][4] = R, s[0][10] = z, s[0][16] = it, s[1][3] = -Mt, s[1][9] = -ct, s[1][15] = -lt, s[2][3] = -R, s[2][4] = Mt, s[2][9] = -z, s[2][10] = ct, s[2][15] = -it, s[2][16] = lt, s;
  }
  function Jt(l, s, x) {
    let y = w(9, 9).toArray(), D = w(9, 9).toArray(), k = w(9, 9).toArray(), f = w(9, 3).toArray(), b = w(3, 9).toArray(), C = w(3, 3).toArray(), v = w(3, 3).toArray(), j = w(3, 3).toArray(), u = w(3, 3).toArray(), U = w(3, 3).toArray(), $ = w(3, 3).toArray(), B = w(3, 3).toArray(), R = w(3, 3).toArray();
    const Mt = 1 / 8, z = Mt / 6, ct = Mt ** 2 / 4, it = 1, lt = 2, wt = 1, ht = 0, St = 1, _t = -1, Nt = -1, ut = -1, Dt = -2, Tt = l[0][0], Ot = l[0][1], ft = l[1][0], gt = l[1][1], mt = l[2][0], g = l[2][1], i = Tt - ft, pt = ft - mt, bt = mt - Tt, At = Ot - gt, dt = gt - g, Yt = g - Ot, tt = -i, rt = -pt, et = -bt, nt = -At, ot = -dt, st = -Yt, Ct = 0.5 * (tt * Yt - bt * -At), Wt = 2 * Ct, E = 4 * Ct, F = 0.5 * x, Zt = Ct * x, P = tt ** 2 + nt ** 2, V = rt ** 2 + ot ** 2, q = et ** 2 + st ** 2;
    f[0][0] = F * dt, f[0][2] = F * rt, f[1][1] = F * rt, f[1][2] = F * dt, f[2][0] = F * dt * (st - nt) * z, f[2][1] = F * rt * (bt - i) * z, f[2][2] = F * (bt * st - i * nt) * 2 * z, f[3][0] = F * Yt, f[3][2] = F * et, f[4][1] = F * et, f[4][2] = F * Yt, f[5][0] = F * Yt * (nt - ot) * z, f[5][1] = F * et * (i - pt) * z, f[5][2] = F * (i * nt - pt * ot) * 2 * z, f[6][0] = F * At, f[6][2] = F * tt, f[7][1] = F * tt, f[7][2] = F * At, f[8][0] = F * At * (ot - st) * z, f[8][1] = F * tt * (pt - bt) * z, f[8][2] = F * (pt * ot - bt * st) * 2 * z, k = d(d(A(f), s), yt(A(f))).toArray(), k = d(A(k), 1 / Zt).toArray(), b[0][0] = rt / E, b[0][1] = ot / E, b[0][2] = 1, b[0][3] = et / E, b[0][4] = st / E, b[0][6] = tt / E, b[0][7] = nt / E, b[1][0] = rt / E, b[1][1] = ot / E, b[1][3] = et / E, b[1][4] = st / E, b[1][5] = 1, b[1][6] = tt / E, b[1][7] = nt / E, b[2][0] = rt / E, b[2][1] = ot / E, b[2][3] = et / E, b[2][4] = st / E, b[2][6] = tt / E, b[2][7] = nt / E, b[2][8] = 1;
    const at = 1 / (Ct * E);
    C[0][0] = at * dt * st * P, C[0][1] = at * Yt * nt * V, C[0][2] = at * At * ot * q, C[1][0] = at * pt * et * P, C[1][1] = at * bt * tt * V, C[1][2] = at * i * rt * q, C[2][0] = at * (dt * bt + rt * st) * P, C[2][1] = at * (Yt * i + et * nt) * V, C[2][2] = at * (At * pt + tt * ot) * q;
    const _ = Wt / 3;
    v[0][0] = _ * it / P, v[0][1] = _ * lt / P, v[0][2] = _ * wt / P, v[1][0] = _ * ht / V, v[1][1] = _ * St / V, v[1][2] = _ * _t / V, v[2][0] = _ * Nt / q, v[2][1] = _ * ut / q, v[2][2] = _ * Dt / q, j[0][0] = _ * Dt / P, j[0][1] = _ * Nt / P, j[0][2] = _ * ut / P, j[1][0] = _ * wt / V, j[1][1] = _ * it / V, j[1][2] = _ * lt / V, j[2][0] = _ * _t / q, j[2][1] = _ * ht / q, j[2][2] = _ * St / q, u[0][0] = _ * St / P, u[0][1] = _ * _t / P, u[0][2] = _ * ht / P, u[1][0] = _ * ut / V, u[1][1] = _ * Dt / V, u[1][2] = _ * Nt / V, u[2][0] = _ * lt / q, u[2][1] = _ * wt / q, u[2][2] = _ * it / q, U = d(xt(A(v), A(j)), 0.5).toArray(), $ = d(xt(A(j), A(u)), 0.5).toArray(), B = d(xt(A(u), A(v)), 0.5).toArray();
    const zt = d(d(yt(A(C)), s), A(C));
    return R = xt(xt(d(d(yt(A(U)), zt), A(U)), d(d(yt(A($)), zt), A($))), d(d(yt(A(B)), zt), A(B))).toArray(), R = d(A(R), 3 / 4 * ct * Zt).toArray(), D = d(d(yt(A(b)), A(R)), A(b)).toArray(), y = xt(A(k), A(D)).toArray(), y;
  }
}
function Lt(t, o) {
  const e = t / (1 - o * o);
  return A([[e, e * o, 0], [e * o, e, 0], [0, 0, e * (1 - o) / 2]]);
}
function Bt(t, o, e, m) {
  const c = o * m / t, r = 1 - m * c, Y = t / r, N = o / r, M = m * o / r;
  return A([[Y, M, 0], [M, N, 0], [0, 0, e]]);
}
function gn(t, o, e, m) {
  if (!t || t.length === 0 || !o || o.length === 0) return { normals: /* @__PURE__ */ new Map(), shearsY: /* @__PURE__ */ new Map(), shearsZ: /* @__PURE__ */ new Map(), torsions: /* @__PURE__ */ new Map(), bendingsY: /* @__PURE__ */ new Map(), bendingsZ: /* @__PURE__ */ new Map(), bendingXX: /* @__PURE__ */ new Map(), bendingYY: /* @__PURE__ */ new Map(), bendingXY: /* @__PURE__ */ new Map(), membraneXX: /* @__PURE__ */ new Map(), membraneYY: /* @__PURE__ */ new Map(), membraneXY: /* @__PURE__ */ new Map(), tranverseShearX: /* @__PURE__ */ new Map(), tranverseShearY: /* @__PURE__ */ new Map() };
  const c = { normals: /* @__PURE__ */ new Map(), shearsY: /* @__PURE__ */ new Map(), shearsZ: /* @__PURE__ */ new Map(), torsions: /* @__PURE__ */ new Map(), bendingsY: /* @__PURE__ */ new Map(), bendingsZ: /* @__PURE__ */ new Map(), bendingXX: /* @__PURE__ */ new Map(), bendingYY: /* @__PURE__ */ new Map(), bendingXY: /* @__PURE__ */ new Map(), membraneXX: /* @__PURE__ */ new Map(), membraneYY: /* @__PURE__ */ new Map(), membraneXY: /* @__PURE__ */ new Map(), tranverseShearX: /* @__PURE__ */ new Map(), tranverseShearY: /* @__PURE__ */ new Map() }, r = { bendingXX: /* @__PURE__ */ new Map(), bendingYY: /* @__PURE__ */ new Map(), bendingXY: /* @__PURE__ */ new Map(), membraneXX: /* @__PURE__ */ new Map(), membraneYY: /* @__PURE__ */ new Map(), membraneXY: /* @__PURE__ */ new Map() };
  if (!(m == null ? void 0 : m.deformations) || m.deformations.size === 0) return c;
  o.forEach((M, n) => {
    var _a;
    if (M.some((X) => X < 0 || X >= t.length || !t[X])) return;
    const Q = M.map((X) => t[X]);
    if (Q.some((X) => !X)) return;
    const p = M.reduce((X, S) => {
      var _a2;
      const J = (_a2 = m.deformations) == null ? void 0 : _a2.get(S);
      return X.concat(J ?? [0, 0, 0, 0, 0, 0]);
    }, []);
    if (p.some((X) => X == null || isNaN(X))) return;
    const a = Ut(Q);
    if (!a || Array.isArray(a) && a.some((X) => Array.isArray(X) && X.some((S) => S === void 0 || isNaN(S)))) return;
    const Z = d(a, p);
    if (M.length === 2) {
      const X = tn(Q, e, n);
      let S = d(X, Z);
      c.normals.set(n, [S[0], S[6]]), c.shearsY.set(n, [S[1], S[7]]), c.shearsZ.set(n, [S[2], S[8]]), c.torsions.set(n, [S[3], S[9]]), c.bendingsY.set(n, [S[4], S[10]]), c.bendingsZ.set(n, [S[5], S[11]]);
    } else {
      const X = sn(e, n), S = rn(Q), J = en(p), G = an(Q), T = d(1 / (2 * G), d(d(X, S), J)).toArray(), K = ((_a = e.thicknesses) == null ? void 0 : _a.get(n)) ?? 1, h = T[0][0] * K, O = T[1][0] * K, W = T[2][0] * K, I = T[0][1] * (K ** 3 / 12), H = T[1][1] * (K ** 3 / 12), vt = T[2][1] * (K ** 3 / 12);
      r.membraneXX.set(n, h), r.membraneYY.set(n, O), r.membraneXY.set(n, W), r.bendingXX.set(n, I), r.bendingYY.set(n, H), r.bendingXY.set(n, vt);
    }
  });
  const { nodeToCentroidNodesMap: Y, nodeToCentroidElementIndiciesMap: N } = cn(t, o);
  return o.forEach((M, n) => {
    if (M.length !== 3) return;
    let Q = [0, 0, 0], p = [0, 0, 0], a = [0, 0, 0], Z = [0, 0, 0], X = [0, 0, 0], S = [0, 0, 0];
    M.forEach((J, G) => {
      Y.get(J);
      const L = N.get(J) || [];
      Q[G] = Xt(L.map((T) => r.membraneXX.get(T) ?? 0)), p[G] = Xt(L.map((T) => r.membraneYY.get(T) ?? 0)), a[G] = Xt(L.map((T) => r.membraneXY.get(T) ?? 0)), Z[G] = Xt(L.map((T) => r.bendingXX.get(T) ?? 0)), X[G] = Xt(L.map((T) => r.bendingYY.get(T) ?? 0)), S[G] = Xt(L.map((T) => r.bendingXY.get(T) ?? 0));
    }), c.membraneXX.set(n, Q), c.membraneYY.set(n, p), c.membraneXY.set(n, a), c.bendingXX.set(n, Z), c.bendingYY.set(n, X), c.bendingXY.set(n, S);
  }), c;
}
function sn(t, o) {
  var _a, _b, _c, _d, _e;
  const e = ((_a = t.elasticities) == null ? void 0 : _a.get(o)) ?? 0, m = ((_b = t.elasticitiesOrthogonal) == null ? void 0 : _b.get(o)) ?? 0, c = ((_c = t.poissonsRatios) == null ? void 0 : _c.get(o)) ?? 0, r = ((_d = t.shearModuli) == null ? void 0 : _d.get(o)) ?? 0;
  return (_e = t.thicknesses) == null ? void 0 : _e.get(o), m > 0 ? Bt(e, m, r, c) : Lt(e, c);
}
function rn(t) {
  const [o, e] = t[0], [m, c] = t[1], [r, Y] = t[2], N = c - Y, M = Y - e, n = e - c, Q = r - m, p = o - r, a = m - o;
  return A([[N, M, n, 0, 0, 0], [0, 0, 0, Q, p, a], [Q, p, a, N, M, n]]);
}
function en(t) {
  const [o, e, m] = [t[0], t[6], t[12]], [c, r, Y] = [t[1], t[7], t[13]], [N, M, n] = [t[4], t[10], t[16]], [Q, p, a] = [t[3], t[9], t[15]];
  return A([[o, -N], [e, -M], [m, -n], [c, Q], [r, p], [Y, a]]);
}
function an(t) {
  const [o, e] = t[0], [m, c] = t[1], [r, Y] = t[2], N = m - o, M = r - o, n = Y - e, Q = e - c;
  return 0.5 * (N * n - M * -Q);
}
function cn(t, o) {
  const e = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map();
  return o.forEach((c, r) => {
    const Y = c.map((M) => t[M]), N = ln(Y);
    c.forEach((M) => {
      var _a, _b;
      e.has(M) || e.set(M, []), (_a = e.get(M)) == null ? void 0 : _a.push(N), m.has(M) || m.set(M, []), (_b = m.get(M)) == null ? void 0 : _b.push(r);
    });
  }), { nodeToCentroidNodesMap: e, nodeToCentroidElementIndiciesMap: m };
}
function ln(t) {
  const o = t.reduce((c, r) => c + r[0], 0) / t.length, e = t.reduce((c, r) => c + r[1], 0) / t.length, m = t.reduce((c, r) => c + r[2], 0) / t.length;
  return [o, e, m];
}
export {
  gn as a
};
