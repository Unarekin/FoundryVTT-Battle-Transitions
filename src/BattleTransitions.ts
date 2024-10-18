import { transitionTo } from './transitionUtils';
import { createColorTexture, logImage } from './utils';

import { filters } from './filters';


export default {
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