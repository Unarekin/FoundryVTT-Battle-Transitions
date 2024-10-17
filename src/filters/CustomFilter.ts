export class CustomFilter<u extends { [x: string]: unknown }> extends PIXI.Filter {
  constructor(vertex?: string, fragment?: string, uniforms?: u) {
    super(vertex, fragment, uniforms);
  }
}