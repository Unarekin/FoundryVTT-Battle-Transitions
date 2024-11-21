import { InvalidTargetError } from "../errors";
import { ZoomFilter } from "../filters";
import { createColorTexture, generateEasingSelectOptions, localize, log, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ZoomConfiguration } from "./types";

// #region Classes (1)

export class ZoomStep extends TransitionStep<ZoomConfiguration> {
  // #region Properties (8)

  #screenLocation: [number, number] = [0.5, 0.5];

  public static DefaultSettings: ZoomConfiguration = {
    id: "",
    type: "zoom",
    duration: 1000,
    backgroundType: "color",
    bgSizingMode: "stretch",
    backgroundColor: "#00000000",
    version: "1.1.0",
    easing: "none",
    amount: 1,
    clampBounds: false,
    target: [0.5, 0.5]
  }

  public static category: string = "warp";
  public static hidden: boolean = false;
  public static icon: string = `<i class="fas fa-fw fa-magnifying-glass"></i>`
  public static key: string = "zoom";
  public static name: string = "ZOOM";
  public static template: string = "zoom-config";

  // #endregion Properties (8)

  // #region Public Static Methods (8)

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async RenderTemplate(config?: ZoomConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    let targetType: string = "point";
    if (config && typeof config.target === "string") {
      const parsed = foundry.utils.parseUuid ? foundry.utils.parseUuid(config.target) : parseUuid(config.target);
      if (Array.isArray(parsed.embedded)) targetType = parsed.embedded[0].toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      else targetType = ((parsed as any).type as string ?? "").toLowerCase()
    } else if (config && Array.isArray(config.target)) {
      targetType = "point";
    }

    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ZoomStep.template}.hbs`, {
      ...ZoomStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      oldScene,
      newScene,
      easingSelect: generateEasingSelectOptions(),
      targetType,
      targetTypeSelect: {
        point: "BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.POINT.LABEL",
        token: "BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.TOKEN.LABEL",
        tile: "BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.TILE.LABEL",
        note: "BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.NOTE.LABEL",
        drawing: "BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.DRAWING.LABEL"
      },
      tokenSelect: oldScene ? Object.fromEntries(oldScene.tokens.contents.map(token => [token.uuid, token.name])) : {},
      tileSelect: oldScene ? Object.fromEntries(oldScene.tiles.contents.map(tile => [tile.uuid, tile.texture.src])) : {},
      noteSelect: oldScene ? Object.fromEntries(oldScene.notes.contents.map(note => [note.uuid, note.entry?.name])) : {},
      drawingSelect: oldScene ? Object.fromEntries(oldScene.drawings.contents.map(drawing => [drawing.uuid, localize(`BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.DRAWING.SHAPES.${drawingType(drawing)}`)])) : {},
      pointX: Array.isArray(config?.target) ? config.target[0] : 0.5,
      pointY: Array.isArray(config?.target) ? config.target[1] : 0.5
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public static async addEventListeners(html: JQuery<HTMLElement>, config?: ZoomConfiguration) {
    swapTargetType(html);
    setBackgroundSelector(html);
    html.find("#targetType").on("input", () => {
      swapTargetType(html);
      unhighlightAll();
    });
    html.find("#clampBounds").on("change", () => { setBackgroundSelector(html); })
    html.find(`[data-action="select-token"]`).on("click", () => { selectTokenHandler(html); });
    html.find(`[data-action="select-tile"]`).on("click", () => { selectTileHandler(html); });
    html.find(`[data-action="select-note"]`).on("click", () => { selectNoteHandler(html); });
    html.find(`[data-action="select-drawing"]`).on("click", () => { selectDrawingHandler(html); });

    html.find("#selectedToken").on("input", () => {
      unhighlightAll();
      const val = html.find("#selectedToken").val() as string ?? "";
      if (val) void highlightObject(val);
    });

    html.find("#selectedTile").on("input", () => {
      unhighlightAll();
      const val = html.find("#selectedTile").val() as string ?? "";
      if (val) void highlightObject(val);
    });

    html.find("#selectedNote").on("input", () => {
      unhighlightAll();
      const val = html.find("#selectedNote").val() as string ?? "";
      if (val) void highlightObject(val);
    });

    html.find("#selectedDrawing").on("input", () => {
      unhighlightAll();
      const val = html.find("#selectedDrawing").val() as string ?? "";
      if (val) void highlightObject(val);
    })
  }

  //public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void { }
  public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>): void {
    const html = $(element);

    disableTileSelect(html);
    disableTokenSelect(html);
    disableNoteSelect(html);
    unhighlightAll();
  }

  public static from(config: ZoomConfiguration): ZoomStep
  public static from(form: HTMLFormElement): ZoomStep
  public static from(form: JQuery<HTMLFormElement>): ZoomStep
  public static from(arg: unknown): ZoomStep {
    if (arg instanceof HTMLFormElement) return ZoomStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLFormElement) return ZoomStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ZoomStep(arg as ZoomConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): ZoomStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    const targetType = elem.find("#targetType").val() as string ?? "";
    let targetElem: string = "";
    switch (targetType) {
      case "token":
        targetElem = "selectedToken";
        break;
      case "tile":
        targetElem = "selectedTile";
        break;
      case "note":
        targetElem = "selectedNote";
        break;
      case "drawing":
        targetElem = "selectedDrawing";
        break;
      case "point":
        break;
    }

    const target = targetType === "point" ? [parseFloat(elem.find("#pointX").val() as string), parseFloat(elem.find("#pointY").val() as string)] as [number, number] : targetElem ? elem.find(`#${targetElem}`).val() as string : "";

