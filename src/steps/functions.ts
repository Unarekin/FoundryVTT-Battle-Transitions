import { customDialog } from '../dialogs';
import { InvalidTargetError } from '../errors/InvalidTargetError';
import { generateTargetTypeSelectOptions, generateTokenSelectOptions, generateTileSelectOptions, generateNoteSelectOptions, generateDrawingSelectOptions } from './selectOptions';
import { TargetedTransition } from './types';

// #region Functions (21)

export function addTargetSelectEventListeners(html: JQuery<HTMLElement>) {
  html.find("#targetType").on("input", () => {
    swapTargetType(html);
    unhighlightAll();
  });

  html.find(`[data-action="select-token"]`).on("click", e => {
    e.preventDefault();
    selectTokenHandler(html);
  });
  html.find(`[data-action="select-tile"]`).on("click", e => {
    e.preventDefault();
    selectTileHandler(html);
  });
  html.find(`[data-action="select-note"]`).on("click", e => {
    e.preventDefault();
    selectNoteHandler(html);
  });
  html.find(`[data-action="select-drawing"]`).on("click", e => {
    e.preventDefault();
    selectDrawingHandler(html);
  });

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

function closeHint(html: JQuery<HTMLElement>) {
  const hintId = getSelectHint(html);
  if (hintId) ui.notifications?.remove(hintId);
}

export function getObjectSize(item: unknown): [number, number] {
  if (item instanceof Token) return [item.mesh.width, item.mesh.height]
  else if (item instanceof TokenDocument && item.object instanceof Token) return [item.object.mesh.width, item.object.mesh.height];
  else if (item instanceof Tile) return [item.document.width, item.document.height];
  else if (item instanceof TileDocument) return [item.width, item.height];
  else if (item instanceof Note || item instanceof NoteDocument) return [0, 0];
  else if (item instanceof Drawing) return [item.width, item.height];
  else if (item instanceof DrawingDocument) return [item.object?.width ?? 0, item.object?.height ?? 0];
  else throw new InvalidTargetError(item);
}

function getSelectHint(html: JQuery<HTMLElement>): number {
  return parseInt(html.find("#select-data").data("select-hint") as string || "0");
}

function getSelectHook(html: JQuery<HTMLElement>): number {
  return parseInt(html.find("#select-data").data("select-hook") as string || "0");
}

function getSelectMode(html: JQuery<HTMLElement>): string {
  return html.find("#select-data").data("select-mode") as string || "";
}

export function getTargetFromForm(elem: JQuery<HTMLElement>) {
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

  return targetType === "point" ? [parseFloat(elem.find("#pointX").val() as string), parseFloat(elem.find("#pointY").val() as string)] as [number, number] : targetElem ? elem.find(`#${targetElem}`).val() as string : "";
}

export function highlightObject(uuid: string): void {
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

export function normalizeLocation(target: unknown): [number, number] {
  if (target instanceof Token || target instanceof Tile || target instanceof Note) {
    const { x, y } = target.getGlobalPosition();
    const [width, height] = getObjectSize(target);
    return normalizePoint(x + (width / 2), y + (height / 2));
  } else if (target instanceof TokenDocument || target instanceof TileDocument || target instanceof NoteDocument) {
    if (!target.object) throw new InvalidTargetError(target);
    const { x, y } = target.object.getGlobalPosition();
    const [width, height] = getObjectSize(target);
    return normalizePoint(x + (width / 2), y + (height / 2));
  } else if (target instanceof Drawing) {
    const { x, y } = target.getGlobalPosition();
    const [width, height] = getObjectSize(target);
    return normalizePoint(
      x + (width / 2),
      y + (height / 2)
    );
  } else if (target instanceof DrawingDocument) {
    if (!target.object) throw new InvalidTargetError(target);
    const { x, y } = target.object.getGlobalPosition();
    const [width, height] = getObjectSize(target);
    return normalizePoint(
      x + (width / 2),
      y + (height / 2)
    );
  } else if (target instanceof Actor) {
    if (!target.token) throw new InvalidTargetError(target);
    return normalizeLocation(target.token);
  }
  throw new InvalidTargetError(target);
}

export function normalizePoint(x: number, y: number): [number, number] {
  return [
    x / window.innerWidth,
    y / window.innerHeight
  ]
}

export function onTargetSelectDialogClosed(html: JQuery<HTMLElement>) {
  unhighlightAll();
  closeHint(html);
  removeHook(html);
}

function removeHook(html: JQuery<HTMLElement>) {
  const hookId = getSelectHook(html);
  const mode = getSelectMode(html);
  if (hookId) {
    switch (mode) {
      case "token":
        Hooks.off("controlToken", hookId)
        break;
      case "tile":
        Hooks.off("controlTile", hookId);
        break;
      case "drawing":
        Hooks.off("controlDrawing", hookId);
        break;
      case "note":
        Hooks.off("activateNote", hookId);
    }
  }
}

function selectDrawingHandler(html: JQuery<HTMLElement>) {
  const mode = getSelectMode(html);
  if (mode === "drawing") {
    setSelectMode("", html);
  } else {
    setSelectMode("drawing", html);
    const hook = Hooks.on("controlDrawing", (drawing: Drawing, controlled: boolean) => {
      if (controlled) {
        setSelectMode("", html);
        html.find("#selectedDrawing").val(drawing.document.uuid);
        setHookId(0, html);
      }
    });
    setHookId(hook, html);
  }
}

function selectNoteHandler(html: JQuery<HTMLElement>) {
  const mode = getSelectMode(html);
  if (mode === "note") {
    setSelectMode("", html);
  } else {
    setSelectMode("note", html);
    const hook = Hooks.on("activateNote", (note: Note) => {
      setSelectMode("", html);
      setHookId(0, html);
      html.find("#selectedNote").val(note.document.uuid);
    })
    setHookId(hook, html);
  }
}

function selectTileHandler(html: JQuery<HTMLElement>) {
  const mode = getSelectMode(html);
  if (mode === "tile") {
    setSelectMode("", html);
  } else {
    setSelectMode("tile", html);
    const hook = Hooks.on("controlTile", (tile: Tile, controlled: boolean) => {
      if (controlled) {
        setSelectMode("", html);
        setHookId(0, html);
        html.find("#selectedTile").val(tile.document.uuid);
      }
    });
    setHookId(hook, html);
  }
}

function selectTokenHandler(html: JQuery<HTMLElement>) {
  const mode = getSelectMode(html);
  if (mode === "token") {
    setSelectMode("", html);
  } else {
    setSelectMode("token", html);
    const hook = Hooks.on("controlToken", (token: Token, controlled: boolean) => {
      if (controlled) {
        setSelectMode("", html);
        setHookId(0, html);
        html.find("#selectedToken").val(token.document.uuid);
      }
    });
    setHookId(hook, html);
  }
}

function setHookId(id: number, html: JQuery<HTMLElement>) {
  html.find("#select-data").data("select-hook", id);
}

function setSelectMode(mode: string, html: JQuery<HTMLElement>) {
  removeHook(html);
  closeHint(html);
  const elem = html.find("#select-data");

  elem.data("select-mode", mode);

  if (mode && ui.notifications) {
    const id = ui.notifications.info(`BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.${mode.toUpperCase()}.SELECTHINT`, { console: false, permanent: true, localize: true });
    elem.data("select-hint", id);
  }

  html.find(`[data-action="select-token"] i,[data-action="select-tile"] i,[data-action="select-drawing"] i,[data-action="select-note"] i`).css("display", "none");
  html.find(`[data-action="select-${mode}"] i`).css("display", "block");
}

export function swapTargetType(html: JQuery<HTMLElement>) {
  const targetType = html.find("#targetType").val() as string ?? "";
  html.find("section[data-target-type]").css("display", "none");
  html.find(`section[data-target-type="${targetType}"]`).css("display", "block");
  unhighlightAll();
}

export function unhighlightAll() {
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

export async function validateTarget(config: TargetedTransition): Promise<[number, number] | string | Error> {
  try {
    if (typeof config.target === "string" && !config.target) {
      // Prompt
      const scene = canvas?.scene;
      const hasTokens = !!scene?.tokens.contents.length;
      const hasTiles = !!scene?.tiles.contents.length;
      const hasNotes = !!scene?.notes.contents.length;
      const hasDrawings = !!scene?.drawings.contents.length;
      const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/target-selector.hbs`, {
        ...config,
        oldScene: scene,
        targetTypeSelect: generateTargetTypeSelectOptions(scene || undefined),
        hasTokens,
        hasTiles,
        hasNotes,
        hasDrawings,
        tokenSelect: scene ? generateTokenSelectOptions(scene) : {},
        tileSelect: scene ? generateTileSelectOptions(scene) : {},
        noteSelect: scene ? generateNoteSelectOptions(scene) : {},
        drawingSelect: scene ? generateDrawingSelectOptions(scene) : {},
      });

      const elem = await customDialog("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETDIALOG.TITLE", content, {
        ok: {
          icon: `<i class="fas fa-check"></i>`,
          label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"
        },
        cancel: {
          icon: `<i class="fas fa-times"></i>`,
          label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL",
          callback: () => { throw new InvalidTargetError(undefined); }
        }
      },
        elem => {
          swapTargetType(elem);
          void addTargetSelectEventListeners(elem);
        }
      );

      const target = getTargetFromForm(elem);
      unhighlightAll();
      if (!target) throw new InvalidTargetError(target);
      return target;

    } else if (typeof config.target === "string") {
      const item = await fromUuid(config.target)
      if (!item) return new InvalidTargetError(config.target);
      const parsed = (typeof foundry.utils.parseUuid === "function" ? foundry.utils.parseUuid(config.target) : parseUuid(config.target));
      if (parsed.primaryType === Scene.documentName && parsed.primaryId !== canvas?.scene?.id) return new InvalidTargetError(config.target);
      if (parsed.type === Actor.documentName) {
        const actor = game.actors?.get(parsed.id);
        if (!actor) return new InvalidTargetError(config.target);
        if (!(actor.token instanceof Token || actor.token instanceof TokenDocument)) return new InvalidTargetError(config.target);
      }
    }
    return config.target;
  } catch (err) {
    return err as Error;
  }
}

// #endregion Functions (21)
