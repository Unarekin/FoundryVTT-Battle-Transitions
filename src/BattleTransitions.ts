import { transitionTo } from './transitionUtils';
import { logImage } from './utils';
import { CustomFilter } from './filters';


const Filters: { [x: string]: typeof PIXI.Filter } = {
  CustomFilter
}


export default {
  transitionTo,
  logImage,

  Filters
};