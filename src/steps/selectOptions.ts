import { localize, log } from "../utils"

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
  }
}

export function generateFontSelectOptions(): { [x: string]: string } {
  return Object.fromEntries(FontConfig.getAvailableFonts().map(font => [font, font]));
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

export function generateTargetTypeSelectOptions(scene?: Scene): { [x: string]: string } {
  const hasTokens = !!scene?.tokens.contents.length;
  const hasTiles = !!scene?.tiles.contents.length;
  const hasNotes = !!scene?.notes.contents.length;
  const hasDrawings = !!scene?.drawings.contents.length;


  return {
    point: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.POINT.LABEL",
    ...(scene ? {} : { prompt: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.PROMPT.LABEL" }),
    ...(hasTokens ? { token: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TOKEN.LABEL" } : {}),
    ...(hasTiles ? { tile: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.TILE.LABEL" } : {}),
    ...(hasNotes ? { note: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.NOTE.LABEL" } : {}),
    ...(hasDrawings ? { drawing: "BATTLETRANSITIONS.SCENECONFIG.COMMON.TARGETTYPE.DRAWING.LABEL" } : {}),
  }
}

export function generateTileSelectOptions(scene: Scene): { [x: string]: string } {
  return scene ? Object.fromEntries(scene.tiles.contents.map(tile => [tile.uuid, tile.texture.src as string])) : {};
}

export function generateTokenSelectOptions(scene: Scene): { [x: string]: string } {

  const opts = scene ? Object.fromEntries(scene.tokens.contents.map(token => [token.uuid, token.name])) : {};
  log("Token select:", opts);
  return opts;
}

// #endregion Functions (13)
