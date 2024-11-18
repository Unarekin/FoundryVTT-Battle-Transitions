import frag from "./default.frag";
import vert from "./default.vert"

export class CustomFilter<u extends { [x: string]: unknown }> extends PIXI.Filter {
  constructor(vertex?: string, fragment?: string, uniforms?: u) {

    super(vertex || vert, fragment || frag, uniforms);

    // Enable GLSL 3.00
    if (!this.program.fragmentSrc.includes("#version 300 es"))
      this.program.fragmentSrc = this.#addGLESVersion(300, this.program.fragmentSrc);
    // this.program.fragmentSrc = "#version 300 es \n" + this.program.fragmentSrc;

    if (!this.program.vertexSrc.includes("#version 300 es"))
      this.program.vertexSrc = this.#addGLESVersion(300, this.program.vertexSrc);
    // this.program.vertexSrc = "#version 300 es\n" + this.program.vertexSrc;
  }

  #addGLESVersion(version: number, shader: string) {
    const lines = shader.split("\n");
    const versionIndex = lines.findIndex(line => line.startsWith("#version"));
    if (versionIndex !== -1) {
      const version = lines.splice(versionIndex, 1);
      lines.unshift(...version);
    } else {
      lines.unshift("#version 300 es");
    }

    return lines.join("\n");
  }
}
