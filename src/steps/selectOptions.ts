import { localize } from "../utils";

// #region Functions (13)

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

export function generateBilinearDirectionSelectOptions(): { [x: string]: string } {
  return {
    "horizontal": "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
    "vertical": "BATTLETRANSITIONS.DIRECTIONS.VERTICAL",
    "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
    "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"
  }
}

export function generateClockDirectionSelectOptions(): { [x: string]: string } {
  return {
    "clockwise": "BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",
    "counterclockwise": "BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"
  }
}

export function generateDrawingSelectOptions(scene: Scene): { [x: string]: string } {
  return scene ? Object.fromEntries(scene.drawings.contents.map(drawing => [drawing.uuid, localize(`BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.SHAPES.${drawingType(drawing)}`)])) : {};
}

export function generateDualStyleSelectOptions(): { [x: string]: string } {
  return {
    "overlay": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.OVERLAY`,
    "scene": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.SCENE`,
    "both": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.BOTH`
  }
}

export function generateEasingSelectOptions(): { [x: string]: string } {
  return {
    "none": "BATTLETRANSITIONS.EASINGS.NONE",
    "power1.in": "BATTLETRANSITIONS.EASINGS.POWER1IN",
    "power1.out": "BATTLETRANSITIONS.EASINGS.POWER1OUT",
    "power1.inOut": "BATTLETRANSITIONS.EASINGS.POWER1INOUT",
    "power2.in": "BATTLETRANSITIONS.EASINGS.POWER2IN",
    "power2.out": "BATTLETRANSITIONS.EASINGS.POWER2OUT",
    "power2.inOut": "BATTLETRANSITIONS.EASINGS.POWER2INOUT",
    "power3.in": "BATTLETRANSITIONS.EASINGS.POWER3IN",
    "power3.out": "BATTLETRANSITIONS.EASINGS.POWER3OUT",
    "power3.inOut": "BATTLETRANSITIONS.EASINGS.POWER3INOUT",
    "power4.in": "BATTLETRANSITIONS.EASINGS.POWER4IN",
    "power4.out": "BATTLETRANSITIONS.EASINGS.POWER4OUT",
    "power4.inOut": "BATTLETRANSITIONS.EASINGS.POWER4INOUT",
    "back.in": "BATTLETRANSITIONS.EASINGS.BACKIN",
    "back.out": "BATTLETRANSITIONS.EASINGS.BACKOUT",
    "back.inOut": "BATTLETRANSITIONS.EASINGS.BACKINOUT",
    "bounce.in": "BATTLETRANSITIONS.EASINGS.BOUNCEIN",
    "bounce.out": "BATTLETRANSITIONS.EASINGS.BOUNCEOUT",
    "bounce.inOut": "BATTLETRANSITIONS.EASINGS.BOUNCEINOUT",
    "circ.in": "BATTLETRANSITIONS.EASINGS.CIRCIN",
    "circ.out": "BATTLETRANSITIONS.EASINGS.CIRCOUT",
    "circ.inOut": "BATTLETRANSITIONS.EASINGS.CIRCINOUT",
    "elastic.in": "BATTLETRANSITIONS.EASINGS.ELASTICIN",
    "elastic.out": "BATTLETRANSITIONS.EASINGS.ELASTICOUT",
    "elastic.inOut": "BATTLETRANSITIONS.EASINGS.ELASTICINOUT",
    "expo.in": "BATTLETRANSITIONS.EASINGS.EXPOIN",
    "expo.out": "BATTLETRANSITIONS.EASINGS.EXPOOUT",
    "expo.inOut": "BATTLETRANSITIONS.EASINGS.EXPOINOUT",
    "sine.in": "BATTLETRANSITIONS.EASINGS.SINEIN",
    "sine.out": "BATTLETRANSITIONS.EASINGS.SINEOUT",
    "sine.inOut": "BATTLETRANSITIONS.EASINGS.SINEINOUT",
    "steps": "BATTLETRANSITIONS.EASINGS.STEPS",
    "rough": "BATTLETRANSITIONS.EASINGS.ROUGH",
    "slow": "BATTLETRANSITIONS.EASINGS.SLOW",
    "expoScale": "BATTLETRANSITIONS.EASINGS.EXPOSCALE"
  }
}

export function generateFontSelectOptions(): { [x: string]: string } {
  return Object.fromEntries(FontConfig.getAvailableFonts().sort((a, b) => a.localeCompare(b)).map(font => [font, font]));
}

export function generateLinearDirectionSelectOptions(): { [x: string]: string } {
  return {
    "top": "BATTLETRANSITIONS.DIRECTIONS.TOP",
    "left": "BATTLETRANSITIONS.DIRECTIONS.LEFT",
    "right": "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
    "bottom": "BATTLETRANSITIONS.DIRECTIONS.BOTTOM",
    "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
    "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT",
    "bottomleft": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMLEFT",
    "bottomright": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMRIGHT"
  }
}

export function generateNoteSelectOptions(scene: Scene): { [x: string]: string } {
  return scene ? Object.fromEntries(scene.notes.contents.map(note => [note.uuid, note.entry?.name ?? ""])) : {};
}

export function generateRadialDirectionSelectOptions(): { [x: string]: string } {
  return {
    "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
    "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
  }
}

export function generateTargetTypeSelectOptions(oldScene?: Scene, newScene?: Scene) {

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
      ...(oldScene ? {} : { prompt: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.PROMPT.LABEL" }),
      ...(oldHasTokens ? { oldtoken: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {}),
      ...(oldHasTiles ? { oldtile: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {}),
      ...(oldHasNotes ? { oldnote: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {}),
      ...(oldHasDrawings ? { olddrawing: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.CURRENTSCENE.LABEL", { scene: oldScene.name }) } : {}),
      ...(newHasTokens ? { newtoken: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.NEWSCENE.LABEL", { scene: newScene.name }) } : {}),
      ...(newHasTiles ? { newtile: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.NEWSCENE.LABEL", { scene: newScene.name }) } : {}),
      ...(newHasNotes ? { newnote: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.NEWSCENE.LABEL", { scene: newScene.name }) } : {}),
      ...(newHasDrawings ? { newdrawing: localize("BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.NEWSCENE.LABEL", { scene: newScene.name }) } : {})
    },
    oldTokenSelect: oldScene ? generateTokenSelectOptions(oldScene) : {},
    oldTileSelect: oldScene ? generateTileSelectOptions(oldScene) : {},
    oldNoteSelect: oldScene ? generateNoteSelectOptions(oldScene) : {},
    oldDrawingSelect: oldScene ? generateDrawingSelectOptions(oldScene) : {},
    newTokenSelect: newScene ? generateTokenSelectOptions(newScene) : {},
    newTileSelect: newScene ? generateTileSelectOptions(newScene) : {},
    newNoteSelect: newScene ? generateNoteSelectOptions(newScene) : {},
    newDrawingSelect: newScene ? generateDrawingSelectOptions(newScene) : {},
    oldHasTokens, oldHasTiles, oldHasNotes, oldHasDrawings,
    newHasTokens, newHasTiles, newHasNotes, newHasDrawings
  }
}


export function generateTileSelectOptions(scene: Scene): { [x: string]: string } {
  return scene ? Object.fromEntries(scene.tiles.contents.map(tile => [tile.uuid, tile.texture.src as string])) : {};
}

export function generateTokenSelectOptions(scene: Scene): { [x: string]: string } {
  return scene ? Object.fromEntries(scene.tokens.contents.map(token => [token.uuid, token.name])) : {};
}

// #endregion Functions (13)

export function generateBackgroundTypeSelectOptions(): { [x: string]: string } {
  return {
    color: "BATTLETRANSITIONS.SCENECONFIG.COMMON.BACKGROUND.COLOR",
    image: "BATTLETRANSITIONS.SCENECONFIG.COMMON.BACKGROUND.IMAGE",
    overlay: "BATTLETRANSITIONS.SCENECONFIG.COMMON.BACKGROUND.OVERLAY"
  }
}