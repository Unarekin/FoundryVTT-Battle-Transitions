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

  // src/errors/InvalidElementError.ts
  var InvalidElementError = class extends LocalizedError {
    constructor() {
      super("INVALIDELEMENT");
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
  function localize(key, data = {}) {
    return game.i18n?.format(key, data) ?? key;
  }
  function shouldUseAppV2() {
    return game.release?.isNewer("12") ?? false;
  }

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
  async function setupTransition() {
    if (!canvasGroup) throw new CannotInitializeCanvasError();
    const snapshot = await createSnapshot();
    const container = new PIXI.Container();
    const bgTexture = createColorTexture(canvas?.app?.renderer.background.backgroundColor ?? "white");
    container.addChild(new PIXI.Sprite(bgTexture));
    container.addChild(snapshot);
    canvasGroup.addChild(container);
    return container;
  }
  function cleanupTransition(container) {
    transitionCover.style.display = "none";
    transitionCover.style.backgroundImage = "";
    if (Array.isArray(container.children) && container.children.length)
      for (let i = container.children.length - 1; i >= 0; i--) container.children[i].destroy();
    container.destroy();
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
  var defaultBurnTexture = createGradient1DTexture(1024, new PIXI.Color("#ff0400"), new PIXI.Color("#ffff01"));
  var FireDissolveFilter = class extends CustomFilter {
    constructor(burnTexture) {
      const noise_texture = createNoiseTexture();
      const uniforms = {
        noise_texture,
        integrity: 1,
        burn_size: 1.3,
        burn_texture: burnTexture ? PIXI.Texture.from(burnTexture) : defaultBurnTexture
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
  var fadetransition_default = "precision highp float;\n\nuniform sampler2D uSampler;\nin vec2 vTextureCoord;\nout vec4 color;\n\nuniform float progress;\nuniform sampler2D bgColor;\n\nvoid main() {\n    color = mix(texture(uSampler, vTextureCoord), texture(bgColor, vTextureCoord), progress);\n}";

  // src/TransitionChain.ts
  var TransitionChain = class {
    #scene;
    #sequence = [];
    #sounds = [];
    call(func) {
      this.#sequence.push(func);
      return this;
    }
    macro(arg) {
      const macro = coerceMacro(arg);
      if (!macro) throw new InvalidMacroError(typeof arg === "string" ? arg : "[Object object]");
      this.#sequence.push(async () => {
        const res = macro.execute();
        if (res instanceof Promise) await res;
      });
      return this;
    }
    /**
     * Causes the sequence to wait the specified amount of time before continuing.
     * @param {number} duration Amount of time to wait, in milliseconds
     * @returns 
     */
    wait(duration) {
      this.#sequence.push(() => new Promise((resolve) => {
        setTimeout(resolve, duration);
      }));
      return this;
    }
    linearWipe(direction, duration = 2e3, bg) {
      const wipe = new LinearWipeFilter(direction, bg ?? createColorTexture("transparent").baseTexture);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(wipe);
        else container.filters = [wipe];
        await TweenMax.to(wipe.uniforms, { progress: 1, duration: duration / 1e3 });
        return;
      });
      return this;
    }
    bilinearWipe(direction, radial, duration = 2e3, bg = "transparent") {
      const filter = new BilinearWipeFilter(direction, radial, bg);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1e3 });
        return;
      });
      return this;
    }
    async execute() {
      const container = await setupTransition();
      hideLoadingBar();
      await activateScene(this.#scene);
      showLoadingBar();
      hideTransitionCover();
      for (const step of this.#sequence) {
        await step(container);
      }
      for (const sound of this.#sounds) sound.stop();
      cleanupTransition(container);
    }
    diamondWipe(size, duration = 2e3, bg = "transparent") {
      const filter = new DiamondTransitionFilter(size, bg);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1e3 });
        return;
      });
      return this;
    }
    fade(duration, bg = "transparent") {
      const filter = new FadeTransitionFilter(bg);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1e3 });
        return;
      });
      return this;
    }
    clockWipe(clockDirection, direction, duration = 2e3, bg = "transparent") {
      const filter = new ClockWipeFilter(clockDirection, direction, bg);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1e3 });
        return;
      });
      return this;
    }
    burn(duration = 1e3, texture) {
      const filter = new FireDissolveFilter(texture);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { integrity: 0, duration: duration / 1e3 });
      });
      return this;
    }
    sound(file, loop = false) {
      foundry.audio.AudioHelper.preloadSound(file);
      this.#sequence.push(async () => {
        const sound = await foundry.audio.AudioHelper.play({ src: file, volume: 1, autoplay: true, loop }, true);
        this.#sounds.push(sound);
      });
      return this;
    }
    video(file) {
      this.#sequence.push(async (container) => {
        const texture = await PIXI.Assets.load(file);
        const resource = texture.baseTexture.resource;
        const source = resource.source;
        return new Promise((resolve, reject) => {
          const swapFilter = new TextureSwapFilter(texture.baseTexture);
          if (Array.isArray(container.filters)) container.filters.push(swapFilter);
          else container.filters = [swapFilter];
          source.addEventListener("ended", () => {
            resolve();
          });
          source.addEventListener("error", (e) => {
            reject(e.error);
          });
          void source.play();
        });
      });
      return this;
    }
    radial(direction, duration = 1e3, bg = "transparent") {
      const filter = new RadialWipeFilter(direction, bg);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1e3 });
      });
      return this;
    }
    spotlight(direction, radial, duration = 1e3, bg = "transparent") {
      const filter = new SpotlightWipeFilter(direction, radial, bg);
      this.#sequence.push(async (container) => {
        if (Array.isArray(container.filters)) container.filters.push(filter);
        else container.filters = [filter];
        await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1e3 });
      });
      return this;
    }
    constructor(arg) {
      const scene = coerceScene(arg);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
      this.#scene = scene;
    }
  };

  // src/filters/FadeTransition/FadeTransitionFilter.ts
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      fade: (scene, duration = 1e3) => new TransitionChain(scene).fade(duration).execute(),
      ...BattleTransitions.Presets ?? {}
    };
  });
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
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      bilinearHorizontalInside: generatePreset("horizontal", "inside"),
      bilinearHorizontalOutside: generatePreset("horizontal", "outside"),
      bilinearVerticalInside: generatePreset("vertical", "inside"),
      bilinearVerticalOutside: generatePreset("vertical", "outside"),
      bilinearTopLeftInisde: generatePreset("topleft", "inside"),
      bilinearTopLeftOutside: generatePreset("topleft", "outside"),
      bilinearTopRightInside: generatePreset("topright", "inside"),
      bilinearTopRightOUtside: generatePreset("topright", "outside"),
      ...BattleTransitions.Presets ?? {}
    };
  });
  function generatePreset(direction, radial) {
    return (scene, duration = 1e3) => new TransitionChain(scene).bilinearWipe(direction, radial, duration).execute();
  }
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
  function generatePreset2(direction) {
    return (scene, duration) => new TransitionChain(scene).linearWipe(direction, duration).execute();
  }
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      linearLeft: generatePreset2("left"),
      linearRight: generatePreset2("right"),
      linearTop: generatePreset2("top"),
      linearBottom: generatePreset2("bottom"),
      linearTopLeft: generatePreset2("topleft"),
      linearTopRight: generatePreset2("topright"),
      linearBottomLeft: generatePreset2("bottomleft"),
      linearBottomRight: generatePreset2("bottomright"),
      ...BattleTransitions.Presets ?? {}
    };
  });
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
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      clockwiseTop: generatePreset3("clockwise", "top"),
      clockwiseRight: generatePreset3("clockwise", "right"),
      clockwiseBottom: generatePreset3("clockwise", "bottom"),
      clockwiseLeft: generatePreset3("clockwise", "left"),
      counterClockwiseTop: generatePreset3("counterclockwise", "top"),
      counterClockwiseRight: generatePreset3("counterclockwise", "right"),
      counterClockwiseBottom: generatePreset3("counterclockwise", "bottom"),
      counterClockwiseLeft: generatePreset3("counterclockwise", "left"),
      ...BattleTransitions.Presets ?? {}
    };
  });
  function generatePreset3(clockDirection, direction) {
    return (scene, duration = 1e3) => new TransitionChain(scene).clockWipe(clockDirection, direction, duration).execute();
  }
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
  function generatePreset4(direction, radial) {
    return (scene, duration) => new TransitionChain(scene).spotlight(direction, radial, duration).execute();
  }
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      spotlightTopOutside: generatePreset4("top", "outside"),
      spotlightRightOutside: generatePreset4("right", "outside"),
      spotlightBottomOutside: generatePreset4("bottom", "outside"),
      spotlightLeftOutside: generatePreset4("left", "outside"),
      spotlightTopInside: generatePreset4("top", "inside"),
      spotlightRightInside: generatePreset4("right", "inside"),
      spotlightBottomInside: generatePreset4("bottom", "inside"),
      spotlightLeftInside: generatePreset4("left", "inside"),
      ...BattleTransitions.Presets ?? {}
    };
  });
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
  function generatePreset5(direction) {
    return (scene, duration) => new TransitionChain(scene).radial(direction, duration).execute();
  }
  Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    BattleTransitions.Presets = {
      radialInside: generatePreset5("inside"),
      radialOutside: generatePreset5("outside"),
      ...BattleTransitions.Presets ?? {}
    };
  });
  var RadialWipeFilter = class extends TextureWipeFilter {
    constructor(direction, bg) {
      const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
      const texture = TextureHash5[direction];
      if (!texture) throw new InvalidDirectionError(direction);
      const wipeTexture = PIXI.Texture.from(`/modules/${"battle-transitions"}/assets/wipes/${texture}`);
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
    TextureSwapFilter
  };

  // src/BattleTransitions.ts
  var BattleTransitions_default = {
    transitionTo,
    logImage,
    createColorTexture,
    cleanupTransition,
    Filters: filters,
    Presets: {},
    Textures: {
      Black: createColorTexture("#000000"),
      White: createColorTexture("#FFFFFF"),
      Transparent: createColorTexture("#00000000"),
      fromColor: createColorTexture
    }
  };

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
  }
  async function registerTemplates() {
    return loadTemplates([
      `/modules/${"battle-transitions"}/templates/scene-config.hbs`,
      ...[
        "add-step",
        "fade-config",
        "linearwipe-config",
        "step-item"
      ].map((name) => `/modules/${"battle-transitions"}/templates/config/${name}.hbs`)
    ]);
  }

  // src/config/FadeConfigHandler.ts
  var FadeConfigHandler = class {
    get key() {
      return "fade";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.FADE";
    }
    defaultSettings = {
      duration: 1e3,
      background: "#00000000",
      id: ""
    };
    generateSummary(flag) {
      if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }), flag.background].join("; ");
      else return "";
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/fade-config.hbs`, flag ?? {});
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const background = form.find((elem) => elem.name === "background");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...background ? { background: background.value } : {},
        ...id ? { id: id.value } : { id: foundry.utils.randomID() }
      };
    }
  };

  // src/config/LinearWipeConfigHandler.ts
  var LinearWipeConfigHandler = class {
    defaultSettings = {
      duration: 1e3,
      background: "#00000000",
      direction: "left"
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [settings.direction, settings.duration, settings.background].join("; ");
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/linearwipe-config.hbs`, {
        ...this.defaultSettings,
        ...flag,
        directionSelect: {
          "top": "BATTLETRANSITIONS.DIRECTIONS.TOP",
          "left": "BATTLETRANSITIONS.DIRECTIONS.LEFT",
          "right": "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
          "bottom": "BATTLETRANSITIONS.DIRECTIONS.BOTTOM",
          "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
          "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT",
          "bottomleft": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMLEFT",
          "bottomright": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMRIGHT"
        }
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const background = form.find((elem) => elem.name === "background");
      const direction = form.find((elem) => elem.name === "direction");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...background ? { background: background.value } : {},
        ...direction ? { direction: direction.value } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
    get key() {
      return "linear-wipe";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.LINEARWIPE";
    }
  };

  // src/config/BilinearWipeConfigHandler.ts
  var BilinearWipeConfigHandler = class {
    get key() {
      return "bilinear-wipe";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.BILINEARWIPE";
    }
    defaultSettings = {
      duration: 1e3,
      direction: "horizontal",
      radial: "inside",
      background: "#00000000"
    };
    generateSummary(flag) {
      if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }), flag.direction, flag.radial, flag.background].join("; ");
      else return "";
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/bilinear-wipe-config.hbs`, {
        ...this.defaultSettings,
        ...flag,
        directionSelect: {
          "horizontal": "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
          "vertical": "BATTLETRANSITIONS.DIRECTIONS.VERTICAL",
          "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
          "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"
        },
        radialSelect: {
          "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
          "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
        }
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const background = form.find((elem) => elem.name === "background");
      const direction = form.find((elem) => elem.name === "direction");
      const radial = form.find((elem) => elem.name === "radial");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...background ? { background: background.value } : {},
        ...direction ? { direction: direction.value } : {},
        ...radial ? { radial: radial.value } : {},
        ...id ? { id: id.value } : { id: foundry.utils.randomID() }
      };
    }
  };

  // src/config/ChromaKeyConfigHandler.ts
  var ChromaKeyConfigHandler = class {
    get key() {
      return "chromakey";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.CHROMAKEY";
    }
    defaultSettings = {
      keyColor: "#00b140",
      background: "#00000000"
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [settings.keyColor, settings.background].join("; ");
    }
    async renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/chromakey-config.hbs`, {
        ...this.defaultSettings,
        ...flag
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const keyColor = form.find((elem) => elem.name === "key-color");
      const background = form.find((elem) => elem.name === "background");
      return {
        ...this.defaultSettings,
        ...keyColor ? { keyColor: keyColor.value } : {},
        ...background ? { background: background.value } : {}
      };
    }
  };

  // src/config/ClockWipeConfigHandler.ts
  var ClockWipeConfigHandler = class {
    get key() {
      return "clockwipe";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.CLOCKWIPE";
    }
    defaultSettings = {
      direction: "top",
      clockdirection: "clockwise",
      duration: 1e3,
      background: "#00000000"
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [settings.clockdirection, settings.direction, localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }), settings.background].join("; ");
    }
    async renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/clockwipe-config.hbs`, {
        ...this.defaultSettings,
        ...flag,
        directionSelect: {
          top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
          left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
          right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
          bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
        },
        clockDirectionSelect: {
          clockwise: "BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",
          counterclockwise: "BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"
        }
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const direction = form.find((elem) => elem.name === "direction");
      const background = form.find((elem) => elem.name === "background");
      const clockDirection = form.find((elem) => elem.name === "clockdirection");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...direction ? { direction: direction.value } : {},
        ...background ? { background: background.value } : {},
        ...clockDirection ? { clockdirection: clockDirection.value } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/DiamondTransitionConfigHandler.ts
  var DiamondTransitionConfigHandler = class {
    get key() {
      return "diamond";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.DIAMOND";
    }
    defaultSettings = {
      duration: 1e3,
      size: 40,
      background: "#00000000"
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [
        localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
        localize("BATTLETRANSITIONS.FORMATTERS.PIXELS", { value: settings.size }),
        settings.background
      ].join("; ");
    }
    async renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/diamond-config.hbs`, {
        ...this.defaultSettings,
        ...flag
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const size = form.find((elem) => elem.name === "size");
      const background = form.find((elem) => elem.name === "background");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...size ? { size: parseFloat(size.value) } : {},
        ...background ? { background: background.value } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/FireDissolveConfigHandler.ts
  var FireDissolveConfigHandler = class {
    get key() {
      return "firedissolve";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.FIREDISSOLVE";
    }
    defaultSettings = {
      duration: 1e3,
      background: "#00000000",
      burnSize: 1.3
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [
        localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
        settings.background
      ].join("; ");
    }
    async renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/fire-dissolve-config.hbs`, {
        ...this.defaultSettings,
        ...flag
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const background = form.find((elem) => elem.name === "background");
      const burnSize = form.find((elem) => elem.name === "burnsize");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...background ? { background: background.value } : {},
        ...burnSize ? { burnSize: parseFloat(burnSize.value) } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/RadialWipeConfigHandler.ts
  var RadialWipeConfigHandler = class {
    get key() {
      return "radialwipe";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.RADIALWIPE";
    }
    defaultSettings = {
      duration: 1e3,
      background: "#00000000",
      radial: "inside"
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [
        localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
        settings.radial,
        settings.background
      ].join("; ");
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/radial-wipe-config.hbs`, {
        ...flag,
        radialOptions: {
          "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
          "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
        }
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const radial = form.find((elem) => elem.name === "radial");
      const background = form.find((elem) => elem.name === "background");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...background ? { background: background.value } : {},
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...radial ? { radial: radial.value } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/SpotlightWipeConfigHandler.ts
  var SpotlightWipeConfigHandler = class {
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.SPOTLIGHTWIPE";
    }
    get key() {
      return "spotlightwipe";
    }
    defaultSettings = {
      duration: 1e3,
      background: "#00000000",
      direction: "top",
      radial: "outside"
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [
        localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
        settings.direction,
        settings.radial,
        settings.background
      ].join("; ");
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const direction = form.find((elem) => elem.name === "direction");
      const radial = form.find((elem) => elem.name === "radial");
      const background = form.find((elem) => elem.name === "background");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        ...background ? { background: background.value } : {},
        ...direction ? { direction: direction.value } : {},
        ...radial ? { radial: radial.value } : {},
        ...id ? { id: id.value } : { id: foundry.utils.randomID() }
      };
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/spotlight-wipe-config.hbs`, {
        ...flag,
        directionSelect: {
          top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
          left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
          right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
          bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
        },
        radialSelect: {
          inside: "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
          outside: "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
        }
      });
    }
  };

  // src/config/TextureSwapConfigHandler.ts
  var TextureSwapConfigHandler = class {
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.TEXTURESWAP";
    }
    get key() {
      return "textureswap";
    }
    defaultSettings = {
      texture: ""
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [settings.texture.split("/").slice(-1)].join("; ");
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/texture-swap-config.hbs`, {
        ...this.defaultSettings,
        ...flag
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const id = form.find((elem) => elem.name === "id");
      const texture = $(html).find("form #texture").val() ?? "";
      return {
        ...this.defaultSettings,
        texture,
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/WaitConfigHandler.ts
  var WaitConfigHandler = class {
    get key() {
      return "wait";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.WAIT";
    }
    defaultSettings = { duration: 1e3 };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration });
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/wait-config.hbs`, {
        ...this.defaultSettings,
        ...flag
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const duration = form.find((elem) => elem.name === "duration");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...duration ? { duration: parseFloat(duration.value) } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/SoundConfigHandler.ts
  var SoundConfigHandler = class {
    get key() {
      return "sound";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.SOUND";
    }
    defaultSettings = {
      file: "",
      volume: 1
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [
        settings.file.split("/").slice(-1),
        localize("BATTLETRANSITIONS.FORMATTERS.PERCENT", { value: settings.volume * 100 })
      ].join("; ");
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/sound-config.hbs`, {
        ...this.defaultSettings,
        ...flag
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const file = $(html).find("form #file").val() ?? "";
      const volume = form.find((elem) => elem.name === "volume");
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...file ? { file } : {},
        ...volume ? { volume: parseFloat(volume.value) / 100 } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/VideoConfigHandler.ts
  var VideoConfigHandler = class {
    get key() {
      return "video";
    }
    get name() {
      return "BATTLETRANSITIONS.TRANSITIONTYPES.VIDEO";
    }
    defaultSettings = {
      file: "",
      background: "#00000000",
      volume: 1
    };
    generateSummary(flag) {
      const settings = {
        ...this.defaultSettings,
        ...flag
      };
      return [
        settings.file.split("/").splice(-1),
        localize("BATTLETRANSITIONS.FORMATTERS.PERCENT", { value: settings.volume * 100 })
      ].join("; ");
    }
    renderTemplate(flag) {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/video-config.hbs`, {
        ...this.defaultSettings,
        ...flag,
        volume: (flag?.volume !== void 0 ? flag.volume : this.defaultSettings.volume) * 100
      });
    }
    createFlagFromHTML(html) {
      const form = $(html).find("form").serializeArray();
      const file = $(html).find("form #file").val() ?? "";
      const volume = $(html).find("form #volume input[type='number']").val();
      const id = form.find((elem) => elem.name === "id");
      return {
        ...this.defaultSettings,
        ...file ? { file } : {},
        ...volume ? { volume: volume / 100 } : {},
        id: id ? id.value : foundry.utils.randomID()
      };
    }
  };

  // src/config/ConfigurationHandler.ts
  var CONFIG_HANDLERS = [
    new FadeConfigHandler(),
    new LinearWipeConfigHandler(),
    new BilinearWipeConfigHandler(),
    new ChromaKeyConfigHandler(),
    new ClockWipeConfigHandler(),
    new DiamondTransitionConfigHandler(),
    new FireDissolveConfigHandler(),
    new RadialWipeConfigHandler(),
    new SpotlightWipeConfigHandler(),
    new TextureSwapConfigHandler(),
    new WaitConfigHandler(),
    new SoundConfigHandler(),
    new VideoConfigHandler()
  ];
  var ConfigurationHandler = class {
    #dialog;
    #scene;
    #addStepDialog = null;
    stepKey = "steps";
    configKey = "config";
    tabName = "battle-transitions";
    icon = ["fas", "crossed-swords", "fa-fw", "icon"];
    get appId() {
      return this.#dialog.appId;
    }
    get rootElement() {
      return $(this.#dialog.element);
    }
    get addStepDialogElement() {
      return this.#addStepDialog ? $(this.#addStepDialog.element) : null;
    }
    updateConfiguration() {
      const flags = [];
      this.rootElement.find(".step-config-item[data-transition-type]").each((i, element) => {
        const flagData = $(element).data("flag");
        const transitionType = $(element).data("transition-type");
        if (!transitionType || typeof transitionType !== "string" || typeof flagData !== "object") throw new InvalidTransitionError("");
        flags.push({
          ...flagData,
          type: transitionType
        });
      });
      const container = this.rootElement.find(`[data-tab="${"battle-transitions"}"]`);
      const config = {
        autoTrigger: container.find("input#auto-trigger").is(":checked")
      };
      void Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        this.#scene.setFlag("battle-transitions", this.stepKey, flags),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        this.#scene.setFlag("battle-transitions", this.configKey, config)
      ]);
    }
    addEventListeners() {
      this.rootElement.find("button[data-action='add-step']").on("click", this.onAddStep.bind(this));
      this.rootElement.find("#transition-step-list").sortable({
        handle: ".drag-handle",
        containment: "parent",
        axis: "y"
      });
      this.rootElement.find("button[type='submit']").on("click", () => {
        this.updateConfiguration();
      });
      ColorPicker.install();
    }
    onAddStep(e) {
      e.preventDefault();
      void (shouldUseAppV2() && foundry.applications.api.DialogV2 ? this.addStepDialogV2() : this.addStepDialog());
    }
    resizeDialog() {
      const activeTab = this.rootElement.find(".item.active[data-tab]").data("tab");
      if (activeTab === this.tabName) {
        this.#dialog.activateTab("basic");
        this.#dialog.activateTab(this.tabName);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addStepEventListeners(element, config = {}) {
      element.find("[data-action='remove']").on("click", () => {
        const key = element.data("transition-type") ?? "";
        const handler = CONFIG_HANDLERS.find((elem) => elem.key === key);
        if (!handler) throw new InvalidTransitionError(key);
        if (shouldUseAppV2() && foundry.applications.api.DialogV2) {
          void foundry.applications.api.DialogV2.confirm({
            content: localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM", { name: localize(handler.name) })
          }).then((value) => {
            if (value) {
              element.remove();
              this.resizeDialog();
            }
          });
        } else {
          void Dialog.confirm({
            content: localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM", { name: localize(handler.name) })
          }).then((value) => {
            if (value) {
              element.remove();
              this.resizeDialog();
            }
          });
        }
      });
      element.find("[data-action='configure']").on("click", () => {
        const key = element.data("transition-type") ?? "";
        const handler = CONFIG_HANDLERS.find((elem) => elem.key === key);
        if (!handler) throw new InvalidTransitionError(key);
        const flag = element.data("flag") ?? handler.defaultSettings;
        void this.configureStep(key, flag);
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addConfigureStepEventListeners(html, flag = {}) {
      html.find("input[type='text'],input[type='number']").on("focus", (e) => {
        e.currentTarget.select();
      });
      ColorPicker.install();
    }
    async configureStep(key, flag = {}) {
      const handler = CONFIG_HANDLERS.find((item) => item.key === key);
      if (!handler) throw new InvalidTransitionError(key);
      const content = await handler.renderTemplate(flag);
      if (shouldUseAppV2() && foundry.applications.api.DialogV2) {
        void foundry.applications.api.DialogV2.wait({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          window: { title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(handler.name) }) },
          content,
          render: (e, dialog) => {
            this.addConfigureStepEventListeners($(dialog), flag);
          },
          buttons: [
            {
              label: "<i class='fas fa-times'></i> " + localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
              action: "cancel"
            },
            {
              label: "<i class='fas fa-check'></i> " + localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
              action: "ok",
              default: true,
              // eslint-disable-next-line @typescript-eslint/require-await
              callback: async (e, button, dialog) => {
                const flag2 = handler.createFlagFromHTML($(dialog));
                void this.addUpdateTransitionStep(key, flag2);
              }
            }
          ]
        });
      } else {
        await Dialog.wait({
          title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(handler.name) }),
          content,
          render: (html) => {
            this.addConfigureStepEventListeners(html, flag);
          },
          default: "ok",
          buttons: {
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")
            },
            ok: {
              icon: "<i class='fas fa-check'></i>",
              label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
              callback: (html) => {
                const flag2 = handler.createFlagFromHTML(html);
                void this.addUpdateTransitionStep(key, flag2);
              }
            }
          }
        });
      }
    }
    async addUpdateTransitionStep(key, config = {}) {
      const handler = CONFIG_HANDLERS.find((item) => item.key === key);
      if (!handler) throw new InvalidTransitionError(key);
      if (!config.id) config.id = foundry.utils.randomID();
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/config/step-item.hbs`, {
        ...config ?? {},
        name: localize(handler?.name),
        summary: handler.generateSummary(config),
        type: key,
        flag: JSON.stringify(config)
      });
      const appended = $(content);
      const extant = this.rootElement.find(`[data-id="${config.id}"]`);
      if (extant.length) extant.replaceWith(appended);
      else this.rootElement.find("#transition-step-list").append(appended);
      this.addStepEventListeners(appended, config);
      this.resizeDialog();
      ColorPicker.install();
    }
    async getRenderedDialogTemplate() {
      return renderTemplate(`/modules/${"battle-transitions"}/templates/config/add-step.hbs`, {
        transitionTypes: CONFIG_HANDLERS.map((handler) => ({ key: handler.key, name: handler.name }))
      });
    }
    onAddStepDialogRender() {
      if (!this.addStepDialogElement) throw new InvalidElementError();
      this.addStepDialogElement.find("#add-step-form button[data-transition]").on("click", (e) => {
        e.preventDefault();
        const key = e.currentTarget.dataset.transition ?? "";
        void this.#addStepDialog?.close();
        const handler = CONFIG_HANDLERS.find((item) => item.key === key);
        if (!handler) throw new InvalidTransitionError(key);
        void this.configureStep(key, handler.defaultSettings);
      });
    }
    async addStepDialog() {
      const content = await this.getRenderedDialogTemplate();
      const dialog = new Dialog({
        title: localize("BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE"),
        content,
        render: () => {
          this.onAddStepDialogRender();
        },
        buttons: {
          cancel: {
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            icon: "<i class='fas fa-times'></i>"
          }
        }
      });
      this.#addStepDialog = dialog;
      dialog.render(true);
    }
    async addStepDialogV2() {
      const content = await this.getRenderedDialogTemplate();
      void foundry.applications.api.DialogV2.wait({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        window: { title: "BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE" },
        rejectClose: false,
        render: (e) => {
          this.#addStepDialog = e.target;
          this.onAddStepDialogRender();
        },
        content,
        buttons: [
          {
            label: "<i class='fas fa-times'></i> " + localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            action: "cancel"
          }
        ]
      }).then((action) => {
        return action === "cancel" ? null : action;
      });
    }
    async inject() {
      const navBar = this.rootElement.find("nav.sheet-tabs.tabs[data-group='main']");
      const link = document.createElement("a");
      link.classList.add("item");
      link.dataset.tab = this.tabName;
      const icon = document.createElement("i");
      icon.classList.add(...this.icon);
      link.appendChild(icon);
      link.innerHTML += " " + localize("BATTLETRANSITIONS.SCENECONFIG.TAB");
      navBar.append(link);
      const transitionConfig = this.#scene.getFlag("battle-transitions", this.configKey);
      const content = await renderTemplate(`/modules/${"battle-transitions"}/templates/scene-config.hbs`, transitionConfig);
      this.rootElement.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${this.tabName}">${content}</div>`);
      const steps = this.#scene.getFlag("battle-transitions", this.stepKey);
      if (Array.isArray(steps)) {
        for (const step of steps) {
          await this.addUpdateTransitionStep(step.type, step);
        }
      }
      this.addEventListeners();
    }
    constructor(dialog, scene) {
      this.#dialog = dialog;
      this.#scene = scene;
      void this.inject();
    }
  };

  // src/module.ts
  window.BattleTransitions = BattleTransitions_default;
  window.BattleTransition = TransitionChain;
  Hooks.once("canvasReady", () => {
    initializeCanvas();
    Hooks.callAll(CUSTOM_HOOKS.INITIALIZE);
  });
  Hooks.on("renderSceneConfig", (app) => {
    new ConfigurationHandler(app, app.object);
  });
  Hooks.once("init", async () => {
    registerHelpers();
    await registerTemplates();
  });
})();
//# sourceMappingURL=module.js.map
