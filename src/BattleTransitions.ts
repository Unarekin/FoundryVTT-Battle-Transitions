import { cleanupTransition, transitionTo } from './transitionUtils';
import { createColorTexture, logImage } from './utils';

import { filters } from './filters';


export default {
  transitionTo,
  logImage,
  createColorTexture,
  cleanupTransition,

  Filters: filters,

  Textures: {
    Black: createColorTexture("#000000"),
    White: createColorTexture("#FFFFFF"),
    Transparent: createColorTexture("#00000000"),

    fromColor: createColorTexture
  }
};