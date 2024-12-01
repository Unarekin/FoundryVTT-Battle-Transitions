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
      var outside2 = (version, range, hilo, options) => {
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
      module.exports = outside2;
    }
  });

  // node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS({
    "node_modules/semver/ranges/gtr.js"(exports, module) {
      var outside2 = require_outside();
      var gtr = (version, range, options) => outside2(version, range, ">", options);
      module.exports = gtr;
    }
  });

  // node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS({
    "node_modules/semver/ranges/ltr.js"(exports, module) {
      var outside2 = require_outside();
      var ltr = (version, range, options) => outside2(version, range, "<", options);
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
      var outside2 = require_outside();
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
        outside: outside2,
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

  // src/errors/InvalidImportError.ts
  var InvalidImportError = class extends LocalizedError {
    constructor() {
      super("INVALIDIMPORT");
    }
  };

  // src/errors/InvalidMacroError.ts
  var InvalidMacroError = class extends LocalizedError {
    constructor(macro) {
      super("INVALIDMACRO", { macro });
    }
  };

  // src/errors/InvalidObjectError.ts
  var InvalidObjectError = class extends LocalizedError {
    constructor(arg) {
      super("INVALIDOBJECT", { object: typeof arg });
    }
  };

  // src/errors/InvalidRollTableError.ts
  var InvalidRollTableError = class extends LocalizedError {
    constructor(table) {
      super("INVALIDROLLTABLE", { table: typeof table === "string" ? table : typeof table });
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

  // src/errors/InvalidTargetError.ts
  var InvalidTargetError = class extends LocalizedError {
    constructor(arg) {
      super("INVALIDTARGET", { item: typeof arg === "string" ? arg : typeof arg });
    }
  };

  // src/errors/InvalidTextureError.ts
  var InvalidTextureError = class extends LocalizedError {
    constructor() {
      super("INVALIDTEXTURE");
    }
  };

  // src/errors/InvalidTipLocationError.ts
  var InvalidTipLocationError = class extends LocalizedError {
    constructor(location) {
      super("INVALIDTIPLOCATION", { location: typeof location === "string" ? location : typeof location });
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

  // src/errors/NoFileError.ts
  var NoFileError = class extends LocalizedError {
    constructor() {
      super("NOFILE");
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

  // src/errors/StepNotReversibleError.ts
  var StepNotReversibleError = class extends LocalizedError {
    constructor(key) {
      super("STEPNOTREVERSIBLE", { type: key });
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
    LoadingTipStep: () => LoadingTipStep,
    MacroStep: () => MacroStep,
    MeltStep: () => MeltStep,
    ParallelStep: () => ParallelStep,
    PixelateStep: () => PixelateStep,
    RadialWipeStep: () => RadialWipeStep,
    RemoveOverlayStep: () => RemoveOverlayStep,
    RepeatStep: () => RepeatStep,
    RestoreOverlayStep: () => RestoreOverlayStep,
    ReverseStep: () => ReverseStep,
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
    ZoomBlurStep: () => ZoomBlurStep,
    ZoomStep: () => ZoomStep
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
    static reversible = false;
    reverse() {
      throw new NotImplementedError();
    }
    // #endregion Constructors (1)
    // #region Public Static Methods (7)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    static async RenderTemplate(config, oldScene, newScene) {
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
    static validate(config, sequence) {
      return config;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static validateForm(elem) {
      return true;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (5)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static addEventListeners(element, config) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static editDialogClosed(element) {
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
    async simpleReverse(filter) {
      await TweenMax.to(filter.uniforms, { progress: 0, duration: this.config.duration / 1e3, ease: this.config.easing || "none" });
    }
    async simpleTween(filter) {
      await TweenMax.to(filter.uniforms, { progress: 1, duration: this.config.duration / 1e3, ease: this.config.easing || "none" });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getDuration(config, sequence) {
      return 0;
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
  var texturewipe_default = "#version 300 es\n\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform sampler2D wipeSampler;\nuniform sampler2D bgSampler;\n\nvoid main() {\n    vec4 wipe = texture(wipeSampler, vTextureCoord);\n\n    if (wipe.b <= progress) {\n        color = texture(bgSampler, vTextureCoord);\n    } else {\n        color = texture(uSampler, vTextureCoord);\n    }\n}";

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
  function verticalInside() {
    return createGradientTexture(window.innerWidth, 1, 0, 0, window.innerWidth, 0, [
      { point: 0, color: "white" },
      { point: 0.5, color: "black" },
      { point: 1, color: "white" }
    ]);
  }
  function verticalOutside() {
    return createGradientTexture(window.innerWidth, 1, 0, 0, window.innerWidth, 0, [
      { point: 0, color: "black" },
      { point: 0.5, color: "white" },
      { point: 1, color: "black" }
    ]);
  }
  function topLeftInside() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 0.5, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function topRightInside() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      window.innerWidth,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 0.5, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function topLeftOutside() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 0.5, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function topRightOutside() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      window.innerWidth,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 0.5, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function horizontalInside() {
    return createGradientTexture(
      1,
      window.innerHeight,
      0,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 0.5, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function horizontalOutside() {
    return createGradientTexture(
      1,
      window.innerHeight,
      0,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 0.5, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function generateTexture(direction, radial) {
    if (direction === "horizontal" && radial === "inside") return horizontalInside();
    else if (direction === "horizontal" && radial === "outside") return horizontalOutside();
    else if (direction === "vertical" && radial === "inside") return verticalInside();
    else if (direction === "vertical" && radial === "outside") return verticalOutside();
    else if (direction === "topleft" && radial === "inside") return topLeftInside();
    else if (direction === "topleft" && radial === "outside") return topLeftOutside();
    else if (direction === "topright" && radial === "inside") return topRightInside();
    else if (direction === "topright" && radial === "outside") return topRightOutside();
    else if (direction === "bottomleft" && radial === "inside") return topRightInside();
    else if (direction === "bottomleft" && radial === "outside") return topRightOutside();
    else if (direction === "bottomright" && radial === "inside") return topLeftInside();
    else if (direction === "bottomright" && radial === "outside") return topLeftOutside();
    throw new InvalidDirectionError(`${direction}-${radial}`);
  }
  var BilinearWipeFilter = class extends TextureWipeFilter {
    constructor(direction, radial, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const wipeTexture = generateTexture(direction, radial);
      if (!wipeTexture) throw new InvalidDirectionError(`${direction}-${radial}`);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/LinearWipe/LinearWipeFilter.ts
  function left() {
    return createGradientTexture(
      window.innerWidth,
      1,
      0,
      0,
      window.innerWidth,
      0,
      [
        { point: 0, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function right() {
    return createGradientTexture(
      window.innerWidth,
      1,
      0,
      0,
      window.innerWidth,
      0,
      [
        { point: 0, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function top() {
    return createGradientTexture(
      1,
      window.innerHeight,
      0,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function bottom() {
    return createGradientTexture(
      1,
      window.innerHeight,
      0,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function bottomRight() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function bottomLeft() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      window.innerWidth,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function topRight() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      window.innerWidth,
      0,
      0,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function topLeft() {
    return createGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function generateTexture2(direction) {
    if (direction === "left") return left();
    else if (direction === "right") return right();
    else if (direction === "top") return top();
    else if (direction === "bottom") return bottom();
    else if (direction === "topleft") return topLeft();
    else if (direction === "topright") return topRight();
    else if (direction === "bottomleft") return bottomLeft();
    else if (direction === "bottomright") return bottomRight();
    throw new InvalidDirectionError(direction);
  }
  var LinearWipeFilter = class extends TextureWipeFilter {
    constructor(direction, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const wipeTexture = generateTexture2(direction);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/ClockWipe/ClockWipeFilter.ts
  function clockWipe(angle, direction) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    const gradient = ctx.createConicGradient(angle, canvas2.width / 2, canvas2.height / 2);
    gradient.addColorStop(0, direction === "clockwise" ? "black" : "white");
    gradient.addColorStop(1, direction === "clockwise" ? "white" : "black");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas2.width, canvas2.height);
    return PIXI.Texture.from(canvas2);
  }
  function generateTexture3(direction, clockDirection) {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    switch (direction) {
      case "right":
        return clockWipe(0, clockDirection);
      case "left":
        return clockWipe(Math.PI, clockDirection);
      case "top":
        return clockWipe(Math.PI * 2 * 0.75, clockDirection);
      case "bottom":
        return clockWipe(Math.PI * 0.5, clockDirection);
      case "topleft":
        return clockWipe(angleBetween(x, y, 0, 0), clockDirection);
      case "topright":
        return clockWipe(angleBetween(x, y, window.innerWidth, 0), clockDirection);
      case "bottomleft":
        return clockWipe(angleBetween(x, y, 0, window.innerHeight), clockDirection);
      case "bottomright":
        return clockWipe(angleBetween(x, y, window.innerWidth, window.innerHeight), clockDirection);
    }
  }
  var ClockWipeFilter = class extends TextureWipeFilter {
    constructor(clockDirection, direction, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const wipeTexture = generateTexture3(direction, clockDirection);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/SpotlightWipe/SpotlightWipeFilter.ts
  function topOutside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      window.innerWidth / 2,
      0,
      [
        { point: 0, color: "black" },
        { point: 0.25, color: "white" },
        { point: 0.5, color: "black" }
      ]
    );
  }
  function topInside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      window.innerWidth / 2,
      0,
      [
        { point: 0, color: "white" },
        { point: 0.25, color: "black" },
        { point: 0.5, color: "white" }
      ]
    );
  }
  function bottomOutside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      Math.PI,
      window.innerWidth / 2,
      window.innerHeight,
      [
        { point: 0, color: "white" },
        { point: 0.25, color: "black" },
        { point: 0.5, color: "white" }
      ]
    );
  }
  function bottomInside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      Math.PI,
      window.innerWidth / 2,
      window.innerHeight,
      [
        { point: 0, color: "black" },
        { point: 0.25, color: "white" },
        { point: 0.5, color: "black" }
      ]
    );
  }
  function leftInside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      Math.PI * 2 * 0.75,
      0,
      window.innerHeight / 2,
      [
        { point: 0, color: "white" },
        { point: 0.25, color: "black" },
        { point: 0.5, color: "white" }
      ]
    );
  }
  function leftOutside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      Math.PI * 2 * 0.75,
      0,
      window.innerHeight / 2,
      [
        { point: 0, color: "black" },
        { point: 0.25, color: "white" },
        { point: 0.5, color: "black" }
      ]
    );
  }
  function rightInside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      Math.PI * 0.5,
      window.innerWidth,
      window.innerHeight / 2,
      [
        { point: 0, color: "white" },
        { point: 0.25, color: "black" },
        { point: 0.5, color: "white" }
      ]
    );
  }
  function rightOutside() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      Math.PI * 0.5,
      window.innerWidth,
      window.innerHeight / 2,
      [
        { point: 0, color: "black" },
        { point: 0.25, color: "white" },
        { point: 0.5, color: "black" }
      ]
    );
  }
  function topLeftOutside2() {
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      angleBetween(0, 0, window.innerWidth, window.innerHeight),
      0,
      0,
      [
        { point: 0, color: "white" },
        { point: 0.25, color: "black" },
        { point: 0.85, color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function topLeftInside2() {
    const angle = angleBetween(0, 0, window.innerWidth, window.innerHeight);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      0,
      [
        { point: 0, color: "white" },
        { point: angle / (Math.PI * 2), color: "black" },
        { point: 0.25, color: "white" }
      ]
    );
  }
  function topRightInside2() {
    const angle = angleBetween(window.innerWidth, 0, 0, window.innerHeight);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      window.innerWidth,
      0,
      [
        { point: 0.25, color: "white" },
        { point: angle / (2 * Math.PI), color: "black" },
        { point: 0.5, color: "white" }
      ]
    );
  }
  function topRightOutside2() {
    const angle = angleBetween(window.innerWidth, 0, 0, window.innerHeight);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      window.innerWidth,
      0,
      [
        { point: 0.25, color: "black" },
        { point: angle / (2 * Math.PI), color: "white" },
        { point: 0.5, color: "black" }
      ]
    );
  }
  function bottomLeftOutside() {
    const angle = angleBetween(0, window.innerHeight, window.innerWidth, 0);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      window.innerHeight,
      [
        { point: 0.75, color: "black" },
        { point: 1 - Math.abs(angle) / (2 * Math.PI), color: "white" },
        { point: 1, color: "black" }
      ]
    );
  }
  function bottomLeftInside() {
    const angle = angleBetween(0, window.innerHeight, window.innerWidth, 0);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      window.innerHeight,
      [
        { point: 0.75, color: "white" },
        { point: 1 - Math.abs(angle) / (2 * Math.PI), color: "black" },
        { point: 1, color: "white" }
      ]
    );
  }
  function bottomRightOutside() {
    const angle = angleBetween(window.innerWidth, window.innerHeight, 0, 0);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      window.innerWidth,
      window.innerHeight,
      [
        { point: 0.5, color: "black" },
        { point: 1 - Math.abs(angle) / (2 * Math.PI), color: "white" },
        { point: 0.75, color: "black" }
      ]
    );
  }
  function bottomRightInside() {
    const angle = angleBetween(window.innerWidth, window.innerHeight, 0, 0);
    return createConicGradientTexture(
      window.innerWidth,
      window.innerHeight,
      0,
      window.innerWidth,
      window.innerHeight,
      [
        { point: 0.5, color: "white" },
        { point: 1 - Math.abs(angle) / (2 * Math.PI), color: "black" },
        { point: 0.75, color: "white" }
      ]
    );
  }
  var generators = {
    topinside: topInside,
    topoutside: topOutside,
    rightinside: rightInside,
    rightoutside: rightOutside,
    bottominside: bottomInside,
    bottomoutside: bottomOutside,
    leftinside: leftInside,
    leftoutside: leftOutside,
    topleftinside: topLeftInside2,
    topleftoutside: topLeftOutside2,
    toprightinside: topRightInside2,
    toprightoutside: topRightOutside2,
    bottomleftinside: bottomLeftInside,
    bottomleftoutside: bottomLeftOutside,
    bottomrightinside: bottomRightInside,
    bottomrightoutside: bottomRightOutside
  };
  function generateTexture4(direction, radial) {
    const func = generators[`${direction}${radial}`];
    if (!func) throw new InvalidDirectionError(`${direction}-${radial}`);
    return func();
  }
  var SpotlightWipeFilter = class extends TextureWipeFilter {
    constructor(direction, radial, bg = "transparent") {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const wipeTexture = generateTexture4(direction, radial);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/RadialWipe/RadialWipeFilter.ts
  function inside(x, y) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    const gradient = ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      Math.max(canvas2.width, canvas2.height)
    );
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "white");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas2.width, canvas2.height);
    return PIXI.Texture.from(canvas2);
  }
  function outside(x, y) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    const gradient = ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      Math.max(canvas2.width, canvas2.height)
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas2.width, canvas2.height);
    return PIXI.Texture.from(canvas2);
  }
  var RadialWipeFilter = class extends TextureWipeFilter {
    constructor(direction, x, y, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const wipeTexture = direction === "inside" ? inside(window.innerWidth * x, window.innerHeight * y) : outside(window.innerWidth * x, window.innerHeight * y);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/ChromaKey/chromakey.frag
  var chromakey_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform vec4 chromaKey;\nuniform vec2 maskRange;\nuniform sampler2D bgSampler;\nuniform vec2 iResolution;\n\nmat4 RGBtoYUV = mat4(0.257,  0.439, -0.148, 0.0,\n                     0.504, -0.368, -0.291, 0.0,\n                     0.098, -0.071,  0.439, 0.0,\n                     0.0625, 0.500,  0.500, 1.0 );\n\n\n//compute color distance in the UV (CbCr, PbPr) plane\nfloat colorClose(vec3 yuv, vec3 keyYuv, vec2 tol)\n{\n    float tmp = sqrt(pow(keyYuv.g - yuv.g, 2.0) + pow(keyYuv.b - yuv.b, 2.0));\n    if (tmp < tol.x)\n      return 0.0;\n   	else if (tmp < tol.y)\n      return (tmp - tol.x)/(tol.y - tol.x);\n   	else\n      return 1.0;\n}\n\nvoid main() {\n  vec2 fragPos = vTextureCoord.xy / iResolution.xy;\n  vec4 texColor0 = texture(uSampler, fragPos);\n  vec4 texColor1 = texture(bgSampler, fragPos);\n\n  vec4 keyYUV = RGBtoYUV * chromaKey;\n  vec4 yuv = RGBtoYUV * texColor0;\n\n  float mask = 1.0 - colorClose(yuv.rgb, keyYUV.rgb, maskRange);\n  color = max(texColor0 - mask * chromaKey, 0.0) + texColor1 * mask;\n}\n\n// precision highp float;\n\n// uniform sampler2D uSampler;\n// in vec2 vTextureCoord;\n// out vec4 color;\n\n// uniform vec4 keyRGBA;\n// uniform vec2 keyCC;\n// uniform vec2 range;\n// uniform vec2 iResolution;\n// uniform sampler2D bgSampler;\n\n// vec2 RGBToCC(vec4 rgba) {\n//     float Y = 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;\n//     return vec2((rgba.b - Y) * 0.565, (rgba.r - Y) * 0.713);\n// }\n\n// void main() {\n//     vec4 src1Color = texture(uSampler, vTextureCoord);\n//     vec2 CC = RGBToCC(src1Color);\n//     float mask = sqrt(pow(keyCC.x - CC.x, 2.0) + pow(keyCC.y - CC.y, 2.0));\n//     mask = smoothstep(range.x, range.y, mask);\n//     if (mask == 0.0) {\n//         color = texture(bgSampler, vTextureCoord);\n//     }\n//     else if (mask == 1.0) {\n//         color = src1Color;\n//     }\n//     else {\n//         color = max(src1Color - (1.0 - mask) * keyRGBA, 0.0);\n//     }\n// }\n";

  // src/filters/ChromaKey/ChromaKeyFilter.ts
  var ChromaKeyFilter = class extends CustomFilter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(keyColor = [0.05, 0.63, 0.14, 1], bg = "transparent") {
      const color = new PIXI.Color(keyColor);
      const bgSampler = coerceTexture(bg) ?? createColorTexture("transparent");
      const uniforms = {
        // chromaKey: [color.red, color.green, color.blue, 1],
        chromaKey: [color.red, color.green, color.blue, 1],
        bgSampler,
        maskRange: [5e-3, 0.26],
        iResolution: [1, 1]
      };
      super(void 0, chromakey_default, uniforms);
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
    const left2 = ctx.createLinearGradient(0, 0, canvas2.width, 0);
    const right2 = ctx.createLinearGradient(0, 0, canvas2.width, 0);
    left2.addColorStop(0, "black");
    left2.addColorStop(1, "white");
    right2.addColorStop(0, "white");
    right2.addColorStop(1, "black");
    const barHeight = canvas2.height / bars;
    for (let i = 0; i < bars; i++) {
      ctx.fillStyle = i % 2 === 0 ? left2 : right2;
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
    const top2 = ctx.createLinearGradient(0, 0, 0, canvas2.height);
    const bottom2 = ctx.createLinearGradient(0, 0, 0, canvas2.height);
    top2.addColorStop(0, "black");
    top2.addColorStop(1, "white");
    bottom2.addColorStop(0, "white");
    bottom2.addColorStop(1, "black");
    const barWidth = canvas2.width / bars;
    for (let i = 0; i < bars; i++) {
      ctx.fillStyle = i % 2 === 0 ? top2 : bottom2;
      ctx.fillRect(barWidth * i, 0, barWidth + barWidth * i, canvas2.height);
    }
    return PIXI.Texture.from(canvas2);
  }
  var BarWipeFilter = class extends TextureWipeFilter {
    constructor(direction, bars, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      if (!(direction === "horizontal" || direction === "vertical")) throw new InvalidDirectionError(direction);
      const wipeTexture = direction === "horizontal" ? createHorizontalTexture(bars) : createVerticalTexture(bars);
      super(wipeTexture, bgTexture);
    }
  };

  // src/filters/Zoom/zoom.frag
  var zoom_default = "#version 300 es\n\nprecision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform vec2 center;\nuniform float amount;\n\nuniform bool clampBounds;\nuniform sampler2D bgSampler;\n\nvoid main() {\n    // color = texture(uSampler, vTextureCoord);\n\n    vec2 zoomed_uv = (vTextureCoord - center) * amount + center;\n    // Clamp to boundaries\n    if (clampBounds) {\n        zoomed_uv = clamp(zoomed_uv, vec2(0.0), vec2(1.0));\n    }\n\n    if (zoomed_uv.x < 0.0 || zoomed_uv.x > 1.0 || zoomed_uv.y < 0.0 || zoomed_uv.y > 1.0) {\n        color = texture(bgSampler, zoomed_uv);\n    } else {\n        // vec2 tex_uv = vec2(zoomed_uv.x, 1.0 - zoomed_uv.y)\n        color = texture(uSampler, zoomed_uv);\n    }\n}";

  // src/filters/Zoom/ZoomFilter.ts
  var ZoomFilter = class extends CustomFilter {
    constructor(center, amount = 0, clampBounds = false, bg = "transparent") {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      super(void 0, zoom_default, {
        center,
        amount,
        clampBounds,
        bgSampler: bgTexture
      });
    }
  };

  // src/filters/index.ts
  var filters = {
    CustomFilter,
    FireDissolveFilter,
    DiamondTransitionFilter,
    TextureWipeFilter,
    FadeTransitionFilter,
    LinearWipeFilter,
    BilinearWipeFilter,
    ClockWipeFilter,
    SpotlightWipeFilter,
    RadialWipeFilter,
    ChromaKeyFilter,
    TextureSwapFilter,
    MeltFilter,
    AngularWipeFilter,
    WaveWipeFilter,
    InvertFilter,
    SpiralWipeFilter,
    SpiralShutterFilter,
    HueShiftFilter,
    BarWipeFilter,
    ZoomFilter
  };

  // src/steps/selectOptions.ts
  function drawingType(drawing) {
    switch (drawing.shape.type) {
      case "r":
        return "RECTANGLE";
      case "c":
        return "CIRCLE";
      case "p":
        return "POLYGON";
      case "e":
        return "ELLIPSE";
      default:
        return "UNKNOWN";
    }
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
  function generateDrawingSelectOptions(scene) {
    return scene ? Object.fromEntries(scene.drawings.contents.map((drawing) => [drawing.uuid, localize(`BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.SHAPES.${drawingType(drawing)}`)])) : {};
  }
  function generateDualStyleSelectOptions() {
    return {
      "overlay": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.OVERLAY`,
      "scene": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.SCENE`,
      "both": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.BOTH`
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
  function generateFontSelectOptions() {
    return Object.fromEntries(FontConfig.getAvailableFonts().map((font) => [font, font]));
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
  function generateNoteSelectOptions(scene) {
    return scene ? Object.fromEntries(scene.notes.contents.map((note) => [note.uuid, note.entry?.name ?? ""])) : {};
  }
  function generateRadialDirectionSelectOptions() {
    return {
      "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
      "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
    };
  }
  function generateTargetTypeSelectOptions(oldScene, newScene) {
    const oldHasTokens = !!oldScene?.tokens.contents.length;
    const oldHasTiles = !!oldScene?.tiles.contents.length;
    const oldHasNotes = !!oldScene?.notes.contents.length;
    const oldHasDrawings = !!oldScene?.drawings.contents.length;
    const newHasTokens = !!newScene?.tokens.contents.length;
    const newHasTiles = !!newScene?.tiles.contents.length;
    const newHasNotes = !!newScene?.notes.contents.length;
    const newHasDrawings = !!newScene?.drawings.contents.length;
    return {
      targetTypeSelect: {
        point: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.POINT.LABEL",
        ...oldScene ? {} : { prompt: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.PROMPT.LABEL" },
        ...oldHasTokens ? { oldtoken: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {},
        ...oldHasTiles ? { oldtile: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {},
        ...oldHasNotes ? { oldnote: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {},
        ...oldHasDrawings ? { olddrawing: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {},
        ...newHasTokens ? { newtoken: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.NEWSCENE.LABEL", { scene: newScene.name }) } : {},
        ...newHasTiles ? { newtile: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.NEWSCENE.LABEL", { scene: newScene.name }) } : {},
        ...newHasNotes ? { newnote: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.NEWSCENE.LABEL", { scene: newScene.name }) } : {},
        ...newHasDrawings ? { newdrawing: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.NEWSCENE.LABEL", { scene: newScene.name }) } : {}
      },
      oldTokenSelect: oldScene ? generateTokenSelectOptions(oldScene) : {},
      oldTileSelect: oldScene ? generateTileSelectOptions(oldScene) : {},
      oldNoteSelect: oldScene ? generateNoteSelectOptions(oldScene) : {},
      oldDrawingSelect: oldScene ? generateDrawingSelectOptions(oldScene) : {},
      newTokenSelect: newScene ? generateTokenSelectOptions(newScene) : {},
      newTileSelect: newScene ? generateTileSelectOptions(newScene) : {},
      newNoteSelect: newScene ? generateNoteSelectOptions(newScene) : {},
      newDrawingSelect: newScene ? generateDrawingSelectOptions(newScene) : {},
      oldHasTokens,
      oldHasTiles,
      oldHasNotes,
      oldHasDrawings,
      newHasTokens,
      newHasTiles,
      newHasNotes,
      newHasDrawings
    };
  }
  function generateTileSelectOptions(scene) {
    return scene ? Object.fromEntries(scene.tiles.contents.map((tile) => [tile.uuid, tile.texture.src])) : {};
  }
  function generateTokenSelectOptions(scene) {
    return scene ? Object.fromEntries(scene.tokens.contents.map((token) => [token.uuid, token.name])) : {};
  }

  // src/steps/AngularWipeStep.ts
  var AngularWipeStep = class _AngularWipeStep extends TransitionStep {
    // #region Properties (9)
    #filter = null;
    static DefaultSettings = {
      id: "",
      type: "angularwipe",
      duration: 1e3,
      easing: "none",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon angular-wipe fa-fw fas'></i>";
    static key = "angularwipe";
    static name = "ANGULARWIPE";
    static reversible = true;
    static template = "angularwipe-config";
    // #endregion Properties (9)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_AngularWipeStep.template}.hbs`, {
        ..._AngularWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(formElement), "id", "duration", "easing", "backgroundType", "backgroundColor", "label");
      return new _AngularWipeStep({
        ..._AngularWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._AngularWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    async execute(container) {
      const config = {
        ..._AngularWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new AngularWipeFilter(background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof AngularWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/BarWipeStep.ts
  var BarWipeStep = class _BarWipeStep extends TransitionStep {
    // #region Properties (9)
    #filter = null;
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-bars"></i>`;
    static key = "barwipe";
    static name = "BARWIPE";
    static reversible = true;
    static template = "barwipe-config";
    // #endregion Properties (9)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_BarWipeStep.template}.hbs`, {
        ..._BarWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
        ...parseConfigurationFormElements(elem, "id", "duration", "bars", "direction", "easing", "backgroundType", "backgroundColor", "label"),
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._BarWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence, preparedSequence) {
      const config = {
        ..._BarWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new BarWipeFilter(config.direction, config.bars, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof BarWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/BillinearWipeStep.ts
  var BilinearWipeStep = class _BilinearWipeStep extends TransitionStep {
    // #region Properties (9)
    #filter = null;
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-arrows-left-right-to-line"></i>`;
    static key = "bilinearwipe";
    static name = "BILINEARWIPE";
    static reversible = true;
    static template = "bilinearwipe-config";
    // #endregion Properties (9)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_BilinearWipeStep.template}.hbs`, {
        ..._BilinearWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "radial", "easing", "backgroundType", "backgroundColor", "label");
      return new _BilinearWipeStep({
        ..._BilinearWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._BilinearWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, _sequence) {
      const config = {
        ..._BilinearWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof BilinearWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/BossSplashStep.ts
  function getSplashSetting(key) {
    return game.settings?.get("boss-splash", key);
  }
  var BossSplashStep = class _BossSplashStep extends TransitionStep {
    static get DefaultSettings() {
      return {
        id: "",
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
        id: foundry.utils.randomID(),
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
    // public static validateForm(elem: HTMLElement | JQuery<HTMLElement>): boolean { return true; }
    static validateForm(elem) {
      const html = $(elem);
      if (!isValidFontSize(html.find("#fontSize").val())) return false;
      if (!isValidFontSize(html.find("#subSize").val())) return false;
      return true;
    }
    static addEventListeners(element) {
      const html = $(element);
      html.find("#fontSize").on("input", foundry.utils.debounce((e) => {
        $(e.currentTarget).val(parseFontSize($(e.currentTarget).val() || ""));
      }, 250));
      html.find("#subSize").on("input", foundry.utils.debounce((e) => {
        $(e.currentTarget).val(parseFontSize($(e.currentTarget).val() || ""));
      }, 250));
      html.find("#font option").each((index, element2) => {
        const val = $(element2).val();
        $(element2).css("font-family", val);
      });
      html.find("#font").on("input", (e) => {
        $(e.currentTarget).css("font-family", $(e.currentTarget).val());
      });
    }
    static fromFormElement(form) {
      const elem = $(form);
      const sound = elem.find("#sound").val() ?? "";
      const fontSize = parseFontSize(elem.find("#fontSize").val());
      const subSize = parseFontSize(elem.find("#subSize").val());
      return new _BossSplashStep({
        ..._BossSplashStep.DefaultSettings,
        sound,
        ...parseConfigurationFormElements(elem, "id", "actor", "message", "subText", "duration", "animationDelay", "animationDuration", "topColor", "midColor", "botColor", "fontColor", "fontShadow", "subColor", "subShadow", "font", "label"),
        fontSize: isValidFontSize(fontSize) ? fontSize : _BossSplashStep.DefaultSettings.fontSize,
        subSize: isValidFontSize(subSize) ? subSize : _BossSplashStep.DefaultSettings.subSize
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
      version: "1.1.0",
      applyToOverlay: true,
      applyToScene: false
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
    #sceneFilter = null;
    teardown() {
      if (this.#sceneFilter) {
        if (Array.isArray(canvas?.stage?.filters) && canvas.stage.filters.includes(this.#sceneFilter)) canvas.stage.filters.splice(canvas.stage.filters.indexOf(this.#sceneFilter), 1);
        this.#sceneFilter.destroy();
        this.#sceneFilter = null;
      }
    }
    execute(container, sequence, prepared) {
      const config = {
        ..._ClearEffectsStep.DefaultSettings,
        ...this.config
      };
      if (config.applyToOverlay) {
        const overlayChildren = [...prepared.overlay];
        for (const child of overlayChildren) {
          if (Array.isArray(child.filters)) {
            for (const filter of child.filters) {
              if (child.filters.includes(filter)) child.filters.splice(child.filters.indexOf(filter), 1);
              filter.destroy();
            }
          }
        }
      }
      if (config.applyToScene && canvas?.environment) {
        const filters2 = prepared.prepared.sceneFilters;
        for (const filter of filters2) {
          removeFilterFromScene(filter);
        }
      }
    }
  };

  // src/steps/ClockWipeStep.ts
  var ClockWipeStep = class _ClockWipeStep extends TransitionStep {
    // #region Properties (9)
    #filter = null;
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon clock-wipe fa-fw fas'></i>";
    static key = "clockwipe";
    static name = "CLOCKWIPE";
    static reversible = true;
    static template = "clockwipe-config";
    // #endregion Properties (9)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ClockWipeStep.template}.hbs`, {
        ..._ClockWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "direction", "clockdirection", "easing", "backgroundType", "backgroundColor", "label");
      return new _ClockWipeStep({
        ..._ClockWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._ClockWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._ClockWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new ClockWipeFilter(config.clockDirection, config.direction, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof ClockWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/DiamondWipeStep.ts
  var DiamondWipeStep = class _DiamondWipeStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon diamond-wipe fa-fw fas'></i>";
    static key = "diamondwipe";
    static name = "DIAMONDWIPE";
    static template = "diamondwipe-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_DiamondWipeStep.template}.hbs`, {
        ..._DiamondWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "easing", "backgroundType", "backgroundColor", "label");
      return new _DiamondWipeStep({
        ..._DiamondWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._DiamondWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #filter = null;
    async reverse() {
      if (this.#filter instanceof DiamondTransitionFilter) await this.simpleReverse(this.#filter);
    }
    async execute(container) {
      const config = {
        ..._DiamondWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new DiamondTransitionFilter(config.size, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/FadeStep.ts
  var FadeStep = class _FadeStep extends TransitionStep {
    // #region Properties (9)
    #filter = null;
    static DefaultSettings = {
      id: "",
      type: "fade",
      duration: 1e3,
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundColor: "#00000000",
      easing: "none"
    };
    static category = "effect";
    static hidden = false;
    static icon = "<i class='bt-icon fade fa-fw fas'></i>";
    static key = "fade";
    static name = "FADE";
    static reversible = true;
    static template = "fade-config";
    // #endregion Properties (9)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_FadeStep.template}.hbs`, {
        ..._FadeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "backgroundType", "backgroundColor", "easing", "label");
      return new _FadeStep({
        ..._FadeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._FadeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._FadeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new FadeTransitionFilter(background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof FadeTransitionFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/FireDissolveStep.ts
  var FireDissolveStep = class _FireDissolveStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "firedissolve",
      duration: 1e3,
      easing: "none",
      burnSize: 1.3,
      version: "1.1.0"
    };
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon fire-dissolve fa-fw fas'></i>";
    static key = "firedissolve";
    static name = "FIREDISSOLVE";
    static template = "firedissolve-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_FireDissolveStep.template}.hbs`, {
        ..._FireDissolveStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "easing", "burnSize", "label");
      return new _FireDissolveStep({
        ..._FireDissolveStep.DefaultSettings,
        ...elem
      });
    }
    static getDuration(config) {
      return { ..._FireDissolveStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #filter = null;
    async reverse() {
      if (this.#filter instanceof FireDissolveFilter) await this.simpleReverse(this.#filter);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const filter = new FireDissolveFilter(this.config.burnSize);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/FlashStep.ts
  var FlashStep = class _FlashStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "flash",
      duration: 250,
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000",
      applyToOverlay: true,
      applyToScene: false
    };
    static category = "effect";
    static hidden = false;
    static icon = "<i class='bt-icon flash fa-fw fas'></i>";
    static key = "flash";
    static name = "FLASH";
    static template = "flash-config";
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_FlashStep.template}.hbs`, {
        ..._FlashStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _FlashStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _FlashStep.fromFormElement(arg[0]);
      return new _FlashStep(arg);
    }
    static fromFormElement(form) {
      const backgroundImage = $(form).find("#backgroundImage").val() ?? "";
      const elem = parseConfigurationFormElements($(form), "id", "duration", "backgroundType", "backgroundColor", "label");
      return new _FlashStep({
        ..._FlashStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._FlashStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    async execute(container, sequence, prepared) {
      const config = {
        ..._FlashStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("tranparent");
      const promises = [];
      if (config.applyToOverlay) {
        const filter = new TextureSwapFilter(background.baseTexture);
        this.addFilter(container, filter);
        promises.push(wait(config.duration).then(() => {
          this.removeFilter(container, filter);
          filter.destroy();
        }));
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new TextureSwapFilter(background.baseTexture);
        addFilterToScene(filter, prepared.prepared);
        promises.push(wait(config.duration).then(() => {
          removeFilterFromScene(filter);
        }));
      }
      await Promise.all(promises);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/HueShiftStep.ts
  var HueShiftStep = class _HueShiftStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "hueshift",
      duration: 0,
      version: "1.1.0",
      maxShift: 0,
      easing: "none",
      applyToOverlay: true,
      applyToScene: false
    };
    static category = "effect";
    static hidden = false;
    static icon = "<i class='bt-icon hue-shift fa-fw fas'></i>";
    static key = "hueshift";
    static name = "HUESHIFT";
    static template = "hueshift-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_HueShiftStep.template}.hbs`, {
        ..._HueShiftStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
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
      const dualStyle = elem.find("#dualStyle").val();
      return new _HueShiftStep({
        ..._HueShiftStep.DefaultSettings,
        maxShift,
        ...parseConfigurationFormElements(elem, "id", "duration", "easing", "label"),
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      });
    }
    static getDuration(config) {
      return { ..._HueShiftStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #sceneFilter = null;
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    #filters = [];
    async reverse() {
      const config = {
        ..._HueShiftStep.DefaultSettings,
        ...this.config
      };
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.#filters.map((filter) => TweenMax.to(filter.uniforms, { shift: 0, duration: config.duration / 1e3, ease: config.easing }))
      );
    }
    async execute(container, sequence, prepared) {
      const config = {
        ..._HueShiftStep.DefaultSettings,
        ...this.config
      };
      const filters2 = [];
      if (config.applyToOverlay) {
        const filter = new HueShiftFilter(0);
        this.addFilter(container, filter);
        filters2.push(filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new HueShiftFilter(0);
        addFilterToScene(filter, prepared.prepared);
        this.#sceneFilter = filter;
        filters2.push(filter);
      }
      this.#filters = [...filters2];
      await Promise.all(filters2.map((filter) => TweenMax.to(filter.uniforms, { shift: config.maxShift, duration: config.duration / 1e3, ease: config.easing ?? "none" })));
    }
    // #endregion Public Methods (1)
  };

  // src/steps/InvertStep.ts
  var InvertStep = class _InvertStep extends TransitionStep {
    // #region Properties (6)
    static DefaultSettings = {
      id: "",
      type: "invert",
      version: "1.1.0",
      applyToOverlay: true,
      applyToScene: false
    };
    static hidden = false;
    static key = "invert";
    static name = "INVERT";
    static template = "invert-config";
    static category = "effect";
    static icon = "<i class='bt-icon invert fa-fw fas'></i>";
    // #endregion Properties (6)
    // #region Public Static Methods (6)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_InvertStep.template}.hbs`, {
        ..._InvertStep.DefaultSettings,
        ...config ? config : {},
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _InvertStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _InvertStep.fromFormElement(arg[0]);
      else return new _InvertStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const dualStyle = elem.find("#dualStyle").val();
      return new _InvertStep({
        ..._InvertStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...parseConfigurationFormElements(elem, "id"),
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    #sceneFilter = null;
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    execute(container, sequence, prepared) {
      const config = {
        ..._InvertStep.DefaultSettings,
        ...this.config
      };
      if (config.applyToOverlay) {
        const filter = new InvertFilter();
        this.addFilter(container, filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new InvertFilter();
        addFilterToScene(filter, prepared.prepared);
        this.#sceneFilter = filter;
      }
    }
    // #endregion Public Methods (1)
  };

  // src/steps/LinearWipeStep.ts
  var LinearWipeStep = class _LinearWipeStep extends TransitionStep {
    // #region Properties (10)
    #filter = null;
    defaultSettings = {
      duration: 1e3
    };
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-arrow-right"></i>`;
    static key = "linearwipe";
    static name = "LINEARWIPE";
    static reversible = true;
    static template = "linearwipe-config";
    // #endregion Properties (10)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_LinearWipeStep.template}.hbs`, {
        ..._LinearWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "direction", "easing", "backgroundType", "backgroundColor", "label");
      return new _LinearWipeStep({
        ..._LinearWipeStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._LinearWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._LinearWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new LinearWipeFilter(config.direction, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof LinearWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
  };

  // src/steps/LoadingTipStep.ts
  var ACTIVE_TEXT_ELEMENT = null;
  var LoadingTipStep = class _LoadingTipStep extends TransitionStep {
    static DefaultSettings = {
      id: "",
      type: "loadingtip",
      version: "1.1.0",
      duration: 0,
      source: "string",
      message: "Loading",
      location: "bottomcenter",
      style: {
        ...JSON.parse(JSON.stringify(PIXI.HTMLTextStyle.defaultStyle)),
        fill: "#FFFFFF",
        dropShadow: true,
        fontSize: 64
      }
    };
    static category = "effect";
    static hidden = false;
    static icon = `<i class="fas fa-spinner"></i>`;
    static key = "loadingtip";
    static name = "LOADINGTIP";
    static template = "loadingtip-config";
    static async RenderTemplate(config) {
      const style = styleFromJSON({
        ..._LoadingTipStep.DefaultSettings,
        ...config ? config : {}
      }.style);
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_LoadingTipStep.template}.hbs`, {
        ..._LoadingTipStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        sourceSelect: {
          "string": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.SOURCETYPE.STRING.LABEL",
          "rolltable": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.SOURCETYPE.ROLLTABLE.LABEL"
        },
        locationSelect: {
          "topleft": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPLEFT",
          "topcenter": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPCENTER",
          "topright": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPRIGHT",
          "center": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.CENTER",
          "bottomleft": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMLEFT",
          "bottomcenter": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMCENTER",
          "bottomright": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMRIGHT"
        },
        tableSelect: Object.fromEntries(getRollTables().map((table) => [table.uuid, table.name])),
        fontSelect: generateFontSelectOptions(),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontColor: style.fill
      });
    }
    static getDuration(config) {
      const actual = {
        ..._LoadingTipStep.DefaultSettings,
        ...config
      };
      return actual.duration;
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _LoadingTipStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _LoadingTipStep.fromFormElement(arg[0]);
      else return new _LoadingTipStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const source = elem.find("#sourceType").val();
      let message = "";
      let table = "";
      if (source === "string") message = elem.find("#message").val();
      else if (source === "rolltable") table = elem.find("#table").val();
      const style = JSON.parse(JSON.stringify(styleFromJSON({
        ..._LoadingTipStep.DefaultSettings.style,
        fontFamily: elem.find("#fontFamily").val(),
        fontSize: elem.find("#fontSize").val(),
        fill: elem.find("#fontColor").val()
      })));
      return new _LoadingTipStep({
        ..._LoadingTipStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "location"),
        source,
        message,
        table,
        style
      });
    }
    execute(container) {
      const config = {
        ..._LoadingTipStep.DefaultSettings,
        ...this.config
      };
      const style = styleFromJSON(config.style);
      if (!ACTIVE_TEXT_ELEMENT) {
        ACTIVE_TEXT_ELEMENT = new PIXI.HTMLText(config.message ?? "");
        container.parent.addChild(ACTIVE_TEXT_ELEMENT);
      }
      ACTIVE_TEXT_ELEMENT.text = messageFromConfig(config);
      ACTIVE_TEXT_ELEMENT.style = style;
      const [x, y] = positionFromConfig(config);
      const anchor = anchorFromConfig(config);
      ACTIVE_TEXT_ELEMENT.anchor.x = anchor[0];
      ACTIVE_TEXT_ELEMENT.anchor.y = anchor[1];
      ACTIVE_TEXT_ELEMENT.x = x;
      ACTIVE_TEXT_ELEMENT.y = y;
      if (config.duration) {
        return new Promise((resolve) => {
          setTimeout(() => {
            this.teardown();
            resolve();
          }, config.duration);
        });
      }
    }
    // public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void { }
    static addEventListeners(element) {
      const elem = $(element);
      setMessageSource(elem, elem.find("#sourceType").val());
      elem.find("#sourceType").on("input", () => {
        const source = elem.find("#sourceType").val();
        setMessageSource(elem, source);
        if (source === "string") elem.find("#table").removeAttr("required");
        else if (source === "rolltable") elem.find("#table").attr("required", "true");
      });
    }
    teardown() {
      if (ACTIVE_TEXT_ELEMENT) {
        ACTIVE_TEXT_ELEMENT.destroy();
        ACTIVE_TEXT_ELEMENT = null;
      }
    }
  };
  function styleFromJSON(json) {
    const style = new PIXI.HTMLTextStyle();
    deepCopy(style, json);
    return style;
  }
  function messageFromConfig(config) {
    if (config.source === "rolltable") {
      if (!config.table) throw new InvalidRollTableError(config.table);
      const table = fromUuidSync(config.table);
      if (!(table instanceof RollTable)) throw new InvalidRollTableError(config.table);
      return table.results.contents[Math.floor(Math.random() * table.results.contents.length)].text;
    } else {
      return config.message ?? "";
    }
  }
  function getVisualRectangle() {
    return {
      x: elementRight("#controls"),
      y: elementBottom("#ui-top"),
      width: ($("#sidebar").offset() ?? { top: 0, left: 0 }).left - elementRight("#controls"),
      height: ($("#ui-bottom").offset() ?? { top: 0, left: 0 }).top - elementBottom("#ui-top") - 25
    };
  }
  function anchorFromConfig(config) {
    switch (config.location) {
      case "topleft":
        return [0, 0];
      case "topcenter":
        return [0.5, 0];
      case "topright":
        return [1, 0];
      case "center":
        return [0.5, 0.5];
      case "bottomleft":
        return [0, 1];
      case "bottomcenter":
        return [0.5, 1];
      case "bottomright":
        return [1, 1];
      default:
        throw new InvalidTipLocationError(config.location);
    }
  }
  function positionFromConfig(config) {
    const viewBox = getVisualRectangle();
    switch (config.location) {
      case "topleft":
        return [viewBox.x, viewBox.y];
      case "topcenter":
        return [window.innerWidth / 2, viewBox.y];
      case "topright":
        return [viewBox.x + viewBox.width, viewBox.y];
      case "bottomleft":
        return [viewBox.x, viewBox.y + viewBox.height];
      case "bottomcenter":
        return [window.innerWidth / 2, viewBox.y + viewBox.height];
      case "bottomright":
        return [viewBox.x + viewBox.width, viewBox.height + viewBox.y];
      case "center":
        return [window.innerWidth / 2, window.innerHeight / 2];
      default:
        throw new InvalidTipLocationError(config.location);
    }
  }
  function elementRight(selector) {
    return (($(selector).offset() ?? { top: 0, left: 0 }).left ?? 0) + ($(selector).width() ?? 0);
  }
  function elementBottom(selector) {
    return (($(selector).offset() ?? { top: 0, left: 0 }).top ?? 0) + ($(selector).height() ?? 0);
  }
  function getRollTables() {
    return [
      ...game?.tables?.contents ?? []
    ];
  }
  function setMessageSource(html, source) {
    html.find("[data-source-type]").css("display", "none");
    html.find(`[data-source-type="${source}"]`).css("display", "block");
  }

  // src/steps/MacroStep.ts
  var MacroStep = class _MacroStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      id: "",
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
        ..._MacroStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "macro", "label");
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
    // #region Properties (9)
    #filter = null;
    static DefaultSettings = {
      id: "",
      type: "melt",
      duration: 1e3,
      version: "1.1.0",
      easing: "none",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000"
    };
    static category = "warp";
    static hidden = false;
    static icon = "<i class='bt-icon melt fa-fw fas'></i>";
    static key = "melt";
    static name = "MELT";
    static reversible = true;
    static template = "melt-config";
    // #endregion Properties (9)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_MeltStep.template}.hbs`, {
        ..._MeltStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
      const elem = parseConfigurationFormElements($(form), "id", "duration", "easing", "backgroundType", "backgroundColor", "label");
      return new _MeltStep({
        ..._MeltStep.DefaultSettings,
        ...elem,
        serializedTexture: backgroundImage
      });
    }
    static getDuration(config) {
      return { ..._MeltStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (2)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new MeltFilter(background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    async reverse() {
      if (this.#filter instanceof MeltFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (2)
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
        const validated = await BattleTransition.validateSequence(sequence);
        if (validated instanceof Error) throw validated;
        const actual = {
          caller: game.user?.id ?? "",
          id,
          sequence: validated.map((step) => typeof step.id === "undefined" ? { ...step, id: foundry.utils.randomID() } : step)
        };
        if (!sequence.some((step) => step.type === "startplaylist")) {
          const step = {
            ...StartPlaylistStep.DefaultSettings,
            ...new StartPlaylistStep({}).config
          };
          actual.sequence.push(step);
        }
        const expectedDuration = await sequenceDuration(actual.sequence);
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
    static async prompt(config, oldScene, newScene) {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
      const content = await step.RenderTemplate(config, oldScene, newScene);
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
            const CLOSE_HOOK_ID = Hooks.on("closeDialog", (closed) => {
              if (closed.id === dialog.id) {
                Hooks.off("closeDialog", CLOSE_HOOK_ID);
                step.editDialogClosed(html);
              }
            });
          }
        });
        dialog.render(true, { classes: ["dialog", "bt"], resizable: true, width: 500 });
      });
    }
  };
  function checkFormValidity(html) {
    const stepType = html.find("[data-transition-type]").data("transition-type");
    const step = getStepClassByKey(stepType);
    if (!step) throw new InvalidTransitionError(stepType);
    const valid = step.validateForm(html) && html.find("form")[0]?.checkValidity();
    if (valid) html.find("button[data-action='ok']").removeAttr("disabled");
    else html.find("button[data-action='ok']").attr("disabled", "true");
  }
  function addEventListeners3(dialog, html) {
    html.find("input[type='number'],input[type='text']").on("focus", (e) => {
      e.currentTarget.select();
    });
    checkFormValidity(html);
    html.find("input").on("input", () => {
      checkFormValidity(html);
    });
    html.find("[data-font-select] option").each((index, element) => {
      if (element instanceof HTMLOptionElement)
        element.style.fontFamily = element.value;
    });
    html.find("[data-font-select]").css("font-family", html.find("[data-font-select]").val());
    html.find("[data-font-select]").on("input", (e) => {
      $(e.currentTarget).css("font-family", $(e.currentTarget).val());
    });
    html.find("#backgroundImage").on("input", () => {
      const val = html.find("#backgroundImage").val() ?? "";
      if (val) {
        const tag = document.createElement("img");
        const img = $(tag);
        img.addClass("bg-image-preview");
        img.attr("src", val);
        html.find("#backgroundImagePreview img").remove();
        html.find("#backgroundImagePreview").append(img);
      } else {
        html.find("#backgroundImagePreview img").remove();
      }
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
    html.find(`[data-background-type]`).css("display", "none");
    html.find(`[data-background-type="${bgType}"]`).css("display", "block");
  }

  // src/dialogs/EditStepDialogV2.ts
  var EditStepDialogV2 = class {
    static async prompt(config, oldScene, newScene) {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
      const content = await step.RenderTemplate(config, oldScene, newScene);
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
          const elem = $(dialog2.element);
          addEventListeners4(dialog2, elem);
          step.addEventListeners(elem, config);
          const CLOSE_HOOK_ID = Hooks.on("closeDialogV2", (closedDialog) => {
            if (closedDialog.id === dialog2.id) {
              Hooks.off("closeDialogV2", CLOSE_HOOK_ID);
              step.editDialogClosed(elem);
            }
          });
        });
      });
    }
  };
  function checkFormValidity2(html) {
    const stepType = html.find("[data-transition-type]").data("transition-type");
    const step = getStepClassByKey(stepType);
    if (!step) throw new InvalidTransitionError(stepType);
    const valid = step.validateForm(html) && html.find("form")[0]?.checkValidity();
    if (valid) html.find("button[data-action='ok']").removeAttr("disabled");
    else html.find("button[data-action='ok']").attr("disabled", "true");
  }
  function addEventListeners4(dialog, html) {
    html.find("input[type='number'],input[type='text']").on("focus", (e) => {
      e.currentTarget.select();
    });
    checkFormValidity2(html);
    html.find("input,select").on("input", () => {
      checkFormValidity2(html);
    });
    html.find("#backgroundImage").on("input", () => {
      const val = html.find("#backgroundImage").val() ?? "";
      if (val) {
        const tag = document.createElement("img");
        const img = $(tag);
        img.addClass("bg-image-preview");
        img.attr("src", val);
        html.find("#backgroundImagePreview img").remove();
        html.find("#backgroundImagePreview").append(img);
      } else {
        html.find("#backgroundImagePreview img").remove();
      }
    });
    html.find("[data-font-select] option").each((index, element) => {
      if (element instanceof HTMLOptionElement)
        element.style.fontFamily = element.value;
    });
    html.find("[data-font-select]").css("font-family", html.find("[data-font-select]").val());
    html.find("[data-font-select]").on("input", (e) => {
      $(e.currentTarget).css("font-family", $(e.currentTarget).val());
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
    html.find(`[data-background-type]`).css("display", "none");
    html.find(`[data-background-type="${bgType}"]`).css("display", "block");
  }

  // src/dialogs/TransitionBuilderV1.ts
  var TransitionBuilderV1 = class {
    static async prompt(scene) {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/dialogs/TransitionBuilder.hbs`, {
        newScene: scene?.id,
        oldScene: game.scenes?.current?.id ?? "",
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
                const sceneId = scene ? scene.id : elem.find("#newScene").val();
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
    html.find(`[data-action="import-json"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void uploadHandler(dialog, html);
      }
    });
    html.find("[data-action='clear-steps']").on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void clearButtonhandler(html);
      }
    });
    setClearDisabled(html);
  }
  async function clearButtonhandler(html) {
    const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
    if (!confirmed) return;
    html.find("#transition-step-list").children().remove();
    await updateTotalDuration(html);
    setClearDisabled(html);
  }
  function setClearDisabled(html) {
    const sequence = buildTransitionFromForm(html);
    if (!sequence.length) html.find("#clear-steps").attr("disabled", "true");
    else html.find("#clear-steps").removeAttr("disabled");
  }
  async function uploadHandler(dialog, html) {
    try {
      const current = buildTransitionFromForm(html);
      if (current.length) {
        const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
        if (!confirmation) return;
      }
      const sequence = await uploadJSON();
      html.find("#transition-step-list").children().remove();
      for (const step of sequence)
        await upsertStepButton(dialog, html, step);
    } catch (err) {
      ui.notifications?.error(err.message, { console: false });
      console.error(err);
    }
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
  async function updateTotalDuration(html) {
    const sequence = buildTransitionFromForm(html);
    const totalDuration = await sequenceDuration(sequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
  }
  async function upsertStepButton(dialog, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const sequence = [...buildTransitionFromForm(html), config];
    const durationRes = step.getDuration(config, sequence);
    const duration = durationRes instanceof Promise ? await durationRes : durationRes;
    await updateTotalDuration(html);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      calculatedDuration: duration,
      skipConfig: step.skipConfig,
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
      const oldScene = html.find("#oldScene").val() ?? "";
      const newScene = html.find("#newScene").val() ?? "";
      editStepDialog(config, game.scenes?.get(oldScene), game.scenes?.get(newScene)).then((newConfig) => {
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
        newScene: scene?.id,
        oldScene: game.scenes?.current?.id ?? "",
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
    html.find(`[data-action="import-json"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void uploadHandler2(dialog, html);
      }
    });
    html.find("[data-action='clear-steps']").on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void clearButtonhandler2(html);
      }
    });
    setClearDisabled2(html);
  }
  async function clearButtonhandler2(html) {
    const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
    if (!confirmed) return;
    html.find("#transition-step-list").children().remove();
    await updateTotalDuration2(html);
    setClearDisabled2(html);
  }
  function setClearDisabled2(html) {
    const sequence = buildTransitionFromForm(html);
    if (!sequence.length) html.find("#clear-steps").attr("disabled", "true");
    else html.find("#clear-steps").removeAttr("disabled");
  }
  async function uploadHandler2(dialog, html) {
    try {
      const current = buildTransitionFromForm(html);
      if (current.length) {
        const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
        if (!confirmation) return;
      }
      const sequence = await uploadJSON();
      html.find("#transition-step-list").children().remove();
      for (const step of sequence)
        await upsertStepButton2(dialog, html, step);
    } catch (err) {
      ui.notifications?.error(err.message, { console: false });
      console.error(err);
    }
  }
  async function addStep2(dialog, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    const oldScene = html.find("#oldScene").val() ?? "";
    const newScene = html.find("#newScene").val() ?? "";
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings, game.scenes?.get(oldScene), game.scenes?.get(newScene));
    } else {
      config = {
        ...step.DefaultSettings,
        id: foundry.utils.randomID()
      };
    }
    if (!config) return;
    await upsertStepButton2(dialog, html, config);
  }
  async function updateTotalDuration2(html) {
    const sequence = buildTransitionFromForm(html);
    const totalDuration = await sequenceDuration(sequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
  }
  async function upsertStepButton2(dialog, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const sequence = [...buildTransitionFromForm(html), config];
    const durationRes = step.getDuration(config, sequence);
    const duration = durationRes instanceof Promise ? await durationRes : durationRes;
    const totalDuration = await sequenceDuration(sequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
    const buttonContent = await renderTemplate(
      `/modules/${"battle-transitions"}/templates/config/step-item.hbs`,
      {
        ...step.DefaultSettings,
        ...config,
        name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
        description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
        type: step.key,
        calculatedDuration: duration,
        skipConfig: step.skipConfig,
        flag: JSON.stringify({
          ...step.DefaultSettings,
          ...config
        })
      }
    );
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    setClearDisabled2(html);
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
        if (confirm2) {
          button.remove();
          setClearDisabled2(html);
        }
      }).catch((err) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
    });
    button.find("[data-action='configure']").on("click", () => {
      const oldScene = html.find("#oldScene").val() ?? "";
      const newScene = html.find("#newScene").val() ?? "";
      editStepDialog(config, game.scenes?.get(oldScene), game.scenes?.get(newScene)).then((newConfig) => {
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
  async function editStepDialog(config, oldScene, newScene) {
    if (shouldUseAppV2()) return EditStepDialogV2.prompt(config, oldScene, newScene);
    else return EditStepDialogV1.prompt(config, oldScene, newScene);
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
  async function customDialog(title, content, buttons, onRender, onClose) {
    if (shouldUseAppV2()) return customDialogV2(title, content, buttons, onRender, onClose);
    else return customDialogV1(title, content, buttons, onRender, onClose);
  }
  async function customDialogV1(title, content, buttons, onRender, onClose) {
    return new Promise((resolve) => {
      let CLOSE_HOOK_ID = 0;
      const dialog = new Dialog({
        title: localize(title),
        content,
        buttons,
        render(elem) {
          if (onRender) onRender($(elem));
        },
        close(elem) {
          const jq = $(elem);
          resolve(jq);
          if (onClose) onClose(jq);
          CLOSE_HOOK_ID = Hooks.on("closeDialog", (closed) => {
            if (closed.id === dialog.id) {
              Hooks.off("closeDialog", CLOSE_HOOK_ID);
              if (onClose) onClose(jq);
            }
          });
        }
      });
      dialog.render(true);
    });
  }
  async function customDialogV2(title, content, buttons, onRender, onClose) {
    return new Promise((resolve, reject) => {
      let CLOSE_HOOK_ID = 0;
      const dialog = new foundry.applications.api.DialogV2({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window: { title: localize(title) },
        content,
        buttons: Object.entries(buttons).map(([key, value]) => ({
          action: key,
          label: `${value.icon ? `${value.icon} ` : ""}${localize(value.label)}`,
          callback: () => {
            if (value.callback) value.callback($(dialog.element));
            return Promise.resolve();
          }
        }))
      });
      dialog.render(true).then((val) => {
        if (onRender) onRender($(val.element));
        const elem = val.element;
        CLOSE_HOOK_ID = Hooks.on("closeDialogV2", (closedDialog) => {
          if (closedDialog.id === dialog.id) {
            Hooks.off("closeDialogV2", CLOSE_HOOK_ID);
            resolve($(elem));
            if (onClose) onClose($(elem));
          }
        });
      }).catch(reject);
    });
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
      easing: old.easing ?? "none",
      version: "1.1.0",
      radial: old.radial,
      duration: old.duration,
      type: "radialwipe",
      target: [0.5, 0.5],
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
      id: foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
      version: "1.1.0",
      type: "textureswap",
      bgSizingMode: "stretch",
      backgroundImage: old.texture && !isColor(old.texture) ? old.texture : "",
      backgroundColor: old.texture && !isColor(old.texture) ? "" : old.texture,
      backgroundType: old.texture && !isColor(old.texture) ? "image" : "color",
      applyToOverlay: true,
      applyToScene: false
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
      id: old.id ?? foundry.utils.randomID(),
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
      id: old.id ?? foundry.utils.randomID(),
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
              id: foundry.utils.randomID(),
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
      if (!flags) {
        return {
          autoTrigger: false,
          version: DataMigration.SceneConfiguration.NewestVersion,
          sequence: []
        };
      }
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
    // #region Public Static Methods (1)
    static async inject(app, html, options, config) {
      const navElement = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/scene-nav-bar.hbs`, {});
      const navBar = html.find("nav.sheet-tabs.tabs");
      navBar.append(navElement);
      const navContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/scene-config.hbs`, config);
      html.find(`button[type="submit"]`).before(`<div class="tab" data-tab="battle-transitions">${navContent}</div>`);
      addEventListeners7(app, html);
    }
    // #endregion Public Static Methods (1)
  };
  function addEventListeners7(app, html) {
    html.find("button[data-action='add-step']").on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void addStep3(app, html);
      }
    });
    html.find("#transition-step-list").sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });
    html.find(`button[data-action="export-json"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        const sequence = buildTransitionFromForm(html);
        downloadJSON(sequence, `${app.document.name}.json`);
      }
    });
    html.find(`button[data-action="import-json"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void uploadHandler3(app, html);
      }
    });
    html.find("button[type='submit']").on("click", () => {
      const autoTrigger = html.find("#auto-trigger").is(":checked") ?? false;
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
    html.find("[data-action='clear-steps']").on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void clearButtonhandler3(app, html);
      }
    });
    setClearDisabled3(html);
  }
  async function addStep3(app, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings, void 0, app.document);
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
      editStepDialog(config, void 0, app.document).then((newConfig) => {
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
  async function clearButtonhandler3(app, html) {
    const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
    if (!confirmed) return;
    html.find("#transition-step-list").children().remove();
    await updateTotalDuration3(html);
    setClearDisabled3(html);
    app.setPosition();
  }
  function setClearDisabled3(html) {
    const sequence = buildTransitionFromForm(html);
    if (!sequence.length) html.find("#clear-steps").attr("disabled", "true");
    else html.find("#clear-steps").removeAttr("disabled");
  }
  async function updateTotalDuration3(html) {
    const sequence = buildTransitionFromForm(html);
    const totalDuration = await sequenceDuration(sequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
  }
  async function uploadHandler3(app, html) {
    try {
      const current = buildTransitionFromForm(html);
      if (current.length) {
        const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
        if (!confirmation) return;
      }
      const sequence = await importSequence();
      if (!sequence) return;
      html.find("#transition-step-list").children().remove();
      for (const step of sequence)
        await upsertStepButton3(app, html, step);
    } catch (err) {
      ui.notifications?.error(err.message, { console: false });
      console.error(err);
    }
  }
  async function upsertStepButton3(app, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const sequence = [...buildTransitionFromForm(html), config];
    const durationRes = step.getDuration(config, sequence);
    const calculatedDuration = durationRes instanceof Promise ? await durationRes : durationRes;
    await updateTotalDuration3(html);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      calculatedDuration,
      skipConfig: step.skipConfig,
      newScene: app.document.uuid,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    app.setPosition();
    setClearDisabled3(html);
    addStepEventListeners3(app, html, button, config);
  }

  // src/dialogs/SceneConfigV12.ts
  var SceneConfigV12 = class extends SceneConfig {
    // #region Public Static Methods (1)
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
    // #endregion Public Static Methods (1)
  };
  function addEventListeners8(app, html) {
    html.find(`button[data-action="add-step"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void addStep4(app, html);
      }
    });
    html.find("#transition-step-list").sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });
    html.find(`[data-action="export-json"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        const sequence = buildTransitionFromForm(html);
        downloadJSON(sequence, `${app.document.name}.json`);
      }
    });
    html.find(`[data-action="import-json"]`).on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void uploadHandler4(app, html);
      }
    });
    html.find(".sheet-footer button[type='submit']").on("click", () => {
      const autoTrigger = html.find("#auto-trigger").is(":checked") ?? false;
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
    html.find("[data-action='clear-steps']").on("click", (e) => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void clearButtonhandler4(app, html);
      }
    });
    setClearDisabled4(html);
  }
  async function addStep4(app, html) {
    const key = await addStepDialog();
    if (!key) return;
    const step = getStepClassByKey(key);
    if (!step) throw new InvalidTransitionError(key);
    let config = null;
    if (!step.skipConfig) {
      config = await editStepDialog(step.DefaultSettings, void 0, app.document);
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
      editStepDialog(config, void 0, app.document).then((newConfig) => {
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
  async function clearButtonhandler4(app, html) {
    const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
    if (!confirmed) return;
    html.find("#transition-step-list").children().remove();
    await updateTotalDuration4(html);
    setClearDisabled4(html);
    app.setPosition();
  }
  function setClearDisabled4(html) {
    const sequence = buildTransitionFromForm(html);
    if (!sequence.length) html.find("#clear-steps").attr("disabled", "true");
    else html.find("#clear-steps").removeAttr("disabled");
  }
  async function updateTotalDuration4(html) {
    const sequence = buildTransitionFromForm(html);
    const totalDuration = await sequenceDuration(sequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
  }
  async function uploadHandler4(app, html) {
    try {
      const current = buildTransitionFromForm(html);
      if (current.length) {
        const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
        if (!confirmation) return;
      }
      const sequence = await importSequence();
      if (!sequence) return;
      html.find("#transition-step-list").children().remove();
      for (const step of sequence)
        await upsertStepButton4(app, html, step);
    } catch (err) {
      ui.notifications?.error(err.message, { console: false });
      console.error(err);
    }
  }
  async function upsertStepButton4(app, html, config) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const sequence = [...buildTransitionFromForm(html), config];
    const durationRes = step.getDuration(config, sequence);
    const calculatedDuration = durationRes instanceof Promise ? await durationRes : durationRes;
    await updateTotalDuration4(html);
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      calculatedDuration,
      skipConfig: step.skipConfig,
      newScene: app.document.uuid,
      flag: JSON.stringify({
        ...step.DefaultSettings,
        ...config
      })
    });
    const button = $(buttonContent);
    const extant = html.find(`[data-id="${config.id}"]`);
    if (extant.length) extant.replaceWith(button);
    else html.find("#transition-step-list").append(button);
    app.setPosition();
    setClearDisabled4(html);
    addStepEventListeners4(app, html, button, config);
  }

  // src/BattleTransition.ts
  var BattleTransition = class _BattleTransition {
    // #region Properties (3)
    #sequence = [];
    static Filters = filters;
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
          if (step.config.backgroundType === "overlay" || step.config.serializedTexture === "overlay") {
            step.config.deserializedTexture = container.children[0].texture;
          }
          const exec = step.execute(container, prepared.original, prepared);
          if (exec instanceof Promise) await exec;
        }
        _BattleTransition.SuppressSoundUpdates = false;
        for (const step of prepared.prepared.sequence) {
          await step.teardown(container);
        }
        removeFiltersFromScene(prepared.prepared);
      } catch (err) {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
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
            sequence: steps,
            sceneFilters: []
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
        const validated = [];
        for (const step of sequence) {
          const handler = getStepClassByKey(step.type);
          if (!handler) throw new InvalidTransitionError(step.type);
          const valid = await handler.validate(step, sequence);
          if (valid instanceof Error) return valid;
          validated.push(valid);
        }
        return validated;
      } catch (err) {
        return err;
      }
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (52)
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
        backgroundType: backgroundType(background),
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
        backgroundType: backgroundType(background),
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
        backgroundType: backgroundType(background),
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
        backgroundType: backgroundType(background),
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
        backgroundType: backgroundType(background),
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
     * Sets the transition overlay to invisible, but will still allow for playing transition effects.
     * @returns 
     */
    hideOverlay() {
      this.#sequence.push({ id: foundry.utils.randomID(), type: "removeoverlay", version: "1.1.0" });
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
        backgroundType: backgroundType(background),
        easing
      });
      return this;
    }
    loadingTip(source, location = "bottomcenter", ...others) {
      const step = getStepClassByKey("loadingtip");
      if (!step) throw new InvalidTransitionError("loadingtip");
      const duration = typeof others[0] === "number" ? others[0] : 0;
      let style = null;
      if (others[1] instanceof PIXI.HTMLTextStyle) {
        style = others[1];
      } else if (others[0] instanceof PIXI.HTMLTextStyle) {
        style = others[0];
      } else {
        style = new PIXI.HTMLTextStyle();
        deepCopy(style, PIXI.HTMLTextStyle.defaultStyle);
        deepCopy(style, step.DefaultSettings.style);
      }
      const parsed = typeof foundry.utils.parseUuid === "function" ? foundry.utils.parseUuid(source) : parseUuid(source);
      const config = {
        ...step.DefaultSettings,
        duration,
        location
      };
      if (parsed && parsed.type === RollTable.documentName) {
        const table = fromUuidSync(source);
        if (table instanceof RollTable) {
          config.source = "rolltable";
          config.table = table.uuid;
        }
      } else {
        config.source = "string";
        config.message = source;
      }
      config.style = JSON.parse(JSON.stringify(style));
      this.#sequence.push(config);
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
        backgroundType: backgroundType(background),
        easing
      });
      return this;
    }
    /*
     * Queues up a set of sequences to run in parallel
     * @param {TransitionSequenceCallback[]} callbacks - Set of {@link TransitionSequenceCallback}s to build sequences to be run in parallel.  Do NOT call `.execute` at the end of these sequences.
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
        id: foundry.utils.randomID(),
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
    radialWipe(direction, duration = 1e3, ...args) {
      const step = getStepClassByKey("radialwipe");
      if (!step) throw new InvalidTransitionError("radialwipe");
      let background = "transparent";
      let easing = "none";
      let target = [0.5, 0.5];
      if (Array.isArray(args[0])) {
        target = args[0];
        background = args[1] ?? "transparent";
        easing = args[2] ?? "none";
      } else if (typeof args[0] === "string" && fromUuidSync(args[0])) {
        target = args[0];
        background = args[1] ?? "transparent";
        easing = args[2] ?? "none";
      } else if (typeof args[0] === "string") {
        background = args[0] ?? "transparent";
        easing = args[1] ?? "none";
      }
      const serializedTexture = serializeTexture(background);
      const config = {
        ...step.DefaultSettings,
        serializedTexture,
        radial: direction,
        duration,
        easing
      };
      if (Array.isArray(target)) {
        config.target = target;
      } else if (typeof target === "string" && fromUuidSync(target)) {
        config.target = target;
      } else if (typeof target.uuid === "string") {
        config.target = target.uuid;
      } else {
        throw new InvalidTargetError(target);
      }
      this.#sequence.push(config);
      return this;
    }
    /**
     * Sets the transition overlay to invisible, but will still allow for playing transition effects.
     * @deprecated since 1.1.0 please use {@link hideOverlay} instead.
     * @see {@link hideOverlay}
     */
    removeOverlay() {
      ui.notifications?.warn("BATTLETRANSITIONS.WARNINGS.REMOVEOVERLAYDEPRECATION", { localize: true });
      return this.hideOverlay();
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
          id: foundry.utils.randomID(),
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
    /**
     * Sets the transition overlay to visible again.
     * @deprecated since version 1.1.0 please use {@link showOverlay} instead.
     * @see {@link showOverlay}
     */
    restoreOverlay() {
      ui.notifications?.warn("BATTLETRANSITIONS.WARNINGS.RESTOREOVERLAYDEPRECATION", { localize: true });
      return this.showOverlay();
    }
    /**
     * Executes the previous step, but in reverse.
     * @param {number} [delay=0] - Duration, in milliseconds, to wait before reversing the previous step.
     */
    reverse(delay = 0) {
      const step = getStepClassByKey("reverse");
      if (!step) throw new InvalidTransitionError("reverse");
      if (this.#sequence.length === 0) throw new InvalidTransitionError("reverse");
      const prevStep = getStepClassByKey(this.#sequence[this.#sequence.length - 1].type);
      if (!prevStep) throw new InvalidTransitionError("reverse");
      if (!prevStep.reversible) throw new StepNotReversibleError(prevStep.key);
      const config = {
        ...step.DefaultSettings,
        delay,
        id: foundry.utils.randomID()
      };
      log("Adding reverse:", config);
      this.#sequence.push(config);
      return this;
    }
    /**
     * Sets the transition overlay to visible again.
     */
    showOverlay() {
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
      const backgroundType2 = typeof serializedTexture === "string" && isColor(serializedTexture) ? "color" : "image";
      this.#sequence.push({
        type: "spiralwipe",
        version: "1.1.0",
        duration,
        direction,
        clockDirection: clock,
        radial,
        easing,
        bgSizingMode: "stretch",
        backgroundType: backgroundType2,
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
        backgroundType: backgroundType(background),
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
        serializedTexture,
        backgroundType: backgroundType(texture)
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
        backgroundType: backgroundType(background),
        easing
      });
      return this;
    }
    /**
     * Zoom into a location on the overlay
     * 
     * @remarks This effect does not scale the overlay but instead it multiplies the UV coordinates of the overlying texture.
     * As such, the actual values for zoom amount operates in reverse fo what you may expect.
     * 
     * A zoom value of 1 retains the original size.  Values less than one will zoom in, and greater than 1 will zoom out.
     * The maximum distance the overlay can zoom out before the displayed size is 0x0 is dependent on the screen resolution
     * of the viewer, so it is recommended to choose a value that looks "close enough" and possibly fade it out at the end
     * to make its disappearance smoother.
     * @param {number} amount - Relative amount to zoom.  See remarks.
     * @param {number} [duration=1000] - Duration, in milliseconds, that the effect should take to complete
     * @param {ZoomArg} [arg=[0.5, 0.5]] - {@link ZoomArg} representing the location to center the zoom.
     * @param {boolean} [clampBounds=false] - If true, will prevent the texture from leaving the boundaries of its containing sprite when zooming out.
     * @param {TextureLike} [bg="transparent"] - {@link TextureLike} for the background displayed when zooming out if clampBounds is false.
     * @param {Easing} [easing="none"] - {@link Easing} to use when animating the transition.
     * @returns 
     */
    zoom(amount, duration = 1e3, arg = [0.5, 0.5], clampBounds = false, bg = "transparent", easing = "none", background = "transparent") {
      const step = getStepClassByKey("zoom");
      if (!step) throw new InvalidTransitionError("zoom");
      const serializedTexture = serializeTexture(bg);
      const config = {
        ...step.DefaultSettings,
        amount,
        duration,
        clampBounds,
        serializedTexture,
        backgroundType: backgroundType(background),
        easing
      };
      if (Array.isArray(arg)) {
        config.target = arg;
      } else if (typeof arg === "string" && fromUuidSync(arg)) {
        config.target = arg;
      } else if (typeof arg.uuid === "string") {
        config.target = arg.uuid;
      } else {
        throw new InvalidTargetError(arg);
      }
      this.#sequence.push(config);
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
    // #endregion Public Methods (52)
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
      id: "",
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
    get preparedSequences() {
      return this.#preparedSequences;
    }
    // #endregion Properties (8)
    // #region Public Static Methods (6)
    static RenderTemplate(config, oldScene, newScene) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ParallelStep.template}.hbs`, {
        ..._ParallelStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        oldScene: oldScene?.id ?? "",
        newScene: newScene?.id ?? ""
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
    static async getDuration(config) {
      let highest = 0;
      for (const sequence of config.sequences) {
        const duration = await sequenceDuration(sequence);
        if (duration > highest) highest = duration;
      }
      return highest;
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
        ...parseConfigurationFormElements(elem, "id", "label"),
        sequences
      };
      return new _ParallelStep(config);
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (2)
    async execute(container, sequence, prepared) {
      await Promise.all(this.#preparedSequences.map((seq) => this.executeSequence(container, sequence, seq, prepared)));
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
    async teardown(container) {
      for (const sequence of this.#preparedSequences) {
        for (const step of sequence) {
          await step.teardown(container);
        }
      }
    }
    async executeSequence(container, sequence, steps, prepared) {
      for (const step of steps) {
        const res = step.execute(container, sequence, prepared);
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
    const oldScene = html.find("#oldScene").val() ?? "";
    const newScene = html.find("#newScene").val() ?? "";
    const config = step.skipConfig ? { ...step.DefaultSettings, id: foundry.utils.randomID() } : await editStepDialog(step.DefaultSettings, game.scenes?.get(oldScene), game.scenes?.get(newScene));
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
      const oldScene = html.find("#oldScene").val() ?? "";
      const newScene = html.find("#newScene").val() ?? "";
      editStepDialog(config, game.scenes?.get(oldScene), game.scenes?.get(newScene)).then((newConfig) => {
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
    const outerSequence = [...buildTransition(html), config];
    const durationRes = step.getDuration(config, outerSequence);
    const calculatedDuration = durationRes instanceof Promise ? await durationRes : durationRes;
    const totalDuration = await sequenceDuration(outerSequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      type: step.key,
      calculatedDuration,
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
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "pixelate",
      version: "1.1.0",
      maxSize: 100,
      duration: 1e3,
      easing: "none",
      applyToScene: false,
      applyToOverlay: true
    };
    static category = "effect";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-image"></i>`;
    static key = "pixelate";
    static name = "PIXELATE";
    static template = "pixelate-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_PixelateStep.template}.hbs`, {
        ..._PixelateStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _PixelateStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _PixelateStep.fromFormElement(arg[0]);
      else return new _PixelateStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const dualStyle = elem.find("#dualStyle").val();
      return new _PixelateStep({
        ..._PixelateStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "maxSize", "label"),
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      });
    }
    static getDuration(config) {
      return { ..._PixelateStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #sceneFilter = null;
    #filters = [];
    async reverse() {
      const config = {
        ..._PixelateStep.DefaultSettings,
        ...this.config
      };
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.#filters.map((filter) => TweenMax.to(filter.uniforms.size, { 0: 1, 1: 1, duration: config.duration / 1e3, ease: config.easing }))
      );
    }
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    async execute(container, sequence, prepared) {
      const config = {
        ..._PixelateStep.DefaultSettings,
        ...this.config
      };
      const filters2 = [];
      if (config.applyToOverlay) {
        const filter = new PIXI.filters.PixelateFilter(1);
        this.addFilter(container, filter);
        filters2.push(filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new PIXI.filters.PixelateFilter(1);
        addFilterToScene(filter, prepared.prepared);
        filters2.push(filter);
        this.#sceneFilter = filter;
      }
      this.#filters = [...filters2];
      await Promise.all(filters2.map((filter) => TweenMax.to(filter.uniforms.size, { 0: config.maxSize, 1: config.maxSize, duration: config.duration / 1e3, ease: config.easing })));
    }
    // #endregion Public Methods (1)
  };

  // src/steps/targetSelectFunctions.ts
  function clearSelectMode(html) {
    html.find("button[data-action] i.fa-spinner").css("display", "none");
    const mode = html.find("[data-select-mode]").data("select-mode") || "0";
    const hook = parseInt(html.find("[data-select-hook]").data("select-hook") || "0") || 0;
    const hint = parseInt(html.find("[data-select-hint]").data("select-hint") || "0") || 0;
    switch (mode) {
      case "oldtoken":
      case "newtoken":
        if (hook) Hooks.off("controlToken", hook);
        if (hint && ui.notifications) ui.notifications.remove(hint);
        break;
      case "oldtile":
      case "newtile":
        if (hook) Hooks.off("controlTile", hook);
        if (hint && ui.notifications) ui.notifications.remove(hint);
        break;
      case "oldnote":
      case "newnote":
        if (hook) Hooks.off("activateNote", hook);
        if (hint && ui.notifications) ui.notifications.remove(hint);
        break;
      case "olddrawing":
      case "newdrawing":
        if (hook) Hooks.off("controlDrawing", hook);
        if (hint && ui.notifications) ui.notifications.remove(hint);
        break;
    }
    html.find("[data-select-hook]").data("select-hook", "");
    html.find("[data-select-hint]").data("select-hint", "");
    html.find("[data-select-scene]").data("select-scene", "");
  }
  function getObjectSize(item) {
    if (item instanceof Token) return [item.mesh.width, item.mesh.height];
    else if (item instanceof TokenDocument && item.object instanceof Token) return [item.object.mesh.width, item.object.mesh.height];
    else if (item instanceof Tile) return [item.document.width, item.document.height];
    else if (item instanceof TileDocument) return [item.width, item.height];
    else if (item instanceof Note || item instanceof NoteDocument) return [0, 0];
    else if (item instanceof Drawing) return [item.width, item.height];
    else if (item instanceof DrawingDocument) return [item.object?.width ?? 0, item.object?.height ?? 0];
    else throw new InvalidTargetError(item);
  }
  function getTargetFromForm(html) {
    const targetType = html.find("#targetType").val() ?? "point";
    switch (targetType) {
      case "oldtoken":
        return html.find("#selectedOldToken").val();
      case "newtoken":
        return html.find("#selectedNewToken").val();
      case "oldtile":
        return html.find("#selectedOldTile").val();
      case "newtile":
        return html.find("#selectedNewTile").val();
      case "olddrawing":
        return html.find("#selectedOldDrawing").val();
      case "newdrawing":
        return html.find("#selectedNewDrawing").val();
      case "oldnote":
        return html.find("#selectedOldNote").val();
      case "newnote":
        return html.find("#selectedNewNote").val();
      case "prompt":
        return "";
      case "point":
        return [
          parseFloat(html.find("#pointX").val()),
          parseFloat(html.find("#pointY").val())
        ];
    }
  }
  function getTargetType(html) {
    return html.find("#targetType").val() ?? "point";
  }
  function isNormalized(val) {
    return val[0] >= 0 && val[0] <= 1 && val[1] >= 0 && val[1] <= 1;
  }
  function isNumberNumber(val) {
    return Array.isArray(val) && val.length === 2 && typeof val[0] === "number" && typeof val[1] === "number";
  }
  function normalizePoint(x, y) {
    return [
      x / window.innerWidth,
      y / window.innerHeight
    ];
  }
  function normalizePosition(target) {
    if (target instanceof Token || target instanceof Tile || target instanceof Note) {
      const { x, y } = target.getGlobalPosition();
      const [width, height] = getObjectSize(target);
      return normalizePoint(x + width / 2, y + height / 2);
    } else if (target instanceof TokenDocument || target instanceof TileDocument || target instanceof NoteDocument) {
      if (!target.object) throw new InvalidTargetError(target);
      return normalizePosition(target.object);
    } else if (target instanceof Drawing) {
      const { x, y } = target.getGlobalPosition();
      const [width, height] = getObjectSize(target);
      return normalizePoint(
        x + width / 2,
        y + height / 2
      );
    } else if (target instanceof DrawingDocument) {
      if (!target.object) throw new InvalidTargetError(target);
      return normalizePosition(target.object);
    } else if (target instanceof Actor) {
      if (!target.token) throw new InvalidTargetError(target);
      return normalizePosition(target.token);
    }
    throw new InvalidTargetError(target);
  }
  function onTargetSelectDialogClosed(html) {
    clearSelectMode(html);
  }
  function selectNewDrawing(html) {
    clearSelectMode(html);
    html.find("[data-action='select-new-drawing'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "newdrawing");
    const hook = Hooks.on("controlDrawing", (drawing, controlled) => {
      if (controlled) {
        clearSelectMode(html);
        html.find("#selectedNewDrawing").val(drawing.document.uuid);
      }
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.SELECTHINT");
  }
  function selectNewNote(html) {
    clearSelectMode(html);
    html.find("[data-action='select-new-note']").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "newnote");
    const hook = Hooks.on("activateNote", (note) => {
      clearSelectMode(html);
      html.find("#selectedNewNote").val(note.document.uuid);
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.SElECTHINT");
  }
  function selectNewTile(html) {
    clearSelectMode(html);
    html.find("[data-action='select-new-tile'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "newtile");
    const hook = Hooks.on("controlTile", (tile, controlled) => {
      if (controlled) {
        clearSelectMode(html);
        html.find("#selectedNewTile").val(tile.document.uuid);
      }
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.SELECTHINT");
  }
  function selectNewToken(html) {
    clearSelectMode(html);
    html.find("[data-action='select-new-token'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "newtoken");
    const hook = Hooks.on("controlToken", (token, controlled) => {
      if (controlled) {
        clearSelectMode(html);
        html.find("#selectedNewToken").val(token.document.uuid);
      }
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.SELECTHINT");
  }
  function selectOldDrawing(html) {
    clearSelectMode(html);
    html.find("[data-action='select-old-drawing'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "olddrawing");
    const hook = Hooks.on("controlDrawing", (drawing, controlled) => {
      if (controlled) {
        clearSelectMode(html);
        html.find("#selectedOldDrawing").val(drawing.document.uuid);
      }
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.SELECTHINT");
  }
  function selectOldNote(html) {
    clearSelectMode(html);
    html.find("[data-action='select-old-note'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "oldnote");
    const hook = Hooks.on("activateNote", (note) => {
      clearSelectMode(html);
      html.find("#selectedOldNote").val(note.document.uuid);
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.SELECTHINT");
  }
  function selectOldTile(html) {
    clearSelectMode(html);
    html.find("[data-action='select-old-tile'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "oldtile");
    const hook = Hooks.on("controlTile", (tile, controlled) => {
      if (controlled) {
        clearSelectMode(html);
        html.find("#selectedOldTile").val(tile.document.uuid);
      }
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.SELECTHINT");
  }
  function selectOldToken(html) {
    clearSelectMode(html);
    html.find("[data-action='select-old-token'] i").css("display", "block");
    html.find("[data-select-mode]").data("select-mode", "oldtoken");
    const hook = Hooks.on("controlToken", (token, controlled) => {
      if (controlled) {
        clearSelectMode(html);
        html.find("#selectedOldToken").val(token.document.uuid);
      }
    });
    html.find("[data-select-hook]").data("select-hook", hook);
    setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.SELECTHINT");
  }
  function setSelectHint(html, hint) {
    if (ui.notifications) {
      const id = ui.notifications.info(hint, { console: false, localize: true, permanent: true });
      html.find("[data-select-hint]").data("select-hint", id);
    }
  }
  function setTargetSelectEventListeners(html) {
    swapTargetSection(html);
    html.find("#targetType").on("input", () => {
      swapTargetSection(html);
    });
    html.find("button[data-action] i.fa-spinner").css("display", "none");
    html.find("button[data-action] i.fa-spinner").parent().on("click", (e) => {
      e.preventDefault();
      const target = $(e.currentTarget);
      const action = target.data("action") || "";
      switch (action) {
        case "select-old-token":
          selectOldToken(html);
          break;
        case "select-new-token":
          selectNewToken(html);
          break;
        case "select-old-tile":
          selectOldTile(html);
          break;
        case "select-new-tile":
          selectNewTile(html);
          break;
        case "select-old-note":
          selectOldNote(html);
          break;
        case "select-new-note":
          selectNewNote(html);
          break;
        case "select-old-drawing":
          selectOldDrawing(html);
          break;
        case "select-new-drawing":
          selectNewDrawing(html);
          break;
      }
    });
  }
  var requiredFields = {
    "prompt": "",
    "point": "#pointX, #pointY",
    "oldtoken": "#selectedOldToken",
    "newtoken": "#selectedNewToken",
    "oldtile": "#selectedOldTile",
    "newtile": "#selectedNewTile",
    "olddrawing": "#selectedOldDrawing",
    "newdrawing": "#selectedNewDrawing",
    "oldnote": "#selectedOldNote",
    "newnote": "#selectedNewNote"
  };
  function swapTargetSection(html) {
    html.find(`section[data-target-type]`).css("display", "none");
    html.find("section[data-target-type] input, section[data-target-type] select").removeAttr("required");
    const targetType = getTargetType(html);
    html.find(`section[data-target-type="${targetType}"]`).css("display", "block");
    if (requiredFields[targetType]) {
      html.find(requiredFields[targetType]).attr("required", "true");
    }
  }
  async function validateTarget(config, oldScene, newScene) {
    const { target } = config;
    if (isNumberNumber(target) && isNormalized(target)) return target;
    if (typeof target === "string" && target) {
      const item = await fromUuid(target);
      if (!item) throw new InvalidTargetError(target);
      const parsed = foundry.utils.parseUuid(target);
      if (parsed.primaryType !== "Scene") throw new InvalidTargetError(target);
      if (oldScene && oldScene.id === parsed.primaryId) return target;
      if (newScene && newScene.id === parsed.primaryId) return target;
    } else if (typeof target === "string") {
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/target-selector.hbs`, {
        ...generateTargetTypeSelectOptions(oldScene, newScene),
        pointX: 0.5,
        pointY: 0.5
      });
      const form = await customDialog(
        "BATTLETRANSITIONS.SCENECONFIG.TARGETTYPE.DIALOG.TITLE",
        content,
        {
          ok: {
            icon: `<i class="fas fa-check"></i>`,
            label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"
          },
          cancel: {
            icon: `<i class="fas fa-times"></i>`,
            label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL",
            callback: () => {
              throw new InvalidTargetError(void 0);
            }
          }
        },
        (html) => {
          setTargetSelectEventListeners(html);
        }
      );
      return getTargetFromForm(form);
    }
    throw new InvalidTargetError(target);
  }

  // src/steps/RadialWipeStep.ts
  var RadialWipeStep = class _RadialWipeStep extends TransitionStep {
    // #region Properties (10)
    #filter = null;
    #screenLocation = [0.5, 0.5];
    static DefaultSettings = {
      id: "",
      type: "radialwipe",
      easing: "none",
      radial: "inside",
      duration: 1e3,
      bgSizingMode: "stretch",
      version: "1.1.0",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000",
      target: [0.5, 0.5]
    };
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon radial-wipe fa-fw fas'></i>";
    static key = "radialwipe";
    static name = "RADIALWIPE";
    static reversible = true;
    static template = "radialwipe-config";
    // #endregion Properties (10)
    // #region Public Static Methods (10)
    static RenderTemplate(config, oldScene, newScene) {
      const targetType = getTargetType2({
        ..._RadialWipeStep.DefaultSettings,
        ...config ? config : {}
      }, oldScene, newScene);
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_RadialWipeStep.template}.hbs`, {
        ..._RadialWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        radialSelect: generateRadialDirectionSelectOptions(),
        targetType,
        oldScene: oldScene?.id ?? "",
        newScene: newScene?.id ?? "",
        selectedTarget: config ? config.target : "",
        ...generateTargetTypeSelectOptions(oldScene, newScene),
        pointX: Array.isArray(config?.target) ? config.target[0] : 0.5,
        pointY: Array.isArray(config?.target) ? config.target[1] : 0.5
      });
    }
    // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
    static async addEventListeners(html, config) {
      setTargetSelectEventListeners(html);
    }
    static editDialogClosed(element) {
      onTargetSelectDialogClosed($(element));
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _RadialWipeStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _RadialWipeStep.fromFormElement(arg[0]);
      else return new _RadialWipeStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const serializedTexture = elem.find("#backgroundImage").val() ?? "";
      const target = getTargetFromForm(elem);
      return new _RadialWipeStep({
        ..._RadialWipeStep.DefaultSettings,
        serializedTexture,
        target,
        ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing", "label")
      });
    }
    static getDuration(config) {
      return { ..._RadialWipeStep.DefaultSettings, ...config }.duration;
    }
    static async validate(config, sequence) {
      try {
        const newSceneId = sequence.reduce((prev, curr) => curr.type === "scenechange" ? curr.scene : prev, null);
        if (!newSceneId) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);
        const newScene = game.scenes?.get(newSceneId);
        if (!newScene) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);
        const target = await validateTarget(
          {
            ..._RadialWipeStep.DefaultSettings,
            ...config
          },
          canvas?.scene,
          newScene
        );
        return {
          ..._RadialWipeStep.DefaultSettings,
          ...config,
          target
        };
      } catch (err) {
        return err;
      }
    }
    // #endregion Public Static Methods (10)
    // #region Public Methods (3)
    async execute(container) {
      const config = {
        ..._RadialWipeStep.DefaultSettings,
        ...this.config
      };
      if (!Array.isArray(config.target)) {
        const obj = await fromUuid(config.target);
        if (!obj) throw new InvalidTargetError(config.target);
        const parsed = foundry.utils.parseUuid(config.target);
        if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
        if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
      }
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new RadialWipeFilter(config.radial, this.#screenLocation[0], this.#screenLocation[1], background.baseTexture);
      this.addFilter(container, filter);
      this.#filter = filter;
      await this.simpleTween(filter);
    }
    async prepare() {
      const config = {
        ..._RadialWipeStep.DefaultSettings,
        ...this.config
      };
      if (Array.isArray(config.target)) {
        this.#screenLocation = config.target;
      } else {
        const obj = await fromUuid(config.target);
        if (!obj) throw new InvalidTargetError(config.target);
        const parsed = foundry.utils.parseUuid(config.target);
        if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
        if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
      }
    }
    async reverse() {
      if (this.#filter instanceof RadialWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #endregion Public Methods (3)
  };

  // src/steps/RemoveOverlayStep.ts
  var RemoveOverlayStep = class _RemoveOverlayStep extends TransitionStep {
    // #region Properties (6)
    static DefaultSettings = {
      id: "",
      type: "removeoverlay",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "removeoverlay";
    static name = "HIDEOVERLAY";
    static skipConfig = true;
    static template = "";
    static icon = "<i class='bt-icon hide-overlay fa-fw fas'></i>";
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
        id: foundry.utils.randomID(),
        ...parseConfigurationFormElements($(form), "id")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    execute(container, sequence, prepared) {
      prepared.overlay.forEach((child) => child.alpha = 0);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/WaitStep.ts
  var CURRENT_VERSION2 = "1.1.0";
  var WaitStep = class _WaitStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "wait",
      duration: 0,
      version: CURRENT_VERSION2
    };
    static category = "technical";
    static hidden = false;
    static icon = "<i class='bt-icon wait fa-fw fas'></i>";
    static key = "wait";
    static name = "WAIT";
    static template = "wait-config";
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_WaitStep.template}.hbs`, {
        ..._WaitStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
        ...parseConfigurationFormElements(elem, "id", "duration", "label")
      });
    }
    static getDuration(config) {
      return { ..._WaitStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
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
    get preparedSequence() {
      return this.#preparedSequence;
    }
    async teardown(container) {
      for (const step of this.#preparedSequence) {
        await step.teardown(container);
      }
    }
    // #endregion Properties (8)
    // #region Public Static Methods (7)
    static RenderTemplate(config, oldScene, newScene) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_RepeatStep.template}.hbs`, {
        ..._RepeatStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        oldScene: oldScene?.id ?? "",
        newScene: newScene?.id ?? "",
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
      html.find("[data-action='clear-steps']").on("click", (e) => {
        if ($(e.currentTarget).is(":visible")) {
          e.preventDefault();
          void clearButtonhandler5(html);
        }
      });
      setClearDisabled5(html);
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
        ...parseConfigurationFormElements(elem, "id", "iterations", "style", "delay", "label"),
        id: foundry.utils.randomID(),
        sequence
      });
    }
    // #endregion Public Static Methods (7)
    static async getDuration(config, sequence) {
      if (config.style === "previous") {
        const index = sequence.findIndex((item) => item.id === config.id);
        if (index === -1) throw new InvalidTransitionError(_RepeatStep.key);
        else if (index === 0) throw new NoPreviousStepError();
        const prev = sequence[index - 1];
        const step = getStepClassByKey(prev.type);
        if (!step) throw new InvalidTransitionError(typeof prev.type === "string" ? prev.type : typeof prev.type);
        const res = step.getDuration(prev, sequence);
        const duration = res instanceof Promise ? await res : res;
        return (duration + config.delay) * (config.iterations - 1) + config.delay;
      } else {
        const duration = await sequenceDuration(config.sequence ?? []);
        return duration + config.delay * config.iterations;
      }
    }
    // #region Public Methods (2)
    async execute(container, sequence, prepared) {
      for (const step of this.#preparedSequence) {
        const res = step.execute(container, sequence, prepared);
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
    const oldScene = html.find("#oldScene").val() ?? "";
    const newScene = html.find("#newScene").val() ?? "";
    const config = step.skipConfig ? { ...step.DefaultSettings, id: foundry.utils.randomID() } : await editStepDialog(step.DefaultSettings, game.scenes?.get(oldScene), game.scenes?.get(newScene));
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
    const outerSequence = [...buildTransitionFromForm(html), config];
    const durationRes = step.getDuration(config, outerSequence);
    const calculatedDuration = durationRes instanceof Promise ? await durationRes : durationRes;
    const totalDuration = await sequenceDuration(outerSequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
    const buttonContent = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
      ...step.DefaultSettings,
      ...config,
      name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
      description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
      calculatedDuration,
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
    setClearDisabled5(html);
  }
  async function clearButtonhandler5(html) {
    const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
    if (!confirmed) return;
    html.find("#transition-step-list").children().remove();
    await updateTotalDuration5(html);
    setClearDisabled5(html);
  }
  function setClearDisabled5(html) {
    const sequence = buildTransitionFromForm(html);
    if (!sequence.length) html.find("#clear-steps").attr("disabled", "true");
    else html.find("#clear-steps").removeAttr("disabled");
  }
  async function updateTotalDuration5(html) {
    const sequence = buildTransitionFromForm(html);
    const totalDuration = await sequenceDuration(sequence);
    html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
  }

  // src/steps/RestoreOverlayStep.ts
  var RestoreOverlayStep = class _RestoreOverlayStep extends TransitionStep {
    // #region Properties (6)
    static template = "";
    static DefaultSettings = {
      id: "",
      type: "restoreoverlay",
      version: "1.1.0"
    };
    static hidden = false;
    static key = "restoreoverlay";
    static name = "SHOWOVERLAY";
    static skipConfig = true;
    static icon = "<i class='bt-icon show-overlay fa-fw fas'></i>";
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
        id: foundry.utils.randomID(),
        ...parseConfigurationFormElements($(form), "id")
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    execute(container, sequence, prepared) {
      prepared.overlay.forEach((child) => child.alpha = 1);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/functions.ts
  function getPreviousStep(id, sequence) {
    if (sequence[0] instanceof TransitionStep) return getPreviousStepByStep(id, sequence);
    else return getPreviousStepByConfig(id, sequence);
  }
  function getPreviousStepByConfig(id, sequence) {
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      if (step.id === id && i > 0) return sequence[i - 1];
      else if (step.id === id && i === 0) return void 0;
      if (step.type === "parallel") {
        const parallel = step;
        for (const sub of parallel.sequences) {
          const prev = getPreviousStepByConfig(id, sub);
          if (prev) return prev;
        }
      } else if (step.type === "repeat") {
        const repeat = step;
        if (repeat.sequence && Array.isArray(repeat.sequence)) {
          const prev = getPreviousStepByConfig(id, repeat.sequence);
          if (prev) return prev;
        }
      }
    }
    return void 0;
  }
  function getPreviousStepByStep(id, sequence) {
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      if (step.config.id === id && i > 0) return sequence[i - 1];
      else if (step.config.id === id && i === 0) return void 0;
      if (step instanceof ParallelStep) {
        for (const sequence2 of step.preparedSequences) {
          const prev = getPreviousStepByStep(id, sequence2);
          if (prev) return prev;
        }
      } else if (step instanceof RepeatStep) {
        const prev = getPreviousStepByStep(id, step.preparedSequence);
        if (prev) return prev;
      }
    }
    return void 0;
  }

  // src/steps/ReverseStep.ts
  var ReverseStep = class _ReverseStep extends TransitionStep {
    static DefaultSettings = {
      id: "",
      type: "reverse",
      version: "1.1.0",
      delay: 0
    };
    static category = "technical";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-backward"></i>`;
    static key = "reverse";
    static name = "REVERSE";
    static template = "reverse-config";
    static skipConfig = false;
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _ReverseStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _ReverseStep.fromFormElement(arg[0]);
      else return new _ReverseStep(arg);
    }
    static fromFormElement(form) {
      return new _ReverseStep({
        ..._ReverseStep.DefaultSettings,
        ...parseConfigurationFormElements($(form), "id", "delay")
      });
    }
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ReverseStep.template}.hbs`, {
        ..._ReverseStep.DefaultSettings,
        ...config ? config : {}
      });
    }
    static validate(config, sequence) {
      const prev = getPreviousStep(config.id, sequence);
      if (!prev) throw new InvalidTransitionError("reverse");
      const step = getStepClassByKey(prev.type);
      if (!step) throw new InvalidTransitionError(typeof prev.type === "string" ? prev.type : typeof prev.type);
      if (!step.reversible) throw new StepNotReversibleError(step.key);
      return config;
    }
    execute(container, sequence, prepared) {
      const config = {
        ..._ReverseStep.DefaultSettings,
        ...this.config
      };
      const prev = getPreviousStep(config.id, prepared.prepared.sequence);
      if (!prev) throw new InvalidTransitionError("reverse");
      if (config.delay) return wait(config.delay).then(() => prev.reverse());
      else return prev.reverse();
    }
  };

  // src/steps/SceneChangeStep.ts
  var SceneChangeStep = class _SceneChangeStep extends TransitionStep {
    // #region Properties (5)
    static DefaultSettings = {
      id: "",
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
        ..._SceneChangeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
    // #region Properties (8)
    #sound = null;
    static DefaultSettings = {
      id: "",
      type: "sound",
      volume: 100,
      file: "",
      version: "1.1.0"
    };
    static category = "technical";
    static hidden = false;
    static icon = "<i class='bt-icon sound fa-fw fas'></i>";
    static key = "sound";
    static name = "SOUND";
    static template = "sound-config";
    // #endregion Properties (8)
    // #region Public Static Methods (8)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SoundStep.template}.hbs`, {
        ..._SoundStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {}
      });
    }
    static addEventListeners(element) {
      const html = $(element);
      html.find("#file input").attr("required", "true");
      html.find("form input").trigger("input");
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
        ...parseConfigurationFormElements(elem, "id", "label")
      });
    }
    //public static getDuration(config: PixelateConfiguration): number { return { ...PixelateStep.DefaultSettings, ...config }.duration }
    static getDuration(config) {
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration * 1e3));
        };
        audio.onerror = (e, src, line, col, err) => {
          if (err) reject(err);
          else reject(new Error(e.toString()));
        };
        audio.src = config.file;
      });
    }
    // #endregion Public Static Methods (8)
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
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon spiral-shutter fa-fw fas'></i>";
    static key = "spiralshutter";
    static name = "SPIRALSHUTTER";
    static template = "spiralshutter-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SpiralShutterStep.template}.hbs`, {
        ..._SpiralShutterStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
        ...parseConfigurationFormElements(elem, "id", "duration", "easing", "backgroundType", "backgroundColor", "direction", "radial", "label")
      });
    }
    static getDuration(config) {
      return { ..._SpiralShutterStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #filter = null;
    async reverse() {
      if (this.#filter instanceof SpiralShutterFilter) await this.simpleReverse(this.#filter);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._SpiralShutterStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new SpiralShutterFilter(config.direction, config.radial, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/SpiralWipeStep.ts
  var SpiralWipeStep = class _SpiralWipeStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-arrows-spin"></i>`;
    static key = "spiralwipe";
    static name = "SPIRALWIPE";
    static template = "spiralwipe-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SpiralWipeStep.template}.hbs`, {
        ..._SpiralWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
        ...parseConfigurationFormElements(elem, "id", "duration", "backgroundType", "backgroundColor", "radial", "direction", "clockDirection", "easing", "label")
      });
    }
    static getDuration(config) {
      return { ..._SpiralWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    #filter = null;
    async reverse() {
      if (this.#filter instanceof SpiralWipeFilter) await this.simpleReverse(this.#filter);
    }
    // #region Public Methods (1)
    async execute(container) {
      const config = {
        ..._SpiralWipeStep.DefaultSettings,
        ...this.config
      };
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new SpiralWipeFilter(config.clockDirection, config.radial, config.direction, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/SpotlightWipeStep.ts
  var SpotlightWipeStep = class _SpotlightWipeStep extends TransitionStep {
    // #region Properties (8)
    defaultSettings = {
      duration: 1e3,
      easing: "none"
    };
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon spotlight-wipe fa-fw fas'></i>";
    static key = "spotlightwipe";
    static name = "SPOTLIGHTWIPE";
    static template = "spotlightwipe-config";
    static reversible = true;
    // #endregion Properties (8)
    // #region Public Static Methods (7)
    static RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_SpotlightWipeStep.template}.hbs`, {
        ..._SpotlightWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        directionSelect: generateLinearDirectionSelectOptions(),
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
        ...parseConfigurationFormElements(elem, "id", "duration", "direction", "radial", "backgroundType", "backgroundColor", "easing", "label")
      });
    }
    static getDuration(config) {
      return { ..._SpotlightWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #filter = null;
    async reverse() {
      if (this.#filter instanceof SpotlightWipeFilter) await this.simpleReverse(this.#filter);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._SpotlightWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new SpotlightWipeFilter(config.direction, config.radial, background.baseTexture);
      this.#filter = filter;
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
      id: "",
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
        id: foundry.utils.randomID(),
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
      id: "",
      type: "textureswap",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000",
      applyToScene: false,
      applyToOverlay: true
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
        ..._TextureSwapStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
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
      const dualStyle = elem.find("#dualStyle").val();
      return new _TextureSwapStep({
        ..._TextureSwapStep.DefaultSettings,
        serializedTexture,
        ...parseConfigurationFormElements(elem, "id", "backgroundType", "backgroundColor", "label"),
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      });
    }
    // #endregion Public Static Methods (6)
    // #region Public Methods (1)
    #sceneFilter = null;
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    execute(container, sequence, prepared) {
      const config = {
        ..._TextureSwapStep.DefaultSettings,
        ...this.config
      };
      if (config.applyToOverlay) {
        const background = config.deserializedTexture ?? createColorTexture("transparent");
        const filter = new TextureSwapFilter(background.baseTexture);
        this.addFilter(container, filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const background = config.deserializedTexture ?? createColorTexture("transparent");
        const filter = new TextureSwapFilter(background.baseTexture);
        addFilterToScene(filter, prepared.prepared);
        this.#sceneFilter = filter;
      }
    }
    // #endregion Public Methods (1)
  };

  // src/steps/TwistStep.ts
  var TwistStep = class _TwistStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "twist",
      version: "1.1.0",
      duration: 1e3,
      maxAngle: 10,
      easing: "none",
      direction: "clockwise",
      applyToScene: false,
      applyToOverlay: true
    };
    static category = "warp";
    static hidden = false;
    static icon = "<i class='bt-icon twist fa-fw fas'></i>";
    static key = "twist";
    static name = "TWIST";
    static template = "twist-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_TwistStep.template}.hbs`, {
        ..._TwistStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        directionSelect: generateClockDirectionSelectOptions(),
        easingSelect: generateEasingSelectOptions(),
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _TwistStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _TwistStep.fromFormElement(arg[0]);
      else return new _TwistStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const dualStyle = elem.find("#dualStyle").val();
      return new _TwistStep({
        ..._TwistStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "direction", "easing", "label"),
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      });
    }
    static getDuration(config) {
      return { ..._TwistStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #sceneFilter = null;
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    #filters = [];
    async reverse() {
      const config = {
        ..._TwistStep.DefaultSettings,
        ...this.config
      };
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        this.#filters.map((filter) => TweenMax.to(filter.uniforms, { angle: 0, duration: config.duration / 1e3, ease: config.easing }))
      );
    }
    // #filter: RadialWipeFilter | null = null;
    // public async reverse(): Promise<void> {
    //   if (this.#filter instanceof RadialWipeFilter) await this.simpleReverse(this.#filter);
    // }
    async execute(container, sequence, prepared) {
      const config = {
        ..._TwistStep.DefaultSettings,
        ...this.config
      };
      const filters2 = [];
      if (config.applyToOverlay) {
        const filter = new PIXI.filters.TwistFilter({
          radius: window.innerWidth,
          angle: 0,
          offset: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        });
        this.addFilter(container, filter);
        filters2.push(filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new PIXI.filters.TwistFilter({
          radius: window.innerWidth,
          angle: 0,
          offset: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        });
        addFilterToScene(filter, prepared.prepared);
        filters2.push(filter);
      }
      this.#filters = [...filters2];
      await Promise.all(filters2.map((filter) => TweenMax.to(filter.uniforms, { angle: this.config.direction === "clockwise" ? config.maxAngle * -1 : this.config.maxAngle, duration: config.duration / 1e3, ease: this.config.easing || "none" })));
    }
    // #endregion Public Methods (1)
  };

  // src/steps/VideoStep.ts
  var VideoStep = class _VideoStep extends TransitionStep {
    // #region Properties (7)
    #preloadedVideo = null;
    #videoContainer = null;
    static DefaultSettings = {
      id: "",
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
        ..._VideoStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {}
      });
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _VideoStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _VideoStep.fromFormElement(arg[0]);
      else return new _VideoStep(arg);
    }
    static addEventListeners(element) {
      const html = $(element);
      html.find("#file input").attr("required", "true");
      html.find("form input").trigger("input");
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
        ...parseConfigurationFormElements($(form), "id", "background", "backgroundType", "backgroundColor", "label")
      });
    }
    // #endregion Public Static Methods (6)
    static getDuration(config) {
      return new Promise((resolve, reject) => {
        const vid = document.createElement("video");
        vid.onloadedmetadata = () => {
          resolve(Math.round(vid.duration * 1e3));
        };
        vid.onerror = (e, src, line, col, err) => {
          if (err) reject(err);
          else reject(new Error(e.toString()));
        };
        vid.src = config.file;
      });
    }
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
        container.addChild(videoContainer);
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
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
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
    static category = "wipe";
    static hidden = false;
    static icon = "<i class='bt-icon wave-wipe fa-fw fas'></i>";
    static key = "wavewipe";
    static name = "WAVEWIPE";
    static template = "wavewipe-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_WaveWipeStep.template}.hbs`, {
        ..._WaveWipeStep.DefaultSettings,
        id: foundry.utils.randomID(),
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
        ...parseConfigurationFormElements(elem, "id", "label", "duration", "backgroundType", "backgroundColor", "easing", "direction")
      });
    }
    static getDuration(config) {
      return { ..._WaveWipeStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #filter = null;
    async reverse() {
      if (this.#filter instanceof WaveWipeFilter) await this.simpleReverse(this.#filter);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(container, sequence) {
      const config = {
        ..._WaveWipeStep.DefaultSettings,
        ...this.config
      };
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new WaveWipeFilter(config.direction, background.baseTexture);
      this.#filter = filter;
      this.addFilter(container, filter);
      await this.simpleTween(filter);
    }
    // #endregion Public Methods (1)
  };

  // src/steps/ZoomBlurStep.ts
  var ZoomBlurStep = class _ZoomBlurStep extends TransitionStep {
    // #region Properties (7)
    static DefaultSettings = {
      id: "",
      type: "zoomblur",
      version: "1.1.0",
      duration: 1e3,
      maxStrength: 0.5,
      easing: "none",
      innerRadius: 0,
      applyToOverlay: true,
      applyToScene: false
    };
    static category = "warp";
    static hidden = false;
    static icon = "<i class='bt-icon zoomblur fa-fw fas'></i>";
    static key = "zoomblur";
    static name = "ZOOMBLUR";
    static template = "zoomblur-config";
    static reversible = true;
    // #endregion Properties (7)
    // #region Public Static Methods (7)
    static async RenderTemplate(config) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ZoomBlurStep.template}.hbs`, {
        ..._ZoomBlurStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        easingSelect: generateEasingSelectOptions(),
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
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
      const dualStyle = elem.find("#dualStyle").val();
      return new _ZoomBlurStep({
        ..._ZoomBlurStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "duration", "label"),
        maxStrength,
        innerRadius,
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      });
    }
    static getDuration(config) {
      return { ..._ZoomBlurStep.DefaultSettings, ...config }.duration;
    }
    // #endregion Public Static Methods (7)
    // #region Public Methods (1)
    #sceneFilter = null;
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    #filters = [];
    async reverse() {
      const config = {
        ..._ZoomBlurStep.DefaultSettings,
        ...this.config
      };
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        this.#filters.map((filter) => TweenMax.to(filter.uniforms, { uStrength: 0, duration: config.duration / 1e3, ease: config.easing }))
      );
    }
    async execute(container, sequence, prepared) {
      const config = {
        ..._ZoomBlurStep.DefaultSettings,
        ...this.config
      };
      const filters2 = [];
      if (config.applyToOverlay) {
        const filter = new PIXI.filters.ZoomBlurFilter({
          strength: 0,
          innerRadius: config.innerRadius * window.innerWidth,
          radius: -1,
          center: [window.innerWidth / 2, window.innerHeight / 2]
        });
        this.addFilter(container, filter);
        filters2.push(filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new PIXI.filters.ZoomBlurFilter({
          strength: 0,
          innerRadius: config.innerRadius * window.innerWidth,
          radius: -1,
          center: [window.innerWidth / 2, window.innerHeight / 2]
        });
        this.#sceneFilter = filter;
        addFilterToScene(filter, prepared.prepared);
        filters2.push(filter);
      }
      this.#filters = [...filters2];
      await Promise.all(filters2.map((filter) => TweenMax.to(filter.uniforms, { uStrength: config.maxStrength, duration: config.duration / 1e3, ease: config.easing || "none" })));
    }
    // #endregion Public Methods (1)
  };

  // src/steps/ZoomStep.ts
  var ZoomStep = class _ZoomStep extends TransitionStep {
    // #region Properties (11)
    #filters = [];
    #sceneFilter = null;
    #screenLocation = [0.5, 0.5];
    static DefaultSettings = {
      id: "",
      type: "zoom",
      duration: 1e3,
      backgroundType: "color",
      bgSizingMode: "stretch",
      backgroundColor: "#00000000",
      version: "1.1.0",
      easing: "none",
      amount: 0,
      clampBounds: false,
      target: [0.5, 0.5],
      applyToOverlay: true,
      applyToScene: false
    };
    static category = "warp";
    static hidden = false;
    static icon = `<i class="fas fa-fw fa-magnifying-glass"></i>`;
    static key = "zoom";
    static name = "ZOOM";
    static reversible = true;
    static template = "zoom-config";
    // #endregion Properties (11)
    // #region Public Static Methods (10)
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async RenderTemplate(config, oldScene, newScene) {
      const targetType = getTargetType2({
        ..._ZoomStep.DefaultSettings,
        ...config ? config : {}
      }, oldScene, newScene);
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/${_ZoomStep.template}.hbs`, {
        ..._ZoomStep.DefaultSettings,
        id: foundry.utils.randomID(),
        ...config ? config : {},
        oldScene: oldScene?.id ?? "",
        newScene: newScene?.id ?? "",
        easingSelect: generateEasingSelectOptions(),
        targetType,
        ...generateTargetTypeSelectOptions(oldScene, newScene),
        pointX: Array.isArray(config?.target) ? config.target[0] : 0.5,
        pointY: Array.isArray(config?.target) ? config.target[1] : 0.5,
        dualStyleSelect: generateDualStyleSelectOptions(),
        dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
      });
    }
    // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
    static async addEventListeners(html, config) {
      setTargetSelectEventListeners(html);
      setBackgroundSelector(html);
      html.find("#clampBounds").on("change", () => {
        setBackgroundSelector(html);
      });
    }
    //public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void { }
    static editDialogClosed(element) {
      onTargetSelectDialogClosed($(element));
    }
    static from(arg) {
      if (arg instanceof HTMLFormElement) return _ZoomStep.fromFormElement(arg);
      else if (arg[0] instanceof HTMLFormElement) return _ZoomStep.fromFormElement(arg[0]);
      else return new _ZoomStep(arg);
    }
    static fromFormElement(form) {
      const elem = $(form);
      const serializedTexture = elem.find("#backgroundImage").val() ?? "";
      const dualStyle = elem.find("#dualStyle").val();
      const target = getTargetFromForm(elem);
      const config = {
        ..._ZoomStep.DefaultSettings,
        ...parseConfigurationFormElements(elem, "id", "label", "duration", "easing", "amount", "backgroundType", "backgroundColor", "clampBounds"),
        serializedTexture,
        target,
        applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
        applyToScene: dualStyle === "scene" || dualStyle === "both"
      };
      return new _ZoomStep(config);
    }
    static getDuration(config) {
      return { ..._ZoomStep.DefaultSettings, ...config }.duration;
    }
    static async validate(config, sequence) {
      try {
        const newSceneId = sequence.reduce((prev, curr) => curr.type === "scenechange" ? curr.scene : prev, null);
        if (!newSceneId) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);
        const newScene = game.scenes?.get(newSceneId);
        if (!newScene) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);
        const target = await validateTarget(
          {
            ..._ZoomStep.DefaultSettings,
            ...config
          },
          canvas?.scene,
          newScene
        );
        return {
          ..._ZoomStep.DefaultSettings,
          ...config,
          target
        };
      } catch (err) {
        return err;
      }
    }
    // #endregion Public Static Methods (10)
    // #region Public Methods (4)
    async execute(container, sequence, prepared) {
      const config = {
        ..._ZoomStep.DefaultSettings,
        ...this.config
      };
      if (!Array.isArray(config.target)) {
        const obj = await fromUuid(config.target);
        if (!obj) throw new InvalidTargetError(config.target);
        const parsed = foundry.utils.parseUuid(config.target);
        if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
        if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
      }
      const background = this.config.deserializedTexture ?? createColorTexture("transparent");
      const filters2 = [];
      if (config.applyToOverlay) {
        const filter = new ZoomFilter(this.#screenLocation, config.duration ? 1 : config.amount, config.clampBounds, background.baseTexture);
        this.addFilter(container, filter);
        filters2.push(filter);
      }
      if (config.applyToScene && canvas?.stage) {
        const filter = new ZoomFilter(this.#screenLocation, config.duration ? 1 : config.amount, config.clampBounds, background.baseTexture);
        addFilterToScene(filter, prepared.prepared);
        filters2.push(filter);
        this.#sceneFilter = filter;
      }
      if (config.duration) {
        this.#filters = [...filters2];
        await Promise.all(filters2.map((filter) => TweenMax.to(filter.uniforms, { amount: config.amount, duration: config.duration / 1e3, ease: config.easing })));
      }
    }
    async prepare() {
      const config = {
        ..._ZoomStep.DefaultSettings,
        ...this.config
      };
      if (Array.isArray(config.target)) {
        this.#screenLocation = config.target;
      } else {
        const obj = await fromUuid(config.target);
        if (!obj) throw new InvalidTargetError(config.target);
        const parsed = foundry.utils.parseUuid(config.target);
        if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
        if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
      }
    }
    async reverse() {
      const config = {
        ..._ZoomStep.DefaultSettings,
        ...this.config
      };
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.#filters.map((filter) => TweenMax.to(filter.uniforms, { amount: 1, duration: config.duration / 1e3, ease: config.easing }))
      );
    }
    teardown() {
      if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
      this.#sceneFilter = null;
    }
    // #endregion Public Methods (4)
  };
  function setBackgroundSelector(html) {
    const clamp = html.find("#clampBounds").is(":checked");
    if (!clamp) html.find(".background-selector").css("display", "block");
    else html.find(".background-selector").css("display", "none");
  }

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
    if (typeof texture === "string" && texture === "overlay") return "overlay";
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
  function formatDuration(duration) {
    return localize(`BATTLETRANSITIONS.FORMATTERS.MILLISECONDS`, { value: duration.toLocaleString() });
  }
  function deepCopy(target, source) {
    if (typeof target !== "object") throw new InvalidObjectError(target);
    if (typeof source !== "object") throw new InvalidObjectError(source);
    for (const prop in source) {
      if (Array.isArray(source[prop]))
        target[prop] = source[prop].slice();
      else if (typeof source[prop] === "object")
        deepCopy(target[prop], source[prop]);
      else
        target[prop] = source[prop];
    }
  }
  function backgroundType(background) {
    if (typeof background === "string" && background === "overlay") return "overlay";
    else if (typeof background === "string" && isColor(background)) return "color";
    else return "image";
  }
  function downloadJSON(json, name) {
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objUrl;
    link.download = name.endsWith(".json") ? name : `${name}.json`;
    link.click();
    URL.revokeObjectURL(objUrl);
  }
  async function importSequence() {
    const json = await uploadJSON();
    const sequence = [];
    if (!json) return null;
    if (!Array.isArray(json)) throw new InvalidImportError();
    for (const config of json) {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidImportError();
      const res = step.validate(config, json);
      const actual = res instanceof Promise ? await res : res;
      if (actual instanceof Error) throw actual;
      sequence.push(actual);
    }
    return sequence;
  }
  function uploadJSON() {
    return new Promise((resolve, reject) => {
      const file = document.createElement("input");
      file.setAttribute("type", "file");
      file.setAttribute("accept", "application/json");
      file.onchange = (e) => {
        const file2 = e.currentTarget.files?.[0];
        if (!file2) {
          reject(new NoFileError());
          return;
        }
        const reader = new FileReader();
        reader.onload = (e2) => {
          if (!e2.target?.result) throw new NoFileError();
          if (typeof e2.target.result === "string") resolve(JSON.parse(e2.target.result));
        };
        reader.readAsText(file2);
      };
      file.onerror = (event, source, line, col, error) => {
        if (error) reject(error);
        else reject(new Error(typeof event === "string" ? event : "undefined"));
      };
      file.click();
    });
  }
  function createGradientTexture(width, height, x1, y1, x2, y2, stops) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = width;
    canvas2.height = height;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const stop of stops) {
      gradient.addColorStop(stop.point, stop.color);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas2.width, canvas2.height);
    return PIXI.Texture.from(canvas2);
  }
  function createConicGradientTexture(width, height, angle, x, y, stops) {
    const canvas2 = document.createElement("canvas");
    const ctx = canvas2.getContext("2d");
    if (!ctx) throw new CanvasNotFoundError();
    canvas2.width = width;
    canvas2.height = height;
    const gradient = ctx.createConicGradient(angle, x, y);
    for (const stop of stops) {
      gradient.addColorStop(stop.point, stop.color);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas2.width, canvas2.height);
    return PIXI.Texture.from(canvas2);
  }
  function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  function getTargetType2(config, oldScene, newScene) {
    if (config && typeof config.target === "string" && config.target) {
      const parsed = foundry.utils.parseUuid(config.target);
      if (parsed.primaryType !== "Scene") throw new InvalidTargetError(config.target);
      const age = parsed.primaryId === oldScene?.id ? "old" : parsed.primaryId === newScene?.id ? "new" : "";
      if (Array.isArray(parsed.embedded)) return `${age}${parsed.embedded[0].toLowerCase()}`;
      else return (parsed.type ?? "").toLowerCase();
    } else if (config && Array.isArray(config.target)) {
      return "point";
    } else if (config && typeof config.target === "string" && !config.target) {
      return "prompt";
    }
    return "point";
  }
  function parseFontSize(input) {
    if (parseInt(input).toString() == input) return `${input}px`;
    return input;
  }
  function isValidFontSize(input) {
    const size = parseFontSize(input);
    const temp = document.createElement("div");
    temp.style.fontSize = size;
    return temp.style.fontSize !== "";
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
    renderer.render(canvas.stage, { renderTexture: rt, skipUpdateTransform: true, clear: false });
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
    const renderTexture = PIXI.RenderTexture.create({ width: window.innerWidth, height: window.innerHeight });
    const finalTexture = PIXI.Texture.from(tempCanvas);
    const bgSprite = PIXI.Sprite.from(finalTexture);
    renderer.render(bgSprite, { renderTexture, skipUpdateTransform: true, clear: false });
    transitionCover2.style.backgroundImage = `url(${src})`;
    transitionCover2.style.backgroundColor = renderer.background.backgroundColor.toHex();
    transitionCover2.style.display = "block";
    const sprite = new PIXI.Sprite(renderTexture);
    return sprite;
  }
  function removeFiltersFromScene(sequence) {
    sequence.sceneFilters.forEach((filter) => removeFilterFromScene(filter));
  }
  function addFilterToScene(filter, sequence) {
    if (Array.isArray(canvas?.environment?.filters)) canvas.environment.filters.push(filter);
    else if (canvas?.environment) canvas.environment.filters = [filter];
    sequence.sceneFilters.push(filter);
  }
  function removeFilterFromScene(filter) {
    if (Array.isArray(canvas?.environment?.filters) && canvas.environment.filters.includes(filter)) canvas.environment?.filters?.splice(canvas.environment.filters.indexOf(filter), 1);
    filter.destroy();
  }
  async function setupTransition() {
    if (!canvasGroup) throw new CannotInitializeCanvasError();
    const snapshot = await createSnapshot();
    const container = new PIXI.Container();
    container.width = window.innerWidth;
    container.height = window.innerHeight;
    container.addChild(snapshot);
    canvasGroup.addChild(container);
    return container;
  }
  function cleanupTransition(container) {
    transitionCover.style.display = "none";
    transitionCover.style.backgroundImage = "";
    if (container) {
      if (Array.isArray(container.children) && container.children.length) {
        const children = [...container.children ?? []];
        for (const child of children) child.destroy();
      }
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
  async function sequenceDuration(sequence) {
    let duration = 0;
    for (const config of sequence) {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
      const res = step.getDuration(config, sequence);
      duration += res instanceof Promise ? await res : res;
    }
    return duration;
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
    Handlebars.registerHelper("formatDuration", function(value) {
      if (typeof value === "number") return formatDuration(value);
      else if (typeof value === "string" && !isNaN(parseFloat(value))) return formatDuration(parseFloat(value));
      else return "NaN";
    });
    Handlebars.registerHelper("when", function(operand_1, operator, operand_2, options) {
      const operators = {
        "eq": function(l, r) {
          return l == r;
        },
        "noteq": function(l, r) {
          return l != r;
        },
        "gt": function(l, r) {
          return Number(l) > Number(r);
        },
        "or": function(l, r) {
          return l || r;
        },
        "and": function(l, r) {
          return l && r;
        },
        "%": function(l, r) {
          return l % r === 0;
        }
      }, result = operators[operator](operand_1, operand_2);
      if (result) return options.fn(this);
      else return options.inverse(this);
    });
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
        "sequence-item",
        "target-selector",
        "dualtransition-selector"
      ].map((name) => `/modules/${"battle-transitions"}/templates/config/${name}.hbs`),
      `/modules/${"battle-transitions"}/templates/scene-selector.hbs`,
      `/modules/${"battle-transitions"}/templates/transition-steps.hbs`,
      `/modules/${"battle-transitions"}/templates/font-selector.hbs`,
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
              id: foundry.utils.randomID(),
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
