"use strict";
(() => {
  // src/constants.ts
  var COVER_ID = "transition-cover";
  var TRANSLATION_KEY = "BATTLETRANSITIONS";
  var CUSTOM_HOOKS = {
    INITIALIZE: `${"battle-transitions"}.init`,
    TRANSITION_START: `${"battle-transitions"}.transitionStart`,
    TRANSITION_END: `${"battle-transitions"}.transitionEnd`
  };

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

  // src/errors/NoCoverElementError.ts
  var NoCoverElementError = class extends LocalizedError {
    constructor() {
      super("NOCOVERELEMENT");
    }
  };

  // src/errors/NotInitializedError.ts
  var NotInitializedError = class extends LocalizedError {
    constructor() {
      super("NOTINITIALIZED");
    }
  };

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

  // src/utils.ts
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
  async function awaitHook(hook) {
    return new Promise((resolve) => {
      Hooks.once(hook, (...args) => {
        resolve(args);
      });
    });
  }
  function getCanvasGroup() {
    return canvas?.stage?.children.find((child) => child instanceof ScreenSpaceCanvasGroup);
  }

  // src/coercion.ts
  function coerceColor(source) {
    try {
      return new PIXI.Color(source);
    } catch {
    }
  }
  function coerceTexture(source) {
    try {
      return PIXI.Texture.from(source);
    } catch {
    }
    const color = coerceColor(source);
    if (color) return createColorTexture(color);
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

  // src/transitionUtils.ts
  var transitionCover = document.createElement("div");
  transitionCover.style.display = "none";
  transitionCover.style.position = "absolute";
  transitionCover.style.width = "100%";
  transitionCover.style.height = "100%";
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
    const { sceneWidth, sceneHeight } = canvas.scene.dimensions;
    const renderer = canvas.app.renderer;
    const rt = PIXI.RenderTexture.create({ width: sceneWidth, height: sceneHeight });
    renderer.render(canvas.stage, { renderTexture: rt, skipUpdateTransform: true, clear: true });
    const transitionCover2 = document.getElementById(COVER_ID);
    if (!transitionCover2) throw new NoCoverElementError();
    transitionCover2.style.backgroundImage = "";
    const start = Date.now();
    const img = await renderer.extract.image(rt);
    console.log(`Image transfered in ${Date.now() - start}ms`);
    transitionCover2.style.backgroundImage = `url(${img.src})`;
    transitionCover2.style.backgroundColor = renderer.background.backgroundColor.toHex();
    transitionCover2.style.display = "block";
    const sprite = PIXI.Sprite.from(rt);
    return sprite;
  }
  async function setupTransition(parent) {
    const actualParent = parent instanceof PIXI.Container ? parent : canvasGroup;
    if (!actualParent) throw new CannotInitializeCanvasError();
    const snapshot = await createSnapshot();
    const container = new PIXI.Container();
    const bgTexture = createColorTexture(canvas?.app?.renderer.background.backgroundColor ?? "white");
    container.addChild(new PIXI.Sprite(bgTexture));
    container.addChild(snapshot);
    actualParent.addChild(container);
    return container;
  }
  function cleanupTransition(container) {
    container.destroy();
    transitionCover.style.display = "none";
    transitionCover.style.removeProperty("backgroundImage");
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
    void scene.activate();
    await awaitHook("canvasReady");
    return scene;
  }
  async function transitionTo(arg, callback) {
    const scene = typeof arg === "string" ? game.scenes?.getName(arg) : arg;
    if (!scene) throw new InvalidSceneError(arg);
    const container = await setupTransition();
    hideLoadingBar();
    await activateScene(scene);
    showLoadingBar();
    hideTransitionCover();
    await callback(container);
    cleanupTransition(container);
  }

  // src/filters/default.frag
  var default_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nvoid main() {\n    color = texture(uSampler, vTextureCoord);\n}";

  // src/filters/default.vert
  var default_default2 = "in vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nout vec2 vTextureCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition(void) {\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n    \n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord(void) {\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void) {\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n";

  // src/filters/CustomFilter.ts
  var CustomFilter = class extends PIXI.Filter {
    constructor(vertex, fragment, uniforms) {
      super(vertex || default_default2, fragment || default_default, uniforms);
      if (!this.program.fragmentSrc.includes("#version 300 es"))
        this.program.fragmentSrc = "#version 300 es \n" + this.program.fragmentSrc;
      if (!this.program.vertexSrc.includes("#version 300 es"))
        this.program.vertexSrc = "#version 300 es\n" + this.program.vertexSrc;
    }
  };

  // src/filters/FireDissolve/firedissolve.frag
  var firedissolve_default = "precision highp float;\n\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform sampler2D uSampler;\nuniform sampler2D noise_texture;\nuniform sampler2D burn_texture;\n\nuniform float integrity;\nuniform float burn_size;\n\nfloat inverse_lerp(float a, float b, float v) {\n    return (v - a) / (b - a);\n}\n\nvoid main() {\n    float noise = texture(noise_texture, vTextureCoord).r * vTextureCoord.y;\n    vec4 base_color = texture(uSampler, vTextureCoord) * step(noise, integrity);\n    vec2 burn_uv = vec2(inverse_lerp(integrity, integrity * burn_size, noise), 0.0);\n    vec4 burn_color = texture(burn_texture, burn_uv) * step(noise, integrity * burn_size);\n    \n    color = mix(burn_color, base_color, base_color.a);\n    // color = texture(uSampler, vTextureCoord);\n}";

  // src/filters/FireDissolve/FireDissolveFilter.ts
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      fireDissolve: () => async function(container) {
        const filter = new FireDissolveFilter();
        container.filters = [filter];
        await TweenMax.to(filter.uniforms, { integrity: 0, duration: 3 });
        filter.destroy();
        container.filters = [];
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...BattleTransitions.Presets
    };
  });
  var FireDissolveFilter = class extends CustomFilter {
    constructor(uniforms) {
      const noise_texture = createNoiseTexture();
      const burn_texture = createGradient1DTexture(1024, new PIXI.Color("#ff0400"), new PIXI.Color("#ffff01"));
      const actualUniforms = {
        noise_texture,
        burn_texture,
        integrity: 1,
        burn_size: 1.5,
        ...uniforms
      };
      super(void 0, firedissolve_default, actualUniforms);
    }
  };

  // src/filters/DiamondTransition/diamondtransition.frag
  var diamondtransition_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform float size;\nuniform bool fill;\nuniform vec2 screen_size;\n\nvoid main() {\n    color = texture(uSampler, vTextureCoord);\n    \n    vec2 screenCoord = screen_size * vTextureCoord;\n    \n    float x = abs(fract(screenCoord.x / size) - 0.5);\n    float y = abs(fract(screenCoord.y / size) - 0.5);\n    \n    if (x + y + vTextureCoord.x > progress * 2.0) {\n        if (!fill) {\n            color = vec4(0.0);\n        }\n    } else if (fill) {\n        color = vec4(0.0);\n    }\n}";

  // src/filters/DiamondTransition/DiamondTransitionFilter.ts
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      diamondWipe: (duration) => {
        return async function(container) {
          const filter = new DiamondTransitionFilter();
          container.filters = [filter];
          await TweenMax.to(filter.uniforms, { progress: 1, duration });
          filter.destroy();
          container.filters = [];
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...BattleTransitions.Presets
    };
  });
  var DiamondTransitionFilter = class extends CustomFilter {
    constructor(uniforms) {
      const actual = {
        progress: 0,
        size: 40,
        fill: true,
        screen_size: {
          x: window.innerWidth,
          y: window.innerHeight
        },
        ...uniforms
      };
      super(void 0, diamondtransition_default, actual);
    }
  };

  // src/filters/TextureWipe/texturewipe.frag
  var texturewipe_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform sampler2D wipeSampler;\nuniform sampler2D bgSampler;\n\nvoid main() {\n    vec4 wipe = texture(wipeSampler, vTextureCoord);\n    \n    if (wipe.b < progress) {\n        color = texture(bgSampler, vTextureCoord);\n    } else {\n        color = texture(uSampler, vTextureCoord);\n    }\n}";

  // src/filters/TextureWipe/TextureWipeFilter.ts
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      linearLeft: wipePreset("linear-left.webp"),
      linearRight: wipePreset("linear-right.webp"),
      linearTop: wipePreset("linear-top.webp"),
      linearBottom: wipePreset("linear-bottom.webp"),
      linearTopLeft: wipePreset("linear-top-left.webp"),
      linearTopRight: wipePreset("linear-top-right.webp"),
      linearBottomRight: wipePreset("linear-bottom-right.webp"),
      linearBottomLeft: wipePreset("linear-bottom-left.webp"),
      bilinearVerticalInside: wipePreset("bilinear-vertical-inside.webp"),
      bilinearVerticalOutside: wipePreset("bilinear-vertical-outside.webp"),
      bilinearHorizontalInside: wipePreset("bilinear-horizontal-inside.webp"),
      bilinearHorizontalOutside: wipePreset("bilinear-horizontal-outside.webp"),
      bilinearTopLeftInside: wipePreset("bilinear-top-left-inside.webp"),
      bilinearTopLeftOutside: wipePreset("bilinear-top-left-outside.webp"),
      bilinearTopRightInside: wipePreset("bilinear-top-right-inside.webp"),
      bilinearTopRightOutside: wipePreset("bilinear-top-right-outside.webp"),
      radialInside: wipePreset("radial-inside.webp"),
      radialOutside: wipePreset("radial-outside.webp"),
      spotlightBottomOutside: wipePreset("spotlight-bottom-outside.webp"),
      spotlightLeftOutside: wipePreset("spotlight-left-outside.webp"),
      spotlightRightOutside: wipePreset("spotlight-right-outside.webp"),
      spotlightTopOutside: wipePreset("spotlight-top-outside.webp"),
      clockwiseTop: wipePreset("clockwise-top.webp"),
      clockwiseRight: wipePreset("clockwise-right.webp"),
      clockwiseBottom: wipePreset("clockwise-bottom.webp"),
      clockwiseLeft: wipePreset("clockwise-left.webp"),
      counterclockwiseTop: wipePreset("counterclockwise-top.webp"),
      counterclockwiseRight: wipePreset("counterclockwise-top.webp"),
      counterclockwiseBottom: wipePreset("counterclockwise-bottom.webp"),
      coutnerclockwiseLeft: wipePreset("counterclockwise-left.webp"),
      ...BattleTransitions.Presets
    };
  });
  var transparentTexture = createColorTexture(new PIXI.Color("#00000000"));
  function wipePreset(url) {
    const texture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${url}`);
    return function(duration, bgTexture = transparentTexture) {
      return async function(container) {
        const filter = new TextureWipeFilter(texture, bgTexture);
        container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration });
        filter.destroy();
        container.filters = [];
      };
    };
  }
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
  var fadetransition_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform sampler2D bgColor;\n\nvoid main() {\n    color = mix(texture(uSampler, vTextureCoord), texture(bgColor, vTextureCoord), progress);\n}";

  // src/filters/FadeTransition/FadeTransitionFilter.ts
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      colorFade: (duration, color) => async (container) => {
        const filter = new FadeTransitionFilter(color);
        container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration });
        filter.destroy();
        container.filters = [];
      },
      ...BattleTransitions.Presets
    };
  });
  var FadeTransitionFilter = class extends CustomFilter {
    constructor(color) {
      const texture = createColorTexture(color ?? "#00000000");
      super(void 0, fadetransition_default, { bgColor: texture, progress: 0 });
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
      if (texture) throw new InvalidDirectionError(direction);
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
    RadialWipeFilter
  };

  // src/BattleTransitions.ts
  var BattleTransitions_default = {
    transitionTo,
    logImage,
    createColorTexture,
    Filters: filters,
    Presets: {},
    Textures: {
      Black: createColorTexture("#000000"),
      White: createColorTexture("#FFFFFF"),
      Transparent: createColorTexture("#00000000"),
      fromColor: createColorTexture
    }
  };

  // src/TransitionChain.ts
  var TransitionChain = class {
    #sequence = [];
    #containers = [];
    get currentContainer() {
      return this.#containers.length ? this.#containers[this.#containers.length - 1] : void 0;
    }
    async execute() {
      for (const step of this.#sequence) {
        await step(this.currentContainer);
      }
      if (this.currentContainer) cleanupTransition(this.currentContainer);
    }
    to(arg) {
      const scene = coerceScene(arg);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
      this.#sequence.push(async (outer) => {
        const container = await setupTransition(outer);
        this.#containers.push(container);
        hideLoadingBar();
        await activateScene(scene);
        showLoadingBar();
        hideTransitionCover();
        container.destroy();
      });
      return this;
    }
    wait(time) {
      this.#sequence.push(async () => new Promise((resolve) => {
        setTimeout(resolve, time);
      }));
      return this;
    }
    call(func) {
      this.#sequence.push(func);
      return this;
    }
    macro(arg) {
      const macro = coerceMacro(arg);
      if (!(macro instanceof Macro)) throw new InvalidMacroError(typeof arg === "string" ? arg : "[Object object]");
      this.#sequence.push(() => new Promise((resolve, reject) => {
        const res = macro.execute();
        if (res instanceof Promise) res.then(() => {
          resolve();
        }).catch(reject);
        else resolve();
      }));
      return this;
    }
    constructor() {
      const canvasGroup2 = getCanvasGroup();
      if (!(canvasGroup2 instanceof ScreenSpaceCanvasGroup)) throw new CanvasNotFoundError();
      const container = new PIXI.Container();
      this.#containers.push(container);
    }
  };

  // src/module.ts
  window.BattleTransitions = BattleTransitions_default;
  window.BattleTransition = TransitionChain;
  Hooks.once("canvasReady", () => {
    initializeCanvas();
    Hooks.callAll(CUSTOM_HOOKS.INITIALIZE);
  });
})();
//# sourceMappingURL=module.js.map
