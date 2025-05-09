import { customDialog } from "../dialogs";
import { InvalidTargetError } from "../errors";
import { generateTargetTypeSelectOptions } from "./selectOptions";
import { TargetedTransition, TargetType, TransitionConfiguration } from "./types";

// #region Functions (21)

function clearSelectMode(html: JQuery<HTMLElement>) {
  html.find("button[data-action] i.fa-spinner").css("display", "none");
  const mode = html.find("[data-select-mode]").data("select-mode") as TargetType || "0";
  const hook = parseInt(html.find("[data-select-hook]").data("select-hook") as string || "0") || 0;
  const hint = parseInt(html.find("[data-select-hint]").data("select-hint") as string || "0") || 0;
  // const sceneId = html.find("[data-select-scene]").data("select-scene") as string || "";

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

/**
 * Returns the effect target based on currently select options
 * @param {JQuery<HTMLElement>} html 
 * @returns - {@link TargetType}
 */
export function getTargetFromForm(html: JQuery<HTMLElement>) {
  const targetType = html.find(`[name="step.targetType"]`).val() as TargetType ?? "point";
  switch (targetType) {
    case "oldtoken":
      return html.find(`[name="step.selectedOldToken"]`).val() as string;
    case "newtoken":
      return html.find(`[name="step.selectedNewToken"]`).val() as string;
    case "oldtile":
      return html.find(`[name="step.selectedOldTile"]`).val() as string;
    case "newtile":
      return html.find(`[name="step.selectedNewTile"]`).val() as string;
    case "olddrawing":
      return html.find(`[name="step.selectedOldDrawing"]`).val() as string;
    case "newdrawing":
      return html.find(`[name="step.selectedNewDrawing"]`).val() as string;
    case "oldnote":
      return html.find(`[name="step.selectedOldNote"]`).val() as string;
    case "newnote":
      return html.find(`[name="step.selectedNewNote"]`).val() as string;
    case "prompt":
      return "";
    case "point":
      return [
        parseFloat(html.find(`[name="step.pointX"]`).val() as string),
        parseFloat(html.find(`[name="step.pointY"]`).val() as string)
      ] as [number, number]
  }
}

function getTargetType(html: JQuery<HTMLElement>): TargetType {
  return html.find(`[name="step.targetType"]`).val() as TargetType ?? "point";
}

function isNormalized(val: [number, number]): boolean {
  return val[0] >= 0 && val[0] <= 1 && val[1] >= 0 && val[1] <= 1;
}

function isNumberNumber(val: unknown): boolean {
  return Array.isArray(val) && val.length === 2 && typeof val[0] === "number" && typeof val[1] === "number"
}

export function normalizePoint(x: number, y: number): [number, number] {
  return [
    x / window.innerWidth,
    y / window.innerHeight
  ];
}

export function normalizePosition(target: unknown): [number, number] {
  if (target instanceof Token || target instanceof Tile || target instanceof Note) {
    const { x, y } = target.getGlobalPosition();
    const [width, height] = getObjectSize(target);
    return normalizePoint(x + (width / 2), y + (height / 2));
  } else if (target instanceof TokenDocument || target instanceof TileDocument || target instanceof NoteDocument) {
    if (!target.object) throw new InvalidTargetError(target);
    return normalizePosition(target.object);
  } else if (target instanceof Drawing) {
    const { x, y } = target.getGlobalPosition();
    const [width, height] = getObjectSize(target);
    return normalizePoint(
      x + (width / 2),
      y + (height / 2)
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

export function onTargetSelectDialogClosed(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
}

function selectNewDrawing(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-new-drawing'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "newdrawing");
  const hook = Hooks.on("controlDrawing", (drawing: Drawing, controlled: boolean) => {
    if (controlled) {
      clearSelectMode(html);
      html.find(`[name="step.selectedNewDrawing"]`).val(drawing.document.uuid);
    }
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.SELECTHINT");
}

function selectNewNote(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-new-note']").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "newnote");
  const hook = Hooks.on("activateNote", (note: Note) => {
    clearSelectMode(html);
    html.find(`[name="step.selectedNewNote"]`).val(note.document.uuid);
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.SElECTHINT");
}

function selectNewTile(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-new-tile'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "newtile");
  const hook = Hooks.on("controlTile", (tile: Tile, controlled: boolean) => {
    if (controlled) {
      clearSelectMode(html);
      html.find(`[name="step.selectedNewTile"]`).val(tile.document.uuid);
    }
  })
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.SELECTHINT");
}

function selectNewToken(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-new-token'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "newtoken");

  const hook = Hooks.on("controlToken", (token: Token, controlled: boolean) => {
    if (controlled) {
      clearSelectMode(html);
      html.find(`[name="step.selectedNewToken"]`).val(token.document?.uuid ?? "");
    }
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.SELECTHINT");
}

function selectOldDrawing(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-old-drawing'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "olddrawing");
  const hook = Hooks.on("controlDrawing", (drawing: Drawing, controlled: boolean) => {
    if (controlled) {
      clearSelectMode(html);
      html.find(`[name="step.selectedOldDrawing"]`).val(drawing.document.uuid);
    }
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.SELECTHINT");
}

function selectOldNote(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-old-note'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "oldnote");
  const hook = Hooks.on("activateNote", (note: Note) => {
    clearSelectMode(html);
    html.find(`[name="step.selectedOldNote"]`).val(note.document.uuid);
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.SELECTHINT");
}

function selectOldTile(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-old-tile'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "oldtile");

  const hook = Hooks.on("controlTile", (tile: Tile, controlled: boolean) => {
    if (controlled) {
      clearSelectMode(html);
      html.find(`[name="step.selectedOldTile"]`).val(tile.document.uuid);
    }
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.SELECTHINT");
}

function selectOldToken(html: JQuery<HTMLElement>) {
  clearSelectMode(html);
  html.find("[data-action='select-old-token'] i").css("display", "block");
  html.find("[data-select-mode]").data("select-mode", "oldtoken");

  const hook = Hooks.on("controlToken", (token: Token, controlled: boolean) => {
    if (controlled) {
      clearSelectMode(html);
      html.find(`[name="step.selectedOldToken"]`).val(token.document.uuid);
    }
  });
  html.find("[data-select-hook]").data("select-hook", hook);
  setSelectHint(html, "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.SELECTHINT");
}

function setSelectHint(html: JQuery<HTMLElement>, hint: string) {
  if (ui.notifications) {
    const id = ui.notifications.info(hint, { console: false, localize: true, permanent: true });
    html.find("[data-select-hint]").data("select-hint", id);
  }
}

export function setTargetSelectEventListeners(html: JQuery<HTMLElement>) {
  swapTargetSection(html);

  html.find(`[name="step.targetType"]`).on("input", () => { swapTargetSection(html); });
  html.find("button[data-action] i.fa-spinner").css("display", "none");
  html.find("button[data-action] i.fa-spinner").parent().on("click", e => {
    e.preventDefault();
    const target = $(e.currentTarget) as JQuery<HTMLButtonElement>;
    const action = target.data("action") as string || "";
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


const requiredFields = {
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
}


/**
 * Sets the correct HTML section for the current target type
 * @param {JQuery<HTMLElement>} html - JQuery<HTMLElement>
 */
function swapTargetSection(html: JQuery<HTMLElement>) {
  html.find(`section[data-target-type]`).css("display", "none");
  html.find("section[data-target-type] input, section[data-target-type] select").removeAttr("required");
  const targetType = getTargetType(html);
  html.find(`section[data-target-type="${targetType}"]`).css("display", "block");
  if (requiredFields[targetType]) {
    html.find(requiredFields[targetType]).attr("required", "true");
  }
}

export async function validateTarget(config: TransitionConfiguration & TargetedTransition, oldScene?: Scene, newScene?: Scene): Promise<[number, number] | string> {
  const { target } = config;
  // if it's a set of screen coordinates, it's fine.
  if (isNumberNumber(target) && isNormalized(target as [number, number])) return target as [number, number];

  if (typeof target === "string" && target) {
    // Non-empty string
    const item = await fromUuid(target);
    if (!item) throw new InvalidTargetError(target);

    const parsed = foundry.utils.parseUuid(target);
    // if it is not in a scene, we cannot focus it
    if (parsed.primaryType !== "Scene") throw new InvalidTargetError(target);

    if (oldScene && oldScene.id === parsed.primaryId) return target;
    if (newScene && newScene.id === parsed.primaryId) return target;

  } else if (typeof target === "string") {
    // Empty string, prompt
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/target-selector.hbs`, {
      ...generateTargetTypeSelectOptions(oldScene, newScene),
      pointX: 0.5,
      pointY: 0.5
    })
    const form = await customDialog("BATTLETRANSITIONS.SCENECONFIG.TARGETTYPE.DIALOG.TITLE", content, {
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
      html => { setTargetSelectEventListeners(html); }
    );
    return getTargetFromForm(form);
  }

  throw new InvalidTargetError(target);
}

// #endregion Functions (21)
