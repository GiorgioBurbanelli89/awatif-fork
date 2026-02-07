var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
let ln, fn;
let __tla = (async () => {
  let sn, cn, Nr;
  sn = "modulepreload";
  cn = function(Y, W) {
    return new URL(Y, W).href;
  };
  Nr = {};
  ln = function(W, d, M) {
    let P = Promise.resolve();
    if (d && d.length > 0) {
      const $ = document.getElementsByTagName("link"), C = document.querySelector("meta[property=csp-nonce]"), ne = (C == null ? void 0 : C.nonce) || (C == null ? void 0 : C.getAttribute("nonce"));
      P = Promise.allSettled(d.map((U) => {
        if (U = cn(U, M), U in Nr) return;
        Nr[U] = true;
        const G = U.endsWith(".css"), ke = G ? '[rel="stylesheet"]' : "";
        if (!!M) for (let K = $.length - 1; K >= 0; K--) {
          const q = $[K];
          if (q.href === U && (!G || q.rel === "stylesheet")) return;
        }
        else if (document.querySelector(`link[href="${U}"]${ke}`)) return;
        const I = document.createElement("link");
        if (I.rel = G ? "stylesheet" : sn, G || (I.as = "script"), I.crossOrigin = "", I.href = U, ne && I.setAttribute("nonce", ne), document.head.appendChild(I), G) return new Promise((K, q) => {
          I.addEventListener("load", K), I.addEventListener("error", () => q(new Error(`Unable to preload CSS for ${U}`)));
        });
      }));
    }
    function j($) {
      const C = new Event("vite:preloadError", {
        cancelable: true
      });
      if (C.payload = $, window.dispatchEvent(C), !C.defaultPrevented) throw $;
    }
    return P.then(($) => {
      for (const C of $ || []) C.status === "rejected" && j(C.reason);
      return W().catch(j);
    });
  };
  async function dn(Y = {}) {
    var _a, _b, _c, _d, _e2, _f;
    var W;
    (function() {
      var _a2;
      function e(l) {
        l = l.split("-")[0];
        for (var u = l.split(".").slice(0, 3); u.length < 3; ) u.push("00");
        return u = u.map((v, h, m) => v.padStart(2, "0")), u.join("");
      }
      var r = (l) => [
        l / 1e4 | 0,
        (l / 100 | 0) % 100,
        l % 100
      ].join("."), t = 2147483647, n = typeof process < "u" && ((_a2 = process.versions) == null ? void 0 : _a2.node) ? e(process.versions.node) : t;
      if (n < 16e4) throw new Error(`This emscripten-generated code requires node v${r(16e4)} (detected v${r(n)})`);
      var i = typeof navigator < "u" && navigator.userAgent;
      if (i) {
        var a = i.includes("Safari/") && !i.includes("Chrome/") && i.match(/Version\/(\d+\.?\d*\.?\d*)/) ? e(i.match(/Version\/(\d+\.?\d*\.?\d*)/)[1]) : t;
        if (a < 15e4) throw new Error(`This emscripten-generated code requires Safari v${r(15e4)} (detected v${a})`);
        var s = i.match(/Firefox\/(\d+(?:\.\d+)?)/) ? parseFloat(i.match(/Firefox\/(\d+(?:\.\d+)?)/)[1]) : t;
        if (s < 79) throw new Error(`This emscripten-generated code requires Firefox v79 (detected v${s})`);
        var c = i.match(/Chrome\/(\d+(?:\.\d+)?)/) ? parseFloat(i.match(/Chrome\/(\d+(?:\.\d+)?)/)[1]) : t;
        if (c < 85) throw new Error(`This emscripten-generated code requires Chrome v85 (detected v${c})`);
      }
    })();
    var d = Y, M = !!globalThis.window, P = !!globalThis.WorkerGlobalScope, j = ((_b = (_a = globalThis.process) == null ? void 0 : _a.versions) == null ? void 0 : _b.node) && ((_c = globalThis.process) == null ? void 0 : _c.type) != "renderer", $ = !M && !j && !P;
    if (j) {
      const { createRequire: e } = await ln(() => import("./__vite-browser-external-D7Ct-6yo.js").then((r) => r._), [], import.meta.url);
      var C = e(import.meta.url);
    }
    var ne = "./this.program", U = import.meta.url, G = "";
    function ke(e) {
      return d.locateFile ? d.locateFile(e, G) : G + e;
    }
    var oe, I;
    if (j) {
      if (!(((_e2 = (_d = globalThis.process) == null ? void 0 : _d.versions) == null ? void 0 : _e2.node) && ((_f = globalThis.process) == null ? void 0 : _f.type) != "renderer")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      var K = C("fs");
      U.startsWith("file:") && (G = C("path").dirname(C("url").fileURLToPath(U)) + "/"), I = (r) => {
        r = ae(r) ? new URL(r) : r;
        var t = K.readFileSync(r);
        return f(Buffer.isBuffer(t)), t;
      }, oe = async (r, t = true) => {
        r = ae(r) ? new URL(r) : r;
        var n = K.readFileSync(r, t ? void 0 : "utf8");
        return f(t ? Buffer.isBuffer(n) : typeof n == "string"), n;
      }, process.argv.length > 1 && (ne = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2);
    } else if (!$) if (M || P) {
      try {
        G = new URL(".", U).href;
      } catch {
      }
      if (!(globalThis.window || globalThis.WorkerGlobalScope)) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      P && (I = (e) => {
        var r = new XMLHttpRequest();
        return r.open("GET", e, false), r.responseType = "arraybuffer", r.send(null), new Uint8Array(r.response);
      }), oe = async (e) => {
        if (ae(e)) return new Promise((t, n) => {
          var i = new XMLHttpRequest();
          i.open("GET", e, true), i.responseType = "arraybuffer", i.onload = () => {
            if (i.status == 200 || i.status == 0 && i.response) {
              t(i.response);
              return;
            }
            n(i.status);
          }, i.onerror = n, i.send(null);
        });
        var r = await fetch(e, {
          credentials: "same-origin"
        });
        if (r.ok) return r.arrayBuffer();
        throw new Error(r.status + " : " + r.url);
      };
    } else throw new Error("environment detection error");
    var q = console.log.bind(console), D = console.error.bind(console);
    f(!$, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
    var ie;
    globalThis.WebAssembly || D("no native wasm support detected");
    var de = false;
    function f(e, r) {
      e || k("Assertion failed" + (r ? ": " + r : ""));
    }
    var ae = (e) => e.startsWith("file://");
    function xe() {
      var e = er();
      f((e & 3) == 0), e == 0 && (e += 4), p[e >> 2] = 34821223, p[e + 4 >> 2] = 2310721022, p[0] = 1668509029;
    }
    function V() {
      if (!de) {
        var e = er();
        e == 0 && (e += 4);
        var r = p[e >> 2], t = p[e + 4 >> 2];
        (r != 34821223 || t != 2310721022) && k(`Stack overflow! Stack cookie has been overwritten at ${Ae(e)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${Ae(t)} ${Ae(r)}`), p[0] != 1668509029 && k("Runtime error: The application has corrupted its heap memory area (address zero)!");
      }
    }
    class E extends Error {
    }
    class fe extends E {
      constructor(r) {
        super(r), this.excPtr = r;
        const t = pr(r);
        this.name = t[0], this.message = t[1];
      }
    }
    (() => {
      var e = new Int16Array(1), r = new Int8Array(e.buffer);
      e[0] = 25459, (r[0] !== 115 || r[1] !== 99) && k("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
    })();
    function se(e) {
      Object.getOwnPropertyDescriptor(d, e) || Object.defineProperty(d, e, {
        configurable: true,
        set() {
          k(`Attempt to set \`Module.${e}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`);
        }
      });
    }
    function N(e) {
      return () => f(false, `call to '${e}' via reference taken before Wasm module initialization`);
    }
    function Fe(e) {
      Object.getOwnPropertyDescriptor(d, e) && k(`\`Module.${e}\` was supplied but \`${e}\` not included in INCOMING_MODULE_JS_API`);
    }
    function Te(e) {
      return e === "FS_createPath" || e === "FS_createDataFile" || e === "FS_createPreloadedFile" || e === "FS_preloadFile" || e === "FS_unlink" || e === "addRunDependency" || e === "FS_createLazyFile" || e === "FS_createDevice" || e === "removeRunDependency";
    }
    function be(e) {
      ve(e);
    }
    function ve(e) {
      Object.getOwnPropertyDescriptor(d, e) || Object.defineProperty(d, e, {
        configurable: true,
        get() {
          var r = `'${e}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
          Te(e) && (r += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), k(r);
        }
      });
    }
    var he, pe, B, ee, ce, p, z, re = false;
    function Pe() {
      var e = Ve.buffer;
      B = new Int8Array(e), d.HEAPU8 = ee = new Uint8Array(e), ce = new Int32Array(e), d.HEAPU32 = p = new Uint32Array(e), d.HEAPF64 = new Float64Array(e), z = new BigInt64Array(e), new BigUint64Array(e);
    }
    f(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");
    function Le() {
      if (d.preRun) for (typeof d.preRun == "function" && (d.preRun = [
        d.preRun
      ]); d.preRun.length; ) xr(d.preRun.shift());
      se("preRun"), or(ar);
    }
    function Ue() {
      f(!re), re = true, V(), !d.noFSInit && !o.initialized && o.init(), we.__wasm_call_ctors(), o.ignorePermissions = false;
    }
    function Be() {
      if (V(), d.postRun) for (typeof d.postRun == "function" && (d.postRun = [
        d.postRun
      ]); d.postRun.length; ) Ir(d.postRun.shift());
      se("postRun"), or(ir);
    }
    function k(e) {
      var _a2;
      (_a2 = d.onAbort) == null ? void 0 : _a2.call(d, e), e = "Aborted(" + e + ")", D(e), de = true;
      var r = new WebAssembly.RuntimeError(e);
      throw pe == null ? void 0 : pe(r), r;
    }
    function y(e, r) {
      return (...t) => {
        f(re, `native function \`${e}\` called before runtime initialization`);
        var n = we[e];
        return f(n, `exported native function \`${e}\` not found`), f(t.length <= r, `native function \`${e}\` called with ${t.length} args but expects ${r}`), n(...t);
      };
    }
    var Z;
    function Ye() {
      return d.locateFile ? ke("deform.wasm") : new URL("" + new URL("deform-C3cAlM0-.wasm", import.meta.url).href, import.meta.url).href;
    }
    function ze(e) {
      if (e == Z && ie) return new Uint8Array(ie);
      if (I) return I(e);
      throw "both async and sync fetching of the wasm failed";
    }
    async function He(e) {
      if (!ie) try {
        var r = await oe(e);
        return new Uint8Array(r);
      } catch {
      }
      return ze(e);
    }
    async function Dr(e, r) {
      try {
        var t = await He(e), n = await WebAssembly.instantiate(t, r);
        return n;
      } catch (i) {
        D(`failed to asynchronously prepare wasm: ${i}`), ae(e) && D(`warning: Loading from a file URI (${e}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`), k(i);
      }
    }
    async function Mr(e, r, t) {
      if (!e && !ae(r) && !j) try {
        var n = fetch(r, {
          credentials: "same-origin"
        }), i = await WebAssembly.instantiateStreaming(n, t);
        return i;
      } catch (a) {
        D(`wasm streaming compile failed: ${a}`), D("falling back to ArrayBuffer instantiation");
      }
      return Dr(r, t);
    }
    function Or() {
      var e = {
        env: Ar,
        wasi_snapshot_preview1: Ar
      };
      return e;
    }
    async function Cr() {
      function e(s, c) {
        return we = s.exports, At(we), Pe(), we;
      }
      var r = d;
      function t(s) {
        return f(d === r, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"), r = null, e(s.instance);
      }
      var n = Or();
      if (d.instantiateWasm) return new Promise((s, c) => {
        try {
          d.instantiateWasm(n, (l, u) => {
            s(e(l, u));
          });
        } catch (l) {
          D(`Module.instantiateWasm callback failed with error: ${l}`), c(l);
        }
      });
      Z ?? (Z = Ye());
      var i = await Mr(ie, Z, n), a = t(i);
      return a;
    }
    var or = (e) => {
      for (; e.length > 0; ) e.shift()(d);
    }, ir = [], Ir = (e) => ir.push(e), ar = [], xr = (e) => ar.push(e), Ae = (e) => (f(typeof e == "number", `ptrToString expects a number, got ${typeof e}`), e >>>= 0, "0x" + e.toString(16).padStart(8, "0")), F = (e) => Sr(e), T = () => Fr(), Re = (e) => {
      Re.shown || (Re.shown = {}), Re.shown[e] || (Re.shown[e] = 1, j && (e = "warning: " + e), D(e));
    }, sr = globalThis.TextDecoder && new TextDecoder(), Lr = (e, r, t, n) => {
      for (var i = r + t; e[r] && !(r >= i); ) ++r;
      return r;
    }, ge = (e, r = 0, t, n) => {
      var i = Lr(e, r, t);
      if (i - r > 16 && e.buffer && sr) return sr.decode(e.subarray(r, i));
      for (var a = ""; r < i; ) {
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
        if ((s & 240) == 224 ? s = (s & 15) << 12 | c << 6 | l : ((s & 248) != 240 && Re("Invalid UTF-8 leading byte " + Ae(s) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), s = (s & 7) << 18 | c << 12 | l << 6 | e[r++] & 63), s < 65536) a += String.fromCharCode(s);
        else {
          var u = s - 65536;
          a += String.fromCharCode(55296 | u >> 10, 56320 | u & 1023);
        }
      }
      return a;
    }, ue = (e, r, t) => (f(typeof e == "number", `UTF8ToString expects a number (got ${typeof e})`), e ? ge(ee, e, r) : ""), Ur = (e, r, t, n) => k(`Assertion failed: ${ue(e)}, at: ` + [
      r ? ue(r) : "unknown filename",
      t,
      n ? ue(n) : "unknown function"
    ]), Ne = [], We = 0, Br = (e) => {
      var r = new Ke(e);
      return r.get_caught() || (r.set_caught(true), We--), r.set_rethrown(false), Ne.push(r), Pr(e);
    }, te = 0, zr = () => {
      w(0, 0), f(Ne.length > 0);
      var e = Ne.pop();
      rr(e.excPtr), te = 0;
    };
    class Ke {
      constructor(r) {
        this.excPtr = r, this.ptr = r - 24;
      }
      set_type(r) {
        p[this.ptr + 4 >> 2] = r;
      }
      get_type() {
        return p[this.ptr + 4 >> 2];
      }
      set_destructor(r) {
        p[this.ptr + 8 >> 2] = r;
      }
      get_destructor() {
        return p[this.ptr + 8 >> 2];
      }
      set_caught(r) {
        r = r ? 1 : 0, B[this.ptr + 12] = r;
      }
      get_caught() {
        return B[this.ptr + 12] != 0;
      }
      set_rethrown(r) {
        r = r ? 1 : 0, B[this.ptr + 13] = r;
      }
      get_rethrown() {
        return B[this.ptr + 13] != 0;
      }
      init(r, t) {
        this.set_adjusted_ptr(0), this.set_type(r), this.set_destructor(t);
      }
      set_adjusted_ptr(r) {
        p[this.ptr + 16 >> 2] = r;
      }
      get_adjusted_ptr() {
        return p[this.ptr + 16 >> 2];
      }
    }
    var je = (e) => yr(e), cr = (e) => {
      var r = te == null ? void 0 : te.excPtr;
      if (!r) return je(0), 0;
      var t = new Ke(r);
      t.set_adjusted_ptr(r);
      var n = t.get_type();
      if (!n) return je(0), r;
      for (var i of e) {
        if (i === 0 || i === n) break;
        var a = t.ptr + 16;
        if (br(i, n, a)) return je(i), r;
      }
      return je(n), r;
    }, Hr = () => cr([]), Wr = (e) => cr([
      e
    ]), jr = () => {
      var e = Ne.pop();
      e || k("no exception to throw");
      var r = e.excPtr;
      throw e.get_rethrown() || (Ne.push(e), e.set_rethrown(true), e.set_caught(false), We++), Ge(r), te = new fe(r), te;
    }, $r = (e, r, t) => {
      var n = new Ke(e);
      throw n.init(r, t), Ge(e), te = new fe(e), We++, te;
    }, Gr = () => We, Vr = (e) => {
      throw te || (te = new fe(e)), te;
    }, Yr = () => k("native code called abort()"), lr = (e, r, t, n) => {
      if (f(typeof e == "string", `stringToUTF8Array expects a string (got ${typeof e})`), !(n > 0)) return 0;
      for (var i = t, a = t + n - 1, s = 0; s < e.length; ++s) {
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
          c > 1114111 && Re("Invalid Unicode code point " + Ae(c) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."), r[t++] = 240 | c >> 18, r[t++] = 128 | c >> 12 & 63, r[t++] = 128 | c >> 6 & 63, r[t++] = 128 | c & 63, s++;
        }
      }
      return r[t] = 0, t - i;
    }, De = (e, r, t) => (f(typeof t == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), lr(e, ee, r, t)), $e = (e) => {
      for (var r = 0, t = 0; t < e.length; ++t) {
        var n = e.charCodeAt(t);
        n <= 127 ? r++ : n <= 2047 ? r += 2 : n >= 55296 && n <= 57343 ? (r += 4, ++t) : r += 3;
      }
      return r;
    }, Kr = (e, r, t, n) => {
      var i = (/* @__PURE__ */ new Date()).getFullYear(), a = new Date(i, 0, 1), s = new Date(i, 6, 1), c = a.getTimezoneOffset(), l = s.getTimezoneOffset(), u = Math.max(c, l);
      p[e >> 2] = u * 60, ce[r >> 2] = +(c != l);
      var v = (_) => {
        var S = _ >= 0 ? "-" : "+", O = Math.abs(_), H = String(Math.floor(O / 60)).padStart(2, "0"), x = String(O % 60).padStart(2, "0");
        return `UTC${S}${H}${x}`;
      }, h = v(c), m = v(l);
      f(h), f(m), f($e(h) <= 16, `timezone name truncated to fit in TZNAME_MAX (${h})`), f($e(m) <= 16, `timezone name truncated to fit in TZNAME_MAX (${m})`), l < c ? (De(h, t, 17), De(m, n, 17)) : (De(h, n, 17), De(m, t, 17));
    }, qr = () => 2147483648, Xr = (e, r) => (f(r, "alignment argument is required"), Math.ceil(e / r) * r), Jr = (e) => {
      var r = Ve.buffer.byteLength, t = (e - r + 65535) / 65536 | 0;
      try {
        return Ve.grow(t), Pe(), 1;
      } catch (n) {
        D(`growMemory: Attempted to grow heap from ${r} bytes to ${e} bytes, but got error: ${n}`);
      }
    }, Zr = (e) => {
      var r = ee.length;
      e >>>= 0, f(e > r);
      var t = qr();
      if (e > t) return D(`Cannot enlarge memory, requested ${e} bytes, but the limit is ${t} bytes!`), false;
      for (var n = 1; n <= 4; n *= 2) {
        var i = r * (1 + 0.2 / n);
        i = Math.min(i, e + 100663296);
        var a = Math.min(t, Xr(Math.max(e, i), 65536)), s = Jr(a);
        if (s) return true;
      }
      return D(`Failed to grow the heap from ${r} bytes to ${a} bytes, not enough memory!`), false;
    }, qe = {}, Qr = () => ne || "./this.program", Me = () => {
      var _a2;
      if (!Me.strings) {
        var e = (((_a2 = globalThis.navigator) == null ? void 0 : _a2.language) ?? "C").replace("-", "_") + ".UTF-8", r = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: e,
          _: Qr()
        };
        for (var t in qe) qe[t] === void 0 ? delete r[t] : r[t] = qe[t];
        var n = [];
        for (var t in r) n.push(`${t}=${r[t]}`);
        Me.strings = n;
      }
      return Me.strings;
    }, et = (e, r) => {
      var t = 0, n = 0;
      for (var i of Me()) {
        var a = r + t;
        p[e + n >> 2] = a, t += De(i, a, 1 / 0) + 1, n += 4;
      }
      return 0;
    }, rt = (e, r) => {
      var t = Me();
      p[e >> 2] = t.length;
      var n = 0;
      for (var i of t) n += $e(i) + 1;
      return p[r >> 2] = n, 0;
    }, A = {
      isAbs: (e) => e.charAt(0) === "/",
      splitPath: (e) => {
        var r = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return r.exec(e).slice(1);
      },
      normalizeArray: (e, r) => {
        for (var t = 0, n = e.length - 1; n >= 0; n--) {
          var i = e[n];
          i === "." ? e.splice(n, 1) : i === ".." ? (e.splice(n, 1), t++) : t && (e.splice(n, 1), t--);
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
    }, tt = () => {
      if (j) {
        var e = C("crypto");
        return (r) => e.randomFillSync(r);
      }
      return (r) => crypto.getRandomValues(r);
    }, dr = (e) => {
      (dr = tt())(e);
    }, Ee = {
      resolve: (...e) => {
        for (var r = "", t = false, n = e.length - 1; n >= -1 && !t; n--) {
          var i = n >= 0 ? e[n] : o.cwd();
          if (typeof i != "string") throw new TypeError("Arguments to path.resolve must be strings");
          if (!i) return "";
          r = i + "/" + r, t = A.isAbs(i);
        }
        return r = A.normalizeArray(r.split("/").filter((a) => !!a), !t).join("/"), (t ? "/" : "") + r || ".";
      },
      relative: (e, r) => {
        e = Ee.resolve(e).slice(1), r = Ee.resolve(r).slice(1);
        function t(u) {
          for (var v = 0; v < u.length && u[v] === ""; v++) ;
          for (var h = u.length - 1; h >= 0 && u[h] === ""; h--) ;
          return v > h ? [] : u.slice(v, h - v + 1);
        }
        for (var n = t(e.split("/")), i = t(r.split("/")), a = Math.min(n.length, i.length), s = a, c = 0; c < a; c++) if (n[c] !== i[c]) {
          s = c;
          break;
        }
        for (var l = [], c = s; c < n.length; c++) l.push("..");
        return l = l.concat(i.slice(s)), l.join("/");
      }
    }, Xe = [], Je = (e, r, t) => {
      var n = $e(e) + 1, i = new Array(n), a = lr(e, i, 0, i.length);
      return i.length = a, i;
    }, nt = () => {
      var _a2;
      if (!Xe.length) {
        var e = null;
        if (j) {
          var r = 256, t = Buffer.alloc(r), n = 0, i = process.stdin.fd;
          try {
            n = K.readSync(i, t, 0, r);
          } catch (a) {
            if (a.toString().includes("EOF")) n = 0;
            else throw a;
          }
          n > 0 && (e = t.slice(0, n).toString("utf-8"));
        } else ((_a2 = globalThis.window) == null ? void 0 : _a2.prompt) && (e = window.prompt("Input: "), e !== null && (e += `
`));
        if (!e) return null;
        Xe = Je(e);
      }
      return Xe.shift();
    }, me = {
      ttys: [],
      init() {
      },
      shutdown() {
      },
      register(e, r) {
        me.ttys[e] = {
          input: [],
          output: [],
          ops: r
        }, o.registerDevice(e, me.stream_ops);
      },
      stream_ops: {
        open(e) {
          var r = me.ttys[e.node.rdev];
          if (!r) throw new o.ErrnoError(43);
          e.tty = r, e.seekable = false;
        },
        close(e) {
          e.tty.ops.fsync(e.tty);
        },
        fsync(e) {
          e.tty.ops.fsync(e.tty);
        },
        read(e, r, t, n, i) {
          if (!e.tty || !e.tty.ops.get_char) throw new o.ErrnoError(60);
          for (var a = 0, s = 0; s < n; s++) {
            var c;
            try {
              c = e.tty.ops.get_char(e.tty);
            } catch {
              throw new o.ErrnoError(29);
            }
            if (c === void 0 && a === 0) throw new o.ErrnoError(6);
            if (c == null) break;
            a++, r[t + s] = c;
          }
          return a && (e.node.atime = Date.now()), a;
        },
        write(e, r, t, n, i) {
          if (!e.tty || !e.tty.ops.put_char) throw new o.ErrnoError(60);
          try {
            for (var a = 0; a < n; a++) e.tty.ops.put_char(e.tty, r[t + a]);
          } catch {
            throw new o.ErrnoError(29);
          }
          return n && (e.node.mtime = e.node.ctime = Date.now()), a;
        }
      },
      default_tty_ops: {
        get_char(e) {
          return nt();
        },
        put_char(e, r) {
          r === null || r === 10 ? (q(ge(e.output)), e.output = []) : r != 0 && e.output.push(r);
        },
        fsync(e) {
          var _a2;
          ((_a2 = e.output) == null ? void 0 : _a2.length) > 0 && (q(ge(e.output)), e.output = []);
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
          r === null || r === 10 ? (D(ge(e.output)), e.output = []) : r != 0 && e.output.push(r);
        },
        fsync(e) {
          var _a2;
          ((_a2 = e.output) == null ? void 0 : _a2.length) > 0 && (D(ge(e.output)), e.output = []);
        }
      }
    }, fr = (e) => {
      k("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
    }, g = {
      ops_table: null,
      mount(e) {
        return g.createNode(null, "/", 16895, 0);
      },
      createNode(e, r, t, n) {
        if (o.isBlkdev(t) || o.isFIFO(t)) throw new o.ErrnoError(63);
        g.ops_table || (g.ops_table = {
          dir: {
            node: {
              getattr: g.node_ops.getattr,
              setattr: g.node_ops.setattr,
              lookup: g.node_ops.lookup,
              mknod: g.node_ops.mknod,
              rename: g.node_ops.rename,
              unlink: g.node_ops.unlink,
              rmdir: g.node_ops.rmdir,
              readdir: g.node_ops.readdir,
              symlink: g.node_ops.symlink
            },
            stream: {
              llseek: g.stream_ops.llseek
            }
          },
          file: {
            node: {
              getattr: g.node_ops.getattr,
              setattr: g.node_ops.setattr
            },
            stream: {
              llseek: g.stream_ops.llseek,
              read: g.stream_ops.read,
              write: g.stream_ops.write,
              mmap: g.stream_ops.mmap,
              msync: g.stream_ops.msync
            }
          },
          link: {
            node: {
              getattr: g.node_ops.getattr,
              setattr: g.node_ops.setattr,
              readlink: g.node_ops.readlink
            },
            stream: {}
          },
          chrdev: {
            node: {
              getattr: g.node_ops.getattr,
              setattr: g.node_ops.setattr
            },
            stream: o.chrdev_stream_ops
          }
        });
        var i = o.createNode(e, r, t, n);
        return o.isDir(i.mode) ? (i.node_ops = g.ops_table.dir.node, i.stream_ops = g.ops_table.dir.stream, i.contents = {}) : o.isFile(i.mode) ? (i.node_ops = g.ops_table.file.node, i.stream_ops = g.ops_table.file.stream, i.usedBytes = 0, i.contents = null) : o.isLink(i.mode) ? (i.node_ops = g.ops_table.link.node, i.stream_ops = g.ops_table.link.stream) : o.isChrdev(i.mode) && (i.node_ops = g.ops_table.chrdev.node, i.stream_ops = g.ops_table.chrdev.stream), i.atime = i.mtime = i.ctime = Date.now(), e && (e.contents[r] = i, e.atime = e.mtime = e.ctime = i.atime), i;
      },
      getFileDataAsTypedArray(e) {
        return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array(0);
      },
      expandFileStorage(e, r) {
        var t = e.contents ? e.contents.length : 0;
        if (!(t >= r)) {
          var n = 1024 * 1024;
          r = Math.max(r, t * (t < n ? 2 : 1.125) >>> 0), t != 0 && (r = Math.max(r, 256));
          var i = e.contents;
          e.contents = new Uint8Array(r), e.usedBytes > 0 && e.contents.set(i.subarray(0, e.usedBytes), 0);
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
          return r.dev = o.isChrdev(e.mode) ? e.id : 1, r.ino = e.id, r.mode = e.mode, r.nlink = 1, r.uid = 0, r.gid = 0, r.rdev = e.rdev, o.isDir(e.mode) ? r.size = 4096 : o.isFile(e.mode) ? r.size = e.usedBytes : o.isLink(e.mode) ? r.size = e.link.length : r.size = 0, r.atime = new Date(e.atime), r.mtime = new Date(e.mtime), r.ctime = new Date(e.ctime), r.blksize = 4096, r.blocks = Math.ceil(r.size / r.blksize), r;
        },
        setattr(e, r) {
          for (const t of [
            "mode",
            "atime",
            "mtime",
            "ctime"
          ]) r[t] != null && (e[t] = r[t]);
          r.size !== void 0 && g.resizeFileStorage(e, r.size);
        },
        lookup(e, r) {
          throw new o.ErrnoError(44);
        },
        mknod(e, r, t, n) {
          return g.createNode(e, r, t, n);
        },
        rename(e, r, t) {
          var n;
          try {
            n = o.lookupNode(r, t);
          } catch {
          }
          if (n) {
            if (o.isDir(e.mode)) for (var i in n.contents) throw new o.ErrnoError(55);
            o.hashRemoveNode(n);
          }
          delete e.parent.contents[e.name], r.contents[t] = e, e.name = t, r.ctime = r.mtime = e.parent.ctime = e.parent.mtime = Date.now();
        },
        unlink(e, r) {
          delete e.contents[r], e.ctime = e.mtime = Date.now();
        },
        rmdir(e, r) {
          var t = o.lookupNode(e, r);
          for (var n in t.contents) throw new o.ErrnoError(55);
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
          var n = g.createNode(e, r, 41471, 0);
          return n.link = t, n;
        },
        readlink(e) {
          if (!o.isLink(e.mode)) throw new o.ErrnoError(28);
          return e.link;
        }
      },
      stream_ops: {
        read(e, r, t, n, i) {
          var a = e.node.contents;
          if (i >= e.node.usedBytes) return 0;
          var s = Math.min(e.node.usedBytes - i, n);
          if (f(s >= 0), s > 8 && a.subarray) r.set(a.subarray(i, i + s), t);
          else for (var c = 0; c < s; c++) r[t + c] = a[i + c];
          return s;
        },
        write(e, r, t, n, i, a) {
          if (f(!(r instanceof ArrayBuffer)), r.buffer === B.buffer && (a = false), !n) return 0;
          var s = e.node;
          if (s.mtime = s.ctime = Date.now(), r.subarray && (!s.contents || s.contents.subarray)) {
            if (a) return f(i === 0, "canOwn must imply no weird position inside the file"), s.contents = r.subarray(t, t + n), s.usedBytes = n, n;
            if (s.usedBytes === 0 && i === 0) return s.contents = r.slice(t, t + n), s.usedBytes = n, n;
            if (i + n <= s.usedBytes) return s.contents.set(r.subarray(t, t + n), i), n;
          }
          if (g.expandFileStorage(s, i + n), s.contents.subarray && r.subarray) s.contents.set(r.subarray(t, t + n), i);
          else for (var c = 0; c < n; c++) s.contents[i + c] = r[t + c];
          return s.usedBytes = Math.max(s.usedBytes, i + n), n;
        },
        llseek(e, r, t) {
          var n = r;
          if (t === 1 ? n += e.position : t === 2 && o.isFile(e.node.mode) && (n += e.node.usedBytes), n < 0) throw new o.ErrnoError(28);
          return n;
        },
        mmap(e, r, t, n, i) {
          if (!o.isFile(e.node.mode)) throw new o.ErrnoError(43);
          var a, s, c = e.node.contents;
          if (!(i & 2) && c && c.buffer === B.buffer) s = false, a = c.byteOffset;
          else {
            if (s = true, a = fr(), !a) throw new o.ErrnoError(48);
            c && ((t > 0 || t + r < c.length) && (c.subarray ? c = c.subarray(t, t + r) : c = Array.prototype.slice.call(c, t, t + r)), B.set(c, a));
          }
          return {
            ptr: a,
            allocated: s
          };
        },
        msync(e, r, t, n, i) {
          return g.stream_ops.write(e, r, 0, n, t, false), 0;
        }
      }
    }, ot = (e) => {
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
    }, Ze = (e, r) => {
      var t = 0;
      return e && (t |= 365), r && (t |= 146), t;
    }, it = (e) => ue(Er(e)), ur = {
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
    }, at = async (e) => {
      var r = await oe(e);
      return f(r, `Loading data file "${e}" failed (no arrayBuffer).`), new Uint8Array(r);
    }, st = (...e) => o.createDataFile(...e), ct = (e) => {
      for (var r = e; ; ) {
        if (!ye[e]) return e;
        e = r + Math.random();
      }
    }, _e = 0, Oe = null, ye = {}, le = null, lt = (e) => {
      var _a2;
      if (_e--, (_a2 = d.monitorRunDependencies) == null ? void 0 : _a2.call(d, _e), f(e, "removeRunDependency requires an ID"), f(ye[e]), delete ye[e], _e == 0 && (le !== null && (clearInterval(le), le = null), Oe)) {
        var r = Oe;
        Oe = null, r();
      }
    }, dt = (e) => {
      var _a2, _b2;
      _e++, (_a2 = d.monitorRunDependencies) == null ? void 0 : _a2.call(d, _e), f(e, "addRunDependency requires an ID"), f(!ye[e]), ye[e] = 1, le === null && globalThis.setInterval && (le = setInterval(() => {
        if (de) {
          clearInterval(le), le = null;
          return;
        }
        var r = false;
        for (var t in ye) r || (r = true, D("still waiting on run dependencies:")), D(`dependency: ${t}`);
        r && D("(end of list)");
      }, 1e4), (_b2 = le.unref) == null ? void 0 : _b2.call(le));
    }, mr = [], ft = async (e, r) => {
      typeof Browser < "u" && Browser.init();
      for (var t of mr) if (t.canHandle(r)) return f(t.handle.constructor.name === "AsyncFunction", "Filesystem plugin handlers must be async functions (See #24914)"), t.handle(e, r);
      return e;
    }, _r = async (e, r, t, n, i, a, s, c) => {
      var l = r ? Ee.resolve(A.join2(e, r)) : e, u = ct(`cp ${l}`);
      dt(u);
      try {
        var v = t;
        typeof t == "string" && (v = await at(t)), v = await ft(v, l), c == null ? void 0 : c(), a || st(e, r, v, n, i, s);
      } finally {
        lt(u);
      }
    }, ut = (e, r, t, n, i, a, s, c, l, u) => {
      _r(e, r, t, n, i, c, l, u).then(a).catch(s);
    }, o = {
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
          super(re ? it(e) : "");
          __publicField(this, "name", "ErrnoError");
          this.errno = e;
          for (var r in ur) if (ur[r] === e) {
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
          e || (e = this), this.parent = e, this.mount = e.mount, this.id = o.nextInode++, this.name = r, this.mode = t, this.rdev = n, this.atime = this.mtime = this.ctime = Date.now();
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
          return o.isDir(this.mode);
        }
        get isDevice() {
          return o.isChrdev(this.mode);
        }
      },
      lookupPath(e, r = {}) {
        if (!e) throw new o.ErrnoError(44);
        r.follow_mount ?? (r.follow_mount = true), A.isAbs(e) || (e = o.cwd() + "/" + e);
        e: for (var t = 0; t < 40; t++) {
          for (var n = e.split("/").filter((u) => !!u), i = o.root, a = "/", s = 0; s < n.length; s++) {
            var c = s === n.length - 1;
            if (c && r.parent) break;
            if (n[s] !== ".") {
              if (n[s] === "..") {
                if (a = A.dirname(a), o.isRoot(i)) {
                  e = a + "/" + n.slice(s + 1).join("/"), t--;
                  continue e;
                } else i = i.parent;
                continue;
              }
              a = A.join2(a, n[s]);
              try {
                i = o.lookupNode(i, n[s]);
              } catch (u) {
                if ((u == null ? void 0 : u.errno) === 44 && c && r.noent_okay) return {
                  path: a
                };
                throw u;
              }
              if (o.isMountpoint(i) && (!c || r.follow_mount) && (i = i.mounted.root), o.isLink(i.mode) && (!c || r.follow)) {
                if (!i.node_ops.readlink) throw new o.ErrnoError(52);
                var l = i.node_ops.readlink(i);
                A.isAbs(l) || (l = A.dirname(a) + "/" + l), e = l + "/" + n.slice(s + 1).join("/");
                continue e;
              }
            }
          }
          return {
            path: a,
            node: i
          };
        }
        throw new o.ErrnoError(32);
      },
      getPath(e) {
        for (var r; ; ) {
          if (o.isRoot(e)) {
            var t = e.mount.mountpoint;
            return r ? t[t.length - 1] !== "/" ? `${t}/${r}` : t + r : t;
          }
          r = r ? `${e.name}/${r}` : e.name, e = e.parent;
        }
      },
      hashName(e, r) {
        for (var t = 0, n = 0; n < r.length; n++) t = (t << 5) - t + r.charCodeAt(n) | 0;
        return (e + t >>> 0) % o.nameTable.length;
      },
      hashAddNode(e) {
        var r = o.hashName(e.parent.id, e.name);
        e.name_next = o.nameTable[r], o.nameTable[r] = e;
      },
      hashRemoveNode(e) {
        var r = o.hashName(e.parent.id, e.name);
        if (o.nameTable[r] === e) o.nameTable[r] = e.name_next;
        else for (var t = o.nameTable[r]; t; ) {
          if (t.name_next === e) {
            t.name_next = e.name_next;
            break;
          }
          t = t.name_next;
        }
      },
      lookupNode(e, r) {
        var t = o.mayLookup(e);
        if (t) throw new o.ErrnoError(t);
        for (var n = o.hashName(e.id, r), i = o.nameTable[n]; i; i = i.name_next) {
          var a = i.name;
          if (i.parent.id === e.id && a === r) return i;
        }
        return o.lookup(e, r);
      },
      createNode(e, r, t, n) {
        f(typeof e == "object");
        var i = new o.FSNode(e, r, t, n);
        return o.hashAddNode(i), i;
      },
      destroyNode(e) {
        o.hashRemoveNode(e);
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
        return o.ignorePermissions ? 0 : r.includes("r") && !(e.mode & 292) || r.includes("w") && !(e.mode & 146) || r.includes("x") && !(e.mode & 73) ? 2 : 0;
      },
      mayLookup(e) {
        if (!o.isDir(e.mode)) return 54;
        var r = o.nodePermissions(e, "x");
        return r || (e.node_ops.lookup ? 0 : 2);
      },
      mayCreate(e, r) {
        if (!o.isDir(e.mode)) return 54;
        try {
          var t = o.lookupNode(e, r);
          return 20;
        } catch {
        }
        return o.nodePermissions(e, "wx");
      },
      mayDelete(e, r, t) {
        var n;
        try {
          n = o.lookupNode(e, r);
        } catch (a) {
          return a.errno;
        }
        var i = o.nodePermissions(e, "wx");
        if (i) return i;
        if (t) {
          if (!o.isDir(n.mode)) return 54;
          if (o.isRoot(n) || o.getPath(n) === o.cwd()) return 10;
        } else if (o.isDir(n.mode)) return 31;
        return 0;
      },
      mayOpen(e, r) {
        return e ? o.isLink(e.mode) ? 32 : o.isDir(e.mode) && (o.flagsToPermissionString(r) !== "r" || r & 576) ? 31 : o.nodePermissions(e, o.flagsToPermissionString(r)) : 44;
      },
      checkOpExists(e, r) {
        if (!e) throw new o.ErrnoError(r);
        return e;
      },
      MAX_OPEN_FDS: 4096,
      nextfd() {
        for (var e = 0; e <= o.MAX_OPEN_FDS; e++) if (!o.streams[e]) return e;
        throw new o.ErrnoError(33);
      },
      getStreamChecked(e) {
        var r = o.getStream(e);
        if (!r) throw new o.ErrnoError(8);
        return r;
      },
      getStream: (e) => o.streams[e],
      createStream(e, r = -1) {
        return f(r >= -1), e = Object.assign(new o.FSStream(), e), r == -1 && (r = o.nextfd()), e.fd = r, o.streams[r] = e, e;
      },
      closeStream(e) {
        o.streams[e] = null;
      },
      dupStream(e, r = -1) {
        var _a2, _b2;
        var t = o.createStream(e, r);
        return (_b2 = (_a2 = t.stream_ops) == null ? void 0 : _a2.dup) == null ? void 0 : _b2.call(_a2, t), t;
      },
      doSetAttr(e, r, t) {
        var n = e == null ? void 0 : e.stream_ops.setattr, i = n ? e : r;
        n ?? (n = r.node_ops.setattr), o.checkOpExists(n, 63), n(i, t);
      },
      chrdev_stream_ops: {
        open(e) {
          var _a2, _b2;
          var r = o.getDevice(e.node.rdev);
          e.stream_ops = r.stream_ops, (_b2 = (_a2 = e.stream_ops).open) == null ? void 0 : _b2.call(_a2, e);
        },
        llseek() {
          throw new o.ErrnoError(70);
        }
      },
      major: (e) => e >> 8,
      minor: (e) => e & 255,
      makedev: (e, r) => e << 8 | r,
      registerDevice(e, r) {
        o.devices[e] = {
          stream_ops: r
        };
      },
      getDevice: (e) => o.devices[e],
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
        typeof e == "function" && (r = e, e = false), o.syncFSRequests++, o.syncFSRequests > 1 && D(`warning: ${o.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
        var t = o.getMounts(o.root.mount), n = 0;
        function i(c) {
          return f(o.syncFSRequests > 0), o.syncFSRequests--, r(c);
        }
        function a(c) {
          if (c) return a.errored ? void 0 : (a.errored = true, i(c));
          ++n >= t.length && i(null);
        }
        for (var s of t) s.type.syncfs ? s.type.syncfs(s, e, a) : a(null);
      },
      mount(e, r, t) {
        if (typeof e == "string") throw e;
        var n = t === "/", i = !t, a;
        if (n && o.root) throw new o.ErrnoError(10);
        if (!n && !i) {
          var s = o.lookupPath(t, {
            follow_mount: false
          });
          if (t = s.path, a = s.node, o.isMountpoint(a)) throw new o.ErrnoError(10);
          if (!o.isDir(a.mode)) throw new o.ErrnoError(54);
        }
        var c = {
          type: e,
          opts: r,
          mountpoint: t,
          mounts: []
        }, l = e.mount(c);
        return l.mount = c, c.root = l, n ? o.root = l : a && (a.mounted = c, a.mount && a.mount.mounts.push(c)), l;
      },
      unmount(e) {
        var r = o.lookupPath(e, {
          follow_mount: false
        });
        if (!o.isMountpoint(r.node)) throw new o.ErrnoError(28);
        var t = r.node, n = t.mounted, i = o.getMounts(n);
        for (var [a, s] of Object.entries(o.nameTable)) for (; s; ) {
          var c = s.name_next;
          i.includes(s.mount) && o.destroyNode(s), s = c;
        }
        t.mounted = null;
        var l = t.mount.mounts.indexOf(n);
        f(l !== -1), t.mount.mounts.splice(l, 1);
      },
      lookup(e, r) {
        return e.node_ops.lookup(e, r);
      },
      mknod(e, r, t) {
        var n = o.lookupPath(e, {
          parent: true
        }), i = n.node, a = A.basename(e);
        if (!a) throw new o.ErrnoError(28);
        if (a === "." || a === "..") throw new o.ErrnoError(20);
        var s = o.mayCreate(i, a);
        if (s) throw new o.ErrnoError(s);
        if (!i.node_ops.mknod) throw new o.ErrnoError(63);
        return i.node_ops.mknod(i, a, r, t);
      },
      statfs(e) {
        return o.statfsNode(o.lookupPath(e, {
          follow: true
        }).node);
      },
      statfsStream(e) {
        return o.statfsNode(e.node);
      },
      statfsNode(e) {
        var r = {
          bsize: 4096,
          frsize: 4096,
          blocks: 1e6,
          bfree: 5e5,
          bavail: 5e5,
          files: o.nextInode,
          ffree: o.nextInode - 1,
          fsid: 42,
          flags: 2,
          namelen: 255
        };
        return e.node_ops.statfs && Object.assign(r, e.node_ops.statfs(e.mount.opts.root)), r;
      },
      create(e, r = 438) {
        return r &= 4095, r |= 32768, o.mknod(e, r, 0);
      },
      mkdir(e, r = 511) {
        return r &= 1023, r |= 16384, o.mknod(e, r, 0);
      },
      mkdirTree(e, r) {
        var t = e.split("/"), n = "";
        for (var i of t) if (i) {
          (n || A.isAbs(e)) && (n += "/"), n += i;
          try {
            o.mkdir(n, r);
          } catch (a) {
            if (a.errno != 20) throw a;
          }
        }
      },
      mkdev(e, r, t) {
        return typeof t > "u" && (t = r, r = 438), r |= 8192, o.mknod(e, r, t);
      },
      symlink(e, r) {
        if (!Ee.resolve(e)) throw new o.ErrnoError(44);
        var t = o.lookupPath(r, {
          parent: true
        }), n = t.node;
        if (!n) throw new o.ErrnoError(44);
        var i = A.basename(r), a = o.mayCreate(n, i);
        if (a) throw new o.ErrnoError(a);
        if (!n.node_ops.symlink) throw new o.ErrnoError(63);
        return n.node_ops.symlink(n, i, e);
      },
      rename(e, r) {
        var t = A.dirname(e), n = A.dirname(r), i = A.basename(e), a = A.basename(r), s, c, l;
        if (s = o.lookupPath(e, {
          parent: true
        }), c = s.node, s = o.lookupPath(r, {
          parent: true
        }), l = s.node, !c || !l) throw new o.ErrnoError(44);
        if (c.mount !== l.mount) throw new o.ErrnoError(75);
        var u = o.lookupNode(c, i), v = Ee.relative(e, n);
        if (v.charAt(0) !== ".") throw new o.ErrnoError(28);
        if (v = Ee.relative(r, t), v.charAt(0) !== ".") throw new o.ErrnoError(55);
        var h;
        try {
          h = o.lookupNode(l, a);
        } catch {
        }
        if (u !== h) {
          var m = o.isDir(u.mode), _ = o.mayDelete(c, i, m);
          if (_) throw new o.ErrnoError(_);
          if (_ = h ? o.mayDelete(l, a, m) : o.mayCreate(l, a), _) throw new o.ErrnoError(_);
          if (!c.node_ops.rename) throw new o.ErrnoError(63);
          if (o.isMountpoint(u) || h && o.isMountpoint(h)) throw new o.ErrnoError(10);
          if (l !== c && (_ = o.nodePermissions(c, "w"), _)) throw new o.ErrnoError(_);
          o.hashRemoveNode(u);
          try {
            c.node_ops.rename(u, l, a), u.parent = l;
          } catch (S) {
            throw S;
          } finally {
            o.hashAddNode(u);
          }
        }
      },
      rmdir(e) {
        var r = o.lookupPath(e, {
          parent: true
        }), t = r.node, n = A.basename(e), i = o.lookupNode(t, n), a = o.mayDelete(t, n, true);
        if (a) throw new o.ErrnoError(a);
        if (!t.node_ops.rmdir) throw new o.ErrnoError(63);
        if (o.isMountpoint(i)) throw new o.ErrnoError(10);
        t.node_ops.rmdir(t, n), o.destroyNode(i);
      },
      readdir(e) {
        var r = o.lookupPath(e, {
          follow: true
        }), t = r.node, n = o.checkOpExists(t.node_ops.readdir, 54);
        return n(t);
      },
      unlink(e) {
        var r = o.lookupPath(e, {
          parent: true
        }), t = r.node;
        if (!t) throw new o.ErrnoError(44);
        var n = A.basename(e), i = o.lookupNode(t, n), a = o.mayDelete(t, n, false);
        if (a) throw new o.ErrnoError(a);
        if (!t.node_ops.unlink) throw new o.ErrnoError(63);
        if (o.isMountpoint(i)) throw new o.ErrnoError(10);
        t.node_ops.unlink(t, n), o.destroyNode(i);
      },
      readlink(e) {
        var r = o.lookupPath(e), t = r.node;
        if (!t) throw new o.ErrnoError(44);
        if (!t.node_ops.readlink) throw new o.ErrnoError(28);
        return t.node_ops.readlink(t);
      },
      stat(e, r) {
        var t = o.lookupPath(e, {
          follow: !r
        }), n = t.node, i = o.checkOpExists(n.node_ops.getattr, 63);
        return i(n);
      },
      fstat(e) {
        var r = o.getStreamChecked(e), t = r.node, n = r.stream_ops.getattr, i = n ? r : t;
        return n ?? (n = t.node_ops.getattr), o.checkOpExists(n, 63), n(i);
      },
      lstat(e) {
        return o.stat(e, true);
      },
      doChmod(e, r, t, n) {
        o.doSetAttr(e, r, {
          mode: t & 4095 | r.mode & -4096,
          ctime: Date.now(),
          dontFollow: n
        });
      },
      chmod(e, r, t) {
        var n;
        if (typeof e == "string") {
          var i = o.lookupPath(e, {
            follow: !t
          });
          n = i.node;
        } else n = e;
        o.doChmod(null, n, r, t);
      },
      lchmod(e, r) {
        o.chmod(e, r, true);
      },
      fchmod(e, r) {
        var t = o.getStreamChecked(e);
        o.doChmod(t, t.node, r, false);
      },
      doChown(e, r, t) {
        o.doSetAttr(e, r, {
          timestamp: Date.now(),
          dontFollow: t
        });
      },
      chown(e, r, t, n) {
        var i;
        if (typeof e == "string") {
          var a = o.lookupPath(e, {
            follow: !n
          });
          i = a.node;
        } else i = e;
        o.doChown(null, i, n);
      },
      lchown(e, r, t) {
        o.chown(e, r, t, true);
      },
      fchown(e, r, t) {
        var n = o.getStreamChecked(e);
        o.doChown(n, n.node, false);
      },
      doTruncate(e, r, t) {
        if (o.isDir(r.mode)) throw new o.ErrnoError(31);
        if (!o.isFile(r.mode)) throw new o.ErrnoError(28);
        var n = o.nodePermissions(r, "w");
        if (n) throw new o.ErrnoError(n);
        o.doSetAttr(e, r, {
          size: t,
          timestamp: Date.now()
        });
      },
      truncate(e, r) {
        if (r < 0) throw new o.ErrnoError(28);
        var t;
        if (typeof e == "string") {
          var n = o.lookupPath(e, {
            follow: true
          });
          t = n.node;
        } else t = e;
        o.doTruncate(null, t, r);
      },
      ftruncate(e, r) {
        var t = o.getStreamChecked(e);
        if (r < 0 || !(t.flags & 2097155)) throw new o.ErrnoError(28);
        o.doTruncate(t, t.node, r);
      },
      utime(e, r, t) {
        var n = o.lookupPath(e, {
          follow: true
        }), i = n.node, a = o.checkOpExists(i.node_ops.setattr, 63);
        a(i, {
          atime: r,
          mtime: t
        });
      },
      open(e, r, t = 438) {
        if (e === "") throw new o.ErrnoError(44);
        r = typeof r == "string" ? ot(r) : r, r & 64 ? t = t & 4095 | 32768 : t = 0;
        var n, i;
        if (typeof e == "object") n = e;
        else {
          i = e.endsWith("/");
          var a = o.lookupPath(e, {
            follow: !(r & 131072),
            noent_okay: true
          });
          n = a.node, e = a.path;
        }
        var s = false;
        if (r & 64) if (n) {
          if (r & 128) throw new o.ErrnoError(20);
        } else {
          if (i) throw new o.ErrnoError(31);
          n = o.mknod(e, t | 511, 0), s = true;
        }
        if (!n) throw new o.ErrnoError(44);
        if (o.isChrdev(n.mode) && (r &= -513), r & 65536 && !o.isDir(n.mode)) throw new o.ErrnoError(54);
        if (!s) {
          var c = o.mayOpen(n, r);
          if (c) throw new o.ErrnoError(c);
        }
        r & 512 && !s && o.truncate(n, 0), r &= -131713;
        var l = o.createStream({
          node: n,
          path: o.getPath(n),
          flags: r,
          seekable: true,
          position: 0,
          stream_ops: n.stream_ops,
          ungotten: [],
          error: false
        });
        return l.stream_ops.open && l.stream_ops.open(l), s && o.chmod(n, t & 511), d.logReadFiles && !(r & 1) && (e in o.readFiles || (o.readFiles[e] = 1)), l;
      },
      close(e) {
        if (o.isClosed(e)) throw new o.ErrnoError(8);
        e.getdents && (e.getdents = null);
        try {
          e.stream_ops.close && e.stream_ops.close(e);
        } catch (r) {
          throw r;
        } finally {
          o.closeStream(e.fd);
        }
        e.fd = null;
      },
      isClosed(e) {
        return e.fd === null;
      },
      llseek(e, r, t) {
        if (o.isClosed(e)) throw new o.ErrnoError(8);
        if (!e.seekable || !e.stream_ops.llseek) throw new o.ErrnoError(70);
        if (t != 0 && t != 1 && t != 2) throw new o.ErrnoError(28);
        return e.position = e.stream_ops.llseek(e, r, t), e.ungotten = [], e.position;
      },
      read(e, r, t, n, i) {
        if (f(t >= 0), n < 0 || i < 0) throw new o.ErrnoError(28);
        if (o.isClosed(e)) throw new o.ErrnoError(8);
        if ((e.flags & 2097155) === 1) throw new o.ErrnoError(8);
        if (o.isDir(e.node.mode)) throw new o.ErrnoError(31);
        if (!e.stream_ops.read) throw new o.ErrnoError(28);
        var a = typeof i < "u";
        if (!a) i = e.position;
        else if (!e.seekable) throw new o.ErrnoError(70);
        var s = e.stream_ops.read(e, r, t, n, i);
        return a || (e.position += s), s;
      },
      write(e, r, t, n, i, a) {
        if (f(t >= 0), n < 0 || i < 0) throw new o.ErrnoError(28);
        if (o.isClosed(e)) throw new o.ErrnoError(8);
        if (!(e.flags & 2097155)) throw new o.ErrnoError(8);
        if (o.isDir(e.node.mode)) throw new o.ErrnoError(31);
        if (!e.stream_ops.write) throw new o.ErrnoError(28);
        e.seekable && e.flags & 1024 && o.llseek(e, 0, 2);
        var s = typeof i < "u";
        if (!s) i = e.position;
        else if (!e.seekable) throw new o.ErrnoError(70);
        var c = e.stream_ops.write(e, r, t, n, i, a);
        return s || (e.position += c), c;
      },
      mmap(e, r, t, n, i) {
        if (n & 2 && !(i & 2) && (e.flags & 2097155) !== 2) throw new o.ErrnoError(2);
        if ((e.flags & 2097155) === 1) throw new o.ErrnoError(2);
        if (!e.stream_ops.mmap) throw new o.ErrnoError(43);
        if (!r) throw new o.ErrnoError(28);
        return e.stream_ops.mmap(e, r, t, n, i);
      },
      msync(e, r, t, n, i) {
        return f(t >= 0), e.stream_ops.msync ? e.stream_ops.msync(e, r, t, n, i) : 0;
      },
      ioctl(e, r, t) {
        if (!e.stream_ops.ioctl) throw new o.ErrnoError(59);
        return e.stream_ops.ioctl(e, r, t);
      },
      readFile(e, r = {}) {
        r.flags = r.flags || 0, r.encoding = r.encoding || "binary", r.encoding !== "utf8" && r.encoding !== "binary" && k(`Invalid encoding type "${r.encoding}"`);
        var t = o.open(e, r.flags), n = o.stat(e), i = n.size, a = new Uint8Array(i);
        return o.read(t, a, 0, i, 0), r.encoding === "utf8" && (a = ge(a)), o.close(t), a;
      },
      writeFile(e, r, t = {}) {
        t.flags = t.flags || 577;
        var n = o.open(e, t.flags, t.mode);
        typeof r == "string" && (r = new Uint8Array(Je(r))), ArrayBuffer.isView(r) ? o.write(n, r, 0, r.byteLength, void 0, t.canOwn) : k("Unsupported data type"), o.close(n);
      },
      cwd: () => o.currentPath,
      chdir(e) {
        var r = o.lookupPath(e, {
          follow: true
        });
        if (r.node === null) throw new o.ErrnoError(44);
        if (!o.isDir(r.node.mode)) throw new o.ErrnoError(54);
        var t = o.nodePermissions(r.node, "x");
        if (t) throw new o.ErrnoError(t);
        o.currentPath = r.path;
      },
      createDefaultDirectories() {
        o.mkdir("/tmp"), o.mkdir("/home"), o.mkdir("/home/web_user");
      },
      createDefaultDevices() {
        o.mkdir("/dev"), o.registerDevice(o.makedev(1, 3), {
          read: () => 0,
          write: (n, i, a, s, c) => s,
          llseek: () => 0
        }), o.mkdev("/dev/null", o.makedev(1, 3)), me.register(o.makedev(5, 0), me.default_tty_ops), me.register(o.makedev(6, 0), me.default_tty1_ops), o.mkdev("/dev/tty", o.makedev(5, 0)), o.mkdev("/dev/tty1", o.makedev(6, 0));
        var e = new Uint8Array(1024), r = 0, t = () => (r === 0 && (dr(e), r = e.byteLength), e[--r]);
        o.createDevice("/dev", "random", t), o.createDevice("/dev", "urandom", t), o.mkdir("/dev/shm"), o.mkdir("/dev/shm/tmp");
      },
      createSpecialDirectories() {
        o.mkdir("/proc");
        var e = o.mkdir("/proc/self");
        o.mkdir("/proc/self/fd"), o.mount({
          mount() {
            var r = o.createNode(e, "fd", 16895, 73);
            return r.stream_ops = {
              llseek: g.stream_ops.llseek
            }, r.node_ops = {
              lookup(t, n) {
                var i = +n, a = o.getStreamChecked(i), s = {
                  parent: null,
                  mount: {
                    mountpoint: "fake"
                  },
                  node_ops: {
                    readlink: () => a.path
                  },
                  id: i + 1
                };
                return s.parent = s, s;
              },
              readdir() {
                return Array.from(o.streams.entries()).filter(([t, n]) => n).map(([t, n]) => t.toString());
              }
            }, r;
          }
        }, {}, "/proc/self/fd");
      },
      createStandardStreams(e, r, t) {
        e ? o.createDevice("/dev", "stdin", e) : o.symlink("/dev/tty", "/dev/stdin"), r ? o.createDevice("/dev", "stdout", null, r) : o.symlink("/dev/tty", "/dev/stdout"), t ? o.createDevice("/dev", "stderr", null, t) : o.symlink("/dev/tty1", "/dev/stderr");
        var n = o.open("/dev/stdin", 0), i = o.open("/dev/stdout", 1), a = o.open("/dev/stderr", 1);
        f(n.fd === 0, `invalid handle for stdin (${n.fd})`), f(i.fd === 1, `invalid handle for stdout (${i.fd})`), f(a.fd === 2, `invalid handle for stderr (${a.fd})`);
      },
      staticInit() {
        o.nameTable = new Array(4096), o.mount(g, {}, "/"), o.createDefaultDirectories(), o.createDefaultDevices(), o.createSpecialDirectories(), o.filesystems = {
          MEMFS: g
        };
      },
      init(e, r, t) {
        f(!o.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"), o.initialized = true, e ?? (e = d.stdin), r ?? (r = d.stdout), t ?? (t = d.stderr), o.createStandardStreams(e, r, t);
      },
      quit() {
        o.initialized = false, gr(0);
        for (var e of o.streams) e && o.close(e);
      },
      findObject(e, r) {
        var t = o.analyzePath(e, r);
        return t.exists ? t.object : null;
      },
      analyzePath(e, r) {
        try {
          var t = o.lookupPath(e, {
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
          var t = o.lookupPath(e, {
            parent: true
          });
          n.parentExists = true, n.parentPath = t.path, n.parentObject = t.node, n.name = A.basename(e), t = o.lookupPath(e, {
            follow: !r
          }), n.exists = true, n.path = t.path, n.object = t.node, n.name = t.node.name, n.isRoot = t.path === "/";
        } catch (i) {
          n.error = i.errno;
        }
        return n;
      },
      createPath(e, r, t, n) {
        e = typeof e == "string" ? e : o.getPath(e);
        for (var i = r.split("/").reverse(); i.length; ) {
          var a = i.pop();
          if (a) {
            var s = A.join2(e, a);
            try {
              o.mkdir(s);
            } catch (c) {
              if (c.errno != 20) throw c;
            }
            e = s;
          }
        }
        return s;
      },
      createFile(e, r, t, n, i) {
        var a = A.join2(typeof e == "string" ? e : o.getPath(e), r), s = Ze(n, i);
        return o.create(a, s);
      },
      createDataFile(e, r, t, n, i, a) {
        var s = r;
        e && (e = typeof e == "string" ? e : o.getPath(e), s = r ? A.join2(e, r) : e);
        var c = Ze(n, i), l = o.create(s, c);
        if (t) {
          if (typeof t == "string") {
            for (var u = new Array(t.length), v = 0, h = t.length; v < h; ++v) u[v] = t.charCodeAt(v);
            t = u;
          }
          o.chmod(l, c | 146);
          var m = o.open(l, 577);
          o.write(m, t, 0, t.length, 0, a), o.close(m), o.chmod(l, c);
        }
      },
      createDevice(e, r, t, n) {
        var _a2;
        var i = A.join2(typeof e == "string" ? e : o.getPath(e), r), a = Ze(!!t, !!n);
        (_a2 = o.createDevice).major ?? (_a2.major = 64);
        var s = o.makedev(o.createDevice.major++, 0);
        return o.registerDevice(s, {
          open(c) {
            c.seekable = false;
          },
          close(c) {
            var _a3;
            ((_a3 = n == null ? void 0 : n.buffer) == null ? void 0 : _a3.length) && n(10);
          },
          read(c, l, u, v, h) {
            for (var m = 0, _ = 0; _ < v; _++) {
              var S;
              try {
                S = t();
              } catch {
                throw new o.ErrnoError(29);
              }
              if (S === void 0 && m === 0) throw new o.ErrnoError(6);
              if (S == null) break;
              m++, l[u + _] = S;
            }
            return m && (c.node.atime = Date.now()), m;
          },
          write(c, l, u, v, h) {
            for (var m = 0; m < v; m++) try {
              n(l[u + m]);
            } catch {
              throw new o.ErrnoError(29);
            }
            return v && (c.node.mtime = c.node.ctime = Date.now()), m;
          }
        }), o.mkdev(i, a, s);
      },
      forceLoadFile(e) {
        if (e.isDevice || e.isFolder || e.link || e.contents) return true;
        if (globalThis.XMLHttpRequest) k("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        else try {
          e.contents = I(e.url);
        } catch {
          throw new o.ErrnoError(29);
        }
      },
      createLazyFile(e, r, t, n, i) {
        class a {
          constructor() {
            __publicField(this, "lengthKnown", false);
            __publicField(this, "chunks", []);
          }
          get(m) {
            if (!(m > this.length - 1 || m < 0)) {
              var _ = m % this.chunkSize, S = m / this.chunkSize | 0;
              return this.getter(S)[_];
            }
          }
          setDataGetter(m) {
            this.getter = m;
          }
          cacheLength() {
            var m = new XMLHttpRequest();
            m.open("HEAD", t, false), m.send(null), m.status >= 200 && m.status < 300 || m.status === 304 || k("Couldn't load " + t + ". Status: " + m.status);
            var _ = Number(m.getResponseHeader("Content-length")), S, O = (S = m.getResponseHeader("Accept-Ranges")) && S === "bytes", H = (S = m.getResponseHeader("Content-Encoding")) && S === "gzip", x = 1024 * 1024;
            O || (x = _);
            var X = (Q, Se) => {
              Q > Se && k("invalid range (" + Q + ", " + Se + ") or no bytes requested!"), Se > _ - 1 && k("only " + _ + " bytes available! programmer error!");
              var L = new XMLHttpRequest();
              return L.open("GET", t, false), _ !== x && L.setRequestHeader("Range", "bytes=" + Q + "-" + Se), L.responseType = "arraybuffer", L.overrideMimeType && L.overrideMimeType("text/plain; charset=x-user-defined"), L.send(null), L.status >= 200 && L.status < 300 || L.status === 304 || k("Couldn't load " + t + ". Status: " + L.status), L.response !== void 0 ? new Uint8Array(L.response || []) : Je(L.responseText || "");
            }, Ie = this;
            Ie.setDataGetter((Q) => {
              var Se = Q * x, L = (Q + 1) * x - 1;
              return L = Math.min(L, _ - 1), typeof Ie.chunks[Q] > "u" && (Ie.chunks[Q] = X(Se, L)), typeof Ie.chunks[Q] > "u" && k("doXHR failed!"), Ie.chunks[Q];
            }), (H || !_) && (x = _ = 1, _ = this.getter(0).length, x = _, q("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = _, this._chunkSize = x, this.lengthKnown = true;
          }
          get length() {
            return this.lengthKnown || this.cacheLength(), this._length;
          }
          get chunkSize() {
            return this.lengthKnown || this.cacheLength(), this._chunkSize;
          }
        }
        if (globalThis.XMLHttpRequest) {
          P || k("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
          var s = new a(), c = {
            isDevice: false,
            contents: s
          };
        } else var c = {
          isDevice: false,
          url: t
        };
        var l = o.createFile(e, r, c, n, i);
        c.contents ? l.contents = c.contents : c.url && (l.contents = null, l.url = c.url), Object.defineProperties(l, {
          usedBytes: {
            get: function() {
              return this.contents.length;
            }
          }
        });
        var u = {};
        for (const [h, m] of Object.entries(l.stream_ops)) u[h] = (..._) => (o.forceLoadFile(l), m(..._));
        function v(h, m, _, S, O) {
          var H = h.node.contents;
          if (O >= H.length) return 0;
          var x = Math.min(H.length - O, S);
          if (f(x >= 0), H.slice) for (var X = 0; X < x; X++) m[_ + X] = H[O + X];
          else for (var X = 0; X < x; X++) m[_ + X] = H.get(O + X);
          return x;
        }
        return u.read = (h, m, _, S, O) => (o.forceLoadFile(l), v(h, m, _, S, O)), u.mmap = (h, m, _, S, O) => {
          o.forceLoadFile(l);
          var H = fr();
          if (!H) throw new o.ErrnoError(48);
          return v(h, B, H, m, _), {
            ptr: H,
            allocated: true
          };
        }, l.stream_ops = u, l;
      },
      absolutePath() {
        k("FS.absolutePath has been removed; use PATH_FS.resolve instead");
      },
      createFolder() {
        k("FS.createFolder has been removed; use FS.mkdir instead");
      },
      createLink() {
        k("FS.createLink has been removed; use FS.symlink instead");
      },
      joinPath() {
        k("FS.joinPath has been removed; use PATH.join instead");
      },
      mmapAlloc() {
        k("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
      },
      standardizePath() {
        k("FS.standardizePath has been removed; use PATH.normalize instead");
      }
    }, Ce = {
      calculateAt(e, r, t) {
        if (A.isAbs(r)) return r;
        var n;
        if (e === -100) n = o.cwd();
        else {
          var i = Ce.getStreamFromFD(e);
          n = i.path;
        }
        if (r.length == 0) {
          if (!t) throw new o.ErrnoError(44);
          return n;
        }
        return n + "/" + r;
      },
      writeStat(e, r) {
        p[e >> 2] = r.dev, p[e + 4 >> 2] = r.mode, p[e + 8 >> 2] = r.nlink, p[e + 12 >> 2] = r.uid, p[e + 16 >> 2] = r.gid, p[e + 20 >> 2] = r.rdev, z[e + 24 >> 3] = BigInt(r.size), ce[e + 32 >> 2] = 4096, ce[e + 36 >> 2] = r.blocks;
        var t = r.atime.getTime(), n = r.mtime.getTime(), i = r.ctime.getTime();
        return z[e + 40 >> 3] = BigInt(Math.floor(t / 1e3)), p[e + 48 >> 2] = t % 1e3 * 1e3 * 1e3, z[e + 56 >> 3] = BigInt(Math.floor(n / 1e3)), p[e + 64 >> 2] = n % 1e3 * 1e3 * 1e3, z[e + 72 >> 3] = BigInt(Math.floor(i / 1e3)), p[e + 80 >> 2] = i % 1e3 * 1e3 * 1e3, z[e + 88 >> 3] = BigInt(r.ino), 0;
      },
      writeStatFs(e, r) {
        p[e + 4 >> 2] = r.bsize, p[e + 60 >> 2] = r.bsize, z[e + 8 >> 3] = BigInt(r.blocks), z[e + 16 >> 3] = BigInt(r.bfree), z[e + 24 >> 3] = BigInt(r.bavail), z[e + 32 >> 3] = BigInt(r.files), z[e + 40 >> 3] = BigInt(r.ffree), p[e + 48 >> 2] = r.fsid, p[e + 64 >> 2] = r.flags, p[e + 56 >> 2] = r.namelen;
      },
      doMsync(e, r, t, n, i) {
        if (!o.isFile(r.node.mode)) throw new o.ErrnoError(43);
        if (n & 2) return 0;
        var a = ee.slice(e, e + t);
        o.msync(r, a, i, t, n);
      },
      getStreamFromFD(e) {
        var r = o.getStreamChecked(e);
        return r;
      },
      varargs: void 0,
      getStr(e) {
        var r = ue(e);
        return r;
      }
    };
    function mt(e) {
      try {
        var r = Ce.getStreamFromFD(e);
        return o.close(r), 0;
      } catch (t) {
        if (typeof o > "u" || t.name !== "ErrnoError") throw t;
        return t.errno;
      }
    }
    var _t = (e, r, t, n) => {
      for (var i = 0, a = 0; a < t; a++) {
        var s = p[r >> 2], c = p[r + 4 >> 2];
        r += 8;
        var l = o.read(e, B, s, c, n);
        if (l < 0) return -1;
        if (i += l, l < c) break;
      }
      return i;
    };
    function vt(e, r, t, n) {
      try {
        var i = Ce.getStreamFromFD(e), a = _t(i, r, t);
        return p[n >> 2] = a, 0;
      } catch (s) {
        if (typeof o > "u" || s.name !== "ErrnoError") throw s;
        return s.errno;
      }
    }
    var ht = 9007199254740992, pt = -9007199254740992, gt = (e) => e < pt || e > ht ? NaN : Number(e);
    function Et(e, r, t, n) {
      r = gt(r);
      try {
        if (isNaN(r)) return 61;
        var i = Ce.getStreamFromFD(e);
        return o.llseek(i, r, t), z[n >> 3] = BigInt(i.position), i.getdents && r === 0 && t === 0 && (i.getdents = null), 0;
      } catch (a) {
        if (typeof o > "u" || a.name !== "ErrnoError") throw a;
        return a.errno;
      }
    }
    var yt = (e, r, t, n) => {
      for (var i = 0, a = 0; a < t; a++) {
        var s = p[r >> 2], c = p[r + 4 >> 2];
        r += 8;
        var l = o.write(e, B, s, c, n);
        if (l < 0) return -1;
        if (i += l, l < c) break;
      }
      return i;
    };
    function wt(e, r, t, n) {
      try {
        var i = Ce.getStreamFromFD(e), a = yt(i, r, t);
        return p[n >> 2] = a, 0;
      } catch (s) {
        if (typeof o > "u" || s.name !== "ErrnoError") throw s;
        return s.errno;
      }
    }
    var vr = [], b = (e) => {
      var r = vr[e];
      return r || (vr[e] = r = tr.get(e)), f(tr.get(e) == r, "JavaScript-side Wasm function table mirror is out of date!"), r;
    }, St = (e) => Ge(e), kt = (e) => rr(e), hr = (e) => kr(e), Ft = (e) => {
      var r = T(), t = hr(4), n = hr(4);
      Tr(e, t, n);
      var i = p[t >> 2], a = p[n >> 2], s = ue(i);
      Qe(i);
      var c;
      return a && (c = ue(a), Qe(a)), F(r), [
        s,
        c
      ];
    }, pr = (e) => Ft(e);
    o.createPreloadedFile = ut, o.preloadFile = _r, o.staticInit();
    {
      if (d.noExitRuntime && d.noExitRuntime, d.preloadPlugins && (mr = d.preloadPlugins), d.print && (q = d.print), d.printErr && (D = d.printErr), d.wasmBinary && (ie = d.wasmBinary), Pt(), d.arguments && d.arguments, d.thisProgram && (ne = d.thisProgram), f(typeof d.memoryInitializerPrefixURL > "u", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"), f(typeof d.pthreadMainPrefixURL > "u", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"), f(typeof d.cdInitializerPrefixURL > "u", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"), f(typeof d.filePackagePrefixURL > "u", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"), f(typeof d.read > "u", "Module.read option was removed"), f(typeof d.readAsync > "u", "Module.readAsync option was removed (modify readAsync in JS)"), f(typeof d.readBinary > "u", "Module.readBinary option was removed (modify readBinary in JS)"), f(typeof d.setWindowTitle > "u", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"), f(typeof d.TOTAL_MEMORY > "u", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"), f(typeof d.ENVIRONMENT > "u", "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)"), f(typeof d.STACK_SIZE > "u", "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"), f(typeof d.wasmMemory > "u", "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"), f(typeof d.INITIAL_MEMORY > "u", "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically"), d.preInit) for (typeof d.preInit == "function" && (d.preInit = [
        d.preInit
      ]); d.preInit.length > 0; ) d.preInit.shift()();
      se("preInit");
    }
    var Tt = [
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
    Tt.forEach(be);
    var bt = [
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
    bt.forEach(ve), d.incrementExceptionRefcount = St, d.decrementExceptionRefcount = kt, d.getExceptionMessage = pr;
    function Pt() {
      Fe("fetchSettings");
    }
    d._deform = N("_deform"), d._malloc = N("_malloc");
    var Qe = d._free = N("_free"), gr = N("_fflush"), Er = N("_strerror"), er = N("_emscripten_stack_get_end"), w = N("_setThrew"), yr = N("__emscripten_tempret_set"), wr = N("_emscripten_stack_init"), Sr = N("__emscripten_stack_restore"), kr = N("__emscripten_stack_alloc"), Fr = N("_emscripten_stack_get_current"), rr = N("___cxa_decrement_exception_refcount"), Ge = N("___cxa_increment_exception_refcount"), Tr = N("___get_exception_message"), br = N("___cxa_can_catch"), Pr = N("___cxa_get_exception_ptr"), Ve = N("wasmMemory"), tr = N("wasmTable");
    function At(e) {
      f(typeof e.deform < "u", "missing Wasm export: deform"), f(typeof e.malloc < "u", "missing Wasm export: malloc"), f(typeof e.free < "u", "missing Wasm export: free"), f(typeof e.__cxa_free_exception < "u", "missing Wasm export: __cxa_free_exception"), f(typeof e.fflush < "u", "missing Wasm export: fflush"), f(typeof e.strerror < "u", "missing Wasm export: strerror"), f(typeof e.emscripten_stack_get_end < "u", "missing Wasm export: emscripten_stack_get_end"), f(typeof e.emscripten_stack_get_base < "u", "missing Wasm export: emscripten_stack_get_base"), f(typeof e.setThrew < "u", "missing Wasm export: setThrew"), f(typeof e._emscripten_tempret_set < "u", "missing Wasm export: _emscripten_tempret_set"), f(typeof e.emscripten_stack_init < "u", "missing Wasm export: emscripten_stack_init"), f(typeof e.emscripten_stack_get_free < "u", "missing Wasm export: emscripten_stack_get_free"), f(typeof e._emscripten_stack_restore < "u", "missing Wasm export: _emscripten_stack_restore"), f(typeof e._emscripten_stack_alloc < "u", "missing Wasm export: _emscripten_stack_alloc"), f(typeof e.emscripten_stack_get_current < "u", "missing Wasm export: emscripten_stack_get_current"), f(typeof e.__cxa_decrement_exception_refcount < "u", "missing Wasm export: __cxa_decrement_exception_refcount"), f(typeof e.__cxa_increment_exception_refcount < "u", "missing Wasm export: __cxa_increment_exception_refcount"), f(typeof e.__get_exception_message < "u", "missing Wasm export: __get_exception_message"), f(typeof e.__cxa_can_catch < "u", "missing Wasm export: __cxa_can_catch"), f(typeof e.__cxa_get_exception_ptr < "u", "missing Wasm export: __cxa_get_exception_ptr"), f(typeof e.memory < "u", "missing Wasm export: memory"), f(typeof e.__indirect_function_table < "u", "missing Wasm export: __indirect_function_table"), d._deform = y("deform", 46), d._malloc = y("malloc", 1), Qe = d._free = y("free", 1), gr = y("fflush", 1), Er = y("strerror", 1), er = e.emscripten_stack_get_end, e.emscripten_stack_get_base, w = y("setThrew", 2), yr = y("_emscripten_tempret_set", 1), wr = e.emscripten_stack_init, e.emscripten_stack_get_free, Sr = e._emscripten_stack_restore, kr = e._emscripten_stack_alloc, Fr = e.emscripten_stack_get_current, rr = y("__cxa_decrement_exception_refcount", 1), Ge = y("__cxa_increment_exception_refcount", 1), Tr = y("__get_exception_message", 3), br = y("__cxa_can_catch", 3), Pr = y("__cxa_get_exception_ptr", 1), Ve = e.memory, tr = e.__indirect_function_table;
    }
    var Ar = {
      __assert_fail: Ur,
      __cxa_begin_catch: Br,
      __cxa_end_catch: zr,
      __cxa_find_matching_catch_2: Hr,
      __cxa_find_matching_catch_3: Wr,
      __cxa_rethrow: jr,
      __cxa_throw: $r,
      __cxa_uncaught_exceptions: Gr,
      __resumeException: Vr,
      _abort_js: Yr,
      _tzset_js: Kr,
      emscripten_resize_heap: Zr,
      environ_get: et,
      environ_sizes_get: rt,
      fd_close: mt,
      fd_read: vt,
      fd_seek: Et,
      fd_write: wt,
      invoke_diii: en,
      invoke_fiii: Qt,
      invoke_i: rn,
      invoke_ii: Dt,
      invoke_iii: Lt,
      invoke_iiii: Rt,
      invoke_iiiii: Xt,
      invoke_iiiiii: Yt,
      invoke_iiiiiii: Ut,
      invoke_iiiiiiii: Kt,
      invoke_iiiiiiiiiii: qt,
      invoke_iiiiiiiiiiii: tn,
      invoke_iiiiiiiiiiiii: Zt,
      invoke_jiiii: Jt,
      invoke_v: Nt,
      invoke_vi: Bt,
      invoke_vii: xt,
      invoke_viid: zt,
      invoke_viidd: Vt,
      invoke_viii: Ct,
      invoke_viiid: Gt,
      invoke_viiii: Ot,
      invoke_viiiii: Mt,
      invoke_viiiiii: It,
      invoke_viiiiiid: Wt,
      invoke_viiiiiii: jt,
      invoke_viiiiiiidiiii: $t,
      invoke_viiiiiiiiii: nn,
      invoke_viiiiiiiiiidii: Ht,
      invoke_viiiiiiiiiiiiiii: on
    };
    function Rt(e, r, t, n) {
      var i = T();
      try {
        return b(e)(r, t, n);
      } catch (a) {
        if (F(i), !(a instanceof E)) throw a;
        w(1, 0);
      }
    }
    function Nt(e) {
      var r = T();
      try {
        b(e)();
      } catch (t) {
        if (F(r), !(t instanceof E)) throw t;
        w(1, 0);
      }
    }
    function Dt(e, r) {
      var t = T();
      try {
        return b(e)(r);
      } catch (n) {
        if (F(t), !(n instanceof E)) throw n;
        w(1, 0);
      }
    }
    function Mt(e, r, t, n, i, a) {
      var s = T();
      try {
        b(e)(r, t, n, i, a);
      } catch (c) {
        if (F(s), !(c instanceof E)) throw c;
        w(1, 0);
      }
    }
    function Ot(e, r, t, n, i) {
      var a = T();
      try {
        b(e)(r, t, n, i);
      } catch (s) {
        if (F(a), !(s instanceof E)) throw s;
        w(1, 0);
      }
    }
    function Ct(e, r, t, n) {
      var i = T();
      try {
        b(e)(r, t, n);
      } catch (a) {
        if (F(i), !(a instanceof E)) throw a;
        w(1, 0);
      }
    }
    function It(e, r, t, n, i, a, s) {
      var c = T();
      try {
        b(e)(r, t, n, i, a, s);
      } catch (l) {
        if (F(c), !(l instanceof E)) throw l;
        w(1, 0);
      }
    }
    function xt(e, r, t) {
      var n = T();
      try {
        b(e)(r, t);
      } catch (i) {
        if (F(n), !(i instanceof E)) throw i;
        w(1, 0);
      }
    }
    function Lt(e, r, t) {
      var n = T();
      try {
        return b(e)(r, t);
      } catch (i) {
        if (F(n), !(i instanceof E)) throw i;
        w(1, 0);
      }
    }
    function Ut(e, r, t, n, i, a, s) {
      var c = T();
      try {
        return b(e)(r, t, n, i, a, s);
      } catch (l) {
        if (F(c), !(l instanceof E)) throw l;
        w(1, 0);
      }
    }
    function Bt(e, r) {
      var t = T();
      try {
        b(e)(r);
      } catch (n) {
        if (F(t), !(n instanceof E)) throw n;
        w(1, 0);
      }
    }
    function zt(e, r, t, n) {
      var i = T();
      try {
        b(e)(r, t, n);
      } catch (a) {
        if (F(i), !(a instanceof E)) throw a;
        w(1, 0);
      }
    }
    function Ht(e, r, t, n, i, a, s, c, l, u, v, h, m, _) {
      var S = T();
      try {
        b(e)(r, t, n, i, a, s, c, l, u, v, h, m, _);
      } catch (O) {
        if (F(S), !(O instanceof E)) throw O;
        w(1, 0);
      }
    }
    function Wt(e, r, t, n, i, a, s, c) {
      var l = T();
      try {
        b(e)(r, t, n, i, a, s, c);
      } catch (u) {
        if (F(l), !(u instanceof E)) throw u;
        w(1, 0);
      }
    }
    function jt(e, r, t, n, i, a, s, c) {
      var l = T();
      try {
        b(e)(r, t, n, i, a, s, c);
      } catch (u) {
        if (F(l), !(u instanceof E)) throw u;
        w(1, 0);
      }
    }
    function $t(e, r, t, n, i, a, s, c, l, u, v, h, m) {
      var _ = T();
      try {
        b(e)(r, t, n, i, a, s, c, l, u, v, h, m);
      } catch (S) {
        if (F(_), !(S instanceof E)) throw S;
        w(1, 0);
      }
    }
    function Gt(e, r, t, n, i) {
      var a = T();
      try {
        b(e)(r, t, n, i);
      } catch (s) {
        if (F(a), !(s instanceof E)) throw s;
        w(1, 0);
      }
    }
    function Vt(e, r, t, n, i) {
      var a = T();
      try {
        b(e)(r, t, n, i);
      } catch (s) {
        if (F(a), !(s instanceof E)) throw s;
        w(1, 0);
      }
    }
    function Yt(e, r, t, n, i, a) {
      var s = T();
      try {
        return b(e)(r, t, n, i, a);
      } catch (c) {
        if (F(s), !(c instanceof E)) throw c;
        w(1, 0);
      }
    }
    function Kt(e, r, t, n, i, a, s, c) {
      var l = T();
      try {
        return b(e)(r, t, n, i, a, s, c);
      } catch (u) {
        if (F(l), !(u instanceof E)) throw u;
        w(1, 0);
      }
    }
    function qt(e, r, t, n, i, a, s, c, l, u, v) {
      var h = T();
      try {
        return b(e)(r, t, n, i, a, s, c, l, u, v);
      } catch (m) {
        if (F(h), !(m instanceof E)) throw m;
        w(1, 0);
      }
    }
    function Xt(e, r, t, n, i) {
      var a = T();
      try {
        return b(e)(r, t, n, i);
      } catch (s) {
        if (F(a), !(s instanceof E)) throw s;
        w(1, 0);
      }
    }
    function Jt(e, r, t, n, i) {
      var a = T();
      try {
        return b(e)(r, t, n, i);
      } catch (s) {
        if (F(a), !(s instanceof E)) throw s;
        return w(1, 0), 0n;
      }
    }
    function Zt(e, r, t, n, i, a, s, c, l, u, v, h, m) {
      var _ = T();
      try {
        return b(e)(r, t, n, i, a, s, c, l, u, v, h, m);
      } catch (S) {
        if (F(_), !(S instanceof E)) throw S;
        w(1, 0);
      }
    }
    function Qt(e, r, t, n) {
      var i = T();
      try {
        return b(e)(r, t, n);
      } catch (a) {
        if (F(i), !(a instanceof E)) throw a;
        w(1, 0);
      }
    }
    function en(e, r, t, n) {
      var i = T();
      try {
        return b(e)(r, t, n);
      } catch (a) {
        if (F(i), !(a instanceof E)) throw a;
        w(1, 0);
      }
    }
    function rn(e) {
      var r = T();
      try {
        return b(e)();
      } catch (t) {
        if (F(r), !(t instanceof E)) throw t;
        w(1, 0);
      }
    }
    function tn(e, r, t, n, i, a, s, c, l, u, v, h) {
      var m = T();
      try {
        return b(e)(r, t, n, i, a, s, c, l, u, v, h);
      } catch (_) {
        if (F(m), !(_ instanceof E)) throw _;
        w(1, 0);
      }
    }
    function nn(e, r, t, n, i, a, s, c, l, u, v) {
      var h = T();
      try {
        b(e)(r, t, n, i, a, s, c, l, u, v);
      } catch (m) {
        if (F(h), !(m instanceof E)) throw m;
        w(1, 0);
      }
    }
    function on(e, r, t, n, i, a, s, c, l, u, v, h, m, _, S, O) {
      var H = T();
      try {
        b(e)(r, t, n, i, a, s, c, l, u, v, h, m, _, S, O);
      } catch (x) {
        if (F(H), !(x instanceof E)) throw x;
        w(1, 0);
      }
    }
    var Rr;
    function an() {
      wr(), xe();
    }
    function nr() {
      if (_e > 0) {
        Oe = nr;
        return;
      }
      if (an(), Le(), _e > 0) {
        Oe = nr;
        return;
      }
      function e() {
        var _a2;
        f(!Rr), Rr = true, d.calledRun = true, !de && (Ue(), he == null ? void 0 : he(d), (_a2 = d.onRuntimeInitialized) == null ? void 0 : _a2.call(d), se("onRuntimeInitialized"), f(!d._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'), Be());
      }
      d.setStatus ? (d.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => d.setStatus(""), 1), e();
      }, 1)) : e(), V();
    }
    var we;
    we = await Cr(), nr(), re ? W = d : W = new Promise((e, r) => {
      he = e, pe = r;
    });
    for (const e of Object.keys(d)) e in Y || Object.defineProperty(Y, e, {
      configurable: true,
      get() {
        k(`Access to module property ('${e}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
      }
    });
    return W;
  }
  const R = await dn();
  fn = function(Y, W, d, M) {
    if (Y.length === 0) return;
    const P = [], j = J(Y.flat(), Float64Array, R.HEAPF64);
    P.push(j);
    const $ = W.flat(), C = J($, Uint32Array, R.HEAPU32);
    P.push(C);
    const ne = W.map((y) => y.length), U = J(ne, Uint32Array, R.HEAPU32);
    P.push(U);
    const G = d.supports ? Array.from(d.supports.keys()) : [], ke = d.supports ? Array.from(d.supports.values()).flat().map((y) => y ? 1 : 0) : [], oe = J(G, Uint32Array, R.HEAPU32);
    P.push(oe);
    const I = J(ke, Uint8Array, R.HEAPU8);
    P.push(I);
    const K = d.loads ? Array.from(d.loads.keys()) : [], q = d.loads ? Array.from(d.loads.values()).flat() : [], D = J(K, Uint32Array, R.HEAPU32);
    P.push(D);
    const ie = J(q, Float64Array, R.HEAPF64);
    P.push(ie);
    const de = d.springs ? Array.from(d.springs.keys()) : [], f = d.springs ? Array.from(d.springs.values()).flat() : [], ae = J(de, Uint32Array, R.HEAPU32);
    P.push(ae);
    const xe = J(f, Float64Array, R.HEAPF64);
    P.push(xe);
    const V = (y) => {
      const Z = y ? Array.from(y.keys()) : [], Ye = y ? Array.from(y.values()) : [], ze = J(Z, Uint32Array, R.HEAPU32);
      P.push(ze);
      const He = J(Ye, Float64Array, R.HEAPF64);
      return P.push(He), {
        keysPtr: ze,
        valuesPtr: He,
        size: Z.length
      };
    }, E = V(M.elasticities), fe = V(M.elasticitiesOrthogonal), se = V(M.areas), N = V(M.momentsOfInertiaZ), Fe = V(M.momentsOfInertiaY), Te = V(M.shearModuli), be = V(M.torsionalConstants), ve = V(M.thicknesses), he = V(M.poissonsRatios), pe = R._malloc(4);
    P.push(pe);
    const B = R._malloc(4);
    P.push(B);
    const ee = R._malloc(4);
    P.push(ee);
    const ce = R._malloc(4);
    P.push(ce), R._deform(j, Y.length, C, $.length, U, W.length, oe, I, G.length, D, ie, K.length, E.keysPtr, E.valuesPtr, E.size, se.keysPtr, se.valuesPtr, se.size, N.keysPtr, N.valuesPtr, N.size, Fe.keysPtr, Fe.valuesPtr, Fe.size, Te.keysPtr, Te.valuesPtr, Te.size, be.keysPtr, be.valuesPtr, be.size, ve.keysPtr, ve.valuesPtr, ve.size, he.keysPtr, he.valuesPtr, he.size, fe.keysPtr, fe.valuesPtr, fe.size, ae, xe, de.length, pe, B, ee, ce);
    const p = R.HEAPU32[pe / 4], z = R.HEAPU32[B / 4], re = R.HEAPU32[ee / 4], Pe = R.HEAPU32[ce / 4], Le = new Float64Array(R.HEAPF64.buffer, p, z), Ue = new Float64Array(R.HEAPF64.buffer, re, Pe), Be = /* @__PURE__ */ new Map();
    for (let y = 0; y < z; y += 7) {
      const Z = Le[y];
      Be.set(Z, Array.from(Le.slice(y + 1, y + 7)));
    }
    const k = /* @__PURE__ */ new Map();
    for (let y = 0; y < Pe; y += 7) {
      const Z = Ue[y];
      k.set(Z, Array.from(Ue.slice(y + 1, y + 7)));
    }
    return p && P.push(p), re && P.push(re), P.forEach((y) => R._free(y)), {
      deformations: Be,
      reactions: k
    };
  };
  function J(Y, W, d) {
    const M = new W(Y), P = R._malloc(M.length * M.BYTES_PER_ELEMENT);
    return d.set(M, P / M.BYTES_PER_ELEMENT), P;
  }
})();
export {
  ln as _,
  __tla,
  fn as d
};
