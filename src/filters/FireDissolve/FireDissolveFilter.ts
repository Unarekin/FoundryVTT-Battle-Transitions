import { CustomFilter } from "../CustomFilter";
import fragment from "./firedissolve.frag";

type FireDissolveUniforms = {
  integrity: number,
  burn_size: number,
  noise_texture: unknown,
  burn_texture: unknown
}

export class FireDissolveFilter extends CustomFilter<FireDissolveUniforms> {


  constructor(uniforms?: Partial<FireDissolveUniforms>) {

    const actualUniforms = {
      integrity: 1,
      burn_size: 1.3,
      noise_texture: undefined,
      burn_texture: undefined,
      ...uniforms
    };

    super(undefined, fragment, actualUniforms);
  }
}