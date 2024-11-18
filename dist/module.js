"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/semver/internal/constants.js
  var require_constants = __commonJS({
    "node_modules/semver/internal/constants.js"(exports, module) {
      var SEMVER_SPEC_VERSION = "2.0.0";
      var MAX_LENGTH = 256;
      var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
      9007199254740991;
      var MAX_SAFE_COMPONENT_LENGTH = 16;
      var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
      var RELEASE_TYPES = [
        "major",
        "premajor",
        "minor",
        "preminor",
        "patch",
        "prepatch",
        "prerelease"
      ];
      module.exports = {
        MAX_LENGTH,
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_SAFE_INTEGER,
        RELEASE_TYPES,
        SEMVER_SPEC_VERSION,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2
      };
    }
  });

  // node_modules/semver/internal/debug.js
  var require_debug = __commonJS({
    "node_modules/semver/internal/debug.js"(exports, module) {
      var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
      };
      module.exports = debug;
    }
  });

  // node_modules/semver/internal/re.js
  var require_re = __commonJS({
    "node_modules/semver/internal/re.js"(exports, module) {
      var {
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_LENGTH
      } = require_constants();
      var debug = require_debug();
      exports = module.exports = {};
      var re = exports.re = [];
      var safeRe = exports.safeRe = [];
      var src = exports.src = [];
      var t = exports.t = {};
      var R = 0;
      var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
      var safeRegexReplacements = [
        ["\\s", 1],
        ["\\d", MAX_LENGTH],
        [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
      ];
      var makeSafeRegex = (value) => {
        for (const [token, max] of safeRegexReplacements) {
          value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
        }
        return value;
      };
      var createToken = (name, value, isGlobal) => {
        const safe = makeSafeRegex(value);
        const index = R++;
        debug(name, index, value);
        t[name] = index;
        src[index] = value;
        re[index] = new RegExp(value, isGlobal ? "g" : void 0);
        safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
      };
      createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
      createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
      createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
      createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
      createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
      createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
      createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
      createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
      createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
      createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
      createToken("FULL", `^${src[t.FULLPLAIN]}$`);
      createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
      createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
      createToken("GTLT", "((?:<|>)?=?)");
      createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
      createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
      createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
      createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
      createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
      createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
      createToken("COERCERTL", src[t.COERCE], true);
      createToken("COERCERTLFULL", src[t.COERCEFULL], true);
      createToken("LONETILDE", "(?:~>?)");
      createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
      exports.tildeTrimReplace = "$1~";
      createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
      createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("LONECARET", "(?:\\^)");
      createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
      exports.caretTrimReplace = "$1^";
      createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
      createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
      createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
      createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
      exports.comparatorTrimReplace = "$1$2$3";
      createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
      createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
      createToken("STAR", "(<|>)?=?\\s*\\*");
      createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
      createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
    }
  });

  // node_modules/semver/internal/parse-options.js
  var require_parse_options = __commonJS({
    "node_modules/semver/internal/parse-options.js"(exports, module) {
      var looseOption = Object.freeze({ loose: true });
      var emptyOpts = Object.freeze({});
      var parseOptions = (options) => {
        if (!options) {
          return emptyOpts;
        }
        if (typeof options !== "object") {
          return looseOption;
        }
        return options;
      };
      module.exports = parseOptions;
    }
  });

  // node_modules/semver/internal/identifiers.js
  var require_identifiers = __commonJS({
    "node_modules/semver/internal/identifiers.js"(exports, module) {
      var numeric = /^[0-9]+$/;
      var compareIdentifiers = (a, b) => {
        const anum = numeric.test(a);
        const bnum = numeric.test(b);
        if (anum && bnum) {
          a = +a;
          b = +b;
        }
        return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
      };
      var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
      module.exports = {
        compareIdentifiers,
        rcompareIdentifiers
      };
    }
  });

  // node_modules/semver/classes/semver.js
  var require_semver = __commonJS({
    "node_modules/semver/classes/semver.js"(exports, module) {
      var debug = require_debug();
      var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
      var { safeRe: re, t } = require_re();
      var parseOptions = require_parse_options();
      var { compareIdentifiers } = require_identifiers();
      var SemVer = class _SemVer {
        constructor(version, options) {
          options = parseOptions(options);
          if (version instanceof _SemVer) {
            if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
              return version;
            } else {
              version = version.version;
            }
          } else if (typeof version !== "string") {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
          }
          if (version.length > MAX_LENGTH) {
            throw new TypeError(
              `version is longer than ${MAX_LENGTH} characters`
            );
          }
          debug("SemVer", version, options);
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
          }
          this.raw = version;
          this.major = +m[1];
          this.minor = +m[2];
          this.patch = +m[3];
          if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError("Invalid major version");
          }
          if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError("Invalid minor version");
          }
          if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError("Invalid patch version");
          }
          if (!m[4]) {
            this.prerelease = [];
          } else {
            this.prerelease = m[4].split(".").map((id) => {
              if (/^[0-9]+$/.test(id)) {
                const num = +id;
                if (num >= 0 && num < MAX_SAFE_INTEGER) {
                  return num;
                }
              }
              return id;
            });
          }
          this.build = m[5] ? m[5].split(".") : [];
          this.format();
        }
        format() {
          this.version = `${this.major}.${this.minor}.${this.patch}`;
          if (this.prerelease.length) {
            this.version += `-${this.prerelease.join(".")}`;
          }
          return this.version;
        }
        toString() {
          return this.version;
        }
        compare(other) {
          debug("SemVer.compare", this.version, this.options, other);
          if (!(other instanceof _SemVer)) {
            if (typeof other === "string" && other === this.version) {
              return 0;
            }
            other = new _SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
        }
        comparePre(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          let i = 0;
          do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug("prerelease compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        compareBuild(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          let i = 0;
          do {
            const a = this.build[i];
            const b = other.build[i];
            debug("build compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        // preminor will bump the version up to the next minor release, and immediately
        // down to pre-release. premajor and prepatch work the same way.
        inc(release, identifier, identifierBase) {
          switch (release) {
            case "premajor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "preminor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "prepatch":
              this.prerelease.length = 0;
              this.inc("patch", identifier, identifierBase);
              this.inc("pre", identifier, identifierBase);
              break;
            // If the input is a non-prerelease version, this acts the same as
            // prepatch.
            case "prerelease":
              if (this.prerelease.length === 0) {
                this.inc("patch", identifier, identifierBase);
              }
              this.inc("pre", identifier, identifierBase);
              break;
            case "major":
              if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case "minor":
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case "patch":
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            // This probably shouldn't be used publicly.
            // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
            case "pre": {
              const base = Number(identifierBase) ? 1 : 0;
              if (!identifier && identifierBase === false) {
                throw new Error("invalid increment argument: identifier is empty");
              }
              if (this.prerelease.length === 0) {
                this.prerelease = [base];
              } else {
                let i = this.prerelease.length;
                while (--i >= 0) {
                  if (typeof this.prerelease[i] === "number") {
                    this.prerelease[i]++;
                    i = -2;
                  }
                }
                if (i === -1) {
                  if (identifier === this.prerelease.join(".") && identifierBase === false) {
                    throw new Error("invalid increment argument: identifier already exists");
                  }
                  this.prerelease.push(base);
                }
              }
              if (identifier) {
                let prerelease = [identifier, base];
                if (identifierBase === false) {
                  prerelease = [identifier];
                }
                if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                  if (isNaN(this.prerelease[1])) {
                    this.prerelease = prerelease;
                  }
                } else {
                  this.prerelease = prerelease;
                }
              }
              break;
            }
            default:
              throw new Error(`invalid increment argument: ${release}`);
          }
          this.raw = this.format();
          if (this.build.length) {
            this.raw += `+${this.build.join(".")}`;
          }
          return this;
        }
      };
      module.exports = SemVer;
    }
  });

