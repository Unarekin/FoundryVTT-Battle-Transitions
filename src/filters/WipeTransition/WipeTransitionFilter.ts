import { CustomFilter } from "../CustomFilter";
import frag from "./wipetransition.frag"

export type WipeTransitionUniforms = {
  percentage: number;
  masked_alpha: number;
  unmasked_alpha: number;
  horizontal: boolean;
  invert: boolean;
}

export class WipeTransitionFilter extends CustomFilter<WipeTransitionUniforms> {
  constructor(uniforms?: Partial<WipeTransitionUniforms>) {
    const actual: WipeTransitionUniforms = {
      percentage: 0,
      masked_alpha: 1,
      unmasked_alpha: 0,
      horizontal: false,
      invert: true,
      ...uniforms
    };
    super(undefined, frag, actual);
  }
}