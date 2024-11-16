import frag from "./hueshift.frag";
import { CustomFilter } from '../CustomFilter';

type HueShiftUniforms = {
  shift: number;
}

export class HueShiftFilter extends CustomFilter<HueShiftUniforms> {
  constructor(shift: number) {
    super(undefined, frag, { shift });
  }
}