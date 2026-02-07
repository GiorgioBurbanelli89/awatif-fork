function y(l) {
  const { Lx: s, Ly: f, nx: n, ny: e, z: i = 0 } = l;
  if (n < 1 || e < 1) throw new Error("nx and ny must be at least 1");
  const d = s / n, M = f / e, a = [];
  for (let t = 0; t <= e; t++) for (let o = 0; o <= n; o++) a.push([o * d, t * M, i]);
  const u = [];
  for (let t = 0; t < e; t++) for (let o = 0; o < n; o++) {
    const r = t * (n + 1) + o, h = r + 1, b = h + (n + 1), g = r + (n + 1);
    u.push([r, h, b, g]);
  }
  const p = [], c = { bottom: [], right: [], top: [], left: [] };
  for (let t = 0; t < a.length; t++) {
    const [o, r] = a[t], h = Math.abs(o) < 1e-10, b = Math.abs(o - s) < 1e-10, g = Math.abs(r) < 1e-10, x = Math.abs(r - f) < 1e-10;
    (h || b || g || x) && (p.push(t), g && c.bottom.push(t), b && c.right.push(t), x && c.top.push(t), h && c.left.push(t));
  }
  return { nodes: a, elements: u, boundaryIndices: p, edges: c };
}
function m(l, s, f) {
  const n = /* @__PURE__ */ new Map();
  return l.forEach((e) => {
    const [i, d, , M] = e, a = Math.abs(s[d][0] - s[i][0]), u = Math.abs(s[M][1] - s[i][1]), p = a * u, c = f * p / 4;
    e.forEach((t) => {
      const o = n.get(t) || [0, 0, 0, 0, 0, 0];
      n.set(t, [o[0], o[1], o[2] + c, o[3], o[4], o[5]]);
    });
  }), n;
}
export {
  m as a,
  y as g
};