    if (!target) throw new InvalidTargetError(targetType);

    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "easing", "amount", "backgroundType", "backgroundColor", "clampBounds"),
      serializedTexture,
      target
    }

    log("Zoom step config:", config)

    return new ZoomStep(config);
  }

  // #endregion Public Static Methods (8)

  // #region Public Methods (3)

  public async execute(container: PIXI.Container,): Promise<void> {
    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...this.config
    };

    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new ZoomFilter(this.#screenLocation, config.duration ? 1 : config.amount, config.clampBounds, background.baseTexture);
    this.addFilter(container, filter);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (config.duration) await TweenMax.to(filter.uniforms, { amount: config.amount, duration: config.duration / 1000, ease: config.easing });
  }

  public async prepare(): Promise<void> {
    // Cache actual screen space location to which to zoom
    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...this.config
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const target = config.target as any;

    if (Array.isArray(target)) this.#screenLocation = target as [number, number];
    else if (typeof target === "string") this.#screenLocation = this.normalizeLocation(await fromUuid(target));
    else this.#screenLocation = this.normalizeLocation(target);
  }

  public async validate(): Promise<boolean | Error> {
    const config = {
      ...ZoomStep.DefaultSettings,
      ...this.config
    };

    if (typeof config.target === "string") {
      const item = await fromUuid(config.target);
      if (!item) return new InvalidTargetError(config.target);
      const parsed = (typeof foundry.utils.parseUuid === "function" ? foundry.utils.parseUuid(config.target) : parseUuid(config.target));
      // If it's embedded in a scene other than this one
      if (parsed.primaryType === Scene.documentName && parsed.primaryId !== canvas?.scene?.id) return new InvalidTargetError(config.target);
      // if it's an actor, locate its token
      if (parsed.type === Actor.documentName) {
        const actor = game.actors?.get(parsed.id);
        if (!actor) return new InvalidTargetError(config.target);
        if (!(actor.token instanceof Token || actor.token instanceof TokenDocument)) return new InvalidTargetError(config.target);
      }
    }

    return true;
  }

  // #endregion Public Methods (3)

  // #region Private Methods (3)

  private getObjectSize(item: unknown): [number, number] {
    if (item instanceof Token) return [item.mesh.width, item.mesh.height]
    else if (item instanceof TokenDocument && item.object instanceof Token) return [item.object.mesh.width, item.object.mesh.height];
    else if (item instanceof Tile) return [item.document.width, item.document.height];
    else if (item instanceof TileDocument) return [item.width, item.height];
    else if (item instanceof Note || item instanceof NoteDocument) return [0, 0];
    else if (item instanceof Drawing) return [item.width, item.height];
    else if (item instanceof DrawingDocument) return [item.object?.width ?? 0, item.object?.height ?? 0];
    else throw new InvalidTargetError(item);
  }

  private normalizeLocation(target: unknown): [number, number] {
    if (target instanceof Token || target instanceof Tile || target instanceof Note) {
      const { x, y } = target.getGlobalPosition();
      const [width, height] = this.getObjectSize(target);
      return this.normalizePoint(x + (width / 2), y + (height / 2));
    } else if (target instanceof TokenDocument || target instanceof TileDocument || target instanceof NoteDocument) {
      if (!target.object) throw new InvalidTargetError(target);
      const { x, y } = target.object.getGlobalPosition();
      const [width, height] = this.getObjectSize(target);
      return this.normalizePoint(x + (width / 2), y + (height / 2));
    } else if (target instanceof Drawing) {
      const { x, y } = target.getGlobalPosition();
      const [width, height] = this.getObjectSize(target);
      return this.normalizePoint(
        x + (width / 2),
        y + (height / 2)
      );
    } else if (target instanceof DrawingDocument) {
      if (!target.object) throw new InvalidTargetError(target);
      const { x, y } = target.object.getGlobalPosition();
      const [width, height] = this.getObjectSize(target);
      return this.normalizePoint(
        x + (width / 2),
        y + (height / 2)
      );
    } else if (target instanceof Actor) {
      if (!target.token) throw new InvalidTargetError(target);
      return this.normalizeLocation(target.token);
    }
    throw new InvalidTargetError(target);
  }

  private normalizePoint(x: number, y: number): [number, number] {
    return [
      x / window.innerWidth,
      y / window.innerHeight
    ]
  }

  // #endregion Private Methods (3)
}