<<<<<<< HEAD
void main() {
    color = texture(uTexture, vTextureCoord);
}`;var R=class extends T{constructor(e){let t=d(e);if(!t)throw new D;super(void 0,tt,{uTexture:t})}};var z=class i{#r=[];#e="none";#i=null;#t=[];#c=[];#n=[];#o={bilinearwipe:this.#l.bind(this),clockwipe:this.#d.bind(this),diamondwipe:this.#m.bind(this),fade:this.#f.bind(this),firedissolve:this.#p.bind(this),linearwipe:this.#T.bind(this),macro:this.#g.bind(this),parallel:this.#I.bind(this),radialwipe:this.#S.bind(this),removeoverlay:this.#h.bind(this),spotlightwipe:this.#E.bind(this),textureswap:this.#x.bind(this),sound:this.#b.bind(this),video:this.#C.bind(this),wait:this.#w.bind(this)};#a={video:this.#N.bind(this)};constructor(e){try{if(e){let t=ee(e);if(!t)throw new x(e);this.#i=t}}catch(t){throw ui.notifications?.error(t.message),t}}get sequence(){return this.#t}static Cleanup(){Me()}static async SelectScene(){let e=await renderTemplate("/modules/battle-transitions/templates/scene-selector.hbs",{scenes:game.scenes?.contents.map(t=>({id:t.id,name:t.name}))});return Dialog.wait({title:s("BATTLETRANSITIONS.SCENESELECTOR.TITLE"),content:e,default:"ok",buttons:{cancel:{icon:"<i class='fas fa-times'></i>",label:s("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),callback:()=>null},ok:{icon:"<i class='fas fa-check'></i>",label:s("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),callback:t=>game.scenes?.get($(t).find("#scene").val())??null}}})}static TriggerForScene(e){let t=ee(e);if(!t)throw new x(typeof e=="string"?e:typeof e);let r=t.getFlag("battle-transitions","steps")??[];r.length&&L.transition(t.id??"",r)}bilinearWipe(e,t,r=1e3,n="transparent",o=this.#e){new B(e,t,n);let a=w(n);return this.#t.push({type:"bilinearwipe",duration:r,direction:e,radial:t,background:a,easing:o}),this}burn(e=1e3,t="transparent",r=1.3,n=this.#e){return new k(t,r),this.#t.push({type:"firedissolve",background:w(t),duration:e,burnSize:r,easing:n}),this}clockWipe(e,t,r=1e3,n="transparent",o=this.#e){return new H(e,t,n),this.#t.push({type:"clockwipe",duration:r,background:w(n),direction:t,clockdirection:e,easing:o}),this}diamondWipe(e,t=1e3,r="transparent",n=this.#e){return new F(e,r),this.#t.push({type:"diamondwipe",size:e,background:w(r),duration:t,easing:n}),this}async execute(e=!1,t,r){let n=null;try{if(!this.#i)throw new x("undefined");if(this.#i.id===canvas?.scene?.id)throw new pe;if(e){if(!t)throw new b(typeof t);n=await rt(),this.#n.push(...n.children),it(),r!==game.users?.current?.id?await de("canvasReady"):r===game.users?.current?.id&&await at(this.#i),nt(),ot(),await this.#u(t),await this.#s(t,n),Me(n)}else{if(!this.#i.canUserModify(game.users?.current??null,"update"))throw new le;L.transition(this.#i.id??"",t||this.#t)}}catch(o){ui.notifications?.error(o.message)}finally{n&&n.destroy()}}async#u(e){this.#r=[];for(let t of e)typeof this.#a[t.type]=="function"&&await this.#a[t.type](t)}fade(e,t="transparent",r=this.#e){return new M(t),this.#t.push({type:"fade",duration:e,background:w(t),easing:r}),this}linearWipe(e,t=1e3,r="transparent",n=this.#e){new X(e,r);let o=w(r);return this.#t.push({type:"linearwipe",duration:t,direction:e,background:o,easing:n}),this}macro(e){let t=Fe(e);if(!t)throw new q(typeof e=="string"?e:typeof e);return this.#t.push({type:"macro",macro:t.id}),this}parallel(...e){let t=[];for(let r of e){let n=new i;if(r(n)instanceof Promise)throw new ue;t.push(n.sequence)}return this.#t.push({type:"parallel",sequences:t}),this}radialWipe(e,t=1e3,r="transparent",n=this.#e){return new W(e,r),this.#t.push({type:"radialwipe",duration:t,radial:e,background:w(r),easing:n}),this}removeOverlay(){return this.#t.push({type:"removeoverlay"}),this}sound(e,t=100){return this.#t.push({type:"sound",file:typeof e=="string"?e:e.src,volume:t}),this}spotlightWipe(e,t,r=1e3,n="transparent",o=this.#e){return new U(e,t,n),this.#t.push({type:"spotlightwipe",direction:e,radial:t,duration:r,background:w(n),easing:o}),this}textureSwap(e){return new R(e),this.#t.push({type:"textureswap",texture:w(e)}),this}video(e,...t){let r=t.find(a=>typeof a=="number")??100,n=t.find(a=>typeof a=="boolean")??!1,o=t.find(a=>!(typeof a=="boolean"||typeof a=="number"))??"transparent";return this.#t.push({type:"video",file:e,volume:r,background:o,clear:n}),this}wait(e){return this.#t.push({type:"wait",duration:e}),this}async#l(e,t){let r=N(e.background),n=new B(e.direction,e.radial,r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#p(e,t){let r=new k(e.background,e.burnSize);Array.isArray(t.filters)?t.filters.push(r):t.filters=[r],await TweenMax.to(r.uniforms,{integrity:0,duration:e.duration/1e3,ease:e.easing||this.#e})}async#d(e,t){let r=N(e.background),n=new H(e.clockdirection,e.direction,r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#m(e,t){let r=N(e.background),n=new F(e.size,r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#f(e,t){let r=N(e.background),n=new M(r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#T(e,t){let r=N(e.background??l("transparent")),n=new X(e.direction,r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#g(e){let t=Fe(e.macro);if(!t)throw new q(e.macro);let r=t.execute();if(r instanceof Promise)await r;else return Promise.resolve()}async#I(e,t){await Promise.all(e.sequences.map(r=>this.#s(r,t)))}async#S(e,t){let r=N(e.background),n=new W(e.radial,r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#h(){return this.#n.forEach(e=>e.alpha=0),Promise.resolve()}async#s(e,t){for(let r of e){if(typeof this.#o[r.type]!="function")throw new b(r.type);let n=this.#o[r.type];typeof n=="function"&&await n(r,t)}}async#b(e){await foundry.audio.AudioHelper.preloadSound(e.file);let t=await foundry.audio.AudioHelper.play({src:e.file,volume:e.volume/100,autoplay:!0},!0);return this.#c.push(t),Promise.resolve()}async#E(e,t){let r=N(e.background),n=new U(e.direction,e.radial,r.baseTexture);Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],await TweenMax.to(n.uniforms,{progress:1,duration:e.duration/1e3,ease:e.easing||this.#e})}async#x(e,t){let r=N(e.texture),n=new R(r.baseTexture);return Array.isArray(t.filters)?t.filters.push(n):t.filters=[n],Promise.resolve()}async#C(e,t){let r=this.#r.find(c=>c.path===e.file)?.texture;if(!r)throw new oe(e.file);A("Texture:",r);let n=N(e.background),a=r.baseTexture.resource.source;return new Promise((c,m)=>{let E=new R(r.baseTexture),g=PIXI.Sprite.from(r),S=PIXI.Sprite.from(n),v=new PIXI.Container;v.addChild(S),S.width=window.innerWidth,S.height=window.innerHeight,v.addChild(g),g.width=window.innerWidth,g.height=window.innerHeight,g.filters=[E],a.currentTime=0,t.addChild(v),a.addEventListener("ended",()=>{e.clear&&setTimeout(()=>{g.destroy()},500),c()}),a.addEventListener("error",re=>{m(re.error)}),a.play()})}async#w(e){return new Promise(t=>{setTimeout(t,e.duration)})}async#N(e){A(`Preloading ${e.file}...`);let t=Date.now(),r=await PIXI.loadVideo.load(e.file);this.#r.push({path:e.file,texture:r}),A(`Video loaded in ${Date.now()-t}ms`)}};var Be=class{#r;transition(e,t){this.#r.executeForEveryone("transition.exec",e,t,game.users?.current?.id??"")}_execute(e,t,r){A("Executing transition chain:",t),new z(e).execute(!0,t,r)}register(e){A("Registering socket:",e),this.#r=e,e.register("transition.exec",this._execute.bind(this))}},L=new Be;function Je(i=256,e=256,t){let r=je(t),n=document.createElement("canvas"),o=n.getContext("2d");if(!o)throw new y;n.width=i,n.height=e;let a=o.createImageData(n.width,n.height),c=a.data;for(let m=0;m<n.height;m++)for(let E=0;E<n.width;E++){let g=r(E/32,m/32),S=(m*n.width+E)*4;c[S]=g*255,c[S+1]=g*255,c[S+2]=g*255,c[S+3]=255}return o.putImageData(a,0,0),PIXI.Texture.from(n)}function Ye(i,e,t){let r=document.createElement("canvas");r.width=i,r.height=1;let n=r.getContext("2d");if(!n)throw new y;let o=n.createLinearGradient(0,0,i,0),a=e??new PIXI.Color("white"),c=t??new PIXI.Color("black");return o.addColorStop(0,a.toHex()),o.addColorStop(1,c.toHex()),n.fillStyle=o,n.fillRect(0,0,i,1),PIXI.Texture.from(r)}function l(i){let e=document.createElement("canvas");e.width=1,e.height=1;let t=e.getContext("2d");if(!t)throw new y;let r=new PIXI.Color(i);return t.fillStyle=r.toHexa(),t.fillRect(0,0,1,1),PIXI.Texture.from(e)}async function de(i){return new Promise(e=>{Hooks.once(i,(...t)=>{e(t)})})}function s(i,e={}){return game.i18n?.format(i,e)??i}function me(){return game.release?.isNewer("12")??!1}function st(i){let e=atob(i.split(",")[1]),t=new Uint8Array(e.length);for(let r=0;r<t.length;r++)t[r]=e.charCodeAt(r);return t}function Dt(i){let e=st(i.toDataURL());return{width:i.width,height:i.height,buffer:e}}function Rt(i){let e=st(i);return{mimeType:i.split(";")[0].split(":")[1],buffer:e}}function w(i){if(typeof i=="string"&&i.startsWith("data:"))return Rt(i);if(typeof i=="string")return i;if(typeof i.src=="string")return i.src;if(typeof i.value<"u")return i.value;let t=i.baseTexture.resource;if(typeof t.data<"u")return{width:t.width,height:t.height,buffer:t.data};let r=t.source;if(r instanceof HTMLImageElement)return r.getAttribute("src");if(r instanceof HTMLCanvasElement)return Dt(r);throw console.error(i),new D}function _t(i){let e=btoa(String.fromCharCode.apply(null,i.buffer));return PIXI.Texture.from(`data:${i.mimeType};base64,${e}`)}function Pt(i){return PIXI.Texture.fromBuffer(i.buffer,i.width,i.height)}function N(i){if(typeof i=="string"){let r=d(i);if(r)return r}let e=i;if(e.buffer&&e.mimeType)return _t(e);let t=i;if(t.buffer&&t.width&&t.height)return Pt(t);throw new D}function A(...i){console.log(He,"Battle Transitions",...i)}function ct(i){i.push({name:"BATTLETRANSITIONS.NAVIGATION.TRIGGER",icon:'<i class="fas bt-icon fa-fw crossed-swords"></i>',condition:e=>{let t=game.scenes?.get(e.data("sceneId")),r=t?.getFlag("battle-transitions","steps")??[];return game.users?.current&&t?.canUserModify(game.users?.current,"update")&&!t.active&&r.length},callback:e=>{let t=e.data("sceneId");if(!t)throw new x(typeof t=="string"?t:typeof t);let r=game.scenes?.get(t);if(!(r instanceof Scene))throw new x(typeof t=="string"?t:typeof t);let n=r.getFlag("battle-transitions","steps")??[];n.length&&L.transition(t,n)}})}function f(){return{none:"BATTLETRANSITIONS.EASINGS.NONE",power1in:"BATTLETRANSITIONS.EASINGS.POWER1IN",power1out:"BATTLETRANSITIONS.EASINGS.POWER1OUT",power1inout:"BATTLETRANSITIONS.EASINGS.POWER1INOUT",power2in:"BATTLETRANSITIONS.EASINGS.POWER2IN",power2out:"BATTLETRANSITIONS.EASINGS.POWER2OUT",power2inout:"BATTLETRANSITIONS.EASINGS.POWER2INOUT",power3in:"BATTLETRANSITIONS.EASINGS.POWER3IN",power3out:"BATTLETRANSITIONS.EASINGS.POWER3OUT",power3inout:"BATTLETRANSITIONS.EASINGS.POWER3INOUT",power4in:"BATTLETRANSITIONS.EASINGS.POWER4IN",power4out:"BATTLETRANSITIONS.EASINGS.POWER4OUT",power4inout:"BATTLETRANSITIONS.EASINGS.POWER4INOUT",backin:"BATTLETRANSITIONS.EASINGS.BACKIN",backout:"BATTLETRANSITIONS.EASINGS.BACKOUT",backinout:"BATTLETRANSITIONS.EASINGS.BACKINOUT",bouncein:"BATTLETRANSITIONS.EASINGS.BOUNCEIN",bounceout:"BATTLETRANSITIONS.EASINGS.BOUNCEOUT",bounceinout:"BATTLETRANSITIONS.EASINGS.BOUNCEINOUT",circin:"BATTLETRANSITIONS.EASINGS.CIRCIN",circout:"BATTLETRANSITIONS.EASINGS.CIRCOUT",circinout:"BATTLETRANSITIONS.EASINGS.CIRCINOUT",elasticin:"BATTLETRANSITIONS.EASINGS.ELASTICIN",elasticout:"BATTLETRANSITIONS.EASINGS.ELASTICOUT",elasticinout:"BATTLETRANSITIONS.EASINGS.ELASTICINOUT",expoin:"BATTLETRANSITIONS.EASINGS.EXPOIN",expoout:"BATTLETRANSITIONS.EASINGS.EXPOOUT",expoinout:"BATTLETRANSITIONS.EASINGS.EXPOINOUT",sinein:"BATTLETRANSITIONS.EASINGS.SINEIN",sineout:"BATTLETRANSITIONS.EASINGS.SINEOUT",sineinout:"BATTLETRANSITIONS.EASINGS.SINEINOUT"}}function p(i,...e){let t=i.serializeArray(),r=e.reduce((n,o)=>({...n,[o]:t.reduce((a,c)=>c.name===o?o==="id"&&!c.value?foundry.utils.randomID():c.value:a,"")}),{});return console.log("Parsed:",r),r}var C=document.createElement("div");C.style.display="none";C.style.position="absolute";C.style.width="100%";C.style.height="100%";C.style.backgroundRepeat="no-repeat";C.id=ke;document.body.appendChild(C);var fe=null;function ut(){fe=new Y,canvas?.stage?.addChild(fe)}async function kt(){if(!canvas)throw new Z;if(!(canvas.app&&canvas.hidden&&canvas.primary&&canvas.tiles&&canvas.drawings&&canvas.scene&&canvas.stage))throw new ce;let i=window.innerWidth,e=window.innerHeight,t=canvas.app.renderer,r=PIXI.RenderTexture.create({width:i,height:e});t.render(canvas.stage,{renderTexture:r,skipUpdateTransform:!0,clear:!0});let n=document.getElementById(ke);if(!n)throw new se;n.style.backgroundImage="";let o=Date.now(),a=await t.extract.image(r),c=document.createElement("canvas"),m=c.getContext("2d");if(!m)throw new y;c.width=a.width,c.height=a.height,m.fillStyle=t.background.backgroundColor.toHex(),m.fillRect(0,0,c.width,c.height),m.drawImage(a,0,0);let E=c.toDataURL();return A(`Image transfered in ${Date.now()-o}ms`),n.style.backgroundImage=`url(${E})`,n.style.backgroundColor=t.background.backgroundColor.toHex(),n.style.display="block",PIXI.Sprite.from(r)}async function rt(){if(!fe)throw new y;let i=await kt(),e=new PIXI.Container,t=l(canvas?.app?.renderer.background.backgroundColor??"white"),r=new PIXI.Sprite(t);return r.width=window.innerWidth,r.height=window.innerHeight,e.addChild(r),e.addChild(i),fe.addChild(e),e}function Me(i){if(C.style.display="none",C.style.backgroundImage="",i){if(Array.isArray(i.children)&&i.children.length)for(let e=i.children.length-1;e>=0;e--)i.children[e].destroy();i.destroy()}}function it(){let i=document.getElementById("loading");i&&(i.style.opacity="0")}function nt(){let i=document.getElementById("loading");i&&i.style.removeProperty("opacity")}function ot(){C.style.display="none",C.style.removeProperty("backgroundImage")}async function at(i){let e=ee(i);if(!(e instanceof Scene))throw new x(typeof i=="string"?i:"[Object object]");return await e.setFlag("battle-transitions","autoTriggered",!0),e.activate(),await de("canvasReady"),e}function lt(){Handlebars.registerHelper("switch",function(i,e){this._switch_value_=i;let t=e.fn(this);return delete this._switch_value_,t}),Handlebars.registerHelper("case",function(i,e){if(i==this._switch_value_)return e.fn(this)})}async function pt(){return loadTemplates(["/modules/battle-transitions/templates/scene-config.hbs",...["add-step","fade-config","linearwipe-config","step-item"].map(i=>`/modules/battle-transitions/templates/config/${i}.hbs`)])}var Te=class{get key(){return"fade"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.FADE"}defaultSettings={duration:1e3,background:"#00000000"};generateSummary(e){return e?[s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:e.duration}),e.background].join("; "):""}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/fade-config.hbs",{...this.defaultSettings,...e,easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","background","easing")}}};var ge=class{defaultSettings={duration:1e3,background:"#00000000",direction:"left"};generateSummary(e){let t={...this.defaultSettings,...e};return[t.direction,t.duration,t.background].join("; ")}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/linearwipe-config.hbs",{...this.defaultSettings,...e,directionSelect:{top:"BATTLETRANSITIONS.DIRECTIONS.TOP",left:"BATTLETRANSITIONS.DIRECTIONS.LEFT",right:"BATTLETRANSITIONS.DIRECTIONS.RIGHT",bottom:"BATTLETRANSITIONS.DIRECTIONS.BOTTOM",topleft:"BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",topright:"BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT",bottomleft:"BATTLETRANSITIONS.DIRECTIONS.BOTTOMLEFT",bottomright:"BATTLETRANSITIONS.DIRECTIONS.BOTTOMRIGHT"},easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","direction","background","easing")}}get key(){return"linearwipe"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.LINEARWIPE"}};var Ie=class{get key(){return"bilinearwipe"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.BILINEARWIPE"}defaultSettings={duration:1e3,direction:"horizontal",radial:"inside",background:"#00000000"};generateSummary(e){return e?[s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:e.duration}),e.direction,e.radial,e.background].join("; "):""}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/bilinear-wipe-config.hbs",{...this.defaultSettings,...e,directionSelect:{horizontal:"BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",vertical:"BATTLETRANSITIONS.DIRECTIONS.VERTICAL",topleft:"BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",topright:"BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"},radialSelect:{inside:"BATTLETRANSITIONS.DIRECTIONS.INSIDE",outside:"BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"},easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"duration","background","direction","radial","easing","id")}}};var Se=class{get key(){return"chromakey"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.CHROMAKEY"}defaultSettings={keyColor:"#00b140",background:"#00000000"};generateSummary(e){let t={...this.defaultSettings,...e};return[t.keyColor,t.background].join("; ")}async renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/chromakey-config.hbs",{...this.defaultSettings,...e})}createFlagFromHTML(e){let t=$(e).find("form").serializeArray(),r=t.find(o=>o.name==="key-color"),n=t.find(o=>o.name==="background");return{...this.defaultSettings,...r?{keyColor:r.value}:{},...n?{background:n.value}:{}}}};var he=class{get key(){return"clockwipe"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.CLOCKWIPE"}defaultSettings={direction:"top",clockdirection:"clockwise",duration:1e3,background:"#00000000"};generateSummary(e){let t={...this.defaultSettings,...e};return[t.clockdirection,t.direction,s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:t.duration}),t.background].join("; ")}async renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/clockwipe-config.hbs",{...this.defaultSettings,...e,directionSelect:{top:"BATTLETRANSITIONS.DIRECTIONS.TOP",left:"BATTLETRANSITIONS.DIRECTIONS.LEFT",right:"BATTLETRANSITIONS.DIRECTIONS.RIGHT",bottom:"BATTLETRANSITIONS.DIRECTIONS.BOTTOM"},clockDirectionSelect:{clockwise:"BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",counterclockwise:"BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"},easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","direction","background","clockdirection","easing")}}};var be=class{get key(){return"diamondwipe"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.DIAMOND"}defaultSettings={duration:1e3,size:40,background:"#00000000"};generateSummary(e){let t={...this.defaultSettings,...e};return[s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:t.duration}),s("BATTLETRANSITIONS.FORMATTERS.PIXELS",{value:t.size}),t.background].join("; ")}async renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/diamond-config.hbs",{...this.defaultSettings,...e,easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","size","easing")}}};var Ee=class{get key(){return"firedissolve"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.FIREDISSOLVE"}defaultSettings={duration:1e3,background:"#00000000",burnSize:1.3};generateSummary(e){let t={...this.defaultSettings,...e};return[s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:t.duration}),t.background].join("; ")}async renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/fire-dissolve-config.hbs",{...this.defaultSettings,...e,easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","background","burnsize","easing")}}};var xe=class{get key(){return"radialwipe"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.RADIALWIPE"}defaultSettings={duration:1e3,background:"#00000000",radial:"inside"};generateSummary(e){let t={...this.defaultSettings,...e};return[s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:t.duration}),t.radial,t.background].join("; ")}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/radial-wipe-config.hbs",{...e,radialOptions:{inside:"BATTLETRANSITIONS.DIRECTIONS.INSIDE",outside:"BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"},easingSelect:f()})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","radial","background","easing")}}};var Ce=class{get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.SPOTLIGHTWIPE"}get key(){return"spotlightwipe"}defaultSettings={duration:1e3,background:"#00000000",direction:"top",radial:"outside"};generateSummary(e){let t={...this.defaultSettings,...e};return[s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:t.duration}),t.direction,t.radial,t.background].join("; ")}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration","direction","radial","background","easing")}}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/spotlight-wipe-config.hbs",{...e,directionSelect:{top:"BATTLETRANSITIONS.DIRECTIONS.TOP",left:"BATTLETRANSITIONS.DIRECTIONS.LEFT",right:"BATTLETRANSITIONS.DIRECTIONS.RIGHT",bottom:"BATTLETRANSITIONS.DIRECTIONS.BOTTOM"},radialSelect:{inside:"BATTLETRANSITIONS.DIRECTIONS.INSIDE",outside:"BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"},easingSelect:f()})}};var we=class{get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.TEXTURESWAP"}get key(){return"textureswap"}defaultSettings={texture:""};generateSummary(e){return[{...this.defaultSettings,...e}.texture.split("/").slice(-1)].join("; ")}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/texture-swap-config.hbs",{...this.defaultSettings,...e})}createFlagFromHTML(e){let r=$(e).find("form").serializeArray().find(o=>o.name==="id"),n=$(e).find("form #texture").val()??"";return{...this.defaultSettings,texture:n,id:r?r.value:foundry.utils.randomID()}}};var Ne=class{get key(){return"wait"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.WAIT"}defaultSettings={duration:1e3};generateSummary(e){let t={...this.defaultSettings,...e};return s("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS",{value:t.duration})}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/wait-config.hbs",{...this.defaultSettings,...e})}createFlagFromHTML(e){return{...this.defaultSettings,...p($(e).find("form"),"id","duration")}}};var ye=class{get key(){return"sound"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.SOUND"}defaultSettings={file:"",volume:100};generateSummary(e){let t={...this.defaultSettings,...e};return[t.file.split("/").slice(-1),s("BATTLETRANSITIONS.FORMATTERS.PERCENT",{value:t.volume*100})].join("; ")}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/sound-config.hbs",{...this.defaultSettings,...e})}createFlagFromHTML(e){let t=$(e).find("form").serializeArray(),r=$(e).find("form #file").val()??"",n=t.find(a=>a.name==="volume"),o=t.find(a=>a.name==="id");return{...this.defaultSettings,...r?{file:r}:{},...n?{volume:parseFloat(n.value)}:{},id:o?o.value:foundry.utils.randomID()}}};var Ae=class{get key(){return"video"}get name(){return"BATTLETRANSITIONS.TRANSITIONTYPES.VIDEO"}defaultSettings={file:"",background:"#00000000",volume:1};generateSummary(e){let t={...this.defaultSettings,...e};return[t.file.split("/").splice(-1),s("BATTLETRANSITIONS.FORMATTERS.PERCENT",{value:t.volume*100})].join("; ")}renderTemplate(e){return renderTemplate("/modules/battle-transitions/templates/config/video-config.hbs",{...this.defaultSettings,...e,volume:(e?.volume!==void 0?e.volume:this.defaultSettings.volume)*100})}createFlagFromHTML(e){let t=$(e).find("form #file").val()??"",r=$(e).find("form #volume input[type='number']").val();return{...this.defaultSettings,...t?{file:t}:{},...r?{volume:r/100}:{},...p($(e).find("form"),"id","background")}}};new Se;var G=[new Te,new ge,new Ie,new he,new be,new Ee,new xe,new Ce,new we,new Ne,new ye,new Ae].sort((i,e)=>s(i.name).localeCompare(s(e.name))),Oe=class{#r;#e;#i=null;stepKey="steps";configKey="config";tabName="battle-transitions";icon=["fas","crossed-swords","fa-fw","bt-icon"];get appId(){return this.#r.appId}get rootElement(){return $(this.#r.element)}get addStepDialogElement(){return this.#i?$(this.#i.element):null}updateConfiguration(){let e=[];this.rootElement.find(".step-config-item[data-transition-type]").each((n,o)=>{let a=$(o).data("flag"),c=$(o).data("transition-type");if(!c||typeof c!="string"||typeof a!="object")throw new b("");e.push({...a,type:c})});let r={autoTrigger:this.rootElement.find('[data-tab="battle-transitions"]').find("input#auto-trigger").is(":checked")};Promise.all([this.#e.setFlag("battle-transitions",this.stepKey,e),this.#e.setFlag("battle-transitions",this.configKey,r)])}addEventListeners(){this.rootElement.find("button[data-action='add-step']").on("click",e=>{if($(e.currentTarget).is(":visible"))return this.onAddStep(e)}),this.rootElement.find("#transition-step-list").sortable({handle:".drag-handle",containment:"parent",axis:"y"}),this.rootElement.find("button[type='submit']").on("click",()=>{this.updateConfiguration()}),ColorPicker.install()}onAddStep(e){e.preventDefault(),me()&&foundry.applications.api.DialogV2?this.addStepDialogV2():this.addStepDialog()}resizeDialog(){this.rootElement.find(".item.active[data-tab]").data("tab")===this.tabName&&(this.#r.activateTab("basic"),this.#r.activateTab(this.tabName))}addStepEventListeners(e,t={}){e.find("[data-action='remove']").on("click",()=>{let r=e.data("transition-type")??"",n=G.find(o=>o.key===r);if(!n)throw new b(r);me()&&foundry.applications.api.DialogV2?foundry.applications.api.DialogV2.confirm({content:s("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM",{name:s(n.name)})}).then(o=>{o&&(e.remove(),this.resizeDialog())}):Dialog.confirm({content:s("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM",{name:s(n.name)})}).then(o=>{o&&(e.remove(),this.resizeDialog())})}),e.find("[data-action='configure']").on("click",()=>{let r=e.data("transition-type")??"",n=G.find(a=>a.key===r);if(!n)throw new b(r);let o=e.data("flag")??n.defaultSettings;this.configureStep(r,o)})}addConfigureStepEventListeners(e,t={}){e.find("input[type='text'],input[type='number']").on("focus",r=>{r.currentTarget.select()}),ColorPicker.install()}async configureStep(e,t={}){let r=G.find(o=>o.key===e);if(!r)throw new b(e);let n=await r.renderTemplate(t);me()&&foundry.applications.api.DialogV2?foundry.applications.api.DialogV2.wait({window:{title:s("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE",{name:s(r.name)})},content:n,render:(o,a)=>{this.addConfigureStepEventListeners($(a),t)},buttons:[{label:"<i class='fas fa-times'></i> "+s("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),action:"cancel"},{label:"<i class='fas fa-check'></i> "+s("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),action:"ok",default:!0,callback:async(o,a,c)=>{let m=r.createFlagFromHTML($(c));this.addUpdateTransitionStep(e,m)}}]}):await Dialog.wait({title:s("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE",{name:s(r.name)}),content:n,render:o=>{this.addConfigureStepEventListeners(o,t)},default:"ok",buttons:{cancel:{icon:"<i class='fas fa-times'></i>",label:s("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")},ok:{icon:"<i class='fas fa-check'></i>",label:s("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),callback:o=>{let a=r.createFlagFromHTML(o);this.addUpdateTransitionStep(e,a)}}}})}async addUpdateTransitionStep(e,t={}){let r=G.find(c=>c.key===e);if(!r)throw new b(e);t.id||(t.id=foundry.utils.randomID());let n=await renderTemplate("/modules/battle-transitions/templates/config/step-item.hbs",{...t??{},name:s(r?.name),summary:r.generateSummary(t),type:e,flag:JSON.stringify(t)}),o=$(n),a=this.rootElement.find(`[data-id="${t.id}"]`);a.length?a.replaceWith(o):this.rootElement.find("#transition-step-list").append(o),this.addStepEventListeners(o,t),this.resizeDialog(),ColorPicker.install()}async getRenderedDialogTemplate(){return renderTemplate("/modules/battle-transitions/templates/config/add-step.hbs",{transitionTypes:G.map(e=>({key:e.key,name:e.name}))})}onAddStepDialogRender(){if(!this.addStepDialogElement)throw new ae;this.addStepDialogElement.find("#add-step-form button[data-transition]").on("click",e=>{e.preventDefault();let t=e.currentTarget.dataset.transition??"";this.#i?.close();let r=G.find(n=>n.key===t);if(!r)throw new b(t);this.configureStep(t,r.defaultSettings)})}async addStepDialog(){let e=await this.getRenderedDialogTemplate(),t=new Dialog({title:s("BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE"),content:e,render:()=>{this.onAddStepDialogRender()},buttons:{cancel:{label:s("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),icon:"<i class='fas fa-times'></i>"}}});this.#i=t,t.render(!0)}async addStepDialogV2(){let e=await this.getRenderedDialogTemplate();foundry.applications.api.DialogV2.wait({window:{title:"BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE"},rejectClose:!1,render:t=>{this.#i=t.target,this.onAddStepDialogRender()},content:e,buttons:[{label:"<i class='fas fa-times'></i> "+s("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),action:"cancel"}]}).then(t=>t==="cancel"?null:t)}async inject(){return game.release?.isNewer("12")?this.injectV12():this.injectV11()}async injectV11(){let e=this.rootElement.find("nav.sheet-tabs.tabs"),t=document.createElement("a");t.classList.add("item"),t.dataset.tab=this.tabName;let r=document.createElement("i");r.classList.add(...this.icon),t.appendChild(r),t.innerHTML+=" "+s("BATTLETRANSITIONS.SCENECONFIG.TAB"),e.append(t);let n=this.#e.getFlag("battle-transitions",this.configKey),o=await renderTemplate("/modules/battle-transitions/templates/scene-config.hbs",n);this.rootElement.find("button[type='submit']").before(`<div class="tab" data-tab="${this.tabName}">${o}</div>`);let a=this.#e.getFlag("battle-transitions",this.stepKey);if(Array.isArray(a))for(let c of a)await this.addUpdateTransitionStep(c.type,c);this.addEventListeners()}async injectV12(){let e=this.rootElement.find("nav.sheet-tabs.tabs[data-group='main']"),t=document.createElement("a");t.classList.add("item"),t.dataset.tab=this.tabName;let r=document.createElement("i");r.classList.add(...this.icon),t.appendChild(r),t.innerHTML+=" "+s("BATTLETRANSITIONS.SCENECONFIG.TAB"),e.append(t);let n=this.#e.getFlag("battle-transitions",this.configKey),o=await renderTemplate("/modules/battle-transitions/templates/scene-config.hbs",n);this.rootElement.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${this.tabName}">${o}</div>`);let a=this.#e.getFlag("battle-transitions",this.stepKey);if(Array.isArray(a))for(let c of a)await this.addUpdateTransitionStep(c.type,c);this.addEventListeners()}constructor(e,t){this.#r=e,this.#e=t,this.inject()}};window.BattleTransition=z;Hooks.once("canvasReady",()=>{ut(),Hooks.callAll(Ue.INITIALIZE)});Hooks.on("renderSceneConfig",i=>{new Oe(i,i.object)});Hooks.once("init",async()=>{lt(),await pt()});Hooks.once("socketlib.ready",()=>{L.register(socketlib.registerModule("battle-transitions"))});Hooks.on("getSceneNavigationContext",(i,e)=>{ct(e)});Hooks.on("preUpdateScene",(i,e,t,r)=>{if(e.active&&!(i.getFlag("battle-transitions","autoTriggered")??!1)){let n=i.getFlag("battle-transitions","config"),o=i.getFlag("battle-transitions","steps");n?.autoTrigger&&o?.length&&(e.active=!1,L.transition(i.id,o))}});Hooks.on("updateScene",async(i,e,t,r)=>{e.active&&(i.getFlag("battle-transitions","autoTriggered")??!1)&&i.canUserModify(game.users?.current,"update")&&await i.setFlag("battle-transitions","autoTriggered",!1)});})();
=======
  // node_modules/semver/functions/parse.js
  var require_parse = __commonJS({
    "node_modules/semver/functions/parse.js"(exports, module) {
      var SemVer = require_semver();
      var parse = (version, options, throwErrors = false) => {
        if (version instanceof SemVer) {
          return version;
        }
        try {
          return new SemVer(version, options);
        } catch (er) {
          if (!throwErrors) {
            return null;
          }
          throw er;
        }
      };
      module.exports = parse;
    }
  });

  // node_modules/semver/functions/valid.js
  var require_valid = __commonJS({
    "node_modules/semver/functions/valid.js"(exports, module) {
      var parse = require_parse();
      var valid = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
      };
      module.exports = valid;
    }
  });

  // node_modules/semver/functions/clean.js
  var require_clean = __commonJS({
    "node_modules/semver/functions/clean.js"(exports, module) {
      var parse = require_parse();
      var clean = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ""), options);
        return s ? s.version : null;
      };
      module.exports = clean;
    }
  });

  // node_modules/semver/functions/inc.js
  var require_inc = __commonJS({
    "node_modules/semver/functions/inc.js"(exports, module) {
      var SemVer = require_semver();
      var inc = (version, release, options, identifier, identifierBase) => {
        if (typeof options === "string") {
          identifierBase = identifier;
          identifier = options;
          options = void 0;
        }
        try {
          return new SemVer(
            version instanceof SemVer ? version.version : version,
            options
          ).inc(release, identifier, identifierBase).version;
        } catch (er) {
          return null;
        }
      };
      module.exports = inc;
    }
  });

  // node_modules/semver/functions/diff.js
  var require_diff = __commonJS({
    "node_modules/semver/functions/diff.js"(exports, module) {
      var parse = require_parse();
      var diff = (version1, version2) => {
        const v1 = parse(version1, null, true);
        const v2 = parse(version2, null, true);
        const comparison = v1.compare(v2);
        if (comparison === 0) {
          return null;
        }
        const v1Higher = comparison > 0;
        const highVersion = v1Higher ? v1 : v2;
        const lowVersion = v1Higher ? v2 : v1;
        const highHasPre = !!highVersion.prerelease.length;
        const lowHasPre = !!lowVersion.prerelease.length;
        if (lowHasPre && !highHasPre) {
          if (!lowVersion.patch && !lowVersion.minor) {
            return "major";
          }
          if (highVersion.patch) {
            return "patch";
          }
          if (highVersion.minor) {
            return "minor";
          }
          return "major";
        }
        const prefix = highHasPre ? "pre" : "";
        if (v1.major !== v2.major) {
          return prefix + "major";
        }
        if (v1.minor !== v2.minor) {
          return prefix + "minor";
        }
        if (v1.patch !== v2.patch) {
          return prefix + "patch";
        }
        return "prerelease";
      };
      module.exports = diff;
    }
  });

  // node_modules/semver/functions/major.js
  var require_major = __commonJS({
    "node_modules/semver/functions/major.js"(exports, module) {
      var SemVer = require_semver();
      var major = (a, loose) => new SemVer(a, loose).major;
      module.exports = major;
    }
  });

  // node_modules/semver/functions/minor.js
  var require_minor = __commonJS({
    "node_modules/semver/functions/minor.js"(exports, module) {
      var SemVer = require_semver();
      var minor = (a, loose) => new SemVer(a, loose).minor;
      module.exports = minor;
    }
  });

  // node_modules/semver/functions/patch.js
  var require_patch = __commonJS({
    "node_modules/semver/functions/patch.js"(exports, module) {
      var SemVer = require_semver();
      var patch = (a, loose) => new SemVer(a, loose).patch;
      module.exports = patch;
    }
  });

  // node_modules/semver/functions/prerelease.js
  var require_prerelease = __commonJS({
    "node_modules/semver/functions/prerelease.js"(exports, module) {
      var parse = require_parse();
      var prerelease = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      };
      module.exports = prerelease;
    }
  });

  // node_modules/semver/functions/compare.js
  var require_compare = __commonJS({
    "node_modules/semver/functions/compare.js"(exports, module) {
      var SemVer = require_semver();
      var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
      module.exports = compare;
    }
  });

  // node_modules/semver/functions/rcompare.js
  var require_rcompare = __commonJS({
    "node_modules/semver/functions/rcompare.js"(exports, module) {
      var compare = require_compare();
      var rcompare = (a, b, loose) => compare(b, a, loose);
      module.exports = rcompare;
    }
  });

  // node_modules/semver/functions/compare-loose.js
  var require_compare_loose = __commonJS({
    "node_modules/semver/functions/compare-loose.js"(exports, module) {
      var compare = require_compare();
      var compareLoose = (a, b) => compare(a, b, true);
      module.exports = compareLoose;
    }
  });

  // node_modules/semver/functions/compare-build.js
  var require_compare_build = __commonJS({
    "node_modules/semver/functions/compare-build.js"(exports, module) {
      var SemVer = require_semver();
      var compareBuild = (a, b, loose) => {
        const versionA = new SemVer(a, loose);
        const versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
      };
      module.exports = compareBuild;
    }
  });

  // node_modules/semver/functions/sort.js
  var require_sort = __commonJS({
    "node_modules/semver/functions/sort.js"(exports, module) {
      var compareBuild = require_compare_build();
      var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
      module.exports = sort;
    }
  });

  // node_modules/semver/functions/rsort.js
  var require_rsort = __commonJS({
    "node_modules/semver/functions/rsort.js"(exports, module) {
      var compareBuild = require_compare_build();
      var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
      module.exports = rsort;
    }
  });

  // node_modules/semver/functions/gt.js
  var require_gt = __commonJS({
    "node_modules/semver/functions/gt.js"(exports, module) {
      var compare = require_compare();
      var gt = (a, b, loose) => compare(a, b, loose) > 0;
      module.exports = gt;
    }
  });

  // node_modules/semver/functions/lt.js
  var require_lt = __commonJS({
    "node_modules/semver/functions/lt.js"(exports, module) {
      var compare = require_compare();
      var lt = (a, b, loose) => compare(a, b, loose) < 0;
      module.exports = lt;
    }
  });

  // node_modules/semver/functions/eq.js
  var require_eq = __commonJS({
    "node_modules/semver/functions/eq.js"(exports, module) {
      var compare = require_compare();
      var eq = (a, b, loose) => compare(a, b, loose) === 0;
      module.exports = eq;
    }
  });

  // node_modules/semver/functions/neq.js
  var require_neq = __commonJS({
    "node_modules/semver/functions/neq.js"(exports, module) {
      var compare = require_compare();
      var neq = (a, b, loose) => compare(a, b, loose) !== 0;
      module.exports = neq;
    }
  });

  // node_modules/semver/functions/gte.js
  var require_gte = __commonJS({
    "node_modules/semver/functions/gte.js"(exports, module) {
      var compare = require_compare();
      var gte = (a, b, loose) => compare(a, b, loose) >= 0;
      module.exports = gte;
    }
  });

  // node_modules/semver/functions/lte.js
  var require_lte = __commonJS({
    "node_modules/semver/functions/lte.js"(exports, module) {
      var compare = require_compare();
      var lte = (a, b, loose) => compare(a, b, loose) <= 0;
      module.exports = lte;
    }
  });

  // node_modules/semver/functions/cmp.js
  var require_cmp = __commonJS({
    "node_modules/semver/functions/cmp.js"(exports, module) {
      var eq = require_eq();
      var neq = require_neq();
      var gt = require_gt();
      var gte = require_gte();
      var lt = require_lt();
      var lte = require_lte();
      var cmp = (a, op, b, loose) => {
        switch (op) {
          case "===":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a === b;
          case "!==":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a !== b;
          case "":
          case "=":
          case "==":
            return eq(a, b, loose);
          case "!=":
            return neq(a, b, loose);
          case ">":
            return gt(a, b, loose);
          case ">=":
            return gte(a, b, loose);
          case "<":
            return lt(a, b, loose);
          case "<=":
            return lte(a, b, loose);
          default:
            throw new TypeError(`Invalid operator: ${op}`);
        }
      };
      module.exports = cmp;
    }
  });

  // node_modules/semver/functions/coerce.js
  var require_coerce = __commonJS({
    "node_modules/semver/functions/coerce.js"(exports, module) {
      var SemVer = require_semver();
      var parse = require_parse();
      var { safeRe: re, t } = require_re();
      var coerce = (version, options) => {
        if (version instanceof SemVer) {
          return version;
        }
        if (typeof version === "number") {
          version = String(version);
        }
        if (typeof version !== "string") {
          return null;
        }
        options = options || {};
        let match = null;
        if (!options.rtl) {
          match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
        } else {
          const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
          let next;
          while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
            if (!match || next.index + next[0].length !== match.index + match[0].length) {
              match = next;
            }
            coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
          }
          coerceRtlRegex.lastIndex = -1;
        }
        if (match === null) {
          return null;
        }
        const major = match[2];
        const minor = match[3] || "0";
        const patch = match[4] || "0";
        const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
        const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
        return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
      };
      module.exports = coerce;
    }
  });

  // node_modules/semver/internal/lrucache.js
  var require_lrucache = __commonJS({
    "node_modules/semver/internal/lrucache.js"(exports, module) {
      var LRUCache = class {
        constructor() {
          this.max = 1e3;
          this.map = /* @__PURE__ */ new Map();
        }
        get(key) {
          const value = this.map.get(key);
          if (value === void 0) {
            return void 0;
          } else {
            this.map.delete(key);
            this.map.set(key, value);
            return value;
          }
        }
        delete(key) {
          return this.map.delete(key);
        }
        set(key, value) {
          const deleted = this.delete(key);
          if (!deleted && value !== void 0) {
            if (this.map.size >= this.max) {
              const firstKey = this.map.keys().next().value;
              this.delete(firstKey);
            }
            this.map.set(key, value);
          }
          return this;
        }
      };
      module.exports = LRUCache;
    }
  });

  // node_modules/semver/classes/range.js
  var require_range = __commonJS({
    "node_modules/semver/classes/range.js"(exports, module) {
      var SPACE_CHARACTERS = /\s+/g;
      var Range = class _Range {
        constructor(range, options) {
          options = parseOptions(options);
          if (range instanceof _Range) {
            if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
              return range;
            } else {
              return new _Range(range.raw, options);
            }
          }
          if (range instanceof Comparator) {
            this.raw = range.value;
            this.set = [[range]];
            this.formatted = void 0;
            return this;
          }
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
          this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
          if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
          }
          if (this.set.length > 1) {
            const first = this.set[0];
            this.set = this.set.filter((c) => !isNullSet(c[0]));
            if (this.set.length === 0) {
              this.set = [first];
            } else if (this.set.length > 1) {
              for (const c of this.set) {
                if (c.length === 1 && isAny(c[0])) {
                  this.set = [c];
                  break;
                }
              }
            }
          }
          this.formatted = void 0;
        }
        get range() {
          if (this.formatted === void 0) {
            this.formatted = "";
            for (let i = 0; i < this.set.length; i++) {
              if (i > 0) {
                this.formatted += "||";
              }
              const comps = this.set[i];
              for (let k = 0; k < comps.length; k++) {
                if (k > 0) {
                  this.formatted += " ";
                }
                this.formatted += comps[k].toString().trim();
              }
            }
          }
          return this.formatted;
        }
        format() {
          return this.range;
        }
        toString() {
          return this.range;
        }
        parseRange(range) {
          const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
          const memoKey = memoOpts + ":" + range;
          const cached = cache.get(memoKey);
          if (cached) {
            return cached;
          }
          const loose = this.options.loose;
          const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
          range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
          debug("hyphen replace", range);
          range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
          debug("comparator trim", range);
          range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
          debug("tilde trim", range);
          range = range.replace(re[t.CARETTRIM], caretTrimReplace);
          debug("caret trim", range);
          let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
          if (loose) {
            rangeList = rangeList.filter((comp) => {
              debug("loose invalid filter", comp, this.options);
              return !!comp.match(re[t.COMPARATORLOOSE]);
            });
          }
          debug("range list", rangeList);
          const rangeMap = /* @__PURE__ */ new Map();
          const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
          for (const comp of comparators) {
            if (isNullSet(comp)) {
              return [comp];
            }
            rangeMap.set(comp.value, comp);
          }
          if (rangeMap.size > 1 && rangeMap.has("")) {
            rangeMap.delete("");
          }
          const result = [...rangeMap.values()];
          cache.set(memoKey, result);
          return result;
        }
        intersects(range, options) {
          if (!(range instanceof _Range)) {
            throw new TypeError("a Range is required");
          }
          return this.set.some((thisComparators) => {
            return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
              return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
                return rangeComparators.every((rangeComparator) => {
                  return thisComparator.intersects(rangeComparator, options);
                });
              });
            });
          });
        }
        // if ANY of the sets match ALL of its comparators, then pass
        test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (let i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        }
      };
      module.exports = Range;
      var LRU = require_lrucache();
      var cache = new LRU();
      var parseOptions = require_parse_options();
      var Comparator = require_comparator();
      var debug = require_debug();
      var SemVer = require_semver();
      var {
        safeRe: re,
        t,
        comparatorTrimReplace,
        tildeTrimReplace,
        caretTrimReplace
      } = require_re();
      var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
      var isNullSet = (c) => c.value === "<0.0.0-0";
      var isAny = (c) => c.value === "";
      var isSatisfiable = (comparators, options) => {
        let result = true;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        while (result && remainingComparators.length) {
          result = remainingComparators.every((otherComparator) => {
            return testComparator.intersects(otherComparator, options);
          });
          testComparator = remainingComparators.pop();
        }
        return result;
      };
      var parseComparator = (comp, options) => {
        debug("comp", comp, options);
        comp = replaceCarets(comp, options);
        debug("caret", comp);
        comp = replaceTildes(comp, options);
        debug("tildes", comp);
        comp = replaceXRanges(comp, options);
        debug("xrange", comp);
        comp = replaceStars(comp, options);
        debug("stars", comp);
        return comp;
      };
      var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
      var replaceTildes = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
      };
      var replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("tilde", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
          } else if (pr) {
            debug("replaceTilde pr", pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
          debug("tilde return", ret);
          return ret;
        });
      };
      var replaceCarets = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
      };
      var replaceCaret = (comp, options) => {
        debug("caret", comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
        const z = options.includePrerelease ? "-0" : "";
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("caret", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            if (M === "0") {
              ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
              ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
          } else if (pr) {
            debug("replaceCaret pr", pr);
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
          } else {
            debug("no pr");
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
          }
          debug("caret return", ret);
          return ret;
        });
      };
      var replaceXRanges = (comp, options) => {
        debug("replaceXRanges", comp, options);
        return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
      };
      var replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
          debug("xRange", comp, ret, gtlt, M, m, p, pr);
          const xM = isX(M);
          const xm = xM || isX(m);
          const xp = xm || isX(p);
          const anyX = xp;
          if (gtlt === "=" && anyX) {
            gtlt = "";
          }
          pr = options.includePrerelease ? "-0" : "";
          if (xM) {
            if (gtlt === ">" || gtlt === "<") {
              ret = "<0.0.0-0";
            } else {
              ret = "*";
            }
          } else if (gtlt && anyX) {
            if (xm) {
              m = 0;
            }
            p = 0;
            if (gtlt === ">") {
              gtlt = ">=";
              if (xm) {
                M = +M + 1;
                m = 0;
                p = 0;
              } else {
                m = +m + 1;
                p = 0;
              }
            } else if (gtlt === "<=") {
              gtlt = "<";
              if (xm) {
                M = +M + 1;
              } else {
                m = +m + 1;
              }
            }
            if (gtlt === "<") {
              pr = "-0";
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
          } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
          } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
          }
          debug("xRange return", ret);
          return ret;
        });
      };
      var replaceStars = (comp, options) => {
        debug("replaceStars", comp, options);
        return comp.trim().replace(re[t.STAR], "");
      };
      var replaceGTE0 = (comp, options) => {
        debug("replaceGTE0", comp, options);
        return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
      };
      var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
        if (isX(fM)) {
          from = "";
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? "-0" : ""}`;
        }
        if (isX(tM)) {
          to = "";
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
      var testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) {
          if (!set[i].test(version)) {
            return false;
          }
        }
        if (version.prerelease.length && !options.includePrerelease) {
          for (let i = 0; i < set.length; i++) {
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
              continue;
            }
            if (set[i].semver.prerelease.length > 0) {
              const allowed = set[i].semver;
              if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                return true;
              }
            }
          }
          return false;
        }
        return true;
      };
    }
  });

  // node_modules/semver/classes/comparator.js
  var require_comparator = __commonJS({
    "node_modules/semver/classes/comparator.js"(exports, module) {
      var ANY = Symbol("SemVer ANY");
      var Comparator = class _Comparator {
        static get ANY() {
          return ANY;
        }
        constructor(comp, options) {
          options = parseOptions(options);
          if (comp instanceof _Comparator) {
            if (comp.loose === !!options.loose) {
              return comp;
            } else {
              comp = comp.value;
            }
          }
          comp = comp.trim().split(/\s+/).join(" ");
          debug("comparator", comp, options);
          this.options = options;
          this.loose = !!options.loose;
          this.parse(comp);
          if (this.semver === ANY) {
            this.value = "";
          } else {
            this.value = this.operator + this.semver.version;
          }
          debug("comp", this);
        }
        parse(comp) {
          const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
          const m = comp.match(r);
          if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
          }
          this.operator = m[1] !== void 0 ? m[1] : "";
          if (this.operator === "=") {
            this.operator = "";
          }
          if (!m[2]) {
            this.semver = ANY;
          } else {
            this.semver = new SemVer(m[2], this.options.loose);
          }
        }
        toString() {
          return this.value;
        }
        test(version) {
          debug("Comparator.test", version, this.options.loose);
          if (this.semver === ANY || version === ANY) {
            return true;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
          if (!(comp instanceof _Comparator)) {
            throw new TypeError("a Comparator is required");
          }
          if (this.operator === "") {
            if (this.value === "") {
              return true;
            }
            return new Range(comp.value, options).test(this.value);
          } else if (comp.operator === "") {
            if (comp.value === "") {
              return true;
            }
            return new Range(this.value, options).test(comp.semver);
          }
          options = parseOptions(options);
          if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
            return false;
          }
          if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
            return false;
          }
          if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
            return true;
          }
          if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
            return true;
          }
          if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
            return true;
          }
          if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
            return true;
          }
          if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
            return true;
          }
          return false;
        }
      };
      module.exports = Comparator;
      var parseOptions = require_parse_options();
      var { safeRe: re, t } = require_re();
      var cmp = require_cmp();
      var debug = require_debug();
      var SemVer = require_semver();
      var Range = require_range();
    }
  });

  // node_modules/semver/functions/satisfies.js
  var require_satisfies = __commonJS({
    "node_modules/semver/functions/satisfies.js"(exports, module) {
      var Range = require_range();
      var satisfies = (version, range, options) => {
        try {
          range = new Range(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      };
      module.exports = satisfies;
    }
  });

  // node_modules/semver/ranges/to-comparators.js
  var require_to_comparators = __commonJS({
    "node_modules/semver/ranges/to-comparators.js"(exports, module) {
      var Range = require_range();
      var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
      module.exports = toComparators;
    }
  });

  // node_modules/semver/ranges/max-satisfying.js
  var require_max_satisfying = __commonJS({
    "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
      var SemVer = require_semver();
      var Range = require_range();
      var maxSatisfying = (versions, range, options) => {
        let max = null;
        let maxSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!max || maxSV.compare(v) === -1) {
              max = v;
              maxSV = new SemVer(max, options);
            }
          }
        });
        return max;
      };
      module.exports = maxSatisfying;
    }
  });

  // node_modules/semver/ranges/min-satisfying.js
  var require_min_satisfying = __commonJS({
    "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
      var SemVer = require_semver();
      var Range = require_range();
      var minSatisfying = (versions, range, options) => {
        let min = null;
        let minSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!min || minSV.compare(v) === 1) {
              min = v;
              minSV = new SemVer(min, options);
            }
          }
        });
        return min;
      };
      module.exports = minSatisfying;
    }
  });

  // node_modules/semver/ranges/min-version.js
  var require_min_version = __commonJS({
    "node_modules/semver/ranges/min-version.js"(exports, module) {
      var SemVer = require_semver();
      var Range = require_range();
      var gt = require_gt();
      var minVersion = (range, loose) => {
        range = new Range(range, loose);
        let minver = new SemVer("0.0.0");
        if (range.test(minver)) {
          return minver;
        }
        minver = new SemVer("0.0.0-0");
        if (range.test(minver)) {
          return minver;
        }
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let setMin = null;
          comparators.forEach((comparator) => {
            const compver = new SemVer(comparator.semver.version);
            switch (comparator.operator) {
              case ">":
                if (compver.prerelease.length === 0) {
                  compver.patch++;
                } else {
                  compver.prerelease.push(0);
                }
                compver.raw = compver.format();
              /* fallthrough */
              case "":
              case ">=":
                if (!setMin || gt(compver, setMin)) {
                  setMin = compver;
                }
                break;
              case "<":
              case "<=":
                break;
              /* istanbul ignore next */
              default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
          });
          if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
          }
        }
        if (minver && range.test(minver)) {
          return minver;
        }
        return null;
      };
      module.exports = minVersion;
    }
  });

  // node_modules/semver/ranges/valid.js
  var require_valid2 = __commonJS({
    "node_modules/semver/ranges/valid.js"(exports, module) {
      var Range = require_range();
      var validRange = (range, options) => {
        try {
          return new Range(range, options).range || "*";
        } catch (er) {
          return null;
        }
      };
      module.exports = validRange;
    }
  });

  // node_modules/semver/ranges/outside.js
  var require_outside = __commonJS({
    "node_modules/semver/ranges/outside.js"(exports, module) {
      var SemVer = require_semver();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var Range = require_range();
      var satisfies = require_satisfies();
      var gt = require_gt();
      var lt = require_lt();
      var lte = require_lte();
      var gte = require_gte();
      var outside = (version, range, hilo, options) => {
        version = new SemVer(version, options);
        range = new Range(range, options);
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
          case ">":
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = ">";
            ecomp = ">=";
            break;
          case "<":
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = "<";
            ecomp = "<=";
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies(version, range, options)) {
          return false;
        }
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let high = null;
          let low = null;
          comparators.forEach((comparator) => {
            if (comparator.semver === ANY) {
              comparator = new Comparator(">=0.0.0");
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
              high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
              low = comparator;
            }
          });
          if (high.operator === comp || high.operator === ecomp) {
            return false;
          }
          if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
          } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
          }
        }
        return true;
      };
      module.exports = outside;
    }
  });

  // node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS({
    "node_modules/semver/ranges/gtr.js"(exports, module) {
      var outside = require_outside();
      var gtr = (version, range, options) => outside(version, range, ">", options);
      module.exports = gtr;
    }
  });

  // node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS({
    "node_modules/semver/ranges/ltr.js"(exports, module) {
      var outside = require_outside();
      var ltr = (version, range, options) => outside(version, range, "<", options);
      module.exports = ltr;
    }
  });

  // node_modules/semver/ranges/intersects.js
  var require_intersects = __commonJS({
    "node_modules/semver/ranges/intersects.js"(exports, module) {
      var Range = require_range();
      var intersects = (r1, r2, options) => {
        r1 = new Range(r1, options);
        r2 = new Range(r2, options);
        return r1.intersects(r2, options);
      };
      module.exports = intersects;
    }
  });

  // node_modules/semver/ranges/simplify.js
  var require_simplify = __commonJS({
    "node_modules/semver/ranges/simplify.js"(exports, module) {
      var satisfies = require_satisfies();
      var compare = require_compare();
      module.exports = (versions, range, options) => {
        const set = [];
        let first = null;
        let prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        for (const version of v) {
          const included = satisfies(version, range, options);
          if (included) {
            prev = version;
            if (!first) {
              first = version;
            }
          } else {
            if (prev) {
              set.push([first, prev]);
            }
            prev = null;
            first = null;
          }
        }
        if (first) {
          set.push([first, null]);
        }
        const ranges = [];
        for (const [min, max] of set) {
          if (min === max) {
            ranges.push(min);
          } else if (!max && min === v[0]) {
            ranges.push("*");
          } else if (!max) {
            ranges.push(`>=${min}`);
          } else if (min === v[0]) {
            ranges.push(`<=${max}`);
          } else {
            ranges.push(`${min} - ${max}`);
          }
        }
        const simplified = ranges.join(" || ");
        const original = typeof range.raw === "string" ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
      };
    }
  });

  // node_modules/semver/ranges/subset.js
  var require_subset = __commonJS({
    "node_modules/semver/ranges/subset.js"(exports, module) {
      var Range = require_range();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var satisfies = require_satisfies();
      var compare = require_compare();
      var subset = (sub, dom, options = {}) => {
        if (sub === dom) {
          return true;
        }
        sub = new Range(sub, options);
        dom = new Range(dom, options);
        let sawNonNull = false;
        OUTER: for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
        return true;
      };
      var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
      var minimumVersion = [new Comparator(">=0.0.0")];
      var simpleSubset = (sub, dom, options) => {
        if (sub === dom) {
          return true;
        }
        if (sub.length === 1 && sub[0].semver === ANY) {
          if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
          } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
          } else {
            sub = minimumVersion;
          }
        }
        if (dom.length === 1 && dom[0].semver === ANY) {
          if (options.includePrerelease) {
            return true;
          } else {
            dom = minimumVersion;
          }
        }
        const eqSet = /* @__PURE__ */ new Set();
        let gt, lt;
        for (const c of sub) {
          if (c.operator === ">" || c.operator === ">=") {
            gt = higherGT(gt, c, options);
          } else if (c.operator === "<" || c.operator === "<=") {
            lt = lowerLT(lt, c, options);
          } else {
            eqSet.add(c.semver);
          }
        }
        if (eqSet.size > 1) {
          return null;
        }
        let gtltComp;
        if (gt && lt) {
          gtltComp = compare(gt.semver, lt.semver, options);
          if (gtltComp > 0) {
            return null;
          } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
            return null;
          }
        }
        for (const eq of eqSet) {
          if (gt && !satisfies(eq, String(gt), options)) {
            return null;
          }
          if (lt && !satisfies(eq, String(lt), options)) {
            return null;
          }
          for (const c of dom) {
            if (!satisfies(eq, String(c), options)) {
              return false;
            }
          }
          return true;
        }
        let higher, lower;
        let hasDomLT, hasDomGT;
        let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
        let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
        if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
          needDomLTPre = false;
        }
        for (const c of dom) {
          hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
          hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
          if (gt) {
            if (needDomGTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
                needDomGTPre = false;
              }
            }
            if (c.operator === ">" || c.operator === ">=") {
              higher = higherGT(gt, c, options);
              if (higher === c && higher !== gt) {
                return false;
              }
            } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
              return false;
            }
          }
          if (lt) {
            if (needDomLTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
                needDomLTPre = false;
              }
            }
            if (c.operator === "<" || c.operator === "<=") {
              lower = lowerLT(lt, c, options);
              if (lower === c && lower !== lt) {
                return false;
              }
            } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
              return false;
            }
          }
          if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
          }
        }
        if (gt && hasDomLT && !lt && gtltComp !== 0) {
          return false;
        }
        if (lt && hasDomGT && !gt && gtltComp !== 0) {
          return false;
        }
        if (needDomGTPre || needDomLTPre) {
          return false;
        }
        return true;
      };
      var higherGT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
      };
      var lowerLT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
      };
      module.exports = subset;
    }
  });

  // node_modules/semver/index.js
  var require_semver2 = __commonJS({
    "node_modules/semver/index.js"(exports, module) {
      var internalRe = require_re();
      var constants = require_constants();
      var SemVer = require_semver();
      var identifiers = require_identifiers();
      var parse = require_parse();
      var valid = require_valid();
      var clean = require_clean();
      var inc = require_inc();
      var diff = require_diff();
      var major = require_major();
      var minor = require_minor();
      var patch = require_patch();
      var prerelease = require_prerelease();
      var compare = require_compare();
      var rcompare = require_rcompare();
      var compareLoose = require_compare_loose();
      var compareBuild = require_compare_build();
      var sort = require_sort();
      var rsort = require_rsort();
      var gt = require_gt();
      var lt = require_lt();
      var eq = require_eq();
      var neq = require_neq();
      var gte = require_gte();
      var lte = require_lte();
      var cmp = require_cmp();
      var coerce = require_coerce();
      var Comparator = require_comparator();
      var Range = require_range();
      var satisfies = require_satisfies();
      var toComparators = require_to_comparators();
      var maxSatisfying = require_max_satisfying();
      var minSatisfying = require_min_satisfying();
      var minVersion = require_min_version();
      var validRange = require_valid2();
      var outside = require_outside();
      var gtr = require_gtr();
      var ltr = require_ltr();
      var intersects = require_intersects();
      var simplifyRange = require_simplify();
      var subset = require_subset();
      module.exports = {
        parse,
        valid,
        clean,
        inc,
        diff,
        major,
        minor,
        patch,
        prerelease,
        compare,
        rcompare,
        compareLoose,
        compareBuild,
        sort,
        rsort,
        gt,
        lt,
        eq,
        neq,
        gte,
        lte,
        cmp,
        coerce,
        Comparator,
        Range,
        satisfies,
        toComparators,
        maxSatisfying,
        minSatisfying,
        minVersion,
        validRange,
        outside,
        gtr,
        ltr,
        intersects,
        simplifyRange,
        subset,
        SemVer,
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: constants.RELEASE_TYPES,
        compareIdentifiers: identifiers.compareIdentifiers,
        rcompareIdentifiers: identifiers.rcompareIdentifiers
      };
    }
  });

  // src/constants.ts
  var COVER_ID = "transition-cover";
  var TRANSLATION_KEY = "BATTLETRANSITIONS";
  var LOG_ICON = "\u2694\uFE0F";
  var CUSTOM_HOOKS = {
    INITIALIZE: `${"battle-transitions"}.init`,
    TRANSITION_START: `${"battle-transitions"}.transitionStart`,
    TRANSITION_END: `${"battle-transitions"}.transitionEnd`,
    SCENE_ACTIVATED: `${"battle-transitions"}.sceneActivated`
  };
  var PreparedSequences = {};

  // src/ScreenSpaceCanvasGroup.ts
  var ScreenSpaceCanvasGroup = class extends PIXI.Container {
    setInverseMatrix() {
      if (canvas?.app?.stage)
        this.transform.setFromMatrix(canvas.app.stage.localTransform.clone().invert());
    }
    constructor() {
      super();
      this.interactiveChildren = false;
      this.interactive = false;
      this.eventMode = "none";
      if (canvas?.app) {
        canvas.app.renderer.addListener("prerender", () => {
          this.setInverseMatrix();
        });
      }
    }
  };

  // src/errors/LocalizedError.ts
  var LocalizedError = class extends Error {
    constructor(message, subs) {
      if (message) super(game.i18n?.format(`${TRANSLATION_KEY}.ERRORS.${message}`, subs));
      else super();
    }
  };

  // src/errors/CannotInitializeCanvasError.ts
  var CannotInitializeCanvasError = class extends LocalizedError {
    constructor() {
      super("CANNOTINITIALIZECANVAS");
    }
  };

  // src/errors/CanvasNotFoundError.ts
  var CanvasNotFoundError = class extends LocalizedError {
    constructor() {
      super("CANVASNOTFOUND");
    }
  };

  // src/errors/FileNotFoundError.ts
  var FileNotFoundError = class extends LocalizedError {
    constructor(file) {
      super("FILENOTFOUND", { file });
    }
  };

  // src/errors/InvalidDirectionError.ts
  var InvalidDirectionError = class extends LocalizedError {
    constructor(direction) {
      super("INVALIDDIRECTION", { direction });
    }
  };

  // src/errors/InvalidMacroError.ts
  var InvalidMacroError = class extends LocalizedError {
    constructor(macro) {
      super("INVALIDMACRO", { macro });
    }
  };

  // src/errors/InvalidSceneError.ts
  var InvalidSceneError = class extends LocalizedError {
    constructor(name) {
      super("INVALIDSCENE", { name });
    }
  };

  // src/errors/InvalidSoundError.ts
  var InvalidSoundError = class extends LocalizedError {
    constructor(sound) {
      super("INVALIDSOUND", { sound });
    }
  };

  // src/errors/InvalidTextureError.ts
  var InvalidTextureError = class extends LocalizedError {
    constructor() {
      super("INVALIDTEXTURE");
    }
  };

  // src/errors/InvalidTransitionError.ts
  var InvalidTransitionError = class extends LocalizedError {
    constructor(name) {
      super("INVALIDTRANSITION", { name });
    }
  };

  // src/errors/InvalidVersionError.ts
  var InvalidVersionError = class extends LocalizedError {
    constructor(version) {
      super("INVALIDVERSION", { version });
    }
  };

  // src/errors/NewerVersionError.ts
  var NewerVersionError = class extends LocalizedError {
    constructor(version) {
      super("NEWERVERSION", { version });
    }
  };

  // src/errors/NoCoverElementError.ts
  var NoCoverElementError = class extends LocalizedError {
    constructor() {
      super("NOCOVERELEMENT");
    }
  };

  // src/errors/NoPreviousStepError.ts
  var NoPreviousStepError = class extends LocalizedError {
    constructor() {
      super("NOPREVIOUSSTEP");
    }
  };

  // src/errors/NotImplementedError.ts
  var NotImplementedError = class extends LocalizedError {
    constructor() {
      super("NOTIMPLEMENTED");
    }
  };

  // src/errors/NotInitializedError.ts
  var NotInitializedError = class extends LocalizedError {
    constructor() {
      super("NOTINITIALIZED");
    }
  };

  // src/errors/ParallelExecuteError.ts
  var ParallelExecuteError = class extends LocalizedError {
    constructor() {
      super("EXECUTECALLEDPARALLEL");
    }
  };

  // src/errors/PermissionDeniedError.ts
  var PermissionDeniedError = class extends LocalizedError {
    constructor() {
      super("PERMISSIONDENIED");
    }
  };

  // src/errors/RepeatExecuteError.ts
  var RepeatExecuteError = class extends LocalizedError {
    constructor() {
      super("EXECUTECALLEDREPEAT");
    }
  };

  // src/errors/SequenceTimedOutError.ts
  var SequenceTimedOutError = class extends LocalizedError {
    constructor() {
      super("SEQUENCETIMEDOUT");
    }
  };

  // src/errors/TransitionToSelfError.ts
  var TransitionToSelfError = class extends LocalizedError {
    constructor() {
      super("TRANSITIONTOSELF");
    }
  };

  // src/errors/UnableToMigrateError.ts
  var UnableToMigrateError = class extends LocalizedError {
    constructor(old, current) {
      super("UNABLETOMIGRATE", { old, current });
    }
  };

  // src/coercion.ts
  function coerceColor(source) {
    try {
      return new PIXI.Color(source);
    } catch {
    }
  }
  function coerceTexture(source) {
    const color = coerceColor(source);
    if (color) return createColorTexture(color);
    try {
      return PIXI.Texture.from(source);
    } catch {
    }
  }
  function coerceScene(arg) {
    if (!(game instanceof Game && game.scenes)) return;
    if (typeof arg === "string") {
      let scene = game.scenes.get(arg);
      if (scene) return scene;
      scene = game.scenes.getName(arg);
      if (scene) return scene;
    } else if (arg instanceof Scene) {
      return arg;
    }
  }
  function coerceMacro(arg) {
    if (arg instanceof Macro) return arg;
    if (!game.macros) return;
    if (typeof arg === "string") {
      let macro = game.macros?.get(arg);
      if (macro) return macro;
      macro = game.macros?.getName(arg);
      if (macro) return macro;
      if (arg.split(".")[0] === "Macro") return game.macros?.get(arg.split(".").slice(1).join("."));
    }
  }

  // src/lib/simplex-noise.ts
  var SQRT3 = /* @__PURE__ */ Math.sqrt(3);
  var SQRT5 = /* @__PURE__ */ Math.sqrt(5);
  var F2 = 0.5 * (SQRT3 - 1);
  var G2 = (3 - SQRT3) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6;
  var F4 = (SQRT5 - 1) / 4;
  var G4 = (5 - SQRT5) / 20;
  var fastFloor = (x) => Math.floor(x) | 0;
  var grad2 = /* @__PURE__ */ new Float64Array([
    1,
    1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    1,
    0,
    -1,
    0,
    1,
    0,
    -1,
    0,
    0,
    1,
    0,
    -1,
    0,
    1,
    0,
    -1
  ]);
  function createNoise2D(random = Math.random) {
    const perm = buildPermutationTable(random);
    const permGrad2x = new Float64Array(perm).map((v) => grad2[v % 12 * 2]);
    const permGrad2y = new Float64Array(perm).map((v) => grad2[v % 12 * 2 + 1]);
    return function noise2D(x, y) {
      let n0 = 0;
      let n1 = 0;
      let n2 = 0;
      const s = (x + y) * F2;
      const i = fastFloor(x + s);
      const j = fastFloor(y + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = x - X0;
      const y0 = y - Y0;
      let i1, j1;
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } else {
        i1 = 0;
        j1 = 1;
      }
      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2;
      const y2 = y0 - 1 + 2 * G2;
      const ii = i & 255;
      const jj = j & 255;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        const gi0 = ii + perm[jj];
        const g0x = permGrad2x[gi0];
        const g0y = permGrad2y[gi0];
        t0 *= t0;
        n0 = t0 * t0 * (g0x * x0 + g0y * y0);
      }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        const gi1 = ii + i1 + perm[jj + j1];
        const g1x = permGrad2x[gi1];
        const g1y = permGrad2y[gi1];
        t1 *= t1;
        n1 = t1 * t1 * (g1x * x1 + g1y * y1);
      }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        const gi2 = ii + 1 + perm[jj + 1];
        const g2x = permGrad2x[gi2];
        const g2y = permGrad2y[gi2];
        t2 *= t2;
        n2 = t2 * t2 * (g2x * x2 + g2y * y2);
      }
      return 70 * (n0 + n1 + n2);
    };
  }
  function buildPermutationTable(random) {
    const tableSize = 512;
    const p = new Uint8Array(tableSize);
    for (let i = 0; i < tableSize / 2; i++) {
      p[i] = i;
    }
    for (let i = 0; i < tableSize / 2 - 1; i++) {
      const r = i + ~~(random() * (256 - i));
      const aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    for (let i = 256; i < tableSize; i++) {
      p[i] = p[i - 256];
    }
    return p;
  }

  // src/lib/base64Utils.ts
  var base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
  ];
  function bytesToBase64(bytes) {
    let result = "", i;
    const l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
      result += base64abc[(bytes[i - 1] & 15) << 2 | bytes[i] >> 6];
      result += base64abc[bytes[i] & 63];
    }
    if (i === l + 1) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 3) << 4];
      result += "==";
    }
    if (i === l) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
      result += base64abc[(bytes[i - 1] & 15) << 2];
      result += "=";
    }
    return result;
  }

  // src/steps/index.ts
  var steps_exports = {};
  __export(steps_exports, {
    AngularWipeStep: () => AngularWipeStep,
    BarWipeStep: () => BarWipeStep,
    BilinearWipeStep: () => BilinearWipeStep,
    BossSplashStep: () => BossSplashStep,
    ClearEffectsStep: () => ClearEffectsStep,
    ClockWipeStep: () => ClockWipeStep,
    DiamondWipeStep: () => DiamondWipeStep,
    FadeStep: () => FadeStep,
    FireDissolveStep: () => FireDissolveStep,
    FlashStep: () => FlashStep,
    HueShiftStep: () => HueShiftStep,
    InvertStep: () => InvertStep,
    LinearWipeStep: () => LinearWipeStep,
    MacroStep: () => MacroStep,
    MeltStep: () => MeltStep,
    ParallelStep: () => ParallelStep,
    PixelateStep: () => PixelateStep,
    RadialWipeStep: () => RadialWipeStep,
    RemoveOverlayStep: () => RemoveOverlayStep,
    RepeatStep: () => RepeatStep,
    RestoreOverlayStep: () => RestoreOverlayStep,
    SceneChangeStep: () => SceneChangeStep,
    SoundStep: () => SoundStep,
    SpiralShutterStep: () => SpiralShutterStep,
    SpiralWipeStep: () => SpiralWipeStep,
    SpotlightWipeStep: () => SpotlightWipeStep,
    StartPlaylistStep: () => StartPlaylistStep,
    TextureSwapStep: () => TextureSwapStep,
    TransitionStep: () => TransitionStep,
    TwistStep: () => TwistStep,
    VideoStep: () => VideoStep,
    WaitStep: () => WaitStep,
    WaveWipeStep: () => WaveWipeStep,
    ZoomBlurStep: () => ZoomBlurStep
  });

  // src/steps/TransitionStep.ts
  var TransitionStep = class {
    // #endregion Properties (6)
    // #region Constructors (1)
    constructor(config) {
      this.config = config;
      if (!config.id) this.config.id = foundry.utils.randomID();
    }
    // #region Properties (6)
    static DefaultSettings = {
      id: "",
      type: "UNKNOWN",
      version: "1.1.0"
    };
    static hidden = true;
    static key = "unknown";
    static name = "UNNAMED";
    static skipConfig = false;
    static template = "";
    static icon = "";
    static category = "";
    // #endregion Constructors (1)
    // #region Public Static Methods (7)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    static async RenderTemplate(config) {
      throw new NotImplementedError();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static Upgrade(config) {
      throw new NotImplementedError();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static from(arg) {
      throw new NotImplementedError();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static validate(config) {
      return true;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (5)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static addEventListeners(element, config) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prepare(sequence) {
    }
    serialize() {
      return this.config;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    teardown(container) {
    }
    validate() {
      return true;
    }
    // #endregion Public Abstract Methods (1)
    // #region Protected Methods (4)
    addFilter(container, filter) {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];
    }
    getConfigTemplateParams() {
      return {
        ...this.config
      };
    }
    removeFilter(container, filter) {
      const index = container.filters?.indexOf(filter) ?? -1;
      if (index !== -1) container.filters?.splice(index, 1);
    }
    async simpleTween(filter) {
      await TweenMax.to(filter.uniforms, { progress: 1, duration: this.config.duration / 1e3, ease: this.config.easing || "none" });
    }
    // #endregion Protected Methods (4)
  };

  // src/filters/default.frag
  var default_default = "#version 300 es\n\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nvoid main() {\n    color = texture(uSampler, vTextureCoord);\n}";

  // src/filters/default.vert
  var default_default2 = "#version 300 es\n\nin vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nout vec2 vTextureCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition(void) {\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord(void) {\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void) {\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n";

  // src/filters/CustomFilter.ts
  var CustomFilter = class extends PIXI.Filter {
    constructor(vertex, fragment, uniforms) {
      super(vertex || default_default2, fragment || default_default, uniforms);
      if (!this.program.fragmentSrc.includes("#version 300 es"))
        this.program.fragmentSrc = this.#addGLESVersion(300, this.program.fragmentSrc);
      if (!this.program.vertexSrc.includes("#version 300 es"))
        this.program.vertexSrc = this.#addGLESVersion(300, this.program.vertexSrc);
    }
    #addGLESVersion(version, shader) {
      const lines = shader.split("\n");
      const versionIndex = lines.findIndex((line) => line.startsWith("#version"));
      if (versionIndex !== -1) {
        const version2 = lines.splice(versionIndex, 1);
        lines.unshift(...version2);
      } else {
        lines.unshift("#version 300 es");
      }
      return lines.join("\n");
    }
  };

  // src/filters/FireDissolve/firedissolve.frag
  var firedissolve_default = "#version 300 es\n\nprecision highp float;\n\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform sampler2D uSampler;\nuniform sampler2D noise_texture;\nuniform sampler2D burn_texture;\n\nuniform float progress;\nuniform float burn_size;\n\nfloat inverse_lerp(float a, float b, float v) {\n    return (v - a) / (b - a);\n}\n\nvoid main() {\n    float integrity = 1.0 - progress;\n    float noise = texture(noise_texture, vTextureCoord).r * vTextureCoord.y;\n    vec4 base_color = texture(uSampler, vTextureCoord) * step(noise, integrity);\n    vec2 burn_uv = vec2(inverse_lerp(integrity, integrity * burn_size, noise), 0.0);\n    vec4 burn_color = texture(burn_texture, burn_uv) * step(noise, integrity * burn_size);\n\n    color = mix(burn_color, base_color, base_color.a);\n}";

  // src/filters/FireDissolve/FireDissolveFilter.ts
  var defaultBurnTexture = createGradient1DTexture(1024, new PIXI.Color("#ff0400"), new PIXI.Color("#ffff01"));
  var FireDissolveFilter = class extends CustomFilter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(burnSize = 1.3) {
      const noise_texture = createNoiseTexture();
      const uniforms = {
        noise_texture,
        progress: 0,
        burn_size: burnSize,
        burn_texture: defaultBurnTexture
      };
      super(void 0, firedissolve_default, uniforms);
    }
  };

  // src/filters/DiamondTransition/diamondtransition.frag
  var diamondtransition_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform float size;\nuniform vec2 screen_size;\nuniform sampler2D bgSampler;\n\nvoid main() {\n    vec2 screenCoord = screen_size * vTextureCoord;\n    \n    float x = abs(fract(screenCoord.x / size) - 0.5);\n    float y = abs(fract(screenCoord.y / size) - 0.5);\n    \n    if (x + y + vTextureCoord.x > progress * 2.0) {\n        color = texture(uSampler, vTextureCoord);\n    } else {\n        color = texture(bgSampler, vTextureCoord);\n    }\n}";

  // src/filters/DiamondTransition/DiamondTransitionFilter.ts
  var DiamondTransitionFilter = class extends CustomFilter {
    constructor(size, bg = "transparent") {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      super(void 0, diamondtransition_default, {
        progress: 0,
        size,
        bgSampler: bgTexture,
        screen_size: { x: window.innerWidth, y: window.innerHeight }
      });
    }
  };

  // src/filters/TextureWipe/texturewipe.frag
  var texturewipe_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform sampler2D wipeSampler;\nuniform sampler2D bgSampler;\n\nvoid main() {\n    vec4 wipe = texture(wipeSampler, vTextureCoord);\n    \n    if (wipe.b < progress) {\n        color = texture(bgSampler, vTextureCoord);\n    } else {\n        color = texture(uSampler, vTextureCoord);\n    }\n}";

  // src/filters/TextureWipe/TextureWipeFilter.ts
  var transparentTexture = createColorTexture(new PIXI.Color("#00000000"));
  var TextureWipeFilter = class extends CustomFilter {
    constructor(wipeSampler, bgSampler) {
      const uniforms = {
        progress: 0,
        wipeSampler,
        bgSampler: bgSampler ?? transparentTexture
      };
      super(void 0, texturewipe_default, uniforms);
    }
  };

  // src/filters/FadeTransition/fadetransition.frag
  var fadetransition_default = "#version 300 es\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform sampler2D bgColor;\n\nvoid main() {\n    color = mix(texture(uSampler, vTextureCoord), texture(bgColor, vTextureCoord), progress);\n}";

  // src/filters/FadeTransition/FadeTransitionFilter.ts
  var FadeTransitionFilter = class extends CustomFilter {
    constructor(bg = "transparent") {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      super(void 0, fadetransition_default, {
        bgColor: bgTexture,
        progress: 0
      });
    }
  };

  // src/filters/BilinearWipe/BilinearWipeFilter.ts
  var TextureHash = {
    horizontal: {
      inside: "bilinear-horizontal-inside.webp",
      outside: "bilinear-horizontal-outside.webp"
    },
    vertical: {
      inside: "bilinear-vertical-inside.webp",
      outside: "bilinear-vertical-outside.webp"
    },
    topleft: {
      inside: "bilinear-top-left-inside.webp",
      outside: "bilinear-top-right-outside.webp"
    },
    topright: {
      inside: "bilinear-top-right-inside.webp",
      outside: "bilinear-top-right-outside.webp"
    },
    bottomleft: {
      inside: "bilinear-top-right-inside.webp",
      outside: "bilinear-top-right-outside.webp"
    },
    bottomright: {
      inside: "bilinear-top-left-inside.webp",
      outside: "bilinear-top-right-outside.webp"
    }
  };
  var BilinearWipeFilter = class extends TextureWipeFilter {
    constructor(direction, radial, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const texture = TextureHash[direction]?.[radial];
      if (!texture) throw new InvalidDirectionError(`${direction}-${radial}`);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${texture}`);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/LinearWipe/LinearWipeFilter.ts
  var TextureHash2 = {
    left: "linear-left.webp",
    right: "linear-right.webp",
    top: "linear-top.webp",
    bottom: "linear-bottom.webp",
    topleft: "linear-top-left.webp",
    topright: "linear-top-right.webp",
    bottomleft: "linear-bottom-left.webp",
    bottomright: "linear-bottom-right.webp"
  };
  var LinearWipeFilter = class extends TextureWipeFilter {
    constructor(direction, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const texture = TextureHash2[direction];
      if (!texture) throw new InvalidDirectionError(direction);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${texture}`);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/ClockWipe/ClockWipeFilter.ts
  var TextureHash3 = {
    clockwise: {
      top: "clockwise-top.webp",
      left: "clockwise-left.webp",
      right: "clockwise-right.webp",
      bottom: "clockwise-bottom.webp"
    },
    counterclockwise: {
      top: "anticlockwise-top.webp",
      left: "anticlockwise-left.webp",
      right: "anticlockwise-right.webp",
      bottom: "anticlockwise-bottom.webp"
    }
  };
  var ClockWipeFilter = class extends TextureWipeFilter {
    constructor(clockDirection, direction, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const texture = TextureHash3[clockDirection]?.[direction];
      if (!texture) throw new InvalidDirectionError(`${clockDirection}-${direction}`);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${texture}`);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/SpotlightWipe/SpotlightWipeFilter.ts
  var TextureHash4 = {
    left: {
      inside: "spotlight-left-inside.webp",
      outside: "spotlight-right-outside.webp"
    },
    top: {
      inside: "spotlight-top-inside.webp",
      outside: "spotlight-top-outside.webp"
    },
    right: {
      inside: "spotlight-right-inside.webp",
      outside: "spotlight-right-outside.webp"
    },
    bottom: {
      inside: "spotlight-bottom-inside.webp",
      outside: "spotlgiht-bottom-outside.webp"
    }
  };
  var SpotlightWipeFilter = class extends TextureWipeFilter {
    constructor(direction, radial, bg = "transparent") {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const texture = TextureHash4[direction]?.[radial];
      if (!texture) throw new InvalidDirectionError(`${direction}-${radial}`);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${texture}`);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/RadialWipe/RadialWipeFilter.ts
  var TextureHash5 = {
    inside: "radial-inside.webp",
    outside: "radial-outside.webp"
  };
  var RadialWipeFilter = class extends TextureWipeFilter {
    constructor(direction, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const texture = TextureHash5[direction];
      if (!texture) throw new InvalidDirectionError(direction);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${texture}`);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/TextureSwap/textureswap.frag
  var textureswap_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform sampler2D uTexture;\n\nvoid main() {\n    color = texture(uTexture, vTextureCoord);\n}";

  // src/filters/TextureSwap/TextureSwapFilter.ts
  var TextureSwapFilter = class extends CustomFilter {
    constructor(texture) {
      const actual = coerceTexture(texture);
      if (!actual) throw new InvalidTextureError();
      super(void 0, textureswap_default, {
        uTexture: actual
      });
    }
  };

  // src/filters/Melt/melt.frag
  var melt_default = "#version 300 es\n\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform float[512] offsets;\nuniform sampler2D uBackground;\n\nvoid main() {\n    vec2 tex_uv = vTextureCoord;\n\n    float index = tex_uv.x * float(offsets.length());\n    tex_uv.y -= progress * offsets[int(index)];\n\n    // float index = tex_uv.x * float(offsets.length());\n    // tex_uv.y -= progress * offsets[int(index)];\n\n    color = texture(uSampler, tex_uv);\n    if (tex_uv.y < 0.0 || tex_uv.y > 1.0) color = texture(uBackground, vTextureCoord); // texture(uBackground, vTextureCoord);\n}\n";

  // src/filters/Melt/MeltFilter.ts
  var MeltFilter = class extends CustomFilter {
    constructor(background) {
      const texture = coerceTexture(background);
      if (!(texture instanceof PIXI.Texture)) throw new InvalidTextureError();
      super(void 0, melt_default, {
        progress: 0,
        offsets: new Array(512).fill(0).map(() => Math.random() + 1),
        uBackground: texture
      });
    }
  };

  // src/filters/AngularWipe/AngularWipeFilter.ts
  var AngularWipeFilter = class extends TextureWipeFilter {
    constructor(background) {
      const bg = coerceTexture(background);
      if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/angular.webp`);
      super(wipeTexture, bg);
    }
  };

  // src/filters/WaveWipe/WaveWipeFilter.ts
  var WaveWipeFilter = class extends TextureWipeFilter {
    constructor(direction, background) {
      const bg = coerceTexture(background);
      if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/wave-${direction === "inside" ? "inside" : "outside"}.webp`);
      super(wipeTexture, bg);
    }
  };

  // src/filters/Invert/invert.frag
  var invert_default = "#version 300 es\n\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nvoid main() {\n    color = 1.0 - texture(uSampler, vTextureCoord);\n    color.a = 1.0;\n}";

  // src/filters/Invert/InvertFilter.ts
  var InvertFilter = class extends CustomFilter {
    constructor() {
      super(void 0, invert_default, {});
    }
  };

  // src/filters/SpiralShutter/SpiralShutterFilter.ts
  var textures = {
    clockwise: {
      inside: "spiral-radial-clockwise-inside",
      outside: "spiral-radial-clockwise-outside"
    },
    counterclockwise: {
      inside: "spiral-radial-counterclockwise-inside",
      outside: "spiral-radial-counterclockwise-outside"
    }
  };
  var SpiralShutterFilter = class extends TextureWipeFilter {
    constructor(direction, radial, background) {
      const bg = coerceTexture(background);
      if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();
      const wipe = textures[direction]?.[radial];
      if (!wipe) throw new InvalidDirectionError(`${direction}-${radial}`);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${wipe}.webp`);
      super(wipeTexture, bg);
    }
  };

  // src/filters/SpiralWipe/SpiralWipeFilter.ts
  var SpiralWipeFilter = class extends TextureWipeFilter {
    constructor(clock, radial, direction, background) {
      const bg = coerceTexture(background);
      if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/spiral-linear-${clock}-${direction}-${radial}.webp`);
      if (!(wipeTexture instanceof PIXI.Texture)) throw new InvalidTextureError();
      super(wipeTexture, bg);
    }
  };

  // src/filters/HueShift/hueshift.frag
  var hueshift_default = "#version 300 es\n\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float shift;\n\nvoid main() {\n    vec4 texture_color = texture(uSampler, vTextureCoord);\n    vec3 input_color = texture_color.rgb;\n\n    vec3 color_hsv; {\n        vec3 c = input_color;\n        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n        float d = q.x - min(q.w, q.y);\n        float e = 1.0e-10;\n        color_hsv=vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n    }\n\n    color_hsv.x = mod((color_hsv.x + shift), 1.0f);\n\n    vec3 color_rgb; {\n        vec3 c = color_hsv;\n        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n        color_rgb=c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n    }\n\n    color = vec4(color_rgb.rgb, texture_color.a);\n}";

  // src/filters/HueShift/HueShiftFilter.ts
  var HueShiftFilter = class extends CustomFilter {
    constructor(shift) {
      super(void 0, hueshift_default, { shift });
    }
  };

  // src/filters/BarWipe/BarWipeFilter.ts
  function createHorizontalTexture(bars) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    const left = ctx.createLinearGradient(0, 0, canvas2.width, 0);
    const right = ctx.createLinearGradient(0, 0, canvas2.width, 0);
    left.addColorStop(0, "black");
    left.addColorStop(1, "white");
    right.addColorStop(0, "white");
    right.addColorStop(1, "black");
    const barHeight = canvas2.height / bars;
    for (let i = 0; i < bars; i++) {
      ctx.fillStyle = i % 2 === 0 ? left : right;
      ctx.fillRect(0, barHeight * i, canvas2.width, barHeight + barHeight * i);
    }
    return PIXI.Texture.from(canvas2);
  }
  function createVerticalTexture(bars) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    const top = ctx.createLinearGradient(0, 0, 0, canvas2.height);
    const bottom = ctx.createLinearGradient(0, 0, 0, canvas2.height);
    top.addColorStop(0, "black");
    top.addColorStop(1, "white");
    bottom.addColorStop(0, "white");
    bottom.addColorStop(1, "black");
    const barWidth = canvas2.width / bars;
    for (let i = 0; i < bars; i++) {
      ctx.fillStyle = i % 2 === 0 ? top : bottom;
      ctx.fillRect(barWidth * i, 0, barWidth + barWidth * i, canvas2.height);
    }
    return PIXI.Texture.from(canvas2);
  }
  var BarWipeFilter = class extends TextureWipeFilter {
    constructor(direction, bars, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      if (!(direction === "horizontal" || direction === "vertical")) throw new InvalidDirectionError(direction);
      const wipeTexture = direction === "horizontal" ? createHorizontalTexture(bars) : createVerticalTexture(bars);
      logTexture(wipeTexture);
      super(wipeTexture, bgTexture);
    }
  };

  // src/steps/AngularWipeStep.ts
  var AngularWipeStep = class _AngularWipeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "angularwipe",
      duration: 1e3,
      easing: "none",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "angularwipe";
    static name = "ANGULARWIPE";
    static template = "angularwipe-config";
    static icon = "<i class='bt-icon angular-wipe fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_AngularWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._AngularWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _AngularWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _AngularWipeStep.fromFormElement(arg[0]);
      return new _AngularWipeStep(arg);
    }
    static fromFormElement(formElement) {
      const backgroundImage = $(formElement).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(formElement), "id", "duration", "easing", "backgroundType", "backgroundColor");
      return new _AngularWipeStep({
        ..._AngularWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    async execute(container) {
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new AngularWipeFilter(background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/BarWipeStep.ts
  var BarWipeStep = class _BarWipeStep extends TransitionStep {
    static DefaultSettings = {
      type: "barwipe",
      duration: 1e3,
      easing: "none",
      direction: "horizontal",
      version: "1.1.0",
      backgroundType: "color",
      backgroundColor: "#00000000",
      backgroundImage: "",
      bgSizingMode: "stretch",
      bars: 4
    };
    static hidden = false;
    static key = "barwipe";
    static name = "BARWIPE";
    static template = "barwipe-config";
    static category = "wipe";
    static icon = `<i class="fas fa-fw fa-bars"></i>`;
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_BarWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._BarWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        directionSelect: {
          horizontal: "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
          vertical: "BATTLETRANSITIONS.DIRECTIONS.VERTICAL"
        }
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _BarWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _BarWipeStep.fromFormElement(arg[0]);
      else return new _BarWipeStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const backgroundImage = elem.find("#backgroundImage").val() ?? "";
      return new _BarWipeStep({
        ..._BarWipeStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "bars", "direction", "easing", "backgroundType", "backgroundColor"),
        serializedTexture: backgroundImage
      });
    }
    async execute(container) {
      const config = {
        ..._BarWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new BarWipeFilter(config.direction, config.bars, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
  };

  // src/steps/BillinearWipeStep.ts
  var BilinearWipeStep = class _BilinearWipeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "bilinearwipe",
      duration: 1e3,
      easing: "none",
      radial: "inside",
      direction: "vertical",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "bilinearwipe";
    static name = "BILINEARWIPE";
    static template = "bilinearwipe-config";
    static category = "wipe";
    static icon = `<i class="fas fa-fw fa-arrows-left-right-to-line"></i>`;
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_BilinearWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._BilinearWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        directionSelect: generateBilinearDirectionSelectOptions(),
        radialSelect: generateRadialDirectionSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _BilinearWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _BilinearWipeStep.fromFormElement(arg[0]);
      else return new _BilinearWipeStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "radial", "easing", "backgroundType", "backgroundColor");
      return new _BilinearWipeStep({
        ..._BilinearWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, _sequence) {
      const config = {
        ..._BilinearWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/BossSplashStep.ts
  function getSplashSetting(key) {
    return game.settings?.get("boss-splash", key);
  }
  var BossSplashStep = class _BossSplashStep extends TransitionStep {
    static get DefaultSettings() {
      return {
        type: "bosssplash",
        version: "1.1.0",
        duration: 5e3,
        actor: "",
        // Get defaults for Boss Splash Screen global settings
        topColor: getSplashSetting("colorFirst"),
        midColor: getSplashSetting("colorSecond"),
        botColor: getSplashSetting("colorThird"),
        fontColor: getSplashSetting("colorFont"),
        fontShadow: getSplashSetting("colorShadow"),
        subColor: getSplashSetting("subColorFont"),
        subShadow: getSplashSetting("subColorShadow"),
        sound: getSplashSetting("bossSound"),
        font: getSplashSetting("fontFamily"),
        fontSize: getSplashSetting("fontSize"),
        subSize: getSplashSetting("subFontSize"),
        message: getSplashSetting("splashMessage") === "{{actor.name}}" ? "" : getSplashSetting("splashMessage"),
        subText: getSplashSetting("subText"),
        animationDelay: getSplashSetting("animationDelay") * 1e3,
        animationDuration: getSplashSetting("animationDuration") * 1e3
      };
    }
    static get hidden() {
      return !game.modules?.get("boss-splash")?.active;
    }
    static key = "bosssplash";
    static name = "BOSSSPLASH";
    static template = "bosssplash-config";
    static category = "effect";
    static icon = "<i class='bt-icon boss-splash fa-fw fas'></i>";
    static RenderTemplate(config) {
      const actors = getActors().sort(sortActors).map((actor) => ({
        ...formatActor(actor),
        selected: config?.actor === actor.uuid
      }));
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_BossSplashStep.template}.hbs`, {
        ..._BossSplashStep.DefaultSettings,
        ...config ? config : {},
        fontSelect: generateFontSelectOptions(),
        actors
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _BossSplashStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLElement) return _BossSplashStep.fromFormElement(arg[0]);
      else return new _BossSplashStep({
        ..._BossSplashStep.DefaultSettings,
        ...arg
      });
    }
    static fromFormElement(form) {
      const elem = $(form);
      const sound = elem.find("#sound").val() ?? "";
      log("Form:", elem.serializeArray());
      return new _BossSplashStep({
        ..._BossSplashStep.DefaultSettings,
        sound,
        ...parseConfigurationFormElements(elem, "id", "actor", "message", "subText", "duration", "animationDelay", "animationDuration", "topColor", "midColor", "botColor", "fontColor", "fontShadow", "subColor", "subShadow", "font", "fontSize", "subSize")
      });
    }
    async execute(container, sequence) {
      const config = {
        ..._BossSplashStep.DefaultSettings,
        ...this.config
      };
      if (sequence.caller === game.user?.id) {
        void game.bossSplash.splashBoss(coerceConfig(config));
      }
      console.log("Waiting:", config.duration + config.animationDelay);
      await wait(config.duration + config.animationDelay);
    }
  };
  function coerceConfig(config) {
    const actor = fromUuidSync(config.actor);
    return {
      sound: config.sound,
      colorFirst: config.topColor,
      colorSecond: config.midColor,
      colorThird: config.botColor,
      colorFont: config.fontColor,
      subColorFont: config.subColor,
      colorShadow: config.fontShadow,
      subColorShadow: config.subShadow,
      message: config.message ? config.message : actor?.name ?? "",
      subText: config.subText,
      fontFamily: config.font,
      fontSize: config.fontSize,
      subFontSize: config.subSize,
      timer: config.duration,
      duration: config.duration,
      animationDelay: config.animationDelay,
      actorImg: actor?.img ?? ""
    };
  }
  function formatActor(actor) {
    const retVal = {
      name: actor.name,
      uuid: actor.uuid,
      pack: "",
      type: actor.type,
      selected: false
    };
    if (game.packs) {
      const parsed = actor.uuid.split(".");
      if (parsed[0] === "Compendium") {
        const packId = parsed.slice(1, 3).join(".");
        const pack = game.packs.get(packId);
        if (pack?.documentName === "Actor")
          retVal.pack = pack.title;
      }
    }
    return retVal;
  }
  function sortActors(first, second) {
    const firstPack = getCompendiumFromUUID(first.uuid);
    const secondPack = getCompendiumFromUUID(second.uuid);
    if (firstPack !== secondPack) return firstPack.localeCompare(secondPack);
    return first.name.localeCompare(second.name);
  }

  // src/steps/ClearEffectsStep.ts
  var ClearEffectsStep = class _ClearEffectsStep extends TransitionStep {
    static DefaultSettings = {
      id: "",
      type: "cleareffects",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "cleareffects";
    static name = "CLEAREFFECTS";
    static skipConfig = true;
    static icon = `<i class="fas fa-fw fa-eraser"></i>`;
    static category = "technical";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static from(arg) {
      return new _ClearEffectsStep({
        ..._ClearEffectsStep.DefaultSettings,
        id: foundry.utils.randomID()
      });
    }
    execute(container, sequence, prepared) {
      const nonOverlayChildren = container.children.filter((child) => !prepared.overlay.includes(child));
      for (const child of nonOverlayChildren) child.destroy();
      for (const child of container.children) {
        if (Array.isArray(child.filters) && child.filters.length) {
          const filters = [...child.filters];
          child.filters = [];
          for (const filter of filters) filter.destroy();
        }
      }
      if (Array.isArray(container.filters) && container.filters.length) {
        const filters = [...container.filters];
        for (const filter of filters) filter.destroy();
        container.filters = [];
      }
    }
  };

  // src/steps/ClockWipeStep.ts
  var ClockWipeStep = class _ClockWipeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "clockwipe",
      duration: 1e3,
      easing: "none",
      clockDirection: "clockwise",
      direction: "top",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "clockwipe";
    static name = "CLOCKWIPE";
    static template = "clockwipe-config";
    static icon = "<i class='bt-icon clock-wipe fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ClockWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._ClockWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        clockDirectionSelect: generateClockDirectionSelectOptions(),
        directionSelect: {
          top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
          left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
          right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
          bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
        }
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _ClockWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _ClockWipeStep.fromFormElement(arg[0]);
      else return new _ClockWipeStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "direction", "clockdirection", "easing", "backgroundType", "backgroundColor");
      return new _ClockWipeStep({
        ..._ClockWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._ClockWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new ClockWipeFilter(config.clockDirection, config.direction, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/DiamondWipeStep.ts
  var DiamondWipeStep = class _DiamondWipeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "diamondwipe",
      size: 40,
      duration: 1e3,
      easing: "none",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "diamondwipe";
    static name = "DIAMONDWIPE";
    static template = "diamondwipe-config";
    static icon = "<i class='bt-icon diamond-wipe fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_DiamondWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._DiamondWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _DiamondWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _DiamondWipeStep.fromFormElement(arg[0]);
      else return new _DiamondWipeStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "easing", "backgroundType", "backgroundColor");
      return new _DiamondWipeStep({
        ..._DiamondWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    async execute(container) {
      const config = {
        ..._DiamondWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new DiamondTransitionFilter(config.size, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/FadeStep.ts
  var FadeStep = class _FadeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "fade",
      duration: 1e3,
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundColor: "#00000000",
      easing: "none"
    };
    static hidden = false;
    static key = "fade";
    static name = "FADE";
    static template = "fade-config";
    static icon = "<i class='bt-icon fade fa-fw fas'></i>";
    static category = "effect";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_FadeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._FadeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _FadeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _FadeStep.fromFormElement(arg[0]);
      else return new _FadeStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "backgroundType", "backgroundColor", "easing");
      return new _FadeStep({
        ..._FadeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._FadeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new FadeTransitionFilter(background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/FireDissolveStep.ts
  var FireDissolveStep = class _FireDissolveStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "firedissolve",
      duration: 1e3,
      easing: "none",
      burnSize: 1.3,
      version: "1.1.0"
    };
    static hidden = false;
    static key = "firedissolve";
    static name = "FIREDISSOLVE";
    static template = "firedissolve-config";
    static icon = "<i class='bt-icon fire-dissolve fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_FireDissolveStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._FireDissolveStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _FireDissolveStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _FireDissolveStep.fromFormElement(arg[0]);
      else return new _FireDissolveStep(arg);
    }
    static fromFormElement(form) {
      const elem = parseConfigurationFormElements($(form), "id", "duration", "easing", "burnSize");
      return new _FireDissolveStep({
        ..._FireDissolveStep.DefaultSettings,
        ...elem
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const filter = new FireDissolveFilter(this.config.burnSize);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/FlashStep.ts
  var FlashStep = class _FlashStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "flash",
      duration: 250,
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "flash";
    static name = "FLASH";
    static template = "flash-config";
    static icon = "<i class='bt-icon flash fa-fw fas'></i>";
    static category = "effect";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_FlashStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._FlashStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _FlashStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _FlashStep.fromFormElement(arg[0]);
      return new _FlashStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "backgroundType", "backgroundColor");
      return new _FlashStep({
        ..._FlashStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._FlashStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("tranparent");
      const filter = new TextureSwapFilter(background.baseTexture);
      this.addFilter(container, filter);
      await wait(config.duration);
      this.removeFilter(container, filter);
      filter.destroy();
    }
    // #endregion Public Methods (1)
  };

  // src/steps/HueShiftStep.ts
  var HueShiftStep = class _HueShiftStep extends TransitionStep {
    static DefaultSettings = {
      type: "hueshift",
      duration: 0,
      version: "1.1.0",
      maxShift: 0,
      easing: "none"
    };
    static hidden = false;
    static key = "hueshift";
    static name = "HUESHIFT";
    static template = "hueshift-config";
    static category = "effect";
    static icon = "<i class='bt-icon hue-shift fa-fw fas'></i>";
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_HueShiftStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._HueShiftStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _HueShiftStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _HueShiftStep.fromFormElement(arg[0]);
      return new _HueShiftStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const maxShift = elem.find("#maxShift input[type='number']").val();
      return new _HueShiftStep({
        ..._HueShiftStep.DefaultSettings,
        maxShift,
        ...parseConfigurationFormElements(elem, "id", "duration", "easing")
      });
    }
    async execute(container) {
      const config = {
        ..._HueShiftStep.DefaultSettings,
        ...this.config
      };
      const filter = new HueShiftFilter(0);
      this.addFilter(container, filter);
      await TweenMax.to(filter.uniforms, { shift: config.maxShift, duration: config.duration / 1e3, ease: config.easing ?? "none" });
    }
  };

  // src/steps/InvertStep.ts
  var InvertStep = class _InvertStep extends TransitionStep {
    // #region Properties (6)
    static DefaultSettings = {
      type: "invert",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "invert";
    static name = "INVERT";
    static skipConfig = true;
    static template = "";
    static category = "effect";
    static icon = "<i class='bt-icon invert fa-fw fas'></i>";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static RenderTemplate(config) {
      throw new NotImplementedError();
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _InvertStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _InvertStep.fromFormElement(arg[0]);
      else return new _InvertStep(arg);
    }
    static fromFormElement(form) {
      const elem = parseConfigurationFormElements($(form), "id");
      return new _InvertStep({
        id: foundry.utils.randomID(),
        ..._InvertStep.DefaultSettings,
        ...elem
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(container, sequence) {
      const filter = new InvertFilter();
      this.addFilter(container, filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/LinearWipeStep.ts
  var LinearWipeStep = class _LinearWipeStep extends TransitionStep {
    // #region Properties (6)
    defaultSettings = {
      duration: 1e3
    };
    static DefaultSettings = {
      type: "linearwipe",
      duration: 1e3,
      easing: "none",
      direction: "left",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "linearwipe";
    static name = "LINEARWIPE";
    static template = "linearwipe-config";
    static category = "wipe";
    static icon = `<i class="fas fa-fw fa-arrow-right"></i>`;
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_LinearWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._LinearWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        directionSelect: generateLinearDirectionSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _LinearWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _LinearWipeStep.fromFormElement(arg[0]);
      else return new _LinearWipeStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "direction", "easing", "backgroundType", "backgroundColor");
      return new _LinearWipeStep({
        ..._LinearWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._LinearWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new LinearWipeFilter(config.direction, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/MacroStep.ts
  var MacroStep = class _MacroStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "macro",
      macro: "",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "macro";
    static name = "MACRO";
    static template = "macro-config";
    static icon = "<i class='bt-icon macro fa-fw fas'></i>";
    static category = "technical";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_MacroStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._MacroStep.DefaultSettings,
        ...config ? config : {},
        macros: getMacros().sort(sortMacro).map(formatMacro)
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _MacroStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _MacroStep.fromFormElement(arg[0]);
      return new _MacroStep(arg);
    }
    static fromFormElement(form) {
      const elem = parseConfigurationFormElements($(form), "id", "macro");
      return new _MacroStep({
        ..._MacroStep.DefaultSettings,
        ...elem
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // public readonly defaultSettings: Partial<MacroConfiguration> = {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(container, sequence) {
      const config = {
        ..._MacroStep.DefaultSettings,
        ...this.config
      };
      const macro = fromUuidSync(config.macro);
      if (!(macro instanceof Macro)) throw new InvalidMacroError(config.macro);
      return macro.execute();
    }
    // #endregion Public Methods (1)
  };
  function sortMacro(first, second) {
    const firstPack = getCompendiumFromUUID(first.uuid);
    const secondPack = getCompendiumFromUUID(second.uuid);
    if (firstPack !== secondPack) return firstPack.localeCompare(secondPack);
    return first.name.localeCompare(second.name);
  }
  function formatMacro(macro) {
    const retVal = {
      name: macro.name,
      uuid: macro.uuid,
      pack: ""
    };
    if (game.packs) {
      const parsed = macro.uuid.split(".");
      if (parsed[0] === "Compendium") {
        const packId = parsed.slice(1, 3).join(".");
        const pack = game.packs.get(packId);
        if (pack?.documentName === "Macro")
          retVal.pack = pack.title;
      }
    }
    return retVal;
  }

  // src/steps/MeltStep.ts
  var MeltStep = class _MeltStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "melt",
      duration: 1e3,
      version: "1.1.0",
      easing: "none",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "melt";
    static name = "MELT";
    static template = "melt-config";
    static icon = "<i class='bt-icon melt fa-fw fas'></i>";
    static category = "warp";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_MeltStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._MeltStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _MeltStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _MeltStep.fromFormElement(arg[0]);
      else return new _MeltStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroudnimage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "easing", "backgroundType", "backgroundColor");
      return new _MeltStep({
        ..._MeltStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new MeltFilter(background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/SocketHandler.ts
  var TIMEOUT_PERIOD = 3e3;
  var SocketHandler = class {
    #socket;
    async #execute(id) {
      await BattleTransition.executePreparedSequence(id);
    }
    async #prepare(sequence) {
      await BattleTransition.prepareSequence(sequence);
    }
    async execute(sequence) {
      try {
        const id = foundry.utils.randomID();
        const actual = {
          caller: game.user?.id ?? "",
          id,
          sequence: sequence.map((step) => typeof step.id === "undefined" ? { ...step, id: foundry.utils.randomID() } : step)
        };
        if (!sequence.some((step) => step.type === "startplaylist")) {
          const step = {
            ...StartPlaylistStep.DefaultSettings,
            ...new StartPlaylistStep({}).config
          };
          actual.sequence.push(step);
        }
        const expectedDuration = sequence.reduce((prev, curr) => {
          switch (typeof curr.duration) {
            case "string": {
              const duration = parseFloat(curr.duration);
              if (!isNaN(duration)) return prev + duration;
              break;
            }
            case "number": {
              return prev + curr.duration;
            }
          }
          return prev;
        }, 0);
        const users = game.users?.contents.filter((user) => user.active) ?? [];
        const usersPrepared = [];
        await Promise.any([
          Promise.all(users.map((user) => this.#socket.executeAsUser("transition.prep", user.id, actual).then(() => {
            usersPrepared.push(user);
          }))),
          wait(TIMEOUT_PERIOD)
        ]);
        if (usersPrepared.length < users.length)
          ui.notifications?.warn(localize("BATTLETRANSITIONS.WARNINGS.PREPARETIMEOUT"), { console: false });
        await Promise.any([
          Promise.all(usersPrepared.map((user) => this.#socket.executeAsUser("transition.exec", user.id, actual.id))),
          wait(expectedDuration + TIMEOUT_PERIOD)
        ]);
      } catch (err) {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      }
    }
    register(socket) {
      log("Registering socket.");
      this.#socket = socket;
      socket.register("transition.exec", this.#execute.bind(this));
      socket.register("transition.prep", this.#prepare.bind(this));
    }
  };
  var SocketHandler_default = new SocketHandler();

  // src/dialogs/addStepFunctions.ts
  function buildIndex() {
    const steps = getSortedSteps();
    return lunr(function() {
      this.field("name");
      this.field("description");
      this.ref("key");
      for (const step of steps) {
        this.add({
          name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
          description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
          key: step.key
        });
      }
    });
  }
  function clearSearchResults() {
    DO_POSITION_SEARCH_RESULTS = false;
    $("#step-search-results").children().remove();
    $("#step-search-results").css("display", "none");
    $("#clear-search").css("display", "none");
  }
  function createResultsDiv() {
    const div = document.createElement("div");
    div.setAttribute("id", "step-search-results");
    div.classList.add("step-search-results");
    document.body.appendChild(div);
    return $(div);
  }
  function createSearchResultDiv(step) {
    const div = document.createElement("div");
    div.dataset.key = step.key;
    div.innerHTML = localize(`BATTLETRANSITIONS.${step.name}.NAME`);
    if (step.icon) div.innerHTML = `${step.icon}${div.innerHTML}`;
    else div.style.paddingLeft = "calc(1.25em + 12px)";
    return div;
  }
  function getSearchResults(term) {
    const index = buildIndex();
    const results = index.search(term);
    return results.map((res) => getStepClassByKey(res.ref)).filter((res) => !!res);
  }
  function handleSearchInput(input, dialog, cb) {
    const term = input.val();
    if (!term || term.length < 3) {
      hideSearchResults();
      return;
    }
    let resultsDiv = $("#step-search-results");
    if (!resultsDiv || !resultsDiv.length) resultsDiv = createResultsDiv();
    clearSearchResults();
    $("#clear-search").css("display", "block");
    const results = getSearchResults(term);
    for (const step of results) {
      const div = createSearchResultDiv(step);
      $(div).on("click", () => {
        cb(step.key);
      });
      resultsDiv.append(div);
    }
    showSearchResults(input, dialog);
  }
  function hideSearchResults() {
    DO_POSITION_SEARCH_RESULTS = false;
    clearSearchResults();
    $("#clear-search").css("display", "none");
  }
  function positionSearchResults(target, dialog) {
    if (!DO_POSITION_SEARCH_RESULTS) return;
    const resultsDiv = $("#step-search-results");
    if (!resultsDiv?.length || !target.length || dialog instanceof Dialog && dialog.closing || foundry.applications?.api?.DialogV2 && dialog instanceof foundry.applications.api.DialogV2 && dialog.state === -2) {
      clearSearchResults();
      return;
    }
    resultsDiv.css("top", (target?.offset()?.top ?? 0) + (target?.height() ?? 0) + 8);
    resultsDiv.css("left", target?.offset()?.left ?? 0);
    resultsDiv.css("width", target?.width() ?? 150);
    requestAnimationFrame(() => {
      positionSearchResults(target, dialog);
    });
  }
  function showSearchResults(target, dialog) {
    const div = $("#step-search-results");
    div.css("display", "block");
    DO_POSITION_SEARCH_RESULTS = true;
    positionSearchResults(target, dialog);
  }
  var DO_POSITION_SEARCH_RESULTS = false;

  // src/dialogs/AddStepDialogV1.ts
  var AddStepDialogV1 = class {
    // #region Public Static Methods (1)
    static async prompt() {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/dialogs/AddStepDialogV1.hbs`, {
        tabs: [
          {
            icon: "",
            id: "wipes",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WIPES",
            data: getStepsForCategory("wipe")
          },
          {
            icon: "",
            id: "warps",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WARPS",
            data: getStepsForCategory("warp")
          },
          {
            icon: "",
            id: "effects",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.EFFECTS",
            data: getStepsForCategory("effect")
          },
          {
            icon: "",
            id: "technical",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.TECHNICAL",
            data: getStepsForCategory("technical")
          }
        ]
      });
      return new Promise((resolve) => {
        const dialog = new Dialog({
          title: localize("BATTLETRANSITIONS.DIALOGS.ADDSTEP.TITLE"),
          content,
          buttons: {
            cancel: {
              icon: `<i class="fas fa-times"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
              callback: () => {
                resolve(null);
              }
            }
          },
          close: () => {
            clearSearchResults();
          },
          render: (html) => {
            addEventListeners(dialog, $(html), resolve);
          }
        });
        dialog.render(true, { classes: ["dialog", "bt"], resizable: true });
      });
    }
    // #endregion Public Static Methods (1)
  };
  function addEventListeners(dialog, html, resolve) {
    const tabs = new Tabs({
      contentSelector: ".tab-content",
      navSelector: `.tabs[data-group="primary-tabs"]`,
      initial: "wipes",
      callback: () => {
        dialog.setPosition();
      }
    });
    tabs.bind($(html)[0]);
    html.find("#search-text").on("input", (e) => {
      handleSearchInput($(e.currentTarget), dialog, (key) => {
        resolve(key);
        void dialog.close();
      });
    });
    html.find("#clear-search").on("click", () => {
      clearSearchResults();
      html.find("#search-text").val("");
    });
    html.find(`button[data-transition]`).on("click", (e) => {
      e.preventDefault();
      const transition = e.currentTarget?.dataset?.transition ?? "";
      if (transition) resolve(transition);
      else resolve(null);
      void dialog.close();
    });
  }

  // src/dialogs/AddStepDialogV2.ts
  var AddStepDialogV2 = class {
    static async prompt() {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/dialogs/AddStepDialogV2.hbs`, {
        tabs: [
          {
            icon: "",
            id: "wipes",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WIPES",
            data: getStepsForCategory("wipe")
          },
          {
            icon: "",
            id: "warps",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WARPS",
            data: getStepsForCategory("warp")
          },
          {
            icon: "",
            id: "effects",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.EFFECTS",
            data: getStepsForCategory("effect")
          },
          {
            icon: "",
            id: "technical",
            title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.TECHNICAL",
            data: getStepsForCategory("technical")
          }
        ]
      });
      return new Promise((resolve) => {
        const dialog = new foundry.applications.api.DialogV2({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          window: { title: localize("BATTLETRANSITIONS.DIALOGS.ADDSTEP.TITLE") },
          content,
          position: {
            width: 450
          },
          buttons: [
            {
              label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
              action: "cancel",
              callback: () => {
                resolve(null);
                return Promise.resolve();
              }
            }
          ]
        });
        void dialog.render(true).then((dialog2) => {
          addEventListeners2(dialog2, $(dialog2.element), resolve);
        });
      });
    }
  };
  function addEventListeners2(dialog, html, resolve) {
    const tabs = new Tabs({
      contentSelector: ".tab-content",
      navSelector: ".tabs[data-group='primary-tabs']",
      initial: "wipes"
    });
    tabs.bind(dialog.element);
    html.find("button[data-transition]").on("click", (e) => {
      e.preventDefault();
      const transition = e.currentTarget.dataset.transition ?? "";
      if (transition) resolve(transition);
      else resolve(null);
      clearSearchResults();
      void dialog.close();
    });
    html.find("#clear-search").on("click", () => {
      clearSearchResults();
      html.find("#search-text").val("");
    });
    html.find("#search-text").on("input", (e) => {
      handleSearchInput($(e.currentTarget), dialog, (key) => {
        resolve(key);
        void dialog.close();
        clearSearchResults();
      });
    });
  }

  // src/dialogs/EditStepDialogV1.ts
  var EditStepDialogV1 = class {
    static async prompt(config) {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
      const content = await step.RenderTemplate(config);
      return new Promise((resolve) => {
        const dialog = new Dialog({
          title: localize(`BATTLETRANSITIONS.DIALOGS.EDITSTEP.TITLE`, { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
          content,
          buttons: {
            ok: {
              icon: `<i class="fas fa-check"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
              callback: (html) => {
                const config2 = step.from($(html).find("form"))?.config ?? null;
                if (config2) resolve({
                  ...step.DefaultSettings,
                  ...config2
                });
                else resolve(null);
              }
            },
            cancel: {
              icon: `<i class="fas fa-times"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
              callback: () => {
                resolve(null);
              }
            }
          },
          render: (html) => {
            addEventListeners3(dialog, $(html));
            step.addEventListeners($(html), config);
          }
        });
        dialog.render(true, { classes: ["dialog", "bt"], resizable: true, width: 500 });
      });
    }
  };
  function addEventListeners3(dialog, html) {
    html.find("input[type='number'],input[type='text']").on("focus", (e) => {
      e.currentTarget.select();
    });
    const tabs = new Tabs({
      contentSelector: ".tab-content",
      navSelector: ".tabs[data-group='primary-tabs']",
      initial: "wipes"
    });
    tabs.bind(html[0]);
    setBackgroundType(html);
    html.find("#backgroundType").on("change", () => {
      setBackgroundType(html);
    });
    ColorPicker.install();
  }
  function setBackgroundType(html) {
    const bgType = html.find("#backgroundType").val();
    if (bgType === "color") {
      html.find("#backgroundColor").css("display", "block");
      html.find("#backgroundImage").css("display", "none");
    } else if (bgType === "image") {
      html.find("#backgroundImage").css("display", "");
      html.find("#backgroundColor").css("display", "none");
    }
  }

  // src/dialogs/EditStepDialogV2.ts
  var EditStepDialogV2 = class {
    static async prompt(config) {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
      const content = await step.RenderTemplate(config);
      return new Promise((resolve) => {
        const dialog = new foundry.applications.api.DialogV2({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          window: { title: localize(`BATTLETRANSITIONS.DIALOGS.EDITSTEP.TITLE`, { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }) },
          content,
          buttons: [
            {
              label: `<i class="fas fa-check"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK")}`,
              default: true,
              action: "ok",
              callback: (e, button, html) => {
                const config2 = step.from($(html).find("form"))?.config ?? null;
                if (config2) {
                  resolve({
                    ...step.DefaultSettings,
                    ...config2
                  });
                } else {
                  resolve(null);
                }
                return Promise.resolve();
              }
            },
            {
              label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
              action: "cancel"
            }
          ]
        });
        void dialog.render(true).then((dialog2) => {
          dialog2.position.width = 500;
          addEventListeners4(dialog2, $(dialog2.element));
          step.addEventListeners($(dialog2.element), config);
        });
      });
    }
  };
  function addEventListeners4(dialog, html) {
    html.find("input[type='number'],input[type='text']").on("focus", (e) => {
      e.currentTarget.select();
    });
    const tabs = new Tabs({
      contentSelector: ".tab-content",
      navSelector: ".tabs[data-group='primary-tabs']",
      initial: "wipes"
    });
    tabs.bind(dialog.element);
    setBackgroundType2(html);
    html.find("#backgroundType").on("change", () => {
      setBackgroundType2(html);
    });
    ColorPicker.install();
  }
  function setBackgroundType2(html) {
    const bgType = html.find("#backgroundType").val();
    if (bgType === "color") {
      html.find("#backgroundColor").css("display", "block");
      html.find("#backgroundImage").css("display", "none");
    } else if (bgType === "image") {
      html.find("#backgroundImage").css("display", "");
      html.find("#backgroundColor").css("display", "none");
    }
  }

  // src/dialogs/TransitionBuilderV1.ts
  var TransitionBuilderV1 = class {
    static async prompt(scene) {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/dialogs/TransitionBuilder.hbs`, {
        scene: scene?.id,
        scenes: game.scenes?.contents.map((scene2) => ({ id: scene2.id, name: scene2.name })) ?? []
      });
      return new Promise((resolve) => {
        const dialog = new Dialog({
          title: localize("BATTLETRANSITIONS.DIALOGS.TRANSITIONBUILDER.TITLE"),
          content,
          render: (html) => {
            addEventListeners5(dialog, $(html));
          },
          default: "ok",
          buttons: {
            ok: {
              icon: `<i class="fas fa-play"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.TRANSITION"),
              callback: (html) => {
                const elem = $(html);
                const sequence = buildTransitionFromForm(elem);
                const sceneId = scene ? scene.id : elem.find("#scene").val();
                if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
                const step = getStepClassByKey("scenechange");
                if (!step) throw new InvalidTransitionError("scenechange");
                const sceneChange = {
                  ...step.DefaultSettings,
                  scene: sceneId
                };
                resolve([
                  sceneChange,
                  ...sequence
                ]);
              }
            },
            cancel: {
              icon: `<i class="fas fa-times"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
              callback: () => {
                resolve(null);
              }
            }
          }
        });
        dialog.render(true, { resizable: true });
      });
    }
  };
  function addEventListeners5(dialog, html) {
    html.find("button[data-action='add-step']").on("click", (e) => {
      e.preventDefault();
      void addStep(dialog, html);
    });
    html.find("#transition-step-list").sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });
  }
  async function addStep(dialog, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings);
    } else {
      config = {
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      };
    }
    if (!config) return;
    await upsertStepButton(dialog, html, config);
    dialog.setPosition();
  }
  async function upsertStepButton(dialog, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    addStepEventListeners(dialog, html, button, config);
  }
  function addStepEventListeners(dialog, html, button, config) {
    button.find("[data-action='remove']").on("click", () => {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);
      confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
      ).then((confirm2) => {
        if (confirm2) {
          button.remove();
          dialog.setPosition();
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      editStepDialog(config).then((newConfig) => {
        if (newConfig) {
          return upsertStepButton(dialog, html, newConfig);
        }
      }).then(() => {
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }

  // src/dialogs/TransitionBuilderV2.ts
  var TransitionBuilderV2 = class {
    static async prompt(scene) {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/dialogs/TransitionBuilder.hbs`, {
        scene: scene?.id,
        scenes: game.scenes?.contents.map((scene2) => ({ id: scene2.id, name: scene2.name })) ?? []
      });
      return new Promise((resolve) => {
        const dialog = new foundry.applications.api.DialogV2({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          window: { title: localize("BATTLETRANSITIONS.DIALOGS.TRANSITIONBUILDER.TITLE") },
          content,
          buttons: [
            {
              label: `<i class="fas fa-play"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.TRANSITION")}`,
              default: true,
              action: "ok",
              callback: (e, button, html) => {
                const elem = $(html);
                const sequence = buildTransitionFromForm(elem);
                const sceneId = scene ? scene.id : elem.find("#scene").val();
                if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
                const step = getStepClassByKey("scenechange");
                if (!step) throw new InvalidTransitionError("scenechange");
                const sceneChange = {
                  ...step.DefaultSettings,
                  scene: sceneId
                };
                resolve([
                  sceneChange,
                  ...sequence
                ]);
                return Promise.resolve();
              }
            },
            {
              label: `<I class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
              action: "cancel",
              callback: () => {
                resolve(null);
                return Promise.resolve();
              }
            }
          ]
        });
        void dialog.render(true).then((dialog2) => {
          addEventListeners6(dialog2, $(dialog2.element));
        });
      });
    }
  };
  function addEventListeners6(dialog, html) {
    html.find("button[data-action='add-step']").on("click", (e) => {
      e.preventDefault();
      void addStep2(dialog, html);
    });
    html.find("#transition-step-list").sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });
  }
  async function addStep2(dialog, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings);
    } else {
      config = {
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      };
    }
    if (!config) return;
    await upsertStepButton2(dialog, html, config);
  }
  async function upsertStepButton2(dialog, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    addStepEventListeners2(dialog, html, button, config);
  }
  function addStepEventListeners2(dialog, html, button, config) {
    button.find("[data-action='remove']").on("click", () => {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);
      confirm(
        localize(`BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE`, { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
      ).then((confirm2) => {
        if (confirm2)
          button.remove();
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      editStepDialog(config).then((newConfig) => {
        if (newConfig) return upsertStepButton2(dialog, html, newConfig);
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }

  // src/dialogs/functions.ts
  async function addStepDialog() {
    if (shouldUseAppV2()) return AddStepDialogV2.prompt();
    else return AddStepDialogV1.prompt();
  }
  function getStepsForCategory(category, hidden = false) {
    return getSortedSteps().reduce((prev, curr) => curr.category === category && (hidden ? true : curr.hidden === false) ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.${curr.name}.NAME`, description: `BATTLETRANSITIONS.${curr.name}.DESCRIPTION`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, []);
  }
  async function editStepDialog(config) {
    if (shouldUseAppV2()) return EditStepDialogV2.prompt(config);
    else return EditStepDialogV1.prompt(config);
  }
  async function confirm(title, content) {
    if (shouldUseAppV2()) {
      return foundry.applications.api.DialogV2.confirm({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window: { title },
        content
      });
    } else {
      return Dialog.confirm({
        title,
        content
      }).then((val) => !!val);
    }
  }
  function buildTransitionFromForm(html) {
    const sequence = [];
    html.find("#transition-step-list [data-transition-type]").each((index, element) => {
      const flag = element.dataset.flag ?? "";
      const step = JSON.parse(flag);
      sequence.push(step);
    });
    return sequence;
  }
  async function transitionBuilderDialog(scene) {
    if (shouldUseAppV2()) return TransitionBuilderV2.prompt(scene);
    else return TransitionBuilderV1.prompt(scene);
  }

  // src/migration/Migrator.ts
  var import_semver = __toESM(require_semver2());
  var Migrator = class {
    // #endregion Properties (2)
    // #region Public Methods (2)
    Migrate(old) {
      const version = this.Version(old);
      if (import_semver.default.gt(version, this.NewestVersion)) throw new NewerVersionError(version);
      if (!version) throw new InvalidVersionError(typeof version === "string" ? version : version);
      if (version === this.NewestVersion) return old;
      const hash = Object.entries(this.migrationFunctions);
      for (const [key, func] of hash) {
        if (import_semver.default.satisfies(version, key)) {
          return func(old);
        }
      }
      throw new UnableToMigrateError(version, this.NewestVersion);
    }
    NeedsMigration(data) {
      const version = this.Version(data);
      if (import_semver.default.gt(version, this.NewestVersion)) throw new NewerVersionError(version);
      return import_semver.default.lt(version, this.NewestVersion);
    }
    // #endregion Public Abstract Methods (1)
  };

  // src/migration/SceneConfiguration.ts
  var CURRENT_VERSION = "1.1.0";
  var SceneConfigurationMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10X
    };
    Version(data) {
      if (typeof data.version === "undefined") return "1.0.5";
      else return data.version;
    }
    NewestVersion = CURRENT_VERSION;
  };
  function v10X(old) {
    const updated = {
      autoTrigger: old.config?.autoTrigger ?? false,
      version: "1.1.0",
      isTriggered: false,
      sequence: []
    };
    if (Array.isArray(old.steps) && old.steps.length) {
      updated.sequence = old.steps.map((step) => {
        const stepClass = getStepClassByKey(step.type);
        if (!stepClass) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.class);
        const migrator = DataMigration.TransitionSteps[step.type];
        if (!migrator) throw new UnableToMigrateError("undefined", "#{VERSION}#");
        if (migrator.NeedsMigration(step)) return migrator.Migrate(step);
        else return step;
      });
    }
    return updated;
  }

  // src/migration/steps/AngularWipe.ts
  var AngularWipeMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/BilinearWipe.ts
  var BilinearWipeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": V10X
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function V10X(old) {
    return {
      id: old.id,
      type: "bilinearwipe",
      version: "1.1.0",
      duration: old.duration,
      easing: old.easing,
      direction: old.direction,
      radial: old.radial,
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/ClockWipe.ts
  var ClockWipeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": V10X2
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function V10X2(old) {
    return {
      id: old.id,
      type: "clockwipe",
      version: "1.1.0",
      easing: old.easing,
      duration: old.duration,
      direction: old.direction,
      clockDirection: old.clockdirection,
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/DiamondWipe.ts
  var DiamondWipeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": V10X3
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function V10X3(old) {
    return {
      id: old.id,
      type: "diamondwipe",
      version: "1.1.0",
      duration: old.duration,
      size: old.size,
      easing: old.easing,
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/Fade.ts
  var FadeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": V10X4
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function V10X4(old) {
    return {
      id: old.id,
      easing: old.easing,
      duration: old.duration,
      type: "fade",
      version: "1.1.0",
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/FireDissolve.ts
  var FireDissolveMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.1.0": v10XMigration
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10XMigration(old) {
    return {
      id: old.id,
      easing: old.easing,
      duration: old.duration,
      burnSize: old.burnSize,
      type: "firedissolve",
      version: "1.1.0"
    };
  }

  // src/migration/steps/Flash.ts
  var FlashMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/Invert.ts
  var InvertMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/LinearWipe.ts
  var LinearWipeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10XMigration2
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10XMigration2(old) {
    return {
      id: old.id,
      type: "linearwipe",
      version: "1.1.0",
      duration: old.duration,
      direction: old.direction,
      easing: old.easing,
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/Macro.ts
  var MacroMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/Melt.ts
  var MeltMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/Parallel.ts
  var ParallelMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/RadialWipe.ts
  var RadialWipeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10Migration
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10Migration(old) {
    return {
      id: old.id,
      easing: old.easing ?? "none",
      version: "1.1.0",
      radial: old.radial,
      duration: old.duration,
      type: "radialwipe",
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/RemoveOverlay.ts
  var RemoveOverlayMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10Migration2
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10Migration2(old) {
    return {
      type: old.type,
      version: "1.1.0"
    };
  }

  // src/migration/steps/RestoreOverlay.ts
  var RestoreOverlayMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/SceneChange.ts
  var SceneChangeMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/Sound.ts
  var SoundMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": V10X5
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function V10X5(old) {
    return {
      id: old.id,
      file: old.file,
      type: "sound",
      version: "1.1.0",
      volume: old.volume
    };
  }

  // src/migration/steps/SpiralRadialWipe.ts
  var SpiralRadialWipeMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/steps/SpotlightWipe.ts
  var SpotlightWipeMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10X2
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10X2(old) {
    return {
      version: "1.1.0",
      type: "spotlightwipe",
      duration: old.duration,
      easing: old.easing ?? "none",
      direction: old.direction,
      radial: old.radial,
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/TextureSwap.ts
  var TextureSwapMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10X3
    };
    NewestVersion = "1.1";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10X3(old) {
    return {
      version: "1.1.0",
      type: "textureswap",
      bgSizingMode: "stretch",
      backgroundImage: old.texture && !isColor(old.texture) ? old.texture : "",
      backgroundColor: old.texture && !isColor(old.texture) ? "" : old.texture,
      backgroundType: old.texture && !isColor(old.texture) ? "image" : "color"
    };
  }

  // src/migration/steps/Video.ts
  var VideoMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10X4
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10X4(old) {
    return {
      version: "1.1.0",
      type: "video",
      id: old.id,
      file: old.file,
      volume: old.volume,
      clear: old.clear,
      videoSizingMode: "stretch",
      ...migratev10XBackground(old)
    };
  }

  // src/migration/steps/Wait.ts
  var WaitMigrator = class extends Migrator {
    migrationFunctions = {
      "~1.0": v10X5
    };
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };
  function v10X5(old) {
    return {
      type: "wait",
      version: "1.1.0",
      duration: old.duration
    };
  }

  // src/migration/steps/WaveWipe.ts
  var WaveWipeMigrator = class extends Migrator {
    migrationFunctions = {};
    NewestVersion = "1.1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Version(data) {
      return data.version ?? "1.0.5";
    }
  };

  // src/migration/TransitionSteps.ts
  var TransitionSteps = {
    angularwipe: new AngularWipeMigrator(),
    bilinearwipe: new BilinearWipeMigrator(),
    clockwipe: new ClockWipeMigrator(),
    diamondwipe: new DiamondWipeMigrator(),
    fade: new FadeMigrator(),
    firedissolve: new FireDissolveMigrator(),
    flash: new FlashMigrator(),
    invert: new InvertMigrator(),
    linearwipe: new LinearWipeMigrator(),
    macro: new MacroMigrator(),
    melt: new MeltMigrator(),
    parallel: new ParallelMigrator(),
    radialwipe: new RadialWipeMigrator(),
    removeoverlay: new RemoveOverlayMigrator(),
    restoreoverlay: new RestoreOverlayMigrator(),
    scenechange: new SceneChangeMigrator(),
    sound: new SoundMigrator(),
    spiralradialwipe: new SpiralRadialWipeMigrator(),
    spotlightwipe: new SpotlightWipeMigrator(),
    textureswap: new TextureSwapMigrator(),
    video: new VideoMigrator(),
    wait: new WaitMigrator(),
    wavewipe: new WaveWipeMigrator()
  };

  // src/DataMigration.ts
  var DataMigration = class {
    static SceneConfiguration = new SceneConfigurationMigrator();
    static TransitionSteps = TransitionSteps;
  };

  // src/ConfigurationHandler.ts
  var ConfigurationHandler = class _ConfigurationHandler {
    static AddToNavigationBar(buttons) {
      buttons.push(
        {
          name: "BATTLETRANSITIONS.NAVIGATION.TRIGGER",
          icon: `<i class="fas bt-icon fa-fw crossed-swords"></i>`,
          condition: (li) => {
            try {
              const scene = getScene(li);
              if (!scene) return false;
              if (scene.id === canvas?.scene?.id) return false;
              const steps = this.GetSceneTransition(scene) ?? [];
              return Array.isArray(steps) && steps.length;
            } catch (err) {
              ui.notifications?.error(err.message, { console: false });
              console.error(err);
            }
          },
          callback: (li) => {
            const scene = getScene(li);
            if (!scene) throw new InvalidSceneError(typeof li.data("sceneId") === "string" ? li.data("sceneId") : typeof li.data("sceneId"));
            const sequence = this.GetSceneTransition(scene) ?? [];
            if (!(Array.isArray(sequence) && sequence.length)) return;
            const sceneChange = new SceneChangeStep({ scene: scene.id ?? "" });
            const step = {
              ...SceneChangeStep.DefaultSettings,
              ...sceneChange.config
            };
            void BattleTransition.executeSequence([
              step,
              ...sequence
            ]);
          }
        },
        {
          name: "BATTLETRANSITIONS.NAVIGATION.CUSTOM",
          icon: "<i class='fas fa-fw fa-hammer'></i>",
          condition: (li) => {
            const scene = getScene(li);
            if (!scene) return false;
            return scene.id !== canvas?.scene?.id;
          },
          callback: (li) => {
            const sceneId = li.data("sceneId");
            const scene = game.scenes?.get(sceneId);
            if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
            if (scene.canUserModify(game.user, "update"))
              void BattleTransition.BuildTransition(scene);
          }
        }
      );
    }
    static SetSceneConfiguration(scene, config) {
      const newConfig = { ...config };
      const oldFlag = scene.flags["battle-transitions"];
      for (const key in oldFlag) {
        if (!Object.keys(newConfig).includes(key)) newConfig[`-=${key}`] = null;
      }
      return scene.update({
        flags: {
          "battle-transitions": newConfig
        }
      });
    }
    static GetSceneConfiguration(scene) {
      const flags = scene.flags["battle-transitions"];
      if (DataMigration.SceneConfiguration.NeedsMigration(flags)) return DataMigration.SceneConfiguration.Migrate(flags);
      else return flags;
    }
    static GetSceneTransition(scene) {
      const config = _ConfigurationHandler.GetSceneConfiguration(scene);
      return config.sequence;
    }
    static async InjectSceneConfig(app, html, options) {
      const config = _ConfigurationHandler.GetSceneConfiguration(app.object);
      if (game.release?.isNewer("12")) await SceneConfigV12.inject(app, html, options, config);
      else await SceneConfigV11.inject(app, html, options, _ConfigurationHandler.GetSceneConfiguration(app.object));
    }
    static BuildTransitionFromForm(html) {
      const sequence = [];
      html.find("#transition-step-list [data-transition-type]").each((index, element) => {
        const flag = element.dataset.flag ?? "";
        const step = JSON.parse(flag);
        sequence.push(step);
      });
      return sequence;
    }
  };
  function getScene(li) {
    const sceneId = li.data("sceneId");
    if (!sceneId) return void 0;
    if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
    const scene = game.scenes?.get(sceneId);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
    return scene;
  }

  // src/dialogs/SceneConfigV11.ts
  var SceneConfigV11 = class extends SceneConfig {
    static async inject(app, html, options, config) {
      const navElement = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/scene-nav-bar.hbs`, {});
      const navBar = html.find("nav.sheet-tabs.tabs");
      navBar.append(navElement);
      const navContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/scene-config.hbs`, config);
      html.find(`button[type="submit"]`).before(`<div class="tab" data-tab="battle-transitions">${navContent}</div>`);
      addEventListeners7(app, html);
    }
  };
  function addEventListeners7(app, html) {
    html.find("button[data-action='add-step']").on("click", (e) => {
      e.preventDefault();
      void addStep3(app, html);
    });
    html.find("#transition-step-list").sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });
    html.find("button[type='submit']").on("click", () => {
      const autoTrigger = !!(html.find("#auto-trigger").val() ?? false);
      const sequence = buildTransitionFromForm(html);
      void ConfigurationHandler.SetSceneConfiguration(
        app.document,
        {
          version: "1.1.0",
          autoTrigger,
          isTriggered: false,
          sequence
        }
      );
    });
  }
  async function addStep3(app, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings);
    } else {
      config = {
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      };
    }
    if (!config) return;
    await upsertStepButton3(app, html, config);
    app.setPosition();
  }
  async function upsertStepButton3(app, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    addStepEventListeners3(app, html, button, config);
  }
  function addStepEventListeners3(app, html, button, config) {
    button.find("[data-action='remove']").on("click", () => {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);
      confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
      ).then((confirm2) => {
        if (confirm2) {
          button.remove();
          app.setPosition();
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      editStepDialog(config).then((newConfig) => {
        if (newConfig) {
          return upsertStepButton3(app, html, newConfig);
        }
      }).then(() => {
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }

  // src/dialogs/SceneConfigV12.ts
  var SceneConfigV12 = class extends SceneConfig {
    static async inject(app, html, options, config) {
      const navElement = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/scene-nav-bar.hbs`, {});
      const navBar = html.find("nav.sheet-tabs.tabs[data-group='main']");
      navBar.append(navElement);
      const navContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/scene-config.hbs`, config);
      html.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${"battle-transitions"}">${navContent}</div>`);
      for (const step of config.sequence) {
        await upsertStepButton4(app, html, step);
      }
      addEventListeners8(app, html);
    }
  };
  function addEventListeners8(app, html) {
    html.find(`button[data-action="add-step"]`).on("click", (e) => {
      e.preventDefault();
      void addStep4(app, html);
    });
    html.find("#transition-step-list").sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });
    html.find(".sheet-footer button[type='submit']").on("click", () => {
      const autoTrigger = !!(html.find("#auto-trigger").val() ?? false);
      const sequence = buildTransitionFromForm(html);
      void ConfigurationHandler.SetSceneConfiguration(
        app.document,
        {
          version: "1.1.0",
          autoTrigger,
          isTriggered: false,
          sequence
        }
      );
    });
  }
  async function addStep4(app, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings);
    } else {
      config = {
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      };
    }
    if (!config) return;
    await upsertStepButton4(app, html, config);
    app.setPosition();
  }
  async function upsertStepButton4(app, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    addStepEventListeners4(app, html, button, config);
  }
  function addStepEventListeners4(app, html, button, config) {
    button.find("[data-action='remove']").on("click", () => {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);
      confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
      ).then((confirm2) => {
        if (confirm2) {
          button.remove();
          app.setPosition();
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      editStepDialog(config).then((newConfig) => {
        if (newConfig) {
          return upsertStepButton4(app, html, newConfig);
        }
      }).then(() => {
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }

  // src/BattleTransition.ts
  var BattleTransition = class _BattleTransition {
    // #region Properties (2)
    #sequence = [];
    // // eslint-disable-next-line no-unused-private-class-members
    // #transitionOverlay: PIXI.DisplayObject[] = [];
    static SuppressSoundUpdates = false;
    constructor(arg) {
      try {
        if (arg) {
          const scene = coerceScene(arg);
          if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);
          if (scene.id === canvas?.scene?.id) throw new TransitionToSelfError();
          this.#sequence.push({ type: "scenechange", scene: scene.id });
        }
      } catch (err) {
        ui.notifications?.error(err.message);
        throw err;
      }
    }
    // #endregion Constructors (6)
    // #region Public Getters And Setters (1)
    get sequence() {
      return this.#sequence;
    }
    // #endregion Public Getters And Setters (1)
    // #region Public Static Methods (7)
    static async BuildTransition(scene) {
      const transition = await transitionBuilderDialog(scene);
      if (transition) await _BattleTransition.executeSequence(transition);
    }
    static async SelectScene(omitCurrent = false) {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/scene-selector.hbs`, {
        scenes: game.scenes?.contents.reduce((prev, curr) => {
          if (omitCurrent && curr.id === game.scenes?.current?.id) return prev;
          return [...prev, { id: curr.id, name: curr.name }];
        }, [])
      });
      if (shouldUseAppV2()) {
        return foundry.applications.api.DialogV2.wait({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          window: { title: localize("BATTLETRANSITIONS.SCENESELECTOR.TITLE") },
          content,
          buttons: [
            {
              label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
              action: "cancel",
              callback: () => Promise.resolve(null)
            },
            {
              label: `<i class="fas fa-check"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK")}`,
              action: "ok",
              callback: (event, button, dialog) => {
                return Promise.resolve(game.scenes?.get($(dialog).find("#scene").val()) ?? null);
              }
            }
          ]
        });
      } else {
        return Dialog.wait({
          title: localize("BATTLETRANSITIONS.SCENESELECTOR.TITLE"),
          content,
          default: "ok",
          buttons: {
            cancel: {
              icon: `<i class="fas fa-times"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
              callback: () => null
            },
            ok: {
              icon: `<i class="fas fa-check"></i>`,
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
              callback: (html) => game.scenes?.get($(html).find("#scene").val()) ?? null
            }
          }
        });
      }
    }
    static async executePreparedSequence(id) {
      const prepared = PreparedSequences[id];
      if (!prepared) throw new InvalidTransitionError(typeof prepared);
      Hooks.callAll(CUSTOM_HOOKS.TRANSITION_START, prepared.original);
      let container = null;
      try {
        container = await setupTransition();
        prepared.overlay = [...container.children];
        hideLoadingBar();
        _BattleTransition.SuppressSoundUpdates = true;
        for (const step of prepared.prepared.sequence) {
          const exec = step.execute(container, prepared.original, prepared);
          if (exec instanceof Promise) await exec;
        }
        _BattleTransition.SuppressSoundUpdates = false;
        for (const step of prepared.prepared.sequence) {
          await step.teardown(container);
        }
      } finally {
        setTimeout(() => {
          showLoadingBar();
        }, 250);
        if (container) cleanupTransition(container);
        if (prepared) Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END, prepared.original);
        else Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END);
        delete PreparedSequences[id];
      }
    }
    /**
     * Validates a transition sequence and triggers it for all connected clients
     * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[] representing steps of the sequence
     */
    static async executeSequence(sequence) {
      if (sequence[0].type !== "scenechange") throw new InvalidSceneError("undefined");
      const scene = game.scenes?.get(sequence[0].scene);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sequence[0].scene === "string" ? sequence[0].scene : typeof sequence[0].scene);
      if (!scene.canUserModify(game.user, "update")) throw new PermissionDeniedError();
      await SocketHandler_default.execute(sequence);
    }
    /**
     * Prepares a given set of transitions steps for execution, allowing them to preload media etc
     * @param {TransitionSequence[]} sequence - {@link TransitionConfiguration}[] steps to be prepared
     * @returns 
     */
    static async prepareSequence(sequence) {
      try {
        const steps = [];
        for (const temp of sequence.sequence) {
          const step = { ...temp };
          const instance = getStepInstance(step);
          if (!instance) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.type);
          if (Object.prototype.hasOwnProperty.call(step, "backgroundType")) {
            const bgStep = step;
            if (bgStep.serializedTexture) {
              bgStep.deserializedTexture = deserializeTexture(bgStep.serializedTexture);
            } else {
              switch (bgStep.backgroundType) {
                case "color":
                  bgStep.deserializedTexture = deserializeTexture(bgStep.backgroundColor ?? "transparent");
                  break;
                case "image":
                  bgStep.deserializedTexture = deserializeTexture(bgStep.backgroundImage ?? "transparent");
                  break;
              }
            }
          }
          const res = instance.prepare(sequence);
          if (res instanceof Promise) await res;
          steps.push(instance);
        }
        PreparedSequences[sequence.id] = {
          original: sequence,
          prepared: {
            ...sequence,
            sequence: steps
          },
          overlay: []
        };
        return steps;
      } catch (err) {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
        return [];
      }
    }
    static async teardownSequence(container, sequence) {
      for (const step of sequence.sequence) {
        await step.teardown(container);
      }
    }
    static async validateSequence(sequence) {
      try {
        for (const step of sequence) {
          const handler = getStepClassByKey(step.type);
          if (!handler) throw new InvalidTransitionError(step.type);
          const valid = await handler.validate(step);
          if (valid instanceof Error) return valid;
        }
        return true;
      } catch (err) {
        throw err;
      }
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (44)
    /**
     * Adds an angular wipe, mimicking the battle with Brock in Pokemon Fire Red
     * @param {number} [duration=1000] - Duration that the wipe should last
     * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
     * @param {Easing} [easing="none"] - {@link Easing} to use when animating this transition
     * @returns 
     */
    angularWipe(duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "angularwipe",
        duration,
        serializedTexture,
        easing
      });
      return this;
    }
    /**
     * Generate a wipe of alternating bars either horizontally or vertically
     * @param {number} bars - Number of bars into which to split the screen
     * @param {"horizontal" | "vertical"} direction - Direction the bars should travel
     * @param {number} [duration=1000] - Duration, in milliseconds, the wipe should take to complete
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     */
    barWipe(bars, direction, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      const step = getStepClassByKey("barwipe");
      if (!step) throw new InvalidTransitionError("barwipe");
      this.#sequence.push({
        ...step.DefaultSettings,
        duration,
        bars,
        easing,
        direction,
        serializedTexture
      });
      return this;
    }
    /**
     * Adds a bilinear wipe
     * @param {BilinearDirection} direction - {@link BilinearDirection}
     * @param {RadialDirection} radial - {@link RadialDirection}
     * @param {number} [duration=1000] - Duration in milliseconds that the wipe should last
     * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    bilinearWipe(direction, radial, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "bilinearwipe",
        serializedTexture,
        duration,
        direction,
        radial,
        easing
      });
      return this;
    }
    /**
     * Triggers an animation from the Boss Splash Screen module
     * @param {BossSplashConfiguration} config - {@link BossSplashConfiguration}
     */
    bossSplash(config) {
      const step = getStepClassByKey("bosssplash");
      if (!step) throw new InvalidTransitionError("bosssplash");
      const newConfig = {
        ...step.DefaultSettings,
        ...config
      };
      this.#sequence.push(newConfig);
      return this;
    }
    /**
     * Dissolves the screen with a fire sort of effect
     * @param {number} [duration=1000] - Duration, in milliseconds, the dissolve should take to complete
     * @param {number} [burnSize=1.3] - Relative size of the burn effect
     * @param {Easing} [easing="none"] - {@link Easing}
     */
    burn(duration = 1e3, burnSize = 1.3, easing = "none") {
      this.#sequence.push({
        type: "firedissolve",
        duration,
        burnSize,
        easing
      });
      return this;
    }
    /**
     * Adds a clock wipe to the queue
     * @param {ClockDirection} clockDirection - {@link ClockDirection}
     * @param {WipeDirection} direction - {@link WipeDirection}
     * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should last
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    clockWipe(clockDirection, direction, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "clockwipe",
        serializedTexture,
        duration,
        clockDirection,
        direction,
        easing
      });
      return this;
    }
    /**
     * Adds a wipe that causes diamond-shapes to disappear over time from left to right
     * @param {number} [size=40] - Relative size of the diamonds
     * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should last
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    diamondWipe(size = 40, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "diamondwipe",
        serializedTexture,
        size,
        duration,
        easing
      });
      return this;
    }
    /**
     * Executes the transition sequence built for this {@link BattleTransition} instance.
     * @returns {Promise} - A promise that resolves when the transition is done for all users
     */
    async execute() {
      if (!(Array.isArray(this.#sequence) && this.#sequence.length)) throw new InvalidTransitionError(typeof this.#sequence);
      await SocketHandler_default.execute(this.#sequence);
    }
    /**
     * Fades the screen
     * @param {number} [duration=1000] - Duration, in milliseconds, the fade should take to complete
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    fade(duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "fade",
        serializedTexture,
        duration,
        easing
      });
      return this;
    }
    /**
     * Changes the current overlay texture to another for a specified amount of time
     * @param {TextureLike} texture - {@link TextureLike}
     * @param {number} [duration] - Duration, in milliseconds, for this effect to last
     * @returns 
     */
    flash(texture, duration) {
      const step = getStepClassByKey("flash");
      if (!step) throw new InvalidTransitionError("flash");
      const serializedTexture = serializeTexture(texture);
      this.#sequence.push({
        ...step.DefaultSettings,
        duration,
        serializedTexture
      });
      return this;
    }
    /**
     * 
     * @param {number} amount - Amount by which to shift the hue
     * @param {number} [duration=0] - Duration, in milliseconds, the shift should take to complete
     */
    hueShift(amount, duration = 0) {
      const step = getStepClassByKey("hueshift");
      if (!step) throw new InvalidTransitionError("hueshift");
      const config = {
        ...step.DefaultSettings,
        maxShift: amount,
        duration
      };
      this.#sequence.push(config);
      return this;
    }
    /**
     * Inverts the current overlay texture
     * @returns 
     */
    invert() {
      const step = getStepClassByKey("invert");
      if (!step) throw new InvalidTransitionError("invert");
      this.#sequence.push({
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      });
      return this;
    }
    /**
     * Adds a linear wipe to the queue
     * @param {WipeDirection} direction - The side of the screen from which the wipe should start
     * @param {number} [duration=1000] - Duration, in milliseconds, for this wipe to take to complete
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    linearWipe(direction, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "linearwipe",
        serializedTexture,
        direction,
        duration,
        easing
      });
      return this;
    }
    /**
     * Queues up a macro execution
     * @param {string | Macro} macro - The {@link Macro} to execute
     * @returns 
     */
    macro(macro) {
      const actualMacro = coerceMacro(macro);
      if (!actualMacro) throw new InvalidMacroError(typeof macro === "string" ? macro : typeof macro);
      this.#sequence.push({
        type: "macro",
        macro: actualMacro.uuid
      });
      return this;
    }
    /**
     * Queues up a Doom-style screen melt
     * @param {number} [duration=1000] - Duration, in milliseconds the melt should take to complete
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     */
    melt(duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "melt",
        serializedTexture,
        duration,
        easing
      });
      return this;
    }
    /**
     * Queues up a set of sequences to run in parallel
     * @param callbacks 
     * @returns 
     */
    parallel(...callbacks) {
      const sequences = [];
      for (const callback of callbacks) {
        const res = callback(new _BattleTransition());
        if (res instanceof Promise) throw new ParallelExecuteError();
        sequences.push(res.sequence);
      }
      const step = getStepClassByKey("parallel");
      if (!step) throw new InvalidTransitionError("parallel");
      const config = {
        ...step?.DefaultSettings,
        sequences
      };
      this.#sequence.push(config);
      return this;
    }
    /**
     * Progressively increases the relative size of displayed pixels
     * @param {number} [maxSize=10] - Relative size of pixels
     * @param {number} [duration=1000] - Duration, in milliseconds, to scale up the pixels
     */
    pixelate(maxSize = 100, duration = 1e3) {
      const step = getStepClassByKey("pixelate");
      if (!step) throw new InvalidTransitionError("pixelate");
      const config = {
        ...step.DefaultSettings,
        maxSize,
        duration
      };
      this.#sequence.push(config);
      return this;
    }
    /**
     * Queues up a radial wipe
     * @param {RadialDirection} direction - {@link RadialDirection}
     * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should take to complete
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    radialWipe(direction, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "radialwipe",
        serializedTexture,
        radial: direction,
        duration,
        easing
      });
      return this;
    }
    /**
     * Will remove the current transition overlay, exposing the new scene
     */
    removeOverlay() {
      this.#sequence.push({ id: foundry.utils.randomID(), type: "removeoverlay", version: "1.1.0" });
      return this;
    }
    /**
     * Removes any active transition effects from the overlay.
     */
    clearEffects() {
      const step = getStepClassByKey("cleareffects");
      if (!step) throw new InvalidTransitionError("cleareffects");
      this.#sequence.push({
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      });
      return this;
    }
    repeat(iterations, ...args) {
      const delay = typeof args[0] === "number" ? args[0] : 0;
      const callback = typeof args[0] === "number" ? args[1] : args[0];
      if (typeof callback === "function" && !this.#sequence.some((step2) => step2.type !== "scenechange")) throw new NoPreviousStepError();
      const step = getStepClassByKey("repeat");
      if (!step) throw new InvalidTransitionError("repeat");
      if (callback) {
        const transition = new _BattleTransition();
        const res = callback(transition);
        if (res instanceof Promise) throw new RepeatExecuteError();
        this.#sequence.push({
          ...step.DefaultSettings,
          iterations,
          delay,
          style: "sequence",
          sequence: res.sequence
        });
      } else {
        this.#sequence.push({
          ...step.DefaultSettings,
          iterations: iterations - 1,
          delay,
          style: "previous"
        });
      }
      return this;
    }
    restoreOverlay() {
      this.#sequence.push({ id: foundry.utils.randomID(), type: "restoreoverlay", version: "1.1.0" });
      return this;
    }
    sound(arg, volume = 100) {
      const sound = typeof arg === "string" ? arg : arg instanceof Sound ? arg.id : null;
      if (!sound) throw new InvalidSoundError(typeof arg === "string" ? arg : typeof arg);
      this.#sequence.push({
        type: "sound",
        volume,
        file: sound
      });
      return this;
    }
    /**
     * Queues up a wipe that operates much like a radial wipe, but in a spiral pattern rather than circular
     * @param {ClockDirection} direction - {@link ClockDirection}
     * @param {RadialDirection} radial - {@link RadialDirection}
     * @param {number} [duration=1000] - Duration, in milliseconds, the wipe should last
     * @param {TextureLike} [background="transparent"] {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    spiralShutter(direction, radial, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "spiralradialwipe",
        serializedTexture,
        duration,
        easing,
        direction,
        radial
      });
      return this;
    }
    /**
     * A linear spiral wipe
     * @param {ClockDirection} clock - Whether the spiral travels clockwise or counterclockwise
     * @param {RadialDirection} radial - Whether the spiral starts from the inside or outside of the overlay
     * @param {WipeDirection} direction - Side of the screen from which the wipe starts
     * @param {number} [duration=1000] - Duration, in milliseconds, for the wipe to last
     * @param {TextureLike} background - {@link TextureLike}
     * @param {Easing} easing - {@link Easing}
     * @returns 
     */
    spiralWipe(clock, radial, direction, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      const backgroundType = typeof serializedTexture === "string" && isColor(serializedTexture) ? "color" : "image";
      this.#sequence.push({
        type: "spiralwipe",
        version: "1.1.0",
        duration,
        direction,
        clockDirection: clock,
        radial,
        easing,
        bgSizingMode: "stretch",
        backgroundType,
        serializedTexture
      });
      return this;
    }
    /**
     * Queues up a spotlight-shaped wipe
     * @param {WipeDirection} direction - {@link WipeDirection}
     * @param {RadialDirection} radial - {@link RadialDirection}
     * @param {number} [duration=1000] - Duration, in miliseconds, for the wipe to last
     * @param {TextureLike} [background="transparent"] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    spotlightWipe(direction, radial, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "spotlightwipe",
        direction,
        radial,
        duration,
        serializedTexture,
        easing
      });
      return this;
    }
    /**
     * Swaps the current overlay texture
     * @param {TextureLike} texture - {@link TextureLike}
     * @returns 
     */
    textureSwap(texture) {
      const serializedTexture = serializeTexture(texture);
      this.#sequence.push({
        type: "textureswap",
        serializedTexture
      });
      return this;
    }
    twist(duration = 1e3, direction = "clockwise", maxAngle = 10) {
      this.#sequence.push({
        type: "twist",
        duration,
        direction,
        maxAngle
      });
      return this;
    }
    video(file, ...args) {
      const volume = args.find((arg) => typeof arg === "number") ?? 100;
      const clear = args.find((arg) => typeof arg === "boolean") ?? false;
      const background = args.find((arg) => !(typeof arg === "boolean" || typeof arg === "number")) ?? "transparent";
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "video",
        volume,
        file,
        serializedTexture,
        clear
      });
      return this;
    }
    /**
     * Adds a step to simply wait a given amount of time before continuing.
     * @param {number} duration - Amount of time, in milliseconds, to wait.
     */
    wait(duration) {
      this.#sequence.push({ type: "wait", duration });
      return this;
    }
    /**
     * Triggers a wavey saw-like wipe
     * @param {RadialDirection} direction - {@link RadialDirection}
     * @param {number} [duration=1000] - Duration, in milliseconds, for the wipe to last
     * @param {TextureLike} [background=1000] - {@link TextureLike}
     * @param {Easing} [easing="none"] - {@link Easing}
     * @returns 
     */
    waveWipe(direction, duration = 1e3, background = "transparent", easing = "none") {
      const serializedTexture = serializeTexture(background);
      this.#sequence.push({
        type: "wavewipe",
        serializedTexture,
        direction,
        duration,
        easing
      });
      return this;
    }
    zoomBlur(duration = 1e3, maxStrength = 0.5, innerRadius = 0) {
      this.#sequence.push({
        type: "zoomblur",
        duration,
        maxStrength,
        innerRadius
      });
      return this;
    }
    // #endregion Public Methods (44)
  };
  function getStepInstance(step) {
    const handler = getStepClassByKey(step.type);
    if (!handler) throw new InvalidTransitionError(step.type);
    return handler.from(step);
  }

  // src/steps/ParallelStep.ts
  var ParallelStep = class _ParallelStep extends TransitionStep {
    // #region Properties (8)
    #preparedSequences = [];
    static DefaultSettings = {
      type: "parallel",
      version: "1.1.0",
      sequences: []
    };
    static category = "technical";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-arrows-down-to-line"></i>`;
    static key = "parallel";
    static name = "PARALLEL";
    static template = "parallel-config";
    // #endregion Properties (8)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ParallelStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._ParallelStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static async addEventListeners(html, config) {
      if (Array.isArray(config?.sequences) && config.sequences.length) {
        for (const sequence of config.sequences)
          await addSequence(html, sequence);
      } else {
        await addSequence(html, []);
        await addSequence(html, []);
      }
      void selectSequence(html, 0);
      html.find(`button[data-action="add-sequence"]`).on("click", (e) => {
        e.preventDefault();
        addSequence(html, []).then(() => {
          const index = html.find("#sequence-list .sequence-item").length - 1;
          void selectSequence(html, index);
        }).catch((err) => {
          ui.notifications?.error(err.message, { console: false });
          console.error(err);
        });
      });
      html.find("[data-action='add-step']").on("click", (e) => {
        e.preventDefault();
        void addStep5(html);
      });
      html.find("#selected-sequence-steps").sortable({
        handle: ".drag-handle",
        containment: "parent",
        axis: "y"
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _ParallelStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _ParallelStep.fromFormElement(arg[0]);
      else return new _ParallelStep(arg);
    }
    static fromFormElement(form) {
      const sequences = [];
      const elem = $(form);
      elem.find(".sequence-item").each((i, item) => {
        if (!item.dataset.sequence) return;
        const sequence = JSON.parse(item.dataset.sequence);
        sequences.push(sequence);
      });
      const config = {
        ..._ParallelStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id"),
        sequences
      };
      return new _ParallelStep(config);
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (2)
    async execute(container, sequence) {
      await Promise.all(this.#preparedSequences.map((prepared) => this.executeSequence(container, sequence, prepared)));
    }
    async prepare(sequence) {
      const config = {
        ..._ParallelStep.DefaultSettings,
        ...this.config
      };
      this.#preparedSequences = [];
      for (const step of config.sequences) {
        const prepared = await BattleTransition.prepareSequence({
          ...sequence,
          sequence: step
        });
        this.#preparedSequences.push(prepared);
      }
    }
    // #endregion Public Methods (2)
    // #region Private Methods (1)
    async executeSequence(container, sequence, steps) {
      for (const step of steps) {
        const res = step.execute(container, sequence);
        if (res instanceof Promise) await res;
      }
    }
    // #endregion Private Methods (1)
  };
  async function addSequence(html, sequence = []) {
    const index = html.find("#sequence-list .sequence-item").length;
    const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/sequence-item.hbs`, {
      index,
      sequence,
      serialized: JSON.stringify(sequence),
      name: localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index: index + 1 })
    });
    const item = $(content);
    html.find("button[data-action='add-sequence']").before(item);
    addSequenceItemEventListeners(item);
  }
  function addSequenceItemEventListeners(html) {
    html.find("[data-action='configure']").on("click", () => {
      const index = html.data("index");
      void selectSequence(html.parents("[data-transition-type='parallel']"), index);
    });
    html.find("[data-action='remove']").on("click", (e) => {
      e.preventDefault();
      const index = html.data("index");
      confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index }) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index }) })
      ).then((val) => {
        if (val) {
          const parent = html.parents("#sequence-list");
          html.remove();
          renumberSequences(parent);
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }
  async function addStep5(html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    const config = step.skipConfig ? step.DefaultSettings : await editStepDialog(step.DefaultSettings);
    if (!config) return;
    void upsertStepButton5(html, config);
  }
  function addStepEventListeners5(html, button, config) {
    button.find("[data-action='remove']").on("click", () => {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);
      confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
      ).then((confirm2) => {
        if (confirm2) {
          button.remove();
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      editStepDialog(config).then((newConfig) => {
        if (newConfig) {
          return upsertStepButton5(html, newConfig);
        }
      }).then(() => {
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }
  function buildTransition(html) {
    const sequence = [];
    html.find("#selected-sequence-steps [data-transition-type]").each((index, element) => {
      const flag = element.dataset.flag ?? "";
      if (!flag) return;
      const step = JSON.parse(flag);
      sequence.push(step);
    });
    return sequence;
  }
  function renumberSequences(html) {
    html.find("[data-sequence]").each((i, elem) => {
      $(elem).data("index", i);
      $(elem).find("[data-action='configure']").text(localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index: i + 1 }));
    });
  }
  async function selectSequence(html, index) {
    const elem = html.find(`.sequence-item[data-index="${index}"]`);
    const serialized = elem.attr("data-sequence");
    const sequence = JSON.parse(serialized);
    const sequenceContainer = html.find("#selected-sequence");
    sequenceContainer.data("index", index);
    sequenceContainer.find("#sequence-name").text(localize(`BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE`, { index: index + 1 }));
    const stepContainer = sequenceContainer.find("#selected-sequence-steps");
    stepContainer.children().remove();
    for (const step of sequence) {
      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.type);
      await upsertStepButton5(html, step);
    }
  }
  async function upsertStepButton5(html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#selected-sequence-steps").append(button);
    addStepEventListeners5(html, button, config);
    const index = button.parents("[data-index]").data("index");
    const sequence = buildTransition(html);
    html.find(`#sequence-list [data-index="${index}"]`).attr("data-sequence", JSON.stringify(sequence));
  }

  // src/steps/PixelateStep.ts
  var PixelateStep = class _PixelateStep extends TransitionStep {
    static DefaultSettings = {
      type: "pixelate",
      version: "1.1.0",
      maxSize: 100,
      duration: 1e3,
      easing: "none"
    };
    static hidden = false;
    static key = "pixelate";
    static name = "PIXELATE";
    static template = "pixelate-config";
    static category = "effect";
    static icon = `<i class="fas fa-fw fa-image"></i>`;
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_PixelateStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._PixelateStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _PixelateStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _PixelateStep.fromFormElement(arg[0]);
      else return new _PixelateStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      return new _PixelateStep({
        ..._PixelateStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "maxSize")
      });
    }
    async execute(container) {
      const filter = new PIXI.filters.PixelateFilter(1);
      this.addFilter(container, filter);
      const config = {
        ..._PixelateStep.DefaultSettings,
        ...this.config
      };
      await TweenMax.to(filter.uniforms.size, { 0: config.maxSize, 1: config.maxSize, duration: config.duration / 1e3, ease: config.easing });
    }
  };

  // src/steps/RadialWipeStep.ts
  var RadialWipeStep = class _RadialWipeStep extends TransitionStep {
    // #region Properties (6)
    defaultSettings = {
      duration: 1e3,
      easing: "none"
    };
    static DefaultSettings = {
      type: "radialwipe",
      easing: "none",
      radial: "inside",
      duration: 1e3,
      bgSizingMode: "stretch",
      version: "1.1.0",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "radialwipe";
    static name = "RADIALWIPE";
    static template = "radialwipe-config";
    static icon = "<i class='bt-icon radial-wipe fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_RadialWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._RadialWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        radialSelect: generateRadialDirectionSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _RadialWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _RadialWipeStep.fromFormElement(arg[0]);
      else return new _RadialWipeStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const serializedTexture = elem.find("#backgroundImage").val() ?? "";
      return new _RadialWipeStep({
        ..._RadialWipeStep.DefaultSettings,
        serializedTexture,
        ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._RadialWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new RadialWipeFilter(config.radial, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/RemoveOverlayStep.ts
  var RemoveOverlayStep = class _RemoveOverlayStep extends TransitionStep {
    // #region Properties (6)
    static DefaultSettings = {
      type: "removeoverlay",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "removeoverlay";
    static name = "REMOVEOVERLAY";
    static skipConfig = true;
    static template = "";
    static icon = "<i class='bt-icon remove-overlay fa-fw fas'></i>";
    static category = "technical";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static RenderTemplate(config) {
      throw new NotImplementedError();
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _RemoveOverlayStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _RemoveOverlayStep.fromFormElement(arg[0]);
      else return new _RemoveOverlayStep(arg);
    }
    static fromFormElement(form) {
      return new _RemoveOverlayStep({
        ..._RemoveOverlayStep.DefaultSettings,
        ...parseConfigurationFormElements($(form), "id")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(container, sequence) {
      container.alpha = 0;
    }
    // #endregion Public Methods (1)
  };

  // src/steps/WaitStep.ts
  var CURRENT_VERSION2 = "1.1.0";
  var WaitStep = class _WaitStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "wait",
      duration: 0,
      version: CURRENT_VERSION2
    };
    static hidden = false;
    static key = "wait";
    static name = "WAIT";
    static template = "wait-config";
    static icon = "<i class='bt-icon wait fa-fw fas'></i>";
    static category = "technical";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_WaitStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._WaitStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _WaitStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _WaitStep.fromFormElement(arg[0]);
      else return new _WaitStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      return new _WaitStep({
        ..._WaitStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    execute() {
      const config = {
        ..._WaitStep.DefaultSettings,
        ...this.config
      };
      return new Promise((resolve) => {
        setTimeout(resolve, config.duration);
      });
    }
    // #endregion Public Methods (1)
  };

  // src/steps/RepeatStep.ts
  var RepeatStep = class _RepeatStep extends TransitionStep {
    // #region Properties (8)
    #preparedSequence = [];
    static DefaultSettings = {
      id: "",
      type: "repeat",
      version: "1.1.0",
      style: "previous",
      delay: 0,
      iterations: 2
    };
    static category = "technical";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-repeat"></i>`;
    static key = "repeat";
    static name = "REPEAT";
    static template = "repeat-config";
    // #endregion Properties (8)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_RepeatStep.template}.hbs`, {
        ..._RepeatStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        styleSelect: {
          sequence: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.SEQUENCE.LABEL",
          previous: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.PREVIOUS.LABEL"
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static addEventListeners(elem, config) {
      const html = $(elem);
      setStyle(html);
      html.find("#style").on("input", () => {
        setStyle(html);
      });
      html.find("[data-action='add-step']").on("click", (e) => {
        e.preventDefault();
        void addStep6(html);
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _RepeatStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _RepeatStep.fromFormElement(arg[0]);
      else return new _RepeatStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const sequence = buildTransition2(elem);
      return new _RepeatStep({
        ..._RepeatStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "iterations", "style", "delay"),
        id: foundry.utils.randomID(),
        sequence
      });
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    async execute(container, sequence) {
      for (const step of this.#preparedSequence) {
        const res = step.execute(container, sequence);
        if (res instanceof Promise) await res;
      }
    }
    async prepare(sequence) {
      const config = {
        ..._RepeatStep.DefaultSettings,
        ...this.config
      };
      if (config.style === "sequence" && !config.sequence?.length) throw new InvalidTransitionError(_RepeatStep.key);
      const currentStep = sequence.sequence.findIndex((step) => step.id === config.id);
      if (currentStep === -1) throw new InvalidTransitionError(_RepeatStep.key);
      const previousStep = sequence.sequence[currentStep - 1];
      if (!previousStep) throw new InvalidTransitionError(_RepeatStep.key);
      const waitConfig = {
        ...WaitStep.DefaultSettings,
        duration: config.delay
      };
      const hydratedSequence = [];
      if (config.delay && config.style === "previous") hydratedSequence.push(waitConfig);
      if (config.style === "previous") {
        for (let i = 0; i < config.iterations - 1; i++) {
          hydratedSequence.push({
            ...previousStep,
            id: foundry.utils.randomID()
          });
          if (config.delay) hydratedSequence.push(waitConfig);
        }
      } else if (config.style === "sequence") {
        hydratedSequence.push(...config.sequence ?? []);
        if (config.delay) hydratedSequence.push(waitConfig);
      }
      this.#preparedSequence = await BattleTransition.prepareSequence({
        ...sequence,
        sequence: hydratedSequence
      });
    }
    // #endregion Public Methods (2)
  };
  async function addStep6(html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    const config = step.skipConfig ? step.DefaultSettings : await editStepDialog(step.DefaultSettings);
    if (!config) return;
    void upsertStepButton6(html, config);
  }
  function addStepEventListeners6(html, button, config) {
    button.find("[data-action='remove']").on("click", () => {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);
      confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
      ).then((confirm2) => {
        if (confirm2) {
          button.remove();
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      editStepDialog(config).then((newConfig) => {
        if (newConfig) {
          return upsertStepButton6(html, newConfig);
        }
      }).then(() => {
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
  }
  function buildTransition2(html) {
    const sequence = [];
    html.find("#transition-step-list [data-transition-type]").each((index, element) => {
      const flag = element.dataset.flag ?? "";
      if (!flag) return;
      const step = JSON.parse(flag);
      sequence.push(step);
    });
    return sequence;
  }
  function setStyle(html) {
    const style = html.find("#style").val();
    html.find("[data-repeat-style='previous']").css("display", style === "previous" ? "block" : "none");
    html.find("[data-repeat-style='sequence']").css("display", style === "sequence" ? "block" : "none");
    html.find("#sequenceContainer").css("display", style === "sequence" ? "block" : "none");
  }
  async function upsertStepButton6(html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    addStepEventListeners6(html, button, config);
    const index = button.parents("[data-index]").data("index");
    const sequence = buildTransition2(html);
    html.find(`#sequence-list [data-index="${index}"]`).attr("data-sequence", JSON.stringify(sequence));
  }

  // src/steps/RestoreOverlayStep.ts
  var RestoreOverlayStep = class _RestoreOverlayStep extends TransitionStep {
    // #region Properties (6)
    static template = "";
    static DefaultSettings = {
      type: "restoreoverlay",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "restoreoverlay";
    static name = "RESTOREOVERLAY";
    static skipConfig = true;
    static icon = "<i class='bt-icon restore-overlay fa-fw fas'></i>";
    static category = "technical";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static RenderTemplate(config) {
      throw new NotImplementedError();
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _RestoreOverlayStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _RestoreOverlayStep.fromFormElement(arg[0]);
      else return new _RestoreOverlayStep(arg);
    }
    static fromFormElement(form) {
      return new _RestoreOverlayStep({
        ..._RestoreOverlayStep.DefaultSettings,
        ...parseConfigurationFormElements($(form), "id")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(container, sequence) {
      container.alpha = 1;
    }
    // #endregion Public Methods (1)
  };

  // src/steps/SceneChangeStep.ts
  var SceneChangeStep = class _SceneChangeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "scenechange",
      scene: "",
      version: "1.1.0"
    };
    static hidden = true;
    static key = "scenechange";
    static name = "SCENECHANGE";
    static template = "scenechange-config";
    static icon = "<i class='bt-icon scene-change fa-fw fas'></i>";
    static category = "technical";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SceneChangeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._SceneChangeStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _SceneChangeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _SceneChangeStep.fromFormElement(arg[0]);
      else return new _SceneChangeStep(arg);
    }
    static fromFormElement(form) {
      const elem = parseConfigurationFormElements($(form), "id", "scene");
      return new _SceneChangeStep({
        ..._SceneChangeStep.DefaultSettings,
        ...elem
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (2)
    async execute(container, sequence) {
      if (this.config.scene === canvas?.scene?.id) {
        throw new SequenceTimedOutError();
      }
      if (sequence.caller === game.user.id) await activateScene({
        ..._SceneChangeStep.DefaultSettings,
        ...this.config
      }.scene);
      else await awaitHook(CUSTOM_HOOKS.SCENE_ACTIVATED);
      hideTransitionCover();
    }
    async validate() {
      const scene = game.scenes.get(this.config.scene);
      if (!(scene instanceof Scene)) return Promise.resolve(new InvalidSceneError({
        ..._SceneChangeStep.DefaultSettings,
        ...this.config
      }.scene));
      else return Promise.resolve(true);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/SoundStep.ts
  var SoundStep = class _SoundStep extends TransitionStep {
    // #region Properties (6)
    #sound = null;
    static DefaultSettings = {
      type: "sound",
      volume: 100,
      file: "",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "sound";
    static name = "SOUND";
    static template = "sound-config";
    static icon = "<i class='bt-icon sound fa-fw fas'></i>";
    static category = "technical";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SoundStep.template}.hbs`, {
        ..._SoundStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _SoundStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _SoundStep.fromFormElement(arg[0]);
      else return new _SoundStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const file = elem.find("#file").val() ?? "";
      const volume = elem.find("#volume").val() ?? 100;
      return new _SoundStep({
        ..._SoundStep.DefaultSettings,
        file,
        volume,
        ...parseConfigurationFormElements(elem, "id")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (3)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._SoundStep.DefaultSettings,
        ...this.config
      };
      const sound = await foundry.audio.AudioHelper.play({ src: this.config.file, volume: config.volume / 100, autoplay: true }, true);
      this.#sound = sound;
    }
    async prepare() {
      await foundry.audio.AudioHelper.preloadSound(this.config.file);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    teardown(container) {
      this.#sound?.stop();
    }
    // #endregion Public Methods (3)
  };

  // src/steps/SpiralShutterStep.ts
  var SpiralShutterStep = class _SpiralShutterStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      type: "spiralshutter",
      duration: 1e3,
      direction: "clockwise",
      radial: "inside",
      easing: "none",
      bgSizingMode: "stretch",
      version: "1.1.0",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "spiralshutter";
    static name = "SPIRALSHUTTER";
    static template = "spiralshutter-config";
    static category = "wipe";
    static icon = "<i class='bt-icon spiral-shutter fa-fw fas'></i>";
    // #endregion Properties (5)
    // #region Public Static Methods (6)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SpiralShutterStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._SpiralShutterStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        radialSelect: generateRadialDirectionSelectOptions(),
        directionSelect: generateClockDirectionSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _SpiralShutterStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _SpiralShutterStep.fromFormElement(arg[0]);
      else return new _SpiralShutterStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const backgroundImage = elem.find("#backgroundImage").val() ?? "";
      return new _SpiralShutterStep({
        ..._SpiralShutterStep.DefaultSettings,
        backgroundImage,
        ...parseConfigurationFormElements(elem, "id", "duration", "easing", "backgroundType", "backgroundColor", "direction", "radial")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._SpiralShutterStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new SpiralShutterFilter(config.direction, config.radial, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/SpiralWipeStep.ts
  var SpiralWipeStep = class _SpiralWipeStep extends TransitionStep {
    static DefaultSettings = {
      type: "spiralwipe",
      duration: 1e3,
      direction: "left",
      clockDirection: "clockwise",
      radial: "outside",
      easing: "none",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "spiralwipe";
    static name = "SPIRALWIPE";
    static template = "spiralwipe-config";
    static category = "wipe";
    static icon = `<i class="fas fa-fw fa-arrows-spin"></i>`;
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SpiralWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._SpiralWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        radialSelect: generateRadialDirectionSelectOptions(),
        directionSelect: {
          top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
          left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
          right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
          bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
        },
        clockDirectionSelect: generateClockDirectionSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _SpiralWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _SpiralWipeStep.fromFormElement(arg[0]);
      else return new _SpiralWipeStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const backgroundImage = elem.find("#backgroundImage").val() ?? "";
      return new _SpiralWipeStep({
        ..._SpiralWipeStep.DefaultSettings,
        backgroundImage,
        ...parseConfigurationFormElements(elem, "id", "duration", "backgroundType", "backgroundColor", "radial", "direction", "clockDirection", "easing")
      });
    }
    async execute(container) {
      const config = {
        ..._SpiralWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new SpiralWipeFilter(config.clockDirection, config.radial, config.direction, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
  };

  // src/steps/SpotlightWipeStep.ts
  var SpotlightWipeStep = class _SpotlightWipeStep extends TransitionStep {
    // #region Properties (6)
    defaultSettings = {
      duration: 1e3,
      easing: "none"
    };
    static DefaultSettings = {
      type: "spotlightwipe",
      duration: 1e3,
      easing: "none",
      direction: "top",
      radial: "outside",
      bgSizingMode: "stretch",
      version: "1.1.0",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "spotlightwipe";
    static name = "SPOTLIGHTWIPE";
    static template = "spotlightwipe-config";
    static icon = "<i class='bt-icon spotlight-wipe fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SpotlightWipeStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._SpotlightWipeStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        directionSelect: {
          top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
          left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
          right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
          bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
        },
        radialSelect: generateRadialDirectionSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _SpotlightWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _SpotlightWipeStep.fromFormElement(arg[0]);
      else return new _SpotlightWipeStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const serializedTexture = elem.find("#backgroundImage").val() ?? "";
      return new _SpotlightWipeStep({
        ..._SpotlightWipeStep.DefaultSettings,
        serializedTexture,
        ...parseConfigurationFormElements(elem, "id", "duration", "direction", "radial", "backgroundType", "backgroundColor", "easing")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._SpotlightWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new SpotlightWipeFilter(config.direction, config.radial, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/StartPlaylistStep.ts
  var StartPlaylistStep = class _StartPlaylistStep extends TransitionStep {
    static template = "";
    static hidden = false;
    static skipConfig = true;
    static key = "startplaylist";
    static name = "STARTPLAYLIST";
    static icon = "<i class='bt-icon start-ambient-playlist fa-fw fas'></i>";
    static category = "technical";
    static DefaultSettings = {
      type: "startplaylist",
      version: "1.1.0"
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static RenderTemplate(config) {
      throw new NotImplementedError();
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _StartPlaylistStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _StartPlaylistStep.fromFormElement(arg[0]);
      else return new _StartPlaylistStep(arg);
    }
    static fromFormElement(form) {
      return new _StartPlaylistStep({
        ..._StartPlaylistStep.DefaultSettings,
        ...parseConfigurationFormElements($(form), "id")
      });
    }
    async prepare(sequence) {
      const sceneChanges = sequence.sequence.filter((step) => step.type === "scenechange");
      for (const step of sceneChanges) {
        const config = step;
        const scene = game.scenes?.get(config.scene);
        if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof config.scene === "string" ? config.scene : typeof config.scene);
        if (scene.playlist) {
          if (scene.playlistSound) {
            const sound = typeof scene.playlistSound === "string" ? scene.playlist.sounds.get(scene.playlistSound) : scene.playlistSound;
            if (sound) await sound.load();
          } else {
            const firstId = scene.playlist.playbackOrder[0];
            const sound = scene.playlist.sounds.get(firstId);
            if (sound) await sound.load();
          }
        }
      }
    }
    execute(container, sequence) {
      BattleTransition.SuppressSoundUpdates = false;
      const sceneChange = sequence.sequence.reduce((prev, curr) => curr instanceof SceneChangeStep ? curr : prev);
      if (!sceneChange) throw new InvalidSceneError(typeof sceneChange);
      const scene = game.scenes?.get(sceneChange.scene);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(sceneChange.scene);
      if (!scene.canUserModify(game.user, "update")) return;
      if (scene.playlist && !scene.playlistSound) {
        switch (scene.playlist.mode) {
          case CONST.PLAYLIST_MODES.SEQUENTIAL:
          case CONST.PLAYLIST_MODES.SHUFFLE:
            if (scene.playlist.playbackOrder.length) {
              const sound = scene.playlist.sounds.get(scene.playlist.playbackOrder[0]);
              if (sound) void scene.playlist.playSound(sound);
            }
            break;
          case CONST.PLAYLIST_MODES.SIMULTANEOUS:
            void scene.playlist.playAll();
            break;
        }
      } else if (scene.playlist && scene.playlistSound instanceof PlaylistSound) {
        void scene.playlist.playSound(scene.playlistSound);
      }
    }
  };

  // src/steps/TextureSwapStep.ts
  var TextureSwapStep = class _TextureSwapStep extends TransitionStep {
    // #region Properties (6)
    defaultSettings = {};
    static DefaultSettings = {
      type: "textureswap",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "textureswap";
    static name = "TEXTURESWAP";
    static template = "textureswap-config";
    static icon = "<i class='bt-icon texture-swap fa-fw fas'></i>";
    static category = "effect";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_TextureSwapStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._TextureSwapStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _TextureSwapStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _TextureSwapStep.fromFormElement(arg[0]);
      else return new _TextureSwapStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const serializedTexture = elem.find("#backgroundImage").val() ?? "";
      return new _TextureSwapStep({
        ..._TextureSwapStep.DefaultSettings,
        serializedTexture,
        ...parseConfigurationFormElements(elem, "id", "backgroundType", "backgroundColor")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(container, sequence) {
      const config = {
        ..._TextureSwapStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new TextureSwapFilter(background.baseTexture);
      this.addFilter(container, filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/TwistStep.ts
  var TwistStep = class _TwistStep extends TransitionStep {
    static DefaultSettings = {
      type: "twist",
      version: "1.1.0",
      duration: 1e3,
      maxAngle: 10,
      easing: "none",
      direction: "clockwise"
    };
    static hidden = false;
    static key = "twist";
    static name = "TWIST";
    static template = "twist-config";
    static icon = "<i class='bt-icon twist fa-fw fas'></i>";
    static category = "warp";
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_TwistStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._TwistStep.DefaultSettings,
        ...config ? config : {},
        directionSelect: generateClockDirectionSelectOptions(),
        easingSelect: generateEasingSelectOptions()
      });
    }
    async execute(container) {
      const filter = new PIXI.filters.TwistFilter({
        radius: window.innerWidth,
        angle: 0,
        offset: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      });
      this.addFilter(container, filter);
      const config = {
        ..._TwistStep.DefaultSettings,
        ...this.config
      };
      await TweenMax.to(filter.uniforms, { angle: this.config.direction === "clockwise" ? config.maxAngle * -1 : this.config.maxAngle, duration: config.duration / 1e3, ease: this.config.easing || "none" });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _TwistStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _TwistStep.fromFormElement(arg[0]);
      else return new _TwistStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      return new _TwistStep({
        ..._TwistStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "direction", "easing")
      });
    }
  };

  // src/steps/VideoStep.ts
  var VideoStep = class _VideoStep extends TransitionStep {
    // #region Properties (7)
    #preloadedVideo = null;
    #videoContainer = null;
    static DefaultSettings = {
      type: "video",
      volume: 100,
      clear: false,
      file: "",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000",
      videoSizingMode: "stretch",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "video";
    static name = "VIDEO";
    static template = "video-config";
    static icon = "<i class='bt-icon video fa-fw fas'></i>";
    static category = "effect";
    // #endregion Properties (7)
    // #region Public Static Methods (6)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_VideoStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._VideoStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _VideoStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _VideoStep.fromFormElement(arg[0]);
      else return new _VideoStep(arg);
    }
    static fromFormElement(form) {
      const file = $(form).find("#file").val() ?? "";
      const volume = $(form).find("#volume input[type='number']").val();
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      return new _VideoStep({
        ..._VideoStep.DefaultSettings,
        ...file ? { file } : {},
        ...volume ? { volume: volume / 100 } : {},
        serializedTexture: backgroundImage,
        ...parseConfigurationFormElements($(form), "id", "background", "backgroundType", "backgroundColor")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (3)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._VideoStep.DefaultSettings,
        ...this.config
      };
      const texture = this.#preloadedVideo;
      if (!texture) throw new FileNotFoundError(config.file);
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const resource = texture?.baseTexture.resource;
      const source = resource.source;
      return new Promise((resolve, reject) => {
        const swapFilter = new TextureSwapFilter(texture.baseTexture);
        const sprite = PIXI.Sprite.from(texture);
        const bgSprite = PIXI.Sprite.from(background);
        const videoContainer = new PIXI.Container();
        videoContainer.addChild(bgSprite);
        bgSprite.width = window.innerWidth;
        bgSprite.height = window.innerHeight;
        videoContainer.addChild(sprite);
        sprite.width = window.innerWidth;
        sprite.height = window.innerHeight;
        sprite.filters = [swapFilter];
        source.currentTime = 0;
        this.#videoContainer = videoContainer;
        container.parent.addChild(videoContainer);
        source.addEventListener("ended", () => {
          if (config.clear) setTimeout(() => {
            sprite.destroy();
          }, 500);
          resolve();
        });
        source.addEventListener("error", (e) => {
          reject(e.error);
        });
        void source.play();
      });
    }
    async prepare() {
      const config = {
        ..._VideoStep.DefaultSettings,
        ...this.config
      };
      const texture = await PIXI.loadVideo.load(config.file);
      this.#preloadedVideo = texture;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    teardown(container) {
      if (!this.#videoContainer) return;
      const children = [...this.#videoContainer.children];
      for (const child of children) child.destroy();
      this.#videoContainer.destroy();
    }
    // #endregion Public Methods (3)
  };

  // src/steps/WaveWipeStep.ts
  var WaveWipeStep = class _WaveWipeStep extends TransitionStep {
    // #region Properties (5)
    static template = "wavewipe-config";
    static DefaultSettings = {
      type: "wavewipe",
      duration: 1e3,
      easing: "none",
      direction: "inside",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static hidden = false;
    static key = "wavewipe";
    static name = "WAVEWIPE";
    static icon = "<i class='bt-icon wave-wipe fa-fw fas'></i>";
    static category = "wipe";
    // #endregion Properties (5)
    // #region Public Static Methods (5)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_WaveWipeStep.template}.hbs`, {
        ..._WaveWipeStep.DefaultSettings,
        ...config ? config : {},
        radialSelect: generateRadialDirectionSelectOptions(),
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _WaveWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _WaveWipeStep.fromFormElement(arg[0]);
      else return new _WaveWipeStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const serializedTexture = elem.find("#backgroundImage").val() ?? "";
      return new _WaveWipeStep({
        ..._WaveWipeStep.DefaultSettings,
        serializedTexture,
        ...parseConfigurationFormElements(elem, "id", "duration", "backgroundType", "backgroundColor", "easing", "direction")
      });
    }
    // #endregion Public Static Methods (5)
    // #region Public Methods (1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._WaveWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new WaveWipeFilter(config.direction, background.baseTexture);
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/ZoomBlurStep.ts
  var ZoomBlurStep = class _ZoomBlurStep extends TransitionStep {
    static DefaultSettings = {
      type: "zoomblur",
      version: "1.1.0",
      duration: 1e3,
      maxStrength: 0.5,
      easing: "none",
      innerRadius: 0
    };
    static hidden = false;
    static key = "zoomblur";
    static name = "ZOOMBLUR";
    static template = "zoomblur-config";
    static category = "warp";
    static icon = "<i class='bt-icon zoomblur fa-fw fas'></i>";
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ZoomBlurStep.template}.hbs`, {
        id: foundry.utils.randomID(),
        ..._ZoomBlurStep.DefaultSettings,
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions()
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _ZoomBlurStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _ZoomBlurStep.fromFormElement(arg[0]);
      else return new _ZoomBlurStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const maxStrength = elem.find("#maxStrength input[type='number']").val() ?? 1;
      const innerRadius = elem.find("#innerRadius input[type='number']").val() ?? 0;
      return new _ZoomBlurStep({
        ..._ZoomBlurStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration"),
        maxStrength,
        innerRadius
      });
    }
    async execute(container) {
      const config = {
        ..._ZoomBlurStep.DefaultSettings,
        ...this.config
      };
      const filter = new PIXI.filters.ZoomBlurFilter({
        strength: 0,
        innerRadius: config.innerRadius * window.innerWidth,
        radius: -1,
        center: [window.innerWidth / 2, window.innerHeight / 2]
      });
      this.addFilter(container, filter);
      await TweenMax.to(filter.uniforms, { uStrength: config.maxStrength, duration: config.duration / 1e3, ease: config.easing || "none" });
    }
  };

  // src/utils.ts
  async function awaitHook(hook) {
    return new Promise((resolve) => {
      Hooks.once(hook, (...args) => {
        resolve(args);
      });
    });
  }
  function createColorTexture(color) {
    const canvas2 = document.createElement("canvas");
    canvas2.width = 1;
    canvas2.height = 1;
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CannotInitializeCanvasError();
    const actualColor = new PIXI.Color(color);
    ctx.fillStyle = actualColor.toHexa();
    ctx.fillRect(0, 0, 1, 1);
    return PIXI.Texture.from(canvas2);
  }
  function createGradient1DTexture(size, startColor, endColor) {
    const canvas2 = document.createElement("canvas");
    canvas2.width = size;
    canvas2.height = 1;
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CannotInitializeCanvasError();
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    const actualStart = startColor ?? new PIXI.Color("white");
    const actualEnd = endColor ?? new PIXI.Color("black");
    gradient.addColorStop(0, actualStart.toHex());
    gradient.addColorStop(1, actualEnd.toHex());
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, 1);
    return PIXI.Texture.from(canvas2);
  }
  function createNoiseTexture(width = 256, height = 256, random) {
    const noise2D = createNoise2D(random);
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CannotInitializeCanvasError();
    canvas2.width = width;
    canvas2.height = height;
    const imageData = ctx.createImageData(canvas2.width, canvas2.height);
    const data = imageData.data;
    for (let y = 0; y < canvas2.height; y++) {
      for (let x = 0; x < canvas2.width; x++) {
        const value = noise2D(x / 32, y / 32);
        const index = (y * canvas2.width + x) * 4;
        data[index] = value * 255;
        data[index + 1] = value * 255;
        data[index + 2] = value * 255;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return PIXI.Texture.from(canvas2);
  }
  function dataURLToBuffer(url) {
    const binary = atob(url.split(",")[1]);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < buffer.length; i++)
      buffer[i] = binary.charCodeAt(i);
    return buffer;
  }
  function deserializeDataURL(data) {
    const base64 = bytesToBase64(data.buffer instanceof ArrayBuffer ? new Uint8Array(data.buffer) : data.buffer);
    return PIXI.Texture.from(`data:${data.mimeType};base64,${base64}`);
  }
  function deserializeTexture(data) {
    if (typeof data === "string") return coerceTexture(data) ?? createColorTexture("transparent");
    const urlBuffer = data;
    if (urlBuffer.buffer && urlBuffer.mimeType) return deserializeDataURL(urlBuffer);
    const textureBuffer = data;
    if (textureBuffer.buffer && textureBuffer.width && textureBuffer.height) return deserializeTextureBuffer(textureBuffer);
    else throw new InvalidTextureError();
  }
  function deserializeTextureBuffer(data) {
    return PIXI.Texture.fromBuffer(data.buffer, data.width, data.height);
  }
  function isNumeric(value) {
    if (typeof value === "number") return true;
    if (typeof value === "string") {
      const temp = parseFloat(value);
      return temp.toString() === value;
    }
    return false;
  }
  function findFormValue(serialized, key) {
    const elem = serialized.find(({ name }) => name === key);
    if (key === "background") {
      const bgType = serialized.find(({ name }) => name === "backgroundType");
      if (!bgType) return null;
      if (bgType.value === "image") return findFormValue(serialized, "backgroundImage");
      else return findFormValue(serialized, "backgroundColor");
    }
    if (!elem) return null;
    if (key === "id" && !elem.value) return foundry.utils.randomID();
    return isNumeric(elem.value) ? parseFloat(elem.value) : elem.value;
  }
  function generateBilinearDirectionSelectOptions() {
    return {
      "horizontal": "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
      "vertical": "BATTLETRANSITIONS.DIRECTIONS.VERTICAL",
      "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
      "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"
    };
  }
  function generateClockDirectionSelectOptions() {
    return {
      "clockwise": "BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",
      "counterclockwise": "BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"
    };
  }
  function generateEasingSelectOptions() {
    return {
      "none": "BATTLETRANSITIONS.EASINGS.NONE",
      "power1in": "BATTLETRANSITIONS.EASINGS.POWER1IN",
      "power1out": "BATTLETRANSITIONS.EASINGS.POWER1OUT",
      "power1inout": "BATTLETRANSITIONS.EASINGS.POWER1INOUT",
      "power2in": "BATTLETRANSITIONS.EASINGS.POWER2IN",
      "power2out": "BATTLETRANSITIONS.EASINGS.POWER2OUT",
      "power2inout": "BATTLETRANSITIONS.EASINGS.POWER2INOUT",
      "power3in": "BATTLETRANSITIONS.EASINGS.POWER3IN",
      "power3out": "BATTLETRANSITIONS.EASINGS.POWER3OUT",
      "power3inout": "BATTLETRANSITIONS.EASINGS.POWER3INOUT",
      "power4in": "BATTLETRANSITIONS.EASINGS.POWER4IN",
      "power4out": "BATTLETRANSITIONS.EASINGS.POWER4OUT",
      "power4inout": "BATTLETRANSITIONS.EASINGS.POWER4INOUT",
      "backin": "BATTLETRANSITIONS.EASINGS.BACKIN",
      "backout": "BATTLETRANSITIONS.EASINGS.BACKOUT",
      "backinout": "BATTLETRANSITIONS.EASINGS.BACKINOUT",
      "bouncein": "BATTLETRANSITIONS.EASINGS.BOUNCEIN",
      "bounceout": "BATTLETRANSITIONS.EASINGS.BOUNCEOUT",
      "bounceinout": "BATTLETRANSITIONS.EASINGS.BOUNCEINOUT",
      "circin": "BATTLETRANSITIONS.EASINGS.CIRCIN",
      "circout": "BATTLETRANSITIONS.EASINGS.CIRCOUT",
      "circinout": "BATTLETRANSITIONS.EASINGS.CIRCINOUT",
      "elasticin": "BATTLETRANSITIONS.EASINGS.ELASTICIN",
      "elasticout": "BATTLETRANSITIONS.EASINGS.ELASTICOUT",
      "elasticinout": "BATTLETRANSITIONS.EASINGS.ELASTICINOUT",
      "expoin": "BATTLETRANSITIONS.EASINGS.EXPOIN",
      "expoout": "BATTLETRANSITIONS.EASINGS.EXPOOUT",
      "expoinout": "BATTLETRANSITIONS.EASINGS.EXPOINOUT",
      "sinein": "BATTLETRANSITIONS.EASINGS.SINEIN",
      "sineout": "BATTLETRANSITIONS.EASINGS.SINEOUT",
      "sineinout": "BATTLETRANSITIONS.EASINGS.SINEINOUT"
    };
  }
  function generateLinearDirectionSelectOptions() {
    return {
      "top": "BATTLETRANSITIONS.DIRECTIONS.TOP",
      "left": "BATTLETRANSITIONS.DIRECTIONS.LEFT",
      "right": "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
      "bottom": "BATTLETRANSITIONS.DIRECTIONS.BOTTOM",
      "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
      "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT",
      "bottomleft": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMLEFT",
      "bottomright": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMRIGHT"
    };
  }
  function generateRadialDirectionSelectOptions() {
    return {
      "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
      "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
    };
  }
  function generateFontSelectOptions() {
    return Object.fromEntries(FontConfig.getAvailableFonts().map((font) => [font, font]));
  }
  function getSortedSteps() {
    return Object.values(steps_exports).sort((a, b) => localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${a.name}`).localeCompare(localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${b.name}`)));
  }
  function getStepClassByKey(key) {
    return Object.values(steps_exports).find((obj) => obj.key === key);
  }
  function localize(key, data = {}) {
    return game.i18n?.format(key, data) ?? key;
  }
  function log(...args) {
    console.log(LOG_ICON, "Battle Transitions", "|", ...args);
  }
  function logImage(url, size = 256) {
    const image = new Image();
    image.onload = function() {
      const style = [
        `font-size: 1px`,
        `padding: ${size}px`,
        // `padding: ${this.height / 100 * size}px ${this.width / 100 * size}px`,
        `background: url(${url}) no-repeat`,
        `background-size:contain`,
        `border:1px solid black`
      ].join(";");
      console.log("%c ", style);
      ;
    };
    image.src = url;
  }
  function logTexture(texture, size = 256) {
    const renderTexture = PIXI.RenderTexture.create({ width: texture.width, height: texture.height });
    const sprite = PIXI.Sprite.from(texture);
    canvas?.app?.renderer.render(sprite, { renderTexture });
    canvas?.app?.renderer.extract.base64(renderTexture).then((base64) => {
      logImage(base64, size);
    }).catch(console.error);
  }
  function parseConfigurationFormElements(form, ...elements) {
    const serialized = form.serializeArray();
    const elem = Object.fromEntries(
      elements.map((key) => [key, findFormValue(serialized, key)])
    );
    return elem;
  }
  function serializeCanvas(canvas2) {
    const buffer = dataURLToBuffer(canvas2.toDataURL());
    return {
      width: canvas2.width,
      height: canvas2.height,
      buffer
    };
  }
  function serializeDataURL(url) {
    const buffer = dataURLToBuffer(url);
    return {
      mimeType: url.split(";")[0].split(":")[1],
      buffer
    };
  }
  function serializeTexture(texture) {
    if (typeof texture === "string" && texture.startsWith("data:")) return serializeDataURL(texture);
    if (typeof texture === "string") return texture;
    if (typeof texture.src === "string") return texture.src;
    if (typeof texture.value !== "undefined") return texture.value;
    const baseTexture = texture.baseTexture;
    const resource = baseTexture.resource;
    if (typeof resource.data !== "undefined") return { width: resource.width, height: resource.height, buffer: resource.data };
    const source = resource.source;
    if (source instanceof HTMLImageElement) return source.getAttribute("src");
    else if (source instanceof HTMLCanvasElement) return serializeCanvas(source);
    console.error(texture);
    throw new InvalidTextureError();
  }
  function shouldUseAppV2() {
    return (game.release?.isNewer("12") ?? false) && !!foundry.applications.api.ApplicationV2;
  }
  async function wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
  function isColor(data) {
    return CSS.supports("color", data);
  }
  function migratev10XBackground(old) {
    return {
      backgroundType: old.background && !isColor(old.background) ? "image" : "color",
      backgroundColor: isColor(old.background) ? old.background : "",
      backgroundImage: !isColor(old.background) && old.background ? old.background : "",
      bgSizingMode: "stretch"
    };
  }
  function getMacros() {
    return [
      ...game.macros?.contents.slice() ?? [],
      ...game.packs?.contents.reduce((prev, curr) => {
        if (curr.documentName !== "Macro") return prev;
        return [
          ...prev,
          ...curr.index.contents
        ];
      }, []) ?? []
    ];
  }
  function getActors() {
    return [
      ...game.actors?.contents.slice() ?? [],
      ...game.packs?.contents.reduce((prev, curr) => {
        if (curr.documentName !== "Actor") return prev;
        return [
          ...prev,
          ...curr.index.contents
        ];
      }, []) ?? []
    ];
  }
  function getCompendiumFromUUID(uuid) {
    const split = uuid.split(".");
    if (split[0] !== "Compendium") return "";
    return split[2];
  }

  // src/transitionUtils.ts
  var transitionCover = document.createElement("div");
  transitionCover.style.display = "none";
  transitionCover.style.position = "absolute";
  transitionCover.style.width = "100%";
  transitionCover.style.height = "100%";
  transitionCover.style.backgroundRepeat = "no-repeat";
  transitionCover.id = COVER_ID;
  document.body.appendChild(transitionCover);
  var canvasGroup = null;
  function initializeCanvas() {
    canvasGroup = new ScreenSpaceCanvasGroup();
    canvas?.stage?.addChild(canvasGroup);
  }
  async function createSnapshot() {
    if (!canvas) throw new CanvasNotFoundError();
    if (!(canvas.app && canvas.hidden && canvas.primary && canvas.tiles && canvas.drawings && canvas.scene && canvas.stage)) throw new NotInitializedError();
    const sceneWidth = window.innerWidth;
    const sceneHeight = window.innerHeight;
    const renderer = canvas.app.renderer;
    const rt = PIXI.RenderTexture.create({ width: sceneWidth, height: sceneHeight });
    renderer.render(canvas.stage, { renderTexture: rt, skipUpdateTransform: true, clear: true });
    const transitionCover2 = document.getElementById(COVER_ID);
    if (!transitionCover2) throw new NoCoverElementError();
    transitionCover2.style.backgroundImage = "";
    const img = await renderer.extract.image(rt);
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) throw new CannotInitializeCanvasError();
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    ctx.fillStyle = renderer.background.backgroundColor.toHex();
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(img, 0, 0);
    const src = tempCanvas.toDataURL();
    transitionCover2.style.backgroundImage = `url(${src})`;
    transitionCover2.style.backgroundColor = renderer.background.backgroundColor.toHex();
    transitionCover2.style.display = "block";
    const sprite = new PIXI.Sprite(rt);
    return sprite;
  }
  async function setupTransition() {
    if (!canvasGroup) throw new CannotInitializeCanvasError();
    const snapshot = await createSnapshot();
    const container = new PIXI.Container();
    container.width = window.innerWidth;
    container.height = window.innerHeight;
    const bgTexture = createColorTexture(canvas?.app?.renderer.background.backgroundColor ?? "white");
    const sprite = new PIXI.Sprite(bgTexture);
    sprite.width = window.innerWidth;
    sprite.height = window.innerHeight;
    container.addChild(sprite);
    container.addChild(snapshot);
    const outerContainer = new PIXI.Container();
    outerContainer.width = window.innerWidth;
    outerContainer.height = window.innerHeight;
    outerContainer.addChild(container);
    canvasGroup.addChild(outerContainer);
    return container;
  }
  function cleanupTransition(container) {
    transitionCover.style.display = "none";
    transitionCover.style.backgroundImage = "";
    if (container) {
      if (Array.isArray(container.children) && container.children.length)
        for (let i = container.children.length - 1; i >= 0; i--) container.children[i].destroy();
      container.destroy();
    }
  }
  function hideLoadingBar() {
    const loadingBar = document.getElementById("loading");
    if (loadingBar) loadingBar.style.opacity = "0";
  }
  function showLoadingBar() {
    const loadingBar = document.getElementById("loading");
    if (loadingBar) loadingBar.style.removeProperty("opacity");
  }
  function hideTransitionCover() {
    transitionCover.style.display = "none";
    transitionCover.style.removeProperty("backgroundImage");
  }
  async function activateScene(arg) {
    const scene = coerceScene(arg);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
    await scene.setFlag("battle-transitions", "isTriggered", true);
    void scene.activate();
    await awaitHook("canvasReady");
    return scene;
  }

  // src/lib/groupBy.js
  function get(obj, prop) {
    var parts = prop.split("."), last = parts.pop();
    while (prop = parts.shift()) {
      obj = obj[prop];
      if (obj == null) {
        return;
      }
    }
    return obj[last];
  }
  function noop() {
    return "";
  }
  function groupBy(handlebars) {
    var helpers = {
      /**
       * @method group
       * @param {Array} list
       * @param {Object} options
       * @param {Object} options.hash
       * @param {String} options.hash.by
       * @return {String} Rendered partial.
       */
      group: function(list, options) {
        options = options || {};
        var fn = options.fn || noop, inverse = options.inverse || noop, hash = options.hash, prop = hash && hash.by, keys = [], groups = {};
        if (!prop || !list || !list.length) {
          return inverse(this);
        }
        function groupKey(item) {
          var key = get(item, prop);
          if (keys.indexOf(key) === -1) {
            keys.push(key);
          }
          if (!groups[key]) {
            groups[key] = {
              value: key,
              items: []
            };
          }
          groups[key].items.push(item);
        }
        function renderGroup(buffer, key) {
          return buffer + fn(groups[key]);
        }
        list.forEach(groupKey);
        return keys.reduce(renderGroup, "");
      }
    };
    handlebars.registerHelper(helpers);
    return handlebars;
  }
  groupBy.register = groupBy;
  var groupBy_default = groupBy;

  // src/templates.ts
  function registerHelpers() {
    Handlebars.registerHelper("switch", function(value, options) {
      this._switch_value_ = value;
      const html = options.fn(this);
      delete this._switch_value_;
      return html;
    });
    Handlebars.registerHelper("case", function(value, options) {
      if (value == this._switch_value_)
        return options.fn(this);
    });
    groupBy_default.register(Handlebars);
  }
  async function registerTemplates() {
    return loadTemplates([
      `/modules/${"battle-transitions"}/templates/scene-config.hbs`,
      ...[
        "add-step",
        "fade-config",
        "linearwipe-config",
        "step-item",
        "background-selector",
        "duration-selector",
        "add-step-button",
        "sequence-item"
      ].map((name) => `/modules/${"battle-transitions"}/templates/config/${name}.hbs`),
      `/modules/${"battle-transitions"}/templates/scene-selector.hbs`,
      `/modules/${"battle-transitions"}/templates/transition-steps.hbs`,
      `/modules/${"battle-transitions"}/templates/actor-selector.hbs`
    ]);
  }

  // src/module.ts
  var import_semver2 = __toESM(require_semver2());

  // src/vendor/libwrapper.shim.js
  var import_meta = {};
  var libWrapper = void 0;
  var TGT_SPLIT_RE = new RegExp(
    `([^.[]+|\\[('([^'\\\\]|\\\\.)+?'|"([^"\\\\]|\\\\.)+?")\\])`,
    "g"
  );
  var TGT_CLEANUP_RE = new RegExp(`(^\\['|'\\]$|^\\["|"\\]$)`, "g");
  Hooks.once("init", () => {
    if (globalThis.libWrapper && !(globalThis.libWrapper.is_fallback ?? true)) {
      libWrapper = globalThis.libWrapper;
      return;
    }
    libWrapper = class {
      static get is_fallback() {
        return true;
      }
      static get WRAPPER() {
        return "WRAPPER";
      }
      static get MIXED() {
        return "MIXED";
      }
      static get OVERRIDE() {
        return "OVERRIDE";
      }
      static get LISTENER() {
        return "LISTENER";
      }
      static register(package_id, target, fn, type = "MIXED", { chain = void 0, bind = [] } = {}) {
        const is_setter = target.endsWith("#set");
        target = !is_setter ? target : target.slice(0, -4);
        const split = target.match(TGT_SPLIT_RE).map((x) => x.replace(/\\(.)/g, "$1").replace(TGT_CLEANUP_RE, ""));
        const root_nm = split.splice(0, 1)[0];
        let obj, fn_name;
        if (split.length == 0) {
          obj = globalThis;
          fn_name = root_nm;
        } else {
          const _eval = eval;
          fn_name = split.pop();
          obj = split.reduce(
            (x, y) => x[y],
            globalThis[root_nm] ?? _eval(root_nm)
          );
        }
        let iObj = obj;
        let descriptor = null;
        while (iObj) {
          descriptor = Object.getOwnPropertyDescriptor(iObj, fn_name);
          if (descriptor) break;
          iObj = Object.getPrototypeOf(iObj);
        }
        if (!descriptor || descriptor?.configurable === false)
          throw new Error(
            `libWrapper Shim: '${target}' does not exist, could not be found, or has a non-configurable descriptor.`
          );
        let original = null;
        const is_override = type == 3 || type.toUpperCase?.() == "OVERRIDE" || type == 3;
        const is_listener = type == 4 || type.toUpperCase?.() == "LISTENER" || type == 4;
        const wrapper = is_listener ? function(...args) {
          fn.call(this, ...bind, ...args);
          return original.call(this, ...args);
        } : chain ?? !is_override ? function(...args) {
          return fn.call(this, original.bind(this), ...bind, ...args);
        } : function(...args) {
          return fn.call(this, ...bind, ...args);
        };
        if (!is_setter) {
          if (descriptor.value) {
            original = descriptor.value;
            descriptor.value = wrapper;
          } else {
            original = descriptor.get;
            descriptor.get = wrapper;
          }
        } else {
          if (!descriptor.set)
            throw new Error(
              `libWrapper Shim: '${target}' does not have a setter`
            );
          original = descriptor.set;
          descriptor.set = wrapper;
        }
        descriptor.configurable = true;
        Object.defineProperty(obj, fn_name, descriptor);
      }
    };
    {
      const [PACKAGE_ID, PACKAGE_TITLE] = (() => {
        const match = (import_meta?.url ?? Error().stack)?.match(
          /\/(worlds|systems|modules)\/(.+)(?=\/)/i
        );
        if (match?.length !== 3) return [null, null];
        const dirs = match[2].split("/");
        if (match[1] === "worlds")
          return dirs.find((n) => n && game.world.id === n) ? [game.world.id, game.world.title] : [null, null];
        if (match[1] === "systems")
          return dirs.find((n) => n && game.system.id === n) ? [game.system.id, game.system.title ?? game.system.data.title] : [null, null];
        const id = dirs.find((n) => n && game.modules.has(n));
        const mdl = game.modules.get(id);
        return [id, mdl?.title ?? mdl?.data?.title];
      })();
      if (!PACKAGE_ID || !PACKAGE_TITLE) {
        console.error(
          "libWrapper Shim: Could not auto-detect package ID and/or title. The libWrapper fallback warning dialog will be disabled."
        );
        return;
      }
      Hooks.once("ready", () => {
        const FALLBACK_MESSAGE_TITLE = PACKAGE_TITLE;
        const FALLBACK_MESSAGE = `
				<p><b>'${PACKAGE_TITLE}' depends on the 'libWrapper' module, which is not present.</b></p>
				<p>A fallback implementation will be used, which increases the chance of compatibility issues with other modules.</p>
				<small><p>'libWrapper' is a library which provides package developers with a simple way to modify core Foundry VTT code, while reducing the likelihood of conflict with other packages.</p>
				<p>You can install it from the "Add-on Modules" tab in the <a href="javascript:game.shutDown()">Foundry VTT Setup</a>, from the <a href="https://foundryvtt.com/packages/lib-wrapper">Foundry VTT package repository</a>, or from <a href="https://github.com/ruipin/fvtt-lib-wrapper/">libWrapper's Github page</a>.</p></small>
			`;
        const DONT_REMIND_AGAIN_KEY = "libwrapper-dont-remind-again";
        console.warn(
          `${PACKAGE_TITLE}: libWrapper not present, using fallback implementation.`
        );
        game.settings.register(PACKAGE_ID, DONT_REMIND_AGAIN_KEY, {
          name: "",
          default: false,
          type: Boolean,
          scope: "world",
          config: false
        });
        if (game.user.isGM && !game.settings.get(PACKAGE_ID, DONT_REMIND_AGAIN_KEY)) {
          new Dialog({
            title: FALLBACK_MESSAGE_TITLE,
            content: FALLBACK_MESSAGE,
            buttons: {
              ok: { icon: '<i class="fas fa-check"></i>', label: "Understood" },
              dont_remind: {
                icon: '<i class="fas fa-times"></i>',
                label: "Don't remind me again",
                callback: () => game.settings.set(PACKAGE_ID, DONT_REMIND_AGAIN_KEY, true)
              }
            }
          }).render(true);
        }
      });
    }
  });

  // src/module.ts
  window.semver = import_semver2.default;
  window.BattleTransition = BattleTransition;
  Hooks.once("canvasReady", () => {
    initializeCanvas();
    Hooks.callAll(CUSTOM_HOOKS.INITIALIZE);
  });
  Hooks.once("init", async () => {
    registerHelpers();
    await registerTemplates();
    if (typeof libWrapper === "function") {
      libWrapper.register("battle-transitions", "Scene.prototype.update", function(wrapped, ...args) {
        const delta = args[0];
        const config = ConfigurationHandler.GetSceneConfiguration(this);
        if (delta.active && config.autoTrigger && config.sequence?.length && !this.flags["battle-transitions"].isTriggered) {
          delete delta.active;
          const sceneChangeStep = new SceneChangeStep({ scene: this.id ?? "" });
          void BattleTransition.executeSequence([
            {
              ...SceneChangeStep.DefaultSettings,
              ...sceneChangeStep.config
            },
            ...config.sequence
          ]);
          if (Object.keys(delta).length === 0) return false;
        }
        return wrapped(delta);
      }, "MIXED");
    }
  });
  Hooks.on("renderSceneConfig", (app, html, options) => {
    void ConfigurationHandler.InjectSceneConfig(app, html, options);
  });
  Hooks.once("socketlib.ready", () => {
    SocketHandler_default.register(socketlib.registerModule("battle-transitions"));
  });
  Hooks.on("getSceneNavigationContext", (html, buttons) => {
    ConfigurationHandler.AddToNavigationBar(buttons);
  });
  Hooks.on("preUpdatePlaylist", (playlist, delta) => {
    if (delta.playing) {
      if (BattleTransition.SuppressSoundUpdates) {
        return false;
      }
    }
  });
  Hooks.on("preUpdatePlaylistSound", (sound, delta) => {
    if (delta.playing) {
      if (BattleTransition.SuppressSoundUpdates) {
        return false;
      }
    }
  });
  Hooks.on(CUSTOM_HOOKS.TRANSITION_START, (...args) => {
    log("Transition start:", args);
  });
  Hooks.on(CUSTOM_HOOKS.TRANSITION_END, (...args) => {
    log("Transition end:", args);
  });
  Hooks.on("updateScene", (scene, delta, mod, userId) => {
    if (delta.active) {
      if (scene.canUserModify(game.user, "update")) void scene.unsetFlag("battle-transitions", "isTriggered");
      awaitHook("canvasReady").then(() => {
        Hooks.callAll(CUSTOM_HOOKS.SCENE_ACTIVATED, scene);
      }).catch(console.error);
    }
  });
})();
//# sourceMappingURL=module.js.map
>>>>>>> release/1.1.0-alpha1
