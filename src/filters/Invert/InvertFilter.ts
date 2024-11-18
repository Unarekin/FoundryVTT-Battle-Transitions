import frag from "./invert.frag";
import { CustomFilter } from "../CustomFilter"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type InvertUniforms = {}

export class InvertFilter extends CustomFilter<InvertUniforms> {
  constructor() {
    super(undefined, frag, {});
  }
}