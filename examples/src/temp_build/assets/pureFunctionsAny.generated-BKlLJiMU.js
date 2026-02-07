function Le() {
  return Le = Object.assign ? Object.assign.bind() : function(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) ({}).hasOwnProperty.call(t, n) && (r[n] = t[n]);
    }
    return r;
  }, Le.apply(null, arguments);
}
var Bi = { relTol: 1e-12, absTol: 1e-15, matrix: "Matrix", number: "number", numberFallback: "number", precision: 64, predictable: false, randomSeed: null };
function ku(r, e) {
  if (ht(r, e)) return r[e];
  throw typeof r[e] == "function" && ra(r, e) ? new Error('Cannot access method "' + e + '" as a property') : new Error('No access to property "' + e + '"');
}
function ju(r, e, t) {
  if (ht(r, e)) return r[e] = t, t;
  throw new Error('No access to property "' + e + '"');
}
function ht(r, e) {
  return !ea(r) && !Array.isArray(r) ? false : ke(ta, e) ? true : !(e in Object.prototype || e in Function.prototype);
}
function ra(r, e) {
  return r == null || typeof r[e] != "function" || ke(r, e) && Object.getPrototypeOf && e in Object.getPrototypeOf(r) ? false : ke(na, e) ? true : !(e in Object.prototype || e in Function.prototype);
}
function ea(r) {
  return typeof r == "object" && r && r.constructor === Object;
}
var ta = { length: true, name: true }, na = { toString: true, valueOf: true, toLocaleString: true };
class ia {
  constructor(e) {
    this.wrappedObject = e, this[Symbol.iterator] = this.entries;
  }
  keys() {
    return Object.keys(this.wrappedObject).filter((e) => this.has(e)).values();
  }
  get(e) {
    return ku(this.wrappedObject, e);
  }
  set(e, t) {
    return ju(this.wrappedObject, e, t), this;
  }
  has(e) {
    return ht(this.wrappedObject, e) && e in this.wrappedObject;
  }
  entries() {
    return ua(this.keys(), (e) => [e, this.get(e)]);
  }
  forEach(e) {
    for (var t of this.keys()) e(this.get(t), t, this);
  }
  delete(e) {
    ht(this.wrappedObject, e) && delete this.wrappedObject[e];
  }
  clear() {
    for (var e of this.keys()) this.delete(e);
  }
  get size() {
    return Object.keys(this.wrappedObject).length;
  }
}
function ua(r, e) {
  return { next: () => {
    var t = r.next();
    return t.done ? t : { value: e(t.value), done: false };
  } };
}
function xr(r) {
  return typeof r == "number";
}
function Rr(r) {
  return !r || typeof r != "object" || typeof r.constructor != "function" ? false : r.isBigNumber === true && typeof r.constructor.prototype == "object" && r.constructor.prototype.isBigNumber === true || typeof r.constructor.isDecimal == "function" && r.constructor.isDecimal(r) === true;
}
function aa(r) {
  return typeof r == "bigint";
}
function kt(r) {
  return r && typeof r == "object" && Object.getPrototypeOf(r).isComplex === true || false;
}
function jt(r) {
  return r && typeof r == "object" && Object.getPrototypeOf(r).isFraction === true || false;
}
function Mi(r) {
  return r && r.constructor.prototype.isUnit === true || false;
}
function ce(r) {
  return typeof r == "string";
}
var Pr = Array.isArray;
function _r(r) {
  return r && r.constructor.prototype.isMatrix === true || false;
}
function He(r) {
  return Array.isArray(r) || _r(r);
}
function Si(r) {
  return r && r.isDenseMatrix && r.constructor.prototype.isMatrix === true || false;
}
function Ni(r) {
  return r && r.isSparseMatrix && r.constructor.prototype.isMatrix === true || false;
}
function xi(r) {
  return r && r.constructor.prototype.isRange === true || false;
}
function rn(r) {
  return r && r.constructor.prototype.isIndex === true || false;
}
function oa(r) {
  return typeof r == "boolean";
}
function sa(r) {
  return r && r.constructor.prototype.isResultSet === true || false;
}
function fa(r) {
  return r && r.constructor.prototype.isHelp === true || false;
}
function ca(r) {
  return typeof r == "function";
}
function la(r) {
  return r instanceof Date;
}
function ha(r) {
  return r instanceof RegExp;
}
function en(r) {
  return !!(r && typeof r == "object" && r.constructor === Object && !kt(r) && !jt(r));
}
function va(r) {
  return r ? r instanceof Map || r instanceof ia || typeof r.set == "function" && typeof r.get == "function" && typeof r.keys == "function" && typeof r.has == "function" : false;
}
function pa(r) {
  return r === null;
}
function da(r) {
  return r === void 0;
}
function ma(r) {
  return r && r.isAccessorNode === true && r.constructor.prototype.isNode === true || false;
}
function Da(r) {
  return r && r.isArrayNode === true && r.constructor.prototype.isNode === true || false;
}
function ga(r) {
  return r && r.isAssignmentNode === true && r.constructor.prototype.isNode === true || false;
}
function ya(r) {
  return r && r.isBlockNode === true && r.constructor.prototype.isNode === true || false;
}
function wa(r) {
  return r && r.isConditionalNode === true && r.constructor.prototype.isNode === true || false;
}
function Aa(r) {
  return r && r.isConstantNode === true && r.constructor.prototype.isNode === true || false;
}
function Fa(r) {
  return r && r.isFunctionAssignmentNode === true && r.constructor.prototype.isNode === true || false;
}
function Ea(r) {
  return r && r.isFunctionNode === true && r.constructor.prototype.isNode === true || false;
}
function Ca(r) {
  return r && r.isIndexNode === true && r.constructor.prototype.isNode === true || false;
}
function ba(r) {
  return r && r.isNode === true && r.constructor.prototype.isNode === true || false;
}
function _a(r) {
  return r && r.isObjectNode === true && r.constructor.prototype.isNode === true || false;
}
function Ba(r) {
  return r && r.isOperatorNode === true && r.constructor.prototype.isNode === true || false;
}
function Ma(r) {
  return r && r.isParenthesisNode === true && r.constructor.prototype.isNode === true || false;
}
function Sa(r) {
  return r && r.isRangeNode === true && r.constructor.prototype.isNode === true || false;
}
function Na(r) {
  return r && r.isRelationalNode === true && r.constructor.prototype.isNode === true || false;
}
function xa(r) {
  return r && r.isSymbolNode === true && r.constructor.prototype.isNode === true || false;
}
function Ta(r) {
  return r && r.constructor.prototype.isChain === true || false;
}
function te(r) {
  var e = typeof r;
  return e === "object" ? r === null ? "null" : Rr(r) ? "BigNumber" : r.constructor && r.constructor.name ? r.constructor.name : "Object" : e;
}
function Fr(r) {
  var e = typeof r;
  if (e === "number" || e === "bigint" || e === "string" || e === "boolean" || r === null || r === void 0) return r;
  if (typeof r.clone == "function") return r.clone();
  if (Array.isArray(r)) return r.map(function(t) {
    return Fr(t);
  });
  if (r instanceof Date) return new Date(r.valueOf());
  if (Rr(r)) return r;
  if (en(r)) return za(r, Fr);
  if (e === "function") return r;
  throw new TypeError("Cannot clone: unknown type of value (value: ".concat(r, ")"));
}
function za(r, e) {
  var t = {};
  for (var n in r) ke(r, n) && (t[n] = e(r[n]));
  return t;
}
function Ti(r, e) {
  for (var t in e) ke(e, t) && (r[t] = e[t]);
  return r;
}
function Fe(r, e) {
  var t, n, i;
  if (Array.isArray(r)) {
    if (!Array.isArray(e) || r.length !== e.length) return false;
    for (n = 0, i = r.length; n < i; n++) if (!Fe(r[n], e[n])) return false;
    return true;
  } else {
    if (typeof r == "function") return r === e;
    if (r instanceof Object) {
      if (Array.isArray(e) || !(e instanceof Object)) return false;
      for (t in r) if (!(t in e) || !Fe(r[t], e[t])) return false;
      for (t in e) if (!(t in r)) return false;
      return true;
    } else return r === e;
  }
}
function ke(r, e) {
  return r && Object.hasOwnProperty.call(r, e);
}
function Ia(r, e) {
  for (var t = {}, n = 0; n < e.length; n++) {
    var i = e[n], u = r[i];
    u !== void 0 && (t[i] = u);
  }
  return t;
}
var Oa = ["Matrix", "Array"], $a = ["number", "BigNumber", "bigint", "Fraction"], Kr = function(e) {
  if (e) throw new Error(`The global config is readonly. 
Please create a mathjs instance if you want to change the default configuration. 
Example:

  import { create, all } from 'mathjs';
  const mathjs = create(all);
  mathjs.config({ number: 'BigNumber' });
`);
  return Object.freeze(Bi);
};
Le(Kr, Bi, { MATRIX_OPTIONS: Oa, NUMBER_OPTIONS: $a });
function An() {
  return true;
}
function ae() {
  return false;
}
function Oe() {
}
const Fn = "Argument is not a typed-function.";
function zi() {
  function r(b) {
    return typeof b == "object" && b !== null && b.constructor === Object;
  }
  const e = [{ name: "number", test: function(b) {
    return typeof b == "number";
  } }, { name: "string", test: function(b) {
    return typeof b == "string";
  } }, { name: "boolean", test: function(b) {
    return typeof b == "boolean";
  } }, { name: "Function", test: function(b) {
    return typeof b == "function";
  } }, { name: "Array", test: Array.isArray }, { name: "Date", test: function(b) {
    return b instanceof Date;
  } }, { name: "RegExp", test: function(b) {
    return b instanceof RegExp;
  } }, { name: "Object", test: r }, { name: "null", test: function(b) {
    return b === null;
  } }, { name: "undefined", test: function(b) {
    return b === void 0;
  } }], t = { name: "any", test: An, isAny: true };
  let n, i, u = 0, a = { createCount: 0 };
  function o(b) {
    const N = n.get(b);
    if (N) return N;
    let z = 'Unknown type "' + b + '"';
    const P = b.toLowerCase();
    let J;
    for (J of i) if (J.toLowerCase() === P) {
      z += '. Did you mean "' + J + '" ?';
      break;
    }
    throw new TypeError(z);
  }
  function f(b) {
    let N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "any";
    const z = N ? o(N).index : i.length, P = [];
    for (let q = 0; q < b.length; ++q) {
      if (!b[q] || typeof b[q].name != "string" || typeof b[q].test != "function") throw new TypeError("Object with properties {name: string, test: function} expected");
      const rr = b[q].name;
      if (n.has(rr)) throw new TypeError('Duplicate type name "' + rr + '"');
      P.push(rr), n.set(rr, { name: rr, test: b[q].test, isAny: b[q].isAny, index: z + q, conversionsTo: [] });
    }
    const J = i.slice(z);
    i = i.slice(0, z).concat(P).concat(J);
    for (let q = z + P.length; q < i.length; ++q) n.get(i[q]).index = q;
  }
  function c() {
    n = /* @__PURE__ */ new Map(), i = [], u = 0, f([t], false);
  }
  c(), f(e);
  function s() {
    let b;
    for (b of i) n.get(b).conversionsTo = [];
    u = 0;
  }
  function h(b) {
    const N = i.filter((z) => {
      const P = n.get(z);
      return !P.isAny && P.test(b);
    });
    return N.length ? N : ["any"];
  }
  function v(b) {
    return b && typeof b == "function" && "_typedFunctionData" in b;
  }
  function p(b, N, z) {
    if (!v(b)) throw new TypeError(Fn);
    const P = z && z.exact, J = Array.isArray(N) ? N.join(",") : N, q = C(J), rr = D(q);
    if (!P || rr in b.signatures) {
      const pr = b._typedFunctionData.signatureMap.get(rr);
      if (pr) return pr;
    }
    const K = q.length;
    let or;
    if (P) {
      or = [];
      let pr;
      for (pr in b.signatures) or.push(b._typedFunctionData.signatureMap.get(pr));
    } else or = b._typedFunctionData.signatures;
    for (let pr = 0; pr < K; ++pr) {
      const Cr = q[pr], Ur = [];
      let Hr;
      for (Hr of or) {
        const Qr = F(Hr.params, pr);
        if (!(!Qr || Cr.restParam && !Qr.restParam)) {
          if (!Qr.hasAny) {
            const ie = m(Qr);
            if (Cr.types.some((ue) => !ie.has(ue.name))) continue;
          }
          Ur.push(Hr);
        }
      }
      if (or = Ur, or.length === 0) break;
    }
    let Y;
    for (Y of or) if (Y.params.length <= K) return Y;
    throw new TypeError("Signature not found (signature: " + (b.name || "unnamed") + "(" + D(q, ", ") + "))");
  }
  function d(b, N, z) {
    return p(b, N, z).implementation;
  }
  function l(b, N) {
    const z = o(N);
    if (z.test(b)) return b;
    const P = z.conversionsTo;
    if (P.length === 0) throw new Error("There are no conversions to " + N + " defined.");
    for (let J = 0; J < P.length; J++) if (o(P[J].from).test(b)) return P[J].convert(b);
    throw new Error("Cannot convert " + b + " to " + N);
  }
  function D(b) {
    let N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : ",";
    return b.map((z) => z.name).join(N);
  }
  function g(b) {
    const N = b.indexOf("...") === 0, P = (N ? b.length > 3 ? b.slice(3) : "any" : b).split("|").map((K) => o(K.trim()));
    let J = false, q = N ? "..." : "";
    return { types: P.map(function(K) {
      return J = K.isAny || J, q += K.name + "|", { name: K.name, typeIndex: K.index, test: K.test, isAny: K.isAny, conversion: null, conversionIndex: -1 };
    }), name: q.slice(0, -1), hasAny: J, hasConversion: false, restParam: N };
  }
  function E(b) {
    const N = b.types.map((rr) => rr.name), z = Q(N);
    let P = b.hasAny, J = b.name;
    const q = z.map(function(rr) {
      const K = o(rr.from);
      return P = K.isAny || P, J += "|" + rr.from, { name: rr.from, typeIndex: K.index, test: K.test, isAny: K.isAny, conversion: rr, conversionIndex: rr.index };
    });
    return { types: b.types.concat(q), name: J, hasAny: P, hasConversion: q.length > 0, restParam: b.restParam };
  }
  function m(b) {
    return b.typeSet || (b.typeSet = /* @__PURE__ */ new Set(), b.types.forEach((N) => b.typeSet.add(N.name))), b.typeSet;
  }
  function C(b) {
    const N = [];
    if (typeof b != "string") throw new TypeError("Signatures must be strings");
    const z = b.trim();
    if (z === "") return N;
    const P = z.split(",");
    for (let J = 0; J < P.length; ++J) {
      const q = g(P[J].trim());
      if (q.restParam && J !== P.length - 1) throw new SyntaxError('Unexpected rest parameter "' + P[J] + '": only allowed for the last parameter');
      if (q.types.length === 0) return null;
      N.push(q);
    }
    return N;
  }
  function A(b) {
    const N = X(b);
    return N ? N.restParam : false;
  }
  function w(b) {
    if (!b || b.types.length === 0) return An;
    if (b.types.length === 1) return o(b.types[0].name).test;
    if (b.types.length === 2) {
      const N = o(b.types[0].name).test, z = o(b.types[1].name).test;
      return function(J) {
        return N(J) || z(J);
      };
    } else {
      const N = b.types.map(function(z) {
        return o(z.name).test;
      });
      return function(P) {
        for (let J = 0; J < N.length; J++) if (N[J](P)) return true;
        return false;
      };
    }
  }
  function _(b) {
    let N, z, P;
    if (A(b)) {
      N = H(b).map(w);
      const J = N.length, q = w(X(b)), rr = function(K) {
        for (let or = J; or < K.length; or++) if (!q(K[or])) return false;
        return true;
      };
      return function(or) {
        for (let Y = 0; Y < N.length; Y++) if (!N[Y](or[Y])) return false;
        return rr(or) && or.length >= J + 1;
      };
    } else return b.length === 0 ? function(q) {
      return q.length === 0;
    } : b.length === 1 ? (z = w(b[0]), function(q) {
      return z(q[0]) && q.length === 1;
    }) : b.length === 2 ? (z = w(b[0]), P = w(b[1]), function(q) {
      return z(q[0]) && P(q[1]) && q.length === 2;
    }) : (N = b.map(w), function(q) {
      for (let rr = 0; rr < N.length; rr++) if (!N[rr](q[rr])) return false;
      return q.length === N.length;
    });
  }
  function F(b, N) {
    return N < b.length ? b[N] : A(b) ? X(b) : null;
  }
  function y(b, N) {
    const z = F(b, N);
    return z ? m(z) : /* @__PURE__ */ new Set();
  }
  function M(b) {
    return b.conversion === null || b.conversion === void 0;
  }
  function B(b, N) {
    const z = /* @__PURE__ */ new Set();
    return b.forEach((P) => {
      const J = y(P.params, N);
      let q;
      for (q of J) z.add(q);
    }), z.has("any") ? ["any"] : Array.from(z);
  }
  function S(b, N, z) {
    let P, J;
    const q = b || "unnamed";
    let rr = z, K;
    for (K = 0; K < N.length; K++) {
      const Cr = [];
      if (rr.forEach((Ur) => {
        const Hr = F(Ur.params, K), Qr = w(Hr);
        (K < Ur.params.length || A(Ur.params)) && Qr(N[K]) && Cr.push(Ur);
      }), Cr.length === 0) {
        if (J = B(rr, K), J.length > 0) {
          const Ur = h(N[K]);
          return P = new TypeError("Unexpected type of argument in function " + q + " (expected: " + J.join(" or ") + ", actual: " + Ur.join(" | ") + ", index: " + K + ")"), P.data = { category: "wrongType", fn: q, index: K, actual: Ur, expected: J }, P;
        }
      } else rr = Cr;
    }
    const or = rr.map(function(Cr) {
      return A(Cr.params) ? 1 / 0 : Cr.params.length;
    });
    if (N.length < Math.min.apply(null, or)) return J = B(rr, K), P = new TypeError("Too few arguments in function " + q + " (expected: " + J.join(" or ") + ", index: " + N.length + ")"), P.data = { category: "tooFewArgs", fn: q, index: N.length, expected: J }, P;
    const Y = Math.max.apply(null, or);
    if (N.length > Y) return P = new TypeError("Too many arguments in function " + q + " (expected: " + Y + ", actual: " + N.length + ")"), P.data = { category: "tooManyArgs", fn: q, index: N.length, expectedLength: Y }, P;
    const pr = [];
    for (let Cr = 0; Cr < N.length; ++Cr) pr.push(h(N[Cr]).join("|"));
    return P = new TypeError('Arguments of type "' + pr.join(", ") + '" do not match any of the defined signatures of function ' + q + "."), P.data = { category: "mismatch", actual: pr }, P;
  }
  function O(b) {
    let N = i.length + 1;
    for (let z = 0; z < b.types.length; z++) N = Math.min(N, b.types[z].typeIndex);
    return N;
  }
  function x(b) {
    let N = u + 1;
    for (let z = 0; z < b.types.length; z++) M(b.types[z]) || (N = Math.min(N, b.types[z].conversionIndex));
    return N;
  }
  function $(b, N) {
    if (b.hasAny) {
      if (!N.hasAny) return 0.1;
    } else if (N.hasAny) return -0.1;
    if (b.restParam) {
      if (!N.restParam) return 0.01;
    } else if (N.restParam) return -0.01;
    const z = O(b) - O(N);
    if (z < 0) return -1e-3;
    if (z > 0) return 1e-3;
    const P = x(b), J = x(N);
    if (b.hasConversion) {
      if (!N.hasConversion) return (1 + P) * 1e-6;
    } else if (N.hasConversion) return -(1 + J) * 1e-6;
    const q = P - J;
    return q < 0 ? -1e-7 : q > 0 ? 1e-7 : 0;
  }
  function T(b, N) {
    const z = b.params, P = N.params, J = X(z), q = X(P), rr = A(z), K = A(P);
    if (rr && J.hasAny) {
      if (!K || !q.hasAny) return 1e7;
    } else if (K && q.hasAny) return -1e7;
    let or = 0, Y = 0, pr;
    for (pr of z) pr.hasAny && ++or, pr.hasConversion && ++Y;
    let Cr = 0, Ur = 0;
    for (pr of P) pr.hasAny && ++Cr, pr.hasConversion && ++Ur;
    if (or !== Cr) return (or - Cr) * 1e6;
    if (rr && J.hasConversion) {
      if (!K || !q.hasConversion) return 1e5;
    } else if (K && q.hasConversion) return -1e5;
    if (Y !== Ur) return (Y - Ur) * 1e4;
    if (rr) {
      if (!K) return 1e3;
    } else if (K) return -1e3;
    const Hr = (z.length - P.length) * (rr ? -100 : 100);
    if (Hr !== 0) return Hr;
    const Qr = [];
    let ie = 0;
    for (let Ie = 0; Ie < z.length; ++Ie) {
      const ut = $(z[Ie], P[Ie]);
      Qr.push(ut), ie += ut;
    }
    if (ie !== 0) return (ie < 0 ? -10 : 10) + ie;
    let ue, ze = 9;
    const qt = ze / (Qr.length + 1);
    for (ue of Qr) {
      if (ue !== 0) return (ue < 0 ? -ze : ze) + ue;
      ze -= qt;
    }
    return 0;
  }
  function Q(b) {
    if (b.length === 0) return [];
    const N = b.map(o);
    if (b.length === 1) return N[0].conversionsTo;
    const z = new Set(b), P = /* @__PURE__ */ new Set();
    for (let q = 0; q < N.length; ++q) for (const rr of N[q].conversionsTo) z.has(rr.from) || P.add(rr.from);
    const J = [];
    for (const q of P) {
      let rr = u + 1, K = null;
      for (let or = 0; or < N.length; ++or) for (const Y of N[or].conversionsTo) Y.from === q && Y.index < rr && (rr = Y.index, K = Y);
      J.push(K);
    }
    return J;
  }
  function R(b, N) {
    let z = N, P = "";
    if (b.some((q) => q.hasConversion)) {
      const q = A(b), rr = b.map(L);
      P = rr.map((K) => K.name).join(";"), z = function() {
        const or = [], Y = q ? arguments.length - 1 : arguments.length;
        for (let pr = 0; pr < Y; pr++) or[pr] = rr[pr](arguments[pr]);
        return q && (or[Y] = arguments[Y].map(rr[Y])), N.apply(this, or);
      };
    }
    let J = z;
    if (A(b)) {
      const q = b.length - 1;
      J = function() {
        return z.apply(this, G(arguments, 0, q).concat([G(arguments, q)]));
      };
    }
    return P && Object.defineProperty(J, "name", { value: P }), J;
  }
  function L(b) {
    let N, z, P, J;
    const q = [], rr = [];
    let K = "";
    b.types.forEach(function(Y) {
      Y.conversion && (K += Y.conversion.from + "~>" + Y.conversion.to + ",", q.push(o(Y.conversion.from).test), rr.push(Y.conversion.convert));
    }), K ? K = K.slice(0, -1) : K = "pass";
    let or = (Y) => Y;
    switch (rr.length) {
      case 0:
        break;
      case 1:
        N = q[0], P = rr[0], or = function(pr) {
          return N(pr) ? P(pr) : pr;
        };
        break;
      case 2:
        N = q[0], z = q[1], P = rr[0], J = rr[1], or = function(pr) {
          return N(pr) ? P(pr) : z(pr) ? J(pr) : pr;
        };
        break;
      default:
        or = function(pr) {
          for (let Cr = 0; Cr < rr.length; Cr++) if (q[Cr](pr)) return rr[Cr](pr);
          return pr;
        };
    }
    return Object.defineProperty(or, "name", { value: K }), or;
  }
  function nr(b) {
    function N(z, P, J) {
      if (P < z.length) {
        const q = z[P];
        let rr = [];
        if (q.restParam) {
          const K = q.types.filter(M);
          K.length < q.types.length && rr.push({ types: K, name: "..." + K.map((or) => or.name).join("|"), hasAny: K.some((or) => or.isAny), hasConversion: false, restParam: true }), rr.push(q);
        } else rr = q.types.map(function(K) {
          return { types: [K], name: K.name, hasAny: K.isAny, hasConversion: K.conversion, restParam: false };
        });
        return k(rr, function(K) {
          return N(z, P + 1, J.concat([K]));
        });
      } else return [J];
    }
    return N(b, 0, []);
  }
  function ar(b, N) {
    const z = Math.max(b.length, N.length);
    for (let K = 0; K < z; K++) {
      const or = y(b, K), Y = y(N, K);
      let pr = false, Cr;
      for (Cr of Y) if (or.has(Cr)) {
        pr = true;
        break;
      }
      if (!pr) return false;
    }
    const P = b.length, J = N.length, q = A(b), rr = A(N);
    return q ? rr ? P === J : J >= P : rr ? P >= J : P === J;
  }
  function U(b) {
    return b.map((N) => Ar(N) ? Dr(N.referToSelf.callback) : yr(N) ? mr(N.referTo.references, N.referTo.callback) : N);
  }
  function Z(b, N, z) {
    const P = [];
    let J;
    for (J of b) {
      let q = z[J];
      if (typeof q != "number") throw new TypeError('No definition for referenced signature "' + J + '"');
      if (q = N[q], typeof q != "function") return false;
      P.push(q);
    }
    return P;
  }
  function tr(b, N, z) {
    const P = U(b), J = new Array(P.length).fill(false);
    let q = true;
    for (; q; ) {
      q = false;
      let rr = true;
      for (let K = 0; K < P.length; ++K) {
        if (J[K]) continue;
        const or = P[K];
        if (Ar(or)) P[K] = or.referToSelf.callback(z), P[K].referToSelf = or.referToSelf, J[K] = true, rr = false;
        else if (yr(or)) {
          const Y = Z(or.referTo.references, P, N);
          Y ? (P[K] = or.referTo.callback.apply(this, Y), P[K].referTo = or.referTo, J[K] = true, rr = false) : q = true;
        }
      }
      if (rr && q) throw new SyntaxError("Circular reference detected in resolving typed.referTo");
    }
    return P;
  }
  function ur(b) {
    const N = /\bthis(\(|\.signatures\b)/;
    Object.keys(b).forEach((z) => {
      const P = b[z];
      if (N.test(P.toString())) throw new SyntaxError("Using `this` to self-reference a function is deprecated since typed-function@3. Use typed.referTo and typed.referToSelf instead.");
    });
  }
  function j(b, N) {
    if (a.createCount++, Object.keys(N).length === 0) throw new SyntaxError("No signatures provided");
    a.warnAgainstDeprecatedThis && ur(N);
    const z = [], P = [], J = {}, q = [];
    let rr;
    for (rr in N) {
      if (!Object.prototype.hasOwnProperty.call(N, rr)) continue;
      const Mr = C(rr);
      if (!Mr) continue;
      z.forEach(function(Ge) {
        if (ar(Ge, Mr)) throw new TypeError('Conflicting signatures "' + D(Ge) + '" and "' + D(Mr) + '".');
      }), z.push(Mr);
      const kr = P.length;
      P.push(N[rr]);
      const Ku = Mr.map(E);
      let at;
      for (at of nr(Ku)) {
        const Ge = D(at);
        q.push({ params: at, name: Ge, fn: kr }), at.every((Hu) => !Hu.hasConversion) && (J[Ge] = kr);
      }
    }
    q.sort(T);
    const K = tr(P, J, Xe);
    let or;
    for (or in J) Object.prototype.hasOwnProperty.call(J, or) && (J[or] = K[J[or]]);
    const Y = [], pr = /* @__PURE__ */ new Map();
    for (or of q) pr.has(or.name) || (or.fn = K[or.fn], Y.push(or), pr.set(or.name, or));
    const Cr = Y[0] && Y[0].params.length <= 2 && !A(Y[0].params), Ur = Y[1] && Y[1].params.length <= 2 && !A(Y[1].params), Hr = Y[2] && Y[2].params.length <= 2 && !A(Y[2].params), Qr = Y[3] && Y[3].params.length <= 2 && !A(Y[3].params), ie = Y[4] && Y[4].params.length <= 2 && !A(Y[4].params), ue = Y[5] && Y[5].params.length <= 2 && !A(Y[5].params), ze = Cr && Ur && Hr && Qr && ie && ue;
    for (let Mr = 0; Mr < Y.length; ++Mr) Y[Mr].test = _(Y[Mr].params);
    const qt = Cr ? w(Y[0].params[0]) : ae, Ie = Ur ? w(Y[1].params[0]) : ae, ut = Hr ? w(Y[2].params[0]) : ae, Cu = Qr ? w(Y[3].params[0]) : ae, bu = ie ? w(Y[4].params[0]) : ae, _u = ue ? w(Y[5].params[0]) : ae, Bu = Cr ? w(Y[0].params[1]) : ae, Mu = Ur ? w(Y[1].params[1]) : ae, Su = Hr ? w(Y[2].params[1]) : ae, Nu = Qr ? w(Y[3].params[1]) : ae, xu = ie ? w(Y[4].params[1]) : ae, Tu = ue ? w(Y[5].params[1]) : ae;
    for (let Mr = 0; Mr < Y.length; ++Mr) Y[Mr].implementation = R(Y[Mr].params, Y[Mr].fn);
    const zu = Cr ? Y[0].implementation : Oe, Iu = Ur ? Y[1].implementation : Oe, Ou = Hr ? Y[2].implementation : Oe, $u = Qr ? Y[3].implementation : Oe, Pu = ie ? Y[4].implementation : Oe, qu = ue ? Y[5].implementation : Oe, Ru = Cr ? Y[0].params.length : -1, Uu = Ur ? Y[1].params.length : -1, Lu = Hr ? Y[2].params.length : -1, Zu = Qr ? Y[3].params.length : -1, Vu = ie ? Y[4].params.length : -1, Wu = ue ? Y[5].params.length : -1, Ju = ze ? 6 : 0, Yu = Y.length, Qu = Y.map((Mr) => Mr.test), Xu = Y.map((Mr) => Mr.implementation), Gu = function() {
      for (let kr = Ju; kr < Yu; kr++) if (Qu[kr](arguments)) return Xu[kr].apply(this, arguments);
      return a.onMismatch(b, arguments, Y);
    };
    function Xe(Mr, kr) {
      return arguments.length === Ru && qt(Mr) && Bu(kr) ? zu.apply(this, arguments) : arguments.length === Uu && Ie(Mr) && Mu(kr) ? Iu.apply(this, arguments) : arguments.length === Lu && ut(Mr) && Su(kr) ? Ou.apply(this, arguments) : arguments.length === Zu && Cu(Mr) && Nu(kr) ? $u.apply(this, arguments) : arguments.length === Vu && bu(Mr) && xu(kr) ? Pu.apply(this, arguments) : arguments.length === Wu && _u(Mr) && Tu(kr) ? qu.apply(this, arguments) : Gu.apply(this, arguments);
    }
    try {
      Object.defineProperty(Xe, "name", { value: b });
    } catch {
    }
    return Xe.signatures = J, Xe._typedFunctionData = { signatures: Y, signatureMap: pr }, Xe;
  }
  function W(b, N, z) {
    throw S(b, N, z);
  }
  function H(b) {
    return G(b, 0, b.length - 1);
  }
  function X(b) {
    return b[b.length - 1];
  }
  function G(b, N, z) {
    return Array.prototype.slice.call(b, N, z);
  }
  function sr(b, N) {
    for (let z = 0; z < b.length; z++) if (N(b[z])) return b[z];
  }
  function k(b, N) {
    return Array.prototype.concat.apply([], b.map(N));
  }
  function hr() {
    const b = H(arguments).map((z) => D(C(z))), N = X(arguments);
    if (typeof N != "function") throw new TypeError("Callback function expected as last argument");
    return mr(b, N);
  }
  function mr(b, N) {
    return { referTo: { references: b, callback: N } };
  }
  function Dr(b) {
    if (typeof b != "function") throw new TypeError("Callback function expected as first argument");
    return { referToSelf: { callback: b } };
  }
  function yr(b) {
    return b && typeof b.referTo == "object" && Array.isArray(b.referTo.references) && typeof b.referTo.callback == "function";
  }
  function Ar(b) {
    return b && typeof b.referToSelf == "object" && typeof b.referToSelf.callback == "function";
  }
  function Er(b, N) {
    if (!b) return N;
    if (N && N !== b) {
      const z = new Error("Function names do not match (expected: " + b + ", actual: " + N + ")");
      throw z.data = { actual: N, expected: b }, z;
    }
    return b;
  }
  function Ir(b) {
    let N;
    for (const z in b) Object.prototype.hasOwnProperty.call(b, z) && (v(b[z]) || typeof b[z].signature == "string") && (N = Er(N, b[z].name));
    return N;
  }
  function Br(b, N) {
    let z;
    for (z in N) if (Object.prototype.hasOwnProperty.call(N, z)) {
      if (z in b && N[z] !== b[z]) {
        const P = new Error('Signature "' + z + '" is defined twice');
        throw P.data = { signature: z, sourceFunction: N[z], destFunction: b[z] }, P;
      }
      b[z] = N[z];
    }
  }
  const Nr = a;
  a = function(b) {
    const N = typeof b == "string", z = N ? 1 : 0;
    let P = N ? b : "";
    const J = {};
    for (let q = z; q < arguments.length; ++q) {
      const rr = arguments[q];
      let K = {}, or;
      if (typeof rr == "function" ? (or = rr.name, typeof rr.signature == "string" ? K[rr.signature] = rr : v(rr) && (K = rr.signatures)) : r(rr) && (K = rr, N || (or = Ir(rr))), Object.keys(K).length === 0) {
        const Y = new TypeError("Argument to 'typed' at index " + q + " is not a (typed) function, nor an object with signatures as keys and functions as values.");
        throw Y.data = { index: q, argument: rr }, Y;
      }
      N || (P = Er(P, or)), Br(J, K);
    }
    return j(P || "", J);
  }, a.create = zi, a.createCount = Nr.createCount, a.onMismatch = W, a.throwMismatchError = W, a.createError = S, a.clear = c, a.clearConversions = s, a.addTypes = f, a._findType = o, a.referTo = hr, a.referToSelf = Dr, a.convert = l, a.findSignature = p, a.find = d, a.isTypedFunction = v, a.warnAgainstDeprecatedThis = true, a.addType = function(b, N) {
    let z = "any";
    N !== false && n.has("Object") && (z = "Object"), a.addTypes([b], z);
  };
  function Yr(b) {
    if (!b || typeof b.from != "string" || typeof b.to != "string" || typeof b.convert != "function") throw new TypeError("Object with properties {from: string, to: string, convert: function} expected");
    if (b.to === b.from) throw new SyntaxError('Illegal to define conversion from "' + b.from + '" to itself.');
  }
  return a.addConversion = function(b) {
    let N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { override: false };
    Yr(b);
    const z = o(b.to), P = z.conversionsTo.find((J) => J.from === b.from);
    if (P) if (N && N.override) a.removeConversion({ from: P.from, to: b.to, convert: P.convert });
    else throw new Error('There is already a conversion from "' + b.from + '" to "' + z.name + '"');
    z.conversionsTo.push({ from: b.from, to: z.name, convert: b.convert, index: u++ });
  }, a.addConversions = function(b, N) {
    b.forEach((z) => a.addConversion(z, N));
  }, a.removeConversion = function(b) {
    Yr(b);
    const N = o(b.to), z = sr(N.conversionsTo, (J) => J.from === b.from);
    if (!z) throw new Error("Attempt to remove nonexistent conversion from " + b.from + " to " + b.to);
    if (z.convert !== b.convert) throw new Error("Conversion to remove does not match existing conversion");
    const P = N.conversionsTo.indexOf(z);
    N.conversionsTo.splice(P, 1);
  }, a.resolve = function(b, N) {
    if (!v(b)) throw new TypeError(Fn);
    const z = b._typedFunctionData.signatures;
    for (let P = 0; P < z.length; ++P) if (z[P].test(N)) return z[P];
    return null;
  }, a;
}
const vt = zi();
function er(r, e, t, n) {
  function i(u) {
    var a = Ia(u, e.map(Ra));
    return Pa(r, e, u), t(a);
  }
  return i.isFactory = true, i.fn = r, i.dependencies = e.slice().sort(), n && (i.meta = n), i;
}
function Pa(r, e, t) {
  var n = e.filter((u) => !qa(u)).every((u) => t[u] !== void 0);
  if (!n) {
    var i = e.filter((u) => t[u] === void 0);
    throw new Error('Cannot create function "'.concat(r, '", ') + "some dependencies are missing: ".concat(i.map((u) => '"'.concat(u, '"')).join(", "), "."));
  }
}
function qa(r) {
  return r && r[0] === "?";
}
function Ra(r) {
  return r && r[0] === "?" ? r.slice(1) : r;
}
function zr(r) {
  return typeof r == "boolean" ? true : isFinite(r) ? r === Math.round(r) : false;
}
var Ua = Math.sign || function(r) {
  return r > 0 ? 1 : r < 0 ? -1 : 0;
};
function Rt(r, e, t) {
  var n = { 2: "0b", 8: "0o", 16: "0x" }, i = n[e], u = "";
  if (t) {
    if (t < 1) throw new Error("size must be in greater than 0");
    if (!zr(t)) throw new Error("size must be an integer");
    if (r > 2 ** (t - 1) - 1 || r < -(2 ** (t - 1))) throw new Error("Value must be in range [-2^".concat(t - 1, ", 2^").concat(t - 1, "-1]"));
    if (!zr(r)) throw new Error("Value must be an integer");
    r < 0 && (r = r + 2 ** t), u = "i".concat(t);
  }
  var a = "";
  return r < 0 && (r = -r, a = "-"), "".concat(a).concat(i).concat(r.toString(e)).concat(u);
}
function Vt(r, e) {
  if (typeof e == "function") return e(r);
  if (r === 1 / 0) return "Infinity";
  if (r === -1 / 0) return "-Infinity";
  if (isNaN(r)) return "NaN";
  var { notation: t, precision: n, wordSize: i } = Ii(e);
  switch (t) {
    case "fixed":
      return Za(r, n);
    case "exponential":
      return Oi(r, n);
    case "engineering":
      return La(r, n);
    case "bin":
      return Rt(r, 2, i);
    case "oct":
      return Rt(r, 8, i);
    case "hex":
      return Rt(r, 16, i);
    case "auto":
      return Va(r, n, e).replace(/((\.\d*?)(0+))($|e)/, function() {
        var u = arguments[2], a = arguments[4];
        return u !== "." ? u + a : a;
      });
    default:
      throw new Error('Unknown notation "' + t + '". Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.');
  }
}
function Ii(r) {
  var e = "auto", t, n;
  if (r !== void 0) if (xr(r)) t = r;
  else if (Rr(r)) t = r.toNumber();
  else if (en(r)) r.precision !== void 0 && (t = En(r.precision, () => {
    throw new Error('Option "precision" must be a number or BigNumber');
  })), r.wordSize !== void 0 && (n = En(r.wordSize, () => {
    throw new Error('Option "wordSize" must be a number or BigNumber');
  })), r.notation && (e = r.notation);
  else throw new Error("Unsupported type of options, number, BigNumber, or object expected");
  return { notation: e, precision: t, wordSize: n };
}
function _t(r) {
  var e = String(r).toLowerCase().match(/^(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
  if (!e) throw new SyntaxError("Invalid number " + r);
  var t = e[1], n = e[2], i = parseFloat(e[4] || "0"), u = n.indexOf(".");
  i += u !== -1 ? u - 1 : n.length - 1;
  var a = n.replace(".", "").replace(/^0*/, function(o) {
    return i -= o.length, "";
  }).replace(/0*$/, "").split("").map(function(o) {
    return parseInt(o);
  });
  return a.length === 0 && (a.push(0), i++), { sign: t, coefficients: a, exponent: i };
}
function La(r, e) {
  if (isNaN(r) || !isFinite(r)) return String(r);
  var t = _t(r), n = Bt(t, e), i = n.exponent, u = n.coefficients, a = i % 3 === 0 ? i : i < 0 ? i - 3 - i % 3 : i - i % 3;
  if (xr(e)) for (; e > u.length || i - a + 1 > u.length; ) u.push(0);
  else for (var o = Math.abs(i - a) - (u.length - 1), f = 0; f < o; f++) u.push(0);
  for (var c = Math.abs(i - a), s = 1; c > 0; ) s++, c--;
  var h = u.slice(s).join(""), v = xr(e) && h.length || h.match(/[1-9]/) ? "." + h : "", p = u.slice(0, s).join("") + v + "e" + (i >= 0 ? "+" : "") + a.toString();
  return n.sign + p;
}
function Za(r, e) {
  if (isNaN(r) || !isFinite(r)) return String(r);
  var t = _t(r), n = typeof e == "number" ? Bt(t, t.exponent + 1 + e) : t, i = n.coefficients, u = n.exponent + 1, a = u + (e || 0);
  return i.length < a && (i = i.concat(Ue(a - i.length))), u < 0 && (i = Ue(-u + 1).concat(i), u = 1), u < i.length && i.splice(u, 0, u === 0 ? "0." : "."), n.sign + i.join("");
}
function Oi(r, e) {
  if (isNaN(r) || !isFinite(r)) return String(r);
  var t = _t(r), n = e ? Bt(t, e) : t, i = n.coefficients, u = n.exponent;
  i.length < e && (i = i.concat(Ue(e - i.length)));
  var a = i.shift();
  return n.sign + a + (i.length > 0 ? "." + i.join("") : "") + "e" + (u >= 0 ? "+" : "") + u;
}
function Va(r, e, t) {
  if (isNaN(r) || !isFinite(r)) return String(r);
  var n = Cn(t == null ? void 0 : t.lowerExp, -3), i = Cn(t == null ? void 0 : t.upperExp, 5), u = _t(r), a = e ? Bt(u, e) : u;
  if (a.exponent < n || a.exponent >= i) return Oi(r, e);
  var o = a.coefficients, f = a.exponent;
  o.length < e && (o = o.concat(Ue(e - o.length))), o = o.concat(Ue(f - o.length + 1 + (o.length < e ? e - o.length : 0))), o = Ue(-f).concat(o);
  var c = f > 0 ? f : 0;
  return c < o.length - 1 && o.splice(c + 1, 0, "."), a.sign + o.join("");
}
function Bt(r, e) {
  for (var t = { sign: r.sign, coefficients: r.coefficients, exponent: r.exponent }, n = t.coefficients; e <= 0; ) n.unshift(0), t.exponent++, e++;
  if (n.length > e) {
    var i = n.splice(e, n.length - e);
    if (i[0] >= 5) {
      var u = e - 1;
      for (n[u]++; n[u] === 10; ) n.pop(), u === 0 && (n.unshift(0), t.exponent++, u++), u--, n[u]++;
    }
  }
  return t;
}
function Ue(r) {
  for (var e = [], t = 0; t < r; t++) e.push(0);
  return e;
}
function Wa(r) {
  return r.toExponential().replace(/e.*$/, "").replace(/^0\.?0*|\./, "").length;
}
function De(r, e) {
  var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1e-8, n = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
  if (t <= 0) throw new Error("Relative tolerance must be greater than 0");
  if (n < 0) throw new Error("Absolute tolerance must be at least 0");
  return isNaN(r) || isNaN(e) ? false : !isFinite(r) || !isFinite(e) ? r === e : r === e ? true : Math.abs(r - e) <= Math.max(t * Math.max(Math.abs(r), Math.abs(e)), n);
}
function En(r, e) {
  if (xr(r)) return r;
  if (Rr(r)) return r.toNumber();
  e();
}
function Cn(r, e) {
  return xr(r) ? r : Rr(r) ? r.toNumber() : e;
}
var $i = function() {
  return $i = vt.create, vt;
}, Ja = ["?BigNumber", "?Complex", "?DenseMatrix", "?Fraction"], Ya = er("typed", Ja, function(e) {
  var { BigNumber: t, Complex: n, DenseMatrix: i, Fraction: u } = e, a = $i();
  return a.clear(), a.addTypes([{ name: "number", test: xr }, { name: "Complex", test: kt }, { name: "BigNumber", test: Rr }, { name: "bigint", test: aa }, { name: "Fraction", test: jt }, { name: "Unit", test: Mi }, { name: "identifier", test: (o) => ce && /^(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])*$/.test(o) }, { name: "string", test: ce }, { name: "Chain", test: Ta }, { name: "Array", test: Pr }, { name: "Matrix", test: _r }, { name: "DenseMatrix", test: Si }, { name: "SparseMatrix", test: Ni }, { name: "Range", test: xi }, { name: "Index", test: rn }, { name: "boolean", test: oa }, { name: "ResultSet", test: sa }, { name: "Help", test: fa }, { name: "function", test: ca }, { name: "Date", test: la }, { name: "RegExp", test: ha }, { name: "null", test: pa }, { name: "undefined", test: da }, { name: "AccessorNode", test: ma }, { name: "ArrayNode", test: Da }, { name: "AssignmentNode", test: ga }, { name: "BlockNode", test: ya }, { name: "ConditionalNode", test: wa }, { name: "ConstantNode", test: Aa }, { name: "FunctionNode", test: Ea }, { name: "FunctionAssignmentNode", test: Fa }, { name: "IndexNode", test: Ca }, { name: "Node", test: ba }, { name: "ObjectNode", test: _a }, { name: "OperatorNode", test: Ba }, { name: "ParenthesisNode", test: Ma }, { name: "RangeNode", test: Sa }, { name: "RelationalNode", test: Na }, { name: "SymbolNode", test: xa }, { name: "Map", test: va }, { name: "Object", test: en }]), a.addConversions([{ from: "number", to: "BigNumber", convert: function(f) {
    if (t || ot(f), Wa(f) > 15) throw new TypeError("Cannot implicitly convert a number with >15 significant digits to BigNumber (value: " + f + "). Use function bignumber(x) to convert to BigNumber.");
    return new t(f);
  } }, { from: "number", to: "Complex", convert: function(f) {
    return n || st(f), new n(f, 0);
  } }, { from: "BigNumber", to: "Complex", convert: function(f) {
    return n || st(f), new n(f.toNumber(), 0);
  } }, { from: "bigint", to: "number", convert: function(f) {
    if (f > Number.MAX_SAFE_INTEGER) throw new TypeError("Cannot implicitly convert bigint to number: value exceeds the max safe integer value (value: " + f + ")");
    return Number(f);
  } }, { from: "bigint", to: "BigNumber", convert: function(f) {
    return t || ot(f), new t(f.toString());
  } }, { from: "bigint", to: "Fraction", convert: function(f) {
    return u || ft(f), new u(f);
  } }, { from: "Fraction", to: "BigNumber", convert: function(f) {
    throw new TypeError("Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.");
  } }, { from: "Fraction", to: "Complex", convert: function(f) {
    return n || st(f), new n(f.valueOf(), 0);
  } }, { from: "number", to: "Fraction", convert: function(f) {
    u || ft(f);
    var c = new u(f);
    if (c.valueOf() !== f) throw new TypeError("Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: " + f + "). Use function fraction(x) to convert to Fraction.");
    return c;
  } }, { from: "string", to: "number", convert: function(f) {
    var c = Number(f);
    if (isNaN(c)) throw new Error('Cannot convert "' + f + '" to a number');
    return c;
  } }, { from: "string", to: "BigNumber", convert: function(f) {
    t || ot(f);
    try {
      return new t(f);
    } catch {
      throw new Error('Cannot convert "' + f + '" to BigNumber');
    }
  } }, { from: "string", to: "bigint", convert: function(f) {
    try {
      return BigInt(f);
    } catch {
      throw new Error('Cannot convert "' + f + '" to BigInt');
    }
  } }, { from: "string", to: "Fraction", convert: function(f) {
    u || ft(f);
    try {
      return new u(f);
    } catch {
      throw new Error('Cannot convert "' + f + '" to Fraction');
    }
  } }, { from: "string", to: "Complex", convert: function(f) {
    n || st(f);
    try {
      return new n(f);
    } catch {
      throw new Error('Cannot convert "' + f + '" to Complex');
    }
  } }, { from: "boolean", to: "number", convert: function(f) {
    return +f;
  } }, { from: "boolean", to: "BigNumber", convert: function(f) {
    return t || ot(f), new t(+f);
  } }, { from: "boolean", to: "bigint", convert: function(f) {
    return BigInt(+f);
  } }, { from: "boolean", to: "Fraction", convert: function(f) {
    return u || ft(f), new u(+f);
  } }, { from: "boolean", to: "string", convert: function(f) {
    return String(f);
  } }, { from: "Array", to: "Matrix", convert: function(f) {
    return i || Qa(), new i(f);
  } }, { from: "Matrix", to: "Array", convert: function(f) {
    return f.valueOf();
  } }]), a.onMismatch = (o, f, c) => {
    var s = a.createError(o, f, c);
    if (["wrongType", "mismatch"].includes(s.data.category) && f.length === 1 && He(f[0]) && c.some((v) => !v.params.includes(","))) {
      var h = new TypeError("Function '".concat(o, "' doesn't apply to matrices. To call it ") + "elementwise on a matrix 'M', try 'map(M, ".concat(o, ")'."));
      throw h.data = s.data, h;
    }
    throw s;
  }, a.onMismatch = (o, f, c) => {
    var s = a.createError(o, f, c);
    if (["wrongType", "mismatch"].includes(s.data.category) && f.length === 1 && He(f[0]) && c.some((v) => !v.params.includes(","))) {
      var h = new TypeError("Function '".concat(o, "' doesn't apply to matrices. To call it ") + "elementwise on a matrix 'M', try 'map(M, ".concat(o, ")'."));
      throw h.data = s.data, h;
    }
    throw s;
  }, a;
});
function ot(r) {
  throw new Error("Cannot convert value ".concat(r, " into a BigNumber: no class 'BigNumber' provided"));
}
function st(r) {
  throw new Error("Cannot convert value ".concat(r, " into a Complex number: no class 'Complex' provided"));
}
function Qa() {
  throw new Error("Cannot convert array into a Matrix: no class 'DenseMatrix' provided");
}
function ft(r) {
  throw new Error("Cannot convert value ".concat(r, " into a Fraction, no class 'Fraction' provided."));
}
/*!
*  decimal.js v10.6.0
*  An arbitrary-precision Decimal type for JavaScript.
*  https://github.com/MikeMcl/decimal.js
*  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
*  MIT Licence
*/
var qe = 9e15, Ce = 1e9, Wt = "0123456789abcdef", pt = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", dt = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", Jt = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -qe, maxE: qe, crypto: false }, Pi, me, dr = true, Mt = "[DecimalError] ", Ee = Mt + "Invalid argument: ", qi = Mt + "Precision limit exceeded", Ri = Mt + "crypto unavailable", Ui = "[object Decimal]", Gr = Math.floor, Lr = Math.pow, Xa = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, Ga = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, Ka = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, Li = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, le = 1e7, vr = 7, Ha = 9007199254740991, ka = pt.length - 1, Yt = dt.length - 1, V = { toStringTag: Ui };
V.absoluteValue = V.abs = function() {
  var r = new this.constructor(this);
  return r.s < 0 && (r.s = 1), lr(r);
};
V.ceil = function() {
  return lr(new this.constructor(this), this.e + 1, 2);
};
V.clampedTo = V.clamp = function(r, e) {
  var t, n = this, i = n.constructor;
  if (r = new i(r), e = new i(e), !r.s || !e.s) return new i(NaN);
  if (r.gt(e)) throw Error(Ee + e);
  return t = n.cmp(r), t < 0 ? r : n.cmp(e) > 0 ? e : new i(n);
};
V.comparedTo = V.cmp = function(r) {
  var e, t, n, i, u = this, a = u.d, o = (r = new u.constructor(r)).d, f = u.s, c = r.s;
  if (!a || !o) return !f || !c ? NaN : f !== c ? f : a === o ? 0 : !a ^ f < 0 ? 1 : -1;
  if (!a[0] || !o[0]) return a[0] ? f : o[0] ? -c : 0;
  if (f !== c) return f;
  if (u.e !== r.e) return u.e > r.e ^ f < 0 ? 1 : -1;
  for (n = a.length, i = o.length, e = 0, t = n < i ? n : i; e < t; ++e) if (a[e] !== o[e]) return a[e] > o[e] ^ f < 0 ? 1 : -1;
  return n === i ? 0 : n > i ^ f < 0 ? 1 : -1;
};
V.cosine = V.cos = function() {
  var r, e, t = this, n = t.constructor;
  return t.d ? t.d[0] ? (r = n.precision, e = n.rounding, n.precision = r + Math.max(t.e, t.sd()) + vr, n.rounding = 1, t = ja(n, Yi(n, t)), n.precision = r, n.rounding = e, lr(me == 2 || me == 3 ? t.neg() : t, r, e, true)) : new n(1) : new n(NaN);
};
V.cubeRoot = V.cbrt = function() {
  var r, e, t, n, i, u, a, o, f, c, s = this, h = s.constructor;
  if (!s.isFinite() || s.isZero()) return new h(s);
  for (dr = false, u = s.s * Lr(s.s * s, 1 / 3), !u || Math.abs(u) == 1 / 0 ? (t = Jr(s.d), r = s.e, (u = (r - t.length + 1) % 3) && (t += u == 1 || u == -2 ? "0" : "00"), u = Lr(t, 1 / 3), r = Gr((r + 1) / 3) - (r % 3 == (r < 0 ? -1 : 2)), u == 1 / 0 ? t = "5e" + r : (t = u.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + r), n = new h(t), n.s = s.s) : n = new h(u.toString()), a = (r = h.precision) + 3; ; ) if (o = n, f = o.times(o).times(o), c = f.plus(s), n = Tr(c.plus(s).times(o), c.plus(f), a + 2, 1), Jr(o.d).slice(0, a) === (t = Jr(n.d)).slice(0, a)) if (t = t.slice(a - 3, a + 1), t == "9999" || !i && t == "4999") {
    if (!i && (lr(o, r + 1, 0), o.times(o).times(o).eq(s))) {
      n = o;
      break;
    }
    a += 4, i = 1;
  } else {
    (!+t || !+t.slice(1) && t.charAt(0) == "5") && (lr(n, r + 1, 1), e = !n.times(n).times(n).eq(s));
    break;
  }
  return dr = true, lr(n, r, h.rounding, e);
};
V.decimalPlaces = V.dp = function() {
  var r, e = this.d, t = NaN;
  if (e) {
    if (r = e.length - 1, t = (r - Gr(this.e / vr)) * vr, r = e[r], r) for (; r % 10 == 0; r /= 10) t--;
    t < 0 && (t = 0);
  }
  return t;
};
V.dividedBy = V.div = function(r) {
  return Tr(this, new this.constructor(r));
};
V.dividedToIntegerBy = V.divToInt = function(r) {
  var e = this, t = e.constructor;
  return lr(Tr(e, new t(r), 0, 1, 1), t.precision, t.rounding);
};
V.equals = V.eq = function(r) {
  return this.cmp(r) === 0;
};
V.floor = function() {
  return lr(new this.constructor(this), this.e + 1, 3);
};
V.greaterThan = V.gt = function(r) {
  return this.cmp(r) > 0;
};
V.greaterThanOrEqualTo = V.gte = function(r) {
  var e = this.cmp(r);
  return e == 1 || e === 0;
};
V.hyperbolicCosine = V.cosh = function() {
  var r, e, t, n, i, u = this, a = u.constructor, o = new a(1);
  if (!u.isFinite()) return new a(u.s ? 1 / 0 : NaN);
  if (u.isZero()) return o;
  t = a.precision, n = a.rounding, a.precision = t + Math.max(u.e, u.sd()) + 4, a.rounding = 1, i = u.d.length, i < 32 ? (r = Math.ceil(i / 3), e = (1 / Nt(4, r)).toString()) : (r = 16, e = "2.3283064365386962890625e-10"), u = Ze(a, 1, u.times(e), new a(1), true);
  for (var f, c = r, s = new a(8); c--; ) f = u.times(u), u = o.minus(f.times(s.minus(f.times(s))));
  return lr(u, a.precision = t, a.rounding = n, true);
};
V.hyperbolicSine = V.sinh = function() {
  var r, e, t, n, i = this, u = i.constructor;
  if (!i.isFinite() || i.isZero()) return new u(i);
  if (e = u.precision, t = u.rounding, u.precision = e + Math.max(i.e, i.sd()) + 4, u.rounding = 1, n = i.d.length, n < 3) i = Ze(u, 2, i, i, true);
  else {
    r = 1.4 * Math.sqrt(n), r = r > 16 ? 16 : r | 0, i = i.times(1 / Nt(5, r)), i = Ze(u, 2, i, i, true);
    for (var a, o = new u(5), f = new u(16), c = new u(20); r--; ) a = i.times(i), i = i.times(o.plus(a.times(f.times(a).plus(c))));
  }
  return u.precision = e, u.rounding = t, lr(i, e, t, true);
};
V.hyperbolicTangent = V.tanh = function() {
  var r, e, t = this, n = t.constructor;
  return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 7, n.rounding = 1, Tr(t.sinh(), t.cosh(), n.precision = r, n.rounding = e)) : new n(t.s);
};
V.inverseCosine = V.acos = function() {
  var r = this, e = r.constructor, t = r.abs().cmp(1), n = e.precision, i = e.rounding;
  return t !== -1 ? t === 0 ? r.isNeg() ? he(e, n, i) : new e(0) : new e(NaN) : r.isZero() ? he(e, n + 4, i).times(0.5) : (e.precision = n + 6, e.rounding = 1, r = new e(1).minus(r).div(r.plus(1)).sqrt().atan(), e.precision = n, e.rounding = i, r.times(2));
};
V.inverseHyperbolicCosine = V.acosh = function() {
  var r, e, t = this, n = t.constructor;
  return t.lte(1) ? new n(t.eq(1) ? 0 : NaN) : t.isFinite() ? (r = n.precision, e = n.rounding, n.precision = r + Math.max(Math.abs(t.e), t.sd()) + 4, n.rounding = 1, dr = false, t = t.times(t).minus(1).sqrt().plus(t), dr = true, n.precision = r, n.rounding = e, t.ln()) : new n(t);
};
V.inverseHyperbolicSine = V.asinh = function() {
  var r, e, t = this, n = t.constructor;
  return !t.isFinite() || t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 2 * Math.max(Math.abs(t.e), t.sd()) + 6, n.rounding = 1, dr = false, t = t.times(t).plus(1).sqrt().plus(t), dr = true, n.precision = r, n.rounding = e, t.ln());
};
V.inverseHyperbolicTangent = V.atanh = function() {
  var r, e, t, n, i = this, u = i.constructor;
  return i.isFinite() ? i.e >= 0 ? new u(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (r = u.precision, e = u.rounding, n = i.sd(), Math.max(n, r) < 2 * -i.e - 1 ? lr(new u(i), r, e, true) : (u.precision = t = n - i.e, i = Tr(i.plus(1), new u(1).minus(i), t + r, 1), u.precision = r + 4, u.rounding = 1, i = i.ln(), u.precision = r, u.rounding = e, i.times(0.5))) : new u(NaN);
};
V.inverseSine = V.asin = function() {
  var r, e, t, n, i = this, u = i.constructor;
  return i.isZero() ? new u(i) : (e = i.abs().cmp(1), t = u.precision, n = u.rounding, e !== -1 ? e === 0 ? (r = he(u, t + 4, n).times(0.5), r.s = i.s, r) : new u(NaN) : (u.precision = t + 6, u.rounding = 1, i = i.div(new u(1).minus(i.times(i)).sqrt().plus(1)).atan(), u.precision = t, u.rounding = n, i.times(2)));
};
V.inverseTangent = V.atan = function() {
  var r, e, t, n, i, u, a, o, f, c = this, s = c.constructor, h = s.precision, v = s.rounding;
  if (c.isFinite()) {
    if (c.isZero()) return new s(c);
    if (c.abs().eq(1) && h + 4 <= Yt) return a = he(s, h + 4, v).times(0.25), a.s = c.s, a;
  } else {
    if (!c.s) return new s(NaN);
    if (h + 4 <= Yt) return a = he(s, h + 4, v).times(0.5), a.s = c.s, a;
  }
  for (s.precision = o = h + 10, s.rounding = 1, t = Math.min(28, o / vr + 2 | 0), r = t; r; --r) c = c.div(c.times(c).plus(1).sqrt().plus(1));
  for (dr = false, e = Math.ceil(o / vr), n = 1, f = c.times(c), a = new s(c), i = c; r !== -1; ) if (i = i.times(f), u = a.minus(i.div(n += 2)), i = i.times(f), a = u.plus(i.div(n += 2)), a.d[e] !== void 0) for (r = e; a.d[r] === u.d[r] && r--; ) ;
  return t && (a = a.times(2 << t - 1)), dr = true, lr(a, s.precision = h, s.rounding = v, true);
};
V.isFinite = function() {
  return !!this.d;
};
V.isInteger = V.isInt = function() {
  return !!this.d && Gr(this.e / vr) > this.d.length - 2;
};
V.isNaN = function() {
  return !this.s;
};
V.isNegative = V.isNeg = function() {
  return this.s < 0;
};
V.isPositive = V.isPos = function() {
  return this.s > 0;
};
V.isZero = function() {
  return !!this.d && this.d[0] === 0;
};
V.lessThan = V.lt = function(r) {
  return this.cmp(r) < 0;
};
V.lessThanOrEqualTo = V.lte = function(r) {
  return this.cmp(r) < 1;
};
V.logarithm = V.log = function(r) {
  var e, t, n, i, u, a, o, f, c = this, s = c.constructor, h = s.precision, v = s.rounding, p = 5;
  if (r == null) r = new s(10), e = true;
  else {
    if (r = new s(r), t = r.d, r.s < 0 || !t || !t[0] || r.eq(1)) return new s(NaN);
    e = r.eq(10);
  }
  if (t = c.d, c.s < 0 || !t || !t[0] || c.eq(1)) return new s(t && !t[0] ? -1 / 0 : c.s != 1 ? NaN : t ? 0 : 1 / 0);
  if (e) if (t.length > 1) u = true;
  else {
    for (i = t[0]; i % 10 === 0; ) i /= 10;
    u = i !== 1;
  }
  if (dr = false, o = h + p, a = Ae(c, o), n = e ? mt(s, o + 10) : Ae(r, o), f = Tr(a, n, o, 1), je(f.d, i = h, v)) do
    if (o += 10, a = Ae(c, o), n = e ? mt(s, o + 10) : Ae(r, o), f = Tr(a, n, o, 1), !u) {
      +Jr(f.d).slice(i + 1, i + 15) + 1 == 1e14 && (f = lr(f, h + 1, 0));
      break;
    }
  while (je(f.d, i += 10, v));
  return dr = true, lr(f, h, v);
};
V.minus = V.sub = function(r) {
  var e, t, n, i, u, a, o, f, c, s, h, v, p = this, d = p.constructor;
  if (r = new d(r), !p.d || !r.d) return !p.s || !r.s ? r = new d(NaN) : p.d ? r.s = -r.s : r = new d(r.d || p.s !== r.s ? p : NaN), r;
  if (p.s != r.s) return r.s = -r.s, p.plus(r);
  if (c = p.d, v = r.d, o = d.precision, f = d.rounding, !c[0] || !v[0]) {
    if (v[0]) r.s = -r.s;
    else if (c[0]) r = new d(p);
    else return new d(f === 3 ? -0 : 0);
    return dr ? lr(r, o, f) : r;
  }
  if (t = Gr(r.e / vr), s = Gr(p.e / vr), c = c.slice(), u = s - t, u) {
    for (h = u < 0, h ? (e = c, u = -u, a = v.length) : (e = v, t = s, a = c.length), n = Math.max(Math.ceil(o / vr), a) + 2, u > n && (u = n, e.length = 1), e.reverse(), n = u; n--; ) e.push(0);
    e.reverse();
  } else {
    for (n = c.length, a = v.length, h = n < a, h && (a = n), n = 0; n < a; n++) if (c[n] != v[n]) {
      h = c[n] < v[n];
      break;
    }
    u = 0;
  }
  for (h && (e = c, c = v, v = e, r.s = -r.s), a = c.length, n = v.length - a; n > 0; --n) c[a++] = 0;
  for (n = v.length; n > u; ) {
    if (c[--n] < v[n]) {
      for (i = n; i && c[--i] === 0; ) c[i] = le - 1;
      --c[i], c[n] += le;
    }
    c[n] -= v[n];
  }
  for (; c[--a] === 0; ) c.pop();
  for (; c[0] === 0; c.shift()) --t;
  return c[0] ? (r.d = c, r.e = St(c, t), dr ? lr(r, o, f) : r) : new d(f === 3 ? -0 : 0);
};
V.modulo = V.mod = function(r) {
  var e, t = this, n = t.constructor;
  return r = new n(r), !t.d || !r.s || r.d && !r.d[0] ? new n(NaN) : !r.d || t.d && !t.d[0] ? lr(new n(t), n.precision, n.rounding) : (dr = false, n.modulo == 9 ? (e = Tr(t, r.abs(), 0, 3, 1), e.s *= r.s) : e = Tr(t, r, 0, n.modulo, 1), e = e.times(r), dr = true, t.minus(e));
};
V.naturalExponential = V.exp = function() {
  return Qt(this);
};
V.naturalLogarithm = V.ln = function() {
  return Ae(this);
};
V.negated = V.neg = function() {
  var r = new this.constructor(this);
  return r.s = -r.s, lr(r);
};
V.plus = V.add = function(r) {
  var e, t, n, i, u, a, o, f, c, s, h = this, v = h.constructor;
  if (r = new v(r), !h.d || !r.d) return !h.s || !r.s ? r = new v(NaN) : h.d || (r = new v(r.d || h.s === r.s ? h : NaN)), r;
  if (h.s != r.s) return r.s = -r.s, h.minus(r);
  if (c = h.d, s = r.d, o = v.precision, f = v.rounding, !c[0] || !s[0]) return s[0] || (r = new v(h)), dr ? lr(r, o, f) : r;
  if (u = Gr(h.e / vr), n = Gr(r.e / vr), c = c.slice(), i = u - n, i) {
    for (i < 0 ? (t = c, i = -i, a = s.length) : (t = s, n = u, a = c.length), u = Math.ceil(o / vr), a = u > a ? u + 1 : a + 1, i > a && (i = a, t.length = 1), t.reverse(); i--; ) t.push(0);
    t.reverse();
  }
  for (a = c.length, i = s.length, a - i < 0 && (i = a, t = s, s = c, c = t), e = 0; i; ) e = (c[--i] = c[i] + s[i] + e) / le | 0, c[i] %= le;
  for (e && (c.unshift(e), ++n), a = c.length; c[--a] == 0; ) c.pop();
  return r.d = c, r.e = St(c, n), dr ? lr(r, o, f) : r;
};
V.precision = V.sd = function(r) {
  var e, t = this;
  if (r !== void 0 && r !== !!r && r !== 1 && r !== 0) throw Error(Ee + r);
  return t.d ? (e = Zi(t.d), r && t.e + 1 > e && (e = t.e + 1)) : e = NaN, e;
};
V.round = function() {
  var r = this, e = r.constructor;
  return lr(new e(r), r.e + 1, e.rounding);
};
V.sine = V.sin = function() {
  var r, e, t = this, n = t.constructor;
  return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + Math.max(t.e, t.sd()) + vr, n.rounding = 1, t = eo(n, Yi(n, t)), n.precision = r, n.rounding = e, lr(me > 2 ? t.neg() : t, r, e, true)) : new n(NaN);
};
V.squareRoot = V.sqrt = function() {
  var r, e, t, n, i, u, a = this, o = a.d, f = a.e, c = a.s, s = a.constructor;
  if (c !== 1 || !o || !o[0]) return new s(!c || c < 0 && (!o || o[0]) ? NaN : o ? a : 1 / 0);
  for (dr = false, c = Math.sqrt(+a), c == 0 || c == 1 / 0 ? (e = Jr(o), (e.length + f) % 2 == 0 && (e += "0"), c = Math.sqrt(e), f = Gr((f + 1) / 2) - (f < 0 || f % 2), c == 1 / 0 ? e = "5e" + f : (e = c.toExponential(), e = e.slice(0, e.indexOf("e") + 1) + f), n = new s(e)) : n = new s(c.toString()), t = (f = s.precision) + 3; ; ) if (u = n, n = u.plus(Tr(a, u, t + 2, 1)).times(0.5), Jr(u.d).slice(0, t) === (e = Jr(n.d)).slice(0, t)) if (e = e.slice(t - 3, t + 1), e == "9999" || !i && e == "4999") {
    if (!i && (lr(u, f + 1, 0), u.times(u).eq(a))) {
      n = u;
      break;
    }
    t += 4, i = 1;
  } else {
    (!+e || !+e.slice(1) && e.charAt(0) == "5") && (lr(n, f + 1, 1), r = !n.times(n).eq(a));
    break;
  }
  return dr = true, lr(n, f, s.rounding, r);
};
V.tangent = V.tan = function() {
  var r, e, t = this, n = t.constructor;
  return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 10, n.rounding = 1, t = t.sin(), t.s = 1, t = Tr(t, new n(1).minus(t.times(t)).sqrt(), r + 10, 0), n.precision = r, n.rounding = e, lr(me == 2 || me == 4 ? t.neg() : t, r, e, true)) : new n(NaN);
};
V.times = V.mul = function(r) {
  var e, t, n, i, u, a, o, f, c, s = this, h = s.constructor, v = s.d, p = (r = new h(r)).d;
  if (r.s *= s.s, !v || !v[0] || !p || !p[0]) return new h(!r.s || v && !v[0] && !p || p && !p[0] && !v ? NaN : !v || !p ? r.s / 0 : r.s * 0);
  for (t = Gr(s.e / vr) + Gr(r.e / vr), f = v.length, c = p.length, f < c && (u = v, v = p, p = u, a = f, f = c, c = a), u = [], a = f + c, n = a; n--; ) u.push(0);
  for (n = c; --n >= 0; ) {
    for (e = 0, i = f + n; i > n; ) o = u[i] + p[n] * v[i - n - 1] + e, u[i--] = o % le | 0, e = o / le | 0;
    u[i] = (u[i] + e) % le | 0;
  }
  for (; !u[--a]; ) u.pop();
  return e ? ++t : u.shift(), r.d = u, r.e = St(u, t), dr ? lr(r, h.precision, h.rounding) : r;
};
V.toBinary = function(r, e) {
  return tn(this, 2, r, e);
};
V.toDecimalPlaces = V.toDP = function(r, e) {
  var t = this, n = t.constructor;
  return t = new n(t), r === void 0 ? t : (re(r, 0, Ce), e === void 0 ? e = n.rounding : re(e, 0, 8), lr(t, r + t.e + 1, e));
};
V.toExponential = function(r, e) {
  var t, n = this, i = n.constructor;
  return r === void 0 ? t = ve(n, true) : (re(r, 0, Ce), e === void 0 ? e = i.rounding : re(e, 0, 8), n = lr(new i(n), r + 1, e), t = ve(n, true, r + 1)), n.isNeg() && !n.isZero() ? "-" + t : t;
};
V.toFixed = function(r, e) {
  var t, n, i = this, u = i.constructor;
  return r === void 0 ? t = ve(i) : (re(r, 0, Ce), e === void 0 ? e = u.rounding : re(e, 0, 8), n = lr(new u(i), r + i.e + 1, e), t = ve(n, false, r + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + t : t;
};
V.toFraction = function(r) {
  var e, t, n, i, u, a, o, f, c, s, h, v, p = this, d = p.d, l = p.constructor;
  if (!d) return new l(p);
  if (c = t = new l(1), n = f = new l(0), e = new l(n), u = e.e = Zi(d) - p.e - 1, a = u % vr, e.d[0] = Lr(10, a < 0 ? vr + a : a), r == null) r = u > 0 ? e : c;
  else {
    if (o = new l(r), !o.isInt() || o.lt(c)) throw Error(Ee + o);
    r = o.gt(e) ? u > 0 ? e : c : o;
  }
  for (dr = false, o = new l(Jr(d)), s = l.precision, l.precision = u = d.length * vr * 2; h = Tr(o, e, 0, 1, 1), i = t.plus(h.times(n)), i.cmp(r) != 1; ) t = n, n = i, i = c, c = f.plus(h.times(i)), f = i, i = e, e = o.minus(h.times(i)), o = i;
  return i = Tr(r.minus(t), n, 0, 1, 1), f = f.plus(i.times(c)), t = t.plus(i.times(n)), f.s = c.s = p.s, v = Tr(c, n, u, 1).minus(p).abs().cmp(Tr(f, t, u, 1).minus(p).abs()) < 1 ? [c, n] : [f, t], l.precision = s, dr = true, v;
};
V.toHexadecimal = V.toHex = function(r, e) {
  return tn(this, 16, r, e);
};
V.toNearest = function(r, e) {
  var t = this, n = t.constructor;
  if (t = new n(t), r == null) {
    if (!t.d) return t;
    r = new n(1), e = n.rounding;
  } else {
    if (r = new n(r), e === void 0 ? e = n.rounding : re(e, 0, 8), !t.d) return r.s ? t : r;
    if (!r.d) return r.s && (r.s = t.s), r;
  }
  return r.d[0] ? (dr = false, t = Tr(t, r, 0, e, 1).times(r), dr = true, lr(t)) : (r.s = t.s, t = r), t;
};
V.toNumber = function() {
  return +this;
};
V.toOctal = function(r, e) {
  return tn(this, 8, r, e);
};
V.toPower = V.pow = function(r) {
  var e, t, n, i, u, a, o = this, f = o.constructor, c = +(r = new f(r));
  if (!o.d || !r.d || !o.d[0] || !r.d[0]) return new f(Lr(+o, c));
  if (o = new f(o), o.eq(1)) return o;
  if (n = f.precision, u = f.rounding, r.eq(1)) return lr(o, n, u);
  if (e = Gr(r.e / vr), e >= r.d.length - 1 && (t = c < 0 ? -c : c) <= Ha) return i = Vi(f, o, t, n), r.s < 0 ? new f(1).div(i) : lr(i, n, u);
  if (a = o.s, a < 0) {
    if (e < r.d.length - 1) return new f(NaN);
    if (r.d[e] & 1 || (a = 1), o.e == 0 && o.d[0] == 1 && o.d.length == 1) return o.s = a, o;
  }
  return t = Lr(+o, c), e = t == 0 || !isFinite(t) ? Gr(c * (Math.log("0." + Jr(o.d)) / Math.LN10 + o.e + 1)) : new f(t + "").e, e > f.maxE + 1 || e < f.minE - 1 ? new f(e > 0 ? a / 0 : 0) : (dr = false, f.rounding = o.s = 1, t = Math.min(12, (e + "").length), i = Qt(r.times(Ae(o, n + t)), n), i.d && (i = lr(i, n + 5, 1), je(i.d, n, u) && (e = n + 10, i = lr(Qt(r.times(Ae(o, e + t)), e), e + 5, 1), +Jr(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = lr(i, n + 1, 0)))), i.s = a, dr = true, f.rounding = u, lr(i, n, u));
};
V.toPrecision = function(r, e) {
  var t, n = this, i = n.constructor;
  return r === void 0 ? t = ve(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (re(r, 1, Ce), e === void 0 ? e = i.rounding : re(e, 0, 8), n = lr(new i(n), r, e), t = ve(n, r <= n.e || n.e <= i.toExpNeg, r)), n.isNeg() && !n.isZero() ? "-" + t : t;
};
V.toSignificantDigits = V.toSD = function(r, e) {
  var t = this, n = t.constructor;
  return r === void 0 ? (r = n.precision, e = n.rounding) : (re(r, 1, Ce), e === void 0 ? e = n.rounding : re(e, 0, 8)), lr(new n(t), r, e);
};
V.toString = function() {
  var r = this, e = r.constructor, t = ve(r, r.e <= e.toExpNeg || r.e >= e.toExpPos);
  return r.isNeg() && !r.isZero() ? "-" + t : t;
};
V.truncated = V.trunc = function() {
  return lr(new this.constructor(this), this.e + 1, 1);
};
V.valueOf = V.toJSON = function() {
  var r = this, e = r.constructor, t = ve(r, r.e <= e.toExpNeg || r.e >= e.toExpPos);
  return r.isNeg() ? "-" + t : t;
};
function Jr(r) {
  var e, t, n, i = r.length - 1, u = "", a = r[0];
  if (i > 0) {
    for (u += a, e = 1; e < i; e++) n = r[e] + "", t = vr - n.length, t && (u += we(t)), u += n;
    a = r[e], n = a + "", t = vr - n.length, t && (u += we(t));
  } else if (a === 0) return "0";
  for (; a % 10 === 0; ) a /= 10;
  return u + a;
}
function re(r, e, t) {
  if (r !== ~~r || r < e || r > t) throw Error(Ee + r);
}
function je(r, e, t, n) {
  var i, u, a, o;
  for (u = r[0]; u >= 10; u /= 10) --e;
  return --e < 0 ? (e += vr, i = 0) : (i = Math.ceil((e + 1) / vr), e %= vr), u = Lr(10, vr - e), o = r[i] % u | 0, n == null ? e < 3 ? (e == 0 ? o = o / 100 | 0 : e == 1 && (o = o / 10 | 0), a = t < 4 && o == 99999 || t > 3 && o == 49999 || o == 5e4 || o == 0) : a = (t < 4 && o + 1 == u || t > 3 && o + 1 == u / 2) && (r[i + 1] / u / 100 | 0) == Lr(10, e - 2) - 1 || (o == u / 2 || o == 0) && (r[i + 1] / u / 100 | 0) == 0 : e < 4 ? (e == 0 ? o = o / 1e3 | 0 : e == 1 ? o = o / 100 | 0 : e == 2 && (o = o / 10 | 0), a = (n || t < 4) && o == 9999 || !n && t > 3 && o == 4999) : a = ((n || t < 4) && o + 1 == u || !n && t > 3 && o + 1 == u / 2) && (r[i + 1] / u / 1e3 | 0) == Lr(10, e - 3) - 1, a;
}
function ct(r, e, t) {
  for (var n, i = [0], u, a = 0, o = r.length; a < o; ) {
    for (u = i.length; u--; ) i[u] *= e;
    for (i[0] += Wt.indexOf(r.charAt(a++)), n = 0; n < i.length; n++) i[n] > t - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / t | 0, i[n] %= t);
  }
  return i.reverse();
}
function ja(r, e) {
  var t, n, i;
  if (e.isZero()) return e;
  n = e.d.length, n < 32 ? (t = Math.ceil(n / 3), i = (1 / Nt(4, t)).toString()) : (t = 16, i = "2.3283064365386962890625e-10"), r.precision += t, e = Ze(r, 1, e.times(i), new r(1));
  for (var u = t; u--; ) {
    var a = e.times(e);
    e = a.times(a).minus(a).times(8).plus(1);
  }
  return r.precision -= t, e;
}
var Tr = /* @__PURE__ */ function() {
  function r(n, i, u) {
    var a, o = 0, f = n.length;
    for (n = n.slice(); f--; ) a = n[f] * i + o, n[f] = a % u | 0, o = a / u | 0;
    return o && n.unshift(o), n;
  }
  function e(n, i, u, a) {
    var o, f;
    if (u != a) f = u > a ? 1 : -1;
    else for (o = f = 0; o < u; o++) if (n[o] != i[o]) {
      f = n[o] > i[o] ? 1 : -1;
      break;
    }
    return f;
  }
  function t(n, i, u, a) {
    for (var o = 0; u--; ) n[u] -= o, o = n[u] < i[u] ? 1 : 0, n[u] = o * a + n[u] - i[u];
    for (; !n[0] && n.length > 1; ) n.shift();
  }
  return function(n, i, u, a, o, f) {
    var c, s, h, v, p, d, l, D, g, E, m, C, A, w, _, F, y, M, B, S, O = n.constructor, x = n.s == i.s ? 1 : -1, $ = n.d, T = i.d;
    if (!$ || !$[0] || !T || !T[0]) return new O(!n.s || !i.s || ($ ? T && $[0] == T[0] : !T) ? NaN : $ && $[0] == 0 || !T ? x * 0 : x / 0);
    for (f ? (p = 1, s = n.e - i.e) : (f = le, p = vr, s = Gr(n.e / p) - Gr(i.e / p)), B = T.length, y = $.length, g = new O(x), E = g.d = [], h = 0; T[h] == ($[h] || 0); h++) ;
    if (T[h] > ($[h] || 0) && s--, u == null ? (w = u = O.precision, a = O.rounding) : o ? w = u + (n.e - i.e) + 1 : w = u, w < 0) E.push(1), d = true;
    else {
      if (w = w / p + 2 | 0, h = 0, B == 1) {
        for (v = 0, T = T[0], w++; (h < y || v) && w--; h++) _ = v * f + ($[h] || 0), E[h] = _ / T | 0, v = _ % T | 0;
        d = v || h < y;
      } else {
        for (v = f / (T[0] + 1) | 0, v > 1 && (T = r(T, v, f), $ = r($, v, f), B = T.length, y = $.length), F = B, m = $.slice(0, B), C = m.length; C < B; ) m[C++] = 0;
        S = T.slice(), S.unshift(0), M = T[0], T[1] >= f / 2 && ++M;
        do
          v = 0, c = e(T, m, B, C), c < 0 ? (A = m[0], B != C && (A = A * f + (m[1] || 0)), v = A / M | 0, v > 1 ? (v >= f && (v = f - 1), l = r(T, v, f), D = l.length, C = m.length, c = e(l, m, D, C), c == 1 && (v--, t(l, B < D ? S : T, D, f))) : (v == 0 && (c = v = 1), l = T.slice()), D = l.length, D < C && l.unshift(0), t(m, l, C, f), c == -1 && (C = m.length, c = e(T, m, B, C), c < 1 && (v++, t(m, B < C ? S : T, C, f))), C = m.length) : c === 0 && (v++, m = [0]), E[h++] = v, c && m[0] ? m[C++] = $[F] || 0 : (m = [$[F]], C = 1);
        while ((F++ < y || m[0] !== void 0) && w--);
        d = m[0] !== void 0;
      }
      E[0] || E.shift();
    }
    if (p == 1) g.e = s, Pi = d;
    else {
      for (h = 1, v = E[0]; v >= 10; v /= 10) h++;
      g.e = h + s * p - 1, lr(g, o ? u + g.e + 1 : u, a, d);
    }
    return g;
  };
}();
function lr(r, e, t, n) {
  var i, u, a, o, f, c, s, h, v, p = r.constructor;
  r: if (e != null) {
    if (h = r.d, !h) return r;
    for (i = 1, o = h[0]; o >= 10; o /= 10) i++;
    if (u = e - i, u < 0) u += vr, a = e, s = h[v = 0], f = s / Lr(10, i - a - 1) % 10 | 0;
    else if (v = Math.ceil((u + 1) / vr), o = h.length, v >= o) if (n) {
      for (; o++ <= v; ) h.push(0);
      s = f = 0, i = 1, u %= vr, a = u - vr + 1;
    } else break r;
    else {
      for (s = o = h[v], i = 1; o >= 10; o /= 10) i++;
      u %= vr, a = u - vr + i, f = a < 0 ? 0 : s / Lr(10, i - a - 1) % 10 | 0;
    }
    if (n = n || e < 0 || h[v + 1] !== void 0 || (a < 0 ? s : s % Lr(10, i - a - 1)), c = t < 4 ? (f || n) && (t == 0 || t == (r.s < 0 ? 3 : 2)) : f > 5 || f == 5 && (t == 4 || n || t == 6 && (u > 0 ? a > 0 ? s / Lr(10, i - a) : 0 : h[v - 1]) % 10 & 1 || t == (r.s < 0 ? 8 : 7)), e < 1 || !h[0]) return h.length = 0, c ? (e -= r.e + 1, h[0] = Lr(10, (vr - e % vr) % vr), r.e = -e || 0) : h[0] = r.e = 0, r;
    if (u == 0 ? (h.length = v, o = 1, v--) : (h.length = v + 1, o = Lr(10, vr - u), h[v] = a > 0 ? (s / Lr(10, i - a) % Lr(10, a) | 0) * o : 0), c) for (; ; ) if (v == 0) {
      for (u = 1, a = h[0]; a >= 10; a /= 10) u++;
      for (a = h[0] += o, o = 1; a >= 10; a /= 10) o++;
      u != o && (r.e++, h[0] == le && (h[0] = 1));
      break;
    } else {
      if (h[v] += o, h[v] != le) break;
      h[v--] = 0, o = 1;
    }
    for (u = h.length; h[--u] === 0; ) h.pop();
  }
  return dr && (r.e > p.maxE ? (r.d = null, r.e = NaN) : r.e < p.minE && (r.e = 0, r.d = [0])), r;
}
function ve(r, e, t) {
  if (!r.isFinite()) return Ji(r);
  var n, i = r.e, u = Jr(r.d), a = u.length;
  return e ? (t && (n = t - a) > 0 ? u = u.charAt(0) + "." + u.slice(1) + we(n) : a > 1 && (u = u.charAt(0) + "." + u.slice(1)), u = u + (r.e < 0 ? "e" : "e+") + r.e) : i < 0 ? (u = "0." + we(-i - 1) + u, t && (n = t - a) > 0 && (u += we(n))) : i >= a ? (u += we(i + 1 - a), t && (n = t - i - 1) > 0 && (u = u + "." + we(n))) : ((n = i + 1) < a && (u = u.slice(0, n) + "." + u.slice(n)), t && (n = t - a) > 0 && (i + 1 === a && (u += "."), u += we(n))), u;
}
function St(r, e) {
  var t = r[0];
  for (e *= vr; t >= 10; t /= 10) e++;
  return e;
}
function mt(r, e, t) {
  if (e > ka) throw dr = true, t && (r.precision = t), Error(qi);
  return lr(new r(pt), e, 1, true);
}
function he(r, e, t) {
  if (e > Yt) throw Error(qi);
  return lr(new r(dt), e, t, true);
}
function Zi(r) {
  var e = r.length - 1, t = e * vr + 1;
  if (e = r[e], e) {
    for (; e % 10 == 0; e /= 10) t--;
    for (e = r[0]; e >= 10; e /= 10) t++;
  }
  return t;
}
function we(r) {
  for (var e = ""; r--; ) e += "0";
  return e;
}
function Vi(r, e, t, n) {
  var i, u = new r(1), a = Math.ceil(n / vr + 4);
  for (dr = false; ; ) {
    if (t % 2 && (u = u.times(e), _n(u.d, a) && (i = true)), t = Gr(t / 2), t === 0) {
      t = u.d.length - 1, i && u.d[t] === 0 && ++u.d[t];
      break;
    }
    e = e.times(e), _n(e.d, a);
  }
  return dr = true, u;
}
function bn(r) {
  return r.d[r.d.length - 1] & 1;
}
function Wi(r, e, t) {
  for (var n, i, u = new r(e[0]), a = 0; ++a < e.length; ) {
    if (i = new r(e[a]), !i.s) {
      u = i;
      break;
    }
    n = u.cmp(i), (n === t || n === 0 && u.s === t) && (u = i);
  }
  return u;
}
function Qt(r, e) {
  var t, n, i, u, a, o, f, c = 0, s = 0, h = 0, v = r.constructor, p = v.rounding, d = v.precision;
  if (!r.d || !r.d[0] || r.e > 17) return new v(r.d ? r.d[0] ? r.s < 0 ? 0 : 1 / 0 : 1 : r.s ? r.s < 0 ? 0 : r : NaN);
  for (e == null ? (dr = false, f = d) : f = e, o = new v(0.03125); r.e > -2; ) r = r.times(o), h += 5;
  for (n = Math.log(Lr(2, h)) / Math.LN10 * 2 + 5 | 0, f += n, t = u = a = new v(1), v.precision = f; ; ) {
    if (u = lr(u.times(r), f, 1), t = t.times(++s), o = a.plus(Tr(u, t, f, 1)), Jr(o.d).slice(0, f) === Jr(a.d).slice(0, f)) {
      for (i = h; i--; ) a = lr(a.times(a), f, 1);
      if (e == null) if (c < 3 && je(a.d, f - n, p, c)) v.precision = f += 10, t = u = o = new v(1), s = 0, c++;
      else return lr(a, v.precision = d, p, dr = true);
      else return v.precision = d, a;
    }
    a = o;
  }
}
function Ae(r, e) {
  var t, n, i, u, a, o, f, c, s, h, v, p = 1, d = 10, l = r, D = l.d, g = l.constructor, E = g.rounding, m = g.precision;
  if (l.s < 0 || !D || !D[0] || !l.e && D[0] == 1 && D.length == 1) return new g(D && !D[0] ? -1 / 0 : l.s != 1 ? NaN : D ? 0 : l);
  if (e == null ? (dr = false, s = m) : s = e, g.precision = s += d, t = Jr(D), n = t.charAt(0), Math.abs(u = l.e) < 15e14) {
    for (; n < 7 && n != 1 || n == 1 && t.charAt(1) > 3; ) l = l.times(r), t = Jr(l.d), n = t.charAt(0), p++;
    u = l.e, n > 1 ? (l = new g("0." + t), u++) : l = new g(n + "." + t.slice(1));
  } else return c = mt(g, s + 2, m).times(u + ""), l = Ae(new g(n + "." + t.slice(1)), s - d).plus(c), g.precision = m, e == null ? lr(l, m, E, dr = true) : l;
  for (h = l, f = a = l = Tr(l.minus(1), l.plus(1), s, 1), v = lr(l.times(l), s, 1), i = 3; ; ) {
    if (a = lr(a.times(v), s, 1), c = f.plus(Tr(a, new g(i), s, 1)), Jr(c.d).slice(0, s) === Jr(f.d).slice(0, s)) if (f = f.times(2), u !== 0 && (f = f.plus(mt(g, s + 2, m).times(u + ""))), f = Tr(f, new g(p), s, 1), e == null) if (je(f.d, s - d, E, o)) g.precision = s += d, c = a = l = Tr(h.minus(1), h.plus(1), s, 1), v = lr(l.times(l), s, 1), i = o = 1;
    else return lr(f, g.precision = m, E, dr = true);
    else return g.precision = m, f;
    f = c, i += 2;
  }
}
function Ji(r) {
  return String(r.s * r.s / 0);
}
function lt(r, e) {
  var t, n, i;
  for ((t = e.indexOf(".")) > -1 && (e = e.replace(".", "")), (n = e.search(/e/i)) > 0 ? (t < 0 && (t = n), t += +e.slice(n + 1), e = e.substring(0, n)) : t < 0 && (t = e.length), n = 0; e.charCodeAt(n) === 48; n++) ;
  for (i = e.length; e.charCodeAt(i - 1) === 48; --i) ;
  if (e = e.slice(n, i), e) {
    if (i -= n, r.e = t = t - n - 1, r.d = [], n = (t + 1) % vr, t < 0 && (n += vr), n < i) {
      for (n && r.d.push(+e.slice(0, n)), i -= vr; n < i; ) r.d.push(+e.slice(n, n += vr));
      e = e.slice(n), n = vr - e.length;
    } else n -= i;
    for (; n--; ) e += "0";
    r.d.push(+e), dr && (r.e > r.constructor.maxE ? (r.d = null, r.e = NaN) : r.e < r.constructor.minE && (r.e = 0, r.d = [0]));
  } else r.e = 0, r.d = [0];
  return r;
}
function ro(r, e) {
  var t, n, i, u, a, o, f, c, s;
  if (e.indexOf("_") > -1) {
    if (e = e.replace(/(\d)_(?=\d)/g, "$1"), Li.test(e)) return lt(r, e);
  } else if (e === "Infinity" || e === "NaN") return +e || (r.s = NaN), r.e = NaN, r.d = null, r;
  if (Ga.test(e)) t = 16, e = e.toLowerCase();
  else if (Xa.test(e)) t = 2;
  else if (Ka.test(e)) t = 8;
  else throw Error(Ee + e);
  for (u = e.search(/p/i), u > 0 ? (f = +e.slice(u + 1), e = e.substring(2, u)) : e = e.slice(2), u = e.indexOf("."), a = u >= 0, n = r.constructor, a && (e = e.replace(".", ""), o = e.length, u = o - u, i = Vi(n, new n(t), u, u * 2)), c = ct(e, t, le), s = c.length - 1, u = s; c[u] === 0; --u) c.pop();
  return u < 0 ? new n(r.s * 0) : (r.e = St(c, s), r.d = c, dr = false, a && (r = Tr(r, i, o * 4)), f && (r = r.times(Math.abs(f) < 54 ? Lr(2, f) : Ve.pow(2, f))), dr = true, r);
}
function eo(r, e) {
  var t, n = e.d.length;
  if (n < 3) return e.isZero() ? e : Ze(r, 2, e, e);
  t = 1.4 * Math.sqrt(n), t = t > 16 ? 16 : t | 0, e = e.times(1 / Nt(5, t)), e = Ze(r, 2, e, e);
  for (var i, u = new r(5), a = new r(16), o = new r(20); t--; ) i = e.times(e), e = e.times(u.plus(i.times(a.times(i).minus(o))));
  return e;
}
function Ze(r, e, t, n, i) {
  var u, a, o, f, c = r.precision, s = Math.ceil(c / vr);
  for (dr = false, f = t.times(t), o = new r(n); ; ) {
    if (a = Tr(o.times(f), new r(e++ * e++), c, 1), o = i ? n.plus(a) : n.minus(a), n = Tr(a.times(f), new r(e++ * e++), c, 1), a = o.plus(n), a.d[s] !== void 0) {
      for (u = s; a.d[u] === o.d[u] && u--; ) ;
      if (u == -1) break;
    }
    u = o, o = n, n = a, a = u;
  }
  return dr = true, a.d.length = s + 1, a;
}
function Nt(r, e) {
  for (var t = r; --e; ) t *= r;
  return t;
}
function Yi(r, e) {
  var t, n = e.s < 0, i = he(r, r.precision, 1), u = i.times(0.5);
  if (e = e.abs(), e.lte(u)) return me = n ? 4 : 1, e;
  if (t = e.divToInt(i), t.isZero()) me = n ? 3 : 2;
  else {
    if (e = e.minus(t.times(i)), e.lte(u)) return me = bn(t) ? n ? 2 : 3 : n ? 4 : 1, e;
    me = bn(t) ? n ? 1 : 4 : n ? 3 : 2;
  }
  return e.minus(i).abs();
}
function tn(r, e, t, n) {
  var i, u, a, o, f, c, s, h, v, p = r.constructor, d = t !== void 0;
  if (d ? (re(t, 1, Ce), n === void 0 ? n = p.rounding : re(n, 0, 8)) : (t = p.precision, n = p.rounding), !r.isFinite()) s = Ji(r);
  else {
    for (s = ve(r), a = s.indexOf("."), d ? (i = 2, e == 16 ? t = t * 4 - 3 : e == 8 && (t = t * 3 - 2)) : i = e, a >= 0 && (s = s.replace(".", ""), v = new p(1), v.e = s.length - a, v.d = ct(ve(v), 10, i), v.e = v.d.length), h = ct(s, 10, i), u = f = h.length; h[--f] == 0; ) h.pop();
    if (!h[0]) s = d ? "0p+0" : "0";
    else {
      if (a < 0 ? u-- : (r = new p(r), r.d = h, r.e = u, r = Tr(r, v, t, n, 0, i), h = r.d, u = r.e, c = Pi), a = h[t], o = i / 2, c = c || h[t + 1] !== void 0, c = n < 4 ? (a !== void 0 || c) && (n === 0 || n === (r.s < 0 ? 3 : 2)) : a > o || a === o && (n === 4 || c || n === 6 && h[t - 1] & 1 || n === (r.s < 0 ? 8 : 7)), h.length = t, c) for (; ++h[--t] > i - 1; ) h[t] = 0, t || (++u, h.unshift(1));
      for (f = h.length; !h[f - 1]; --f) ;
      for (a = 0, s = ""; a < f; a++) s += Wt.charAt(h[a]);
      if (d) {
        if (f > 1) if (e == 16 || e == 8) {
          for (a = e == 16 ? 4 : 3, --f; f % a; f++) s += "0";
          for (h = ct(s, i, e), f = h.length; !h[f - 1]; --f) ;
          for (a = 1, s = "1."; a < f; a++) s += Wt.charAt(h[a]);
        } else s = s.charAt(0) + "." + s.slice(1);
        s = s + (u < 0 ? "p" : "p+") + u;
      } else if (u < 0) {
        for (; ++u; ) s = "0" + s;
        s = "0." + s;
      } else if (++u > f) for (u -= f; u--; ) s += "0";
      else u < f && (s = s.slice(0, u) + "." + s.slice(u));
    }
    s = (e == 16 ? "0x" : e == 2 ? "0b" : e == 8 ? "0o" : "") + s;
  }
  return r.s < 0 ? "-" + s : s;
}
function _n(r, e) {
  if (r.length > e) return r.length = e, true;
}
function to(r) {
  return new this(r).abs();
}
function no(r) {
  return new this(r).acos();
}
function io(r) {
  return new this(r).acosh();
}
function uo(r, e) {
  return new this(r).plus(e);
}
function ao(r) {
  return new this(r).asin();
}
function oo(r) {
  return new this(r).asinh();
}
function so(r) {
  return new this(r).atan();
}
function fo(r) {
  return new this(r).atanh();
}
function co(r, e) {
  r = new this(r), e = new this(e);
  var t, n = this.precision, i = this.rounding, u = n + 4;
  return !r.s || !e.s ? t = new this(NaN) : !r.d && !e.d ? (t = he(this, u, 1).times(e.s > 0 ? 0.25 : 0.75), t.s = r.s) : !e.d || r.isZero() ? (t = e.s < 0 ? he(this, n, i) : new this(0), t.s = r.s) : !r.d || e.isZero() ? (t = he(this, u, 1).times(0.5), t.s = r.s) : e.s < 0 ? (this.precision = u, this.rounding = 1, t = this.atan(Tr(r, e, u, 1)), e = he(this, u, 1), this.precision = n, this.rounding = i, t = r.s < 0 ? t.minus(e) : t.plus(e)) : t = this.atan(Tr(r, e, u, 1)), t;
}
function lo(r) {
  return new this(r).cbrt();
}
function ho(r) {
  return lr(r = new this(r), r.e + 1, 2);
}
function vo(r, e, t) {
  return new this(r).clamp(e, t);
}
function po(r) {
  if (!r || typeof r != "object") throw Error(Mt + "Object expected");
  var e, t, n, i = r.defaults === true, u = ["precision", 1, Ce, "rounding", 0, 8, "toExpNeg", -qe, 0, "toExpPos", 0, qe, "maxE", 0, qe, "minE", -qe, 0, "modulo", 0, 9];
  for (e = 0; e < u.length; e += 3) if (t = u[e], i && (this[t] = Jt[t]), (n = r[t]) !== void 0) if (Gr(n) === n && n >= u[e + 1] && n <= u[e + 2]) this[t] = n;
  else throw Error(Ee + t + ": " + n);
  if (t = "crypto", i && (this[t] = Jt[t]), (n = r[t]) !== void 0) if (n === true || n === false || n === 0 || n === 1) if (n) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[t] = true;
  else throw Error(Ri);
  else this[t] = false;
  else throw Error(Ee + t + ": " + n);
  return this;
}
function mo(r) {
  return new this(r).cos();
}
function Do(r) {
  return new this(r).cosh();
}
function Qi(r) {
  var e, t, n;
  function i(u) {
    var a, o, f, c = this;
    if (!(c instanceof i)) return new i(u);
    if (c.constructor = i, Bn(u)) {
      c.s = u.s, dr ? !u.d || u.e > i.maxE ? (c.e = NaN, c.d = null) : u.e < i.minE ? (c.e = 0, c.d = [0]) : (c.e = u.e, c.d = u.d.slice()) : (c.e = u.e, c.d = u.d ? u.d.slice() : u.d);
      return;
    }
    if (f = typeof u, f === "number") {
      if (u === 0) {
        c.s = 1 / u < 0 ? -1 : 1, c.e = 0, c.d = [0];
        return;
      }
      if (u < 0 ? (u = -u, c.s = -1) : c.s = 1, u === ~~u && u < 1e7) {
        for (a = 0, o = u; o >= 10; o /= 10) a++;
        dr ? a > i.maxE ? (c.e = NaN, c.d = null) : a < i.minE ? (c.e = 0, c.d = [0]) : (c.e = a, c.d = [u]) : (c.e = a, c.d = [u]);
        return;
      }
      if (u * 0 !== 0) {
        u || (c.s = NaN), c.e = NaN, c.d = null;
        return;
      }
      return lt(c, u.toString());
    }
    if (f === "string") return (o = u.charCodeAt(0)) === 45 ? (u = u.slice(1), c.s = -1) : (o === 43 && (u = u.slice(1)), c.s = 1), Li.test(u) ? lt(c, u) : ro(c, u);
    if (f === "bigint") return u < 0 ? (u = -u, c.s = -1) : c.s = 1, lt(c, u.toString());
    throw Error(Ee + u);
  }
  if (i.prototype = V, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = po, i.clone = Qi, i.isDecimal = Bn, i.abs = to, i.acos = no, i.acosh = io, i.add = uo, i.asin = ao, i.asinh = oo, i.atan = so, i.atanh = fo, i.atan2 = co, i.cbrt = lo, i.ceil = ho, i.clamp = vo, i.cos = mo, i.cosh = Do, i.div = go, i.exp = yo, i.floor = wo, i.hypot = Ao, i.ln = Fo, i.log = Eo, i.log10 = bo, i.log2 = Co, i.max = _o, i.min = Bo, i.mod = Mo, i.mul = So, i.pow = No, i.random = xo, i.round = To, i.sign = zo, i.sin = Io, i.sinh = Oo, i.sqrt = $o, i.sub = Po, i.sum = qo, i.tan = Ro, i.tanh = Uo, i.trunc = Lo, r === void 0 && (r = {}), r && r.defaults !== true) for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], e = 0; e < n.length; ) r.hasOwnProperty(t = n[e++]) || (r[t] = this[t]);
  return i.config(r), i;
}
function go(r, e) {
  return new this(r).div(e);
}
function yo(r) {
  return new this(r).exp();
}
function wo(r) {
  return lr(r = new this(r), r.e + 1, 3);
}
function Ao() {
  var r, e, t = new this(0);
  for (dr = false, r = 0; r < arguments.length; ) if (e = new this(arguments[r++]), e.d) t.d && (t = t.plus(e.times(e)));
  else {
    if (e.s) return dr = true, new this(1 / 0);
    t = e;
  }
  return dr = true, t.sqrt();
}
function Bn(r) {
  return r instanceof Ve || r && r.toStringTag === Ui || false;
}
function Fo(r) {
  return new this(r).ln();
}
function Eo(r, e) {
  return new this(r).log(e);
}
function Co(r) {
  return new this(r).log(2);
}
function bo(r) {
  return new this(r).log(10);
}
function _o() {
  return Wi(this, arguments, -1);
}
function Bo() {
  return Wi(this, arguments, 1);
}
function Mo(r, e) {
  return new this(r).mod(e);
}
function So(r, e) {
  return new this(r).mul(e);
}
function No(r, e) {
  return new this(r).pow(e);
}
function xo(r) {
  var e, t, n, i, u = 0, a = new this(1), o = [];
  if (r === void 0 ? r = this.precision : re(r, 1, Ce), n = Math.ceil(r / vr), this.crypto) if (crypto.getRandomValues) for (e = crypto.getRandomValues(new Uint32Array(n)); u < n; ) i = e[u], i >= 429e7 ? e[u] = crypto.getRandomValues(new Uint32Array(1))[0] : o[u++] = i % 1e7;
  else if (crypto.randomBytes) {
    for (e = crypto.randomBytes(n *= 4); u < n; ) i = e[u] + (e[u + 1] << 8) + (e[u + 2] << 16) + ((e[u + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(e, u) : (o.push(i % 1e7), u += 4);
    u = n / 4;
  } else throw Error(Ri);
  else for (; u < n; ) o[u++] = Math.random() * 1e7 | 0;
  for (n = o[--u], r %= vr, n && r && (i = Lr(10, vr - r), o[u] = (n / i | 0) * i); o[u] === 0; u--) o.pop();
  if (u < 0) t = 0, o = [0];
  else {
    for (t = -1; o[0] === 0; t -= vr) o.shift();
    for (n = 1, i = o[0]; i >= 10; i /= 10) n++;
    n < vr && (t -= vr - n);
  }
  return a.e = t, a.d = o, a;
}
function To(r) {
  return lr(r = new this(r), r.e + 1, this.rounding);
}
function zo(r) {
  return r = new this(r), r.d ? r.d[0] ? r.s : 0 * r.s : r.s || NaN;
}
function Io(r) {
  return new this(r).sin();
}
function Oo(r) {
  return new this(r).sinh();
}
function $o(r) {
  return new this(r).sqrt();
}
function Po(r, e) {
  return new this(r).sub(e);
}
function qo() {
  var r = 0, e = arguments, t = new this(e[r]);
  for (dr = false; t.s && ++r < e.length; ) t = t.plus(e[r]);
  return dr = true, lr(t, this.precision, this.rounding);
}
function Ro(r) {
  return new this(r).tan();
}
function Uo(r) {
  return new this(r).tanh();
}
function Lo(r) {
  return lr(r = new this(r), r.e + 1, 1);
}
V[Symbol.for("nodejs.util.inspect.custom")] = V.toString;
V[Symbol.toStringTag] = "Decimal";
var Ve = V.constructor = Qi(Jt);
pt = new Ve(pt);
dt = new Ve(dt);
var Zo = "BigNumber", Vo = ["?on", "config"], Wo = er(Zo, Vo, (r) => {
  var { on: e, config: t } = r, n = Ve.clone({ precision: t.precision, modulo: Ve.EUCLID });
  return n.prototype = Object.create(n.prototype), n.prototype.type = "BigNumber", n.prototype.isBigNumber = true, n.prototype.toJSON = function() {
    return { mathjs: "BigNumber", value: this.toString() };
  }, n.fromJSON = function(i) {
    return new n(i.value);
  }, e && e("config", function(i, u) {
    i.precision !== u.precision && n.config({ precision: i.precision });
  }), n;
}, { isClass: true });
const Xr = Math.cosh || function(r) {
  return Math.abs(r) < 1e-9 ? 1 - r : (Math.exp(r) + Math.exp(-r)) * 0.5;
}, oe = Math.sinh || function(r) {
  return Math.abs(r) < 1e-9 ? r : (Math.exp(r) - Math.exp(-r)) * 0.5;
}, Jo = (r) => {
  const e = Math.sin(0.5 * r);
  return -2 * e * e;
}, Ut = function(r, e) {
  return r = Math.abs(r), e = Math.abs(e), r < e && ([r, e] = [e, r]), r < 1e8 ? Math.sqrt(r * r + e * e) : (e /= r, r * Math.sqrt(1 + e * e));
}, $e = function() {
  throw SyntaxError("Invalid Param");
};
function Lt(r, e) {
  const t = Math.abs(r), n = Math.abs(e);
  return r === 0 ? Math.log(n) : e === 0 ? Math.log(t) : t < 3e3 && n < 3e3 ? Math.log(r * r + e * e) * 0.5 : (r = r * 0.5, e = e * 0.5, 0.5 * Math.log(r * r + e * e) + Math.LN2);
}
const Yo = { re: 0, im: 0 }, _e = function(r, e) {
  const t = Yo;
  if (r == null) t.re = t.im = 0;
  else if (e !== void 0) t.re = r, t.im = e;
  else switch (typeof r) {
    case "object":
      if ("im" in r && "re" in r) t.re = r.re, t.im = r.im;
      else if ("abs" in r && "arg" in r) {
        if (!isFinite(r.abs) && isFinite(r.arg)) return I.INFINITY;
        t.re = r.abs * Math.cos(r.arg), t.im = r.abs * Math.sin(r.arg);
      } else if ("r" in r && "phi" in r) {
        if (!isFinite(r.r) && isFinite(r.phi)) return I.INFINITY;
        t.re = r.r * Math.cos(r.phi), t.im = r.r * Math.sin(r.phi);
      } else r.length === 2 ? (t.re = r[0], t.im = r[1]) : $e();
      break;
    case "string":
      t.im = t.re = 0;
      const n = r.replace(/_/g, "").match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
      let i = 1, u = 0;
      n === null && $e();
      for (let a = 0; a < n.length; a++) {
        const o = n[a];
        o === " " || o === "	" || o === `
` || (o === "+" ? i++ : o === "-" ? u++ : o === "i" || o === "I" ? (i + u === 0 && $e(), n[a + 1] !== " " && !isNaN(n[a + 1]) ? (t.im += parseFloat((u % 2 ? "-" : "") + n[a + 1]), a++) : t.im += parseFloat((u % 2 ? "-" : "") + "1"), i = u = 0) : ((i + u === 0 || isNaN(o)) && $e(), n[a + 1] === "i" || n[a + 1] === "I" ? (t.im += parseFloat((u % 2 ? "-" : "") + o), a++) : t.re += parseFloat((u % 2 ? "-" : "") + o), i = u = 0));
      }
      i + u > 0 && $e();
      break;
    case "number":
      t.im = 0, t.re = r;
      break;
    default:
      $e();
  }
  return isNaN(t.re) || isNaN(t.im), t;
};
function I(r, e) {
  if (!(this instanceof I)) return new I(r, e);
  const t = _e(r, e);
  this.re = t.re, this.im = t.im;
}
I.prototype = { re: 0, im: 0, sign: function() {
  const r = Ut(this.re, this.im);
  return new I(this.re / r, this.im / r);
}, add: function(r, e) {
  const t = _e(r, e), n = this.isInfinite(), i = !(isFinite(t.re) && isFinite(t.im));
  return n || i ? n && i ? I.NAN : I.INFINITY : new I(this.re + t.re, this.im + t.im);
}, sub: function(r, e) {
  const t = _e(r, e), n = this.isInfinite(), i = !(isFinite(t.re) && isFinite(t.im));
  return n || i ? n && i ? I.NAN : I.INFINITY : new I(this.re - t.re, this.im - t.im);
}, mul: function(r, e) {
  const t = _e(r, e), n = this.isInfinite(), i = !(isFinite(t.re) && isFinite(t.im)), u = this.re === 0 && this.im === 0, a = t.re === 0 && t.im === 0;
  return n && a || i && u ? I.NAN : n || i ? I.INFINITY : t.im === 0 && this.im === 0 ? new I(this.re * t.re, 0) : new I(this.re * t.re - this.im * t.im, this.re * t.im + this.im * t.re);
}, div: function(r, e) {
  const t = _e(r, e), n = this.isInfinite(), i = !(isFinite(t.re) && isFinite(t.im)), u = this.re === 0 && this.im === 0, a = t.re === 0 && t.im === 0;
  if (u && a || n && i) return I.NAN;
  if (a || n) return I.INFINITY;
  if (u || i) return I.ZERO;
  if (t.im === 0) return new I(this.re / t.re, this.im / t.re);
  if (Math.abs(t.re) < Math.abs(t.im)) {
    const o = t.re / t.im, f = t.re * o + t.im;
    return new I((this.re * o + this.im) / f, (this.im * o - this.re) / f);
  } else {
    const o = t.im / t.re, f = t.im * o + t.re;
    return new I((this.re + this.im * o) / f, (this.im - this.re * o) / f);
  }
}, pow: function(r, e) {
  const t = _e(r, e), n = this.re === 0 && this.im === 0;
  if (t.re === 0 && t.im === 0) return I.ONE;
  if (t.im === 0) {
    if (this.im === 0 && this.re > 0) return new I(Math.pow(this.re, t.re), 0);
    if (this.re === 0) switch ((t.re % 4 + 4) % 4) {
      case 0:
        return new I(Math.pow(this.im, t.re), 0);
      case 1:
        return new I(0, Math.pow(this.im, t.re));
      case 2:
        return new I(-Math.pow(this.im, t.re), 0);
      case 3:
        return new I(0, -Math.pow(this.im, t.re));
    }
  }
  if (n && t.re > 0) return I.ZERO;
  const u = Math.atan2(this.im, this.re), a = Lt(this.re, this.im);
  let o = Math.exp(t.re * a - t.im * u), f = t.im * a + t.re * u;
  return new I(o * Math.cos(f), o * Math.sin(f));
}, sqrt: function() {
  const r = this.re, e = this.im;
  if (e === 0) return r >= 0 ? new I(Math.sqrt(r), 0) : new I(0, Math.sqrt(-r));
  const t = Ut(r, e);
  let n = Math.sqrt(0.5 * (t + Math.abs(r))), i = Math.abs(e) / (2 * n);
  return r >= 0 ? new I(n, e < 0 ? -i : i) : new I(i, e < 0 ? -n : n);
}, exp: function() {
  const r = Math.exp(this.re);
  return this.im === 0 ? new I(r, 0) : new I(r * Math.cos(this.im), r * Math.sin(this.im));
}, expm1: function() {
  const r = this.re, e = this.im;
  return new I(Math.expm1(r) * Math.cos(e) + Jo(e), Math.exp(r) * Math.sin(e));
}, log: function() {
  const r = this.re, e = this.im;
  return e === 0 && r > 0 ? new I(Math.log(r), 0) : new I(Lt(r, e), Math.atan2(e, r));
}, abs: function() {
  return Ut(this.re, this.im);
}, arg: function() {
  return Math.atan2(this.im, this.re);
}, sin: function() {
  const r = this.re, e = this.im;
  return new I(Math.sin(r) * Xr(e), Math.cos(r) * oe(e));
}, cos: function() {
  const r = this.re, e = this.im;
  return new I(Math.cos(r) * Xr(e), -Math.sin(r) * oe(e));
}, tan: function() {
  const r = 2 * this.re, e = 2 * this.im, t = Math.cos(r) + Xr(e);
  return new I(Math.sin(r) / t, oe(e) / t);
}, cot: function() {
  const r = 2 * this.re, e = 2 * this.im, t = Math.cos(r) - Xr(e);
  return new I(-Math.sin(r) / t, oe(e) / t);
}, sec: function() {
  const r = this.re, e = this.im, t = 0.5 * Xr(2 * e) + 0.5 * Math.cos(2 * r);
  return new I(Math.cos(r) * Xr(e) / t, Math.sin(r) * oe(e) / t);
}, csc: function() {
  const r = this.re, e = this.im, t = 0.5 * Xr(2 * e) - 0.5 * Math.cos(2 * r);
  return new I(Math.sin(r) * Xr(e) / t, -Math.cos(r) * oe(e) / t);
}, asin: function() {
  const r = this.re, e = this.im, t = new I(e * e - r * r + 1, -2 * r * e).sqrt(), n = new I(t.re - e, t.im + r).log();
  return new I(n.im, -n.re);
}, acos: function() {
  const r = this.re, e = this.im, t = new I(e * e - r * r + 1, -2 * r * e).sqrt(), n = new I(t.re - e, t.im + r).log();
  return new I(Math.PI / 2 - n.im, n.re);
}, atan: function() {
  const r = this.re, e = this.im;
  if (r === 0) {
    if (e === 1) return new I(0, 1 / 0);
    if (e === -1) return new I(0, -1 / 0);
  }
  const t = r * r + (1 - e) * (1 - e), n = new I((1 - e * e - r * r) / t, -2 * r / t).log();
  return new I(-0.5 * n.im, 0.5 * n.re);
}, acot: function() {
  const r = this.re, e = this.im;
  if (e === 0) return new I(Math.atan2(1, r), 0);
  const t = r * r + e * e;
  return t !== 0 ? new I(r / t, -e / t).atan() : new I(r !== 0 ? r / 0 : 0, e !== 0 ? -e / 0 : 0).atan();
}, asec: function() {
  const r = this.re, e = this.im;
  if (r === 0 && e === 0) return new I(0, 1 / 0);
  const t = r * r + e * e;
  return t !== 0 ? new I(r / t, -e / t).acos() : new I(r !== 0 ? r / 0 : 0, e !== 0 ? -e / 0 : 0).acos();
}, acsc: function() {
  const r = this.re, e = this.im;
  if (r === 0 && e === 0) return new I(Math.PI / 2, 1 / 0);
  const t = r * r + e * e;
  return t !== 0 ? new I(r / t, -e / t).asin() : new I(r !== 0 ? r / 0 : 0, e !== 0 ? -e / 0 : 0).asin();
}, sinh: function() {
  const r = this.re, e = this.im;
  return new I(oe(r) * Math.cos(e), Xr(r) * Math.sin(e));
}, cosh: function() {
  const r = this.re, e = this.im;
  return new I(Xr(r) * Math.cos(e), oe(r) * Math.sin(e));
}, tanh: function() {
  const r = 2 * this.re, e = 2 * this.im, t = Xr(r) + Math.cos(e);
  return new I(oe(r) / t, Math.sin(e) / t);
}, coth: function() {
  const r = 2 * this.re, e = 2 * this.im, t = Xr(r) - Math.cos(e);
  return new I(oe(r) / t, -Math.sin(e) / t);
}, csch: function() {
  const r = this.re, e = this.im, t = Math.cos(2 * e) - Xr(2 * r);
  return new I(-2 * oe(r) * Math.cos(e) / t, 2 * Xr(r) * Math.sin(e) / t);
}, sech: function() {
  const r = this.re, e = this.im, t = Math.cos(2 * e) + Xr(2 * r);
  return new I(2 * Xr(r) * Math.cos(e) / t, -2 * oe(r) * Math.sin(e) / t);
}, asinh: function() {
  const r = this.re, e = this.im;
  if (e === 0) {
    if (r === 0) return new I(0, 0);
    const u = Math.abs(r), a = Math.log(u + Math.sqrt(u * u + 1));
    return new I(r < 0 ? -a : a, 0);
  }
  const t = r * r - e * e + 1, n = 2 * r * e, i = new I(t, n).sqrt();
  return new I(r + i.re, e + i.im).log();
}, acosh: function() {
  const r = this.re, e = this.im;
  if (e === 0) {
    if (r > 1) return new I(Math.log(r + Math.sqrt(r - 1) * Math.sqrt(r + 1)), 0);
    if (r < -1) {
      const i = Math.sqrt(r * r - 1);
      return new I(Math.log(-r + i), Math.PI);
    }
    return new I(0, Math.acos(r));
  }
  const t = new I(r - 1, e).sqrt(), n = new I(r + 1, e).sqrt();
  return new I(r + t.re * n.re - t.im * n.im, e + t.re * n.im + t.im * n.re).log();
}, atanh: function() {
  const r = this.re, e = this.im;
  if (e === 0) {
    if (r === 0) return new I(0, 0);
    if (r === 1) return new I(1 / 0, 0);
    if (r === -1) return new I(-1 / 0, 0);
    if (-1 < r && r < 1) return new I(0.5 * Math.log((1 + r) / (1 - r)), 0);
    if (r > 1) {
      const f = (r + 1) / (r - 1);
      return new I(0.5 * Math.log(f), -Math.PI / 2);
    }
    const o = (1 + r) / (1 - r);
    return new I(0.5 * Math.log(-o), Math.PI / 2);
  }
  const t = 1 - r, n = 1 + r, i = t * t + e * e;
  if (i === 0) return new I(r !== -1 ? r / 0 : 0, e !== 0 ? e / 0 : 0);
  const u = (n * t - e * e) / i, a = (e * t + n * e) / i;
  return new I(Lt(u, a) / 2, Math.atan2(a, u) / 2);
}, acoth: function() {
  const r = this.re, e = this.im;
  if (r === 0 && e === 0) return new I(0, Math.PI / 2);
  const t = r * r + e * e;
  return t !== 0 ? new I(r / t, -e / t).atanh() : new I(r !== 0 ? r / 0 : 0, e !== 0 ? -e / 0 : 0).atanh();
}, acsch: function() {
  const r = this.re, e = this.im;
  if (e === 0) {
    if (r === 0) return new I(1 / 0, 0);
    const n = 1 / r;
    return new I(Math.log(n + Math.sqrt(n * n + 1)), 0);
  }
  const t = r * r + e * e;
  return t !== 0 ? new I(r / t, -e / t).asinh() : new I(r !== 0 ? r / 0 : 0, e !== 0 ? -e / 0 : 0).asinh();
}, asech: function() {
  const r = this.re, e = this.im;
  if (this.isZero()) return I.INFINITY;
  const t = r * r + e * e;
  return t !== 0 ? new I(r / t, -e / t).acosh() : new I(r !== 0 ? r / 0 : 0, e !== 0 ? -e / 0 : 0).acosh();
}, inverse: function() {
  if (this.isZero()) return I.INFINITY;
  if (this.isInfinite()) return I.ZERO;
  const r = this.re, e = this.im, t = r * r + e * e;
  return new I(r / t, -e / t);
}, conjugate: function() {
  return new I(this.re, -this.im);
}, neg: function() {
  return new I(-this.re, -this.im);
}, ceil: function(r) {
  return r = Math.pow(10, r || 0), new I(Math.ceil(this.re * r) / r, Math.ceil(this.im * r) / r);
}, floor: function(r) {
  return r = Math.pow(10, r || 0), new I(Math.floor(this.re * r) / r, Math.floor(this.im * r) / r);
}, round: function(r) {
  return r = Math.pow(10, r || 0), new I(Math.round(this.re * r) / r, Math.round(this.im * r) / r);
}, equals: function(r, e) {
  const t = _e(r, e);
  return Math.abs(t.re - this.re) <= I.EPSILON && Math.abs(t.im - this.im) <= I.EPSILON;
}, clone: function() {
  return new I(this.re, this.im);
}, toString: function() {
  let r = this.re, e = this.im, t = "";
  return this.isNaN() ? "NaN" : this.isInfinite() ? "Infinity" : (Math.abs(r) < I.EPSILON && (r = 0), Math.abs(e) < I.EPSILON && (e = 0), e === 0 ? t + r : (r !== 0 ? (t += r, t += " ", e < 0 ? (e = -e, t += "-") : t += "+", t += " ") : e < 0 && (e = -e, t += "-"), e !== 1 && (t += e), t + "i"));
}, toVector: function() {
  return [this.re, this.im];
}, valueOf: function() {
  return this.im === 0 ? this.re : null;
}, isNaN: function() {
  return isNaN(this.re) || isNaN(this.im);
}, isZero: function() {
  return this.im === 0 && this.re === 0;
}, isFinite: function() {
  return isFinite(this.re) && isFinite(this.im);
}, isInfinite: function() {
  return !this.isFinite();
} };
I.ZERO = new I(0, 0);
I.ONE = new I(1, 0);
I.I = new I(0, 1);
I.PI = new I(Math.PI, 0);
I.E = new I(Math.E, 0);
I.INFINITY = new I(1 / 0, 1 / 0);
I.NAN = new I(NaN, NaN);
I.EPSILON = 1e-15;
var Qo = "Complex", Xo = [], Go = er(Qo, Xo, () => (Object.defineProperty(I, "name", { value: "Complex" }), I.prototype.constructor = I, I.prototype.type = "Complex", I.prototype.isComplex = true, I.prototype.toJSON = function() {
  return { mathjs: "Complex", re: this.re, im: this.im };
}, I.prototype.toPolar = function() {
  return { r: this.abs(), phi: this.arg() };
}, I.prototype.format = function(r) {
  var e = "", t = this.im, n = this.re, i = Vt(this.re, r), u = Vt(this.im, r), a = xr(r) ? r : r ? r.precision : null;
  if (a !== null) {
    var o = Math.pow(10, -a);
    Math.abs(n / t) < o && (n = 0), Math.abs(t / n) < o && (t = 0);
  }
  return t === 0 ? e = i : n === 0 ? t === 1 ? e = "i" : t === -1 ? e = "-i" : e = u + "i" : t < 0 ? t === -1 ? e = i + " - i" : e = i + " - " + u.substring(1) + "i" : t === 1 ? e = i + " + i" : e = i + " + " + u + "i", e;
}, I.fromPolar = function(r) {
  switch (arguments.length) {
    case 1: {
      var e = arguments[0];
      if (typeof e == "object") return I(e);
      throw new TypeError("Input has to be an object with r and phi keys.");
    }
    case 2: {
      var t = arguments[0], n = arguments[1];
      if (xr(t)) {
        if (Mi(n) && n.hasBase("ANGLE") && (n = n.toNumber("rad")), xr(n)) return new I({ r: t, phi: n });
        throw new TypeError("Phi is not a number nor an angle unit.");
      } else throw new TypeError("Radius r is not a number.");
    }
    default:
      throw new SyntaxError("Wrong number of arguments in function fromPolar");
  }
}, I.prototype.valueOf = I.prototype.toString, I.fromJSON = function(r) {
  return new I(r);
}, I.compare = function(r, e) {
  return r.re > e.re ? 1 : r.re < e.re ? -1 : r.im > e.im ? 1 : r.im < e.im ? -1 : 0;
}, I), { isClass: true });
typeof BigInt > "u" && (BigInt = function(r) {
  if (isNaN(r)) throw new Error("");
  return r;
});
const fr = BigInt(0), gr = BigInt(1), Wr = BigInt(2), Ke = BigInt(3), Re = BigInt(5), jr = BigInt(10);
BigInt(Number.MAX_SAFE_INTEGER);
const Ko = 2e3, ir = { s: gr, n: fr, d: gr };
function de(r, e) {
  try {
    r = BigInt(r);
  } catch {
    throw ye();
  }
  return r * e;
}
function fe(r) {
  return typeof r == "bigint" ? r : Math.floor(r);
}
function $r(r, e) {
  if (e === fr) throw nn();
  const t = Object.create(se.prototype);
  t.s = r < fr ? -gr : gr, r = r < fr ? -r : r;
  const n = Be(r, e);
  return t.n = r / n, t.d = e / n, t;
}
const Ho = [Wr * Wr, Wr, Wr * Wr, Wr, Wr * Wr, Wr * Ke, Wr, Wr * Ke];
function Pe(r) {
  const e = /* @__PURE__ */ Object.create(null);
  if (r <= gr) return e[r] = gr, e;
  const t = (n) => {
    e[n] = (e[n] || fr) + gr;
  };
  for (; r % Wr === fr; ) t(Wr), r /= Wr;
  for (; r % Ke === fr; ) t(Ke), r /= Ke;
  for (; r % Re === fr; ) t(Re), r /= Re;
  for (let n = 0, i = Wr + Re; i * i <= r; ) {
    for (; r % i === fr; ) t(i), r /= i;
    i += Ho[n], n = n + 1 & 7;
  }
  return r > gr && t(r), e;
}
const Vr = function(r, e) {
  let t = fr, n = gr, i = gr;
  if (r != null) if (e !== void 0) {
    if (typeof r == "bigint") t = r;
    else {
      if (isNaN(r)) throw ye();
      if (r % 1 !== 0) throw Mn();
      t = BigInt(r);
    }
    if (typeof e == "bigint") n = e;
    else {
      if (isNaN(e)) throw ye();
      if (e % 1 !== 0) throw Mn();
      n = BigInt(e);
    }
    i = t * n;
  } else if (typeof r == "object") {
    if ("d" in r && "n" in r) t = BigInt(r.n), n = BigInt(r.d), "s" in r && (t *= BigInt(r.s));
    else if (0 in r) t = BigInt(r[0]), 1 in r && (n = BigInt(r[1]));
    else if (typeof r == "bigint") t = r;
    else throw ye();
    i = t * n;
  } else if (typeof r == "number") {
    if (isNaN(r)) throw ye();
    if (r < 0 && (i = -gr, r = -r), r % 1 === 0) t = BigInt(r);
    else {
      let u = 1, a = 0, o = 1, f = 1, c = 1, s = 1e7;
      for (r >= 1 && (u = 10 ** Math.floor(1 + Math.log10(r)), r /= u); o <= s && c <= s; ) {
        let h = (a + f) / (o + c);
        if (r === h) {
          o + c <= s ? (t = a + f, n = o + c) : c > o ? (t = f, n = c) : (t = a, n = o);
          break;
        } else r > h ? (a += f, o += c) : (f += a, c += o), o > s ? (t = f, n = c) : (t = a, n = o);
      }
      t = BigInt(t) * BigInt(u), n = BigInt(n);
    }
  } else if (typeof r == "string") {
    let u = 0, a = fr, o = fr, f = fr, c = gr, s = gr, h = r.replace(/_/g, "").match(/\d+|./g);
    if (h === null) throw ye();
    if (h[u] === "-" ? (i = -gr, u++) : h[u] === "+" && u++, h.length === u + 1 ? o = de(h[u++], i) : h[u + 1] === "." || h[u] === "." ? (h[u] !== "." && (a = de(h[u++], i)), u++, (u + 1 === h.length || h[u + 1] === "(" && h[u + 3] === ")" || h[u + 1] === "'" && h[u + 3] === "'") && (o = de(h[u], i), c = jr ** BigInt(h[u].length), u++), (h[u] === "(" && h[u + 2] === ")" || h[u] === "'" && h[u + 2] === "'") && (f = de(h[u + 1], i), s = jr ** BigInt(h[u + 1].length) - gr, u += 3)) : h[u + 1] === "/" || h[u + 1] === ":" ? (o = de(h[u], i), c = de(h[u + 2], gr), u += 3) : h[u + 3] === "/" && h[u + 1] === " " && (a = de(h[u], i), o = de(h[u + 2], i), c = de(h[u + 4], gr), u += 5), h.length <= u) n = c * s, i = t = f + n * a + s * o;
    else throw ye();
  } else if (typeof r == "bigint") t = r, i = r, n = gr;
  else throw ye();
  if (n === fr) throw nn();
  ir.s = i < fr ? -gr : gr, ir.n = t < fr ? -t : t, ir.d = n < fr ? -n : n;
};
function ko(r, e, t) {
  let n = gr;
  for (; e > fr; r = r * r % t, e >>= gr) e & gr && (n = n * r % t);
  return n;
}
function jo(r, e) {
  for (; e % Wr === fr; e /= Wr) ;
  for (; e % Re === fr; e /= Re) ;
  if (e === gr) return fr;
  let t = jr % e, n = 1;
  for (; t !== gr; n++) if (t = t * jr % e, n > Ko) return fr;
  return BigInt(n);
}
function rs(r, e, t) {
  let n = gr, i = ko(jr, t, e);
  for (let u = 0; u < 300; u++) {
    if (n === i) return BigInt(u);
    n = n * jr % e, i = i * jr % e;
  }
  return 0;
}
function Be(r, e) {
  if (!r) return e;
  if (!e) return r;
  for (; ; ) {
    if (r %= e, !r) return e;
    if (e %= r, !e) return r;
  }
}
function se(r, e) {
  if (Vr(r, e), this instanceof se) r = Be(ir.d, ir.n), this.s = ir.s, this.n = ir.n / r, this.d = ir.d / r;
  else return $r(ir.s * ir.n, ir.d);
}
const nn = function() {
  return new Error("Division by Zero");
}, ye = function() {
  return new Error("Invalid argument");
}, Mn = function() {
  return new Error("Parameters must be integer");
};
se.prototype = { s: gr, n: fr, d: gr, abs: function() {
  return $r(this.n, this.d);
}, neg: function() {
  return $r(-this.s * this.n, this.d);
}, add: function(r, e) {
  return Vr(r, e), $r(this.s * this.n * ir.d + ir.s * this.d * ir.n, this.d * ir.d);
}, sub: function(r, e) {
  return Vr(r, e), $r(this.s * this.n * ir.d - ir.s * this.d * ir.n, this.d * ir.d);
}, mul: function(r, e) {
  return Vr(r, e), $r(this.s * ir.s * this.n * ir.n, this.d * ir.d);
}, div: function(r, e) {
  return Vr(r, e), $r(this.s * ir.s * this.n * ir.d, this.d * ir.n);
}, clone: function() {
  return $r(this.s * this.n, this.d);
}, mod: function(r, e) {
  if (r === void 0) return $r(this.s * this.n % this.d, gr);
  if (Vr(r, e), fr === ir.n * this.d) throw nn();
  return $r(this.s * (ir.d * this.n) % (ir.n * this.d), ir.d * this.d);
}, gcd: function(r, e) {
  return Vr(r, e), $r(Be(ir.n, this.n) * Be(ir.d, this.d), ir.d * this.d);
}, lcm: function(r, e) {
  return Vr(r, e), ir.n === fr && this.n === fr ? $r(fr, gr) : $r(ir.n * this.n, Be(ir.n, this.n) * Be(ir.d, this.d));
}, inverse: function() {
  return $r(this.s * this.d, this.n);
}, pow: function(r, e) {
  if (Vr(r, e), ir.d === gr) return ir.s < fr ? $r((this.s * this.d) ** ir.n, this.n ** ir.n) : $r((this.s * this.n) ** ir.n, this.d ** ir.n);
  if (this.s < fr) return null;
  let t = Pe(this.n), n = Pe(this.d), i = gr, u = gr;
  for (let a in t) if (a !== "1") {
    if (a === "0") {
      i = fr;
      break;
    }
    if (t[a] *= ir.n, t[a] % ir.d === fr) t[a] /= ir.d;
    else return null;
    i *= BigInt(a) ** t[a];
  }
  for (let a in n) if (a !== "1") {
    if (n[a] *= ir.n, n[a] % ir.d === fr) n[a] /= ir.d;
    else return null;
    u *= BigInt(a) ** n[a];
  }
  return ir.s < fr ? $r(u, i) : $r(i, u);
}, log: function(r, e) {
  if (Vr(r, e), this.s <= fr || ir.s <= fr) return null;
  const t = /* @__PURE__ */ Object.create(null), n = Pe(ir.n), i = Pe(ir.d), u = Pe(this.n), a = Pe(this.d);
  for (const c in i) n[c] = (n[c] || fr) - i[c];
  for (const c in a) u[c] = (u[c] || fr) - a[c];
  for (const c in n) c !== "1" && (t[c] = true);
  for (const c in u) c !== "1" && (t[c] = true);
  let o = null, f = null;
  for (const c in t) {
    const s = n[c] || fr, h = u[c] || fr;
    if (s === fr) {
      if (h !== fr) return null;
      continue;
    }
    let v = h, p = s;
    const d = Be(v, p);
    if (v /= d, p /= d, o === null && f === null) o = v, f = p;
    else if (v * f !== o * p) return null;
  }
  return o !== null && f !== null ? $r(o, f) : null;
}, equals: function(r, e) {
  return Vr(r, e), this.s * this.n * ir.d === ir.s * ir.n * this.d;
}, lt: function(r, e) {
  return Vr(r, e), this.s * this.n * ir.d < ir.s * ir.n * this.d;
}, lte: function(r, e) {
  return Vr(r, e), this.s * this.n * ir.d <= ir.s * ir.n * this.d;
}, gt: function(r, e) {
  return Vr(r, e), this.s * this.n * ir.d > ir.s * ir.n * this.d;
}, gte: function(r, e) {
  return Vr(r, e), this.s * this.n * ir.d >= ir.s * ir.n * this.d;
}, compare: function(r, e) {
  Vr(r, e);
  let t = this.s * this.n * ir.d - ir.s * ir.n * this.d;
  return (fr < t) - (t < fr);
}, ceil: function(r) {
  return r = jr ** BigInt(r || 0), $r(fe(this.s * r * this.n / this.d) + (r * this.n % this.d > fr && this.s >= fr ? gr : fr), r);
}, floor: function(r) {
  return r = jr ** BigInt(r || 0), $r(fe(this.s * r * this.n / this.d) - (r * this.n % this.d > fr && this.s < fr ? gr : fr), r);
}, round: function(r) {
  return r = jr ** BigInt(r || 0), $r(fe(this.s * r * this.n / this.d) + this.s * ((this.s >= fr ? gr : fr) + Wr * (r * this.n % this.d) > this.d ? gr : fr), r);
}, roundTo: function(r, e) {
  Vr(r, e);
  const t = this.n * ir.d, n = this.d * ir.n, i = t % n;
  let u = fe(t / n);
  return i + i >= n && u++, $r(this.s * u * ir.n, ir.d);
}, divisible: function(r, e) {
  return Vr(r, e), ir.n === fr ? false : this.n * ir.d % (ir.n * this.d) === fr;
}, valueOf: function() {
  return Number(this.s * this.n) / Number(this.d);
}, toString: function(r = 15) {
  let e = this.n, t = this.d, n = jo(e, t), i = rs(e, t, n), u = this.s < fr ? "-" : "";
  if (u += fe(e / t), e %= t, e *= jr, e && (u += "."), n) {
    for (let a = i; a--; ) u += fe(e / t), e %= t, e *= jr;
    u += "(";
    for (let a = n; a--; ) u += fe(e / t), e %= t, e *= jr;
    u += ")";
  } else for (let a = r; e && a--; ) u += fe(e / t), e %= t, e *= jr;
  return u;
}, toFraction: function(r = false) {
  let e = this.n, t = this.d, n = this.s < fr ? "-" : "";
  if (t === gr) n += e;
  else {
    const i = fe(e / t);
    r && i > fr && (n += i, n += " ", e %= t), n += e, n += "/", n += t;
  }
  return n;
}, toLatex: function(r = false) {
  let e = this.n, t = this.d, n = this.s < fr ? "-" : "";
  if (t === gr) n += e;
  else {
    const i = fe(e / t);
    r && i > fr && (n += i, e %= t), n += "\\frac{", n += e, n += "}{", n += t, n += "}";
  }
  return n;
}, toContinued: function() {
  let r = this.n, e = this.d;
  const t = [];
  for (; e; ) {
    t.push(fe(r / e));
    const n = r % e;
    r = e, e = n;
  }
  return t;
}, simplify: function(r = 1e-3) {
  const e = BigInt(Math.ceil(1 / r)), t = this.abs(), n = t.toContinued();
  for (let i = 1; i < n.length; i++) {
    let u = $r(n[i - 1], gr);
    for (let o = i - 2; o >= 0; o--) u = u.inverse().add(n[o]);
    let a = u.sub(t);
    if (a.n * e < a.d) return u.mul(this.s);
  }
  return this;
} };
var es = "Fraction", ts = [], ns = er(es, ts, () => (Object.defineProperty(se, "name", { value: "Fraction" }), se.prototype.constructor = se, se.prototype.type = "Fraction", se.prototype.isFraction = true, se.prototype.toJSON = function() {
  return { mathjs: "Fraction", n: String(this.s * this.n), d: String(this.d) };
}, se.fromJSON = function(r) {
  return new se(r);
}, se), { isClass: true }), is = "Matrix", us = [], as = er(is, us, () => {
  function r() {
    if (!(this instanceof r)) throw new SyntaxError("Constructor must be called with the new operator");
  }
  return r.prototype.type = "Matrix", r.prototype.isMatrix = true, r.prototype.storage = function() {
    throw new Error("Cannot invoke storage on a Matrix interface");
  }, r.prototype.datatype = function() {
    throw new Error("Cannot invoke datatype on a Matrix interface");
  }, r.prototype.create = function(e, t) {
    throw new Error("Cannot invoke create on a Matrix interface");
  }, r.prototype.subset = function(e, t, n) {
    throw new Error("Cannot invoke subset on a Matrix interface");
  }, r.prototype.get = function(e) {
    throw new Error("Cannot invoke get on a Matrix interface");
  }, r.prototype.set = function(e, t, n) {
    throw new Error("Cannot invoke set on a Matrix interface");
  }, r.prototype.resize = function(e, t) {
    throw new Error("Cannot invoke resize on a Matrix interface");
  }, r.prototype.reshape = function(e, t) {
    throw new Error("Cannot invoke reshape on a Matrix interface");
  }, r.prototype.clone = function() {
    throw new Error("Cannot invoke clone on a Matrix interface");
  }, r.prototype.size = function() {
    throw new Error("Cannot invoke size on a Matrix interface");
  }, r.prototype.map = function(e, t) {
    throw new Error("Cannot invoke map on a Matrix interface");
  }, r.prototype.forEach = function(e) {
    throw new Error("Cannot invoke forEach on a Matrix interface");
  }, r.prototype[Symbol.iterator] = function() {
    throw new Error("Cannot iterate a Matrix interface");
  }, r.prototype.toArray = function() {
    throw new Error("Cannot invoke toArray on a Matrix interface");
  }, r.prototype.valueOf = function() {
    throw new Error("Cannot invoke valueOf on a Matrix interface");
  }, r.prototype.format = function(e) {
    throw new Error("Cannot invoke format on a Matrix interface");
  }, r.prototype.toString = function() {
    throw new Error("Cannot invoke toString on a Matrix interface");
  }, r;
}, { isClass: true });
function Zt(r, e, t) {
  var n = r.constructor, i = new n(2), u = "";
  if (t) {
    if (t < 1) throw new Error("size must be in greater than 0");
    if (!zr(t)) throw new Error("size must be an integer");
    if (r.greaterThan(i.pow(t - 1).sub(1)) || r.lessThan(i.pow(t - 1).mul(-1))) throw new Error("Value must be in range [-2^".concat(t - 1, ", 2^").concat(t - 1, "-1]"));
    if (!r.isInteger()) throw new Error("Value must be an integer");
    r.lessThan(0) && (r = r.add(i.pow(t))), u = "i".concat(t);
  }
  switch (e) {
    case 2:
      return "".concat(r.toBinary()).concat(u);
    case 8:
      return "".concat(r.toOctal()).concat(u);
    case 16:
      return "".concat(r.toHexadecimal()).concat(u);
    default:
      throw new Error("Base ".concat(e, " not supported "));
  }
}
function os(r, e) {
  if (typeof e == "function") return e(r);
  if (!r.isFinite()) return r.isNaN() ? "NaN" : r.gt(0) ? "Infinity" : "-Infinity";
  var { notation: t, precision: n, wordSize: i } = Ii(e);
  switch (t) {
    case "fixed":
      return fs(r, n);
    case "exponential":
      return Sn(r, n);
    case "engineering":
      return ss(r, n);
    case "bin":
      return Zt(r, 2, i);
    case "oct":
      return Zt(r, 8, i);
    case "hex":
      return Zt(r, 16, i);
    case "auto": {
      var u = Nn(e == null ? void 0 : e.lowerExp, -3), a = Nn(e == null ? void 0 : e.upperExp, 5);
      if (r.isZero()) return "0";
      var o, f = r.toSignificantDigits(n), c = f.e;
      return c >= u && c < a ? o = f.toFixed() : o = Sn(r, n), o.replace(/((\.\d*?)(0+))($|e)/, function() {
        var s = arguments[2], h = arguments[4];
        return s !== "." ? s + h : h;
      });
    }
    default:
      throw new Error('Unknown notation "' + t + '". Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.');
  }
}
function ss(r, e) {
  var t = r.e, n = t % 3 === 0 ? t : t < 0 ? t - 3 - t % 3 : t - t % 3, i = r.mul(Math.pow(10, -n)), u = i.toPrecision(e);
  if (u.includes("e")) {
    var a = r.constructor;
    u = new a(u).toFixed();
  }
  return u + "e" + (t >= 0 ? "+" : "") + n.toString();
}
function Sn(r, e) {
  return e !== void 0 ? r.toExponential(e - 1) : r.toExponential();
}
function fs(r, e) {
  return r.toFixed(e);
}
function Nn(r, e) {
  return xr(r) ? r : Rr(r) ? r.toNumber() : e;
}
function Or(r, e) {
  var t = cs(r, e);
  return e && typeof e == "object" && "truncate" in e && t.length > e.truncate ? t.substring(0, e.truncate - 3) + "..." : t;
}
function cs(r, e) {
  if (typeof r == "number") return Vt(r, e);
  if (Rr(r)) return os(r, e);
  if (ls(r)) return !e || e.fraction !== "decimal" ? "".concat(r.s * r.n, "/").concat(r.d) : r.toString();
  if (Array.isArray(r)) return Xi(r, e);
  if (ce(r)) return xn(r);
  if (typeof r == "function") return r.syntax ? String(r.syntax) : "function";
  if (r && typeof r == "object") {
    if (typeof r.format == "function") return r.format(e);
    if (r && r.toString(e) !== {}.toString()) return r.toString(e);
    var t = Object.keys(r).map((n) => xn(n) + ": " + Or(r[n], e));
    return "{" + t.join(", ") + "}";
  }
  return String(r);
}
function xn(r) {
  for (var e = String(r), t = "", n = 0; n < e.length; ) {
    var i = e.charAt(n);
    t += i in Tn ? Tn[i] : i, n++;
  }
  return '"' + t + '"';
}
var Tn = { '"': '\\"', "\\": "\\\\", "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "	": "\\t" };
function Xi(r, e) {
  if (Array.isArray(r)) {
    for (var t = "[", n = r.length, i = 0; i < n; i++) i !== 0 && (t += ", "), t += Xi(r[i], e);
    return t += "]", t;
  } else return Or(r, e);
}
function ls(r) {
  return r && typeof r == "object" && typeof r.s == "bigint" && typeof r.n == "bigint" && typeof r.d == "bigint" || false;
}
function br(r, e, t) {
  if (!(this instanceof br)) throw new SyntaxError("Constructor must be called with the new operator");
  this.actual = r, this.expected = e, this.relation = t, this.message = "Dimension mismatch (" + (Array.isArray(r) ? "[" + r.join(", ") + "]" : r) + " " + (this.relation || "!=") + " " + (Array.isArray(e) ? "[" + e.join(", ") + "]" : e) + ")", this.stack = new Error().stack;
}
br.prototype = new RangeError();
br.prototype.constructor = RangeError;
br.prototype.name = "DimensionError";
br.prototype.isDimensionError = true;
function be(r, e, t) {
  if (!(this instanceof be)) throw new SyntaxError("Constructor must be called with the new operator");
  this.index = r, arguments.length < 3 ? (this.min = 0, this.max = e) : (this.min = e, this.max = t), this.min !== void 0 && this.index < this.min ? this.message = "Index out of range (" + this.index + " < " + this.min + ")" : this.max !== void 0 && this.index >= this.max ? this.message = "Index out of range (" + this.index + " > " + (this.max - 1) + ")" : this.message = "Index out of range (" + this.index + ")", this.stack = new Error().stack;
}
be.prototype = new RangeError();
be.prototype.constructor = RangeError;
be.prototype.name = "IndexError";
be.prototype.isIndexError = true;
function wr(r) {
  for (var e = []; Array.isArray(r); ) e.push(r.length), r = r[0];
  return e;
}
function Gi(r, e, t) {
  var n, i = r.length;
  if (i !== e[t]) throw new br(i, e[t]);
  if (t < e.length - 1) {
    var u = t + 1;
    for (n = 0; n < i; n++) {
      var a = r[n];
      if (!Array.isArray(a)) throw new br(e.length - 1, e.length, "<");
      Gi(r[n], e, u);
    }
  } else for (n = 0; n < i; n++) if (Array.isArray(r[n])) throw new br(e.length + 1, e.length, ">");
}
function zn(r, e) {
  var t = e.length === 0;
  if (t) {
    if (Array.isArray(r)) throw new br(r.length, 0);
  } else Gi(r, e, 0);
}
function qr(r, e) {
  if (r !== void 0) {
    if (!xr(r) || !zr(r)) throw new TypeError("Index must be an integer (value: " + r + ")");
    if (r < 0 || typeof e == "number" && r >= e) throw new be(r, e);
  }
}
function Dt(r, e, t) {
  if (!Array.isArray(e)) throw new TypeError("Array expected");
  if (e.length === 0) throw new Error("Resizing to scalar is not supported");
  e.forEach(function(i) {
    if (!xr(i) || !zr(i) || i < 0) throw new TypeError("Invalid size, must contain positive integers (size: " + Or(e) + ")");
  }), (xr(r) || Rr(r)) && (r = [r]);
  var n = t !== void 0 ? t : 0;
  return Xt(r, e, 0, n), r;
}
function Xt(r, e, t, n) {
  var i, u, a = r.length, o = e[t], f = Math.min(a, o);
  if (r.length = o, t < e.length - 1) {
    var c = t + 1;
    for (i = 0; i < f; i++) u = r[i], Array.isArray(u) || (u = [u], r[i] = u), Xt(u, e, c, n);
    for (i = f; i < o; i++) u = [], r[i] = u, Xt(u, e, c, n);
  } else {
    for (i = 0; i < f; i++) for (; Array.isArray(r[i]); ) r[i] = r[i][0];
    for (i = f; i < o; i++) r[i] = n;
  }
}
function un(r, e) {
  var t = Gt(r, true), n = t.length;
  if (!Array.isArray(r) || !Array.isArray(e)) throw new TypeError("Array expected");
  if (e.length === 0) throw new br(0, n, "!=");
  e = an(e, n);
  var i = Ki(e);
  if (n !== i) throw new br(i, n, "!=");
  try {
    return hs(t, e);
  } catch (u) {
    throw u instanceof br ? new br(i, n, "!=") : u;
  }
}
function an(r, e) {
  var t = Ki(r), n = r.slice(), i = -1, u = r.indexOf(i), a = r.indexOf(i, u + 1) >= 0;
  if (a) throw new Error("More than one wildcard in sizes");
  var o = u >= 0, f = e % t === 0;
  if (o) if (f) n[u] = -e / t;
  else throw new Error("Could not replace wildcard, since " + e + " is no multiple of " + -t);
  return n;
}
function Ki(r) {
  return r.reduce((e, t) => e * t, 1);
}
function hs(r, e) {
  for (var t = r, n, i = e.length - 1; i > 0; i--) {
    var u = e[i];
    n = [];
    for (var a = t.length / u, o = 0; o < a; o++) n.push(t.slice(o * u, (o + 1) * u));
    t = n;
  }
  return t;
}
function In(r, e) {
  for (var t = wr(r); Array.isArray(r) && r.length === 1; ) r = r[0], t.shift();
  for (var n = t.length; t[n - 1] === 1; ) n--;
  return n < t.length && (r = Hi(r, n, 0), t.length = n), r;
}
function Hi(r, e, t) {
  var n, i;
  if (t < e) {
    var u = t + 1;
    for (n = 0, i = r.length; n < i; n++) r[n] = Hi(r[n], e, u);
  } else for (; Array.isArray(r); ) r = r[0];
  return r;
}
function ki(r, e, t, n) {
  var i = n || wr(r);
  if (t) for (var u = 0; u < t; u++) r = [r], i.unshift(1);
  for (r = ji(r, e, 0); i.length < e; ) i.push(1);
  return r;
}
function ji(r, e, t) {
  var n, i;
  if (Array.isArray(r)) {
    var u = t + 1;
    for (n = 0, i = r.length; n < i; n++) r[n] = ji(r[n], e, u);
  } else for (var a = t; a < e; a++) r = [r];
  return r;
}
function Gt(r) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  if (!Array.isArray(r)) return r;
  if (typeof e != "boolean") throw new TypeError("Boolean expected for second argument of flatten");
  var t = [];
  return e ? i(r) : n(r), t;
  function n(u) {
    for (var a = 0; a < u.length; a++) {
      var o = u[a];
      Array.isArray(o) ? n(o) : t.push(o);
    }
  }
  function i(u) {
    if (Array.isArray(u[0])) for (var a = 0; a < u.length; a++) i(u[a]);
    else for (var o = 0; o < u.length; o++) t.push(u[o]);
  }
}
function xt(r, e) {
  for (var t, n = 0, i = 0; i < r.length; i++) {
    var u = r[i], a = Array.isArray(u);
    if (i === 0 && a && (n = u.length), a && u.length !== n) return;
    var o = a ? xt(u, e) : e(u);
    if (t === void 0) t = o;
    else if (t !== o) return "mixed";
  }
  return t;
}
function ru(r, e, t, n) {
  if (n < t) {
    if (r.length !== e.length) throw new br(r.length, e.length);
    for (var i = [], u = 0; u < r.length; u++) i[u] = ru(r[u], e[u], t, n + 1);
    return i;
  } else return r.concat(e);
}
function eu() {
  var r = Array.prototype.slice.call(arguments, 0, -1), e = Array.prototype.slice.call(arguments, -1);
  if (r.length === 1) return r[0];
  if (r.length > 1) return r.slice(1).reduce(function(t, n) {
    return ru(t, n, e, 0);
  }, r[0]);
  throw new Error("Wrong number of arguments in function concat");
}
function tu() {
  for (var r = arguments.length, e = new Array(r), t = 0; t < r; t++) e[t] = arguments[t];
  for (var n = e.map((v) => v.length), i = Math.max(...n), u = new Array(i).fill(null), a = 0; a < e.length; a++) for (var o = e[a], f = n[a], c = 0; c < f; c++) {
    var s = i - f + c;
    o[c] > u[s] && (u[s] = o[c]);
  }
  for (var h = 0; h < e.length; h++) nu(e[h], u);
  return u;
}
function nu(r, e) {
  for (var t = e.length, n = r.length, i = 0; i < n; i++) {
    var u = t - n + i;
    if (r[i] < e[u] && r[i] > 1 || r[i] > e[u]) throw new Error("shape mismatch: mismatch is found in arg with shape (".concat(r, ") not possible to broadcast dimension ").concat(n, " with size ").concat(r[i], " to size ").concat(e[u]));
  }
}
function Kt(r, e) {
  var t = wr(r);
  if (Fe(t, e)) return r;
  nu(t, e);
  var n = tu(t, e), i = n.length, u = [...Array(i - t.length).fill(1), ...t], a = ds(r);
  t.length < i && (a = un(a, u), t = wr(a));
  for (var o = 0; o < i; o++) t[o] < n[o] && (a = vs(a, n[o], o), t = wr(a));
  return a;
}
function vs(r, e, t) {
  return eu(...Array(e).fill(r), t);
}
function iu(r, e) {
  if (!Array.isArray(r)) throw new Error("Array expected");
  var t = wr(r);
  if (e.length !== t.length) throw new br(e.length, t.length);
  for (var n = 0; n < e.length; n++) qr(e[n], t[n]);
  return e.reduce((i, u) => i[u], r);
}
function On(r, e) {
  var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  if (r.length === 0) return [];
  if (t) return u(r);
  var n = [];
  return i(r, 0);
  function i(a, o) {
    if (Array.isArray(a)) {
      for (var f = a.length, c = Array(f), s = 0; s < f; s++) n[o] = s, c[s] = i(a[s], o + 1);
      return c;
    } else return e(a, n.slice(0, o), r);
  }
  function u(a) {
    if (Array.isArray(a)) {
      for (var o = a.length, f = Array(o), c = 0; c < o; c++) f[c] = u(a[c]);
      return f;
    } else return e(a);
  }
}
function ps(r, e) {
  var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  if (r.length === 0) return;
  if (t) {
    u(r);
    return;
  }
  var n = [];
  i(r, 0);
  function i(a, o) {
    if (Array.isArray(a)) for (var f = a.length, c = 0; c < f; c++) n[o] = c, i(a[c], o + 1);
    else e(a, n.slice(0, o), r);
  }
  function u(a) {
    if (Array.isArray(a)) for (var o = a.length, f = 0; f < o; f++) u(a[f]);
    else e(a);
  }
}
function ds(r) {
  return Le([], r);
}
function gt(r, e, t, n) {
  if (vt.isTypedFunction(r)) {
    var i;
    if (n) i = 1;
    else {
      var u = (e.isMatrix ? e.size() : wr(e)).map(() => 0), a = e.isMatrix ? e.get(u) : iu(e, u);
      i = gs(r, a, u, e);
    }
    var o;
    if (e.isMatrix && e.dataType !== "mixed" && e.dataType !== void 0) {
      var f = ms(r, i);
      o = f !== void 0 ? f : r;
    } else o = r;
    return i >= 1 && i <= 3 ? { isUnary: i === 1, fn: function() {
      for (var s = arguments.length, h = new Array(s), v = 0; v < s; v++) h[v] = arguments[v];
      return $n(o, h.slice(0, i), t, r.name);
    } } : { isUnary: false, fn: function() {
      for (var s = arguments.length, h = new Array(s), v = 0; v < s; v++) h[v] = arguments[v];
      return $n(o, h, t, r.name);
    } };
  }
  return n === void 0 ? { isUnary: Ds(r), fn: r } : { isUnary: n, fn: r };
}
function ms(r, e) {
  var t = [];
  if (Object.entries(r.signatures).forEach((n) => {
    var [i, u] = n;
    i.split(",").length === e && t.push(u);
  }), t.length === 1) return t[0];
}
function Ds(r) {
  if (r.length !== 1) return false;
  var e = r.toString();
  if (/arguments/.test(e)) return false;
  var t = e.match(/\(.*?\)/);
  return !/\.\.\./.test(t);
}
function gs(r, e, t, n) {
  for (var i = [e, t, n], u = 3; u > 0; u--) {
    var a = i.slice(0, u);
    if (vt.resolve(r, a) !== null) return u;
  }
}
function $n(r, e, t, n) {
  try {
    return r(...e);
  } catch (i) {
    ys(i, e, t, n);
  }
}
function ys(r, e, t, n) {
  var i;
  if (r instanceof TypeError && ((i = r.data) === null || i === void 0 ? void 0 : i.category) === "wrongType") {
    var u = [];
    throw u.push("value: ".concat(te(e[0]))), e.length >= 2 && u.push("index: ".concat(te(e[1]))), e.length >= 3 && u.push("array: ".concat(te(e[2]))), new TypeError("Function ".concat(t, " cannot apply callback arguments ") + "".concat(n, "(").concat(u.join(", "), ") at index ").concat(JSON.stringify(e[1])));
  } else throw new TypeError("Function ".concat(t, " cannot apply callback arguments ") + "to function ".concat(n, ": ").concat(r.message));
}
var ws = "DenseMatrix", As = ["Matrix"], Fs = er(ws, As, (r) => {
  var { Matrix: e } = r;
  function t(s, h) {
    if (!(this instanceof t)) throw new SyntaxError("Constructor must be called with the new operator");
    if (h && !ce(h)) throw new Error("Invalid datatype: " + h);
    if (_r(s)) s.type === "DenseMatrix" ? (this._data = Fr(s._data), this._size = Fr(s._size), this._datatype = h || s._datatype) : (this._data = s.toArray(), this._size = s.size(), this._datatype = h || s._datatype);
    else if (s && Pr(s.data) && Pr(s.size)) this._data = s.data, this._size = s.size, zn(this._data, this._size), this._datatype = h || s.datatype;
    else if (Pr(s)) this._data = c(s), this._size = wr(this._data), zn(this._data, this._size), this._datatype = h;
    else {
      if (s) throw new TypeError("Unsupported type of data (" + te(s) + ")");
      this._data = [], this._size = [0], this._datatype = h;
    }
  }
  t.prototype = new e(), t.prototype.createDenseMatrix = function(s, h) {
    return new t(s, h);
  }, Object.defineProperty(t, "name", { value: "DenseMatrix" }), t.prototype.constructor = t, t.prototype.type = "DenseMatrix", t.prototype.isDenseMatrix = true, t.prototype.getDataType = function() {
    return xt(this._data, te);
  }, t.prototype.storage = function() {
    return "dense";
  }, t.prototype.datatype = function() {
    return this._datatype;
  }, t.prototype.create = function(s, h) {
    return new t(s, h);
  }, t.prototype.subset = function(s, h, v) {
    switch (arguments.length) {
      case 1:
        return n(this, s);
      case 2:
      case 3:
        return u(this, s, h, v);
      default:
        throw new SyntaxError("Wrong number of arguments");
    }
  }, t.prototype.get = function(s) {
    return iu(this._data, s);
  }, t.prototype.set = function(s, h, v) {
    if (!Pr(s)) throw new TypeError("Array expected");
    if (s.length < this._size.length) throw new br(s.length, this._size.length, "<");
    var p, d, l, D = s.map(function(E) {
      return E + 1;
    });
    f(this, D, v);
    var g = this._data;
    for (p = 0, d = s.length - 1; p < d; p++) l = s[p], qr(l, g.length), g = g[l];
    return l = s[s.length - 1], qr(l, g.length), g[l] = h, this;
  };
  function n(s, h) {
    if (!rn(h)) throw new TypeError("Invalid index");
    var v = h.isScalar();
    if (v) return s.get(h.min());
    var p = h.size();
    if (p.length !== s._size.length) throw new br(p.length, s._size.length);
    for (var d = h.min(), l = h.max(), D = 0, g = s._size.length; D < g; D++) qr(d[D], s._size[D]), qr(l[D], s._size[D]);
    var E = new t([]), m = i(s._data, h);
    return E._size = m.size, E._datatype = s._datatype, E._data = m.data, E;
  }
  function i(s, h) {
    var v = h.size().length - 1, p = Array(v);
    return { data: d(s), size: p };
    function d(l) {
      var D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, g = h.dimension(D);
      return p[D] = g.size()[0], D < v ? g.map((E) => (qr(E, l.length), d(l[E], D + 1))).valueOf() : g.map((E) => (qr(E, l.length), l[E])).valueOf();
    }
  }
  function u(s, h, v, p) {
    if (!h || h.isIndex !== true) throw new TypeError("Invalid index");
    var d = h.size(), l = h.isScalar(), D;
    if (_r(v) ? (D = v.size(), v = v.valueOf()) : D = wr(v), l) {
      if (D.length !== 0) throw new TypeError("Scalar expected");
      s.set(h.min(), v, p);
    } else {
      if (!Fe(D, d)) try {
        D.length === 0 ? v = Kt([v], d) : v = Kt(v, d), D = wr(v);
      } catch {
      }
      if (d.length < s._size.length) throw new br(d.length, s._size.length, "<");
      if (D.length < d.length) {
        for (var g = 0, E = 0; d[g] === 1 && D[g] === 1; ) g++;
        for (; d[g] === 1; ) E++, g++;
        v = ki(v, d.length, E, D);
      }
      if (!Fe(d, D)) throw new br(d, D, ">");
      var m = h.max().map(function(C) {
        return C + 1;
      });
      f(s, m, p), a(s._data, h, v);
    }
    return s;
  }
  function a(s, h, v) {
    var p = h.size().length - 1;
    d(s, v);
    function d(l, D) {
      var g = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, E = h.dimension(g);
      g < p ? E.forEach((m, C) => {
        qr(m, l.length), d(l[m], D[C[0]], g + 1);
      }) : E.forEach((m, C) => {
        qr(m, l.length), l[m] = D[C[0]];
      });
    }
  }
  t.prototype.resize = function(s, h, v) {
    if (!He(s)) throw new TypeError("Array or Matrix expected");
    var p = s.valueOf().map((l) => Array.isArray(l) && l.length === 1 ? l[0] : l), d = v ? this.clone() : this;
    return o(d, p, h);
  };
  function o(s, h, v) {
    if (h.length === 0) {
      for (var p = s._data; Pr(p); ) p = p[0];
      return p;
    }
    return s._size = h.slice(0), s._data = Dt(s._data, s._size, v), s;
  }
  t.prototype.reshape = function(s, h) {
    var v = h ? this.clone() : this;
    v._data = un(v._data, s);
    var p = v._size.reduce((d, l) => d * l);
    return v._size = an(s, p), v;
  };
  function f(s, h, v) {
    for (var p = s._size.slice(0), d = false; p.length < h.length; ) p.push(0), d = true;
    for (var l = 0, D = h.length; l < D; l++) h[l] > p[l] && (p[l] = h[l], d = true);
    d && o(s, p, v);
  }
  t.prototype.clone = function() {
    var s = new t({ data: Fr(this._data), size: Fr(this._size), datatype: this._datatype });
    return s;
  }, t.prototype.size = function() {
    return this._size.slice(0);
  }, t.prototype.map = function(s) {
    var h = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false, v = this, p = v._size.length - 1;
    if (p < 0) return v.clone();
    var d = gt(s, v, "map", h), l = d.fn, D = v.create(void 0, v._datatype);
    if (D._size = v._size, h || d.isUnary) return D._data = w(v._data), D;
    if (p === 0) {
      for (var g = v.valueOf(), E = Array(g.length), m = 0; m < g.length; m++) E[m] = l(g[m], [m], v);
      return D._data = E, D;
    }
    var C = [];
    return D._data = A(v._data), D;
    function A(_) {
      var F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, y = Array(_.length);
      if (F < p) for (var M = 0; M < _.length; M++) C[F] = M, y[M] = A(_[M], F + 1);
      else for (var B = 0; B < _.length; B++) C[F] = B, y[B] = l(_[B], C.slice(), v);
      return y;
    }
    function w(_) {
      var F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, y = Array(_.length);
      if (F < p) for (var M = 0; M < _.length; M++) y[M] = w(_[M], F + 1);
      else for (var B = 0; B < _.length; B++) y[B] = l(_[B]);
      return y;
    }
  }, t.prototype.forEach = function(s) {
    var h = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false, v = this, p = v._size.length - 1;
    if (p < 0) return;
    var d = gt(s, v, "map", h), l = d.fn;
    if (h || d.isUnary) {
      m(v._data);
      return;
    }
    if (p === 0) {
      for (var D = 0; D < v._data.length; D++) l(v._data[D], [D], v);
      return;
    }
    var g = [];
    E(v._data);
    function E(C) {
      var A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      if (A < p) for (var w = 0; w < C.length; w++) g[A] = w, E(C[w], A + 1);
      else for (var _ = 0; _ < C.length; _++) g[A] = _, l(C[_], g.slice(), v);
    }
    function m(C) {
      var A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      if (A < p) for (var w = 0; w < C.length; w++) m(C[w], A + 1);
      else for (var _ = 0; _ < C.length; _++) l(C[_]);
    }
  }, t.prototype[Symbol.iterator] = function* () {
    var s = this._size.length - 1;
    if (!(s < 0)) {
      if (s === 0) {
        for (var h = 0; h < this._data.length; h++) yield { value: this._data[h], index: [h] };
        return;
      }
      for (var v = Array(s + 1).fill(0), p = this._size.reduce((E, m) => E * m, 1), d = 0; d < p; d++) {
        for (var l = this._data, D = 0; D < s; D++) l = l[v[D]];
        yield { value: l[v[s]], index: v.slice() };
        for (var g = s; g >= 0 && (v[g]++, !(v[g] < this._size[g])); g--) v[g] = 0;
      }
    }
  }, t.prototype.rows = function() {
    var s = [], h = this.size();
    if (h.length !== 2) throw new TypeError("Rows can only be returned for a 2D matrix.");
    var v = this._data;
    for (var p of v) s.push(new t([p], this._datatype));
    return s;
  }, t.prototype.columns = function() {
    var s = this, h = [], v = this.size();
    if (v.length !== 2) throw new TypeError("Rows can only be returned for a 2D matrix.");
    for (var p = this._data, d = function(g) {
      var E = p.map((m) => [m[g]]);
      h.push(new t(E, s._datatype));
    }, l = 0; l < v[1]; l++) d(l);
    return h;
  }, t.prototype.toArray = function() {
    return Fr(this._data);
  }, t.prototype.valueOf = function() {
    return this._data;
  }, t.prototype.format = function(s) {
    return Or(this._data, s);
  }, t.prototype.toString = function() {
    return Or(this._data);
  }, t.prototype.toJSON = function() {
    return { mathjs: "DenseMatrix", data: this._data, size: this._size, datatype: this._datatype };
  }, t.prototype.diagonal = function(s) {
    if (s) {
      if (Rr(s) && (s = s.toNumber()), !xr(s) || !zr(s)) throw new TypeError("The parameter k must be an integer number");
    } else s = 0;
    for (var h = s > 0 ? s : 0, v = s < 0 ? -s : 0, p = this._size[0], d = this._size[1], l = Math.min(p - v, d - h), D = [], g = 0; g < l; g++) D[g] = this._data[g + v][g + h];
    return new t({ data: D, size: [l], datatype: this._datatype });
  }, t.diagonal = function(s, h, v, p) {
    if (!Pr(s)) throw new TypeError("Array expected, size parameter");
    if (s.length !== 2) throw new Error("Only two dimensions matrix are supported");
    if (s = s.map(function(_) {
      if (Rr(_) && (_ = _.toNumber()), !xr(_) || !zr(_) || _ < 1) throw new Error("Size values must be positive integers");
      return _;
    }), v) {
      if (Rr(v) && (v = v.toNumber()), !xr(v) || !zr(v)) throw new TypeError("The parameter k must be an integer number");
    } else v = 0;
    var d = v > 0 ? v : 0, l = v < 0 ? -v : 0, D = s[0], g = s[1], E = Math.min(D - l, g - d), m;
    if (Pr(h)) {
      if (h.length !== E) throw new Error("Invalid value array length");
      m = function(F) {
        return h[F];
      };
    } else if (_r(h)) {
      var C = h.size();
      if (C.length !== 1 || C[0] !== E) throw new Error("Invalid matrix length");
      m = function(F) {
        return h.get([F]);
      };
    } else m = function() {
      return h;
    };
    p || (p = Rr(m(0)) ? m(0).mul(0) : 0);
    var A = [];
    if (s.length > 0) {
      A = Dt(A, s, p);
      for (var w = 0; w < E; w++) A[w + l][w + d] = m(w);
    }
    return new t({ data: A, size: [D, g] });
  }, t.fromJSON = function(s) {
    return new t(s);
  }, t.prototype.swapRows = function(s, h) {
    if (!xr(s) || !zr(s) || !xr(h) || !zr(h)) throw new Error("Row index must be positive integers");
    if (this._size.length !== 2) throw new Error("Only two dimensional matrix is supported");
    return qr(s, this._size[0]), qr(h, this._size[0]), t._swapRows(s, h, this._data), this;
  }, t._swapRows = function(s, h, v) {
    var p = v[s];
    v[s] = v[h], v[h] = p;
  };
  function c(s) {
    return _r(s) ? c(s.valueOf()) : Pr(s) ? s.map(c) : s;
  }
  return t;
}, { isClass: true });
function Es(r) {
  var e = r.length, t = r[0].length, n, i, u = [];
  for (i = 0; i < t; i++) {
    var a = [];
    for (n = 0; n < e; n++) a.push(r[n][i]);
    u.push(a);
  }
  return u;
}
function Cs(r) {
  for (var e = 0; e < r.length; e++) if (He(r[e])) return true;
  return false;
}
function bs(r, e) {
  _r(r) ? r.forEach((t) => e(t), false, true) : ps(r, e, true);
}
function ne(r, e, t) {
  if (!t) return _r(r) ? r.map((i) => e(i), false, true) : On(r, e, true);
  var n = (i) => i === 0 ? i : e(i);
  return _r(r) ? r.map((i) => n(i), false, true) : On(r, n, true);
}
function _s(r, e, t) {
  var n = Array.isArray(r) ? wr(r) : r.size();
  if (e < 0 || e >= n.length) throw new be(e, n.length);
  return _r(r) ? r.create(yt(r.valueOf(), e, t), r.datatype()) : yt(r, e, t);
}
function yt(r, e, t) {
  var n, i, u, a;
  if (e <= 0) if (Array.isArray(r[0])) {
    for (a = Es(r), i = [], n = 0; n < a.length; n++) i[n] = yt(a[n], e - 1, t);
    return i;
  } else {
    for (u = r[0], n = 1; n < r.length; n++) u = t(u, r[n]);
    return u;
  }
  else {
    for (i = [], n = 0; n < r.length; n++) i[n] = yt(r[n], e - 1, t);
    return i;
  }
}
var Pn = "isInteger", Bs = ["typed"], Ms = er(Pn, Bs, (r) => {
  var { typed: e } = r;
  return e(Pn, { number: zr, BigNumber: function(n) {
    return n.isInt();
  }, bigint: function(n) {
    return true;
  }, Fraction: function(n) {
    return n.d === 1n;
  }, "Array | Matrix": e.referToSelf((t) => (n) => ne(n, t)) });
}), on = "number", Tt = "number, number";
function uu(r) {
  return Math.abs(r);
}
uu.signature = on;
function au(r, e) {
  return r + e;
}
au.signature = Tt;
function ou(r, e) {
  return r - e;
}
ou.signature = Tt;
function su(r, e) {
  return r * e;
}
su.signature = Tt;
function fu(r) {
  return -r;
}
fu.signature = on;
function Ht(r) {
  return Ua(r);
}
Ht.signature = on;
function cu(r, e) {
  return r * r < 1 && e === 1 / 0 || r * r > 1 && e === -1 / 0 ? 0 : Math.pow(r, e);
}
cu.signature = Tt;
var Ss = "number";
function lu(r) {
  return r > 0;
}
lu.signature = Ss;
function We(r, e) {
  var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1e-9, n = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
  if (t <= 0) throw new Error("Relative tolerance must be greater than 0");
  if (n < 0) throw new Error("Absolute tolerance must be at least 0");
  return r.isNaN() || e.isNaN() ? false : !r.isFinite() || !e.isFinite() ? r.eq(e) : r.eq(e) ? true : r.minus(e).abs().lte(r.constructor.max(r.constructor.max(r.abs(), e.abs()).mul(t), n));
}
var qn = "isPositive", Ns = ["typed", "config"], xs = er(qn, Ns, (r) => {
  var { typed: e, config: t } = r;
  return e(qn, { number: (n) => De(n, 0, t.relTol, t.absTol) ? false : lu(n), BigNumber: (n) => We(n, new n.constructor(0), t.relTol, t.absTol) ? false : !n.isNeg() && !n.isZero() && !n.isNaN(), bigint: (n) => n > 0n, Fraction: (n) => n.s > 0n && n.n > 0n, Unit: e.referToSelf((n) => (i) => e.find(n, i.valueType())(i.value)), "Array | Matrix": e.referToSelf((n) => (i) => ne(i, n)) });
}), Rn = "isZero", Ts = ["typed", "equalScalar"], zs = er(Rn, Ts, (r) => {
  var { typed: e, equalScalar: t } = r;
  return e(Rn, { "number | BigNumber | Complex | Fraction": (n) => t(n, 0), bigint: (n) => n === 0n, Unit: e.referToSelf((n) => (i) => e.find(n, i.valueType())(i.value)), "Array | Matrix": e.referToSelf((n) => (i) => ne(i, n)) });
});
function Is(r, e, t, n) {
  return De(r.re, e.re, t, n) && De(r.im, e.im, t, n);
}
var rt = er("compareUnits", ["typed"], (r) => {
  var { typed: e } = r;
  return { "Unit, Unit": e.referToSelf((t) => (n, i) => {
    if (!n.equalBase(i)) throw new Error("Cannot compare units with different base");
    return e.find(t, [n.valueType(), i.valueType()])(n.value, i.value);
  }) };
}), wt = "equalScalar", Os = ["typed", "config"], $s = er(wt, Os, (r) => {
  var { typed: e, config: t } = r, n = rt({ typed: e });
  return e(wt, { "boolean, boolean": function(u, a) {
    return u === a;
  }, "number, number": function(u, a) {
    return De(u, a, t.relTol, t.absTol);
  }, "BigNumber, BigNumber": function(u, a) {
    return u.eq(a) || We(u, a, t.relTol, t.absTol);
  }, "bigint, bigint": function(u, a) {
    return u === a;
  }, "Fraction, Fraction": function(u, a) {
    return u.equals(a);
  }, "Complex, Complex": function(u, a) {
    return Is(u, a, t.relTol, t.absTol);
  } }, n);
});
er(wt, ["typed", "config"], (r) => {
  var { typed: e, config: t } = r;
  return e(wt, { "number, number": function(i, u) {
    return De(i, u, t.relTol, t.absTol);
  } });
});
var Ps = "SparseMatrix", qs = ["typed", "equalScalar", "Matrix"], Rs = er(Ps, qs, (r) => {
  var { typed: e, equalScalar: t, Matrix: n } = r;
  function i(l, D) {
    if (!(this instanceof i)) throw new SyntaxError("Constructor must be called with the new operator");
    if (D && !ce(D)) throw new Error("Invalid datatype: " + D);
    if (_r(l)) u(this, l, D);
    else if (l && Pr(l.index) && Pr(l.ptr) && Pr(l.size)) this._values = l.values, this._index = l.index, this._ptr = l.ptr, this._size = l.size, this._datatype = D || l.datatype;
    else if (Pr(l)) a(this, l, D);
    else {
      if (l) throw new TypeError("Unsupported type of data (" + te(l) + ")");
      this._values = [], this._index = [], this._ptr = [0], this._size = [0, 0], this._datatype = D;
    }
  }
  function u(l, D, g) {
    D.type === "SparseMatrix" ? (l._values = D._values ? Fr(D._values) : void 0, l._index = Fr(D._index), l._ptr = Fr(D._ptr), l._size = Fr(D._size), l._datatype = g || D._datatype) : a(l, D.valueOf(), g || D._datatype);
  }
  function a(l, D, g) {
    l._values = [], l._index = [], l._ptr = [], l._datatype = g;
    var E = D.length, m = 0, C = t, A = 0;
    if (ce(g) && (C = e.find(t, [g, g]) || t, A = e.convert(0, g)), E > 0) {
      var w = 0;
      do {
        l._ptr.push(l._index.length);
        for (var _ = 0; _ < E; _++) {
          var F = D[_];
          if (Pr(F)) {
            if (w === 0 && m < F.length && (m = F.length), w < F.length) {
              var y = F[w];
              C(y, A) || (l._values.push(y), l._index.push(_));
            }
          } else w === 0 && m < 1 && (m = 1), C(F, A) || (l._values.push(F), l._index.push(_));
        }
        w++;
      } while (w < m);
    }
    l._ptr.push(l._index.length), l._size = [E, m];
  }
  i.prototype = new n(), i.prototype.createSparseMatrix = function(l, D) {
    return new i(l, D);
  }, Object.defineProperty(i, "name", { value: "SparseMatrix" }), i.prototype.constructor = i, i.prototype.type = "SparseMatrix", i.prototype.isSparseMatrix = true, i.prototype.getDataType = function() {
    return xt(this._values, te);
  }, i.prototype.storage = function() {
    return "sparse";
  }, i.prototype.datatype = function() {
    return this._datatype;
  }, i.prototype.create = function(l, D) {
    return new i(l, D);
  }, i.prototype.density = function() {
    var l = this._size[0], D = this._size[1];
    return l !== 0 && D !== 0 ? this._index.length / (l * D) : 0;
  }, i.prototype.subset = function(l, D, g) {
    if (!this._values) throw new Error("Cannot invoke subset on a Pattern only matrix");
    switch (arguments.length) {
      case 1:
        return o(this, l);
      case 2:
      case 3:
        return f(this, l, D, g);
      default:
        throw new SyntaxError("Wrong number of arguments");
    }
  };
  function o(l, D) {
    if (!rn(D)) throw new TypeError("Invalid index");
    var g = D.isScalar();
    if (g) return l.get(D.min());
    var E = D.size();
    if (E.length !== l._size.length) throw new br(E.length, l._size.length);
    var m, C, A, w, _ = D.min(), F = D.max();
    for (m = 0, C = l._size.length; m < C; m++) qr(_[m], l._size[m]), qr(F[m], l._size[m]);
    var y = l._values, M = l._index, B = l._ptr, S = D.dimension(0), O = D.dimension(1), x = [], $ = [];
    S.forEach(function(L, nr) {
      $[L] = nr[0], x[L] = true;
    });
    var T = y ? [] : void 0, Q = [], R = [];
    return O.forEach(function(L) {
      for (R.push(Q.length), A = B[L], w = B[L + 1]; A < w; A++) m = M[A], x[m] === true && (Q.push($[m]), T && T.push(y[A]));
    }), R.push(Q.length), new i({ values: T, index: Q, ptr: R, size: E, datatype: l._datatype });
  }
  function f(l, D, g, E) {
    if (!D || D.isIndex !== true) throw new TypeError("Invalid index");
    var m = D.size(), C = D.isScalar(), A;
    if (_r(g) ? (A = g.size(), g = g.toArray()) : A = wr(g), C) {
      if (A.length !== 0) throw new TypeError("Scalar expected");
      l.set(D.min(), g, E);
    } else {
      if (m.length !== 1 && m.length !== 2) throw new br(m.length, l._size.length, "<");
      if (A.length < m.length) {
        for (var w = 0, _ = 0; m[w] === 1 && A[w] === 1; ) w++;
        for (; m[w] === 1; ) _++, w++;
        g = ki(g, m.length, _, A);
      }
      if (!Fe(m, A)) throw new br(m, A, ">");
      if (m.length === 1) {
        var F = D.dimension(0);
        F.forEach(function(B, S) {
          qr(B), l.set([B, 0], g[S[0]], E);
        });
      } else {
        var y = D.dimension(0), M = D.dimension(1);
        y.forEach(function(B, S) {
          qr(B), M.forEach(function(O, x) {
            qr(O), l.set([B, O], g[S[0]][x[0]], E);
          });
        });
      }
    }
    return l;
  }
  i.prototype.get = function(l) {
    if (!Pr(l)) throw new TypeError("Array expected");
    if (l.length !== this._size.length) throw new br(l.length, this._size.length);
    if (!this._values) throw new Error("Cannot invoke get on a Pattern only matrix");
    var D = l[0], g = l[1];
    qr(D, this._size[0]), qr(g, this._size[1]);
    var E = c(D, this._ptr[g], this._ptr[g + 1], this._index);
    return E < this._ptr[g + 1] && this._index[E] === D ? this._values[E] : 0;
  }, i.prototype.set = function(l, D, g) {
    if (!Pr(l)) throw new TypeError("Array expected");
    if (l.length !== this._size.length) throw new br(l.length, this._size.length);
    if (!this._values) throw new Error("Cannot invoke set on a Pattern only matrix");
    var E = l[0], m = l[1], C = this._size[0], A = this._size[1], w = t, _ = 0;
    ce(this._datatype) && (w = e.find(t, [this._datatype, this._datatype]) || t, _ = e.convert(0, this._datatype)), (E > C - 1 || m > A - 1) && (v(this, Math.max(E + 1, C), Math.max(m + 1, A), g), C = this._size[0], A = this._size[1]), qr(E, C), qr(m, A);
    var F = c(E, this._ptr[m], this._ptr[m + 1], this._index);
    return F < this._ptr[m + 1] && this._index[F] === E ? w(D, _) ? s(F, m, this._values, this._index, this._ptr) : this._values[F] = D : w(D, _) || h(F, E, m, D, this._values, this._index, this._ptr), this;
  };
  function c(l, D, g, E) {
    if (g - D === 0) return g;
    for (var m = D; m < g; m++) if (E[m] === l) return m;
    return D;
  }
  function s(l, D, g, E, m) {
    g.splice(l, 1), E.splice(l, 1);
    for (var C = D + 1; C < m.length; C++) m[C]--;
  }
  function h(l, D, g, E, m, C, A) {
    m.splice(l, 0, E), C.splice(l, 0, D);
    for (var w = g + 1; w < A.length; w++) A[w]++;
  }
  i.prototype.resize = function(l, D, g) {
    if (!He(l)) throw new TypeError("Array or Matrix expected");
    var E = l.valueOf().map((C) => Array.isArray(C) && C.length === 1 ? C[0] : C);
    if (E.length !== 2) throw new Error("Only two dimensions matrix are supported");
    E.forEach(function(C) {
      if (!xr(C) || !zr(C) || C < 0) throw new TypeError("Invalid size, must contain positive integers (size: " + Or(E) + ")");
    });
    var m = g ? this.clone() : this;
    return v(m, E[0], E[1], D);
  };
  function v(l, D, g, E) {
    var m = E || 0, C = t, A = 0;
    ce(l._datatype) && (C = e.find(t, [l._datatype, l._datatype]) || t, A = e.convert(0, l._datatype), m = e.convert(m, l._datatype));
    var w = !C(m, A), _ = l._size[0], F = l._size[1], y, M, B;
    if (g > F) {
      for (M = F; M < g; M++) if (l._ptr[M] = l._values.length, w) for (y = 0; y < _; y++) l._values.push(m), l._index.push(y);
      l._ptr[g] = l._values.length;
    } else g < F && (l._ptr.splice(g + 1, F - g), l._values.splice(l._ptr[g], l._values.length), l._index.splice(l._ptr[g], l._index.length));
    if (F = g, D > _) {
      if (w) {
        var S = 0;
        for (M = 0; M < F; M++) {
          l._ptr[M] = l._ptr[M] + S, B = l._ptr[M + 1] + S;
          var O = 0;
          for (y = _; y < D; y++, O++) l._values.splice(B + O, 0, m), l._index.splice(B + O, 0, y), S++;
        }
        l._ptr[F] = l._values.length;
      }
    } else if (D < _) {
      var x = 0;
      for (M = 0; M < F; M++) {
        l._ptr[M] = l._ptr[M] - x;
        var $ = l._ptr[M], T = l._ptr[M + 1] - x;
        for (B = $; B < T; B++) y = l._index[B], y > D - 1 && (l._values.splice(B, 1), l._index.splice(B, 1), x++);
      }
      l._ptr[M] = l._values.length;
    }
    return l._size[0] = D, l._size[1] = g, l;
  }
  i.prototype.reshape = function(l, D) {
    if (!Pr(l)) throw new TypeError("Array expected");
    if (l.length !== 2) throw new Error("Sparse matrices can only be reshaped in two dimensions");
    l.forEach(function(L) {
      if (!xr(L) || !zr(L) || L <= -2 || L === 0) throw new TypeError("Invalid size, must contain positive integers or -1 (size: " + Or(l) + ")");
    });
    var g = this._size[0] * this._size[1];
    l = an(l, g);
    var E = l[0] * l[1];
    if (g !== E) throw new Error("Reshaping sparse matrix will result in the wrong number of elements");
    var m = D ? this.clone() : this;
    if (this._size[0] === l[0] && this._size[1] === l[1]) return m;
    for (var C = [], A = 0; A < m._ptr.length; A++) for (var w = 0; w < m._ptr[A + 1] - m._ptr[A]; w++) C.push(A);
    for (var _ = m._values.slice(), F = m._index.slice(), y = 0; y < m._index.length; y++) {
      var M = F[y], B = C[y], S = M * m._size[1] + B;
      C[y] = S % l[1], F[y] = Math.floor(S / l[1]);
    }
    m._values.length = 0, m._index.length = 0, m._ptr.length = l[1] + 1, m._size = l.slice();
    for (var O = 0; O < m._ptr.length; O++) m._ptr[O] = 0;
    for (var x = 0; x < _.length; x++) {
      var $ = F[x], T = C[x], Q = _[x], R = c($, m._ptr[T], m._ptr[T + 1], m._index);
      h(R, $, T, Q, m._values, m._index, m._ptr);
    }
    return m;
  }, i.prototype.clone = function() {
    var l = new i({ values: this._values ? Fr(this._values) : void 0, index: Fr(this._index), ptr: Fr(this._ptr), size: Fr(this._size), datatype: this._datatype });
    return l;
  }, i.prototype.size = function() {
    return this._size.slice(0);
  }, i.prototype.map = function(l, D) {
    if (!this._values) throw new Error("Cannot invoke map on a Pattern only matrix");
    var g = this, E = this._size[0], m = this._size[1], C = gt(l, g, "map"), A = function(_, F, y) {
      return C.fn(_, [F, y], g);
    };
    return p(this, 0, E - 1, 0, m - 1, A, D);
  };
  function p(l, D, g, E, m, C, A) {
    var w = [], _ = [], F = [], y = t, M = 0;
    ce(l._datatype) && (y = e.find(t, [l._datatype, l._datatype]) || t, M = e.convert(0, l._datatype));
    for (var B = function(Z, tr, ur) {
      var j = C(Z, tr, ur);
      y(j, M) || (w.push(j), _.push(tr));
    }, S = E; S <= m; S++) {
      F.push(w.length);
      var O = l._ptr[S], x = l._ptr[S + 1];
      if (A) for (var $ = O; $ < x; $++) {
        var T = l._index[$];
        T >= D && T <= g && B(l._values[$], T - D, S - E);
      }
      else {
        for (var Q = {}, R = O; R < x; R++) {
          var L = l._index[R];
          Q[L] = l._values[R];
        }
        for (var nr = D; nr <= g; nr++) {
          var ar = nr in Q ? Q[nr] : 0;
          B(ar, nr - D, S - E);
        }
      }
    }
    return F.push(w.length), new i({ values: w, index: _, ptr: F, size: [g - D + 1, m - E + 1] });
  }
  i.prototype.forEach = function(l, D) {
    if (!this._values) throw new Error("Cannot invoke forEach on a Pattern only matrix");
    for (var g = this, E = this._size[0], m = this._size[1], C = gt(l, g, "forEach"), A = 0; A < m; A++) {
      var w = this._ptr[A], _ = this._ptr[A + 1];
      if (D) for (var F = w; F < _; F++) {
        var y = this._index[F];
        C.fn(this._values[F], [y, A], g);
      }
      else {
        for (var M = {}, B = w; B < _; B++) {
          var S = this._index[B];
          M[S] = this._values[B];
        }
        for (var O = 0; O < E; O++) {
          var x = O in M ? M[O] : 0;
          C.fn(x, [O, A], g);
        }
      }
    }
  }, i.prototype[Symbol.iterator] = function* () {
    if (!this._values) throw new Error("Cannot iterate a Pattern only matrix");
    for (var l = this._size[1], D = 0; D < l; D++) for (var g = this._ptr[D], E = this._ptr[D + 1], m = g; m < E; m++) {
      var C = this._index[m];
      yield { value: this._values[m], index: [C, D] };
    }
  }, i.prototype.toArray = function() {
    return d(this._values, this._index, this._ptr, this._size, true);
  }, i.prototype.valueOf = function() {
    return d(this._values, this._index, this._ptr, this._size, false);
  };
  function d(l, D, g, E, m) {
    var C = E[0], A = E[1], w = [], _, F;
    for (_ = 0; _ < C; _++) for (w[_] = [], F = 0; F < A; F++) w[_][F] = 0;
    for (F = 0; F < A; F++) for (var y = g[F], M = g[F + 1], B = y; B < M; B++) _ = D[B], w[_][F] = l ? m ? Fr(l[B]) : l[B] : 1;
    return w;
  }
  return i.prototype.format = function(l) {
    for (var D = this._size[0], g = this._size[1], E = this.density(), m = "Sparse Matrix [" + Or(D, l) + " x " + Or(g, l) + "] density: " + Or(E, l) + `
`, C = 0; C < g; C++) for (var A = this._ptr[C], w = this._ptr[C + 1], _ = A; _ < w; _++) {
      var F = this._index[_];
      m += `
    (` + Or(F, l) + ", " + Or(C, l) + ") ==> " + (this._values ? Or(this._values[_], l) : "X");
    }
    return m;
  }, i.prototype.toString = function() {
    return Or(this.toArray());
  }, i.prototype.toJSON = function() {
    return { mathjs: "SparseMatrix", values: this._values, index: this._index, ptr: this._ptr, size: this._size, datatype: this._datatype };
  }, i.prototype.diagonal = function(l) {
    if (l) {
      if (Rr(l) && (l = l.toNumber()), !xr(l) || !zr(l)) throw new TypeError("The parameter k must be an integer number");
    } else l = 0;
    var D = l > 0 ? l : 0, g = l < 0 ? -l : 0, E = this._size[0], m = this._size[1], C = Math.min(E - g, m - D), A = [], w = [], _ = [];
    _[0] = 0;
    for (var F = D; F < m && A.length < C; F++) for (var y = this._ptr[F], M = this._ptr[F + 1], B = y; B < M; B++) {
      var S = this._index[B];
      if (S === F - D + g) {
        A.push(this._values[B]), w[A.length - 1] = S - g;
        break;
      }
    }
    return _.push(A.length), new i({ values: A, index: w, ptr: _, size: [C, 1] });
  }, i.fromJSON = function(l) {
    return new i(l);
  }, i.diagonal = function(l, D, g, E, m) {
    if (!Pr(l)) throw new TypeError("Array expected, size parameter");
    if (l.length !== 2) throw new Error("Only two dimensions matrix are supported");
    if (l = l.map(function(L) {
      if (Rr(L) && (L = L.toNumber()), !xr(L) || !zr(L) || L < 1) throw new Error("Size values must be positive integers");
      return L;
    }), g) {
      if (Rr(g) && (g = g.toNumber()), !xr(g) || !zr(g)) throw new TypeError("The parameter k must be an integer number");
    } else g = 0;
    var C = t, A = 0;
    ce(m) && (C = e.find(t, [m, m]) || t, A = e.convert(0, m));
    var w = g > 0 ? g : 0, _ = g < 0 ? -g : 0, F = l[0], y = l[1], M = Math.min(F - _, y - w), B;
    if (Pr(D)) {
      if (D.length !== M) throw new Error("Invalid value array length");
      B = function(nr) {
        return D[nr];
      };
    } else if (_r(D)) {
      var S = D.size();
      if (S.length !== 1 || S[0] !== M) throw new Error("Invalid matrix length");
      B = function(nr) {
        return D.get([nr]);
      };
    } else B = function() {
      return D;
    };
    for (var O = [], x = [], $ = [], T = 0; T < y; T++) {
      $.push(O.length);
      var Q = T - w;
      if (Q >= 0 && Q < M) {
        var R = B(Q);
        C(R, A) || (x.push(Q + _), O.push(R));
      }
    }
    return $.push(O.length), new i({ values: O, index: x, ptr: $, size: [F, y] });
  }, i.prototype.swapRows = function(l, D) {
    if (!xr(l) || !zr(l) || !xr(D) || !zr(D)) throw new Error("Row index must be positive integers");
    if (this._size.length !== 2) throw new Error("Only two dimensional matrix is supported");
    return qr(l, this._size[0]), qr(D, this._size[0]), i._swapRows(l, D, this._size[1], this._values, this._index, this._ptr), this;
  }, i._forEachRow = function(l, D, g, E, m) {
    for (var C = E[l], A = E[l + 1], w = C; w < A; w++) m(g[w], D[w]);
  }, i._swapRows = function(l, D, g, E, m, C) {
    for (var A = 0; A < g; A++) {
      var w = C[A], _ = C[A + 1], F = c(l, w, _, m), y = c(D, w, _, m);
      if (F < _ && y < _ && m[F] === l && m[y] === D) {
        if (E) {
          var M = E[F];
          E[F] = E[y], E[y] = M;
        }
        continue;
      }
      if (F < _ && m[F] === l && (y >= _ || m[y] !== D)) {
        var B = E ? E[F] : void 0;
        m.splice(y, 0, D), E && E.splice(y, 0, B), m.splice(y <= F ? F + 1 : F, 1), E && E.splice(y <= F ? F + 1 : F, 1);
        continue;
      }
      if (y < _ && m[y] === D && (F >= _ || m[F] !== l)) {
        var S = E ? E[y] : void 0;
        m.splice(F, 0, l), E && E.splice(F, 0, S), m.splice(F <= y ? y + 1 : y, 1), E && E.splice(F <= y ? y + 1 : y, 1);
      }
    }
  }, i;
}, { isClass: true }), Us = "number", Ls = ["typed"];
function Zs(r) {
  var e = r.match(/(0[box])([0-9a-fA-F]*)\.([0-9a-fA-F]*)/);
  if (e) {
    var t = { "0b": 2, "0o": 8, "0x": 16 }[e[1]], n = e[2], i = e[3];
    return { input: r, radix: t, integerPart: n, fractionalPart: i };
  } else return null;
}
function Vs(r) {
  for (var e = parseInt(r.integerPart, r.radix), t = 0, n = 0; n < r.fractionalPart.length; n++) {
    var i = parseInt(r.fractionalPart[n], r.radix);
    t += i / Math.pow(r.radix, n + 1);
  }
  var u = e + t;
  if (isNaN(u)) throw new SyntaxError('String "' + r.input + '" is not a valid number');
  return u;
}
var Ws = er(Us, Ls, (r) => {
  var { typed: e } = r, t = e("number", { "": function() {
    return 0;
  }, number: function(i) {
    return i;
  }, string: function(i) {
    if (i === "NaN") return NaN;
    var u = Zs(i);
    if (u) return Vs(u);
    var a = 0, o = i.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
    o && (a = Number(o[2]), i = o[1]);
    var f = Number(i);
    if (isNaN(f)) throw new SyntaxError('String "' + i + '" is not a valid number');
    if (o) {
      if (f > 2 ** a - 1) throw new SyntaxError('String "'.concat(i, '" is out of range'));
      f >= 2 ** (a - 1) && (f = f - 2 ** a);
    }
    return f;
  }, BigNumber: function(i) {
    return i.toNumber();
  }, bigint: function(i) {
    return Number(i);
  }, Fraction: function(i) {
    return i.valueOf();
  }, Unit: e.referToSelf((n) => (i) => {
    var u = i.clone();
    return u.value = n(i.value), u;
  }), null: function(i) {
    return 0;
  }, "Unit, string | Unit": function(i, u) {
    return i.toNumber(u);
  }, "Array | Matrix": e.referToSelf((n) => (i) => ne(i, n)) });
  return t.fromJSON = function(n) {
    return parseFloat(n.value);
  }, t;
}), Js = "bignumber", Ys = ["typed", "BigNumber"], Qs = er(Js, Ys, (r) => {
  var { typed: e, BigNumber: t } = r;
  return e("bignumber", { "": function() {
    return new t(0);
  }, number: function(i) {
    return new t(i + "");
  }, string: function(i) {
    var u = i.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
    if (u) {
      var a = u[2], o = t(u[1]), f = new t(2).pow(Number(a));
      if (o.gt(f.sub(1))) throw new SyntaxError('String "'.concat(i, '" is out of range'));
      var c = new t(2).pow(Number(a) - 1);
      return o.gte(c) ? o.sub(f) : o;
    }
    return new t(i);
  }, BigNumber: function(i) {
    return i;
  }, bigint: function(i) {
    return new t(i.toString());
  }, Unit: e.referToSelf((n) => (i) => {
    var u = i.clone();
    return u.value = n(i.value), u;
  }), Fraction: function(i) {
    return new t(String(i.n)).div(String(i.d)).times(String(i.s));
  }, null: function(i) {
    return new t(0);
  }, "Array | Matrix": e.referToSelf((n) => (i) => ne(i, n)) });
}), Xs = "complex", Gs = ["typed", "Complex"], Ks = er(Xs, Gs, (r) => {
  var { typed: e, Complex: t } = r;
  return e("complex", { "": function() {
    return t.ZERO;
  }, number: function(i) {
    return new t(i, 0);
  }, "number, number": function(i, u) {
    return new t(i, u);
  }, "BigNumber, BigNumber": function(i, u) {
    return new t(i.toNumber(), u.toNumber());
  }, Fraction: function(i) {
    return new t(i.valueOf(), 0);
  }, Complex: function(i) {
    return i.clone();
  }, string: function(i) {
    return t(i);
  }, null: function(i) {
    return t(0);
  }, Object: function(i) {
    if ("re" in i && "im" in i) return new t(i.re, i.im);
    if ("r" in i && "phi" in i || "abs" in i && "arg" in i) return new t(i);
    throw new Error("Expected object with properties (re and im) or (r and phi) or (abs and arg)");
  }, "Array | Matrix": e.referToSelf((n) => (i) => ne(i, n)) });
}), Hs = "fraction", ks = ["typed", "Fraction"], js = er(Hs, ks, (r) => {
  var { typed: e, Fraction: t } = r;
  return e("fraction", { number: function(i) {
    if (!isFinite(i) || isNaN(i)) throw new Error(i + " cannot be represented as a fraction");
    return new t(i);
  }, string: function(i) {
    return new t(i);
  }, "number, number": function(i, u) {
    return new t(i, u);
  }, "bigint, bigint": function(i, u) {
    return new t(i, u);
  }, null: function(i) {
    return new t(0);
  }, BigNumber: function(i) {
    return new t(i.toString());
  }, bigint: function(i) {
    return new t(i.toString());
  }, Fraction: function(i) {
    return i;
  }, Unit: e.referToSelf((n) => (i) => {
    var u = i.clone();
    return u.value = n(i.value), u;
  }), Object: function(i) {
    return new t(i);
  }, "Array | Matrix": e.referToSelf((n) => (i) => ne(i, n)) });
}), Un = "matrix", rf = ["typed", "Matrix", "DenseMatrix", "SparseMatrix"], ef = er(Un, rf, (r) => {
  var { typed: e, Matrix: t, DenseMatrix: n, SparseMatrix: i } = r;
  return e(Un, { "": function() {
    return u([]);
  }, string: function(o) {
    return u([], o);
  }, "string, string": function(o, f) {
    return u([], o, f);
  }, Array: function(o) {
    return u(o);
  }, Matrix: function(o) {
    return u(o, o.storage());
  }, "Array | Matrix, string": u, "Array | Matrix, string, string": u });
  function u(a, o, f) {
    if (o === "dense" || o === "default" || o === void 0) return new n(a, f);
    if (o === "sparse") return new i(a, f);
    throw new TypeError("Unknown matrix type " + JSON.stringify(o) + ".");
  }
}), Ln = "matrixFromColumns", tf = ["typed", "matrix", "flatten", "size"], nf = er(Ln, tf, (r) => {
  var { typed: e, matrix: t, flatten: n, size: i } = r;
  return e(Ln, { "...Array": function(f) {
    return u(f);
  }, "...Matrix": function(f) {
    return t(u(f.map((c) => c.toArray())));
  } });
  function u(o) {
    if (o.length === 0) throw new TypeError("At least one column is needed to construct a matrix.");
    for (var f = a(o[0]), c = [], s = 0; s < f; s++) c[s] = [];
    for (var h of o) {
      var v = a(h);
      if (v !== f) throw new TypeError("The vectors had different length: " + (f | 0) + " \u2260 " + (v | 0));
      for (var p = n(h), d = 0; d < f; d++) c[d].push(p[d]);
    }
    return c;
  }
  function a(o) {
    var f = i(o);
    if (f.length === 1) return f[0];
    if (f.length === 2) {
      if (f[0] === 1) return f[1];
      if (f[1] === 1) return f[0];
      throw new TypeError("At least one of the arguments is not a vector.");
    } else throw new TypeError("Only one- or two-dimensional vectors are supported.");
  }
}), Zn = "unaryMinus", uf = ["typed"], af = er(Zn, uf, (r) => {
  var { typed: e } = r;
  return e(Zn, { number: fu, "Complex | BigNumber | Fraction": (t) => t.neg(), bigint: (t) => -t, Unit: e.referToSelf((t) => (n) => {
    var i = n.clone();
    return i.value = e.find(t, i.valueType())(n.value), i;
  }), "Array | Matrix": e.referToSelf((t) => (n) => ne(n, t, true)) });
}), Vn = "abs", of = ["typed"], sf = er(Vn, of, (r) => {
  var { typed: e } = r;
  return e(Vn, { number: uu, "Complex | BigNumber | Fraction | Unit": (t) => t.abs(), bigint: (t) => t < 0n ? -t : t, "Array | Matrix": e.referToSelf((t) => (n) => ne(n, t, true)) });
}), Wn = "addScalar", ff = ["typed"], cf = er(Wn, ff, (r) => {
  var { typed: e } = r;
  return e(Wn, { "number, number": au, "Complex, Complex": function(n, i) {
    return n.add(i);
  }, "BigNumber, BigNumber": function(n, i) {
    return n.plus(i);
  }, "bigint, bigint": function(n, i) {
    return n + i;
  }, "Fraction, Fraction": function(n, i) {
    return n.add(i);
  }, "Unit, Unit": e.referToSelf((t) => (n, i) => {
    if (n.value === null || n.value === void 0) throw new Error("Parameter x contains a unit with undefined value");
    if (i.value === null || i.value === void 0) throw new Error("Parameter y contains a unit with undefined value");
    if (!n.equalBase(i)) throw new Error("Units do not match");
    var u = n.clone();
    return u.value = e.find(t, [u.valueType(), i.valueType()])(u.value, i.value), u.fixPrefix = false, u;
  }) });
}), Jn = "subtractScalar", lf = ["typed"], hf = er(Jn, lf, (r) => {
  var { typed: e } = r;
  return e(Jn, { "number, number": ou, "Complex, Complex": function(n, i) {
    return n.sub(i);
  }, "BigNumber, BigNumber": function(n, i) {
    return n.minus(i);
  }, "bigint, bigint": function(n, i) {
    return n - i;
  }, "Fraction, Fraction": function(n, i) {
    return n.sub(i);
  }, "Unit, Unit": e.referToSelf((t) => (n, i) => {
    if (n.value === null || n.value === void 0) throw new Error("Parameter x contains a unit with undefined value");
    if (i.value === null || i.value === void 0) throw new Error("Parameter y contains a unit with undefined value");
    if (!n.equalBase(i)) throw new Error("Units do not match");
    var u = n.clone();
    return u.value = e.find(t, [u.valueType(), i.valueType()])(u.value, i.value), u.fixPrefix = false, u;
  }) });
}), vf = "matAlgo11xS0s", pf = ["typed", "equalScalar"], hu = er(vf, pf, (r) => {
  var { typed: e, equalScalar: t } = r;
  return function(i, u, a, o) {
    var f = i._values, c = i._index, s = i._ptr, h = i._size, v = i._datatype;
    if (!f) throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
    var p = h[0], d = h[1], l, D = t, g = 0, E = a;
    typeof v == "string" && (l = v, D = e.find(t, [l, l]), g = e.convert(0, l), u = e.convert(u, l), E = e.find(a, [l, l]));
    for (var m = [], C = [], A = [], w = 0; w < d; w++) {
      A[w] = C.length;
      for (var _ = s[w], F = s[w + 1], y = _; y < F; y++) {
        var M = c[y], B = o ? E(u, f[y]) : E(f[y], u);
        D(B, g) || (C.push(M), m.push(B));
      }
    }
    return A[d] = C.length, i.createSparseMatrix({ values: m, index: C, ptr: A, size: [p, d], datatype: l });
  };
}), df = "matAlgo12xSfs", mf = ["typed", "DenseMatrix"], Je = er(df, mf, (r) => {
  var { typed: e, DenseMatrix: t } = r;
  return function(i, u, a, o) {
    var f = i._values, c = i._index, s = i._ptr, h = i._size, v = i._datatype;
    if (!f) throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
    var p = h[0], d = h[1], l, D = a;
    typeof v == "string" && (l = v, u = e.convert(u, l), D = e.find(a, [l, l]));
    for (var g = [], E = [], m = [], C = 0; C < d; C++) {
      for (var A = C + 1, w = s[C], _ = s[C + 1], F = w; F < _; F++) {
        var y = c[F];
        E[y] = f[F], m[y] = A;
      }
      for (var M = 0; M < p; M++) C === 0 && (g[M] = []), m[M] === A ? g[M][C] = o ? D(u, E[M]) : D(E[M], u) : g[M][C] = o ? D(u, 0) : D(0, u);
    }
    return new t({ data: g, size: [p, d], datatype: l });
  };
}), Df = "matAlgo14xDs", gf = ["typed"], sn = er(Df, gf, (r) => {
  var { typed: e } = r;
  return function(i, u, a, o) {
    var f = i._data, c = i._size, s = i._datatype, h, v = a;
    typeof s == "string" && (h = s, u = e.convert(u, h), v = e.find(a, [h, h]));
    var p = c.length > 0 ? t(v, 0, c, c[0], f, u, o) : [];
    return i.createDenseMatrix({ data: p, size: Fr(c), datatype: h });
  };
  function t(n, i, u, a, o, f, c) {
    var s = [];
    if (i === u.length - 1) for (var h = 0; h < a; h++) s[h] = c ? n(f, o[h]) : n(o[h], f);
    else for (var v = 0; v < a; v++) s[v] = t(n, i + 1, u, u[i + 1], o[v], f, c);
    return s;
  }
}), yf = "matAlgo03xDSf", wf = ["typed"], Ye = er(yf, wf, (r) => {
  var { typed: e } = r;
  return function(n, i, u, a) {
    var o = n._data, f = n._size, c = n._datatype || n.getDataType(), s = i._values, h = i._index, v = i._ptr, p = i._size, d = i._datatype || i._data === void 0 ? i._datatype : i.getDataType();
    if (f.length !== p.length) throw new br(f.length, p.length);
    if (f[0] !== p[0] || f[1] !== p[1]) throw new RangeError("Dimension mismatch. Matrix A (" + f + ") must match Matrix B (" + p + ")");
    if (!s) throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
    var l = f[0], D = f[1], g, E = 0, m = u;
    typeof c == "string" && c === d && c !== "mixed" && (g = c, E = e.convert(0, g), m = e.find(u, [g, g]));
    for (var C = [], A = 0; A < l; A++) C[A] = [];
    for (var w = [], _ = [], F = 0; F < D; F++) {
      for (var y = F + 1, M = v[F], B = v[F + 1], S = M; S < B; S++) {
        var O = h[S];
        w[O] = a ? m(s[S], o[O][F]) : m(o[O][F], s[S]), _[O] = y;
      }
      for (var x = 0; x < l; x++) _[x] === y ? C[x][F] = w[x] : C[x][F] = a ? m(E, o[x][F]) : m(o[x][F], E);
    }
    return n.createDenseMatrix({ data: C, size: [l, D], datatype: c === n._datatype && d === i._datatype ? g : void 0 });
  };
}), Af = "matAlgo05xSfSf", Ff = ["typed", "equalScalar"], Ef = er(Af, Ff, (r) => {
  var { typed: e, equalScalar: t } = r;
  return function(i, u, a) {
    var o = i._values, f = i._index, c = i._ptr, s = i._size, h = i._datatype || i._data === void 0 ? i._datatype : i.getDataType(), v = u._values, p = u._index, d = u._ptr, l = u._size, D = u._datatype || u._data === void 0 ? u._datatype : u.getDataType();
    if (s.length !== l.length) throw new br(s.length, l.length);
    if (s[0] !== l[0] || s[1] !== l[1]) throw new RangeError("Dimension mismatch. Matrix A (" + s + ") must match Matrix B (" + l + ")");
    var g = s[0], E = s[1], m, C = t, A = 0, w = a;
    typeof h == "string" && h === D && h !== "mixed" && (m = h, C = e.find(t, [m, m]), A = e.convert(0, m), w = e.find(a, [m, m]));
    var _ = o && v ? [] : void 0, F = [], y = [], M = _ ? [] : void 0, B = _ ? [] : void 0, S = [], O = [], x, $, T, Q;
    for ($ = 0; $ < E; $++) {
      y[$] = F.length;
      var R = $ + 1;
      for (T = c[$], Q = c[$ + 1]; T < Q; T++) x = f[T], F.push(x), S[x] = R, M && (M[x] = o[T]);
      for (T = d[$], Q = d[$ + 1]; T < Q; T++) x = p[T], S[x] !== R && F.push(x), O[x] = R, B && (B[x] = v[T]);
      if (_) for (T = y[$]; T < F.length; ) {
        x = F[T];
        var L = S[x], nr = O[x];
        if (L === R || nr === R) {
          var ar = L === R ? M[x] : A, U = nr === R ? B[x] : A, Z = w(ar, U);
          C(Z, A) ? F.splice(T, 1) : (_.push(Z), T++);
        }
      }
    }
    return y[E] = F.length, i.createSparseMatrix({ values: _, index: F, ptr: y, size: [g, E], datatype: h === i._datatype && D === u._datatype ? m : void 0 });
  };
}), Cf = "matAlgo13xDD", bf = ["typed"], _f = er(Cf, bf, (r) => {
  var { typed: e } = r;
  return function(i, u, a) {
    var o = i._data, f = i._size, c = i._datatype, s = u._data, h = u._size, v = u._datatype, p = [];
    if (f.length !== h.length) throw new br(f.length, h.length);
    for (var d = 0; d < f.length; d++) {
      if (f[d] !== h[d]) throw new RangeError("Dimension mismatch. Matrix A (" + f + ") must match Matrix B (" + h + ")");
      p[d] = f[d];
    }
    var l, D = a;
    typeof c == "string" && c === v && (l = c, D = e.find(a, [l, l]));
    var g = p.length > 0 ? t(D, 0, p, p[0], o, s) : [];
    return i.createDenseMatrix({ data: g, size: p, datatype: l });
  };
  function t(n, i, u, a, o, f) {
    var c = [];
    if (i === u.length - 1) for (var s = 0; s < a; s++) c[s] = n(o[s], f[s]);
    else for (var h = 0; h < a; h++) c[h] = t(n, i + 1, u, u[i + 1], o[h], f[h]);
    return c;
  }
});
function Zr(r, e) {
  if (Fe(r.size(), e.size())) return [r, e];
  var t = tu(r.size(), e.size());
  return [r, e].map((n) => Bf(n, t));
}
function Bf(r, e) {
  return Fe(r.size(), e) ? r : r.create(Kt(r.valueOf(), e), r.datatype());
}
var Mf = "matrixAlgorithmSuite", Sf = ["typed", "matrix"], Me = er(Mf, Sf, (r) => {
  var { typed: e, matrix: t } = r, n = _f({ typed: e }), i = sn({ typed: e });
  return function(a) {
    var o = a.elop, f = a.SD || a.DS, c;
    o ? (c = { "DenseMatrix, DenseMatrix": (p, d) => n(...Zr(p, d), o), "Array, Array": (p, d) => n(...Zr(t(p), t(d)), o).valueOf(), "Array, DenseMatrix": (p, d) => n(...Zr(t(p), d), o), "DenseMatrix, Array": (p, d) => n(...Zr(p, t(d)), o) }, a.SS && (c["SparseMatrix, SparseMatrix"] = (p, d) => a.SS(...Zr(p, d), o, false)), a.DS && (c["DenseMatrix, SparseMatrix"] = (p, d) => a.DS(...Zr(p, d), o, false), c["Array, SparseMatrix"] = (p, d) => a.DS(...Zr(t(p), d), o, false)), f && (c["SparseMatrix, DenseMatrix"] = (p, d) => f(...Zr(d, p), o, true), c["SparseMatrix, Array"] = (p, d) => f(...Zr(t(d), p), o, true))) : (c = { "DenseMatrix, DenseMatrix": e.referToSelf((p) => (d, l) => n(...Zr(d, l), p)), "Array, Array": e.referToSelf((p) => (d, l) => n(...Zr(t(d), t(l)), p).valueOf()), "Array, DenseMatrix": e.referToSelf((p) => (d, l) => n(...Zr(t(d), l), p)), "DenseMatrix, Array": e.referToSelf((p) => (d, l) => n(...Zr(d, t(l)), p)) }, a.SS && (c["SparseMatrix, SparseMatrix"] = e.referToSelf((p) => (d, l) => a.SS(...Zr(d, l), p, false))), a.DS && (c["DenseMatrix, SparseMatrix"] = e.referToSelf((p) => (d, l) => a.DS(...Zr(d, l), p, false)), c["Array, SparseMatrix"] = e.referToSelf((p) => (d, l) => a.DS(...Zr(t(d), l), p, false))), f && (c["SparseMatrix, DenseMatrix"] = e.referToSelf((p) => (d, l) => f(...Zr(l, d), p, true)), c["SparseMatrix, Array"] = e.referToSelf((p) => (d, l) => f(...Zr(t(l), d), p, true))));
    var s = a.scalar || "any", h = a.Ds || a.Ss;
    h && (o ? (c["DenseMatrix," + s] = (p, d) => i(p, d, o, false), c[s + ", DenseMatrix"] = (p, d) => i(d, p, o, true), c["Array," + s] = (p, d) => i(t(p), d, o, false).valueOf(), c[s + ", Array"] = (p, d) => i(t(d), p, o, true).valueOf()) : (c["DenseMatrix," + s] = e.referToSelf((p) => (d, l) => i(d, l, p, false)), c[s + ", DenseMatrix"] = e.referToSelf((p) => (d, l) => i(l, d, p, true)), c["Array," + s] = e.referToSelf((p) => (d, l) => i(t(d), l, p, false).valueOf()), c[s + ", Array"] = e.referToSelf((p) => (d, l) => i(t(l), d, p, true).valueOf())));
    var v = a.sS !== void 0 ? a.sS : a.Ss;
    return o ? (a.Ss && (c["SparseMatrix," + s] = (p, d) => a.Ss(p, d, o, false)), v && (c[s + ", SparseMatrix"] = (p, d) => v(d, p, o, true))) : (a.Ss && (c["SparseMatrix," + s] = e.referToSelf((p) => (d, l) => a.Ss(d, l, p, false))), v && (c[s + ", SparseMatrix"] = e.referToSelf((p) => (d, l) => v(l, d, p, true)))), o && o.signatures && Ti(c, o.signatures), c;
  };
}), Nf = "matAlgo01xDSid", xf = ["typed"], vu = er(Nf, xf, (r) => {
  var { typed: e } = r;
  return function(n, i, u, a) {
    var o = n._data, f = n._size, c = n._datatype || n.getDataType(), s = i._values, h = i._index, v = i._ptr, p = i._size, d = i._datatype || i._data === void 0 ? i._datatype : i.getDataType();
    if (f.length !== p.length) throw new br(f.length, p.length);
    if (f[0] !== p[0] || f[1] !== p[1]) throw new RangeError("Dimension mismatch. Matrix A (" + f + ") must match Matrix B (" + p + ")");
    if (!s) throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
    var l = f[0], D = f[1], g = typeof c == "string" && c !== "mixed" && c === d ? c : void 0, E = g ? e.find(u, [g, g]) : u, m, C, A = [];
    for (m = 0; m < l; m++) A[m] = [];
    var w = [], _ = [];
    for (C = 0; C < D; C++) {
      for (var F = C + 1, y = v[C], M = v[C + 1], B = y; B < M; B++) m = h[B], w[m] = a ? E(s[B], o[m][C]) : E(o[m][C], s[B]), _[m] = F;
      for (m = 0; m < l; m++) _[m] === F ? A[m][C] = w[m] : A[m][C] = o[m][C];
    }
    return n.createDenseMatrix({ data: A, size: [l, D], datatype: c === n._datatype && d === i._datatype ? g : void 0 });
  };
}), Tf = "matAlgo04xSidSid", zf = ["typed", "equalScalar"], If = er(Tf, zf, (r) => {
  var { typed: e, equalScalar: t } = r;
  return function(i, u, a) {
    var o = i._values, f = i._index, c = i._ptr, s = i._size, h = i._datatype || i._data === void 0 ? i._datatype : i.getDataType(), v = u._values, p = u._index, d = u._ptr, l = u._size, D = u._datatype || u._data === void 0 ? u._datatype : u.getDataType();
    if (s.length !== l.length) throw new br(s.length, l.length);
    if (s[0] !== l[0] || s[1] !== l[1]) throw new RangeError("Dimension mismatch. Matrix A (" + s + ") must match Matrix B (" + l + ")");
    var g = s[0], E = s[1], m, C = t, A = 0, w = a;
    typeof h == "string" && h === D && h !== "mixed" && (m = h, C = e.find(t, [m, m]), A = e.convert(0, m), w = e.find(a, [m, m]));
    var _ = o && v ? [] : void 0, F = [], y = [], M = o && v ? [] : void 0, B = o && v ? [] : void 0, S = [], O = [], x, $, T, Q, R;
    for ($ = 0; $ < E; $++) {
      y[$] = F.length;
      var L = $ + 1;
      for (Q = c[$], R = c[$ + 1], T = Q; T < R; T++) x = f[T], F.push(x), S[x] = L, M && (M[x] = o[T]);
      for (Q = d[$], R = d[$ + 1], T = Q; T < R; T++) if (x = p[T], S[x] === L) {
        if (M) {
          var nr = w(M[x], v[T]);
          C(nr, A) ? S[x] = null : M[x] = nr;
        }
      } else F.push(x), O[x] = L, B && (B[x] = v[T]);
      if (M && B) for (T = y[$]; T < F.length; ) x = F[T], S[x] === L ? (_[T] = M[x], T++) : O[x] === L ? (_[T] = B[x], T++) : F.splice(T, 1);
    }
    return y[E] = F.length, i.createSparseMatrix({ values: _, index: F, ptr: y, size: [g, E], datatype: h === i._datatype && D === u._datatype ? m : void 0 });
  };
}), Of = "matAlgo10xSids", $f = ["typed", "DenseMatrix"], pu = er(Of, $f, (r) => {
  var { typed: e, DenseMatrix: t } = r;
  return function(i, u, a, o) {
    var f = i._values, c = i._index, s = i._ptr, h = i._size, v = i._datatype;
    if (!f) throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
    var p = h[0], d = h[1], l, D = a;
    typeof v == "string" && (l = v, u = e.convert(u, l), D = e.find(a, [l, l]));
    for (var g = [], E = [], m = [], C = 0; C < d; C++) {
      for (var A = C + 1, w = s[C], _ = s[C + 1], F = w; F < _; F++) {
        var y = c[F];
        E[y] = f[F], m[y] = A;
      }
      for (var M = 0; M < p; M++) C === 0 && (g[M] = []), m[M] === A ? g[M][C] = o ? D(u, E[M]) : D(E[M], u) : g[M][C] = u;
    }
    return new t({ data: g, size: [p, d], datatype: l });
  };
}), Pf = "multiplyScalar", qf = ["typed"], Rf = er(Pf, qf, (r) => {
  var { typed: e } = r;
  return e("multiplyScalar", { "number, number": su, "Complex, Complex": function(n, i) {
    return n.mul(i);
  }, "BigNumber, BigNumber": function(n, i) {
    return n.times(i);
  }, "bigint, bigint": function(n, i) {
    return n * i;
  }, "Fraction, Fraction": function(n, i) {
    return n.mul(i);
  }, "number | Fraction | BigNumber | Complex, Unit": (t, n) => n.multiply(t), "Unit, number | Fraction | BigNumber | Complex | Unit": (t, n) => t.multiply(n) });
}), Yn = "multiply", Uf = ["typed", "matrix", "addScalar", "multiplyScalar", "equalScalar", "dot"], Lf = er(Yn, Uf, (r) => {
  var { typed: e, matrix: t, addScalar: n, multiplyScalar: i, equalScalar: u, dot: a } = r, o = hu({ typed: e, equalScalar: u }), f = sn({ typed: e });
  function c(A, w) {
    switch (A.length) {
      case 1:
        switch (w.length) {
          case 1:
            if (A[0] !== w[0]) throw new RangeError("Dimension mismatch in multiplication. Vectors must have the same length");
            break;
          case 2:
            if (A[0] !== w[0]) throw new RangeError("Dimension mismatch in multiplication. Vector length (" + A[0] + ") must match Matrix rows (" + w[0] + ")");
            break;
          default:
            throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + w.length + " dimensions)");
        }
        break;
      case 2:
        switch (w.length) {
          case 1:
            if (A[1] !== w[0]) throw new RangeError("Dimension mismatch in multiplication. Matrix columns (" + A[1] + ") must match Vector length (" + w[0] + ")");
            break;
          case 2:
            if (A[1] !== w[0]) throw new RangeError("Dimension mismatch in multiplication. Matrix A columns (" + A[1] + ") must match Matrix B rows (" + w[0] + ")");
            break;
          default:
            throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + w.length + " dimensions)");
        }
        break;
      default:
        throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix A has " + A.length + " dimensions)");
    }
  }
  function s(A, w, _) {
    if (_ === 0) throw new Error("Cannot multiply two empty vectors");
    return a(A, w);
  }
  function h(A, w) {
    if (w.storage() !== "dense") throw new Error("Support for SparseMatrix not implemented");
    return v(A, w);
  }
  function v(A, w) {
    var _ = A._data, F = A._size, y = A._datatype || A.getDataType(), M = w._data, B = w._size, S = w._datatype || w.getDataType(), O = F[0], x = B[1], $, T = n, Q = i;
    y && S && y === S && typeof y == "string" && y !== "mixed" && ($ = y, T = e.find(n, [$, $]), Q = e.find(i, [$, $]));
    for (var R = [], L = 0; L < x; L++) {
      for (var nr = Q(_[0], M[0][L]), ar = 1; ar < O; ar++) nr = T(nr, Q(_[ar], M[ar][L]));
      R[L] = nr;
    }
    return A.createDenseMatrix({ data: R, size: [x], datatype: y === A._datatype && S === w._datatype ? $ : void 0 });
  }
  var p = e("_multiplyMatrixVector", { "DenseMatrix, any": l, "SparseMatrix, any": E }), d = e("_multiplyMatrixMatrix", { "DenseMatrix, DenseMatrix": D, "DenseMatrix, SparseMatrix": g, "SparseMatrix, DenseMatrix": m, "SparseMatrix, SparseMatrix": C });
  function l(A, w) {
    var _ = A._data, F = A._size, y = A._datatype || A.getDataType(), M = w._data, B = w._datatype || w.getDataType(), S = F[0], O = F[1], x, $ = n, T = i;
    y && B && y === B && typeof y == "string" && y !== "mixed" && (x = y, $ = e.find(n, [x, x]), T = e.find(i, [x, x]));
    for (var Q = [], R = 0; R < S; R++) {
      for (var L = _[R], nr = T(L[0], M[0]), ar = 1; ar < O; ar++) nr = $(nr, T(L[ar], M[ar]));
      Q[R] = nr;
    }
    return A.createDenseMatrix({ data: Q, size: [S], datatype: y === A._datatype && B === w._datatype ? x : void 0 });
  }
  function D(A, w) {
    var _ = A._data, F = A._size, y = A._datatype || A.getDataType(), M = w._data, B = w._size, S = w._datatype || w.getDataType(), O = F[0], x = F[1], $ = B[1], T, Q = n, R = i;
    y && S && y === S && typeof y == "string" && y !== "mixed" && y !== "mixed" && (T = y, Q = e.find(n, [T, T]), R = e.find(i, [T, T]));
    for (var L = [], nr = 0; nr < O; nr++) {
      var ar = _[nr];
      L[nr] = [];
      for (var U = 0; U < $; U++) {
        for (var Z = R(ar[0], M[0][U]), tr = 1; tr < x; tr++) Z = Q(Z, R(ar[tr], M[tr][U]));
        L[nr][U] = Z;
      }
    }
    return A.createDenseMatrix({ data: L, size: [O, $], datatype: y === A._datatype && S === w._datatype ? T : void 0 });
  }
  function g(A, w) {
    var _ = A._data, F = A._size, y = A._datatype || A.getDataType(), M = w._values, B = w._index, S = w._ptr, O = w._size, x = w._datatype || w._data === void 0 ? w._datatype : w.getDataType();
    if (!M) throw new Error("Cannot multiply Dense Matrix times Pattern only Matrix");
    var $ = F[0], T = O[1], Q, R = n, L = i, nr = u, ar = 0;
    y && x && y === x && typeof y == "string" && y !== "mixed" && (Q = y, R = e.find(n, [Q, Q]), L = e.find(i, [Q, Q]), nr = e.find(u, [Q, Q]), ar = e.convert(0, Q));
    for (var U = [], Z = [], tr = [], ur = w.createSparseMatrix({ values: U, index: Z, ptr: tr, size: [$, T], datatype: y === A._datatype && x === w._datatype ? Q : void 0 }), j = 0; j < T; j++) {
      tr[j] = Z.length;
      var W = S[j], H = S[j + 1];
      if (H > W) for (var X = 0, G = 0; G < $; G++) {
        for (var sr = G + 1, k = void 0, hr = W; hr < H; hr++) {
          var mr = B[hr];
          X !== sr ? (k = L(_[G][mr], M[hr]), X = sr) : k = R(k, L(_[G][mr], M[hr]));
        }
        X === sr && !nr(k, ar) && (Z.push(G), U.push(k));
      }
    }
    return tr[T] = Z.length, ur;
  }
  function E(A, w) {
    var _ = A._values, F = A._index, y = A._ptr, M = A._datatype || A._data === void 0 ? A._datatype : A.getDataType();
    if (!_) throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
    var B = w._data, S = w._datatype || w.getDataType(), O = A._size[0], x = w._size[0], $ = [], T = [], Q = [], R, L = n, nr = i, ar = u, U = 0;
    M && S && M === S && typeof M == "string" && M !== "mixed" && (R = M, L = e.find(n, [R, R]), nr = e.find(i, [R, R]), ar = e.find(u, [R, R]), U = e.convert(0, R));
    var Z = [], tr = [];
    Q[0] = 0;
    for (var ur = 0; ur < x; ur++) {
      var j = B[ur];
      if (!ar(j, U)) for (var W = y[ur], H = y[ur + 1], X = W; X < H; X++) {
        var G = F[X];
        tr[G] ? Z[G] = L(Z[G], nr(j, _[X])) : (tr[G] = true, T.push(G), Z[G] = nr(j, _[X]));
      }
    }
    for (var sr = T.length, k = 0; k < sr; k++) {
      var hr = T[k];
      $[k] = Z[hr];
    }
    return Q[1] = T.length, A.createSparseMatrix({ values: $, index: T, ptr: Q, size: [O, 1], datatype: M === A._datatype && S === w._datatype ? R : void 0 });
  }
  function m(A, w) {
    var _ = A._values, F = A._index, y = A._ptr, M = A._datatype || A._data === void 0 ? A._datatype : A.getDataType();
    if (!_) throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
    var B = w._data, S = w._datatype || w.getDataType(), O = A._size[0], x = w._size[0], $ = w._size[1], T, Q = n, R = i, L = u, nr = 0;
    M && S && M === S && typeof M == "string" && M !== "mixed" && (T = M, Q = e.find(n, [T, T]), R = e.find(i, [T, T]), L = e.find(u, [T, T]), nr = e.convert(0, T));
    for (var ar = [], U = [], Z = [], tr = A.createSparseMatrix({ values: ar, index: U, ptr: Z, size: [O, $], datatype: M === A._datatype && S === w._datatype ? T : void 0 }), ur = [], j = [], W = 0; W < $; W++) {
      Z[W] = U.length;
      for (var H = W + 1, X = 0; X < x; X++) {
        var G = B[X][W];
        if (!L(G, nr)) for (var sr = y[X], k = y[X + 1], hr = sr; hr < k; hr++) {
          var mr = F[hr];
          j[mr] !== H ? (j[mr] = H, U.push(mr), ur[mr] = R(G, _[hr])) : ur[mr] = Q(ur[mr], R(G, _[hr]));
        }
      }
      for (var Dr = Z[W], yr = U.length, Ar = Dr; Ar < yr; Ar++) {
        var Er = U[Ar];
        ar[Ar] = ur[Er];
      }
    }
    return Z[$] = U.length, tr;
  }
  function C(A, w) {
    var _ = A._values, F = A._index, y = A._ptr, M = A._datatype || A._data === void 0 ? A._datatype : A.getDataType(), B = w._values, S = w._index, O = w._ptr, x = w._datatype || w._data === void 0 ? w._datatype : w.getDataType(), $ = A._size[0], T = w._size[1], Q = _ && B, R, L = n, nr = i;
    M && x && M === x && typeof M == "string" && M !== "mixed" && (R = M, L = e.find(n, [R, R]), nr = e.find(i, [R, R]));
    for (var ar = Q ? [] : void 0, U = [], Z = [], tr = A.createSparseMatrix({ values: ar, index: U, ptr: Z, size: [$, T], datatype: M === A._datatype && x === w._datatype ? R : void 0 }), ur = Q ? [] : void 0, j = [], W, H, X, G, sr, k, hr, mr, Dr = 0; Dr < T; Dr++) {
      Z[Dr] = U.length;
      var yr = Dr + 1;
      for (sr = O[Dr], k = O[Dr + 1], G = sr; G < k; G++) if (mr = S[G], Q) for (H = y[mr], X = y[mr + 1], W = H; W < X; W++) hr = F[W], j[hr] !== yr ? (j[hr] = yr, U.push(hr), ur[hr] = nr(B[G], _[W])) : ur[hr] = L(ur[hr], nr(B[G], _[W]));
      else for (H = y[mr], X = y[mr + 1], W = H; W < X; W++) hr = F[W], j[hr] !== yr && (j[hr] = yr, U.push(hr));
      if (Q) for (var Ar = Z[Dr], Er = U.length, Ir = Ar; Ir < Er; Ir++) {
        var Br = U[Ir];
        ar[Ir] = ur[Br];
      }
    }
    return Z[T] = U.length, tr;
  }
  return e(Yn, i, { "Array, Array": e.referTo("Matrix, Matrix", (A) => (w, _) => {
    c(wr(w), wr(_));
    var F = A(t(w), t(_));
    return _r(F) ? F.valueOf() : F;
  }), "Matrix, Matrix": function(w, _) {
    var F = w.size(), y = _.size();
    return c(F, y), F.length === 1 ? y.length === 1 ? s(w, _, F[0]) : h(w, _) : y.length === 1 ? p(w, _) : d(w, _);
  }, "Matrix, Array": e.referTo("Matrix,Matrix", (A) => (w, _) => A(w, t(_))), "Array, Matrix": e.referToSelf((A) => (w, _) => A(t(w, _.storage()), _)), "SparseMatrix, any": function(w, _) {
    return o(w, _, i, false);
  }, "DenseMatrix, any": function(w, _) {
    return f(w, _, i, false);
  }, "any, SparseMatrix": function(w, _) {
    return o(_, w, i, true);
  }, "any, DenseMatrix": function(w, _) {
    return f(_, w, i, true);
  }, "Array, any": function(w, _) {
    return f(t(w), _, i, false).valueOf();
  }, "any, Array": function(w, _) {
    return f(t(_), w, i, true).valueOf();
  }, "any, any": i, "any, any, ...any": e.referToSelf((A) => (w, _, F) => {
    for (var y = A(w, _), M = 0; M < F.length; M++) y = A(y, F[M]);
    return y;
  }) });
}), Qn = "sign", Zf = ["typed", "BigNumber", "Fraction", "complex"], Vf = er(Qn, Zf, (r) => {
  var { typed: e, BigNumber: t, complex: n, Fraction: i } = r;
  return e(Qn, { number: Ht, Complex: function(a) {
    return a.im === 0 ? n(Ht(a.re)) : a.sign();
  }, BigNumber: function(a) {
    return new t(a.cmp(0));
  }, bigint: function(a) {
    return a > 0n ? 1n : a < 0n ? -1n : 0n;
  }, Fraction: function(a) {
    return a.n === 0n ? new i(0) : new i(a.s);
  }, "Array | Matrix": e.referToSelf((u) => (a) => ne(a, u, true)), Unit: e.referToSelf((u) => (a) => {
    if (!a._isDerived() && a.units[0].unit.offset !== 0) throw new TypeError("sign is ambiguous for units with offset");
    return e.find(u, a.valueType())(a.value);
  }) });
}), Wf = "sqrt", Jf = ["config", "typed", "Complex"], Yf = er(Wf, Jf, (r) => {
  var { config: e, typed: t, Complex: n } = r;
  return t("sqrt", { number: i, Complex: function(a) {
    return a.sqrt();
  }, BigNumber: function(a) {
    return !a.isNegative() || e.predictable ? a.sqrt() : i(a.toNumber());
  }, Unit: function(a) {
    return a.pow(0.5);
  } });
  function i(u) {
    return isNaN(u) ? NaN : u >= 0 || e.predictable ? Math.sqrt(u) : new n(u, 0).sqrt();
  }
}), Xn = "subtract", Qf = ["typed", "matrix", "equalScalar", "subtractScalar", "unaryMinus", "DenseMatrix", "concat"], Xf = er(Xn, Qf, (r) => {
  var { typed: e, matrix: t, equalScalar: n, subtractScalar: i, unaryMinus: u, DenseMatrix: a, concat: o } = r, f = vu({ typed: e }), c = Ye({ typed: e }), s = Ef({ typed: e, equalScalar: n }), h = pu({ typed: e, DenseMatrix: a }), v = Je({ typed: e, DenseMatrix: a }), p = Me({ typed: e, matrix: t, concat: o });
  return e(Xn, { "any, any": i }, p({ elop: i, SS: s, DS: f, SD: c, Ss: v, sS: h }));
}), Gf = "matAlgo07xSSf", Kf = ["typed", "SparseMatrix"], et = er(Gf, Kf, (r) => {
  var { typed: e, SparseMatrix: t } = r;
  return function(u, a, o) {
    var f = u._size, c = u._datatype || u._data === void 0 ? u._datatype : u.getDataType(), s = a._size, h = a._datatype || a._data === void 0 ? a._datatype : a.getDataType();
    if (f.length !== s.length) throw new br(f.length, s.length);
    if (f[0] !== s[0] || f[1] !== s[1]) throw new RangeError("Dimension mismatch. Matrix A (" + f + ") must match Matrix B (" + s + ")");
    var v = f[0], p = f[1], d, l = 0, D = o;
    typeof c == "string" && c === h && c !== "mixed" && (d = c, l = e.convert(0, d), D = e.find(o, [d, d]));
    for (var g = [], E = [], m = new Array(p + 1).fill(0), C = [], A = [], w = [], _ = [], F = 0; F < p; F++) {
      var y = F + 1, M = 0;
      n(u, F, w, C, y), n(a, F, _, A, y);
      for (var B = 0; B < v; B++) {
        var S = w[B] === y ? C[B] : l, O = _[B] === y ? A[B] : l, x = D(S, O);
        x !== 0 && x !== false && (E.push(B), g.push(x), M++);
      }
      m[F + 1] = m[F] + M;
    }
    return new t({ values: g, index: E, ptr: m, size: [v, p], datatype: c === u._datatype && h === a._datatype ? d : void 0 });
  };
  function n(i, u, a, o, f) {
    for (var c = i._values, s = i._index, h = i._ptr, v = h[u], p = h[u + 1]; v < p; v++) {
      var d = s[v];
      a[d] = f, o[d] = c[v];
    }
  }
}), Gn = "conj", Hf = ["typed"], kf = er(Gn, Hf, (r) => {
  var { typed: e } = r;
  return e(Gn, { "number | BigNumber | Fraction": (t) => t, Complex: (t) => t.conjugate(), Unit: e.referToSelf((t) => (n) => new n.constructor(t(n.toNumeric()), n.formatUnits())), "Array | Matrix": e.referToSelf((t) => (n) => ne(n, t)) });
}), Kn = "im", jf = ["typed"], rc = er(Kn, jf, (r) => {
  var { typed: e } = r;
  return e(Kn, { number: () => 0, "BigNumber | Fraction": (t) => t.mul(0), Complex: (t) => t.im, "Array | Matrix": e.referToSelf((t) => (n) => ne(n, t)) });
}), Hn = "re", ec = ["typed"], tc = er(Hn, ec, (r) => {
  var { typed: e } = r;
  return e(Hn, { "number | BigNumber | Fraction": (t) => t, Complex: (t) => t.re, "Array | Matrix": e.referToSelf((t) => (n) => ne(n, t)) });
}), kn = "concat", nc = ["typed", "matrix", "isInteger"], ic = er(kn, nc, (r) => {
  var { typed: e, matrix: t, isInteger: n } = r;
  return e(kn, { "...Array | Matrix | number | BigNumber": function(u) {
    var a, o = u.length, f = -1, c, s = false, h = [];
    for (a = 0; a < o; a++) {
      var v = u[a];
      if (_r(v) && (s = true), xr(v) || Rr(v)) {
        if (a !== o - 1) throw new Error("Dimension must be specified as last argument");
        if (c = f, f = v.valueOf(), !n(f)) throw new TypeError("Integer number expected for dimension");
        if (f < 0 || a > 0 && f > c) throw new be(f, c + 1);
      } else {
        var p = Fr(v).valueOf(), d = wr(p);
        if (h[a] = p, c = f, f = d.length - 1, a > 0 && f !== c) throw new br(c + 1, f + 1);
      }
    }
    if (h.length === 0) throw new SyntaxError("At least one matrix expected");
    for (var l = h.shift(); h.length; ) l = eu(l, h.shift(), f);
    return s ? t(l) : l;
  }, "...string": function(u) {
    return u.join("");
  } });
}), jn = "column", uc = ["typed", "Index", "matrix", "range"], ac = er(jn, uc, (r) => {
  var { typed: e, Index: t, matrix: n, range: i } = r;
  return e(jn, { "Matrix, number": u, "Array, number": function(o, f) {
    return u(n(Fr(o)), f).valueOf();
  } });
  function u(a, o) {
    if (a.size().length !== 2) throw new Error("Only two dimensional matrix is supported");
    qr(o, a.size()[1]);
    var f = i(0, a.size()[0]), c = new t(f, o), s = a.subset(c);
    return _r(s) ? s : n([[s]]);
  }
}), ri = "cross", oc = ["typed", "matrix", "subtract", "multiply"], sc = er(ri, oc, (r) => {
  var { typed: e, matrix: t, subtract: n, multiply: i } = r;
  return e(ri, { "Matrix, Matrix": function(o, f) {
    return t(u(o.toArray(), f.toArray()));
  }, "Matrix, Array": function(o, f) {
    return t(u(o.toArray(), f));
  }, "Array, Matrix": function(o, f) {
    return t(u(o, f.toArray()));
  }, "Array, Array": u });
  function u(a, o) {
    var f = Math.max(wr(a).length, wr(o).length);
    a = In(a), o = In(o);
    var c = wr(a), s = wr(o);
    if (c.length !== 1 || s.length !== 1 || c[0] !== 3 || s[0] !== 3) throw new RangeError("Vectors with length 3 expected (Size A = [" + c.join(", ") + "], B = [" + s.join(", ") + "])");
    var h = [n(i(a[1], o[2]), i(a[2], o[1])), n(i(a[2], o[0]), i(a[0], o[2])), n(i(a[0], o[1]), i(a[1], o[0]))];
    return f > 1 ? [h] : h;
  }
}), ei = "diag", fc = ["typed", "matrix", "DenseMatrix", "SparseMatrix"], cc = er(ei, fc, (r) => {
  var { typed: e, matrix: t, DenseMatrix: n, SparseMatrix: i } = r;
  return e(ei, { Array: function(c) {
    return u(c, 0, wr(c), null);
  }, "Array, number": function(c, s) {
    return u(c, s, wr(c), null);
  }, "Array, BigNumber": function(c, s) {
    return u(c, s.toNumber(), wr(c), null);
  }, "Array, string": function(c, s) {
    return u(c, 0, wr(c), s);
  }, "Array, number, string": function(c, s, h) {
    return u(c, s, wr(c), h);
  }, "Array, BigNumber, string": function(c, s, h) {
    return u(c, s.toNumber(), wr(c), h);
  }, Matrix: function(c) {
    return u(c, 0, c.size(), c.storage());
  }, "Matrix, number": function(c, s) {
    return u(c, s, c.size(), c.storage());
  }, "Matrix, BigNumber": function(c, s) {
    return u(c, s.toNumber(), c.size(), c.storage());
  }, "Matrix, string": function(c, s) {
    return u(c, 0, c.size(), s);
  }, "Matrix, number, string": function(c, s, h) {
    return u(c, s, c.size(), h);
  }, "Matrix, BigNumber, string": function(c, s, h) {
    return u(c, s.toNumber(), c.size(), h);
  } });
  function u(f, c, s, h) {
    if (!zr(c)) throw new TypeError("Second parameter in function diag must be an integer");
    var v = c > 0 ? c : 0, p = c < 0 ? -c : 0;
    switch (s.length) {
      case 1:
        return a(f, c, h, s[0], p, v);
      case 2:
        return o(f, c, h, s, p, v);
    }
    throw new RangeError("Matrix for function diag must be 2 dimensional");
  }
  function a(f, c, s, h, v, p) {
    var d = [h + v, h + p];
    if (s && s !== "sparse" && s !== "dense") throw new TypeError("Unknown matrix type ".concat(s, '"'));
    var l = s === "sparse" ? i.diagonal(d, f, c) : n.diagonal(d, f, c);
    return s !== null ? l : l.valueOf();
  }
  function o(f, c, s, h, v, p) {
    if (_r(f)) {
      var d = f.diagonal(c);
      return s !== null ? s !== d.storage() ? t(d, s) : d : d.valueOf();
    }
    for (var l = Math.min(h[0] - v, h[1] - p), D = [], g = 0; g < l; g++) D[g] = f[g + v][g + p];
    return s !== null ? t(D) : D;
  }
}), ti = "flatten", lc = ["typed"], hc = er(ti, lc, (r) => {
  var { typed: e } = r;
  return e(ti, { Array: function(n) {
    return Gt(n);
  }, Matrix: function(n) {
    return n.create(Gt(n.valueOf(), true), n.datatype());
  } });
}), ni = "getMatrixDataType", vc = ["typed"], pc = er(ni, vc, (r) => {
  var { typed: e } = r;
  return e(ni, { Array: function(n) {
    return xt(n, te);
  }, Matrix: function(n) {
    return n.getDataType();
  } });
}), ii = "identity", dc = ["typed", "config", "matrix", "BigNumber", "DenseMatrix", "SparseMatrix"], mc = er(ii, dc, (r) => {
  var { typed: e, config: t, matrix: n, BigNumber: i, DenseMatrix: u, SparseMatrix: a } = r;
  return e(ii, { "": function() {
    return t.matrix === "Matrix" ? n([]) : [];
  }, string: function(s) {
    return n(s);
  }, "number | BigNumber": function(s) {
    return f(s, s, t.matrix === "Matrix" ? "dense" : void 0);
  }, "number | BigNumber, string": function(s, h) {
    return f(s, s, h);
  }, "number | BigNumber, number | BigNumber": function(s, h) {
    return f(s, h, t.matrix === "Matrix" ? "dense" : void 0);
  }, "number | BigNumber, number | BigNumber, string": function(s, h, v) {
    return f(s, h, v);
  }, Array: function(s) {
    return o(s);
  }, "Array, string": function(s, h) {
    return o(s, h);
  }, Matrix: function(s) {
    return o(s.valueOf(), s.storage());
  }, "Matrix, string": function(s, h) {
    return o(s.valueOf(), h);
  } });
  function o(c, s) {
    switch (c.length) {
      case 0:
        return s ? n(s) : [];
      case 1:
        return f(c[0], c[0], s);
      case 2:
        return f(c[0], c[1], s);
      default:
        throw new Error("Vector containing two values expected");
    }
  }
  function f(c, s, h) {
    var v = Rr(c) || Rr(s) ? i : null;
    if (Rr(c) && (c = c.toNumber()), Rr(s) && (s = s.toNumber()), !zr(c) || c < 1) throw new Error("Parameters in function identity must be positive integers");
    if (!zr(s) || s < 1) throw new Error("Parameters in function identity must be positive integers");
    var p = v ? new i(1) : 1, d = v ? new v(0) : 0, l = [c, s];
    if (h) {
      if (h === "sparse") return a.diagonal(l, p, 0, d);
      if (h === "dense") return u.diagonal(l, p, 0, d);
      throw new TypeError('Unknown matrix type "'.concat(h, '"'));
    }
    for (var D = Dt([], l, d), g = c < s ? c : s, E = 0; E < g; E++) D[E][E] = p;
    return D;
  }
}), ui = "kron", Dc = ["typed", "matrix", "multiplyScalar"], gc = er(ui, Dc, (r) => {
  var { typed: e, matrix: t, multiplyScalar: n } = r;
  return e(ui, { "Matrix, Matrix": function(a, o) {
    return t(i(a.toArray(), o.toArray()));
  }, "Matrix, Array": function(a, o) {
    return t(i(a.toArray(), o));
  }, "Array, Matrix": function(a, o) {
    return t(i(a, o.toArray()));
  }, "Array, Array": i });
  function i(u, a) {
    if (wr(u).length === 1 && (u = [u]), wr(a).length === 1 && (a = [a]), wr(u).length > 2 || wr(a).length > 2) throw new RangeError("Vectors with dimensions greater then 2 are not supported expected (Size x = " + JSON.stringify(u.length) + ", y = " + JSON.stringify(a.length) + ")");
    var o = [], f = [];
    return u.map(function(c) {
      return a.map(function(s) {
        return f = [], o.push(f), c.map(function(h) {
          return s.map(function(v) {
            return f.push(n(h, v));
          });
        });
      });
    }) && o;
  }
});
function du() {
  throw new Error('No "bignumber" implementation available');
}
function yc() {
  throw new Error('No "fraction" implementation available');
}
function mu() {
  throw new Error('No "matrix" implementation available');
}
var ai = "range", wc = ["typed", "config", "?matrix", "?bignumber", "equal", "smaller", "smallerEq", "larger", "largerEq", "add", "isZero", "isPositive"], Ac = er(ai, wc, (r) => {
  var { typed: e, config: t, matrix: n, bignumber: i, smaller: u, smallerEq: a, larger: o, largerEq: f, add: c, isZero: s, isPositive: h } = r;
  return e(ai, { string: p, "string, boolean": p, number: function(g) {
    throw new TypeError("Too few arguments to function range(): ".concat(g));
  }, boolean: function(g) {
    throw new TypeError("Unexpected type of argument 1 to function range(): ".concat(g, ", number|bigint|BigNumber|Fraction"));
  }, "number, number": function(g, E) {
    return v(d(g, E, 1, false));
  }, "number, number, number": function(g, E, m) {
    return v(d(g, E, m, false));
  }, "number, number, boolean": function(g, E, m) {
    return v(d(g, E, 1, m));
  }, "number, number, number, boolean": function(g, E, m, C) {
    return v(d(g, E, m, C));
  }, "bigint, bigint|number": function(g, E) {
    return v(d(g, E, 1n, false));
  }, "number, bigint": function(g, E) {
    return v(d(BigInt(g), E, 1n, false));
  }, "bigint, bigint|number, bigint|number": function(g, E, m) {
    return v(d(g, E, BigInt(m), false));
  }, "number, bigint, bigint|number": function(g, E, m) {
    return v(d(BigInt(g), E, BigInt(m), false));
  }, "bigint, bigint|number, boolean": function(g, E, m) {
    return v(d(g, E, 1n, m));
  }, "number, bigint, boolean": function(g, E, m) {
    return v(d(BigInt(g), E, 1n, m));
  }, "bigint, bigint|number, bigint|number, boolean": function(g, E, m, C) {
    return v(d(g, E, BigInt(m), C));
  }, "number, bigint, bigint|number, boolean": function(g, E, m, C) {
    return v(d(BigInt(g), E, BigInt(m), C));
  }, "BigNumber, BigNumber": function(g, E) {
    var m = g.constructor;
    return v(d(g, E, new m(1), false));
  }, "BigNumber, BigNumber, BigNumber": function(g, E, m) {
    return v(d(g, E, m, false));
  }, "BigNumber, BigNumber, boolean": function(g, E, m) {
    var C = g.constructor;
    return v(d(g, E, new C(1), m));
  }, "BigNumber, BigNumber, BigNumber, boolean": function(g, E, m, C) {
    return v(d(g, E, m, C));
  }, "Fraction, Fraction": function(g, E) {
    return v(d(g, E, 1, false));
  }, "Fraction, Fraction, Fraction": function(g, E, m) {
    return v(d(g, E, m, false));
  }, "Fraction, Fraction, boolean": function(g, E, m) {
    return v(d(g, E, 1, m));
  }, "Fraction, Fraction, Fraction, boolean": function(g, E, m, C) {
    return v(d(g, E, m, C));
  }, "Unit, Unit, Unit": function(g, E, m) {
    return v(d(g, E, m, false));
  }, "Unit, Unit, Unit, boolean": function(g, E, m, C) {
    return v(d(g, E, m, C));
  } });
  function v(D) {
    return t.matrix === "Matrix" ? n ? n(D) : mu() : D;
  }
  function p(D, g) {
    var E = l(D);
    if (!E) throw new SyntaxError('String "' + D + '" is no valid range');
    return t.number === "BigNumber" ? (i === void 0 && du(), v(d(i(E.start), i(E.end), i(E.step)))) : v(d(E.start, E.end, E.step, g));
  }
  function d(D, g, E, m) {
    var C = [];
    if (s(E)) throw new Error("Step must be non-zero");
    for (var A = h(E) ? m ? a : u : m ? f : o, w = D; A(w, g); ) C.push(w), w = c(w, E);
    return C;
  }
  function l(D) {
    var g = D.split(":"), E = g.map(function(C) {
      return Number(C);
    }), m = E.some(function(C) {
      return isNaN(C);
    });
    if (m) return null;
    switch (E.length) {
      case 2:
        return { start: E[0], end: E[1], step: 1 };
      case 3:
        return { start: E[0], end: E[2], step: E[1] };
      default:
        return null;
    }
  }
}), oi = "reshape", Fc = ["typed", "isInteger", "matrix"], Ec = er(oi, Fc, (r) => {
  var { typed: e, isInteger: t } = r;
  return e(oi, { "Matrix, Array": function(i, u) {
    return i.reshape(u, true);
  }, "Array, Array": function(i, u) {
    return u.forEach(function(a) {
      if (!t(a)) throw new TypeError("Invalid size for dimension: " + a);
    }), un(i, u);
  } });
}), si = "size", Cc = ["typed", "config", "?matrix"], bc = er(si, Cc, (r) => {
  var { typed: e, config: t, matrix: n } = r;
  return e(si, { Matrix: function(u) {
    return u.create(u.size(), "number");
  }, Array: wr, string: function(u) {
    return t.matrix === "Array" ? [u.length] : n([u.length], "dense", "number");
  }, "number | Complex | BigNumber | Unit | boolean | null": function(u) {
    return t.matrix === "Array" ? [] : n ? n([], "dense", "number") : mu();
  } });
}), fi = "transpose", _c = ["typed", "matrix"], Bc = er(fi, _c, (r) => {
  var { typed: e, matrix: t } = r;
  return e(fi, { Array: (a) => n(t(a)).valueOf(), Matrix: n, any: Fr });
  function n(a) {
    var o = a.size(), f;
    switch (o.length) {
      case 1:
        f = a.clone();
        break;
      case 2:
        {
          var c = o[0], s = o[1];
          if (s === 0) throw new RangeError("Cannot transpose a 2D matrix with no columns (size: " + Or(o) + ")");
          switch (a.storage()) {
            case "dense":
              f = i(a, c, s);
              break;
            case "sparse":
              f = u(a, c, s);
              break;
          }
        }
        break;
      default:
        throw new RangeError("Matrix must be a vector or two dimensional (size: " + Or(o) + ")");
    }
    return f;
  }
  function i(a, o, f) {
    for (var c = a._data, s = [], h, v = 0; v < f; v++) {
      h = s[v] = [];
      for (var p = 0; p < o; p++) h[p] = Fr(c[p][v]);
    }
    return a.createDenseMatrix({ data: s, size: [f, o], datatype: a._datatype });
  }
  function u(a, o, f) {
    for (var c = a._values, s = a._index, h = a._ptr, v = c ? [] : void 0, p = [], d = [], l = [], D = 0; D < o; D++) l[D] = 0;
    var g, E, m;
    for (g = 0, E = s.length; g < E; g++) l[s[g]]++;
    for (var C = 0, A = 0; A < o; A++) d.push(C), C += l[A], l[A] = d[A];
    for (d.push(C), m = 0; m < f; m++) for (var w = h[m], _ = h[m + 1], F = w; F < _; F++) {
      var y = l[s[F]]++;
      p[y] = m, c && (v[y] = Fr(c[F]));
    }
    return a.createSparseMatrix({ values: v, index: p, ptr: d, size: [f, o], datatype: a._datatype });
  }
}), ci = "ctranspose", Mc = ["typed", "transpose", "conj"], Sc = er(ci, Mc, (r) => {
  var { typed: e, transpose: t, conj: n } = r;
  return e(ci, { any: function(u) {
    return n(t(u));
  } });
}), li = "zeros", Nc = ["typed", "config", "matrix", "BigNumber"], xc = er(li, Nc, (r) => {
  var { typed: e, config: t, matrix: n, BigNumber: i } = r;
  return e(li, { "": function() {
    return t.matrix === "Array" ? u([]) : u([], "default");
  }, "...number | BigNumber | string": function(c) {
    var s = c[c.length - 1];
    if (typeof s == "string") {
      var h = c.pop();
      return u(c, h);
    } else return t.matrix === "Array" ? u(c) : u(c, "default");
  }, Array: u, Matrix: function(c) {
    var s = c.storage();
    return u(c.valueOf(), s);
  }, "Array | Matrix, string": function(c, s) {
    return u(c.valueOf(), s);
  } });
  function u(f, c) {
    var s = a(f), h = s ? new i(0) : 0;
    if (o(f), c) {
      var v = n(c);
      return f.length > 0 ? v.resize(f, h) : v;
    } else {
      var p = [];
      return f.length > 0 ? Dt(p, f, h) : p;
    }
  }
  function a(f) {
    var c = false;
    return f.forEach(function(s, h, v) {
      Rr(s) && (c = true, v[h] = s.toNumber());
    }), c;
  }
  function o(f) {
    f.forEach(function(c) {
      if (typeof c != "number" || !zr(c) || c < 0) throw new Error("Parameters in function zeros must be positive integers");
    });
  }
});
function hi(r, e, t) {
  var n;
  return String(r).includes("Unexpected type") ? (n = arguments.length > 2 ? " (type: " + te(t) + ", value: " + JSON.stringify(t) + ")" : " (type: " + r.data.actual + ")", new TypeError("Cannot calculate " + e + ", unexpected type of argument" + n)) : String(r).includes("complex numbers") ? (n = arguments.length > 2 ? " (type: " + te(t) + ", value: " + JSON.stringify(t) + ")" : "", new TypeError("Cannot calculate " + e + ", no ordering relation is defined for complex numbers" + n)) : r;
}
var Tc = "numeric", zc = ["number", "?bignumber", "?fraction"], Ic = er(Tc, zc, (r) => {
  var { number: e, bignumber: t, fraction: n } = r, i = { string: true, number: true, BigNumber: true, Fraction: true }, u = { number: (a) => e(a), BigNumber: t ? (a) => t(a) : du, bigint: (a) => BigInt(a), Fraction: n ? (a) => n(a) : yc };
  return function(o) {
    var f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "number", c = arguments.length > 2 ? arguments[2] : void 0;
    if (c !== void 0) throw new SyntaxError("numeric() takes one or two arguments");
    var s = te(o);
    if (!(s in i)) throw new TypeError("Cannot convert " + o + ' of type "' + s + '"; valid input types are ' + Object.keys(i).join(", "));
    if (!(f in u)) throw new TypeError("Cannot convert " + o + ' to type "' + f + '"; valid output types are ' + Object.keys(u).join(", "));
    return f === s ? o : u[f](o);
  };
}), vi = "divideScalar", Oc = ["typed", "numeric"], $c = er(vi, Oc, (r) => {
  var { typed: e, numeric: t } = r;
  return e(vi, { "number, number": function(i, u) {
    return i / u;
  }, "Complex, Complex": function(i, u) {
    return i.div(u);
  }, "BigNumber, BigNumber": function(i, u) {
    return i.div(u);
  }, "bigint, bigint": function(i, u) {
    return i / u;
  }, "Fraction, Fraction": function(i, u) {
    return i.div(u);
  }, "Unit, number | Complex | Fraction | BigNumber | Unit": (n, i) => n.divide(i), "number | Fraction | Complex | BigNumber, Unit": (n, i) => i.divideInto(n) });
}), pi = "pow", Pc = ["typed", "config", "identity", "multiply", "matrix", "inv", "fraction", "number", "Complex"], qc = er(pi, Pc, (r) => {
  var { typed: e, config: t, identity: n, multiply: i, matrix: u, inv: a, number: o, fraction: f, Complex: c } = r;
  return e(pi, { "number, number": s, "Complex, Complex": function(d, l) {
    return d.pow(l);
  }, "BigNumber, BigNumber": function(d, l) {
    return l.isInteger() || d >= 0 || t.predictable ? d.pow(l) : new c(d.toNumber(), 0).pow(l.toNumber(), 0);
  }, "bigint, bigint": (p, d) => p ** d, "Fraction, Fraction": function(d, l) {
    var D = d.pow(l);
    if (D != null) return D;
    if (t.predictable) throw new Error("Result of pow is non-rational and cannot be expressed as a fraction");
    return s(d.valueOf(), l.valueOf());
  }, "Array, number": h, "Array, BigNumber": function(d, l) {
    return h(d, l.toNumber());
  }, "Matrix, number": v, "Matrix, BigNumber": function(d, l) {
    return v(d, l.toNumber());
  }, "Unit, number | BigNumber": function(d, l) {
    return d.pow(l);
  } });
  function s(p, d) {
    if (t.predictable && !zr(d) && p < 0) try {
      var l = f(d), D = o(l);
      if ((d === D || Math.abs((d - D) / d) < 1e-14) && l.d % 2n === 1n) return (l.n % 2n === 0n ? 1 : -1) * Math.pow(-p, d);
    } catch {
    }
    return t.predictable && (p < -1 && d === 1 / 0 || p > -1 && p < 0 && d === -1 / 0) ? NaN : zr(d) || p >= 0 || t.predictable ? cu(p, d) : p * p < 1 && d === 1 / 0 || p * p > 1 && d === -1 / 0 ? 0 : new c(p, 0).pow(d, 0);
  }
  function h(p, d) {
    if (!zr(d)) throw new TypeError("For A^b, b must be an integer (value is " + d + ")");
    var l = wr(p);
    if (l.length !== 2) throw new Error("For A^b, A must be 2 dimensional (A has " + l.length + " dimensions)");
    if (l[0] !== l[1]) throw new Error("For A^b, A must be square (size is " + l[0] + "x" + l[1] + ")");
    if (d < 0) try {
      return h(a(p), -d);
    } catch (E) {
      throw E.message === "Cannot calculate inverse, determinant is zero" ? new TypeError("For A^b, when A is not invertible, b must be a positive integer (value is " + d + ")") : E;
    }
    for (var D = n(l[0]).valueOf(), g = p; d >= 1; ) (d & 1) === 1 && (D = i(g, D)), d >>= 1, g = i(g, g);
    return D;
  }
  function v(p, d) {
    return u(h(p.valueOf(), d));
  }
});
function Du(r) {
  var { DenseMatrix: e } = r;
  return function(n, i, u) {
    var a = n.size();
    if (a.length !== 2) throw new RangeError("Matrix must be two dimensional (size: " + Or(a) + ")");
    var o = a[0], f = a[1];
    if (o !== f) throw new RangeError("Matrix must be square (size: " + Or(a) + ")");
    var c = [];
    if (_r(i)) {
      var s = i.size(), h = i._data;
      if (s.length === 1) {
        if (s[0] !== o) throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");
        for (var v = 0; v < o; v++) c[v] = [h[v]];
        return new e({ data: c, size: [o, 1], datatype: i._datatype });
      }
      if (s.length === 2) {
        if (s[0] !== o || s[1] !== 1) throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");
        if (Si(i)) {
          if (u) {
            c = [];
            for (var p = 0; p < o; p++) c[p] = [h[p][0]];
            return new e({ data: c, size: [o, 1], datatype: i._datatype });
          }
          return i;
        }
        if (Ni(i)) {
          for (var d = 0; d < o; d++) c[d] = [0];
          for (var l = i._values, D = i._index, g = i._ptr, E = g[1], m = g[0]; m < E; m++) {
            var C = D[m];
            c[C][0] = l[m];
          }
          return new e({ data: c, size: [o, 1], datatype: i._datatype });
        }
      }
      throw new RangeError("Dimension mismatch. The right side has to be either 1- or 2-dimensional vector.");
    }
    if (Pr(i)) {
      var A = wr(i);
      if (A.length === 1) {
        if (A[0] !== o) throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");
        for (var w = 0; w < o; w++) c[w] = [i[w]];
        return new e({ data: c, size: [o, 1] });
      }
      if (A.length === 2) {
        if (A[0] !== o || A[1] !== 1) throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");
        for (var _ = 0; _ < o; _++) c[_] = [i[_][0]];
        return new e({ data: c, size: [o, 1] });
      }
      throw new RangeError("Dimension mismatch. The right side has to be either 1- or 2-dimensional vector.");
    }
  };
}
var di = "usolve", Rc = ["typed", "matrix", "divideScalar", "multiplyScalar", "subtractScalar", "equalScalar", "DenseMatrix"], Uc = er(di, Rc, (r) => {
  var { typed: e, matrix: t, divideScalar: n, multiplyScalar: i, subtractScalar: u, equalScalar: a, DenseMatrix: o } = r, f = Du({ DenseMatrix: o });
  return e(di, { "SparseMatrix, Array | Matrix": function(v, p) {
    return s(v, p);
  }, "DenseMatrix, Array | Matrix": function(v, p) {
    return c(v, p);
  }, "Array, Array | Matrix": function(v, p) {
    var d = t(v), l = c(d, p);
    return l.valueOf();
  } });
  function c(h, v) {
    v = f(h, v, true);
    for (var p = v._data, d = h._size[0], l = h._size[1], D = [], g = h._data, E = l - 1; E >= 0; E--) {
      var m = p[E][0] || 0, C = void 0;
      if (a(m, 0)) C = 0;
      else {
        var A = g[E][E];
        if (a(A, 0)) throw new Error("Linear system cannot be solved since matrix is singular");
        C = n(m, A);
        for (var w = E - 1; w >= 0; w--) p[w] = [u(p[w][0] || 0, i(C, g[w][E]))];
      }
      D[E] = [C];
    }
    return new o({ data: D, size: [d, 1] });
  }
  function s(h, v) {
    v = f(h, v, true);
    for (var p = v._data, d = h._size[0], l = h._size[1], D = h._values, g = h._index, E = h._ptr, m = [], C = l - 1; C >= 0; C--) {
      var A = p[C][0] || 0;
      if (a(A, 0)) m[C] = [0];
      else {
        for (var w = 0, _ = [], F = [], y = E[C], M = E[C + 1], B = M - 1; B >= y; B--) {
          var S = g[B];
          S === C ? w = D[B] : S < C && (_.push(D[B]), F.push(S));
        }
        if (a(w, 0)) throw new Error("Linear system cannot be solved since matrix is singular");
        for (var O = n(A, w), x = 0, $ = F.length; x < $; x++) {
          var T = F[x];
          p[T] = [u(p[T][0], i(O, _[x]))];
        }
        m[C] = [O];
      }
    }
    return new o({ data: m, size: [d, 1] });
  }
}), mi = "usolveAll", Lc = ["typed", "matrix", "divideScalar", "multiplyScalar", "subtractScalar", "equalScalar", "DenseMatrix"], Zc = er(mi, Lc, (r) => {
  var { typed: e, matrix: t, divideScalar: n, multiplyScalar: i, subtractScalar: u, equalScalar: a, DenseMatrix: o } = r, f = Du({ DenseMatrix: o });
  return e(mi, { "SparseMatrix, Array | Matrix": function(v, p) {
    return s(v, p);
  }, "DenseMatrix, Array | Matrix": function(v, p) {
    return c(v, p);
  }, "Array, Array | Matrix": function(v, p) {
    var d = t(v), l = c(d, p);
    return l.map((D) => D.valueOf());
  } });
  function c(h, v) {
    for (var p = [f(h, v, true)._data.map((F) => F[0])], d = h._data, l = h._size[0], D = h._size[1], g = D - 1; g >= 0; g--) for (var E = p.length, m = 0; m < E; m++) {
      var C = p[m];
      if (a(d[g][g], 0)) if (a(C[g], 0)) {
        if (m === 0) {
          var w = [...C];
          w[g] = 1;
          for (var _ = g - 1; _ >= 0; _--) w[_] = u(w[_], d[_][g]);
          p.push(w);
        }
      } else {
        if (m === 0) return [];
        p.splice(m, 1), m -= 1, E -= 1;
      }
      else {
        C[g] = n(C[g], d[g][g]);
        for (var A = g - 1; A >= 0; A--) C[A] = u(C[A], i(C[g], d[A][g]));
      }
    }
    return p.map((F) => new o({ data: F.map((y) => [y]), size: [l, 1] }));
  }
  function s(h, v) {
    for (var p = [f(h, v, true)._data.map((ar) => ar[0])], d = h._size[0], l = h._size[1], D = h._values, g = h._index, E = h._ptr, m = l - 1; m >= 0; m--) for (var C = p.length, A = 0; A < C; A++) {
      for (var w = p[A], _ = [], F = [], y = E[m], M = E[m + 1], B = 0, S = M - 1; S >= y; S--) {
        var O = g[S];
        O === m ? B = D[S] : O < m && (_.push(D[S]), F.push(O));
      }
      if (a(B, 0)) if (a(w[m], 0)) {
        if (A === 0) {
          var Q = [...w];
          Q[m] = 1;
          for (var R = 0, L = F.length; R < L; R++) {
            var nr = F[R];
            Q[nr] = u(Q[nr], _[R]);
          }
          p.push(Q);
        }
      } else {
        if (A === 0) return [];
        p.splice(A, 1), A -= 1, C -= 1;
      }
      else {
        w[m] = n(w[m], B);
        for (var x = 0, $ = F.length; x < $; x++) {
          var T = F[x];
          w[T] = u(w[T], i(w[m], _[x]));
        }
      }
    }
    return p.map((ar) => new o({ data: ar.map((U) => [U]), size: [d, 1] }));
  }
}), At = "equal", Vc = ["typed", "matrix", "equalScalar", "DenseMatrix", "concat", "SparseMatrix"], Wc = er(At, Vc, (r) => {
  var { typed: e, matrix: t, equalScalar: n, DenseMatrix: i, concat: u, SparseMatrix: a } = r, o = Ye({ typed: e }), f = et({ typed: e, SparseMatrix: a }), c = Je({ typed: e, DenseMatrix: i }), s = Me({ typed: e, matrix: t, concat: u });
  return e(At, Jc({ typed: e, equalScalar: n }), s({ elop: n, SS: f, DS: o, Ss: c }));
}), Jc = er(At, ["typed", "equalScalar"], (r) => {
  var { typed: e, equalScalar: t } = r;
  return e(At, { "any, any": function(i, u) {
    return i === null ? u === null : u === null ? i === null : i === void 0 ? u === void 0 : u === void 0 ? i === void 0 : t(i, u);
  } });
}), Ft = "smaller", Yc = ["typed", "config", "bignumber", "matrix", "DenseMatrix", "concat", "SparseMatrix"], Qc = er(Ft, Yc, (r) => {
  var { typed: e, config: t, bignumber: n, matrix: i, DenseMatrix: u, concat: a, SparseMatrix: o } = r, f = Ye({ typed: e }), c = et({ typed: e, SparseMatrix: o }), s = Je({ typed: e, DenseMatrix: u }), h = Me({ typed: e, matrix: i, concat: a }), v = rt({ typed: e });
  function p(d, l) {
    return d.lt(l) && !We(d, l, t.relTol, t.absTol);
  }
  return e(Ft, Xc({ typed: e, config: t }), { "boolean, boolean": (d, l) => d < l, "BigNumber, BigNumber": p, "bigint, bigint": (d, l) => d < l, "Fraction, Fraction": (d, l) => d.compare(l) === -1, "Fraction, BigNumber": function(l, D) {
    return p(n(l), D);
  }, "BigNumber, Fraction": function(l, D) {
    return p(l, n(D));
  }, "Complex, Complex": function(l, D) {
    throw new TypeError("No ordering relation is defined for complex numbers");
  } }, v, h({ SS: c, DS: f, Ss: s }));
}), Xc = er(Ft, ["typed", "config"], (r) => {
  var { typed: e, config: t } = r;
  return e(Ft, { "number, number": function(i, u) {
    return i < u && !De(i, u, t.relTol, t.absTol);
  } });
}), Et = "smallerEq", Gc = ["typed", "config", "matrix", "DenseMatrix", "concat", "SparseMatrix"], Kc = er(Et, Gc, (r) => {
  var { typed: e, config: t, matrix: n, DenseMatrix: i, concat: u, SparseMatrix: a } = r, o = Ye({ typed: e }), f = et({ typed: e, SparseMatrix: a }), c = Je({ typed: e, DenseMatrix: i }), s = Me({ typed: e, matrix: n, concat: u }), h = rt({ typed: e });
  return e(Et, Hc({ typed: e, config: t }), { "boolean, boolean": (v, p) => v <= p, "BigNumber, BigNumber": function(p, d) {
    return p.lte(d) || We(p, d, t.relTol, t.absTol);
  }, "bigint, bigint": (v, p) => v <= p, "Fraction, Fraction": (v, p) => v.compare(p) !== 1, "Complex, Complex": function() {
    throw new TypeError("No ordering relation is defined for complex numbers");
  } }, h, s({ SS: f, DS: o, Ss: c }));
}), Hc = er(Et, ["typed", "config"], (r) => {
  var { typed: e, config: t } = r;
  return e(Et, { "number, number": function(i, u) {
    return i <= u || De(i, u, t.relTol, t.absTol);
  } });
}), Ct = "larger", kc = ["typed", "config", "bignumber", "matrix", "DenseMatrix", "concat", "SparseMatrix"], jc = er(Ct, kc, (r) => {
  var { typed: e, config: t, bignumber: n, matrix: i, DenseMatrix: u, concat: a, SparseMatrix: o } = r, f = Ye({ typed: e }), c = et({ typed: e, SparseMatrix: o }), s = Je({ typed: e, DenseMatrix: u }), h = Me({ typed: e, matrix: i, concat: a }), v = rt({ typed: e });
  function p(d, l) {
    return d.gt(l) && !We(d, l, t.relTol, t.absTol);
  }
  return e(Ct, r0({ typed: e, config: t }), { "boolean, boolean": (d, l) => d > l, "BigNumber, BigNumber": p, "bigint, bigint": (d, l) => d > l, "Fraction, Fraction": (d, l) => d.compare(l) === 1, "Fraction, BigNumber": function(l, D) {
    return p(n(l), D);
  }, "BigNumber, Fraction": function(l, D) {
    return p(l, n(D));
  }, "Complex, Complex": function() {
    throw new TypeError("No ordering relation is defined for complex numbers");
  } }, v, h({ SS: c, DS: f, Ss: s }));
}), r0 = er(Ct, ["typed", "config"], (r) => {
  var { typed: e, config: t } = r;
  return e(Ct, { "number, number": function(i, u) {
    return i > u && !De(i, u, t.relTol, t.absTol);
  } });
}), bt = "largerEq", e0 = ["typed", "config", "matrix", "DenseMatrix", "concat", "SparseMatrix"], t0 = er(bt, e0, (r) => {
  var { typed: e, config: t, matrix: n, DenseMatrix: i, concat: u, SparseMatrix: a } = r, o = Ye({ typed: e }), f = et({ typed: e, SparseMatrix: a }), c = Je({ typed: e, DenseMatrix: i }), s = Me({ typed: e, matrix: n, concat: u }), h = rt({ typed: e });
  return e(bt, n0({ typed: e, config: t }), { "boolean, boolean": (v, p) => v >= p, "BigNumber, BigNumber": function(p, d) {
    return p.gte(d) || We(p, d, t.relTol, t.absTol);
  }, "bigint, bigint": function(p, d) {
    return p >= d;
  }, "Fraction, Fraction": (v, p) => v.compare(p) !== -1, "Complex, Complex": function() {
    throw new TypeError("No ordering relation is defined for complex numbers");
  } }, h, s({ SS: f, DS: o, Ss: c }));
}), n0 = er(bt, ["typed", "config"], (r) => {
  var { typed: e, config: t } = r;
  return e(bt, { "number, number": function(i, u) {
    return i >= u || De(i, u, t.relTol, t.absTol);
  } });
}), i0 = "ImmutableDenseMatrix", u0 = ["smaller", "DenseMatrix"], a0 = er(i0, u0, (r) => {
  var { smaller: e, DenseMatrix: t } = r;
  function n(i, u) {
    if (!(this instanceof n)) throw new SyntaxError("Constructor must be called with the new operator");
    if (u && !ce(u)) throw new Error("Invalid datatype: " + u);
    if (_r(i) || Pr(i)) {
      var a = new t(i, u);
      this._data = a._data, this._size = a._size, this._datatype = a._datatype, this._min = null, this._max = null;
    } else if (i && Pr(i.data) && Pr(i.size)) this._data = i.data, this._size = i.size, this._datatype = i.datatype, this._min = typeof i.min < "u" ? i.min : null, this._max = typeof i.max < "u" ? i.max : null;
    else {
      if (i) throw new TypeError("Unsupported type of data (" + te(i) + ")");
      this._data = [], this._size = [0], this._datatype = u, this._min = null, this._max = null;
    }
  }
  return n.prototype = new t(), n.prototype.type = "ImmutableDenseMatrix", n.prototype.isImmutableDenseMatrix = true, n.prototype.subset = function(i) {
    switch (arguments.length) {
      case 1: {
        var u = t.prototype.subset.call(this, i);
        return _r(u) ? new n({ data: u._data, size: u._size, datatype: u._datatype }) : u;
      }
      case 2:
      case 3:
        throw new Error("Cannot invoke set subset on an Immutable Matrix instance");
      default:
        throw new SyntaxError("Wrong number of arguments");
    }
  }, n.prototype.set = function() {
    throw new Error("Cannot invoke set on an Immutable Matrix instance");
  }, n.prototype.resize = function() {
    throw new Error("Cannot invoke resize on an Immutable Matrix instance");
  }, n.prototype.reshape = function() {
    throw new Error("Cannot invoke reshape on an Immutable Matrix instance");
  }, n.prototype.clone = function() {
    return new n({ data: Fr(this._data), size: Fr(this._size), datatype: this._datatype });
  }, n.prototype.toJSON = function() {
    return { mathjs: "ImmutableDenseMatrix", data: this._data, size: this._size, datatype: this._datatype };
  }, n.fromJSON = function(i) {
    return new n(i);
  }, n.prototype.swapRows = function() {
    throw new Error("Cannot invoke swapRows on an Immutable Matrix instance");
  }, n.prototype.min = function() {
    if (this._min === null) {
      var i = null;
      this.forEach(function(u) {
        (i === null || e(u, i)) && (i = u);
      }), this._min = i !== null ? i : void 0;
    }
    return this._min;
  }, n.prototype.max = function() {
    if (this._max === null) {
      var i = null;
      this.forEach(function(u) {
        (i === null || e(i, u)) && (i = u);
      }), this._max = i !== null ? i : void 0;
    }
    return this._max;
  }, n;
}, { isClass: true }), o0 = "Index", s0 = ["ImmutableDenseMatrix", "getMatrixDataType"], f0 = er(o0, s0, (r) => {
  var { ImmutableDenseMatrix: e, getMatrixDataType: t } = r;
  function n(u) {
    if (!(this instanceof n)) throw new SyntaxError("Constructor must be called with the new operator");
    this._dimensions = [], this._sourceSize = [], this._isScalar = true;
    for (var a = 0, o = arguments.length; a < o; a++) {
      var f = arguments[a], c = Pr(f), s = _r(f), h = typeof f, v = null;
      if (xi(f)) this._dimensions.push(f), this._isScalar = false;
      else if (c || s) {
        var p = void 0;
        t(f) === "boolean" ? (c && (p = i(Di(f).valueOf())), s && (p = i(Di(f._data).valueOf())), v = f.valueOf().length) : p = i(f.valueOf()), this._dimensions.push(p);
        var d = p.size();
        (d.length !== 1 || d[0] !== 1 || v !== null) && (this._isScalar = false);
      } else if (h === "number") this._dimensions.push(i([f]));
      else if (h === "bigint") this._dimensions.push(i([Number(f)]));
      else if (h === "string") this._dimensions.push(f);
      else throw new TypeError("Dimension must be an Array, Matrix, number, bigint, string, or Range");
      this._sourceSize.push(v);
    }
  }
  n.prototype.type = "Index", n.prototype.isIndex = true;
  function i(u) {
    for (var a = 0, o = u.length; a < o; a++) if (typeof u[a] != "number" || !zr(u[a])) throw new TypeError("Index parameters must be positive integer numbers");
    return new e(u);
  }
  return n.prototype.clone = function() {
    var u = new n();
    return u._dimensions = Fr(this._dimensions), u._isScalar = this._isScalar, u._sourceSize = this._sourceSize, u;
  }, n.create = function(u) {
    var a = new n();
    return n.apply(a, u), a;
  }, n.prototype.size = function() {
    for (var u = [], a = 0, o = this._dimensions.length; a < o; a++) {
      var f = this._dimensions[a];
      u[a] = typeof f == "string" ? 1 : f.size()[0];
    }
    return u;
  }, n.prototype.max = function() {
    for (var u = [], a = 0, o = this._dimensions.length; a < o; a++) {
      var f = this._dimensions[a];
      u[a] = typeof f == "string" ? f : f.max();
    }
    return u;
  }, n.prototype.min = function() {
    for (var u = [], a = 0, o = this._dimensions.length; a < o; a++) {
      var f = this._dimensions[a];
      u[a] = typeof f == "string" ? f : f.min();
    }
    return u;
  }, n.prototype.forEach = function(u) {
    for (var a = 0, o = this._dimensions.length; a < o; a++) u(this._dimensions[a], a, this);
  }, n.prototype.dimension = function(u) {
    return typeof u != "number" ? null : this._dimensions[u] || null;
  }, n.prototype.isObjectProperty = function() {
    return this._dimensions.length === 1 && typeof this._dimensions[0] == "string";
  }, n.prototype.getObjectProperty = function() {
    return this.isObjectProperty() ? this._dimensions[0] : null;
  }, n.prototype.isScalar = function() {
    return this._isScalar;
  }, n.prototype.toArray = function() {
    for (var u = [], a = 0, o = this._dimensions.length; a < o; a++) {
      var f = this._dimensions[a];
      u.push(typeof f == "string" ? f : f.toArray());
    }
    return u;
  }, n.prototype.valueOf = n.prototype.toArray, n.prototype.toString = function() {
    for (var u = [], a = 0, o = this._dimensions.length; a < o; a++) {
      var f = this._dimensions[a];
      typeof f == "string" ? u.push(JSON.stringify(f)) : u.push(f.toString());
    }
    return "[" + u.join(", ") + "]";
  }, n.prototype.toJSON = function() {
    return { mathjs: "Index", dimensions: this._dimensions };
  }, n.fromJSON = function(u) {
    return n.create(u.dimensions);
  }, n;
}, { isClass: true });
function Di(r) {
  var e = [];
  return r.forEach((t, n) => {
    t && e.push(n);
  }), e;
}
var c0 = "atan", l0 = ["typed"], h0 = er(c0, l0, (r) => {
  var { typed: e } = r;
  return e("atan", { number: function(n) {
    return Math.atan(n);
  }, Complex: function(n) {
    return n.atan();
  }, BigNumber: function(n) {
    return n.atan();
  } });
}), gu = er("trigUnit", ["typed"], (r) => {
  var { typed: e } = r;
  return { Unit: e.referToSelf((t) => (n) => {
    if (!n.hasBase(n.constructor.BASE_UNITS.ANGLE)) throw new TypeError("Unit in function cot is no angle");
    return e.find(t, n.valueType())(n.value);
  }) };
}), gi = "cos", v0 = ["typed"], p0 = er(gi, v0, (r) => {
  var { typed: e } = r, t = gu({ typed: e });
  return e(gi, { number: Math.cos, "Complex | BigNumber": (n) => n.cos() }, t);
}), yi = "sin", d0 = ["typed"], m0 = er(yi, d0, (r) => {
  var { typed: e } = r, t = gu({ typed: e });
  return e(yi, { number: Math.sin, "Complex | BigNumber": (n) => n.sin() }, t);
}), wi = "add", D0 = ["typed", "matrix", "addScalar", "equalScalar", "DenseMatrix", "SparseMatrix", "concat"], g0 = er(wi, D0, (r) => {
  var { typed: e, matrix: t, addScalar: n, equalScalar: i, DenseMatrix: u, SparseMatrix: a, concat: o } = r, f = vu({ typed: e }), c = If({ typed: e, equalScalar: i }), s = pu({ typed: e, DenseMatrix: u }), h = Me({ typed: e, matrix: t, concat: o });
  return e(wi, { "any, any": n, "any, any, ...any": e.referToSelf((v) => (p, d, l) => {
    for (var D = v(p, d), g = 0; g < l.length; g++) D = v(D, l[g]);
    return D;
  }) }, h({ elop: n, DS: f, SS: c, Ss: s }));
}), Ai = "norm", y0 = ["typed", "abs", "add", "pow", "conj", "sqrt", "multiply", "equalScalar", "larger", "smaller", "matrix", "ctranspose", "eigs"], w0 = er(Ai, y0, (r) => {
  var { typed: e, abs: t, add: n, pow: i, conj: u, sqrt: a, multiply: o, equalScalar: f, larger: c, smaller: s, matrix: h, ctranspose: v, eigs: p } = r;
  return e(Ai, { number: Math.abs, Complex: function(F) {
    return F.abs();
  }, BigNumber: function(F) {
    return F.abs();
  }, boolean: function(F) {
    return Math.abs(F);
  }, Array: function(F) {
    return w(h(F), 2);
  }, Matrix: function(F) {
    return w(F, 2);
  }, "Array, number | BigNumber | string": function(F, y) {
    return w(h(F), y);
  }, "Matrix, number | BigNumber | string": function(F, y) {
    return w(F, y);
  } });
  function d(_) {
    var F = 0;
    return _.forEach(function(y) {
      var M = t(y);
      c(M, F) && (F = M);
    }, true), F;
  }
  function l(_) {
    var F;
    return _.forEach(function(y) {
      var M = t(y);
      (!F || s(M, F)) && (F = M);
    }, true), F || 0;
  }
  function D(_, F) {
    if (F === Number.POSITIVE_INFINITY || F === "inf") return d(_);
    if (F === Number.NEGATIVE_INFINITY || F === "-inf") return l(_);
    if (F === "fro") return w(_, 2);
    if (typeof F == "number" && !isNaN(F)) {
      if (!f(F, 0)) {
        var y = 0;
        return _.forEach(function(M) {
          y = n(i(t(M), F), y);
        }, true), i(y, 1 / F);
      }
      return Number.POSITIVE_INFINITY;
    }
    throw new Error("Unsupported parameter value");
  }
  function g(_) {
    var F = 0;
    return _.forEach(function(y, M) {
      F = n(F, o(y, u(y)));
    }), t(a(F));
  }
  function E(_) {
    var F = [], y = 0;
    return _.forEach(function(M, B) {
      var S = B[1], O = n(F[S] || 0, t(M));
      c(O, y) && (y = O), F[S] = O;
    }, true), y;
  }
  function m(_) {
    var F = _.size();
    if (F[0] !== F[1]) throw new RangeError("Invalid matrix dimensions");
    var y = v(_), M = o(y, _), B = p(M).values.toArray(), S = B[B.length - 1];
    return t(a(S));
  }
  function C(_) {
    var F = [], y = 0;
    return _.forEach(function(M, B) {
      var S = B[0], O = n(F[S] || 0, t(M));
      c(O, y) && (y = O), F[S] = O;
    }, true), y;
  }
  function A(_, F) {
    if (F === 1) return E(_);
    if (F === Number.POSITIVE_INFINITY || F === "inf") return C(_);
    if (F === "fro") return g(_);
    if (F === 2) return m(_);
    throw new Error("Unsupported parameter value " + F);
  }
  function w(_, F) {
    var y = _.size();
    if (y.length === 1) return D(_, F);
    if (y.length === 2) {
      if (y[0] && y[1]) return A(_, F);
      throw new RangeError("Invalid matrix dimensions");
    }
  }
}), Fi = "dot", A0 = ["typed", "addScalar", "multiplyScalar", "conj", "size"], F0 = er(Fi, A0, (r) => {
  var { typed: e, addScalar: t, multiplyScalar: n, conj: i, size: u } = r;
  return e(Fi, { "Array | DenseMatrix, Array | DenseMatrix": o, "SparseMatrix, SparseMatrix": f });
  function a(s, h) {
    var v = c(s), p = c(h), d, l;
    if (v.length === 1) d = v[0];
    else if (v.length === 2 && v[1] === 1) d = v[0];
    else throw new RangeError("Expected a column vector, instead got a matrix of size (" + v.join(", ") + ")");
    if (p.length === 1) l = p[0];
    else if (p.length === 2 && p[1] === 1) l = p[0];
    else throw new RangeError("Expected a column vector, instead got a matrix of size (" + p.join(", ") + ")");
    if (d !== l) throw new RangeError("Vectors must have equal length (" + d + " != " + l + ")");
    if (d === 0) throw new RangeError("Cannot calculate the dot product of empty vectors");
    return d;
  }
  function o(s, h) {
    var v = a(s, h), p = _r(s) ? s._data : s, d = _r(s) ? s._datatype || s.getDataType() : void 0, l = _r(h) ? h._data : h, D = _r(h) ? h._datatype || h.getDataType() : void 0, g = c(s).length === 2, E = c(h).length === 2, m = t, C = n;
    if (d && D && d === D && typeof d == "string" && d !== "mixed") {
      var A = d;
      m = e.find(t, [A, A]), C = e.find(n, [A, A]);
    }
    if (!g && !E) {
      for (var w = C(i(p[0]), l[0]), _ = 1; _ < v; _++) w = m(w, C(i(p[_]), l[_]));
      return w;
    }
    if (!g && E) {
      for (var F = C(i(p[0]), l[0][0]), y = 1; y < v; y++) F = m(F, C(i(p[y]), l[y][0]));
      return F;
    }
    if (g && !E) {
      for (var M = C(i(p[0][0]), l[0]), B = 1; B < v; B++) M = m(M, C(i(p[B][0]), l[B]));
      return M;
    }
    if (g && E) {
      for (var S = C(i(p[0][0]), l[0][0]), O = 1; O < v; O++) S = m(S, C(i(p[O][0]), l[O][0]));
      return S;
    }
  }
  function f(s, h) {
    a(s, h);
    for (var v = s._index, p = s._values, d = h._index, l = h._values, D = 0, g = t, E = n, m = 0, C = 0; m < v.length && C < d.length; ) {
      var A = v[m], w = d[C];
      if (A < w) {
        m++;
        continue;
      }
      if (A > w) {
        C++;
        continue;
      }
      A === w && (D = g(D, E(p[m], l[C])), m++, C++);
    }
    return D;
  }
  function c(s) {
    return _r(s) ? s.size() : u(s);
  }
}), Ei = "qr", E0 = ["typed", "matrix", "zeros", "identity", "isZero", "equal", "sign", "sqrt", "conj", "unaryMinus", "addScalar", "divideScalar", "multiplyScalar", "subtractScalar", "complex"], C0 = er(Ei, E0, (r) => {
  var { typed: e, matrix: t, zeros: n, identity: i, isZero: u, equal: a, sign: o, sqrt: f, conj: c, unaryMinus: s, addScalar: h, divideScalar: v, multiplyScalar: p, subtractScalar: d, complex: l } = r;
  return Le(e(Ei, { DenseMatrix: function(C) {
    return g(C);
  }, SparseMatrix: function(C) {
    return E();
  }, Array: function(C) {
    var A = t(C), w = g(A);
    return { Q: w.Q.valueOf(), R: w.R.valueOf() };
  } }), { _denseQRimpl: D });
  function D(m) {
    var C = m._size[0], A = m._size[1], w = i([C], "dense"), _ = w._data, F = m.clone(), y = F._data, M, B, S, O = n([C], "");
    for (S = 0; S < Math.min(A, C); ++S) {
      var x = y[S][S], $ = s(a(x, 0) ? 1 : o(x)), T = c($), Q = 0;
      for (M = S; M < C; M++) Q = h(Q, p(y[M][S], c(y[M][S])));
      var R = p($, f(Q));
      if (!u(R)) {
        var L = d(x, R);
        for (O[S] = 1, M = S + 1; M < C; M++) O[M] = v(y[M][S], L);
        var nr = s(c(v(L, R))), ar = void 0;
        for (B = S; B < A; B++) {
          for (ar = 0, M = S; M < C; M++) ar = h(ar, p(c(O[M]), y[M][B]));
          for (ar = p(ar, nr), M = S; M < C; M++) y[M][B] = p(d(y[M][B], p(O[M], ar)), T);
        }
        for (M = 0; M < C; M++) {
          for (ar = 0, B = S; B < C; B++) ar = h(ar, p(_[M][B], O[B]));
          for (ar = p(ar, nr), B = S; B < C; ++B) _[M][B] = v(d(_[M][B], p(ar, c(O[B]))), T);
        }
      }
    }
    return { Q: w, R: F, toString: function() {
      return "Q: " + this.Q.toString() + `
R: ` + this.R.toString();
    } };
  }
  function g(m) {
    var C = D(m), A = C.R._data;
    if (m._data.length > 0) for (var w = A[0][0].type === "Complex" ? l(0) : 0, _ = 0; _ < A.length; ++_) for (var F = 0; F < _ && F < (A[0] || []).length; ++F) A[_][F] = w;
    return C;
  }
  function E(m) {
    throw new Error("qr not implemented for sparse matrices yet");
  }
}), Ci = "det", b0 = ["typed", "matrix", "subtractScalar", "multiply", "divideScalar", "isZero", "unaryMinus"], _0 = er(Ci, b0, (r) => {
  var { typed: e, matrix: t, subtractScalar: n, multiply: i, divideScalar: u, isZero: a, unaryMinus: o } = r;
  return e(Ci, { any: function(s) {
    return Fr(s);
  }, "Array | Matrix": function(s) {
    var h;
    switch (_r(s) ? h = s.size() : Array.isArray(s) ? (s = t(s), h = s.size()) : h = [], h.length) {
      case 0:
        return Fr(s);
      case 1:
        if (h[0] === 1) return Fr(s.valueOf()[0]);
        if (h[0] === 0) return 1;
        throw new RangeError("Matrix must be square (size: " + Or(h) + ")");
      case 2: {
        var v = h[0], p = h[1];
        if (v === p) return f(s.clone().valueOf(), v);
        if (p === 0) return 1;
        throw new RangeError("Matrix must be square (size: " + Or(h) + ")");
      }
      default:
        throw new RangeError("Matrix must be two dimensional (size: " + Or(h) + ")");
    }
  } });
  function f(c, s, h) {
    if (s === 1) return Fr(c[0][0]);
    if (s === 2) return n(i(c[0][0], c[1][1]), i(c[1][0], c[0][1]));
    for (var v = false, p = new Array(s).fill(0).map((_, F) => F), d = 0; d < s; d++) {
      var l = p[d];
      if (a(c[l][d])) {
        var D = void 0;
        for (D = d + 1; D < s; D++) if (!a(c[p[D]][d])) {
          l = p[D], p[D] = p[d], p[d] = l, v = !v;
          break;
        }
        if (D === s) return c[l][d];
      }
      for (var g = c[l][d], E = d === 0 ? 1 : c[p[d - 1]][d - 1], m = d + 1; m < s; m++) for (var C = p[m], A = d + 1; A < s; A++) c[C][A] = u(n(i(c[C][A], g), i(c[C][d], c[l][A])), E);
    }
    var w = c[p[s - 1]][s - 1];
    return v ? o(w) : w;
  }
}), bi = "inv", B0 = ["typed", "matrix", "divideScalar", "addScalar", "multiply", "unaryMinus", "det", "identity", "abs"], M0 = er(bi, B0, (r) => {
  var { typed: e, matrix: t, divideScalar: n, addScalar: i, multiply: u, unaryMinus: a, det: o, identity: f, abs: c } = r;
  return e(bi, { "Array | Matrix": function(v) {
    var p = _r(v) ? v.size() : wr(v);
    switch (p.length) {
      case 1:
        if (p[0] === 1) return _r(v) ? t([n(1, v.valueOf()[0])]) : [n(1, v[0])];
        throw new RangeError("Matrix must be square (size: " + Or(p) + ")");
      case 2: {
        var d = p[0], l = p[1];
        if (d === l) return _r(v) ? t(s(v.valueOf(), d, l), v.storage()) : s(v, d, l);
        throw new RangeError("Matrix must be square (size: " + Or(p) + ")");
      }
      default:
        throw new RangeError("Matrix must be two dimensional (size: " + Or(p) + ")");
    }
  }, any: function(v) {
    return n(1, v);
  } });
  function s(h, v, p) {
    var d, l, D, g, E;
    if (v === 1) {
      if (g = h[0][0], g === 0) throw Error("Cannot calculate inverse, determinant is zero");
      return [[n(1, g)]];
    } else if (v === 2) {
      var m = o(h);
      if (m === 0) throw Error("Cannot calculate inverse, determinant is zero");
      return [[n(h[1][1], m), n(a(h[0][1]), m)], [n(a(h[1][0]), m), n(h[0][0], m)]];
    } else {
      var C = h.concat();
      for (d = 0; d < v; d++) C[d] = C[d].concat();
      for (var A = f(v).valueOf(), w = 0; w < p; w++) {
        var _ = c(C[w][w]), F = w;
        for (d = w + 1; d < v; ) c(C[d][w]) > _ && (_ = c(C[d][w]), F = d), d++;
        if (_ === 0) throw Error("Cannot calculate inverse, determinant is zero");
        d = F, d !== w && (E = C[w], C[w] = C[d], C[d] = E, E = A[w], A[w] = A[d], A[d] = E);
        var y = C[w], M = A[w];
        for (d = 0; d < v; d++) {
          var B = C[d], S = A[d];
          if (d !== w) {
            if (B[w] !== 0) {
              for (D = n(a(B[w]), y[w]), l = w; l < p; l++) B[l] = i(B[l], u(D, y[l]));
              for (l = 0; l < p; l++) S[l] = i(S[l], u(D, M[l]));
            }
          } else {
            for (D = y[w], l = w; l < p; l++) B[l] = n(B[l], D);
            for (l = 0; l < p; l++) S[l] = n(S[l], D);
          }
        }
      }
      return A;
    }
  }
});
function S0(r) {
  var { addScalar: e, subtract: t, flatten: n, multiply: i, multiplyScalar: u, divideScalar: a, sqrt: o, abs: f, bignumber: c, diag: s, size: h, reshape: v, inv: p, qr: d, usolve: l, usolveAll: D, equal: g, complex: E, larger: m, smaller: C, matrixFromColumns: A, dot: w } = r;
  function _(U, Z, tr, ur) {
    var j = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true, W = F(U, Z, tr, ur, j);
    y(U, Z, tr, ur, j, W);
    var { values: H, C: X } = M(U, Z, tr, ur, j);
    if (j) {
      var G = B(U, Z, X, W, H, tr, ur);
      return { values: H, eigenvectors: G };
    }
    return { values: H };
  }
  function F(U, Z, tr, ur, j) {
    var W = ur === "BigNumber", H = ur === "Complex", X = W ? c(0) : 0, G = W ? c(1) : H ? E(1) : 1, sr = W ? c(1) : 1, k = W ? c(10) : 2, hr = u(k, k), mr;
    j && (mr = Array(Z).fill(G));
    for (var Dr = false; !Dr; ) {
      Dr = true;
      for (var yr = 0; yr < Z; yr++) {
        for (var Ar = X, Er = X, Ir = 0; Ir < Z; Ir++) yr !== Ir && (Ar = e(Ar, f(U[Ir][yr])), Er = e(Er, f(U[yr][Ir])));
        if (!g(Ar, 0) && !g(Er, 0)) {
          for (var Br = sr, Nr = Ar, Yr = a(Er, k), b = u(Er, k); C(Nr, Yr); ) Nr = u(Nr, hr), Br = u(Br, k);
          for (; m(Nr, b); ) Nr = a(Nr, hr), Br = a(Br, k);
          var N = C(a(e(Nr, Er), Br), u(e(Ar, Er), 0.95));
          if (N) {
            Dr = false;
            for (var z = a(1, Br), P = 0; P < Z; P++) yr !== P && (U[yr][P] = u(U[yr][P], z), U[P][yr] = u(U[P][yr], Br));
            j && (mr[yr] = u(mr[yr], z));
          }
        }
      }
    }
    return j ? s(mr) : null;
  }
  function y(U, Z, tr, ur, j, W) {
    var H = ur === "BigNumber", X = ur === "Complex", G = H ? c(0) : X ? E(0) : 0;
    H && (tr = c(tr));
    for (var sr = 0; sr < Z - 2; sr++) {
      for (var k = 0, hr = G, mr = sr + 1; mr < Z; mr++) {
        var Dr = U[mr][sr];
        C(f(hr), f(Dr)) && (hr = Dr, k = mr);
      }
      if (!C(f(hr), tr)) {
        if (k !== sr + 1) {
          var yr = U[k];
          U[k] = U[sr + 1], U[sr + 1] = yr;
          for (var Ar = 0; Ar < Z; Ar++) {
            var Er = U[Ar][k];
            U[Ar][k] = U[Ar][sr + 1], U[Ar][sr + 1] = Er;
          }
          if (j) {
            var Ir = W[k];
            W[k] = W[sr + 1], W[sr + 1] = Ir;
          }
        }
        for (var Br = sr + 2; Br < Z; Br++) {
          var Nr = a(U[Br][sr], hr);
          if (Nr !== 0) {
            for (var Yr = 0; Yr < Z; Yr++) U[Br][Yr] = t(U[Br][Yr], u(Nr, U[sr + 1][Yr]));
            for (var b = 0; b < Z; b++) U[b][sr + 1] = e(U[b][sr + 1], u(Nr, U[b][Br]));
            if (j) for (var N = 0; N < Z; N++) W[Br][N] = t(W[Br][N], u(Nr, W[sr + 1][N]));
          }
        }
      }
    }
    return W;
  }
  function M(U, Z, tr, ur, j) {
    var W = ur === "BigNumber", H = ur === "Complex", X = W ? c(1) : H ? E(1) : 1;
    W && (tr = c(tr));
    for (var G = Fr(U), sr = [], k = Z, hr = [], mr = j ? s(Array(Z).fill(X)) : void 0, Dr = j ? s(Array(k).fill(X)) : void 0, yr = 0; yr <= 100; ) {
      yr += 1;
      for (var Ar = G[k - 1][k - 1], Er = 0; Er < k; Er++) G[Er][Er] = t(G[Er][Er], Ar);
      var { Q: Ir, R: Br } = d(G);
      G = i(Br, Ir);
      for (var Nr = 0; Nr < k; Nr++) G[Nr][Nr] = e(G[Nr][Nr], Ar);
      if (j && (Dr = i(Dr, Ir)), k === 1 || C(f(G[k - 1][k - 2]), tr)) {
        yr = 0, sr.push(G[k - 1][k - 1]), j && (hr.unshift([[1]]), x(Dr, Z), mr = i(mr, Dr), k > 1 && (Dr = s(Array(k - 1).fill(X)))), k -= 1, G.pop();
        for (var Yr = 0; Yr < k; Yr++) G[Yr].pop();
      } else if (k === 2 || C(f(G[k - 2][k - 3]), tr)) {
        yr = 0;
        var b = S(G[k - 2][k - 2], G[k - 2][k - 1], G[k - 1][k - 2], G[k - 1][k - 1]);
        sr.push(...b), j && (hr.unshift(O(G[k - 2][k - 2], G[k - 2][k - 1], G[k - 1][k - 2], G[k - 1][k - 1], b[0], b[1], tr, ur)), x(Dr, Z), mr = i(mr, Dr), k > 2 && (Dr = s(Array(k - 2).fill(X)))), k -= 2, G.pop(), G.pop();
        for (var N = 0; N < k; N++) G[N].pop(), G[N].pop();
      }
      if (k === 0) break;
    }
    if (sr.sort((J, q) => +t(f(J), f(q))), yr > 100) {
      var z = Error("The eigenvalues failed to converge. Only found these eigenvalues: " + sr.join(", "));
      throw z.values = sr, z.vectors = [], z;
    }
    var P = j ? i(mr, $(hr, Z)) : void 0;
    return { values: sr, C: P };
  }
  function B(U, Z, tr, ur, j, W, H) {
    var X = p(tr), G = i(X, U, tr), sr = H === "BigNumber", k = H === "Complex", hr = sr ? c(0) : k ? E(0) : 0, mr = sr ? c(1) : k ? E(1) : 1, Dr = [], yr = [];
    for (var Ar of j) {
      var Er = T(Dr, Ar, g);
      Er === -1 ? (Dr.push(Ar), yr.push(1)) : yr[Er] += 1;
    }
    for (var Ir = [], Br = Dr.length, Nr = Array(Z).fill(hr), Yr = s(Array(Z).fill(mr)), b = function() {
      var P = Dr[N], J = t(G, i(P, Yr)), q = D(J, Nr);
      for (q.shift(); q.length < yr[N]; ) {
        var rr = Q(J, Z, q, W, H);
        if (rr === null) break;
        q.push(rr);
      }
      var K = i(p(ur), tr);
      q = q.map((or) => i(K, or)), Ir.push(...q.map((or) => ({ value: P, vector: n(or) })));
    }, N = 0; N < Br; N++) b();
    return Ir;
  }
  function S(U, Z, tr, ur) {
    var j = e(U, ur), W = t(u(U, ur), u(Z, tr)), H = u(j, 0.5), X = u(o(t(u(j, j), u(4, W))), 0.5);
    return [e(H, X), t(H, X)];
  }
  function O(U, Z, tr, ur, j, W, H, X) {
    var G = X === "BigNumber", sr = X === "Complex", k = G ? c(0) : sr ? E(0) : 0, hr = G ? c(1) : sr ? E(1) : 1;
    if (C(f(tr), H)) return [[hr, k], [k, hr]];
    if (m(f(t(j, W)), H)) return [[t(j, ur), t(W, ur)], [tr, tr]];
    var mr = t(U, j), Dr = t(ur, j);
    return C(f(Z), H) && C(f(Dr), H) ? [[mr, hr], [tr, k]] : [[Z, k], [Dr, hr]];
  }
  function x(U, Z) {
    for (var tr = 0; tr < U.length; tr++) U[tr].push(...Array(Z - U[tr].length).fill(0));
    for (var ur = U.length; ur < Z; ur++) U.push(Array(Z).fill(0)), U[ur][ur] = 1;
    return U;
  }
  function $(U, Z) {
    for (var tr = [], ur = 0; ur < Z; ur++) tr[ur] = Array(Z).fill(0);
    var j = 0;
    for (var W of U) {
      for (var H = W.length, X = 0; X < H; X++) for (var G = 0; G < H; G++) tr[j + X][j + G] = W[X][G];
      j += H;
    }
    return tr;
  }
  function T(U, Z, tr) {
    for (var ur = 0; ur < U.length; ur++) if (tr(U[ur], Z)) return ur;
    return -1;
  }
  function Q(U, Z, tr, ur, j) {
    for (var W = j === "BigNumber" ? c(1e3) : 1e3, H, X = 0; X < 5; ++X) {
      H = R(Z, tr, j);
      try {
        H = l(U, H);
      } catch {
        continue;
      }
      if (m(nr(H), W)) break;
    }
    if (X >= 5) return null;
    for (X = 0; ; ) {
      var G = l(U, H);
      if (C(nr(L(H, [G])), ur)) break;
      if (++X >= 10) return null;
      H = ar(G);
    }
    return H;
  }
  function R(U, Z, tr) {
    var ur = tr === "BigNumber", j = tr === "Complex", W = Array(U).fill(0).map((H) => 2 * Math.random() - 1);
    return ur && (W = W.map((H) => c(H))), j && (W = W.map((H) => E(H))), W = L(W, Z), ar(W, tr);
  }
  function L(U, Z) {
    var tr = h(U);
    for (var ur of Z) ur = v(ur, tr), U = t(U, i(a(w(ur, U), w(ur, ur)), ur));
    return U;
  }
  function nr(U) {
    return f(o(w(U, U)));
  }
  function ar(U, Z) {
    var tr = Z === "BigNumber", ur = Z === "Complex", j = tr ? c(1) : ur ? E(1) : 1;
    return i(a(j, nr(U)), U);
  }
  return _;
}
function N0(r) {
  var { config: e, addScalar: t, subtract: n, abs: i, atan: u, cos: a, sin: o, multiplyScalar: f, inv: c, bignumber: s, multiply: h, add: v } = r;
  function p(y, M) {
    var B = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : e.relTol, S = arguments.length > 3 ? arguments[3] : void 0, O = arguments.length > 4 ? arguments[4] : void 0;
    if (S === "number") return d(y, B, O);
    if (S === "BigNumber") return l(y, B, O);
    throw TypeError("Unsupported data type: " + S);
  }
  function d(y, M, B) {
    var S = y.length, O = Math.abs(M / S), x, $;
    if (B) {
      $ = new Array(S);
      for (var T = 0; T < S; T++) $[T] = Array(S).fill(0), $[T][T] = 1;
    }
    for (var Q = w(y); Math.abs(Q[1]) >= Math.abs(O); ) {
      var R = Q[0][0], L = Q[0][1];
      x = D(y[R][R], y[L][L], y[R][L]), y = A(y, x, R, L), B && ($ = E($, x, R, L)), Q = w(y);
    }
    for (var nr = Array(S).fill(0), ar = 0; ar < S; ar++) nr[ar] = y[ar][ar];
    return F(Fr(nr), $, B);
  }
  function l(y, M, B) {
    var S = y.length, O = i(M / S), x, $;
    if (B) {
      $ = new Array(S);
      for (var T = 0; T < S; T++) $[T] = Array(S).fill(0), $[T][T] = 1;
    }
    for (var Q = _(y); i(Q[1]) >= i(O); ) {
      var R = Q[0][0], L = Q[0][1];
      x = g(y[R][R], y[L][L], y[R][L]), y = C(y, x, R, L), B && ($ = m($, x, R, L)), Q = _(y);
    }
    for (var nr = Array(S).fill(0), ar = 0; ar < S; ar++) nr[ar] = y[ar][ar];
    return F(Fr(nr), $, B);
  }
  function D(y, M, B) {
    var S = M - y;
    return Math.abs(S) <= e.relTol ? Math.PI / 4 : 0.5 * Math.atan(2 * B / (M - y));
  }
  function g(y, M, B) {
    var S = n(M, y);
    return i(S) <= e.relTol ? s(-1).acos().div(4) : f(0.5, u(h(2, B, c(S))));
  }
  function E(y, M, B, S) {
    for (var O = y.length, x = Math.cos(M), $ = Math.sin(M), T = Array(O).fill(0), Q = Array(O).fill(0), R = 0; R < O; R++) T[R] = x * y[R][B] - $ * y[R][S], Q[R] = $ * y[R][B] + x * y[R][S];
    for (var L = 0; L < O; L++) y[L][B] = T[L], y[L][S] = Q[L];
    return y;
  }
  function m(y, M, B, S) {
    for (var O = y.length, x = a(M), $ = o(M), T = Array(O).fill(s(0)), Q = Array(O).fill(s(0)), R = 0; R < O; R++) T[R] = n(f(x, y[R][B]), f($, y[R][S])), Q[R] = t(f($, y[R][B]), f(x, y[R][S]));
    for (var L = 0; L < O; L++) y[L][B] = T[L], y[L][S] = Q[L];
    return y;
  }
  function C(y, M, B, S) {
    for (var O = y.length, x = s(a(M)), $ = s(o(M)), T = f(x, x), Q = f($, $), R = Array(O).fill(s(0)), L = Array(O).fill(s(0)), nr = h(s(2), x, $, y[B][S]), ar = t(n(f(T, y[B][B]), nr), f(Q, y[S][S])), U = v(f(Q, y[B][B]), nr, f(T, y[S][S])), Z = 0; Z < O; Z++) R[Z] = n(f(x, y[B][Z]), f($, y[S][Z])), L[Z] = t(f($, y[B][Z]), f(x, y[S][Z]));
    y[B][B] = ar, y[S][S] = U, y[B][S] = s(0), y[S][B] = s(0);
    for (var tr = 0; tr < O; tr++) tr !== B && tr !== S && (y[B][tr] = R[tr], y[tr][B] = R[tr], y[S][tr] = L[tr], y[tr][S] = L[tr]);
    return y;
  }
  function A(y, M, B, S) {
    for (var O = y.length, x = Math.cos(M), $ = Math.sin(M), T = x * x, Q = $ * $, R = Array(O).fill(0), L = Array(O).fill(0), nr = T * y[B][B] - 2 * x * $ * y[B][S] + Q * y[S][S], ar = Q * y[B][B] + 2 * x * $ * y[B][S] + T * y[S][S], U = 0; U < O; U++) R[U] = x * y[B][U] - $ * y[S][U], L[U] = $ * y[B][U] + x * y[S][U];
    y[B][B] = nr, y[S][S] = ar, y[B][S] = 0, y[S][B] = 0;
    for (var Z = 0; Z < O; Z++) Z !== B && Z !== S && (y[B][Z] = R[Z], y[Z][B] = R[Z], y[S][Z] = L[Z], y[Z][S] = L[Z]);
    return y;
  }
  function w(y) {
    for (var M = y.length, B = 0, S = [0, 1], O = 0; O < M; O++) for (var x = O + 1; x < M; x++) Math.abs(B) < Math.abs(y[O][x]) && (B = Math.abs(y[O][x]), S = [O, x]);
    return [S, B];
  }
  function _(y) {
    for (var M = y.length, B = 0, S = [0, 1], O = 0; O < M; O++) for (var x = O + 1; x < M; x++) i(B) < i(y[O][x]) && (B = i(y[O][x]), S = [O, x]);
    return [S, B];
  }
  function F(y, M, B) {
    var S = y.length, O = Array(S), x;
    if (B) {
      x = Array(S);
      for (var $ = 0; $ < S; $++) x[$] = Array(S);
    }
    for (var T = 0; T < S; T++) {
      for (var Q = 0, R = y[0], L = 0; L < y.length; L++) i(y[L]) < i(R) && (Q = L, R = y[Q]);
      if (O[T] = y.splice(Q, 1)[0], B) for (var nr = 0; nr < S; nr++) x[T][nr] = M[nr][Q], M[nr].splice(Q, 1);
    }
    if (!B) return { values: O };
    var ar = x.map((U, Z) => ({ value: O[Z], vector: U }));
    return { values: O, eigenvectors: ar };
  }
  return p;
}
var x0 = "eigs", T0 = ["config", "typed", "matrix", "addScalar", "equal", "subtract", "abs", "atan", "cos", "sin", "multiplyScalar", "divideScalar", "inv", "bignumber", "multiply", "add", "larger", "column", "flatten", "number", "complex", "sqrt", "diag", "size", "reshape", "qr", "usolve", "usolveAll", "im", "re", "smaller", "matrixFromColumns", "dot"], z0 = er(x0, T0, (r) => {
  var { config: e, typed: t, matrix: n, addScalar: i, subtract: u, equal: a, abs: o, atan: f, cos: c, sin: s, multiplyScalar: h, divideScalar: v, inv: p, bignumber: d, multiply: l, add: D, larger: g, column: E, flatten: m, number: C, complex: A, sqrt: w, diag: _, size: F, reshape: y, qr: M, usolve: B, usolveAll: S, im: O, re: x, smaller: $, matrixFromColumns: T, dot: Q } = r, R = N0({ config: e, addScalar: i, subtract: u, abs: o, atan: f, cos: c, sin: s, multiplyScalar: h, inv: p, bignumber: d, multiply: l, add: D }), L = S0({ addScalar: i, subtract: u, multiply: l, multiplyScalar: h, flatten: m, divideScalar: v, sqrt: w, abs: o, bignumber: d, diag: _, size: F, reshape: y, qr: M, inv: p, usolve: B, usolveAll: S, equal: a, complex: A, larger: g, smaller: $, matrixFromColumns: T, dot: Q });
  return t("eigs", { Array: function(W) {
    return nr(n(W));
  }, "Array, number|BigNumber": function(W, H) {
    return nr(n(W), { precision: H });
  }, "Array, Object"(j, W) {
    return nr(n(j), W);
  }, Matrix: function(W) {
    return nr(W, { matricize: true });
  }, "Matrix, number|BigNumber": function(W, H) {
    return nr(W, { precision: H, matricize: true });
  }, "Matrix, Object": function(W, H) {
    var X = { matricize: true };
    return Le(X, H), nr(W, X);
  } });
  function nr(j) {
    var W, H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, X = "eigenvectors" in H ? H.eigenvectors : true, G = (W = H.precision) !== null && W !== void 0 ? W : e.relTol, sr = ar(j, G, X);
    return H.matricize && (sr.values = n(sr.values), X && (sr.eigenvectors = sr.eigenvectors.map((k) => {
      var { value: hr, vector: mr } = k;
      return { value: hr, vector: n(mr) };
    }))), X && Object.defineProperty(sr, "vectors", { enumerable: false, get: () => {
      throw new Error("eigs(M).vectors replaced with eigs(M).eigenvectors");
    } }), sr;
  }
  function ar(j, W, H) {
    var X = j.toArray(), G = j.size();
    if (G.length !== 2 || G[0] !== G[1]) throw new RangeError("Matrix must be square (size: ".concat(Or(G), ")"));
    var sr = G[0];
    if (Z(X, sr, W) && (tr(X, sr), U(X, sr, W))) {
      var k = ur(j, X, sr);
      return R(X, sr, W, k, H);
    }
    var hr = ur(j, X, sr);
    return L(X, sr, W, hr, H);
  }
  function U(j, W, H) {
    for (var X = 0; X < W; X++) for (var G = X; G < W; G++) if (g(d(o(u(j[X][G], j[G][X]))), H)) return false;
    return true;
  }
  function Z(j, W, H) {
    for (var X = 0; X < W; X++) for (var G = 0; G < W; G++) if (g(d(o(O(j[X][G]))), H)) return false;
    return true;
  }
  function tr(j, W) {
    for (var H = 0; H < W; H++) for (var X = 0; X < W; X++) j[H][X] = x(j[H][X]);
  }
  function ur(j, W, H) {
    var X = j.datatype();
    if (X === "number" || X === "BigNumber" || X === "Complex") return X;
    for (var G = false, sr = false, k = false, hr = 0; hr < H; hr++) for (var mr = 0; mr < H; mr++) {
      var Dr = W[hr][mr];
      if (xr(Dr) || jt(Dr)) G = true;
      else if (Rr(Dr)) sr = true;
      else if (kt(Dr)) k = true;
      else throw TypeError("Unsupported type in Matrix: " + te(Dr));
    }
    if (sr && k && console.warn("Complex BigNumbers not supported, this operation will lose precission."), k) {
      for (var yr = 0; yr < H; yr++) for (var Ar = 0; Ar < H; Ar++) W[yr][Ar] = A(W[yr][Ar]);
      return "Complex";
    }
    if (sr) {
      for (var Er = 0; Er < H; Er++) for (var Ir = 0; Ir < H; Ir++) W[Er][Ir] = d(W[Er][Ir]);
      return "BigNumber";
    }
    if (G) {
      for (var Br = 0; Br < H; Br++) for (var Nr = 0; Nr < H; Nr++) W[Br][Nr] = C(W[Br][Nr]);
      return "number";
    } else throw TypeError("Matrix contains unsupported types only.");
  }
}), I0 = "divide", O0 = ["typed", "matrix", "multiply", "equalScalar", "divideScalar", "inv"], $0 = er(I0, O0, (r) => {
  var { typed: e, matrix: t, multiply: n, equalScalar: i, divideScalar: u, inv: a } = r, o = hu({ typed: e, equalScalar: i }), f = sn({ typed: e });
  return e("divide", Ti({ "Array | Matrix, Array | Matrix": function(s, h) {
    return n(s, a(h));
  }, "DenseMatrix, any": function(s, h) {
    return f(s, h, u, false);
  }, "SparseMatrix, any": function(s, h) {
    return o(s, h, u, false);
  }, "Array, any": function(s, h) {
    return f(t(s), h, u, false).valueOf();
  }, "any, Array | Matrix": function(s, h) {
    return n(s, a(h));
  } }, u.signatures));
}), _i = "mean", P0 = ["typed", "add", "divide"], q0 = er(_i, P0, (r) => {
  var { typed: e, add: t, divide: n } = r;
  return e(_i, { "Array | Matrix": u, "Array | Matrix, number | BigNumber": i, "...": function(o) {
    if (Cs(o)) throw new TypeError("Scalar values expected in function mean");
    return u(o);
  } });
  function i(a, o) {
    try {
      var f = _s(a, o, t), c = Array.isArray(a) ? wr(a) : a.size();
      return n(f, c[o]);
    } catch (s) {
      throw hi(s, "mean");
    }
  }
  function u(a) {
    var o, f = 0;
    if (bs(a, function(c) {
      try {
        o = o === void 0 ? c : t(o, c), f++;
      } catch (s) {
        throw hi(s, "mean", c);
      }
    }), f === 0) throw new Error("Cannot calculate the mean of an empty array");
    return n(o, f);
  }
}), tt = Wo({ config: Kr }), zt = Go({}), fn = ns({}), cn = as({}), ee = Fs({ Matrix: cn }), cr = Ya({ BigNumber: tt, Complex: zt, DenseMatrix: ee, Fraction: fn }), ln = sf({ typed: cr }), Qe = cf({ typed: cr }), R0 = h0({ typed: cr }), hn = Ks({ Complex: zt, typed: cr }), It = kf({ typed: cr }), U0 = p0({ typed: cr }), pe = $s({ config: Kr, typed: cr }), yu = hc({ typed: cr }), L0 = pc({ typed: cr }), Z0 = rc({ typed: cr }), wu = Ms({ typed: cr }), V0 = xs({ config: Kr, typed: cr }), vn = zs({ equalScalar: pe, typed: cr }), Se = Rf({ typed: cr }), pn = Ws({ typed: cr }), W0 = tc({ typed: cr }), J0 = Vf({ BigNumber: tt, Fraction: fn, complex: hn, typed: cr }), Y0 = m0({ typed: cr }), ge = Rs({ Matrix: cn, equalScalar: pe, typed: cr }), nt = hf({ typed: cr }), it = Qs({ BigNumber: tt, typed: cr }), Sr = ef({ DenseMatrix: ee, Matrix: cn, SparseMatrix: ge, typed: cr }), Q0 = Ec({ isInteger: wu, matrix: Sr, typed: cr }), dn = Yf({ Complex: zt, config: Kr, typed: cr }), X0 = Bc({ matrix: Sr, typed: cr }), G0 = xc({ BigNumber: tt, config: Kr, matrix: Sr, typed: cr }), Ne = ic({ isInteger: wu, matrix: Sr, typed: cr }), K0 = Sc({ conj: It, transpose: X0, typed: cr }), H0 = cc({ DenseMatrix: ee, SparseMatrix: ge, matrix: Sr, typed: cr }), mn = Wc({ DenseMatrix: ee, SparseMatrix: ge, concat: Ne, equalScalar: pe, matrix: Sr, typed: cr }), Au = js({ Fraction: fn, typed: cr }), Dn = mc({ BigNumber: tt, DenseMatrix: ee, SparseMatrix: ge, config: Kr, matrix: Sr, typed: cr }), vl = gc({ matrix: Sr, multiplyScalar: Se, typed: cr }), k0 = t0({ DenseMatrix: ee, SparseMatrix: ge, concat: Ne, config: Kr, matrix: Sr, typed: cr }), j0 = Ic({ bignumber: it, fraction: Au, number: pn }), gn = bc({ matrix: Sr, config: Kr, typed: cr }), Ot = Qc({ DenseMatrix: ee, SparseMatrix: ge, bignumber: it, concat: Ne, config: Kr, matrix: Sr, typed: cr }), $t = af({ typed: cr }), Pt = g0({ DenseMatrix: ee, SparseMatrix: ge, addScalar: Qe, concat: Ne, equalScalar: pe, matrix: Sr, typed: cr }), xe = $c({ numeric: j0, typed: cr }), rl = a0({ DenseMatrix: ee, smaller: Ot }), el = f0({ ImmutableDenseMatrix: rl, getMatrixDataType: L0 }), yn = jc({ DenseMatrix: ee, SparseMatrix: ge, bignumber: it, concat: Ne, config: Kr, matrix: Sr, typed: cr }), tl = nf({ flatten: yu, matrix: Sr, size: gn, typed: cr }), nl = C0({ addScalar: Qe, complex: hn, conj: It, divideScalar: xe, equal: mn, identity: Dn, isZero: vn, matrix: Sr, multiplyScalar: Se, sign: J0, sqrt: dn, subtractScalar: nt, typed: cr, unaryMinus: $t, zeros: G0 }), il = Kc({ DenseMatrix: ee, SparseMatrix: ge, concat: Ne, config: Kr, matrix: Sr, typed: cr }), Fu = Xf({ DenseMatrix: ee, concat: Ne, equalScalar: pe, matrix: Sr, subtractScalar: nt, typed: cr, unaryMinus: $t }), ul = Uc({ DenseMatrix: ee, divideScalar: xe, equalScalar: pe, matrix: Sr, multiplyScalar: Se, subtractScalar: nt, typed: cr }), Eu = F0({ addScalar: Qe, conj: It, multiplyScalar: Se, size: gn, typed: cr }), Te = Lf({ addScalar: Qe, dot: Eu, equalScalar: pe, matrix: Sr, multiplyScalar: Se, typed: cr }), al = Ac({ bignumber: it, matrix: Sr, add: Pt, config: Kr, equal: mn, isPositive: V0, isZero: vn, larger: yn, largerEq: k0, smaller: Ot, smallerEq: il, typed: cr }), ol = Zc({ DenseMatrix: ee, divideScalar: xe, equalScalar: pe, matrix: Sr, multiplyScalar: Se, subtractScalar: nt, typed: cr }), sl = ac({ Index: el, matrix: Sr, range: al, typed: cr }), pl = sc({ matrix: Sr, multiply: Te, subtract: Fu, typed: cr }), fl = _0({ divideScalar: xe, isZero: vn, matrix: Sr, multiply: Te, subtractScalar: nt, typed: cr, unaryMinus: $t }), wn = M0({ abs: ln, addScalar: Qe, det: fl, divideScalar: xe, identity: Dn, matrix: Sr, multiply: Te, typed: cr, unaryMinus: $t }), cl = qc({ Complex: zt, config: Kr, fraction: Au, identity: Dn, inv: wn, matrix: Sr, multiply: Te, number: pn, typed: cr }), ll = $0({ divideScalar: xe, equalScalar: pe, inv: wn, matrix: Sr, multiply: Te, typed: cr }), hl = z0({ abs: ln, add: Pt, addScalar: Qe, atan: R0, bignumber: it, column: sl, complex: hn, config: Kr, cos: U0, diag: H0, divideScalar: xe, dot: Eu, equal: mn, flatten: yu, im: Z0, inv: wn, larger: yn, matrix: Sr, matrixFromColumns: tl, multiply: Te, multiplyScalar: Se, number: pn, qr: nl, re: W0, reshape: Q0, sin: Y0, size: gn, smaller: Ot, sqrt: dn, subtract: Fu, typed: cr, usolve: ul, usolveAll: ol }), dl = q0({ add: Pt, divide: ll, typed: cr }), ml = w0({ abs: ln, add: Pt, conj: It, ctranspose: K0, eigs: hl, equalScalar: pe, larger: yn, matrix: Sr, multiply: Te, pow: cl, smaller: Ot, sqrt: dn, typed: cr });
export {
  Pt as a,
  Eu as b,
  pl as c,
  ll as d,
  Sr as e,
  dl as f,
  Dn as i,
  vl as k,
  Te as m,
  ml as n,
  Fu as s,
  X0 as t,
  G0 as z
};
