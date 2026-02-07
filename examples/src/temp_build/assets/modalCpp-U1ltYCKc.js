var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { _ as ln, __tla as __tla_0 } from "./deformCpp-DpDj4ueE.js";
let mn;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  async function dn(G = {}) {
    var _a, _b, _c, _d, _e2, _f;
    var V;
    (function() {
      var _a2;
      function e(l) {
        l = l.split("-")[0];
        for (var f = l.split(".").slice(0, 3); f.length < 3; ) f.push("00");
        return f = f.map((v, h, m) => v.padStart(2, "0")), f.join("");
      }
      var r = (l) => [
        l / 1e4 | 0,
        (l / 100 | 0) % 100,
        l % 100
      ].join("."), t = 2147483647, n = typeof process < "u" && ((_a2 = process.versions) == null ? void 0 : _a2.node) ? e(process.versions.node) : t;
      if (n < 16e4) throw new Error(`This emscripten-generated code requires node v${r(16e4)} (detected v${r(n)})`);
      var o = typeof navigator < "u" && navigator.userAgent;
      if (o) {
        var a = o.includes("Safari/") && !o.includes("Chrome/") && o.match(/Version\/(\d+\.?\d*\.?\d*)/) ? e(o.match(/Version\/(\d+\.?\d*\.?\d*)/)[1]) : t;
        if (a < 15e4) throw new Error(`This emscripten-generated code requires Safari v${r(15e4)} (detected v${a})`);
        var s = o.match(/Firefox\/(\d+(?:\.\d+)?)/) ? parseFloat(o.match(/Firefox\/(\d+(?:\.\d+)?)/)[1]) : t;
        if (s < 79) throw new Error(`This emscripten-generated code requires Firefox v79 (detected v${s})`);
        var c = o.match(/Chrome\/(\d+(?:\.\d+)?)/) ? parseFloat(o.match(/Chrome\/(\d+(?:\.\d+)?)/)[1]) : t;
        if (c < 85) throw new Error(`This emscripten-generated code requires Chrome v85 (detected v${c})`);
      }
    })();
    var d = G, U = !!globalThis.window, z = !!globalThis.WorkerGlobalScope, p = ((_b = (_a = globalThis.process) == null ? void 0 : _a.versions) == null ? void 0 : _b.node) && ((_c = globalThis.process) == null ? void 0 : _c.type) != "renderer", M = !U && !p && !z;
    if (p) {
      const { createRequire: e } = await ln(() => import("./__vite-browser-external-D7Ct-6yo.js").then((r) => r._), [], import.meta.url);
      var te = e(import.meta.url);
    }
    var be = "./this.program", ne = import.meta.url, ie = "";
    function Ve(e) {
      return d.locateFile ? d.locateFile(e, ie) : ie + e;
    }
    var oe, ae;
    if (p) {
      if (!(((_e2 = (_d = globalThis.process) == null ? void 0 : _d.versions) == null ? void 0 : _e2.node) && ((_f = globalThis.process) == null ? void 0 : _f.type) != "renderer")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      var pe = te("fs");
      ne.startsWith("file:") && (ie = te("path").dirname(te("url").fileURLToPath(ne)) + "/"), ae = (r) => {
        r = Y(r) ? new URL(r) : r;
        var t = pe.readFileSync(r);
        return u(Buffer.isBuffer(t)), t;
      }, oe = async (r, t = true) => {
        r = Y(r) ? new URL(r) : r;
        var n = pe.readFileSync(r, t ? void 0 : "utf8");
        return u(t ? Buffer.isBuffer(n) : typeof n == "string"), n;
      }, process.argv.length > 1 && (be = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2);
    } else if (!M) if (U || z) {
      try {
        ie = new URL(".", ne).href;
      } catch {
      }
      if (!(globalThis.window || globalThis.WorkerGlobalScope)) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      z && (ae = (e) => {
        var r = new XMLHttpRequest();
        return r.open("GET", e, false), r.responseType = "arraybuffer", r.send(null), new Uint8Array(r.response);
      }), oe = async (e) => {
        if (Y(e)) return new Promise((t, n) => {
          var o = new XMLHttpRequest();
          o.open("GET", e, true), o.responseType = "arraybuffer", o.onload = () => {
            if (o.status == 200 || o.status == 0 && o.response) {
              t(o.response);
              return;
            }
            n(o.status);
          }, o.onerror = n, o.send(null);
        });
        var r = await fetch(e, {
          credentials: "same-origin"
        });
        if (r.ok) return r.arrayBuffer();
        throw new Error(r.status + " : " + r.url);
      };
    } else throw new Error("environment detection error");
    var se = console.log.bind(console), N = console.error.bind(console);
    u(!M, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
    var Z;
    globalThis.WebAssembly || N("no native wasm support detected");
    var ce = false;
    function u(e, r) {
      e || b("Assertion failed" + (r ? ": " + r : ""));
    }
    var Y = (e) => e.startsWith("file://");
    function Pe() {
      var e = ar();
      u((e & 3) == 0), e == 0 && (e += 4), g[e >> 2] = 34821223, g[e + 4 >> 2] = 2310721022, g[0] = 1668509029;
    }
    function le() {
      if (!ce) {
        var e = ar();
        e == 0 && (e += 4);
        var r = g[e >> 2], t = g[e + 4 >> 2];
        (r != 34821223 || t != 2310721022) && b(`Stack overflow! Stack cookie has been overwritten at ${Ue(e)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${Ue(t)} ${Ue(r)}`), g[0] != 1668509029 && b("Runtime error: The application has corrupted its heap memory area (address zero)!");
      }
    }
    class y extends Error {
    }
    class de extends y {
      constructor(r) {
        super(r), this.excPtr = r;
        const t = Sr(r);
        this.name = t[0], this.message = t[1];
      }
    }
    (() => {
      var e = new Int16Array(1), r = new Int8Array(e.buffer);
      e[0] = 25459, (r[0] !== 115 || r[1] !== 99) && b("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
    })();
    function J(e) {
      Object.getOwnPropertyDescriptor(d, e) || Object.defineProperty(d, e, {
        configurable: true,
        set() {
          b(`Attempt to set \`Module.${e}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`);
        }
      });
    }
    function R(e) {
      return () => u(false, `call to '${e}' via reference taken before Wasm module initialization`);
    }
    function Ae(e) {
      Object.getOwnPropertyDescriptor(d, e) && b(`\`Module.${e}\` was supplied but \`${e}\` not included in INCOMING_MODULE_JS_API`);
    }
    function Re(e) {
      return e === "FS_createPath" || e === "FS_createDataFile" || e === "FS_createPreloadedFile" || e === "FS_preloadFile" || e === "FS_unlink" || e === "addRunDependency" || e === "FS_createLazyFile" || e === "FS_createDevice" || e === "removeRunDependency";
    }
    function Me(e) {
      Ne(e);
    }
    function Ne(e) {
      Object.getOwnPropertyDescriptor(d, e) || Object.defineProperty(d, e, {
        configurable: true,
        get() {
          var r = `'${e}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
          Re(e) && (r += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), b(r);
        }
      });
    }
    var Oe, ge, x, X, Q, g, O, q = false;
    function Ee() {
      var e = Je.buffer;
      x = new Int8Array(e), d.HEAPU8 = X = new Uint8Array(e), Q = new Int32Array(e), d.HEAPU32 = g = new Uint32Array(e), d.HEAPF64 = new Float64Array(e), O = new BigInt64Array(e), new BigUint64Array(e);
    }
    u(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");
    function De() {
      if (d.preRun) for (typeof d.preRun == "function" && (d.preRun = [
        d.preRun
      ]); d.preRun.length; ) Ir(d.preRun.shift());
      J("preRun"), Ie(ur);
    }
    function Ce() {
      u(!q), q = true, le(), !d.noFSInit && !i.initialized && i.init(), Fe.__wasm_call_ctors(), i.ignorePermissions = false;
    }
    function Qe() {
      if (le(), d.postRun) for (typeof d.postRun == "function" && (d.postRun = [
        d.postRun
      ]); d.postRun.length; ) Le(d.postRun.shift());
      J("postRun"), Ie(xe);
    }
    function b(e) {
      var _a2;
      (_a2 = d.onAbort) == null ? void 0 : _a2.call(d, e), e = "Aborted(" + e + ")", N(e), ce = true;
      var r = new WebAssembly.RuntimeError(e);
      throw ge == null ? void 0 : ge(r), r;
    }
    function B(e, r) {
      return (...t) => {
        u(q, `native function \`${e}\` called before runtime initialization`);
        var n = Fe[e];
        return u(n, `exported native function \`${e}\` not found`), u(t.length <= r, `native function \`${e}\` called with ${t.length} args but expects ${r}`), n(...t);
      };
    }
    var j;
    function H() {
      return d.locateFile ? Ve("modal.wasm") : new URL("" + new URL("modal-BbncUPmY.wasm", import.meta.url).href, import.meta.url).href;
    }
    function P(e) {
      if (e == j && Z) return new Uint8Array(Z);
      if (ae) return ae(e);
      throw "both async and sync fetching of the wasm failed";
    }
    async function ue(e) {
      if (!Z) try {
        var r = await oe(e);
        return new Uint8Array(r);
      } catch {
      }
      return P(e);
    }
    async function ye(e, r) {
      try {
        var t = await ue(e), n = await WebAssembly.instantiate(t, r);
        return n;
      } catch (o) {
        N(`failed to asynchronously prepare wasm: ${o}`), Y(e) && N(`warning: Loading from a file URI (${e}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`), b(o);
      }
    }
    async function fe(e, r, t) {
      if (!e && !Y(r) && !p) try {
        var n = fetch(r, {
          credentials: "same-origin"
        }), o = await WebAssembly.instantiateStreaming(n, t);
        return o;
      } catch (a) {
        N(`wasm streaming compile failed: ${a}`), N("falling back to ArrayBuffer instantiation");
      }
      return ye(r, t);
    }
    function me() {
      var e = {
        env: Dr,
        wasi_snapshot_preview1: Dr
      };
      return e;
    }
    async function Ye() {
      function e(s, c) {
        return Fe = s.exports, Pt(Fe), Ee(), Fe;
      }
      var r = d;
      function t(s) {
        return u(d === r, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"), r = null, e(s.instance);
      }
      var n = me();
      if (d.instantiateWasm) return new Promise((s, c) => {
        try {
          d.instantiateWasm(n, (l, f) => {
            s(e(l, f));
          });
        } catch (l) {
          N(`Module.instantiateWasm callback failed with error: ${l}`), c(l);
        }
      });
      j ?? (j = H());
      var o = await fe(Z, j, n), a = t(o);
      return a;
    }
    var Ie = (e) => {
      for (; e.length > 0; ) e.shift()(d);
    }, xe = [], Le = (e) => xe.push(e), ur = [], Ir = (e) => ur.push(e), Ue = (e) => (u(typeof e == "number", `ptrToString expects a number, got ${typeof e}`), e >>>= 0, "0x" + e.toString(16).padStart(8, "0")), S = (e) => Pr(e), k = () => Rr(), Be = (e) => {
      Be.shown || (Be.shown = {}), Be.shown[e] || (Be.shown[e] = 1, p && (e = "warning: " + e), N(e));
    }, fr = globalThis.TextDecoder && new TextDecoder(), xr = (e, r, t, n) => {
      for (var o = r + t; e[r] && !(r >= o); ) ++r;
      return r;
    }, we = (e, r = 0, t, n) => {
      var o = xr(e, r, t);
      if (o - r > 16 && e.buffer && fr) return fr.decode(e.subarray(r, o));
      for (var a = ""; r < o; ) {
        var s = e[r++];
        if (!(s & 128)) {
          a += String.fromCharCode(s);
          continue;
        }
        var c = e[r++] & 63;
        if ((s & 224) == 192) {
          a += String.fromCharCode((s & 31) << 6 | c);
          continue;
        }
        var l = e[r++] & 63;
        if ((s & 240) == 224 ? s = (s & 15) << 12 | c << 6 | l : ((s & 248) != 240 && Be("Invalid UTF-8 leading byte " + Ue(s) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), s = (s & 7) << 18 | c << 12 | l << 6 | e[r++] & 63), s < 65536) a += String.fromCharCode(s);
        else {
          var f = s - 65536;
          a += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023);
        }
      }
      return a;
    }, _e = (e, r, t) => (u(typeof e == "number", `UTF8ToString expects a number (got ${typeof e})`), e ? we(X, e, r) : ""), Lr = (e, r, t, n) => b(`Assertion failed: ${_e(e)}, at: ` + [
      r ? _e(r) : "unknown filename",
      t,
      n ? _e(n) : "unknown function"
    ]), ze = [], Xe = 0, Ur = (e) => {
      var r = new er(e);
      return r.get_caught() || (r.set_caught(true), Xe--), r.set_rethrown(false), ze.push(r), Or(e);
    }, K = 0, Br = () => {
      w(0, 0), u(ze.length > 0);
      var e = ze.pop();
      sr(e.excPtr), K = 0;
    };
    class er {
      constructor(r) {
        this.excPtr = r, this.ptr = r - 24;
      }
      set_type(r) {
        g[this.ptr + 4 >> 2] = r;
      }
      get_type() {
        return g[this.ptr + 4 >> 2];
      }
      set_destructor(r) {
        g[this.ptr + 8 >> 2] = r;
      }
      get_destructor() {
        return g[this.ptr + 8 >> 2];
      }
      set_caught(r) {
        r = r ? 1 : 0, x[this.ptr + 12] = r;
      }
      get_caught() {
        return x[this.ptr + 12] != 0;
      }
      set_rethrown(r) {
        r = r ? 1 : 0, x[this.ptr + 13] = r;
      }
      get_rethrown() {
        return x[this.ptr + 13] != 0;
      }
      init(r, t) {
        this.set_adjusted_ptr(0), this.set_type(r), this.set_destructor(t);
      }
      set_adjusted_ptr(r) {
        g[this.ptr + 16 >> 2] = r;
      }
      get_adjusted_ptr() {
        return g[this.ptr + 16 >> 2];
      }
    }
    var qe = (e) => Tr(e), mr = (e) => {
      var r = K == null ? void 0 : K.excPtr;
      if (!r) return qe(0), 0;
      var t = new er(r);
      t.set_adjusted_ptr(r);
      var n = t.get_type();
      if (!n) return qe(0), r;
      for (var o of e) {
        if (o === 0 || o === n) break;
        var a = t.ptr + 16;
        if (Nr(o, n, a)) return qe(o), r;
      }
      return qe(n), r;
    }, zr = () => mr([]), Hr = (e) => mr([
      e
    ]), Wr = () => {
      var e = ze.pop();
      e || b("no exception to throw");
      var r = e.excPtr;
      throw e.get_rethrown() || (ze.push(e), e.set_rethrown(true), e.set_caught(false), Xe++), Ze(r), K = new de(r), K;
    }, jr = (e, r, t) => {
      var n = new er(e);
      throw n.init(r, t), Ze(e), K = new de(e), Xe++, K;
    }, $r = () => Xe, Gr = (e) => {
      throw K || (K = new de(e)), K;
    }, Vr = () => b("native code called abort()"), _r = (e, r, t, n) => {
      if (u(typeof e == "string", `stringToUTF8Array expects a string (got ${typeof e})`), !(n > 0)) return 0;
      for (var o = t, a = t + n - 1, s = 0; s < e.length; ++s) {
        var c = e.codePointAt(s);
        if (c <= 127) {
          if (t >= a) break;
          r[t++] = c;
        } else if (c <= 2047) {
          if (t + 1 >= a) break;
          r[t++] = 192 | c >> 6, r[t++] = 128 | c & 63;
        } else if (c <= 65535) {
          if (t + 2 >= a) break;
          r[t++] = 224 | c >> 12, r[t++] = 128 | c >> 6 & 63, r[t++] = 128 | c & 63;
        } else {
          if (t + 3 >= a) break;
          c > 1114111 && Be("Invalid Unicode code point " + Ue(c) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."), r[t++] = 240 | c >> 18, r[t++] = 128 | c >> 12 & 63, r[t++] = 128 | c >> 6 & 63, r[t++] = 128 | c & 63, s++;
        }
      }
      return r[t] = 0, t - o;
    }, He = (e, r, t) => (u(typeof t == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), _r(e, X, r, t)), Ke = (e) => {
      for (var r = 0, t = 0; t < e.length; ++t) {
        var n = e.charCodeAt(t);
        n <= 127 ? r++ : n <= 2047 ? r += 2 : n >= 55296 && n <= 57343 ? (r += 4, ++t) : r += 3;
      }
      return r;
    }, Yr = (e, r, t, n) => {
      var o = (/* @__PURE__ */ new Date()).getFullYear(), a = new Date(o, 0, 1), s = new Date(o, 6, 1), c = a.getTimezoneOffset(), l = s.getTimezoneOffset(), f = Math.max(c, l);
      g[e >> 2] = f * 60, Q[r >> 2] = +(c != l);
      var v = (_) => {
        var T = _ >= 0 ? "-" : "+", D = Math.abs(_), L = String(Math.floor(D / 60)).padStart(2, "0"), C = String(D % 60).padStart(2, "0");
        return `UTC${T}${L}${C}`;
      }, h = v(c), m = v(l);
      u(h), u(m), u(Ke(h) <= 16, `timezone name truncated to fit in TZNAME_MAX (${h})`), u(Ke(m) <= 16, `timezone name truncated to fit in TZNAME_MAX (${m})`), l < c ? (He(h, t, 17), He(m, n, 17)) : (He(h, n, 17), He(m, t, 17));
    }, Xr = () => 2147483648, qr = (e, r) => (u(r, "alignment argument is required"), Math.ceil(e / r) * r), Kr = (e) => {
      var r = Je.buffer.byteLength, t = (e - r + 65535) / 65536 | 0;
      try {
        return Je.grow(t), Ee(), 1;
      } catch (n) {
        N(`growMemory: Attempted to grow heap from ${r} bytes to ${e} bytes, but got error: ${n}`);
      }
    }, Zr = (e) => {
      var r = X.length;
      e >>>= 0, u(e > r);
      var t = Xr();
      if (e > t) return N(`Cannot enlarge memory, requested ${e} bytes, but the limit is ${t} bytes!`), false;
      for (var n = 1; n <= 4; n *= 2) {
        var o = r * (1 + 0.2 / n);
        o = Math.min(o, e + 100663296);
        var a = Math.min(t, qr(Math.max(e, o), 65536)), s = Kr(a);
        if (s) return true;
      }
      return N(`Failed to grow the heap from ${r} bytes to ${a} bytes, not enough memory!`), false;
    }, rr = {}, Jr = () => be || "./this.program", We = () => {
      var _a2;
      if (!We.strings) {
        var e = (((_a2 = globalThis.navigator) == null ? void 0 : _a2.language) ?? "C").replace("-", "_") + ".UTF-8", r = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: e,
          _: Jr()
        };
        for (var t in rr) rr[t] === void 0 ? delete r[t] : r[t] = rr[t];
        var n = [];
        for (var t in r) n.push(`${t}=${r[t]}`);
        We.strings = n;
      }
      return We.strings;
    }, Qr = (e, r) => {
      var t = 0, n = 0;
      for (var o of We()) {
        var a = r + t;
        g[e + n >> 2] = a, t += He(o, a, 1 / 0) + 1, n += 4;
      }
      return 0;
    }, et = (e, r) => {
      var t = We();
      g[e >> 2] = t.length;
      var n = 0;
      for (var o of t) n += Ke(o) + 1;
      return g[r >> 2] = n, 0;
    }, A = {
      isAbs: (e) => e.charAt(0) === "/",
      splitPath: (e) => {
        var r = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return r.exec(e).slice(1);
      },
      normalizeArray: (e, r) => {
        for (var t = 0, n = e.length - 1; n >= 0; n--) {
          var o = e[n];
          o === "." ? e.splice(n, 1) : o === ".." ? (e.splice(n, 1), t++) : t && (e.splice(n, 1), t--);
        }
        if (r) for (; t; t--) e.unshift("..");
        return e;
      },
      normalize: (e) => {
        var r = A.isAbs(e), t = e.slice(-1) === "/";
        return e = A.normalizeArray(e.split("/").filter((n) => !!n), !r).join("/"), !e && !r && (e = "."), e && t && (e += "/"), (r ? "/" : "") + e;
      },
      dirname: (e) => {
        var r = A.splitPath(e), t = r[0], n = r[1];
        return !t && !n ? "." : (n && (n = n.slice(0, -1)), t + n);
      },
      basename: (e) => e && e.match(/([^\/]+|\/)\/*$/)[1],
      join: (...e) => A.normalize(e.join("/")),
      join2: (e, r) => A.normalize(e + "/" + r)
    }, rt = () => {
      if (p) {
        var e = te("crypto");
        return (r) => e.randomFillSync(r);
      }
      return (r) => crypto.getRandomValues(r);
    }, vr = (e) => {
      (vr = rt())(e);
    }, Se = {
      resolve: (...e) => {
        for (var r = "", t = false, n = e.length - 1; n >= -1 && !t; n--) {
          var o = n >= 0 ? e[n] : i.cwd();
          if (typeof o != "string") throw new TypeError("Arguments to path.resolve must be strings");
          if (!o) return "";
          r = o + "/" + r, t = A.isAbs(o);
        }
        return r = A.normalizeArray(r.split("/").filter((a) => !!a), !t).join("/"), (t ? "/" : "") + r || ".";
      },
      relative: (e, r) => {
        e = Se.resolve(e).slice(1), r = Se.resolve(r).slice(1);
        function t(f) {
          for (var v = 0; v < f.length && f[v] === ""; v++) ;
          for (var h = f.length - 1; h >= 0 && f[h] === ""; h--) ;
          return v > h ? [] : f.slice(v, h - v + 1);
        }
        for (var n = t(e.split("/")), o = t(r.split("/")), a = Math.min(n.length, o.length), s = a, c = 0; c < a; c++) if (n[c] !== o[c]) {
          s = c;
          break;
        }
        for (var l = [], c = s; c < n.length; c++) l.push("..");
        return l = l.concat(o.slice(s)), l.join("/");
      }
    }, tr = [], nr = (e, r, t) => {
      var n = Ke(e) + 1, o = new Array(n), a = _r(e, o, 0, o.length);
      return o.length = a, o;
    }, tt = () => {
      var _a2;
      if (!tr.length) {
        var e = null;
        if (p) {
          var r = 256, t = Buffer.alloc(r), n = 0, o = process.stdin.fd;
          try {
            n = pe.readSync(o, t, 0, r);
          } catch (a) {
            if (a.toString().includes("EOF")) n = 0;
            else throw a;
          }
          n > 0 && (e = t.slice(0, n).toString("utf-8"));
        } else ((_a2 = globalThis.window) == null ? void 0 : _a2.prompt) && (e = window.prompt("Input: "), e !== null && (e += `
`));
        if (!e) return null;
        tr = nr(e);
      }
      return tr.shift();
    }, ve = {
      ttys: [],
      init() {
      },
      shutdown() {
      },
      register(e, r) {
        ve.ttys[e] = {
          input: [],
          output: [],
          ops: r
        }, i.registerDevice(e, ve.stream_ops);
      },
      stream_ops: {
        open(e) {
          var r = ve.ttys[e.node.rdev];
          if (!r) throw new i.ErrnoError(43);
          e.tty = r, e.seekable = false;
        },
        close(e) {
          e.tty.ops.fsync(e.tty);
        },
        fsync(e) {
          e.tty.ops.fsync(e.tty);
        },
        read(e, r, t, n, o) {
          if (!e.tty || !e.tty.ops.get_char) throw new i.ErrnoError(60);
          for (var a = 0, s = 0; s < n; s++) {
            var c;
            try {
              c = e.tty.ops.get_char(e.tty);
            } catch {
              throw new i.ErrnoError(29);
            }
            if (c === void 0 && a === 0) throw new i.ErrnoError(6);
            if (c == null) break;
            a++, r[t + s] = c;
          }
          return a && (e.node.atime = Date.now()), a;
        },
        write(e, r, t, n, o) {
          if (!e.tty || !e.tty.ops.put_char) throw new i.ErrnoError(60);
          try {
            for (var a = 0; a < n; a++) e.tty.ops.put_char(e.tty, r[t + a]);
          } catch {
            throw new i.ErrnoError(29);
          }
          return n && (e.node.mtime = e.node.ctime = Date.now()), a;
        }
      },
      default_tty_ops: {
        get_char(e) {
          return tt();
        },
        put_char(e, r) {
          r === null || r === 10 ? (se(we(e.output)), e.output = []) : r != 0 && e.output.push(r);
        },
        fsync(e) {
          var _a2;
          ((_a2 = e.output) == null ? void 0 : _a2.length) > 0 && (se(we(e.output)), e.output = []);
        },
        ioctl_tcgets(e) {
          return {
            c_iflag: 25856,
            c_oflag: 5,
            c_cflag: 191,
            c_lflag: 35387,
            c_cc: [
              3,
              28,
              127,
              21,
              4,
              0,
              1,
              0,
              17,
              19,
              26,
              0,
              18,
              15,
              23,
              22,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          };
        },
        ioctl_tcsets(e, r, t) {
          return 0;
        },
        ioctl_tiocgwinsz(e) {
          return [
            24,
            80
          ];
        }
      },
      default_tty1_ops: {
        put_char(e, r) {
          r === null || r === 10 ? (N(we(e.output)), e.output = []) : r != 0 && e.output.push(r);
        },
        fsync(e) {
          var _a2;
          ((_a2 = e.output) == null ? void 0 : _a2.length) > 0 && (N(we(e.output)), e.output = []);
        }
      }
    }, hr = (e) => {
      b("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
    }, E = {
      ops_table: null,
      mount(e) {
        return E.createNode(null, "/", 16895, 0);
      },
      createNode(e, r, t, n) {
        if (i.isBlkdev(t) || i.isFIFO(t)) throw new i.ErrnoError(63);
        E.ops_table || (E.ops_table = {
          dir: {
            node: {
              getattr: E.node_ops.getattr,
              setattr: E.node_ops.setattr,
              lookup: E.node_ops.lookup,
              mknod: E.node_ops.mknod,
              rename: E.node_ops.rename,
              unlink: E.node_ops.unlink,
              rmdir: E.node_ops.rmdir,
              readdir: E.node_ops.readdir,
              symlink: E.node_ops.symlink
            },
            stream: {
              llseek: E.stream_ops.llseek
            }
          },
          file: {
            node: {
              getattr: E.node_ops.getattr,
              setattr: E.node_ops.setattr
            },
            stream: {
              llseek: E.stream_ops.llseek,
              read: E.stream_ops.read,
              write: E.stream_ops.write,
              mmap: E.stream_ops.mmap,
              msync: E.stream_ops.msync
            }
          },
          link: {
            node: {
              getattr: E.node_ops.getattr,
              setattr: E.node_ops.setattr,
              readlink: E.node_ops.readlink
            },
            stream: {}
          },
          chrdev: {
            node: {
              getattr: E.node_ops.getattr,
              setattr: E.node_ops.setattr
            },
            stream: i.chrdev_stream_ops
          }
        });
        var o = i.createNode(e, r, t, n);
        return i.isDir(o.mode) ? (o.node_ops = E.ops_table.dir.node, o.stream_ops = E.ops_table.dir.stream, o.contents = {}) : i.isFile(o.mode) ? (o.node_ops = E.ops_table.file.node, o.stream_ops = E.ops_table.file.stream, o.usedBytes = 0, o.contents = null) : i.isLink(o.mode) ? (o.node_ops = E.ops_table.link.node, o.stream_ops = E.ops_table.link.stream) : i.isChrdev(o.mode) && (o.node_ops = E.ops_table.chrdev.node, o.stream_ops = E.ops_table.chrdev.stream), o.atime = o.mtime = o.ctime = Date.now(), e && (e.contents[r] = o, e.atime = e.mtime = e.ctime = o.atime), o;
      },
      getFileDataAsTypedArray(e) {
        return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array(0);
      },
      expandFileStorage(e, r) {
        var t = e.contents ? e.contents.length : 0;
        if (!(t >= r)) {
          var n = 1024 * 1024;
          r = Math.max(r, t * (t < n ? 2 : 1.125) >>> 0), t != 0 && (r = Math.max(r, 256));
          var o = e.contents;
          e.contents = new Uint8Array(r), e.usedBytes > 0 && e.contents.set(o.subarray(0, e.usedBytes), 0);
        }
      },
      resizeFileStorage(e, r) {
        if (e.usedBytes != r) if (r == 0) e.contents = null, e.usedBytes = 0;
        else {
          var t = e.contents;
          e.contents = new Uint8Array(r), t && e.contents.set(t.subarray(0, Math.min(r, e.usedBytes))), e.usedBytes = r;
        }
      },
      node_ops: {
        getattr(e) {
          var r = {};
          return r.dev = i.isChrdev(e.mode) ? e.id : 1, r.ino = e.id, r.mode = e.mode, r.nlink = 1, r.uid = 0, r.gid = 0, r.rdev = e.rdev, i.isDir(e.mode) ? r.size = 4096 : i.isFile(e.mode) ? r.size = e.usedBytes : i.isLink(e.mode) ? r.size = e.link.length : r.size = 0, r.atime = new Date(e.atime), r.mtime = new Date(e.mtime), r.ctime = new Date(e.ctime), r.blksize = 4096, r.blocks = Math.ceil(r.size / r.blksize), r;
        },
        setattr(e, r) {
          for (const t of [
            "mode",
            "atime",
            "mtime",
            "ctime"
          ]) r[t] != null && (e[t] = r[t]);
          r.size !== void 0 && E.resizeFileStorage(e, r.size);
        },
        lookup(e, r) {
          throw new i.ErrnoError(44);
        },
        mknod(e, r, t, n) {
          return E.createNode(e, r, t, n);
        },
        rename(e, r, t) {
          var n;
          try {
            n = i.lookupNode(r, t);
          } catch {
          }
          if (n) {
            if (i.isDir(e.mode)) for (var o in n.contents) throw new i.ErrnoError(55);
            i.hashRemoveNode(n);
          }
          delete e.parent.contents[e.name], r.contents[t] = e, e.name = t, r.ctime = r.mtime = e.parent.ctime = e.parent.mtime = Date.now();
        },
        unlink(e, r) {
          delete e.contents[r], e.ctime = e.mtime = Date.now();
        },
        rmdir(e, r) {
          var t = i.lookupNode(e, r);
          for (var n in t.contents) throw new i.ErrnoError(55);
          delete e.contents[r], e.ctime = e.mtime = Date.now();
        },
        readdir(e) {
          return [
            ".",
            "..",
            ...Object.keys(e.contents)
          ];
        },
        symlink(e, r, t) {
          var n = E.createNode(e, r, 41471, 0);
          return n.link = t, n;
        },
        readlink(e) {
          if (!i.isLink(e.mode)) throw new i.ErrnoError(28);
          return e.link;
        }
      },
      stream_ops: {
        read(e, r, t, n, o) {
          var a = e.node.contents;
          if (o >= e.node.usedBytes) return 0;
          var s = Math.min(e.node.usedBytes - o, n);
          if (u(s >= 0), s > 8 && a.subarray) r.set(a.subarray(o, o + s), t);
          else for (var c = 0; c < s; c++) r[t + c] = a[o + c];
          return s;
        },
        write(e, r, t, n, o, a) {
          if (u(!(r instanceof ArrayBuffer)), r.buffer === x.buffer && (a = false), !n) return 0;
          var s = e.node;
          if (s.mtime = s.ctime = Date.now(), r.subarray && (!s.contents || s.contents.subarray)) {
            if (a) return u(o === 0, "canOwn must imply no weird position inside the file"), s.contents = r.subarray(t, t + n), s.usedBytes = n, n;
            if (s.usedBytes === 0 && o === 0) return s.contents = r.slice(t, t + n), s.usedBytes = n, n;
            if (o + n <= s.usedBytes) return s.contents.set(r.subarray(t, t + n), o), n;
          }
          if (E.expandFileStorage(s, o + n), s.contents.subarray && r.subarray) s.contents.set(r.subarray(t, t + n), o);
          else for (var c = 0; c < n; c++) s.contents[o + c] = r[t + c];
          return s.usedBytes = Math.max(s.usedBytes, o + n), n;
        },
        llseek(e, r, t) {
          var n = r;
          if (t === 1 ? n += e.position : t === 2 && i.isFile(e.node.mode) && (n += e.node.usedBytes), n < 0) throw new i.ErrnoError(28);
          return n;
        },
        mmap(e, r, t, n, o) {
          if (!i.isFile(e.node.mode)) throw new i.ErrnoError(43);
          var a, s, c = e.node.contents;
          if (!(o & 2) && c && c.buffer === x.buffer) s = false, a = c.byteOffset;
          else {
            if (s = true, a = hr(), !a) throw new i.ErrnoError(48);
            c && ((t > 0 || t + r < c.length) && (c.subarray ? c = c.subarray(t, t + r) : c = Array.prototype.slice.call(c, t, t + r)), x.set(c, a));
          }
          return {
            ptr: a,
            allocated: s
          };
        },
        msync(e, r, t, n, o) {
          return E.stream_ops.write(e, r, 0, n, t, false), 0;
        }
      }
    }, nt = (e) => {
      var r = {
        r: 0,
        "r+": 2,
        w: 577,
        "w+": 578,
        a: 1089,
        "a+": 1090
      }, t = r[e];
      if (typeof t > "u") throw new Error(`Unknown file open mode: ${e}`);
      return t;
    }, ir = (e, r) => {
      var t = 0;
      return e && (t |= 365), r && (t |= 146), t;
    }, it = (e) => _e(Fr(e)), pr = {
      EPERM: 63,
      ENOENT: 44,
      ESRCH: 71,
      EINTR: 27,
      EIO: 29,
      ENXIO: 60,
      E2BIG: 1,
      ENOEXEC: 45,
      EBADF: 8,
      ECHILD: 12,
      EAGAIN: 6,
      EWOULDBLOCK: 6,
      ENOMEM: 48,
      EACCES: 2,
      EFAULT: 21,
      ENOTBLK: 105,
      EBUSY: 10,
      EEXIST: 20,
      EXDEV: 75,
      ENODEV: 43,
      ENOTDIR: 54,
      EISDIR: 31,
      EINVAL: 28,
      ENFILE: 41,
      EMFILE: 33,
      ENOTTY: 59,
      ETXTBSY: 74,
      EFBIG: 22,
      ENOSPC: 51,
      ESPIPE: 70,
      EROFS: 69,
      EMLINK: 34,
      EPIPE: 64,
      EDOM: 18,
      ERANGE: 68,
      ENOMSG: 49,
      EIDRM: 24,
      ECHRNG: 106,
      EL2NSYNC: 156,
      EL3HLT: 107,
      EL3RST: 108,
      ELNRNG: 109,
      EUNATCH: 110,
      ENOCSI: 111,
      EL2HLT: 112,
      EDEADLK: 16,
      ENOLCK: 46,
      EBADE: 113,
      EBADR: 114,
      EXFULL: 115,
      ENOANO: 104,
      EBADRQC: 103,
      EBADSLT: 102,
      EDEADLOCK: 16,
      EBFONT: 101,
      ENOSTR: 100,
      ENODATA: 116,
      ETIME: 117,
      ENOSR: 118,
      ENONET: 119,
      ENOPKG: 120,
      EREMOTE: 121,
      ENOLINK: 47,
      EADV: 122,
      ESRMNT: 123,
      ECOMM: 124,
      EPROTO: 65,
      EMULTIHOP: 36,
      EDOTDOT: 125,
      EBADMSG: 9,
      ENOTUNIQ: 126,
      EBADFD: 127,
      EREMCHG: 128,
      ELIBACC: 129,
      ELIBBAD: 130,
      ELIBSCN: 131,
      ELIBMAX: 132,
      ELIBEXEC: 133,
      ENOSYS: 52,
      ENOTEMPTY: 55,
      ENAMETOOLONG: 37,
      ELOOP: 32,
      EOPNOTSUPP: 138,
      EPFNOSUPPORT: 139,
      ECONNRESET: 15,
      ENOBUFS: 42,
      EAFNOSUPPORT: 5,
      EPROTOTYPE: 67,
      ENOTSOCK: 57,
      ENOPROTOOPT: 50,
      ESHUTDOWN: 140,
      ECONNREFUSED: 14,
      EADDRINUSE: 3,
      ECONNABORTED: 13,
      ENETUNREACH: 40,
      ENETDOWN: 38,
      ETIMEDOUT: 73,
      EHOSTDOWN: 142,
      EHOSTUNREACH: 23,
      EINPROGRESS: 26,
      EALREADY: 7,
      EDESTADDRREQ: 17,
      EMSGSIZE: 35,
      EPROTONOSUPPORT: 66,
      ESOCKTNOSUPPORT: 137,
      EADDRNOTAVAIL: 4,
      ENETRESET: 39,
      EISCONN: 30,
      ENOTCONN: 53,
      ETOOMANYREFS: 141,
      EUSERS: 136,
      EDQUOT: 19,
      ESTALE: 72,
      ENOTSUP: 138,
      ENOMEDIUM: 148,
      EILSEQ: 25,
      EOVERFLOW: 61,
      ECANCELED: 11,
      ENOTRECOVERABLE: 56,
      EOWNERDEAD: 62,
      ESTRPIPE: 135
    }, ot = async (e) => {
      var r = await oe(e);
      return u(r, `Loading data file "${e}" failed (no arrayBuffer).`), new Uint8Array(r);
    }, at = (...e) => i.createDataFile(...e), st = (e) => {
      for (var r = e; ; ) {
        if (!ke[e]) return e;
        e = r + Math.random();
      }
    }, he = 0, je = null, ke = {}, ee = null, ct = (e) => {
      var _a2;
      if (he--, (_a2 = d.monitorRunDependencies) == null ? void 0 : _a2.call(d, he), u(e, "removeRunDependency requires an ID"), u(ke[e]), delete ke[e], he == 0 && (ee !== null && (clearInterval(ee), ee = null), je)) {
        var r = je;
        je = null, r();
      }
    }, lt = (e) => {
      var _a2, _b2;
      he++, (_a2 = d.monitorRunDependencies) == null ? void 0 : _a2.call(d, he), u(e, "addRunDependency requires an ID"), u(!ke[e]), ke[e] = 1, ee === null && globalThis.setInterval && (ee = setInterval(() => {
        if (ce) {
          clearInterval(ee), ee = null;
          return;
        }
        var r = false;
        for (var t in ke) r || (r = true, N("still waiting on run dependencies:")), N(`dependency: ${t}`);
        r && N("(end of list)");
      }, 1e4), (_b2 = ee.unref) == null ? void 0 : _b2.call(ee));
    }, gr = [], dt = async (e, r) => {
      typeof Browser < "u" && Browser.init();
      for (var t of gr) if (t.canHandle(r)) return u(t.handle.constructor.name === "AsyncFunction", "Filesystem plugin handlers must be async functions (See #24914)"), t.handle(e, r);
      return e;
    }, Er = async (e, r, t, n, o, a, s, c) => {
      var l = r ? Se.resolve(A.join2(e, r)) : e, f = st(`cp ${l}`);
      lt(f);
      try {
        var v = t;
        typeof t == "string" && (v = await ot(t)), v = await dt(v, l), c == null ? void 0 : c(), a || at(e, r, v, n, o, s);
      } finally {
        ct(f);
      }
    }, ut = (e, r, t, n, o, a, s, c, l, f) => {
      Er(e, r, t, n, o, c, l, f).then(a).catch(s);
    }, i = {
      root: null,
      mounts: [],
      devices: {},
      streams: [],
      nextInode: 1,
      nameTable: null,
      currentPath: "/",
      initialized: false,
      ignorePermissions: true,
      filesystems: null,
      syncFSRequests: 0,
      readFiles: {},
      ErrnoError: class extends Error {
        constructor(e) {
          super(q ? it(e) : "");
          __publicField(this, "name", "ErrnoError");
          this.errno = e;
          for (var r in pr) if (pr[r] === e) {
            this.code = r;
            break;
          }
        }
      },
      FSStream: class {
        constructor() {
          __publicField(this, "shared", {});
        }
        get object() {
          return this.node;
        }
        set object(e) {
          this.node = e;
        }
        get isRead() {
          return (this.flags & 2097155) !== 1;
        }
        get isWrite() {
          return (this.flags & 2097155) !== 0;
        }
        get isAppend() {
          return this.flags & 1024;
        }
        get flags() {
          return this.shared.flags;
        }
        set flags(e) {
          this.shared.flags = e;
        }
        get position() {
          return this.shared.position;
        }
        set position(e) {
          this.shared.position = e;
        }
      },
      FSNode: class {
        constructor(e, r, t, n) {
          __publicField(this, "node_ops", {});
          __publicField(this, "stream_ops", {});
          __publicField(this, "readMode", 365);
          __publicField(this, "writeMode", 146);
          __publicField(this, "mounted", null);
          e || (e = this), this.parent = e, this.mount = e.mount, this.id = i.nextInode++, this.name = r, this.mode = t, this.rdev = n, this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return (this.mode & this.readMode) === this.readMode;
        }
        set read(e) {
          e ? this.mode |= this.readMode : this.mode &= ~this.readMode;
        }
        get write() {
          return (this.mode & this.writeMode) === this.writeMode;
        }
        set write(e) {
          e ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
        }
        get isFolder() {
          return i.isDir(this.mode);
        }
        get isDevice() {
          return i.isChrdev(this.mode);
        }
      },
      lookupPath(e, r = {}) {
        if (!e) throw new i.ErrnoError(44);
        r.follow_mount ?? (r.follow_mount = true), A.isAbs(e) || (e = i.cwd() + "/" + e);
        e: for (var t = 0; t < 40; t++) {
          for (var n = e.split("/").filter((f) => !!f), o = i.root, a = "/", s = 0; s < n.length; s++) {
            var c = s === n.length - 1;
            if (c && r.parent) break;
            if (n[s] !== ".") {
              if (n[s] === "..") {
                if (a = A.dirname(a), i.isRoot(o)) {
                  e = a + "/" + n.slice(s + 1).join("/"), t--;
                  continue e;
                } else o = o.parent;
                continue;
              }
              a = A.join2(a, n[s]);
              try {
                o = i.lookupNode(o, n[s]);
              } catch (f) {
                if ((f == null ? void 0 : f.errno) === 44 && c && r.noent_okay) return {
                  path: a
                };
                throw f;
              }
              if (i.isMountpoint(o) && (!c || r.follow_mount) && (o = o.mounted.root), i.isLink(o.mode) && (!c || r.follow)) {
                if (!o.node_ops.readlink) throw new i.ErrnoError(52);
                var l = o.node_ops.readlink(o);
                A.isAbs(l) || (l = A.dirname(a) + "/" + l), e = l + "/" + n.slice(s + 1).join("/");
                continue e;
              }
            }
          }
          return {
            path: a,
            node: o
          };
        }
        throw new i.ErrnoError(32);
      },
      getPath(e) {
        for (var r; ; ) {
          if (i.isRoot(e)) {
            var t = e.mount.mountpoint;
            return r ? t[t.length - 1] !== "/" ? `${t}/${r}` : t + r : t;
          }
          r = r ? `${e.name}/${r}` : e.name, e = e.parent;
        }
      },
      hashName(e, r) {
        for (var t = 0, n = 0; n < r.length; n++) t = (t << 5) - t + r.charCodeAt(n) | 0;
        return (e + t >>> 0) % i.nameTable.length;
      },
      hashAddNode(e) {
        var r = i.hashName(e.parent.id, e.name);
        e.name_next = i.nameTable[r], i.nameTable[r] = e;
      },
      hashRemoveNode(e) {
        var r = i.hashName(e.parent.id, e.name);
        if (i.nameTable[r] === e) i.nameTable[r] = e.name_next;
        else for (var t = i.nameTable[r]; t; ) {
          if (t.name_next === e) {
            t.name_next = e.name_next;
            break;
          }
          t = t.name_next;
        }
      },
      lookupNode(e, r) {
        var t = i.mayLookup(e);
        if (t) throw new i.ErrnoError(t);
        for (var n = i.hashName(e.id, r), o = i.nameTable[n]; o; o = o.name_next) {
          var a = o.name;
          if (o.parent.id === e.id && a === r) return o;
        }
        return i.lookup(e, r);
      },
      createNode(e, r, t, n) {
        u(typeof e == "object");
        var o = new i.FSNode(e, r, t, n);
        return i.hashAddNode(o), o;
      },
      destroyNode(e) {
        i.hashRemoveNode(e);
      },
      isRoot(e) {
        return e === e.parent;
      },
      isMountpoint(e) {
        return !!e.mounted;
      },
      isFile(e) {
        return (e & 61440) === 32768;
      },
      isDir(e) {
        return (e & 61440) === 16384;
      },
      isLink(e) {
        return (e & 61440) === 40960;
      },
      isChrdev(e) {
        return (e & 61440) === 8192;
      },
      isBlkdev(e) {
        return (e & 61440) === 24576;
      },
      isFIFO(e) {
        return (e & 61440) === 4096;
      },
      isSocket(e) {
        return (e & 49152) === 49152;
      },
      flagsToPermissionString(e) {
        var r = [
          "r",
          "w",
          "rw"
        ][e & 3];
        return e & 512 && (r += "w"), r;
      },
      nodePermissions(e, r) {
        return i.ignorePermissions ? 0 : r.includes("r") && !(e.mode & 292) || r.includes("w") && !(e.mode & 146) || r.includes("x") && !(e.mode & 73) ? 2 : 0;
      },
      mayLookup(e) {
        if (!i.isDir(e.mode)) return 54;
        var r = i.nodePermissions(e, "x");
        return r || (e.node_ops.lookup ? 0 : 2);
      },
      mayCreate(e, r) {
        if (!i.isDir(e.mode)) return 54;
        try {
          var t = i.lookupNode(e, r);
          return 20;
        } catch {
        }
        return i.nodePermissions(e, "wx");
      },
      mayDelete(e, r, t) {
        var n;
        try {
          n = i.lookupNode(e, r);
        } catch (a) {
          return a.errno;
        }
        var o = i.nodePermissions(e, "wx");
        if (o) return o;
        if (t) {
          if (!i.isDir(n.mode)) return 54;
          if (i.isRoot(n) || i.getPath(n) === i.cwd()) return 10;
        } else if (i.isDir(n.mode)) return 31;
        return 0;
      },
      mayOpen(e, r) {
        return e ? i.isLink(e.mode) ? 32 : i.isDir(e.mode) && (i.flagsToPermissionString(r) !== "r" || r & 576) ? 31 : i.nodePermissions(e, i.flagsToPermissionString(r)) : 44;
      },
      checkOpExists(e, r) {
        if (!e) throw new i.ErrnoError(r);
        return e;
      },
      MAX_OPEN_FDS: 4096,
      nextfd() {
        for (var e = 0; e <= i.MAX_OPEN_FDS; e++) if (!i.streams[e]) return e;
        throw new i.ErrnoError(33);
      },
      getStreamChecked(e) {
        var r = i.getStream(e);
        if (!r) throw new i.ErrnoError(8);
        return r;
      },
      getStream: (e) => i.streams[e],
      createStream(e, r = -1) {
        return u(r >= -1), e = Object.assign(new i.FSStream(), e), r == -1 && (r = i.nextfd()), e.fd = r, i.streams[r] = e, e;
      },
      closeStream(e) {
        i.streams[e] = null;
      },
      dupStream(e, r = -1) {
        var _a2, _b2;
        var t = i.createStream(e, r);
        return (_b2 = (_a2 = t.stream_ops) == null ? void 0 : _a2.dup) == null ? void 0 : _b2.call(_a2, t), t;
      },
      doSetAttr(e, r, t) {
        var n = e == null ? void 0 : e.stream_ops.setattr, o = n ? e : r;
        n ?? (n = r.node_ops.setattr), i.checkOpExists(n, 63), n(o, t);
      },
      chrdev_stream_ops: {
        open(e) {
          var _a2, _b2;
          var r = i.getDevice(e.node.rdev);
          e.stream_ops = r.stream_ops, (_b2 = (_a2 = e.stream_ops).open) == null ? void 0 : _b2.call(_a2, e);
        },
        llseek() {
          throw new i.ErrnoError(70);
        }
      },
      major: (e) => e >> 8,
      minor: (e) => e & 255,
      makedev: (e, r) => e << 8 | r,
      registerDevice(e, r) {
        i.devices[e] = {
          stream_ops: r
        };
      },
      getDevice: (e) => i.devices[e],
      getMounts(e) {
        for (var r = [], t = [
          e
        ]; t.length; ) {
          var n = t.pop();
          r.push(n), t.push(...n.mounts);
        }
        return r;
      },
      syncfs(e, r) {
        typeof e == "function" && (r = e, e = false), i.syncFSRequests++, i.syncFSRequests > 1 && N(`warning: ${i.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
        var t = i.getMounts(i.root.mount), n = 0;
        function o(c) {
          return u(i.syncFSRequests > 0), i.syncFSRequests--, r(c);
        }
        function a(c) {
          if (c) return a.errored ? void 0 : (a.errored = true, o(c));
          ++n >= t.length && o(null);
        }
        for (var s of t) s.type.syncfs ? s.type.syncfs(s, e, a) : a(null);
      },
      mount(e, r, t) {
        if (typeof e == "string") throw e;
        var n = t === "/", o = !t, a;
        if (n && i.root) throw new i.ErrnoError(10);
        if (!n && !o) {
          var s = i.lookupPath(t, {
            follow_mount: false
          });
          if (t = s.path, a = s.node, i.isMountpoint(a)) throw new i.ErrnoError(10);
          if (!i.isDir(a.mode)) throw new i.ErrnoError(54);
        }
        var c = {
          type: e,
          opts: r,
          mountpoint: t,
          mounts: []
        }, l = e.mount(c);
        return l.mount = c, c.root = l, n ? i.root = l : a && (a.mounted = c, a.mount && a.mount.mounts.push(c)), l;
      },
      unmount(e) {
        var r = i.lookupPath(e, {
          follow_mount: false
        });
        if (!i.isMountpoint(r.node)) throw new i.ErrnoError(28);
        var t = r.node, n = t.mounted, o = i.getMounts(n);
        for (var [a, s] of Object.entries(i.nameTable)) for (; s; ) {
          var c = s.name_next;
          o.includes(s.mount) && i.destroyNode(s), s = c;
        }
        t.mounted = null;
        var l = t.mount.mounts.indexOf(n);
        u(l !== -1), t.mount.mounts.splice(l, 1);
      },
      lookup(e, r) {
        return e.node_ops.lookup(e, r);
      },
      mknod(e, r, t) {
        var n = i.lookupPath(e, {
          parent: true
        }), o = n.node, a = A.basename(e);
        if (!a) throw new i.ErrnoError(28);
        if (a === "." || a === "..") throw new i.ErrnoError(20);
        var s = i.mayCreate(o, a);
        if (s) throw new i.ErrnoError(s);
        if (!o.node_ops.mknod) throw new i.ErrnoError(63);
        return o.node_ops.mknod(o, a, r, t);
      },
      statfs(e) {
        return i.statfsNode(i.lookupPath(e, {
          follow: true
        }).node);
      },
      statfsStream(e) {
        return i.statfsNode(e.node);
      },
      statfsNode(e) {
        var r = {
          bsize: 4096,
          frsize: 4096,
          blocks: 1e6,
          bfree: 5e5,
          bavail: 5e5,
          files: i.nextInode,
          ffree: i.nextInode - 1,
          fsid: 42,
          flags: 2,
          namelen: 255
        };
        return e.node_ops.statfs && Object.assign(r, e.node_ops.statfs(e.mount.opts.root)), r;
      },
      create(e, r = 438) {
        return r &= 4095, r |= 32768, i.mknod(e, r, 0);
      },
      mkdir(e, r = 511) {
        return r &= 1023, r |= 16384, i.mknod(e, r, 0);
      },
      mkdirTree(e, r) {
        var t = e.split("/"), n = "";
        for (var o of t) if (o) {
          (n || A.isAbs(e)) && (n += "/"), n += o;
          try {
            i.mkdir(n, r);
          } catch (a) {
            if (a.errno != 20) throw a;
          }
        }
      },
      mkdev(e, r, t) {
        return typeof t > "u" && (t = r, r = 438), r |= 8192, i.mknod(e, r, t);
      },
      symlink(e, r) {
        if (!Se.resolve(e)) throw new i.ErrnoError(44);
        var t = i.lookupPath(r, {
          parent: true
        }), n = t.node;
        if (!n) throw new i.ErrnoError(44);
        var o = A.basename(r), a = i.mayCreate(n, o);
        if (a) throw new i.ErrnoError(a);
        if (!n.node_ops.symlink) throw new i.ErrnoError(63);
        return n.node_ops.symlink(n, o, e);
      },
      rename(e, r) {
        var t = A.dirname(e), n = A.dirname(r), o = A.basename(e), a = A.basename(r), s, c, l;
        if (s = i.lookupPath(e, {
          parent: true
        }), c = s.node, s = i.lookupPath(r, {
          parent: true
        }), l = s.node, !c || !l) throw new i.ErrnoError(44);
        if (c.mount !== l.mount) throw new i.ErrnoError(75);
        var f = i.lookupNode(c, o), v = Se.relative(e, n);
        if (v.charAt(0) !== ".") throw new i.ErrnoError(28);
        if (v = Se.relative(r, t), v.charAt(0) !== ".") throw new i.ErrnoError(55);
        var h;
        try {
          h = i.lookupNode(l, a);
        } catch {
        }
        if (f !== h) {
          var m = i.isDir(f.mode), _ = i.mayDelete(c, o, m);
          if (_) throw new i.ErrnoError(_);
          if (_ = h ? i.mayDelete(l, a, m) : i.mayCreate(l, a), _) throw new i.ErrnoError(_);
          if (!c.node_ops.rename) throw new i.ErrnoError(63);
          if (i.isMountpoint(f) || h && i.isMountpoint(h)) throw new i.ErrnoError(10);
          if (l !== c && (_ = i.nodePermissions(c, "w"), _)) throw new i.ErrnoError(_);
          i.hashRemoveNode(f);
          try {
            c.node_ops.rename(f, l, a), f.parent = l;
          } catch (T) {
            throw T;
          } finally {
            i.hashAddNode(f);
          }
        }
      },
      rmdir(e) {
        var r = i.lookupPath(e, {
          parent: true
        }), t = r.node, n = A.basename(e), o = i.lookupNode(t, n), a = i.mayDelete(t, n, true);
        if (a) throw new i.ErrnoError(a);
        if (!t.node_ops.rmdir) throw new i.ErrnoError(63);
        if (i.isMountpoint(o)) throw new i.ErrnoError(10);
        t.node_ops.rmdir(t, n), i.destroyNode(o);
      },
      readdir(e) {
        var r = i.lookupPath(e, {
          follow: true
        }), t = r.node, n = i.checkOpExists(t.node_ops.readdir, 54);
        return n(t);
      },
      unlink(e) {
        var r = i.lookupPath(e, {
          parent: true
        }), t = r.node;
        if (!t) throw new i.ErrnoError(44);
        var n = A.basename(e), o = i.lookupNode(t, n), a = i.mayDelete(t, n, false);
        if (a) throw new i.ErrnoError(a);
        if (!t.node_ops.unlink) throw new i.ErrnoError(63);
        if (i.isMountpoint(o)) throw new i.ErrnoError(10);
        t.node_ops.unlink(t, n), i.destroyNode(o);
      },
      readlink(e) {
        var r = i.lookupPath(e), t = r.node;
        if (!t) throw new i.ErrnoError(44);
        if (!t.node_ops.readlink) throw new i.ErrnoError(28);
        return t.node_ops.readlink(t);
      },
      stat(e, r) {
        var t = i.lookupPath(e, {
          follow: !r
        }), n = t.node, o = i.checkOpExists(n.node_ops.getattr, 63);
        return o(n);
      },
      fstat(e) {
        var r = i.getStreamChecked(e), t = r.node, n = r.stream_ops.getattr, o = n ? r : t;
        return n ?? (n = t.node_ops.getattr), i.checkOpExists(n, 63), n(o);
      },
      lstat(e) {
        return i.stat(e, true);
      },
      doChmod(e, r, t, n) {
        i.doSetAttr(e, r, {
          mode: t & 4095 | r.mode & -4096,
          ctime: Date.now(),
          dontFollow: n
        });
      },
      chmod(e, r, t) {
        var n;
        if (typeof e == "string") {
          var o = i.lookupPath(e, {
            follow: !t
          });
          n = o.node;
        } else n = e;
        i.doChmod(null, n, r, t);
      },
      lchmod(e, r) {
        i.chmod(e, r, true);
      },
      fchmod(e, r) {
        var t = i.getStreamChecked(e);
        i.doChmod(t, t.node, r, false);
      },
      doChown(e, r, t) {
        i.doSetAttr(e, r, {
          timestamp: Date.now(),
          dontFollow: t
        });
      },
      chown(e, r, t, n) {
        var o;
        if (typeof e == "string") {
          var a = i.lookupPath(e, {
            follow: !n
          });
          o = a.node;
        } else o = e;
        i.doChown(null, o, n);
      },
      lchown(e, r, t) {
        i.chown(e, r, t, true);
      },
      fchown(e, r, t) {
        var n = i.getStreamChecked(e);
        i.doChown(n, n.node, false);
      },
      doTruncate(e, r, t) {
        if (i.isDir(r.mode)) throw new i.ErrnoError(31);
        if (!i.isFile(r.mode)) throw new i.ErrnoError(28);
        var n = i.nodePermissions(r, "w");
        if (n) throw new i.ErrnoError(n);
        i.doSetAttr(e, r, {
          size: t,
          timestamp: Date.now()
        });
      },
      truncate(e, r) {
        if (r < 0) throw new i.ErrnoError(28);
        var t;
        if (typeof e == "string") {
          var n = i.lookupPath(e, {
            follow: true
          });
          t = n.node;
        } else t = e;
        i.doTruncate(null, t, r);
      },
      ftruncate(e, r) {
        var t = i.getStreamChecked(e);
        if (r < 0 || !(t.flags & 2097155)) throw new i.ErrnoError(28);
        i.doTruncate(t, t.node, r);
      },
      utime(e, r, t) {
        var n = i.lookupPath(e, {
          follow: true
        }), o = n.node, a = i.checkOpExists(o.node_ops.setattr, 63);
        a(o, {
          atime: r,
          mtime: t
        });
      },
      open(e, r, t = 438) {
        if (e === "") throw new i.ErrnoError(44);
        r = typeof r == "string" ? nt(r) : r, r & 64 ? t = t & 4095 | 32768 : t = 0;
        var n, o;
        if (typeof e == "object") n = e;
        else {
          o = e.endsWith("/");
          var a = i.lookupPath(e, {
            follow: !(r & 131072),
            noent_okay: true
          });
          n = a.node, e = a.path;
        }
        var s = false;
        if (r & 64) if (n) {
          if (r & 128) throw new i.ErrnoError(20);
        } else {
          if (o) throw new i.ErrnoError(31);
          n = i.mknod(e, t | 511, 0), s = true;
        }
        if (!n) throw new i.ErrnoError(44);
        if (i.isChrdev(n.mode) && (r &= -513), r & 65536 && !i.isDir(n.mode)) throw new i.ErrnoError(54);
        if (!s) {
          var c = i.mayOpen(n, r);
          if (c) throw new i.ErrnoError(c);
        }
        r & 512 && !s && i.truncate(n, 0), r &= -131713;
        var l = i.createStream({
          node: n,
          path: i.getPath(n),
          flags: r,
          seekable: true,
          position: 0,
          stream_ops: n.stream_ops,
          ungotten: [],
          error: false
        });
        return l.stream_ops.open && l.stream_ops.open(l), s && i.chmod(n, t & 511), d.logReadFiles && !(r & 1) && (e in i.readFiles || (i.readFiles[e] = 1)), l;
      },
      close(e) {
        if (i.isClosed(e)) throw new i.ErrnoError(8);
        e.getdents && (e.getdents = null);
        try {
          e.stream_ops.close && e.stream_ops.close(e);
        } catch (r) {
          throw r;
        } finally {
          i.closeStream(e.fd);
        }
        e.fd = null;
      },
      isClosed(e) {
        return e.fd === null;
      },
      llseek(e, r, t) {
        if (i.isClosed(e)) throw new i.ErrnoError(8);
        if (!e.seekable || !e.stream_ops.llseek) throw new i.ErrnoError(70);
        if (t != 0 && t != 1 && t != 2) throw new i.ErrnoError(28);
        return e.position = e.stream_ops.llseek(e, r, t), e.ungotten = [], e.position;
      },
      read(e, r, t, n, o) {
        if (u(t >= 0), n < 0 || o < 0) throw new i.ErrnoError(28);
        if (i.isClosed(e)) throw new i.ErrnoError(8);
        if ((e.flags & 2097155) === 1) throw new i.ErrnoError(8);
        if (i.isDir(e.node.mode)) throw new i.ErrnoError(31);
        if (!e.stream_ops.read) throw new i.ErrnoError(28);
        var a = typeof o < "u";
        if (!a) o = e.position;
        else if (!e.seekable) throw new i.ErrnoError(70);
        var s = e.stream_ops.read(e, r, t, n, o);
        return a || (e.position += s), s;
      },
      write(e, r, t, n, o, a) {
        if (u(t >= 0), n < 0 || o < 0) throw new i.ErrnoError(28);
        if (i.isClosed(e)) throw new i.ErrnoError(8);
        if (!(e.flags & 2097155)) throw new i.ErrnoError(8);
        if (i.isDir(e.node.mode)) throw new i.ErrnoError(31);
        if (!e.stream_ops.write) throw new i.ErrnoError(28);
        e.seekable && e.flags & 1024 && i.llseek(e, 0, 2);
        var s = typeof o < "u";
        if (!s) o = e.position;
        else if (!e.seekable) throw new i.ErrnoError(70);
        var c = e.stream_ops.write(e, r, t, n, o, a);
        return s || (e.position += c), c;
      },
      mmap(e, r, t, n, o) {
        if (n & 2 && !(o & 2) && (e.flags & 2097155) !== 2) throw new i.ErrnoError(2);
        if ((e.flags & 2097155) === 1) throw new i.ErrnoError(2);
        if (!e.stream_ops.mmap) throw new i.ErrnoError(43);
        if (!r) throw new i.ErrnoError(28);
        return e.stream_ops.mmap(e, r, t, n, o);
      },
      msync(e, r, t, n, o) {
        return u(t >= 0), e.stream_ops.msync ? e.stream_ops.msync(e, r, t, n, o) : 0;
      },
      ioctl(e, r, t) {
        if (!e.stream_ops.ioctl) throw new i.ErrnoError(59);
        return e.stream_ops.ioctl(e, r, t);
      },
      readFile(e, r = {}) {
        r.flags = r.flags || 0, r.encoding = r.encoding || "binary", r.encoding !== "utf8" && r.encoding !== "binary" && b(`Invalid encoding type "${r.encoding}"`);
        var t = i.open(e, r.flags), n = i.stat(e), o = n.size, a = new Uint8Array(o);
        return i.read(t, a, 0, o, 0), r.encoding === "utf8" && (a = we(a)), i.close(t), a;
      },
      writeFile(e, r, t = {}) {
        t.flags = t.flags || 577;
        var n = i.open(e, t.flags, t.mode);
        typeof r == "string" && (r = new Uint8Array(nr(r))), ArrayBuffer.isView(r) ? i.write(n, r, 0, r.byteLength, void 0, t.canOwn) : b("Unsupported data type"), i.close(n);
      },
      cwd: () => i.currentPath,
      chdir(e) {
        var r = i.lookupPath(e, {
          follow: true
        });
        if (r.node === null) throw new i.ErrnoError(44);
        if (!i.isDir(r.node.mode)) throw new i.ErrnoError(54);
        var t = i.nodePermissions(r.node, "x");
        if (t) throw new i.ErrnoError(t);
        i.currentPath = r.path;
      },
      createDefaultDirectories() {
        i.mkdir("/tmp"), i.mkdir("/home"), i.mkdir("/home/web_user");
      },
      createDefaultDevices() {
        i.mkdir("/dev"), i.registerDevice(i.makedev(1, 3), {
          read: () => 0,
          write: (n, o, a, s, c) => s,
          llseek: () => 0
        }), i.mkdev("/dev/null", i.makedev(1, 3)), ve.register(i.makedev(5, 0), ve.default_tty_ops), ve.register(i.makedev(6, 0), ve.default_tty1_ops), i.mkdev("/dev/tty", i.makedev(5, 0)), i.mkdev("/dev/tty1", i.makedev(6, 0));
        var e = new Uint8Array(1024), r = 0, t = () => (r === 0 && (vr(e), r = e.byteLength), e[--r]);
        i.createDevice("/dev", "random", t), i.createDevice("/dev", "urandom", t), i.mkdir("/dev/shm"), i.mkdir("/dev/shm/tmp");
      },
      createSpecialDirectories() {
        i.mkdir("/proc");
        var e = i.mkdir("/proc/self");
        i.mkdir("/proc/self/fd"), i.mount({
          mount() {
            var r = i.createNode(e, "fd", 16895, 73);
            return r.stream_ops = {
              llseek: E.stream_ops.llseek
            }, r.node_ops = {
              lookup(t, n) {
                var o = +n, a = i.getStreamChecked(o), s = {
                  parent: null,
                  mount: {
                    mountpoint: "fake"
                  },
                  node_ops: {
                    readlink: () => a.path
                  },
                  id: o + 1
                };
                return s.parent = s, s;
              },
              readdir() {
                return Array.from(i.streams.entries()).filter(([t, n]) => n).map(([t, n]) => t.toString());
              }
            }, r;
          }
        }, {}, "/proc/self/fd");
      },
      createStandardStreams(e, r, t) {
        e ? i.createDevice("/dev", "stdin", e) : i.symlink("/dev/tty", "/dev/stdin"), r ? i.createDevice("/dev", "stdout", null, r) : i.symlink("/dev/tty", "/dev/stdout"), t ? i.createDevice("/dev", "stderr", null, t) : i.symlink("/dev/tty1", "/dev/stderr");
        var n = i.open("/dev/stdin", 0), o = i.open("/dev/stdout", 1), a = i.open("/dev/stderr", 1);
        u(n.fd === 0, `invalid handle for stdin (${n.fd})`), u(o.fd === 1, `invalid handle for stdout (${o.fd})`), u(a.fd === 2, `invalid handle for stderr (${a.fd})`);
      },
      staticInit() {
        i.nameTable = new Array(4096), i.mount(E, {}, "/"), i.createDefaultDirectories(), i.createDefaultDevices(), i.createSpecialDirectories(), i.filesystems = {
          MEMFS: E
        };
      },
      init(e, r, t) {
        u(!i.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"), i.initialized = true, e ?? (e = d.stdin), r ?? (r = d.stdout), t ?? (t = d.stderr), i.createStandardStreams(e, r, t);
      },
      quit() {
        i.initialized = false, kr(0);
        for (var e of i.streams) e && i.close(e);
      },
      findObject(e, r) {
        var t = i.analyzePath(e, r);
        return t.exists ? t.object : null;
      },
      analyzePath(e, r) {
        try {
          var t = i.lookupPath(e, {
            follow: !r
          });
          e = t.path;
        } catch {
        }
        var n = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        try {
          var t = i.lookupPath(e, {
            parent: true
          });
          n.parentExists = true, n.parentPath = t.path, n.parentObject = t.node, n.name = A.basename(e), t = i.lookupPath(e, {
            follow: !r
          }), n.exists = true, n.path = t.path, n.object = t.node, n.name = t.node.name, n.isRoot = t.path === "/";
        } catch (o) {
          n.error = o.errno;
        }
        return n;
      },
      createPath(e, r, t, n) {
        e = typeof e == "string" ? e : i.getPath(e);
        for (var o = r.split("/").reverse(); o.length; ) {
          var a = o.pop();
          if (a) {
            var s = A.join2(e, a);
            try {
              i.mkdir(s);
            } catch (c) {
              if (c.errno != 20) throw c;
            }
            e = s;
          }
        }
        return s;
      },
      createFile(e, r, t, n, o) {
        var a = A.join2(typeof e == "string" ? e : i.getPath(e), r), s = ir(n, o);
        return i.create(a, s);
      },
      createDataFile(e, r, t, n, o, a) {
        var s = r;
        e && (e = typeof e == "string" ? e : i.getPath(e), s = r ? A.join2(e, r) : e);
        var c = ir(n, o), l = i.create(s, c);
        if (t) {
          if (typeof t == "string") {
            for (var f = new Array(t.length), v = 0, h = t.length; v < h; ++v) f[v] = t.charCodeAt(v);
            t = f;
          }
          i.chmod(l, c | 146);
          var m = i.open(l, 577);
          i.write(m, t, 0, t.length, 0, a), i.close(m), i.chmod(l, c);
        }
      },
      createDevice(e, r, t, n) {
        var _a2;
        var o = A.join2(typeof e == "string" ? e : i.getPath(e), r), a = ir(!!t, !!n);
        (_a2 = i.createDevice).major ?? (_a2.major = 64);
        var s = i.makedev(i.createDevice.major++, 0);
        return i.registerDevice(s, {
          open(c) {
            c.seekable = false;
          },
          close(c) {
            var _a3;
            ((_a3 = n == null ? void 0 : n.buffer) == null ? void 0 : _a3.length) && n(10);
          },
          read(c, l, f, v, h) {
            for (var m = 0, _ = 0; _ < v; _++) {
              var T;
              try {
                T = t();
              } catch {
                throw new i.ErrnoError(29);
              }
              if (T === void 0 && m === 0) throw new i.ErrnoError(6);
              if (T == null) break;
              m++, l[f + _] = T;
            }
            return m && (c.node.atime = Date.now()), m;
          },
          write(c, l, f, v, h) {
            for (var m = 0; m < v; m++) try {
              n(l[f + m]);
            } catch {
              throw new i.ErrnoError(29);
            }
            return v && (c.node.mtime = c.node.ctime = Date.now()), m;
          }
        }), i.mkdev(o, a, s);
      },
      forceLoadFile(e) {
        if (e.isDevice || e.isFolder || e.link || e.contents) return true;
        if (globalThis.XMLHttpRequest) b("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        else try {
          e.contents = ae(e.url);
        } catch {
          throw new i.ErrnoError(29);
        }
      },
      createLazyFile(e, r, t, n, o) {
        class a {
          constructor() {
            __publicField(this, "lengthKnown", false);
            __publicField(this, "chunks", []);
          }
          get(m) {
            if (!(m > this.length - 1 || m < 0)) {
              var _ = m % this.chunkSize, T = m / this.chunkSize | 0;
              return this.getter(T)[_];
            }
          }
          setDataGetter(m) {
            this.getter = m;
          }
          cacheLength() {
            var m = new XMLHttpRequest();
            m.open("HEAD", t, false), m.send(null), m.status >= 200 && m.status < 300 || m.status === 304 || b("Couldn't load " + t + ". Status: " + m.status);
            var _ = Number(m.getResponseHeader("Content-length")), T, D = (T = m.getResponseHeader("Accept-Ranges")) && T === "bytes", L = (T = m.getResponseHeader("Content-Encoding")) && T === "gzip", C = 1024 * 1024;
            D || (C = _);
            var W = ($, Te) => {
              $ > Te && b("invalid range (" + $ + ", " + Te + ") or no bytes requested!"), Te > _ - 1 && b("only " + _ + " bytes available! programmer error!");
              var I = new XMLHttpRequest();
              return I.open("GET", t, false), _ !== C && I.setRequestHeader("Range", "bytes=" + $ + "-" + Te), I.responseType = "arraybuffer", I.overrideMimeType && I.overrideMimeType("text/plain; charset=x-user-defined"), I.send(null), I.status >= 200 && I.status < 300 || I.status === 304 || b("Couldn't load " + t + ". Status: " + I.status), I.response !== void 0 ? new Uint8Array(I.response || []) : nr(I.responseText || "");
            }, Ge = this;
            Ge.setDataGetter(($) => {
              var Te = $ * C, I = ($ + 1) * C - 1;
              return I = Math.min(I, _ - 1), typeof Ge.chunks[$] > "u" && (Ge.chunks[$] = W(Te, I)), typeof Ge.chunks[$] > "u" && b("doXHR failed!"), Ge.chunks[$];
            }), (L || !_) && (C = _ = 1, _ = this.getter(0).length, C = _, se("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = _, this._chunkSize = C, this.lengthKnown = true;
          }
          get length() {
            return this.lengthKnown || this.cacheLength(), this._length;
          }
          get chunkSize() {
            return this.lengthKnown || this.cacheLength(), this._chunkSize;
          }
        }
        if (globalThis.XMLHttpRequest) {
          z || b("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
          var s = new a(), c = {
            isDevice: false,
            contents: s
          };
        } else var c = {
          isDevice: false,
          url: t
        };
        var l = i.createFile(e, r, c, n, o);
        c.contents ? l.contents = c.contents : c.url && (l.contents = null, l.url = c.url), Object.defineProperties(l, {
          usedBytes: {
            get: function() {
              return this.contents.length;
            }
          }
        });
        var f = {};
        for (const [h, m] of Object.entries(l.stream_ops)) f[h] = (..._) => (i.forceLoadFile(l), m(..._));
        function v(h, m, _, T, D) {
          var L = h.node.contents;
          if (D >= L.length) return 0;
          var C = Math.min(L.length - D, T);
          if (u(C >= 0), L.slice) for (var W = 0; W < C; W++) m[_ + W] = L[D + W];
          else for (var W = 0; W < C; W++) m[_ + W] = L.get(D + W);
          return C;
        }
        return f.read = (h, m, _, T, D) => (i.forceLoadFile(l), v(h, m, _, T, D)), f.mmap = (h, m, _, T, D) => {
          i.forceLoadFile(l);
          var L = hr();
          if (!L) throw new i.ErrnoError(48);
          return v(h, x, L, m, _), {
            ptr: L,
            allocated: true
          };
        }, l.stream_ops = f, l;
      },
      absolutePath() {
        b("FS.absolutePath has been removed; use PATH_FS.resolve instead");
      },
      createFolder() {
        b("FS.createFolder has been removed; use FS.mkdir instead");
      },
      createLink() {
        b("FS.createLink has been removed; use FS.symlink instead");
      },
      joinPath() {
        b("FS.joinPath has been removed; use PATH.join instead");
      },
      mmapAlloc() {
        b("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
      },
      standardizePath() {
        b("FS.standardizePath has been removed; use PATH.normalize instead");
      }
    }, $e = {
      calculateAt(e, r, t) {
        if (A.isAbs(r)) return r;
        var n;
        if (e === -100) n = i.cwd();
        else {
          var o = $e.getStreamFromFD(e);
          n = o.path;
        }
        if (r.length == 0) {
          if (!t) throw new i.ErrnoError(44);
          return n;
        }
        return n + "/" + r;
      },
      writeStat(e, r) {
        g[e >> 2] = r.dev, g[e + 4 >> 2] = r.mode, g[e + 8 >> 2] = r.nlink, g[e + 12 >> 2] = r.uid, g[e + 16 >> 2] = r.gid, g[e + 20 >> 2] = r.rdev, O[e + 24 >> 3] = BigInt(r.size), Q[e + 32 >> 2] = 4096, Q[e + 36 >> 2] = r.blocks;
        var t = r.atime.getTime(), n = r.mtime.getTime(), o = r.ctime.getTime();
        return O[e + 40 >> 3] = BigInt(Math.floor(t / 1e3)), g[e + 48 >> 2] = t % 1e3 * 1e3 * 1e3, O[e + 56 >> 3] = BigInt(Math.floor(n / 1e3)), g[e + 64 >> 2] = n % 1e3 * 1e3 * 1e3, O[e + 72 >> 3] = BigInt(Math.floor(o / 1e3)), g[e + 80 >> 2] = o % 1e3 * 1e3 * 1e3, O[e + 88 >> 3] = BigInt(r.ino), 0;
      },
      writeStatFs(e, r) {
        g[e + 4 >> 2] = r.bsize, g[e + 60 >> 2] = r.bsize, O[e + 8 >> 3] = BigInt(r.blocks), O[e + 16 >> 3] = BigInt(r.bfree), O[e + 24 >> 3] = BigInt(r.bavail), O[e + 32 >> 3] = BigInt(r.files), O[e + 40 >> 3] = BigInt(r.ffree), g[e + 48 >> 2] = r.fsid, g[e + 64 >> 2] = r.flags, g[e + 56 >> 2] = r.namelen;
      },
      doMsync(e, r, t, n, o) {
        if (!i.isFile(r.node.mode)) throw new i.ErrnoError(43);
        if (n & 2) return 0;
        var a = X.slice(e, e + t);
        i.msync(r, a, o, t, n);
      },
      getStreamFromFD(e) {
        var r = i.getStreamChecked(e);
        return r;
      },
      varargs: void 0,
      getStr(e) {
        var r = _e(e);
        return r;
      }
    };
    function ft(e) {
      try {
        var r = $e.getStreamFromFD(e);
        return i.close(r), 0;
      } catch (t) {
        if (typeof i > "u" || t.name !== "ErrnoError") throw t;
        return t.errno;
      }
    }
    var mt = (e, r, t, n) => {
      for (var o = 0, a = 0; a < t; a++) {
        var s = g[r >> 2], c = g[r + 4 >> 2];
        r += 8;
        var l = i.read(e, x, s, c, n);
        if (l < 0) return -1;
        if (o += l, l < c) break;
      }
      return o;
    };
    function _t(e, r, t, n) {
      try {
        var o = $e.getStreamFromFD(e), a = mt(o, r, t);
        return g[n >> 2] = a, 0;
      } catch (s) {
        if (typeof i > "u" || s.name !== "ErrnoError") throw s;
        return s.errno;
      }
    }
    var vt = 9007199254740992, ht = -9007199254740992, pt = (e) => e < ht || e > vt ? NaN : Number(e);
    function gt(e, r, t, n) {
      r = pt(r);
      try {
        if (isNaN(r)) return 61;
        var o = $e.getStreamFromFD(e);
        return i.llseek(o, r, t), O[n >> 3] = BigInt(o.position), o.getdents && r === 0 && t === 0 && (o.getdents = null), 0;
      } catch (a) {
        if (typeof i > "u" || a.name !== "ErrnoError") throw a;
        return a.errno;
      }
    }
    var Et = (e, r, t, n) => {
      for (var o = 0, a = 0; a < t; a++) {
        var s = g[r >> 2], c = g[r + 4 >> 2];
        r += 8;
        var l = i.write(e, x, s, c, n);
        if (l < 0) return -1;
        if (o += l, l < c) break;
      }
      return o;
    };
    function yt(e, r, t, n) {
      try {
        var o = $e.getStreamFromFD(e), a = Et(o, r, t);
        return g[n >> 2] = a, 0;
      } catch (s) {
        if (typeof i > "u" || s.name !== "ErrnoError") throw s;
        return s.errno;
      }
    }
    var yr = [], F = (e) => {
      var r = yr[e];
      return r || (yr[e] = r = cr.get(e)), u(cr.get(e) == r, "JavaScript-side Wasm function table mirror is out of date!"), r;
    }, wt = (e) => Ze(e), St = (e) => sr(e), wr = (e) => Ar(e), kt = (e) => {
      var r = k(), t = wr(4), n = wr(4);
      Mr(e, t, n);
      var o = g[t >> 2], a = g[n >> 2], s = _e(o);
      or(o);
      var c;
      return a && (c = _e(a), or(a)), S(r), [
        s,
        c
      ];
    }, Sr = (e) => kt(e);
    i.createPreloadedFile = ut, i.preloadFile = Er, i.staticInit();
    {
      if (d.noExitRuntime && d.noExitRuntime, d.preloadPlugins && (gr = d.preloadPlugins), d.print && (se = d.print), d.printErr && (N = d.printErr), d.wasmBinary && (Z = d.wasmBinary), bt(), d.arguments && d.arguments, d.thisProgram && (be = d.thisProgram), u(typeof d.memoryInitializerPrefixURL > "u", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"), u(typeof d.pthreadMainPrefixURL > "u", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"), u(typeof d.cdInitializerPrefixURL > "u", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"), u(typeof d.filePackagePrefixURL > "u", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"), u(typeof d.read > "u", "Module.read option was removed"), u(typeof d.readAsync > "u", "Module.readAsync option was removed (modify readAsync in JS)"), u(typeof d.readBinary > "u", "Module.readBinary option was removed (modify readBinary in JS)"), u(typeof d.setWindowTitle > "u", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"), u(typeof d.TOTAL_MEMORY > "u", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"), u(typeof d.ENVIRONMENT > "u", "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)"), u(typeof d.STACK_SIZE > "u", "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"), u(typeof d.wasmMemory > "u", "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"), u(typeof d.INITIAL_MEMORY > "u", "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically"), d.preInit) for (typeof d.preInit == "function" && (d.preInit = [
        d.preInit
      ]); d.preInit.length > 0; ) d.preInit.shift()();
      J("preInit");
    }
    var Ft = [
      "writeI53ToI64",
      "writeI53ToI64Clamped",
      "writeI53ToI64Signaling",
      "writeI53ToU64Clamped",
      "writeI53ToU64Signaling",
      "readI53FromI64",
      "readI53FromU64",
      "convertI32PairToI53",
      "convertI32PairToI53Checked",
      "convertU32PairToI53",
      "getTempRet0",
      "createNamedFunction",
      "zeroMemory",
      "exitJS",
      "withStackSave",
      "inetPton4",
      "inetNtop4",
      "inetPton6",
      "inetNtop6",
      "readSockaddr",
      "writeSockaddr",
      "readEmAsmArgs",
      "jstoi_q",
      "autoResumeAudioContext",
      "getDynCaller",
      "dynCall",
      "handleException",
      "keepRuntimeAlive",
      "runtimeKeepalivePush",
      "runtimeKeepalivePop",
      "callUserCallback",
      "maybeExit",
      "asmjsMangle",
      "HandleAllocator",
      "addOnInit",
      "addOnPostCtor",
      "addOnPreMain",
      "addOnExit",
      "STACK_SIZE",
      "STACK_ALIGN",
      "POINTER_SIZE",
      "ASSERTIONS",
      "ccall",
      "cwrap",
      "convertJsFunctionToWasm",
      "getEmptyTableSlot",
      "updateTableMap",
      "getFunctionAddress",
      "addFunction",
      "removeFunction",
      "intArrayToString",
      "AsciiToString",
      "stringToAscii",
      "UTF16ToString",
      "stringToUTF16",
      "lengthBytesUTF16",
      "UTF32ToString",
      "stringToUTF32",
      "lengthBytesUTF32",
      "stringToNewUTF8",
      "stringToUTF8OnStack",
      "writeArrayToMemory",
      "registerKeyEventCallback",
      "maybeCStringToJsString",
      "findEventTarget",
      "getBoundingClientRect",
      "fillMouseEventData",
      "registerMouseEventCallback",
      "registerWheelEventCallback",
      "registerUiEventCallback",
      "registerFocusEventCallback",
      "fillDeviceOrientationEventData",
      "registerDeviceOrientationEventCallback",
      "fillDeviceMotionEventData",
      "registerDeviceMotionEventCallback",
      "screenOrientation",
      "fillOrientationChangeEventData",
      "registerOrientationChangeEventCallback",
      "fillFullscreenChangeEventData",
      "registerFullscreenChangeEventCallback",
      "JSEvents_requestFullscreen",
      "JSEvents_resizeCanvasForFullscreen",
      "registerRestoreOldStyle",
      "hideEverythingExceptGivenElement",
      "restoreHiddenElements",
      "setLetterbox",
      "softFullscreenResizeWebGLRenderTarget",
      "doRequestFullscreen",
      "fillPointerlockChangeEventData",
      "registerPointerlockChangeEventCallback",
      "registerPointerlockErrorEventCallback",
      "requestPointerLock",
      "fillVisibilityChangeEventData",
      "registerVisibilityChangeEventCallback",
      "registerTouchEventCallback",
      "fillGamepadEventData",
      "registerGamepadEventCallback",
      "registerBeforeUnloadEventCallback",
      "fillBatteryEventData",
      "registerBatteryEventCallback",
      "setCanvasElementSize",
      "getCanvasElementSize",
      "jsStackTrace",
      "getCallstack",
      "convertPCtoSourceLocation",
      "checkWasiClock",
      "wasiRightsToMuslOFlags",
      "wasiOFlagsToMuslOFlags",
      "safeSetTimeout",
      "setImmediateWrapped",
      "safeRequestAnimationFrame",
      "clearImmediateWrapped",
      "registerPostMainLoop",
      "registerPreMainLoop",
      "getPromise",
      "makePromise",
      "idsToPromises",
      "makePromiseCallback",
      "Browser_asyncPrepareDataCounter",
      "isLeapYear",
      "ydayFromDate",
      "arraySum",
      "addDays",
      "getSocketFromFD",
      "getSocketAddress",
      "FS_mkdirTree",
      "_setNetworkCallback",
      "heapObjectForWebGLType",
      "toTypedArrayIndex",
      "webgl_enable_ANGLE_instanced_arrays",
      "webgl_enable_OES_vertex_array_object",
      "webgl_enable_WEBGL_draw_buffers",
      "webgl_enable_WEBGL_multi_draw",
      "webgl_enable_EXT_polygon_offset_clamp",
      "webgl_enable_EXT_clip_control",
      "webgl_enable_WEBGL_polygon_mode",
      "emscriptenWebGLGet",
      "computeUnpackAlignedImageSize",
      "colorChannelsInGlTextureFormat",
      "emscriptenWebGLGetTexPixelData",
      "emscriptenWebGLGetUniform",
      "webglGetUniformLocation",
      "webglPrepareUniformLocationsBeforeFirstUse",
      "webglGetLeftBracePos",
      "emscriptenWebGLGetVertexAttrib",
      "__glGetActiveAttribOrUniform",
      "writeGLArray",
      "registerWebGlEventCallback",
      "runAndAbortIfError",
      "ALLOC_NORMAL",
      "ALLOC_STACK",
      "allocate",
      "writeStringToMemory",
      "writeAsciiToMemory",
      "allocateUTF8",
      "allocateUTF8OnStack",
      "demangle",
      "stackTrace",
      "getNativeTypeSize"
    ];
    Ft.forEach(Me);
    var Tt = [
      "run",
      "out",
      "err",
      "callMain",
      "abort",
      "wasmExports",
      "HEAPF32",
      "HEAP8",
      "HEAP16",
      "HEAPU16",
      "HEAP32",
      "HEAP64",
      "HEAPU64",
      "writeStackCookie",
      "checkStackCookie",
      "INT53_MAX",
      "INT53_MIN",
      "bigintToI53Checked",
      "stackSave",
      "stackRestore",
      "stackAlloc",
      "setTempRet0",
      "ptrToString",
      "getHeapMax",
      "growMemory",
      "ENV",
      "ERRNO_CODES",
      "strError",
      "DNS",
      "Protocols",
      "Sockets",
      "timers",
      "warnOnce",
      "readEmAsmArgsArray",
      "getExecutableName",
      "asyncLoad",
      "alignMemory",
      "mmapAlloc",
      "wasmTable",
      "wasmMemory",
      "getUniqueRunDependency",
      "noExitRuntime",
      "addRunDependency",
      "removeRunDependency",
      "addOnPreRun",
      "addOnPostRun",
      "freeTableIndexes",
      "functionsInTableMap",
      "setValue",
      "getValue",
      "PATH",
      "PATH_FS",
      "UTF8Decoder",
      "UTF8ArrayToString",
      "UTF8ToString",
      "stringToUTF8Array",
      "stringToUTF8",
      "lengthBytesUTF8",
      "intArrayFromString",
      "UTF16Decoder",
      "JSEvents",
      "specialHTMLTargets",
      "findCanvasEventTarget",
      "currentFullscreenStrategy",
      "restoreOldWindowedStyle",
      "UNWIND_CACHE",
      "ExitStatus",
      "getEnvStrings",
      "doReadv",
      "doWritev",
      "initRandomFill",
      "randomFill",
      "emSetImmediate",
      "emClearImmediate_deps",
      "emClearImmediate",
      "promiseMap",
      "uncaughtExceptionCount",
      "exceptionLast",
      "exceptionCaught",
      "ExceptionInfo",
      "findMatchingCatch",
      "getExceptionMessageCommon",
      "Browser",
      "requestFullscreen",
      "requestFullScreen",
      "setCanvasSize",
      "getUserMedia",
      "createContext",
      "getPreloadedImageData__data",
      "wget",
      "MONTH_DAYS_REGULAR",
      "MONTH_DAYS_LEAP",
      "MONTH_DAYS_REGULAR_CUMULATIVE",
      "MONTH_DAYS_LEAP_CUMULATIVE",
      "SYSCALLS",
      "preloadPlugins",
      "FS_createPreloadedFile",
      "FS_preloadFile",
      "FS_modeStringToFlags",
      "FS_getMode",
      "FS_stdin_getChar_buffer",
      "FS_stdin_getChar",
      "FS_unlink",
      "FS_createPath",
      "FS_createDevice",
      "FS_readFile",
      "FS",
      "FS_root",
      "FS_mounts",
      "FS_devices",
      "FS_streams",
      "FS_nextInode",
      "FS_nameTable",
      "FS_currentPath",
      "FS_initialized",
      "FS_ignorePermissions",
      "FS_filesystems",
      "FS_syncFSRequests",
      "FS_readFiles",
      "FS_lookupPath",
      "FS_getPath",
      "FS_hashName",
      "FS_hashAddNode",
      "FS_hashRemoveNode",
      "FS_lookupNode",
      "FS_createNode",
      "FS_destroyNode",
      "FS_isRoot",
      "FS_isMountpoint",
      "FS_isFile",
      "FS_isDir",
      "FS_isLink",
      "FS_isChrdev",
      "FS_isBlkdev",
      "FS_isFIFO",
      "FS_isSocket",
      "FS_flagsToPermissionString",
      "FS_nodePermissions",
      "FS_mayLookup",
      "FS_mayCreate",
      "FS_mayDelete",
      "FS_mayOpen",
      "FS_checkOpExists",
      "FS_nextfd",
      "FS_getStreamChecked",
      "FS_getStream",
      "FS_createStream",
      "FS_closeStream",
      "FS_dupStream",
      "FS_doSetAttr",
      "FS_chrdev_stream_ops",
      "FS_major",
      "FS_minor",
      "FS_makedev",
      "FS_registerDevice",
      "FS_getDevice",
      "FS_getMounts",
      "FS_syncfs",
      "FS_mount",
      "FS_unmount",
      "FS_lookup",
      "FS_mknod",
      "FS_statfs",
      "FS_statfsStream",
      "FS_statfsNode",
      "FS_create",
      "FS_mkdir",
      "FS_mkdev",
      "FS_symlink",
      "FS_rename",
      "FS_rmdir",
      "FS_readdir",
      "FS_readlink",
      "FS_stat",
      "FS_fstat",
      "FS_lstat",
      "FS_doChmod",
      "FS_chmod",
      "FS_lchmod",
      "FS_fchmod",
      "FS_doChown",
      "FS_chown",
      "FS_lchown",
      "FS_fchown",
      "FS_doTruncate",
      "FS_truncate",
      "FS_ftruncate",
      "FS_utime",
      "FS_open",
      "FS_close",
      "FS_isClosed",
      "FS_llseek",
      "FS_read",
      "FS_write",
      "FS_mmap",
      "FS_msync",
      "FS_ioctl",
      "FS_writeFile",
      "FS_cwd",
      "FS_chdir",
      "FS_createDefaultDirectories",
      "FS_createDefaultDevices",
      "FS_createSpecialDirectories",
      "FS_createStandardStreams",
      "FS_staticInit",
      "FS_init",
      "FS_quit",
      "FS_findObject",
      "FS_analyzePath",
      "FS_createFile",
      "FS_createDataFile",
      "FS_forceLoadFile",
      "FS_createLazyFile",
      "FS_absolutePath",
      "FS_createFolder",
      "FS_createLink",
      "FS_joinPath",
      "FS_mmapAlloc",
      "FS_standardizePath",
      "MEMFS",
      "TTY",
      "PIPEFS",
      "SOCKFS",
      "tempFixedLengthArray",
      "miniTempWebGLFloatBuffers",
      "miniTempWebGLIntBuffers",
      "GL",
      "AL",
      "GLUT",
      "EGL",
      "GLEW",
      "IDBStore",
      "SDL",
      "SDL_gfx",
      "print",
      "printErr",
      "jstoi_s"
    ];
    Tt.forEach(Ne), d.incrementExceptionRefcount = wt, d.decrementExceptionRefcount = St, d.getExceptionMessage = Sr;
    function bt() {
      Ae("fetchSettings");
    }
    var or = d._free = R("_free");
    d._modal = R("_modal"), d._malloc = R("_malloc");
    var kr = R("_fflush"), Fr = R("_strerror"), ar = R("_emscripten_stack_get_end"), w = R("_setThrew"), Tr = R("__emscripten_tempret_set"), br = R("_emscripten_stack_init"), Pr = R("__emscripten_stack_restore"), Ar = R("__emscripten_stack_alloc"), Rr = R("_emscripten_stack_get_current"), sr = R("___cxa_decrement_exception_refcount"), Ze = R("___cxa_increment_exception_refcount"), Mr = R("___get_exception_message"), Nr = R("___cxa_can_catch"), Or = R("___cxa_get_exception_ptr"), Je = R("wasmMemory"), cr = R("wasmTable");
    function Pt(e) {
      u(typeof e.free < "u", "missing Wasm export: free"), u(typeof e.modal < "u", "missing Wasm export: modal"), u(typeof e.malloc < "u", "missing Wasm export: malloc"), u(typeof e.__cxa_free_exception < "u", "missing Wasm export: __cxa_free_exception"), u(typeof e.fflush < "u", "missing Wasm export: fflush"), u(typeof e.strerror < "u", "missing Wasm export: strerror"), u(typeof e.emscripten_stack_get_end < "u", "missing Wasm export: emscripten_stack_get_end"), u(typeof e.emscripten_stack_get_base < "u", "missing Wasm export: emscripten_stack_get_base"), u(typeof e.setThrew < "u", "missing Wasm export: setThrew"), u(typeof e._emscripten_tempret_set < "u", "missing Wasm export: _emscripten_tempret_set"), u(typeof e.emscripten_stack_init < "u", "missing Wasm export: emscripten_stack_init"), u(typeof e.emscripten_stack_get_free < "u", "missing Wasm export: emscripten_stack_get_free"), u(typeof e._emscripten_stack_restore < "u", "missing Wasm export: _emscripten_stack_restore"), u(typeof e._emscripten_stack_alloc < "u", "missing Wasm export: _emscripten_stack_alloc"), u(typeof e.emscripten_stack_get_current < "u", "missing Wasm export: emscripten_stack_get_current"), u(typeof e.__cxa_decrement_exception_refcount < "u", "missing Wasm export: __cxa_decrement_exception_refcount"), u(typeof e.__cxa_increment_exception_refcount < "u", "missing Wasm export: __cxa_increment_exception_refcount"), u(typeof e.__get_exception_message < "u", "missing Wasm export: __get_exception_message"), u(typeof e.__cxa_can_catch < "u", "missing Wasm export: __cxa_can_catch"), u(typeof e.__cxa_get_exception_ptr < "u", "missing Wasm export: __cxa_get_exception_ptr"), u(typeof e.memory < "u", "missing Wasm export: memory"), u(typeof e.__indirect_function_table < "u", "missing Wasm export: __indirect_function_table"), or = d._free = B("free", 1), d._modal = B("modal", 47), d._malloc = B("malloc", 1), kr = B("fflush", 1), Fr = B("strerror", 1), ar = e.emscripten_stack_get_end, e.emscripten_stack_get_base, w = B("setThrew", 2), Tr = B("_emscripten_tempret_set", 1), br = e.emscripten_stack_init, e.emscripten_stack_get_free, Pr = e._emscripten_stack_restore, Ar = e._emscripten_stack_alloc, Rr = e.emscripten_stack_get_current, sr = B("__cxa_decrement_exception_refcount", 1), Ze = B("__cxa_increment_exception_refcount", 1), Mr = B("__get_exception_message", 3), Nr = B("__cxa_can_catch", 3), Or = B("__cxa_get_exception_ptr", 1), Je = e.memory, cr = e.__indirect_function_table;
    }
    var Dr = {
      __assert_fail: Lr,
      __cxa_begin_catch: Ur,
      __cxa_end_catch: Br,
      __cxa_find_matching_catch_2: zr,
      __cxa_find_matching_catch_3: Hr,
      __cxa_rethrow: Wr,
      __cxa_throw: jr,
      __cxa_uncaught_exceptions: $r,
      __resumeException: Gr,
      _abort_js: Vr,
      _tzset_js: Yr,
      emscripten_resize_heap: Zr,
      environ_get: Qr,
      environ_sizes_get: et,
      fd_close: ft,
      fd_read: _t,
      fd_seek: gt,
      fd_write: yt,
      invoke_diii: tn,
      invoke_fiii: rn,
      invoke_i: nn,
      invoke_ii: Mt,
      invoke_iid: Ut,
      invoke_iii: Dt,
      invoke_iiii: It,
      invoke_iiiidi: zt,
      invoke_iiiii: Jt,
      invoke_iiiiid: qt,
      invoke_iiiiii: Bt,
      invoke_iiiiiii: Vt,
      invoke_iiiiiiii: Kt,
      invoke_iiiiiiiiiii: Zt,
      invoke_iiiiiiiiiiii: on,
      invoke_iiiiiiiiiiiii: en,
      invoke_jiiii: Qt,
      invoke_v: Rt,
      invoke_vi: $t,
      invoke_vii: Nt,
      invoke_viid: Gt,
      invoke_viidd: Xt,
      invoke_viii: Ct,
      invoke_viiid: Yt,
      invoke_viiii: At,
      invoke_viiiii: Ot,
      invoke_viiiiii: xt,
      invoke_viiiiiid: Ht,
      invoke_viiiiiii: Lt,
      invoke_viiiiiiidiiii: jt,
      invoke_viiiiiiiiii: an,
      invoke_viiiiiiiiiidii: Wt,
      invoke_viiiiiiiiiiiiiii: sn
    };
    function At(e, r, t, n, o) {
      var a = k();
      try {
        F(e)(r, t, n, o);
      } catch (s) {
        if (S(a), !(s instanceof y)) throw s;
        w(1, 0);
      }
    }
    function Rt(e) {
      var r = k();
      try {
        F(e)();
      } catch (t) {
        if (S(r), !(t instanceof y)) throw t;
        w(1, 0);
      }
    }
    function Mt(e, r) {
      var t = k();
      try {
        return F(e)(r);
      } catch (n) {
        if (S(t), !(n instanceof y)) throw n;
        w(1, 0);
      }
    }
    function Nt(e, r, t) {
      var n = k();
      try {
        F(e)(r, t);
      } catch (o) {
        if (S(n), !(o instanceof y)) throw o;
        w(1, 0);
      }
    }
    function Ot(e, r, t, n, o, a) {
      var s = k();
      try {
        F(e)(r, t, n, o, a);
      } catch (c) {
        if (S(s), !(c instanceof y)) throw c;
        w(1, 0);
      }
    }
    function Dt(e, r, t) {
      var n = k();
      try {
        return F(e)(r, t);
      } catch (o) {
        if (S(n), !(o instanceof y)) throw o;
        w(1, 0);
      }
    }
    function Ct(e, r, t, n) {
      var o = k();
      try {
        F(e)(r, t, n);
      } catch (a) {
        if (S(o), !(a instanceof y)) throw a;
        w(1, 0);
      }
    }
    function It(e, r, t, n) {
      var o = k();
      try {
        return F(e)(r, t, n);
      } catch (a) {
        if (S(o), !(a instanceof y)) throw a;
        w(1, 0);
      }
    }
    function xt(e, r, t, n, o, a, s) {
      var c = k();
      try {
        F(e)(r, t, n, o, a, s);
      } catch (l) {
        if (S(c), !(l instanceof y)) throw l;
        w(1, 0);
      }
    }
    function Lt(e, r, t, n, o, a, s, c) {
      var l = k();
      try {
        F(e)(r, t, n, o, a, s, c);
      } catch (f) {
        if (S(l), !(f instanceof y)) throw f;
        w(1, 0);
      }
    }
    function Ut(e, r, t) {
      var n = k();
      try {
        return F(e)(r, t);
      } catch (o) {
        if (S(n), !(o instanceof y)) throw o;
        w(1, 0);
      }
    }
    function Bt(e, r, t, n, o, a) {
      var s = k();
      try {
        return F(e)(r, t, n, o, a);
      } catch (c) {
        if (S(s), !(c instanceof y)) throw c;
        w(1, 0);
      }
    }
    function zt(e, r, t, n, o, a) {
      var s = k();
      try {
        return F(e)(r, t, n, o, a);
      } catch (c) {
        if (S(s), !(c instanceof y)) throw c;
        w(1, 0);
      }
    }
    function Ht(e, r, t, n, o, a, s, c) {
      var l = k();
      try {
        F(e)(r, t, n, o, a, s, c);
      } catch (f) {
        if (S(l), !(f instanceof y)) throw f;
        w(1, 0);
      }
    }
    function Wt(e, r, t, n, o, a, s, c, l, f, v, h, m, _) {
      var T = k();
      try {
        F(e)(r, t, n, o, a, s, c, l, f, v, h, m, _);
      } catch (D) {
        if (S(T), !(D instanceof y)) throw D;
        w(1, 0);
      }
    }
    function jt(e, r, t, n, o, a, s, c, l, f, v, h, m) {
      var _ = k();
      try {
        F(e)(r, t, n, o, a, s, c, l, f, v, h, m);
      } catch (T) {
        if (S(_), !(T instanceof y)) throw T;
        w(1, 0);
      }
    }
    function $t(e, r) {
      var t = k();
      try {
        F(e)(r);
      } catch (n) {
        if (S(t), !(n instanceof y)) throw n;
        w(1, 0);
      }
    }
    function Gt(e, r, t, n) {
      var o = k();
      try {
        F(e)(r, t, n);
      } catch (a) {
        if (S(o), !(a instanceof y)) throw a;
        w(1, 0);
      }
    }
    function Vt(e, r, t, n, o, a, s) {
      var c = k();
      try {
        return F(e)(r, t, n, o, a, s);
      } catch (l) {
        if (S(c), !(l instanceof y)) throw l;
        w(1, 0);
      }
    }
    function Yt(e, r, t, n, o) {
      var a = k();
      try {
        F(e)(r, t, n, o);
      } catch (s) {
        if (S(a), !(s instanceof y)) throw s;
        w(1, 0);
      }
    }
    function Xt(e, r, t, n, o) {
      var a = k();
      try {
        F(e)(r, t, n, o);
      } catch (s) {
        if (S(a), !(s instanceof y)) throw s;
        w(1, 0);
      }
    }
    function qt(e, r, t, n, o, a) {
      var s = k();
      try {
        return F(e)(r, t, n, o, a);
      } catch (c) {
        if (S(s), !(c instanceof y)) throw c;
        w(1, 0);
      }
    }
    function Kt(e, r, t, n, o, a, s, c) {
      var l = k();
      try {
        return F(e)(r, t, n, o, a, s, c);
      } catch (f) {
        if (S(l), !(f instanceof y)) throw f;
        w(1, 0);
      }
    }
    function Zt(e, r, t, n, o, a, s, c, l, f, v) {
      var h = k();
      try {
        return F(e)(r, t, n, o, a, s, c, l, f, v);
      } catch (m) {
        if (S(h), !(m instanceof y)) throw m;
        w(1, 0);
      }
    }
    function Jt(e, r, t, n, o) {
      var a = k();
      try {
        return F(e)(r, t, n, o);
      } catch (s) {
        if (S(a), !(s instanceof y)) throw s;
        w(1, 0);
      }
    }
    function Qt(e, r, t, n, o) {
      var a = k();
      try {
        return F(e)(r, t, n, o);
      } catch (s) {
        if (S(a), !(s instanceof y)) throw s;
        return w(1, 0), 0n;
      }
    }
    function en(e, r, t, n, o, a, s, c, l, f, v, h, m) {
      var _ = k();
      try {
        return F(e)(r, t, n, o, a, s, c, l, f, v, h, m);
      } catch (T) {
        if (S(_), !(T instanceof y)) throw T;
        w(1, 0);
      }
    }
    function rn(e, r, t, n) {
      var o = k();
      try {
        return F(e)(r, t, n);
      } catch (a) {
        if (S(o), !(a instanceof y)) throw a;
        w(1, 0);
      }
    }
    function tn(e, r, t, n) {
      var o = k();
      try {
        return F(e)(r, t, n);
      } catch (a) {
        if (S(o), !(a instanceof y)) throw a;
        w(1, 0);
      }
    }
    function nn(e) {
      var r = k();
      try {
        return F(e)();
      } catch (t) {
        if (S(r), !(t instanceof y)) throw t;
        w(1, 0);
      }
    }
    function on(e, r, t, n, o, a, s, c, l, f, v, h) {
      var m = k();
      try {
        return F(e)(r, t, n, o, a, s, c, l, f, v, h);
      } catch (_) {
        if (S(m), !(_ instanceof y)) throw _;
        w(1, 0);
      }
    }
    function an(e, r, t, n, o, a, s, c, l, f, v) {
      var h = k();
      try {
        F(e)(r, t, n, o, a, s, c, l, f, v);
      } catch (m) {
        if (S(h), !(m instanceof y)) throw m;
        w(1, 0);
      }
    }
    function sn(e, r, t, n, o, a, s, c, l, f, v, h, m, _, T, D) {
      var L = k();
      try {
        F(e)(r, t, n, o, a, s, c, l, f, v, h, m, _, T, D);
      } catch (C) {
        if (S(L), !(C instanceof y)) throw C;
        w(1, 0);
      }
    }
    var Cr;
    function cn() {
      br(), Pe();
    }
    function lr() {
      if (he > 0) {
        je = lr;
        return;
      }
      if (cn(), De(), he > 0) {
        je = lr;
        return;
      }
      function e() {
        var _a2;
        u(!Cr), Cr = true, d.calledRun = true, !ce && (Ce(), Oe == null ? void 0 : Oe(d), (_a2 = d.onRuntimeInitialized) == null ? void 0 : _a2.call(d), J("onRuntimeInitialized"), u(!d._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'), Qe());
      }
      d.setStatus ? (d.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => d.setStatus(""), 1), e();
      }, 1)) : e(), le();
    }
    var Fe;
    Fe = await Ye(), lr(), q ? V = d : V = new Promise((e, r) => {
      Oe = e, ge = r;
    });
    for (const e of Object.keys(d)) e in G || Object.defineProperty(G, e, {
      configurable: true,
      get() {
        b(`Access to module property ('${e}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
      }
    });
    return V;
  }
  let dr = null;
  async function un() {
    return dr || (dr = await dn()), dr;
  }
  function re(G, V, d, U) {
    const z = new V(G), p = U._malloc(z.length * z.BYTES_PER_ELEMENT);
    return d.set(z, p / z.BYTES_PER_ELEMENT), p;
  }
  mn = async function(G, V, d, U, z) {
    if (G.length === 0) return {
      frequencies: /* @__PURE__ */ new Map(),
      periods: /* @__PURE__ */ new Map(),
      modeShapes: /* @__PURE__ */ new Map(),
      massParticipation: /* @__PURE__ */ new Map(),
      sumParticipation: {
        SumUX: 0,
        SumUY: 0,
        SumUZ: 0,
        SumRX: 0,
        SumRY: 0,
        SumRZ: 0
      }
    };
    const p = await un(), M = [], te = G.length, be = z.numModes || 12, ne = te * 6, ie = re(G.flat(), Float64Array, p.HEAPF64, p);
    M.push(ie);
    const Ve = V.flat(), oe = re(Ve, Uint32Array, p.HEAPU32, p);
    M.push(oe);
    const ae = V.map((P) => P.length), pe = re(ae, Uint32Array, p.HEAPU32, p);
    M.push(pe);
    const se = d.supports ? Array.from(d.supports.keys()) : [], N = d.supports ? Array.from(d.supports.values()).flat().map((P) => P ? 1 : 0) : [], Z = re(se, Uint32Array, p.HEAPU32, p);
    M.push(Z);
    const ce = re(N, Uint8Array, p.HEAPU8, p);
    M.push(ce);
    const u = (P) => {
      const ue = P ? Array.from(P.keys()) : [], ye = P ? Array.from(P.values()) : [], fe = re(ue, Uint32Array, p.HEAPU32, p);
      M.push(fe);
      const me = re(ye, Float64Array, p.HEAPF64, p);
      return M.push(me), {
        keysPtr: fe,
        valuesPtr: me,
        size: ue.length
      };
    }, Y = u(U.elasticities), Pe = u(U.areas), le = u(U.momentsOfInertiaZ), y = u(U.momentsOfInertiaY), de = u(U.shearModuli), J = u(U.torsionalConstants), R = u(U.thicknesses), Ae = u(U.poissonsRatios), Re = u(U.elasticitiesOrthogonal), Me = u(z.densities), Ne = z.rigidDiaphragmLevels || [], Oe = re(Ne, Float64Array, p.HEAPF64, p);
    M.push(Oe);
    const ge = p._malloc(4);
    M.push(ge);
    const x = p._malloc(4);
    M.push(x);
    const X = p._malloc(4);
    M.push(X);
    const Q = p._malloc(4);
    M.push(Q);
    const g = p._malloc(4);
    M.push(g), p._modal(ie, te, oe, Ve.length, pe, V.length, Z, ce, se.length, Y.keysPtr, Y.valuesPtr, Y.size, Pe.keysPtr, Pe.valuesPtr, Pe.size, le.keysPtr, le.valuesPtr, le.size, y.keysPtr, y.valuesPtr, y.size, de.keysPtr, de.valuesPtr, de.size, J.keysPtr, J.valuesPtr, J.size, R.keysPtr, R.valuesPtr, R.size, Ae.keysPtr, Ae.valuesPtr, Ae.size, Re.keysPtr, Re.valuesPtr, Re.size, Me.keysPtr, Me.valuesPtr, Me.size, Oe, Ne.length, be, ge, x, X, Q, g);
    const O = p.HEAPU32[g / 4], q = p.HEAPU32[ge / 4], Ee = p.HEAPU32[x / 4], De = p.HEAPU32[X / 4], Ce = p.HEAPU32[Q / 4], Qe = new Float64Array(p.HEAPF64.buffer, q, O), b = new Float64Array(p.HEAPF64.buffer, Ee, O), B = new Float64Array(p.HEAPF64.buffer, De, O * ne), j = new Float64Array(p.HEAPF64.buffer, Ce, O * 6), H = {
      frequencies: /* @__PURE__ */ new Map(),
      periods: /* @__PURE__ */ new Map(),
      modeShapes: /* @__PURE__ */ new Map(),
      massParticipation: /* @__PURE__ */ new Map(),
      sumParticipation: {
        SumUX: 0,
        SumUY: 0,
        SumUZ: 0,
        SumRX: 0,
        SumRY: 0,
        SumRZ: 0
      }
    };
    for (let P = 0; P < O; P++) {
      H.frequencies.set(P + 1, Qe[P]), H.periods.set(P + 1, b[P]);
      const ue = [];
      for (let Le = 0; Le < ne; Le++) ue.push(B[P * ne + Le]);
      H.modeShapes.set(P + 1, ue);
      const ye = j[P * 6 + 0], fe = j[P * 6 + 1], me = j[P * 6 + 2], Ye = j[P * 6 + 3], Ie = j[P * 6 + 4], xe = j[P * 6 + 5];
      H.massParticipation.set(P + 1, {
        UX: ye,
        UY: fe,
        UZ: me,
        RX: Ye,
        RY: Ie,
        RZ: xe
      }), H.sumParticipation.SumUX += ye, H.sumParticipation.SumUY += fe, H.sumParticipation.SumUZ += me, H.sumParticipation.SumRX += Ye, H.sumParticipation.SumRY += Ie, H.sumParticipation.SumRZ += xe;
    }
    return q && M.push(q), Ee && M.push(Ee), De && M.push(De), Ce && M.push(Ce), M.forEach((P) => p._free(P)), H;
  };
});
export {
  __tla,
  mn as m
};