// #endregion Classes (1)

// #region Functions (15)

function disableDrawingSelect(html: JQuery<HTMLElement>) {
  removeSelectHint();
  removeSelectHook("controlDrawing");

  SELECTING_DRAWING = false;
  html.find(`[data-action="select-drawing"] i`).css("display", "none");
}

function disableNoteSelect(html: JQuery<HTMLElement>) {
  removeSelectHint();
  removeSelectHook("activateNote");

  SELECTING_NOTE = false;
  html.find(`[data-action="select-note"] i`).css("display", "none");
}

function disableTileSelect(html: JQuery<HTMLElement>) {
  removeSelectHint();
  removeSelectHook("controlTile");

  SELECTING_TILE = false;
  html.find(`[data-action="select-tile"] i`).css("display", "none");
}

function disableTokenSelect(html: JQuery<HTMLElement>) {
  removeSelectHint();
  removeSelectHook("controlToken");

  SELECTING_TOKEN = false;
  html.find(`[data-action="select-token"] i`).css("display", "none");
}

function drawingType(drawing: DrawingDocument) {
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


function highlightObject(uuid: string): void {
  const parsed = (typeof foundry.utils.parseUuid === "function") ? foundry.utils.parseUuid(uuid) : parseUuid(uuid);

  // Not a document embedded in a scene, cannot highlight
  if (parsed.primaryType !== Scene.documentName) return;
  // Scene in which this object lies is not the current, cannot highlight
  if (game.scenes?.current?.id !== parsed.primaryId) return

  if (Array.isArray(parsed.embedded)) {
    switch (parsed.embedded[0]) {
      case Token.embeddedName: {
        const token = canvas?.scene?.tokens.get(parsed.embedded[1]);
        if (!token || !token.object) return;
        token.object.hover = true;
        void token.object.draw();
        break;
      }
      case Tile.embeddedName: {
        const tile = canvas?.scene?.tiles.get(parsed.embedded[1]);
        if (!tile || !tile.object) return;
        tile.object.hover = true;
        void tile.object.draw();
        break;
      }
      case Note.embeddedName: {
        const note = canvas?.scene?.notes.get(parsed.embedded[1]);
        if (!note || !note.object) return;
        note.object.hover = true;
        void note.object.draw();
        break;
      }
      case Drawing.embeddedName: {
        const drawing = canvas?.scene?.drawings.get(parsed.embedded[1]);
        if (!drawing || !drawing.object) return;
        drawing.object.hover = true;
        void drawing.object.draw();
        break;
      }
      default:
        throw new InvalidTargetError(uuid);
    }
  }
}

function removeSelectHint() {
  if (ui.notifications && SELECT_HINT_ID) {
    ui.notifications.remove(SELECT_HINT_ID);
    SELECT_HINT_ID = 0;
  }
}

function removeSelectHook(hook: string) {
  if (SELECT_HOOK_ID) {
    Hooks.off(hook, SELECT_HOOK_ID);
    SELECT_HOOK_ID = 0;
  }
}

function selectDrawingHandler(html: JQuery<HTMLElement>) {
  if (SELECTING_TILE) disableTileSelect(html);
  if (SELECTING_TOKEN) disableTokenSelect(html);
  if (SELECTING_NOTE) disableNoteSelect(html);

  if (SELECTING_DRAWING) {
    disableDrawingSelect(html);
  } else {
    SELECTING_DRAWING = true;
    if (ui.notifications) SELECT_HINT_ID = ui.notifications.info("BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.DRAWING.SELECTHINT", { console: false, permanent: true, localize: true });
    html.find(`[data-action="select-drawing"] i`).css("display", "block");
    SELECT_HOOK_ID = Hooks.on("controlDrawing", (drawing: Drawing, controlled: boolean) => {
      if (controlled) {
        disableDrawingSelect(html);
        html.find("#selectedDrawing").val(drawing.document.uuid);
      }
    })
  }
}

function selectNoteHandler(html: JQuery<HTMLElement>) {
  if (SELECTING_TILE) disableTileSelect(html);
  if (SELECTING_TOKEN) disableTokenSelect(html);
  if (SELECTING_DRAWING) disableDrawingSelect(html);

  if (SELECTING_NOTE) {
    disableNoteSelect(html);
  } else {
    SELECTING_NOTE = true;
    if (ui.notifications) SELECT_HINT_ID = ui.notifications.info("BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.NOTE.SELECTHINT", { console: false, permanent: true, localize: true });
    html.find(`[data-action="select-note"] i`).css("display", "block");
    SELECT_HOOK_ID = Hooks.on("activateNote", (note: Note) => {
      disableNoteSelect(html);
      html.find("#selectedNote").val(note.document.uuid);
    })
  }
}

function selectTileHandler(html: JQuery<HTMLElement>) {
  if (SELECTING_TOKEN) disableTokenSelect(html);
  if (SELECTING_NOTE) disableNoteSelect(html);
  if (SELECTING_DRAWING) disableDrawingSelect(html);

  if (SELECTING_TILE) {
    disableTileSelect(html);
  } else {
    SELECTING_TILE = true;
    if (ui.notifications) SELECT_HINT_ID = ui.notifications.info("BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.TILE.SELECTHINT", { console: false, permanent: true, localize: true });
    html.find(`[data-action="select-tile"] i`).css("display", "block");
    SELECT_HOOK_ID = Hooks.on("controlTile", (tile: Tile, controlled: boolean) => {
      if (controlled) {
        disableTileSelect(html);
        html.find("#selectedTile").val(tile.document.uuid);
      }
    })
  }
}

function selectTokenHandler(html: JQuery<HTMLElement>) {
  if (SELECTING_TILE) disableTileSelect(html);
  if (SELECTING_NOTE) disableNoteSelect(html);
  if (SELECTING_DRAWING) disableDrawingSelect(html);

  if (SELECTING_TOKEN) {
    disableTokenSelect(html);
  } else {
    SELECTING_TOKEN = true;
    if (ui.notifications) SELECT_HINT_ID = ui.notifications.info("BATTLETRANSITIONS.SCENECONFIG.ZOOM.TARGETTYPE.TOKEN.SELECTHINT", { console: false, permanent: true, localize: true });
    html.find(`[data-action="select-token"] i`).css("display", "block");
    SELECT_HOOK_ID = Hooks.on("controlToken", (token: Token, controlled: boolean) => {
      if (controlled) {
        disableTokenSelect(html);
        html.find("#selectedToken").val(token.document.uuid);
      }
    })
  }
}

function setBackgroundSelector(html: JQuery<HTMLElement>) {
  const clamp = html.find("#clampBounds").is(":checked");
  if (!clamp) html.find(".background-selector").css("display", "block");
  else html.find(".background-selector").css("display", "none");
}

function swapTargetType(html: JQuery<HTMLElement>) {
  const targetType = html.find("#targetType").val() as string ?? "";
  html.find("section[data-target-type]").css("display", "none");
  html.find(`section[data-target-type="${targetType}"]`).css("display", "block");
  unhighlightAll();
}

function unhighlightAll() {
  if (canvas?.scene) {
    const elems = [
      ...canvas.scene.tokens.contents,
      ...canvas.scene.tiles.contents,
      ...canvas.scene.notes.contents,
      ...canvas.scene.drawings.contents
    ]

    for (const elem of elems) {
      if (elem.object?.hover) {
        elem.object.hover = false;
        void elem.object.draw();
      }
    }
  }
}

// #endregion Functions (15)

// #region Variables (6)

let SELECTING_TOKEN: boolean = false;
let SELECT_HINT_ID: number = 0;
let SELECT_HOOK_ID: number = 0;
let SELECTING_NOTE: boolean = false;
let SELECTING_DRAWING: boolean = false;
let SELECTING_TILE: boolean = false;

// #endregion Variables (6)
