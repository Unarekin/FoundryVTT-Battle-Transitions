import frag from "./default.frag";
import vert from "./default.vert"

export class CustomFilter<u extends { [x: string]: unknown }> extends PIXI.Filter {
  constructor(vertex?: string, fragment?: string, uniforms?: u) {

    super(vertex || vert, fragment || frag, uniforms);

    // Enable GLSL 3.00
    if (!this.program.fragmentSrc.includes("#version 300 es"))
      this.program.fragmentSrc = "#version 300 es \n" + this.program.fragmentSrc;

    if (!this.program.vertexSrc.includes("#version 300 es"))
      this.program.vertexSrc = "#version 300 es\n" + this.program.vertexSrc;
  }
}
